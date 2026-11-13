// Web Audio API procedūrinis garso sintezatorius (be išorinių .mp3 failų)
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, volume = 0.2, slideFreq = null, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  jump(multi = false) {
    if (multi) {
      this.playTone(320, 'triangle', 0.18, 0.22, 720);
    } else {
      this.playTone(220, 'sine', 0.16, 0.2, 520);
    }
  }

  spring() {
    this.playTone(180, 'sine', 0.3, 0.25, 880);
  }

  coin() {
    this.playTone(987.77, 'sine', 0.08, 0.15); // B5
    this.playTone(1318.51, 'sine', 0.22, 0.18, null, 0.07); // E6
  }

  crystal() {
    this.playTone(1046.5, 'triangle', 0.1, 0.2); // C6
    this.playTone(1318.5, 'triangle', 0.1, 0.2, null, 0.08); // E6
    this.playTone(1567.98, 'triangle', 0.28, 0.22, null, 0.16); // G6
  }

  stomp() {
    this.playTone(160, 'square', 0.12, 0.18, 60);
    this.playTone(420, 'sine', 0.1, 0.15, 600, 0.05);
  }

  swordSlash() {
    this.playTone(540, 'sawtooth', 0.09, 0.18, 160);
    this.playTone(820, 'triangle', 0.07, 0.14, 260, 0.02);
  }

  enemyHit() {
    this.playTone(220, 'square', 0.1, 0.2, 95);
    this.playTone(360, 'triangle', 0.08, 0.15, 180, 0.03);
  }

  bowShoot() {
    this.playTone(480, 'triangle', 0.09, 0.18, 220);
    this.playTone(720, 'sine', 0.06, 0.12, 340, 0.03);
  }

  petSkill() {
    this.playTone(740, 'triangle', 0.1, 0.18, 1180);
    this.playTone(1180, 'sine', 0.14, 0.16, 880, 0.06);
  }

  mathOpen() {
    this.playTone(440, 'triangle', 0.1, 0.15);
    this.playTone(554.37, 'triangle', 0.12, 0.15, null, 0.08);
    this.playTone(659.25, 'triangle', 0.18, 0.18, null, 0.16);
  }

  correct(combo = 1) {
    const base = 523.25 * Math.min(1 + (combo - 1) * 0.06, 1.5);
    this.playTone(base, 'triangle', 0.1, 0.22);
    this.playTone(base * 1.25, 'triangle', 0.1, 0.22, null, 0.08);
    this.playTone(base * 1.5, 'triangle', 0.25, 0.25, null, 0.16);
  }

  wrong() {
    this.playTone(240, 'sawtooth', 0.18, 0.16, 180);
    this.playTone(180, 'sawtooth', 0.25, 0.16, 130, 0.15);
  }

  brainStarFail() {
    this.playTone(300, 'sawtooth', 0.16, 0.24, 110);
    this.playTone(180, 'square', 0.22, 0.24, 65, 0.12);
    this.playTone(110, 'sawtooth', 0.32, 0.25, 45, 0.24);
  }

  hurt() {
    this.playTone(190, 'sawtooth', 0.22, 0.22, 75);
  }

  shieldBreak() {
    this.playTone(600, 'sine', 0.25, 0.2, 180);
  }

  buy() {
    this.playTone(659.25, 'sine', 0.08, 0.2);
    this.playTone(880, 'sine', 0.18, 0.22, null, 0.08);
  }

  sellItem() {
    this.playTone(784, 'triangle', 0.08, 0.2);
    this.playTone(1046.5, 'sine', 0.14, 0.22, null, 0.06);
    this.playTone(1318.5, 'sine', 0.2, 0.22, null, 0.12);
  }

  levelWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 'triangle', 0.18, 0.22, null, i * 0.11);
    });
    this.playTone(1046.5, 'sine', 0.45, 0.25, null, 0.44);
  }

  click() {
    this.playTone(620, 'sine', 0.05, 0.12);
  }
}

export const audio = new SoundSystem();
