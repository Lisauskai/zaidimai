// Test Build 6 – Pagrindinis žaidimo ciklas (Game Loop):
// 1. KELIŲ UŽDUOČIŲ SERIJOS (CHAINED MATH BATTLES): Skrynia/Durys = 2–3 užduotys iš eilės, Bosas/Proto Žvaigždė = 4–5 užduotys iš eilės. Suklydus bent kartą – serija nutrūksta (-1 ❤️)!
// 2. EXCLUSIVE LOOT: Reti „Set“ daiktai pašalinti iš parduotuvės – jie iškrenta TIK iš Bosų (100% šansas) arba „Proto Žvaigždės“ (15% šansas)!
// 3. AUGINTINIŲ FIZIKOS TAISYMAS (BUG FIX): Kai atlekia priešo strėlė ir augintinio įgūdis paruoštas, augintinis šauna ugnies kamuolį/lazerį ir strėlė IŠTRINAMA dar ore!
// 4. LYGIŲ ĮVAIROVĖ: Batutai, Svyruojantys kirviai (Švytuoklės), Teleportacijos durys, Netikros sienos ir Krentantys stalaktitai!
// 5. 32 MATEMATIKOS ŠABLONAI (16 tipų 1 klasei ir 16 tipų 3 klasei): Laikrodžiai, Geometrinės figūros, Krokodilo nasrai (< > =), Picos trupmenos, Magiški 3x3 kvadratai ir kt.

import {
  saveSystem,
  BACKPACK_CAPACITY,
  DEFAULT_DAILY_TIME_LIMIT_SECONDS
} from './saveSystem.js';
import { audio } from './audio.js';
import { mathEngine } from './mathEngine.js';
import { Player } from './player.js';
import { WORLDS, generateLevel } from './levelGenerator.js';
import { particles } from './particles.js';
import {
  STAT_UPGRADES,
  getUpgradeCost,
  ITEM_SETS,
  GEAR_ITEMS,
  getItemSvgIcon,
  PET_ITEMS,
  getPetUpgradeCost,
  getSellPrice,
  hasItemInInventory,
  rollExclusiveSetDrop,
  rollLevelLootDrop,
  ACHIEVEMENTS,
  computePlayerBonuses
} from './shop.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const shopPreviewCanvas = document.getElementById('shop-preview-canvas');
const shopPreviewCtx = shopPreviewCanvas ? shopPreviewCanvas.getContext('2d') : null;

const mapHeroCanvas = document.getElementById('map-hero-canvas');

// UI Ekranai
const screenProfiles = document.getElementById('screen-profiles');
const modalTransfer = document.getElementById('modal-transfer');
const screenMap = document.getElementById('screen-map');
const screenShop = document.getElementById('screen-shop');
const modalMath = document.getElementById('modal-math');
const modalLoot = document.getElementById('modal-loot');
const modalLevelResult = document.getElementById('modal-level-result');
const modalTimeLimit = document.getElementById('modal-time-limit');
const gameHud = document.getElementById('game-hud');
const touchControls = document.getElementById('touch-controls');

const PARENT_PASSWORD = "bosas123";

let gameState = 'PROFILES';
let isWorldPaused = false;
let isTimeLimitPaused = false;
let returnToResultFromShop = false;
let selectedWorldId = 1;
let selectedShopTab = 'weapons';
let selectedInvFilter = 'all';

let selectedBackpackIndex = null;
let dragPayload = null;

let currentLevel = null;
let player = null;
let previewPlayer = null;
let cameraX = 0;

let levelSession = {
  coinsEarned: 0,
  crystalsEarned: 0,
  solvedCount: 0,
  mistakesInLevel: 0
};

let activeDuel = {
  encounter: null,
  question: null,
  chainCurrent: 0,
  chainTotal: 3,
  mistakesOnCurrent: 0,
  usingKeypad: false
};

const input = {
  left: false,
  right: false,
  jump: false,
  down: false,
  shoot: false
};

// ==================== INICIALIZACIJA ====================
function init() {
  registerServiceWorker();
  setupInputListeners();
  setupUIListeners();
  setupInventoryDragDropTargets();
  startPlaytimeTicker();
  renderNamedProfiles();
  requestAnimationFrame(gameLoop);
}

// ==================== TĖVŲ KONTROLĖ IR DIENOS LAIKO LIMITAS ====================
function formatMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function getRemainingPlaytimeSeconds(profile) {
  if (!profile) return DEFAULT_DAILY_TIME_LIMIT_SECONDS;
  saveSystem.ensureDailyPlaytimeFresh(profile);
  const limit = Number(profile.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS;
  const played = Number(profile.timePlayedTodaySeconds) || 0;
  return Math.max(0, limit - played);
}

function updatePlaytimeHud(profile) {
  const hudTimerEl = document.getElementById('hud-playtime');
  if (!hudTimerEl || !profile) return;

  const remaining = getRemainingPlaytimeSeconds(profile);
  hudTimerEl.textContent = `⏳ Liko: ${formatMMSS(remaining)}`;

  // Kai lieka mažiau nei 5 minutės (< 300 sekundžių), tekstas tampa raudonas ir pulsuoja
  if (remaining < 300) {
    hudTimerEl.classList.add('low-time');
  } else {
    hudTimerEl.classList.remove('low-time');
  }
}

function startPlaytimeTicker() {
  setInterval(() => {
    const profile = saveSystem.getActiveProfile();
    if (!profile) return;

    // Laikas skaičiuojamas TIK tada, kai žaidėjas realiai bėgioja lygyje arba sprendžia matematikos užduotį!
    const isActivelyPlayingLevel = gameState === 'PLAYING' && !isWorldPaused && !isTimeLimitPaused;
    const isSolvingMath = gameState === 'MATH_DUEL' && !isTimeLimitPaused;

    if (!isActivelyPlayingLevel && !isSolvingMath) {
      return;
    }

    saveSystem.ensureDailyPlaytimeFresh(profile);
    profile.timePlayedTodaySeconds = (Number(profile.timePlayedTodaySeconds) || 0) + 1;
    saveSystem.saveGlobalTimeFromProfile(profile);
    saveSystem.saveAll();

    updatePlaytimeHud(profile);

    const limit = Number(profile.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS;
    if (profile.timePlayedTodaySeconds >= limit) {
      openTimeLimitModal(true);
    }
  }, 1000);
}

function openTimeLimitModal(timeExpired = true) {
  const profile = saveSystem.getActiveProfile();
  if (!profile || !modalTimeLimit) return;

  // Akimirksniu sustabdome žaidimą (globali pauzė)
  isTimeLimitPaused = true;
  isWorldPaused = true;
  input.left = false;
  input.right = false;
  input.jump = false;
  input.down = false;
  input.shoot = false;

  const remaining = getRemainingPlaytimeSeconds(profile);
  const isZero = timeExpired || remaining <= 0;

  const titleEl = document.getElementById('time-limit-title');
  const subEl = document.getElementById('time-limit-subtitle');
  const resumeBtn = document.getElementById('btn-time-resume');
  const passInput = document.getElementById('parent-password-input');
  const feedbackEl = document.getElementById('parent-password-feedback');

  if (passInput) passInput.value = '';
  if (feedbackEl) {
    feedbackEl.classList.add('hidden');
    feedbackEl.textContent = '';
  }

  if (isZero) {
    audio.brainStarFail();
    if (titleEl) {
      titleEl.textContent = '⏳ Šios dienos žaidimo laikas baigėsi! Pailsėkime akis.';
    }
    if (subEl) {
      subEl.textContent =
        'Šiandien jau puikiai pasportavai su skaičiais! Visas tavo herojaus auksas, kristalai ir daiktai yra saugiai išsaugoti.';
    }
    if (resumeBtn) {
      resumeBtn.classList.add('hidden');
    }
  } else {
    if (titleEl) {
      titleEl.textContent = `⏳ Dienos žaidimo laikas (Liko: ${formatMMSS(remaining)})`;
    }
    if (subEl) {
      subEl.textContent =
        'Žaidimas sustabdytas. Gali grįžti į žaidimą, išeiti į meniu arba tėvai gali pratęsti šiandienos laiką.';
    }
    if (resumeBtn) {
      resumeBtn.classList.remove('hidden');
    }
  }

  modalTimeLimit.classList.remove('hidden');
}

function closeTimeLimitModalAndResume() {
  if (!modalTimeLimit) return;
  modalTimeLimit.classList.add('hidden');
  isTimeLimitPaused = false;

  if (gameState === 'PLAYING') {
    if (player) player.invincibleTimer = Math.max(player.invincibleTimer || 0, 90);
    isWorldPaused = false;
  } else if (gameState === 'MATH_DUEL') {
    // Matematikos dvikovos metu žaidimo pasaulis lieka saugiai sustabdytas
    isWorldPaused = true;
  }
  updateHud();
}

function handleParentPasswordExtend() {
  const profile = saveSystem.getActiveProfile();
  const passInput = document.getElementById('parent-password-input');
  const feedbackEl = document.getElementById('parent-password-feedback');
  if (!profile || !passInput || !feedbackEl) return;

  const entered = passInput.value.trim();
  if (entered === PARENT_PASSWORD) {
    saveSystem.ensureDailyPlaytimeFresh(profile);
    const currentLimit = Number(profile.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS;
    const currentPlayed = Number(profile.timePlayedTodaySeconds) || 0;
    // Pridedame +600 sekundžių (10 minučių) nuo dabartinio limito (arba nuo išžaisto laiko, jei jis viršijo limitą)
    profile.dailyTimeLimitSeconds = Math.max(currentLimit, currentPlayed) + 600;
    saveSystem.saveGlobalTimeFromProfile(profile);
    saveSystem.saveAll();

    audio.levelWin();
    passInput.value = '';
    feedbackEl.classList.add('hidden');

    closeTimeLimitModalAndResume();
  } else {
    audio.wrong();
    feedbackEl.textContent = '❌ Neteisingas tėvų slaptažodis!';
    feedbackEl.className = 'parent-feedback error';
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ==================== VALDYMAS ====================
function setupInputListeners() {
  window.addEventListener('keydown', (e) => {
    if (gameState === 'PLAYING' && !isWorldPaused) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        input.down = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        input.jump = true;
      }
      if (e.code === 'KeyF' || e.code === 'KeyZ' || e.code === 'Enter') {
        e.preventDefault();
        triggerPlayerAttack();
      }
      // 4 PUNKTAS (Test Build 8): Lygio metu Inventoriaus ir Kalvės atidarymas uždraustas!
    } else if (gameState === 'MATH_DUEL' && activeDuel.usingKeypad) {
      if (e.key >= '0' && e.key <= '9') {
        appendKeypadDigit(e.key);
      } else if (e.key === 'Backspace') {
        clearKeypadDigit();
      } else if (e.key === 'Enter') {
        submitKeypadAnswer();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') input.down = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') input.jump = false;
  });

  const bindTouch = (id, key) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const start = (e) => { e.preventDefault(); input[key] = true; };
    const end = (e) => { e.preventDefault(); input[key] = false; };
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', end, { passive: false });
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);
  };

  bindTouch('touch-left', 'left');
  bindTouch('touch-down', 'down');
  bindTouch('touch-right', 'right');
  bindTouch('touch-jump', 'jump');

  const shootBtn = document.getElementById('touch-shoot');
  if (shootBtn) {
    const onAttack = (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING' && !isWorldPaused) {
        triggerPlayerAttack();
      }
    };
    shootBtn.addEventListener('touchstart', onAttack, { passive: false });
    shootBtn.addEventListener('mousedown', onAttack);
  }
}

function triggerPlayerAttack() {
  if (!player || !currentLevel || isWorldPaused || gameState !== 'PLAYING' || inSecretBonusRoom) return;

  if (player.bonuses.isBoomerang) {
    if (!Array.isArray(currentLevel.playerBoomerangs)) currentLevel.playerBoomerangs = [];
    const bm = player.tryThrowBoomerang(currentLevel.playerBoomerangs.length);
    if (bm) {
      currentLevel.playerBoomerangs.push(bm);
      updateHud();
    }
    return;
  }

  if (player.bonuses.isRanged) {
    if (!Array.isArray(currentLevel.playerArrows)) currentLevel.playerArrows = [];
    const arrow = player.tryShootArrow();
    if (arrow) {
      currentLevel.playerArrows.push(arrow);
      updateHud();
    }
    return;
  }

  const hitbox = player.tryMeleeSlash();
  if (!hitbox) return;

  const profile = saveSystem.getActiveProfile();

  for (const en of currentLevel.enemies) {
    if (!en.alive) continue;
    if (rectsOverlap(hitbox, en)) {
      applyDamageToEnemy(en, hitbox.damage, '⚔️', profile);
    }
  }

  for (const enc of currentLevel.mathEncounters) {
    if (enc.resolved || enc.type !== 'boss') continue;
    if (rectsOverlap(hitbox, enc)) {
      applyRealtimeDamageToBoss(enc, hitbox.damage, '⚔️', profile);
    }
  }

  updateHud();
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function applyDamageToEnemy(en, damage, iconPrefix, profile) {
  if (typeof en.hp !== 'number') en.hp = 1;
  en.hp = Math.max(0, en.hp - damage);
  en.hitFlashTimer = 14;

  particles.addFloatingText(
    en.x + en.w / 2,
    en.y - 12,
    `-${damage} HP`,
    '#ef4444',
    20
  );
  particles.emit(en.x + en.w / 2, en.y + en.h / 2, 10, {
    colors: ['#ef4444', '#fde047', '#ffffff']
  });

  if (en.hp <= 0) {
    en.alive = false;
    const isElite = en.kind === 'elite_knight';
    const reward = (isElite ? 22 : 8) + currentLevel.levelId * 2;
    profile.coins += reward;
    profile.stats.enemiesStomped++;
    levelSession.coinsEarned += reward;
    audio.stomp();
    particles.emitCoinSparkle(en.x + en.w / 2, en.y + en.h / 2);
    particles.addFloatingText(
      en.x + en.w / 2,
      en.y - 30,
      `${iconPrefix} +${reward} 🪙`,
      '#fde047',
      18
    );
    saveSystem.saveAll();
  } else {
    audio.enemyHit();
    const pushDir = player && player.x < en.x ? 1 : -1;
    en.x = Math.max(en.minX || 20, Math.min(en.maxX || currentLevel.width - 60, en.x + pushDir * 18));
  }
}

function applyRealtimeDamageToBoss(bossEnc, damage, iconPrefix, profile) {
  bossEnc.hp = Math.max(0, bossEnc.hp - damage);
  bossEnc.hitFlashTimer = 14;

  particles.addFloatingText(
    bossEnc.x + bossEnc.w / 2,
    bossEnc.y - 16,
    `${iconPrefix} -${damage} HP!`,
    '#ef4444',
    22
  );
  particles.emit(bossEnc.x + bossEnc.w / 2, bossEnc.y + bossEnc.h / 2, 14, {
    colors: ['#f43f5e', '#fde047', '#ffffff']
  });

  if (bossEnc.hp <= 0) {
    bossEnc.resolved = true;
    profile.stats.bossesDefeated++;
    const comboMult = getComboMultiplier(profile.stats.currentStreak || 1);
    const goldEarned = Math.round(bossEnc.rewardCoins * player.bonuses.mathGoldMult * comboMult);
    profile.coins += goldEarned;
    levelSession.coinsEarned += goldEarned;
    if (bossEnc.rewardCrystals > 0) {
      profile.crystals += bossEnc.rewardCrystals;
      levelSession.crystalsEarned += bossEnc.rewardCrystals;
    }
    audio.levelWin();
    particles.emitCoinSparkle(bossEnc.x + bossEnc.w / 2, bossEnc.y + bossEnc.h / 2);
    particles.addFloatingText(
      bossEnc.x + bossEnc.w / 2,
      bossEnc.y - 36,
      `👑 BOSAS NUGALĖTAS! +${goldEarned} 🪙 +${bossEnc.rewardCrystals} 💎`,
      '#fde047',
      22
    );
    saveSystem.saveAll();
    // 100% šansas gauti ekskliuzyvinę Seto dalį už Boso nugalėjimą!
    awardBossExclusiveSetLoot(profile, bossEnc.name);
  } else {
    audio.enemyHit();
  }
}

function drawHeroOnMiniCanvas(targetCanvas, profile) {
  if (!targetCanvas || !profile) return;
  const c = targetCanvas.getContext('2d');
  c.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

  c.fillStyle = '#1e293b';
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(targetCanvas.width / 2, targetCanvas.height - 10, 26, 6, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();

  const tempHero = new Player(profile);
  tempHero.x = Math.round(targetCanvas.width / 2 - 20);
  tempHero.y = Math.round(targetCanvas.height - 66);
  tempHero.draw(c, 0, false);
}

// ==================== 1. PROFILIŲ EKRANAS ====================
function renderNamedProfiles() {
  saveSystem.loadAll();
  const container = document.getElementById('named-profiles-grid');
  container.innerHTML = '';

  saveSystem.slots.forEach((profile, idx) => {
    const isLinas = idx === 0;
    const displayTitle = isLinas ? 'Linas (1 Klasė)' : 'Lukas (3 Klasė)';
    const gradeSubtitle = isLinas
      ? '🌱 1 Klasė: 16 užduočių tipų (figūros, laikrodis, krokodilo nasrai < > =, svarstyklės, pinigai)'
      : '⚔️ 3 Klasė: 16 užduočių tipų (picos trupmenos, laiko skirtumai, metrai/gramai, 3×3 magiški kvadratai)';

    const progressPct = Math.round((Object.keys(profile.completedLevels || {}).length / 50) * 100);
    const bonuses = computePlayerBonuses(profile);
    const bpCount = (profile.backpack || []).length;

    const card = document.createElement('div');
    card.className = 'hero-profile-card';

    card.innerHTML = `
      <div class="hero-card-top">
        <canvas width="96" height="96" class="profile-hero-canvas" id="profile-canvas-${idx}"></canvas>
        <div class="hero-card-info">
          <h2>👑 ${displayTitle}</h2>
          <div class="fixed-grade-badge">${isLinas ? 'Užfiksuota: 1 Klasė' : 'Užfiksuota: 3 Klasė'}</div>
          <p class="subtitle" style="margin-top:6px">${gradeSubtitle}</p>
        </div>
      </div>

      <div class="slot-stats">
        <span>🗺️ Lygis: <strong>${profile.unlockedLevel} / 50</strong> (${progressPct}%)</span>
        <span>❤️ <strong>${bonuses.maxHearts}</strong> | ⚔️ <strong>${bonuses.weaponDamage} DMG</strong></span>
        <span>🪙 <strong>${profile.coins}</strong> aukso</span>
        <span>💎 <strong>${profile.crystals}</strong> krist.</span>
        <span>🎒 Kuprinė: <strong>${bpCount} / ${BACKPACK_CAPACITY}</strong></span>
      </div>

      <div class="slot-actions">
        <button class="primary-btn" style="flex:1;font-size:1.1rem;padding:13px" data-play="${idx}">
          🚀 ŽAISTI – ${displayTitle.toUpperCase()}
        </button>
        <button class="danger-btn" title="Išvalyti šio herojaus progresą" data-reset="${idx}">🔄</button>
      </div>
    `;

    container.appendChild(card);

    const miniCanvas = card.querySelector(`#profile-canvas-${idx}`);
    drawHeroOnMiniCanvas(miniCanvas, profile);
  });

  container.querySelectorAll('[data-play]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.buy();
      const slot = Number(btn.dataset.play);
      saveSystem.selectSlot(slot);
      openWorldMap();
    });
  });

  container.querySelectorAll('[data-reset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.click();
      const slot = Number(btn.dataset.reset);
      const p = saveSystem.slots[slot];
      if (p && confirm(`Ar tikrai nori iš naujo pradėti herojaus „${p.name} (${p.grade} Klasė)“ progresą?`)) {
        saveSystem.resetSlot(slot);
        renderNamedProfiles();
      }
    });
  });
}

// ==================== 2. PASAULIŲ ŽEMĖLAPIS IR PROGRESIJA ====================
function isWorldUnlocked(profile, worldId) {
  if (!profile || worldId <= 1) return true;
  const prevWorldBossLevelId = (worldId - 1) * 10;
  return Boolean(
    (profile.completedLevels && profile.completedLevels[prevWorldBossLevelId]) ||
    profile.unlockedLevel > prevWorldBossLevelId
  );
}

