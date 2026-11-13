// ==================== SMART HINT (UŽUOMINOS LEMPUTĖ) IR 3 KLASĖS PAR ĖJIMAI ====================
import { solveJugFirstMoveBfs, solvePipeFirstValveBfs } from './flasks.js?v=20261113l';

export const OPTIMAL_PAR_MOVES = {
  // 1. Ištrauk kaištį (Pin-Pull)
  pp_g3_1: 4,
  pp_g3_2: 3,
  pp_g3_3: 4,
  pp_g3_4: 4,
  pp_g3_5: 6,
  pp_g3_6: 5,
  pp_g3_7: 5,
  pp_g3_8: 5,
  pp_g3_9: 6,
  pp_g3_10: 6,

  // 2. Robo-Stumdukas (Sokoban)
  sok_g3_1: 16,
  sok_g3_2: 26,
  sok_g3_3: 18,
  sok_g3_4: 40,
  sok_g3_5: 26,
  sok_g3_6: 21,
  sok_g3_7: 23,
  sok_g3_8: 26,
  sok_g3_9: 30,
  sok_g3_10: 32,

  // 3. Lazerių veidrodžiai
  las_g3_1: 6,
  las_g3_2: 6,
  las_g3_3: 10,
  las_g3_4: 12,
  las_g3_5: 10,
  las_g3_6: 11,
  las_g3_7: 11,
  las_g3_8: 13,
  las_g3_9: 11,
  las_g3_10: 17,

  // 4. Sujunk grandinę
  cir_g3_1: 20,
  cir_g3_2: 18,
  cir_g3_3: 22,
  cir_g3_4: 25,
  cir_g3_5: 26,
  cir_g3_6: 26,
  cir_g3_7: 22,
  cir_g3_8: 31,
  cir_g3_9: 28,
  cir_g3_10: 36,

  // 5. Kosminės svarstyklės (svarsčių uždėjimai + Patikrinti)
  bal_g3_1: 3,
  bal_g3_2: 4,
  bal_g3_3: 3,
  bal_g3_4: 4,
  bal_g3_5: 4,
  bal_g3_6: 4,
  bal_g3_7: 4,
  bal_g3_8: 4,
  bal_g3_9: 5,
  bal_g3_10: 5,

  // 6. Raštų ir atminties šifras
  mat_g3_1: 1,
  mat_g3_2: 4,
  mat_g3_3: 1,
  mat_g3_4: 5,
  mat_g3_5: 1,
  mat_g3_6: 5,
  mat_g3_7: 1,
  mat_g3_8: 6,
  mat_g3_9: 1,
  mat_g3_10: 6,

  // 7. Algoritmų trasa
  alg_g3_1: 11,
  alg_g3_2: 11,
  alg_g3_3: 14,
  alg_g3_4: 13,
  alg_g3_5: 14,
  alg_g3_6: 12,
  alg_g3_7: 12,
  alg_g3_8: 12,
  alg_g3_9: 13,
  alg_g3_10: 14,

  // 8. Krumpliaračių variklis
  gea_g3_1: 4,
  gea_g3_2: 4,
  gea_g3_3: 4,
  gea_g3_4: 5,
  gea_g3_5: 4,
  gea_g3_6: 3,
  gea_g3_7: 4,
  gea_g3_8: 5,
  gea_g3_9: 4,
  gea_g3_10: 5,

  // 9. Gravitacijos labirintas
  grv_g3_1: 5,
  grv_g3_2: 5,
  grv_g3_3: 5,
  grv_g3_4: 4,
  grv_g3_5: 5,
  grv_g3_6: 5,
  grv_g3_7: 6,
  grv_g3_8: 5,
  grv_g3_9: 4,
  grv_g3_10: 7,

  // 10. Skaičių kryžiažodžiai ir magiškieji kvadratai
  mc_g3_1: 5,
  mc_g3_2: 5,
  mc_g3_3: 6,
  mc_g3_4: 5,
  mc_g3_5: 7,
  mc_g3_6: 5,
  mc_g3_7: 7,
  mc_g3_8: 5,
  mc_g3_9: 9,
  mc_g3_10: 9,

  // 11. Energijos tiltai (Hashi)
  br_g3_1: 15,
  br_g3_2: 20,
  br_g3_3: 20,
  br_g3_4: 20,
  br_g3_5: 22,
  br_g3_6: 28,
  br_g3_7: 25,
  br_g3_8: 30,
  br_g3_9: 32,
  br_g3_10: 36,

  // 12. Kolbų laboratorija
  flk_g3_1: 6,
  flk_g3_2: 8,
  flk_g3_3: 6,
  flk_g3_4: 8,
  flk_g3_5: 8,
  flk_g3_6: 10,
  flk_g3_7: 6,
  flk_g3_8: 6,
  flk_g3_9: 9,
  flk_g3_10: 14
};

export function getParMoves(levelId) {
  return OPTIMAL_PAR_MOVES[levelId] || null;
}

