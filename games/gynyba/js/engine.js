// ==================== BUBIŲ TVIRTOVĖ: TOWER DEFENSE VARIKLIS ====================
// Palaiko glotnias Catmull-Rom kelių kreives (1 arba 2 keliai), statybos aikšteles,
// 4 BTD6 taikymo prioritetus, visas 6 unikalias bokštelių mechanikas ir 12 Tier-4 evoliucijų.

import {
  STARTING_HEARTS,
  INTER_WAVE_COOLDOWN_SECONDS,
  MAP_DEFINITIONS,
  getStartingCoins,
  computeSellRefund,
  computeEarlyWaveBonus,
  calculateStarsForHearts,
  getTargetingPriorityMeta,
  selectTargetByPriority,
  generateWaveSpawns
} from './balance.js?v=20261121c';
import {
  TOWER_CATALOG,
  getTowerStats,
  getUpgradeCost,
  getTowerEvolutions,
  findNearestPathPoint
} from './towers.js?v=20261121c';

let nextEnemyUid = 1;

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
    this.parabolicShots = [];
    this.beams = [];
    this.lightningBolts = [];
    this.pulses = [];
    this.explosions = [];
    this.floatingTexts = [];

    this.selectedPadIndex = null;
    this.previewTowerType = 'solar_laser';
    this.placingRallyPadIndex = null;
    this.gameResult = null;
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
    this.parabolicShots = [];
    this.beams = [];
    this.lightningBolts = [];
    this.pulses = [];
    this.explosions = [];
    this.floatingTexts = [];

    this.selectedPadIndex = null;
    this.previewTowerType = 'solar_laser';
    this.placingRallyPadIndex = null;
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
    this.placingRallyPadIndex = null;
    this.notifySelectionChange();
  }

  startRallyPlacement(padIndex) {
    const tower = this.getTowerAtPad(padIndex);
    if (!tower || tower.type !== 'mower_barracks') return false;
    this.placingRallyPadIndex = padIndex;
    this.selectedPadIndex = padIndex;
    this.notifySelectionChange();
    this.notifyStateChange();
    return true;
  }

  setTowerRallyPoint(padIndex, canvasX, canvasY) {
    const tower = this.getTowerAtPad(padIndex);
    if (!tower || tower.type !== 'mower_barracks') return false;
    const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
    const maxR = tower.effectiveRange || stats.range;
    const snapped = findNearestPathPoint(this.pathSplines, canvasX, canvasY, maxR, tower.x, tower.y);
    tower.rallyPoint = { x: snapped.x, y: snapped.y };
    for (const u of tower.units) {
      u.engagedEnemyId = null;
    }
    this.placingRallyPadIndex = null;
    this.addFloatingText(snapped.x, snapped.y - 18, '🚩 Rally Point!', '#4ade80');
    this.notifySelectionChange();
    this.notifyStateChange();
    return true;
  }

  handleCanvasTap(canvasX, canvasY) {
    if (this.gameResult || this.externalLocked) return { type: 'locked' };

    // Jei aktyvus Rally Point perkėlimo režimas – nukreipiame barako robotus ant artimiausios kelio atkarpos!
    if (this.placingRallyPadIndex !== null) {
      this.setTowerRallyPoint(this.placingRallyPadIndex, canvasX, canvasY);
      return { type: 'rally_set' };
    }

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

  initTowerSubEntities(tower) {
    const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
    if (!stats) return;

    if (tower.type === 'drone_hangar') {
      const targetCount = stats.droneCount || 1;
      if (!Array.isArray(tower.drones)) tower.drones = [];
      while (tower.drones.length < targetCount) {
        const idx = tower.drones.length;
        const a = idx * Math.PI;
        tower.drones.push({
          x: tower.x + Math.cos(a) * 32,
          y: tower.y + Math.sin(a) * 32,
          orbitAngle: a,
          angle: a,
          cooldownLeft: idx * 0.2
        });
      }
    } else if (tower.type === 'mower_barracks') {
      if (!tower.rallyPoint) {
        const nearest = findNearestPathPoint(this.pathSplines, tower.x, tower.y, stats.range, tower.x, tower.y);
        tower.rallyPoint = { x: nearest.x, y: nearest.y };
      }
      const targetCount = stats.unitCount || 2;
      if (!Array.isArray(tower.units)) tower.units = [];
      while (tower.units.length < targetCount) {
        const idx = tower.units.length;
        tower.units.push({
          slot: idx,
          x: tower.x,
          y: tower.y,
          hp: stats.unitMaxHp,
          maxHp: stats.unitMaxHp,
          respawnTimer: 0,
          engagedEnemyId: null,
          zapTimer: 0
        });
      }
      for (const u of tower.units) {
        u.maxHp = stats.unitMaxHp;
        if (u.respawnTimer <= 0) {
          u.hp = Math.min(stats.unitMaxHp, Math.max(u.hp, stats.unitMaxHp));
        }
      }
    }
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
      evolutionId: null,
      x: pad.x,
      y: pad.y,
      angle: -Math.PI / 2,
      priority: 'first',
      totalInvested: stats.cost,
      cooldownLeft: 0,
      incomeTimer: 0,
      lightningTimer: 0,
      shotCounter: 0,
      lockTimers: new Map(),
      activeBeams: [],
      drones: [],
      units: [],
      rallyPoint: null,
      effectiveRange: stats.range,
      effectiveFireRateMult: 1,
      radarAngle: 0
    };

    this.initTowerSubEntities(tower);
    this.towers.push(tower);
    this.recomputeTowerAuras();
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
    if (!tower || tower.level >= 3) return false;
    const upgradeCost = getUpgradeCost(tower.type, tower.level);
    if (upgradeCost === null || this.coins < upgradeCost) return false;

    this.coins -= upgradeCost;
    tower.level += 1;
    tower.totalInvested += upgradeCost;
    this.initTowerSubEntities(tower);
    this.recomputeTowerAuras();
    this.addFloatingText(tower.x, tower.y - 30, `⬆️ Lygis ${tower.level}!`, '#4ade80');
    this.notifySelectionChange();
    this.notifyStateChange();
    return true;
  }

  evolveTower(padIndex, evolutionId) {
    if (this.gameResult || this.externalLocked) return false;
    const tower = this.getTowerAtPad(padIndex);
    if (!tower || tower.level !== 3 || tower.evolutionId) return false;

    const evos = getTowerEvolutions(tower.type);
    const chosen = evos.find((ev) => ev.id === evolutionId);
    if (!chosen || this.coins < chosen.cost) return false;

    this.coins -= chosen.cost;
    tower.level = 4;
    tower.evolutionId = chosen.id;
    tower.totalInvested += chosen.cost;
    this.initTowerSubEntities(tower);
    this.recomputeTowerAuras();
    this.addFloatingText(tower.x, tower.y - 32, `${chosen.icon} ${chosen.name}!`, '#fde047');
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
    this.recomputeTowerAuras();
    this.addFloatingText(tower.x, tower.y - 26, `+${refund} 🪙 (75%)`, '#fde047');

    if (this.selectedPadIndex === padIndex) {
      this.selectedPadIndex = null;
    }
    if (this.placingRallyPadIndex === padIndex) {
      this.placingRallyPadIndex = null;
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

  /**
   * Apskaičiuoja „Dagilėlio“ (+15% / +30% šaudymo greičio) ir Saulės Stoties (+12% / +15% nuotolio) auras.
   */
  recomputeTowerAuras() {
    for (const tower of this.towers) {
      const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
      if (!stats) continue;

      let bestRangeBonus = 0;
      let bestSpeedBonus = 0;

      for (const other of this.towers) {
        if (other === tower) continue;
        const otherStats = getTowerStats(other.type, other.level, other.evolutionId);
        if (!otherStats) continue;
        const dist = Math.hypot(other.x - tower.x, other.y - tower.y);

        if (other.type === 'solar_station' && otherStats.auraRangeBonus && dist <= (otherStats.auraRadius || 160)) {
          bestRangeBonus = Math.max(bestRangeBonus, otherStats.auraRangeBonus);
        }
        if (other.type === 'dagilelis_sound' && otherStats.auraFireRateBonus && dist <= (otherStats.auraRadius || 150)) {
          bestSpeedBonus = Math.max(bestSpeedBonus, otherStats.auraFireRateBonus);
        }
      }

      tower.effectiveRange = Math.round(stats.range * (1 + bestRangeBonus));
      tower.effectiveFireRateMult = 1 + bestSpeedBonus;
      tower.rangeAuraPct = Math.round(bestRangeBonus * 100);
      tower.speedAuraPct = Math.round(bestSpeedBonus * 100);
    }
  }

  isEnemyVisibleToTower(towerStats, enemy) {
    if (!enemy || enemy.hp <= 0) return false;
    if (enemy.isFlying && !towerStats.canHitFlying) return false;
    if (enemy.isCamo && !towerStats.detectsCamo && (enemy.camoRevealedTimer || 0) <= 0) {
      return false;
    }
    return true;
  }

  update(rawDt) {
    this.animClock += rawDt;

    if (this.isPaused()) {
      return;
    }

    const dt = rawDt * this.speedMultiplier;
    this.recomputeTowerAuras();

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
          uid: nextEnemyUid++,
          pathIndex,
          maxHp: next.hp,
          distance: 0,
          remainingDistance: spline.totalLength,
          x: pos.x,
          y: pos.y,
          angle: pos.angle,
          slowTimer: 0,
          slowFactor: 1,
          stunTimer: 0,
          camoRevealedTimer: 0,
          scannerVulnerable: false,
          isBlocked: false,
          hitFlash: 0
        });

        if (this.spawnQueue.length > 0) {
          this.spawnCooldown += this.spawnQueue[0].delay;
        } else if (this.wave < this.map.maxWaves) {
          this.interWaveTimer = INTER_WAVE_COOLDOWN_SECONDS;
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

    // 3. Priešų būsenos ir judėjimas glotniais keliais
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.slowTimer > 0) {
        enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
        if (enemy.slowTimer <= 0) enemy.slowFactor = 1;
      }
      if (enemy.stunTimer > 0) {
        enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
      }
      if (enemy.camoRevealedTimer > 0) {
        enemy.camoRevealedTimer = Math.max(0, enemy.camoRevealedTimer - dt);
      }
      if (enemy.hitFlash > 0) {
        enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      }

      // Priešas nejuda, jei yra apsvaigintas / sušaldytas arba sustabdytas roboto-vejapjovės
      const canMove = enemy.stunTimer <= 0 && !enemy.isBlocked;
      const spline = this.pathSplines[enemy.pathIndex];

      if (canMove) {
        const currentSpeed = enemy.speed * (enemy.slowTimer > 0 ? enemy.slowFactor : 1);
        enemy.distance += currentSpeed * dt;
      }

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
      enemy.isBlocked = false; // Barakai iš naujo pažymės blokavimą šiame kadre
    }

    // 4. Visų 6 bokštelių mechanikų atnaujinimas
    for (const tower of this.towers) {
      const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
      if (!stats) continue;

      if (tower.type === 'solar_laser') {
        this.updateSolarLaserTower(tower, stats, dt);
      } else if (tower.type === 'dagilelis_sound') {
        this.updateDagilelisSoundTower(tower, stats, dt);
      } else if (tower.type === 'drone_hangar') {
        this.updateDroneHangarTower(tower, stats, dt);
      } else if (tower.type === 'mower_barracks') {
        this.updateMowerBarracksTower(tower, stats, dt);
      } else if (tower.type === 'berry_catapult') {
        this.updateBerryCatapultTower(tower, stats, dt);
      } else if (tower.type === 'solar_station') {
        this.updateSolarStationTower(tower, stats, dt);
      }
    }

    // 5. Tiesūs sviediniai / raketos (Dronų Angaras)
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
        this.impactDirectProjectile(proj);
        this.projectiles.splice(i, 1);
      } else {
        proj.x += (dx / dist) * step;
        proj.y += (dy / dist) * step;
      }
    }

    // 6. Parabolinės trajektorijos sviediniai (Šalčio / Šilauogių Katapulta)
    for (let i = this.parabolicShots.length - 1; i >= 0; i--) {
      const shot = this.parabolicShots[i];
      shot.elapsed += dt;
      const p = Math.min(1, shot.elapsed / shot.flightTime);
      shot.progress = p;
      const baseX = shot.startX + (shot.targetX - shot.startX) * p;
      const baseY = shot.startY + (shot.targetY - shot.startY) * p;
      const arcOffset = 4 * shot.arcHeight * p * (1 - p);
      shot.x = baseX;
      shot.y = baseY - arcOffset;
      shot.groundY = baseY;

      if (p >= 1) {
        this.impactParabolicShot(shot);
        this.parabolicShots.splice(i, 1);
      }
    }

    // 7. Efektų gesimas
    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      this.lightningBolts[i].life -= dt;
      if (this.lightningBolts[i].life <= 0) this.lightningBolts.splice(i, 1);
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

    // 8. Bangos ir žemėlapio pergalės tikrinimas
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

  // -------------------- 1. SAULĖS LAZERIS --------------------
  updateSolarLaserTower(tower, stats, dt) {
    tower.activeBeams = [];
    const range = tower.effectiveRange || stats.range;
    const candidates = this.enemies.filter(
      (e) =>
        this.isEnemyVisibleToTower(stats, e) &&
        Math.hypot(e.x - tower.x, e.y - tower.y) <= range
    );

    if (candidates.length === 0) {
      tower.lockTimers.clear();
      return;
    }

    const maxTargets = stats.maxTargets || 1;
    const selected = [];
    const pool = [...candidates];
    while (selected.length < maxTargets && pool.length > 0) {
      const pick = selectTargetByPriority(pool, tower, tower.priority);
      if (!pick) break;
      selected.push(pick);
      const idx = pool.indexOf(pick);
      if (idx !== -1) pool.splice(idx, 1);
    }

    const activeIds = new Set(selected.map((e) => e.uid));
    for (const key of tower.lockTimers.keys()) {
      if (!activeIds.has(key)) tower.lockTimers.delete(key);
    }

    if (selected[0]) {
      tower.angle = Math.atan2(selected[0].y - tower.y, selected[0].x - tower.x);
    }

    for (const target of selected) {
      const prevTime = tower.lockTimers.get(target.uid) || 0;
      const newTime = prevTime + dt;
      tower.lockTimers.set(target.uid, newTime);

      const ramp = Math.min(stats.maxRamp || 2.5, 1 + newTime * (stats.rampRatePerSec || 0.65));
      const dmg = stats.dps * ramp * (tower.effectiveFireRateMult || 1) * dt;

      tower.activeBeams.push({
        x1: tower.x,
        y1: tower.y,
        x2: target.x,
        y2: target.y,
        ramp,
        color: stats.color
      });

      const killed = this.damageEnemy(target, dmg, {
        armorPierce: stats.armorPierce || 0,
        silentText: true
      });

      if (killed && stats.explodeOnKillRadius > 0) {
        this.explosions.push({
          x: target.x,
          y: target.y,
          radius: stats.explodeOnKillRadius,
          color: '#f97316',
          life: 0.28,
          maxLife: 0.28
        });
        for (const other of [...this.enemies]) {
          if (Math.hypot(other.x - target.x, other.y - target.y) <= stats.explodeOnKillRadius) {
            this.damageEnemy(other, stats.explodeOnKillDamage || 90, { armorPierce: 0.4 });
          }
        }
      }
    }
  }

  // -------------------- 2. „DAGILĖLIO“ GARSO BOKŠTAS --------------------
  updateDagilelisSoundTower(tower, stats, dt) {
    if (tower.cooldownLeft > 0) {
      tower.cooldownLeft = Math.max(0, tower.cooldownLeft - dt * (tower.effectiveFireRateMult || 1));
    }
    if (tower.cooldownLeft > 0) return;

    const range = tower.effectiveRange || stats.range;
    const targets = this.enemies.filter(
      (e) =>
        this.isEnemyVisibleToTower(stats, e) &&
        Math.hypot(e.x - tower.x, e.y - tower.y) <= range
    );
    if (targets.length === 0) return;

    tower.cooldownLeft = stats.cooldown;
    this.pulses.push({
      x: tower.x,
      y: tower.y,
      maxRadius: range,
      color: stats.color,
      life: 0.36,
      maxLife: 0.36,
      isMusical: true
    });

    for (const enemy of [...targets]) {
      if (stats.stunDuration) {
        enemy.stunTimer = Math.max(enemy.stunTimer, enemy.isBoss ? stats.stunDuration * 0.4 : stats.stunDuration);
      }
      if (stats.knockbackDist && !enemy.isBoss) {
        enemy.distance = Math.max(0, enemy.distance - stats.knockbackDist);
      }
      this.damageEnemy(enemy, stats.damage);
    }
  }

  // -------------------- 3. DRONŲ ANGARAS --------------------
  updateDroneHangarTower(tower, stats, dt) {
    tower.radarAngle = (tower.radarAngle || 0) + dt * 2.2;
    const revealRadius = stats.camoRevealRadius || tower.effectiveRange || stats.range;

    // Radaras atidengia nematomus (Camo) priešus
    for (const enemy of this.enemies) {
      if (Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= revealRadius) {
        if (enemy.isCamo) {
          if (stats.stripCamoPermanently) {
            enemy.isCamo = false;
            enemy.scannerVulnerable = true;
            this.addFloatingText(enemy.x, enemy.y - 20, '📡 Atidengtas!', '#34d399');
          } else {
            enemy.camoRevealedTimer = Math.max(enemy.camoRevealedTimer, 1.5);
          }
        } else if (stats.stripCamoPermanently) {
          enemy.scannerVulnerable = true;
        }
      }
    }

    const range = tower.effectiveRange || stats.range;
    const targets = this.enemies.filter(
      (e) =>
        this.isEnemyVisibleToTower(stats, e) &&
        Math.hypot(e.x - tower.x, e.y - tower.y) <= range
    );

    const droneCount = tower.drones.length || 1;
    for (let i = 0; i < droneCount; i++) {
      const drone = tower.drones[i];
      drone.orbitAngle += dt * 1.85;
      if (drone.cooldownLeft > 0) {
        drone.cooldownLeft = Math.max(0, drone.cooldownLeft - dt * (tower.effectiveFireRateMult || 1));
      }

      const target =
        targets.length > 0
          ? selectTargetByPriority(targets, tower, tower.priority)
          : null;

      let goalX = tower.x + Math.cos(drone.orbitAngle + i * Math.PI) * 44;
      let goalY = tower.y + Math.sin(drone.orbitAngle + i * Math.PI) * 44;

      if (target) {
        const hoverOffset = i * Math.PI + drone.orbitAngle * 0.4;
        goalX = target.x + Math.cos(hoverOffset) * 28;
        goalY = target.y + Math.sin(hoverOffset) * 28;
        drone.angle = Math.atan2(target.y - drone.y, target.x - drone.x);

        if (drone.cooldownLeft <= 0) {
          drone.cooldownLeft = stats.cooldown;
          if (stats.homingMissiles) {
            this.projectiles.push({
              x: drone.x,
              y: drone.y,
              tx: target.x,
              ty: target.y,
              target,
              speed: 340,
              damage: stats.damage,
              splashRadius: stats.splashRadius || 56,
              color: stats.color,
              radius: 5,
              isMissile: true
            });
          } else {
            this.beams.push({
              x1: drone.x,
              y1: drone.y,
              x2: target.x,
              y2: target.y,
              color: stats.color,
              life: 0.11,
              maxLife: 0.11
            });
            this.damageEnemy(target, stats.damage);
          }
        }
      } else {
        drone.angle = drone.orbitAngle + Math.PI / 2;
      }

      // Sklandus drono skridimas
      const dx = goalX - drone.x;
      const dy = goalY - drone.y;
      const d = Math.hypot(dx, dy);
      const droneSpeed = 190 * dt;
      if (d > 1) {
        const move = Math.min(d, droneSpeed);
        drone.x += (dx / d) * move;
        drone.y += (dy / d) * move;
      }
    }
  }

  // -------------------- 4. ROBOTŲ-VEJAPJOVIŲ BARAKAI --------------------
  updateMowerBarracksTower(tower, stats, dt) {
    const rally = tower.rallyPoint || { x: tower.x, y: tower.y };
    const unitCount = tower.units.length;
    const spreadRadius = 20;

    for (let i = 0; i < unitCount; i++) {
      const unit = tower.units[i];
      if (unit.respawnTimer > 0) {
        unit.respawnTimer = Math.max(0, unit.respawnTimer - dt);
        if (unit.respawnTimer <= 0) {
          unit.hp = stats.unitMaxHp;
          unit.maxHp = stats.unitMaxHp;
          unit.x = tower.x;
          unit.y = tower.y;
          unit.engagedEnemyId = null;
        }
        continue;
      }

      const angle = (i / unitCount) * Math.PI * 2 + 0.35;
      const homeX = rally.x + Math.cos(angle) * spreadRadius;
      const homeY = rally.y + Math.sin(angle) * spreadRadius;

      // Ieškome žemės priešo arti Rally Point
      let enemy =
        unit.engagedEnemyId !== null
          ? this.enemies.find((e) => e.uid === unit.engagedEnemyId && e.hp > 0)
          : null;

      if (enemy && Math.hypot(enemy.x - rally.x, enemy.y - rally.y) > 78) {
        enemy = null;
        unit.engagedEnemyId = null;
      }

      if (!enemy) {
        enemy = this.enemies.find(
          (e) =>
            !e.isFlying &&
            (!e.isCamo || (e.camoRevealedTimer || 0) > 0) &&
            Math.hypot(e.x - rally.x, e.y - rally.y) <= 58
        );
        if (enemy) unit.engagedEnemyId = enemy.uid;
      }

      const targetX = enemy ? enemy.x - 10 : homeX;
      const targetY = enemy ? enemy.y : homeY;
      const dx = targetX - unit.x;
      const dy = targetY - unit.y;
      const dist = Math.hypot(dx, dy);
      const moveSpeed = 125 * dt;

      if (dist > 3) {
        const step = Math.min(dist, moveSpeed);
        unit.x += (dx / dist) * step;
        unit.y += (dy / dist) * step;
      }

      // Fizinis žemės priešo sustabdymas ir artima kova
      if (enemy && Math.hypot(enemy.x - unit.x, enemy.y - unit.y) <= 28) {
        enemy.isBlocked = true;
        this.damageEnemy(enemy, stats.unitDps * dt, { silentText: true });

        // Priešo kontrataka į robotą
        const enemyDps = enemy.isBoss ? 52 : 16 + (enemy.heartCost || 1) * 4;
        const unitDmgTaken = enemyDps * (1 - (stats.unitArmor || 0)) * dt;
        unit.hp -= unitDmgTaken;
        if (unit.hp <= 0) {
          unit.hp = 0;
          unit.respawnTimer = stats.respawnTime || 5.5;
          unit.engagedEnemyId = null;
        }
      } else if (unit.hp < stats.unitMaxHp) {
        // Lėtas savaiminis remontas ramybėje
        unit.hp = Math.min(stats.unitMaxHp, unit.hp + 12 * dt);
      }

      // Elektros Pjovėjų evoliucijos aura
      if (stats.electroAuraDps > 0 && unit.hp > 0) {
        unit.zapTimer = (unit.zapTimer || 0) - dt;
        for (const near of [...this.enemies]) {
          if (!near.isFlying && Math.hypot(near.x - unit.x, near.y - unit.y) <= (stats.electroAuraRadius || 60)) {
            this.damageEnemy(near, stats.electroAuraDps * dt, { silentText: true });
          }
        }
      }
    }
  }

  // -------------------- 5. ŠALČIO / ŠILAUOGIŲ KATAPULTA --------------------
  updateBerryCatapultTower(tower, stats, dt) {
    if (tower.cooldownLeft > 0) {
      tower.cooldownLeft = Math.max(0, tower.cooldownLeft - dt * (tower.effectiveFireRateMult || 1));
    }
    if (tower.cooldownLeft > 0) return;

    const range = tower.effectiveRange || stats.range;
    const candidates = this.enemies.filter(
      (e) =>
        this.isEnemyVisibleToTower(stats, e) &&
        Math.hypot(e.x - tower.x, e.y - tower.y) <= range
    );
    if (candidates.length === 0) return;

    const target = selectTargetByPriority(candidates, tower, tower.priority);
    if (!target) return;

    tower.cooldownLeft = stats.cooldown;
    tower.shotCounter = (tower.shotCounter || 0) + 1;
    tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);

    const freezeShot =
      Boolean(stats.freezeEveryNShots) && tower.shotCounter % stats.freezeEveryNShots === 0;
    const burstCount = stats.burstCount || 1;

    for (let b = 0; b < burstCount; b++) {
      const burstTarget = candidates[b % candidates.length] || target;
      const spreadAngle = burstCount > 1 ? (b - 1) * 0.45 : 0;
      const spreadX = burstCount > 1 ? Math.cos(spreadAngle) * 18 : 0;
      const spreadY = burstCount > 1 ? Math.sin(spreadAngle) * 18 : 0;

      this.parabolicShots.push({
        startX: tower.x,
        startY: tower.y - 10,
        targetX: burstTarget.x + spreadX,
        targetY: burstTarget.y + spreadY,
        x: tower.x,
        y: tower.y - 10,
        groundY: tower.y,
        elapsed: 0,
        flightTime: 0.48 + b * 0.06,
        arcHeight: stats.arcHeight || 66,
        damage: stats.damage,
        splashRadius: stats.splashRadius || 68,
        slowFactor: 1 - (stats.slowPercentage || 0.35),
        slowDuration: stats.slowDuration || 2.5,
        freezeDuration: freezeShot ? stats.freezeDuration || 1.7 : 0,
        color: freezeShot ? '#60a5fa' : stats.color
      });
    }
  }

  impactParabolicShot(shot) {
    this.explosions.push({
      x: shot.targetX,
      y: shot.targetY,
      radius: shot.splashRadius,
      color: shot.freezeDuration > 0 ? '#93c5fd' : shot.color,
      life: 0.28,
      maxLife: 0.28
    });

    for (const enemy of [...this.enemies]) {
      if (enemy.isFlying) continue;
      const dist = Math.hypot(enemy.x - shot.targetX, enemy.y - shot.targetY);
      if (dist <= shot.splashRadius) {
        enemy.slowFactor = Math.min(enemy.slowFactor, shot.slowFactor);
        enemy.slowTimer = Math.max(enemy.slowTimer, shot.slowDuration);
        if (shot.freezeDuration > 0) {
          enemy.stunTimer = Math.max(
            enemy.stunTimer,
            enemy.isBoss ? shot.freezeDuration * 0.45 : shot.freezeDuration
          );
        }
        const falloff = dist < shot.splashRadius * 0.5 ? 1 : 0.75;
        this.damageEnemy(enemy, Math.round(shot.damage * falloff));
      }
    }
  }

  // -------------------- 6. SAULĖS BATERIJŲ STOTIS --------------------
  updateSolarStationTower(tower, stats, dt) {
    const waveIsRunning = this.waveActive || this.enemies.length > 0;
    if (!waveIsRunning) return;

    tower.incomeTimer = (tower.incomeTimer || 0) + dt;
    const interval = stats.incomeInterval || 6.0;
    if (tower.incomeTimer >= interval) {
      tower.incomeTimer -= interval;
      const gain = stats.incomeAmount || 15;
      this.coins += gain;
      this.addFloatingText(tower.x, tower.y - 26, `+${gain} 🪙 ☀️`, '#fde047');
      this.notifyStateChange();
    }

    if (stats.lightningInterval && this.enemies.length > 0) {
      tower.lightningTimer = (tower.lightningTimer || 0) + dt;
      if (tower.lightningTimer >= stats.lightningInterval) {
        tower.lightningTimer = 0;
        const strongest = selectTargetByPriority(this.enemies, tower, 'strong');
        if (strongest) {
          this.lightningBolts.push({
            x1: strongest.x,
            y1: 0,
            x2: strongest.x,
            y2: strongest.y,
            life: 0.32,
            maxLife: 0.32
          });
          this.explosions.push({
            x: strongest.x,
            y: strongest.y,
            radius: 44,
            color: '#fde047',
            life: 0.26,
            maxLife: 0.26
          });
          this.damageEnemy(strongest, stats.lightningDamage || 420, { armorPierce: 0.5 });
        }
      }
    }
  }

  impactDirectProjectile(proj) {
    if (proj.splashRadius > 0) {
      this.explosions.push({
        x: proj.tx,
        y: proj.ty,
        radius: proj.splashRadius,
        color: proj.color,
        life: 0.24,
        maxLife: 0.24
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

  damageEnemy(enemy, rawAmount, options = {}) {
    if (!enemy || enemy.hp <= 0) return false;
    const armorPierce = options.armorPierce || 0;
    const effectiveArmor = Math.max(0, (enemy.armor || 0) * (1 - armorPierce));
    const vulnMult = enemy.scannerVulnerable ? 1.2 : 1.0;
    const finalDamage = rawAmount * (1 - effectiveArmor) * vulnMult;

    enemy.hp -= finalDamage;
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
      return true;
    }
    return false;
  }

  // ==================== ATVAIZDAVIMAS ANT DROBĖS ====================
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

    // 4. Veikimo spindulio (Range) ir auros peržiūra
    if (this.selectedPadIndex !== null && this.map.pads[this.selectedPadIndex]) {
      const pad = this.map.pads[this.selectedPadIndex];
      const existingTower = this.getTowerAtPad(this.selectedPadIndex);

      if (existingTower) {
        const stats = getTowerStats(existingTower.type, existingTower.level, existingTower.evolutionId);
        if (stats) {
          const effR = existingTower.effectiveRange || stats.range;
          this.drawRangeCircle(ctx, pad.x, pad.y, effR, stats.color, false);
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

    // 6. Garso bangos (su muzikinėmis natomis) ir sprogimai
    for (const pulse of this.pulses) {
      const p = 1 - pulse.life / pulse.maxLife;
      const r = pulse.maxRadius * p;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p) * 0.7;
      ctx.strokeStyle = pulse.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, r, 0, Math.PI * 2);
      ctx.stroke();
      if (pulse.isMusical) {
        ctx.fillStyle = '#fef08a';
        ctx.font = '14px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let n = 0; n < 4; n++) {
          const ang = (n * Math.PI) / 2 + p * 1.4;
          ctx.fillText(n % 2 === 0 ? '♪' : '♫', pulse.x + Math.cos(ang) * r, pulse.y + Math.sin(ang) * r);
        }
      }
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

    // 7. Dronų radaro skenavimas ir Barakų Rally Point vėliavėlės + robotai-vejapjovės
    for (const tower of this.towers) {
      const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
      if (tower.type === 'drone_hangar') {
        const radR = stats.camoRevealRadius || 160;
        ctx.save();
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, radR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(45, 212, 191, 0.45)';
        ctx.beginPath();
        ctx.moveTo(tower.x, tower.y);
        ctx.lineTo(
          tower.x + Math.cos(tower.radarAngle || 0) * radR,
          tower.y + Math.sin(tower.radarAngle || 0) * radR
        );
        ctx.stroke();
        ctx.restore();
      } else if (tower.type === 'mower_barracks' && tower.rallyPoint) {
        ctx.save();
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.32)';
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
          ctx.save();
          if (stats.electroAuraDps > 0) {
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(u.x, u.y, stats.electroAuraRadius || 60, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = stats.color;
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(u.x, u.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = '11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🤖', u.x, u.y + 1);

          const uRatio = Math.max(0, Math.min(1, u.hp / u.maxHp));
          ctx.fillStyle = '#020617';
          ctx.fillRect(u.x - 10, u.y - 16, 20, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(u.x - 10, u.y - 16, 20 * uRatio, 4);
          ctx.restore();
        }
      }
    }

    // 8. Pastatyti bokšteliai
    for (const tower of this.towers) {
      const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
      const isSelected = this.selectedPadIndex === tower.padIndex;
      const priorityMeta = getTargetingPriorityMeta(tower.priority);

      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isSelected ? '#fde047' : stats.color;
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 23, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (tower.type !== 'solar_station' && tower.type !== 'mower_barracks') {
        ctx.save();
        ctx.translate(tower.x, tower.y);
        ctx.rotate(tower.angle);
        ctx.fillStyle = stats.color;
        ctx.fillRect(4, -3.5, 19, 7);
        ctx.restore();
      }

      ctx.font = '19px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tower.evolutionId ? stats.evolutionIcon : stats.icon, tower.x, tower.y + 1);

      ctx.font = 'bold 10px Outfit, sans-serif';
      ctx.fillStyle = tower.level === 4 ? '#f472b6' : '#fde047';
      ctx.fillText(tower.level === 4 ? '✦✦✦✦' : '★'.repeat(tower.level), tower.x, tower.y - 29);

      ctx.font = '12px Outfit, sans-serif';
      ctx.fillText(priorityMeta.icon, tower.x + 19, tower.y + 18);

      // Aurų indikatoriai (+greitis / +nuotolis)
      if (tower.speedAuraPct > 0 || tower.rangeAuraPct > 0) {
        ctx.font = 'bold 9px Outfit, sans-serif';
        ctx.fillStyle = '#a7f3d0';
        const auraTxt = [
          tower.speedAuraPct > 0 ? `+${tower.speedAuraPct}%⚡` : '',
          tower.rangeAuraPct > 0 ? `+${tower.rangeAuraPct}%🔭` : ''
        ]
          .filter(Boolean)
          .join(' ');
        ctx.fillText(auraTxt, tower.x, tower.y + 30);
      }
      ctx.restore();
    }

    // 9. Ištisiniai Saulės Lazerio spinduliai ir trumpi šūviai
    for (const tower of this.towers) {
      if (tower.type === 'solar_laser' && Array.isArray(tower.activeBeams)) {
        for (const b of tower.activeBeams) {
          const width = 2.5 + (b.ramp - 1) * 2.8;
          ctx.save();
          ctx.strokeStyle = b.color;
          ctx.lineWidth = width + 3;
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          ctx.moveTo(b.x1, b.y1);
          ctx.lineTo(b.x2, b.y2);
          ctx.stroke();

          ctx.globalAlpha = 1;
          ctx.strokeStyle = b.ramp >= 2 ? '#fde047' : '#ffffff';
          ctx.lineWidth = width;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    for (const beam of this.beams) {
      const alpha = Math.max(0, beam.life / beam.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
      ctx.restore();
    }

    for (const bolt of this.lightningBolts) {
      const alpha = Math.max(0, bolt.life / bolt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
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

    // 10. Priešai
    for (const enemy of this.enemies) {
      ctx.save();
      if (enemy.isCamo && (enemy.camoRevealedTimer || 0) <= 0) {
        ctx.globalAlpha = 0.42;
      }

      if (enemy.isFlying) {
        // Skrendančio priešo šešėlis žemiau
        ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + 18, enemy.radius * 0.85, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle =
        enemy.hitFlash > 0
          ? '#ffffff'
          : enemy.stunTimer > 0
            ? '#93c5fd'
            : enemy.slowTimer > 0
              ? '#38bdf8'
              : enemy.color;
      ctx.strokeStyle = enemy.borderColor;
      ctx.lineWidth = enemy.isBoss ? 3 : 2;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (enemy.isFlying) {
        ctx.font = '11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪽', enemy.x, enemy.y - enemy.radius - 13);
      } else if (enemy.isCamo) {
        ctx.font = '11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👁️', enemy.x, enemy.y - enemy.radius - 13);
      } else if (enemy.isBoss) {
        ctx.font = '15px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👑', enemy.x, enemy.y - enemy.radius - 14);
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

    // 11. Skraidantys Dronų Angaro mini dronai
    for (const tower of this.towers) {
      if (tower.type === 'drone_hangar') {
        for (const d of tower.drones) {
          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(d.angle);
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(-7, -6);
          ctx.lineTo(-4, 0);
          ctx.lineTo(-7, 6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 12. Sviediniai (tiesūs ir paraboliniai)
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

    for (const shot of this.parabolicShots) {
      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
      ctx.beginPath();
      ctx.ellipse(shot.x, shot.groundY, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = shot.color;
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 13. Plaukiojantys tekstai
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

    // 14. Rally Point režimo pranešimas arba Pauzės uždanga
    if (this.placingRallyPadIndex !== null && !this.gameResult) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(w / 2 - 220, 12, 440, 36);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.strokeRect(w / 2 - 220, 12, 440, 36);
      ctx.fillStyle = '#bbf7d0';
      ctx.font = '700 15px Fredoka, Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚩 Paspausk ant kelio spindulyje, kad perkeltum robotus!', w / 2, 30);
      ctx.restore();
    } else if (this.manualPaused && !this.gameResult) {
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
