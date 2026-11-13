// ==================== PROTO LABORATORIJA (LOGIKOS ŽAIDIMAS 1–3 KL.) ====================
// Progreso raktas localStorage: 'proto_lab_progress'
import { PinPullEngine, PINPULL_LEVELS, CANVAS_W, CANVAS_H } from './pinpull.js';
import { SokobanGame, SOKOBAN_LEVELS } from './sokoban.js';
import { LaserMirrorsEngine, LASER_LEVELS, LASER_CANVAS_W, LASER_CANVAS_H } from './lasers.js';
import { CircuitEngine, CIRCUIT_LEVELS, CIRCUIT_CANVAS_W, CIRCUIT_CANVAS_H } from './circuits.js';
import {
  BalanceScaleEngine,
  BALANCE_LEVELS,
  ITEM_CATALOG,
  BALANCE_CANVAS_W,
  BALANCE_CANVAS_H
} from './balance.js';

export const STORAGE_KEY = 'proto_lab_progress';

export function createDefaultProgress() {
  return {
    activeDifficulty: null,
    grade1: {
      solvedLevels: [],
      crystals: 0
    },
    grade3: {
      solvedLevels: [],
      crystals: 0
    }
  };
}

export function loadLabProgress() {
  const def = createDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return def;

    const normalizeGrade = (g) => ({
      solvedLevels: Array.isArray(g?.solvedLevels) ? Array.from(new Set(g.solvedLevels)) : [],
      crystals: Math.max(0, Number(g?.crystals) || 0)
    });

    const activeDifficulty =
      parsed.activeDifficulty === 'grade1' || parsed.activeDifficulty === 'grade3'
        ? parsed.activeDifficulty
        : null;

    return {
      activeDifficulty,
      grade1: normalizeGrade(parsed.grade1),
      grade3: normalizeGrade(parsed.grade3)
    };
  } catch (e) {
    return def;
  }
}

export function saveLabProgress(progressObj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressObj));
  } catch (e) {
    // Ignoruojame saugojimo klaidas
  }
}

// ==================== MINI EKSPERIMENTŲ KONFIGŪRACIJA ====================
export const LAB_LEVELS = {
  grade1: [
    {
      id: 'g1_laser_1',
      kind: 'laser',
      badge: '🔦 LAZERIO KELIAS',
      title: '1. Veidrodžio posūkis',
      instruction: 'Paspausk ant geltono veidrodžio (/ arba \\), kad lazerio spindulys pataikytų į 💎 kristalą!',
      reward: 10,
      cols: 4,
      rows: 3,
      emitter: { r: 0, c: 0, dir: 'R' },
      target: { r: 2, c: 3 },
      walls: [
        [1, 0],
        [1, 1]
      ],
      mirrors: [
        { r: 0, c: 3, type: '/' }
      ]
    },
    {
      id: 'g1_switches_1',
      kind: 'switches',
      badge: '⚙️ ENERGIJOS GRANDINĖ',
      title: '2. Laboratorijos šviesos',
      instruction: 'Įjunk tik tuos energijos blokus, kurių suma lygi lygiai 10 V!',
      reward: 10,
      targetSum: 10,
      values: [2, 5, 3, 6]
    },
    {
      id: 'g1_sequence_1',
      kind: 'sequence',
      badge: '🔮 KRISTALŲ ŠIFRAS',
      title: '3. Skaičių banga',
      instruction: 'Atspėk, koks skaičius turėtų būti vietoj [ ? ] robotuko ekrane:',
      reward: 15,
      prompt: '2  →  4  →  6  →  8  →  [ ? ]',
      answer: 10,
      choices: [9, 10, 11, 12]
    }
  ],
  grade3: [
    {
      id: 'g3_laser_1',
      kind: 'laser',
      badge: '🔦 LAZERIŲ LABIRINTAS',
      title: '1. Dvigubas atspindys',
      instruction: 'Sudėliok abu veidrodžius (/ arba \\), kad spindulys aplenktų sienas ir pasiektų 💎!',
      reward: 15,
      cols: 5,
      rows: 4,
      emitter: { r: 0, c: 0, dir: 'R' },
      target: { r: 3, c: 0 },
      walls: [
        [1, 1],
        [1, 2],
        [2, 1],
        [2, 2]
      ],
      mirrors: [
        { r: 0, c: 4, type: '/' },
        { r: 3, c: 4, type: '\\' }
      ]
    },
    {
      id: 'g3_switches_1',
      kind: 'switches',
      badge: '⚡ REAKTORIAUS GALIA',
      title: '2. Tikslus krūvis (27 V)',
      instruction: 'Įjunk tinkamą jungiklių derinį, kad reaktorius pasiektų lygiai 27 V!',
      reward: 15,
      targetSum: 27,
      values: [4, 8, 12, 15, 3]
    },
    {
      id: 'g3_sequence_1',
      kind: 'sequence',
      badge: '🧬 INŽINERINIS ŠIFRAS',
      title: '3. Dvigubėjančios jėgos',
      instruction: 'Rask dėsningumą ir nustatyk trūkstamą skaičių:',
      reward: 20,
      prompt: '3  →  6  →  12  →  24  →  [ ? ]',
      answer: 48,
      choices: [36, 42, 48, 54]
    }
  ]
};

