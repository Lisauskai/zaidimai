// ==================== BUBIŲ TVIRTOVĖ: 5 ZONOS, 15 ŽEMĖLAPIŲ IR TEMINĖ GRAFIKA ====================

export const CAMPAIGN_ZONES = [
  {
    zoneId: 1,
    name: 'Bubių kiemas ir šiltnamis',
    icon: '🏡',
    theme: 'courtyard_greenhouse',
    accent: '#4ade80',
    desc: 'Žalia veja, polikarbonatinis šiltnamis, pakeltos lysvės ir šilauogių vazonai.'
  },
  {
    zoneId: 2,
    name: 'Bubių piliakalnis ir tvenkinys',
    icon: '⛰️',
    theme: 'mound_pond',
    accent: '#38bdf8',
    desc: 'Mėlynas tvenkinio vanduo, mediniai lieptai, dviračių takas ir kilpos aplink kalvą.'
  },
  {
    zoneId: 3,
    name: 'Kurtuvėnų girios takas',
    icon: '🌲',
    theme: 'kurtuvenai_forest',
    accent: '#34d399',
    desc: 'Pušynas, samanotos pelkės ir takas, kuris išsišakoja į dvi šakas bei vėl susijungia.'
  },
  {
    zoneId: 4,
    name: 'Dagilėlio muzikos aikštė',
    icon: '🎵',
    theme: 'dagilelis_music',
    accent: '#fb7185',
    desc: 'Koncertų scena, juodai balti klavišų takeliai ir du atskiri priešų įėjimai.'
  },
  {
    zoneId: 5,
    name: 'Saulės bokštas ir ateities bazė',
    icon: '🛰️',
    theme: 'solar_future_base',
    accent: '#fbbf24',
    desc: 'Metalinės plokštės ir du visiškai atskiri keliai su daug strateginių kryžkelių!'
  }
];

