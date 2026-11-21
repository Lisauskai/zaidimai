// ==================== BUBIŲ TVIRTOVĖ: VEKTORINIŲ SVG SPRAITŲ BIBLIOTEKA ====================
// 10 priešų + 5 bosai + 6 bokšteliai (1–4 lygis ir 12 evoliucijų) + dronų/vejapjovių vienetai.
// Kiekvienas spraitas talpinamas Map talpykloje (data:image/svg+xml -> Image) su Canvas atsarginiu piešimu.

export const ENEMY_SPRITE_IDS = [
  'garden_slug',
  'rushing_hedgehog',
  'armored_beetle',
  'forest_shadow',
  'hornet_swarm',
  'tunnel_mole',
  'weed_golem',
  'noise_goblin',
  'exploding_beetle',
  'cyber_raven'
];

export const BOSS_SPRITE_IDS = [
  'boss_slug_king',
  'boss_iron_mole',
  'boss_shadow_lord',
  'boss_wrong_notes',
  'boss_cyber_mega'
];

export const TOWER_SPRITE_IDS = [
  'solar_laser',
  'dagilelis_sound',
  'drone_hangar',
  'mower_barracks',
  'berry_catapult',
  'solar_station'
];

export const UNIT_SPRITE_IDS = [
  'drone_unit',
  'mower_unit',
  'burrowed_mound'
];

export const BOSS_SCALE_MULTIPLIER = 1.6;

const TOWER_EVOLUTIONS_BY_TYPE = {
  solar_laser: ['plasma_burner', 'prism_beacon'],
  dagilelis_sound: ['choir_harmony', 'bass_drop'],
  drone_hangar: ['scout_scanner', 'missile_drone'],
  mower_barracks: ['armored_guards', 'electro_mowers'],
  berry_catapult: ['arctic_cannon', 'double_catapult'],
  solar_station: ['power_plant_10kw', 'super_capacitor']
};

const spriteCache = new Map();

export function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(String(svg || '').trim())}`;
}

function wrapSvg(body, defs = '') {
  const defsBlock = defs ? `<defs>${defs}</defs>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">${defsBlock}${body}</svg>`;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getOrCreateSprite(key, svgFactory) {
  if (spriteCache.has(key)) {
    return spriteCache.get(key);
  }
  const svg = svgFactory();
  const dataUrl = svgToDataUrl(svg);
  const record = {
    key,
    svg,
    dataUrl,
    image: null,
    loaded: false,
    error: false
  };

  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.onload = () => {
      record.loaded = true;
    };
    img.onerror = () => {
      record.error = true;
    };
    img.src = dataUrl;
    record.image = img;
  }

  spriteCache.set(key, record);
  return record;
}

// ==================== PRIEŠŲ IR BOSŲ SVG GENERATORIAI (96x96, ŽIŪRI Į DEŠINĘ +X) ====================

