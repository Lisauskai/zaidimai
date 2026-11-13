// ==================== KOSMINĖS SVARSTYKLĖS (VISUAL LOGIC BALANCE) ====================
export const BALANCE_CANVAS_W = 640;
export const BALANCE_CANVAS_H = 380;

export const ITEM_CATALOG = {
  bolt: { id: 'bolt', icon: '🔩', label: 'Varžtas', color: '#94a3b8' },
  battery: { id: 'battery', icon: '🔋', label: 'Baterija', color: '#22d3ee' },
  crystal: { id: 'crystal', icon: '💎', label: 'Kristalas', color: '#34d399' },
  magnet: { id: 'magnet', icon: '🧲', label: 'Magnetas', color: '#f87171' },
  robot: { id: 'robot', icon: '🤖', label: 'Robotukas', color: '#a78bfa' },
  rocket: { id: 'rocket', icon: '🚀', label: 'Raketa', color: '#fbbf24' }
};

export const BALANCE_LEVELS = {
  grade1: [
    {
      id: 'bal_g1_1',
      title: '1. Baterijos ir varžtai',
      instruction: 'Pažiūrėk į taisyklę viršuje ir subalansuok svarstykles dešinėje lėkštėje!',
      reward: 15,
      weights: { bolt: 1, battery: 2 },
      hints: [
        { left: [{ kind: 'battery', count: 1 }], right: [{ kind: 'bolt', count: 2 }] }
      ],
      leftPan: ['battery', 'battery'],
      palette: ['bolt']
    },
    {
      id: 'bal_g1_2',
      title: '2. Kristalų svoris',
      instruction: 'Kiek varžtų atsveria du energijos kristalus?',
      reward: 15,
      weights: { bolt: 1, crystal: 3 },
      hints: [
        { left: [{ kind: 'crystal', count: 1 }], right: [{ kind: 'bolt', count: 3 }] }
      ],
      leftPan: ['crystal', 'crystal'],
      palette: ['bolt']
    },
    {
      id: 'bal_g1_3',
      title: '3. Magnetinė jėga',
      instruction: 'Suskaičiuok, kiek iš viso varžtų reikia sudėti dešinėje!',
      reward: 15,
      weights: { bolt: 1, magnet: 4 },
      hints: [
        { left: [{ kind: 'magnet', count: 1 }], right: [{ kind: 'bolt', count: 4 }] }
      ],
      leftPan: ['magnet', 'bolt', 'bolt'],
      palette: ['bolt']
    },
    {
      id: 'bal_g1_4',
      title: '4. Robotukų energija',
      instruction: 'Kiek baterijų reikės dviem robotukams atsverti?',
      reward: 20,
      weights: { battery: 1, robot: 3 },
      hints: [
        { left: [{ kind: 'robot', count: 1 }], right: [{ kind: 'battery', count: 3 }] }
      ],
      leftPan: ['robot', 'robot'],
      palette: ['battery']
    },
    {
      id: 'bal_g1_5',
      title: '5. Pilnas kristalas',
      instruction: 'Apskaičiuok bendrą svorį ir išlygink svarstyklių lėkštes!',
      reward: 20,
      weights: { bolt: 1, crystal: 5 },
      hints: [
        { left: [{ kind: 'crystal', count: 1 }], right: [{ kind: 'bolt', count: 5 }] }
      ],
      leftPan: ['crystal', 'bolt', 'bolt', 'bolt'],
      palette: ['bolt']
    }
  ],
  grade3: [
    {
      id: 'bal_g3_1',
      title: '1. Dviguba grandinė',
      instruction: 'Panaudok abi taisykles ir išlygink svarstykles baterijomis arba varžtais!',
      reward: 25,
      weights: { bolt: 1, battery: 3, robot: 6 },
      hints: [
        { left: [{ kind: 'robot', count: 1 }], right: [{ kind: 'battery', count: 2 }] },
        { left: [{ kind: 'battery', count: 1 }], right: [{ kind: 'bolt', count: 3 }] }
      ],
      leftPan: ['robot', 'battery'],
      palette: ['battery', 'bolt']
    },
    {
      id: 'bal_g3_2',
      title: '2. Kristalų laboratorija',
      instruction: 'Rask tikslų svorį suderinęs kelis objektus dešinėje lėkštėje!',
      reward: 25,
      weights: { bolt: 1, battery: 4, crystal: 8 },
      hints: [
        { left: [{ kind: 'crystal', count: 1 }], right: [{ kind: 'battery', count: 2 }] },
        { left: [{ kind: 'battery', count: 1 }], right: [{ kind: 'bolt', count: 4 }] }
      ],
      leftPan: ['crystal', 'battery', 'bolt', 'bolt'],
      palette: ['battery', 'bolt']
    },
    {
      id: 'bal_g3_3',
      title: '3. Kosminis reaktorius',
      instruction: 'Suderink kristalų ir baterijų kiekį, kad abi pusės būtų lygios!',
      reward: 30,
      weights: { battery: 1, crystal: 2, robot: 6 },
      hints: [
        { left: [{ kind: 'robot', count: 1 }], right: [{ kind: 'crystal', count: 3 }] },
        { left: [{ kind: 'crystal', count: 1 }], right: [{ kind: 'battery', count: 2 }] }
      ],
      leftPan: ['robot', 'crystal', 'crystal'],
      palette: ['crystal', 'battery']
    },
    {
      id: 'bal_g3_4',
      title: '4. Raketos starto svoris',
      instruction: 'Trijų žingsnių lygtis! Kiek baterijų ir varžtų atsveria raketą su robotu?',
      reward: 30,
      weights: { bolt: 1, battery: 2, robot: 4, rocket: 8 },
      hints: [
        { left: [{ kind: 'rocket', count: 1 }], right: [{ kind: 'robot', count: 2 }] },
        { left: [{ kind: 'robot', count: 1 }], right: [{ kind: 'battery', count: 2 }] },
        { left: [{ kind: 'battery', count: 1 }], right: [{ kind: 'bolt', count: 2 }] }
      ],
      leftPan: ['rocket', 'robot'],
      palette: ['battery', 'bolt']
    },
    {
      id: 'bal_g3_5',
      title: '5. Vyriausiojo inžinieriaus egzaminas',
      instruction: 'Sudėtinga kosminė lygtis! Surink reikiamą svorį robotukais ir varžtais!',
      reward: 35,
      weights: { bolt: 1, crystal: 3, robot: 6, rocket: 9 },
      hints: [
        { left: [{ kind: 'rocket', count: 1 }], right: [{ kind: 'robot', count: 1 }, { kind: 'crystal', count: 1 }] },
        { left: [{ kind: 'robot', count: 1 }], right: [{ kind: 'crystal', count: 2 }] },
        { left: [{ kind: 'crystal', count: 1 }], right: [{ kind: 'bolt', count: 3 }] }
      ],
      leftPan: ['rocket', 'crystal'],
      palette: ['robot', 'bolt']
    }
  ]
};

