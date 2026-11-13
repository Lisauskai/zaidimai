// ==================== PROTO LABORATORIJA (LOGIKOS ŽAIDIMAS 1–3 KL.) ====================
// Progreso raktas localStorage: 'proto_lab_progress'
import { PinPullEngine, PINPULL_LEVELS, CANVAS_W, CANVAS_H } from './pinpull.js?v=20261113c';
import { SokobanGame, SOKOBAN_LEVELS } from './sokoban.js?v=20261113c';
import { LaserMirrorsEngine, LASER_LEVELS, LASER_CANVAS_W, LASER_CANVAS_H } from './lasers.js?v=20261113c';
import { CircuitEngine, CIRCUIT_LEVELS, CIRCUIT_CANVAS_W, CIRCUIT_CANVAS_H } from './circuits.js?v=20261113c';
import {
  BalanceScaleEngine,
  BALANCE_LEVELS,
  ITEM_CATALOG,
  BALANCE_CANVAS_W,
  BALANCE_CANVAS_H
} from './balance.js?v=20261113c';
import { MATRIX_LEVELS, renderShapeSvg, MemoryCodeController } from './matrix.js?v=20261113c';
import { AlgoEngine, ALGO_LEVELS, CMD_META } from './algo.js?v=20261113c';
import { GearsEngine, GEARS_LEVELS, GEAR_SIZES, GEARS_CANVAS_W, GEARS_CANVAS_H } from './gears.js?v=20261113c';
import { getParMoves, computeFirstHint } from './hints.js?v=20261113c';
import {
  isSoundEnabled,
  toggleSound,
  playPinPull,
  playBallClink,
  playRobotStep,
  playCubePush,
  playMirrorClick,
  playLaserHum,
  playTrackClick,
  playTrainLaunch,
  playBalancePop,
  playBalanceBell,
  playMemoryTone,
  playHintChime,
  playWrongBuzz,
  playVictoryFanfare,
  playAlgoJump,
  playGearPlace,
  playGearJam
} from './sound.js?v=20261113c';
import { launchVictoryConfetti, stopVictoryConfetti } from './confetti.js?v=20261113c';
import {
  ROBOT_PARTS,
  createDefaultRobotColors,
  normalizeRobotColors,
  getColorTheme,
  cycleRobotPartColor,
  getUnlockedPartIds,
  renderRobotWorkshopSvg
} from './robot.js?v=20261113c';

export const STORAGE_KEY = 'proto_lab_progress';

export function createDefaultProgress() {
  return {
    activeDifficulty: null,
    robotColors: createDefaultRobotColors(),
    grade1: {
      solvedLevels: [],
      crystals: 0,
      levelStars: {}
    },
    grade3: {
      solvedLevels: [],
      crystals: 0,
      levelStars: {}
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

    const normalizeStars = (rawStars) => {
      const clean = {};
      if (rawStars && typeof rawStars === 'object') {
        Object.entries(rawStars).forEach(([k, v]) => {
          const n = Number(v);
          if (n >= 1 && n <= 3) clean[k] = n;
        });
      }
      return clean;
    };

    const normalizeGrade = (g) => ({
      solvedLevels: Array.isArray(g?.solvedLevels) ? Array.from(new Set(g.solvedLevels)) : [],
      crystals: Math.max(0, Number(g?.crystals) || 0),
      levelStars: normalizeStars(g?.levelStars)
    });

    const activeDifficulty =
      parsed.activeDifficulty === 'grade1' || parsed.activeDifficulty === 'grade3'
        ? parsed.activeDifficulty
        : null;

    return {
      activeDifficulty,
      robotColors: normalizeRobotColors(parsed.robotColors),
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
      reward: 1,
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
      reward: 1,
      targetSum: 10,
      values: [2, 5, 3, 6]
    },
    {
      id: 'g1_sequence_1',
      kind: 'sequence',
      badge: '🔮 KRISTALŲ ŠIFRAS',
      title: '3. Skaičių banga',
      instruction: 'Atspėk, koks skaičius turėtų būti vietoj [ ? ] robotuko ekrane:',
      reward: 2,
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
      reward: 1,
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
      reward: 2,
      targetSum: 27,
      values: [4, 8, 12, 15, 3]
    },
    {
      id: 'g3_sequence_1',
      kind: 'sequence',
      badge: '🧬 INŽINERINIS ŠIFRAS',
      title: '3. Dvigubėjančios jėgos',
      instruction: 'Rask dėsningumą ir nustatyk trūkstamą skaičių:',
      reward: 2,
      prompt: '3  →  6  →  12  →  24  →  [ ? ]',
      answer: 48,
      choices: [36, 42, 48, 54]
    }
  ]
};

// ==================== BŪSENA ====================
let progress = loadLabProgress();
let currentDifficulty = null;
let currentMode = 'pinpull'; // 'pinpull' | 'sokoban' | 'laser' | 'circuit' | 'balance' | 'matrix' | 'mini'
let activeLevelIndex = 0;
let mirrorStates = [];
let switchStates = [];
let pinEngine = null;
let sokobanGame = null;
let laserEngine = null;
let circuitEngine = null;
let balanceEngine = null;
let memoryCtrl = null;
let algoEngine = null;
let gearsEngine = null;
let laserMoveToolActive = false;
let currentSokobanDef = null;
let currentSokobanTotal = 0;
let currentMoves = 0;
let levelElapsedSec = 0;
let levelTimerId = null;
let hintUsedInLevel = false;
let currentLevelSolvedNow = false;

// ==================== DOM NUORODOS ====================
const startScreen = document.getElementById('start-screen');
const labScreen = document.getElementById('lab-screen');
const worldMapPanel = document.getElementById('world-map-panel');
const labPuzzleArea = document.getElementById('lab-puzzle-area');
const btnOpenWorldMap = document.getElementById('btn-open-worldmap');
const topDiffPill = document.getElementById('top-difficulty-pill');
const btnSoundToggle = document.getElementById('btn-sound-toggle');
const btnLabHint = document.getElementById('btn-lab-hint');
const puzzleMovesPill = document.getElementById('puzzle-moves-pill');
const confettiCanvas = document.getElementById('confetti-canvas');
const victoryModal = document.getElementById('victory-modal');
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
const matrixStage = document.getElementById('matrix-stage');
const algoCanvas = document.getElementById('algo-canvas');
const algoStage = document.getElementById('algo-stage');
const gearsCanvas = document.getElementById('gears-canvas');
const gearsStage = document.getElementById('gears-stage');
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
    ...MATRIX_LEVELS[diff],
    ...ALGO_LEVELS[diff],
    ...GEARS_LEVELS[diff],
    ...LAB_LEVELS[diff]
  ];
}

const LAB_WORLD_ZONES = [
  {
    mode: 'pinpull',
    title: '1. Kaiščių bokštas',
    desc: 'Fizikos ir gravito kaiščiai',
    icon: '🔩',
    accent: '#f59e0b'
  },
  {
    mode: 'sokoban',
    title: '2. Robo sandėlis',
    desc: 'Dėžių stūmimo maršrutai',
    icon: '🤖',
    accent: '#38bdf8'
  },
  {
    mode: 'laser',
    title: '3. Lazerių salė',
    desc: 'Šviesos spinduliai ir veidrodžiai',
    icon: '🔦',
    accent: '#22d3ee'
  },
  {
    mode: 'circuit',
    title: '4. Grandinių dirbtuvės',
    desc: 'Bėgiai ir elektros grandinės',
    icon: '🚂',
    accent: '#4ade80'
  },
  {
    mode: 'balance',
    title: '5. Kosminės svarstyklės',
    desc: 'Vizuali pusiausvyros logika',
    icon: '⚖️',
    accent: '#a78bfa'
  },
  {
    mode: 'matrix',
    title: '6. IQ šifrų kompiuteris',
    desc: 'Raštų matricos ir atminties šifras',
    icon: '🧩',
    accent: '#f472b6'
  },
  {
    mode: 'algo',
    title: '7. Algoritmų trasa',
    desc: 'Programavimo blokeliai ir ciklai',
    icon: '🧑‍💻',
    accent: '#2dd4bf'
  },
  {
    mode: 'gears',
    title: '8. Krumpliaračių variklis',
    desc: 'Kryptys, perdavimas ir diržai',
    icon: '⚙️',
    accent: '#fb923c'
  }
];

