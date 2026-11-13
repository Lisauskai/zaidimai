// Test Build 6 – Sutvarkyta Augintinio (Pet) aktyvaus įgūdžio fizika (ugnies kamuolys / lazeris sunaikina strėles ore!),
// nauji Kalvės šarvai/skydai/ginklai ir plastinė herojaus animacija!

import { GEAR_ITEMS, PET_ITEMS, computePlayerBonuses, resolveItemThemeHex } from './shop.js';
import { audio } from './audio.js';
import { particles } from './particles.js';

export class Player {
  constructor(profile) {
    this.profile = profile;
    this.bonuses = computePlayerBonuses(profile);

    this.width = 40;
    this.standHeight = 54;
    this.crouchHeight = 28;
    this.height = this.standHeight;

    this.x = 100;
    this.y = 350;
    this.vx = 0;
    this.vy = 0;

    this.facing = 1;
    this.onGround = false;
    this.isCrouching = false;
    this.slideBoostTimer = 0;
    this.jumpsUsed = 0;
    this.jumpKeyHold = false;

    this.maxHearts = this.bonuses.maxHearts;
    this.hearts = this.maxHearts;
    this.shields = this.bonuses.maxShields;
    this.helperCharges = this.bonuses.helperCharges;

    this.bowCooldownTimer = 0;
    this.boomerangCooldownTimer = 0;
    this.boomerangInFlight = false;
    this.meleeCooldownTimer = 0;
    this.slashTimer = 0;
    this.slashMaxTimer = 14;

    this.lastSafeX = 100;
    this.lastSafeY = 340;

    // Augintinio aktyvaus įgūdžio laikmatis, Fenikso užduočių skaitiklis ir vizualiniai efektai
    this.petSkillTimer = 0;
    this.phoenixTasksSolved = 0;
    this.petAttackEffects = [];

    // Teleportacijos apsauga, kad nešokinėtų tarp durų kiekviename kadre
    this.teleportCooldown = 0;

    this.invincibleTimer = 0;
    this.animFrame = 0;

    this.petX = this.x - 48;
    this.petY = this.y - 26;
  }

  refreshBonusesKeepHealth() {
    const oldMax = this.maxHearts || 3;
    this.bonuses = computePlayerBonuses(this.profile);
    this.maxHearts = this.bonuses.maxHearts;
    const diff = this.maxHearts - oldMax;
    if (diff > 0) {
      this.hearts = Math.min(this.maxHearts, this.hearts + diff);
    } else {
      this.hearts = Math.min(this.maxHearts, Math.max(0.5, this.hearts));
    }
    this.shields = Math.max(this.shields, this.bonuses.maxShields);
  }

  resetForLevel(startX = 100, startY = 340) {
    this.bonuses = computePlayerBonuses(this.profile);

    this.height = this.standHeight;
    this.isCrouching = false;
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpsUsed = 0;

    this.maxHearts = this.bonuses.maxHearts;
    this.hearts = this.maxHearts;
    this.shields = this.bonuses.maxShields;
    this.helperCharges = this.bonuses.helperCharges;
    this.bowCooldownTimer = 0;
    this.boomerangCooldownTimer = 0;
    this.boomerangInFlight = false;
    this.meleeCooldownTimer = 0;
    this.slashTimer = 0;
    this.lastSafeX = startX;
    this.lastSafeY = startY;
    this.petSkillTimer = 0;
    this.phoenixTasksSolved = 0;
    this.petAttackEffects = [];
    this.teleportCooldown = 0;
    this.invincibleTimer = 0;
    this.petX = this.x - 48;
    this.petY = this.y - 26;
  }

  tryJump(worldId = 1) {
    const maxJumps = this.bonuses.maxJumps;
    if (this.onGround || this.jumpsUsed < maxJumps) {
      const isMulti = !this.onGround && this.jumpsUsed > 0;
      const baseJump = isMulti ? -11.6 : -12.8;
      // 5 Pasaulis (Kosmoso Stotis): Maža gravitacija – šuolis ~1.5x aukštesnis!
      const spaceMult = worldId === 5 ? 1.05 : 1.0;
      this.vy = baseJump * this.bonuses.jumpMult * spaceMult;
      this.onGround = false;
      this.jumpsUsed++;
      audio.jump(isMulti);
      particles.emitJumpDust(this.x + this.width / 2, this.y + this.height, isMulti);
    }
  }

  tryMeleeSlash() {
    if (this.meleeCooldownTimer > 0) return null;

    this.meleeCooldownTimer = 22;
    this.slashTimer = this.slashMaxTimer;
    audio.swordSlash();

    const dir = this.facing;
    const reach = 56;
    const hitboxX = dir === 1 ? this.x + this.width - 6 : this.x - reach + 6;
    const hitboxY = this.y - 6;
    const hitboxH = this.height + 12;

    return {
      x: hitboxX,
      y: hitboxY,
      w: reach,
      h: hitboxH,
      damage: this.bonuses.weaponDamage || 1
    };
  }

  // 1 PUNKTAS (Test Build 8): Lanko fizika – strėlė skrenda PARABOLE (lanku su vy = -4.8 ir gravitacija),
  // o ne tiesia linija per visą ekraną!
  tryShootArrow() {
    if (!this.bonuses.isRanged) return null;
    if (this.bowCooldownTimer > 0) return null;

    this.bowCooldownTimer = this.bonuses.shootCooldown || 56;
    this.slashTimer = 10;
    audio.bowShoot();

    const dir = this.facing;
    const startX = dir === 1 ? this.x + this.width + 2 : this.x - 24;
    const startY = this.isCrouching ? this.y + 10 : this.y + 18;

    return {
      x: startX,
      startX,
      y: startY,
      startY,
      w: 22,
      h: 7,
      vx: dir * (this.bonuses.arrowSpeed || 7.2),
      vy: -4.8,
      gravity: 0.28,
      maxDistance: 330,
      lifeFrames: 180,
      damage: this.bonuses.weaponDamage || 1,
      color: this.bonuses.arrowColor || '#fde047',
      active: true
    };
  }