const PIN_PULL_ORDERS = {
  pp_g1_1: ['p2', 'p1'],
  pp_g1_2: ['p1', 'p2'],
  pp_g1_3: ['p1', 'p3', 'p2'],
  pp_g1_4: ['p4', 'p1', 'p2'],
  pp_g1_5: ['p1', 'p4', 'p3', 'p2'],
  pp_g1_6: ['p1', 'p2', 'p3'],
  pp_g1_7: ['p1', 'p3', 'p2'],
  pp_g1_8: ['p4', 'p1', 'p2'],
  pp_g1_9: ['p1', 'p2', 'p4', 'p3'],
  pp_g1_10: ['p1', 'p2', 'p4', 'p3'],
  pp_g3_1: ['p3', 'p2', 'p1', 'p4'],
  pp_g3_2: ['p1', 'p2', 'p3'],
  pp_g3_3: ['p2', 'p1', 'p4', 'p5'],
  pp_g3_4: ['p1', 'p2', 'p4', 'p5'],
  pp_g3_5: ['p4', 'p1', 'p2', 'p3', 'p6', 'p5'],
  pp_g3_6: ['p2', 'p1', 'p3', 'p5', 'p4'],
  pp_g3_7: ['p1', 'p2', 'p3', 'p5', 'p4'],
  pp_g3_8: ['p1', 'p2', 'p3', 'p5', 'p4'],
  pp_g3_9: ['p1', 'p3', 'p4', 'p2', 'p6', 'p5'],
  pp_g3_10: ['p1', 'p2', 'p3', 'p6', 'p4', 'p5']
};

const LASER_SOLUTIONS = {
  las_g1_1: [
    { id: 'm1', r: 2, c: 2, type: '/' },
    { id: 'm2', r: 0, c: 2, type: '/' }
  ],
  las_g1_2: [
    { id: 'm1', r: 1, c: 0, type: '\\' },
    { id: 'm2', r: 1, c: 4, type: '\\' },
    { id: 'm3', r: 4, c: 4, type: '/' }
  ],
  las_g1_3: [
    { id: 'm1', r: 4, c: 2, type: '/' },
    { id: 'm2', r: 2, c: 2, type: '/' },
    { id: 'm3', r: 2, c: 4, type: '/' },
    { id: 'm4', r: 0, c: 4, type: '\\' }
  ],
  las_g1_4: [
    { id: 'm1', r: 4, c: 4, type: '/' },
    { id: 'm2', r: 4, c: 0, type: '\\' },
    { id: 'm3', r: 0, c: 0, type: '/' },
    { id: 'm4', r: 0, c: 3, type: '\\' },
    { id: 'm5', r: 2, c: 3, type: '/' }
  ],
  las_g1_5: [
    { id: 'm1', r: 0, c: 4, type: '\\' },
    { id: 'm2', r: 4, c: 4, type: '/' },
    { id: 'm3', r: 4, c: 0, type: '\\' },
    { id: 'm4', r: 2, c: 0, type: '/' },
    { id: 'm5', r: 2, c: 1, type: '\\' },
    { id: 'm6', r: 3, c: 1, type: '\\' }
  ],
  las_g1_6: [
    { id: 'm1', r: 1, c: 2, type: '/' },
    { id: 'm2', r: 1, c: 0, type: '\\' },
    { id: 'm3', r: 0, c: 0, type: '/' },
    { id: 'm4', r: 0, c: 3, type: '\\' },
    { id: 'm5', r: 4, c: 3, type: '/' }
  ],
  las_g1_7: [
    { id: 'm1', r: 2, c: 0, type: '/' },
    { id: 'm2', r: 2, c: 1, type: '/' },
    { id: 'm3', r: 0, c: 1, type: '/' },
    { id: 'm4', r: 0, c: 3, type: '\\' },
    { id: 'm5', r: 1, c: 3, type: '\\' },
    { id: 'm6', r: 1, c: 4, type: '\\' }
  ],
  las_g1_8: [
    { id: 'm1', r: 1, c: 0, type: '\\' },
    { id: 'm2', r: 1, c: 2, type: '\\' },
    { id: 'm3', r: 3, c: 2, type: '/' },
    { id: 'm4', r: 3, c: 0, type: '/' },
    { id: 'm5', r: 5, c: 0, type: '\\' }
  ],
  las_g1_9: [
    { id: 's1', r: 3, c: 2, type: '\\' },
    { id: 'm1', r: 3, c: 3, type: '/' },
    { id: 'm2', r: 0, c: 3, type: '/' },
    { id: 'm3', r: 5, c: 2, type: '\\' },
    { id: 'm4', r: 5, c: 3, type: '/' },
    { id: 'm5', r: 4, c: 3, type: '/' }
  ],
  las_g1_10: [
    { id: 's1', r: 1, c: 3, type: '/' },
    { id: 'm1', r: 2, c: 3, type: '\\' },
    { id: 'm2', r: 2, c: 4, type: '\\' },
    { id: 'm3', r: 1, c: 1, type: '\\' },
    { id: 'm4', r: 0, c: 1, type: '\\' },
    { id: 'm5', r: 5, c: 4, type: '\\' }
  ],
  las_g3_1: [
    { id: 's1', r: 3, c: 2, type: '/' },
    { id: 'm1', r: 0, c: 2, type: '/' }
  ],
  las_g3_2: [
    { id: 'm1', r: 1, c: 1, type: '\\' },
    { id: 's1', r: 1, c: 5, type: '\\' }
  ],
  las_g3_3: [
    { id: 'm1', r: 5, c: 1, type: '/' },
    { id: 's1', r: 4, c: 1, type: '/' },
    { id: 'm2', r: 4, c: 4, type: '/' },
    { id: 'm3', r: 2, c: 4, type: '/' }
  ],
  las_g3_4: [
    { id: 'm1', r: 0, c: 3, type: '/' },
    { id: 's1', r: 1, c: 3, type: '\\' },
    { id: 'm2', r: 3, c: 3, type: '/' },
    { id: 'm3', r: 3, c: 0, type: '/' },
    { id: 'm4', r: 1, c: 6, type: '\\' }
  ],
  las_g3_5: [
    { id: 's1', r: 2, c: 3, type: '/' },
    { id: 'm1', r: 0, c: 3, type: '/' },
    { id: 'm2', r: 2, c: 4, type: '\\' },
    { id: 'm3', r: 5, c: 4, type: '\\' }
  ],
  las_g3_6: [
    { id: 'm1', r: 1, c: 2, type: '\\' },
    { id: 's1', r: 4, c: 2, type: '\\' },
    { id: 'm2', r: 5, c: 2, type: '\\' },
    { id: 'm3', r: 4, c: 4, type: '/' },
    { id: 'm4', r: 0, c: 4, type: '/' }
  ],
  las_g3_7: [
    { id: 's1', r: 0, c: 2, type: '\\' },
    { id: 's2', r: 3, c: 2, type: '\\' },
    { id: 'm1', r: 5, c: 2, type: '/' },
    { id: 'm2', r: 3, c: 6, type: '\\' },
    { id: 'm3', r: 5, c: 6, type: '\\' }
  ],
  las_g3_8: [
    { id: 'm1', r: 3, c: 0, type: '/' },
    { id: 's1', r: 3, c: 2, type: '/' },
    { id: 's2', r: 1, c: 2, type: '/' },
    { id: 'm2', r: 0, c: 2, type: '\\' },
    { id: 'm3', r: 1, c: 4, type: '/' },
    { id: 'm4', r: 0, c: 4, type: '/' },
    { id: 'm5', r: 3, c: 6, type: '\\' }
  ],
  las_g3_9: [
    { id: 'm1', r: 2, c: 5, type: '\\' },
    { id: 'm2', r: 0, c: 5, type: '\\' },
    { id: 's1', r: 0, c: 3, type: '/' },
    { id: 's2', r: 4, c: 3, type: '\\' },
    { id: 'm3', r: 5, c: 3, type: '/' }
  ],
  las_g3_10: [
    { id: 'm1', r: 2, c: 0, type: '\\' },
    { id: 's1', r: 2, c: 2, type: '\\' },
    { id: 's2', r: 4, c: 2, type: '/' },
    { id: 's3', r: 2, c: 5, type: '\\' },
    { id: 'm2', r: 5, c: 2, type: '/' },
    { id: 'm3', r: 4, c: 1, type: '\\' },
    { id: 'm4', r: 0, c: 1, type: '/' },
    { id: 'm5', r: 5, c: 5, type: '\\' }
  ]
};

