// ==================== BUBIŲ TVIRTOVĖ: MODERNUS 2.5D CANVAS PIEŠIMO VARIKLIS ====================
// Daugiasluoksniai keliai, gyva zonos aplinka, bokštelių atatranka ir lygio vizualika,
// plazmos/garso/dronų šviesos efektai, dalelių sistema, ekrano virptelėjimas ir žalos skaičiai.

import {
  getTowerStats,
  getTargetingPriorityMeta,
  renderMapThemeDecorations
} from './balance.js?v=20261121g';

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

function drawGroundShadow(ctx, x, y, rx, ry, alpha = 0.42) {
  ctx.save();
  ctx.fillStyle = `rgba(2, 6, 23, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ==================== 1. GYVOS ZONOS APLINKOS DEKORACIJOS ====================
function renderAnimatedZoneEnvironment(ctx, map, animClock) {
  renderMapThemeDecorations(ctx, map, animClock);
  const theme = map.theme || 'courtyard_greenhouse';

  ctx.save();

  if (theme === 'courtyard_greenhouse') {
    // Blizgantis šiltnamio stogo atspindys (polikarbonato blyksnis)
    ctx.save();
    drawRoundedRectPath(ctx, 690, 28, 128, 72, 14);
    ctx.clip();
    const sweep = ((animClock * 46) % 210) - 55;
    const glintGrad = ctx.createLinearGradient(690 + sweep, 20, 735 + sweep, 105);
    glintGrad.addColorStop(0, 'rgba(255,255,255,0)');
    glintGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.32)');
    glintGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glintGrad;
    ctx.fillRect(690, 28, 128, 72);
    ctx.restore();

    // Švelniai siūbuojantys šilauogių krūmai ir auksinės žiedadulkės
    const bushes = [
      { x: 158, y: 42 },
      { x: 196, y: 458 },
      { x: 642, y: 446 },
      { x: 754, y: 122 }
    ];
    bushes.forEach((b, idx) => {
      const sway = Math.sin(animClock * 2.1 + idx * 1.3) * 2.2;
      drawGroundShadow(ctx, b.x + 2, b.y + 7, 13, 6, 0.35);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(b.x + sway, b.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(b.x + sway - 3, b.y - 3, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(b.x + sway + 3, b.y + 1, 2.5, 0, Math.PI * 2);
      ctx.arc(b.x + sway - 4, b.y + 3, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Kylančios saulėtos žiedadulkės
    for (let i = 0; i < 10; i++) {
      const px = ((i * 97 + animClock * 16) % 880) + 10;
      const py = ((i * 63 + Math.sin(animClock + i) * 24 + animClock * 8) % 480) + 10;
      ctx.fillStyle = `rgba(253, 224, 71, ${0.18 + 0.14 * Math.sin(animClock * 2 + i)})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'mound_pond') {
    // Raibuliuojantis tvenkinio vanduo su keliais ratilais ir atspindžiais
    for (let w = 0; w < 3; w++) {
      const cycle = (animClock * 0.45 + w * 0.33) % 1;
      const rx = 24 + cycle * 88;
      const ry = rx * 0.56;
      ctx.strokeStyle = `rgba(186, 230, 253, ${(1 - cycle) * 0.32})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(465, 260, rx, ry, 0.12, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let s = 0; s < 6; s++) {
      const sx = 395 + s * 28 + Math.sin(animClock * 2 + s) * 6;
      const sy = 235 + (s % 3) * 22;
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.22 + 0.18 * Math.sin(animClock * 3 + s)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - 6, sy);
      ctx.lineTo(sx + 6, sy);
      ctx.stroke();
    }
  } else if (theme === 'kurtuvenai_forest') {
    // Siūbuojančios Kurtuvėnų pušys su 2.5D šešėliais
    const pines = [
      { x: 68, y: 60, r: 20 },
      { x: 295, y: 45, r: 17 },
      { x: 645, y: 60, r: 21 },
      { x: 68, y: 440, r: 19 },
      { x: 350, y: 452, r: 16 },
      { x: 645, y: 445, r: 20 },
      { x: 820, y: 430, r: 19 }
    ];
    pines.forEach((p, idx) => {
      const swayX = Math.sin(animClock * 1.8 + idx * 1.1) * 3.2;
      const swayY = Math.cos(animClock * 1.4 + idx) * 1.4;
      drawGroundShadow(ctx, p.x + 7, p.y + 9, p.r * 0.95, p.r * 0.6, 0.38);

      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(p.x + swayX * 0.5, p.y + swayY * 0.5, p.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(p.x + swayX * 0.85, p.y - 2 + swayY, p.r * 0.72, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(p.x + swayX - 3, p.y - 5 + swayY, p.r * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Rūko sruogos virš pelkės
    for (let m = 0; m < 4; m++) {
      const mx = 375 + ((animClock * 14 + m * 25) % 90) - 25;
      const my = 236 + m * 10;
      ctx.fillStyle = 'rgba(167, 243, 208, 0.09)';
      ctx.beginPath();
      ctx.ellipse(mx, my, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'dagilelis_music') {
    // Scenos šviesos prožektoriai ir sklandančios muzikinės natos
    ctx.save();
    for (let s = 0; s < 2; s++) {
      const beamAng = (s === 0 ? -0.35 : 0.35) + Math.sin(animClock * 1.4 + s * 2) * 0.16;
      ctx.save();
      ctx.translate(848, 250);
      ctx.rotate(Math.PI + beamAng);
      const grad = ctx.createLinearGradient(0, 0, 175, 0);
      grad.addColorStop(0, 'rgba(251, 113, 133, 0.22)');
      grad.addColorStop(1, 'rgba(251, 113, 133, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(175, -36);
      ctx.lineTo(175, 36);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    const noteChars = ['♪', '♫', '♬'];
    for (let n = 0; n < 8; n++) {
      const nx = 80 + n * 102 + Math.sin(animClock * 1.5 + n) * 14;
      const ny = 470 - ((animClock * 26 + n * 58) % 440);
      ctx.fillStyle = n % 2 === 0 ? 'rgba(253, 224, 71, 0.34)' : 'rgba(251, 113, 133, 0.36)';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(noteChars[n % noteChars.length], nx, ny);
    }
  } else if (theme === 'solar_future_base') {
    // Pulsuojančios energijos linijos ir LED diodai 5-ojoje zonoje
    const pulseAlpha = 0.28 + 0.22 * Math.sin(animClock * 3.5);
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulseAlpha.toFixed(2)})`;
    ctx.lineWidth = 2;
    for (let gx = 45; gx < 860; gx += 135) {
      for (let gy = 30; gy < 460; gy += 110) {
        const ledBlink = Math.sin(animClock * 4 + gx * 0.02 + gy * 0.03) > 0;
        ctx.fillStyle = ledBlink ? '#38bdf8' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(gx + 110, gy + 8, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

// ==================== 2. DAUGIASLUOKSNIAI 2.5D KELIAI ====================
function renderPaths25D(ctx, engine) {
  const { map, pathSplines, animClock } = engine;
  const theme = map.theme || 'courtyard_greenhouse';

  for (const spline of pathSplines) {
    if (spline.points.length < 2) continue;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 2.5D kelio šešėlis po žeme
    ctx.save();
    ctx.translate(0, 5);
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.56)';
    ctx.lineWidth = 52;
    ctx.beginPath();
    spline.points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.restore();

    // Išorinis bortelis
    ctx.strokeStyle = map.pathBorder;
    ctx.lineWidth = 46;
    ctx.beginPath();
    spline.points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Vidurinė danga
    ctx.strokeStyle = map.pathColor;
    ctx.lineWidth = 34;
    ctx.stroke();

    // Paviršiaus gylio brūkšnys viršuje
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Akmenukai 1–3 zonose, klavišai 4-oje, švytinčios neoninės linijos 5-oje
    if (theme === 'solar_future_base') {
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.shadowColor = '#fbbf24';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.72)';
      ctx.lineWidth = 2;
      ctx.setLineDash([18, 28]);
      ctx.lineDashOffset = -animClock * 48;
      ctx.stroke();
      ctx.restore();
    } else if (theme === 'dagilelis_music') {
      ctx.save();
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.78)';
      ctx.lineWidth = 22;
      ctx.setLineDash([12, 12]);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.lineDashOffset = 12;
      ctx.stroke();
      ctx.restore();
    } else {
      // Natūralūs akmenukai trasoje
      ctx.save();
      for (let d = 24; d < spline.totalLength - 24; d += 34) {
        const pt = sampleSplinePoint(spline, d);
        const side = ((Math.round(d) % 2) === 0 ? 1 : -1) * 9;
        const px = pt.x + Math.cos(pt.angle + Math.PI / 2) * side;
        const py = pt.y + Math.sin(pt.angle + Math.PI / 2) * side;
        ctx.fillStyle = theme === 'mound_pond' ? 'rgba(203, 213, 225, 0.25)' : 'rgba(254, 243, 199, 0.22)';
        ctx.beginPath();
        ctx.ellipse(px, py, 3.6, 2.3, pt.angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Judėjimo krypties rodyklės
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2.2;
    for (let d = 55; d < spline.totalLength - 45; d += 95) {
      const pt = sampleSplinePoint(spline, d);
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle);
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.lineTo(4, 0);
      ctx.lineTo(-5, 5);
      ctx.stroke();
      ctx.restore();
    }

    // Įėjimo portalas
    const entry = spline.points[0];
    drawGroundShadow(ctx, entry.x + 2, entry.y + 5, 18, 12, 0.45);
    ctx.fillStyle = '#4c0519';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(entry.x, entry.y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fecdd3';
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚔️', entry.x, entry.y + 1);

    // Būsimos bangos peržiūros burbulas
    if (engine.nextWavePreview && engine.canCallWaveEarly()) {
      const pulseScale = 1 + Math.sin(animClock * 5) * 0.1;
      ctx.save();
      ctx.translate(entry.x + 18, entry.y);
      ctx.scale(pulseScale, pulseScale);
      ctx.fillStyle = engine.nextWavePreview.hasBoss ? 'rgba(190, 18, 60, 0.94)' : 'rgba(180, 83, 9, 0.94)';
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

// ==================== 3. 2.5D BOKŠTELIAI SU ATATRANKA IR LYGIO POKYČIAIS ====================
function renderTower25D(ctx, tower, isSelected, animClock) {
  const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
  if (!stats) return;
  const priorityMeta = getTargetingPriorityMeta(tower.priority);
  const recoil = tower.recoilOffset || 0;
  const lvl = tower.level || 1;
  const baseRadius = 22 + (lvl >= 3 ? 2 : 0) + (lvl === 4 ? 2 : 0);

  ctx.save();

  // Krintantis 2.5D šešėlis
  drawGroundShadow(ctx, tower.x + 4, tower.y + 7, baseRadius + 2, baseRadius * 0.72, 0.48);

  // 4-ojo lygio neoninis švytėjimas aplink pagrindą
  if (lvl === 4) {
    ctx.save();
    ctx.shadowColor = stats.color;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = stats.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, baseRadius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 2.5D cilindro sienelė (apačia poslinkiu +4px Y)
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.arc(tower.x, tower.y + 4, baseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pagrindo plokštė su radialiniu perėjimu
  const padGrad = ctx.createRadialGradient(
    tower.x - 6,
    tower.y - 6,
    3,
    tower.x,
    tower.y,
    baseRadius
  );
  padGrad.addColorStop(0, '#334155');
  padGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = padGrad;
  ctx.strokeStyle = isSelected ? '#fde047' : lvl === 3 ? '#fbbf24' : stats.color;
  ctx.lineWidth = isSelected ? 3.5 : lvl >= 3 ? 3 : 2.2;
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, baseRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2–4 lygio papildomos šarvų plokštės kampuose
  if (lvl >= 2) {
    ctx.strokeStyle = lvl === 4 ? '#f472b6' : lvl === 3 ? '#fde047' : '#94a3b8';
    ctx.lineWidth = lvl >= 3 ? 2.6 : 2;
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, baseRadius - 2, a - 0.25, a + 0.25);
      ctx.stroke();
    }
  }

  // Viršutinė besisukanti bokšto dalis (turret) + atatranka (recoil)
  ctx.save();
  ctx.translate(tower.x, tower.y);

  if (tower.type === 'solar_station') {
    // Saulės baterijų stotis su šviesos atspindžiu
    const sheen = 0.5 + 0.5 * Math.sin(animClock * 2.5);
    ctx.fillStyle = '#0369a1';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-15, -10, 30, 18);
    ctx.strokeRect(-15, -10, 30, 18);
    ctx.fillStyle = `rgba(253, 224, 71, ${(0.18 + sheen * 0.22).toFixed(2)})`;
    ctx.fillRect(-13, -8, 12, 14);
    ctx.fillRect(1, -8, 12, 14);
  } else if (tower.type === 'mower_barracks') {
    // Barakų stogelis su energijos vartais
    ctx.fillStyle = '#14532d';
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    drawRoundedRectPath(ctx, -13, -11, 26, 20, 6);
    ctx.fill();
    ctx.stroke();
  } else {
    // Besisukantis vamzdis / spinduliuotuvas su atatrankos poslinkiu (-recoil)
    ctx.rotate(tower.angle || 0);
    ctx.translate(-recoil, 0);

    if (lvl >= 3 && (tower.type === 'solar_laser' || tower.type === 'drone_hangar')) {
      // Dvigubi vamzdžiai nuo 3 lygio
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(5, -7.5, 17 + lvl, 4);
      ctx.fillRect(5, 3.5, 17 + lvl, 4);
      ctx.fillStyle = stats.color;
      ctx.fillRect(7, -6.5, 15 + lvl, 2);
      ctx.fillRect(7, 4.5, 15 + lvl, 2);
    } else if (tower.type === 'dagilelis_sound') {
      // Garso bokšto auksinis garsiakalbio žiedas
      ctx.fillStyle = stats.color;
      ctx.beginPath();
      ctx.moveTo(4, -5);
      ctx.lineTo(18 + lvl, -10);
      ctx.lineTo(18 + lvl, 10);
      ctx.lineTo(4, 5);
      ctx.closePath();
      ctx.fill();
    } else {
      // Standartinis arba sustiprintas vamzdis / katapultos petys
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(3, -5, 19 + lvl * 1.5, 10);
      ctx.fillStyle = stats.color;
      ctx.fillRect(5, -3.5, 16 + lvl * 1.5, 7);
    }

    // Šūvio žybsnis (muzzle flash) atatrankos momentu
    if (recoil > 1.4) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(23 + lvl, 0, recoil * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Viršutinis kupolas / ikona
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, 12.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lvl === 4 ? '#f472b6' : 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = '16px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tower.evolutionId ? stats.evolutionIcon : stats.icon, tower.x, tower.y + 1);

  // Lygio žvaigždutės virš bokšto
  ctx.font = 'bold 10px Outfit, sans-serif';
  ctx.fillStyle = lvl === 4 ? '#f472b6' : '#fde047';
  ctx.fillText(lvl === 4 ? '✦✦✦✦' : '★'.repeat(lvl), tower.x, tower.y - baseRadius - 8);

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
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillStyle = '#a7f3d0';
    const auraTxt = [
      tower.speedAuraPct > 0 ? `+${tower.speedAuraPct}%⚡` : '',
      tower.rangeAuraPct > 0 ? `+${tower.rangeAuraPct}%🔭` : ''
    ]
      .filter(Boolean)
      .join(' ');
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
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + 3, enemy.radius * 1.1, enemy.radius * 0.65, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = '12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⛰️', enemy.x, enemy.y - 6);
    ctx.restore();
    return;
  }

  if (enemy.isCamo && (enemy.camoRevealedTimer || 0) <= 0) {
    ctx.globalAlpha = 0.44;
  }

  if (enemy.jamAuraRadius > 0) {
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.jamAuraRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sklandi judėjimo animacija (siūbavimas / sparnų mostai)
  const isStunned = enemy.stunTimer > 0;
  const bobY = enemy.isFlying
    ? Math.sin(animClock * 6.5 + enemy.uid) * 3.5
    : isStunned
      ? 0
      : Math.abs(Math.sin(animClock * 9 + enemy.uid)) * -2.6;
  const squashX = enemy.isFlying || isStunned ? 1 : 1 + Math.sin(animClock * 18 + enemy.uid) * 0.05;
  const squashY = enemy.isFlying || isStunned ? 1 : 1 / squashX;

  // Šešėlis po priešu
  if (enemy.isFlying) {
    drawGroundShadow(ctx, enemy.x + 2, enemy.y + 19, enemy.radius * 0.85, 5, 0.45);
  } else {
    drawGroundShadow(ctx, enemy.x + 2, enemy.y + enemy.radius * 0.72, enemy.radius * 0.92, enemy.radius * 0.45, 0.4);
  }

  const drawY = enemy.y + bobY;

  // Skraidančių sparnai
  if (enemy.isFlying) {
    const wingY = Math.sin(animClock * 22 + enemy.uid) * 7;
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.82)';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(enemy.x - enemy.radius * 0.5, drawY - 2);
    ctx.lineTo(enemy.x - enemy.radius * 1.45, drawY - 7 + wingY);
    ctx.moveTo(enemy.x + enemy.radius * 0.5, drawY - 2);
    ctx.lineTo(enemy.x + enemy.radius * 1.45, drawY - 7 + wingY);
    ctx.stroke();
  }

  // Kūnas su 2.5D tūrio perėjimu
  ctx.save();
  ctx.translate(enemy.x, drawY);
  ctx.scale(squashX, squashY);

  const fillCol =
    enemy.hitFlash > 0
      ? '#ffffff'
      : enemy.stunTimer > 0
        ? '#93c5fd'
        : enemy.slowTimer > 0
          ? '#38bdf8'
          : enemy.color;

  ctx.fillStyle = fillCol;
  ctx.strokeStyle = enemy.borderColor;
  ctx.lineWidth = enemy.isBoss ? 3.2 : 2;
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Viršutinis 2.5D blizgesys
  if (enemy.hitFlash <= 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(-enemy.radius * 0.25, -enemy.radius * 0.3, enemy.radius * 0.45, enemy.radius * 0.24, -0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = enemy.isBoss ? '16px Outfit, sans-serif' : '12px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(enemy.icon || '👾', 0, 1);
  ctx.restore();

  // Švari HP juostelė PASIRODO TIK GAVUS ŽALOS
  const hasTakenDamage =
    enemy.hp < enemy.maxHp - 0.01 ||
    (enemy.maxShield > 0 && enemy.shield < enemy.maxShield - 0.01);

  const barW = Math.max(24, enemy.radius * 2.25);
  const barY = drawY - enemy.radius - 10;

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

  // Būsenos ir savybių piktogramos (šarvai, ledas, apsvaiginimas, bosas, camo)
  const badges = [];
  if (enemy.isBoss) badges.push('👑');
  if (enemy.isCamo) badges.push('👁️');
  if ((enemy.armor || 0) >= 0.25) badges.push('🛡️');
  if (enemy.slowTimer > 0) badges.push('❄️');
  if (enemy.stunTimer > 0) badges.push('💫');

  if (badges.length > 0) {
    const badgeY = hasTakenDamage ? barY - 9 : drawY - enemy.radius - 9;
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

  const w = canvas.width;
  const h = canvas.height;
  const { animClock } = engine;

  ctx.save();

  // Ekrano virptelėjimas (screen shake)
  if ((engine.shakeTimer || 0) > 0) {
    ctx.translate(engine.shakeOffsetX || 0, engine.shakeOffsetY || 0);
  }

  // 1. Zonos fonas ir atmosferos apšvietimas
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, engine.map.bgTop);
  grad.addColorStop(1, engine.map.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(-12, -12, w + 24, h + 24);

  const spotGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 60, w * 0.5, h * 0.5, w * 0.65);
  spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
  spotGrad.addColorStop(1, 'rgba(2, 6, 23, 0.35)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 45) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 45) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // 1b. Gyva zonos aplinka
  renderAnimatedZoneEnvironment(ctx, engine.map, animClock);

  // 2. 2.5D keliai
  renderPaths25D(ctx, engine);

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

  // 3. 2.5D Tvirtovė(-s) išėjimuose
  const exits = [];
  for (const spline of engine.pathSplines) {
    const endPt = spline.points?.[spline.points.length - 1];
    if (!endPt) continue;
    if (!exits.some((ex) => Math.hypot(ex.x - endPt.x, ex.y - endPt.y) < 12)) {
      exits.push(endPt);
    }
  }
  if (exits.length === 0 && engine.map.fortress) {
    exits.push(engine.map.fortress);
  }

  for (const exitPt of exits) {
    drawGroundShadow(ctx, exitPt.x + 3, exitPt.y + 7, 32, 22, 0.52);
    ctx.save();
    ctx.shadowColor = engine.map.accentColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = engine.map.accentColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(exitPt.x, exitPt.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.font = '26px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(engine.map.theme === 'solar_future_base' ? '🛰️' : '🏰', exitPt.x, exitPt.y + 1);
  }

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

  // 5. 2.5D statybos aikštelės (Build Pads)
  const pulseAlpha = 0.55 + Math.sin(animClock * 4) * 0.25;
  engine.map.pads.forEach((pad, idx) => {
    if (engine.getTowerAtPad(idx)) return;
    const isSelected = engine.selectedPadIndex === idx;

    drawGroundShadow(ctx, pad.x + 3, pad.y + 5, 24, 16, 0.42);
    ctx.save();
    ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.34)' : 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = isSelected
      ? '#fde047'
      : `rgba(56, 189, 248, ${pulseAlpha.toFixed(2)})`;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isSelected ? '#fde047' : '#bae6fd';
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', pad.x, pad.y + 1);
    ctx.restore();
  });

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
      for (let n = 0; n < 6; n++) {
        const ang = (n * Math.PI) / 3 + p * 1.6;
        const lift = p * 16;
        const note = n % 3 === 0 ? '♪' : n % 3 === 1 ? '♫' : '♬';
        ctx.fillText(note, pulse.x + Math.cos(ang) * r, pulse.y + Math.sin(ang) * r - lift);
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
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.22)';
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
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
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
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.38)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(u.x, u.y, stats.electroAuraRadius || 60, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = stats.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(u.x, u.y, 10.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(u.stunTimer > 0 ? '💫' : '🤖', u.x, u.y + 1);

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

  // 9. Saulės Lazerio spinduliai (baltas centras + spalvota plazmos aura)
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

        // Plazmos taikinio blyksnis
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

  // 11. Skraidantys Dronų Angaro mini dronai su propeleriais ir šviesos kūgiu
  for (const tower of engine.towers) {
    if (tower.type === 'drone_hangar') {
      for (const d of tower.drones) {
        drawGroundShadow(ctx, d.x + 2, d.y + 18, 9, 4, 0.38);

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.angle || 0);
        if (d.recoilOffset) ctx.translate(-d.recoilOffset, 0);

        // Priekinis šviesos kūgis (searchlight)
        const coneGrad = ctx.createLinearGradient(6, 0, 56, 0);
        coneGrad.addColorStop(0, 'rgba(45, 212, 191, 0.32)');
        coneGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(56, -18);
        ctx.lineTo(56, 18);
        ctx.closePath();
        ctx.fill();

        // Drono korpusas
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(-7, -7);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-7, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Besisukantys 4 propelerių diskai
        const rotors = [
          { rx: 5, ry: -7 },
          { rx: 5, ry: 7 },
          { rx: -6, ry: -7 },
          { rx: -6, ry: 7 }
        ];
        rotors.forEach((rot, rIdx) => {
          const spin = animClock * 28 + rIdx * 0.8;
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.78)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(rot.rx + Math.cos(spin) * 5.5, rot.ry + Math.sin(spin) * 5.5);
          ctx.lineTo(rot.rx - Math.cos(spin) * 5.5, rot.ry - Math.sin(spin) * 5.5);
          ctx.stroke();
        });
        ctx.restore();
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

  // 12b. Dalelių sistema (sprogimų, boso įveikimo, kibirkščių efektai)
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

  // 13. Kylantys žalos ir aukso skaičiukai (+15🪙, -24)
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
    ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
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
    ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
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