  // Naujas ginklo tipas: BUMERANGAS!
  // Skrenda į priekį (~pusę ekrano), sulėtėja, apsisuka ir grįžta pas herojų, kirsdamas kiaurai priešus į abi puses!
  tryThrowBoomerang(activeCount = 0) {
    if (!this.bonuses.isBoomerang) return null;
    if (activeCount > 0 || this.boomerangInFlight || this.boomerangCooldownTimer > 0) return null;

    this.boomerangInFlight = true;
    this.boomerangCooldownTimer = 18;
    this.slashTimer = 10;
    audio.bowShoot();

    const dir = this.facing;
    const speed = this.bonuses.boomerangSpeed || 9.0;
    const startX = dir === 1 ? this.x + this.width : this.x - 28;
    const startY = this.isCrouching ? this.y + 6 : this.y + 14;

    return {
      x: startX,
      startX,
      y: startY,
      startY,
      w: 28,
      h: 28,
      vx: dir * speed,
      vy: 0,
      dir,
      speed,
      maxSpeed: speed,
      maxDistance: this.bonuses.boomerangMaxDist || 450,
      traveled: 0,
      lifeFrames: 360,
      phase: 'outbound', // 'outbound' | 'returning'
      spinAngle: 0,
      damage: this.bonuses.weaponDamage || 1,
      color: this.bonuses.boomerangColor || '#b45309',
      trim: this.bonuses.boomerangTrim || '#fde047',
      bladeColor: this.bonuses.boomerangColor || '#b45309',
      trimColor: this.bonuses.boomerangTrim || '#fde047',
      hitForwardIds: new Set(),
      hitReturnIds: new Set(),
      active: true
    };
  }

  canStandUp(platforms) {
    const testRect = {
      x: this.x + 2,
      y: this.y + this.height - this.standHeight,
      w: this.width - 4,
      h: this.standHeight
    };
    for (const plat of platforms) {
      if (plat.type === 'oneway' || plat.type === 'moving_h' || plat.type === 'moving_v' || plat.type === 'crumble' || plat.broken) continue;
      if (
        testRect.x < plat.x + plat.w &&
        testRect.x + testRect.w > plat.x &&
        testRect.y < plat.y + plat.h &&
        testRect.y + testRect.h > plat.y
      ) {
        return false;
      }
    }
    return true;
  }

  // ==================== 3 SKIRTINGOS AUGINTINIŲ MAGIJOS (Test Build 7) ====================

  // 1) DRAKONIUKAS (Kovinis – pet_dragon):
  // Kas X sekundžių automatiškai iššauna ugnies kamuolį į arčiausiai esantį priešą (atimdamas jam 1 HP)!
  tryPetDragonAttack(enemies = [], onHitEnemy = null) {
    if (this.profile.equippedPet !== 'pet_dragon') return false;
    if (this.petSkillTimer > 0) return false;

    const heroCx = this.x + this.width / 2;
    const heroCy = this.y + this.height / 2;

    let nearest = null;
    let bestDist = 440; // paieškos spindulys aplink herojų

    for (const en of enemies) {
      if (!en.alive) continue;
      const ex = en.x + en.w / 2;
      const ey = en.y + en.h / 2;
      const d = Math.hypot(ex - heroCx, ey - heroCy);
      if (d < bestDist) {
        bestDist = d;
        nearest = en;
      }
    }

    if (!nearest) return false;

    const maxCd = this.bonuses.petCooldownFrames || 480;
    this.petSkillTimer = maxCd;

    const targetX = nearest.x + nearest.w / 2;
    const targetY = nearest.y + nearest.h / 2;

    this.petAttackEffects.push({
      fromX: this.petX + 14,
      fromY: this.petY + 12,
      toX: targetX,
      toY: targetY,
      color: '#f97316',
      petId: 'pet_dragon',
      timer: 22,
      maxTimer: 22
    });

    audio.petSkill();
    particles.emit(targetX, targetY, 22, {
      colors: ['#f97316', '#ef4444', '#fde047', '#ffffff']
    });
    particles.addFloatingText(
      targetX,
      targetY - 22,
      `🐉 UGNIES KAMUOLYS (Lv.${this.bonuses.petLevel})!`,
      '#f97316',
      17
    );

    if (onHitEnemy) {
      onHitEnemy(nearest, this.bonuses.petFireballDamage || 1);
    }
    return true;
  }

  // 2) DRONAS / SKYDAS (Gynybinis – pet_cyber):
  // Automatiškai numuša atskrendančias priešo strėles ir jas ištrina!
  tryPetInterceptProjectile(proj) {
    if (this.profile.equippedPet !== 'pet_cyber') return false;
    const maxCd = this.bonuses.petCooldownFrames || this.bonuses.petArrowBlockFrames || 480;
    if (this.petSkillTimer > 0) return false;

    this.petSkillTimer = maxCd;
    this.profile.stats.arrowsBlocked = (this.profile.stats.arrowsBlocked || 0) + 1;

    const effectColor = '#38bdf8';
    const targetX = proj.x + (proj.w || 20) / 2;
    const targetY = proj.y + (proj.h || 8) / 2;

    this.petAttackEffects.push({
      fromX: this.petX + 14,
      fromY: this.petY + 12,
      toX: targetX,
      toY: targetY,
      color: effectColor,
      petId: 'pet_cyber',
      timer: 20,
      maxTimer: 20
    });

    audio.petSkill();
    particles.emit(targetX, targetY, 22, {
      colors: [effectColor, '#fde047', '#22d3ee', '#ffffff']
    });
    particles.addFloatingText(
      targetX,
      targetY - 18,
      `🤖 DRONO SKYDAS (Lv.${this.bonuses.petLevel}) NUMUŠĖ STRĖLĘ!`,
      '#38bdf8',
      17
    );
    return true;
  }

