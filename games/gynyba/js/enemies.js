// ==================== BUBIŲ TVIRTOVĖ: 10 PRIEŠŲ TIPŲ, 5 ZONŲ BOSAI IR BANGŲ PERŽIŪRA ====================

export const MAX_WAVES_DEFAULT = 10;

export function scaleEnemyHp(baseHp, waveNumber = 1, profileId = 'lukas') {
  const w = Math.max(1, Number(waveNumber) || 1);
  // 3 kl. (Lukas): +35% stipresni; 1 kl. (Linas): ~25% mažiau HP nei 3 kl. (1.0125 / 1.35 = 0.75)
  const profileMult = profileId === 'linas' ? 1.0125 : 1.35;
  const waveScale = 1 + (w - 1) * 0.32 + Math.pow(Math.max(0, w - 3), 1.42) * 0.095;
  return Math.max(10, Math.round(baseHp * waveScale * profileMult));
}

// ==================== 12 ĮPRASTŲ PRIEŠŲ TIPŲ ====================
export const ENEMY_ARCHETYPES = {
  garden_slug: {
    id: 'garden_slug',
    name: 'Sodo Šliužas',
    icon: '🐌',
    baseHp: 94,
    speed: 52,
    reward: 9,
    heartCost: 1,
    armor: 0,
    energyResist: 0,
    soundResist: 0,
    slowResistance: 0.85,
    radius: 13,
    color: '#84cc16',
    borderColor: '#ecfccb',
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🐌 Atsparus sulėtinimui – naudok Saulės Lazerį arba Barakus!'
  },
  rushing_hedgehog: {
    id: 'rushing_hedgehog',
    name: 'Skubantis Ežys',
    icon: '🦔',
    baseHp: 38,
    speed: 132,
    reward: 8,
    heartCost: 1,
    armor: 0,
    energyResist: 0,
    soundResist: 0,
    radius: 11,
    color: '#fb923c',
    borderColor: '#fed7aa',
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🦔 Labai greitas – sustabdyk Vejapjovių Barakais arba Katapulta!'
  },
  armored_beetle: {
    id: 'armored_beetle',
    name: 'Šarvuotas Vabalas',
    icon: '🪲',
    baseHp: 124,
    speed: 62,
    reward: 13,
    heartCost: 1,
    armor: 0.70, // Blokuoja 70% fizinės žalos
    energyResist: 0,
    soundResist: 0,
    radius: 14,
    color: '#6366f1',
    borderColor: '#c7d2fe',
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🛡️ Blokuoja 70% fizinės žalos – būtinas Saulės Lazeris arba Garso Bokštas!'
  },
  mirror_beetle: {
    id: 'mirror_beetle',
    name: 'Veidrodinis Kristalas',
    icon: '🪞',
    baseHp: 145,
    speed: 66,
    reward: 15,
    heartCost: 1,
    armor: 0.05,
    energyResist: 0.80, // Blokuoja 80% energijos/lazerio žalos
    soundResist: 0,
    radius: 14,
    color: '#e0f2fe',
    borderColor: '#38bdf8',
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🪞 Veidrodinis šarvas blokuoja 80% lazerio! Traiškink Katapulta, Barakais arba Dronais!'
  },
  forest_healer: {
    id: 'forest_healer',
    name: 'Gamtos Gydytojas',
    icon: '💚',
    baseHp: 138,
    speed: 62,
    reward: 18,
    heartCost: 1,
    armor: 0.15,
    energyResist: 0,
    soundResist: 0,
    healInterval: 3.5,
    healRadius: 125,
    healPctNormal: 0.12,
    healPctBoss: 0.03,
    radius: 14,
    color: '#10b981',
    borderColor: '#a7f3d0',
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '💚 Kas 3.5s gydo šalia esančius priešus (+12% HP, bosams +3%) – fokusuok su „Stipriausias“!'
  },
  forest_shadow: {
    id: 'forest_shadow',
    name: 'Miško Šešėlis (Camo)',
    icon: '👤',
    baseHp: 68,
    speed: 94,
    reward: 13,
    heartCost: 1,
    armor: 0,
    energyResist: 0,
    soundResist: 0,
    radius: 12,
    color: '#64748b',
    borderColor: '#2dd4bf',
    isBoss: false,
    isCamo: true,
    isFlying: false,
    counterTip: '👁️ Nematomas kitiems bokštams – būtinas Dronų Angaro radaras!'
  },
  hornet_swarm: {
    id: 'hornet_swarm',
    name: 'Širšių Būrys (Flying)',
    icon: '🐝',
    baseHp: 66,
    speed: 98,
    reward: 13,
    heartCost: 1,
    armor: 0,
    energyResist: 0,
    soundResist: 0,
    radius: 12,
    color: '#facc15',
    borderColor: '#fef08a',
    isBoss: false,
    isCamo: false,
    isFlying: true,
    counterTip: '✈️ Skrenda virš kelio – muša tik Dronai, Saulės Lazeris ir Garso Bokštas!'
  },
  tunnel_mole: {
    id: 'tunnel_mole',
    name: 'Kurmis-Tunelininkas',
    icon: '🐾',
    baseHp: 136,
    speed: 70,
    reward: 16,
    heartCost: 1,
    armor: 0.15,
    energyResist: 0,
    soundResist: 0,
    radius: 14,
    color: '#a16207',
    borderColor: '#fde68a',
    burrowAtHalfHp: true,
    burrowDuration: 2.0,
    burrowSpeedMult: 1.32,
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🕳️ Gavęs pusę žalos 2 sek. paneria po žeme – laikyk ugnį toliau trasoje!'
  },
  weed_golem: {
    id: 'weed_golem',
    name: 'Piktžolių Golemas',
    icon: '🌿',
    baseHp: 245,
    speed: 46,
    reward: 22,
    heartCost: 2,
    armor: 0.25,
    energyResist: 0,
    soundResist: 0,
    radius: 17,
    color: '#16a34a',
    borderColor: '#86efac',
    splitOnDeath: { type: 'garden_slug', count: 2, hpScale: 0.48 },
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🌿 Didelis HP, o sunaikintas suskyla į 2 mažus šliužus – puikiai tinka Splash!'
  },
  noise_goblin: {
    id: 'noise_goblin',
    name: 'Triukšmo Goblinas',
    icon: '👺',
    baseHp: 124,
    speed: 75,
    reward: 17,
    heartCost: 1,
    armor: 0.10,
    energyResist: 0,
    soundResist: 0,
    radius: 13,
    color: '#ec4899',
    borderColor: '#fbcfe8',
    jamAuraRadius: 135,
    jamFireRatePenalty: 0.25,
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '👺 Slopina gretimų bokštų greitį – nukreipk taikymą į „Stipriausias“!'
  },
  exploding_beetle: {
    id: 'exploding_beetle',
    name: 'Sprogstantis Vabalas',
    icon: '💥',
    baseHp: 102,
    speed: 84,
    reward: 15,
    heartCost: 1,
    armor: 0.20,
    energyResist: 0,
    soundResist: 0,
    radius: 13,
    color: '#ef4444',
    borderColor: '#fca5a5',
    deathStunMowersRadius: 80,
    deathStunMowersDuration: 2.2,
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '💥 Mirdamas trumpam sustabdo robotus-vejapjoves – naikink iš tolo Katapulta!'
  },
  cyber_raven: {
    id: 'cyber_raven',
    name: 'Kibernetinis Varnas',
    icon: '🦅',
    baseHp: 118,
    speed: 106,
    reward: 19,
    heartCost: 2,
    armor: 0.70, // Blokuoja 70% fizinės žalos
    energyResist: 0,
    soundResist: 0,
    radius: 14,
    color: '#0ea5e9',
    borderColor: '#e0f2fe',
    isBoss: false,
    isCamo: false,
    isFlying: true,
    counterTip: '🦅✈️ Skrenda ir turi 70% fizinių šarvų – būtinas Saulės Lazeris arba Garso Bokštas!'
  }
};

