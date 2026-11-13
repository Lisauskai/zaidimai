// ==================== „IŠTRAUK KAIŠTĮ“ (PIN-PULL PHYSICS) HTML5 CANVAS VARIKLIUKAS ====================

export const CANVAS_W = 640;
export const CANVAS_H = 460;
const BALL_RADIUS = 11.5;
const WALL_RADIUS = 5.5;
const PIN_RADIUS = 6;
const GRAVITY = 0.24;
const SUBSTEPS = 6;

const COLORS = {
  cyan: '#22d3ee',
  yellow: '#facc15',
  green: '#4ade80',
  purple: '#c084fc',
  orange: '#fb923c',
  gray: '#94a3b8'
};

function spawnBalls(cx, cy, cols, count, kind, color) {
  const arr = [];
  const spacing = BALL_RADIUS * 2.15;
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const xOff = (col - (cols - 1) / 2) * spacing + (row % 2 === 1 ? spacing * 0.22 : -spacing * 0.12);
    arr.push({
      x: cx + xOff,
      y: cy + row * spacing,
      vx: 0,
      vy: 0,
      r: BALL_RADIUS,
      kind,
      color: kind === 'gray' ? COLORS.gray : color,
      inGoal: false,
      removed: false
    });
  }
  return arr;
}

// ==================== 10 LYGIŲ (PO 5 KIEKVIENAI KLASEI) ====================
export const PINPULL_LEVELS = {
  grade1: [
    {
      id: 'pp_g1_1',
      title: '1. Atidaryk vartus',
      instruction: 'Kaiščiai: 2. Pirma atidaryk apatinį kaištį (#2), tik tada viršutinį (#1), kad dubuo nepersipildytų per kraštą!',
      reward: 1,
      requiredGoal: 5,
      walls: [
        // Viršutinė kamera (siaurėjanti link #1)
        { x1: 255, y1: 35, x2: 265, y2: 118 },
        { x1: 385, y1: 35, x2: 375, y2: 118 },
        // Žemas tarpinis dubuo su išpylimo lūpa kairėje (jei #2 uždarytas, išbyra per kraštą!)
        { x1: 275, y1: 218, x2: 275, y2: 228 },
        { x1: 275, y1: 228, x2: 292, y2: 238 },
        { x1: 370, y1: 145, x2: 370, y2: 228 },
        { x1: 370, y1: 228, x2: 348, y2: 238 },
        // Piltuvėlis į tikslo kolbą
        { x1: 268, y1: 275, x2: 292, y2: 345 },
        { x1: 372, y1: 275, x2: 348, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 260, y1: 122, x2: 380, y2: 122, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 276, y1: 242, x2: 364, y2: 242, dirX: 1, dirY: 0 }
      ],
      goal: { x: 265, y: 345, w: 110, h: 92 },
      trap: null,
      makeBalls: () => spawnBalls(320, 56, 3, 5, 'colored', COLORS.cyan)
    },
    {
      id: 'pp_g1_2',
      title: '2. Tiltas per bedugnę',
      instruction: 'Kaiščiai: 2. Įstrižas kaištis (#2) yra TILTAS! Ištrauk tik #1, kad geltoni rutuliukai nuriedėtų į kolbą.',
      reward: 2,
      requiredGoal: 5,
      walls: [
        // Viršutinė kairioji kamera
        { x1: 125, y1: 35, x2: 125, y2: 115 },
        { x1: 235, y1: 35, x2: 235, y2: 115 },
        // Statinis posūkio kanalas dešinėje į kolbą
        { x1: 295, y1: 245, x2: 375, y2: 315 },
        { x1: 395, y1: 205, x2: 435, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 120, y1: 119, x2: 240, y2: 119, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 110, y1: 175, x2: 292, y2: 242, dirX: -1, dirY: -0.35 }
      ],
      goal: { x: 345, y: 345, w: 125, h: 92 },
      trap: null,
      makeBalls: () => spawnBalls(180, 58, 3, 5, 'colored', COLORS.yellow)
    },
    {
      id: 'pp_g1_3',
      title: '3. Trys aukštai',
      instruction: 'Kaiščiai: 3. Atidaryk aukštus iš APAČIOS į viršų (#3 → #2 → #1), kad tarpinės lėkštės nepersipildytų!',
      reward: 2,
      requiredGoal: 6,
      walls: [
        // 1 aukštas (viršus)
        { x1: 258, y1: 25, x2: 268, y2: 96 },
        { x1: 382, y1: 25, x2: 372, y2: 96 },
        // 2 aukštas (žema dešinė sienelė!)
        { x1: 268, y1: 112, x2: 268, y2: 168 },
        { x1: 268, y1: 168, x2: 292, y2: 178 },
        { x1: 372, y1: 158, x2: 372, y2: 168 },
        { x1: 372, y1: 168, x2: 348, y2: 178 },
        // 3 aukštas (žema kairė sienelė!)
        { x1: 268, y1: 238, x2: 268, y2: 250 },
        { x1: 268, y1: 250, x2: 292, y2: 260 },
        { x1: 372, y1: 195, x2: 372, y2: 250 },
        { x1: 372, y1: 250, x2: 348, y2: 260 },
        // Piltuvėlis į kolbą
        { x1: 268, y1: 285, x2: 290, y2: 345 },
        { x1: 372, y1: 285, x2: 350, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 262, y1: 100, x2: 378, y2: 100, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 276, y1: 181, x2: 364, y2: 181, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3', x1: 276, y1: 263, x2: 364, y2: 263, dirX: -1, dirY: 0 }
      ],
      goal: { x: 265, y: 345, w: 110, h: 92 },
      trap: null,
      makeBalls: () => spawnBalls(320, 44, 3, 6, 'colored', COLORS.green)
    },
    {
      id: 'pp_g1_4',
      title: '4. Dvigubas srautas',
      instruction: 'Kaiščiai: 3. Nuleisk #1 per tiltą (#3) į dešinę, o tada išlaisvink dešiniąją kamerą (#2)!',
      reward: 2,
      requiredGoal: 6,
      walls: [
        // Kairė kamera
        { x1: 110, y1: 35, x2: 110, y2: 115 },
        { x1: 215, y1: 35, x2: 215, y2: 115 },
        // Dešinė kamera virš kolbos
        { x1: 375, y1: 45, x2: 375, y2: 125 },
        { x1: 485, y1: 45, x2: 485, y2: 125 },
        // Centrinis kreipiklis į kolbą
        { x1: 320, y1: 260, x2: 360, y2: 345 },
        { x1: 495, y1: 205, x2: 465, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 105, y1: 119, x2: 220, y2: 119, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 370, y1: 129, x2: 490, y2: 129, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3', x1: 95, y1: 185, x2: 318, y2: 256, dirX: -1, dirY: -0.3 }
      ],
      goal: { x: 350, y: 345, w: 130, h: 92 },
      trap: null,
      makeBalls: () => [
        ...spawnBalls(162, 60, 2, 3, 'colored', COLORS.orange),
        ...spawnBalls(430, 70, 2, 3, 'colored', COLORS.cyan)
      ]
    },
    {
      id: 'pp_g1_5',
      title: '5. Saugus posūkis',
      instruction: 'Kaiščiai: 3. Pirma atidaryk apatinę sklendę (#3), tada įstrižą užtvarą (#2) ir galiausiai viršų (#1)!',
      reward: 3,
      requiredGoal: 6,
      walls: [
        // Viršutinė dešinė kamera
        { x1: 410, y1: 32, x2: 410, y2: 105 },
        { x1: 525, y1: 32, x2: 525, y2: 105 },
        // Švelnus posūkis iš dešinės į centrą
        { x1: 540, y1: 132, x2: 328, y2: 205 },
        // Tarpinė kišenė su žemu kairiu kraštu (jei #2 uždarytas – išsipils į kairę!)
        { x1: 230, y1: 192, x2: 230, y2: 214 },
        { x1: 230, y1: 214, x2: 262, y2: 222 },
        // Centrinis vamzdis žemyn į kolbą (turi apsaugą kairėje, kad neperšoktų atidarius #2)
        { x1: 245, y1: 245, x2: 272, y2: 345 },
        { x1: 375, y1: 230, x2: 360, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 405, y1: 109, x2: 530, y2: 109, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 258, y1: 222, x2: 332, y2: 208, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3', x1: 258, y1: 280, x2: 368, y2: 280, dirX: 1, dirY: 0 }
      ],
      goal: { x: 255, y: 345, w: 120, h: 92 },
      trap: null,
      makeBalls: () => spawnBalls(467, 52, 3, 6, 'colored', COLORS.purple)
    }
  ],

  grade3: [
    {
      id: 'pp_g3_1',
      title: '1. Spąstai ar spalvos?',
      instruction: 'Kaiščiai: 4. Nuleisk pilkus (#2) į duobę per #3 (arba sumaišyk #1 + #2 kameroje), ir tik tada atidaryk kolbą (#4)!',
      reward: 1,
      requiredGoal: 4,
      walls: [
        // Pilka kamera (kairė -> krenta virš #3 link duobės arba rieda į dešinę)
        { x1: 145, y1: 32, x2: 145, y2: 110 },
        { x1: 250, y1: 32, x2: 250, y2: 110 },
        // Kairė duobės šachta (užtverta kaiščiu #3!)
        { x1: 140, y1: 130, x2: 120, y2: 350 },
        { x1: 255, y1: 222, x2: 200, y2: 350 },
        // Spalvota kamera (dešinė -> tiesiai ant #4 virš kolbos!)
        { x1: 335, y1: 32, x2: 335, y2: 110 },
        { x1: 445, y1: 32, x2: 445, y2: 110 },
        // Piltuvas į kolbą
        { x1: 318, y1: 210, x2: 318, y2: 345 },
        { x1: 455, y1: 145, x2: 440, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Žydri)', x1: 330, y1: 114, x2: 450, y2: 114, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Pilki)', x1: 140, y1: 114, x2: 255, y2: 114, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Duobė)', x1: 135, y1: 215, x2: 258, y2: 222, dirX: -1, dirY: 0 },
        { id: 'p4', label: '#4 (Kolba)', x1: 314, y1: 272, x2: 452, y2: 272, dirX: 1, dirY: 0 }
      ],
      goal: { x: 315, y: 345, w: 128, h: 92 },
      trap: { x: 85, y: 355, w: 130, h: 82 },
      makeBalls: () => [
        ...spawnBalls(390, 56, 2, 4, 'colored', COLORS.cyan),
        ...spawnBalls(197, 56, 2, 4, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g3_2',
      title: '2. Dažymo kamera',
      instruction: 'Kaiščiai: 4. Tikslui reikia visų 8 rutuliukų! Sumaišyk geltonus (#1) ir pilkus (#2) kameroje, tada nuleisk į kolbą (#3).',
      reward: 2,
      requiredGoal: 8,
      walls: [
        // Kairė (geltoni)
        { x1: 175, y1: 35, x2: 175, y2: 110 },
        { x1: 280, y1: 35, x2: 280, y2: 110 },
        // Dešinė (pilki)
        { x1: 360, y1: 35, x2: 360, y2: 110 },
        { x1: 465, y1: 35, x2: 465, y2: 110 },
        // Maišymo dubuo (uždarytas kol neatidarai #3 arba #4)
        { x1: 175, y1: 125, x2: 245, y2: 240 },
        { x1: 465, y1: 125, x2: 395, y2: 240 },
        // Išėjimas į kolbą
        { x1: 285, y1: 250, x2: 285, y2: 345 },
        { x1: 395, y1: 240, x2: 395, y2: 345 },
        // Kairė duobės šachta (uždaryta #4 – jos traukti NEGALIMA!)
        { x1: 205, y1: 270, x2: 155, y2: 350 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 170, y1: 114, x2: 285, y2: 114, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 355, y1: 114, x2: 470, y2: 114, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3 (Kolba)', x1: 282, y1: 250, x2: 398, y2: 250, dirX: 1, dirY: 0 },
        { id: 'p4', label: '#4 (Spąstai)', x1: 242, y1: 242, x2: 288, y2: 252, dirX: -1, dirY: 0 }
      ],
      goal: { x: 280, y: 345, w: 122, h: 92 },
      trap: { x: 75, y: 355, w: 125, h: 82 },
      makeBalls: () => [
        ...spawnBalls(227, 56, 2, 4, 'colored', COLORS.yellow),
        ...spawnBalls(412, 56, 2, 4, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g3_3',
      title: '3. Išvalyk kanalą',
      instruction: 'Kaiščiai: 5. Pirma išpilk viršutinius pilkus rutuliukus į kairę duobę (#2 → #1), tada atvesk žalius (#4 → #5)!',
      reward: 2,
      requiredGoal: 5,
      walls: [
        // Viršutinė pilkų kamera
        { x1: 190, y1: 30, x2: 190, y2: 100 },
        { x1: 295, y1: 30, x2: 295, y2: 100 },
        // Skirstytuvas po pilkais (aukšta centrinė pertvara x=315 atskiria pilkus nuo žaliųjų!)
        { x1: 315, y1: 115, x2: 315, y2: 260 },
        { x1: 155, y1: 175, x2: 125, y2: 350 },
        { x1: 245, y1: 230, x2: 210, y2: 350 },
        // Dešinė žaliųjų kamera
        { x1: 425, y1: 45, x2: 425, y2: 130 },
        { x1: 530, y1: 45, x2: 530, y2: 130 },
        // Žaliasis piltuvas į kolbą
        { x1: 365, y1: 255, x2: 365, y2: 345 },
        { x1: 525, y1: 175, x2: 475, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 185, y1: 104, x2: 300, y2: 104, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2 (Duobė)', x1: 160, y1: 176, x2: 312, y2: 162, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Tiltas)', x1: 250, y1: 226, x2: 362, y2: 250, dirX: 1, dirY: 0 },
        { id: 'p4', label: '#4', x1: 420, y1: 134, x2: 535, y2: 134, dirX: 1, dirY: 0 },
        { id: 'p5', label: '#5 (Kolba)', x1: 360, y1: 265, x2: 500, y2: 265, dirX: 1, dirY: 0 }
      ],
      goal: { x: 358, y: 345, w: 122, h: 92 },
      trap: { x: 95, y: 355, w: 130, h: 82 },
      makeBalls: () => [
        ...spawnBalls(242, 50, 2, 4, 'gray', COLORS.gray),
        ...spawnBalls(477, 65, 3, 5, 'colored', COLORS.green)
      ]
    },
    {
      id: 'pp_g3_4',
      title: '4. Didysis maišytuvas',
      instruction: 'Kaiščiai: 5. Surink 7 violetinius rutuliukus! Sumaišyk #1 ir #2 kameroje, tada atidaryk kelią žemyn (#4 → #5).',
      reward: 2,
      requiredGoal: 7,
      walls: [
        // Kairė kamera (4 violetiniai)
        { x1: 175, y1: 30, x2: 175, y2: 102 },
        { x1: 280, y1: 30, x2: 280, y2: 102 },
        // Dešinė kamera (3 pilki)
        { x1: 360, y1: 30, x2: 360, y2: 102 },
        { x1: 465, y1: 30, x2: 465, y2: 102 },
        // Maišymo rezervuaras
        { x1: 175, y1: 118, x2: 235, y2: 215 },
        { x1: 465, y1: 118, x2: 405, y2: 215 },
        // Šoninė duobė kairėje (saugoma #3!)
        { x1: 175, y1: 250, x2: 135, y2: 350 },
        // Žemutinis šliuzas į kolbą
        { x1: 270, y1: 225, x2: 285, y2: 345 },
        { x1: 405, y1: 215, x2: 395, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 170, y1: 106, x2: 285, y2: 106, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 355, y1: 106, x2: 470, y2: 106, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3 (Spąstai)', x1: 230, y1: 215, x2: 272, y2: 225, dirX: -1, dirY: 0 },
        { id: 'p4', label: '#4', x1: 270, y1: 225, x2: 405, y2: 225, dirX: 1, dirY: 0 },
        { id: 'p5', label: '#5 (Kolba)', x1: 275, y1: 288, x2: 400, y2: 288, dirX: 1, dirY: 0 }
      ],
      goal: { x: 280, y: 345, w: 122, h: 92 },
      trap: { x: 65, y: 355, w: 125, h: 82 },
      makeBalls: () => [
        ...spawnBalls(227, 48, 2, 4, 'colored', COLORS.purple),
        ...spawnBalls(412, 52, 2, 3, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g3_5',
      title: '5. Inžinieriaus egzaminas',
      instruction: 'Kaiščiai: 6. Išmesk kairius pilkus į duobę (#4 → #1), sumaišyk centrinius su dešiniais (#2 + #3) ir nuleisk į kolbą (#6 → #5)!',
      reward: 3,
      requiredGoal: 7,
      walls: [
        // Kairė kamera (3 pilki -> į duobę!)
        { x1: 75, y1: 30, x2: 75, y2: 100 },
        { x1: 175, y1: 30, x2: 175, y2: 100 },
        // Kairė šachta žemyn į duobę (turi tiltelį #4 virš duobės vs bloką)
        { x1: 70, y1: 120, x2: 75, y2: 350 },
        { x1: 185, y1: 120, x2: 185, y2: 350 },
        // Vidurinė kamera (4 oranžiniai)
        { x1: 265, y1: 30, x2: 265, y2: 100 },
        { x1: 375, y1: 30, x2: 375, y2: 100 },
        // Dešinė kamera (3 pilki -> maišymui!)
        { x1: 445, y1: 30, x2: 445, y2: 100 },
        { x1: 550, y1: 30, x2: 550, y2: 100 },
        // Maišytuvas dešinėje
        { x1: 265, y1: 118, x2: 325, y2: 215 },
        { x1: 550, y1: 118, x2: 485, y2: 215 },
        // Vamzdis į kolbą
        { x1: 325, y1: 225, x2: 345, y2: 345 },
        { x1: 485, y1: 215, x2: 465, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 70, y1: 104, x2: 180, y2: 104, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 260, y1: 104, x2: 380, y2: 104, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3', x1: 440, y1: 104, x2: 555, y2: 104, dirX: 1, dirY: 0 },
        { id: 'p4', label: '#4 (Duobė)', x1: 72, y1: 225, x2: 188, y2: 225, dirX: -1, dirY: 0 },
        { id: 'p5', label: '#5', x1: 322, y1: 220, x2: 488, y2: 220, dirX: 1, dirY: 0 },
        { id: 'p6', label: '#6 (Kolba)', x1: 336, y1: 288, x2: 474, y2: 288, dirX: 1, dirY: 0 }
      ],
      goal: { x: 340, y: 345, w: 132, h: 92 },
      trap: { x: 65, y: 355, w: 130, h: 82 },
      makeBalls: () => [
        ...spawnBalls(125, 52, 2, 3, 'gray', COLORS.gray),
        ...spawnBalls(320, 50, 2, 4, 'colored', COLORS.orange),
        ...spawnBalls(497, 52, 2, 3, 'gray', COLORS.gray)
      ]
    }
  ]
};

// ==================== FIZIKOS IR PIEŠIMO PAGALBINĖS FUNKCIJOS ====================
function closestPointOnSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = 0;
  if (lenSq > 0.0001) {
    t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  }
  return { cx: x1 + t * dx, cy: y1 + t * dy, t };
}

export class PinPullEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;
    this.hoveredPinId = null;
    this.rafId = null;
    this.lastPinHit = null;
    this.reset();
  }

  reset() {
    this.balls = this.level.makeBalls();
    this.pins = this.level.pins.map((p) => ({
      ...p,
      pulling: false,
      removed: false,
      offset: 0
    }));
    this.sparks = [];
    this.status = 'playing'; // 'playing' | 'won' | 'failed'
    this.failReason = '';
    this.goalCount = 0;
    this.trapCount = 0;
    this.reportStatus();
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getActivePinRect(pin) {
    const shiftX = pin.dirX * pin.offset;
    const shiftY = pin.dirY * pin.offset;
    return {
      x1: pin.x1 + shiftX,
      y1: pin.y1 + shiftY,
      x2: pin.x2 + shiftX,
      y2: pin.y2 + shiftY
    };
  }

  findPinAt(mx, my) {
    for (const pin of this.pins) {
      if (pin.removed || pin.pulling) continue;
      const seg = this.getActivePinRect(pin);
      const { cx, cy } = closestPointOnSegment(mx, my, seg.x1, seg.y1, seg.x2, seg.y2);
      const dSeg = Math.hypot(mx - cx, my - cy);

      // Rankenėlės taškas traukimo kryptimi
      const hx = pin.dirX >= 0 ? seg.x2 + 12 : seg.x1 - 12;
      const hy = pin.dirX >= 0 ? seg.y2 : seg.y1;
      const dHandle = Math.hypot(mx - hx, my - hy);

      if (dSeg <= 20 || dHandle <= 22) {
        return pin;
      }
    }
    return null;
  }

  pullPin(pinId) {
    if (this.status !== 'playing') return false;
    const pin = this.pins.find((p) => p.id === pinId);
    if (!pin || pin.pulling || pin.removed) return false;
    pin.pulling = true;
    return true;
  }

  handlePointerDown(mx, my) {
    const pin = this.findPinAt(mx, my);
    if (pin) {
      this.pullPin(pin.id);
      return true;
    }
    return false;
  }

  handlePointerMove(mx, my) {
    const pin = this.findPinAt(mx, my);
    this.hoveredPinId = pin ? pin.id : null;
    this.canvas.style.cursor = pin && this.status === 'playing' ? 'pointer' : 'default';
  }

  spawnMixSparks(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 2.6;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color,
        life: 24
      });
    }
  }

  step() {
    // 1. Kaiščių ištraukimo animacija
    for (const pin of this.pins) {
      if (pin.pulling && !pin.removed) {
        pin.offset += 9.5;
        const len = Math.hypot(pin.x2 - pin.x1, pin.y2 - pin.y1);
        if (pin.offset >= len + 48) {
          pin.removed = true;
        }
      }
    }

    // 2. Fizikos sub-žingsniai, kad rutuliukai niekada nepralįstų pro sieneles ar kaiščius
    const dt = 1 / SUBSTEPS;
    const activePins = this.pins.filter((p) => !p.removed).map((p) => this.getActivePinRect(p));

    for (let s = 0; s < SUBSTEPS; s++) {
      for (const b of this.balls) {
        if (b.removed) continue;
        b.vy += GRAVITY * dt;
        b.vx *= 0.997;
        b.vy *= 0.997;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Sienelės
        for (const w of this.level.walls) {
          this.resolveCircleSegment(b, w.x1, w.y1, w.x2, w.y2, WALL_RADIUS, 0.25);
        }

        // Kaiščiai
        for (const pSeg of activePins) {
          this.resolveCircleSegment(b, pSeg.x1, pSeg.y1, pSeg.x2, pSeg.y2, PIN_RADIUS, 0.18);
        }

        // Tikslo kolbos sienos (atviras viršus!)
        const g = this.level.goal;
        this.resolveCircleSegment(b, g.x, g.y, g.x, g.y + g.h, 4, 0.2);
        this.resolveCircleSegment(b, g.x + g.w, g.y, g.x + g.w, g.y + g.h, 4, 0.2);
        this.resolveCircleSegment(b, g.x, g.y + g.h, g.x + g.w, g.y + g.h, 5, 0.15);

        // Spąstų duobės sienos (atviras viršus!)
        if (this.level.trap) {
          const t = this.level.trap;
          this.resolveCircleSegment(b, t.x, t.y, t.x, t.y + t.h, 4, 0.2);
          this.resolveCircleSegment(b, t.x + t.w, t.y, t.x + t.w, t.y + t.h, 4, 0.2);
          this.resolveCircleSegment(b, t.x, t.y + t.h, t.x + t.w, t.y + t.h, 5, 0.1);
        }
      }

      // Rutuliukų susidūrimai tarpusavyje + pilkų dažymas
      for (let i = 0; i < this.balls.length; i++) {
        const a = this.balls[i];
        if (a.removed) continue;
        for (let j = i + 1; j < this.balls.length; j++) {
          const b = this.balls[j];
          if (b.removed) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.r + b.r;
          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.5;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;

            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;
            if (velAlongNormal < 0) {
              const jImp = -(1 + 0.35) * velAlongNormal * 0.5;
              a.vx -= jImp * nx;
              a.vy -= jImp * ny;
              b.vx += jImp * nx;
              b.vy += jImp * ny;
            }

            // Pilkas + spalvotas susilietimas -> pilkas nusidažo!
            if (a.kind === 'gray' && b.kind === 'colored') {
              a.kind = 'colored';
              a.color = b.color;
              this.spawnMixSparks(a.x, a.y, b.color);
            } else if (b.kind === 'gray' && a.kind === 'colored') {
              b.kind = 'colored';
              b.color = a.color;
              this.spawnMixSparks(b.x, b.y, a.color);
            }
          }
        }
      }
    }

    // 3. Kibirkštys
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life--;
      if (sp.life <= 0) this.sparks.splice(i, 1);
    }

    // 4. Tikslo, duobės ir iškritimo iš ekrano tikrinimas
    const g = this.level.goal;
    const t = this.level.trap;
    let coloredInGoal = 0;
    let remainingColored = 0;

    for (const b of this.balls) {
      if (b.removed) continue;

      // Ar įkrito į tikslo kolbą?
      if (b.x > g.x + 6 && b.x < g.x + g.w - 6 && b.y > g.y + 18 && b.y < g.y + g.h) {
        if (b.kind === 'gray') {
          if (this.status === 'playing') {
            this.status = 'failed';
            this.failReason = '⚠️ Užterštas pilkas rutuliukas pateko į kolbą! Pirma jį sumaišyk su spalvotais arba nukreipk į duobę.';
            this.reportStatus();
          }
        } else {
          b.inGoal = true;
          coloredInGoal++;
        }
      }

      // Ar pateko į spąstų duobę?
      if (t && b.x > t.x + 6 && b.x < t.x + t.w - 6 && b.y > t.y + 18 && b.y < t.y + t.h) {
        if (b.kind === 'gray') {
          b.removed = true;
          this.trapCount++;
          this.spawnMixSparks(b.x, b.y, '#94a3b8');
          continue;
        } else if (this.status === 'playing') {
          b.removed = true;
          this.spawnMixSparks(b.x, b.y, '#ef4444');
        }
      }

      // Ar iškrito už ekrano ribų (pro šoną arba apačią)?
      if (b.x < -15 || b.x > CANVAS_W + 15 || b.y > CANVAS_H + 20) {
        b.removed = true;
        if (b.kind === 'colored' && this.status === 'playing') {
          this.status = 'failed';
          this.failReason = '💥 Rutuliukai iškrito pro šoną! Paspausk „Iš naujo (Reset)“ ir pabandyk kitą kaiščių tvarką.';
          this.reportStatus();
        }
      }

      if (!b.removed && b.kind === 'colored') {
        remainingColored++;
      }
    }

    this.goalCount = coloredInGoal;

    if (this.status === 'playing') {
      if (coloredInGoal >= this.level.requiredGoal) {
        this.status = 'won';
        this.reportStatus();
      } else {
        const potentialTotal = this.balls.filter((b) => !b.removed).length;
        if (potentialTotal < this.level.requiredGoal) {
          this.status = 'failed';
          this.failReason = '💥 Per daug spalvotų rutuliukų prarasta! Paspausk „Iš naujo (Reset)“ ir bandyk dar kartą.';
          this.reportStatus();
        } else {
          this.callbacks.onTick?.({ goalCount: this.goalCount, requiredGoal: this.level.requiredGoal });
        }
      }
    }
  }

  resolveCircleSegment(ball, x1, y1, x2, y2, segRadius, restitution) {
    const { cx, cy } = closestPointOnSegment(ball.x, ball.y, x1, y1, x2, y2);
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const dist = Math.hypot(dx, dy);
    const minDist = ball.r + segRadius;
    if (dist < minDist && dist > 0.0001) {
      const nx = dx / dist;
      const ny = dy / dist;
      ball.x += nx * (minDist - dist);
      ball.y += ny * (minDist - dist);

      const vn = ball.vx * nx + ball.vy * ny;
      if (vn < 0) {
        ball.vx -= (1 + restitution) * vn * nx;
        ball.vy -= (1 + restitution) * vn * ny;
      }
    }
  }

  reportStatus() {
    this.callbacks.onStatusChange?.({
      status: this.status,
      failReason: this.failReason,
      goalCount: this.goalCount,
      requiredGoal: this.level.requiredGoal
    });
  }

  startLoop() {
    const frame = () => {
      this.step();
      this.draw();
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 1. Laboratorinis tinklelis fone
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_H; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }

    // 2. Spąstų duobė (jei yra – 3 klasės lygiuose)
    if (this.level.trap) {
      const t = this.level.trap;
      ctx.save();
      ctx.fillStyle = 'rgba(127, 29, 29, 0.65)';
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(t.x, t.y, t.w, t.h);
      ctx.font = '800 13px "Nunito", sans-serif';
      ctx.fillStyle = '#fecaca';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ SPĄSTŲ DUOBĖ', t.x + t.w / 2, t.y + t.h - 12);
      ctx.restore();
    }

    // 3. Tikslo kolba apačioje
    const g = this.level.goal;
    ctx.save();
    ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
    ctx.fillRect(g.x, g.y, g.w, g.h);
    ctx.strokeStyle = this.status === 'won' ? '#4ade80' : '#22d3ee';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x, g.y + g.h);
    ctx.lineTo(g.x + g.w, g.y + g.h);
    ctx.lineTo(g.x + g.w, g.y);
    ctx.stroke();

    ctx.font = '900 13px "Russo One", sans-serif';
    ctx.fillStyle = '#67e8f9';
    ctx.textAlign = 'center';
    ctx.fillText(`🧪 KOLBA (${this.goalCount}/${this.level.requiredGoal})`, g.x + g.w / 2, g.y + g.h - 10);
    ctx.restore();

    // 4. Stiklinės sienelės / kanalai
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = WALL_RADIUS * 2 + 4;
    for (const w of this.level.walls) {
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = WALL_RADIUS * 1.3;
    for (const w of this.level.walls) {
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Metaliniai kaiščiai (Pins)
    for (const pin of this.pins) {
      if (pin.removed) continue;
      const seg = this.getActivePinRect(pin);
      const isHover = this.hoveredPinId === pin.id && !pin.pulling;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = PIN_RADIUS * 2 + 4;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();

      ctx.strokeStyle = isHover ? '#fde047' : '#f59e0b';
      ctx.lineWidth = PIN_RADIUS * 2;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();

      // Rankenėlė traukimui
      const hx = pin.dirX >= 0 ? seg.x2 + 12 : seg.x1 - 12;
      const hy = pin.dirX >= 0 ? seg.y2 : seg.y1;
      ctx.fillStyle = isHover ? '#fef08a' : '#facc15';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hx, hy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 10px "Russo One", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pin.label.replace(/\s*\(.*\)/, ''), hx, hy + 0.5);
      ctx.restore();
    }

    // 6. Rutuliukai
    for (const b of this.balls) {
      if (b.removed) continue;
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = b.kind === 'gray' ? '#334155' : '#020617';
      ctx.stroke();

      // Blizgesys arba užterštumo kryželis
      if (b.kind === 'gray') {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y - 4);
        ctx.lineTo(b.x + 4, b.y + 4);
        ctx.moveTo(b.x + 4, b.y - 4);
        ctx.lineTo(b.x - 4, b.y + 4);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 7. Maišymosi / spąstų kibirkštys
    for (const sp of this.sparks) {
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = Math.max(0, sp.life / 24);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