  // 3) FENIKSAS (Gydantis – pet_phoenix):
  // Kas 30 s (aukštesniuose lygiuose greičiau) arba išsprendus 3 užduotis pasyviai atstato herojui +1 prarastą širdelę!
  tryPetPhoenixHeal(fromSolvedTask = false) {
    if (this.profile.equippedPet !== 'pet_phoenix') return false;

    const tasksNeeded = this.bonuses.petTasksToHeal || 3;
    const maxCd = this.bonuses.petCooldownFrames || 1800;

    if (fromSolvedTask) {
      this.phoenixTasksSolved = (this.phoenixTasksSolved || 0) + 1;
    }

    // Jei herojaus gyvybės pilnos – laikmatis laukia paruoštas
    if (this.hearts >= this.maxHearts) {
      return false;
    }

    const readyByTasks = (this.phoenixTasksSolved || 0) >= tasksNeeded;
    const readyByTimer = this.petSkillTimer <= 0;

    if (!readyByTasks && !readyByTimer) {
      return false;
    }

    this.hearts = Math.min(this.maxHearts, Math.round((this.hearts + 1) * 2) / 2);
    this.petSkillTimer = maxCd;
    this.phoenixTasksSolved = 0;

    const targetX = this.x + this.width / 2;
    const targetY = this.y + this.height / 2;

    this.petAttackEffects.push({
      fromX: this.petX + 14,
      fromY: this.petY + 12,
      toX: targetX,
      toY: targetY,
      color: '#facc15',
      petId: 'pet_phoenix',
      timer: 26,
      maxTimer: 26
    });

    audio.crystal();
    particles.emit(targetX, targetY, 24, {
      colors: ['#facc15', '#4ade80', '#f97316', '#ffffff']
    });
    particles.addFloatingText(
      targetX,
      this.y - 18,
      `🦅✨ FENIKSAS PAGYDĖ +1 ❤️!`,
      '#4ade80',
      19
    );
    return true;
  }

  tryBlockProjectile(proj) {
    if (this.bonuses.canBlockArrows && this.isCrouching) {
      this.profile.stats.arrowsBlocked = (this.profile.stats.arrowsBlocked || 0) + 1;
      audio.shieldBreak();
      particles.emit(this.x + (this.facing === 1 ? this.width : 0), this.y + this.height / 2, 12, {
        colors: ['#38bdf8', '#fde047', '#ffffff']
      });
      particles.addFloatingText(this.x + this.width / 2, this.y - 12, '🛡️ SKYDAS ATMUŠĖ!', '#fde047', 18);
      return true;
    }
    if (this.tryPetInterceptProjectile(proj)) {
      return true;
    }
    return false;
  }

  takeDamage(amount = 1, isEnemyContact = false, bypassShieldBubble = false) {
    if (!bypassShieldBubble && this.invincibleTimer > 0) return false;

    if (!bypassShieldBubble && this.shields > 0) {
      this.shields--;
      this.invincibleTimer = 70;
      audio.shieldBreak();
      particles.addFloatingText(this.x + this.width / 2, this.y - 10, '🫧 Burbulas apsaugojo!', '#38bdf8', 18);
      return false;
    }

    const actualDamage = (isEnemyContact && this.bonuses.halfDamage && amount === 1) ? 0.5 : amount;

    const wasFullHealth = this.hearts >= this.maxHearts;
    this.hearts = Math.max(0, Math.round((this.hearts - actualDamage) * 2) / 2);

    // Jei žaidėjas turi Feniksą ir ką tik prarado pirmąją širdelę, paleidžiame 30s (arba lygio) gydymo laikmatį!
    if (this.profile.equippedPet === 'pet_phoenix' && wasFullHealth && this.petSkillTimer <= 0) {
      this.petSkillTimer = this.bonuses.petCooldownFrames || 1800;
    }

    this.invincibleTimer = 75;
    audio.hurt();
    particles.addFloatingText(
      this.x + this.width / 2,
      this.y - 10,
      `-${actualDamage === 0.5 ? '½' : actualDamage} ❤️`,
      '#ef4444',
      20
    );
    return this.hearts <= 0;
  }

