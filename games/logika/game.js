// ==================== PROTO LABORATORIJA (LOGIKOS ŽAIDIMAS 1–3 KL.) ====================
// Progreso raktas localStorage: 'proto_lab_progress'
import { PinPullEngine, PINPULL_LEVELS, CANVAS_W, CANVAS_H } from './pinpull.js?v=20261113m';
import { SokobanGame, SOKOBAN_LEVELS } from './sokoban.js?v=20261113m';
import { LaserMirrorsEngine, LASER_LEVELS, LASER_CANVAS_W, LASER_CANVAS_H } from './lasers.js?v=20261113m';
import { CircuitEngine, CIRCUIT_LEVELS, CIRCUIT_CANVAS_W, CIRCUIT_CANVAS_H } from './circuits.js?v=20261113m';
import {
  BalanceScaleEngine,
  BALANCE_LEVELS,
  ITEM_CATALOG,
  BALANCE_CANVAS_W,
  BALANCE_CANVAS_H
} from './balance.js?v=20261113m';
import { MATRIX_LEVELS, renderShapeSvg, MemoryCodeController } from './matrix.js?v=20261113m';
import { AlgoEngine, ALGO_LEVELS, CMD_META } from './algo.js?v=20261113m';
import { GearsEngine, GEARS_LEVELS, GEAR_SIZES, GEARS_CANVAS_W, GEARS_CANVAS_H } from './gears.js?v=20261113m';
import { GravityMazeEngine, GRAVITY_LEVELS } from './gravity.js?v=20261113m';
import {
  MathCrossEngine,
  MATHCROSS_LEVELS,
  MATHCROSS_CANVAS_W,
  MATHCROSS_CANVAS_H
} from './mathcross.js?v=20261113m';
import {
  BridgesEngine,
  BRIDGES_LEVELS,
  BRIDGES_CANVAS_W,
  BRIDGES_CANVAS_H
} from './bridges.js?v=20261113m';
import {
  PipeValveEngine,
  JugPourEngine,
  FLASK_LEVELS,
  FLASK_CANVAS_W,
  FLASK_CANVAS_H,
  RYB_COLORS
} from './flasks.js?v=20261113m';
import { getParMoves, computeFirstHint } from './hints.js?v=20261113m';
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
  playGearJam,
  playGravitySlide,
  playIceBreak,
  playPortalWarp
} from './sound.js?v=20261113m';
import { launchVictoryConfetti, stopVictoryConfetti } from './confetti.js?v=20261113m';
import {
  ROBOT_PARTS,
  createDefaultRobotColors,
  normalizeRobotColors,
  getColorTheme,
  cycleRobotPartColor,
  getUnlockedPartIds,
  renderRobotWorkshopSvg
} from './robot.js?v=20261113m';
import { computeInventionsState } from './inventions.js?v=20261113m';

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