function getLevelsForMode(mode, diff = currentDifficulty) {
  if (mode === 'pinpull') return PINPULL_LEVELS[diff];
  if (mode === 'sokoban') return SOKOBAN_LEVELS[diff];
  if (mode === 'laser') return LASER_LEVELS[diff];
  if (mode === 'circuit') return CIRCUIT_LEVELS[diff];
  if (mode === 'balance') return BALANCE_LEVELS[diff];
  if (mode === 'matrix') return MATRIX_LEVELS[diff];
  if (mode === 'algo') return ALGO_LEVELS[diff];
  if (mode === 'gears') return GEARS_LEVELS[diff];
  return LAB_LEVELS[diff];
}

function getCurrentModeLevels(diff = currentDifficulty) {
  return getLevelsForMode(currentMode, diff);
}

function isLevelUnlocked(levels, idx, solvedSet) {
  if (idx === 0) return true;
  const prev = levels[idx - 1];
  return Boolean(prev && solvedSet.has(prev.id));
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
    uiTotalCrystals.textContent = String(g1Crystals + g3Crystals);
    uiActiveRank.textContent = currentDifficulty === 'grade1' ? '🔬 1 klasė' : '⚡ 3 klasė';
    document.getElementById('lab-mode-title').textContent = getDifficultyLabel(currentDifficulty);
    document.getElementById('lab-mode-stats').textContent =
      `Išspręsta: ${activeData.solvedLevels.length} / ${totalLevels} • 💎 ${activeData.crystals}`;
  } else {
    uiTotalCrystals.textContent = String(g1Crystals + g3Crystals);
  }

  renderRobotWorkshop(g1Crystals + g3Crystals);
}

function handleRobotPartColorCycle(partId) {
  cycleRobotPartColor(progress.robotColors, partId);
  saveLabProgress(progress);
  const total = progress.grade1.crystals + progress.grade3.crystals;
  renderRobotWorkshop(total);
}

function renderRobotWorkshop(totalCrystals) {
  const pillEl = document.getElementById('robot-total-crystals-pill');
  const nextEl = document.getElementById('robot-next-unlock');
  const boxEl = document.getElementById('robot-canvas-box');
  const listEl = document.getElementById('robot-parts-list');
  if (!boxEl || !listEl) return;

  if (pillEl) {
    pillEl.textContent = `💎 ${totalCrystals} krist.`;
  }

  const unlockedIds = new Set(getUnlockedPartIds(totalCrystals));
  const nextPart = ROBOT_PARTS.find((p) => !unlockedIds.has(p.id));

  if (nextEl) {
    if (nextPart) {
      nextEl.textContent = `Kita detalė: ${nextPart.icon} ${nextPart.name} (${totalCrystals} / ${nextPart.threshold} 💎). Paspausk ant atrakintos detalės spalvai keisti!`;
    } else {
      nextEl.textContent = '🎉 ŠAUNU! Visos 8 kosminio roboto detalės atrakintos! Paspausk ant bet kurios detalės spalvai keisti.';
    }
  }

  boxEl.innerHTML = renderRobotWorkshopSvg(totalCrystals, progress.robotColors);
  boxEl.querySelectorAll('[data-part]').forEach((el) => {
    el.addEventListener('click', () => {
      handleRobotPartColorCycle(el.getAttribute('data-part'));
    });
  });

  listEl.innerHTML = '';
  ROBOT_PARTS.forEach((part, idx) => {
    const isUnlocked = unlockedIds.has(part.id);
    const theme = getColorTheme(progress.robotColors[part.id]);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `robot-part-chip${isUnlocked ? ' unlocked' : ''}`;
    chip.dataset.partChip = part.id;
    chip.disabled = !isUnlocked;
    chip.title = isUnlocked
      ? `Spausk, kad pakeistum spalvą (dabar: ${theme.name})`
      : `Reikia ${part.threshold} 💎`;

    chip.innerHTML = isUnlocked
      ? `<span>${idx + 1}. ${part.icon} ${part.name}</span><span class="robot-color-dot" style="background:${theme.fill}"></span>`
      : `<span>🔒 ${idx + 1}. ${part.name}</span><span>${part.threshold} 💎</span>`;

    if (isUnlocked) {
      chip.addEventListener('click', () => handleRobotPartColorCycle(part.id));
    }
    listEl.appendChild(chip);
  });
}

function renderWorldMap() {
  const gridEl = document.getElementById('world-map-grid');
  const totalStarsEl = document.getElementById('world-map-stars-total');
  if (!gridEl || !currentDifficulty) return;

  const bucket = progress[currentDifficulty];
  const solvedSet = new Set(bucket.solvedLevels);
  gridEl.innerHTML = '';

  let totalStarsEarned = 0;
  let totalPossibleStars = 0;

  LAB_WORLD_ZONES.forEach((zone) => {
    const levels = getLevelsForMode(zone.mode, currentDifficulty) || [];
    totalPossibleStars += levels.length * 3;

    let zoneSolvedCount = 0;
    let zoneStarsEarned = 0;

    levels.forEach((lvl) => {
      if (solvedSet.has(lvl.id)) {
        zoneSolvedCount++;
        const st = currentDifficulty === 'grade1' ? 3 : bucket.levelStars?.[lvl.id] || 3;
        zoneStarsEarned += st;
      }
    });
    totalStarsEarned += zoneStarsEarned;

    const card = document.createElement('article');
    card.className = 'zone-map-card';
    card.dataset.zoneMode = zone.mode;
    card.style.setProperty('--zone-accent', zone.accent);

    card.innerHTML = `
      <div class="zone-map-head">
        <div class="zone-map-title-wrap">
          <div class="zone-map-icon" aria-hidden="true">${zone.icon}</div>
          <div>
            <h3 class="zone-map-name">${zone.title}</h3>
            <p class="zone-map-desc">${zone.desc}</p>
          </div>
        </div>
        <span class="zone-map-progress">${zoneSolvedCount}/${levels.length} • ⭐ ${zoneStarsEarned}</span>
      </div>
      <div class="zone-levels-row"></div>
    `;

    const row = card.querySelector('.zone-levels-row');
    levels.forEach((lvl, idx) => {
      const isSolved = solvedSet.has(lvl.id);
      const unlocked = isLevelUnlocked(levels, idx, solvedSet);
      const stars = isSolved
        ? currentDifficulty === 'grade1'
          ? 3
          : bucket.levelStars?.[lvl.id] || 3
        : 0;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.zoneMode = zone.mode;
      btn.dataset.levelIndex = String(idx);
      btn.disabled = !unlocked;
      btn.className = `zone-level-btn ${isSolved ? 'solved' : unlocked ? 'unlocked' : 'locked'}`;
      btn.title = unlocked ? lvl.title : `${lvl.title} (Išspręsk prieš tai esantį lygį)`;

      let starsText = '☆☆☆';
      if (!unlocked) starsText = '🔒';
      else if (isSolved) starsText = '★'.repeat(stars) + '☆'.repeat(3 - stars);

      btn.innerHTML = `
        <span class="zone-level-num">${idx + 1}</span>
        <span class="zone-level-stars">${starsText}</span>
      `;

      if (unlocked) {
        btn.addEventListener('click', () => enterZoneLevel(zone.mode, idx));
      }
      row.appendChild(btn);
    });

    gridEl.appendChild(card);
  });

  if (totalStarsEl) {
    totalStarsEl.textContent = `⭐ ${totalStarsEarned} / ${totalPossibleStars}`;
  }
}

