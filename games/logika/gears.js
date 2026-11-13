// ==================== 8. KRUMPLIARAČIŲ VARIKLIS (GEARS & ROTATION DIRECTION) ====================
export const GEARS_CANVAS_W = 540;
export const GEARS_CANVAS_H = 440;

export const GEAR_SIZES = {
  S: { key: 'S', label: 'Mažas', radius: 30, teeth: 8, color: '#38bdf8', rim: '#0284c7' },
  M: { key: 'M', label: 'Vidutinis', radius: 45, teeth: 12, color: '#a78bfa', rim: '#6d28d9' },
  L: { key: 'L', label: 'Didelis', radius: 60, teeth: 16, color: '#fb923c', rim: '#c2410c' }
};

export const GEARS_LEVELS = {
  grade1: [
    {
      id: 'gea_g1_1',
      title: '1. Pirmoji jungtis',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Uždėk 2 tinkamus krumpliaračius ant tuščių kaiščių, kad auksinis generatorius suktųsi!',
      reward: 1,
      motor: { id: 'motor', x: 115, y: 220, radius: 30, teeth: 8, dir: 1 },
      goal: { id: 'goal', x: 355, y: 220, radius: 30, teeth: 8, requiredDir: null },
      pegs: [
        { id: 'p1', x: 190, y: 220 },
        { id: 'p2', x: 280, y: 220 }
      ],
      walls: [],
      belts: [],
      inventory: { S: 1, M: 2, L: 1 }
    },
    {
      id: 'gea_g1_2',
      title: '2. Didelis ir mažas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Tarpai skirtingi! Parink tinkamą krumpliaračio dydį kiekvienam kaiščiui.',
      reward: 1,
      motor: { id: 'motor', x: 110, y: 230, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 380, y: 230, radius: 45, teeth: 12, requiredDir: null },
      pegs: [
        { id: 'p1', x: 215, y: 230 },
        { id: 'p2', x: 305, y: 230 }
      ],
      walls: [],
      belts: [],
      inventory: { S: 2, M: 1, L: 1 }
    },
    {
      id: 'gea_g1_3',
      title: '3. Kampinis perdavimas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Perduok sukimąsi kampu per 3 krumpliaračius iki auksinio generatoriaus!',
      reward: 1,
      motor: { id: 'motor', x: 130, y: 310, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 295, y: 115, radius: 45, teeth: 12, requiredDir: null },
      pegs: [
        { id: 'p1', x: 130, y: 205 },
        { id: 'p2', x: 220, y: 205 },
        { id: 'p3', x: 295, y: 205 }
      ],
      walls: [],
      belts: [],
      inventory: { S: 2, M: 2, L: 1 }
    },
    {
      id: 'gea_g1_4',
      title: '4. Tiltas virš sienos',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Saugokis sienos! Sudėk 4 krumpliaračius virš jos, kad sistema neužstrigtų.',
      reward: 2,
      motor: { id: 'motor', x: 105, y: 280, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 375, y: 280, radius: 45, teeth: 12, requiredDir: null },
      pegs: [
        { id: 'p1', x: 105, y: 190 },
        { id: 'p2', x: 210, y: 190 },
        { id: 'p3', x: 300, y: 190 },
        { id: 'p4', x: 375, y: 190 }
      ],
      walls: [{ x: 170, y: 262, w: 145, h: 100 }],
      belts: [],
      inventory: { S: 2, M: 3, L: 2 }
    },
    {
      id: 'gea_g1_5',
      title: '5. Mechaniko laiptai',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Apjunk laiptuotą grandinę iš 4 krumpliaračių, neliesdamas tamsių sienų!',
      reward: 2,
      motor: { id: 'motor', x: 95, y: 130, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 350, y: 310, radius: 30, teeth: 8, requiredDir: null },
      pegs: [
        { id: 'p1', x: 170, y: 130 },
        { id: 'p2', x: 170, y: 220 },
        { id: 'p3', x: 275, y: 220 },
        { id: 'p4', x: 275, y: 310 }
      ],
      walls: [
        { x: 55, y: 205, w: 45, h: 140 },
        { x: 245, y: 70, w: 140, h: 85 }
      ],
      belts: [],
      inventory: { S: 2, M: 2, L: 2 }
    }
  ],
  grade3: [
    {
      id: 'gea_g3_1',
      title: '1. Trumpas ar aplinkinis kelias?',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Generatorius turi suktis PAGAL laikrodžio rodyklę (↻)! Rinkis: trumpas (2 kr.) ar aplinkinis (3 kr.) kelias?',
      reward: 2,
      motor: { id: 'motor', x: 120, y: 255, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 360, y: 255, radius: 45, teeth: 12, requiredDir: 1 },
      pegs: [
        { id: 's1', x: 210, y: 255 },
        { id: 's2', x: 285, y: 255 },
        { id: 'u1', x: 120, y: 150 },
        { id: 'u2', x: 240, y: 150 },
        { id: 'u3', x: 360, y: 150 }
      ],
      walls: [],
      belts: [],
      inventory: { S: 1, M: 1, L: 3 }
    },
    {
      id: 'gea_g3_2',
      title: '2. Diržinė pavara',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Diržas (Belt) perduoda sukimąsi NEKEISDAMAS krypties! Pasuk generatorių PRIEŠ laikrodžio rodyklę (↺).',
      reward: 2,
      motor: { id: 'motor', x: 110, y: 260, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 380, y: 260, radius: 45, teeth: 12, requiredDir: -1 },
      pegs: [
        { id: 'p1', x: 110, y: 155 },
        { id: 'p2', x: 275, y: 155 },
        { id: 'p3', x: 275, y: 260 }
      ],
      walls: [],
      belts: [{ a: 'p1', b: 'p2' }],
      inventory: { S: 1, M: 2, L: 2 }
    },
    {
      id: 'gea_g3_3',
      title: '3. Dvi trasos su diržu',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Apatinėje trasoje diržas išlaiko kryptį, viršutinėje jos nėra. Pasiek ↻ (PAGAL laikrodžio rodyklę)!',
      reward: 2,
      motor: { id: 'motor', x: 100, y: 220, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 340, y: 220, radius: 45, teeth: 12, requiredDir: 1 },
      pegs: [
        { id: 'b1', x: 100, y: 115 },
        { id: 'b2', x: 220, y: 115 },
        { id: 'b3', x: 340, y: 115 },
        { id: 'a1', x: 100, y: 325 },
        { id: 'a2', x: 235, y: 325 },
        { id: 'a3', x: 340, y: 325 }
      ],
      walls: [],
      belts: [{ a: 'a1', b: 'a2' }],
      inventory: { S: 1, M: 2, L: 3 }
    },
    {
      id: 'gea_g3_4',
      title: '4. Dvigubas diržų perdavimas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Aplenk sieną su dviem diržinėmis pavaromis ir pasuk generatorių ↺ kryptimi!',
      reward: 3,
      motor: { id: 'motor', x: 100, y: 130, radius: 30, teeth: 8, dir: 1 },
      goal: { id: 'goal', x: 415, y: 190, radius: 30, teeth: 8, requiredDir: -1 },
      pegs: [
        { id: 'p1', x: 175, y: 130 },
        { id: 'p2', x: 175, y: 280 },
        { id: 'p3', x: 280, y: 280 },
        { id: 'p4', x: 415, y: 280 }
      ],
      walls: [{ x: 235, y: 170, w: 90, h: 55 }],
      belts: [
        { a: 'p1', b: 'p2' },
        { a: 'p3', b: 'p4' }
      ],
      inventory: { S: 1, M: 2, L: 2 }
    },
    {
      id: 'gea_g3_5',
      title: '5. Meistro mechanizmas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Sujunk įstrižą diržinę pavarą ir aplenk sieną, kad auksinis krumpliaratis suktųsi ↻!',
      reward: 3,
      motor: { id: 'motor', x: 100, y: 320, radius: 45, teeth: 12, dir: 1 },
      goal: { id: 'goal', x: 425, y: 230, radius: 45, teeth: 12, requiredDir: 1 },
      pegs: [
        { id: 'p1', x: 100, y: 215 },
        { id: 'p2', x: 190, y: 215 },
        { id: 'p3', x: 320, y: 125 },
        { id: 'p4', x: 320, y: 230 }
      ],
      walls: [{ x: 185, y: 270, w: 70, h: 90 }],
      belts: [{ a: 'p2', b: 'p3' }],
      inventory: { S: 2, M: 2, L: 2 }
    }
  ]
};

