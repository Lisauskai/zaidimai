// Test Build 8 – Išsaugojimo sistema su Senų Išsaugojimų Migracija (Save File Migration):
// Automatiškai išvalo besidubliuojančius daiktus (duplicate items) kuprinėje ir už kiekvieną ištrintą dublikatą kompensuoja jo pardavimo vertę monetomis!

import { GEAR_ITEMS, getSellPrice } from './shop.js';

const STORAGE_KEY_LINAS = 'skaiciu_karalyste_save_linas_v2';
const STORAGE_KEY_LUKAS = 'skaiciu_karalyste_save_lukas_v2';
const STORAGE_KEY_META = 'skaiciu_karalyste_meta_v2';

// BENDRI (GLOBALŪS) PORTALO LAIKO RAKTAI VISIEMS ŽAIDIMAMS KARTU!
export const GLOBAL_TIME_KEY_LINAS = 'bosas_global_time_linas';
export const GLOBAL_TIME_KEY_LUKAS = 'bosas_global_time_lukas';

export const BACKPACK_CAPACITY = 15;
export const DEFAULT_DAILY_TIME_LIMIT_SECONDS = 1200; // 20 minučių (1200 s)

export function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getGlobalTimeKeyForSlot(slotIndexOrId) {
  if (slotIndexOrId === 0 || slotIndexOrId === 'linas') return GLOBAL_TIME_KEY_LINAS;
  return GLOBAL_TIME_KEY_LUKAS;
}

export function loadGlobalPlaytime(slotIndexOrId, fallbackProfile = null) {
  const key = getGlobalTimeKeyForSlot(slotIndexOrId);
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.lastPlayedDate !== today) {
          const fresh = {
            lastPlayedDate: today,
            timePlayedTodaySeconds: 0,
            dailyTimeLimitSeconds: DEFAULT_DAILY_TIME_LIMIT_SECONDS
          };
          localStorage.setItem(key, JSON.stringify(fresh));
          return fresh;
        }
        return {
          lastPlayedDate: today,
          timePlayedTodaySeconds: Math.max(0, Number(parsed.timePlayedTodaySeconds) || 0),
          dailyTimeLimitSeconds: Math.max(60, Number(parsed.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS)
        };
      }
    }
  } catch (e) {
    // Ignoruojame localStorage klaidas
  }

  // Migracija iš seno profilio, jei globalus raktas dar neegzistuoja
  const migratedPlayed =
    fallbackProfile && fallbackProfile.lastPlayedDate === today
      ? Math.max(0, Number(fallbackProfile.timePlayedTodaySeconds) || 0)
      : 0;
  const migratedLimit =
    fallbackProfile && fallbackProfile.lastPlayedDate === today
      ? Math.max(60, Number(fallbackProfile.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS)
      : DEFAULT_DAILY_TIME_LIMIT_SECONDS;

  const initial = {
    lastPlayedDate: today,
    timePlayedTodaySeconds: migratedPlayed,
    dailyTimeLimitSeconds: migratedLimit
  };
  try {
    localStorage.setItem(key, JSON.stringify(initial));
  } catch (e) {
    // Ignoruojame
  }
  return initial;
}

export function saveGlobalPlaytime(slotIndexOrId, timeData) {
  const key = getGlobalTimeKeyForSlot(slotIndexOrId);
  const today = getTodayDateString();
  const payload = {
    lastPlayedDate: timeData.lastPlayedDate || today,
    timePlayedTodaySeconds: Math.max(0, Number(timeData.timePlayedTodaySeconds) || 0),
    dailyTimeLimitSeconds: Math.max(60, Number(timeData.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS)
  };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    // Ignoruojame
  }
  return payload;
}

export const COLOR_PALETTE = [
  { id: 'fire_red', name: 'Ugninė raudona', hex: '#ef4444', glow: '#fca5a5' },
  { id: 'ice_blue', name: 'Ledo mėlyna', hex: '#3b82f6', glow: '#93c5fd' },
  { id: 'emerald_green', name: 'Smaragdo žalia', hex: '#10b981', glow: '#6ee7b7' },
  { id: 'royal_gold', name: 'Karališka auksinė', hex: '#f59e0b', glow: '#fde047' },
  { id: 'shadow_purple', name: 'Tamsos violetinė', hex: '#8b5cf6', glow: '#c4b5fd' },
  { id: 'cyber_cyan', name: 'Žaibo žydra', hex: '#06b6d4', glow: '#67e8f9' }
];

