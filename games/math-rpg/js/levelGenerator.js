// 5 Pilni Žaidimo Pasauliai (Worlds 1–5) su unikaliomis mechanikomis, priešais ir kelių fazių Pasaulio Bosais!
// - Pasaulis 1: Žaliasis Miškas (Goblinai, Gleiviai, Lankininkai | Bosas: Didžiulis Miško Medis 🌳)
// - Pasaulis 2: Kristalų Urvai (Akmeniniai Golemai, Šikšnosparniai | Mechanika: Trupantys kristalai 💎 | Bosas: Krištolinis Slibinas 🐉)
// - Pasaulis 3: Ledo Karalystė (Sniego seniai, Pingvinai | Mechanika: Slydimas ant ledo ❄️ | Bosas: Sniego Karalius ☃️)
// - Pasaulis 4: Lavos Ugnikalnis (Ugnies elementaliai, Skraidantys demonai | Mechanika: Lavos duobės 🌋 | Bosas: Ugnies Demonas 👹)
// - Pasaulis 5: Kosmoso Stotis (Ateiviai, Skraidančios lėkštės UFO | Mechanika: Maža gravitacija 1.5x šuolis 🚀 | Bosas: Ateivių Motininis Laivas 🛸)

export const WORLDS = [
  {
    id: 1,
    name: 'Žaliasis Miškas',
    icon: '🌲',
    subtitle: 'Paslėpti kambariai, batutai, svyruojantys kirviai ir Didžiulis Miško Medis',
    mechanicBadge: '🌿 Miško Nuotykis',
    skyTop: '#0284c7',
    skyBottom: '#bae6fd',
    hillColor1: '#22c55e',
    hillColor2: '#16a34a',
    groundTop: '#15803d',
    groundFill: '#78350f',
    platformTop: '#22c55e',
    platformFill: '#92400e',
    bossName: 'Didžiulis Miško Medis',
    bossIcon: '🌳',
    bossHp: 20,
    bossProjectileColor: '#4ade80'
  },
  {
    id: 2,
    name: 'Kristalų Urvai',
    icon: '💎',
    subtitle: 'Tamsūs požemiai, greitai trupantys kristalai, Akmeniniai Golemai ir Šikšnosparniai',
    mechanicBadge: '💎 Mechanika: Trupantys kristalai!',
    skyTop: '#070913',
    skyBottom: '#1e1b4b',
    hillColor1: '#1e1b4b',
    hillColor2: '#312e81',
    groundTop: '#c084fc',
    groundFill: '#1e1b4b',
    platformTop: '#d8b4fe',
    platformFill: '#3b0764',
    bossName: 'Krištolinis Slibinas',
    bossIcon: '🐉',
    bossHp: 22,
    bossProjectileColor: '#c084fc'
  },
  {
    id: 3,
    name: 'Ledo Karalystė',
    icon: '❄️',
    subtitle: 'Slidžios ledo platformos, gniūžtes mėtantys Sniego seniai ir čiuožiantys Pingvinai',
    mechanicBadge: '❄️ Mechanika: Slydimas ant ledo!',
    skyTop: '#0369a1',
    skyBottom: '#e0f2fe',
    hillColor1: '#bae6fd',
    hillColor2: '#7dd3fc',
    groundTop: '#f0f9ff',
    groundFill: '#0c4a6e',
    platformTop: '#e0f2fe',
    platformFill: '#0284c7',
    bossName: 'Sniego Karalius',
    bossIcon: '☃️',
    bossHp: 25,
    bossProjectileColor: '#e0f2fe'
  },
  {
    id: 4,
    name: 'Lavos Ugnikalnis',
    icon: '🌋',
    subtitle: 'Kunkuliuojančios lavos duobės, juodos uolienos, Ugnies elementaliai ir Skraidantys demonai',
    mechanicBadge: '🌋 Mechanika: Lavos duobės (-1 ❤️ ir atmetimas)!',
    skyTop: '#450a0a',
    skyBottom: '#ea580c',
    hillColor1: '#7f1d1d',
    hillColor2: '#991b1b',
    groundTop: '#f97316',
    groundFill: '#18181b',
    platformTop: '#fbbf24',
    platformFill: '#27272a',
    bossName: 'Ugnies Demonas',
    bossIcon: '👹',
    bossHp: 28,
    bossProjectileColor: '#f97316'
  },
  {
    id: 5,
    name: 'Kosmoso Stotis',
    icon: '🚀',
    subtitle: 'Žvaigždžių erdvė, maža gravitacija (1.5x šuolis), Ateiviai ir Skraidančios lėkštės (UFO)',
    mechanicBadge: '🚀 Mechanika: Maža gravitacija (1.5x šuolis)!',
    skyTop: '#030712',
    skyBottom: '#0f172a',
    hillColor1: '#0f172a',
    hillColor2: '#1e293b',
    groundTop: '#38bdf8',
    groundFill: '#0f172a',
    platformTop: '#22d3ee',
    platformFill: '#334155',
    bossName: 'Ateivių Motininis Laivas',
    bossIcon: '🛸',
    bossHp: 30,
    bossProjectileColor: '#22d3ee'
  }
];