  update(input, platforms, worldId = 1) {
    this.animFrame++;
    if (this.invincibleTimer > 0) this.invincibleTimer--;
    if (this.slideBoostTimer > 0) this.slideBoostTimer--;
    if (this.bowCooldownTimer > 0) this.bowCooldownTimer--;
    if (this.boomerangCooldownTimer > 0) this.boomerangCooldownTimer--;
    if (this.meleeCooldownTimer > 0) this.meleeCooldownTimer--;
    if (this.slashTimer > 0) this.slashTimer--;
    if (this.petSkillTimer > 0) this.petSkillTimer--;
    if (this.teleportCooldown > 0) this.teleportCooldown--;

    for (let i = this.petAttackEffects.length - 1; i >= 0; i--) {
      this.petAttackEffects[i].timer--;
      if (this.petAttackEffects[i].timer <= 0) {
        this.petAttackEffects.splice(i, 1);
      }
    }

    if (input.down && !this.isCrouching) {
      this.isCrouching = true;
      this.y += this.standHeight - this.crouchHeight;
      this.height = this.crouchHeight;
      if (this.onGround && Math.abs(this.vx) > 2.2) {
        this.slideBoostTimer = 18;
        particles.emitJumpDust(this.x + this.width / 2, this.y + this.height, false);
      }
    } else if (!input.down && this.isCrouching) {
      if (this.canStandUp(platforms)) {
        this.y -= this.standHeight - this.crouchHeight;
        this.height = this.standHeight;
        this.isCrouching = false;
      }
    }

    const baseSpeed = 4.4 * this.bonuses.speedMult;
    // Pilna Tamsi/Juoda („Šešėlių nindzė“): pasilenkus (slėpiantis) greitis PADIDĖJA!
    const crouchMult = this.bonuses.crouchSpeedBoost
      ? (this.slideBoostTimer > 0 ? 1.55 : 1.35)
      : (this.slideBoostTimer > 0 ? 1.18 : 0.65);
    const moveSpeed = this.isCrouching
      ? baseSpeed * crouchMult
      : baseSpeed;

    // 3 Pasaulis (Ledo Karalystė): SLYDIMAS ant ledo (sumažinta trintis, sunkiau sustoti!)
    const isIceWorld = worldId === 3;
    if (isIceWorld) {
      if (input.left) {
        this.vx += (-moveSpeed * 1.08 - this.vx) * 0.14;
        this.facing = -1;
      } else if (input.right) {
        this.vx += (moveSpeed * 1.08 - this.vx) * 0.14;
        this.facing = 1;
      } else {
        this.vx *= 0.945; // Ledo slydimas!
        if (Math.abs(this.vx) < 0.06) this.vx = 0;
      }
    } else {
      if (input.left) {
        this.vx = -moveSpeed;
        this.facing = -1;
      } else if (input.right) {
        this.vx = moveSpeed;
        this.facing = 1;
      } else {
        this.vx *= 0.78;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
      }
    }

    if (input.jump && !this.jumpKeyHold) {
      if (!this.isCrouching || this.canStandUp(platforms)) {
        if (this.isCrouching) {
          this.y -= this.standHeight - this.crouchHeight;
          this.height = this.standHeight;
          this.isCrouching = false;
        }
        this.tryJump(worldId);
      }
      this.jumpKeyHold = true;
    } else if (!input.jump) {
      this.jumpKeyHold = false;
    }

    this.x += this.vx;
    if (this.x < 10) this.x = 10;

    for (const plat of platforms) {
      if (
        plat.type === 'oneway' ||
        plat.type === 'moving_h' ||
        plat.type === 'moving_v' ||
        plat.type === 'crumble' ||
        plat.broken
      ) {
        continue;
      }
      if (this.intersects(plat)) {
        if (this.vx > 0) {
          this.x = plat.x - this.width;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = plat.x + plat.w;
          this.vx = 0;
        }
      }
    }

    const prevBottom = this.y + this.height;
    // 5 Pasaulis (Kosmoso Stotis): Maža gravitacija (0.38 vietoj 0.58 -> herojus pašoka 1.5x aukščiau ir ilgiau sklendžia ore!)
    const grav = worldId === 5 ? 0.38 : 0.58;
    const maxFall = worldId === 5 ? 9.5 : 14;
    this.vy += grav;
    if (this.vy > maxFall) this.vy = maxFall;
    this.y += this.vy;
    this.onGround = false;

    for (const plat of platforms) {
      if (plat.broken) continue;
      const isOneWayOrKinematic =
        plat.type === 'oneway' ||
        plat.type === 'moving_h' ||
        plat.type === 'moving_v' ||
        plat.type === 'crumble';

      if (this.intersects(plat)) {
        if (isOneWayOrKinematic) {
          const tolerance = plat.type === 'moving_v' ? 20 : 16;
          if (this.vy >= 0 && prevBottom <= plat.y + tolerance) {
            this.y = plat.y - this.height;
            this.vy = 0;
            this.onGround = true;
            this.jumpsUsed = 0;
            if (plat.vx) this.x += plat.vx;
            if (plat.vy) this.y += plat.vy;
            if (plat.type === 'crumble' && !plat.shaking) {
              plat.shaking = true;
            }
            if (plat.type === 'oneway' && !plat.isSecret) {
              this.lastSafeX = this.x;
              this.lastSafeY = this.y;
            }
          }
        } else {
          if (this.vy > 0 && prevBottom <= plat.y + 18) {
            this.y = plat.y - this.height;
            this.vy = 0;
            this.onGround = true;
            this.jumpsUsed = 0;
            if (plat.type === 'ground') {
              this.lastSafeX = Math.max(plat.x + 16, Math.min(plat.x + plat.w - this.width - 16, this.x));
              this.lastSafeY = this.y;
            }
          } else if (this.vy < 0) {
            this.y = plat.y + plat.h;
            this.vy = 0;
          }
        }
      }
    }

    if ((this.profile.stats.currentStreak || 0) >= 3) {
      particles.emitComboFire(this.x + this.width / 2, this.y + this.height / 2);
    }

    // Pilna Auksinė/Geltona („Elegantiškas“): eidamas palieka auksines žvaigždutes!
    if (
      this.bonuses.colorSynergy?.color === 'gold' &&
      Math.abs(this.vx) > 0.4 &&
      this.animFrame % 5 === 0
    ) {
      particles.emit(
        this.x + this.width / 2 - this.facing * 12,
        this.y + this.height - 6,
        1,
        { colors: ['#facc15', '#fef08a', '#ffffff'], speed: 1.3, life: 22 }
      );
    }

    const targetPetX = this.x - this.facing * 48;
    const targetPetY = this.y - 20 + Math.sin(this.animFrame * 0.09) * 8;
    this.petX += (targetPetX - this.petX) * 0.14;
    this.petY += (targetPetY - this.petY) * 0.14;
  }

  intersects(rect) {
    return (
      this.x < rect.x + rect.w &&
      this.x + this.width > rect.x &&
      this.y < rect.y + rect.h &&
      this.y + this.height > rect.y
    );
  }

  draw(ctx, cameraX, showNameTag = true) {
    const sx = Math.round(this.x - cameraX);
    const sy = Math.round(this.y);
    const syn = this.bonuses ? this.bonuses.colorSynergy : null;

    const isMoving = Math.abs(this.vx) > 0.35;
    const breatheOffset = !this.isCrouching && !isMoving
      ? Math.sin(this.animFrame * 0.09) * 1.6
      : 0;
    const walkPhase = isMoving && this.onGround ? this.animFrame * 0.34 : 0;
    const legSwing = isMoving && this.onGround
      ? Math.sin(walkPhase) * 7
      : (!this.onGround ? 4 : 0);
    const armSwing = isMoving && this.onGround
      ? Math.cos(walkPhase) * 6
      : 0;

    if (this.profile.equippedPet) {
      this.drawPet(ctx, cameraX);
      this.drawPetAttackEffects(ctx, cameraX);
    }

    ctx.save();
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    } else if (syn && syn.color === 'dark') {
      // Pilna Tamsi/Juoda („Šešėlių nindzė“): žmogeliukas tampa pusiau permatomas (opacity 0.8)!
      ctx.globalAlpha = 0.80;
    }

    if (this.bonuses.activeSet) {
      this.drawSetAura(ctx, sx + this.width / 2, sy + this.height / 2, this.bonuses.activeSet);
    }

    // „Mados Sielos“ (Color Synergy) vizualinė transformacija aplink herojų!
    if (syn) {
      this.drawColorSynergyEffects(ctx, sx + this.width / 2, sy + this.height / 2, syn);
    }

