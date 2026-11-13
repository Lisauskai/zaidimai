// ==================== GREITA MATEMATIKA GARAŽE (PIT STOP MATH) ====================
// 5 skirtingi užduočių tipai (1–3 kl.): lygtys su ?, daugyba/dalyba, 2 veiksmų grandinėlės,
// tekstiniai lenktynių/garažo uždaviniai ir dviejų reiškinių palyginimas (kuris didesnis).

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[randInt(0, arr.length - 1)];
}

export class PitStopMath {
  constructor() {
    this.lastType = null;
    this.recentKeys = [];
  }

  rememberQuestion(type, key) {
    this.lastType = type;
    if (!key) return;
    this.recentKeys.push(key);
    if (this.recentKeys.length > 8) {
      this.recentKeys.shift();
    }
  }

  hasRecentKey(key) {
    return this.recentKeys.includes(key);
  }

  /**
   * Sugeneruoja 1 įvairų uždavinį pagal klasę (1 = Linas, 3 = Lukas) be pasikartojimų iš eilės.
   */
  generateQuestion(grade = 1) {
    const types = ['missing_equation', 'mul_div', 'two_step', 'word_problem', 'compare'];
    const pool = types.filter((t) => t !== this.lastType);
    const chosenType = pickRandom(pool);

    for (let attempt = 0; attempt < 25; attempt++) {
      const q =
        grade === 1
          ? this.buildGrade1ByType(chosenType)
          : this.buildGrade3ByType(chosenType);
      const qKey = `${chosenType}:${q.key || q.formula}`;
      if (!this.hasRecentKey(qKey) || attempt === 24) {
        this.rememberQuestion(chosenType, qKey);
        return q;
      }
    }
    return this.buildGrade1ByType(chosenType);
  }

