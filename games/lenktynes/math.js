// ==================== GREITA MATEMATIKA GARAŽE (PIT STOP MATH) ====================
// Orientuota į greitą reakciją, be ilgų tekstų: kuro bakai, ratai, spidometras, varžtai!

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class PitStopMath {
  constructor() {
    this.lastType = null;
  }

  /**
   * Sugeneruoja 1 greitą automechanikos uždavinį pagal klasę (1 = Linas, 3 = Lukas)
   */
  generateQuestion(grade = 1) {
    if (grade === 1) {
      return this.generateGrade1Question();
    }
    return this.generateGrade3Question();
  }

  generateGrade1Question() {
    const types = ['fuel_missing', 'speed_change', 'wheels_add', 'bolts_sub'];
    const pool = types.filter((t) => t !== this.lastType);
    const type = pool[randInt(0, pool.length - 1)];
    this.lastType = type;

    let badge = '⛽ KURO BAKAS';
    let formula = '';
    let hint = '';
    let answer = 0;

    if (type === 'fuel_missing') {
      badge = '⛽ KURO BAKAS';
      const total = [10, 12, 15, 18, 20][randInt(0, 4)];
      const current = randInt(3, total - 2);
      answer = total - current;
      formula = `${current} + [ ? ] = ${total}`;
      hint = 'Kiek litrų trūksta iki pilno bako?';
    } else if (type === 'speed_change') {
      badge = '📟 SPIDOMETRAS';
      const start = randInt(8, 14);
      const delta = randInt(3, 8);
      if (Math.random() < 0.65) {
        answer = start + delta;
        formula = `${start} km/h + ${delta} km/h = [ ? ]`;
        hint = `Greitis buvo ${start} km/h, padidėjo ${delta} km/h. Koks dabar?`;
      } else {
        answer = start - delta;
        formula = `${start} km/h - ${delta} km/h = [ ? ]`;
        hint = `Greitis buvo ${start} km/h, sumažėjo ${delta} km/h. Koks dabar?`;
      }
    } else if (type === 'wheels_add') {
      badge = '🛞 RATŲ MONTAVIMAS';
      const pairs = [
        { q: '4 + 4 = [ ? ]', h: '2 mašinos po 4 ratus. Kiek iš viso ratų?', a: 8 },
        { q: '4 + 2 = [ ? ]', h: 'Mašina (4 ratai) ir motociklas (2 ratai). Kiek ratų?', a: 6 },
        { q: '4 + 4 + 2 = [ ? ]', h: '2 mašinos ir atsarginė pora ratų. Kiek iš viso?', a: 10 },
        { q: '6 + 4 = [ ? ]', h: 'Sunkvežimis (6 ratai) ir mašina (4 ratai). Kiek ratų?', a: 10 },
        { q: '8 + 4 = [ ? ]', h: 'Garaže 8 ratai, atvežė dar 4. Kiek dabar?', a: 12 }
      ];
      const pick = pairs[randInt(0, pairs.length - 1)];
      formula = pick.q;
      hint = pick.h;
      answer = pick.a;
    } else {
      badge = '🔩 VARŽTŲ RAKTAI';
      const a = randInt(11, 20);
      const b = randInt(3, a - 3);
      answer = a - b;
      formula = `${a} - ${b} = [ ? ]`;
      hint = `Turėjai ${a} varžtų, prisukai ${b}. Kiek liko dėžėje?`;
    }

    return {
      badge,
      formula,
      hint,
      answer,
      choices: this.buildChoices(answer, 1, 24)
    };
  }

  generateGrade3Question() {
    const types = ['fuel_missing_3', 'wheels_mult', 'speedometer_3', 'turbo_power', 'parts_div'];
    const pool = types.filter((t) => t !== this.lastType);
    const type = pool[randInt(0, pool.length - 1)];
    this.lastType = type;

    let badge = '⛽ KURO BAKAS';
    let formula = '';
    let hint = '';
    let answer = 0;

    if (type === 'fuel_missing_3') {
      badge = '⛽ KURO BAKAS';
      const totals = [30, 40, 50, 60, 75, 80, 90, 100];
      const total = totals[randInt(0, totals.length - 1)];
      const current = randInt(12, total - 11);
      answer = total - current;
      formula = `${current} + [ ? ] = ${total}`;
      hint = 'Kiek litrų trūksta iki pilno bako?';
    } else if (type === 'wheels_mult') {
      badge = '🛞 RATŲ SKAIČIAVIMAS';
      const cars = randInt(3, 9);
      const wheelsPerVehicle = Math.random() < 0.75 ? 4 : 6;
      answer = cars * wheelsPerVehicle;
      formula = `${cars} mašinos × ${wheelsPerVehicle} ratai = [ ? ]`;
      hint = `Kiek ratų reikia ${cars} bolidams (po ${wheelsPerVehicle} ratus)?`;
    } else if (type === 'speedometer_3') {
      badge = '📟 SPIDOMETRO LOGIKA';
      const start = randInt(4, 11) * 10 + (Math.random() < 0.4 ? 5 : 0);
      const delta = randInt(2, 6) * 10 + (Math.random() < 0.4 ? 5 : 0);
      if (Math.random() < 0.6) {
        answer = start + delta;
        formula = `${start} km/h + ${delta} km/h = [ ? ]`;
        hint = `Greitis buvo ${start} km/h, padidėjo ${delta} km/h. Koks dabar?`;
      } else {
        const safeStart = Math.max(start, delta + 20);
        answer = safeStart - delta;
        formula = `${safeStart} km/h - ${delta} km/h = [ ? ]`;
        hint = `Greitis buvo ${safeStart} km/h, pristabdei ${delta} km/h. Koks dabar?`;
      }
    } else if (type === 'turbo_power') {
      badge = '⚡ TURBO VARIKLIS';
      const a = randInt(4, 9);
      const b = randInt(5, 9);
      answer = a * b;
      formula = `${a} cilindrai × ${b} AG = [ ? ]`;
      hint = 'Kiek arklio galių (AG) prideda nauja turbina?';
    } else {
      badge = '🔧 DETALIŲ DĖŽĖS';
      const cars = randInt(3, 8);
      const perCar = [4, 5, 6, 8][randInt(0, 3)];
      const total = cars * perCar;
      answer = cars;
      formula = `${total} padangos ÷ ${perCar} = [ ? ]`;
      hint = `Kelioms mašinoms užteks ${total} padangų (po ${perCar} kiekvienai)?`;
    }

    return {
      badge,
      formula,
      hint,
      answer,
      choices: this.buildChoices(answer, 2, 180)
    };
  }

  /**
   * Sugeneruoja Matematikos Boso uždavinį (sunkesnis, kelių veiksmų arba boso tematikos)
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
    const type = pool[randInt(0, pool.length - 1)];
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
      formula = `${a} + ${b} + ${c} = [ ? ]`;
      hint = `Sudėk visus tris nitro impulsus: pirma ${a} + ${b} = ${a + b}, tada pridėk ${c}!`;
    } else if (type === 'boss_chain_sub') {
      badge = '👑 BOSO ŠARVŲ BANDYMAS';
      const start = randInt(22, 30);
      const sub1 = randInt(5, 9);
      const sub2 = randInt(3, 7);
      answer = start - sub1 - sub2;
      formula = `${start} - ${sub1} - ${sub2} = [ ? ]`;
      hint = `Boso taranas: iš ${start} atimk ${sub1} (lieka ${start - sub1}), tada atimk dar ${sub2}!`;
    } else if (type === 'boss_speed_burst') {
      badge = '👑 BOSO GREIČIO ŠUOLIS';
      const start = randInt(12, 18);
      const plus = randInt(7, 12);
      const minus = randInt(3, 6);
      answer = start + plus - minus;
      formula = `(${start} + ${plus}) - ${minus} = [ ? ]`;
      hint = `Pirma skliaustuose: ${start} + ${plus} = ${start + plus}, po to atimk ${minus}!`;
    } else if (type === 'boss_double_tires') {
      badge = '👑 BOSO MONSTRŲ RATAI';
      const trucks = randInt(2, 4);
      const wheelsPerTruck = 6;
      const spare = randInt(2, 5);
      answer = trucks * wheelsPerTruck + spare;
      formula = `(${trucks} × ${wheelsPerTruck}) + ${spare} = [ ? ]`;
      hint = `${trucks} sunkvežimiai po 6 ratus (${trucks * wheelsPerTruck}) ir dar ${spare} atsarginiai ratai.`;
    } else {
      badge = '👑 BOSO KURO CISTERNA';
      const total = [25, 30, 35, 40][randInt(0, 3)];
      const current = randInt(8, total - 7);
      answer = total - current;
      formula = `${current} + [ ? ] = ${total}`;
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
    const type = pool[randInt(0, pool.length - 1)];
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
      formula = `(${a} × ${b}) + ${c} = [ ? ]`;
      hint = `Veiksmų tvarka: pirma daugyba ${a} × ${b} = ${a * b}, tada pridėk ${c}!`;
    } else if (type === 'boss_mult_sub') {
      badge = '👑 BOSO CILINDRŲ SLĖGIS';
      const a = randInt(7, 9);
      const b = randInt(6, 9);
      const c = randInt(12, Math.min(35, a * b - 5));
      answer = a * b - c;
      formula = `(${a} × ${b}) - ${c} = [ ? ]`;
      hint = `Veiksmų tvarka: pirma daugyba ${a} × ${b} = ${a * b}, tada atimk ${c}!`;
    } else if (type === 'boss_double_mult') {
      badge = '👑 BOSO DVIGUBAS TURBO';
      const a1 = randInt(4, 7);
      const b1 = randInt(4, 6);
      const a2 = randInt(3, 6);
      const b2 = randInt(3, 5);
      answer = a1 * b1 + a2 * b2;
      formula = `(${a1} × ${b1}) + (${a2} × ${b2}) = [ ? ]`;
      hint = `Dvi poros: ${a1} × ${b1} = ${a1 * b1} ir ${a2} × ${b2} = ${a2 * b2}. Sudėk juos!`;
    } else if (type === 'boss_div_add') {
      badge = '👑 BOSO GREIČIO FORMULĖ';
      const divisors = [4, 5, 6, 7, 8, 9];
      const div = divisors[randInt(0, divisors.length - 1)];
      const quotient = randInt(5, 9);
      const divident = div * quotient;
      const add = randInt(15, 55);
      answer = quotient + add;
      formula = `(${divident} ÷ ${div}) + ${add} = [ ? ]`;
      hint = `Pirma dalyba: ${divident} ÷ ${div} = ${quotient}, tada pridėk ${add}!`;
    } else {
      badge = '👑 BOSO GALIOS REKORDAS';
      const a = randInt(6, 9);
      const b = randInt(7, 9);
      const base = 120;
      answer = base - a * b;
      formula = `${base} - (${a} × ${b}) = [ ? ]`;
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