function createSeededRandom(seed) {
  let s = seed * 16807 + 98765;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSecretBonusRoom(levelId) {
  const groundY = 480;
  const width = 1960;
  const theme = levelId % 2 === 1 ? 'cave_vault' : 'cloud_sanctuary';
  const coinVal = 4 + Math.floor(levelId / 2);

  const platforms = [
    { x: 0, y: groundY, w: width, h: 120, type: 'ground' },
    // Platformos po šypsenėle, širdim ir lankais
    { x: 250, y: groundY - 95, w: 180, h: 22, type: 'oneway', isSecret: true },
    { x: 640, y: groundY - 105, w: 200, h: 22, type: 'oneway', isSecret: true },
    { x: 1030, y: groundY - 110, w: 170, h: 22, type: 'oneway', isSecret: true },
    { x: 1290, y: groundY - 130, w: 170, h: 22, type: 'oneway', isSecret: true }
  ];

  const springs = [
    { x: 195, y: groundY - 22, w: 34, h: 22, bounceVy: -15.2 },
    { x: 585, y: groundY - 22, w: 34, h: 22, bounceVy: -15.5 },
    { x: 970, y: groundY - 22, w: 34, h: 22, bounceVy: -15.8 }
  ];

  const coins = [];
  const crystals = [];

  // 1 FIGŪRA: ŠYPSENĖLĖ (Smiley Face 😊) – 24 monetos
  const smCx = 340;
  const smCy = groundY - 210;
  // Apskritimas (14 monetų)
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    coins.push({
      x: Math.round(smCx + Math.cos(ang) * 74),
      y: Math.round(smCy + Math.sin(ang) * 74),
      r: 11,
      value: coinVal,
      collected: false
    });
  }
  // Akys (2 monetos)
  coins.push({ x: smCx - 26, y: smCy - 22, r: 12, value: coinVal + 2, collected: false });
  coins.push({ x: smCx + 26, y: smCy - 22, r: 12, value: coinVal + 2, collected: false });
  // Šypsenos lankas (8 monetos)
  for (let i = 0; i < 8; i++) {
    const ang = 0.2 + (i / 7) * (Math.PI - 0.4);
    coins.push({
      x: Math.round(smCx + Math.cos(ang) * 44),
      y: Math.round(smCy + 6 + Math.sin(ang) * 36),
      r: 11,
      value: coinVal,
      collected: false
    });
  }

  // 2 FIGŪRA: ŠIRDELĖ (Heart Shape ❤️) – 24 monetos
  const htCx = 740;
  const htCy = groundY - 220;
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    coins.push({
      x: Math.round(htCx + hx * 4.6),
      y: Math.round(htCy + hy * 4.4),
      r: 11,
      value: coinVal,
      collected: false
    });
  }

  // 3 FIGŪRA: DU DIDELI ŠUOLIŲ LANKAI (Sweeping Jump Arcs 🌈) – 28 monetos
  // Pirmas lankas (14 monetų, 2 eilės)
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 7; i++) {
      const frac = i / 6;
      const ax = 995 + frac * 240;
      const ay = (groundY - 135 - row * 32) - Math.sin(frac * Math.PI) * 115;
      coins.push({
        x: Math.round(ax),
        y: Math.round(ay),
        r: 11,
        value: coinVal,
        collected: false
      });
    }
  }
  // Antras lankas (14 monetų, 2 eilės)
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 7; i++) {
      const frac = i / 6;
      const ax = 1255 + frac * 240;
      const ay = (groundY - 150 - row * 32) - Math.sin(frac * Math.PI) * 120;
      coins.push({
        x: Math.round(ax),
        y: Math.round(ay),
        r: 11,
        value: coinVal,
        collected: false
      });
    }
  }

  // 4. DIDELĖ DEIMANTŲ IR MONETŲ KRŪVA PABAIGOJE (piramidė prieš Išėjimo Portalą!)
  const pileStartX = 1545;
  // 12 auksinių monetų piramidės papėdėje
  for (let i = 0; i < 6; i++) {
    coins.push({
      x: pileStartX + i * 26,
      y: groundY - 22,
      r: 12,
      value: coinVal + 3,
      collected: false
    });
  }
  for (let i = 0; i < 6; i++) {
    coins.push({
      x: pileStartX + 13 + i * 22,
      y: groundY - 46,
      r: 12,
      value: coinVal + 3,
      collected: false
    });
  }
  // 6 brangūs deimantai / kristalai (💎) krūvoje!
  const diamondPositions = [
    { x: pileStartX + 36, y: groundY - 76 },
    { x: pileStartX + 68, y: groundY - 76 },
    { x: pileStartX + 100, y: groundY - 76 },
    { x: pileStartX + 52, y: groundY - 106 },
    { x: pileStartX + 84, y: groundY - 106 },
    { x: pileStartX + 68, y: groundY - 136 }
  ];
  for (const dp of diamondPositions) {
    crystals.push({
      x: dp.x,
      y: dp.y,
      r: 15,
      collected: false
    });
  }

  // Švytintis Išėjimo Portalas dešinėje pusėje
  const exitPortal = {
    x: 1775,
    y: groundY - 94,
    w: 68,
    h: 94,
    label: '✨ GRĮŽTI Į LYGĮ'
  };

  return {
    theme,
    width,
    groundY,
    platforms,
    springs,
    coins,
    crystals,
    exitPortal
  };
}

export function getWorldForLevel(levelId) {
  const worldIdx = Math.min(4, Math.floor((levelId - 1) / 10));
  return WORLDS[worldIdx];
}