export function sumWeight(items, weights) {
  return items.reduce((acc, kind) => acc + (weights[kind] || 0), 0);
}

export class BalanceScaleEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.rafId = null;
    this.time = 0;
    this.angle = 0;
    this.angularVel = 0;
    this.settledTime = 0;
    this.won = false;
    this.rightPanHitboxes = []; // [{ x, y, r, index }]

    this.reset();
  }

  reset() {
    this.leftItems = [...this.level.leftPan];
    this.rightItems = [];
    this.won = false;
    this.settledTime = 0;

    // Pradinė pusiausvyra pasvirusi kairėn
    const diff = this.getWeightDiff();
    this.angle = Math.max(-0.34, Math.min(0.34, diff * 0.045));
    this.angularVel = 0;

    this.notifyStatus();
  }

  getLeftWeight() {
    return sumWeight(this.leftItems, this.level.weights);
  }

  getRightWeight() {
    return sumWeight(this.rightItems, this.level.weights);
  }

  getWeightDiff() {
    // neigiamas -> kairė sunkesnė (sija krenta į kairę)
    return this.getRightWeight() - this.getLeftWeight();
  }

  isBalanced() {
    return this.rightItems.length > 0 && this.getLeftWeight() === this.getRightWeight();
  }

  addItem(kind) {
    if (this.won) return false;
    if (this.rightItems.length >= 16) return false;
    if (!this.level.palette.includes(kind)) return false;

    this.rightItems.push(kind);
    this.angularVel += 0.14; // Lengvas smūgis ant dešinės lėkštės
    this.settledTime = 0;
    this.notifyStatus();
    return true;
  }

  removeItemAt(index) {
    if (this.won) return false;
    if (index < 0 || index >= this.rightItems.length) return false;
    this.rightItems.splice(index, 1);
    this.angularVel -= 0.1;
    this.settledTime = 0;
    this.notifyStatus();
    return true;
  }

  handlePointerDown(mx, my) {
    if (this.won) return;
    // Tikriname ar paspausta ant dešinės lėkštės objekto (nuo viršutinio iki apatinio)
    for (let i = this.rightPanHitboxes.length - 1; i >= 0; i--) {
      const hb = this.rightPanHitboxes[i];
      if (Math.hypot(mx - hb.x, my - hb.y) <= hb.r + 6) {
        this.removeItemAt(hb.index);
        return;
      }
    }
  }

  notifyStatus() {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        rightCount: this.rightItems.length,
        balanced: this.isBalanced(),
        won: this.won,
        diff: this.getWeightDiff()
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

    // Spyruoklinis svyravimo fizikos modelis
    const diff = this.getWeightDiff();
    const targetAngle = Math.max(-0.34, Math.min(0.34, diff * 0.048));
    const stiffness = 28;
    const damping = 6.2;

    const accel = (targetAngle - this.angle) * stiffness - this.angularVel * damping;
    this.angularVel += accel * dt;
    this.angle += this.angularVel * dt;

    if (this.isBalanced() && !this.won) {
      if (Math.abs(this.angle) < 0.055) {
        this.settledTime += dt;
        if (this.settledTime >= 0.4) {
          this.won = true;
          this.angle = 0;
          this.angularVel = 0;
          if (this.callbacks.onWin) {
            this.callbacks.onWin();
          }
          this.notifyStatus();
        }
      } else {
        this.settledTime = 0;
      }
    } else {
      this.settledTime = 0;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, BALANCE_CANVAS_W, BALANCE_CANVAS_H);

    // Kosminis fonas
    const bg = ctx.createLinearGradient(0, 0, 0, BALANCE_CANVAS_H);
    bg.addColorStop(0, '#020617');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, BALANCE_CANVAS_W, BALANCE_CANVAS_H);

    // Subtilios žvaigždutės fone
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 97 + 41) % (BALANCE_CANVAS_W - 20)) + 10;
      const sy = ((i * 53 + 23) % (BALANCE_CANVAS_H - 60)) + 10;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) * 0.6 + 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const pivotX = BALANCE_CANVAS_W / 2;
    const pivotY = 126;
    const armLen = 196;
    const balancedNow = this.isBalanced();

    // Pagrindinis stovas (pjedestalas)
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pivotX - 18, pivotY);
    ctx.lineTo(pivotX + 18, pivotY);
    ctx.lineTo(pivotX + 34, BALANCE_CANVAS_H - 28);
    ctx.lineTo(pivotX - 34, BALANCE_CANVAS_H - 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pagrindas apačioje
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(pivotX - 110, BALANCE_CANVAS_H - 36, 220, 22, 10);
    ctx.fill();
    ctx.stroke();

    // Sijos galų koordinatės pagal kampą this.angle
    const cosA = Math.cos(this.angle);
    const sinA = Math.sin(this.angle);
    const leftHookX = pivotX - armLen * cosA;
    const leftHookY = pivotY - armLen * sinA;
    const rightHookX = pivotX + armLen * cosA;
    const rightHookY = pivotY + armLen * sinA;

    // Svyravimo sija
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(this.angle);
    ctx.fillStyle = balancedNow ? '#15803d' : '#1e293b';
    ctx.strokeStyle = balancedNow ? '#4ade80' : '#38bdf8';
    ctx.lineWidth = 4;
    if (balancedNow) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#4ade80';
    }
    ctx.beginPath();
    ctx.roundRect(-armLen - 12, -10, (armLen + 12) * 2, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Centrinė šviesos lemputė (pusiausvyros indikatorius)
    ctx.save();
    const lampColor = balancedNow ? '#22c55e' : Math.abs(this.getWeightDiff()) <= 2 ? '#facc15' : '#f43f5e';
    ctx.shadowBlur = balancedNow ? 26 : 12;
    ctx.shadowColor = lampColor;
    ctx.fillStyle = lampColor;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(balancedNow ? '✓' : '⚖', pivotX, pivotY + 1);
    ctx.restore();

    // Piešiame kairę ir dešinę lėkštes su pakabos grandinėmis
    this.drawPan(ctx, leftHookX, leftHookY, this.leftItems, false, balancedNow);
    this.rightPanHitboxes = this.drawPan(ctx, rightHookX, rightHookY, this.rightItems, true, balancedNow);

    // Statuso juosta apačioje (vizuali užuomina, be skaitinės formulės)
    if (this.won || balancedNow) {
      ctx.save();
      ctx.fillStyle = '#4ade80';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#22c55e';
      ctx.font = '900 18px "Russo One", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🟢 PUSIAUSVYRA PASIEKTA!', pivotX, 34);
      ctx.restore();
    } else if (this.rightItems.length > 0) {
      const diff = this.getWeightDiff();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 14px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        diff < 0 ? '⬅️ Kairė pusė dar sunkesnė' : '➡️ Dešinė pusė per sunki (spausk ant objekto, kad nuimtum)',
        pivotX,
        32
      );
    }
  }

  drawPan(ctx, hookX, hookY, items, isRemovable, isBalanced) {
    const ropeLen = 86;
    const panY = hookY + ropeLen;
    const panHalfW = 98;
    const hitboxes = [];

    // Pakabos trosai
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(hookX, hookY + 6);
    ctx.lineTo(hookX - panHalfW + 10, panY);
    ctx.moveTo(hookX, hookY + 6);
    ctx.lineTo(hookX + panHalfW - 10, panY);
    ctx.stroke();

    // Kablys
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(hookX, hookY + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Lėkštė
    ctx.save();
    if (isBalanced) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#4ade80';
    }
    ctx.fillStyle = isBalanced ? '#14532d' : '#1e293b';
    ctx.strokeStyle = isBalanced ? '#4ade80' : '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(hookX - panHalfW, panY);
    ctx.lineTo(hookX + panHalfW, panY);
    ctx.lineTo(hookX + panHalfW - 18, panY + 18);
    ctx.lineTo(hookX - panHalfW + 18, panY + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Sudedame objektus ant lėkštės keliomis tvarkingomis eilutėmis (iki 5 per eilutę)
    const perRow = 5;
    const colGap = 33;
    const rowGap = 31;

    items.forEach((kind, idx) => {
      const row = Math.floor(idx / perRow);
      const col = idx % perRow;
      const itemsInThisRow = Math.min(perRow, items.length - row * perRow);
      const rowOffset = ((itemsInThisRow - 1) * colGap) / 2;

      const ix = hookX - rowOffset + col * colGap;
      const iy = panY - 18 - row * rowGap;
      const meta = ITEM_CATALOG[kind] || ITEM_CATALOG.bolt;

      ctx.save();
      ctx.fillStyle = isRemovable ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ix, iy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '18px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(meta.icon, ix, iy + 1);
      ctx.restore();

      if (isRemovable) {
        hitboxes.push({ x: ix, y: iy, r: 15, index: idx });
      }
    });

    if (items.length === 0 && isRemovable) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '800 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Spausk mygtukus apačioje', hookX, panY - 14);
    }

    return hitboxes;
  }
}
