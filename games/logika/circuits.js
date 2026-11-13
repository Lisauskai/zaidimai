// ==================== SUJUNK GRANDINĘ (PATH & PIPE ROTATION) ====================
export const CIRCUIT_CANVAS_W = 640;
export const CIRCUIT_CANVAS_H = 440;

// Kryptys: 0 = U (viršus), 1 = R (dešinė), 2 = D (apačia), 3 = L (kairė)
const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];

function opp(dir) {
  return (dir + 2) % 4;
}

// Baziniai atviri prievadai prie rot = 0:
// I: [0, 2] (U, D)
// L: [0, 1] (U, R)
// T: [0, 1, 2] (U, R, D)
// B: [0, 1, 2, 3] (tiltas: U<->D ir R<->L nesimaišo)
export function getTilePorts(tile) {
  if (tile.kind === 'S' || tile.kind === 'F') return [tile.dir];
  if (tile.kind === 'B') return [0, 1, 2, 3];
  const r = ((tile.rot % 4) + 4) % 4;
  if (tile.kind === 'I') return [(0 + r) % 4, (2 + r) % 4];
  if (tile.kind === 'L') return [(0 + r) % 4, (1 + r) % 4];
  if (tile.kind === 'T') return [(0 + r) % 4, (1 + r) % 4, (2 + r) % 4];
  return [];
}

export function getTileExits(tile, enterSide) {
  if (tile.kind === 'B') {
    // Tiltas leidžia važiuoti tik tiesiai per tą pačią ašį
    return [opp(enterSide)];
  }
  const ports = getTilePorts(tile);
  if (!ports.includes(enterSide)) return [];
  return ports.filter((p) => p !== enterSide);
}

// Pagalbinė funkcija lygių aprašymui kompaktiškai
function makeGrid(rows, cols, overrides) {
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      const ov = overrides[key];
      if (ov) {
        tiles.push({ r, c, rot: 0, locked: false, star: false, ...ov });
      } else {
        tiles.push({ r, c, kind: (r + c) % 2 === 0 ? 'L' : 'I', rot: (r + c) % 4, locked: false, star: false });
      }
    }
  }
  return tiles;
}

