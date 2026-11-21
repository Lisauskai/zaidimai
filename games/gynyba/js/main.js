// ==================== BUBIŲ TVIRTOVĖ: PAGRINDINIS VALDIKLIS ====================
import {
  initPlaytimeTimer,
  getRemainingPlaytimeSeconds,
  formatMMSS
} from '../../../shared/playtime-timer.js?v=20261121e';
import {
  TOWER_LIST,
  TARGETING_PRIORITIES,
  CAMPAIGN_ZONES,
  CAMPAIGN_LEVELS,
  getLevelById,
  getTowerStats,
  getUpgradeCost,
  getTowerEvolutions,
  computeSellRefund,
  calculateStarsForHearts,
  getProfileModifier
} from './balance.js?v=20261121e';
import { TDEngine } from './engine.js?v=20261121e';

const SAVE_KEY = 'gynyba_save_v1';

function loadSaveData() {
  const createEmpty = () => ({
    stars: 0,
    bestWave: 0,
    unlockedLevels: ['lvl_1'],
    levelStars: {}
  });
  const def = { linas: createEmpty(), lukas: createEmpty() };

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);

    const normalizeBucket = (b) => {
      const levelStars = {};
      if (b?.levelStars && typeof b.levelStars === 'object') {
        for (const [k, v] of Object.entries(b.levelStars)) {
          const n = Math.max(0, Math.min(3, Number(v) || 0));
          if (n > 0) levelStars[k] = n;
        }
      }
      // Migracija iš ankstesnių 3 žemėlapių raktų, jei yra
      if (b?.mapStars) {
        if ((Number(b.mapStars.bubiai) || 0) > 0 && !levelStars.lvl_1) {
          levelStars.lvl_1 = Math.min(3, Number(b.mapStars.bubiai));
        }
        if ((Number(b.mapStars.kurtuvenai) || 0) > 0 && !levelStars.lvl_7) {
          levelStars.lvl_7 = Math.min(3, Number(b.mapStars.kurtuvenai));
        }
        if ((Number(b.mapStars.dagilelis) || 0) > 0 && !levelStars.lvl_10) {
          levelStars.lvl_10 = Math.min(3, Number(b.mapStars.dagilelis));
        }
      }

      const unlockedSet = new Set(['lvl_1']);
      if (Array.isArray(b?.unlockedLevels)) {
        b.unlockedLevels.forEach((id) => {
          if (typeof id === 'string') unlockedSet.add(id);
        });
      }

      const totalStars = Object.values(levelStars).reduce((acc, s) => acc + s, 0);
      return {
        stars: Math.max(totalStars, Number(b?.stars) || 0),
        bestWave: Math.max(0, Number(b?.bestWave) || 0),
        unlockedLevels: Array.from(unlockedSet),
        levelStars
      };
    };

    return {
      linas: normalizeBucket(parsed?.linas),
      lukas: normalizeBucket(parsed?.lukas)
    };
  } catch (e) {
    return def;
  }
}

function persistSaveData(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignoruojame localStorage klaidas
  }
}

// ==================== DOM NUORODOS ====================
const screenProfiles = document.getElementById('screen-profiles');
const screenCampaign = document.getElementById('screen-campaign');
const screenGame = document.getElementById('screen-game');
const topProfilePill = document.getElementById('top-profile-pill');
const uiActiveProfile = document.getElementById('ui-active-profile');
const btnSwitchProfile = document.getElementById('btn-switch-profile');

const campaignZonesBar = document.getElementById('campaign-zones-bar');
const campaignNodesLayer = document.getElementById('campaign-nodes-layer');
const campaignRoadShadow = document.getElementById('campaign-road-shadow');
const campaignRoadLine = document.getElementById('campaign-road-line');
const campaignTotalStars = document.getElementById('campaign-total-stars');
const campaignUnlockedCount = document.getElementById('campaign-unlocked-count');

const knowledgeGateModal = document.getElementById('knowledge-gate-modal');
const kgQuestionEl = document.getElementById('kg-question');
const kgOptionsEl = document.getElementById('kg-options');
const kgFeedbackEl = document.getElementById('kg-feedback');
const kgTitleEl = document.getElementById('kg-title');
const btnResultNextLevel = document.getElementById('btn-result-next-level');

const canvasFrame = document.getElementById('canvas-frame');
const canvas = document.getElementById('gynyba-canvas');
const padBuildMenu = document.getElementById('pad-build-menu');
const padBuildOptions = document.getElementById('pad-build-options');
const towerInspectorMenu = document.getElementById('tower-inspector-menu');
const inspectorPriorityGrid = document.getElementById('inspector-priority-grid');
const inspectorEvolutionsBox = document.getElementById('inspector-evolutions-box');
const inspectorEvolutionsGrid = document.getElementById('inspector-evolutions-grid');
const btnRallyPoint = document.getElementById('btn-rally-point');
const wavePreviewCard = document.getElementById('wave-preview-card');
const wavePreviewHeadline = document.getElementById('wave-preview-headline');
const wavePreviewList = document.getElementById('wave-preview-list');
const resultOverlay = document.getElementById('battle-result-overlay');