export function showWorldMapView() {
  if (!currentDifficulty) return;
  stopLevelTimer();
  clearAllHints();
  destroyPinEngine();
  destroyLaserEngine();
  destroyCircuitEngine();
  destroyBalanceEngine();
  destroyMemoryCtrl();
  destroyAlgoEngine();
  destroyGearsEngine();

  worldMapPanel?.classList.remove('hidden');
  labPuzzleArea?.classList.add('hidden');
  btnLabHint?.classList.add('hidden');
  puzzleMovesPill?.classList.add('hidden');
  btnOpenWorldMap?.classList.add('active');
  renderWorldMap();
}

export function enterZoneLevel(mode, levelIndex = 0) {
  if (!currentDifficulty) return;
  const levels = getLevelsForMode(mode, currentDifficulty);
  if (!levels || levels.length === 0) return;

  const solvedSet = new Set(progress[currentDifficulty].solvedLevels);
  let targetIdx = Math.max(0, Math.min(levelIndex, levels.length - 1));
  if (!isLevelUnlocked(levels, targetIdx, solvedSet)) {
    targetIdx = 0;
  }

  currentMode = mode;
  activeLevelIndex = targetIdx;
  worldMapPanel?.classList.add('hidden');
  labPuzzleArea?.classList.remove('hidden');
  btnLabHint?.classList.remove('hidden');
  btnOpenWorldMap?.classList.remove('active');
  syncModeTabsUI();
  renderLevelsStrip();
  loadActiveLevel();
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
  showWorldMapView();
}

function showDifficultyScreen() {
  stopLevelTimer();
  hideVictoryOverlay();
  clearAllHints();
  destroyPinEngine();
  destroyLaserEngine();
  destroyCircuitEngine();
  destroyBalanceEngine();
  destroyMemoryCtrl();
  destroyAlgoEngine();
  destroyGearsEngine();
  currentDifficulty = null;
  labScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  topDiffPill.classList.add('hidden');
  btnLabHint?.classList.add('hidden');
  puzzleMovesPill?.classList.add('hidden');
  updateSummaryUI();
}

function syncModeTabsUI() {
  document.getElementById('tab-mode-pinpull')?.classList.toggle('active', currentMode === 'pinpull');
  document.getElementById('tab-mode-sokoban')?.classList.toggle('active', currentMode === 'sokoban');
  document.getElementById('tab-mode-laser')?.classList.toggle('active', currentMode === 'laser');
  document.getElementById('tab-mode-circuit')?.classList.toggle('active', currentMode === 'circuit');
  document.getElementById('tab-mode-balance')?.classList.toggle('active', currentMode === 'balance');
  document.getElementById('tab-mode-matrix')?.classList.toggle('active', currentMode === 'matrix');
  document.getElementById('tab-mode-algo')?.classList.toggle('active', currentMode === 'algo');
  document.getElementById('tab-mode-gears')?.classList.toggle('active', currentMode === 'gears');
  document.getElementById('tab-mode-mini')?.classList.toggle('active', currentMode === 'mini');
}

function switchLabMode(mode) {
  if (
    mode !== 'pinpull' &&
    mode !== 'sokoban' &&
    mode !== 'laser' &&
    mode !== 'circuit' &&
    mode !== 'balance' &&
    mode !== 'matrix' &&
    mode !== 'algo' &&
    mode !== 'gears' &&
    mode !== 'mini'
  ) {
    return;
  }
  enterZoneLevel(mode, 0);
}

function renderLevelsStrip() {
  const strip = document.getElementById('levels-strip');
  const levels = getCurrentModeLevels();
  const bucket = progress[currentDifficulty];
  const solvedSet = new Set(bucket.solvedLevels);

  strip.innerHTML = '';
  levels.forEach((lvl, idx) => {
    const isSolved = solvedSet.has(lvl.id);
    const unlocked = isLevelUnlocked(levels, idx, solvedSet);
    const savedStars = isSolved
      ? currentDifficulty === 'grade1'
        ? 3
        : bucket.levelStars?.[lvl.id] || 3
      : 0;
    const starsHtml = isSolved ? `<div class="level-tab-stars">${'⭐'.repeat(savedStars)}</div>` : '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.disabled = !unlocked;
    btn.className = `level-tab-btn${idx === activeLevelIndex ? ' active' : ''}${isSolved ? ' solved' : ''}${!unlocked ? ' locked' : ''}`;
    const label = !unlocked
      ? '🔒 Užrakinta'
      : isSolved
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
                  : currentMode === 'matrix'
                    ? lvl.kind === 'memory' ? '🧠 Atmintis' : '🧩 Raštas'
                    : currentMode === 'algo'
                      ? '🧑‍💻 Kodas'
                      : currentMode === 'gears'
                        ? '⚙️ Variklis'
                        : '🧩 Užduotis';
    btn.innerHTML = `
      <div class="level-tab-top">
        <span>${label}</span>
        <span>+${lvl.reward} 💎</span>
      </div>
      <div class="level-tab-name">${lvl.title}</div>
      ${starsHtml}
    `;
    if (unlocked) {
      btn.addEventListener('click', () => {
        activeLevelIndex = idx;
        renderLevelsStrip();
        loadActiveLevel();
      });
    }
    strip.appendChild(btn);
  });
}

function markLevelSolved(level) {
  currentLevelSolvedNow = true;
  stopLevelTimer();
  clearAllHints();
  syncHintButtonUI();

  const bucket = progress[currentDifficulty];
  if (!bucket.levelStars) bucket.levelStars = {};
  const feedbackEl = document.getElementById('puzzle-feedback');
  const alreadySolved = bucket.solvedLevels.includes(level.id);

  // 1 klasė visada gauna 3 žvaigždutes; 3 klasė pagal optimalų ėjimų skaičių (3 arba 2)
  const par = currentDifficulty === 'grade3' ? getParMoves(level.id) : null;
  const earnedStars = currentDifficulty === 'grade1' || !par || currentMoves <= par ? 3 : 2;
  const prevStars = bucket.levelStars[level.id] || 0;
  const improvedStars = earnedStars > prevStars;
  bucket.levelStars[level.id] = Math.max(prevStars, earnedStars);

  const starsStr = '⭐'.repeat(earnedStars);

  if (!alreadySolved) {
    bucket.solvedLevels.push(level.id);
    bucket.crystals += level.reward;
    saveLabProgress(progress);
    updateSummaryUI();
    renderLevelsStrip();
    renderWorldMap();
    feedbackEl.textContent =
      currentDifficulty === 'grade3' && earnedStars === 2
        ? `🎉 Lygis įveiktas! +${level.reward} 💎 • Įvertinimas: ${starsStr} (Norint ⭐⭐⭐, išspręsk per ≤ ${par} ėj.!)`
        : `🎉 PUIKIAI! Lygis įveiktas! +${level.reward} 💎 • Įvertinimas: ${starsStr}!`;
  } else {
    saveLabProgress(progress);
    renderLevelsStrip();
    renderWorldMap();
    if (improvedStars) {
      feedbackEl.textContent = `🌟 REKORDAS PAGERINTAS! ${starsStr} (${currentMoves} ėj.)!`;
    } else if (currentDifficulty === 'grade3' && earnedStars === 2 && (bucket.levelStars[level.id] || 0) < 3) {
      feedbackEl.textContent = `✅ Lygis įveiktas! ${starsStr} (${currentMoves} ėj.) – peržaisk per ≤ ${par} ėj., kad gautum ⭐⭐⭐!`;
    } else {
      feedbackEl.textContent = `✅ Lygis įveiktas! Įvertinimas: ${starsStr}!`;
    }
  }

  feedbackEl.className = 'puzzle-feedback success';
  feedbackEl.classList.remove('hidden');

  playVictoryFanfare();
  showVictoryOverlay({
    level,
    earnedStars,
    rewardEarned: alreadySolved ? 0 : level.reward,
    improvedStars,
    par
  });
}