// ==================== BŪSENA ====================
let progress = loadLabProgress();
let currentDifficulty = null;
let currentMode = 'pinpull'; // 'pinpull' | 'sokoban' | 'laser' | 'circuit' | 'balance' | 'mini'
let activeLevelIndex = 0;
let mirrorStates = [];
let switchStates = [];
let pinEngine = null;
let sokobanGame = null;
let laserEngine = null;
let circuitEngine = null;
let balanceEngine = null;
let laserMoveToolActive = false;
let currentSokobanDef = null;
let currentSokobanTotal = 0;

// ==================== DOM NUORODOS ====================
const startScreen = document.getElementById('start-screen');
const labScreen = document.getElementById('lab-screen');
const topDiffPill = document.getElementById('top-difficulty-pill');
const uiActiveRank = document.getElementById('ui-active-rank');
const uiTotalCrystals = document.getElementById('ui-total-crystals');
const pinCanvas = document.getElementById('pinpull-canvas');
const pinPullStage = document.getElementById('pinpull-stage');
const sokobanStage = document.getElementById('sokoban-stage');
const laserCanvas = document.getElementById('laser-canvas');
const laserStage = document.getElementById('laser-stage');
const circuitCanvas = document.getElementById('circuit-canvas');
const circuitStage = document.getElementById('circuit-stage');
const balanceCanvas = document.getElementById('balance-canvas');
const balanceStage = document.getElementById('balance-stage');
const miniStage = document.getElementById('puzzle-stage');

function getDifficultyLabel(diff) {
  return diff === 'grade1'
    ? '1 klasė (Jaunasis išradėjas)'
    : '3 klasė (Vyriausiasis inžinierius)';
}

function getAllLevelsForDiff(diff) {
  return [
    ...PINPULL_LEVELS[diff],
    ...SOKOBAN_LEVELS[diff],
    ...LASER_LEVELS[diff],
    ...CIRCUIT_LEVELS[diff],
    ...BALANCE_LEVELS[diff],
    ...LAB_LEVELS[diff]
  ];
}

function getCurrentModeLevels(diff = currentDifficulty) {
  if (currentMode === 'pinpull') return PINPULL_LEVELS[diff];
  if (currentMode === 'sokoban') return SOKOBAN_LEVELS[diff];
  if (currentMode === 'laser') return LASER_LEVELS[diff];
  if (currentMode === 'circuit') return CIRCUIT_LEVELS[diff];
  if (currentMode === 'balance') return BALANCE_LEVELS[diff];
  return LAB_LEVELS[diff];
}

function updateSummaryUI() {
  const g1Total = getAllLevelsForDiff('grade1').length;
  const g3Total = getAllLevelsForDiff('grade3').length;

  const g1Solved = progress.grade1.solvedLevels.length;
  const g3Solved = progress.grade3.solvedLevels.length;

  const g1Crystals = progress.grade1.crystals;
  const g3Crystals = progress.grade3.crystals;

  const g1SolvedEl = document.getElementById('g1-solved-text');
  const g1CrysEl = document.getElementById('g1-crystals-text');
  const g3SolvedEl = document.getElementById('g3-solved-text');
  const g3CrysEl = document.getElementById('g3-crystals-text');

  if (g1SolvedEl) g1SolvedEl.textContent = `${g1Solved} / ${g1Total}`;
  if (g1CrysEl) g1CrysEl.textContent = String(g1Crystals);
  if (g3SolvedEl) g3SolvedEl.textContent = `${g3Solved} / ${g3Total}`;
  if (g3CrysEl) g3CrysEl.textContent = String(g3Crystals);

  if (currentDifficulty) {
    const activeData = progress[currentDifficulty];
    const totalLevels = getAllLevelsForDiff(currentDifficulty).length;
    uiTotalCrystals.textContent = String(activeData.crystals);
    uiActiveRank.textContent = currentDifficulty === 'grade1' ? '🔬 1 klasė' : '⚡ 3 klasė';
    document.getElementById('lab-mode-title').textContent = getDifficultyLabel(currentDifficulty);
    document.getElementById('lab-mode-stats').textContent =
      `Išspręsta: ${activeData.solvedLevels.length} / ${totalLevels} • 💎 ${activeData.crystals}`;
  } else {
    uiTotalCrystals.textContent = String(g1Crystals + g3Crystals);
  }
}

