// ==================== BUBIŲ TVIRTOVĖ (TOWER DEFENSE KARKASAS) ====================
import {
  initPlaytimeTimer,
  getRemainingPlaytimeSeconds,
  formatMMSS
} from '../../../shared/playtime-timer.js?v=20261121a';

const SAVE_KEY = 'gynyba_save_v1';

const MAPS = {
  bubiai: {
    id: 'bubiai',
    title: '🏡 Bubių kiemas',
    subtitle: 'Paspausk ant švytinčio statybos taško kieme, kad pastatytum bokštelį!',
    bgTop: '#0d261c',
    bgBottom: '#071411',
    pathColor: '#92744a',
    pathBorder: '#5b4528',
    waypoints: [
      { x: 0, y: 240 },
      { x: 180, y: 240 },
      { x: 180, y: 115 },
      { x: 450, y: 115 },
      { x: 450, y: 365 },
      { x: 700, y: 365 },
      { x: 700, y: 220 },
      { x: 845, y: 220 }
    ],
    pads: [
      { x: 115, y: 165 },
      { x: 260, y: 185 },
      { x: 370, y: 185 },
      { x: 525, y: 245 },
      { x: 615, y: 295 },
      { x: 770, y: 145 }
    ]
  },
  kurtuvenai: {
    id: 'kurtuvenai',
    title: '🌲 Kurtuvėnai',
    subtitle: 'Saugok Kurtuvėnų pušynų taką – pastatyk svaidykles posūkiuose!',
    bgTop: '#0b2229',
    bgBottom: '#071319',
    pathColor: '#6d5c46',
    pathBorder: '#3e3326',
    waypoints: [
      { x: 0, y: 120 },
      { x: 240, y: 120 },
      { x: 310, y: 360 },
      { x: 560, y: 360 },
      { x: 620, y: 135 },
      { x: 845, y: 135 }
    ],
    pads: [
      { x: 140, y: 195 },
      { x: 315, y: 210 },
      { x: 435, y: 285 },
      { x: 515, y: 215 },
      { x: 685, y: 225 },
      { x: 760, y: 70 }
    ]
  },
  dagilelis: {
    id: 'dagilelis',
    title: '🏛️ Dagilėlio aikštė',
    subtitle: 'Apsaugok Dagilėlio aikštės centrinę tvirtovę lazeriais ir rezonatoriais!',
    bgTop: '#181a38',
    bgBottom: '#090c1f',
    pathColor: '#64748b',
    pathBorder: '#334155',
    waypoints: [
      { x: 0, y: 360 },
      { x: 180, y: 360 },
      { x: 180, y: 130 },
      { x: 390, y: 130 },
      { x: 390, y: 255 },
      { x: 610, y: 255 },
      { x: 610, y: 125 },
      { x: 760, y: 125 },
      { x: 760, y: 310 },
      { x: 845, y: 310 }
    ],
    pads: [
      { x: 110, y: 250 },
      { x: 270, y: 205 },
      { x: 320, y: 330 },
      { x: 495, y: 180 },
      { x: 520, y: 335 },
      { x: 685, y: 220 }
    ]
  }
};

const TOWER_TYPES = {
  laser: {
    id: 'laser',
    name: 'Lazerio bokštas',
    cost: 50,
    range: 160,
    cooldown: 0.45,
    damage: 18,
    color: '#38bdf8',
    icon: '🔦'
  },
  acorn: {
    id: 'acorn',
    name: 'Kurtuvėnų svaidyklė',
    cost: 65,
    range: 210,
    cooldown: 0.85,
    damage: 34,
    color: '#fbbf24',
    icon: '🌰'
  },
  sonic: {
    id: 'sonic',
    name: 'Dagilėlio rezonatorius',
    cost: 80,
    range: 145,
    cooldown: 0.7,
    damage: 20,
    slowFactor: 0.55,
    color: '#fb7185',
    icon: '🔔'
  }
};