function openWorldMap() {
  const profile = saveSystem.getActiveProfile();
  if (!profile) return;

  returnToResultFromShop = false;
  isWorldPaused = true;
  gameState = 'MAP';
  hideAllScreens();
  screenMap.classList.remove('hidden');

  const displayTitle = profile.slotIndex === 0 ? 'Linas (1 Klasė)' : 'Lukas (3 Klasė)';
  document.getElementById('map-hero-name').textContent = displayTitle;
  document.getElementById('map-coins').textContent = profile.coins;
  document.getElementById('map-crystals').textContent = profile.crystals;

  drawHeroOnMiniCanvas(mapHeroCanvas, profile);

  const solvedToday = profile.dailyChallenge.solvedToday || 0;
  document.getElementById('daily-progress-text').textContent = `(${Math.min(15, solvedToday)} / 15)`;
  const claimBtn = document.getElementById('btn-claim-daily');
  if (profile.dailyChallenge.claimed) {
    claimBtn.textContent = '✅ Atsiimta šiandien!';
    claimBtn.disabled = true;
  } else if (solvedToday >= 15) {
    claimBtn.textContent = '🎁 Atsiimti +150 🪙 ir +3 💎!';
    claimBtn.disabled = false;
  } else {
    claimBtn.textContent = '🎁 +150 🪙 ir +3 💎';
    claimBtn.disabled = true;
  }

  let highestUnlockedWorld = 1;
  for (let wId = 1; wId <= 5; wId++) {
    if (isWorldUnlocked(profile, wId)) {
      highestUnlockedWorld = wId;
    }
  }
  selectedWorldId = highestUnlockedWorld;
  renderWorldTabs();
  renderWorldLevels();

  // Jei globalus dienos laikas jau baigėsi (pvz. žaidėjas išnaudojo laiką Lenktynėse), iškart parodome langą!
  if (getRemainingPlaytimeSeconds(profile) <= 0) {
    openTimeLimitModal(true);
  }
}

function renderWorldTabs() {
  const profile = saveSystem.getActiveProfile();
  const tabsEl = document.getElementById('world-tabs');
  tabsEl.innerHTML = '';

  WORLDS.forEach((w) => {
    const unlocked = isWorldUnlocked(profile, w.id);
    const btn = document.createElement('button');
    btn.className = `world-tab-btn ${w.id === selectedWorldId ? 'active' : ''} ${!unlocked ? 'locked' : ''}`;
    btn.innerHTML = unlocked
      ? `${w.icon} ${w.id}. ${w.name}`
      : `🔒 ${w.id}. ${w.name}`;
    if (!unlocked) {
      const prevWorld = WORLDS.find((pw) => pw.id === w.id - 1);
      btn.title = `Užrakinta! Pirma nugalėk ${(w.id - 1) * 10}-ojo lygio Bosą (${prevWorld ? prevWorld.bossName : 'Bosą'})!`;
      btn.style.opacity = '0.55';
    }
    btn.addEventListener('click', () => {
      if (!unlocked) {
        audio.wrong();
        const prevWorld = WORLDS.find((pw) => pw.id === w.id - 1);
        alert(
          `🔒 „${w.id}. ${w.name}“ dar užrakintas!\n\nKad atrakintum šį pasaulį, pirma įveik ${w.id - 1}-ojo pasaulio 10-ojo lygio Bosą: ${prevWorld ? `${prevWorld.bossIcon} ${prevWorld.bossName}` : 'Bosą'}!`
        );
        return;
      }
      audio.click();
      selectedWorldId = w.id;
      renderWorldTabs();
      renderWorldLevels();
    });
    tabsEl.appendChild(btn);
  });
}

function renderWorldLevels() {
  const profile = saveSystem.getActiveProfile();
  const world = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];

  document.getElementById('world-title').textContent = `${world.icon} ${world.id} Pasaulis: ${world.name}`;
  document.getElementById('world-subtitle').textContent = world.mechanicBadge
    ? `${world.subtitle} • [${world.mechanicBadge}]`
    : world.subtitle;

  const grid = document.getElementById('levels-grid');
  grid.innerHTML = '';

  const startLevel = (world.id - 1) * 10 + 1;
  for (let i = 0; i < 10; i++) {
    const lvlId = startLevel + i;
    const isWorldFinalBoss = (i + 1) === 10;
    const isMidBoss = (i + 1) === 5;
    const isBoss = isMidBoss || isWorldFinalBoss;
    const unlocked = isWorldUnlocked(profile, world.id) && lvlId <= profile.unlockedLevel;
    const completed = profile.completedLevels[lvlId];

    const btn = document.createElement('button');
    btn.className = `level-node ${isBoss ? 'boss-node' : ''} ${!unlocked ? 'locked' : ''}`;
    btn.disabled = !unlocked;

    const starsStr = completed
      ? '⭐'.repeat(completed.stars) + '☆'.repeat(3 - completed.stars)
      : unlocked ? '▶️ Žaisti' : '🔒 Užrakinta';

    const bossSubtitle = isWorldFinalBoss
      ? `👑 ${world.bossName} (Atrakina ${world.id < 5 ? `${world.id + 1} pasaulį` : 'Pergalę'}!)`
      : isMidBoss
        ? '⚔️ Mini-Bosas (100% Set Drop!)'
        : `${i + 1}-oji stotelė`;

    btn.innerHTML = `
      <span class="level-num">${isBoss ? `${world.bossIcon} ${lvlId}` : `Lygis ${lvlId}`}</span>
      <small>${bossSubtitle}</small>
      <div class="level-stars">${starsStr}</div>
    `;

    btn.addEventListener('click', () => {
      audio.click();
      startLevelPlay(lvlId);
    });

    grid.appendChild(btn);
  }
}

// ==================== 3. TIKRAS INVENTORIUS SU DRAG & DROP IR KALVĖ ====================
// 4 PUNKTAS (Test Build 8): Inventorių, Kalvę ir Augintinius galima atidaryti TIK Pasaulio Žemėlapyje arba Lygio Pabaigos ekrane!
function openShop(fromResultScreen = false) {
  if (gameState === 'PLAYING') return; // Griežtai uždrausta atidaryti lygio bėgimo metu!
  const profile = saveSystem.getActiveProfile();
  if (!profile) return;

  returnToResultFromShop = !!fromResultScreen;
  isWorldPaused = true;
  gameState = 'SHOP';
  selectedBackpackIndex = null;
  hideAllScreens();
  screenShop.classList.remove('hidden');

  const closeBtn = document.getElementById('btn-close-shop');
  if (closeBtn) {
    closeBtn.textContent = returnToResultFromShop ? '⬅️ Grįžti į lygio suvestinę' : '⬅️ Grįžti į žemėlapį';
  }

  previewPlayer = new Player(profile);
  previewPlayer.x = 52;
  previewPlayer.y = 62;

  renderCustomizerBar();
  renderInventoryDashboard();
  renderShop();
}

function addItemToBackpack(profile, itemId) {
  if (!profile.backpack) profile.backpack = [];
  // Neleidžiame dublikatų kuprinėje – ten saugomi tik unikalūs daiktai!
  if (hasItemInInventory(profile, itemId)) {
    return false;
  }
  if (profile.backpack.length >= BACKPACK_CAPACITY) {
    return false;
  }
  profile.backpack.push(itemId);
  if (!profile.ownedGear.includes(itemId)) {
    profile.ownedGear.push(itemId);
  }
  return true;
}

function equipFromBackpackIndex(bpIndex, targetSlot = null) {
  const profile = saveSystem.getActiveProfile();
  if (!profile || bpIndex === null || bpIndex < 0 || bpIndex >= profile.backpack.length) return false;

  const itemId = profile.backpack[bpIndex];
  const item = GEAR_ITEMS.find((g) => g.id === itemId);
  if (!item) return false;

  if (targetSlot && targetSlot !== item.slot) {
    audio.wrong();
    return false;
  }

  const slot = item.slot;
  const previouslyEquippedId = profile.equippedGear[slot];

  profile.equippedGear[slot] = item.id;

  if (previouslyEquippedId && !previouslyEquippedId.endsWith('_none')) {
    profile.backpack[bpIndex] = previouslyEquippedId;
  } else {
    profile.backpack.splice(bpIndex, 1);
  }

  selectedBackpackIndex = null;
  saveSystem.saveAll();
  audio.buy();
  syncLivePlayersAfterInventoryChange();
  renderInventoryDashboard();
  renderShop();
  return true;
}

function unequipSlotToBackpack(slot) {
  const profile = saveSystem.getActiveProfile();
  if (!profile) return false;

  const currentId = profile.equippedGear[slot];
  if (!currentId || currentId.endsWith('_none')) return false;

  if (profile.backpack.length >= BACKPACK_CAPACITY) {
    alert('Kuprinė pilna (15/15)! Pirma parduok nereikalingą daiktą kalviui.');
    return false;
  }

  profile.equippedGear[slot] = `${slot}_none`;
  profile.backpack.push(currentId);

  selectedBackpackIndex = null;
  saveSystem.saveAll();
  audio.click();
  syncLivePlayersAfterInventoryChange();
  renderInventoryDashboard();
  renderShop();
  return true;
}

function sellBackpackItemAtIndex(bpIndex) {
  const profile = saveSystem.getActiveProfile();
  if (!profile || bpIndex === null || bpIndex < 0 || bpIndex >= profile.backpack.length) return false;

  const itemId = profile.backpack[bpIndex];
  const item = GEAR_ITEMS.find((g) => g.id === itemId);
  if (!item) return false;

  const sellCoins = getSellPrice(item);
  profile.backpack.splice(bpIndex, 1);
  profile.coins += sellCoins;

  selectedBackpackIndex = null;
  saveSystem.saveAll();
  audio.sellItem();

  const infoEl = document.getElementById('selected-item-info');
  if (infoEl) {
    infoEl.innerHTML = `🔨 Kalvis nupirko <strong>„${item.name}“</strong> už <strong style="color:#fde047">+${sellCoins} 🪙</strong>!`;
  }

  renderInventoryDashboard();
  renderShop();
  return true;
}

function swapBackpackSlots(idxA, idxB) {
  const profile = saveSystem.getActiveProfile();
  if (!profile || idxA === idxB) return;
  if (idxA < 0 || idxA >= profile.backpack.length) return;
  if (idxB < 0 || idxB >= BACKPACK_CAPACITY) return;

  if (idxB < profile.backpack.length) {
    const tmp = profile.backpack[idxA];
    profile.backpack[idxA] = profile.backpack[idxB];
    profile.backpack[idxB] = tmp;
  }
  saveSystem.saveAll();
  audio.click();
  renderInventoryDashboard();
}

function syncLivePlayersAfterInventoryChange() {
  const profile = saveSystem.getActiveProfile();
  if (!profile) return;
  if (previewPlayer) {
    previewPlayer.profile = profile;
    previewPlayer.refreshBonusesKeepHealth();
  }
  if (player) {
    player.profile = profile;
    player.refreshBonusesKeepHealth();
  }
  drawShopPreview();
}

function setupInventoryDragDropTargets() {
  document.querySelectorAll('.equip-slot[data-equip-slot]').forEach((slotEl) => {
    const slotType = slotEl.dataset.equipSlot;

    slotEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      slotEl.classList.add('drag-over');
    });

    slotEl.addEventListener('dragleave', () => {
      slotEl.classList.remove('drag-over');
    });

    slotEl.addEventListener('drop', (e) => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      if (dragPayload && dragPayload.source === 'backpack') {
        equipFromBackpackIndex(dragPayload.index, slotType);
      }
      dragPayload = null;
    });

    slotEl.addEventListener('click', () => {
      if (selectedBackpackIndex !== null) {
        const profile = saveSystem.getActiveProfile();
        const bpItemId = profile?.backpack[selectedBackpackIndex];
        const bpItem = GEAR_ITEMS.find((g) => g.id === bpItemId);
        if (bpItem && bpItem.slot === slotType) {
          equipFromBackpackIndex(selectedBackpackIndex, slotType);
          return;
        }
      }
      unequipSlotToBackpack(slotType);
    });
  });

  if (shopPreviewCanvas) {
    shopPreviewCanvas.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    shopPreviewCanvas.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragPayload && dragPayload.source === 'backpack') {
        equipFromBackpackIndex(dragPayload.index, null);
      }
      dragPayload = null;
    });
    shopPreviewCanvas.addEventListener('click', () => {
      if (selectedBackpackIndex !== null) {
        equipFromBackpackIndex(selectedBackpackIndex, null);
      }
    });
  }

  const sellZone = document.getElementById('blacksmith-sell-zone');
  if (sellZone) {
    sellZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      sellZone.classList.add('drag-over');
    });
    sellZone.addEventListener('dragleave', () => {
      sellZone.classList.remove('drag-over');
    });
    sellZone.addEventListener('drop', (e) => {
      e.preventDefault();
      sellZone.classList.remove('drag-over');
      if (dragPayload && dragPayload.source === 'backpack') {
        sellBackpackItemAtIndex(dragPayload.index);
      } else if (dragPayload && dragPayload.source === 'equip') {
        const profile = saveSystem.getActiveProfile();
        const eqId = profile?.equippedGear[dragPayload.slot];
        const item = GEAR_ITEMS.find((g) => g.id === eqId);
        if (item && !item.id.endsWith('_none')) {
          const coins = getSellPrice(item);
          profile.equippedGear[dragPayload.slot] = `${dragPayload.slot}_none`;
          profile.coins += coins;
          saveSystem.saveAll();
          audio.sellItem();
          syncLivePlayersAfterInventoryChange();
          renderInventoryDashboard();
          renderShop();
        }
      }
      dragPayload = null;
    });

    sellZone.addEventListener('click', () => {
      if (selectedBackpackIndex !== null) {
        sellBackpackItemAtIndex(selectedBackpackIndex);
      }
    });
  }

  const quickEquipBtn = document.getElementById('btn-quick-equip');
  if (quickEquipBtn) {
    quickEquipBtn.addEventListener('click', () => {
      if (selectedBackpackIndex !== null) {
        equipFromBackpackIndex(selectedBackpackIndex, null);
      }
    });
  }

  const quickSellBtn = document.getElementById('btn-quick-sell');
  if (quickSellBtn) {
    quickSellBtn.addEventListener('click', () => {
      if (selectedBackpackIndex !== null) {
        sellBackpackItemAtIndex(selectedBackpackIndex);
      }
    });
  }
}

function matchesCategoryFilter(item, filterKey) {
  if (!item || filterKey === 'all') return true;
  if (filterKey === 'weapons') return item.slot === 'weapon' && !item.setId;
  if (filterKey === 'armor_hats') return (item.slot === 'armor' || item.slot === 'hat') && !item.setId;
  if (filterKey === 'shields') return item.slot === 'shield' && !item.setId;
  if (filterKey === 'capes') return item.slot === 'cape' && !item.setId;
  if (filterKey === 'sets') return !!item.setId || item.source === 'boss_set';
  return true;
}

function renderInventoryDashboard() {
  const profile = saveSystem.getActiveProfile();
  if (!profile) return;

  const bonuses = computePlayerBonuses(profile);
  const displayTitle = profile.slotIndex === 0 ? 'Linas (1 Klasė)' : 'Lukas (3 Klasė)';
  document.getElementById('shop-preview-label').textContent = displayTitle;
  document.getElementById('shop-coins').textContent = profile.coins;
  document.getElementById('shop-crystals').textContent = profile.crystals;

  const attackTypeLabel = bonuses.isBoomerang
    ? '🪃 Bumerangas'
    : bonuses.isRanged
      ? '🏹 Lankas'
      : '⚔️ Kirtis';
  const dmgSuffix = bonuses.isBoomerang ? `${bonuses.weaponDamage} DMG ×2` : `${bonuses.weaponDamage} DMG`;
  const synBadge = bonuses.colorSynergy ? ` | ${bonuses.colorSynergy.title}` : '';
  document.getElementById('hero-live-stats').textContent =
    `❤️ ${bonuses.maxHearts} | ${attackTypeLabel}: ${dmgSuffix}${synBadge}`;

  const slotLabels = {
    hat: { emptyIcon: '🪖', title: 'Šalmas' },
    armor: { emptyIcon: '👕', title: 'Šarvai' },
    cape: { emptyIcon: '🧣', title: 'Apsiaustas' },
    weapon: { emptyIcon: '⚔️', title: 'Ginklas' },
    shield: { emptyIcon: '🛡️', title: 'Skydas' }
  };

  document.querySelectorAll('.equip-slot[data-equip-slot]').forEach((slotEl) => {
    const slotKey = slotEl.dataset.equipSlot;
    const eqId = profile.equippedGear[slotKey] || `${slotKey}_none`;
    const item = GEAR_ITEMS.find((g) => g.id === eqId);
    const isFilled = item && !item.id.endsWith('_none');

    slotEl.classList.toggle('filled', !!isFilled);
    slotEl.classList.toggle('set-piece', !!(isFilled && (item.setId || bonuses.colorSynergy)));
    slotEl.draggable = !!isFilled;

    if (isFilled) {
      slotEl.innerHTML = `
        <span class="slot-icon">${getItemSvgIcon(item, 28)}</span>
        <span class="slot-label">${item.name}</span>
      `;
      slotEl.title = `${item.name} (${item.bonusText}) – Paspausk arba nutempk į kuprinę, kad nuimtum!`;
      slotEl.ondragstart = (e) => {
        dragPayload = { source: 'equip', slot: slotKey, itemId: item.id };
        e.dataTransfer.setData('text/plain', item.id);
      };
    } else {
      const def = slotLabels[slotKey] || { emptyIcon: '⬜', title: slotKey };
      slotEl.innerHTML = `
        <span class="slot-icon" style="opacity:0.45">${def.emptyIcon}</span>
        <span class="slot-label">${def.title}</span>
      `;
      slotEl.title = `${def.title} – Nutempk daiktą iš kuprinės čia!`;
      slotEl.ondragstart = null;
    }
  });

  const setBanner = document.getElementById('active-set-banner');
  if (bonuses.activeSet && bonuses.colorSynergy) {
    setBanner.classList.add('active-set');
    setBanner.innerHTML = `🌟 <strong>${bonuses.activeSet.name}</strong> (${bonuses.activeSet.bonusText}) + <strong>${bonuses.colorSynergy.name}</strong> (${bonuses.colorSynergy.bonusText} • ${bonuses.colorSynergy.visualText})!`;
  } else if (bonuses.colorSynergy) {
    setBanner.classList.add('active-set');
    setBanner.innerHTML = `✨ <strong>AKTYVI MADOS SIELA: ${bonuses.colorSynergy.name} (${bonuses.colorSynergy.title})!</strong> <strong>${bonuses.colorSynergy.bonusText}</strong> — <em>${bonuses.colorSynergy.visualText}</em>`;
  } else if (bonuses.activeSet) {
    setBanner.classList.add('active-set');
    setBanner.innerHTML = `🌟 <strong>AKTYVUS RINKINYS: ${bonuses.activeSet.name}!</strong> (${bonuses.activeSet.bonusText})`;
  } else {
    setBanner.classList.remove('active-set');
    const bestSet = Object.values(bonuses.setProgress || {})
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)[0];
    if (bestSet) {
      setBanner.innerHTML = `${bestSet.setDef.name}: užsidėta <strong>${bestSet.count} / ${bestSet.total}</strong> dalių. 💡 Arba suderink 4 vienodos spalvos rūbus (Raudonus, Auksinius, Tamsius ar Žalius) ir pažadink <strong>Mados Sielą</strong>!`;
    } else {
      setBanner.innerHTML = `🎨 <strong>Mados Sielos:</strong> užsidėk visus 4 vienodos spalvos aprangos daiktus (Šalmą, Šarvus, Skydą ir Apsiaustą – Raudonus, Auksinius, Tamsius arba Žalius) ir gauk unikalią transformaciją bei galią!`;
    }
  }

  const bpGrid = document.getElementById('backpack-grid');
  bpGrid.innerHTML = '';
  const bp = profile.backpack || [];
  document.getElementById('backpack-count').textContent = bp.length;

  for (let i = 0; i < BACKPACK_CAPACITY; i++) {
    const itemId = bp[i] || null;
    const item = itemId ? GEAR_ITEMS.find((g) => g.id === itemId) : null;
    const matchesFilter = item ? matchesCategoryFilter(item, selectedInvFilter) : true;

    const cell = document.createElement('div');
    cell.className = `backpack-slot ${item ? 'has-item' : 'empty'} ${selectedBackpackIndex === i ? 'selected-slot' : ''} ${item && !matchesFilter ? 'filtered-dim' : ''}`;

    if (item) {
      const statBadge = item.setId
        ? '★SET'
        : item.bonus?.damage
          ? `${item.bonus.damage}⚔️`
          : item.bonus?.armorHearts
            ? `+${item.bonus.armorHearts}❤️`
            : '';

      cell.draggable = true;
      if (item.setId) {
        cell.style.borderColor = '#f97316';
      }
      cell.innerHTML = `
        ${statBadge ? `<span class="bp-tag">${statBadge}</span>` : ''}
        <span class="bp-icon">${getItemSvgIcon(item, 24)}</span>
        <span class="bp-name">${item.name}</span>
      `;
      cell.title = `${item.name} (${item.bonusText}) | Pardavimo vertė: ${getSellPrice(item)} 🪙`;

      cell.addEventListener('dragstart', (e) => {
        selectedBackpackIndex = i;
        dragPayload = { source: 'backpack', index: i, itemId: item.id };
        e.dataTransfer.setData('text/plain', item.id);
      });

      cell.addEventListener('click', () => {
        audio.click();
        selectedBackpackIndex = selectedBackpackIndex === i ? null : i;
        renderInventoryDashboard();
      });

      cell.addEventListener('dblclick', () => {
        equipFromBackpackIndex(i, null);
      });
    } else {
      cell.innerHTML = `<span class="bp-name" style="opacity:0.35">${i + 1}</span>`;
    }

    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
      cell.classList.add('drag-over');
    });
    cell.addEventListener('dragleave', () => {
      cell.classList.remove('drag-over');
    });
    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      cell.classList.remove('drag-over');
      if (!dragPayload) return;
      if (dragPayload.source === 'equip') {
        unequipSlotToBackpack(dragPayload.slot);
      } else if (dragPayload.source === 'backpack') {
        swapBackpackSlots(dragPayload.index, i);
      }
      dragPayload = null;
    });

    bpGrid.appendChild(cell);
  }

  const infoEl = document.getElementById('selected-item-info');
  const actionsEl = document.getElementById('selected-item-actions');
  const sellHintEl = document.getElementById('sell-zone-hint');

  if (selectedBackpackIndex !== null && bp[selectedBackpackIndex]) {
    const selItem = GEAR_ITEMS.find((g) => g.id === bp[selectedBackpackIndex]);
    if (selItem) {
      const sellVal = getSellPrice(selItem);
      infoEl.innerHTML = `<span style="display:inline-flex;vertical-align:middle;margin-right:4px">${getItemSvgIcon(selItem, 22)}</span> <strong>${selItem.name}</strong> — <span style="color:#86efac">${selItem.bonusText}</span>`;
      actionsEl.classList.remove('hidden');
      document.getElementById('btn-quick-sell').textContent = `🪙 Parduoti (+${sellVal} 🪙)`;
      if (sellHintEl) sellHintEl.textContent = `Paspausk čia, kad parduotum už +${sellVal} 🪙!`;
    }
  } else {
    actionsEl.classList.add('hidden');
    if (sellHintEl) sellHintEl.textContent = 'Nutempk daiktą čia arba paspausk!';
    if (!infoEl.innerHTML.includes('Kalvis nupirko')) {
      infoEl.textContent = '💡 Patarimas: Geresnius daiktus rasi lygio skryniose, duryse, „Proto Žvaigždėse“ ir nugalėjęs Bosus!';
    }
  }
}

