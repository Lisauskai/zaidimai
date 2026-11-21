// ==================== BUBIŲ TVIRTOVĖ: EKONOMIKOS, BALANSO IR ŽEMĖLAPIŲ MATEMATIKA ====================
// Parengta pagal Kingdom Rush ir Bloons TD 6 strateginius standartus.

export {
  TOWER_CATALOG,
  TOWER_LIST,
  getTowerStats,
  getUpgradeCost,
  getTowerEvolutions,
  findNearestPathPoint
} from './towers.js?v=20261121r';

export {
  ENEMY_ARCHETYPES,
  ENEMY_LIST,
  ZONE_BOSSES,
  ZONE_CO_BOSSES,
  BOSS_LIST,
  getZoneBoss,
  createEnemyInstanceData,
  generateWaveSpawns,
  getWavePreviewInfo
} from './enemies.js?v=20261121r';

export {
  CAMPAIGN_ZONES,
  CAMPAIGN_LEVELS,
  MAP_DEFINITIONS,
  getLevelById,
  renderMapThemeDecorations
} from './maps.js?v=20261121r';

export {
  buildTaskReviewSummary,
  createKnowledgeGateSession,
  EduTaskGenerator,
  eduTaskGenerator,
  renderTaskVisual
} from './edu_tasks.js?v=20261121r';

export const STARTING_HEARTS = 20;
export const VETERAN_HEARTS = 10;
export const VETERAN_ENEMY_HP_MULTIPLIER = 1.35;
export const SELL_REFUND_RATE = 0.75; // 75% investuotų monetų grąžinimas
export const INTER_WAVE_COOLDOWN_SECONDS = 14;
export const MAX_WAVES_PER_MAP = 10;

// ==================== IŠRADIMŲ MEDIS (STAR TECH TREE) ====================
export const STAR_TECH_CATALOG = [
  {
    id: 'solar_efficiency',
    name: 'Saulės efektyvumas',
    icon: '☀️',
    maxRank: 3,
    costs: [2, 3, 5],
    desc: '+10% / +20% / +30% pradinio aukso kiekvieno lygio pradžioje',
    rankLabels: ['+10% pradinio aukso', '+20% pradinio aukso', '+30% pradinio aukso']
  },
  {
    id: 'sturdy_barracks',
    name: 'Tvirtesni barakai',
    icon: '🤖',
    maxRank: 3,
    costs: [2, 4, 6],
    desc: '+25% / +45% / +65% robotų-vejapjovių gyvybių (HP)',
    rankLabels: ['+25% robotų gyvybių', '+45% robotų gyvybių', '+65% robotų gyvybių']
  },
  {
    id: 'better_acoustics',
    name: 'Geresnė akustika',
    icon: '🎵',
    maxRank: 3,
    costs: [2, 4, 6],
    desc: '+15% / +25% / +35% „Dagilėlio“ garso bokšto nuotolio',
    rankLabels: ['+15% „Dagilėlio“ nuotolio', '+25% „Dagilėlio“ nuotolio', '+35% „Dagilėlio“ nuotolio']
  },
  {
    id: 'drone_turbine',
    name: 'Dronų turbina',
    icon: '🚁',
    maxRank: 3,
    costs: [2, 4, 6],
    desc: '+20% / +35% / +50% dronų skridimo ir šaudymo greičio',
    rankLabels: ['+20% dronų greičio', '+35% dronų greičio', '+50% dronų greičio']
  },
  {
    id: 'emergency_battery',
    name: 'Avarinė baterija',
    icon: '❤️',
    maxRank: 2,
    costs: [3, 6],
    desc: '+5 / +10 papildomų širdelių įprastu režimu (iki 30 ❤️)',
    rankLabels: ['+5 širdelės pradžioje', '+10 širdelių pradžioje']
  },
  {
    id: 'laser_overclock',
    name: 'Lazerio lęšiai',
    icon: '🔆',
    maxRank: 3,
    costs: [4, 6, 8],
    desc: '+10% / +20% / +30% Saulės Lazerio daromos žalos prieš šarvus ir bosus',
    rankLabels: ['+10% Lazerio žalos', '+20% Lazerio žalos', '+30% Lazerio žalos']
  },
  {
    id: 'catapult_payload',
    name: 'Sunkios šilauogės',
    icon: '🫐',
    maxRank: 3,
    costs: [4, 6, 8],
    desc: '+10% / +20% / +30% Šilauogių Katapultos sprogimo žalos',
    rankLabels: ['+10% Katapultos žalos', '+20% Katapultos žalos', '+30% Katapultos žalos']
  }
];