  buildGrade1ByType(type) {
    if (type === 'missing_equation') {
      const variant = randInt(0, 3);
      if (variant === 0) {
        const sum = randInt(10, 20);
        const a = randInt(3, sum - 2);
        const ans = sum - a;
        return {
          type,
          badge: '🔍 TRŪKSTAMAS SKAIČIUS',
          formula: `${a} + ? = ${sum}`,
          hint: 'Kokį skaičių reikia pridėti, kad gautum teisingą lygybę?',
          answer: ans,
          choices: this.buildChoices(ans, 1, 20),
          key: `m1:${a}+?=${sum}`
        };
      }
      if (variant === 1) {
        const sum = randInt(11, 20);
        const b = randInt(3, sum - 2);
        const ans = sum - b;
        return {
          type,
          badge: '🔍 TRŪKSTAMAS SKAIČIUS',
          formula: `? + ${b} = ${sum}`,
          hint: 'Rask pasislėpusį dėmenį!',
          answer: ans,
          choices: this.buildChoices(ans, 1, 20),
          key: `m2:?+${b}=${sum}`
        };
      }
      if (variant === 2) {
        const ans = randInt(6, 15);
        const b = randInt(2, 8);
        const start = ans + b;
        return {
          type,
          badge: '🔍 TRŪKSTAMAS SKAIČIUS',
          formula: `${start} - ? = ${ans}`,
          hint: `Kiek reikia atimti iš ${start}, kad liktų ${ans}?`,
          answer: b,
          choices: this.buildChoices(b, 1, 18),
          key: `m3:${start}-?=${ans}`
        };
      }
      const rem = randInt(4, 14);
      const sub = randInt(2, 6);
      const ans = rem + sub;
      return {
        type,
        badge: '🔍 TRŪKSTAMAS SKAIČIUS',
        formula: `? - ${sub} = ${rem}`,
        hint: `Iš kokio skaičiaus atėmus ${sub} lieka ${rem}?`,
        answer: ans,
        choices: this.buildChoices(ans, 4, 24),
        key: `m4:?-${sub}=${rem}`
      };
    }

    if (type === 'mul_div') {
      const isDiv = Math.random() < 0.45;
      if (!isDiv) {
        const a = pickRandom([2, 3, 4, 5]);
        const b = randInt(2, 5);
        const ans = a * b;
        return {
          type,
          badge: '✖️ DAUGYBA IR DALYBA',
          formula: `${a} × ${b} = ?`,
          hint: `${a} po ${b} (arba sudėk ${a} ${b} kartus).`,
          answer: ans,
          choices: this.buildChoices(ans, 2, 30),
          key: `md1:${a}x${b}`
        };
      }
      const div = pickRandom([2, 3, 5]);
      const quot = randInt(2, 5);
      const dividend = div * quot;
      return {
        type,
        badge: '➗ DAUGYBA IR DALYBA',
        formula: `${dividend} : ${div} = ?`,
        hint: `Padalink ${dividend} į ${div} lygias dalis.`,
        answer: quot,
        choices: this.buildChoices(quot, 1, 12),
        key: `md1:${dividend}/${div}`
      };
    }

    if (type === 'two_step') {
      const variant = randInt(0, 2);
      if (variant === 0) {
        const a = randInt(6, 12);
        const b = randInt(3, 7);
        const c = randInt(2, Math.min(8, a + b - 2));
        const ans = a + b - c;
        return {
          type,
          badge: '⛓️ DVIEJŲ VEIKSMŲ GRANDINĖLĖ',
          formula: `${a} + ${b} - ${c} = ?`,
          hint: `Pirma sudėk ${a} + ${b} = ${a + b}, tada atimk ${c}.`,
          answer: ans,
          choices: this.buildChoices(ans, 1, 24),
          key: `ts1:${a}+${b}-${c}`
        };
      }
      if (variant === 1) {
        const a = randInt(12, 20);
        const b = randInt(4, 8);
        const c = randInt(2, 6);
        const ans = a - b + c;
        return {
          type,
          badge: '⛓️ DVIEJŲ VEIKSMŲ GRANDINĖLĖ',
          formula: `${a} - ${b} + ${c} = ?`,
          hint: `Pirma atimk ${a} - ${b} = ${a - b}, po to pridėk ${c}.`,
          answer: ans,
          choices: this.buildChoices(ans, 1, 24),
          key: `ts2:${a}-${b}+${c}`
        };
      }
      const a = randInt(3, 8);
      const b = randInt(3, 7);
      const c = randInt(2, 6);
      const ans = a + b + c;
      return {
        type,
        badge: '⛓️ DVIEJŲ VEIKSMŲ GRANDINĖLĖ',
        formula: `${a} + ${b} + ${c} = ?`,
        hint: `Suskaičiuok iš eilės iš kairės į dešinę.`,
        answer: ans,
        choices: this.buildChoices(ans, 5, 25),
        key: `ts3:${a}+${b}+${c}`
      };
    }

    if (type === 'word_problem') {
      const scenario = randInt(0, 3);
      if (scenario === 0) {
        const lap1 = randInt(7, 11);
        const extra = randInt(2, 4);
        const lap2 = lap1 + extra;
        const ans = lap1 + lap2;
        return {
          type,
          badge: '🏁 LENKTYNIŲ UŽDAVINYS',
          formula: `1 ratas: ${lap1} s, 2 ratas: +${extra} s ilgiau`,
          hint: `Pirmas ratas truko ${lap1} s, o antras – ${extra} s ilgiau (${lap2} s). Kiek truko abu ratai?`,
          answer: ans,
          choices: this.buildChoices(ans, 10, 30),
          key: `wp1:lap:${lap1}:${extra}`
        };
      }
      if (scenario === 1) {
        const coins = randInt(15, 25);
        const price = randInt(6, coins - 3);
        const ans = coins - price;
        return {
          type,
          badge: '🪙 GARAŽO UŽDAVINYS',
          formula: `Turi ${coins} 🪙 − detalė ${price} 🪙`,
          hint: `Turi ${coins} monetų, bamperis kainuoja ${price}. Kiek monetų liks?`,
          answer: ans,
          choices: this.buildChoices(ans, 1, 22),
          key: `wp1:coins:${coins}:${price}`
        };
      }
      if (scenario === 2) {
        const cars = randInt(2, 4);
        const spare = randInt(1, 3);
        const ans = cars * 4 + spare;
        return {
          type,
          badge: '🛞 GARAŽO UŽDAVINYS',
          formula: `${cars} bolidai (po 4 r.) + ${spare} atsarginiai`,
          hint: `Garaže ${cars} mašinos po 4 ratus ir dar ${spare} atsarginiai ratai. Kiek iš viso?`,
          answer: ans,
          choices: this.buildChoices(ans, 6, 24),
          key: `wp1:wheels:${cars}:${spare}`
        };
      }
      const fuel = randInt(8, 14);
      const added = randInt(4, 7);
      const used = randInt(2, 5);
      const ans = fuel + added - used;
      return {
        type,
        badge: '⛽ TRASOS UŽDAVINYS',
        formula: `${fuel} L + ${added} L − ${used} L`,
        hint: `Bake buvo ${fuel} L kuro, įpylė dar ${added} L, bet lenktynėse sudegino ${used} L. Kiek liko?`,
        answer: ans,
        choices: this.buildChoices(ans, 3, 25),
        key: `wp1:fuel:${fuel}:${added}:${used}`
      };
    }

    // type === 'compare' (2 pasirinktys)
    return this.buildCompareQuestion(1);
  }

