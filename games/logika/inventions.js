// ==================== „IŠRADIMŲ LENTYNA“ (KOLEKCIJOS SISTEMA: SIDABRAS >= 5 LYGIŲ, AUKSAS = 10 LYGIŲ) ====================

export const INVENTIONS_CATALOG = [
  {
    zoneMode: 'pinpull',
    zoneName: '1. Kaiščių bokštas',
    zoneIcon: '🔩',
    silver: {
      id: 'inv_pinpull_silver',
      tier: 'silver',
      icon: '🧯',
      name: 'Hidro-sklendės valdiklis',
      desc: 'Sustabdo ir atvėsina net karščiausią ugnikalnio lavą per vieną sekundę!',
      sound: 'pin'
    },
    gold: {
      id: 'inv_pinpull_gold',
      tier: 'gold',
      icon: '⛲',
      name: 'Slėgio fontanas',
      desc: 'Tobulas hidraulinis bokštas, nukreipiantis spalvotą energiją be nė vieno lašo nuostolio!',
      sound: 'victory'
    }
  },
  {
    zoneMode: 'sokoban',
    zoneName: '2. Robo sandėlis',
    zoneIcon: '🤖',
    silver: {
      id: 'inv_sokoban_silver',
      tier: 'silver',
      icon: '🦾',
      name: 'Magnetinis stumtuvas',
      desc: 'Suteikia robotukui jėgos pastumti sunkiausius energijos kubus per slidų ledą!',
      sound: 'cube'
    },
    gold: {
      id: 'inv_sokoban_gold',
      tier: 'gold',
      icon: '🛸',
      name: 'Antigravitacinis krautuvas',
      desc: 'Legendinis sandėlio pagalbininkas – perkelia krovinius pro vienkrypčius vartus kaip plunksneles!',
      sound: 'portal'
    }
  },
  {
    zoneMode: 'laser',
    zoneName: '3. Lazerių salė',
    zoneIcon: '🔦',
    silver: {
      id: 'inv_laser_silver',
      tier: 'silver',
      icon: '🪞',
      name: 'Krištolo prizmė',
      desc: 'Padalina vieną šviesos spindulį į du ryškius lazerius be jokio pritemimo!',
      sound: 'laser'
    },
    gold: {
      id: 'inv_laser_gold',
      tier: 'gold',
      icon: '🛡️',
      name: 'Lazerinis skydas',
      desc: 'Galingiausias laboratorijos šarvas – atspindi bet kokį spindulį tiksliu 90° kampu!',
      sound: 'laser'
    }
  },
  {
    zoneMode: 'circuit',
    zoneName: '4. Grandinių dirbtuvės',
    zoneIcon: '🚂',
    silver: {
      id: 'inv_circuit_silver',
      tier: 'silver',
      icon: '🔌',
      name: 'Turbo sujungiklis',
      desc: 'Suveda visus nutrūkusius bėgius ir laidus per stebuklingą tiltą akimirksniu!',
      sound: 'train'
    },
    gold: {
      id: 'inv_circuit_gold',
      tier: 'gold',
      icon: '🚄',
      name: 'Hiper-ekspreso relė',
      desc: 'Auksinė geležinkelio širdis – traukinukas niekada nepasiklysta net sudėtingiausiuose mazguose!',
      sound: 'train'
    }
  },
  {
    zoneMode: 'balance',
    zoneName: '5. Kosminės svarstyklės',
    zoneIcon: '⚖️',
    silver: {
      id: 'inv_balance_silver',
      tier: 'silver',
      icon: '🪨',
      name: 'Tikslumo etalonas',
      desc: 'Net ir mažiausią kosminį akmenėlį pasveria iki gramų tikslumu!',
      sound: 'bell'
    },
    gold: {
      id: 'inv_balance_gold',
      tier: 'gold',
      icon: '🪐',
      name: 'Planetų svėriklis',
      desc: 'Auksinės kosminės svarstyklės, galinčios išlaikyti net visų žvaigždžių pusiausvyrą!',
      sound: 'bell'
    }
  },
  {
    zoneMode: 'matrix',
    zoneName: '6. IQ šifrų kompiuteris',
    zoneIcon: '🧩',
    silver: {
      id: 'inv_matrix_silver',
      tier: 'silver',
      icon: '🔐',
      name: 'Šifrų dekoderis',
      desc: 'Atpažįsta paslėptas geometrines taisykles ir įsimena spalvotus kodus!',
      sound: 'memory'
    },
    gold: {
      id: 'inv_matrix_gold',
      tier: 'gold',
      icon: '🧠',
      name: 'Kvantinis superkompiuteris',
      desc: 'Švytintis proto kristalas, akimirksniu išnarpliojantis sudėtingiausias IQ matricas!',
      sound: 'hint'
    }
  },
  {
    zoneMode: 'algo',
    zoneName: '7. Algoritmų trasa',
    zoneIcon: '🧑‍💻',
    silver: {
      id: 'inv_algo_silver',
      tier: 'silver',
      icon: '📟',
      name: 'Ciklų procesorius',
      desc: 'Priverčia robotą kartoti komandas ir sutaupo pusę programos kodo!',
      sound: 'jump'
    },
    gold: {
      id: 'inv_algo_gold',
      tier: 'gold',
      icon: '🛰️',
      name: 'Autonominis pilotas',
      desc: 'Išmanusis kosminis lustas, vedantis robotą per raktus, spynas ir teleporterius!',
      sound: 'victory'
    }
  },
  {
    zoneMode: 'gears',
    zoneName: '8. Krumpliaračių variklis',
    zoneIcon: '⚙️',
    silver: {
      id: 'inv_gears_silver',
      tier: 'silver',
      icon: '⛓️',
      name: 'Titaninis diržas',
      desc: 'Sujungia net tolimiausius krumpliaračius ir išlaiko sinchronišką jų sukimąsi!',
      sound: 'gear'
    },
    gold: {
      id: 'inv_gears_gold',
      tier: 'gold',
      icon: '♾️',
      name: 'Amžinasis variklis',
      desc: 'Sukasi be galo ir be sustojimo – tikrasis mechanikos stebuklas, maitinantis visą stotį!',
      sound: 'gear'
    }
  },
  {
    zoneMode: 'gravity',
    zoneName: '9. Gravitacijos labirintas',
    zoneIcon: '🧊',
    silver: {
      id: 'inv_gravity_silver',
      tier: 'silver',
      icon: '🧭',
      name: 'Ledo stabilizatorius',
      desc: 'Padeda rutuliukui tiksliai nučiuožti iki trapaus ledo ir teleportacijos platformos!',
      sound: 'slide'
    },
    gold: {
      id: 'inv_gravity_gold',
      tier: 'gold',
      icon: '🌀',
      name: 'Gravitacijos generatorius',
      desc: 'Valdo traukos jėgas ir atveria portalus tiesiai per ledines kliūtis!',
      sound: 'portal'
    }
  },
  {
    zoneMode: 'mathcross',
    zoneName: '10. Skaičių kryžiažodžiai',
    zoneIcon: '🔢',
    silver: {
      id: 'inv_mathcross_silver',
      tier: 'silver',
      icon: '📐',
      name: 'Magiškasis trikampis',
      desc: 'Visada suskaičiuoja tobulą kraštinių ir stulpelių sumą iš pirmo žvilgsnio!',
      sound: 'hint'
    },
    gold: {
      id: 'inv_mathcross_gold',
      tier: 'gold',
      icon: '🧮',
      name: 'Auksinis abakas',
      desc: 'Paverčia net painiausius kryžiažodžius ir kvadratus greitu žaidimu!',
      sound: 'bell'
    }
  },
  {
    zoneMode: 'bridges',
    zoneName: '11. Energijos tiltai',
    zoneIcon: '🌉',
    silver: {
      id: 'inv_bridges_silver',
      tier: 'silver',
      icon: '🗼',
      name: 'Plazmos pilonas',
      desc: 'Tvirtai sujungia kaimynines kosmines salas be jokio susikirtimo!',
      sound: 'bell'
    },
    gold: {
      id: 'inv_bridges_gold',
      tier: 'gold',
      icon: '🌌',
      name: 'Žvaigždžių tinklo šerdis',
      desc: 'Švytintis tiltas tarp visų galaktikos salų – nepraleidžia nė vienos jungties!',
      sound: 'portal'
    }
  },
  {
    zoneMode: 'mini',
    zoneName: '12. Kolbų laboratorija',
    zoneIcon: '🧪',
    silver: {
      id: 'inv_mini_silver',
      tier: 'silver',
      icon: '🫧',
      name: 'Spalvų sklendė',
      desc: 'Atskiria ir tiksliai išpilsto ryškiausius laboratorijos eliksyrus!',
      sound: 'memory'
    },
    gold: {
      id: 'inv_mini_gold',
      tier: 'gold',
      icon: '⚗️',
      name: 'Alchemiko kolba',
      desc: 'Legendinis auksinis indas – sukuria bet kokią spalvą ir tikslų tūrį iki paskutinio lašo!',
      sound: 'victory'
    }
  }
];