const ENEMY_SVG_BUILDERS = {
  garden_slug: () => wrapSvg(
    `
    <!-- Gleivių takelis -->
    <ellipse cx="42" cy="73" rx="34" ry="8" fill="#bef264" fill-opacity="0.38"/>
    <ellipse cx="16" cy="74" rx="10" ry="4" fill="#d9f99d" fill-opacity="0.5"/>
    <!-- Pailgas šliužo kūnas -->
    <path d="M12 65 C10 53, 24 46, 44 46 C59 46, 68 42, 74 44 C82 46, 86 56, 82 65 C76 72, 22 73, 12 65 Z" fill="url(#slugGrad)" stroke="#0f172a" stroke-width="3.2" stroke-linejoin="round"/>
    <!-- Šviesus pilvelis -->
    <path d="M16 66 C28 70, 68 70, 79 64 C71 67, 25 68, 16 66 Z" fill="#ecfccb" opacity="0.8"/>
    <!-- Raštuota kriauklelė / kuprelė ant nugaros -->
    <path d="M27 52 C25 32, 54 27, 57 49 C51 54, 33 55, 27 52 Z" fill="url(#shellGrad)" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M40 35 C47 34, 51 41, 46 46 C42 48, 37 44, 40 39" fill="none" stroke="#78350f" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="38" cy="36" rx="5" ry="2.5" transform="rotate(-22 38 36)" fill="#fef3c7" opacity="0.7"/>
    <!-- Du akių rageliai -->
    <path d="M68 46 Q73 31 70 25" fill="none" stroke="#65a30d" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M68 46 Q73 31 70 25" fill="none" stroke="#0f172a" stroke-width="1.4" stroke-linecap="round" opacity="0.35"/>
    <path d="M77 48 Q84 34 83 27" fill="none" stroke="#84cc16" stroke-width="4.2" stroke-linecap="round"/>
    <circle cx="70" cy="24" r="5.5" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="71.6" cy="24" r="2.3" fill="#0f172a"/>
    <circle cx="83" cy="26" r="5.5" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="84.5" cy="26" r="2.3" fill="#0f172a"/>
    <!-- Linksmas blizgesys ir lūpytė -->
    <ellipse cx="64" cy="52" rx="6" ry="2.4" fill="#ecfccb" opacity="0.75"/>
    <path d="M75 58 Q80 60 82 57" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
    `,
    `<linearGradient id="slugGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a3e635"/><stop offset="100%" stop-color="#4d7c0f"/></linearGradient>
     <radialGradient id="shellGrad" cx="38%" cy="35%" r="65%"><stop offset="0%" stop-color="#fde047"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></radialGradient>`
  ),

  rushing_hedgehog: () => wrapSvg(
    `
    <!-- Bėgančios galinės kojytės -->
    <ellipse cx="32" cy="73" rx="8" ry="4.5" transform="rotate(-14 32 73)" fill="#92400e" stroke="#0f172a" stroke-width="2.6"/>
    <ellipse cx="59" cy="74" rx="8" ry="4.5" transform="rotate(14 59 74)" fill="#92400e" stroke="#0f172a" stroke-width="2.6"/>
    <!-- Aštrūs spygliai -->
    <path d="M12 50 L24 41 L14 33 L29 31 L24 20 L40 25 L43 13 L53 24 L65 18 L63 32 L72 34 L58 64 L19 63 Z" fill="url(#spikeGrad)" stroke="#0f172a" stroke-width="3.1" stroke-linejoin="round"/>
    <!-- Vidinis spyglio šviesesnis sluoksnis -->
    <path d="M22 48 L33 41 L28 33 L42 32 L45 22 L53 31 L61 28 L55 56 L26 57 Z" fill="#b45309" opacity="0.65"/>
    <!-- Snukutis ir kūnelis -->
    <path d="M35 45 C42 36, 62 35, 72 44 C79 49, 86 52, 86 56 C86 62, 74 68, 52 68 C38 68, 30 60, 35 45 Z" fill="url(#hogFace)" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>
    <!-- Ausytė -->
    <ellipse cx="52" cy="40" rx="5.5" ry="6.5" transform="rotate(-12 52 40)" fill="#fdba74" stroke="#0f172a" stroke-width="2.5"/>
    <ellipse cx="52" cy="40" rx="2.6" ry="3.5" fill="#fb7185"/>
    <!-- Akis ir ryžtingas antakis -->
    <circle cx="67" cy="49" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="2.2"/>
    <circle cx="68.5" cy="49" r="2.4" fill="#0f172a"/>
    <circle cx="69.5" cy="47.8" r="0.9" fill="#ffffff"/>
    <path d="M60 42 L73 45" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round"/>
    <!-- Rausvas skruostas ir juoda nosytė -->
    <ellipse cx="63" cy="57" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.7"/>
    <circle cx="85" cy="55" r="4" fill="#0f172a"/>
    <circle cx="86" cy="54" r="1.2" fill="#e2e8f0"/>
    <!-- Greičio brūkšniai -->
    <path d="M6 42 L13 42 M4 56 L12 56" stroke="#fed7aa" stroke-width="2.5" stroke-linecap="round"/>
    `,
    `<linearGradient id="spikeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f97316"/><stop offset="100%" stop-color="#7c2d12"/></linearGradient>
     <linearGradient id="hogFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffedd5"/><stop offset="100%" stop-color="#fb923c"/></linearGradient>`
  ),

  armored_beetle: () => wrapSvg(
    `
    <!-- 6 metalinės kojos -->
    <path d="M30 29 L23 17 L15 19 M48 25 L47 13 L39 14 M64 31 L71 19 L79 22" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M30 67 L23 79 L15 77 M48 71 L47 83 L39 82 M64 65 L71 77 L79 74" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Didelis raganosio ragas -->
    <path d="M71 42 C82 37, 89 27, 84 19 C88 29, 82 47, 73 51 Z" fill="#94a3b8" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>
    <!-- Šarvuotas galvos skydas -->
    <ellipse cx="67" cy="48" rx="14" ry="16" fill="#312e81" stroke="#0f172a" stroke-width="3.2"/>
    <!-- Kietas antsparnis (carapace) -->
    <path d="M16 48 C16 26, 44 22, 62 32 C66 40, 66 56, 62 64 C44 74, 16 70, 16 48 Z" fill="url(#beetleArmor)" stroke="#0f172a" stroke-width="3.4"/>
    <!-- Antsparnio siūlė ir kniedės -->
    <line x1="17" y1="48" x2="62" y2="48" stroke="#0f172a" stroke-width="2.6"/>
    <line x1="59" y1="31" x2="59" y2="65" stroke="#c7d2fe" stroke-width="2.2" opacity="0.7"/>
    <circle cx="29" cy="36" r="2.2" fill="#c7d2fe"/>
    <circle cx="29" cy="60" r="2.2" fill="#c7d2fe"/>
    <circle cx="52" cy="34" r="2.2" fill="#c7d2fe"/>
    <circle cx="52" cy="62" r="2.2" fill="#c7d2fe"/>
    <!-- Metalinis blizgesys ant šarvų -->
    <ellipse cx="40" cy="35" rx="15" ry="4.5" transform="rotate(-10 40 35)" fill="#e0e7ff" opacity="0.45"/>
    <ellipse cx="42" cy="59" rx="12" ry="3.2" transform="rotate(8 42 59)" fill="#818cf8" opacity="0.35"/>
    <!-- Švytinčios akys -->
    <circle cx="72" cy="41" r="3.4" fill="#facc15" stroke="#0f172a" stroke-width="1.8"/>
    <circle cx="72" cy="55" r="3.4" fill="#facc15" stroke="#0f172a" stroke-width="1.8"/>
    `,
    `<linearGradient id="beetleArmor" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#818cf8"/><stop offset="50%" stop-color="#4338ca"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient>`
  ),

  forest_shadow: () => wrapSvg(
    `
    <!-- Šešėlinė rūko aura -->
    <circle cx="48" cy="48" r="34" fill="#2dd4bf" fill-opacity="0.16"/>
    <!-- Suplėšytas apsiaustas -->
    <path d="M26 76 L22 52 C20 30, 34 15, 52 16 C69 17, 78 33, 74 58 L77 78 L66 71 L57 81 L47 72 L37 82 Z" fill="url(#shadowCloak)" stroke="#0f172a" stroke-width="3.2" stroke-linejoin="round"/>
    <!-- Gaubto anga -->
    <ellipse cx="56" cy="42" rx="15" ry="18" fill="#020617" stroke="#2dd4bf" stroke-width="2.2"/>
    <!-- Švytinčios žydros akys -->
    <ellipse cx="52" cy="41" rx="4.2" ry="2.8" transform="rotate(14 52 41)" fill="#5eead4"/>
    <ellipse cx="64" cy="41" rx="4.2" ry="2.8" transform="rotate(-14 64 41)" fill="#5eead4"/>
    <circle cx="53" cy="41" r="1.4" fill="#ffffff"/>
    <circle cx="63" cy="41" r="1.4" fill="#ffffff"/>
    <!-- Miško lapelis ant gaubto -->
    <path d="M48 18 C43 7, 56 6, 59 17 C55 21, 50 20, 48 18 Z" fill="#10b981" stroke="#0f172a" stroke-width="2.2"/>
    <!-- Dūmo sruogos -->
    <path d="M18 62 Q10 56 15 47" fill="none" stroke="#5eead4" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>
    `,
    `<linearGradient id="shadowCloak" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#475569"/><stop offset="60%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>`
  ),

  hornet_swarm: () => wrapSvg(
    `
    <!-- Aštrus geluonis -->
    <path d="M22 52 L8 58 L20 45 Z" fill="#0f172a"/>
    <!-- Geltonai-juodai dryžuotas pilvelis -->
    <ellipse cx="34" cy="52" rx="18" ry="12" transform="rotate(-12 34 52)" fill="#facc15" stroke="#0f172a" stroke-width="3.2"/>
    <path d="M25 43 C27 49, 27 56, 25 61 M34 40 C37 48, 37 56, 34 63 M43 41 C46 48, 46 56, 43 62" fill="none" stroke="#0f172a" stroke-width="4.2"/>
    <!-- Krūtinė ir galva -->
    <circle cx="57" cy="48" r="11" fill="#eab308" stroke="#0f172a" stroke-width="3"/>
    <circle cx="72" cy="49" r="10.5" fill="#fde047" stroke="#0f172a" stroke-width="3"/>
    <!-- Antenos -->
    <path d="M74 40 Q82 28 87 30 M78 41 Q86 32 90 36" fill="none" stroke="#0f172a" stroke-width="2.4" stroke-linecap="round"/>
    <!-- Pikta akis -->
    <ellipse cx="75" cy="48" rx="4.4" ry="5.5" transform="rotate(-15 75 48)" fill="#dc2626" stroke="#0f172a" stroke-width="2"/>
    <circle cx="76" cy="46.5" r="1.4" fill="#fef08a"/>
    <!-- Šviesus atspindys ant kūno -->
    <ellipse cx="34" cy="45" rx="9" ry="2.8" transform="rotate(-10 34 45)" fill="#fef9c3" opacity="0.7"/>
    <!-- Kojytės -->
    <path d="M52 57 L47 68 M60 58 L57 69" fill="none" stroke="#0f172a" stroke-width="2.6" stroke-linecap="round"/>
    `
  ),

  tunnel_mole: () => wrapSvg(
    `
    <!-- Kurmio kūnas -->
    <ellipse cx="45" cy="55" rx="25" ry="21" fill="url(#moleFur)" stroke="#0f172a" stroke-width="3.2"/>
    <!-- Šviesus pilvelis -->
    <ellipse cx="52" cy="60" rx="14" ry="13" fill="#fde68a" opacity="0.78"/>
    <!-- Geltonas šachtininko šalmukas -->
    <path d="M29 41 C30 22, 66 20, 69 40 Z" fill="url(#helmetGrad)" stroke="#0f172a" stroke-width="3"/>
    <path d="M26 41 L76 41" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Šviečiantis žibintuvėlis ant šalmo -->
    <rect x="61" y="25" width="11" height="9" rx="3" fill="#334155" stroke="#0f172a" stroke-width="2.2"/>
    <circle cx="71" cy="29.5" r="3.5" fill="#fef08a"/>
    <polygon points="73,27 94,19 94,40 73,32" fill="#fef08a" opacity="0.34"/>
    <!-- Akis, snukutis ir rausva nosytė -->
    <circle cx="62" cy="48" r="3.2" fill="#0f172a"/>
    <circle cx="63" cy="47" r="1" fill="#ffffff"/>
    <ellipse cx="72" cy="54" rx="8" ry="6" fill="#d97706" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="79" cy="53" r="4.5" fill="#fb7185" stroke="#0f172a" stroke-width="2"/>
    <!-- Didelės kasimo letenos su nagais -->
    <ellipse cx="61" cy="70" rx="10" ry="6" fill="#fbbf24" stroke="#0f172a" stroke-width="2.6"/>
    <path d="M68 67 L75 66 M69 70 L76 70 M68 73 L74 74" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="34" cy="72" rx="9" ry="5.5" fill="#d97706" stroke="#0f172a" stroke-width="2.5"/>
    `,
    `<linearGradient id="moleFur" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#451a03"/></linearGradient>
     <linearGradient id="helmetGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#eab308"/></linearGradient>`
  ),

  weed_golem: () => wrapSvg(
    `
    <!-- Šaknų kojos -->
    <rect x="27" y="64" width="14" height="17" rx="5" fill="#14532d" stroke="#0f172a" stroke-width="3"/>
    <rect x="54" y="64" width="14" height="17" rx="5" fill="#14532d" stroke="#0f172a" stroke-width="3"/>
    <!-- Masyvūs samanų pečiai ir kūnas -->
    <path d="M18 40 C16 20, 37 15, 48 16 C63 16, 78 22, 78 42 C78 60, 68 71, 48 71 C28 71, 20 60, 18 40 Z" fill="url(#golemGrad)" stroke="#0f172a" stroke-width="3.4"/>
    <!-- Akmeniniai luitai ir samanos -->
    <ellipse cx="30" cy="37" rx="11" ry="9" fill="#166534" stroke="#0f172a" stroke-width="2.4"/>
    <ellipse cx="67" cy="38" rx="11" ry="9" fill="#166534" stroke="#0f172a" stroke-width="2.4"/>
    <!-- Lapų kuokštai ant galvos ir pečių -->
    <path d="M39 18 C34 7, 45 6, 48 16 C52 6, 63 8, 57 18 Z" fill="#4ade80" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M22 46 Q35 55 48 48 Q61 55 74 46" fill="none" stroke="#86efac" stroke-width="2.8" stroke-linecap="round"/>
    <!-- Švytinčios žalios akys ir plyšys -->
    <ellipse cx="44" cy="36" rx="5" ry="3.5" fill="#d9f99d" stroke="#0f172a" stroke-width="2"/>
    <ellipse cx="60" cy="36" rx="5" ry="3.5" fill="#d9f99d" stroke="#0f172a" stroke-width="2"/>
    <path d="M40 50 L47 54 L53 50 L60 54 L65 50" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    `<linearGradient id="golemGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4ade80"/><stop offset="55%" stop-color="#15803d"/><stop offset="100%" stop-color="#052e16"/></linearGradient>`
  ),

  noise_goblin: () => wrapSvg(
    `
    <!-- Kūnas -->
    <ellipse cx="39" cy="60" rx="15" ry="15" fill="#db2777" stroke="#0f172a" stroke-width="3"/>
    <!-- Smailios goblino ausys -->
    <polygon points="27,34 11,26 24,44" fill="#f472b6" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>
    <polygon points="52,32 62,18 57,39" fill="#f472b6" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>
    <!-- Galva -->
    <circle cx="42" cy="40" r="16" fill="url(#goblinSkin)" stroke="#0f172a" stroke-width="3.2"/>
    <!-- Išdykusios akys ir šypsena -->
    <circle cx="38" cy="37" r="4.3" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>
    <circle cx="39.2" cy="37" r="1.8" fill="#0f172a"/>
    <circle cx="50" cy="37" r="4.3" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>
    <circle cx="51.2" cy="37" r="1.8" fill="#0f172a"/>
    <path d="M37 47 Q45 53 53 46" fill="none" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round"/>
    <!-- Megafonas rankoje -->
    <polygon points="55,54 79,40 79,68 55,58" fill="#fde047" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>
    <rect x="49" y="53" width="8" height="8" rx="2" fill="#ef4444" stroke="#0f172a" stroke-width="2.2"/>
    <!-- Garso bangos -->
    <path d="M83 45 Q88 54 83 63 M88 40 Q94 54 88 68" fill="none" stroke="#fbcfe8" stroke-width="2.6" stroke-linecap="round"/>
    `,
    `<linearGradient id="goblinSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#be185d"/></linearGradient>`
  ),

  exploding_beetle: () => wrapSvg(
    `
    <!-- Kojytės -->
    <path d="M31 31 L23 20 M49 27 L49 16 M65 33 L73 22 M31 65 L23 76 M49 69 L49 80 M65 63 L73 74" stroke="#0f172a" stroke-width="3.8" stroke-linecap="round"/>
    <!-- Švytintis sprogus pilvelis -->
    <circle cx="34" cy="48" r="20" fill="url(#bombGlow)" stroke="#0f172a" stroke-width="3.2"/>
    <path d="M23 39 L42 57 M23 57 L42 39" stroke="#7f1d1d" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    <circle cx="32" cy="46" r="9" fill="#fef08a" opacity="0.85"/>
    <!-- Priekinis šarvas ir žnyplės -->
    <ellipse cx="62" cy="48" rx="15" ry="15" fill="#dc2626" stroke="#0f172a" stroke-width="3.2"/>
    <path d="M74 42 L85 38 L79 47 M74 54 L85 58 L79 49" fill="#fde047" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="67" cy="42" r="3.2" fill="#fef08a" stroke="#0f172a" stroke-width="1.8"/>
    <circle cx="67" cy="54" r="3.2" fill="#fef08a" stroke="#0f172a" stroke-width="1.8"/>
    <!-- Kibirkštėlė ant viršaus -->
    <polygon points="34,15 37,24 45,22 39,28 43,35 34,31 27,36 30,28 24,23 32,24" fill="#fde047" stroke="#ea580c" stroke-width="1.6"/>
    `,
    `<radialGradient id="bombGlow" cx="45%" cy="45%" r="55%"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#f97316"/><stop offset="100%" stop-color="#b91c1c"/></radialGradient>`
  ),

  cyber_raven: () => wrapSvg(
    `
    <!-- Reaktyvinė uodega -->
    <polygon points="10,42 29,48 10,56 17,49" fill="#38bdf8" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>
    <polygon points="6,49 15,45 15,53" fill="#fef08a"/>
    <!-- Metalinis kūnas -->
    <ellipse cx="45" cy="49" rx="23" ry="14" fill="url(#cyberBird)" stroke="#0f172a" stroke-width="3.2"/>
    <!-- Mechaninės plokštės -->
    <path d="M30 41 L54 41 L48 56 L27 54 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
    <!-- Galva ir aštrus metalinis snapas -->
    <circle cx="67" cy="45" r="11" fill="#0284c7" stroke="#0f172a" stroke-width="3"/>
    <polygon points="75,41 91,47 75,52" fill="#cbd5e1" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>
    <!-- Raudonas lazerinis vizorius -->
    <rect x="65" y="40" width="10" height="5" rx="2" fill="#0f172a"/>
    <circle cx="71" cy="42.5" r="2.3" fill="#ef4444"/>
    `,
    `<linearGradient id="cyberBird" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>`
  ),

  // ==================== 5 ZONŲ BOSAI (SU KARŪNOMIS IR UNIKALIAIS ŠARVAIS) ====================
  boss_slug_king: () => wrapSvg(
    `
    <!-- Karališka gleivių aura -->
    <ellipse cx="46" cy="76" rx="40" ry="10" fill="#a3e635" fill-opacity="0.45"/>
    <!-- Karališkasis apsiaustas ir kūnas -->
    <path d="M10 66 C8 50, 26 42, 49 42 C67 42, 79 44, 83 53 C86 64, 79 75, 58 75 C32 75, 13 73, 10 66 Z" fill="url(#kingSlug)" stroke="#0f172a" stroke-width="3.4"/>
    <!-- Purpurinis karaliaus šarvas-kriauklė -->
    <path d="M22 52 C20 26, 56 22, 61 48 C50 55, 30 56, 22 52 Z" fill="url(#royalShell)" stroke="#0f172a" stroke-width="3.2"/>
    <path d="M24 51 Q41 56 59 48" fill="none" stroke="#fde047" stroke-width="3.2"/>
    <!-- Auksinė karūna su brangakmeniais -->
    <polygon points="31,29 33,13 42,22 49,10 56,22 64,14 64,29" fill="#fde047" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>
    <circle cx="49" cy="21" r="2.6" fill="#ef4444"/>
    <circle cx="38" cy="24" r="2" fill="#38bdf8"/>
    <circle cx="59" cy="24" r="2" fill="#38bdf8"/>
    <!-- Akių rageliai ir piktas žvilgsnis -->
    <path d="M68 45 Q73 29 70 22 M78 47 Q84 31 82 24" fill="none" stroke="#65a30d" stroke-width="4.4" stroke-linecap="round"/>
    <circle cx="70" cy="21" r="5.5" fill="#ffffff" stroke="#0f172a" stroke-width="2.4"/>
    <circle cx="71.5" cy="21" r="2.4" fill="#dc2626"/>
    <circle cx="82" cy="23" r="5.5" fill="#ffffff" stroke="#0f172a" stroke-width="2.4"/>
    <circle cx="83.5" cy="23" r="2.4" fill="#dc2626"/>
    <path d="M66 14 L86 18" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round"/>
    `,
    `<linearGradient id="kingSlug" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#84cc16"/><stop offset="100%" stop-color="#3f6212"/></linearGradient>
     <linearGradient id="royalShell" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#581c87"/></linearGradient>`
  ),

  boss_iron_mole: () => wrapSvg(
    `
    <!-- Šarvuotas kūnas -->
    <ellipse cx="42" cy="54" rx="28" ry="23" fill="#451a03" stroke="#0f172a" stroke-width="3.4"/>
    <path d="M20 55 C20 35, 58 35, 62 55 L58 72 L24 72 Z" fill="#64748b" stroke="#0f172a" stroke-width="2.8"/>
    <!-- Plieninis šalmas + karūnos ženklas -->
    <path d="M24 38 C26 17, 64 17, 67 38 Z" fill="url(#ironGrad)" stroke="#0f172a" stroke-width="3"/>
    <polygon points="36,20 40,10 46,16 52,10 56,20" fill="#fde047" stroke="#0f172a" stroke-width="2.2" stroke-linejoin="round"/>
    <!-- Raudonas vizorius -->
    <rect x="48" y="39" width="16" height="7" rx="3" fill="#0f172a"/>
    <rect x="51" y="41" width="10" height="3" rx="1.5" fill="#ef4444"/>
    <!-- Milžiniškas grąžtas vietoj nosies -->
    <polygon points="64,45 92,54 64,63" fill="#cbd5e1" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M69 47 L69 61 M76 49 L76 59 M83 51 L83 57" stroke="#334155" stroke-width="2.6"/>
    <!-- Spygliuota kasimo letena -->
    <ellipse cx="52" cy="73" rx="12" ry="7" fill="#94a3b8" stroke="#0f172a" stroke-width="2.8"/>
    <path d="M61 70 L69 69 M62 73 L70 73 M61 76 L68 77" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
    `,
    `<linearGradient id="ironGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#334155"/></linearGradient>`
  ),

  boss_shadow_lord: () => wrapSvg(
    `
    <circle cx="48" cy="48" r="38" fill="#6366f1" fill-opacity="0.18"/>
    <!-- Tamsūs ragai -->
    <path d="M35 24 L23 8 L29 22 L19 16 M61 24 L73 8 L67 22 L77 16" fill="none" stroke="#312e81" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Didelis valdovo apsiaustas -->
    <path d="M18 80 L18 46 C18 24, 34 16, 48 16 C64 16, 78 24, 78 48 L80 80 L67 72 L56 84 L47 73 L36 84 L26 72 Z" fill="url(#lordCloak)" stroke="#0f172a" stroke-width="3.4" stroke-linejoin="round"/>
    <!-- Auksinė šešėlių karūna -->
    <polygon points="34,23 36,10 44,17 48,7 53,17 61,10 62,23" fill="#fde047" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round"/>
    <!-- Gobtuvas ir švytinčios akys -->
    <ellipse cx="52" cy="41" rx="16" ry="18" fill="#020617" stroke="#a78bfa" stroke-width="2.4"/>
    <ellipse cx="47" cy="40" rx="4.5" ry="3" transform="rotate(16 47 40)" fill="#2dd4bf"/>
    <ellipse cx="60" cy="40" rx="4.5" ry="3" transform="rotate(-16 60 40)" fill="#2dd4bf"/>
    <!-- Rankos su šešėline ugnimi -->
    <circle cx="24" cy="54" r="6" fill="#2dd4bf" opacity="0.75"/>
    <circle cx="76" cy="54" r="6" fill="#2dd4bf" opacity="0.75"/>
    `,
    `<linearGradient id="lordCloak" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4338ca"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>`
  ),

  boss_wrong_notes: () => wrapSvg(
    `
    <!-- Disonansinės natos aplink -->
    <text x="10" y="25" font-size="16" font-weight="bold" fill="#fde047">♯</text>
    <text x="76" y="24" font-size="16" font-weight="bold" fill="#fb7185">♫</text>
    <text x="78" y="80" font-size="16" font-weight="bold" fill="#fde047">♭</text>
    <!-- Kūnas -->
    <circle cx="45" cy="52" r="27" fill="url(#baubasGrad)" stroke="#0f172a" stroke-width="3.4"/>
    <!-- Kreiva auksinė karūna -->
    <polygon points="29,29 27,13 38,20 45,9 53,20 63,14 60,29" fill="#fde047" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>
    <!-- Triūbos ragas dešinėje -->
    <polygon points="62,48 89,36 89,66 62,57" fill="#f59e0b" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>
    <!-- Iškraipyta klavišų burna ir akys -->
    <circle cx="38" cy="41" r="5" fill="#ffffff" stroke="#0f172a" stroke-width="2.2"/>
    <circle cx="39" cy="41" r="2.2" fill="#0f172a"/>
    <circle cx="53" cy="39" r="6" fill="#fef08a" stroke="#0f172a" stroke-width="2.2"/>
    <circle cx="54" cy="39" r="2.5" fill="#be185d"/>
    <rect x="27" y="53" width="29" height="12" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="2.4"/>
    <line x1="34" y1="53" x2="34" y2="65" stroke="#0f172a" stroke-width="2"/>
    <line x1="41" y1="53" x2="41" y2="65" stroke="#0f172a" stroke-width="2"/>
    <line x1="48" y1="53" x2="48" y2="65" stroke="#0f172a" stroke-width="2"/>
    `,
    `<radialGradient id="baubasGrad" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#881337"/></radialGradient>`
  ),

  boss_cyber_mega: () => wrapSvg(
    `
    <!-- Energijos skydo žiedas -->
    <circle cx="48" cy="50" r="40" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="8 5" opacity="0.65"/>
    <!-- Pečių patrankos -->
    <rect x="20" y="21" width="16" height="12" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2.6"/>
    <rect x="60" y="21" width="18" height="12" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2.6"/>
    <circle cx="78" cy="27" r="3" fill="#38bdf8"/>
    <!-- Pagrindinis mecho korpusas -->
    <path d="M22 36 C22 25, 74 25, 74 36 L78 66 C78 75, 64 81, 48 81 C32 81, 18 75, 18 66 Z" fill="url(#cyberBossGrad)" stroke="#0f172a" stroke-width="3.4"/>
    <!-- Karvedžio auksinė karūna-antena -->
    <polygon points="34,28 37,12 45,20 48,8 52,20 60,12 62,28" fill="#fde047" stroke="#0f172a" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- Raudonas lazerinis vizorius -->
    <rect x="33" y="34" width="32" height="10" rx="4" fill="#020617" stroke="#38bdf8" stroke-width="1.8"/>
    <rect x="37" y="37" width="24" height="4" rx="2" fill="#ef4444"/>
    <!-- Švytintis krūtinės reaktorius -->
    <circle cx="48" cy="59" r="11" fill="#0ea5e9" stroke="#0f172a" stroke-width="2.8"/>
    <circle cx="48" cy="59" r="6" fill="#e0f2fe"/>
    <!-- Kojos / vikšrai -->
    <rect x="21" y="73" width="18" height="10" rx="4" fill="#334155" stroke="#0f172a" stroke-width="2.6"/>
    <rect x="57" y="73" width="18" height="10" rx="4" fill="#334155" stroke="#0f172a" stroke-width="2.6"/>
    `,
    `<linearGradient id="cyberBossGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>`
  ),

  burrowed_mound: () => wrapSvg(
    `
    <!-- Žemių kauburys -->
    <ellipse cx="48" cy="70" rx="34" ry="12" fill="#451a03" opacity="0.6"/>
    <path d="M16 68 C19 43, 35 34, 48 34 C61 34, 77 43, 80 68 Z" fill="url(#dirtGrad)" stroke="#0f172a" stroke-width="3.2"/>
    <!-- Išlindęs šalmukas -->
    <path d="M36 41 C38 30, 58 30, 60 41 Z" fill="#fde047" stroke="#0f172a" stroke-width="2.4"/>
    <!-- Žemės grumstai -->
    <circle cx="27" cy="60" r="4" fill="#92400e" stroke="#0f172a" stroke-width="1.8"/>
    <circle cx="67" cy="59" r="4.5" fill="#92400e" stroke="#0f172a" stroke-width="1.8"/>
    <circle cx="48" cy="56" r="5" fill="#b45309" stroke="#0f172a" stroke-width="1.8"/>
    <circle cx="22" cy="36" r="3" fill="#d97706"/>
    <circle cx="74" cy="37" r="3.2" fill="#d97706"/>
    `,
    `<linearGradient id="dirtGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#451a03"/></linearGradient>`
  )
};

