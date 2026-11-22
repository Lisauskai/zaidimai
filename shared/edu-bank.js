// ==================== BENDRAS UŽDAVINIŲ BANKAS (BOSAS.EU) ====================
// 1 klasė (Linas) ir 3 klasė (Lukas): ~80 % matematika, ~20 % bendraloginiai / pasaulio pažinimas.
// Suderinamas su ES moduliais (`export`) ir pasiekiamas per `window.BosasEduBank`.

export const PROFILES = Object.freeze({
  linas: Object.freeze({
    id: 'linas',
    grade: 1,
    label: '1 klasė (Linas)',
    mathRatio: 0.8
  }),
  lukas: Object.freeze({
    id: 'lukas',
    grade: 3,
    label: '3 klasė (Lukas)',
    mathRatio: 0.8
  })
});

export const CATEGORIES = Object.freeze({
  linas: Object.freeze([
    { id: 'clock', domain: 'math', topicLabel: 'Laikrodis' },
    { id: 'money', domain: 'math', topicLabel: 'Eurai ir grąža' },
    { id: 'inequality', domain: 'math', topicLabel: 'Nelygybės' },
    { id: 'missing', domain: 'math', topicLabel: 'Trūkstamas skaičius' },
    { id: 'sequence', domain: 'math', topicLabel: 'Skaičių sekos' },
    { id: 'geometry', domain: 'math', topicLabel: 'Geometrija' },
    { id: 'double_half_scale', domain: 'math', topicLabel: 'Dvigubai, pusė ir svarstyklės' },
    { id: 'word_problem', domain: 'math', topicLabel: 'Tekstinis uždavinys' },
    { id: 'calendar', domain: 'math', topicLabel: 'Kalendorius ir laikas' },
    { id: 'verbal_logic', domain: 'general', topicLabel: 'Žodinė logika' },
    { id: 'nature', domain: 'general', topicLabel: 'Gamta ir aplinka' },
    { id: 'safety', domain: 'general', topicLabel: 'Saugumas ir kasdienybė' },
    { id: 'music_english', domain: 'general', topicLabel: 'Muzika ir anglų k.' }
  ]),
  lukas: Object.freeze([
    { id: 'clock_time', domain: 'math', topicLabel: 'Laikrodis ir laikas' },
    { id: 'units', domain: 'math', topicLabel: 'Matavimo vienetai' },
    { id: 'perimeter_area', domain: 'math', topicLabel: 'Perimetras ir plotas' },
    { id: 'fractions', domain: 'math', topicLabel: 'Trupmenos' },
    { id: 'order_of_ops', domain: 'math', topicLabel: 'Veiksmų tvarka' },
    { id: 'division_remainder', domain: 'math', topicLabel: 'Dalyba su liekana' },
    { id: 'sequences_equations', domain: 'math', topicLabel: 'Sekos ir lygtys' },
    { id: 'word_problem_2step', domain: 'math', topicLabel: 'Dviejų veiksmų uždavinys' },
    { id: 'compass', domain: 'math', topicLabel: 'Kompasas ir kryptys' },
    { id: 'deduction_analogies', domain: 'general', topicLabel: 'Logika ir analogijos' },
    { id: 'geography_nature', domain: 'general', topicLabel: 'Lietuva, geografija ir gamta' },
    { id: 'music_english_3', domain: 'general', topicLabel: 'Muzika ir anglų k.' },
    { id: 'digital_safety', domain: 'general', topicLabel: 'Skaitmeninis saugumas ir sveikata' }
  ])
});

// ==================== PAGALBINĖS FUNKCIJOS ====================

export function normalizeProfile(profileOrGrade) {
  if (profileOrGrade === 3 || profileOrGrade === '3' || profileOrGrade === 'lukas') {
    return 'lukas';
  }
  if (typeof profileOrGrade === 'string' && profileOrGrade.toLowerCase().includes('luk')) {
    return 'lukas';
  }
  return 'linas';
}

export function getCategories(profileOrGrade) {
  return CATEGORIES[normalizeProfile(profileOrGrade)];
}

function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle(arr, rng = Math.random) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatTime(h, m) {
  return `${h}:${pad2(m)}`;
}

function isCleanOption(val) {
  if (val === null || val === undefined) return false;
  const s = String(val).trim();
  if (!s) return false;
  if (s === 'NaN' || s === 'undefined' || s === 'null') return false;
  if (/\bNaN\b|\bundefined\b/.test(s)) return false;
  return true;
}

function uniqueNumericOptions(correct, candidates, minVal, maxVal, formatFn, rng = Math.random) {
  const fmt = formatFn || ((v) => String(v));
  const correctStr = fmt(correct);
  const set = new Set([correctStr]);
  const distractors = [];

  for (const c of candidates) {
    if (typeof c !== 'number' || Number.isNaN(c)) continue;
    if (c < minVal || c > maxVal) continue;
    const s = fmt(c);
    if (!set.has(s) && isCleanOption(s)) {
      set.add(s);
      distractors.push(s);
      if (distractors.length === 3) break;
    }
  }

  let guard = 0;
  while (distractors.length < 3 && guard < 120) {
    guard += 1;
    const offset = randInt(1, Math.max(4, Math.min(12, maxVal - minVal)), rng);
    const cand = rng() < 0.5 ? correct + offset : correct - offset;
    if (cand < minVal || cand > maxVal) continue;
    const s = fmt(cand);
    if (!set.has(s) && isCleanOption(s)) {
      set.add(s);
      distractors.push(s);
    }
  }

  let linear = minVal;
  while (distractors.length < 3 && linear <= maxVal + 20) {
    const s = fmt(linear);
    if (!set.has(s) && isCleanOption(s)) {
      set.add(s);
      distractors.push(s);
    }
    linear += 1;
  }

  return buildShuffledOptions(correctStr, distractors.slice(0, 3), rng);
}

function buildShuffledOptions(correctStr, distractors, rng = Math.random) {
  const cleanCorrect = String(correctStr).trim();
  const pool = [cleanCorrect];
  const seen = new Set([cleanCorrect]);

  for (const d of distractors) {
    const s = String(d).trim();
    if (isCleanOption(s) && !seen.has(s)) {
      seen.add(s);
      pool.push(s);
    }
    if (pool.length === 4) break;
  }

  const shuffled = shuffle(pool, rng);
  const correctIndex = shuffled.indexOf(cleanCorrect);
  return { options: shuffled, correctIndex };
}

function makeTask({
  id,
  templateId,
  profile,
  domain,
  category,
  topicLabel,
  prompt,
  visualSpec = null,
  options,
  correctIndex,
  explanation
}) {
  const grade = profile === 'lukas' ? 3 : 1;
  return {
    id,
    templateId: templateId || `${profile}:${category}`,
    profile,
    grade,
    domain,
    category,
    topicLabel,
    prompt: String(prompt).trim(),
    visualSpec: visualSpec || null,
    options,
    correctIndex,
    explanation: String(explanation).trim()
  };
}

function validateTask(task) {
  if (!task || typeof task !== 'object') return false;
  if (!task.id || !task.category || !task.topicLabel || !task.prompt) return false;
  if (!Array.isArray(task.options) || task.options.length !== 4) return false;
  if (typeof task.correctIndex !== 'number' || task.correctIndex < 0 || task.correctIndex > 3) {
    return false;
  }
  if (!task.explanation || !String(task.explanation).trim()) return false;
  const unique = new Set();
  for (const opt of task.options) {
    if (!isCleanOption(opt)) return false;
    unique.add(String(opt).trim());
  }
  return unique.size === 4;
}

// ==================== 1 KLASĖ (LINAS) – MATEMATIKA (9 KATEGORIJOS) ====================

function genLinasClock(rng) {
  const hours = randInt(1, 12, rng);
  const minutes = rng() < 0.5 ? 0 : 30;
  const correctStr = formatTime(hours, minutes);

  const altHour1 = (hours % 12) + 1;
  const altHour2 = hours === 1 ? 12 : hours - 1;
  const otherMin = minutes === 0 ? 30 : 0;

  const distractors = [
    formatTime(hours, otherMin),
    formatTime(altHour1, minutes),
    formatTime(altHour2, minutes),
    formatTime(altHour1, otherMin)
  ];

  const { options, correctIndex } = buildShuffledOptions(correctStr, distractors, rng);
  const explanation =
    minutes === 0
      ? `Ilgoji rodyklė rodo į 12 (pilna valanda), o trumpoji – į ${hours}, todėl yra ${correctStr}.`
      : `Ilgoji rodyklė rodo į 6 (pusvalandis – 30 min.), o trumpoji jau praėjo ${hours}, todėl yra ${correctStr}.`;

  return makeTask({
    id: `linas:clock:${hours}:${minutes}`,
    templateId: `linas:clock:${minutes === 0 ? 'full' : 'half'}`,
    profile: 'linas',
    domain: 'math',
    category: 'clock',
    topicLabel: 'Laikrodis',
    prompt: 'Kiek valandų rodo laikrodis?',
    visualSpec: { type: 'clock', hours, minutes, is24h: false },
    options,
    correctIndex,
    explanation
  });
}

function splitIntoEuroCoins(amount) {
  const denoms = [10, 5, 2, 1];
  const coins = [];
  let rem = amount;
  for (const d of denoms) {
    while (rem >= d) {
      coins.push(d);
      rem -= d;
    }
  }
  return coins;
}

function genLinasMoney(rng) {
  const mode = pick(['sum', 'change', 'count'], rng);
  const shopItems = [
    { name: 'obuolys', icon: '🍎' },
    { name: 'ledai', icon: '🍦' },
    { name: 'knygelė', icon: '📘' },
    { name: 'mašinėlė', icon: '🚗' },
    { name: 'kamuolys', icon: '⚽' },
    { name: 'pieštukai', icon: '🖍️' },
    { name: 'sultys', icon: '🧃' },
    { name: 'bandelė', icon: '🥐' }
  ];

  if (mode === 'sum') {
    const picked = shuffle(shopItems, rng).slice(0, 2);
    const p1 = randInt(2, 11, rng);
    const p2 = randInt(2, Math.min(10, 20 - p1), rng);
    const total = p1 + p2;
    const { options, correctIndex } = uniqueNumericOptions(
      total,
      [total + 1, total - 1, total + 2, total - 2, Math.abs(p1 - p2) + 2],
      2,
      20,
      (v) => `${v} €`,
      rng
    );
    return makeTask({
      id: `linas:money:sum:${p1}:${p2}`,
      templateId: 'linas:money:sum',
      profile: 'linas',
      domain: 'math',
      category: 'money',
      topicLabel: 'Eurai ir grąža',
      prompt: `Kiek iš viso kainuoja ${picked[0].name} (${p1} €) ir ${picked[1].name} (${p2} €)?`,
      visualSpec: {
        type: 'money',
        mode: 'sum',
        items: [
          { label: picked[0].name, price: p1 },
          { label: picked[1].name, price: p2 }
        ]
      },
      options,
      correctIndex,
      explanation: `Sudėkime abiejų prekių kainas: ${p1} € + ${p2} € = ${total} €.`
    });
  }

  if (mode === 'change') {
    const paid = rng() < 0.55 ? 10 : 20;
    const item = pick(shopItems, rng);
    const price = paid === 10 ? randInt(2, 9, rng) : randInt(6, 17, rng);
    const change = paid - price;
    const { options, correctIndex } = uniqueNumericOptions(
      change,
      [change + 1, change - 1, change + 2, change - 2, price],
      1,
      19,
      (v) => `${v} €`,
      rng
    );
    return makeTask({
      id: `linas:money:change:${paid}:${price}`,
      templateId: 'linas:money:change',
      profile: 'linas',
      domain: 'math',
      category: 'money',
      topicLabel: 'Eurai ir grąža',
      prompt: `Prekė (${item.name}) kainuoja ${price} €. Sumokėjai ${paid} € banknotu. Kiek liks grąžos?`,
      visualSpec: {
        type: 'money',
        mode: 'change',
        paid,
        price,
        label: item.name
      },
      options,
      correctIndex,
      explanation: `Iš ${paid} € atimkime kainą ${price} €: ${paid} - ${price} = ${change} €.`
    });
  }

  // mode === 'count'
  const total = randInt(4, 19, rng);
  const coins = splitIntoEuroCoins(total);
  const { options, correctIndex } = uniqueNumericOptions(
    total,
    [total + 1, total - 1, total + 2, total - 2, total + 3],
    2,
    20,
    (v) => `${v} €`,
    rng
  );
  return makeTask({
    id: `linas:money:count:${coins.join('_')}`,
    templateId: 'linas:money:count',
    profile: 'linas',
    domain: 'math',
    category: 'money',
    topicLabel: 'Eurai ir grąža',
    prompt: 'Kiek iš viso eurų pavaizduota paveikslėlyje?',
    visualSpec: {
      type: 'money',
      mode: 'count',
      coins
    },
    options,
    correctIndex,
    explanation: `Sudėkime visus pinigus: ${coins.map((c) => `${c} €`).join(' + ')} = ${total} €.`
  });
}

function genLinasInequality(rng) {
  const subtype = rng() < 0.65 ? 'pick_true' : 'which_greater';

  if (subtype === 'pick_true') {
    const useSub = rng() < 0.4;
    let a, b, val, expr;
    if (useSub) {
      a = randInt(10, 20, rng);
      b = randInt(2, a - 2, rng);
      val = a - b;
      expr = `${a} - ${b}`;
    } else {
      a = randInt(3, 12, rng);
      b = randInt(2, 20 - a, rng);
      val = a + b;
      expr = `${a} + ${b}`;
    }

    const rel = pick(['<', '>', '='], rng);
    let rhs = val;
    if (rel === '<') rhs = Math.min(20, val + randInt(1, 4, rng));
    if (rel === '>') rhs = Math.max(1, val - randInt(1, 4, rng));
    const trueRel = val < rhs ? '<' : val > rhs ? '>' : '=';

    const correctStr = `${expr} ${trueRel} ${rhs}`;
    const falseSigns = ['<', '>', '='].filter((s) => s !== trueRel);
    const distractors = [
      `${expr} ${falseSigns[0]} ${rhs}`,
      `${expr} ${falseSigns[1]} ${rhs}`,
      `${expr} = ${val + (val < 19 ? 2 : -2)}`
    ];

    const { options, correctIndex } = buildShuffledOptions(correctStr, distractors, rng);
    return makeTask({
      id: `linas:ineq:true:${expr}:${rhs}`,
      templateId: 'linas:ineq:true',
      profile: 'linas',
      domain: 'math',
      category: 'inequality',
      topicLabel: 'Nelygybės',
      prompt: 'Kuris palyginimas yra TEISINGAS?',
      options,
      correctIndex,
      explanation: `Apskaičiuojame kairę pusę: ${expr} = ${val}. Kadangi ${val} ${trueRel} ${rhs}, teisinga yra „${correctStr}“.`
    });
  }

  // subtype === 'which_greater'
  const askGreater = rng() < 0.5;
  const target = randInt(8, 15, rng);
  const correctVal = askGreater
    ? randInt(target + 1, Math.min(20, target + 5), rng)
    : randInt(Math.max(3, target - 5), target - 1, rng);

  const makeExprFor = (v) => {
    if (rng() < 0.5 && v >= 5) {
      const x = randInt(2, v - 2, rng);
      return `${x} + ${v - x}`;
    }
    const y = randInt(2, Math.min(8, 20 - v), rng);
    return `${v + y} - ${y}`;
  };

  const correctExpr = makeExprFor(correctVal);
  const wrongVals = new Set();
  let guard = 0;
  while (wrongVals.size < 3 && guard < 50) {
    guard += 1;
    const wv = askGreater ? randInt(2, target, rng) : randInt(target, 20, rng);
    if (wv !== correctVal) wrongVals.add(wv);
  }
  const distractors = [...wrongVals].map((v) => makeExprFor(v));
  const { options, correctIndex } = buildShuffledOptions(correctExpr, distractors, rng);

  return makeTask({
    id: `linas:ineq:${askGreater ? 'gt' : 'lt'}:${target}:${correctExpr}`,
    templateId: `linas:ineq:${askGreater ? 'gt' : 'lt'}`,
    profile: 'linas',
    domain: 'math',
    category: 'inequality',
    topicLabel: 'Nelygybės',
    prompt: askGreater
      ? `Kuris reiškinys yra DIDESNIS už ${target}?`
      : `Kuris reiškinys yra MAŽESNIS už ${target}?`,
    options,
    correctIndex,
    explanation: `${correctExpr} = ${correctVal}, o ${correctVal} ${askGreater ? '>' : '<'} ${target}.`
  });
}

