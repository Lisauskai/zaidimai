// ==================== ENERGIJOS TILTAI (HASHI / BRIDGES DEDUKCINIS GALVOSŪKIS, 11 ZONA) ====================

export const BRIDGES_CANVAS_W = 580;
export const BRIDGES_CANVAS_H = 420;

export const BRIDGES_LEVELS = {
  grade1: [
    {
      id: 'br_g1_1',
      title: '1. Kampinis ketvertukas',
      instruction: 'Pradėk nuo kampinės salos 4: ji turi tik du kaimynus, todėl privalo tiesti po 2 tiltus į abi puses!',
      reward: 1,
      rows: 3,
      cols: 4,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 3 },
        { id: 2, r: 2, c: 0, need: 2 },
        { id: 3, r: 2, c: 2, need: 2 },
        { id: 4, r: 2, c: 3, need: 1 }
      ],
      solution: [[0, 1, 2], [0, 2, 2], [1, 3, 1], [3, 4, 1]]
    },
    {
      id: 'br_g1_2',
      title: '2. Salų žiedas',
      instruction: 'Viršuje dešinėje sala 4 turi tik du kelius! Nutiesk po 2 tiltus ir sujunk visą tinklą.',
      reward: 1,
      rows: 4,
      cols: 4,
      islands: [
        { id: 0, r: 0, c: 0, need: 3 },
        { id: 1, r: 0, c: 3, need: 4 },
        { id: 2, r: 1, c: 3, need: 3 },
        { id: 3, r: 3, c: 3, need: 2 },
        { id: 4, r: 3, c: 0, need: 2 }
      ],
      solution: [[0, 1, 2], [0, 4, 1], [1, 2, 2], [2, 3, 1], [3, 4, 1]]
    },
    {
      id: 'br_g1_3',
      title: '3. Kosminė kryžkelė',
      instruction: 'Rask kampą 4 ir vienišą salą 1! Kiekviena sala turi gauti lygiai tiek tiltų, kiek jos viduje.',
      reward: 1,
      rows: 4,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 3 },
        { id: 2, r: 0, c: 4, need: 1 },
        { id: 3, r: 2, c: 0, need: 3 },
        { id: 4, r: 2, c: 2, need: 2 },
        { id: 5, r: 3, c: 2, need: 1 }
      ],
      solution: [[0, 1, 2], [0, 3, 2], [1, 2, 1], [3, 4, 1], [4, 5, 1]]
    },
    {
      id: 'br_g1_4',
      title: '4. Dvigubi tiltai',
      instruction: 'Tiltai negali kirstis! Pradėk nuo kampinės salos 4 ir apačios salos 1.',
      reward: 2,
      rows: 4,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 1, need: 4 },
        { id: 1, r: 0, c: 4, need: 4 },
        { id: 2, r: 2, c: 0, need: 2 },
        { id: 3, r: 2, c: 1, need: 4 },
        { id: 4, r: 2, c: 4, need: 3 },
        { id: 5, r: 3, c: 4, need: 1 }
      ],
      solution: [[0, 1, 2], [0, 3, 2], [1, 4, 2], [2, 3, 2], [4, 5, 1]]
    },
    {
      id: 'br_g1_5',
      title: '5. Penketuko centras',
      instruction: 'Viršuje esanti sala 5 turi tris kaimynus. Apskaičiuok, kiek tiltų keliauja į šonus ir žemyn!',
      reward: 2,
      rows: 4,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 2 },
        { id: 1, r: 0, c: 2, need: 5 },
        { id: 2, r: 0, c: 4, need: 2 },
        { id: 3, r: 2, c: 1, need: 1 },
        { id: 4, r: 2, c: 2, need: 4 },
        { id: 5, r: 3, c: 2, need: 2 }
      ],
      solution: [[0, 1, 2], [1, 2, 2], [1, 4, 1], [3, 4, 1], [4, 5, 2]]
    },
    {
      id: 'br_g1_6',
      title: '6. Septynių salų stotis',
      instruction: 'Sujunk visas 7 kosmines stotis į vieną bendrą tinklą be susikirtimų!',
      reward: 2,
      rows: 5,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 2 },
        { id: 1, r: 0, c: 2, need: 3 },
        { id: 2, r: 0, c: 4, need: 4 },
        { id: 3, r: 2, c: 0, need: 2 },
        { id: 4, r: 2, c: 2, need: 3 },
        { id: 5, r: 2, c: 4, need: 5 },
        { id: 6, r: 4, c: 4, need: 1 }
      ],
      solution: [[0, 1, 1], [0, 3, 1], [1, 2, 2], [2, 5, 2], [3, 4, 1], [4, 5, 2], [5, 6, 1]]
    },
    {
      id: 'br_g1_7',
      title: '7. Švyturio linija',
      instruction: 'Kampe 4 ir dešinėje 5 garantuoja pirmus tiltus! Nepalik nė vienos salos vienos.',
      reward: 2,
      rows: 5,
      cols: 6,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 3, need: 5 },
        { id: 2, r: 0, c: 5, need: 2 },
        { id: 3, r: 2, c: 0, need: 3 },
        { id: 4, r: 2, c: 3, need: 4 },
        { id: 5, r: 4, c: 3, need: 3 },
        { id: 6, r: 4, c: 1, need: 1 }
      ],
      solution: [[0, 1, 2], [0, 3, 2], [1, 2, 2], [1, 4, 1], [3, 4, 1], [4, 5, 2], [5, 6, 1]]
    },
    {
      id: 'br_g1_8',
      title: '8. Pirmoko iššūkis',
      instruction: 'Apskaičiuok visas jungtis! Dėmesio – sala 5 viduryje pasidalija tiltus į tris puses.',
      reward: 3,
      rows: 5,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 3 },
        { id: 1, r: 0, c: 2, need: 5 },
        { id: 2, r: 0, c: 4, need: 2 },
        { id: 3, r: 2, c: 0, need: 4 },
        { id: 4, r: 2, c: 2, need: 5 },
        { id: 5, r: 2, c: 4, need: 3 },
        { id: 6, r: 4, c: 0, need: 2 }
      ],
      solution: [[0, 1, 2], [0, 3, 1], [1, 2, 1], [1, 4, 2], [2, 5, 1], [3, 4, 1], [3, 6, 2], [4, 5, 2]]
    },
    {
      id: 'br_g1_9',
      title: '9. Aštuonių salų žiedas',
      instruction: 'Sujunk visas 8 salas be jokių susikirtimų! Pirma sujunk kampines ir kraštines salas.',
      reward: 3,
      rows: 5,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 3 },
        { id: 2, r: 0, c: 4, need: 2 },
        { id: 3, r: 2, c: 0, need: 5 },
        { id: 4, r: 2, c: 2, need: 5 },
        { id: 5, r: 2, c: 4, need: 3 },
        { id: 6, r: 4, c: 0, need: 3 },
        { id: 7, r: 4, c: 2, need: 3 }
      ],
      solution: [[0, 1, 2], [0, 3, 2], [1, 2, 1], [2, 5, 1], [3, 4, 2], [3, 6, 1], [4, 5, 2], [4, 7, 1], [6, 7, 2]]
    },
    {
      id: 'br_g1_10',
      title: '10. Pirmoko didysis tinklas',
      instruction: '1 klasės finalas! Visos 9 salos turi susijungti į vieną bendrą kosminę sistemą.',
      reward: 3,
      rows: 5,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 3 },
        { id: 1, r: 0, c: 2, need: 3 },
        { id: 2, r: 0, c: 4, need: 3 },
        { id: 3, r: 2, c: 0, need: 5 },
        { id: 4, r: 2, c: 2, need: 4 },
        { id: 5, r: 2, c: 4, need: 4 },
        { id: 6, r: 4, c: 0, need: 2 },
        { id: 7, r: 4, c: 2, need: 3 },
        { id: 8, r: 4, c: 4, need: 3 }
      ],
      solution: [[0, 1, 2], [0, 3, 1], [1, 2, 1], [2, 5, 2], [3, 4, 2], [3, 6, 2], [4, 5, 1], [4, 7, 1], [5, 8, 1], [7, 8, 2]]
    }
  ],

  grade3: [
    {
      id: 'br_g3_1',
      title: '1. Šešetuko mazgas',
      instruction: '9 salos! Pradėk nuo užtikrintų jungčių ir saugokis, kad neliktų atskirtų salų grupelių.',
      reward: 1,
      rows: 5,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 2 },
        { id: 1, r: 0, c: 2, need: 2 },
        { id: 2, r: 0, c: 4, need: 4 },
        { id: 3, r: 2, c: 0, need: 5 },
        { id: 4, r: 2, c: 2, need: 3 },
        { id: 5, r: 2, c: 4, need: 3 },
        { id: 6, r: 4, c: 0, need: 4 },
        { id: 7, r: 4, c: 2, need: 4 },
        { id: 8, r: 4, c: 4, need: 1 }
      ],
      solution: [[0, 3, 2], [1, 2, 2], [2, 5, 2], [3, 4, 1], [3, 6, 2], [4, 5, 1], [4, 7, 1], [6, 7, 2], [7, 8, 1]]
    },
    {
      id: 'br_g3_2',
      title: '2. Kosminis reaktorius (6)',
      instruction: '10 salų su skaičiumi 6! Atidžiai tikrink, kad kaimyninių salų tiltai neužkirstų kelio.',
      reward: 1,
      rows: 5,
      cols: 6,
      islands: [
        { id: 0, r: 0, c: 0, need: 2 },
        { id: 1, r: 0, c: 2, need: 4 },
        { id: 2, r: 0, c: 5, need: 3 },
        { id: 3, r: 2, c: 0, need: 6 },
        { id: 4, r: 2, c: 2, need: 4 },
        { id: 5, r: 2, c: 4, need: 3 },
        { id: 6, r: 2, c: 5, need: 3 },
        { id: 7, r: 4, c: 0, need: 4 },
        { id: 8, r: 4, c: 2, need: 4 },
        { id: 9, r: 4, c: 4, need: 3 }
      ],
      solution: [[0, 3, 2], [1, 2, 2], [1, 4, 2], [2, 6, 1], [3, 4, 2], [3, 7, 2], [5, 6, 2], [5, 9, 1], [7, 8, 2], [8, 9, 2]]
    },
    {
      id: 'br_g3_3',
      title: '3. Priverstinė grandinė',
      instruction: 'Sala 6 dešinėje turi tik tris kaimynus – tai reiškia po 2 tiltus į kiekvieną pusę!',
      reward: 2,
      rows: 5,
      cols: 5,
      islands: [
        { id: 0, r: 0, c: 0, need: 3 },
        { id: 1, r: 0, c: 2, need: 5 },
        { id: 2, r: 0, c: 4, need: 3 },
        { id: 3, r: 2, c: 0, need: 3 },
        { id: 4, r: 2, c: 2, need: 5 },
        { id: 5, r: 2, c: 4, need: 6 },
        { id: 6, r: 3, c: 0, need: 1 },
        { id: 7, r: 4, c: 1, need: 1 },
        { id: 8, r: 4, c: 2, need: 3 },
        { id: 9, r: 4, c: 4, need: 4 }
      ],
      solution: [[0, 1, 2], [0, 3, 1], [1, 2, 1], [1, 4, 2], [2, 5, 2], [3, 4, 1], [3, 6, 1], [4, 5, 2], [5, 9, 2], [7, 8, 1], [8, 9, 2]]
    },
    {
      id: 'br_g3_4',
      title: '4. Kertinių kelių blokada',
      instruction: '11 salų! Jei nutiesi netinkamą horizontalų tiltą, užblokuosi vertikalią jungtį!',
      reward: 2,
      rows: 6,
      cols: 6,
      islands: [
        { id: 0, r: 0, c: 0, need: 3 },
        { id: 1, r: 0, c: 3, need: 3 },
        { id: 2, r: 0, c: 5, need: 1 },
        { id: 3, r: 1, c: 1, need: 2 },
        { id: 4, r: 1, c: 3, need: 5 },
        { id: 5, r: 3, c: 0, need: 6 },
        { id: 6, r: 3, c: 1, need: 2 },
        { id: 7, r: 3, c: 3, need: 4 },
        { id: 8, r: 3, c: 5, need: 3 },
        { id: 9, r: 5, c: 0, need: 4 },
        { id: 10, r: 5, c: 5, need: 3 }
      ],
      solution: [[0, 1, 1], [0, 5, 2], [1, 2, 1], [1, 4, 1], [3, 4, 2], [4, 7, 2], [5, 6, 2], [5, 9, 2], [7, 8, 2], [8, 10, 1], [9, 10, 2]]
    },
    {
      id: 'br_g3_5',
      title: '5. Dvylikos salų orbita',
      instruction: '12 salų tinklas! Kairysis kampas 4 ir vieniši 1 padės pradėti be spėliojimo.',
      reward: 2,
      rows: 5,
      cols: 7,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 2 },
        { id: 2, r: 0, c: 4, need: 3 },
        { id: 3, r: 0, c: 6, need: 2 },
        { id: 4, r: 2, c: 0, need: 3 },
        { id: 5, r: 2, c: 2, need: 3 },
        { id: 6, r: 2, c: 4, need: 5 },
        { id: 7, r: 2, c: 6, need: 4 },
        { id: 8, r: 4, c: 0, need: 1 },
        { id: 9, r: 4, c: 2, need: 5 },
        { id: 10, r: 4, c: 4, need: 3 },
        { id: 11, r: 4, c: 6, need: 1 }
      ],
      solution: [[0, 1, 2], [0, 4, 2], [2, 3, 1], [2, 6, 2], [3, 7, 1], [4, 5, 1], [5, 9, 2], [6, 7, 2], [6, 10, 1], [7, 11, 1], [8, 9, 1], [9, 10, 2]]
    },
    {
      id: 'br_g3_6',
      title: '6. Dvigubas šešetukas',
      instruction: 'Net du šešetukai (6) ir ketvertai kampuose! Neleisk tinklui suskilti į dvi salas.',
      reward: 2,
      rows: 5,
      cols: 7,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 4 },
        { id: 2, r: 0, c: 4, need: 2 },
        { id: 3, r: 0, c: 6, need: 4 },
        { id: 4, r: 2, c: 0, need: 5 },
        { id: 5, r: 2, c: 2, need: 5 },
        { id: 6, r: 2, c: 4, need: 6 },
        { id: 7, r: 2, c: 6, need: 6 },
        { id: 8, r: 4, c: 0, need: 4 },
        { id: 9, r: 4, c: 2, need: 2 },
        { id: 10, r: 4, c: 4, need: 4 },
        { id: 11, r: 4, c: 6, need: 4 }
      ],
      solution: [[0, 1, 2], [0, 4, 2], [1, 5, 2], [2, 3, 2], [3, 7, 2], [4, 5, 1], [4, 8, 2], [5, 6, 2], [6, 7, 2], [6, 10, 2], [7, 11, 2], [8, 9, 2], [10, 11, 2]]
    },
    {
      id: 'br_g3_7',
      title: '7. Galaktikos architektas',
      instruction: '13 salų strategija! Apskaičiuok vidurinių salų kryptis, kad nesusikirstų tiltai.',
      reward: 3,
      rows: 6,
      cols: 7,
      islands: [
        { id: 0, r: 0, c: 0, need: 1 },
        { id: 1, r: 0, c: 2, need: 5 },
        { id: 2, r: 0, c: 4, need: 5 },
        { id: 3, r: 0, c: 6, need: 2 },
        { id: 4, r: 1, c: 1, need: 2 },
        { id: 5, r: 1, c: 4, need: 2 },
        { id: 6, r: 3, c: 0, need: 4 },
        { id: 7, r: 3, c: 1, need: 5 },
        { id: 8, r: 3, c: 2, need: 3 },
        { id: 9, r: 3, c: 6, need: 3 },
        { id: 10, r: 5, c: 0, need: 4 },
        { id: 11, r: 5, c: 2, need: 3 },
        { id: 12, r: 5, c: 6, need: 3 }
      ],
      solution: [[0, 1, 1], [1, 2, 2], [1, 8, 2], [2, 3, 1], [2, 5, 2], [3, 9, 1], [4, 7, 2], [6, 7, 2], [6, 10, 2], [7, 8, 1], [9, 12, 2], [10, 11, 2], [11, 12, 1]]
    },
    {
      id: 'br_g3_8',
      title: '8. Didysis 14 salų tinklas',
      instruction: 'Vyriausiojo inžinieriaus egzaminas! Sujunk visas 14 salų vieninteliu teisingu būdu.',
      reward: 3,
      rows: 6,
      cols: 7,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 2 },
        { id: 2, r: 0, c: 4, need: 4 },
        { id: 3, r: 0, c: 6, need: 4 },
        { id: 4, r: 2, c: 0, need: 5 },
        { id: 5, r: 2, c: 1, need: 5 },
        { id: 6, r: 2, c: 2, need: 1 },
        { id: 7, r: 2, c: 4, need: 4 },
        { id: 8, r: 2, c: 6, need: 6 },
        { id: 9, r: 4, c: 1, need: 4 },
        { id: 10, r: 4, c: 4, need: 2 },
        { id: 11, r: 4, c: 6, need: 4 },
        { id: 12, r: 5, c: 0, need: 3 },
        { id: 13, r: 5, c: 6, need: 4 }
      ],
      solution: [[0, 1, 2], [0, 4, 2], [2, 3, 2], [2, 7, 2], [3, 8, 2], [4, 5, 2], [4, 12, 1], [5, 6, 1], [5, 9, 2], [7, 8, 2], [8, 11, 2], [9, 10, 2], [11, 13, 2], [12, 13, 2]]
    },
    {
      id: 'br_g3_9',
      title: '9. Penkiolikos salų sistema',
      instruction: 'Net 15 salų ir šešetukai kraštuose! Sujunk visą tinklą be nė vienos atsiskyrusios salos.',
      reward: 3,
      rows: 6,
      cols: 7,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 5 },
        { id: 2, r: 0, c: 4, need: 4 },
        { id: 3, r: 0, c: 6, need: 3 },
        { id: 4, r: 2, c: 0, need: 6 },
        { id: 5, r: 2, c: 2, need: 6 },
        { id: 6, r: 2, c: 4, need: 6 },
        { id: 7, r: 2, c: 6, need: 6 },
        { id: 8, r: 4, c: 0, need: 4 },
        { id: 9, r: 4, c: 2, need: 5 },
        { id: 10, r: 4, c: 4, need: 5 },
        { id: 11, r: 4, c: 6, need: 4 },
        { id: 12, r: 5, c: 0, need: 3 },
        { id: 13, r: 5, c: 3, need: 3 },
        { id: 14, r: 5, c: 6, need: 2 }
      ],
      solution: [
        [0, 1, 2], [1, 2, 2], [2, 3, 1],
        [0, 4, 2], [1, 5, 1], [2, 6, 1], [3, 7, 2],
        [4, 5, 2], [5, 6, 1], [6, 7, 2],
        [4, 8, 2], [5, 9, 2], [6, 10, 2], [7, 11, 2],
        [8, 9, 1], [9, 10, 2], [10, 11, 1],
        [8, 12, 1], [11, 14, 1],
        [12, 13, 2], [13, 14, 1]
      ]
    },
    {
      id: 'br_g3_10',
      title: '10. Galaktikos tiltų finalas',
      instruction: '3 klasės finalas! 16 salų kosminė architektūra — sujunk jas visas vienu nenutrūkstamu tinklu.',
      reward: 3,
      rows: 6,
      cols: 7,
      islands: [
        { id: 0, r: 0, c: 0, need: 4 },
        { id: 1, r: 0, c: 2, need: 5 },
        { id: 2, r: 0, c: 4, need: 4 },
        { id: 3, r: 0, c: 6, need: 3 },
        { id: 4, r: 2, c: 0, need: 5 },
        { id: 5, r: 2, c: 2, need: 6 },
        { id: 6, r: 2, c: 4, need: 6 },
        { id: 7, r: 2, c: 6, need: 4 },
        { id: 8, r: 4, c: 0, need: 5 },
        { id: 9, r: 4, c: 2, need: 5 },
        { id: 10, r: 4, c: 4, need: 5 },
        { id: 11, r: 4, c: 6, need: 6 },
        { id: 12, r: 5, c: 0, need: 3 },
        { id: 13, r: 5, c: 2, need: 5 },
        { id: 14, r: 5, c: 4, need: 3 },
        { id: 15, r: 5, c: 6, need: 3 }
      ],
      solution: [
        [0, 1, 2], [1, 2, 1], [2, 3, 2],
        [0, 4, 2], [1, 5, 2], [2, 6, 1], [3, 7, 1],
        [4, 5, 1], [5, 6, 2], [6, 7, 1],
        [4, 8, 2], [5, 9, 1], [6, 10, 2], [7, 11, 2],
        [8, 9, 2], [9, 10, 1], [10, 11, 2],
        [8, 12, 1], [9, 13, 1], [11, 15, 2],
        [12, 13, 2], [13, 14, 2], [14, 15, 1]
      ]
    }
  ]
};