export function createDefaultTechTree() {
  const tree = {};
  for (const item of STAR_TECH_CATALOG) {
    tree[item.id] = 0;
  }
  return tree;
}

export function normalizeTechTree(raw) {
  const tree = createDefaultTechTree();
  if (raw && typeof raw === 'object') {
    for (const item of STAR_TECH_CATALOG) {
      const rank = Math.max(0, Math.min(item.maxRank, Math.floor(Number(raw[item.id]) || 0)));
      tree[item.id] = rank;
    }
  }
  return tree;
}

export function computeSpentTechStars(techTree) {
  const norm = normalizeTechTree(techTree);
  let spent = 0;
  for (const item of STAR_TECH_CATALOG) {
    const rank = norm[item.id] || 0;
    for (let i = 0; i < rank; i++) {
      spent += item.costs[i] || 0;
    }
  }
  return spent;
}

export function computeAvailableTechStars(totalStars, techTree) {
  return Math.max(0, (Number(totalStars) || 0) - computeSpentTechStars(techTree));
}

export function getTechModifiers(techTree) {
  const norm = normalizeTechTree(techTree);
  const mowerBonuses = [0, 0.25, 0.45, 0.65];
  const acousticBonuses = [0, 0.15, 0.25, 0.35];
  const droneBonuses = [0, 0.20, 0.35, 0.50];
  return {
    startingCoinsBonusPct: norm.solar_efficiency * 0.1,
    mowerHpMultiplier: 1 + (mowerBonuses[norm.sturdy_barracks] || 0),
    dagilelisRangeMultiplier: 1 + (acousticBonuses[norm.better_acoustics] || 0),
    droneSpeedMultiplier: 1 + (droneBonuses[norm.drone_turbine] || 0),
    bonusHearts: norm.emergency_battery * 5,
    laserDamageMultiplier: 1 + norm.laser_overclock * 0.1,
    catapultDamageMultiplier: 1 + norm.catapult_payload * 0.1
  };
}

export const PROFILE_MODIFIERS = {
  linas: {
    id: 'linas',
    label: 'Linas (1 klasė)',
    startingCoinsMultiplier: 1.15, // +15% daugiau pradinių monetų nei 3 kl.
    enemyHpMultiplier: 1.0125, // ~25% mažiau HP nei 3 kl. (1.0125 / 1.35 = 0.75)
    badgeText: '1 kl. balansas: +15% pradinių monetų • -25% priešų HP'
  },
  lukas: {
    id: 'lukas',
    label: 'Lukas (3 klasė)',
    startingCoinsMultiplier: 1.0,
    enemyHpMultiplier: 1.35,
    badgeText: '3 kl. balansas: stratego iššūkis (+35% priešų HP)'
  }
};

export function getProfileModifier(profileId) {
  return profileId === 'linas' ? PROFILE_MODIFIERS.linas : PROFILE_MODIFIERS.lukas;
}

export function getStartingCoins(baseCoins, profileId, techTree = null) {
  const mod = getProfileModifier(profileId);
  const tech = getTechModifiers(techTree);
  return Math.round((Number(baseCoins) || 200) * mod.startingCoinsMultiplier * (1 + tech.startingCoinsBonusPct));
}

export function getStartingHearts(techTree = null, veteranMode = false) {
  if (veteranMode) return VETERAN_HEARTS;
  const tech = getTechModifiers(techTree);
  return STARTING_HEARTS + tech.bonusHearts;
}

export function getScaledEnemyHp(baseHp, waveNumber, profileId) {
  const mod = getProfileModifier(profileId);
  const w = Math.max(1, Number(waveNumber) || 1);
  // Progresyvi Kingdom Rush / BTD6 HP kreivė pagal bangos numerį
  const waveScale = 1 + (w - 1) * 0.24 + Math.pow(Math.max(0, w - 3), 1.22) * 0.055;
  return Math.max(10, Math.round(baseHp * waveScale * mod.enemyHpMultiplier));
}

export function computeSellRefund(totalInvestedCoins) {
  return Math.round((Number(totalInvestedCoins) || 0) * SELL_REFUND_RATE);
}

export function computeEarlyWaveBonus(remainingCooldownSeconds, nextWaveNumber) {
  const rem = Math.max(0, Number(remainingCooldownSeconds) || 0);
  if (rem <= 0.25) return 0;
  const w = Math.max(1, Number(nextWaveNumber) || 1);
  return Math.max(0, Math.round(rem * (1.8 + w * 0.35)));
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

// (Žemėlapiai perkelti į ./maps.js)
