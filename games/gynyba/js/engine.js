// ==================== BUBIŲ TVIRTOVĖ: TOWER DEFENSE VARIKLIS ====================
// Palaiko sklandžias Catmull-Rom kelių kreives (1 arba 2 keliai viename žemėlapyje),
// statybos aikšteles (Build Pads), 4 taikymo prioritetus, greitį 1x/2x, pauzę ir ankstyvų bangų premijas.

import {
  STARTING_HEARTS,
  INTER_WAVE_COOLDOWN_SECONDS,
  MAP_DEFINITIONS,
  TOWER_CATALOG,
  getTowerStats,
  getUpgradeCost,
  getStartingCoins,
  computeSellRefund,
  computeEarlyWaveBonus,
  calculateStarsForHearts,
  getTargetingPriorityMeta,
  selectTargetByPriority,
  generateWaveSpawns
} from './balance.js?v=20261121b';

/**
 * Sukuria glotnią Catmull-Rom kreivę pagal kontrolinių taškų masyvą.
 */
export function buildSmoothPathSpline(waypoints, subdivisions = 22) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) {
    return { points: [], totalLength: 0 };
  }
  if (waypoints.length === 1) {
    return {
      points: [{ x: waypoints[0].x, y: waypoints[0].y, dist: 0, angle: 0 }],
      totalLength: 0
    };
  }

  const rawPoints = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)];

    const steps = i === waypoints.length - 2 ? subdivisions + 1 : subdivisions;
    for (let s = 0; s < steps; s++) {
      const t = s / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      rawPoints.push({ x, y });
    }
  }

  const points = [];
  let totalLength = 0;
  for (let i = 0; i < rawPoints.length; i++) {
    const curr = rawPoints[i];
    if (i > 0) {
      const prev = rawPoints[i - 1];
      totalLength += Math.hypot(curr.x - prev.x, curr.y - prev.y);
    }
    const next = rawPoints[Math.min(rawPoints.length - 1, i + 1)];
    const prevAnglePt = rawPoints[Math.max(0, i - 1)];
    const angle = Math.atan2(next.y - prevAnglePt.y, next.x - prevAnglePt.x);
    points.push({
      x: curr.x,
      y: curr.y,
      dist: totalLength,
      angle
    });
  }

  return { points, totalLength };
}

/**
 * Grąžina interpoliuotą padėtį ant kelio kreivės pagal nueitą atstumą.
 */
