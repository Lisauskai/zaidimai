// ==================== BUBIŲ TVIRTOVĖ: MOKOMŲJŲ UŽDAVINIŲ VARIKLIS IR ŽINIŲ VARTAI ====================
// Vizualiniai ir interaktyvūs uždaviniai 1 klasei („Linas“) ir 3 klasei („Lukas“).

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildNumericOptions(correctNum, offsets, minAllowed = 0, formatFn = (n) => String(n)) {
  const correctStr = formatFn(correctNum);
  const set = new Set([correctStr]);
  const shuffledOffsets = shuffleArray(offsets);
  for (const off of shuffledOffsets) {
    const val = correctNum + off;
    if (val >= minAllowed) {
      set.add(formatFn(val));
    }
    if (set.size >= 4) break;
  }
  let delta = 1;
  while (set.size < 4) {
    const cand = correctNum + delta;
    if (cand >= minAllowed) set.add(formatFn(cand));
    delta += 1;
  }
  return shuffleArray([...set]);
}

function buildStringOptions(correctStr, distractors) {
  const set = new Set([correctStr]);
  for (const d of shuffleArray(distractors)) {
    if (d !== correctStr) set.add(d);
    if (set.size >= 4) break;
  }
  return shuffleArray([...set]);
}

// ==================== PROGRESUOJANČIOS BAUSMĖS ŽINIŲ VARTŲ SESIJA ====================
export function createKnowledgeGateSession(initialRemaining = 3) {
  const baseRequired = Math.max(1, Number(initialRemaining) || 3);
  return {
    initialRemaining: baseRequired,
    remaining: baseRequired,
    mistakes: 0,
    solved: 0,
    submitAnswer(isCorrect) {
      if (isCorrect) {
        this.solved += 1;
        this.remaining = Math.max(0, this.remaining - 1);
        return {
          isCorrect: true,
          penaltyAdded: 0,
          remaining: this.remaining,
          mistakes: this.mistakes,
          solved: this.solved,
          complete: this.remaining <= 0,
          warning: ''
        };
      }
      this.mistakes += 1;
      const penaltyAdded = this.mistakes;
      this.remaining += penaltyAdded;
      return {
        isCorrect: false,
        penaltyAdded,
        remaining: this.remaining,
        mistakes: this.mistakes,
        solved: this.solved,
        complete: false,
        warning: `Ups! Klaida #${this.mistakes} → +${penaltyAdded} papildomi uždaviniai! Nesikubink ir suskaičiuok tiksliai!`
      };
    }
  };
}

// ==================== 1 KLASĖ („LINAS“) UŽDAVINIŲ GENERATORIAI ====================

function generateGrade1Clock() {
  const hour = randInt(1, 12);
  const minute = Math.random() < 0.5 ? 0 : 30;
  const minText = minute === 0 ? '00' : '30';
  const correct = `${hour}:${minText}`;

  const altHour1 = ((hour % 12) + 1);
  const altHour2 = hour === 1 ? 12 : hour - 1;
  const otherMin = minute === 0 ? '30' : '00';

  const distractors = [
    `${hour}:${otherMin}`,
    `${altHour1}:${minText}`,
    `${altHour2}:${otherMin}`,
    `${((hour + 5) % 12) + 1}:${minText}`
  ];

  const halfDesc = minute === 0 ? 'lygiai ant 12 (pilna valanda)' : 'apačioje ant 6 (pusė valandos)';
  return {
    category: 'clock',
    categoryLabel: '🕒 Laikrodis',
    signature: `g1_clock_${correct}`,
    prompt: 'Kiek valandų rodo sieninis laikrodis?',
    options: buildStringOptions(correct, distractors),
    correctAnswer: correct,
    explanation: `Trumpoji rodyklė rodo į ${hour}, o ilgoji rodyklė stovi ${halfDesc} — todėl dabar yra ${correct}.`,
    visual: { type: 'clock', hour, minute, showMinutesLabels: false }
  };
}

function formatCentsLt(cents) {
  if (cents >= 100) {
    const eur = Math.floor(cents / 100);
    const rem = cents % 100;
    return rem === 0 ? `${eur} €` : `${eur} € ${rem} ct`;
  }
  return `${cents} ct`;
}

function generateGrade1Coins() {
  const useChangeMode = Math.random() < 0.4;
  if (useChangeMode) {
    const paid = pickRandom([5, 10]);
    const price = paid === 5 ? randInt(1, 4) : randInt(2, 8);
    const change = paid - price;
    const correct = `${change} €`;
    const options = buildNumericOptions(change, [-2, -1, 1, 2, 3], 1, (n) => `${n} €`);
    return {
      category: 'coins',
      categoryLabel: '💶 Pinigai',
      signature: `g1_coins_ch_${paid}_${price}`,
      prompt: `Sultys kainuoja ${price} €. Linas davė ${paid} € banknotą. Kiek grąžos gaus?`,
      options,
      correctAnswer: correct,
      explanation: `Iš ${paid} € atėmę kainą (${price} €), gauname grąžą: ${paid} - ${price} = ${change} €!`,
      visual: { type: 'coins_change', paid, price }
    };
  }

  const combos = [
    [200, 100, 50],
    [200, 200, 100],
    [100, 100, 50],
    [200, 50, 20],
    [100, 50, 50],
    [200, 100, 20],
    [50, 20, 10],
    [100, 20, 20]
  ];
  const coins = pickRandom(combos);
  const totalCents = coins.reduce((a, b) => a + b, 0);
  const correct = formatCentsLt(totalCents);
  const offsetCents = [-100, -50, -20, 20, 50, 100];
  const options = buildNumericOptions(totalCents, offsetCents, 20, formatCentsLt);

  const labels = coins.map((c) => (c >= 100 ? `${c / 100} €` : `${c} ct`)).join(' + ');
  return {
    category: 'coins',
    categoryLabel: '💶 Pinigai',
    signature: `g1_coins_sum_${coins.join('_')}`,
    prompt: 'Suskaičiuok, kiek iš viso pinigų yra pavaizduota paveikslėlyje:',
    options,
    correctAnswer: correct,
    explanation: `Sudėję monetas (${labels}), iš viso gauname ${correct}.`,
    visual: { type: 'coins_sum', coins }
  };
}