function buildCandidateEdges(islands) {
  const n = islands.length;
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = islands[i];
      const b = islands[j];
      if (a.r === b.r) {
        const minC = Math.min(a.c, b.c);
        const maxC = Math.max(a.c, b.c);
        const blocked = islands.some(
          (k, idx) => idx !== i && idx !== j && k.r === a.r && k.c > minC && k.c < maxC
        );
        if (!blocked) edges.push({ u: i, v: j, dir: 'H', fix: a.r, a: minC, b: maxC, count: 0 });
      } else if (a.c === b.c) {
        const minR = Math.min(a.r, b.r);
        const maxR = Math.max(a.r, b.r);
        const blocked = islands.some(
          (k, idx) => idx !== i && idx !== j && k.c === a.c && k.r > minR && k.r < maxR
        );
        if (!blocked) edges.push({ u: i, v: j, dir: 'V', fix: a.c, a: minR, b: maxR, count: 0 });
      }
    }
  }
  return edges;
}

function edgesCross(e1, e2) {
  if (e1.dir === e2.dir) return false;
  const h = e1.dir === 'H' ? e1 : e2;
  const v = e1.dir === 'V' ? e1 : e2;
  return v.fix > h.a && v.fix < h.b && h.fix > v.a && h.fix < v.b;
}

