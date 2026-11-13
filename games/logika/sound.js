// ==================== SINTETIZUOTI GARSO EFEKTAI (WEB AUDIO API) ====================
const SOUND_STORAGE_KEY = 'proto_lab_sound_enabled';

let audioCtx = null;
let soundEnabled = loadInitialSoundState();
let lastClinkTime = 0;

function loadInitialSoundState() {
  try {
    const raw = localStorage.getItem(SOUND_STORAGE_KEY);
    if (raw === null) return true;
    return raw !== 'false' && raw !== '0';
  } catch (e) {
    return true;
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(next) {
  soundEnabled = Boolean(next);
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? 'true' : 'false');
  } catch (e) {
    // Ignoruojame saugojimo klaidas
  }
  return soundEnabled;
}

export function toggleSound() {
  const next = setSoundEnabled(!soundEnabled);
  if (next) {
    playHintChime();
  }
  return next;
}

function getAudioContext() {
  if (!soundEnabled) return null;
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;

  try {
    if (!audioCtx) {
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

function playTone({
  type = 'sine',
  freqStart = 440,
  freqEnd = null,
  duration = 0.14,
  gain = 0.14,
  delay = 0
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== null && freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }

    vol.gain.setValueAtTime(0.0001, now);
    vol.gain.linearRampToValueAtTime(gain, now + Math.min(0.015, duration * 0.25));
    vol.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(vol);
    vol.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (e) {
    // Tyliai ignoruojame naršyklės garso apribojimus
  }
}

// 1. Kaiščio ištraukimo švilptelėjimas
export function playPinPull() {
  playTone({ type: 'sine', freqStart: 360, freqEnd: 880, duration: 0.13, gain: 0.15 });
  playTone({ type: 'triangle', freqStart: 540, freqEnd: 1120, duration: 0.1, gain: 0.07, delay: 0.02 });
}

// 2. Rutuliukų barškėjimas / stiklo susidūrimas (su ribotuvu, kad nesidubliuotų per dažnai)
export function playBallClink() {
  const nowMs = performance.now();
  if (nowMs - lastClinkTime < 70) return;
  lastClinkTime = nowMs;

  const base = 920 + Math.random() * 380;
  playTone({ type: 'sine', freqStart: base, freqEnd: base * 1.18, duration: 0.055, gain: 0.08 });
}

// 3. Roboto žingsnis
export function playRobotStep() {
  playTone({ type: 'triangle', freqStart: 210, freqEnd: 290, duration: 0.055, gain: 0.09 });
}

// 4. Energijos dėžės stūmimas (įskaitant čiuožimą ledu)
export function playCubePush() {
  playTone({ type: 'sawtooth', freqStart: 155, freqEnd: 92, duration: 0.12, gain: 0.09 });
  playTone({ type: 'triangle', freqStart: 280, freqEnd: 210, duration: 0.09, gain: 0.07, delay: 0.02 });
}

// 5. Veidrodžio / bėgio pasukimo spragtelėjimas
export function playMirrorClick() {
  playTone({ type: 'triangle', freqStart: 680, freqEnd: 1180, duration: 0.05, gain: 0.12 });
}

// 6. Lazerio zvimbimas / kristalo įsižiebimas
export function playLaserHum() {
  playTone({ type: 'sawtooth', freqStart: 320, freqEnd: 640, duration: 0.14, gain: 0.06 });
  playTone({ type: 'sine', freqStart: 640, freqEnd: 960, duration: 0.16, gain: 0.09, delay: 0.02 });
}

// 7. Traukinio / bėgių paleidimas
export function playTrackClick() {
  playTone({ type: 'triangle', freqStart: 420, freqEnd: 590, duration: 0.055, gain: 0.1 });
}

export function playTrainLaunch() {
  playTone({ type: 'triangle', freqStart: 523.25, freqEnd: 523.25, duration: 0.13, gain: 0.13 });
  playTone({ type: 'triangle', freqStart: 659.25, freqEnd: 659.25, duration: 0.22, gain: 0.13, delay: 0.11 });
}

// 8. Svarstyklių svorio uždėjimas / nuėmimas ir išsilyginimo varpelis
export function playBalancePop(isRemove = false) {
  if (isRemove) {
    playTone({ type: 'sine', freqStart: 460, freqEnd: 280, duration: 0.08, gain: 0.11 });
  } else {
    playTone({ type: 'sine', freqStart: 340, freqEnd: 560, duration: 0.08, gain: 0.11 });
  }
}

export function playBalanceBell() {
  playTone({ type: 'sine', freqStart: 880, freqEnd: 880, duration: 0.34, gain: 0.14 });
  playTone({ type: 'sine', freqStart: 1318.5, freqEnd: 1318.5, duration: 0.38, gain: 0.1, delay: 0.05 });
  playTone({ type: 'sine', freqStart: 1760, freqEnd: 1760, duration: 0.42, gain: 0.07, delay: 0.1 });
}

// 9. Atminties kodo natos
const MEMORY_SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
export function playMemoryTone(stepIdx = 0) {
  const freq = MEMORY_SCALE[stepIdx % MEMORY_SCALE.length];
  playTone({ type: 'sine', freqStart: freq, freqEnd: freq * 1.02, duration: 0.14, gain: 0.12 });
}

// 10. Užuominos lemputė
export function playHintChime() {
  playTone({ type: 'sine', freqStart: 660, freqEnd: 990, duration: 0.12, gain: 0.11 });
  playTone({ type: 'sine', freqStart: 990, freqEnd: 1320, duration: 0.15, gain: 0.09, delay: 0.06 });
}

// 11. Švelnus klaidos garsas
export function playWrongBuzz() {
  playTone({ type: 'triangle', freqStart: 220, freqEnd: 165, duration: 0.12, gain: 0.11 });
  playTone({ type: 'triangle', freqStart: 175, freqEnd: 130, duration: 0.14, gain: 0.09, delay: 0.1 });
}

// 12. Pergalės fanfaros įveikus lygį
export function playVictoryFanfare() {
  const notes = [
    { f: 523.25, d: 0.12, t: 0.0 },
    { f: 659.25, d: 0.12, t: 0.1 },
    { f: 783.99, d: 0.14, t: 0.2 },
    { f: 1046.5, d: 0.36, t: 0.32 }
  ];
  notes.forEach((n) => {
    playTone({ type: 'triangle', freqStart: n.f, freqEnd: n.f, duration: n.d, gain: 0.15, delay: n.t });
    playTone({ type: 'sine', freqStart: n.f * 2, freqEnd: n.f * 2, duration: n.d, gain: 0.05, delay: n.t });
  });
}

// 13. Algoritmų trasos šuolis / jungiklio aktyvavimas
export function playAlgoJump() {
  playTone({ type: 'sine', freqStart: 360, freqEnd: 740, duration: 0.14, gain: 0.11 });
  playTone({ type: 'triangle', freqStart: 540, freqEnd: 920, duration: 0.1, gain: 0.06, delay: 0.05 });
}

// 14. Krumpliaračio uždėjimo spragtelėjimas
export function playGearPlace() {
  playTone({ type: 'square', freqStart: 280, freqEnd: 460, duration: 0.06, gain: 0.09 });
  playTone({ type: 'triangle', freqStart: 520, freqEnd: 680, duration: 0.08, gain: 0.08, delay: 0.03 });
}

// 15. Krumpliaračių užstrigimo garsas
export function playGearJam() {
  playTone({ type: 'sawtooth', freqStart: 160, freqEnd: 95, duration: 0.16, gain: 0.09 });
  playTone({ type: 'triangle', freqStart: 130, freqEnd: 85, duration: 0.18, gain: 0.08, delay: 0.08 });
}

// 16. Ledo slydimo ir atsimušimo garsai (Gravitacijos labirintas)
export function playGravitySlide() {
  playTone({ type: 'sine', freqStart: 420, freqEnd: 260, duration: 0.11, gain: 0.07 });
}

export function playIceBreak() {
  playTone({ type: 'square', freqStart: 880, freqEnd: 310, duration: 0.09, gain: 0.08 });
  playTone({ type: 'triangle', freqStart: 620, freqEnd: 220, duration: 0.11, gain: 0.08, delay: 0.03 });
}

export function playPortalWarp() {
  playTone({ type: 'sine', freqStart: 380, freqEnd: 920, duration: 0.16, gain: 0.09 });
}
