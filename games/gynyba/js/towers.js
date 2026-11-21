// ==================== BUBIŲ TVIRTOVĖ: 6 BOKŠTELIŲ MECHANIKOS IR 12 TIER-4 EVOLIUCIJŲ ====================

export const TOWER_CATALOG = {
  solar_laser: {
    id: 'solar_laser',
    name: 'Saulės Lazeris',
    shortName: 'Saulės Lazeris',
    icon: '☀️',
    color: '#38bdf8',
    accentColor: '#fde047',
    cost: 75,
    attackMode: 'continuous_beam',
    damageType: 'energy',
    canHitFlying: true,
    detectsCamo: false,
    desc: 'Energijos spindulys (iki 2.5x žalos): ignoruoja fizinius šarvus ir muša skraidančius, bet silpnas prieš Veidrodinį Kristalą!',
    levels: [
      {
        level: 1,
        upgradeCost: 0,
        range: 155,
        dps: 34,
        maxRamp: 2.5,
        rampRatePerSec: 0.65,
        armorPierce: 1.0,
        maxTargets: 1
      },
      {
        level: 2,
        upgradeCost: 70,
        range: 172,
        dps: 50,
        maxRamp: 2.5,
        rampRatePerSec: 0.72,
        armorPierce: 1.0,
        maxTargets: 1
      },
      {
        level: 3,
        upgradeCost: 140,
        range: 190,
        dps: 72,
        maxRamp: 2.5,
        rampRatePerSec: 0.80,
        armorPierce: 1.0,
        maxTargets: 1
      }
    ],
    evolutions: {
      plasma_burner: {
        id: 'plasma_burner',
        name: 'Plazmos Degiklis',
        icon: '🔥',
        cost: 205,
        color: '#f97316',
        desc: 'Sunaikintas priešas sprogsta plazmos banga, pažeisdamas aplinkinius!',
        range: 205,
        dps: 96,
        maxRamp: 2.5,
        rampRatePerSec: 0.90,
        armorPierce: 1.0,
        maxTargets: 1,
        explodeOnKillRadius: 68,
        explodeOnKillDamage: 90
      },
      prism_beacon: {
        id: 'prism_beacon',
        name: 'Prizmės Švyturys',
        icon: '🌈',
        cost: 215,
        color: '#22d3ee',
        desc: 'Skaido spindulį ir vienu metu degina iki 3 priešų!',
        range: 210,
        dps: 76,
        maxRamp: 2.5,
        rampRatePerSec: 0.85,
        armorPierce: 1.0,
        maxTargets: 3
      }
    }
  },

  dagilelis_sound: {
    id: 'dagilelis_sound',
    name: '„Dagilėlio“ Garso Bokštas',
    shortName: 'Garso Bokštas',
    icon: '🎵',
    color: '#fb7185',
    accentColor: '#fecdd3',
    cost: 90,
    attackMode: 'sound_wave',
    damageType: 'sound',
    canHitFlying: true,
    detectsCamo: false,
    desc: 'Garso žala ignoruoja fizinius ir veidrodinius šarvus (muša ir skraidančius), o šalia suteikia +15% greičio aurą!',
    levels: [
      {
        level: 1,
        upgradeCost: 0,
        range: 138,
        damage: 22,
        cooldown: 1.05,
        auraRadius: 150,
        auraFireRateBonus: 0.15
      },
      {
        level: 2,
        upgradeCost: 75,
        range: 152,
        damage: 34,
        cooldown: 0.96,
        auraRadius: 160,
        auraFireRateBonus: 0.15
      },
      {
        level: 3,
        upgradeCost: 150,
        range: 168,
        damage: 50,
        cooldown: 0.88,
        auraRadius: 172,
        auraFireRateBonus: 0.15
      }
    ],
    evolutions: {
      choir_harmony: {
        id: 'choir_harmony',
        name: 'Choro Harmonija',
        icon: '🎶',
        cost: 205,
        color: '#f472b6',
        desc: '+30% šaudymo greičio aura gretimiems bokštams ir didelis bangų nuotolis!',
        range: 200,
        damage: 66,
        cooldown: 0.78,
        auraRadius: 215,
        auraFireRateBonus: 0.30
      },
      bass_drop: {
        id: 'bass_drop',
        name: 'Boso Smūgis',
        icon: '🔊',
        cost: 220,
        color: '#e11d48',
        desc: 'Galinga žemų dažnių banga trumpam apsvaigina (0.65s) ir atstumia priešus atgal!',
        range: 180,
        damage: 80,
        cooldown: 0.92,
        auraRadius: 175,
        auraFireRateBonus: 0.18,
        stunDuration: 0.65,
        knockbackDist: 22
      }
    }
  },

  drone_hangar: {
    id: 'drone_hangar',
    name: 'Dronų Angaras',
    shortName: 'Dronų Angaras',
    icon: '🛸',
    color: '#2dd4bf',
    accentColor: '#a7f3d0',
    cost: 95,
    attackMode: 'drones',
    damageType: 'physical',
    canHitFlying: true,
    detectsCamo: true,
    desc: 'Fizinė ugnis iš oro: muša skraidančius, kerta Veidrodinį Kristalą ir radaru atidengia nematomus (Camo)!',
    levels: [
      {
        level: 1,
        upgradeCost: 0,
        range: 185,
        droneCount: 1,
        damage: 24,
        cooldown: 0.55,
        camoRevealRadius: 160,
        canHitFlying: true,
        detectsCamo: true
      },
      {
        level: 2,
        upgradeCost: 85,
        range: 205,
        droneCount: 2,
        damage: 28,
        cooldown: 0.48,
        camoRevealRadius: 180,
        canHitFlying: true,
        detectsCamo: true
      },
      {
        level: 3,
        upgradeCost: 165,
        range: 225,
        droneCount: 2,
        damage: 42,
        cooldown: 0.42,
        camoRevealRadius: 200,
        canHitFlying: true,
        detectsCamo: true
      }
    ],
    evolutions: {
      scout_scanner: {
        id: 'scout_scanner',
        name: 'Žvalgas-Skeneris',
        icon: '📡',
        cost: 200,
        color: '#34d399',
        desc: 'Milžiniškas radaras visiškai nuima nematomumą dideliame plote +20% žalos pažeistiems!',
        range: 255,
        droneCount: 2,
        damage: 54,
        cooldown: 0.36,
        camoRevealRadius: 285,
        stripCamoPermanently: true,
        scannerDmgBonus: 0.20,
        canHitFlying: true,
        detectsCamo: true
      },
      missile_drone: {
        id: 'missile_drone',
        name: 'Raketinis Dronas',
        icon: '🚀',
        cost: 225,
        color: '#0ea5e9',
        desc: 'Dronai šaudo galingas fizines sekimo raketas su sprogimo banga (niokoja Veidrodinį Kristalą)!',
        range: 240,
        droneCount: 2,
        damage: 90,
        cooldown: 0.68,
        camoRevealRadius: 210,
        homingMissiles: true,
        splashRadius: 56,
        canHitFlying: true,
        detectsCamo: true
      }
    }
  },

  mower_barracks: {
    id: 'mower_barracks',
    name: 'Robotų-Vejapjovių Barakai',
    shortName: 'Vejapjovių Barakai',
    icon: '🤖',
    color: '#4ade80',
    accentColor: '#bbf7d0',
    cost: 100,
    attackMode: 'barracks',
    damageType: 'physical',
    canHitFlying: false,
    detectsCamo: false,
    desc: 'Fizinė kova tik ant žemės (nemato skraidančių): sulaiko priešus, puikiai kerta Veidrodinį Kristalą!',
    levels: [
      {
        level: 1,
        upgradeCost: 0,
        range: 175,
        unitCount: 2,
        unitMaxHp: 120,
        unitDps: 22,
        unitArmor: 0.10,
        respawnTime: 6.0
      },
      {
        level: 2,
        upgradeCost: 85,
        range: 185,
        unitCount: 2,
        unitMaxHp: 185,
        unitDps: 34,
        unitArmor: 0.15,
        respawnTime: 5.5
      },
      {
        level: 3,
        upgradeCost: 170,
        range: 195,
        unitCount: 3,
        unitMaxHp: 255,
        unitDps: 46,
        unitArmor: 0.20,
        respawnTime: 5.0
      }
    ],
    evolutions: {
      armored_guards: {
        id: 'armored_guards',
        name: 'Šarvuoti Sargai',
        icon: '🛡️',
        cost: 220,
        color: '#22c55e',
        desc: '3 labai tvirti šarvuoti robotai (480 HP, 35% šarvai), ilgai laikantys net bosus!',
        range: 210,
        unitCount: 3,
        unitMaxHp: 480,
        unitDps: 65,
        unitArmor: 0.35,
        respawnTime: 4.2
      },
      electro_mowers: {
        id: 'electro_mowers',
        name: 'Elektros Pjovėjai',
        icon: '⚡',
        cost: 225,
        color: '#eab308',
        desc: 'Robotai skleidžia aukštos įtampos lauką, degindami aplinkinius žemės priešus!',
        range: 210,
        unitCount: 3,
        unitMaxHp: 310,
        unitDps: 56,
        unitArmor: 0.20,
        electroAuraDps: 40,
        electroAuraRadius: 60,
        respawnTime: 4.5
      }
    }
  },

  berry_catapult: {
    id: 'berry_catapult',
    name: 'Šalčio / Šilauogių Katapulta',
    shortName: 'Šalčio Katapulta',
    icon: '🫐',
    color: '#818cf8',
    accentColor: '#c7d2fe',
    cost: 105,
    attackMode: 'catapult',
    damageType: 'physical',
    canHitFlying: false,
    detectsCamo: false,
    desc: 'Fiziniai žemės sviediniai (nemato skraidančių): traiško Veidrodinį Kristalą, sulėtina ir daro ploto žalą!',
    levels: [
      {
        level: 1,
        upgradeCost: 0,
        range: 210,
        damage: 42,
        cooldown: 1.35,
        splashRadius: 62,
        slowPercentage: 0.35,
        slowDuration: 2.5,
        burstCount: 1,
        arcHeight: 62
      },
      {
        level: 2,
        upgradeCost: 90,
        range: 228,
        damage: 66,
        cooldown: 1.25,
        splashRadius: 72,
        slowPercentage: 0.42,
        slowDuration: 2.5,
        burstCount: 1,
        arcHeight: 66
      },
      {
        level: 3,
        upgradeCost: 175,
        range: 248,
        damage: 96,
        cooldown: 1.15,
        splashRadius: 82,
        slowPercentage: 0.50,
        slowDuration: 2.5,
        burstCount: 1,
        arcHeight: 70
      }
    ],
    evolutions: {
      arctic_cannon: {
        id: 'arctic_cannon',
        name: 'Arktinė Patranka',
        icon: '❄️',
        cost: 225,
        color: '#60a5fa',
        desc: 'Kas 3-ias šūvis sustingdo įprastus priešus sprogimo zonoje (1.7s)!',
        range: 265,
        damage: 138,
        cooldown: 1.08,
        splashRadius: 96,
        slowPercentage: 0.50,
        slowDuration: 2.5,
        burstCount: 1,
        arcHeight: 72,
        freezeEveryNShots: 3,
        freezeDuration: 1.7
      },
      double_catapult: {
        id: 'double_catapult',
        name: 'Dviguba Svaidyklė',
        icon: '🫐',
        cost: 230,
        color: '#a855f7',
        desc: 'Iššauna 3 parabolines šilauogių bombas vienu metu!',
        range: 255,
        damage: 86,
        cooldown: 1.12,
        splashRadius: 76,
        slowPercentage: 0.50,
        slowDuration: 2.5,
        burstCount: 3,
        arcHeight: 74
      }
    }
  },

  solar_station: {
    id: 'solar_station',
    name: 'Saulės Baterijų Stotis',
    shortName: 'Saulės Stotis',
    icon: '🔋',
    color: '#fbbf24',
    accentColor: '#fef08a',
    cost: 85,
    attackMode: 'station',
    damageType: 'energy',
    canHitFlying: true,
    detectsCamo: false,
    desc: 'Kas 6s bangos metu gamina monetas ir padidina gretimų bokštų nuotolį +12%!',
    levels: [
      {
        level: 1,
        upgradeCost: 0,
        range: 155,
        auraRadius: 155,
        auraRangeBonus: 0.12,
        incomeInterval: 6.0,
        incomeAmount: 14
      },
      {
        level: 2,
        upgradeCost: 75,
        range: 165,
        auraRadius: 165,
        auraRangeBonus: 0.12,
        incomeInterval: 6.0,
        incomeAmount: 22
      },
      {
        level: 3,
        upgradeCost: 150,
        range: 175,
        auraRadius: 175,
        auraRangeBonus: 0.12,
        incomeInterval: 6.0,
        incomeAmount: 32
      }
    ],
    evolutions: {
      power_plant_10kw: {
        id: 'power_plant_10kw',
        name: '10 kW Elektrinė',
        icon: '🏭',
        cost: 205,
        color: '#f59e0b',
        desc: 'Galinga monetų gamyba (+60 🪙 kas 6s) ir +15% nuotolio aura kaimynams!',
        range: 195,
        auraRadius: 195,
        auraRangeBonus: 0.15,
        incomeInterval: 6.0,
        incomeAmount: 60
      },
      super_capacitor: {
        id: 'super_capacitor',
        name: 'Super-Akumuliatorius',
        icon: '🌩️',
        cost: 220,
        color: '#fde047',
        desc: 'Kas 12s trenkia galingu 420 energijos žaibu į stipriausią priešą!',
        range: 185,
        auraRadius: 185,
        auraRangeBonus: 0.12,
        incomeInterval: 6.0,
        incomeAmount: 32,
        lightningInterval: 12.0,
        lightningDamage: 420
      }
    }
  }
};