function loadSaveData() {
  const def = {
    linas: { stars: 0, bestWave: 0 },
    lukas: { stars: 0, bestWave: 0 }
  };
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return {
      linas: {
        stars: Math.max(0, Number(parsed?.linas?.stars) || 0),
        bestWave: Math.max(0, Number(parsed?.linas?.bestWave) || 0)
      },
      lukas: {
        stars: Math.max(0, Number(parsed?.lukas?.stars) || 0),
        bestWave: Math.max(0, Number(parsed?.lukas?.bestWave) || 0)
      }
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

// ==================== BŪSENA ====================
let saveData = loadSaveData();
let activeProfile = null; // 'linas' | 'lukas'
let currentMapId = 'bubiai';
let selectedTowerType = 'laser';
let hp = 20;
let energy = 150;
let wave = 0;
let placedTowers = []; // { padIndex, type, x, y, cooldownLeft, beamTarget, beamTimer }
let enemies = []; // { hp, maxHp, speed, waypointIdx, x, y, slowTimer }
let waveActive = false;
let spawnRemaining = 0;
let spawnTimer = 0;
let lastFrameTime = 0;

// ==================== DOM NUORODOS ====================
const screenProfiles = document.getElementById('screen-profiles');
const screenGame = document.getElementById('screen-game');
const topProfilePill = document.getElementById('top-profile-pill');
const uiActiveProfile = document.getElementById('ui-active-profile');
const btnSwitchProfile = document.getElementById('btn-switch-profile');
const canvas = document.getElementById('gynyba-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const playtimeTimer = initPlaytimeTimer({
  containerSelector: '#top-playtime-slot',
  portalUrl: '../../index.html',
  shouldCount: () => Boolean(activeProfile),
  onSwitchProfile: () => showProfileScreen(),
  onTick: () => updateProfileTimeCards()
});

function updateProfileTimeCards() {
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

function updateBattleHud() {
  const hpEl = document.getElementById('hud-hp');
  const energyEl = document.getElementById('hud-energy');
  const waveEl = document.getElementById('hud-wave');
  if (hpEl) hpEl.textContent = String(hp);
  if (energyEl) energyEl.textContent = String(energy);
  if (waveEl) waveEl.textContent = String(wave);
}

function resetBoardState() {
  hp = activeProfile === 'linas' ? 25 : 20;
  energy = activeProfile === 'linas' ? 180 : 150;
  wave = 0;
  placedTowers = [];
  enemies = [];
  waveActive = false;
  spawnRemaining = 0;
  spawnTimer = 0;
  updateBattleHud();
}

function selectProfile(profileId) {
  activeProfile = profileId === 'lukas' ? 'lukas' : 'linas';
  screenProfiles?.classList.add('hidden');
  screenGame?.classList.remove('hidden');
  topProfilePill?.classList.remove('hidden');
  btnSwitchProfile?.classList.remove('hidden');

  if (uiActiveProfile) {
    uiActiveProfile.textContent =
      activeProfile === 'linas' ? '👤 Linas (1 klasė)' : '👤 Lukas (3 klasė)';
  }

  resetBoardState();
  selectMap(currentMapId);
  playtimeTimer.setActiveChild(activeProfile);
}

function showProfileScreen() {
  activeProfile = null;
  waveActive = false;
  enemies = [];
  playtimeTimer.clearActiveChild();
  screenGame?.classList.add('hidden');
  screenProfiles?.classList.remove('hidden');
  topProfilePill?.classList.add('hidden');
  btnSwitchProfile?.classList.add('hidden');
  updateProfileTimeCards();
}

function selectMap(mapId) {
  if (!MAPS[mapId]) return;
  currentMapId = mapId;
  const map = MAPS[mapId];

  document.querySelectorAll('.map-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mapId === mapId);
  });

  const titleEl = document.getElementById('map-title');
  const subEl = document.getElementById('map-subtitle');
  if (titleEl) titleEl.textContent = map.title;
  if (subEl) subEl.textContent = map.subtitle;

  resetBoardState();
}

function startTestWave() {
  if (!activeProfile || playtimeTimer.isLocked() || waveActive) return;
  wave += 1;
  waveActive = true;
  spawnRemaining = 5 + wave * 2;
  spawnTimer = 0.2;
  updateBattleHud();
}

function handleCanvasClick(event) {
  if (!canvas || !activeProfile || playtimeTimer.isLocked()) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (event.clientX - rect.left) * scaleX;
  const my = (event.clientY - rect.top) * scaleY;

  const map = MAPS[currentMapId];
  const padIndex = map.pads.findIndex((pad) => Math.hypot(pad.x - mx, pad.y - my) <= 28);
  if (padIndex === -1) return;

  const existing = placedTowers.find((t) => t.padIndex === padIndex);
  if (existing) return;

  const towerDef = TOWER_TYPES[selectedTowerType];
  if (!towerDef || energy < towerDef.cost) return;

  energy -= towerDef.cost;
  placedTowers.push({
    padIndex,
    type: towerDef.id,
    x: map.pads[padIndex].x,
    y: map.pads[padIndex].y,
    cooldownLeft: 0,
    beamTarget: null,
    beamTimer: 0
  });
  updateBattleHud();
}

function updateSimulation(dt) {
  if (!activeProfile || playtimeTimer.isLocked()) return;
  const map = MAPS[currentMapId];

  if (waveActive && spawnRemaining > 0) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      const startPt = map.waypoints[0];
      const baseHp = (activeProfile === 'linas' ? 40 : 52) + wave * 14;
      enemies.push({
        hp: baseHp,
        maxHp: baseHp,
        speed: (activeProfile === 'linas' ? 68 : 78) + wave * 4,
        waypointIdx: 1,
        x: startPt.x,
        y: startPt.y,
        slowTimer: 0
      });
      spawnRemaining -= 1;
      spawnTimer = 0.9;
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (enemy.slowTimer > 0) enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
    const target = map.waypoints[enemy.waypointIdx];
    if (!target) {
      enemies.splice(i, 1);
      hp = Math.max(0, hp - 1);
      updateBattleHud();
      continue;
    }

    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const speedNow = enemy.slowTimer > 0 ? enemy.speed * 0.55 : enemy.speed;
    const step = speedNow * dt;

    if (dist <= step) {
      enemy.x = target.x;
      enemy.y = target.y;
      enemy.waypointIdx += 1;
    } else if (dist > 0) {
      enemy.x += (dx / dist) * step;
      enemy.y += (dy / dist) * step;
    }
  }

  for (const tower of placedTowers) {
    const def = TOWER_TYPES[tower.type];
    if (tower.cooldownLeft > 0) tower.cooldownLeft = Math.max(0, tower.cooldownLeft - dt);
    if (tower.beamTimer > 0) tower.beamTimer = Math.max(0, tower.beamTimer - dt);

    if (tower.cooldownLeft <= 0 && enemies.length > 0) {
      const target = enemies.find((e) => Math.hypot(e.x - tower.x, e.y - tower.y) <= def.range);
      if (target) {
        target.hp -= def.damage;
        if (def.slowFactor) {
          target.slowTimer = 1.4;
        }
        tower.cooldownLeft = def.cooldown;
        tower.beamTarget = { x: target.x, y: target.y };
        tower.beamTimer = 0.16;

        if (target.hp <= 0) {
          const idx = enemies.indexOf(target);
          if (idx !== -1) enemies.splice(idx, 1);
          energy += 15;
          updateBattleHud();
        }
      }
    }
  }

  if (waveActive && spawnRemaining === 0 && enemies.length === 0) {
    waveActive = false;
    energy += 40;
    const bucket = saveData[activeProfile];
    if (wave > bucket.bestWave) {
      bucket.bestWave = wave;
      bucket.stars += 1;
      persistSaveData(saveData);
    }
    updateBattleHud();
  }
}

