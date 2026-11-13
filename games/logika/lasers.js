// ==================== LAZERIŲ VEIDRODŽIAI (OPTIKOS GALVOSŪKIAI) ====================
export const LASER_CANVAS_W = 640;
export const LASER_CANVAS_H = 440;

export const LASER_LEVELS = {
  grade1: [
    {
      id: 'las_g1_1',
      title: '1. Spindulys aplink sieną',
      instruction: 'Atsek kelią akimis prieš spausdamas! Pasuk veidrodžius (/ arba \\), kad lazeris apeitų sienas (maks. 4 pasukimai).',
      reward: 1,
      cols: 5,
      rows: 5,
      maxMoves: 4,
      movable: false,
      emitter: { r: 2, c: 0, dir: 'R' },
      targets: [{ r: 0, c: 3 }],
      walls: [
        [2, 3],
        [1, 1]
      ],
      pieces: [
        { id: 'm1', kind: 'mirror', r: 2, c: 2, type: '\\' },
        { id: 'm2', kind: 'mirror', r: 0, c: 2, type: '\\' },
        { id: 'm3', kind: 'mirror', r: 4, c: 2, type: '/' }
      ]
    },
    {
      id: 'las_g1_2',
      title: '2. Dviguba kliūtis',
      instruction: 'Suderink 3 veidrodžius 5×5 tinklelyje, kad lazeris aplenktų sienas ir pasiektų 💎 kristalą (maks. 5 ėjimai)!',
      reward: 2,
      cols: 5,
      rows: 5,
      maxMoves: 5,
      movable: false,
      emitter: { r: 0, c: 0, dir: 'D' },
      targets: [{ r: 4, c: 2 }],
      walls: [
        [2, 0],
        [3, 2]
      ],
      pieces: [
        { id: 'm1', kind: 'mirror', r: 1, c: 0, type: '/' },
        { id: 'm2', kind: 'mirror', r: 1, c: 4, type: '/' },
        { id: 'm3', kind: 'mirror', r: 4, c: 4, type: '\\' }
      ]
    },
    {
      id: 'las_g1_3',
      title: '3. Sienų koridorius',
      instruction: 'Pravesk spindulį pro keturis veidrodžius tarp sienų į viršų (maks. 7 pasukimai)!',
      reward: 2,
      cols: 5,
      rows: 5,
      maxMoves: 7,
      movable: false,
      emitter: { r: 4, c: 0, dir: 'R' },
      targets: [{ r: 0, c: 1 }],
      walls: [
        [4, 3],
        [1, 2]
      ],
      pieces: [
        { id: 'm1', kind: 'mirror', r: 4, c: 2, type: '\\' },
        { id: 'm2', kind: 'mirror', r: 2, c: 2, type: '\\' },
        { id: 'm3', kind: 'mirror', r: 2, c: 4, type: '\\' },
        { id: 'm4', kind: 'mirror', r: 0, c: 4, type: '/' }
      ]
    },
    {
      id: 'las_g1_4',
      title: '4. Laboratorijos skydas',
      instruction: 'Kristalą iš dviejų pusių saugo sienos! Apeik jas išoriniame rate su ribotais ėjimais (maks. 6).',
      reward: 2,
      cols: 5,
      rows: 5,
      maxMoves: 6,
      movable: false,
      emitter: { r: 0, c: 4, dir: 'D' },
      targets: [{ r: 2, c: 2 }],
      walls: [
        [1, 2],
        [2, 1]
      ],
      pieces: [
        { id: 'm1', kind: 'mirror', r: 4, c: 4, type: '\\' },
        { id: 'm2', kind: 'mirror', r: 4, c: 0, type: '/' },
        { id: 'm3', kind: 'mirror', r: 0, c: 0, type: '/' },
        { id: 'm4', kind: 'mirror', r: 0, c: 3, type: '/' },
        { id: 'm5', kind: 'mirror', r: 2, c: 3, type: '\\' }
      ]
    },
    {
      id: 'las_g1_5',
      title: '5. Veidrodinis labirintas',
      instruction: 'Paskutinis 1 klasės iššūkis! Sukurk didįjį atspindžių žiedą aplink sienas per daugiausiai 8 pasukimus.',
      reward: 3,
      cols: 5,
      rows: 5,
      maxMoves: 8,
      movable: false,
      emitter: { r: 0, c: 0, dir: 'R' },
      targets: [{ r: 3, c: 3 }],
      walls: [
        [2, 2],
        [1, 1]
      ],
      pieces: [
        { id: 'm1', kind: 'mirror', r: 0, c: 4, type: '\\' },
        { id: 'm2', kind: 'mirror', r: 4, c: 4, type: '\\' },
        { id: 'm3', kind: 'mirror', r: 4, c: 0, type: '/' },
        { id: 'm4', kind: 'mirror', r: 2, c: 0, type: '\\' },
        { id: 'm5', kind: 'mirror', r: 2, c: 1, type: '/' },
        { id: 'm6', kind: 'mirror', r: 3, c: 1, type: '/' }
      ]
    }
  ],
  grade3: [
    {
      id: 'las_g3_1',
      title: '1. Šviesos daliklis (Splitter)',
      instruction: 'Pervilk (arba pasuk) 🔷 daliklį ir 🟡 veidrodį, kad vienu metu įžiebtum ABUDU 💎 kristalus!',
      reward: 1,
      cols: 7,
      rows: 6,
      maxMoves: 7,
      movable: true,
      emitter: { r: 3, c: 0, dir: 'R' },
      targets: [
        { r: 3, c: 6 },
        { r: 0, c: 5 }
      ],
      walls: [
        [1, 3],
        [1, 4],
        [2, 4]
      ],
      pieces: [
        { id: 's1', kind: 'splitter', r: 5, c: 1, type: '\\' },
        { id: 'm1', kind: 'mirror', r: 5, c: 5, type: '\\' }
      ]
    },
    {
      id: 'las_g3_2',
      title: '2. Dvigubas taikinys už sienos',
      instruction: 'Apeik viršutinę sieną veidrodžiu ir pastatyk daliklį taip, kad spindulys pasiektų abu kristalus!',
      reward: 2,
      cols: 7,
      rows: 6,
      maxMoves: 6,
      movable: true,
      emitter: { r: 0, c: 1, dir: 'D' },
      targets: [
        { r: 4, c: 5 },
        { r: 1, c: 6 }
      ],
      walls: [
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 2],
        [3, 3]
      ],
      pieces: [
        { id: 'm1', kind: 'mirror', r: 4, c: 0, type: '/' },
        { id: 's1', kind: 'splitter', r: 5, c: 2, type: '/' }
      ]
    },
    {
      id: 'las_g3_3',
      title: '3. Kryžminė optika',
      instruction: 'Perkelk ir pasuk 🔷 daliklį bei 3 veidrodžius: vienas spindulys šauna į viršų, kitas – per sienas dešinėn!',
      reward: 2,
      cols: 8,
      rows: 6,
      maxMoves: 12,
      movable: true,
      emitter: { r: 5, c: 0, dir: 'R' },
      targets: [
        { r: 0, c: 1 },
        { r: 2, c: 7 }
      ],
      walls: [
        [1, 4],
        [1, 5],
        [2, 2],
        [2, 3],
        [4, 5],
        [5, 4]
      ],
      pieces: [
        { id: 'm1', kind: 'mirror', r: 0, c: 4, type: '\\' },
        { id: 'm2', kind: 'mirror', r: 0, c: 6, type: '\\' },
        { id: 'm3', kind: 'mirror', r: 5, c: 6, type: '\\' },
        { id: 's1', kind: 'splitter', r: 1, c: 6, type: '\\' }
      ]
    },
    {
      id: 'las_g3_4',
      title: '4. Kampinis šviesos tinklas',
      instruction: 'Nuleisk lazerį iš dešinio kampo, padalink jį pusiau ir nuvesk į abu tolimus kristalus!',
      reward: 2,
      cols: 8,
      rows: 6,
      maxMoves: 12,
      movable: true,
      emitter: { r: 0, c: 7, dir: 'L' },
      targets: [
        { r: 5, c: 0 },
        { r: 5, c: 6 }
      ],
      walls: [
        [0, 2],
        [2, 4],
        [2, 5],
        [4, 2],
        [4, 3],
        [4, 4]
      ],
      pieces: [
        { id: 's1', kind: 'splitter', r: 5, c: 3, type: '/' },
        { id: 'm1', kind: 'mirror', r: 2, c: 1, type: '\\' },
        { id: 'm2', kind: 'mirror', r: 5, c: 1, type: '\\' },
        { id: 'm3', kind: 'mirror', r: 0, c: 0, type: '/' },
        { id: 'm4', kind: 'mirror', r: 3, c: 7, type: '\\' }
      ]
    },
    {
      id: 'las_g3_5',
      title: '5. Didysis reaktoriaus spindulys',
      instruction: 'Vyriausiojo inžinieriaus egzaminas! Sudėliok 1 daliklį ir 3 veidrodžius tarp kliūčių, kad užpildytum abu 💎!',
      reward: 3,
      cols: 8,
      rows: 6,
      maxMoves: 10,
      movable: true,
      emitter: { r: 2, c: 0, dir: 'R' },
      targets: [
        { r: 0, c: 7 },
        { r: 5, c: 7 }
      ],
      walls: [
        [1, 2],
        [1, 6],
        [2, 5],
        [3, 2],
        [4, 1],
        [4, 5]
      ],
      pieces: [
        { id: 's1', kind: 'splitter', r: 0, c: 0, type: '\\' },
        { id: 'm1', kind: 'mirror', r: 5, c: 0, type: '\\' },
        { id: 'm2', kind: 'mirror', r: 0, c: 5, type: '/' },
        { id: 'm3', kind: 'mirror', r: 3, c: 6, type: '/' }
      ]
    }
  ]
};

