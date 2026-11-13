// ==================== SKAIČIŲ KRYŽIAŽODŽIAI IR MAGIŠKIEJI TRIKAMPIAI (10 ZONA) ====================

export const MATHCROSS_CANVAS_W = 580;
export const MATHCROSS_CANVAS_H = 400;

/**
 * Trikampio viršūnių ir kraštinių vidurio taškų indeksai:
 *       0
 *      / \
 *     5   1
 *    /     \
 *   4---3---2
 * Kraštinės: [0,1,2], [2,3,4], [4,5,0]
 */
export const TRIANGLE_SIDES = [
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 0]
];

export const SQUARE_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export const MATHCROSS_LEVELS = {
  grade1: [
    {
      id: 'mc_g1_1',
      kind: 'triangle',
      title: '1. Magiškasis trikampis (Suma 9)',
      instruction: 'Sudėk skaičius į tuščius apskritimus taip, kad kiekvienos kraštinės suma būtų lygi 9!',
      reward: 1,
      magicSum: 9,
      solution: [1, 6, 2, 4, 3, 5],
      fixed: { 0: 1, 2: 2, 4: 3 },
      cards: [
        { cid: 'c1', value: 4 },
        { cid: 'c2', value: 5 },
        { cid: 'c3', value: 6 }
      ]
    },
    {
      id: 'mc_g1_2',
      kind: 'crossword',
      title: '2. Pirmasis kryžiažodis',
      instruction: 'Išspręsk susikertančias lygtis! Tas pats skaičius tinka ir eilutei, ir stulpeliui.',
      reward: 1,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 7 },
        { r: 0, c: 1, type: 'op', text: '+' },
        { r: 0, c: 2, type: 'num', value: 5 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 12 },

        { r: 1, c: 0, type: 'op', text: '−' },
        { r: 2, c: 0, type: 'num', value: 3 },
        { r: 3, c: 0, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'slot', id: 'B', solution: 4 },
        { r: 4, c: 1, type: 'op', text: '+' },
        { r: 4, c: 2, type: 'slot', id: 'C', solution: 6 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 10 }
      ],
      equations: [
        { a: 'A', op: '+', b: 5, res: 12 },
        { a: 'A', op: '-', b: 3, res: 'B' },
        { a: 'B', op: '+', b: 'C', res: 10 }
      ],
      cards: [
        { cid: 'c1', value: 4 },
        { cid: 'c2', value: 6 },
        { cid: 'c3', value: 7 },
        { cid: 'c4', value: 9 }
      ]
    },
    {
      id: 'mc_g1_3',
      kind: 'triangle',
      title: '3. Kosminis trikampis (Suma 10)',
      instruction: 'Visi kampai jau užpildyti! Įdėk likusius 3 skaičius į vidurinius langelius, kad kiekviena kraštinė duotų 10.',
      reward: 1,
      magicSum: 10,
      solution: [1, 6, 3, 2, 5, 4],
      fixed: { 0: 1, 2: 3, 4: 5 },
      cards: [
        { cid: 'c1', value: 2 },
        { cid: 'c2', value: 4 },
        { cid: 'c3', value: 6 }
      ]
    },
    {
      id: 'mc_g1_4',
      kind: 'crossword',
      title: '4. Dvigubas taikinys',
      instruction: 'Vidurinėje eilutėje trūksta dviejų skaičių! Pirmiausia išspręsk stulpelius, kur trūksta tik vieno.',
      reward: 2,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'num', value: 5 },
        { r: 0, c: 2, type: 'num', value: 13 },

        { r: 1, c: 0, type: 'op', text: '+' },
        { r: 1, c: 2, type: 'op', text: '−' },

        { r: 2, c: 0, type: 'slot', id: 'A', solution: 9 },
        { r: 2, c: 1, type: 'op', text: '+' },
        { r: 2, c: 2, type: 'slot', id: 'B', solution: 6 },
        { r: 2, c: 3, type: 'op', text: '=' },
        { r: 2, c: 4, type: 'num', value: 15 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 14 },
        { r: 4, c: 1, type: 'op', text: '−' },
        { r: 4, c: 2, type: 'slot', id: 'C', solution: 7 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 7 }
      ],
      equations: [
        { a: 5, op: '+', b: 'A', res: 14 },
        { a: 13, op: '-', b: 'B', res: 'C' },
        { a: 'A', op: '+', b: 'B', res: 15 },
        { a: 14, op: '-', b: 'C', res: 7 }
      ],
      cards: [
        { cid: 'c1', value: 6 },
        { cid: 'c2', value: 7 },
        { cid: 'c3', value: 9 },
        { cid: 'c4', value: 4 },
        { cid: 'c5', value: 8 }
      ]
    },
    {
      id: 'mc_g1_5',
      kind: 'triangle',
      title: '5. Dvylikos paslaptis (Suma 12)',
      instruction: 'Visi 3 kampai jau duoti! Apskaičiuok, kokių skaičių trūksta viduryje, kad kraštinių sumos būtų 12.',
      reward: 2,
      magicSum: 12,
      solution: [4, 3, 5, 1, 6, 2],
      fixed: { 0: 4, 2: 5, 4: 6 },
      cards: [
        { cid: 'c1', value: 1 },
        { cid: 'c2', value: 2 },
        { cid: 'c3', value: 3 }
      ]
    },
    {
      id: 'mc_g1_6',
      kind: 'crossword',
      title: '6. Skaičių tiltas iki 15',
      instruction: 'Viršuje trūksta dviejų skaičių! Pradėk nuo kairiojo stulpelio ir apatinės eilutės.',
      reward: 2,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 8 },
        { r: 0, c: 1, type: 'op', text: '+' },
        { r: 0, c: 2, type: 'slot', id: 'B', solution: 7 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 15 },

        { r: 1, c: 0, type: 'op', text: '+' },
        { r: 1, c: 2, type: 'op', text: '−' },

        { r: 2, c: 0, type: 'num', value: 5 },
        { r: 2, c: 2, type: 'num', value: 3 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 13 },
        { r: 4, c: 1, type: 'op', text: '−' },
        { r: 4, c: 2, type: 'slot', id: 'C', solution: 4 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 9 }
      ],
      equations: [
        { a: 'A', op: '+', b: 'B', res: 15 },
        { a: 'A', op: '+', b: 5, res: 13 },
        { a: 'B', op: '-', b: 3, res: 'C' },
        { a: 13, op: '-', b: 'C', res: 9 }
      ],
      cards: [
        { cid: 'c1', value: 4 },
        { cid: 'c2', value: 7 },
        { cid: 'c3', value: 8 },
        { cid: 'c4', value: 5 },
        { cid: 'c5', value: 10 }
      ]
    },
    {
      id: 'mc_g1_7',
      kind: 'triangle',
      title: '7. Dvylikos žvaigždė (Suma 12)',
      instruction: 'Pabaik trikampį: visi trys kampai jau užpildyti, įdėk likusius 3 skaičius, kad kraštinės lygios 12!',
      reward: 3,
      magicSum: 12,
      solution: [1, 7, 4, 2, 6, 5],
      fixed: { 0: 1, 2: 4, 4: 6 },
      cards: [
        { cid: 'c1', value: 2 },
        { cid: 'c2', value: 5 },
        { cid: 'c3', value: 7 }
      ]
    },
    {
      id: 'mc_g1_8',
      kind: 'crossword',
      title: '8. Pirmoko didysis kryžiažodis',
      instruction: 'Net 4 susikertančios lygtys iki 15! Rask D ir C apačioje bei viduryje, tada užbaik viršų.',
      reward: 3,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 8 },
        { r: 0, c: 1, type: 'op', text: '+' },
        { r: 0, c: 2, type: 'slot', id: 'B', solution: 7 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 15 },

        { r: 1, c: 0, type: 'op', text: '+' },
        { r: 1, c: 2, type: 'op', text: '−' },

        { r: 2, c: 0, type: 'slot', id: 'C', solution: 5 },
        { r: 2, c: 1, type: 'op', text: '+' },
        { r: 2, c: 2, type: 'num', value: 2 },
        { r: 2, c: 3, type: 'op', text: '=' },
        { r: 2, c: 4, type: 'num', value: 7 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 13 },
        { r: 4, c: 1, type: 'op', text: '−' },
        { r: 4, c: 2, type: 'slot', id: 'D', solution: 6 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 7 }
      ],
      equations: [
        { a: 'A', op: '+', b: 'B', res: 15 },
        { a: 'A', op: '+', b: 'C', res: 13 },
        { a: 'B', op: '-', b: 1, res: 'D' },
        { a: 'C', op: '+', b: 2, res: 7 },
        { a: 13, op: '-', b: 'D', res: 7 }
      ],
      cards: [
        { cid: 'c1', value: 5 },
        { cid: 'c2', value: 6 },
        { cid: 'c3', value: 7 },
        { cid: 'c4', value: 8 },
        { cid: 'c5', value: 4 },
        { cid: 'c6', value: 9 }
      ]
    },
    {
      id: 'mc_g1_9',
      kind: 'triangle',
      title: '9. Slaptasis trikampis (Suma 12)',
      instruction: 'Sudėk skaičius į tuščius apskritimus taip, kad kiekvienos kraštinės suma būtų 12!',
      reward: 3,
      magicSum: 12,
      solution: [4, 3, 5, 1, 6, 2],
      fixed: { 0: 4, 3: 1 },
      cards: [
        { cid: 'c1', value: 2 },
        { cid: 'c2', value: 3 },
        { cid: 'c3', value: 5 },
        { cid: 'c4', value: 6 }
      ]
    },
    {
      id: 'mc_g1_10',
      kind: 'crossword',
      title: '10. Pirmoko lygčių finalas',
      instruction: '1 klasės finalas! Net 5 susikertančios lygtys viename tinklelyje – atrask A, B, C ir D.',
      reward: 3,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 9 },
        { r: 0, c: 1, type: 'op', text: '+' },
        { r: 0, c: 2, type: 'slot', id: 'B', solution: 6 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 15 },

        { r: 1, c: 0, type: 'op', text: '−' },
        { r: 1, c: 2, type: 'op', text: '+' },

        { r: 2, c: 0, type: 'slot', id: 'C', solution: 5 },
        { r: 2, c: 1, type: 'op', text: '+' },
        { r: 2, c: 2, type: 'num', value: 2 },
        { r: 2, c: 3, type: 'op', text: '=' },
        { r: 2, c: 4, type: 'num', value: 7 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 4 },
        { r: 4, c: 1, type: 'op', text: '+' },
        { r: 4, c: 2, type: 'slot', id: 'D', solution: 8 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 12 }
      ],
      equations: [
        { a: 'A', op: '+', b: 'B', res: 15 },
        { a: 'A', op: '-', b: 'C', res: 4 },
        { a: 'B', op: '+', b: 2, res: 'D' },
        { a: 'C', op: '+', b: 2, res: 7 },
        { a: 4, op: '+', b: 'D', res: 12 }
      ],
      cards: [
        { cid: 'c1', value: 5 },
        { cid: 'c2', value: 6 },
        { cid: 'c3', value: 8 },
        { cid: 'c4', value: 9 },
        { cid: 'c5', value: 4 },
        { cid: 'c6', value: 7 }
      ]
    }
  ],

  grade3: [
    {
      id: 'mc_g3_1',
      kind: 'square',
      title: '1. Magiškasis kvadratas (Suma 30)',
      instruction: '3×3 kvadratas: kiekviena eilutė, stulpelis ir abi įstrižainės privalo duoti sumą 30!',
      reward: 1,
      magicSum: 30,
      solution: [16, 2, 12, 6, 10, 14, 8, 18, 4],
      fixed: { 0: 16, 2: 12, 4: 10, 6: 8, 7: 18 },
      cards: [
        { cid: 'c1', value: 2 },
        { cid: 'c2', value: 4 },
        { cid: 'c3', value: 6 },
        { cid: 'c4', value: 14 }
      ]
    },
    {
      id: 'mc_g3_2',
      kind: 'crossword',
      title: '2. Daugybos kryžiažodis',
      instruction: 'Sudėk skaičius į langelius! Tas pats skaičius tinka ir daugybai, ir sudėčiai.',
      reward: 1,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 6 },
        { r: 0, c: 1, type: 'op', text: '×' },
        { r: 0, c: 2, type: 'num', value: 4 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 24 },

        { r: 1, c: 0, type: 'op', text: '+' },
        { r: 1, c: 4, type: 'op', text: '+' },

        { r: 2, c: 0, type: 'num', value: 19 },
        { r: 2, c: 4, type: 'slot', id: 'D', solution: 51 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 4, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'slot', id: 'B', solution: 25 },
        { r: 4, c: 1, type: 'op', text: '×' },
        { r: 4, c: 2, type: 'num', value: 3 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'slot', id: 'C', solution: 75 }
      ],
      equations: [
        { a: 'A', op: '×', b: 4, res: 24 },
        { a: 'A', op: '+', b: 19, res: 'B' },
        { a: 'B', op: '×', b: 3, res: 'C' },
        { a: 24, op: '+', b: 'D', res: 'C' }
      ],
      cards: [
        { cid: 'c1', value: 6 },
        { cid: 'c2', value: 25 },
        { cid: 'c3', value: 51 },
        { cid: 'c4', value: 75 },
        { cid: 'c5', value: 8 },
        { cid: 'c6', value: 35 }
      ]
    },
    {
      id: 'mc_g3_3',
      kind: 'square',
      title: '3. Kvadratas „45“',
      instruction: 'Visos eilutės, stulpeliai ir įstrižainės lygios 45! Pradėk nuo eilučių, kur trūksta 1 skaičiaus.',
      reward: 2,
      magicSum: 45,
      solution: [24, 3, 18, 9, 15, 21, 12, 27, 6],
      fixed: { 0: 24, 4: 15, 5: 21, 6: 12 },
      cards: [
        { cid: 'c1', value: 3 },
        { cid: 'c2', value: 6 },
        { cid: 'c3', value: 9 },
        { cid: 'c4', value: 18 },
        { cid: 'c5', value: 27 }
      ]
    },
    {
      id: 'mc_g3_4',
      kind: 'crossword',
      title: '4. Dalybos ir daugybos tinklas',
      instruction: 'Viršuje trūksta net dviejų skaičių! Pradėk nuo kairiojo, dešiniojo stulpelio ir apačios.',
      reward: 2,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 48 },
        { r: 0, c: 1, type: 'op', text: '÷' },
        { r: 0, c: 2, type: 'slot', id: 'B', solution: 4 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 12 },

        { r: 1, c: 0, type: 'op', text: '−' },
        { r: 1, c: 2, type: 'op', text: '×' },
        { r: 1, c: 4, type: 'op', text: '÷' },

        { r: 2, c: 0, type: 'num', value: 16 },
        { r: 2, c: 2, type: 'num', value: 2 },
        { r: 2, c: 4, type: 'slot', id: 'D', solution: 3 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },
        { r: 3, c: 4, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 32 },
        { r: 4, c: 1, type: 'op', text: '÷' },
        { r: 4, c: 2, type: 'slot', id: 'C', solution: 8 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 4 }
      ],
      equations: [
        { a: 'A', op: '÷', b: 'B', res: 12 },
        { a: 'A', op: '-', b: 16, res: 32 },
        { a: 'B', op: '×', b: 2, res: 'C' },
        { a: 12, op: '÷', b: 'D', res: 4 },
        { a: 32, op: '÷', b: 'C', res: 4 }
      ],
      cards: [
        { cid: 'c1', value: 3 },
        { cid: 'c2', value: 4 },
        { cid: 'c3', value: 8 },
        { cid: 'c4', value: 48 },
        { cid: 'c5', value: 9 },
        { cid: 'c6', value: 14 }
      ]
    },
    {
      id: 'mc_g3_5',
      kind: 'square',
      title: '5. Šešiasdešimties matrica',
      instruction: 'Užpildyk net 6 tuščius langelius taip, kad visos linijos ir įstrižainės duotų po 60!',
      reward: 2,
      magicSum: 60,
      solution: [32, 4, 24, 12, 20, 28, 16, 36, 8],
      fixed: { 0: 32, 4: 20, 7: 36 },
      cards: [
        { cid: 'c1', value: 4 },
        { cid: 'c2', value: 8 },
        { cid: 'c3', value: 12 },
        { cid: 'c4', value: 16 },
        { cid: 'c5', value: 24 },
        { cid: 'c6', value: 28 }
      ]
    },
    {
      id: 'mc_g3_6',
      kind: 'crossword',
      title: '6. Penkių lygčių labirintas',
      instruction: 'Naudok visas keturias operacijas (+, −, ×, ÷), kad atrakintum visą kryžiažodį!',
      reward: 2,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 72 },
        { r: 0, c: 1, type: 'op', text: '÷' },
        { r: 0, c: 2, type: 'slot', id: 'B', solution: 8 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 9 },

        { r: 1, c: 0, type: 'op', text: '+' },
        { r: 1, c: 2, type: 'op', text: '×' },
        { r: 1, c: 4, type: 'op', text: '×' },

        { r: 2, c: 0, type: 'num', value: 20 },
        { r: 2, c: 2, type: 'num', value: 7 },
        { r: 2, c: 4, type: 'slot', id: 'D', solution: 4 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },
        { r: 3, c: 4, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 92 },
        { r: 4, c: 1, type: 'op', text: '−' },
        { r: 4, c: 2, type: 'slot', id: 'C', solution: 56 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 36 }
      ],
      equations: [
        { a: 'A', op: '÷', b: 'B', res: 9 },
        { a: 'A', op: '+', b: 20, res: 92 },
        { a: 'B', op: '×', b: 7, res: 'C' },
        { a: 9, op: '×', b: 'D', res: 36 },
        { a: 92, op: '-', b: 'C', res: 36 }
      ],
      cards: [
        { cid: 'c1', value: 4 },
        { cid: 'c2', value: 8 },
        { cid: 'c3', value: 56 },
        { cid: 'c4', value: 72 },
        { cid: 'c5', value: 6 },
        { cid: 'c6', value: 48 }
      ]
    },
    {
      id: 'mc_g3_7',
      kind: 'square',
      title: '7. Septyniasdešimt penkių paslaptis',
      instruction: 'Centras neužpildytas! Rask jį naudodamas magiškąją sumą 75 kiekvienoje linijoje.',
      reward: 3,
      magicSum: 75,
      solution: [34, 13, 28, 19, 25, 31, 22, 37, 16],
      fixed: { 1: 13, 3: 19, 8: 16 },
      cards: [
        { cid: 'c1', value: 22 },
        { cid: 'c2', value: 25 },
        { cid: 'c3', value: 28 },
        { cid: 'c4', value: 31 },
        { cid: 'c5', value: 34 },
        { cid: 'c6', value: 37 }
      ]
    },
    {
      id: 'mc_g3_8',
      kind: 'crossword',
      title: '8. Šimto lygčių finalas',
      instruction: 'Paskutinis inžinieriaus egzaminas iki 100! Išspręsk kryžiažodį tiksliai be klaidų.',
      reward: 3,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 84 },
        { r: 0, c: 1, type: 'op', text: '÷' },
        { r: 0, c: 2, type: 'slot', id: 'B', solution: 7 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 12 },

        { r: 1, c: 0, type: 'op', text: '+' },
        { r: 1, c: 2, type: 'op', text: '×' },
        { r: 1, c: 4, type: 'op', text: '×' },

        { r: 2, c: 0, type: 'num', value: 16 },
        { r: 2, c: 2, type: 'num', value: 4 },
        { r: 2, c: 4, type: 'slot', id: 'D', solution: 6 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },
        { r: 3, c: 4, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 100 },
        { r: 4, c: 1, type: 'op', text: '−' },
        { r: 4, c: 2, type: 'slot', id: 'C', solution: 28 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 72 }
      ],
      equations: [
        { a: 'A', op: '÷', b: 'B', res: 12 },
        { a: 'A', op: '+', b: 16, res: 100 },
        { a: 'B', op: '×', b: 4, res: 'C' },
        { a: 12, op: '×', b: 'D', res: 72 },
        { a: 100, op: '-', b: 'C', res: 72 }
      ],
      cards: [
        { cid: 'c1', value: 6 },
        { cid: 'c2', value: 7 },
        { cid: 'c3', value: 28 },
        { cid: 'c4', value: 84 },
        { cid: 'c5', value: 14 },
        { cid: 'c6', value: 42 }
      ]
    },
    {
      id: 'mc_g3_9',
      kind: 'square',
      title: '9. Magiškasis kvadratas (Suma 45)',
      instruction: 'Užpildyk trūkstamus skaičius taip, kad visos eilutės, stulpeliai ir įstrižainės duotų 45!',
      reward: 3,
      magicSum: 45,
      solution: [24, 3, 18, 9, 15, 21, 12, 27, 6],
      fixed: { 0: 24, 2: 18, 4: 15, 7: 27 },
      cards: [
        { cid: 'c1', value: 3 },
        { cid: 'c2', value: 6 },
        { cid: 'c3', value: 9 },
        { cid: 'c4', value: 12 },
        { cid: 'c5', value: 21 }
      ]
    },
    {
      id: 'mc_g3_10',
      kind: 'crossword',
      title: '10. Daugybos ir dalybos finalas',
      instruction: '3 klasės finalas! Suderink visas penkias daugybos, dalybos ir sudėties lygtis iki 100!',
      reward: 3,
      rows: 5,
      cols: 5,
      cells: [
        { r: 0, c: 0, type: 'slot', id: 'A', solution: 72 },
        { r: 0, c: 1, type: 'op', text: '÷' },
        { r: 0, c: 2, type: 'slot', id: 'B', solution: 9 },
        { r: 0, c: 3, type: 'op', text: '=' },
        { r: 0, c: 4, type: 'num', value: 8 },

        { r: 1, c: 0, type: 'op', text: '+' },
        { r: 1, c: 2, type: 'op', text: '×' },
        { r: 1, c: 4, type: 'op', text: '×' },

        { r: 2, c: 0, type: 'num', value: 28 },
        { r: 2, c: 2, type: 'num', value: 4 },
        { r: 2, c: 4, type: 'slot', id: 'D', solution: 8 },

        { r: 3, c: 0, type: 'op', text: '=' },
        { r: 3, c: 2, type: 'op', text: '=' },
        { r: 3, c: 4, type: 'op', text: '=' },

        { r: 4, c: 0, type: 'num', value: 100 },
        { r: 4, c: 1, type: 'op', text: '−' },
        { r: 4, c: 2, type: 'slot', id: 'C', solution: 36 },
        { r: 4, c: 3, type: 'op', text: '=' },
        { r: 4, c: 4, type: 'num', value: 64 }
      ],
      equations: [
        { a: 'A', op: '÷', b: 'B', res: 8 },
        { a: 'A', op: '+', b: 28, res: 100 },
        { a: 'B', op: '×', b: 4, res: 'C' },
        { a: 8, op: '×', b: 'D', res: 64 },
        { a: 100, op: '-', b: 'C', res: 64 }
      ],
      cards: [
        { cid: 'c1', value: 8 },
        { cid: 'c2', value: 9 },
        { cid: 'c3', value: 36 },
        { cid: 'c4', value: 72 },
        { cid: 'c5', value: 18 },
        { cid: 'c6', value: 24 }
      ]
    }
  ]
};