function genLinasMissing(rng) {
  const form = pick(['left_add', 'right_add', 'right_sub', 'left_sub'], rng);
  let prompt = '';
  let answer = 0;
  let explanation = '';
  let idPart = '';

  if (form === 'left_add') {
    answer = randInt(2, 12, rng);
    const b = randInt(2, 20 - answer, rng);
    const sum = answer + b;
    prompt = `Koks skaičius paslėptas vietoj klaustuko?\n? + ${b} = ${sum}`;
    explanation = `Norėdami rasti trūkstamą dėmenį, atimame: ${sum} - ${b} = ${answer}.`;
    idPart = `la:${b}:${sum}`;
  } else if (form === 'right_add') {
    const a = randInt(2, 12, rng);
    answer = randInt(2, 20 - a, rng);
    const sum = a + answer;
    prompt = `Koks skaičius paslėptas vietoj klaustuko?\n${a} + ? = ${sum}`;
    explanation = `Skaičiuojame: ${sum} - ${a} = ${answer}. Patikrinimas: ${a} + ${answer} = ${sum}.`;
    idPart = `ra:${a}:${sum}`;
  } else if (form === 'right_sub') {
    const a = randInt(10, 20, rng);
    answer = randInt(2, a - 2, rng);
    const diff = a - answer;
    prompt = `Koks skaičius paslėptas vietoj klaustuko?\n${a} - ? = ${diff}`;
    explanation = `Skaičiuojame: ${a} - ${diff} = ${answer}. Patikrinimas: ${a} - ${answer} = ${diff}.`;
    idPart = `rs:${a}:${diff}`;
  } else {
    const b = randInt(2, 9, rng);
    const diff = randInt(2, 20 - b, rng);
    answer = b + diff;
    prompt = `Koks skaičius paslėptas vietoj klaustuko?\n? - ${b} = ${diff}`;
    explanation = `Sudėkime: ${diff} + ${b} = ${answer}. Patikrinimas: ${answer} - ${b} = ${diff}.`;
    idPart = `ls:${b}:${diff}`;
  }

  const { options, correctIndex } = uniqueNumericOptions(
    answer,
    [answer + 1, answer - 1, answer + 2, answer - 2, answer + 3],
    1,
    20,
    null,
    rng
  );

  return makeTask({
    id: `linas:missing:${idPart}`,
    templateId: `linas:missing:${form}`,
    profile: 'linas',
    domain: 'math',
    category: 'missing',
    topicLabel: 'Trūkstamas skaičius',
    prompt,
    options,
    correctIndex,
    explanation
  });
}

function genLinasSequence(rng) {
  const step = pick([2, 3, -2, -3], rng);
  let start;
  if (step > 0) {
    start = randInt(1, 20 - step * 3, rng);
  } else {
    start = randInt(Math.abs(step) * 3 + 1, 20, rng);
  }
  const n1 = start;
  const n2 = start + step;
  const n3 = start + step * 2;
  const answer = start + step * 3;

  const { options, correctIndex } = uniqueNumericOptions(
    answer,
    [answer + 1, answer - 1, answer + Math.abs(step), answer - Math.abs(step), n3],
    0,
    22,
    null,
    rng
  );

  const stepText = step > 0 ? `didėja po ${step}` : `mažėja po ${Math.abs(step)}`;
  return makeTask({
    id: `linas:seq:${start}:${step}`,
    templateId: `linas:seq:${step}`,
    profile: 'linas',
    domain: 'math',
    category: 'sequence',
    topicLabel: 'Skaičių sekos',
    prompt: `Pratęsk skaičių seką:\n${n1}, ${n2}, ${n3}, ?`,
    options,
    correctIndex,
    explanation: `Skaičiai sekoje ${stepText}. Todėl ${n3} ${step > 0 ? '+' : '-'} ${Math.abs(step)} = ${answer}.`
  });
}

function genLinasGeometry(rng) {
  if (rng() < 0.55) {
    // Count specific shape in a colorful composite picture
    const shapeTypes = [
      { key: 'triangle', plural: 'trikampių', singular: 'trikampis' },
      { key: 'square', plural: 'kvadratų', singular: 'kvadratas' },
      { key: 'circle', plural: 'apskritimų', singular: 'apskritimas' }
    ];
    const target = pick(shapeTypes, rng);
    const targetCount = randInt(2, 5, rng);
    const shapes = [];
    for (let i = 0; i < targetCount; i += 1) {
      shapes.push(target.key);
    }
    const others = shapeTypes.filter((s) => s.key !== target.key);
    const extraCount = randInt(3, 5, rng);
    for (let i = 0; i < extraCount; i += 1) {
      shapes.push(pick(others, rng).key);
    }
    const mixed = shuffle(shapes, rng);

    const { options, correctIndex } = uniqueNumericOptions(
      targetCount,
      [targetCount + 1, targetCount - 1, targetCount + 2, mixed.length],
      1,
      10,
      null,
      rng
    );

    return makeTask({
      id: `linas:geom:count:${target.key}:${targetCount}:${extraCount}`,
      templateId: `linas:geom:count:${target.key}`,
      profile: 'linas',
      domain: 'math',
      category: 'geometry',
      topicLabel: 'Geometrija',
      prompt: `Kiek ${target.plural} pavaizduota paveikslėlyje?`,
      visualSpec: { type: 'shapes_count', shapes: mixed, target: target.key },
      options,
      correctIndex,
      explanation: `Suskaičiavus visas figūras paveikslėlyje, ${target.plural} yra tiksliai ${targetCount}.`
    });
  }

  // Single shape properties (corners / sides / name)
  const defs = [
    { key: 'triangle', name: 'Trikampis', corners: 3, sides: 3 },
    { key: 'square', name: 'Kvadratas', corners: 4, sides: 4 },
    { key: 'rectangle', name: 'Stačiakampis', corners: 4, sides: 4 },
    { key: 'pentagon', name: 'Penkiakampis', corners: 5, sides: 5 },
    { key: 'circle', name: 'Apskritimas', corners: 0, sides: 0 }
  ];
  const chosen = pick(defs, rng);

  if (rng() < 0.5) {
    const { options, correctIndex } = uniqueNumericOptions(
      chosen.corners,
      [chosen.corners + 1, chosen.corners - 1, chosen.corners + 2, 6, 3, 4, 0],
      0,
      8,
      null,
      rng
    );
    return makeTask({
      id: `linas:geom:corners:${chosen.key}`,
      templateId: 'linas:geom:corners',
      profile: 'linas',
      domain: 'math',
      category: 'geometry',
      topicLabel: 'Geometrija',
      prompt: `Kiek kampų turi ši figūra (${chosen.name.toLowerCase()})?`,
      visualSpec: { type: 'shape_single', shape: chosen.key },
      options,
      correctIndex,
      explanation:
        chosen.corners === 0
          ? 'Apskritimas yra apvalus ir neturi nė vieno kampo (0).'
          : `${chosen.name} turi ${chosen.corners} kampus.`
    });
  }

  const distractors = defs.filter((d) => d.key !== chosen.key).map((d) => d.name);
  const { options, correctIndex } = buildShuffledOptions(chosen.name, shuffle(distractors, rng).slice(0, 3), rng);
  return makeTask({
    id: `linas:geom:name:${chosen.key}`,
    templateId: 'linas:geom:name',
    profile: 'linas',
    domain: 'math',
    category: 'geometry',
    topicLabel: 'Geometrija',
    prompt: 'Kaip vadinasi ši geometrinė figūra?',
    visualSpec: { type: 'shape_single', shape: chosen.key },
    options,
    correctIndex,
    explanation: `Paveikslėlyje pavaizduotas ${chosen.name.toLowerCase()}.`
  });
}

function genLinasDoubleHalfScale(rng) {
  const mode = pick(['double', 'half', 'scale'], rng);

  if (mode === 'double') {
    const n = randInt(2, 10, rng);
    const ans = n * 2;
    const { options, correctIndex } = uniqueNumericOptions(
      ans,
      [ans + 2, ans - 2, n + 2, ans + 1, ans - 1],
      2,
      20,
      null,
      rng
    );
    return makeTask({
      id: `linas:dhs:double:${n}`,
      templateId: 'linas:dhs:double',
      profile: 'linas',
      domain: 'math',
      category: 'double_half_scale',
      topicLabel: 'Dvigubai, pusė ir svarstyklės',
      prompt: `Kiek yra dvigubai daugiau nei ${n}?`,
      options,
      correctIndex,
      explanation: `Dvigubai daugiau reiškia sudėti skaičių su pačiu savimi: ${n} + ${n} = ${ans}.`
    });
  }

  if (mode === 'half') {
    const ans = randInt(2, 10, rng);
    const n = ans * 2;
    const { options, correctIndex } = uniqueNumericOptions(
      ans,
      [ans + 1, ans - 1, ans + 2, n - 2],
      1,
      18,
      null,
      rng
    );
    return makeTask({
      id: `linas:dhs:half:${n}`,
      templateId: 'linas:dhs:half',
      profile: 'linas',
      domain: 'math',
      category: 'double_half_scale',
      topicLabel: 'Dvigubai, pusė ir svarstyklės',
      prompt: `Kiek yra pusė skaičiaus ${n}?`,
      options,
      correctIndex,
      explanation: `Padalijus ${n} į dvi lygias dalis gauname ${ans}, nes ${ans} + ${ans} = ${n}.`
    });
  }

  // Visual balance scale up to 15 kg
  const total = randInt(7, 15, rng);
  const leftA = randInt(2, total - 2, rng);
  const leftB = total - leftA;
  const rightKnown = randInt(2, total - 2, rng);
  const ans = total - rightKnown;

  const { options, correctIndex } = uniqueNumericOptions(
    ans,
    [ans + 1, ans - 1, ans + 2, total],
    1,
    15,
    (v) => `${v} kg`,
    rng
  );

  return makeTask({
    id: `linas:dhs:scale:${leftA}:${leftB}:${rightKnown}`,
    templateId: 'linas:dhs:scale',
    profile: 'linas',
    domain: 'math',
    category: 'double_half_scale',
    topicLabel: 'Dvigubai, pusė ir svarstyklės',
    prompt: 'Svarstyklės yra pusiausvyroje. Kiek sveria nežinomas svarelis (?)?',
    visualSpec: {
      type: 'scale',
      left: [leftA, leftB],
      right: [rightKnown, '?'],
      unit: 'kg'
    },
    options,
    correctIndex,
    explanation: `Kairėje lėkštelėje yra ${leftA} + ${leftB} = ${total} kg. Kad dešinėje būtų tiek pat, trūksta ${total} - ${rightKnown} = ${ans} kg.`
  });
}

function genLinasWordProblem(rng) {
  const templates = [
    () => {
      const a = randInt(5, 11, rng);
      const b = randInt(3, 20 - a, rng);
      const ans = a + b;
      return {
        key: `bushes:${a}:${b}`,
        prompt: `Kieme augo ${a} šilauogių krūmai. Pavasarį pasodino dar ${b}. Kiek šilauogių krūmų dabar auga kieme?`,
        ans,
        explanation: `Sudėkime buvusius ir pasodintus krūmus: ${a} + ${b} = ${ans}.`
      };
    },
    () => {
      const a = randInt(11, 20, rng);
      const b = randInt(3, a - 2, rng);
      const ans = a - b;
      return {
        key: `cards:${a}:${b}`,
        prompt: `Linas turėjo ${a} žaidimų kortelių, o ${b} padovanojo draugui. Kiek kortelių liko Linui?`,
        ans,
        explanation: `Iš turėtų kortelių atimame padovanotas: ${a} - ${b} = ${ans}.`
      };
    },
    () => {
      const a = randInt(4, 12, rng);
      const b = randInt(3, 20 - a, rng);
      const ans = a + b;
      return {
        key: `birds:${a}:${b}`,
        prompt: `Ant šakos tupėjo ${a} zylutės. Netrukus atskrido dar ${b} zylutės. Kiek paukštelių dabar tupi ant šakos?`,
        ans,
        explanation: `Pridėkime atskridusias zylutes: ${a} + ${b} = ${ans}.`
      };
    },
    () => {
      const a = randInt(10, 19, rng);
      const b = randInt(2, a - 3, rng);
      const ans = a - b;
      return {
        key: `apples:${a}:${b}`,
        prompt: `Pintinėje buvo ${a} obuoliai. Šeima suvalgė ${b} obuolius. Kiek obuolių liko pintinėje?`,
        ans,
        explanation: `Atimame suvalgytus obuolius: ${a} - ${b} = ${ans}.`
      };
    },
    () => {
      const a = randInt(6, 13, rng);
      const b = randInt(2, 20 - a, rng);
      const ans = a + b;
      return {
        key: `lego:${a}:${b}`,
        prompt: `Ant stalo gulėjo ${a} mėlynos ir ${b} raudonos LEGO kaladėlės. Kiek iš viso kaladėlių ant stalo?`,
        ans,
        explanation: `Sudėkime abiejų spalvų kaladėles: ${a} + ${b} = ${ans}.`
      };
    },
    () => {
      const a = randInt(10, 18, rng);
      const b = randInt(3, a - 2, rng);
      const ans = a - b;
      return {
        key: `diff:${a}:${b}`,
        prompt: `Miglė surinko ${a} kaštonus, o Matas – ${b} kaštonus. Keliais kaštonais daugiau surinko Miglė?`,
        ans,
        explanation: `Norėdami sužinoti skirtumą, atimame: ${a} - ${b} = ${ans}.`
      };
    }
  ];

  const data = pick(templates, rng)();
  const { options, correctIndex } = uniqueNumericOptions(
    data.ans,
    [data.ans + 1, data.ans - 1, data.ans + 2, data.ans - 2],
    1,
    20,
    null,
    rng
  );

  return makeTask({
    id: `linas:word:${data.key}`,
    templateId: `linas:word:${data.key.split(':')[0]}`,
    profile: 'linas',
    domain: 'math',
    category: 'word_problem',
    topicLabel: 'Tekstinis uždavinys',
    prompt: data.prompt,
    options,
    correctIndex,
    explanation: data.explanation
  });
}