function renderCustomizerBar() {
  // 4 PUNKTAS (Test Build 7): Spalvų paletės keitimas pašalintas –
  // kiekvienas daiktas turi savo unikalią fiksuotą spalvą ir dizainą!
}

function drawShopPreview() {
  if (!shopPreviewCtx || gameState !== 'SHOP') return;
  const profile = saveSystem.getActiveProfile();
  if (!profile) return;

  if (!previewPlayer || previewPlayer.profile !== profile) {
    previewPlayer = new Player(profile);
    previewPlayer.x = 52;
    previewPlayer.y = 62;
  }
  previewPlayer.animFrame++;
  if (previewPlayer.slashTimer > 0) previewPlayer.slashTimer--;

  shopPreviewCtx.clearRect(0, 0, shopPreviewCanvas.width, shopPreviewCanvas.height);

  shopPreviewCtx.fillStyle = '#334155';
  shopPreviewCtx.strokeStyle = '#38bdf8';
  shopPreviewCtx.lineWidth = 2;
  shopPreviewCtx.beginPath();
  shopPreviewCtx.ellipse(72, 122, 38, 9, 0, 0, Math.PI * 2);
  shopPreviewCtx.fill();
  shopPreviewCtx.stroke();

  previewPlayer.draw(shopPreviewCtx, 0, true);
}

function renderShop() {
  const profile = saveSystem.getActiveProfile();
  if (!profile) return;

  document.getElementById('shop-coins').textContent = profile.coins;
  document.getElementById('shop-crystals').textContent = profile.crystals;

  const claimableCount = ACHIEVEMENTS.filter(
    (a) => a.check(profile) && !profile.claimedAchievements.includes(a.id)
  ).length;
  document.getElementById('ach-badge-count').textContent = claimableCount;

  const container = document.getElementById('shop-content');
  container.innerHTML = '';

  const slotNames = {
    shield: '🛡️ Skydas',
    weapon: '⚔️ Ginklas / Lankas',
    armor: '🥋 Šarvai (Gyvybės)',
    hat: '🪖 Šalmas',
    cape: '🧣 Apsiaustas'
  };

  // 5 ir 6 PUNKTAI: Aiškios kategorijų kortelės (Ginklai | Šarvai ir Šalmai | Skydai | Apsiaustai)
  if (['weapons', 'armor_hats', 'shields', 'capes'].includes(selectedShopTab)) {
    const categoryItems = GEAR_ITEMS.filter((it) => {
      if (it.source === 'starter' || it.source === 'boss_set' || it.setId) return false;
      if (selectedShopTab === 'weapons') return it.slot === 'weapon';
      if (selectedShopTab === 'armor_hats') return it.slot === 'armor' || it.slot === 'hat';
      if (selectedShopTab === 'shields') return it.slot === 'shield';
      if (selectedShopTab === 'capes') return it.slot === 'cape';
      return false;
    });

    const shopBuyable = categoryItems.filter((it) => it.canBuyInShop);
    const lootFindable = categoryItems.filter((it) => !it.canBuyInShop);

    // 1) Baziniai Kalvės daiktai (perkami už monetas)
    const bannerShop = document.createElement('div');
    bannerShop.className = 'section-divider-banner';
    bannerShop.innerHTML = `🔨 <strong>Kalvės Baziniai Daiktai:</strong> pas Kalvį už monetas galima įsigyti tik pačius paprasčiausius pradinius daiktus.`;
    container.appendChild(bannerShop);

    shopBuyable.forEach((item) => {
      const equipped = profile.equippedGear[item.slot] === item.id;
      const bpIndex = (profile.backpack || []).indexOf(item.id);
      const alreadyOwned = equipped || bpIndex >= 0;
      const canAfford = profile.coins >= item.priceCoins && profile.crystals >= item.priceCrystals;

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div>
          <div class="shop-item-header">
            <div class="shop-item-icon">${getItemSvgIcon(item, 36)}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:4px">
                <strong>${item.name}</strong>
                <span class="tier-badge">${item.tier || 'Kalvė'}</span>
              </div>
              <div class="subtitle">${slotNames[item.slot] || item.slot} ${equipped ? '• <span style="color:#fde047">Užsidėta!</span>' : bpIndex >= 0 ? '• <span style="color:#38bdf8">Kuprinėje</span>' : ''}</div>
            </div>
          </div>
          <p style="margin-top:5px;color:#86efac;font-weight:800;font-size:0.88rem">${item.bonusText}</p>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${alreadyOwned
            ? `<button class="secondary-btn" style="flex:1" disabled>✅ Jau turi inventoriuje</button>`
            : `<button class="primary-btn" style="flex:1" ${!canAfford ? 'disabled' : ''} data-buy-gear="${item.id}">
                🛒 Pirkti: ${item.priceCoins.toLocaleString('lt-LT')} 🪙
              </button>`
          }
          ${bpIndex >= 0 && !equipped ? `<button class="primary-btn glow-btn" data-equip-bp="${bpIndex}">👕 Užsidėti</button>` : ''}
        </div>
      `;
      container.appendChild(card);
    });

    // 2) Vidutiniai ir geri „Loot“ daiktai (RANDAMI lygio skryniose, duryse ir „Proto Žvaigždėse“)
    const bannerLoot = document.createElement('div');
    bannerLoot.className = 'section-divider-banner';
    bannerLoot.style.borderColor = '#fde047';
    bannerLoot.innerHTML = `🎁 <strong>Lygio Lobių Daiktai („Loot“):</strong> šių geresnių daiktų nusipirkti negalima – juos rasi išsprendęs užduotis <strong>Skryniose, Duryse ir „Proto Žvaigždėse“</strong>!`;
    container.appendChild(bannerLoot);

    lootFindable.forEach((item) => {
      const equipped = profile.equippedGear[item.slot] === item.id;
      const bpIndex = (profile.backpack || []).indexOf(item.id);
      const inBackpackCount = (profile.backpack || []).filter((id) => id === item.id).length;

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.style.borderColor = equipped ? '#fde047' : inBackpackCount > 0 ? '#22c55e' : '#475569';
      card.innerHTML = `
        <div>
          <div class="shop-item-header">
            <div class="shop-item-icon">${getItemSvgIcon(item, 36)}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:4px">
                <strong>${item.name}</strong>
                <span class="tier-badge">${item.tier || 'Loot'}</span>
              </div>
              <div class="subtitle">${slotNames[item.slot] || item.slot} • Pardavimo vertė: ${getSellPrice(item)} 🪙</div>
            </div>
          </div>
          <p style="margin-top:5px;color:#86efac;font-weight:800;font-size:0.88rem">${item.bonusText}</p>
        </div>
        ${equipped
          ? `<button class="secondary-btn" disabled>✅ Šiuo metu užsidėta ant herojaus</button>`
          : bpIndex >= 0
            ? `<button class="primary-btn glow-btn" data-equip-bp="${bpIndex}">👕 Užsidėti iš kuprinės (${inBackpackCount} vnt.)</button>`
            : `<button class="secondary-btn" disabled>🎁 Randama lygio skryniose, duryse ir Proto Žvaigždėse</button>`
        }
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('[data-buy-gear]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = GEAR_ITEMS.find((g) => g.id === btn.dataset.buyGear);
        if (!item || !item.canBuyInShop) return;

        if ((profile.backpack || []).length >= BACKPACK_CAPACITY) {
          audio.wrong();
          alert('Tavo kuprinė pilna (15/15)! Nutempk nereikalingus daiktus ant Kalvio supirktuvės ir parduok už 50% vertės.');
          return;
        }

        if (profile.coins >= item.priceCoins && profile.crystals >= item.priceCrystals) {
          profile.coins -= item.priceCoins;
          profile.crystals -= item.priceCrystals;
          addItemToBackpack(profile, item.id);
          selectedBackpackIndex = profile.backpack.length - 1;
          saveSystem.saveAll();
          audio.buy();
          renderInventoryDashboard();
          renderShop();
        }
      });
    });

    container.querySelectorAll('[data-equip-bp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.equipBp);
        equipFromBackpackIndex(idx, null);
      });
    });
  } else if (selectedShopTab === 'sets') {
    // 5 ir 6 PUNKTAI: [ Rinkiniai (Sets) ] kortelė – Epiški / Set daiktai iškrenta TIK nugalėjus Bosą lygio pabaigoje!
    const heldSetIds = new Set([
      ...Object.values(profile.equippedGear || {}),
      ...(profile.backpack || [])
    ]);

    const exclusiveShowcase = document.createElement('div');
    exclusiveShowcase.className = 'exclusive-sets-section';
    const setsHtml = ITEM_SETS.map((s) => {
      const piecesHtml = s.pieces.map((pid) => {
        const pItem = GEAR_ITEMS.find((g) => g.id === pid);
        const hasIt = heldSetIds.has(pid);
        return `<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 4px;padding:3px 8px;border-radius:8px;background:${hasIt ? 'rgba(34,197,94,0.25)' : '#1e293b'};border:1px solid ${hasIt ? '#22c55e' : '#475569'};color:${hasIt ? '#86efac' : '#94a3b8'}">${hasIt ? '✅' : '🔒'} ${pItem ? getItemSvgIcon(pItem, 18) + ' ' + pItem.name : pid}</span>`;
      }).join('');
      return `
        <div class="exclusive-set-card" style="border-color:${s.themeColor}">
          <strong style="color:${s.themeColor};font-size:0.94rem">${s.name}</strong>
          <div style="font-size:0.78rem;color:#fde047;margin:3px 0">${s.bonusText}</div>
          <div style="margin-top:4px">${piecesHtml}</div>
        </div>
      `;
    }).join('');

    exclusiveShowcase.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <strong style="color:#fde047;font-size:0.98rem">👑 Epiški Bosų Rinkiniai (Set Items – Iškrenta TIK nugalėjus lygio Bosą!)</strong>
        <span style="font-size:0.82rem;color:#93c5fd">Surink visas 4 vieno rinkinio dalis ir gauk papildomų ❤️ širdelių, ⚔️ žalos bei švytinčią Aurą!</span>
      </div>
      <div class="exclusive-sets-grid">${setsHtml}</div>
    `;
    container.appendChild(exclusiveShowcase);

    GEAR_ITEMS.filter((it) => !!it.setId || it.source === 'boss_set').forEach((item) => {
      const equipped = profile.equippedGear[item.slot] === item.id;
      const bpIndex = (profile.backpack || []).indexOf(item.id);
      const inBackpackCount = (profile.backpack || []).filter((id) => id === item.id).length;

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.style.borderColor = equipped ? '#fde047' : inBackpackCount > 0 ? '#f97316' : '#475569';
      card.innerHTML = `
        <div>
          <div class="shop-item-header">
            <div class="shop-item-icon">${getItemSvgIcon(item, 36)}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:4px">
                <strong>${item.name}</strong>
                <span class="tier-badge">${item.tier || 'Set'}</span>
              </div>
              <div class="subtitle">${slotNames[item.slot] || item.slot} • Pardavimo vertė: ${getSellPrice(item)} 🪙</div>
            </div>
          </div>
          <p style="margin-top:5px;color:#86efac;font-weight:800;font-size:0.88rem">${item.bonusText}</p>
        </div>
        ${equipped
          ? `<button class="secondary-btn" disabled>✅ Užsidėta ant herojaus</button>`
          : bpIndex >= 0
            ? `<button class="primary-btn glow-btn" data-equip-bp="${bpIndex}">👕 Užsidėti iš kuprinės (${inBackpackCount} vnt.)</button>`
            : `<button class="secondary-btn" disabled>👑 Iškrenta TIK nugalėjus Bosą lygio pabaigoje!</button>`
        }
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('[data-equip-bp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.equipBp);
        equipFromBackpackIndex(idx, null);
      });
    });
  } else if (selectedShopTab === 'upgrades') {
    STAT_UPGRADES.forEach((stat) => {
      const currentLvl = profile.upgrades[stat.id] || 1;
      const cost = getUpgradeCost(stat, currentLvl);
      const isMax = currentLvl >= stat.maxLevel;
      const canAfford = cost !== null && profile.coins >= cost;
      const pct = Math.round((currentLvl / stat.maxLevel) * 100);

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div>
          <div class="shop-item-header">
            <div class="shop-item-icon">${stat.icon}</div>
            <div style="flex:1">
              <strong>${stat.name} (Lygis ${currentLvl}/${stat.maxLevel})</strong>
              <div class="level-bar-bg"><div class="level-bar-fill" style="width:${pct}%"></div></div>
            </div>
          </div>
          <p class="subtitle" style="margin-top:6px">${stat.description}</p>
          <p style="margin-top:5px;color:#fde047;font-weight:800;font-size:0.9rem">${stat.getEffectText(currentLvl)}</p>
        </div>
        <button class="primary-btn" ${isMax || !canAfford ? 'disabled' : ''} data-upgrade="${stat.id}">
          ${isMax ? '🌟 MAKSIMALUS (25/25)' : `Tobulinti: ${cost.toLocaleString('lt-LT')} 🪙`}
        </button>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('[data-upgrade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.upgrade;
        const stat = STAT_UPGRADES.find((s) => s.id === id);
        const lvl = profile.upgrades[id] || 1;
        const cost = getUpgradeCost(stat, lvl);
        if (cost !== null && profile.coins >= cost) {
          profile.coins -= cost;
          profile.upgrades[id] = lvl + 1;
          saveSystem.saveAll();
          audio.buy();
          syncLivePlayersAfterInventoryChange();
          renderInventoryDashboard();
          renderShop();
        }
      });
    });
  } else if (selectedShopTab === 'pets') {
    if (!profile.petLevels) {
      profile.petLevels = { pet_dragon: 1, pet_cyber: 1, pet_phoenix: 1 };
    }

    PET_ITEMS.forEach((pet) => {
      const owned = profile.ownedPets.includes(pet.id);
      const equipped = profile.equippedPet === pet.id;
      const petLvl = Math.max(1, Math.min(10, profile.petLevels[pet.id] || 1));
      const pStats = pet.getStatsForLevel(petLvl);
      const upgradeCost = getPetUpgradeCost(pet, petLvl);
      const canAffordBuy = profile.coins >= pet.priceCoins && profile.crystals >= pet.priceCrystals;
      const canAffordUp = owned && upgradeCost !== null && profile.coins >= upgradeCost;
      const pct = Math.round((petLvl / 10) * 100);

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div>
          <div class="shop-item-header">
            <div class="shop-item-icon">${pet.icon}</div>
            <div style="flex:1">
              <strong>${pet.name} (Lygis ${petLvl} / 10)</strong>
              <div class="level-bar-bg"><div class="level-bar-fill" style="width:${pct}%"></div></div>
            </div>
          </div>
          <p class="subtitle" style="margin-top:6px">${pet.description}</p>
          <p style="margin-top:5px;color:#fde047;font-weight:800;font-size:0.86rem">${pStats.skillText}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="${equipped ? 'secondary-btn' : 'primary-btn'}" style="flex:1" ${!owned && !canAffordBuy ? 'disabled' : ''} data-pet="${pet.id}">
            ${equipped ? '✅ Skrenda kartu' : owned ? '🐾 Pasirinkti' : `Pirkti: ${pet.priceCoins.toLocaleString('lt-LT')} 🪙 + ${pet.priceCrystals} 💎`}
          </button>
          ${owned ? `
            <button class="primary-btn glow-btn" style="flex:1" ${upgradeCost === null || !canAffordUp ? 'disabled' : ''} data-pet-up="${pet.id}">
              ${upgradeCost === null ? '🌟 MAX (10/10)' : `⬆️ Lygis ${petLvl + 1}: ${upgradeCost.toLocaleString('lt-LT')} 🪙`}
            </button>
          ` : ''}
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('[data-pet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pet = PET_ITEMS.find((p) => p.id === btn.dataset.pet);
        if (!pet) return;
        if (profile.ownedPets.includes(pet.id)) {
          profile.equippedPet = profile.equippedPet === pet.id ? null : pet.id;
          saveSystem.saveAll();
          audio.click();
          syncLivePlayersAfterInventoryChange();
          renderInventoryDashboard();
          renderShop();
        } else if (profile.coins >= pet.priceCoins && profile.crystals >= pet.priceCrystals) {
          profile.coins -= pet.priceCoins;
          profile.crystals -= pet.priceCrystals;
          profile.ownedPets.push(pet.id);
          profile.equippedPet = pet.id;
          if (!profile.petLevels) profile.petLevels = {};
          profile.petLevels[pet.id] = 1;
          saveSystem.saveAll();
          audio.buy();
          syncLivePlayersAfterInventoryChange();
          renderInventoryDashboard();
          renderShop();
        }
      });
    });

    container.querySelectorAll('[data-pet-up]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pet = PET_ITEMS.find((p) => p.id === btn.dataset.petUp);
        if (!pet) return;
        const curLvl = (profile.petLevels && profile.petLevels[pet.id]) || 1;
        const cost = getPetUpgradeCost(pet, curLvl);
        if (cost !== null && profile.coins >= cost) {
          profile.coins -= cost;
          profile.petLevels[pet.id] = curLvl + 1;
          saveSystem.saveAll();
          audio.buy();
          syncLivePlayersAfterInventoryChange();
          renderInventoryDashboard();
          renderShop();
        }
      });
    });
  } else if (selectedShopTab === 'achievements') {
    ACHIEVEMENTS.forEach((ach) => {
      const unlocked = ach.check(profile);
      const claimed = profile.claimedAchievements.includes(ach.id);

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div>
          <div class="shop-item-header">
            <div class="shop-item-icon">${ach.icon}</div>
            <div>
              <strong>${ach.name}</strong>
              <div class="subtitle">Progresas: ${ach.progress(profile)}</div>
            </div>
          </div>
          <p class="subtitle" style="margin-top:6px">${ach.description}</p>
          <p style="margin-top:5px;color:#fde047;font-weight:800">Atlygis: +${ach.rewardCoins} 🪙 ir +${ach.rewardCrystals} 💎</p>
        </div>
        <button class="${claimed ? 'secondary-btn' : 'primary-btn'}" ${!unlocked || claimed ? 'disabled' : ''} data-ach="${ach.id}">
          ${claimed ? '🏅 Medalis atsiimtas' : unlocked ? '🎁 Atsiimti atlygį!' : '🔒 Dar neįvykdyta'}
        </button>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('[data-ach]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ach = ACHIEVEMENTS.find((a) => a.id === btn.dataset.ach);
        if (ach && ach.check(profile) && !profile.claimedAchievements.includes(ach.id)) {
          profile.coins += ach.rewardCoins;
          profile.crystals += ach.rewardCrystals;
          profile.claimedAchievements.push(ach.id);
          saveSystem.saveAll();
          audio.crystal();
          renderInventoryDashboard();
          renderShop();
        }
      });
    });
  }
}

