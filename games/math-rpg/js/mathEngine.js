// Test Build 8 – „Shuffle Bag“ (Maišymo krepšelio) algoritmas!
// 28 unikalūs užduočių tipai 1 klasei ir 28 unikalūs užduočių tipai 3 klasei (įskaitant poilsio užduotis, ilgus skaičiavimus, tekstinius scenarijus ir vizualines užduotis).
// Užduotys traukiamos po vieną iš išmaišyto krepšelio ir Niekada nesikartoja, kol neišnaudojami visi 28 tipai!

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const GRADE_1_TEMPLATES = [
  'g1_breather_add',
  'g1_breather_sub',
  'g1_add_dots',
  'g1_sub_apples',
  'g1_chain_3ops',
  'g1_chain_add3',
  'g1_shapes_recognize',
  'g1_shapes_corners',
  'g1_shapes_count_row',
  'g1_clock_hours',
  'g1_clock_half',
  'g1_compare_croc',
  'g1_even_odd',
  'g1_animal_parts',
  'g1_scales',
  'g1_money_change',
  'g1_sequence',
  'g1_sequence_down',
  'g1_missing_addend',
  'g1_missing_subtrahend',
  'g1_neighbors',
  'g1_tens_ones',
  'g1_double_half',
  'g1_word_birds',
  'g1_word_balloons',
  'g1_word_hedgehog',
  'g1_word_chest',
  'g1_word_rabbits'
];

export const GRADE_3_TEMPLATES = [
  'g3_breather_mult',
  'g3_breather_add',
  'g3_chain_3ops',
  'g3_chain_parentheses',
  'g3_chain_two_mults',
  'g3_fractions_pie',
  'g3_time_diff',
  'g3_units_length_m',
  'g3_units_length_dm',
  'g3_units_weight',
  'g3_magic_square',
  'g3_perimeter',
  'g3_area_grid',
  'g3_missing_divisor',
  'g3_missing_factor',
  'g3_mult_tens',
  'g3_mult_table',
  'g3_compare_expr',
  'g3_fraction_of_number',
  'g3_roman_numerals',
  'g3_rounding',
  'g3_remainder',
  'g3_word_orchard',
  'g3_word_boss_hp',
  'g3_word_library',
  'g3_word_train',
  'g3_word_alchemist',
  'g3_word_knight_shop'
];

export class MathEngine {
  constructor() {
    this.grade1Bag = [];
    this.grade3Bag = [];
    this.lastDrawnType = { 1: null, 3: null };
  }

  // „Shuffle Bag“ traukimas: garantuoja, kad joks užduoties tipas nepasikartos, kol nebus ištraukti visi 28 tipai!
  drawFromShuffleBag(grade = 1) {
    const isGrade3 = Number(grade) === 3;
    const bagKey = isGrade3 ? 'grade3Bag' : 'grade1Bag';
    const sourceTemplates = isGrade3 ? GRADE_3_TEMPLATES : GRADE_1_TEMPLATES;
    const gKey = isGrade3 ? 3 : 1;

    if (this[bagKey].length === 0) {
      const refilled = shuffle(sourceTemplates);
      // Apsauga, kad naujo krepšelio pirmas ištraukiamas elementas (paskutinis masyve dėl .pop()) nesutaptų su ką tik buvusiu
      if (refilled.length > 1 && refilled[refilled.length - 1] === this.lastDrawnType[gKey]) {
        const temp = refilled[refilled.length - 1];
        refilled[refilled.length - 1] = refilled[0];
        refilled[0] = temp;
      }
      this[bagKey] = refilled;
    }

    const pickedTemplate = this[bagKey].pop();
    this.lastDrawnType[gKey] = pickedTemplate;
    return pickedTemplate;
  }

  generateQuestion(grade = 1, levelId = 1, encounterType = 'chest') {
    const pickedTemplate = this.drawFromShuffleBag(grade);
    return Number(grade) === 3
      ? this.generateGrade3ByTemplate(pickedTemplate, levelId, encounterType)
      : this.generateGrade1ByTemplate(pickedTemplate, levelId, encounterType);
  }

  buildNumberOptions(correct, minVal = 0, step = 1) {
    const opts = new Set([String(correct)]);
    const offsets = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 10, -10];
    const shuffled = shuffle(offsets);

