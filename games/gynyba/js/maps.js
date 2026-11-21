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
  },
  {
    zoneId: 6,
    name: 'Mūšos tyrelio pelkynas',
    icon: '🌿',
    theme: 'musa_swamp',
    accent: '#2dd4bf',
    desc: 'Samanota pelkė, tamsūs ežerėliai, medinių lentų pažintinis takas, kylantis rūkas ir spanguolių kupstai.'
  },
  {
    zoneId: 7,
    name: 'Karpėnų klinčių karjeras',
    icon: '🪨',
    theme: 'karpenai_quarry',
    accent: '#38bdf8',
    desc: 'Šviesios baltos ir smėlio klinčių uolų terasos, ryškiai žydras karjero vanduo ir kanjonų posūkiai.'
  },
  {
    zoneId: 8,
    name: 'Kosminė Saulės Jėgainė',
    icon: '☀️',
    theme: 'cosmic_solar_plant',
    accent: '#a855f7',
    desc: 'Futuristinė elektrinė su milžiniškomis saulės baterijų eilėmis, energijos tiltais ir 2–3 keliais!'
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
    badge: '1 Zona • 8 bangos • S takelis',
    subtitle: 'Mokomasis S formos takelis pro šiltnamį: statyk bokštelius posūkiuose!',
    baseCoins: 220,
    maxWaves: 8,
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
      { id: 'p3', x: 215, y: 265 },
      { id: 'p4', x: 430, y: 265 },
      { id: 'p5', x: 485, y: 420 },
      { id: 'p6', x: 610, y: 255 },
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
    badge: '1 Zona • 9 bangos • Dvigubas S',
    subtitle: 'Takelis vingiuoja pro pakeltas lysves ir šilauogių vazonus.',
    baseCoins: 220,
    maxWaves: 9,
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
    badge: '1 Zona • 10 bangų • 👑 Bosas',
    subtitle: 'Gilus S serpantinas aplink šiltnamį – 10-oje bangoje pasirodys Šliužų Karalius!',
    baseCoins: 235,
    maxWaves: 10,
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
    badge: '2 Zona • 10 bangų • Dviračių takas',
    subtitle: 'Dviračių takas ir medinis lieptas per mėlyną Bubių tvenkinį!',
    baseCoins: 235,
    maxWaves: 10,
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
    badge: '2 Zona • 11 bangų • Kalvos kilpa',
    subtitle: 'Priešai suka didelę kilpą aplink Bubių piliakalnį – užimk centrines pozicijas ant kalvos!',
    baseCoins: 245,
    maxWaves: 11,
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
    badge: '2 Zona • 11 bangų • 👑 Bosas',
    subtitle: 'Dviguba kilpa per du lieptus – 11-oje bangoje išlįs Geležinis Kurmis!',
    baseCoins: 260,
    maxWaves: 11,
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
      { id: 'p9', x: 765, y: 375 }
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
    badge: '3 Zona • 12 bangų • Išsišakojimas',
    subtitle: 'Takas girioje išsišakoja į dvi šakas aplink pelkę ir vėl susijungia!',
    baseCoins: 255,
    maxWaves: 12,
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
    badge: '3 Zona • 12 bangų • Pelkės sala',
    subtitle: 'Dvi plačios girios šakos apjuosia pelkės salą ir susilieja prie bazės.',
    baseCoins: 270,
    maxWaves: 12,
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
    badge: '3 Zona • 13 bangų • 👑 Bosas',
    subtitle: 'Dvi šakos susikerta ir vėl susijungia – 13-oje bangoje ateis Girios Šešėlių Valdovas!',
    baseCoins: 285,
    maxWaves: 13,
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
    badge: '4 Zona • 13 bangų • 2 atskiri įėjimai',
    subtitle: 'Du atskiri įėjimai juodai baltais pianino klavišų takeliais link koncertų scenos!',
    baseCoins: 280,
    maxWaves: 13,
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
    badge: '4 Zona • 14 bangų • 2 įėjimai',
    subtitle: 'Simetriniai klavišų lankai iš dviejų įėjimų – saugok akustinį amfiteatrą!',
    baseCoins: 295,
    maxWaves: 14,
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
      { id: 'p4', x: 420, y: 205 },
      { id: 'p5', x: 420, y: 295 },
      { id: 'p6', x: 530, y: 250 },
      { id: 'p7', x: 635, y: 72 },
      { id: 'p8', x: 635, y: 428 },
      { id: 'p9', x: 670, y: 250 }
    ]
  },
  {
    id: 'lvl_12',
    levelNumber: 12,
    zoneId: 4,
    levelInZone: 3,
    theme: 'dagilelis_music',
    title: '12. Didžioji koncertų scena (Bosas)',
    badge: '4 Zona • 14 bangų • 👑 Bosas',
    subtitle: 'Du atskiri įėjimai susikerta prieš sceną – 14-oje bangoje Klaidingų Natų Baubas!',
    baseCoins: 310,
    maxWaves: 14,
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
    badge: '5 Zona • 15 bangų • 2 atskiri keliai',
    subtitle: 'Du visiškai atskiri keliai į du reaktorius – saugok abu vienu metu!',
    baseCoins: 320,
    maxWaves: 15,
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
    badge: '5 Zona • 15 bangų • 2 atskiri keliai',
    subtitle: 'Du visiškai atskiri keliai susikerta centre ir skuba į skirtingus bazės vartus!',
    baseCoins: 340,
    maxWaves: 15,
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
    badge: '5 Zona • 16 bangų • 👑 Finalinis Bosas',
    subtitle: 'Daugiakryžminiai ateities bazės keliai ir 16-oje bangoje – Kibernetinis Mega-Bosukas!',
    baseCoins: 380,
    maxWaves: 16,
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
      { id: 'p2', x: 195, y: 250 },
      { id: 'p3', x: 385, y: 145 },
      { id: 'p4', x: 385, y: 355 },
      { id: 'p5', x: 295, y: 75 },
      { id: 'p6', x: 525, y: 250 },
      { id: 'p7', x: 525, y: 175 },
      { id: 'p8', x: 525, y: 325 },
      { id: 'p9', x: 695, y: 115 },
      { id: 'p10', x: 695, y: 385 },
      { id: 'p11', x: 825, y: 250 }
    ]
  },

  // ==================== 6 ZONA: MŪŠOS TYRELIO PELKYNAS (16–20 LYGIAI) ====================
  {
    id: 'lvl_16',
    levelNumber: 16,
    zoneId: 6,
    levelInZone: 1,
    theme: 'musa_swamp',
    title: '16. Samanotasis pažintinis takas',
    badge: '6 Zona • 14 bangų • Lentų takas',
    subtitle: 'Medinis lentų takas per Mūšos tyrelį. Nematomi priešai ir Gamtos Gydytojai – statyk Dronų Angarus!',
    baseCoins: 380,
    maxWaves: 14,
    bgTop: '#0d2b26',
    bgBottom: '#061513',
    pathColor: '#7c5332',
    pathBorder: '#3b2412',
    accentColor: '#2dd4bf',
    campaignPos: { x: 10, y: 74 },
    fortress: { x: 848, y: 260 },
    paths: [
      [
        { x: 24, y: 130 },
        { x: 210, y: 130 },
        { x: 210, y: 360 },
        { x: 460, y: 360 },
        { x: 460, y: 130 },
        { x: 690, y: 130 },
        { x: 690, y: 260 },
        { x: 848, y: 260 }
      ]
    ],
    pads: [
      { id: 'p1', x: 120, y: 205 },
      { id: 'p2', x: 120, y: 65 },
      { id: 'p3', x: 285, y: 245 },
      { id: 'p4', x: 385, y: 245 },
      { id: 'p5', x: 335, y: 440 },
      { id: 'p6', x: 535, y: 245 },
      { id: 'p7', x: 575, y: 65 },
      { id: 'p8', x: 615, y: 345 },
      { id: 'p9', x: 770, y: 185 },
      { id: 'p10', x: 770, y: 340 }
    ]
  },
  {
    id: 'lvl_17',
    levelNumber: 17,
    zoneId: 6,
    levelInZone: 2,
    theme: 'musa_swamp',
    title: '17. Spanguolių kupstų kilpa',
    badge: '6 Zona • 14 bangų • Pelkės sankirta',
    subtitle: 'Du samanoti takai susikerta pelkės centre prie spanguolynų – idealu Katapultai ir Lazeriui.',
    baseCoins: 390,
    maxWaves: 14,
    bgTop: '#0d2b26',
    bgBottom: '#061513',
    pathColor: '#7c5332',
    pathBorder: '#3b2412',
    accentColor: '#2dd4bf',
    campaignPos: { x: 18, y: 54 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 115 },
        { x: 250, y: 115 },
        { x: 390, y: 250 },
        { x: 620, y: 250 },
        { x: 730, y: 175 },
        { x: 848, y: 175 }
      ],
      [
        { x: 24, y: 385 },
        { x: 250, y: 385 },
        { x: 390, y: 250 },
        { x: 620, y: 250 },
        { x: 730, y: 325 },
        { x: 848, y: 325 }
      ]
    ],
    pads: [
      { id: 'p1', x: 145, y: 190 },
      { id: 'p2', x: 145, y: 310 },
      { id: 'p3', x: 245, y: 250 },
      { id: 'p4', x: 345, y: 120 },
      { id: 'p5', x: 345, y: 380 },
      { id: 'p6', x: 495, y: 175 },
      { id: 'p7', x: 495, y: 325 },
      { id: 'p8', x: 605, y: 175 },
      { id: 'p9', x: 605, y: 325 },
      { id: 'p10', x: 765, y: 250 }
    ]
  },
  {
    id: 'lvl_18',
    levelNumber: 18,
    zoneId: 6,
    levelInZone: 3,
    theme: 'musa_swamp',
    title: '18. Ežerėlių lieptai',
    badge: '6 Zona • 15 bangų • Du takai',
    subtitle: 'Tarp tamsių pelkės ežerėlių vingiuoja du lentų takai. Saugokis nematomų bangų!',
    baseCoins: 400,
    maxWaves: 15,
    bgTop: '#0d2b26',
    bgBottom: '#061513',
    pathColor: '#7c5332',
    pathBorder: '#3b2412',
    accentColor: '#2dd4bf',
    campaignPos: { x: 26, y: 35 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 105 },
        { x: 235, y: 105 },
        { x: 335, y: 195 },
        { x: 585, y: 195 },
        { x: 685, y: 115 },
        { x: 848, y: 115 }
      ],
      [
        { x: 24, y: 395 },
        { x: 235, y: 395 },
        { x: 335, y: 305 },
        { x: 585, y: 305 },
        { x: 685, y: 385 },
        { x: 848, y: 385 }
      ]
    ],
    pads: [
      { id: 'p1', x: 135, y: 180 },
      { id: 'p2', x: 135, y: 320 },
      { id: 'p3', x: 245, y: 250 },
      { id: 'p4', x: 460, y: 120 },
      { id: 'p5', x: 460, y: 250 },
      { id: 'p6', x: 460, y: 380 },
      { id: 'p7', x: 560, y: 120 },
      { id: 'p8', x: 560, y: 380 },
      { id: 'p9', x: 745, y: 205 },
      { id: 'p10', x: 745, y: 295 }
    ]
  },
  {
    id: 'lvl_19',
    levelNumber: 19,
    zoneId: 6,
    levelInZone: 4,
    theme: 'musa_swamp',
    title: '19. Rūko labirintas',
    badge: '6 Zona • 15 bangų • Kryžminiai takai',
    subtitle: 'Tirštame rūke susikertantys takai reikalauja greito gydytojų naikinimo su prioritetu „Stipriausias“.',
    baseCoins: 410,
    maxWaves: 15,
    bgTop: '#0d2b26',
    bgBottom: '#061513',
    pathColor: '#7c5332',
    pathBorder: '#3b2412',
    accentColor: '#2dd4bf',
    campaignPos: { x: 34, y: 58 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 145 },
        { x: 225, y: 145 },
        { x: 345, y: 355 },
        { x: 565, y: 355 },
        { x: 685, y: 155 },
        { x: 848, y: 155 }
      ],
      [
        { x: 24, y: 355 },
        { x: 225, y: 355 },
        { x: 345, y: 145 },
        { x: 565, y: 145 },
        { x: 685, y: 345 },
        { x: 848, y: 345 }
      ]
    ],
    pads: [
      { id: 'p1', x: 130, y: 250 },
      { id: 'p2', x: 215, y: 250 },
      { id: 'p3', x: 455, y: 250 },
      { id: 'p4', x: 345, y: 75 },
      { id: 'p5', x: 345, y: 425 },
      { id: 'p6', x: 535, y: 75 },
      { id: 'p7', x: 535, y: 425 },
      { id: 'p8', x: 685, y: 250 },
      { id: 'p9', x: 765, y: 90 },
      { id: 'p10', x: 765, y: 250 },
      { id: 'p11', x: 765, y: 415 }
    ]
  },
  {
    id: 'lvl_20',
    levelNumber: 20,
    zoneId: 6,
    levelInZone: 5,
    isBossLevel: true,
    theme: 'musa_swamp',
    title: '20. Mūšos tyrelio širdis (Bosas)',
    badge: '6 Zona • 16 bangų • 👑 Pelkių Valdovas',
    subtitle: 'Šakoti pelkės takai suveda priešus į centrą. 16-oje bangoje – Pelkių Valdovas!',
    baseCoins: 430,
    maxWaves: 16,
    bgTop: '#0d2b26',
    bgBottom: '#061513',
    pathColor: '#7c5332',
    pathBorder: '#3b2412',
    accentColor: '#2dd4bf',
    campaignPos: { x: 42, y: 40 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 105 },
        { x: 205, y: 105 },
        { x: 325, y: 250 },
        { x: 575, y: 250 },
        { x: 705, y: 150 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 395 },
        { x: 205, y: 395 },
        { x: 325, y: 250 },
        { x: 575, y: 250 },
        { x: 705, y: 350 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 130, y: 190 },
      { id: 'p2', x: 130, y: 310 },
      { id: 'p3', x: 245, y: 250 },
      { id: 'p4', x: 385, y: 165 },
      { id: 'p5', x: 385, y: 335 },
      { id: 'p6', x: 495, y: 165 },
      { id: 'p7', x: 495, y: 335 },
      { id: 'p8', x: 605, y: 150 },
      { id: 'p9', x: 605, y: 350 },
      { id: 'p10', x: 715, y: 250 },
      { id: 'p11', x: 450, y: 80 }
    ]
  },

  // ==================== 7 ZONA: KARPĖNŲ KLINČIŲ KARJERAS (21–25 LYGIAI) ====================
  {
    id: 'lvl_21',
    levelNumber: 21,
    zoneId: 7,
    levelInZone: 1,
    theme: 'karpenai_quarry',
    title: '21. Baltojo klinčių kanjono vartai',
    badge: '7 Zona • 15 bangų • Serpantinas',
    subtitle: 'Ilgas uolų terasos serpantinas. Derink Saulės Lazerį prieš šarvus ir Katapultą prieš Veidrodinius Kristalus!',
    baseCoins: 420,
    maxWaves: 15,
    bgTop: '#243b55',
    bgBottom: '#141e30',
    pathColor: '#cbd5e1',
    pathBorder: '#64748b',
    accentColor: '#38bdf8',
    campaignPos: { x: 50, y: 68 },
    fortress: { x: 848, y: 395 },
    paths: [
      [
        { x: 24, y: 110 },
        { x: 700, y: 110 },
        { x: 700, y: 250 },
        { x: 160, y: 250 },
        { x: 160, y: 395 },
        { x: 848, y: 395 }
      ]
    ],
    pads: [
      { id: 'p1', x: 250, y: 180 },
      { id: 'p2', x: 400, y: 180 },
      { id: 'p3', x: 550, y: 180 },
      { id: 'p4', x: 825, y: 180 },
      { id: 'p5', x: 250, y: 322 },
      { id: 'p6', x: 400, y: 322 },
      { id: 'p7', x: 550, y: 322 },
      { id: 'p8', x: 785, y: 315 },
      { id: 'p9', x: 400, y: 452 },
      { id: 'p10', x: 360, y: 52 }
    ]
  },
  {
    id: 'lvl_22',
    levelNumber: 22,
    zoneId: 7,
    levelInZone: 2,
    theme: 'karpenai_quarry',
    title: '22. Žydrosios lagūnos terasos',
    badge: '7 Zona • 15 bangų • Dvi terasos',
    subtitle: 'Šarvuotų Vabalų ir Veidrodžių kolonos kartu su Kibernetiniais Varnais – būtini Dronai ir Lazeris!',
    baseCoins: 430,
    maxWaves: 15,
    bgTop: '#243b55',
    bgBottom: '#141e30',
    pathColor: '#cbd5e1',
    pathBorder: '#64748b',
    accentColor: '#38bdf8',
    campaignPos: { x: 56, y: 45 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 115 },
        { x: 290, y: 115 },
        { x: 445, y: 195 },
        { x: 655, y: 195 },
        { x: 765, y: 120 },
        { x: 848, y: 120 }
      ],
      [
        { x: 24, y: 385 },
        { x: 290, y: 385 },
        { x: 445, y: 305 },
        { x: 655, y: 305 },
        { x: 765, y: 380 },
        { x: 848, y: 380 }
      ]
    ],
    pads: [
      { id: 'p1', x: 145, y: 190 },
      { id: 'p2', x: 145, y: 310 },
      { id: 'p3', x: 280, y: 250 },
      { id: 'p4', x: 445, y: 110 },
      { id: 'p5', x: 445, y: 390 },
      { id: 'p6', x: 555, y: 110 },
      { id: 'p7', x: 555, y: 250 },
      { id: 'p8', x: 555, y: 390 },
      { id: 'p9', x: 675, y: 110 },
      { id: 'p10', x: 675, y: 390 },
      { id: 'p11', x: 765, y: 250 }
    ]
  },
  {
    id: 'lvl_23',
    levelNumber: 23,
    zoneId: 7,
    levelInZone: 3,
    theme: 'karpenai_quarry',
    title: '23. Ekskavatorių šlaitai',
    badge: '7 Zona • 16 bangų • Kanjonų X',
    subtitle: 'Dvigubos kanjono kryžkelės leidžia vienu metu dengti abu kelius iš vidurinių aikštelių.',
    baseCoins: 440,
    maxWaves: 16,
    bgTop: '#243b55',
    bgBottom: '#141e30',
    pathColor: '#cbd5e1',
    pathBorder: '#64748b',
    accentColor: '#38bdf8',
    campaignPos: { x: 62, y: 70 },
    fortress: { x: 848, y: 245 },
    paths: [
      [
        { x: 24, y: 120 },
        { x: 210, y: 120 },
        { x: 320, y: 340 },
        { x: 590, y: 145 },
        { x: 725, y: 340 },
        { x: 848, y: 340 }
      ],
      [
        { x: 24, y: 365 },
        { x: 210, y: 365 },
        { x: 320, y: 145 },
        { x: 590, y: 340 },
        { x: 725, y: 145 },
        { x: 848, y: 145 }
      ]
    ],
    pads: [
      { id: 'p1', x: 120, y: 242 },
      { id: 'p2', x: 205, y: 242 },
      { id: 'p3', x: 325, y: 65 },
      { id: 'p4', x: 325, y: 425 },
      { id: 'p5', x: 455, y: 145 },
      { id: 'p6', x: 455, y: 340 },
      { id: 'p7', x: 590, y: 65 },
      { id: 'p8', x: 590, y: 425 },
      { id: 'p9', x: 785, y: 242 },
      { id: 'p10', x: 590, y: 242 },
      { id: 'p11', x: 455, y: 430 }
    ]
  },
  {
    id: 'lvl_24',
    levelNumber: 24,
    zoneId: 7,
    levelInZone: 4,
    theme: 'karpenai_quarry',
    title: '24. Karjero krioklių slėnis',
    badge: '7 Zona • 16 bangų • Posūkių slėnis',
    subtitle: 'Kiekvienas posūkis apsuptas baltų uolų – sustatyk Saulės Stoties auras šalia pagrindinės gynybos!',
    baseCoins: 455,
    maxWaves: 16,
    bgTop: '#243b55',
    bgBottom: '#141e30',
    pathColor: '#cbd5e1',
    pathBorder: '#64748b',
    accentColor: '#38bdf8',
    campaignPos: { x: 68, y: 42 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 105 },
        { x: 250, y: 105 },
        { x: 350, y: 245 },
        { x: 550, y: 115 },
        { x: 725, y: 245 },
        { x: 848, y: 145 }
      ],
      [
        { x: 24, y: 395 },
        { x: 250, y: 395 },
        { x: 350, y: 255 },
        { x: 550, y: 385 },
        { x: 725, y: 255 },
        { x: 848, y: 355 }
      ]
    ],
    pads: [
      { id: 'p1', x: 140, y: 250 },
      { id: 'p2', x: 245, y: 250 },
      { id: 'p3', x: 445, y: 95 },
      { id: 'p4', x: 445, y: 250 },
      { id: 'p5', x: 445, y: 405 },
      { id: 'p6', x: 560, y: 250 },
      { id: 'p7', x: 650, y: 100 },
      { id: 'p8', x: 650, y: 400 },
      { id: 'p9', x: 770, y: 105 },
      { id: 'p10', x: 770, y: 395 },
      { id: 'p11', x: 140, y: 175 }
    ]
  },
  {
    id: 'lvl_25',
    levelNumber: 25,
    zoneId: 7,
    levelInZone: 5,
    isBossLevel: true,
    theme: 'karpenai_quarry',
    title: '25. Klinčių kanjono viršūnė (Bosas)',
    badge: '7 Zona • 17 bangų • 👑 Klinčių Kolosas',
    subtitle: '17-oje bangoje žengia Klinčių Kolosas, kas 8 sek. keičiantis skydą tarp šarvų ir veidrodžio!',
    baseCoins: 470,
    maxWaves: 17,
    bgTop: '#243b55',
    bgBottom: '#141e30',
    pathColor: '#cbd5e1',
    pathBorder: '#64748b',
    accentColor: '#38bdf8',
    campaignPos: { x: 74, y: 64 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 100 },
        { x: 245, y: 100 },
        { x: 325, y: 220 },
        { x: 505, y: 120 },
        { x: 635, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 400 },
        { x: 245, y: 400 },
        { x: 325, y: 280 },
        { x: 505, y: 380 },
        { x: 635, y: 250 },
        { x: 848, y: 250 }
      ]
    ],
    pads: [
      { id: 'p1', x: 135, y: 190 },
      { id: 'p2', x: 135, y: 310 },
      { id: 'p3', x: 240, y: 250 },
      { id: 'p4', x: 425, y: 250 },
      { id: 'p5', x: 515, y: 250 },
      { id: 'p6', x: 410, y: 95 },
      { id: 'p7', x: 410, y: 405 },
      { id: 'p8', x: 615, y: 155 },
      { id: 'p9', x: 615, y: 345 },
      { id: 'p10', x: 740, y: 175 },
      { id: 'p11', x: 740, y: 325 },
      { id: 'p12', x: 740, y: 85 }
    ]
  },

  // ==================== 8 ZONA: KOSMINĖ SAULĖS JĖGAINĖ (26–30 LYGIAI) ====================
  {
    id: 'lvl_26',
    levelNumber: 26,
    zoneId: 8,
    levelInZone: 1,
    theme: 'cosmic_solar_plant',
    title: '26. Orbitinis energijos tiltas',
    badge: '8 Zona • 16 bangų • Energijos tiltai',
    subtitle: 'Kosminės Saulės Jėgainės prieigos su 12 priešų rūšių atakomis per du energijos tiltus!',
    baseCoins: 460,
    maxWaves: 16,
    bgTop: '#191339',
    bgBottom: '#070617',
    pathColor: '#3b336b',
    pathBorder: '#7c3aed',
    accentColor: '#a855f7',
    campaignPos: { x: 80, y: 36 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 110 },
        { x: 215, y: 110 },
        { x: 345, y: 185 },
        { x: 605, y: 185 },
        { x: 725, y: 145 },
        { x: 848, y: 145 }
      ],
      [
        { x: 24, y: 390 },
        { x: 215, y: 390 },
        { x: 345, y: 315 },
        { x: 605, y: 315 },
        { x: 725, y: 355 },
        { x: 848, y: 355 }
      ]
    ],
    pads: [
      { id: 'p1', x: 120, y: 190 },
      { id: 'p2', x: 120, y: 310 },
      { id: 'p3', x: 235, y: 250 },
      { id: 'p4', x: 350, y: 95 },
      { id: 'p5', x: 350, y: 405 },
      { id: 'p6', x: 465, y: 105 },
      { id: 'p7', x: 465, y: 250 },
      { id: 'p8', x: 465, y: 395 },
      { id: 'p9', x: 590, y: 105 },
      { id: 'p10', x: 590, y: 395 },
      { id: 'p11', x: 605, y: 250 },
      { id: 'p12', x: 755, y: 250 }
    ]
  },
  {
    id: 'lvl_27',
    levelNumber: 27,
    zoneId: 8,
    levelInZone: 2,
    theme: 'cosmic_solar_plant',
    title: '27. Kolektorių matrica',
    badge: '8 Zona • 17 bangų • Kryžminiai tiltai',
    subtitle: 'Spindulių kryžkelės tarp milžiniškų saulės baterijų! Naudok 4-o lygio evoliucijas abiem kryptims.',
    baseCoins: 480,
    maxWaves: 17,
    bgTop: '#191339',
    bgBottom: '#070617',
    pathColor: '#3b336b',
    pathBorder: '#7c3aed',
    accentColor: '#a855f7',
    campaignPos: { x: 84, y: 68 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 110 },
        { x: 205, y: 110 },
        { x: 315, y: 365 },
        { x: 555, y: 135 },
        { x: 715, y: 365 },
        { x: 848, y: 365 }
      ],
      [
        { x: 24, y: 385 },
        { x: 205, y: 385 },
        { x: 315, y: 135 },
        { x: 555, y: 365 },
        { x: 715, y: 135 },
        { x: 848, y: 135 }
      ]
    ],
    pads: [
      { id: 'p1', x: 120, y: 250 },
      { id: 'p2', x: 205, y: 250 },
      { id: 'p3', x: 325, y: 65 },
      { id: 'p4', x: 325, y: 435 },
      { id: 'p5', x: 435, y: 140 },
      { id: 'p6', x: 435, y: 360 },
      { id: 'p7', x: 555, y: 65 },
      { id: 'p8', x: 555, y: 435 },
      { id: 'p9', x: 555, y: 250 },
      { id: 'p10', x: 765, y: 250 },
      { id: 'p11', x: 120, y: 175 },
      { id: 'p12', x: 765, y: 65 }
    ]
  },
  {
    id: 'lvl_28',
    levelNumber: 28,
    zoneId: 8,
    levelInZone: 3,
    theme: 'cosmic_solar_plant',
    title: '28. Trys energijos magistralės',
    badge: '8 Zona • 18 bangų • 3 keliai',
    subtitle: 'Pirmą kartą vienu metu veikia 3 atskiri keliai! „Dagilėlio“ greičio aura tarp juostų – raktas į pergalę.',
    baseCoins: 500,
    maxWaves: 18,
    bgTop: '#191339',
    bgBottom: '#070617',
    pathColor: '#3b336b',
    pathBorder: '#7c3aed',
    accentColor: '#a855f7',
    campaignPos: { x: 88, y: 42 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 85 },
        { x: 290, y: 85 },
        { x: 455, y: 115 },
        { x: 655, y: 85 },
        { x: 848, y: 145 }
      ],
      [
        { x: 24, y: 250 },
        { x: 290, y: 250 },
        { x: 455, y: 250 },
        { x: 655, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 415 },
        { x: 290, y: 415 },
        { x: 455, y: 385 },
        { x: 655, y: 415 },
        { x: 848, y: 355 }
      ]
    ],
    pads: [
      { id: 'p1', x: 120, y: 170 },
      { id: 'p2', x: 245, y: 170 },
      { id: 'p3', x: 375, y: 180 },
      { id: 'p4', x: 535, y: 178 },
      { id: 'p5', x: 665, y: 170 },
      { id: 'p6', x: 775, y: 190 },
      { id: 'p7', x: 120, y: 330 },
      { id: 'p8', x: 245, y: 330 },
      { id: 'p9', x: 375, y: 320 },
      { id: 'p10', x: 535, y: 322 },
      { id: 'p11', x: 665, y: 330 },
      { id: 'p12', x: 775, y: 312 }
    ]
  },
  {
    id: 'lvl_29',
    levelNumber: 29,
    zoneId: 8,
    levelInZone: 4,
    theme: 'cosmic_solar_plant',
    title: '29. Plazmos reaktoriaus žiedas',
    badge: '8 Zona • 19 bangų • 3 keliai',
    subtitle: '19 intensyvių bangų per 3 kosminius kelius – paruošk Saulės Stotis, Dronus ir Katapultas prieš finalą!',
    baseCoins: 520,
    maxWaves: 19,
    bgTop: '#191339',
    bgBottom: '#070617',
    pathColor: '#3b336b',
    pathBorder: '#7c3aed',
    accentColor: '#a855f7',
    campaignPos: { x: 92, y: 70 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 90 },
        { x: 245, y: 90 },
        { x: 380, y: 150 },
        { x: 610, y: 90 },
        { x: 755, y: 155 },
        { x: 848, y: 155 }
      ],
      [
        { x: 24, y: 250 },
        { x: 310, y: 250 },
        { x: 460, y: 250 },
        { x: 650, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 410 },
        { x: 245, y: 410 },
        { x: 380, y: 350 },
        { x: 610, y: 410 },
        { x: 755, y: 345 },
        { x: 848, y: 345 }
      ]
    ],
    pads: [
      { id: 'p1', x: 130, y: 170 },
      { id: 'p2', x: 130, y: 330 },
      { id: 'p3', x: 245, y: 170 },
      { id: 'p4', x: 245, y: 330 },
      { id: 'p5', x: 375, y: 75 },
      { id: 'p6', x: 375, y: 425 },
      { id: 'p7', x: 495, y: 180 },
      { id: 'p8', x: 495, y: 320 },
      { id: 'p9', x: 635, y: 172 },
      { id: 'p10', x: 635, y: 328 },
      { id: 'p11', x: 755, y: 75 },
      { id: 'p12', x: 755, y: 425 }
    ]
  },
  {
    id: 'lvl_30',
    levelNumber: 30,
    zoneId: 8,
    levelInZone: 5,
    isBossLevel: true,
    dualBoss: true,
    theme: 'cosmic_solar_plant',
    title: '30. Kosminės Jėgainės Finalas (Dvigubas Bosas)',
    badge: '8 Zona • 20 bangų • 👑👑 Dvigubas Bosas',
    subtitle: 'Didysis finalas! 20-oje bangoje 1-u keliu žengia Geležinis Mega-Titanas, o 2-u – Šešėlių Architektas!',
    baseCoins: 560,
    maxWaves: 20,
    bgTop: '#191339',
    bgBottom: '#070617',
    pathColor: '#3b336b',
    pathBorder: '#7c3aed',
    accentColor: '#a855f7',
    campaignPos: { x: 96, y: 26 },
    fortress: { x: 848, y: 250 },
    paths: [
      [
        { x: 24, y: 95 },
        { x: 250, y: 95 },
        { x: 395, y: 155 },
        { x: 620, y: 95 },
        { x: 765, y: 165 },
        { x: 848, y: 240 }
      ],
      [
        { x: 24, y: 250 },
        { x: 225, y: 250 },
        { x: 455, y: 250 },
        { x: 675, y: 250 },
        { x: 848, y: 250 }
      ],
      [
        { x: 24, y: 405 },
        { x: 250, y: 405 },
        { x: 395, y: 345 },
        { x: 620, y: 405 },
        { x: 765, y: 335 },
        { x: 848, y: 260 }
      ]
    ],
    pads: [
      { id: 'p1', x: 125, y: 172 },
      { id: 'p2', x: 125, y: 328 },
      { id: 'p3', x: 245, y: 172 },
      { id: 'p4', x: 245, y: 328 },
      { id: 'p5', x: 390, y: 72 },
      { id: 'p6', x: 390, y: 428 },
      { id: 'p7', x: 505, y: 180 },
      { id: 'p8', x: 505, y: 320 },
      { id: 'p9', x: 635, y: 175 },
      { id: 'p10', x: 635, y: 325 },
      { id: 'p11', x: 755, y: 75 },
      { id: 'p12', x: 755, y: 425 },
      { id: 'p13', x: 505, y: 68 }
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
  } else if (theme === 'musa_swamp') {
    ctx.fillStyle = 'rgba(20, 184, 166, 0.16)';
    ctx.beginPath();
    ctx.ellipse(260, 260, 120, 68, 0, 0, Math.PI * 2);
    ctx.ellipse(620, 240, 110, 62, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'karpenai_quarry') {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.24)';
    ctx.beginPath();
    ctx.ellipse(460, 250, 130, 74, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'cosmic_solar_plant') {
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.22)';
    ctx.lineWidth = 1.6;
    for (let gx = 45; gx < 860; gx += 135) {
      for (let gy = 30; gy < 460; gy += 110) {
        ctx.strokeRect(gx, gy, 118, 92);
      }
    }
  }

  ctx.restore();
}
