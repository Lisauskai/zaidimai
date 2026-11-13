// ==================== KOSMINIŲ SVARSTYKLIŲ VARIKLIS (VISUAL LOGIC BALANCE) ====================

export const BALANCE_CANVAS_W = 640;
export const BALANCE_CANVAS_H = 380;

export const ITEM_CATALOG = {
  bolt: { icon: '🔩', label: 'Varžtas', color: '#94a3b8' },
  battery: { icon: '🔋', label: 'Baterija', color: '#4ade80' },
  crystal: { icon: '💎', label: 'Kristalas', color: '#38bdf8' },
  magnet: { icon: '🧲', label: 'Magnetas', color: '#f87171' },
  robot: { icon: '🤖', label: 'Robotukas', color: '#fbbf24' },
  rocket: { icon: '🚀', label: 'Raketa', color: '#c084fc' }
};

export const BALANCE_LEVELS = {
  grade1: [
    {
      id: 'bal_g1_1',
      title: '1. Kristalo paslaptis',
      instruction: 'Pagal viršutinę užuominą sužinok, kiek sveria 💎, tada parink tinkamus svarsčius ir spausk „Patikrinti“!',
      reward: 1,
      maxHearts: 3,
      weights: { crystal: 5 },
      clues: [
        { left: [{ kind: 'crystal', count: 1 }, { weight: 2 }], right: [{ weight: 7 }] }
      ],
      leftPan: [{ kind: 'crystal', count: 1 }, { weight: 3 }],
      inventory: [
        { uid: 'w1', value: 2, label: '2' },
        { uid: 'w2', value: 3, label: '3' },
        { uid: 'w3', value: 5, label: '5' },
        { uid: 'w4', value: 9, label: '9' }
      ]
    },
    {
      id: 'bal_g1_2',
      title: '2. Dviguba baterija',
      instruction: 'Dvi baterijos sveria tiek pat, kiek svarstis 12. Kiek sveria viena 🔋? Surink tikslų svorį!',
      reward: 1,
      maxHearts: 3,
      weights: { battery: 6 },
      clues: [
        { left: [{ kind: 'battery', count: 2 }], right: [{ weight: 12 }] }
      ],
      leftPan: [{ kind: 'battery', count: 1 }, { weight: 4 }],
      inventory: [
        { uid: 'w1', value: 1, label: '1' },
        { uid: 'w2', value: 4, label: '4' },
        { uid: 'w3', value: 6, label: '6' },
        { uid: 'w4', value: 8, label: '8' }
      ]
    },
    {
      id: 'bal_g1_3',
      title: '3. Kosminis varžtas',
      instruction: 'Apskaičiuok vieno varžto 🔩 svorį, sudėk visą kairę lėkštę ir išsirink tris svarsčius apačioje!',
      reward: 1,
      maxHearts: 3,
      weights: { bolt: 4 },
      clues: [
        { left: [{ kind: 'bolt', count: 1 }, { weight: 5 }], right: [{ weight: 9 }] }
      ],
      leftPan: [{ kind: 'bolt', count: 2 }, { weight: 3 }],
      inventory: [
        { uid: 'w1', value: 2, label: '2' },
        { uid: 'w2', value: 4, label: '4' },
        { uid: 'w3', value: 5, label: '5' },
        { uid: 'w4', value: 8, label: '8' }
      ]
    },
    {
      id: 'bal_g1_4',
      title: '4. Magneto trauka',
      instruction: 'Kiek sveria magnetas 🧲, jei su 6 sveria 13? Atsverk du magnetus ant dešinės lėkštės!',
      reward: 2,
      maxHearts: 3,
      weights: { magnet: 7 },
      clues: [
        { left: [{ kind: 'magnet', count: 1 }, { weight: 6 }], right: [{ weight: 13 }] }
      ],
      leftPan: [{ kind: 'magnet', count: 2 }],
      inventory: [
        { uid: 'w1', value: 1, label: '1' },
        { uid: 'w2', value: 5, label: '5' },
        { uid: 'w3', value: 9, label: '9' },
        { uid: 'w4', value: 11, label: '11' }
      ]
    },
    {
      id: 'bal_g1_5',
      title: '5. Robotuko svoris',
      instruction: 'Išspręsk lygtį su robotuku 🤖 ir atsargiai patikrink pusiausvyrą turėdami tik 3 širdeles!',
      reward: 2,
      maxHearts: 3,
      weights: { robot: 8 },
      clues: [
        { left: [{ kind: 'robot', count: 1 }, { weight: 4 }], right: [{ weight: 12 }] }
      ],
      leftPan: [{ kind: 'robot', count: 1 }, { weight: 7 }],
      inventory: [
        { uid: 'w1', value: 2, label: '2' },
        { uid: 'w2', value: 5, label: '5' },
        { uid: 'w3', value: 8, label: '8' },
        { uid: 'w4', value: 11, label: '11' }
      ]
    },
    {
      id: 'bal_g1_6',
      title: '6. Raketos kuras',
      instruction: 'Dvi raketos atstoja 18. Kiek iš viso sveria kairė lėkštė su 🚀 ir 8?',
      reward: 2,
      maxHearts: 3,
      weights: { rocket: 9 },
      clues: [
        { left: [{ kind: 'rocket', count: 2 }], right: [{ weight: 18 }] }
      ],
      leftPan: [{ kind: 'rocket', count: 1 }, { weight: 8 }],
      inventory: [
        { uid: 'w1', value: 2, label: '2' },
        { uid: 'w2', value: 6, label: '6' },
        { uid: 'w3', value: 9, label: '9' },
        { uid: 'w4', value: 12, label: '12' }
      ]
    },
    {
      id: 'bal_g1_7',
      title: '7. Trys kristalai',
      instruction: 'Iš užuominos rask vieno 💎 svorį, tada apskaičiuok trijų kristalų ir 4 sumą!',
      reward: 2,
      maxHearts: 3,
      weights: { crystal: 5 },
      clues: [
        { left: [{ kind: 'crystal', count: 2 }, { weight: 3 }], right: [{ weight: 13 }] }
      ],
      leftPan: [{ kind: 'crystal', count: 3 }, { weight: 4 }],
      inventory: [
        { uid: 'w1', value: 4, label: '4' },
        { uid: 'w2', value: 7, label: '7' },
        { uid: 'w3', value: 8, label: '8' },
        { uid: 'w4', value: 13, label: '13' }
      ]
    },
    {
      id: 'bal_g1_8',
      title: '8. Didysis 20-uko testas',
      instruction: 'Paskutinis 1 klasės iššūkis! Rask raketos 🚀 svorį ir surink lygiai 20 iš pateiktų svarsčių!',
      reward: 3,
      maxHearts: 3,
      weights: { rocket: 11 },
      clues: [
        { left: [{ kind: 'rocket', count: 1 }, { weight: 7 }], right: [{ weight: 18 }] }
      ],
      leftPan: [{ kind: 'rocket', count: 1 }, { weight: 9 }],
      inventory: [
        { uid: 'w1', value: 3, label: '3' },
        { uid: 'w2', value: 5, label: '5' },
        { uid: 'w3', value: 8, label: '8' },
        { uid: 'w4', value: 9, label: '9' },
        { uid: 'w5', value: 13, label: '13' }
      ]
    }
  ],

  grade3: [
    {
      id: 'bal_g3_1',
      title: '1. Trijų baterijų galia',
      instruction: 'Naudok abi užuominų svarstykles: iš 3×🔋 rask bateriją, tada kristalą 💎 ir atsverk!',
      reward: 1,
      maxHearts: 3,
      weights: { battery: 8, crystal: 14 },
      clues: [
        { left: [{ kind: 'battery', mult: 3 }], right: [{ weight: 24 }] },
        { left: [{ kind: 'crystal', count: 1 }, { kind: 'battery', count: 1 }], right: [{ weight: 22 }] }
      ],
      leftPan: [{ kind: 'crystal', count: 1 }, { kind: 'battery', mult: 2 }],
      inventory: [
        { uid: 'w1', value: 6, label: '6' },
        { uid: 'w2', value: 14, mult: 2, unit: 7, label: '2 × 7' },
        { uid: 'w3', value: 16, mult: 2, unit: 8, label: '2 × 8' },
        { uid: 'w4', value: 12, label: '12' }
      ]
    },
    {
      id: 'bal_g3_2',
      title: '2. Varžtų fabrikas',
      instruction: 'Apskaičiuok 🔩 ir 🧲 vertes pagal užuominas, tada parink daugybos ir paprastus svarsčius!',
      reward: 1,
      maxHearts: 3,
      weights: { bolt: 7, magnet: 19 },
      clues: [
        { left: [{ kind: 'bolt', mult: 4 }], right: [{ weight: 28 }] },
        { left: [{ kind: 'magnet', count: 1 }, { kind: 'bolt', count: 1 }], right: [{ weight: 26 }] }
      ],
      leftPan: [{ kind: 'magnet', count: 1 }, { kind: 'bolt', mult: 3 }, { weight: 5 }],
      inventory: [
        { uid: 'w1', value: 15, mult: 3, unit: 5, label: '3 × 5' },
        { uid: 'w2', value: 18, mult: 2, unit: 9, label: '2 × 9' },
        { uid: 'w3', value: 12, label: '12' },
        { uid: 'w4', value: 10, label: '10' }
      ]
    },
    {
      id: 'bal_g3_3',
      title: '3. Kosminis reaktorius',
      instruction: 'Dviejų lygčių galvosūkis! Rask 💎 iš pirmosios, 🤖 iš antrosios ir sudaugink teisingai!',
      reward: 2,
      maxHearts: 3,
      weights: { crystal: 9, robot: 25 },
      clues: [
        { left: [{ kind: 'crystal', mult: 2 }, { weight: 6 }], right: [{ weight: 24 }] },
        { left: [{ kind: 'robot', count: 1 }], right: [{ kind: 'crystal', mult: 2 }, { weight: 7 }] }
      ],
      leftPan: [{ kind: 'robot', count: 1 }, { kind: 'crystal', mult: 3 }],
      inventory: [
        { uid: 'w1', value: 28, mult: 4, unit: 7, label: '4 × 7' },
        { uid: 'w2', value: 24, mult: 3, unit: 8, label: '3 × 8' },
        { uid: 'w3', value: 16, label: '16' },
        { uid: 'w4', value: 19, label: '19' }
      ]
    },
    {
      id: 'bal_g3_4',
      title: '4. Magnetinis skydas',
      instruction: 'Pirmiausia rask bateriją 🔋, ją įstatyk į antrąją užuominą dėl magneto 🧲, ir atsverk kairę lėkštę!',
      reward: 2,
      maxHearts: 3,
      weights: { battery: 12, magnet: 18 },
      clues: [
        { left: [{ kind: 'battery', mult: 3 }], right: [{ weight: 36 }] },
        { left: [{ kind: 'magnet', mult: 2 }], right: [{ kind: 'battery', count: 1 }, { weight: 24 }] }
      ],
      leftPan: [{ kind: 'magnet', mult: 2 }, { kind: 'battery', mult: 2 }, { weight: 8 }],
      inventory: [
        { uid: 'w1', value: 40, mult: 5, unit: 8, label: '5 × 8' },
        { uid: 'w2', value: 18, mult: 2, unit: 9, label: '2 × 9' },
        { uid: 'w3', value: 10, label: '10' },
        { uid: 'w4', value: 14, label: '14' },
        { uid: 'w5', value: 25, label: '25' }
      ]
    },
    {
      id: 'bal_g3_5',
      title: '5. Raketos paleidimo platforma',
      instruction: 'Dideli skaičiai ir daugyba! Suskaičiuok 2×🚀 + 2×🔩 bendrą svorį ir surink jį iš 3 detalių.',
      reward: 2,
      maxHearts: 3,
      weights: { bolt: 6, rocket: 32 },
      clues: [
        { left: [{ kind: 'bolt', mult: 5 }], right: [{ weight: 30 }] },
        { left: [{ kind: 'rocket', count: 1 }, { kind: 'bolt', mult: 2 }], right: [{ weight: 44 }] }
      ],
      leftPan: [{ kind: 'rocket', mult: 2 }, { kind: 'bolt', mult: 2 }],
      inventory: [
        { uid: 'w1', value: 44, mult: 4, unit: 11, label: '4 × 11' },
        { uid: 'w2', value: 24, mult: 3, unit: 8, label: '3 × 8' },
        { uid: 'w3', value: 8, label: '8' },
        { uid: 'w4', value: 17, label: '17' },
        { uid: 'w5', value: 20, label: '20' }
      ]
    },
    {
      id: 'bal_g3_6',
      title: '6. Robotų eskadra',
      instruction: 'Rask 💎 ir 🤖 reikšmes, sudaugink 3×🤖 ir pridėk likusius elementus. Nebandyk aklai!',
      reward: 2,
      maxHearts: 3,
      weights: { crystal: 15, robot: 22 },
      clues: [
        { left: [{ kind: 'crystal', mult: 4 }], right: [{ weight: 60 }] },
        { left: [{ kind: 'robot', count: 1 }, { weight: 8 }], right: [{ kind: 'crystal', mult: 2 }] }
      ],
      leftPan: [{ kind: 'robot', mult: 3 }, { kind: 'crystal', count: 1 }, { weight: 4 }],
      inventory: [
        { uid: 'w1', value: 45, mult: 5, unit: 9, label: '5 × 9' },
        { uid: 'w2', value: 28, mult: 2, unit: 14, label: '2 × 14' },
        { uid: 'w3', value: 12, label: '12' },
        { uid: 'w4', value: 16, label: '16' },
        { uid: 'w5', value: 19, label: '19' }
      ]
    },
    {
      id: 'bal_g3_7',
      title: '7. Branduolinis generatorius',
      instruction: 'Įstatyk 3×🔋 į antrąją užuominą ir sužinok raketos 🚀 svorį. Turi tik 3 patikrinimus!',
      reward: 3,
      maxHearts: 3,
      weights: { battery: 14, rocket: 36 },
      clues: [
        { left: [{ kind: 'battery', mult: 3 }], right: [{ weight: 42 }] },
        { left: [{ kind: 'rocket', count: 1 }, { weight: 12 }], right: [{ kind: 'battery', mult: 3 }, { weight: 6 }] }
      ],
      leftPan: [{ kind: 'rocket', mult: 2 }, { kind: 'battery', count: 1 }, { weight: 6 }],
      inventory: [
        { uid: 'w1', value: 48, mult: 6, unit: 8, label: '6 × 8' },
        { uid: 'w2', value: 28, mult: 4, unit: 7, label: '4 × 7' },
        { uid: 'w3', value: 16, label: '16' },
        { uid: 'w4', value: 21, label: '21' },
        { uid: 'w5', value: 25, label: '25' }
      ]
    },
    {
      id: 'bal_g3_8',
      title: '8. Šimto tonų egzaminas',
      instruction: 'Vyriausiojo inžinieriaus finalas! Surink lygiai 100 pagal dvi magnetų ir raketos užuominas.',
      reward: 3,
      maxHearts: 3,
      weights: { magnet: 16, rocket: 26 },
      clues: [
        { left: [{ kind: 'magnet', mult: 4 }], right: [{ weight: 64 }] },
        { left: [{ kind: 'rocket', count: 1 }, { weight: 6 }], right: [{ kind: 'magnet', mult: 2 }] }
      ],
      leftPan: [{ kind: 'rocket', mult: 3 }, { kind: 'magnet', count: 1 }, { weight: 6 }],
      inventory: [
        { uid: 'w1', value: 60, mult: 5, unit: 12, label: '5 × 12' },
        { uid: 'w2', value: 27, mult: 3, unit: 9, label: '3 × 9' },
        { uid: 'w3', value: 13, label: '13' },
        { uid: 'w4', value: 18, label: '18' },
        { uid: 'w5', value: 21, label: '21' }
      ]
    }
  ]
};

