// Kolbų ir skysčių laboratorija (1 kl. Spalvų ir sklendžių vamzdynas, 3 kl. Perpylimo matematika)

export const FLASK_CANVAS_W = 560;
export const FLASK_CANVAS_H = 420;

export const RYB_COLORS = {
  EMPTY: { key: 'EMPTY', label: 'Tuščia', hex: '#334155', glow: 'rgba(148,163,184,0.2)', dot: '⚪' },
  R: { key: 'R', label: 'Raudona', hex: '#ef4444', glow: 'rgba(239,68,68,0.55)', dot: '🔴' },
  Y: { key: 'Y', label: 'Geltona', hex: '#facc15', glow: 'rgba(250,204,21,0.55)', dot: '🟡' },
  B: { key: 'B', label: 'Mėlyna', hex: '#3b82f6', glow: 'rgba(59,130,246,0.55)', dot: '🔵' },
  ORANGE: { key: 'ORANGE', label: 'Oranžinė', hex: '#f97316', glow: 'rgba(249,115,22,0.55)', dot: '🟠' },
  GREEN: { key: 'GREEN', label: 'Žalia', hex: '#22c55e', glow: 'rgba(34,197,94,0.55)', dot: '🟢' },
  PURPLE: { key: 'PURPLE', label: 'Violetinė', hex: '#a855f7', glow: 'rgba(168,85,247,0.55)', dot: '🟣' },
  BROWN: { key: 'BROWN', label: 'Ruda', hex: '#92400e', glow: 'rgba(146,64,14,0.55)', dot: '🟤' }
};

export function mixRybFlags(r, y, b) {
  if (r && y && b) return 'BROWN';
  if (r && y) return 'ORANGE';
  if (y && b) return 'GREEN';
  if (r && b) return 'PURPLE';
  if (r) return 'R';
  if (y) return 'Y';
  if (b) return 'B';
  return 'EMPTY';
}