export const CIRCUIT_LEVELS = {
  grade1: [
    {
      id: 'cir_g1_1',
      title: '1. Pirmieji bėgiai',
      instruction: 'Pasuk bėgių detales, surink ⭐ žvaigždutę ir paspausk „🚂 Paleisti!“, kad traukinukas pasiektų 🏁!',
      reward: 1,
      rows: 4,
      cols: 4,
      requireAllStars: true,
      tiles: makeGrid(4, 4, {
        '0,0': { kind: 'S', dir: 1, locked: true },
        '0,1': { kind: 'I', rot: 0 }, // reikia 1 (R-L)
        '0,2': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '1,2': { kind: 'I', rot: 1, star: true }, // reikia 0 (U-D)
        '2,2': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '2,3': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '3,3': { kind: 'F', dir: 0, locked: true }
      })
    },
    {
      id: 'cir_g1_2',
      title: '2. Kelias į viršų',
      instruction: 'Sujunk bėgius nuo 🚂 iki 🏁 taip, kad traukinukas pravažiuotų pro ⭐ žvaigždutę!',
      reward: 2,
      rows: 4,
      cols: 4,
      requireAllStars: true,
      tiles: makeGrid(4, 4, {
        '3,0': { kind: 'S', dir: 0, locked: true },
        '2,0': { kind: 'I', rot: 1 }, // reikia 0 (U-D)
        '1,0': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '1,1': { kind: 'T', rot: 1, star: true }, // reikia 3 (L-U-R) arba 0 (U-R-D)
        '0,1': { kind: 'L', rot: 0 }, // reikia 1 (R-D)
        '0,2': { kind: 'I', rot: 0 }, // reikia 1 (R-L)
        '0,3': { kind: 'F', dir: 3, locked: true }
      })
    },
    {
      id: 'cir_g1_3',
      title: '3. Dvi žvaigždutės',
      instruction: 'Aplenkiant kampus surink ABIDVI ⭐ žvaigždutes ir pasiek finišą 🏁!',
      reward: 2,
      rows: 4,
      cols: 4,
      requireAllStars: true,
      tiles: makeGrid(4, 4, {
        '0,0': { kind: 'S', dir: 2, locked: true },
        '1,0': { kind: 'I', rot: 1 }, // reikia 0 (U-D)
        '2,0': { kind: 'L', rot: 2, star: true }, // reikia 0 (U-R)
        '2,1': { kind: 'I', rot: 0 }, // reikia 1 (R-L)
        '2,2': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '1,2': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '1,3': { kind: 'L', rot: 0, star: true }, // reikia 2 (D-L)
        '2,3': { kind: 'I', rot: 1 }, // reikia 0 (U-D)
        '3,3': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '3,2': { kind: 'F', dir: 1, locked: true }
      })
    },
    {
      id: 'cir_g1_4',
      title: '4. Kalnų vingiai',
      instruction: 'Pasuk detales taip, kad traukinukas pakiltų į viršų, nusileistų žemyn ir surinktų 2 ⭐!',
      reward: 2,
      rows: 4,
      cols: 4,
      requireAllStars: true,
      tiles: makeGrid(4, 4, {
        '1,0': { kind: 'S', dir: 1, locked: true },
        '1,1': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '0,1': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '0,2': { kind: 'L', rot: 0, star: true }, // reikia 2 (D-L)
        '1,2': { kind: 'T', rot: 1 }, // reikia 0 ar 2 (U-D atviri!)
        '2,2': { kind: 'I', rot: 1 }, // reikia 0 (U-D)
        '3,2': { kind: 'L', rot: 2, star: true }, // reikia 0 (U-R)
        '3,3': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '2,3': { kind: 'I', rot: 1 }, // reikia 0 (U-D)
        '1,3': { kind: 'F', dir: 2, locked: true }
      })
    },
    {
      id: 'cir_g1_5',
      title: '5. Atgalinis ekspresas',
      instruction: 'Nutiesti kelią iš apatinio dešinio kampo į viršutinį kairį surenkant abi ⭐!',
      reward: 3,
      rows: 4,
      cols: 4,
      requireAllStars: true,
      tiles: makeGrid(4, 4, {
        '3,3': { kind: 'S', dir: 3, locked: true },
        '3,2': { kind: 'I', rot: 0 }, // reikia 1 (R-L)
        '3,1': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '2,1': { kind: 'L', rot: 3, star: true }, // reikia 1 (R-D)
        '2,2': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '1,2': { kind: 'I', rot: 1 }, // reikia 0 (U-D)
        '0,2': { kind: 'L', rot: 0, star: true }, // reikia 2 (D-L)
        '0,1': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '1,1': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '1,0': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '0,0': { kind: 'F', dir: 2, locked: true }
      })
    }
  ],
  grade3: [
    {
      id: 'cir_g3_1',
      title: '1. Tiltas per trasą',
      instruction: 'Pravažiuok per 🌉 tiltą du kartus, apeik 🔒 užrakintas detales ir surink VISAS 3 ⭐!',
      reward: 1,
      rows: 6,
      cols: 6,
      requireAllStars: true,
      tiles: makeGrid(6, 6, {
        '2,0': { kind: 'S', dir: 1, locked: true },
        '2,1': { kind: 'I', rot: 1, locked: true },
        '2,2': { kind: 'B', rot: 0, locked: true },
        '2,3': { kind: 'I', rot: 0 }, // reikia 1
        '2,4': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '1,4': { kind: 'I', rot: 1, star: true }, // reikia 0 (U-D)
        '0,4': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '0,3': { kind: 'I', rot: 0 }, // reikia 1
        '0,2': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '1,2': { kind: 'I', rot: 0, locked: true, star: true },
        '3,2': { kind: 'L', rot: 1 }, // reikia 3 (U-L)
        '3,1': { kind: 'L', rot: 3, star: true }, // reikia 1 (R-D)
        '4,1': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '4,2': { kind: 'I', rot: 1, locked: true },
        '4,3': { kind: 'I', rot: 0 }, // reikia 1
        '4,4': { kind: 'I', rot: 0 }, // reikia 1
        '4,5': { kind: 'F', dir: 3, locked: true }
      })
    },
    {
      id: 'cir_g3_2',
      title: '2. Žvaigždžių kilpa',
      instruction: 'Užrakinta 🔒 posūkio detalė rodo kryptį – sujunk trasą per tiltą ir visas 3 ⭐ žvaigždutes!',
      reward: 2,
      rows: 6,
      cols: 6,
      requireAllStars: true,
      tiles: makeGrid(6, 6, {
        '0,3': { kind: 'S', dir: 2, locked: true },
        '1,3': { kind: 'I', rot: 1 }, // reikia 0
        '2,3': { kind: 'I', rot: 1, star: true }, // reikia 0
        '3,3': { kind: 'B', rot: 0, locked: true },
        '4,3': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '4,4': { kind: 'I', rot: 0 }, // reikia 1 (R-L)
        '4,5': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '3,5': { kind: 'L', rot: 2, locked: true, star: true }, // D-L
        '3,4': { kind: 'I', rot: 0 }, // reikia 1
        '3,2': { kind: 'I', rot: 0 }, // reikia 1
        '3,1': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '4,1': { kind: 'I', rot: 1, star: true }, // reikia 0
        '5,1': { kind: 'L', rot: 1 }, // reikia 3 (U-L)
        '5,0': { kind: 'F', dir: 1, locked: true }
      })
    },
    {
      id: 'cir_g3_3',
      title: '3. Dvigubas tiltų labirintas',
      instruction: 'Šioje schemoje yra NET DU 🌉 tiltai! Sujunk bėgius per abu tiltus ir visas 3 ⭐.',
      reward: 2,
      rows: 6,
      cols: 6,
      requireAllStars: true,
      tiles: makeGrid(6, 6, {
        '5,1': { kind: 'S', dir: 0, locked: true },
        '4,1': { kind: 'I', rot: 1, star: true }, // reikia 0
        '3,1': { kind: 'I', rot: 1 }, // reikia 0
        '2,1': { kind: 'B', rot: 0, locked: true },
        '1,1': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '1,2': { kind: 'I', rot: 0 }, // reikia 1
        '1,3': { kind: 'I', rot: 0 }, // reikia 1
        '1,4': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '2,4': { kind: 'B', rot: 0, locked: true },
        '3,4': { kind: 'L', rot: 2, star: true }, // reikia 0 (U-R)
        '3,5': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '2,5': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '2,3': { kind: 'I', rot: 1, locked: true, star: true }, // R-L
        '2,2': { kind: 'I', rot: 0 }, // reikia 1
        '2,0': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '1,0': { kind: 'I', rot: 1 }, // reikia 0
        '0,0': { kind: 'F', dir: 2, locked: true }
      })
    },
    {
      id: 'cir_g3_4',
      title: '4. Atsargiai – spąstai!',
      instruction: 'Trumpiausias kelias praleidžia trečią ⭐! Apeik viršutiniu lanku per tiltą, kad surinktum VISAS 3 ⭐!',
      reward: 2,
      rows: 6,
      cols: 6,
      requireAllStars: true,
      tiles: makeGrid(6, 6, {
        '0,0': { kind: 'S', dir: 1, locked: true },
        '0,1': { kind: 'L', rot: 0, star: true }, // reikia 2 (D-L)
        '1,1': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '1,2': { kind: 'I', rot: 0 }, // reikia 1
        '1,3': { kind: 'B', rot: 0, locked: true },
        '1,4': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '2,4': { kind: 'I', rot: 1, star: true }, // reikia 0
        '3,4': { kind: 'T', rot: 1 }, // gali suvilioti dešinėn, reikia L-U (rot 2 arba 3)
        '3,3': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '2,3': { kind: 'I', rot: 1 }, // reikia 0 (U-D per tiltą!)
        '0,3': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '0,4': { kind: 'I', rot: 1, locked: true }, // R-L
        '0,5': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '1,5': { kind: 'I', rot: 1 }, // reikia 0
        '2,5': { kind: 'I', rot: 1, star: true }, // reikia 0
        '3,5': { kind: 'I', rot: 1 }, // reikia 0
        '4,5': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '4,4': { kind: 'F', dir: 1, locked: true }
      })
    },
    {
      id: 'cir_g3_5',
      title: '5. Didysis laboratorijos ekspresas',
      instruction: 'Paskutinė užduotis! Sujunk didįjį tinklą per užrakintus 🔒 taškus ir tiltus, kad surinktum 3 ⭐!',
      reward: 3,
      rows: 6,
      cols: 6,
      requireAllStars: true,
      tiles: makeGrid(6, 6, {
        '3,0': { kind: 'S', dir: 1, locked: true },
        '3,1': { kind: 'B', rot: 0, locked: true },
        '3,2': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '4,2': { kind: 'I', rot: 0, locked: true, star: true }, // U-D
        '5,2': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '5,3': { kind: 'I', rot: 0 }, // reikia 1
        '5,4': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '4,4': { kind: 'B', rot: 0, locked: true },
        '3,4': { kind: 'I', rot: 1 }, // reikia 0
        '2,4': { kind: 'I', rot: 1 }, // reikia 0
        '1,4': { kind: 'L', rot: 0, star: true }, // reikia 2 (D-L)
        '1,3': { kind: 'L', rot: 2 }, // reikia 0 (U-R)
        '0,3': { kind: 'L', rot: 0 }, // reikia 2 (D-L)
        '0,2': { kind: 'I', rot: 1, locked: true }, // R-L
        '0,1': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '1,1': { kind: 'I', rot: 0, locked: true, star: true }, // U-D
        '2,1': { kind: 'I', rot: 1 }, // reikia 0
        '4,1': { kind: 'L', rot: 1 }, // reikia 3 (L-U)
        '4,0': { kind: 'L', rot: 3 }, // reikia 1 (R-D)
        '5,0': { kind: 'F', dir: 0, locked: true }
      })
    }
  ]
};

