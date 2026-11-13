// ==================== RAŠTŲ IR ATMINTIES ŠIFRAS (IQ MATRICOS IR ATMINTIS) ====================

export const MATRIX_COLORS = {
  cyan: '#22d3ee',
  yellow: '#fde047',
  magenta: '#e879f9',
  green: '#4ade80',
  orange: '#fb923c',
  white: '#f8fafc',
  dark: '#0f172a'
};

/**
 * Sugeneruoja ryškų SVG pagal figūros aprašymą:
 * { shape, color, rot, count, size, dotColor }
 */
let matrixSvgCounter = 0;

export function renderShapeSvg(spec) {
  if (!spec) return '';
  const uid = `m${++matrixSvgCounter}`;
  const shape = spec.shape || 'circle';
  const fill = MATRIX_COLORS[spec.color] || spec.color || '#22d3ee';
  const rot = Number(spec.rot) || 0;
  const count = Number(spec.count) || 1;
  const size = spec.size || 'md'; // 'sm' | 'md' | 'lg'
  const dotColor = spec.dotColor ? (MATRIX_COLORS[spec.dotColor] || spec.dotColor) : null;
  const innerDots = Number(spec.innerDots) || 0;

  const scaleMap = { sm: 0.56, md: 0.82, lg: 1.06 };
  const scale = count > 1 ? 0.44 : (scaleMap[size] || 0.85);
  const gradUrl = `url(#${uid}_g)`;
  const filtUrl = `url(#${uid}_s)`;

  const drawSingle = (cx, cy, sc) => {
    const r = 24 * sc;
    let body = '';
    if (shape === 'circle') {
      body = `<circle cx="0" cy="0" r="${r}" fill="${gradUrl}" stroke="#020617" stroke-width="2.6" />
              <path d="M ${-r * 0.55} ${-r * 0.35} A ${r * 0.72} ${r * 0.72} 0 0 1 ${r * 0.42} ${-r * 0.55}" fill="none" stroke="rgba(255,255,255,0.48)" stroke-width="${Math.max(1.4, 2.2 * sc)}" stroke-linecap="round" />`;
    } else if (shape === 'square') {
      body = `<rect x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" rx="${5 * sc}" fill="${gradUrl}" stroke="#020617" stroke-width="2.6" />
              <line x1="${-r * 0.68}" y1="${-r * 0.68}" x2="${r * 0.68}" y2="${-r * 0.68}" stroke="rgba(255,255,255,0.45)" stroke-width="${Math.max(1.4, 2 * sc)}" stroke-linecap="round" />`;
    } else if (shape === 'diamond') {
      const d = r * 1.15;
      body = `<polygon points="0,${-d} ${d},0 0,${d} ${-d},0" fill="${gradUrl}" stroke="#020617" stroke-width="2.6" stroke-linejoin="round" />
              <polygon points="0,${-d * 0.88} ${d * 0.55},0 0,0 ${-d * 0.55},0" fill="rgba(255,255,255,0.22)" />`;
    } else if (shape === 'triangle') {
      const h = r * 1.15;
      body = `<polygon points="0,${-h} ${h},${h * 0.85} ${-h},${h * 0.85}" fill="${gradUrl}" stroke="#020617" stroke-width="2.6" stroke-linejoin="round" />
              <polygon points="0,${-h * 0.86} 0,${h * 0.72} ${-h * 0.82},${h * 0.72}" fill="rgba(255,255,255,0.18)" />`;
    } else if (shape === 'arrow') {
      // Kryptinė rodyklė į dešinę prie rot = 0°
      const w = r * 1.15;
      body = `<polygon points="${-w},${-w * 0.45} ${w * 0.1},${-w * 0.45} ${w * 0.1},${-w * 0.9} ${w},0 ${w * 0.1},${w * 0.9} ${w * 0.1},${w * 0.45} ${-w},${w * 0.45}" fill="${gradUrl}" stroke="#020617" stroke-width="2.6" stroke-linejoin="round" />`;
    } else if (shape === 'star') {
      const outer = r * 1.15;
      const inner = outer * 0.46;
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rad = i % 2 === 0 ? outer : inner;
        pts.push(`${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`);
      }
      body = `<polygon points="${pts.join(' ')}" fill="${gradUrl}" stroke="#020617" stroke-width="2.6" stroke-linejoin="round" />`;
    }

    let overlay = '';
    if (dotColor) {
      const dr = Math.max(5, r * 0.34);
      overlay += `<circle cx="0" cy="0" r="${dr}" fill="${dotColor}" stroke="#020617" stroke-width="2" />`;
    }
    if (innerDots > 0) {
      const offsets =
        innerDots === 1
          ? [[0, 0]]
          : innerDots === 2
            ? [[-7 * sc, 0], [7 * sc, 0]]
            : [[-8 * sc, 5 * sc], [8 * sc, 5 * sc], [0, -7 * sc]];
      offsets.forEach(([dx, dy]) => {
        overlay += `<circle cx="${dx}" cy="${dy}" r="${4.2 * sc}" fill="#020617" stroke="rgba(255,255,255,0.4)" stroke-width="0.9" />`;
      });
    }

    return `<g transform="translate(${cx}, ${cy}) rotate(${rot})" filter="${filtUrl}">${body}${overlay}</g>`;
  };

  let innerSvg = '';
  if (count === 1) {
    innerSvg = drawSingle(40, 40, scale);
  } else if (count === 2) {
    innerSvg = drawSingle(25, 40, scale) + drawSingle(55, 40, scale);
  } else {
    innerSvg = drawSingle(40, 23, scale) + drawSingle(23, 54, scale) + drawSingle(57, 54, scale);
  }

  return `<svg class="matrix-svg" viewBox="0 0 80 80" aria-hidden="true">
    <defs>
      <radialGradient id="${uid}_g" cx="32%" cy="28%" r="78%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="28%" stop-color="${fill}" />
        <stop offset="100%" stop-color="${fill}" stop-opacity="0.72" />
      </radialGradient>
      <filter id="${uid}_s" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" flood-color="#020617" flood-opacity="0.65" />
      </filter>
    </defs>
    ${innerSvg}
  </svg>`;
}