export const FLASK_LEVELS = {
  grade1: [
    {
      id: 'flk_g1_1',
      kind: 'pipes',
      title: '1. Oranžinis eliksyras',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Sumaišyk 🔴 Raudoną ir 🟡 Geltoną, kad gautum 🟠 ORANŽINĘ! Pasuk sklendes, kad skystis nepatektų į ☠️.',
      reward: 1,
      targetColor: 'ORANGE',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'divert', x: 95, y: 150, initial: 0, labels: ['☠️', '🧪'] },
        { id: 'vY', type: 'gate', x: 280, y: 150, initial: false },
        { id: 'vB', type: 'gate', x: 465, y: 150, initial: true },
        { id: 'jMix', type: 'join', x: 280, y: 255 },
        { id: 'tox1', type: 'toxic', x: 65, y: 350 },
        { id: 'target', type: 'target', x: 280, y: 350 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'tox1', branch: 0 },
        { from: 'vR', to: 'jMix', branch: 1 },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jMix' },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'jMix' },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_2',
      kind: 'pipes',
      title: '2. Žaliasis mišinys',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Norime 🟢 ŽALIOS (🟡 + 🔵)! Sustabdyk Raudoną skysčio srautą ir nukreipk Geltoną bei Mėlyną į kolbą.',
      reward: 1,
      targetColor: 'GREEN',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'gate', x: 95, y: 155, initial: true },
        { id: 'vY', type: 'gate', x: 280, y: 155, initial: false },
        { id: 'vB', type: 'divert', x: 465, y: 155, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'jMix', type: 'join', x: 280, y: 255 },
        { id: 'tox1', type: 'toxic', x: 495, y: 350 },
        { id: 'target', type: 'target', x: 280, y: 350 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'jMix' },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jMix' },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'jMix', branch: 0 },
        { from: 'vB', to: 'tox1', branch: 1 },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_3',
      kind: 'pipes',
      title: '3. Violetinis kristalas',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Reikia 🟣 VIOLETINĖS (🔴 + 🔵)! Geltoną nukreipk į 💧 saugią nuotekų talpą, kad nepatektų į kolbą ar ☠️.',
      reward: 1,
      targetColor: 'PURPLE',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'gate', x: 95, y: 150, initial: false },
        { id: 'vY', type: 'divert', x: 280, y: 150, initial: 0, labels: ['🧪', '💧'] },
        { id: 'vB', type: 'divert', x: 465, y: 150, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'jMix', type: 'join', x: 230, y: 255 },
        { id: 'drain', type: 'drain', x: 370, y: 255 },
        { id: 'tox1', type: 'toxic', x: 495, y: 350 },
        { id: 'target', type: 'target', x: 230, y: 350 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'jMix' },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jMix', branch: 0 },
        { from: 'vY', to: 'drain', branch: 1 },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'jMix', branch: 0 },
        { from: 'vB', to: 'tox1', branch: 1 },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_4',
      kind: 'pipes',
      title: '4. Dvigubas nuodų sargas',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Aplinkui net dvi ☠️ kameros! Paruošk 🟠 ORANŽINĘ kolbą ir neįleisk skysčio į ☠️.',
      reward: 2,
      targetColor: 'ORANGE',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'divert', x: 95, y: 145, initial: 0, labels: ['☠️', '🧪'] },
        { id: 'vY', type: 'divert', x: 280, y: 145, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'vB', type: 'divert', x: 465, y: 145, initial: 0, labels: ['🧪', '💧'] },
        { id: 'jMix', type: 'join', x: 240, y: 255 },
        { id: 'tox1', type: 'toxic', x: 65, y: 345 },
        { id: 'tox2', type: 'toxic', x: 355, y: 255 },
        { id: 'drain', type: 'drain', x: 490, y: 345 },
        { id: 'target', type: 'target', x: 240, y: 345 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'tox1', branch: 0 },
        { from: 'vR', to: 'jMix', branch: 1 },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jMix', branch: 0 },
        { from: 'vY', to: 'tox2', branch: 1 },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'jMix', branch: 0 },
        { from: 'vB', to: 'drain', branch: 1 },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_5',
      kind: 'pipes',
      title: '5. Bendras vamzdis',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Geltona ir Mėlyna susitinka prieš skirstytuvą! Gauk 🟣 VIOLETINĘ, saugodamasis nuodų kameros.',
      reward: 2,
      targetColor: 'PURPLE',
      sources: [
        { id: 'sR', x: 100, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 270, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 455, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'gate', x: 100, y: 155, initial: false },
        { id: 'vY', type: 'gate', x: 270, y: 135, initial: true },
        { id: 'jYB', type: 'join', x: 380, y: 195 },
        { id: 'vYB', type: 'divert', x: 380, y: 265, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'jFinal', type: 'join', x: 205, y: 290 },
        { id: 'tox1', type: 'toxic', x: 490, y: 350 },
        { id: 'target', type: 'target', x: 205, y: 360 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'jFinal' },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jYB' },
        { from: 'sB', to: 'jYB' },
        { from: 'jYB', to: 'vYB' },
        { from: 'vYB', to: 'jFinal', branch: 0 },
        { from: 'vYB', to: 'tox1', branch: 1 },
        { from: 'jFinal', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_6',
      kind: 'pipes',
      title: '6. Žaliasis skydas',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Reikia 🟢 ŽALIOS! Pirmiausia sustabdyk Raudoną sklendę, nes ji užterš visą vamzdį!',
      reward: 2,
      targetColor: 'GREEN',
      sources: [
        { id: 'sR', x: 110, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 455, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'gate', x: 110, y: 135, initial: true },
        { id: 'vY', type: 'divert', x: 280, y: 135, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'vB', type: 'gate', x: 455, y: 135, initial: false },
        { id: 'jTop', type: 'join', x: 195, y: 225 },
        { id: 'vRoute', type: 'divert', x: 195, y: 290, initial: 1, labels: ['🧪', '💧'] },
        { id: 'jMix', type: 'join', x: 345, y: 310 },
        { id: 'tox1', type: 'toxic', x: 405, y: 215 },
        { id: 'drain', type: 'drain', x: 95, y: 360 },
        { id: 'target', type: 'target', x: 345, y: 370 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'jTop' },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jTop', branch: 0 },
        { from: 'vY', to: 'tox1', branch: 1 },
        { from: 'jTop', to: 'vRoute' },
        { from: 'vRoute', to: 'jMix', branch: 0 },
        { from: 'vRoute', to: 'drain', branch: 1 },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'jMix' },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_7',
      kind: 'pipes',
      title: '7. Oranžinė laboratorija',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Atidžiai pasek rodykles! Paversk tirpalą 🟠 ORANŽINIU, o Mėlyną nuleisk į 💧.',
      reward: 2,
      targetColor: 'ORANGE',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'divert', x: 95, y: 135, initial: 0, labels: ['☠️', '🧪'] },
        { id: 'vY', type: 'gate', x: 280, y: 135, initial: false },
        { id: 'vB', type: 'divert', x: 465, y: 135, initial: 0, labels: ['🧪', '💧'] },
        { id: 'vMid', type: 'divert', x: 280, y: 215, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'jMix', type: 'join', x: 225, y: 295 },
        { id: 'tox1', type: 'toxic', x: 65, y: 350 },
        { id: 'tox2', type: 'toxic', x: 375, y: 280 },
        { id: 'drain', type: 'drain', x: 495, y: 350 },
        { id: 'target', type: 'target', x: 225, y: 365 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'tox1', branch: 0 },
        { from: 'vR', to: 'jMix', branch: 1 },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'vMid' },
        { from: 'vMid', to: 'jMix', branch: 0 },
        { from: 'vMid', to: 'tox2', branch: 1 },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'jMix', branch: 0 },
        { from: 'vB', to: 'drain', branch: 1 },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_8',
      kind: 'pipes',
      title: '8. Dvigubas perskirstymas',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Reikia 🟣 VIOLETINĖS! Abi kraštinės spalvos turi apeiti kliūtis, o Geltona turi būti sustabdyta.',
      reward: 3,
      targetColor: 'PURPLE',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'divert', x: 95, y: 135, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'vY', type: 'divert', x: 280, y: 135, initial: 0, labels: ['🧪', '💧'] },
        { id: 'vB', type: 'gate', x: 465, y: 135, initial: false },
        { id: 'vB2', type: 'divert', x: 465, y: 215, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'jMix', type: 'join', x: 235, y: 295 },
        { id: 'tox1', type: 'toxic', x: 65, y: 350 },
        { id: 'drain', type: 'drain', x: 345, y: 215 },
        { id: 'tox2', type: 'toxic', x: 495, y: 350 },
        { id: 'target', type: 'target', x: 235, y: 365 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'jMix', branch: 0 },
        { from: 'vR', to: 'tox1', branch: 1 },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jMix', branch: 0 },
        { from: 'vY', to: 'drain', branch: 1 },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'vB2' },
        { from: 'vB2', to: 'jMix', branch: 0 },
        { from: 'vB2', to: 'tox2', branch: 1 },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_9',
      kind: 'pipes',
      title: '9. Visos trys spalvos! (🟤 Ruda)',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: 'Tikslas – 🟤 RUDA! Sumaišyk VISAS TRIS spalvas (🔴+🟡+🔵) be jokio nuotėkio į ☠️.',
      reward: 3,
      targetColor: 'BROWN',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'gate', x: 95, y: 130, initial: false },
        { id: 'vR2', type: 'divert', x: 95, y: 205, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'vY', type: 'divert', x: 280, y: 145, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'vB', type: 'gate', x: 465, y: 130, initial: false },
        { id: 'jMix', type: 'join', x: 280, y: 290 },
        { id: 'tox1', type: 'toxic', x: 65, y: 355 },
        { id: 'tox2', type: 'toxic', x: 410, y: 245 },
        { id: 'target', type: 'target', x: 280, y: 365 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'vR2' },
        { from: 'vR2', to: 'jMix', branch: 0 },
        { from: 'vR2', to: 'tox1', branch: 1 },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'jMix', branch: 0 },
        { from: 'vY', to: 'tox2', branch: 1 },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'jMix' },
        { from: 'jMix', to: 'target' }
      ]
    },
    {
      id: 'flk_g1_10',
      kind: 'pipes',
      title: '10. Laboratorijos viršininko testas',
      badge: '🧪 KOLBŲ LABORATORIJA • 1 KL.',
      instruction: '1 klasės finalas! Išgauk 🟢 ŽALIĄ per 6 sklendžių labirintą ir apsaugok abi ☠️ kameras!',
      reward: 3,
      targetColor: 'GREEN',
      sources: [
        { id: 'sR', x: 95, y: 55, color: 'R', label: 'Raudona' },
        { id: 'sY', x: 280, y: 55, color: 'Y', label: 'Geltona' },
        { id: 'sB', x: 465, y: 55, color: 'B', label: 'Mėlyna' }
      ],
      nodes: [
        { id: 'vR', type: 'divert', x: 95, y: 130, initial: 0, labels: ['🧪', '💧'] },
        { id: 'vY', type: 'gate', x: 280, y: 125, initial: false },
        { id: 'vY2', type: 'divert', x: 280, y: 200, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'vB', type: 'divert', x: 465, y: 125, initial: 1, labels: ['🧪', '☠️'] },
        { id: 'vB2', type: 'gate', x: 390, y: 205, initial: false },
        { id: 'jMix', type: 'join', x: 255, y: 295 },
        { id: 'drain', type: 'drain', x: 70, y: 345 },
        { id: 'tox1', type: 'toxic', x: 185, y: 245 },
        { id: 'tox2', type: 'toxic', x: 495, y: 345 },
        { id: 'target', type: 'target', x: 255, y: 365 }
      ],
      edges: [
        { from: 'sR', to: 'vR' },
        { from: 'vR', to: 'jMix', branch: 0 },
        { from: 'vR', to: 'drain', branch: 1 },
        { from: 'sY', to: 'vY' },
        { from: 'vY', to: 'vY2' },
        { from: 'vY2', to: 'jMix', branch: 0 },
        { from: 'vY2', to: 'tox1', branch: 1 },
        { from: 'sB', to: 'vB' },
        { from: 'vB', to: 'vB2', branch: 0 },
        { from: 'vB', to: 'tox2', branch: 1 },
        { from: 'vB2', to: 'jMix' },
        { from: 'jMix', to: 'target' }
      ]
    }
  ],
  grade3: [
    {
      id: 'flk_g3_1',
      kind: 'jugs',
      title: '1. Klasikiniai 4 litrai',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Turi 5 L ir 3 L kolbas, čiaupą 🚰 ir kriauklę 💧. Išmatuok lygiai 4 litrus bet kurioje kolboje!',
      reward: 2,
      capacities: [5, 3],
      initial: [0, 0],
      targetAmount: 4,
      hasTap: true,
      masterMoves: 6
    },
    {
      id: 'flk_g3_2',
      kind: 'jugs',
      title: '2. Septynių ir trijų užduotis',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Su 7 L ir 3 L kolbomis (turint čiaupą ir kriauklę) išmatuok lygiai 5 litrus!',
      reward: 2,
      capacities: [7, 3],
      initial: [0, 0],
      targetAmount: 5,
      hasTap: true,
      masterMoves: 8
    },
    {
      id: 'flk_g3_3',
      kind: 'jugs',
      title: '3. Uždara sistema (be čiaupo!)',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Čiaupo nebėra! Pilna 8 L kolba ir dvi tuščios (5 L bei 3 L). Padalink taip, kad vienoje būtų 4 L!',
      reward: 2,
      capacities: [8, 5, 3],
      initial: [8, 0, 0],
      targetAmount: 4,
      hasTap: false,
      masterMoves: 6
    },
    {
      id: 'flk_g3_4',
      kind: 'jugs',
      title: '4. Devyni ir keturi',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Turi 9 L ir 4 L kolbas su čiaupu bei kriaukle. Išmatuok lygiai 6 litrus!',
      reward: 2,
      capacities: [9, 4],
      initial: [0, 0],
      targetAmount: 6,
      hasTap: true,
      masterMoves: 8
    },
    {
      id: 'flk_g3_5',
      kind: 'jugs',
      title: '5. Dešimties litrų pusė',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Uždara 10 L, 7 L ir 3 L kolbų sistema (be čiaupo). Išmatuok lygiai 5 litrus!',
      reward: 2,
      capacities: [10, 7, 3],
      initial: [10, 0, 0],
      targetAmount: 5,
      hasTap: false,
      masterMoves: 8
    },
    {
      id: 'flk_g3_6',
      kind: 'jugs',
      title: '6. Dvylikos litrų dėlionė',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Uždara sistema (12 L, 7 L, 5 L) be vandens praradimo! Atmatuok lygiai 6 litrus.',
      reward: 3,
      capacities: [12, 7, 5],
      initial: [12, 0, 0],
      targetAmount: 6,
      hasTap: false,
      masterMoves: 10
    },
    {
      id: 'flk_g3_7',
      kind: 'jugs',
      title: '7. Vienuolika ir penki',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Su 11 L ir 5 L kolbomis (čiaupas + kriauklė) tiksliai atmatuok 4 litrus!',
      reward: 3,
      capacities: [11, 5],
      initial: [0, 0],
      targetAmount: 4,
      hasTap: true,
      masterMoves: 6
    },
    {
      id: 'flk_g3_8',
      kind: 'jugs',
      title: '8. Tikslus 6 litrų matas',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Uždara 12 L, 8 L ir 5 L kolbų sistema. Kuriuo mažiausiu ėjimų skaičiumi išmatuosi 6 litrus?',
      reward: 3,
      capacities: [12, 8, 5],
      initial: [12, 0, 0],
      targetAmount: 6,
      hasTap: false,
      masterMoves: 6
    },
    {
      id: 'flk_g3_9',
      kind: 'jugs',
      title: '9. Trylikos litrų chemija',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: 'Pilna 13 L kolba ir tuščios 9 L bei 4 L kolbos (be čiaupo). Išmatuok lygiai 7 litrus!',
      reward: 3,
      capacities: [13, 9, 4],
      initial: [13, 0, 0],
      targetAmount: 7,
      hasTap: false,
      masterMoves: 9
    },
    {
      id: 'flk_g3_10',
      kind: 'jugs',
      title: '10. Alchemiko 8 litrai',
      badge: '🧪 KOLBŲ LABORATORIJA • 3 KL.',
      instruction: '3 klasės finalas! Padalink 16 L vandenį per pusę (8 L) naudojant tik 16 L, 9 L ir 7 L kolbas!',
      reward: 3,
      capacities: [16, 9, 7],
      initial: [16, 0, 0],
      targetAmount: 8,
      hasTap: false,
      masterMoves: 14
    }
  ]
};