export function analyzeCircuit(level, tiles) {
  const { rows, cols } = level;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  let startTile = null;
  let finishTile = null;
  const allStarKeys = new Set();

  tiles.forEach((t) => {
    grid[t.r][t.c] = t;
    if (t.kind === 'S') startTile = t;
    if (t.kind === 'F') finishTile = t;
    if (t.star) allStarKeys.add(`${t.r},${t.c}`);
  });

  if (!startTile || !finishTile) {
    return { reachableKeys: new Set(), winPath: null, finishPathMissingStars: null, longestPath: [] };
  }

  // 1. Prieinamos detalės gyvam švytėjimui
  const reachableKeys = new Set([`${startTile.r},${startTile.c}`]);
  const bfsVisited = new Set();
  const bfsQueue = [];

  const firstR = startTile.r + DR[startTile.dir];
  const firstC = startTile.c + DC[startTile.dir];
  if (firstR >= 0 && firstR < rows && firstC >= 0 && firstC < cols) {
    const enterSide = opp(startTile.dir);
    bfsQueue.push({ r: firstR, c: firstC, enterSide });
    bfsVisited.add(`${firstR},${firstC},${enterSide}`);
  }

  while (bfsQueue.length > 0) {
    const { r, c, enterSide } = bfsQueue.shift();
    const tile = grid[r][c];
    if (!tile) continue;

    if (tile.kind === 'F') {
      if (tile.dir === enterSide) reachableKeys.add(`${r},${c}`);
      continue;
    }

    const exits = getTileExits(tile, enterSide);
    if (exits.length === 0 && enterSide !== null) {
      // Patikriname ar apskritai prisijungia prie enterSide
      if (!getTilePorts(tile).includes(enterSide)) continue;
    }
    if (!getTilePorts(tile).includes(enterSide)) continue;

    reachableKeys.add(`${r},${c}`);

    exits.forEach((exitDir) => {
      const nr = r + DR[exitDir];
      const nc = c + DC[exitDir];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
      const nEnter = opp(exitDir);
      const nTile = grid[nr][nc];
      if (!getTilePorts(nTile).includes(nEnter)) return;
      const key = `${nr},${nc},${nEnter}`;
      if (!bfsVisited.has(key)) {
        bfsVisited.add(key);
        bfsQueue.push({ r: nr, c: nc, enterSide: nEnter });
      }
    });
  }

  // 2. DFS ieškant kelio nuo Starto iki Finišo (ir ilgiausio kelio jei nutrūksta)
  let winPath = null;
  let finishPathMissingStars = null;
  let longestPath = [{ r: startTile.r, c: startTile.c }];
  const usedSegments = new Set(); // "r,c,enterSide" (kad tiltas galėtų būti kirstas H ir V atskirai)

  function dfs(r, c, enterSide, path, starsHit) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const tile = grid[r][c];
    if (!tile) return;

    if (tile.kind === 'F') {
      if (tile.dir === enterSide) {
        const fullPath = [...path, { r, c }];
        if (starsHit.size === allStarKeys.size || !level.requireAllStars) {
          if (!winPath || fullPath.length < winPath.length) {
            winPath = fullPath;
          }
        } else if (!finishPathMissingStars || starsHit.size > finishPathMissingStars.starsCount) {
          finishPathMissingStars = { path: fullPath, starsCount: starsHit.size };
        }
      }
      return;
    }

    const segKey = tile.kind === 'B' ? `${r},${c},${enterSide % 2}` : `${r},${c}`;
    if (usedSegments.has(segKey)) return;
    const exits = getTileExits(tile, enterSide);
    if (exits.length === 0) return;

    usedSegments.add(segKey);
    const nextPath = [...path, { r, c }];
    const nextStars = new Set(starsHit);
    if (tile.star) nextStars.add(`${r},${c}`);

    if (nextPath.length > longestPath.length) {
      longestPath = nextPath;
    }

    for (const exitDir of exits) {
      const nr = r + DR[exitDir];
      const nc = c + DC[exitDir];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nEnter = opp(exitDir);
      const nTile = grid[nr][nc];
      if (!getTilePorts(nTile).includes(nEnter)) continue;
      dfs(nr, nc, nEnter, nextPath, nextStars);
    }

    usedSegments.delete(segKey);
  }

  if (firstR >= 0 && firstR < rows && firstC >= 0 && firstC < cols) {
    const enterSide = opp(startTile.dir);
    const firstTile = grid[firstR][firstC];
    if (getTilePorts(firstTile).includes(enterSide)) {
      dfs(firstR, firstC, enterSide, [{ r: startTile.r, c: startTile.c }], new Set());
    }
  }

  return {
    reachableKeys,
    winPath,
    finishPathMissingStars,
    longestPath,
    totalStars: allStarKeys.size
  };
}

