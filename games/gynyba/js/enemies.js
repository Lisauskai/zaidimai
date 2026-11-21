// ==================== BUBIŲ TVIRTOVĖ: 10 PRIEŠŲ TIPŲ, 5 ZONŲ BOSAI IR BANGŲ PERŽIŪRA ====================

export const MAX_WAVES_DEFAULT = 10;

export function scaleEnemyHp(baseHp, waveNumber = 1, profileId = 'lukas') {
  const w = Math.max(1, Number(waveNumber) || 1);
  const profileMult = profileId === 'linas' ? 0.8 : 1.0; // -20% priešų HP Linui (1 kl.)
  const waveScale = 1 + (w - 1) * 0.28 + Math.pow(Math.max(0, w - 3), 1.35) * 0.08;
  return Math.max(10, Math.round(baseHp * waveScale * profileMult));
}

// ==================== 10 ĮPRASTŲ PRIEŠŲ TIPŲ ====================
export const ENEMY_ARCHETYPES = {
  garden_slug: {
    id: 'garden_slug',
    name: 'Sodo Šliužas',
    icon: '🐌',
    baseHp: 88,
    speed: 52,
    reward: 12,
    heartCost: 1,
    armor: 0,
    slowResistance: 0.85, // Atsparus sulėtinimui (85%)
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
    baseHp: 34,
    speed: 128,
    reward: 10,
    heartCost: 1,
    armor: 0,
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
    baseHp: 115,
    speed: 62,
    reward: 17,
    heartCost: 1,
    armor: 0.50, // 50% fizinių šarvų
    radius: 14,
    color: '#6366f1',
    borderColor: '#c7d2fe',
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🪲 50% fizinių šarvų – efektyviausiai kerta Saulės Lazeris!'
  },
  forest_shadow: {
    id: 'forest_shadow',
    name: 'Miško Šešėlis (Camo)',
    icon: '👤',
    baseHp: 64,
    speed: 92,
    reward: 16,
    heartCost: 1,
    armor: 0,
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
    baseHp: 62,
    speed: 96,
    reward: 16,
    heartCost: 1,
    armor: 0,
    radius: 12,
    color: '#facc15',
    borderColor: '#fef08a',
    isBoss: false,
    isCamo: false,
    isFlying: true,
    counterTip: '🐝 Skrenda virš kelio – muša tik Dronai, Saulės Lazeris ir Garso Bokštas!'
  },
  tunnel_mole: {
    id: 'tunnel_mole',
    name: 'Kurmis-Tunelininkas',
    icon: '🐾',
    baseHp: 130,
    speed: 70,
    reward: 20,
    heartCost: 1,
    armor: 0.15,
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
    baseHp: 230,
    speed: 46,
    reward: 28,
    heartCost: 2,
    armor: 0.20,
    radius: 17,
    color: '#16a34a',
    borderColor: '#86efac',
    splitOnDeath: { type: 'garden_slug', count: 2, hpScale: 0.45 },
    isBoss: false,
    isCamo: false,
    isFlying: false,
    counterTip: '🌿 Didelis HP, o sunaikintas suskyla į 2 mažus šliužus – puikiai tinka Splash!'
  },
  noise_goblin: {
    id: 'noise_goblin',
    name: 'Triukšmo Goblinas',
    icon: '👺',
    baseHp: 118,
    speed: 74,
    reward: 22,
    heartCost: 1,
    armor: 0.10,
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
    baseHp: 96,
    speed: 82,
    reward: 19,
    heartCost: 1,
    armor: 0.20,
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
    baseHp: 110,
    speed: 104,
    reward: 24,
    heartCost: 2,
    armor: 0.40,
    radius: 14,
    color: '#0ea5e9',
    borderColor: '#e0f2fe',
    isBoss: false,
    isCamo: false,
    isFlying: true,
    counterTip: '🦅 Greitas ir šarvuotas skraidūnas – derink Saulės Lazerį ir Raketinius Dronus!'
  }
};

export const ENEMY_LIST = Object.values(ENEMY_ARCHETYPES);