export const ENEMY_LIST = Object.values(ENEMY_ARCHETYPES);

// ==================== 5 TEMINIAI DVIFAZIAI ZONŲ BOSAI (2.8x–3.5x HP) ====================
export const ZONE_BOSSES = {
  1: {
    id: 'boss_slug_king',
    zone: 1,
    name: 'Milžiniškas Šliužų Karalius',
    icon: '🐌',
    baseHp: 2450,
    speed: 38,
    reward: 90,
    heartCost: 5,
    armor: 0.25,
    energyResist: 0,
    soundResist: 0,
    slowResistance: 0.75,
    maxSlowPct: 0.20,
    stunImmune: true,
    radius: 23,
    color: '#65a30d',
    borderColor: '#fde047',
    slimeTrail: true,
    summonInterval: 5.5,
    summonType: 'garden_slug',
    summonCount: 2,
    phase2Escorts: ['garden_slug', 'garden_slug', 'garden_slug', 'rushing_hedgehog', 'rushing_hedgehog'],
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🐌👑 1 Zonos Dvifazis Bosas: ties 50% HP gauna skydą, pagreitėja ir paleidžia būrį šliužų!'
  },
  2: {
    id: 'boss_iron_mole',
    zone: 2,
    name: 'Geležinis Kurmis',
    icon: '⛏️',
    baseHp: 2900,
    speed: 42,
    reward: 100,
    heartCost: 5,
    armor: 0.60,
    energyResist: 0,
    soundResist: 0,
    slowResistance: 0.75,
    maxSlowPct: 0.20,
    stunImmune: true,
    radius: 23,
    color: '#78350f',
    borderColor: '#fde047',
    periodicBurrowInterval: 6.5,
    burrowDuration: 2.0,
    burrowSpeedMult: 1.25,
    phase2Escorts: ['tunnel_mole', 'tunnel_mole', 'armored_beetle', 'armored_beetle'],
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '⛏️👑 2 Zonos Dvifazis Bosas: 60% šarvų, ties 50% HP paneria ir išlenda toliau su kurmiais!'
  },
  3: {
    id: 'boss_shadow_lord',
    zone: 3,
    name: 'Girios Šešėlių Valdovas',
    icon: '🌑',
    baseHp: 3250,
    speed: 45,
    reward: 115,
    heartCost: 5,
    armor: 0.35,
    energyResist: 0.25,
    soundResist: 0,
    slowResistance: 0.75,
    maxSlowPct: 0.20,
    stunImmune: true,
    radius: 23,
    color: '#312e81',
    borderColor: '#fde047',
    periodicCamoInterval: 6.0,
    periodicCamoDuration: 2.8,
    phase2Escorts: ['forest_shadow', 'forest_shadow', 'forest_shadow', 'forest_healer'],
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🌑👑 3 Zonos Dvifazis Bosas: tampa nematomas ir ties 50% HP pasikviečia Gamtos Gydytoją!'
  },
  4: {
    id: 'boss_wrong_notes',
    zone: 4,
    name: 'Klaidingų Natų Baubas',
    icon: '🎺',
    baseHp: 3700,
    speed: 42,
    reward: 125,
    heartCost: 5,
    armor: 0.40,
    energyResist: 0.15,
    soundResist: 0,
    slowResistance: 0.75,
    maxSlowPct: 0.20,
    stunImmune: true,
    radius: 23,
    color: '#be185d',
    borderColor: '#fde047',
    silenceTowerInterval: 5.2,
    silenceTowerDuration: 2.6,
    silenceRange: 215,
    phase2Escorts: ['noise_goblin', 'noise_goblin', 'mirror_beetle', 'mirror_beetle'],
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🎺👑 4 Zonos Dvifazis Bosas: užtildo artimiausius bokštus, ties 50% HP užtildo net 2 bokštus 4 sek.!'
  },
  5: {
    id: 'boss_cyber_mega',
    zone: 5,
    name: 'Kibernetinis Mega-Bosukas',
    icon: '🤖',
    baseHp: 4450,
    speed: 40,
    reward: 160,
    heartCost: 5,
    armor: 0.55,
    energyResist: 0.15,
    soundResist: 0,
    slowResistance: 0.75,
    maxSlowPct: 0.20,
    stunImmune: true,
    maxShield: 720,
    shieldRegenPerSec: 42,
    shieldRegenDelay: 2.6,
    phase2Escorts: ['cyber_raven', 'cyber_raven', 'mirror_beetle', 'mirror_beetle', 'forest_healer'],
    radius: 24,
    color: '#0f172a',
    borderColor: '#fde047',
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🤖👑 5 Zonos Dvifazis Bosas: atsinaujinantis skydas ir ties 50% HP galingas elitinis būrys!'
  }
};