export function sumSideEntries(entries = [], weights = {}) {
  return entries.reduce((acc, entry) => {
    if (typeof entry === 'string') {
      return acc + (weights[entry] || 0);
    }
    if (typeof entry.weight === 'number') {
      return acc + entry.weight;
    }
    if (entry.kind) {
      const n = entry.mult ?? entry.count ?? 1;
      return acc + (weights[entry.kind] || 0) * n;
    }
    return acc;
  }, 0);
}

export function findExactSubsetUids(inventory = [], target = 0) {
  const n = inventory.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0;
    const uids = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += inventory[i].value;
        uids.push(inventory[i].uid);
      }
    }
    if (sum === target) return uids;
  }
  return [];
}

/**
 * Grąžina vizualius elementus kairiajai lėkštei piešti
 * Pvz., { type: 'item', kind, badgeText? } arba { type: 'weight', value, label }
 */
function expandLeftEntries(entries = []) {
  const out = [];
  for (const entry of entries) {
    if (typeof entry.weight === 'number') {
      out.push({ type: 'weight', value: entry.weight, label: String(entry.weight) });
    } else if (entry.kind) {
      if (entry.mult && entry.mult > 1) {
        out.push({ type: 'multItem', kind: entry.kind, mult: entry.mult });
      } else {
        const count = entry.count || 1;
        for (let i = 0; i < count; i++) {
          out.push({ type: 'item', kind: entry.kind });
        }
      }
    }
  }
  return out;
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
    this.won = false;
    this.outOfHearts = false;
    this.maxHearts = level.maxHearts || 3;
    this.hearts = this.maxHearts;
    this.locked = true;
    this.lastCheckState = null; // null | 'left-heavy' | 'right-heavy' | 'balanced'
    this.rightItems = []; // [{ uid, value, mult?, unit?, label }]
    this.rightPanHitboxes = []; // [{ x, y, r, uid }]
    this.hintRemove = false;

    this.reset();
  }

  reset() {
    this.leftVisualEntries = expandLeftEntries(this.level.leftPan);
    this.rightItems = [];
    this.hintRemove = false;
    this.won = false;
    this.outOfHearts = false;
    this.maxHearts = this.level.maxHearts || 3;
    this.hearts = this.maxHearts;
    this.locked = true;
    this.lastCheckState = null;
    this.angle = 0;
    this.angularVel = 0;

    this.notifyStatus();
  }

  setHintRemove(flag) {
    this.hintRemove = !!flag;
  }

  getLeftWeight() {
    return sumSideEntries(this.level.leftPan, this.level.weights);
  }

  getRightWeight() {
    return this.rightItems.reduce((acc, item) => acc + (item.value || 0), 0);
  }

  getWeightDiff() {
    // neigiamas -> kairė sunkesnė; teigiamas -> dešinė sunkesnė
    return this.getRightWeight() - this.getLeftWeight();
  }

  isBalanced() {
    return this.rightItems.length > 0 && this.getLeftWeight() === this.getRightWeight();
  }

  hasPlacedUid(uid) {
    return this.rightItems.some((item) => item.uid === uid);
  }

  getSolutionUids() {
    return findExactSubsetUids(this.level.inventory || [], this.getLeftWeight());
  }

  placeToken(uid) {
    if (this.won || this.outOfHearts) return false;
    if (this.hasPlacedUid(uid)) return false;
    const token = (this.level.inventory || []).find((t) => t.uid === uid);
    if (!token) return false;

    this.hintRemove = false;
    this.rightItems.push({ ...token });
    // Redagavus svorius svarstyklės vėl užsirakina horizontaliai su „?“
    this.locked = true;
    this.lastCheckState = null;
    this.angularVel = 0;

    this.notifyStatus();
    this.callbacks.onMove?.('add', token);
    return true;
  }

  removeToken(uid) {
    if (this.won || this.outOfHearts) return false;
    const idx = this.rightItems.findIndex((t) => t.uid === uid);
    if (idx === -1) return false;

    const [removed] = this.rightItems.splice(idx, 1);
    this.hintRemove = false;
    // Redagavus svorius svarstyklės vėl užsirakina horizontaliai su „?“
    this.locked = true;
    this.lastCheckState = null;
    this.angularVel = 0;

    this.notifyStatus();
    this.callbacks.onMove?.('remove', removed);
    return true;
  }

  checkBalance() {
    if (this.won || this.outOfHearts) return null;
    if (this.rightItems.length === 0) {
      return { empty: true, hearts: this.hearts, maxHearts: this.maxHearts };
    }

    const diff = this.getWeightDiff();
    this.locked = false;

    if (diff === 0) {
      this.lastCheckState = 'balanced';
      this.won = true;
      this.angularVel = 0.05;
      this.notifyStatus();
      const result = {
        balanced: true,
        won: true,
        diff: 0,
        hearts: this.hearts,
        maxHearts: this.maxHearts,
        outOfHearts: false
      };
      this.callbacks.onCheckResult?.(result);
      this.callbacks.onWin?.();
      return result;
    }

    this.hearts = Math.max(0, this.hearts - 1);
    this.lastCheckState = diff < 0 ? 'left-heavy' : 'right-heavy';
    this.angularVel = diff < 0 ? -0.18 : 0.18;
    if (this.hearts === 0) {
      this.outOfHearts = true;
    }
    this.notifyStatus();

    const result = {
      balanced: false,
      won: false,
      diff,
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      outOfHearts: this.outOfHearts
    };
    this.callbacks.onCheckResult?.(result);
    return result;
  }

  handlePointerDown(mx, my) {
    if (this.won || this.outOfHearts) return;
    for (let i = this.rightPanHitboxes.length - 1; i >= 0; i--) {
      const box = this.rightPanHitboxes[i];
      if (Math.hypot(mx - box.x, my - box.y) <= box.r + 6) {
        this.removeToken(box.uid);
        return;
      }
    }
  }

  notifyStatus() {
    this.callbacks.onStatusChange?.({
      rightCount: this.rightItems.length,
      rightUids: this.rightItems.map((t) => t.uid),
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      locked: this.locked,
      lastCheckState: this.lastCheckState,
      outOfHearts: this.outOfHearts,
      won: this.won
    });
  }

  startLoop() {
    if (this.rafId !== null) return;
    let lastTs = performance.now();

    const step = (now) => {
      const dt = Math.min(0.033, (now - lastTs) / 1000);
      lastTs = now;
      this.update(dt);
      this.draw();
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  update(dt) {
    this.time += dt;

    let targetAngle = 0;
    if (!this.locked) {
      if (this.lastCheckState === 'left-heavy') {
        const mag = Math.min(0.32, 0.16 + Math.abs(this.getWeightDiff()) * 0.012);
        targetAngle = -mag;
      } else if (this.lastCheckState === 'right-heavy') {
        const mag = Math.min(0.32, 0.16 + Math.abs(this.getWeightDiff()) * 0.012);
        targetAngle = mag;
      }
    }

    const stiffness = this.locked ? 44 : 28;
    const damping = this.locked ? 0.72 : 0.84;
    const accel = (targetAngle - this.angle) * stiffness;
    this.angularVel = (this.angularVel + accel * dt) * Math.pow(damping, dt * 60);
    this.angle += this.angularVel * dt;

    if (this.angle > 0.38) {
      this.angle = 0.38;
      this.angularVel *= -0.35;
    } else if (this.angle < -0.38) {
      this.angle = -0.38;
      this.angularVel *= -0.35;
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

    // Subtilios žvaigždutės
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
    const armLen = 198;
    const balancedConfirmed = this.lastCheckState === 'balanced' && this.won;

    // Pagrindinis stovas
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

    // Sijos galų koordinatės
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
    ctx.fillStyle = balancedConfirmed ? '#15803d' : this.locked ? '#1e293b' : '#31102f';
    ctx.strokeStyle = balancedConfirmed ? '#4ade80' : this.locked ? '#a78bfa' : '#fb7185';
    ctx.lineWidth = 4;
    if (balancedConfirmed) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#4ade80';
    }
    ctx.beginPath();
    ctx.roundRect(-armLen - 12, -10, (armLen + 12) * 2, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Centrinė šviesos lemputė (užrakinta „?“ arba patikrinimo rezultatas)
    ctx.save();
    const lampColor = balancedConfirmed
      ? '#22c55e'
      : this.locked
        ? '#7c3aed'
        : '#f43f5e';
    ctx.shadowBlur = balancedConfirmed ? 26 : 14;
    ctx.shadowColor = lampColor;
    ctx.fillStyle = lampColor;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 17px "Russo One", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerSymbol = balancedConfirmed
      ? '✓'
      : this.locked
        ? '?'
        : this.lastCheckState === 'left-heavy'
          ? '◀'
          : '▶';
    ctx.fillText(centerSymbol, pivotX, pivotY + 1);
    ctx.restore();

    // Kairė ir dešinė lėkštės
    this.drawLeftPan(ctx, leftHookX, leftHookY, balancedConfirmed);
    this.rightPanHitboxes = this.drawRightPan(ctx, rightHookX, rightHookY, balancedConfirmed);

    // Statuso žinutė viršuje
    ctx.save();
    ctx.textAlign = 'center';
    if (this.won || balancedConfirmed) {
      ctx.fillStyle = '#4ade80';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#22c55e';
      ctx.font = '900 18px "Russo One", sans-serif';
      ctx.fillText('🟢 PUSIAUSVYRA PASIEKTA!', pivotX, 32);
    } else if (this.outOfHearts) {
      ctx.fillStyle = '#fb7185';
      ctx.font = '900 16px "Russo One", sans-serif';
      ctx.fillText('💔 Bandymai baigėsi! Svarstyklės persikrauna...', pivotX, 32);
    } else if (!this.locked && this.lastCheckState === 'left-heavy') {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 15px "Russo One", sans-serif';
      ctx.fillText('⬅️ Kairė pusė nusvėrė! Pridėk didesnį svorį ir tikrink dar kartą.', pivotX, 32);
    } else if (!this.locked && this.lastCheckState === 'right-heavy') {
      ctx.fillStyle = '#fb7185';
      ctx.font = '900 15px "Russo One", sans-serif';
      ctx.fillText('➡️ Dešinė pusė nusvėrė! Spausk ant svarsčio lėkštėje, kad nuimtum.', pivotX, 32);
    } else {
      ctx.fillStyle = '#c4b5fd';
      ctx.font = '800 14px Nunito, sans-serif';
      ctx.fillText('🔒 Svarstyklės užrakintos (?). Sudėk svarsčius ir spausk „Patikrinti“!', pivotX, 32);
    }
    ctx.restore();
  }

  drawPanFrame(ctx, hookX, hookY, panY, panHalfW, isBalanced) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(hookX, hookY + 6);
    ctx.lineTo(hookX - panHalfW + 10, panY);
    ctx.moveTo(hookX, hookY + 6);
    ctx.lineTo(hookX + panHalfW - 10, panY);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(hookX, hookY + 4, 6, 0, Math.PI * 2);
    ctx.fill();

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
  }

  drawLeftPan(ctx, hookX, hookY, isBalanced) {
    const panY = hookY + 88;
    const panHalfW = 104;
    this.drawPanFrame(ctx, hookX, hookY, panY, panHalfW, isBalanced);

    const entries = this.leftVisualEntries || [];
    const perRow = 4;
    const colGap = 44;
    const rowGap = 42;

    entries.forEach((entry, idx) => {
      const row = Math.floor(idx / perRow);
      const col = idx % perRow;
      const inRow = Math.min(perRow, entries.length - row * perRow);
      const rowOffset = ((inRow - 1) * colGap) / 2;

      const ix = hookX - rowOffset + col * colGap;
      const iy = panY - 22 - row * rowGap;

      ctx.save();
      if (entry.type === 'weight') {
        // Žinomas skaitinis svarstis (auksinis šešiakampis/blokelis)
        ctx.fillStyle = '#b45309';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(ix - 17, iy - 16, 34, 32, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 15px "Russo One", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entry.label, ix, iy + 1);
      } else if (entry.type === 'multItem') {
        const meta = ITEM_CATALOG[entry.kind] || ITEM_CATALOG.bolt;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(ix - 21, iy - 16, 42, 32, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = '900 12px "Russo One", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${entry.mult}×${meta.icon}`, ix, iy + 1);
      } else {
        const meta = ITEM_CATALOG[entry.kind] || ITEM_CATALOG.bolt;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(ix, iy, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '19px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(meta.icon, ix, iy + 1);
      }
      ctx.restore();
    });
  }

  drawRightPan(ctx, hookX, hookY, isBalanced) {
    const panY = hookY + 88;
    const panHalfW = 104;
    const hitboxes = [];
    this.drawPanFrame(ctx, hookX, hookY, panY, panHalfW, isBalanced);

    const perRow = 3;
    const colGap = 58;
    const rowGap = 40;

    this.rightItems.forEach((token, idx) => {
      const row = Math.floor(idx / perRow);
      const col = idx % perRow;
      const inRow = Math.min(perRow, this.rightItems.length - row * perRow);
      const rowOffset = ((inRow - 1) * colGap) / 2;

      const ix = hookX - rowOffset + col * colGap;
      const iy = panY - 22 - row * rowGap;
      const isHintRem = this.hintRemove && idx === this.rightItems.length - 1;
      const isMult = !!token.mult;

      ctx.save();
      if (isHintRem) {
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#fde047';
      }
      ctx.fillStyle = isMult ? '#4338ca' : '#0369a1';
      ctx.strokeStyle = isHintRem ? '#fde047' : isMult ? '#c084fc' : '#38bdf8';
      ctx.lineWidth = isHintRem ? 4 : 2.5;
      ctx.beginPath();
      ctx.roundRect(ix - 25, iy - 16, 50, 32, 9);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${isMult ? 12 : 15}px "Russo One", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token.label || String(token.value), ix, iy + 1);
      ctx.restore();

      hitboxes.push({ x: ix, y: iy, r: 24, uid: token.uid });
    });

    if (this.rightItems.length === 0) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
      ctx.font = '800 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Uždek svarsčius iš apačios', hookX, panY - 14);
    }

    return hitboxes;
  }
}