export class CircuitEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.rafId = null;
    this.time = 0;
    this.trainAnim = null; // { path, progress, won, reason, collectedStars: Set }
    this.shakeTimer = 0;
    this.shakeCell = null;

    this.computeLayout();
    this.reset();
  }

  computeLayout() {
    const padX = 28;
    const padY = 20;
    const maxW = CIRCUIT_CANVAS_W - padX * 2;
    const maxH = CIRCUIT_CANVAS_H - padY * 2;
    this.cellSize = Math.floor(Math.min(maxW / this.level.cols, maxH / this.level.rows));
    this.originX = Math.floor((CIRCUIT_CANVAS_W - this.cellSize * this.level.cols) / 2);
    this.originY = Math.floor((CIRCUIT_CANVAS_H - this.cellSize * this.level.rows) / 2);
  }

  reset() {
    this.tiles = this.level.tiles.map((t) => ({
      ...t,
      visualAngle: (t.rot || 0) * (Math.PI / 2),
      targetAngle: (t.rot || 0) * (Math.PI / 2)
    }));
    this.trainAnim = null;
    this.recompute();
  }

  recompute() {
    this.analysis = analyzeCircuit(this.level, this.tiles);
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        readyToWin: !!this.analysis.winPath,
        totalStars: this.analysis.totalStars,
        collectedStars: 0,
        running: !!this.trainAnim
      });
    }
  }

  handlePointerDown(mx, my) {
    if (this.trainAnim) return; // Kol važiuoja traukinukas, neleidžiame sukioti
    const c = Math.floor((mx - this.originX) / this.cellSize);
    const r = Math.floor((my - this.originY) / this.cellSize);
    if (r < 0 || r >= this.level.rows || c < 0 || c >= this.level.cols) return;

    const tile = this.tiles.find((t) => t.r === r && t.c === c);
    if (!tile) return;

    if (tile.locked || tile.kind === 'S' || tile.kind === 'F' || tile.kind === 'B') {
      this.shakeCell = `${r},${c}`;
      this.shakeTimer = 0.28;
      return;
    }

    tile.rot = ((tile.rot || 0) + 1) % 4;
    tile.targetAngle += Math.PI / 2;
    this.recompute();
  }

  launchTrain() {
    this.recompute();
    const an = this.analysis;
    let chosenPath = an.longestPath;
    let won = false;
    let reason = '⚠️ Kelias nutrūko! Pasuk bėgius taip, kad traukinukas pasiektų finišą 🏁.';

    if (an.winPath) {
      chosenPath = an.winPath;
      won = true;
      reason = '';
    } else if (an.finishPathMissingStars) {
      chosenPath = an.finishPathMissingStars.path;
      reason = `⭐ Traukinukas pasiekė finišą, bet surinko tik ${an.finishPathMissingStars.starsCount} / ${an.totalStars} žvaigždučių! Surink VISAS ⭐!`;
    }

    this.trainAnim = {
      path: chosenPath,
      progress: 0,
      speed: Math.max(3.6, chosenPath.length * 0.45), // langelių per sekundę
      won,
      reason,
      collectedStars: new Set(),
      finishedWait: 0,
      notified: false
    };

    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        readyToWin: won,
        totalStars: an.totalStars,
        collectedStars: 0,
        running: true
      });
    }
  }

  startLoop() {
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
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

  update(dt) {
    this.time += dt;
    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    }

    // Sklandus 90° pasukimo interpoliavimas
    this.tiles.forEach((t) => {
      const diff = t.targetAngle - t.visualAngle;
      if (Math.abs(diff) > 0.005) {
        t.visualAngle += diff * Math.min(1, dt * 16);
      } else {
        t.visualAngle = t.targetAngle;
      }
    });

    if (this.trainAnim) {
      const anim = this.trainAnim;
      const maxIdx = Math.max(0, anim.path.length - 1);
      if (anim.progress < maxIdx) {
        anim.progress = Math.min(maxIdx, anim.progress + anim.speed * dt);
        const curIdx = Math.floor(anim.progress + 0.35);
        for (let i = 0; i <= Math.min(curIdx, maxIdx); i++) {
          const step = anim.path[i];
          const tile = this.tiles.find((t) => t.r === step.r && t.c === step.c);
          if (tile && tile.star && !anim.collectedStars.has(`${tile.r},${tile.c}`)) {
            anim.collectedStars.add(`${tile.r},${tile.c}`);
            if (this.callbacks.onStatusChange) {
              this.callbacks.onStatusChange({
                readyToWin: anim.won,
                totalStars: this.analysis.totalStars,
                collectedStars: anim.collectedStars.size,
                running: true
              });
            }
          }
        }
      } else {
        anim.finishedWait += dt;
        if (!anim.notified && anim.finishedWait >= 0.25) {
          anim.notified = true;
          const result = {
            won: anim.won,
            reason: anim.reason,
            starsCollected: anim.collectedStars.size,
            totalStars: this.analysis.totalStars
          };
          if (!anim.won) {
            this.trainAnim = null;
          }
          if (this.callbacks.onRunResult) {
            this.callbacks.onRunResult(result);
          }
        }
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const cs = this.cellSize;
    const ox = this.originX;
    const oy = this.originY;

    ctx.clearRect(0, 0, CIRCUIT_CANVAS_W, CIRCUIT_CANVAS_H);

    // Fonas
    const bg = ctx.createLinearGradient(0, 0, 0, CIRCUIT_CANVAS_H);
    bg.addColorStop(0, '#020617');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CIRCUIT_CANVAS_W, CIRCUIT_CANVAS_H);

    // Piešiame visas detales
    this.tiles.forEach((tile) => {
      const x = ox + tile.c * cs;
      const y = oy + tile.r * cs;
      const cx = x + cs / 2;
      const cy = y + cs / 2;
      const isLit = this.analysis.reachableKeys.has(`${tile.r},${tile.c}`);
      const isShaking = this.shakeTimer > 0 && this.shakeCell === `${tile.r},${tile.c}`;
      const shakeX = isShaking ? Math.sin(this.shakeTimer * 45) * 3 : 0;

      ctx.save();
      ctx.translate(cx + shakeX, cy);

      // Langelio plokštelė
      const half = cs / 2 - 3;
      ctx.fillStyle = tile.locked ? '#1e293b' : '#172554';
      ctx.strokeStyle = isLit ? '#38bdf8' : tile.locked ? '#475569' : '#312e81';
      ctx.lineWidth = isLit ? 2.5 : 2;
      ctx.beginPath();
      ctx.roundRect(-half, -half, half * 2, half * 2, 8);
      ctx.fill();
      ctx.stroke();

      // Bėgių / laidų piešimas
      if (tile.kind === 'B') {
        this.drawBridgeTile(ctx, cs, isLit);
      } else if (tile.kind === 'S' || tile.kind === 'F') {
        this.drawEndpointTile(ctx, cs, tile, isLit);
      } else {
        ctx.save();
        ctx.rotate(tile.visualAngle);
        this.drawTrackShape(ctx, cs, tile.kind, isLit);
        ctx.restore();
      }

      // Užrakto ženklas
      if (tile.locked && tile.kind !== 'S' && tile.kind !== 'F' && tile.kind !== 'B') {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 12px Nunito, sans-serif';
        ctx.fillText('🔒', half - 17, -half + 15);
      }

      // Žvaigždutė ant bėgio (jei dar nesurinkta)
      const collected = this.trainAnim?.collectedStars.has(`${tile.r},${tile.c}`);
      if (tile.star && !collected) {
        const bob = Math.sin(this.time * 5 + tile.r + tile.c) * 2;
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#facc15';
        ctx.fillStyle = '#fde047';
        ctx.font = `${Math.floor(cs * 0.34)}px Nunito, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, bob);
        ctx.restore();
      }

      ctx.restore();
    });

    // Traukinuko animacija
    if (this.trainAnim && this.trainAnim.path.length > 0) {
      this.drawTrain(ctx, ox, oy, cs);
    }
  }

  drawRailSegment(ctx, x1, y1, x2, y2, isLit) {
    // Pabėgiai (skersiniai)
    const len = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.floor(len / 14));
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      const nx = -(y2 - y1) / len;
      const ny = (x2 - x1) / len;
      ctx.beginPath();
      ctx.moveTo(px - nx * 9, py - ny * 9);
      ctx.lineTo(px + nx * 9, py + ny * 9);
      ctx.stroke();
    }

    // Pagrindinė energijos/bėgio linija
    ctx.save();
    if (isLit) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#22d3ee';
    }
    ctx.strokeStyle = isLit ? '#38bdf8' : '#94a3b8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = isLit ? '#e0f2fe' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  drawTrackShape(ctx, cs, kind, isLit) {
    const h = cs / 2 - 2;
    if (kind === 'I') {
      this.drawRailSegment(ctx, 0, -h, 0, h, isLit);
    } else if (kind === 'L') {
      this.drawRailSegment(ctx, 0, -h, 0, 0, isLit);
      this.drawRailSegment(ctx, 0, 0, h, 0, isLit);
    } else if (kind === 'T') {
      this.drawRailSegment(ctx, 0, -h, 0, h, isLit);
      this.drawRailSegment(ctx, 0, 0, h, 0, isLit);
    }
  }

  drawBridgeTile(ctx, cs, isLit) {
    const h = cs / 2 - 2;
    // Apatinis kelias (vertikalus)
    this.drawRailSegment(ctx, 0, -h, 0, h, isLit);

    // Tilto perdanga (tarpas tarp vertikalaus ir horizontalaus)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-h, -11, h * 2, 22);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-h + 4, -11);
    ctx.lineTo(h - 4, -11);
    ctx.moveTo(-h + 4, 11);
    ctx.lineTo(h - 4, 11);
    ctx.stroke();

    // Viršutinis kelias (horizontalus)
    this.drawRailSegment(ctx, -h, 0, h, 0, isLit);
  }

  drawEndpointTile(ctx, cs, tile, isLit) {
    const h = cs / 2 - 2;
    const dx = DC[tile.dir];
    const dy = DR[tile.dir];
    this.drawRailSegment(ctx, 0, 0, dx * h, dy * h, true);

    ctx.save();
    ctx.fillStyle = tile.kind === 'S' ? '#1d4ed8' : isLit ? '#15803d' : '#7f1d1d';
    ctx.strokeStyle = tile.kind === 'S' ? '#60a5fa' : isLit ? '#4ade80' : '#f87171';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, cs * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `${Math.floor(cs * 0.34)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tile.kind === 'S' ? '🚂' : '🏁', 0, 1);
    ctx.restore();
  }

  drawTrain(ctx, ox, oy, cs) {
    const anim = this.trainAnim;
    const p = anim.progress;
    const i0 = Math.floor(p);
    const i1 = Math.min(anim.path.length - 1, i0 + 1);
    const frac = p - i0;
    const c0 = anim.path[i0];
    const c1 = anim.path[i1];

    const tx = ox + (c0.c + (c1.c - c0.c) * frac + 0.5) * cs;
    const ty = oy + (c0.r + (c1.r - c0.r) * frac + 0.5) * cs;

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#facc15';
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(tx, ty, cs * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `${Math.floor(cs * 0.32)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚂', tx, ty + 1);
    ctx.restore();
  }
}
