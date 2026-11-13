// Test Build 7 (Dalis 2):
// 4. Pašalintas spalvų keitimas – sukurta 38+ atskirų daiktų su fiksuota unikalia išvaizda (100% atitikimas tarp ikonos, pavadinimo ir Canvas piešinio!).
// 5. Kalvės ir Inventoriaus suskirstymas į aiškias korteles: [Ginklai] [Šarvai ir Šalmai] [Skydai] [Apsiaustai] [Rinkiniai (Sets)] [Augintiniai].
// 6. Nauja „Loot“ sistema:
//    - Kalvėje perkami TIK patys paprasčiausi baziniai daiktai (source: 'shop') ir augintiniai.
//    - Vidutiniai ir geri daiktai (source: 'loot') RANDAMI skryniose, duryse ir „Proto Žvaigždėse“.
//    - Epiški / Set daiktai (source: 'boss_set') iškrenta TIK nugalėjus Bosą lygio pabaigoje!

export const BACKPACK_CAPACITY = 15;

export const UPGRADE_CATEGORIES = [
  {
    id: 'speed',
    name: 'Bėgimo Greitis',
    icon: '👟',
    maxLevel: 25,
    baseCost: 160,
    costGrowth: 2.38,
    description: 'Herojus greičiau bėga ir lengviau įsibėgėja prieš šuolius.',
    effectText: (lvl) => `+${(lvl - 1) * 3}% greičio (Lygis ${lvl}/25)`
  },
  {
    id: 'jump',
    name: 'Šuolio Spyruoklės',
    icon: '🦘',
    maxLevel: 25,
    baseCost: 200,
    costGrowth: 2.42,
    description: 'Aukštesnis šuolis! 5 lygyje atrakina Dvigubą šuolį, 15 lygyje – Trigubą šuolį!',
    effectText: (lvl) =>
      lvl >= 15
        ? `Trigubas šuolis +${Math.round((lvl - 1) * 2.2)}% aukščio`
        : lvl >= 5
          ? `Dvigubas šuolis +${Math.round((lvl - 1) * 2.2)}% aukščio`
          : `+${Math.round((lvl - 1) * 2.2)}% šuolio aukščio (5 lyg. – dvigubas!)`
  },
  {
    id: 'hearts',
    name: 'Gyvybės Širdelės',
    icon: '❤️',
    maxLevel: 25,
    baseCost: 260,
    costGrowth: 2.48,
    description: 'Prideda papildomų širdelių ir apsauginių burbulų kiekvieno lygio pradžioje.',
    effectText: (lvl) => `${3 + Math.floor((lvl - 1) / 3)} ❤️ bazinės ir ${Math.floor((lvl - 1) / 4)} 🫧 skydai`
  },
  {
    id: 'magnet',
    name: 'Monetų Magnetas',
    icon: '🧲',
    maxLevel: 25,
    baseCost: 175,
    costGrowth: 2.36,
    description: 'Pritraukia monetas iš toli – nebereikia užlipti tiesiai ant kiekvienos monetos!',
    effectText: (lvl) => `Spindulys: ${45 + (lvl - 1) * 14} px`
  },
  {
    id: 'wisdom',
    name: 'Matematikos Išmintis',
    icon: '📘',
    maxLevel: 25,
    baseCost: 220,
    costGrowth: 2.44,
    description: 'Už kiekvieną išspręstą matematikos užduočių seriją gauni kur kas daugiau aukso!',
    effectText: (lvl) => `+${(lvl - 1) * 12}% aukso už matematiką`
  },
  {
    id: 'helper',
    name: 'Žaibo Pagalba (50/50)',
    icon: '⚡',
    maxLevel: 25,
    baseCost: 240,
    costGrowth: 2.45,
    description: 'Matematikos lange leidžia paspausti „⚡ Pagalba“ ir paslėpti neteisingą atsakymą!',
    effectText: (lvl) => `${1 + Math.floor(lvl / 3)} pagalbos įkrovimai lygyje`,
    getEffectText(lvl) { return this.effectText(lvl); }
  }
].map((u) => ({
  ...u,
  getEffectText(lvl) { return u.effectText(lvl); }
}));

export const STAT_UPGRADES = UPGRADE_CATEGORIES;

// Test Build 8: Stati eksponentinė kainų kreivė (nuo 5 iki 10+ lygio kainos auga iki dešimčių ir šimtų tūkstančių monetų!)
export function getUpgradeCost(statDef, currentLevel) {
  if (!statDef || currentLevel >= (statDef.maxLevel || 25)) return null;
  const raw = statDef.baseCost * Math.pow(statDef.costGrowth, currentLevel - 1);
  if (raw >= 10000) return Math.round(raw / 500) * 500;
  if (raw >= 1000) return Math.round(raw / 50) * 50;
  return Math.round(raw / 5) * 5;
}

// ==================== SPALVŲ PALETĖ IR „MADOS SIELOS“ (COLOR SYNERGY) ====================
// Kiekvienas aprangos daiktas (Šalmas, Šarvai, Skydas, Apsiaustas) turi griežtą `themeColor` parametrą,
// kuris 100% sinchronizuoja daikto pavadinimą, SVG ikoną ir Canvas piešinį ant herojaus!
export const THEME_COLOR_PALETTE = {
  red: {
    id: 'red',
    label: 'Raudona',
    hex: '#dc2626',
    trimHex: '#fde047',
    beltHex: '#7f1d1d',
    plumeHex: '#ef4444'
  },
  gold: {
    id: 'gold',
    label: 'Auksinė',
    hex: '#eab308',
    trimHex: '#fef08a',
    beltHex: '#a16207',
    plumeHex: '#facc15'
  },
  dark: {
    id: 'dark',
    label: 'Tamsi / Juoda',
    hex: '#1e293b',
    trimHex: '#94a3b8',
    beltHex: '#0f172a',
    plumeHex: '#475569'
  },
  green: {
    id: 'green',
    label: 'Žalia',
    hex: '#16a34a',
    trimHex: '#fde047',
    beltHex: '#14532d',
    plumeHex: '#4ade80'
  },
  blue: {
    id: 'blue',
    label: 'Mėlyna',
    hex: '#2563eb',
    trimHex: '#93c5fd',
    beltHex: '#1e3a8a',
    plumeHex: '#38bdf8'
  },
  brown: {
    id: 'brown',
    label: 'Ruda',
    hex: '#92400e',
    trimHex: '#d97706',
    beltHex: '#451a03',
    plumeHex: '#f59e0b'
  },
  silver: {
    id: 'silver',
    label: 'Sidabrinė',
    hex: '#64748b',
    trimHex: '#e2e8f0',
    beltHex: '#334155',
    plumeHex: '#38bdf8'
  },
  purple: {
    id: 'purple',
    label: 'Kosminė Violetinė',
    hex: '#6b21a8',
    trimHex: '#38bdf8',
    beltHex: '#facc15',
    plumeHex: '#a855f7'
  }
};

// Jeigu Šalmas, Šarvai, Skydas ir Apsiaustas (4 daiktai) turi TĄ PATĮ `themeColor` parametrą,
// herojus gauna „Mados Sielos“ (Color Synergy) vizualinę transformaciją ir papildomą bonusą!
export const COLOR_SYNERGIES = {
  red: {
    color: 'red',
    name: '🔥 Mados Siela: Baisus Karžygys (Pilna Raudona)',
    shortName: '🔥 Baisus Karžygys (+1 ⚔️ DMG)',
    bonusDamage: 1,
    bonusText: '4/4 Raudona Apranga: Raudonai švytinčios akys, tamsūs dūmai ir +1 ⚔️ Ginklo Žala!'
  },
  gold: {
    color: 'gold',
    name: '✨ Mados Siela: Elegantiškas Karalius (Pilna Auksinė)',
    shortName: '✨ Elegantiškas (+10% 🪙)',
    coinBonusPct: 0.10,
    bonusText: '4/4 Auksinė Apranga: Karališka aura, auksinės žvaigždutės bėgant ir +10% daugiau randamų monetų!'
  },
  dark: {
    color: 'dark',
    name: '🥷 Mados Siela: Šešėlių Nindzė (Pilna Tamsi/Juoda)',
    shortName: '🥷 Šešėlių Nindzė (Greitas pasilenkimas!)',
    crouchSpeedBoost: true,
    bonusText: '4/4 Tamsi Apranga: Pusiau permatomas (0.8), juodi šešėliai ir pasilenkus (⬇️) padidėja greitis!'
  },
  green: {
    color: 'green',
    name: '🍃 Mados Siela: Gamtos Sargas (Pilna Žalia)',
    shortName: '🍃 Gamtos Sargas (+1 ❤️)',
    bonusHearts: 1,
    bonusText: '4/4 Žalia Apranga: Aplink skraido žali lapeliai ir herojus gauna +1 ❤️ Širdelę!'
  },
  blue: {
    color: 'blue',
    name: '❄️ Mados Siela: Ledo Riteris (Pilna Mėlyna)',
    shortName: '❄️ Ledo Riteris (+1 🫧)',
    bonusShield: 1,
    bonusText: '4/4 Mėlyna Apranga: Šerkšno aura ir +1 🫧 apsauginis burbulas!'
  }
};