  buildGrade3ByType(type) {
    if (type === 'missing_equation') {
      const variant = randInt(0, 3);
      if (variant === 0) {
        const a = randInt(12, 45);
        const ans = randInt(7, 34);
        const sum = a + ans;
        return {
          type,
          badge: '🔍 TRŪKSTAMAS SKAIČIUS',
          formula: `${a} + ? = ${sum}`,
          hint: `Rask trūkstamą dėmenį: ${sum} − ${a}.`,
          answer: ans,
          choices: this.buildChoices(ans, 2, 60),
          key: `m3_1:${a}+?=${sum}`
        };
      }
      if (variant === 1) {
        const b = randInt(6, 24);
        const rem = randInt(11, 38);
        const ans = rem + b;
        return {
          type,
          badge: '🔍 TRŪKSTAMAS SKAIČIUS',
          formula: `? - ${b} = ${rem}`,
          hint: `Sudėk ${rem} + ${b}, kad rastum pradinį skaičių!`,
          answer: ans,
          choices: this.buildChoices(ans, 10, 75),
          key: `m3_2:?-${b}=${rem}`
        };
      }
      if (variant === 2) {
        const start = randInt(32, 75);
        const rem = randInt(14, start - 6);
        const ans = start - rem;
        return {
          type,
          badge: '🔍 TRŪKSTAMAS SKAIČIUS',
          formula: `${start} - ? = ${rem}`,
          hint: `Kiek reikia atimti iš ${start}, kad liktų ${rem}?`,
          answer: ans,
          choices: this.buildChoices(ans, 3, 60),
          key: `m3_3:${start}-?=${rem}`
        };
      }
      const a = randInt(3, 9);
      const ans = randInt(3, 9);
      const prod = a * ans;
      return {
        type,
        badge: '🔍 DAUGYBOS LYGTIS',
        formula: `${a} × ? = ${prod}`,
        hint: `Iš ko padauginus ${a} gausi ${prod}?`,
        answer: ans,
        choices: this.buildChoices(ans, 2, 12),
        key: `m3_4:${a}x?=${prod}`
      };
    }

    if (type === 'mul_div') {
      const isDiv = Math.random() < 0.5;
      if (!isDiv) {
        const a = randInt(3, 9);
        const b = randInt(3, 9);
        const ans = a * b;
        return {
          type,
          badge: '✖️ DAUGYBA IR DALYBA',
          formula: `${a} × ${b} = ?`,
          hint: `Daugybos lentelė: ${a} kart ${b}.`,
          answer: ans,
          choices: this.buildChoices(ans, 6, 90),
          key: `md3:${a}x${b}`
        };
      }
      const div = randInt(3, 9);
      const quot = randInt(3, 9);
      const dividend = div * quot;
      return {
        type,
        badge: '➗ DAUGYBA IR DALYBA',
        formula: `${dividend} : ${div} = ?`,
        hint: `Kiek kartų ${div} telpa į ${dividend}?`,
        answer: quot,
        choices: this.buildChoices(quot, 2, 15),
        key: `md3:${dividend}/${div}`
      };
    }

    if (type === 'two_step') {
      const variant = randInt(0, 3);
      if (variant === 0) {
        const a = randInt(14, 38);
        const b = randInt(7, 22);
        const c = randInt(4, 15);
        const ans = a + b - c;
        return {
          type,
          badge: '⛓️ DVIEJŲ VEIKSMŲ GRANDINĖLĖ',
          formula: `${a} + ${b} - ${c} = ?`,
          hint: `Pirma ${a} + ${b} = ${a + b}, tada atimk ${c}.`,
          answer: ans,
          choices: this.buildChoices(ans, 5, 75),
          key: `ts3_1:${a}+${b}-${c}`
        };
      }
      if (variant === 1) {
        const a = randInt(25, 55);
        const b = randInt(8, 19);
        const c = randInt(5, 18);
        const ans = a - b + c;
        return {
          type,
          badge: '⛓️ DVIEJŲ VEIKSMŲ GRANDINĖLĖ',
          formula: `${a} - ${b} + ${c} = ?`,
          hint: `Pirma ${a} - ${b} = ${a - b}, tada pridėk ${c}.`,
          answer: ans,
          choices: this.buildChoices(ans, 5, 75),
          key: `ts3_2:${a}-${b}+${c}`
        };
      }
      if (variant === 2) {
        const a = randInt(3, 8);
        const b = randInt(4, 8);
        const c = randInt(6, 20);
        const ans = a * b + c;
        return {
          type,
          badge: '⛓️ VEIKSMŲ TVARKA',
          formula: `${a} × ${b} + ${c} = ?`,
          hint: `Pirma daugyba ${a} × ${b} = ${a * b}, po to pridėk ${c}.`,
          answer: ans,
          choices: this.buildChoices(ans, 10, 95),
          key: `ts3_3:${a}x${b}+${c}`
        };
      }
      const base = randInt(40, 80);
      const a = randInt(3, 7);
      const b = randInt(3, 6);
      const ans = base - a * b;
      return {
        type,
        badge: '⛓️ VEIKSMŲ TVARKA',
        formula: `${base} - ${a} × ${b} = ?`,
        hint: `Pirma daugyba ${a} × ${b} = ${a * b}, tada atimk iš ${base}.`,
        answer: ans,
        choices: this.buildChoices(ans, 1, 75),
        key: `ts3_4:${base}-${a}x${b}`
      };
    }

    if (type === 'word_problem') {
      const scenario = randInt(0, 3);
      if (scenario === 0) {
        const lap1 = randInt(11, 16);
        const extra = randInt(3, 6);
        const lap2 = lap1 + extra;
        const ans = lap1 + lap2;
        return {
          type,
          badge: '🏁 LENKTYNIŲ UŽDAVINYS',
          formula: `1 ratas: ${lap1} s, 2 ratas: +${extra} s ilgiau`,
          hint: `Ratas truko ${lap1} s, o kitas – ${extra} s ilgiau. Kiek truko abu ratai?`,
          answer: ans,
          choices: this.buildChoices(ans, 15, 50),
          key: `wp3:lap:${lap1}:${extra}`
        };
      }
      if (scenario === 1) {
        const coins = randInt(45, 90);
        const price = randInt(18, coins - 9);
        const ans = coins - price;
        return {
          type,
          badge: '🪙 GARAŽO UŽDAVINYS',
          formula: `Turi ${coins} 🪙 − bamperis ${price} 🪙`,
          hint: `Turi ${coins} monetų, bamperis kainuoja ${price}. Kiek monetų liks?`,
          answer: ans,
          choices: this.buildChoices(ans, 2, 75),
          key: `wp3:coins:${coins}:${price}`
        };
      }
      if (scenario === 2) {
        const bots = randInt(4, 7);
        const reward = pickRandom([5, 6, 8, 10]);
        const bonus = randInt(4, 15);
        const ans = bots * reward + bonus;
        return {
          type,
          badge: '💥 AREnos PREMIJA',
          formula: `${bots} botai × ${reward} 🪙 + ${bonus} 🪙 priedas`,
          hint: `Už kiekvieną iš ${bots} botų gauni po ${reward} 🪙 ir dar ${bonus} 🪙 premijos. Kiek iš viso?`,
          answer: ans,
          choices: this.buildChoices(ans, 15, 99),
          key: `wp3:bots:${bots}:${reward}:${bonus}`
        };
      }
      const totalDist = pickRandom([36, 42, 48, 54, 60]);
      const laps = pickRandom([4, 6]);
      const ans = totalDist / laps;
      return {
        type,
        badge: '⏱️ GREIČIO UŽDAVINYS',
        formula: `${totalDist} taškų per ${laps} lygias atakas`,
        hint: `Per ${laps} vienodus ratus surinkai ${totalDist} taškų. Kiek taškų per 1 ratą?`,
        answer: ans,
        choices: this.buildChoices(ans, 2, 25),
        key: `wp3:div:${totalDist}:${laps}`
      };
    }

    // type === 'compare' (2 pasirinktys)
    return this.buildCompareQuestion(3);
  }