function generateGrade1Inequality() {
  const useSub = Math.random() < 0.45;
  let leftExpr = '';
  let leftVal = 0;
  if (!useSub) {
    const a = randInt(4, 12);
    const b = randInt(2, 9);
    leftVal = a + b;
    leftExpr = `${a} + ${b}`;
  } else {
    const a = randInt(11, 20);
    const b = randInt(2, Math.min(9, a - 1));
    leftVal = a - b;
    leftExpr = `${a} - ${b}`;
  }
  const delta = pickRandom([-3, -2, -1, 0, 0, 1, 2, 3]);
  const rightVal = Math.max(1, leftVal + delta);
  const correct = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';

  return {
    category: 'inequality',
    categoryLabel: '⚖️ Palyginimas',
    signature: `g1_ineq_${leftExpr}_${rightVal}`,
    prompt: `Koks ženklas tinka vietoj „?“:  ${leftExpr}  ?  ${rightVal}`,
    options: ['<', '>', '='],
    correctAnswer: correct,
    explanation: `Pirmiausia suskaičiuojame kairę pusę: ${leftExpr} = ${leftVal}. Kadangi ${leftVal} ${correct} ${rightVal}, teisingas ženklas yra „${correct}“.`,
    visual: { type: 'inequality', leftText: leftExpr, rightText: String(rightVal) }
  };
}

function generateGrade1Sequence() {
  const mode = Math.random() < 0.5 ? 'equation' : 'pattern';
  if (mode === 'equation') {
    const isSub = Math.random() < 0.5;
    if (isSub) {
      const total = randInt(11, 20);
      const ans = randInt(3, 9);
      const res = total - ans;
      return {
        category: 'sequence',
        categoryLabel: '🔢 Sekos ir dėžutės',
        signature: `g1_seq_sub_${total}_${res}`,
        prompt: `Koks skaičius slepiasi po „?“:  ${total} - ? = ${res}`,
        options: buildNumericOptions(ans, [-2, -1, 1, 2, 3], 1),
        correctAnswer: String(ans),
        explanation: `Kad sužinotume, kiek atėmėme iš ${total}, apskaičiuojame ${total} - ${res} = ${ans}. Tikriname: ${total} - ${ans} = ${res}.`,
        visual: { type: 'sequence_boxes', items: [total, '-', '?', '=', res] }
      };
    }
    const a = randInt(3, 10);
    const ans = randInt(2, 9);
    const total = a + ans;
    return {
      category: 'sequence',
      categoryLabel: '🔢 Sekos ir dėžutės',
      signature: `g1_seq_add_${a}_${total}`,
      prompt: `Koks skaičius slepiasi po „?“:  ${a} + ? = ${total}`,
      options: buildNumericOptions(ans, [-2, -1, 1, 2, 3], 1),
      correctAnswer: String(ans),
      explanation: `Iš sumos ${total} atimame ${a}: ${total} - ${a} = ${ans}. Tikriname: ${a} + ${ans} = ${total}.`,
      visual: { type: 'sequence_boxes', items: [a, '+', '?', '=', total] }
    };
  }

  const patterns = [
    { start: 2, step: 2 },
    { start: 3, step: 3 },
    { start: 5, step: 5 },
    { start: 4, step: 2 },
    { start: 20, step: -2 },
    { start: 18, step: -3 }
  ];
  const pat = pickRandom(patterns);
  const seq = [pat.start, pat.start + pat.step, pat.start + 2 * pat.step, pat.start + 3 * pat.step];
  const ans = pat.start + 4 * pat.step;
  const stepText = pat.step > 0 ? `+${pat.step}` : `${pat.step}`;

  return {
    category: 'sequence',
    categoryLabel: '🔢 Skaičių seka',
    signature: `g1_pat_${seq.join('_')}`,
    prompt: `Pratęsk skaičių seką:  ${seq.join(', ')}, ?`,
    options: buildNumericOptions(ans, [-3, -2, -1, 1, 2, 3], 0),
    correctAnswer: String(ans),
    explanation: `Kiekvienas kitas skaičius keičiasi po ${stepText}. Todėl ${seq[3]} (${stepText}) = ${ans}.`,
    visual: { type: 'sequence_boxes', items: [...seq, '?'] }
  };
}

function generateGrade1Geometry() {
  const presets = [
    {
      target: 'trikampių',
      nameSingular: 'trikampis',
      triangles: 3,
      squares: 2,
      circles: 2,
      layout: 'house_trees'
    },
    {
      target: 'keturkampių (kvadratų ir stačiakampių)',
      nameSingular: 'keturkampis',
      triangles: 2,
      squares: 4,
      circles: 2,
      layout: 'train'
    },
    {
      target: 'trikampių',
      nameSingular: 'trikampis',
      triangles: 4,
      squares: 2,
      circles: 1,
      layout: 'rockets'
    },
    {
      target: 'skritulių',
      nameSingular: 'skritulys',
      triangles: 2,
      squares: 2,
      circles: 5,
      layout: 'caterpillar'
    }
  ];
  const preset = pickRandom(presets);
  const ans =
    preset.nameSingular === 'trikampis'
      ? preset.triangles
      : preset.nameSingular === 'keturkampis'
      ? preset.squares
      : preset.circles;

  return {
    category: 'geometry',
    categoryLabel: '📐 Geometrija',
    signature: `g1_geo_${preset.layout}_${preset.nameSingular}`,
    prompt: `Pažiūrėk į piešinį! Kiek iš viso jame yra ${preset.target}?`,
    options: buildNumericOptions(ans, [-1, 1, 2, 3], 1),
    correctAnswer: String(ans),
    explanation: `Atidžiai suskaičiavus kiekvieną figūrą piešinyje, iš viso randame ${ans} (${preset.target}).`,
    visual: { type: 'geometry_scene', preset }
  };
}

