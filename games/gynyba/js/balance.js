// ==================== BUBIŲ TVIRTOVĖ: EKONOMIKOS, BALANSO IR ŽEMĖLAPIŲ MATEMATIKA ====================
// Parengta pagal Kingdom Rush ir Bloons TD 6 strateginius standartus.

export {
  TOWER_CATALOG,
  TOWER_LIST,
  getTowerStats,
  getUpgradeCost,
  getTowerEvolutions,
  findNearestPathPoint
} from './towers.js?v=20261121p';

export {
  ENEMY_ARCHETYPES,
  ENEMY_LIST,
  ZONE_BOSSES,
  BOSS_LIST,
  getZoneBoss,
  createEnemyInstanceData,
  generateWaveSpawns,
  getWavePreviewInfo
} from './enemies.js?v=20261121p';

export {
  CAMPAIGN_ZONES,
  CAMPAIGN_LEVELS,
  MAP_DEFINITIONS,
  getLevelById,
  renderMapThemeDecorations
} from './maps.js?v=20261121p';

export {
  buildTaskReviewSummary,
  createKnowledgeGateSession,
  EduTaskGenerator,
  eduTaskGenerator,
  renderTaskVisual
} from './edu_tasks.js?v=20261121p';

export const STARTING_HEARTS = 20;
export const SELL_REFUND_RATE = 0.75; // 75% investuotų monetų grąžinimas
export const INTER_WAVE_COOLDOWN_SECONDS = 14;
export const MAX_WAVES_PER_MAP = 10;

// ==================== IŠRADIMŲ MEDIS (STAR TECH TREE) ====================
export const STAR_TECH_CATALOG = [
  {
    id: 'solar_efficiency',
    name: 'Saulės efektyvumas',
    icon: '☀️',
    maxRank: 2,
    costs: [2, 3],
    desc: '+10% / +20% pradinio aukso kiekvieno lygio pradžioje',
    rankLabels: ['+10% pradinio aukso', '+20% pradinio aukso']
  },
  {
    id: 'sturdy_barracks',
    name: 'Tvirtesni barakai',
    icon: '🤖',
    maxRank: 1,
    costs: [2],
    desc: '+25% robotų-vejapjovių gyvybių (HP)',
    rankLabels: ['+25% robotų gyvybių']
  },
  {
    id: 'better_acoustics',
    name: 'Geresnė akustika',
    icon: '🎵',
    maxRank: 1,
    costs: [2],
    desc: '+15% „Dagilėlio“ garso bokšto nuotolio',
    rankLabels: ['+15% „Dagilėlio“ nuotolio']
  },
  {
    id: 'drone_turbine',
    name: 'Dronų turbina',
    icon: '🚁',
    maxRank: 1,
    costs: [2],
    desc: '+20% dronų skridimo ir šaudymo greičio',
    rankLabels: ['+20% dronų greičio']
  },
  {
    id: 'emergency_battery',
    name: 'Avarinė baterija',
    icon: '❤️',
    maxRank: 1,
    costs: [3],
    desc: '+5 papildomos širdelės kiekviename lygyje (iš viso 25 ❤️)',
    rankLabels: ['+5 širdelės pradžioje']
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
  return {
    startingCoinsBonusPct: norm.solar_efficiency * 0.1,
    mowerHpMultiplier: 1 + (norm.sturdy_barracks > 0 ? 0.25 : 0),
    dagilelisRangeMultiplier: 1 + (norm.better_acoustics > 0 ? 0.15 : 0),
    droneSpeedMultiplier: 1 + (norm.drone_turbine > 0 ? 0.2 : 0),
    bonusHearts: norm.emergency_battery > 0 ? 5 : 0
  };
}

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

export function getStartingCoins(baseCoins, profileId, techTree = null) {
  const mod = getProfileModifier(profileId);
  const tech = getTechModifiers(techTree);
  return Math.round((Number(baseCoins) || 200) * mod.startingCoinsMultiplier * (1 + tech.startingCoinsBonusPct));
}

export function getStartingHearts(techTree = null) {
  const tech = getTechModifiers(techTree);
  return STARTING_HEARTS + tech.bonusHearts;
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

// (Žemėlapiai perkelti į ./maps.js)