export function selectDifficulty(difficulty) {
  if (difficulty !== 'grade1' && difficulty !== 'grade3') return;
  currentDifficulty = difficulty;
  progress.activeDifficulty = difficulty;
  saveLabProgress(progress);

  startScreen.classList.add('hidden');
  labScreen.classList.remove('hidden');
  topDiffPill.classList.remove('hidden');

  currentMode = 'pinpull';
  activeLevelIndex = 0;
  syncModeTabsUI();
  updateSummaryUI();
  renderLevelsStrip();
  loadActiveLevel();
}

function showDifficultyScreen() {
  destroyPinEngine();
  destroyLaserEngine();
  destroyCircuitEngine();
  destroyBalanceEngine();
  currentDifficulty = null;
  labScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  topDiffPill.classList.add('hidden');
  updateSummaryUI();
}

function syncModeTabsUI() {
  document.getElementById('tab-mode-pinpull')?.classList.toggle('active', currentMode === 'pinpull');
  document.getElementById('tab-mode-sokoban')?.classList.toggle('active', currentMode === 'sokoban');
  document.getElementById('tab-mode-laser')?.classList.toggle('active', currentMode === 'laser');
  document.getElementById('tab-mode-circuit')?.classList.toggle('active', currentMode === 'circuit');
  document.getElementById('tab-mode-balance')?.classList.toggle('active', currentMode === 'balance');
  document.getElementById('tab-mode-mini')?.classList.toggle('active', currentMode === 'mini');
}

function switchLabMode(mode) {
  if (
    mode !== 'pinpull' &&
    mode !== 'sokoban' &&
    mode !== 'laser' &&
    mode !== 'circuit' &&
    mode !== 'balance' &&
    mode !== 'mini'
  ) {
    return;
  }
  currentMode = mode;
  activeLevelIndex = 0;
  syncModeTabsUI();
  renderLevelsStrip();
  loadActiveLevel();
}