  buildCompareQuestion(grade) {
    let exprA = '';
    let valA = 0;
    let exprB = '';
    let valB = 0;

    for (let i = 0; i < 30; i++) {
      if (grade === 1) {
        const a1 = randInt(6, 14);
        const a2 = randInt(3, 9);
        valA = a1 + a2;
        exprA = `${a1} + ${a2}`;

        const b1 = randInt(16, 25);
        const b2 = randInt(3, 9);
        valB = b1 - b2;
        exprB = `${b1} - ${b2}`;
      } else {
        if (Math.random() < 0.5) {
          const a1 = randInt(9, 19);
          const a2 = randInt(6, 14);
          valA = a1 + a2;
          exprA = `${a1} + ${a2}`;
        } else {
          const a1 = randInt(3, 7);
          const a2 = randInt(4, 8);
          valA = a1 * a2;
          exprA = `${a1} × ${a2}`;
        }

        const b1 = randInt(24, 48);
        const b2 = randInt(5, 19);
        valB = b1 - b2;
        exprB = `${b1} - ${b2}`;
      }

      if (valA !== valB && Math.abs(valA - valB) <= (grade === 1 ? 5 : 8)) {
        break;
      }
    }

    if (valA === valB) {
      valA += 2;
      exprA = grade === 1 ? '14 + 8' : '16 + 9';
      valB = grade === 1 ? 21 : 23;
      exprB = grade === 1 ? '25 - 4' : '30 - 7';
    }

    const answerExpr = valA > valB ? exprA : exprB;
    const choices = Math.random() < 0.5 ? [exprA, exprB] : [exprB, exprA];

    return {
      type: 'compare',
      badge: '⚖️ SKAIČIŲ PALYGINIMAS',
      formula: `Kuris didesnis: ${choices[0]}  ar  ${choices[1]} ?`,
      hint: 'Suskaičiuok abu atsakymus ir paspausk tą, kuris DIDESNIS!',
      answer: answerExpr,
      choices,
      key: `cmp:${choices[0]}vs${choices[1]}`
    };
  }