export const BOSS_LIST = Object.values(ZONE_BOSSES);

export function getZoneBoss(zoneNumber = 1) {
  const z = Math.max(1, Math.min(5, Number(zoneNumber) || 1));
  return ZONE_BOSSES[z] || ZONE_BOSSES[1];
}

export function createEnemyInstanceData(archetype, waveNumber, profileId, pathIndex = 0, delay = 0.7, hpScale = 1) {
  const scaledHp = Math.max(8, Math.round(scaleEnemyHp(archetype.baseHp, waveNumber, profileId) * hpScale));
  const scaledShield = archetype.maxShield
    ? Math.max(40, Math.round(scaleEnemyHp(archetype.maxShield, waveNumber, profileId) * 0.45))
    : 0;

  return {
    type: archetype.id,
    name: archetype.name,
    icon: archetype.icon,
    pathIndex,
    delay,
    hp: scaledHp,
    speed: archetype.speed + (archetype.isBoss ? 0 : Math.min(18, waveNumber * 1.4)),
    reward: archetype.reward,
    heartCost: archetype.heartCost || 1,
    armor: archetype.armor || 0,
    energyResist: archetype.energyResist || 0,
    soundResist: archetype.soundResist || 0,
    slowResistance: archetype.slowResistance || 0,
    maxSlowPct: archetype.maxSlowPct || (archetype.isBoss ? 0.20 : 1.0),
    stunImmune: Boolean(archetype.stunImmune || archetype.isBoss),
    healInterval: archetype.healInterval || 0,
    healRadius: archetype.healRadius || 0,
    healPctNormal: archetype.healPctNormal || 0,
    healPctBoss: archetype.healPctBoss || 0,
    phase2Escorts: Array.isArray(archetype.phase2Escorts) ? [...archetype.phase2Escorts] : [],
    radius: archetype.radius || 13,
    color: archetype.color,
    borderColor: archetype.borderColor || '#ffffff',
    isBoss: Boolean(archetype.isBoss),
    isCamo: Boolean(archetype.isCamo),
    isFlying: Boolean(archetype.isFlying),
    burrowAtHalfHp: Boolean(archetype.burrowAtHalfHp),
    burrowDuration: archetype.burrowDuration || 0,
    burrowSpeedMult: archetype.burrowSpeedMult || 1.25,
    periodicBurrowInterval: archetype.periodicBurrowInterval || 0,
    splitOnDeath: archetype.splitOnDeath ? { ...archetype.splitOnDeath } : null,
    jamAuraRadius: archetype.jamAuraRadius || 0,
    jamFireRatePenalty: archetype.jamFireRatePenalty || 0,
    deathStunMowersRadius: archetype.deathStunMowersRadius || 0,
    deathStunMowersDuration: archetype.deathStunMowersDuration || 0,
    slimeTrail: Boolean(archetype.slimeTrail),
    summonInterval: archetype.summonInterval || 0,
    summonType: archetype.summonType || null,
    summonCount: archetype.summonCount || 0,
    periodicCamoInterval: archetype.periodicCamoInterval || 0,
    periodicCamoDuration: archetype.periodicCamoDuration || 0,
    silenceTowerInterval: archetype.silenceTowerInterval || 0,
    silenceTowerDuration: archetype.silenceTowerDuration || 0,
    silenceRange: archetype.silenceRange || 0,
    maxShield: scaledShield,
    shieldRegenPerSec: archetype.shieldRegenPerSec || 0,
    shieldRegenDelay: archetype.shieldRegenDelay || 2.8,
    counterTip: archetype.counterTip || ''
  };
}