// ==================== 4. LYGIO PALEIDIMAS IR PLATFORMERIO FIZIKA ====================
let inSecretBonusRoom = false;
let savedMainLevelPosition = null;

function enterSecretBonusRoom(entrance) {
  if (!currentLevel || !currentLevel.secretBonusRoom || !player || !entrance || entrance.used) return;

  // 1. Išsaugome herojaus esamas koordinates pagrindiniame lygyje (su postūmiu į dešinę, kad grįžęs vėl neįeitų į kambarį)
  savedMainLevelPosition = {
    x: entrance.returnX || Math.min(currentLevel.width - 180, entrance.x + entrance.w + 48),
    y: entrance.returnY || (currentLevel.groundY - player.standHeight - 6)
  };

  // 2. Pažymime slaptą įėjimą kaip panaudotą (tampa neaktyvus / pajuoduoja)
  entrance.used = true;
  inSecretBonusRoom = true;

  // 3. Perkeliame herojų į izoliuotą Slaptą Kambarį (Bonus Room)
  const room = currentLevel.secretBonusRoom;
  player.x = 70;
  player.y = room.groundY - player.standHeight - 8;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.teleportCooldown = 45;
  cameraX = 0;

  audio.crystal();
  audio.levelWin();
  particles.emitCrystalBurst(player.x + player.width / 2, player.y + player.height / 2);
  particles.addFloatingText(
    player.x + player.width / 2 + 60,
    player.y - 24,
    '🌟 SLAPTAS LOBIŲ KAMBARYS!',
    '#fde047',
    22
  );
  updateHud();
}

function exitSecretBonusRoom() {
  if (!inSecretBonusRoom || !currentLevel || !player) return;

  inSecretBonusRoom = false;
  const returnX = savedMainLevelPosition ? savedMainLevelPosition.x : 120;
  const returnY = savedMainLevelPosition ? savedMainLevelPosition.y : currentLevel.groundY - player.standHeight - 8;

  player.x = returnX;
  player.y = returnY;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.teleportCooldown = 60;

  cameraX = Math.max(0, Math.min(currentLevel.width - canvas.width, player.x - canvas.width * 0.35));

  audio.crystal();
  particles.emitCrystalBurst(player.x + player.width / 2, player.y + player.height / 2);
  particles.addFloatingText(
    player.x + player.width / 2,
    player.y - 20,
    '✨ GRĮŽAI IŠ SLAPTO KAMBARIO!',
    '#4ade80',
    20
  );
  updateHud();
}

function startLevelPlay(levelId) {
  const profile = saveSystem.getActiveProfile();
  if (!profile) return;

  currentLevel = generateLevel(levelId);
  inSecretBonusRoom = false;
  savedMainLevelPosition = null;
  player = new Player(profile);
  player.resetForLevel(65, 340);
  cameraX = 0;
  particles.clear();

  levelSession = {
    coinsEarned: 0,
    crystalsEarned: 0,
    solvedCount: 0,
    mistakesInLevel: 0
  };

  input.left = false;
  input.right = false;
  input.jump = false;
  input.down = false;
  input.shoot = false;

  const displayTitle = profile.slotIndex === 0 ? 'Linas (1 Klasė)' : 'Lukas (3 Klasė)';
  document.getElementById('hud-hero-name').textContent = displayTitle;

  returnToResultFromShop = false;
  isTimeLimitPaused = false;
  isWorldPaused = false;
  gameState = 'PLAYING';
  hideAllScreens();
  gameHud.classList.remove('hidden');
  touchControls.classList.remove('hidden');

  updateHud();

  // Jei dienos laiko limitas jau išeikvotas – iškart sustabdome ir parodome „Laikas baigėsi“ langą!
  if (getRemainingPlaytimeSeconds(profile) <= 0) {
    openTimeLimitModal(true);
  }
}

function formatHeartsDisplay(hearts, maxHearts) {
  const fullCount = Math.floor(hearts);
  const hasHalf = (hearts - fullCount) >= 0.4;
  const emptyCount = Math.max(0, maxHearts - fullCount - (hasHalf ? 1 : 0));
  return '❤️'.repeat(fullCount) + (hasHalf ? '💔' : '') + '🖤'.repeat(emptyCount);
}

function updateHud() {
  const profile = saveSystem.getActiveProfile();
  if (!profile || !player || !currentLevel) return;

  document.getElementById('hud-hearts').textContent = formatHeartsDisplay(player.hearts, player.maxHearts);

  const shieldEl = document.getElementById('hud-shields');
  if (player.shields > 0) {
    shieldEl.classList.remove('hidden');
    shieldEl.textContent = `🫧 ${player.shields}`;
  } else {
    shieldEl.classList.add('hidden');
  }

  const shieldStatusEl = document.getElementById('hud-shield-status');
  if (player.bonuses.canBlockArrows) {
    shieldStatusEl.classList.remove('hidden');
  } else {
    shieldStatusEl.classList.add('hidden');
  }

  const bowStatusEl = document.getElementById('hud-bow-status');
  const touchShootBtn = document.getElementById('touch-shoot');
  if (player.bonuses.isBoomerang) {
    bowStatusEl.classList.remove('hidden');
    bowStatusEl.textContent = player.boomerangInFlight
      ? `🪃 Skrenda atgal...`
      : `🪃 Bumerangas: ${player.bonuses.weaponDamage} DMG ×2 (F/Z)`;
    if (touchShootBtn) touchShootBtn.textContent = '🪃 MESTI';
  } else if (player.bonuses.isRanged) {
    bowStatusEl.classList.remove('hidden');
    bowStatusEl.textContent = player.bowCooldownTimer > 0
      ? `🏹 Užtaisoma...`
      : `🏹 Lankas: ${player.bonuses.weaponDamage} DMG (F/Z)`;
    if (touchShootBtn) touchShootBtn.textContent = '🏹 ŠAUTI';
  } else {
    bowStatusEl.classList.remove('hidden');
    bowStatusEl.textContent = `⚔️ Kirtis: ${player.bonuses.weaponDamage} DMG (F/Z)`;
    if (touchShootBtn) touchShootBtn.textContent = '⚔️ KIRTIS';
  }

  const setStatusEl = document.getElementById('hud-set-status');
  if (setStatusEl) {
    if (player.bonuses.activeSet && player.bonuses.colorSynergy) {
      setStatusEl.classList.remove('hidden');
      setStatusEl.textContent = `${player.bonuses.activeSet.name} • ${player.bonuses.colorSynergy.title}`;
    } else if (player.bonuses.colorSynergy) {
      setStatusEl.classList.remove('hidden');
      setStatusEl.textContent = `${player.bonuses.colorSynergy.name} (${player.bonuses.colorSynergy.bonusText})`;
    } else if (player.bonuses.activeSet) {
      setStatusEl.classList.remove('hidden');
      setStatusEl.textContent = player.bonuses.activeSet.name;
    } else {
      setStatusEl.classList.add('hidden');
    }
  }

  const bpCountEl = document.getElementById('hud-bp-count');
  if (bpCountEl) {
    bpCountEl.textContent = (profile.backpack || []).length;
  }

  const streak = profile.stats.currentStreak || 0;
  const comboEl = document.getElementById('hud-combo');
  if (streak >= 2) {
    const mult = getComboMultiplier(streak);
    comboEl.classList.remove('hidden');
    comboEl.textContent = `🔥 COMBO x${streak} (${mult}x 🪙)`;
  } else {
    comboEl.classList.add('hidden');
  }

  document.getElementById('hud-level-title').textContent = inSecretBonusRoom
    ? `🌟 SLAPTAS KAMBARYS – ${currentLevel.levelId} Lygis`
    : `${currentLevel.world.icon} ${currentLevel.world.name} – ${currentLevel.levelId} Lygis`;
  document.getElementById('hud-coins').textContent = profile.coins;
  document.getElementById('hud-crystals').textContent = profile.crystals;
  updatePlaytimeHud(profile);
}

