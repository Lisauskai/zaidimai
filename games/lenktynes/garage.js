// ==================== IŠSAMUS GARAŽAS (AUTOMOBILIŲ SALONAS, 7 GINKLAI, PADANGŲ FIZIKA, 50 LYG. MIKRO-TOBULINIMAI) ====================
// Saugoma atskiruose localStorage raktuose: 'lenktynes_save_linas' ir 'lenktynes_save_lukas'

export const SAVE_KEYS = {
  linas: 'lenktynes_save_linas',
  lukas: 'lenktynes_save_lukas',
  activeDriver: 'lenktynes_active_driver'
};

// BENDRI (GLOBALŪS) PORTALO LAIKO RAKTAI VISIEMS ŽAIDIMAMS KARTU!
export const GLOBAL_TIME_KEYS = {
  linas: 'bosas_global_time_linas',
  lukas: 'bosas_global_time_lukas'
};

export const DEFAULT_DAILY_TIME_LIMIT_SECONDS = 1200; // 20 minučių (1200 s)
export const MAX_MICRO_UPGRADE_LEVEL = 50;
export const MAX_PART_LEVEL = 50;

export function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadGlobalPlaytime(driverKey) {
  const safeKey = driverKey === 'lukas' ? 'lukas' : 'linas';
  const storageKey = GLOBAL_TIME_KEYS[safeKey];
  const today = getTodayDateString();

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.lastPlayedDate !== today) {
          const fresh = {
            lastPlayedDate: today,
            timePlayedTodaySeconds: 0,
            dailyTimeLimitSeconds: DEFAULT_DAILY_TIME_LIMIT_SECONDS
          };
          localStorage.setItem(storageKey, JSON.stringify(fresh));
          return fresh;
        }
        return {
          lastPlayedDate: today,
          timePlayedTodaySeconds: Math.max(0, Number(parsed.timePlayedTodaySeconds) || 0),
          dailyTimeLimitSeconds: Math.max(60, Number(parsed.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS)
        };
      }
    }

    const rpgKey = safeKey === 'linas' ? 'skaiciu_karalyste_save_linas_v2' : 'skaiciu_karalyste_save_lukas_v2';
    const rawRpg = localStorage.getItem(rpgKey);
    if (rawRpg) {
      const rpgProf = JSON.parse(rawRpg);
      if (rpgProf && rpgProf.lastPlayedDate === today) {
        const migrated = {
          lastPlayedDate: today,
          timePlayedTodaySeconds: Math.max(0, Number(rpgProf.timePlayedTodaySeconds) || 0),
          dailyTimeLimitSeconds: Math.max(60, Number(rpgProf.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS)
        };
        localStorage.setItem(storageKey, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (e) {
    // Ignoruojame localStorage klaidas
  }

  const initial = {
    lastPlayedDate: today,
    timePlayedTodaySeconds: 0,
    dailyTimeLimitSeconds: DEFAULT_DAILY_TIME_LIMIT_SECONDS
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(initial));
  } catch (e) {
    // Ignoruojame
  }
  return initial;
}

export function saveGlobalPlaytime(driverKey, timeData) {
  const safeKey = driverKey === 'lukas' ? 'lukas' : 'linas';
  const storageKey = GLOBAL_TIME_KEYS[safeKey];
  const today = getTodayDateString();
  const payload = {
    lastPlayedDate: timeData.lastPlayedDate || today,
    timePlayedTodaySeconds: Math.max(0, Number(timeData.timePlayedTodaySeconds) || 0),
    dailyTimeLimitSeconds: Math.max(60, Number(timeData.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS)
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (e) {
    // Ignoruojame
  }
  return payload;
}

export function getRemainingPlaytimeSeconds(driverKey) {
  const data = loadGlobalPlaytime(driverKey);
  return Math.max(0, data.dailyTimeLimitSeconds - data.timePlayedTodaySeconds);
}

// ==================== 1 PUNKTAS: TRASŲ TEMŲ (BIOMES) IR FIZIKOS MULTIPLIERS SISTEMA ====================
export const BIOMES = {
  city_asphalt: {
    id: 'city_asphalt',
    name: '🏙️ Miestas / Asfaltas',
    shortTitle: 'Miestas / Asfaltas',
    surfaceLabel: 'Grip: 1.0 • Greitis: 1.0 • Veja',
    gripMult: 1.0,
    speedMult: 1.0,
    accelMult: 1.0,
    bgTile1: '#14532d',
    bgTile2: 'rgba(22, 101, 52, 0.55)',
    trackColor: '#334155',
    trackEdge1: '#ffffff',
    trackEdge2: '#dc2626',
    wallColor: '#78350f',
    wallStripe: '#ef4444',
    islandColor: '#15803d',
    bannerText: '🏙️ MIESTO ASFALTO ARENA 🏁'
  },
  winter_snow: {
    id: 'winter_snow',
    name: '❄️ Žiema / Sniegas',
    shortTitle: 'Žiema / Ledo trasa',
    surfaceLabel: 'Grip: 0.4 • Greitis: 0.9 • Sniegas',
    gripMult: 0.4,
    speedMult: 0.9,
    accelMult: 0.85,
    bgTile1: '#e2e8f0',
    bgTile2: 'rgba(186, 230, 253, 0.55)',
    trackColor: '#64748b',
    trackEdge1: '#ffffff',
    trackEdge2: '#0284c7',
    wallColor: '#334155',
    wallStripe: '#38bdf8',
    islandColor: '#cbd5e1',
    bannerText: '❄️ LEDO IR SNIEGO ARENA ☃️'
  },
  desert_sand: {
    id: 'desert_sand',
    name: '🏜️ Dykuma / Smėlis',
    shortTitle: 'Dykuma / Smėlynai',
    surfaceLabel: 'Grip: 0.8 • Greitis: 0.7 • Dulkės',
    gripMult: 0.8,
    speedMult: 0.7,
    accelMult: 0.7,
    bgTile1: '#d97706',
    bgTile2: 'rgba(234, 179, 8, 0.45)',
    trackColor: '#9a3412',
    trackEdge1: '#fef08a',
    trackEdge2: '#b45309',
    wallColor: '#78350f',
    wallStripe: '#ea580c',
    islandColor: '#b45309',
    bannerText: '🏜️ DYKUMOS SMĖLIO ARENA 🌵'
  }
};

export function normalizeTrackId(id) {
  if (id === 'asphalt_ring') return 'city_asphalt';
  if (id === 'mud_arena') return 'desert_sand';
  if (id === 'city_asphalt' || id === 'winter_snow' || id === 'desert_sand' || id === 'random_biome') return id;
  return 'city_asphalt';
}

export const TRACK_TYPES = [
  {
    id: 'city_asphalt',
    name: '🏙️ Miestas / Klasikinis Žiedas',
    shortTitle: 'Miestas / Žiedas',
    layout: 'ring',
    surfaceLabel: 'Grip: 1.0 • S-Vingiai • Tramplinai',
    bestTiresHint: 'Subalansuotas valdymas. Sportinė mašina su „Slick“ padangomis čia pasiekia rekordą!',
    desc: 'Klasikinis Grand Prix žiedas su švelniais S-vingiais, greičio tramplinais tiesiosiose ir purvo kirtimu per parką.',
    bossTicketPrice: 0
  },
  {
    id: 'winter_snow',
    name: '❄️ Žiema / Ledo Zigzagas',
    shortTitle: 'Žiema / Zigzagas',
    layout: 'zigzag',
    surfaceLabel: 'Grip: 0.4 • 90°/180° Posūkiai • Šuoliai',
    bestTiresHint: 'Didelis slydimas! Sunkvežimis slysta mažiausiai, Sportinė – labiausiai.',
    desc: 'Slidi ledo trasa su ilgomis tiesiosiomis ir aštriais 90°/180° posūkiais! Šokinėk per tramplinus ir kirsk per pusnis su Tanku.',
    bossTicketPrice: 2000
  },
  {
    id: 'desert_sand',
    name: '🏜️ Dykuma / Bulių Aštuoniukė',
    shortTitle: 'Dykuma / Aštuoniukė',
    layout: 'figure8',
    surfaceLabel: 'Grip: 0.8 • ♾️ Susikirtimas Centre',
    bestTiresHint: 'Klampus smėlis! Lengvasis Bagis ignoruoja baudą (greitis 1.0).',
    desc: 'Bulių kautynių aštuoniukė! Trasa susikerta centre (garantuotos avarijos!), tramplinas virš susikirtimo ir kopų kirtimai.',
    bossTicketPrice: 3000
  },
  {
    id: 'random_biome',
    name: '🎲 Atsitiktinė Trasa (Random)',
    shortTitle: 'Atsitiktinė Trasa',
    layout: 'random',
    surfaceLabel: 'Atrakintos trasos ir geometrijos',
    bestTiresHint: 'Sistema atsitiktinai parinks vieną iš TAVO ATRAKINTŲ trasų!',
    desc: 'Išbandyk visas savo atrakintas dangas ir geometrijas atsitiktine tvarka! Trasa ir forma nustatoma starto metu.',
    bossTicketPrice: 0
  }
];

// ==================== 50 LYGIŲ MIKRO-TOBULINIMAI (ILGALAIKĖ PROGRESIJA) ====================
export const MICRO_UPGRADES = [
  {
    id: 'engine',
    name: 'Variklis (Greitis)',
    icon: '⚡',
    perLevelPct: 1.0,
    unitLabel: '% maks. greičio',
    baseCost: 120,
    growth: 1.095,
    desc: 'Didina variklio sūkius ir turbinos slėgį (+1% maksimalaus greičio už kiekvieną lygį).'
  },
  {
    id: 'armor',
    name: 'Šarvai (HP)',
    icon: '🛡️',
    perLevelPct: 2.0,
    unitLabel: '% gyvybių (HP)',
    baseCost: 110,
    growth: 1.09,
    desc: 'Sustiprina bolido rėmą plieno plokštėmis (+2% maksimalių gyvybių už kiekvieną lygį).'
  },
  {
    id: 'ram',
    name: 'Taranas (Smūgio žala)',
    icon: '💥',
    perLevelPct: 1.5,
    unitLabel: '% trankymosi žalos',
    baseCost: 130,
    growth: 1.095,
    desc: 'Sunkina priekinį tiltą ir hidrauliką (+1.5% taranavimo žalos už kiekvieną lygį).'
  },
  {
    id: 'weapons',
    name: 'Ginklai (Šaudymo žala)',
    icon: '🔫',
    perLevelPct: 1.0,
    unitLabel: '% ginklų žalos',
    baseCost: 140,
    growth: 1.1,
    desc: 'Tobulina stogo ginkluotės kalibrą ir sprogmenis (+1% šaudymo žalos už kiekvieną lygį).'
  }
];

export function getMicroUpgradePrices(upgradeDef, currentLevel) {
  const lvl = Math.max(0, Math.min(MAX_MICRO_UPGRADE_LEVEL, Number(currentLevel) || 0));
  const fullPrice = Math.round(upgradeDef.baseCost * Math.pow(upgradeDef.growth, lvl));
  const discountPrice = Math.max(40, Math.round(fullPrice * 0.4)); // -60% nuolaida su Mechaniko iššūkiu!
  return { fullPrice, discountPrice };
}

/**
 * 2 PUNKTAS: Apskaičiuoja žaidėjo bendrą galios lygį (Power Level)
 * Susumuoja variklio, šarvų, tarano ir ginklų mikro-tobulinimo lygius!
 */
export function calculatePlayerPowerLevel(profile) {
  if (!profile) return 0;
  const micro = profile.microUpgrades || {};
  const e = Number(micro.engine) || 0;
  const a = Number(micro.armor) || 0;
  const r = Number(micro.ram) || 0;
  const w = Number(micro.weapons) || 0;

  let partLevelsSum = 0;
  if (profile.parts && profile.equipped) {
    for (const slot of ['bumper', 'roof', 'wheels']) {
      const eqId = profile.equipped[slot];
      const st = profile.parts[eqId];
      if (st && st.owned && st.level > 1) {
        partLevelsSum += st.level - 1;
      }
    }
  }
  return e + a + r + w + partLevelsSum;
}

// ==================== DETALIŲ IR GINKLŲ LYGIŲ SKAIČIAVIMO FUNKCIJOS ====================
/**
 * Eksponentinis tobulinimo kainos augimas:
 * Level 1 pirkimas = basePrice (arba 0 pradinėms detalėms).
 * Tobulinimas į Level (currentLevel + 1) = Math.floor(basePrice * Math.pow(1.15, currentLevel))
 */
export function getPartUpgradePrice(part, currentLevel) {
  if (!part) return 0;
  const lvl = Math.max(0, Number(currentLevel) || 0);
  if (lvl === 0) {
    return part.fullPrice || 0;
  }
  const basePrice = part.upgradeBasePrice || part.fullPrice || 300;
  return Math.floor(basePrice * Math.pow(1.15, lvl));
}

/**
 * Vizualinės evoliucijos pakopos (Visual Progression Tiers) pagal detalės lygį:
 * - Tier 1 (Lygis 1–9): Bazinė išvaizda
 * - Tier 2 (Lygis 10–19): „Patobulintas“ (masyvesnis, papildomi vamzdžiai/ragai)
 * - Tier 3 (Lygis 20–29): „Elitinis“ (ryškūs auksiniai/raudoni/neoniniai akcentai)
 * - Tier 4 (Lygis 30+): „Legendinis“ (maksimalus dydis + švytinti aura ir dūmų partikulai)
 */
export function getVisualTierInfo(level = 1) {
  const lvl = Math.max(1, Number(level) || 1);
  if (lvl >= 30) {
    return {
      tier: 4,
      title: 'Tier 4 (Legendinis)',
      shortLabel: 'Tier 4 • Legendinis',
      nextTierLevel: null,
      levelsToNextTier: 0,
      color: '#f43f5e'
    };
  }
  if (lvl >= 20) {
    return {
      tier: 3,
      title: 'Tier 3 (Elitinis)',
      shortLabel: 'Tier 3 • Elitinis',
      nextTierLevel: 30,
      levelsToNextTier: 30 - lvl,
      color: '#facc15'
    };
  }
  if (lvl >= 10) {
    return {
      tier: 2,
      title: 'Tier 2 (Patobulintas)',
      shortLabel: 'Tier 2 • Patobulintas',
      nextTierLevel: 20,
      levelsToNextTier: 20 - lvl,
      color: '#38bdf8'
    };
  }
  return {
    tier: 1,
    title: 'Tier 1 (Bazinis)',
    shortLabel: 'Tier 1 • Bazinis',
    nextTierLevel: 10,
    levelsToNextTier: 10 - lvl,
    color: '#94a3b8'
  };
}

/**
 * Grąžina detalės (Ginklo, Bamperio, Padangų) rodiklius nurodytame lygyje (1..50):
 * - Ginklai (roof): Level 1 daro mažą žalą ir turi ilgą Cooldown; keliant lygį žala auga +2%/lyg., o atvėsimo laikas mažėja.
 * - Bamperiai (bumper): Level 1 duoda minimalią smūgio žalą; keliant lygį didėja taranavimo daugiklis ir pridedama bazinio HP.
 * - Padangos (wheels): Mažiausi žingsniai – nežymiai gerėja Grip (+0.15%/lyg.) ir pridedamas +0.5%/lyg. maksimalaus greičio bonusas.
 */
export function getPartStatsAtLevel(part, level = 1) {
  const lvl = Math.max(1, Math.min(MAX_PART_LEVEL, Number(level) || 1));
  const extraLvls = lvl - 1;

  if (!part) return { level: lvl };

  if (part.slot === 'roof') {
    if (part.weaponType === 'none') {
      return {
        level: lvl,
        damage: 0,
        cooldownFrames: 0,
        cooldownSec: 0,
        bonusHp: 0
      };
    }
    // +2% žalos už kiekvieną lygį virš 1 (pvz., 10 -> 10.2 -> 10.4...)
    const damage = Number(((part.baseDamage || 2) * (1 + extraLvls * 0.02)).toFixed(2));
    // Atvėsimo laikas mažėja ~1.6% už kiekvieną lygį (iki saugios ribos)
    const rawFrames = (part.cooldownFrames || 90) * Math.pow(0.984, extraLvls);
    const minFrames = Math.max(3, (part.cooldownFrames || 90) * 0.38);
    const cooldownFrames = Math.max(minFrames, rawFrames);
    const cooldownSec = Number((cooldownFrames / 60).toFixed(2));
    const bonusHp = Math.round((part.bonusHp || 0) + extraLvls * 0.5);
    return {
      level: lvl,
      damage,
      cooldownFrames,
      cooldownSec,
      bonusHp
    };
  }

  if (part.slot === 'bumper') {
    const ramStep = part.ramPerLevel || 0.018;
    const hpStep = part.hpPerLevel || 2;
    const ramMult = Number(((part.ramMult || 1.0) + extraLvls * ramStep).toFixed(3));
    const bonusHp = Math.round((part.bonusHp || 0) + extraLvls * hpStep);
    const selfDmgReduction = Math.min(0.65, (part.selfDmgReduction || 0) + extraLvls * 0.004);
    return {
      level: lvl,
      ramMult,
      bonusHp,
      selfDmgReduction
    };
  }

  if (part.slot === 'wheels') {
    // Padangos: patys mažiausi tobulinimo žingsniai!
    // +0.5% maksimalaus greičio bonusas už kiekvieną lygį ir +0.0015 (+0.15%) Grip už lygį
    const speedBonusPct = Number((extraLvls * 0.5).toFixed(1));
    const speedBonusMult = 1 + extraLvls * 0.005;
    const gripBonus = extraLvls * 0.0015;
    const asphaltGrip = Math.min(0.985, Number(((part.asphaltGrip || 0.86) + gripBonus).toFixed(4)));
    const mudGrip = Math.min(0.98, Number(((part.mudGrip || 0.78) + gripBonus).toFixed(4)));
    const asphaltSpeedMult = Number(((part.asphaltSpeedMult || 1.0) * speedBonusMult).toFixed(4));
    const mudSpeedMult = Number(((part.mudSpeedMult || 0.76) * speedBonusMult).toFixed(4));
    const sideBladeDamage = part.sideBladeDamage
      ? Number((part.sideBladeDamage * (1 + extraLvls * 0.015)).toFixed(1))
      : 0;
    return {
      level: lvl,
      speedBonusPct,
      speedBonusMult,
      asphaltGrip,
      mudGrip,
      asphaltSpeedMult,
      mudSpeedMult,
      sideBladeDamage
    };
  }

  return { level: lvl };
}

// ==================== TIUNINGO IR AUTOMOBILIŲ SALONO KATALOGAS ====================
export const TUNING_CATALOG = {
  // 1 PUNKTAS: KĖBULŲ KLASĖS (VEHICLE CLASSES) – AUTOMOBILIŲ SALONAS
  chassis: [
    {
      id: 'chassis_buggy',
      slot: 'chassis',
      name: '1. Lengvasis Bagis (Buggy)',
      shortName: 'Lengvasis Bagis',
      icon: '🛺',
      fullPrice: 0,
      discountPrice: 0,
      baseHp: 85,
      asphaltSpeedMult: 1.0,
      mudSpeedBonus: 1.24, // kompensuoja purvo lėtėjimą – nepraranda greičio purve!
      ignoresMudSlowdown: true,
      mudGripBonus: 0.12,
      accelMult: 1.06,
      turnMult: 1.15,
      ramClassMult: 0.75,
      mass: 0.85,
      collisionRadius: 24,
      desc: 'Atviras vamzdinis smėlio ir purvo bagis! Puikus valdomumas, nepraranda greičio purve (Off-road), bet turi mažai HP (85) ir daro mažesnę taranavimo žalą.',
      statsBadge: '❤️ 85 HP • 🚜 Purve: 100% greitis • 💥 Taranas: 0.75x'
    },
    {
      id: 'chassis_sports',
      slot: 'chassis',
      name: '2. Sportinė Mašina (Sports Car)',
      shortName: 'Sportinė Mašina',
      icon: '🏎️',
      fullPrice: 1600,
      discountPrice: 640,
      baseHp: 75,
      asphaltSpeedMult: 1.18, // didžiausias maksimalus greitis ant asfalto!
      mudSpeedBonus: 0.68, // stipriai lėtėja purve
      ignoresMudSlowdown: false,
      mudGripBonus: -0.10, // slysta purve!
      accelMult: 1.05,
      turnMult: 1.08,
      ramClassMult: 0.85,
      mass: 0.92,
      collisionRadius: 25,
      desc: 'Aerodinaminis asfalto superbolidas! Didžiausias maksimalus greitis ant asfalto (+18%), tačiau slysta purve ir turi mažiausiai HP (75).',
      statsBadge: '❤️ 75 HP • 🏎️ Asfaltas: +18% greitis • ⚠️ Slysta purve'
    },
    {
      id: 'chassis_truck',
      slot: 'chassis',
      name: '3. Šarvuotas Sunkvežimis (Armored Truck)',
      shortName: 'Šarvuotas Sunkvežimis',
      icon: '🚛',
      fullPrice: 2800,
      discountPrice: 1120,
      baseHp: 220, // milžiniškas HP kiekis!
      asphaltSpeedMult: 0.80,
      mudSpeedBonus: 0.95,
      ignoresMudSlowdown: false,
      mudGripBonus: 0.08,
      accelMult: 0.65, // lėtas įsibėgėjimas
      turnMult: 0.88,
      ramClassMult: 3.0, // x3 TARANAVIMO ŽALA!
      mass: 1.9,
      collisionRadius: 30,
      desc: 'Sunkusis šarvuotas monstras! Lėtas įsibėgėjimas ir mažesnis greitis, bet turi milžinišką 220 HP šarvų kiekį ir daro net ×3 TARANAVIMO ŽALĄ!',
      statsBadge: '❤️ 220 HP • 💥 ×3 TARANO ŽALA! • 🐢 Sunkus ir lėtas'
    }
  ],

  // BAMPERIAI (PRIEKIS): Level 1 duoda tik minimalią papildomą smūgio žalą; tobulinant auga taranavimo daugiklis ir bazinis HP
  bumper: [
    {
      id: 'bumper_stock',
      shortKey: 'stock_bumper',
      slot: 'bumper',
      upgradeable: true,
      name: 'Gamyklinis Bamperis',
      icon: '🚘',
      fullPrice: 0,
      upgradeBasePrice: 240,
      discountPrice: 0,
      ramMult: 1.0,
      ramPerLevel: 0.012,
      bonusHp: 0,
      hpPerLevel: 1.5,
      selfDmgReduction: 0.02,
      desc: 'Standartinis gamyklinis bamperis. Tobulinant stiprėja jo rėmo tvirtumas, smūgio žala ir pridedama papildomų HP.',
      statsBadge: 'Bazinis smūgis (1.00x)'
    },
    {
      id: 'bumper_plow',
      shortKey: 'plow',
      slot: 'bumper',
      upgradeable: true,
      name: 'Sniego Valytuvas',
      icon: '🚜',
      fullPrice: 550,
      upgradeBasePrice: 550,
      discountPrice: 220,
      ramMult: 1.06,
      ramPerLevel: 0.018,
      bonusHp: 5,
      hpPerLevel: 2,
      selfDmgReduction: 0.1,
      desc: 'Platus plieninis buldozerio peilis priekyje! Pradiniame lygyje prideda nedaug žalos, bet gali būti tobulinamas iki 50 lygio.',
      statsBadge: 'Smūgis: 1.06x • +5 HP (Level 1)'
    },
    {
      id: 'bumper_spikes',
      shortKey: 'spikes',
      slot: 'bumper',
      upgradeable: true,
      name: 'Plieniniai Spygliai',
      icon: '🦔',
      fullPrice: 950,
      upgradeBasePrice: 950,
      discountPrice: 380,
      ramMult: 1.12,
      ramPerLevel: 0.022,
      bonusHp: 8,
      hpPerLevel: 2.5,
      selfDmgReduction: 0.15,
      desc: 'Grūdinto plieno spygliai priekyje. Keliant lygį spygliai ilgėja, didėja taranavimo žala ir pridedama HP!',
      statsBadge: 'Smūgis: 1.12x • +8 HP (Level 1)'
    },
    {
      id: 'bumper_train',
      shortKey: 'train_ram',
      slot: 'bumper',
      upgradeable: true,
      name: 'Traukinio Taranas',
      icon: '🚂',
      fullPrice: 1650,
      upgradeBasePrice: 1650,
      discountPrice: 660,
      ramMult: 1.18,
      ramPerLevel: 0.028,
      bonusHp: 12,
      hpPerLevel: 3.5,
      selfDmgReduction: 0.22,
      desc: 'Sunkus V formos lokomotyvo taranas! Kiekvienas tobulinimo lygis ženkliai didina taranavimo daugiklį ir šarvų HP.',
      statsBadge: 'Smūgis: 1.18x • +12 HP (Level 1)'
    }
  ],

  // STOGO GINKLAI: Level 1 daro mažą žalą ir turi ilgą Cooldown; keliant lygį (+2% žalos/lyg.) ir trumpėja Cooldown!
  roof: [
    {
      id: 'roof_none',
      shortKey: 'none',
      slot: 'roof',
      upgradeable: false,
      name: 'Be Ginklo (Tuščias Stogas)',
      icon: '🚗',
      fullPrice: 0,
      discountPrice: 0,
      weaponType: 'none',
      cooldownFrames: 0,
      baseDamage: 0,
      bonusHp: 0,
      desc: 'Paprastas bolido stogas be sumontuoto ginklo.',
      statsBadge: 'Nėra ginklo'
    },
    {
      id: 'weapon_minigun',
      shortKey: 'minigun',
      slot: 'roof',
      upgradeable: true,
      name: '1. Kulkosvaidis (Minigun)',
      icon: '🔫',
      fullPrice: 500,
      upgradeBasePrice: 500,
      discountPrice: 200,
      weaponType: 'minigun',
      cooldownFrames: 18, // 0.30s pradiniame Level 1
      baseDamage: 2.0, // maža pradinė žala (Level 1)
      bonusHp: 4,
      desc: 'Sukamasis kulkosvaidis! Level 1 daro nedidelę žalą, bet keliant lygį (+2% žalos/lyg.) tampa tikra kulkų audra.',
      statsBadge: 'Žala: 2 • Atvėsimas: 0.30s (Level 1)'
    },
    {
      id: 'weapon_shotgun',
      shortKey: 'shotgun',
      slot: 'roof',
      upgradeable: true,
      name: '2. Šratinis (Shotgun)',
      icon: '💥',
      fullPrice: 750,
      upgradeBasePrice: 750,
      discountPrice: 300,
      weaponType: 'shotgun',
      cooldownFrames: 96, // 1.60s pradiniame Level 1
      baseDamage: 3.0, // 5 šratai × 3 DMG pradiniame lygyje
      bonusHp: 6,
      desc: 'Dvigubas šratinis vamzdis (5 šratai plačiu kampu). Tobulinant auga kiekvieno šrato žala ir greitėja užtaisymas!',
      statsBadge: 'Žala: 3 (×5) • Atvėsimas: 1.60s (Level 1)'
    },
    {
      id: 'weapon_flamethrower',
      shortKey: 'flamethrower',
      slot: 'roof',
      upgradeable: true,
      name: '3. Liepsnasvaidis (Flamethrower)',
      icon: '🔥',
      fullPrice: 950,
      upgradeBasePrice: 950,
      discountPrice: 380,
      weaponType: 'flamethrower',
      cooldownFrames: 10, // 0.17s pradiniame Level 1
      baseDamage: 1.0,
      bonusHp: 6,
      desc: 'Trumpo atstumo ugnies srovė! Keliant lygį liepsna tampa kaitresnė (+2% žalos/lyg.) ir tankesnė.',
      statsBadge: 'Žala: 1 • Atvėsimas: 0.17s (Level 1)'
    },
    {
      id: 'weapon_oil',
      shortKey: 'oil',
      slot: 'roof',
      upgradeable: true,
      name: '4. Tepalo Bala (Oil Spill)',
      icon: '🛢️',
      fullPrice: 650,
      upgradeBasePrice: 650,
      discountPrice: 260,
      weaponType: 'oil',
      cooldownFrames: 120, // 2.00s pradiniame Level 1
      baseDamage: 4.0,
      bonusHp: 6,
      desc: 'Išpila slidžią tepalo balą už nugaros! Tobulinant trumpėja atvėsimo laikas ir didėja cheminė žala.',
      statsBadge: 'Žala: 4 • Atvėsimas: 2.00s (Level 1)'
    },
    {
      id: 'weapon_mines',
      shortKey: 'mines',
      slot: 'roof',
      upgradeable: true,
      name: '5. Sprogstamosios Minos',
      icon: '💣',
      fullPrice: 1150,
      upgradeBasePrice: 1150,
      discountPrice: 460,
      weaponType: 'mines',
      cooldownFrames: 132, // 2.20s pradiniame Level 1
      baseDamage: 14.0,
      bonusHp: 8,
      desc: 'Padeda sprogstamąją miną už bolido! Keliant lygį stiprėja sprogmuo ir greitėja minų klojimas.',
      statsBadge: 'Žala: 14 • Atvėsimas: 2.20s (Level 1)'
    },
    {
      id: 'weapon_laser',
      shortKey: 'laser',
      slot: 'roof',
      upgradeable: true,
      name: '6. Lazeris (Laser Beam)',
      icon: '⚡',
      fullPrice: 1450,
      upgradeBasePrice: 1450,
      discountPrice: 580,
      weaponType: 'laser',
      cooldownFrames: 120, // 2.00s pradiniame Level 1
      baseDamage: 10.0, // 10 DMG pradiniame Level 1 (Level 2 -> 10.2 DMG!)
      bonusHp: 8,
      desc: 'Iššauna tiesų plazminį lazerio spindulį be skrydžio laiko! Tobulinant auga spindulio galia ir mažėja baterijos įkrovimas.',
      statsBadge: 'Žala: 10 • Atvėsimas: 2.00s (Level 1)'
    },
    {
      id: 'weapon_rocket',
      shortKey: 'rocket',
      slot: 'roof',
      upgradeable: true,
      name: '7. Raketsvaidis (Rocket Launcher)',
      icon: '🚀',
      fullPrice: 1800,
      upgradeBasePrice: 1800,
      discountPrice: 720,
      weaponType: 'rocket',
      cooldownFrames: 150, // 2.50s pradiniame Level 1
      baseDamage: 16.0,
      bonusHp: 10,
      desc: 'Iššauna kovinę raketą, kuri sprogsta AoE plotu! Keliant lygį didėja sprogimo žala ir trumpėja pertaisymo laikas.',
      statsBadge: 'Žala: 16 AoE • Atvėsimas: 2.50s (Level 1)'
    }
  ],

  // PADANGOS (RATAI): Mažiausi tobulinimo žingsniai (+0.15% Grip ir +0.5% maks. greičio už kiekvieną lygį)
  wheels: [
    {
      id: 'wheels_stock',
      shortKey: 'stock_wheels',
      slot: 'wheels',
      upgradeable: true,
      name: 'Universali Gamyklinė Guma',
      icon: '🛞',
      fullPrice: 0,
      upgradeBasePrice: 220,
      discountPrice: 0,
      tireType: 'allround',
      asphaltSpeedMult: 1.0,
      asphaltGrip: 0.92,
      mudSpeedMult: 0.78,
      mudGrip: 0.86,
      sideBladeDamage: 0,
      desc: 'Standartinės pradinės padangos su padidintu stabilumu. Keliant lygį po truputį gerėja sukibimas (Grip) ir pridedamas +0.5% greičio bonusas.',
      statsBadge: 'Sukibimas: 92% • Purvas: 78%'
    },
    {
      id: 'wheels_slick',
      shortKey: 'slick',
      slot: 'wheels',
      upgradeable: true,
      name: 'Lenktyninės „Slick“ Padangos',
      icon: '🏎️',
      fullPrice: 650,
      upgradeBasePrice: 650,
      discountPrice: 260,
      tireType: 'slick',
      asphaltSpeedMult: 1.12,
      asphaltGrip: 0.96,
      mudSpeedMult: 0.58,
      mudGrip: 0.74,
      sideBladeDamage: 0,
      desc: 'Lygios sportinės padangos asfaltui! Kiekvienas tobulinimo lygis prideda +0.15% sukibimo ir +0.5% maksimalaus greičio.',
      statsBadge: 'Asfaltas: 112% 🔥 • Sukibimas: 96%'
    },
    {
      id: 'wheels_offroad',
      shortKey: 'offroad',
      slot: 'wheels',
      upgradeable: true,
      name: 'Dygliuotos Bekelės (Off-Road)',
      icon: '🚜',
      fullPrice: 750,
      upgradeBasePrice: 750,
      discountPrice: 300,
      tireType: 'offroad',
      asphaltSpeedMult: 0.88,
      asphaltGrip: 0.91,
      mudSpeedMult: 1.08,
      mudGrip: 0.96,
      sideBladeDamage: 0,
      desc: 'Gilus protektorius su plieno dygliais purvo arenai! Tobulinant gerėja dyglių sukibimas ir pridedamas +0.5% greičio bonusas.',
      statsBadge: 'Purvas: 108% 🔥 • Sukibimas: 96%'
    },
    {
      id: 'wheels_blades',
      shortKey: 'blades',
      slot: 'wheels',
      upgradeable: true,
      name: 'Gladiatoriaus Ratlankiai su Ašmenimis',
      icon: '⚙️',
      fullPrice: 1250,
      upgradeBasePrice: 1250,
      discountPrice: 500,
      tireType: 'blades',
      asphaltSpeedMult: 1.02,
      asphaltGrip: 0.94,
      mudSpeedMult: 0.88,
      mudGrip: 0.90,
      sideBladeDamage: 8,
      desc: 'Padangos su plieno pjūklais šonuose! Keliant lygį nežymiai gerėja sukibimas, greitis (+0.5%/lyg.) ir ašmenų žala.',
      statsBadge: '⚔️ Pjūklai • Sukibimas: 94%'
    }
  ],

  paint: [
    {
      id: 'paint_red',
      slot: 'paint',
      name: 'Liepsnos Raudona',
      icon: '🟥',
      bodyHex: '#ef4444',
      darkHex: '#991b1b',
      stripeHex: '#fef08a',
      fullPrice: 0,
      discountPrice: 0,
      desc: 'Klasikinė sportinio bolido raudona spalva su dviguba geltona juosta.',
      statsBadge: 'Startinė spalva'
    },
    {
      id: 'paint_blue',
      slot: 'paint',
      name: 'Nitro Mėlyna',
      icon: '🟦',
      bodyHex: '#2563eb',
      darkHex: '#1e3a8a',
      stripeHex: '#38bdf8',
      fullPrice: 300,
      discountPrice: 120,
      desc: 'Ryški elektrinė mėlyna spalva su žydromis greičio juostomis.',
      statsBadge: 'Kėbulo dažymas'
    },
    {
      id: 'paint_green',
      slot: 'paint',
      name: 'Nuodų Žalia',
      icon: '🟩',
      bodyHex: '#16a34a',
      darkHex: '#14532d',
      stripeHex: '#bef264',
      fullPrice: 300,
      discountPrice: 120,
      desc: 'Agresyvi neoninė žalia spalva, matoma per visą bulių areną!',
      statsBadge: 'Kėbulo dažymas'
    },
    {
      id: 'paint_orange',
      slot: 'paint',
      name: 'Bulių Oranžinė',
      icon: '🟧',
      bodyHex: '#f97316',
      darkHex: '#9a3412',
      stripeHex: '#0f172a',
      fullPrice: 400,
      discountPrice: 160,
      desc: 'Tikro bulių kautynių čempiono oranžinė su juodomis juostomis.',
      statsBadge: 'Kėbulo dažymas'
    },
    {
      id: 'paint_dark',
      slot: 'paint',
      name: 'Šešėlių Juoda',
      icon: '⬛',
      bodyHex: '#1e293b',
      darkHex: '#020617',
      stripeHex: '#ef4444',
      fullPrice: 550,
      discountPrice: 220,
      desc: 'Matinis juodas šarvuotis su grėsmingomis raudonomis juostomis.',
      statsBadge: 'Kėbulo dažymas'
    },
    {
      id: 'paint_gold',
      slot: 'paint',
      name: 'Čempiono Auksinė',
      icon: '🟨',
      bodyHex: '#eab308',
      darkHex: '#854d0e',
      stripeHex: '#ffffff',
      fullPrice: 800,
      discountPrice: 320,
      desc: 'Tviskantis gryno aukso kėbulas tikriems arenos karaliams!',
      statsBadge: 'Prestižinis dažymas'
    }
  ]
};

const LEGACY_ROOF_MAP = {
  roof_mg: 'weapon_minigun',
  roof_horns: 'weapon_shotgun',
  roof_sirens: 'weapon_laser'
};

export function buildDefaultPartsDictionary(ownedList = ['chassis_buggy', 'bumper_stock', 'roof_none', 'wheels_stock', 'paint_red']) {
  const dict = {};
  for (const cat of Object.keys(TUNING_CATALOG)) {
    for (const item of TUNING_CATALOG[cat]) {
      const isOwned = ownedList.includes(item.id);
      const entry = { owned: isOwned, level: isOwned ? 1 : 0 };
      dict[item.id] = entry;
      if (item.shortKey) {
        dict[item.shortKey] = { ...entry };
      }
    }
  }
  return dict;
}

export function getProfilePartState(profile, partOrId) {
  const part = typeof partOrId === 'string' ? null : partOrId;
  const partId = typeof partOrId === 'string' ? partOrId : partOrId?.id;
  if (!profile || !partId) return { owned: false, level: 0 };

  const shortKey = part?.shortKey || partId.replace(/^weapon_|^bumper_|^wheels_/, '');
  const fromParts = profile.parts?.[partId] || profile.parts?.[shortKey];
  const inOwnedArray = Array.isArray(profile.ownedParts) && profile.ownedParts.includes(partId);

  const owned = Boolean(fromParts?.owned || inOwnedArray);
  const level = owned ? Math.max(1, Math.min(MAX_PART_LEVEL, Number(fromParts?.level) || 1)) : 0;
  return { owned, level };
}

export function setProfilePartState(profile, part, { owned, level }) {
  if (!profile || !part) return;
  if (!profile.parts) {
    profile.parts = buildDefaultPartsDictionary(profile.ownedParts || []);
  }
  const safeLevel = owned ? Math.max(1, Math.min(MAX_PART_LEVEL, Number(level) || 1)) : 0;
  const entry = { owned: Boolean(owned), level: safeLevel };
  profile.parts[part.id] = entry;
  if (part.shortKey) {
    profile.parts[part.shortKey] = { ...entry };
  }
  if (!Array.isArray(profile.ownedParts)) {
    profile.ownedParts = [];
  }
  if (owned && !profile.ownedParts.includes(part.id)) {
    profile.ownedParts.push(part.id);
  }
}

export function createDefaultDriverProfile(driverKey) {
  const isLukas = driverKey === 'lukas';
  const starterOwned = ['chassis_buggy', 'bumper_stock', 'roof_none', 'wheels_stock', 'paint_red'];
  return {
    driverKey,
    name: isLukas ? 'Lukas (3 Klasė)' : 'Linas (1 Klasė)',
    grade: isLukas ? 3 : 1,
    coins: 500,
    wins: 0,
    racesPlayed: 0,
    totalTakedowns: 0,
    currentHp: 85,
    needsRepair: false,
    selectedTrackId: 'city_asphalt',
    selectedLayoutId: 'auto',
    unlockedTracks: ['city_asphalt'],
    ownedParts: [...starterOwned],
    // Kiekviena detalė (Ginklas, Bamperis, Padangos) saugo { owned: boolean, level: number } (pvz., minigun: { owned: true, level: 1 })
    parts: buildDefaultPartsDictionary(starterOwned),
    equipped: {
      chassis: 'chassis_buggy',
      bumper: 'bumper_stock',
      roof: 'roof_none',
      wheels: 'wheels_stock',
      paint: 'paint_red'
    },
    microUpgrades: {
      engine: 0,
      armor: 0,
      ram: 0,
      weapons: 0
    }
  };
}

export class GarageManager {
  constructor() {
    this.activeDriverKey = localStorage.getItem(SAVE_KEYS.activeDriver) || 'linas';
    this.profiles = {
      linas: this.loadDriver('linas'),
      lukas: this.loadDriver('lukas')
    };
  }

  loadDriver(driverKey) {
    const storageKey = SAVE_KEYS[driverKey];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const def = createDefaultDriverProfile(driverKey);
        const mapRoof = (id) => LEGACY_ROOF_MAP[id] || id;
        const owned = Array.from(new Set([...def.ownedParts, ...(parsed.ownedParts || []).map(mapRoof)]));

        // Atstatome ir suvienodiname parts objektą ({ owned, level }) kiekvienai detalei
        const partsDict = buildDefaultPartsDictionary(owned);
        if (parsed.parts && typeof parsed.parts === 'object') {
          for (const cat of Object.keys(TUNING_CATALOG)) {
            for (const item of TUNING_CATALOG[cat]) {
              const savedEntry = parsed.parts[item.id] || (item.shortKey ? parsed.parts[item.shortKey] : null);
              if (savedEntry && typeof savedEntry === 'object') {
                const isOwn = Boolean(savedEntry.owned || owned.includes(item.id));
                const lvl = isOwn ? Math.max(1, Math.min(MAX_PART_LEVEL, Number(savedEntry.level) || 1)) : 0;
                partsDict[item.id] = { owned: isOwn, level: lvl };
                if (item.shortKey) {
                  partsDict[item.shortKey] = { owned: isOwn, level: lvl };
                }
                if (isOwn && !owned.includes(item.id)) {
                  owned.push(item.id);
                }
              }
            }
          }
        }

        const eq = {
          ...def.equipped,
          ...(parsed.equipped || {})
        };
        if (!TUNING_CATALOG.chassis.some((c) => c.id === eq.chassis)) {
          eq.chassis = 'chassis_buggy';
        }
        eq.roof = mapRoof(eq.roof);
        if (!TUNING_CATALOG.roof.some((r) => r.id === eq.roof)) {
          eq.roof = 'roof_none';
        }

        const micro = {
          engine: Math.max(0, Math.min(MAX_MICRO_UPGRADE_LEVEL, Number(parsed.microUpgrades?.engine) || 0)),
          armor: Math.max(0, Math.min(MAX_MICRO_UPGRADE_LEVEL, Number(parsed.microUpgrades?.armor) || 0)),
          ram: Math.max(0, Math.min(MAX_MICRO_UPGRADE_LEVEL, Number(parsed.microUpgrades?.ram) || 0)),
          weapons: Math.max(0, Math.min(MAX_MICRO_UPGRADE_LEVEL, Number(parsed.microUpgrades?.weapons) || 0))
        };

        let unlocked = Array.isArray(parsed.unlockedTracks) ? parsed.unlockedTracks.filter(Boolean) : ['city_asphalt'];
        if (!unlocked.includes('city_asphalt')) {
          unlocked.unshift('city_asphalt');
        }
        let selTrack = normalizeTrackId(parsed.selectedTrackId);
        if (selTrack !== 'random_biome' && !unlocked.includes(selTrack)) {
          selTrack = 'city_asphalt';
        }

        let selLayout = parsed.selectedLayoutId || 'auto';
        if (!['auto', 'ring', 'figure8', 'zigzag'].includes(selLayout)) {
          selLayout = 'auto';
        }

        const hasSavedHp = parsed.currentHp !== undefined;
        const parsedHpNum = Number(parsed.currentHp);
        const safeHp = !hasSavedHp
          ? def.currentHp
          : (parsed.currentHp !== null && Number.isFinite(parsedHpNum) ? Math.max(0, parsedHpNum) : 0);
        const needsRepair = Boolean(parsed.needsRepair) || safeHp <= 0;

        return {
          ...def,
          ...parsed,
          currentHp: safeHp,
          needsRepair,
          unlockedTracks: unlocked,
          ownedParts: owned,
          parts: partsDict,
          equipped: eq,
          microUpgrades: micro,
          selectedTrackId: selTrack,
          selectedLayoutId: selLayout
        };
      }
    } catch (e) {
      // Ignoruojame klaidas
    }
    const fresh = createDefaultDriverProfile(driverKey);
    this.saveDriver(driverKey, fresh);
    return fresh;
  }

  saveDriver(driverKey = this.activeDriverKey, profileObj = null) {
    const prof = profileObj || this.profiles[driverKey];
    if (!prof) return;
    try {
      localStorage.setItem(SAVE_KEYS[driverKey], JSON.stringify(prof));
      localStorage.setItem(SAVE_KEYS.activeDriver, this.activeDriverKey);
    } catch (e) {
      // Ignoruojame klaidas
    }
  }

  setActiveDriver(driverKey) {
    if (driverKey !== 'linas' && driverKey !== 'lukas') return;
    this.activeDriverKey = driverKey;
    const stats = this.getComputedCarStats(this.getActiveProfile());
    const prof = this.getActiveProfile();
    if (prof.currentHp > stats.maxHp) {
      prof.currentHp = stats.maxHp;
    }
    this.saveDriver(driverKey);
  }

  resetDriver(driverKey) {
    if (driverKey !== 'linas' && driverKey !== 'lukas') return;
    const fresh = createDefaultDriverProfile(driverKey);
    this.profiles[driverKey] = fresh;
    this.saveDriver(driverKey, fresh);
  }

  getActiveProfile() {
    return this.profiles[this.activeDriverKey];
  }

  findPart(partId) {
    for (const cat of Object.keys(TUNING_CATALOG)) {
      const found = TUNING_CATALOG[cat].find((p) => p.id === partId);
      if (found) return found;
    }
    return null;
  }

  getComputedCarStats(profile = this.getActiveProfile()) {
    const chassis = this.findPart(profile.equipped?.chassis) || TUNING_CATALOG.chassis[0];
    const bumper = this.findPart(profile.equipped?.bumper) || TUNING_CATALOG.bumper[0];
    const roof = this.findPart(profile.equipped?.roof) || TUNING_CATALOG.roof[0];
    const wheels = this.findPart(profile.equipped?.wheels) || TUNING_CATALOG.wheels[0];
    const paint = this.findPart(profile.equipped?.paint) || TUNING_CATALOG.paint[0];

    // Uždedamų detalių lygiai (1..50)
    const bumperState = getProfilePartState(profile, bumper);
    const roofState = getProfilePartState(profile, roof);
    const wheelsState = getProfilePartState(profile, wheels);

    const bumperLvlStats = getPartStatsAtLevel(bumper, bumperState.level || 1);
    const roofLvlStats = getPartStatsAtLevel(roof, roofState.level || 1);
    const wheelsLvlStats = getPartStatsAtLevel(wheels, wheelsState.level || 1);

    const micro = profile.microUpgrades || { engine: 0, armor: 0, ram: 0, weapons: 0 };

    // Mikro-tobulinimų daugikliai (iki 50 lygių):
    const engineMicroMult = 1 + (micro.engine || 0) * 0.01;
    const armorMicroMult = 1 + (micro.armor || 0) * 0.02;
    const ramMicroMult = 1 + (micro.ram || 0) * 0.015;
    const weaponMicroMult = 1 + (micro.weapons || 0) * 0.01;

    // Kėbulo bazinis HP + bamperio (pagal lygį) ir stogo (pagal lygį) HP, padaugintas iš Šarvų mikro-tobulinimo!
    const baseHp = (chassis.baseHp || 100) + (bumperLvlStats.bonusHp || 0) + (roofLvlStats.bonusHp || 0);
    const maxHp = Math.round(baseHp * armorMicroMult);

    // Tarano žalos daugiklis: Kėbulo klasės daugiklis * Bamperio lygio daugiklis * Tarano mikro-tobulinimas
    const ramMultiplier = (chassis.ramClassMult || 1.0) * (bumperLvlStats.ramMult || 1.0) * ramMicroMult;

    // Greitis ant Asfalto: Kėbulas * Padangų lygio greitis (+0.5%/lyg.) * Variklio mikro-tobulinimas
    const asphaltSpeedMult = (chassis.asphaltSpeedMult || 1.0) * (wheelsLvlStats.asphaltSpeedMult || 1.0) * engineMicroMult;

    // Greitis Purve:
    let rawMudTireMult = wheelsLvlStats.mudSpeedMult || 0.75;
    if (chassis.ignoresMudSlowdown) {
      rawMudTireMult = Math.max(1.02 * (wheelsLvlStats.speedBonusMult || 1), rawMudTireMult * (chassis.mudSpeedBonus || 1.2));
    } else {
      rawMudTireMult = rawMudTireMult * (chassis.mudSpeedBonus || 1.0);
    }
    const mudSpeedMult = rawMudTireMult * engineMicroMult;

    const asphaltGrip = Math.min(0.985, Math.max(0.6, wheelsLvlStats.asphaltGrip || 0.86));
    const mudGrip = Math.min(0.98, Math.max(0.55, (wheelsLvlStats.mudGrip || 0.78) + (chassis.mudGripBonus || 0)));

    const accelMult = chassis.accelMult || 1.0;
    const turnMult = chassis.turnMult || 1.0;
    const mass = chassis.mass || 1.0;
    const collisionRadius = chassis.collisionRadius || 26;

    const sideBladeDamage = Math.round((wheelsLvlStats.sideBladeDamage || 0) * ramMicroMult);
    const selfDmgReduction = bumperLvlStats.selfDmgReduction || 0;

    const weaponType = roof.weaponType || 'none';
    const weaponCooldown = Math.round(roofLvlStats.cooldownFrames || 0);
    const weaponDamage = Number(((roofLvlStats.damage || 0) * weaponMicroMult).toFixed(2));

    return {
      maxHp,
      ramMultiplier,
      engineMicroMult,
      armorMicroMult,
      ramMicroMult,
      weaponMicroMult,
      asphaltSpeedMult,
      mudSpeedMult,
      asphaltGrip,
      mudGrip,
      accelMult,
      turnMult,
      mass,
      collisionRadius,
      sideBladeDamage,
      selfDmgReduction,
      weaponType,
      weaponCooldown,
      weaponDamage,
      bumperLevel: bumperLvlStats.level,
      roofLevel: roofLvlStats.level,
      wheelsLevel: wheelsLvlStats.level,
      chassis,
      bumper,
      roof,
      wheels,
      paint
    };
  }
}

/**
 * Universali 2D Top-Down mašinos piešimo funkcija!
 * Atvaizduoja visas 3 Kėbulų klases (Bagį, Sportinę mašiną, Šarvuotą Sunkvežimį),
 * visus bamperius, padangas ir visus 7 GINKLUS ant stogo!
 */
function createMetallicBodyGradient(ctx, halfW, bodyHex, darkHex) {
  const grad = ctx.createLinearGradient(0, -halfW, 0, halfW);
  grad.addColorStop(0, darkHex);
  grad.addColorStop(0.24, bodyHex);
  grad.addColorStop(0.46, '#ffffff');
  grad.addColorStop(0.56, bodyHex);
  grad.addColorStop(0.84, bodyHex);
  grad.addColorStop(1, darkHex);
  return grad;
}

function drawHeadlightCones(ctx, frontX, yOffsets, spread = 24, reach = 64, intensity = 0.22) {
  ctx.save();
  for (const ly of yOffsets) {
    const beam = ctx.createLinearGradient(frontX, ly, frontX + reach, ly);
    beam.addColorStop(0, `rgba(254, 249, 195, ${(intensity * 1.35).toFixed(2)})`);
    beam.addColorStop(0.45, `rgba(253, 224, 71, ${(intensity * 0.55).toFixed(2)})`);
    beam.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(frontX, ly - 3);
    ctx.lineTo(frontX + reach, ly - spread);
    ctx.lineTo(frontX + reach, ly + spread);
    ctx.lineTo(frontX, ly + 3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawCarTopDown(ctx, config, animTime = 0) {
  const {
    chassisId = 'chassis_buggy',
    bumperId = 'bumper_stock',
    roofId = 'roof_none',
    wheelsId = 'wheels_stock',
    paintId = 'paint_red',
    bumperLevel = 1,
    roofLevel = 1,
    hpRatio = 1,
    steerAngle = 0,
    muzzleFlash = 0,
    secondaryWeapon = null
  } = config;

  const paintObj = TUNING_CATALOG.paint.find((p) => p.id === paintId) || TUNING_CATALOG.paint[0];
  const bodyHex = config.customBodyHex || paintObj.bodyHex;
  const darkHex = config.customDarkHex || paintObj.darkHex;
  const stripeHex = config.customStripeHex || paintObj.stripeHex;

  const isBuggy = chassisId === 'chassis_buggy';
  const isSports = chassisId === 'chassis_sports';
  const isTruck = chassisId === 'chassis_truck';

  const carLen = isTruck ? 74 : isSports ? 66 : 60;
  const carWid = isTruck ? 40 : isSports ? 34 : 30;
  const frontEdge = carLen / 2;

  ctx.save();

  // Švelnus kontakto šešėlis po automobiliu
  ctx.fillStyle = 'rgba(2, 6, 23, 0.36)';
  ctx.beginPath();
  ctx.ellipse(-2, 3, carLen * 0.54, carWid * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Priekinių žibintų šviesos kūgiai
  const lightPositions = isBuggy ? [-7, 7] : isTruck ? [-12.5, 12.5] : [-10, 10];
  drawHeadlightCones(ctx, frontEdge - 1, lightPositions, isTruck ? 22 : 18, isTruck ? 68 : 62, 0.19);

  // ==================== 1. PADANGOS IR PAKABA PAGAL KĖBULO KLASĘ ====================
  const wheelY = isTruck ? 22 : isBuggy ? 20 : 18.5;
  const wheelX = isTruck ? 21 : 18;
  const wheelPositions = [
    { x: wheelX, y: -wheelY, front: true, side: -1 },
    { x: wheelX, y: wheelY, front: true, side: 1 },
    { x: -wheelX, y: -wheelY, front: false, side: -1 },
    { x: -wheelX, y: wheelY, front: false, side: 1 }
  ];

  // Jei tai Lengvasis Bagis – nupiešiame išneštas spyruoklines pakabos svirtis!
  if (isBuggy) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    for (const wp of wheelPositions) {
      ctx.beginPath();
      ctx.moveTo(wp.x * 0.75, wp.side * 8);
      ctx.lineTo(wp.x, wp.y);
      ctx.stroke();
    }
  }

  const isSlick = wheelsId === 'wheels_slick';
  const isOffroad = wheelsId === 'wheels_offroad';
  const isBlades = wheelsId === 'wheels_blades';
  const wLen = (isOffroad ? 16 : 14) + (isTruck ? 2 : 0);
  const wWid = (isOffroad || isSlick ? 9 : 7) + (isTruck ? 1.5 : 0);

  for (const wp of wheelPositions) {
    ctx.save();
    ctx.translate(wp.x, wp.y);
    if (wp.front && steerAngle) {
      ctx.rotate(steerAngle * 0.45);
    }

    ctx.fillStyle = isSlick ? '#090d16' : '#0f172a';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -wLen / 2, -wWid / 2, wLen, wWid, 3);
    ctx.fill();
    ctx.stroke();

    if (isSlick) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-wLen / 2 + 2, wp.side * (wWid / 2 - 2), wLen - 4, 1.8);
    } else if (isOffroad) {
      ctx.fillStyle = '#475569';
      for (let tx = -5; tx <= 5; tx += 5) {
        ctx.fillRect(tx - 1.5, -wWid / 2 - 1.4, 3, 2.2);
        ctx.fillRect(tx - 1.5, wWid / 2 - 0.8, 3, 2.2);
      }
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-4, -1, 2, 2);
      ctx.fillRect(2, -1, 2, 2);
    }

    if (isBlades) {
      const outY = wp.side * (wWid / 2 + 4);
      ctx.save();
      ctx.translate(0, outY);
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;

      const bladeWave = Math.sin(animTime * 0.35) * 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -wp.side * 3);
      ctx.lineTo(-4 + bladeWave, wp.side * 5);
      ctx.lineTo(-1, -wp.side * 2);
      ctx.lineTo(1 + bladeWave, wp.side * 6);
      ctx.lineTo(3, -wp.side * 2);
      ctx.lineTo(6 + bladeWave, wp.side * 5);
      ctx.lineTo(6, -wp.side * 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -1.5, 6, 3);
      ctx.restore();
    }

    ctx.restore();
  }

  // ==================== 2. PRIEKINIS BAMPERIS SU 4 VIZUALINĖMIS PAKOPOMIS (TIERS 1-4) ====================
  drawBumper(ctx, bumperId, bumperLevel, frontEdge, animTime);

  // ==================== 3. KĖBULO KLASĖS FORMA (BAGIS vs SPORTINĖ vs ŠARVUOTAS SUNKVEŽIMIS) ====================
  const metallicBody = createMetallicBodyGradient(ctx, carWid / 2, bodyHex, darkHex);

  if (isBuggy) {
    // 1 KLASĖ: LENGVASIS BAGIS (siaurėjantis smėlio bagis su vamzdiniu saugos lanku!)
    ctx.fillStyle = metallicBody;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-28, -14);
    ctx.lineTo(10, -13);
    ctx.lineTo(29, -8);
    ctx.lineTo(29, 8);
    ctx.lineTo(10, 13);
    ctx.lineTo(-28, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Metalizuotas šviesos blyksnis ant kėbulo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.moveTo(-25, -10);
    ctx.lineTo(24, -6);
    ctx.lineTo(24, -1);
    ctx.lineTo(-25, -4);
    ctx.closePath();
    ctx.fill();

    // Centrinė lenktynių juosta
    ctx.fillStyle = stripeHex;
    ctx.fillRect(-25, -3, 50, 6);

    // Galinis sportinis aero sparnas (Spoileris)
    ctx.fillStyle = '#020617';
    ctx.fillRect(-28, -10, 4, 2);
    ctx.fillRect(-28, 8, 4, 2);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = stripeHex;
    ctx.lineWidth = 1.4;
    roundRectPath(ctx, -31, -13.5, 5, 27, 2);
    ctx.fill();
    ctx.stroke();

    // Priekiniai ralio žibintai
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1;
    ctx.fillRect(26, -8.5, 3.5, 4.5);
    ctx.strokeRect(26, -8.5, 3.5, 4.5);
    ctx.fillRect(26, 4, 3.5, 4.5);
    ctx.strokeRect(26, 4, 3.5, 4.5);

    // Atvira bagio kabina ir vamzdinis saugos lankas (Roll-Cage)
    ctx.fillStyle = '#0f172a';
    roundRectPath(ctx, -14, -10, 26, 20, 4);
    ctx.fill();

    // Tamsintas aero priekinis stiklas su atspindžiu
    const visorGrad = ctx.createLinearGradient(5, -8, 12, 8);
    visorGrad.addColorStop(0, '#0f172a');
    visorGrad.addColorStop(0.45, '#0369a1');
    visorGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = visorGrad;
    ctx.beginPath();
    ctx.moveTo(6, -8.5);
    ctx.lineTo(12, -6.5);
    ctx.lineTo(12, 6.5);
    ctx.lineTo(6, 8.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(7.5, -5.5);
    ctx.lineTo(10.5, -1);
    ctx.stroke();

    ctx.strokeStyle = stripeHex;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-12, -9);
    ctx.lineTo(10, -9);
    ctx.moveTo(-12, 9);
    ctx.lineTo(10, 9);
    ctx.moveTo(-12, -9);
    ctx.lineTo(10, 9);
    ctx.moveTo(10, -9);
    ctx.lineTo(-12, 9);
    ctx.stroke();
  } else if (isTruck) {
    // 3 KLASĖ: ŠARVUOTAS SUNKVEŽIMIS / DŽIPAS (platus, ilgas, masyvus su šarvuotomis kniedėmis ir krovinių kėbulu!)
    ctx.fillStyle = metallicBody;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3.5;
    roundRectPath(ctx, -carLen / 2, -carWid / 2, carLen, carWid, 5);
    ctx.fill();
    ctx.stroke();

    // Šoniniai šarvų skydai
    ctx.fillStyle = darkHex;
    ctx.fillRect(-33, -carWid / 2 + 2, 66, 5);
    ctx.fillRect(-33, carWid / 2 - 7, 66, 5);

    // Dviguba juosta ant kapoto
    ctx.fillStyle = stripeHex;
    ctx.fillRect(6, -6, 28, 4);
    ctx.fillRect(6, 2, 28, 4);

    // Galinė sunkvežimio šarvuota krovinių platforma + tvirtas galinis spoileris ant kabinos
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -34, -14, 18, 28, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#020617';
    ctx.strokeStyle = stripeHex;
    ctx.lineWidth = 1.3;
    roundRectPath(ctx, -36, -16, 4.5, 32, 1.5);
    ctx.fill();
    ctx.stroke();

    // Šarvuota kabina su apsauginėmis lango grotomis
    ctx.fillStyle = '#0f172a';
    roundRectPath(ctx, -14, -15, 26, 30, 4);
    ctx.fill();

    const truckGlassGrad = ctx.createLinearGradient(5, -12, 11, 12);
    truckGlassGrad.addColorStop(0, '#020617');
    truckGlassGrad.addColorStop(0.35, '#0284c7');
    truckGlassGrad.addColorStop(0.7, '#0f172a');
    truckGlassGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = truckGlassGrad;
    ctx.fillRect(5, -12, 6, 24);
    // Įstrižas stiklo blizgesys
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(6, -10);
    ctx.lineTo(10.5, -5);
    ctx.lineTo(10.5, -1);
    ctx.lineTo(6, -6);
    ctx.closePath();
    ctx.fill();

    // Šarvų grotelės ant priekinio stiklo
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    for (let gy = -8; gy <= 8; gy += 8) {
      ctx.beginPath();
      ctx.moveTo(5, gy);
      ctx.lineTo(11, gy);
      ctx.stroke();
    }

    ctx.fillStyle = metallicBody;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, -11, -12, 15, 24, 3);
    ctx.fill();
    ctx.stroke();

    // Priekiniai galingi prožektoriai
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.2;
    ctx.fillRect(33, -16, 4.5, 7);
    ctx.strokeRect(33, -16, 4.5, 7);
    ctx.fillRect(33, 9, 4.5, 7);
    ctx.strokeRect(33, 9, 4.5, 7);
  } else {
    // 2 KLASĖ: SPORTINĖ MAŠINA (aerodinamiškas superbolidas su galiniu spoileriu!)
    ctx.fillStyle = metallicBody;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3.3;
    roundRectPath(ctx, -carLen / 2, -carWid / 2, carLen, carWid, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = darkHex;
    ctx.fillRect(-26, -carWid / 2 + 1.5, 52, 3.5);
    ctx.fillRect(-26, carWid / 2 - 5, 52, 3.5);

    ctx.fillStyle = stripeHex;
    ctx.fillRect(-29, -4.5, 58, 3.2);
    ctx.fillRect(-29, 1.3, 58, 3.2);

    // Kapoto metalizuotas šviesos atspindys
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    roundRectPath(ctx, 11, -9, 16, 18, 4);
    ctx.fill();

    // LED priekiniai žibintai
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1;
    ctx.fillRect(28.5, -13, 4, 6);
    ctx.strokeRect(28.5, -13, 4, 6);
    ctx.fillRect(28.5, 7, 4, 6);
    ctx.strokeRect(28.5, 7, 4, 6);

    // Dvigubas platus anglies pluošto sportinis spoileris gale su šoninėmis plokštėmis
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-29, -11, 5, 3);
    ctx.fillRect(-29, 8, 5, 3);

    ctx.fillStyle = '#020617';
    ctx.strokeStyle = stripeHex;
    ctx.lineWidth = 1.6;
    roundRectPath(ctx, -34, -18, 6.5, 36, 2);
    ctx.fill();
    ctx.stroke();

    // Spoilerio šoniniai sparneliai (endplates) ir viršutinis blizgesys
    ctx.fillStyle = '#334155';
    ctx.fillRect(-33.5, -18.5, 7, 2.5);
    ctx.fillRect(-33.5, 16, 7, 2.5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(-32.5, -14, 2, 28);

    ctx.fillStyle = '#0f172a';
    roundRectPath(ctx, -16, -12.5, 32, 25, 5);
    ctx.fill();

    // Tamsintas panoraminis priekinis stiklas su šviesos atspindžiu
    const sportGlassGrad = ctx.createLinearGradient(5, -11, 15, 11);
    sportGlassGrad.addColorStop(0, '#020617');
    sportGlassGrad.addColorStop(0.35, '#0284c7');
    sportGlassGrad.addColorStop(0.65, '#38bdf8');
    sportGlassGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = sportGlassGrad;
    ctx.beginPath();
    ctx.moveTo(6, -10.5);
    ctx.lineTo(14.5, -8.5);
    ctx.lineTo(14.5, 8.5);
    ctx.lineTo(6, 10.5);
    ctx.closePath();
    ctx.fill();
    // Stiklo atspindžio brūkšniai
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(7.5, -7);
    ctx.lineTo(12.5, -1.5);
    ctx.moveTo(8, 2);
    ctx.lineTo(11.5, 5.5);
    ctx.stroke();

    ctx.fillStyle = metallicBody;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.4;
    roundRectPath(ctx, -8, -10, 13, 20, 3);
    ctx.fill();
    ctx.stroke();
  }

  if (hpRatio < 0.65) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, -10);
    ctx.lineTo(20, -3);
    ctx.lineTo(16, 4);
    ctx.stroke();
  }

  // ==================== 4. 7 SKIRTINGI GINKLAI ANT STOGO SU 4 VIZUALINĖMIS PAKOPOMIS ====================
  drawWeapon(ctx, roofId, roofLevel, muzzleFlash, animTime);

  // ==================== 5. VIZUALUS ANTRINIS GINKLAS (ITEM BOX) ANT KĖBULO ŠONO ARBA GALO ====================
  if (secondaryWeapon) {
    drawSecondaryWeapon(ctx, secondaryWeapon, carLen, carWid, animTime);
  }

  ctx.restore();
}