export const MATRIX_LEVELS = {
  grade1: [
    {
      id: 'mat_g1_1',
      kind: 'matrix',
      title: '1. Forma ir spalva',
      instruction: 'Keičiasi DU požymiai: kiekvienoje eilutėje ir stulpelyje yra 3 skirtingos formos IR 3 skirtingos spalvos!',
      reward: 1,
      grid: [
        { shape: 'circle', color: 'cyan' }, { shape: 'square', color: 'yellow' }, { shape: 'triangle', color: 'magenta' },
        { shape: 'square', color: 'magenta' }, { shape: 'triangle', color: 'cyan' }, { shape: 'circle', color: 'yellow' },
        { shape: 'triangle', color: 'yellow' }, { shape: 'circle', color: 'magenta' }, null
      ],
      choices: [
        { shape: 'square', color: 'cyan' },
        { shape: 'circle', color: 'yellow' },
        { shape: 'triangle', color: 'cyan' },
        { shape: 'square', color: 'yellow' }
      ],
      correctIndex: 0
    },
    {
      id: 'mat_g1_2',
      kind: 'matrix',
      title: '2. Forma ir taškelių kiekis',
      instruction: 'Taškelių viduje daugėja (1 → 2 → 3), o formos nesikartoja! Pasirink figūrą ir spausk „Patikrinti“.',
      reward: 2,
      grid: [
        { shape: 'square', color: 'cyan', innerDots: 1 }, { shape: 'circle', color: 'cyan', innerDots: 2 }, { shape: 'diamond', color: 'cyan', innerDots: 3 },
        { shape: 'circle', color: 'cyan', innerDots: 1 }, { shape: 'diamond', color: 'cyan', innerDots: 2 }, { shape: 'square', color: 'cyan', innerDots: 3 },
        { shape: 'diamond', color: 'cyan', innerDots: 1 }, { shape: 'square', color: 'cyan', innerDots: 2 }, null
      ],
      choices: [
        { shape: 'circle', color: 'cyan', innerDots: 2 },
        { shape: 'circle', color: 'cyan', innerDots: 3 },
        { shape: 'square', color: 'cyan', innerDots: 3 },
        { shape: 'diamond', color: 'cyan', innerDots: 3 }
      ],
      correctIndex: 1
    },
    {
      id: 'mat_g1_3',
      kind: 'matrix',
      title: '3. Dydis ir figūra',
      instruction: 'Iš kairės į dešinę figūros auga (maža → vidutinė → didelė) ir kartu keičiasi jų forma!',
      reward: 2,
      grid: [
        { shape: 'circle', color: 'green', size: 'sm' }, { shape: 'triangle', color: 'green', size: 'md' }, { shape: 'star', color: 'green', size: 'lg' },
        { shape: 'triangle', color: 'green', size: 'sm' }, { shape: 'star', color: 'green', size: 'md' }, { shape: 'circle', color: 'green', size: 'lg' },
        { shape: 'star', color: 'green', size: 'sm' }, { shape: 'circle', color: 'green', size: 'md' }, null
      ],
      choices: [
        { shape: 'triangle', color: 'green', size: 'md' },
        { shape: 'star', color: 'green', size: 'lg' },
        { shape: 'triangle', color: 'green', size: 'lg' },
        { shape: 'circle', color: 'green', size: 'lg' }
      ],
      correctIndex: 2
    },
    {
      id: 'mat_g1_4',
      kind: 'matrix',
      title: '4. Rodyklės posūkis ir spalva',
      instruction: 'Rodyklė kas žingsnį pasisuka 90° pagal laikrodžio rodyklę ir kartu keičia spalvą!',
      reward: 2,
      grid: [
        { shape: 'arrow', color: 'cyan', rot: 0 }, { shape: 'arrow', color: 'yellow', rot: 90 }, { shape: 'arrow', color: 'orange', rot: 180 },
        { shape: 'arrow', color: 'orange', rot: 90 }, { shape: 'arrow', color: 'cyan', rot: 180 }, { shape: 'arrow', color: 'yellow', rot: 270 },
        { shape: 'arrow', color: 'yellow', rot: 180 }, { shape: 'arrow', color: 'orange', rot: 270 }, null
      ],
      choices: [
        { shape: 'arrow', color: 'cyan', rot: 0 },
        { shape: 'arrow', color: 'cyan', rot: 90 },
        { shape: 'arrow', color: 'yellow', rot: 0 },
        { shape: 'arrow', color: 'orange', rot: 0 }
      ],
      correctIndex: 0
    },
    {
      id: 'mat_g1_5',
      kind: 'matrix',
      title: '5. Dvigubas žvaigždžių ir taškų šifras',
      instruction: 'Paskutinė 1 klasės matrica! Suderink teisingą figūrą, jos spalvą ir taškelių kiekį viduje.',
      reward: 3,
      grid: [
        { shape: 'circle', color: 'cyan', innerDots: 1 }, { shape: 'square', color: 'yellow', innerDots: 2 }, { shape: 'triangle', color: 'magenta', innerDots: 3 },
        { shape: 'square', color: 'magenta', innerDots: 2 }, { shape: 'triangle', color: 'cyan', innerDots: 3 }, { shape: 'circle', color: 'yellow', innerDots: 1 },
        { shape: 'triangle', color: 'yellow', innerDots: 3 }, { shape: 'circle', color: 'magenta', innerDots: 1 }, null
      ],
      choices: [
        { shape: 'square', color: 'yellow', innerDots: 2 },
        { shape: 'square', color: 'cyan', innerDots: 3 },
        { shape: 'square', color: 'cyan', innerDots: 2 },
        { shape: 'triangle', color: 'cyan', innerDots: 2 }
      ],
      correctIndex: 2
    },
    {
      id: 'mat_g1_6',
      kind: 'memory',
      title: '6. Atminties kodas (4 žingsniai)',
      instruction: 'Įsimink 4 švytinčius langelius iš eilės ir tiksliai juos pakartok!',
      reward: 2,
      gridSize: 3,
      durationMs: 3000,
      sequence: [0, 3, 4, 7]
    },
    {
      id: 'mat_g1_7',
      kind: 'matrix',
      title: '7. Kiekis ir spalva',
      instruction: 'Eilutėje keičiasi spalva bei kiekis (1, 2, 3). Kokia figūra užbaigs žvaigždučių eilutę?',
      reward: 2,
      grid: [
        { shape: 'circle', color: 'cyan', count: 1 },
        { shape: 'circle', color: 'yellow', count: 2 },
        { shape: 'circle', color: 'green', count: 3 },

        { shape: 'square', color: 'cyan', count: 1 },
        { shape: 'square', color: 'yellow', count: 2 },
        { shape: 'square', color: 'green', count: 3 },

        { shape: 'star', color: 'cyan', count: 1 },
        { shape: 'star', color: 'yellow', count: 2 },
        null
      ],
      choices: [
        { shape: 'star', color: 'green', count: 2 },
        { shape: 'star', color: 'green', count: 3 },
        { shape: 'star', color: 'cyan', count: 3 },
        { shape: 'circle', color: 'green', count: 3 }
      ],
      correctIndex: 1
    },
    {
      id: 'mat_g1_8',
      kind: 'memory',
      title: '8. Žaibo kodas (4 žingsniai)',
      instruction: 'Stebėk įstrižainės šviesų seką ir pakartok ją iš atminties!',
      reward: 2,
      gridSize: 3,
      durationMs: 2800,
      sequence: [2, 4, 6, 8]
    },
    {
      id: 'mat_g1_9',
      kind: 'matrix',
      title: '9. Rodyklės posūkis ir spalva',
      instruction: 'Kiekviename žingsnyje rodyklė pasisuka 90° ir pasikeičia jos spalva. Kurį pasirinksi?',
      reward: 2,
      grid: [
        { shape: 'arrow', color: 'cyan', rot: 0 },
        { shape: 'arrow', color: 'yellow', rot: 90 },
        { shape: 'arrow', color: 'green', rot: 180 },

        { shape: 'arrow', color: 'yellow', rot: 90 },
        { shape: 'arrow', color: 'green', rot: 180 },
        { shape: 'arrow', color: 'cyan', rot: 270 },

        { shape: 'arrow', color: 'green', rot: 180 },
        { shape: 'arrow', color: 'cyan', rot: 270 },
        null
      ],
      choices: [
        { shape: 'arrow', color: 'yellow', rot: 0 },
        { shape: 'arrow', color: 'green', rot: 0 },
        { shape: 'arrow', color: 'yellow', rot: 90 },
        { shape: 'arrow', color: 'cyan', rot: 0 }
      ],
      correctIndex: 0
    },
    {
      id: 'mat_g1_10',
      kind: 'matrix',
      title: '10. Pirmoko raštų finalas',
      instruction: '1 klasės finalas! Stebėk formą, dydį ir spalvą kiekviename stulpelyje!',
      reward: 3,
      grid: [
        { shape: 'circle', color: 'cyan', size: 'sm' },
        { shape: 'circle', color: 'orange', size: 'md' },
        { shape: 'circle', color: 'green', size: 'lg' },

        { shape: 'square', color: 'cyan', size: 'sm' },
        { shape: 'square', color: 'orange', size: 'md' },
        { shape: 'square', color: 'green', size: 'lg' },

        { shape: 'star', color: 'cyan', size: 'sm' },
        { shape: 'star', color: 'orange', size: 'md' },
        null
      ],
      choices: [
        { shape: 'star', color: 'green', size: 'md' },
        { shape: 'star', color: 'orange', size: 'lg' },
        { shape: 'star', color: 'green', size: 'lg' },
        { shape: 'square', color: 'green', size: 'lg' }
      ],
      correctIndex: 2
    }
  ],
  grade3: [
    {
      id: 'mat_g3_1',
      kind: 'matrix',
      title: '1. Sukimas + vidinis taškas',
      instruction: 'Rodyklė sukasi 90° kampu, o kartu keičiasi vidinio taško spalva! Rask tikslią figūrą.',
      reward: 1,
      grid: [
        { shape: 'arrow', color: 'cyan', rot: 0, dotColor: 'yellow' },
        { shape: 'arrow', color: 'cyan', rot: 90, dotColor: 'magenta' },
        { shape: 'arrow', color: 'cyan', rot: 180, dotColor: 'green' },

        { shape: 'arrow', color: 'cyan', rot: 90, dotColor: 'magenta' },
        { shape: 'arrow', color: 'cyan', rot: 180, dotColor: 'green' },
        { shape: 'arrow', color: 'cyan', rot: 270, dotColor: 'yellow' },

        { shape: 'arrow', color: 'cyan', rot: 180, dotColor: 'green' },
        { shape: 'arrow', color: 'cyan', rot: 270, dotColor: 'yellow' },
        null
      ],
      choices: [
        { shape: 'arrow', color: 'cyan', rot: 0, dotColor: 'yellow' },
        { shape: 'arrow', color: 'cyan', rot: 90, dotColor: 'magenta' },
        { shape: 'arrow', color: 'cyan', rot: 0, dotColor: 'magenta' },
        { shape: 'arrow', color: 'cyan', rot: 270, dotColor: 'magenta' }
      ],
      correctIndex: 2
    },
    {
      id: 'mat_g3_2',
      kind: 'memory',
      title: '2. Atminties kodas #1 (4 žingsniai)',
      instruction: 'Įsimink 3 sekundes švytinčių langelių seką (1 → 4) ir tiksliai ją atkartok!',
      reward: 2,
      gridSize: 3,
      durationMs: 3000,
      sequence: [0, 4, 5, 7]
    },
    {
      id: 'mat_g3_3',
      kind: 'matrix',
      title: '3. Forma + taškų skaičius',
      instruction: 'Keičiasi du požymiai: išorinė figūra IR juodų taškelių skaičius viduje (1–3)!',
      reward: 2,
      grid: [
        { shape: 'circle', color: 'orange', innerDots: 1 },
        { shape: 'square', color: 'orange', innerDots: 2 },
        { shape: 'diamond', color: 'orange', innerDots: 3 },

        { shape: 'square', color: 'orange', innerDots: 2 },
        { shape: 'diamond', color: 'orange', innerDots: 3 },
        { shape: 'circle', color: 'orange', innerDots: 1 },

        { shape: 'diamond', color: 'orange', innerDots: 3 },
        { shape: 'circle', color: 'orange', innerDots: 1 },
        null
      ],
      choices: [
        { shape: 'square', color: 'orange', innerDots: 1 },
        { shape: 'diamond', color: 'orange', innerDots: 2 },
        { shape: 'square', color: 'orange', innerDots: 2 },
        { shape: 'square', color: 'orange', innerDots: 3 }
      ],
      correctIndex: 2
    },
    {
      id: 'mat_g3_4',
      kind: 'memory',
      title: '4. Atminties kodas #2 (5 žingsniai)',
      instruction: 'Dėmesio! 3 sekundes sužibs 5 langelių kodas – pakartok jį iš eilės!',
      reward: 2,
      gridSize: 3,
      durationMs: 3000,
      sequence: [2, 1, 4, 6, 8]
    },
    {
      id: 'mat_g3_5',
      kind: 'matrix',
      title: '5. Trikampio posūkis + spalva',
      instruction: 'Finalinis IQ iššūkis! Trikampis sukasi 90° kampu ir kartu keičia spalvą.',
      reward: 3,
      grid: [
        { shape: 'triangle', color: 'cyan', rot: 0 },
        { shape: 'triangle', color: 'yellow', rot: 90 },
        { shape: 'triangle', color: 'magenta', rot: 180 },

        { shape: 'triangle', color: 'yellow', rot: 90 },
        { shape: 'triangle', color: 'magenta', rot: 180 },
        { shape: 'triangle', color: 'cyan', rot: 270 },

        { shape: 'triangle', color: 'magenta', rot: 180 },
        { shape: 'triangle', color: 'cyan', rot: 270 },
        null
      ],
      choices: [
        { shape: 'triangle', color: 'yellow', rot: 0 },
        { shape: 'triangle', color: 'cyan', rot: 0 },
        { shape: 'triangle', color: 'yellow', rot: 90 },
        { shape: 'triangle', color: 'magenta', rot: 0 }
      ],
      correctIndex: 0
    },
    {
      id: 'mat_g3_6',
      kind: 'memory',
      title: '6. Atminties kodas #3 (5 žingsniai)',
      instruction: 'Įsimink greitą 5 žingsnių šviesų seką (per 2,6 sek.) ir tiksliai pakartok!',
      reward: 2,
      gridSize: 3,
      durationMs: 2600,
      sequence: [1, 5, 7, 3, 4]
    },
    {
      id: 'mat_g3_7',
      kind: 'matrix',
      title: '7. Rodyklė + taškų kodas',
      instruction: 'Rask trečiąją kombinaciją: kiekvienoje eilutėje turi būti 3 spalvos, 3 posūkiai ir 1–3 taškai!',
      reward: 2,
      grid: [
        { shape: 'arrow', color: 'cyan', rot: 0, innerDots: 1 },
        { shape: 'arrow', color: 'orange', rot: 90, innerDots: 2 },
        { shape: 'arrow', color: 'green', rot: 180, innerDots: 3 },

        { shape: 'arrow', color: 'orange', rot: 90, innerDots: 2 },
        { shape: 'arrow', color: 'green', rot: 180, innerDots: 3 },
        { shape: 'arrow', color: 'cyan', rot: 270, innerDots: 1 },

        { shape: 'arrow', color: 'green', rot: 180, innerDots: 3 },
        { shape: 'arrow', color: 'cyan', rot: 270, innerDots: 1 },
        null
      ],
      choices: [
        { shape: 'arrow', color: 'orange', rot: 0, innerDots: 1 },
        { shape: 'arrow', color: 'green', rot: 0, innerDots: 2 },
        { shape: 'arrow', color: 'orange', rot: 0, innerDots: 2 },
        { shape: 'arrow', color: 'orange', rot: 90, innerDots: 2 }
      ],
      correctIndex: 2
    },
    {
      id: 'mat_g3_8',
      kind: 'memory',
      title: '8. Kosminis šifras (6 žingsniai)',
      instruction: 'Net 6 langelių atminties kombinacija! Susikaupk ir atkartok visus žingsnius.',
      reward: 3,
      gridSize: 3,
      durationMs: 3200,
      sequence: [0, 2, 8, 6, 4, 1]
    },
    {
      id: 'mat_g3_9',
      kind: 'matrix',
      title: '9. Trys nepriklausomi požymiai',
      instruction: 'Keičiasi figūra, išorės spalva IR vidinis taškas! Išskirk kiekvieną taisyklę atskirai.',
      reward: 3,
      grid: [
        { shape: 'diamond', color: 'cyan', dotColor: 'yellow' },
        { shape: 'diamond', color: 'magenta', dotColor: 'white' },
        { shape: 'diamond', color: 'green', dotColor: 'orange' },

        { shape: 'triangle', color: 'magenta', dotColor: 'white' },
        { shape: 'triangle', color: 'green', dotColor: 'orange' },
        { shape: 'triangle', color: 'cyan', dotColor: 'yellow' },

        { shape: 'star', color: 'green', dotColor: 'orange' },
        { shape: 'star', color: 'cyan', dotColor: 'yellow' },
        null
      ],
      choices: [
        { shape: 'star', color: 'magenta', dotColor: 'orange' },
        { shape: 'star', color: 'magenta', dotColor: 'white' },
        { shape: 'star', color: 'green', dotColor: 'white' },
        { shape: 'triangle', color: 'magenta', dotColor: 'white' }
      ],
      correctIndex: 1
    },
    {
      id: 'mat_g3_10',
      kind: 'matrix',
      title: '10. Vyriausiojo šifruotojo finalas',
      instruction: '3 klasės finalas! Kiekvienoje eilutėje susiderina forma, dydis, spalva ir taškai (1–3).',
      reward: 3,
      grid: [
        { shape: 'square', color: 'cyan', size: 'sm', innerDots: 1 },
        { shape: 'diamond', color: 'yellow', size: 'md', innerDots: 2 },
        { shape: 'star', color: 'magenta', size: 'lg', innerDots: 3 },

        { shape: 'diamond', color: 'yellow', size: 'md', innerDots: 2 },
        { shape: 'star', color: 'magenta', size: 'lg', innerDots: 3 },
        { shape: 'square', color: 'cyan', size: 'sm', innerDots: 1 },

        { shape: 'star', color: 'magenta', size: 'lg', innerDots: 3 },
        { shape: 'square', color: 'cyan', size: 'sm', innerDots: 1 },
        null
      ],
      choices: [
        { shape: 'diamond', color: 'yellow', size: 'md', innerDots: 3 },
        { shape: 'diamond', color: 'magenta', size: 'md', innerDots: 2 },
        { shape: 'diamond', color: 'yellow', size: 'lg', innerDots: 2 },
        { shape: 'diamond', color: 'yellow', size: 'md', innerDots: 2 }
      ],
      correctIndex: 3
    }
  ]
};