export const CAMPAIGN_LEVELS = [
  // ==================== 1 ZONA: BUBIŲ KIEMAS IR ŠILTNAMIS (1–3 LYGIAI) ====================
  {
    id: 'lvl_1',
    levelNumber: 1,
    zoneId: 1,
    levelInZone: 1,
    theme: 'courtyard_greenhouse',
    title: '1. Kiemas prie šiltnamio',
    badge: '1 Zona • 6 bangos • S takelis',
    subtitle: 'Mokomasis S formos takelis pro šiltnamį: statyk bokštelius posūkiuose!',
    baseCoins: 210,
    maxWaves: 6,
    bgTop: '#11301e',
    bgBottom: '#081910',
    pathColor: '#a68557',
    pathBorder: '#574227',
    accentColor: '#4ade80',
    campaignPos: { x: 8, y: 74 },
    fortress: { x: 848, y: 235 },
    paths: [
      [
        { x: 24, y: 160 },
        { x: 245, y: 160 },
        { x: 335, y: 345 },
        { x: 615, y: 345 },
        { x: 695, y: 235 },
        { x: 848, y: 235 }
      ]
    ],
    pads: [
      { id: 'p1', x: 140, y: 95 },
      { id: 'p2', x: 140, y: 235 },
      { id: 'p3', x: 265, y: 255 },
      { id: 'p4', x: 430, y: 265 },
      { id: 'p5', x: 485, y: 420 },
      { id: 'p6', x: 635, y: 255 },
      { id: 'p7', x: 765, y: 160 }
    ]
  },
  {
    id: 'lvl_2',
    levelNumber: 2,
    zoneId: 1,
    levelInZone: 2,
    theme: 'courtyard_greenhouse',
    title: '2. Pakeltų lysvių takas',
    badge: '1 Zona • 6 bangos • Dvigubas S',
    subtitle: 'Takelis vingiuoja pro pakeltas lysves ir šilauogių vazonus.',
    baseCoins: 220,
    maxWaves: 6,
    bgTop: '#11301e',
    bgBottom: '#081910',
    pathColor: '#a68557',
    pathBorder: '#574227',
    accentColor: '#4ade80',
    campaignPos: { x: 14, y: 54 },
    fortress: { x: 848, y: 245 },
    paths: [
      [
        { x: 24, y: 350 },
        { x: 205, y: 350 },
        { x: 265, y: 125 },
        { x: 490, y: 125 },
        { x: 550, y: 370 },
        { x: 725, y: 370 },
        { x: 775, y: 245 },
        { x: 848, y: 245 }
      ]
    ],
    pads: [
      { id: 'p1', x: 120, y: 270 },
      { id: 'p2', x: 120, y: 425 },
      { id: 'p3', x: 315, y: 210 },
      { id: 'p4', x: 390, y: 210 },
      { id: 'p5', x: 455, y: 300 },
      { id: 'p6', x: 630, y: 295 },
      { id: 'p7', x: 630, y: 440 },
      { id: 'p8', x: 765, y: 165 }
    ]
  },
  {
    id: 'lvl_3',
    levelNumber: 3,
    zoneId: 1,
    levelInZone: 3,
    theme: 'courtyard_greenhouse',
    title: '3. Šiltnamio sargyba (Bosas)',
    badge: '1 Zona • 7 bangos • 👑 Bosas',
    subtitle: 'Gilus S serpantinas aplink šiltnamį – 7-oje bangoje pasirodys Šliužų Karalius!',
    baseCoins: 235,
    maxWaves: 7,
    bgTop: '#133420',
    bgBottom: '#081910',
    pathColor: '#a68557',
    pathBorder: '#574227',
    accentColor: '#4ade80',
    campaignPos: { x: 20, y: 32 },
    fortress: { x: 848, y: 255 },
    paths: [
      [
        { x: 24, y: 120 },
        { x: 190, y: 120 },
        { x: 235, y: 395 },
        { x: 430, y: 395 },
        { x: 475, y: 120 },
        { x: 675, y: 120 },
        { x: 725, y: 255 },
        { x: 848, y: 255 }
      ]
    ],
    pads: [
      { id: 'p1', x: 115, y: 200 },
      { id: 'p2', x: 335, y: 205 },
      { id: 'p3', x: 335, y: 315 },
      { id: 'p4', x: 565, y: 205 },
      { id: 'p5', x: 565, y: 315 },
      { id: 'p6', x: 650, y: 425 },
      { id: 'p7', x: 775, y: 175 },
      { id: 'p8', x: 775, y: 345 }
    ]
  },

  // ==================== 2 ZONA: BUBIŲ PILIAKALNIS IR TVENKINYS (4–6 LYGIAI) ====================
  {
    id: 'lvl_4',
    levelNumber: 4,
    zoneId: 2,
    levelInZone: 1,
    theme: 'mound_pond',
    title: '4. Tvenkinio lieptas',
    badge: '2 Zona • 7 bangos • Dviračių takas',
    subtitle: 'Dviračių takas ir medinis lieptas per mėlyną Bubių tvenkinį!',
    baseCoins: 235,
    maxWaves: 7,
    bgTop: '#0b2538',
    bgBottom: '#071422',
    pathColor: '#9c7146',
    pathBorder: '#4f3720',
    accentColor: '#38bdf8',
    campaignPos: { x: 27, y: 48 },
    fortress: { x: 848, y: 245 },
    paths: [
      [
        { x: 24, y: 265 },
        { x: 205, y: 265 },
        { x: 305, y: 130 },
        { x: 545, y: 130 },
        { x: 625, y: 365 },
        { x: 745, y: 365 },
        { x: 790, y: 245 },
        { x: 848, y: 245 }
      ]
    ],
    pads: [
      { id: 'p1', x: 115, y: 185 },
      { id: 'p2', x: 115, y: 345 },
      { id: 'p3', x: 325, y: 225 },
      { id: 'p4', x: 430, y: 205 },
      { id: 'p5', x: 495, y: 300 },
      { id: 'p6', x: 655, y: 195 },
      { id: 'p7', x: 685, y: 440 },
      { id: 'p8', x: 775, y: 160 }
    ]
  },
  {
    id: 'lvl_5',
    levelNumber: 5,
    zoneId: 2,
    levelInZone: 2,
    theme: 'mound_pond',
    title: '5. Piliakalnio kilpa',
    badge: '2 Zona • 8 bangos • Kalvos kilpa',
    subtitle: 'Priešai suka didelę kilpą aplink Bubių piliakalnį – užimk centrines pozicijas ant kalvos!',
    baseCoins: 245,
    maxWaves: 8,
    bgTop: '#0b2538',
    bgBottom: '#071422',
    pathColor: '#947451',
    pathBorder: '#473624',
    accentColor: '#38bdf8',
    campaignPos: { x: 34, y: 72 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 250 },
        { x: 165, y: 250 },
        { x: 245, y: 100 },
        { x: 560, y: 100 },
        { x: 635, y: 245 },
        { x: 555, y: 405 },
        { x: 265, y: 405 },
        { x: 365, y: 250 },
        { x: 730, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 105, y: 170 },
      { id: 'p2', x: 105, y: 330 },
      { id: 'p3', x: 315, y: 175 },
      { id: 'p4', x: 465, y: 175 },
      { id: 'p5', x: 465, y: 330 },
      { id: 'p6', x: 695, y: 155 },
      { id: 'p7', x: 695, y: 345 },
      { id: 'p8', x: 775, y: 170 }
    ]
  },
  {
    id: 'lvl_6',
    levelNumber: 6,
    zoneId: 2,
    levelInZone: 3,
    theme: 'mound_pond',
    title: '6. Dviračių tako tvirtovė (Bosas)',
    badge: '2 Zona • 8 bangos • 👑 Bosas',
    subtitle: 'Dviguba kilpa per du lieptus – 8-oje bangoje išlįs Geležinis Kurmis!',
    baseCoins: 260,
    maxWaves: 8,
    bgTop: '#0b2538',
    bgBottom: '#071422',
    pathColor: '#9c7146',
    pathBorder: '#4f3720',
    accentColor: '#38bdf8',
    campaignPos: { x: 41, y: 50 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 140 },
        { x: 200, y: 140 },
        { x: 265, y: 380 },
        { x: 465, y: 380 },
        { x: 465, y: 115 },
        { x: 655, y: 115 },
        { x: 695, y: 360 },
        { x: 785, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 115, y: 225 },
      { id: 'p2', x: 115, y: 340 },
      { id: 'p3', x: 355, y: 195 },
      { id: 'p4', x: 365, y: 300 },
      { id: 'p5', x: 560, y: 205 },
      { id: 'p6', x: 560, y: 305 },
      { id: 'p7', x: 605, y: 430 },
      { id: 'p8', x: 765, y: 155 },
      { id: 'p9', x: 765, y: 355 }
    ]
  },

  // ==================== 3 ZONA: KURTUVĖNŲ GIRIOS TAKAS (7–9 LYGIAI) ====================
  {
    id: 'lvl_7',
    levelNumber: 7,
    zoneId: 3,
    levelInZone: 1,
    theme: 'kurtuvenai_forest',
    title: '7. Pušyno atšaka',
    badge: '3 Zona • 8 bangos • Išsišakojimas',
    subtitle: 'Takas girioje išsišakoja į dvi šakas aplink pelkę ir vėl susijungia!',
    baseCoins: 255,
    maxWaves: 8,
    bgTop: '#0a2422',
    bgBottom: '#061413',
    pathColor: '#7a664f',
    pathBorder: '#3f3326',
    accentColor: '#34d399',
    campaignPos: { x: 48, y: 26 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 250 },
        { x: 165, y: 250 },
        { x: 265, y: 120 },
        { x: 545, y: 120 },
        { x: 650, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 250 },
        { x: 165, y: 250 },
        { x: 265, y: 385 },
        { x: 545, y: 385 },
        { x: 650, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 110, y: 165 },
      { id: 'p2', x: 110, y: 335 },
      { id: 'p3', x: 300, y: 205 },
      { id: 'p4', x: 300, y: 300 },
      { id: 'p5', x: 505, y: 205 },
      { id: 'p6', x: 505, y: 300 },
      { id: 'p7', x: 740, y: 170 },
      { id: 'p8', x: 740, y: 330 }
    ]
  },
  {
    id: 'lvl_8',
    levelNumber: 8,
    zoneId: 3,
    levelInZone: 2,
    theme: 'kurtuvenai_forest',
    title: '8. Kurtuvėnų pelkynai',
    badge: '3 Zona • 9 bangos • Pelkės sala',
    subtitle: 'Dvi plačios girios šakos apjuosia pelkės salą ir susilieja prie bazės.',
    baseCoins: 270,
    maxWaves: 9,
    bgTop: '#0a2422',
    bgBottom: '#061413',
    pathColor: '#7a664f',
    pathBorder: '#3f3326',
    accentColor: '#34d399',
    campaignPos: { x: 55, y: 46 },
    fortress: { x: 848, y: 245 },
    paths: [
      [
        { x: 24, y: 245 },
        { x: 145, y: 245 },
        { x: 235, y: 95 },
        { x: 455, y: 95 },
        { x: 565, y: 185 },
        { x: 690, y: 245 },
        { x: 848, y: 245 }
      ],
      [
        { x: 24, y: 245 },
        { x: 145, y: 245 },
        { x: 235, y: 405 },
        { x: 455, y: 405 },
        { x: 565, y: 315 },
        { x: 690, y: 245 },
        { x: 848, y: 245 }
      ]
    ],
    pads: [
      { id: 'p1', x: 105, y: 165 },
      { id: 'p2', x: 105, y: 325 },
      { id: 'p3', x: 265, y: 195 },
      { id: 'p4', x: 265, y: 300 },
      { id: 'p5', x: 420, y: 175 },
      { id: 'p6', x: 420, y: 325 },
      { id: 'p7', x: 580, y: 248 },
      { id: 'p8', x: 755, y: 165 },
      { id: 'p9', x: 755, y: 330 }
    ]
  },
  {
    id: 'lvl_9',
    levelNumber: 9,
    zoneId: 3,
    levelInZone: 3,
    theme: 'kurtuvenai_forest',
    title: '9. Girios Šešėlių sankirta (Bosas)',
    badge: '3 Zona • 9 bangos • 👑 Bosas',
    subtitle: 'Dvi šakos susikerta ir vėl susijungia – 9-oje bangoje ateis Girios Šešėlių Valdovas!',
    baseCoins: 285,
    maxWaves: 9,
    bgTop: '#0a2422',
    bgBottom: '#061413',
    pathColor: '#7a664f',
    pathBorder: '#3f3326',
    accentColor: '#34d399',
    campaignPos: { x: 61, y: 74 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 250 },
        { x: 145, y: 250 },
        { x: 250, y: 110 },
        { x: 420, y: 250 },
        { x: 575, y: 110 },
        { x: 700, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 250 },
        { x: 145, y: 250 },
        { x: 250, y: 390 },
        { x: 420, y: 250 },
        { x: 575, y: 390 },
        { x: 700, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 105, y: 165 },
      { id: 'p2', x: 105, y: 335 },
      { id: 'p3', x: 290, y: 250 },
      { id: 'p4', x: 420, y: 140 },
      { id: 'p5', x: 420, y: 360 },
      { id: 'p6', x: 550, y: 250 },
      { id: 'p7', x: 675, y: 140 },
      { id: 'p8', x: 675, y: 360 },
      { id: 'p9', x: 775, y: 165 }
    ]
  },

  // ==================== 4 ZONA: DAGILĖLIO MUZIKOS AIKŠTĖ (10–12 LYGIAI) ====================
  {
    id: 'lvl_10',
    levelNumber: 10,
    zoneId: 4,
    levelInZone: 1,
    theme: 'dagilelis_music',
    title: '10. Klavišų alėja',
    badge: '4 Zona • 9 bangos • 2 atskiri įėjimai',
    subtitle: 'Du atskiri įėjimai juodai baltais pianino klavišų takeliais link koncertų scenos!',
    baseCoins: 280,
    maxWaves: 9,
    bgTop: '#1a1b3c',
    bgBottom: '#080b1f',
    pathColor: '#64748b',
    pathBorder: '#1e293b',
    accentColor: '#fb7185',
    campaignPos: { x: 68, y: 52 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 130 },
        { x: 195, y: 130 },
        { x: 255, y: 80 },
        { x: 475, y: 80 },
        { x: 540, y: 175 },
        { x: 705, y: 175 },
        { x: 770, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 370 },
        { x: 195, y: 370 },
        { x: 255, y: 420 },
        { x: 475, y: 420 },
        { x: 540, y: 325 },
        { x: 705, y: 325 },
        { x: 770, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 115, y: 250 },
      { id: 'p2', x: 280, y: 180 },
      { id: 'p3', x: 280, y: 320 },
      { id: 'p4', x: 370, y: 150 },
      { id: 'p5', x: 370, y: 350 },
      { id: 'p6', x: 445, y: 250 },
      { id: 'p7', x: 615, y: 105 },
      { id: 'p8', x: 615, y: 395 },
      { id: 'p9', x: 645, y: 250 }
    ]
  },
  {
    id: 'lvl_11',
    levelNumber: 11,
    zoneId: 4,
    levelInZone: 2,
    theme: 'dagilelis_music',
    title: '11. Amfiteatro simfonija',
    badge: '4 Zona • 10 bangų • 2 įėjimai',
    subtitle: 'Simetriniai klavišų lankai iš dviejų įėjimų – saugok akustinį amfiteatrą!',
    baseCoins: 295,
    maxWaves: 10,
    bgTop: '#1a1b3c',
    bgBottom: '#080b1f',
    pathColor: '#64748b',
    pathBorder: '#1e293b',
    accentColor: '#fb7185',
    campaignPos: { x: 75, y: 28 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 105 },
        { x: 225, y: 105 },
        { x: 315, y: 205 },
        { x: 525, y: 100 },
        { x: 675, y: 185 },
        { x: 765, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 395 },
        { x: 225, y: 395 },
        { x: 315, y: 295 },
        { x: 525, y: 400 },
        { x: 675, y: 315 },
        { x: 765, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 115, y: 200 },
      { id: 'p2', x: 115, y: 300 },
      { id: 'p3', x: 240, y: 250 },
      { id: 'p4', x: 420, y: 175 },
      { id: 'p5', x: 420, y: 325 },
      { id: 'p6', x: 530, y: 250 },
      { id: 'p7', x: 625, y: 105 },
      { id: 'p8', x: 625, y: 395 },
      { id: 'p9', x: 700, y: 250 }
    ]
  },
  {
    id: 'lvl_12',
    levelNumber: 12,
    zoneId: 4,
    levelInZone: 3,
    theme: 'dagilelis_music',
    title: '12. Didžioji koncertų scena (Bosas)',
    badge: '4 Zona • 10 bangų • 👑 Bosas',
    subtitle: 'Du atskiri įėjimai susikerta prieš sceną – 10-oje bangoje Klaidingų Natų Baubas!',
    baseCoins: 310,
    maxWaves: 10,
    bgTop: '#1d1b42',
    bgBottom: '#080b1f',
    pathColor: '#64748b',
    pathBorder: '#1e293b',
    accentColor: '#fb7185',
    campaignPos: { x: 81, y: 52 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 120 },
        { x: 210, y: 120 },
        { x: 360, y: 250 },
        { x: 530, y: 380 },
        { x: 685, y: 380 },
        { x: 770, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 380 },
        { x: 210, y: 380 },
        { x: 360, y: 250 },
        { x: 530, y: 120 },
        { x: 685, y: 120 },
        { x: 770, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 115, y: 250 },
      { id: 'p2', x: 245, y: 250 },
      { id: 'p3', x: 360, y: 145 },
      { id: 'p4', x: 360, y: 355 },
      { id: 'p5', x: 465, y: 250 },
      { id: 'p6', x: 595, y: 195 },
      { id: 'p7', x: 595, y: 305 },
      { id: 'p8', x: 685, y: 250 },
      { id: 'p9', x: 775, y: 145 },
      { id: 'p10', x: 775, y: 355 }
    ]
  },

  // ==================== 5 ZONA: SAULĖS BOKŠTAS IR ATEITIES BAZĖ (13–15 LYGIAI) ====================
  {
    id: 'lvl_13',
    levelNumber: 13,
    zoneId: 5,
    levelInZone: 1,
    theme: 'solar_future_base',
    title: '13. Saulės kolektorių koridoriai',
    badge: '5 Zona • 10 bangų • 2 atskiri keliai',
    subtitle: 'Du visiškai atskiri keliai į du reaktorius – saugok abu vienu metu!',
    baseCoins: 320,
    maxWaves: 10,
    bgTop: '#161b33',
    bgBottom: '#070a18',
    pathColor: '#475569',
    pathBorder: '#1e293b',
    accentColor: '#fbbf24',
    campaignPos: { x: 86, y: 76 },
    fortress: { x: 848, y: 115 },
    paths: [
      [
        { x: 24, y: 125 },
        { x: 240, y: 125 },
        { x: 315, y: 195 },
        { x: 585, y: 195 },
        { x: 655, y: 115 },
        { x: 848, y: 115 }
      ],
      [
        { x: 24, y: 375 },
        { x: 240, y: 375 },
        { x: 315, y: 305 },
        { x: 585, y: 305 },
        { x: 655, y: 385 },
        { x: 848, y: 385 }
      ]
    ],
    pads: [
      { id: 'p1', x: 135, y: 205 },
      { id: 'p2', x: 135, y: 295 },
      { id: 'p3', x: 345, y: 115 },
      { id: 'p4', x: 345, y: 385 },
      { id: 'p5', x: 395, y: 250 },
      { id: 'p6', x: 505, y: 250 },
      { id: 'p7', x: 535, y: 115 },
      { id: 'p8', x: 535, y: 385 },
      { id: 'p9', x: 745, y: 195 },
      { id: 'p10', x: 745, y: 305 }
    ]
  },
  {
    id: 'lvl_14',
    levelNumber: 14,
    zoneId: 5,
    levelInZone: 2,
    theme: 'solar_future_base',
    title: '14. Ateities bazės kryžkelės',
    badge: '5 Zona • 11 bangų • 2 atskiri keliai',
    subtitle: 'Du visiškai atskiri keliai susikerta centre ir skuba į skirtingus bazės vartus!',
    baseCoins: 340,
    maxWaves: 11,
    bgTop: '#161b33',
    bgBottom: '#070a18',
    pathColor: '#475569',
    pathBorder: '#1e293b',
    accentColor: '#fbbf24',
    campaignPos: { x: 91, y: 50 },
    fortress: { x: 848, y: 125 },
    paths: [
      [
        { x: 24, y: 115 },
        { x: 230, y: 115 },
        { x: 445, y: 355 },
        { x: 665, y: 355 },
        { x: 848, y: 375 }
      ],
      [
        { x: 24, y: 385 },
        { x: 230, y: 385 },
        { x: 445, y: 145 },
        { x: 665, y: 145 },
        { x: 848, y: 125 }
      ]
    ],
    pads: [
      { id: 'p1', x: 135, y: 250 },
      { id: 'p2', x: 265, y: 250 },
      { id: 'p3', x: 345, y: 140 },
      { id: 'p4', x: 345, y: 360 },
      { id: 'p5', x: 460, y: 250 },
      { id: 'p6', x: 565, y: 215 },
      { id: 'p7', x: 565, y: 285 },
      { id: 'p8', x: 685, y: 250 },
      { id: 'p9', x: 765, y: 205 },
      { id: 'p10', x: 765, y: 295 }
    ]
  },
  {
    id: 'lvl_15',
    levelNumber: 15,
    zoneId: 5,
    levelInZone: 3,
    theme: 'solar_future_base',
    title: '15. Saulės Bokšto šerdis (Finalas)',
    badge: '5 Zona • 12 bangų • 👑 Finalinis Bosas',
    subtitle: 'Daugiakryžminiai ateities bazės keliai ir 12-oje bangoje – Kibernetinis Mega-Bosukas!',
    baseCoins: 380,
    maxWaves: 12,
    bgTop: '#1b1d3a',
    bgBottom: '#060916',
    pathColor: '#475569',
    pathBorder: '#1e293b',
    accentColor: '#fbbf24',
    campaignPos: { x: 95, y: 24 },
    fortress: { x: 848, y: 130 },
    paths: [
      [
        { x: 24, y: 110 },
        { x: 195, y: 110 },
        { x: 295, y: 295 },
        { x: 515, y: 115 },
        { x: 675, y: 295 },
        { x: 848, y: 130 }
      ],
      [
        { x: 24, y: 390 },
        { x: 195, y: 390 },
        { x: 295, y: 205 },
        { x: 515, y: 385 },
        { x: 675, y: 205 },
        { x: 848, y: 370 }
      ]
    ],
    pads: [
      { id: 'p1', x: 115, y: 250 },
      { id: 'p2', x: 225, y: 250 },
      { id: 'p3', x: 385, y: 145 },
      { id: 'p4', x: 385, y: 355 },
      { id: 'p5', x: 405, y: 250 },
      { id: 'p6', x: 525, y: 250 },
      { id: 'p7', x: 600, y: 155 },
      { id: 'p8', x: 600, y: 345 },
      { id: 'p9', x: 695, y: 115 },
      { id: 'p10', x: 695, y: 385 },
      { id: 'p11', x: 775, y: 250 }
    ]
  }
];

