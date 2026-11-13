// ==================== 7. ALGORITMŲ TRASA (PROGRAMAVIMO BLOKELIAI / LIGHTBOT STILIUS) ====================
export const ALGO_CANVAS_W = 540;
export const ALGO_CANVAS_H = 440;

const DIRS = [
  { key: 'U', dr: -1, dc: 0, dx: 0, dy: -1 },
  { key: 'R', dr: 0, dc: 1, dx: 1, dy: 0 },
  { key: 'D', dr: 1, dc: 0, dx: 0, dy: 1 },
  { key: 'L', dr: 0, dc: -1, dx: -1, dy: 0 }
];

const DIR_INDEX = { U: 0, R: 1, D: 2, L: 3 };

const ABS_CMD_DIR = {
  UP: 'U',
  DOWN: 'D',
  LEFT_DIR: 'L',
  RIGHT_DIR: 'R'
};

export const CMD_META = {
  FWD: { label: 'Pirmyn', icon: '⬆️', short: '⬆️', cls: 'cmd-fwd' },
  LEFT: { label: 'Kairėn', icon: '↰', short: '↰', cls: 'cmd-left' },
  RIGHT: { label: 'Dešinėn', icon: '↱', short: '↱', cls: 'cmd-right' },
  ACT: { label: 'Aktyvuoti / Šuolis', icon: '⚡', short: '⚡', cls: 'cmd-act' },
  UP: { label: 'Aukštyn', icon: '⬆️', short: '⬆️', cls: 'cmd-dir-up' },
  DOWN: { label: 'Žemyn', icon: '⬇️', short: '⬇️', cls: 'cmd-dir-down' },
  LEFT_DIR: { label: 'Kairėn', icon: '⬅️', short: '⬅️', cls: 'cmd-dir-left' },
  RIGHT_DIR: { label: 'Dešinėn', icon: '➡️', short: '➡️', cls: 'cmd-dir-right' }
};

function makeGrid(size, fill = 0) {
  return Array.from({ length: size }, () => Array(size).fill(fill));
}

function withTiles(size, baseFill, specs) {
  const g = makeGrid(size, baseFill);
  for (const [r, c, val] of specs) {
    g[r][c] = val;
  }
  return g;
}