function getComboMultiplier(streak) {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

function updateSecretBonusRoom(profile) {
  const room = currentLevel.secretBonusRoom;
  if (!room || !player) return;

  // 1. Herojaus fizika izoliuotame Slaptame Kambaryje
  player.update(input, room.platforms, 1);
  if (player.x < 10) player.x = 10;
  if (player.x + player.width > room.width - 10) player.x = room.width - 10 - player.width;

  if (player.y > canvas.height + 60) {
    player.x = 70;
    player.y = room.groundY - player.standHeight - 10;
    player.vy = 0;
  }

  // 2. Spyruoklės šuoliams per monetų figūras
  for (const sp of room.springs) {
    if (player.intersects(sp) && player.vy >= 0) {
      player.vy = sp.bounceVy;
      player.onGround = false;
      player.jumpsUsed = 1;
      audio.spring();
      particles.emitJumpDust(sp.x + sp.w / 2, sp.y, true);
    }
  }

  // 3. Monetos (Šypsenėlė, Širdelė, Dideli lankai, Krūva) + Magnetas
  const pCenterX = player.x + player.width / 2;
  const pCenterY = player.y + player.height / 2;
  const magRadius = Math.max(95, player.bonuses.magnetRadius);

  for (const coin of room.coins) {
    if (coin.collected) continue;
    const dx = pCenterX - coin.x;
    const dy = pCenterY - coin.y;
    const dist = Math.hypot(dx, dy);

    if (dist < magRadius) {
      coin.x += (dx / (dist || 1)) * 7.2;
      coin.y += (dy / (dist || 1)) * 7.2;
    }

    if (dist < 28) {
      coin.collected = true;
      const coinMult = player.bonuses.coinFindMult || 1;
      const gainedCoins = coinMult > 1 ? Math.max(coin.value + 1, Math.round(coin.value * coinMult)) : coin.value;
      profile.coins += gainedCoins;
      profile.stats.coinsCollected += gainedCoins;
      levelSession.coinsEarned += gainedCoins;
      audio.coin();
      particles.emitCoinSparkle(coin.x, coin.y);
      particles.addFloatingText(coin.x, coin.y - 10, `+${gainedCoins} 🪙`, '#fde047', 16);
      saveSystem.saveAll();
      updateHud();
    }
  }

  // 4. Didelė deimantų / kristalų krūva pabaigoje!
  for (const cr of room.crystals) {
    if (cr.collected) continue;
    const dist = Math.hypot(pCenterX - cr.x, pCenterY - cr.y);
    if (dist < 32) {
      cr.collected = true;
      profile.crystals += 1;
      levelSession.crystalsEarned += 1;
      audio.crystal();
      particles.emitCrystalBurst(cr.x, cr.y);
      particles.addFloatingText(cr.x, cr.y - 12, '+1 💎 DEIMANTAS!', '#38bdf8', 18);
      saveSystem.saveAll();
      updateHud();
    }
  }

  // 5. Išėjimo Portalas dešinėje pusėje – grąžina į pagrindinį lygį!
  if (player.teleportCooldown <= 0 && player.intersects(room.exitPortal)) {
    exitSecretBonusRoom();
    return;
  }

  const targetCamX = Math.max(0, Math.min(room.width - canvas.width, player.x - canvas.width * 0.35));
  cameraX += (targetCamX - cameraX) * 0.16;
  particles.update();
}

function updatePlaying() {
  if (isWorldPaused || gameState !== 'PLAYING' || !currentLevel || !player) return;

  const profile = saveSystem.getActiveProfile();

  // Jei herojus yra Slaptame Kambaryje (Bonus Room) – vykdome atskirą, izoliuotą Slapto Kambario logiką!
  if (inSecretBonusRoom && currentLevel.secretBonusRoom) {
    updateSecretBonusRoom(profile);
    return;
  }

  const prevBowCd = player.bowCooldownTimer;
  const worldId = currentLevel.world ? currentLevel.world.id : 1;

  // 1. Judančios ir trupančios platformos (Pasaulis 2: Trupantys kristalai subyra greitai!)
  for (const plat of currentLevel.platforms) {
    if (plat.type === 'moving_h') {
      plat.x += plat.vx;
      if (plat.x < plat.minX || plat.x > plat.maxX) plat.vx *= -1;
    } else if (plat.type === 'moving_v') {
      plat.y += plat.vy;
      if (plat.y < plat.minY || plat.y > plat.maxY) plat.vy *= -1;
    } else if (plat.type === 'crumble') {
      if (plat.broken) {
        plat.respawnTimer--;
        if (plat.respawnTimer <= 0) {
          plat.broken = false;
          plat.shaking = false;
          plat.timer = plat.maxTimer;
        }
      } else if (plat.shaking) {
        plat.timer--;
        if (plat.timer <= 0) {
          plat.broken = true;
          plat.respawnTimer = plat.isCrystalCrumble ? 140 : 180;
          if (plat.isCrystalCrumble) {
            particles.emitCrystalBurst(plat.x + plat.w / 2, plat.y + 8);
          } else {
            particles.emitJumpDust(plat.x + plat.w / 2, plat.y + 10, false);
          }
        }
      }
    }
  }

  // 2. Herojaus fizika (su pasaulio specifika: 3 Pasaulio Ledo slydimas, 5 Pasaulio Maža gravitacija)
  player.update(input, currentLevel.platforms, worldId);
  if (prevBowCd > 0 && player.bowCooldownTimer === 0) {
    updateHud();
  }

  // 2B. 4 Pasaulio Lavos duobės (Lava Pits): įkritus atima 1 ❤️ ir išmeta herojų atgal į viršų ant paskutinio saugaus kranto!
  let hitLavaPit = false;
  if (currentLevel.lavaPits) {
    for (const lava of currentLevel.lavaPits) {
      if (player.intersects(lava)) {
        hitLavaPit = true;
        break;
      }
    }
  }

  if (hitLavaPit || player.y > canvas.height + 80) {
    const dead = player.takeDamage(1, false);
    updateHud();
    if (dead) {
      finishLevel(false);
      return;
    }
    if (hitLavaPit) {
      particles.emit(player.x + player.width / 2, player.y + player.height, 16, {
        colors: ['#ef4444', '#f97316', '#fde047']
      });
      particles.addFloatingText(
        player.x + player.width / 2,
        player.y - 16,
        '🌋 LAVA! -1 ❤️',
        '#f97316',
        20
      );
    }
    const safeX = typeof player.lastSafeX === 'number' ? player.lastSafeX : 80;
    const safeY = typeof player.lastSafeY === 'number' ? player.lastSafeY : currentLevel.groundY - player.standHeight;
    player.x = Math.max(40, safeX);
    player.y = safeY - 26;
    player.vy = -10.5;
    player.onGround = false;
  }

  // 3. Spyruoklės
  for (const sp of currentLevel.springs) {
    if (player.intersects(sp) && player.vy >= 0) {
      player.vy = sp.bounceVy;
      player.onGround = false;
      player.jumpsUsed = 1;
      audio.spring();
      particles.emitJumpDust(sp.x + sp.w / 2, sp.y, true);
    }
  }

  // 3B. NAUJA: Batutai (Trampolines) – išmeta labai aukštai!
  if (currentLevel.trampolines) {
    for (const tr of currentLevel.trampolines) {
      if (tr.compressTimer > 0) tr.compressTimer--;
      if (player.intersects(tr) && player.vy >= 0) {
        player.vy = tr.bounceVy;
        player.onGround = false;
        player.jumpsUsed = 0; // Leidžia dar ir ore pašokti!
        tr.compressTimer = 15;
        audio.spring();
        particles.emitJumpDust(tr.x + tr.w / 2, tr.y, true);
        particles.addFloatingText(tr.x + tr.w / 2, tr.y - 12, '🚀 SUPER BATUTAS!', '#a855f7', 16);
      }
    }
  }

  // 3C. NAUJA: Svyruojantys kirviai / Švytuoklės (Pendulums)
  if (currentLevel.pendulums) {
    for (const pd of currentLevel.pendulums) {
      pd.phase += pd.speed;
      pd.angle = Math.sin(pd.phase) * pd.maxAngle;
      const bladeX = pd.pivotX + Math.sin(pd.angle) * pd.length;
      const bladeY = pd.pivotY + Math.cos(pd.angle) * pd.length;
      pd.bladeX = bladeX;
      pd.bladeY = bladeY;

      const pCx = player.x + player.width / 2;
      const pCy = player.y + player.height / 2;
      if (Math.hypot(pCx - bladeX, pCy - bladeY) < pd.bladeRadius + 14) {
        player.vy = -7.5;
        const dead = player.takeDamage(1, true);
        updateHud();
        if (dead) {
          finishLevel(false);
          return;
        }
      }
    }
  }

  // 3D. NAUJA: Teleportacijos durys (Teleporters)
  if (currentLevel.teleporters) {
    for (const tp of currentLevel.teleporters) {
      if (player.teleportCooldown <= 0 && player.intersects(tp)) {
        player.x = tp.targetX;
        player.y = tp.targetY;
        player.vy = 0;
        player.teleportCooldown = 60;
        audio.crystal();
        particles.emitCrystalBurst(player.x + player.width / 2, player.y + player.height / 2);
        particles.addFloatingText(player.x + player.width / 2, player.y - 15, '🌀 TELEPORTACIJA!', '#a855f7', 18);
        break;
      }
    }
  }

  // 3E. NAUJA: Netikros sienos (Fake Walls) – praeinamos kiaurai ir atidengia paslėptą kambarį!
  if (currentLevel.fakeWalls) {
    for (const fw of currentLevel.fakeWalls) {
      if (!fw.discovered && player.intersects(fw)) {
        fw.discovered = true;
        audio.crystal();
        particles.emitCoinSparkle(fw.x + fw.w / 2, fw.y + fw.h / 2);
        particles.addFloatingText(fw.x + fw.w / 2, fw.y - 10, '✨ ATRADAI SLAPTĄ KAMBARĮ!', '#fde047', 18);
      }
    }
  }

  // 3F. NAUJA: Krentantys stalaktitai (Falling Stalactites) – pradeda kristi tik tada, kai herojus pabėga po jais!
  if (currentLevel.fallingStalactites) {
    const pCenterX = player.x + player.width / 2;
    for (const st of currentLevel.fallingStalactites) {
      if (st.state === 'idle') {
        if (Math.abs(pCenterX - (st.x + st.w / 2)) < 82 && player.y > st.y) {
          st.state = 'shaking';
          st.shakeTimer = 16;
        }
      } else if (st.state === 'shaking') {
        st.shakeTimer--;
        if (st.shakeTimer <= 0) {
          st.state = 'falling';
          st.vy = 1.5;
        }
      } else if (st.state === 'falling') {
        st.vy = Math.min(11, st.vy + 0.62);
        st.y += st.vy;

        if (player.intersects(st)) {
          st.state = 'fallen';
          st.respawnTimer = 200;
          const dead = player.takeDamage(1, true);
          updateHud();
          if (dead) {
            finishLevel(false);
            return;
          }
        } else if (st.y + st.h >= currentLevel.groundY) {
          st.state = 'fallen';
          st.respawnTimer = 200;
          particles.emitJumpDust(st.x + st.w / 2, currentLevel.groundY, false);
        }
      } else if (st.state === 'fallen') {
        st.respawnTimer--;
        if (st.respawnTimer <= 0) {
          st.state = 'idle';
          st.y = st.startY;
          st.vy = 0;
        }
      }
    }
  }

  // 4. Spygliai
  for (const sk of currentLevel.spikes) {
    if (player.intersects(sk)) {
      player.vy = -9.2;
      const dead = player.takeDamage(1, false);
      updateHud();
      if (dead) {
        finishLevel(false);
        return;
      }
    }
  }

  // 5. Monetos ir Magnetas
  const pCenterX = player.x + player.width / 2;
  const pCenterY = player.y + player.height / 2;
  const magRadius = player.bonuses.magnetRadius;

  for (const coin of currentLevel.coins) {
    if (coin.collected) continue;
    const dx = pCenterX - coin.x;
    const dy = pCenterY - coin.y;
    const dist = Math.hypot(dx, dy);

    if (dist < magRadius) {
      coin.x += (dx / (dist || 1)) * 6.5;
      coin.y += (dy / (dist || 1)) * 6.5;
    }

    if (dist < 28) {
      coin.collected = true;
      const coinMult = player.bonuses.coinFindMult || 1;
      const gainedCoins = coinMult > 1 ? Math.max(coin.value + 1, Math.round(coin.value * coinMult)) : coin.value;
      profile.coins += gainedCoins;
      profile.stats.coinsCollected += gainedCoins;
      levelSession.coinsEarned += gainedCoins;
      audio.coin();
      particles.emitCoinSparkle(coin.x, coin.y);
      particles.addFloatingText(coin.x, coin.y - 10, `+${gainedCoins} 🪙`, '#fde047', 16);
      saveSystem.saveAll();
      updateHud();
    }
  }

  // 6. Kristalai
  for (const cr of currentLevel.crystals) {
    if (cr.collected) continue;
    const dist = Math.hypot(pCenterX - cr.x, pCenterY - cr.y);
    if (dist < 30) {
      cr.collected = true;
      profile.crystals += 1;
      levelSession.crystalsEarned += 1;
      audio.crystal();
      particles.emitCrystalBurst(cr.x, cr.y);
      particles.addFloatingText(cr.x, cr.y - 12, '+1 💎 KRISTALAS!', '#38bdf8', 18);
      saveSystem.saveAll();
      updateHud();
    }
  }

  // 7. Herojaus iššautos strėlės iš lanko (Test Build 8: Parabolės fizika su vy ir gravitacija!)
  if (Array.isArray(currentLevel.playerArrows)) {
    for (let i = currentLevel.playerArrows.length - 1; i >= 0; i--) {
      const arr = currentLevel.playerArrows[i];
      if (!arr || !arr.active) {
        currentLevel.playerArrows.splice(i, 1);
        continue;
      }

      arr.lifeFrames = (typeof arr.lifeFrames === 'number' ? arr.lifeFrames : 180) - 1;
      arr.x += arr.vx || 0;
      arr.y += arr.vy || 0;
      arr.vy = (arr.vy || 0) + (arr.gravity || 0.28);

      // Patikriname, ar strėlė nukrito ant žemės ar platformos (arba pasiekė maksimalų nuotolį ~1/3–1/2 ekrano)
      let hitGround = arr.y + arr.h >= currentLevel.groundY;
      if (!hitGround && arr.vy > 0 && Array.isArray(currentLevel.platforms)) {
        for (const p of currentLevel.platforms) {
          if (!p || p.broken) continue;
          if (
            arr.x + arr.w > p.x &&
            arr.x < p.x + p.w &&
            arr.y + arr.h >= p.y &&
            arr.y <= p.y + p.h
          ) {
            hitGround = true;
            break;
          }
        }
      }

      const originX = typeof arr.startX === 'number' ? arr.startX : arr.x;
      const maxDist = typeof arr.maxDistance === 'number' ? arr.maxDistance : 330;
      const outOfBounds =
        arr.lifeFrames <= 0 ||
        arr.x < -120 ||
        arr.x > (currentLevel.width || 5000) + 120 ||
        arr.y > canvas.height + 120;

      if (hitGround || Math.abs(arr.x - originX) >= maxDist || outOfBounds) {
        arr.active = false;
        currentLevel.playerArrows.splice(i, 1);
        particles.emit(
          arr.x + arr.w / 2,
          Math.min(arr.y + arr.h, currentLevel.groundY),
          6,
          { colors: [arr.color || '#fde047', '#fde047', '#ffffff'], speedMin: 1.2, speedMax: 3.6, lifeMin: 14, lifeMax: 24 }
        );
        continue;
      }

      let hitTarget = false;
      for (const en of currentLevel.enemies) {
        if (!en.alive) continue;
        if (rectsOverlap(arr, en)) {
          arr.active = false;
          hitTarget = true;
          applyDamageToEnemy(en, arr.damage || 1, '🏹', profile);
          updateHud();
          break;
        }
      }

      if (hitTarget) {
        currentLevel.playerArrows.splice(i, 1);
        continue;
      }

      for (const enc of currentLevel.mathEncounters) {
        if (enc.resolved || enc.type !== 'boss') continue;
        if (rectsOverlap(arr, enc)) {
          arr.active = false;
          hitTarget = true;
          applyRealtimeDamageToBoss(enc, arr.damage || 1, '🏹', profile);
          updateHud();
          break;
        }
      }

      if (hitTarget) {
        currentLevel.playerArrows.splice(i, 1);
      }
    }
  }

  // 7B. NAUJAS GINKLO TIPAS: BUMERANGAS (Skrenda į priekį, sulėtėja, apsisuka ir grįžta pas herojų, kirsdamas kiaurai!)
  if (Array.isArray(currentLevel.playerBoomerangs) && currentLevel.playerBoomerangs.length > 0) {
    for (let i = currentLevel.playerBoomerangs.length - 1; i >= 0; i--) {
      const bm = currentLevel.playerBoomerangs[i];
      if (!bm || !bm.active) {
        currentLevel.playerBoomerangs.splice(i, 1);
        continue;
      }

      bm.lifeFrames = (typeof bm.lifeFrames === 'number' ? bm.lifeFrames : 360) - 1;
      bm.spinAngle = (bm.spinAngle || 0) + 0.38;

      if (bm.phase === 'outbound') {
        const stepX = bm.vx || 0;
        bm.x += stepX;
        bm.traveled = (bm.traveled || 0) + Math.abs(stepX);
        const originX = typeof bm.startX === 'number' ? bm.startX : bm.x;
        const distFromStart = Math.max(bm.traveled, Math.abs(bm.x - originX));
        const maxDist = typeof bm.maxDistance === 'number' ? bm.maxDistance : 450;

        // Pasiekus >55% nuotolio, vx greitis pradeda mažėti, kol pasidaro neigiamas ir pradeda skristi atgal
        if (distFromStart >= maxDist * 0.55) {
          bm.vx -= (bm.dir || 1) * 0.52;
        }
        if (
          distFromStart >= maxDist ||
          (bm.dir === 1 && bm.vx <= 0) ||
          (bm.dir === -1 && bm.vx >= 0)
        ) {
          bm.phase = 'returning';
        }
      } else {
        // Bumerangas skrenda atgal ir seka herojų iš paskos, kol paliečia herojaus hitbox'ą!
        const targetX = player.x + player.width / 2 - bm.w / 2;
        const targetY = player.y + player.height / 2 - bm.h / 2;
        const dx = targetX - bm.x;
        const dy = targetY - bm.y;
        const dist = Math.hypot(dx, dy) || 1;
        const returnSpeed = (bm.maxSpeed || bm.speed || 9.8) * 1.15;

        bm.vx = (dx / dist) * returnSpeed;
        bm.vy = (dy / dist) * returnSpeed;
        bm.x += bm.vx;
        bm.y += bm.vy;

        // Pagautas herojaus hitbox'o (arba baigėsi saugumo laikmatis)!
        if (
          dist < 28 ||
          bm.lifeFrames <= 0 ||
          rectsOverlap(bm, { x: player.x, y: player.y, w: player.width, h: player.height })
        ) {
          bm.active = false;
          currentLevel.playerBoomerangs.splice(i, 1);
          player.boomerangInFlight = currentLevel.playerBoomerangs.length > 0;
          updateHud();
          continue;
        }
      }

      // Kovos pranašumas: Bumerangas eina kiaurai priešus ir gali kirsti tam pačiam priešui DU KARTUS (į priekį IR grįžtant)!
      const hitSet = bm.phase === 'outbound' ? bm.hitForwardIds : bm.hitReturnIds;
      const hitIcon = bm.phase === 'outbound' ? '🪃' : '🪃↩️';

      for (let eIdx = 0; eIdx < currentLevel.enemies.length; eIdx++) {
        const en = currentLevel.enemies[eIdx];
        if (!en.alive) continue;
        const enemyKey = `en_${eIdx}`;
        if (!hitSet.has(enemyKey) && rectsOverlap(bm, en)) {
          hitSet.add(enemyKey);
          applyDamageToEnemy(en, bm.damage || 1, hitIcon, profile);
          updateHud();
        }
      }

      for (const enc of currentLevel.mathEncounters) {
        if (enc.resolved || enc.type !== 'boss') continue;
        const bossKey = `boss_${enc.id}`;
        if (!hitSet.has(bossKey) && rectsOverlap(bm, enc)) {
          hitSet.add(bossKey);
          applyRealtimeDamageToBoss(enc, bm.damage || 1, hitIcon, profile);
          updateHud();
        }
      }
    }
  } else if (player.boomerangInFlight) {
    player.boomerangInFlight = false;
    updateHud();
  }

  // 8. Priešai (Visų 5 pasaulių antžeminiai, skraidantys ir šaudantys priešai)
  for (const en of currentLevel.enemies) {
    if (!en.alive) continue;
    if (en.hitFlashTimer > 0) en.hitFlashTimer--;

    if (
      en.kind === 'goblin' ||
      en.kind === 'elite_knight' ||
      en.kind === 'rock_golem' ||
      en.kind === 'penguin' ||
      en.kind === 'fire_elemental' ||
      en.kind === 'alien'
    ) {
      en.x += en.vx;
      if (en.x < en.minX || en.x > en.maxX) en.vx *= -1;
    } else if (en.kind === 'slime') {
      en.x += en.vx;
      if (en.x < en.minX || en.x > en.maxX) en.vx *= -1;
      en.jumpTimer--;
      if (en.jumpTimer <= 0 && en.y >= en.groundY) {
        en.vy = -10.6;
        en.jumpTimer = 75;
      }
      en.y += en.vy;
      en.vy += 0.48;
      if (en.y >= en.groundY) {
        en.y = en.groundY;
        en.vy = 0;
      }
    } else if (en.kind === 'bat' || en.kind === 'flying_demon' || en.kind === 'ufo') {
      en.x += en.vx;
      if (en.x < en.minX || en.x > en.maxX) en.vx *= -1;
      en.phase += en.kind === 'ufo' ? 0.08 : 0.06;
      en.y = en.baseY + Math.sin(en.phase) * (en.kind === 'ufo' ? 28 : 38);
    } else if (en.kind === 'archer' || en.kind === 'snowman') {
      en.shootTimer--;
      if (en.shootTimer <= 0 && Math.abs(en.x - player.x) < 560) {
        en.shootTimer = en.shootCooldown;
        const dir = player.x < en.x ? -1 : 1;
        const shotY = en.nextHighShot ? en.y + 6 : en.y + 28;
        en.nextHighShot = !en.nextHighShot;
        currentLevel.projectiles.push({
          x: en.x + (dir === 1 ? en.w : -16),
          y: shotY,
          w: en.kind === 'snowman' ? 16 : 22,
          h: en.kind === 'snowman' ? 16 : 8,
          vx: dir * (en.kind === 'snowman' ? 4.8 : 5.0),
          highShot: !en.nextHighShot,
          projectileStyle: en.projectileStyle || 'arrow',
          active: true
        });
      }
    }

    if (player.intersects(en)) {
      const stomping = player.vy > 0 && player.y + player.height - player.vy <= en.y + 20;
      if (stomping) {
        player.vy = -10.5;
        applyDamageToEnemy(en, 1, '👟', profile);
        updateHud();
      } else {
        const dead = player.takeDamage(1, true);
        updateHud();
        if (dead) {
          finishLevel(false);
          return;
        }
      }
    }
  }

  // 8B. AUGINTINIŲ MAGIJOS LYGIO METU (Test Build 7):
  // - Drakoniukas (Kovinis): kas X s iššauna ugnies kamuolį į arčiausiai esantį priešą (-1 HP)
  player.tryPetDragonAttack(currentLevel.enemies, (en, dmg) => {
    applyDamageToEnemy(en, dmg, '🐉🔥', profile);
    updateHud();
  });

  // - Feniksas (Gydantis): kas 30 s (arba greičiau pagal lygį) pasyviai atstato +1 prarastą širdelę
  if (player.tryPetPhoenixHeal(false)) {
    updateHud();
  }

  // 9. Priešų strėlės / Sviediniai (Dronas / Skydas automatiškai numuša ir ištrina strėlę!)
  for (let i = currentLevel.projectiles.length - 1; i >= 0; i--) {
    const proj = currentLevel.projectiles[i];
    if (!proj.active) {
      currentLevel.projectiles.splice(i, 1);
      continue;
    }
    proj.x += proj.vx;
    if (proj.vy) {
      proj.y += proj.vy;
    }

    if (Math.abs(proj.x - player.x) > 900) {
      currentLevel.projectiles.splice(i, 1);
      continue;
    }

    // Kai priešo strėlė priartėja per 260 px prie herojaus, o augintinio įgūdis paruoštas –
    // augintinis automatiškai išleidžia ugnies kamuolį/lazerį, o pati strėlė IŠTRINAMA iš masyvo dar nepasiekusi herojaus!
    const distToHeroX = Math.abs((proj.x + proj.w / 2) - (player.x + player.width / 2));
    const distToHeroY = Math.abs((proj.y + proj.h / 2) - (player.y + player.height / 2));
    if (distToHeroX < 260 && distToHeroY < 120) {
      if (player.tryPetInterceptProjectile(proj)) {
        proj.active = false;
        currentLevel.projectiles.splice(i, 1);
        saveSystem.saveAll();
        updateHud();
        continue;
      }
    }

    if (player.intersects(proj)) {
      proj.active = false;
      currentLevel.projectiles.splice(i, 1);
      if (player.tryBlockProjectile(proj)) {
        saveSystem.saveAll();
        updateHud();
      } else {
        const dead = player.takeDamage(1, true);
        updateHud();
        if (dead) {
          finishLevel(false);
          return;
        }
      }
    }
  }

  // 10. Matematiniai susitikimai ir Daugiapakopiai Pasaulių Bosai (Multi-Phase World Bosses)
  for (const enc of currentLevel.mathEncounters) {
    if (enc.resolved) continue;
    if (enc.hitFlashTimer > 0) enc.hitFlashTimer--;

    // Jei tai Bosas – jis turi kelias atakos fazes: patruliuoja, šokinėja ir šaudo sviedinius!
    if (enc.type === 'boss') {
      if (typeof enc.vx === 'number') {
        const enragedMult = enc.hp < enc.maxHp * 0.5 ? 1.45 : 1.0;
        enc.x += enc.vx * enragedMult;
        if (enc.x < (enc.minX || 200) || enc.x > (enc.maxX || currentLevel.width - 200)) {
          enc.vx *= -1;
        }
      }
      if (typeof enc.jumpTimer === 'number') {
        enc.jumpTimer--;
        if (enc.jumpTimer <= 0 && enc.y >= (enc.baseY || currentLevel.groundY - 78)) {
          enc.vy = -10.8;
          enc.jumpTimer = enc.hp < enc.maxHp * 0.5 ? 85 : 130;
        }
        enc.y += enc.vy || 0;
        enc.vy = (enc.vy || 0) + 0.45;
        if (enc.y >= (enc.baseY || currentLevel.groundY - 78)) {
          enc.y = enc.baseY || currentLevel.groundY - 78;
          enc.vy = 0;
        }
      }
      if (typeof enc.shootTimer === 'number') {
        enc.shootTimer--;
        if (enc.shootTimer <= 0 && Math.abs(enc.x - player.x) < 640) {
          enc.shootTimer = enc.hp < enc.maxHp * 0.5 ? Math.max(48, Math.round(enc.shootCooldown * 0.65)) : enc.shootCooldown;
          const dir = player.x < enc.x ? -1 : 1;
          currentLevel.projectiles.push({
            x: enc.x + (dir === 1 ? enc.w : -20),
            y: enc.y + 34,
            w: 20,
            h: 14,
            vx: dir * 5.6,
            highShot: false,
            projectileStyle: 'boss_orb',
            color: currentLevel.world.bossProjectileColor || '#f43f5e',
            active: true
          });
        }
      }
    }

    if (player.intersects(enc)) {
      openMathDuel(enc);
      return;
    }
  }

  // 10B. SLAPTO KAMBARIO ĮĖJIMAS (18% šansas lygyje, be jokios matematikos ar spynos!)
  if (
    currentLevel.secretBonusEntrance &&
    !currentLevel.secretBonusEntrance.used &&
    player.teleportCooldown <= 0
  ) {
    const ent = currentLevel.secretBonusEntrance;
    if (ent.requiresDown) {
      // Senovinis šulinys / vamzdis: užlipus ant jo ir paspaudus ŽEMYN (⬇️ / S) herojus įlenda į vidų!
      if (player.intersects(ent) && input.down) {
        enterSecretBonusRoom(ent);
        return;
      }
    } else if (player.intersects(ent)) {
      // Aukšta arka arba slaptos durys už netikros sienos: palietus iškart įeinama!
      enterSecretBonusRoom(ent);
      return;
    }
  }

  // 11. Finišo portalas
  if (player.intersects(currentLevel.finishPortal)) {
    const blocker = currentLevel.mathEncounters.find(
      (e) => (e.type === 'boss' || e.type === 'gate') && !e.resolved
    );
    if (!blocker) {
      finishLevel(true);
      return;
    }
  }

  const targetCamX = Math.max(0, Math.min(currentLevel.width - canvas.width, player.x - canvas.width * 0.35));
  cameraX += (targetCamX - cameraX) * 0.14;

  particles.update();
}

// ==================== 5. KELIŲ UŽDUOČIŲ SERIJOS (CHAINED MATH BATTLES) ====================
function openMathDuel(encounter) {
  isWorldPaused = true;
  gameState = 'MATH_DUEL';

  input.left = false;
  input.right = false;
  input.jump = false;
  input.down = false;
  input.shoot = false;

  if (player) {
    player.vx = 0;
    player.vy = 0;
    player.invincibleTimer = 120;
  }
  if (currentLevel) {
    currentLevel.projectiles = [];
  }

  audio.mathOpen();

  activeDuel.encounter = encounter;
  activeDuel.mistakesOnCurrent = 0;
  activeDuel.chainCurrent = 0;

  // 1 PUNKTAS: Kelių užduočių serija (Math Chain):
  // - Paprasta skrynia / Durys: 2–3 užduotys iš eilės
  // - Bosas / Proto Žvaigždė: 4–5 užduotys iš eilės
  if (encounter.type === 'boss' || encounter.type === 'brain_star') {
    activeDuel.chainTotal = Math.random() < 0.5 ? 4 : 5;
  } else {
    activeDuel.chainTotal = Math.random() < 0.5 ? 2 : 3;
  }

  nextDuelQuestion();
  modalMath.classList.remove('hidden');
}

const celebrationParticles = [];
let celebrationRafId = null;

function triggerCelebrationBurst(originEl = null) {
  const celCanvas = document.getElementById('math-celebration-canvas');
  if (!celCanvas) return;
  const ctxCel = celCanvas.getContext('2d');
  if (!ctxCel) return;

  if (celCanvas.width !== window.innerWidth || celCanvas.height !== window.innerHeight) {
    celCanvas.width = window.innerWidth;
    celCanvas.height = window.innerHeight;
  }

  let originX = window.innerWidth * 0.5;
  let originY = window.innerHeight * 0.45;
  if (originEl && typeof originEl.getBoundingClientRect === 'function') {
    const rect = originEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      originX = rect.left + rect.width * 0.5;
      originY = rect.top + rect.height * 0.5;
    }
  }

  const palette = ['#fde047', '#38bdf8', '#4ade80', '#f472b6', '#a855f7', '#ffffff'];
  for (let i = 0; i < 34; i++) {
    const angle = (Math.PI * 2 * i) / 34 + (Math.random() - 0.5) * 0.35;
    const speed = 3 + Math.random() * 6.5;
    celebrationParticles.push({
      x: originX + (Math.random() - 0.5) * 24,
      y: originY + (Math.random() - 0.5) * 18,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.6,
      size: 4 + Math.random() * 5.5,
      color: palette[Math.floor(Math.random() * palette.length)],
      life: 36 + Math.floor(Math.random() * 20),
      maxLife: 56,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.28,
      isStar: i % 2 === 0
    });
  }

  if (celebrationRafId !== null) return;
  const step = () => {
    ctxCel.clearRect(0, 0, celCanvas.width, celCanvas.height);
    for (let i = celebrationParticles.length - 1; i >= 0; i--) {
      const p = celebrationParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.vx *= 0.98;
      p.rot += p.vRot;
      p.life--;
      if (p.life <= 0) {
        celebrationParticles.splice(i, 1);
        continue;
      }
      const alpha = Math.max(0, Math.min(1, p.life / (p.maxLife * 0.6)));
      ctxCel.save();
      ctxCel.globalAlpha = alpha;
      ctxCel.translate(p.x, p.y);
      ctxCel.rotate(p.rot);
      ctxCel.fillStyle = p.color;
      if (p.isStar) {
        ctxCel.beginPath();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          ctxCel.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
          ctxCel.lineTo(Math.cos(a + Math.PI / 4) * (p.size * 0.42), Math.sin(a + Math.PI / 4) * (p.size * 0.42));
        }
        ctxCel.closePath();
        ctxCel.fill();
      } else {
        ctxCel.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.6);
      }
      ctxCel.restore();
    }

    if (celebrationParticles.length > 0) {
      celebrationRafId = requestAnimationFrame(step);
    } else {
      ctxCel.clearRect(0, 0, celCanvas.width, celCanvas.height);
      celebrationRafId = null;
    }
  };
  celebrationRafId = requestAnimationFrame(step);
}

