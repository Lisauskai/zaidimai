// ==================== „ROBO-STUMDUKAS“ (GRID SOKOBAN) VARIKLIUKAS IR 10 LYGIŲ ====================
// Legenda:
// '#' = siena, '.' = grindys, 'R' = robotas, 'C' = energijos kubas,
// 'T' = šviečiantis mygtukas, 'E' = išėjimo vartai (atsidaro kai visi kubai ant T),
// 'I' = ledas (užstumtas kubas slysta ledu, kol atsitrenkia į kliūtį/sieną),
// '>', '<', '^', 'v' = vienkrypčiai vartai.

const GATE_DIRS = {
  '>': { dr: 0, dc: 1 },
  '<': { dr: 0, dc: -1 },
  '^': { dr: -1, dc: 0 },
  'v': { dr: 1, dc: 0 }
};

export const SOKOBAN_LEVELS = {
  grade1: [
    {
      id: 'sok_g1_1',
      title: '1. Pirmasis kubas',
      instruction: 'Užstumk energijos kubą (⚡) ant šviečiančio mygtuko (🔘) ir ženk pro atsidariusius vartus (🚪)!',
      reward: 1,
      map: [
        '#####',
        '#R.E#',
        '#.C.#',
        '#..T#',
        '#####'
      ]
    },
    {
      id: 'sok_g1_2',
      title: '2. Aplink koloną',
      instruction: 'Apeik laboratorijos sieną, nustumk kubą ant mygtuko ir išeik pro vartus.',
      reward: 2,
      map: [
        '######',
        '#R...#',
        '#.C#.#',
        '#T..E#',
        '######'
      ]
    },
    {
      id: 'sok_g1_3',
      title: '3. Du generatoriai',
      instruction: 'Užstumk abu energijos kubus ant mygtukų – tada atsidarys išėjimo vartai!',
      reward: 2,
      map: [
        '######',
        '#R..T#',
        '#.CC.#',
        '#..TE#',
        '######'
      ]
    },
    {
      id: 'sok_g1_4',
      title: '4. Didžioji salė',
      instruction: 'Suplanuok ėjimus, kad abu kubai atsidurtų apačioje ant šviečiančių mygtukų.',
      reward: 2,
      map: [
        '######',
        '#R...#',
        '#.C..#',
        '#..C.#',
        '#.TTE#',
        '######'
      ]
    },
    {
      id: 'sok_g1_5',
      title: '5. Laboratorijos kampas',
      instruction: 'Stumk kubus atsargiai po vieną – jei suklysi, spausk „Atšaukti ėjimą (Undo)“!',
      reward: 3,
      map: [
        '######',
        '#R.T.#',
        '#.C#.#',
        '#..C.#',
        '#T..E#',
        '######'
      ]
    }
  ],

  grade3: [
    {
      id: 'sok_g3_1',
      title: '1. Ledo takelis',
      instruction: 'Užstumtas ant ledo (❄️) kubas slysta tol, kol atsitrenkia į sieną! Užstumk visus 3 kubus.',
      reward: 1,
      map: [
        '#######',
        '#R....#',
        '#.CIIT#',
        '#..C..#',
        '#..T.E#',
        '#.C..T#',
        '#######'
      ]
    },
    {
      id: 'sok_g3_2',
      title: '2. Vienkrypčiai vartai',
      instruction: 'Vartai (➡️) praleidžia TIK į dešinę! Perstumk vieną kubą per vartus ir panaudok ledą.',
      reward: 2,
      map: [
        '#######',
        '#R..#T#',
        '#.C>..#',
        '#.....#',
        '#.CIIT#',
        '#T.C.E#',
        '#######'
      ]
    },
    {
      id: 'sok_g3_3',
      title: '3. Dvigubas čiuožimas',
      instruction: 'Du ledo koridoriai ir vienkrypčiai vartai (➡️) – nustatyk teisingą eiliškumą!',
      reward: 2,
      map: [
        '########',
        '#R.....#',
        '#.CIIT.#',
        '#..##..#',
        '#.CIIT.#',
        '#.C>.T.#',
        '#.....E#',
        '########'
      ]
    },
    {
      id: 'sok_g3_4',
      title: '4. Keturios jėgainės',
      instruction: '4 energijos kubai, ledas ir vartai (⬇️). Pravesk viršutinį kubą pro ⬇️ ir užbaik grandinę!',
      reward: 2,
      map: [
        '#######',
        '#R....#',
        '#.C.C.#',
        '#.#v#.#',
        '#.CIIT#',
        '#TT.CT#',
        '#....E#',
        '#######'
      ]
    },
    {
      id: 'sok_g3_5',
      title: '5. Vyriausiojo inžinieriaus testas',
      instruction: '4 kubai, slidus ledas ir dveji vienkrypčiai vartai! Atverk išėjimo vartus (🚪).',
      reward: 3,
      map: [
        '########',
        '#R.....#',
        '#..C>IT#',
        '#..#.#.#',
        '#.CIIT.#',
        '#C.vC..#',
        '#T..T.E#',
        '########'
      ]
    }
  ]
};