export const TOWER_LIST = [
  TOWER_CATALOG.solar_laser,
  TOWER_CATALOG.dagilelis_sound,
  TOWER_CATALOG.drone_hangar,
  TOWER_CATALOG.mower_barracks,
  TOWER_CATALOG.berry_catapult,
  TOWER_CATALOG.solar_station
];

export function getTowerStats(towerType, level = 1, evolutionId = null) {
  const def = TOWER_CATALOG[towerType];
  if (!def) return null;

  if (level >= 4 && evolutionId && def.evolutions && def.evolutions[evolutionId]) {
    return {
      ...def,
      ...def.evolutions[evolutionId],
      level: 4,
      evolutionId,
      evolutionName: def.evolutions[evolutionId].name,
      evolutionIcon: def.evolutions[evolutionId].icon
    };
  }

  const idx = Math.max(0, Math.min(def.levels.length - 1, (Number(level) || 1) - 1));
  return {
    ...def,
    ...def.levels[idx],
    level: idx + 1,
    evolutionId: null
  };
}

export function getUpgradeCost(towerType, currentLevel = 1) {
  const def = TOWER_CATALOG[towerType];
  if (!def) return null;
  const lvl = Number(currentLevel) || 1;
  if (lvl >= def.levels.length) return null;
  return def.levels[lvl].upgradeCost;
}

