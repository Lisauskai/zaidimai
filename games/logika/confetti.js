// ==================== PERGALĖS KONFETI DALELIŲ VARIKLIS ====================
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
  const count = 115;

  for (let i = 0; i < count; i++) {
    const fromLeft = i % 2 === 0;
    const originX = fromLeft ? w * (0.18 + Math.random() * 0.22) : w * (0.6 + Math.random() * 0.22);
    const originY = h * (0.28 + Math.random() * 0.22);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.45;
    const speed = 5 + Math.random() * 9;

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 7 + Math.random() * 7,
      aspect: 0.5 + Math.random() * 0.5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.24,
      alpha: 1,
      shape: i % 5 === 0 ? 'circle' : 'rect'
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
        if (p.shape === 'circle') {
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