const CIRCUIT_SOLUTIONS = {
  cir_g1_1: [
    { r: 0, c: 1, rots: [1, 3] },
    { r: 0, c: 2, rots: [2] },
    { r: 1, c: 2, rots: [0, 2] },
    { r: 2, c: 2, rots: [0] },
    { r: 2, c: 3, rots: [2] }
  ],
  cir_g1_2: [
    { r: 2, c: 0, rots: [0, 2] },
    { r: 1, c: 0, rots: [1] },
    { r: 1, c: 1, rots: [0, 3] },
    { r: 0, c: 1, rots: [1] },
    { r: 0, c: 2, rots: [1, 3] }
  ],
  cir_g1_3: [
    { r: 1, c: 0, rots: [0, 2] },
    { r: 2, c: 0, rots: [0] },
    { r: 2, c: 1, rots: [1, 3] },
    { r: 2, c: 2, rots: [3] },
    { r: 1, c: 2, rots: [1] },
    { r: 1, c: 3, rots: [2] },
    { r: 2, c: 3, rots: [0, 2] },
    { r: 3, c: 3, rots: [3] }
  ],
  cir_g1_4: [
    { r: 1, c: 1, rots: [3] },
    { r: 0, c: 1, rots: [1] },
    { r: 0, c: 2, rots: [2] },
    { r: 1, c: 2, rots: [0, 2] },
    { r: 2, c: 2, rots: [0, 2] },
    { r: 3, c: 2, rots: [0] },
    { r: 3, c: 3, rots: [3] },
    { r: 2, c: 3, rots: [0, 2] }
  ],
  cir_g1_5: [
    { r: 3, c: 2, rots: [1, 3] },
    { r: 3, c: 1, rots: [0] },
    { r: 2, c: 1, rots: [1] },
    { r: 2, c: 2, rots: [3] },
    { r: 1, c: 2, rots: [0, 2] },
    { r: 0, c: 2, rots: [2] },
    { r: 0, c: 1, rots: [1] },
    { r: 1, c: 1, rots: [3] },
    { r: 1, c: 0, rots: [0] }
  ],
  cir_g3_1: [
    { r: 2, c: 3, rots: [1, 3] },
    { r: 2, c: 4, rots: [3] },
    { r: 1, c: 4, rots: [0, 2] },
    { r: 0, c: 4, rots: [2] },
    { r: 0, c: 3, rots: [1, 3] },
    { r: 0, c: 2, rots: [1] },
    { r: 3, c: 2, rots: [3] },
    { r: 3, c: 1, rots: [1] },
    { r: 4, c: 1, rots: [0] },
    { r: 4, c: 3, rots: [1, 3] },
    { r: 4, c: 4, rots: [1, 3] }
  ],
  cir_g3_2: [
    { r: 1, c: 3, rots: [0, 2] },
    { r: 2, c: 3, rots: [0, 2] },
    { r: 4, c: 3, rots: [0] },
    { r: 4, c: 4, rots: [1, 3] },
    { r: 4, c: 5, rots: [3] },
    { r: 3, c: 4, rots: [1, 3] },
    { r: 3, c: 2, rots: [1, 3] },
    { r: 3, c: 1, rots: [1] },
    { r: 4, c: 1, rots: [0, 2] },
    { r: 5, c: 1, rots: [3] }
  ],
  cir_g3_3: [
    { r: 4, c: 1, rots: [0, 2] },
    { r: 3, c: 1, rots: [0, 2] },
    { r: 1, c: 1, rots: [1] },
    { r: 1, c: 2, rots: [1, 3] },
    { r: 1, c: 3, rots: [1, 3] },
    { r: 1, c: 4, rots: [2] },
    { r: 3, c: 4, rots: [0] },
    { r: 3, c: 5, rots: [3] },
    { r: 2, c: 5, rots: [2] },
    { r: 2, c: 2, rots: [1, 3] },
    { r: 2, c: 0, rots: [0] },
    { r: 1, c: 0, rots: [0, 2] }
  ],
  cir_g3_4: [
    { r: 0, c: 1, rots: [2] },
    { r: 1, c: 1, rots: [0] },
    { r: 1, c: 2, rots: [1, 3] },
    { r: 1, c: 4, rots: [2] },
    { r: 2, c: 4, rots: [0, 2] },
    { r: 3, c: 4, rots: [2, 3] },
    { r: 3, c: 3, rots: [0] },
    { r: 2, c: 3, rots: [0, 2] },
    { r: 0, c: 3, rots: [1] },
    { r: 0, c: 5, rots: [2] },
    { r: 1, c: 5, rots: [0, 2] },
    { r: 2, c: 5, rots: [0, 2] },
    { r: 3, c: 5, rots: [0, 2] },
    { r: 4, c: 5, rots: [3] }
  ],
  cir_g3_5: [
    { r: 3, c: 2, rots: [2] },
    { r: 5, c: 2, rots: [0] },
    { r: 5, c: 3, rots: [1, 3] },
    { r: 5, c: 4, rots: [3] },
    { r: 3, c: 4, rots: [0, 2] },
    { r: 2, c: 4, rots: [0, 2] },
    { r: 1, c: 4, rots: [2] },
    { r: 1, c: 3, rots: [0] },
    { r: 0, c: 3, rots: [2] },
    { r: 0, c: 1, rots: [1] },
    { r: 2, c: 1, rots: [0, 2] },
    { r: 4, c: 1, rots: [3] },
    { r: 4, c: 0, rots: [1] }
  ],
  cir_g1_6: [
    { r: 0, c: 1, rots: [1, 3] },
    { r: 0, c: 2, rots: [2] },
    { r: 2, c: 2, rots: [0] },
    { r: 2, c: 3, rots: [2] },
    { r: 3, c: 3, rots: [3] }
  ],
  cir_g1_7: [
    { r: 3, c: 0, rots: [0, 2] },
    { r: 2, c: 0, rots: [1] },
    { r: 2, c: 1, rots: [1, 3] },
    { r: 2, c: 2, rots: [3] },
    { r: 1, c: 2, rots: [1] },
    { r: 1, c: 3, rots: [1, 3] },
    { r: 1, c: 4, rots: [2] },
    { r: 2, c: 4, rots: [0, 2] },
    { r: 3, c: 4, rots: [3] },
    { r: 3, c: 3, rots: [1] },
    { r: 4, c: 3, rots: [0] }
  ],
  cir_g1_8: [
    { r: 2, c: 1, rots: [1, 3] },
    { r: 2, c: 3, rots: [3] },
    { r: 1, c: 3, rots: [2] },
    { r: 1, c: 2, rots: [1] },
    { r: 3, c: 2, rots: [0] },
    { r: 3, c: 3, rots: [1, 3] },
    { r: 3, c: 4, rots: [3] }
  ],
  cir_g1_9: [
    { r: 1, c: 2, rots: [0, 2] },
    { r: 2, c: 2, rots: [0, 2] },
    { r: 3, c: 2, rots: [0] },
    { r: 3, c: 4, rots: [3] },
    { r: 2, c: 4, rots: [2] },
    { r: 2, c: 3, rots: [0] },
    { r: 1, c: 3, rots: [1] },
    { r: 1, c: 4, rots: [3] }
  ],
  cir_g1_10: [
    { r: 4, c: 1, rots: [1, 3] },
    { r: 4, c: 2, rots: [3] },
    { r: 2, c: 2, rots: [1] },
    { r: 2, c: 3, rots: [2] },
    { r: 3, c: 3, rots: [3] },
    { r: 3, c: 1, rots: [0] },
    { r: 2, c: 1, rots: [0, 2] },
    { r: 1, c: 1, rots: [1] },
    { r: 1, c: 3, rots: [1, 3] },
    { r: 1, c: 4, rots: [2] },
    { r: 2, c: 4, rots: [0, 2] },
    { r: 3, c: 4, rots: [0, 2] }
  ],
  cir_g3_6: [
    { r: 1, c: 1, rots: [0, 2] },
    { r: 3, c: 1, rots: [0] },
    { r: 3, c: 2, rots: [1, 3] },
    { r: 3, c: 4, rots: [3] },
    { r: 2, c: 4, rots: [0, 2] },
    { r: 1, c: 4, rots: [2] },
    { r: 2, c: 3, rots: [0, 2] },
    { r: 4, c: 3, rots: [0, 2] },
    { r: 5, c: 3, rots: [3] },
    { r: 5, c: 2, rots: [1, 3] },
    { r: 5, c: 1, rots: [1, 3] },
    { r: 5, c: 0, rots: [0] },
    { r: 4, c: 0, rots: [0, 2] },
    { r: 3, c: 0, rots: [0, 2] },
    { r: 2, c: 0, rots: [1] }
  ],
  cir_g3_7: [
    { r: 2, c: 2, rots: [1, 2] },
    { r: 4, c: 2, rots: [0] },
    { r: 4, c: 3, rots: [1, 3] },
    { r: 4, c: 4, rots: [3] },
    { r: 3, c: 4, rots: [0, 2] },
    { r: 2, c: 4, rots: [2] },
    { r: 2, c: 3, rots: [1] },
    { r: 3, c: 3, rots: [3] },
    { r: 3, c: 1, rots: [0] },
    { r: 1, c: 1, rots: [0, 2] },
    { r: 0, c: 1, rots: [1] }
  ],
  cir_g3_8: [
    { r: 4, c: 5, rots: [0, 2] },
    { r: 3, c: 5, rots: [2] },
    { r: 3, c: 3, rots: [1] },
    { r: 4, c: 3, rots: [3] },
    { r: 4, c: 2, rots: [0] },
    { r: 3, c: 2, rots: [0, 2] },
    { r: 2, c: 2, rots: [1] },
    { r: 2, c: 4, rots: [2] },
    { r: 4, c: 4, rots: [0, 2] },
    { r: 5, c: 4, rots: [3] },
    { r: 5, c: 3, rots: [1, 3] },
    { r: 5, c: 2, rots: [1, 3] },
    { r: 5, c: 1, rots: [0] },
    { r: 4, c: 1, rots: [0, 2] },
    { r: 3, c: 1, rots: [0, 2] },
    { r: 2, c: 1, rots: [0, 2] },
    { r: 1, c: 1, rots: [1] },
    { r: 1, c: 2, rots: [1, 3] },
    { r: 1, c: 3, rots: [1, 3] },
    { r: 1, c: 4, rots: [3] }
  ],
  cir_g3_9: [
    { r: 1, c: 1, rots: [1, 3] },
    { r: 1, c: 3, rots: [1, 3] },
    { r: 1, c: 4, rots: [2] },
    { r: 2, c: 4, rots: [0] },
    { r: 2, c: 5, rots: [2] },
    { r: 3, c: 5, rots: [0, 2] },
    { r: 4, c: 5, rots: [3] },
    { r: 4, c: 4, rots: [0] },
    { r: 3, c: 4, rots: [2] },
    { r: 3, c: 2, rots: [1] },
    { r: 4, c: 2, rots: [0] },
    { r: 4, c: 3, rots: [3] },
    { r: 2, c: 3, rots: [2] },
    { r: 2, c: 2, rots: [0] },
    { r: 0, c: 2, rots: [2] }
  ],
  cir_g3_10: [
    { r: 1, c: 0, rots: [0, 2] },
    { r: 2, c: 0, rots: [0] },
    { r: 2, c: 2, rots: [2] },
    { r: 3, c: 2, rots: [0] },
    { r: 3, c: 4, rots: [1, 3] },
    { r: 3, c: 5, rots: [3] },
    { r: 2, c: 5, rots: [2] },
    { r: 1, c: 4, rots: [0, 2] },
    { r: 0, c: 4, rots: [2] },
    { r: 0, c: 3, rots: [1, 3] },
    { r: 0, c: 2, rots: [1] },
    { r: 1, c: 2, rots: [0] },
    { r: 1, c: 3, rots: [2] },
    { r: 2, c: 3, rots: [0, 2] },
    { r: 4, c: 3, rots: [0] },
    { r: 4, c: 4, rots: [2] },
    { r: 5, c: 4, rots: [3] },
    { r: 5, c: 3, rots: [1, 3] },
    { r: 5, c: 1, rots: [0] },
    { r: 4, c: 1, rots: [0, 2] },
    { r: 3, c: 1, rots: [0, 2] },
    { r: 1, c: 1, rots: [0, 2] }
  ]
};