function genLinasCalendar(rng) {
  const days = [
    'Pirmadienis',
    'Antradienis',
    'Trečiadienis',
    'Ketvirtadienis',
    'Penktadienis',
    'Šeštadienis',
    'Sekmadienis'
  ];
  const daysGenitive = [
    'pirmadienio',
    'antradienio',
    'trečiadienio',
    'ketvirtadienio',
    'penktadienio',
    'šeštadienio',
    'sekmadienio'
  ];
  const daysAccusative = [
    'pirmadienį',
    'antradienį',
    'trečiadienį',
    'ketvirtadienį',
    'penktadienį',
    'šeštadienį',
    'sekmadienį'
  ];

  const subtype = pick(['after', 'before', 'facts', 'seasons'], rng);

  if (subtype === 'after') {
    const idx = randInt(0, 6, rng);
    const nextIdx = (idx + 1) % 7;
    const correct = days[nextIdx];
    const distractors = shuffle(
      days.filter((_, i) => i !== nextIdx),
      rng
    ).slice(0, 3);
    const { options, correctIndex } = buildShuffledOptions(correct, distractors, rng);
    return makeTask({
      id: `linas:cal:after:${idx}`,
      templateId: 'linas:cal:after',
      profile: 'linas',
      domain: 'math',
      category: 'calendar',
      topicLabel: 'Kalendorius ir laikas',
      prompt: `Kuri savaitės diena ateina iš karto po ${daysGenitive[idx]}?`,
      options,
      correctIndex,
      explanation: `Po ${daysGenitive[idx]} visada ateina ${correct.toLowerCase()}.`
    });
  }

  if (subtype === 'before') {
    const idx = randInt(0, 6, rng);
    const prevIdx = (idx + 6) % 7;
    const correct = days[prevIdx];
    const distractors = shuffle(
      days.filter((_, i) => i !== prevIdx),
      rng
    ).slice(0, 3);
    const { options, correctIndex } = buildShuffledOptions(correct, distractors, rng);
    return makeTask({
      id: `linas:cal:before:${idx}`,
      templateId: 'linas:cal:before',
      profile: 'linas',
      domain: 'math',
      category: 'calendar',
      topicLabel: 'Kalendorius ir laikas',
      prompt: `Kuri savaitės diena būna prieš ${daysAccusative[idx]}?`,
      options,
      correctIndex,
      explanation: `Prieš ${daysAccusative[idx]} yra ${correct.toLowerCase()}.`
    });
  }

  if (subtype === 'facts') {
    const facts = [
      {
        id: 'days_in_week',
        prompt: 'Kiek dienų turi viena savaitė?',
        correct: '7',
        distractors: ['5', '6', '10'],
        explanation: 'Savaitėje yra 7 dienos: nuo pirmadienio iki sekmadienio.'
      },
      {
        id: 'months_in_year',
        prompt: 'Kiek mėnesių turi vieni metai?',
        correct: '12',
        distractors: ['10', '7', '14'],
        explanation: 'Metuose yra 12 mėnesių: nuo sausio iki gruodžio.'
      },
      {
        id: 'seasons_in_year',
        prompt: 'Kiek metų laikų turi metai?',
        correct: '4',
        distractors: ['3', '5', '6'],
        explanation: 'Metai turi 4 metų laikus: pavasarį, vasarą, rudenį ir žiemą.'
      },
      {
        id: 'weekend_days',
        prompt: 'Kurios dvi dienos yra savaitgalis?',
        correct: 'Šeštadienis ir sekmadienis',
        distractors: [
          'Penktadienis ir šeštadienis',
          'Pirmadienis ir antradienis',
          'Sekmadienis ir pirmadienis'
        ],
        explanation: 'Savaitgalį sudaro šeštadienis ir sekmadienis.'
      }
    ];
    const item = pick(facts, rng);
    const { options, correctIndex } = buildShuffledOptions(item.correct, item.distractors, rng);
    return makeTask({
      id: `linas:cal:fact:${item.id}`,
      templateId: 'linas:cal:fact',
      profile: 'linas',
      domain: 'math',
      category: 'calendar',
      topicLabel: 'Kalendorius ir laikas',
      prompt: item.prompt,
      options,
      correctIndex,
      explanation: item.explanation
    });
  }

  // seasons
  const monthSeasons = [
    { month: 'sausis', season: 'Žiema' },
    { month: 'vasaris', season: 'Žiema' },
    { month: 'kovas', season: 'Pavasaris' },
    { month: 'balandis', season: 'Pavasaris' },
    { month: 'gegužė', season: 'Pavasaris' },
    { month: 'birželis', season: 'Vasara' },
    { month: 'liepa', season: 'Vasara' },
    { month: 'rugpjūtis', season: 'Vasara' },
    { month: 'rugsėjis', season: 'Ruduo' },
    { month: 'spalis', season: 'Ruduo' },
    { month: 'lapkritis', season: 'Ruduo' },
    { month: 'gruodis', season: 'Žiema' }
  ];
  const allSeasons = ['Pavasaris', 'Vasara', 'Ruduo', 'Žiema'];
  const picked = pick(monthSeasons, rng);
  const distractors = allSeasons.filter((s) => s !== picked.season);
  const { options, correctIndex } = buildShuffledOptions(picked.season, distractors, rng);
  return makeTask({
    id: `linas:cal:season:${picked.month}`,
    templateId: 'linas:cal:season',
    profile: 'linas',
    domain: 'math',
    category: 'calendar',
    topicLabel: 'Kalendorius ir laikas',
    prompt: `Kuriam metų laikui priklauso mėnuo ${picked.month}?`,
    options,
    correctIndex,
    explanation: `Mėnuo ${picked.month} priklauso metų laikui – ${picked.season.toLowerCase()}.`
  });
}

// ==================== 1 KLASĖ (LINAS) – BENDRALOGINIAI / PASAULIO PAŽINIMAS (4 KATEGORIJOS) ====================

const LINAS_ODD_ONE_OUT = [
  { id: 'carrot', items: ['Obuolys', 'Kriaušė', 'Bananas', 'Morka'], odd: 'Morka', exp: 'Obuolys, kriaušė ir bananas yra vaisiai, o morka – daržovė.' },
  { id: 'pike', items: ['Šuo', 'Katė', 'Arklys', 'Lydeka'], odd: 'Lydeka', exp: 'Šuo, katė ir arklys gyvena sausumoje, o lydeka yra žuvis.' },
  { id: 'bike', items: ['Kėdė', 'Stalas', 'Spinta', 'Dviratis'], odd: 'Dviratis', exp: 'Kėdė, stalas ir spinta yra baldai, o dviratis – transporto priemonė.' },
  { id: 'shoe', items: ['Kepurė', 'Šalikas', 'Pirštinės', 'Puodelis'], odd: 'Puodelis', exp: 'Kepurė, šalikas ir pirštinės yra drabužiai, o puodelis – indas.' },
  { id: 'plane', items: ['Traukinys', 'Autobusas', 'Automobilis', 'Lėktuvas'], odd: 'Lėktuvas', exp: 'Lėktuvas skrenda oru, o kitos transporto priemonės važiuoja žeme.' },
  { id: 'tulip', items: ['Ąžuolas', 'Beržas', 'Pušis', 'Tulpė'], odd: 'Tulpė', exp: 'Ąžuolas, beržas ir pušis yra medžiai, o tulpė – gėlė.' },
  { id: 'spoon', items: ['Pieštukas', 'Trintukas', 'Sąsiuvinis', 'Šaukštas'], odd: 'Šaukštas', exp: 'Pieštukas, trintukas ir sąsiuvinis yra mokyklinės priemonės, o šaukštas – stalo įrankis.' },
  { id: 'summer', items: ['Sniegas', 'Ledas', 'Sniego senis', 'Braškės'], odd: 'Braškės', exp: 'Sniegas, ledas ir sniego senis siejami su žiema, o braškės noksta vasarą.' },
  { id: 'ant', items: ['Varna', 'Gandras', 'Zylė', 'Skruzdėlė'], odd: 'Skruzdėlė', exp: 'Varna, gandras ir zylė yra paukščiai, o skruzdėlė – vabzdys.' },
  { id: 'bread', items: ['Pienas', 'Sultys', 'Arbata', 'Duona'], odd: 'Duona', exp: 'Pienas, sultys ir arbata yra gėrimai, o duona – maistas.' }
];

function genLinasVerbalLogic(rng) {
  if (rng() < 0.45) {
    // Dynamic 3-person ordering chain
    const names = shuffle(['Tomas', 'Jonas', 'Petras', 'Linas', 'Matas', 'Benas', 'Emilis', 'Kajus'], rng).slice(0, 3);
    const attrs = [
      { more: 'aukštesnis', askMin: 'žemiausias', askMax: 'aukščiausias' },
      { more: 'greitesnis', askMin: 'lėčiausias', askMax: 'greičiausias' },
      { more: 'vyresnis', askMin: 'jauniausias', askMax: 'vyriausias' }
    ];
    const attr = pick(attrs, rng);
    const askLowest = rng() < 0.5;
    const correct = askLowest ? names[2] : names[0];
    const distractors = [names[1], askLowest ? names[0] : names[2], 'Visi vienodi'];
    const { options, correctIndex } = buildShuffledOptions(correct, distractors, rng);
    return makeTask({
      id: `linas:vlogic:chain:${names.join('_')}:${attr.more}:${askLowest ? 'min' : 'max'}`,
      templateId: 'linas:vlogic:chain',
      profile: 'linas',
      domain: 'general',
      category: 'verbal_logic',
      topicLabel: 'Žodinė logika',
      prompt: `${names[0]} yra ${attr.more} už ${names[1]}ą, o ${names[1]} yra ${attr.more} už ${names[2]}ą. Kas yra ${askLowest ? attr.askMin : attr.askMax}?`
        .replace('Tomasą', 'Tomą')
        .replace('Jonasą', 'Joną')
        .replace('Petrasą', 'Petrą')
        .replace('Linasą', 'Liną')
        .replace('Matasą', 'Matą')
        .replace('Benasą', 'Beną')
        .replace('Emilisą', 'Emilį')
        .replace('Kajusą', 'Kajų'),
      options,
      correctIndex,
      explanation: `Eilė nuo labiausiai iki mažiausiai: ${names[0]} → ${names[1]} → ${names[2]}. Todėl ${askLowest ? attr.askMin : attr.askMax} yra ${correct}.`
    });
  }

  const item = pick(LINAS_ODD_ONE_OUT, rng);
  const distractors = item.items.filter((x) => x !== item.odd);
  const { options, correctIndex } = buildShuffledOptions(item.odd, distractors, rng);
  return makeTask({
    id: `linas:vlogic:odd:${item.id}`,
    templateId: 'linas:vlogic:odd',
    profile: 'linas',
    domain: 'general',
    category: 'verbal_logic',
    topicLabel: 'Žodinė logika',
    prompt: `Kuris žodis čia NETINKA?\n${item.items.join(', ')}`,
    options,
    correctIndex,
    explanation: item.exp
  });
}

const LINAS_NATURE_BANK = [
  { id: 'hibernate_bear', prompt: 'Kuris Lietuvos miško gyvūnas žiemą miega žiemos miegu?', correct: 'Ežys', distractors: ['Vilkas', 'Kiškis', 'Stirna'], exp: 'Ežiai (taip pat meškos ir barsukai) žiemą užmiega žiemos miegu.' },
  { id: 'oak_acorn', prompt: 'Kurio medžio vaisius yra gilė?', correct: 'Ąžuolo', distractors: ['Beržo', 'Pušies', 'Klevo'], exp: 'Gilės auga ant ąžuolo – tvirto Lietuvos medžio.' },
  { id: 'pine_cone', prompt: 'Kuris medis žiemą lieka žalias ir turi spyglius?', correct: 'Pušis', distractors: ['Beržas', 'Liepa', 'Ąžuolas'], exp: 'Pušis yra spygliuotis medis, todėl žiemą nenumeta spyglių.' },
  { id: 'water_ice', prompt: 'Kuo pavirsta vanduo, kai lauke labai šalta (žemiau 0 °C)?', correct: 'Ledu', distractors: ['Garais', 'Smėliu', 'Dūmais'], exp: 'Šaltyje vanduo užšąla ir pavirsta kietu ledu.' },
  { id: 'water_steam', prompt: 'Kuo pavirsta verdantis vanduo arbatinuke?', correct: 'Garais', distractors: ['Ledu', 'Sniegu', 'Lietumi'], exp: 'Kai vanduo stipriai įkaista ir verda, jis virsta vandens garais.' },
  { id: 'baby_horse', prompt: 'Kaip vadinamas arklio jauniklis?', correct: 'Kumeliukas', distractors: ['Veršiukas', 'Ėriukas', 'Paršiukas'], exp: 'Arklio jauniklis vadinamas kumeliuku.' },
  { id: 'baby_cow', prompt: 'Kaip vadinamas karvės jauniklis?', correct: 'Veršiukas', distractors: ['Kumeliukas', 'Ančiukas', 'Kačiukas'], exp: 'Karvės jauniklis yra veršiukas.' },
  { id: 'baby_sheep', prompt: 'Kaip vadinamas avies jauniklis?', correct: 'Ėriukas', distractors: ['Veršiukas', 'Šuniukas', 'Paršiukas'], exp: 'Avies jauniklis vadinamas ėriuku.' },
  { id: 'stork', prompt: 'Kuris didelis baltas paukštis yra Lietuvos nacionalinis paukštis?', correct: 'Baltasis gandras', distractors: ['Pingvinas', 'Papūga', 'Strutis'], exp: 'Baltasis gandras yra Lietuvos nacionalinis paukštis.' },
  { id: 'woodpecker', prompt: 'Kuris paukštis vadinamas „miško daktaru“, nes snapu ieško vabalų medžių žievėje?', correct: 'Genys', distractors: ['Antis', 'Žvirblis', 'Gulbė'], exp: 'Genys kala medžių žievę ir išrenka kenkėjus, todėl vadinamas miško daktaru.' },
  { id: 'squirrel', prompt: 'Kuris miško gyvūnas rudenį kaupia riešutus ir giles drevėje?', correct: 'Voverė', distractors: ['Vilkas', 'Briedis', 'Lapė'], exp: 'Voverė rudenį pasiruošia maisto atsargų žiemai.' },
  { id: 'sun_heat', prompt: 'Kas suteikia Žemei šviesą ir šilumą dieną?', correct: 'Saulė', distractors: ['Mėnulis', 'Debesys', 'Vėjas'], exp: 'Saulė yra mūsų žvaigždė, kuri šildo ir apšviečia Žemę.' },
  { id: 'frog_home', prompt: 'Kur dažniausiai gyvena varlės?', correct: 'Prie vandens ir pelkėse', distractors: ['Dykumoje', 'Aukštai kalnuose', 'Ant ledo lyties'], exp: 'Varlėms būtina drėgmė ir vanduo, todėl jos gyvena prie tvenkinių ir ežerų.' },
  { id: 'bee_honey', prompt: 'Kuris vabzdys gamina medų?', correct: 'Bitė', distractors: ['Drugelis', 'Uodas', 'Boružė'], exp: 'Bitės renka žiedų nektarą ir avilyje gamina medų.' }
];