const GRADE1_WORLD_BANK = [
  {
    id: 'g1_w_nature_1',
    tag: '🌿 Bubių gamta',
    icon: '🫐',
    cardTitle: 'Bubių šilauogės',
    accent: '#6366f1',
    prompt: 'Kuo naudinga saulė ir lietutis Bubių kiemo šilauogių krūmams?',
    correct: 'Padeda augti ir nokinti uogas',
    distractors: ['Užšaldo šaknis', 'Paverčia lapus akmenimis', 'Išgąsdina bites'],
    explanation: 'Augalams reikia saulės šviesos ir vandens, kad jie galėtų augti ir brandinti saldžias uogas!'
  },
  {
    id: 'g1_w_nature_2',
    tag: '🌲 Kurtuvėnų miškas',
    icon: '🦔',
    cardTitle: 'Miško gyventojai',
    accent: '#22c55e',
    prompt: 'Kuris gyvūnas rudenį susisuka lapų guolyje ir užmiega žiemos miegu?',
    correct: 'Ežys',
    distractors: ['Vilkas', 'Zuikis', 'Kėkštas'],
    explanation: 'Ežiai žiemą neieško maisto po sniegu, o ramiai užmiega šiltame lapų guolyje iki pavasario.'
  },
  {
    id: 'g1_w_music_1',
    tag: '🎵 Muzika',
    icon: '🎶',
    cardTitle: 'Garso aukštis',
    accent: '#ec4899',
    prompt: 'Kurio gyvūno ar instrumento balsas yra AUKŠTAS ir plonas?',
    correct: 'Žvirblio čirškėjimas',
    distractors: ['Lokio riaumojimas', 'Didžiojo būgno dundesys', 'Griaustinis'],
    explanation: 'Mažo paukštelio (žvirblio) čirškėjimas skamba aukštai, o lokio balsas ar didysis būgnas — žemai.'
  },
  {
    id: 'g1_w_music_2',
    tag: '🎵 Muzika',
    icon: '🔊',
    cardTitle: 'Garso stiprumas',
    accent: '#f59e0b',
    prompt: 'Kaip muzikoje skamba lopšinė, kai norime užmigdyti kūdikį?',
    correct: 'Tyliai ir švelniai',
    distractors: ['Labai garsiai ir greitai', 'Kaip gaisrinės sirena', 'Su būgnų sprogimu'],
    explanation: 'Lopšinės dainuojamos tyliai (piano) ir lėtai, kad sukurtų ramią nuotaiką.'
  },
  {
    id: 'g1_w_en_1',
    tag: '🇬🇧 Anglų k.',
    icon: '🌈',
    cardTitle: 'GREEN',
    accent: '#10b981',
    swatch: '#22c55e',
    prompt: 'Ką lietuviškai reiškia angliškas žodis „GREEN“?',
    correct: 'Žalia',
    distractors: ['Mėlyna', 'Geltona', 'Raudona'],
    explanation: '„Green“ lietuviškai reiškia „žalia“ — kaip Bubių kiemo žolė!'
  },
  {
    id: 'g1_w_en_2',
    tag: '🇬🇧 Anglų k.',
    icon: '🐾',
    cardTitle: 'DOG',
    accent: '#38bdf8',
    prompt: 'Koks gyvūnas angliškai vadinamas „DOG“?',
    correct: 'Šuo',
    distractors: ['Katė', 'Paukštis', 'Varlė'],
    explanation: '„Dog“ reiškia šuo, o katė angliškai yra „cat“.'
  },
  {
    id: 'g1_w_en_3',
    tag: '🇬🇧 Anglų k.',
    icon: '🔢',
    cardTitle: 'SEVEN',
    accent: '#a855f7',
    prompt: 'Koks tai skaičius angliškai: „SEVEN“?',
    correct: '7',
    distractors: ['5', '6', '9'],
    explanation: 'Skaičiuojame: five (5), six (6), seven (7), eight (8)!'
  },
  {
    id: 'g1_w_en_4',
    tag: '🇬🇧 Anglų k.',
    icon: '☀️',
    cardTitle: 'YELLOW',
    accent: '#eab308',
    swatch: '#facc15',
    prompt: 'Kokia spalva angliškai vadinama „YELLOW“?',
    correct: 'Geltona',
    distractors: ['Oranžinė', 'Juoda', 'Balta'],
    explanation: '„Yellow“ reiškia geltona — kaip ryški saulutė danguje!'
  }
];

function generateGrade1World() {
  const item = pickRandom(GRADE1_WORLD_BANK);
  return {
    category: 'world_quiz',
    categoryLabel: item.tag,
    signature: item.id,
    prompt: item.prompt,
    options: buildStringOptions(item.correct, item.distractors),
    correctAnswer: item.correct,
    explanation: item.explanation,
    visual: {
      type: 'world_card',
      icon: item.icon,
      cardTitle: item.cardTitle,
      accent: item.accent,
      swatch: item.swatch || null
    }
  };
}

// ==================== 3 KLASĖ („LUKAS“) UŽDAVINIŲ GENERATORIAI ====================