const DIR_VEC = {
  U: { dr: -1, dc: 0 },
  D: { dr: 1, dc: 0 },
  L: { dr: 0, dc: -1 },
  R: { dr: 0, dc: 1 }
};

export function reflectDir(dir, mirrorType) {
  if (mirrorType === '/') {
    if (dir === 'R') return 'U';
    if (dir === 'L') return 'D';
    if (dir === 'U') return 'R';
    return 'L';
  }
  // mirrorType === '\'
  if (dir === 'R') return 'D';
  if (dir === 'L') return 'U';
  if (dir === 'U') return 'L';
  return 'R';
}

export function traceOptics(level, pieces) {
  const wallSet = new Set((level.walls || []).map(([r, c]) => `${r},${c}`));
  const targetSet = new Set((level.targets || []).map((t) => `${t.r},${t.c}`));
  const pieceMap = new Map();
  pieces.forEach((p) => {
    pieceMap.set(`${p.r},${p.c}`, p);
  });

  const segments = [];
  const hitTargets = new Set();
  const sparks = [];
  const visitedRays = new Set();

  // Pradedame spindulio eilę iš šaltinio
  const queue = [{ r: level.emitter.r, c: level.emitter.c, dir: level.emitter.dir }];

  while (queue.length > 0) {
    const ray = queue.shift();
    let { r, c, dir } = ray;
    let vec = DIR_VEC[dir];
    if (!vec) continue;

    for (let step = 0; step < 64; step++) {
      const stateKey = `${r},${c},${dir}`;
      if (visitedRays.has(stateKey)) break;
      visitedRays.add(stateKey);

      const nr = r + vec.dr;
      const nc = c + vec.dc;

      // Patikriname ribas
      if (nr < 0 || nr >= level.rows || nc < 0 || nc >= level.cols) {
        segments.push({
          r1: r + 0.5,
          c1: c + 0.5,
          r2: r + 0.5 + vec.dr * 0.5,
          c2: c + 0.5 + vec.dc * 0.5
        });
        sparks.push({ r: r + 0.5 + vec.dr * 0.5, c: c + 0.5 + vec.dc * 0.5, kind: 'wall' });
        break;
      }

      // Patikriname sieną
      if (wallSet.has(`${nr},${nc}`)) {
        segments.push({
          r1: r + 0.5,
          c1: c + 0.5,
          r2: r + 0.5 + vec.dr * 0.5,
          c2: c + 0.5 + vec.dc * 0.5
        });
        sparks.push({ r: r + 0.5 + vec.dr * 0.5, c: c + 0.5 + vec.dc * 0.5, kind: 'wall' });
        break;
      }

      // Spindulys keliauja iki kito langelio centro
      segments.push({
        r1: r + 0.5,
        c1: c + 0.5,
        r2: nr + 0.5,
        c2: nc + 0.5
      });

      r = nr;
      c = nc;

      // Ar pasiekėme kristalą?
      if (targetSet.has(`${r},${c}`)) {
        hitTargets.add(`${r},${c}`);
        sparks.push({ r: r + 0.5, c: c + 0.5, kind: 'target' });
        break;
      }

      // Ar sutikome veidrodį arba daliklį?
      const piece = pieceMap.get(`${r},${c}`);
      if (piece) {
        sparks.push({ r: r + 0.5, c: c + 0.5, kind: 'bounce' });
        const bouncedDir = reflectDir(dir, piece.type);
        if (piece.kind === 'splitter') {
          // Daliklis praleidžia tiesiai IR atspindi 90° kampu!
          queue.push({ r, c, dir: bouncedDir });
        } else {
          // Paprastas veidrodis pakeičia kryptį
          dir = bouncedDir;
          vec = DIR_VEC[dir];
        }
      }
    }
  }

  return {
    segments,
    hitTargets,
    sparks,
    won: hitTargets.size === (level.targets || []).length
  };
}