export const ALGO_LEVELS = {
  grade1: [
    {
      id: 'alg_g1_1',
      title: '1. Pirmieji žingsniai (×2, ×3)',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Sudėk kryptis! Paspausk ant pridėto blokelio eilėje, kad pasirinktum žingsnių skaičių (×1, ×2, ×3, ×4).',
      reward: 1,
      size: 5,
      maxSlots: 3,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 3, c: 0, dir: 'R' },
      finish: { r: 1, c: 3 },
      keys: [],
      switches: [],
      gates: [],
      bridges: [],
      grid: withTiles(5, 0, [
        [0, 0, '#'], [0, 1, '#'], [1, 0, '#'], [1, 1, '#'],
        [2, 1, '#'], [2, 2, '#'], [4, 3, '#'], [4, 4, '#']
      ])
    },
    {
      id: 'alg_g1_2',
      title: '2. Pirmasis raktas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Robotas automatiškai paima 🔑 raktą užvažiavęs ant jo! Paimk raktą ir keliauk pro atidarytas dureles į 🔋.',
      reward: 1,
      size: 5,
      maxSlots: 3,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 4, c: 1, dir: 'R' },
      finish: { r: 1, c: 3 },
      keys: [{ r: 4, c: 3 }],
      switches: [],
      gates: [{ r: 2, c: 3 }],
      bridges: [],
      grid: withTiles(5, 0, [
        [0, 2, '#'], [0, 3, '#'], [0, 4, '#'],
        [1, 2, '#'], [1, 4, '#'],
        [2, 0, '#'], [2, 1, '#'], [2, 2, '#'], [2, 4, '#']
      ])
    },
    {
      id: 'alg_g1_3',
      title: '3. Šliuzas už sienos',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Pirma pakilk į viršų paimti 🔑 rakto, tada keliauk per atsidariusias dureles link baterijos 🔋!',
      reward: 1,
      size: 5,
      maxSlots: 4,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 4, c: 0, dir: 'U' },
      finish: { r: 4, c: 3 },
      keys: [{ r: 1, c: 0 }],
      switches: [],
      gates: [{ r: 2, c: 3 }],
      bridges: [],
      grid: withTiles(5, 0, [
        [2, 1, '#'], [2, 2, '#'], [2, 4, '#'],
        [3, 1, '#'], [3, 2, '#'], [4, 2, '#'], [4, 4, '#']
      ])
    },
    {
      id: 'alg_g1_4',
      title: '4. Ilgas koridorius (×4)',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Išnaudok ×4 kartojimą! Paimk 🔑 dešiniajame kampe ir grįžk pro centrinius vartus prie 🔋.',
      reward: 2,
      size: 5,
      maxSlots: 4,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 0, c: 0, dir: 'R' },
      finish: { r: 4, c: 2 },
      keys: [{ r: 0, c: 4 }],
      switches: [],
      gates: [{ r: 2, c: 2 }],
      bridges: [],
      grid: withTiles(5, 0, [
        [1, 0, '#'], [1, 1, '#'], [1, 2, '#'], [1, 3, '#'],
        [2, 0, '#'], [2, 1, '#'],
        [3, 0, '#'], [3, 1, '#'], [3, 3, '#'], [3, 4, '#']
      ])
    },
    {
      id: 'alg_g1_5',
      title: '5. Slaptas požemis',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Turi tik 3 blokelius! Pakilk prie 🔑, tada ilgu šuoliu žemyn (×4) atidaryk dureles ir užbaik 🔋!',
      reward: 2,
      size: 5,
      maxSlots: 3,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 2, c: 2, dir: 'U' },
      finish: { r: 4, c: 4 },
      keys: [{ r: 0, c: 2 }],
      switches: [],
      gates: [{ r: 3, c: 2 }],
      bridges: [],
      grid: withTiles(5, 0, [
        [1, 1, '#'], [1, 3, '#'],
        [2, 0, '#'], [2, 1, '#'], [2, 3, '#'], [2, 4, '#'],
        [3, 1, '#'], [3, 3, '#']
      ])
    },
    {
      id: 'alg_g1_6',
      title: '6. Du raktai į stotį',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Durelės 🔒 atsidarys tik surinkus ABUDU raktus 🔑! Suplanuok kelią per 5 blokelius.',
      reward: 2,
      size: 6,
      maxSlots: 5,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 5, c: 0, dir: 'U' },
      finish: { r: 5, c: 5 },
      keys: [{ r: 2, c: 0 }, { r: 2, c: 4 }],
      switches: [],
      gates: [{ r: 4, c: 4 }],
      bridges: [],
      grid: withTiles(6, 0, [
        [3, 1, '#'], [3, 2, '#'], [3, 3, '#'],
        [4, 1, '#'], [4, 2, '#'], [4, 3, '#'], [4, 5, '#'],
        [5, 1, '#'], [0, 5, '#'], [1, 5, '#']
      ])
    },
    {
      id: 'alg_g1_7',
      title: '7. Sūkurys aplink sieną',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Apkeliauk visą kambarį ratu, surink 2 raktus 🔑 ir grįžk į vidinę salę prie baterijos!',
      reward: 2,
      size: 6,
      maxSlots: 5,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 0, c: 1, dir: 'R' },
      finish: { r: 2, c: 1 },
      keys: [{ r: 0, c: 4 }, { r: 4, c: 4 }],
      switches: [],
      gates: [{ r: 3, c: 1 }],
      bridges: [],
      grid: withTiles(6, 0, [
        [1, 0, '#'], [1, 1, '#'], [1, 2, '#'],
        [2, 2, '#'], [3, 2, '#'], [3, 0, '#'],
        [5, 0, '#'], [5, 5, '#'], [2, 5, '#']
      ])
    },
    {
      id: 'alg_g1_8',
      title: '8. Raktų zigzagas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Surink pirmą 🔑, kilk laipteliais iki antro 🔑 ir leiskis per šliuzą žemyn!',
      reward: 2,
      size: 6,
      maxSlots: 6,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 5, c: 0, dir: 'U' },
      finish: { r: 5, c: 4 },
      keys: [{ r: 3, c: 0 }, { r: 1, c: 5 }],
      switches: [],
      gates: [{ r: 3, c: 5 }],
      bridges: [],
      grid: withTiles(6, 0, [
        [2, 0, '#'], [2, 1, '#'], [2, 2, '#'],
        [3, 4, '#'], [4, 2, '#'], [4, 3, '#'], [4, 4, '#'],
        [0, 0, '#'], [0, 1, '#'], [5, 1, '#']
      ])
    },
    {
      id: 'alg_g1_9',
      title: '9. Trys kosminiai raktai',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Trys raktai 🔑 užrakino kelią į finišą! Sudėliok 5 kryptis su teisingais skaičiais (×2, ×3, ×4).',
      reward: 3,
      size: 6,
      maxSlots: 5,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 0, c: 5, dir: 'L' },
      finish: { r: 5, c: 1 },
      keys: [{ r: 0, c: 1 }, { r: 3, c: 1 }, { r: 3, c: 4 }],
      switches: [],
      gates: [{ r: 4, c: 4 }],
      bridges: [],
      grid: withTiles(6, 0, [
        [1, 2, '#'], [1, 3, '#'], [1, 4, '#'], [1, 5, '#'],
        [2, 2, '#'], [4, 0, '#'], [4, 1, '#'], [4, 2, '#'], [4, 3, '#'], [4, 5, '#']
      ])
    },
    {
      id: 'alg_g1_10',
      title: '10. Didysis 1 klasės robotų labirintas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Surink visus 3 raktus 🔑 aplink laboratoriją ir pro šliuzą 🔒 pasiek bateriją viršuje!',
      reward: 3,
      size: 6,
      maxSlots: 6,
      controlMode: 'absolute',
      allowLoop: false,
      allowAct: false,
      start: { r: 5, c: 2, dir: 'R' },
      finish: { r: 0, c: 4 },
      keys: [{ r: 5, c: 5 }, { r: 2, c: 5 }, { r: 2, c: 1 }],
      switches: [],
      gates: [{ r: 1, c: 2 }],
      bridges: [],
      grid: withTiles(6, 0, [
        [1, 0, '#'], [1, 1, '#'], [1, 3, '#'], [1, 4, '#'], [1, 5, '#'],
        [3, 1, '#'], [3, 2, '#'], [3, 3, '#'], [3, 4, '#'],
        [4, 2, '#'], [4, 3, '#'], [0, 0, '#']
      ])
    }
  ],
  grade3: [
    {
      id: 'alg_g3_1',
      title: '1. Kosminiai laiptai',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Langeliuose yra tik 4 vietos! Naudok ciklą 🔁 (2x/3x) ir šuolį ⚡ ant pakylų.',
      reward: 2,
      size: 7,
      maxSlots: 4,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 0, dir: 'R' },
      finish: { r: 1, c: 6 },
      keys: [],
      switches: [],
      gates: [],
      bridges: [],
      grid: withTiles(7, '#', [
        [5, 0, 0], [5, 1, 1], [5, 2, 1], [5, 3, 2], [5, 4, 2], [5, 5, 3], [5, 6, 3],
        [4, 6, 3], [3, 6, 3], [2, 6, 3], [1, 6, 3]
      ])
    },
    {
      id: 'alg_g3_2',
      title: '2. Jungiklių alėja',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Prieš pasiekdamas 🔋, uždek visus 3 jungiklius (⚡) ir užšok ant pakylų!',
      reward: 2,
      size: 7,
      maxSlots: 4,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 1, dir: 'U' },
      finish: { r: 2, c: 5 },
      keys: [],
      switches: [
        { r: 4, c: 1 },
        { r: 3, c: 1 },
        { r: 2, c: 1 }
      ],
      gates: [],
      bridges: [],
      grid: withTiles(7, '#', [
        [5, 1, 0], [4, 1, 0], [3, 1, 0], [2, 1, 0],
        [2, 2, 1], [2, 3, 1], [2, 4, 2], [2, 5, 2]
      ])
    },
    {
      id: 'alg_g3_3',
      title: '3. Kvadratinė orbita',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: '14 žingsnių kelias turi tilpti į 5 langelius – sujunk kelis 🔁 ciklus!',
      reward: 2,
      size: 7,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 2, dir: 'R' },
      finish: { r: 1, c: 2 },
      keys: [],
      switches: [],
      gates: [],
      bridges: [],
      grid: withTiles(7, '#', [
        [5, 2, 0], [5, 3, 0], [5, 4, 0], [5, 5, 0], [5, 6, 0],
        [4, 6, 1], [3, 6, 1], [2, 6, 2], [1, 6, 2],
        [1, 5, 2], [1, 4, 2], [1, 3, 2], [1, 2, 2]
      ])
    },
    {
      id: 'alg_g3_4',
      title: '4. Šviesoforo bokštai',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Įjunk 3 aukštai esančius ⚡ jungiklius, o tada drąsiai nušok žemyn link 🔋!',
      reward: 2,
      size: 7,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 1, c: 1, dir: 'R' },
      finish: { r: 5, c: 3 },
      keys: [],
      switches: [
        { r: 1, c: 2 },
        { r: 1, c: 3 },
        { r: 1, c: 4 }
      ],
      gates: [],
      bridges: [],
      grid: withTiles(7, '#', [
        [1, 1, 2], [1, 2, 2], [1, 3, 2], [1, 4, 2],
        [2, 4, 1], [3, 4, 1], [4, 4, 0], [5, 4, 0], [5, 3, 0]
      ])
    },
    {
      id: 'alg_g3_5',
      title: '5. Kosminė pakyla',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Tik 5 vietos 14 žingsnių programai: lipk aukštyn, įjunk ⚡ jungiklius ir nulipk prie 🔋!',
      reward: 2,
      size: 7,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 5, dir: 'L' },
      finish: { r: 3, c: 5 },
      keys: [],
      switches: [
        { r: 4, c: 1 },
        { r: 3, c: 1 }
      ],
      gates: [],
      bridges: [],
      grid: withTiles(7, '#', [
        [5, 5, 0], [5, 4, 1], [5, 3, 1], [5, 2, 2], [5, 1, 2],
        [4, 1, 2], [3, 1, 2],
        [3, 2, 3], [3, 3, 3], [3, 4, 2], [3, 5, 2]
      ])
    },
    {
      id: 'alg_g3_6',
      title: '6. Pirmasis energijos tiltas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Priekyje praraja su išjungtu 🌉 tiltu! Paspausk ⚡ ant jungiklio, kad tiltas išsitiestų.',
      reward: 2,
      size: 6,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 4, c: 1, dir: 'U' },
      finish: { r: 2, c: 4 },
      keys: [],
      switches: [{ r: 2, c: 1 }],
      gates: [],
      bridges: [
        { r: 2, c: 2, elev: 0 },
        { r: 2, c: 3, elev: 0 }
      ],
      grid: withTiles(6, '#', [
        [4, 1, 0], [3, 1, 0], [2, 1, 0],
        [2, 4, 0]
      ])
    },
    {
      id: 'alg_g3_7',
      title: '7. Pakylėtas tiltas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Ištiestas 🌉 tiltas bus +1 aukštesnis! Įjunk ⚡ jungiklį, pasisuk ir užšok (⚡) ant tilto.',
      reward: 2,
      size: 7,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 1, dir: 'R' },
      finish: { r: 2, c: 3 },
      keys: [],
      switches: [{ r: 5, c: 3 }],
      gates: [],
      bridges: [
        { r: 4, c: 3, elev: 1 },
        { r: 3, c: 3, elev: 1 }
      ],
      grid: withTiles(7, '#', [
        [5, 1, 0], [5, 2, 0], [5, 3, 0],
        [2, 3, 1]
      ])
    },
    {
      id: 'alg_g3_8',
      title: '8. Dvigubo jungiklio tiltas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Tiltas 🌉 pasirodys tik įjungus ABUDU ⚡ jungiklius! Pabaigoje užšok ant +1 pakylos prie 🔋.',
      reward: 3,
      size: 7,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 1, dir: 'U' },
      finish: { r: 3, c: 5 },
      keys: [],
      switches: [{ r: 4, c: 1 }, { r: 3, c: 1 }],
      gates: [],
      bridges: [
        { r: 3, c: 2, elev: 0 },
        { r: 3, c: 3, elev: 0 },
        { r: 3, c: 4, elev: 0 }
      ],
      grid: withTiles(7, '#', [
        [5, 1, 0], [4, 1, 0], [3, 1, 0],
        [3, 5, 1]
      ])
    },
    {
      id: 'alg_g3_9',
      title: '9. Šuoliai, vartai ir tiltas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Viena ⚡ komanda tiek šoka ant +1 pakylos, tiek įjungia jungiklį! Atverk 🔒 ir išskleisk 🌉.',
      reward: 3,
      size: 7,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 1, c: 1, dir: 'R' },
      finish: { r: 5, c: 5 },
      keys: [],
      switches: [{ r: 1, c: 3 }],
      gates: [{ r: 3, c: 5 }],
      bridges: [{ r: 4, c: 5, elev: 2 }],
      grid: withTiles(7, '#', [
        [1, 1, 0], [1, 2, 1], [1, 3, 2], [1, 4, 2], [1, 5, 2],
        [2, 5, 2], [3, 5, 2], [5, 5, 2]
      ])
    },
    {
      id: 'alg_g3_10',
      title: '10. Kosminės stoties finalas',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Tik 5 programos vietos! Užšok ir įjunk du ⚡ jungiklius, pervažiuok 🌉 tiltą bei 🔒 vartus ir nušok prie 🔋!',
      reward: 3,
      size: 7,
      maxSlots: 5,
      controlMode: 'relative',
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 1, dir: 'U' },
      finish: { r: 4, c: 5 },
      keys: [],
      switches: [{ r: 4, c: 1 }, { r: 3, c: 1 }],
      gates: [{ r: 3, c: 5 }],
      bridges: [
        { r: 3, c: 3, elev: 2 },
        { r: 3, c: 4, elev: 2 }
      ],
      grid: withTiles(7, '#', [
        [5, 1, 0], [4, 1, 1], [3, 1, 2],
        [3, 2, 2], [3, 5, 2], [4, 5, 0]
      ])
    }
  ]
};