// ==================== 6 BOKŠTELIŲ 2.5D PAGRINDAI (BASE) IR BESISUKANTYS PABŪKLAI (TURRET) ====================

function buildPedestalBase(opts) {
  const { outer, inner, trim, accent, level, extras = '' } = opts;
  const wallH = 6 + (level >= 3 ? 2 : 0);
  const cornerPlates = level >= 2
    ? `
      <rect x="13" y="16" width="12" height="12" rx="3" fill="${trim}" stroke="#0f172a" stroke-width="2.2"/>
      <rect x="71" y="16" width="12" height="12" rx="3" fill="${trim}" stroke="#0f172a" stroke-width="2.2"/>
      <rect x="13" y="64" width="12" height="12" rx="3" fill="${trim}" stroke="#0f172a" stroke-width="2.2"/>
      <rect x="71" y="64" width="12" height="12" rx="3" fill="${trim}" stroke="#0f172a" stroke-width="2.2"/>
    `
    : '';
  const tierRing = level >= 3
    ? `<circle cx="48" cy="46" r="28" fill="none" stroke="${accent}" stroke-width="2.4" stroke-dasharray="9 5"/>`
    : '';
  return `
    <!-- 2.5D bokštelio postamento sienelė -->
    <polygon points="48,${14 + wallH} 78,${30 + wallH} 78,${64 + wallH} 48,${80 + wallH} 18,${64 + wallH} 18,${30 + wallH}" fill="#020617" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>
    <!-- Pagrindinis aštuonkampis / šešiakampis pamatas -->
    <polygon points="48,14 78,30 78,64 48,80 18,64 18,30" fill="${outer}" stroke="#0f172a" stroke-width="3.2" stroke-linejoin="round"/>
    <polygon points="48,20 71,33 71,61 48,74 25,61 25,33" fill="${inner}" stroke="${trim}" stroke-width="2.2" stroke-linejoin="round"/>
    ${cornerPlates}
    ${tierRing}
    ${extras}
  `;
}