  /**
   * BOSO TRASŲ ATRAKINIMO UŽDUOTYS (aukštesnio sudėtingumo, bet pagal klasę)
   */
  generateBossQuestion(grade = 1) {
    if (grade === 1) {
      return this.generateBossGrade1Question();
    }
    return this.generateBossGrade3Question();
  }

  generateBossGrade1Question() {
    const types = ['boss_chain_add', 'boss_chain_sub', 'boss_speed_burst', 'boss_double_tires', 'boss_tank_fuel'];
    const pool = types.filter((t) => t !== this.lastType);
    const type = pickRandom(pool);
    this.lastType = type;

    let badge = '👑 BOSO IŠŠŪKIS';
    let formula = '';
    let hint = '';
    let answer = 0;

    if (type === 'boss_chain_add') {
      badge = '👑 BOSO NITRO REKORDAS';
      const a = randInt(6, 12);
      const b = randInt(4, 9);
      const c = randInt(3, 8);
      answer = a + b + c;
      formula = `${a} + ${b} + ${c} = ?`;
      hint = `Sudėk visus tris nitro impulsus: pirma ${a} + ${b} = ${a + b}, tada pridėk ${c}!`;
    } else if (type === 'boss_chain_sub') {
      badge = '👑 BOSO ŠARVŲ BANDYMAS';
      const start = randInt(22, 30);
      const sub1 = randInt(5, 9);
      const sub2 = randInt(3, 7);
      answer = start - sub1 - sub2;
      formula = `${start} - ${sub1} - ${sub2} = ?`;
      hint = `Boso taranas: iš ${start} atimk ${sub1} (lieka ${start - sub1}), tada atimk dar ${sub2}!`;
    } else if (type === 'boss_speed_burst') {
      badge = '👑 BOSO GREIČIO ŠUOLIS';
      const start = randInt(12, 18);
      const plus = randInt(7, 12);
      const minus = randInt(3, 6);
      answer = start + plus - minus;
      formula = `(${start} + ${plus}) - ${minus} = ?`;
      hint = `Pirma skliaustuose: ${start} + ${plus} = ${start + plus}, po to atimk ${minus}!`;
    } else if (type === 'boss_double_tires') {
      badge = '👑 BOSO MONSTRŲ RATAI';
      const trucks = randInt(2, 4);
      const wheelsPerTruck = 6;
      const spare = randInt(2, 5);
      answer = trucks * wheelsPerTruck + spare;
      formula = `(${trucks} × ${wheelsPerTruck}) + ${spare} = ?`;
      hint = `${trucks} sunkvežimiai po 6 ratus (${trucks * wheelsPerTruck}) ir dar ${spare} atsarginiai ratai.`;
    } else {
      badge = '👑 BOSO KURO CISTERNA';
      const total = [25, 30, 35, 40][randInt(0, 3)];
      const current = randInt(8, total - 7);
      answer = total - current;
      formula = `${current} + ? = ${total}`;
      hint = `Monstro kuro bakas: ${current} L jau yra, reikia ${total} L. Kiek trūksta?`;
    }

    return {
      badge,
      formula,
      hint,
      answer,
      choices: this.buildChoices(answer, 1, 45)
    };
  }

