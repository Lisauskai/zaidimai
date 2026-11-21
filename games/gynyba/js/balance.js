// ==================== BUBIŲ TVIRTOVĖ: EKONOMIKOS, BALANSO IR ŽEMĖLAPIŲ MATEMATIKA ====================
// Parengta pagal Kingdom Rush ir Bloons TD 6 strateginius standartus.

export {
  TOWER_CATALOG,
  TOWER_LIST,
  getTowerStats,
  getUpgradeCost,
  getTowerEvolutions,
  findNearestPathPoint
} from './towers.js?v=20261121c';

export const STARTING_HEARTS = 20;
export const SELL_REFUND_RATE = 0.75; // 75% investuotų monetų grąžinimas
export const INTER_WAVE_COOLDOWN_SECONDS = 14;
export const MAX_WAVES_PER_MAP = 10;

export const PROFILE_MODIFIERS = {
  linas: {
    id: 'linas',
    label: 'Linas (1 klasė)',
    startingCoinsMultiplier: 1.2, // +20% pradinių monetų
    enemyHpMultiplier: 0.8, // -20% priešų HP
    badgeText: '1 kl. balansas: +20% pradinių monetų • -20% priešų HP'
  },
  lukas: {
    id: 'lukas',
    label: 'Lukas (3 klasė)',
    startingCoinsMultiplier: 1.0,
    enemyHpMultiplier: 1.0,
    badgeText: '3 kl. balansas: standartinis stratego režimas (100%)'
  }
};

export function getProfileModifier(profileId) {
  return profileId === 'linas' ? PROFILE_MODIFIERS.linas : PROFILE_MODIFIERS.lukas;
}

export function getStartingCoins(baseCoins, profileId) {
  const mod = getProfileModifier(profileId);
  return Math.round((Number(baseCoins) || 200) * mod.startingCoinsMultiplier);
}

export function getScaledEnemyHp(baseHp, waveNumber, profileId) {
  const mod = getProfileModifier(profileId);
  const w = Math.max(1, Number(waveNumber) || 1);
  // Progresyvi Kingdom Rush / BTD6 HP kreivė pagal bangos numerį
  const waveScale = 1 + (w - 1) * 0.28 + Math.pow(Math.max(0, w - 3), 1.35) * 0.08;
  return Math.max(10, Math.round(baseHp * waveScale * mod.enemyHpMultiplier));
}

export function computeSellRefund(totalInvestedCoins) {
  return Math.round((Number(totalInvestedCoins) || 0) * SELL_REFUND_RATE);
}

export function computeEarlyWaveBonus(remainingCooldownSeconds, nextWaveNumber) {
  const rem = Math.max(0, Number(remainingCooldownSeconds) || 0);
  if (rem <= 0.25) return 0;
  const w = Math.max(1, Number(nextWaveNumber) || 1);
  return Math.max(0, Math.round(rem * (2.5 + w * 0.5)));
}

export function calculateStarsForHearts(remainingHearts) {
  const h = Math.max(0, Number(remainingHearts) || 0);
  if (h >= 18) return 3; // 18–20 širdelių = 3 žvaigždutės
  if (h >= 10) return 2; // 10–17 širdelių = 2 žvaigždutės
  if (h >= 1) return 1;  // 1–9 širdelės = 1 žvaigždutė
  return 0;
}

// ==================== TAIKYMO PRIORITETAI (BLOONS TD 6 STANDARTAS) ====================
export const TARGETING_PRIORITIES = [
  {
    id: 'first',
    label: 'Pirmas',
    shortLabel: 'Pirmas',
    icon: '🥇',
    desc: 'Arčiausiai finišo'
  },
  {
    id: 'strong',
    label: 'Stipriausias',
    shortLabel: 'Stipriausias',
    icon: '💪',
    desc: 'Daugiausiai HP / bosas'
  },
  {
    id: 'last',
    label: 'Paskutinis',
    shortLabel: 'Paskutinis',
    icon: '🐢',
    desc: 'Toliausiai nuo finišo'
  },
  {
    id: 'close',
    label: 'Arčiausias',
    shortLabel: 'Arčiausias',
    icon: '🎯',
    desc: 'Arčiausiai bokštelio'
  }
];