const LINAS_SAFETY_BANK = [
  { id: 'num_112', prompt: 'Koks yra bendrasis skubios pagalbos telefono numeris Lietuvoje?', correct: '112', distractors: ['911', '100', '123'], exp: 'Numeriu 112 Lietuvoje galima iškviesti policiją, gaisrinę ir greitąją pagalbą.' },
  { id: 'traffic_red', prompt: 'Ką reiškia RAUDONA šviesoforo šviesa pėstiesiems?', correct: 'Stovėti ir laukti', distractors: ['Greitai bėgti', 'Eiti per gatvę', 'Šokinėti'], exp: 'Degant raudonai šviesai eiti per gatvę draudžiama – reikia palaukti žalios.' },
  { id: 'traffic_green', prompt: 'Kuri šviesoforo šviesa leidžia eiti per pėsčiųjų perėją?', correct: 'Žalia', distractors: ['Raudona', 'Geltona', 'Mėlyna'], exp: 'Žalia šviesa leidžia eiti, tačiau vis tiek reikia apsidairyti.' },
  { id: 'bike_helmet', prompt: 'Ką būtina užsidėti ant galvos važiuojant dviračiu?', correct: 'Šalmą', distractors: ['Skėtį', 'Akinius nuo saulės', 'Šaliką'], exp: 'Šalmas apsaugo galvą, jei netyčia nukristum nuo dviračio.' },
  { id: 'reflector', prompt: 'Ką reikia segėti ant drabužių ar kuprinės einant tamsoje?', correct: 'Atšvaitą', distractors: ['Laikrodį', 'Žaisliuką', 'Raktus'], exp: 'Atšvaitas atspindi automobilių šviesas ir padeda vairuotojams tave matyti tamsoje.' },
  { id: 'crossing_look', prompt: 'Ką reikia padaryti prieš žengiant į pėsčiųjų perėją?', correct: 'Sustoti ir apsidairyti į abi puses', distractors: ['Užsimerkti ir bėgti', 'Žiūrėti tik į telefoną', 'Šaukti garsiai'], exp: 'Prieš einant per perėją visada reikia sustoti ir įsitikinti, kad automobiliai sustojo.' },
  { id: 'wash_hands', prompt: 'Kada būtina nusiplauti rankas su muilu?', correct: 'Grįžus iš lauko ir prieš valgį', distractors: ['Tik sekmadienį', 'Tik žiemą', 'Niekada nereikia'], exp: 'Rankų plovimas su muilu nuplauna mikrobus ir padeda nesusirgti.' },
  { id: 'stranger_door', prompt: 'Jei esi vienas namuose ir į duris beldžiasi nepažįstamas žmogus, ką darysi?', correct: 'Durų neatidarysiu ir paskambinsiu tėvams', distractors: ['Iškart atidarysiu duris', 'Pakviesiu į vidų', 'Pasakysiu, kad esu vienas'], exp: 'Nepažįstamiems žmonėms durų atidaryti negalima – geriausia pranešti tėvams.' },
  { id: 'brush_teeth', prompt: 'Kiek kartų per dieną rekomenduojama valytis dantis?', correct: '2 kartus (ryte ir vakare)', distractors: ['1 kartą per savaitę', '10 kartų per dieną', 'Tik prieš šventes'], exp: 'Dantis reikia valytis du kartus per dieną – ryte ir vakare.' },
  { id: 'car_seatbelt', prompt: 'Ką būtina padaryti atsisėdus į automobilį?', correct: 'Prisisegti saugos diržą', distractors: ['Atidaryti dureles', 'Atsistoti ant sėdynės', 'Užsidengti akis'], exp: 'Saugos diržas apsaugo kelionės metu staigiai stabdant.' }
];

const LINAS_MUSIC_ENGLISH_BANK = [
  { id: 'eng_red', prompt: 'Ką lietuviškai reiškia anglų kalbos žodis „RED“?', correct: 'Raudona', distractors: ['Mėlyna', 'Žalia', 'Geltona'], exp: 'Anglų kalboje „red“ reiškia raudoną spalvą.' },
  { id: 'eng_blue', prompt: 'Ką lietuviškai reiškia anglų kalbos žodis „BLUE“?', correct: 'Mėlyna', distractors: ['Raudona', 'Juoda', 'Balta'], exp: 'Anglų kalboje „blue“ reiškia mėlyną spalvą.' },
  { id: 'eng_green', prompt: 'Ką lietuviškai reiškia anglų kalbos žodis „GREEN“?', correct: 'Žalia', distractors: ['Geltona', 'Oranžinė', 'Ruda'], exp: 'Anglų kalboje „green“ reiškia žalią spalvą.' },
  { id: 'eng_yellow', prompt: 'Ką lietuviškai reiškia anglų kalbos žodis „YELLOW“?', correct: 'Geltona', distractors: ['Mėlyna', 'Balta', 'Raudona'], exp: 'Anglų kalboje „yellow“ reiškia geltoną spalvą.' },
  { id: 'eng_seven', prompt: 'Kurį skaičių reiškia angliškas žodis „SEVEN“?', correct: '7', distractors: ['6', '8', '5'], exp: 'One (1), two (2), three (3), four (4), five (5), six (6), seven (7).' },
  { id: 'eng_five', prompt: 'Kurį skaičių reiškia angliškas žodis „FIVE“?', correct: '5', distractors: ['4', '6', '9'], exp: 'Angliškas žodis „five“ reiškia skaičių 5.' },
  { id: 'eng_ten', prompt: 'Kurį skaičių reiškia angliškas žodis „TEN“?', correct: '10', distractors: ['8', '9', '2'], exp: 'Angliškas žodis „ten“ reiškia skaičių 10.' },
  { id: 'eng_cat', prompt: 'Kurį gyvūną reiškia angliškas žodis „CAT“?', correct: 'Katė', distractors: ['Šuo', 'Paukštis', 'Žuvis'], exp: 'Anglų kalboje „cat“ yra katė, o „dog“ – šuo.' },
  { id: 'eng_dog', prompt: 'Kurį gyvūną reiškia angliškas žodis „DOG“?', correct: 'Šuo', distractors: ['Katė', 'Varlė', 'Antis'], exp: 'Anglų kalboje „dog“ reiškia šunį.' },
  { id: 'eng_bird', prompt: 'Kurį gyvūną reiškia angliškas žodis „BIRD“?', correct: 'Paukštis', distractors: ['Meška', 'Triušis', 'Žuvis'], exp: 'Anglų kalboje „bird“ reiškia paukštį.' },
  { id: 'mus_high', prompt: 'Kas skleidžia AUKŠTĄ garsą?', correct: 'Mažas paukštelis', distractors: ['Didelis būgnas', 'Riaumojanti meška', 'Griaustinis'], exp: 'Mažas paukštelis čiulba aukštu, plonu garsu, o būgnas ir meška – žemu.' },
  { id: 'mus_piano', prompt: 'Kuris muzikos instrumentas turi baltus ir juodus klavišus?', correct: 'Pianinas', distractors: ['Būgnas', 'Fleita', 'Smuikas'], exp: 'Pianinu grojama spaudžiant baltus ir juodus klavišus.' },
  { id: 'mus_drum', prompt: 'Kuris instrumentas skamba, kai į jį mušame lazdelėmis?', correct: 'Būgnas', distractors: ['Gitara', 'Fleita', 'Pianinas'], exp: 'Būgnas yra mušamasis instrumentas.' },
  { id: 'mus_quiet', prompt: 'Koks garsas yra šnabždesys?', correct: 'Tylus', distractors: ['Labai garsus', 'Griaudėjantis', 'Trankus'], exp: 'Šnabždesys yra tylus garsas.' }
];

function genFromStaticBank(profile, category, topicLabel, bank, rng) {
  const item = pick(bank, rng);
  const { options, correctIndex } = buildShuffledOptions(item.correct, item.distractors, rng);
  return makeTask({
    id: `${profile}:${category}:${item.id}`,
    templateId: `${profile}:${category}:${item.id}`,
    profile,
    domain: 'general',
    category,
    topicLabel,
    prompt: item.prompt,
    options,
    correctIndex,
    explanation: item.exp
  });
}

// ==================== 3 KLASĖ (LUKAS) – MATEMATIKA (9 KATEGORIJOS) ====================

function genLukasClockTime(rng) {
  if (rng() < 0.5) {
    // Visual analog clock to 5-minute precision
    const isAfternoon = rng() < 0.5;
    const h12 = randInt(1, 12, rng);
    const displayHour = isAfternoon ? (h12 === 12 ? 12 : h12 + 12) : h12;
    const minutes = pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55], rng);
    const correctStr = formatTime(displayHour, minutes);

    const altH1 = isAfternoon
      ? displayHour === 23
        ? 13
        : displayHour + 1
      : (h12 % 12) + 1;
    const altH2 = isAfternoon
      ? displayHour === 12
        ? 23
        : displayHour - 1
      : h12 === 1
        ? 12
        : h12 - 1;
    const altM1 = (minutes + 10) % 60;
    const altM2 = (minutes + 50) % 60;

    const distractors = [
      formatTime(displayHour, altM1),
      formatTime(altH1, minutes),
      formatTime(displayHour, altM2),
      formatTime(altH2, minutes)
    ];

    const { options, correctIndex } = buildShuffledOptions(correctStr, distractors, rng);
    const periodText = isAfternoon ? 'Dabar yra popietė (po 12 val.).' : 'Dabar yra rytas (iki 12 val.).';

    return makeTask({
      id: `lukas:clock:read:${displayHour}:${minutes}`,
      templateId: 'lukas:clock:read',
      profile: 'lukas',
      domain: 'math',
      category: 'clock_time',
      topicLabel: 'Laikrodis ir laikas',
      prompt: `${periodText} Kiek tiksliai valandų rodo laikrodis?`,
      visualSpec: {
        type: 'clock',
        hours: h12,
        minutes,
        is24h: true,
        periodLabel: isAfternoon ? 'Popiet' : 'Rytas'
      },
      options,
      correctIndex,
      explanation: `Valandų rodyklė praėjo ${h12} (${isAfternoon ? `popiet tai ${displayHour} val.` : `${displayHour} val.`}), o minučių rodyklė rodo ${minutes} min. Todėl yra ${correctStr}.`
    });
  }

  // Elapsed time word problem
  const activities = ['Treniruotė', 'Filmas', 'Pamoka', 'Koncertas', 'Kelionė autobusu', 'Būrelis'];
  const act = pick(activities, rng);
  const startH = randInt(9, 19, rng);
  const startM = pick([15, 20, 25, 30, 35, 40, 45, 50], rng);
  const durM = pick([25, 30, 35, 40, 45, 50, 55, 75], rng);
  const totalMin = startH * 60 + startM + durM;
  const endH = Math.floor(totalMin / 60);
  const endM = totalMin % 60;
  const correctStr = formatTime(endH, endM);

  const distractors = [
    formatTime(endH, (endM + 10) % 60),
    formatTime(endH - 1, endM),
    formatTime(endH, (endM + 50) % 60),
    formatTime(endH + 1, endM)
  ];
  const { options, correctIndex } = buildShuffledOptions(correctStr, distractors, rng);

  return makeTask({
    id: `lukas:clock:elapsed:${startH}:${startM}:${durM}`,
    templateId: 'lukas:clock:elapsed',
    profile: 'lukas',
    domain: 'math',
    category: 'clock_time',
    topicLabel: 'Laikrodis ir laikas',
    prompt: `${act} prasidėjo ${formatTime(startH, startM)} ir truko ${durM} min. Kada baigėsi?`,
    options,
    correctIndex,
    explanation: `Prie ${formatTime(startH, startM)} pridėjus ${durM} min. (1 val. = 60 min.), gauname ${correctStr}.`
  });
}

function genLukasUnits(rng) {
  const type = pick(['m_cm', 'kg_g', 'h_min', 'eur_ct'], rng);

  if (type === 'm_cm') {
    const m = randInt(1, 8, rng);
    const cm = pick([5, 15, 20, 25, 35, 40, 50, 65, 75, 80, 90], rng);
    const ans = m * 100 + cm;
    const { options, correctIndex } = uniqueNumericOptions(
      ans,
      [m * 10 + cm, ans + 100, ans - 10, ans + 10, m * 1000 + cm],
      100,
      999,
      (v) => `${v} cm`,
      rng
    );
    return makeTask({
      id: `lukas:units:m_cm:${m}:${cm}`,
      templateId: 'lukas:units:m_cm',
      profile: 'lukas',
      domain: 'math',
      category: 'units',
      topicLabel: 'Matavimo vienetai',
      prompt: `Paversk centimetrais:\n${m} m ${cm} cm = ? cm`,
      options,
      correctIndex,
      explanation: `1 m = 100 cm, todėl ${m} m = ${m * 100} cm. Pridedame ${cm} cm ir gauname ${ans} cm.`
    });
  }

  if (type === 'kg_g') {
    const kg = randInt(1, 6, rng);
    const g = pick([50, 150, 200, 250, 300, 400, 500, 650, 750, 800], rng);
    const ans = kg * 1000 + g;
    const { options, correctIndex } = uniqueNumericOptions(
      ans,
      [kg * 100 + g, ans + 100, ans - 100, ans + 1000, kg * 1000 + g * 10],
      500,
      9000,
      (v) => `${v} g`,
      rng
    );
    return makeTask({
      id: `lukas:units:kg_g:${kg}:${g}`,
      templateId: 'lukas:units:kg_g',
      profile: 'lukas',
      domain: 'math',
      category: 'units',
      topicLabel: 'Matavimo vienetai',
      prompt: `Paversk gramais:\n${kg} kg ${g} g = ? g`,
      options,
      correctIndex,
      explanation: `1 kg = 1000 g, todėl ${kg} kg = ${kg * 1000} g. Pridedame ${g} g ir gauname ${ans} g.`
    });
  }

  if (type === 'h_min') {
    const h = randInt(1, 4, rng);
    const m = pick([10, 15, 20, 25, 30, 35, 40, 45, 50], rng);
    const ans = h * 60 + m;
    const { options, correctIndex } = uniqueNumericOptions(
      ans,
      [h * 100 + m, ans + 10, ans - 10, ans + 60, h * 60 - m],
      60,
      360,
      (v) => `${v} min.`,
      rng
    );
    return makeTask({
      id: `lukas:units:h_min:${h}:${m}`,
      templateId: 'lukas:units:h_min',
      profile: 'lukas',
      domain: 'math',
      category: 'units',
      topicLabel: 'Matavimo vienetai',
      prompt: `Paversk minutėmis:\n${h} val. ${m} min. = ? min.`,
      options,
      correctIndex,
      explanation: `1 val. = 60 min., todėl ${h} val. = ${h * 60} min. Pridedame ${m} min. ir gauname ${ans} min.`
    });
  }

  // eur_ct addition
  const e1 = randInt(2, 9, rng);
  const c1 = pick([30, 40, 50, 60, 70, 80, 90], rng);
  const e2 = randInt(1, 8, rng);
  const c2 = pick([20, 30, 40, 50, 60, 70, 80], rng);
  const totalCt = (e1 + e2) * 100 + c1 + c2;
  const ansE = Math.floor(totalCt / 100);
  const ansC = totalCt % 100;
  const fmtEur = (tot) => {
    const ee = Math.floor(tot / 100);
    const cc = tot % 100;
    return cc === 0 ? `${ee} €` : `${ee} € ${cc} ct`;
  };
  const { options, correctIndex } = uniqueNumericOptions(
    totalCt,
    [totalCt - 100, totalCt + 100, totalCt + 10, totalCt - 10, totalCt + 20],
    200,
    2500,
    fmtEur,
    rng
  );
  return makeTask({
    id: `lukas:units:eur:${e1}_${c1}:${e2}_${c2}`,
    templateId: 'lukas:units:eur',
    profile: 'lukas',
    domain: 'math',
    category: 'units',
    topicLabel: 'Matavimo vienetai',
    prompt: `Apskaičiuok pinigų sumą:\n${e1} € ${c1} ct + ${e2} € ${c2} ct = ?`,
    options,
    correctIndex,
    explanation: `Sudėkime eurus (${e1} + ${e2} = ${e1 + e2} €) ir centus (${c1} + ${c2} = ${c1 + c2} ct). Kadangi 100 ct = 1 €, gauname ${fmtEur(totalCt)}.`
  });
}