export function getTowerBaseSvg(towerType, level = 1, evolutionId = null) {
  const lvl = clamp(Number(level) || 1, 1, 4);
  const evo = lvl === 4 ? evolutionId : null;

  if (towerType === 'solar_laser') {
    const trim = evo === 'plasma_burner' ? '#f97316' : evo === 'prism_beacon' ? '#22d3ee' : lvl >= 3 ? '#fbbf24' : '#38bdf8';
    const wingLen = lvl >= 2 ? 12 : 9;
    const extras = `
      <!-- Šoniniai saulės moduliai -->
      <rect x="6" y="34" width="${wingLen}" height="24" rx="3" fill="#0369a1" stroke="#0f172a" stroke-width="2.4"/>
      <line x1="7" y1="42" x2="${6 + wingLen - 1}" y2="42" stroke="#bae6fd" stroke-width="1.4"/>
      <line x1="7" y1="50" x2="${6 + wingLen - 1}" y2="50" stroke="#bae6fd" stroke-width="1.4"/>
      <rect x="${90 - wingLen}" y="34" width="${wingLen}" height="24" rx="3" fill="#0369a1" stroke="#0f172a" stroke-width="2.4"/>
      <line x1="${91 - wingLen}" y1="42" x2="89" y2="42" stroke="#bae6fd" stroke-width="1.4"/>
      <line x1="${91 - wingLen}" y1="50" x2="89" y2="50" stroke="#bae6fd" stroke-width="1.4"/>
      ${evo === 'plasma_burner' ? '<circle cx="48" cy="47" r="17" fill="#ea580c" opacity="0.45"/>' : ''}
      ${evo === 'prism_beacon' ? '<polygon points="48,17 55,26 41,26" fill="#67e8f9" stroke="#0f172a" stroke-width="1.8"/>' : ''}
    `;
    return wrapSvg(buildPedestalBase({ outer: '#1e3a5f', inner: '#0f172a', trim, accent: trim, level: lvl, extras }));
  }

  if (towerType === 'dagilelis_sound') {
    const trim = evo === 'choir_harmony' ? '#f472b6' : evo === 'bass_drop' ? '#e11d48' : lvl >= 3 ? '#fde047' : '#fb7185';
    const extras = `
      <!-- Koncertų estrados kolonos ir garso juostos -->
      <rect x="20" y="25" width="9" height="44" rx="3" fill="#9f1239" stroke="#0f172a" stroke-width="2.4"/>
      <rect x="67" y="25" width="9" height="44" rx="3" fill="#9f1239" stroke="#0f172a" stroke-width="2.4"/>
      ${lvl >= 2 ? '<path d="M25 26 Q48 11 71 26" fill="none" stroke="#fde047" stroke-width="3.2" stroke-linecap="round"/>' : ''}
      ${evo === 'bass_drop' ? '<circle cx="24" cy="48" r="7" fill="#020617" stroke="#f43f5e" stroke-width="2.4"/><circle cx="72" cy="48" r="7" fill="#020617" stroke="#f43f5e" stroke-width="2.4"/>' : ''}
      ${evo === 'choir_harmony' ? '<text x="20" y="23" font-size="12" fill="#fde047">♪</text><text x="69" y="23" font-size="12" fill="#fde047">♫</text>' : ''}
    `;
    return wrapSvg(buildPedestalBase({ outer: '#4c0519', inner: '#1e1b4b', trim, accent: trim, level: lvl, extras }));
  }

  if (towerType === 'drone_hangar') {
    const trim = evo === 'scout_scanner' ? '#34d399' : evo === 'missile_drone' ? '#0ea5e9' : '#2dd4bf';
    const extras = `
      <!-- Angaro pakilimo aikštelė (Helipad) -->
      <rect x="20" y="22" width="56" height="50" rx="8" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
      <rect x="25" y="27" width="46" height="40" rx="5" fill="#0f172a" stroke="${trim}" stroke-width="2" stroke-dasharray="6 4"/>
      <!-- H simbolis ant aikštelės -->
      <path d="M39 36 L39 58 M57 36 L57 58 M39 47 L57 47" stroke="${trim}" stroke-width="4" stroke-linecap="round" opacity="0.72"/>
      <!-- Tūpimo žibintai -->
      <circle cx="23" cy="25" r="3" fill="#fde047"/>
      <circle cx="73" cy="25" r="3" fill="#fde047"/>
      <circle cx="23" cy="69" r="3" fill="#fde047"/>
      <circle cx="73" cy="69" r="3" fill="#fde047"/>
      ${evo === 'missile_drone' ? '<rect x="14" y="37" width="8" height="20" rx="2" fill="#dc2626" stroke="#0f172a" stroke-width="2"/><rect x="74" y="37" width="8" height="20" rx="2" fill="#dc2626" stroke="#0f172a" stroke-width="2"/>' : ''}
    `;
    return wrapSvg(buildPedestalBase({ outer: '#0f172a', inner: '#134e4a', trim, accent: trim, level: lvl, extras }));
  }

  if (towerType === 'mower_barracks') {
    const trim = evo === 'armored_guards' ? '#22c55e' : evo === 'electro_mowers' ? '#eab308' : '#4ade80';
    const roofCol = evo === 'electro_mowers' ? '#854d0e' : '#166534';
    const extras = `
      <!-- Robotų-vejapjovių garažiukas -->
      <rect x="19" y="28" width="58" height="46" rx="8" fill="#14532d" stroke="#0f172a" stroke-width="3"/>
      <polygon points="15,34 48,14 81,34" fill="${roofCol}" stroke="#0f172a" stroke-width="3" stroke-linejoin="round"/>
      <!-- Garažo vartai -->
      <rect x="30" y="45" width="36" height="28" rx="4" fill="#052e16" stroke="${trim}" stroke-width="2.4"/>
      <line x1="32" y1="53" x2="64" y2="53" stroke="#4ade80" stroke-width="1.6" opacity="0.5"/>
      <line x1="32" y1="61" x2="64" y2="61" stroke="#4ade80" stroke-width="1.6" opacity="0.5"/>
      ${evo === 'armored_guards' ? '<path d="M48 18 L57 23 L54 33 L48 36 L42 33 L39 23 Z" fill="#fde047" stroke="#0f172a" stroke-width="2"/>' : ''}
      ${evo === 'electro_mowers' ? '<circle cx="22" cy="25" r="5" fill="#fde047" stroke="#0f172a" stroke-width="2"/><circle cx="74" cy="25" r="5" fill="#fde047" stroke="#0f172a" stroke-width="2"/>' : ''}
    `;
    return wrapSvg(buildPedestalBase({ outer: '#14532d', inner: '#052e16', trim, accent: trim, level: lvl, extras }));
  }

  if (towerType === 'berry_catapult') {
    const trim = evo === 'arctic_cannon' ? '#60a5fa' : evo === 'double_catapult' ? '#a855f7' : '#818cf8';
    const extras = `
      <!-- Medinis / akmeninis apgulties platformos karkasas -->
      <rect x="19" y="22" width="58" height="52" rx="9" fill="#78350f" stroke="#0f172a" stroke-width="3"/>
      <line x1="21" y1="36" x2="75" y2="36" stroke="#451a03" stroke-width="2.5"/>
      <line x1="21" y1="58" x2="75" y2="58" stroke="#451a03" stroke-width="2.5"/>
      <!-- Šilauogių sviedinių krepšys kampe -->
      <circle cx="28" cy="64" r="5" fill="${trim}" stroke="#0f172a" stroke-width="1.8"/>
      <circle cx="36" cy="66" r="5" fill="${trim}" stroke="#0f172a" stroke-width="1.8"/>
      <circle cx="32" cy="59" r="5" fill="#c7d2fe" stroke="#0f172a" stroke-width="1.8"/>
      ${lvl >= 2 ? '<rect x="18" y="21" width="11" height="11" rx="2" fill="#94a3b8" stroke="#0f172a" stroke-width="2"/><rect x="67" y="21" width="11" height="11" rx="2" fill="#94a3b8" stroke="#0f172a" stroke-width="2"/>' : ''}
    `;
    return wrapSvg(buildPedestalBase({ outer: '#4338ca', inner: '#312e81', trim, accent: trim, level: lvl, extras }));
  }

  // solar_station
  const trim = evo === 'power_plant_10kw' ? '#f59e0b' : evo === 'super_capacitor' ? '#fde047' : '#fbbf24';
  const extras = `
    <!-- Inverterio dėžė ir akumuliatoriaus įkrovos indikatoriai -->
    <rect x="17" y="24" width="62" height="50" rx="8" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
    <rect x="24" y="61" width="48" height="9" rx="3" fill="#0f172a" stroke="${trim}" stroke-width="1.8"/>
    <rect x="27" y="63.5" width="13" height="4" rx="1" fill="#4ade80"/>
    <rect x="42" y="63.5" width="13" height="4" rx="1" fill="#facc15"/>
    <rect x="57" y="63.5" width="12" height="4" rx="1" fill="#38bdf8"/>
    ${lvl >= 3 ? '<circle cx="22" cy="29" r="4" fill="#fbbf24" stroke="#0f172a" stroke-width="1.8"/><circle cx="74" cy="29" r="4" fill="#fbbf24" stroke="#0f172a" stroke-width="1.8"/>' : ''}
  `;
  return wrapSvg(buildPedestalBase({ outer: '#78350f', inner: '#0f172a', trim, accent: trim, level: lvl, extras }));
}