function renderCanvas() {
  if (!ctx || !canvas) return;
  const map = MAPS[currentMapId];
  const w = canvas.width;
  const h = canvas.height;

  // Fonas
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, map.bgTop);
  bgGrad.addColorStop(1, map.bgBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtilus taktinis tinklelis
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 45) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 45) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // Kelias
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = map.pathBorder;
  ctx.lineWidth = 46;
  ctx.beginPath();
  map.waypoints.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();

  ctx.strokeStyle = map.pathColor;
  ctx.lineWidth = 34;
  ctx.stroke();

  // Tvirtovė maršruto gale
  const endPt = map.waypoints[map.waypoints.length - 1];
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(endPt.x, endPt.y, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '24px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏰', endPt.x, endPt.y + 1);

  // Bokštelių statybos taškai
  map.pads.forEach((pad, idx) => {
    const built = placedTowers.find((t) => t.padIndex === idx);
    if (!built) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillText('+', pad.x, pad.y + 1);
    }
  });

  // Pastatyti bokšteliai ir šūviai
  placedTowers.forEach((tower) => {
    const def = TOWER_TYPES[tower.type];
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, def.range, 0, Math.PI * 2);
    ctx.stroke();

    if (tower.beamTimer > 0 && tower.beamTarget) {
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y);
      ctx.lineTo(tower.beamTarget.x, tower.beamTarget.y);
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = '20px Outfit, sans-serif';
    ctx.fillText(def.icon, tower.x, tower.y + 1);
  });

  // Priešai
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.slowTimer > 0 ? '#38bdf8' : '#f43f5e';
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(enemy.x - 14, enemy.y - 22, 28, 5);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(enemy.x - 14, enemy.y - 22, 28 * ratio, 5);
  });
}

function gameLoop(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const dt = Math.min(0.05, (timestamp - lastFrameTime) / 1000);
  lastFrameTime = timestamp;

  updateSimulation(dt);
  renderCanvas();
  requestAnimationFrame(gameLoop);
}

// ==================== ĮVYKIŲ SUSIEJIMAS ====================
document.getElementById('btn-select-linas')?.addEventListener('click', () => selectProfile('linas'));
document.getElementById('btn-select-lukas')?.addEventListener('click', () => selectProfile('lukas'));
btnSwitchProfile?.addEventListener('click', showProfileScreen);

document.querySelectorAll('.map-tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mapId) selectMap(btn.dataset.mapId);
  });
});

document.querySelectorAll('.tower-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.tower;
    if (!type || !TOWER_TYPES[type]) return;
    selectedTowerType = type;
    document.querySelectorAll('.tower-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tower === type);
    });
  });
});

document.getElementById('btn-start-wave')?.addEventListener('click', startTestWave);
document.getElementById('btn-clear-towers')?.addEventListener('click', () => {
  if (playtimeTimer.isLocked()) return;
  resetBoardState();
});
canvas?.addEventListener('click', handleCanvasClick);

updateProfileTimeCards();
requestAnimationFrame(gameLoop);