export class BridgesEngine {
  constructor(canvas, level, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.callbacks = callbacks;

    this.edges = buildCandidateEdges(level.islands);
    this.selectedIslandId = null;
    this.dragStartIslandId = null;
    this.hintIslandId = null;
    this.flashCrossEdge = null;
    this.flashTimer = null;
    this.won = false;
    this.isWinning = false;
    this.victoryTimer = 0;
    this.inputLocked = false;
    this.winNotified = false;
    this.winPulse = 0;
    this.rafId = null;
    this.islandCoords = [];
    this.islandRadius = 24;

    this.computeGeometry();
    this.draw();
    this.notifyState();
  }

  computeGeometry() {
    const padX = 56;
    const padY = 52;
    const cols = Math.max(2, this.level.cols - 1);
    const rows = Math.max(2, this.level.rows - 1);
    const usableW = BRIDGES_CANVAS_W - padX * 2;
    const usableH = BRIDGES_CANVAS_H - padY * 2;
    const step = Math.min(usableW / cols, usableH / rows);
    const offsetX = (BRIDGES_CANVAS_W - step * cols) / 2;
    const offsetY = (BRIDGES_CANVAS_H - step * rows) / 2;

    this.islandRadius = this.level.islands.length >= 11 ? 21 : 24;
    this.islandCoords = this.level.islands.map((isl) => ({
      id: isl.id,
      x: offsetX + isl.c * step,
      y: offsetY + isl.r * step,
      need: isl.need
    }));
  }