// ======================================================
// BFS pagalbininkas 3 klasės kolbų uždaviniams (užuominoms)
// ======================================================
export function solveJugFirstMoveBfs(capacities, startState, targetAmount, hasTap) {
  const n = capacities.length;
  if (startState.includes(targetAmount)) return null;

  const key = (s) => s.join(',');
  const queue = [{ state: [...startState], firstAction: null }];
  const visited = new Set([key(startState)]);

  while (queue.length > 0) {
    const { state, firstAction } = queue.shift();

    const tryEnqueue = (next, action) => {
      const k = key(next);
      if (visited.has(k)) return null;
      visited.add(k);
      const stepAction = firstAction || action;
      if (next.includes(targetAmount)) return stepAction;
      queue.push({ state: next, firstAction: stepAction });
      return null;
    };

    if (hasTap) {
      for (let i = 0; i < n; i++) {
        if (state[i] < capacities[i]) {
          const next = [...state];
          next[i] = capacities[i];
          const found = tryEnqueue(next, { type: 'fill', to: i });
          if (found) return found;
        }
        if (state[i] > 0) {
          const next = [...state];
          next[i] = 0;
          const found = tryEnqueue(next, { type: 'empty', from: i });
          if (found) return found;
        }
      }
    }

    for (let i = 0; i < n; i++) {
      if (state[i] <= 0) continue;
      for (let j = 0; j < n; j++) {
        if (i === j || state[j] >= capacities[j]) continue;
        const pour = Math.min(state[i], capacities[j] - state[j]);
        const next = [...state];
        next[i] -= pour;
        next[j] += pour;
        const found = tryEnqueue(next, { type: 'pour', from: i, to: j });
        if (found) return found;
      }
    }
  }
  return null;
}