export function getTowerTurretSvg(towerType, level = 1, evolutionId = null) {
  const lvl = clamp(Number(level) || 1, 1, 4);
  const evo = lvl === 4 ? evolutionId : null;

  if (towerType === 'solar_laser') {
    const coreColor = evo === 'plasma_burner' ? '#fb923c' : evo === 'prism_beacon' ? '#67e8f9' : '#38bdf8';
    const bodyColor = evo === 'plasma_burner' ? '#9a3412' : evo === 'prism_beacon' ? '#164e63' : '#1e293b';
    let barrel = `
      <rect x="44" y="42" width="33" height="12" rx="4" fill="#475569" stroke="#0f172a" stroke-width="2.6"/>
      <rect x="48" y="45" width="27" height="6" rx="2" fill="${coreColor}"/>
    `;
    if (lvl >= 3 && evo !== 'prism_beacon') {
      barrel = `
        <rect x="44" y="36" width="35" height="9" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2.4"/>
        <rect x="44" y="51" width="35" height="9" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2.4"/>
        <rect x="48" y="38.5" width="29" height="4" rx="1.5" fill="${coreColor}"/>
        <rect x="48" y="53.5" width="29" height="4" rx="1.5" fill="${coreColor}"/>
      `;
    }
    if (evo === 'prism_beacon') {
      barrel = `
        <polygon points="52,32 82,48 52,64" fill="#22d3ee" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>
        <polygon points="56,39 76,48 56,57" fill="#fef08a" opacity="0.85"/>
      `;
    }
    const lvlTrim = lvl >= 2 ? `<circle cx="48" cy="48" r="17" fill="${bodyColor}" stroke="#fde047" stroke-width="2.6"/>` : `<circle cx="48" cy="48" r="15" fill="${bodyColor}" stroke="#0f172a" stroke-width="2.8"/>`;
    return wrapSvg(`
      ${barrel}
      ${lvlTrim}
      <!-- Kristalinis saulės židinys centre -->
      <polygon points="48,36 58,48 48,60 38,48" fill="${coreColor}" stroke="#0f172a" stroke-width="2.2"/>
      <circle cx="48" cy="48" r="4.5" fill="#ffffff"/>
    `);
  }

  if (towerType === 'dagilelis_sound') {
    const hornColor = evo === 'choir_harmony' ? '#f472b6' : evo === 'bass_drop' ? '#e11d48' : '#fb7185';
    const bellScale = lvl >= 3 ? 17 : lvl === 2 ? 14 : 11;
    const secondHorn = lvl >= 2
      ? `<polygon points="54,40 80,28 80,45 54,46" fill="#fde047" stroke="#0f172a" stroke-width="2.2" stroke-linejoin="round"/>`
      : '';
    return wrapSvg(`
      <!-- Garsiakalbio trimitas į dešinę -->
      <polygon points="48,40 82,${48 - bellScale} 82,${48 + bellScale} 48,56" fill="${hornColor}" stroke="#0f172a" stroke-width="2.8" stroke-linejoin="round"/>
      ${secondHorn}
      <line x1="78" y1="${48 - bellScale + 3}" x2="78" y2="${48 + bellScale - 3}" stroke="#fef08a" stroke-width="2.6"/>
      <!-- Garso kupolas ir muzikinė nata -->
      <circle cx="46" cy="48" r="16" fill="#be123c" stroke="#0f172a" stroke-width="3"/>
      <circle cx="46" cy="48" r="11" fill="#ffe4e6" opacity="0.22"/>
      <text x="46" y="54" text-anchor="middle" font-size="18" font-weight="bold" fill="#fde047">${evo === 'bass_drop' ? '🔊' : '♫'}</text>
    `);
  }

  if (towerType === 'drone_hangar') {
    const dishCol = evo === 'scout_scanner' ? '#34d399' : evo === 'missile_drone' ? '#38bdf8' : '#2dd4bf';
    const turretBody = evo === 'missile_drone'
      ? `
        <rect x="44" y="34" width="28" height="10" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2.4"/>
        <rect x="44" y="52" width="28" height="10" rx="3" fill="#475569" stroke="#0f172a" stroke-width="2.4"/>
        <circle cx="71" cy="39" r="3.5" fill="#ef4444"/>
        <circle cx="71" cy="57" r="3.5" fill="#ef4444"/>
      `
      : `
        <path d="M50 32 Q68 48 50 64 Z" fill="${dishCol}" stroke="#0f172a" stroke-width="2.6" stroke-linejoin="round"/>
        <line x1="58" y1="48" x2="75" y2="48" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="76" cy="48" r="3.5" fill="#fef08a" stroke="#0f172a" stroke-width="1.8"/>
      `;
    return wrapSvg(`
      ${turretBody}
      <circle cx="46" cy="48" r="${12 + lvl}" fill="#0f172a" stroke="${dishCol}" stroke-width="2.8"/>
      <circle cx="46" cy="48" r="5.5" fill="${dishCol}"/>
    `);
  }

  if (towerType === 'mower_barracks') {
    const crestCol = evo === 'armored_guards' ? '#fde047' : evo === 'electro_mowers' ? '#facc15' : '#4ade80';
    return wrapSvg(`
      <!-- Garažo bokštelio stogo antena ir švyturėlis -->
      <circle cx="48" cy="36" r="11" fill="#15803d" stroke="#0f172a" stroke-width="2.6"/>
      ${lvl >= 2 ? `<rect x="41" y="21" width="14" height="6" rx="2" fill="${crestCol}" stroke="#0f172a" stroke-width="1.8"/>` : ''}
      ${evo === 'electro_mowers' ? '<polygon points="49,13 42,27 49,27 45,38 56,23 49,23" fill="#fde047" stroke="#0f172a" stroke-width="1.8"/>' : ''}
      ${lvl >= 3 ? '<circle cx="32" cy="36" r="4.5" fill="#fbbf24" stroke="#0f172a" stroke-width="1.8"/><circle cx="64" cy="36" r="4.5" fill="#fbbf24" stroke="#0f172a" stroke-width="1.8"/>' : ''}
    `);
  }

  if (towerType === 'berry_catapult') {
    const ammoCol = evo === 'arctic_cannon' ? '#60a5fa' : evo === 'double_catapult' ? '#c084fc' : '#818cf8';
    const arm = evo === 'arctic_cannon'
      ? `
        <rect x="42" y="38" width="36" height="20" rx="5" fill="#1e3a8a" stroke="#0f172a" stroke-width="2.8"/>
        <circle cx="77" cy="48" r="7" fill="#bae6fd" stroke="#0f172a" stroke-width="2.2"/>
      `
      : evo === 'double_catapult'
        ? `
          <rect x="44" y="34" width="28" height="7" rx="3" fill="#92400e" stroke="#0f172a" stroke-width="2.2"/>
          <rect x="44" y="55" width="28" height="7" rx="3" fill="#92400e" stroke="#0f172a" stroke-width="2.2"/>
          <circle cx="72" cy="37.5" r="7" fill="#c084fc" stroke="#0f172a" stroke-width="2.2"/>
          <circle cx="72" cy="58.5" r="7" fill="#c084fc" stroke="#0f172a" stroke-width="2.2"/>
        `
        : `
          <rect x="42" y="44" width="32" height="8" rx="3" fill="#b45309" stroke="#0f172a" stroke-width="2.4"/>
          <circle cx="73" cy="48" r="${7 + lvl * 0.6}" fill="${ammoCol}" stroke="#0f172a" stroke-width="2.2"/>
          <circle cx="71" cy="46" r="2.2" fill="#e0e7ff"/>
        `;
    return wrapSvg(`
      ${arm}
      <circle cx="46" cy="48" r="14" fill="#312e81" stroke="#c7d2fe" stroke-width="2.4"/>
      <circle cx="46" cy="48" r="6" fill="${ammoCol}"/>
    `);
  }

  // solar_station upright panel array
  const panelTrim = evo === 'power_plant_10kw' ? '#f59e0b' : evo === 'super_capacitor' ? '#38bdf8' : lvl >= 3 ? '#fbbf24' : '#38bdf8';
  const gridCells = lvl >= 2
    ? `<line x1="48" y1="22" x2="48" y2="56" stroke="#bae6fd" stroke-width="2"/>
       <line x1="34" y1="22" x2="34" y2="56" stroke="#bae6fd" stroke-width="1.4"/>
       <line x1="62" y1="22" x2="62" y2="56" stroke="#bae6fd" stroke-width="1.4"/>`
    : `<line x1="48" y1="22" x2="48" y2="56" stroke="#bae6fd" stroke-width="2"/>`;
  return wrapSvg(`
    <!-- Pakreiptas mėlynas saulės elektrinės panelių masyvas -->
    <polygon points="23,22 73,22 78,56 18,56" fill="#0369a1" stroke="${panelTrim}" stroke-width="3" stroke-linejoin="round"/>
    ${gridCells}
    <line x1="21" y1="33" x2="75" y2="33" stroke="#bae6fd" stroke-width="1.6"/>
    <line x1="20" y1="45" x2="76" y2="45" stroke="#bae6fd" stroke-width="1.6"/>
    ${evo === 'super_capacitor' ? '<circle cx="48" cy="38" r="9" fill="#fde047" stroke="#0f172a" stroke-width="2.2"/><circle cx="48" cy="38" r="4" fill="#ffffff"/>' : ''}
    ${evo === 'power_plant_10kw' ? '<rect x="35" y="13" width="26" height="8" rx="3" fill="#f59e0b" stroke="#0f172a" stroke-width="2"/>' : ''}
  `);
}