export function generateLevel(levelId = 1) {
  const world = getWorldForLevel(levelId);
  const levelInWorld = ((levelId - 1) % 10) + 1;
  const isBossLevel = levelInWorld === 5 || levelInWorld === 10;
  const isWorldFinalBoss = levelInWorld === 10;
  const isIntroLevel = levelId <= 2;
  const rng = createSeededRandom(levelId * 131 + world.id * 53);

  const groundY = 480;
  const platforms = [];
  const lavaPits = [];           // 4 Pasaulis: Kunkuliuojančios lavos duobės!
  const coins = [];
  const crystals = [];
  const springs = [];
  const trampolines = [];        // 1. Batutai
  const pendulums = [];          // 2. Svyruojantys kirviai / Švytuoklės
  const teleporters = [];        // 3. Teleportacijos durys
  const fakeWalls = [];          // 4. Netikros sienos
  const fallingStalactites = []; // 5. Krentantys stalaktitai
  const spikes = [];
  const enemies = [];
  const projectiles = [];
  const playerArrows = [];
  const playerBoomerangs = [];   // Naujas ginklas: Bumerangai!
  const mathEncounters = [];
  const decorations = [];

  // Pasaulio dekoracijos tipas
  const decMainType = world.id === 2 ? 'crystal_dec'
    : world.id === 3 ? 'snow_pine'
    : world.id === 4 ? 'volcano_rock'
    : world.id === 5 ? 'space_antenna'
    : 'tree';

  // Pagalbinė funkcija pasaulio priešams sukurti (kiekvienas pasaulis turi savo unikalius priešus!)
  function spawnWorldGroundEnemy(x, groundSurfaceY, minX, maxX, isStrong = false) {
    const id = `en_${enemies.length + 1}`;
    if (world.id === 2) {
      // 2 Pasaulis: Akmeniniai Golemai (3 HP)
      enemies.push({
        id,
        kind: 'rock_golem',
        x,
        y: groundSurfaceY - 46,
        w: 44,
        h: 46,
        hp: 3,
        maxHp: 3,
        hitFlashTimer: 0,
        minX,
        maxX,
        vx: 1.2,
        alive: true
      });
    } else if (world.id === 3) {
      // 3 Pasaulis: Pingvinai (čiuožia ledu) arba Sniego seniai (mėto gniūžtes)
      if (isStrong) {
        enemies.push({
          id,
          kind: 'snowman',
          x,
          y: groundSurfaceY - 46,
          w: 40,
          h: 46,
          hp: 2,
          maxHp: 2,
          hitFlashTimer: 0,
          shootTimer: 65,
          shootCooldown: 95,
          nextHighShot: false,
          alive: true
        });
      } else {
        enemies.push({
          id,
          kind: 'penguin',
          x,
          y: groundSurfaceY - 36,
          w: 38,
          h: 36,
          hp: 2,
          maxHp: 2,
          hitFlashTimer: 0,
          minX,
          maxX,
          vx: 2.3,
          alive: true
        });
      }
    } else if (world.id === 4) {
      // 4 Pasaulis: Ugnies elementaliai (3 HP, šaudo ugnies kamuolius ir juda)
      enemies.push({
        id,
        kind: 'fire_elemental',
        x,
        y: groundSurfaceY - 46,
        w: 42,
        h: 46,
        hp: 3,
        maxHp: 3,
        hitFlashTimer: 0,
        minX,
        maxX,
        vx: 1.6,
        shootTimer: 85,
        shootCooldown: 105,
        alive: true
      });
    } else if (world.id === 5) {
      // 5 Pasaulis: Ateiviai (3 HP, kosminiai šauliai)
      enemies.push({
        id,
        kind: 'alien',
        x,
        y: groundSurfaceY - 44,
        w: 40,
        h: 44,
        hp: 3,
        maxHp: 3,
        hitFlashTimer: 0,
        minX,
        maxX,
        vx: 1.7,
        shootTimer: 80,
        shootCooldown: 100,
        alive: true
      });
    } else {
      // 1 Pasaulis: Goblinai (1 HP) ir Elitiniai Riteriai (3 HP)
      enemies.push({
        id,
        kind: isStrong ? 'elite_knight' : 'goblin',
        x,
        y: groundSurfaceY - (isStrong ? 46 : 38),
        w: isStrong ? 42 : 36,
        h: isStrong ? 46 : 38,
        hp: isStrong ? 3 : 1,
        maxHp: isStrong ? 3 : 1,
        hitFlashTimer: 0,
        minX,
        maxX,
        vx: 1.6,
        alive: true
      });
    }
  }

  function spawnWorldAirEnemy(x, airY, minX, maxX) {
    const id = `en_${enemies.length + 1}`;
    if (world.id === 4) {
      // 4 Pasaulis: Skraidantys demonai (2 HP)
      enemies.push({
        id,
        kind: 'flying_demon',
        x,
        y: airY,
        baseY: airY,
        w: 42,
        h: 38,
        hp: 2,
        maxHp: 2,
        hitFlashTimer: 0,
        minX,
        maxX,
        vx: -2.1,
        phase: rng() * Math.PI,
        alive: true
      });
    } else if (world.id === 5) {
      // 5 Pasaulis: Skraidančios lėkštės (UFO – 3 HP)
      enemies.push({
        id,
        kind: 'ufo',
        x,
        y: airY,
        baseY: airY,
        w: 48,
        h: 34,
        hp: 3,
        maxHp: 3,
        hitFlashTimer: 0,
        minX,
        maxX,
        vx: -2.0,
        phase: rng() * Math.PI,
        shootTimer: 90,
        shootCooldown: 110,
        alive: true
      });
    } else {
      // 1, 2, 3 Pasauliai: Šikšnosparniai
      enemies.push({
        id,
        kind: 'bat',
        x,
        y: airY,
        baseY: airY,
        w: 38,
        h: 32,
        hp: world.id >= 2 ? 2 : 1,
        maxHp: world.id >= 2 ? 2 : 1,
        hitFlashTimer: 0,
        minX,
        maxX,
        vx: -1.9,
        phase: rng() * Math.PI,
        alive: true
      });
    }
  }

  function spawnWorldRangedEnemy(x, groundSurfaceY) {
    const id = `en_${enemies.length + 1}`;
    if (world.id === 3) {
      enemies.push({
        id,
        kind: 'snowman',
        x,
        y: groundSurfaceY - 46,
        w: 40,
        h: 46,
        hp: 2,
        maxHp: 2,
        hitFlashTimer: 0,
        shootTimer: 65,
        shootCooldown: 90,
        nextHighShot: true,
        alive: true
      });
    } else if (world.id === 4) {
      enemies.push({
        id,
        kind: 'fire_elemental',
        x,
        y: groundSurfaceY - 46,
        w: 42,
        h: 46,
        hp: 3,
        maxHp: 3,
        hitFlashTimer: 0,
        minX: x - 90,
        maxX: x + 40,
        vx: 1.2,
        shootTimer: 65,
        shootCooldown: 88,
        alive: true
      });
    } else if (world.id === 5) {
      enemies.push({
        id,
        kind: 'alien',
        x,
        y: groundSurfaceY - 44,
        w: 40,
        h: 44,
        hp: 3,
        maxHp: 3,
        hitFlashTimer: 0,
        minX: x - 90,
        maxX: x + 40,
        vx: 1.3,
        shootTimer: 60,
        shootCooldown: 85,
        alive: true
      });
    } else {
      enemies.push({
        id,
        kind: 'archer',
        x,
        y: groundSurfaceY - 46,
        w: 38,
        h: 46,
        hp: 2,
        maxHp: 2,
        hitFlashTimer: 0,
        shootTimer: 70,
        shootCooldown: Math.max(70, 115 - levelId * 2),
        nextHighShot: true,
        alive: true
      });
    }
  }

  // 2 Pasaulyje („Kristalų Urvai“) trupantys kristalai lūžta dvigubai greičiau (per ~18 kadrų)!
  const crumbleFrames = world.id === 2 ? 18 : 38;

  // 1. Pradinė saugi starto aikštelė
  const startWidth = 760;
  platforms.push({ x: 0, y: groundY, w: startWidth, h: 120, type: 'ground' });
  platforms.push({ x: 310, y: groundY - 95, w: 160, h: 22, type: 'oneway' });
  platforms.push({ x: 520, y: groundY - 155, w: 150, h: 22, type: 'oneway' });
  decorations.push({ x: 95, y: groundY, type: decMainType, scale: 1.0 });
  decorations.push({ x: 230, y: groundY, type: 'bush', scale: 0.9 });
  decorations.push({ x: 640, y: groundY, type: decMainType, scale: 1.1 });

  for (let c = 0; c < 6; c++) {
    coins.push({
      x: 170 + c * 82,
      y: c >= 2 && c <= 3 ? groundY - 135 : c >= 4 ? groundY - 195 : groundY - 40,
      r: 11,
      value: 3 + Math.floor(levelId / 2),
      collected: false
    });
  }

  let cursorX = startWidth;

  // Gryno platformerio / parkūro atkarpa su pasaulio specifine mechanika!
  function appendParkourStretch(stretchIdx) {
    cursorX += 70;
    const stretchW = 860;
    const style = (stretchIdx + levelId) % 3;

    if (world.id === 4) {
      // 4 Pasaulis (Lavos Ugnikalnis): Lavos duobės tarp uolų salelių!
      platforms.push({ x: cursorX, y: groundY, w: 230, h: 120, type: 'ground' });
      lavaPits.push({ x: cursorX + 230, y: groundY + 14, w: 170, h: 106 });
      platforms.push({ x: cursorX + 255, y: groundY - 85, w: 120, h: 22, type: 'oneway' });

      platforms.push({ x: cursorX + 400, y: groundY, w: 180, h: 120, type: 'ground' });
      lavaPits.push({ x: cursorX + 580, y: groundY + 14, w: 150, h: 106 });
      platforms.push({ x: cursorX + 600, y: groundY - 95, w: 110, h: 22, type: 'moving_h', minX: cursorX + 585, maxX: cursorX + 695, vx: 1.7 });

      platforms.push({ x: cursorX + 730, y: groundY, w: 130, h: 120, type: 'ground' });
      decorations.push({ x: cursorX + 95, y: groundY, type: decMainType, scale: 1.0 });
    } else if (world.id === 2) {
      // 2 Pasaulis (Kristalų Urvai): Greitai trupantys kristalų tiltai!
      platforms.push({ x: cursorX, y: groundY, w: stretchW, h: 120, type: 'ground' });
      decorations.push({ x: cursorX + 110, y: groundY, type: 'crystal_dec', scale: 1.1 });
      decorations.push({ x: cursorX + 730, y: groundY, type: 'crystal_dec', scale: 1.0 });

      for (let k = 0; k < 3; k++) {
        platforms.push({
          x: cursorX + 180 + k * 190,
          y: groundY - 90 - (k % 2) * 45,
          w: 125,
          h: 22,
          type: 'crumble',
          isCrystalCrumble: true,
          timer: crumbleFrames,
          maxTimer: crumbleFrames,
          shaking: false,
          broken: false,
          respawnTimer: 0
        });
      }
    } else if (style === 0) {
      platforms.push({ x: cursorX, y: groundY, w: 280, h: 120, type: 'ground' });
      decorations.push({ x: cursorX + 110, y: groundY, type: decMainType, scale: 1.0 });

      platforms.push({
        x: cursorX + 330,
        y: groundY - 70,
        w: 135,
        h: 22,
        type: 'moving_h',
        minX: cursorX + 305,
        maxX: cursorX + 510,
        vx: 1.8
      });

      platforms.push({ x: cursorX + 550, y: groundY, w: 310, h: 120, type: 'ground' });
      platforms.push({ x: cursorX + 610, y: groundY - 115, w: 160, h: 22, type: 'oneway' });
      decorations.push({ x: cursorX + 770, y: groundY, type: 'bush', scale: 1.0 });
    } else if (style === 1) {
      platforms.push({ x: cursorX, y: groundY, w: stretchW, h: 120, type: 'ground' });
      decorations.push({ x: cursorX + 90, y: groundY, type: 'bush', scale: 1.0 });
      decorations.push({ x: cursorX + 430, y: groundY, type: decMainType, scale: 1.15 });
      decorations.push({ x: cursorX + 760, y: groundY, type: decMainType, scale: 0.95 });

      springs.push({
        x: cursorX + 165,
        y: groundY - 22,
        w: 34,
        h: 22,
        bounceVy: -15.5
      });

      const highOffset = world.id === 5 ? 45 : 0;
      platforms.push({ x: cursorX + 235, y: groundY - 145 - highOffset, w: 170, h: 22, type: 'oneway' });
      platforms.push({ x: cursorX + 460, y: groundY - 185 - highOffset, w: 175, h: 22, type: 'oneway' });
    } else {
      platforms.push({ x: cursorX, y: groundY, w: stretchW, h: 120, type: 'ground' });
      decorations.push({ x: cursorX + 140, y: groundY, type: decMainType, scale: 1.0 });

      platforms.push({
        x: cursorX + 240,
        y: groundY - 95,
        w: 115,
        h: 22,
        type: 'crumble',
        isCrystalCrumble: world.id === 2,
        timer: crumbleFrames,
        maxTimer: crumbleFrames,
        shaking: false,
        broken: false,
        respawnTimer: 0
      });

      platforms.push({
        x: cursorX + 420,
        y: groundY - 135,
        w: 125,
        h: 22,
        type: 'moving_v',
        minY: groundY - 210,
        maxY: groundY - 75,
        vy: -1.5
      });

      platforms.push({ x: cursorX + 600, y: groundY - 145, w: 170, h: 22, type: 'oneway' });
    }

    for (let c = 0; c < 5; c++) {
      coins.push({
        x: cursorX + 120 + c * 145,
        y: c % 2 === 1 ? groundY - 180 : groundY - 42,
        r: 11,
        value: 4 + Math.floor(levelId / 2),
        collected: false
      });
    }

    cursorX += stretchW;
  }

  const levelLayouts = [
    ['TRAMPOLINE_SKY', 'FAKE_WALL_CHAMBER', 'STALACTITE_CAVE', 'TELEPORT_CITADEL'],
    ['PENDULUM_BRIDGE', 'TELEPORT_CITADEL', 'TRAMPOLINE_SKY', 'FAKE_WALL_CHAMBER'],
    ['FAKE_WALL_CHAMBER', 'STALACTITE_CAVE', 'PENDULUM_BRIDGE', 'TRAMPOLINE_SKY', 'TELEPORT_CITADEL'],
    ['TELEPORT_CITADEL', 'PENDULUM_BRIDGE', 'FAKE_WALL_CHAMBER', 'STALACTITE_CAVE', 'TRAMPOLINE_SKY']
  ];
  const basePattern = levelLayouts[(levelId - 1) % levelLayouts.length];
  const allChunkTypes = [
    'TRAMPOLINE_SKY',
    'PENDULUM_BRIDGE',
    'TELEPORT_CITADEL',
    'FAKE_WALL_CHAMBER',
    'STALACTITE_CAVE'
  ];

  const chunksToBuild = [...basePattern];
  if (!isIntroLevel) {
    chunksToBuild.push(allChunkTypes[Math.floor(rng() * allChunkTypes.length)]);
  }

  const brainStarChunkIdx1 = Math.floor(rng() * chunksToBuild.length);
  const brainStarChunkIdx2 = (brainStarChunkIdx1 + 2) % chunksToBuild.length;

  chunksToBuild.forEach((chunkType, idx) => {
    appendParkourStretch(idx);

    const spawnEnemyAllowed = !isIntroLevel || idx >= 1;
    const hasBrainStar = idx === brainStarChunkIdx1 || (!isIntroLevel && idx === brainStarChunkIdx2);

    // ==================== 1. BATUTŲ IR DEBESŲ SALŲ ZONA (TRAMPOLINE_SKY) ====================
    if (chunkType === 'TRAMPOLINE_SKY') {
      cursorX += 65;
      const valleyW = 920;
      platforms.push({ x: cursorX, y: groundY + 10, w: valleyW, h: 120, type: 'ground' });
      decorations.push({ x: cursorX + 70, y: groundY + 10, type: decMainType, scale: 1.0 });
      decorations.push({ x: cursorX + 820, y: groundY + 10, type: 'bush', scale: 1.0 });

      platforms.push({
        x: cursorX + 90,
        y: groundY - 85,
        w: 130,
        h: 22,
        type: world.id === 2 ? 'crumble' : 'oneway',
        isCrystalCrumble: world.id === 2,
        timer: crumbleFrames,
        maxTimer: crumbleFrames,
        shaking: false,
        broken: false,
        respawnTimer: 0
      });

      const trampX = cursorX + 255;
      trampolines.push({
        x: trampX,
        y: groundY + 10 - 26,
        w: 56,
        h: 26,
        bounceVy: -20.2,
        compressTimer: 0
      });

      const skyIslandX = cursorX + 330;
      const skyIslandY = groundY - 255;
      platforms.push({ x: skyIslandX, y: skyIslandY, w: 250, h: 24, type: 'oneway', isSecret: true });

      platforms.push({ x: cursorX + 610, y: groundY - 140, w: 140, h: 22, type: 'oneway' });
      platforms.push({ x: cursorX + 770, y: groundY - 80, w: 120, h: 22, type: 'oneway' });

      for (let c = 0; c < 4; c++) {
        coins.push({
          x: skyIslandX + 35 + c * 50,
          y: skyIslandY - 30,
          r: 11,
          value: 5 + levelId,
          collected: false
        });
      }

      if (hasBrainStar) {
        mathEncounters.push({
          id: `brain_star_sky_${idx}`,
          type: 'brain_star',
          name: 'Proto Žvaigždė',
          icon: '🌟',
          x: skyIslandX + 100,
          y: skyIslandY - 56,
          w: 48,
          h: 48,
          hp: 1,
          maxHp: 1,
          rewardCoins: 50 + levelId * 8,
          rewardCrystals: 2,
          resolved: false,
          failed: false
        });
      } else {
        crystals.push({ x: skyIslandX + 125, y: skyIslandY - 34, r: 14, collected: false });
      }

      mathEncounters.push({
        id: `chest_tramp_${idx}`,
        type: 'chest',
        name: 'Slėnio Skrynia',
        icon: '🧰',
        x: cursorX + 440,
        y: groundY + 10 - 46,
        w: 44,
        h: 46,
        hp: 1,
        maxHp: 1,
        rewardCoins: 22 + levelId * 4,
        rewardCrystals: 0,
        resolved: false,
        failed: false
      });

      if (spawnEnemyAllowed) {
        const isElite = idx >= 2 || levelId >= 2;
        spawnWorldGroundEnemy(cursorX + 680, groundY + 10, cursorX + 540, cursorX + valleyW - 55, isElite);
      }

      cursorX += valleyW;
    }

    // ==================== 2. SVYRUOJANČIŲ KIRVIŲ / ŠVYTUOKLIŲ TILTAS (PENDULUM_BRIDGE) ====================
    else if (chunkType === 'PENDULUM_BRIDGE') {
      cursorX += 65;
      const bridgeW = 920;
      platforms.push({ x: cursorX, y: groundY, w: bridgeW, h: 120, type: 'ground' });
      platforms.push({ x: cursorX + 70, y: groundY - 95, w: 130, h: 22, type: 'oneway' });
      platforms.push({ x: cursorX + 720, y: groundY - 95, w: 130, h: 22, type: 'oneway' });

      pendulums.push({
        pivotX: cursorX + 310,
        pivotY: groundY - 195,
        length: 138,
        maxAngle: 0.92,
        speed: 0.036,
        phase: 0,
        angle: 0,
        bladeRadius: 22
      });

      pendulums.push({
        pivotX: cursorX + 590,
        pivotY: groundY - 195,
        length: 138,
        maxAngle: 0.92,
        speed: 0.038,
        phase: Math.PI,
        angle: 0,
        bladeRadius: 22
      });

      for (let c = 0; c < 6; c++) {
        coins.push({
          x: cursorX + 210 + c * 95,
          y: groundY - 32,
          r: 11,
          value: 4 + levelId,
          collected: false
        });
      }

      if (hasBrainStar) {
        platforms.push({ x: cursorX + 390, y: groundY - 135, w: 120, h: 20, type: 'oneway', isSecret: true });
        mathEncounters.push({
          id: `brain_star_pend_${idx}`,
          type: 'brain_star',
          name: 'Proto Žvaigždė',
          icon: '🌟',
          x: cursorX + 426,
          y: groundY - 188,
          w: 48,
          h: 48,
          hp: 1,
          maxHp: 1,
          rewardCoins: 50 + levelId * 8,
          rewardCrystals: 2,
          resolved: false,
          failed: false
        });
      }

      if (spawnEnemyAllowed && !isIntroLevel) {
        spawnWorldAirEnemy(cursorX + 460, groundY - 130, cursorX + 140, cursorX + bridgeW - 140);
      }

      cursorX += bridgeW;
    }

    // ==================== 3. TELEPORTACIJOS DURYS IR SLAPTA TERASA (TELEPORT_CITADEL) ====================
    else if (chunkType === 'TELEPORT_CITADEL') {
      cursorX += 65;
      const citW = 900;
      platforms.push({ x: cursorX, y: groundY, w: citW, h: 120, type: 'ground' });
      platforms.push({ x: cursorX + 640, y: groundY - 105, w: 170, h: 22, type: 'oneway' });
      decorations.push({ x: cursorX + 790, y: groundY, type: decMainType, scale: 1.1 });

      const secretVaultX = cursorX + 200;
      const secretVaultY = groundY - 245;
      platforms.push({ x: secretVaultX, y: secretVaultY, w: 340, h: 24, type: 'oneway', isSecret: true });

      const doorInX = cursorX + 115;
      const doorInY = groundY - 68;
      const doorOutX = secretVaultX + 25;
      const doorOutY = secretVaultY - 68;

      teleporters.push({
        id: `tp_in_${idx}`,
        x: doorInX,
        y: doorInY,
        w: 46,
        h: 68,
        targetX: doorOutX + 55,
        targetY: secretVaultY - 58,
        color: '#a855f7',
        label: '🌀 Į SLAPTĄ ZONĄ'
      });

      teleporters.push({
        id: `tp_out_${idx}`,
        x: secretVaultX + 265,
        y: doorOutY,
        w: 46,
        h: 68,
        targetX: cursorX + 560,
        targetY: groundY - 58,
        color: '#38bdf8',
        label: '🌀 GRĮŽTI'
      });

      for (let c = 0; c < 4; c++) {
        coins.push({
          x: secretVaultX + 95 + c * 38,
          y: secretVaultY - 30,
          r: 11,
          value: 6 + levelId,
          collected: false
        });
      }
      crystals.push({ x: secretVaultX + 150, y: secretVaultY - 66, r: 14, collected: false });

      if (hasBrainStar) {
        mathEncounters.push({
          id: `brain_star_tp_${idx}`,
          type: 'brain_star',
          name: 'Proto Žvaigždė',
          icon: '🌟',
          x: secretVaultX + 195,
          y: secretVaultY - 52,
          w: 48,
          h: 48,
          hp: 1,
          maxHp: 1,
          rewardCoins: 55 + levelId * 8,
          rewardCrystals: 2,
          resolved: false,
          failed: false
        });
      }

      if (spawnEnemyAllowed) {
        if (world.id === 1) {
          enemies.push({
            id: `en_${enemies.length + 1}`,
            kind: 'slime',
            x: cursorX + 360,
            y: groundY - 36,
            groundY: groundY - 36,
            w: 40,
            h: 36,
            hp: 1,
            maxHp: 1,
            hitFlashTimer: 0,
            minX: cursorX + 220,
            maxX: cursorX + 520,
            vx: 1.4,
            vy: 0,
            jumpTimer: 60,
            alive: true
          });
        } else {
          spawnWorldGroundEnemy(cursorX + 360, groundY, cursorX + 220, cursorX + 520, false);
        }
      }

      cursorX += citW;
    }

    // ==================== 4. NETIKRA SIENA SU PASLĖPTU LOBIŲ KAMBARIU (FAKE_WALL_CHAMBER) ====================
    else if (chunkType === 'FAKE_WALL_CHAMBER') {
      cursorX += 65;
      const totalW = 920;
      platforms.push({ x: cursorX, y: groundY, w: totalW, h: 120, type: 'ground' });
      platforms.push({ x: cursorX + 640, y: groundY - 95, w: 160, h: 22, type: 'oneway' });

      const chamberX = cursorX + 250;
      const chamberW = 240;
      const roofY = groundY - 115;

      platforms.push({ x: chamberX, y: roofY, w: chamberW, h: 24, type: 'oneway' });

      springs.push({
        x: cursorX + 165,
        y: groundY - 22,
        w: 34,
        h: 22,
        bounceVy: -15.5
      });

      fakeWalls.push({
        x: chamberX,
        y: roofY + 24,
        w: chamberW,
        h: groundY - (roofY + 24),
        discovered: false,
        label: '🧱 Paslaptinga Siena...'
      });

      for (let c = 0; c < 4; c++) {
        coins.push({
          x: chamberX + 35 + c * 42,
          y: groundY - 28,
          r: 11,
          value: 6 + levelId,
          collected: false
        });
      }
      crystals.push({ x: chamberX + chamberW - 40, y: groundY - 32, r: 14, collected: false });

      mathEncounters.push({
        id: `fakewall_top_${idx}`,
        type: hasBrainStar ? 'brain_star' : 'chest',
        name: hasBrainStar ? 'Proto Žvaigždė' : 'Stogo Skrynia',
        icon: hasBrainStar ? '🌟' : '🎁',
        x: chamberX + 95,
        y: roofY - 48,
        w: 48,
        h: 48,
        hp: 1,
        maxHp: 1,
        rewardCoins: 42 + levelId * 6,
        rewardCrystals: 1,
        resolved: false,
        failed: false
      });

      if (spawnEnemyAllowed) {
        spawnWorldGroundEnemy(cursorX + 610, groundY, cursorX + 520, cursorX + totalW - 50, false);
      }

      cursorX += totalW;
    }

    // ==================== 5. KRENTANČIŲ STALAKTITŲ IR TUNELIŲ URVAS (STALACTITE_CAVE) ====================
    else {
      cursorX += 65;
      const caveW = 940;
      platforms.push({ x: cursorX, y: groundY, w: caveW, h: 120, type: 'ground' });
      platforms.push({ x: cursorX + 650, y: groundY - 105, w: 150, h: 22, type: 'oneway' });

      const low1X = cursorX + 90;
      platforms.push({
        x: low1X,
        y: groundY - 130,
        w: 150,
        h: 94,
        type: 'low_tunnel',
        label: '⬇️ PASILENK (S)'
      });

      const ceilingX = cursorX + 300;
      const ceilingY = groundY - 220;
      platforms.push({ x: ceilingX, y: ceilingY, w: 300, h: 24, type: 'oneway' });

      for (let s = 0; s < 3; s++) {
        const stX = ceilingX + 35 + s * 100;
        fallingStalactites.push({
          x: stX,
          y: ceilingY + 24,
          startY: ceilingY + 24,
          w: 24,
          h: 42,
          vy: 0,
          state: 'idle',
          shakeTimer: 16,
          respawnTimer: 0
        });
        coins.push({
          x: stX + 12,
          y: groundY - 26,
          r: 11,
          value: 5 + levelId,
          collected: false
        });
      }

      if (hasBrainStar) {
        mathEncounters.push({
          id: `brain_star_cave_${idx}`,
          type: 'brain_star',
          name: 'Proto Žvaigždė',
          icon: '🌟',
          x: ceilingX + 125,
          y: ceilingY - 52,
          w: 48,
          h: 48,
          hp: 1,
          maxHp: 1,
          rewardCoins: 50 + levelId * 8,
          rewardCrystals: 2,
          resolved: false,
          failed: false
        });
      }

      if (spawnEnemyAllowed) {
        spawnWorldRangedEnemy(cursorX + caveW - 85, groundY);
      }

      cursorX += caveW;
    }
  });

  // Dar viena trumpa platformerio atkarpa prieš pat Boso/Vartų areną!
  appendParkourStretch(99);

  // ==================== SLAPTO KAMBARIO ĮĖJIMAS (18% ŠANSAS KIEKVIENAME LYGYJE!) ====================
  let secretBonusEntrance = null;
  let secretBonusRoom = null;

  if (Math.random() < 0.18) {
    secretBonusRoom = generateSecretBonusRoom(levelId);
    const styles = ['high_arch', 'hidden_wall_door', 'ancient_pipe'];
    const entranceStyle = styles[Math.floor(Math.random() * styles.length)];

    // Įėjimą įterpiame prieš pat paskutinę areną specialioje tyrinėjimo aikštelėje
    cursorX += 55;
    const bonusZoneW = 420;
    platforms.push({ x: cursorX, y: groundY, w: bonusZoneW, h: 120, type: 'ground' });

    if (entranceStyle === 'high_arch') {
      // 1 TIPAS: Sunkiai pasiekiama durų arka labai aukštai (reikia dvigubo / patobulinto šuolio!)
      platforms.push({ x: cursorX + 55, y: groundY - 125, w: 120, h: 22, type: 'oneway' });
      const highPlatX = cursorX + 190;
      const highPlatY = groundY - 255;
      platforms.push({ x: highPlatX, y: highPlatY, w: 165, h: 24, type: 'oneway', isSecret: true });

      secretBonusEntrance = {
        style: 'high_arch',
        x: highPlatX + 52,
        y: highPlatY - 74,
        w: 58,
        h: 74,
        returnX: cursorX + bonusZoneW - 75,
        returnY: groundY - 64,
        requiresDown: false,
        used: false,
        label: '🚪 SLAPTA ARKA'
      };
    } else if (entranceStyle === 'hidden_wall_door') {
      // 2 TIPAS: Nematoma / netikra siena, per kurią galima kiaurai praeiti, o už jos – slaptas įėjimas!
      const wallX = cursorX + 110;
      const wallW = 210;
      const roofY = groundY - 115;
      platforms.push({ x: wallX, y: roofY, w: wallW, h: 24, type: 'oneway' });
      fakeWalls.push({
        x: wallX,
        y: roofY + 24,
        w: wallW,
        h: groundY - (roofY + 24),
        discovered: false,
        label: '🧱 Įtartina Siena...'
      });

      secretBonusEntrance = {
        style: 'hidden_wall_door',
        x: wallX + 76,
        y: groundY - 72,
        w: 56,
        h: 72,
        returnX: wallX + wallW + 46,
        returnY: groundY - 64,
        requiresDown: false,
        used: false,
        label: '✨ SLAPTOS DURYS'
      };
    } else {
      // 3 TIPAS: Senovinis šulinys / vamzdis, ant kurio užlipus ir paspaudus ŽEMYN (⬇️ / S) herojus įlenda į vidų!
      const pipeX = cursorX + 165;
      const pipeW = 74;
      const pipeH = 68;
      const pipeTopY = groundY - pipeH;

      // Tvirta šulinio / vamzdžio viršūnė, kad herojus galėtų ant jos užlipti
      platforms.push({
        x: pipeX,
        y: pipeTopY,
        w: pipeW,
        h: pipeH,
        type: 'oneway',
        isPipeTop: true
      });

      secretBonusEntrance = {
        style: 'ancient_pipe',
        x: pipeX + 6,
        y: pipeTopY - 26,
        pipeDrawX: pipeX,
        pipeDrawY: pipeTopY,
        pipeDrawW: pipeW,
        pipeDrawH: pipeH,
        w: pipeW - 12,
        h: 36,
        returnX: pipeX + pipeW + 52,
        returnY: groundY - 64,
        requiresDown: true,
        used: false,
        label: '⬇️ SPAUSK ŽEMYN (S)'
      };
    }

    cursorX += bonusZoneW;
  }

  // Paskutinė Boso arba Vartų arena
  cursorX += 75;
  const endArenaWidth = isBossLevel ? 640 : 440;
  platforms.push({
    x: cursorX,
    y: groundY,
    w: endArenaWidth,
    h: 130,
    type: 'ground'
  });

  if (isBossLevel) {
    const bossHp = isWorldFinalBoss ? (world.bossHp || 20) : Math.max(15, (world.bossHp || 20) - 5);
    mathEncounters.push({
      id: 'level_boss',
      type: 'boss',
      name: isWorldFinalBoss ? world.bossName : `${world.name} Sargybinis`,
      icon: world.bossIcon,
      worldId: world.id,
      x: cursorX + 260,
      y: groundY - 92,
      baseY: groundY - 92,
      minX: cursorX + 80,
      maxX: cursorX + endArenaWidth - 190,
      w: 92,
      h: 92,
      vx: -1.5,
      vy: 0,
      hp: bossHp,
      maxHp: bossHp,
      hitFlashTimer: 0,
      shootTimer: 95,
      jumpTimer: 160,
      attackPhase: 'shoot',
      projectileColor: world.bossProjectileColor || '#f97316',
      rewardCoins: 140 + levelId * 22,
      rewardCrystals: isWorldFinalBoss ? 5 : 3,
      resolved: false,
      failed: false
    });
  } else {
    mathEncounters.push({
      id: 'level_gate',
      type: 'gate',
      name: 'Išminties Vartai',
      icon: '⛩️',
      x: cursorX + 150,
      y: groundY - 78,
      w: 58,
      h: 78,
      hp: 1,
      maxHp: 1,
      rewardCoins: 35 + levelId * 6,
      rewardCrystals: 0,
      resolved: false,
      failed: false
    });
  }

  const finishPortal = {
    x: cursorX + endArenaWidth - 110,
    y: groundY - 88,
    w: 64,
    h: 88
  };

  return {
    levelId,
    levelInWorld,
    world,
    isBossLevel,
    isWorldFinalBoss,
    groundY,
    width: cursorX + endArenaWidth + 100,
    platforms,
    lavaPits,
    coins,
    crystals,
    springs,
    trampolines,
    pendulums,
    teleporters,
    fakeWalls,
    fallingStalactites,
    spikes,
    enemies,
    projectiles,
    playerArrows,
    playerBoomerangs,
    mathEncounters,
    decorations,
    finishPortal,
    secretBonusEntrance,
    secretBonusRoom
  };
}