function genLukasPerimeterArea(rng) {
  const mode = pick(['perimeter', 'area', 'missing_side'], rng);
  const w = randInt(4, 12, rng);
  const h = randInt(3, 9, rng);
  const unit = pick(['m', 'cm'], rng);
  const P = 2 * (w + h);
  const S = w * h;

  if (mode === 'perimeter') {
    const { options, correctIndex } = uniqueNumericOptions(
      P,
      [w + h, S, P + 2, P - 2, P + 4],
      6,
      100,
      (v) => `${v} ${unit}`,
      rng
    );
    return makeTask({
      id: `lukas:pa:perim:${w}:${h}:${unit}`,
      templateId: 'lukas:pa:perim',
      profile: 'lukas',
      domain: 'math',
      category: 'perimeter_area',
      topicLabel: 'Perimetras ir plotas',
      prompt: `Apskaičiuok stačiakampio perimetrą (kraštinės: ${w} ${unit} ir ${h} ${unit}).`,
      visualSpec: {
        type: 'rectangle',
        widthVal: w,
        heightVal: h,
        unit,
        ask: 'perimeter'
      },
      options,
      correctIndex,
      explanation: `Perimetras yra visų kraštinių suma: P = (${w} + ${h}) × 2 = ${w + h} × 2 = ${P} ${unit}.`
    });
  }

  if (mode === 'area') {
    const { options, correctIndex } = uniqueNumericOptions(
      S,
      [P, S + w, S - h, S + 2, w + h],
      6,
      150,
      (v) => `${v} ${unit}²`,
      rng
    );
    return makeTask({
      id: `lukas:pa:area:${w}:${h}:${unit}`,
      templateId: 'lukas:pa:area',
      profile: 'lukas',
      domain: 'math',
      category: 'perimeter_area',
      topicLabel: 'Perimetras ir plotas',
      prompt: `Apskaičiuok stačiakampio plotą (ilgis ${w} ${unit}, plotis ${h} ${unit}).`,
      visualSpec: {
        type: 'rectangle',
        widthVal: w,
        heightVal: h,
        unit,
        ask: 'area'
      },
      options,
      correctIndex,
      explanation: `Stačiakampio plotą randame sudauginę ilgį ir plotį: S = ${w} × ${h} = ${S} ${unit}².`
    });
  }

  // missing side given perimeter
  const { options, correctIndex } = uniqueNumericOptions(
    h,
    [h + 1, h - 1, h + 2, P - w, Math.max(1, P - 2 * w)],
    1,
    30,
    (v) => `${v} ${unit}`,
    rng
  );
  return makeTask({
    id: `lukas:pa:missing:${w}:${h}:${unit}`,
    templateId: 'lukas:pa:missing',
    profile: 'lukas',
    domain: 'math',
    category: 'perimeter_area',
    topicLabel: 'Perimetras ir plotas',
    prompt: `Stačiakampio perimetras yra ${P} ${unit}, o jo ilgis – ${w} ${unit}. Koks yra stačiakampio plotis (?)?`,
    visualSpec: {
      type: 'rectangle',
      widthVal: w,
      heightVal: h,
      unit,
      ask: 'missing_side',
      perimeterVal: P
    },
    options,
    correctIndex,
    explanation: `Pusė perimetro yra ${P} : 2 = ${w + h} ${unit}. Atėmę ilgį gauname plotį: ${w + h} - ${w} = ${h} ${unit}.`
  });
}

function genLukasFractions(rng) {
  if (rng() < 0.6) {
    // Visual pizza or bar fraction (irreducible fractions only)
    const fracs = [
      [1, 2], [1, 3], [2, 3], [1, 4], [3, 4],
      [1, 5], [2, 5], [3, 5], [4, 5],
      [1, 6], [5, 6], [3, 8], [5, 8], [7, 8]
    ];
    const [num, den] = pick(fracs, rng);
    const shape = rng() < 0.55 ? 'circle' : 'bar';
    const correctStr = `${num}/${den}`;
    const unshaded = den - num;
    const candPool = [
      `${unshaded}/${den}`,
      `${num}/${den + 1}`,
      `${Math.min(den - 1, num + 1)}/${den}`,
      `${Math.max(1, num - 1)}/${den}`,
      `${den}/${num}`,
      `${num}/${Math.max(2, den - 1)}`
    ].filter((s) => s !== correctStr);

    const { options, correctIndex } = buildShuffledOptions(correctStr, shuffle(candPool, rng), rng);

    return makeTask({
      id: `lukas:frac:vis:${shape}:${num}_${den}`,
      templateId: `lukas:frac:vis:${shape}`,
      profile: 'lukas',
      domain: 'math',
      category: 'fractions',
      topicLabel: 'Trupmenos',
      prompt: 'Kuri figūros dalis yra nuspalvinta?',
      visualSpec: {
        type: 'fraction',
        shape,
        numerator: num,
        denominator: den
      },
      options,
      correctIndex,
      explanation: `Figūra padalinta į ${den} lygias dalis, iš jų nuspalvintos ${num}. Tai trupmena ${num}/${den}.`
    });
  }

  // Fraction of a number: 1/d of N
  const den = pick([2, 3, 4, 5, 6, 8], rng);
  const ans = randInt(3, 12, rng);
  const total = den * ans;
  const { options, correctIndex } = uniqueNumericOptions(
    ans,
    [ans + 1, ans - 1, ans + 2, total - den, ans + den],
    1,
    total,
    null,
    rng
  );

  return makeTask({
    id: `lukas:frac:of:1_${den}:${total}`,
    templateId: 'lukas:frac:of',
    profile: 'lukas',
    domain: 'math',
    category: 'fractions',
    topicLabel: 'Trupmenos',
    prompt: `Kiek yra 1/${den} skaičiaus ${total}?`,
    options,
    correctIndex,
    explanation: `Norėdami rasti 1/${den} dalį, skaičių padaliname iš ${den}: ${total} : ${den} = ${ans}.`
  });
}

function genLukasOrderOfOps(rng) {
  const form = pick(['sub_mul', 'paren_div', 'mul_add', 'paren_mul'], rng);
  let expr = '';
  let ans = 0;
  let distractors = [];
  let explanation = '';
  let idKey = '';

  if (form === 'sub_mul') {
    const b = randInt(3, 9, rng);
    const c = randInt(3, 9, rng);
    const prod = b * c;
    const a = prod + randInt(5, 35, rng);
    ans = a - prod;
    expr = `${a} - ${b} × ${c}`;
    distractors = [ans + b, ans - 2, ans + 4, Math.abs(a - b) + c];
    explanation = `Pirmiausia dauginame: ${b} × ${c} = ${prod}. Tada atimame: ${a} - ${prod} = ${ans}.`;
    idKey = `sm:${a}:${b}:${c}`;
  } else if (form === 'paren_div') {
    const c = randInt(3, 9, rng);
    ans = randInt(4, 10, rng);
    const sum = c * ans;
    const a = randInt(Math.floor(sum / 3), Math.floor((sum * 2) / 3), rng);
    const b = sum - a;
    expr = `(${a} + ${b}) : ${c}`;
    distractors = [ans + 1, ans - 1, ans + 2, a + Math.floor(b / c)];
    explanation = `Pirmiausia skaičiuojame skliaustuose: ${a} + ${b} = ${sum}. Tada daliname: ${sum} : ${c} = ${ans}.`;
    idKey = `pd:${a}:${b}:${c}`;
  } else if (form === 'mul_add') {
    const a = randInt(3, 9, rng);
    const b = randInt(4, 9, rng);
    const c = randInt(12, 45, rng);
    const prod = a * b;
    ans = prod + c;
    expr = `${a} × ${b} + ${c}`;
    distractors = [a * (b + 1) + c, ans + 10, ans - 10, ans + 2, ans - 3];
    explanation = `Pirmiausia dauginame: ${a} × ${b} = ${prod}. Tada pridedame: ${prod} + ${c} = ${ans}.`;
    idKey = `ma:${a}:${b}:${c}`;
  } else {
    const c = randInt(3, 8, rng);
    const diff = randInt(4, 11, rng);
    const b = randInt(8, 25, rng);
    const a = b + diff;
    ans = diff * c;
    expr = `(${a} - ${b}) × ${c}`;
    distractors = [ans + c, ans - c, ans + 2, a - b * 2];
    explanation = `Pirmiausia skaičiuojame skliaustuose: ${a} - ${b} = ${diff}. Tada dauginame: ${diff} × ${c} = ${ans}.`;
    idKey = `pm:${a}:${b}:${c}`;
  }

  const { options, correctIndex } = uniqueNumericOptions(ans, distractors, 1, 200, null, rng);
  return makeTask({
    id: `lukas:ops:${idKey}`,
    templateId: `lukas:ops:${form}`,
    profile: 'lukas',
    domain: 'math',
    category: 'order_of_ops',
    topicLabel: 'Veiksmų tvarka',
    prompt: `Apskaičiuok laikydamasis veiksmų tvarkos:\n${expr} = ?`,
    options,
    correctIndex,
    explanation
  });
}

function genLukasDivisionRemainder(rng) {
  const mode = pick(['find_rem', 'divisible_no_rem'], rng);

  if (mode === 'find_rem') {
    const divisor = randInt(4, 9, rng);
    const quotient = randInt(3, 9, rng);
    const rem = randInt(1, divisor - 1, rng);
    const dividend = divisor * quotient + rem;

    const { options, correctIndex } = uniqueNumericOptions(
      rem,
      [rem + 1, rem - 1, 0, divisor - rem, quotient],
      0,
      divisor + 2,
      null,
      rng
    );

    return makeTask({
      id: `lukas:rem:find:${dividend}:${divisor}`,
      templateId: 'lukas:rem:find',
      profile: 'lukas',
      domain: 'math',
      category: 'division_remainder',
      topicLabel: 'Dalyba su liekana',
      prompt: `Kokia liekana gaunama dalijant ${dividend} iš ${divisor}?`,
      options,
      correctIndex,
      explanation: `${divisor} × ${quotient} = ${divisor * quotient}. Atėmę gauname liekaną: ${dividend} - ${divisor * quotient} = ${rem}.`
    });
  }

  // divisible without remainder
  const divisor = randInt(4, 9, rng);
  const mult = randInt(4, 11, rng);
  const correct = divisor * mult;
  const wrongCandidates = [
    correct + 1,
    correct - 1,
    correct + 2,
    correct - 2,
    correct + 3,
    correct - 3
  ].filter((n) => n > 0 && n % divisor !== 0);

  const { options, correctIndex } = uniqueNumericOptions(correct, shuffle(wrongCandidates, rng), 10, 100, null, rng);
  return makeTask({
    id: `lukas:rem:exact:${divisor}:${correct}`,
    templateId: 'lukas:rem:exact',
    profile: 'lukas',
    domain: 'math',
    category: 'division_remainder',
    topicLabel: 'Dalyba su liekana',
    prompt: `Kurį skaičių galima padalinti iš ${divisor} BE liekanos?`,
    options,
    correctIndex,
    explanation: `${correct} : ${divisor} = ${mult} (liekana 0). Kiti skaičiai iš ${divisor} tiksliai nesidalina.`
  });
}

function genLukasSequencesEquations(rng) {
  if (rng() < 0.5) {
    // Mini equation: a × ? + b = c  or  a × ? - b = c
    const a = randInt(3, 8, rng);
    const x = randInt(3, 10, rng);
    const isAdd = rng() < 0.6;
    const b = randInt(3, 15, rng);
    const rhs = isAdd ? a * x + b : a * x - b;
    const sign = isAdd ? '+' : '-';

    const { options, correctIndex } = uniqueNumericOptions(
      x,
      [x + 1, x - 1, x + 2, x - 2],
      1,
      15,
      null,
      rng
    );

    const step1 = isAdd ? `${rhs} - ${b} = ${a * x}` : `${rhs} + ${b} = ${a * x}`;
    return makeTask({
      id: `lukas:seqeq:eq:${a}:${sign}:${b}:${rhs}`,
      templateId: 'lukas:seqeq:eq',
      profile: 'lukas',
      domain: 'math',
      category: 'sequences_equations',
      topicLabel: 'Sekos ir lygtys',
      prompt: `Rask nežinomą skaičių (?):\n${a} × ? ${sign} ${b} = ${rhs}`,
      options,
      correctIndex,
      explanation: `Pirma randame ${a} × ?: ${step1}. Tada daliname: ${a * x} : ${a} = ${x}.`
    });
  }

  // Growing step sequence: e.g., 3, 6, 10, 15, ? (+3, +4, +5, +6)
  const start = randInt(1, 8, rng);
  const step0 = randInt(2, 5, rng);
  const n1 = start;
  const n2 = n1 + step0;
  const n3 = n2 + (step0 + 1);
  const n4 = n3 + (step0 + 2);
  const ans = n4 + (step0 + 3);

  const { options, correctIndex } = uniqueNumericOptions(
    ans,
    [n4 + (step0 + 2), ans + 1, ans - 1, ans + 2, ans + 3],
    5,
    80,
    null,
    rng
  );

  return makeTask({
    id: `lukas:seqeq:grow:${start}:${step0}`,
    templateId: 'lukas:seqeq:grow',
    profile: 'lukas',
    domain: 'math',
    category: 'sequences_equations',
    topicLabel: 'Sekos ir lygtys',
    prompt: `Atrask dėsningumą ir pratęsk seką:\n${n1}, ${n2}, ${n3}, ${n4}, ?`,
    options,
    correctIndex,
    explanation: `Žingsnis kiekvieną kartą padidėja vienetu: +${step0}, +${step0 + 1}, +${step0 + 2}, todėl kitas žingsnis yra +${step0 + 3}. ${n4} + ${step0 + 3} = ${ans}.`
  });
}