  generateBossGrade3Question() {
    const types = ['boss_mult_add', 'boss_mult_sub', 'boss_double_mult', 'boss_div_add', 'boss_turbo_order'];
    const pool = types.filter((t) => t !== this.lastType);
    const type = pickRandom(pool);
    this.lastType = type;

    let badge = '👑 BOSO IŠŠŪKIS';
    let formula = '';
    let hint = '';
    let answer = 0;

    if (type === 'boss_mult_add') {
      badge = '👑 BOSO FORMULĖS GALIA';
      const a = randInt(6, 9);
      const b = randInt(6, 9);
      const c = randInt(14, 45);
      answer = a * b + c;
      formula = `(${a} × ${b}) + ${c} = ?`;
      hint = `Veiksmų tvarka: pirma daugyba ${a} × ${b} = ${a * b}, tada pridėk ${c}!`;
    } else if (type === 'boss_mult_sub') {
      badge = '👑 BOSO CILINDRŲ SLĖGIS';
      const a = randInt(7, 9);
      const b = randInt(6, 9);
      const c = randInt(12, Math.min(35, a * b - 5));
      answer = a * b - c;
      formula = `(${a} × ${b}) - ${c} = ?`;
      hint = `Veiksmų tvarka: pirma daugyba ${a} × ${b} = ${a * b}, tada atimk ${c}!`;
    } else if (type === 'boss_double_mult') {
      badge = '👑 BOSO DVIGUBAS TURBO';
      const a1 = randInt(4, 7);
      const b1 = randInt(4, 6);
      const a2 = randInt(3, 6);
      const b2 = randInt(3, 5);
      answer = a1 * b1 + a2 * b2;
      formula = `(${a1} × ${b1}) + (${a2} × ${b2}) = ?`;
      hint = `Dvi poros: ${a1} × ${b1} = ${a1 * b1} ir ${a2} × ${b2} = ${a2 * b2}. Sudėk juos!`;
    } else if (type === 'boss_div_add') {
      badge = '👑 BOSO GREIČIO FORMULĖ';
      const divisors = [4, 5, 6, 7, 8, 9];
      const div = divisors[randInt(0, divisors.length - 1)];
      const quotient = randInt(5, 9);
      const divident = div * quotient;
      const add = randInt(15, 55);
      answer = quotient + add;
      formula = `(${divident} : ${div}) + ${add} = ?`;
      hint = `Pirma dalyba: ${divident} : ${div} = ${quotient}, tada pridėk ${add}!`;
    } else {
      badge = '👑 BOSO GALIOS REKORDAS';
      const a = randInt(6, 9);
      const b = randInt(7, 9);
      const base = 120;
      answer = base - a * b;
      formula = `${base} - (${a} × ${b}) = ?`;
      hint = `Pirma skliaustuose: ${a} × ${b} = ${a * b}. Tada iš ${base} atimk ${a * b}!`;
    }

    return {
      badge,
      formula,
      hint,
      answer,
      choices: this.buildChoices(answer, 2, 220)
    };
  }

  buildChoices(correct, minVal, maxVal) {
    const set = new Set([correct]);
    const offsets = [-10, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 10];

    let guard = 0;
    while (set.size < 4 && guard < 50) {
      guard++;
      const off = offsets[randInt(0, offsets.length - 1)];
      const candidate = correct + off;
      if (candidate >= minVal && candidate <= maxVal && candidate !== correct) {
        set.add(candidate);
      }
    }
    while (set.size < 4) {
      const fallback = Math.max(1, correct + set.size * 2);
      set.add(fallback);
    }

    return Array.from(set).sort((a, b) => a - b);
  }
}