// ==================== 3 KOLEKCINIAI DAIKTŲ RINKINIAI (ITEM SETS – TIK IŠ BOSŲ!) ====================
export const ITEM_SETS = [
  {
    id: 'iron_set',
    name: '🛡️ Geležinio Karžygio Rinkinys',
    themeColor: '#60a5fa',
    auraType: 'iron',
    pieces: ['hat_iron', 'armor_knight', 'weapon_iron_sword', 'shield_iron'],
    bonusHearts: 1,
    bonusDamage: 1,
    bonusText: '4/4 Rinkinio Bonusas: +1 ❤️ Širdelė ir +1 ⚔️ Ginklo Žala!'
  },
  {
    id: 'dragon_set',
    name: '🔥 Ugnies Drakono Rinkinys',
    themeColor: '#f97316',
    auraType: 'fire',
    pieces: ['hat_dragon', 'armor_dragon', 'weapon_dragon_blade', 'shield_dragon'],
    bonusHearts: 2,
    bonusDamage: 2,
    bonusText: '4/4 Rinkinio Bonusas: +2 ❤️ Širdelės ir +2 ⚔️ Ginklo Žala!'
  },
  {
    id: 'cosmic_set',
    name: '🌌 Audros ir Galaktikos Rinkinys',
    themeColor: '#38bdf8',
    auraType: 'cosmic',
    pieces: ['hat_crown', 'armor_cosmic', 'weapon_excalibur', 'shield_aegis'],
    bonusHearts: 3,
    bonusDamage: 3,
    bonusText: '4/4 Rinkinio Bonusas: +3 ❤️ Širdelės ir +3 ⚔️ Ginklo Žala!'
  }
];