function genLukasWordProblem2Step(rng) {
  const templates = [
    () => {
      const count = randInt(3, 6, rng);
      const price = randInt(4, 9, rng);
      const cost = count * price;
      const paid = Math.ceil((cost + 4) / 10) * 10;
      const ans = paid - cost;
      return {
        key: `tickets:${count}:${price}:${paid}`,
        prompt: `${count} bilietai į kiną kainuoja po ${price} €. Kiek liks grąžos sumokėjus ${paid} €?`,
        ans,
        unit: ' €',
        explanation: `1) Bilietai kainuoja ${count} × ${price} = ${cost} €. 2) Grąža: ${paid} - ${cost} = ${ans} €.`
      };
    },
    () => {
      const first = randInt(6, 15, rng);
      const mult = randInt(2, 4, rng);
      const second = first * mult;
      const ans = first + second;
      return {
        key: `pages:${first}:${mult}`,
        prompt: `Lukas pirmą dieną perskaitė ${first} puslapius, o antrą dieną – ${mult} kartus daugiau. Kiek puslapių jis perskaitė per abi dienas?`,
        ans,
        unit: '',
        explanation: `1) Antrą dieną perskaitė ${first} × ${mult} = ${second} psl. 2) Per abi dienas: ${first} + ${second} = ${ans} psl.`
      };
    },
    () => {
      const boxes = randInt(3, 7, rng);
      const perBox = randInt(6, 9, rng);
      const extra = randInt(8, 25, rng);
      const ans = boxes * perBox + extra;
      return {
        key: `boxes:${boxes}:${perBox}:${extra}`,
        prompt: `Mokiniai surinko ${boxes} dėžutes po ${perBox} giles ir dar rado ${extra} gilių. Kiek gilių jie surinko iš viso?`,
        ans,
        unit: '',
        explanation: `1) Dėžutėse buvo ${boxes} × ${perBox} = ${boxes * perBox} gilių. 2) Iš viso: ${boxes * perBox} + ${extra} = ${ans}.`
      };
    },
    () => {
      const perTeam = randInt(4, 8, rng);
      const teams = randInt(3, 6, rng);
      const total = perTeam * teams;
      const absent = randInt(3, 9, rng);
      const ans = total - absent;
      return {
        key: `players:${teams}:${perTeam}:${absent}`,
        prompt: `Į turnyrą užsiregistravo ${teams} komandos po ${perTeam} žaidėjus, tačiau ${absent} žaidėjai negalėjo atvykti. Kiek žaidėjų dalyvavo turnyre?`,
        ans,
        unit: '',
        explanation: `1) Iš viso užsiregistravo ${teams} × ${perTeam} = ${total} žaidėjų. 2) Dalyvavo: ${total} - ${absent} = ${ans}.`
      };
    }
  ];

  const data = pick(templates, rng)();
  const { options, correctIndex } = uniqueNumericOptions(
    data.ans,
    [data.ans + 2, data.ans - 2, data.ans + 5, data.ans - 3, data.ans + 1],
    1,
    250,
    (v) => `${v}${data.unit}`,
    rng
  );

  return makeTask({
    id: `lukas:word2:${data.key}`,
    templateId: `lukas:word2:${data.key.split(':')[0]}`,
    profile: 'lukas',
    domain: 'math',
    category: 'word_problem_2step',
    topicLabel: 'Dviejų veiksmų uždavinys',
    prompt: data.prompt,
    options,
    correctIndex,
    explanation: data.explanation
  });
}

function genLukasCompass(rng) {
  const dirs = [
    { code: 'Š', name: 'Šiaurę', nom: 'Šiaurė (Š)' },
    { code: 'R', name: 'Rytus', nom: 'Rytai (R)' },
    { code: 'P', name: 'Pietus', nom: 'Pietūs (P)' },
    { code: 'V', name: 'Vakarus', nom: 'Vakarai (V)' }
  ];
  const startIdx = randInt(0, 3, rng);
  const turn = pick(
    [
      { delta: 1, label: '90° pagal laikrodžio rodyklę (į dešinę)' },
      { delta: 3, label: '90° prieš laikrodžio rodyklę (į kairę)' },
      { delta: 2, label: '180° (apsisukęs atgal)' }
    ],
    rng
  );
  const endIdx = (startIdx + turn.delta) % 4;
  const startDir = dirs[startIdx];
  const endDir = dirs[endIdx];
  const distractors = dirs.filter((_, i) => i !== endIdx).map((d) => d.nom);
  const { options, correctIndex } = buildShuffledOptions(endDir.nom, distractors, rng);

  return makeTask({
    id: `lukas:compass:${startDir.code}:${turn.delta}`,
    templateId: `lukas:compass:${turn.delta}`,
    profile: 'lukas',
    domain: 'math',
    category: 'compass',
    topicLabel: 'Kompasas ir kryptys',
    prompt: `Stovi atsisukęs į ${startDir.name} (${startDir.code}). Į kurią pasaulio kryptį žiūrėsi pasisukęs ${turn.label}?`,
    visualSpec: {
      type: 'compass',
      startDir: startDir.code
    },
    options,
    correctIndex,
    explanation: `Pasaulio kryptys pagal laikrodžio rodyklę eina: Š → R → P → V. Nuo ${startDir.code} pasisukus ${turn.label}, atsisukame į ${endDir.nom}.`
  });
}

// ==================== 3 KLASĖ (LUKAS) – BENDRALOGINIAI / PASAULIO PAŽINIMAS (4 KATEGORIJOS) ====================

const LUKAS_ANALOGIES = [
  { id: 'book_bike', prompt: 'Užbaik analogiją:\nKnyga : skaityti = dviratis : ?', correct: 'važiuoti', distractors: ['miegoti', 'valgyti', 'dainuoti'], exp: 'Knyga skirta skaityti, o dviratis – važiuoti.' },
  { id: 'fish_bird', prompt: 'Užbaik analogiją:\nŽuvis : vanduo = paukštis : ?', correct: 'oras', distractors: ['smėlis', 'akmuo', 'ledas'], exp: 'Žuvys gyvena vandenyje, o paukščiai skraido ore.' },
  { id: 'winter_summer', prompt: 'Užbaik analogiją:\nŽiema : šalta = vasara : ?', correct: 'šilta', distractors: ['tamsu', 'slidu', 'snieguota'], exp: 'Žiemai būdingas šaltis, o vasarai – šiluma.' },
  { id: 'eye_ear', prompt: 'Užbaik analogiją:\nAkys : matyti = ausys : ?', correct: 'girdėti', distractors: ['uosti', 'bėgti', 'kalbėti'], exp: 'Akimis mes matome, o ausimis girdime.' },
  { id: 'doctor_teacher', prompt: 'Užbaik analogiją:\nGydytojas : ligoninė = mokytojas : ?', correct: 'mokykla', distractors: ['parduotuvė', 'oro uostas', 'gaisrinė'], exp: 'Gydytojas dirba ligoninėje, o mokytojas – mokykloje.' },
  { id: 'glove_sock', prompt: 'Užbaik analogiją:\nPirštinė : ranka = kojinė : ?', correct: 'koja', distractors: ['galva', 'kaklas', 'ausis'], exp: 'Pirštinė maunama ant rankos, o kojinė – ant kojos.' },
  { id: 'day_night', prompt: 'Užbaik analogiją:\nDiena : Saulė = naktis : ?', correct: 'Mėnulis', distractors: ['vaivorykštė', 'lietus', 'vėjas'], exp: 'Dieną danguje šviečia Saulė, o naktį – Mėnulis ir žvaigždės.' },
  { id: 'pen_brush', prompt: 'Užbaik analogiją:\nRašiklis : rašyti = teptukas : ?', correct: 'tapyti', distractors: ['kirpti', 'klijuoti', 'matuoti'], exp: 'Rašikliu rašome, o teptuku tapome (piešiame dažais).' },
  { id: 'truth_boxes', prompt: 'Ant dviejų dėžučių parašyta: A – „Lobis čia“, B – „Abi dėžutės meluoja“. Žinoma, kad TIK vienas užrašas teisingas. Kur lobis?', correct: 'Dėžutėje A', distractors: ['Dėžutėje B', 'Abiejose dėžutėse', 'Nė vienoje'], exp: 'Jei B būtų teisingas, tada ir B meluotų (prieštaravimas). Vadinasi, teisingas užrašas A – lobis yra dėžutėje A.' },
  { id: 'siblings_riddle', prompt: 'Šeimoje yra 3 broliai ir kiekvienas iš jų turi po 1 sesę. Kiek iš viso vaikų yra šioje šeimoje?', correct: '4 vaikai', distractors: ['6 vaikai', '3 vaikai', '5 vaikai'], exp: 'Visi 3 broliai turi tą pačią 1 bendrą sesę, todėl 3 + 1 = 4 vaikai.' }
];

function genLukasDeductionAnalogies(rng) {
  if (rng() < 0.45) {
    // Dynamic 4-runner ordering puzzle
    const names = shuffle(['Lukas', 'Mantas', 'Dominykas', 'Nojus', 'Jokūbas', 'Adomas', 'Rokas'], rng).slice(0, 4);
    const askPlace = pick([1, 2, 3, 4], rng);
    const placeWords = { 1: 'pirmas', 2: 'antras', 3: 'trečias', 4: 'ketvirtas' };
    const correct = names[askPlace - 1];
    const distractors = names.filter((n) => n !== correct);
    const { options, correctIndex } = buildShuffledOptions(correct, distractors, rng);

    return makeTask({
      id: `lukas:deduct:race:${names.join('_')}:${askPlace}`,
      templateId: 'lukas:deduct:race',
      profile: 'lukas',
      domain: 'general',
      category: 'deduction_analogies',
      topicLabel: 'Logika ir analogijos',
      prompt: `Bėgime dalyvavo 4 berniukai: ${names[0]} atbėgo pirmiau už ${names[1]}ą, ${names[1]} – pirmiau už ${names[2]}ą, o ${names[3]} atbėgo paskutinis. Kas finišavo ${placeWords[askPlace]}?`
        .replace('Lukasą', 'Luką')
        .replace('Mantasą', 'Mantą')
        .replace('Dominykasą', 'Dominyką')
        .replace('Nojusą', 'Nojų')
        .replace('Jokūbasą', 'Jokūbą')
        .replace('Adomasą', 'Adomą')
        .replace('Rokasą', 'Roką'),
      options,
      correctIndex,
      explanation: `Finišo eilė: 1. ${names[0]}, 2. ${names[1]}, 3. ${names[2]}, 4. ${names[3]}. Todėl ${placeWords[askPlace]} yra ${correct}.`
    });
  }

  return genFromStaticBank('lukas', 'deduction_analogies', 'Logika ir analogijos', LUKAS_ANALOGIES, rng);
}

const LUKAS_GEOGRAPHY_NATURE_BANK = [
  { id: 'river_nemunas', prompt: 'Kokia yra ilgiausia Lietuvos upė?', correct: 'Nemunas', distractors: ['Neris', 'Venta', 'Šešupė'], exp: 'Nemunas yra didžiausia ir ilgiausia Lietuvos upė.' },
  { id: 'capital_vilnius', prompt: 'Koks miestas yra Lietuvos sostinė?', correct: 'Vilnius', distractors: ['Kaunas', 'Klaipėda', 'Šiauliai'], exp: 'Lietuvos sostinė yra Vilnius.' },
  { id: 'sea_baltic', prompt: 'Prie kurios jūros yra įsikūrusi Lietuva?', correct: 'Baltijos jūros', distractors: ['Juodosios jūros', 'Viduržemio jūros', 'Šiaurės jūros'], exp: 'Lietuvos vakarinius krantus skalauja Baltijos jūra.' },
  { id: 'port_klaipeda', prompt: 'Kuris Lietuvos miestas yra didžiausias mūsų jūrų uostas?', correct: 'Klaipėda', distractors: ['Panevėžys', 'Alytus', 'Marijampolė'], exp: 'Klaipėda yra pagrindinis Lietuvos jūrų uostamiestis.' },
  { id: 'continent_europe', prompt: 'Kuriame žemyne yra Lietuva?', correct: 'Europoje', distractors: ['Azijoje', 'Afrikoje', 'Australijoje'], exp: 'Lietuva yra Europos žemyno šiaurės rytuose.' },
  { id: 'largest_continent', prompt: 'Kuris žemynas yra didžiausias Žemėje?', correct: 'Azija', distractors: ['Europa', 'Australija', 'Antarktida'], exp: 'Azija yra didžiausias žemynas tiek pagal plotą, tiek pagal gyventojų skaičių.' },
  { id: 'planet_closest', prompt: 'Kuri Saulės sistemos planeta yra arčiausiai Saulės?', correct: 'Merkurijus', distractors: ['Marsas', 'Žemė', 'Jupiteris'], exp: 'Planetų eilė nuo Saulės: Merkurijus, Venera, Žemė, Marsas...' },
  { id: 'planet_largest', prompt: 'Kuri Saulės sistemos planeta yra didžiausia?', correct: 'Jupiteris', distractors: ['Žemė', 'Marsas', 'Venera'], exp: 'Jupiteris yra didžiausia Saulės sistemos planeta (dujų milžinė).' },
  { id: 'planet_red', prompt: 'Kuri planeta dėl savo rausvo paviršiaus vadinama „Raudonąja planeta“?', correct: 'Marsas', distractors: ['Saturnas', 'Neptūnas', 'Merkurijus'], exp: 'Marsas vadinamas Raudonąja planeta dėl geležies oksido jo paviršiuje.' },
  { id: 'planet_rings', prompt: 'Kuri planeta garsėja ryškiais ledo ir uolienų žiedais aplink save?', correct: 'Saturnas', distractors: ['Venera', 'Marsas', 'Žemė'], exp: 'Saturnas turi įspūdingiausius ir ryškiausius žiedus Saulės sistemoje.' },
  { id: 'earth_3rd', prompt: 'Kelinta planeta nuo Saulės yra mūsų Žemė?', correct: 'Trečia', distractors: ['Antra', 'Ketvirta', 'Penkta'], exp: 'Žemė yra trečioji planeta nuo Saulės (po Merkurijaus ir Veneros).' },
  { id: 'water_cycle_evap', prompt: 'Kaip vadinamas procesas, kai Saulės sušildytas vanduo iš ežerų ir jūrų kyla į viršų kaip garai?', correct: 'Garavimas', distractors: ['Šalimas', 'Tirpimas', 'Nusėdimas'], exp: 'Vandens pavirtimas garais veikiant šilumai vadinamas garavimu.' },
  { id: 'photosynthesis', prompt: 'Kokias dujas, būtinas mums kvėpuoti, žali augalai gamina vykstant fotosintezei?', correct: 'Deguonį', distractors: ['Azotą', 'Helį', 'Garus'], exp: 'Augalai saulės šviesoje sugeria anglies dioksidą ir išskiria deguonį.' },
  { id: 'neris_vilnius', prompt: 'Kuri didelė upė teka per Vilnių ir įteka į Nemuną Kaune?', correct: 'Neris', distractors: ['Nevėžis', 'Dubysa', 'Minija'], exp: 'Per Vilnių teka Neris, o Kaune ji susilieja su Nemunu.' },
  { id: 'antarctica', prompt: 'Kuris žemynas yra šalčiausias ir beveik visas padengtas ledu?', correct: 'Antarktida', distractors: ['Afrika', 'Pietų Amerika', 'Europa'], exp: 'Antarktida yra šalčiausias Žemės žemynas prie Pietų ašigalio.' }
];