export class MemoryCodeController {
  constructor(gridEl, level, callbacks = {}) {
    this.gridEl = gridEl;
    this.level = level;
    this.callbacks = callbacks;
    this.timers = [];
    this.phase = 'idle'; // 'showing' | 'input' | 'won' | 'failed'
    this.userInput = [];
    this.activeFlashIndex = -1;
    this.activeFlashStep = -1;
    this.hintCellIndex = null;

    this.renderBoard();
    this.startShowcase();
  }

  setHintCell(cellIdx) {
    this.hintCellIndex = typeof cellIdx === 'number' ? cellIdx : null;
    this.renderBoard();
  }

  clearTimers() {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers = [];
  }

  destroy() {
    this.clearTimers();
  }

  startShowcase() {
    this.clearTimers();
    this.phase = 'showing';
    this.userInput = [];
    this.activeFlashIndex = -1;
    this.activeFlashStep = -1;
    this.notify();
    this.renderBoard();

    const seq = this.level.sequence;
    const stepDuration = Math.floor((this.level.durationMs || 3000) / seq.length);

    seq.forEach((cellIdx, stepIdx) => {
      const tId = setTimeout(() => {
        this.activeFlashIndex = cellIdx;
        this.activeFlashStep = stepIdx + 1;
        this.renderBoard();
        this.callbacks.onFlash?.(stepIdx);
      }, stepIdx * stepDuration);
      this.timers.push(tId);
    });

    const endId = setTimeout(() => {
      this.activeFlashIndex = -1;
      this.activeFlashStep = -1;
      this.phase = 'input';
      this.notify();
      this.renderBoard();
    }, seq.length * stepDuration);
    this.timers.push(endId);
  }