export function getTowerEvolutions(towerType) {
  const def = TOWER_CATALOG[towerType];
  if (!def || !def.evolutions) return [];
  return Object.values(def.evolutions);
}

/**
 * Randa artimiausią tašką ant kelio kreivių (naudojama Barakų „Rally Point“).
 */
export function findNearestPathPoint(
  pathSplines,
  targetX,
  targetY,
  maxRange = Infinity,
  anchorX = targetX,
  anchorY = targetY
) {
  if (!Array.isArray(pathSplines) || pathSplines.length === 0) {
    return { x: targetX, y: targetY, pathIndex: 0, dist: 0 };
  }

  let bestInRange = null;
  let bestInRangeDist = Infinity;
  let bestFallback = null;
  let bestFallbackDist = Infinity;

  for (let pIdx = 0; pIdx < pathSplines.length; pIdx++) {
    const pts = pathSplines[pIdx].points || [];
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      const anchorDist = Math.hypot(pt.x - anchorX, pt.y - anchorY);
      const targetDist = Math.hypot(pt.x - targetX, pt.y - targetY);

      if (anchorDist < bestFallbackDist) {
        bestFallbackDist = anchorDist;
        bestFallback = { x: pt.x, y: pt.y, pathIndex: pIdx, dist: pt.dist };
      }

      if (anchorDist <= maxRange && targetDist < bestInRangeDist) {
        bestInRangeDist = targetDist;
        bestInRange = { x: pt.x, y: pt.y, pathIndex: pIdx, dist: pt.dist };
      }
    }
  }

  return bestInRange || bestFallback || { x: targetX, y: targetY, pathIndex: 0, dist: 0 };
}