function getWavePlanTypes(waveNumber, options = {}) {
  const zoneId = Number(options.zoneId) || 1;
  const effectiveWave = Math.min(16, Math.max(1, waveNumber + (zoneId > 1 ? zoneId - 1 : 0)));
  const plans = {
    1: ['garden_slug', 'rushing_hedgehog'],
    2: ['garden_slug', 'rushing_hedgehog', 'armored_beetle'],
    3: ['rushing_hedgehog', 'armored_beetle', 'forest_shadow'],
    4: ['hornet_swarm', 'tunnel_mole', 'armored_beetle'],
    5: ['weed_golem', 'mirror_beetle', 'hornet_swarm', 'rushing_hedgehog'],
    6: ['noise_goblin', 'forest_healer', 'mirror_beetle', 'armored_beetle'],
    7: ['hornet_swarm', 'forest_shadow', 'tunnel_mole', 'forest_healer'],
    8: ['exploding_beetle', 'mirror_beetle', 'hornet_swarm', 'weed_golem'],
    9: ['cyber_raven', 'forest_shadow', 'armored_beetle', 'forest_healer'],
    10: ['cyber_raven', 'mirror_beetle', 'weed_golem', 'noise_goblin'],
    11: ['cyber_raven', 'forest_shadow', 'forest_healer', 'exploding_beetle', 'armored_beetle'],
    12: ['mirror_beetle', 'hornet_swarm', 'tunnel_mole', 'forest_healer', 'weed_golem'],
    13: ['cyber_raven', 'mirror_beetle', 'forest_shadow', 'noise_goblin', 'forest_healer'],
    14: ['cyber_raven', 'armored_beetle', 'exploding_beetle', 'weed_golem', 'forest_healer'],
    15: ['cyber_raven', 'mirror_beetle', 'forest_shadow', 'hornet_swarm', 'forest_healer', 'noise_goblin'],
    16: ['cyber_raven', 'mirror_beetle', 'armored_beetle', 'forest_shadow', 'weed_golem', 'forest_healer', 'exploding_beetle']
  };
  return plans[effectiveWave] || plans[16];
}