    if (this.profile.upgrades.magnet > 1 || this.bonuses.magnetRadius > 60) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.11)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(sx + this.width / 2, sy + this.height / 2, this.bonuses.magnetRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.shields > 0) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx + this.width / 2, sy + this.height / 2, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    this.drawCape(ctx, sx, sy + breatheOffset);
    this.drawArticulatedLegs(ctx, sx, sy, legSwing);
    this.drawBackArmAndWeapon(ctx, sx, sy + breatheOffset, armSwing);

    const bodyY = (this.isCrouching ? sy + 8 : sy + 22) + breatheOffset;
    const bodyH = this.isCrouching ? 16 : 22;
    this.drawArmorBody(ctx, sx + 6, bodyY, 28, bodyH);

    const headCenterX = sx + 20 + (this.isCrouching ? this.facing * 4 : (isMoving ? this.facing * 1.5 : 0));
    const headCenterY = (this.isCrouching ? sy + 5 : sy + 11) + breatheOffset * 1.1;
    const headRadius = 13;

    this.drawBaseCharacterHead(ctx, headCenterX, headCenterY, headRadius);
    this.drawHat(ctx, headCenterX, headCenterY - headRadius);
    this.drawShield(ctx, sx, sy + breatheOffset, -armSwing);

    if (this.slashTimer > 0 && !this.bonuses.isRanged && !this.bonuses.isBoomerang) {
      this.drawMeleeSlashEffect(ctx, sx, sy);
    }

    if (showNameTag) {
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = (this.bonuses.activeSet || syn) ? '#fde047' : '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      const nameY = headCenterY - headRadius - 15;
      ctx.strokeText(this.profile.name, headCenterX, nameY);
      ctx.fillText(this.profile.name, headCenterX, nameY);
    }

    ctx.restore();
  }

  // ==================== „MADOS SIELOS“ (COLOR SYNERGY) VIZUALINIAI EFEKTAI ====================
  drawColorSynergyEffects(ctx, cx, cy, syn) {
    ctx.save();
    const t = (this.animFrame || Math.floor(Date.now() * 0.04)) * 0.08;

    if (syn.color === 'red') {
      // PILNA RAUDONA („Baisus / Agresyvus“): aplink kyla tamsiai raudoni dūmai!
      const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 38);
      grad.addColorStop(0, 'rgba(220, 38, 38, 0.32)');
      grad.addColorStop(0.65, 'rgba(127, 29, 29, 0.24)');
      grad.addColorStop(1, 'rgba(127, 29, 29, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const phase = (t * 1.4 + i * 1.05) % (Math.PI * 2);
        const riseProgress = phase / (Math.PI * 2);
        const smokeX = cx + Math.sin(t * 2 + i * 1.3) * 22;
        const smokeY = cy + 20 - riseProgress * 48;
        const smokeR = 5 + (1 - riseProgress) * 5;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(127, 29, 29, 0.62)' : 'rgba(220, 38, 38, 0.48)';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (syn.color === 'gold') {
      // PILNA AUKSINĖ/GELTONA („Elegantiškas“): švytinti karališka aura + auksinės žvaigždutės!
      const pulse = 36 + Math.sin(t * 2.2) * 4;
      const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, pulse);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0.42)');
      grad.addColorStop(0.65, 'rgba(234, 179, 8, 0.22)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.78)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 31 + Math.cos(t * 2) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Auksinės žvaigždutės aplink ir už herojaus
      for (let i = 0; i < 4; i++) {
        const ang = t * 1.5 + (i * Math.PI) / 2;
        const starX = cx + Math.cos(ang) * 28 - (Math.abs(this.vx) > 0.3 ? this.facing * (i * 5) : 0);
        const starY = cy + Math.sin(ang) * 22;
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#facc15';
        ctx.beginPath();
        ctx.moveTo(starX, starY - 5);
        ctx.lineTo(starX + 1.8, starY - 1.8);
        ctx.lineTo(starX + 5, starY);
        ctx.lineTo(starX + 1.8, starY + 1.8);
        ctx.lineTo(starX, starY + 5);
        ctx.lineTo(starX - 1.8, starY + 1.8);
        ctx.lineTo(starX - 5, starY);
        ctx.lineTo(starX - 1.8, starY - 1.8);
        ctx.closePath();
        ctx.fill();
      }
    } else if (syn.color === 'dark') {
      // PILNA TAMSI/JUODA („Šešėlių nindzė“): aplink juodi šešėliai!
      const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 36);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.55)');
      grad.addColorStop(0.7, 'rgba(30, 41, 59, 0.28)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const ang = -t * 1.7 + (i * Math.PI * 2) / 5;
        const shX = cx + Math.cos(ang) * 25;
        const shY = cy + Math.sin(ang) * 20;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(15, 23, 42, 0.75)' : 'rgba(51, 65, 85, 0.6)';
        ctx.beginPath();
        ctx.ellipse(shX, shY, 7, 4, ang, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (syn.color === 'green') {
      // PILNA ŽALIA („Gamtos sargas“): aplink skraido žali lapeliai!
      const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 35);
      grad.addColorStop(0, 'rgba(34, 197, 94, 0.26)');
      grad.addColorStop(1, 'rgba(22, 163, 74, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const ang = t * 1.3 + (i * Math.PI * 2) / 5;
        const lx = cx + Math.cos(ang) * 28;
        const ly = cy + Math.sin(ang * 1.2) * 22;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(ang + Math.sin(t + i) * 0.5);
        ctx.fillStyle = i % 2 === 0 ? '#22c55e' : '#4ade80';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else if (syn.color === 'blue') {
      // PILNA MĖLYNA („Ledo riteris“): šerkšno kristalai aplink herojų
      for (let i = 0; i < 4; i++) {
        const ang = t * 1.4 + (i * Math.PI) / 2;
        const bx = cx + Math.cos(ang) * 27;
        const by = cy + Math.sin(ang) * 22;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(bx, by, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawPetAttackEffects(ctx, cameraX) {
    for (const ef of this.petAttackEffects) {
      const progress = 1 - ef.timer / ef.maxTimer;
      const x1 = ef.fromX - cameraX;
      const y1 = ef.fromY;
      const x2 = ef.toX - cameraX;
      const y2 = ef.toY;

      ctx.save();
      // Ugnies arba Lazerio spindulys iš augintinio į priešo strėlę
      ctx.strokeStyle = ef.color;
      ctx.shadowColor = ef.color;
      ctx.shadowBlur = 14;
      ctx.lineWidth = Math.max(2, 7 * (1 - progress));
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Sprogimo / Skydo žiedas strėlės sunaikinimo vietoje
      const radius = 10 + progress * 28;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3 * (1 - progress);
      ctx.beginPath();
      ctx.arc(x2, y2, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Ugnies kamuolys skriejimo kelyje
      const ballX = x1 + (x2 - x1) * Math.min(1, progress * 1.6);
      const ballY = y1 + (y2 - y1) * Math.min(1, progress * 1.6);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawSetAura(ctx, cx, cy, activeSet) {
    ctx.save();
    const t = this.animFrame * 0.08;

    if (activeSet.auraType === 'fire') {
      const pulse = 36 + Math.sin(t * 2) * 5;
      const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, pulse);
      grad.addColorStop(0, 'rgba(249, 115, 22, 0.38)');
      grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.22)');
      grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 4; i++) {
        const angle = t * 1.5 + (i * Math.PI) / 2;
        const fx = cx + Math.cos(angle) * 28;
        const fy = cy + Math.sin(angle) * 22;
        ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#fde047';
        ctx.beginPath();
        ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (activeSet.auraType === 'cosmic') {
      const pulse = 38 + Math.cos(t * 2) * 4;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, t, t + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 3; i++) {
        const angle = -t * 1.8 + (i * Math.PI * 2) / 3;
        const sx = cx + Math.cos(angle) * 34;
        const sy = cy + Math.sin(angle) * 26;
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 34 + Math.sin(t) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawArticulatedLegs(ctx, sx, sy, legSwing) {
    ctx.save();
    if (!this.isCrouching) {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      this.roundRect(ctx, sx + 9 - legSwing * 0.8, sy + 41, 9, 13, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#334155';
      this.roundRect(ctx, sx + 21 + legSwing * 0.8, sy + 41, 9, 13, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx + 8 - legSwing * 0.8, sy + 49, 11, 5);
      ctx.fillRect(sx + 20 + legSwing * 0.8, sy + 49, 11, 5);
    } else {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      this.roundRect(ctx, sx + 6, sy + 20, 28, 8, 4);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBaseCharacterHead(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, r, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();

    const dir = this.facing;
    const isRedSynergy = this.bonuses?.colorSynergy?.color === 'red';

    if (isRedSynergy) {
      // Raudonos Mados Sielos: akys šviečia raudonai + agresyvūs antakiai
      ctx.save();
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + dir * 2 - 3, cy + 1, 2.7, 0, Math.PI * 2);
      ctx.arc(cx + dir * 2 + 4, cy + 1, 2.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(cx + dir * 2 - 6, cy - 3.5);
      ctx.lineTo(cx + dir * 2 - 1, cy - 1.2);
      ctx.moveTo(cx + dir * 2 + 7, cy - 3.5);
      ctx.lineTo(cx + dir * 2 + 2, cy - 1.2);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = this.bonuses.activeSet?.auraType === 'fire' ? '#f97316' : '#0f172a';
      ctx.beginPath();
      ctx.arc(cx + dir * 2 - 3, cy + 1, 2.2, 0, Math.PI * 2);
      ctx.arc(cx + dir * 2 + 4, cy + 1, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (isRedSynergy) {
      // Karinga šypsena / mina
      ctx.moveTo(cx + dir * 2 - 3.5, cy + 5.5);
      ctx.lineTo(cx + dir * 2 + 3.5, cy + 4.5);
    } else {
      ctx.arc(cx + dir * 2, cy + 4, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawCape(ctx, sx, sy) {
    const capeId = this.profile.equippedGear?.cape || 'cape_none';
    if (capeId === 'cape_none') return;
    const item = GEAR_ITEMS.find((g) => g.id === capeId);
    const v = item?.visual;
    if (!v || !v.length) return;

    const pal = resolveItemThemeHex(item);
    const mainCol = pal ? pal.hex : v.color;
    const trimCol = pal ? pal.trimHex : (v.trim || '#0f172a');

    const lengthBonus = (v.length - 1) * 5;
    const wave = Math.sin(this.animFrame * 0.22) * (Math.abs(this.vx) > 0.5 ? 10 : 3.5);

    ctx.save();
    if (capeId === 'cape_phoenix') {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
    }

    ctx.fillStyle = mainCol;
    ctx.strokeStyle = trimCol;
    ctx.lineWidth = 2.4;

    ctx.beginPath();
    if (this.facing === 1) {
      ctx.moveTo(sx + 10, sy + (this.isCrouching ? 8 : 22));
      ctx.lineTo(sx - 12 - lengthBonus - wave, sy + this.height - 4);
      ctx.lineTo(sx + 12, sy + this.height - 3);
    } else {
      ctx.moveTo(sx + this.width - 10, sy + (this.isCrouching ? 8 : 22));
      ctx.lineTo(sx + this.width + 12 + lengthBonus + wave, sy + this.height - 4);
      ctx.lineTo(sx + this.width - 12, sy + this.height - 3);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawArmorBody(ctx, x, y, w, h) {
    const armorId = this.profile.equippedGear?.armor || 'armor_none';
    const item = GEAR_ITEMS.find((g) => g.id === armorId);
    const v = item?.visual || { bodyColor: '#64748b', trimColor: '#94a3b8', beltColor: '#334155', shoulders: false };
    const pal = resolveItemThemeHex(item);

    ctx.save();

    if (armorId === 'armor_none') {
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      this.roundRect(ctx, x + 2, y, w - 4, h, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (armorId === 'armor_cosmic') {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    } else if (armorId === 'armor_dragon') {
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
    }

    const bodyCol = pal ? pal.hex : v.bodyColor;
    const trimCol = pal ? pal.trimHex : (v.trimColor || '#fde047');
    const beltCol = pal ? pal.beltHex : (v.beltColor || '#1e293b');

    ctx.fillStyle = bodyCol;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    this.roundRect(ctx, x, y, w, h, 7);
    ctx.fill();
    ctx.stroke();

    // Diržas ir sagtis pagal tikslią daikto themeColor spalvą
    ctx.fillStyle = beltCol;
    ctx.fillRect(x + 2, y + h - 7, w - 4, 4);
    ctx.fillStyle = trimCol;
    ctx.fillRect(x + w / 2 - 3, y + h - 8, 6, 6);

    // Antpečiai ir krūtinės apvadas, jei šarvai juos turi
    if (v.shoulders) {
      ctx.fillStyle = trimCol;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.fillRect(x - 4, y, 7, 8);
      ctx.strokeRect(x - 4, y, 7, 8);
      ctx.fillRect(x + w - 3, y, 7, 8);
      ctx.strokeRect(x + w - 3, y, 7, 8);
    }

    ctx.restore();
  }

  drawShield(ctx, sx, sy, shieldColor, emblemId, armOffset = 0) {
    const shieldId = this.profile.equippedGear?.shield || 'shield_none';
    const item = GEAR_ITEMS.find((g) => g.id === shieldId);
    const v = item?.visual;
    const pal = resolveItemThemeHex(item);

    const shoulderX = this.facing === 1 ? sx + 24 : sx + 16;
    const shoulderY = this.isCrouching ? sy + 12 : sy + 26;
    const hx = (this.facing === 1 ? sx + 28 : sx + 12) + armOffset * 0.6;
    const hy = this.isCrouching ? sy + 15 : sy + 32;

    ctx.save();
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    if (shieldId === 'shield_none' || !v || v.shape === 'none') {
      ctx.fillStyle = '#fed7aa';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    const sizeScale = shieldId === 'shield_aegis' ? 1.25
      : (shieldId === 'shield_dragon' || shieldId === 'shield_red_tower') ? 1.15
      : 1.0;

    const shW = Math.round(20 * sizeScale);
    const shH = Math.round(24 * sizeScale);
    const shX = (this.facing === 1
      ? sx + (this.isCrouching ? 25 : 21)
      : sx - (this.isCrouching ? 9 : 5) - (shW - 20)) + armOffset * 0.4;
    const shY = (this.isCrouching ? sy + 2 : sy + 19) - Math.round((shH - 24) / 2);

    const mainCol = pal ? pal.hex : v.color;
    const trimCol = pal ? pal.trimHex : (v.trim || '#e2e8f0');

    ctx.fillStyle = mainCol;
    ctx.strokeStyle = trimCol;
    ctx.lineWidth = 2.6;

    if (v.shape === 'round') {
      const r = shW * 0.56;
      const cx = shX + shW / 2;
      const cy = shY + shH / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimCol;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (v.shape === 'tower') {
      this.roundRect(ctx, shX, shY, shW, shH, 4);
      ctx.fill();
      ctx.stroke();

      // Kryžiaus / žvaigždės herbas ant bokšto skydo
      ctx.strokeStyle = trimCol;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(shX + shW / 2, shY + 4);
      ctx.lineTo(shX + shW / 2, shY + shH - 4);
      ctx.moveTo(shX + 4, shY + shH / 2);
      ctx.lineTo(shX + shW - 4, shY + shH / 2);
      ctx.stroke();
    } else {
      // 'heater' riterio herbinis skydas
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.lineTo(shX + shW, shY);
      ctx.lineTo(shX + shW, shY + shH * 0.62);
      ctx.lineTo(shX + shW / 2, shY + shH);
      ctx.lineTo(shX, shY + shH * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimCol;
      ctx.beginPath();
      ctx.arc(shX + shW / 2, shY + shH * 0.45, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawBackArmAndWeapon(ctx, sx, sy, armSwing = 0) {
    const weaponId = this.profile.equippedGear?.weapon || 'weapon_none';
    const item = GEAR_ITEMS.find((g) => g.id === weaponId);
    const v = item?.visual;
    const dir = this.facing;

    const slashProgress = this.slashTimer > 0
      ? 1 - this.slashTimer / this.slashMaxTimer
      : 0;

    const handX = (dir === 1 ? sx + 28 : sx + 12) + armSwing * 0.6 + (this.slashTimer > 0 ? dir * 10 : 0);
    const handY = (this.isCrouching ? sy + 14 : sy + 27) + (this.slashTimer > 0 ? Math.sin(slashProgress * Math.PI) * 6 : 0);

    ctx.save();
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(handX, handY, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (weaponId === 'weapon_none' || !v) {
      ctx.restore();
      return;
    }

    if (v.kind === 'boomerang') {
      if (this.boomerangInFlight) {
        ctx.restore();
        return;
      }
      ctx.translate(handX, handY);
      ctx.rotate(dir * 0.2);
      ctx.fillStyle = v.bladeColor || '#b45309';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(dir * 12, -2);
      ctx.lineTo(-2, 11);
      ctx.lineTo(-dir * 4, 8);
      ctx.lineTo(dir * 5, -2);
      ctx.lineTo(-dir * 4, -7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = v.trimColor || '#fde047';
      ctx.beginPath();
      ctx.arc(dir * 7, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (v.kind === 'bow') {
      const bowX = dir === 1 ? sx + 30 : sx + 10;
      const bowY = this.isCrouching ? sy + 14 : sy + 26;

      ctx.strokeStyle = v.stringColor || '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bowX, bowY - 12);
      ctx.lineTo(bowX, bowY + 12);
      ctx.stroke();

      ctx.strokeStyle = v.bowColor || '#a16207';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (dir === 1) {
        ctx.arc(bowX - 2, bowY, 12, -Math.PI * 0.48, Math.PI * 0.48);
      } else {
        ctx.arc(bowX + 2, bowY, 12, Math.PI * 0.52, Math.PI * 1.48);
      }
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.translate(handX, handY);
    const swingAngle = this.slashTimer > 0
      ? dir * (-0.9 + slashProgress * 2.1)
      : dir * 0.25;
    ctx.rotate(swingAngle);

    const isBig = v.kind === 'broadsword' || v.kind === 'flame_sword' || v.kind === 'cosmic_sword';
    const bladeLen = isBig ? 24 : 19;

    if (v.kind === 'flame_sword' || v.kind === 'cosmic_sword') {
      ctx.shadowColor = v.bladeColor;
      ctx.shadowBlur = 10;
    }

    // Ašmenys tiksliai pagal `v.bladeColor`
    ctx.strokeStyle = v.bladeColor || '#cbd5e1';
    ctx.lineWidth = isBig ? 5.5 : 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * bladeLen, -bladeLen);
    ctx.stroke();

    // Rankenos skersinis pagal `v.hiltColor`
    ctx.strokeStyle = v.hiltColor || '#78350f';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-dir * 4.5, 3.5);
    ctx.lineTo(dir * 5.5, -4.5);
    ctx.stroke();

    ctx.restore();
  }

  drawMeleeSlashEffect(ctx, sx, sy) {
    const dir = this.facing;
    const progress = 1 - this.slashTimer / this.slashMaxTimer;
    const cx = dir === 1 ? sx + this.width + 6 : sx - 6;
    const cy = sy + this.height / 2;
    const weaponId = this.profile.equippedGear?.weapon || 'weapon_none';
    const item = GEAR_ITEMS.find((g) => g.id === weaponId);
    const slashColor = item?.visual?.bladeColor || '#fde047';

    ctx.save();
    ctx.strokeStyle = slashColor;
    ctx.shadowColor = slashColor;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 6 * (1 - progress * 0.4);
    ctx.lineCap = 'round';

    ctx.beginPath();
    if (dir === 1) {
      ctx.arc(cx - 10, cy, 34, -Math.PI * 0.45 + progress * 0.3, Math.PI * 0.45);
    } else {
      ctx.arc(cx + 10, cy, 34, Math.PI * 0.55, Math.PI * 1.45 - progress * 0.3);
    }
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  drawHat(ctx, headCenterX, topY) {
    const hatId = this.profile.equippedGear?.hat || 'hat_none';
    if (hatId === 'hat_none') return;
    const item = GEAR_ITEMS.find((g) => g.id === hatId);
    const v = item?.visual;
    if (!v || v.shape === 'none') return;

    const pal = resolveItemThemeHex(item);
    const mainCol = pal ? pal.hex : v.color;
    const trimCol = pal ? pal.trimHex : (v.trim || '#fde047');
    const plumeCol = pal?.plumeHex || v.plume;

    ctx.save();

    if (v.shape === 'cap') {
      // Odinė kepurė
      ctx.fillStyle = mainCol;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(headCenterX, topY + 6, 13.5, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimCol;
      ctx.fillRect(headCenterX - 14, topY + 4, 28, 3.5);
    } else if (v.shape === 'ranger') {
      // Žaliasis Žvalgo šalmas su plunksna
      ctx.fillStyle = mainCol;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 15, topY + 6);
      ctx.lineTo(headCenterX, topY - 10);
      ctx.lineTo(headCenterX + 15, topY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimCol;
      ctx.fillRect(headCenterX - 15, topY + 4, 30, 3.5);

      ctx.strokeStyle = plumeCol || '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headCenterX + 6, topY - 2);
      ctx.quadraticCurveTo(headCenterX + 16, topY - 14, headCenterX + 20, topY - 6);
      ctx.stroke();
    } else if (v.shape === 'viking' || v.shape === 'dragon') {
      // Šalmas su ragais (Vikingo arba Ugnies Drakono)
      if (v.shape === 'dragon') {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
      }
      ctx.fillStyle = mainCol;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(headCenterX, topY + 6, 14, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimCol;
      ctx.fillRect(headCenterX - 14, topY + 4, 28, 3.5);

      ctx.fillStyle = v.horns || '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(headCenterX - 12, topY + 4);
      ctx.lineTo(headCenterX - 24, topY - 9);
      ctx.lineTo(headCenterX - 7, topY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(headCenterX + 12, topY + 4);
      ctx.lineTo(headCenterX + 24, topY - 9);
      ctx.lineTo(headCenterX + 7, topY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (v.shape === 'wizard') {
      // Archimago smaili skrybėlė
      ctx.fillStyle = mainCol;
      ctx.strokeStyle = trimCol;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 18, topY + 5);
      ctx.lineTo(headCenterX, topY - 19);
      ctx.lineTo(headCenterX + 18, topY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (v.shape === 'crown') {
      // Karaliaus karūna
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillStyle = mainCol;
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(headCenterX - 13, topY + 5);
      ctx.lineTo(headCenterX - 12, topY - 9);
      ctx.lineTo(headCenterX - 5, topY);
      ctx.lineTo(headCenterX, topY - 13);
      ctx.lineTo(headCenterX + 5, topY);
      ctx.lineTo(headCenterX + 12, topY - 9);
      ctx.lineTo(headCenterX + 13, topY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // 'knight' – Riterio / Sargybinio / Paladino / Nindzės šalmas su skiautere (100% tikslios themeColor spalvos!)
      if (plumeCol) {
        ctx.strokeStyle = plumeCol;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(headCenterX - 2, topY - 7);
        ctx.quadraticCurveTo(headCenterX + 8, topY - 15, headCenterX + 14, topY - 5);
        ctx.stroke();
      }

      ctx.fillStyle = mainCol;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(headCenterX, topY + 6, 14, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimCol;
      ctx.fillRect(headCenterX - 14, topY + 3.5, 28, 3.8);
    }

    ctx.restore();
  }

  drawPet(ctx, cameraX) {
    const pet = PET_ITEMS.find((p) => p.id === this.profile.equippedPet);
    if (!pet) return;

    const px = Math.round(this.petX - cameraX) + 14;
    const py = Math.round(this.petY) + 12;
    const wingFlap = Math.sin(this.animFrame * 0.32) * 9;
    const petLvl = this.bonuses.petLevel || 1;
    const maxCd = this.bonuses.petCooldownFrames || 540;
    const isSkillReady = this.petSkillTimer <= 0;

    ctx.save();

    // Jei įgūdis paruoštas – aplink augintinį švyti apsauginis žiedas
    if (isSkillReady) {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 16 + Math.sin(this.animFrame * 0.12) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (pet.id === 'pet_dragon') {
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(px - 4, py);
      ctx.lineTo(px - 18, py - 10 + wingFlap);
      ctx.lineTo(px - 12, py + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px + 4, py);
      ctx.lineTo(px + 18, py - 10 + wingFlap);
      ctx.lineTo(px + 12, py + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px - 3, py - 2, 2, 0, Math.PI * 2);
      ctx.arc(px + 3, py - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (pet.id === 'pet_cyber') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(px - 4, py + 10);
      ctx.lineTo(px, py + 17 + Math.abs(wingFlap * 0.6));
      ctx.lineTo(px + 4, py + 10);
      ctx.closePath();
      ctx.fill();

      const rotorW = 14 * Math.cos(this.animFrame * 0.45);
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px - rotorW, py - 12);
      ctx.lineTo(px + rotorW, py - 12);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(px - 6, py - 3, 12, 4);
    } else {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(px - 3, py);
      ctx.lineTo(px - 22, py - 12 + wingFlap);
      ctx.lineTo(px - 10, py + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(px + 3, py);
      ctx.lineTo(px + 22, py - 12 + wingFlap);
      ctx.lineTo(px + 10, py + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(px, py, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // Augintinio įgūdžio būsenos / įkrovimo juostelė virš galvos
    const barW = 28;
    const barX = px - barW / 2;
    const barY = py - 24;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(barX, barY, barW, 4);
    const fillRatio = isSkillReady ? 1 : Math.max(0, 1 - this.petSkillTimer / maxCd);
    ctx.fillStyle = isSkillReady ? '#4ade80' : '#f59e0b';
    ctx.fillRect(barX + 1, barY + 1, Math.round((barW - 2) * fillRatio), 2);

    ctx.font = 'bold 9px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isSkillReady ? '#86efac' : '#fde047';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    const tag = `Lv.${petLvl}`;
    ctx.strokeText(tag, px, py - 13);
    ctx.fillText(tag, px, py - 13);

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