export const SHIELD_EMBLEMS = [
  { id: 'dragon', name: 'Drakonas', icon: '🐉' },
  { id: 'lightning', name: 'Žaibas', icon: '⚡' },
  { id: 'star', name: 'Žvaigždė', icon: '⭐' },
  { id: 'crown', name: 'Karūna', icon: '👑' }
];

export function createBaseHeroProfile(slotIndex) {
  const isLinas = slotIndex === 0;
  return {
    slotIndex,
    id: isLinas ? 'linas' : 'lukas',
    name: isLinas ? 'LINAS' : 'LUKAS',
    grade: isLinas ? 1 : 3, // UŽFIKSUOTA: Linas = 1 Klasė, Lukas = 3 Klasė
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coins: 0,
    crystals: 0,
    unlockedLevel: 1, // 1..50
    completedLevels: {},
    upgrades: {
      speed: 1,        // 1..25 (+3% per lygį)
      jump: 1,         // 1..25 (+2.2% per lygį, 5 lygis = Dvigubas, 15 lygis = Trigubas)
      hearts: 1,       // 1..25 (Gyvybės + energetinis skydas)
      magnet: 1,       // 1..25 (Monetų magnetas)
      wisdom: 1,       // 1..25 (Matematikos aukso daugiklis)
      helper: 1        // 1..25 (50/50 pagalbos užtaisai)
    },
    ownedGear: [
      'armor_none',
      'shield_none',
      'weapon_none',
      'hat_none',
      'cape_none'
    ],
    equippedGear: {
      armor: 'armor_none',
      shield: 'shield_none',
      weapon: 'weapon_none',
      hat: 'hat_none',
      cape: 'cape_none'
    },
    // 15 vietų kuprinė (Inventorius)
    backpack: [],
    customization: {
      armorColor: '#3b82f6',
      shieldColor: '#3b82f6',
      capeColor: '#ef4444',
      shieldEmblem: 'dragon'
    },
    ownedPets: [],
    equippedPet: null,
    petLevels: {
      pet_dragon: 1,
      pet_cyber: 1,
      pet_phoenix: 1
    },
    stats: {
      totalSolved: 0,
      totalMistakes: 0,
      maxStreak: 0,
      currentStreak: 0,
      bossesDefeated: 0,
      perfectLevels: 0,
      coinsCollected: 0,
      enemiesStomped: 0,
      arrowsBlocked: 0
    },
    claimedAchievements: [],
    dailyChallenge: {
      date: getTodayDateString(),
      solvedToday: 0,
      claimed: false
    },
    // Tėvų kontrolė: dienos žaidimo laiko limitas (20 min = 1200 s)
    lastPlayedDate: getTodayDateString(),
    timePlayedTodaySeconds: 0,
    dailyTimeLimitSeconds: DEFAULT_DAILY_TIME_LIMIT_SECONDS
  };
}

class SaveSystem {
  constructor() {
    this.slots = [
      createBaseHeroProfile(0),
      createBaseHeroProfile(1)
    ];
    this.activeSlot = null;
    this.loadAll();
  }

  loadAll() {
    try {
      const rawLinas = localStorage.getItem(STORAGE_KEY_LINAS);
      const rawLukas = localStorage.getItem(STORAGE_KEY_LUKAS);

      if (rawLinas) {
        this.slots[0] = this.sanitizeProfile(JSON.parse(rawLinas), 0);
      } else {
        this.slots[0] = createBaseHeroProfile(0);
      }

      if (rawLukas) {
        this.slots[1] = this.sanitizeProfile(JSON.parse(rawLukas), 1);
      } else {
        this.slots[1] = createBaseHeroProfile(1);
      }

      const rawMeta = localStorage.getItem(STORAGE_KEY_META);
      if (rawMeta) {
        const meta = JSON.parse(rawMeta);
        if (meta && (meta.activeSlot === 0 || meta.activeSlot === 1)) {
          this.activeSlot = meta.activeSlot;
        }
      }

      // Iškart išsaugome migruotus profilius (su kompensuotomis monetomis už išvalytus dublikatus) į localStorage!
      if (rawLinas || rawLukas) {
        this.saveAll();
      }
    } catch (err) {
      console.error('Nepavyko užkrauti Lino ir Luko profilių:', err);
    }
  }

