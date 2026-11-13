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
  gray: '#94a3b8',
  water: '#38bdf8'
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
      color: kind === 'gray' ? COLORS.gray : kind === 'water' ? COLORS.water : color,
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
      title: '3. Ugnies lava ir vanduo',
      instruction: 'Kaiščiai: 3. Pirma užgesink raudoną lavą vandeniu (#1) ir atidaryk kolbą (#3), tik tada leisk žalius (#2)!',
      reward: 2,
      requiredGoal: 6,
      walls: [
        // Žaliųjų kamera (viršus kairė)
        { x1: 80, y1: 25, x2: 80, y2: 88 },
        { x1: 185, y1: 25, x2: 185, y2: 88 },
        // Vandens kamera (viršus centras)
        { x1: 225, y1: 25, x2: 225, y2: 88 },
        { x1: 315, y1: 25, x2: 315, y2: 88 },
        // Latakas nuo žaliųjų link lavos tilto
        { x1: 76, y1: 120, x2: 186, y2: 222 },
        { x1: 186, y1: 222, x2: 186, y2: 254 },
        // Piltuvėlis į tikslo kolbą (su išpylimo lūpa dešinėje jei #3 uždarytas)
        { x1: 346, y1: 280, x2: 372, y2: 310 },
        { x1: 495, y1: 286, x2: 495, y2: 308 },
        { x1: 368, y1: 320, x2: 368, y2: 345 },
        { x1: 490, y1: 320, x2: 490, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 220, y1: 92, x2: 320, y2: 92, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Žali)', x1: 75, y1: 92, x2: 190, y2: 92, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Kolba)', x1: 368, y1: 314, x2: 494, y2: 314, dirX: 1, dirY: 0 }
      ],
      goal: { x: 368, y: 345, w: 122, h: 92 },
      trap: { x: 190, y: 248, w: 152, h: 78, lava: true, bridgeSlope: 28 },
      makeBalls: () => [
        ...spawnBalls(270, 46, 2, 4, 'water', COLORS.water),
        ...spawnBalls(132, 42, 3, 6, 'colored', COLORS.green)
      ]
    },
    {
      id: 'pp_g1_4',
      title: '4. Tiltas virš lavos',
      instruction: 'Kaiščiai: 4. NEIŠTRAUK tilto (#3)! Pirma atverk kolbą (#4), o tada leisk #1 ir #2 virš lavos duobės.',
      reward: 2,
      requiredGoal: 6,
      walls: [
        // Kairė kamera (oranžiniai)
        { x1: 105, y1: 30, x2: 105, y2: 108 },
        { x1: 205, y1: 30, x2: 205, y2: 108 },
        // Dešinė kamera (žydri)
        { x1: 370, y1: 30, x2: 370, y2: 108 },
        { x1: 475, y1: 30, x2: 475, y2: 108 },
        // Kairė išpylimo apsauga link lavos jei #4 uždarytas
        { x1: 320, y1: 266, x2: 355, y2: 278 },
        { x1: 292, y1: 284, x2: 198, y2: 345 },
        // Dešinė siena link kolbos
        { x1: 486, y1: 195, x2: 476, y2: 345 },
        { x1: 352, y1: 288, x2: 355, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1', x1: 100, y1: 112, x2: 210, y2: 112, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2', x1: 365, y1: 112, x2: 480, y2: 112, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3 (Tiltas)', x1: 95, y1: 185, x2: 332, y2: 246, dirX: -1, dirY: -0.25 },
        { id: 'p4', label: '#4 (Kolba)', x1: 350, y1: 280, x2: 482, y2: 280, dirX: 1, dirY: 0 }
      ],
      goal: { x: 355, y: 345, w: 122, h: 92 },
      trap: { x: 80, y: 345, w: 145, h: 92, lava: true },
      makeBalls: () => [
        ...spawnBalls(155, 52, 2, 3, 'colored', COLORS.orange),
        ...spawnBalls(422, 52, 2, 3, 'colored', COLORS.cyan)
      ]
    },
    {
      id: 'pp_g1_5',
      title: '5. Keturios sklendės ir lava',
      instruction: 'Kaiščiai: 4. Suplanuok visus 4 žingsnius: atšaldyk lavą (#1), atverk kolbą (#4), vidurinį (#3) ir viršutinį (#2)!',
      reward: 3,
      requiredGoal: 6,
      walls: [
        // Viršutinė kairė kamera (violetiniai)
        { x1: 75, y1: 24, x2: 75, y2: 80 },
        { x1: 175, y1: 24, x2: 175, y2: 80 },
        // Vidurinė kamera su žemu kairiu kraštu (jei #3 uždarytas – išsipila!)
        { x1: 72, y1: 132, x2: 72, y2: 156 },
        { x1: 182, y1: 100, x2: 182, y2: 156 },
        // Vandens kamera (viršus centras)
        { x1: 218, y1: 24, x2: 218, y2: 80 },
        { x1: 312, y1: 24, x2: 312, y2: 80 },
        // Latakas nuo #3 ant lavos tilto
        { x1: 68, y1: 186, x2: 186, y2: 232 },
        { x1: 186, y1: 232, x2: 186, y2: 254 },
        // Piltuvėlis į kolbą (išpylimas dešinėje jei #4 uždarytas)
        { x1: 350, y1: 280, x2: 376, y2: 308 },
        { x1: 500, y1: 286, x2: 500, y2: 308 },
        { x1: 374, y1: 318, x2: 374, y2: 345 },
        { x1: 496, y1: 318, x2: 496, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 214, y1: 84, x2: 316, y2: 84, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Viršus)', x1: 70, y1: 84, x2: 180, y2: 84, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Sklendė)', x1: 74, y1: 160, x2: 184, y2: 160, dirX: -1, dirY: 0 },
        { id: 'p4', label: '#4 (Kolba)', x1: 372, y1: 312, x2: 498, y2: 312, dirX: 1, dirY: 0 }
      ],
      goal: { x: 374, y: 345, w: 122, h: 92 },
      trap: { x: 190, y: 248, w: 155, h: 78, lava: true, bridgeSlope: 28 },
      makeBalls: () => [
        ...spawnBalls(265, 42, 2, 4, 'water', COLORS.water),
        ...spawnBalls(125, 40, 3, 6, 'colored', COLORS.purple)
      ]
    },
    {
      id: 'pp_g1_6',
      title: '6. Spalvotas dažymas',
      instruction: 'Kaiščiai: 3. Pirma sumaišyk žydrus (#1) ir pilkus (#2) maišytuve, tik tada atidaryk kolbą (#3)!',
      reward: 2,
      requiredGoal: 6,
      walls: [
        { x1: 195, y1: 28, x2: 195, y2: 105 },
        { x1: 295, y1: 28, x2: 295, y2: 105 },
        { x1: 345, y1: 28, x2: 345, y2: 105 },
        { x1: 445, y1: 28, x2: 445, y2: 105 },
        { x1: 195, y1: 122, x2: 266, y2: 222 },
        { x1: 445, y1: 122, x2: 374, y2: 222 },
        { x1: 266, y1: 235, x2: 266, y2: 345 },
        { x1: 374, y1: 235, x2: 374, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Žydri)', x1: 190, y1: 109, x2: 300, y2: 109, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2 (Pilki)', x1: 340, y1: 109, x2: 450, y2: 109, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3 (Kolba)', x1: 262, y1: 226, x2: 378, y2: 226, dirX: 1, dirY: 0 }
      ],
      goal: { x: 260, y: 345, w: 120, h: 92 },
      trap: null,
      makeBalls: () => [
        ...spawnBalls(245, 48, 2, 3, 'colored', COLORS.cyan),
        ...spawnBalls(395, 48, 2, 3, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g1_7',
      title: '7. Vandens kelias per lavą',
      instruction: 'Kaiščiai: 3. Atšaldyk lavą (#1), atidaryk kolbą (#3) ir tik tada paleisk geltonus rutuliukus (#2)!',
      reward: 2,
      requiredGoal: 5,
      walls: [
        { x1: 76, y1: 26, x2: 76, y2: 92 },
        { x1: 180, y1: 26, x2: 180, y2: 92 },
        { x1: 215, y1: 26, x2: 215, y2: 92 },
        { x1: 312, y1: 26, x2: 312, y2: 92 },
        { x1: 72, y1: 118, x2: 184, y2: 224 },
        { x1: 184, y1: 224, x2: 184, y2: 254 },
        { x1: 346, y1: 280, x2: 372, y2: 310 },
        { x1: 496, y1: 286, x2: 496, y2: 308 },
        { x1: 368, y1: 320, x2: 368, y2: 345 },
        { x1: 492, y1: 320, x2: 492, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 210, y1: 96, x2: 316, y2: 96, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Geltoni)', x1: 72, y1: 96, x2: 184, y2: 96, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Kolba)', x1: 366, y1: 314, x2: 496, y2: 314, dirX: 1, dirY: 0 }
      ],
      goal: { x: 368, y: 345, w: 124, h: 92 },
      trap: { x: 188, y: 248, w: 154, h: 78, lava: true, bridgeSlope: 34 },
      makeBalls: () => [
        ...spawnBalls(264, 46, 2, 4, 'water', COLORS.water),
        ...spawnBalls(128, 44, 3, 5, 'colored', COLORS.yellow)
      ]
    },
    {
      id: 'pp_g1_8',
      title: '8. Saugus tiltas virš lavos',
      instruction: 'Kaiščiai: 4. NEIŠTRAUK tilto (#3)! Pirma atverk kolbą (#4), o tada leisk abu žaliųjų srautus (#1 ir #2).',
      reward: 2,
      requiredGoal: 6,
      walls: [
        { x1: 95, y1: 28, x2: 95, y2: 105 },
        { x1: 195, y1: 28, x2: 195, y2: 105 },
        { x1: 375, y1: 28, x2: 375, y2: 105 },
        { x1: 475, y1: 28, x2: 475, y2: 105 },
        { x1: 322, y1: 266, x2: 355, y2: 278 },
        { x1: 292, y1: 284, x2: 198, y2: 345 },
        { x1: 486, y1: 195, x2: 476, y2: 345 },
        { x1: 352, y1: 288, x2: 355, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Žali)', x1: 90, y1: 109, x2: 200, y2: 109, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2 (Žali)', x1: 370, y1: 109, x2: 480, y2: 109, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3 (Tiltas)', x1: 88, y1: 185, x2: 332, y2: 246, dirX: -1, dirY: -0.25 },
        { id: 'p4', label: '#4 (Kolba)', x1: 350, y1: 280, x2: 482, y2: 280, dirX: 1, dirY: 0 }
      ],
      goal: { x: 355, y: 345, w: 122, h: 92 },
      trap: { x: 80, y: 345, w: 145, h: 92, lava: true },
      makeBalls: () => [
        ...spawnBalls(145, 50, 2, 3, 'colored', COLORS.green),
        ...spawnBalls(425, 50, 2, 3, 'colored', COLORS.green)
      ]
    },
    {
      id: 'pp_g1_9',
      title: '9. Dažymo kaskada ir lava',
      instruction: 'Kaiščiai: 4. Užgesink lavą (#1), nudažyk pilkus (#2), atidaryk kolbą (#4) ir paleisk visus (#3)!',
      reward: 3,
      requiredGoal: 6,
      walls: [
        { x1: 72, y1: 22, x2: 72, y2: 80 },
        { x1: 178, y1: 22, x2: 178, y2: 80 },
        { x1: 72, y1: 94, x2: 72, y2: 158 },
        { x1: 182, y1: 94, x2: 182, y2: 158 },
        { x1: 220, y1: 22, x2: 220, y2: 80 },
        { x1: 314, y1: 22, x2: 314, y2: 80 },
        { x1: 68, y1: 186, x2: 186, y2: 232 },
        { x1: 186, y1: 232, x2: 186, y2: 254 },
        { x1: 348, y1: 280, x2: 374, y2: 310 },
        { x1: 498, y1: 286, x2: 498, y2: 308 },
        { x1: 372, y1: 320, x2: 372, y2: 345 },
        { x1: 494, y1: 320, x2: 494, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 215, y1: 84, x2: 318, y2: 84, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Violetiniai)', x1: 68, y1: 84, x2: 182, y2: 84, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Sklendė)', x1: 68, y1: 162, x2: 186, y2: 162, dirX: -1, dirY: 0 },
        { id: 'p4', label: '#4 (Kolba)', x1: 370, y1: 314, x2: 498, y2: 314, dirX: 1, dirY: 0 }
      ],
      goal: { x: 372, y: 345, w: 122, h: 92 },
      trap: { x: 190, y: 248, w: 154, h: 78, lava: true, bridgeSlope: 34 },
      makeBalls: () => [
        ...spawnBalls(267, 42, 2, 4, 'water', COLORS.water),
        ...spawnBalls(125, 38, 2, 3, 'colored', COLORS.purple),
        ...spawnBalls(125, 114, 2, 3, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g1_10',
      title: '10. Didysis 1 kl. vandenynas',
      instruction: 'Finalas! Atšaldyk lavą (#1), sumaišyk pilkus su žaliais (#2), atverk kolbą (#4) ir paleisk visus 8 (#3)!',
      reward: 3,
      requiredGoal: 8,
      walls: [
        { x1: 70, y1: 20, x2: 70, y2: 78 },
        { x1: 180, y1: 20, x2: 180, y2: 78 },
        { x1: 70, y1: 92, x2: 70, y2: 162 },
        { x1: 184, y1: 92, x2: 184, y2: 162 },
        { x1: 222, y1: 20, x2: 222, y2: 78 },
        { x1: 316, y1: 20, x2: 316, y2: 78 },
        { x1: 68, y1: 188, x2: 186, y2: 234 },
        { x1: 186, y1: 234, x2: 186, y2: 254 },
        { x1: 348, y1: 280, x2: 374, y2: 310 },
        { x1: 502, y1: 286, x2: 502, y2: 308 },
        { x1: 372, y1: 320, x2: 372, y2: 345 },
        { x1: 498, y1: 320, x2: 498, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 218, y1: 82, x2: 320, y2: 82, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Žali)', x1: 66, y1: 82, x2: 184, y2: 82, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Sklendė)', x1: 66, y1: 166, x2: 188, y2: 166, dirX: -1, dirY: 0 },
        { id: 'p4', label: '#4 (Kolba)', x1: 370, y1: 314, x2: 500, y2: 314, dirX: 1, dirY: 0 }
      ],
      goal: { x: 372, y: 345, w: 126, h: 92 },
      trap: { x: 190, y: 248, w: 154, h: 78, lava: true, bridgeSlope: 34 },
      makeBalls: () => [
        ...spawnBalls(269, 40, 2, 4, 'water', COLORS.water),
        ...spawnBalls(125, 36, 2, 4, 'colored', COLORS.green),
        ...spawnBalls(125, 114, 2, 4, 'gray', COLORS.gray)
      ]
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
    },
    {
      id: 'pp_g3_6',
      title: '6. Vandens tiltas ir pilki spąstai',
      instruction: 'Kaiščiai: 5. Išmesk kairius pilkus į duobę (#2 → #1), atšaldyk lavą (#3), atverk kolbą (#5) ir paleisk žydrus (#4)!',
      reward: 2,
      requiredGoal: 5,
      walls: [
        // Kairė pilkųjų šachta į akliną duobę (kairė!)
        { x1: 50, y1: 28, x2: 50, y2: 100 },
        { x1: 145, y1: 28, x2: 145, y2: 100 },
        { x1: 48, y1: 118, x2: 48, y2: 345 },
        { x1: 148, y1: 118, x2: 148, y2: 345 },
        // Žydrieji viršuje centre-kairėje
        { x1: 175, y1: 24, x2: 175, y2: 92 },
        { x1: 270, y1: 24, x2: 270, y2: 92 },
        { x1: 172, y1: 120, x2: 275, y2: 222 },
        { x1: 275, y1: 222, x2: 275, y2: 254 },
        // Vanduo virš lavos tilto
        { x1: 300, y1: 24, x2: 300, y2: 92 },
        { x1: 392, y1: 24, x2: 392, y2: 92 },
        // Piltuvas į kolbą dešinėje
        { x1: 422, y1: 280, x2: 446, y2: 310 },
        { x1: 572, y1: 286, x2: 572, y2: 308 },
        { x1: 444, y1: 320, x2: 444, y2: 345 },
        { x1: 568, y1: 320, x2: 568, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Pilki)', x1: 46, y1: 104, x2: 148, y2: 104, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2 (Duobė)', x1: 46, y1: 228, x2: 150, y2: 228, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Vanduo)', x1: 296, y1: 96, x2: 396, y2: 96, dirX: 1, dirY: 0 },
        { id: 'p4', label: '#4 (Žydri)', x1: 171, y1: 96, x2: 274, y2: 96, dirX: -1, dirY: 0 },
        { id: 'p5', label: '#5 (Kolba)', x1: 442, y1: 314, x2: 570, y2: 314, dirX: 1, dirY: 0 }
      ],
      goal: { x: 444, y: 345, w: 124, h: 92 },
      trap: { x: 278, y: 248, w: 144, h: 78, lava: true, bridgeSlope: 34 },
      makeBalls: () => [
        ...spawnBalls(97, 46, 2, 4, 'gray', COLORS.gray),
        ...spawnBalls(222, 44, 3, 5, 'colored', COLORS.cyan),
        ...spawnBalls(346, 44, 2, 4, 'water', COLORS.water)
      ]
    },
    {
      id: 'pp_g3_7',
      title: '7. Dvigubas maišymo bokštas',
      instruction: 'Kaiščiai: 5. Sumaišyk geltonus (#3) su centriniais pilkais (#4 atidaroma vėliau!), kolbos sklendei (#5) atsidarius!',
      reward: 2,
      requiredGoal: 8,
      walls: [
        // Viršutinė geltona kamera
        { x1: 245, y1: 22, x2: 245, y2: 86 },
        { x1: 355, y1: 22, x2: 355, y2: 86 },
        // Vidurinė maišymo kamera (pilki jau joje!)
        { x1: 235, y1: 102, x2: 235, y2: 192 },
        { x1: 365, y1: 102, x2: 365, y2: 192 },
        // Kairė duobė + šachta
        { x1: 78, y1: 28, x2: 78, y2: 96 },
        { x1: 175, y1: 28, x2: 175, y2: 96 },
        { x1: 75, y1: 116, x2: 75, y2: 348 },
        { x1: 178, y1: 116, x2: 178, y2: 348 },
        // Vamzdis į kolbą
        { x1: 235, y1: 212, x2: 245, y2: 345 },
        { x1: 365, y1: 212, x2: 355, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Duobė)', x1: 72, y1: 220, x2: 180, y2: 220, dirX: -1, dirY: 0 },
        { id: 'p2', label: '#2 (Pilki)', x1: 74, y1: 100, x2: 178, y2: 100, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Geltoni)', x1: 240, y1: 90, x2: 360, y2: 90, dirX: 1, dirY: 0 },
        { id: 'p4', label: '#4 (Maišytuvas)', x1: 232, y1: 198, x2: 368, y2: 198, dirX: 1, dirY: 0 },
        { id: 'p5', label: '#5 (Kolba)', x1: 240, y1: 286, x2: 360, y2: 286, dirX: 1, dirY: 0 }
      ],
      goal: { x: 240, y: 345, w: 122, h: 92 },
      trap: { x: 64, y: 355, w: 126, h: 82 },
      makeBalls: () => [
        ...spawnBalls(126, 48, 2, 3, 'gray', COLORS.gray),
        ...spawnBalls(300, 38, 2, 4, 'colored', COLORS.yellow),
        ...spawnBalls(300, 126, 2, 4, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g3_8',
      title: '8. Ugniagesių dažymo grandinė',
      instruction: 'Kaiščiai: 5. Atšaldyk lavą (#1), atverk kolbą (#5), nudažyk pilkus (#2 + #3) ir paleisk pro #4!',
      reward: 3,
      requiredGoal: 7,
      walls: [
        // Kairė maišymo pora (violetiniai #2 viršuje, pilki #3 šalia)
        { x1: 68, y1: 22, x2: 68, y2: 84 },
        { x1: 158, y1: 22, x2: 158, y2: 84 },
        { x1: 185, y1: 22, x2: 185, y2: 84 },
        { x1: 270, y1: 22, x2: 270, y2: 84 },
        // Maišymo dubuo (#4)
        { x1: 66, y1: 98, x2: 112, y2: 175 },
        { x1: 272, y1: 98, x2: 215, y2: 175 },
        // Latakas ant lavos tilto
        { x1: 110, y1: 194, x2: 228, y2: 240 },
        { x1: 228, y1: 240, x2: 228, y2: 256 },
        // Vanduo virš lavos
        { x1: 295, y1: 22, x2: 295, y2: 88 },
        { x1: 388, y1: 22, x2: 388, y2: 88 },
        // Kolba dešinėje
        { x1: 388, y1: 280, x2: 414, y2: 310 },
        { x1: 538, y1: 286, x2: 538, y2: 308 },
        { x1: 410, y1: 320, x2: 410, y2: 345 },
        { x1: 534, y1: 320, x2: 534, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 292, y1: 92, x2: 392, y2: 92, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Violetiniai)', x1: 64, y1: 88, x2: 162, y2: 88, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Pilki)', x1: 182, y1: 88, x2: 274, y2: 88, dirX: 1, dirY: 0 },
        { id: 'p4', label: '#4 (Sklendė)', x1: 108, y1: 180, x2: 220, y2: 180, dirX: -1, dirY: 0 },
        { id: 'p5', label: '#5 (Kolba)', x1: 408, y1: 314, x2: 536, y2: 314, dirX: 1, dirY: 0 }
      ],
      goal: { x: 410, y: 345, w: 124, h: 92 },
      trap: { x: 232, y: 248, w: 152, h: 78, lava: true, bridgeSlope: 34 },
      makeBalls: () => [
        ...spawnBalls(341, 44, 2, 4, 'water', COLORS.water),
        ...spawnBalls(113, 42, 2, 4, 'colored', COLORS.purple),
        ...spawnBalls(227, 42, 2, 3, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g3_9',
      title: '9. Dviguba spalvų laboratorija',
      instruction: 'Kaiščiai: 6. Sumaišyk centrinius pilkus su žaliais (#3 + #4), užgesink lavą (#1), atverk abu sklendes (#2 → #6) ir paleisk (#5)!',
      reward: 3,
      requiredGoal: 8,
      walls: [
        { x1: 66, y1: 20, x2: 66, y2: 78 },
        { x1: 154, y1: 20, x2: 154, y2: 78 },
        { x1: 176, y1: 20, x2: 176, y2: 78 },
        { x1: 266, y1: 20, x2: 266, y2: 78 },
        { x1: 66, y1: 92, x2: 108, y2: 170 },
        { x1: 266, y1: 92, x2: 214, y2: 170 },
        { x1: 106, y1: 192, x2: 228, y2: 238 },
        { x1: 228, y1: 238, x2: 228, y2: 256 },
        { x1: 294, y1: 20, x2: 294, y2: 84 },
        { x1: 386, y1: 20, x2: 386, y2: 84 },
        // Dešinė šoninė kolbos dviguba šachta (#2 virš #6)
        { x1: 388, y1: 280, x2: 412, y2: 310 },
        { x1: 544, y1: 282, x2: 544, y2: 308 },
        { x1: 412, y1: 320, x2: 412, y2: 345 },
        { x1: 540, y1: 320, x2: 540, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 290, y1: 88, x2: 390, y2: 88, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Viršutinis)', x1: 394, y1: 292, x2: 546, y2: 292, dirX: 1, dirY: 0 },
        { id: 'p3', label: '#3 (Žali)', x1: 62, y1: 82, x2: 158, y2: 82, dirX: -1, dirY: 0 },
        { id: 'p4', label: '#4 (Pilki)', x1: 172, y1: 82, x2: 270, y2: 82, dirX: 1, dirY: 0 },
        { id: 'p5', label: '#5 (Sklendė)', x1: 104, y1: 175, x2: 218, y2: 175, dirX: -1, dirY: 0 },
        { id: 'p6', label: '#6 (Kolba)', x1: 410, y1: 316, x2: 542, y2: 316, dirX: 1, dirY: 0 }
      ],
      goal: { x: 412, y: 345, w: 128, h: 92 },
      trap: { x: 232, y: 248, w: 152, h: 78, lava: true, bridgeSlope: 34 },
      makeBalls: () => [
        ...spawnBalls(340, 42, 2, 4, 'water', COLORS.water),
        ...spawnBalls(110, 40, 2, 4, 'colored', COLORS.green),
        ...spawnBalls(221, 40, 2, 4, 'gray', COLORS.gray)
      ]
    },
    {
      id: 'pp_g3_10',
      title: '10. Didysis hidraulikos reaktorius',
      instruction: 'Finalas! Atšaldyk lavą (#1), sumaišyk 10 rutuliukų kameroje (#2 + #3), atverk kolbą (#6) ir išleisk per #4 → #5!',
      reward: 3,
      requiredGoal: 10,
      walls: [
        { x1: 60, y1: 18, x2: 60, y2: 74 },
        { x1: 156, y1: 18, x2: 156, y2: 74 },
        { x1: 176, y1: 18, x2: 176, y2: 74 },
        { x1: 270, y1: 18, x2: 270, y2: 74 },
        // Pirmoji tarpinė kamera (#4)
        { x1: 60, y1: 88, x2: 88, y2: 146 },
        { x1: 270, y1: 88, x2: 226, y2: 146 },
        // Antroji kamera (#5)
        { x1: 88, y1: 162, x2: 110, y2: 204 },
        { x1: 226, y1: 162, x2: 220, y2: 204 },
        // Latakas ant lavos tilto
        { x1: 110, y1: 212, x2: 230, y2: 248 },
        { x1: 230, y1: 248, x2: 230, y2: 256 },
        // Vanduo
        { x1: 294, y1: 18, x2: 294, y2: 82 },
        { x1: 386, y1: 18, x2: 386, y2: 82 },
        // Kolba
        { x1: 390, y1: 280, x2: 416, y2: 310 },
        { x1: 550, y1: 286, x2: 550, y2: 308 },
        { x1: 414, y1: 320, x2: 414, y2: 345 },
        { x1: 546, y1: 320, x2: 546, y2: 345 }
      ],
      pins: [
        { id: 'p1', label: '#1 (Vanduo)', x1: 290, y1: 86, x2: 390, y2: 86, dirX: 1, dirY: 0 },
        { id: 'p2', label: '#2 (Oranžiniai)', x1: 56, y1: 78, x2: 160, y2: 78, dirX: -1, dirY: 0 },
        { id: 'p3', label: '#3 (Pilki)', x1: 172, y1: 78, x2: 274, y2: 78, dirX: 1, dirY: 0 },
        { id: 'p4', label: '#4 (Viršus)', x1: 84, y1: 150, x2: 230, y2: 150, dirX: -1, dirY: 0 },
        { id: 'p5', label: '#5 (Apačia)', x1: 106, y1: 208, x2: 224, y2: 208, dirX: -1, dirY: 0 },
        { id: 'p6', label: '#6 (Kolba)', x1: 412, y1: 314, x2: 548, y2: 314, dirX: 1, dirY: 0 }
      ],
      goal: { x: 414, y: 345, w: 132, h: 92 },
      trap: { x: 234, y: 248, w: 152, h: 78, lava: true, bridgeSlope: 34 },
      makeBalls: () => [
        ...spawnBalls(340, 40, 2, 4, 'water', COLORS.water),
        ...spawnBalls(108, 36, 3, 6, 'colored', COLORS.orange),
        ...spawnBalls(223, 38, 2, 4, 'gray', COLORS.gray)
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
    this.hintPinId = null;
    this.status = 'playing'; // 'playing' | 'winning' | 'won' | 'failed'
    this.isWinning = false;
    this.victoryTimer = 0;
    this.inputLocked = false;
    this.winNotified = false;
    this.liquidFill = 0;
    this.failReason = '';
    this.goalCount = 0;
    this.trapCount = 0;
    this.trapCooled = false;
    this.reportStatus();
  }

  setHintPin(pinId) {
    this.hintPinId = pinId || null;
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
    if (this.status !== 'playing' || this.isWinning || this.inputLocked) return false;
    const pin = this.pins.find((p) => p.id === pinId);
    if (!pin || pin.pulling || pin.removed) return false;
    pin.pulling = true;
    if (this.hintPinId === pinId) {
      this.hintPinId = null;
    } else {
      this.hintPinId = null;
    }
    this.callbacks.onPinPull?.(pinId);
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

        // Spąstų duobės sienos (arba atšalusio akmens tilto viršus!)
        if (this.level.trap) {
          const t = this.level.trap;
          if (t.lava && this.trapCooled && t.bridgeSlope) {
            this.resolveCircleSegment(b, t.x - 4, t.y + 4, t.x + t.w + 4, t.y + t.bridgeSlope, 5, 0.15);
          } else {
            this.resolveCircleSegment(b, t.x, t.y, t.x, t.y + t.h, 4, 0.2);
            this.resolveCircleSegment(b, t.x + t.w, t.y, t.x + t.w, t.y + t.h, 4, 0.2);
            this.resolveCircleSegment(b, t.x, t.y + t.h, t.x + t.w, t.y + t.h, 5, 0.1);
          }
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
              if (velAlongNormal < -1.15) {
                this.callbacks.onBallClink?.();
              }
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

      // Ar pateko į tikslo kolbą?
      if (b.kind !== 'water' && b.x > g.x + 6 && b.x < g.x + g.w - 6 && b.y > g.y + 18 && b.y < g.y + g.h) {
        if (b.kind === 'gray') {
          if (this.status === 'playing') {
            this.status = 'failed';
            this.failReason = '⚠️ Užterštas pilkas rutuliukas pateko į kolbą! Pirma jį sumaišyk su spalvotais arba nukreipk į duobę.';
            this.reportStatus();
          }
        } else {
          if (!b.inGoal) {
            this.callbacks.onBallClink?.();
          }
          b.inGoal = true;
          coloredInGoal++;
        }
      }

      // Ar pateko į spąstų / lavos duobę?
      const trapHitTop = t && t.lava ? t.y - 4 : t ? t.y + 18 : 0;
      if (t && b.x > t.x + 2 && b.x < t.x + t.w - 2 && b.y > trapHitTop && b.y < t.y + t.h) {
        if (t.lava && b.kind === 'water') {
          b.removed = true;
          this.trapCooled = true;
          this.spawnMixSparks(b.x, t.y + 8, '#bae6fd');
          this.spawnMixSparks(b.x, t.y + 8, '#cbd5e1');
          continue;
        }
        if (t.lava && this.trapCooled) {
          // Atvėsęs akmuo saugus (jei netyčia užkliuvo kraštas)
        } else if (b.kind === 'gray') {
          b.removed = true;
          this.trapCount++;
          this.spawnMixSparks(b.x, b.y, '#94a3b8');
          continue;
        } else if (this.status === 'playing') {
          b.removed = true;
          this.spawnMixSparks(b.x, b.y, t.lava ? '#f97316' : '#ef4444');
          if (t.lava) {
            this.status = 'failed';
            this.failReason = '🔥 Oi! Rutuliukai sudegė raudonoje lavoje! Paspausk „Iš naujo“ ir suplanuok kitą kaiščių seką.';
            this.reportStatus();
          }
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

    const targetLiquid = Math.min(1, this.goalCount / Math.max(1, this.level.requiredGoal));
    this.liquidFill += (targetLiquid - this.liquidFill) * 0.12;

    if (this.status === 'playing') {
      if (coloredInGoal >= this.level.requiredGoal) {
        this.status = 'winning';
        this.isWinning = true;
        this.inputLocked = true;
        this.victoryTimer = 0;
        this.winNotified = false;
        const g = this.level.goal;
        this.spawnMixSparks(g.x + g.w / 2, g.y + 12, '#4ade80');
        window.__protoLabJuice?.(true);
        this.reportStatus();
      } else {
        const potentialTotal = this.balls.filter((b) => !b.removed && b.kind !== 'water').length;
        if (potentialTotal < this.level.requiredGoal) {
          this.status = 'failed';
          this.failReason = '💥 Per daug spalvotų rutuliukų prarasta! Paspausk „Iš naujo (Reset)“ ir bandyk dar kartą.';
          this.reportStatus();
        } else {
          this.callbacks.onTick?.({ goalCount: this.goalCount, requiredGoal: this.level.requiredGoal });
        }
      }
    } else if (this.status === 'winning') {
      this.callbacks.onTick?.({ goalCount: this.goalCount, requiredGoal: this.level.requiredGoal });
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
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.step();
      if (this.isWinning && !this.winNotified) {
        this.victoryTimer += dt;
        if (Math.random() < 0.22) {
          const g = this.level.goal;
          this.spawnMixSparks(g.x + 14 + Math.random() * (g.w - 28), g.y + 8, '#4ade80');
        }
        if (this.victoryTimer >= 2.2) {
          this.isWinning = false;
          this.winNotified = true;
          this.status = 'won';
          this.reportStatus();
        }
      }
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

    // 2. Spąstų / raudonos lavos duobė
    if (this.level.trap) {
      const t = this.level.trap;
      ctx.save();
      if (t.lava && this.trapCooled) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(t.x, t.y, t.w, t.h);
        if (t.bridgeSlope) {
          ctx.beginPath();
          ctx.moveTo(t.x, t.y + 4);
          ctx.lineTo(t.x + t.w, t.y + t.bridgeSlope);
          ctx.lineTo(t.x + t.w, t.y + t.h);
          ctx.lineTo(t.x, t.y + t.h);
          ctx.closePath();
          ctx.fillStyle = '#64748b';
          ctx.fill();
        }
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.strokeRect(t.x, t.y, t.w, t.h);
        ctx.font = '800 12px "Nunito", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText('🪨 AKMENS TILTAS', t.x + t.w / 2, t.y + t.h - 14);
      } else if (t.lava) {
        const lavaGrad = ctx.createLinearGradient(t.x, t.y, t.x, t.y + t.h);
        lavaGrad.addColorStop(0, '#f97316');
        lavaGrad.addColorStop(0.45, '#dc2626');
        lavaGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = lavaGrad;
        ctx.fillRect(t.x, t.y, t.w, t.h);
        // Burbuliukai
        const bubblePhase = performance.now() * 0.004;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
        for (let k = 0; k < 4; k++) {
          const bx = t.x + 22 + k * ((t.w - 44) / 3);
          const by = t.y + 22 + Math.sin(bubblePhase + k * 1.7) * 7;
          ctx.beginPath();
          ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 4;
        ctx.strokeRect(t.x, t.y, t.w, t.h);
        ctx.font = '900 12px "Nunito", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 RAUDONA LAVA', t.x + t.w / 2, t.y + t.h - 12);
      } else {
        ctx.fillStyle = 'rgba(127, 29, 29, 0.65)';
        ctx.fillRect(t.x, t.y, t.w, t.h);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.strokeRect(t.x, t.y, t.w, t.h);
        ctx.font = '800 13px "Nunito", sans-serif';
        ctx.fillStyle = '#fecaca';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ SPĄSTŲ DUOBĖ', t.x + t.w / 2, t.y + t.h - 12);
      }
      ctx.restore();
    }

    // 3. Tikslo kolba apačioje (stiklas su storu dugnu, atspindžiu, banguojančiu skysčiu ir burbuliukais)
    const g = this.level.goal;
    const isFlaskGreen = this.status === 'winning' || this.status === 'won';
    const animNow = performance.now() * 0.004;
    ctx.save();

    // Kolbos stiklo foninis gradientas
    const glassBg = ctx.createLinearGradient(g.x, g.y, g.x + g.w, g.y);
    glassBg.addColorStop(0, 'rgba(30, 58, 138, 0.35)');
    glassBg.addColorStop(0.5, isFlaskGreen ? 'rgba(6, 95, 70, 0.5)' : 'rgba(15, 23, 42, 0.55)');
    glassBg.addColorStop(1, 'rgba(30, 58, 138, 0.3)');
    ctx.fillStyle = glassBg;
    ctx.beginPath();
    ctx.roundRect(g.x, g.y, g.w, g.h, [4, 4, 14, 14]);
    ctx.fill();

    // Banguojantis skysčio lygis su kylančiais burbuliukais
    if (this.liquidFill > 0.01) {
      const liqH = Math.max(10, (g.h - 22) * Math.min(1, this.liquidFill));
      const topY = g.y + g.h - liqH;
      const botY = g.y + g.h - 6;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(g.x + 3, g.y + 2, g.w - 6, g.h - 8, [2, 2, 11, 11]);
      ctx.clip();

      const liqGrad = ctx.createLinearGradient(0, topY, 0, botY);
      liqGrad.addColorStop(0, isFlaskGreen ? 'rgba(134, 239, 172, 0.72)' : 'rgba(56, 189, 248, 0.55)');
      liqGrad.addColorStop(1, isFlaskGreen ? 'rgba(21, 128, 61, 0.85)' : 'rgba(3, 105, 161, 0.75)');
      ctx.fillStyle = liqGrad;

      ctx.beginPath();
      ctx.moveTo(g.x + 2, botY);
      ctx.lineTo(g.x + 2, topY);
      const waveSteps = 10;
      for (let wi = 0; wi <= waveSteps; wi++) {
        const wx = g.x + 2 + ((g.w - 4) * wi) / waveSteps;
        const wy = topY + Math.sin(animNow * 1.6 + wi * 0.9) * 3.2;
        ctx.lineTo(wx, wy);
      }
      ctx.lineTo(g.x + g.w - 2, botY);
      ctx.closePath();
      ctx.fill();

      // Paviršiaus bangelės blizgesys
      ctx.strokeStyle = isFlaskGreen ? 'rgba(220, 252, 231, 0.78)' : 'rgba(224, 242, 254, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let wi = 0; wi <= waveSteps; wi++) {
        const wx = g.x + 2 + ((g.w - 4) * wi) / waveSteps;
        const wy = topY + Math.sin(animNow * 1.6 + wi * 0.9) * 3.2;
        if (wi === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      // Kylantys burbuliukai skystyje
      ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
      for (let bi = 0; bi < 6; bi++) {
        const bPhase = (animNow * 0.32 + bi * 0.19) % 1;
        const bx = g.x + 16 + ((bi * 29) % Math.max(16, g.w - 32));
        const by = botY - 4 - bPhase * Math.max(8, liqH - 8);
        ctx.beginPath();
        ctx.arc(bx + Math.sin(animNow + bi) * 2, by, 1.8 + (bi % 3) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Storas stiklo dugnas
    const baseGrad = ctx.createLinearGradient(0, g.y + g.h - 10, 0, g.y + g.h);
    baseGrad.addColorStop(0, 'rgba(186, 230, 253, 0.25)');
    baseGrad.addColorStop(1, 'rgba(125, 211, 252, 0.52)');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.roundRect(g.x + 2, g.y + g.h - 9, g.w - 4, 9, [0, 0, 12, 12]);
    ctx.fill();

    // Vertikalus stiklo atspindžio brūkšnys
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(g.x + 11, g.y + 12);
    ctx.lineTo(g.x + 11, g.y + g.h - 16);
    ctx.stroke();

    if (isFlaskGreen) {
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#4ade80';
    }
    ctx.strokeStyle = isFlaskGreen ? '#4ade80' : '#67e8f9';
    ctx.lineWidth = isFlaskGreen ? 4.5 : 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(g.x - 4, g.y);
    ctx.lineTo(g.x, g.y + 6);
    ctx.lineTo(g.x, g.y + g.h - 8);
    ctx.quadraticCurveTo(g.x, g.y + g.h, g.x + 10, g.y + g.h);
    ctx.lineTo(g.x + g.w - 10, g.y + g.h);
    ctx.quadraticCurveTo(g.x + g.w, g.y + g.h, g.x + g.w, g.y + g.h - 8);
    ctx.lineTo(g.x + g.w, g.y + 6);
    ctx.lineTo(g.x + g.w + 4, g.y);
    ctx.stroke();

    // Žalia indikatoriaus lemputė ant kolbos krašto
    ctx.shadowBlur = isFlaskGreen ? 16 : 0;
    ctx.fillStyle = isFlaskGreen ? '#22c55e' : '#334155';
    ctx.strokeStyle = isFlaskGreen ? '#bbf7d0' : '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(g.x + g.w - 14, g.y + 14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = '700 13px "Fredoka", "Outfit", sans-serif';
    ctx.fillStyle = isFlaskGreen ? '#86efac' : '#e0f2fe';
    ctx.textAlign = 'center';
    ctx.fillText(`🧪 KOLBA (${this.goalCount}/${this.level.requiredGoal})`, g.x + g.w / 2, g.y + g.h - 14);
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

    // 5. Šlifuoto plieno kaiščiai-varžtai su rankenėlėmis
    const nowPulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.009);
    for (const pin of this.pins) {
      if (pin.removed) continue;
      const seg = this.getActivePinRect(pin);
      const isHover = this.hoveredPinId === pin.id && !pin.pulling;
      const isHintPin = this.hintPinId === pin.id && !pin.pulling;

      const dx = seg.x2 - seg.x1;
      const dy = seg.y2 - seg.y1;
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.shadowColor = isHintPin ? '#fde047' : 'rgba(2, 6, 23, 0.72)';
      ctx.shadowBlur = isHintPin ? 18 + nowPulse * 10 : 10;
      ctx.shadowOffsetY = isHintPin ? 0 : 4;

      // Tamsus varžto kontūras
      ctx.strokeStyle = isHintPin ? '#fef08a' : '#020617';
      ctx.lineWidth = isHintPin ? PIN_RADIUS * 2 + 8 : PIN_RADIUS * 2 + 5;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Šlifuoto plieno cilindrinis gradientas skersai varžto
      const midX = (seg.x1 + seg.x2) / 2;
      const midY = (seg.y1 + seg.y2) / 2;
      const steelGrad = ctx.createLinearGradient(
        midX - nx * PIN_RADIUS,
        midY - ny * PIN_RADIUS,
        midX + nx * PIN_RADIUS,
        midY + ny * PIN_RADIUS
      );
      if (isHover || isHintPin) {
        steelGrad.addColorStop(0, '#fde047');
        steelGrad.addColorStop(0.35, '#fef9c3');
        steelGrad.addColorStop(0.75, '#eab308');
        steelGrad.addColorStop(1, '#854d0e');
      } else {
        steelGrad.addColorStop(0, '#94a3b8');
        steelGrad.addColorStop(0.35, '#f1f5f9');
        steelGrad.addColorStop(0.75, '#64748b');
        steelGrad.addColorStop(1, '#1e293b');
      }
      ctx.strokeStyle = steelGrad;
      ctx.lineWidth = PIN_RADIUS * 2;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();

      // Sriegio rievelės ant varžto koto
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.38)';
      ctx.lineWidth = 1.6;
      const ux = dx / len;
      const uy = dy / len;
      for (let d = 12; d < len - 10; d += 9) {
        const px = seg.x1 + ux * d;
        const py = seg.y1 + uy * d;
        ctx.beginPath();
        ctx.moveTo(px - nx * (PIN_RADIUS - 1), py - ny * (PIN_RADIUS - 1));
        ctx.lineTo(px + nx * (PIN_RADIUS - 1) + ux * 3, py + ny * (PIN_RADIUS - 1) + uy * 3);
        ctx.stroke();
      }

      // 3D metalinė traukimo rankenėlė
      const hx = pin.dirX >= 0 ? seg.x2 + 12 : seg.x1 - 12;
      const hy = pin.dirX >= 0 ? seg.y2 : seg.y1;
      if (isHintPin) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(hx, hy, 18 + nowPulse * 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      const gripGrad = ctx.createRadialGradient(hx - 4, hy - 4, 2, hx, hy, 14);
      gripGrad.addColorStop(0, '#fef9c3');
      gripGrad.addColorStop(0.5, isHover || isHintPin ? '#fde047' : '#f59e0b');
      gripGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = gripGrad;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hx, hy, 12.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 10px "Fredoka", "Outfit", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pin.label.replace(/\s*\(.*\)/, ''), hx, hy + 0.5);
      ctx.restore();
    }

    // 6. Rutuliukai (2.5D tūrinis atspindys)
    for (const b of this.balls) {
      if (b.removed) continue;
      ctx.save();
      ctx.shadowColor = 'rgba(2, 6, 23, 0.55)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      const bGrad = ctx.createRadialGradient(
        b.x - b.r * 0.35,
        b.y - b.r * 0.35,
        b.r * 0.12,
        b.x,
        b.y,
        b.r
      );
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.32, b.color);
      bGrad.addColorStop(1, '#0f172a');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = bGrad;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = b.kind === 'gray' ? '#334155' : '#020617';
      ctx.stroke();

      if (b.kind === 'gray') {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y - 4);
        ctx.lineTo(b.x + 4, b.y + 4);
        ctx.moveTo(b.x + 4, b.y - 4);
        ctx.lineTo(b.x - 4, b.y + 4);
        ctx.stroke();
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