function formatHHMM(totalMinutes) {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${h}:${m < 10 ? '0' : ''}${m}`;
}

function generateGrade3ClockDuration() {
  const isDuration = Math.random() < 0.65;
  const startH = randInt(9, 17);
  const startM = pickRandom([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]);

  if (!isDuration) {
    const correct = formatHHMM(startH * 60 + startM);
    const wrong1 = formatHHMM(startH * 60 + ((startM + 15) % 60));
    const wrong2 = formatHHMM(((startH % 12) + 1) * 60 + startM);
    const wrong3 = formatHHMM(startH * 60 + Math.floor(startM / 5));
    return {
      category: 'clock_duration',
      categoryLabel: '⏱️ Laikrodis (5 min.)',
      signature: `g3_clk_${startH}_${startM}`,
      prompt: `Kiek valandų rodo laikrodis po pietų (${startH >= 12 ? 'popietė' : 'rytas'})?`,
      options: buildStringOptions(correct, [wrong1, wrong2, wrong3]),
      correctAnswer: correct,
      explanation: `Valandų rodyklė ties ${startH}, o minučių ties ${startM / 5} (${startM / 5} × 5 = ${startM} min.). Atsakymas: ${correct}.`,
      visual: { type: 'clock', hour: startH % 12 || 12, minute: startM, showMinutesLabels: true, badgeText: startH >= 12 ? 'POPIET' : 'RYTAS' }
    };
  }

  const duration = pickRandom([25, 35, 40, 45, 50, 75]);
  const startTotal = startH * 60 + startM;
  const endTotal = startTotal + duration;
  const correct = formatHHMM(endTotal);
  const startStr = formatHHMM(startTotal);

  const distractors = [
    formatHHMM(endTotal + 10),
    formatHHMM(endTotal - 10),
    formatHHMM(endTotal + 60),
    formatHHMM(endTotal - 15)
  ];

  return {
    category: 'clock_duration',
    categoryLabel: '⏱️ Trukmės skaičiavimas',
    signature: `g3_dur_${startH}_${startM}_${duration}`,
    prompt: `„Dagilėlio“ choro repeticija prasidėjo ${startStr} (žr. laikrodį) ir truko ${duration} min. Kelintą valandą ji baigėsi?`,
    options: buildStringOptions(correct, distractors),
    correctAnswer: correct,
    explanation: `Pridėjus ${duration} min. prie ${startStr}, gauname ${correct}.`,
    visual: { type: 'clock', hour: startH % 12 || 12, minute: startM, showMinutesLabels: true, badgeText: `+${duration} min` }
  };
}

function generateGrade3Units() {
  const variant = randInt(1, 3);
  if (variant === 1) {
    const m = randInt(2, 6);
    const cm = pickRandom([5, 18, 35, 40, 75, 80]);
    const totalCm = m * 100 + cm;
    const correct = `${totalCm} cm`;
    const distractors = [`${m * 10 + cm} cm`, `${totalCm + 100} cm`, `${m * 100 + cm * 10} cm`, `${totalCm - 10} cm`];
    return {
      category: 'units',
      categoryLabel: '📏 Matavimo vienetai',
      signature: `g3_u_m_${m}_${cm}`,
      prompt: `Paversk į centimetrus:  ${m} m ${cm} cm = ?`,
      options: buildStringOptions(correct, distractors),
      correctAnswer: correct,
      explanation: `Kadangi 1 m = 100 cm, tai ${m} m = ${m * 100} cm. Pridedame ${cm} cm ir gauname ${totalCm} cm.`,
      visual: { type: 'unit_bridge', topLabel: `${m} m ${cm} cm`, ruleText: '1 m = 100 cm', accent: '#38bdf8' }
    };
  }
  if (variant === 2) {
    const kg = randInt(1, 5);
    const g = pickRandom([150, 250, 400, 600, 750, 80]);
    const totalG = kg * 1000 + g;
    const correct = `${totalG} g`;
    const distractors = [`${kg * 100 + g} g`, `${totalG + 1000} g`, `${totalG - 100} g`, `${kg * 1000 + g * 10} g`];
    return {
      category: 'units',
      categoryLabel: '⚖️ Matavimo vienetai',
      signature: `g3_u_kg_${kg}_${g}`,
      prompt: `Kiek gramų yra:  ${kg} kg ${g} g = ?`,
      options: buildStringOptions(correct, distractors),
      correctAnswer: correct,
      explanation: `1 kg = 1000 g. Tad ${kg} kg = ${kg * 1000} g, plius ${g} g = ${totalG} g.`,
      visual: { type: 'unit_bridge', topLabel: `${kg} kg ${g} g`, ruleText: '1 kg = 1000 g', accent: '#f59e0b' }
    };
  }
  const val = randInt(2, 4);
  const min = pickRandom([10, 15, 25, 35, 45]);
  const totalMin = val * 60 + min;
  const correct = `${totalMin} min.`;
  const distractors = [`${val * 100 + min} min.`, `${totalMin + 60} min.`, `${totalMin - 20} min.`, `${val * 30 + min} min.`];
  return {
    category: 'units',
    categoryLabel: '⏱️ Laiko vienetai',
    signature: `g3_u_val_${val}_${min}`,
    prompt: `Paversk į minutes:  ${val} val. ${min} min. = ?`,
    options: buildStringOptions(correct, distractors),
    correctAnswer: correct,
    explanation: `1 val. = 60 min., todėl ${val} val. = ${val * 60} min. Sudėjus su ${min} min., gauname ${totalMin} min.`,
    visual: { type: 'unit_bridge', topLabel: `${val} val. ${min} min.`, ruleText: '1 val. = 60 min.', accent: '#a855f7' }
  };
}

function generateGrade3PerimeterArea() {
  const width = randInt(4, 9);
  let height = randInt(3, 6);
  if (height === width) height = Math.max(3, width - 2);
  const askArea = Math.random() < 0.5;

  if (askArea) {
    const area = width * height;
    const perim = 2 * (width + height);
    const correct = `${area} m²`;
    const distractors = [`${perim} m²`, `${area + width} m²`, `${area - height} m²`, `${width + height} m²`];
    return {
      category: 'perimeter_area',
      categoryLabel: '🌱 Plotas (S)',
      signature: `g3_area_${width}_${height}`,
      prompt: `Bubių kiemo braškių lysvės ilgis yra ${width} m, o plotis ${height} m. Koks jos PLOTAS?`,
      options: buildStringOptions(correct, distractors),
      correctAnswer: correct,
      explanation: `Stačiakampio plotas apskaičiuojamas dauginant ilgį iš pločio: S = ${width} × ${height} = ${area} m².`,
      visual: { type: 'grid_rect', width, height, mode: 'area' }
    };
  }

  const perim = 2 * (width + height);
  const area = width * height;
  const correct = `${perim} m`;
  const distractors = [`${width + height} m`, `${area} m`, `${perim + 4} m`, `${perim - 2} m`];
  return {
    category: 'perimeter_area',
    categoryLabel: '📐 Perimetras (P)',
    signature: `g3_perim_${width}_${height}`,
    prompt: `Kieme aptveriama ${width} m ilgio ir ${height} m pločio šilauogių lysvė. Koks jos PERIMETRAS?`,
    options: buildStringOptions(correct, distractors),
    correctAnswer: correct,
    explanation: `Perimetras yra visų 4 kraštinių suma: P = ${width} + ${height} + ${width} + ${height} = 2 × (${width} + ${height}) = ${perim} m.`,
    visual: { type: 'grid_rect', width, height, mode: 'perimeter' }
  };
}

function generateGrade3Fractions() {
  const denom = pickRandom([3, 4, 5, 6, 8]);
  const numer = randInt(1, denom - 1);
  const askRemaining = Math.random() < 0.3;
  const targetNumer = askRemaining ? denom - numer : numer;
  const correct = `${targetNumer}/${denom}`;

  const distractors = [
    `${denom - targetNumer === targetNumer ? targetNumer + 1 : denom - targetNumer}/${denom}`,
    `${targetNumer}/${denom + 2}`,
    `${Math.min(denom, targetNumer + 1)}/${denom}`,
    `1/${denom + 1}`
  ];

  const prompt = askRemaining
    ? `Pica padalinta į ${denom} lygias dalis. Spalvotos dalys (${numer}) jau suvalgytos. Kuri dalis liko nesuvalgyta?`
    : `Kuri pyrago dalis yra NUSPALVINTA paveikslėlyje?`;

  const explanation = askRemaining
    ? `Visa pica yra ${denom}/${denom}. Suvalgyta ${numer}/${denom}, vadinasi liko ${denom} - ${numer} = ${targetNumer} dalys iš ${denom}, t. y. ${correct}.`
    : `Apskritimas padalintas į ${denom} lygias dalis (vardiklis), o nuspalvintos yra ${numer} dalys (skaitiklis), todėl trupmena yra ${correct}.`;

  return {
    category: 'fractions',
    categoryLabel: '🍕 Trupmenos',
    signature: `g3_frac_${numer}_${denom}_${askRemaining ? 'r' : 'c'}`,
    prompt,
    options: buildStringOptions(correct, distractors),
    correctAnswer: correct,
    explanation,
    visual: { type: 'fraction_pie', numer, denom }
  };
}

function generateGrade3OrderOfOps() {
  const variant = randInt(1, 3);
  if (variant === 1) {
    // a + b * (c - d)
    const d = randInt(2, 6);
    const diff = randInt(3, 7);
    const c = d + diff;
    const b = randInt(3, 8);
    const a = randInt(12, 36);
    const ans = a + b * diff;
    const wrongOrder = (a + b) * diff;
    return {
      category: 'order_of_ops',
      categoryLabel: '🧮 Veiksmų tvarka',
      signature: `g3_ops1_${a}_${b}_${c}_${d}`,
      prompt: `Apskaičiuok laikydamasis veiksmų tvarkos:  ${a} + ${b} × (${c} - ${d}) = ?`,
      options: buildNumericOptions(ans, [wrongOrder - ans, -6, 6, 10, -10], 1),
      correctAnswer: String(ans),
      explanation: `1) Skliaustuose: ${c} - ${d} = ${diff}. 2) Daugyba: ${b} × ${diff} = ${b * diff}. 3) Sudėtis: ${a} + ${b * diff} = ${ans}.`,
      visual: { type: 'expression_card', expr: `${a} + ${b} × (${c} - ${d}) = ?`, hint: 'Skliaustai → × / : → + / -' }
    };
  }
  if (variant === 2) {
    // (k * n + ...) / k + extra
    const div = randInt(3, 8);
    const q = randInt(4, 11);
    const totalInside = div * q;
    const p1 = randInt(div + 2, totalInside - div);
    const p2 = totalInside - p1;
    const extra = randInt(6, 25);
    const ans = q + extra;
    return {
      category: 'order_of_ops',
      categoryLabel: '🧮 Veiksmų tvarka',
      signature: `g3_ops2_${p1}_${p2}_${div}_${extra}`,
      prompt: `Apskaičiuok:  (${p1} + ${p2}) : ${div} + ${extra} = ?`,
      options: buildNumericOptions(ans, [-4, -2, 2, 5, 8], 1),
      correctAnswer: String(ans),
      explanation: `1) Skliaustuose: ${p1} + ${p2} = ${totalInside}. 2) Dalyba: ${totalInside} : ${div} = ${q}. 3) Sudėtis: ${q} + ${extra} = ${ans}.`,
      visual: { type: 'expression_card', expr: `(${p1} + ${p2}) : ${div} + ${extra} = ?`, hint: 'Pirma apskaičiuok skliaustus!' }
    };
  }
  // Dalyba su liekana
  const divisor = randInt(4, 9);
  const quotient = randInt(5, 11);
  const remainder = randInt(1, divisor - 1);
  const dividend = divisor * quotient + remainder;
  const correct = `${quotient} (liek. ${remainder})`;
  const distractors = [
    `${quotient - 1} (liek. ${remainder})`,
    `${quotient} (liek. ${remainder === divisor - 1 ? 1 : remainder + 1})`,
    `${quotient + 1} (liek. ${remainder})`,
    `${quotient} (liek. 0)`
  ];
  return {
    category: 'order_of_ops',
    categoryLabel: '➗ Dalyba su liekana',
    signature: `g3_rem_${dividend}_${divisor}`,
    prompt: `Padalyk su liekana:  ${dividend} : ${divisor} = ?`,
    options: buildStringOptions(correct, distractors),
    correctAnswer: correct,
    explanation: `Artimiausias kartotinis yra ${divisor} × ${quotient} = ${divisor * quotient}. Liko ${dividend} - ${divisor * quotient} = ${remainder}, todėl ${correct}.`,
    visual: { type: 'expression_card', expr: `${dividend} : ${divisor} = ?`, hint: 'Rask dalmenį ir liekaną' }
  };
}

const GRADE3_WORLD_BANK = [
  {
    id: 'g3_w_lt_1',
    tag: '🇱🇹 Lietuva ir upės',
    icon: '🏞️',
    cardTitle: 'Lietuvos upės',
    accent: '#0ea5e9',
    prompt: 'Kuri didžiausia Lietuvos upė teka per Druskininkus, Alytų ir Kauną į Kuršių marias?',
    correct: 'Nemunas',
    distractors: ['Neris', 'Venta', 'Šešupė'],
    explanation: 'Nemunas yra ilgiausia ir didžiausia Lietuvos upė (937 km), įtekanti į Kuršių marias.'
  },
  {
    id: 'g3_w_lt_2',
    tag: '🇱🇹 Mūsų kraštas',
    icon: '🧭',
    cardTitle: 'Bubių apylinkės',
    accent: '#22c55e',
    prompt: 'Šalia kurio didelio Lietuvos miesto yra Bubiai ir Kurtuvėnų regioninis parkas?',
    correct: 'Šiaulių',
    distractors: ['Klaipėdos', 'Panevėžio', 'Marijampolės'],
    explanation: 'Bubiai ir nuostabus Kurtuvėnų regioninis parkas yra įsikūrę visai netoli Šiaulių!'
  },
  {
    id: 'g3_w_lt_3',
    tag: '🇱🇹 Lietuvos miestai',
    icon: '🏰',
    cardTitle: 'Šimtametė sostinė',
    accent: '#8b5cf6',
    prompt: 'Kuris Lietuvos miestas stovi ant Neries ir Vilnelės upių santakos su Gedimino pilimi?',
    correct: 'Vilnius',
    distractors: ['Kaunas', 'Trakai', 'Kėdainiai'],
    explanation: 'Vilnius — Lietuvos sostinė, kurios centre aukštai stūkso Gedimino pilies bokštas.'
  },
  {
    id: 'g3_w_music_1',
    tag: '🎼 Muzikos raštas',
    icon: '🎼',
    cardTitle: 'Natų gama',
    accent: '#ec4899',
    prompt: 'Kokia nata eina iškart po „DO – RE – MI“ dainuojant gamą aukštyn?',
    correct: 'FA',
    distractors: ['SOL', 'LA', 'SI'],
    explanation: 'Visa muzikos gama iš eilės: Do – Re – Mi – Fa – Sol – La – Si!'
  },
  {
    id: 'g3_w_music_2',
    tag: '🎼 Natų trukmės',
    icon: '♩',
    cardTitle: 'Ritmo trukmė',
    accent: '#f59e0b',
    prompt: 'Kiek ketvirtinių natų telpa vienoje pusinėje natoje (baltame apskritime su koteliu)?',
    correct: '2',
    distractors: ['1', '4', '8'],
    explanation: 'Pusinė nata trunka 2 smūgius (skaičiuojam: vienas-du), todėl joje telpa lygiai 2 ketvirtinės natos.'
  },
  {
    id: 'g3_w_en_1',
    tag: '🇬🇧 Anglų k. (3 kl.)',
    icon: '📚',
    cardTitle: 'Present Simple',
    accent: '#6366f1',
    prompt: 'Pasirink teisingą žodį sakinyje:  „Lukas ___ football every Saturday.“',
    correct: 'plays',
    distractors: ['play', 'playing', 'are play'],
    explanation: 'Su vienaskaitos trečiuoju asmeniu (he / she / Lukas) veiksmažodis gauna galūnę „-s“: Lukas plays!'
  },
  {
    id: 'g3_w_en_2',
    tag: '🇬🇧 Anglų k. (3 kl.)',
    icon: '🗓️',
    cardTitle: 'Savaitės dienos',
    accent: '#14b8a6',
    prompt: 'Kuri savaitės diena angliškai vadinama „WEDNESDAY“?',
    correct: 'Trečiadienis',
    distractors: ['Antradienis', 'Ketvirtadienis', 'Šeštadienis'],
    explanation: 'Monday (I), Tuesday (II), Wednesday (III — trečiadienis), Thursday (IV).'
  },
  {
    id: 'g3_w_en_3',
    tag: '🇬🇧 Anglų k. (3 kl.)',
    icon: '⚡',
    cardTitle: 'Antonimai',
    accent: '#f43f5e',
    prompt: 'Koks žodis yra priešingas (antonimas) žodžiui „HEAVY“ (sunkus)?',
    correct: 'Light',
    distractors: ['Short', 'Small', 'Cold'],
    explanation: '„Heavy“ reiškia sunkus, o jo priešingybė — „light“ (lengvas).'
  }
];

function generateGrade3World() {
  const item = pickRandom(GRADE3_WORLD_BANK);
  return {
    category: 'world_quiz_3',
    categoryLabel: item.tag,
    signature: item.id,
    prompt: item.prompt,
    options: buildStringOptions(item.correct, item.distractors),
    correctAnswer: item.correct,
    explanation: item.explanation,
    visual: {
      type: 'world_card',
      icon: item.icon,
      cardTitle: item.cardTitle,
      accent: item.accent,
      swatch: null
    }
  };
}

// ==================== BENDRAS GENERATORIUS SU NEKARTOJIMO LOGIKA ====================
export class EduTaskGenerator {
  constructor() {
    this.lastCategoryByProfile = new Map();
    this.lastSignatureByProfile = new Map();
  }

  getWeightedGenerators(profileId) {
    if (profileId === 'linas') {
      return [
        { category: 'clock', weight: 16, fn: generateGrade1Clock },
        { category: 'coins', weight: 16, fn: generateGrade1Coins },
        { category: 'inequality', weight: 16, fn: generateGrade1Inequality },
        { category: 'sequence', weight: 16, fn: generateGrade1Sequence },
        { category: 'geometry', weight: 16, fn: generateGrade1Geometry },
        { category: 'world_quiz', weight: 20, fn: generateGrade1World }
      ];
    }
    return [
      { category: 'clock_duration', weight: 16, fn: generateGrade3ClockDuration },
      { category: 'units', weight: 16, fn: generateGrade3Units },
      { category: 'perimeter_area', weight: 16, fn: generateGrade3PerimeterArea },
      { category: 'fractions', weight: 16, fn: generateGrade3Fractions },
      { category: 'order_of_ops', weight: 16, fn: generateGrade3OrderOfOps },
      { category: 'world_quiz_3', weight: 20, fn: generateGrade3World }
    ];
  }

  pickGenerator(profileId, lastCategory) {
    const pool = this.getWeightedGenerators(profileId).filter((g) => g.category !== lastCategory);
    const totalWeight = pool.reduce((sum, g) => sum + g.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of pool) {
      r -= item.weight;
      if (r <= 0) return item;
    }
    return pool[pool.length - 1];
  }

  generateTask(profileId = 'linas') {
    const key = profileId === 'lukas' ? 'lukas' : 'linas';
    const lastCategory = this.lastCategoryByProfile.get(key) || null;
    const lastSignature = this.lastSignatureByProfile.get(key) || null;

    let selected = null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const gen = this.pickGenerator(key, lastCategory);
      const task = gen.fn();
      if (task.signature !== lastSignature) {
        selected = task;
        break;
      }
      selected = task;
    }

    if (selected) {
      this.lastCategoryByProfile.set(key, selected.category);
      this.lastSignatureByProfile.set(key, selected.signature);
    }
    return selected;
  }
}

export const eduTaskGenerator = new EduTaskGenerator();

// ==================== CANVAS VIZUALŲ PIEŠIMAS ====================

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawClockVisual(ctx, w, h, v) {
  const cx = w * 0.5;
  const cy = h * 0.52;
  const r = Math.min(w, h) * 0.41;

  // Ciferblato fonas
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  // Minučių brūkšneliai
  for (let i = 0; i < 60; i += 1) {
    const ang = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const inner = r * (isMajor ? 0.84 : 0.91);
    const outer = r * 0.95;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
    ctx.lineTo(cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer);
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.strokeStyle = isMajor ? '#0f172a' : '#94a3b8';
    ctx.stroke();
  }

  // Skaičiai 1-12
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let num = 1; num <= 12; num += 1) {
    const ang = (num / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.fillText(String(num), cx + Math.cos(ang) * (r * 0.72), cy + Math.sin(ang) * (r * 0.72));
  }

  // Valandų rodyklė
  const hourAngle = (((v.hour % 12) + v.minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hourAngle) * (r * 0.48), cy + Math.sin(hourAngle) * (r * 0.48));
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // Minučių rodyklė
  const minAngle = (v.minute / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(minAngle) * (r * 0.74), cy + Math.sin(minAngle) * (r * 0.74));
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = '#e11d48';
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  if (v.badgeText) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    drawRoundedRect(ctx, w - 82, 10, 74, 22, 8);
    ctx.fill();
    ctx.fillStyle = '#7dd3fc';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(v.badgeText, w - 45, 21);
  }
  ctx.restore();
}

function drawCoin(ctx, cx, cy, cents) {
  const isEuro = cents >= 100;
  const r = cents === 200 ? 28 : cents === 100 ? 25 : cents === 50 ? 24 : 21;
  ctx.save();
  if (isEuro) {
    ctx.fillStyle = cents === 200 ? '#cbd5e1' : '#facc15';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cents === 200 ? '#facc15' : '#e2e8f0';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cents >= 100 ? `${cents / 100} €` : `${cents} ct`, cx, cy);
  ctx.restore();
}

function drawCoinsVisual(ctx, w, h, v) {
  if (v.type === 'coins_sum') {
    const count = v.coins.length;
    const spacing = Math.min(82, (w - 40) / count);
    const startX = w * 0.5 - ((count - 1) * spacing) / 2;
    v.coins.forEach((c, idx) => {
      drawCoin(ctx, startX + idx * spacing, h * 0.5, c);
      if (idx < count - 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', startX + idx * spacing + spacing * 0.5, h * 0.5);
      }
    });
    return;
  }

  // Banknote & item cost visual
  ctx.save();
  ctx.fillStyle = v.paid === 5 ? '#64748b' : '#f43f5e';
  drawRoundedRect(ctx, 28, 32, 114, 72, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${v.paid} €`, 85, 68);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('−', 160, 68);

  ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
  drawRoundedRect(ctx, 180, 32, 110, 72, 10);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.stroke();
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('🧃 Sultys', 235, 53);
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(`${v.price} €`, 235, 81);
  ctx.restore();
}

