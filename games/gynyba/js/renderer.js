// ==================== BUBIŲ TVIRTOVĖ: MODERNUS DIENOS 2.5D KRAŠTOVAIZDŽIO VARIKLIS ====================
// Iš anksto į atminties Canvas / OffscreenCanvas nupiešiamas 5 zonų dienos pasaulis (60 FPS),
// aiškios statybos aikštelės su plaktuku, bonusinės zonos (+🪙 / +⚡), animuoti vartai ir Tvirtovė.

import {
  getTowerStats,
  getTargetingPriorityMeta
} from './balance.js?v=20261121s';
import {
  drawEnemySprite,
  drawTowerBaseSprite,
  drawTowerTurretSprite,
  drawDroneUnitSprite,
  drawMowerUnitSprite
} from './sprites.js?v=20261121s';

const backdropCache = new Map();

export function clearBackdropCache() {
  backdropCache.clear();
}

function sampleSplinePoint(spline, distance) {
  const pts = spline?.points;
  if (!pts || pts.length === 0) return { x: 0, y: 0, angle: 0 };
  if (pts.length === 1 || spline.totalLength <= 0) {
    return { x: pts[0].x, y: pts[0].y, angle: pts[0].angle || 0 };
  }
  const d = Math.max(0, Math.min(spline.totalLength, distance));
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (pts[mid].dist <= d) lo = mid;
    else hi = mid;
  }
  const a = pts[lo];
  const b = pts[hi];
  const seg = b.dist - a.dist;
  const t = seg > 0.0001 ? (d - a.dist) / seg : 0;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle: a.angle || 0
  };
}

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