export function samplePathAtDistance(spline, distance) {
  const pts = spline.points;
  if (!pts || pts.length === 0) {
    return { x: 0, y: 0, angle: 0, remainingDistance: 0, progressRatio: 1 };
  }
  if (pts.length === 1 || spline.totalLength <= 0) {
    return { x: pts[0].x, y: pts[0].y, angle: pts[0].angle, remainingDistance: 0, progressRatio: 1 };
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
  const segLen = b.dist - a.dist;
  const ratio = segLen > 0.0001 ? (d - a.dist) / segLen : 0;

  return {
    x: a.x + (b.x - a.x) * ratio,
    y: a.y + (b.y - a.y) * ratio,
    angle: a.angle,
    remainingDistance: Math.max(0, spline.totalLength - d),
    progressRatio: d / spline.totalLength
  };
}

export class TDEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.callbacks = callbacks;

    this.profileId = 'lukas';
    this.mapId = 'bubiai';
    this.map = MAP_DEFINITIONS.bubiai;
    this.pathSplines = [];

    this.speedMultiplier = 1; // 1 | 2
    this.manualPaused = false;
    this.externalLocked = false;

    this.hearts = STARTING_HEARTS;
    this.coins = 200;
    this.wave = 0;
    this.interWaveTimer = 0;
    this.waveActive = false;
    this.spawnQueue = [];
    this.spawnCooldown = 0;

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.pulses = [];
    this.explosions = [];
    this.floatingTexts = [];

    this.selectedPadIndex = null;
    this.previewTowerType = 'laser';
    this.gameResult = null; // null | { status: 'victory' | 'defeat', stars, wave, hearts }
    this.animClock = 0;
    this.lastUiSyncTime = 0;

    this.loadMap('bubiai', 'lukas');
  }

  setExternalLocked(isLocked) {
    this.externalLocked = Boolean(isLocked);
    this.notifyStateChange();
  }

  setProfile(profileId) {
    this.profileId = profileId === 'linas' ? 'linas' : 'lukas';
    this.loadMap(this.mapId, this.profileId);
  }

  loadMap(mapId, profileId = this.profileId) {
    this.profileId = profileId === 'linas' ? 'linas' : 'lukas';
    this.mapId = MAP_DEFINITIONS[mapId] ? mapId : 'bubiai';
    this.map = MAP_DEFINITIONS[this.mapId];
    this.pathSplines = this.map.paths.map((wp) => buildSmoothPathSpline(wp, 24));

    this.hearts = STARTING_HEARTS;
    this.coins = getStartingCoins(this.map.baseCoins, this.profileId);
    this.wave = 0;
    this.interWaveTimer = 0;
    this.waveActive = false;
    this.spawnQueue = [];
    this.spawnCooldown = 0;

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.pulses = [];
    this.explosions = [];
    this.floatingTexts = [];

    this.selectedPadIndex = null;
    this.previewTowerType = 'laser';
    this.manualPaused = false;
    this.gameResult = null;

    this.notifyStateChange();
  }

  isPaused() {
    return this.manualPaused || this.externalLocked || Boolean(this.gameResult);
  }

  setPaused(paused) {
    this.manualPaused = Boolean(paused);
    this.notifyStateChange();
  }

  togglePause() {
    this.manualPaused = !this.manualPaused;
    this.notifyStateChange();
    return this.manualPaused;
  }

  setSpeed(speed) {
    this.speedMultiplier = speed === 2 ? 2 : 1;
    this.notifyStateChange();
  }

  toggleSpeed() {
    this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
    this.notifyStateChange();
    return this.speedMultiplier;
  }

  setPreviewTowerType(towerType) {
    if (TOWER_CATALOG[towerType]) {
      this.previewTowerType = towerType;
    }
  }

  getTowerAtPad(padIndex) {
    return this.towers.find((t) => t.padIndex === padIndex) || null;
  }

  selectPad(padIndex) {
    if (padIndex == null || padIndex < 0 || padIndex >= this.map.pads.length) {
      this.selectedPadIndex = null;
    } else {
      this.selectedPadIndex = padIndex;
    }
    this.notifySelectionChange();
  }

  clearSelection() {
    this.selectedPadIndex = null;
    this.notifySelectionChange();
  }

  handleCanvasTap(canvasX, canvasY) {
    if (this.gameResult || this.externalLocked) return { type: 'locked' };
    const hitRadius = 30;
    let closestIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < this.map.pads.length; i++) {
      const pad = this.map.pads[i];
      const dist = Math.hypot(pad.x - canvasX, pad.y - canvasY);
      if (dist <= hitRadius && dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx === -1) {
      this.clearSelection();
      return { type: 'none' };
    }

    this.selectPad(closestIdx);
    const pad = this.map.pads[closestIdx];
    const tower = this.getTowerAtPad(closestIdx);
    return {
      type: tower ? 'tower' : 'empty_pad',
      padIndex: closestIdx,
      pad,
      tower
    };
  }

  buildTowerOnSelectedPad(towerType) {
    if (this.selectedPadIndex === null || this.gameResult || this.externalLocked) return false;
    const pad = this.map.pads[this.selectedPadIndex];
    if (!pad || this.getTowerAtPad(this.selectedPadIndex)) return false;

    const stats = getTowerStats(towerType, 1);
    if (!stats || this.coins < stats.cost) return false;

    this.coins -= stats.cost;
    const tower = {
      padIndex: this.selectedPadIndex,
      type: stats.id,
      level: 1,
      x: pad.x,
      y: pad.y,
      angle: -Math.PI / 2,
      priority: 'first', // BTD6 numatytasis prioritetas
      totalInvested: stats.cost,
      cooldownLeft: 0
    };
    this.towers.push(tower);
    this.addFloatingText(pad.x, pad.y - 26, `-${stats.cost} 🪙`, '#fde047');
    this.notifySelectionChange();
    this.notifyStateChange();
    return true;
  }

  setTowerPriority(padIndex, priorityId) {
    const tower = this.getTowerAtPad(padIndex);
    if (!tower) return false;
    const valid = ['first', 'strong', 'last', 'close'];
    if (!valid.includes(priorityId)) return false;
    tower.priority = priorityId;
    const meta = getTargetingPriorityMeta(priorityId);
    this.addFloatingText(tower.x, tower.y - 28, `${meta.icon} ${meta.label}`, '#7dd3fc');
    this.notifySelectionChange();
    return true;
  }

  upgradeTower(padIndex) {
    if (this.gameResult || this.externalLocked) return false;
    const tower = this.getTowerAtPad(padIndex);
    if (!tower) return false;
    const upgradeCost = getUpgradeCost(tower.type, tower.level);
    if (upgradeCost === null || this.coins < upgradeCost) return false;

    this.coins -= upgradeCost;
    tower.level += 1;
    tower.totalInvested += upgradeCost;
    this.addFloatingText(tower.x, tower.y - 30, `⬆️ Lygis ${tower.level}!`, '#4ade80');
    this.notifySelectionChange();
    this.notifyStateChange();
    return true;
  }

  sellTower(padIndex) {
    if (this.gameResult || this.externalLocked) return false;
    const idx = this.towers.findIndex((t) => t.padIndex === padIndex);
    if (idx === -1) return false;

    const tower = this.towers[idx];
    const refund = computeSellRefund(tower.totalInvested);
    this.towers.splice(idx, 1);
    this.coins += refund;
    this.addFloatingText(tower.x, tower.y - 26, `+${refund} 🪙 (75%)`, '#fde047');

    if (this.selectedPadIndex === padIndex) {
      this.selectedPadIndex = null;
    }
    this.notifySelectionChange();
    this.notifyStateChange();
    return true;
  }

  canCallWaveEarly() {
    if (this.gameResult || this.externalLocked) return false;
    if (this.wave >= this.map.maxWaves) return false;
    if (this.wave === 0) return true;
    return this.spawnQueue.length === 0;
  }

  getEarlyWaveBonusCoins() {
    if (!this.canCallWaveEarly() || this.wave === 0) return 0;
    const effectiveRem = this.interWaveTimer > 0 ? this.interWaveTimer : INTER_WAVE_COOLDOWN_SECONDS;
    return computeEarlyWaveBonus(effectiveRem, this.wave + 1);
  }

  callNextWaveEarly() {
    if (!this.canCallWaveEarly()) return 0;

    let bonus = 0;
    if (this.wave > 0) {
      bonus = this.getEarlyWaveBonusCoins();
      if (bonus > 0) {
        this.coins += bonus;
        const fortress = this.map.fortress;
        this.addFloatingText(
          fortress.x - 45,
          fortress.y - 42,
          `+${bonus} 🪙 Ankstyva banga!`,
          '#fde047'
        );
      }
    }

    this.startNextWaveInternal();
    this.notifyStateChange();
    return bonus;
  }

  startNextWaveInternal() {
    if (this.wave >= this.map.maxWaves || this.gameResult) return;
    this.wave += 1;
    this.waveActive = true;
    this.interWaveTimer = 0;
    const newSpawns = generateWaveSpawns(this.wave, this.pathSplines.length, this.profileId);
    this.spawnQueue.push(...newSpawns);
    this.spawnCooldown = newSpawns.length > 0 ? newSpawns[0].delay : 0;
  }

  addFloatingText(x, y, text, color = '#ffffff') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1.05,
      maxLife: 1.05
    });
  }

  update(rawDt) {
    this.animClock += rawDt;

    if (this.isPaused()) {
      return;
    }

    const dt = rawDt * this.speedMultiplier;

    // 1. Priešų paleidimas į kelius
    if (this.spawnQueue.length > 0) {
      this.spawnCooldown -= dt;
      while (this.spawnQueue.length > 0 && this.spawnCooldown <= 0) {
        const next = this.spawnQueue.shift();
        const pathIndex = Math.max(0, Math.min(this.pathSplines.length - 1, next.pathIndex));
        const spline = this.pathSplines[pathIndex];
        const pos = samplePathAtDistance(spline, 0);

        this.enemies.push({
          ...next,
          pathIndex,
          maxHp: next.hp,
          distance: 0,
          remainingDistance: spline.totalLength,
          x: pos.x,
          y: pos.y,
          angle: pos.angle,
          slowTimer: 0,
          slowFactor: 1,
          hitFlash: 0
        });

        if (this.spawnQueue.length > 0) {
          this.spawnCooldown += this.spawnQueue[0].delay;
        } else {
          // Visos šios bangos pabaisos paleistos – pradedame ankstyvo iškvietimo laikmatį kitai bangai!
          if (this.wave < this.map.maxWaves) {
            this.interWaveTimer = INTER_WAVE_COOLDOWN_SECONDS;
          }
        }
      }
    }

    // 2. Tarp-banginis laikmatis (Call Wave Early)
    if (this.wave >= 1 && this.wave < this.map.maxWaves && this.spawnQueue.length === 0) {
      if (this.interWaveTimer > 0) {
        this.interWaveTimer = Math.max(0, this.interWaveTimer - dt);
        if (this.interWaveTimer <= 0) {
          this.startNextWaveInternal();
          this.notifyStateChange();
        }
      }
    }

    // 3. Priešų judėjimas glotniais keliais
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.slowTimer > 0) {
        enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
        if (enemy.slowTimer <= 0) enemy.slowFactor = 1;
      }
      if (enemy.hitFlash > 0) {
        enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      }

      const spline = this.pathSplines[enemy.pathIndex];
      const currentSpeed = enemy.speed * (enemy.slowTimer > 0 ? enemy.slowFactor : 1);
      enemy.distance += currentSpeed * dt;

      if (enemy.distance >= spline.totalLength) {
        this.enemies.splice(i, 1);
        this.hearts = Math.max(0, this.hearts - (enemy.heartCost || 1));
        this.addFloatingText(
          this.map.fortress.x - 10,
          this.map.fortress.y - 24,
          `-${enemy.heartCost || 1} ❤️`,
          '#fb7185'
        );
        this.notifyStateChange();

        if (this.hearts <= 0) {
          this.gameResult = {
            status: 'defeat',
            stars: 0,
            wave: this.wave,
            hearts: 0
          };
          this.notifyGameResult();
          return;
        }
        continue;
      }

      const sampled = samplePathAtDistance(spline, enemy.distance);
      enemy.x = sampled.x;
      enemy.y = sampled.y;
      enemy.angle = sampled.angle;
      enemy.remainingDistance = sampled.remainingDistance;
    }

    // 4. Bokštelių taikymas pagal prioritetą (Pirmas / Stipriausias / Paskutinis / Arčiausias)
    for (const tower of this.towers) {
      const stats = getTowerStats(tower.type, tower.level);
      if (!stats) continue;

      if (tower.cooldownLeft > 0) {
        tower.cooldownLeft = Math.max(0, tower.cooldownLeft - dt);
      }

      const inRange = [];
      for (const enemy of this.enemies) {
        if (Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= stats.range) {
          inRange.push(enemy);
        }
      }

      if (inRange.length === 0) continue;

      const target = selectTargetByPriority(inRange, tower, tower.priority);
      if (!target) continue;

      tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);

      if (tower.cooldownLeft <= 0) {
        tower.cooldownLeft = stats.cooldown;
        this.fireTower(tower, stats, target, inRange);
      }
    }

    // 5. Skriejantys sviediniai (Svaidyklė ir Patranka)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (proj.target && proj.target.hp > 0) {
        proj.tx = proj.target.x;
        proj.ty = proj.target.y;
      }

      const dx = proj.tx - proj.x;
      const dy = proj.ty - proj.y;
      const dist = Math.hypot(dx, dy);
      const step = proj.speed * dt;

      if (dist <= step || dist < 6) {
        this.impactProjectile(proj);
        this.projectiles.splice(i, 1);
      } else {
        proj.x += (dx / dist) * step;
        proj.y += (dy / dist) * step;
      }
    }

    // 6. Vizualinių efektų gesimas
    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      this.pulses[i].life -= dt;
      if (this.pulses[i].life <= 0) this.pulses.splice(i, 1);
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].life -= dt;
      if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 7. Bangos ir žemėlapio pergalės tikrinimas
    if (this.waveActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveActive = false;
      const clearBonus = 25 + this.wave * 5;
      this.coins += clearBonus;
      this.addFloatingText(
        this.map.fortress.x - 40,
        this.map.fortress.y - 34,
        `Banga ${this.wave} įveikta! +${clearBonus} 🪙`,
        '#4ade80'
      );

      if (this.wave >= this.map.maxWaves && this.hearts > 0) {
        const stars = calculateStarsForHearts(this.hearts);
        this.gameResult = {
          status: 'victory',
          stars,
          wave: this.wave,
          hearts: this.hearts
        };
        this.notifyGameResult();
      }
      this.notifyStateChange();
    } else if (this.animClock - this.lastUiSyncTime >= 0.25) {
      this.lastUiSyncTime = this.animClock;
      this.notifyStateChange();
    }
  }

  fireTower(tower, stats, target, enemiesInRange) {
    if (stats.attackMode === 'beam') {
      this.beams.push({
        x1: tower.x,
        y1: tower.y,
        x2: target.x,
        y2: target.y,
        color: stats.color,
        life: 0.14,
        maxLife: 0.14
      });
      this.damageEnemy(target, stats.damage);
      return;
    }

    if (stats.attackMode === 'pulse') {
      this.pulses.push({
        x: tower.x,
        y: tower.y,
        maxRadius: stats.range,
        color: stats.color,
        life: 0.28,
        maxLife: 0.28
      });
      for (const e of [...enemiesInRange]) {
        if (stats.slowFactor && stats.slowDuration) {
          e.slowFactor = Math.min(e.slowFactor, stats.slowFactor);
          e.slowTimer = Math.max(e.slowTimer, stats.slowDuration);
        }
        this.damageEnemy(e, stats.damage);
      }
      return;
    }

    this.projectiles.push({
      x: tower.x + Math.cos(tower.angle) * 14,
      y: tower.y + Math.sin(tower.angle) * 14,
      tx: target.x,
      ty: target.y,
      target,
      speed: stats.projectileSpeed || 360,
      damage: stats.damage,
      splashRadius: stats.splashRadius || 0,
      color: stats.color,
      radius: tower.type === 'cannon' ? 7 : 5
    });
  }

  impactProjectile(proj) {
    if (proj.splashRadius > 0) {
      this.explosions.push({
        x: proj.tx,
        y: proj.ty,
        radius: proj.splashRadius,
        color: proj.color,
        life: 0.22,
        maxLife: 0.22
      });
      for (const enemy of [...this.enemies]) {
        const dist = Math.hypot(enemy.x - proj.tx, enemy.y - proj.ty);
        if (dist <= proj.splashRadius) {
          const falloff = dist < proj.splashRadius * 0.45 ? 1 : 0.72;
          this.damageEnemy(enemy, Math.round(proj.damage * falloff));
        }
      }
    } else if (proj.target && proj.target.hp > 0) {
      this.damageEnemy(proj.target, proj.damage);
    }
  }

  damageEnemy(enemy, amount) {
    if (!enemy || enemy.hp <= 0) return;
    enemy.hp -= amount;
    enemy.hitFlash = 0.08;

    if (enemy.hp <= 0) {
      const idx = this.enemies.indexOf(enemy);
      if (idx !== -1) {
        this.enemies.splice(idx, 1);
      }
      const reward = enemy.reward || 10;
      this.coins += reward;
      this.addFloatingText(enemy.x, enemy.y - 14, `+${reward} 🪙`, '#fde047');
      this.notifyStateChange();
    }
  }

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Fonas ir taktinis tinklelis
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, this.map.bgTop);
    grad.addColorStop(1, this.map.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
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

    // 2. Glotnūs keliai (1 arba 2 išsišakojantys keliai)
    for (const spline of this.pathSplines) {
      if (spline.points.length < 2) continue;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = this.map.pathBorder;
      ctx.lineWidth = 46;
      ctx.beginPath();
      spline.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      ctx.strokeStyle = this.map.pathColor;
      ctx.lineWidth = 34;
      ctx.stroke();

      // Judėjimo krypties rodyklės ant kelio
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 2;
      for (let d = 55; d < spline.totalLength - 45; d += 95) {
        const pt = samplePathAtDistance(spline, d);
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

      // Priešų įėjimo portalas
      const entry = spline.points[0];
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
    }

    // 3. Tvirtovė kelio pabaigoje
    const fortress = this.map.fortress;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = this.map.accentColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(fortress.x, fortress.y, 31, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = '28px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏰', fortress.x, fortress.y + 1);

    // 4. Veikimo spindulio (Range) peržiūra pasirinktai aikštelei arba bokštui
    if (this.selectedPadIndex !== null && this.map.pads[this.selectedPadIndex]) {
      const pad = this.map.pads[this.selectedPadIndex];
      const existingTower = this.getTowerAtPad(this.selectedPadIndex);

      if (existingTower) {
        const stats = getTowerStats(existingTower.type, existingTower.level);
        if (stats) {
          this.drawRangeCircle(ctx, pad.x, pad.y, stats.range, stats.color, false);
          if (existingTower.level < 3) {
            const nextStats = getTowerStats(existingTower.type, existingTower.level + 1);
            if (nextStats && nextStats.range > stats.range) {
              this.drawRangeCircle(ctx, pad.x, pad.y, nextStats.range, '#4ade80', true);
            }
          }
        }
      } else {
        const previewStats = getTowerStats(this.previewTowerType, 1);
        if (previewStats) {
          this.drawRangeCircle(ctx, pad.x, pad.y, previewStats.range, previewStats.color, false);
        }
      }
    }

    // 5. Statybos aikštelės (Build Pads)
    const pulseAlpha = 0.55 + Math.sin(this.animClock * 4) * 0.25;
    this.map.pads.forEach((pad, idx) => {
      const isSelected = this.selectedPadIndex === idx;
      const built = this.getTowerAtPad(idx);
      if (built) return;

      ctx.save();
      ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.32)' : 'rgba(15, 23, 42, 0.78)';
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

    // 6. Garso bangos (Rezonatorius) ir sprogimai
    for (const pulse of this.pulses) {
      const p = 1 - pulse.life / pulse.maxLife;
      const r = pulse.maxRadius * p;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p) * 0.65;
      ctx.strokeStyle = pulse.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const exp of this.explosions) {
      const p = 1 - exp.life / exp.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p) * 0.45;
      ctx.fillStyle = exp.color;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius * (0.4 + p * 0.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Pastatyti bokšteliai
    for (const tower of this.towers) {
      const stats = getTowerStats(tower.type, tower.level);
      const isSelected = this.selectedPadIndex === tower.padIndex;
      const priorityMeta = getTargetingPriorityMeta(tower.priority);

      ctx.save();
      // Pamatas
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isSelected ? '#fde047' : stats.color;
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 23, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Besisukantis vamzdis / krypties indikatorius
      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.rotate(tower.angle);
      ctx.fillStyle = stats.color;
      ctx.fillRect(4, -3.5, 19, 7);
      ctx.restore();

      // Ikona centre
      ctx.font = '19px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stats.icon, tower.x, tower.y + 1);

      // Lygio žvaigždutės viršuje
      ctx.font = 'bold 10px Outfit, sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText('★'.repeat(tower.level), tower.x, tower.y - 29);

      // Taikymo prioriteto ženkliukas kampe
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillText(priorityMeta.icon, tower.x + 19, tower.y + 18);
      ctx.restore();
    }

    // 8. Lazerio spinduliai
    for (const beam of this.beams) {
      const alpha = Math.max(0, beam.life / beam.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 9. Priešai
    for (const enemy of this.enemies) {
      ctx.save();
      ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : enemy.slowTimer > 0 ? '#38bdf8' : enemy.color;
      ctx.strokeStyle = enemy.borderColor;
      ctx.lineWidth = enemy.isBoss ? 3 : 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (enemy.isBoss) {
        ctx.font = '15px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👑', enemy.x, enemy.y - enemy.radius - 13);
      }

      const barW = enemy.radius * 2.2;
      const barY = enemy.y - enemy.radius - 9;
      const ratio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      ctx.fillRect(enemy.x - barW / 2, barY, barW, 5);
      ctx.fillStyle = enemy.isBoss ? '#facc15' : '#4ade80';
      ctx.fillRect(enemy.x - barW / 2, barY, barW * ratio, 5);
      ctx.restore();
    }

    // 10. Sviediniai
    for (const proj of this.projectiles) {
      ctx.save();
      ctx.fillStyle = proj.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 11. Plaukiojantys tekstai
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.font = 'bold 14px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#020617';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // 12. Pauzės žymė ant drobės
    if (this.manualPaused && !this.gameResult) {
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
  }

  drawRangeCircle(ctx, x, y, radius, color, isUpgradeRing) {
    ctx.save();
    if (!isUpgradeRing) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.10)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = color;
    ctx.globalAlpha = isUpgradeRing ? 0.55 : 0.82;
    ctx.lineWidth = isUpgradeRing ? 1.5 : 2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  notifyStateChange() {
    if (typeof this.callbacks.onStateChange === 'function') {
      this.callbacks.onStateChange(this);
    }
  }

  notifySelectionChange() {
    if (typeof this.callbacks.onSelectionChange === 'function') {
      this.callbacks.onSelectionChange(this);
    }
  }

  notifyGameResult() {
    if (typeof this.callbacks.onGameResult === 'function') {
      this.callbacks.onGameResult(this.gameResult, this);
    }
  }
}