// ==================== BŪSENA ====================
let progress = loadLabProgress();
let currentDifficulty = null;
let currentMode = 'pinpull'; // 'pinpull' | 'sokoban' | 'laser' | 'circuit' | 'balance' | 'matrix' | 'algo' | 'gears' | 'gravity' | 'mathcross' | 'bridges' | 'mini'
let activeLevelIndex = 0;
let pinEngine = null;
let sokobanGame = null;
let sokobanWinTimer = null;
let laserEngine = null;
let laserResetTimer = null;
let circuitEngine = null;
let circuitResetTimer = null;
let balanceEngine = null;
let balanceResetTimer = null;
let memoryCtrl = null;
let matrixResetTimer = null;
let onMatrixCheckClick = null;
let algoEngine = null;
let gearsEngine = null;
let gravityEngine = null;
let mathCrossEngine = null;
let bridgesEngine = null;
let pipeValveEngine = null;
let jugPourEngine = null;
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
const gravityCanvas = document.getElementById('gravity-canvas');
const gravityStage = document.getElementById('gravity-stage');
const mathCrossCanvas = document.getElementById('mathcross-canvas');
const mathCrossStage = document.getElementById('mathcross-stage');
const bridgesCanvas = document.getElementById('bridges-canvas');
const bridgesStage = document.getElementById('bridges-stage');
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
    ...GRAVITY_LEVELS[diff],
    ...MATHCROSS_LEVELS[diff],
    ...BRIDGES_LEVELS[diff],
    ...FLASK_LEVELS[diff]
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
  },
  {
    mode: 'gravity',
    title: '9. Gravitacijos labirintas',
    desc: 'Slydimas ledu, portalai ir prarajos',
    icon: '🧊',
    accent: '#60a5fa'
  },
  {
    mode: 'mathcross',
    title: '10. Skaičių kryžiažodžiai',
    desc: 'Kryžiažodžiai ir magiškieji trikampiai',
    icon: '🔢',
    accent: '#facc15'
  },
  {
    mode: 'bridges',
    title: '11. Energijos tiltai',
    desc: 'Dedukciniai salų tinklai (Hashi)',
    icon: '🌉',
    accent: '#38bdf8'
  },
  {
    mode: 'mini',
    title: '12. Kolbų laboratorija',
    desc: 'Spalvų sklendės ir perpylimo uždaviniai',
    icon: '🧪',
    accent: '#22d3ee'
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
  if (mode === 'gravity') return GRAVITY_LEVELS[diff];
  if (mode === 'mathcross') return MATHCROSS_LEVELS[diff];
  if (mode === 'bridges') return BRIDGES_LEVELS[diff];
  return FLASK_LEVELS[diff];
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
  renderInventionsBadge();
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
      nextEl.textContent = `🎉 ŠAUNU! Visos ${ROBOT_PARTS.length} kosminio roboto detalės ir priedai atrakinti! Paspausk ant bet kurios detalės spalvai keisti.`;
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
  destroyGravityEngine();
  destroyMathCrossEngine();
  destroyBridgesEngine();
  destroyMiniFlaskEngine();

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
  destroyGravityEngine();
  destroyMathCrossEngine();
  destroyBridgesEngine();
  destroyMiniFlaskEngine();
  destroySokobanState();
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
  document.getElementById('tab-mode-gravity')?.classList.toggle('active', currentMode === 'gravity');
  document.getElementById('tab-mode-mathcross')?.classList.toggle('active', currentMode === 'mathcross');
  document.getElementById('tab-mode-bridges')?.classList.toggle('active', currentMode === 'bridges');
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
    mode !== 'gravity' &&
    mode !== 'mathcross' &&
    mode !== 'bridges' &&
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
                        : currentMode === 'gravity'
                          ? '🧊 Ledas'
                          : currentMode === 'mathcross'
                            ? lvl.kind === 'crossword' ? '🔢 Kryžiažodis' : '🔺 Magiškas'
                            : currentMode === 'bridges'
                              ? '🌉 Tiltai'
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

  // Gravitacijos labirintas abiejose klasėse vertina „Meistro tikslą“; kitur 1 kl. visada gauna 3 ⭐
  const par =
    level.masterMoves != null
      ? level.masterMoves
      : currentDifficulty === 'grade3'
        ? getParMoves(level.id)
        : null;
  const earnedStars = !par || currentMoves <= par ? 3 : 2;
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
      par && earnedStars === 2
        ? `🎉 Lygis įveiktas! +${level.reward} 💎 • Įvertinimas: ${starsStr} (Meistro tikslui: ≤ ${par} ėj.!)`
        : `🎉 PUIKIAI! Lygis įveiktas! +${level.reward} 💎 • Įvertinimas: ${starsStr}!`;
  } else {
    saveLabProgress(progress);
    renderLevelsStrip();
    renderWorldMap();
    if (improvedStars) {
      feedbackEl.textContent = `🌟 REKORDAS PAGERINTAS! ${starsStr} (${currentMoves} ėj.)!`;
    } else if (par && earnedStars === 2 && (bucket.levelStars[level.id] || 0) < 3) {
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
    if (par) {
      parts.push(
        earnedStars === 3
          ? `Puikus efektyvumas: ${currentMoves} / ${par} ėj.!`
          : `Ėjimai: ${currentMoves} (Meistro tikslas: ≤ ${par} ėj.)`
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
  if (laserResetTimer) {
    clearTimeout(laserResetTimer);
    laserResetTimer = null;
  }
  if (laserEngine) {
    laserEngine.destroy();
    laserEngine = null;
  }
}

function destroyCircuitEngine() {
  if (circuitResetTimer) {
    clearTimeout(circuitResetTimer);
    circuitResetTimer = null;
  }
  if (circuitEngine) {
    circuitEngine.destroy();
    circuitEngine = null;
  }
}

function destroyBalanceEngine() {
  if (balanceResetTimer) {
    clearTimeout(balanceResetTimer);
    balanceResetTimer = null;
  }
  if (balanceEngine) {
    balanceEngine.destroy();
    balanceEngine = null;
  }
}

function destroyMemoryCtrl() {
  if (matrixResetTimer) {
    clearTimeout(matrixResetTimer);
    matrixResetTimer = null;
  }
  onMatrixCheckClick = null;
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

function destroyGravityEngine() {
  if (gravityEngine) {
    gravityEngine.destroy();
    gravityEngine = null;
  }
}

function destroyMathCrossEngine() {
  if (mathCrossEngine) {
    mathCrossEngine.destroy();
    mathCrossEngine = null;
  }
}

function destroySokobanState() {
  if (sokobanWinTimer) {
    clearTimeout(sokobanWinTimer);
    sokobanWinTimer = null;
  }
  sokobanGame = null;
}

function destroyBridgesEngine() {
  if (bridgesEngine) {
    bridgesEngine.destroy();
    bridgesEngine = null;
  }
}

function destroyMiniFlaskEngine() {
  if (pipeValveEngine) {
    pipeValveEngine.destroy();
    pipeValveEngine = null;
  }
  if (jugPourEngine) {
    jugPourEngine.destroy();
    jugPourEngine = null;
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
  gravityEngine?.setHint(null);
  bridgesEngine?.setHintIsland(null);
  pipeValveEngine?.setHint(null);
  jugPourEngine?.setHintAction(null);
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
    gravityEngine,
    mathCrossEngine,
    bridgesEngine,
    pipeValveEngine,
    jugPourEngine
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
    const btn = document.querySelector(`.weight-token-btn[data-uid="${hint.uid}"]`);
    btn?.classList.add('hint-highlight');
  } else if (hint.kind === 'balance-remove') {
    balanceEngine?.setHintRemove(true);
  } else if (hint.kind === 'balance-check') {
    document.getElementById('btn-balance-check')?.classList.add('hint-highlight');
  } else if (hint.kind === 'memory-cell') {
    memoryCtrl?.setHintCell(hint.cellIndex);
  } else if (hint.kind === 'matrix-eliminate') {
    hint.eliminateIndices.forEach((idx) => {
      const btn = document.querySelector(`.matrix-choice-btn[data-choice-index="${idx}"]`);
      btn?.classList.add('hint-dimmed');
    });
  } else if (hint.kind === 'mini-pipe-valve') {
    pipeValveEngine?.setHint(hint.valveId);
  } else if (hint.kind === 'mini-pipe-launch') {
    document.getElementById('btn-flask-launch')?.classList.add('hint-highlight');
  } else if (hint.kind === 'mini-jug-move') {
    jugPourEngine?.setHintAction(hint.action);
  } else if (hint.kind === 'algo-cmd') {
    const btn = document.querySelector(`.algo-cmd-btn[data-algo-cmd="${hint.cmd}"]`);
    btn?.classList.add('hint-btn-pulse');
  } else if (hint.kind === 'gear-peg') {
    gearsEngine?.setHint({ pegId: hint.pegId, sizeKey: hint.sizeKey });
    const btn = document.querySelector(`.gear-pick-btn[data-gear-size="${hint.sizeKey}"]`);
    btn?.classList.add('hint-btn-pulse');
  } else if (hint.kind === 'gravity-dir') {
    gravityEngine?.setHint(hint.dir);
    const btn = document.querySelector(`.grav-dpad-btn[data-grav-dir="${hint.dir}"]`);
    btn?.classList.add('hint-btn-pulse');
  } else if (hint.kind === 'mathcross-place') {
    mathCrossEngine?.applyOneHint();
  } else if (hint.kind === 'bridge-island') {
    bridgesEngine?.setHintIsland(hint.islandId);
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
  destroyGravityEngine();
  destroyMathCrossEngine();
  destroyBridgesEngine();
  destroyMiniFlaskEngine();
  destroySokobanState();
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
                    : currentMode === 'gravity'
                      ? `🧊 GRAVITACIJOS LABIRINTAS • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
                      : currentMode === 'mathcross'
                        ? `🔢 SKAIČIŲ KRYŽIAŽODŽIAI • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
                        : currentMode === 'bridges'
                          ? `🌉 ENERGIJOS TILTAI • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`
                          : `🧪 KOLBŲ LABORATORIJA • ${currentDifficulty === 'grade1' ? '1 KLASĖ' : '3 KLASĖ'}`;
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
  document.getElementById('btn-gravity-next')?.classList.add('hidden');
  document.getElementById('btn-mathcross-next')?.classList.add('hidden');
  document.getElementById('btn-bridges-next')?.classList.add('hidden');

  if (currentMode === 'pinpull') {
    pinPullStage.classList.remove('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
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
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
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
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
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
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
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
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
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
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
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
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
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
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startGearsLevel(level, levels.length);
  } else if (currentMode === 'gravity') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    gravityStage?.classList.remove('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startGravityLevel(level, levels.length);
  } else if (currentMode === 'mathcross') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.remove('hidden');
    bridgesStage?.classList.add('hidden');
    miniStage.classList.add('hidden');
    startMathCrossLevel(level, levels.length);
  } else if (currentMode === 'bridges') {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.remove('hidden');
    miniStage.classList.add('hidden');
    startBridgesLevel(level, levels.length);
  } else {
    pinPullStage.classList.add('hidden');
    sokobanStage?.classList.add('hidden');
    laserStage?.classList.add('hidden');
    circuitStage?.classList.add('hidden');
    balanceStage?.classList.add('hidden');
    matrixStage?.classList.add('hidden');
    algoStage?.classList.add('hidden');
    gearsStage?.classList.add('hidden');
    gravityStage?.classList.add('hidden');
    mathCrossStage?.classList.add('hidden');
    bridgesStage?.classList.add('hidden');
    miniStage.classList.remove('hidden');
    miniStage.innerHTML = '';
    renderFlaskLabStage(miniStage, level, levels.length);
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
        counterEl.textContent =
          status === 'winning' || status === 'won'
            ? `🧪 Kolboje: ${goalCount} / ${requiredGoal} • 🟢 Pilna!`
            : `🧪 Kolboje: ${goalCount} / ${requiredGoal}`;
      }
      if (status === 'winning') {
        playBalanceBell();
      } else if (status === 'won') {
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

  if (laserResetTimer) {
    clearTimeout(laserResetTimer);
    laserResetTimer = null;
  }

  laserMoveToolActive = false;
  if (toolBtn) {
    toolBtn.classList.toggle('hidden', !level.movable);
    updateLaserToolBtnUI();
  }
  if (splitterLegend) {
    splitterLegend.classList.toggle('hidden', !level.movable);
  }
  if (counterEl) {
    counterEl.classList.remove('is-low-moves');
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
    onStatusChange: ({ litTargets, totalTargets, movesLeft, maxMoves, isWinning, won }) => {
      if (counterEl) {
        const leftText = typeof movesLeft === 'number' ? ` • 🔄 Liko ėjimų: ${movesLeft} / ${maxMoves}` : '';
        counterEl.textContent = isWinning
          ? `💎 Kristalai: ${litTargets} / ${totalTargets} • ✨ Švyti!`
          : `💎 Kristalai: ${litTargets} / ${totalTargets}${leftText}`;
        counterEl.classList.toggle('is-low-moves', typeof movesLeft === 'number' && movesLeft <= 2 && !won && !isWinning);
      }
      if (isWinning) {
        playBalanceBell();
      }
      if (won) {
        markLevelSolved(level);
        if (nextBtn && activeLevelIndex < totalInMode - 1) {
          nextBtn.classList.remove('hidden');
        }
      }
    },
    onOutOfMoves: () => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.textContent =
          '⚡ Baigėsi lazerio energija (ėjimų limitas)! Prieš spaudžiant, susek kelią akimis – lygis persikrauna...';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
      if (laserResetTimer) clearTimeout(laserResetTimer);
      laserResetTimer = setTimeout(() => {
        laserResetTimer = null;
        if (laserEngine) {
          prevLitTargets = 0;
          laserEngine.reset();
          resetAttemptState();
        }
      }, 1250);
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

  if (circuitResetTimer) {
    clearTimeout(circuitResetTimer);
    circuitResetTimer = null;
  }

  if (g3Legend) {
    g3Legend.classList.toggle('hidden', currentDifficulty !== 'grade3');
  }
  if (launchBtn) {
    launchBtn.disabled = false;
  }
  if (counterEl) {
    counterEl.classList.remove('is-low-moves');
  }

  circuitEngine = new CircuitEngine(circuitCanvas, level, {
    onMove: () => {
      playTrackClick();
      recordPlayerMove();
    },
    onStatusChange: ({ readyToWin, totalStars, collectedStars, movesLeft, maxMoves, running }) => {
      if (counterEl) {
        const movesTxt = typeof movesLeft === 'number' ? ` • 🔄 Ėjimai: ${movesLeft}/${maxMoves}` : '';
        counterEl.textContent = running
          ? `🚂 Važiuoja... ⭐ ${collectedStars} / ${totalStars}`
          : `⭐ ${collectedStars} / ${totalStars}${readyToWin ? ' • ✅ Kelias sujungtas!' : movesTxt}`;
        counterEl.classList.toggle('is-low-moves', !running && !readyToWin && typeof movesLeft === 'number' && movesLeft <= 2);
      }
      if (launchBtn) {
        launchBtn.disabled = !!running;
      }
    },
    onOutOfMoves: () => {
      playWrongBuzz();
      if (launchBtn) launchBtn.disabled = true;
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.textContent =
          '⚡ Baigėsi pasukimų energija! Pirma suplanuok trasą akimis – bėgiai grįžta į pradžią...';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
      if (circuitResetTimer) clearTimeout(circuitResetTimer);
      circuitResetTimer = setTimeout(() => {
        circuitResetTimer = null;
        if (circuitEngine) {
          circuitEngine.reset();
          if (launchBtn) launchBtn.disabled = false;
          resetAttemptState();
        }
      }, 1250);
    },
    onRunResult: ({ won, reason, starsCollected, totalStars }) => {
      if (launchBtn) {
        launchBtn.disabled = !!won;
      }
      if (won) {
        playBalanceBell();
        if (counterEl) {
          counterEl.classList.remove('is-low-moves');
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

function formatCluePanHtml(entries = []) {
  return entries
    .map((entry) => {
      if (typeof entry.weight === 'number') {
        return `<span class="clue-weight-badge">${entry.weight}</span>`;
      }
      const meta = ITEM_CATALOG[entry.kind] || ITEM_CATALOG.bolt;
      if (entry.mult && entry.mult > 1) {
        return `<span class="clue-mult-badge">${entry.mult}×${meta.icon}</span>`;
      }
      const count = entry.count || 1;
      return `<span class="clue-item-icon">${meta.icon.repeat(count)}</span>`;
    })
    .join('<span aria-hidden="true">+</span>');
}

function renderBalanceHints(level) {
  const hintsEl = document.getElementById('balance-hints');
  if (!hintsEl) return;
  hintsEl.innerHTML = '';

  (level.clues || []).forEach((clue, idx) => {
    const card = document.createElement('div');
    card.className = 'clue-scale-card';
    card.innerHTML = `
      <span class="clue-scale-caption">⚖️ UŽUOMINŲ SVARSTYKLĖS ${level.clues.length > 1 ? `#${idx + 1}` : ''}</span>
      <div class="clue-scale-row">
        <div class="clue-pan">${formatCluePanHtml(clue.left)}</div>
        <div class="clue-fulcrum"><span class="clue-eq-badge">=</span></div>
        <div class="clue-pan">${formatCluePanHtml(clue.right)}</div>
      </div>
    `;
    hintsEl.appendChild(card);
  });
}

function renderBalanceTray(level) {
  const trayEl = document.getElementById('balance-tray');
  if (!trayEl) return;
  trayEl.innerHTML = '';

  (level.inventory || []).forEach((token) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = token.mult ? 'weight-token-btn is-mult' : 'weight-token-btn';
    btn.dataset.uid = token.uid;
    btn.innerHTML = `<span class="weight-token-icon">⚖️</span><span>${token.label}</span>`;
    btn.addEventListener('click', () => {
      if (!balanceEngine) return;
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.className = 'puzzle-feedback hidden';
        feedbackEl.textContent = '';
      }
      balanceEngine.placeToken(token.uid);
    });
    trayEl.appendChild(btn);
  });
}

function updateBalanceHeartsUI(hearts, maxHearts) {
  const heartsEl = document.getElementById('balance-hearts');
  if (!heartsEl) return;
  const full = '❤️'.repeat(Math.max(0, hearts));
  const empty = '🖤'.repeat(Math.max(0, maxHearts - hearts));
  heartsEl.textContent = `${full}${empty}`;
}

function startBalanceLevel(level, totalInMode) {
  const counterEl = document.getElementById('balance-counter');
  const nextBtn = document.getElementById('btn-balance-next');
  const checkBtn = document.getElementById('btn-balance-check');

  if (balanceResetTimer) {
    clearTimeout(balanceResetTimer);
    balanceResetTimer = null;
  }

  renderBalanceHints(level);
  renderBalanceTray(level);

  balanceEngine = new BalanceScaleEngine(balanceCanvas, level, {
    onMove: (action) => {
      playBalancePop(action === 'remove');
      recordPlayerMove();
    },
    onStatusChange: ({ rightCount, rightUids, hearts, maxHearts, outOfHearts, won }) => {
      updateBalanceHeartsUI(hearts, maxHearts);
      if (counterEl) {
        counterEl.textContent = won
          ? `🟢 Pusiausvyra pasiekta! (${rightCount} sv.)`
          : `⚖️ Dešinėje lėkštėje: ${rightCount} sv.`;
      }
      if (checkBtn) {
        checkBtn.disabled = !!won || !!outOfHearts;
      }
      const placedSet = new Set(rightUids || []);
      document.querySelectorAll('.weight-token-btn').forEach((b) => {
        const isPlaced = placedSet.has(b.dataset.uid);
        b.classList.toggle('is-placed', isPlaced);
        b.disabled = isPlaced || !!won || !!outOfHearts;
      });
    },
    onCheckResult: ({ balanced, diff, hearts, outOfHearts }) => {
      recordPlayerMove();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (balanced) {
        playBalanceBell();
        if (feedbackEl) {
          feedbackEl.className = 'puzzle-feedback hidden';
          feedbackEl.textContent = '';
        }
        return;
      }

      playWrongBuzz();
      if (feedbackEl) {
        if (outOfHearts) {
          feedbackEl.textContent = '💔 Baigėsi visos 3 širdelės! Svarstyklės netrukus persikraus iš naujo.';
          balanceResetTimer = setTimeout(() => {
            balanceResetTimer = null;
            if (!balanceEngine) return;
            balanceEngine.reset();
            resetAttemptState();
            feedbackEl.className = 'puzzle-feedback hidden';
            feedbackEl.textContent = '';
          }, 1700);
        } else {
          const sideMsg =
            diff < 0
              ? '⬅️ Kairė pusė nusvėrė! Dešinė per lengva – pakeisk arba pridėk svarsčių.'
              : '➡️ Dešinė pusė nusvėrė! Paspausk ant svarsčio dešinėje lėkštėje, kad nuimtum.';
          feedbackEl.textContent = `${sideMsg} (Liko ❤️ ${hearts})`;
        }
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
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
  const heartsEl = document.getElementById('matrix-hearts');
  const checkBtn = document.getElementById('btn-matrix-check');
  const replayBtn = document.getElementById('btn-memory-replay');
  const nextBtn = document.getElementById('btn-matrix-next');

  if (matrixResetTimer) {
    clearTimeout(matrixResetTimer);
    matrixResetTimer = null;
  }
  onMatrixCheckClick = null;

  boardEl.innerHTML = '';
  choicesEl.innerHTML = '';
  choicesEl.classList.toggle('hidden', level.kind === 'memory');
  replayBtn?.classList.toggle('hidden', level.kind !== 'memory');
  heartsEl?.classList.toggle('hidden', level.kind === 'memory');
  checkBtn?.classList.toggle('hidden', level.kind === 'memory');
  if (checkBtn) checkBtn.disabled = false;

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

  // IQ Matrica (3x3) su pasirinkimu, „Patikrinti“ mygtuku ir 2 širdelėmis
  const maxHearts = 2;
  let hearts = maxHearts;
  let selectedIdx = null;
  let solved = false;
  let lockedOut = false;

  const updateMatrixHeartsUI = () => {
    if (!heartsEl) return;
    heartsEl.textContent = `${'❤️'.repeat(Math.max(0, hearts))}${'🖤'.repeat(Math.max(0, maxHearts - hearts))}`;
  };
  updateMatrixHeartsUI();

  if (counterEl) {
    counterEl.textContent = '🧩 Pasirink figūrą ir spausk „✅ Patikrinti“';
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

  const choiceBtns = [];
  level.choices.forEach((choiceSpec, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'matrix-choice-btn';
    btn.dataset.choiceIndex = String(idx);
    btn.innerHTML = renderShapeSvg(choiceSpec);
    btn.addEventListener('click', () => {
      if (solved || lockedOut) return;
      selectedIdx = idx;
      choiceBtns.forEach((b, bIdx) => b.classList.toggle('is-selected', bIdx === idx));
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.className = 'puzzle-feedback hidden';
        feedbackEl.textContent = '';
      }
    });
    choiceBtns.push(btn);
    choicesEl.appendChild(btn);
  });

  onMatrixCheckClick = () => {
    if (solved || lockedOut) return;
    const feedbackEl = document.getElementById('puzzle-feedback');
    if (selectedIdx === null) {
      playWrongBuzz();
      if (feedbackEl) {
        feedbackEl.textContent = '⚠️ Pirmiausia pasirink vieną iš 4 figūrų apačioje!';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
      return;
    }

    recordPlayerMove();
    const chosenBtn = choiceBtns[selectedIdx];
    const choiceSpec = level.choices[selectedIdx];

    if (selectedIdx === level.correctIndex) {
      solved = true;
      lockedOut = true;
      playBalanceBell();
      chosenBtn?.classList.remove('is-selected');
      chosenBtn?.classList.add('correct');
      choiceBtns.forEach((b) => {
        b.disabled = true;
      });
      if (checkBtn) checkBtn.disabled = true;
      if (missingCellEl) {
        missingCellEl.classList.remove('missing');
        missingCellEl.classList.add('solved-cell');
        missingCellEl.innerHTML = renderShapeSvg(choiceSpec);
      }
      boardEl.querySelectorAll('.matrix-cell').forEach((cellEl, cellIdx) => {
        const delayMs = (Math.floor(cellIdx / 3) + (cellIdx % 3)) * 95;
        cellEl.style.setProperty('--win-delay', `${delayMs}ms`);
        cellEl.classList.add('matrix-won-sweep');
      });
      if (counterEl) counterEl.textContent = '✅ Teisingas atsakymas!';
      if (matrixResetTimer) clearTimeout(matrixResetTimer);
      matrixResetTimer = setTimeout(() => {
        matrixResetTimer = null;
        if (!solved) return;
        markLevelSolved(level);
        if (nextBtn && activeLevelIndex < totalInMode - 1) {
          nextBtn.classList.remove('hidden');
        }
      }, 1550);
    } else {
      playWrongBuzz();
      hearts = Math.max(0, hearts - 1);
      updateMatrixHeartsUI();
      chosenBtn?.classList.remove('is-selected');
      chosenBtn?.classList.add('wrong');
      selectedIdx = null;
      if (hearts <= 0) {
        lockedOut = true;
        if (checkBtn) checkBtn.disabled = true;
        if (feedbackEl) {
          feedbackEl.textContent = '💔 Energija baigėsi! Atidžiai išnagrinėk eilutes iš naujo – matrica perkraunama...';
          feedbackEl.className = 'puzzle-feedback error';
          feedbackEl.classList.remove('hidden');
        }
        if (matrixResetTimer) clearTimeout(matrixResetTimer);
        matrixResetTimer = setTimeout(() => {
          matrixResetTimer = null;
          loadActiveLevel();
        }, 1250);
      } else if (feedbackEl) {
        feedbackEl.textContent = '❌ Ne visai! Liko 1 širdelė – dar kartą patikrink eilutes ir stulpelius.';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    }
  };
}

// ==================== 7. ALGORITMŲ TRASA RENDERIS IR VALDYMAS ====================
function startAlgoLevel(level, totalInMode) {
  const nextBtn = document.getElementById('btn-algo-next');
  const loopBtn = document.getElementById('btn-algo-loop');
  const actBtn = document.getElementById('btn-algo-act');
  const fwdBtn = document.getElementById('btn-algo-fwd');
  const leftBtn = document.getElementById('btn-algo-left');
  const rightBtn = document.getElementById('btn-algo-right');
  const upBtn = document.getElementById('btn-algo-up');
  const downBtn = document.getElementById('btn-algo-down');
  const leftDirBtn = document.getElementById('btn-algo-left-dir');
  const rightDirBtn = document.getElementById('btn-algo-right-dir');
  const queueTitleEl = document.getElementById('algo-queue-title');

  const isAbs = level.controlMode === 'absolute';
  if (upBtn) upBtn.classList.toggle('hidden', !isAbs);
  if (downBtn) downBtn.classList.toggle('hidden', !isAbs);
  if (leftDirBtn) leftDirBtn.classList.toggle('hidden', !isAbs);
  if (rightDirBtn) rightDirBtn.classList.toggle('hidden', !isAbs);

  if (fwdBtn) fwdBtn.classList.toggle('hidden', isAbs);
  if (leftBtn) leftBtn.classList.toggle('hidden', isAbs);
  if (rightBtn) rightBtn.classList.toggle('hidden', isAbs);
  if (actBtn) actBtn.classList.toggle('hidden', isAbs || level.allowAct === false);
  if (loopBtn) loopBtn.classList.toggle('hidden', isAbs || !level.allowLoop);

  if (queueTitleEl) {
    queueTitleEl.textContent = isAbs
      ? 'PROGRAMOS EILĖ (spausk ×1..×4 ant blokelio, kad padaugintum žingsnius, arba × kad ištrintum):'
      : 'PROGRAMOS EILĖ (spausk ant blokelio, kad pašalintum):';
  }

  algoEngine = new AlgoEngine(algoCanvas, level, {
    onQueueChange: () => {
      renderAlgoQueue();
    },
    onRunStateChange: (isRunning) => {
      syncAlgoButtonsState(isRunning);
    },
    onStepExecuted: (kind) => {
      if (kind === 'key') {
        playBalanceBell();
      } else if (kind === 'jump' || kind === 'switch') {
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
  const locked = isRunning || Boolean(algoEngine?.won || algoEngine?.isWinning || algoEngine?.inputLocked);
  const runBtn = document.getElementById('btn-algo-run');
  const undoBtn = document.getElementById('btn-algo-undo');
  const resetBtn = document.getElementById('btn-algo-reset');
  document.querySelectorAll('.algo-cmd-btn').forEach((btn) => {
    btn.disabled = locked;
  });
  if (runBtn) {
    runBtn.disabled = locked;
    runBtn.textContent = isRunning ? '⏳ Vykdoma programa...' : '▶️ Paleisti programą';
  }
  if (undoBtn) undoBtn.disabled = locked;
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
      if (level.controlMode === 'absolute') {
        const card = document.createElement('div');
        card.className = `algo-abs-card${isSlotExecuting ? ' executing' : ''}`;

        const stepBtn = document.createElement('button');
        stepBtn.type = 'button';
        stepBtn.className = 'algo-abs-step-btn';
        stepBtn.title = 'Spausk, kad pasirinktum žingsnių skaičių (×1, ×2, ×3, ×4)';
        stepBtn.innerHTML = `<span>${meta.short}</span><span class="algo-abs-mult">×${slot.count || 1}</span>`;
        stepBtn.addEventListener('click', () => {
          if (algoEngine?.running || algoEngine?.won) return;
          playTrackClick();
          recordPlayerMove();
          algoEngine.cycleStepCount(i);
        });
        card.appendChild(stepBtn);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'algo-loop-del';
        delBtn.textContent = '×';
        delBtn.title = 'Pašalinti blokelį';
        delBtn.addEventListener('click', () => {
          if (algoEngine?.running || algoEngine?.won) return;
          playTrackClick();
          algoEngine.removeSlot(i);
        });
        card.appendChild(delBtn);

        slotsEl.appendChild(card);
      } else {
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
      }
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

// ==================== 9. GRAVITACIJOS LABIRINTAS RENDERIS IR VALDYMAS ====================
function startGravityLevel(level, totalInMode) {
  const counterEl = document.getElementById('gravity-counter');
  const nextBtn = document.getElementById('btn-gravity-next');

  const syncCounter = () => {
    if (!gravityEngine || !counterEl) return;
    const collected = gravityEngine.totalStars - gravityEngine.starsRemaining.size;
    const masterStr =
      level.masterMoves != null ? ` • 🏆 Meistro tikslas: ≤ ${level.masterMoves}` : '';
    counterEl.textContent = `⭐ Žvaigždutės: ${collected} / ${gravityEngine.totalStars} • Slydimai: ${gravityEngine.moves}${masterStr}`;
  };

  gravityEngine = new GravityMazeEngine(gravityCanvas, level, {
    onMove: () => {
      playGravitySlide();
      recordPlayerMove();
      const feedbackEl = document.getElementById('puzzle-feedback');
      feedbackEl.className = 'puzzle-feedback hidden';
      feedbackEl.textContent = '';
    },
    onWallHit: () => {
      playTrackClick();
    },
    onIceBreak: () => {
      playIceBreak();
    },
    onStickyStop: () => {
      playTrackClick();
    },
    onSwitchOpen: () => {
      playBalanceBell();
      syncCounter();
    },
    onPortal: () => {
      playPortalWarp();
    },
    onStarCollect: () => {
      playBalanceBell();
      syncCounter();
    },
    onAbyss: () => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      feedbackEl.textContent = '🌌 Rutulys išskriejo į kosmoso prarają! Pradedame iš naujo.';
      feedbackEl.className = 'puzzle-feedback error';
      feedbackEl.classList.remove('hidden');
      currentMoves = 0;
      updateMovesUI();
    },
    onMissingStars: (left) => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      feedbackEl.textContent = `⭐ Prieš baigdamas dar surink likusias žvaigždutes (${left})!`;
      feedbackEl.className = 'puzzle-feedback error';
      feedbackEl.classList.remove('hidden');
    },
    onStateChange: syncCounter,
    onWin: () => {
      currentMoves = gravityEngine.moves;
      updateMovesUI();
      syncCounter();
      markLevelSolved(level);
      if (nextBtn && activeLevelIndex < totalInMode - 1) {
        nextBtn.classList.remove('hidden');
      }
    }
  });
  syncCounter();
}

// ==================== 10. SKAIČIŲ KRYŽIAŽODŽIAI IR MAGIŠKIEJI TRIKAMPIAI ====================
function getMathCrossCanvasCoords(evt) {
  const rect = mathCrossCanvas.getBoundingClientRect();
  return {
    mx: ((evt.clientX - rect.left) / rect.width) * MATHCROSS_CANVAS_W,
    my: ((evt.clientY - rect.top) / rect.height) * MATHCROSS_CANVAS_H
  };
}

function renderMathCrossTray(level) {
  const trayEl = document.getElementById('mathcross-tray');
  if (!trayEl) return;
  trayEl.innerHTML = '';

  (level.cards || []).forEach((card) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mc-card-btn';
    btn.draggable = true;
    btn.dataset.cid = card.cid;
    btn.textContent = String(card.value);

    btn.addEventListener('click', () => {
      if (!mathCrossEngine) return;
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.className = 'puzzle-feedback hidden';
        feedbackEl.textContent = '';
      }
      mathCrossEngine.selectCard(card.cid);
    });

    btn.addEventListener('dragstart', (e) => {
      if (btn.disabled) {
        e.preventDefault();
        return;
      }
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', card.cid);
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    trayEl.appendChild(btn);
  });
}

function startMathCrossLevel(level, totalInMode) {
  const counterEl = document.getElementById('mathcross-counter');
  const nextBtn = document.getElementById('btn-mathcross-next');
  const checkBtn = document.getElementById('btn-mathcross-check');

  renderMathCrossTray(level);

  mathCrossEngine = new MathCrossEngine(mathCrossCanvas, level, {
    onMove: (action) => {
      playBalancePop(action === 'remove');
      recordPlayerMove();
    },
    onStateChange: ({ filledCount, totalSlots, usedCardIds, selectedCardCid, won }) => {
      if (counterEl) {
        counterEl.textContent = won
          ? `🟢 Teisingai! (${totalSlots} / ${totalSlots})`
          : `🔢 Užpildyta: ${filledCount} / ${totalSlots}`;
      }
      if (checkBtn) {
        checkBtn.disabled = !!won;
      }
      const usedSet = new Set(usedCardIds || []);
      document.querySelectorAll('.mc-card-btn').forEach((btn) => {
        const cid = btn.dataset.cid;
        const isUsed = usedSet.has(cid);
        btn.classList.toggle('is-used', isUsed);
        btn.classList.toggle('is-selected', !isUsed && selectedCardCid === cid);
        btn.disabled = isUsed || !!won;
      });
    },
    onCheckResult: ({ ok }) => {
      recordPlayerMove();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (ok) {
        playBalanceBell();
        if (feedbackEl) {
          feedbackEl.className = 'puzzle-feedback hidden';
          feedbackEl.textContent = '';
        }
      } else {
        playWrongBuzz();
        if (feedbackEl) {
          feedbackEl.textContent =
            level.kind === 'crossword'
              ? '❌ Kai kurios lygtys dar nesutampa! Spausk ant skaičiaus langelyje, kad išimtum ir pakeistum.'
              : `❌ Raudonai pažymėtos kraštinės/eilutės suma dar nėra ${level.magicSum}! Pakeisk skaičius.`;
          feedbackEl.className = 'puzzle-feedback error';
          feedbackEl.classList.remove('hidden');
        }
      }
    },
    onWin: () => {
      markLevelSolved(level);
      if (nextBtn && activeLevelIndex < totalInMode - 1) {
        nextBtn.classList.remove('hidden');
      }
    }
  });
}

// ==================== 11. ENERGIJOS TILTAI (HASHI / BRIDGES) ====================
function getBridgesCanvasCoords(evt) {
  const rect = bridgesCanvas.getBoundingClientRect();
  return {
    mx: ((evt.clientX - rect.left) / rect.width) * BRIDGES_CANVAS_W,
    my: ((evt.clientY - rect.top) / rect.height) * BRIDGES_CANVAS_H
  };
}

function startBridgesLevel(level, totalInMode) {
  const counterEl = document.getElementById('bridges-counter');
  const nextBtn = document.getElementById('btn-bridges-next');

  bridgesEngine = new BridgesEngine(bridgesCanvas, level, {
    onBridgeToggle: (newCount) => {
      playBalancePop(newCount === 0);
      recordPlayerMove();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.className = 'puzzle-feedback hidden';
        feedbackEl.textContent = '';
      }
    },
    onCrossBlocked: () => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.textContent = '⚠️ Tiltai negali kirsti vienas kito!';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    },
    onDisconnected: () => {
      playWrongBuzz();
      const feedbackEl = document.getElementById('puzzle-feedback');
      if (feedbackEl) {
        feedbackEl.textContent =
          '⚠️ Visos salos turi savo skaičių, bet liko atskirtų salų grupių! Sujunk visas salas į vieną tinklą.';
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    },
    onStateChange: ({ satisfiedCount, totalIslands, bridgeTotal, won }) => {
      if (counterEl) {
        counterEl.textContent = won
          ? `🟢 Tinklas sujungtas! (${totalIslands} / ${totalIslands})`
          : `🌉 Salos: ${satisfiedCount} / ${totalIslands} • Tiltai: ${bridgeTotal}`;
      }
    },
    onWin: () => {
      playBalanceBell();
      markLevelSolved(level);
      if (nextBtn && activeLevelIndex < totalInMode - 1) {
        nextBtn.classList.remove('hidden');
      }
    }
  });
}

// ==================== ROBO-STUMDUKAS RENDERIS IR VALDYMAS ====================
const GATE_ICON = {
  '>': '➡️',
  '<': '⬅️',
  '^': '⬆️',
  'v': '⬇️'
};

function startSokobanLevel(level, totalInMode) {
  if (sokobanWinTimer) {
    clearTimeout(sokobanWinTimer);
    sokobanWinTimer = null;
  }
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
    playBalanceBell();
    if (sokobanWinTimer) clearTimeout(sokobanWinTimer);
    const solvedDef = currentSokobanDef;
    sokobanWinTimer = setTimeout(() => {
      sokobanWinTimer = null;
      if (!sokobanGame || !sokobanGame.won || currentSokobanDef !== solvedDef) return;
      markLevelSolved(solvedDef);
      const nextBtn = document.getElementById('btn-sok-next');
      if (nextBtn && activeLevelIndex < currentSokobanTotal - 1) {
        nextBtn.classList.remove('hidden');
      }
    }, 2000);
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
    undoBtn.disabled = sokobanGame.won || sokobanGame.history.length === 0;
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
        if (isExit) {
          cell.classList.add(gateOpen ? 'exit-open' : 'exit-locked');
          if (sokobanGame.won) cell.classList.add('exit-won');
        }

        if (isRobot) {
          if (sokobanGame.won) {
            cell.innerHTML = '<span class="sok-robot-jump">🤖</span>';
          } else {
            cell.textContent = '🤖';
          }
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

// ==================== 12. KOLBŲ IR SKYSČIŲ LABORATORIJA ====================
function renderFlaskLabStage(stage, level, totalInMode) {
  destroyMiniFlaskEngine();
  stage.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'flask-lab-wrap';

  const topBar = document.createElement('div');
  topBar.className = 'flask-controls-bar';

  const counterEl = document.createElement('div');
  counterEl.id = 'flask-counter';
  counterEl.className = 'pinpull-counter';

  const actions = document.createElement('div');
  actions.className = 'flask-actions-group';

  const launchBtn = level.kind === 'pipes' ? document.createElement('button') : null;
  if (launchBtn) {
    launchBtn.id = 'btn-flask-launch';
    launchBtn.type = 'button';
    launchBtn.className = 'flask-launch-btn';
    launchBtn.textContent = '🧪 Paleisti srautą!';
    actions.appendChild(launchBtn);
  }

  const resetBtn = document.createElement('button');
  resetBtn.id = 'btn-flask-reset';
  resetBtn.type = 'button';
  resetBtn.className = 'pin-reset-btn';
  resetBtn.textContent = '🔄 Iš naujo';
  actions.appendChild(resetBtn);

  const nextBtn = document.createElement('button');
  nextBtn.id = 'btn-flask-next';
  nextBtn.type = 'button';
  nextBtn.className = 'pin-next-btn hidden';
  nextBtn.textContent = 'Kitas lygis ▶';
  nextBtn.addEventListener('click', () => {
    const levels = getCurrentModeLevels();
    if (activeLevelIndex < levels.length - 1) {
      activeLevelIndex++;
      renderLevelsStrip();
      loadActiveLevel();
    }
  });
  actions.appendChild(nextBtn);

  topBar.appendChild(counterEl);
  topBar.appendChild(actions);
  wrap.appendChild(topBar);

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'pinpull-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.id = 'flask-canvas';
  canvas.className = 'pinpull-canvas';
  canvas.width = FLASK_CANVAS_W;
  canvas.height = FLASK_CANVAS_H;
  canvas.setAttribute('aria-label', 'Kolbų laboratorijos lenta');
  canvasWrap.appendChild(canvas);
  wrap.appendChild(canvasWrap);

  const feedbackEl = document.getElementById('puzzle-feedback');

  if (level.kind === 'pipes') {
    const tgtSpec = RYB_COLORS[level.targetColor];
    const updatePipeHud = () => {
      counterEl.textContent = `🎯 Tikslas: ${tgtSpec.dot} ${tgtSpec.label}`;
      if (launchBtn) launchBtn.disabled = Boolean(pipeValveEngine?.flowing || pipeValveEngine?.won);
    };

    pipeValveEngine = new PipeValveEngine(canvas, level, {
      onValveClick: () => {
        playTrackClick();
        recordPlayerMove();
        feedbackEl.className = 'puzzle-feedback hidden';
        feedbackEl.textContent = '';
      },
      onLaunchSound: () => {
        playLaserHum();
        recordPlayerMove();
      },
      onStateChange: updatePipeHud,
      onWin: () => {
        updatePipeHud();
        markLevelSolved(level);
        if (activeLevelIndex < totalInMode - 1) nextBtn.classList.remove('hidden');
      },
      onFail: (res) => {
        playWrongBuzz();
        updatePipeHud();
        if (res?.toxicHit) {
          feedbackEl.textContent = '☠️ ATSARGIAI! Skystis pateko į nuodingų dujų kamerą — pasuk sklendes ir mėgink dar kartą!';
        } else {
          const gotSpec = RYB_COLORS[res?.resultColor || 'EMPTY'];
          feedbackEl.textContent =
            res?.resultColor === 'EMPTY'
              ? '🧪 Skystis nepasiekė tikslo kolbos — patikrink uždarytas sklendes!'
              : `🧪 Kolboje gavosi ${gotSpec.dot} ${gotSpec.label}, o reikia ${tgtSpec.dot} ${tgtSpec.label}!`;
        }
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      }
    });

    launchBtn?.addEventListener('click', () => {
      feedbackEl.className = 'puzzle-feedback hidden';
      feedbackEl.textContent = '';
      pipeValveEngine?.triggerTest();
    });

    resetBtn.addEventListener('click', () => {
      resetAttemptState();
      feedbackEl.className = 'puzzle-feedback hidden';
      feedbackEl.textContent = '';
      nextBtn.classList.add('hidden');
      pipeValveEngine?.reset();
    });

    updatePipeHud();
  } else {
    const quickBar = document.createElement('div');
    quickBar.className = 'jug-quick-bar';
    wrap.appendChild(quickBar);

    const updateJugHud = () => {
      if (!jugPourEngine) return;
      counterEl.textContent = `🔄 Ėjimai: ${jugPourEngine.moves} • 🏆 Meistras: ≤ ${level.masterMoves}`;
      quickBar.innerHTML = '';
      level.capacities.forEach((cap, idx) => {
        const card = document.createElement('div');
        card.className = 'jug-card-ctrl';
        const curL = jugPourEngine.amounts[idx];
        const label = document.createElement('span');
        label.textContent = `#${idx + 1}: ${curL}/${cap} L`;
        card.appendChild(label);

        if (level.hasTap) {
          const fillBtn = document.createElement('button');
          fillBtn.type = 'button';
          fillBtn.className = 'jug-mini-btn fill';
          fillBtn.textContent = '🚰 Pripilti';
          fillBtn.disabled = jugPourEngine.won || curL >= cap;
          fillBtn.addEventListener('click', () => jugPourEngine?.fillJug(idx));

          const emptyBtn = document.createElement('button');
          emptyBtn.type = 'button';
          emptyBtn.className = 'jug-mini-btn empty';
          emptyBtn.textContent = '💧 Išpilti';
          emptyBtn.disabled = jugPourEngine.won || curL <= 0;
          emptyBtn.addEventListener('click', () => jugPourEngine?.emptyJug(idx));

          card.appendChild(fillBtn);
          card.appendChild(emptyBtn);
        }
        quickBar.appendChild(card);
      });
    };

    jugPourEngine = new JugPourEngine(canvas, level, {
      onSelectSound: () => playBalancePop(),
      onPourSound: () => {
        playBallClink();
        recordPlayerMove();
        feedbackEl.className = 'puzzle-feedback hidden';
        feedbackEl.textContent = '';
      },
      onFeedback: (msg) => {
        playWrongBuzz();
        feedbackEl.textContent = msg;
        feedbackEl.className = 'puzzle-feedback error';
        feedbackEl.classList.remove('hidden');
      },
      onStateChange: updateJugHud,
      onWin: () => {
        updateJugHud();
        markLevelSolved(level);
        if (activeLevelIndex < totalInMode - 1) nextBtn.classList.remove('hidden');
      }
    });

    resetBtn.addEventListener('click', () => {
      resetAttemptState();
      feedbackEl.className = 'puzzle-feedback hidden';
      feedbackEl.textContent = '';
      nextBtn.classList.add('hidden');
      jugPourEngine?.reset();
    });

    updateJugHud();
  }

  stage.appendChild(wrap);
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
document.getElementById('tab-mode-gravity')?.addEventListener('click', () => switchLabMode('gravity'));
document.getElementById('tab-mode-mathcross')?.addEventListener('click', () => switchLabMode('mathcross'));
document.getElementById('tab-mode-bridges')?.addEventListener('click', () => switchLabMode('bridges'));
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
  if (sokobanWinTimer) {
    clearTimeout(sokobanWinTimer);
    sokobanWinTimer = null;
  }
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
  if (!currentDifficulty || !['sokoban', 'gravity'].includes(currentMode)) return false;
  if (currentMode === 'sokoban' && (!sokobanGame || sokobanGame.won)) return false;
  if (currentMode === 'gravity' && (!gravityEngine || gravityEngine.won || gravityEngine.sliding)) return false;
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

    if (currentMode === 'gravity') {
      if (absX > absY) {
        gravityEngine.slide(dx > 0 ? 'R' : 'L');
      } else {
        gravityEngine.slide(dy > 0 ? 'D' : 'U');
      }
      return;
    }

    if (absX > absY) {
      handleSokobanMove(0, dx > 0 ? 1 : -1);
    } else {
      handleSokobanMove(dy > 0 ? 1 : -1, 0);
    }
  },
  { passive: true }
);

// Užtikriname, kad braukimas pirštu neslinktų ekrano „Robo-Stumduko“ ir „Gravitacijos“ metu
[sokobanStage, gravityStage].forEach((stageEl) => {
  stageEl?.addEventListener(
    'touchmove',
    (e) => {
      if (currentDifficulty && (currentMode === 'sokoban' || currentMode === 'gravity')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
});

window.addEventListener('keydown', (e) => {
  if (!currentDifficulty) return;
  const k = e.key.toLowerCase();
  const keyMap = {
    arrowup: ['U', -1, 0],
    w: ['U', -1, 0],
    arrowdown: ['D', 1, 0],
    s: ['D', 1, 0],
    arrowleft: ['L', 0, -1],
    a: ['L', 0, -1],
    arrowright: ['R', 0, 1],
    d: ['R', 0, 1]
  };
  const entry = keyMap[k];
  if (!entry) return;

  if (currentMode === 'sokoban' && sokobanGame) {
    e.preventDefault();
    handleSokobanMove(entry[1], entry[2]);
  } else if (currentMode === 'gravity' && gravityEngine) {
    e.preventDefault();
    gravityEngine.slide(entry[0]);
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
  if (laserResetTimer) {
    clearTimeout(laserResetTimer);
    laserResetTimer = null;
  }
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
  if (circuitResetTimer) {
    clearTimeout(circuitResetTimer);
    circuitResetTimer = null;
  }
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

document.getElementById('btn-balance-check')?.addEventListener('click', () => {
  if (!balanceEngine) return;
  const res = balanceEngine.checkBalance();
  if (res?.empty) {
    const feedbackEl = document.getElementById('puzzle-feedback');
    if (feedbackEl) {
      feedbackEl.textContent = '⚠️ Pirmiausia uždėk bent vieną svarstį ant dešinės lėkštės!';
      feedbackEl.className = 'puzzle-feedback error';
      feedbackEl.classList.remove('hidden');
    }
  }
});

document.getElementById('btn-balance-reset')?.addEventListener('click', () => {
  if (!balanceEngine) return;
  if (balanceResetTimer) {
    clearTimeout(balanceResetTimer);
    balanceResetTimer = null;
  }
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

document.getElementById('btn-matrix-check')?.addEventListener('click', () => {
  if (typeof onMatrixCheckClick === 'function') {
    onMatrixCheckClick();
  }
});

document.getElementById('btn-matrix-reset')?.addEventListener('click', () => {
  if (matrixResetTimer) {
    clearTimeout(matrixResetTimer);
    matrixResetTimer = null;
  }
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
  ['btn-algo-up', 'UP'],
  ['btn-algo-down', 'DOWN'],
  ['btn-algo-left-dir', 'LEFT_DIR'],
  ['btn-algo-right-dir', 'RIGHT_DIR'],
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

// 9. Gravitacijos labirinto mygtukai
document.querySelectorAll('.grav-dpad-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!gravityEngine || gravityEngine.won || gravityEngine.sliding) return;
    const dir = btn.dataset.gravDir;
    if (dir) gravityEngine.slide(dir);
  });
});

document.getElementById('btn-gravity-reset')?.addEventListener('click', () => {
  if (!gravityEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-gravity-next')?.classList.add('hidden');
  gravityEngine.reset();
  resetAttemptState();
});

document.getElementById('btn-gravity-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

// 10. Skaičių kryžiažodžių ir magiškųjų trikampių įvykiai
document.getElementById('btn-mathcross-check')?.addEventListener('click', () => {
  if (!mathCrossEngine) return;
  const res = mathCrossEngine.checkSolution();
  if (res?.incomplete) {
    playWrongBuzz();
    const feedbackEl = document.getElementById('puzzle-feedback');
    if (feedbackEl) {
      feedbackEl.textContent = `⚠️ Užpildyk visus tuščius langelius! Liko tuščių: ${res.emptyCount}.`;
      feedbackEl.className = 'puzzle-feedback error';
      feedbackEl.classList.remove('hidden');
    }
  }
});

document.getElementById('btn-mathcross-reset')?.addEventListener('click', () => {
  if (!mathCrossEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-mathcross-next')?.classList.add('hidden');
  mathCrossEngine.reset();
  resetAttemptState();
});

document.getElementById('btn-mathcross-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

if (mathCrossCanvas) {
  mathCrossCanvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!mathCrossEngine) return;
      e.preventDefault();
      const { mx, my } = getMathCrossCanvasCoords(e);
      mathCrossEngine.handlePointerDown(mx, my);
    },
    { passive: false }
  );

  mathCrossCanvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  });

  mathCrossCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!mathCrossEngine) return;
    const cid = e.dataTransfer?.getData('text/plain');
    if (!cid) return;
    const { mx, my } = getMathCrossCanvasCoords(e);
    mathCrossEngine.handleDropCard(cid, mx, my);
  });
}

// 11. Energijos tiltų (Hashi) įvykiai
document.getElementById('btn-bridges-reset')?.addEventListener('click', () => {
  if (!bridgesEngine) return;
  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'puzzle-feedback hidden';
  feedbackEl.textContent = '';
  document.getElementById('btn-bridges-next')?.classList.add('hidden');
  bridgesEngine.reset();
  resetAttemptState();
});

document.getElementById('btn-bridges-next')?.addEventListener('click', () => {
  const levels = getCurrentModeLevels();
  if (activeLevelIndex < levels.length - 1) {
    activeLevelIndex++;
    renderLevelsStrip();
    loadActiveLevel();
  }
});

if (bridgesCanvas) {
  bridgesCanvas.addEventListener(
    'pointerdown',
    (e) => {
      if (!bridgesEngine) return;
      e.preventDefault();
      const { mx, my } = getBridgesCanvasCoords(e);
      bridgesEngine.handlePointerDown(mx, my);
    },
    { passive: false }
  );

  bridgesCanvas.addEventListener('pointerup', (e) => {
    if (!bridgesEngine) return;
    const { mx, my } = getBridgesCanvasCoords(e);
    bridgesEngine.handlePointerUp(mx, my);
  });
}

btnSoundToggle?.addEventListener('click', () => {
  toggleSound();
  syncSoundToggleUI();
});

const MODE_SEQUENCE = ['pinpull', 'sokoban', 'laser', 'circuit', 'balance', 'matrix', 'algo', 'gears', 'gravity', 'mathcross', 'bridges', 'mini'];

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

// ==================== IŠRADIMŲ LENTYNOS VALDYMAS ====================
const inventionsModal = document.getElementById('inventions-modal');
const inventionsGrid = document.getElementById('inventions-shelf-grid');
const inventionInspector = document.getElementById('invention-inspector');
const inventionsBadgeEl = document.getElementById('inventions-count-badge');
const inventionsSummaryPill = document.getElementById('inventions-summary-pill');
let activeInventionsFilter = 'combined';

function playInventionSignatureSound(kind) {
  if (kind === 'pin') playPinPull();
  else if (kind === 'cube') playCubePush();
  else if (kind === 'laser') playLaserHum();
  else if (kind === 'train') playTrainLaunch();
  else if (kind === 'bell') playBalanceBell();
  else if (kind === 'memory') playMemoryTone(2);
  else if (kind === 'jump') playAlgoJump();
  else if (kind === 'gear') playGearPlace();
  else if (kind === 'slide') playGravitySlide();
  else if (kind === 'portal') playPortalWarp();
  else if (kind === 'victory') playVictoryFanfare();
  else playHintChime();
}

function renderInventionsBadge() {
  if (!inventionsBadgeEl) return;
  const state = computeInventionsState(progress, getLevelsForMode, 'combined');
  inventionsBadgeEl.textContent = `${state.unlockedCount} / ${state.totalCount}`;
}

function renderInventionsShelfModal() {
  if (!inventionsGrid) return;
  const state = computeInventionsState(progress, getLevelsForMode, activeInventionsFilter);

  if (inventionsSummaryPill) {
    inventionsSummaryPill.textContent = `🥈 ${state.silverUnlocked}/12 • 🥇 ${state.goldUnlocked}/12`;
  }

  document.querySelectorAll('.inv-filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.invFilter === activeInventionsFilter);
  });

  inventionsGrid.innerHTML = '';

  const createTierCard = (zone, tierKey, unlocked, tierData, reqLevels) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `invention-card ${tierKey} ${unlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="inv-card-top">
        <span class="inv-tier-tag">${tierKey === 'gold' ? '🥇 AUKSAS' : '🥈 SIDABRAS'}</span>
        <span class="inv-zone-tag">${zone.zoneIcon} ${zone.solvedCount}/${reqLevels}</span>
      </div>
      <div class="inv-card-icon" aria-hidden="true">${unlocked ? tierData.icon : '🔒'}</div>
      <div class="inv-card-name">${unlocked ? tierData.name : 'Užrakintas išradimas'}</div>
    `;

    card.addEventListener('click', () => {
      if (!unlocked) {
        playWrongBuzz();
        if (inventionInspector) {
          inventionInspector.innerHTML = `
            <span class="inv-insp-icon" aria-hidden="true">🔒</span>
            <div>
              <strong>${zone.zoneName} – ${tierKey === 'gold' ? 'Auksinis' : 'Sidabrinis'} išradimas užrakintas</strong>
              <p>Išspręsk bent <strong>${reqLevels}</strong> lygius šioje zonoje (dabar išspręsta: ${zone.solvedCount}/${zone.totalLevels}), kad atrakintum „${tierData.name}“!</p>
            </div>
          `;
        }
        return;
      }

      playInventionSignatureSound(tierData.sound);
      card.classList.remove('is-activated');
      void card.offsetWidth;
      card.classList.add('is-activated');

      if (inventionInspector) {
        inventionInspector.innerHTML = `
          <span class="inv-insp-icon inv-insp-bounce" aria-hidden="true">${tierData.icon}</span>
          <div>
            <strong>${tierData.name} (${tierKey === 'gold' ? '🥇 Auksinis' : '🥈 Sidabrinis'})</strong>
            <p>${tierData.desc}</p>
          </div>
        `;
      }
    });

    return card;
  };

  state.zones.forEach((zone) => {
    const row = document.createElement('section');
    row.className = 'invention-zone-row';
    row.innerHTML = `
      <div class="inv-zone-header">
        <span>${zone.zoneIcon} <strong>${zone.zoneName}</strong></span>
        <span class="inv-zone-progress">Įveikta: ${zone.solvedCount} / ${zone.totalLevels}</span>
      </div>
      <div class="inv-zone-pair"></div>
    `;
    const pairEl = row.querySelector('.inv-zone-pair');
    pairEl.appendChild(createTierCard(zone, 'silver', zone.hasSilver, zone.silver, 5));
    pairEl.appendChild(createTierCard(zone, 'gold', zone.hasGold, zone.gold, 10));
    inventionsGrid.appendChild(row);
  });
}

function openInventionsModal() {
  if (!inventionsModal) return;
  playHintChime();
  renderInventionsShelfModal();
  inventionsModal.classList.remove('hidden');
}

function closeInventionsModal() {
  inventionsModal?.classList.add('hidden');
}

document.getElementById('btn-open-inventions')?.addEventListener('click', openInventionsModal);
document.getElementById('btn-close-inventions')?.addEventListener('click', closeInventionsModal);
inventionsModal?.addEventListener('click', (e) => {
  if (e.target === inventionsModal) closeInventionsModal();
});
document.querySelectorAll('.inv-filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    activeInventionsFilter = btn.dataset.invFilter || 'combined';
    playMirrorClick();
    renderInventionsShelfModal();
  });
});

syncSoundToggleUI();
updateSummaryUI();