export function getTargetingPriorityMeta(priorityId) {
  return TARGETING_PRIORITIES.find((p) => p.id === priorityId) || TARGETING_PRIORITIES[0];
}

export function selectTargetByPriority(enemiesInRange, tower, priorityId = 'first') {
  if (!Array.isArray(enemiesInRange) || enemiesInRange.length === 0) return null;

  let best = enemiesInRange[0];

  if (priorityId === 'strong') {
    for (let i = 1; i < enemiesInRange.length; i++) {
      const e = enemiesInRange[i];
      if (e.hp > best.hp) {
        best = e;
      } else if (e.hp === best.hp) {
        if (Boolean(e.isBoss) !== Boolean(best.isBoss)) {
          if (e.isBoss) best = e;
        } else if (e.remainingDistance < best.remainingDistance) {
          best = e;
        }
      }
    }
    return best;
  }

  if (priorityId === 'last') {
    for (let i = 1; i < enemiesInRange.length; i++) {
      const e = enemiesInRange[i];
      if (e.remainingDistance > best.remainingDistance) {
        best = e;
      }
    }
    return best;
  }

  if (priorityId === 'close') {
    let bestDistSq =
      (best.x - tower.x) * (best.x - tower.x) + (best.y - tower.y) * (best.y - tower.y);
    for (let i = 1; i < enemiesInRange.length; i++) {
      const e = enemiesInRange[i];
      const dSq = (e.x - tower.x) * (e.x - tower.x) + (e.y - tower.y) * (e.y - tower.y);
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        best = e;
      }
    }
    return best;
  }

  // Numatytasis prioritetas: 'first' (arčiausiai finišo = mažiausias remainingDistance)
  for (let i = 1; i < enemiesInRange.length; i++) {
    const e = enemiesInRange[i];
    if (e.remainingDistance < best.remainingDistance) {
      best = e;
    }
  }
  return best;
}

// ==================== PRIEŠŲ ARCHETIPAI IR BANGŲ GENERATORIUS ====================
export const ENEMY_ARCHETYPES = {
  scout: {
    id: 'scout',
    name: 'Šešėlių žvalgas',
    baseHp: 46,
    speed: 86,
    reward: 11,
    heartCost: 1,
    armor: 0,
    radius: 12,
    color: '#f43f5e',
    borderColor: '#fecdd3',
    isBoss: false,
    isCamo: false,
    isFlying: false
  },
  swarm: {
    id: 'swarm',
    name: 'Vikrusis spiečius',
    baseHp: 30,
    speed: 112,
    reward: 8,
    heartCost: 1,
    armor: 0,
    radius: 10,
    color: '#fb923c',
    borderColor: '#fed7aa',
    isBoss: false,
    isCamo: false,
    isFlying: false
  },
  camo_scout: {
    id: 'camo_scout',
    name: 'Nematomas šmėkla (Camo)',
    baseHp: 58,
    speed: 96,
    reward: 15,
    heartCost: 1,
    armor: 0,
    radius: 12,
    color: '#94a3b8',
    borderColor: '#2dd4bf',
    isBoss: false,
    isCamo: true,
    isFlying: false
  },
  sky_drone: {
    id: 'sky_drone',
    name: 'Skraidantis dronas',
    baseHp: 64,
    speed: 92,
    reward: 16,
    heartCost: 1,
    armor: 0.1,
    radius: 12,
    color: '#38bdf8',
    borderColor: '#fef08a',
    isBoss: false,
    isCamo: false,
    isFlying: true
  },
  raider: {
    id: 'raider',
    name: 'Šarvuotas puolėjas',
    baseHp: 112,
    speed: 64,
    reward: 17,
    heartCost: 1,
    armor: 0.30,
    radius: 14,
    color: '#e11d48',
    borderColor: '#fda4af',
    isBoss: false,
    isCamo: false,
    isFlying: false
  },
  golem: {
    id: 'golem',
    name: 'Akmeninis golemas',
    baseHp: 245,
    speed: 48,
    reward: 28,
    heartCost: 2,
    armor: 0.45,
    radius: 17,
    color: '#8b5cf6',
    borderColor: '#ddd6fe',
    isBoss: false,
    isCamo: false,
    isFlying: false
  },
  boss: {
    id: 'boss',
    name: 'Bubių Kėdžių Valdovas',
    baseHp: 780,
    speed: 40,
    reward: 95,
    heartCost: 5,
    armor: 0.25,
    radius: 22,
    color: '#be123c',
    borderColor: '#fde047',
    isBoss: true,
    isCamo: false,
    isFlying: false
  }
};