export function computeInventionsState(progress, getLevelsForModeFn, filter = 'combined') {
  const g1SolvedSet = new Set(progress?.grade1?.solvedLevels || []);
  const g3SolvedSet = new Set(progress?.grade3?.solvedLevels || []);

  let unlockedCount = 0;
  let silverUnlocked = 0;
  let goldUnlocked = 0;

  const zones = INVENTIONS_CATALOG.map((entry) => {
    const g1Levels = getLevelsForModeFn(entry.zoneMode, 'grade1') || [];
    const g3Levels = getLevelsForModeFn(entry.zoneMode, 'grade3') || [];
    const g1Solved = g1Levels.filter((lvl) => g1SolvedSet.has(lvl.id)).length;
    const g3Solved = g3Levels.filter((lvl) => g3SolvedSet.has(lvl.id)).length;

    const solvedCount =
      filter === 'grade1' ? g1Solved : filter === 'grade3' ? g3Solved : Math.max(g1Solved, g3Solved);

    const hasSilver = solvedCount >= 5;
    const hasGold = solvedCount >= 10;
    if (hasSilver) {
      unlockedCount++;
      silverUnlocked++;
    }
    if (hasGold) {
      unlockedCount++;
      goldUnlocked++;
    }

    return {
      ...entry,
      g1Solved,
      g3Solved,
      solvedCount,
      totalLevels: 10,
      hasSilver,
      hasGold
    };
  });

  return {
    zones,
    unlockedCount,
    totalCount: INVENTIONS_CATALOG.length * 2,
    silverUnlocked,
    goldUnlocked
  };
}