function syncSoundToggleUI() {
  if (!btnSoundToggle) return;
  const enabled = isSoundEnabled();
  btnSoundToggle.classList.toggle('muted', !enabled);
  btnSoundToggle.textContent = enabled ? '🔊 Garsas' : '🔇 Be garso';
  btnSoundToggle.setAttribute('aria-pressed', String(enabled));
}

function hideVictoryOverlay() {
  victoryModal?.classList.add('hidden');
  confettiCanvas?.classList.add('hidden');
  stopVictoryConfetti(confettiCanvas);
}

function showVictoryOverlay({ level, earnedStars, rewardEarned, improvedStars, par }) {
  if (!victoryModal) return;
  const titleEl = document.getElementById('victory-title');
  const levelNameEl = document.getElementById('victory-level-name');
  const starsEl = document.getElementById('victory-stars');
  const summaryEl = document.getElementById('victory-summary');

  if (titleEl) {
    titleEl.textContent = improvedStars ? 'REKORDAS PAGERINTAS!' : 'LYGIS ĮVEIKTAS!';
  }
  if (levelNameEl) {
    levelNameEl.textContent = level.title;
  }
  if (starsEl) {
    starsEl.textContent = '⭐'.repeat(earnedStars);
  }
  if (summaryEl) {
    const parts = [];
    if (rewardEarned > 0) parts.push(`Gavai +${rewardEarned} 💎 Proto kristalų`);
    if (currentDifficulty === 'grade3' && par) {
      parts.push(
        earnedStars === 3
          ? `Puikus efektyvumas: ${currentMoves} / ${par} ėj.!`
          : `Ėjimai: ${currentMoves} (norint ⭐⭐⭐ reikia ≤ ${par} ėj.)`
      );
    } else if (rewardEarned === 0) {
      parts.push('Puikiai pakartotas lygis!');
    }
    summaryEl.textContent = parts.join(' • ');
  }

  victoryModal.classList.remove('hidden');
  confettiCanvas?.classList.remove('hidden');
  launchVictoryConfetti(confettiCanvas);
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

function destroyMemoryCtrl() {
  if (memoryCtrl) {
    memoryCtrl.destroy();
    memoryCtrl = null;
  }
}

function destroyAlgoEngine() {
  if (algoEngine) {
    algoEngine.destroy();
    algoEngine = null;
  }
}

function destroyGearsEngine() {
  if (gearsEngine) {
    gearsEngine.destroy();
    gearsEngine = null;
  }
}

// ==================== UŽUOMINOS LEMPUTĖ IR ĖJIMŲ SKAITIKLIS ====================
function stopLevelTimer() {
  if (levelTimerId !== null) {
    clearInterval(levelTimerId);
    levelTimerId = null;
  }
}

function startLevelTimer() {
  stopLevelTimer();
  levelElapsedSec = 0;
  levelTimerId = setInterval(() => {
    if (!currentDifficulty || currentLevelSolvedNow) return;
    levelElapsedSec += 1;
    if (levelElapsedSec >= 30 && !hintUsedInLevel) {
      syncHintButtonUI();
    }
  }, 1000);
}

function syncHintButtonUI() {
  if (!btnLabHint) return;
  if (!currentDifficulty) {
    btnLabHint.classList.add('hidden');
    return;
  }
  btnLabHint.classList.remove('hidden');
  const shouldPulse = !currentLevelSolvedNow && !hintUsedInLevel && levelElapsedSec >= 30;
  btnLabHint.classList.toggle('hint-ready-pulse', shouldPulse);
  btnLabHint.classList.toggle('hint-used', hintUsedInLevel);
  if (hintUsedInLevel) {
    btnLabHint.textContent = '💡 Užuomina parodyta';
  } else if (shouldPulse) {
    btnLabHint.textContent = '💡 Nemokama užuomina!';
  } else {
    btnLabHint.textContent = '💡 Užuomina';
  }
}

function updateMovesUI() {
  if (!puzzleMovesPill) return;
  if (currentDifficulty !== 'grade3') {
    puzzleMovesPill.classList.add('hidden');
    puzzleMovesPill.classList.remove('over-par');
    return;
  }
  const levels = getCurrentModeLevels();
  const level = levels?.[activeLevelIndex];
  const par = level ? getParMoves(level.id) : null;
  puzzleMovesPill.classList.remove('hidden');
  if (par) {
    puzzleMovesPill.textContent = `🎯 Ėjimai: ${currentMoves} / ${par}`;
    puzzleMovesPill.classList.toggle('over-par', currentMoves > par);
  } else {
    puzzleMovesPill.textContent = `🎯 Ėjimai: ${currentMoves}`;
    puzzleMovesPill.classList.remove('over-par');
  }
}

function clearAllHints() {
  document.querySelectorAll('.hint-highlight').forEach((el) => el.classList.remove('hint-highlight'));
  document.querySelectorAll('.hint-dimmed').forEach((el) => el.classList.remove('hint-dimmed'));
  document.querySelectorAll('.hint-btn-pulse').forEach((el) => el.classList.remove('hint-btn-pulse'));
  pinEngine?.setHintPin(null);
  laserEngine?.setHint(null);
  circuitEngine?.setHintTile(null);
  balanceEngine?.setHintRemove(false);
  memoryCtrl?.setHintCell(null);
  gearsEngine?.setHint(null);
}

function recordPlayerMove() {
  currentMoves += 1;
  clearAllHints();
  updateMovesUI();
}

function applyFirstHint() {
  if (!currentDifficulty || currentLevelSolvedNow) return;
  const levels = getCurrentModeLevels();
  const level = levels?.[activeLevelIndex];
  if (!level) return;

  if (currentMode === 'matrix' && level.kind === 'memory' && memoryCtrl?.phase === 'showing') {
    const feedbackEl = document.getElementById('puzzle-feedback');
    feedbackEl.textContent = '👀 Pirmiausia įsimink švytinčią seką!';
    feedbackEl.className = 'puzzle-feedback';
    feedbackEl.classList.remove('hidden');
    return;
  }

  const hint = computeFirstHint(currentMode, level, {
    pinEngine,
    sokobanGame,
    laserEngine,
    circuitEngine,
    balanceEngine,
    memoryCtrl,
    gearsEngine,
    mirrorStates,
    switchStates
  });

  if (!hint) return;
  clearAllHints();

  if (hint.kind === 'pin') {
    pinEngine?.setHintPin(hint.pinId);
  } else if (hint.kind === 'sokoban-dir') {
    const dpad = document.querySelector(`.dpad-btn[data-dir="${hint.dr},${hint.dc}"]`);
    dpad?.classList.add('hint-highlight');
    const adjCell = document.querySelector(`.sok-cell.adjacent-step[data-dir="${hint.dr},${hint.dc}"]`);
    adjCell?.classList.add('hint-highlight');
  } else if (hint.kind === 'sokoban-reset') {
    document.getElementById('btn-sok-undo')?.classList.add('hint-highlight');
  } else if (hint.kind === 'laser-move' || hint.kind === 'laser-rotate') {
    laserEngine?.setHint(hint);
  } else if (hint.kind === 'circuit-tile') {
    circuitEngine?.setHintTile({ r: hint.r, c: hint.c });
  } else if (hint.kind === 'circuit-launch') {
    document.getElementById('btn-circuit-launch')?.classList.add('hint-highlight');
  } else if (hint.kind === 'balance-add') {
    const btn = document.querySelector(`.balance-add-btn[data-kind="${hint.itemKind}"]`);
    btn?.classList.add('hint-highlight');
  } else if (hint.kind === 'balance-remove') {
    balanceEngine?.setHintRemove(true);
  } else if (hint.kind === 'memory-cell') {
    memoryCtrl?.setHintCell(hint.cellIndex);
  } else if (hint.kind === 'matrix-eliminate') {
    hint.eliminateIndices.forEach((idx) => {
      const btn = document.querySelector(`.matrix-choice-btn[data-choice-index="${idx}"]`);
      btn?.classList.add('hint-dimmed');
    });
  } else if (hint.kind === 'mini-laser-mirror') {
    const cell = document.querySelector(`[data-laser-cell="${hint.r},${hint.c}"]`);
    cell?.classList.add('hint-highlight');
  } else if (hint.kind === 'mini-switch') {
    const sw = document.querySelector(`[data-switch-index="${hint.switchIndex}"]`);
    sw?.classList.add('hint-highlight');
  } else if (hint.kind === 'mini-seq-eliminate') {
    hint.eliminateValues.forEach((val) => {
      const btn = document.querySelector(`.lab-choice-btn[data-seq-value="${val}"]`);
      btn?.classList.add('hint-dimmed');
    });
  } else if (hint.kind === 'algo-cmd') {
    const btn = document.querySelector(`.algo-cmd-btn[data-algo-cmd="${hint.cmd}"]`);
    btn?.classList.add('hint-btn-pulse');
  } else if (hint.kind === 'gear-peg') {
    gearsEngine?.setHint({ pegId: hint.pegId, sizeKey: hint.sizeKey });
    const btn = document.querySelector(`.gear-pick-btn[data-gear-size="${hint.sizeKey}"]`);
    btn?.classList.add('hint-btn-pulse');
  }

  hintUsedInLevel = true;
  syncHintButtonUI();
  playHintChime();

  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.textContent = hint.message;
  feedbackEl.className = 'puzzle-feedback hint-info';
  feedbackEl.classList.remove('hidden');
}

function loadActiveLevel() {
  stopLevelTimer();
  hideVictoryOverlay();
  clearAllHints();
  currentMoves = 0;
  hintUsedInLevel = false;
  currentLevelSolvedNow = false;
  startLevelTimer();
  syncHintButtonUI();
  updateMovesUI();
  destroyPinEngine();
  destroyLaserEngine();
  destroyCircuitEngine();
  destroyBalanceEngine();
  destroyMemoryCtrl();
  destroyAlgoEngine();
  destroyGearsEngine();
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
              : currentMode === 'matrix'
                ? `🧩 RAŠTAI IR ATMINTIS • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
                : currentMode === 'algo'
                  ? `🧑‍💻 ALGORITMŲ TRASA • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
                  : currentMode === 'gears'
                    ? `⚙️ KRUMPLIARAČIŲ VARIKLIS • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
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
  document.getElementById('btn-matrix-next')?.classList.add('hidden');
  document.getElementById('btn-algo-next')?.classList.add('hidden');
  document.getElementById('btn-gears-next')?.classList.add('hidden');

  if (currentMode === 'pinpull') {
    pinPullStage.classList.remove('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startPinPullLevel(level, levels.length);
  } else if (currentMode === 'sokoban') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.remove('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startSokobanLevel(level, levels.length);
  } else if (currentMode === 'laser') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.remove('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startLaserLevel(level, levels.length);
  } else if (currentMode === 'circuit') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.remove('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startCircuitLevel(level, levels.length);
  } else if (currentMode === 'balance') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.remove('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startBalanceLevel(level, levels.length);
  } else if (currentMode === 'matrix') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.remove('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startMatrixLevel(level, levels.length);
  } else if (currentMode === 'algo') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.remove('hidden');
    gearsStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startAlgoLevel(level, levels.length);
  } else if (currentMode === 'gears') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.remove('hidden');
    miniStage.classList.add('hidden');
    startGearsLevel(level, levels.length);
  } else {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
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
    onPinPull: () => {
      playPinPull();
      recordPlayerMove();
    },
    onBallClink: () => {
      playBallClink();
    },
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
        playWrongBuzz();
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
    ? '✋ Režimas: Perkelti (spausk elementą → spausk langelį)'
    : '👆 Vilkti arba spausk elementą → tuščią langelį (2x = Sukti 90°)';
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

  let prevLitTargets = 0;
  laserEngine = new LaserMirrorsEngine(laserCanvas, level, {
    onMove: (_kind, litCount = 0) => {
      playMirrorClick();
      if (litCount > prevLitTargets) {
        playLaserHum();
      }
      prevLitTargets = litCount;
      recordPlayerMove();
    },
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
    onMove: () => {
      playTrackClick();
      recordPlayerMove();
    },
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
        playWrongBuzz();
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

  let prevBalanced = false;
  balanceEngine = new BalanceScaleEngine(balanceCanvas, level, {
    onMove: (action) => {
      playBalancePop(action === 'remove');
      recordPlayerMove();
    },
    onStatusChange: ({ rightCount, balanced, won }) => {
      if (balanced && !prevBalanced) {
        playBalanceBell();
      }
      prevBalanced = !!balanced;
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

// ==================== RAŠTŲ IR ATMINTIES ŠIFRAS (IQ MATRICOS IR ATMINTIS) ====================
function startMatrixLevel(level, totalInMode) {
  const boardEl = document.getElementById('matrix-board');
  const choicesEl = document.getElementById('matrix-choices');
  const counterEl = document.getElementById('matrix-counter');
  const replayBtn = document.getElementById('btn-memory-replay');
  const nextBtn = document.getElementById('btn-matrix-next');

  boardEl.innerHTML = '';
  choicesEl.innerHTML = '';
  choicesEl.classList.toggle('hidden', level.kind === 'memory');
  replayBtn?.classList.toggle('hidden', level.kind !== 'memory');

  if (level.kind === 'memory') {
    memoryCtrl = new MemoryCodeController(boardEl, level, {
      onMove: () => {
        recordPlayerMove();
      },
      onFlash: (stepIdx) => {
        playMemoryTone(stepIdx);
      },
      onMatchedStep: (stepIdx) => {
        playMemoryTone(stepIdx);
      },
      onStatusChange: ({ phase, progress: cur, total }) => {
        if (counterEl) {
          counterEl.textContent =
            phase === 'showing'
              ? `👀 Įsimink seką! (${total} žingsniai per 3 s)`
              : phase === 'won'
                ? `🎉 Kodas atkartotas! (${total} / ${total})`
                : phase === 'failed'
                  ? '❌ Netinkamas langelis! Paspausk „Rodyti seką“ arba „Iš naujo“.'
                  : `🎯 Pakartok seką: ${cur} / ${total}`;
        }
        if (replayBtn) {
          replayBtn.disabled = phase === 'showing';
        }
      },
      onWin: () => {
        markLevelSolved(level);
        if (nextBtn && activeLevelIndex < totalInMode - 1) {
          nextBtn.classList.remove('hidden');
        }
      },
      onFail: () => {
        playWrongBuzz();
        const feedbackEl = document.getElementById('puzzle-feedback');
        feedbackEl.textContent = '❌ Nepataikei eilės tvarkos! Paspausk „👀 Rodyti seką (3 s)“ ir pamėgink dar kartą.';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    });
    return;
  }

  // IQ Matrica (3x3)
  if (counterEl) {
    counterEl.textContent = '🧩 Pasirink figūrą vietoj [ ? ]';
  }
  boardEl.style.gridTemplateColumns = 'repeat(3, auto)';

  let missingCellEl = null;
  level.grid.forEach((cellSpec) => {
    const cell = document.createElement('div');
    cell.className = 'matrix-cell';
    if (!cellSpec) {
      cell.classList.add('missing');
      cell.textContent = '?';
      missingCellEl = cell;
    } else {
      cell.innerHTML = renderShapeSvg(cellSpec);
    }
    boardEl.appendChild(cell);
  });

  let solved = false;
  level.choices.forEach((choiceSpec, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'matrix-choice-btn';
    btn.dataset.choiceIndex = String(idx);
    btn.innerHTML = renderShapeSvg(choiceSpec);
    btn.addEventListener('click', () => {
      if (solved) return;
      recordPlayerMove();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (idx === level.correctIndex) {
        solved = true;
        btn.classList.add('correct');
        if (missingCellEl) {
          missingCellEl.classList.remove('missing');
          missingCellEl.classList.add('solved-cell');
          missingCellEl.innerHTML = renderShapeSvg(choiceSpec);
        }
        if (counterEl) counterEl.textContent = '✅ Teisingas atsakymas!';
        markLevelSolved(level);
        if (nextBtn && activeLevelIndex < totalInMode - 1) {
          nextBtn.classList.remove('hidden');
        }
      } else {
        playWrongBuzz();
        btn.classList.add('wrong');
        feedbackEl.textContent = '❌ Ne visai! Atidžiai palygink kiekvieną eilutę ir stulpelį.';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    });
    choicesEl.appendChild(btn);
  });
}

// ==================== 7. ALGORITMŲ TRASA RENDERIS IR VALDYMAS ====================
function startAlgoLevel(level, totalInMode) {
  const nextBtn = document.getElementById('btn-algo-next');
  const loopBtn = document.getElementById('btn-algo-loop');
  const actBtn = document.getElementById('btn-algo-act');

  if (loopBtn) loopBtn.classList.toggle('hidden', !level.allowLoop);
  if (actBtn) actBtn.classList.remove('hidden');

  algoEngine = new AlgoEngine(algoCanvas, level, {
    onQueueChange: () => {
      renderAlgoQueue();
    },
    onRunStateChange: (isRunning) => {
      syncAlgoButtonsState(isRunning);
    },
    onStepExecuted: (kind) => {
      if (kind === 'jump' || kind === 'switch') {
        playAlgoJump();
      } else {
        playRobotStep();
      }
    },
    onError: (msg) => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      feedbackEl.textContent = `⚠️ ${msg}`;
      feedbackEl.className = 'puzzle-feedback error';
      feedbackEl.classList.remove('hidden');
    },
    onFailRun: (msg) => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      feedbackEl.textContent = msg;
      feedbackEl.className = 'puzzle-feedback error';
      feedbackEl.classList.remove('hidden');
    },
    onWin: () => {
      markLevelSolved(level);
      if (nextBtn && activeLevelIndex < totalInMode - 1) {
        nextBtn.classList.remove('hidden');
      }
    }
  });

  syncAlgoButtonsState(false);
  renderAlgoQueue();
}

function syncAlgoButtonsState(isRunning) {
  const runBtn = document.getElementById('btn-algo-run');
  const undoBtn = document.getElementById('btn-algo-undo');
  const resetBtn = document.getElementById('btn-algo-reset');
  document.querySelectorAll('.algo-cmd-btn').forEach((btn) => {
    btn.disabled = isRunning;
  });
  if (runBtn) {
    runBtn.disabled = isRunning;
    runBtn.textContent = isRunning ? '⏳ Vykdoma programa...' : '▶️ Paleisti programą';
  }
  if (undoBtn) undoBtn.disabled = isRunning;
  if (resetBtn) resetBtn.disabled = isRunning;
}

function renderAlgoQueue() {
  if (!algoEngine) return;
  const slotsEl = document.getElementById('algo-queue-slots');
  const counterEl = document.getElementById('algo-counter');
  const loopHintEl = document.getElementById('algo-loop-hint');
  if (!slotsEl) return;

  const { slots, level, execPointer, activeLoopIndex } = algoEngine;
  if (counterEl) {
    counterEl.textContent = `📋 Programa: ${slots.length} / ${level.maxSlots} vietų`;
  }
  if (loopHintEl) {
    const hasLoop = slots.some((s) => s.type === 'loop');
    loopHintEl.classList.toggle('hidden', !hasLoop);
  }

  slotsEl.innerHTML = '';

  for (let i = 0; i < level.maxSlots; i++) {
    const slot = slots[i];
    if (!slot) {
      const empty = document.createElement('div');
      empty.className = 'algo-slot empty';
      empty.textContent = String(i + 1);
      slotsEl.appendChild(empty);
      continue;
    }

    const isSlotExecuting = execPointer && execPointer.slotIdx === i;

    if (slot.type === 'cmd') {
      const meta = CMD_META[slot.cmd];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `algo-slot filled-cmd ${meta.cls}${isSlotExecuting ? ' executing' : ''}`;
      btn.title = `${meta.label} (spausk, kad pašalintum)`;
      btn.innerHTML = `<span>${meta.short}</span><span>${meta.label}</span>`;
      btn.addEventListener('click', () => {
        if (algoEngine?.running || algoEngine?.won) return;
        playTrackClick();
        algoEngine.removeSlot(i);
      });
      slotsEl.appendChild(btn);
    } else if (slot.type === 'loop') {
      const card = document.createElement('div');
      card.className = `algo-loop-card${activeLoopIndex === i ? ' active-target' : ''}${isSlotExecuting ? ' executing' : ''}`;

      const repBtn = document.createElement('button');
      repBtn.type = 'button';
      repBtn.className = 'algo-loop-rep-btn';
      repBtn.textContent = `🔁 ${slot.count}x`;
      repBtn.title = 'Spausk, kad pakeistum kartojimus (2x / 3x)';
      repBtn.addEventListener('click', () => {
        if (algoEngine?.running || algoEngine?.won) return;
        playTrackClick();
        recordPlayerMove();
        algoEngine.toggleLoopCount(i);
      });
      card.appendChild(repBtn);

      for (let subIdx = 0; subIdx < 2; subIdx++) {
        const subCmd = slot.body[subIdx];
        const subBtn = document.createElement('button');
        subBtn.type = 'button';
        const isSubExec = isSlotExecuting && execPointer.subIdx === subIdx;
        subBtn.className = `algo-loop-sub${subCmd ? ' filled' : ''}${isSubExec ? ' executing' : ''}`;
        subBtn.textContent = subCmd ? CMD_META[subCmd].short : `${subIdx + 1}?`;
        subBtn.title = subCmd ? 'Spausk, kad pakeistum / ištrintum' : 'Pasirink komandą apačioje';
        subBtn.addEventListener('click', () => {
          if (algoEngine?.running || algoEngine?.won) return;
          playTrackClick();
          algoEngine.focusOrRemoveLoopSub(i, subIdx);
        });
        card.appendChild(subBtn);
      }

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'algo-loop-del';
      delBtn.textContent = '×';
      delBtn.title = 'Pašalinti visą ciklą';
      delBtn.addEventListener('click', () => {
        if (algoEngine?.running || algoEngine?.won) return;
        playTrackClick();
        algoEngine.removeSlot(i);
      });
      card.appendChild(delBtn);

      slotsEl.appendChild(card);
    }
  }
}

// ==================== 8. KRUMPLIARAČIŲ VARIKLIS RENDERIS IR VALDYMAS ====================
function startGearsLevel(level, totalInMode) {
  const nextBtn = document.getElementById('btn-gears-next');

  gearsEngine = new GearsEngine(gearsCanvas, level, {
    onAction: () => {
      playGearPlace();
      recordPlayerMove();
    },
    onJam: () => {
      playGearJam();
    },
    onError: (msg) => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      feedbackEl.textContent = `⚠️ ${msg}`;
      feedbackEl.className = 'puzzle-feedback error';
      feedbackEl.classList.remove('hidden');
    },
    onStateChange: () => {
      renderGearsPalette();
    },
    onWin: () => {
      markLevelSolved(level);
      if (nextBtn && activeLevelIndex < totalInMode - 1) {
        nextBtn.classList.remove('hidden');
      }
    }
  });

  // Automatiškai parenkame pirmą dydį, kurio turime likučio
  const firstAvail = ['M', 'L', 'S'].find((k) => (level.inventory[k] || 0) > 0) || 'M';
  gearsEngine.setSelectedSize(firstAvail);
  renderGearsPalette();
}

function renderGearsPalette() {
  if (!gearsEngine) return;
  const paletteEl = document.getElementById('gears-palette');
  const counterEl = document.getElementById('gears-counter');
  const bannerEl = document.getElementById('gears-status-banner');
  if (!paletteEl) return;

  const placedCount = Object.keys(gearsEngine.placed).length;
  if (counterEl) {
    counterEl.textContent = `⚙️ Uždėta: ${placedCount} kr.`;
  }

  if (bannerEl) {
    const summary = gearsEngine.getStatusSummary();
    bannerEl.textContent = summary.text;
    bannerEl.className = `gears-status-banner ${summary.state}`;
  }

  paletteEl.innerHTML = '';
  ['S', 'M', 'L'].forEach((sizeKey) => {
    const spec = GEAR_SIZES[sizeKey];
    const total = gearsEngine.level.inventory[sizeKey] || 0;
    if (total <= 0) return;

    const rem = gearsEngine.getRemainingCount(sizeKey);
    const isActive = gearsEngine.selectedSize === sizeKey;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `gear-pick-btn${isActive ? ' active' : ''}`;
    btn.dataset.gearSize = sizeKey;
    btn.disabled = rem <= 0 || gearsEngine.won;
    btn.draggable = rem > 0 && !gearsEngine.won;

    const dotSize = sizeKey === 'S' ? 16 : sizeKey === 'M' ? 22 : 28;
    btn.innerHTML = `
      <span class="gear-icon-dot" style="width:${dotSize}px;height:${dotSize}px;background:${spec.color}"></span>
      <span>${spec.label}</span>
      <span class="gear-pick-count">×${rem}</span>
    `;

    btn.addEventListener('click', () => {
      if (!gearsEngine || gearsEngine.won) return;
      playTrackClick();
      gearsEngine.setSelectedSize(sizeKey);
    });

    btn.addEventListener('dragstart', (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', sizeKey);
        e.dataTransfer.effectAllowed = 'copy';
      }
      gearsEngine?.setSelectedSize(sizeKey);
    });

    paletteEl.appendChild(btn);
  });
}

function getGearsCanvasCoords(e) {
  const rect = gearsCanvas.getBoundingClientRect();
  return {
    mx: (e.clientX - rect.left) * (GEARS_CANVAS_W / rect.width),
    my: (e.clientY - rect.top) * (GEARS_CANVAS_H / rect.height)
  };
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

  if (sokobanGame.lastMovePushed) {
    playCubePush();
  } else {
    playRobotStep();
  }
  recordPlayerMove();
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
          cell.dataset.dir = `${dr},${dc}`;
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
          cell.dataset.laserCell = `${r},${c}`;
          const sym = document.createElement('span');
          sym.className = 'mirror-symbol';
          sym.textContent = mirrorStates[mIdx].type;
          cell.appendChild(sym);
          cell.title = 'Paspausk, kad pasuktum veidrodį';
          cell.addEventListener('click', () => {
            mirrorStates[mIdx].type = mirrorStates[mIdx].type === '/' ? '\\' : '/';
            playMirrorClick();
            recordPlayerMove();
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
    btn.dataset.switchIndex = String(idx);
    btn.textContent = `${switchStates[idx] ? '🟢 ĮJUNGTA' : '⚪ IŠJUNGTA'} (+${val} V)`;
    btn.addEventListener('click', () => {
      switchStates[idx] = !switchStates[idx];
      playLaserHum();
      recordPlayerMove();
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
    btn.dataset.seqValue = String(choice);
    btn.textContent = String(choice);
    btn.addEventListener('click', () => {
      recordPlayerMove();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (choice === level.answer) {
        markLevelSolved(level);
      } else {
        playWrongBuzz();
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
function resetAttemptState() {
  currentMoves = 0;
  currentLevelSolvedNow = false;
  clearAllHints();
  updateMovesUI();
  startLevelTimer();
  syncHintButtonUI();
}

document.getElementById('btn-lab-hint')?.addEventListener('click', applyFirstHint);
document.getElementById('btn-select-grade1')?.addEventListener('click', () => selectDifficulty('grade1'));
document.getElementById('btn-select-grade3')?.addEventListener('click', () => selectDifficulty('grade3'));
document.getElementById('btn-back-difficulty')?.addEventListener('click', showDifficultyScreen);
btnOpenWorldMap?.addEventListener('click', showWorldMapView);

document.getElementById('tab-mode-pinpull')?.addEventListener('click', () => switchLabMode('pinpull'));
document.getElementById('tab-mode-sokoban')?.addEventListener('click', () => switchLabMode('sokoban'));
document.getElementById('tab-mode-laser')?.addEventListener('click', () => switchLabMode('laser'));
document.getElementById('tab-mode-circuit')?.addEventListener('click', () => switchLabMode('circuit'));
document.getElementById('tab-mode-balance')?.addEventListener('click', () => switchLabMode('balance'));
document.getElementById('tab-mode-matrix')?.addEventListener('click', () => switchLabMode('matrix'));
document.getElementById('tab-mode-algo')?.addEventListener('click', () => switchLabMode('algo'));
document.getElementById('tab-mode-gears')?.addEventListener('click', () => switchLabMode('gears'));
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
  resetAttemptState();
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

// Braukimas pirštu (Swipe) bet kurioje ekrano vietoje „Robo-Stumduko“ režime
let swipeStart = null;

function isSokobanSwipeActive(target) {
  if (!currentDifficulty || currentMode !== 'sokoban' || !sokobanGame || sokobanGame.won) return false;
  if (victoryModal && !victoryModal.classList.contains('hidden')) return false;
  if (target && target.closest && target.closest('button, a')) return false;
  return true;
}

window.addEventListener(
  'pointerdown',
  (e) => {
    if (!isSokobanSwipeActive(e.target)) {
      swipeStart = null;
      return;
    }
    swipeStart = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
  },
  { passive: true }
);

window.addEventListener(
  'pointerup',
  (e) => {
    if (!swipeStart || e.pointerId !== swipeStart.pointerId) return;
    const dx = e.clientX - swipeStart.x;
    const dy = e.clientY - swipeStart.y;
    swipeStart = null;
    if (!isSokobanSwipeActive(null)) return;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 26) return;

    if (absX > absY) {
      handleSokobanMove(0, dx > 0 ? 1 : -1);
    } else {
      handleSokobanMove(dy > 0 ? 1 : -1, 0);
    }
  },
  { passive: true }
);

// Užtikriname, kad braukimas pirštu neslinktų ekrano „Robo-Stumduko“ metu
sokobanStage?.addEventListener(
  'touchmove',
  (e) => {
    if (currentDifficulty && currentMode === 'sokoban') {
      e.preventDefault();
    }
  },
  { passive: false }
);

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
  resetAttemptState();
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
  pinCanvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!pinEngine) return;
      e.preventDefault();
      const { mx, my } = getCanvasCoords(e);
      pinEngine.handlePointerDown(mx, my);
    },
    { passive: false }
  );

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
  resetAttemptState();
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
  laserCanvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!laserEngine) return;
      e.preventDefault();
      laserCanvas.setPointerCapture?.(e.pointerId);
      const { mx, my } = getLaserCanvasCoords(e);
      laserEngine.handlePointerDown(mx, my);
    },
    { passive: false }
  );

  laserCanvas.addEventListener(
    'pointermove',
    (e) => {
      if (!laserEngine) return;
      const { mx, my } = getLaserCanvasCoords(e);
      laserEngine.handlePointerMove(mx, my);
    },
    { passive: true }
  );

  laserCanvas.addEventListener('pointerup', (e) => {
    if (!laserEngine) return;
    if (laserCanvas.hasPointerCapture?.(e.pointerId)) {
      laserCanvas.releasePointerCapture(e.pointerId);
    }
    const { mx, my } = getLaserCanvasCoords(e);
    laserEngine.handlePointerUp(mx, my);
  });

  laserCanvas.addEventListener('pointercancel', (e) => {
    if (!laserEngine) return;
    if (laserCanvas.hasPointerCapture?.(e.pointerId)) {
      laserCanvas.releasePointerCapture(e.pointerId);
    }
    const { mx, my } = getLaserCanvasCoords(e);
    laserEngine.handlePointerUp(mx, my);
  });
}

document.getElementById('btn-circuit-launch')?.addEventListener('click', () => {
  if (!circuitEngine) return;
  playTrainLaunch();
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
  resetAttemptState();
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
  circuitCanvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!circuitEngine) return;
      e.preventDefault();
      const { mx, my } = getCircuitCanvasCoords(e);
      circuitEngine.handlePointerDown(mx, my);
    },
    { passive: false }
  );
}

document.getElementById('btn-balance-reset')?.addEventListener('click', () => {
  if (!balanceEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-balance-next')?.classList.add('hidden');
  balanceEngine.reset();
  resetAttemptState();
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
  balanceCanvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!balanceEngine) return;
      e.preventDefault();
      const { mx, my } = getBalanceCanvasCoords(e);
      balanceEngine.handlePointerDown(mx, my);
    },
    { passive: false }
  );
}

document.getElementById('btn-memory-replay')?.addEventListener('click', () => {
  if (!memoryCtrl) return;
  recordPlayerMove();
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  memoryCtrl.startShowcase();
});

document.getElementById('btn-matrix-reset')?.addEventListener('click', () => {
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-matrix-next')?.classList.add('hidden');
  loadActiveLevel();
});

document.getElementById('btn-matrix-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

// 7. Algoritmų trasa mygtukai
[
  ['btn-algo-fwd', 'FWD'],
  ['btn-algo-left', 'LEFT'],
  ['btn-algo-right', 'RIGHT'],
  ['btn-algo-act', 'ACT']
].forEach(([btnId, cmd]) => {
  document.getElementById(btnId)?.addEventListener('click', () => {
    if (!algoEngine || algoEngine.running || algoEngine.won) return;
    const feedbackEl = document.getElementById('puzzle-feedback');
    feedbackEl.className = 'puzzle-feedback hidden';
    feedbackEl.textContent = '';
    if (algoEngine.addCommand(cmd)) {
      playTrackClick();
      recordPlayerMove();
    }
  });
});

document.getElementById('btn-algo-loop')?.addEventListener('click', () => {
  if (!algoEngine || algoEngine.running || algoEngine.won) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  if (algoEngine.addLoopBlock()) {
    playTrackClick();
    recordPlayerMove();
  }
});

document.getElementById('btn-algo-run')?.addEventListener('click', () => {
  if (!algoEngine || algoEngine.running || algoEngine.won) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  recordPlayerMove();
  algoEngine.runProgram();
});

document.getElementById('btn-algo-undo')?.addEventListener('click', () => {
  if (!algoEngine || algoEngine.running || algoEngine.won) return;
  if (algoEngine.undoLast()) {
    playTrackClick();
  }
});

document.getElementById('btn-algo-reset')?.addEventListener('click', () => {
  if (!algoEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-algo-next')?.classList.add('hidden');
  algoEngine.resetAll();
  resetAttemptState();
});

document.getElementById('btn-algo-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

// 8. Krumpliaračių variklio įvykiai
document.getElementById('btn-gears-reset')?.addEventListener('click', () => {
  if (!gearsEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-gears-next')?.classList.add('hidden');
  gearsEngine.reset();
  resetAttemptState();
});

document.getElementById('btn-gears-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

if (gearsCanvas) {
  gearsCanvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!gearsEngine) return;
      e.preventDefault();
      const { mx, my } = getGearsCanvasCoords(e);
      gearsEngine.handlePointerDown(mx, my);
    },
    { passive: false }
  );

  gearsCanvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  });

  gearsCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!gearsEngine) return;
    const sizeKey = e.dataTransfer?.getData('text/plain') || gearsEngine.selectedSize;
    const { mx, my } = getGearsCanvasCoords(e);
    gearsEngine.handleDropFromPalette(sizeKey, mx, my);
  });
}

btnSoundToggle?.addEventListener('click', () => {
  toggleSound();
  syncSoundToggleUI();
});

const MODE_SEQUENCE = ['pinpull', 'sokoban', 'laser', 'circuit', 'balance', 'matrix', 'algo', 'gears', 'mini'];

document.getElementById('btn-victory-next')?.addEventListener('click', () => {
  hideVictoryOverlay();
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  } else {
    const curModeIdx = MODE_SEQUENCE.indexOf(currentMode);
    const nextMode = MODE_SEQUENCE[(curModeIdx + 1) % MODE_SEQUENCE.length];
    switchLabMode(nextMode);
  }
});

document.getElementById('btn-victory-all')?.addEventListener('click', () => {
  hideVictoryOverlay();
  showWorldMapView();
});

victoryModal?.addEventListener('click', (e) => {
  if (e.target === victoryModal) {
    hideVictoryOverlay();
  }
});

syncSoundToggleUI();
updateSummaryUI();