// ==================== VISI ŽAIDIMO DAIKTAI (100% VIZUALINIS ATITIKIMAS SU CANVAS) ====================
// source:
//   'starter'  - pradinis tuščias lizdas
//   'shop'     - perkama pas Kalvį už monetas (TIK patys paprasčiausi baziniai daiktai!)
//   'loot'     - randama lygio skryniose, duryse ir „Proto Žvaigždėse“!
//   'boss_set' - Epiški / Set daiktai, kurie iškrenta TIK nugalėjus Bosą!
export const GEAR_ITEMS = [
  // ==================== 1. GINKLAI (WEAPON) ====================
  {
    id: 'weapon_none',
    slot: 'weapon',
    source: 'starter',
    tier: 'Pradinis',
    canBuyInShop: false,
    name: 'Medinė Lazda (1 DMG)',
    icon: '🦯',
    priceCoins: 0,
    priceCrystals: 0,
    bonusText: '⚔️ Artima kova: 1 Žala (DMG)',
    bonus: { damage: 1, isMelee: true },
    visual: { kind: 'stick', bladeColor: '#a16207', hiltColor: '#78350f', gemColor: '#fde047' }
  },
  // --- KALVĖS BAZINIAI GINKLAI (source: 'shop') ---
  {
    id: 'weapon_wood',
    slot: 'weapon',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    canBuyInShop: true,
    name: 'Medinis Pradedančiojo Kardas (1 DMG)',
    icon: '🗡️',
    priceCoins: 100,
    priceCrystals: 0,
    bonusText: '⚔️ Artima kova: 1 Žala (DMG) ir +5% aukso',
    bonus: { damage: 1, isMelee: true, mathGoldPct: 0.05 },
    visual: { kind: 'sword', bladeColor: '#b45309', hiltColor: '#78350f', gemColor: '#fcd34d' }
  },
  {
    id: 'weapon_bow_hunter',
    slot: 'weapon',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    canBuyInShop: true,
    name: 'Paprastas Medinis Lankas (1 DMG)',
    icon: '🏹',
    priceCoins: 180,
    priceCrystals: 0,
    bonusText: '🏹 Nuotolinė kova (parabolė): šaudo strėles lanku (1 DMG)',
    bonus: { damage: 1, isRanged: true, shootCooldown: 55, arrowSpeed: 7.0, arrowColor: '#fde047' },
    visual: { kind: 'bow', bowColor: '#92400e', trimColor: '#fde047', stringColor: '#e2e8f0' }
  },
  {
    id: 'weapon_boomerang_wood',
    slot: 'weapon',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    canBuyInShop: true,
    name: 'Medinis Bumerangas (1 DMG ×2)',
    icon: '🪃',
    priceCoins: 220,
    priceCrystals: 0,
    bonusText: '🪃 Bumerangas: skrenda kiaurai priešus į priekį IR atgal (gali kirsti 2 kartus po 1 DMG)!',
    bonus: { damage: 1, isBoomerang: true, boomerangSpeed: 8.6, boomerangMaxDist: 430, mathGoldPct: 0.08 },
    visual: { kind: 'boomerang', bladeColor: '#b45309', trimColor: '#fde047', gemColor: '#22c55e' }
  },
  // --- SKRYNIŲ IR PROTO ŽVAIGŽDŽIŲ LOOT GINKLAI (source: 'loot') ---
  {
    id: 'weapon_green_dagger',
    slot: 'weapon',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    canBuyInShop: false,
    name: 'Žaliasis Smaragdo Kardas (2 DMG)',
    icon: '🗡️',
    priceCoins: 420,
    priceCrystals: 0,
    bonusText: '⚔️ Artima kova: 2 Žala (DMG) ir +15% aukso',
    bonus: { damage: 2, isMelee: true, mathGoldPct: 0.15 },
    visual: { kind: 'sword', bladeColor: '#22c55e', hiltColor: '#14532d', gemColor: '#86efac' }
  },
  {
    id: 'weapon_blue_frost',
    slot: 'weapon',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    canBuyInShop: false,
    name: 'Mėlynasis Ledo Kardas (2 DMG)',
    icon: '⚔️',
    priceCoins: 560,
    priceCrystals: 0,
    bonusText: '⚔️ Artima kova: 2 Žala (DMG) ir +20% aukso',
    bonus: { damage: 2, isMelee: true, mathGoldPct: 0.2 },
    visual: { kind: 'sword', bladeColor: '#38bdf8', hiltColor: '#1e3a8a', gemColor: '#e0f2fe' }
  },
  {
    id: 'weapon_broadsword',
    slot: 'weapon',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    canBuyInShop: false,
    name: 'Raudonasis Rubino Kalavijas (3 DMG)',
    icon: '⚔️',
    priceCoins: 950,
    priceCrystals: 1,
    bonusText: '⚔️ Artima kova: 3 Žala (DMG) ir +30% aukso',
    bonus: { damage: 3, isMelee: true, mathGoldPct: 0.3 },
    visual: { kind: 'broadsword', bladeColor: '#ef4444', hiltColor: '#f59e0b', gemColor: '#fef08a' }
  },
  {
    id: 'weapon_gold_paladin',
    slot: 'weapon',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    canBuyInShop: false,
    name: 'Auksinis Paladino Kardas (3 DMG)',
    icon: '⚔️',
    priceCoins: 1350,
    priceCrystals: 2,
    bonusText: '⚔️ Artima kova: 3 Žala (DMG), +40% aukso ir +1 ⚡',
    bonus: { damage: 3, isMelee: true, mathGoldPct: 0.4, extraHelper: 1 },
    visual: { kind: 'broadsword', bladeColor: '#facc15', hiltColor: '#b45309', gemColor: '#ffffff' }
  },
  {
    id: 'weapon_bow_elven',
    slot: 'weapon',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    canBuyInShop: false,
    name: 'Žaliasis Elfų Lankas (2 DMG)',
    icon: '🏹',
    priceCoins: 680,
    priceCrystals: 1,
    bonusText: '🏹 Nuotolinė kova (parabolė): žalios strėlės lanku (2 DMG) ir +20% aukso',
    bonus: { damage: 2, isRanged: true, shootCooldown: 42, arrowSpeed: 7.6, arrowColor: '#4ade80', mathGoldPct: 0.2 },
    visual: { kind: 'bow', bowColor: '#16a34a', trimColor: '#fde047', stringColor: '#dcfce7' }
  },
  {
    id: 'weapon_bow_phoenix',
    slot: 'weapon',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    canBuyInShop: false,
    name: 'Raudonasis Ugnies Lankas (3 DMG)',
    icon: '🏹',
    priceCoins: 1450,
    priceCrystals: 2,
    bonusText: '🏹 Nuotolinė kova (parabolė): ugninės strėlės lanku (3 DMG) ir +40% aukso',
    bonus: { damage: 3, isRanged: true, shootCooldown: 34, arrowSpeed: 8.2, arrowColor: '#f97316', mathGoldPct: 0.4 },
    visual: { kind: 'bow', bowColor: '#dc2626', trimColor: '#facc15', stringColor: '#fef08a' }
  },
  {
    id: 'weapon_boomerang_iron',
    slot: 'weapon',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    canBuyInShop: false,
    name: 'Geležinis Vėjo Bumerangas (2 DMG ×2)',
    icon: '🪃',
    priceCoins: 760,
    priceCrystals: 1,
    bonusText: '🪃 Bumerangas: skrenda kiaurai priešus į priekį ir atgal (2 DMG ×2) ir +22% aukso!',
    bonus: { damage: 2, isBoomerang: true, boomerangSpeed: 9.8, boomerangMaxDist: 470, mathGoldPct: 0.22 },
    visual: { kind: 'boomerang', bladeColor: '#94a3b8', trimColor: '#38bdf8', gemColor: '#e0f2fe' }
  },
  {
    id: 'weapon_boomerang_star',
    slot: 'weapon',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    canBuyInShop: false,
    name: 'Žvaigždžių Kosminis Bumerangas (3 DMG ×2)',
    icon: '🪃',
    priceCoins: 1680,
    priceCrystals: 2,
    bonusText: '🪃 Kosminis Bumerangas: kerta kiaurai priešus pirmyn ir atgal (3 DMG ×2) ir +45% aukso!',
    bonus: { damage: 3, isBoomerang: true, boomerangSpeed: 11.0, boomerangMaxDist: 510, mathGoldPct: 0.45 },
    visual: { kind: 'boomerang', bladeColor: '#a855f7', trimColor: '#facc15', gemColor: '#38bdf8' }
  },
  // --- BOSŲ SETO GINKLAI (source: 'boss_set') ---
  {
    id: 'weapon_iron_sword',
    slot: 'weapon',
    source: 'boss_set',
    tier: 'Epinis (Boso Set)',
    setId: 'iron_set',
    canBuyInShop: false,
    name: 'Geležinis Karžygio Kardas (2 DMG)',
    icon: '⚔️',
    priceCoins: 1200,
    priceCrystals: 2,
    bonusText: '⚔️ Artima kova: 2 Žala (DMG) ir +25% aukso (Geležinio Karžygio Rinkinys)',
    bonus: { damage: 2, isMelee: true, mathGoldPct: 0.25 },
    visual: { kind: 'broadsword', bladeColor: '#cbd5e1', hiltColor: '#3b82f6', gemColor: '#fde047' }
  },
  {
    id: 'weapon_dragon_blade',
    slot: 'weapon',
    source: 'boss_set',
    tier: 'Legendinis (Boso Set)',
    setId: 'dragon_set',
    canBuyInShop: false,
    name: 'Ugnies Drakono Kalavijas (3 DMG)',
    icon: '🔥',
    priceCoins: 5500,
    priceCrystals: 12,
    bonusText: '⚔️ Artima kova: 3 Žala (DMG) ir +65% aukso (Ugnies Drakono Rinkinys)',
    bonus: { damage: 3, isMelee: true, mathGoldPct: 0.65 },
    visual: { kind: 'flame_sword', bladeColor: '#f97316', hiltColor: '#7f1d1d', gemColor: '#fde047' }
  },
  {
    id: 'weapon_excalibur',
    slot: 'weapon',
    source: 'boss_set',
    tier: 'Mitinis (Boso Set)',
    setId: 'cosmic_set',
    canBuyInShop: false,
    name: 'Mitinis „Ekskaliburas“ (4 DMG)',
    icon: '🗡️',
    priceCoins: 16000,
    priceCrystals: 35,
    bonusText: '⚔️ Mitinis kirtis: 4 Žala (DMG), +120% aukso, +2 🫧 (Galaktikos Rinkinys)',
    bonus: { damage: 4, isMelee: true, mathGoldPct: 1.2, extraShield: 2, extraHelper: 2 },
    visual: { kind: 'cosmic_sword', bladeColor: '#a855f7', hiltColor: '#facc15', gemColor: '#38bdf8' }
  },

  // ==================== 2. ŠARVAI (ARMOR) ====================
  {
    id: 'armor_none',
    slot: 'armor',
    source: 'starter',
    tier: 'Pradinis',
    themeColor: 'none',
    canBuyInShop: false,
    name: 'Baziniai Marškinėliai (3 ❤️)',
    icon: '👕',
    priceCoins: 0,
    priceCrystals: 0,
    bonusText: '3 ❤️ širdelės (bazinis žmogeliukas)',
    bonus: { armorHearts: 0 },
    visual: { bodyColor: '#475569', trimColor: '#94a3b8', beltColor: '#334155', shoulders: false }
  },
  // --- KALVĖS BAZINIAI ŠARVAI (source: 'shop') ---
  {
    id: 'armor_linen',
    slot: 'armor',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    themeColor: 'dark',
    canBuyInShop: true,
    name: 'Tamsūs Nakties Marškiniai (3 ❤️)',
    icon: '👕',
    priceCoins: 90,
    priceCrystals: 0,
    bonusText: '3 ❤️ širdelės ir +8% aukso (Tamsi apranga)',
    bonus: { armorHearts: 0, mathGoldPct: 0.08 },
    visual: { bodyColor: '#1e293b', trimColor: '#94a3b8', beltColor: '#0f172a', shoulders: false }
  },
  {
    id: 'armor_leather',
    slot: 'armor',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    themeColor: 'brown',
    canBuyInShop: true,
    name: 'Rudi Odiniai Žvalgo Šarvai (4 ❤️)',
    icon: '🦺',
    priceCoins: 190,
    priceCrystals: 0,
    bonusText: '4 ❤️ širdelės (+1 ❤️ gyvybė ir +10% aukso)',
    bonus: { armorHearts: 1, mathGoldPct: 0.1 },
    visual: { bodyColor: '#92400e', trimColor: '#d97706', beltColor: '#451a03', shoulders: false }
  },
  // --- SKRYNIŲ IR PROTO ŽVAIGŽDŽIŲ LOOT ŠARVAI (source: 'loot') ---
  {
    id: 'armor_green_ranger',
    slot: 'armor',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'green',
    canBuyInShop: false,
    name: 'Žalieji Miško Žvalgo Šarvai (4 ❤️)',
    icon: '🦺',
    priceCoins: 450,
    priceCrystals: 0,
    bonusText: '4 ❤️ širdelės (+1 ❤️, +5% greičio ir +15% aukso)',
    bonus: { armorHearts: 1, speedPct: 0.05, mathGoldPct: 0.15 },
    visual: { bodyColor: '#16a34a', trimColor: '#fde047', beltColor: '#14532d', shoulders: true }
  },
  {
    id: 'armor_blue_guard',
    slot: 'armor',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'blue',
    canBuyInShop: false,
    name: 'Mėlynieji Sargybinio Šarvai (5 ❤️)',
    icon: '🥋',
    priceCoins: 680,
    priceCrystals: 1,
    bonusText: '5 ❤️ širdelės (+2 ❤️ gyvybės ir +20% aukso)',
    bonus: { armorHearts: 2, mathGoldPct: 0.2 },
    visual: { bodyColor: '#2563eb', trimColor: '#93c5fd', beltColor: '#1e3a8a', shoulders: true }
  },
  {
    id: 'armor_dark_shadow',
    slot: 'armor',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'dark',
    canBuyInShop: false,
    name: 'Juodieji Šešėlių Nindzės Šarvai (5 ❤️)',
    icon: '🥷',
    priceCoins: 740,
    priceCrystals: 1,
    bonusText: '5 ❤️ širdelės (+2 ❤️, +7% greičio ir +22% aukso)',
    bonus: { armorHearts: 2, speedPct: 0.07, mathGoldPct: 0.22 },
    visual: { bodyColor: '#1e293b', trimColor: '#94a3b8', beltColor: '#0f172a', shoulders: true }
  },
  {
    id: 'armor_chainmail',
    slot: 'armor',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'silver',
    canBuyInShop: false,
    name: 'Sidabriniai Žiediniai Šarvai (5 ❤️)',
    icon: '🥋',
    priceCoins: 780,
    priceCrystals: 1,
    bonusText: '5 ❤️ širdelės (+2 ❤️ gyvybės ir +25% aukso)',
    bonus: { armorHearts: 2, mathGoldPct: 0.25 },
    visual: { bodyColor: '#64748b', trimColor: '#e2e8f0', beltColor: '#334155', shoulders: true }
  },
  {
    id: 'armor_red_crimson',
    slot: 'armor',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'red',
    canBuyInShop: false,
    name: 'Raudonieji Riterio Šarvai (5 ❤️)',
    icon: '🥋',
    priceCoins: 980,
    priceCrystals: 1,
    bonusText: '5 ❤️ širdelės (+2 ❤️, +1 🫧 burbulas ir +30% aukso)',
    bonus: { armorHearts: 2, extraShield: 1, mathGoldPct: 0.3 },
    visual: { bodyColor: '#dc2626', trimColor: '#fde047', beltColor: '#7f1d1d', shoulders: true }
  },
  {
    id: 'armor_gold_paladin',
    slot: 'armor',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'gold',
    canBuyInShop: false,
    name: 'Auksiniai Paladino Šarvai (6 ❤️)',
    icon: '🥋',
    priceCoins: 1450,
    priceCrystals: 2,
    bonusText: '6 ❤️ širdelės (+3 ❤️, +1 🫧 burbulas ir +40% aukso)',
    bonus: { armorHearts: 3, extraShield: 1, mathGoldPct: 0.4 },
    visual: { bodyColor: '#eab308', trimColor: '#fef08a', beltColor: '#a16207', shoulders: true }
  },
  // --- BOSŲ SETO ŠARVAI (source: 'boss_set') ---
  {
    id: 'armor_knight',
    slot: 'armor',
    source: 'boss_set',
    tier: 'Epinis (Boso Set)',
    setId: 'iron_set',
    themeColor: 'silver',
    canBuyInShop: false,
    name: 'Geležiniai Karžygio Šarvai (5 ❤️)',
    icon: '🥋',
    priceCoins: 1200,
    priceCrystals: 2,
    bonusText: '5 ❤️ širdelės (+2 ❤️ ir +25% aukso) (Geležinio Karžygio Rinkinys)',
    bonus: { armorHearts: 2, mathGoldPct: 0.25 },
    visual: { bodyColor: '#64748b', trimColor: '#38bdf8', beltColor: '#1e293b', shoulders: true }
  },
  {
    id: 'armor_dragon',
    slot: 'armor',
    source: 'boss_set',
    tier: 'Legendinis (Boso Set)',
    setId: 'dragon_set',
    themeColor: 'red',
    canBuyInShop: false,
    name: 'Raudonieji Ugnies Drakono Šarvai (6 ❤️ + ½ žalos!)',
    icon: '🔥',
    priceCoins: 6000,
    priceCrystals: 14,
    bonusText: '6 ❤️ širdelės, priešai atima tik 0.5 ❤️! (Ugnies Drakono Rinkinys)',
    bonus: { armorHearts: 3, halfDamage: true, mathGoldPct: 0.5 },
    visual: { bodyColor: '#dc2626', trimColor: '#f97316', beltColor: '#fde047', shoulders: true }
  },
  {
    id: 'armor_cosmic',
    slot: 'armor',
    source: 'boss_set',
    tier: 'Mitinis (Boso Set)',
    setId: 'cosmic_set',
    themeColor: 'purple',
    canBuyInShop: false,
    name: 'Mitiniai Galaktikos Šarvai (7 ❤️ + ½ žalos!)',
    icon: '🌌',
    priceCoins: 18000,
    priceCrystals: 45,
    bonusText: '7 ❤️ širdelės, 0.5 ❤️ žala, +2 🫧 burbulai (Galaktikos Rinkinys)',
    bonus: { armorHearts: 4, halfDamage: true, extraShield: 2, mathGoldPct: 1.0, speedPct: 0.1 },
    visual: { bodyColor: '#6b21a8', trimColor: '#38bdf8', beltColor: '#facc15', shoulders: true }
  },

  // ==================== 3. ŠALMAI (HAT) ====================
  {
    id: 'hat_none',
    slot: 'hat',
    source: 'starter',
    tier: 'Pradinis',
    themeColor: 'none',
    canBuyInShop: false,
    name: 'Be šalmo',
    icon: '👦',
    priceCoins: 0,
    priceCrystals: 0,
    bonusText: 'Pradinė išvaizda (be galvos apdangalo)',
    bonus: {},
    visual: { shape: 'none', color: 'transparent', trim: 'transparent' }
  },
  // --- KALVĖS BAZINIS ŠALMAS (source: 'shop') ---
  {
    id: 'hat_scout',
    slot: 'hat',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    themeColor: 'brown',
    canBuyInShop: true,
    name: 'Ruda Odinė Žvalgo Kepurė',
    icon: '🧢',
    priceCoins: 130,
    priceCrystals: 0,
    bonusText: '+8% aukso iš dvikovų',
    bonus: { mathGoldPct: 0.08 },
    visual: { shape: 'cap', color: '#92400e', trim: '#d97706' }
  },
  // --- SKRYNIŲ IR PROTO ŽVAIGŽDŽIŲ LOOT ŠALMAI (source: 'loot') ---
  {
    id: 'hat_green_ranger',
    slot: 'hat',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'green',
    canBuyInShop: false,
    name: 'Žaliasis Žvalgo Šalmas',
    icon: '🪖',
    priceCoins: 380,
    priceCrystals: 0,
    bonusText: '+15% aukso ir +4% greičio',
    bonus: { mathGoldPct: 0.15, speedPct: 0.04 },
    visual: { shape: 'ranger', color: '#16a34a', trim: '#fde047', plume: '#4ade80' }
  },
  {
    id: 'hat_blue_guard',
    slot: 'hat',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'blue',
    canBuyInShop: false,
    name: 'Mėlynasis Sargybinio Šalmas',
    icon: '🪖',
    priceCoins: 540,
    priceCrystals: 0,
    bonusText: '+1 ❤️ papildoma širdelė ir +15% aukso',
    bonus: { extraHearts: 1, mathGoldPct: 0.15 },
    visual: { shape: 'knight', color: '#2563eb', trim: '#93c5fd', plume: '#38bdf8' }
  },
  {
    id: 'hat_dark_shadow',
    slot: 'hat',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'dark',
    canBuyInShop: false,
    name: 'Juodasis Šešėlių Nindzės Gobtuvas',
    icon: '🥷',
    priceCoins: 620,
    priceCrystals: 1,
    bonusText: '+1 ❤️ širdelė, +6% greičio ir +20% aukso',
    bonus: { extraHearts: 1, speedPct: 0.06, mathGoldPct: 0.2 },
    visual: { shape: 'knight', color: '#1e293b', trim: '#94a3b8', plume: '#475569' }
  },
  {
    id: 'hat_red_knight',
    slot: 'hat',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'red',
    canBuyInShop: false,
    name: 'Raudonas Riterio Šalmas',
    icon: '⛑️',
    priceCoins: 680,
    priceCrystals: 1,
    bonusText: '+1 ❤️ papildoma širdelė ir +25% aukso',
    bonus: { extraHearts: 1, mathGoldPct: 0.25 },
    visual: { shape: 'knight', color: '#dc2626', trim: '#fde047', plume: '#ef4444' }
  },
  {
    id: 'hat_viking',
    slot: 'hat',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'dark',
    canBuyInShop: false,
    name: 'Tamsusis Šiaurės Vikingo Ragų Šalmas',
    icon: '🪖',
    priceCoins: 820,
    priceCrystals: 1,
    bonusText: 'Masyvūs ragai! +1 ❤️ širdelė ir +1 ⚔️ žala',
    bonus: { extraHearts: 1, extraDamage: 1 },
    visual: { shape: 'viking', color: '#1e293b', trim: '#94a3b8', horns: '#fef3c7' }
  },
  {
    id: 'hat_gold_paladin',
    slot: 'hat',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'gold',
    canBuyInShop: false,
    name: 'Auksinis Paladino Šalmas',
    icon: '👑',
    priceCoins: 1250,
    priceCrystals: 2,
    bonusText: '+2 ❤️ širdelės ir +30% aukso',
    bonus: { extraHearts: 2, mathGoldPct: 0.3 },
    visual: { shape: 'knight', color: '#eab308', trim: '#fef08a', plume: '#facc15' }
  },
  {
    id: 'hat_wizard',
    slot: 'hat',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'blue',
    canBuyInShop: false,
    name: 'Mėlynoji Archimago Skrybėlė',
    icon: '🧙',
    priceCoins: 1400,
    priceCrystals: 2,
    bonusText: '+40% aukso ir +1 ⚡ pagalba',
    bonus: { mathGoldPct: 0.4, extraHelper: 1 },
    visual: { shape: 'wizard', color: '#2563eb', trim: '#fde047' }
  },
  // --- BOSŲ SETO ŠALMAI (source: 'boss_set') ---
  {
    id: 'hat_iron',
    slot: 'hat',
    source: 'boss_set',
    tier: 'Epinis (Boso Set)',
    setId: 'iron_set',
    themeColor: 'silver',
    canBuyInShop: false,
    name: 'Geležinis Karžygio Šalmas',
    icon: '🪖',
    priceCoins: 850,
    priceCrystals: 1,
    bonusText: '+1 ❤️ širdelė ir +15% aukso (Geležinio Karžygio Rinkinys)',
    bonus: { extraHearts: 1, mathGoldPct: 0.15 },
    visual: { shape: 'knight', color: '#64748b', trim: '#38bdf8', plume: '#3b82f6' }
  },
  {
    id: 'hat_dragon',
    slot: 'hat',
    source: 'boss_set',
    tier: 'Legendinis (Boso Set)',
    setId: 'dragon_set',
    themeColor: 'red',
    canBuyInShop: false,
    name: 'Raudonasis Ugnies Drakono Šalmas',
    icon: '🐲',
    priceCoins: 4800,
    priceCrystals: 6,
    bonusText: '+1 ❤️ širdelė, +1 ⚔️ žala ir +40% aukso (Ugnies Drakono Rinkinys)',
    bonus: { extraHearts: 1, extraDamage: 1, mathGoldPct: 0.4 },
    visual: { shape: 'dragon', color: '#dc2626', trim: '#f97316', horns: '#fde047' }
  },
  {
    id: 'hat_crown',
    slot: 'hat',
    source: 'boss_set',
    tier: 'Mitinis (Boso Set)',
    setId: 'cosmic_set',
    themeColor: 'gold',
    canBuyInShop: false,
    name: 'Auksinė Skaičių Karaliaus Karūna',
    icon: '👑',
    priceCoins: 14000,
    priceCrystals: 16,
    bonusText: '+2 ❤️ širdelės ir +80% aukso (Galaktikos Rinkinys)',
    bonus: { extraHearts: 2, mathGoldPct: 0.8 },
    visual: { shape: 'crown', color: '#eab308', trim: '#fef08a', gem: '#ef4444' }
  },

  // ==================== 4. SKYDAI (SHIELD) ====================
  {
    id: 'shield_none',
    slot: 'shield',
    source: 'starter',
    tier: 'Pradinis',
    themeColor: 'none',
    canBuyInShop: false,
    name: 'Be skydo',
    icon: '🚫',
    priceCoins: 0,
    priceCrystals: 0,
    bonusText: 'Pradinė išvaizda (be skydo)',
    bonus: { canBlockArrows: false },
    visual: { shape: 'none', color: 'transparent', trim: 'transparent' }
  },
  // --- KALVĖS BAZINIS SKYDAS (source: 'shop') ---
  {
    id: 'shield_wood',
    slot: 'shield',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    themeColor: 'brown',
    canBuyInShop: true,
    name: 'Rudas Medinis Apvalus Skydas',
    icon: '🪵',
    priceCoins: 140,
    priceCrystals: 0,
    bonusText: '🛡️ Pasilenkus (⬇️) atmuša strėles! +1 🫧 burbulas',
    bonus: { extraShield: 1, canBlockArrows: true },
    visual: { shape: 'round', color: '#92400e', trim: '#d97706', emblem: 'dot' }
  },
  // --- SKRYNIŲ IR PROTO ŽVAIGŽDŽIŲ LOOT SKYDAI (source: 'loot') ---
  {
    id: 'shield_green_leaf',
    slot: 'shield',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'green',
    canBuyInShop: false,
    name: 'Žaliasis Miško Skydas',
    icon: '🛡️',
    priceCoins: 420,
    priceCrystals: 0,
    bonusText: '🛡️ Atmuša strėles, +1 🫧 burbulas ir +15% aukso',
    bonus: { extraShield: 1, canBlockArrows: true, mathGoldPct: 0.15 },
    visual: { shape: 'round', color: '#16a34a', trim: '#fde047', emblem: 'diamond' }
  },
  {
    id: 'shield_blue_crest',
    slot: 'shield',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'blue',
    canBuyInShop: false,
    name: 'Mėlynasis Riterio Herbinis Skydas',
    icon: '🛡️',
    priceCoins: 640,
    priceCrystals: 1,
    bonusText: '🛡️ Atmuša strėles, +1 ❤️ širdelė ir +1 🫧',
    bonus: { extraShield: 1, extraHearts: 1, canBlockArrows: true },
    visual: { shape: 'heater', color: '#2563eb', trim: '#93c5fd', emblem: 'star' }
  },
  {
    id: 'shield_dark_shadow',
    slot: 'shield',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'dark',
    canBuyInShop: false,
    name: 'Juodasis Šešėlių Nindzės Skydas',
    icon: '🛡️',
    priceCoins: 720,
    priceCrystals: 1,
    bonusText: '🛡️ Atmuša strėles, +1 ❤️ širdelė, +1 🫧 ir +5% greičio',
    bonus: { extraShield: 1, extraHearts: 1, speedPct: 0.05, canBlockArrows: true },
    visual: { shape: 'heater', color: '#1e293b', trim: '#94a3b8', emblem: 'star' }
  },
  {
    id: 'shield_red_tower',
    slot: 'shield',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'red',
    canBuyInShop: false,
    name: 'Raudonasis Bokšto Skydas',
    icon: '🛡️',
    priceCoins: 920,
    priceCrystals: 1,
    bonusText: '🛡️ Masyvus skydas: atmuša strėles, +1 ❤️ ir +2 🫧 burbulai',
    bonus: { extraShield: 2, extraHearts: 1, canBlockArrows: true },
    visual: { shape: 'tower', color: '#dc2626', trim: '#fde047', emblem: 'cross' }
  },
  {
    id: 'shield_gold_sun',
    slot: 'shield',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'gold',
    canBuyInShop: false,
    name: 'Auksinis Saulės Skydas',
    icon: '☀️',
    priceCoins: 1350,
    priceCrystals: 2,
    bonusText: '🛡️ Atmuša strėles, +2 ❤️ širdelės ir +35% aukso',
    bonus: { extraShield: 2, extraHearts: 2, canBlockArrows: true, mathGoldPct: 0.35 },
    visual: { shape: 'round', color: '#eab308', trim: '#fef08a', emblem: 'sun' }
  },
  // --- BOSŲ SETO SKYDAI (source: 'boss_set') ---
  {
    id: 'shield_iron',
    slot: 'shield',
    source: 'boss_set',
    tier: 'Epinis (Boso Set)',
    setId: 'iron_set',
    themeColor: 'silver',
    canBuyInShop: false,
    name: 'Geležinis Karžygio Skydas',
    icon: '🛡️',
    priceCoins: 900,
    priceCrystals: 1,
    bonusText: '🛡️ Atmuša strėles, +1 ❤️ ir +2 🫧 (Geležinio Karžygio Rinkinys)',
    bonus: { extraShield: 2, extraHearts: 1, canBlockArrows: true },
    visual: { shape: 'heater', color: '#64748b', trim: '#38bdf8', emblem: 'cross' }
  },
  {
    id: 'shield_dragon',
    slot: 'shield',
    source: 'boss_set',
    tier: 'Legendinis (Boso Set)',
    setId: 'dragon_set',
    themeColor: 'red',
    canBuyInShop: false,
    name: 'Raudonasis Ugnies Drakono Skydas',
    icon: '🔥',
    priceCoins: 4200,
    priceCrystals: 7,
    bonusText: '🛡️ Atmuša strėles, +2 ❤️, +2 🫧 ir +35% aukso (Ugnies Drakono Rinkinys)',
    bonus: { extraShield: 2, extraHearts: 2, mathGoldPct: 0.35, canBlockArrows: true },
    visual: { shape: 'heater', color: '#dc2626', trim: '#f97316', emblem: 'flame' }
  },
  {
    id: 'shield_aegis',
    slot: 'shield',
    source: 'boss_set',
    tier: 'Mitinis (Boso Set)',
    setId: 'cosmic_set',
    themeColor: 'purple',
    canBuyInShop: false,
    name: 'Mitinis „Galaktikos Skydas“',
    icon: '✨',
    priceCoins: 14000,
    priceCrystals: 22,
    bonusText: '🛡️ Atmuša strėles, +3 ❤️, +3 🫧 ir +80% aukso (Galaktikos Rinkinys)',
    bonus: { extraShield: 3, extraHearts: 3, mathGoldPct: 0.8, canBlockArrows: true },
    visual: { shape: 'tower', color: '#6b21a8', trim: '#38bdf8', emblem: 'star' }
  },

  // ==================== 5. APSIAUSTAI (CAPE) ====================
  {
    id: 'cape_none',
    slot: 'cape',
    source: 'starter',
    tier: 'Pradinis',
    themeColor: 'none',
    canBuyInShop: false,
    name: 'Be apsiausto',
    icon: '🚫',
    priceCoins: 0,
    priceCrystals: 0,
    bonusText: 'Pradinė išvaizda (be apsiausto)',
    bonus: {},
    visual: { color: 'transparent', trim: 'transparent', length: 0 }
  },
  // --- KALVĖS BAZINIS APSIAUSTAS (source: 'shop') ---
  {
    id: 'cape_traveler',
    slot: 'cape',
    source: 'shop',
    tier: 'Paprastas (Kalvė)',
    themeColor: 'brown',
    canBuyInShop: true,
    name: 'Paprastas Rudas Keliautojo Apsiaustas',
    icon: '🧣',
    priceCoins: 120,
    priceCrystals: 0,
    bonusText: 'Plevėsuoja bėgant (+4% greičio)',
    bonus: { speedPct: 0.04 },
    visual: { color: '#92400e', trim: '#d97706', length: 1 }
  },
  // --- SKRYNIŲ IR PROTO ŽVAIGŽDŽIŲ LOOT APSIAUSTAI (source: 'loot') ---
  {
    id: 'cape_wind',
    slot: 'cape',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'green',
    canBuyInShop: false,
    name: 'Žaliasis Miško Vėjo Apsiaustas',
    icon: '🍃',
    priceCoins: 480,
    priceCrystals: 0,
    bonusText: '+7% greičio, +4% šuolio ir +50 px magnetas',
    bonus: { speedPct: 0.07, jumpPct: 0.04, magnetPx: 50 },
    visual: { color: '#16a34a', trim: '#fde047', length: 2 }
  },
  {
    id: 'cape_blue_royal',
    slot: 'cape',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'blue',
    canBuyInShop: false,
    name: 'Mėlynasis Karališkos Sargybos Apsiaustas',
    icon: '🧣',
    priceCoins: 690,
    priceCrystals: 1,
    bonusText: '+8% greičio, +80 px magnetas ir +20% aukso',
    bonus: { speedPct: 0.08, magnetPx: 80, mathGoldPct: 0.2 },
    visual: { color: '#2563eb', trim: '#93c5fd', length: 2 }
  },
  {
    id: 'cape_dark_shadow',
    slot: 'cape',
    source: 'loot',
    lootTier: 1,
    tier: 'Retas (Loot)',
    themeColor: 'dark',
    canBuyInShop: false,
    name: 'Juodasis Šešėlių Nindzės Apsiaustas',
    icon: '🥷',
    priceCoins: 760,
    priceCrystals: 1,
    bonusText: '+9% greičio, +90 px magnetas ir +22% aukso',
    bonus: { speedPct: 0.09, magnetPx: 90, mathGoldPct: 0.22 },
    visual: { color: '#1e293b', trim: '#94a3b8', length: 2 }
  },
  {
    id: 'cape_red_hero',
    slot: 'cape',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'red',
    canBuyInShop: false,
    name: 'Raudonasis Karžygio Apsiaustas',
    icon: '🧣',
    priceCoins: 980,
    priceCrystals: 1,
    bonusText: '+10% greičio, +1 ❤️ širdelė ir +30% aukso',
    bonus: { speedPct: 0.1, extraHearts: 1, mathGoldPct: 0.3 },
    visual: { color: '#dc2626', trim: '#fde047', length: 3 }
  },
  {
    id: 'cape_phoenix',
    slot: 'cape',
    source: 'loot',
    lootTier: 2,
    tier: 'Geras (Loot)',
    themeColor: 'gold',
    canBuyInShop: false,
    name: 'Auksinis Saulės Fenikso Apsiaustas',
    icon: '🦅',
    priceCoins: 1600,
    priceCrystals: 2,
    bonusText: 'Auksinis apvadas! +12% greičio, +150 px magnetas ir +50% aukso!',
    bonus: { speedPct: 0.12, magnetPx: 150, mathGoldPct: 0.5 },
    visual: { color: '#eab308', trim: '#fef08a', length: 3 }
  }
];