  // Senų išsaugojimų migracija (Save File Migration):
  // Patikrina kuprinę ir įrangą, pašalina visus besidubliuojančius daiktus (palikdama po 1 unikalią kopiją),
  // o už kiekvieną pašalintą dublikatą apskaičiuoja ir grąžina žaidėjui jo pardavimo vertę monetomis!
  migrateDuplicateInventory(rawBackpack, equippedGear, mapIdFn) {
    const cleanBackpack = [];
    const equippedSet = new Set(Object.values(equippedGear || {}).filter((id) => id && !id.endsWith('_none')));
    const seenInBp = new Set();
    let compensatedCoins = 0;
    let duplicatesRemoved = 0;

    for (const rawId of rawBackpack) {
      const id = mapIdFn(rawId);
      if (!id || id.endsWith('_none')) continue;

      const isDuplicateOrOverflow =
        equippedSet.has(id) ||
        seenInBp.has(id) ||
        cleanBackpack.length >= BACKPACK_CAPACITY;

      if (isDuplicateOrOverflow) {
        const itemDef = GEAR_ITEMS.find((g) => g.id === id);
        const sellVal = getSellPrice(itemDef);
        compensatedCoins += sellVal;
        duplicatesRemoved++;
      } else {
        seenInBp.add(id);
        cleanBackpack.push(id);
      }
    }

    return { cleanBackpack, compensatedCoins, duplicatesRemoved };
  }

  sanitizeProfile(profile, slotIndex) {
    const def = createBaseHeroProfile(slotIndex);
    if (!profile || typeof profile !== 'object') return def;

    const legacyItemMap = {
      shield_wooden: 'shield_wood',
      shield_bronze: 'shield_blue_crest',
      weapon_dagger: 'weapon_wood',
      weapon_sword: 'weapon_iron_sword',
      weapon_dragon_sword: 'weapon_dragon_blade',
      weapon_bow_wood: 'weapon_bow_hunter',
      weapon_crossbow: 'weapon_bow_elven',
      weapon_bow_fire: 'weapon_bow_phoenix',
      weapon_wand: 'weapon_blue_frost',
      weapon_hammer: 'weapon_gold_paladin'
    };
    const mapId = (id) => legacyItemMap[id] || id;

    const rawEq = { ...def.equippedGear, ...(profile.equippedGear || {}) };
    const equippedGear = {
      armor: mapId(rawEq.armor),
      shield: mapId(rawEq.shield),
      weapon: mapId(rawEq.weapon),
      hat: mapId(rawEq.hat),
      cape: mapId(rawEq.cape)
    };
    const ownedGear = Array.from(new Set([...def.ownedGear, ...(profile.ownedGear || []).map(mapId)]));

    const sourceBackpack = Array.isArray(profile.backpack)
      ? profile.backpack
      : (profile.ownedGear || []).filter((id) => id && !id.endsWith('_none'));

    const { cleanBackpack, compensatedCoins, duplicatesRemoved } = this.migrateDuplicateInventory(
      sourceBackpack,
      equippedGear,
      mapId
    );

    const updatedCoins = (Number(profile.coins) || 0) + compensatedCoins;
    if (duplicatesRemoved > 0) {
      console.info(
        `[Save Migration] Profilis „${slotIndex === 0 ? 'LINAS' : 'LUKAS'}“: išvalyti ${duplicatesRemoved} besidubliuojantys daiktai, kompensuota +${compensatedCoins} 🪙!`
      );
    }

    const merged = {
      ...def,
      ...profile,
      slotIndex,
      id: slotIndex === 0 ? 'linas' : 'lukas',
      name: slotIndex === 0 ? 'LINAS' : 'LUKAS',
      grade: slotIndex === 0 ? 1 : 3,
      coins: updatedCoins,
      upgrades: { ...def.upgrades, ...(profile.upgrades || {}) },
      ownedGear,
      equippedGear,
      backpack: cleanBackpack,
      customization: { ...def.customization, ...(profile.customization || {}) },
      ownedPets: Array.isArray(profile.ownedPets) ? [...profile.ownedPets] : [],
      petLevels: { ...def.petLevels, ...(profile.petLevels || {}) },
      stats: { ...def.stats, ...(profile.stats || {}) },
      claimedAchievements: Array.isArray(profile.claimedAchievements) ? [...profile.claimedAchievements] : [],
      dailyChallenge: { ...def.dailyChallenge, ...(profile.dailyChallenge || {}) },
      lastPlayedDate: typeof profile.lastPlayedDate === 'string' ? profile.lastPlayedDate : '',
      timePlayedTodaySeconds: Math.max(0, Number(profile.timePlayedTodaySeconds) || 0),
      dailyTimeLimitSeconds: Math.max(60, Number(profile.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS)
    };

    this.ensureDailyPlaytimeFresh(merged);
    return merged;
  }

  // Sinchronizuojame žaidimo laiką su globaliu portalo raktu (`bosas_global_time_linas` / `bosas_global_time_lukas`)
  ensureDailyPlaytimeFresh(profile) {
    if (!profile) return;
    const today = getTodayDateString();
    if (profile.dailyChallenge && profile.dailyChallenge.date !== today) {
      profile.dailyChallenge = { date: today, solvedToday: 0, claimed: false };
    }
    const globalTime = loadGlobalPlaytime(profile.slotIndex, profile);
    profile.lastPlayedDate = globalTime.lastPlayedDate;
    profile.timePlayedTodaySeconds = globalTime.timePlayedTodaySeconds;
    profile.dailyTimeLimitSeconds = globalTime.dailyTimeLimitSeconds;
  }

  saveGlobalTimeFromProfile(profile) {
    if (!profile) return;
    saveGlobalPlaytime(profile.slotIndex, {
      lastPlayedDate: profile.lastPlayedDate || getTodayDateString(),
      timePlayedTodaySeconds: profile.timePlayedTodaySeconds,
      dailyTimeLimitSeconds: profile.dailyTimeLimitSeconds
    });
  }

  saveAll() {
    try {
      const now = new Date().toISOString();
      if (this.slots[0]) {
        this.slots[0].slotIndex = 0;
        this.slots[0].name = 'LINAS';
        this.slots[0].grade = 1;
        this.slots[0].updatedAt = now;
        localStorage.setItem(STORAGE_KEY_LINAS, JSON.stringify(this.slots[0]));
      }
      if (this.slots[1]) {
        this.slots[1].slotIndex = 1;
        this.slots[1].name = 'LUKAS';
        this.slots[1].grade = 3;
        this.slots[1].updatedAt = now;
        localStorage.setItem(STORAGE_KEY_LUKAS, JSON.stringify(this.slots[1]));
      }
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify({ activeSlot: this.activeSlot }));
    } catch (err) {
      console.error('Nepavyko išsaugoti žaidimo:', err);
    }
  }