const LUKAS_MUSIC_ENGLISH_BANK = [
  { id: 'mus_scale_mi', prompt: 'Kuri nata muzikinėje gamoje eina iškart po natos MI? (do, re, mi, ...)', correct: 'fa', distractors: ['sol', 'la', 're'], exp: 'Natų eilė: do, re, mi, fa, sol, la, si. Po mi eina fa.' },
  { id: 'mus_scale_sol', prompt: 'Kuri nata muzikinėje gamoje eina iškart po natos SOL?', correct: 'la', distractors: ['fa', 'si', 'do'], exp: 'Natų eilė: do, re, mi, fa, sol, la, si. Po sol eina la.' },
  { id: 'mus_clef', prompt: 'Kaip vadinamas ženklas, rašomas penklinės pradžioje aukštesniems garsams žymėti?', correct: 'Smuiko raktas', distractors: ['Būgno ženklas', 'Pauzės ženklas', 'Takto brūkšnys'], exp: 'Penklinės pradžioje dažniausiai rašomas smuiko (sol) raktas.' },
  { id: 'mus_strings', prompt: 'Kuris instrumentas priklauso STYGINIŲ instrumentų šeimai?', correct: 'Smuikas', distractors: ['Trimitas', 'Fleita', 'Būgnas'], exp: 'Smuikas (taip pat gitara, violončelė, arfa) yra styginis instrumentas.' },
  { id: 'mus_wind', prompt: 'Kuris instrumentas priklauso PUČIAMŲJŲ instrumentų šeimai?', correct: 'Fleita', distractors: ['Gitara', 'Smuikas', 'Kanklės'], exp: 'Fleita grojama pučiant orą, todėl ji yra pučiamasis instrumentas.' },
  { id: 'mus_tempo', prompt: 'Ką muzikoje reiškia žodis „TEMPAS“?', correct: 'Muzikos atlikimo greitį', distractors: ['Instrumento spalvą', 'Dainos žodžius', 'Salės dydį'], exp: 'Tempas parodo, kaip greitai ar lėtai atliekamas muzikos kūrinys.' },
  { id: 'eng3_wednesday', prompt: 'Kuri savaitės diena anglų kalboje yra „WEDNESDAY“?', correct: 'Trečiadienis', distractors: ['Antradienis', 'Ketvirtadienis', 'Penktadienis'], exp: 'Monday (I), Tuesday (II), Wednesday (III – trečiadienis).' },
  { id: 'eng3_thursday', prompt: 'Kuri savaitės diena anglų kalboje yra „THURSDAY“?', correct: 'Ketvirtadienis', distractors: ['Antradienis', 'Trečiadienis', 'Šeštadienis'], exp: 'Thursday lietuviškai reiškia ketvirtadienį.' },
  { id: 'eng3_swim', prompt: 'Ką lietuviškai reiškia angliškas veiksmažodis „TO SWIM“?', correct: 'Plaukti', distractors: ['Bėgti', 'Šokinėti', 'Miegoti'], exp: '„To swim“ reiškia plaukti (pvz., I can swim – Aš moku plaukti).' },
  { id: 'eng3_write', prompt: 'Ką lietuviškai reiškia angliškas veiksmažodis „TO WRITE“?', correct: 'Rašyti', distractors: ['Skaityti', 'Piešti', 'Valgyti'], exp: '„To write“ reiškia rašyti, o „to read“ – skaityti.' },
  { id: 'eng3_how_old', prompt: 'Ką reiškia klausimas „How old are you?“?', correct: 'Kiek tau metų?', distractors: ['Koks tavo vardas?', 'Kur tu gyveni?', 'Kiek dabar valandų?'], exp: '„How old are you?“ klausiame norėdami sužinoti amžių.' },
  { id: 'eng3_what_time', prompt: 'Ką reiškia klausimas „What time is it?“?', correct: 'Kiek dabar valandų?', distractors: ['Koks šiandien oras?', 'Kur yra mokykla?', 'Ką tu mėgsti?'], exp: '„What time is it?“ reiškia „Kiek dabar valandų?“.' },
  { id: 'eng3_she_likes', prompt: 'Kaip lietuviškai išversti sakinį „She likes apples“?', correct: 'Jai patinka obuoliai', distractors: ['Jis valgo bananus', 'Ji turi šunį', 'Mes perkame obuolius'], exp: 'She (ji) likes (mėgsta / jai patinka) apples (obuoliai).' },
  { id: 'eng3_sunday', prompt: 'Kuri savaitės diena anglų kalboje yra „SUNDAY“?', correct: 'Sekmadienis', distractors: ['Šeštadienis', 'Pirmadienis', 'Penktadienis'], exp: 'Saturday – šeštadienis, Sunday – sekmadienis.' }
];

const LUKAS_DIGITAL_SAFETY_BANK = [
  { id: 'pass_share', prompt: 'Kodėl negalima pasakoti savo slaptažodžio net draugams ar nepažįstamiems internete?', correct: 'Kad niekas negalėtų perimti tavo paskyros', distractors: ['Kad slaptažodis nesugestų', 'Kad internetas nesulėtėtų', 'Kad ekranas neišsijungtų'], exp: 'Slaptažodis yra kaip raktas nuo namų – jį turi žinoti tik tu ir tavo tėvai.' },
  { id: 'phishing_prize', prompt: 'Gavai žinutę iš nepažįstamo žmogaus: „Laimėjai naują telefoną! Spausk šią nuorodą ir įvesk tėvų kortelės duomenis“. Ką darysi?', correct: 'Nespausiu nuorodos ir parodysiu tėvams', distractors: ['Iškart paspausiu nuorodą', 'Persiųsiu visiems draugams', 'Įvesiu savo adresą'], exp: 'Tai sukčių (phishing) žinutė. Įtartinų nuorodų spausti negalima!' },
  { id: 'strong_pass', prompt: 'Kuris iš šių slaptažodžių yra SAUGIAUSIAS?', correct: 'ZaliasDrakonas47!', distractors: ['123456', 'lukas', 'slaptazodis'], exp: 'Saugus slaptažodis yra ilgesnis, turi didžiąsias ir mažąsias raides, skaičius ir simbolius.' },
  { id: 'personal_info', prompt: 'Kokios informacijos NEGALIMA viešai skelbti internete?', correct: 'Savo namų adreso ir telefono numerio', distractors: ['Mėgstamiausios spalvos', 'Mėgstamiausio žaidimo pavadinimo', 'Kokius gyvūnus mėgsti'], exp: 'Namų adresas, mokyklos vieta ir telefono numeris yra asmeniniai duomenys, kuriuos reikia saugoti.' },
  { id: 'download_app', prompt: 'Prieš atsisiųsdamas naują žaidimą ar programėlę į planšetę, ką turėtum padaryti?', correct: 'Pasitarti su tėvais', distractors: ['Išjungti antivirusinę programą', 'Atsisiųsti iš bet kokio puslapio', 'Įvesti bet kokius slaptažodžius'], exp: 'Nežinomose programėlėse gali būti virusų arba mokamų pirkinių, todėl būtina pasitarti su tėvais.' },
  { id: 'cyberbully', prompt: 'Jei internetiniame žaidime kažkas rašo piktas, įžeidžiančias žinutes, ką geriausia padaryti?', correct: 'Užblokuoti tą žaidėją ir pasakyti tėvams', distractors: ['Rašyti piktas žinutes atgal', 'Susitikti su juo kieme', 'Pasakyti savo slaptažodį'], exp: 'Geriausia nereaguoti į patyčias, užblokuoti pažeidėją ir pranešti suaugusiesiems.' },
  { id: 'eye_break', prompt: 'Kodėl žaidžiant ar dirbant prie ekrano svarbu daryti pertraukas?', correct: 'Kad pailsėtų akys ir nugara', distractors: ['Kad klaviatūra neatšaltų', 'Kad pelytė neužmigtų', 'Kad ekranas taptų didesnis'], exp: 'Pertraukos padeda apsaugoti regėjimą, laikyseną ir išlaikyti gerą nuotaiką.' },
  { id: 'healthy_sleep', prompt: 'Kiek maždaug valandų per parą rekomenduojama miegoti 9–10 metų vaikui?', correct: '9–11 valandų', distractors: ['3–4 valandas', '5 valandas', '16 valandų'], exp: 'Kokybiškas 9–11 valandų miegas padeda smegenims pailsėti ir geriau mokytis.' },
  { id: 'healthy_drink', prompt: 'Koks gėrimas geriausiai malšina troškulį sportuojant ar karštą dieną?', correct: 'Paprastas vanduo', distractors: ['Saldus limonadas', 'Energinis gėrimas', 'Kava'], exp: 'Paprastas vanduo geriausiai atstato skysčius organizme ir neturi pridėtinio cukraus.' },
  { id: 'fake_news', prompt: 'Perskaitei internete keistą naujieną, kad rytoj į Žemę atskris skraidantys drambliai. Ką verta padaryti?', correct: 'Patikrinti patikimuose šaltiniuose ir kritiškai pagalvoti', distractors: ['Iškart visiems patikėti ir pasidalinti', 'Išsigąsti', 'Išjungti šviesas namuose'], exp: 'Internete ne viskas yra tiesa – svarbu tikrinti informaciją patikimuose šaltiniuose.' }
];

// ==================== GENERATORIŲ REGISTRAI ====================

const GENERATORS = {
  linas: {
    clock: genLinasClock,
    money: genLinasMoney,
    inequality: genLinasInequality,
    missing: genLinasMissing,
    sequence: genLinasSequence,
    geometry: genLinasGeometry,
    double_half_scale: genLinasDoubleHalfScale,
    word_problem: genLinasWordProblem,
    calendar: genLinasCalendar,
    verbal_logic: genLinasVerbalLogic,
    nature: (rng) => genFromStaticBank('linas', 'nature', 'Gamta ir aplinka', LINAS_NATURE_BANK, rng),
    safety: (rng) => genFromStaticBank('linas', 'safety', 'Saugumas ir kasdienybė', LINAS_SAFETY_BANK, rng),
    music_english: (rng) =>
      genFromStaticBank('linas', 'music_english', 'Muzika ir anglų k.', LINAS_MUSIC_ENGLISH_BANK, rng)
  },
  lukas: {
    clock_time: genLukasClockTime,
    units: genLukasUnits,
    perimeter_area: genLukasPerimeterArea,
    fractions: genLukasFractions,
    order_of_ops: genLukasOrderOfOps,
    division_remainder: genLukasDivisionRemainder,
    sequences_equations: genLukasSequencesEquations,
    word_problem_2step: genLukasWordProblem2Step,
    compass: genLukasCompass,
    deduction_analogies: genLukasDeductionAnalogies,
    geography_nature: (rng) =>
      genFromStaticBank('lukas', 'geography_nature', 'Lietuva, geografija ir gamta', LUKAS_GEOGRAPHY_NATURE_BANK, rng),
    music_english_3: (rng) =>
      genFromStaticBank('lukas', 'music_english_3', 'Muzika ir anglų k.', LUKAS_MUSIC_ENGLISH_BANK, rng),
    digital_safety: (rng) =>
      genFromStaticBank('lukas', 'digital_safety', 'Skaitmeninis saugumas ir sveikata', LUKAS_DIGITAL_SAFETY_BANK, rng)
  }
};

// ==================== PAGRINDINIS GENERATORIUS ====================

function extractRecentCategories(recentList) {
  const cats = [];
  for (let i = Math.max(0, recentList.length - 2); i < recentList.length; i += 1) {
    const id = String(recentList[i] || '');
    const parts = id.split(':');
    if (parts.length >= 2) cats.push(parts[1]);
  }
  return cats;
}

export function generateTask(profileOrGrade = 'linas', options = {}) {
  const profile = normalizeProfile(profileOrGrade);
  const rng = typeof options.rng === 'function' ? options.rng : Math.random;
  const recentArray = Array.isArray(options.recentIds)
    ? options.recentIds.slice(-25)
    : options.recentIds instanceof Set
      ? [...options.recentIds].slice(-25)
      : [];
  const recentSet = new Set(recentArray);
  const recentCats = extractRecentCategories(recentArray);

  const profileCats = CATEGORIES[profile];
  const mathCats = profileCats.filter((c) => c.domain === 'math').map((c) => c.id);
  const generalCats = profileCats.filter((c) => c.domain === 'general').map((c) => c.id);
  const genMap = GENERATORS[profile];

  let fallbackTask = null;

  for (let attempt = 0; attempt < 36; attempt += 1) {
    let chosenCat = options.category && genMap[options.category] ? options.category : null;

    if (!chosenCat) {
      let domain = options.domain;
      if (domain !== 'math' && domain !== 'general') {
        domain = rng() < PROFILES[profile].mathRatio ? 'math' : 'general';
      }
      const pool = domain === 'math' ? mathCats : generalCats;
      const nonRecentPool =
        attempt < 18 ? pool.filter((c) => !recentCats.includes(c)) : pool;
      chosenCat = pick(nonRecentPool.length > 0 ? nonRecentPool : pool, rng);
    }

    const task = genMap[chosenCat](rng);
    if (!validateTask(task)) continue;

    fallbackTask = task;

    if (!recentSet.has(task.id)) {
      return task;
    }
  }

  return fallbackTask;
}

export function generateTaskBatch(profileOrGrade = 'linas', count = 10, options = {}) {
  const recentIds = Array.isArray(options.recentIds) ? [...options.recentIds] : [];
  const tasks = [];
  for (let i = 0; i < count; i += 1) {
    const task = generateTask(profileOrGrade, { ...options, recentIds });
    if (task) {
      tasks.push(task);
      recentIds.push(task.id);
      if (recentIds.length > 25) recentIds.shift();
    }
  }
  return tasks;
}

// ==================== VIZUALINIS PIEŠIMAS (SVG) ====================

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderClockSVG(spec) {
  const cx = 110;
  const cy = 110;
  const r = 88;
  const hours = Number(spec.hours) || 12;
  const minutes = Number(spec.minutes) || 0;

  let ticks = '';
  for (let i = 0; i < 60; i += 1) {
    const angle = (i * 6 - 90) * (Math.PI / 180);
    const isHour = i % 5 === 0;
    const r1 = isHour ? r - 12 : r - 6;
    const r2 = r - 2;
    const x1 = (cx + Math.cos(angle) * r1).toFixed(1);
    const y1 = (cy + Math.sin(angle) * r1).toFixed(1);
    const x2 = (cx + Math.cos(angle) * r2).toFixed(1);
    const y2 = (cy + Math.sin(angle) * r2).toFixed(1);
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isHour ? '#1e293b' : '#94a3b8'}" stroke-width="${isHour ? 3 : 1.4}" stroke-linecap="round"/>`;
  }

  let nums = '';
  for (let h = 1; h <= 12; h += 1) {
    const angle = (h * 30 - 90) * (Math.PI / 180);
    const nx = (cx + Math.cos(angle) * (r - 26)).toFixed(1);
    const ny = (cy + Math.sin(angle) * (r - 26) + 6).toFixed(1);
    nums += `<text x="${nx}" y="${ny}" text-anchor="middle" font-size="17" font-weight="800" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif">${h}</text>`;
  }

  const hourAngle = (((hours % 12) + minutes / 60) * 30 - 90) * (Math.PI / 180);
  const minAngle = (minutes * 6 - 90) * (Math.PI / 180);

  const hx = (cx + Math.cos(hourAngle) * 44).toFixed(1);
  const hy = (cy + Math.sin(hourAngle) * 44).toFixed(1);
  const mx = (cx + Math.cos(minAngle) * 66).toFixed(1);
  const my = (cy + Math.sin(minAngle) * 66).toFixed(1);

  const badge = spec.periodLabel
    ? `<rect x="142" y="8" width="72" height="24" rx="12" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
       <text x="178" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1" font-family="system-ui, sans-serif">${escapeXml(spec.periodLabel)}</text>`
    : '';

  return `<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Analoginis laikrodis" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#3b82f6"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fffbeb" stroke="#1e293b" stroke-width="3"/>
    ${ticks}
    ${nums}
    <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#2563eb" stroke-width="4.5" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#dc2626" stroke-width="6.5" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="6.5" fill="#0f172a" stroke="#fff" stroke-width="2"/>
    ${badge}
  </svg>`;
}