// ==================== 5 TEMINIAI ZONŲ BOSAI ====================
export const ZONE_BOSSES = {
  1: {
    id: 'boss_slug_king',
    zone: 1,
    name: 'Milžiniškas Šliužų Karalius',
    icon: '🐌',
    baseHp: 820,
    speed: 38,
    reward: 110,
    heartCost: 5,
    armor: 0.15,
    slowResistance: 0.75,
    radius: 23,
    color: '#65a30d',
    borderColor: '#fde047',
    slimeTrail: true,
    summonInterval: 5.5,
    summonType: 'garden_slug',
    summonCount: 2,
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🐌👑 1 Zonos Bosas: palieka gleivių pėdsaką ir kviečia mažus šliužus!'
  },
  2: {
    id: 'boss_iron_mole',
    zone: 2,
    name: 'Geležinis Kurmis',
    icon: '⛏️',
    baseHp: 940,
    speed: 42,
    reward: 125,
    heartCost: 5,
    armor: 0.45,
    radius: 23,
    color: '#78350f',
    borderColor: '#fde047',
    periodicBurrowInterval: 6.5,
    burrowDuration: 2.0,
    burrowSpeedMult: 1.25,
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '⛏️👑 2 Zonos Bosas: periodiškai paneria po žeme ir turi 45% šarvų!'
  },
  3: {
    id: 'boss_shadow_lord',
    zone: 3,
    name: 'Girios Šešėlių Valdovas',
    icon: '🌑',
    baseHp: 1020,
    speed: 45,
    reward: 140,
    heartCost: 5,
    armor: 0.25,
    radius: 23,
    color: '#312e81',
    borderColor: '#fde047',
    periodicCamoInterval: 6.0,
    periodicCamoDuration: 2.8,
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🌑👑 3 Zonos Bosas: tampa nematomas kas 6 sek. – laikyk Dronų Angaro radarą!'
  },
  4: {
    id: 'boss_wrong_notes',
    zone: 4,
    name: 'Klaidingų Natų Baubas',
    icon: '🎺',
    baseHp: 1120,
    speed: 42,
    reward: 155,
    heartCost: 5,
    armor: 0.30,
    radius: 23,
    color: '#be185d',
    borderColor: '#fde047',
    silenceTowerInterval: 5.2,
    silenceTowerDuration: 2.6,
    silenceRange: 215,
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🎺👑 4 Zonos Bosas: periodiškai užtildo artimiausią bokštą!'
  },
  5: {
    id: 'boss_cyber_mega',
    zone: 5,
    name: 'Kibernetinis Mega-Bosukas',
    icon: '🤖',
    baseHp: 1300,
    speed: 40,
    reward: 200,
    heartCost: 5,
    armor: 0.40,
    maxShield: 360,
    shieldRegenPerSec: 28,
    shieldRegenDelay: 2.8,
    radius: 24,
    color: '#0f172a',
    borderColor: '#fde047',
    isBoss: true,
    isCamo: false,
    isFlying: false,
    counterTip: '🤖👑 5 Zonos Bosas: turi atsinaujinantį energijos skydą ir daug HP!'
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
    slowResistance: archetype.slowResistance || 0,
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

function getWavePlanTypes(waveNumber) {
  const plans = {
    1: ['garden_slug', 'rushing_hedgehog'],
    2: ['garden_slug', 'rushing_hedgehog', 'armored_beetle'],
    3: ['rushing_hedgehog', 'armored_beetle', 'forest_shadow'],
    4: ['hornet_swarm', 'tunnel_mole', 'armored_beetle'],
    5: ['weed_golem', 'hornet_swarm', 'rushing_hedgehog'],
    6: ['noise_goblin', 'exploding_beetle', 'forest_shadow', 'armored_beetle'],
    7: ['hornet_swarm', 'tunnel_mole', 'noise_goblin', 'weed_golem'],
    8: ['cyber_raven', 'exploding_beetle', 'forest_shadow', 'tunnel_mole'],
    9: ['cyber_raven', 'weed_golem', 'noise_goblin', 'armored_beetle'],
    10: ['cyber_raven', 'hornet_swarm', 'weed_golem', 'noise_goblin', 'exploding_beetle']
  };
  return plans[Math.max(1, Math.min(10, waveNumber))] || plans[10];
}

function resolveBossForWave(waveNumber, options = {}) {
  const maxWaves = options.maxWaves || MAX_WAVES_DEFAULT;
  const zoneId = options.zoneId || 1;
  const mapId = options.mapId || 'bubiai';

  if (waveNumber === maxWaves) {
    // Paskutinėje bangoje (pvz., 3-iojo lygio finalinėje bangoje) išeina zonos teminis bosas
    return getZoneBoss(zoneId);
  }
  if (waveNumber === 5) {
    if (mapId === 'bubiai') return getZoneBoss(2);      // Geležinis Kurmis
    if (mapId === 'kurtuvenai') return getZoneBoss(2);  // Geležinis Kurmis
    if (mapId === 'dagilelis') return getZoneBoss(4);   // Klaidingų Natų Baubas
    return getZoneBoss(Math.max(1, zoneId - 1));
  }
  return null;
}

export function generateWaveSpawns(waveNumber, pathCount = 1, profileId = 'lukas', options = {}) {
  const w = Math.max(1, Number(waveNumber) || 1);
  const paths = Math.max(1, Number(pathCount) || 1);
  const planTypes = getWavePlanTypes(w);
  const totalUnits = 7 + w * 3;
  const intervalBase = Math.max(0.36, 0.92 - w * 0.045);

  const spawns = [];
  for (let i = 0; i < totalUnits; i++) {
    const typeId = planTypes[i % planTypes.length];
    const arch = ENEMY_ARCHETYPES[typeId] || ENEMY_ARCHETYPES.garden_slug;
    spawns.push(
      createEnemyInstanceData(arch, w, profileId, i % paths, i === 0 ? 0.15 : intervalBase)
    );
  }

  const bossArch = resolveBossForWave(w, options);
  if (bossArch) {
    spawns.push(createEnemyInstanceData(bossArch, w, profileId, 0, 1.4));
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
        hasArmor: (s.armor || 0) >= 0.35,
        counterTip: s.counterTip
      });
    }
    grouped.get(s.type).count += 1;
  }

  const groups = Array.from(grouped.values()).sort((a, b) => Number(b.isBoss) - Number(a.isBoss));
  const bossGroup = groups.find((g) => g.isBoss);
  const hasFlying = groups.some((g) => g.isFlying);
  const hasCamo = groups.some((g) => g.isCamo);

  let headline = `🌊 ${waveNumber}-oji banga pasirengusi!`;
  if (bossGroup) {
    headline = `👑 ATEINA BOSAS: ${bossGroup.name}!`;
  } else if (groups.some((g) => g.id === 'hornet_swarm')) {
    headline = '⚠️ Ateina skraidančios širšės!';
  } else if (groups.some((g) => g.id === 'cyber_raven')) {
    headline = '⚠️ Ateina šarvuoti Kibernetiniai Varnai (Flying)!';
  } else if (hasCamo) {
    headline = '👁️ Ateina nematomi Miško Šešėliai (Camo)!';
  } else if (groups.some((g) => g.id === 'tunnel_mole')) {
    headline = '🕳️ Ateina Kurmiai-Tunelininkai!';
  } else if (groups.some((g) => g.id === 'noise_goblin')) {
    headline = '👺 Ateina Triukšmo Goblinai (lėtina bokštus)!';
  } else if (groups.some((g) => g.id === 'armored_beetle')) {
    headline = '🪲 Ateina Šarvuoti Vabalai (50% šarvų)!';
  } else if (groups.some((g) => g.id === 'weed_golem')) {
    headline = '🌿 Ateina Piktžolių Golemai!';
  }

  return {
    waveNumber,
    headline,
    primaryIcon: bossGroup ? bossGroup.icon : groups[0]?.icon || '⚠️',
    groups,
    hasFlying,
    hasCamo,
    hasBoss: Boolean(bossGroup)
  };
}