// ==================== VIENETŲ SVG (DRONAS + ROBOTAS-VEJAPJOVĖ) ====================

export function getUnitSvg(unitType, variant = 'default') {
  if (unitType === 'burrowed_mound') {
    return getEnemySvg('burrowed_mound');
  }

  if (unitType === 'drone_unit') {
    const accent = variant === 'scout_scanner' ? '#34d399' : variant === 'missile_drone' ? '#38bdf8' : '#2dd4bf';
    const wings = variant === 'missile_drone'
      ? '<rect x="34" y="18" width="22" height="7" rx="2" fill="#ef4444" stroke="#0f172a" stroke-width="2"/><rect x="34" y="71" width="22" height="7" rx="2" fill="#ef4444" stroke="#0f172a" stroke-width="2"/>'
      : '';
    return wrapSvg(`
      <!-- Ketursparnio rėmai -->
      <line x1="24" y1="24" x2="72" y2="72" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
      <line x1="24" y1="72" x2="72" y2="24" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
      ${wings}
      <!-- Aerodinamiškas korpusas į dešinę -->
      <polygon points="78,48 44,32 34,48 44,64" fill="#0f172a" stroke="${accent}" stroke-width="3.2" stroke-linejoin="round"/>
      <circle cx="54" cy="48" r="7" fill="${accent}"/>
      <circle cx="56" cy="48" r="2.8" fill="#ffffff"/>
      <!-- 4 variklių laikikliai -->
      <circle cx="24" cy="24" r="6" fill="#334155" stroke="${accent}" stroke-width="2"/>
      <circle cx="72" cy="24" r="6" fill="#334155" stroke="${accent}" stroke-width="2"/>
      <circle cx="24" cy="72" r="6" fill="#334155" stroke="${accent}" stroke-width="2"/>
      <circle cx="72" cy="72" r="6" fill="#334155" stroke="${accent}" stroke-width="2"/>
    `);
  }

  // mower_unit
  const shell = variant === 'electro_mowers' ? '#eab308' : variant === 'armored_guards' ? '#22c55e' : '#4ade80';
  const shieldFront = variant === 'armored_guards'
    ? '<path d="M74 30 L85 48 L74 66 Z" fill="#cbd5e1" stroke="#0f172a" stroke-width="2.5"/>'
    : '';
  const coil = variant === 'electro_mowers'
    ? '<circle cx="44" cy="48" r="8" fill="#fef08a" stroke="#0f172a" stroke-width="2"/>'
    : '';
  return wrapSvg(`
    <!-- Ratai -->
    <rect x="24" y="21" width="18" height="9" rx="3" fill="#0f172a"/>
    <rect x="24" y="66" width="18" height="9" rx="3" fill="#0f172a"/>
    <rect x="52" y="21" width="18" height="9" rx="3" fill="#0f172a"/>
    <rect x="52" y="66" width="18" height="9" rx="3" fill="#0f172a"/>
    <!-- Robotuko-vejapjovės korpusas -->
    <rect x="20" y="27" width="54" height="42" rx="14" fill="${shell}" stroke="#0f172a" stroke-width="3.2"/>
    <rect x="30" y="34" width="24" height="28" rx="6" fill="#14532d" opacity="0.6"/>
    ${shieldFront}
    ${coil}
    <!-- LED akys priekyje -->
    <circle cx="64" cy="41" r="4" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.6"/>
    <circle cx="64" cy="55" r="4" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.6"/>
  `);
}