const btnSpeedToggle = document.getElementById('btn-speed-toggle');
const btnPauseToggle = document.getElementById('btn-pause-toggle');
const btnCallWave = document.getElementById('btn-call-wave');
const uiCallWaveLabel = document.getElementById('ui-call-wave-label');
const uiEarlyWaveBonus = document.getElementById('ui-early-wave-bonus');
const btnUpgradeTower = document.getElementById('btn-upgrade-tower');
const btnSellTower = document.getElementById('btn-sell-tower');

let saveData = loadSaveData();
let activeProfile = null;
let lastFrameTimestamp = 0;
let pendingGateLevelId = null;

const engine = new TDEngine(canvas, {
  onStateChange: () => syncBattleUI(),
  onSelectionChange: () => syncSelectionUI(),
  onWavePreviewChange: (preview) => renderWavePreviewCard(preview),
  onGameResult: (result) => handleGameResult(result)
});

function isInBattleView() {
  return Boolean(screenGame && !screenGame.classList.contains('hidden'));
}

const playtimeTimer = initPlaytimeTimer({
  containerSelector: '#top-playtime-slot',
  portalUrl: '../../index.html',
  shouldCount: () => Boolean(activeProfile) && (!isInBattleView() || !engine.isPaused()),
  onSwitchProfile: () => showProfileScreen(),
  onLock: () => {
    engine.setExternalLocked(true);
    closePadMenus();
  },
  onUnlock: () => {
    engine.setExternalLocked(false);
  },
  onTick: () => updateProfileCards()
});

function updateProfileCards() {
  const linasTimeEl = document.getElementById('linas-time-left');
  const lukasTimeEl = document.getElementById('lukas-time-left');
  const linasStatsEl = document.getElementById('linas-save-stats');
  const lukasStatsEl = document.getElementById('lukas-save-stats');

  if (linasTimeEl) {
    const rem1 = getRemainingPlaytimeSeconds('linas');
    linasTimeEl.textContent = formatMMSS(rem1);
    linasTimeEl.style.color = rem1 > 0 ? '#7dd3fc' : '#f87171';
  }
  if (lukasTimeEl) {
    const rem3 = getRemainingPlaytimeSeconds('lukas');
    lukasTimeEl.textContent = formatMMSS(rem3);
    lukasTimeEl.style.color = rem3 > 0 ? '#7dd3fc' : '#f87171';
  }
  if (linasStatsEl) {
    linasStatsEl.textContent = `⭐ ${saveData.linas.stars} • Banga ${saveData.linas.bestWave}`;
  }
  if (lukasStatsEl) {
    lukasStatsEl.textContent = `⭐ ${saveData.lukas.stars} • Banga ${saveData.lukas.bestWave}`;
  }
}

function positionFloatingMenu(menuEl, padX, padY) {
  if (!menuEl || !canvasFrame || !canvas) return;
  const frameRect = canvasFrame.getBoundingClientRect();
  if (!frameRect.width) return;

  const scaleX = frameRect.width / canvas.width;
  const scaleY = frameRect.height / canvas.height;
  const px = padX * scaleX;
  const py = padY * scaleY;

  const menuW = menuEl.offsetWidth || 290;
  const menuH = menuEl.offsetHeight || 220;

  let left = px + 26;
  if (left + menuW > frameRect.width - 8) {
    left = px - menuW - 26;
  }
  left = Math.max(8, Math.min(frameRect.width - menuW - 8, left));

  let top = py - menuH / 2;
  top = Math.max(8, Math.min(frameRect.height - menuH - 8, top));

  menuEl.style.left = `${Math.round(left)}px`;
  menuEl.style.top = `${Math.round(top)}px`;
}

function closePadMenus() {
  padBuildMenu?.classList.add('hidden');
  towerInspectorMenu?.classList.add('hidden');
}

