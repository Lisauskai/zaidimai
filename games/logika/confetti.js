// ==================== PERGALĖS KONFETI IR GAME JUICE DALELIŲ VARIKLIS ====================
const CONFETTI_COLORS = [
  '#facc15', // auksinė
  '#38bdf8', // žydra
  '#4ade80', // žalia
  '#f472b6', // rožinė
  '#a78bfa', // violetinė
  '#fb923c'  // oranžinė
];

let activeRafId = null;

export function stopVictoryConfetti(canvasEl) {
  if (activeRafId !== null) {
    cancelAnimationFrame(activeRafId);
    activeRafId = null;
  }
  if (canvasEl) {
    const ctx = canvasEl.getContext('2d');
    ctx?.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
}

export function launchVictoryConfetti(canvasEl) {
  if (!canvasEl) return;
  stopVictoryConfetti(canvasEl);

  const w = (canvasEl.width = window.innerWidth || 1280);
  const h = (canvasEl.height = window.innerHeight || 720);
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  const particles = [];
  const count = 130;

  for (let i = 0; i < count; i++) {
    const fromLeft = i % 2 === 0;
    const originX = fromLeft ? w * (0.18 + Math.random() * 0.22) : w * (0.6 + Math.random() * 0.22);
    const originY = h * (0.28 + Math.random() * 0.22);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.65;
    const speed = 5.5 + Math.random() * 9.5;

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.2,
      size: 6.5 + Math.random() * 7.5,
      aspect: 0.5 + Math.random() * 0.5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.26,
      alpha: 1,
      shape: i % 4 === 0 ? 'spark' : i % 5 === 0 ? 'circle' : 'rect'
    });
  }

  let frames = 0;
  const maxFrames = 175;

  const tick = () => {
    frames++;
    ctx.clearRect(0, 0, w, h);

    let alive = 0;
    for (const p of particles) {
      p.vy += 0.22; // gravitacija
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vRot;

      if (frames > maxFrames - 45) {
        p.alpha = Math.max(0, (maxFrames - frames) / 45);
      }

      if (p.y < h + 30 && p.alpha > 0.01) {
        alive++;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'spark') {
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          const r = p.size * 0.55;
          ctx.moveTo(0, -r);
          ctx.lineTo(r * 0.35, -r * 0.35);
          ctx.lineTo(r, 0);
          ctx.lineTo(r * 0.35, r * 0.35);
          ctx.lineTo(0, r);
          ctx.lineTo(-r * 0.35, r * 0.35);
          ctx.lineTo(-r, 0);
          ctx.lineTo(-r * 0.35, -r * 0.35);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, (-p.size * p.aspect) / 2, p.size, p.size * p.aspect);
        }
        ctx.restore();
      }
    }

    if (alive > 0 && frames < maxFrames) {
      activeRafId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, w, h);
      activeRafId = null;
    }
  };

  activeRafId = requestAnimationFrame(tick);
}

export function launchBurstParticles(canvasEl, originX, originY, count = 42) {
  if (!canvasEl) return;
  stopVictoryConfetti(canvasEl);

  const w = (canvasEl.width = window.innerWidth || 1280);
  const h = (canvasEl.height = window.innerHeight || 720);
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return;

  const cx = typeof originX === 'number' ? originX : w * 0.5;
  const cy = typeof originY === 'number' ? originY : h * 0.45;

  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
    const speed = 3.5 + Math.random() * 8.5;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      r: 2.5 + Math.random() * 3.8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      life: 1,
      decay: 0.018 + Math.random() * 0.015
    };
  });

  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    let alive = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy = p.vy * 0.96 + 0.14;
      p.life -= p.decay;

      if (p.life > 0.02) {
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (alive > 0) {
      activeRafId = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, w, h);
      activeRafId = null;
    }
  };

  activeRafId = requestAnimationFrame(tick);
}
