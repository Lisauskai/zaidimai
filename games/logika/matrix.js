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
export function renderShapeSvg(spec) {
  if (!spec) return '';
  const shape = spec.shape || 'circle';
  const fill = MATRIX_COLORS[spec.color] || spec.color || '#22d3ee';
  const rot = Number(spec.rot) || 0;
  const count = Number(spec.count) || 1;
  const size = spec.size || 'md'; // 'sm' | 'md' | 'lg'
  const dotColor = spec.dotColor ? (MATRIX_COLORS[spec.dotColor] || spec.dotColor) : null;
  const innerDots = Number(spec.innerDots) || 0;

  const scaleMap = { sm: 0.56, md: 0.82, lg: 1.06 };
  const scale = count > 1 ? 0.44 : (scaleMap[size] || 0.85);

  const drawSingle = (cx, cy, sc) => {
    const r = 24 * sc;
    let body = '';
    if (shape === 'circle') {
      body = `<circle cx="0" cy="0" r="${r}" fill="${fill}" stroke="#020617" stroke-width="3" />`;
    } else if (shape === 'square') {
      body = `<rect x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" rx="${4 * sc}" fill="${fill}" stroke="#020617" stroke-width="3" />`;
    } else if (shape === 'diamond') {
      const d = r * 1.15;
      body = `<polygon points="0,${-d} ${d},0 0,${d} ${-d},0" fill="${fill}" stroke="#020617" stroke-width="3" />`;
    } else if (shape === 'triangle') {
      const h = r * 1.15;
      body = `<polygon points="0,${-h} ${h},${h * 0.85} ${-h},${h * 0.85}" fill="${fill}" stroke="#020617" stroke-width="3" stroke-linejoin="round" />`;
    } else if (shape === 'arrow') {
      // Kryptinė rodyklė į dešinę prie rot = 0°
      const w = r * 1.15;
      body = `<polygon points="${-w},${-w * 0.45} ${w * 0.1},${-w * 0.45} ${w * 0.1},${-w * 0.9} ${w},0 ${w * 0.1},${w * 0.9} ${w * 0.1},${w * 0.45} ${-w},${w * 0.45}" fill="${fill}" stroke="#020617" stroke-width="3" stroke-linejoin="round" />`;
    } else if (shape === 'star') {
      const outer = r * 1.15;
      const inner = outer * 0.46;
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rad = i % 2 === 0 ? outer : inner;
        pts.push(`${(Math.cos(a) * rad).toFixed(1)},${(Math.sin(a) * rad).toFixed(1)}`);
      }
      body = `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="#020617" stroke-width="3" stroke-linejoin="round" />`;
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
        overlay += `<circle cx="${dx}" cy="${dy}" r="${4.2 * sc}" fill="#020617" />`;
      });
    }

    return `<g transform="translate(${cx}, ${cy}) rotate(${rot})">${body}${overlay}</g>`;
  };

  let innerSvg = '';
  if (count === 1) {
    innerSvg = drawSingle(40, 40, scale);
  } else if (count === 2) {
    innerSvg = drawSingle(25, 40, scale) + drawSingle(55, 40, scale);
  } else {
    innerSvg = drawSingle(40, 23, scale) + drawSingle(23, 54, scale) + drawSingle(57, 54, scale);
  }

  return `<svg class="matrix-svg" viewBox="0 0 80 80" aria-hidden="true">${innerSvg}</svg>`;
}