/**
 * 2 PUNKTAS: VIZUALUS ANTRINIS GINKLAS ANT MAŠINOS KĖBULO (VISIEMS)
 * Tikrinamas mašinos active `secondaryWeapon` ('homing_missile', 'mine', 'oil').
 * Ginklas nupiešiamas ant kėbulo šono (raketa) arba galo (mina, tepalas),
 * kad nepersidengtų ir neuždengtų pagrindinio garažo stogo ginklo.
 * Sukasi kartu su mašinos kampu, o iššovus akimirksniu dingsta.
 */
export function drawSecondaryWeapon(ctx, weaponId, carLen = 60, carWid = 30, animTime = 0) {
  if (!weaponId) return;

  ctx.save();

  if (weaponId === 'homing_missile' || weaponId === 'homing') {
    // 1. RAKETA-PERSEKĖTOJA: sumontuota ant dešiniojo šono gembės (Side Pylon/Rail)
    const mountX = 2;
    const mountY = carWid / 2 + 5.5;

    // Tvirtinimo kronšteinas prie kėbulo šono
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.fillRect(mountX - 6, carWid / 2 - 2, 12, 6);
    ctx.strokeRect(mountX - 6, carWid / 2 - 2, 12, 6);

    ctx.save();
    ctx.translate(mountX, mountY);

    // Raketos uodegos stabilizatoriai (sparneliai)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-9, -5);
    ctx.lineTo(-5, -2);
    ctx.lineTo(-5, 2);
    ctx.lineTo(-9, 5);
    ctx.lineTo(-10, 5);
    ctx.lineTo(-7.5, 0);
    ctx.lineTo(-10, -5);
    ctx.closePath();
    ctx.fill();

    // Raketos cilindrinis korpusas
    const bodyGrad = ctx.createLinearGradient(0, -3, 0, 3);
    bodyGrad.addColorStop(0, '#f8fafc');
    bodyGrad.addColorStop(0.5, '#cbd5e1');
    bodyGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-7, -3, 13, 6);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(-7, -3, 13, 6);

    // Įspėjamoji geltona / juoda juosta ant korpuso
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-1.5, -3, 3, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-0.2, -3, 1.4, 6);

    // Aerodinaminė smaili kovinė galvutė (Nosecone) priekyje (+X)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(6, -3);
    ctx.lineTo(13, 0);
    ctx.lineTo(6, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.stroke();

    // Pulsuojantis lazerinis taikinio sekiklis
    const laserPulse = (Math.sin(animTime * 0.25) + 1) * 0.5;
    ctx.fillStyle = laserPulse > 0.4 ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(12.5, 0, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Raketos išmetimo tūta (gale)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-9, -2, 2, 4);

    ctx.restore();

  } else if (weaponId === 'mine') {
    // 2. MINA: sumontuota ant galinio bamperio laikiklio (Rear Rack)
    const mountX = -carLen / 2 - 5;
    const mountY = 0;

    // Metalinis laikiklis nuo galinio buferio
    ctx.fillStyle = '#334155';
    ctx.fillRect(-carLen / 2 + 1, -5, 5, 10);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-carLen / 2 + 1, -5, 5, 10);

    ctx.save();
    ctx.translate(mountX, mountY);

    // Dygliuotas minos korpusas (detonatoriaus spygliai)
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const sx = Math.cos(a) * 7.5;
      const sy = Math.sin(a) * 7.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Minos apvalus plieninis korpusas
    const mineGrad = ctx.createRadialGradient(-1.5, -1.5, 1, 0, 0, 6.5);
    mineGrad.addColorStop(0, '#475569');
    mineGrad.addColorStop(0.7, '#1e293b');
    mineGrad.addColorStop(1, '#020617');
    ctx.fillStyle = mineGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Įspėjamasis mirksintis detonatoriaus LED
    const blink = Math.floor(animTime / 12) % 2 === 0;
    ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (weaponId === 'oil') {
    // 3. TEPALO TALPA: sumontuota ant kairiojo galinio sparno (Rear-Left Rack)
    const mountX = -carLen / 2 + 4;
    const mountY = -carWid / 2 - 4.5;

    // Tvirtinimo plokštė prie sparno
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mountX - 5, -carWid / 2 - 1, 10, 4);

    ctx.save();
    ctx.translate(mountX, mountY);

    // Slėginis tepalo bakelis / kanistras
    ctx.fillStyle = '#1e1b4b';
    roundRectPath(ctx, -6, -4.5, 12, 9, 2);
    ctx.fill();
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Įspėjamasis dryžis (Hazard band)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-2, -4.5, 4, 9);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-0.5, -4.5, 1.5, 9);

    // Užpylimo kaklelis / vožtuvas atsuktas atgal (-X)
    ctx.fillStyle = '#020617';
    ctx.fillRect(-8, -1.5, 2.5, 3);

    // Tamsus tepalo lašas prie snapelio
    ctx.fillStyle = '#172554';
    ctx.beginPath();
    ctx.arc(-8.5, 0, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (weaponId === 'tank' || weaponId === 'tank_mode') {
    // Papildomi šoniniai šarvai / skydo generatorius
    const mountX = 0;
    const mountY = carWid / 2 + 4;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(mountX - 8, mountY - 2, 16, 4);
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1;
    ctx.strokeRect(mountX - 8, mountY - 2, 16, 4);
  }

  ctx.restore();
}

