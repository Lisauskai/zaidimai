// ==================== BUBIŲ TVIRTOVĖ: WEB AUDIO API GARSO VARIKLIS ====================
// Pilnai sintetizuoti garsai be išorinių MP3 failų, su garso ribotuvu (Limiter / Throttling),
// muzikine pentatonine „Dagilėlio“ gama ir localStorage nutildymo išsaugojimu.

export const AUDIO_MUTE_KEY = 'gynyba_audio_muted_v1';

// C-dur pentatoninė gama (Hz): visos gretimos natos dera tarpusavyje ir neskamba įkyriai
export const PENTATONIC_SCALE_HZ = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0,  // G4
  440.0,  // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0   // A5
];

export class SoundManager {
  constructor(options = {}) {
    this.storage = options.storage ?? SoundManager.resolveDefaultStorage();
    this.createContext = options.createContext ?? null;
    this.nowProvider = options.nowProvider ?? (() => Date.now());

    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.muted = this.loadMuteState();

    this.lastPlayedAt = new Map();
    this.activeVoicesByKey = new Map();
    this.maxTotalVoices = 14;
    this.pentatonicStep = 0;
    this.lastDagilelisFreq = null;
  }

  static resolveDefaultStorage() {
    try {
      return typeof globalThis !== 'undefined' && globalThis.localStorage
        ? globalThis.localStorage
        : null;
    } catch (e) {
      return null;
    }
  }

  loadMuteState() {
    try {
      const val = this.storage?.getItem(AUDIO_MUTE_KEY);
      return val === '1' || val === 'true';
    } catch (e) {
      return false;
    }
  }