export class LaserMirrorsEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.interactionMode = 'smart'; // 'smart' (drag=move, click=rotate) | 'move' (click piece -> click cell)
    this.selectedPieceId = null;
    this.dragState = null; // { pieceId, startX, startY, currX, currY, movedEnough, hoverR, hoverC }
    this.rafId = null;
    this.time = 0;
    this.wonNotified = false;

    this.computeLayout();
    this.reset();
  }

  computeLayout() {
    const padX = 28;
    const padY = 24;
    const maxW = LASER_CANVAS_W - padX * 2;
    const maxH = LASER_CANVAS_H - padY * 2;
    this.cellSize = Math.floor(Math.min(maxW / this.level.cols, maxH / this.level.rows));
    this.originX = Math.floor((LASER_CANVAS_W - this.cellSize * this.level.cols) / 2);
    this.originY = Math.floor((LASER_CANVAS_H - this.cellSize * this.level.rows) / 2);
  }

  reset() {
    this.pieces = this.level.pieces.map((p) => ({ ...p }));
    this.selectedPieceId = null;
    this.dragState = null;
    this.hint = null;
    this.wonNotified = false;
    this.movesUsed = 0;
    this.maxMoves = this.level.maxMoves || 10;
    this.outOfMoves = false;
    this.recomputeBeam();
  }

  setHint(hintObj) {
    this.hint = hintObj || null;
  }

  setInteractionMode(mode) {
    this.interactionMode = mode === 'move' ? 'move' : 'smart';
    this.selectedPieceId = null;
    this.dragState = null;
  }

  recomputeBeam() {
    this.trace = traceOptics(this.level, this.pieces);
    const totalTargets = this.level.targets.length;
    const litTargets = this.trace.hitTargets.size;
    const movesLeft = Math.max(0, this.maxMoves - this.movesUsed);
    const wonNow = this.trace.won && !this.wonNotified;
    if (this.trace.won && !this.wonNotified) {
      this.wonNotified = true;
    } else if (!this.trace.won && this.movesUsed >= this.maxMoves && !this.outOfMoves) {
      this.outOfMoves = true;
    }
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        litTargets,
        totalTargets,
        movesUsed: this.movesUsed,
        maxMoves: this.maxMoves,
        movesLeft,
        outOfMoves: this.outOfMoves,
        won: wonNow
      });
    }
    if (this.outOfMoves && this.callbacks.onOutOfMoves) {
      this.callbacks.onOutOfMoves();
    }
  }

  isCellEmptyForPiece(r, c) {
    if (r < 0 || r >= this.level.rows || c < 0 || c >= this.level.cols) return false;
    if (this.level.emitter.r === r && this.level.emitter.c === c) return false;
    if (this.level.targets.some((t) => t.r === r && t.c === c)) return false;
    if (this.level.walls.some(([wr, wc]) => wr === r && wc === c)) return false;
    if (this.pieces.some((p) => p.r === r && p.c === c)) return false;
    return true;
  }

  cellAtCoords(mx, my) {
    const c = Math.floor((mx - this.originX) / this.cellSize);
    const r = Math.floor((my - this.originY) / this.cellSize);
    if (r < 0 || r >= this.level.rows || c < 0 || c >= this.level.cols) return null;
    return { r, c };
  }

  pieceAtCell(r, c) {
    return this.pieces.find((p) => p.r === r && p.c === c) || null;
  }

  rotatePiece(piece) {
    if (this.outOfMoves || this.wonNotified) return;
    piece.type = piece.type === '/' ? '\\' : '/';
    this.movesUsed++;
    this.hint = null;
    this.recomputeBeam();
    if (this.callbacks.onMove) this.callbacks.onMove('rotate', this.trace.hitTargets.size);
  }

  movePiece(piece, r, c) {
    if (this.outOfMoves || this.wonNotified) return false;
    if (!this.level.movable) return false;
    if (!this.isCellEmptyForPiece(r, c)) return false;
    piece.r = r;
    piece.c = c;
    this.movesUsed++;
    this.hint = null;
    this.recomputeBeam();
    if (this.callbacks.onMove) this.callbacks.onMove('move', this.trace.hitTargets.size);
    return true;
  }

  handlePointerDown(mx, my) {
    if (this.outOfMoves || this.wonNotified) return;
    const cell = this.cellAtCoords(mx, my);
    if (!cell) {
      this.selectedPieceId = null;
      return;
    }

    const piece = this.pieceAtCell(cell.r, cell.c);

    // 3 klasėje: jei jau pasirinktas elementas ir paspaudžiama ant tuščio langelio -> perkeliame ten!
    if (this.level.movable && this.selectedPieceId && !piece) {
      const sel = this.pieces.find((p) => p.id === this.selectedPieceId);
      if (sel && this.movePiece(sel, cell.r, cell.c)) {
        this.selectedPieceId = null;
        return;
      }
    }

    if (!piece) {
      this.selectedPieceId = null;
      return;
    }

    if (!this.level.movable) {
      // 1 klasė: paspaudimas iškart pasuka veidrodį
      this.rotatePiece(piece);
      return;
    }

    // 3 klasė: pradedame potencialų vilkimą arba paspaudimą
    this.dragState = {
      pieceId: piece.id,
      startX: mx,
      startY: my,
      currX: mx,
      currY: my,
      movedEnough: false,
      hoverCell: cell
    };
  }

  handlePointerMove(mx, my) {
    if (!this.dragState) return;
    this.dragState.currX = mx;
    this.dragState.currY = my;
    const dist = Math.hypot(mx - this.dragState.startX, my - this.dragState.startY);
    if (dist > 8) {
      this.dragState.movedEnough = true;
    }
    this.dragState.hoverCell = this.cellAtCoords(mx, my);
  }

  handlePointerUp(mx, my) {
    if (!this.dragState) return;
    const drag = this.dragState;
    this.dragState = null;

    const piece = this.pieces.find((p) => p.id === drag.pieceId);
    if (!piece) return;

    if (drag.movedEnough) {
      const targetCell = this.cellAtCoords(mx, my);
      if (targetCell && this.isCellEmptyForPiece(targetCell.r, targetCell.c)) {
        this.movePiece(piece, targetCell.r, targetCell.c);
        this.selectedPieceId = null;
      }
      return;
    }

    // Greitas paspaudimas be vilkimo (3 klasėje: paspaudus pirmą kartą pasirenkame perkėlimui, antrą kartą – pasukame 90°)
    if (this.level.movable) {
      if (this.selectedPieceId === piece.id) {
        this.rotatePiece(piece);
      } else {
        this.selectedPieceId = piece.id;
      }
    } else {
      this.rotatePiece(piece);
    }
  }

  startLoop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.time += dt;
      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };
    this.draw();
    this.rafId = requestAnimationFrame(tick);
  }

  destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  draw() {
    const ctx = this.ctx;
    const cs = this.cellSize;
    const ox = this.originX;
    const oy = this.originY;

    ctx.clearRect(0, 0, LASER_CANVAS_W, LASER_CANVAS_H);

    // Fonas
    const bgGrad = ctx.createLinearGradient(0, 0, 0, LASER_CANVAS_H);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LASER_CANVAS_W, LASER_CANVAS_H);

    // Tinklelio langeliai
    for (let r = 0; r < this.level.rows; r++) {
      for (let c = 0; c < this.level.cols; c++) {
        const x = ox + c * cs;
        const y = oy + r * cs;
        ctx.fillStyle = (r + c) % 2 === 0 ? '#111c33' : '#0d1629';
        ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4);

        // Pažymime laisvus langelius, kai tempiame arba kai pasirinkome elementą 3 klasėje
        const showDropHint =
          this.level.movable &&
          ((this.dragState && this.dragState.movedEnough) || !!this.selectedPieceId);
        if (showDropHint && this.isCellEmptyForPiece(r, c)) {
          const isHover =
            this.dragState?.hoverCell?.r === r && this.dragState?.hoverCell?.c === c;
          ctx.fillStyle = isHover ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.06)';
          ctx.fillRect(x + 4, y + 4, cs - 8, cs - 8);
          if (isHover) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(x + 4, y + 4, cs - 8, cs - 8);
          }
        }
      }
    }

    // Sienos
    this.level.walls.forEach(([wr, wc]) => {
      const x = ox + wc * cs + 3;
      const y = oy + wr * cs + 3;
      const s = cs - 6;
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 3, y + 3, s - 6, s - 10);
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, s, s);
      // Kryžiukas / kniedės
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(x + 9, y + 9, 2.5, 0, Math.PI * 2);
      ctx.arc(x + s - 9, y + 9, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // LAZERIO SPINDULYS SU ŠVYTĖJIMU (shadowBlur)
    if (this.trace && this.trace.segments.length > 0) {
      ctx.save();
      const pulse = 0.85 + 0.15 * Math.sin(this.time * 8);

      // Išorinis švytintis sluoksnis
      ctx.shadowBlur = 22 * pulse;
      ctx.shadowColor = '#22d3ee';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      this.trace.segments.forEach((seg) => {
        ctx.moveTo(ox + seg.c1 * cs, oy + seg.r1 * cs);
        ctx.lineTo(ox + seg.c2 * cs, oy + seg.r2 * cs);
      });
      ctx.stroke();

      // Vidinė ryški balta-žydra šerdis
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = '#f0f9ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      this.trace.segments.forEach((seg) => {
        ctx.moveTo(ox + seg.c1 * cs, oy + seg.r1 * cs);
        ctx.lineTo(ox + seg.c2 * cs, oy + seg.r2 * cs);
      });
      ctx.stroke();

      // Kibirkštys ir atspindžio taškai
      this.trace.sparks.forEach((sp) => {
        const sx = ox + sp.c * cs;
        const sy = oy + sp.r * cs;
        ctx.shadowBlur = 14;
        ctx.shadowColor = sp.kind === 'target' ? '#4ade80' : '#22d3ee';
        ctx.fillStyle = sp.kind === 'target' ? '#86efac' : '#e0f2fe';
        ctx.beginPath();
        ctx.arc(sx, sy, sp.kind === 'target' ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Lazerio šaltinis (Emitter)
    this.drawEmitter(ctx, ox, oy, cs);

    // Kristalai (Targets)
    this.level.targets.forEach((t) => {
      const hit = this.trace.hitTargets.has(`${t.r},${t.c}`);
      this.drawCrystal(ctx, ox + (t.c + 0.5) * cs, oy + (t.r + 0.5) * cs, cs, hit);
    });

    // Užuominos tikslo langelis (kai reikia perkelti elementą)
    if (this.hint && typeof this.hint.toR === 'number' && typeof this.hint.toC === 'number') {
      const hx = ox + this.hint.toC * cs + 4;
      const hy = oy + this.hint.toR * cs + 4;
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 7);
      ctx.save();
      ctx.shadowBlur = 16 + pulse * 10;
      ctx.shadowColor = '#fde047';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(hx, hy, cs - 8, cs - 8);
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(250, 204, 21, ${(0.12 + pulse * 0.12).toFixed(2)})`;
      ctx.fillRect(hx, hy, cs - 8, cs - 8);
      ctx.restore();
    }

    // Veidrodžiai ir dalikliai
    this.pieces.forEach((p) => {
      const isDraggingThis = this.dragState?.movedEnough && this.dragState.pieceId === p.id;
      const cx = isDraggingThis ? this.dragState.currX : ox + (p.c + 0.5) * cs;
      const cy = isDraggingThis ? this.dragState.currY : oy + (p.r + 0.5) * cs;
      const isSelected = this.selectedPieceId === p.id || this.hint?.pieceId === p.id;
      this.drawOpticPiece(ctx, cx, cy, cs, p, isSelected, isDraggingThis);
      if (this.hint?.pieceId === p.id) {
        const pulse = 0.5 + 0.5 * Math.sin(this.time * 7);
        ctx.save();
        ctx.shadowBlur = 18 + pulse * 10;
        ctx.shadowColor = '#fde047';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, cs * 0.45 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  drawEmitter(ctx, ox, oy, cs) {
    const { r, c, dir } = this.level.emitter;
    const cx = ox + (c + 0.5) * cs;
    const cy = oy + (r + 0.5) * cs;
    const vec = DIR_VEC[dir];

    ctx.save();
    // Korpusas
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - cs * 0.36, cy - cs * 0.36, cs * 0.72, cs * 0.72, 10);
    ctx.fill();
    ctx.stroke();

    // Antgalis kryptimi
    ctx.fillStyle = '#f43f5e';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f43f5e';
    ctx.beginPath();
    ctx.arc(cx + vec.dc * cs * 0.28, cy + vec.dr * cs * 0.28, cs * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Šaltinio branduolys
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath();
    ctx.arc(cx, cy, cs * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCrystal(ctx, cx, cy, cs, isHit) {
    ctx.save();
    const s = cs * 0.34;
    if (isHit) {
      const pulse = 1 + 0.08 * Math.sin(this.time * 7);
      ctx.scale(pulse, pulse);
      cx /= pulse;
      cy /= pulse;
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#4ade80';
    }

    ctx.fillStyle = isHit ? '#22c55e' : '#065f46';
    ctx.strokeStyle = isHit ? '#bbf7d0' : '#34d399';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s * 0.8, cy - s * 0.15);
    ctx.lineTo(cx + s * 0.55, cy + s);
    ctx.lineTo(cx - s * 0.55, cy + s);
    ctx.lineTo(cx - s * 0.8, cy - s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vidinė briauna
    ctx.strokeStyle = isHit ? '#ffffff' : 'rgba(110, 231, 183, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx, cy + s);
    ctx.moveTo(cx - s * 0.8, cy - s * 0.15);
    ctx.lineTo(cx + s * 0.8, cy - s * 0.15);
    ctx.stroke();
    ctx.restore();
  }

  drawOpticPiece(ctx, cx, cy, cs, piece, isSelected, isDragging) {
    ctx.save();
    const box = cs * 0.78;
    const half = box / 2;

    if (isDragging) {
      ctx.globalAlpha = 0.88;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#38bdf8';
    }

    // Langelio rėmelis
    ctx.fillStyle = piece.kind === 'splitter' ? 'rgba(49, 46, 129, 0.92)' : 'rgba(30, 41, 59, 0.94)';
    ctx.strokeStyle = isSelected
      ? '#fde047'
      : piece.kind === 'splitter'
        ? '#c084fc'
        : this.level.movable
          ? '#38bdf8'
          : '#818cf8';
    ctx.lineWidth = isSelected ? 4 : 3;
    ctx.beginPath();
    ctx.roundRect(cx - half, cy - half, box, box, 10);
    ctx.fill();
    ctx.stroke();

    // 45° veidrodžio arba daliklio linija
    const bar = cs * 0.29;
    const x1 = piece.type === '/' ? cx - bar : cx - bar;
    const y1 = piece.type === '/' ? cy + bar : cy - bar;
    const x2 = piece.type === '/' ? cx + bar : cx + bar;
    const y2 = piece.type === '/' ? cy - bar : cy + bar;

    if (piece.kind === 'splitter') {
      // Daliklis: punktyrinė žydra-violetinė prizminė plokštelė
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#38bdf8';
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 6;
      ctx.setLineDash([7, 5]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Mažas prizmės ženklelis kampe
      ctx.fillStyle = '#e879f9';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText('SPLIT', cx - 15, cy - half + 13);
    } else {
      // Veidrodis: ryškus auksinis/sidabrinis atspindintis sluoksnis
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#facc15';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Jei elementas stumdomas (3 kl.) -> maži vilkimo taškeliai kampe
    if (this.level.movable) {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(cx + half - 7, cy + half - 7, 2.2, 0, Math.PI * 2);
      ctx.arc(cx + half - 13, cy + half - 7, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