const SOKOBAN_GATE_DIRS = {
  '>': { dr: 0, dc: 1 },
  '<': { dr: 0, dc: -1 },
  '^': { dr: -1, dc: 0 },
  'v': { dr: 1, dc: 0 }
};

function findFirstSokobanMoveBfs(sokGame) {
  if (!sokGame || sokGame.won) return null;
  const rows = sokGame.rows;
  const cols = sokGame.cols;
  const grid = sokGame.grid;
  const exit = sokGame.exit;
  const targetKeys = new Set(sokGame.targets.map((t) => `${t.r},${t.c}`));

  const isWalkable = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== '#';
  const allowsDir = (r, c, dr, dc) => {
    const g = SOKOBAN_GATE_DIRS[grid[r][c]];
    return !g || (g.dr === dr && g.dc === dc);
  };

  const encode = (rob, cubes) => {
    const sorted = cubes.map((c) => `${c.r},${c.c}`).sort().join(';');
    return `${rob.r},${rob.c}|${sorted}`;
  };

  const startState = {
    robot: { ...sokGame.robot },
    cubes: sokGame.cubes.map((c) => ({ ...c })),
    firstDir: null
  };

  const visited = new Set([encode(startState.robot, startState.cubes)]);
  const queue = [startState];
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];

  let expanded = 0;
  const MAX_STATES = 120000;
  let queueHead = 0;

  const isDeadCorner = (r, c) => {
    if (targetKeys.has(`${r},${c}`)) return false;
    const vBlocked = grid[r - 1]?.[c] === '#' || grid[r + 1]?.[c] === '#';
    const hBlocked = grid[r]?.[c - 1] === '#' || grid[r]?.[c + 1] === '#';
    return vBlocked && hBlocked;
  };

  while (queueHead < queue.length && expanded < MAX_STATES) {
    const cur = queue[queueHead++];
    expanded++;

    for (const d of dirs) {
      const nr = cur.robot.r + d.dr;
      const nc = cur.robot.c + d.dc;
      if (!isWalkable(nr, nc)) continue;
      if (!allowsDir(cur.robot.r, cur.robot.c, d.dr, d.dc)) continue;
      if (!allowsDir(nr, nc, d.dr, d.dc)) continue;

      const nextCubes = cur.cubes.map((c) => ({ ...c }));
      const hitIdx = nextCubes.findIndex((c) => c.r === nr && c.c === nc);

      if (hitIdx >= 0) {
        let cr = nr + d.dr;
        let cc = nc + d.dc;
        if (!isWalkable(cr, cc)) continue;
        if (!allowsDir(cr, cc, d.dr, d.dc)) continue;
        if (nextCubes.some((c) => c.r === cr && c.c === cc)) continue;

        while (grid[cr][cc] === 'I') {
          const sr = cr + d.dr;
          const sc = cc + d.dc;
          if (!isWalkable(sr, sc)) break;
          if (!allowsDir(sr, sc, d.dr, d.dc)) break;
          if (nextCubes.some((c) => c.r === sr && c.c === sc)) break;
          cr = sr;
          cc = sc;
        }
        if (isDeadCorner(cr, cc)) continue;
        nextCubes[hitIdx] = { r: cr, c: cc };
      }

      const firstDir = cur.firstDir || { dr: d.dr, dc: d.dc };
      const allCovered = nextCubes.every((c) => targetKeys.has(`${c.r},${c.c}`));
      if (allCovered && nr === exit.r && nc === exit.c) {
        return firstDir;
      }

      const key = encode({ r: nr, c: nc }, nextCubes);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ robot: { r: nr, c: nc }, cubes: nextCubes, firstDir });
      }
    }
  }

  return null;
}