export const MATRIX_LEVELS = {
  grade1: [
    {
      id: 'mat_g1_1',
      kind: 'matrix',
      title: '1. Spalvų seka',
      instruction: 'Pažiūrėk, kaip keičiasi spalvos eilutėse, ir pasirink trūkstamą figūrą vietoj [ ? ]!',
      reward: 1,
      grid: [
        { shape: 'circle', color: 'cyan' }, { shape: 'circle', color: 'yellow' }, { shape: 'circle', color: 'magenta' },
        { shape: 'circle', color: 'cyan' }, { shape: 'circle', color: 'yellow' }, { shape: 'circle', color: 'magenta' },
        { shape: 'circle', color: 'cyan' }, { shape: 'circle', color: 'yellow' }, null
      ],
      choices: [
        { shape: 'circle', color: 'cyan' },
        { shape: 'circle', color: 'magenta' },
        { shape: 'circle', color: 'yellow' },
        { shape: 'square', color: 'magenta' }
      ],
      correctIndex: 1
    },
    {
      id: 'mat_g1_2',
      kind: 'matrix',
      title: '2. Figūrų kiekis (1–3)',
      instruction: 'Suskaičiuok, kiek kvadratų yra kiekviename langelyje iš kairės į dešinę!',
      reward: 2,
      grid: [
        { shape: 'square', color: 'cyan', count: 1 }, { shape: 'square', color: 'cyan', count: 2 }, { shape: 'square', color: 'cyan', count: 3 },
        { shape: 'square', color: 'cyan', count: 1 }, { shape: 'square', color: 'cyan', count: 2 }, { shape: 'square', color: 'cyan', count: 3 },
        { shape: 'square', color: 'cyan', count: 1 }, { shape: 'square', color: 'cyan', count: 2 }, null
      ],
      choices: [
        { shape: 'square', color: 'cyan', count: 1 },
        { shape: 'square', color: 'cyan', count: 2 },
        { shape: 'square', color: 'cyan', count: 3 },
        { shape: 'circle', color: 'cyan', count: 3 }
      ],
      correctIndex: 2
    },
    {
      id: 'mat_g1_3',
      kind: 'matrix',
      title: '3. Didėjantys deimantai',
      instruction: 'Kiekvienoje eilutėje deimantai auga! Koks deimantas tinka į paskutinį langelį?',
      reward: 2,
      grid: [
        { shape: 'diamond', color: 'green', size: 'sm' }, { shape: 'diamond', color: 'green', size: 'md' }, { shape: 'diamond', color: 'green', size: 'lg' },
        { shape: 'diamond', color: 'green', size: 'sm' }, { shape: 'diamond', color: 'green', size: 'md' }, { shape: 'diamond', color: 'green', size: 'lg' },
        { shape: 'diamond', color: 'green', size: 'sm' }, { shape: 'diamond', color: 'green', size: 'md' }, null
      ],
      choices: [
        { shape: 'diamond', color: 'green', size: 'sm' },
        { shape: 'diamond', color: 'green', size: 'lg' },
        { shape: 'diamond', color: 'green', size: 'md' },
        { shape: 'triangle', color: 'green', size: 'lg' }
      ],
      correctIndex: 1
    },
    {
      id: 'mat_g1_4',
      kind: 'matrix',
      title: '4. Trys formos eilutėje',
      instruction: 'Kiekvienoje eilutėje ir stulpelyje turi būti visos trys figūros: ratas, trikampis ir kvadratas!',
      reward: 2,
      grid: [
        { shape: 'circle', color: 'yellow' }, { shape: 'triangle', color: 'yellow' }, { shape: 'square', color: 'yellow' },
        { shape: 'triangle', color: 'yellow' }, { shape: 'square', color: 'yellow' }, { shape: 'circle', color: 'yellow' },
        { shape: 'square', color: 'yellow' }, { shape: 'circle', color: 'yellow' }, null
      ],
      choices: [
        { shape: 'triangle', color: 'yellow' },
        { shape: 'square', color: 'yellow' },
        { shape: 'circle', color: 'yellow' },
        { shape: 'diamond', color: 'yellow' }
      ],
      correctIndex: 0
    },
    {
      id: 'mat_g1_5',
      kind: 'matrix',
      title: '5. Žvaigždžių šifras',
      instruction: 'Kokios spalvos žvaigždutės trūksta paskutiniame langelyje?',
      reward: 3,
      grid: [
        { shape: 'star', color: 'cyan' }, { shape: 'star', color: 'green' }, { shape: 'star', color: 'orange' },
        { shape: 'star', color: 'green' }, { shape: 'star', color: 'orange' }, { shape: 'star', color: 'cyan' },
        { shape: 'star', color: 'orange' }, { shape: 'star', color: 'cyan' }, null
      ],
      choices: [
        { shape: 'star', color: 'cyan' },
        { shape: 'star', color: 'orange' },
        { shape: 'star', color: 'green' },
        { shape: 'diamond', color: 'green' }
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
      if (this.userInput.length === this.level.sequence.length) {
        this.phase = 'won';
        this.renderBoard();
        this.notify();
        if (this.callbacks.onWin) this.callbacks.onWin();
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

      if (this.hintCellIndex === idx && this.phase === 'input') {
        btn.classList.add('hint-highlight');
      }

      btn.disabled = this.phase !== 'input';
      btn.addEventListener('click', () => this.handleCellClick(idx));
      this.gridEl.appendChild(btn);
    }
  }
}
