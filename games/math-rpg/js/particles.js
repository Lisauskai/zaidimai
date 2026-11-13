// Dalelių efektų sistema (Particles): monetų blizgesys, šuolio dulkės, Combo ugnis, konfeti

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
  }

  emit(x, y, count = 12, options = {}) {
    const {
      colors = ['#fbbf24', '#f59e0b', '#fef08a'],
      speedMin = 1.5,
      speedMax = 5,
      sizeMin = 3,
      sizeMax = 7,
      gravity = 0.15,
      lifeMin = 20,
      lifeMax = 45,
      shape = 'circle'
    } = options;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      const life = Math.floor(lifeMin + Math.random() * (lifeMax - lifeMin));
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: sizeMin + Math.random() * (sizeMax - sizeMin),
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity,
        life,
        maxLife: life,
        shape
      });
    }
  }

  emitJumpDust(x, y, multi = false) {
    this.emit(x, y, multi ? 14 : 8, {
      colors: multi ? ['#38bdf8', '#818cf8', '#e0f2fe'] : ['#e2e8f0', '#cbd5e1', '#94a3b8'],
      speedMin: 1,
      speedMax: 3.2,
      sizeMin: 3,
      sizeMax: 6,
      gravity: 0.04,
      lifeMin: 15,
      lifeMax: 28
    });
  }

  emitBurst(x, y, color = '#fde047', count = 6) {
    this.emit(x, y, count, {
      colors: [color, '#fde047', '#ffffff'],
      speedMin: 1.2,
      speedMax: 3.8,
      sizeMin: 3,
      sizeMax: 5.5,
      gravity: 0.12,
      lifeMin: 14,
      lifeMax: 26
    });
  }

  emitCoinSparkle(x, y) {
    this.emit(x, y, 14, {
      colors: ['#fde047', '#facc15', '#fb923c', '#ffffff'],
      speedMin: 1.5,
      speedMax: 4.5,
      sizeMin: 3,
      sizeMax: 6,
      gravity: 0.1,
      lifeMin: 18,
      lifeMax: 35,
      shape: 'star'
    });
  }

  emitCrystalBurst(x, y) {
    this.emit(x, y, 22, {
      colors: ['#38bdf8', '#a855f7', '#ec4899', '#e0f2fe'],
      speedMin: 2,
      speedMax: 5.5,
      sizeMin: 4,
      sizeMax: 8,
      gravity: 0.08,
      lifeMin: 25,
      lifeMax: 45,
      shape: 'star'
    });
  }

  emitComboFire(x, y) {
    if (Math.random() > 0.45) return;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 26,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -1.5 - Math.random() * 2,
      size: 4 + Math.random() * 5,
      color: ['#f97316', '#ef4444', '#facc15'][Math.floor(Math.random() * 3)],
      gravity: -0.04,
      life: 18,
      maxLife: 18,
      shape: 'circle'
    });
  }

  addFloatingText(x, y, text, color = '#fde047', size = 18) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      vy: -1.6,
      life: 45,
      maxLife: 45
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx, cameraX) {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const sx = p.x - cameraX;
      const sy = p.y;

      if (p.shape === 'star') {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${ft.size}px 'Nunito', 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x - cameraX, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x - cameraX, ft.y);
    }
    ctx.restore();
  }
}

export const particles = new ParticleSystem();