function renderCoinOrNote(val, x, y) {
  if (val >= 5) {
    const fills = { 5: '#cbd5e1', 10: '#fecaca', 20: '#bfdbfe' };
    const strokes = { 5: '#475569', 10: '#dc2626', 20: '#2563eb' };
    const fill = fills[val] || '#bbf7d0';
    const stroke = strokes[val] || '#15803d';
    return `<g transform="translate(${x},${y})">
      <rect x="0" y="0" width="76" height="44" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
      <rect x="5" y="5" width="66" height="34" rx="4" fill="none" stroke="${stroke}" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="38" y="28" text-anchor="middle" font-size="18" font-weight="800" fill="#0f172a" font-family="system-ui, sans-serif">${val} €</text>
    </g>`;
  }
  const outer = val === 2 ? '#e2e8f0' : '#fde047';
  const inner = val === 2 ? '#fde047' : '#e2e8f0';
  return `<g transform="translate(${x + 22},${y + 22})">
    <circle cx="0" cy="0" r="21" fill="${outer}" stroke="#92400e" stroke-width="2.2"/>
    <circle cx="0" cy="0" r="14" fill="${inner}" stroke="#b45309" stroke-width="1.2"/>
    <text x="0" y="6" text-anchor="middle" font-size="15" font-weight="800" fill="#0f172a" font-family="system-ui, sans-serif">${val}€</text>
  </g>`;
}

function renderMoneySVG(spec) {
  if (spec.mode === 'sum' && Array.isArray(spec.items)) {
    const [a, b] = spec.items;
    return `<svg viewBox="0 0 320 110" width="320" height="110" role="img" aria-label="Prekių kainos" style="max-width:100%;height:auto;display:block;margin:0 auto;">
      <rect x="4" y="4" width="312" height="102" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="18" y="20" width="114" height="70" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2.2"/>
      <text x="75" y="48" text-anchor="middle" font-size="14" font-weight="700" fill="#78350f" font-family="system-ui, sans-serif">${escapeXml(a.label)}</text>
      <text x="75" y="75" text-anchor="middle" font-size="22" font-weight="900" fill="#b45309" font-family="system-ui, sans-serif">${a.price} €</text>
      <text x="160" y="64" text-anchor="middle" font-size="28" font-weight="900" fill="#334155" font-family="system-ui, sans-serif">+</text>
      <rect x="188" y="20" width="114" height="70" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="2.2"/>
      <text x="245" y="48" text-anchor="middle" font-size="14" font-weight="700" fill="#14532d" font-family="system-ui, sans-serif">${escapeXml(b.label)}</text>
      <text x="245" y="75" text-anchor="middle" font-size="22" font-weight="900" fill="#15803d" font-family="system-ui, sans-serif">${b.price} €</text>
    </svg>`;
  }

  if (spec.mode === 'change') {
    return `<svg viewBox="0 0 320 110" width="320" height="110" role="img" aria-label="Grąžos uždavinys" style="max-width:100%;height:auto;display:block;margin:0 auto;">
      <rect x="4" y="4" width="312" height="102" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      ${renderCoinOrNote(spec.paid, 22, 33)}
      <text x="122" y="62" text-anchor="middle" font-size="26" font-weight="900" fill="#dc2626" font-family="system-ui, sans-serif">−</text>
      <rect x="145" y="22" width="94" height="66" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2.2"/>
      <text x="192" y="47" text-anchor="middle" font-size="13" font-weight="700" fill="#78350f" font-family="system-ui, sans-serif">${escapeXml(spec.label || 'Prekė')}</text>
      <text x="192" y="74" text-anchor="middle" font-size="21" font-weight="900" fill="#b45309" font-family="system-ui, sans-serif">${spec.price} €</text>
      <text x="275" y="64" text-anchor="middle" font-size="24" font-weight="900" fill="#0f172a" font-family="system-ui, sans-serif">= ?</text>
    </svg>`;
  }

  const coins = Array.isArray(spec.coins) ? spec.coins : [];
  let cursorX = 16;
  let itemsSvg = '';
  for (const c of coins) {
    itemsSvg += renderCoinOrNote(c, cursorX, 33);
    cursorX += c >= 5 ? 84 : 52;
  }
  const width = Math.max(260, cursorX + 12);
  return `<svg viewBox="0 0 ${width} 110" width="${width}" height="110" role="img" aria-label="Eurų monetos ir banknotai" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <rect x="4" y="4" width="${width - 8}" height="102" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    ${itemsSvg}
  </svg>`;
}

function drawShapePrimitive(shape, cx, cy, size, fill) {
  const s = size;
  if (shape === 'circle') {
    return `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${fill}" stroke="#1e293b" stroke-width="2.5"/>`;
  }
  if (shape === 'square') {
    return `<rect x="${cx - s}" y="${cy - s}" width="${s * 2}" height="${s * 2}" rx="3" fill="${fill}" stroke="#1e293b" stroke-width="2.5"/>`;
  }
  if (shape === 'rectangle') {
    return `<rect x="${cx - s * 1.35}" y="${cy - s * 0.8}" width="${s * 2.7}" height="${s * 1.6}" rx="3" fill="${fill}" stroke="#1e293b" stroke-width="2.5"/>`;
  }
  if (shape === 'triangle') {
    const pts = `${cx},${cy - s} ${cx - s * 1.05},${cy + s * 0.9} ${cx + s * 1.05},${cy + s * 0.9}`;
    return `<polygon points="${pts}" fill="${fill}" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  if (shape === 'pentagon') {
    const pts = [];
    for (let i = 0; i < 5; i += 1) {
      const a = ((i * 72 - 90) * Math.PI) / 180;
      pts.push(`${(cx + Math.cos(a) * s).toFixed(1)},${(cy + Math.sin(a) * s).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  return '';
}

function renderShapesCountSVG(spec) {
  const palette = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#8b5cf6', '#06b6d4'];
  const shapes = Array.isArray(spec.shapes) ? spec.shapes : [];
  const cols = Math.min(5, Math.max(3, Math.ceil(shapes.length / 2)));
  const cellW = 62;
  const cellH = 62;
  const rows = Math.ceil(shapes.length / cols);
  const w = cols * cellW + 24;
  const h = rows * cellH + 24;

  let body = '';
  shapes.forEach((sh, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = 12 + col * cellW + cellW / 2;
    const cy = 12 + row * cellH + cellH / 2;
    body += drawShapePrimitive(sh, cx, cy, 20, palette[idx % palette.length]);
  });

  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Geometrinės figūros" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    ${body}
  </svg>`;
}

function renderSingleShapeSVG(spec) {
  const colors = {
    triangle: '#fb923c',
    square: '#60a5fa',
    rectangle: '#34d399',
    pentagon: '#c084fc',
    circle: '#facc15'
  };
  const fill = colors[spec.shape] || '#60a5fa';
  return `<svg viewBox="0 0 220 150" width="220" height="150" role="img" aria-label="Geometrinė figūra" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <rect x="4" y="4" width="212" height="142" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    ${drawShapePrimitive(spec.shape, 110, 76, 46, fill)}
  </svg>`;
}

function renderScaleSVG(spec) {
  const unit = spec.unit || 'kg';
  const left = Array.isArray(spec.left) ? spec.left : [];
  const right = Array.isArray(spec.right) ? spec.right : [];

  const drawBlocks = (items, centerX) => {
    const startX = centerX - (items.length * 46) / 2;
    return items
      .map((val, idx) => {
        const isUnknown = val === '?';
        const x = startX + idx * 48;
        const fill = isUnknown ? '#fde047' : '#93c5fd';
        const stroke = isUnknown ? '#ca8a04' : '#1d4ed8';
        return `<rect x="${x}" y="42" width="42" height="36" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>
          <text x="${x + 21}" y="65" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="system-ui, sans-serif">${isUnknown ? '?' : `${val}${unit}`}</text>`;
      })
      .join('');
  };

  return `<svg viewBox="0 0 320 155" width="320" height="155" role="img" aria-label="Svarstyklės pusiausvyroje" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <rect x="4" y="4" width="312" height="147" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <polygon points="160,92 136,138 184,138" fill="#475569"/>
    <rect x="115" y="135" width="90" height="8" rx="4" fill="#334155"/>
    <line x1="55" y1="90" x2="265" y2="90" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>
    <circle cx="160" cy="90" r="7" fill="#ef4444" stroke="#fff" stroke-width="2"/>
    <rect x="34" y="78" width="106" height="10" rx="5" fill="#64748b"/>
    <rect x="180" y="78" width="106" height="10" rx="5" fill="#64748b"/>
    ${drawBlocks(left, 87)}
    ${drawBlocks(right, 233)}
  </svg>`;
}

function renderRectangleSVG(spec) {
  const unit = spec.unit || 'm';
  const topLabel = `${spec.widthVal} ${unit}`;
  const sideLabel = spec.ask === 'missing_side' ? '?' : `${spec.heightVal} ${unit}`;
  const centerBadge =
    spec.ask === 'missing_side' && spec.perimeterVal
      ? `P = ${spec.perimeterVal} ${unit}`
      : spec.ask === 'area'
        ? 'S = ?'
        : 'P = ?';

  return `<svg viewBox="0 0 300 175" width="300" height="175" role="img" aria-label="Stačiakampio brėžinys" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <rect x="4" y="4" width="292" height="167" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="52" y="46" width="176" height="96" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="3.5"/>
    <text x="140" y="34" text-anchor="middle" font-size="18" font-weight="800" fill="#1e3a8a" font-family="system-ui, sans-serif">${escapeXml(topLabel)}</text>
    <text x="262" y="100" text-anchor="middle" font-size="18" font-weight="800" fill="${spec.ask === 'missing_side' ? '#dc2626' : '#1e3a8a'}" font-family="system-ui, sans-serif">${escapeXml(sideLabel)}</text>
    <text x="140" y="101" text-anchor="middle" font-size="19" font-weight="900" fill="#1d4ed8" font-family="system-ui, sans-serif">${escapeXml(centerBadge)}</text>
  </svg>`;
}

function renderFractionSVG(spec) {
  const num = Number(spec.numerator) || 1;
  const den = Math.max(2, Number(spec.denominator) || 4);

  if (spec.shape === 'bar') {
    const barW = 260;
    const cellW = barW / den;
    let cells = '';
    for (let i = 0; i < den; i += 1) {
      const filled = i < num;
      cells += `<rect x="${20 + i * cellW}" y="34" width="${cellW}" height="52" fill="${filled ? '#0ea5e9' : '#f1f5f9'}" stroke="#0f172a" stroke-width="2.2"/>`;
    }
    return `<svg viewBox="0 0 300 120" width="300" height="120" role="img" aria-label="Trupmenos juosta" style="max-width:100%;height:auto;display:block;margin:0 auto;">
      <rect x="4" y="4" width="292" height="112" rx="14" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
      ${cells}
    </svg>`;
  }

  // Circle / pizza
  const cx = 100;
  const cy = 100;
  const r = 78;
  let slices = '';
  for (let i = 0; i < den; i += 1) {
    const a1 = ((i * 360) / den - 90) * (Math.PI / 180);
    const a2 = (((i + 1) * 360) / den - 90) * (Math.PI / 180);
    const x1 = (cx + Math.cos(a1) * r).toFixed(2);
    const y1 = (cy + Math.sin(a1) * r).toFixed(2);
    const x2 = (cx + Math.cos(a2) * r).toFixed(2);
    const y2 = (cy + Math.sin(a2) * r).toFixed(2);
    const largeArc = 360 / den > 180 ? 1 : 0;
    const fill = i < num ? '#f97316' : '#fef3c7';
    slices += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${fill}" stroke="#1e293b" stroke-width="2.4"/>`;
  }

  return `<svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="Trupmenos apskritimas" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    ${slices}
  </svg>`;
}

function renderCompassSVG(spec) {
  const cx = 110;
  const cy = 110;
  const angleMap = { Š: 0, R: 90, P: 180, V: 270 };
  const rot = angleMap[spec.startDir] ?? 0;

  return `<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Kompasas" style="max-width:100%;height:auto;display:block;margin:0 auto;">
    <circle cx="${cx}" cy="${cy}" r="96" fill="#f8fafc" stroke="#334155" stroke-width="3.5"/>
    <circle cx="${cx}" cy="${cy}" r="70" fill="#e0f2fe" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4"/>
    <line x1="${cx}" y1="36" x2="${cx}" y2="184" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="36" y1="${cy}" x2="184" y2="${cy}" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="${cx}" y="30" text-anchor="middle" font-size="18" font-weight="900" fill="#dc2626" font-family="system-ui, sans-serif">Š</text>
    <text x="${cx}" y="203" text-anchor="middle" font-size="18" font-weight="900" fill="#0f172a" font-family="system-ui, sans-serif">P</text>
    <text x="197" y="116" text-anchor="middle" font-size="18" font-weight="900" fill="#0f172a" font-family="system-ui, sans-serif">R</text>
    <text x="23" y="116" text-anchor="middle" font-size="18" font-weight="900" fill="#0f172a" font-family="system-ui, sans-serif">V</text>
    <g transform="rotate(${rot} ${cx} ${cy})">
      <polygon points="${cx},44 ${cx - 12},${cy} ${cx + 12},${cy}" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.8"/>
      <polygon points="${cx},166 ${cx - 10},${cy} ${cx + 10},${cy}" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="#0f172a" stroke="#fff" stroke-width="2"/>
    </g>
  </svg>`;
}

export function buildTaskVisualSVG(visualSpec) {
  if (!visualSpec || typeof visualSpec !== 'object') return '';
  switch (visualSpec.type) {
    case 'clock':
      return renderClockSVG(visualSpec);
    case 'money':
      return renderMoneySVG(visualSpec);
    case 'shapes_count':
      return renderShapesCountSVG(visualSpec);
    case 'shape_single':
      return renderSingleShapeSVG(visualSpec);
    case 'scale':
      return renderScaleSVG(visualSpec);
    case 'rectangle':
      return renderRectangleSVG(visualSpec);
    case 'fraction':
      return renderFractionSVG(visualSpec);
    case 'compass':
      return renderCompassSVG(visualSpec);
    default:
      return '';
  }
}

export function renderTaskVisual(containerEl, visualSpec) {
  if (!containerEl) return false;
  const svg = buildTaskVisualSVG(visualSpec);
  containerEl.innerHTML = svg;
  return Boolean(svg);
}

// ==================== GLOBALUS PRIEIGOS TAŠKAS ====================

export const BosasEduBank = Object.freeze({
  PROFILES,
  CATEGORIES,
  normalizeProfile,
  getCategories,
  generateTask,
  generateTaskBatch,
  buildTaskVisualSVG,
  renderTaskVisual
});

if (typeof window !== 'undefined') {
  window.BosasEduBank = BosasEduBank;
}
if (typeof globalThis !== 'undefined') {
  globalThis.BosasEduBank = BosasEduBank;
}

export default BosasEduBank;