function updateChainProgressUI() {
  const chainTextEl = document.getElementById('math-chain-text');
  const chainDotsEl = document.getElementById('math-chain-dots');
  const chainBarFillEl = document.getElementById('math-chain-bar-fill');
  if (!chainTextEl || !chainDotsEl) return;

  chainTextEl.textContent = `⛓️ Užduočių serija: ${activeDuel.chainCurrent} / ${activeDuel.chainTotal} įveikta!`;

  if (chainBarFillEl) {
    const pct = Math.min(100, Math.round((activeDuel.chainCurrent / Math.max(1, activeDuel.chainTotal)) * 100));
    chainBarFillEl.style.width = `${pct}%`;
  }

  let dotsHtml = '';
  for (let i = 0; i < activeDuel.chainTotal; i++) {
    if (i < activeDuel.chainCurrent) {
      dotsHtml += '<span>✅</span>';
    } else if (i === activeDuel.chainCurrent) {
      dotsHtml += '<span>🟡</span>';
    } else {
      dotsHtml += '<span style="opacity:0.45">⚪</span>';
    }
  }
  chainDotsEl.innerHTML = dotsHtml;
}

function nextDuelQuestion() {
  const profile = saveSystem.getActiveProfile();
  const enc = activeDuel.encounter;
  const fixedGrade = profile.slotIndex === 0 ? 1 : 3;
  const q = mathEngine.generateQuestion(fixedGrade, currentLevel.levelId, enc.type);
  activeDuel.question = q;

  updateChainProgressUI();

  const heroTitle = profile.slotIndex === 0 ? 'Linas (1 Klasė)' : 'Lukas (3 Klasė)';
  document.getElementById('math-enemy-icon').textContent = enc.icon;
  document.getElementById('math-enemy-name').textContent = enc.type === 'brain_star'
    ? `🌟 PROTO ŽVAIGŽDĖ (${heroTitle})`
    : `${enc.name} – ${heroTitle}`;

  const bossHpEl = document.getElementById('math-boss-hp');
  if (enc.type === 'boss') {
    bossHpEl.classList.remove('hidden');
    bossHpEl.innerHTML = `<strong style="color:#fca5a5">Boso HP: ${enc.hp} / ${enc.maxHp} ❤️</strong> (Įveik seriją ir gauk 100% Seto daiktą!)`;
  } else {
    bossHpEl.classList.add('hidden');
  }

  const streak = profile.stats.currentStreak || 0;
  document.getElementById('math-combo-badge').textContent = `🔥 Serija: ${streak} (x${getComboMultiplier(streak)})`;

  const helperBtn = document.getElementById('btn-math-helper');
  document.getElementById('math-helper-count').textContent = player.helperCharges;
  helperBtn.disabled = player.helperCharges <= 0 || q.options.length <= 2;

  document.getElementById('math-subtitle').textContent = q.subtitle || 'Išspręsk uždavinį!';
  document.getElementById('math-prompt').textContent = q.prompt;

  renderVisualAid(q.visualAid);

  document.getElementById('math-hint-box').classList.add('hidden');
  document.getElementById('keypad-input').value = '';

  renderMathOptions(q);
}

// ==================== 32 MATEMATIKOS ŠABLONŲ VIZUALIZACIJA (SVG LAIKRODŽIAI, PICOS TRUPMENOS, FIGŪROS, 3x3 KVADRATAI) ====================
function renderVisualAid(aid) {
  const aidEl = document.getElementById('math-visual-aid');
  if (!aid) {
    aidEl.classList.add('hidden');
    aidEl.innerHTML = '';
    return;
  }

  aidEl.classList.remove('hidden');

  if (aid.type === 'dots') {
    if (aid.op === '+') {
      aidEl.innerHTML = `<div style="font-size:1.5rem;letter-spacing:4px">${'🟢'.repeat(aid.a)} <strong style="color:#fff">+</strong> ${'🔵'.repeat(aid.b)}</div>`;
    } else {
      aidEl.innerHTML = `<div style="font-size:1.5rem;letter-spacing:4px">${'🍏'.repeat(aid.a - aid.b)}${'❌'.repeat(aid.b)}</div>`;
    }
  } else if (aid.type === 'shape_svg') {
    let svgShape = '';
    if (aid.shape === 'triangle') {
      svgShape = `<polygon points="60,12 110,98 10,98" fill="#f59e0b" stroke="#fde047" stroke-width="4" />`;
    } else if (aid.shape === 'square') {
      svgShape = `<rect x="20" y="15" width="80" height="80" fill="#3b82f6" stroke="#93c5fd" stroke-width="4" />`;
    } else if (aid.shape === 'rectangle') {
      svgShape = `<rect x="10" y="25" width="100" height="60" fill="#10b981" stroke="#6ee7b7" stroke-width="4" />`;
    } else if (aid.shape === 'pentagon') {
      svgShape = `<polygon points="60,10 108,44 90,98 30,98 12,44" fill="#a855f7" stroke="#e9d5ff" stroke-width="4" />`;
    } else if (aid.shape === 'hexagon') {
      svgShape = `<polygon points="60,10 104,32 104,78 60,100 16,78 16,32" fill="#ec4899" stroke="#fbcfe8" stroke-width="4" />`;
    } else {
      svgShape = `<circle cx="60" cy="55" r="42" fill="#ef4444" stroke="#fca5a5" stroke-width="4" />`;
    }
    aidEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
        <svg width="120" height="110" viewBox="0 0 120 110">${svgShape}</svg>
      </div>
    `;
  } else if (aid.type === 'emoji_row') {
    const cards = (aid.items || []).map((ic) => `<span class="emoji-aid-card">${ic}</span>`).join('');
    aidEl.innerHTML = `<div class="emoji-aid-row">${cards}</div>`;
  } else if (aid.type === 'clock_svg') {
    const h = aid.hours % 12;
    const m = aid.minutes || 0;
    const minAngle = (m / 60) * 360 - 90;
    const hourAngle = ((h + m / 60) / 12) * 360 - 90;
    const hx = 60 + Math.cos((hourAngle * Math.PI) / 180) * 26;
    const hy = 60 + Math.sin((hourAngle * Math.PI) / 180) * 26;
    const mx = 60 + Math.cos((minAngle * Math.PI) / 180) * 38;
    const my = 60 + Math.sin((minAngle * Math.PI) / 180) * 38;

    aidEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:16px">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="#0f172a" stroke="#38bdf8" stroke-width="4" />
          <text x="60" y="22" fill="#fde047" font-size="12" font-weight="900" text-anchor="middle">12</text>
          <text x="100" y="64" fill="#fde047" font-size="12" font-weight="900" text-anchor="middle">3</text>
          <text x="60" y="106" fill="#fde047" font-size="12" font-weight="900" text-anchor="middle">6</text>
          <text x="20" y="64" fill="#fde047" font-size="12" font-weight="900" text-anchor="middle">9</text>
          <line x1="60" y1="60" x2="${mx}" y2="${my}" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
          <line x1="60" y1="60" x2="${hx}" y2="${hy}" stroke="#ef4444" stroke-width="5" stroke-linecap="round" />
          <circle cx="60" cy="60" r="4" fill="#fde047" />
        </svg>
        ${aid.digital ? `<div class="mystery-box" style="font-size:1.3rem">🕒 ${aid.digital}</div>` : ''}
      </div>
    `;
  } else if (aid.type === 'compare_box') {
    aidEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:14px;font-size:1.35rem;font-weight:900">
        <div class="scale-pan">${aid.left}</div>
        <div class="mystery-box">🐊 ?</div>
        <div class="scale-pan">${aid.right}</div>
      </div>
    `;
  } else if (aid.type === 'fraction_pie') {
    const denom = aid.denom || 4;
    const num = aid.num || 1;
    const r = 48;
    const cx = 60;
    const cy = 60;
    let paths = '';
    for (let i = 0; i < denom; i++) {
      const startAngle = (i * 2 * Math.PI) / denom - Math.PI / 2;
      const endAngle = ((i + 1) * 2 * Math.PI) / denom - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const fill = i < num ? '#f97316' : '#1e293b';
      paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z" fill="${fill}" stroke="#fde047" stroke-width="2.5" />`;
    }
    aidEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:14px">
        <svg width="120" height="120" viewBox="0 0 120 120">${paths}</svg>
        <div style="text-align:left;font-size:0.9rem;color:#cbd5e1">
          <div>🍕 Nuspalvinta: <strong style="color:#f97316">${num}</strong></div>
          <div>🍕 Iš viso dalių: <strong style="color:#fde047">${denom}</strong></div>
        </div>
      </div>
    `;
  } else if (aid.type === 'magic_square') {
    const cellsHtml = aid.grid.flat().map((val) =>
      `<div class="magic-cell ${val === '?' ? 'mystery' : ''}">${val}</div>`
    ).join('');
    aidEl.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div class="magic-square-grid">${cellsHtml}</div>
        <small style="color:#93c5fd">Eilutės ir stulpelio suma = <strong>${aid.targetSum}</strong></small>
      </div>
    `;
  } else if (aid.type === 'scales') {
    aidEl.innerHTML = `
      <div class="scales-widget">
        <div class="scales-beam">
          <div class="scale-pan">🏋️ <span>${aid.leftText}</span></div>
          <div style="font-size:1.5rem">⚖️</div>
          <div class="scale-pan">
            <span>${aid.rightKnown}</span> + <span class="mystery-box">📦 ${aid.rightBox}</span>
          </div>
        </div>
        <small style="color:#93c5fd">Abi svarstyklių lėkštės sveria po lygiai!</small>
      </div>
    `;
  } else if (aid.type === 'coins') {
    const coinsHtml = aid.coins.map((c) => `<div class="euro-coin">${c}€</div>`).join('<span style="font-weight:900">+</span>');
    aidEl.innerHTML = `
      <div class="coins-widget">
        ${coinsHtml}
        <span style="margin:0 10px;font-weight:900;color:#fca5a5">➔ Pirkinys: -${aid.itemCost}€</span>
      </div>
    `;
  } else if (aid.type === 'sequence') {
    const seqHtml = aid.items
      .map((item) => `<div class="seq-node ${item === '?' ? 'mystery' : ''}">${item}</div>`)
      .join('<span>➔</span>');
    aidEl.innerHTML = `<div class="seq-widget">${seqHtml}</div>`;
  } else if (aid.type === 'rectangle') {
    aidEl.innerHTML = `
      <div class="rect-widget">
        <strong style="color:#fde047">${aid.widthLabel}</strong>
        <div style="display:flex;align-items:center;gap:8px">
          <strong style="color:#fde047">${aid.heightLabel}</strong>
          <div class="rect-box">${aid.insideText || 'Pilies kiemas'}</div>
          <strong style="color:#fde047">${aid.heightLabel}</strong>
        </div>
        <strong style="color:#fde047">${aid.widthLabel}</strong>
      </div>
    `;
  } else {
    aidEl.classList.add('hidden');
  }
}

function renderMathOptions(q) {
  const optionsGrid = document.getElementById('math-options');
  optionsGrid.innerHTML = '';

  q.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'math-option-btn';
    btn.textContent = opt;
    btn.dataset.val = opt;
    btn.addEventListener('click', () => handleMathAnswer(opt, btn));
    optionsGrid.appendChild(btn);
  });
}

function handleMathAnswer(selectedValue, buttonEl = null) {
  const profile = saveSystem.getActiveProfile();
  const q = activeDuel.question;
  const enc = activeDuel.encounter;

  if (String(selectedValue).trim() === String(q.answer).trim()) {
    // TEISINGAS ATSAKYMAS SERIJOJE!
    profile.stats.totalSolved++;
    profile.stats.currentStreak = (profile.stats.currentStreak || 0) + 1;
    if (profile.stats.currentStreak > profile.stats.maxStreak) {
      profile.stats.maxStreak = profile.stats.currentStreak;
    }
    profile.dailyChallenge.solvedToday = (profile.dailyChallenge.solvedToday || 0) + 1;
    levelSession.solvedCount++;

    activeDuel.chainCurrent++;
    audio.correct(profile.stats.currentStreak);
    triggerCelebrationBurst(buttonEl || document.getElementById('math-prompt'));
    const duelCardEl = document.querySelector('#modal-math .math-duel-card');
    if (duelCardEl) {
      duelCardEl.classList.remove('duel-correct-pulse');
      void duelCardEl.offsetWidth;
      duelCardEl.classList.add('duel-correct-pulse');
    }

    // Jei pasirinktas Feniksas – skaičiuoja išspręstas užduotis (kas 3 užduotis atstato +1 prarastą ❤️)!
    if (player && player.tryPetPhoenixHeal(true)) {
      updateHud();
    }

    if (enc.type === 'boss') {
      const stepDmg = Math.max(3, Math.ceil(enc.maxHp / activeDuel.chainTotal));
      enc.hp = Math.max(activeDuel.chainCurrent < activeDuel.chainTotal ? 1 : 0, enc.hp - stepDmg);
    }

    // Jei serijoje dar liko užduočių – iškart rodome kitą užduotį ir atnaujiname serijos skaitiklį (pvz. „1/3 įveikta!“)!
    if (activeDuel.chainCurrent < activeDuel.chainTotal) {
      saveSystem.saveAll();
      updateHud();
      nextDuelQuestion();
      return;
    }

    // VISA UŽDUOČIŲ SERIJA SĖKMINGAI ĮVEIKTA!
    enc.resolved = true;
    if (enc.type === 'boss') {
      enc.hp = 0;
      profile.stats.bossesDefeated++;
    }

    const comboMult = getComboMultiplier(profile.stats.currentStreak);
    const goldEarned = Math.round(enc.rewardCoins * player.bonuses.mathGoldMult * comboMult);
    profile.coins += goldEarned;
    levelSession.coinsEarned += goldEarned;

    if (enc.rewardCrystals > 0) {
      profile.crystals += enc.rewardCrystals;
      levelSession.crystalsEarned += enc.rewardCrystals;
    }

    particles.emitCoinSparkle(enc.x + enc.w / 2, enc.y + enc.h / 2);
    particles.addFloatingText(
      enc.x + enc.w / 2,
      enc.y - 12,
      `+${goldEarned} 🪙 ${enc.rewardCrystals > 0 ? `+${enc.rewardCrystals} 💎` : ''}`,
      '#fde047',
      20
    );

    if (player) {
      player.invincibleTimer = 120;
    }

    saveSystem.saveAll();
    modalMath.classList.add('hidden');

    // 5 PUNKTAS (Test Build 8): RETESNIS LOOT'AS (18% šansas iš paprastų skrynių/durų) IR AUTOMATINIS DUBLIKATŲ PARDAVIMAS (AUTO-SELL)!
    // - Nugalėjus Bosą: 100% šansas gauti Epišką / Set daiktą!
    if (enc.type === 'boss') {
      awardBossExclusiveSetLoot(profile, enc.name);
      return;
    }
    // - Įveikus „Proto Žvaigždę“: 100% gaunamas Geras „Loot“ daiktas!
    if (enc.type === 'brain_star') {
      awardBrainStarLoot(profile);
      return;
    }
    // - Išsprendus paprastą Skrynią arba Duris: 18% (15–20%) šansas rasti „Loot“ daiktą!
    //   Likusias ~82% skrynių iškrenta papildomas gausus monetų ir kristalų lobis!
    if (enc.type === 'chest' || enc.type === 'gate') {
      if (Math.random() < 0.18) {
        awardChestOrGateLoot(profile, enc.name);
        return;
      } else {
        const extraCoins = Math.round((35 + currentLevel.levelId * 8) * player.bonuses.mathGoldMult * comboMult);
        const extraCrystals = Math.random() < 0.45 ? (Math.random() < 0.3 ? 2 : 1) : 0;
        profile.coins += extraCoins;
        levelSession.coinsEarned += extraCoins;
        if (extraCrystals > 0) {
          profile.crystals += extraCrystals;
          levelSession.crystalsEarned += extraCrystals;
          audio.crystal();
        }
        saveSystem.saveAll();
        particles.addFloatingText(
          enc.x + enc.w / 2,
          enc.y - 34,
          `💰 LOBIS: +${extraCoins} 🪙 ${extraCrystals > 0 ? `+${extraCrystals} 💎` : ''}`,
          '#4ade80',
          19
        );
      }
    }

    isWorldPaused = false;
    gameState = 'PLAYING';
    updateHud();
  } else {
    // 2 PUNKTAS (Test Build 7): VIENKARTINĖS UŽDUOTYS (NO RETRIES)!
    // Jei žaidėjas bet kokioje užduotyje (durys, skrynia, Proto Žvaigždė, Bosas) atsako neteisingai
    // arba neišsprendžia serijos – objektas iškart tampa NEAKTYVUS (pajuoduoja / sudūžta / dingsta)
    // visam likusiam lygio laikui! Žaidėjas gauna bausmę (-1 ❤️) ir TURI eiti toliau be jokio prizo!
    audio.brainStarFail();
    profile.stats.totalMistakes++;
    profile.stats.currentStreak = 0;
    levelSession.mistakesInLevel++;

    modalMath.classList.add('hidden');

    enc.resolved = true;
    enc.failed = true;

    particles.emit(enc.x + enc.w / 2, enc.y + enc.h / 2, 28, {
      colors: ['#ef4444', '#f97316', '#334155', '#0f172a']
    });

    if (enc.type === 'brain_star') {
      particles.addFloatingText(
        enc.x + enc.w / 2,
        enc.y - 16,
        '💥 PROTO ŽVAIGŽDĖ SPROGO! -1 ❤️',
        '#ef4444',
        21
      );
    } else {
      particles.addFloatingText(
        enc.x + enc.w / 2,
        enc.y - 18,
        `💥 ${enc.name.toUpperCase()} SUDUŽO! BE PRIZO (-1 ❤️)`,
        '#ef4444',
        20
      );
    }

    const dead = player.takeDamage(1, false, true);
    saveSystem.saveAll();
    updateHud();

    if (dead) {
      finishLevel(false);
      return;
    }

    isWorldPaused = false;
    gameState = 'PLAYING';
  }
}

function appendKeypadDigit(digit) {
  const inp = document.getElementById('keypad-input');
  if (inp.value.length < 6) inp.value += digit;
}

function clearKeypadDigit() {
  const inp = document.getElementById('keypad-input');
  inp.value = inp.value.slice(0, -1);
}

function submitKeypadAnswer() {
  const inp = document.getElementById('keypad-input');
  if (inp.value.trim() !== '') {
    handleMathAnswer(inp.value.trim());
    inp.value = '';
  }
}

// ==================== 5 PUNKTAS (Test Build 8): LOOT IR AUTOMATINIS DUBLIKATŲ PARDAVIMAS (AUTO-SELL) ====================
function handleLootItemDropWithAutoSell(profile, item, titleWhenNew, descWhenNew) {
  document.getElementById('loot-icon').innerHTML = getItemSvgIcon(item, 64);

  // Patikriname, ar žaidėjas JAU TURI šį daiktą savo inventoriuje (ant herojaus arba kuprinėje)
  if (hasItemInInventory(profile, item.id)) {
    const sellValue = getSellPrice(item);
    profile.coins += sellValue;
    levelSession.coinsEarned += sellValue;
    saveSystem.saveAll();
    audio.sellItem();

    if (player) {
      particles.addFloatingText(
        player.x + player.w / 2,
        player.y - 24,
        `🪙 Dublikatas parduotas: +${sellValue} 🪙!`,
        '#fde047',
        19
      );
    }

    document.getElementById('loot-title').textContent = `🪙 Automatinis Pardavimas (+${sellValue} 🪙)!`;
    document.getElementById('loot-desc').textContent =
      `Tu jau turi [${item.name}]! Jis automatiškai parduotas už ${sellValue} monetų!`;
    updateHud();
    modalLoot.classList.remove('hidden');
    return;
  }

  const addedToBp = addItemToBackpack(profile, item.id);
  if (addedToBp) {
    saveSystem.saveAll();
    audio.levelWin();
    document.getElementById('loot-title').textContent = titleWhenNew;
    document.getElementById('loot-desc').textContent = descWhenNew;
  } else {
    const sellValue = getSellPrice(item);
    profile.coins += sellValue;
    levelSession.coinsEarned += sellValue;
    saveSystem.saveAll();
    audio.sellItem();
    document.getElementById('loot-title').textContent = `🎒 Kuprinė pilna (+${sellValue} 🪙)!`;
    document.getElementById('loot-desc').textContent =
      `Iškrito [${item.name}], bet tavo kuprinė pilna (15/15)! Jis automatiškai parduotas už ${sellValue} monetų!`;
  }

  updateHud();
  modalLoot.classList.remove('hidden');
}