export function computeFirstHint(mode, level, context = {}) {
  if (!level) return null;

  if (mode === 'pinpull') {
    const order = PIN_PULL_ORDERS[level.id] || [];
    const pins = context.pinEngine?.pins || [];
    const pinId = order.find((id) => {
      const p = pins.find((x) => x.id === id);
      return p && !p.removed && !p.pulling;
    });
    if (!pinId) return null;
    return {
      mode,
      kind: 'pin',
      pinId,
      message: '💡 Pirmas žingsnis: ištrauk geltonu žiedu paryškintą kaištį!'
    };
  }

  if (mode === 'sokoban') {
    const step = findFirstSokobanMoveBfs(context.sokobanGame);
    if (!step) {
      return {
        mode,
        kind: 'sokoban-reset',
        message: '💡 Robotukas pateko į aklavietę – paspausk „Atšaukti (Undo)“ arba „Iš naujo (Reset)“!'
      };
    }
    return {
      mode,
      kind: 'sokoban-dir',
      dr: step.dr,
      dc: step.dc,
      message: '💡 Pirmas žingsnis: pajudėk į paryškintą kryptį (rodyklė arba langelis šalia roboto)!'
    };
  }

  if (mode === 'laser') {
    const solList = LASER_SOLUTIONS[level.id] || [];
    const pieces = context.laserEngine?.pieces || [];

    // 1. Pirma ieškome elemento, kurį reikia perkelti (3 klasėje)
    for (const target of solList) {
      const p = pieces.find((x) => x.id === target.id);
      if (!p) continue;
      if (p.r !== target.r || p.c !== target.c) {
        return {
          mode,
          kind: 'laser-move',
          pieceId: p.id,
          toR: target.r,
          toC: target.c,
          message: '💡 Pirmas žingsnis: perkelk paryškintą elementą į punktyrinį geltoną langelį!'
        };
      }
      if (p.type !== target.type) {
        return {
          mode,
          kind: 'laser-rotate',
          pieceId: p.id,
          r: p.r,
          c: p.c,
          message: '💡 Pirmas žingsnis: pasuk paryškintą elementą 90°!'
        };
      }
    }
    return null;
  }

  if (mode === 'circuit') {
    const solTiles = CIRCUIT_SOLUTIONS[level.id] || [];
    const tiles = context.circuitEngine?.tiles || [];
    for (const sol of solTiles) {
      const tile = tiles.find((t) => t.r === sol.r && t.c === sol.c);
      if (tile && !tile.locked && !sol.rots.includes(tile.rot)) {
        return {
          mode,
          kind: 'circuit-tile',
          r: tile.r,
          c: tile.c,
          message: '💡 Pirmas žingsnis: paspausk ir pasuk paryškintą bėgio detalę!'
        };
      }
    }
    return {
      mode,
      kind: 'circuit-launch',
      message: '💡 Kelias jau paruoštas – paspausk „🚂 Paleisti!“!'
    };
  }

  if (mode === 'balance') {
    const eng = context.balanceEngine;
    if (!eng) return null;
    const solutionUids = eng.getSolutionUids?.() || [];
    const placedUids = (eng.rightItems || []).map((t) => t.uid);

    const wrongPlaced = placedUids.find((uid) => !solutionUids.includes(uid));
    if (wrongPlaced) {
      return {
        mode,
        kind: 'balance-remove',
        message: '💡 Pirmas žingsnis: vienas svarstis dešinėje lėkštėje netinka – spustelėk jį, kad nuimtum!'
      };
    }

    const nextUid = solutionUids.find((uid) => !placedUids.includes(uid));
    if (nextUid) {
      return {
        mode,
        kind: 'balance-add',
        uid: nextUid,
        message: '💡 Pirmas žingsnis: uždėk paryškintą svarstį ant dešinės lėkštės!'
      };
    }

    return {
      mode,
      kind: 'balance-check',
      message: '💡 Svarsčiai paruošti – spausk „⚖️ Patikrinti pusiausvyrą“!'
    };
  }

  if (mode === 'matrix') {
    if (level.kind === 'memory') {
      const ctrl = context.memoryCtrl;
      const stepIdx = ctrl?.userInput?.length || 0;
      const cellIndex = level.sequence[stepIdx] ?? level.sequence[0];
      return {
        mode,
        kind: 'memory-cell',
        cellIndex,
        message: '💡 Pirmas žingsnis: paryškintas kitas sekos langelis!'
      };
    }

    // IQ matrica: paslepiame 2 neteisingus variantus, kad neišspręstų viso lygio
    const wrongIndices = [];
    (level.choices || []).forEach((_, idx) => {
      if (idx !== level.correctIndex && wrongIndices.length < 2) {
        wrongIndices.push(idx);
      }
    });
    return {
      mode,
      kind: 'matrix-eliminate',
      eliminateIndices: wrongIndices,
      message: '💡 Užuomina: du netinkami atsakymai pritemdyti – išrink iš likusių!'
    };
  }

  if (mode === 'algo') {
    const firstCmdMap = {
      alg_g1_1: 'RIGHT_DIR',
      alg_g1_2: 'RIGHT_DIR',
      alg_g1_3: 'UP',
      alg_g1_4: 'RIGHT_DIR',
      alg_g1_5: 'UP',
      alg_g1_6: 'UP',
      alg_g1_7: 'RIGHT_DIR',
      alg_g1_8: 'UP',
      alg_g1_9: 'LEFT_DIR',
      alg_g1_10: 'RIGHT_DIR',
      alg_g3_1: 'LOOP',
      alg_g3_2: 'LOOP',
      alg_g3_3: 'LOOP',
      alg_g3_4: 'LOOP',
      alg_g3_5: 'LOOP',
      alg_g3_6: 'LOOP',
      alg_g3_7: 'LOOP',
      alg_g3_8: 'LOOP',
      alg_g3_9: 'LOOP',
      alg_g3_10: 'LOOP'
    };
    const firstCmd = firstCmdMap[level.id] || (level.controlMode === 'absolute' ? 'RIGHT_DIR' : 'FWD');
    const cmdNames = {
      UP: '⬆️ Aukštyn',
      DOWN: '⬇️ Žemyn',
      LEFT_DIR: '⬅️ Kairėn',
      RIGHT_DIR: '➡️ Dešinėn',
      FWD: '⬆️ Pirmyn',
      LOOP: '🔁 Kartoti'
    };
    const desc =
      firstCmd === 'LOOP'
        ? '💡 Pirmas žingsnis: pridėk ciklo blokelį „🔁 Kartoti“, kad sutalpintum kelią!'
        : `💡 Pirmas žingsnis: paspausk paryškintą kryptį „${cmdNames[firstCmd] || firstCmd}“ (ir spausk ant blokelio eilėje, jei reikia ×2..×4)!`;
    return {
      mode,
      kind: 'algo-cmd',
      cmd: firstCmd,
      message: desc
    };
  }

  if (mode === 'gears') {
    const GEAR_SOLUTIONS = {
      gea_g1_1: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'S' }],
      gea_g1_2: [{ pegId: 'p1', sizeKey: 'L' }, { pegId: 'p2', sizeKey: 'M' }, { pegId: 'p3', sizeKey: 'S' }],
      gea_g1_3: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'S' }, { pegId: 'p3', sizeKey: 'M' }],
      gea_g1_4: [{ pegId: 'p1', sizeKey: 'S' }, { pegId: 'p2', sizeKey: 'L' }, { pegId: 'p3', sizeKey: 'S' }, { pegId: 'p4', sizeKey: 'M' }],
      gea_g1_5: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'M' }, { pegId: 'p3', sizeKey: 'S' }, { pegId: 'p4', sizeKey: 'M' }],
      gea_g1_6: [{ pegId: 'p1', sizeKey: 'L' }, { pegId: 'p2', sizeKey: 'M' }, { pegId: 'p3', sizeKey: 'S' }, { pegId: 'p4', sizeKey: 'L' }],
      gea_g1_7: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'S' }, { pegId: 'p3', sizeKey: 'L' }],
      gea_g1_8: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'L' }, { pegId: 'p3', sizeKey: 'M' }, { pegId: 'p4', sizeKey: 'L' }],
      gea_g1_9: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'M' }, { pegId: 'p3', sizeKey: 'S' }, { pegId: 'p4', sizeKey: 'M' }],
      gea_g1_10: [{ pegId: 'p1', sizeKey: 'S' }, { pegId: 'p2', sizeKey: 'L' }, { pegId: 'p3', sizeKey: 'S' }, { pegId: 'p4', sizeKey: 'M' }, { pegId: 'p5', sizeKey: 'M' }],
      gea_g3_1: [{ pegId: 'u1', sizeKey: 'L' }, { pegId: 'u2', sizeKey: 'M' }, { pegId: 'u3', sizeKey: 'L' }],
      gea_g3_2: [{ pegId: 'p1', sizeKey: 'L' }, { pegId: 'p2', sizeKey: 'S' }, { pegId: 'p3', sizeKey: 'M' }],
      gea_g3_3: [{ pegId: 'b1', sizeKey: 'S' }, { pegId: 'b2', sizeKey: 'L' }, { pegId: 'b3', sizeKey: 'M' }],
      gea_g3_4: [{ pegId: 'p1', sizeKey: 'L' }, { pegId: 'p2', sizeKey: 'M' }, { pegId: 'p3', sizeKey: 'M' }, { pegId: 'p4', sizeKey: 'L' }],
      gea_g3_5: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'M' }, { pegId: 'p3', sizeKey: 'S' }],
      gea_g3_6: [{ pegId: 'p1', sizeKey: 'S' }, { pegId: 'p2', sizeKey: 'L' }],
      gea_g3_7: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'S' }, { pegId: 'p3', sizeKey: 'L' }],
      gea_g3_8: [{ pegId: 'p1', sizeKey: 'L' }, { pegId: 'p2', sizeKey: 'M' }, { pegId: 'p3', sizeKey: 'S' }, { pegId: 'p4', sizeKey: 'L' }],
      gea_g3_9: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'S' }, { pegId: 'p3', sizeKey: 'L' }],
      gea_g3_10: [{ pegId: 'p1', sizeKey: 'M' }, { pegId: 'p2', sizeKey: 'S' }, { pegId: 'p3', sizeKey: 'S' }, { pegId: 'p4', sizeKey: 'L' }]
    };
    const sizeLabels = { S: 'Mažą (S)', M: 'Vidutinį (M)', L: 'Didelį (L)' };
    const eng = context.gearsEngine;
    const placed = eng?.placed || {};
    const chain = GEAR_SOLUTIONS[level.id] || [];
    const target = chain.find((step) => placed[step.pegId] !== step.sizeKey) || chain[0];
    if (target) {
      return {
        mode,
        kind: 'gear-peg',
        pegId: target.pegId,
        sizeKey: target.sizeKey,
        message: `💡 Pirmas žingsnis: uždėk ${sizeLabels[target.sizeKey]} krumpliaratį ant pažymėto geltono kaiščio!`
      };
    }
  }

  if (mode === 'gravity') {
    const firstDirs = {
      grv_g1_1: 'R',
      grv_g1_2: 'R',
      grv_g1_3: 'R',
      grv_g1_4: 'L',
      grv_g1_5: 'U',
      grv_g1_6: 'R',
      grv_g1_7: 'R',
      grv_g1_8: 'D',
      grv_g1_9: 'D',
      grv_g1_10: 'R',
      grv_g3_1: 'R',
      grv_g3_2: 'R',
      grv_g3_3: 'D',
      grv_g3_4: 'R',
      grv_g3_5: 'R',
      grv_g3_6: 'R',
      grv_g3_7: 'R',
      grv_g3_8: 'R',
      grv_g3_9: 'R',
      grv_g3_10: 'R'
    };
    const dirNames = { U: '▲ AUKŠTYN', D: '▼ ŽEMYN', L: '◄ KAIRĖN', R: '► DEŠINĖN' };
    const dir = firstDirs[level.id] || 'R';
    return {
      mode,
      kind: 'gravity-dir',
      dir,
      message: `💡 Pirmas žingsnis: pakreipk lauką ${dirNames[dir]}!`
    };
  }

  if (mode === 'mathcross') {
    const eng = context.mathCrossEngine;
    if (!eng) return null;
    return {
      mode,
      kind: 'mathcross-place',
      message: '💡 Užuomina: vienas teisingas skaičius įdėtas į tuščią langelį!'
    };
  }

  if (mode === 'bridges') {
    const eng = context.bridgesEngine;
    if (!eng) return null;
    const islandId = eng.getGuaranteedHintIslandId?.();
    if (islandId !== null && islandId !== undefined) {
      return {
        mode,
        kind: 'bridge-island',
        islandId,
        message: '💡 Užuomina: pažymėta geltona sala privalo tiesti tiltą! Paspausk ją ir sujunk su kaimynu.'
      };
    }
  }

  if (mode === 'mini') {
    if (level.kind === 'pipes') {
      const eng = context.pipeValveEngine;
      if (!eng) return null;
      const step = solvePipeFirstValveBfs(level, eng.valveStates);
      if (step) {
        return {
          mode,
          kind: 'mini-pipe-valve',
          valveId: step.valveId,
          message: '💡 Pirmas žingsnis: paspausk paryškintą geltoną sklendę (arba skirstytuvą)!'
        };
      }
      return {
        mode,
        kind: 'mini-pipe-launch',
        message: '💡 Visos sklendės teisingos! Paspausk „🧪 Paleisti srautą!“!'
      };
    } else if (level.kind === 'jugs') {
      const eng = context.jugPourEngine;
      if (!eng) return null;
      const action = solveJugFirstMoveBfs(level.capacities, eng.amounts, level.targetAmount, level.hasTap);
      if (action) {
        const msg =
          action.type === 'fill'
            ? `💡 Pirmas žingsnis: pripilk Kolbą #${action.to + 1} (🚰 +Pilti)!`
            : action.type === 'empty'
              ? `💡 Pirmas žingsnis: išpilk Kolbą #${action.from + 1} (💧 Išp.)!`
              : `💡 Pirmas žingsnis: perpilk iš Kolbos #${action.from + 1} į Kolbą #${action.to + 1}!`;
        return {
          mode,
          kind: 'mini-jug-move',
          action,
          message: msg
        };
      }
    }
  }

  return null;
}