function drawInequalityVisual(ctx, w, h, v) {
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
  drawRoundedRect(ctx, 20, 40, 108, 66, 12);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  drawRoundedRect(ctx, 138, 49, 44, 48, 10);
  ctx.fill();

  ctx.fillStyle = 'rgba(74, 222, 128, 0.16)';
  drawRoundedRect(ctx, 192, 40, 108, 66, 12);
  ctx.fill();
  ctx.strokeStyle = '#4ade80';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(v.leftText, 74, 73);
  ctx.fillText(v.rightText, 246, 73);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('?', 160, 73);
  ctx.restore();
}

function drawSequenceVisual(ctx, w, h, v) {
  ctx.save();
  const count = v.items.length;
  const boxW = Math.min(48, (w - 24) / count - 6);
  const totalW = count * (boxW + 6) - 6;
  const startX = (w - totalW) * 0.5;

  v.items.forEach((item, idx) => {
    const x = startX + idx * (boxW + 6);
    const isUnknown = item === '?';
    const isOp = item === '+' || item === '-' || item === '=';
    if (!isOp) {
      ctx.fillStyle = isUnknown ? '#facc15' : 'rgba(148, 163, 184, 0.22)';
      drawRoundedRect(ctx, x, 46, boxW, 50, 10);
      ctx.fill();
      ctx.strokeStyle = isUnknown ? '#fde047' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.fillStyle = isUnknown ? '#0f172a' : '#f8fafc';
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(item), x + boxW * 0.5, 71);
  });
  ctx.restore();
}

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