// ======================================================
// Vamzdynų simuliatorius + BFS užuomina (1 kl.)
// ======================================================
export function evaluatePipeNetwork(level, valveStates) {
  const nodeMap = new Map();
  for (const s of level.sources) nodeMap.set(s.id, { ...s, type: 'source' });
  for (const n of level.nodes) nodeMap.set(n.id, n);

  const arrived = {}; // nodeId -> { R, Y, B }
  const activeEdges = [];

  for (const src of level.sources) {
    const visited = new Set([src.id]);
    const queue = [src.id];
    if (!arrived[src.id]) arrived[src.id] = { R: false, Y: false, B: false };
    arrived[src.id][src.color] = true;

    while (queue.length > 0) {
      const curId = queue.shift();
      const curNode = nodeMap.get(curId);
      if (!curNode) continue;

      if (curNode.type === 'gate' && !valveStates[curId]) {
        continue;
      }

      for (const edge of level.edges) {
        if (edge.from !== curId) continue;
        if (curNode.type === 'divert' && edge.branch !== valveStates[curId]) {
          continue;
        }
        activeEdges.push({ from: edge.from, to: edge.to, color: src.color });
        if (!arrived[edge.to]) arrived[edge.to] = { R: false, Y: false, B: false };
        arrived[edge.to][src.color] = true;
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push(edge.to);
        }
      }
    }
  }

  let toxicHit = false;
  for (const n of level.nodes) {
    if (n.type === 'toxic') {
      const f = arrived[n.id];
      if (f && (f.R || f.Y || f.B)) toxicHit = true;
    }
  }

  const tf = arrived.target || { R: false, Y: false, B: false };
  const resultColor = mixRybFlags(tf.R, tf.Y, tf.B);
  const won = !toxicHit && resultColor === level.targetColor;

  return { arrived, activeEdges, toxicHit, resultColor, won };
}