  selectSlot(slotIndex) {
    if (slotIndex === 0 || slotIndex === 1) {
      this.activeSlot = slotIndex;
      const p = this.slots[slotIndex];
      this.ensureDailyPlaytimeFresh(p);
      this.saveAll();
      return p;
    }
    return null;
  }

  resetSlot(slotIndex) {
    if (slotIndex === 0 || slotIndex === 1) {
      this.slots[slotIndex] = createBaseHeroProfile(slotIndex);
      this.ensureDailyPlaytimeFresh(this.slots[slotIndex]);
      this.saveAll();
    }
  }

  getActiveProfile() {
    if (this.activeSlot === null) return null;
    return this.slots[this.activeSlot];
  }

  exportData() {
    const payload = {
      game: 'SkaiciuKaralyste_TestBuild5',
      version: 5,
      exportedAt: new Date().toISOString(),
      slots: this.slots
    };
    return JSON.stringify(payload, null, 2);
  }

  exportCode() {
    const json = this.exportData();
    return btoa(encodeURIComponent(json));
  }

  importData(inputString) {
    try {
      let jsonStr = inputString.trim();
      if (!jsonStr.startsWith('{')) {
        jsonStr = decodeURIComponent(atob(jsonStr));
      }
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.slots) || parsed.slots.length < 2) {
        throw new Error('Netinkamas išsaugojimo failo formatas.');
      }
      this.slots = [
        this.sanitizeProfile(parsed.slots[0], 0),
        this.sanitizeProfile(parsed.slots[1], 1)
      ];
      this.saveAll();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Nepavyko importuoti duomenų. Patikrinkite kodą arba JSON failą.' };
    }
  }
}

export const saveSystem = new SaveSystem();
