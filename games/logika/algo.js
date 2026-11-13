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

export const CMD_META = {
  FWD: { label: 'Pirmyn', icon: '⬆️', short: '⬆️', cls: 'cmd-fwd' },
  LEFT: { label: 'Kairėn', icon: '↰', short: '↰', cls: 'cmd-left' },
  RIGHT: { label: 'Dešinėn', icon: '↱', short: '↱', cls: 'cmd-right' },
  ACT: { label: 'Aktyvuoti / Šuolis', icon: '⚡', short: '⚡', cls: 'cmd-act' }
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
      title: '1. Tiesiai į bateriją',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Sudėk komandas į eilę ir paspausk „Paleisti programą“, kad robotas pasiektų 🔋!',
      reward: 1,
      size: 5,
      maxSlots: 6,
      allowLoop: false,
      allowAct: false,
      start: { r: 2, c: 0, dir: 'R' },
      finish: { r: 2, c: 4 },
      switches: [],
      grid: withTiles(5, '#', [
        [2, 0, 0], [2, 1, 0], [2, 2, 0], [2, 3, 0], [2, 4, 0],
        [1, 0, 0], [3, 0, 0], [1, 4, 0], [3, 4, 0]
      ])
    },
    {
      id: 'alg_g1_2',
      title: '2. Pirmasis posūkis',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Eik pirmyn, pasisuk dešinėn (↱) ir užbaik trasą tiesiai iki baterijos!',
      reward: 1,
      size: 5,
      maxSlots: 6,
      allowLoop: false,
      allowAct: false,
      start: { r: 4, c: 1, dir: 'U' },
      finish: { r: 2, c: 3 },
      switches: [],
      grid: withTiles(5, 0, [
        [4, 2, '#'], [3, 2, '#'], [3, 3, '#'], [1, 1, '#'], [1, 2, '#'], [1, 3, '#'], [0, 0, '#'], [4, 4, '#']
      ])
    },
    {
      id: 'alg_g1_3',
      title: '3. Lazerių koridorius',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Aplenk sienas naudodamas posūkius kairėn (↰) ir dešinėn (↱).',
      reward: 1,
      size: 5,
      maxSlots: 6,
      allowLoop: false,
      allowAct: false,
      start: { r: 4, c: 0, dir: 'R' },
      finish: { r: 2, c: 2 },
      switches: [],
      grid: withTiles(5, 0, [
        [4, 2, '#'], [3, 2, '#'], [3, 0, '#'], [1, 1, '#'], [1, 2, '#'], [2, 0, '#'], [0, 4, '#']
      ])
    },
    {
      id: 'alg_g1_4',
      title: '4. Zigzagas aplink bokštus',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Suplanuok 6 žingsnių maršrutą aplink tamsias sienas!',
      reward: 2,
      size: 5,
      maxSlots: 6,
      allowLoop: false,
      allowAct: false,
      start: { r: 0, c: 0, dir: 'R' },
      finish: { r: 2, c: 2 },
      switches: [],
      grid: withTiles(5, 0, [
        [0, 2, '#'], [1, 0, '#'], [1, 2, '#'], [3, 1, '#'], [4, 0, '#'], [3, 3, '#']
      ])
    },
    {
      id: 'alg_g1_5',
      title: '5. Išmanusis posūkis',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 1 KL.',
      instruction: 'Robotas žiūri į kairę! Atidžiai susek jo kryptį ir nuvesk iki 🔋.',
      reward: 2,
      size: 5,
      maxSlots: 6,
      allowLoop: false,
      allowAct: false,
      start: { r: 3, c: 3, dir: 'L' },
      finish: { r: 1, c: 1 },
      switches: [],
      grid: withTiles(5, 0, [
        [3, 1, '#'], [2, 1, '#'], [2, 3, '#'], [0, 2, '#'], [1, 3, '#'], [4, 4, '#']
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
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 0, dir: 'R' },
      finish: { r: 1, c: 6 },
      switches: [],
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
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 1, dir: 'U' },
      finish: { r: 2, c: 5 },
      switches: [
        { r: 4, c: 1 },
        { r: 3, c: 1 },
        { r: 2, c: 1 }
      ],
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
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 2, dir: 'R' },
      finish: { r: 1, c: 2 },
      switches: [],
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
      reward: 3,
      size: 7,
      maxSlots: 5,
      allowLoop: true,
      allowAct: true,
      start: { r: 1, c: 1, dir: 'R' },
      finish: { r: 5, c: 3 },
      switches: [
        { r: 1, c: 2 },
        { r: 1, c: 3 },
        { r: 1, c: 4 }
      ],
      grid: withTiles(7, '#', [
        [1, 1, 2], [1, 2, 2], [1, 3, 2], [1, 4, 2],
        [2, 4, 1], [3, 4, 1], [4, 4, 0], [5, 4, 0], [5, 3, 0]
      ])
    },
    {
      id: 'alg_g3_5',
      title: '5. Didysis algoritmo iššūkis',
      badge: '🧑‍💻 ALGORITMŲ TRASA • 3 KL.',
      instruction: 'Tik 5 vietos 14 žingsnių programai: lipk aukštyn, įjunk ⚡ jungiklius ir nulipk prie 🔋!',
      reward: 3,
      size: 7,
      maxSlots: 5,
      allowLoop: true,
      allowAct: true,
      start: { r: 5, c: 5, dir: 'L' },
      finish: { r: 3, c: 5 },
      switches: [
        { r: 4, c: 1 },
        { r: 3, c: 1 }
      ],
      grid: withTiles(7, '#', [
        [5, 5, 0], [5, 4, 1], [5, 3, 1], [5, 2, 2], [5, 1, 2],
        [4, 1, 2], [3, 1, 2],
        [3, 2, 3], [3, 3, 3], [3, 4, 2], [3, 5, 2]
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
    this.slots = [];
    this.activeLoopIndex = null;
    this.resetRobotToStart();
    this.callbacks.onQueueChange?.();
  }

  addCommand(cmd) {
    if (this.running || this.won) return false;
    if (!CMD_META[cmd]) return false;

    // Jei šiuo metu pažymėtas nepilnas ciklas, dedame komandą į jo vidų (max 2)
    if (this.activeLoopIndex !== null) {
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
      this.callbacks.onError?.('Programos juosta pilna! Pašalink blokelį arba naudok 🔁 ciklą.');
      return false;
    }

    this.slots.push({ type: 'cmd', cmd });
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
        steps.push({ cmd: slot.cmd, slotIdx, subIdx: -1 });
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

  getTileElevation(r, c) {
    if (r < 0 || r >= this.level.size || c < 0 || c >= this.level.size) return '#';
    return this.level.grid[r][c];
  }

  isFinishReachedAndSwitchesLit() {
    const atFinish =
      this.robot.r === this.level.finish.r && this.robot.c === this.level.finish.c;
    if (!atFinish) return false;
    return this.litSwitches.size >= this.level.switches.length;
  }

  executeSingleCommand(cmd) {
    const curElev = this.getTileElevation(this.robot.r, this.robot.c);
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
      if (targetElev === '#') {
        this.crashTile = { r: nr, c: nc };
        return { ok: false, reason: '💥 Robotas atsitrenkė į sieną arba nukrito! Grįžtame į startą.' };
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
      return { ok: true, kind: 'move' };
    }

    if (cmd === 'ACT') {
      const swKey = `${this.robot.r},${this.robot.c}`;
      const isSwitchTile = this.level.switches.some(
        (sw) => sw.r === this.robot.r && sw.c === this.robot.c
      );
      if (isSwitchTile && !this.litSwitches.has(swKey)) {
        this.litSwitches.add(swKey);
        return { ok: true, kind: 'switch' };
      }

      const nr = this.robot.r + dirObj.dr;
      const nc = this.robot.c + dirObj.dc;
      const targetElev = this.getTileElevation(nr, nc);
      if (targetElev === '#') {
        this.crashTile = { r: nr, c: nc };
        return { ok: false, reason: '💥 Šuolis į tuštumą! Robotas grįžta į startą.' };
      }
      if (targetElev === curElev + 1 || targetElev < curElev) {
        this.robot.r = nr;
        this.robot.c = nc;
        return { ok: true, kind: 'jump' };
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

        const missingSwitches = this.level.switches.length - this.litSwitches.size;
        const msg =
          missingSwitches > 0
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

      if (this.isFinishReachedAndSwitchesLit()) {
        this.won = true;
        this.running = false;
        this.execPointer = null;
        this.callbacks.onRunStateChange?.(false);
        this.callbacks.onQueueChange?.();
        this.render();
        this.callbacks.onWin?.();
        return;
      }

      stepIdx += 1;
      this.stepTimer = setTimeout(runNext, 500);
    };

    this.stepTimer = setTimeout(runNext, 240);
  }

  startAnimLoop() {
    const tick = () => {
      this.pulsePhase += 0.06;
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

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const val = this.level.grid[r][c];
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        if (val === '#') {
          // Tuštuma / blokinė siena
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

          // Subtilus pavojaus kryžius / siena
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

        const elev = Number(val) || 0;
        const lift = elev * 7;
        const tileTopY = y - lift;

        // Šoninis pakylos šonas (2.5D efektas)
        if (lift > 0) {
          ctx.fillStyle = elev === 1 ? '#1d4ed8' : elev === 2 ? '#6d28d9' : '#be185d';
          ctx.fillRect(x + 3, tileTopY + cellSize - 6, cellSize - 6, lift + 4);
        }

        // Viršutinė langelio plokštė pagal aukštį
        const elevColors = ['#334155', '#3b82f6', '#8b5cf6', '#ec4899'];
        ctx.fillStyle = elevColors[Math.min(elev, elevColors.length - 1)];
        ctx.beginPath();
        ctx.roundRect(x + 3, tileTopY + 3, cellSize - 6, cellSize - 6, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(248, 250, 252, 0.28)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Aukščio skaičiukas kampelyje, kai yra pakylos (>0 arba lygis turi elev > 0)
        if (elev > 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
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

        // Šviečiantis jungiklis ⚡
        const isSwitch = this.level.switches.some((sw) => sw.r === r && sw.c === c);
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
          const ready = this.litSwitches.size >= this.level.switches.length;
          const pulse = 1 + 0.08 * Math.sin(this.pulsePhase * 2);
          ctx.save();
          ctx.translate(x + cellSize / 2, tileTopY + cellSize / 2);
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

    // Avarijos blyksnis jei atsitrenkė
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

    // ROBOTAS SU AIŠKIU PRIEKIU IR AKIMIS
    const rElevRaw = this.getTileElevation(this.robot.r, this.robot.c);
    const rElev = rElevRaw === '#' ? 0 : Number(rElevRaw) || 0;
    const rx = startX + this.robot.c * cellSize + cellSize / 2;
    const ry = startY + this.robot.r * cellSize + cellSize / 2 - rElev * 7;

    this.drawRobot(ctx, rx, ry, cellSize, this.robot.dir);
  }

  drawRobot(ctx, cx, cy, cellSize, dirKey) {
    const dirAngles = { U: -Math.PI / 2, R: 0, D: Math.PI / 2, L: Math.PI };
    const angle = dirAngles[dirKey] ?? 0;
    const bodyR = cellSize * 0.33;

    ctx.save();
    ctx.translate(cx, cy);

    // Šešėlis po robotu
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, bodyR * 0.65, bodyR * 0.9, bodyR * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(angle);

    // Kūnas (žiūri į +X po transformacijos)
    ctx.fillStyle = this.won ? '#4ade80' : '#38bdf8';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-bodyR, -bodyR * 0.88, bodyR * 1.9, bodyR * 1.76, 10);
    ctx.fill();
    ctx.stroke();

    // Priekio krypties rodyklė / antena priekyje (+X)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(bodyR * 1.18, 0);
    ctx.lineTo(bodyR * 0.72, -bodyR * 0.36);
    ctx.lineTo(bodyR * 0.72, bodyR * 0.36);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tamsus ekranas + dvi ryškios akys priekyje
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(0, -bodyR * 0.62, bodyR * 0.72, bodyR * 1.24, 5);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(bodyR * 0.38, -bodyR * 0.28, bodyR * 0.16, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.38, bodyR * 0.28, bodyR * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Vyzdžiai
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(bodyR * 0.44, -bodyR * 0.28, bodyR * 0.06, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.44, bodyR * 0.28, bodyR * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