// - Epiški / Set daiktai iškrenta TIK nugalėjus Bosą lygio pabaigoje!
function awardBossExclusiveSetLoot(profile, bossName) {
  const setItem = rollExclusiveSetDrop(profile);
  const setDef = ITEM_SETS.find((s) => s.id === setItem.setId);
  handleLootItemDropWithAutoSell(
    profile,
    setItem,
    `👑 BOSO TROFĖJUS (SET ITEM): ${setItem.name}!`,
    `Nugalėjai „${bossName}“ ir gavai retą kolekcinę rinkinio dalį iš „${setDef ? setDef.name : 'Rinkinio'}“ (${setItem.bonusText})! Daiktas įdėtas į tavo Inventorių (🎒) – galėsi jį užsidėti po lygio!`
  );
}

// - Išsprendus paprastas užduotis Skrynioje arba Duryse (18% šansas) gaunamas vidutinis/geras „Loot“ daiktas!
function awardChestOrGateLoot(profile, sourceName) {
  const item = rollLevelLootDrop(profile, false);
  handleLootItemDropWithAutoSell(
    profile,
    item,
    `🎁 RASTAS LOBIS („LOOT“): ${item.name}!`,
    `Įveikei „${sourceName}“ ir radai naują unikalų daiktą „${item.name}“ (${item.bonusText})! Jis įdėtas į tavo Inventorių (🎒) – galėsi jį apžiūrėti ir užsidėti po lygio!`
  );
}

// - Įveikus „Proto Žvaigždę“ gaunamas aukštesnės klasės „Loot“ daiktas!
function awardBrainStarLoot(profile) {
  const item = rollLevelLootDrop(profile, true);
  handleLootItemDropWithAutoSell(
    profile,
    item,
    `🌟 PROTO ŽVAIGŽDĖS LOBIS: ${item.name}!`,
    `Puikiai įveikei „Proto Žvaigždės“ iššūkį ir gavai gerą daiktą „${item.name}“ (${item.bonusText})! Daiktas įdėtas į tavo Inventorių (🎒)!`
  );
}