function renderLevelsStrip() {
  const strip = document.getElementById('levels-strip');
  const levels = getCurrentModeLevels();
  const solvedSet = new Set(progress[currentDifficulty].solvedLevels);

  strip.innerHTML = '';
  levels.forEach((lvl, idx) => {
    const isSolved = solvedSet.has(lvl.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `level-tab-btn${idx === activeLevelIndex ? ' active' : ''}${isSolved ? ' solved' : ''}`;
    const label = isSolved
      ? '✅ Atlikta'
      : currentMode === 'pinpull'
        ? '🔩 Kaiščiai'
        : currentMode === 'sokoban'
          ? '🤖 Robotas'
          : currentMode === 'laser'
            ? '🔦 Optika'
            : currentMode === 'circuit'
              ? '🚂 Grandinė'
              : currentMode === 'balance'
                ? '⚖️ Svoriai'
                : '🧩 Užduotis';
    btn.innerHTML = `
      <div class="level-tab-top">
        <span>${label}</span>
        <span>+${lvl.reward} 💎</span>
      </div>
      <div class="level-tab-name">${lvl.title}</div>
    `;
    btn.addEventListener('click', () => {
      activeLevelIndex = idx;
      renderLevelsStrip();
      loadActiveLevel();
    });
    strip.appendChild(btn);
  });
}

function markLevelSolved(level) {
  const bucket = progress[currentDifficulty];
  const feedbackEl = document.getElementById('puzzle-feedback');
  const alreadySolved = bucket.solvedLevels.includes(level.id);

  if (!alreadySolved) {
    bucket.solvedLevels.push(level.id);
    bucket.crystals += level.reward;
    saveLabProgress(progress);
    updateSummaryUI();
    renderLevelsStrip();
    feedbackEl.textContent = `🎉 PUIKIAI! Lygis įveiktas! Gavai +${level.reward} Proto kristalų (💎)!`;
  } else {
    feedbackEl.textContent = '✅ Lygis sėkmingai įveiktas dar kartą!';
  }

  feedbackEl.className = 'puzzle-feedback success';
  feedbackEl.classList.remove('hidden');
}

function destroyPinEngine() {
  if (pinEngine) {
    pinEngine.destroy();
    pinEngine = null;
  }
}

function destroyLaserEngine() {
  if (laserEngine) {
    laserEngine.destroy();
    laserEngine = null;
  }
}

function destroyCircuitEngine() {
  if (circuitEngine) {
    circuitEngine.destroy();
    circuitEngine = null;
  }
}

function destroyBalanceEngine() {
  if (balanceEngine) {
    balanceEngine.destroy();
    balanceEngine = null;
  }
}

function loadActiveLevel() {
  destroyPinEngine();
  destroyLaserEngine();
  destroyCircuitEngine();
  destroyBalanceEngine();
  sokobanGame = null;
  const levels = getCurrentModeLevels();
  const level = levels[activeLevelIndex];

  document.getElementById('puzzle-type-badge').textContent =
    currentMode === 'pinpull'
      ? `🔩 IŠTRAUK KAIŠTĮ • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
      : currentMode === 'sokoban'
        ? `🤖 ROBO-STUMDUKAS • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
        : currentMode === 'laser'
          ? `🔦 LAZERIŲ VEIDRODŽIAI • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
          : currentMode === 'circuit'
            ? `🚂 SUJUNK GRANDINĘ • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
            : currentMode === 'balance'
              ? `⚖️ KOSMINĖS SVARSTYKLĖS • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
              : level.badge;
  document.getElementById('puzzle-title').textContent = level.title;
  document.getElementById('puzzle-instruction').textContent = level.instruction;
  document.getElementById('puzzle-reward-badge').textContent = `+${level.reward} 💎`;

  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';

  document.getElementById('btn-pin-next')?.classList.add('hidden');
  document.getElementById('btn-sok-next')?.classList.add('hidden');
  document.getElementById('btn-laser-next')?.classList.add('hidden');
  document.getElementById('btn-circuit-next')?.classList.add('hidden');
  document.getElementById('btn-balance-next')?.classList.add('hidden');

  if (currentMode === 'pinpull') {
    pinPullStage.classList.remove('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startPinPullLevel(level, levels.length);
  } else if (currentMode === 'sokoban') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.remove('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startSokobanLevel(level, levels.length);
  } else if (currentMode === 'laser') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.remove('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startLaserLevel(level, levels.length);
  } else if (currentMode === 'circuit') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.remove('hidden');
    balanceStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startCircuitLevel(level, levels.length);
  } else if (currentMode === 'balance') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.remove('hidden');
    miniStage.classList.add('hidden');
    startBalanceLevel(level, levels.length);
  } else {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    miniStage.classList.remove('hidden');
    miniStage.innerHTML = '';

    if (level.kind === 'laser') {
      mirrorStates = level.mirrors.map((m) => ({ ...m }));
      renderLaserStage(miniStage, level);
    } else if (level.kind === 'switches') {
      switchStates = level.values.map(() => false);
      renderSwitchesStage(miniStage, level);
    } else if (level.kind === 'sequence') {
      renderSequenceStage(miniStage, level);
    }
  }
}

function startPinPullLevel(level, totalInMode) {
  const counterEl = document.getElementById('pinpull-counter');
  const nextBtn = document.getElementById('btn-pin-next');

  pinEngine = new PinPullEngine(pinCanvas, level, {
    onTick: ({ goalCount, requiredGoal }) => {
      if (counterEl) {
        counterEl.textContent = `🧪 Kolboje: ${goalCount} / ${requiredGoal}`;
      }
    },
    onStatusChange: ({ status, failReason, goalCount, requiredGoal }) => {
      if (counterEl) {
        counterEl.textContent = `🧪 Kolboje: ${goalCount} / ${requiredGoal}`;
      }
      if (status === 'won') {
        markLevelSolved(level);
        if (nextBtn && activeLevelIndex < totalInMode - 1) {
          nextBtn.classList.remove('hidden');
        }
      } else if (status === 'failed') {
        const feedbackEl = document.getElementById('puzzle-feedback');
        feedbackEl.textContent = failReason || '💥 Bandyk dar kartą! Paspausk „Iš naujo (Reset)“.';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    }
  });
  pinEngine.startLoop();
}

function getCanvasCoords(evt) {
  const rect = pinCanvas.getBoundingClientRect();
  return {
    mx: ((evt.clientX - rect.left) / rect.width) * CANVAS_W,
    my: ((evt.clientY - rect.top) / rect.height) * CANVAS_H
  };
}

function getLaserCanvasCoords(evt) {
  const rect = laserCanvas.getBoundingClientRect();
  return {
    mx: ((evt.clientX - rect.left) / rect.width) * LASER_CANVAS_W,
    my: ((evt.clientY - rect.top) / rect.height) * LASER_CANVAS_H
  };
}

function updateLaserToolBtnUI() {
  const btn = document.getElementById('btn-laser-tool');
  if (!btn) return;
  btn.classList.toggle('move-active', laserMoveToolActive);
  btn.textContent = laserMoveToolActive
    ? '✋ Režimas: Perkelti (spausk ant veidrodžio, tada ant langelio)'
    : '🔄 Paspaudus: Sukti 90° (Vilkti = Perkelti)';
}

function startLaserLevel(level, totalInMode) {
  const counterEl = document.getElementById('laser-counter');
  const nextBtn = document.getElementById('btn-laser-next');
  const toolBtn = document.getElementById('btn-laser-tool');
  const splitterLegend = document.getElementById('laser-legend-splitter');

  laserMoveToolActive = false;
  if (toolBtn) {
    toolBtn.classList.toggle('hidden', !level.movable);
    updateLaserToolBtnUI();
  }
  if (splitterLegend) {
    splitterLegend.classList.toggle('hidden', !level.movable);
  }

  laserEngine = new LaserMirrorsEngine(laserCanvas, level, {
    onStatusChange: ({ litTargets, totalTargets, won }) => {
      if (counterEl) {
        counterEl.textContent = `💎 Apšviesta kristalų: ${litTargets} / ${totalTargets}`;
      }
      if (won) {
        markLevelSolved(level);
        if (nextBtn && activeLevelIndex < totalInMode - 1) {
          nextBtn.classList.remove('hidden');
        }
      }
    }
  });
  laserEngine.startLoop();
}

function getCircuitCanvasCoords(evt) {
  const rect = circuitCanvas.getBoundingClientRect();
  return {
    mx: ((evt.clientX - rect.left) / rect.width) * CIRCUIT_CANVAS_W,
    my: ((evt.clientY - rect.top) / rect.height) * CIRCUIT_CANVAS_H
  };
}

function startCircuitLevel(level, totalInMode) {
  const counterEl = document.getElementById('circuit-counter');
  const launchBtn = document.getElementById('btn-circuit-launch');
  const nextBtn = document.getElementById('btn-circuit-next');
  const g3Legend = document.getElementById('circuit-legend-g3');

  if (g3Legend) {
    g3Legend.classList.toggle('hidden', currentDifficulty !== 'grade3');
  }
  if (launchBtn) {
    launchBtn.disabled = false;
  }

  circuitEngine = new CircuitEngine(circuitCanvas, level, {
    onStatusChange: ({ readyToWin, totalStars, collectedStars, running }) => {
      if (counterEl) {
        counterEl.textContent = running
          ? `🚂 Važiuoja... ⭐ ${collectedStars} / ${totalStars}`
          : `⭐ Žvaigždutės: ${collectedStars} / ${totalStars}${readyToWin ? ' • ✅ Kelias sujungtas!' : ''}`;
      }
      if (launchBtn) {
        launchBtn.disabled = !!running;
      }
    },
    onRunResult: ({ won, reason, starsCollected, totalStars }) => {
      if (launchBtn) {
        launchBtn.disabled = false;
      }
      if (won) {
        if (counterEl) {
          counterEl.textContent = `⭐ Žvaigždutės: ${starsCollected} / ${totalStars} • 🎉 Pasiekta 🏁!`;
        }
        markLevelSolved(level);
        if (nextBtn && activeLevelIndex < totalInMode - 1) {
          nextBtn.classList.remove('hidden');
        }
      } else {
        const feedbackEl = document.getElementById('puzzle-feedback');
        feedbackEl.textContent = reason || '⚠️ Kelias nesujungtas! Pakoreguok bėgius ir bandyk dar kartą.';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    }
  });
  circuitEngine.startLoop();
}

function getBalanceCanvasCoords(evt) {
  const rect = balanceCanvas.getBoundingClientRect();
  return {
    mx: ((evt.clientX - rect.left) / rect.width) * BALANCE_CANVAS_W,
    my: ((evt.clientY - rect.top) / rect.height) * BALANCE_CANVAS_H
  };
}

function renderBalanceHints(level) {
  const hintsEl = document.getElementById('balance-hints');
  if (!hintsEl) return;
  hintsEl.innerHTML = '';

  const formatSide = (groups) =>
    groups
      .map((g) => (ITEM_CATALOG[g.kind]?.icon || '').repeat(g.count))
      .join(' + ');

  level.hints.forEach((h) => {
    const pill = document.createElement('div');
    pill.className = 'balance-hint-pill';
    pill.innerHTML = `<span>${formatSide(h.left)}</span><span class="balance-hint-eq">=</span><span>${formatSide(h.right)}</span>`;
    hintsEl.appendChild(pill);
  });
}

function renderBalanceTray(level) {
  const trayEl = document.getElementById('balance-tray');
  if (!trayEl) return;
  trayEl.innerHTML = '';

  level.palette.forEach((kind) => {
    const meta = ITEM_CATALOG[kind];
    if (!meta) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'balance-add-btn';
    btn.dataset.kind = kind;
    btn.innerHTML = `<span class="balance-add-icon">${meta.icon}</span><span>+ ${meta.label}</span>`;
    btn.addEventListener('click', () => {
      if (!balanceEngine) return;
      balanceEngine.addItem(kind);
    });
    trayEl.appendChild(btn);
  });
}

function startBalanceLevel(level, totalInMode) {
  const counterEl = document.getElementById('balance-counter');
  const nextBtn = document.getElementById('btn-balance-next');

  renderBalanceHints(level);
  renderBalanceTray(level);

  balanceEngine = new BalanceScaleEngine(balanceCanvas, level, {
    onStatusChange: ({ rightCount, balanced, won }) => {
      if (counterEl) {
        counterEl.textContent = won
          ? `🟢 Pusiausvyra pasiekta! (${rightCount} vnt.)`
          : balanced
            ? `🟢 Lygu! Svarstyklės išsilygina... (${rightCount} vnt.)`
            : `⚖️ Dešinėje lėkštėje: ${rightCount} vnt.`;
      }
      document.querySelectorAll('.balance-add-btn').forEach((b) => {
        b.disabled = !!won || rightCount >= 16;
      });
    },
    onWin: () => {
      markLevelSolved(level);
      if (nextBtn && activeLevelIndex < totalInMode - 1) {
        nextBtn.classList.remove('hidden');
      }
    }
  });
  balanceEngine.startLoop();
}

// ==================== ROBO-STUMDUKAS RENDERIS IR VALDYMAS ====================
const GATE_ICON = {
  '>': '➡️',
  '<': '⬅️',
  '^': '⬆️',
  'v': '⬇️'
};

function startSokobanLevel(level, totalInMode) {
  currentSokobanDef = level;
  currentSokobanTotal = totalInMode;
  sokobanGame = new SokobanGame(level);
  renderSokobanBoard();
}

function handleSokobanMove(dr, dc) {
  if (!sokobanGame || sokobanGame.won) return;
  const moved = sokobanGame.move(dr, dc);
  if (!moved) return;

  renderSokobanBoard();

  if (sokobanGame.won) {
    markLevelSolved(currentSokobanDef);
    const nextBtn = document.getElementById('btn-sok-next');
    if (nextBtn && activeLevelIndex < currentSokobanTotal - 1) {
      nextBtn.classList.remove('hidden');
    }
  }
}

function renderSokobanBoard() {
  if (!sokobanGame) return;
  const gridEl = document.getElementById('sokoban-grid');
  const counterEl = document.getElementById('sokoban-counter');
  const undoBtn = document.getElementById('btn-sok-undo');

  const covered = sokobanGame.getCoveredCount();
  const totalTargets = sokobanGame.targets.length;
  const gateOpen = sokobanGame.areAllTargetsCovered();

  if (counterEl) {
    counterEl.textContent = `⚡ Ant mygtukų: ${covered} / ${totalTargets} • ${gateOpen ? '🔓 Vartai ATIDARYTI!' : '🔒 Vartai uždaryti'} • Ėjimai: ${sokobanGame.moves}`;
  }
  if (undoBtn) {
    undoBtn.disabled = sokobanGame.history.length === 0;
  }

  gridEl.style.gridTemplateColumns = `repeat(${sokobanGame.cols}, auto)`;
  gridEl.innerHTML = '';

  for (let r = 0; r < sokobanGame.rows; r++) {
    for (let c = 0; c < sokobanGame.cols; c++) {
      const tile = sokobanGame.grid[r][c];
      const hasCube = sokobanGame.cubeIndexAt(r, c) >= 0;
      const isRobot = sokobanGame.robot.r === r && sokobanGame.robot.c === c;
      const isTarget = tile === 'T';
      const isExit = tile === 'E';

      const cell = document.createElement('div');
      cell.className = 'sok-cell';

      if (tile === '#') {
        cell.classList.add('wall');
        cell.textContent = '🧱';
      } else {
        if (tile === 'I') cell.classList.add('ice');
        if (GATE_ICON[tile]) cell.classList.add('gate');
        if (isTarget) cell.classList.add('target');
        if (isExit) cell.classList.add(gateOpen ? 'exit-open' : 'exit-locked');

        if (isRobot) {
          cell.textContent = '🤖';
        } else if (hasCube) {
          if (isTarget) cell.classList.add('cube-on-target');
          cell.textContent = '⚡';
        } else if (isExit) {
          cell.textContent = gateOpen ? '🚪' : '🔒';
        } else if (isTarget) {
          cell.textContent = '🔘';
        } else if (GATE_ICON[tile]) {
          cell.textContent = GATE_ICON[tile];
        } else if (tile === 'I') {
          cell.textContent = '❄️';
        }

        const dr = r - sokobanGame.robot.r;
        const dc = c - sokobanGame.robot.c;
        if (Math.abs(dr) + Math.abs(dc) === 1 && !sokobanGame.won) {
          cell.classList.add('adjacent-step');
          cell.addEventListener('click', () => handleSokobanMove(dr, dc));
        }
      }

      gridEl.appendChild(cell);
    }
  }
}

// ==================== MINI EKSPERIMENTŲ RENDERIS ====================
function traceLaserBeam(level, mirrors) {
  const litSet = new Set();
  let { r, c, dir } = level.emitter;
  const dr = { U: -1, D: 1, L: 0, R: 0 };
  const dc = { U: 0, D: 0, L: -1, R: 1 };
  const wallSet = new Set(level.walls.map(([wr, wc]) => `${wr},${wc}`));
  const mirrorMap = new Map(mirrors.map((m) => [`${m.r},${m.c}`, m]));

  let targetHit = false;
  for (let step = 0; step < 40; step++) {
    litSet.add(`${r},${c}`);
    if (r === level.target.r && c === level.target.c) {
      targetHit = true;
      break;
    }

    r += dr[dir];
    c += dc[dir];

    if (r < 0 || r >= level.rows || c < 0 || c >= level.cols) break;
    if (wallSet.has(`${r},${c}`)) break;

    const m = mirrorMap.get(`${r},${c}`);
    if (m) {
      litSet.add(`${r},${c}`);
      if (m.type === '/') {
        dir = dir === 'R' ? 'U' : dir === 'L' ? 'D' : dir === 'U' ? 'R' : 'L';
      } else {
        dir = dir === 'R' ? 'D' : dir === 'L' ? 'U' : dir === 'U' ? 'L' : 'R';
      }
    }
  }

  return { litSet, targetHit };
}

function renderLaserStage(stage, level) {
  stage.innerHTML = '';
  const { litSet, targetHit } = traceLaserBeam(level, mirrorStates);
  const wallSet = new Set(level.walls.map(([wr, wc]) => `${wr},${wc}`));

  const grid = document.createElement('div');
  grid.className = 'laser-grid';
  grid.style.gridTemplateColumns = `repeat(${level.cols}, auto)`;

  for (let r = 0; r < level.rows; r++) {
    for (let c = 0; c < level.cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'laser-cell';
      const key = `${r},${c}`;
      if (litSet.has(key)) cell.classList.add('lit');

      if (r === level.emitter.r && c === level.emitter.c) {
        cell.classList.add('emitter');
        cell.textContent = '🔦';
      } else if (r === level.target.r && c === level.target.c) {
        cell.classList.add('target');
        if (targetHit) cell.classList.add('hit');
        cell.textContent = '💎';
      } else if (wallSet.has(key)) {
        cell.classList.add('wall');
        cell.textContent = '🧱';
      } else {
        const mIdx = mirrorStates.findIndex((m) => m.r === r && m.c === c);
        if (mIdx >= 0) {
          cell.classList.add('mirror');
          const sym = document.createElement('span');
          sym.className = 'mirror-symbol';
          sym.textContent = mirrorStates[mIdx].type;
          cell.appendChild(sym);
          cell.title = 'Paspausk, kad pasuktum veidrodį';
          cell.addEventListener('click', () => {
            mirrorStates[mIdx].type = mirrorStates[mIdx].type === '/' ? '\\' : '/';
            renderLaserStage(stage, level);
          });
        } else if (litSet.has(key)) {
          cell.textContent = '⚡';
        }
      }

      grid.appendChild(cell);
    }
  }

  stage.appendChild(grid);
  if (targetHit) {
    markLevelSolved(level);
  }
}

function renderSwitchesStage(stage, level) {
  stage.innerHTML = '';
  const sum = level.values.reduce((acc, v, i) => acc + (switchStates[i] ? v : 0), 0);

  const meter = document.createElement('div');
  meter.className = 'power-meter';
  meter.textContent = `Dabartinė galia: ${sum} V / Tikslas: ${level.targetSum} V`;
  stage.appendChild(meter);

  const row = document.createElement('div');
  row.className = 'switches-row';

  level.values.forEach((val, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `switch-btn${switchStates[idx] ? ' on' : ''}`;
    btn.textContent = `${switchStates[idx] ? '🟢 ĮJUNGTA' : '⚪ IŠJUNGTA'} (+${val} V)`;
    btn.addEventListener('click', () => {
      switchStates[idx] = !switchStates[idx];
      renderSwitchesStage(stage, level);
    });
    row.appendChild(btn);
  });

  stage.appendChild(row);
  if (sum === level.targetSum) {
    markLevelSolved(level);
  }
}

function renderSequenceStage(stage, level) {
  stage.innerHTML = '';

  const seq = document.createElement('div');
  seq.className = 'sequence-display';
  seq.textContent = level.prompt;
  stage.appendChild(seq);

  const row = document.createElement('div');
  row.className = 'choice-row';
  level.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lab-choice-btn';
    btn.textContent = String(choice);
    btn.addEventListener('click', () => {
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (choice === level.answer) {
        markLevelSolved(level);
      } else {
        feedbackEl.textContent = `❌ ${choice} netinka – pabandyk pažiūrėti, kaip skaičiai keičiasi iš eilės!`;
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    });
    row.appendChild(btn);
  });
  stage.appendChild(row);
}

// ==================== ĮVYKIŲ VALDYMAS ====================
document.getElementById('btn-select-grade1')?.addEventListener('click', () => selectDifficulty('grade1'));
document.getElementById('btn-select-grade3')?.addEventListener('click', () => selectDifficulty('grade3'));
document.getElementById('btn-back-difficulty')?.addEventListener('click', showDifficultyScreen);

document.getElementById('tab-mode-pinpull')?.addEventListener('click', () => switchLabMode('pinpull'));
document.getElementById('tab-mode-sokoban')?.addEventListener('click', () => switchLabMode('sokoban'));
document.getElementById('tab-mode-laser')?.addEventListener('click', () => switchLabMode('laser'));
document.getElementById('tab-mode-circuit')?.addEventListener('click', () => switchLabMode('circuit'));
document.getElementById('tab-mode-balance')?.addEventListener('click', () => switchLabMode('balance'));
document.getElementById('tab-mode-mini')?.addEventListener('click', () => switchLabMode('mini'));

document.getElementById('btn-sok-undo')?.addEventListener('click', () => {
  if (!sokobanGame) return;
  if (sokobanGame.undo()) {
    const feedbackEl = document.getElementById('puzzle-feedback');
    feedbackEl.className = 'puzzle-feedback hidden';
    feedbackEl.textContent = '';
    document.getElementById('btn-sok-next')?.classList.add('hidden');
    renderSokobanBoard();
  }
});

document.getElementById('btn-sok-reset')?.addEventListener('click', () => {
  if (!sokobanGame) return;
  sokobanGame.reset();
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-sok-next')?.classList.add('hidden');
  renderSokobanBoard();
});

document.getElementById('btn-sok-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

document.querySelectorAll('.dpad-btn[data-dir]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const [dr, dc] = btn.dataset.dir.split(',').map(Number);
    handleSokobanMove(dr, dc);
  });
});

window.addEventListener('keydown', (e) => {
  if (!currentDifficulty || currentMode !== 'sokoban' || !sokobanGame) return;
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') {
    e.preventDefault();
    handleSokobanMove(-1, 0);
  } else if (k === 'arrowdown' || k === 's') {
    e.preventDefault();
    handleSokobanMove(1, 0);
  } else if (k === 'arrowleft' || k === 'a') {
    e.preventDefault();
    handleSokobanMove(0, -1);
  } else if (k === 'arrowright' || k === 'd') {
    e.preventDefault();
    handleSokobanMove(0, 1);
  }
});

document.getElementById('btn-pin-reset')?.addEventListener('click', () => {
  if (!pinEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-pin-next')?.classList.add('hidden');
  pinEngine.reset();
});

document.getElementById('btn-pin-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

if (pinCanvas) {
  pinCanvas.addEventListener('pointerdown', (e) => {
    if (!pinEngine) return;
    const { mx, my } = getCanvasCoords(e);
    pinEngine.handlePointerDown(mx, my);
  });

  pinCanvas.addEventListener('pointermove', (e) => {
    if (!pinEngine) return;
    const { mx, my } = getCanvasCoords(e);
    pinEngine.handlePointerMove(mx, my);
  });
}

document.getElementById('btn-laser-tool')?.addEventListener('click', () => {
  if (!laserEngine) return;
  laserMoveToolActive = !laserMoveToolActive;
  laserEngine.setInteractionMode(laserMoveToolActive ? 'move' : 'smart');
  updateLaserToolBtnUI();
});

document.getElementById('btn-laser-reset')?.addEventListener('click', () => {
  if (!laserEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-laser-next')?.classList.add('hidden');
  laserEngine.reset();
});

document.getElementById('btn-laser-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

if (laserCanvas) {
  laserCanvas.addEventListener('pointerdown', (e) => {
    if (!laserEngine) return;
    const { mx, my } = getLaserCanvasCoords(e);
    laserEngine.handlePointerDown(mx, my);
  });

  laserCanvas.addEventListener('pointermove', (e) => {
    if (!laserEngine) return;
    const { mx, my } = getLaserCanvasCoords(e);
    laserEngine.handlePointerMove(mx, my);
  });

  laserCanvas.addEventListener('pointerup', (e) => {
    if (!laserEngine) return;
    const { mx, my } = getLaserCanvasCoords(e);
    laserEngine.handlePointerUp(mx, my);
  });

  laserCanvas.addEventListener('pointercancel', (e) => {
    if (!laserEngine) return;
    const { mx, my } = getLaserCanvasCoords(e);
    laserEngine.handlePointerUp(mx, my);
  });
}

document.getElementById('btn-circuit-launch')?.addEventListener('click', () => {
  if (!circuitEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  circuitEngine.launchTrain();
});

document.getElementById('btn-circuit-reset')?.addEventListener('click', () => {
  if (!circuitEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-circuit-next')?.classList.add('hidden');
  const launchBtn = document.getElementById('btn-circuit-launch');
  if (launchBtn) launchBtn.disabled = false;
  circuitEngine.reset();
});

document.getElementById('btn-circuit-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

if (circuitCanvas) {
  circuitCanvas.addEventListener('pointerdown', (e) => {
    if (!circuitEngine) return;
    const { mx, my } = getCircuitCanvasCoords(e);
    circuitEngine.handlePointerDown(mx, my);
  });
}

document.getElementById('btn-balance-reset')?.addEventListener('click', () => {
  if (!balanceEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-balance-next')?.classList.add('hidden');
  balanceEngine.reset();
});

document.getElementById('btn-balance-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

if (balanceCanvas) {
  balanceCanvas.addEventListener('pointerdown', (e) => {
    if (!balanceEngine) return;
    const { mx, my } = getBalanceCanvasCoords(e);
    balanceEngine.handlePointerDown(mx, my);
  });
}

updateSummaryUI();