/**
 * 1 PUNKTAS: Bamperių piešimas pagal Vizualinę Pakopą (Tier 1..4):
 * - Tier 1 (Lygis 1-9): Bazinis dydis ir pilka/standartinė spalva
 * - Tier 2 (Lygis 10-19): Masyvesnis korpusas, dvigubai ilgesnis centrinis raganosio ragas / spygliai
 * - Tier 3 (Lygis 20-29): Elitiniai raudoni, auksiniai ir neoniniai akcentai
 * - Tier 4 (Lygis 30+): Legendinis maksimalus dydis, švytinti aura ir dūmų/kibirkščių partikulai
 */
export function drawBumper(ctx, bumperId, bumperLevel = 1, frontEdge = 30, animTime = 0) {
  const { tier } = getVisualTierInfo(bumperLevel);
  const bOffset = frontEdge - 32;
  // Masyvumo daugiklis nuo Tier 1 iki Tier 4
  const scaleMult = tier === 1 ? 0.92 : tier === 2 ? 1.12 : tier === 3 ? 1.24 : 1.36;

  ctx.save();
  ctx.translate(bOffset, 0);

  // Tier 4 Legendinė švytinti aura ir dūmų partikulai priekyje
  if (tier >= 4) {
    const pulse = 0.55 + Math.sin(animTime * 0.14) * 0.25;
    ctx.save();
    ctx.fillStyle = `rgba(244, 63, 94, ${0.22 * pulse})`;
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.55 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(38, 0, 14, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Maži dūmų / energijos partikulai
    for (let p = 0; p < 3; p++) {
      const phase = (animTime * 0.08 + p * 2.1) % (Math.PI * 2);
      const px = 38 + Math.cos(phase) * 9;
      const py = Math.sin(phase * 1.5) * 20;
      ctx.fillStyle = p % 2 === 0 ? 'rgba(250, 204, 21, 0.7)' : 'rgba(148, 163, 184, 0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (bumperId === 'bumper_plow') {
    const halfSpan = 20 * scaleMult;
    const tipX = 33 + 8 * scaleMult;
    ctx.fillStyle = tier >= 3 ? '#ea580c' : '#fb923c';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.fillRect(28, -11, 7, 4);
    ctx.fillRect(28, 7, 7, 4);

    ctx.beginPath();
    ctx.moveTo(32, -halfSpan);
    ctx.lineTo(tipX, -halfSpan * 0.65);
    ctx.lineTo(tipX, halfSpan * 0.65);
    ctx.lineTo(32, halfSpan);
    ctx.lineTo(29, halfSpan * 0.82);
    ctx.lineTo(35, halfSpan * 0.52);
    ctx.lineTo(35, -halfSpan * 0.52);
    ctx.lineTo(29, -halfSpan * 0.82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tier 2+: papildomi šoniniai peiliai ir dvigubai ilgesnis centrinis raganosio ragas!
    if (tier >= 2) {
      ctx.fillStyle = tier >= 3 ? '#fde047' : '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      const hornLen = tier >= 4 ? 19 : tier >= 3 ? 15 : 12;
      ctx.beginPath();
      ctx.moveTo(tipX - 1, -4.5);
      ctx.lineTo(tipX + hornLen, 0);
      ctx.lineTo(tipX - 1, 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Tier 3+: Elitinės pavojaus juostos (raudona / auksinė)
    ctx.fillStyle = tier >= 3 ? '#ef4444' : '#0f172a';
    for (let sy = -12; sy <= 10; sy += 7) {
      ctx.fillRect(35, sy, 4, 3.5);
    }
  } else if (bumperId === 'bumper_spikes') {
    const barHalf = 17 * scaleMult;
    ctx.fillStyle = tier >= 3 ? '#1e293b' : '#475569';
    ctx.strokeStyle = tier >= 3 ? '#f43f5e' : '#0f172a';
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, 30, -barHalf, 6 + (tier - 1) * 1.2, barHalf * 2, 2);
    ctx.fill();
    ctx.stroke();

    // Tier 1: trumpi spygliai; Tier 2+: dvigubai ilgesnis ir aštresnis centrinis Raganosio ragas + šoniniai spygliai!
    const baseSpikeLen = tier === 1 ? 9 : tier === 2 ? 15 : tier === 3 ? 18 : 22;
    const spikeOffsets = tier === 1 ? [-12, -4, 4, 12] : [-16, -8, 0, 8, 16];
    for (const sy of spikeOffsets) {
      const isCenterHorn = sy === 0 && tier >= 2;
      const len = isCenterHorn ? baseSpikeLen * 1.45 : baseSpikeLen;
      const halfW = isCenterHorn ? 4.8 : 3.2;
      ctx.fillStyle = tier >= 4 ? '#fde047' : tier >= 3 ? (isCenterHorn ? '#ef4444' : '#f8fafc') : '#cbd5e1';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(35, sy - halfW);
      ctx.lineTo(35 + len, sy);
      ctx.lineTo(35, sy + halfW);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (tier >= 3) {
      // Elitinė auksinė/neoninė juosta per spyglių pagrindą
      ctx.fillStyle = '#facc15';
      ctx.fillRect(31.5, -barHalf + 3, 3, barHalf * 2 - 6);
    }
  } else if (bumperId === 'bumper_train') {
    const halfH = 20 * scaleMult;
    const tipX = 46 + (tier - 1) * 5.5;
    ctx.fillStyle = tier >= 3 ? '#0f172a' : '#334155';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#0f172a';
    ctx.lineWidth = 2.6;

    ctx.beginPath();
    ctx.moveTo(29, -halfH);
    ctx.lineTo(tipX, 0);
    ctx.lineTo(29, halfH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tier 2+: masyvūs šoniniai sparnai ir grotelės
    if (tier >= 2) {
      ctx.strokeStyle = tier >= 3 ? '#ef4444' : '#94a3b8';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(31, -halfH * 0.72);
      ctx.lineTo(tipX - 5, 0);
      ctx.lineTo(31, halfH * 0.72);
      ctx.stroke();
    }

    // Tier 3+: dviguba auksinė/neoninė V juosta
    ctx.strokeStyle = tier >= 4 ? '#22d3ee' : '#facc15';
    ctx.lineWidth = tier >= 3 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(32, -13);
    ctx.lineTo(tipX - 8, 0);
    ctx.lineTo(32, 13);
    ctx.stroke();
  } else {
    // Gamyklinis bamperis taip pat evoliucionuoja pagal Tier 1..4
    const halfH = 14 * scaleMult;
    ctx.fillStyle = tier >= 3 ? '#1e293b' : '#334155';
    ctx.strokeStyle = tier >= 3 ? '#38bdf8' : '#0f172a';
    ctx.lineWidth = 2;
    roundRectPath(ctx, 29, -halfH, 5 + (tier - 1) * 1.5, halfH * 2, 2);
    ctx.fill();
    ctx.stroke();

    if (tier >= 2) {
      // Tier 2+: centrinis ragas ant bamperio
      const hornLen = 7 + (tier - 1) * 3.5;
      ctx.fillStyle = tier >= 3 ? '#facc15' : '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(34, -3.5);
      ctx.lineTo(34 + hornLen, 0);
      ctx.lineTo(34, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * 1 PUNKTAS: Ginklų piešimas ant stogo pagal Vizualinę Pakopą (Tier 1..4):
 * - Tier 1 (Lygis 1-9): Bazinė išvaizda (paprastas, mažas ginklas, pilka/juoda)
 * - Tier 2 (Lygis 10-19): „Patobulintas“ (masyvesnis, Kulkosvaidis gauna antrą vamzdį ir t.t.)
 * - Tier 3 (Lygis 20-29): „Elitinis“ (ryškios raudonos, auksinės ar neoninės juostos)
 * - Tier 4 (Lygis 30+): „Legendinis“ (maksimalus dydis + švytinti aura ir dūmų partikulai)
 */
export function drawWeapon(ctx, roofId, roofLevel = 1, muzzleFlash = 0, animTime = 0) {
  if (!roofId || roofId === 'roof_none') return;
  const { tier } = getVisualTierInfo(roofLevel);
  const sizeScale = tier === 1 ? 0.88 : tier === 2 ? 1.08 : tier === 3 ? 1.2 : 1.32;

  ctx.save();

  // Tier 4 (Lygis 30+): Legendinė vos matoma švytinti aura ir maži dūmų partikulai aplink ginklą!
  if (tier >= 4) {
    const pulse = 0.6 + Math.sin(animTime * 0.12) * 0.25;
    ctx.save();
    const grad = ctx.createRadialGradient(2, 0, 4, 2, 0, 26);
    grad.addColorStop(0, `rgba(250, 204, 21, ${0.38 * pulse})`);
    grad.addColorStop(0.6, `rgba(244, 63, 94, ${0.22 * pulse})`);
    grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(2, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Maži dūmų / plazmos partikulai aplink bokštelį
    for (let i = 0; i < 4; i++) {
      const a = animTime * 0.06 + (i * Math.PI) / 2;
      const r = 13 + ((animTime * 0.3 + i * 4) % 9);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(226, 232, 240, 0.55)' : 'rgba(253, 224, 71, 0.7)';
      ctx.beginPath();
      ctx.arc(px, py, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.scale(sizeScale, sizeScale);

  if (roofId === 'weapon_minigun') {
    // Bokštelio pagrindas
    ctx.fillStyle = tier >= 3 ? '#1e293b' : '#334155';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-1, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tier 1: vienas paprastas vamzdis; Tier 2: dvigubas vamzdis; Tier 3+: trigubas elitinis gatlingo blokas!
    const barrelOffsets = tier === 1 ? [0] : tier === 2 ? [-3.6, 3.6] : [-5, 0, 5];
    const barrelLen = tier === 1 ? 16 : tier === 2 ? 20 : 23;
    ctx.fillStyle = tier >= 3 ? '#f8fafc' : '#94a3b8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    for (const by of barrelOffsets) {
      ctx.fillRect(4, by - 1.4, barrelLen, 2.8);
      ctx.strokeRect(4, by - 1.4, barrelLen, 2.8);
    }

    // Tier 3+: Elitinės raudonos ir auksinės juostos ant vamzdžių apkabos
    if (tier >= 3) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(12, -6.5, 3.5, 13);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(17, -6.5, 2.5, 13);
    }

    ctx.fillStyle = tier >= 3 ? '#ef4444' : '#64748b';
    ctx.fillRect(-6, -4, 6, 8);

    if (muzzleFlash > 0) {
      ctx.fillStyle = tier >= 3 ? '#ef4444' : tier === 2 ? '#fb923c' : '#fde047';
      ctx.beginPath();
      ctx.arc(6 + barrelLen, 0, 5 + tier * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (roofId === 'weapon_rocket') {
    ctx.fillStyle = tier >= 3 ? '#1e293b' : '#3f6212';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#0f172a';
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -11, -7.5, 24, 15, 3);
    ctx.fill();
    ctx.stroke();

    // Tier 1: 1 raketa; Tier 2+: dviguba raketų paleidimo sistema!
    const rocketYOffsets = tier === 1 ? [0] : [-4.2, 4.2];
    for (const ry of rocketYOffsets) {
      ctx.fillStyle = tier >= 3 ? '#f43f5e' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(13, ry - 3.5);
      ctx.lineTo(23, ry);
      ctx.lineTo(13, ry + 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (tier >= 3) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-7, -5.5, 14, 2.5);
      ctx.fillRect(-7, 3, 14, 2.5);
    }
  } else if (roofId === 'weapon_laser') {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-1, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tier >= 3 ? '#ec4899' : '#06b6d4';
    ctx.fillRect(3, -3.5, 19, 7);
    ctx.strokeStyle = '#e0f2fe';
    ctx.strokeRect(3, -3.5, 19, 7);

    // Tier 2+: papildomi šoniniai plazmos kondensatoriai
    if (tier >= 2) {
      ctx.fillStyle = tier >= 3 ? '#facc15' : '#22d3ee';
      ctx.fillRect(5, -6.5, 13, 2.2);
      ctx.fillRect(5, 4.3, 13, 2.2);
    }

    ctx.fillStyle = tier >= 4 ? '#fde047' : '#67e8f9';
    ctx.beginPath();
    ctx.arc(-1, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (roofId === 'weapon_shotgun') {
    ctx.fillStyle = tier >= 3 ? '#1e293b' : '#78350f';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#0f172a';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -9, -6.5, 12, 13, 2);
    ctx.fill();
    ctx.stroke();

    const barrelCount = tier === 1 ? 2 : tier === 2 ? 3 : 4;
    ctx.fillStyle = tier >= 3 ? '#f8fafc' : '#cbd5e1';
    for (let b = 0; b < barrelCount; b++) {
      const by = -5.5 + (b / Math.max(1, barrelCount - 1)) * 8.5;
      ctx.fillRect(2, by, 16 + (tier - 1) * 2, 3.2);
      ctx.strokeRect(2, by, 16 + (tier - 1) * 2, 3.2);
    }
    if (tier >= 3) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(8, -6, 3, 12);
    }
  } else if (roofId === 'weapon_flamethrower') {
    ctx.fillStyle = tier >= 3 ? '#991b1b' : '#dc2626';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#0f172a';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -11, -8.5, 13, 17, 4);
    ctx.fill();
    ctx.stroke();

    // Tier 2+: dvigubas liepsnos purkštukas
    const nozzles = tier === 1 ? [0] : [-3.2, 3.2];
    ctx.fillStyle = tier >= 3 ? '#facc15' : '#f59e0b';
    for (const ny of nozzles) {
      ctx.fillRect(2, ny - 2.2, 18, 4.4);
      ctx.strokeRect(2, ny - 2.2, 18, 4.4);
    }
  } else if (roofId === 'weapon_oil') {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = tier >= 3 ? '#22d3ee' : '#facc15';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -12, -8.5, 16, 17, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tier >= 3 ? '#ef4444' : '#facc15';
    ctx.fillRect(-7, -8, 5, 16);
    ctx.fillStyle = '#020617';
    ctx.fillRect(-26, -7, 14, 4);
    ctx.fillRect(-26, 3, 14, 4);
    if (tier >= 2) {
      ctx.fillRect(-26, -2, 14, 4);
    }
  } else if (roofId === 'weapon_mines') {
    const blink = Math.floor(animTime / 10) % 2 === 0;
    ctx.fillStyle = tier >= 3 ? '#0f172a' : '#334155';
    ctx.strokeStyle = tier >= 3 ? '#facc15' : '#0f172a';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -13, -9, 18, 18, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-4, 0, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = blink ? (tier >= 3 ? '#facc15' : '#ef4444') : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-4, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}