export function getEnemySvg(enemyId) {
  const fn = ENEMY_SVG_BUILDERS[enemyId];
  return fn ? fn() : ENEMY_SVG_BUILDERS.garden_slug();
}

export function hasEnemySprite(enemyId) {
  return Boolean(ENEMY_SVG_BUILDERS[enemyId]);
}

export function hasTowerSprite(towerType) {
  return TOWER_SPRITE_IDS.includes(towerType);
}

export function getEnemySpriteRecord(enemyId) {
  const id = ENEMY_SVG_BUILDERS[enemyId] ? enemyId : 'garden_slug';
  return getOrCreateSprite(`enemy:${id}`, () => getEnemySvg(id));
}

export function getTowerBaseSpriteRecord(towerType, level = 1, evolutionId = null) {
  const lvl = clamp(Number(level) || 1, 1, 4);
  const evo = lvl === 4 && evolutionId ? evolutionId : 'none';
  return getOrCreateSprite(`tower-base:${towerType}:L${lvl}:${evo}`, () =>
    getTowerBaseSvg(towerType, lvl, evolutionId)
  );
}

export function getTowerTurretSpriteRecord(towerType, level = 1, evolutionId = null) {
  const lvl = clamp(Number(level) || 1, 1, 4);
  const evo = lvl === 4 && evolutionId ? evolutionId : 'none';
  return getOrCreateSprite(`tower-turret:${towerType}:L${lvl}:${evo}`, () =>
    getTowerTurretSvg(towerType, lvl, evolutionId)
  );
}

export function getUnitSpriteRecord(unitType, variant = 'default') {
  return getOrCreateSprite(`unit:${unitType}:${variant}`, () => getUnitSvg(unitType, variant));
}

export function preloadAllSprites() {
  for (const id of [...ENEMY_SPRITE_IDS, ...BOSS_SPRITE_IDS, 'burrowed_mound']) {
    getEnemySpriteRecord(id);
  }
  for (const towerType of TOWER_SPRITE_IDS) {
    for (let lvl = 1; lvl <= 3; lvl += 1) {
      getTowerBaseSpriteRecord(towerType, lvl, null);
      getTowerTurretSpriteRecord(towerType, lvl, null);
    }
    const evos = TOWER_EVOLUTIONS_BY_TYPE[towerType] || [];
    for (const evoId of evos) {
      getTowerBaseSpriteRecord(towerType, 4, evoId);
      getTowerTurretSpriteRecord(towerType, 4, evoId);
    }
  }
  for (const v of ['default', 'scout_scanner', 'missile_drone']) {
    getUnitSpriteRecord('drone_unit', v);
  }
  for (const v of ['default', 'armored_guards', 'electro_mowers']) {
    getUnitSpriteRecord('mower_unit', v);
  }
  return getSpriteCacheStats();
}

export function getSpriteCacheStats() {
  let enemyCount = 0;
  let towerBaseCount = 0;
  let towerTurretCount = 0;
  let unitCount = 0;
  for (const key of spriteCache.keys()) {
    if (key.startsWith('enemy:')) enemyCount += 1;
    else if (key.startsWith('tower-base:')) towerBaseCount += 1;
    else if (key.startsWith('tower-turret:')) towerTurretCount += 1;
    else if (key.startsWith('unit:')) unitCount += 1;
  }
  return {
    totalCached: spriteCache.size,
    enemyCount,
    towerBaseCount,
    towerTurretCount,
    unitCount
  };
}

// ==================== ATSARGINIS DETALUS CANVAS PIEŠIMAS (NODE.JS / PRIEŠ DEKODAVIMĄ) ====================

function drawImageIfReady(ctx, record, drawW, drawH) {
  const img = record?.image;
  if (img && record.loaded && !record.error) {
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    return true;
  }
  return false;
}