function drawRectShape(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x, y, w, h);
}

function drawCircleShape(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

function drawGeometryVisual(ctx, w, h, v) {
  ctx.save();
  const layout = v.preset.layout;
  if (layout === 'house_trees') {
    // 3 triangles (1 house roof + 2 pines), 2 squares (house wall + window), 2 circles (sun + bush)
    drawRectShape(ctx, 70, 74, 62, 54, '#f59e0b');
    drawRectShape(ctx, 90, 90, 22, 22, '#38bdf8');
    drawTriangle(ctx, 62, 74, 101, 34, 140, 74, '#ef4444');
    drawTriangle(ctx, 186, 128, 206, 62, 226, 128, '#22c55e');
    drawTriangle(ctx, 240, 128, 260, 56, 280, 128, '#16a34a');
    drawCircleShape(ctx, 36, 30, 14, '#facc15');
    drawCircleShape(ctx, 158, 114, 12, '#4ade80');
  } else if (layout === 'train') {
    // 2 triangles (cowcatcher + flag), 4 quads (loco, cab, wagon, chimney), 2 circles (wheels)
    drawRectShape(ctx, 64, 66, 86, 44, '#3b82f6');
    drawRectShape(ctx, 116, 42, 34, 24, '#60a5fa');
    drawRectShape(ctx, 74, 42, 16, 24, '#f97316');
    drawRectShape(ctx, 174, 72, 78, 38, '#22c55e');
    drawTriangle(ctx, 42, 110, 64, 80, 64, 110, '#facc15');
    drawTriangle(ctx, 252, 72, 278, 86, 252, 100, '#ef4444');
    drawCircleShape(ctx, 88, 120, 12, '#cbd5e1');
    drawCircleShape(ctx, 212, 120, 12, '#cbd5e1');
  } else if (layout === 'rockets') {
    // 4 triangles (2 noses + 2 fins), 2 squares (bodies), 1 circle (moon)
    drawRectShape(ctx, 78, 56, 32, 62, '#e2e8f0');
    drawTriangle(ctx, 78, 56, 94, 24, 110, 56, '#ef4444');
    drawTriangle(ctx, 62, 118, 78, 92, 78, 118, '#f59e0b');
    drawRectShape(ctx, 172, 62, 32, 56, '#38bdf8');
    drawTriangle(ctx, 172, 62, 188, 30, 204, 62, '#a855f7');
    drawTriangle(ctx, 204, 118, 204, 92, 220, 118, '#f59e0b');
    drawCircleShape(ctx, 266, 42, 18, '#fde047');
  } else {
    // caterpillar: 5 circles, 2 triangles (ears/crown), 2 quads (grass pots)
    [82, 112, 142, 172, 202].forEach((cx, i) => {
      drawCircleShape(ctx, cx, i === 0 ? 70 : 80, i === 0 ? 18 : 15, i === 0 ? '#f43f5e' : '#4ade80');
    });
    drawTriangle(ctx, 70, 52, 78, 34, 86, 52, '#facc15');
    drawTriangle(ctx, 88, 52, 96, 34, 104, 52, '#facc15');
    drawRectShape(ctx, 240, 86, 24, 34, '#38bdf8');
    drawRectShape(ctx, 272, 92, 24, 28, '#f97316');
  }
  ctx.restore();
}

function drawGridRectVisual(ctx, w, h, v) {
  ctx.save();
  const cell = Math.min(20, Math.floor(150 / v.width), Math.floor(88 / v.height));
  const boxW = v.width * cell;
  const boxH = v.height * cell;
  const x0 = (w - boxW) * 0.5;
  const y0 = (h - boxH) * 0.54;

  ctx.fillStyle = v.mode === 'area' ? 'rgba(74, 222, 128, 0.28)' : 'rgba(56, 189, 248, 0.14)';
  ctx.fillRect(x0, y0, boxW, boxH);

  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= v.width; gx += 1) {
    ctx.beginPath();
    ctx.moveTo(x0 + gx * cell, y0);
    ctx.lineTo(x0 + gx * cell, y0 + boxH);
    ctx.stroke();
  }
  for (let gy = 0; gy <= v.height; gy += 1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0 + gy * cell);
    ctx.lineTo(x0 + boxW, y0 + gy * cell);
    ctx.stroke();
  }

  ctx.strokeStyle = v.mode === 'perimeter' ? '#facc15' : '#4ade80';
  ctx.lineWidth = 3;
  ctx.strokeRect(x0, y0, boxW, boxH);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${v.width} m`, x0 + boxW * 0.5, y0 - 8);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${v.height} m`, x0 - 8, y0 + boxH * 0.5);
  ctx.restore();
}

