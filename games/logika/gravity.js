// ==================== 9. GRAVITACIJOS LABIRINTAS (TILT & SLIDE) ====================
export const GRAVITY_CANVAS_W = 540;
export const GRAVITY_CANVAS_H = 440;

const DIR_VEC = {
  U: { dr: -1, dc: 0, tiltAngle: -0.025, dx: 0, dy: -5 },
  D: { dr: 1, dc: 0, tiltAngle: 0.025, dx: 0, dy: 5 },
  L: { dr: 0, dc: -1, tiltAngle: -0.025, dx: -5, dy: 0 },
  R: { dr: 0, dc: 1, tiltAngle: 0.025, dx: 5, dy: 0 }
};

export const GRAVITY_LEVELS = {
  grade1: [
    {
      id: 'grv_g1_1',
      title: '1. Pirmoji ledo čiuožykla',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Pakreipk lauką (rodyklėmis ar mygtukais), surink ⭐ ir sustok tiksliai ant teleportacijos platformos 🌀!',
      reward: 1,
      masterMoves: 3,
      size: 6,
      grid: [
        '######',
        '#O.S.#',
        '#....#',
        '#....#',
        '##F..#',
        '######'
      ]
    },
    {
      id: 'grv_g1_2',
      title: '2. Ledinis kampas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Rutulys sustoja tik atsitrenkęs į sieną! Surask optimalų kelią per ⭐ iki 🌀.',
      reward: 1,
      masterMoves: 4,
      size: 6,
      grid: [
        '######',
        '##O..#',
        '#F...#',
        '#..#.#',
        '#..S.#',
        '######'
      ]
    },
    {
      id: 'grv_g1_3',
      title: '3. Dvi žvaigždutės',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Surink abi ⭐ pakeliui ir tiksliai sustok ant 🌀 platformos!',
      reward: 1,
      masterMoves: 4,
      size: 6,
      grid: [
        '######',
        '#O.S.#',
        '#.#..#',
        '#.F.S#',
        '##...#',
        '######'
      ]
    },
    {
      id: 'grv_g1_4',
      title: '4. Spiralinis slydimas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Čiuožk ratu palei sienas per abi žvaigždutes iki centro platformos!',
      reward: 2,
      masterMoves: 5,
      size: 6,
      grid: [
        '######',
        '#..S.#',
        '#.#F.#',
        '#...##',
        '#.S.O#',
        '######'
      ]
    },
    {
      id: 'grv_g1_5',
      title: '5. Ledo meistras',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Atkreipk dėmesį į vidines sienas – jos padės sustoti reikiamame langelyje!',
      reward: 2,
      masterMoves: 5,
      size: 6,
      grid: [
        '######',
        '##.S.#',
        '#..#.#',
        '#S..F#',
        '#O..##',
        '######'
      ]
    },
    {
      id: 'grv_g1_6',
      title: '6. Lipnus kilimėlis 🧲',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Nauja detalė! Užvažiavęs ant violetinio lipnaus kilimėlio 🧲, rutulys sustoja viduryje lauko!',
      reward: 2,
      masterMoves: 5,
      size: 6,
      grid: [
        '######',
        '#O..S#',
        '#..X.#',
        '##...#',
        '#..F.#',
        '######'
      ]
    },
    {
      id: 'grv_g1_7',
      title: '7. Dvigubas magnetas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Sustok ant pirmojo 🧲, paimk ⭐ ir per antrą 🧲 nusitaikyk tiesiai į 🌀!',
      reward: 2,
      masterMoves: 6,
      size: 6,
      grid: [
        '######',
        '#O..##',
        '#..XS#',
        '##.#.#',
        '#FX..#',
        '######'
      ]
    },
    {
      id: 'grv_g1_8',
      title: '8. Geltonasis jungiklis 🟡',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Praslysk per geltoną jungiklį 🟡, kad atsidarytų geltona užtvara 🟨 prieš finišą!',
      reward: 2,
      masterMoves: 4,
      size: 6,
      grid: [
        '######',
        '#O..S#',
        '#.#..#',
        '#..#Y#',
        '#y.#F#',
        '######'
      ]
    },
    {
      id: 'grv_g1_9',
      title: '9. Kilimėlis ir užtvara',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: 'Sujunk lipnų 🧲 kilimėlį su geltonu 🟡 jungikliu, kad paimtum abi ⭐ ir atvertum kelią į 🌀!',
      reward: 3,
      masterMoves: 6,
      size: 6,
      grid: [
        '######',
        '#O.S.#',
        '#X.#y#',
        '#.S.Y#',
        '#.#.F#',
        '######'
      ]
    },
    {
      id: 'grv_g1_10',
      title: '10. Kosminis teleportas 🔵',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 1 KL.',
      instruction: '1 klasės finalas! Įskriek į mėlyną portalą 🔵, įjunk 🟡 ir per 🧲 pasiek finišą 🌀!',
      reward: 3,
      masterMoves: 4,
      size: 6,
      grid: [
        '######',
        '#O.A##',
        '##X..#',
        '#Ay.##',
        '#S.YF#',
        '######'
      ]
    }
  ],
  grade3: [
    {
      id: 'grv_g3_1',
      title: '1. Kosmoso prarajos ir trapus ledas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Saugokis atviro kosmoso kraštų! Sudaužyk trapų ledą ❄️, kad vėliau pro jį praslystum iki 🌀.',
      reward: 2,
      masterMoves: 5,
      size: 8,
      grid: [
        '        ',
        ' O.S..# ',
        ' .....  ',
        ' .....  ',
        ' #S...# ',
        ' ....I  ',
        ' ....F  ',
        '     #  '
      ]
    },
    {
      id: 'grv_g3_2',
      title: '2. Mėlynasis portalas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Įskridęs į mėlyną portalą 🔵, rutulys išskrenda iš kito mėlyno išlaikydamas greitį!',
      reward: 2,
      masterMoves: 5,
      size: 8,
      grid: [
        '        ',
        ' O.A A.#',
        ' .#.... ',
        ' ...F#S ',
        ' ...... ',
        ' #..... ',
        '      # ',
        '        '
      ]
    },
    {
      id: 'grv_g3_3',
      title: '3. Dvigubas portalų tiltas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Pasinaudok mėlynais 🔵 ir violetiniais 🟣 portalais bei įveik prarajas!',
      reward: 2,
      masterMoves: 5,
      size: 8,
      grid: [
        '        ',
        ' O..A..#',
        ' .....B ',
        ' S....# ',
        ' .....F ',
        ' ..AB.. ',
        ' #...S.#',
        '    #   '
      ]
    },
    {
      id: 'grv_g3_4',
      title: '4. Trapaus ledo šifras',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Pirmas smūgis į ❄️ sustabdo rutulį, o antrą kartą kelias jau laisvas!',
      reward: 2,
      masterMoves: 4,
      size: 8,
      grid: [
        '        ',
        ' O.S..# ',
        ' #....# ',
        ' ....I  ',
        ' ....S  ',
        ' #F.... ',
        '     #  ',
        '        '
      ]
    },
    {
      id: 'grv_g3_5',
      title: '5. Portalų labirintas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Sujunk portalus 🔵🟣, trapų ledą ❄️ ir surink visas ⭐ virš atviro kosmoso!',
      reward: 2,
      masterMoves: 5,
      size: 8,
      grid: [
        '        ',
        ' OS.A   ',
        '    B.S#',
        ' ...... ',
        ' A..#.. ',
        ' ...B.. ',
        ' #FI... ',
        '      # '
      ]
    },
    {
      id: 'grv_g3_6',
      title: '6. Lipni sala virš prarajos 🧲',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Sustok tiksliai ant lipnių 🧲 kilimėlių, kitaip išskriesi į atvirą kosmosą!',
      reward: 2,
      masterMoves: 5,
      size: 8,
      grid: [
        '  #     ',
        ' ..F##. ',
        ' O...X. ',
        ' ...... ',
        ' .S..S. ',
        ' ...... ',
        ' #...X. ',
        '        '
      ]
    },
    {
      id: 'grv_g3_7',
      title: '7. Geltonasis šliuzas ir ledas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Sudaužyk trapų ledą ❄️, aktyvuok geltoną 🟡 jungiklį ir atidaryk kelią pro 🟨 užtvarą!',
      reward: 3,
      masterMoves: 6,
      size: 8,
      grid: [
        '   #    ',
        ' O..I.y#',
        ' .#.... ',
        ' .#...Y ',
        ' ..S..S ',
        ' #F.... ',
        ' ..#..# ',
        '        '
      ]
    },
    {
      id: 'grv_g3_8',
      title: '8. Spalvotų spynų seifas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Du spalvoti jungikliai 🟡 ir 🔴 saugo kelią! Surask tikslią seką per 🧲 sustojimus.',
      reward: 3,
      masterMoves: 5,
      size: 8,
      grid: [
        '        ',
        ' O..y.# ',
        ' .X.RSF#',
        ' #r..Y. ',
        ' #S.... ',
        ' #...X. ',
        ' ...... ',
        '        '
      ]
    },
    {
      id: 'grv_g3_9',
      title: '9. Portalai, magnetai ir šliuzas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Peršok per 🔵 ir 🟣 portalus, įjunk 🟡 jungiklį ir sustok ant 🧲 prieš paskutinį šuolį!',
      reward: 3,
      masterMoves: 4,
      size: 8,
      grid: [
        '  #     ',
        ' ...YS.#',
        ' O.A... ',
        ' ....B. ',
        ' .S...F ',
        ' A.y.X# ',
        ' .B.... ',
        '        '
      ]
    },
    {
      id: 'grv_g3_10',
      title: '10. Galaktikos gravitacijos valdovas',
      badge: '🧊 GRAVITACIJOS LABIRINTAS • 3 KL.',
      instruction: 'Didysis finalas! Trapaus ledo ❄️ lūžis, 🔵/🟣 portalai, 🟡/🔴 užtvaros ir 🧲 sustojimas.',
      reward: 3,
      masterMoves: 7,
      size: 8,
      grid: [
        '  #     ',
        ' O.IAB# ',
        '#S.R.S. ',
        ' .S..Yr ',
        ' ...AyX ',
        ' F....B ',
        ' ##.... ',
        '        '
      ]
    }
  ]
};