    for (const off of shuffled) {
      if (opts.size >= 4) break;
      const candidate = correct + off * step;
      if (candidate >= minVal && candidate !== correct) {
        opts.add(String(candidate));
      }
    }
    while (opts.size < 4) {
      const fb = Math.max(minVal, correct + randInt(1, 8));
      if (fb !== correct) opts.add(String(fb));
    }
    return shuffle([...opts]);
  }

  // ============================================================================
  // 1 KLASĖ (LINUI) – 28 SKIRTINGI ŠABLONAI „SHUFFLE BAG“ KREPŠELYJE
  // ============================================================================
  generateGrade1ByTemplate(picked, levelId, encounterType) {
    const maxNum = levelId <= 3 ? 10 : levelId <= 6 ? 15 : 20;

    switch (picked) {
      case 'g1_breather_add': {
        const a = randInt(1, 4);
        const b = randInt(1, 4);
        const ans = a + b;
        return {
          templateId: picked,
          prompt: `${a} + ${b} = ?`,
          subtitle: '⚡ Greita poilsio užduotis!',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Tai lengva poilsio užduotėlė – ${a} + ${b} = ${ans}!`
        };
      }

      case 'g1_breather_sub': {
        const a = randInt(3, 7);
        const b = randInt(1, Math.min(3, a - 1));
        const ans = a - b;
        return {
          templateId: picked,
          prompt: `${a} - ${b} = ?`,
          subtitle: '⚡ Greita poilsio atimtis!',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Atimk ${a} - ${b} = ${ans}!`
        };
      }

      case 'g1_add_dots': {
        const a = randInt(2, Math.min(9, maxNum - 2));
        const b = randInt(2, Math.min(9, maxNum - a));
        const ans = a + b;
        return {
          templateId: picked,
          prompt: `${a} + ${b} = ?`,
          subtitle: '🌱 Vaizdinė sudėtis',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Suskaičiuok rutuliukus: ${a} ir dar ${b} iš viso yra ${ans}!`,
          visualAid: { type: 'dots', a, b, op: '+' }
        };
      }

      case 'g1_sub_apples': {
        const a = randInt(5, Math.min(14, maxNum));
        const b = randInt(2, a - 1);
        const ans = a - b;
        return {
          templateId: picked,
          prompt: `${a} - ${b} = ?`,
          subtitle: '🍏 Vaizdinė atimtis',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 0, 1),
          hint: `Užuomina: Turėjai ${a} obuolius, ${b} suvalgei. Liko ${ans}!`,
          visualAid: { type: 'dots', a, b, op: '-' }
        };
      }

      case 'g1_chain_3ops': {
        const a = randInt(5, 10);
        const b = randInt(3, 6);
        const c = randInt(2, a + b - 2);
        const ans = a + b - c;
        return {
          templateId: picked,
          prompt: `${a} + ${b} - ${c} = ?`,
          subtitle: '🔗 Kelių veiksmų grandinėlė',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Pirma sudėk ${a} + ${b} = ${a + b}, tada atimk ${c}: ${a + b} - ${c} = ${ans}!`
        };
      }

      case 'g1_chain_add3': {
        const a = randInt(2, 6);
        const b = randInt(2, 5);
        const c = randInt(1, 5);
        const ans = a + b + c;
        return {
          templateId: picked,
          prompt: `${a} + ${b} + ${c} = ?`,
          subtitle: '🔗 Trijų skaičių sudėtis',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 2, 1),
          hint: `Užuomina: ${a} + ${b} = ${a + b}, ir dar + ${c} = ${ans}!`
        };
      }

      case 'g1_shapes_recognize': {
        const shapes = [
          { id: 'triangle', name: 'Trikampis', corners: 3 },
          { id: 'square', name: 'Kvadratas', corners: 4 },
          { id: 'circle', name: 'Apskritimas', corners: 0 },
          { id: 'pentagon', name: 'Penkiakampis', corners: 5 },
          { id: 'rectangle', name: 'Stačiakampis', corners: 4 }
        ];
        const target = shapes[randInt(0, shapes.length - 1)];
        const wrongNames = shuffle(shapes.filter((s) => s.name !== target.name).map((s) => s.name)).slice(0, 3);
        return {
          templateId: picked,
          prompt: `Kaip vadinasi ši geometrinė figūra?`,
          subtitle: '📐 Geometrinių figūrų pažinimas',
          answer: target.name,
          options: shuffle([target.name, ...wrongNames]),
          hint: `Užuomina: Pažiūrėk į figūros formą ir jos kampus (${target.corners} kampai)!`,
          visualAid: { type: 'shape_svg', shape: target.id, label: '?' }
        };
      }

      case 'g1_shapes_corners': {
        const shapes = [
          { id: 'triangle', name: 'Trikampis', corners: 3 },
          { id: 'square', name: 'Kvadratas', corners: 4 },
          { id: 'pentagon', name: 'Penkiakampis', corners: 5 },
          { id: 'hexagon', name: 'Šešiakampis', corners: 6 },
          { id: 'circle', name: 'Apskritimas', corners: 0 }
        ];
        const target = shapes[randInt(0, shapes.length - 1)];
        return {
          templateId: picked,
          prompt: `Kiek KAMPŲ turi ši figūra (${target.name})?`,
          subtitle: '📐 Suskaičiuok figūros kampus',
          answer: String(target.corners),
          options: shuffle(['0', '3', '4', '5', '6'].slice(0, 4).includes(String(target.corners))
            ? ['0', '3', '4', '5']
            : ['3', '4', '5', '6']),
          hint: `Užuomina: ${target.name} turi lygiai ${target.corners} kampus!`,
          visualAid: { type: 'shape_svg', shape: target.id, label: target.name }
        };
      }

      case 'g1_shapes_count_row': {
        const catalog = [
          { icon: '🔺', name: 'trikampių' },
          { icon: '🟦', name: 'kvadratų' },
          { icon: '🟢', name: 'apskritimų' },
          { icon: '⭐', name: 'žvaigždučių' }
        ];
        const target = catalog[randInt(0, catalog.length - 1)];
        const targetCount = randInt(2, 5);
        const items = [];
        for (let i = 0; i < targetCount; i++) items.push(target.icon);
        const others = catalog.filter((c) => c.icon !== target.icon);
        const extraCount = randInt(3, 4);
        for (let i = 0; i < extraCount; i++) {
          items.push(others[randInt(0, others.length - 1)].icon);
        }
        const shuffledRow = shuffle(items);
        return {
          templateId: picked,
          prompt: `Suskaičiuok, kiek paveikslėlyje yra ${target.name} (${target.icon})?`,
          subtitle: '🔍 Dėmesio ir figūrų skaičiavimas',
          answer: String(targetCount),
          options: this.buildNumberOptions(targetCount, 1, 1),
          hint: `Užuomina: Pirštu bakstelėk kiekvieną ${target.icon} – jų yra ${targetCount}!`,
          visualAid: { type: 'emoji_row', items: shuffledRow }
        };
      }

      case 'g1_clock_hours': {
        const hour = randInt(1, 12);
        const opts = this.buildNumberOptions(hour, 1, 1).map((n) => `${n}:00`);
        const ansStr = `${hour}:00`;
        if (!opts.includes(ansStr)) opts[0] = ansStr;
        return {
          templateId: picked,
          prompt: `Kiek valandų rodo šis laikrodis?`,
          subtitle: '🕒 Laikrodžio pažinimas (pilnos valandos)',
          answer: ansStr,
          options: shuffle(opts),
          hint: `Užuomina: Ilgoji rodyklė rodo į 12, o trumpoji rodo į ${hour} -> dabar yra ${hour}:00 val.!`,
          visualAid: { type: 'clock_svg', hours: hour, minutes: 0 }
        };
      }

      case 'g1_clock_half': {
        const startH = randInt(1, 9);
        const addH = randInt(1, 3);
        const endH = startH + addH;
        const ansStr = `${endH}:00`;
        const opts = this.buildNumberOptions(endH, 1, 1).map((n) => `${n}:00`);
        if (!opts.includes(ansStr)) opts[0] = ansStr;
        return {
          templateId: picked,
          prompt: `Dabar laikrodis rodo ${startH}:00 val. Kiek valandų jis rodys po ${addH} val.?`,
          subtitle: '🕒 Laiko skaičiavimas valandomis',
          answer: ansStr,
          options: shuffle(opts),
          hint: `Užuomina: Prie ${startH} val. pridėk ${addH} val. -> gausi ${endH}:00!`,
          visualAid: { type: 'clock_svg', hours: startH, minutes: 0 }
        };
      }

      case 'g1_compare_croc': {
        const mode = randInt(1, 3);
        let a = randInt(2, maxNum);
        let b = randInt(2, maxNum);
        if (mode === 1 && a === b) b = a + 2;
        if (mode === 3) b = a;
        const ans = a > b ? '>' : a < b ? '<' : '=';
        return {
          templateId: picked,
          prompt: `Kurį ženklą (<, > arba =) reikia įrašyti:  ${a}  [ ? ]  ${b}`,
          subtitle: '🐊 Krokodilo nasrai: Daugiau, Mažiau ar Lygu?',
          answer: ans,
          options: ['>', '<', '='],
          hint: `Užuomina: Krokodilo nasrai visada žiūri į DIDESNĮ skaičių! (${a} ${ans} ${b})`,
          visualAid: { type: 'compare_box', left: String(a), right: String(b) }
        };
      }

      case 'g1_even_odd': {
        const askEven = Math.random() < 0.5;
        const evens = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
        const odds = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
        if (askEven) {
          const correct = evens[randInt(0, 7)];
          const wrong = shuffle(odds).slice(0, 3);
          return {
            templateId: picked,
            prompt: `Kuris iš šių skaičių yra LYGINIS (porinis)?`,
            subtitle: '🧦 Lyginiai ir nelyginiai skaičiai',
            answer: String(correct),
            options: shuffle([String(correct), ...wrong.map(String)]),
            hint: `Užuomina: Lyginį skaičių galima padalinti į dvi lygias poras (2, 4, 6, 8, 10...). Tai ${correct}!`
          };
        } else {
          const correct = odds[randInt(0, 7)];
          const wrong = shuffle(evens).slice(0, 3);
          return {
            templateId: picked,
            prompt: `Kuris iš šių skaičių yra NELYGINIS (neporinis)?`,
            subtitle: '🧦 Lyginiai ir nelyginiai skaičiai',
            answer: String(correct),
            options: shuffle([String(correct), ...wrong.map(String)]),
            hint: `Užuomina: Nelyginiai skaičiai baigiasi 1, 3, 5, 7 arba 9 (vienas lieka be poros). Tai ${correct}!`
          };
        }
      }

      case 'g1_animal_parts': {
        const creatures = [
          { icon: '🐱', namePlural: 'katės', partName: 'letenų', perOne: 4, maxCount: 4 },
          { icon: '🐶', namePlural: 'šuniukai', partName: 'ausų', perOne: 2, maxCount: 6 },
          { icon: '🐥', namePlural: 'viščiukai', partName: 'kojyčių', perOne: 2, maxCount: 5 },
          { icon: '🚲', namePlural: 'dviračiai', partName: 'ratų', perOne: 2, maxCount: 6 },
          { icon: '🚗', namePlural: 'automobiliai', partName: 'ratų', perOne: 4, maxCount: 3 }
        ];
        const cr = creatures[randInt(0, creatures.length - 1)];
        const count = randInt(2, cr.maxCount);
        const ans = count * cr.perOne;
        const sumParts = Array(count).fill(cr.perOne).join(' + ');
        return {
          templateId: picked,
          prompt: `Kiek iš viso ${cr.partName} turi šie ${count} ${cr.namePlural}?`,
          subtitle: `🐾 Objekto dalių skaičiavimas (po ${cr.perOne})`,
          answer: String(ans),
          options: this.buildNumberOptions(ans, 2, 1),
          hint: `Užuomina: Kiekvienas turi po ${cr.perOne}, tad sudėk: ${sumParts} = ${ans}!`,
          visualAid: { type: 'emoji_row', items: Array(count).fill(cr.icon) }
        };
      }

      case 'g1_scales': {
        const rightKnown = randInt(3, 9);
        const boxVal = randInt(2, 8);
        const leftTotal = rightKnown + boxVal;
        return {
          templateId: picked,
          prompt: `Kiek sveria dėžutė [ ? ], kad svarstyklės būtų lygios?`,
          subtitle: '⚖️ Svarstyklių pusiausvyra',
          answer: String(boxVal),
          options: this.buildNumberOptions(boxVal, 1, 1),
          hint: `Užuomina: Kairėje yra ${leftTotal} kg, o dešinėje jau yra ${rightKnown} kg. Atimk: ${leftTotal} - ${rightKnown} = ${boxVal}!`,
          visualAid: {
            type: 'scales',
            leftText: `${leftTotal} kg`,
            rightKnown: `${rightKnown} kg`,
            rightBox: '? kg'
          }
        };
      }

      case 'g1_money_change': {
        const coinSets = [
          [5, 2, 1],
          [5, 2, 2],
          [5, 5, 2],
          [2, 2, 2, 1]
        ];
        const coins = coinSets[randInt(0, coinSets.length - 1)];
        const totalMoney = coins.reduce((a, b) => a + b, 0);
        const itemCost = randInt(3, totalMoney - 1);
        const change = totalMoney - itemCost;
        return {
          templateId: picked,
          prompt: `Turi šias monetas ir perki žaislą už ${itemCost} €. Kiek eurų grąžos liks?`,
          subtitle: '💶 Pinigai ir grąža',
          answer: String(change),
          options: this.buildNumberOptions(change, 1, 1),
          hint: `Užuomina: Pirma sudėk monetas (${coins.join(' + ')} = ${totalMoney} €), tada atimk ${itemCost} €!`,
          visualAid: { type: 'coins', coins, itemCost }
        };
      }

      case 'g1_sequence': {
        const step = randInt(1, 3);
        const start = randInt(1, 7);
        const seq = [start, start + step, start + step * 2, start + step * 3];
        const ans = start + step * 4;
        return {
          templateId: picked,
          prompt: `Atrask dėsningumą ir įrašyk kitą skaičių:`,
          subtitle: `🚂 Skaičių traukinukas (+${step})`,
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Kiekvienas skaičius didėja po +${step}. Tad ${seq[3]} + ${step} = ${ans}!`,
          visualAid: { type: 'sequence', items: [...seq.map(String), '?'] }
        };
      }

      case 'g1_sequence_down': {
        const step = randInt(1, 2);
        const start = randInt(12, 18);
        const seq = [start, start - step, start - step * 2, start - step * 3];
        const ans = start - step * 4;
        return {
          templateId: picked,
          prompt: `Skaičiai mažėja! Kuris skaičius bus sekantis?`,
          subtitle: `🚂 Atgalinis traukinukas (-${step})`,
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Kiekvienas skaičius mažėja po -${step}. Tad ${seq[3]} - ${step} = ${ans}!`,
          visualAid: { type: 'sequence', items: [...seq.map(String), '?'] }
        };
      }

      case 'g1_missing_addend': {
        const a = randInt(3, 9);
        const ans = randInt(2, 8);
        const sum = a + ans;
        return {
          templateId: picked,
          prompt: `${a} + [ ? ] = ${sum}`,
          subtitle: '🧩 Surask paslėptą dėmenį!',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Iš ${sum} atimk ${a}: ${sum} - ${a} = ${ans}!`
        };
      }

      case 'g1_missing_subtrahend': {
        const a = randInt(8, 16);
        const ans = randInt(2, 6);
        const diff = a - ans;
        return {
          templateId: picked,
          prompt: `${a} - [ ? ] = ${diff}`,
          subtitle: '🧩 Kiek buvo atimta?',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Iš ${a} atimk ${diff}: ${a} - ${diff} = ${ans}!`
        };
      }

      case 'g1_neighbors': {
        const n = randInt(5, 18);
        return {
          templateId: picked,
          prompt: `Kuris skaičius skaičių eilėje yra tarp ${n - 1} ir ${n + 1}?`,
          subtitle: '🏡 Skaičiaus kaimynai',
          answer: String(n),
          options: this.buildNumberOptions(n, 1, 1),
          hint: `Užuomina: Skaičiuok iš eilės: ${n - 1}, [${n}], ${n + 1}!`,
          visualAid: { type: 'sequence', items: [String(n - 1), '?', String(n + 1)] }
        };
      }

      case 'g1_tens_ones': {
        const ones = randInt(1, 9);
        const num = 10 + ones;
        const askTotal = Math.random() < 0.5;
        if (askTotal) {
          return {
            templateId: picked,
            prompt: `1 dešimtis ir ${ones} vienetai – koks tai skaičius?`,
            subtitle: '🔟 Dešimtys ir vienetai',
            answer: String(num),
            options: this.buildNumberOptions(num, 10, 1),
            hint: `Užuomina: 1 dešimtis yra 10, tad 10 + ${ones} = ${num}!`
          };
        } else {
          return {
            templateId: picked,
            prompt: `Skaičiuje ${num} yra 1 dešimtis ir kiek VIENETŲ?`,
            subtitle: '🔟 Dešimtys ir vienetai',
            answer: String(ones),
            options: this.buildNumberOptions(ones, 1, 1),
            hint: `Užuomina: ${num} = 10 + ${ones}, vadinasi vienetų yra ${ones}!`
          };
        }
      }

      case 'g1_double_half': {
        const half = randInt(2, 8);
        const doubleVal = half * 2;
        if (Math.random() < 0.5) {
          return {
            templateId: picked,
            prompt: `Linas turi ${half} monetas, o Lukas – DVIGUBAI daugiau. Kiek monetų turi Lukas?`,
            subtitle: '✨ Dvigubinimas',
            answer: String(doubleVal),
            options: this.buildNumberOptions(doubleVal, 2, 1),
            hint: `Užuomina: Dvigubai – tai ${half} + ${half} = ${doubleVal}!`
          };
        } else {
          return {
            templateId: picked,
            prompt: `Močiutė padalino ${doubleVal} obuolius po lygiai 2 broliams. Po kiek obuolių gavo kiekvienas?`,
            subtitle: '✨ Dalijimas pusiau',
            answer: String(half),
            options: this.buildNumberOptions(half, 1, 1),
            hint: `Užuomina: Pusė nuo ${doubleVal} yra ${half} (nes ${half} + ${half} = ${doubleVal})!`
          };
        }
      }

      case 'g1_word_birds': {
        const onTree = randInt(4, 9);
        const flewIn = randInt(2, 6);
        const ans = onTree + flewIn;
        return {
          templateId: picked,
          prompt: `Ant šakos tupėjo ${onTree} paukšteliai. Atskrido dar ${flewIn}. Kiek paukštelių dabar tupi ant šakos?`,
          subtitle: '🐦 Tekstinis uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Sudėk ${onTree} + ${flewIn} = ${ans} paukšteliai!`
        };
      }

      case 'g1_word_balloons': {
        const balloons = randInt(7, 14);
        const popped = randInt(2, 5);
        const ans = balloons - popped;
        return {
          templateId: picked,
          prompt: `Klounas turėjo ${balloons} balionus, bet ${popped} balionai nuskrido į dangų. Kiek balionų jam liko?`,
          subtitle: '🎈 Tekstinis uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Atimk ${balloons} - ${popped} = ${ans}!`
        };
      }

      case 'g1_word_hedgehog': {
        const mushrooms = randInt(3, 8);
        const berries = randInt(3, 7);
        const ans = mushrooms + berries;
        return {
          templateId: picked,
          prompt: `Ežiukas miške rado ${mushrooms} grybus ir ${berries} obuolius. Kiek gėrybių iš viso neša ežiukas?`,
          subtitle: '🦔 Miško tekstinis uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: ${mushrooms} + ${berries} = ${ans}!`
        };
      }

      case 'g1_word_chest': {
        const chestCoins = randInt(8, 15);
        const spent = randInt(3, 6);
        const ans = chestCoins - spent;
        return {
          templateId: picked,
          prompt: `Linas skrynioje rado ${chestCoins} monetas. Kalvėje jis išleido ${spent} monetas. Kiek monetų liko Linui?`,
          subtitle: '🪙 Herojaus tekstinis uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: ${chestCoins} - ${spent} = ${ans}!`
        };
      }

      case 'g1_word_rabbits':
      default: {
        const a = randInt(5, 9);
        const b = randInt(2, 4);
        const c = randInt(2, 5);
        const ans = a - b + c;
        return {
          templateId: picked,
          prompt: `Pievoje žaidė ${a} triušiukai. ${b} nubėgo į urvelį, o vėliau atšuoliavo dar ${c}. Kiek triušiukų dabar pievoje?`,
          subtitle: '🐰 Dviejų veiksmų istorija',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: ${a} - ${b} = ${a - b}, ir dar + ${c} = ${ans}!`
        };
      }
    }
  }

  // ============================================================================
  // 3 KLASĖ (LUKUI) – 28 SKIRTINGI ŠABLONAI „SHUFFLE BAG“ KREPŠELYJE
  // ============================================================================
  generateGrade3ByTemplate(picked, levelId, encounterType) {
    switch (picked) {
      case 'g3_breather_mult': {
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        const ans = a * b;
        return {
          templateId: picked,
          prompt: `${a} × ${b} = ?`,
          subtitle: '⚡ Greita poilsio daugyba!',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 2, 1),
          hint: `Užuomina: Greita poilsio užduotis – ${a} × ${b} = ${ans}!`
        };
      }

      case 'g3_breather_add': {
        const a = randInt(2, 6) * 10;
        const b = randInt(1, 3) * 10;
        const ans = a + b;
        return {
          templateId: picked,
          prompt: `${a} + ${b} = ?`,
          subtitle: '⚡ Greita dešimčių sudėtis!',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 10, 10),
          hint: `Užuomina: ${a / 10} dešimtys + ${b / 10} dešimtys = ${ans}!`
        };
      }

      case 'g3_chain_3ops': {
        const a = randInt(3, 7);
        const b = randInt(4, 7);
        const c = randInt(8, 18);
        const d = randInt(3, 10);
        const ans = a * b + c - d;
        return {
          templateId: picked,
          prompt: `${a} × ${b} + ${c} - ${d} = ?`,
          subtitle: '🔗 Ilgas 3 veiksmų skaičiavimas',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 5, 1),
          hint: `Užuomina: 1) ${a} × ${b} = ${a * b}. 2) ${a * b} + ${c} = ${a * b + c}. 3) Atimk ${d} -> ${ans}!`
        };
      }

      case 'g3_chain_parentheses': {
        const div = randInt(3, 8);
        const quot = randInt(4, 9);
        const sumInside = div * quot;
        const a = randInt(8, sumInside - 4);
        const b = sumInside - a;
        const addEnd = randInt(9, 25);
        const ans = quot + addEnd;
        return {
          templateId: picked,
          prompt: `(${a} + ${b}) : ${div} + ${addEnd} = ?`,
          subtitle: '🧮 Veiksmų tvarka su skliaustais',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 8, 1),
          hint: `Užuomina: 1) Skliaustai: ${a} + ${b} = ${sumInside}. 2) Dalyba: ${sumInside} : ${div} = ${quot}. 3) Sudėtis: ${quot} + ${addEnd} = ${ans}!`
        };
      }

      case 'g3_chain_two_mults': {
        const a = randInt(3, 7);
        const b = randInt(3, 6);
        const c = randInt(2, 5);
        const d = randInt(3, 6);
        const ans = a * b + c * d;
        return {
          templateId: picked,
          prompt: `${a} × ${b} + ${c} × ${d} = ?`,
          subtitle: '🔗 Dviejų sandaugų suma',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 8, 1),
          hint: `Užuomina: Pirma sudaugink ${a} × ${b} = ${a * b} ir ${c} × ${d} = ${c * d}, tada sudėk: ${a * b} + ${c * d} = ${ans}!`
        };
      }

      case 'g3_fractions_pie': {
        const denoms = [3, 4, 5, 6, 8];
        const denom = denoms[randInt(0, denoms.length - 1)];
        const num = randInt(1, denom - 1);
        const correct = `${num}/${denom}`;
        const wrongSet = new Set([
          `${denom - num}/${denom}`,
          `${Math.max(1, num - 1)}/${denom}`,
          `${Math.min(denom - 1, num + 1)}/${denom}`,
          `${num}/${denom + 1}`,
          `1/${denom}`
        ]);
        wrongSet.delete(correct);
        const options = shuffle([correct, ...shuffle([...wrongSet]).slice(0, 3)]);
        return {
          templateId: picked,
          prompt: `Pica padalinta į ${denom} lygias dalis. Kuri picos dalis (trupmena) yra NUSPALVINTA?`,
          subtitle: '🍕 Trupmenos pažinimas',
          answer: correct,
          options,
          hint: `Užuomina: Viršuje (skaitiklyje) rašome nuspalvintas dalis (${num}), o apačioje (vardiklyje) – visas dalis (${denom}): ${correct}!`,
          visualAid: { type: 'fraction_pie', num, denom }
        };
      }

      case 'g3_time_diff': {
        const startHour = randInt(8, 18);
        const startMinChoices = [0, 10, 15, 20, 30, 45];
        const startMin = startMinChoices[randInt(0, startMinChoices.length - 1)];
        const addMinChoices = [15, 20, 30, 40, 45, 50];
        const addMin = addMinChoices[randInt(0, addMinChoices.length - 1)];

        const totalMinutes = startHour * 60 + startMin + addMin;
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const correct = formatTime(endH, endM);
        const wrong1 = formatTime(endH, (endM + 15) % 60);
        const wrong2 = formatTime((endH + 1) % 24, endM);
        const wrong3 = formatTime(startHour, (startMin + addMin) % 60);
        const opts = Array.from(new Set([correct, wrong1, wrong2, wrong3, formatTime(endH, (endM + 30) % 60)])).slice(0, 4);

        return {
          templateId: picked,
          prompt: `Dabar laikrodis rodo ${formatTime(startHour, startMin)}. Kiek valandų bus po ${addMin} minučių?`,
          subtitle: '⏱️ Laiko skaičiavimas (valandos ir minutės)',
          answer: correct,
          options: shuffle(opts),
          hint: `Užuomina: 1 valanda turi 60 minučių! Prie ${formatTime(startHour, startMin)} pridėjus ${addMin} min. bus ${correct}!`,
          visualAid: { type: 'clock_svg', hours: startHour % 12 || 12, minutes: startMin, digital: formatTime(startHour, startMin) }
        };
      }

      case 'g3_units_length_m': {
        const m = randInt(1, 6);
        const cm = randInt(1, 9) * 10 + randInt(0, 5);
        const ans = m * 100 + cm;
        return {
          templateId: picked,
          prompt: `Kiek centimetrų (cm) yra ${m} m ir ${cm} cm?`,
          subtitle: '📏 Ilgio vienetų pavertimas (1 m = 100 cm)',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 50, 10),
          hint: `Užuomina: 1 metras turi 100 cm! Tad ${m} m = ${m * 100} cm, plius ${cm} cm = ${ans} cm!`
        };
      }

      case 'g3_units_length_dm': {
        if (Math.random() < 0.5) {
          const dm = randInt(2, 9);
          const cm = randInt(1, 8);
          const ans = dm * 10 + cm;
          return {
            templateId: picked,
            prompt: `Kiek centimetrų (cm) yra ${dm} dm ir ${cm} cm?`,
            subtitle: '📏 Ilgio vienetai (1 dm = 10 cm)',
            answer: String(ans),
            options: this.buildNumberOptions(ans, 10, 5),
            hint: `Užuomina: 1 decimetras (dm) = 10 cm. Tad ${dm} × 10 + ${cm} = ${ans} cm!`
          };
        } else {
          const cm = randInt(3, 15);
          const mm = randInt(2, 9);
          const ans = cm * 10 + mm;
          return {
            templateId: picked,
            prompt: `Kiek milimetrų (mm) yra ${cm} cm ir ${mm} mm?`,
            subtitle: '📏 Ilgio vienetai (1 cm = 10 mm)',
            answer: String(ans),
            options: this.buildNumberOptions(ans, 10, 5),
            hint: `Užuomina: 1 cm = 10 mm, todėl ${cm} cm = ${cm * 10} mm. Pridėk ${mm} mm -> ${ans} mm!`
          };
        }
      }

      case 'g3_units_weight': {
        const kg = randInt(1, 4);
        const g = randInt(1, 8) * 100;
        const ans = kg * 1000 + g;
        return {
          templateId: picked,
          prompt: `Kiek gramų (g) sveria kalvio priekalas, jei jo svoris yra ${kg} kg ir ${g} g?`,
          subtitle: '⚖️ Svorio vienetai (1 kg = 1000 g)',
          answer: String(ans),
          options: shuffle([
            String(ans),
            String(kg * 100 + g),
            String(ans + 100),
            String(Math.max(100, ans - 200))
          ]),
          hint: `Užuomina: 1 kilogramas (kg) turi 1000 gramų! Tad ${kg * 1000} + ${g} = ${ans} g!`
        };
      }

      case 'g3_magic_square': {
        const base = randInt(1, 5);
        const grid = [
          [base + 7, base, base + 5],
          [base + 2, base + 4, base + 6],
          [base + 3, base + 8, base + 1]
        ];
        const rowSum = base * 3 + 12;
        const hideR = randInt(0, 2);
        const hideC = randInt(0, 2);
        const ans = grid[hideR][hideC];
        const displayGrid = grid.map((r, ri) =>
          r.map((val, ci) => (ri === hideR && ci === hideC ? '?' : String(val)))
        );

        return {
          templateId: picked,
          prompt: `Magiškame kvadrate kiekvienos eilutės ir stulpelio skaičių suma lygi ${rowSum}. Koks skaičius slepiasi po „?“`,
          subtitle: '🧩 Magiškas 3×3 kvadratas (Sudoku logika)',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: Sudėk du žinomus tos eilutės skaičius ir atimk iš ${rowSum}!`,
          visualAid: { type: 'magic_square', grid: displayGrid, targetSum: rowSum }
        };
      }

      case 'g3_perimeter': {
        const w = randInt(6, 18);
        const h = randInt(4, 12);
        const ans = 2 * (w + h);
        return {
          templateId: picked,
          prompt: `Apskaičiuok šio stačiakampio pilies kiemo PERIMETRĄ (visų 4 kraštinių sumą):`,
          subtitle: '📐 Stačiakampio perimetras',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 10, 2),
          hint: `Užuomina: P = ${w} + ${w} + ${h} + ${h} = ${ans} m!`,
          visualAid: { type: 'rectangle', widthLabel: `${w} m`, heightLabel: `${h} m`, insideText: 'Perimetras = ?' }
        };
      }

      case 'g3_area_grid': {
        const w = randInt(4, 9);
        const h = randInt(3, 7);
        const ans = w * h;
        return {
          templateId: picked,
          prompt: `Pilies salės ilgis yra ${w} m, o plotis ${h} m. Koks yra šios salės PLOTAS (m²)?`,
          subtitle: '🟦 Stačiakampio plotas (S = a × b)',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 6, 2),
          hint: `Užuomina: Norint rasti stačiakampio plotą, reikia ilgį padauginti iš pločio: ${w} × ${h} = ${ans} m²!`,
          visualAid: { type: 'rectangle', widthLabel: `${w} m`, heightLabel: `${h} m`, insideText: `Plotas S = ${w} × ${h}` }
        };
      }

      case 'g3_missing_divisor': {
        const ans = randInt(3, 9);
        const other = randInt(4, 9);
        const prod = ans * other;
        return {
          templateId: picked,
          prompt: `${prod} : [ ? ] = ${other}`,
          subtitle: '🧩 Nežinomo daliklio paieška',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 2, 1),
          hint: `Užuomina: Padalink ${prod} : ${other} = ${ans} (nes ${other} × ${ans} = ${prod})!`
        };
      }

      case 'g3_missing_factor': {
        const ans = randInt(3, 9);
        const other = randInt(4, 9);
        const prod = ans * other;
        return {
          templateId: picked,
          prompt: `[ ? ] × ${other} = ${prod}`,
          subtitle: '🧩 Nežinomo dauginamojo paieška',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 2, 1),
          hint: `Užuomina: Padalink ${prod} : ${other} = ${ans}!`
        };
      }

      case 'g3_mult_tens': {
        const a = randInt(2, 7) * 10;
        const b = randInt(2, 6);
        const ans = a * b;
        return {
          templateId: picked,
          prompt: `${a} × ${b} = ?`,
          subtitle: '⚡ Pilnų dešimčių daugyba',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 20, 10),
          hint: `Užuomina: Padaugink ${a / 10} × ${b} = ${(a / 10) * b} ir gale prirašyk nulį -> ${ans}!`
        };
      }

      case 'g3_mult_table': {
        const a = randInt(4, 9);
        const b = randInt(4, 9);
        const ans = a * b;
        return {
          templateId: picked,
          prompt: `${a} × ${b} = ?`,
          subtitle: '⚔️ Daugybos lentelė',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 8, 1),
          hint: `Užuomina: ${a - 1} × ${b} = ${(a - 1) * b}, pridėk dar ${b} -> ${ans}!`
        };
      }

      case 'g3_compare_expr': {
        const a1 = randInt(3, 8);
        const a2 = randInt(4, 8);
        const leftVal = a1 * a2;
        const offset = randInt(-1, 1) * randInt(0, 4);
        const rightVal = leftVal + offset;
        const r1 = randInt(10, rightVal - 4);
        const r2 = rightVal - r1;
        const ans = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';
        return {
          templateId: picked,
          prompt: `Palygink reiškinius (<, > arba =):  ${a1} × ${a2}  [ ? ]  ${r1} + ${r2}`,
          subtitle: '⚖️ Reiškinių palyginimas',
          answer: ans,
          options: ['>', '<', '='],
          hint: `Užuomina: Kairėje ${a1} × ${a2} = ${leftVal}, o dešinėje ${r1} + ${r2} = ${rightVal}. Tad ženklas yra „${ans}“!`,
          visualAid: { type: 'compare_box', left: `${a1} × ${a2}`, right: `${r1} + ${r2}` }
        };
      }

      case 'g3_fraction_of_number': {
        const denom = randInt(2, 6);
        const mult = randInt(3, 9);
        const total = denom * mult;
        return {
          templateId: picked,
          prompt: `Skrynioje yra ${total} auksinės monetos. Lukas paėmė 1/${denom} visų monetų. Kiek monetų jis paėmė?`,
          subtitle: `🪙 Skaičiaus dalies (1/${denom}) radimas`,
          answer: String(mult),
          options: this.buildNumberOptions(mult, 2, 1),
          hint: `Užuomina: Norint rasti 1/${denom} skaičiaus dalį, reikia ${total} padalinti iš ${denom}: ${total} : ${denom} = ${mult}!`
        };
      }

      case 'g3_roman_numerals': {
        const romans = [
          { r: 'IV', v: 4 },
          { r: 'VI', v: 6 },
          { r: 'IX', v: 9 },
          { r: 'XII', v: 12 },
          { r: 'XIV', v: 14 },
          { r: 'XV', v: 15 },
          { r: 'XIX', v: 19 },
          { r: 'XX', v: 20 },
          { r: 'XXV', v: 25 },
          { r: 'XXX', v: 30 }
        ];
        const pick = romans[randInt(0, romans.length - 1)];
        return {
          templateId: picked,
          prompt: `Kokį arabišką skaičių reiškia šis senovinis romėniškas skaičius:  ${pick.r} ?`,
          subtitle: '🏛️ Romėniški skaičiai (I=1, V=5, X=10)',
          answer: String(pick.v),
          options: this.buildNumberOptions(pick.v, 1, 1),
          hint: `Užuomina: I = 1, V = 5, X = 10. Todėl ${pick.r} yra ${pick.v}!`
        };
      }

      case 'g3_rounding': {
        const tens = randInt(2, 8);
        const ones = [1, 2, 3, 4, 6, 7, 8, 9][randInt(0, 7)];
        const num = tens * 10 + ones;
        const ans = ones >= 5 ? (tens + 1) * 10 : tens * 10;
        return {
          templateId: picked,
          prompt: `Suapvalink skaičių ${num} iki artimiausios DEŠIMTIES:`,
          subtitle: '🎯 Skaičių apvalinimas',
          answer: String(ans),
          options: shuffle([
            String(ans),
            String(ans === tens * 10 ? (tens + 1) * 10 : tens * 10),
            String((tens - 1) * 10),
            String((tens + 2) * 10)
          ]),
          hint: `Užuomina: Paskutinis skaitmuo yra ${ones}. ${ones >= 5 ? 'Kadangi tai 5 ar daugiau, apvaliname į didesnę pusę' : 'Kadangi tai mažiau nei 5, apvaliname į mažesnę pusę'} -> ${ans}!`
        };
      }

      case 'g3_remainder': {
        const div = randInt(3, 6);
        const quot = randInt(2, 6);
        const rem = randInt(1, div - 1);
        const total = div * quot + rem;
        return {
          templateId: picked,
          prompt: `Padalinus ${total} kristalus po lygiai į ${div} skrynias, kiek kristalų LIKS (liekana)?`,
          subtitle: '💎 Dalyba su liekana',
          answer: String(rem),
          options: shuffle(['0', '1', '2', '3', '4'].slice(0, 4).includes(String(rem))
            ? ['0', '1', '2', '3']
            : ['1', '2', '3', String(rem)]),
          hint: `Užuomina: ${div} × ${quot} = ${div * quot}. Atimk iš ${total}: ${total} - ${div * quot} = ${rem} (liekana)!`
        };
      }

      case 'g3_word_orchard': {
        const initial = randInt(20, 45);
        const broken = randInt(3, 9);
        const planted = randInt(8, 18);
        const ans = initial - broken + planted;
        return {
          templateId: picked,
          prompt: `Sode augo ${initial} obelys. Vėjas nulaužė ${broken}, o pavasarį pasodino dar ${planted}. Kiek obelų yra dabar?`,
          subtitle: '🌳 Tekstinis žodžių uždavinys (2 veiksmai)',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 5, 1),
          hint: `Užuomina: 1) ${initial} - ${broken} = ${initial - broken}. 2) ${initial - broken} + ${planted} = ${ans} obelys!`
        };
      }

      case 'g3_word_boss_hp': {
        const hits = randInt(3, 6);
        const dmg = randInt(4, 8);
        const bossHp = hits * dmg + randInt(5, 15);
        const ans = bossHp - hits * dmg;
        return {
          templateId: picked,
          prompt: `Bosas turėjo ${bossHp} HP. Lukas jam sudavė ${hits} kirčius po ${dmg} žalos. Kiek HP liko Bosui?`,
          subtitle: '⚔️ RPG Kovos skaičiavimas',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 1, 1),
          hint: `Užuomina: 1) Visa žala: ${hits} × ${dmg} = ${hits * dmg}. 2) Liko HP: ${bossHp} - ${hits * dmg} = ${ans}!`
        };
      }

      case 'g3_word_library': {
        const shelves = randInt(4, 7);
        const perShelf = randInt(6, 9);
        const taken = randInt(5, 12);
        const ans = shelves * perShelf - taken;
        return {
          templateId: picked,
          prompt: `Pilyje yra ${shelves} lentynos po ${perShelf} burtų knygas. Burtininkas paėmė ${taken} knygas. Kiek knygų liko?`,
          subtitle: '📚 Tekstinis žodžių uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 4, 1),
          hint: `Užuomina: 1) Iš viso buvo: ${shelves} × ${perShelf} = ${shelves * perShelf}. 2) Atimk ${taken}: ${shelves * perShelf} - ${taken} = ${ans}!`
        };
      }

      case 'g3_word_train': {
        const passengers = randInt(28, 52);
        const gotOff = randInt(7, 15);
        const gotOn = randInt(9, 19);
        const ans = passengers - gotOff + gotOn;
        return {
          templateId: picked,
          prompt: `Karališkame traukinyje važiavo ${passengers} keleiviai. Stotelėje išlipo ${gotOff}, o įlipo ${gotOn}. Kiek keleivių važiuoja dabar?`,
          subtitle: '🚂 Tekstinis žodžių uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 5, 1),
          hint: `Užuomina: ${passengers} - ${gotOff} = ${passengers - gotOff}, tada + ${gotOn} = ${ans}!`
        };
      }

      case 'g3_word_alchemist': {
        const boxes = randInt(5, 8);
        const perBox = randInt(5, 9);
        const extra = randInt(4, 11);
        const ans = boxes * perBox + extra;
        return {
          templateId: picked,
          prompt: `Alchemikas supakavo ${boxes} dėžes po ${perBox} eliksyrus ir dar ${extra} eliksyrai liko ant stalo. Kiek iš viso eliksyrų?`,
          subtitle: '🧪 Tekstinis žodžių uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 5, 1),
          hint: `Užuomina: ${boxes} × ${perBox} = ${boxes * perBox}, plius ${extra} = ${ans}!`
        };
      }

      case 'g3_word_knight_shop':
      default: {
        const gold = randInt(60, 95);
        const swordCost = randInt(22, 35);
        const shieldCost = randInt(15, 25);
        const ans = gold - swordCost - shieldCost;
        return {
          templateId: picked,
          prompt: `Riteris turėjo ${gold} auksinių. Jis nusipirko kardą už ${swordCost} ir skydą už ${shieldCost} auksinius. Kiek auksinių jam liko?`,
          subtitle: '🛡️ Pirkinių tekstinis uždavinys',
          answer: String(ans),
          options: this.buildNumberOptions(ans, 3, 1),
          hint: `Užuomina: Išleido ${swordCost} + ${shieldCost} = ${swordCost + shieldCost}. Liko: ${gold} - ${swordCost + shieldCost} = ${ans}!`
        };
      }
    }
  }
}

export const mathEngine = new MathEngine();