export function solvePipeFirstValveBfs(level, currentStates) {
  const valves = level.nodes.filter((n) => n.type === 'gate' || n.type === 'divert');
  const startArr = valves.map((v) => currentStates[v.id]);
  if (evaluatePipeNetwork(level, currentStates).won) return null;

  const key = (arr) => arr.map((x) => (x === true ? 1 : x === false ? 0 : x)).join(',');
  const queue = [{ arr: startArr, firstValveId: null }];
  const visited = new Set([key(startArr)]);

  while (queue.length > 0) {
    const { arr, firstValveId } = queue.shift();
    for (let i = 0; i < valves.length; i++) {
      const next = [...arr];
      next[i] = valves[i].type === 'gate' ? !next[i] : (next[i] === 0 ? 1 : 0);
      const k = key(next);
      if (visited.has(k)) continue;
      visited.add(k);
      const stObj = {};
      valves.forEach((v, idx) => { stObj[v.id] = next[idx]; });
      const first = firstValveId || valves[i].id;
      if (evaluatePipeNetwork(level, stObj).won) {
        return { valveId: first, targetState: first === valves[i].id ? next[i] : !currentStates[first] };
      }
      queue.push({ arr: next, firstValveId: first });
    }
  }
  return null;
}

// ======================================================
// 1 KLASĖ: PipeValveEngine (Canvas)
// ======================================================
export class PipeValveEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.valveStates = {};
    this.level.nodes.forEach((n) => {
      if (n.type === 'gate' || n.type === 'divert') {
        this.valveStates[n.id] = n.initial;
      }
    });

    this.hintValveId = null;
    this.flowing = false;
    this.flowProgress = 0;
    this.lastResult = null;
    this.won = false;
    this.pulsePhase = 0;
    this.rafId = null;
    this.lastTime = 0;

    this._onPointerDown = this.handlePointerDown.bind(this);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.startLoop();
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
  }

  reset() {
    this.level.nodes.forEach((n) => {
      if (n.type === 'gate' || n.type === 'divert') {
        this.valveStates[n.id] = n.initial;
      }
    });
    this.hintValveId = null;
    this.flowing = false;
    this.flowProgress = 0;
    this.lastResult = null;
    this.won = false;
    this.callbacks.onStateChange?.();
  }

  setHint(valveId) {
    this.hintValveId = valveId;
  }

  triggerTest() {
    if (this.flowing || this.won) return;
    this.hintValveId = null;
    this.lastResult = evaluatePipeNetwork(this.level, this.valveStates);
    this.flowing = true;
    this.flowProgress = 0;
    this.callbacks.onLaunchSound?.();
    this.callbacks.onStateChange?.();
  }

  handlePointerDown(e) {
    if (this.flowing || this.won) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const n of this.level.nodes) {
      if (n.type !== 'gate' && n.type !== 'divert') continue;
      if (Math.hypot(x - n.x, y - n.y) <= 28) {
        this.valveStates[n.id] = n.type === 'gate' ? !this.valveStates[n.id] : (this.valveStates[n.id] === 0 ? 1 : 0);
        this.lastResult = null;
        this.hintValveId = null;
        this.callbacks.onValveClick?.(n.id, this.valveStates[n.id]);
        this.callbacks.onStateChange?.();
        return;
      }
    }
  }

  startLoop() {
    this.lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.pulsePhase += dt * 4;

      if (this.flowing) {
        this.flowProgress += dt * 1.15;
        if (this.flowProgress >= 1) {
          this.flowProgress = 1;
          this.flowing = false;
          if (this.lastResult?.won) {
            this.won = true;
            this.callbacks.onWin?.(this.lastResult);
          } else {
            this.callbacks.onFail?.(this.lastResult);
          }
          this.callbacks.onStateChange?.();
        }
      }

      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  render() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Foninė laboratorijos lenta
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Tinklelio taškai
    ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
    for (let x = 25; x < W; x += 32) {
      for (let y = 25; y < H; y += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const posMap = new Map();
    for (const s of this.level.sources) posMap.set(s.id, s);
    for (const n of this.level.nodes) posMap.set(n.id, n);

    const activeEdges = this.flowing || this.lastResult ? this.lastResult?.activeEdges || [] : [];

    // 1. Vamzdžiai
    for (const edge of this.level.edges) {
      const a = posMap.get(edge.from);
      const b = posMap.get(edge.to);
      if (!a || !b) continue;

      const isSelectedBranch =
        a.type !== 'divert' || edge.branch === this.valveStates[a.id];

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = 12;
      ctx.strokeStyle = isSelectedBranch ? '#334155' : 'rgba(51, 65, 85, 0.35)';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.lineWidth = 6;
      ctx.strokeStyle = isSelectedBranch ? '#1e293b' : 'rgba(15, 23, 42, 0.5)';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Aktyvi srauto srovė po "Paleisti srautą!"
      const edgeStreams = activeEdges.filter((ae) => ae.from === edge.from && ae.to === edge.to);
      if (edgeStreams.length > 0 && this.flowProgress > 0) {
        const streamColor = RYB_COLORS[edgeStreams[0].color].hex;
        const p = Math.min(1, this.flowProgress * 1.2);
        ctx.strokeStyle = streamColor;
        ctx.shadowColor = streamColor;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p);
        ctx.stroke();
      } else if (a.type === 'divert' && isSelectedBranch) {
        // Maža šviečianti krypties rodyklėlė palei pasirinktą atšaką
        const mx = a.x + (b.x - a.x) * 0.48;
        const my = a.y + (b.y - a.y) * 0.48;
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        ctx.translate(mx, my);
        ctx.rotate(ang);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Šaltinių cisternos (R, Y, B)
    for (const s of this.level.sources) {
      const col = RYB_COLORS[s.color];
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = col.hex;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(s.x - 32, s.y - 24, 64, 48, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = col.hex;
      ctx.beginPath();
      ctx.roundRect(s.x - 26, s.y - 8, 52, 26, 8);
      ctx.fill();

      ctx.fillStyle = s.color === 'Y' ? '#0f172a' : '#fff';
      ctx.font = '900 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, s.x, s.y + 5);
      ctx.restore();
    }

    // 3. Mazgai: Sklendės, Skirstytuvai, Nuodai, Nuotėkos, Tikslo kolba
    for (const n of this.level.nodes) {
      ctx.save();
      if (n.type === 'join') {
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (n.type === 'gate') {
        const isOpen = Boolean(this.valveStates[n.id]);
        if (this.hintValveId === n.id) {
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 29 + Math.sin(this.pulsePhase) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = isOpen ? '#15803d' : '#991b1b';
        ctx.strokeStyle = isOpen ? '#4ade80' : '#fca5a5';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '900 11px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isOpen ? 'ATID.' : 'UŽD.', n.x, n.y);
      } else if (n.type === 'divert') {
        const br = this.valveStates[n.id];
        if (this.hintValveId === n.id) {
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 29 + Math.sin(this.pulsePhase) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#0369a1';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pasukta rodyklė link aktyvaus išėjimo
        const outEdge = this.level.edges.find((e) => e.from === n.id && e.branch === br);
        const dest = outEdge ? posMap.get(outEdge.to) : null;
        if (dest) {
          const ang = Math.atan2(dest.y - n.y, dest.x - n.x);
          ctx.translate(n.x, n.y);
          ctx.rotate(ang);
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(-6, -8);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-6, 8);
          ctx.closePath();
          ctx.fill();
        }
      } else if (n.type === 'toxic') {
        const hit = this.flowProgress >= 0.9 && this.lastResult?.arrived?.[n.id] &&
          (this.lastResult.arrived[n.id].R || this.lastResult.arrived[n.id].Y || this.lastResult.arrived[n.id].B);
        ctx.fillStyle = hit ? '#7f1d1d' : '#1e1b2e';
        ctx.strokeStyle = hit ? '#ef4444' : '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(n.x - 24, n.y - 24, 48, 48, 12);
        ctx.fill();
        ctx.stroke();
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠️', n.x, n.y + 1);
      } else if (n.type === 'drain') {
        ctx.fillStyle = '#0f2942';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(n.x - 24, n.y - 22, 48, 44, 12);
        ctx.fill();
        ctx.stroke();
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💧', n.x, n.y - 3);
        ctx.fillStyle = '#bae6fd';
        ctx.font = '800 9px Nunito, sans-serif';
        ctx.fillText('NUTEKA', n.x, n.y + 14);
      } else if (n.type === 'target') {
        const tgtSpec = RYB_COLORS[this.level.targetColor];
        const resKey = this.flowProgress >= 0.9 && this.lastResult ? this.lastResult.resultColor : 'EMPTY';
        const resSpec = RYB_COLORS[resKey];

        // Kolbos kūnas
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = this.won ? '#4ade80' : '#cbd5e1';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(n.x - 36, n.y - 28, 72, 54, 14);
        ctx.fill();
        ctx.stroke();

        // Skystis viduje
        if (resKey !== 'EMPTY') {
          ctx.fillStyle = resSpec.hex;
          ctx.beginPath();
          ctx.roundRect(n.x - 31, n.y - 6, 62, 27, 9);
          ctx.fill();
        }

        // Tikslo užuominos kortelė šalia
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = tgtSpec.hex;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(n.x - 56, n.y + 32, 112, 22, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '900 11px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`TIKSLAS: ${tgtSpec.dot} ${tgtSpec.label.toUpperCase()}`, n.x, n.y + 43);
      }
      ctx.restore();
    }
  }
}

// ======================================================
// 3 KLASĖ: JugPourEngine (Kolbų perpylimas, Canvas)
// ======================================================
export class JugPourEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.amounts = [...level.initial];
    this.animAmounts = [...level.initial];
    this.selectedIdx = null;
    this.moves = 0;
    this.hintAction = null;
    this.won = false;
    this.rafId = null;
    this.lastTime = 0;

    this._onPointerDown = this.handlePointerDown.bind(this);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.startLoop();
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
  }

  reset() {
    this.amounts = [...this.level.initial];
    this.animAmounts = [...this.level.initial];
    this.selectedIdx = null;
    this.moves = 0;
    this.hintAction = null;
    this.won = false;
    this.callbacks.onStateChange?.();
  }

  setHintAction(action) {
    this.hintAction = action;
  }

  getLayout() {
    const n = this.level.capacities.length;
    const maxCap = Math.max(...this.level.capacities);
    const W = this.canvas.width;
    const spacing = n === 2 ? 210 : 155;
    const startX = W / 2 - ((n - 1) * spacing) / 2;
    const baseBottomY = this.level.hasTap ? 290 : 325;
    const maxH = 195;

    return this.level.capacities.map((cap, idx) => {
      const w = n === 2 ? 105 : 88;
      const h = Math.max(85, Math.round((cap / maxCap) * maxH));
      const cx = startX + idx * spacing;
      return {
        idx,
        cap,
        cx,
        x: cx - w / 2,
        y: baseBottomY - h,
        w,
        h,
        bottomY: baseBottomY
      };
    });
  }

  fillJug(idx) {
    if (this.won || !this.level.hasTap) return;
    if (this.amounts[idx] >= this.level.capacities[idx]) {
      this.callbacks.onFeedback?.(`⚠️ Kolba Nr. ${idx + 1} jau pilna (${this.level.capacities[idx]} L)!`);
      return;
    }
    this.amounts[idx] = this.level.capacities[idx];
    this.selectedIdx = null;
    this.hintAction = null;
    this.moves++;
    this.callbacks.onPourSound?.();
    this.checkWin();
    this.callbacks.onStateChange?.();
  }

  emptyJug(idx) {
    if (this.won || !this.level.hasTap) return;
    if (this.amounts[idx] <= 0) {
      this.callbacks.onFeedback?.(`⚠️ Kolba Nr. ${idx + 1} jau tuščia!`);
      return;
    }
    this.amounts[idx] = 0;
    this.selectedIdx = null;
    this.hintAction = null;
    this.moves++;
    this.callbacks.onPourSound?.();
    this.checkWin();
    this.callbacks.onStateChange?.();
  }

  pourJug(fromIdx, toIdx) {
    if (this.won || fromIdx === toIdx) return;
    if (this.amounts[fromIdx] <= 0) {
      this.callbacks.onFeedback?.(`⚠️ Kolba Nr. ${fromIdx + 1} tuščia – nėra ko perpilti!`);
      this.selectedIdx = null;
      this.callbacks.onStateChange?.();
      return;
    }
    const space = this.level.capacities[toIdx] - this.amounts[toIdx];
    if (space <= 0) {
      this.callbacks.onFeedback?.(`⚠️ Kolba Nr. ${toIdx + 1} jau pilna (${this.level.capacities[toIdx]} L)!`);
      this.selectedIdx = null;
      this.callbacks.onStateChange?.();
      return;
    }

    const amt = Math.min(this.amounts[fromIdx], space);
    this.amounts[fromIdx] -= amt;
    this.amounts[toIdx] += amt;
    this.selectedIdx = null;
    this.hintAction = null;
    this.moves++;
    this.callbacks.onPourSound?.();
    this.checkWin();
    this.callbacks.onStateChange?.();
  }

  checkWin() {
    if (this.amounts.includes(this.level.targetAmount)) {
      this.won = true;
      this.callbacks.onWin?.(this.moves);
    }
  }

  handlePointerDown(e) {
    if (this.won) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const layout = this.getLayout();

    // Patikrinti mygtukus po kolbomis (jei yra čiaupas)
    if (this.level.hasTap) {
      for (const box of layout) {
        if (y >= box.bottomY + 34 && y <= box.bottomY + 66) {
          if (x >= box.cx - 56 && x <= box.cx - 4) {
            this.fillJug(box.idx);
            return;
          }
          if (x >= box.cx + 4 && x <= box.cx + 56) {
            this.emptyJug(box.idx);
            return;
          }
        }
      }
    }

    for (const box of layout) {
      if (x >= box.x - 10 && x <= box.x + box.w + 10 && y >= box.y - 34 && y <= box.bottomY + 26) {
        if (this.selectedIdx === null) {
          this.selectedIdx = box.idx;
          this.callbacks.onSelectSound?.();
          this.callbacks.onStateChange?.();
        } else if (this.selectedIdx === box.idx) {
          this.selectedIdx = null;
          this.callbacks.onStateChange?.();
        } else {
          this.pourJug(this.selectedIdx, box.idx);
        }
        return;
      }
    }
  }

  startLoop() {
    this.lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      for (let i = 0; i < this.amounts.length; i++) {
        this.animAmounts[i] += (this.amounts[i] - this.animAmounts[i]) * Math.min(1, dt * 12);
      }
      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  render() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Viršutinė tikslo juosta
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = this.won ? '#4ade80' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(110, 14, W - 220, 38, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.won ? '#86efac' : '#e0f2fe';
    ctx.font = '900 15px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `🎯 TIKSLAS: Atmatuoti ${this.level.targetAmount} L   •   🏆 Meistras: ≤ ${this.level.masterMoves} ėj.`,
      W / 2,
      33
    );
    ctx.restore();

    const layout = this.getLayout();

    for (const box of layout) {
      const curL = this.amounts[box.idx];
      const animL = this.animAmounts[box.idx];
      const isSelected = this.selectedIdx === box.idx;
      const isTargetMatch = curL === this.level.targetAmount;
      const isHintFrom = this.hintAction && (this.hintAction.from === box.idx || this.hintAction.to === box.idx);

      ctx.save();
      if (isSelected || isHintFrom) {
        ctx.strokeStyle = isSelected ? '#fde047' : '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(box.x - 6, box.y - 6, box.w + 12, box.h + 12, 16);
        ctx.stroke();
      }

      // Skysčio lygis
      const fillRatio = Math.max(0, Math.min(1, animL / box.cap));
      const fillH = box.h * fillRatio;
      if (fillH > 1) {
        const liqGrad = ctx.createLinearGradient(0, box.bottomY - fillH, 0, box.bottomY);
        if (isTargetMatch) {
          liqGrad.addColorStop(0, '#4ade80');
          liqGrad.addColorStop(1, '#16a34a');
        } else {
          liqGrad.addColorStop(0, '#38bdf8');
          liqGrad.addColorStop(1, '#0284c7');
        }
        ctx.fillStyle = liqGrad;
        ctx.beginPath();
        ctx.roundRect(box.x + 3, box.bottomY - fillH, box.w - 6, fillH - 2, [4, 4, 10, 10]);
        ctx.fill();
      }

      // Stiklinės kolbos kontūras + padalos
      ctx.strokeStyle = isTargetMatch ? '#4ade80' : isSelected ? '#fde047' : '#cbd5e1';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.w, box.h, [4, 4, 14, 14]);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.32)';
      ctx.lineWidth = 1.3;
      for (let tick = 1; tick < box.cap; tick++) {
        const ty = box.bottomY - (tick / box.cap) * box.h;
        ctx.beginPath();
        ctx.moveTo(box.x + 6, ty);
        ctx.lineTo(box.x + (tick % 2 === 0 ? 18 : 12), ty);
        ctx.stroke();
      }

      // Talpa virš kolbos
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Maks. ${box.cap} L`, box.cx, box.y - 12);

      // Esamas kiekis kolbos centre arba apačioje
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px Nunito, sans-serif';
      ctx.fillText(`${curL} L`, box.cx, box.bottomY - box.h / 2 + 6);

      // Kolbos numeris po kolba
      ctx.fillStyle = isTargetMatch ? '#86efac' : '#e2e8f0';
      ctx.font = '900 13px Nunito, sans-serif';
      ctx.fillText(`Kolba #${box.idx + 1}`, box.cx, box.bottomY + 20);

      // Čiaupas ir išpylimo mygtukai (3 kl. 2-kolbų užduotyse)
      if (this.level.hasTap) {
        const btnY = box.bottomY + 34;
        // Pripilti
        ctx.fillStyle = '#0369a1';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(box.cx - 56, btnY, 52, 28, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '900 11px Nunito, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚰 +Pilti', box.cx - 30, btnY + 14);

        // Išpilti
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#fca5a5';
        ctx.beginPath();
        ctx.roundRect(box.cx + 4, btnY, 52, 28, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText('💧 Išp.', box.cx + 30, btnY + 14);
      }

      ctx.restore();
    }

    // Instrukcijos juosta pačioje apačioje
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    const guide = this.selectedIdx === null
      ? 'Paspausk ant kolbos, IŠ KURIOS nori pilti, tada – Į KURIĄ'
      : `Pasirinkta Kolba #${this.selectedIdx + 1} (${this.amounts[this.selectedIdx]} L) — dabar paspausk ant tikslo kolbos!`;
    ctx.fillText(guide, W / 2, H - 14);
    ctx.restore();
  }
}