export class GravityMazeEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.hintDir = null;
    this.animFrame = null;
    this.reset();
    this.startAnimLoop();
  }

  destroy() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  reset() {
    const rows = this.level.grid.length;
    const cols = this.level.grid[0].length;
    this.rows = rows;
    this.cols = cols;
    this.tiles = [];
    this.starsRemaining = new Set();
    this.totalStars = 0;
    this.openedColors = new Set();
    this.portals = { P1: [], P2: [] };
    this.ball = { r: 1, c: 1 };
    this.finish = { r: 1, c: 1 };

    let bPositions = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (this.level.grid[r][c] === 'B') bPositions.push({ r, c });
      }
    }

    for (let r = 0; r < rows; r++) {
      const rowArr = [];
      for (let c = 0; c < cols; c++) {
        const ch = this.level.grid[r][c];
        if (ch === 'O') {
          this.ball = { r, c };
          rowArr.push('.');
        } else if (ch === 'B' && bPositions.length === 1) {
          this.ball = { r, c };
          rowArr.push('.');
        } else if (ch === 'F') {
          this.finish = { r, c };
          rowArr.push('F');
        } else if (ch === 'S') {
          this.starsRemaining.add(`${r},${c}`);
          this.totalStars += 1;
          rowArr.push('.');
        } else if (ch === 'A') {
          this.portals.P1.push({ r, c });
          rowArr.push('A');
        } else if (ch === 'B') {
          this.portals.P2.push({ r, c });
          rowArr.push('B');
        } else {
          rowArr.push(ch);
        }
      }
      this.tiles.push(rowArr);
    }

    this.drawBall = { x: this.ball.c, y: this.ball.r };
    this.sliding = false;
    this.won = false;
    this.moves = 0;
    this.tilt = { angle: 0, dx: 0, dy: 0 };
    this.trail = [];
    this.shards = [];
    this.callbacks.onStateChange?.();
    this.render();
  }

  setHint(dir) {
    this.hintDir = dir || null;
  }

  getPortalTwin(ch, r, c) {
    const list = ch === 'A' ? this.portals.P1 : this.portals.P2;
    if (!list || list.length < 2) return null;
    return list.find((p) => p.r !== r || p.c !== c) || null;
  }

  slide(dirKey) {
    if (this.sliding || this.won) return false;
    const vec = DIR_VEC[dirKey];
    if (!vec) return false;

    const waypoints = [];
    const simOpened = new Set(this.openedColors);
    let cr = this.ball.r;
    let cc = this.ball.c;
    let fellOut = false;
    let hitIce = null;
    let stoppedSticky = false;
    let guard = 0;

    while (guard < 48) {
      guard += 1;
      const nr = cr + vec.dr;
      const nc = cc + vec.dc;

      if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) {
        waypoints.push({ r: nr, c: nc, jump: false, triggerColor: null });
        fellOut = true;
        break;
      }

      const tile = this.tiles[nr][nc];
      if (tile === ' ') {
        waypoints.push({ r: nr, c: nc, jump: false, triggerColor: null });
        fellOut = true;
        break;
      }

      const isBlockedBarrier =
        (tile === 'Y' && !simOpened.has('Y')) ||
        (tile === 'R' && !simOpened.has('R'));
      if (tile === '#' || isBlockedBarrier) {
        break;
      }

      if (tile === 'I') {
        hitIce = { r: nr, c: nc };
        break;
      }

      cr = nr;
      cc = nc;

      let triggerColor = null;
      if (tile === 'y' && !simOpened.has('Y')) {
        simOpened.add('Y');
        triggerColor = 'Y';
      } else if (tile === 'r' && !simOpened.has('R')) {
        simOpened.add('R');
        triggerColor = 'R';
      }

      waypoints.push({ r: cr, c: cc, jump: false, triggerColor });

      if (tile === 'X') {
        stoppedSticky = true;
        break;
      }

      if (tile === 'A' || tile === 'B') {
        const twin = this.getPortalTwin(tile, cr, cc);
        if (twin) {
          cr = twin.r;
          cc = twin.c;
          waypoints.push({ r: cr, c: cc, jump: true, triggerColor: null });
        }
      }
    }

    if (waypoints.length === 0 && !hitIce) {
      return false;
    }

    this.moves += 1;
    this.callbacks.onMove?.();

    this.sliding = true;
    this.tilt = { angle: vec.tiltAngle, dx: vec.dx, dy: vec.dy };
    this.trail = [{ r: this.ball.r, c: this.ball.c }];

    let wpIdx = 0;
    const stepNextWaypoint = () => {
      if (wpIdx >= waypoints.length) {
        this.sliding = false;
        this.tilt = { angle: 0, dx: 0, dy: 0 };

        if (fellOut) {
          this.callbacks.onAbyss?.();
          setTimeout(() => this.reset(), 480);
          return;
        }

        if (hitIce) {
          this.tiles[hitIce.r][hitIce.c] = '.';
          this.spawnIceShards(hitIce.r, hitIce.c);
          this.callbacks.onIceBreak?.();
        } else if (stoppedSticky) {
          this.callbacks.onStickyStop?.();
        } else if (waypoints.length > 0) {
          this.callbacks.onWallHit?.();
        }

        this.ball = { r: cr, c: cc };
        this.drawBall = { x: cc, y: cr };

        const atFinish = cr === this.finish.r && cc === this.finish.c;
        if (atFinish && this.starsRemaining.size === 0) {
          this.won = true;
          this.callbacks.onStateChange?.();
          this.callbacks.onWin?.();
          return;
        }
        if (atFinish && this.starsRemaining.size > 0) {
          this.callbacks.onMissingStars?.(this.starsRemaining.size);
        }
        this.callbacks.onStateChange?.();
        return;
      }

      const wp = waypoints[wpIdx];
      this.drawBall = { x: wp.c, y: wp.r };
      this.trail.push({ r: wp.r, c: wp.c });

      const key = `${wp.r},${wp.c}`;
      if (this.starsRemaining.has(key)) {
        this.starsRemaining.delete(key);
        this.callbacks.onStarCollect?.();
      }
      if (wp.triggerColor && !this.openedColors.has(wp.triggerColor)) {
        this.openedColors.add(wp.triggerColor);
        this.callbacks.onSwitchOpen?.(wp.triggerColor);
      }
      if (wp.jump) {
        this.callbacks.onPortal?.();
      }

      wpIdx += 1;
      setTimeout(stepNextWaypoint, wp.jump ? 55 : 42);
    };

    stepNextWaypoint();
    return true;
  }

  spawnIceShards(r, c) {
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      this.shards.push({
        r,
        c,
        vx: Math.cos(ang) * (1.2 + Math.random() * 1.5),
        vy: Math.sin(ang) * (1.2 + Math.random() * 1.5),
        life: 1
      });
    }
  }

  startAnimLoop() {
    const tick = () => {
      for (const sh of this.shards) {
        sh.r += sh.vy * 0.04;
        sh.c += sh.vx * 0.04;
        sh.life -= 0.04;
      }
      this.shards = this.shards.filter((s) => s.life > 0);
      this.render();
      this.animFrame = requestAnimationFrame(tick);
    };
    this.animFrame = requestAnimationFrame(tick);
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = GRAVITY_CANVAS_W;
    const H = GRAVITY_CANVAS_H;

    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.7);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2 + this.tilt.dx, H / 2 + this.tilt.dy);
    ctx.rotate(this.tilt.angle);
    ctx.translate(-W / 2, -H / 2);

    const pad = 28;
    const cellSize = Math.floor(Math.min((W - pad * 2) / this.cols, (H - pad * 2) / this.rows));
    const boardW = cellSize * this.cols;
    const boardH = cellSize * this.rows;
    const ox = Math.floor((W - boardW) / 2);
    const oy = Math.floor((H - boardH) / 2);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const ch = this.tiles[r][c];
        const x = ox + c * cellSize;
        const y = oy + r * cellSize;

        if (ch === ' ') {
          ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.18)';
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.setLineDash([]);
          continue;
        }

        if (ch === '#') {
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 7);
          ctx.fill();
          ctx.stroke();
          continue;
        }

        if (ch === 'I') {
          ctx.fillStyle = '#bae6fd';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 7);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 8);
          ctx.lineTo(x + cellSize * 0.52, y + cellSize * 0.48);
          ctx.lineTo(x + cellSize - 10, y + cellSize - 9);
          ctx.moveTo(x + cellSize - 12, y + 10);
          ctx.lineTo(x + cellSize * 0.45, y + cellSize * 0.55);
          ctx.stroke();
          continue;
        }

        // Slidi ledo grindų plokštė
        ctx.fillStyle = '#0c4a6e';
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 6);
        ctx.fill();
        ctx.stroke();

        // Lipnus / magnetinis sustojimo kilimėlis 'X'
        if (ch === 'X') {
          ctx.save();
          ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(x + 5, y + 5, cellSize - 10, cellSize - 10, 9);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = 'rgba(233, 213, 255, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.24, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = `${Math.floor(cellSize * 0.38)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧲', x + cellSize / 2, y + cellSize / 2 + 1);
          ctx.restore();
        }

        // Spalvoti jungikliai ('y' geltonas, 'r' raudonas)
        if (ch === 'y' || ch === 'r') {
          const colorKey = ch.toUpperCase();
          const active = this.openedColors.has(colorKey);
          const strokeCol = ch === 'y' ? '#fde047' : '#f87171';
          const fillCol = active
            ? ch === 'y'
              ? 'rgba(250, 204, 21, 0.65)'
              : 'rgba(248, 113, 113, 0.65)'
            : ch === 'y'
              ? 'rgba(250, 204, 21, 0.25)'
              : 'rgba(248, 113, 113, 0.25)';

          ctx.save();
          ctx.fillStyle = fillCol;
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.font = `${Math.floor(cellSize * 0.36)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch === 'y' ? '🟡' : '🔴', x + cellSize / 2, y + cellSize / 2 + 1);
          ctx.restore();
        }

        // Spalvotos užtvaros ('Y' geltona, 'R' raudona)
        if (ch === 'Y' || ch === 'R') {
          const isOpen = this.openedColors.has(ch);
          const col = ch === 'Y' ? '#facc15' : '#ef4444';
          ctx.save();
          if (!isOpen) {
            ctx.fillStyle = ch === 'Y' ? 'rgba(234, 179, 8, 0.38)' : 'rgba(239, 68, 68, 0.38)';
            ctx.strokeStyle = col;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(x + 4, y + 4, cellSize - 8, cellSize - 8, 7);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = col;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + cellSize - 10, y + cellSize - 10);
            ctx.moveTo(x + cellSize - 10, y + 10);
            ctx.lineTo(x + 10, y + cellSize - 10);
            ctx.stroke();
          } else {
            ctx.strokeStyle = ch === 'Y' ? 'rgba(250, 204, 21, 0.45)' : 'rgba(248, 113, 113, 0.45)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 6, y + 6, cellSize - 12, cellSize - 12);
            ctx.setLineDash([]);
          }
          ctx.restore();
        }

        // Portalai A (mėlynas) ir B (violetinis)
        if (ch === 'A' || ch === 'B') {
          const isBlue = ch === 'A';
          const col = isBlue ? '#38bdf8' : '#d946ef';
          ctx.save();
          ctx.shadowColor = col;
          ctx.shadowBlur = 12;
          ctx.strokeStyle = col;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = isBlue ? 'rgba(56,189,248,0.3)' : 'rgba(217,70,239,0.3)';
          ctx.fill();
          ctx.restore();
        }

        // Teleportacijos finišo platforma
        if (ch === 'F') {
          ctx.save();
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#15803d';
          ctx.strokeStyle = '#86efac';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(x + 6, y + 6, cellSize - 12, cellSize - 12, 10);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.font = `${Math.floor(cellSize * 0.48)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌀', x + cellSize / 2, y + cellSize / 2 + 1);
          ctx.restore();
        }

        // Žvaigždutė
        if (this.starsRemaining.has(`${r},${c}`)) {
          ctx.save();
          ctx.font = `${Math.floor(cellSize * 0.48)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', x + cellSize / 2, y + cellSize / 2 + 1);
          ctx.restore();
        }
      }
    }

    // Slydimo pėdsakas
    if (this.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = cellSize * 0.25;
      ctx.lineCap = 'round';
      ctx.beginPath();
      this.trail.forEach((pt, idx) => {
        const tx = ox + pt.c * cellSize + cellSize / 2;
        const ty = oy + pt.r * cellSize + cellSize / 2;
        if (idx === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Sudužusio ledo skeveldros
    for (const sh of this.shards) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sh.life);
      ctx.fillStyle = '#bae6fd';
      const sx = ox + sh.c * cellSize + cellSize / 2;
      const sy = oy + sh.r * cellSize + cellSize / 2;
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
      ctx.restore();
    }

    // Švytintis energijos rutulys
    const bx = ox + this.drawBall.x * cellSize + cellSize / 2;
    const by = oy + this.drawBall.y * cellSize + cellSize / 2;
    ctx.save();
    ctx.shadowColor = this.won ? '#4ade80' : '#facc15';
    ctx.shadowBlur = 18;
    const ballGrad = ctx.createRadialGradient(
      bx - cellSize * 0.08,
      by - cellSize * 0.08,
      2,
      bx,
      by,
      cellSize * 0.34
    );
    ballGrad.addColorStop(0, '#fef9c3');
    ballGrad.addColorStop(0.55, this.won ? '#4ade80' : '#facc15');
    ballGrad.addColorStop(1, this.won ? '#15803d' : '#ea580c');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(bx, by, cellSize * 0.33, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#020617';
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }
}