function drawEnemyCanvasFallback(ctx, enemy, size) {
  const r = size * 0.34;
  ctx.fillStyle = enemy.color || '#84cc16';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = enemy.isBoss ? 3 : 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (enemy.isBoss) {
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.7);
    ctx.lineTo(-r * 0.4, -r * 1.25);
    ctx.lineTo(0, -r * 0.85);
    ctx.lineTo(r * 0.4, -r * 1.25);
    ctx.lineTo(r * 0.55, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(r * 0.45, -r * 0.2, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(r * 0.5, -r * 0.2, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
}

function drawAnimatedWings(ctx, enemy, size, animClock) {
  const flap = Math.sin(animClock * 24 + (enemy.uid || 0)) * (size * 0.28);
  ctx.save();
  ctx.fillStyle = enemy.type === 'cyber_raven' ? 'rgba(56, 189, 248, 0.55)' : 'rgba(224, 242, 254, 0.65)';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-size * 0.12, -size * 0.16 + flap * 0.45, size * 0.16, size * 0.28, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(size * 0.04, -size * 0.2 - flap * 0.45, size * 0.14, size * 0.25, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ==================== PAGRINDINĖS CANVAS PIEŠIMO FUNKCIJOS (RENDERER.JS INTEGRACIJA) ====================

export function drawEnemySprite(ctx, enemy, animClock = 0) {
  const isStunned = (enemy.stunTimer || 0) > 0;
  const uid = enemy.uid || 0;

  if (enemy.burrowTimer > 0) {
    const moundSize = Math.round((enemy.radius || 14) * 3.1);
    const moundRec = getEnemySpriteRecord('burrowed_mound');
    ctx.save();
    ctx.translate(enemy.x, enemy.y + 1);
    if (!drawImageIfReady(ctx, moundRec, moundSize, moundSize)) {
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 3, moundSize * 0.36, moundSize * 0.22, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // Šokinėjantys žemių grumsteliai
    for (let c = 0; c < 3; c += 1) {
      const cy = -4 - Math.abs(Math.sin(animClock * 12 + c * 1.7)) * 10;
      const cx = (c - 1) * 9 + Math.cos(animClock * 7 + c) * 2;
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  const baseScale = (enemy.radius || 13) * 3.1;
  const drawSize = Math.round(enemy.isBoss ? Math.max(70, baseScale * 1.15) : baseScale);
  const bobY = enemy.isFlying
    ? Math.sin(animClock * 6.5 + uid) * 3.5
    : isStunned
      ? 0
      : Math.abs(Math.sin(animClock * 9.5 + uid)) * -2.8;
  const drawY = enemy.y + bobY;

  ctx.save();
  if (enemy.isCamo && (enemy.camoRevealedTimer || 0) <= 0) {
    ctx.globalAlpha = 0.44;
  } else if (enemy.isCamo && (enemy.camoRevealedTimer || 0) > 0) {
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.85)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(enemy.x, drawY, drawSize * 0.44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.translate(enemy.x, drawY);

  // Kryptis pagal kelią: apverčiame horizontaliai jei juda į kairę, bet neišverčiame žemyn galva
  const ang = enemy.angle || 0;
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  const facingLeft = cos < -0.18;
  const tilt = clamp((facingLeft ? -sin : sin) * 0.35, -0.45, 0.45);
  const wobble = isStunned ? 0 : Math.sin(animClock * 10 + uid) * 0.06;
  const squashX = enemy.isFlying || isStunned ? 1 : 1 + Math.sin(animClock * 16 + uid) * 0.045;
  const squashY = 1 / squashX;

  ctx.rotate(tilt + wobble);
  ctx.scale((facingLeft ? -1 : 1) * squashX, squashY);

  if (enemy.isFlying) {
    drawAnimatedWings(ctx, enemy, drawSize, animClock);
  }

  const record = getEnemySpriteRecord(enemy.type || enemy.id || 'garden_slug');
  if (!drawImageIfReady(ctx, record, drawSize, drawSize)) {
    drawEnemyCanvasFallback(ctx, enemy, drawSize);
  }

  if (enemy.hitFlash > 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.arc(0, 0, drawSize * 0.34, 0, Math.PI * 2);
    ctx.fill();
  }

  if ((enemy.slowTimer || 0) > 0) {
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, drawSize * 0.39, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (enemy.maxShield > 0 && enemy.shield > 0) {
    const pulse = 0.42 + 0.25 * Math.sin(animClock * 6);
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulse.toFixed(2)})`;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, drawSize * 0.47, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // Apsvaiginimo žvaigždutės virš galvos
  if (isStunned) {
    ctx.save();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    for (let s = 0; s < 3; s += 1) {
      const sa = animClock * 7 + (s * Math.PI * 2) / 3;
      ctx.fillText('✦', enemy.x + Math.cos(sa) * 14, drawY - drawSize * 0.38 + Math.sin(sa) * 4);
    }
    ctx.restore();
  }
}

export function drawTowerBaseSprite(ctx, tower, animClock = 0, isSelected = false) {
  const lvl = clamp(tower.level || 1, 1, 4);
  const drawSize = 58 + (lvl >= 3 ? 4 : 0) + (lvl === 4 ? 4 : 0);
  const record = getTowerBaseSpriteRecord(tower.type, lvl, tower.evolutionId);

  ctx.save();
  if (isSelected) {
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, drawSize * 0.44, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.translate(tower.x, tower.y);
  if (!drawImageIfReady(ctx, record, drawSize, drawSize)) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = isSelected ? '#fde047' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, drawSize * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function drawTowerTurretSprite(ctx, tower, animClock = 0) {
  const lvl = clamp(tower.level || 1, 1, 4);
  const drawSize = 56 + (lvl >= 3 ? 4 : 0) + (lvl === 4 ? 4 : 0);
  const recoil = tower.recoilOffset || 0;
  const record = getTowerTurretSpriteRecord(tower.type, lvl, tower.evolutionId);
  const isStationary = tower.type === 'solar_station' || tower.type === 'mower_barracks';

  ctx.save();
  ctx.translate(tower.x, tower.y);

  if (!isStationary) {
    ctx.rotate(tower.angle || 0);
    ctx.translate(-recoil, 0);
  }

  if (!drawImageIfReady(ctx, record, drawSize, drawSize)) {
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (!isStationary) {
      ctx.fillRect(6, -3.5, 16, 7);
    }
  }

  // Gyvas saulės blyksnis ant Saulės Stoties panelių
  if (tower.type === 'solar_station') {
    const sheen = 0.14 + 0.16 * Math.sin(animClock * 2.8);
    ctx.fillStyle = `rgba(254, 240, 138, ${sheen.toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(-4, -5, 10, 4, -0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Šūvio žybsnis (muzzle flash)
  if (!isStationary && recoil > 1.4) {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(drawSize * 0.38, 0, Math.min(7, recoil * 1.1), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawDroneUnitSprite(ctx, drone, tower, animClock = 0) {
  const variant = tower?.evolutionId === 'scout_scanner'
    ? 'scout_scanner'
    : tower?.evolutionId === 'missile_drone'
      ? 'missile_drone'
      : 'default';
  const record = getUnitSpriteRecord('drone_unit', variant);
  const drawSize = 30;
  const coneColor = variant === 'scout_scanner'
    ? 'rgba(52, 211, 153, 0.35)'
    : variant === 'missile_drone'
      ? 'rgba(56, 189, 248, 0.32)'
      : 'rgba(45, 212, 191, 0.32)';

  ctx.save();
  ctx.translate(drone.x, drone.y);
  ctx.rotate(drone.angle || 0);
  if (drone.recoilOffset) {
    ctx.translate(-drone.recoilOffset, 0);
  }

  // Priekinis šviesos kūgis
  const coneGrad = ctx.createLinearGradient(6, 0, 56, 0);
  coneGrad.addColorStop(0, coneColor);
  coneGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(56, -18);
  ctx.lineTo(56, 18);
  ctx.closePath();
  ctx.fill();

  if (!drawImageIfReady(ctx, record, drawSize, drawSize)) {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(-7, -7);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-7, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 4 besisukantys propeleriai
  const rotors = [
    { rx: 6, ry: -7 },
    { rx: 6, ry: 7 },
    { rx: -6, ry: -7 },
    { rx: -6, ry: 7 }
  ];
  rotors.forEach((rot, idx) => {
    const spin = animClock * 28 + idx * 0.8;
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(rot.rx + Math.cos(spin) * 5.5, rot.ry + Math.sin(spin) * 5.5);
    ctx.lineTo(rot.rx - Math.cos(spin) * 5.5, rot.ry - Math.sin(spin) * 5.5);
    ctx.stroke();
  });

  ctx.restore();
}

export function drawMowerUnitSprite(ctx, unit, tower, animClock = 0) {
  const variant = tower?.evolutionId === 'armored_guards'
    ? 'armored_guards'
    : tower?.evolutionId === 'electro_mowers'
      ? 'electro_mowers'
      : 'default';
  const record = getUnitSpriteRecord('mower_unit', variant);
  const drawSize = 27;

  ctx.save();
  ctx.translate(unit.x, unit.y);
  const bob = unit.stunTimer > 0 ? 0 : Math.sin(animClock * 16 + (unit.x || 0)) * 0.9;
  ctx.translate(0, bob);

  if (!drawImageIfReady(ctx, record, drawSize, drawSize)) {
    ctx.fillStyle = variant === 'electro_mowers' ? '#eab308' : '#4ade80';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (unit.stunTimer > 0) {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💫', 0, -14);
  }
  ctx.restore();
}

preloadAllSprites();