export function parseSokobanLevel(levelDef) {
  const rows = levelDef.map.length;
  const cols = levelDef.map[0].length;
  const grid = [];
  const targets = [];
  const cubes = [];
  let robot = { r: 1, c: 1 };
  let exit = { r: rows - 2, c: cols - 2 };

  for (let r = 0; r < rows; r++) {
    const rowArr = [];
    for (let c = 0; c < cols; c++) {
      const ch = levelDef.map[r][c];
      if (ch === '#') {
        rowArr.push('#');
      } else if (ch === 'I') {
        rowArr.push('I');
      } else if (GATE_DIRS[ch]) {
        rowArr.push(ch);
      } else if (ch === 'E') {
        rowArr.push('E');
        exit = { r, c };
      } else if (ch === 'T') {
        rowArr.push('T');
        targets.push({ r, c });
      } else {
        rowArr.push('.');
        if (ch === 'R') robot = { r, c };
        if (ch === 'C') cubes.push({ r, c });
      }
    }
    grid.push(rowArr);
  }

  return { rows, cols, grid, targets, cubes, robot, exit };
}

export class SokobanGame {
  constructor(levelDef) {
    this.levelDef = levelDef;
    this.reset();
  }

  reset() {
    const parsed = parseSokobanLevel(this.levelDef);
    this.rows = parsed.rows;
    this.cols = parsed.cols;
    this.grid = parsed.grid;
    this.targets = parsed.targets;
    this.exit = parsed.exit;
    this.robot = { ...parsed.robot };
    this.cubes = parsed.cubes.map((c) => ({ ...c }));
    this.history = [];
    this.moves = 0;
    this.won = false;
  }

  cubeIndexAt(r, c) {
    return this.cubes.findIndex((cb) => cb.r === r && cb.c === c);
  }

  isWalkableTile(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
    return this.grid[r][c] !== '#';
  }

  allowsDirection(r, c, dr, dc) {
    const tile = this.grid[r][c];
    const gDir = GATE_DIRS[tile];
    if (!gDir) return true;
    return gDir.dr === dr && gDir.dc === dc;
  }

  areAllTargetsCovered() {
    return this.targets.every((t) => this.cubeIndexAt(t.r, t.c) >= 0);
  }

  getCoveredCount() {
    return this.targets.filter((t) => this.cubeIndexAt(t.r, t.c) >= 0).length;
  }

  move(dr, dc) {
    if (this.won) return false;
    const nr = this.robot.r + dr;
    const nc = this.robot.c + dc;

    if (!this.isWalkableTile(nr, nc)) return false;
    // Jei dabartinis arba naujas langelis yra vienkrypčiai vartai – leidžiame tik vartų kryptimi
    if (!this.allowsDirection(this.robot.r, this.robot.c, dr, dc)) return false;
    if (!this.allowsDirection(nr, nc, dr, dc)) return false;

    const hitCubeIdx = this.cubeIndexAt(nr, nc);
    if (hitCubeIdx >= 0) {
      let cr = nr + dr;
      let cc = nc + dc;
      if (!this.isWalkableTile(cr, cc)) return false;
      if (!this.allowsDirection(cr, cc, dr, dc)) return false;
      if (this.cubeIndexAt(cr, cc) >= 0) return false;

      // Jei kubas patenka ant ledo ('I'), jis slysta toliau, kol atsitrenkia į sieną ar kitą kubą!
      while (this.grid[cr][cc] === 'I') {
        const nextR = cr + dr;
        const nextC = cc + dc;
        if (!this.isWalkableTile(nextR, nextC)) break;
        if (!this.allowsDirection(nextR, nextC, dr, dc)) break;
        if (this.cubeIndexAt(nextR, nextC) >= 0) break;
        cr = nextR;
        cc = nextC;
      }

      this.saveSnapshot();
      this.cubes[hitCubeIdx] = { r: cr, c: cc };
      this.robot = { r: nr, c: nc };
      this.moves++;
    } else {
      this.saveSnapshot();
      this.robot = { r: nr, c: nc };
      this.moves++;
    }

    if (this.areAllTargetsCovered() && this.robot.r === this.exit.r && this.robot.c === this.exit.c) {
      this.won = true;
    }
    return true;
  }

  saveSnapshot() {
    this.history.push({
      robot: { ...this.robot },
      cubes: this.cubes.map((c) => ({ ...c })),
      moves: this.moves
    });
  }

  undo() {
    if (this.history.length === 0) return false;
    const prev = this.history.pop();
    this.robot = prev.robot;
    this.cubes = prev.cubes;
    this.moves = prev.moves;
    this.won = false;
    return true;
  }
}