function circleIntersectsRect(cx, cy, cr, rect) {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < cr * cr;
}

export class GearsEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.selectedSize = 'M';
    this.placed = {}; // pegId -> 'S' | 'M' | 'L'
    this.angles = {}; // id -> radians
    this.speeds = {}; // id -> rad/sec (with sign)
    this.jammed = false;
    this.jamReason = '';
    this.jammedIds = new Set();
    this.won = false;
    this.hintPeg = null; // { pegId, sizeKey }
    this.draggingFromPeg = null;
    this.dragGhost = null; // { sizeKey, x, y }

    this.lastTime = performance.now();
    this.animFrame = null;

    this.recomputePhysics();
    this.startLoop();
  }

  destroy() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  reset() {
    this.placed = {};
    this.won = false;
    this.hintPeg = null;
    this.dragGhost = null;
    this.draggingFromPeg = null;
    this.recomputePhysics();
  }

  setSelectedSize(sizeKey) {
    if (!GEAR_SIZES[sizeKey]) return;
    this.selectedSize = sizeKey;
    this.callbacks.onStateChange?.();
  }

  setHint(hintObj) {
    this.hintPeg = hintObj || null;
  }

  getRemainingCount(sizeKey) {
    const total = this.level.inventory[sizeKey] || 0;
    const used = Object.values(this.placed).filter((k) => k === sizeKey).length;
    return Math.max(0, total - used);
  }

  getAllActiveGears() {
    const list = [
      {
        id: 'motor',
        kind: 'motor',
        x: this.level.motor.x,
        y: this.level.motor.y,
        radius: this.level.motor.radius,
        teeth: this.level.motor.teeth,
        color: '#22c55e',
        rim: '#15803d'
      },
      {
        id: 'goal',
        kind: 'goal',
        x: this.level.goal.x,
        y: this.level.goal.y,
        radius: this.level.goal.radius,
        teeth: this.level.goal.teeth,
        color: '#facc15',
        rim: '#b45309'
      }
    ];

    for (const peg of this.level.pegs) {
      const sizeKey = this.placed[peg.id];
      if (!sizeKey) continue;
      const spec = GEAR_SIZES[sizeKey];
      list.push({
        id: peg.id,
        kind: 'placed',
        sizeKey,
        x: peg.x,
        y: peg.y,
        radius: spec.radius,
        teeth: spec.teeth,
        color: spec.color,
        rim: spec.rim
      });
    }
    return list;
  }

  recomputePhysics() {
    const gears = this.getAllActiveGears();
    const byId = new Map(gears.map((g) => [g.id, g]));

    this.speeds = {};
    this.jammed = false;
    this.jamReason = '';
    this.jammedIds = new Set();

    // 1. Sienų ir perdidelio susikirtimo patikra
    for (const g of gears) {
      if (g.kind === 'placed') {
        for (const w of this.level.walls || []) {
          if (circleIntersectsRect(g.x, g.y, g.radius - 2, w)) {
            this.jammed = true;
            this.jammedIds.add(g.id);
            this.jamReason = '💥 Sistema užstrigo: krumpliaratis liečia sieną!';
          }
        }
      }
    }

    for (let i = 0; i < gears.length; i++) {
      for (let j = i + 1; j < gears.length; j++) {
        const a = gears[i];
        const b = gears[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < a.radius + b.radius - 8) {
          this.jammed = true;
          this.jammedIds.add(a.id);
          this.jammedIds.add(b.id);
          this.jamReason = '💥 Sistema užstrigo: per didelis krumpliaratis remiasi į kaimyną!';
        }
      }
    }

    if (this.jammed) {
      this.callbacks.onStateChange?.();
      return;
    }

    // 2. Sukimosi perdavimas per dantukus (atvirkščiai) ir diržus (ta pačia kryptimi)
    const baseOmega = 1.65 * this.level.motor.dir; // rad/s
    this.speeds.motor = baseOmega;
    const queue = ['motor'];

    while (queue.length > 0 && !this.jammed) {
      const curId = queue.shift();
      const curG = byId.get(curId);
      const curOmega = this.speeds[curId];

      for (const other of gears) {
        if (other.id === curId) continue;

        const dist = Math.hypot(curG.x - other.x, curG.y - other.y);
        const meshes = Math.abs(dist - (curG.radius + other.radius)) <= 6;
        const hasBelt = (this.level.belts || []).some(
          (bl) => (bl.a === curId && bl.b === other.id) || (bl.b === curId && bl.a === other.id)
        );

        if (!meshes && !hasBelt) continue;

        let targetOmega;
        if (meshes) {
          targetOmega = -curOmega * (curG.radius / other.radius);
        } else {
          // Diržas išsaugo kryptį
          targetOmega = curOmega * (curG.radius / other.radius);
        }

        if (this.speeds[other.id] === undefined) {
          this.speeds[other.id] = targetOmega;
          queue.push(other.id);
        } else {
          const sameSign = Math.sign(this.speeds[other.id]) === Math.sign(targetOmega);
          if (!sameSign) {
            this.jammed = true;
            this.jammedIds.add(curId);
            this.jammedIds.add(other.id);
            this.speeds = {};
            this.jamReason = '🔒 Krumpliaračių žiedas užsikerta (kryptys prieštarauja viena kitai)!';
            break;
          }
        }
      }
    }

    if (!this.jammed && this.speeds.goal) {
      const goalDir = Math.sign(this.speeds.goal);
      const req = this.level.goal.requiredDir;
      if (req === null || goalDir === req) {
        if (!this.won) {
          this.won = true;
          this.callbacks.onWin?.();
        }
      }
    }

    this.callbacks.onStateChange?.();
  }

  getStatusSummary() {
    if (this.jammed) {
      return { state: 'jammed', text: this.jamReason };
    }
    const goalSpeed = this.speeds.goal || 0;
    if (!goalSpeed) {
      return { state: 'idle', text: '⚙️ Sujunk krumpliaračius nuo žalio variklio iki auksinio generatoriaus!' };
    }
    const goalDir = Math.sign(goalSpeed);
    const req = this.level.goal.requiredDir;
    if (req !== null && goalDir !== req) {
      return {
        state: 'wrong-dir',
        text: `🔄 Generatorius sukasi ${goalDir > 0 ? 'pagal laikrodį (↻)' : 'prieš laikrodį (↺)'}, o reikia ${req > 0 ? '↻ (pagal laikrodį)' : '↺ (prieš laikrodį)'}!`
      };
    }
    return { state: 'won', text: '✅ Puiku! Generatorius veikia teisinga kryptimi!' };
  }

  findPegAt(mx, my) {
    for (const peg of this.level.pegs) {
      const hitR = this.placed[peg.id] ? GEAR_SIZES[this.placed[peg.id]].radius + 4 : 26;
      if (Math.hypot(mx - peg.x, my - peg.y) <= hitR) {
        return peg;
      }
    }
    return null;
  }

  placeGearOnPeg(pegId, sizeKey) {
    if (this.won) return false;
    const prev = this.placed[pegId];
    if (prev === sizeKey) return false;

    const avail = this.getRemainingCount(sizeKey) + (prev === sizeKey ? 1 : 0);
    if (avail <= 0) {
      this.callbacks.onError?.(`Nebeliko „${GEAR_SIZES[sizeKey].label}“ dydžio krumpliaračių!`);
      return false;
    }

    this.placed[pegId] = sizeKey;
    this.callbacks.onAction?.();
    this.recomputePhysics();
    if (this.jammed) {
      this.callbacks.onJam?.();
    }
    return true;
  }

  removeGearFromPeg(pegId) {
    if (this.won || !this.placed[pegId]) return false;
    delete this.placed[pegId];
    this.callbacks.onAction?.();
    this.recomputePhysics();
    return true;
  }

  handlePointerDown(mx, my) {
    if (this.won) return;
    const peg = this.findPegAt(mx, my);
    if (!peg) return;

    if (this.placed[peg.id]) {
      // Pašalina uždėtą krumpliaratį paspaudus
      this.removeGearFromPeg(peg.id);
    } else {
      this.placeGearOnPeg(peg.id, this.selectedSize);
    }
  }

  handleDropFromPalette(sizeKey, mx, my) {
    if (this.won || !GEAR_SIZES[sizeKey]) return false;
    let bestPeg = null;
    let bestDist = 72;
    for (const peg of this.level.pegs) {
      const d = Math.hypot(mx - peg.x, my - peg.y);
      if (d < bestDist) {
        bestDist = d;
        bestPeg = peg;
      }
    }
    if (!bestPeg) return false;
    return this.placeGearOnPeg(bestPeg.id, sizeKey);
  }

  startLoop() {
    const step = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;

      for (const [id, omega] of Object.entries(this.speeds)) {
        this.angles[id] = (this.angles[id] || 0) + omega * dt;
      }

      this.render();
      this.animFrame = requestAnimationFrame(step);
    };
    this.animFrame = requestAnimationFrame(step);
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = GEARS_CANVAS_W;
    const H = GEARS_CANVAS_H;

    ctx.clearRect(0, 0, W, H);

    // Mechanikos dirbtuvių fonas
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtilus brėžinio tinklelis
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 20; x < W; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 20; y < H; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Sienos (kliūtys)
    for (const w of this.level.walls || []) {
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(w.x, w.y, w.w, w.h, 8);
      ctx.fill();
      ctx.stroke();

      // Įspėjamieji dryžiai
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.lineWidth = 4;
      for (let d = -w.h; d < w.w + w.h; d += 18) {
        ctx.beginPath();
        ctx.moveTo(w.x + Math.max(0, d), w.y + Math.max(0, -d));
        ctx.lineTo(w.x + Math.min(w.w, d + w.h), w.y + Math.min(w.h, w.w - d));
      }
      ctx.restore();
    }

    // Diržinės pavaros (po krumpliaračiais)
    const coordMap = new Map();
    coordMap.set('motor', { x: this.level.motor.x, y: this.level.motor.y, r: this.level.motor.radius });
    coordMap.set('goal', { x: this.level.goal.x, y: this.level.goal.y, r: this.level.goal.radius });
    for (const peg of this.level.pegs) {
      const sk = this.placed[peg.id];
      coordMap.set(peg.id, { x: peg.x, y: peg.y, r: sk ? GEAR_SIZES[sk].radius : 18 });
    }

    for (const bl of this.level.belts || []) {
      const A = coordMap.get(bl.a);
      const B = coordMap.get(bl.b);
      if (!A || !B) continue;

      const angle = Math.atan2(B.y - A.y, B.x - A.x);
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);
      const rA = A.r * 0.72;
      const rB = B.r * 0.72;

      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 7;
      ctx.setLineDash([12, 6]);
      if (this.speeds[bl.a]) {
        ctx.lineDashOffset = -(performance.now() * 0.03 * Math.sign(this.speeds[bl.a]));
      }
      ctx.beginPath();
      ctx.moveTo(A.x + nx * rA, A.y + ny * rA);
      ctx.lineTo(B.x + nx * rB, B.y + ny * rB);
      ctx.moveTo(A.x - nx * rA, A.y - ny * rA);
      ctx.lineTo(B.x - nx * rB, B.y - ny * rB);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = '#fef08a';
      ctx.font = '800 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DIRŽAS (ta pati kryptis)', (A.x + B.x) / 2, (A.y + B.y) / 2 - 14);
      ctx.restore();
    }

    // Tušti tvirtinimo kaiščiai
    for (const peg of this.level.pegs) {
      const hasGear = Boolean(this.placed[peg.id]);
      const isHint = this.hintPeg && this.hintPeg.pegId === peg.id;

      ctx.save();
      if (isHint) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 26 + 3 * Math.sin(performance.now() * 0.008), 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!hasGear) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Visi krumpliaračiai (Variklis, Uždėti, Generatorius)
    const activeGears = this.getAllActiveGears();
    for (const g of activeGears) {
      const ang = this.angles[g.id] || 0;
      const isJammed = this.jammedIds.has(g.id);
      const omega = this.speeds[g.id] || 0;
      this.drawGear(ctx, g, ang, isJammed, omega);
    }

    // Privalomos krypties rodyklė ant Generatoriaus (3 klasei)
    if (this.level.goal.requiredDir !== null) {
      this.drawRequiredDirBadge(
        ctx,
        this.level.goal.x,
        this.level.goal.y - this.level.goal.radius - 26,
        this.level.goal.requiredDir
      );
    }

    // Variklio etiketė
    ctx.save();
    ctx.fillStyle = '#86efac';
    ctx.font = '900 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VARIKLIS ↻', this.level.motor.x, this.level.motor.y + this.level.motor.radius + 20);

    ctx.fillStyle = '#fef08a';
    ctx.fillText(
      this.level.goal.requiredDir === null
        ? 'GENERATORIUS'
        : this.level.goal.requiredDir > 0
          ? 'TIKSLAS: ↻'
          : 'TIKSLAS: ↺',
      this.level.goal.x,
      this.level.goal.y + this.level.goal.radius + 20
    );
    ctx.restore();

    // Užstrigimo juostelė ant drobės viršaus
    if (this.jammed) {
      ctx.save();
      ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
      ctx.beginPath();
      ctx.roundRect(70, 14, W - 140, 32, 10);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠️ SISTEMA UŽSTRIGO! Nuimk ar pakeisk krumpliaratį', W / 2, 30);
      ctx.restore();
    }
  }

  drawGear(ctx, g, angle, isJammed, omega) {
    const rOuter = g.radius + 5;
    const rInner = g.radius - 5;
    const teeth = g.teeth;

    ctx.save();
    ctx.translate(g.x, g.y);

    // Šešėlis arba raudonas užstrigimo švytėjimas
    if (isJammed) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
    } else if (g.kind === 'goal' && this.won) {
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 22;
    }

    ctx.rotate(angle);

    // Dantukai
    ctx.fillStyle = isJammed ? '#ef4444' : g.color;
    ctx.strokeStyle = isJammed ? '#7f1d1d' : '#020617';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.25;
      const a2 = a0 + step * 0.55;
      const a3 = a0 + step * 0.8;

      if (i === 0) ctx.moveTo(Math.cos(a0) * rInner, Math.sin(a0) * rInner);
      else ctx.lineTo(Math.cos(a0) * rInner, Math.sin(a0) * rInner);
      ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
      ctx.lineTo(Math.cos(a3) * rInner, Math.sin(a3) * rInner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vidinis žiedas ir stipinai, kad aiškiai matytųsi sukimasis
    ctx.fillStyle = isJammed ? '#b91c1c' : g.rim;
    ctx.beginPath();
    ctx.arc(0, 0, g.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    for (let s = 0; s < 3; s++) {
      const sa = (s * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sa) * g.radius * 0.55, Math.sin(sa) * g.radius * 0.55);
      ctx.stroke();
    }

    // Centrinis kaištis
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Sukimosi krypties lankas jei sukasi
    if (omega !== 0 && !isJammed) {
      const dir = Math.sign(omega);
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (dir > 0) {
        ctx.arc(0, 0, g.radius * 0.36, -0.6, 1.3);
      } else {
        ctx.arc(0, 0, g.radius * 0.36, 1.3, -0.6, true);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  drawRequiredDirBadge(ctx, cx, cy, dir) {
    ctx.save();
    const ok = this.won;
    ctx.fillStyle = ok ? '#16a34a' : '#7c2d12';
    ctx.strokeStyle = ok ? '#86efac' : '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 56, cy - 15, 112, 26, 999);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dir > 0 ? 'REIKIA: ↻ PAGAL' : 'REIKIA: ↺ PRIEŠ', cx, cy - 2);
    ctx.restore();
  }
}
