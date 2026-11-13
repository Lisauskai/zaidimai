// ==================== MANO ROBOTO DIRBTUVĖS (PROGRESO IR KONSTRAVIMO SISTEMA) ====================

export const ROBOT_COLOR_PALETTE = [
  { id: 'blue', name: 'Mėlyna', fill: '#38bdf8', dark: '#0284c7', glow: '#7dd3fc' },
  { id: 'green', name: 'Žalia', fill: '#4ade80', dark: '#16a34a', glow: '#86efac' },
  { id: 'orange', name: 'Oranžinė', fill: '#fb923c', dark: '#ea580c', glow: '#fdba74' },
  { id: 'purple', name: 'Violetinė', fill: '#c084fc', dark: '#9333ea', glow: '#e9d5ff' }
];

export const ROBOT_PARTS = [
  { id: 'legs', name: 'Kojos ir vikšrai', threshold: 5, icon: '🦿' },
  { id: 'body', name: 'Šarvuotas korpusas', threshold: 10, icon: '🛡️' },
  { id: 'head', name: 'Galva su šviečiančiu ekranu', threshold: 15, icon: '🤖' },
  { id: 'laserArm', name: 'Lazerinė ranka', threshold: 20, icon: '🔫' },
  { id: 'magnetArm', name: 'Magnetinis griebtuvas', threshold: 25, icon: '🧲' },
  { id: 'jetpack', name: 'Reaktyvinė kuprinė (Jetpack)', threshold: 35, icon: '🚀' },
  { id: 'antenna', name: 'Kosminė antena', threshold: 45, icon: '📡' },
  { id: 'shield', name: 'Auksinis energijos skydas', threshold: 60, icon: '🌟' }
];

export function createDefaultRobotColors() {
  const map = {};
  ROBOT_PARTS.forEach((p) => {
    map[p.id] = 'blue';
  });
  return map;
}

export function normalizeRobotColors(raw) {
  const def = createDefaultRobotColors();
  const validIds = new Set(ROBOT_COLOR_PALETTE.map((c) => c.id));
  if (!raw || typeof raw !== 'object') return def;
  ROBOT_PARTS.forEach((p) => {
    if (validIds.has(raw[p.id])) {
      def[p.id] = raw[p.id];
    }
  });
  return def;
}

export function getColorTheme(colorId) {
  return ROBOT_COLOR_PALETTE.find((c) => c.id === colorId) || ROBOT_COLOR_PALETTE[0];
}

export function cycleRobotPartColor(robotColors, partId) {
  const cur = robotColors[partId] || 'blue';
  const idx = ROBOT_COLOR_PALETTE.findIndex((c) => c.id === cur);
  const next = ROBOT_COLOR_PALETTE[(idx + 1) % ROBOT_COLOR_PALETTE.length];
  robotColors[partId] = next.id;
  return next;
}

export function getUnlockedPartIds(totalCrystals) {
  return ROBOT_PARTS.filter((p) => totalCrystals >= p.threshold).map((p) => p.id);
}

/**
 * Sugeneruoja interaktyvų SVG kosminio roboto brėžinį.
 * Atrakintos detalės piešiamos ryškiomis pasirinktomis spalvomis su `data-part="<id>"`.
 */