function drawFractionPieVisual(ctx, w, h, v) {
  ctx.save();
  const cx = w * 0.5;
  const cy = h * 0.5;
  const r = 54;
  const sliceAngle = (Math.PI * 2) / v.denom;

  for (let i = 0; i < v.denom; i += 1) {
    const startA = i * sliceAngle - Math.PI / 2;
    const endA = startA + sliceAngle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startA, endA);
    ctx.closePath();
    ctx.fillStyle = i < v.numer ? '#f97316' : 'rgba(148, 163, 184, 0.22)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f8fafc';
    ctx.stroke();
  }
  ctx.restore();
}

function drawUnitOrExprVisual(ctx, w, h, v) {
  ctx.save();
  const accent = v.accent || '#38bdf8';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
  drawRoundedRect(ctx, 18, 22, w - 36, h - 44, 14);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 21px system-ui, sans-serif';
  ctx.fillText(v.topLabel || v.expr, w * 0.5, h * 0.43);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(v.ruleText || v.hint || '', w * 0.5, h * 0.72);
  ctx.restore();
}

function drawWorldCardVisual(ctx, w, h, v) {
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  drawRoundedRect(ctx, 22, 18, w - 44, h - 36, 16);
  ctx.fill();
  ctx.strokeStyle = v.accent || '#38bdf8';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  if (v.swatch) {
    ctx.fillStyle = v.swatch;
    drawRoundedRect(ctx, 42, 42, 58, 58, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.font = '42px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(v.icon || '✨', 74, h * 0.5);
  }

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(v.cardTitle || '', 120, h * 0.5);
  ctx.restore();
}

export function renderTaskVisual(canvas, task) {
  if (!canvas || !task?.visual) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width || 320;
  const h = canvas.height || 148;
  ctx.clearRect(0, 0, w, h);

  // Subtle backdrop
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  drawRoundedRect(ctx, 2, 2, w - 4, h - 4, 14);
  ctx.fill();

  const v = task.visual;
  switch (v.type) {
    case 'clock':
      drawClockVisual(ctx, w, h, v);
      break;
    case 'coins_sum':
    case 'coins_change':
      drawCoinsVisual(ctx, w, h, v);
      break;
    case 'inequality':
      drawInequalityVisual(ctx, w, h, v);
      break;
    case 'sequence_boxes':
      drawSequenceVisual(ctx, w, h, v);
      break;
    case 'geometry_scene':
      drawGeometryVisual(ctx, w, h, v);
      break;
    case 'grid_rect':
      drawGridRectVisual(ctx, w, h, v);
      break;
    case 'fraction_pie':
      drawFractionPieVisual(ctx, w, h, v);
      break;
    case 'unit_bridge':
    case 'expression_card':
      drawUnitOrExprVisual(ctx, w, h, v);
      break;
    case 'world_card':
      drawWorldCardVisual(ctx, w, h, v);
      break;
    default:
      break;
  }
}