export function generateWaveSpawns(waveNumber, pathCount = 1, profileId = 'lukas') {
  const w = Math.max(1, Number(waveNumber) || 1);
  const paths = Math.max(1, Number(pathCount) || 1);
  const spawns = [];

  const totalUnits = 7 + w * 3;
  const intervalBase = Math.max(0.36, 0.92 - w * 0.045);

  for (let i = 0; i < totalUnits; i++) {
    let type = 'scout';
    if (w >= 2 && i % 4 === 3) type = 'raider';
    if (w >= 3 && i % 5 === 2) type = 'camo_scout';
    else if (w >= 3 && i % 3 === 1) type = 'swarm';
    if (w >= 4 && i % 6 === 4) type = 'sky_drone';
    if (w >= 5 && i % 6 === 5) type = 'golem';
    if (w >= 8 && i % 4 === 1) type = 'raider';

    const arch = ENEMY_ARCHETYPES[type];
    spawns.push({
      type,
      pathIndex: i % paths,
      delay: i === 0 ? 0.15 : intervalBase,
      hp: getScaledEnemyHp(arch.baseHp, w, profileId),
      speed: arch.speed + Math.min(18, w * 1.6),
      reward: arch.reward,
      heartCost: arch.heartCost,
      armor: arch.armor || 0,
      radius: arch.radius,
      color: arch.color,
      borderColor: arch.borderColor,
      isBoss: arch.isBoss,
      isCamo: Boolean(arch.isCamo),
      isFlying: Boolean(arch.isFlying),
      name: arch.name
    });
  }

  // Bosai 5-oje ir paskutinėje 10-oje bangoje
  if (w === 5 || w === MAX_WAVES_PER_MAP) {
    const bossCount = w === MAX_WAVES_PER_MAP ? Math.min(2, paths) : 1;
    const bossArch = ENEMY_ARCHETYPES.boss;
    for (let b = 0; b < bossCount; b++) {
      spawns.push({
        type: 'boss',
        pathIndex: b % paths,
        delay: 1.5,
        hp: getScaledEnemyHp(bossArch.baseHp * (w === MAX_WAVES_PER_MAP ? 1.35 : 1), w, profileId),
        speed: bossArch.speed,
        reward: bossArch.reward,
        heartCost: bossArch.heartCost,
        armor: bossArch.armor || 0,
        radius: bossArch.radius,
        color: bossArch.color,
        borderColor: bossArch.borderColor,
        isBoss: true,
        isCamo: false,
        isFlying: false,
        name: bossArch.name
      });
    }
  }

  return spawns;
}