export function renderRobotWorkshopSvg(totalCrystals, robotColors = {}) {
  const unlocked = new Set(getUnlockedPartIds(totalCrystals));
  const cOf = (id) => getColorTheme(robotColors[id]);

  const partAttr = (id) =>
    unlocked.has(id)
      ? `class="robot-part unlocked" data-part="${id}"`
      : `class="robot-part locked" data-locked-part="${id}"`;

  // 1. Brėžinio punktyrinis siluetas visoms 8 dalims (kad matytųsi ko trūksta)
  const blueprintSilhouettes = `
    <g class="robot-blueprint-ghost" fill="none" stroke="#1e4068" stroke-width="2" stroke-dasharray="5 4">
      <rect x="86" y="182" width="168" height="92" rx="14" />
      <rect x="108" y="325" width="46" height="32" rx="12" />
      <rect x="186" y="325" width="46" height="32" rx="12" />
      <rect x="110" y="164" width="120" height="114" rx="18" />
      <rect x="120" y="88" width="100" height="72" rx="18" />
      <rect x="44" y="182" width="60" height="24" rx="8" />
      <rect x="236" y="182" width="60" height="24" rx="8" />
      <line x1="170" y1="36" x2="170" y2="88" />
      <ellipse cx="170" cy="206" rx="148" ry="178" />
    </g>
  `;

  // 2. Reaktyvinė kuprinė (už nugaros)
  let jetpackSvg = '';
  if (unlocked.has('jetpack')) {
    const col = cOf('jetpack');
    jetpackSvg = `
      <g ${partAttr('jetpack')}>
        <title>Reaktyvinė kuprinė – spausk spalvai pakeisti</title>
        <rect x="78" y="178" width="36" height="86" rx="12" fill="${col.dark}" stroke="#020617" stroke-width="3.5" />
        <rect x="226" y="178" width="36" height="86" rx="12" fill="${col.dark}" stroke="#020617" stroke-width="3.5" />
        <rect x="84" y="190" width="24" height="44" rx="6" fill="${col.fill}" />
        <rect x="232" y="190" width="24" height="44" rx="6" fill="${col.fill}" />
        <!-- Liepsnos -->
        <polygon points="86,264 106,264 96,298" fill="#fbbf24" />
        <polygon points="90,264 102,264 96,286" fill="#fef08a" />
        <polygon points="234,264 254,264 244,298" fill="#fbbf24" />
        <polygon points="238,264 250,264 244,286" fill="#fef08a" />
      </g>
    `;
  }

  // 3. Kojos ir vikšrai
  let legsSvg = '';
  if (unlocked.has('legs')) {
    const col = cOf('legs');
    legsSvg = `
      <g ${partAttr('legs')}>
        <title>Kojos ir vikšrai – spausk spalvai pakeisti</title>
        <rect x="122" y="274" width="26" height="54" rx="6" fill="${col.dark}" stroke="#020617" stroke-width="3.5" />
        <rect x="192" y="274" width="26" height="54" rx="6" fill="${col.dark}" stroke="#020617" stroke-width="3.5" />
        <!-- Vikšrai -->
        <rect x="100" y="322" width="66" height="36" rx="18" fill="${col.fill}" stroke="#020617" stroke-width="4" />
        <rect x="174" y="322" width="66" height="36" rx="18" fill="${col.fill}" stroke="#020617" stroke-width="4" />
        <circle cx="118" cy="340" r="8" fill="#0f172a" stroke="${col.glow}" stroke-width="2" />
        <circle cx="148" cy="340" r="8" fill="#0f172a" stroke="${col.glow}" stroke-width="2" />
        <circle cx="192" cy="340" r="8" fill="#0f172a" stroke="${col.glow}" stroke-width="2" />
        <circle cx="222" cy="340" r="8" fill="#0f172a" stroke="${col.glow}" stroke-width="2" />
      </g>
    `;
  }

  // 4. Lazerinė ranka (kairė pusė)
  let laserArmSvg = '';
  if (unlocked.has('laserArm')) {
    const col = cOf('laserArm');
    laserArmSvg = `
      <g ${partAttr('laserArm')}>
        <title>Lazerinė ranka – spausk spalvai pakeisti</title>
        <rect x="64" y="182" width="50" height="24" rx="10" fill="${col.dark}" stroke="#020617" stroke-width="3.5" />
        <rect x="30" y="176" width="44" height="36" rx="10" fill="${col.fill}" stroke="#020617" stroke-width="3.5" />
        <circle cx="30" cy="194" r="9" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
        <line x1="6" y1="194" x2="22" y2="194" stroke="#67e8f9" stroke-width="4" stroke-linecap="round" />
      </g>
    `;
  }

  // 5. Magnetinis griebtuvas (dešinė pusė)
  let magnetArmSvg = '';
  if (unlocked.has('magnetArm')) {
    const col = cOf('magnetArm');
    magnetArmSvg = `
      <g ${partAttr('magnetArm')}>
        <title>Magnetinis griebtuvas – spausk spalvai pakeisti</title>
        <rect x="226" y="182" width="50" height="24" rx="10" fill="${col.dark}" stroke="#020617" stroke-width="3.5" />
        <path d="M274,174 L298,174 A18,18 0 0,1 298,214 L274,214" fill="none" stroke="${col.fill}" stroke-width="12" stroke-linecap="round" />
        <path d="M274,174 L298,174 A18,18 0 0,1 298,214 L274,214" fill="none" stroke="#020617" stroke-width="3" stroke-linecap="round" />
        <rect x="268" y="168" width="12" height="12" rx="3" fill="#e2e8f0" stroke="#020617" stroke-width="2" />
        <rect x="268" y="208" width="12" height="12" rx="3" fill="#ef4444" stroke="#020617" stroke-width="2" />
      </g>
    `;
  }

  // 6. Šarvuotas korpusas
  let bodySvg = '';
  if (unlocked.has('body')) {
    const col = cOf('body');
    bodySvg = `
      <g ${partAttr('body')}>
        <title>Šarvuotas korpusas – spausk spalvai pakeisti</title>
        <rect x="110" y="164" width="120" height="114" rx="20" fill="${col.fill}" stroke="#020617" stroke-width="4" />
        <rect x="122" y="176" width="96" height="90" rx="14" fill="${col.dark}" />
        <!-- Energijos reaktorius krūtinėje -->
        <circle cx="170" cy="218" r="24" fill="#0f172a" stroke="${col.glow}" stroke-width="3.5" />
        <circle cx="170" cy="218" r="13" fill="#67e8f9" />
        <circle cx="170" cy="218" r="6" fill="#ffffff" />
        <!-- Kniedės -->
        <circle cx="132" cy="186" r="3.5" fill="${col.glow}" />
        <circle cx="208" cy="186" r="3.5" fill="${col.glow}" />
        <circle cx="132" cy="254" r="3.5" fill="${col.glow}" />
        <circle cx="208" cy="254" r="3.5" fill="${col.glow}" />
      </g>
    `;
  }

  // 7. Kosminė antena
  let antennaSvg = '';
  if (unlocked.has('antenna')) {
    const col = cOf('antenna');
    antennaSvg = `
      <g ${partAttr('antenna')}>
        <title>Kosminė antena – spausk spalvai pakeisti</title>
        <rect x="164" y="42" width="12" height="48" rx="5" fill="${col.dark}" stroke="#020617" stroke-width="3" />
        <circle cx="170" cy="36" r="12" fill="${col.fill}" stroke="#020617" stroke-width="3" />
        <path d="M148,26 Q170,8 192,26" fill="none" stroke="${col.glow}" stroke-width="3.5" stroke-linecap="round" />
        <path d="M138,18 Q170,-4 202,18" fill="none" stroke="${col.glow}" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
      </g>
    `;
  }

  // 8. Galva su šviečiančiu ekranu
  let headSvg = '';
  if (unlocked.has('head')) {
    const col = cOf('head');
    headSvg = `
      <g ${partAttr('head')}>
        <title>Galva su šviečiančiu ekranu – spausk spalvai pakeisti</title>
        <rect x="118" y="86" width="104" height="76" rx="22" fill="${col.fill}" stroke="#020617" stroke-width="4" />
        <rect x="132" y="102" width="76" height="44" rx="12" fill="#020617" stroke="${col.glow}" stroke-width="2.5" />
        <!-- Šviečiančios akys ir šypsena -->
        <circle cx="152" cy="121" r="8" fill="#22d3ee" />
        <circle cx="188" cy="121" r="8" fill="#22d3ee" />
        <circle cx="150" cy="119" r="3" fill="#ffffff" />
        <circle cx="186" cy="119" r="3" fill="#ffffff" />
        <path d="M156,136 Q170,143 184,136" fill="none" stroke="#4ade80" stroke-width="3.5" stroke-linecap="round" />
      </g>
    `;
  }

  // 9. Auksinis energijos skydas
  let shieldSvg = '';
  if (unlocked.has('shield')) {
    const col = cOf('shield');
    shieldSvg = `
      <g class="robot-shield-aura" pointer-events="none">
        <ellipse cx="170" cy="206" rx="154" ry="182" fill="rgba(250, 204, 21, 0.08)" stroke="#facc15" stroke-width="4" stroke-dasharray="14 7" />
        <ellipse cx="170" cy="206" rx="146" ry="174" fill="none" stroke="${col.glow}" stroke-width="2" opacity="0.7" />
      </g>
      <g ${partAttr('shield')}>
        <title>Auksinis energijos skydas – spausk spalvai pakeisti</title>
        <polygon points="170,362 192,374 186,396 154,396 148,374" fill="${col.fill}" stroke="#facc15" stroke-width="3.5" />
        <text x="170" y="387" text-anchor="middle" font-size="15" font-weight="900" fill="#020617">★</text>
      </g>
    `;
  }

  return `
    <svg id="robot-blueprint-svg" class="robot-blueprint-svg" viewBox="0 0 340 404" role="img" aria-label="Kosminis robotas">
      <defs>
        <pattern id="robot-grid-pat" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.1)" stroke-width="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="340" height="404" rx="16" fill="#020617" />
      <rect x="0" y="0" width="340" height="404" rx="16" fill="url(#robot-grid-pat)" />
      ${blueprintSilhouettes}
      ${jetpackSvg}
      ${legsSvg}
      ${laserArmSvg}
      ${magnetArmSvg}
      ${bodySvg}
      ${antennaSvg}
      ${headSvg}
      ${shieldSvg}
    </svg>
  `;
}