  destroy() {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
      this.flashTimer = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  reset() {
    this.destroy();
    this.edges.forEach((e) => {
      e.count = 0;
    });
    this.selectedIslandId = null;
    this.dragStartIslandId = null;
    this.hintIslandId = null;
    this.flashCrossEdge = null;
    this.won = false;
    this.isWinning = false;
    this.victoryTimer = 0;
    this.inputLocked = false;
    this.winNotified = false;
    this.winPulse = 0;
    this.draw();
    this.notifyState();
  }

  setHintIsland(id) {
    this.hintIslandId = id;
    this.draw();
  }

  getDegree(islandId) {
    return this.edges.reduce(
      (acc, e) => (e.u === islandId || e.v === islandId ? acc + e.count : acc),
      0
    );
  }

  findEdge(u, v) {
    const a = Math.min(u, v);
    const b = Math.max(u, v);
    return this.edges.find((e) => e.u === a && e.v === b) || null;
  }

  wouldCross(edge) {
    return this.edges.find((other) => other !== edge && other.count > 0 && edgesCross(edge, other)) || null;
  }

  cycleEdge(edge) {
    if (!edge || this.won) return false;

    if (edge.count === 0) {
      const blocking = this.wouldCross(edge);
      if (blocking) {
        this.flashCrossEdge = blocking;
        if (this.flashTimer) clearTimeout(this.flashTimer);
        this.flashTimer = setTimeout(() => {
          this.flashCrossEdge = null;
          this.draw();
        }, 700);
        this.draw();
        this.callbacks.onCrossBlocked?.();
        return false;
      }
      edge.count = 1;
    } else if (edge.count === 1) {
      edge.count = 2;
    } else {
      edge.count = 0;
    }

    this.hintIslandId = null;
    this.selectedIslandId = null;
    this.callbacks.onBridgeToggle?.(edge.count);
    this.evaluateNetwork();
    this.draw();
    this.notifyState();
    return true;
  }

  isNetworkConnected() {
    const n = this.level.islands.length;
    const visited = new Set([0]);
    const queue = [0];
    while (queue.length > 0) {
      const cur = queue.shift();
      for (const e of this.edges) {
        if (e.count > 0 && (e.u === cur || e.v === cur)) {
          const nxt = e.u === cur ? e.v : e.u;
          if (!visited.has(nxt)) {
            visited.add(nxt);
            queue.push(nxt);
          }
        }
      }
    }
    return visited.size === n;
  }

  evaluateNetwork() {
    const allMatch = this.level.islands.every((isl) => this.getDegree(isl.id) === isl.need);
    if (!allMatch) return;

    if (this.isNetworkConnected()) {
      if (!this.won && !this.isWinning) {
        this.won = true;
        this.isWinning = true;
        this.inputLocked = true;
        this.victoryTimer = 0;
        this.winNotified = false;
        this.winPulse = 0;
        this.notifyState();
        this.startVictoryLoop();
      }
    } else {
      this.callbacks.onDisconnected?.();
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

  getGuaranteedHintIslandId() {
    const islands = this.level.islands;
    // 1. Pirmiausia ieškome garantuotos taisyklės: kampo/briaunos su maksimalia suma arba salos 1 su 1 kaimynu
    for (const isl of islands) {
      const deg = this.getDegree(isl.id);
      if (deg >= isl.need) continue;
      const openNeighbors = this.edges.filter(
        (e) =>
          (e.u === isl.id || e.v === isl.id) &&
          (e.count > 0 || !this.wouldCross(e)) &&
          this.getDegree(e.u === isl.id ? e.v : e.u) < islands[e.u === isl.id ? e.v : e.u].need
      );
      const maxCap = openNeighbors.length * 2;
      if (isl.need - deg === maxCap && openNeighbors.length > 0) {
        return isl.id;
      }
      if (isl.need === 1 && deg === 0 && openNeighbors.length === 1) {
        return isl.id;
      }
    }

    // 2. Antraip parenkame salą iš tikrojo sprendimo, kuriai dar trūksta tilto
    for (const [u, v, target] of this.level.solution || []) {
      const e = this.findEdge(u, v);
      if (e && e.count < target) {
        return u;
      }
    }
    return null;
  }

  hitTestIsland(mx, my) {
    for (const pos of this.islandCoords) {
      if (Math.hypot(mx - pos.x, my - pos.y) <= this.islandRadius + 8) {
        return pos.id;
      }
    }
    return null;
  }

  hitTestBridge(mx, my) {
    for (const e of this.edges) {
      if (e.count === 0) continue;
      const p1 = this.islandCoords[e.u];
      const p2 = this.islandCoords[e.v];
      if (e.dir === 'H') {
        const minX = Math.min(p1.x, p2.x) + this.islandRadius;
        const maxX = Math.max(p1.x, p2.x) - this.islandRadius;
        if (mx >= minX && mx <= maxX && Math.abs(my - p1.y) <= 14) {
          return e;
        }
      } else {
        const minY = Math.min(p1.y, p2.y) + this.islandRadius;
        const maxY = Math.max(p1.y, p2.y) - this.islandRadius;
        if (my >= minY && my <= maxY && Math.abs(mx - p1.x) <= 14) {
          return e;
        }
      }
    }
    return null;
  }

  handlePointerDown(mx, my) {
    if (this.won) return;
    const islId = this.hitTestIsland(mx, my);
    if (islId !== null) {
      this.dragStartIslandId = islId;
      if (this.selectedIslandId !== null && this.selectedIslandId !== islId) {
        const edge = this.findEdge(this.selectedIslandId, islId);
        if (edge) {
          this.cycleEdge(edge);
          this.dragStartIslandId = null;
          return;
        }
      }
      this.selectedIslandId = this.selectedIslandId === islId ? null : islId;
      this.draw();
      this.notifyState();
      return;
    }

    this.selectedIslandId = null;
    const bridgeEdge = this.hitTestBridge(mx, my);
    if (bridgeEdge) {
      this.cycleEdge(bridgeEdge);
      return;
    }
    this.draw();
  }

  handlePointerUp(mx, my) {
    if (this.won || this.dragStartIslandId === null) {
      this.dragStartIslandId = null;
      return;
    }
    const endId = this.hitTestIsland(mx, my);
    if (endId !== null && endId !== this.dragStartIslandId) {
      const edge = this.findEdge(this.dragStartIslandId, endId);
      if (edge) {
        this.cycleEdge(edge);
      }
    }
    this.dragStartIslandId = null;
  }

  notifyState() {
    const satisfiedCount = this.level.islands.filter((isl) => this.getDegree(isl.id) === isl.need).length;
    const bridgeTotal = this.edges.reduce((acc, e) => acc + e.count, 0);
    this.callbacks.onStateChange?.({
      satisfiedCount,
      totalIslands: this.level.islands.length,
      bridgeTotal,
      won: this.won
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, BRIDGES_CANVAS_W, BRIDGES_CANVAS_H);

    // Kosminio vandenyno / tinklo fonas
    const bg = ctx.createLinearGradient(0, 0, 0, BRIDGES_CANVAS_H);
    bg.addColorStop(0, '#020617');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, BRIDGES_CANVAS_W, BRIDGES_CANVAS_H);

    // Subtilūs orientaciniai punktyrai tarp galimų kaimynų
    ctx.save();
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    for (const e of this.edges) {
      const p1 = this.islandCoords[e.u];
      const p2 = this.islandCoords[e.v];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();

    // Jei pasirinkta sala, paryškiname jos pasiekiamus kaimynus
    if (this.selectedIslandId !== null) {
      ctx.save();
      for (const e of this.edges) {
        if (e.u === this.selectedIslandId || e.v === this.selectedIslandId) {
          if (e.count === 0 && this.wouldCross(e)) continue;
          const otherId = e.u === this.selectedIslandId ? e.v : e.u;
          const p = this.islandCoords[otherId];
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, this.islandRadius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Nutiesiami energijos tiltai (1 arba 2 lygiagrečios spinduliuojančios linijos)
    for (const e of this.edges) {
      if (e.count === 0) continue;
      const p1 = this.islandCoords[e.u];
      const p2 = this.islandCoords[e.v];
      const isFlash = e === this.flashCrossEdge;

      ctx.save();
      ctx.strokeStyle = this.won ? '#4ade80' : isFlash ? '#fb7185' : '#38bdf8';
      ctx.shadowBlur = isFlash ? 16 : 10;
      ctx.shadowColor = this.won ? '#22c55e' : isFlash ? '#f43f5e' : '#0ea5e9';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      if (e.count === 1) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else {
        const offset = 6;
        const dx = e.dir === 'V' ? offset : 0;
        const dy = e.dir === 'H' ? offset : 0;
        ctx.beginPath();
        ctx.moveTo(p1.x - dx, p1.y - dy);
        ctx.lineTo(p2.x - dx, p2.y - dy);
        ctx.moveTo(p1.x + dx, p1.y + dy);
        ctx.lineTo(p2.x + dx, p2.y + dy);
        ctx.stroke();
      }
      if (this.won) {
        // Šviesos impulsas keliauja per tiltą
        const t = ((this.winPulse * 1.3 + e.u * 0.17) % 1);
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t;
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#fde047';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Piešiame pačias salas
    for (const pos of this.islandCoords) {
      const deg = this.getDegree(pos.id);
      const isMatch = deg === pos.need;
      const isOver = deg > pos.need;
      const isSelected = pos.id === this.selectedIslandId;
      const isHinted = pos.id === this.hintIslandId;

      ctx.save();
      if (isHinted || isSelected || isMatch || isOver) {
        ctx.shadowBlur = isHinted || isSelected ? 20 : 12;
        ctx.shadowColor = isHinted
          ? '#facc15'
          : isSelected
            ? '#38bdf8'
            : isOver
              ? '#f43f5e'
              : '#22c55e';
      }

      ctx.fillStyle = isOver
        ? '#7f1d1d'
        : isMatch
          ? '#14532d'
          : isSelected
            ? '#0c4a6e'
            : '#1e293b';
      ctx.strokeStyle = isHinted
        ? '#facc15'
        : isSelected
          ? '#7dd3fc'
          : isOver
            ? '#fb7185'
            : isMatch
              ? '#4ade80'
              : '#6366f1';
      ctx.lineWidth = isSelected || isHinted ? 4.5 : 3.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.islandRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isOver ? '#fecdd3' : isMatch ? '#dcfce7' : '#ffffff';
      ctx.font = '900 20px "Russo One", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(pos.need), pos.x, pos.y + 1);
      ctx.restore();
    }
  }
}