export class AlgoEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.slots = [];
    this.activeLoopIndex = null;
    this.running = false;
    this.won = false;
    this.isWinning = false;
    this.victoryTimer = 0;
    this.inputLocked = false;
    this.winNotified = false;
    this.execPointer = null; // { slotIdx, subIdx }
    this.stepTimer = null;
    this.resetTimer = null;
    this.animFrame = null;
    this.crashTile = null;

    this.robot = {
      r: level.start.r,
      c: level.start.c,
      dir: level.start.dir
    };
    this.litSwitches = new Set();
    this.collectedKeys = new Set();

    this.pulsePhase = 0;
    this.startAnimLoop();
    this.render();
  }

  destroy() {
    this.stopExecutionTimers();
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  stopExecutionTimers() {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  resetRobotToStart() {
    this.robot = {
      r: this.level.start.r,
      c: this.level.start.c,
      dir: this.level.start.dir
    };
    this.litSwitches = new Set();
    this.collectedKeys = new Set();
    this.execPointer = null;
    this.crashTile = null;
    this.running = false;
    this.render();
  }

  clearProgram() {
    if (this.running || this.won) return;
    this.slots = [];
    this.activeLoopIndex = null;
    this.resetRobotToStart();
    this.callbacks.onQueueChange?.();
  }

  resetAll() {
    this.stopExecutionTimers();
    this.won = false;
    this.isWinning = false;
    this.victoryTimer = 0;
    this.inputLocked = false;
    this.winNotified = false;
    this.slots = [];
    this.activeLoopIndex = null;
    this.resetRobotToStart();
    this.callbacks.onQueueChange?.();
  }

  addCommand(cmd) {
    if (this.running || this.won) return false;
    if (!CMD_META[cmd]) return false;

    const isAbsMode = this.level.controlMode === 'absolute';

    if (!isAbsMode && this.activeLoopIndex !== null) {
      const loopSlot = this.slots[this.activeLoopIndex];
      if (loopSlot && loopSlot.type === 'loop' && loopSlot.body.length < 2) {
        loopSlot.body.push(cmd);
        if (loopSlot.body.length >= 2) {
          this.activeLoopIndex = null;
        }
        this.callbacks.onQueueChange?.();
        return true;
      }
      this.activeLoopIndex = null;
    }

    if (this.slots.length >= this.level.maxSlots) {
      this.callbacks.onError?.(
        isAbsMode
          ? 'Programos juosta pilna! Spausk ant blokelio eilėje, kad pakeistum ×1..×4 arba pašalintum.'
          : 'Programos juosta pilna! Pašalink blokelį arba naudok 🔁 ciklą.'
      );
      return false;
    }

    this.slots.push(isAbsMode ? { type: 'cmd', cmd, count: 1 } : { type: 'cmd', cmd });
    this.callbacks.onQueueChange?.();
    return true;
  }

  cycleStepCount(slotIdx) {
    if (this.running || this.won) return false;
    const s = this.slots[slotIdx];
    if (!s || s.type !== 'cmd' || this.level.controlMode !== 'absolute') return false;
    const cur = s.count || 1;
    s.count = cur >= 4 ? 1 : cur + 1;
    this.callbacks.onQueueChange?.();
    return true;
  }

  addLoopBlock() {
    if (this.running || this.won || !this.level.allowLoop) return false;
    if (this.slots.length >= this.level.maxSlots) {
      this.callbacks.onError?.('Programos juosta pilna! Pirmiausia atlaisvink vieną langelį.');
      return false;
    }
    this.slots.push({ type: 'loop', count: 2, body: [] });
    this.activeLoopIndex = this.slots.length - 1;
    this.callbacks.onQueueChange?.();
    return true;
  }

  toggleLoopCount(slotIdx) {
    if (this.running || this.won) return;
    const s = this.slots[slotIdx];
    if (!s || s.type !== 'loop') return;
    s.count = s.count === 2 ? 3 : 2;
    this.callbacks.onQueueChange?.();
  }

  focusOrRemoveLoopSub(slotIdx, subIdx) {
    if (this.running || this.won) return;
    const s = this.slots[slotIdx];
    if (!s || s.type !== 'loop') return;
    if (subIdx < s.body.length) {
      s.body.splice(subIdx, 1);
    }
    this.activeLoopIndex = slotIdx;
    this.callbacks.onQueueChange?.();
  }

  removeSlot(slotIdx) {
    if (this.running || this.won) return;
    if (slotIdx < 0 || slotIdx >= this.slots.length) return;
    this.slots.splice(slotIdx, 1);
    if (this.activeLoopIndex === slotIdx) {
      this.activeLoopIndex = null;
    } else if (this.activeLoopIndex !== null && this.activeLoopIndex > slotIdx) {
      this.activeLoopIndex -= 1;
    }
    this.callbacks.onQueueChange?.();
  }

  undoLast() {
    if (this.running || this.won || this.slots.length === 0) return false;
    const lastIdx = this.slots.length - 1;
    const last = this.slots[lastIdx];
    if (last.type === 'loop' && last.body.length > 0 && this.activeLoopIndex === lastIdx) {
      last.body.pop();
    } else {
      this.slots.pop();
      if (this.activeLoopIndex === lastIdx) this.activeLoopIndex = null;
    }
    this.callbacks.onQueueChange?.();
    return true;
  }

  buildExecutionSteps() {
    const steps = [];
    this.slots.forEach((slot, slotIdx) => {
      if (slot.type === 'cmd') {
        const reps = this.level.controlMode === 'absolute' ? Math.max(1, Math.min(4, slot.count || 1)) : 1;
        for (let r = 0; r < reps; r++) {
          steps.push({ cmd: slot.cmd, slotIdx, subIdx: -1 });
        }
      } else if (slot.type === 'loop') {
        const reps = slot.count === 3 ? 3 : 2;
        for (let r = 0; r < reps; r++) {
          slot.body.forEach((cmd, subIdx) => {
            steps.push({ cmd, slotIdx, subIdx });
          });
        }
      }
    });
    return steps;
  }

  areAllTriggersComplete() {
    const reqSwitches = (this.level.switches || []).length;
    const reqKeys = (this.level.keys || []).length;
    return this.litSwitches.size >= reqSwitches && this.collectedKeys.size >= reqKeys;
  }

  getBridgeAt(r, c) {
    return (this.level.bridges || []).find((b) => b.r === r && b.c === c) || null;
  }

  getTileElevation(r, c) {
    if (r < 0 || r >= this.level.size || c < 0 || c >= this.level.size) return '#';
    const bridge = this.getBridgeAt(r, c);
    if (bridge) {
      return this.areAllTriggersComplete() ? bridge.elev ?? 0 : '#BRIDGE_OFF#';
    }
    return this.level.grid[r][c];
  }

  isGateClosedAt(r, c) {
    const hasGate = (this.level.gates || []).some((g) => g.r === r && g.c === c);
    if (!hasGate) return false;
    return !this.areAllTriggersComplete();
  }

  collectKeyIfPresent(r, c) {
    const hasKey = (this.level.keys || []).some((k) => k.r === r && k.c === c);
    if (!hasKey) return false;
    const keyStr = `${r},${c}`;
    if (!this.collectedKeys.has(keyStr)) {
      this.collectedKeys.add(keyStr);
      return true;
    }
    return false;
  }

  isFinishReachedAndAllLit() {
    const atFinish = this.robot.r === this.level.finish.r && this.robot.c === this.level.finish.c;
    if (!atFinish) return false;
    return this.areAllTriggersComplete();
  }

  executeSingleCommand(cmd) {
    const curElev = this.getTileElevation(this.robot.r, this.robot.c);

    // 1 klasė: absoliučios kryptys (Aukštyn, Žemyn, Kairėn, Dešinėn)
    if (ABS_CMD_DIR[cmd]) {
      const targetDir = ABS_CMD_DIR[cmd];
      this.robot.dir = targetDir;
      const dirObj = DIRS[DIR_INDEX[targetDir]];
      const nr = this.robot.r + dirObj.dr;
      const nc = this.robot.c + dirObj.dc;
      const targetElev = this.getTileElevation(nr, nc);

      if (targetElev === '#BRIDGE_OFF#') {
        this.crashTile = { r: nr, c: nc };
        return {
          ok: false,
          reason: '🌉 Tiltas dar neišskleistas! Pirma paimk visus 🔑 raktus arba įjunk ⚡.'
        };
      }
      if (targetElev === '#') {
        this.crashTile = { r: nr, c: nc };
        return { ok: false, reason: '💥 Robotas atsitrenkė į sieną! Grįžtame į startą.' };
      }
      if (this.isGateClosedAt(nr, nc)) {
        this.crashTile = { r: nr, c: nc };
        return {
          ok: false,
          reason: '🔒 Durelės užrakintos! Pirma surink visus 🔑 raktus.'
        };
      }
      this.robot.r = nr;
      this.robot.c = nc;
      const pickedKey = this.collectKeyIfPresent(nr, nc);
      return { ok: true, kind: pickedKey ? 'key' : 'move' };
    }

    const dirObj = DIRS[DIR_INDEX[this.robot.dir]];

    if (cmd === 'LEFT') {
      this.robot.dir = DIRS[(DIR_INDEX[this.robot.dir] + 3) % 4].key;
      return { ok: true, kind: 'turn' };
    }

    if (cmd === 'RIGHT') {
      this.robot.dir = DIRS[(DIR_INDEX[this.robot.dir] + 1) % 4].key;
      return { ok: true, kind: 'turn' };
    }

    if (cmd === 'FWD') {
      const nr = this.robot.r + dirObj.dr;
      const nc = this.robot.c + dirObj.dc;
      const targetElev = this.getTileElevation(nr, nc);
      if (targetElev === '#BRIDGE_OFF#') {
        this.crashTile = { r: nr, c: nc };
        return {
          ok: false,
          reason: '🌉 Tiltas išjungtas! Pirma užvažiuok ant ⚡ jungiklio ir paspausk ⚡ Aktyvuoti.'
        };
      }
      if (targetElev === '#') {
        this.crashTile = { r: nr, c: nc };
        return { ok: false, reason: '💥 Robotas atsitrenkė į sieną arba nukrito! Grįžtame į startą.' };
      }
      if (this.isGateClosedAt(nr, nc)) {
        this.crashTile = { r: nr, c: nc };
        return {
          ok: false,
          reason: '🔒 Durelės uždarytos! Pirma įjunk ⚡ jungiklį.'
        };
      }
      if (targetElev !== curElev) {
        this.crashTile = { r: nr, c: nc };
        return {
          ok: false,
          reason:
            targetElev > curElev
              ? '⛰️ Per aukšta pakyla! Užlipimui naudok ⚡ Šuolį.'
              : '⬇️ Priešakyje skardis žemyn! Naudok ⚡ Šuolį.'
        };
      }
      this.robot.r = nr;
      this.robot.c = nc;
      const pickedKey = this.collectKeyIfPresent(nr, nc);
      return { ok: true, kind: pickedKey ? 'key' : 'move' };
    }

    if (cmd === 'ACT') {
      const swKey = `${this.robot.r},${this.robot.c}`;
      const isSwitchTile = (this.level.switches || []).some(
        (sw) => sw.r === this.robot.r && sw.c === this.robot.c
      );
      if (isSwitchTile && !this.litSwitches.has(swKey)) {
        this.litSwitches.add(swKey);
        return { ok: true, kind: 'switch' };
      }

      const nr = this.robot.r + dirObj.dr;
      const nc = this.robot.c + dirObj.dc;
      const targetElev = this.getTileElevation(nr, nc);
      if (targetElev === '#BRIDGE_OFF#') {
        this.crashTile = { r: nr, c: nc };
        return {
          ok: false,
          reason: '🌉 Tiltas išjungtas! Pirma aktyvuok visus ⚡ jungiklius.'
        };
      }
      if (targetElev === '#') {
        this.crashTile = { r: nr, c: nc };
        return { ok: false, reason: '💥 Šuolis į tuštumą! Robotas grįžta į startą.' };
      }
      if (this.isGateClosedAt(nr, nc)) {
        this.crashTile = { r: nr, c: nc };
        return {
          ok: false,
          reason: '🔒 Durelės uždarytos! Pirma įjunk ⚡ jungiklį ir atidaryk kelią.'
        };
      }
      if (targetElev === curElev + 1 || targetElev < curElev) {
        this.robot.r = nr;
        this.robot.c = nc;
        const pickedKey = this.collectKeyIfPresent(nr, nc);
        return { ok: true, kind: pickedKey ? 'key' : 'jump' };
      }

      this.crashTile = { r: this.robot.r, c: this.robot.c };
      return {
        ok: false,
        reason: '⚡ Čia nėra nei jungiklio, nei aukštesnės/žemesnės pakylos! Grįžtame į startą.'
      };
    }

    return { ok: false, reason: 'Nežinoma komanda.' };
  }

  runProgram() {
    if (this.running || this.won) return;
    const steps = this.buildExecutionSteps();
    if (steps.length === 0) {
      this.callbacks.onError?.('Pirmiausia sudėk bent vieną komandą į programos juostą!');
      return;
    }

    this.stopExecutionTimers();
    this.resetRobotToStart();
    this.running = true;
    this.callbacks.onRunStateChange?.(true);

    let stepIdx = 0;

    const runNext = () => {
      if (!this.running || this.won) return;
      if (stepIdx >= steps.length) {
        this.execPointer = null;
        this.running = false;
        this.callbacks.onRunStateChange?.(false);
        this.callbacks.onQueueChange?.();

        const missingSwitches = (this.level.switches || []).length - this.litSwitches.size;
        const missingKeys = (this.level.keys || []).length - this.collectedKeys.size;
        const msg =
          missingKeys > 0
            ? `🔑 Liko nesurinktų raktų (${missingKeys})! Grąžiname robotą į startą.`
            : missingSwitches > 0
              ? `⚡ Liko neįjungtų jungiklių (${missingSwitches})! Grąžiname robotą į startą.`
              : '🔋 Programa baigėsi nepasiekus baterijos! Pakeisk komandas ir bandyk dar kartą.';
        this.callbacks.onFailRun?.(msg);
        this.resetTimer = setTimeout(() => {
          this.resetRobotToStart();
        }, 600);
        return;
      }

      const step = steps[stepIdx];
      this.execPointer = { slotIdx: step.slotIdx, subIdx: step.subIdx };
      this.callbacks.onQueueChange?.();

      const res = this.executeSingleCommand(step.cmd);
      this.render();

      if (!res.ok) {
        this.running = false;
        this.callbacks.onRunStateChange?.(false);
        this.callbacks.onFailRun?.(res.reason);
        this.resetTimer = setTimeout(() => {
          this.resetRobotToStart();
          this.callbacks.onQueueChange?.();
        }, 650);
        return;
      }

      this.callbacks.onStepExecuted?.(res.kind);

      if (this.isFinishReachedAndAllLit()) {
        this.won = true;
        this.isWinning = true;
        this.inputLocked = true;
        this.victoryTimer = 0;
        this.winNotified = false;
        this.running = false;
        this.execPointer = null;
        this.callbacks.onRunStateChange?.(false);
        this.callbacks.onQueueChange?.();
        this.render();
        return;
      }

      stepIdx += 1;
      this.stepTimer = setTimeout(runNext, 440);
    };

    this.stepTimer = setTimeout(runNext, 220);
  }

  startAnimLoop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.pulsePhase += dt * 3.6;
      if (this.isWinning && !this.winNotified) {
        if (this.victoryTimer === 0) {
          window.__protoLabJuice?.(true);
        }
        this.victoryTimer += dt;
        if (this.victoryTimer >= 2.0) {
          this.isWinning = false;
          this.winNotified = true;
          this.callbacks.onWin?.();
        }
      }
      this.render();
      this.animFrame = requestAnimationFrame(tick);
    };
    this.animFrame = requestAnimationFrame(tick);
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    const W = ALGO_CANVAS_W;
    const H = ALGO_CANVAS_H;
    ctx.clearRect(0, 0, W, H);

    // Foninė kosminė aikštelė
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#091124');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const n = this.level.size;
    const padX = 48;
    const padTop = 36;
    const padBottom = 26;
    const cellSize = Math.floor(Math.min((W - padX * 2) / n, (H - padTop - padBottom) / n));
    const boardW = cellSize * n;
    const boardH = cellSize * n;
    const startX = Math.floor((W - boardW) / 2);
    const startY = Math.floor((H - boardH) / 2) + 8;

    const bridgesUnlocked = this.areAllTriggersComplete();

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const bridge = this.getBridgeAt(r, c);
        const val = this.level.grid[r][c];
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        // Neišskleistas energijos tiltas virš prarajos
        if (bridge && !bridgesUnlocked) {
          const glow = 0.45 + 0.25 * Math.sin(this.pulsePhase * 1.5);
          ctx.fillStyle = '#091326';
          ctx.fillRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
          ctx.save();
          ctx.strokeStyle = `rgba(34, 211, 238, ${glow})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.roundRect(x + 5, y + 5, cellSize - 10, cellSize - 10, 7);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(103, 232, 249, 0.72)';
          ctx.font = `${Math.floor(cellSize * 0.34)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌉', x + cellSize / 2, y + cellSize / 2 - 4);
          ctx.font = `900 ${Math.max(9, Math.floor(cellSize * 0.16))}px Nunito, sans-serif`;
          ctx.fillText(bridge.elev ? `TILTAS +${bridge.elev}` : 'TILTAS', x + cellSize / 2, y + cellSize - 10);
          ctx.restore();
          continue;
        }

        if (!bridge && val === '#') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

          ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 10, y + 10);
          ctx.lineTo(x + cellSize - 10, y + cellSize - 10);
          ctx.moveTo(x + cellSize - 10, y + 10);
          ctx.lineTo(x + 10, y + cellSize - 10);
          ctx.stroke();
          continue;
        }

        const elev = bridge ? Number(bridge.elev) || 0 : Number(val) || 0;
        const lift = elev * 7;
        const tileTopY = y - lift;

        if (lift > 0) {
          ctx.fillStyle = bridge ? '#0e7490' : elev === 1 ? '#1d4ed8' : elev === 2 ? '#6d28d9' : '#be185d';
          ctx.fillRect(x + 3, tileTopY + cellSize - 6, cellSize - 6, lift + 4);
        }

        const elevColors = ['#334155', '#3b82f6', '#8b5cf6', '#ec4899'];
        ctx.fillStyle = bridge ? '#0284c7' : elevColors[Math.min(elev, elevColors.length - 1)];
        ctx.beginPath();
        ctx.roundRect(x + 3, tileTopY + 3, cellSize - 6, cellSize - 6, 8);
        ctx.fill();

        if (bridge) {
          ctx.save();
          ctx.strokeStyle = '#5eead4';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          // Šviečiančios tilto juostos
          ctx.fillStyle = 'rgba(153, 246, 228, 0.35)';
          ctx.fillRect(x + 8, tileTopY + cellSize * 0.36, cellSize - 16, 4);
          ctx.fillRect(x + 8, tileTopY + cellSize * 0.58, cellSize - 16, 4);
          ctx.restore();
        } else {
          ctx.strokeStyle = 'rgba(248, 250, 252, 0.28)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (elev > 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.88)';
          ctx.font = `900 ${Math.max(10, Math.floor(cellSize * 0.22))}px Nunito, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(`+${elev}`, x + 8, tileTopY + 7);
        }

        // Starto žyma
        if (r === this.level.start.r && c === this.level.start.c) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x + 7, tileTopY + 7, cellSize - 14, cellSize - 14);
        }

        // Raktas 🔑 (1 klasės trasose)
        const isKey = (this.level.keys || []).some((k) => k.r === r && k.c === c);
        if (isKey && !this.collectedKeys.has(`${r},${c}`)) {
          const glow = 0.75 + 0.25 * Math.sin(this.pulsePhase * 1.6);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, tileTopY + cellSize / 2, cellSize * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(250, 204, 21, ${0.26 * glow})`;
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fde047';
          ctx.stroke();
          ctx.font = `${Math.floor(cellSize * 0.42)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔑', x + cellSize / 2, tileTopY + cellSize / 2 + 1);
          ctx.restore();
        }

        // Uždarytos / atidarytos durelės 🔒
        const isGate = (this.level.gates || []).some((g) => g.r === r && g.c === c);
        if (isGate) {
          const isClosed = !bridgesUnlocked;
          ctx.save();
          if (isClosed) {
            ctx.fillStyle = 'rgba(220, 38, 38, 0.28)';
            ctx.beginPath();
            ctx.roundRect(x + 5, tileTopY + 5, cellSize - 10, cellSize - 10, 7);
            ctx.fill();
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(251, 146, 60, 0.85)';
            ctx.lineWidth = 3;
            for (let b = 1; b <= 3; b++) {
              const bx = x + 6 + ((cellSize - 12) * b) / 4;
              ctx.beginPath();
              ctx.moveTo(bx, tileTopY + 8);
              ctx.lineTo(bx, tileTopY + cellSize - 8);
              ctx.stroke();
            }

            ctx.font = `${Math.floor(cellSize * 0.36)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', x + cellSize / 2, tileTopY + cellSize / 2 + 1);
          } else {
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.roundRect(x + 7, tileTopY + 7, cellSize - 14, cellSize - 14, 6);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = `${Math.floor(cellSize * 0.3)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔓', x + cellSize / 2, tileTopY + cellSize / 2 + 1);
          }
          ctx.restore();
        }

        // Šviečiantis jungiklis ⚡
        const isSwitch = (this.level.switches || []).some((sw) => sw.r === r && sw.c === c);
        if (isSwitch) {
          const isLit = this.litSwitches.has(`${r},${c}`);
          const glow = 0.7 + 0.3 * Math.sin(this.pulsePhase * 1.4);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, tileTopY + cellSize / 2, cellSize * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = isLit ? `rgba(74, 222, 128, ${glow})` : 'rgba(250, 204, 21, 0.28)';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = isLit ? '#bbf7d0' : '#facc15';
          ctx.stroke();

          ctx.fillStyle = isLit ? '#052e16' : '#fef08a';
          ctx.font = `${Math.floor(cellSize * 0.36)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡', x + cellSize / 2, tileTopY + cellSize / 2 + 1);
          ctx.restore();
        }

        // Finišo energijos baterija 🔋
        if (r === this.level.finish.r && c === this.level.finish.c) {
          const ready = bridgesUnlocked;
          const pulse = 1 + (this.won ? 0.14 : 0.08) * Math.sin(this.pulsePhase * (this.won ? 3.2 : 2));
          ctx.save();
          ctx.translate(x + cellSize / 2, tileTopY + cellSize / 2);
          if (this.won) {
            const auraR = cellSize * (0.44 + 0.1 * Math.sin(this.pulsePhase * 4));
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.85)';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 22;
            ctx.shadowColor = '#4ade80';
            ctx.beginPath();
            ctx.arc(0, 0, auraR, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.scale(pulse, pulse);

          ctx.shadowColor = ready ? '#4ade80' : '#f59e0b';
          ctx.shadowBlur = ready ? 16 : 8;
          ctx.fillStyle = ready ? '#16a34a' : '#78350f';
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = ready ? '#86efac' : '#fbbf24';
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.floor(cellSize * 0.42)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔋', 0, 1);
          ctx.restore();
        }
      }
    }

    if (this.crashTile) {
      const cx = startX + this.crashTile.c * cellSize + cellSize / 2;
      const cy = startY + this.crashTile.r * cellSize + cellSize / 2;
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const rElevRaw = this.getTileElevation(this.robot.r, this.robot.c);
    const rElev = typeof rElevRaw === 'string' ? 0 : Number(rElevRaw) || 0;
    const rx = startX + this.robot.c * cellSize + cellSize / 2;
    const ry = startY + this.robot.r * cellSize + cellSize / 2 - rElev * 7;

    this.drawRobot(ctx, rx, ry, cellSize, this.robot.dir);
  }

  drawRobot(ctx, cx, cy, cellSize, dirKey) {
    const dirAngles = { U: -Math.PI / 2, R: 0, D: Math.PI / 2, L: Math.PI };
    const angle = dirAngles[dirKey] ?? 0;
    const bodyR = cellSize * 0.34;
    const jumpLift = this.won ? Math.abs(Math.sin(this.pulsePhase * 2.5)) * (cellSize * 0.24) : 0;
    const jetActive = this.running || this.won;

    ctx.save();
    ctx.translate(cx, cy);

    const shadowScale = Math.max(0.55, 1 - jumpLift / (cellSize * 0.45));
    ctx.fillStyle = 'rgba(2, 6, 23, 0.58)';
    ctx.beginPath();
    ctx.ellipse(0, bodyR * 0.68, bodyR * 0.94 * shadowScale, bodyR * 0.46 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, -jumpLift);
    ctx.rotate(angle);

    // Reaktyvinis pėdsakas (kibirkštys ir liepsna už roboto)
    const flamePulse = 0.78 + 0.28 * Math.sin(this.pulsePhase * 8);
    const jetLen = (jetActive ? bodyR * 1.15 : bodyR * 0.52) * flamePulse;
    ctx.save();
    ctx.shadowBlur = jetActive ? 16 : 8;
    ctx.shadowColor = this.won ? '#4ade80' : '#38bdf8';
    const jetGrad = ctx.createLinearGradient(-bodyR * 0.92, 0, -bodyR * 0.92 - jetLen, 0);
    jetGrad.addColorStop(0, '#ffffff');
    jetGrad.addColorStop(0.35, this.won ? '#4ade80' : '#38bdf8');
    jetGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = jetGrad;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.9, -bodyR * 0.34);
    ctx.lineTo(-bodyR * 0.9 - jetLen, 0);
    ctx.lineTo(-bodyR * 0.9, bodyR * 0.34);
    ctx.closePath();
    ctx.fill();

    // Smulkios reaktyvinės dalelės pėdsake
    for (let jp = 0; jp < 3; jp++) {
      const ph = ((this.pulsePhase * 0.55 + jp * 0.33) % 1);
      const px = -bodyR * 0.96 - ph * jetLen * 1.2;
      const py = Math.sin(this.pulsePhase * 3 + jp * 2.1) * (bodyR * 0.25);
      ctx.globalAlpha = 1 - ph;
      ctx.fillStyle = jp % 2 === 0 ? '#a5f3fc' : '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, 2.2 * (1 - ph * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Šoniniai reaktyviniai purkštukai
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-bodyR * 1.08, -bodyR * 0.5, bodyR * 0.3, bodyR * 1.0, 4);
    ctx.fill();
    ctx.stroke();

    // 2.5D metalinis roboto korpusas
    const hullGrad = ctx.createRadialGradient(-bodyR * 0.22, -bodyR * 0.25, 2, 0, 0, bodyR * 1.25);
    if (this.won) {
      hullGrad.addColorStop(0, '#dcfce7');
      hullGrad.addColorStop(0.45, '#4ade80');
      hullGrad.addColorStop(1, '#15803d');
    } else {
      hullGrad.addColorStop(0, '#e0f2fe');
      hullGrad.addColorStop(0.45, '#38bdf8');
      hullGrad.addColorStop(1, '#1d4ed8');
    }
    ctx.fillStyle = hullGrad;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(-bodyR * 0.92, -bodyR * 0.88, bodyR * 1.84, bodyR * 1.76, 11);
    ctx.fill();
    ctx.stroke();

    // Antena su švytinčiu švyturėliu
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.48, -bodyR * 0.65);
    ctx.lineTo(-bodyR * 0.82, -bodyR * 1.06);
    ctx.stroke();
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.won ? '#4ade80' : '#fde047';
    ctx.fillStyle = this.won ? '#4ade80' : '#fde047';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.84, -bodyR * 1.08, bodyR * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Kryptinis auksinis priekinis snapelis
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(bodyR * 1.16, 0);
    ctx.lineTo(bodyR * 0.74, -bodyR * 0.34);
    ctx.lineTo(bodyR * 0.74, bodyR * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Švytintis stiklinis vizorius su akių LED juosta
    ctx.fillStyle = '#090d1f';
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-bodyR * 0.04, -bodyR * 0.64, bodyR * 0.76, bodyR * 1.28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.won ? '#4ade80' : '#22d3ee';
    ctx.fillStyle = this.won ? '#86efac' : '#67e8f9';
    ctx.beginPath();
    ctx.arc(bodyR * 0.38, -bodyR * 0.27, bodyR * 0.16, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.38, bodyR * 0.27, bodyR * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bodyR * 0.42, -bodyR * 0.31, bodyR * 0.06, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.42, bodyR * 0.23, bodyR * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