export const MAP_DEFINITIONS = {};
for (const lvl of CAMPAIGN_LEVELS) {
  MAP_DEFINITIONS[lvl.id] = lvl;
}
// Suderinamumas su senesniais trumpiniais
MAP_DEFINITIONS.bubiai = MAP_DEFINITIONS.lvl_1;
MAP_DEFINITIONS.kurtuvenai = MAP_DEFINITIONS.lvl_7;
MAP_DEFINITIONS.dagilelis = MAP_DEFINITIONS.lvl_10;

export function getLevelById(idOrNumber) {
  if (typeof idOrNumber === 'number') {
    return CAMPAIGN_LEVELS.find((l) => l.levelNumber === idOrNumber) || CAMPAIGN_LEVELS[0];
  }
  return MAP_DEFINITIONS[idOrNumber] || CAMPAIGN_LEVELS[0];
}

/**
 * Piešia teminį kraštovaizdį po keliais ir statybos aikštelėmis (šiltnamiai, tvenkiniai, pušynas, klavišai, metalo plokštės).
 */
export function renderMapThemeDecorations(ctx, map, animClock = 0) {
  if (!ctx || !map) return;
  const theme = map.theme || 'courtyard_greenhouse';

  ctx.save();

  if (theme === 'courtyard_greenhouse') {
    // Žalios vejos juostos
    ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
    for (let x = 0; x < 900; x += 90) {
      ctx.fillRect(x, 0, 45, 500);
    }

    // Polikarbonatinis šiltnamis
    ctx.fillStyle = 'rgba(186, 230, 253, 0.16)';
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(690, 28, 128, 72, 14);
    ctx.fill();
    ctx.stroke();
    for (let rx = 716; rx < 810; rx += 24) {
      ctx.beginPath();
      ctx.moveTo(rx, 28);
      ctx.lineTo(rx, 100);
      ctx.stroke();
    }
    ctx.fillStyle = '#bae6fd';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 Šiltnamis', 754, 18);

    // Pakeltos lysvės ir šilauogių vazonai
    const beds = [
      { x: 40, y: 24, w: 84, h: 38 },
      { x: 35, y: 432, w: 94, h: 38 }
    ];
    for (const b of beds) {
      ctx.fillStyle = '#5c3a21';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = '#22c55e';
      for (let gx = b.x + 14; gx < b.x + b.w - 8; gx += 18) {
        ctx.beginPath();
        ctx.arc(gx, b.y + b.h / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Šilauogių vazonai
    const pots = [
      { x: 810, y: 435 },
      { x: 845, y: 445 },
      { x: 775, y: 445 }
    ];
    for (const p of pots) {
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(p.x - 3, p.y - 2, 4, 0, Math.PI * 2);
      ctx.arc(p.x + 4, p.y + 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'mound_pond') {
    // Mėlynas Bubių tvenkinys su ratilais
    ctx.fillStyle = 'rgba(14, 165, 233, 0.24)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(465, 260, 125, 78, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const rippleR = 26 + ((animClock * 18) % 45);
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(465, 260, rippleR, rippleR * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Piliakalnio kontūrai
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.ellipse(170, 82, 95, 42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(134, 239, 172, 0.55)';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛰️ Piliakalnis', 170, 52);

    // Medinis lieptas
    ctx.fillStyle = '#78350f';
    ctx.fillRect(425, 175, 80, 14);
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(425, 175, 80, 14);
  } else if (theme === 'kurtuvenai_forest') {
    // Pelkės baseinai
    const swamps = [
      { x: 405, y: 248, rx: 75, ry: 44 },
      { x: 745, y: 80, rx: 58, ry: 30 }
    ];
    for (const sw of swamps) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, sw.rx, sw.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Pušų viršūnės
    const pines = [
      { x: 68, y: 60 },
      { x: 645, y: 60 },
      { x: 68, y: 440 },
      { x: 645, y: 445 },
      { x: 820, y: 430 }
    ];
    for (const p of pines) {
      ctx.fillStyle = 'rgba(20, 83, 45, 0.85)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(p.x - 4, p.y - 4, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'dagilelis_music') {
    // Koncertų scenos kupolas dešinėje
    ctx.fillStyle = 'rgba(244, 63, 94, 0.16)';
    ctx.strokeStyle = 'rgba(251, 113, 133, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(848, 250, 72, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();
    ctx.stroke();

    // Pianino klavišų dekoracijos aikštės viduryje
    for (let k = 0; k < 8; k++) {
      ctx.fillStyle = k % 2 === 0 ? 'rgba(248, 250, 252, 0.16)' : 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(360 + k * 22, 18, 20, 32);
      ctx.fillRect(360 + k * 22, 450, 20, 32);
    }
  } else if (theme === 'solar_future_base') {
    // Futuristinės metalinės plokštės su kniedėmis ir energijos kanalais
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1.5;
    for (let gx = 45; gx < 860; gx += 135) {
      for (let gy = 30; gy < 460; gy += 110) {
        ctx.strokeRect(gx, gy, 118, 92);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.beginPath();
        ctx.arc(gx + 8, gy + 8, 2, 0, Math.PI * 2);
        ctx.arc(gx + 110, gy + 8, 2, 0, Math.PI * 2);
        ctx.arc(gx + 8, gy + 84, 2, 0, Math.PI * 2);
        ctx.arc(gx + 110, gy + 84, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