// ==================== ŽEMĖLAPIŲ APRAŠAI SU SKLANDŽIOMIS KREIVĖMIS IR AIKŠTELĖMIS ====================
export const MAP_DEFINITIONS = {
  bubiai: {
    id: 'bubiai',
    title: '🏡 Bubių kiemas',
    badge: '1 kelias • Pradedančiųjų arena',
    subtitle: 'Paspausk ant pažymėtos statybos aikštelės (+), pastatyk bokštelį ir gink kiemą!',
    baseCoins: 200,
    maxWaves: MAX_WAVES_PER_MAP,
    bgTop: '#0d291f',
    bgBottom: '#071412',
    pathColor: '#a18055',
    pathBorder: '#574226',
    accentColor: '#34d399',
    fortress: { x: 848, y: 235 },
    paths: [
      [
        { x: 24, y: 255 },
        { x: 165, y: 255 },
        { x: 205, y: 120 },
        { x: 420, y: 120 },
        { x: 455, y: 375 },
        { x: 675, y: 375 },
        { x: 705, y: 235 },
        { x: 848, y: 235 }
      ]
    ],
    pads: [
      { id: 'b1', x: 105, y: 175 },
      { id: 'b2', x: 105, y: 340 },
      { id: 'b3', x: 285, y: 205 },
      { id: 'b4', x: 355, y: 300 },
      { id: 'b5', x: 545, y: 185 },
      { id: 'b6', x: 565, y: 295 },
      { id: 'b7', x: 615, y: 440 },
      { id: 'b8', x: 775, y: 150 }
    ]
  },
  kurtuvenai: {
    id: 'kurtuvenai',
    title: '🌲 Kurtuvėnai',
    badge: '2 išsišakojantys keliai • Pušynas',
    subtitle: 'Priešai puola dviem miško takais vienu metu – saugok abi atšakas ir centrinę sankirtą!',
    baseCoins: 220,
    maxWaves: MAX_WAVES_PER_MAP,
    bgTop: '#0b242c',
    bgBottom: '#061218',
    pathColor: '#7a664f',
    pathBorder: '#403428',
    accentColor: '#38bdf8',
    fortress: { x: 848, y: 245 },
    paths: [
      [
        { x: 24, y: 120 },
        { x: 215, y: 110 },
        { x: 365, y: 185 },
        { x: 565, y: 115 },
        { x: 715, y: 180 },
        { x: 848, y: 245 }
      ],
      [
        { x: 24, y: 380 },
        { x: 225, y: 390 },
        { x: 385, y: 315 },
        { x: 575, y: 390 },
        { x: 720, y: 310 },
        { x: 848, y: 245 }
      ]
    ],
    pads: [
      { id: 'k1', x: 125, y: 250 },
      { id: 'k2', x: 295, y: 90 },
      { id: 'k3', x: 295, y: 410 },
      { id: 'k4', x: 375, y: 250 },
      { id: 'k5', x: 485, y: 190 },
      { id: 'k6', x: 490, y: 315 },
      { id: 'k7', x: 645, y: 245 },
      { id: 'k8', x: 775, y: 125 }
    ]
  },
  dagilelis: {
    id: 'dagilelis',
    title: '🏛️ Dagilėlio aikštė',
    badge: '2 keliai • Iššūkis meistrams',
    subtitle: 'Dvi plačios alėjos susilieja prie aikštės tvirtovės – derink lazerius, rezonatorius ir patrankas!',
    baseCoins: 240,
    maxWaves: MAX_WAVES_PER_MAP,
    bgTop: '#191c3d',
    bgBottom: '#080c1f',
    pathColor: '#64748b',
    pathBorder: '#334155',
    accentColor: '#fb7185',
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 135 },
        { x: 185, y: 135 },
        { x: 240, y: 75 },
        { x: 470, y: 75 },
        { x: 530, y: 175 },
        { x: 705, y: 175 },
        { x: 765, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 365 },
        { x: 185, y: 365 },
        { x: 245, y: 425 },
        { x: 470, y: 425 },
        { x: 530, y: 325 },
        { x: 705, y: 325 },
        { x: 765, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'd1', x: 115, y: 250 },
      { id: 'd2', x: 280, y: 180 },
      { id: 'd3', x: 280, y: 320 },
      { id: 'd4', x: 360, y: 145 },
      { id: 'd5', x: 360, y: 355 },
      { id: 'd6', x: 440, y: 250 },
      { id: 'd7', x: 615, y: 105 },
      { id: 'd8', x: 615, y: 395 },
      { id: 'd9', x: 645, y: 250 }
    ]
  }
};