function resolveBossForWave(waveNumber, options = {}) {
  const maxWaves = options.maxWaves || MAX_WAVES_DEFAULT;
  const zoneId = Number(options.zoneId) || 1;
  const isBossLevel = options.levelInZone === undefined || options.levelInZone === 3;

  if (waveNumber === maxWaves && isBossLevel) {
    // 5 Teminiai Dvifaziai Bosai pasirodo kiekvienos zonos 3-iojo lygio paskutinėje bangoje (3, 6, 9, 12, 15 lyg.)
    return getZoneBoss(zoneId);
  }
  return null;
}

export function generateWaveSpawns(waveNumber, pathCount = 1, profileId = 'lukas', options = {}) {
  const w = Math.max(1, Number(waveNumber) || 1);
  const paths = Math.max(1, Number(pathCount) || 1);
  const levelNum = Math.max(1, Number(options.levelNumber) || 1);
  const zoneId = Math.max(1, Number(options.zoneId) || 1);
  const levelHpScale = 1 + (levelNum - 1) * 0.045 + (zoneId - 1) * 0.08;
  const planTypes = getWavePlanTypes(w, options);
  const totalUnits = Math.min(46, 7 + Math.round(w * 2.4));
  const intervalBase = Math.max(0.32, 0.92 - w * 0.038);

  const spawns = [];
  for (let i = 0; i < totalUnits; i++) {
    const typeId = planTypes[i % planTypes.length];
    const arch = ENEMY_ARCHETYPES[typeId] || ENEMY_ARCHETYPES.garden_slug;
    spawns.push(
      createEnemyInstanceData(arch, w, profileId, i % paths, i === 0 ? 0.15 : intervalBase, levelHpScale)
    );
  }

  const bossArch = resolveBossForWave(w, options);
  if (bossArch) {
    spawns.push(createEnemyInstanceData(bossArch, w, profileId, 0, 1.4, levelHpScale));
  }

  return spawns;
}