  saveMuteState() {
    try {
      this.storage?.setItem(AUDIO_MUTE_KEY, this.muted ? '1' : '0');
    } catch (e) {
      // Ignoruojame saugyklos klaidas
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(isMuted) {
    this.muted = Boolean(isMuted);
    this.saveMuteState();
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(
          this.muted ? 0 : 0.72,
          this.ctx.currentTime || 0
        );
      } catch (e) {
        // Ignoruojame
      }
    }
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  ensureContext() {
    if (this.muted) return null;

    if (!this.ctx) {
      try {
        if (typeof this.createContext === 'function') {
          this.ctx = this.createContext();
        } else {
          const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
          if (!Ctor) return null;
          this.ctx = new Ctor();
        }

        if (!this.ctx) return null;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.72, this.ctx.currentTime || 0);

        if (typeof this.ctx.createDynamicsCompressor === 'function') {
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold?.setValueAtTime(-16, this.ctx.currentTime || 0);
          this.compressor.knee?.setValueAtTime(18, this.ctx.currentTime || 0);
          this.compressor.ratio?.setValueAtTime(6, this.ctx.currentTime || 0);
          this.compressor.attack?.setValueAtTime(0.005, this.ctx.currentTime || 0);
          this.compressor.release?.setValueAtTime(0.15, this.ctx.currentTime || 0);
          this.masterGain.connect(this.compressor);
          this.compressor.connect(this.ctx.destination);
        } else {
          this.masterGain.connect(this.ctx.destination);
        }
      } catch (e) {
        this.ctx = null;
        return null;
      }
    }

    if (this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  pruneExpiredVoices(now) {
    let total = 0;
    for (const [k, list] of this.activeVoicesByKey.entries()) {
      const alive = list.filter((endMs) => endMs > now);
      if (alive.length > 0) {
        this.activeVoicesByKey.set(k, alive);
        total += alive.length;
      } else {
        this.activeVoicesByKey.delete(k);
      }
    }
    return total;
  }

  acquireSlot(key, minIntervalMs = 80, maxConcurrent = 3, durationSec = 0.2) {
    if (this.muted) return false;
    const now = this.nowProvider();
    const totalVoices = this.pruneExpiredVoices(now);
    if (totalVoices >= this.maxTotalVoices) return false;

    const prevTime = this.lastPlayedAt.get(key) ?? -Infinity;
    if (now - prevTime < minIntervalMs) return false;

    const activeList = this.activeVoicesByKey.get(key) || [];
    if (activeList.length >= maxConcurrent) return false;

    this.lastPlayedAt.set(key, now);
    activeList.push(now + Math.max(60, Math.round(durationSec * 1000)));
    this.activeVoicesByKey.set(key, activeList);
    return true;
  }

  playTone(ctx, { freqStart, freqEnd = null, type = 'sine', duration = 0.14, delay = 0, gain = 0.12 }) {
    if (!ctx || !this.masterGain) return;
    const now = (ctx.currentTime || 0) + delay;
    const end = now + Math.max(0.03, duration);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = type;
    const safeStart = Math.max(25, freqStart);
    osc.frequency.setValueAtTime(safeStart, now);
    if (freqEnd !== null && freqEnd !== safeStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(25, freqEnd), end);
    }

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(Math.max(0.001, gain), now + Math.min(0.025, duration * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(end + 0.01);
  }

  playNoiseBurst(ctx, { duration = 0.09, delay = 0, filterFreq = 1100, gain = 0.08 } = {}) {
    if (!ctx || !this.masterGain || typeof ctx.createBuffer !== 'function') return;
    const sampleRate = ctx.sampleRate || 44100;
    const length = Math.max(64, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const now = (ctx.currentTime || 0) + delay;
    const end = now + duration;
    const g = ctx.createGain();
    g.gain.setValueAtTime(Math.max(0.001, gain), now);
    g.gain.exponentialRampToValueAtTime(0.0001, end);

    if (typeof ctx.createBiquadFilter === 'function') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.Q?.setValueAtTime(1.4, now);
      src.connect(filter);
      filter.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(this.masterGain);
    src.start(now);
    src.stop(end + 0.01);
  }

  // ==================== BOKŠTELIŲ IR KOVOS GARSAI ====================

  playSolarLaser(ramp = 1) {
    if (!this.acquireSlot('solar_laser', 140, 2, 0.14)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const clampedRamp = Math.max(1, Math.min(2.5, ramp));
    const baseFreq = 220 * (0.85 + clampedRamp * 0.25);
    this.playTone(ctx, {
      freqStart: baseFreq,
      freqEnd: baseFreq * 1.42,
      type: 'sine',
      duration: 0.13,
      gain: 0.065
    });
    return true;
  }

  playDagilelisChord(level = 1) {
    if (!this.acquireSlot('dagilelis_sound', 95, 3, 0.28)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;

    const pattern = [0, 2, 1, 4, 3, 5, 4, 7, 5, 2];
    const scaleIdx = pattern[this.pentatonicStep % pattern.length];
    this.pentatonicStep += 1;

    const rootHz = PENTATONIC_SCALE_HZ[scaleIdx];
    const thirdHz = PENTATONIC_SCALE_HZ[(scaleIdx + 2) % PENTATONIC_SCALE_HZ.length];
    this.lastDagilelisFreq = rootHz;

    this.playTone(ctx, {
      freqStart: rootHz,
      freqEnd: rootHz,
      type: 'sine',
      duration: 0.24,
      gain: 0.11
    });
    this.playTone(ctx, {
      freqStart: thirdHz,
      freqEnd: thirdHz,
      type: 'triangle',
      duration: 0.2,
      delay: 0.02,
      gain: level >= 3 ? 0.07 : 0.045
    });
    return true;
  }

  playCatapultLaunch() {
    if (!this.acquireSlot('catapult_launch', 85, 3, 0.14)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    this.playTone(ctx, {
      freqStart: 150,
      freqEnd: 58,
      type: 'triangle',
      duration: 0.13,
      gain: 0.14
    });
    return true;
  }

  playBerryFrostExplosion(isFreeze = false) {
    if (!this.acquireSlot('berry_explosion', 75, 3, 0.16)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    this.playNoiseBurst(ctx, { duration: 0.1, filterFreq: isFreeze ? 2400 : 950, gain: 0.09 });
    if (isFreeze) {
      this.playTone(ctx, { freqStart: 1174.66, freqEnd: 1567.98, type: 'sine', duration: 0.15, gain: 0.07 });
    } else {
      this.playTone(ctx, { freqStart: 220, freqEnd: 95, type: 'sine', duration: 0.1, gain: 0.08 });
    }
    return true;
  }

  playDroneShot(isMissile = false) {
    if (!this.acquireSlot('drone_shot', 85, 3, 0.12)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (isMissile) {
      this.playTone(ctx, { freqStart: 320, freqEnd: 820, type: 'triangle', duration: 0.11, gain: 0.075 });
    } else {
      this.playTone(ctx, { freqStart: 760, freqEnd: 420, type: 'sine', duration: 0.08, gain: 0.055 });
    }
    return true;
  }

  playMowerClash() {
    if (!this.acquireSlot('mower_clash', 165, 2, 0.09)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    this.playTone(ctx, { freqStart: 540, freqEnd: 310, type: 'triangle', duration: 0.07, gain: 0.065 });
    this.playTone(ctx, { freqStart: 880, freqEnd: 620, type: 'square', duration: 0.04, gain: 0.025 });
    return true;
  }

  // ==================== EKONOMIKA, BOSAI, PERGALĖ IR ŽINIŲ VARTAI ====================

  playCoinChime() {
    if (!this.acquireSlot('coin_chime', 65, 3, 0.18)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    this.playTone(ctx, { freqStart: 987.77, freqEnd: 987.77, type: 'sine', duration: 0.08, gain: 0.08 });
    this.playTone(ctx, { freqStart: 1318.51, freqEnd: 1318.51, type: 'sine', duration: 0.12, delay: 0.05, gain: 0.085 });
    return true;
  }

  playTowerBuild() {
    if (!this.acquireSlot('tower_build', 60, 2, 0.22)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    this.playTone(ctx, { freqStart: 261.63, type: 'triangle', duration: 0.1, gain: 0.1 });
    this.playTone(ctx, { freqStart: 329.63, type: 'sine', duration: 0.12, delay: 0.04, gain: 0.1 });
    this.playTone(ctx, { freqStart: 392.0, type: 'sine', duration: 0.14, delay: 0.08, gain: 0.1 });
    return true;
  }

  playTowerUpgrade(level = 2) {
    if (!this.acquireSlot('tower_upgrade', 60, 2, 0.28)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const base = level >= 4 ? 523.25 : level === 3 ? 440.0 : 392.0;
    [1, 1.25, 1.5].forEach((mult, idx) => {
      this.playTone(ctx, {
        freqStart: base * mult,
        type: 'triangle',
        duration: 0.13,
        delay: idx * 0.05,
        gain: 0.095
      });
    });
    return true;
  }

  playBossHorn() {
    if (!this.acquireSlot('boss_horn', 1200, 1, 0.65)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    this.playTone(ctx, { freqStart: 110, freqEnd: 116, type: 'sawtooth', duration: 0.55, gain: 0.075 });
    this.playTone(ctx, { freqStart: 164.81, freqEnd: 164.81, type: 'triangle', duration: 0.52, delay: 0.04, gain: 0.09 });
    this.playTone(ctx, { freqStart: 220, freqEnd: 220, type: 'sine', duration: 0.55, delay: 0.08, gain: 0.08 });
    return true;
  }

  playVictoryFanfare() {
    if (!this.acquireSlot('victory_fanfare', 800, 1, 0.75)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      this.playTone(ctx, {
        freqStart: f,
        type: 'triangle',
        duration: idx === 3 ? 0.34 : 0.16,
        delay: idx * 0.11,
        gain: 0.11
      });
    });
    return true;
  }

  playDefeatTone() {
    if (!this.acquireSlot('defeat_tone', 800, 1, 0.6)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const notes = [349.23, 311.13, 261.63];
    notes.forEach((f, idx) => {
      this.playTone(ctx, {
        freqStart: f,
        freqEnd: f * 0.96,
        type: 'sine',
        duration: 0.22,
        delay: idx * 0.14,
        gain: 0.095
      });
    });
    return true;
  }

  playGateSuccess() {
    if (!this.acquireSlot('gate_success', 80, 2, 0.32)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    [523.25, 659.25, 783.99].forEach((f, idx) => {
      this.playTone(ctx, {
        freqStart: f,
        type: 'sine',
        duration: 0.18,
        delay: idx * 0.055,
        gain: 0.1
      });
    });
    return true;
  }

  playGateMistake() {
    if (!this.acquireSlot('gate_mistake', 120, 2, 0.3)) return false;
    const ctx = this.ensureContext();
    if (!ctx) return false;
    this.playTone(ctx, { freqStart: 246.94, freqEnd: 220, type: 'triangle', duration: 0.13, gain: 0.09 });
    this.playTone(ctx, { freqStart: 196.0, freqEnd: 174.61, type: 'triangle', duration: 0.17, delay: 0.11, gain: 0.095 });
    return true;
  }
}

export const audioManager = new SoundManager();