function drawGroundShadow(ctx, x, y, rx, ry, alpha = 0.36) {
  ctx.save();
  ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getZoneExits(map, pathSplines) {
  const exits = [];
  for (const spline of pathSplines || []) {
    const endPt = spline.points?.[spline.points.length - 1];
    if (!endPt) continue;
    if (!exits.some((ex) => Math.hypot(ex.x - endPt.x, ex.y - endPt.y) < 14)) {
      exits.push({ x: endPt.x, y: endPt.y });
    }
  }
  if (exits.length === 0 && map?.fortress) {
    exits.push({ x: map.fortress.x, y: map.fortress.y });
  }
  return exits;
}

function isInsidePondWater(x, y, margin = 12) {
  const rx = 132 + margin;
  const ry = 78 + margin;
  const dx = x - 455;
  const dy = y - 255;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0;
}

function isSpotClear(x, y, map, pathSplines, minPadDist = 46, minPathDist = 40, minEndpointDist = 72) {
  if (x < 64 || x > 822 || y < 50 || y > 450) return false;

  for (const pad of map?.pads || []) {
    if (Math.hypot(pad.x - x, pad.y - y) < minPadDist) return false;
  }

  const step = 12;
  for (const spline of pathSplines || []) {
    const pts = spline.points || [];
    if (pts.length > 0) {
      if (Math.hypot(pts[0].x - x, pts[0].y - y) < minEndpointDist) return false;
      const last = pts[pts.length - 1];
      if (Math.hypot(last.x - x, last.y - y) < minEndpointDist) return false;
    }
    for (let d = 0; d <= spline.totalLength; d += step) {
      const pt = sampleSplinePoint(spline, d);
      if (Math.hypot(pt.x - x, pt.y - y) < minPathDist) return false;
    }
  }

  for (const ex of getZoneExits(map, pathSplines)) {
    if (Math.hypot(ex.x - x, ex.y - y) < minEndpointDist) return false;
  }

  return true;
}

// ==================== BONUSINĖS / RESURSŲ ZONOS (+🪙 IR +⚡) ====================

const BONUS_ZONE_COPY = {
  1: {
    goldTitle: '☀️ Derlinga saulėta vieta',
    goldDesc: 'Derlinga vieta! Pastatyk bokštelį šalia ir iškart gauk +18 🪙 premiją!',
    powerTitle: '⚡ Saulės energijos taškas',
    powerDesc: 'Energijos vieta! Šalia pastatyti bokšteliai šaudo +15% greičiau!'
  },
  2: {
    goldTitle: '🪙 Pakrantės lobio taškas',
    goldDesc: 'Sėkmės vieta prie tvenkinio! Pastatęs bokštelį šalia iškart gausi +18 🪙!',
    powerTitle: '⚡ Piliakalnio vėjo gūsis',
    powerDesc: 'Stiprybės vieta! Aplinkiniai bokšteliai šaudo +15% greičiau!'
  },
  3: {
    goldTitle: '🪙 Gintarinė girios aikštelė',
    goldDesc: 'Kuršių lobis! Pastatyk bokštelį netoliese ir gauk +18 🪙 premiją!',
    powerTitle: '⚡ Senųjų pušų galia',
    powerDesc: 'Miško jėga! Šalia pastatyti bokšteliai įgauna +15% šaudymo greičio!'
  },
  4: {
    goldTitle: '🪙 Koncertų rėmėjų vieta',
    goldDesc: 'Scenos premija! Pastatęs bokštelį šalia iškart gausi +18 🪙!',
    powerTitle: '⚡ Akustinio rezonanso taškas',
    powerDesc: 'Puiki akustika! Šalia esantys bokšteliai šaudo +15% greičiau!'
  },
  5: {
    goldTitle: '🪙 Saulės kolektoriaus mazgas',
    goldDesc: 'Energijos perteklius! Pastatyk bokštelį šalia ir iškart gauk +18 🪙!',
    powerTitle: '⚡ Plazminis stiprintuvas',
    powerDesc: 'Aukšta įtampa! Šalia esantys bokšteliai šaudo +15% greičiau!'
  },
  6: {
    goldTitle: '🫐 Spanguolyno lobio kupstas',
    goldDesc: 'Mūšos tyrelio dovana! Pastatyk bokštelį šalia ir iškart gauk +18 🪙!',
    powerTitle: '⚡ Pelkių žaltvykslės galia',
    powerDesc: 'Samanų energija! Šalia esantys bokšteliai šaudo +15% greičiau!'
  },
  7: {
    goldTitle: '💎 Klinčių kristalų gysla',
    goldDesc: 'Karpėnų lobis! Pastatyk bokštelį šalia ir iškart gauk +18 🪙 premiją!',
    powerTitle: '⚡ Kanjono rezonanso uola',
    powerDesc: 'Aukštos terasos jėga! Šalia esantys bokšteliai šaudo +15% greičiau!'
  },
  8: {
    goldTitle: '☀️ Kosminis kondensatorius',
    goldDesc: 'Orbitinis energijos perteklius! Pastatyk bokštelį šalia ir gauk +18 🪙!',
    powerTitle: '⚡ Plazminio tilto srovė',
    powerDesc: 'Tiesioginė Saulės jėgainės galia! Šalia esantys bokšteliai šaudo +15% greičiau!'
  }
};

export function getMapBonusZones(map, pathSplines) {
  if (!map || !Array.isArray(map.pads) || map.pads.length === 0) return [];

  const zoneId = map.zoneId || 1;
  const copy = BONUS_ZONE_COPY[zoneId] || BONUS_ZONE_COPY[1];
  const theme = map.theme || 'courtyard_greenhouse';
  const angles = [
    0,
    Math.PI / 4,
    -Math.PI / 4,
    Math.PI / 2,
    -Math.PI / 2,
    (3 * Math.PI) / 4,
    -(3 * Math.PI) / 4,
    Math.PI,
    Math.PI / 6,
    -Math.PI / 6,
    (5 * Math.PI) / 6,
    -(5 * Math.PI) / 6
  ];
  const radii = [60, 68, 54, 74];

  const findSpot = (anchorOrder, avoidZones, strict) => {
    const minPad = strict ? 45 : 38;
    const minPath = strict ? 40 : 34;
    const minEnd = strict ? 70 : 58;
    const minOther = strict ? 145 : 95;

    for (const anchor of anchorOrder) {
      if (!anchor) continue;
      for (const r of radii) {
        for (const ang of angles) {
          const cx = Math.round(anchor.x + Math.cos(ang) * r);
          const cy = Math.round(anchor.y + Math.sin(ang) * r);
          if (!isSpotClear(cx, cy, map, pathSplines, minPad, minPath, minEnd)) continue;
          if (theme === 'mound_pond' && isInsidePondWater(cx, cy, 4)) continue;
          if (theme === 'courtyard_greenhouse' && cx > 690 && cy < 96) continue;
          if (avoidZones.some((z) => Math.hypot(z.x - cx, z.y - cy) < minOther)) continue;
          return { x: cx, y: cy };
        }
      }
    }
    return null;
  };

  const pads = map.pads;
  const goldAnchors = [pads[0], pads[1], ...pads];
  const midIdx = Math.floor(pads.length / 2);
  const powerAnchors = [pads[midIdx], pads[pads.length - 1], ...[...pads].reverse()];

  const zones = [];
  const goldPos = findSpot(goldAnchors, zones, true) || findSpot(goldAnchors, zones, false);
  if (goldPos) {
    zones.push({
      id: `${map.id}_bonus_gold`,
      kind: 'gold',
      badge: '+🪙',
      icon: '🪙',
      title: copy.goldTitle,
      description: copy.goldDesc,
      x: goldPos.x,
      y: goldPos.y,
      effectRadius: 86,
      rewardCoins: 18
    });
  }

  const powerPos = findSpot(powerAnchors, zones, true) || findSpot(powerAnchors, zones, false);
  if (powerPos) {
    zones.push({
      id: `${map.id}_bonus_power`,
      kind: 'power',
      badge: '+⚡',
      icon: '⚡',
      title: copy.powerTitle,
      description: copy.powerDesc,
      x: powerPos.x,
      y: powerPos.y,
      effectRadius: 86,
      speedBonus: 0.15
    });
  }

  return zones;
}

// ==================== STATINIS DIENOS KRAŠTOVAIZDŽIO SLUOKSNIS (BACKDROP CACHE) ====================

function createBackdropCanvas(w, h) {
  if (typeof OffscreenCanvas === 'function') {
    return new OffscreenCanvas(w, h);
  }
  if (typeof HTMLCanvasElement !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  return null;
}

function drawFlowerCluster(ctx, x, y, petalColor = '#ffffff') {
  ctx.save();
  ctx.fillStyle = '#2f6d24';
  ctx.beginPath();
  ctx.arc(x, y + 2, 4, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 2 + 0.3;
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(x, y, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGrassTuftsAndFlowers(ctx, w, h, map, pathSplines, count, palette) {
  for (let i = 0; i < count; i += 1) {
    const gx = 38 + ((i * 137 + map.levelNumber * 41) % (w - 86));
    const gy = 28 + ((i * 97 + map.levelNumber * 67) % (h - 56));
    if (!isSpotClear(gx, gy, map, pathSplines, 32, 28, 45)) continue;
    if (map.theme === 'mound_pond' && isInsidePondWater(gx, gy, 10)) continue;

    ctx.strokeStyle = palette.tuft;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(gx - 3, gy + 2);
    ctx.lineTo(gx - 5, gy - 4);
    ctx.moveTo(gx, gy + 2);
    ctx.lineTo(gx + 1, gy - 5);
    ctx.moveTo(gx + 3, gy + 2);
    ctx.lineTo(gx + 5, gy - 3);
    ctx.stroke();

    if (i % 3 === 0) {
      drawFlowerCluster(ctx, gx + 7, gy + 3, i % 2 === 0 ? palette.flowerA : palette.flowerB);
    }
  }
}

function drawZone1Courtyard(ctx, map, pathSplines, w, h) {
  // Šilta, saulėta dienos veja
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#74cc4d');
  grad.addColorStop(0.55, '#59b23a');
  grad.addColorStop(1, '#44962e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Šviesios nupjautos vejos juostos
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.065)';
  for (let sx = -100; sx < w + 120; sx += 92) {
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + 46, 0);
    ctx.lineTo(sx - 44, h);
    ctx.lineTo(sx - 90, h);
    ctx.closePath();
    ctx.fill();
  }
  // Saulės šviesos dėmė viduryje
  const sunGlow = ctx.createRadialGradient(w * 0.45, h * 0.35, 30, w * 0.45, h * 0.35, 420);
  sunGlow.addColorStop(0, 'rgba(254, 249, 195, 0.22)');
  sunGlow.addColorStop(1, 'rgba(254, 249, 195, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Sodo tvorelė viršuje ir apačioje
  ctx.fillStyle = '#c89b62';
  ctx.strokeStyle = '#6f4b23';
  ctx.lineWidth = 1.4;
  ctx.fillRect(0, 5, w, 4);
  ctx.fillRect(0, h - 9, w, 4);
  for (let px = 14; px < w - 12; px += 22) {
    ctx.fillStyle = '#e7cda5';
    drawRoundedRectPath(ctx, px, 1, 7, 13, 2);
    ctx.fill();
    ctx.stroke();
    drawRoundedRectPath(ctx, px, h - 14, 7, 13, 2);
    ctx.fill();
    ctx.stroke();
  }

  // Detalus 2.5D polikarbonatinis šiltnamis dešinėje viršuje (aiškiai virš kelių ir aikštelių)
  const gx = 710;
  const gy = 14;
  const gw = 128;
  const gh = 62;
  drawGroundShadow(ctx, gx + gw / 2 + 4, gy + gh + 2, gw * 0.5, 9, 0.26);

  ctx.save();
  // Medinis cokolis ir vidinės lysvės su pomidorais
  ctx.fillStyle = '#6b4226';
  drawRoundedRectPath(ctx, gx, gy + 8, gw, gh - 8, 8);
  ctx.fill();
  ctx.fillStyle = '#3f2818';
  ctx.fillRect(gx + 10, gy + 18, gw - 20, 14);
  ctx.fillRect(gx + 10, gy + 38, gw - 20, 14);

  // Žalumynai ir raudoni pomidorai šiltnamio viduje
  for (let px = gx + 20; px < gx + gw - 16; px += 18) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(px, gy + 25, 5.5, 0, Math.PI * 2);
    ctx.arc(px + 4, gy + 45, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px + 2, gy + 24, 2.2, 0, Math.PI * 2);
    ctx.arc(px + 2, gy + 44, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pusiau permatomas polikarbonatinis stogas su aliuminio rėmu
  const roofGrad = ctx.createLinearGradient(gx, gy, gx + gw, gy + gh);
  roofGrad.addColorStop(0, 'rgba(224, 242, 254, 0.56)');
  roofGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.36)');
  roofGrad.addColorStop(1, 'rgba(240, 249, 255, 0.58)');
  ctx.fillStyle = roofGrad;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.4;
  drawRoundedRectPath(ctx, gx, gy, gw, gh - 4, 12);
  ctx.fill();
  ctx.stroke();

  // Aliuminio šonkauliai ir stogo kraigas
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.72)';
  ctx.lineWidth = 1.6;
  for (let rx = gx + 24; rx < gx + gw - 8; rx += 24) {
    ctx.beginPath();
    ctx.moveTo(rx, gy + 2);
    ctx.lineTo(rx, gy + gh - 6);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(gx + 6, gy + (gh - 4) * 0.45);
  ctx.lineTo(gx + gw - 6, gy + (gh - 4) * 0.45);
  ctx.stroke();
  ctx.restore();

  // Pakeltos medinės lysvės ir šilauogių vazonai laisvuose kampuose
  const bedCandidates = [
    { x: 42, y: 20, w: 84, h: 36 },
    { x: 42, y: 438, w: 88, h: 36 },
    { x: 355, y: 20, w: 86, h: 34 },
    { x: 560, y: 440, w: 84, h: 34 }
  ];
  for (const b of bedCandidates) {
    if (!isSpotClear(b.x + b.w / 2, b.y + b.h / 2, map, pathSplines, 48, 40, 52)) continue;
    drawGroundShadow(ctx, b.x + b.w / 2 + 2, b.y + b.h + 2, b.w * 0.48, 6, 0.25);
    ctx.fillStyle = '#8b5a2b';
    ctx.strokeStyle = '#4a2c11';
    ctx.lineWidth = 2;
    drawRoundedRectPath(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4a3020';
    drawRoundedRectPath(ctx, b.x + 5, b.y + 5, b.w - 10, b.h - 10, 3);
    ctx.fill();
    for (let px = b.x + 15; px < b.x + b.w - 10; px += 18) {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(px, b.y + b.h / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(px - 2, b.y + b.h / 2 - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const potCandidates = [
    { x: 774, y: 442 },
    { x: 814, y: 448 },
    { x: 245, y: 446 },
    { x: 530, y: 38 }
  ];
  for (const p of potCandidates) {
    if (!isSpotClear(p.x, p.y, map, pathSplines, 38, 34, 48)) continue;
    drawGroundShadow(ctx, p.x + 2, p.y + 8, 13, 6, 0.28);
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 2, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(p.x - 3, p.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(p.x + 3, p.y - 1, 2.8, 0, Math.PI * 2);
    ctx.arc(p.x - 4, p.y, 2.5, 0, Math.PI * 2);
    ctx.arc(p.x + 1, p.y - 6, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGrassTuftsAndFlowers(ctx, w, h, map, pathSplines, 26, {
    tuft: 'rgba(22, 101, 52, 0.55)',
    flowerA: '#ffffff',
    flowerB: '#fde047'
  });
}

function drawZone2MoundAndPond(ctx, map, pathSplines, w, h) {
  // Ryški saulėta pakrantės pieva
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#6bc957');
  grad.addColorStop(0.55, '#4da745');
  grad.addColorStop(1, '#378739');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Reljefinis Bubių Piliakalnis viršuje kairėje (laisvas nuo kelių ir aikštelių)
  const hx = 114;
  const hy = 52;
  drawGroundShadow(ctx, hx + 6, hy + 10, 74, 34, 0.24);
  const hillTiers = [
    { rx: 72, ry: 31, col: '#2f7a31', rim: '#1e5721', dy: 6 },
    { rx: 56, ry: 23, col: '#47a143', rim: '#2a6b2b', dy: 0 },
    { rx: 38, ry: 15, col: '#69c657', rim: '#3b8736', dy: -6 }
  ];
  for (const tier of hillTiers) {
    ctx.fillStyle = tier.col;
    ctx.strokeStyle = tier.rim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(hx, hy + tier.dy, tier.rx, tier.ry, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Mediniai laipteliai į piliakalnį
  for (let s = 0; s < 5; s += 1) {
    const sy = hy + 20 - s * 4.5;
    ctx.fillStyle = '#c48f56';
    ctx.strokeStyle = '#5c3818';
    ctx.lineWidth = 1.2;
    ctx.fillRect(hx - 10, sy, 20, 3.2);
    ctx.strokeRect(hx - 10, sy, 20, 3.2);
  }
  // Medinė piliakalnio apžvalgos/pilies bokštelio viršūnė
  ctx.fillStyle = '#9a6234';
  ctx.strokeStyle = '#3f220e';
  ctx.lineWidth = 1.8;
  ctx.fillRect(hx - 12, hy - 22, 24, 15);
  ctx.strokeRect(hx - 12, hy - 22, 24, 15);
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(hx - 16, hy - 21);
  ctx.lineTo(hx, hy - 35);
  ctx.lineTo(hx + 16, hy - 21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Didelis mėlynas Bubių tvenkinys centre
  const px = 455;
  const py = 255;
  const rx = 132;
  const ry = 78;

  // Smėlėtas krantas ir bangų putos
  ctx.fillStyle = '#dfc89a';
  ctx.beginPath();
  ctx.ellipse(px, py, rx + 11, ry + 9, 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.ellipse(px, py, rx + 3, ry + 3, 0.08, 0, Math.PI * 2);
  ctx.fill();

  const waterGrad = ctx.createRadialGradient(px - 22, py - 18, 18, px, py, rx + 10);
  waterGrad.addColorStop(0, '#38bdf8');
  waterGrad.addColorStop(0.6, '#0284c7');
  waterGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = waterGrad;
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(px, py, rx, ry, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Plaukiojančios vandens lelijos ir pakrantės nendrės
  const lilies = [
    { lx: px - 68, ly: py - 24 },
    { lx: px + 62, ly: py + 28 },
    { lx: px - 38, ly: py + 42 }
  ];
  for (const l of lilies) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(l.lx, l.ly, 8, 0.25, Math.PI * 1.9);
    ctx.lineTo(l.lx, l.ly);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(l.lx + 1, l.ly - 1, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  const reeds = [
    { rx: px - 120, ry: py + 15 },
    { rx: px - 114, ry: py + 24 },
    { rx: px + 118, ry: py - 22 },
    { rx: px + 112, ry: py - 30 }
  ];
  for (const r of reeds) {
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r.rx, r.ry + 6);
    ctx.lineTo(r.rx - 2, r.ry - 10);
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(r.rx - 2, r.ry - 9, 2.2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Jei kuri nors statybos aikštelė (pvz., p4/p5) yra tvenkinio vandenyje – nupiešiame medinę salelę-lieptelį po ja
  for (const pad of map.pads || []) {
    if (isInsidePondWater(pad.x, pad.y, 16)) {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 33, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#92592c';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pad.x, pad.y, 29, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  drawGrassTuftsAndFlowers(ctx, w, h, map, pathSplines, 24, {
    tuft: 'rgba(21, 128, 61, 0.55)',
    flowerA: '#fef08a',
    flowerB: '#ffffff'
  });
}

function drawLayeredPineTree(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawGroundShadow(ctx, 5, 11, 20, 10, 0.34);

  // Kamienas
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(-3.5, 1, 7, 11);

  // 3 eglių/pušų šakų sluoksniai
  const layers = [
    { r: 19, dy: 0, fill: '#14532d', edge: '#052e16' },
    { r: 14, dy: -5, fill: '#166534', edge: '#064e3b' },
    { r: 9, dy: -10, fill: '#22c55e', edge: '#15803d' }
  ];
  for (const l of layers) {
    ctx.fillStyle = l.fill;
    ctx.strokeStyle = l.edge;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, l.dy, l.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(187, 247, 208, 0.35)';
  ctx.beginPath();
  ctx.arc(-3, -13, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawZone3Forest(ctx, map, pathSplines, w, h) {
  // Gili samanota Kurtuvėnų girios paklotė
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#4f8641');
  grad.addColorStop(0.55, '#376733');
  grad.addColorStop(1, '#264f29');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Saulės proskynos miško paklotėje
  const dapples = [
    { x: 220, y: 120, r: 95 },
    { x: 520, y: 240, r: 110 },
    { x: 740, y: 360, r: 90 }
  ];
  for (const d of dapples) {
    const dg = ctx.createRadialGradient(d.x, d.y, 12, d.x, d.y, d.r);
    dg.addColorStop(0, 'rgba(190, 242, 100, 0.16)');
    dg.addColorStop(1, 'rgba(190, 242, 100, 0)');
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pelkės ploteliai (tik laisvose vietose)
  const marshSpots = [
    { x: 405, y: 248, rx: 64, ry: 34 },
    { x: 740, y: 74, rx: 52, ry: 26 },
    { x: 185, y: 446, rx: 56, ry: 24 }
  ];
  for (const sw of marshSpots) {
    if (!isSpotClear(sw.x, sw.y, map, pathSplines, 44, 34, 48)) continue;
    ctx.fillStyle = '#0f766e';
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sw.x, sw.y, sw.rx, sw.ry, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2dd4bf';
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(sw.x - 10, sw.y - 4, sw.rx * 0.55, sw.ry * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Samanoti rieduliai ir grybai
  const rocksAndMushrooms = [
    { x: 185, y: 58 },
    { x: 425, y: 448 },
    { x: 645, y: 448 },
    { x: 315, y: 54 },
    { x: 585, y: 48 }
  ];
  rocksAndMushrooms.forEach((pt, idx) => {
    if (!isSpotClear(pt.x, pt.y, map, pathSplines, 38, 34, 45)) return;
    if (idx % 2 === 0) {
      drawGroundShadow(ctx, pt.x + 2, pt.y + 5, 13, 6, 0.35);
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, 12, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(pt.x - 3, pt.y - 4, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Musmirė / baravykas
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 7);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y - 3, 6.5, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x - 2, pt.y - 6, 1.3, 0, Math.PI * 2);
      ctx.arc(pt.x + 2.5, pt.y - 5.5, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Medinis pažintinio tako ženklas
  if (isSpotClear(140, 56, map, pathSplines, 36, 34, 45)) {
    drawGroundShadow(ctx, 142, 68, 9, 4, 0.35);
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(138, 44, 4, 24);
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(126, 40);
    ctx.lineTo(154, 40);
    ctx.lineTo(161, 46);
    ctx.lineTo(154, 52);
    ctx.lineTo(126, 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Tankios pušys ir eglės saugiuose pakraščiuose bei tarpuose
  const treeSpots = [
    { x: 52, y: 52, s: 1.05 },
    { x: 245, y: 44, s: 0.9 },
    { x: 475, y: 42, s: 0.95 },
    { x: 650, y: 48, s: 1.05 },
    { x: 830, y: 54, s: 1.0 },
    { x: 52, y: 446, s: 1.0 },
    { x: 265, y: 454, s: 0.92 },
    { x: 525, y: 456, s: 0.95 },
    { x: 745, y: 452, s: 1.05 },
    { x: 836, y: 440, s: 0.95 },
    { x: 382, y: 185, s: 0.88 },
    { x: 615, y: 448, s: 0.9 }
  ];
  for (const t of treeSpots) {
    if (!isSpotClear(t.x, t.y, map, pathSplines, 38, 34, 44)) continue;
    drawLayeredPineTree(ctx, t.x, t.y, t.s);
  }
}

function drawZone4MusicPlaza(ctx, map, pathSplines, w, h) {
  // Šviesi, šventinė miesto aikštė (granito/smėlio trinkelės)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#eee2cb');
  grad.addColorStop(0.55, '#e2d2b5');
  grad.addColorStop(1, '#d3c09d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtilus trinkelių tinklelis (be tamsaus techninio fono)
  ctx.strokeStyle = 'rgba(148, 124, 92, 0.24)';
  ctx.lineWidth = 1;
  for (let row = 0; row < h; row += 34) {
    ctx.beginPath();
    ctx.moveTo(0, row);
    ctx.lineTo(w, row);
    ctx.stroke();
    const offset = (row / 34) % 2 === 0 ? 0 : 28;
    for (let col = offset; col < w; col += 56) {
      ctx.beginPath();
      ctx.moveTo(col, row);
      ctx.lineTo(col, row + 34);
      ctx.stroke();
    }
  }

  // Koncertų scena su marmurinėmis kolonomis prie išėjimo dešinėje
  const scX = 848;
  const scY = 250;
  ctx.fillStyle = 'rgba(225, 29, 72, 0.16)';
  ctx.strokeStyle = 'rgba(190, 18, 60, 0.45)';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(scX, scY, 82, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(scX, scY, 68, Math.PI * 0.52, Math.PI * 1.48);
  ctx.stroke();

  // Marmurinės scenos kolonos viršuje ir apačioje
  for (const cy of [scY - 78, scY + 78]) {
    drawGroundShadow(ctx, scX - 6, cy + 5, 11, 6, 0.25);
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(scX - 6, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Apkarpyti dekoratyviniai krūmai ir gėlynai laisvuose aikštės pakraščiuose
  const planterSpots = [
    { x: 115, y: 34 },
    { x: 390, y: 32 },
    { x: 115, y: 466 },
    { x: 390, y: 466 },
    { x: 750, y: 38 },
    { x: 750, y: 462 }
  ];
  for (const pl of planterSpots) {
    if (!isSpotClear(pl.x, pl.y, map, pathSplines, 36, 32, 42)) continue;
    drawGroundShadow(ctx, pl.x + 2, pl.y + 6, 28, 11, 0.24);
    ctx.fillStyle = '#b4956b';
    ctx.strokeStyle = '#6f5534';
    ctx.lineWidth = 2;
    drawRoundedRectPath(ctx, pl.x - 28, pl.y - 12, 56, 24, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(pl.x - 14, pl.y, 8, 0, Math.PI * 2);
    ctx.arc(pl.x, pl.y - 1, 9, 0, Math.PI * 2);
    ctx.arc(pl.x + 14, pl.y, 8, 0, Math.PI * 2);
    ctx.fill();
    drawFlowerCluster(ctx, pl.x - 14, pl.y - 2, '#fb7185');
    drawFlowerCluster(ctx, pl.x, pl.y - 3, '#fde047');
    drawFlowerCluster(ctx, pl.x + 14, pl.y - 2, '#f472b6');
  }
}

function drawZone5FutureBase(ctx, map, pathSplines, w, h) {
  // Vienintelė vakarinė / futuristinė Saulės Bokšto bazė
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#132044');
  grad.addColorStop(0.55, '#0b1430');
  grad.addColorStop(1, '#060a19');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Metalinės bazės plokštės ir energijos kanalai
  for (let gx = 32; gx < w - 30; gx += 140) {
    for (let gy = 26; gy < h - 26; gy += 112) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1.4;
      drawRoundedRectPath(ctx, gx, gy, 126, 98, 8);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Švytinčios saulės jėgainių eilės saugiose vietose
  const solarRows = [
    { x: 455, y: 40 },
    { x: 455, y: 456 },
    { x: 115, y: 40 },
    { x: 115, y: 456 }
  ];
  for (const s of solarRows) {
    if (!isSpotClear(s.x, s.y, map, pathSplines, 38, 34, 48)) continue;
    ctx.fillStyle = '#0369a1';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    drawRoundedRectPath(ctx, s.x - 32, s.y - 12, 64, 24, 4);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s.x - 10, s.y - 11);
    ctx.lineTo(s.x - 10, s.y + 11);
    ctx.moveTo(s.x + 10, s.y - 11);
    ctx.lineTo(s.x + 10, s.y + 11);
    ctx.moveTo(s.x - 31, s.y);
    ctx.lineTo(s.x + 31, s.y);
    ctx.stroke();
  }
}

function drawZone6MusaSwamp(ctx, map, pathSplines, w, h) {
  // 6 zona: Mūšos tyrelio pelkynas (samanos, tamsūs ežerėliai, spanguolių kupstai, pelkės pušys)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#4d7c58');
  grad.addColorStop(0.55, '#3b6447');
  grad.addColorStop(1, '#2b4d38');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Samanų dėmės
  for (let i = 0; i < 16; i += 1) {
    const mx = ((i * 173 + 50) % (w - 80)) + 40;
    const my = ((i * 109 + 40) % (h - 80)) + 40;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(134, 239, 172, 0.11)' : 'rgba(20, 83, 45, 0.22)';
    ctx.beginPath();
    ctx.ellipse(mx, my, 52 + (i % 3) * 14, 28 + (i % 2) * 12, i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tamsūs pelkės ežerėliai saugiose vietose
  const lakes = [
    { x: 165, y: 80, rx: 46, ry: 26 },
    { x: 725, y: 78, rx: 48, ry: 26 },
    { x: 455, y: 440, rx: 56, ry: 26 },
    { x: 165, y: 425, rx: 44, ry: 24 }
  ];
  for (const lk of lakes) {
    if (!isSpotClear(lk.x, lk.y, map, pathSplines, 44, 40, 48)) continue;
    ctx.fillStyle = '#115e59';
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(lk.x, lk.y, lk.rx, lk.ry, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f3f3c';
    ctx.beginPath();
    ctx.ellipse(lk.x, lk.y + 2, lk.rx * 0.72, lk.ry * 0.65, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spanguolių kupstai su raudonomis uogomis
  for (let i = 0; i < 20; i += 1) {
    const kx = ((i * 199 + 70) % (w - 110)) + 55;
    const ky = ((i * 131 + 45) % (h - 90)) + 45;
    if (!isSpotClear(kx, ky, map, pathSplines, 34, 30, 38)) continue;
    drawGroundShadow(ctx, kx + 2, ky + 4, 15, 7, 0.22);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(kx, ky, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(kx - 2, ky - 2, 10, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(kx - 5, ky - 1, 2.3, 0, Math.PI * 2);
    ctx.arc(kx + 3, ky - 3, 2.4, 0, Math.PI * 2);
    ctx.arc(kx + 6, ky + 2, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawZone7KarpenaiQuarry(ctx, map, pathSplines, w, h) {
  // 7 zona: Karpėnų klinčių karjeras (šviesios uolų terasos + ryškiai žydras karjero vanduo)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#e2dcc8');
  grad.addColorStop(0.55, '#d5ccb2');
  grad.addColorStop(1, '#c2b596');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Klinčių uolų terasų pakopos fone
  ctx.strokeStyle = 'rgba(120, 113, 108, 0.35)';
  ctx.lineWidth = 3;
  for (let ty = 34; ty < h - 20; ty += 108) {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.22)';
    ctx.beginPath();
    ctx.roundRect(18, ty, w - 36, 36, 12);
    ctx.fill();
    ctx.stroke();
  }

  // Ryškiai žydros karjero lagūnos saugiose vietose
  const lagoons = [
    { x: 455, y: 45, rx: 78, ry: 24 },
    { x: 455, y: 455, rx: 78, ry: 24 },
    { x: 145, y: 45, rx: 52, ry: 22 },
    { x: 750, y: 455, rx: 56, ry: 22 }
  ];
  for (const lg of lagoons) {
    if (!isSpotClear(lg.x, lg.y, map, pathSplines, 44, 38, 46)) continue;
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(lg.x, lg.y, lg.rx, lg.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.ellipse(lg.x - 10, lg.y - 2, lg.rx * 0.62, lg.ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Balti klinčių akmenys
  for (let i = 0; i < 16; i += 1) {
    const sx = ((i * 191 + 48) % (w - 110)) + 55;
    const sy = ((i * 117 + 42) % (h - 90)) + 45;
    if (!isSpotClear(sx, sy, map, pathSplines, 34, 30, 38)) continue;
    drawGroundShadow(ctx, sx + 2, sy + 5, 13, 6, 0.22);
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 12, 8, i * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawZone8CosmicSolar(ctx, map, pathSplines, w, h) {
  // 8 zona: Kosminė Saulės Jėgainė (gili kosminė platforma, milžiniškos baterijų eilės, energijos tiltai)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.55, '#0f1035');
  grad.addColorStop(1, '#07061d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Kosminės žvaigždutės tarp platformų
  for (let i = 0; i < 36; i += 1) {
    const sx = ((i * 197 + 25) % (w - 20)) + 10;
    const sy = ((i * 113 + 17) % (h - 20)) + 10;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(250, 204, 21, 0.5)' : 'rgba(196, 181, 253, 0.45)';
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 2) + 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Orbitinės platformos tinklelis
  for (let gx = 28; gx < w - 24; gx += 140) {
    for (let gy = 22; gy < h - 22; gy += 114) {
      ctx.fillStyle = 'rgba(30, 27, 75, 0.48)';
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.22)';
      ctx.lineWidth = 1.4;
      drawRoundedRectPath(ctx, gx, gy, 126, 98, 10);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Milžiniškos saulės baterijų eilės saugiose vietose
  const arraySpots = [
    { x: 145, y: 36 },
    { x: 455, y: 36 },
    { x: 755, y: 36 },
    { x: 145, y: 464 },
    { x: 455, y: 464 },
    { x: 755, y: 464 }
  ];
  for (const s of arraySpots) {
    if (!isSpotClear(s.x, s.y, map, pathSplines, 36, 32, 42)) continue;
    ctx.fillStyle = '#1d4ed8';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.8;
    drawRoundedRectPath(ctx, s.x - 42, s.y - 12, 84, 24, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let ox = -22; ox <= 22; ox += 22) {
      ctx.moveTo(s.x + ox, s.y - 11);
      ctx.lineTo(s.x + ox, s.y + 11);
    }
    ctx.moveTo(s.x - 41, s.y);
    ctx.lineTo(s.x + 41, s.y);
    ctx.stroke();
  }
}

function drawStaticRoads(ctx, engine) {
  const { map, pathSplines } = engine;
  const theme = map.theme || 'courtyard_greenhouse';

  const palettes = {
    courtyard_greenhouse: { shadow: 'rgba(15, 23, 42, 0.24)', border: '#8b6f47', fill: '#e6d3ad', sheen: '#efe0c0' },
    mound_pond: { shadow: 'rgba(15, 23, 42, 0.24)', border: '#876037', fill: '#dfc08b', sheen: '#ead2a7' },
    kurtuvenai_forest: { shadow: 'rgba(2, 6, 23, 0.34)', border: '#543c24', fill: '#9f7c55', sheen: '#b39068' },
    dagilelis_music: { shadow: 'rgba(30, 41, 59, 0.22)', border: '#475569', fill: '#cbd5e1', sheen: '#e2e8f0' },
    solar_future_base: { shadow: 'rgba(2, 6, 23, 0.52)', border: '#0f172a', fill: '#334155', sheen: '#475569' },
    musa_swamp: { shadow: 'rgba(2, 6, 23, 0.42)', border: '#3f2412', fill: '#8a5a36', sheen: '#a16c43' },
    karpenai_quarry: { shadow: 'rgba(15, 23, 42, 0.28)', border: '#64748b', fill: '#f1f5f9', sheen: '#ffffff' },
    cosmic_solar_plant: { shadow: 'rgba(2, 6, 23, 0.62)', border: '#4c1d95', fill: '#312e81', sheen: '#4338ca' }
  };
  const pal = palettes[theme] || palettes.courtyard_greenhouse;

  for (const spline of pathSplines) {
    if (spline.points.length < 2) continue;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const tracePath = () => {
      ctx.beginPath();
      spline.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
    };

    // Kelio 2.5D šešėlis
    ctx.save();
    ctx.translate(0, 4);
    ctx.strokeStyle = pal.shadow;
    ctx.lineWidth = 50;
    tracePath();
    ctx.stroke();
    ctx.restore();

    // Kraštiniai borteliai
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 44;
    tracePath();
    ctx.stroke();

    // Pagrindinė kelio danga
    ctx.strokeStyle = pal.fill;
    ctx.lineWidth = 34;
    ctx.stroke();

    // Viršutinis kelio paviršiaus blizgesys
    ctx.strokeStyle = pal.sheen;
    ctx.lineWidth = 18;
    ctx.stroke();

    // Teminės kelio detalės
    if (theme === 'courtyard_greenhouse') {
      // Sodo žvyro akmenukai
      for (let d = 18; d < spline.totalLength - 18; d += 26) {
        const pt = sampleSplinePoint(spline, d);
        const side = ((Math.round(d) % 2) === 0 ? 1 : -1) * 9;
        const px = pt.x + Math.cos(pt.angle + Math.PI / 2) * side;
        const py = pt.y + Math.sin(pt.angle + Math.PI / 2) * side;
        ctx.fillStyle = 'rgba(139, 111, 71, 0.36)';
        ctx.beginPath();
        ctx.ellipse(px, py, 3.8, 2.3, pt.angle, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'mound_pond') {
      // Tikras medinis lentų lieptas su atraminiais poliais visur, kur kelias eina per tvenkinį
      for (let d = 16; d < spline.totalLength - 16; d += 10) {
        const pt = sampleSplinePoint(spline, d);
        if (!isInsidePondWater(pt.x, pt.y, -2)) continue;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle);

        // Atraminių polių kepurėlės abiejose liepto pusėse kas 30px
        if (Math.round(d) % 30 < 10) {
          ctx.fillStyle = '#5c3415';
          ctx.strokeStyle = '#381e0a';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(0, -22, 4, 0, Math.PI * 2);
          ctx.arc(0, 22, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Medinė skersinė liepto lenta
        ctx.fillStyle = Math.round(d) % 20 === 0 ? '#a86939' : '#965a2f';
        ctx.strokeStyle = '#4a2910';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-3.8, -19, 7.6, 38);
        ctx.strokeRect(-3.8, -19, 7.6, 38);

        // Turėklų sijos
        ctx.fillStyle = '#d49a62';
        ctx.fillRect(-5, -21, 10, 3);
        ctx.fillRect(-5, 18, 10, 3);
        ctx.restore();
      }
    } else if (theme === 'kurtuvenai_forest') {
      // Medinių lentelių pažintinio tako intarpai per mišką ir pelkes
      for (let d = 22; d < spline.totalLength - 22; d += 16) {
        const pt = sampleSplinePoint(spline, d);
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle);
        ctx.fillStyle = '#734b2a';
        ctx.strokeStyle = '#3e2410';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-4, -14, 8, 28);
        ctx.strokeRect(-4, -14, 8, 28);
        ctx.restore();
      }
    } else if (theme === 'musa_swamp') {
      // Mūšos tyrelio medinių lentų pažintinis takas su kuolais
      for (let d = 16; d < spline.totalLength - 16; d += 11) {
        const pt = sampleSplinePoint(spline, d);
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle);
        if (Math.round(d) % 33 < 11) {
          ctx.fillStyle = '#452712';
          ctx.beginPath();
          ctx.arc(0, -19, 3.3, 0, Math.PI * 2);
          ctx.arc(0, 19, 3.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = Math.round(d) % 22 === 0 ? '#9c683f' : '#855530';
        ctx.strokeStyle = '#3b210d';
        ctx.lineWidth = 1.1;
        ctx.fillRect(-4, -16, 8, 32);
        ctx.strokeRect(-4, -16, 8, 32);
        ctx.restore();
      }
    } else if (theme === 'karpenai_quarry') {
      // Klinčių skalda kelio pakraščiuose
      for (let d = 18; d < spline.totalLength - 18; d += 24) {
        const pt = sampleSplinePoint(spline, d);
        const side = ((Math.round(d) % 2) === 0 ? 1 : -1) * 11;
        const px = pt.x + Math.cos(pt.angle + Math.PI / 2) * side;
        const py = pt.y + Math.sin(pt.angle + Math.PI / 2) * side;
        ctx.fillStyle = 'rgba(100, 116, 139, 0.42)';
        ctx.beginPath();
        ctx.ellipse(px, py, 3.5, 2.2, pt.angle, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'dagilelis_music') {
      // Subtilūs pianino klavišai kelio pakraščiuose ir penklinė viduryje
      for (let d = 16; d < spline.totalLength - 16; d += 14) {
        const pt = sampleSplinePoint(spline, d);
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle);
        const isBlack = (Math.floor(d / 14) % 2) === 0;
        ctx.fillStyle = isBlack ? '#1e293b' : '#f8fafc';
        ctx.fillRect(-5, -21, 10, 5);
        ctx.fillRect(-5, 16, 10, 5);
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1.1;
      tracePath();
      ctx.stroke();
      ctx.restore();
    } else if (theme === 'solar_future_base' || theme === 'cosmic_solar_plant') {
      ctx.save();
      ctx.shadowColor = theme === 'cosmic_solar_plant' ? '#c084fc' : '#38bdf8';
      ctx.shadowBlur = 11;
      ctx.strokeStyle = theme === 'cosmic_solar_plant' ? 'rgba(192, 132, 252, 0.72)' : 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 2.8;
      tracePath();
      ctx.stroke();
      ctx.restore();
    }
  }
}

function renderStaticBackdrop(ctx, engine, w, h) {
  const { map, pathSplines } = engine;
  const theme = map.theme || 'courtyard_greenhouse';

  if (theme === 'courtyard_greenhouse') {
    drawZone1Courtyard(ctx, map, pathSplines, w, h);
  } else if (theme === 'mound_pond') {
    drawZone2MoundAndPond(ctx, map, pathSplines, w, h);
  } else if (theme === 'kurtuvenai_forest') {
    drawZone3Forest(ctx, map, pathSplines, w, h);
  } else if (theme === 'dagilelis_music') {
    drawZone4MusicPlaza(ctx, map, pathSplines, w, h);
  } else if (theme === 'musa_swamp') {
    drawZone6MusaSwamp(ctx, map, pathSplines, w, h);
  } else if (theme === 'karpenai_quarry') {
    drawZone7KarpenaiQuarry(ctx, map, pathSplines, w, h);
  } else if (theme === 'cosmic_solar_plant') {
    drawZone8CosmicSolar(ctx, map, pathSplines, w, h);
  } else {
    drawZone5FutureBase(ctx, map, pathSplines, w, h);
  }

  drawStaticRoads(ctx, engine);
}

function renderSceneBackdrop(ctx, engine, w, h) {
  const key = `${engine.mapId}_${w}x${h}`;
  let cached = backdropCache.get(key);
  if (!cached) {
    const offCanvas = createBackdropCanvas(w, h);
    if (offCanvas) {
      const bCtx = offCanvas.getContext('2d');
      if (bCtx && typeof bCtx.createLinearGradient === 'function') {
        renderStaticBackdrop(bCtx, engine, w, h);
        cached = { canvas: offCanvas };
        backdropCache.set(key, cached);
      }
    }
  }
  if (cached?.canvas) {
    ctx.drawImage(cached.canvas, 0, 0);
  } else {
    renderStaticBackdrop(ctx, engine, w, h);
  }
}

// ==================== GYVI APLINKOS EFEKTAI, VARTAI IR TVIRTOVĖ ====================

function renderLiveAmbientLayer(ctx, engine, w, h, animClock) {
  const theme = engine.map.theme || 'courtyard_greenhouse';
  ctx.save();

  // Lengvai plaukiantys debesėlių šešėliai (dienos zonose)
  if (theme !== 'solar_future_base' && theme !== 'cosmic_solar_plant') {
    for (let c = 0; c < 2; c += 1) {
      const cx = ((animClock * 16 + c * 460) % (w + 260)) - 130;
      const cy = 135 + c * 210;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.055)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 120, 44, -0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (theme === 'courtyard_greenhouse') {
    // Šiltnamio stogo atspindys ir auksinės žiedadulkės
    ctx.save();
    drawRoundedRectPath(ctx, 710, 14, 128, 58, 12);
    ctx.clip();
    const sweep = ((animClock * 44) % 210) - 55;
    const glintGrad = ctx.createLinearGradient(710 + sweep, 10, 755 + sweep, 80);
    glintGrad.addColorStop(0, 'rgba(255,255,255,0)');
    glintGrad.addColorStop(0.5, 'rgba(255,255,255,0.42)');
    glintGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glintGrad;
    ctx.fillRect(710, 14, 128, 58);
    ctx.restore();

    for (let i = 0; i < 10; i += 1) {
      const px = ((i * 97 + animClock * 18) % (w - 20)) + 10;
      const py = ((i * 63 + Math.sin(animClock + i) * 20 + animClock * 9) % (h - 20)) + 10;
      ctx.fillStyle = `rgba(254, 240, 138, ${0.32 + 0.22 * Math.sin(animClock * 2.5 + i)})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'mound_pond') {
    // Raibuliuojantys tvenkinio ratilai ir blizgantys vandens atspindžiai
    for (let r = 0; r < 3; r += 1) {
      const cyc = (animClock * 0.42 + r * 0.33) % 1;
      const rr = 22 + cyc * 88;
      ctx.strokeStyle = `rgba(224, 242, 254, ${(1 - cyc) * 0.42})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(455, 255, rr, rr * 0.56, 0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (theme === 'kurtuvenai_forest') {
    // Vėjo nešami miško lapeliai
    for (let l = 0; l < 8; l += 1) {
      const lx = ((l * 127 + animClock * 22) % (w - 20)) + 10;
      const ly = ((l * 73 + Math.sin(animClock * 1.8 + l) * 26 + animClock * 12) % (h - 20)) + 10;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(animClock * 1.4 + l);
      ctx.fillStyle = l % 2 === 0 ? 'rgba(134, 239, 172, 0.48)' : 'rgba(253, 224, 71, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.2, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (theme === 'musa_swamp') {
    // Kylantis pelkės rūkas ir švytinčios žaltvykslės
    for (let m = 0; m < 4; m += 1) {
      const mx = ((animClock * 14 + m * 240) % (w + 220)) - 110;
      const my = 90 + m * 95 + Math.sin(animClock * 0.7 + m) * 14;
      ctx.fillStyle = 'rgba(204, 251, 241, 0.12)';
      ctx.beginPath();
      ctx.ellipse(mx, my, 110, 32, 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let f = 0; f < 9; f += 1) {
      const fx = ((f * 107 + Math.sin(animClock + f) * 32) % (w - 30)) + 15;
      const fy = ((f * 61 + animClock * 10) % (h - 30)) + 15;
      ctx.fillStyle = `rgba(94, 234, 212, ${0.35 + 0.3 * Math.sin(animClock * 3 + f)})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'karpenai_quarry') {
    // Saulės atspindžiai karjere
    for (let i = 0; i < 8; i += 1) {
      const qx = ((i * 119 + animClock * 16) % (w - 30)) + 15;
      const qy = ((i * 67 + Math.sin(animClock * 1.2 + i) * 14) % (h - 30)) + 15;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + 0.2 * Math.sin(animClock * 2.8 + i)})`;
      ctx.beginPath();
      ctx.arc(qx, qy, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'dagilelis_music') {
    // Plaukiančios muzikinės natos virš aikštės
    const noteChars = ['♪', '♫', '♬'];
    for (let n = 0; n < 7; n += 1) {
      const nx = 85 + n * 112 + Math.sin(animClock * 1.5 + n) * 14;
      const ny = 470 - ((animClock * 24 + n * 62) % 440);
      ctx.fillStyle = n % 2 === 0 ? 'rgba(190, 18, 60, 0.35)' : 'rgba(180, 83, 9, 0.35)';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(noteChars[n % noteChars.length], nx, ny);
    }
  } else if (theme === 'solar_future_base' || theme === 'cosmic_solar_plant') {
    // Tekančios energijos linijos ant neoninių kelių
    ctx.save();
    ctx.strokeStyle = theme === 'cosmic_solar_plant' ? 'rgba(250, 204, 21, 0.85)' : 'rgba(251, 191, 36, 0.78)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([18, 28]);
    ctx.lineDashOffset = -animClock * 52;
    for (const spline of engine.pathSplines) {
      if (spline.points.length < 2) continue;
      ctx.beginPath();
      spline.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

function renderEntranceGates25D(ctx, engine, animClock) {
  const theme = engine.map.theme || 'courtyard_greenhouse';
  const isSciFi = theme === 'solar_future_base' || theme === 'cosmic_solar_plant';

  for (const spline of engine.pathSplines) {
    const entry = spline.points?.[0];
    if (!entry) continue;

    ctx.save();
    drawGroundShadow(ctx, entry.x + 2, entry.y + 8, 17, 10, 0.35);
    ctx.translate(entry.x, entry.y);

    // 2.5D įėjimo vartų stulpeliai ir arka
    const postCol = isSciFi ? '#334155' : theme === 'dagilelis_music' ? '#78350f' : '#6b4226';
    const trimCol = isSciFi ? '#38bdf8' : '#fde047';
    ctx.fillStyle = postCol;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    drawRoundedRectPath(ctx, -14, -20, 7, 40, 3);
    ctx.fill();
    ctx.stroke();

    // Viršutinis vartų ženklas ir animuota rodyklė į kelią
    ctx.save();
    ctx.rotate(entry.angle || 0);
    const arrowShift = Math.sin(animClock * 4.5) * 3;
    ctx.fillStyle = isSciFi ? '#ef4444' : '#f97316';
    ctx.strokeStyle = trimCol;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2 + arrowShift, -9);
    ctx.lineTo(17 + arrowShift, 0);
    ctx.lineTo(2 + arrowShift, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // Būsimos bangos peržiūros burbulas
    if (engine.nextWavePreview && engine.canCallWaveEarly()) {
      const pulseScale = 1 + Math.sin(animClock * 5) * 0.1;
      ctx.save();
      ctx.translate(entry.x + 22, entry.y);
      ctx.scale(pulseScale, pulseScale);
      ctx.fillStyle = engine.nextWavePreview.hasBoss ? 'rgba(190, 18, 60, 0.95)' : 'rgba(180, 83, 9, 0.95)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '14px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(engine.nextWavePreview.primaryIcon || '⚠️', 0, 1);
      ctx.restore();
    }
  }
}

function renderFortress25D(ctx, engine, animClock) {
  const exits = getZoneExits(engine.map, engine.pathSplines);
  const theme = engine.map.theme || 'courtyard_greenhouse';
  const hitTimer = engine.fortressHitTimer || 0;

  for (const exitPt of exits) {
    const jitterX = hitTimer > 0 ? Math.sin(animClock * 58) * (4.5 * (hitTimer / 0.45)) : 0;
    const fx = exitPt.x + jitterX;
    const fy = exitPt.y;

    drawGroundShadow(ctx, fx + 3, fy + 16, 31, 13, 0.4);
    ctx.save();
    ctx.translate(fx, fy);

    if (hitTimer > 0) {
      ctx.strokeStyle = `rgba(244, 63, 94, ${Math.min(0.85, hitTimer * 2).toFixed(2)})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (theme === 'solar_future_base' || theme === 'cosmic_solar_plant') {
      // 5 ir 8 zonos futuristinis Saulės Bokšto komandos centras
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = theme === 'cosmic_solar_plant' ? '#c084fc' : '#38bdf8';
      ctx.lineWidth = 2.6;
      drawRoundedRectPath(ctx, -24, -22, 48, 44, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tikras 2.5D Bubių Tvirtovės bokštas / namelis su vėjyje plevėsuojančia vėliavėle
      // Akmeninis pamatas ir sienos
      ctx.fillStyle = '#e7dcc8';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.4;
      drawRoundedRectPath(ctx, -23, -15, 46, 34, 6);
      ctx.fill();
      ctx.stroke();

      // Gynybiniai dantukai viršuje
      ctx.fillStyle = '#cbd5e1';
      for (let bx = -22; bx <= 14; bx += 12) {
        ctx.fillRect(bx, -21, 8, 7);
        ctx.strokeRect(bx, -21, 8, 7);
      }

      // Šlaitinis čerpių stogas
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-26, -13);
      ctx.lineTo(0, -33);
      ctx.lineTo(26, -13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Arkiniai mediniai vartai (žiūri į kelią)
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-10, 19);
      ctx.lineTo(-10, 4);
      ctx.arc(0, 4, 10, Math.PI, 0);
      ctx.lineTo(10, 19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Šilti šviečiantys langeliai
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-19, -5, 6, 8);
      ctx.fillRect(13, -5, 6, 8);
    }

    // Stiebas ir vėjyje plevėsuojanti vėliavėlė
    const wave = Math.sin(animClock * 6 + fx * 0.05) * 4;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(0, -50);
    ctx.stroke();

    ctx.fillStyle = engine.map.accentColor || '#22c55e';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(1, -50);
    ctx.quadraticCurveTo(10, -49 + wave * 0.5, 20, -45 + wave);
    ctx.lineTo(1, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

function renderBuildPads25D(ctx, engine, animClock) {
  const theme = engine.map.theme || 'courtyard_greenhouse';
  const isSciFi = theme === 'solar_future_base' || theme === 'cosmic_solar_plant';

  engine.map.pads.forEach((pad, idx) => {
    if (engine.getTowerAtPad(idx)) return;
    const isSelected = engine.selectedPadIndex === idx;
    const isHovered = engine.hoveredPadIndex === idx;
    const liftY = isHovered || isSelected ? -2 : 0;

    drawGroundShadow(ctx, pad.x + 2, pad.y + 6, 24, 15, 0.34);

    ctx.save();
    ctx.translate(pad.x, pad.y + liftY);

    // 2.5D akmeninė / futuristinė aikštelės plokštė
    ctx.fillStyle = isSciFi ? '#1e293b' : '#b7a688';
    ctx.strokeStyle = isSelected ? '#fde047' : isHovered ? '#38bdf8' : isSciFi ? '#38bdf8' : '#645238';
    ctx.lineWidth = isSelected || isHovered ? 3 : 2;
    drawRoundedRectPath(ctx, -22, -16, 44, 34, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isSciFi ? '#334155' : '#e5dac3';
    drawRoundedRectPath(ctx, -18, -13, 36, 26, 8);
    ctx.fill();

    // Švelnus paryškinimas užvedus arba pasirinkus
    if (isSelected || isHovered) {
      const pulse = 0.25 + 0.15 * Math.sin(animClock * 6);
      ctx.fillStyle = isSelected ? `rgba(253, 224, 71, ${pulse.toFixed(2)})` : `rgba(56, 189, 248, ${pulse.toFixed(2)})`;
      drawRoundedRectPath(ctx, -18, -13, 36, 26, 8);
      ctx.fill();
    }

    // Aiški statybos plaktuko piktograma viduryje
    ctx.save();
    ctx.rotate(-0.35);
    ctx.strokeStyle = isSciFi ? '#cbd5e1' : '#78350f';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(0, -6);
    ctx.stroke();
    ctx.fillStyle = isSciFi ? '#38bdf8' : '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    drawRoundedRectPath(ctx, -7, -10, 14, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  });
}

function renderBonusZones25D(ctx, engine, animClock) {
  const zones = engine.bonusZones || [];
  for (const z of zones) {
    const isGold = z.kind === 'gold';
    const isActiveHover = engine.hoveredBonusZoneId === z.id || engine.selectedBonusZoneId === z.id;
    const isDone = isGold && z.claimed;
    const pulse = 0.65 + 0.35 * Math.sin(animClock * 3.8 + z.x * 0.02);

    ctx.save();

    // Veikimo spindulio apžvalga užvedus pelę ar bakstelėjus
    if (isActiveHover) {
      ctx.save();
      ctx.strokeStyle = isGold ? 'rgba(250, 204, 21, 0.82)' : 'rgba(56, 189, 248, 0.85)';
      ctx.fillStyle = isGold ? 'rgba(250, 204, 21, 0.10)' : 'rgba(56, 189, 248, 0.10)';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.effectRadius || 86, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.globalAlpha = isDone ? 0.45 : 1;

    // Auksinis / elektrinis žiedo švytėjimas ant žemės
    const auraGrad = ctx.createRadialGradient(z.x, z.y, 4, z.x, z.y, 26);
    if (isGold) {
      auraGrad.addColorStop(0, `rgba(254, 240, 138, ${(0.58 * pulse).toFixed(2)})`);
      auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    } else {
      auraGrad.addColorStop(0, `rgba(125, 211, 252, ${(0.58 * pulse).toFixed(2)})`);
      auraGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');
    }
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(z.x, z.y, 26, 0, Math.PI * 2);
    ctx.fill();

    // Kylančios kibirkštėlės
    if (!isDone) {
      for (let s = 0; s < 3; s += 1) {
        const sp = (animClock * 0.9 + s * 0.33 + z.y * 0.01) % 1;
        const sx = z.x + Math.sin(s * 2.1 + animClock * 3) * 11;
        const sy = z.y - 4 - sp * 18;
        ctx.fillStyle = isGold ? '#fef08a' : '#7dd3fc';
        ctx.globalAlpha = 1 - sp;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Teminis medalionas (+🪙 arba +⚡)
    drawGroundShadow(ctx, z.x + 1, z.y + 6, 15, 7, 0.3);
    ctx.fillStyle = isGold ? '#f59e0b' : '#0284c7';
    ctx.strokeStyle = isGold ? '#fef08a' : '#bae6fd';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(z.x, z.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isDone ? '✓' : z.icon, z.x, z.y + 0.5);

    // Aiški įskaitoma žyma šalia (+🪙 / +⚡)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = isGold ? '#fde047' : '#38bdf8';
    ctx.lineWidth = 1.4;
    drawRoundedRectPath(ctx, z.x - 19, z.y + 13, 38, 15, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isGold ? '#fef08a' : '#bae6fd';
    ctx.font = 'bold 10px Outfit, sans-serif';
    ctx.fillText(isDone ? 'Paimta' : z.badge, z.x, z.y + 21);

    ctx.restore();
  }
}

// ==================== 3. 2.5D BOKŠTELIAI SU ATATRANKA IR LYGIO POKYČIAIS ====================
function renderTower25D(ctx, tower, isSelected, animClock) {
  const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
  if (!stats) return;
  const priorityMeta = getTargetingPriorityMeta(tower.priority);
  const lvl = tower.level || 1;
  const baseRadius = 22 + (lvl >= 3 ? 2 : 0) + (lvl === 4 ? 2 : 0);

  ctx.save();

  // Krintantis 2.5D šešėlis
  drawGroundShadow(ctx, tower.x + 4, tower.y + 9, baseRadius + 5, baseRadius * 0.78, 0.45);

  // 4-ojo lygio neoninis švytėjimas aplink pagrindą
  if (lvl === 4) {
    ctx.save();
    ctx.shadowColor = stats.color;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = stats.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, baseRadius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Iliustruotas 2.5D bokštelio postamentas ir besisukantis / reaguojantis pabūklas
  drawTowerBaseSprite(ctx, tower, animClock, isSelected);
  drawTowerTurretSprite(ctx, tower, animClock);

  // Lygio žvaigždutės virš bokšto
  ctx.font = 'bold 10px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
  const starStr = lvl === 4 ? '✦✦✦✦' : '★'.repeat(lvl);
  ctx.strokeText(starStr, tower.x, tower.y - baseRadius - 11);
  ctx.fillStyle = lvl === 4 ? '#f472b6' : '#fde047';
  ctx.fillText(starStr, tower.x, tower.y - baseRadius - 11);

  // Prioriteto piktograma
  ctx.font = '12px Outfit, sans-serif';
  ctx.fillText(priorityMeta.icon, tower.x + 19, tower.y + 18);

  if (tower.silencedTimer > 0) {
    ctx.font = '14px Outfit, sans-serif';
    ctx.fillText('🔇', tower.x - 19, tower.y - 16);
  } else if (tower.isJammed) {
    ctx.font = '12px Outfit, sans-serif';
    ctx.fillText('👺', tower.x - 19, tower.y - 16);
  }

  if (tower.speedAuraPct > 0 || tower.rangeAuraPct > 0) {
    ctx.font = 'bold 9.5px Outfit, sans-serif';
    const auraTxt = [
      tower.speedAuraPct > 0 ? `+${tower.speedAuraPct}%⚡` : '',
      tower.rangeAuraPct > 0 ? `+${tower.rangeAuraPct}%🔭` : ''
    ]
      .filter(Boolean)
      .join(' ');
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.lineWidth = 2.4;
    ctx.strokeText(auraTxt, tower.x, tower.y + baseRadius + 10);
    ctx.fillStyle = '#fef08a';
    ctx.fillText(auraTxt, tower.x, tower.y + baseRadius + 10);
  }

  ctx.restore();
}

// ==================== 4. 2.5D PRIEŠAI IR BOSAI ====================
function renderEnemy25D(ctx, enemy, animClock) {
  ctx.save();

  // Po žeme panėręs Kurmis
  if (enemy.burrowTimer > 0) {
    drawGroundShadow(ctx, enemy.x, enemy.y + 5, enemy.radius * 1.15, 5, 0.35);
    drawEnemySprite(ctx, enemy, animClock);
    ctx.restore();
    return;
  }

  if (enemy.jamAuraRadius > 0) {
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.jamAuraRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Šešėlis po priešu
  if (enemy.isFlying) {
    drawGroundShadow(ctx, enemy.x + 2, enemy.y + 20, enemy.radius * 0.9, 5, 0.42);
  } else {
    drawGroundShadow(ctx, enemy.x + 2, enemy.y + enemy.radius * 0.85, enemy.radius * 1.05, enemy.radius * 0.48, 0.38);
  }

  // Iliustruotas SVG personažas su kryptimi ir animacija
  drawEnemySprite(ctx, enemy, animClock);

  // Švari HP juostelė PASIRODO TIK GAVUS ŽALOS
  const hasTakenDamage =
    enemy.hp < enemy.maxHp - 0.01 ||
    (enemy.maxShield > 0 && enemy.shield < enemy.maxShield - 0.01);

  const spriteHalfH = enemy.isBoss ? 34 : Math.max(15, enemy.radius * 1.45);
  const barW = Math.max(26, enemy.radius * 2.35);
  const barY = enemy.y - spriteHalfH - 8;

  if (hasTakenDamage) {
    const ratio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    drawRoundedRectPath(ctx, enemy.x - barW / 2 - 1, barY - 1, barW + 2, 6, 3);
    ctx.fill();

    ctx.fillStyle = enemy.isBoss ? '#facc15' : ratio > 0.45 ? '#4ade80' : '#f87171';
    drawRoundedRectPath(ctx, enemy.x - barW / 2, barY, Math.max(2, barW * ratio), 4, 2);
    ctx.fill();

    if (enemy.maxShield > 0 && enemy.shield > 0) {
      const sRatio = Math.max(0, Math.min(1, enemy.shield / enemy.maxShield));
      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      drawRoundedRectPath(ctx, enemy.x - barW / 2 - 1, barY - 6, barW + 2, 4.5, 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      drawRoundedRectPath(ctx, enemy.x - barW / 2, barY - 5.2, Math.max(2, barW * sRatio), 3, 1.5);
      ctx.fill();
    }
  }

  // Būsenos ir savybių piktogramos (šarvai, veidrodis, gydytojas, ledas, apsvaiginimas, bosas, camo)
  const badges = [];
  if (enemy.isBoss) badges.push('👑');
  if (enemy.isCamo) badges.push('👁️');
  if ((enemy.armor || 0) >= 0.25) badges.push('🛡️');
  if ((enemy.energyResist || 0) >= 0.5) badges.push('🪞');
  if ((enemy.healInterval || 0) > 0) badges.push('💚');
  if (enemy.slowTimer > 0) badges.push('❄️');
  if (enemy.stunTimer > 0) badges.push('💫');

  if (badges.length > 0) {
    const badgeY = hasTakenDamage ? barY - 9 : enemy.y - spriteHalfH - 8;
    ctx.font = '10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badges.join(''), enemy.x, badgeY);
  }

  ctx.restore();
}

// ==================== PAGRINDINĖ SCENOS PIEŠIMO FUNKCIJA ====================
export function renderBattleScene(engine) {
  const ctx = engine.ctx;
  const canvas = engine.canvas;
  if (!ctx || !canvas) return;

  const w = canvas.width || 900;
  const h = canvas.height || 500;
  const { animClock } = engine;

  ctx.save();

  // Ekrano virptelėjimas (screen shake)
  if ((engine.shakeTimer || 0) > 0) {
    ctx.translate(engine.shakeOffsetX || 0, engine.shakeOffsetY || 0);
  }

  // 1. Iš anksto sugeneruotas 5 zonų kraštovaizdis + keliai (Offscreen / Memory Canvas cache)
  renderSceneBackdrop(ctx, engine, w, h);

  // 2. Gyvos aplinkos detalės (plaukiantys debesėliai, žiedadulkės, raibuliai, natos)
  renderLiveAmbientLayer(ctx, engine, w, h, animClock);

  // Gleivių pėdsakas su blizgesiu
  for (const puddle of engine.slimePuddles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, puddle.life / puddle.maxLife) * 0.58;
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.ellipse(puddle.x, puddle.y + 4, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(236, 252, 203, 0.55)';
    ctx.beginPath();
    ctx.ellipse(puddle.x - 4, puddle.y + 2, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Animuoti kelio vartai (Startas) ir 2.5D Bubių Tvirtovė (Finišas)
  renderEntranceGates25D(ctx, engine, animClock);
  renderFortress25D(ctx, engine, animClock);

  // 4. Veikimo spindulio peržiūra
  if (engine.selectedPadIndex !== null && engine.map.pads[engine.selectedPadIndex]) {
    const pad = engine.map.pads[engine.selectedPadIndex];
    const existingTower = engine.getTowerAtPad(engine.selectedPadIndex);
    if (existingTower) {
      const stats = getTowerStats(existingTower.type, existingTower.level, existingTower.evolutionId);
      if (stats) {
        const effR = existingTower.effectiveRange || stats.range;
        engine.drawRangeCircle(ctx, pad.x, pad.y, effR, stats.color, false);
        if (existingTower.level < 3) {
          const nextStats = getTowerStats(existingTower.type, existingTower.level + 1);
          if (nextStats && nextStats.range > stats.range) {
            engine.drawRangeCircle(ctx, pad.x, pad.y, nextStats.range, '#4ade80', true);
          }
        }
      }
    } else {
      const previewStats = getTowerStats(engine.previewTowerType, 1);
      if (previewStats) {
        engine.drawRangeCircle(ctx, pad.x, pad.y, previewStats.range, previewStats.color, false);
      }
    }
  }

  // 5. Aiškios bonusinės zonos (+🪙 / +⚡) ir 2.5D statybos aikštelės su plaktuku
  renderBonusZones25D(ctx, engine, animClock);
  renderBuildPads25D(ctx, engine, animClock);

  // 6. Garso bangos (su kylančių natų žiedais) ir sprogimai
  for (const pulse of engine.pulses) {
    const p = 1 - pulse.life / pulse.maxLife;
    const r = pulse.maxRadius * p;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - p) * 0.78;
    ctx.strokeStyle = pulse.color;
    ctx.lineWidth = 4.5 * (1 - p * 0.45);
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = Math.max(0, 1 - p) * 0.35;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    if (pulse.isMusical) {
      ctx.globalAlpha = Math.max(0, 1 - p * 0.85);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 15px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let n = 0; n < 6; n += 1) {
        const ang = (n * Math.PI) / 3 + p * 1.6;
        const lift = p * 16;
        const note = n % 3 === 0 ? '♪' : n % 3 === 1 ? '♫' : '♬';
        ctx.fillText(note, pulse.x + Math.cos(ang) * r, pulse.y + Math.sin(ang) * r - lift);
      }
    } else if (pulse.isHealWave) {
      ctx.globalAlpha = Math.max(0, (1 - p) * 0.35);
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = Math.max(0, 1 - p * 0.8);
      ctx.fillStyle = '#bbf7d0';
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let n = 0; n < 6; n += 1) {
        const ang = (n * Math.PI) / 3 + p * 1.1;
        const lift = p * 14;
        const glyph = n % 2 === 0 ? '+' : '💚';
        ctx.fillText(glyph, pulse.x + Math.cos(ang) * (r * 0.72), pulse.y + Math.sin(ang) * (r * 0.72) - lift);
      }
    } else if (pulse.isBossPhase) {
      ctx.globalAlpha = Math.max(0, (1 - p) * 0.9);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = Math.max(2, (1 - p) * 6);
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, r * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let n = 0; n < 8; n += 1) {
        const ang = (n * Math.PI) / 4 + p * 2.2;
        ctx.fillText('✦', pulse.x + Math.cos(ang) * r, pulse.y + Math.sin(ang) * r);
      }
    }
    ctx.restore();
  }

  for (const exp of engine.explosions) {
    const p = 1 - exp.life / exp.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - p) * 0.55;
    ctx.fillStyle = exp.color;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius * (0.35 + p * 0.65), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // 7. Dronų radaras & Barakų robotai-vejapjovės
  for (const tower of engine.towers) {
    const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
    if (tower.type === 'drone_hangar') {
      const radR = stats.camoRevealRadius || 160;
      ctx.save();
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, radR, 0, Math.PI * 2);
      ctx.stroke();

      const ang = tower.radarAngle || 0;
      const sweepGrad = ctx.createRadialGradient(tower.x, tower.y, 10, tower.x, tower.y, radR);
      sweepGrad.addColorStop(0, 'rgba(45, 212, 191, 0.24)');
      sweepGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y);
      ctx.arc(tower.x, tower.y, radR, ang - 0.35, ang);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(45, 212, 191, 0.55)';
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y);
      ctx.lineTo(tower.x + Math.cos(ang) * radR, tower.y + Math.sin(ang) * radR);
      ctx.stroke();
      ctx.restore();
    } else if (tower.type === 'mower_barracks' && tower.rallyPoint) {
      ctx.save();
      ctx.strokeStyle = 'rgba(22, 163, 74, 0.48)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tower.x, tower.y);
      ctx.lineTo(tower.rallyPoint.x, tower.rallyPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '15px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚩', tower.rallyPoint.x, tower.rallyPoint.y - 14);
      ctx.restore();

      for (const u of tower.units) {
        if (u.respawnTimer > 0) continue;
        drawGroundShadow(ctx, u.x + 2, u.y + 5, 11, 5, 0.4);
        ctx.save();
        if (stats.electroAuraDps > 0) {
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(u.x, u.y, stats.electroAuraRadius || 60, 0, Math.PI * 2);
          ctx.stroke();
        }
        drawMowerUnitSprite(ctx, u, tower, animClock);

        if (u.hp < u.maxHp - 0.1) {
          const uRatio = Math.max(0, Math.min(1, u.hp / u.maxHp));
          ctx.fillStyle = '#020617';
          ctx.fillRect(u.x - 10, u.y - 16, 20, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(u.x - 10, u.y - 16, 20 * uRatio, 4);
        }
        ctx.restore();
      }
    }
  }

  // 8. 2.5D Pastatyti bokšteliai
  for (const tower of engine.towers) {
    renderTower25D(ctx, tower, engine.selectedPadIndex === tower.padIndex, animClock);
  }

  // 9. Saulės Lazerio spinduliai
  for (const tower of engine.towers) {
    if (tower.type === 'solar_laser' && Array.isArray(tower.activeBeams)) {
      for (const b of tower.activeBeams) {
        const coreW = 2.2 + (b.ramp - 1) * 2.2;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = coreW + 5;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();

        ctx.shadowBlur = 8;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = coreW;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x2, b.y2, 3.5 + (b.ramp - 1) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  for (const beam of engine.beams) {
    const alpha = Math.max(0, beam.life / beam.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = beam.color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = beam.color;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(beam.x1, beam.y1);
    ctx.lineTo(beam.x2, beam.y2);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }

  for (const bolt of engine.lightningBolts) {
    const alpha = Math.max(0, bolt.life / bolt.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bolt.x1, bolt.y1);
    ctx.lineTo(bolt.x1 - 14, bolt.y2 * 0.35);
    ctx.lineTo(bolt.x1 + 12, bolt.y2 * 0.68);
    ctx.lineTo(bolt.x2, bolt.y2);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // 10. 2.5D Priešai ir Bosai
  for (const enemy of engine.enemies) {
    renderEnemy25D(ctx, enemy, animClock);
  }

  // 11. Skraidantys Dronų Angaro mini dronai
  for (const tower of engine.towers) {
    if (tower.type === 'drone_hangar') {
      for (const d of tower.drones) {
        drawGroundShadow(ctx, d.x + 2, d.y + 18, 9, 4, 0.38);
        drawDroneUnitSprite(ctx, d, tower, animClock);
      }
    }
  }

  // 12. Sviediniai ir katapultos šūviai
  for (const proj of engine.projectiles) {
    ctx.save();
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = proj.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  for (const shot of engine.parabolicShots) {
    drawGroundShadow(ctx, shot.x, shot.groundY, 7, 3, 0.45);
    ctx.save();
    ctx.fillStyle = shot.color;
    ctx.strokeStyle = '#e0e7ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 12b. Dalelių sistema
  if (Array.isArray(engine.particles)) {
    for (const pt of engine.particles) {
      const lifeRatio = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = lifeRatio;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.8, pt.size * lifeRatio), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 13. Kylantys žalos ir aukso skaičiukai
  for (const ft of engine.floatingTexts) {
    const lifeRatio = Math.max(0, ft.life / ft.maxLife);
    const popScale = lifeRatio > 0.85 ? 1 + (1 - lifeRatio) * 1.4 : 1;
    ctx.save();
    ctx.translate(ft.x, ft.y);
    ctx.scale(popScale, popScale);
    ctx.globalAlpha = lifeRatio;
    ctx.font = ft.font || 'bold 14px Fredoka, Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.strokeText(ft.text, 0, 0);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, 0, 0);
    ctx.restore();
  }

  // 14. Rally Point arba Pauzės uždanga
  if (engine.placingRallyPadIndex !== null && !engine.gameResult) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    drawRoundedRectPath(ctx, w / 2 - 225, 12, 450, 36, 12);
    ctx.fill();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#bbf7d0';
    ctx.font = '700 15px Fredoka, Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚩 Paspausk ant kelio spindulyje, kad perkeltum robotus!', w / 2, 30);
    ctx.restore();
  } else if (engine.manualPaused && !engine.gameResult) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.42)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 28px Fredoka, Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏸ ŽAIDIMAS SUSTABDYTAS', w / 2, h / 2);
    ctx.restore();
  }

  ctx.restore();
}