export function getWavePreviewInfo(waveNumber, pathCount = 1, profileId = 'lukas', options = {}) {
  const spawns = generateWaveSpawns(waveNumber, pathCount, profileId, options);
  const grouped = new Map();

  for (const s of spawns) {
    if (!grouped.has(s.type)) {
      grouped.set(s.type, {
        id: s.type,
        name: s.name,
        icon: s.icon,
        count: 0,
        isBoss: s.isBoss,
        isFlying: s.isFlying,
        isCamo: s.isCamo,
        hasArmor: (s.armor || 0) >= 0.50,
        hasMirror: (s.energyResist || 0) >= 0.50,
        hasHealer: (s.healInterval || 0) > 0,
        counterTip: s.counterTip
      });
    }
    grouped.get(s.type).count += 1;
  }

  const groups = Array.from(grouped.values()).sort((a, b) => Number(b.isBoss) - Number(a.isBoss));
  const bossGroup = groups.find((g) => g.isBoss);
  const hasFlying = groups.some((g) => g.isFlying);
  const hasCamo = groups.some((g) => g.isCamo);
  const hasArmor = groups.some((g) => g.hasArmor);
  const hasMirror = groups.some((g) => g.hasMirror);
  const hasHealer = groups.some((g) => g.hasHealer);

  const warnings = [];
  if (hasArmor) warnings.push('🛡️ Šarvai – reikia Lazerio!');
  if (hasMirror) warnings.push('🪞 Veidrodis – reikia Katapultos!');
  if (hasCamo) warnings.push('👁️ Nematomas – reikia Dronų!');
  if (hasFlying) warnings.push('✈️ Skrenda!');
  if (hasHealer) warnings.push('💚 Gydo!');

  let headline = `🌊 ${waveNumber}-oji banga pasirengusi!`;
  if (bossGroup) {
    headline = `👑 ATEINA BOSAS: ${bossGroup.name}!`;
  } else if (hasMirror) {
    headline = '🪞 Ateina Veidrodiniai Kristalai – reikia Katapultos / Barakų!';
  } else if (hasHealer) {
    headline = '💚 Ateina Gamtos Gydytojai – fokusuok „Stipriausias“!';
  } else if (groups.some((g) => g.id === 'cyber_raven')) {
    headline = '✈️🛡️ Ateina šarvuoti Kibernetiniai Varnai – reikia Lazerio!';
  } else if (hasFlying) {
    headline = '✈️ Ateina skraidančios širšės!';
  } else if (hasCamo) {
    headline = '👁️ Ateina nematomi Miško Šešėliai (Camo)!';
  } else if (hasArmor) {
    headline = '🛡️ Ateina Šarvuoti Vabalai – reikia Lazerio!';
  } else if (groups.some((g) => g.id === 'tunnel_mole')) {
    headline = '🕳️ Ateina Kurmiai-Tunelininkai!';
  } else if (groups.some((g) => g.id === 'noise_goblin')) {
    headline = '👺 Ateina Triukšmo Goblinai (lėtina bokštus)!';
  } else if (groups.some((g) => g.id === 'weed_golem')) {
    headline = '🌿 Ateina Piktžolių Golemai!';
  }

  return {
    waveNumber,
    headline,
    primaryIcon: bossGroup ? bossGroup.icon : groups[0]?.icon || '⚠️',
    groups,
    warnings,
    hasFlying,
    hasCamo,
    hasArmor,
    hasMirror,
    hasHealer,
    hasBoss: Boolean(bossGroup)
  };
}
