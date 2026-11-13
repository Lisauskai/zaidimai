// ==================== 8. KRUMPLIARAČIŲ VARIKLIS (GEARS, CONSTRAINTS & HEAVY LIFTS) ====================
export const GEARS_CANVAS_W = 540;
export const GEARS_CANVAS_H = 440;

export const GEAR_SIZES = {
  S: { key: 'S', label: 'Mažas (R=25)', short: 'Mažas', radius: 25, teeth: 8, color: '#38bdf8', rim: '#0284c7' },
  M: { key: 'M', label: 'Vidutinis (R=40)', short: 'Vidutinis', radius: 40, teeth: 12, color: '#a78bfa', rim: '#6d28d9' },
  L: { key: 'L', label: 'Didelis (R=55)', short: 'Didelis', radius: 55, teeth: 16, color: '#fb923c', rim: '#c2410c' }
};

export const GEARS_LEVELS = {
  grade1: [
    {
      id: 'gea_g1_1',
      title: '1. Vartai ir lemputė',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Sujunk variklį su abiem mechanizmais (🚪 Vartais ir 💡 Lempute)! Pasirink tikslius dydžius iš turimo rinkinio.',
      reward: 1,
      motor: { id: 'motor', x: 105, y: 220, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 250, y: 155, radius: 40, teeth: 12, requiredDir: null, icon: '🚪', label: 'Vartai' },
        { id: 'goal2', x: 250, y: 270, radius: 25, teeth: 8, requiredDir: null, icon: '💡', label: 'Lemputė' }
      ],
      pegs: [
        { id: 'p1', x: 185, y: 220 },
        { id: 'p2', x: 250, y: 220 }
      ],
      walls: [],
      belts: [],
      inventory: { S: 1, M: 1, L: 0 }
    },
    {
      id: 'gea_g1_2',
      title: '2. Aplink raudoną bloką',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Saugokis raudono bloko! Jei uždėsi per didelį krumpliaratį, jis užstrigs. Užsuk abu mechanizmus!',
      reward: 1,
      motor: { id: 'motor', x: 100, y: 220, radius: 25, teeth: 8, dir: 1 },
      goals: [
        { id: 'goal1', x: 340, y: 170, radius: 25, teeth: 8, requiredDir: null, icon: '🚪', label: 'Vartai' },
        { id: 'goal2', x: 340, y: 285, radius: 40, teeth: 12, requiredDir: null, icon: '💡', label: 'Lemputė' }
      ],
      pegs: [
        { id: 'p1', x: 180, y: 220 },
        { id: 'p2', x: 275, y: 220 },
        { id: 'p3', x: 340, y: 220 }
      ],
      walls: [
        { x: 255, y: 264, w: 40, h: 60 }
      ],
      belts: [],
      inventory: { S: 1, M: 1, L: 1 }
    },
    {
      id: 'gea_g1_3',
      title: '3. Dvi atšakos',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Variklis stovi centre! Kiekvienam sparnui parink tinkamą krumpliaratį, kad neliktų tarpo ir nekliudytų blokų.',
      reward: 1,
      motor: { id: 'motor', x: 260, y: 220, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 115, y: 170, radius: 25, teeth: 8, requiredDir: null, icon: '🚪', label: 'Vartai' },
        { id: 'goal2', x: 420, y: 220, radius: 40, teeth: 12, requiredDir: null, icon: '💡', label: 'Lemputė' }
      ],
      pegs: [
        { id: 'p1', x: 180, y: 220 },
        { id: 'p2', x: 115, y: 220 },
        { id: 'p3', x: 340, y: 220 }
      ],
      walls: [
        { x: 318, y: 140, w: 44, h: 36 },
        { x: 80, y: 252, w: 70, h: 44 }
      ],
      belts: [],
      inventory: { S: 1, M: 2, L: 0 }
    },
    {
      id: 'gea_g1_4',
      title: '4. Siauras praėjimas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Tarp raudonų blokų tilps tik tikslaus dydžio krumpliaratis! Apskaičiuok atstumus iki abiejų tikslų.',
      reward: 2,
      motor: { id: 'motor', x: 100, y: 260, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 245, y: 130, radius: 25, teeth: 8, requiredDir: null, icon: '📡', label: 'Antena' },
        { id: 'goal2', x: 420, y: 260, radius: 40, teeth: 12, requiredDir: null, icon: '💡', label: 'Lemputė' }
      ],
      pegs: [
        { id: 'p1', x: 165, y: 260 },
        { id: 'p2', x: 245, y: 260 },
        { id: 'p3', x: 245, y: 180 },
        { id: 'p4', x: 340, y: 260 }
      ],
      walls: [
        { x: 147, y: 186, w: 36, h: 38 },
        { x: 318, y: 170, w: 44, h: 42 }
      ],
      belts: [],
      inventory: { S: 2, M: 1, L: 1 }
    },
    {
      id: 'gea_g1_5',
      title: '5. Viršutinė ir apatinė linija',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Sujunk grandinę per 4 kaiščius aplink vidurio sieną, kad vienu metu įsijungtų 🚪 ir ⚡!',
      reward: 2,
      motor: { id: 'motor', x: 100, y: 220, radius: 25, teeth: 8, dir: 1 },
      goals: [
        { id: 'goal1', x: 245, y: 140, radius: 40, teeth: 12, requiredDir: null, icon: '🚪', label: 'Vartai' },
        { id: 'goal2', x: 375, y: 285, radius: 25, teeth: 8, requiredDir: null, icon: '⚡', label: 'Švyturys' }
      ],
      pegs: [
        { id: 'p1', x: 165, y: 220 },
        { id: 'p2', x: 245, y: 220 },
        { id: 'p3', x: 245, y: 285 },
        { id: 'p4', x: 310, y: 285 }
      ],
      walls: [
        { x: 295, y: 180, w: 64, h: 60 }
      ],
      belts: [],
      inventory: { S: 1, M: 3, L: 0 }
    },
    {
      id: 'gea_g1_6',
      title: '6. Didžiojo rato tiltas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Turi du didelius R=55 krumpliaračius – kur jiems užteks vietos tarp raudonų blokų?',
      reward: 2,
      motor: { id: 'motor', x: 100, y: 290, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 260, y: 130, radius: 40, teeth: 12, requiredDir: null, icon: '💡', label: 'Lemputė' },
        { id: 'goal2', x: 435, y: 195, radius: 40, teeth: 12, requiredDir: null, icon: '🚪', label: 'Vartai' }
      ],
      pegs: [
        { id: 'p1', x: 100, y: 195 },
        { id: 'p2', x: 195, y: 195 },
        { id: 'p3', x: 260, y: 195 },
        { id: 'p4', x: 340, y: 195 }
      ],
      walls: [
        { x: 170, y: 242, w: 120, h: 55 },
        { x: 320, y: 95, w: 40, h: 42 }
      ],
      belts: [],
      inventory: { S: 1, M: 1, L: 2 }
    },
    {
      id: 'gea_g1_7',
      title: '7. Robotų dirbtuvės',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Sujunk didįjį R=55 ir mažąjį R=25 krumpliaračius taip, kad pasiektum tiek viršutinį, tiek apatinį tikslą!',
      reward: 2,
      motor: { id: 'motor', x: 105, y: 225, radius: 55, teeth: 16, dir: 1 },
      goals: [
        { id: 'goal1', x: 345, y: 130, radius: 40, teeth: 12, requiredDir: null, icon: '🚀', label: 'Liukas' },
        { id: 'goal2', x: 345, y: 305, radius: 25, teeth: 8, requiredDir: null, icon: '💡', label: 'Lemputė' }
      ],
      pegs: [
        { id: 'p1', x: 200, y: 225 },
        { id: 'p2', x: 265, y: 225 },
        { id: 'p3', x: 345, y: 225 }
      ],
      walls: [
        { x: 178, y: 136, w: 44, h: 44 },
        { x: 246, y: 258, w: 38, h: 46 }
      ],
      belts: [],
      inventory: { S: 1, M: 1, L: 1 }
    },
    {
      id: 'gea_g1_8',
      title: '8. Z formos grandinė',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Išvesk Z formos grandinę per 4 kaiščius aplink raudonus blokus iki abiejų mechanizmų!',
      reward: 2,
      motor: { id: 'motor', x: 95, y: 135, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 255, y: 135, radius: 40, teeth: 12, requiredDir: null, icon: '📡', label: 'Radaras' },
        { id: 'goal2', x: 365, y: 325, radius: 40, teeth: 12, requiredDir: null, icon: '🚪', label: 'Vartai' }
      ],
      pegs: [
        { id: 'p1', x: 175, y: 135 },
        { id: 'p2', x: 175, y: 230 },
        { id: 'p3', x: 270, y: 230 },
        { id: 'p4', x: 270, y: 325 }
      ],
      walls: [
        { x: 60, y: 205, w: 55, h: 120 },
        { x: 325, y: 170, w: 80, h: 45 }
      ],
      belts: [],
      inventory: { S: 0, M: 2, L: 2 }
    },
    {
      id: 'gea_g1_9',
      title: '9. Dvigubas sparnas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: 'Kairėje yra mažiau kaiščių, o dešinėje reikia ilgos grandinės! Užsuk 💡 ir 🚪.',
      reward: 3,
      motor: { id: 'motor', x: 250, y: 225, radius: 25, teeth: 8, dir: 1 },
      goals: [
        { id: 'goal1', x: 105, y: 225, radius: 40, teeth: 12, requiredDir: null, icon: '💡', label: 'Lemputė' },
        { id: 'goal2', x: 445, y: 160, radius: 25, teeth: 8, requiredDir: null, icon: '🚪', label: 'Vartai' }
      ],
      pegs: [
        { id: 'p1', x: 185, y: 225 },
        { id: 'p2', x: 315, y: 225 },
        { id: 'p3', x: 380, y: 225 },
        { id: 'p4', x: 445, y: 225 }
      ],
      walls: [
        { x: 162, y: 132, w: 46, h: 44 },
        { x: 358, y: 258, w: 44, h: 44 }
      ],
      belts: [],
      inventory: { S: 1, M: 3, L: 0 }
    },
    {
      id: 'gea_g1_10',
      title: '10. Kosminės stoties variklis',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 1 KL.',
      instruction: '1 klasės finalas! Sudėk visus 5 turimus krumpliaračius be klaidų ir įjunk abudu mechanizmus!',
      reward: 3,
      motor: { id: 'motor', x: 100, y: 220, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 245, y: 90, radius: 25, teeth: 8, requiredDir: null, icon: '🚪', label: 'Vartai' },
        { id: 'goal2', x: 420, y: 300, radius: 40, teeth: 12, requiredDir: null, icon: '⚡', label: 'Reaktorius' }
      ],
      pegs: [
        { id: 'p1', x: 165, y: 220 },
        { id: 'p2', x: 245, y: 220 },
        { id: 'p3', x: 245, y: 140 },
        { id: 'p4', x: 340, y: 220 },
        { id: 'p5', x: 340, y: 300 }
      ],
      walls: [
        { x: 142, y: 145, w: 46, h: 46 },
        { x: 210, y: 280, w: 55, h: 55 }
      ],
      belts: [],
      inventory: { S: 2, M: 2, L: 1 }
    }
  ],
  grade3: [
    {
      id: 'gea_g3_1',
      title: '1. Krypties skaičiavimas (↻)',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Kiekvienas susikabinimas pakeičia kryptį! Pravesk kelią taip, kad generatorius suktųsi PAGAL laikrodį (↻).',
      reward: 2,
      motor: { id: 'motor', x: 120, y: 260, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal', x: 310, y: 260, radius: 40, teeth: 12, requiredDir: 1, icon: '⚙️', label: 'Generatorius' }
      ],
      pegs: [
        { id: 's1', x: 185, y: 260 },
        { id: 's2', x: 245, y: 260 },
        { id: 'u1', x: 120, y: 165 },
        { id: 'u2', x: 215, y: 165 },
        { id: 'u3', x: 310, y: 165 }
      ],
      walls: [],
      belts: [],
      inventory: { S: 2, M: 1, L: 2 }
    },
    {
      id: 'gea_g3_2',
      title: '2. Diržinė pavara (↺)',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Diržas perduoda sukimąsi NEKEISDAMAS krypties! Pasuk generatorių PRIEŠ laikrodžio rodyklę (↺).',
      reward: 2,
      motor: { id: 'motor', x: 105, y: 250, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal', x: 355, y: 230, radius: 40, teeth: 12, requiredDir: -1, icon: '⚙️', label: 'Generatorius' }
      ],
      pegs: [
        { id: 'p1', x: 105, y: 155 },
        { id: 'p2', x: 275, y: 165 },
        { id: 'p3', x: 275, y: 230 }
      ],
      walls: [
        { x: 165, y: 215, w: 50, h: 75 }
      ],
      belts: [{ a: 'p1', b: 'p2' }],
      inventory: { S: 1, M: 1, L: 1 }
    },
    {
      id: 'gea_g3_3',
      title: '3. Kuri trasa teisinga?',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Viršuje trasa be diržo, apačioje – su diržu! Kuria trasa pasieksi ↻ (PAGAL laikrodžio rodyklę)?',
      reward: 2,
      motor: { id: 'motor', x: 120, y: 220, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal', x: 295, y: 220, radius: 25, teeth: 8, requiredDir: 1, icon: '⚙️', label: 'Generatorius' }
      ],
      pegs: [
        { id: 'b1', x: 120, y: 155 },
        { id: 'b2', x: 200, y: 155 },
        { id: 'b3', x: 295, y: 155 },
        { id: 'a1', x: 120, y: 315 },
        { id: 'a2', x: 230, y: 270 },
        { id: 'a3', x: 295, y: 270 }
      ],
      walls: [],
      belts: [{ a: 'a1', b: 'a2' }],
      inventory: { S: 1, M: 1, L: 1 }
    },
    {
      id: 'gea_g3_4',
      title: '4. Dvigubas diržas ir kliūtis',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Du diržai apeina raudoną sieną! Parink teisingus dydžius, kad tikslas suktųsi ↺ kryptimi.',
      reward: 2,
      motor: { id: 'motor', x: 95, y: 130, radius: 25, teeth: 8, dir: 1 },
      goals: [
        { id: 'goal', x: 410, y: 200, radius: 25, teeth: 8, requiredDir: -1, icon: '⚙️', label: 'Generatorius' }
      ],
      pegs: [
        { id: 'p1', x: 175, y: 130 },
        { id: 'p2', x: 175, y: 280 },
        { id: 'p3', x: 255, y: 280 },
        { id: 'p4', x: 410, y: 280 }
      ],
      walls: [
        { x: 230, y: 160, w: 100, h: 55 },
        { x: 150, y: 328, w: 135, h: 40 }
      ],
      belts: [
        { a: 'p1', b: 'p2' },
        { a: 'p3', b: 'p4' }
      ],
      inventory: { S: 0, M: 2, L: 2 }
    },
    {
      id: 'gea_g3_5',
      title: '5. Du tikslai priešingomis kryptimis',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: '🚪 Vartai turi suktis ↻, o 💡 Lemputė – ↺! Panaudok diržinę pavarą ir apeik kliūtis.',
      reward: 2,
      motor: { id: 'motor', x: 100, y: 225, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 320, y: 130, radius: 55, teeth: 16, requiredDir: 1, icon: '🚪', label: 'Vartai (↻)' },
        { id: 'goal2', x: 385, y: 290, radius: 40, teeth: 12, requiredDir: -1, icon: '💡', label: 'Lemputė (↺)' }
      ],
      pegs: [
        { id: 'p1', x: 180, y: 225 },
        { id: 'p2', x: 320, y: 225 },
        { id: 'p3', x: 320, y: 290 }
      ],
      walls: [
        { x: 220, y: 270, w: 50, h: 60 }
      ],
      belts: [{ a: 'p1', b: 'p2' }],
      inventory: { S: 1, M: 2, L: 0 }
    },
    {
      id: 'gea_g3_6',
      title: '6. Sunkusis liftas 🏋️',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Nauja jėgos taisyklė! Sunkų 500 kg liftą gali pakelti TIK DIDELIS (R=55) krumpliaratis, varomas MAŽO (R=25)!',
      reward: 2,
      motor: { id: 'motor', x: 100, y: 240, radius: 40, teeth: 12, dir: 1 },
      goals: [],
      lift: { pegId: 'p2', weightKg: 500, cableX: 390, label: 'Sunkus liftas', requiredDir: null },
      pegs: [
        { id: 'p1', x: 165, y: 240 },
        { id: 'p2', x: 245, y: 240 }
      ],
      walls: [
        { x: 145, y: 282, w: 40, h: 55 }
      ],
      belts: [],
      inventory: { S: 1, M: 0, L: 1 }
    },
    {
      id: 'gea_g3_7',
      title: '7. Jėgos ir krypties skaičiavimas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Skaičiuok tarpus (65 px ir 80 px)! Tik MAŽAS (R=25) ➔ DIDELIS (R=55) pakels 800 kg kraną ↺ kryptimi!',
      reward: 3,
      motor: { id: 'motor', x: 100, y: 240, radius: 40, teeth: 12, dir: 1 },
      goals: [],
      lift: { pegId: 'p3', weightKg: 800, cableX: 430, label: 'Kranas ↺', requiredDir: -1 },
      pegs: [
        { id: 'p1', x: 180, y: 240 },
        { id: 'p2', x: 245, y: 240 },
        { id: 'p3', x: 325, y: 240 }
      ],
      walls: [],
      belts: [],
      inventory: { S: 1, M: 2, L: 1 }
    },
    {
      id: 'gea_g3_8',
      title: '8. Diržas į sunkųjį liftą',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Perduok sukimąsi per diržą ir pastatyk MAŽĄ ➔ DIDELĮ prieš liftą, kad jis suktųsi ↺ kryptimi!',
      reward: 3,
      motor: { id: 'motor', x: 95, y: 150, radius: 40, teeth: 12, dir: 1 },
      goals: [],
      lift: { pegId: 'p4', weightKg: 900, cableX: 455, label: 'Liftas ↺', requiredDir: -1 },
      pegs: [
        { id: 'p1', x: 95, y: 245 },
        { id: 'p2', x: 230, y: 245 },
        { id: 'p3', x: 295, y: 245 },
        { id: 'p4', x: 375, y: 245 }
      ],
      walls: [
        { x: 165, y: 110, w: 60, h: 80 }
      ],
      belts: [{ a: 'p1', b: 'p2' }],
      inventory: { S: 1, M: 1, L: 2 }
    },
    {
      id: 'gea_g3_9',
      title: '9. Liftas ir vartai vienu metu',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: 'Viena grandinė turi pakelti 700 kg liftą (↺) IR pasukti 🚪 Vartus (↺)!',
      reward: 3,
      motor: { id: 'motor', x: 100, y: 230, radius: 40, teeth: 12, dir: 1 },
      goals: [
        { id: 'goal1', x: 245, y: 165, radius: 40, teeth: 12, requiredDir: -1, icon: '🚪', label: 'Vartai (↺)' }
      ],
      lift: { pegId: 'p3', weightKg: 700, cableX: 430, label: 'Liftas ↺', requiredDir: -1 },
      pegs: [
        { id: 'p1', x: 180, y: 230 },
        { id: 'p2', x: 245, y: 230 },
        { id: 'p3', x: 325, y: 230 }
      ],
      walls: [
        { x: 160, y: 280, w: 42, h: 50 }
      ],
      belts: [],
      inventory: { S: 1, M: 1, L: 1 }
    },
    {
      id: 'gea_g3_10',
      title: '10. Didysis inžinieriaus egzaminas',
      badge: '⚙️ KRUMPLIARAČIŲ VARIKLIS • 3 KL.',
      instruction: '3 klasės finalas! Apeik raudonus blokus per diržą, įjunk 💡 (↻) ir pakelk 1000 kg liftą (↺)!',
      reward: 3,
      motor: { id: 'motor', x: 95, y: 295, radius: 25, teeth: 8, dir: 1 },
      goals: [
        { id: 'goal1', x: 385, y: 160, radius: 40, teeth: 12, requiredDir: 1, icon: '💡', label: 'Lemputė (↻)' }
      ],
      lift: { pegId: 'p4', weightKg: 1000, cableX: 455, label: 'Liftas ↺', requiredDir: -1 },
      pegs: [
        { id: 'p1', x: 160, y: 295 },
        { id: 'p2', x: 160, y: 160 },
        { id: 'p3', x: 210, y: 160 },
        { id: 'p4', x: 290, y: 160 }
      ],
      walls: [
        { x: 210, y: 245, w: 80, h: 75 },
        { x: 140, y: 102, w: 40, h: 26 }
      ],
      belts: [{ a: 'p1', b: 'p2' }],
      inventory: { S: 2, M: 1, L: 1 }
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
    this.angles = {};
    this.speeds = {};
    this.drivenBy = {}; // gearId -> driverGearId
    this.jammed = false;
    this.jamReason = '';
    this.jammedIds = new Set();
    this.liftProgress = 0;
    this.liftReady = false;
    this.liftErrorReason = '';
    this.won = false;
    this.hintPeg = null;

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

  getGoals() {
    if (Array.isArray(this.level.goals)) return this.level.goals;
    return this.level.goal ? [this.level.goal] : [];
  }

  reset() {
    this.placed = {};
    this.won = false;
    this.hintPeg = null;
    this.liftProgress = 0;
    this.liftReady = false;
    this.liftErrorReason = '';
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
      }
    ];

    for (const g of this.getGoals()) {
      list.push({
        id: g.id,
        kind: 'goal',
        goalMeta: g,
        x: g.x,
        y: g.y,
        radius: g.radius,
        teeth: g.teeth,
        color: '#facc15',
        rim: '#b45309'
      });
    }

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
    this.drivenBy = {};
    this.jammed = false;
    this.jamReason = '';
    this.jammedIds = new Set();
    this.liftReady = false;
    this.liftErrorReason = '';

    // 1. Raudonų blokų (sienų) ir kaimyninių krumpliaračių susikirtimo patikra
    for (const g of gears) {
      if (g.kind === 'placed') {
        for (const w of this.level.walls || []) {
          if (circleIntersectsRect(g.x, g.y, g.radius - 2, w)) {
            this.jammed = true;
            this.jammedIds.add(g.id);
            this.jamReason = '💥 Užstrigo į raudoną bloką! Parink mažesnį krumpliaratį arba kitą kaištį.';
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
    const baseOmega = 1.65 * this.level.motor.dir;
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

        const targetOmega = meshes
          ? -curOmega * (curG.radius / other.radius)
          : curOmega * (curG.radius / other.radius);

        if (this.speeds[other.id] === undefined) {
          this.speeds[other.id] = targetOmega;
          this.drivenBy[other.id] = { driverId: curId, viaBelt: !meshes && hasBelt };
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

    if (this.jammed) {
      this.callbacks.onStateChange?.();
      return;
    }

    // 3. Visų tikslų (1–2 mechanizmai) ir sunkiojo lifto patikra
    const goals = this.getGoals();
    const allGoalsOk = goals.every((g) => {
      const sp = this.speeds[g.id];
      if (!sp) return false;
      if (g.requiredDir !== null && g.requiredDir !== undefined && Math.sign(sp) !== g.requiredDir) {
        return false;
      }
      return true;
    });

    let liftOk = true;
    if (this.level.lift) {
      const liftCfg = this.level.lift;
      const liftGear = byId.get(liftCfg.pegId);
      const liftSpeed = this.speeds[liftCfg.pegId];
      const drvInfo = this.drivenBy[liftCfg.pegId];
      const driverGear = drvInfo ? byId.get(drvInfo.driverId) : null;

      if (!liftGear || !liftSpeed) {
        liftOk = false;
      } else if (liftGear.radius !== 55 || !driverGear || driverGear.radius !== 25) {
        liftOk = false;
        this.liftErrorReason = `🏋️ Per silpna jėga ${liftCfg.weightKg} kg liftui! Didelį (R=55) privalo sukti Mažas (R=25)!`;
      } else if (
        liftCfg.requiredDir !== null &&
        liftCfg.requiredDir !== undefined &&
        Math.sign(liftSpeed) !== liftCfg.requiredDir
      ) {
        liftOk = false;
        this.liftErrorReason = `🔄 Liftas sukasi ne ta kryptimi! Reikia ${liftCfg.requiredDir > 0 ? '↻' : '↺'}.`;
      } else {
        this.liftReady = true;
      }
    }

    if (allGoalsOk && liftOk) {
      if (!this.won) {
        this.won = true;
        this.callbacks.onWin?.();
      }
    }

    this.callbacks.onStateChange?.();
  }

  getStatusSummary() {
    if (this.jammed) {
      return { state: 'jammed', text: this.jamReason };
    }
    if (this.won) {
      return { state: 'won', text: '✅ Puiku! Visi mechanizmai veikia nepriekaištingai!' };
    }
    if (this.liftErrorReason) {
      return { state: 'wrong-dir', text: this.liftErrorReason };
    }

    const goals = this.getGoals();
    const wrongGoal = goals.find((g) => {
      const sp = this.speeds[g.id];
      return sp && g.requiredDir !== null && g.requiredDir !== undefined && Math.sign(sp) !== g.requiredDir;
    });
    if (wrongGoal) {
      const dir = Math.sign(this.speeds[wrongGoal.id]);
      return {
        state: 'wrong-dir',
        text: `🔄 „${wrongGoal.label}“ sukasi ${dir > 0 ? '↻' : '↺'}, o reikia ${wrongGoal.requiredDir > 0 ? '↻' : '↺'}!`
      };
    }

    const activeCount = goals.filter((g) => this.speeds[g.id]).length;
    if (goals.length > 1 && activeCount > 0 && activeCount < goals.length) {
      return {
        state: 'idle',
        text: `⚙️ Veikia ${activeCount} iš ${goals.length} mechanizmų – sujunk likusį!`
      };
    }

    return {
      state: 'idle',
      text: this.level.lift
        ? '⚙️ Sujunk krumpliaračius ir uždėk Mažą (R=25) ➔ Didelį (R=55) ant lifto!'
        : '⚙️ Parink krumpliaračių dydžius (R=25, 40, 55) ir sujunk visus tikslus!'
    };
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

    const avail = this.getRemainingCount(sizeKey);
    if (avail <= 0) {
      this.callbacks.onError?.(`Nebeliko „${GEAR_SIZES[sizeKey].label}“ krumpliaračių!`);
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

      const targetLift = this.liftReady ? 1 : 0;
      this.liftProgress += (targetLift - this.liftProgress) * Math.min(1, dt * 4);

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

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Brėžinio tinklelis
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

    // Raudoni kliūties blokai
    for (const w of this.level.walls || []) {
      ctx.save();
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(w.x, w.y, w.w, w.h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(254, 202, 202, 0.22)';
      ctx.lineWidth = 6;
      for (let d = -w.h; d < w.w + w.h; d += 18) {
        ctx.beginPath();
        ctx.moveTo(w.x + d, w.y);
        ctx.lineTo(w.x + d - w.h, w.y + w.h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = '#fecaca';
      ctx.font = '900 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚫 BLOKAS', w.x + w.w / 2, w.y + w.h / 2);
      ctx.restore();
    }

    const coordMap = new Map();
    coordMap.set('motor', { x: this.level.motor.x, y: this.level.motor.y, r: this.level.motor.radius });
    for (const g of this.getGoals()) {
      coordMap.set(g.id, { x: g.x, y: g.y, r: g.radius });
    }
    for (const peg of this.level.pegs) {
      const sk = this.placed[peg.id];
      coordMap.set(peg.id, { x: peg.x, y: peg.y, r: sk ? GEAR_SIZES[sk].radius : 18 });
    }

    // Diržinės pavaros
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

    // Sunkaus lifto kranas dešinėje (jei lygis turi liftą)
    if (this.level.lift) {
      this.drawHeavyLiftRig(ctx, this.level.lift, coordMap.get(this.level.lift.pegId));
    }

    // Tušti tvirtinimo kaiščiai
    for (const peg of this.level.pegs) {
      const hasGear = Boolean(this.placed[peg.id]);
      const isHint = this.hintPeg && this.hintPeg.pegId === peg.id;
      const isLiftPeg = this.level.lift && this.level.lift.pegId === peg.id;

      ctx.save();
      if (isLiftPeg) {
        ctx.strokeStyle = this.liftReady ? '#4ade80' : '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 58, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (isHint) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 26 + 3 * Math.sin(performance.now() * 0.008), 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!hasGear) {
        ctx.strokeStyle = isLiftPeg ? 'rgba(250, 204, 21, 0.75)' : 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = isLiftPeg ? '#facc15' : '#94a3b8';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (isLiftPeg) {
          ctx.fillStyle = '#fef08a';
          ctx.font = '900 11px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🏋️ LIFTAS', peg.x, peg.y + 34);
        }
      }
      ctx.restore();
    }

    // Visi krumpliaračiai
    const activeGears = this.getAllActiveGears();
    for (const g of activeGears) {
      const ang = this.angles[g.id] || 0;
      const isJammed = this.jammedIds.has(g.id);
      const omega = this.speeds[g.id] || 0;
      this.drawGear(ctx, g, ang, isJammed, omega);
    }

    // Variklio etiketė
    ctx.save();
    ctx.fillStyle = '#86efac';
    ctx.font = '900 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`VARIKLIS ${this.level.motor.dir > 0 ? '↻' : '↺'}`, this.level.motor.x, this.level.motor.y + this.level.motor.radius + 18);
    ctx.restore();

    // Tikslų ženkliukai (1–2 mechanizmai + kryptys)
    for (const g of this.getGoals()) {
      const sp = this.speeds[g.id] || 0;
      const dirOk = g.requiredDir == null || (sp && Math.sign(sp) === g.requiredDir);
      const active = Boolean(sp) && dirOk;

      if (g.requiredDir !== null && g.requiredDir !== undefined) {
        this.drawRequiredDirBadge(ctx, g.x, g.y - g.radius - 22, g.requiredDir, active);
      }

      ctx.save();
      ctx.fillStyle = active ? '#4ade80' : '#fef08a';
      ctx.font = '900 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${g.icon || '⚙️'} ${g.label || 'Tikslas'}`, g.x, g.y + g.radius + 18);
      ctx.restore();
    }

    if (this.jammed) {
      ctx.save();
      ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
      ctx.beginPath();
      ctx.roundRect(50, 14, W - 100, 32, 10);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 13px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠️ SISTEMA UŽSTRIGO! Nuimk ar pakeisk krumpliaratį', W / 2, 30);
      ctx.restore();
    }
  }

  drawHeavyLiftRig(ctx, liftCfg, pegCoord) {
    const cx = liftCfg.cableX || 440;
    const topY = 80;
    const botY = 340;
    const boxY = botY - this.liftProgress * 155;

    ctx.save();
    // Stovas
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 26, topY - 14, 52, botY - topY + 58, 10);
    ctx.fill();
    ctx.stroke();

    // Trosas nuo lifto kaiščio
    if (pegCoord) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pegCoord.x, pegCoord.y);
      ctx.lineTo(cx, topY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = this.liftReady ? '#4ade80' : '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, boxY);
    ctx.stroke();

    // Sunkus krovinys
    ctx.fillStyle = this.liftReady ? '#15803d' : '#b45309';
    ctx.strokeStyle = this.liftReady ? '#86efac' : '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 34, boxY, 68, 44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🏋️ ${liftCfg.weightKg}kg`, cx, boxY + 22);

    if (liftCfg.requiredDir !== null && liftCfg.requiredDir !== undefined && pegCoord) {
      this.drawRequiredDirBadge(ctx, pegCoord.x, pegCoord.y - 76, liftCfg.requiredDir, this.liftReady);
    }
    ctx.restore();
  }

  drawGear(ctx, g, angle, isJammed, omega) {
    const rOuter = g.radius + 5;
    const rInner = g.radius - 5;
    const teeth = g.teeth;

    ctx.save();
    ctx.translate(g.x, g.y);

    if (isJammed) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
    } else if (g.kind === 'goal' && this.won) {
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 22;
    }

    ctx.rotate(angle);

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

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

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

  drawRequiredDirBadge(ctx, cx, cy, dir, ok) {
    ctx.save();
    ctx.fillStyle = ok ? '#16a34a' : '#7c2d12';
    ctx.strokeStyle = ok ? '#86efac' : '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 54, cy - 13, 108, 24, 999);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 11px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dir > 0 ? 'REIKIA: ↻ PAGAL' : 'REIKIA: ↺ PRIEŠ', cx, cy - 1);
    ctx.restore();
  }
}