  handleCellClick(cellIdx) {
    if (this.phase !== 'input') return;
    this.hintCellIndex = null;
    if (this.callbacks.onMove) this.callbacks.onMove();
    const expected = this.level.sequence[this.userInput.length];

    if (cellIdx === expected) {
      this.userInput.push(cellIdx);
      this.callbacks.onMatchedStep?.(this.userInput.length - 1);
      if (this.userInput.length === this.level.sequence.length) {
        this.phase = 'won';
        this.renderBoard();
        this.notify();
        const winId = setTimeout(() => {
          if (this.phase === 'won' && this.callbacks.onWin) {
            this.callbacks.onWin();
          }
        }, 1550);
        this.timers.push(winId);
      } else {
        this.renderBoard();
        this.notify();
      }
    } else {
      this.phase = 'failed';
      this.failedCell = cellIdx;
      this.renderBoard();
      this.notify();
      if (this.callbacks.onFail) this.callbacks.onFail();
    }
  }

  notify() {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        phase: this.phase,
        progress: this.userInput.length,
        total: this.level.sequence.length
      });
    }
  }

  renderBoard() {
    const n = this.level.gridSize || 3;
    this.gridEl.style.gridTemplateColumns = `repeat(${n}, auto)`;
    this.gridEl.innerHTML = '';

    for (let idx = 0; idx < n * n; idx++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-pad-btn';
      btn.dataset.cell = String(idx);

      const enteredPos = this.userInput.indexOf(idx);

      if (this.phase === 'showing' && this.activeFlashIndex === idx) {
        btn.classList.add('lit');
        btn.textContent = String(this.activeFlashStep);
      } else if (enteredPos >= 0) {
        btn.classList.add('matched');
        btn.textContent = `✓ ${enteredPos + 1}`;
      } else if (this.phase === 'failed' && this.failedCell === idx) {
        btn.classList.add('wrong');
        btn.textContent = '✖';
      } else {
        btn.textContent = '•';
      }

      if (this.phase === 'won') {
        const waveDelay = (Math.floor(idx / n) + (idx % n)) * 85;
        btn.classList.add('won-sweep');
        btn.style.setProperty('--win-delay', `${waveDelay}ms`);
      }

      if (this.hintCellIndex === idx && this.phase === 'input') {
        btn.classList.add('hint-highlight');
      }

      btn.disabled = this.phase !== 'input';
      btn.addEventListener('click', () => this.handleCellClick(idx));
      this.gridEl.appendChild(btn);
    }
  }
}