function evalArithmetic(a, op, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '×' || op === '*') return a * b;
  if (op === '÷' || op === '/') return b !== 0 && a % b === 0 ? a / b : NaN;
  return NaN;
}

export class MathCrossEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.placedBySlot = {}; // slotKey -> { cid, value }
    this.selectedSlotKey = null;
    this.selectedCardCid = null;
    this.hintSlotKey = null;
    this.badGroupIndices = new Set();
    this.won = false;
    this.isWinning = false;
    this.victoryTimer = 0;
    this.inputLocked = false;
    this.winNotified = false;
    this.winPulse = 0;
    this.rafId = null;
    this.hitboxes = []; // [{ key, x, y, r, isFixed, isFilled }]

    this.selectFirstEmptySlot();
    this.notifyState();
    this.draw();
  }

  destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getSlotKeys() {
    if (this.level.kind === 'triangle') {
      return [0, 1, 2, 3, 4, 5].filter((i) => this.level.fixed[i] === undefined).map(String);
    }
    if (this.level.kind === 'square') {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => this.level.fixed[i] === undefined).map(String);
    }
    return this.level.cells.filter((c) => c.type === 'slot').map((c) => c.id);
  }

  getSlotSolution(key) {
    if (this.level.kind === 'triangle' || this.level.kind === 'square') {
      return this.level.solution[Number(key)];
    }
    const cell = this.level.cells.find((c) => c.type === 'slot' && c.id === key);
    return cell ? cell.solution : null;
  }

  selectFirstEmptySlot() {
    const empty = this.getSlotKeys().find((k) => !this.placedBySlot[k]);
    this.selectedSlotKey = empty || null;
  }

  getUsedCardIds() {
    return new Set(Object.values(this.placedBySlot).map((c) => c.cid));
  }

  reset() {
    this.destroy();
    this.placedBySlot = {};
    this.selectedCardCid = null;
    this.hintSlotKey = null;
    this.badGroupIndices.clear();
    this.won = false;
    this.isWinning = false;
    this.victoryTimer = 0;
    this.inputLocked = false;
    this.winNotified = false;
    this.winPulse = 0;
    this.selectFirstEmptySlot();
    this.notifyState();
    this.draw();
  }

  placeCardInSlot(cid, slotKey) {
    if (this.won) return false;
    const keys = this.getSlotKeys();
    if (!keys.includes(String(slotKey))) return false;
    const card = (this.level.cards || []).find((c) => c.cid === cid);
    if (!card) return false;

    // Jei ši kortelė jau padėta kitame langelyje, nuimame iš ten
    for (const [k, v] of Object.entries(this.placedBySlot)) {
      if (v.cid === cid) {
        delete this.placedBySlot[k];
      }
    }

    this.placedBySlot[String(slotKey)] = { ...card };
    this.selectedCardCid = null;
    this.hintSlotKey = null;
    this.badGroupIndices.clear();
    this.selectFirstEmptySlot();
    this.notifyState();
    this.draw();
    this.callbacks.onMove?.('place');
    return true;
  }

  removeSlotCard(slotKey) {
    if (this.won) return false;
    const key = String(slotKey);
    if (!this.placedBySlot[key]) return false;
    delete this.placedBySlot[key];
    this.selectedSlotKey = key;
    this.hintSlotKey = null;
    this.badGroupIndices.clear();
    this.notifyState();
    this.draw();
    this.callbacks.onMove?.('remove');
    return true;
  }

  selectCard(cid) {
    if (this.won) return;
    if (this.getUsedCardIds().has(cid)) return;

    if (this.selectedSlotKey && !this.placedBySlot[this.selectedSlotKey]) {
      this.placeCardInSlot(cid, this.selectedSlotKey);
      return;
    }

    this.selectedCardCid = this.selectedCardCid === cid ? null : cid;
    this.notifyState();
    this.draw();
  }

  handlePointerDown(mx, my) {
    if (this.won) return;
    for (const box of this.hitboxes) {
      if (Math.hypot(mx - box.x, my - box.y) <= box.r + 5) {
        if (box.isFixed) return;
        if (this.selectedCardCid) {
          this.placeCardInSlot(this.selectedCardCid, box.key);
          return;
        }
        if (this.placedBySlot[box.key]) {
          this.removeSlotCard(box.key);
          return;
        }
        this.selectedSlotKey = box.key;
        this.notifyState();
        this.draw();
        return;
      }
    }
  }

  handleDropCard(cid, mx, my) {
    if (this.won) return false;
    for (const box of this.hitboxes) {
      if (!box.isFixed && Math.hypot(mx - box.x, my - box.y) <= box.r + 12) {
        return this.placeCardInSlot(cid, box.key);
      }
    }
    return false;
  }

  applyOneHint() {
    if (this.won) return null;
    const keys = this.getSlotKeys();

    // Pirmiausia tikriname, ar yra klaidingai įdėtas skaičius; kitaip pirmas tuščias langelis
    let targetKey = keys.find(
      (k) => this.placedBySlot[k] && this.placedBySlot[k].value !== this.getSlotSolution(k)
    );
    if (!targetKey) {
      targetKey = keys.find((k) => !this.placedBySlot[k]);
    }
    if (!targetKey) return null;

    const wantedVal = this.getSlotSolution(targetKey);
    const usedIds = this.getUsedCardIds();
    const card =
      (this.level.cards || []).find((c) => c.value === wantedVal && !usedIds.has(c.cid)) ||
      (this.level.cards || []).find((c) => c.value === wantedVal);
    if (!card) return null;

    this.placeCardInSlot(card.cid, targetKey);
    this.hintSlotKey = targetKey;
    this.draw();
    return { slotKey: targetKey, value: wantedVal };
  }

  checkSolution() {
    if (this.won) return null;
    const keys = this.getSlotKeys();
    const emptyCount = keys.filter((k) => !this.placedBySlot[k]).length;
    if (emptyCount > 0) {
      return { incomplete: true, emptyCount };
    }

    this.badGroupIndices.clear();

    if (this.level.kind === 'triangle') {
      const vals = [0, 1, 2, 3, 4, 5].map((i) =>
        this.level.fixed[i] !== undefined ? this.level.fixed[i] : this.placedBySlot[String(i)]?.value
      );
      TRIANGLE_SIDES.forEach((side, idx) => {
        const s = side.reduce((acc, i) => acc + vals[i], 0);
        if (s !== this.level.magicSum) this.badGroupIndices.add(idx);
      });
    } else if (this.level.kind === 'square') {
      const vals = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
        this.level.fixed[i] !== undefined ? this.level.fixed[i] : this.placedBySlot[String(i)]?.value
      );
      SQUARE_LINES.forEach((line, idx) => {
        const s = line.reduce((acc, i) => acc + vals[i], 0);
        if (s !== this.level.magicSum) this.badGroupIndices.add(idx);
      });
    } else {
      const resolveVal = (ref) =>
        typeof ref === 'number' ? ref : this.placedBySlot[String(ref)]?.value;
      (this.level.equations || []).forEach((eq, idx) => {
        const va = resolveVal(eq.a);
        const vb = resolveVal(eq.b);
        const vr = resolveVal(eq.res);
        if (evalArithmetic(va, eq.op, vb) !== vr) {
          this.badGroupIndices.add(idx);
        }
      });
    }

    if (this.badGroupIndices.size === 0) {
      this.won = true;
      this.isWinning = true;
      this.inputLocked = true;
      this.victoryTimer = 0;
      this.winNotified = false;
      this.winPulse = 0;
      this.selectedSlotKey = null;
      this.notifyState();
      this.draw();
      this.callbacks.onCheckResult?.({ ok: true, won: true });
      this.startVictoryLoop();
      return { ok: true, won: true };
    }

    this.draw();
    this.callbacks.onCheckResult?.({ ok: false, badCount: this.badGroupIndices.size });
    return { ok: false, badCount: this.badGroupIndices.size };
  }

  notifyState() {
    const keys = this.getSlotKeys();
    const filledCount = keys.filter((k) => Boolean(this.placedBySlot[k])).length;
    this.callbacks.onStateChange?.({
      filledCount,
      totalSlots: keys.length,
      usedCardIds: Array.from(this.getUsedCardIds()),
      selectedCardCid: this.selectedCardCid,
      selectedSlotKey: this.selectedSlotKey,
      won: this.won
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, MATHCROSS_CANVAS_W, MATHCROSS_CANVAS_H);

    // Kosminis fonas
    const bg = ctx.createLinearGradient(0, 0, 0, MATHCROSS_CANVAS_H);
    bg.addColorStop(0, '#020617');
    bg.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, MATHCROSS_CANVAS_W, MATHCROSS_CANVAS_H);

    this.hitboxes = [];

    if (this.level.kind === 'triangle') {
      this.drawTriangle(ctx);
    } else if (this.level.kind === 'square') {
      this.drawSquare(ctx);
    } else {
      this.drawCrossword(ctx);
    }
  }

  startVictoryLoop() {
    if (this.rafId !== null) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.winPulse += dt;
      if (this.isWinning && !this.winNotified) {
        this.victoryTimer += dt;
        if (this.victoryTimer >= 1.6) {
          this.isWinning = false;
          this.winNotified = true;
          this.callbacks.onWin?.();
        }
      }
      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  drawNode(ctx, x, y, r, key, value, isFixed) {
    const isPlaced = !isFixed && value !== null && value !== undefined;
    const isSelected = !isFixed && this.selectedSlotKey === key;
    const isHinted = !isFixed && this.hintSlotKey === key;
    const winGlow = this.won ? 0.5 + 0.5 * Math.sin(this.winPulse * 6 + x * 0.02 + y * 0.02) : 0;

    ctx.save();
    if (this.won) {
      ctx.shadowBlur = 14 + winGlow * 14;
      ctx.shadowColor = '#4ade80';
    } else if (isHinted || isSelected) {
      ctx.shadowBlur = 16;
      ctx.shadowColor = isHinted ? '#facc15' : '#38bdf8';
    }

    ctx.fillStyle = this.won
      ? isFixed
        ? '#166534'
        : '#15803d'
      : isFixed
        ? '#334155'
        : isPlaced
          ? '#0369a1'
          : '#0f172a';
    ctx.strokeStyle = this.won
      ? '#4ade80'
      : isHinted
        ? '#facc15'
        : isSelected
          ? '#38bdf8'
          : isFixed
            ? '#94a3b8'
            : isPlaced
              ? '#7dd3fc'
              : '#6366f1';
    ctx.lineWidth = isSelected || isHinted ? 4 : 3;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isFixed ? '#e2e8f0' : isPlaced ? '#ffffff' : '#64748b';
    ctx.font = '900 21px "Russo One", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value !== null && value !== undefined ? String(value) : '?', x, y + 1);
    ctx.restore();

    this.hitboxes.push({ key, x, y, r, isFixed, isFilled: isPlaced });
  }

  drawTriangle(ctx) {
    const cx = MATHCROSS_CANVAS_W / 2;
    const coords = [
      { x: cx, y: 66 },
      { x: cx + 78, y: 196 },
      { x: cx + 156, y: 326 },
      { x: cx, y: 326 },
      { x: cx - 156, y: 326 },
      { x: cx - 78, y: 196 }
    ];

    // Trikampio kraštinės
    TRIANGLE_SIDES.forEach((side, idx) => {
      const p1 = coords[side[0]];
      const p2 = coords[side[2]];
      const isBad = this.badGroupIndices.has(idx);
      ctx.save();
      ctx.strokeStyle = this.won ? '#4ade80' : isBad ? '#fb7185' : '#4f46e5';
      ctx.lineWidth = isBad ? 8 : 6;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    });

    // Centro tikslo ženkliukas
    ctx.save();
    ctx.fillStyle = this.won ? 'rgba(21, 128, 61, 0.9)' : 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = this.won ? '#4ade80' : '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 68, 206, 136, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '900 17px "Russo One", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Σ = ${this.level.magicSum}`, cx, 229);
    ctx.restore();

    coords.forEach((pos, idx) => {
      const key = String(idx);
      const isFixed = this.level.fixed[idx] !== undefined;
      const val = isFixed ? this.level.fixed[idx] : this.placedBySlot[key]?.value ?? null;
      this.drawNode(ctx, pos.x, pos.y, 28, key, val, isFixed);
    });
  }

  drawSquare(ctx) {
    const startX = MATHCROSS_CANVAS_W / 2 - 96;
    const startY = 82;
    const gap = 96;

    // Tikslo juosta viršuje
    ctx.save();
    ctx.fillStyle = '#fde047';
    ctx.font = '900 18px "Russo One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`MAGIŠKASIS KVADRATAS • KIEKVIENA EILUTĖ / STULPELIS / ĮSTRIŽAINĖ = ${this.level.magicSum}`, MATHCROSS_CANVAS_W / 2, 30);
    ctx.restore();

    // Tinklelio rėmeliai
    ctx.save();
    ctx.strokeStyle = this.won ? '#4ade80' : '#4338ca';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      // Horizontalios
      ctx.beginPath();
      ctx.moveTo(startX, startY + i * gap);
      ctx.lineTo(startX + 2 * gap, startY + i * gap);
      ctx.stroke();
      // Vertikalios
      ctx.beginPath();
      ctx.moveTo(startX + i * gap, startY);
      ctx.lineTo(startX + i * gap, startY + 2 * gap);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + 2 * gap, startY + 2 * gap);
    ctx.moveTo(startX + 2 * gap, startY);
    ctx.lineTo(startX, startY + 2 * gap);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3);
      const c = i % 3;
      const x = startX + c * gap;
      const y = startY + r * gap;
      const key = String(i);
      const isFixed = this.level.fixed[i] !== undefined;
      const val = isFixed ? this.level.fixed[i] : this.placedBySlot[key]?.value ?? null;
      this.drawNode(ctx, x, y, 32, key, val, isFixed);
    }
  }

  drawCrossword(ctx) {
    const cellSize = 64;
    const gap = 8;
    const totalW = this.level.cols * cellSize + (this.level.cols - 1) * gap;
    const totalH = this.level.rows * cellSize + (this.level.rows - 1) * gap;
    const ox = (MATHCROSS_CANVAS_W - totalW) / 2;
    const oy = (MATHCROSS_CANVAS_H - totalH) / 2;

    for (const cell of this.level.cells) {
      const cx = ox + cell.c * (cellSize + gap) + cellSize / 2;
      const cy = oy + cell.r * (cellSize + gap) + cellSize / 2;

      if (cell.type === 'op') {
        ctx.save();
        ctx.fillStyle = cell.text === '=' ? '#facc15' : '#38bdf8';
        ctx.font = '900 28px "Russo One", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.text, cx, cy + 1);
        ctx.restore();
      } else if (cell.type === 'num') {
        const winGlow = this.won ? 0.5 + 0.5 * Math.sin(this.winPulse * 6 + cx * 0.02 + cy * 0.02) : 0;
        ctx.save();
        if (this.won) {
          ctx.shadowBlur = 12 + winGlow * 10;
          ctx.shadowColor = '#4ade80';
        }
        ctx.fillStyle = this.won ? '#166534' : '#1e293b';
        ctx.strokeStyle = this.won ? '#4ade80' : '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx - 28, cy - 28, 56, 56, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.won ? '#dcfce7' : '#e2e8f0';
        ctx.font = '900 21px "Russo One", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(cell.value), cx, cy + 1);
        ctx.restore();
      } else if (cell.type === 'slot') {
        const key = cell.id;
        const placed = this.placedBySlot[key];
        const isSelected = this.selectedSlotKey === key;
        const isHinted = this.hintSlotKey === key;
        const winGlow = this.won ? 0.5 + 0.5 * Math.sin(this.winPulse * 6 + cx * 0.02 + cy * 0.02) : 0;

        ctx.save();
        if (this.won) {
          ctx.shadowBlur = 14 + winGlow * 14;
          ctx.shadowColor = '#4ade80';
        } else if (isHinted || isSelected) {
          ctx.shadowBlur = 16;
          ctx.shadowColor = isHinted ? '#facc15' : '#38bdf8';
        }
        ctx.fillStyle = this.won ? '#15803d' : placed ? '#0369a1' : '#0f172a';
        ctx.strokeStyle = this.won
          ? '#4ade80'
          : isHinted
            ? '#facc15'
            : isSelected
              ? '#38bdf8'
              : placed
                ? '#7dd3fc'
                : '#a855f7';
        ctx.lineWidth = isSelected || isHinted ? 4 : 3;
        ctx.beginPath();
        ctx.roundRect(cx - 28, cy - 28, 56, 56, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = placed ? '#ffffff' : '#94a3b8';
        ctx.font = '900 22px "Russo One", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(placed ? String(placed.value) : '?', cx, cy + 1);
        ctx.restore();

        this.hitboxes.push({
          key,
          x: cx,
          y: cy,
          r: 30,
          isFixed: false,
          isFilled: Boolean(placed)
        });
      }
    }
  }
}