function renderWavePreviewCard(preview) {
  if (!wavePreviewCard || !wavePreviewHeadline || !wavePreviewList) return;
  if (!preview || !preview.groups || preview.groups.length === 0) {
    wavePreviewCard.classList.add('hidden');
    return;
  }

  wavePreviewHeadline.textContent = preview.headline;
  wavePreviewList.innerHTML = '';

  preview.groups.forEach((g) => {
    const row = document.createElement('div');
    row.className = 'wave-preview-row';

    const top = document.createElement('div');
    top.className = 'wave-preview-row-top';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${g.icon} ${g.name}`;
    const countSpan = document.createElement('span');
    countSpan.className = 'wave-preview-count';
    countSpan.textContent = `×${g.count}`;
    top.appendChild(nameSpan);
    top.appendChild(countSpan);

    const tip = document.createElement('div');
    tip.className = 'wave-preview-tip';
    tip.textContent = g.counterTip || '';

    row.appendChild(top);
    if (g.counterTip) row.appendChild(tip);
    wavePreviewList.appendChild(row);
  });

  wavePreviewCard.classList.remove('hidden');
}

function syncBuildMenuAffordability() {
  if (!padBuildOptions || padBuildMenu?.classList.contains('hidden')) return;
  padBuildOptions.querySelectorAll('.build-option-btn').forEach((btn) => {
    const cost = Number(btn.dataset.cost) || 0;
    btn.disabled = engine.coins < cost;
  });
}

function renderPadBuildMenu(pad) {
  if (!padBuildMenu || !padBuildOptions) return;
  padBuildOptions.innerHTML = '';

  TOWER_LIST.forEach((towerDef) => {
    const stats = getTowerStats(towerDef.id, 1);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'build-option-btn';
    btn.dataset.towerId = towerDef.id;
    btn.dataset.cost = String(stats.cost);
    btn.disabled = engine.coins < stats.cost;
    btn.title = `${towerDef.name}: ${towerDef.desc}`;
    btn.innerHTML = `
      <span class="build-option-icon">${towerDef.icon}</span>
      <span class="build-option-name">${towerDef.shortName}</span>
      <span class="build-option-meta">${stats.cost} 🪙 • R:${stats.range}</span>
    `;

    btn.addEventListener('pointerenter', () => {
      engine.setPreviewTowerType(towerDef.id);
    });
    btn.addEventListener('focus', () => {
      engine.setPreviewTowerType(towerDef.id);
    });
    btn.addEventListener('click', () => {
      engine.setPreviewTowerType(towerDef.id);
      if (engine.buildTowerOnSelectedPad(towerDef.id)) {
        closePadMenus();
      }
    });

    padBuildOptions.appendChild(btn);
  });

  towerInspectorMenu?.classList.add('hidden');
  padBuildMenu.classList.remove('hidden');
  positionFloatingMenu(padBuildMenu, pad.x, pad.y);
}

function formatTowerStatsLine(tower, stats) {
  const effRange = tower.effectiveRange || stats.range;
  const parts = [];
  if (tower.type === 'solar_laser') {
    parts.push(`DPS: ${stats.dps} (iki ${(stats.dps * (stats.maxRamp || 2.5)).toFixed(0)})`);
    parts.push(`Šarvų kirtimas: ${Math.round((stats.armorPierce || 0) * 100)}%`);
  } else if (tower.type === 'mower_barracks') {
    parts.push(`Robotai: ${stats.unitCount}`);
    parts.push(`HP: ${stats.unitMaxHp}`);
    parts.push(`Žala/s: ${stats.unitDps}`);
  } else if (tower.type === 'solar_station') {
    parts.push(`Pajamos: +${stats.incomeAmount} 🪙 / ${stats.incomeInterval}s`);
    parts.push(`Aura: +${Math.round((stats.auraRangeBonus || 0.12) * 100)}% nuotolio`);
  } else {
    parts.push(`Žala: ${stats.damage}`);
    parts.push(`Greitis: ${stats.cooldown.toFixed(2)}s`);
    if (stats.slowPercentage) {
      parts.push(`Sulėtina: ${Math.round(stats.slowPercentage * 100)}%`);
    }
    if (tower.type === 'dagilelis_sound' && stats.auraFireRateBonus) {
      parts.push(`Aura: +${Math.round(stats.auraFireRateBonus * 100)}% greičio`);
    }
  }
  parts.push(`Nuotolis: ${effRange}`);
  return parts.join(' • ');
}

function renderTowerInspectorMenu(pad, tower) {
  if (!towerInspectorMenu || !inspectorPriorityGrid) return;
  const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
  const titleEl = document.getElementById('inspector-tower-title');
  const statsEl = document.getElementById('inspector-tower-stats');

  if (titleEl) {
    const icon = tower.evolutionId ? stats.evolutionIcon : stats.icon;
    const name = tower.evolutionId ? stats.evolutionName : stats.name;
    titleEl.textContent =
      tower.level === 4 ? `${icon} ${name} (Tier 4)` : `${icon} ${name} • Lyg. ${tower.level}/3`;
  }
  if (statsEl) {
    statsEl.textContent = formatTowerStatsLine(tower, stats);
  }

  inspectorPriorityGrid.innerHTML = '';
  TARGETING_PRIORITIES.forEach((prio) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `priority-btn${tower.priority === prio.id ? ' active' : ''}`;
    btn.title = prio.desc;
    btn.textContent = `${prio.icon} ${prio.label}`;
    btn.addEventListener('click', () => {
      engine.setTowerPriority(tower.padIndex, prio.id);
    });
    inspectorPriorityGrid.appendChild(btn);
  });

  // 4-ojo lygio šakotos evoliucijos (rodomos pasiekus 3 lygį)
  if (inspectorEvolutionsBox && inspectorEvolutionsGrid) {
    if (tower.level === 3 && !tower.evolutionId) {
      const evos = getTowerEvolutions(tower.type);
      inspectorEvolutionsGrid.innerHTML = '';
      evos.forEach((evo) => {
        const evoBtn = document.createElement('button');
        evoBtn.type = 'button';
        evoBtn.className = 'evo-btn';
        evoBtn.dataset.cost = String(evo.cost);
        evoBtn.disabled = engine.coins < evo.cost;
        evoBtn.innerHTML = `
          <span class="evo-title">${evo.icon} ${evo.name}</span>
          <span class="evo-cost">${evo.cost} 🪙</span>
          <span class="evo-desc">${evo.desc}</span>
        `;
        evoBtn.addEventListener('click', () => {
          engine.evolveTower(tower.padIndex, evo.id);
        });
        inspectorEvolutionsGrid.appendChild(evoBtn);
      });
      inspectorEvolutionsBox.classList.remove('hidden');
    } else {
      inspectorEvolutionsBox.classList.add('hidden');
      inspectorEvolutionsGrid.innerHTML = '';
    }
  }

  // Barakų Rally Point perkėlimo mygtukas
  if (btnRallyPoint) {
    btnRallyPoint.classList.toggle('hidden', tower.type !== 'mower_barracks');
  }

  const upgradeCost = getUpgradeCost(tower.type, tower.level);
  if (btnUpgradeTower) {
    if (tower.level >= 4) {
      btnUpgradeTower.textContent = '✦ Tier 4 Evoliucija';
      btnUpgradeTower.disabled = true;
    } else if (upgradeCost === null) {
      btnUpgradeTower.textContent = '✨ Rinkis evoliuciją';
      btnUpgradeTower.disabled = true;
    } else {
      btnUpgradeTower.textContent = `⬆️ Tobulinti (${upgradeCost} 🪙)`;
      btnUpgradeTower.disabled = engine.coins < upgradeCost;
    }
  }

  if (btnSellTower) {
    const refund = computeSellRefund(tower.totalInvested);
    btnSellTower.textContent = `💰 Parduoti (+${refund} 🪙)`;
  }

  padBuildMenu?.classList.add('hidden');
  towerInspectorMenu.classList.remove('hidden');
  positionFloatingMenu(towerInspectorMenu, pad.x, pad.y);
}

function syncSelectionUI() {
  if (engine.placingRallyPadIndex !== null) {
    closePadMenus();
    return;
  }
  if (engine.selectedPadIndex === null) {
    closePadMenus();
    return;
  }
  const pad = engine.map.pads[engine.selectedPadIndex];
  if (!pad) {
    closePadMenus();
    return;
  }
  const tower = engine.getTowerAtPad(engine.selectedPadIndex);
  if (tower) {
    renderTowerInspectorMenu(pad, tower);
  } else {
    renderPadBuildMenu(pad);
  }
}

function syncBattleUI() {
  const heartsEl = document.getElementById('hud-hearts');
  const starsPreviewEl = document.getElementById('hud-stars-preview');
  const coinsEl = document.getElementById('hud-coins');
  const waveEl = document.getElementById('hud-wave');

  if (heartsEl) heartsEl.textContent = String(engine.hearts);
  if (starsPreviewEl) {
    const stars = calculateStarsForHearts(engine.hearts);
    starsPreviewEl.textContent = stars > 0 ? '⭐'.repeat(stars) : '💔';
  }
  if (coinsEl) coinsEl.textContent = String(engine.coins);
  if (waveEl) waveEl.textContent = `${engine.wave} / ${engine.map.maxWaves}`;

  if (btnSpeedToggle) {
    btnSpeedToggle.textContent = `⏩ ${engine.speedMultiplier}x`;
    btnSpeedToggle.classList.toggle('is-active', engine.speedMultiplier === 2);
  }
  if (btnPauseToggle) {
    btnPauseToggle.textContent = engine.manualPaused ? '▶️ Tęsti' : '⏸ Pauzė';
    btnPauseToggle.classList.toggle('is-active', engine.manualPaused);
  }

  if (btnCallWave && uiCallWaveLabel && uiEarlyWaveBonus) {
    const canCall = engine.canCallWaveEarly();
    btnCallWave.disabled = !canCall;
    btnCallWave.title = engine.nextWavePreview?.headline || 'Kviesti kitą bangą';

    if (engine.wave >= engine.map.maxWaves) {
      uiCallWaveLabel.textContent = engine.gameResult ? '🏁 Kova baigta' : `⚔️ Paskutinė banga (${engine.wave}/${engine.map.maxWaves})`;
      uiEarlyWaveBonus.classList.add('hidden');
    } else if (engine.wave === 0) {
      uiCallWaveLabel.textContent = '🌊 Pradėti 1-ąją bangą!';
      uiEarlyWaveBonus.classList.add('hidden');
    } else if (canCall) {
      const nextWave = engine.wave + 1;
      const bonus = engine.getEarlyWaveBonusCoins();
      const secText = engine.interWaveTimer > 0 ? ` (${Math.ceil(engine.interWaveTimer)}s)` : '';
      uiCallWaveLabel.textContent = `🔔 Kviesti ${nextWave}-ąją bangą${secText}`;
      if (bonus > 0) {
        uiEarlyWaveBonus.textContent = `+${bonus} 🪙`;
        uiEarlyWaveBonus.classList.remove('hidden');
      } else {
        uiEarlyWaveBonus.classList.add('hidden');
      }
    } else {
      uiCallWaveLabel.textContent = `⚔️ Vyksta ${engine.wave}/${engine.map.maxWaves} banga...`;
      uiEarlyWaveBonus.classList.add('hidden');
    }
  }

  // Jei atidarytas statybos ar inspektoriaus langas – atnaujiname įperkamumo būseną
  syncBuildMenuAffordability();
  if (towerInspectorMenu && !towerInspectorMenu.classList.contains('hidden') && engine.selectedPadIndex !== null) {
    const t = engine.getTowerAtPad(engine.selectedPadIndex);
    if (t && btnUpgradeTower) {
      const upCost = getUpgradeCost(t.type, t.level);
      btnUpgradeTower.disabled = t.level >= 3 || upCost === null || engine.coins < upCost;
    }
    if (inspectorEvolutionsGrid && !inspectorEvolutionsBox?.classList.contains('hidden')) {
      inspectorEvolutionsGrid.querySelectorAll('.evo-btn').forEach((evoBtn) => {
        const c = Number(evoBtn.dataset.cost) || 0;
        evoBtn.disabled = engine.coins < c;
      });
    }
  }

  // Išsaugome pasiektą geriausią bangą
  if (activeProfile && engine.wave > (saveData[activeProfile]?.bestWave || 0)) {
    saveData[activeProfile].bestWave = engine.wave;
    persistSaveData(saveData);
    updateProfileCards();
  }
}

function handleGameResult(result) {
  if (!result || !resultOverlay) return;
  closePadMenus();

  const iconEl = document.getElementById('result-icon');
  const titleEl = document.getElementById('result-title');
  const starsEl = document.getElementById('result-stars');
  const descEl = document.getElementById('result-desc');
  const bucket = activeProfile ? saveData[activeProfile] : null;
  const currentLvl = getLevelById(engine.mapId);
  const nextLvl =
    currentLvl.levelNumber < CAMPAIGN_LEVELS.length
      ? getLevelById(currentLvl.levelNumber + 1)
      : null;

  if (result.status === 'victory') {
    if (bucket) {
      bucket.levelStars[engine.mapId] = Math.max(bucket.levelStars[engine.mapId] || 0, result.stars);
      bucket.stars = Object.values(bucket.levelStars).reduce((acc, s) => acc + s, 0);
      bucket.bestWave = Math.max(bucket.bestWave || 0, result.wave);
      persistSaveData(saveData);
      updateProfileCards();
    }
    if (iconEl) iconEl.textContent = '🏆';
    if (titleEl) titleEl.textContent = `${engine.map.title} APGINTAS!`;
    if (starsEl) starsEl.textContent = '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
    if (descEl) {
      descEl.textContent = `Išsaugojai ${result.hearts} / 20 širdelių ir pelnei ${result.stars} žvaigždutę(-es)!`;
    }

    if (btnResultNextLevel && nextLvl && bucket) {
      const nextUnlocked = bucket.unlockedLevels.includes(nextLvl.id);
      btnResultNextLevel.textContent = nextUnlocked
        ? `▶️ Kitas lygis (${nextLvl.levelNumber}) →`
        : `🔐 Žinių Vartai: Lygis ${nextLvl.levelNumber} →`;
      btnResultNextLevel.dataset.nextLevelId = nextLvl.id;
      btnResultNextLevel.classList.remove('hidden');
    } else {
      btnResultNextLevel?.classList.add('hidden');
    }
  } else {
    if (iconEl) iconEl.textContent = '💔';
    if (titleEl) titleEl.textContent = 'TVIRTOVĖ NEATLAIKĖ!';
    if (starsEl) starsEl.textContent = '☆☆☆';
    if (descEl) {
      descEl.textContent = `Pasiekei ${result.wave}-ąją bangą. Pakeisk bokštelių taikymo prioritetus arba statyk prie sankirtos ir bandyk dar kartą!`;
    }
    btnResultNextLevel?.classList.add('hidden');
  }

  resultOverlay.classList.remove('hidden');
}

function generateKnowledgeQuestion(profileId) {
  let a;
  let b;
  let answer;
  let promptText;

  if (profileId === 'linas') {
    // 1 klasė: sudėtis ir atimtis iki 20
    const isAdd = Math.random() < 0.6;
    if (isAdd) {
      a = 3 + Math.floor(Math.random() * 10);
      b = 2 + Math.floor(Math.random() * (20 - a));
      answer = a + b;
      promptText = `${a} + ${b} = ?`;
    } else {
      a = 8 + Math.floor(Math.random() * 12);
      b = 2 + Math.floor(Math.random() * (a - 2));
      answer = a - b;
      promptText = `${a} - ${b} = ?`;
    }
  } else {
    // 3 klasė: daugyba, dalyba arba dviaukštė sudėtis
    const mode = Math.floor(Math.random() * 3);
    if (mode === 0) {
      a = 3 + Math.floor(Math.random() * 7);
      b = 3 + Math.floor(Math.random() * 7);
      answer = a * b;
      promptText = `${a} × ${b} = ?`;
    } else if (mode === 1) {
      b = 3 + Math.floor(Math.random() * 7);
      answer = 3 + Math.floor(Math.random() * 8);
      a = b * answer;
      promptText = `${a} ÷ ${b} = ?`;
    } else {
      a = 24 + Math.floor(Math.random() * 45);
      b = 12 + Math.floor(Math.random() * 29);
      answer = a + b;
      promptText = `${a} + ${b} = ?`;
    }
  }

  const optionsSet = new Set([answer]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 7) - 3) || 4;
    const candidate = Math.max(1, answer + delta);
    optionsSet.add(candidate);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
  return { promptText, answer, options };
}

function openKnowledgeGateModal(targetLevelId) {
  if (!knowledgeGateModal || !activeProfile) return;
  const targetLvl = getLevelById(targetLevelId);
  pendingGateLevelId = targetLvl.id;

  if (kgTitleEl) {
    kgTitleEl.textContent = `Atrakink ${targetLvl.levelNumber} lygį: ${targetLvl.title.replace(/^\d+\.\s*/, '')}`;
  }
  if (kgFeedbackEl) {
    kgFeedbackEl.classList.add('hidden');
    kgFeedbackEl.textContent = '';
  }

  const renderRound = () => {
    const q = generateKnowledgeQuestion(activeProfile);
    if (kgQuestionEl) kgQuestionEl.textContent = q.promptText;
    if (!kgOptionsEl) return;
    kgOptionsEl.innerHTML = '';

    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kg-opt-btn';
      btn.textContent = String(opt);
      btn.addEventListener('click', () => {
        if (opt === q.answer) {
          const bucket = saveData[activeProfile];
          if (!bucket.unlockedLevels.includes(pendingGateLevelId)) {
            bucket.unlockedLevels.push(pendingGateLevelId);
            persistSaveData(saveData);
          }
          knowledgeGateModal.classList.add('hidden');
          const lvlToStart = pendingGateLevelId;
          pendingGateLevelId = null;
          renderCampaignMap();
          enterBattleLevel(lvlToStart);
        } else {
          if (kgFeedbackEl) {
            kgFeedbackEl.textContent = '❌ Beveik! Pamėgink kitą užduotį ramiai suskaičiavęs.';
            kgFeedbackEl.classList.remove('hidden');
          }
          renderRound();
        }
      });
      kgOptionsEl.appendChild(btn);
    });
  };

  renderRound();
  knowledgeGateModal.classList.remove('hidden');
}

function renderCampaignMap() {
  if (!activeProfile) return;
  const bucket = saveData[activeProfile];

  if (campaignTotalStars) {
    campaignTotalStars.textContent = `${bucket.stars} / ${CAMPAIGN_LEVELS.length * 3}`;
  }
  if (campaignUnlockedCount) {
    campaignUnlockedCount.textContent = `${bucket.unlockedLevels.length} / ${CAMPAIGN_LEVELS.length}`;
  }

  if (campaignZonesBar) {
    campaignZonesBar.innerHTML = '';
    CAMPAIGN_ZONES.forEach((z) => {
      const pill = document.createElement('div');
      pill.className = 'campaign-zone-pill';
      pill.style.borderColor = z.accent;
      pill.innerHTML = `
        <strong>${z.icon} ${z.zoneId}. ${z.name}</strong>
        <span>${z.desc}</span>
      `;
      campaignZonesBar.appendChild(pill);
    });
  }

  // Kelio SVG linija per visus 15 lygių taškų
  if (campaignRoadShadow && campaignRoadLine) {
    const pts = CAMPAIGN_LEVELS.map((l) => ({
      x: (l.campaignPos.x / 100) * 1000,
      y: (l.campaignPos.y / 100) * 520
    }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` Q ${cx} ${prev.y}, ${curr.x} ${curr.y}`;
    }
    campaignRoadShadow.setAttribute('d', d);
    campaignRoadLine.setAttribute('d', d);
  }

  if (campaignNodesLayer) {
    campaignNodesLayer.innerHTML = '';
    CAMPAIGN_LEVELS.forEach((lvl, idx) => {
      const isUnlocked = bucket.unlockedLevels.includes(lvl.id);
      const stars = bucket.levelStars[lvl.id] || 0;
      const isBeaten = stars > 0;
      const prevLvl = idx > 0 ? CAMPAIGN_LEVELS[idx - 1] : null;
      const prevBeaten = !prevLvl || (bucket.levelStars[prevLvl.id] || 0) > 0;
      const isGateReady = !isUnlocked && prevBeaten;
      const isBoss = lvl.levelInZone === 3;
      const zone = CAMPAIGN_ZONES.find((z) => z.zoneId === lvl.zoneId);

      const node = document.createElement('button');
      node.type = 'button';
      node.className = `campaign-node ${
        isUnlocked
          ? isBeaten
            ? 'is-unlocked is-beaten'
            : 'is-unlocked'
          : isGateReady
            ? 'is-gate-ready'
            : 'is-locked'
      }${isBoss ? ' is-boss' : ''}`;
      node.style.left = `${lvl.campaignPos.x}%`;
      node.style.top = `${lvl.campaignPos.y}%`;
      if (isUnlocked && zone) {
        node.style.borderColor = isBeaten ? '#4ade80' : zone.accent;
      }

      node.title = isUnlocked
        ? `${lvl.title} (${lvl.maxWaves} bangos)`
        : isGateReady
          ? `Pasiruošęs atrakinti: ${lvl.title} – spausk ir įveik Žinių Vartus!`
          : `Užrakinta – pirmiausia įveik ${lvl.levelNumber - 1}-ąjį lygį`;

      const statusBadge = isUnlocked
        ? `${isBoss ? '👑 ' : ''}${lvl.levelNumber}`
        : isGateReady
          ? `🔐 ${lvl.levelNumber}`
          : `🔒 ${lvl.levelNumber}`;

      const starsText = isUnlocked
        ? '★'.repeat(stars) + '☆'.repeat(3 - stars)
        : isGateReady
          ? 'ŽIN. VARTAI'
          : 'UŽRAKINTA';

      node.innerHTML = `
        <span class="node-num">${statusBadge}</span>
        <span class="node-stars">${starsText}</span>
        <span class="node-waves">${lvl.maxWaves} bang.</span>
      `;

      node.addEventListener('click', () => {
        if (isUnlocked) {
          enterBattleLevel(lvl.id);
        } else if (isGateReady) {
          openKnowledgeGateModal(lvl.id);
        }
      });

      campaignNodesLayer.appendChild(node);
    });
  }
}

function showCampaignMapView() {
  if (!activeProfile) return;
  closePadMenus();
  resultOverlay?.classList.add('hidden');
  knowledgeGateModal?.classList.add('hidden');
  engine.setPaused(false);
  screenGame?.classList.add('hidden');
  screenCampaign?.classList.remove('hidden');
  renderCampaignMap();
}

function enterBattleLevel(mapId) {
  if (!activeProfile) return;
  screenCampaign?.classList.add('hidden');
  screenGame?.classList.remove('hidden');
  selectMap(mapId);
}

function selectProfile(profileId) {
  activeProfile = profileId === 'linas' ? 'linas' : 'lukas';
  const mod = getProfileModifier(activeProfile);

  screenProfiles?.classList.add('hidden');
  topProfilePill?.classList.remove('hidden');
  btnSwitchProfile?.classList.remove('hidden');
  resultOverlay?.classList.add('hidden');

  if (uiActiveProfile) {
    uiActiveProfile.textContent = `👤 ${mod.label}`;
  }

  const badgeEl = document.getElementById('ui-profile-balance-badge');
  if (badgeEl) {
    badgeEl.textContent = mod.badgeText;
    badgeEl.classList.toggle('is-lukas', activeProfile === 'lukas');
  }

  engine.setProfile(activeProfile);
  showCampaignMapView();
  const allowed = playtimeTimer.setActiveChild(activeProfile);
  engine.setExternalLocked(!allowed);
}

function showProfileScreen() {
  activeProfile = null;
  closePadMenus();
  resultOverlay?.classList.add('hidden');
  knowledgeGateModal?.classList.add('hidden');
  playtimeTimer.clearActiveChild();
  screenGame?.classList.add('hidden');
  screenCampaign?.classList.add('hidden');
  screenProfiles?.classList.remove('hidden');
  topProfilePill?.classList.add('hidden');
  btnSwitchProfile?.classList.add('hidden');
  updateProfileCards();
}

function selectMap(mapId) {
  closePadMenus();
  resultOverlay?.classList.add('hidden');
  engine.loadMap(mapId, activeProfile || 'lukas');

  const badgeEl = document.getElementById('ui-active-level-badge');
  if (badgeEl) {
    badgeEl.textContent = engine.map.badge;
  }

  const titleEl = document.getElementById('map-title');
  const subEl = document.getElementById('map-subtitle');
  if (titleEl) titleEl.textContent = engine.map.title;
  if (subEl) subEl.textContent = engine.map.subtitle;
}

function animationLoop(timestamp) {
  if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
  const rawDt = Math.min(0.05, (timestamp - lastFrameTimestamp) / 1000);
  lastFrameTimestamp = timestamp;

  if (activeProfile && isInBattleView()) {
    engine.update(rawDt);
    engine.render();
  }

  requestAnimationFrame(animationLoop);
}

// ==================== ĮVYKIŲ SUSIEJIMAS ====================
document.getElementById('btn-select-linas')?.addEventListener('click', () => selectProfile('linas'));
document.getElementById('btn-select-lukas')?.addEventListener('click', () => selectProfile('lukas'));
btnSwitchProfile?.addEventListener('click', showProfileScreen);
document.getElementById('btn-back-campaign')?.addEventListener('click', showCampaignMapView);
document.getElementById('btn-result-campaign')?.addEventListener('click', showCampaignMapView);
document.getElementById('btn-close-kg')?.addEventListener('click', () => {
  knowledgeGateModal?.classList.add('hidden');
});

btnResultNextLevel?.addEventListener('click', () => {
  const nextId = btnResultNextLevel.dataset.nextLevelId;
  if (!nextId || !activeProfile) return;
  const bucket = saveData[activeProfile];
  if (bucket.unlockedLevels.includes(nextId)) {
    enterBattleLevel(nextId);
  } else {
    openKnowledgeGateModal(nextId);
  }
});

btnSpeedToggle?.addEventListener('click', () => {
  engine.toggleSpeed();
});

btnPauseToggle?.addEventListener('click', () => {
  engine.togglePause();
});

btnCallWave?.addEventListener('click', () => {
  engine.callNextWaveEarly();
});

document.getElementById('btn-restart-map')?.addEventListener('click', () => {
  selectMap(engine.mapId);
});

document.getElementById('btn-result-replay')?.addEventListener('click', () => {
  selectMap(engine.mapId);
});

document.getElementById('btn-close-build-menu')?.addEventListener('click', () => {
  engine.clearSelection();
});

document.getElementById('btn-close-inspector')?.addEventListener('click', () => {
  engine.clearSelection();
});

document.getElementById('btn-close-wave-preview')?.addEventListener('click', () => {
  engine.pinnedWavePreview = false;
  renderWavePreviewCard(null);
});

btnUpgradeTower?.addEventListener('click', () => {
  if (engine.selectedPadIndex !== null) {
    engine.upgradeTower(engine.selectedPadIndex);
  }
});

btnRallyPoint?.addEventListener('click', () => {
  if (engine.selectedPadIndex !== null) {
    engine.startRallyPlacement(engine.selectedPadIndex);
  }
});

btnSellTower?.addEventListener('click', () => {
  if (engine.selectedPadIndex !== null) {
    engine.sellTower(engine.selectedPadIndex);
  }
});

canvas?.addEventListener('click', (event) => {
  if (!activeProfile) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const mx = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const my = ((event.clientY - rect.top) * canvas.height) / rect.height;
  engine.handleCanvasTap(mx, my);
});

canvas?.addEventListener('pointermove', (event) => {
  if (!activeProfile || event.pointerType !== 'mouse') return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const mx = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const my = ((event.clientY - rect.top) * canvas.height) / rect.height;
  engine.handleCanvasHover(mx, my);
});

canvas?.addEventListener('pointerleave', () => {
  if (!engine.pinnedWavePreview) {
    renderWavePreviewCard(null);
  }
});

updateProfileCards();
requestAnimationFrame(animationLoop);