// Pagalbinė funkcija: grąžina griežtai sinchronizuotą Hex spalvą pagal daikto `themeColor`
export function resolveItemThemeHex(item) {
  if (!item) return null;
  const pal = item.themeColor ? THEME_COLOR_PALETTE[item.themeColor] : null;
  return pal || null;
}

// Generuoja 100% tikslią SVG ikoną pagal daikto `themeColor` ir `visual` savybes, kad ikona parduotuvėje/kuprinėje
// idealiai sutaptų su tuo, kas nupiešiama ant žmogeliuko Canvas ekrane!
export function getItemSvgIcon(item, size = 38) {
  if (!item || !item.visual) return item?.icon || '📦';
  const v = item.visual;
  const pal = resolveItemThemeHex(item);
  const mainCol = pal ? pal.hex : (v.color || v.bodyColor);
  const trimCol = pal ? pal.trimHex : (v.trim || v.trimColor);
  const beltCol = pal ? pal.beltHex : v.beltColor;

  if (item.slot === 'hat') {
    if (v.shape === 'none') return '👦';
    if (v.shape === 'cap') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <path d="M8 26 C8 14, 30 14, 32 26 Z" fill="${mainCol}" stroke="#0f172a" stroke-width="2.2"/>
        <rect x="6" y="24" width="28" height="5" rx="2.5" fill="${trimCol}" stroke="#0f172a" stroke-width="1.8"/>
      </svg>`;
    }
    if (v.shape === 'ranger') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <path d="M7 27 L20 11 L34 27 Z" fill="${mainCol}" stroke="#0f172a" stroke-width="2.2"/>
        <rect x="5" y="25" width="30" height="5" rx="2" fill="${trimCol}" stroke="#0f172a" stroke-width="1.8"/>
        <path d="M25 18 Q33 8 36 14" stroke="${pal?.plumeHex || v.plume || '#fde047'}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      </svg>`;
    }
    if (v.shape === 'viking' || v.shape === 'dragon') {
      const hornCol = v.horns || '#fef3c7';
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <path d="M9 22 Q2 12 6 7 Q10 14 13 19" fill="${hornCol}" stroke="#0f172a" stroke-width="1.8"/>
        <path d="M31 22 Q38 12 34 7 Q30 14 27 19" fill="${hornCol}" stroke="#0f172a" stroke-width="1.8"/>
        <path d="M9 28 C9 13, 31 13, 31 28 Z" fill="${mainCol}" stroke="#0f172a" stroke-width="2.2"/>
        <rect x="8" y="25" width="24" height="5" rx="2" fill="${trimCol}" stroke="#0f172a" stroke-width="1.8"/>
      </svg>`;
    }
    if (v.shape === 'wizard') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <polygon points="20,4 31,29 9,29" fill="${mainCol}" stroke="#0f172a" stroke-width="2"/>
        <ellipse cx="20" cy="29" rx="16" ry="4.5" fill="${mainCol}" stroke="${trimCol}" stroke-width="2"/>
        <circle cx="20" cy="19" r="3" fill="${trimCol}"/>
      </svg>`;
    }
    if (v.shape === 'crown') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <polygon points="6,29 8,13 15,21 20,10 25,21 32,13 34,29" fill="${mainCol}" stroke="#0f172a" stroke-width="2"/>
        <circle cx="20" cy="24" r="3" fill="${v.gem || '#ef4444'}"/>
      </svg>`;
    }
    // Default 'knight' helmet with plume
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
      <path d="M18 11 Q24 4 31 11" stroke="${pal?.plumeHex || v.plume || trimCol}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M9 29 C9 13, 31 13, 31 29 Z" fill="${mainCol}" stroke="#0f172a" stroke-width="2.2"/>
      <rect x="8" y="25" width="24" height="5" rx="2" fill="${trimCol}" stroke="#0f172a" stroke-width="1.8"/>
    </svg>`;
  }

  if (item.slot === 'armor') {
    if (item.id === 'armor_none') return '👕';
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
      <path d="M8 12 L14 8 L26 8 L32 12 L29 32 L11 32 Z" fill="${mainCol}" stroke="#0f172a" stroke-width="2.2"/>
      ${v.shoulders ? `<rect x="5" y="10" width="7" height="7" rx="2" fill="${trimCol}" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="28" y="10" width="7" height="7" rx="2" fill="${trimCol}" stroke="#0f172a" stroke-width="1.5"/>` : ''}
      <rect x="11" y="23" width="18" height="4" fill="${beltCol}"/>
      <rect x="17" y="22" width="6" height="6" rx="1" fill="${trimCol}"/>
    </svg>`;
  }

  if (item.slot === 'shield') {
    if (v.shape === 'none') return '🚫';
    if (v.shape === 'round') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="14" fill="${mainCol}" stroke="${trimCol}" stroke-width="3.2"/>
        <circle cx="20" cy="20" r="4" fill="${trimCol}"/>
      </svg>`;
    }
    if (v.shape === 'tower') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <rect x="9" y="6" width="22" height="28" rx="4" fill="${mainCol}" stroke="${trimCol}" stroke-width="3"/>
        <line x1="20" y1="10" x2="20" y2="30" stroke="${trimCol}" stroke-width="3"/>
        <line x1="13" y1="19" x2="27" y2="19" stroke="${trimCol}" stroke-width="3"/>
      </svg>`;
    }
    // 'heater' crest shield
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
      <path d="M8 8 L32 8 L30 22 L20 34 L10 22 Z" fill="${mainCol}" stroke="${trimCol}" stroke-width="3"/>
      <circle cx="20" cy="19" r="4.5" fill="${trimCol}"/>
    </svg>`;
  }

  if (item.slot === 'weapon') {
    if (v.kind === 'boomerang') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <path d="M9 10 L26 18 L18 34 L12 31 L20 19 L6 14 Z" fill="${v.bladeColor}" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="22" cy="18.5" r="3" fill="${v.trimColor}"/>
        <circle cx="11" cy="12.5" r="2" fill="${v.gemColor || '#fde047'}"/>
        <circle cx="16" cy="30" r="2" fill="${v.gemColor || '#fde047'}"/>
      </svg>`;
    }
    if (v.kind === 'bow') {
      return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
        <path d="M14 6 Q32 20 14 34" fill="none" stroke="${v.bowColor}" stroke-width="4" stroke-linecap="round"/>
        <line x1="14" y1="6" x2="14" y2="34" stroke="${v.stringColor}" stroke-width="1.8"/>
        <line x1="10" y1="20" x2="31" y2="20" stroke="${v.trimColor}" stroke-width="2.6"/>
      </svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
      <polygon points="29,6 34,6 34,11 17,28 12,23" fill="${v.bladeColor}" stroke="#0f172a" stroke-width="1.8"/>
      <line x1="9" y1="20" x2="20" y2="31" stroke="${v.hiltColor}" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="8" y1="32" x2="14" y2="26" stroke="${v.hiltColor}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="14.5" cy="25.5" r="2.5" fill="${v.gemColor}"/>
    </svg>`;
  }

  if (item.slot === 'cape') {
    if (v.length === 0) return '🚫';
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">
      <path d="M12 7 L28 7 L33 33 L7 33 Z" fill="${mainCol}" stroke="${trimCol}" stroke-width="2.6"/>
    </svg>`;
  }

  return item.icon || '📦';
}

// Patikrina, ar žaidėjas jau turi šį daiktą savo inventoriuje (užsidėjęs ant herojaus arba kuprinėje)
export function hasItemInInventory(profile, itemId) {
  if (!profile || !itemId) return false;
  const equippedIds = Object.values(profile.equippedGear || {});
  const backpackIds = profile.backpack || [];
  return equippedIds.includes(itemId) || backpackIds.includes(itemId);
}

// Grąžina visus ekskliuzyvinius Seto daiktus (TIK iš Bosų!)
export function getExclusiveSetPool() {
  return GEAR_ITEMS.filter((it) => it.source === 'boss_set' || !!it.setId);
}

// Išrenka atsitiktinę Boso Seto dalį (jei iškrenta dublikatas – suveiks Auto-Sell algoritmas!)
export function rollExclusiveSetDrop(profile) {
  const allSetItems = getExclusiveSetPool();
  return allSetItems[Math.floor(Math.random() * allSetItems.length)];
}

// Išrenka atsitiktinį „Loot“ daiktą iš lygio skrynios, durų arba „Proto Žvaigždės“!
// (Jei žaidėjas šį daiktą jau turi inventoriuje – suveiks Auto-Sell algoritmas!)
export function rollLevelLootDrop(profile, isBrainStar = false) {
  const lootPool = GEAR_ITEMS.filter((it) => it.source === 'loot');
  const preferredPool = isBrainStar
    ? lootPool.filter((it) => (it.lootTier || 1) >= 2)
    : lootPool;
  const activePool = preferredPool.length > 0 ? preferredPool : lootPool;
  return activePool[Math.floor(Math.random() * activePool.length)];
}

// ==================== AUGINTINIAI (PETS) SU 1–10 LYGIAIS IR 3 UNIKALIOMIS MAGIJOMIS ====================
export const PET_ITEMS = [
  {
    id: 'pet_dragon',
    role: 'combat_fireball',
    name: 'Mažasis Drakoniukas (Kovinis)',
    icon: '🐉',
    color: '#ef4444',
    maxLevel: 10,
    priceCoins: 1800,
    priceCrystals: 3,
    upgradeBaseCost: 480,
    upgradeGrowth: 2.38,
    description: 'Kovinis augintinis: skraido šalia ir automatiškai šaudo ugnies kamuolius į artimiausius priešus (-1 HP)!',
    getStatsForLevel(lvl = 1) {
      const attackSec = Math.max(2.5, Number((8.5 - (lvl - 1) * 0.65).toFixed(1)));
      const goldBonusPct = 20 + lvl * 8;
      return {
        role: 'combat_fireball',
        cooldownFrames: Math.round(attackSec * 60),
        cooldownSec: attackSec,
        fireballDamage: 1,
        mathGoldPct: goldBonusPct / 100,
        skillText: `🔥 Kovinis: kas ${attackSec} s automatiškai šauna ugnies kamuolį į artimiausią priešą (-1 HP) | +${goldBonusPct}% aukso!`
      };
    }
  },
  {
    id: 'pet_cyber',
    role: 'defense_arrow_shield',
    name: 'Dronas / Skydas (Gynybinis)',
    icon: '🤖',
    color: '#38bdf8',
    maxLevel: 10,
    priceCoins: 7500,
    priceCrystals: 8,
    upgradeBaseCost: 1150,
    upgradeGrowth: 2.42,
    description: 'Gynybinis kiber-dronas: automatiškai lazeriu numuša ir sunaikina atskrendančias priešų strėles!',
    getStatsForLevel(lvl = 1) {
      const extraGoldPct = lvl * 6;
      const magnetPx = 120 + lvl * 22;
      const arrowBlockSec = Math.max(1.8, Number((8.5 - (lvl - 1) * 0.72).toFixed(1)));
      return {
        role: 'defense_arrow_shield',
        cooldownFrames: Math.round(arrowBlockSec * 60),
        cooldownSec: arrowBlockSec,
        arrowBlockFrames: Math.round(arrowBlockSec * 60),
        arrowBlockSec,
        mathGoldPct: extraGoldPct / 100,
        magnetPx,
        extraHelper: 1 + Math.floor(lvl / 5),
        skillText: `🛡️ Gynybinis: automatiškai numuša priešo strėlę kas ${arrowBlockSec} s | +${magnetPx}px magnetas | +${extraGoldPct}% aukso!`
      };
    }
  },
  {
    id: 'pet_phoenix',
    role: 'heal_phoenix',
    name: 'Saulės Feniksas (Gydantis)',
    icon: '🦅',
    color: '#f59e0b',
    maxLevel: 10,
    priceCoins: 45000,
    priceCrystals: 25,
    upgradeBaseCost: 2600,
    upgradeGrowth: 2.45,
    description: 'Gydantis ugnies paukštis: periodiškai arba išsprendus užduotis pasyviai atstato herojui +1 prarastą širdelę (❤️)!',
    getStatsForLevel(lvl = 1) {
      const extraHearts = 1 + Math.floor(lvl / 4);
      const healSec = Math.max(14, Math.round(30 - (lvl - 1) * 1.7));
      const tasksToHeal = lvl >= 8 ? 2 : 3;
      const goldBonusPct = 50 + lvl * 10;
      return {
        role: 'heal_phoenix',
        cooldownFrames: Math.round(healSec * 60),
        cooldownSec: healSec,
        healSec,
        healFrames: Math.round(healSec * 60),
        tasksToHeal,
        extraHearts,
        mathGoldPct: goldBonusPct / 100,
        skillText: `💖 Gydantis: kas ${healSec} s (arba išsprendus ${tasksToHeal} užd.) atstato +1 ❤️ širdelę | +${extraHearts} maks. ❤️ | +${goldBonusPct}% aukso!`
      };
    }
  }
];

// Test Build 8: Stati eksponentinė augintinių (1–10 lyg.) tobulinimo kainų kreivė (nuo 5 iki 10 lygio kainuoja dešimtis ir šimtus tūkstančių!)
export function getPetUpgradeCost(petDef, currentLevel) {
  if (!petDef || currentLevel >= (petDef.maxLevel || 10)) return null;
  const base = petDef.upgradeBaseCost || 500;
  const growth = petDef.upgradeGrowth || 2.4;
  const raw = base * Math.pow(growth, currentLevel - 1);
  if (raw >= 10000) return Math.round(raw / 500) * 500;
  if (raw >= 1000) return Math.round(raw / 50) * 50;
  return Math.round(raw / 10) * 10;
}

export function getSellPrice(item) {
  if (!item || !item.priceCoins) return 25;
  return Math.max(25, Math.round(item.priceCoins * 0.5));
}

export const ACHIEVEMENTS = [
  {
    id: 'solve_15',
    name: 'Skaičių Pameistrys',
    icon: '🥉',
    description: 'Išspręsk 15 matematikos uždavinių.',
    rewardCrystals: 2,
    rewardCoins: 120,
    check: (p) => p.stats.totalSolved >= 15,
    progress: (p) => `${Math.min(p.stats.totalSolved, 15)} / 15`
  },
  {
    id: 'solve_75',
    name: 'Matematikos Riteris',
    icon: '🥈',
    description: 'Išspręsk 75 matematikos uždavinius.',
    rewardCrystals: 6,
    rewardCoins: 600,
    check: (p) => p.stats.totalSolved >= 75,
    progress: (p) => `${Math.min(p.stats.totalSolved, 75)} / 75`
  },
  {
    id: 'solve_250',
    name: 'Karalystės Archimagas',
    icon: '🥇',
    description: 'Išspręsk 250 matematikos uždavinių.',
    rewardCrystals: 18,
    rewardCoins: 3500,
    check: (p) => p.stats.totalSolved >= 250,
    progress: (p) => `${Math.min(p.stats.totalSolved, 250)} / 250`
  },
  {
    id: 'streak_5',
    name: 'Ugninė Serija (Combo x5)',
    icon: '🔥',
    description: 'Atsakyk teisingai 5 kartus iš eilės be klaidų.',
    rewardCrystals: 3,
    rewardCoins: 200,
    check: (p) => p.stats.maxStreak >= 5,
    progress: (p) => `${Math.min(p.stats.maxStreak, 5)} / 5`
  },
  {
    id: 'streak_15',
    name: 'Nesustabdomas Genijus (Combo x15)',
    icon: '⚡',
    description: 'Pasiek 15 teisingų atsakymų iš eilės!',
    rewardCrystals: 10,
    rewardCoins: 1200,
    check: (p) => p.stats.maxStreak >= 15,
    progress: (p) => `${Math.min(p.stats.maxStreak, 15)} / 15`
  },
  {
    id: 'shield_blocker',
    name: 'Geležinė Gynyba',
    icon: '🛡️',
    description: 'Pasilenkęs su skydu arba augintiniu atmušk 5 priešų strėles.',
    rewardCrystals: 4,
    rewardCoins: 350,
    check: (p) => (p.stats.arrowsBlocked || 0) >= 5,
    progress: (p) => `${Math.min(p.stats.arrowsBlocked || 0, 5)} / 5`
  },
  {
    id: 'boss_slayer',
    name: 'Bosų Nugalėtojas',
    icon: '👑',
    description: 'Nugalėk bent vieną Pasaulio Bosą.',
    rewardCrystals: 6,
    rewardCoins: 500,
    check: (p) => p.stats.bossesDefeated >= 1,
    progress: (p) => `${Math.min(p.stats.bossesDefeated, 1)} / 1`
  }
];

export function computePlayerBonuses(profile) {
  const up = profile.upgrades || {};
  const bonuses = {
    speedMult: 1 + ((up.speed || 1) - 1) * 0.03,
    jumpMult: 1 + ((up.jump || 1) - 1) * 0.022,
    maxJumps: (up.jump || 1) >= 15 ? 3 : (up.jump || 1) >= 5 ? 2 : 1,
    maxHearts: 3 + Math.floor(((up.hearts || 1) - 1) / 3),
    maxShields: Math.floor(((up.hearts || 1) - 1) / 4),
    magnetRadius: 45 + ((up.magnet || 1) - 1) * 14,
    mathGoldMult: 1 + ((up.wisdom || 1) - 1) * 0.12,
    helperCharges: 1 + Math.floor((up.helper || 1) / 3),
    canBlockArrows: false,
    halfDamage: false,
    weaponDamage: 1,
    isMelee: true,
    isRanged: false,
    isBoomerang: false,
    shootCooldown: 56,
    arrowSpeed: 7.2,
    arrowColor: '#fde047',
    boomerangSpeed: 9.0,
    boomerangMaxDist: 450,
    boomerangColor: '#b45309',
    boomerangTrim: '#fde047',
    activeSet: null,
    setProgress: {},
    colorSynergy: null,
    coinFindMult: 1.0,
    crouchSpeedBoost: false,
    petLevel: 1,
    petRole: null,
    petCooldownFrames: 0,
    petTasksToHeal: 3,
    petFireballDamage: 1,
    petArrowBlockFrames: 0,
    petSkillText: ''
  };

  const equippedIds = Object.values(profile.equippedGear || {});
  for (const id of equippedIds) {
    const item = GEAR_ITEMS.find((g) => g.id === id);
    if (item && item.bonus) {
      if (item.bonus.armorHearts) bonuses.maxHearts += item.bonus.armorHearts;
      if (item.bonus.extraHearts) bonuses.maxHearts += item.bonus.extraHearts;
      if (item.bonus.extraShield) bonuses.maxShields += item.bonus.extraShield;
      if (item.bonus.mathGoldPct) bonuses.mathGoldMult += item.bonus.mathGoldPct;
      if (item.bonus.extraHelper) bonuses.helperCharges += item.bonus.extraHelper;
      if (item.bonus.speedPct) bonuses.speedMult += item.bonus.speedPct;
      if (item.bonus.jumpPct) bonuses.jumpMult += item.bonus.jumpPct;
      if (item.bonus.magnetPx) bonuses.magnetRadius += item.bonus.magnetPx;
      if (item.bonus.canBlockArrows) bonuses.canBlockArrows = true;
      if (item.bonus.halfDamage) bonuses.halfDamage = true;
      if (item.bonus.damage) bonuses.weaponDamage = item.bonus.damage;
      if (item.bonus.extraDamage) bonuses.weaponDamage += item.bonus.extraDamage;
      if (item.bonus.isBoomerang) {
        bonuses.isBoomerang = true;
        bonuses.isRanged = false;
        bonuses.isMelee = false;
        bonuses.boomerangSpeed = item.bonus.boomerangSpeed || 9.0;
        bonuses.boomerangMaxDist = item.bonus.boomerangMaxDist || 450;
        bonuses.boomerangColor = item.visual?.bladeColor || '#b45309';
        bonuses.boomerangTrim = item.visual?.trimColor || '#fde047';
      } else if (item.bonus.isRanged) {
        bonuses.isRanged = true;
        bonuses.isMelee = false;
        bonuses.isBoomerang = false;
        bonuses.shootCooldown = item.bonus.shootCooldown || 56;
        bonuses.arrowSpeed = item.bonus.arrowSpeed || 7.2;
        bonuses.arrowColor = item.bonus.arrowColor || '#fde047';
      } else if (item.slot === 'weapon') {
        bonuses.isMelee = true;
        bonuses.isRanged = false;
        bonuses.isBoomerang = false;
      }
    }
  }

  for (const itemSet of ITEM_SETS) {
    const equippedCount = itemSet.pieces.filter((pieceId) => equippedIds.includes(pieceId)).length;
    bonuses.setProgress[itemSet.id] = {
      count: equippedCount,
      total: itemSet.pieces.length,
      setDef: itemSet
    };
    if (equippedCount === itemSet.pieces.length) {
      bonuses.activeSet = itemSet;
      bonuses.maxHearts += itemSet.bonusHearts;
      bonuses.weaponDamage += itemSet.bonusDamage;
    }
  }

  // ==================== „MADOS SIELOS“ (COLOR SYNERGY) LOGIKA ====================
  // Tikriname 4 herojaus aprangos daiktus (Šalmas, Šarvai, Skydas, Apsiaustas).
  // Jeigu visi 4 užsidėti daiktai turi TĄ PATĮ `themeColor` parametrą – aktyvuojama Spalvų Sinergija!
  const apparelSlots = ['hat', 'armor', 'shield', 'cape'];
  const apparelItems = apparelSlots.map((slot) => {
    const eqId = profile.equippedGear ? profile.equippedGear[slot] : null;
    if (!eqId || eqId.endsWith('_none')) return null;
    return GEAR_ITEMS.find((g) => g.id === eqId) || null;
  });

  if (apparelItems.every((it) => it && it.themeColor && it.themeColor !== 'none')) {
    const firstColor = apparelItems[0].themeColor;
    if (apparelItems.every((it) => it.themeColor === firstColor)) {
      const syn = COLOR_SYNERGIES[firstColor];
      if (syn) {
        bonuses.colorSynergy = syn;
        if (syn.bonusDamage) bonuses.weaponDamage += syn.bonusDamage;
        if (syn.bonusHearts) bonuses.maxHearts += syn.bonusHearts;
        if (syn.bonusShield) bonuses.maxShields += syn.bonusShield;
        if (syn.coinBonusPct) {
          bonuses.coinFindMult += syn.coinBonusPct;
          bonuses.mathGoldMult += syn.coinBonusPct;
        }
        if (syn.crouchSpeedBoost) {
          bonuses.crouchSpeedBoost = true;
        }
      }
    }
  }

  if (profile.equippedPet) {
    const pet = PET_ITEMS.find((p) => p.id === profile.equippedPet);
    if (pet) {
      const lvl = Math.max(1, Math.min(10, (profile.petLevels && profile.petLevels[pet.id]) || 1));
      bonuses.petLevel = lvl;
      const pStats = pet.getStatsForLevel(lvl);
      bonuses.petRole = pStats.role || pet.role || null;
      bonuses.petCooldownFrames = pStats.cooldownFrames || 480;
      bonuses.petTasksToHeal = pStats.tasksToHeal || 3;
      bonuses.petFireballDamage = pStats.fireballDamage || 1;
      if (pStats.extraHearts) bonuses.maxHearts += pStats.extraHearts;
      if (pStats.extraDamage) bonuses.weaponDamage += pStats.extraDamage;
      if (pStats.extraShield) bonuses.maxShields += pStats.extraShield;
      if (pStats.mathGoldPct) bonuses.mathGoldMult += pStats.mathGoldPct;
      if (pStats.extraHelper) bonuses.helperCharges += pStats.extraHelper;
      if (pStats.magnetPx) bonuses.magnetRadius += pStats.magnetPx;
      if (pStats.arrowBlockFrames) bonuses.petArrowBlockFrames = pStats.arrowBlockFrames;
      bonuses.petSkillText = pStats.skillText;
    }
  }

  return bonuses;
}