// ==================== LYGIO PABAIGA ====================
function finishLevel(won) {
  const profile = saveSystem.getActiveProfile();
  isWorldPaused = true;
  gameState = 'RESULT';
  gameHud.classList.add('hidden');
  touchControls.classList.add('hidden');
  modalLevelResult.classList.remove('hidden');

  if (won) {
    audio.levelWin();
    const completionBonus = 25 + currentLevel.levelId * 8;
    profile.coins += completionBonus;
    levelSession.coinsEarned += completionBonus;

    const stars = levelSession.mistakesInLevel === 0 ? 3 : levelSession.mistakesInLevel <= 2 ? 2 : 1;
    if (stars === 3) {
      profile.stats.perfectLevels++;
    }

    const prev = profile.completedLevels[currentLevel.levelId];
    profile.completedLevels[currentLevel.levelId] = {
      stars: Math.max(stars, prev ? prev.stars : 0),
      bestCoins: Math.max(levelSession.coinsEarned, prev ? prev.bestCoins : 0)
    };

    if (currentLevel.levelId >= profile.unlockedLevel && profile.unlockedLevel < 50) {
      profile.unlockedLevel = currentLevel.levelId + 1;
    }

    saveSystem.saveAll();

    document.getElementById('result-icon').textContent = '🏆';
    document.getElementById('result-title').textContent = `${currentLevel.levelId} Lygis Įveiktas!`;
    document.getElementById('result-subtitle').textContent =
      stars === 3 ? `Nepriekaištingai, ${profile.name}! Nė vienos klaidos!` : `Puikus nuotykis, ${profile.name}!`;
    document.getElementById('result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    document.getElementById('btn-result-next').textContent = '➡️ Kitas lygis';
  } else {
    audio.wrong();
    document.getElementById('result-icon').textContent = '💪';
    document.getElementById('result-title').textContent = 'Baigėsi širdelės!';
    document.getElementById('result-subtitle').textContent =
      'Visas surinktas auksas ir kuprinės daiktai lieka tau! Užsidėk geresnius ginklus bei šarvus inventoriuje ir bandyk dar kartą!';
    document.getElementById('result-stars').textContent = '☆☆☆';
    document.getElementById('btn-result-next').textContent = '🔄 Bandyti dar kartą';
  }

  document.getElementById('result-coins').textContent = `+${levelSession.coinsEarned} 🪙`;
  document.getElementById('result-crystals').textContent = `+${levelSession.crystalsEarned} 💎`;
  document.getElementById('result-solved').textContent = `${levelSession.solvedCount}`;
}

// ==================== CANVAS PIEŠIMAS (RENDER) ====================
function drawSecretBonusRoomScene(room) {
  const isCave = room.theme === 'cave_vault';

  // 1. Izoliuoto Slapto Kambario fonas (tamsus lobių urvas arba debesų šventovė)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (isCave) {
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.55, '#1e1b4b');
    bgGrad.addColorStop(1, '#311042');
  } else {
    bgGrad.addColorStop(0, '#0c4a6e');
    bgGrad.addColorStop(0.55, '#0284c7');
    bgGrad.addColorStop(1, '#bae6fd');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fono dekoracijos (žibančios aukso dulkės / žvaigždutės arba minkšti debesys)
  ctx.save();
  for (let i = 0; i < 32; i++) {
    const sx = ((i * 97 - cameraX * 0.12) % canvas.width + canvas.width) % canvas.width;
    const sy = (i * 53) % 360 + 24;
    ctx.fillStyle = isCave ? 'rgba(253, 224, 71, 0.55)' : 'rgba(255, 255, 255, 0.72)';
    ctx.beginPath();
    ctx.arc(sx, sy, isCave ? (i % 3) + 1.5 : (i % 4) + 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Didelis užrašas viršuje
  ctx.save();
  ctx.font = 'bold 20px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  const bannerText = isCave
    ? '💎 SLAPTAS POŽEMIŲ LOBYNAS – SURINK VISAS MONETAS IR DEIMANTUS! 💎'
    : '☁️ SLAPTA DEBESŲ ŠVENTOVĖ – JOKIŲ PRIEŠŲ IR MATEMATIKOS! ☁️';
  ctx.strokeText(bannerText, canvas.width / 2, 74);
  ctx.fillText(bannerText, canvas.width / 2, 74);
  ctx.restore();

  // 2. Platformos
  for (const plat of room.platforms) {
    const px = plat.x - cameraX;
    if (px + plat.w < -60 || px > canvas.width + 60) continue;

    ctx.fillStyle = isCave ? '#3b0764' : '#0369a1';
    ctx.fillRect(px, plat.y, plat.w, plat.h);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(px, plat.y, plat.w, 12);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, plat.y, plat.w, plat.h);
  }

  // 3. Spyruoklės
  for (const sp of room.springs) {
    const sx = sp.x - cameraX;
    ctx.fillStyle = '#475569';
    ctx.fillRect(sx + 4, sp.y + 8, sp.w - 8, sp.h - 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(sx, sp.y, sp.w, 10);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sp.y, sp.w, 10);
  }

  // 4. Monetos (Šypsenėlė 😊, Širdelė ❤️, Dideli lankai 🌈)
  const bob = isWorldPaused ? 0 : Math.sin(Date.now() * 0.006) * 3.5;
  for (const coin of room.coins) {
    if (coin.collected) continue;
    const cx = coin.x - cameraX;
    if (cx < -30 || cx > canvas.width + 30) continue;

    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, coin.y + bob, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 5. Didelė deimantų / kristalų krūva pabaigoje!
  for (const cr of room.crystals) {
    if (cr.collected) continue;
    const cx = cr.x - cameraX;
    const cy = cr.y + bob;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx + 14, cy);
    ctx.lineTo(cx, cy + 16);
    ctx.lineTo(cx - 14, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 6. Švytintis Išėjimo Portalas dešinėje pusėje
  const ep = room.exitPortal;
  const ex = ep.x - cameraX;
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.34)';
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(ex, ep.y, ep.w, ep.h, [28, 28, 6, 6]);
  ctx.fill();
  ctx.stroke();

  ctx.font = '38px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌀', ex + ep.w / 2, ep.y + ep.h / 2);

  ctx.font = 'bold 13px Nunito, sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeText(ep.label || '✨ GRĮŽTI Į LYGĮ', ex + ep.w / 2, ep.y - 10);
  ctx.fillText(ep.label || '✨ GRĮŽTI Į LYGĮ', ex + ep.w / 2, ep.y - 10);
  ctx.restore();

  player.draw(ctx, cameraX, true);
  particles.draw(ctx, cameraX);
}

function drawSecretBonusEntrance(ent) {
  if (!ent) return;
  const ex = (ent.pipeDrawX ?? ent.x) - cameraX;
  if (ex < -120 || ex > canvas.width + 120) return;

  ctx.save();
  if (ent.used) {
    ctx.filter = 'grayscale(100%) brightness(0.38)';
  }

  if (ent.style === 'ancient_pipe') {
    const px = ent.pipeDrawX - cameraX;
    const py = ent.pipeDrawY;
    const pw = ent.pipeDrawW;
    const ph = ent.pipeDrawH;

    // Senovinis šulinys / vamzdis
    ctx.fillStyle = ent.used ? '#334155' : '#10b981';
    ctx.strokeStyle = ent.used ? '#0f172a' : '#fde047';
    ctx.lineWidth = 3;
    ctx.fillRect(px + 6, py + 16, pw - 12, ph - 16);
    ctx.strokeRect(px + 6, py + 16, pw - 12, ph - 16);

    // Vamzdžio apvadas viršuje
    ctx.fillStyle = ent.used ? '#475569' : '#34d399';
    ctx.fillRect(px, py, pw, 18);
    ctx.strokeRect(px, py, pw, 18);

    ctx.filter = 'none';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = ent.used ? '#94a3b8' : '#fde047';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    const label = ent.used ? '🔒 ŠULINYS UŽDARYTAS' : ent.label;
    ctx.strokeText(label, px + pw / 2, py - 8);
    ctx.fillText(label, px + pw / 2, py - 8);
  } else {
    // Aukštai paslėpta durų arka arba slaptos durys už netikros sienos
    const dx = ent.x - cameraX;
    const dy = ent.y;

    ctx.fillStyle = ent.used ? 'rgba(15, 23, 42, 0.85)' : 'rgba(250, 204, 21, 0.32)';
    ctx.strokeStyle = ent.used ? '#475569' : '#fde047';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(dx, dy, ent.w, ent.h, [26, 26, 4, 4]);
    ctx.fill();
    ctx.stroke();

    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ent.used ? '🔒' : '🚪', dx + ent.w / 2, dy + ent.h / 2 + 2);

    ctx.filter = 'none';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillStyle = ent.used ? '#94a3b8' : '#fde047';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    const label = ent.used ? '🔒 KAMBARYS APLANKYTAS' : ent.label;
    ctx.strokeText(label, dx + ent.w / 2, dy - 8);
    ctx.fillText(label, dx + ent.w / 2, dy - 8);
  }

  ctx.restore();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (inSecretBonusRoom && currentLevel && currentLevel.secretBonusRoom && player) {
    drawSecretBonusRoomScene(currentLevel.secretBonusRoom);
    return;
  }

  const world = currentLevel ? currentLevel.world : WORLDS[0];

  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGrad.addColorStop(0, world.skyTop);
  skyGrad.addColorStop(1, world.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawParallaxHills(world);

  if (!currentLevel || !player) return;

  for (const dec of currentLevel.decorations) {
    const dx = dec.x - cameraX;
    if (dx < -100 || dx > canvas.width + 100) continue;
    drawDecoration(dec, dx, dec.y, world);
  }

  for (const plat of currentLevel.platforms) {
    if (plat.broken) continue;
    const px = plat.x - cameraX + (plat.shaking ? (Math.random() - 0.5) * 5 : 0);
    if (px + plat.w < -60 || px > canvas.width + 60) continue;

    if (plat.type === 'low_tunnel') {
      ctx.fillStyle = world.id === 2 ? '#312e81' : '#475569';
      ctx.fillRect(px, plat.y, plat.w, plat.h);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeRect(px, plat.y, plat.w, plat.h);

      ctx.fillStyle = world.id === 2 ? '#a855f7' : '#94a3b8';
      for (let sx = 0; sx < plat.w - 10; sx += 18) {
        ctx.beginPath();
        ctx.moveTo(px + sx, plat.y + plat.h);
        ctx.lineTo(px + sx + 9, plat.y + plat.h + 8);
        ctx.lineTo(px + sx + 18, plat.y + plat.h);
        ctx.closePath();
        ctx.fill();
      }

      if (plat.label) {
        ctx.font = 'bold 13px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde047';
        ctx.fillText(plat.label, px + plat.w / 2, plat.y + plat.h / 2 + 4);
      }
      continue;
    }

    if (plat.type === 'crumble') {
      if (plat.isCrystalCrumble) {
        ctx.fillStyle = '#6b21a8';
        ctx.fillRect(px, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#d8b4fe';
        ctx.fillRect(px, plat.y, plat.w, 8);
        ctx.strokeStyle = '#f5d0fe';
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(px, plat.y, plat.w, plat.h);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(px, plat.y, plat.w, plat.h);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px, plat.y, plat.w, 8);
        ctx.strokeStyle = '#fef08a';
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(px, plat.y, plat.w, plat.h);
        ctx.setLineDash([]);
      }
      continue;
    }

    if (plat.type === 'moving_h' || plat.type === 'moving_v') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px, plat.y, plat.w, plat.h);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px, plat.y, plat.w, 8);
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, plat.y, plat.w, plat.h);
      continue;
    }

    ctx.fillStyle = plat.isSecret ? '#7c3aed' : world.platformFill;
    ctx.fillRect(px, plat.y, plat.w, plat.h);

    ctx.fillStyle = plat.isSecret ? '#facc15' : world.platformTop;
    ctx.fillRect(px, plat.y, plat.w, 12);

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, plat.y, plat.w, plat.h);
  }

  // 4 Pasaulio Lavos duobės (Lava Pits)
  if (currentLevel.lavaPits) {
    const waveTime = Date.now() * 0.008;
    for (const lava of currentLevel.lavaPits) {
      const lx = lava.x - cameraX;
      if (lx + lava.w < -60 || lx > canvas.width + 60) continue;
      ctx.save();
      const lavaGrad = ctx.createLinearGradient(0, lava.y, 0, lava.y + lava.h);
      lavaGrad.addColorStop(0, '#facc15');
      lavaGrad.addColorStop(0.28, '#f97316');
      lavaGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(lx, lava.y, lava.w, lava.h);

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let wx = 0; wx <= lava.w; wx += 14) {
        const wy = lava.y + Math.sin(waveTime + wx * 0.12) * 3.5;
        if (wx === 0) ctx.moveTo(lx + wx, wy);
        else ctx.lineTo(lx + wx, wy);
      }
      ctx.stroke();

      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('🌋 LAVA (-1 ❤️)', lx + lava.w / 2, lava.y - 6);
      ctx.restore();
    }
  }

  // Spyruoklės
  for (const sp of currentLevel.springs) {
    const sx = sp.x - cameraX;
    ctx.fillStyle = '#475569';
    ctx.fillRect(sx + 4, sp.y + 8, sp.w - 8, sp.h - 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(sx, sp.y, sp.w, 10);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sp.y, sp.w, 10);
  }

  // 1. Batutai (Trampolines)
  if (currentLevel.trampolines) {
    for (const tr of currentLevel.trampolines) {
      const tx = tr.x - cameraX;
      const offset = tr.compressTimer > 0 ? 6 : 0;
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.fillRect(tx + 6, tr.y + 10, 8, tr.h - 10);
      ctx.fillRect(tx + tr.w - 14, tr.y + 10, 8, tr.h - 10);

      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(tx, tr.y + offset, tr.w, 12, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.fillText('🚀 BATUTAS', tx + tr.w / 2, tr.y - 5);
      ctx.restore();
    }
  }

  // 2. Teleportacijos durys (Teleporters)
  if (currentLevel.teleporters) {
    for (const tp of currentLevel.teleporters) {
      const tx = tp.x - cameraX;
      if (tx < -80 || tx > canvas.width + 80) continue;
      ctx.save();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
      ctx.strokeStyle = tp.color || '#a855f7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(tx, tp.y, tp.w, tp.h, [22, 22, 4, 4]);
      ctx.fill();
      ctx.stroke();

      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌀', tx + tp.w / 2, tp.y + tp.h / 2 + 8);

      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillStyle = '#e9d5ff';
      ctx.fillText(tp.label || '🌀 PORTALAS', tx + tp.w / 2, tp.y - 6);
      ctx.restore();
    }
  }

  // 3. Krentantys stalaktitai (Falling Stalactites)
  if (currentLevel.fallingStalactites) {
    for (const st of currentLevel.fallingStalactites) {
      if (st.state === 'fallen') continue;
      const sx = st.x - cameraX + (st.state === 'shaking' ? (Math.random() - 0.5) * 6 : 0);
      if (sx < -60 || sx > canvas.width + 60) continue;
      ctx.save();
      ctx.fillStyle = world.id === 3 ? '#bae6fd' : '#94a3b8';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, st.y);
      ctx.lineTo(sx + st.w, st.y);
      ctx.lineTo(sx + st.w / 2, st.y + st.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  for (const sk of currentLevel.spikes) {
    const sx = sk.x - cameraX;
    const count = Math.floor(sk.w / 12);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + i * 12, sk.y + sk.h);
      ctx.lineTo(sx + i * 12 + 6, sk.y);
      ctx.lineTo(sx + (i + 1) * 12, sk.y + sk.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  const bob = isWorldPaused ? 0 : Math.sin(Date.now() * 0.006) * 4;
  for (const coin of currentLevel.coins) {
    if (coin.collected) continue;
    const cx = coin.x - cameraX;
    if (cx < -30 || cx > canvas.width + 30) continue;

    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, coin.y + bob, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  for (const cr of currentLevel.crystals) {
    if (cr.collected) continue;
    const cx = cr.x - cameraX;
    const cy = cr.y + bob;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx + 12, cy);
    ctx.lineTo(cx, cy + 14);
    ctx.lineTo(cx - 12, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3B. Slapto Kambario įėjimas (jei sugeneruotas šiame lygyje)
  if (currentLevel.secretBonusEntrance) {
    drawSecretBonusEntrance(currentLevel.secretBonusEntrance);
  }

  // 4. Netikros sienos (Fake Walls) – kai neatrasta, dengia slaptą kambarį; kai įeinama į vidų – tampa permatoma!
  if (currentLevel.fakeWalls) {
    for (const fw of currentLevel.fakeWalls) {
      const fx = fw.x - cameraX;
      if (fx + fw.w < -60 || fx > canvas.width + 60) continue;
      ctx.save();
      ctx.globalAlpha = fw.discovered ? 0.18 : 0.92;
      ctx.fillStyle = world.platformFill;
      ctx.fillRect(fx, fw.y, fw.w, fw.h);
      ctx.strokeStyle = '#fde047';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2.5;
      ctx.strokeRect(fx, fw.y, fw.w, fw.h);
      ctx.setLineDash([]);

      if (!fw.discovered) {
        ctx.font = 'bold 13px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde047';
        ctx.fillText(fw.label || '🧱 Paslaptinga Siena...', fx + fw.w / 2, fw.y + fw.h / 2);
      }
      ctx.restore();
    }
  }

  // 5. Svyruojantys kirviai / Švytuoklės (Pendulums)
  if (currentLevel.pendulums) {
    for (const pd of currentLevel.pendulums) {
      const pivX = pd.pivotX - cameraX;
      if (pivX < -160 || pivX > canvas.width + 160) continue;
      const bx = (pd.bladeX || pd.pivotX) - cameraX;
      const by = pd.bladeY || (pd.pivotY + pd.length);

      ctx.save();
      // Grandinė
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pivX, pd.pivotY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Tvirtinimo taškas
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(pivX, pd.pivotY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Kirvio ašmenys
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bx, by, pd.bladeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪓', bx, by);
      ctx.restore();
    }
  }

  // Priešai + jų HP juostos
  for (const en of currentLevel.enemies) {
    if (!en.alive) continue;
    const ex = en.x - cameraX;
    if (ex < -80 || ex > canvas.width + 80) continue;

    ctx.save();
    if (en.hitFlashTimer > 0) {
      ctx.filter = 'brightness(1.85)';
    }

    if (en.kind === 'goblin') {
      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.fillRect(ex + 4, en.y + 6, en.w - 8, en.h - 6);
      ctx.strokeRect(ex + 4, en.y + 6, en.w - 8, en.h - 6);
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👺', ex + en.w / 2, en.y + 24);
    } else if (en.kind === 'elite_knight') {
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.fillRect(ex + 2, en.y + 6, en.w - 4, en.h - 6);
      ctx.strokeRect(ex + 2, en.y + 6, en.w - 4, en.h - 6);
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👹', ex + en.w / 2, en.y + 27);
    } else if (en.kind === 'rock_golem') {
      ctx.fillStyle = '#52525b';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.fillRect(ex + 2, en.y + 4, en.w - 4, en.h - 4);
      ctx.strokeRect(ex + 2, en.y + 4, en.w - 4, en.h - 4);
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🗿', ex + en.w / 2, en.y + 29);
    } else if (en.kind === 'penguin') {
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2;
      ctx.fillRect(ex + 4, en.y + 6, en.w - 8, en.h - 6);
      ctx.strokeRect(ex + 4, en.y + 6, en.w - 8, en.h - 6);
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐧', ex + en.w / 2, en.y + 25);
    } else if (en.kind === 'fire_elemental') {
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.fillRect(ex + 3, en.y + 4, en.w - 6, en.h - 4);
      ctx.strokeRect(ex + 3, en.y + 4, en.w - 6, en.h - 4);
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥', ex + en.w / 2, en.y + 28);
    } else if (en.kind === 'alien') {
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.fillRect(ex + 3, en.y + 4, en.w - 6, en.h - 4);
      ctx.strokeRect(ex + 3, en.y + 4, en.w - 6, en.h - 4);
      ctx.font = '25px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👽', ex + en.w / 2, en.y + 27);
    } else if (en.kind === 'slime') {
      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#f0abfc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ex + en.w / 2, en.y + en.h, en.w / 2, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex + 13, en.y + 20, 4, 0, Math.PI * 2);
      ctx.arc(ex + 27, en.y + 20, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (en.kind === 'bat') {
      ctx.font = '30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🦇', ex + en.w / 2, en.y + 24);
    } else if (en.kind === 'flying_demon') {
      ctx.font = '30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👿', ex + en.w / 2, en.y + 26);
    } else if (en.kind === 'ufo') {
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛸', ex + en.w / 2, en.y + 24);
    } else if (en.kind === 'snowman') {
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(ex + 4, en.y + 8, en.w - 8, en.h - 8);
      ctx.strokeRect(ex + 4, en.y + 8, en.w - 8, en.h - 8);
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛄', ex + en.w / 2, en.y + 27);
    } else if (en.kind === 'archer') {
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.fillRect(ex + 4, en.y + 8, en.w - 8, en.h - 8);
      ctx.strokeRect(ex + 4, en.y + 8, en.w - 8, en.h - 8);
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏹', ex + en.w / 2, en.y + 26);
    }

    const maxHp = en.maxHp || 1;
    const curHp = en.hp ?? maxHp;
    if (maxHp > 1 || curHp < maxHp) {
      const barW = 38;
      const barX = ex + en.w / 2 - barW / 2;
      const barY = en.y - 12;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX, barY, barW, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX + 1, barY + 1, Math.max(0, ((barW - 2) * curHp) / maxHp), 4);
      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`${curHp}/${maxHp} HP`, ex + en.w / 2, barY - 3);
    }

    ctx.restore();
  }

  // Priešų strėlės, sniego gniūžtės ir Boso sviediniai
  for (const proj of currentLevel.projectiles) {
    if (!proj.active) continue;
    const px = proj.x - cameraX;
    ctx.save();
    if (proj.projectileStyle === 'snowball') {
      ctx.fillStyle = '#f0f9ff';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + proj.w / 2, proj.y + proj.h / 2, proj.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (proj.projectileStyle === 'boss_orb') {
      ctx.fillStyle = proj.color || '#f43f5e';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px + proj.w / 2, proj.y + proj.h / 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = proj.highShot ? '#f97316' : '#fde047';
      ctx.fillRect(px, proj.y, proj.w, proj.h);
      ctx.strokeStyle = '#0f172a';
      ctx.strokeRect(px, proj.y, proj.w, proj.h);
    }
    ctx.restore();
  }

  // Herojaus iššautos strėlės (Test Build 8: pasukamos pagal parabolės skrydžio kampą!)
  for (const arr of currentLevel.playerArrows) {
    if (!arr.active) continue;
    const ax = arr.x - cameraX;
    const angle = Math.atan2(arr.vy || 0, arr.vx || 1);
    ctx.save();
    ctx.translate(ax + arr.w / 2, arr.y + arr.h / 2);
    ctx.rotate(angle);
    ctx.fillStyle = arr.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-arr.w / 2, -arr.h / 2, arr.w, arr.h);
    ctx.strokeRect(-arr.w / 2, -arr.h / 2, arr.w, arr.h);
    // Strėlės antgalis ir plunksnos
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(arr.w / 2 + 5, 0);
    ctx.lineTo(arr.w / 2 - 2, -4);
    ctx.lineTo(arr.w / 2 - 2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Herojaus išmesti Bumerangai (sukasi ore, skrenda į priekį ir grįžta pas herojų!)
  if (currentLevel.playerBoomerangs) {
    for (const bm of currentLevel.playerBoomerangs) {
      if (!bm.active) continue;
      const bx = bm.x - cameraX;
      ctx.save();
      ctx.translate(bx + bm.w / 2, bm.y + bm.h / 2);
      ctx.rotate(bm.spinAngle || 0);
      ctx.fillStyle = bm.bladeColor || bm.color || '#d97706';
      ctx.strokeStyle = bm.trimColor || bm.trim || '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-12, -12);
      ctx.lineTo(13, 0);
      ctx.lineTo(-12, 12);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Matematiniai susitikimai ir Bosai + Vienkartinių užduočių pajuodavę/sudužę objektai
  for (const enc of currentLevel.mathEncounters) {
    const ex = enc.x - cameraX;
    if (ex < -120 || ex > canvas.width + 120) continue;

    // Jei užduotis buvo suklupta (enc.failed === true) – piešiame pajuodavusią / sudužusią skrynią ar duris!
    // („Proto Žvaigždė“ sprogo ir dingo visiškai)
    if (enc.resolved) {
      if (enc.failed && enc.type !== 'brain_star') {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.beginPath();
        ctx.arc(ex + enc.w / 2, enc.y + enc.h / 2 + 6, enc.w * 0.62, 0, Math.PI * 2);
        ctx.fill();

        ctx.filter = 'grayscale(100%) brightness(0.35)';
        ctx.font = `${enc.type === 'boss' ? 48 : 34}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enc.icon, ex + enc.w / 2, enc.y + enc.h / 2 + 6);
        ctx.filter = 'none';

        ctx.font = 'bold 12px Nunito, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeText('💥 SUDUŽO (BE PRIZO)', ex + enc.w / 2, enc.y - 6);
        ctx.fillText('💥 SUDUŽO (BE PRIZO)', ex + enc.w / 2, enc.y - 6);
        ctx.restore();
      }
      continue;
    }

    ctx.save();
    if (enc.hitFlashTimer > 0) {
      ctx.filter = 'brightness(1.85)';
    }

    ctx.fillStyle = enc.type === 'boss' ? 'rgba(244, 63, 94, 0.28)' : 'rgba(250, 204, 21, 0.22)';
    ctx.beginPath();
    ctx.arc(ex + enc.w / 2, enc.y + enc.h / 2, enc.w * 0.72, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${enc.type === 'boss' ? 56 : 36}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(enc.icon, ex + enc.w / 2, enc.y + enc.h / 2 + bob * 0.6);

    if (enc.type === 'boss') {
      const barW = 92;
      const barX = ex + enc.w / 2 - barW / 2;
      const barY = enc.y - 14;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX, barY, barW, 9);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(barX + 1, barY + 1, Math.max(0, ((barW - 2) * enc.hp) / enc.maxHp), 7);
    }

    ctx.font = 'bold 14px Nunito, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    const label = enc.type === 'boss'
      ? `👑 ${enc.name} (${enc.hp}/${enc.maxHp} HP)`
      : enc.type === 'brain_star'
        ? '🌟 PROTO ŽVAIGŽDĖ (4–5 užd.)'
        : '❓ SERIJA (2–3 užd.)';
    ctx.strokeText(label, ex + enc.w / 2, enc.y - (enc.type === 'boss' ? 22 : 10));
    ctx.fillText(label, ex + enc.w / 2, enc.y - (enc.type === 'boss' ? 22 : 10));
    ctx.restore();
  }

  const fp = currentLevel.finishPortal;
  const fx = fp.x - cameraX;
  ctx.save();
  ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(fx + fp.w / 2, fp.y + fp.h / 2, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '38px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏁', fx + fp.w / 2, fp.y + fp.h / 2);
  ctx.restore();

  player.draw(ctx, cameraX, true);
  particles.draw(ctx, cameraX);
}

function drawParallaxHills(world) {
  // 5 Pasaulis (Kosmoso Stotis): mirguliuojantis žvaigždėtas dangus ir planetos!
  if (world.id === 5) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    for (let s = 0; s < 38; s++) {
      const sx = ((s * 97 - cameraX * 0.08) % canvas.width + canvas.width) % canvas.width;
      const sy = (s * 43) % 360 + 20;
      const r = (s % 3) + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Tolima planeta su žiedu
    const px = 760 - (cameraX * 0.05) % 400;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(px, 110, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(px, 110, 62, 14, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (world.id === 3) {
    // 3 Pasaulis (Ledo Karalystė): krentančios snaigės fone
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const t = Date.now() * 0.03;
    for (let s = 0; s < 28; s++) {
      const sx = ((s * 113 - cameraX * 0.15) % canvas.width + canvas.width) % canvas.width;
      const sy = ((s * 57 + t) % 440);
      ctx.beginPath();
      ctx.arc(sx, sy, (s % 2) + 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const shift1 = (cameraX * 0.18) % 400;
  ctx.fillStyle = world.hillColor1;
  for (let i = -1; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(i * 400 - shift1 + 200, 520, 260, Math.PI, 0);
    ctx.fill();
  }

  const shift2 = (cameraX * 0.35) % 320;
  ctx.fillStyle = world.hillColor2;
  for (let i = -1; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(i * 320 - shift2 + 160, 540, 190, Math.PI, 0);
    ctx.fill();
  }
}

function drawDecoration(dec, dx, dy, world) {
  ctx.save();
  if (dec.type === 'crystal_dec') {
    ctx.fillStyle = '#a855f7';
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx - 14, dy - 42 * dec.scale);
    ctx.lineTo(dx, dy - 58 * dec.scale);
    ctx.lineTo(dx + 14, dy - 42 * dec.scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (dec.type === 'snow_pine') {
    ctx.fillStyle = '#475569';
    ctx.fillRect(dx - 6, dy - 38, 12, 38);
    ctx.fillStyle = '#e0f2fe';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dx, dy - 82 * dec.scale);
    ctx.lineTo(dx - 28 * dec.scale, dy - 26);
    ctx.lineTo(dx + 28 * dec.scale, dy - 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (dec.type === 'volcano_rock') {
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dx - 24 * dec.scale, dy);
    ctx.lineTo(dx - 10 * dec.scale, dy - 48 * dec.scale);
    ctx.lineTo(dx + 12 * dec.scale, dy - 44 * dec.scale);
    ctx.lineTo(dx + 26 * dec.scale, dy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (dec.type === 'space_antenna') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx, dy - 56 * dec.scale);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(dx, dy - 60 * dec.scale, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (dec.type === 'tree') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(dx - 8, dy - 52, 16, 52);
    ctx.fillStyle = world.platformTop;
    ctx.beginPath();
    ctx.arc(dx, dy - 64, 30 * dec.scale, 0, Math.PI * 2);
    ctx.arc(dx - 18, dy - 50, 22 * dec.scale, 0, Math.PI * 2);
    ctx.arc(dx + 18, dy - 50, 22 * dec.scale, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = world.platformTop;
    ctx.beginPath();
    ctx.arc(dx, dy - 14, 18 * dec.scale, 0, Math.PI * 2);
    ctx.arc(dx + 14, dy - 10, 14 * dec.scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ==================== PAGRINDINIS GAME LOOP ====================
function gameLoop() {
  try {
    if (gameState === 'PLAYING' && !isWorldPaused) {
      updatePlaying();
    } else if (gameState === 'SHOP') {
      drawShopPreview();
    }
    drawScene();
  } catch (err) {
    console.error('GameLoop klaida:', err);
  }
  requestAnimationFrame(gameLoop);
}

// ==================== UI MYGTUKŲ SUSIEJIMAS ====================
function setupUIListeners() {
  document.getElementById('btn-export-save').addEventListener('click', () => {
    audio.click();
    document.getElementById('transfer-title').textContent = '📤 Eksportuoti Lino ir Luko Progresą';
    document.getElementById('transfer-textarea').value = saveSystem.exportCode();
    document.getElementById('btn-apply-import').classList.add('hidden');
    document.getElementById('transfer-feedback').classList.add('hidden');
    modalTransfer.classList.remove('hidden');
  });

  document.getElementById('btn-import-save').addEventListener('click', () => {
    audio.click();
    document.getElementById('transfer-title').textContent = '📥 Importuoti Lino ir Luko Progresą';
    document.getElementById('transfer-textarea').value = '';
    document.getElementById('btn-apply-import').classList.remove('hidden');
    document.getElementById('transfer-feedback').classList.add('hidden');
    modalTransfer.classList.remove('hidden');
  });

  document.getElementById('btn-close-transfer').addEventListener('click', () => {
    audio.click();
    modalTransfer.classList.add('hidden');
  });

  document.getElementById('btn-download-json').addEventListener('click', () => {
    audio.click();
    const blob = new Blob([saveSystem.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linas-lukas-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('input-upload-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('transfer-textarea').value = reader.result;
      document.getElementById('btn-apply-import').classList.remove('hidden');
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-apply-import').addEventListener('click', () => {
    const raw = document.getElementById('transfer-textarea').value;
    const res = saveSystem.importData(raw);
    const fb = document.getElementById('transfer-feedback');
    fb.classList.remove('hidden');
    if (res.success) {
      audio.levelWin();
      fb.textContent = '✅ Lino ir Luko progresas sėkmingai importuotas!';
      renderNamedProfiles();
    } else {
      audio.wrong();
      fb.textContent = `❌ ${res.error}`;
    }
  });

  document.getElementById('btn-open-shop').addEventListener('click', () => {
    audio.click();
    openShop(false);
  });

  document.getElementById('btn-close-shop').addEventListener('click', () => {
    audio.click();
    if (returnToResultFromShop) {
      returnToResultFromShop = false;
      hideAllScreens();
      modalLevelResult.classList.remove('hidden');
      gameState = 'RESULT';
    } else {
      openWorldMap();
    }
  });

  document.getElementById('btn-switch-profile').addEventListener('click', () => {
    audio.click();
    isWorldPaused = true;
    gameState = 'PROFILES';
    hideAllScreens();
    renderNamedProfiles();
    screenProfiles.classList.remove('hidden');
  });

  document.getElementById('btn-claim-daily').addEventListener('click', () => {
    const profile = saveSystem.getActiveProfile();
    if (profile && profile.dailyChallenge.solvedToday >= 15 && !profile.dailyChallenge.claimed) {
      profile.coins += 150;
      profile.crystals += 3;
      profile.dailyChallenge.claimed = true;
      saveSystem.saveAll();
      audio.crystal();
      openWorldMap();
    }
  });

  document.querySelectorAll('.inv-tab[data-inv-filter]').forEach((tab) => {
    tab.addEventListener('click', () => {
      audio.click();
      selectedInvFilter = tab.dataset.invFilter || 'all';
      document.querySelectorAll('.inv-tab[data-inv-filter]').forEach((t) => t.classList.toggle('active', t === tab));
      if (['weapons', 'armor_hats', 'shields', 'capes', 'sets'].includes(selectedInvFilter)) {
        selectedShopTab = selectedInvFilter;
        document.querySelectorAll('.shop-tab').forEach((t) =>
          t.classList.toggle('active', t.dataset.tab === selectedShopTab)
        );
        renderShop();
      }
      renderInventoryDashboard();
    });
  });

  document.querySelectorAll('.shop-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      audio.click();
      selectedShopTab = tab.dataset.tab;
      document.querySelectorAll('.shop-tab').forEach((t) => t.classList.toggle('active', t === tab));
      if (['weapons', 'armor_hats', 'shields', 'capes', 'sets'].includes(selectedShopTab)) {
        selectedInvFilter = selectedShopTab;
        document.querySelectorAll('.inv-tab[data-inv-filter]').forEach((t) =>
          t.classList.toggle('active', t.dataset.invFilter === selectedInvFilter)
        );
        renderInventoryDashboard();
      }
      renderShop();
    });
  });

  document.getElementById('btn-hud-mute').addEventListener('click', (e) => {
    const muted = audio.toggleMute();
    e.currentTarget.textContent = muted ? '🔇' : '🔊';
  });

  document.getElementById('btn-hud-map').addEventListener('click', () => {
    audio.click();
    openWorldMap();
  });

  document.getElementById('btn-math-helper').addEventListener('click', () => {
    if (!player || player.helperCharges <= 0) return;
    const q = activeDuel.question;
    const buttons = [...document.querySelectorAll('.math-option-btn:not(:disabled)')];
    const wrongButtons = buttons.filter((b) => b.dataset.val !== String(q.answer));
    if (wrongButtons.length > 0) {
      player.helperCharges--;
      wrongButtons[0].classList.add('wrong-choice');
      wrongButtons[0].disabled = true;
      document.getElementById('math-helper-count').textContent = player.helperCharges;
      if (player.helperCharges <= 0 || wrongButtons.length <= 1) {
        document.getElementById('btn-math-helper').disabled = true;
      }
      audio.click();
    }
  });

  document.getElementById('btn-toggle-keypad').addEventListener('click', () => {
    audio.click();
    activeDuel.usingKeypad = !activeDuel.usingKeypad;
    document.getElementById('math-keypad').classList.toggle('hidden', !activeDuel.usingKeypad);
    document.getElementById('math-options').classList.toggle('hidden', activeDuel.usingKeypad);
    document.getElementById('btn-toggle-keypad').textContent = activeDuel.usingKeypad
      ? '🔘 Perjungti į atsakymų variantus'
      : '🔢 Perjungti į skaičių klaviatūrą';
  });

  document.querySelectorAll('.key-btn[data-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.click();
      appendKeypadDigit(btn.dataset.key);
    });
  });

  document.getElementById('keypad-clear').addEventListener('click', () => {
    audio.click();
    clearKeypadDigit();
  });

  document.getElementById('keypad-submit').addEventListener('click', () => {
    submitKeypadAnswer();
  });

  document.getElementById('btn-result-map').addEventListener('click', () => {
    audio.click();
    openWorldMap();
  });

  document.getElementById('btn-result-shop').addEventListener('click', () => {
    audio.click();
    openShop(true);
  });

  document.getElementById('btn-result-next').addEventListener('click', () => {
    audio.click();
    const profile = saveSystem.getActiveProfile();
    const nextLvl = Math.min(50, profile.unlockedLevel);
    startLevelPlay(nextLvl);
  });

  document.getElementById('btn-close-loot').addEventListener('click', () => {
    audio.click();
    modalLoot.classList.add('hidden');
    if (player) player.invincibleTimer = 120;
    isWorldPaused = false;
    gameState = 'PLAYING';
    updateHud();
  });

  // Tėvų kontrolės ir dienos laiko limito mygtukai
  const hudPlaytimeBtn = document.getElementById('hud-playtime');
  if (hudPlaytimeBtn) {
    hudPlaytimeBtn.addEventListener('click', () => {
      audio.click();
      const profile = saveSystem.getActiveProfile();
      const expired = getRemainingPlaytimeSeconds(profile) <= 0;
      openTimeLimitModal(expired);
    });
  }

  const timeResumeBtn = document.getElementById('btn-time-resume');
  if (timeResumeBtn) {
    timeResumeBtn.addEventListener('click', () => {
      audio.click();
      const profile = saveSystem.getActiveProfile();
      if (getRemainingPlaytimeSeconds(profile) > 0) {
        closeTimeLimitModalAndResume();
      }
    });
  }

  const timeSaveExitBtn = document.getElementById('btn-time-save-exit');
  if (timeSaveExitBtn) {
    timeSaveExitBtn.addEventListener('click', () => {
      audio.click();
      saveSystem.saveAll();
      isTimeLimitPaused = false;
      isWorldPaused = true;
      gameState = 'PROFILES';
      hideAllScreens();
      renderNamedProfiles();
      screenProfiles.classList.remove('hidden');
    });
  }

  const parentExtendBtn = document.getElementById('btn-parent-extend');
  if (parentExtendBtn) {
    parentExtendBtn.addEventListener('click', () => {
      handleParentPasswordExtend();
    });
  }

  const parentPassInput = document.getElementById('parent-password-input');
  if (parentPassInput) {
    parentPassInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleParentPasswordExtend();
      }
    });
  }
}

function hideAllScreens() {
  screenProfiles.classList.add('hidden');
  modalTransfer.classList.add('hidden');
  screenMap.classList.add('hidden');
  screenShop.classList.add('hidden');
  modalMath.classList.add('hidden');
  if (modalLoot) modalLoot.classList.add('hidden');
  modalLevelResult.classList.add('hidden');
  if (modalTimeLimit) modalTimeLimit.classList.add('hidden');
  gameHud.classList.add('hidden');
  touchControls.classList.add('hidden');
}

init();
