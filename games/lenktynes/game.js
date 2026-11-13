// ==================== BULIŲ KAUTYNIŲ LENKTYNĖS (2D TOP-DOWN ENGINE, KĖBULŲ KLASĖS, DINAMINIS AI, 7 GINKLAI, 50 LYG. MIKRO-TOBULINIMAI) ====================
import {
  TUNING_CATALOG,
  TRACK_TYPES,
  BIOMES,
  normalizeTrackId,
  MICRO_UPGRADES,
  MAX_MICRO_UPGRADE_LEVEL,
  MAX_PART_LEVEL,
  getMicroUpgradePrices,
  getPartUpgradePrice,
  getPartStatsAtLevel,
  getVisualTierInfo,
  getProfilePartState,
  setProfilePartState,
  buildDefaultPartsDictionary,
  calculatePlayerPowerLevel,
  GarageManager,
  drawCarTopDown,
  drawSecondaryWeapon,
  loadGlobalPlaytime,
  saveGlobalPlaytime,
  getRemainingPlaytimeSeconds
} from './garage.js?v=20261113n';
import { PitStopMath } from './math.js?v=20261113n';

const PARENT_PASSWORD = 'bosas123';

// ==================== GARSO EFEKTAI (WEB AUDIO API) ====================
class DerbyAudio {
  constructor() {
    this.ctx = null;
    this.lastBoostTime = 0;
    this.lastFailTime = 0;
    this.lastPlayerSoundTime = 0;
  }

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  tone(freq, duration = 0.1, type = 'square', vol = 0.12) {
    try {
      this.ensure();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignoruojame garso klaidas
    }
  }

  crash(heavy = false) {
    this.tone(heavy ? 75 : 115, heavy ? 0.24 : 0.14, 'sawtooth', heavy ? 0.22 : 0.14);
  }

  shoot(kind = 'minigun') {
    if (kind === 'laser') {
      this.tone(780, 0.14, 'sawtooth', 0.15);
    } else if (kind === 'rocket') {
      this.tone(140, 0.22, 'sawtooth', 0.18);
    } else if (kind === 'shotgun') {
      this.tone(110, 0.14, 'square', 0.2);
    } else if (kind === 'flamethrower') {
      this.tone(95, 0.06, 'sawtooth', 0.08);
    } else if (kind === 'oil' || kind === 'mines') {
      this.tone(240, 0.1, 'triangle', 0.14);
    } else {
      this.tone(320, 0.05, 'sawtooth', 0.1);
    }
  }

  explosion() {
    this.tone(58, 0.35, 'sawtooth', 0.26);
  }

  jump() {
    this.tone(420, 0.28, 'sine', 0.22);
  }

  thud() {
    this.tone(85, 0.16, 'triangle', 0.22);
  }

  // 1. SĖKMINGO TRIUKO GARSAS (TURBO BOOST / NITRO SPOOL-UP)
  playBoostSound(isPlayer = true) {
    try {
      this.ensure();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Prioritetas žaidėjui ir apsauga nuo garso susikirtimų/spamo
      if (!isPlayer && now - this.lastPlayerSoundTime < 0.6) return;
      if (now - this.lastBoostTime < 0.25) return;
      this.lastBoostTime = now;
      if (isPlayer) this.lastPlayerSoundTime = now;

      const masterVol = isPlayer ? 0.28 : 0.12;

      // A. Turbinos įsibėgėjimas (Spool-up): kylančio dažnio (Pitch Bend Up) osciliatorius
      const spoolOsc = this.ctx.createOscillator();
      const spoolGain = this.ctx.createGain();
      spoolOsc.type = 'sawtooth';
      spoolOsc.frequency.setValueAtTime(240, now);
      spoolOsc.frequency.exponentialRampToValueAtTime(1180, now + 0.48);

      spoolGain.gain.setValueAtTime(0.01, now);
      spoolGain.gain.linearRampToValueAtTime(masterVol * 0.72, now + 0.12);
      spoolGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      spoolOsc.connect(spoolGain);
      spoolGain.connect(this.ctx.destination);
      spoolOsc.start(now);
      spoolOsc.stop(now + 0.56);

      // B. Švarus švilpiantis rezonansas (Whine sine wave)
      const whineOsc = this.ctx.createOscillator();
      const whineGain = this.ctx.createGain();
      whineOsc.type = 'sine';
      whineOsc.frequency.setValueAtTime(420, now);
      whineOsc.frequency.exponentialRampToValueAtTime(1450, now + 0.52);

      whineGain.gain.setValueAtTime(0.01, now);
      whineGain.gain.linearRampToValueAtTime(masterVol * 0.58, now + 0.15);
      whineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.56);

      whineOsc.connect(whineGain);
      whineGain.connect(this.ctx.destination);
      whineOsc.start(now);
      whineOsc.stop(now + 0.57);

      // C. Nitro pliūpsnio garsas (Whoosh / High-pressure gas jet)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(2600, now + 0.38);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.02, now);
      noiseGain.gain.linearRampToValueAtTime(masterVol * 0.85, now + 0.08);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.46);
    } catch (e) {
      // Ignoruojame garso klaidas
    }
  }

  // 2. NESĖKMINGO TRIUKO GARSAS (CRASH / CLUNK & TIRE SCREECH)
  playFailSound(isPlayer = true) {
    try {
      this.ensure();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Prioritetas žaidėjui ir apsauga nuo garso susikirtimų/spamo
      if (!isPlayer && now - this.lastPlayerSoundTime < 0.6) return;
      if (now - this.lastFailTime < 0.3) return;
      this.lastFailTime = now;
      if (isPlayer) this.lastPlayerSoundTime = now;

      const masterVol = isPlayer ? 0.30 : 0.14;

      // A. Metalo dunkstelėjimas (Metallic Clunk) – gilus smūgis ir rezonuojantis kėbulo garsas
      const clunkOsc = this.ctx.createOscillator();
      const clunkGain = this.ctx.createGain();
      clunkOsc.type = 'triangle';
      clunkOsc.frequency.setValueAtTime(95, now);
      clunkOsc.frequency.exponentialRampToValueAtTime(32, now + 0.16);

      clunkGain.gain.setValueAtTime(masterVol * 0.95, now);
      clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      clunkOsc.connect(clunkGain);
      clunkGain.connect(this.ctx.destination);
      clunkOsc.start(now);
      clunkOsc.stop(now + 0.19);

      // Metalinis kėbulo rezonansas
      const clangOsc = this.ctx.createOscillator();
      const clangGain = this.ctx.createGain();
      clangOsc.type = 'sawtooth';
      clangOsc.frequency.setValueAtTime(260, now);
      clangOsc.frequency.exponentialRampToValueAtTime(80, now + 0.14);

      clangGain.gain.setValueAtTime(masterVol * 0.5, now);
      clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      clangOsc.connect(clangGain);
      clangGain.connect(this.ctx.destination);
      clangOsc.start(now);
      clangOsc.stop(now + 0.16);

      // B. Ilgas nemalonus padangų slydimo ir trinties garsas (Tire screech / skid, ~0.45s)
      const screechOsc = this.ctx.createOscillator();
      const screechGain = this.ctx.createGain();
      screechOsc.type = 'sawtooth';
      screechOsc.frequency.setValueAtTime(880, now);
      screechOsc.frequency.linearRampToValueAtTime(620, now + 0.22);
      screechOsc.frequency.exponentialRampToValueAtTime(420, now + 0.44);

      screechGain.gain.setValueAtTime(0.01, now);
      screechGain.gain.linearRampToValueAtTime(masterVol * 0.72, now + 0.05);
      screechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

      screechOsc.connect(screechGain);
      screechGain.connect(this.ctx.destination);
      screechOsc.start(now);
      screechOsc.stop(now + 0.47);

      // Padangų dangos šlifavimo triukšmas
      const skidBufferSize = Math.floor(this.ctx.sampleRate * 0.42);
      const skidBuffer = this.ctx.createBuffer(1, skidBufferSize, this.ctx.sampleRate);
      const skidData = skidBuffer.getChannelData(0);
      for (let i = 0; i < skidBufferSize; i++) {
        skidData[i] = Math.random() * 2 - 1;
      }
      const skidNoise = this.ctx.createBufferSource();
      skidNoise.buffer = skidBuffer;

      const skidFilter = this.ctx.createBiquadFilter();
      skidFilter.type = 'bandpass';
      skidFilter.frequency.setValueAtTime(1200, now);
      skidFilter.frequency.linearRampToValueAtTime(650, now + 0.4);
      skidFilter.Q.setValueAtTime(2.2, now);

      const skidNoiseGain = this.ctx.createGain();
      skidNoiseGain.gain.setValueAtTime(0.01, now);
      skidNoiseGain.gain.linearRampToValueAtTime(masterVol * 0.62, now + 0.06);
      skidNoiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      skidNoise.connect(skidFilter);
      skidFilter.connect(skidNoiseGain);
      skidNoiseGain.connect(this.ctx.destination);
      skidNoise.start(now);
      skidNoise.stop(now + 0.43);
    } catch (e) {
      // Ignoruojame garso klaidas
    }
  }

  boost(isPlayer = true) {
    this.playBoostSound(isPlayer);
  }

  correct() {
    this.tone(523, 0.08, 'triangle', 0.15);
    setTimeout(() => this.tone(659, 0.12, 'triangle', 0.15), 70);
  }

  wrong() {
    this.tone(180, 0.2, 'sawtooth', 0.16);
  }

  fanfare() {
    [440, 554, 659, 880].forEach((f, idx) => {
      setTimeout(() => this.tone(f, 0.16, 'triangle', 0.16), idx * 90);
    });
  }
}

const audio = new DerbyAudio();

function playBoostSound(isPlayer = true) {
  audio.playBoostSound(isPlayer);
}

function playFailSound(isPlayer = true) {
  audio.playFailSound(isPlayer);
}

window.audio = audio;
window.playBoostSound = playBoostSound;
window.playFailSound = playFailSound;
const garage = new GarageManager();
const pitMath = new PitStopMath();

// ==================== BŪSENA ====================
let currentScreen = 'PROFILES'; // 'PROFILES' | 'GARAGE' | 'RACE'
let isTimeLimitPaused = false;
let selectedTuningSlot = 'chassis'; // 'chassis' | 'micro' | 'roof' | 'wheels' | 'bumper' | 'paint'
let previewSpinEnabled = true;
let previewAngle = 0;
let animTick = 0;

// Garažo Pit Stop matematikos iššūkio būsena
let mathChallenge = null;
let mathTimerInterval = null;
let garageEvolutionToast = null; // { text, subText, color, expiresAt }

// ==================== KLAVIATŪROS IR EKRANO ĮVESTIS ====================
const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  item: false // Antrinio super-ginklo šūvis (SHIFT arba ENTER)
};

// Vairavimas: TIEK rodyklės (↑ ↓ ← →), TIEK W A S D. Šaudymas: SPACE (Tarpas).
const KEY_BINDINGS = {
  KeyW: 'up',
  ArrowUp: 'up',
  Enter: 'item',
  NumpadEnter: 'item',
  ShiftLeft: 'item',
  ShiftRight: 'item',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'fire'
};

function isTypingInField(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

window.addEventListener('keydown', (e) => {
  if (isTypingInField(e)) return; // leidžiame laisvai rašyti tėvų slaptažodį

  // Jei žaidėjo mašina sunaikinta – paspaudus Enter arba Tarpą grįžtame į garažą
  if (raceState && raceState.gameState === 'gameOver') {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      handleGameOverReturnToGarage();
      return;
    }
  }

  // Jei pasiektas podiumas (lenktynės baigtos) – paspaudus Enter arba Tarpą grįžtame į garažą
  if (raceState && raceState.gameState === 'podium') {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      handlePodiumReturnToGarage();
      return;
    }
  }

  const action = KEY_BINDINGS[e.code];
  if (!action) return;

  // KRITINIS PATAISYMAS: Tarpas ir rodyklės NESLINKS naršyklės lango žemyn!
  if (e.code === 'Space' || e.code.startsWith('Arrow') || e.code === 'Enter' || e.code === 'NumpadEnter') {
    e.preventDefault();
  }
  keys[action] = true;
});

window.addEventListener('keyup', (e) => {
  const action = KEY_BINDINGS[e.code];
  if (!action) return;
  if (e.code === 'Space' || e.code.startsWith('Arrow')) {
    e.preventDefault();
  }
  keys[action] = false;
});

// Jei langas praranda fokusą (pvz. Alt+Tab) – paleidžiame visus klavišus, kad mašina „neužstrigtų“ su gazu
window.addEventListener('blur', () => {
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;
  keys.fire = false;
});

function bindTouchBtn(id, keyProp) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const press = (ev) => {
    ev.preventDefault();
    keys[keyProp] = true;
  };
  const release = (ev) => {
    ev.preventDefault();
    keys[keyProp] = false;
  };
  btn.addEventListener('mousedown', press);
  btn.addEventListener('mouseup', release);
  btn.addEventListener('mouseleave', release);
  btn.addEventListener('touchstart', press, { passive: false });
  btn.addEventListener('touchend', release, { passive: false });
}

bindTouchBtn('touch-left', 'left');
bindTouchBtn('touch-right', 'right');
bindTouchBtn('touch-gas', 'up');
bindTouchBtn('touch-brake', 'down');
bindTouchBtn('touch-fire', 'fire');

// ==================== GLOBALUS PORTALO LAIKMATIS IR TĖVŲ KONTROLĖ ====================
function formatMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function updateGlobalTimerBadges() {
  const profile = garage.getActiveProfile();
  if (!profile) return;
  const remaining = getRemainingPlaytimeSeconds(profile.driverKey);
  const formatted = `⏳ Liko: ${formatMMSS(remaining)}`;

  const topTimerText = document.getElementById('ui-global-timer');
  const topTimerBtn = document.getElementById('btn-global-timer');
  const hudTimerText = document.getElementById('hud-global-timer');
  const hudTimerBtn = document.getElementById('btn-race-global-timer');

  if (topTimerText) topTimerText.textContent = formatted;
  if (hudTimerText) hudTimerText.textContent = formatted;

  const isLow = remaining < 300;
  if (topTimerBtn) topTimerBtn.classList.toggle('low-time', isLow);
  if (hudTimerBtn) hudTimerBtn.classList.toggle('low-time', isLow);
}

function startGlobalPlaytimeTicker() {
  setInterval(() => {
    if (currentScreen === 'PROFILES' || isTimeLimitPaused) return;
    const profile = garage.getActiveProfile();
    if (!profile) return;

    const isActivelyPlaying =
      (currentScreen === 'RACE' && raceState && !raceState.isOver) ||
      currentScreen === 'GARAGE';

    if (!isActivelyPlaying) return;

    const timeData = loadGlobalPlaytime(profile.driverKey);
    timeData.timePlayedTodaySeconds += 1;
    saveGlobalPlaytime(profile.driverKey, timeData);

    updateGlobalTimerBadges();

    if (timeData.timePlayedTodaySeconds >= timeData.dailyTimeLimitSeconds) {
      openTimeLimitModal(true);
    }
  }, 1000);
}

function openTimeLimitModal(timeExpired = true) {
  const profile = garage.getActiveProfile();
  if (!profile) return;

  isTimeLimitPaused = true;
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;
  keys.fire = false;

  const remaining = getRemainingPlaytimeSeconds(profile.driverKey);
  const isZero = timeExpired || remaining <= 0;

  const titleEl = document.getElementById('time-limit-title');
  const subEl = document.getElementById('time-limit-subtitle');
  const resumeBtn = document.getElementById('btn-time-resume');
  const passInput = document.getElementById('parent-password-input');
  const feedbackEl = document.getElementById('parent-password-feedback');

  if (passInput) passInput.value = '';
  if (feedbackEl) {
    feedbackEl.classList.add('hidden');
    feedbackEl.textContent = '';
  }

  if (isZero) {
    audio.wrong();
    titleEl.textContent = '⏳ Šios dienos žaidimo laikas baigėsi!';
    subEl.textContent = `Vairuotojas ${profile.name} šiandien jau išnaudojo dienos žaidimo laiko limitą! Visi bolido patobulinimai ir monetos yra saugiai išsaugoti.`;
    resumeBtn.classList.add('hidden');
  } else {
    titleEl.textContent = `⏳ Dienos žaidimo laikas (Liko: ${formatMMSS(remaining)})`;
    subEl.textContent =
      'Žaidimas sustabdytas. Gali tęsti žaidimą, pakeisti vairuotoją arba tėvai gali pridėti +10 min.';
    resumeBtn.classList.remove('hidden');
  }

  document.getElementById('modal-time-limit').classList.remove('hidden');
}

function closeTimeLimitModalAndResume() {
  const profile = garage.getActiveProfile();
  if (profile && getRemainingPlaytimeSeconds(profile.driverKey) <= 0) {
    return;
  }
  document.getElementById('modal-time-limit').classList.add('hidden');
  isTimeLimitPaused = false;
  updateGlobalTimerBadges();
}

function handleParentPasswordExtend() {
  const profile = garage.getActiveProfile();
  const passInput = document.getElementById('parent-password-input');
  const feedbackEl = document.getElementById('parent-password-feedback');
  if (!profile || !passInput || !feedbackEl) return;

  if (passInput.value.trim() === PARENT_PASSWORD) {
    const timeData = loadGlobalPlaytime(profile.driverKey);
    timeData.dailyTimeLimitSeconds = Math.max(timeData.dailyTimeLimitSeconds, timeData.timePlayedTodaySeconds) + 600;
    saveGlobalPlaytime(profile.driverKey, timeData);

    audio.fanfare();
    passInput.value = '';
    feedbackEl.classList.add('hidden');
    closeTimeLimitModalAndResume();
  } else {
    audio.wrong();
    feedbackEl.textContent = '❌ Neteisingas tėvų slaptažodis!';
    feedbackEl.className = 'parent-feedback error';
  }
}

// ==================== 0. PRADINIS PROFILIŲ PASIRINKIMO EKRANAS ====================
function openProfilesScreen() {
  isTimeLimitPaused = false;
  document.getElementById('modal-time-limit').classList.add('hidden');
  document.getElementById('modal-pitstop-math').classList.add('hidden');
  document.getElementById('modal-race-results').classList.add('hidden');

  currentScreen = 'PROFILES';
  document.getElementById('top-bar-active-driver').classList.add('hidden');
  document.getElementById('screen-garage').classList.add('hidden');
  document.getElementById('screen-race').classList.add('hidden');
  document.getElementById('screen-profiles').classList.remove('hidden');

  renderProfilesScreen();
}

function renderProfilesScreen() {
  const grid = document.getElementById('named-profiles-grid');
  grid.innerHTML = '';

  const drivers = ['linas', 'lukas'];
  drivers.forEach((driverKey) => {
    const profile = garage.loadDriver(driverKey);
    garage.profiles[driverKey] = profile;
    const stats = garage.getComputedCarStats(profile);
    const remainingSec = getRemainingPlaytimeSeconds(driverKey);
    const isLinas = driverKey === 'linas';

    const displayTitle = isLinas ? 'Linas (1 Klasė)' : 'Lukas (3 Klasė)';
    const gradeDesc = isLinas
      ? '🌱 1 Klasės Mechaniko iššūkiai: kuro bakai iki 20 L, greitis, ratų sudėtis ir varžtai!'
      : '⚡ 3 Klasės Mechaniko iššūkiai: kuro bakai iki 100 L, ratų daugyba (4×4), spidometras ir AG!';

    const totalMicro = calculatePlayerPowerLevel(profile);

    const card = document.createElement('div');
    card.className = 'driver-profile-card';
    card.innerHTML = `
      <div class="driver-card-top">
        <canvas width="120" height="86" class="profile-car-canvas" id="prof-car-canvas-${driverKey}"></canvas>
        <div class="driver-card-info">
          <h3>🏎️ ${displayTitle}</h3>
          <span class="fixed-grade-badge">${isLinas ? 'Užfiksuota: 1 Klasė' : 'Užfiksuota: 3 Klasė'} • ${stats.chassis.icon} ${stats.chassis.shortName}</span>
          <p class="driver-card-sub">${gradeDesc}</p>
        </div>
      </div>

      <div class="driver-slot-stats">
        <span>🪙 Monetos: <strong>${Math.floor(profile.coins).toLocaleString('lt-LT')}</strong></span>
        <span>🏆 Pergalės: <strong>${profile.wins || 0}</strong></span>
        <span>⚡ Galios Lygis: <strong>${totalMicro} / 200</strong></span>
        <span>⏳ Dienos laikas: <strong style="color:${remainingSec > 0 ? '#4ade80' : '#f87171'}">${formatMMSS(remainingSec)}</strong></span>
      </div>

      <div class="driver-slot-actions">
        <button class="driver-play-btn" data-select-driver="${driverKey}">
          🚀 ŽAISTI – ${displayTitle.toUpperCase()}
        </button>
        <button class="driver-reset-btn" title="Išvalyti šio vairuotojo garažo progresą" data-reset-driver="${driverKey}">
          🔄
        </button>
      </div>
    `;

    grid.appendChild(card);

    const miniCanvas = card.querySelector(`#prof-car-canvas-${driverKey}`);
    if (miniCanvas) {
      const mCtx = miniCanvas.getContext('2d');
      mCtx.save();
      mCtx.translate(60, 43);
      mCtx.scale(1.15, 1.15);
      drawCarTopDown(
        mCtx,
        {
          chassisId: profile.equipped.chassis,
          bumperId: profile.equipped.bumper,
          roofId: profile.equipped.roof,
          wheelsId: profile.equipped.wheels,
          paintId: profile.equipped.paint,
          bumperLevel: stats.bumperLevel,
          roofLevel: stats.roofLevel,
          hpRatio: profile.currentHp / stats.maxHp,
          steerAngle: 0
        },
        0
      );
      mCtx.restore();
    }
  });

  grid.querySelectorAll('[data-select-driver]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.correct();
      selectDriverAndOpenGarage(btn.dataset.selectDriver);
    });
  });

  grid.querySelectorAll('[data-reset-driver]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dKey = btn.dataset.resetDriver;
      const p = garage.profiles[dKey];
      if (p && confirm(`Ar tikrai nori iš naujo pradėti vairuotojo „${p.name}“ lenktynių progresą?`)) {
        garage.resetDriver(dKey);
        renderProfilesScreen();
      }
    });
  });
}

function selectDriverAndOpenGarage(driverKey) {
  garage.setActiveDriver(driverKey);
  currentScreen = 'GARAGE';

  document.getElementById('screen-profiles').classList.add('hidden');
  document.getElementById('screen-race').classList.add('hidden');
  document.getElementById('screen-garage').classList.remove('hidden');
  document.getElementById('top-bar-active-driver').classList.remove('hidden');

  updateGarageUI();
  updateGlobalTimerBadges();

  if (getRemainingPlaytimeSeconds(driverKey) <= 0) {
    openTimeLimitModal(true);
  }
}

// ==================== GARAŽO SĄSAJOS VALDYMAS ====================
const garagePreviewCanvas = document.getElementById('garage-preview-canvas');
const garagePreviewCtx = garagePreviewCanvas.getContext('2d');

function updateGarageUI() {
  const profile = garage.getActiveProfile();
  const stats = garage.getComputedCarStats(profile);

  document.getElementById('ui-driver-name').textContent = profile.name;
  document.getElementById('ui-coins').textContent = Math.floor(profile.coins).toLocaleString('lt-LT');
  document.getElementById('ui-wins').textContent = profile.wins || 0;
  updateGlobalTimerBadges();

  document.getElementById('garage-driver-title').textContent =
    profile.driverKey === 'linas' ? 'Lino (1 kl.) Kovinis Bolidas' : 'Luko (3 kl.) Kovinis Bolidas';

  if (profile.currentHp > stats.maxHp) profile.currentHp = stats.maxHp;
  const hp = Math.max(0, Math.round(profile.currentHp));
  if (hp <= 0) profile.needsRepair = true;
  const hpPct = Math.max(0, Math.min(100, (hp / stats.maxHp) * 100));

  document.getElementById('garage-hp-text').textContent = `${hp} / ${stats.maxHp} HP`;
  const hpFill = document.getElementById('garage-hp-fill');
  hpFill.style.width = `${hpPct}%`;
  hpFill.style.background =
    hpPct > 55
      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
      : hpPct > 25
        ? 'linear-gradient(90deg, #f59e0b, #facc15)'
        : 'linear-gradient(90deg, #dc2626, #ef4444)';

  const missingHp = Math.max(0, stats.maxHp - hp);
  const mustRepair = Boolean(profile.needsRepair || hp <= 0 || missingHp > 0);
  const repairRow = document.getElementById('repair-actions-row');
  const repairWarn = document.getElementById('garage-repair-warning');
  const startBtn = document.getElementById('btn-start-race');

  if (mustRepair) {
    repairRow.classList.remove('hidden');
    if (repairWarn) repairWarn.classList.remove('hidden');
    const ratio = stats.maxHp > 0 ? missingHp / stats.maxHp : 1;
    const fullRepairCost = Math.min(150, Math.max(100, Math.round(100 + ratio * 50)));
    const btnMath = document.getElementById('btn-repair-math');
    if (btnMath) {
      btnMath.textContent = '🛠️ Taisyti nemokamai (išspręsk 3 užduotis)';
    }
    const btnCoins = document.getElementById('btn-repair-coins');
    btnCoins.textContent = `🪙 Greitas remontas (${fullRepairCost} 🪙)`;
    btnCoins.dataset.cost = fullRepairCost;
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.classList.add('disabled');
      startBtn.textContent = '🔒 MAŠINA SUDAUŽYTA! REIKIA REMONTO';
    }
  } else {
    repairRow.classList.add('hidden');
    if (repairWarn) repairWarn.classList.add('hidden');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.classList.remove('disabled');
      startBtn.textContent = '🏁 VAŽIUOTI Į TRASĄ! (3 RATAI / 90s)';
    }
  }

  // Charakteristikos (Kėbulo klasė, Greitis, Taranas, Galios Lygis)
  const asphaltKmh = Math.round(118 * stats.asphaltSpeedMult);
  const mudKmh = Math.round(118 * stats.mudSpeedMult);
  const chassisEl = document.getElementById('stat-chassis');
  if (chassisEl) {
    chassisEl.textContent = `${stats.chassis.icon} ${stats.chassis.shortName}`;
  }
  document.getElementById('stat-speed').textContent = `${asphaltKmh} / ${mudKmh} km/h`;
  document.getElementById('stat-ram').textContent = `${Math.round(stats.ramMultiplier * 100)}%`;

  const powerLevel = calculatePlayerPowerLevel(profile);
  document.getElementById('stat-micro-total').textContent = `⚡ ${powerLevel} / 200`;

  renderTrackPicker(profile, stats);

  if (selectedTuningSlot === 'micro') {
    renderMicroUpgradesGrid(profile);
  } else {
    renderTuningPartsGrid(profile);
  }
}

function isTrackUnlocked(profile, trackId) {
  if (trackId === 'city_asphalt' || trackId === 'random_biome') return true;
  const unlocked = profile.unlockedTracks || ['city_asphalt'];
  return unlocked.includes(trackId);
}

function renderTrackPicker(profile, stats) {
  const container = document.getElementById('track-selector-cards');
  const adviceEl = document.getElementById('tire-surface-advice');
  container.innerHTML = '';

  const currentTrackId = normalizeTrackId(profile.selectedTrackId);

  TRACK_TYPES.forEach((tr) => {
    const isUnlocked = isTrackUnlocked(profile, tr.id);
    const btn = document.createElement('button');
    if (!isUnlocked) {
      btn.className = 'track-option-btn locked';
      btn.innerHTML = `
        <strong>🔒 ${tr.name}</strong>
        <span>${tr.surfaceLabel}</span>
        <div class="track-lock-banner">
          <span class="track-lock-tag">🔒 UŽRAKINTA</span>
          <span class="track-lock-price">Bilietas: ${tr.bossTicketPrice} 🪙</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        openBossTicketModal(tr);
      });
    } else {
      btn.className = `track-option-btn ${tr.id === currentTrackId ? 'active' : ''}`;
      btn.innerHTML = `
        <strong>${tr.name}</strong>
        <span>${tr.surfaceLabel}</span>
      `;
      btn.addEventListener('click', () => {
        profile.selectedTrackId = tr.id;
        garage.saveDriver();
        audio.correct();
        updateGarageUI();
      });
    }
    container.appendChild(btn);
  });

  // Trasos formos (layout) pasirinkimo mygtukai
  const currentLayoutId = profile.selectedLayoutId || 'auto';
  const layoutPills = document.querySelectorAll('#layout-selector-pills .layout-pill');
  layoutPills.forEach((p) => {
    p.classList.toggle('active', p.dataset.layout === currentLayoutId);
    p.onclick = () => {
      profile.selectedLayoutId = p.dataset.layout;
      garage.saveDriver();
      audio.correct();
      updateGarageUI();
    };
  });

  // Kėbulo klasės, padangų ir trasos suderinamumo patarimas pagal 3 trasų biomas ir geometrijas:
  const tireId = stats.wheels.id;
  const chassisId = stats.chassis.id;

  if (currentTrackId === 'winter_snow') {
    if (chassisId === 'chassis_truck') {
      adviceEl.className = 'tire-surface-advice good-match';
      adviceEl.textContent =
        '❄️ LEDO ZIGZAGAS: Šarvuotas Sunkvežimis stabiliausiai įveikia aštrius 90°/180° posūkius! Šok per tramplinus ir kirsk pusnis!';
    } else if (chassisId === 'chassis_sports') {
      adviceEl.className = 'tire-surface-advice warn-match';
      adviceEl.textContent =
        '⚠️ ČIUOŽYKLA: Sportinė Mašina ant ledo zigzago nekontroliuojamai slysta ties posūkiais, bet tiesiosiose išvysto didelį greitį!';
    } else {
      adviceEl.className = 'tire-surface-advice good-match';
      adviceEl.textContent =
        '❄️ ŽIEMOS ZIGZAGAS: Sukibimas tik 0.4, aštrūs 90°/180° posūkiai, tramplinai tiesiosiose ir sniego kirtimai su Tanku!';
    }
  } else if (currentTrackId === 'desert_sand') {
    if (chassisId === 'chassis_buggy') {
      adviceEl.className = 'tire-surface-advice good-match';
      adviceEl.textContent =
        '🏜️ BULIŲ AŠTUONIUKĖ: Lengvasis Bagis skrieja 100% greičiu per smėlį! Saugokis susikirtimo centre ir naudok trampliną!';
    } else if (chassisId === 'chassis_sports') {
      adviceEl.className = 'tire-surface-advice warn-match';
      adviceEl.textContent =
        '⚠️ KLAMPUS SMĖLIS: Sportinė Mašina dykumoje praranda 30% greičio, o aštuoniukės centre laukia garantuotos avarijos!';
    } else {
      adviceEl.className = 'tire-surface-advice warn-match';
      adviceEl.textContent =
        '🏜️ KAUTYNIŲ AŠTUONIUKĖ: Trasa susikerta centre – ideali vieta taranavimui! Tramplinas virš susikirtimo ir bekelės kirtimai!';
    }
  } else if (currentTrackId === 'random_biome') {
    adviceEl.className = 'tire-surface-advice good-match';
    adviceEl.textContent =
      '🎲 ATSITIKTINIS PARINKIMAS: Starto metu sistema parinks Miestą, Žiemą arba Dykumą bei trasos formą. Būk pasiruošęs!';
  } else {
    // city_asphalt
    if (chassisId === 'chassis_sports' && tireId === 'wheels_slick') {
      adviceEl.className = 'tire-surface-advice good-match';
      adviceEl.textContent =
        '🚀 REKORDINIS GREITIS: Sportinė Mašina + „Slick“ padangos Miesto Žiede skrieja maksimaliu greičiu ir šoka per tramplinus!';
    } else if (chassisId === 'chassis_truck') {
      adviceEl.className = 'tire-surface-advice good-match';
      adviceEl.textContent =
        '🚛 BULIŲ KARALIUS: Šarvuotas Sunkvežimis su ×3 taranavimo jėga nušluoja visus priešininkus ir lengvai kerta per bekelę!';
    } else {
      adviceEl.className = 'tire-surface-advice good-match';
      adviceEl.textContent =
        '🏙️ MIESTO GRAND PRIX ŽIEDAS: Švelnūs S-vingiai, greičio tramplinai tiesiosiose ir parko bekelės kirtimas su Tanku!';
    }
  }
}

// 5 PUNKTAS: 50 LYGIŲ MIKRO-TOBULINIMŲ TINKLELIS
function renderMicroUpgradesGrid(profile) {
  const grid = document.getElementById('tuning-parts-grid');
  grid.innerHTML = '';

  if (!profile.microUpgrades) {
    profile.microUpgrades = { engine: 0, armor: 0, ram: 0, weapons: 0 };
  }

  MICRO_UPGRADES.forEach((upDef) => {
    const curLvl = profile.microUpgrades[upDef.id] || 0;
    const isMax = curLvl >= MAX_MICRO_UPGRADE_LEVEL;
    const { fullPrice, discountPrice } = getMicroUpgradePrices(upDef, curLvl);
    const curBonus = (curLvl * upDef.perLevelPct).toFixed(1).replace(/\.0$/, '');
    const nextBonus = ((curLvl + 1) * upDef.perLevelPct).toFixed(1).replace(/\.0$/, '');
    const pctFill = (curLvl / MAX_MICRO_UPGRADE_LEVEL) * 100;

    const canAffordDiscount = profile.coins >= discountPrice;
    const canAffordFull = profile.coins >= fullPrice;

    const card = document.createElement('div');
    card.className = `part-card ${isMax ? 'equipped-card' : ''}`;

    let actionsHtml = '';
    if (isMax) {
      actionsHtml = `
        <button class="part-btn btn-equipped" disabled>🏆 MAKSIMALUS LYGIs (50 / 50)</button>
      `;
    } else {
      actionsHtml = `
        <button class="part-btn btn-buy-math" data-micro-math="${upDef.id}" ${!canAffordDiscount ? 'disabled' : ''}>
          🧠 Lygis ${curLvl + 1} su Mechaniko Iššūkiu: ${discountPrice} 🪙 (-60%!)
        </button>
        <button class="part-btn btn-buy-full" data-micro-full="${upDef.id}" ${!canAffordFull ? 'disabled' : ''}>
          🪙 Lygis ${curLvl + 1} pilna kaina: ${fullPrice} 🪙
        </button>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="part-card-top">
          <div class="part-icon-box">${upDef.icon}</div>
          <div class="part-title-wrap">
            <h3>${upDef.name}</h3>
            <span class="part-stats-badge">Lygis ${curLvl} / ${MAX_MICRO_UPGRADE_LEVEL} • Dabar: +${curBonus}${upDef.unitLabel}</span>
          </div>
        </div>
        <div class="micro-level-bar-outer">
          <div class="micro-level-bar-fill" style="width: ${pctFill}%;"></div>
        </div>
        <p class="part-desc" style="margin-top: 10px;">
          ${upDef.desc}
          ${!isMax ? `<br><strong style="color:#4ade80">Kitas lygis (${curLvl + 1}/50): +${nextBonus}${upDef.unitLabel}</strong>` : ''}
        </p>
      </div>
      <div class="part-actions">
        ${actionsHtml}
      </div>
    `;

    grid.appendChild(card);
  });

  grid.querySelectorAll('button[data-micro-math]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const upId = btn.dataset.microMath;
      const upDef = MICRO_UPGRADES.find((u) => u.id === upId);
      if (upDef) {
        startPitStopMathChallenge('buy_micro', upDef);
      }
    });
  });

  grid.querySelectorAll('button[data-micro-full]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const upId = btn.dataset.microFull;
      const upDef = MICRO_UPGRADES.find((u) => u.id === upId);
      if (!upDef) return;
      const curLvl = profile.microUpgrades[upDef.id] || 0;
      const { fullPrice } = getMicroUpgradePrices(upDef, curLvl);
      buyMicroUpgradeDirect(upDef, fullPrice);
    });
  });
}

function buyMicroUpgradeDirect(upDef, priceToPay) {
  const profile = garage.getActiveProfile();
  const curLvl = profile.microUpgrades[upDef.id] || 0;
  if (curLvl >= MAX_MICRO_UPGRADE_LEVEL || profile.coins < priceToPay) return;

  const prevStats = garage.getComputedCarStats(profile);
  const wasFullHp = profile.currentHp >= prevStats.maxHp;

  profile.coins -= priceToPay;
  profile.microUpgrades[upDef.id] = curLvl + 1;

  const newStats = garage.getComputedCarStats(profile);
  if (!profile.needsRepair && (upDef.id === 'armor' || wasFullHp)) {
    profile.currentHp = newStats.maxHp;
  }

  garage.saveDriver();
  audio.correct();
  updateGarageUI();
}

function formatVisualEvolutionNote(part, curLvl) {
  if (!part || !part.upgradeable) return '';
  if (part.slot !== 'roof' && part.slot !== 'bumper') return '';
  if (part.slot === 'roof' && part.weaponType === 'none') return '';

  const tierInfo = getVisualTierInfo(curLvl);
  if (tierInfo.nextTierLevel !== null) {
    const rem = tierInfo.levelsToNextTier;
    const word = rem === 1 ? 'lygis' : 'lygiai';
    return `
      <div class="part-tier-countdown" style="margin-top:6px; padding-top:5px; border-top:1px dashed rgba(148,163,184,0.35); color:#e2e8f0;">
        ✨ <strong style="color:${tierInfo.color}">${tierInfo.shortLabel} (${tierInfo.title})</strong> •
        ⏳ <strong>Iki vizualaus atnaujinimo liko: ${rem} ${word}!</strong>
      </div>
    `;
  }
  return `
    <div class="part-tier-countdown" style="margin-top:6px; padding-top:5px; border-top:1px dashed rgba(250,204,21,0.45); color:#fde047;">
      👑 <strong>Tier 4 (Legendinis):</strong> Pasiekta maksimali vizualinė evoliucija su švytinčia aura!
    </div>
  `;
}

function formatPartUpgradePreview(part, curLvl) {
  if (!part || !part.upgradeable) return '';
  const evoNote = formatVisualEvolutionNote(part, curLvl);
  if (curLvl >= MAX_PART_LEVEL) {
    return `<div class="part-upgrade-preview">🏆 Pasiektas maksimalus detalės lygis (${MAX_PART_LEVEL} / ${MAX_PART_LEVEL})!${evoNote}</div>`;
  }

  const cur = getPartStatsAtLevel(part, curLvl);
  const next = getPartStatsAtLevel(part, curLvl + 1);

  if (part.slot === 'roof' && part.weaponType !== 'none') {
    return `
      <div class="part-upgrade-preview">
        📈 <strong>Level ${curLvl} ➔ ${curLvl + 1}:</strong>
        Žala: <strong>${cur.damage} ➔ ${next.damage}</strong> &nbsp;|&nbsp;
        Atvėsimas: <strong>${cur.cooldownSec}s ➔ ${next.cooldownSec}s</strong>
        ${evoNote}
      </div>
    `;
  }

  if (part.slot === 'bumper') {
    return `
      <div class="part-upgrade-preview">
        📈 <strong>Level ${curLvl} ➔ ${curLvl + 1}:</strong>
        Smūgio žala: <strong>${cur.ramMult}x ➔ ${next.ramMult}x</strong> &nbsp;|&nbsp;
        Bonus HP: <strong>+${cur.bonusHp} ➔ +${next.bonusHp} HP</strong>
        ${evoNote}
      </div>
    `;
  }

  if (part.slot === 'wheels') {
    const curGripPct = (cur.asphaltGrip * 100).toFixed(2).replace(/\.00$/, '');
    const nextGripPct = (next.asphaltGrip * 100).toFixed(2).replace(/\.00$/, '');
    return `
      <div class="part-upgrade-preview">
        📈 <strong>Level ${curLvl} ➔ ${curLvl + 1}:</strong>
        Sukibimas (Grip): <strong>${curGripPct}% ➔ ${nextGripPct}%</strong> &nbsp;|&nbsp;
        Greitis: <strong>+${cur.speedBonusPct}% ➔ +${next.speedBonusPct}%</strong>
      </div>
    `;
  }

  return '';
}

function formatCurrentPartBadge(part, partState) {
  if (!part.upgradeable) return part.statsBadge;
  if (!partState.owned) {
    return `🔒 Neįsigyta • ${part.statsBadge}`;
  }
  const lvl = partState.level || 1;
  const st = getPartStatsAtLevel(part, lvl);
  const tierInfo = getVisualTierInfo(lvl);
  if (part.slot === 'roof' && part.weaponType !== 'none') {
    return `⭐ Level ${lvl}/${MAX_PART_LEVEL} (${tierInfo.shortLabel}) • Žala: ${st.damage} • Atvėsimas: ${st.cooldownSec}s`;
  }
  if (part.slot === 'bumper') {
    return `⭐ Level ${lvl}/${MAX_PART_LEVEL} (${tierInfo.shortLabel}) • Smūgis: ${st.ramMult}x • +${st.bonusHp} HP`;
  }
  if (part.slot === 'wheels') {
    const gripPct = (st.asphaltGrip * 100).toFixed(1);
    return `⭐ Level ${lvl}/${MAX_PART_LEVEL} • Grip: ${gripPct}% • Greitis: +${st.speedBonusPct}%`;
  }
  return part.statsBadge;
}

function renderTuningPartsGrid(profile) {
  const grid = document.getElementById('tuning-parts-grid');
  grid.innerHTML = '';

  const parts = TUNING_CATALOG[selectedTuningSlot] || [];
  parts.forEach((part) => {
    const partState = getProfilePartState(profile, part);
    const isOwned = partState.owned;
    const curLvl = partState.level || 1;
    const isEquipped = profile.equipped[part.slot] === part.id;
    const isUpgradeable = Boolean(part.upgradeable);

    const card = document.createElement('div');
    card.className = `part-card ${isEquipped ? 'equipped-card' : ''}`;

    let upgradePreviewHtml = '';
    let levelBarHtml = '';
    let actionsHtml = '';

    if (isUpgradeable) {
      if (!isOwned) {
        // Detalės dar neturi -> rodomas mygtukas „PIRKTI (Level 1)“
        const basePrice = part.fullPrice || 0;
        const canAfford = profile.coins >= basePrice;
        const lvl1Stats = getPartStatsAtLevel(part, 1);
        if (part.slot === 'roof' && part.weaponType !== 'none') {
          upgradePreviewHtml = `<div class="part-upgrade-preview">🆕 <strong>Level 1 rodikliai:</strong> Žala: <strong>${lvl1Stats.damage}</strong> &nbsp;|&nbsp; Atvėsimas: <strong>${lvl1Stats.cooldownSec}s</strong></div>`;
        } else if (part.slot === 'bumper') {
          upgradePreviewHtml = `<div class="part-upgrade-preview">🆕 <strong>Level 1 rodikliai:</strong> Smūgio žala: <strong>${lvl1Stats.ramMult}x</strong> &nbsp;|&nbsp; Bonus HP: <strong>+${lvl1Stats.bonusHp} HP</strong></div>`;
        } else if (part.slot === 'wheels') {
          upgradePreviewHtml = `<div class="part-upgrade-preview">🆕 <strong>Level 1 rodikliai:</strong> Sukibimas: <strong>${(lvl1Stats.asphaltGrip * 100).toFixed(1)}%</strong> &nbsp;|&nbsp; Greitis: <strong>+0%</strong></div>`;
        }
        actionsHtml = `
          <button class="part-btn btn-buy-math" data-action="buy-lvl1" data-id="${part.id}" ${!canAfford ? 'disabled' : ''}>
            🛒 PIRKTI (Level 1) — ${basePrice} 🪙
          </button>
        `;
      } else {
        // Detalę jau turi -> rodomas progresas, pokyčio palyginimas ir mygtukas „TOBULINTI į Level [X+1]“
        const pctFill = (curLvl / MAX_PART_LEVEL) * 100;
        levelBarHtml = `
          <div class="micro-level-bar-outer" style="margin-top: 8px;">
            <div class="micro-level-bar-fill" style="width: ${pctFill}%;"></div>
          </div>
        `;
        upgradePreviewHtml = formatPartUpgradePreview(part, curLvl);

        const isMax = curLvl >= MAX_PART_LEVEL;
        const upgradePrice = getPartUpgradePrice(part, curLvl);
        const canAffordUpgrade = profile.coins >= upgradePrice;

        const equipBtnHtml = isEquipped
          ? `<button class="part-btn btn-equipped" disabled>✅ UŽDĖTA ANT MAŠINOS (Level ${curLvl})</button>`
          : `<button class="part-btn btn-equip" data-action="equip" data-id="${part.id}">🔧 UŽDĖTI DETALĘ (Level ${curLvl})</button>`;

        const upgradeBtnHtml = isMax
          ? `<button class="part-btn btn-equipped" disabled>🏆 MAKSIMALUS LYGIS (${MAX_PART_LEVEL})</button>`
          : `<button class="part-btn btn-buy-math" data-action="upgrade-part" data-id="${part.id}" ${!canAffordUpgrade ? 'disabled' : ''}>
              ⬆️ TOBULINTI į Level ${curLvl + 1} (${upgradePrice} 🪙)
            </button>`;

        actionsHtml = `
          ${upgradeBtnHtml}
          ${equipBtnHtml}
        `;
      }
    } else {
      // Kėbulai (chassis), dažai (paint) ir tuščias stogas (roof_none)
      if (isEquipped) {
        actionsHtml = `
          <button class="part-btn btn-equipped" disabled>✅ UŽDĖTA ANT MAŠINOS</button>
        `;
      } else if (isOwned) {
        actionsHtml = `
          <button class="part-btn btn-equip" data-action="equip" data-id="${part.id}">
            🔧 UŽDĖTI DETALĘ
          </button>
        `;
      } else {
        const canAffordDiscount = profile.coins >= part.discountPrice;
        const canAffordFull = profile.coins >= part.fullPrice;
        actionsHtml = `
          <button class="part-btn btn-buy-math" data-action="buy-math" data-id="${part.id}" ${!canAffordDiscount ? 'disabled' : ''}>
            🧠 Su Mechaniko Iššūkiu: ${part.discountPrice} 🪙 (-60%!)
          </button>
          <button class="part-btn btn-buy-full" data-action="buy-full" data-id="${part.id}" ${!canAffordFull ? 'disabled' : ''}>
            🪙 Pilna kaina be nuolaidos: ${part.fullPrice} 🪙
          </button>
        `;
      }
    }

    card.innerHTML = `
      <div>
        <div class="part-card-top">
          <div class="part-icon-box">${part.icon}</div>
          <div class="part-title-wrap">
            <h3>${part.name}</h3>
            <span class="part-stats-badge">${formatCurrentPartBadge(part, partState)}</span>
          </div>
        </div>
        ${levelBarHtml}
        <p class="part-desc" style="margin-top: 10px;">${part.desc}</p>
        ${upgradePreviewHtml}
      </div>
      <div class="part-actions">
        ${actionsHtml}
      </div>
    `;

    grid.appendChild(card);
  });

  grid.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const partId = btn.dataset.id;
      const part = garage.findPart(partId);
      if (!part) return;

      if (action === 'equip') {
        equipPart(part);
      } else if (action === 'buy-lvl1') {
        buyPartDirect(part, part.fullPrice || 0);
      } else if (action === 'upgrade-part') {
        // Paspaudus „TOBULINTI“, visada iššaukiamas „Mechaniko iššūkis“ (3 uždaviniai)!
        startPitStopMathChallenge('upgrade_part', part);
      } else if (action === 'buy-math') {
        startPitStopMathChallenge('buy_part', part);
      } else if (action === 'buy-full') {
        buyPartDirect(part, part.fullPrice);
      }
    });
  });
}

function equipPart(part) {
  const profile = garage.getActiveProfile();
  const prevStats = garage.getComputedCarStats(profile);
  const wasFullHp = profile.currentHp >= prevStats.maxHp;

  profile.equipped[part.slot] = part.id;
  const newStats = garage.getComputedCarStats(profile);
  if (wasFullHp || profile.currentHp > newStats.maxHp) {
    profile.currentHp = newStats.maxHp;
  }

  garage.saveDriver();
  audio.correct();
  updateGarageUI();
}

function buyPartDirect(part, priceToPay) {
  const profile = garage.getActiveProfile();
  if (profile.coins < priceToPay) return;

  profile.coins -= priceToPay;
  setProfilePartState(profile, part, { owned: true, level: 1 });
  equipPart(part);
}

function triggerGarageEvolutionCelebration(part, newTierInfo) {
  const isWeapon = part.slot === 'roof';
  const mainTitle = isWeapon
    ? `🎉 Ginklas evoliucionavo į Tier ${newTierInfo.tier}!`
    : `🎉 Bamperis evoliucionavo į Tier ${newTierInfo.tier}!`;
  const subTitle = `${part.icon} ${part.name} pasiekė „${newTierInfo.title}“ pakopą! Nauja išvaizda atrakinta!`;

  garageEvolutionToast = {
    text: mainTitle,
    subText: subTitle,
    color: newTierInfo.color || '#facc15',
    expiresAt: Date.now() + 4800
  };

  let bannerEl = document.getElementById('garage-evolution-toast');
  if (!bannerEl) {
    bannerEl = document.createElement('div');
    bannerEl.id = 'garage-evolution-toast';
    bannerEl.style.cssText =
      'position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:9999; ' +
      'background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border:4px solid #facc15; ' +
      'border-radius:14px; padding:14px 26px; text-align:center; box-shadow:0 12px 28px rgba(0,0,0,0.75); ' +
      'font-family:"Nunito", system-ui, sans-serif; pointer-events:none; transition:opacity 0.3s ease;';
    document.body.appendChild(bannerEl);
  }

  bannerEl.style.borderColor = newTierInfo.color || '#facc15';
  bannerEl.style.opacity = '1';
  bannerEl.innerHTML = `
    <div style="font-family:'Russo One',sans-serif; font-size:1.25rem; color:${newTierInfo.color || '#facc15'}; text-shadow:0 2px 0 #000;">
      ${mainTitle}
    </div>
    <div style="font-size:0.95rem; font-weight:800; color:#f8fafc; margin-top:4px;">
      ${subTitle}
    </div>
  `;

  setTimeout(() => {
    if (bannerEl && (!garageEvolutionToast || Date.now() >= garageEvolutionToast.expiresAt - 200)) {
      bannerEl.style.opacity = '0';
    }
  }, 4500);
}

function upgradePartLevelDirect(part, priceToPay) {
  const profile = garage.getActiveProfile();
  const state = getProfilePartState(profile, part);
  if (!state.owned || state.level >= MAX_PART_LEVEL || profile.coins < priceToPay) return;

  const prevLvl = state.level || 1;
  const nextLvl = prevLvl + 1;
  const prevTier = getVisualTierInfo(prevLvl);
  const nextTier = getVisualTierInfo(nextLvl);

  const prevStats = garage.getComputedCarStats(profile);
  const wasFullHp = profile.currentHp >= prevStats.maxHp;

  profile.coins -= priceToPay;
  setProfilePartState(profile, part, { owned: true, level: nextLvl });

  // Jei tobulinama detalė dar neuždėta – automatiškai uždedame, kad žaidėjas iškart matytų evoliuciją
  if (part.slot === 'roof' || part.slot === 'bumper' || part.slot === 'wheels') {
    profile.equipped[part.slot] = part.id;
  }

  const newStats = garage.getComputedCarStats(profile);
  if (!profile.needsRepair && (wasFullHp || part.slot === 'bumper' || part.slot === 'roof')) {
    profile.currentHp = Math.min(newStats.maxHp, profile.currentHp + Math.max(0, newStats.maxHp - prevStats.maxHp));
  }

  garage.saveDriver();
  audio.correct();
  updateGarageUI();

  if ((part.slot === 'roof' || part.slot === 'bumper') && nextTier.tier > prevTier.tier) {
    audio.fanfare();
    triggerGarageEvolutionCelebration(part, nextTier);
  }
}

// ==================== GARAŽO MAŠINOS MODELIO PIEŠIMAS ====================
function drawGarageTurntable() {
  if (currentScreen !== 'GARAGE') return;
  const profile = garage.getActiveProfile();
  const stats = garage.getComputedCarStats(profile);

  const w = garagePreviewCanvas.width;
  const h = garagePreviewCanvas.height;
  garagePreviewCtx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2 + 4;

  garagePreviewCtx.save();
  const trackTheme = normalizeTrackId(profile.selectedTrackId);
  let previewBg = '#1e293b';
  let previewStroke = '#38bdf8';
  if (trackTheme === 'winter_snow') {
    previewBg = '#64748b';
    previewStroke = '#7dd3fc';
  } else if (trackTheme === 'desert_sand') {
    previewBg = '#78350f';
    previewStroke = '#f59e0b';
  } else if (trackTheme === 'random_biome') {
    previewBg = '#334155';
    previewStroke = '#facc15';
  }
  garagePreviewCtx.fillStyle = previewBg;
  garagePreviewCtx.strokeStyle = previewStroke;
  garagePreviewCtx.lineWidth = 4;
  garagePreviewCtx.beginPath();
  garagePreviewCtx.ellipse(cx, cy, 165, 90, 0, 0, Math.PI * 2);
  garagePreviewCtx.fill();
  garagePreviewCtx.stroke();

  garagePreviewCtx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
  garagePreviewCtx.lineWidth = 2;
  garagePreviewCtx.setLineDash([10, 8]);
  garagePreviewCtx.beginPath();
  garagePreviewCtx.ellipse(cx, cy, 132, 70, 0, 0, Math.PI * 2);
  garagePreviewCtx.stroke();
  garagePreviewCtx.setLineDash([]);
  garagePreviewCtx.restore();

  if (previewSpinEnabled) {
    previewAngle += 0.008;
  } else {
    previewAngle = 0;
  }

  garagePreviewCtx.save();
  garagePreviewCtx.translate(cx, cy);
  garagePreviewCtx.scale(2.3, 2.3);
  garagePreviewCtx.rotate(previewAngle);

  drawCarTopDown(
    garagePreviewCtx,
    {
      chassisId: profile.equipped.chassis,
      bumperId: profile.equipped.bumper,
      roofId: profile.equipped.roof,
      wheelsId: profile.equipped.wheels,
      paintId: profile.equipped.paint,
      bumperLevel: stats.bumperLevel,
      roofLevel: stats.roofLevel,
      hpRatio: profile.currentHp / stats.maxHp,
      steerAngle: Math.sin(animTick * 0.04) * 0.35,
      muzzleFlash: profile.equipped.roof === 'weapon_minigun' && animTick % 45 < 5 ? 1 : 0
    },
    animTick
  );

  garagePreviewCtx.restore();

  if (garageEvolutionToast && Date.now() < garageEvolutionToast.expiresAt) {
    garagePreviewCtx.save();
    garagePreviewCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    garagePreviewCtx.strokeStyle = garageEvolutionToast.color || '#facc15';
    garagePreviewCtx.lineWidth = 3;
    garagePreviewCtx.fillRect(14, 10, w - 28, 38);
    garagePreviewCtx.strokeRect(14, 10, w - 28, 38);
    garagePreviewCtx.fillStyle = garageEvolutionToast.color || '#facc15';
    garagePreviewCtx.font = '900 13px "Nunito", sans-serif';
    garagePreviewCtx.textAlign = 'center';
    garagePreviewCtx.fillText(garageEvolutionToast.text, cx, 34);
    garagePreviewCtx.restore();
  }
}

// ==================== MATEMATIKOS BOSAS IR GREITA MATEMATIKA GARAŽE ====================
let currentBossTrackDef = null;

function openBossTicketModal(trackDef) {
  const profile = garage.getActiveProfile();
  currentBossTrackDef = trackDef;

  const iconEl = document.getElementById('boss-ticket-icon');
  const titleEl = document.getElementById('boss-ticket-title');
  const priceEl = document.getElementById('boss-ticket-price-display');
  const costTextEl = document.getElementById('boss-btn-cost-text');
  const userCoinsEl = document.getElementById('boss-ticket-user-coins');
  const warningEl = document.getElementById('boss-ticket-warning');
  const buyBtn = document.getElementById('btn-buy-boss-ticket');

  const ticketPrice = trackDef.bossTicketPrice || 2000;
  const emoji = trackDef.id === 'winter_snow' ? '❄️' : (trackDef.id === 'desert_sand' ? '🏜️' : '👑');

  if (iconEl) iconEl.textContent = emoji;
  if (titleEl) titleEl.textContent = trackDef.shortTitle || trackDef.name;
  if (priceEl) priceEl.textContent = `${ticketPrice} 🪙`;
  if (costTextEl) costTextEl.textContent = `${ticketPrice}`;
  if (userCoinsEl) userCoinsEl.textContent = `${profile.coins} 🪙`;

  const canAfford = profile.coins >= ticketPrice;
  if (buyBtn) {
    buyBtn.disabled = !canAfford;
  }
  if (warningEl) {
    if (canAfford) {
      warningEl.classList.add('hidden');
    } else {
      warningEl.classList.remove('hidden');
      warningEl.textContent = `⚠️ Nepakanka monetų! Turi ${profile.coins} 🪙, o bilietas kainuoja ${ticketPrice} 🪙. Laimėk daugiau lenktynių arenoje!`;
    }
  }

  const modal = document.getElementById('modal-boss-ticket');
  if (modal) modal.classList.remove('hidden');
}

function closeBossTicketModal() {
  currentBossTrackDef = null;
  const modal = document.getElementById('modal-boss-ticket');
  if (modal) modal.classList.add('hidden');
}

function startBossMathChallenge(trackDef) {
  if (!trackDef) return;
  const profile = garage.getActiveProfile();
  if (getRemainingPlaytimeSeconds(profile.driverKey) <= 0) {
    openTimeLimitModal(true);
    return;
  }

  const ticketPrice = trackDef.bossTicketPrice || 2000;
  if (profile.coins < ticketPrice) {
    return;
  }

  // Pinigai NURAŠOMI IŠ KARTO perkant bilietą!
  profile.coins -= ticketPrice;
  garage.saveDriver();
  updateGarageUI();
  closeBossTicketModal();

  mathChallenge = {
    mode: 'boss_track',
    targetItem: trackDef,
    discountCost: ticketPrice,
    fullCost: ticketPrice,
    step: 0,
    totalSteps: 5,
    mistakes: 0,
    currentQ: null,
    timerMax: 18,
    timerLeft: 18
  };

  const titleBadge = document.getElementById('pitstop-title-badge');
  if (titleBadge) {
    titleBadge.textContent = '👑 MATEMATIKOS BOSO IŠŠŪKIS (5 UŽDUOTYS)';
  }

  const descEl = document.getElementById('pitstop-target-desc');
  if (descEl) {
    descEl.innerHTML = `Boso kova dėl <strong>${trackDef.name}</strong> trasos atrakinimo! Bilietas nupirktas (-${ticketPrice} 🪙). Teisingai išspręsk <strong>5 uždavinius iš eilės</strong>! ⚠️ <strong>BENT VIENA KLAIDA = PINIGAI SUDEGA IR TRASA LIEKA UŽRAKINTA!</strong>`;
  }

  // Sukuriame 5 progreso lempučių taškus
  const progressRow = document.getElementById('pitstop-progress-row');
  if (progressRow) {
    progressRow.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('div');
      dot.id = `pit-dot-${i}`;
      dot.className = `pit-dot ${i === 0 ? 'active' : ''}`;
      dot.textContent = String(i + 1);
      progressRow.appendChild(dot);
    }
  }

  document.getElementById('math-feedback-msg').textContent = '';
  document.getElementById('modal-pitstop-math').classList.remove('hidden');

  loadNextPitStopQuestion();
}

function startPitStopMathChallenge(mode, targetItem = null) {
  const profile = garage.getActiveProfile();
  if (getRemainingPlaytimeSeconds(profile.driverKey) <= 0) {
    openTimeLimitModal(true);
    return;
  }

  let discountCost = 0;
  let fullCost = 0;
  if (mode === 'upgrade_part' && targetItem) {
    const partState = getProfilePartState(profile, targetItem);
    const curLvl = partState.level || 1;
    const upgradeCost = getPartUpgradePrice(targetItem, curLvl);
    discountCost = upgradeCost;
    fullCost = upgradeCost;
  } else if (mode === 'buy_part' && targetItem) {
    discountCost = targetItem.discountPrice;
    fullCost = targetItem.fullPrice;
  } else if (mode === 'buy_micro' && targetItem) {
    const curLvl = profile.microUpgrades[targetItem.id] || 0;
    const prices = getMicroUpgradePrices(targetItem, curLvl);
    discountCost = prices.discountPrice;
    fullCost = prices.fullPrice;
  }

  if ((mode === 'upgrade_part' || mode === 'buy_part' || mode === 'buy_micro') && profile.coins < discountCost) {
    return;
  }

  mathChallenge = {
    mode,
    targetItem,
    discountCost,
    fullCost,
    step: 0,
    totalSteps: 3,
    mistakes: 0,
    currentQ: null,
    timerMax: 14,
    timerLeft: 14
  };

  const titleBadge = document.getElementById('pitstop-title-badge');
  if (titleBadge) {
    titleBadge.textContent = '🔧 MECHANIKO PIT-STOP IŠŠŪKIS (3 UŽDUOTYS)';
  }

  const descEl = document.getElementById('pitstop-target-desc');
  if (mode === 'repair') {
    descEl.innerHTML = `Išspręsk 3 Mechaniko užduotis (${profile.grade} kl.) be klaidų ir suremontuok bolidą <strong>NEMOKAMAI (0 🪙)</strong>! ⚠️ Suklydus – remontas nutraukiamas ir skiriama <strong>3% monetų bauda</strong>!`;
  } else if (mode === 'upgrade_part' && targetItem) {
    const curLvl = getProfilePartState(profile, targetItem).level || 1;
    descEl.innerHTML = `Tobulinama: <strong>${targetItem.name} (Level ${curLvl} ➔ Level ${curLvl + 1})</strong> už <strong>${discountCost} 🪙</strong>. Išspręsk visas 3 užduotis be klaidų! ⚠️ Suklydus – tobulinimas atšaukiamas ir atimama <strong>3% monetų bauda</strong>!`;
  } else if (mode === 'buy_micro' && targetItem) {
    const nextLvl = (profile.microUpgrades[targetItem.id] || 0) + 1;
    descEl.innerHTML = `Tobulinama: <strong>${targetItem.name} (Lygis ${nextLvl}/50)</strong>. Išspręsk 3 užduotis ir mokėk tik <strong>${discountCost} 🪙</strong> (vietoje ${fullCost} 🪙)! ⚠️ Suklydus – 3% monetų bauda!`;
  } else if (targetItem) {
    descEl.innerHTML = `Perkama: <strong>${targetItem.name}</strong>. Išspręsk 3 užduotis (${profile.grade} kl.) ir mokėk tik <strong>${discountCost} 🪙</strong> (vietoje ${fullCost} 🪙)! ⚠️ Suklydus – 3% monetų bauda!`;
  }

  const progressRow = document.getElementById('pitstop-progress-row');
  if (progressRow) {
    progressRow.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.id = `pit-dot-${i}`;
      dot.className = `pit-dot ${i === 0 ? 'active' : ''}`;
      dot.textContent = String(i + 1);
      progressRow.appendChild(dot);
    }
  }

  document.getElementById('math-feedback-msg').textContent = '';
  document.getElementById('modal-pitstop-math').classList.remove('hidden');

  loadNextPitStopQuestion();
}

function loadNextPitStopQuestion() {
  if (!mathChallenge) return;
  const profile = garage.getActiveProfile();
  const q = mathChallenge.mode === 'boss_track'
    ? pitMath.generateBossQuestion(profile.grade)
    : pitMath.generateQuestion(profile.grade);
  mathChallenge.currentQ = q;
  mathChallenge.timerLeft = mathChallenge.timerMax;

  document.getElementById('math-q-badge').textContent = q.badge;
  document.getElementById('math-q-formula').textContent = q.formula;
  document.getElementById('math-q-hint').textContent = q.hint;

  const choicesGrid = document.getElementById('math-choices-grid');
  choicesGrid.innerHTML = '';
  choicesGrid.classList.toggle('math-choices-two', q.choices.length === 2);
  q.choices.forEach((val) => {
    const btn = document.createElement('button');
    btn.className = 'math-choice-btn';
    btn.textContent = String(val);
    btn.addEventListener('click', () => handlePitStopAnswer(val));
    choicesGrid.appendChild(btn);
  });

  if (mathTimerInterval) clearInterval(mathTimerInterval);
  const timerFill = document.getElementById('math-timer-fill');
  timerFill.style.width = '100%';

  mathTimerInterval = setInterval(() => {
    if (!mathChallenge || isTimeLimitPaused) return;
    mathChallenge.timerLeft = Math.max(0, mathChallenge.timerLeft - 0.1);
    const pct = (mathChallenge.timerLeft / mathChallenge.timerMax) * 100;
    timerFill.style.width = `${pct}%`;

    if (mathChallenge.timerLeft <= 0) {
      clearInterval(mathTimerInterval);
      handlePitStopAnswer(null);
    }
  }, 100);
}

function handlePitStopAnswer(chosenVal) {
  if (!mathChallenge || !mathChallenge.currentQ) return;
  if (mathTimerInterval) clearInterval(mathTimerInterval);

  const isCorrect = chosenVal === mathChallenge.currentQ.answer;
  const dot = document.getElementById(`pit-dot-${mathChallenge.step}`);
  const feedbackEl = document.getElementById('math-feedback-msg');

  // Užblokuojame atsakymų mygtukus, kad nebūtų galima spaudinėti kelis kartus
  document.querySelectorAll('#math-choices-grid .math-choice-btn').forEach((btn) => {
    btn.disabled = true;
  });

  if (!isCorrect) {
    audio.wrong();
    if (dot) {
      dot.className = 'pit-dot done-fail';
      dot.textContent = '✗';
    }

    const failedMode = mathChallenge.mode;
    const formulaEl = document.getElementById('math-q-formula');
    const hintEl = document.getElementById('math-q-hint');

    if (failedMode === 'boss_track') {
      const burnedCoins = mathChallenge.discountCost || 0;
      const penaltyMsg = `Bosas tave nugalėjo! Bilietas panaudotas (${burnedCoins} 🪙 sudegė), trasa lieka užrakinta. Bandyk taupyti iš naujo!`;
      feedbackEl.style.color = '#f87171';
      feedbackEl.textContent = `❌ ${penaltyMsg}`;

      if (formulaEl) formulaEl.textContent = '❌ BOSAS TAVE NUGALĖJO!';
      if (hintEl) hintEl.textContent = penaltyMsg;

      // Iššūkis nutraukiamas iš karto – nebeiname prie kitų klausimų
      mathChallenge = null;

      setTimeout(() => {
        if (!mathChallenge) {
          closePitStopModal();
          updateGarageUI();
        }
      }, 2800);
      return;
    }

    const profile = garage.getActiveProfile();
    const playerMoney = profile.coins;
    const penalty = Math.floor(playerMoney * 0.03);
    profile.coins = Math.max(0, profile.coins - penalty);
    garage.saveDriver();
    updateGarageUI();

    const penaltyMsg =
      failedMode === 'upgrade_part'
        ? `Klaida! Tobulinimas atšauktas (lygis nepakilo). Bauda: praradai ${penalty} monetų!`
        : `Klaida! Remontas nepavyko. Bauda: praradai ${penalty} monetų!`;
    feedbackEl.style.color = '#f87171';
    feedbackEl.textContent = `❌ ${penaltyMsg}`;

    if (formulaEl) formulaEl.textContent = '❌ IŠŠŪKIS NUTRAUKTAS!';
    if (hintEl) hintEl.textContent = penaltyMsg;

    // Iššūkis nutraukiamas iš karto – nebeiname prie kitų klausimų
    mathChallenge = null;

    setTimeout(() => {
      if (!mathChallenge) {
        closePitStopModal();
        updateGarageUI();
      }
    }, 2400);
    return;
  }

  audio.correct();
  if (dot) {
    dot.className = 'pit-dot done-ok';
    dot.textContent = '✓';
  }
  feedbackEl.style.color = '#4ade80';
  feedbackEl.textContent = mathChallenge.mode === 'boss_track'
    ? '✅ Puikiai! Boso jėgos senka, kovok toliau!'
    : '✅ Puiku! Tikslus mechaniko skaičiavimas!';

  mathChallenge.step++;
  const totalSteps = mathChallenge.totalSteps || 3;

  if (mathChallenge.step < totalSteps) {
    const nextDot = document.getElementById(`pit-dot-${mathChallenge.step}`);
    if (nextDot) nextDot.classList.add('active');
    setTimeout(() => {
      if (mathChallenge) {
        feedbackEl.textContent = '';
        loadNextPitStopQuestion();
      }
    }, 650);
  } else {
    setTimeout(() => finishPitStopMathChallenge(), 750);
  }
}

function finishPitStopMathChallenge() {
  if (!mathChallenge) return;
  const profile = garage.getActiveProfile();
  const stats = garage.getComputedCarStats(profile);
  const { mode, targetItem, discountCost } = mathChallenge;

  if (mode === 'boss_track' && targetItem) {
    if (!profile.unlockedTracks.includes(targetItem.id)) {
      profile.unlockedTracks.push(targetItem.id);
    }
    profile.selectedTrackId = targetItem.id;
    garage.saveDriver();
    audio.fanfare();
    closePitStopModal();
    updateGarageUI();
    showEvolutionToast(
      '🎉 PERGALĖ! MATEMATIKOS BOSAS NUGALĖTAS!',
      `Trasa „${targetItem.name}“ atrakinta visam laikui!`,
      '#22c55e'
    );
    return;
  }

  if (mode === 'repair') {
    profile.currentHp = stats.maxHp;
    profile.needsRepair = false;
    garage.saveDriver();
    audio.fanfare();
    closePitStopModal();
    updateGarageUI();
    return;
  }

  if (mode === 'upgrade_part' && targetItem) {
    upgradePartLevelDirect(targetItem, discountCost);
    audio.fanfare();
    closePitStopModal();
    return;
  }

  if (mode === 'buy_micro' && targetItem) {
    buyMicroUpgradeDirect(targetItem, discountCost);
    audio.fanfare();
    closePitStopModal();
    return;
  }

  if (mode === 'buy_part' && targetItem) {
    buyPartDirect(targetItem, discountCost);
    audio.fanfare();
    closePitStopModal();
  }
}

function closePitStopModal() {
  if (mathTimerInterval) clearInterval(mathTimerInterval);
  mathChallenge = null;
  document.getElementById('modal-pitstop-math').classList.add('hidden');
}

// ==================== 2D TOP-DOWN LENKTYNIŲ, DANGŲ FIZIKOS IR 7 GINKLŲ VARIKLIS ====================
const raceCanvas = document.getElementById('race-canvas');
const raceCtx = raceCanvas.getContext('2d');

// ==================== 1. LANKSČIOS TRASŲ FORMOS (WAYPOINTS & SPLINES) ====================
// Trasos kelio pusės plotis: 400px (visas plotis 800px – itin erdvus manevrams ir taranavimui)
const TRACK_HALF_WIDTH = 400;
const TRACK_WALL_MARGIN = 110;
const TRACK_CENTER_RX = 2200;
const TRACK_CENTER_RY = 1400;

const TRACK = {
  worldWidth: 6600,
  worldHeight: 4600,
  cx: 3300,
  cy: 2300,
  centerRx: TRACK_CENTER_RX,
  centerRy: TRACK_CENTER_RY,
  totalLaps: 3,
  raceDurationSec: 260
};

// Vidutinis trasos spindulys – progreso konvertavimui į atstumą (rubberbanding)
const TRACK_AVG_RADIUS = (TRACK_CENTER_RX + TRACK_CENTER_RY) / 2;

// Catmull-Rom glotni kreivė per 4 atraminius taškus su t [0..1]
function getCatmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const x = 0.5 * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );
  const y = 0.5 * (
    (2 * p1.y) +
    (-p0.y + p2.y) * t +
    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
  );
  return { x, y };
}

// Sugeneruoja glotnų uždarą trasos splainą iš Waypoints su normalėmis ir tangentėmis
function generateTrackSpline(waypoints, samplesPerSegment = 30) {
  const n = waypoints.length;
  const samples = [];
  let cumDist = 0;

  for (let i = 0; i < n; i++) {
    const p0 = waypoints[(i - 1 + n) % n];
    const p1 = waypoints[i];
    const p2 = waypoints[(i + 1) % n];
    const p3 = waypoints[(i + 2) % n];

    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const pt = getCatmullRomPoint(p0, p1, p2, p3, t);

      if (samples.length > 0) {
        const prev = samples[samples.length - 1];
        const stepDist = Math.hypot(pt.x - prev.x, pt.y - prev.y);
        cumDist += stepDist;
      }
      samples.push({
        x: pt.x,
        y: pt.y,
        distFromStart: cumDist,
        normalX: 0,
        normalY: 0,
        tangentX: 1,
        tangentY: 0
      });
    }
  }

  const totalCount = samples.length;
  for (let i = 0; i < totalCount; i++) {
    const prev = samples[(i - 1 + totalCount) % totalCount];
    const next = samples[(i + 1) % totalCount];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    samples[i].tangentX = tx;
    samples[i].tangentY = ty;
    // Normalė statmena tangentui (nukreipta į dešinę nuo judėjimo krypties)
    samples[i].normalX = -ty;
    samples[i].normalY = tx;
  }

  return {
    samples,
    totalLength: cumDist
  };
}

// 3 UNIKALIŲ TRASŲ GEOMETRIJŲ DUOMENŲ BAZĖ (WAYPOINTS, TRAMPLINAI, KIRTIMAI):
const TRACK_LAYOUTS = {
  ring: {
    id: 'ring',
    name: 'Miesto Klasikinis Žiedas',
    icon: '🔄',
    waypoints: [
      { x: 3300, y: 3700 }, // Start / finish tiesioji
      { x: 4400, y: 3650 },
      { x: 5150, y: 3150 }, // Posūkis 1
      { x: 5450, y: 2300 },
      { x: 5150, y: 1450 }, // Posūkis 2
      { x: 4300, y: 950 },
      { x: 3550, y: 1150 }, // S-Chicane įduba
      { x: 3050, y: 850 },  // S-Chicane viršūnė
      { x: 2300, y: 950 },
      { x: 1450, y: 1450 }, // Posūkis 3
      { x: 1150, y: 2300 },
      { x: 1450, y: 3150 }, // Posūkis 4
      { x: 2200, y: 3650 }
    ],
    ramps: [
      { x: 2100, y: 3660, angle: 0, width: 170, length: 80 },
      { x: 5350, y: 2100, angle: Math.PI * 0.5, width: 170, length: 80 },
      { x: 4200, y: 950, angle: Math.PI, width: 170, length: 80 }
    ],
    shortcutZones: []
  },
  figure8: {
    id: 'figure8',
    name: 'Bulių Kautynių Aštuoniukė',
    icon: '♾️',
    waypoints: [
      { x: 2300, y: 3450 }, // Start / finish
      { x: 2800, y: 2850 },
      { x: 3300, y: 2300 }, // CENTRO SUSIKIRTIMAS (kelias kyla į viršų dešinėn)
      { x: 3800, y: 1750 },
      { x: 4450, y: 1250 },
      { x: 5100, y: 1600 },
      { x: 5350, y: 2300 }, // Dešiniojo žiedo apsisukimas
      { x: 5100, y: 3000 },
      { x: 4450, y: 3350 },
      { x: 3800, y: 2850 },
      { x: 3300, y: 2300 }, // CENTRO SUSIKIRTIMAS (kelias kyla į viršų kairėn)
      { x: 2800, y: 1750 },
      { x: 2150, y: 1250 },
      { x: 1500, y: 1600 },
      { x: 1250, y: 2300 }, // Kairiojo žiedo apsisukimas
      { x: 1500, y: 3000 },
      { x: 1900, y: 3350 }
    ],
    ramps: [
      // Tramplinas tiesiai prieš susikirtimą – šuolis virš susikirtimo zonos!
      { x: 2950, y: 2680, angle: -Math.PI * 0.25, width: 180, length: 85 },
      // Tramplinas dešiniajame žiede:
      { x: 4750, y: 1350, angle: Math.PI * 0.2, width: 170, length: 80 },
      // Tramplinas kairiajame žiede:
      { x: 1750, y: 1350, angle: Math.PI * 0.8, width: 170, length: 80 }
    ],
    shortcutZones: []
  },
  zigzag: {
    id: 'zigzag',
    name: 'Ledo Zigzagas',
    icon: '⚡',
    waypoints: [
      { x: 2200, y: 3550 }, // Start / finish apatinėje tiesiojoje
      { x: 3600, y: 3550 },
      { x: 4900, y: 3550 }, // Ilga greičio tiesioji
      { x: 5450, y: 3200 }, // Aštrus 90° posūkis aukštyn
      { x: 5450, y: 2450 },
      { x: 5100, y: 2050 }, // Aštrus 90° posūkis kairėn
      { x: 3800, y: 2050 }, // Vidurinė priešpriešinė tiesioji
      { x: 2600, y: 2050 },
      { x: 1750, y: 1850 }, // 180° Hairpin posūkis
      { x: 1750, y: 1300 },
      { x: 2300, y: 1050 },
      { x: 3600, y: 1050 }, // Viršutinė tiesioji
      { x: 4900, y: 1050 },
      { x: 5450, y: 1300 }, // 180° Hairpin posūkis 2
      { x: 5200, y: 1600 },
      { x: 4300, y: 1600 },
      { x: 3200, y: 1600 },
      { x: 2000, y: 2050 }, // S-Chicane nusileidimas žemyn
      { x: 1400, y: 2550 },
      { x: 1400, y: 3250 },
      { x: 1750, y: 3550 }
    ],
    ramps: [
      // Tramplinas didžiojoje apatinėje tiesiojoje:
      { x: 3400, y: 3550, angle: 0, width: 180, length: 85 },
      // Tramplinas viršutinėje tiesiojoje:
      { x: 3800, y: 1050, angle: 0, width: 180, length: 85 },
      // Tramplinas leidžiantis žemyn prieš finišą:
      { x: 1400, y: 2850, angle: Math.PI * 0.5, width: 170, length: 80 }
    ],
    shortcutZones: []
  }
};

const SPLINE_CACHE = {};
function getOrCreateSpline(layoutId) {
  if (SPLINE_CACHE[layoutId]) return SPLINE_CACHE[layoutId];
  const def = TRACK_LAYOUTS[layoutId] || TRACK_LAYOUTS.ring;
  const sp = generateTrackSpline(def.waypoints, 30);
  SPLINE_CACHE[layoutId] = sp;
  return sp;
}

// Randa artimiausią splaino tašką mašinos pozicijai (O(1) lokalus langas arba globali paieška)
function findClosestSample(samples, x, y, hintIndex = -1) {
  const count = samples.length;
  let bestIdx = 0;
  let bestDistSq = Infinity;

  if (hintIndex >= 0 && hintIndex < count) {
    const windowSize = 50;
    for (let offset = -windowSize; offset <= windowSize; offset++) {
      const idx = (hintIndex + offset + count) % count;
      const s = samples[idx];
      const dx = x - s.x;
      const dy = y - s.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDistSq) {
        bestDistSq = d2;
        bestIdx = idx;
      }
    }
  } else {
    for (let i = 0; i < count; i++) {
      const s = samples[i];
      const dx = x - s.x;
      const dy = y - s.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDistSq) {
        bestDistSq = d2;
        bestIdx = i;
      }
    }
  }

  const s = samples[bestIdx];
  const dx = x - s.x;
  const dy = y - s.y;
  const latDist = dx * s.normalX + dy * s.normalY;
  const longProj = dx * s.tangentX + dy * s.tangentY;

  return {
    index: bestIdx,
    sample: s,
    distSq: bestDistSq,
    latDist,
    longProj
  };
}

// Taškas trasoje pagal santykinį progresą (0..1) ir šoninį poslinkį offsetRatio (-1..+1)
function getSplinePointAtProgress(spline, progressRatio, offsetRatio = 0) {
  const samples = spline.samples;
  const targetDist = ((progressRatio % 1) + 1) % 1 * spline.totalLength;
  let closest = samples[0];
  let minDiff = Infinity;
  for (let i = 0; i < samples.length; i++) {
    const diff = Math.abs(samples[i].distFromStart - targetDist);
    if (diff < minDiff) {
      minDiff = diff;
      closest = samples[i];
    }
  }
  return {
    x: closest.x + closest.normalX * (TRACK_HALF_WIDTH * offsetRatio),
    y: closest.y + closest.normalY * (TRACK_HALF_WIDTH * offsetRatio)
  };
}

// Patikrina, ar koordinates (x, y) patenka i bent viena taktinio kirtimo (Shortcut) kapsule
function isPointInShortcutZone(x, y, zones) {
  if (!zones || zones.length === 0) return null;
  for (const sc of zones) {
    const dx = sc.x2 - sc.x1;
    const dy = sc.y2 - sc.y1;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) {
      t = Math.max(0, Math.min(1, ((x - sc.x1) * dx + (y - sc.y1) * dy) / lenSq));
    }
    const projX = sc.x1 + t * dx;
    const projY = sc.y1 + t * dy;
    const d = Math.hypot(x - projX, y - projY);
    if (d < sc.r) {
      return sc;
    }
  }
  return null;
}

// Patikrina, ar masina uzvaziavo ant tramplino staciakampio
function checkRampCollision(car, ramp) {
  const dx = car.x - ramp.x;
  const dy = car.y - ramp.y;
  const cosA = Math.cos(-ramp.angle);
  const sinA = Math.sin(-ramp.angle);
  const lx = dx * cosA - dy * sinA;
  const ly = dx * sinA + dy * cosA;
  return Math.abs(lx) <= ramp.length * 0.65 && Math.abs(ly) <= ramp.width * 0.55;
}

// Tiltelio funkcijos atgaliniam suderinamumui
function getTrackCenterPoint(a, offsetRatio = 0) {
  if (raceState && raceState.spline) {
    const prog = (a / (Math.PI * 2) % 1 + 1) % 1;
    return getSplinePointAtProgress(raceState.spline, prog, offsetRatio);
  }
  const rx = TRACK_CENTER_RX + TRACK_HALF_WIDTH * offsetRatio;
  const ry = TRACK_CENTER_RY + TRACK_HALF_WIDTH * offsetRatio;
  return {
    x: TRACK.cx + Math.sin(a) * rx,
    y: TRACK.cy + Math.cos(a) * ry
  };
}

function getTrackTangentAngle(a, offsetRatio = 0) {
  const p1 = getTrackCenterPoint(a - 0.01, offsetRatio);
  const p2 = getTrackCenterPoint(a + 0.01, offsetRatio);
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getTrackBoundsAtAngle(a) {
  return {
    centerRx: TRACK_CENTER_RX,
    centerRy: TRACK_CENTER_RY,
    asphaltOuterRx: TRACK_CENTER_RX + TRACK_HALF_WIDTH,
    asphaltOuterRy: TRACK_CENTER_RY + TRACK_HALF_WIDTH,
    asphaltInnerRx: TRACK_CENTER_RX - TRACK_HALF_WIDTH,
    asphaltInnerRy: TRACK_CENTER_RY - TRACK_HALF_WIDTH,
    outerWallRx: TRACK_CENTER_RX + TRACK_HALF_WIDTH + TRACK_WALL_MARGIN,
    outerWallRy: TRACK_CENTER_RY + TRACK_HALF_WIDTH + TRACK_WALL_MARGIN,
    innerWallRx: TRACK_CENTER_RX - TRACK_HALF_WIDTH - TRACK_WALL_MARGIN,
    innerWallRy: TRACK_CENTER_RY - TRACK_HALF_WIDTH - TRACK_WALL_MARGIN
  };
}

function getTrackProgressAngle(x, y) {
  if (raceState && raceState.spline) {
    const cl = findClosestSample(raceState.spline.samples, x, y);
    return (cl.sample.distFromStart / raceState.spline.totalLength) * Math.PI * 2;
  }
  const dx = (x - TRACK.cx) / TRACK.centerRx;
  const dy = (y - TRACK.cy) / TRACK.centerRy;
  let a = Math.atan2(dx, dy);
  if (a < 0) a += Math.PI * 2;
  return a;
}

let raceState = null;

function createRaceCar({ id, name, isPlayer, x, y, angle, chassisId, bumperId, roofId, wheelsId, paintId, maxHp, currentHp, stats }) {
  return {
    id,
    name,
    isPlayer,
    x,
    y,
    vx: 0,
    vy: 0,
    angle,
    steerInput: 0,
    radius: stats?.collisionRadius || 26,
    chassisId: chassisId || 'chassis_buggy',
    bumperId,
    roofId,
    wheelsId,
    paintId,
    maxHp,
    hp: currentHp,
    stats,
    lap: 1,
    sector: 0,
    totalProgress: 0,
    finished: false,
    wreckedTimer: 0,
    secondaryWeapon: null, // 'oil' | 'mine' | 'homing' | 'tank' – vienkartinis daiktas iš dėžės
    itemUseDelay: 0,
    tankTimer: 0, // Tanko/Buldozerio režimo likę kadrai (300 = 5 s)
    invincibleTimer: 0,
    position: 0, // Dabartinė vieta lenktynėse (calculatePositions)
    isDead: false, // Miręs botas (HP <= 0): sustoja ir lieka stovėti kaip statinė kliūtis!
    isFlying: false, // Šuolio būsena (Tramplinas): 1.5 s ignoruoja antžemines kliūtis ir ginklus!
    flyTimer: 0,
    flyMaxDuration: 90,
    flyHeight: 0,
    trickActive: false, // Ar pradėtas 360° triukas ore
    trickSpinAngle: 0, // Kiek rad apsisukta ore šio šuolio metu
    trickCompleted: false, // Ar atliktas pilnas 360° (2*PI) apsisukimas ore
    trickDirection: 0, // -1 kairėn, +1 dešinėn
    turboBoostTimer: 0, // Mini-Turbo greičio bonusas po sėkmingo 360 nusileidimo (+30% greitis)
    superStartActive: false, // Ar aktyvus Super Starto 1.5x greičio ir pagreičio bonusas
    engineStallTimer: 0, // Perkaitusio variklio laikmatis (1.5 s = 90 kadrų negali pajudėti)
    trackSampleIndex: 0,
    lastDistFromStart: 0,
    spinOutTimer: 0, // Kai užvažiuoja ant Tepalo balos arba patiria avariją!
    shootCooldown: 0,
    muzzleFlash: 0,
    collisionCooldown: 0,
    aiTargetOffset: (Math.random() - 0.5) * 0.9, // kiekvienas botas renkasi savo juostą (−0.45..+0.45 trasos pusės pločio)
    aiSpeedFactor: 0.82 + Math.random() * 0.07, // šiek tiek lėtesnis bazinis botų greitis
    aiWobblePhase: Math.random() * Math.PI * 2, // natūralus „žmogiškas“ vairo svyravimas
    aiCornerOvershoot: (Math.random() < 0.5 ? 1 : -1) * (0.32 + Math.random() * 0.28), // posūkiuose linkęs paimti per platų kampą
    aiClumsyBias: 0.35 + Math.random() * 0.35, // tikimybė nepastebėti tepalo balos ar kliūties
    aiMistakeTimer: 0, // retkarčiais botas suklysta, išslysta iš trajektorijos ir atleidžia gazą
    aiMistakeSteerBias: 0,
    rubberBandMult: 1.0
  };
}

// ==================== 2. DINAMINIS PRIEŠININKŲ TOBULĖJIMAS (DYNAMIC AI SCALING) ====================
function rollBotMicroLevel(playerLevel) {
  const delta = Math.floor(Math.random() * 5) - 2; // [-2, -1, 0, +1, +2]
  return Math.max(0, Math.min(MAX_MICRO_UPGRADE_LEVEL, (playerLevel || 0) + delta));
}

function spawnEnemies(profile, trackType, s0OrStartX, startAngleOrBaseY) {
  let s0 = null;
  let startAngle = 0;
  if (typeof s0OrStartX === 'object' && s0OrStartX !== null) {
    s0 = s0OrStartX;
    startAngle = startAngleOrBaseY !== undefined ? startAngleOrBaseY : Math.atan2(s0.tangentY, s0.tangentX);
  } else {
    s0 = {
      x: s0OrStartX || (TRACK.cx - 60),
      y: startAngleOrBaseY || (TRACK.cy + TRACK.centerRy),
      tangentX: 1,
      tangentY: 0,
      normalX: 0,
      normalY: 1
    };
    startAngle = 0;
  }

  const playerPower = calculatePlayerPowerLevel(profile);
  const pMicro = profile.microUpgrades || { engine: 0, armor: 0, ram: 0, weapons: 0 };
  const avgPlayerLvl = playerPower / 4; // 0..50

  // 4 AI varžovų baziniai šablonai
  const botArchetypes = [
    {
      baseName: 'Bulius Rex',
      paint: 'paint_orange',
      role: 'heavy_rammer'
    },
    {
      baseName: 'Plieno Pjūklas',
      paint: 'paint_dark',
      role: 'brawler'
    },
    {
      baseName: 'Kibernetinis Žaibas',
      paint: 'paint_blue',
      role: 'speedster'
    },
    {
      baseName: 'Minų Meistras',
      paint: 'paint_green',
      role: 'trapper'
    }
  ];

  return botArchetypes.map((arch, idx) => {
    // Kiekvieno AI boto mikro-lygiai generuojami arti žaidėjo lygių (pvz. žaidėjo Šarvai 15 -> boto 13..17)
    const botMicro = {
      engine: rollBotMicroLevel(pMicro.engine),
      armor: rollBotMicroLevel(pMicro.armor),
      ram: rollBotMicroLevel(pMicro.ram),
      weapons: rollBotMicroLevel(pMicro.weapons)
    };
    const botPower = botMicro.engine + botMicro.armor + botMicro.ram + botMicro.weapons;
    const botAvgLvl = botPower / 4;

    // VIZUALINIS PROGRESAS PAGAL BOTO BEI ŽAIDĖJO GALIOS LYGĮ:
    const isOffroadTrack = trackType === 'desert_sand' || trackType === 'winter_snow' || trackType === 'mud_arena';
    let chassis = 'chassis_buggy';
    let bumper = 'bumper_stock';
    let roof = 'weapon_minigun';
    let wheels = isOffroadTrack ? 'wheels_offroad' : 'wheels_stock';

    if (botAvgLvl >= 10 || playerPower >= 40) {
      // Aukšto lygio grėsmingi priešininkai: dažniau vairuoja Sunkvežimius, turi Spyglius/Traukinio taranus ir galingus ginklus!
      if (arch.role === 'heavy_rammer' || arch.role === 'brawler' || arch.role === 'trapper') {
        chassis = 'chassis_truck';
      } else {
        chassis = trackType === 'desert_sand' ? 'chassis_buggy' : trackType === 'winter_snow' ? 'chassis_truck' : 'chassis_sports';
      }

      bumper = arch.role === 'heavy_rammer' || idx % 2 === 0 ? 'bumper_train' : 'bumper_spikes';

      const highTierWeapons = ['weapon_rocket', 'weapon_laser', 'weapon_flamethrower', 'weapon_mines'];
      roof = highTierWeapons[idx % highTierWeapons.length];

      if (arch.role === 'brawler') {
        wheels = 'wheels_blades';
      } else {
        wheels = isOffroadTrack ? 'wheels_offroad' : 'wheels_slick';
      }
    } else if (botAvgLvl >= 4 || playerPower >= 14) {
      // Vidutinio lygio priešininkai: atsiranda pirmas Sunkvežimis, Sportinė mašina, Sniego peiliai/Spygliai ir vidutiniai ginklai
      if (arch.role === 'heavy_rammer') {
        chassis = 'chassis_truck';
        bumper = 'bumper_spikes';
        roof = 'weapon_shotgun';
      } else if (arch.role === 'speedster') {
        chassis = trackType === 'desert_sand' ? 'chassis_buggy' : trackType === 'winter_snow' ? 'chassis_truck' : 'chassis_sports';
        bumper = 'bumper_plow';
        roof = 'weapon_flamethrower';
      } else if (arch.role === 'brawler') {
        chassis = 'chassis_buggy';
        bumper = 'bumper_spikes';
        roof = 'weapon_shotgun';
        wheels = 'wheels_blades';
      } else {
        chassis = 'chassis_buggy';
        bumper = 'bumper_plow';
        roof = 'weapon_mines';
      }

      if (wheels === 'wheels_stock') {
        wheels = isOffroadTrack ? 'wheels_offroad' : 'wheels_slick';
      }
    } else {
      // Pradinio lygio priešininkai (kai žaidėjas dar tik pradeda)
      if (arch.role === 'speedster' && !isOffroadTrack) {
        chassis = 'chassis_sports';
      } else if (arch.role === 'heavy_rammer' && trackType === 'winter_snow') {
        chassis = 'chassis_truck';
      } else {
        chassis = 'chassis_buggy';
      }
      bumper = idx === 0 ? 'bumper_plow' : 'bumper_stock';
      const starterWeapons = ['weapon_minigun', 'weapon_oil', 'weapon_shotgun', 'weapon_mines'];
      roof = starterWeapons[idx % starterWeapons.length];
      wheels = isOffroadTrack ? 'wheels_offroad' : 'wheels_stock';
    }

    const pBumperLvl = getProfilePartState(profile, profile.equipped?.bumper).level || 1;
    const pRoofLvl = getProfilePartState(profile, profile.equipped?.roof).level || 1;
    const pWheelsLvl = getProfilePartState(profile, profile.equipped?.wheels).level || 1;

    const botBumperLvl = Math.max(1, rollBotMicroLevel(pBumperLvl));
    const botRoofLvl = Math.max(1, rollBotMicroLevel(pRoofLvl));
    const botWheelsLvl = Math.max(1, rollBotMicroLevel(pWheelsLvl));

    const fakeProfile = {
      equipped: {
        chassis,
        bumper,
        roof,
        wheels,
        paint: arch.paint
      },
      parts: {
        [bumper]: { owned: true, level: botBumperLvl },
        [roof]: { owned: true, level: botRoofLvl },
        [wheels]: { owned: true, level: botWheelsLvl }
      },
      microUpgrades: botMicro
    };

    const totalBotPower = calculatePlayerPowerLevel(fakeProfile);
    const bStats = garage.getComputedCarStats(fakeProfile);

    // Staggered rikiuotė už starto linijos pagal trasos tangentę ir normalę:
    const gridRows = [
      { longOffset: -130, latOffset: -70 },
      { longOffset: -210, latOffset: 70 },
      { longOffset: -290, latOffset: -70 },
      { longOffset: -370, latOffset: 70 }
    ];
    const row = gridRows[idx] || { longOffset: -120 * (idx + 1), latOffset: (idx % 2 === 0 ? -70 : 70) };
    const botX = s0.x + s0.tangentX * row.longOffset + s0.normalX * row.latOffset;
    const botY = s0.y + s0.tangentY * row.longOffset + s0.normalY * row.latOffset;

    return createRaceCar({
      id: `bot_${idx}`,
      name: `${arch.baseName} [⚡${totalBotPower}]`,
      isPlayer: false,
      x: botX,
      y: botY,
      angle: startAngle,
      chassisId: chassis,
      bumperId: bumper,
      roofId: roof,
      wheelsId: wheels,
      paintId: arch.paint,
      maxHp: bStats.maxHp,
      currentHp: bStats.maxHp,
      stats: bStats
    });
  });
}

function startNewRace() {
  const profile = garage.getActiveProfile();
  if (getRemainingPlaytimeSeconds(profile.driverKey) <= 0) {
    openTimeLimitModal(true);
    return;
  }

  const pStats = garage.getComputedCarStats(profile);
  if (profile.needsRepair || profile.currentHp <= 0 || profile.currentHp < pStats.maxHp) {
    profile.needsRepair = true;
    garage.saveDriver();
    updateGarageUI();
    alert('Mašina sudaužyta! Prieš lenktynes būtina ją suremontuoti garaže.');
    return;
  }

  // 1 PUNKTAS: TRASŲ TEMŲ (BIOMES) PARINKIMAS (Atsitiktinis arba pasirinktas)
  const rawTrack = normalizeTrackId(profile.selectedTrackId);
  let resolvedBiome = rawTrack;
  if (rawTrack === 'random_biome') {
    const unlockedPool = (profile.unlockedTracks && profile.unlockedTracks.length > 0)
      ? profile.unlockedTracks.filter((t) => t !== 'random_biome')
      : ['city_asphalt'];
    resolvedBiome = unlockedPool[Math.floor(Math.random() * unlockedPool.length)] || 'city_asphalt';
  }
  const trackType = resolvedBiome;
  const biome = resolvedBiome;

  // Parinkti trasos geometriją pagal naudotojo pasirinkimą arba automatiškai pagal biomą:
  let layoutId = profile.selectedLayoutId || 'auto';
  if (layoutId === 'auto') {
    if (biome === 'winter_snow') layoutId = 'zigzag';
    else if (biome === 'desert_sand') layoutId = 'figure8';
    else layoutId = 'ring';
  }
  const layoutDef = TRACK_LAYOUTS[layoutId] || TRACK_LAYOUTS.ring;
  const trackSpline = getOrCreateSpline(layoutId);
  const s0 = trackSpline.samples[0];
  const startAngle = Math.atan2(s0.tangentY, s0.tangentX);

  // Žaidėjo startinė pozicija ties starto linija
  const playerStartX = s0.x - s0.tangentX * 55 + s0.normalX * 70;
  const playerStartY = s0.y - s0.tangentY * 55 + s0.normalY * 70;
  const playerPower = calculatePlayerPowerLevel(profile);

  const playerCar = createRaceCar({
    id: 'player',
    name: `${profile.driverKey === 'linas' ? 'Linas' : 'Lukas'} [⚡${playerPower}]`,
    isPlayer: true,
    x: playerStartX,
    y: playerStartY,
    angle: startAngle,
    chassisId: profile.equipped.chassis,
    bumperId: profile.equipped.bumper,
    roofId: profile.equipped.roof,
    wheelsId: profile.equipped.wheels,
    paintId: profile.equipped.paint,
    maxHp: pStats.maxHp,
    currentHp: profile.currentHp,
    stats: pStats
  });

  // Dinamiškai sugeneruojame 4 AI priešininkus pagal žaidėjo Galios Lygį ir Biomo sąlygas!
  const bots = spawnEnemies(profile, trackType, s0, startAngle);

  // Lėtinančios purvo/bekelės zonos visiškai pašalintos – visas kelias vienodai greitas!
  const mudPuddles = [];

  // STATINĖS KLIŪTYS TRASOJE: sumažinta ~75–80% (tik 3 tepalo balos ir 3 akmenys/padangų krūvos per visą trasą!).
  // Išdėstomos retai ir vienoje kelio pusėje, kad visada liktų platus pravažiavimas (> 550px laisvo kelio).
  const staticOilSpills = [];
  const oilCount = 3;
  for (let i = 0; i < oilCount; i++) {
    const prog = 0.16 + (i / oilCount) * 0.75 + (Math.random() - 0.5) * 0.04;
    const offsetRatio = (i % 2 === 0 ? -1 : 1) * (0.35 + Math.random() * 0.15);
    const pt = getSplinePointAtProgress(trackSpline, prog, offsetRatio);
    staticOilSpills.push({
      owner: null,
      isStaticHazard: true,
      x: pt.x,
      y: pt.y,
      r: 32,
      dmg: 0, // Statinė tepalo bala HP neatima – tik trumpam susukioja ir sulėtina mašiną!
      life: 999999,
      cooldownByCar: {}
    });
  }

  const trackObstacles = [];
  const obstacleCount = 3;
  for (let i = 0; i < obstacleCount; i++) {
    const prog = 0.26 + (i / obstacleCount) * 0.65 + (Math.random() - 0.5) * 0.04;
    const offsetRatio = (i % 2 === 0 ? 1 : -1) * (0.38 + Math.random() * 0.15);
    const pt = getSplinePointAtProgress(trackSpline, prog, offsetRatio);
    const kind = i % 2 === 0 ? 'tires' : 'rock';
    trackObstacles.push({
      id: `obs_${i}`,
      kind,
      x: pt.x,
      y: pt.y,
      r: kind === 'tires' ? 28 : 26,
      hp: 30, // Sunaikinamos kliūtys: turi 30 HP, galima sunaikinti ginklais!
      maxHp: 30,
      dmg: 1, // 85–90% mažesnė žala (tik 1 HP): veikia kaip greičio bauda, o ne mašinos sunaikinimas!
      cooldownByCar: {}
    });
  }

  // ĮDĖJINIŲ „GINKLŲ DĖŽIŲ“ (ITEM BOXES) GENERAVIMAS: toliau nuo kliūčių ir starto
  const itemBoxes = [];
  const itemBoxCount = 8;
  for (let i = 0; i < itemBoxCount; i++) {
    const prog = 0.06 + (i / itemBoxCount) * 0.88;
    const offsetRatio = (Math.random() - 0.5) * 0.8;
    const pt = getSplinePointAtProgress(trackSpline, prog, offsetRatio);
    itemBoxes.push({ x: pt.x, y: pt.y, r: 24, active: true, respawn: 0 });
  }

  // 1 PUNKTAS: Krintančių snaigių dalelės Žiemos trasoje
  const snowflakes = [];
  if (biome === 'winter_snow') {
    for (let i = 0; i < 110; i++) {
      snowflakes.push({
        x: Math.random() * raceCanvas.width,
        y: Math.random() * raceCanvas.height,
        r: 1.2 + Math.random() * 2.5,
        speedY: 0.65 + Math.random() * 1.5,
        speedX: -0.35 + Math.random() * 0.7,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.4 + Math.random() * 0.55
      });
    }
  }

  raceState = {
    trackType,
    biome,
    layoutId,
    layoutDef,
    spline: trackSpline,
    ramps: (layoutDef.ramps || []).map((r) => ({ ...r })),
    shortcutZones: (layoutDef.shortcutZones || []).map((s) => ({ ...s })),
    snowflakes,
    dustParticles: [],
    smokeParticles: [], // Dūmų partikulų masyvas kritinės būklės mašinoms (HP < 30%)
    itemBoxes,
    mudPuddles,
    trackObstacles,
    cars: [playerCar, ...bots],
    player: playerCar,
    timeRemaining: TRACK.raceDurationSec,
    damageDealtByPlayer: 0,
    takedownsByPlayer: 0,
    skidMarks: [],
    sparks: [],
    projectiles: [], // kulkos, šratai, raketos, liepsnos
    laserBeams: [], // momentiniai lazerio spinduliai
    explosions: [], // AoE sprogimų bangos
    oilSpills: staticOilSpills, // statinės + ginklų tepalo balos
    mines: [], // sprogstamosios minos
    floatingTexts: [],
    cameraX: playerCar.x - raceCanvas.width / 2,
    cameraY: playerCar.y - raceCanvas.height / 2,
    isOver: false,
    gameState: 'racing',
    finishers: [], // Sąrašas mašinų, kirtusių finišo liniją nustatytu eiliškumu
    podiumCars: null, // Galutinė mašinų rikiuotė podiumui
    placeReward: 0,
    damageReward: 0,
    takedownReward: 0,
    coinsEarned: 0,
    coinsSaved: false,
    toastTimer: 0,
    // Startinis šviesoforas: kol countdownActive === true, visos mašinos stovi, laikas neskaičiuojamas
    countdownActive: true,
    countdownElapsed: 0,
    countdownStep: -1,
    goBannerTimer: 0,
    playerThrottleHeldSince: -1,
    superStartProcessed: false,
    superStartGraceTimer: 0
  };

  const goOverlay = document.getElementById('overlay-game-over');
  if (goOverlay) goOverlay.classList.add('hidden');
  document.getElementById('race-banner-toast').classList.add('hidden');
  keys.up = false;
  keys.down = false;
  keys.left = false;
  keys.right = false;
  keys.fire = false;

  currentScreen = 'RACE';
  document.getElementById('screen-garage').classList.add('hidden');
  document.getElementById('screen-race').classList.remove('hidden');
  document.getElementById('modal-race-results').classList.add('hidden');
  const startBtn = document.getElementById('btn-start-race');
  if (startBtn) startBtn.blur(); // kad Tarpas nebespaustų paslėpto mygtuko
  updateGlobalTimerBadges();
  snapRaceCamera();
  calculatePositions();
  setCountdownStep(0);
}

// ==================== STARTINIS ŠVIESOFORAS (3, 2, 1, STARTAS!) ====================
const COUNTDOWN_LABELS = ['3', '2', '1', 'STARTAS!'];

function setCountdownStep(step) {
  if (!raceState || raceState.countdownStep === step) return;
  raceState.countdownStep = step;

  const overlay = document.getElementById('race-countdown');
  const textEl = document.getElementById('race-countdown-text');
  if (!overlay || !textEl) return;

  overlay.classList.remove('hidden');
  textEl.textContent = COUNTDOWN_LABELS[step];
  textEl.classList.toggle('go', step === 3);
  // Perkrauname animaciją kiekvienam skaičiui
  textEl.style.animation = 'none';
  void textEl.offsetWidth;
  textEl.style.animation = '';

  for (let i = 0; i < 3; i++) {
    const light = document.getElementById(`cd-light-${i}`);
    if (!light) continue;
    light.className = 'cd-light';
    if (step === 3) {
      light.classList.add('on-green');
    } else if (i <= step) {
      light.classList.add(step === 2 ? 'on-yellow' : 'on-red');
    }
  }

  if (step === 3) {
    audio.tone(880, 0.35, 'square', 0.18);
  } else {
    audio.tone(440, 0.18, 'square', 0.14);
  }
}

function hideCountdownOverlay() {
  const overlay = document.getElementById('race-countdown');
  if (overlay) overlay.classList.add('hidden');
}

function updateCountdown(dt) {
  raceState.countdownElapsed += dt;

  // Sekame žaidėjo akceleratoriaus (W / ArrowUp) būseną
  if (keys.up) {
    if (raceState.playerThrottleHeldSince < 0) {
      raceState.playerThrottleHeldSince = raceState.countdownElapsed;
    }
  } else {
    raceState.playerThrottleHeldSince = -1;
  }

  const step = Math.min(3, Math.floor(raceState.countdownElapsed));
  setCountdownStep(step);

  if (step === 3 && raceState.countdownActive) {
    // „STARTAS!“ – atskaita baigiasi, mašinos startuoja
    raceState.countdownActive = false;
    raceState.goBannerTimer = 0.9;

    const p = raceState.player;
    // 3. SLAPTAS „SUPER STARTAS“ (RISK VS. REWARD):
    // Tikriname starto akimirką (t = 3.0 s)
    if (keys.up) {
      if (raceState.playerThrottleHeldSince >= 0 && raceState.playerThrottleHeldSince < 2.82) {
        // PERKAITIMAS (BAUSMĖ): žaidėjas laikė gazą per anksti (degant „2“ ar „1“) ir neatleido!
        p.engineStallTimer = 90; // 1.5 sek. negali pajudėti iš vietos (90 kadrų prie 60fps)
        p.vx = 0;
        p.vy = 0;
        audio.crash(false);
        audio.wrong();
        raceState.floatingTexts.push({
          x: p.x,
          y: p.y - 36,
          text: '💥 VARIKLIS UŽGESO! (PERKAITIMAS)',
          color: '#ef4444',
          life: 80
        });
        showRaceToast('💥 VARIKLIS UŽGESO! (PERKAITIMAS)', 90);
        raceState.superStartProcessed = true;
      } else {
        // SUPER STARTAS (APDOVANOJIMAS): pataikyta tiksliai prieš pat arba per 1 -> STARTAS! virsmą
        p.turboBoostTimer = 120; // 2.0 s (120 kadrų)
        p.superStartActive = true;
        playBoostSound(true);
        spawnSparks(p.x, p.y, 32);
        raceState.floatingTexts.push({
          x: p.x,
          y: p.y - 36,
          text: '🚀 SUPER STARTAS! 1.5× GREITIS! ⚡',
          color: '#38bdf8',
          life: 80
        });
        showRaceToast('🚀 SUPER STARTAS! 1.5× GREITIS! ⚡', 90);
        raceState.superStartProcessed = true;
      }
    } else {
      // Jei „STARTAS!“ akimirką mygtukas dar nebuvo nuspaustas, suteikiamas trumpas langas (~0.28 s) paspausti
      raceState.superStartGraceTimer = 0.28;
    }

    if (!raceState.superStartProcessed && p.engineStallTimer <= 0) {
      const trackTitle =
        raceState.biome === 'winter_snow'
          ? '❄️ LEDO IR SNIEGO ARENA (Grip: 0.4)!'
          : raceState.biome === 'desert_sand'
          ? '🏜️ DYKUMOS SMĖLIO ARENA (Greitis: 0.7)!'
          : '🏙️ MIESTO ASFALTO ARENA!';
      showRaceToast(`${trackTitle} STARTAS! TARANUOK IR ŠAUDYK (SPACE)!`, 150);
    }
  }
}

function showRaceToast(msg, frames = 95) {
  if (!raceState) return;
  const el = document.getElementById('race-banner-toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  raceState.toastTimer = frames;
}

// ==================== SEKANTI KAMERA (CAMERA) ====================
// Canvas veikia kaip „langas“ į didelį pasaulį: kamera visada centruoja žaidėjo mašiną.
// Visi pasaulio objektai piešiami su ctx.translate(-cameraX, -cameraY), t.y. ekrano koordinatė = pasaulio − kamera.
function getCameraTarget() {
  const p = raceState.player;
  // Nedidelis žvilgsnis į priekį pagal greitį, kad matytum, kas laukia už posūkio
  return {
    x: p.x + p.vx * 6 - raceCanvas.width / 2,
    y: p.y + p.vy * 6 - raceCanvas.height / 2
  };
}

function clampCameraToWorld() {
  raceState.cameraX = Math.max(0, Math.min(TRACK.worldWidth - raceCanvas.width, raceState.cameraX));
  raceState.cameraY = Math.max(0, Math.min(TRACK.worldHeight - raceCanvas.height, raceState.cameraY));
}

function updateRaceCamera(smoothing = 0.22) {
  const target = getCameraTarget();
  raceState.cameraX += (target.x - raceState.cameraX) * smoothing;
  raceState.cameraY += (target.y - raceState.cameraY) * smoothing;
  clampCameraToWorld();
}

function snapRaceCamera() {
  const target = getCameraTarget();
  raceState.cameraX = target.x;
  raceState.cameraY = target.y;
  clampCameraToWorld();
}

function updateRace(dt) {
  if (!raceState || raceState.isOver || isTimeLimitPaused) return;

  // Kai būsena yra podium – sustabdome žaidimo veiksmą
  if (raceState.gameState === 'podium') {
    for (const car of raceState.cars) {
      car.vx = 0;
      car.vy = 0;
    }
    return;
  }

  // Kol rodomas šviesoforas – visos mašinos stovi vietoje, laikas neskaičiuojamas
  if (raceState.countdownActive) {
    updateCountdown(dt);
    updateRaceHud(raceState.cars.length);
    return;
  }

  if (raceState.goBannerTimer > 0) {
    raceState.goBannerTimer -= dt;
    if (raceState.goBannerTimer <= 0) hideCountdownOverlay();
  }

  // Super Starto lango tikrinimas iškart po atskaitos pabaigos (jei mygtukas nuspaudžiamas per ~0.28 s po „STARTAS!“)
  if (!raceState.superStartProcessed && raceState.superStartGraceTimer > 0) {
    raceState.superStartGraceTimer -= dt;
    if (keys.up) {
      const p = raceState.player;
      p.turboBoostTimer = 120; // 2.0 s bonusas
      p.superStartActive = true;
      playBoostSound(true);
      spawnSparks(p.x, p.y, 32);
      raceState.floatingTexts.push({
        x: p.x,
        y: p.y - 36,
        text: '🚀 SUPER STARTAS! 1.5× GREITIS! ⚡',
        color: '#38bdf8',
        life: 80
      });
      showRaceToast('🚀 SUPER STARTAS! 1.5× GREITIS! ⚡', 90);
      raceState.superStartProcessed = true;
    } else if (raceState.superStartGraceTimer <= 0) {
      raceState.superStartProcessed = true;
    }
  }

  raceState.timeRemaining = Math.max(0, raceState.timeRemaining - dt);
  if (raceState.toastTimer > 0) {
    raceState.toastTimer--;
    if (raceState.toastTimer === 0) {
      document.getElementById('race-banner-toast').classList.add('hidden');
    }
  }

  for (const car of raceState.cars) {
    if (car.isPlayer && raceState.gameState === 'gameOver') {
      car.vx = 0;
      car.vy = 0;
      continue;
    }
    updateSingleCar(car, dt);
  }

  const cars = raceState.cars;
  for (let i = 0; i < cars.length; i++) {
    for (let j = i + 1; j < cars.length; j++) {
      resolveCarCollision(cars[i], cars[j]);
    }
  }

  const sparkCarsBefore = raceState.cars.length;
  // Tanko režimu sunaikinti mirę botai pašalinami iš trasos
  raceState.cars = raceState.cars.filter((c) => !c.destroyed);
  if (raceState.cars.length !== sparkCarsBefore) raceState.positionTimer = 0;

  updateItemBoxes();
  updateProjectilesAndHazards();
  for (let i = raceState.sparks.length - 1; i >= 0; i--) {
    const sp = raceState.sparks[i];
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.life--;
    if (sp.life <= 0) raceState.sparks.splice(i, 1);
  }

  // 1 PUNKTAS: Dykumos dulkių debesų dalelių atnaujinimas
  if (raceState.dustParticles && raceState.dustParticles.length > 0) {
    for (let i = raceState.dustParticles.length - 1; i >= 0; i--) {
      const d = raceState.dustParticles[i];
      d.x += d.vx;
      d.y += d.vy;
      d.vx *= 0.94;
      d.vy *= 0.94;
      d.r += (d.maxR - d.r) * 0.08;
      d.alpha -= d.decay;
      if (d.alpha <= 0) raceState.dustParticles.splice(i, 1);
    }
    if (raceState.dustParticles.length > 240) {
      raceState.dustParticles.splice(0, raceState.dustParticles.length - 240);
    }
  }

  // 1. DŪMŲ DALELIŲ GENERAVIMAS IR ANIMACIJA (Kritinė mašinų būklė: HP < 30%)
  if (raceState.cars) {
    if (!raceState.smokeParticles) raceState.smokeParticles = [];
    for (const car of raceState.cars) {
      if (car.isDead || car.hp <= 0 || car.wreckedTimer > 0) continue;
      // Tikriname, ar gyvybės nukrito žemiau 30% maksimalių HP
      if (car.hp < car.maxHp * 0.3) {
        // Kas kelis kadrus (kas 3 kadrus) iš mašinos centro kyla dūmai
        const carHash = car.isPlayer ? 0 : (car.id ? car.id.charCodeAt(car.id.length - 1) : 1);
        if ((animTick + carHash) % 3 === 0) {
          const hoodOffsetX = Math.cos(car.angle) * 6;
          const hoodOffsetY = Math.sin(car.angle) * 6;
          raceState.smokeParticles.push({
            x: car.x + hoodOffsetX + (Math.random() - 0.5) * 8,
            y: car.y + hoodOffsetY + (Math.random() - 0.5) * 8,
            vx: (car.vx * 0.12) + (Math.random() - 0.5) * 0.65,
            vy: (car.vy * 0.12) - 0.65 + (Math.random() - 0.5) * 0.55, // Lėtai kyla į viršų ir sklaidosi
            r: 5 + Math.random() * 3, // Pradinis dydis
            growRate: 0.28 + Math.random() * 0.12, // Laikui bėgant po truputį auga/plečiasi
            alpha: 0.72 + Math.random() * 0.08, // Prasideda nuo ~0.7
            decay: 0.016 + Math.random() * 0.006, // Lėtai blunka
            shade: Math.floor(35 + Math.random() * 45) // Tamsiai pilka / juoda spalva
          });
        }
      }
    }
  }

  // 2. DŪMŲ DALELIŲ ANIMACIJA IR IŠVALYMAS (Memory leak prevencija)
  if (raceState.smokeParticles && raceState.smokeParticles.length > 0) {
    for (let i = raceState.smokeParticles.length - 1; i >= 0; i--) {
      const p = raceState.smokeParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.r += p.growRate;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        raceState.smokeParticles.splice(i, 1);
      }
    }
    if (raceState.smokeParticles.length > 300) {
      raceState.smokeParticles.splice(0, raceState.smokeParticles.length - 300);
    }
  }

  for (let i = raceState.floatingTexts.length - 1; i >= 0; i--) {
    const ft = raceState.floatingTexts[i];
    ft.y -= 1.1;
    ft.life--;
    if (ft.life <= 0) raceState.floatingTexts.splice(i, 1);
  }

  // Pozicijos perskaičiuojamos kas ~0.25 s (15 kadrų)
  raceState.positionTimer = (raceState.positionTimer || 0) - 1;
  if (raceState.positionTimer <= 0) {
    calculatePositions();
    raceState.positionTimer = 15;
  }
  const playerRank = raceState.player.position || 1;

  const p = raceState.player;

  // 1. ŽAIDĖJO MIRTIES BŪSENA (GAME OVER)
  if (p.hp <= 0 && raceState.gameState !== 'gameOver') {
    triggerGameOver();
  }

  if (raceState.gameState === 'gameOver') {
    // Žaidėjo mašina akimirksniu sustoja
    p.vx = 0;
    p.vy = 0;

    // Pasipila juodi dūmai ir ugnies kibirkštys iš žaidėjo mašinos
    if (animTick % 2 === 0) {
      if (!raceState.smokeParticles) raceState.smokeParticles = [];
      raceState.smokeParticles.push({
        x: p.x + (Math.random() - 0.5) * 18,
        y: p.y + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -1.3 - Math.random() * 0.9,
        r: 8 + Math.random() * 5,
        growRate: 0.38 + Math.random() * 0.15,
        alpha: 0.88,
        decay: 0.018,
        shade: Math.floor(12 + Math.random() * 25)
      });

      if (Math.random() < 0.65) {
        raceState.sparks.push({
          x: p.x + (Math.random() - 0.5) * 16,
          y: p.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 2.4,
          vy: -1.8 - Math.random() * 1.5,
          color: Math.random() < 0.6 ? '#f97316' : '#ef4444',
          life: 22 + Math.random() * 10
        });
      }
    }

    // Kamera lieka užfiksuota ties sunaikinta žaidėjo mašina
    raceState.cameraX = p.x - raceCanvas.width / 2;
    raceState.cameraY = p.y - raceCanvas.height / 2;
    raceState.cameraX = Math.max(0, Math.min(TRACK.worldWidth - raceCanvas.width, raceState.cameraX));
    raceState.cameraY = Math.max(0, Math.min(TRACK.worldHeight - raceCanvas.height, raceState.cameraY));
  } else {
    updateRaceCamera(0.22);
  }

  updateRaceHud(playerRank);

  // Įprastinė lenktynių pabaiga (tik jei žaidėjas gyvas ir finišavo arba baigėsi laikas)
  if (raceState.gameState !== 'gameOver' && raceState.gameState !== 'podium') {
    if (p.finished || raceState.timeRemaining <= 0) {
      triggerPodium();
    }
  }
}

function updateSingleCar(car, dt) {
  // Tanko / Buldozerio režimo laikmatis: baigus – automatiškai grįžta originalūs parametrai
  if (car.tankTimer > 0) {
    car.tankTimer--;
    car.invincibleTimer = car.tankTimer;
  } else if (car.invincibleTimer > 0) {
    car.invincibleTimer = 0;
  }

  // Mini-Turbo arba Super Start greičio bonuso laikmatis po sėkmingo 360° nusileidimo arba Super Starto
  if (car.turboBoostTimer > 0) {
    car.turboBoostTimer--;
    // Ryškios mėlynos ugnies dalelės ir kibirkštys iš duslintuvo (Boost)
    if (animTick % 1 === 0) {
      const isSuper = !!car.superStartActive;
      const exhausts = [-10, 10];
      for (const ey of exhausts) {
        const normX = -Math.sin(car.angle) * ey;
        const normY = Math.cos(car.angle) * ey;
        const rearX = car.x - Math.cos(car.angle) * 26 + normX;
        const rearY = car.y - Math.sin(car.angle) * 26 + normY;
        const pChoice = Math.random();
        const flameColor = pChoice < 0.45
          ? '56, 189, 248'
          : pChoice < 0.8
          ? '59, 130, 246'
          : '224, 242, 254';
        raceState.dustParticles.push({
          x: rearX + (Math.random() - 0.5) * 3.5,
          y: rearY + (Math.random() - 0.5) * 3.5,
          vx: -Math.cos(car.angle) * (isSuper ? 6.8 : 4.8) + (Math.random() - 0.5) * 1.4,
          vy: -Math.sin(car.angle) * (isSuper ? 6.8 : 4.8) + (Math.random() - 0.5) * 1.4,
          r: (isSuper ? 4.5 : 3.4) + Math.random() * 2.8,
          maxR: isSuper ? 14 : 11,
          color: flameColor,
          alpha: 0.94,
          decay: isSuper ? 0.048 : 0.055
        });
      }
    }
    if (car.turboBoostTimer === 0) {
      car.superStartActive = false;
    }
  }

  // Šuolio (Tramplino) skrydžio laikmatis ir aukščio kreivė (0 -> 1 -> 0)
  if (car.flyTimer > 0) {
    car.flyTimer--;
    const t = 1 - (car.flyTimer / car.flyMaxDuration);
    car.flyHeight = Math.sin(t * Math.PI);

    // 1. ORE ATLIEKAMAS TRIUKAS (360 SPIN TRICK)
    if (car.isPlayer) {
      let trickSteer = 0;
      if (keys.left) trickSteer -= 1;
      if (keys.right) trickSteer += 1;
      if (trickSteer !== 0) {
        car.trickActive = true;
        car.trickDirection = trickSteer;
        const spinSpeed = 0.175; // ~36 kadrai pilnam 360° ratui (iš 90 kadrų skrydžio)
        car.angle += trickSteer * spinSpeed;
        car.trickSpinAngle += spinSpeed;

        // Vėjo ir kibirkščių sukūrys ore
        if (animTick % 2 === 0) {
          raceState.dustParticles.push({
            x: car.x + (Math.random() - 0.5) * 18,
            y: car.y + (Math.random() - 0.5) * 18,
            vx: -Math.sin(car.angle) * 3 + (Math.random() - 0.5),
            vy: Math.cos(car.angle) * 3 + (Math.random() - 0.5),
            r: 3 + Math.random() * 3,
            maxR: 9,
            color: car.trickCompleted ? '56, 189, 248' : '250, 204, 21',
            alpha: 0.85,
            decay: 0.05
          });
        }

        if (car.trickSpinAngle >= Math.PI * 2 && !car.trickCompleted) {
          car.trickCompleted = true;
          audio.correct();
          spawnSparks(car.x, car.y, 22);
          raceState.floatingTexts.push({
            x: car.x,
            y: car.y - 34,
            text: '⭐ 360° TRIUKAS ATLIKTAS! ⭐',
            color: '#38bdf8',
            life: 45
          });
        }
      }
    }

    if (car.flyTimer === 0) {
      car.isFlying = false;
      car.flyHeight = 0;
      spawnSparks(car.x, car.y, 16);
      if (raceState.skidMarks) {
        raceState.skidMarks.push({ x: car.x - 10, y: car.y, color: '#0f172a' });
        raceState.skidMarks.push({ x: car.x + 10, y: car.y, color: '#0f172a' });
      }

      // Nusileidimo patikrinimas: sėkmingas triukas vs avarija (Fail state) vs paprastas nusileidimas
      if (car.isPlayer && car.trickActive) {
        const curSpd = Math.hypot(car.vx, car.vy);
        const travelHeading = curSpd > 0.4 ? Math.atan2(car.vy, car.vx) : car.angle;
        const headingDiff = Math.abs(normalizeAngle(car.angle - travelHeading));

        // 3. APDOVANOJIMAS: SĖKMINGAS NUSILEIDIMAS IR BONUSAS (MINI-TURBO)
        // Jei triukas baigtas (360°) ir nusileido tiesiai pagal judėjimo kryptį (< 45° kampu)
        if (car.trickCompleted && headingDiff < 0.78) {
          car.angle = travelHeading; // Išlygina kėbulo kampą pagal skrydžio kryptį
          car.turboBoostTimer = 110; // ~1.8 s +30% greičio ir akseleracijos
          playBoostSound(car.isPlayer); // 1. SĖKMINGO TRIUKO GARSAS (TURBO BOOST / NITRO SPOOL-UP)
          spawnSparks(car.x, car.y, 26);
          raceState.floatingTexts.push({
            x: car.x,
            y: car.y - 32,
            text: '⚡ MINI-TURBO! +30% GREITIS! ⚡',
            color: '#38bdf8',
            life: 55
          });
        } else {
          // 2. RIZIKA: NESĖKMINGAS NUSILEIDIMAS (FAIL STATE)
          // Jei pradėjo suktis, bet nespėjo pabaigti 360° arba nusileido skersai / kreivai:
          // Greitis nukrenta iki 0, mašina nevaldomai slysta į šoną 0.5s (spinOutTimer = 30)
          const sideAngle = car.angle + (car.trickDirection >= 0 ? Math.PI / 2 : -Math.PI / 2);
          car.vx = Math.cos(sideAngle) * 2.2;
          car.vy = Math.sin(sideAngle) * 2.2;
          car.spinOutTimer = 30;
          playFailSound(car.isPlayer); // 2. NESĖKMINGO TRIUKO GARSAS (CRASH CLUNK & TIRE SCREECH)
          spawnSparks(car.x, car.y, 24);
          raceState.floatingTexts.push({
            x: car.x,
            y: car.y - 32,
            text: '💥 KREIVAS NUSILEIDIMAS! AVARIJA! 💥',
            color: '#ef4444',
            life: 50
          });
        }
      } else {
        // Paprastas, saugus nusileidimas (be pradėtų triukų)
        if (car.isPlayer || Math.random() < 0.4) {
          audio.thud();
        }
      }

      // Atstatome triukų būsenas
      car.trickActive = false;
      car.trickSpinAngle = 0;
      car.trickCompleted = false;
      car.trickDirection = 0;
    }
  }

  // 1. PERMANENTINĖ BOTŲ MIRTIS:
  // Kai boto HP nukrenta iki 0, jis tampa isDead = true.
  // Miręs botas iškart sustoja, nebegali judėti ar šaudyti, bet lieka stovėti trasoje kaip statinė kliūtis!
  if (car.isDead) {
    car.vx = 0;
    car.vy = 0;
    car.steerInput = 0;
    return;
  }

  if (car.collisionCooldown > 0) car.collisionCooldown--;
  if (car.shootCooldown > 0) car.shootCooldown--;
  if (car.muzzleFlash > 0) car.muzzleFlash--;

  if (car.wreckedTimer > 0) {
    car.wreckedTimer--;
    car.vx *= 0.9;
    car.vy *= 0.9;
    car.x += car.vx;
    car.y += car.vy;
    if (car.wreckedTimer === 0 && !car.isPlayer) {
      // Botas NIEKADA nebeatgyja!
      car.isDead = true;
      car.vx = 0;
      car.vy = 0;
    }
    return;
  }

  // Jei mašina užvažiavo ant Tepalo balos – nevaldomai sukasi!
  if (car.spinOutTimer > 0) {
    car.spinOutTimer--;
    car.angle += 0.24;
    car.vx *= 0.96;
    car.vy *= 0.96;
    car.x += car.vx;
    car.y += car.vy;
    enforceTrackWalls(car);
    updateCarLapProgress(car);
    return;
  }

  let throttle = 0;
  let steer = 0;
  let wantsFire = false;
  let wantsItem = false;
  let aiCornerSpeedCap = 1.0; // botų greičio riba prieš posūkį (1.0 = be ribos)

  if (car.isPlayer) {
    if (car.engineStallTimer > 0) {
      car.engineStallTimer--;
      throttle = 0;
      steer = 0;
      car.vx *= 0.85;
      car.vy *= 0.85;
      // 1.5 sek. tiršti juodi dūmai iš variklio kapoto (Perkaitimas)
      if (animTick % 2 === 0) {
        if (!raceState.smokeParticles) raceState.smokeParticles = [];
        const hoodX = car.x + Math.cos(car.angle) * 16;
        const hoodY = car.y + Math.sin(car.angle) * 16;
        raceState.smokeParticles.push({
          x: hoodX + (Math.random() - 0.5) * 8,
          y: hoodY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.3 - Math.random() * 0.9,
          r: 6 + Math.random() * 4,
          growRate: 0.35 + Math.random() * 0.15,
          alpha: 0.9,
          decay: 0.022,
          shade: Math.floor(10 + Math.random() * 25)
        });
      }
    } else {
      if (keys.up) throttle += 1;
      if (keys.down) throttle -= 0.75;
      if (keys.left) steer -= 1;
      if (keys.right) steer += 1;
      wantsFire = keys.fire;
      wantsItem = keys.item;
    }
  } else {
    const player = raceState.player;
    const curSpeed = Math.hypot(car.vx, car.vy);
    const spline = raceState.spline;

    let targetX = car.x;
    let targetY = car.y;
    let cornerSeverity = 0;

    if (spline && spline.samples) {
      const cl = findClosestSample(spline.samples, car.x, car.y, car.trackSampleIndex);
      car.trackSampleIndex = cl.index;
      const sNow = cl.sample;

      // Posūkių vertinimas pagal splaino kreivį į priekį
      const sampleCount = spline.samples.length;
      const lookAheadCurve = Math.min(25, Math.round(12 + curSpeed * 2.5));
      const sFar = spline.samples[(cl.index + lookAheadCurve) % sampleCount];
      const dot = sNow.tangentX * sFar.tangentX + sNow.tangentY * sFar.tangentY;
      cornerSeverity = Math.max(0, Math.min(1, (1 - dot) / 0.72));
      aiCornerSpeedCap = 1 - cornerSeverity * 0.28;

      const lookAheadSamples = Math.round(8 + curSpeed * 2.2);
      const targetIdx = (cl.index + lookAheadSamples) % sampleCount;
      const targetSample = spline.samples[targetIdx];

      const laneWobble =
        Math.sin(animTick * 0.016 + car.aiWobblePhase) * 0.26 +
        Math.cos(animTick * 0.031 + car.aiWobblePhase * 1.7) * 0.14;
      const wideCornerSlip = cornerSeverity * car.aiCornerOvershoot * 1.15;
      const rawLane = car.aiTargetOffset + laneWobble + wideCornerSlip + (car.aiMistakeTimer > 0 ? car.aiMistakeSteerBias : 0);
      const laneRatio = Math.max(-0.84, Math.min(0.84, rawLane));

      targetX = targetSample.x + targetSample.normalX * (TRACK_HALF_WIDTH * laneRatio);
      targetY = targetSample.y + targetSample.normalY * (TRACK_HALF_WIDTH * laneRatio);
    } else {
      const progAngle = getTrackProgressAngle(car.x, car.y);
      const tanNow = getTrackTangentAngle(progAngle);
      const tanFar = getTrackTangentAngle(progAngle + 0.36);
      const signedCurve = normalizeAngle(tanFar - tanNow);
      const upcomingCurve = Math.abs(signedCurve);
      cornerSeverity = Math.max(0, Math.min(1, (upcomingCurve - 0.22) / 0.45));
      aiCornerSpeedCap = 1 - cornerSeverity * 0.28;

      const lookAheadAngle = progAngle + 0.14 + curSpeed * 0.011;
      const laneWobble =
        Math.sin(animTick * 0.016 + car.aiWobblePhase) * 0.26 +
        Math.cos(animTick * 0.031 + car.aiWobblePhase * 1.7) * 0.14;
      const wideCornerSlip = cornerSeverity * car.aiCornerOvershoot * 1.15;
      const rawLane = car.aiTargetOffset + laneWobble + wideCornerSlip + (car.aiMistakeTimer > 0 ? car.aiMistakeSteerBias : 0);
      const laneRatio = Math.max(-0.88, Math.min(0.88, rawLane));
      const target = getTrackCenterPoint(lookAheadAngle, laneRatio);
      targetX = target.x;
      targetY = target.y;
    }

    // Kartais botai nepastebi ir netyčia įvažiuoja į trasoje esančias tepalo balas ar kliūtis!
    if (Math.sin(animTick * 0.02 + car.aiWobblePhase) < car.aiClumsyBias) {
      for (const oil of raceState.oilSpills) {
        const dOil = Math.hypot(oil.x - car.x, oil.y - car.y);
        if (dOil > 40 && dOil < 210) {
          targetX = targetX * 0.65 + oil.x * 0.35;
          targetY = targetY * 0.65 + oil.y * 0.35;
          break;
        }
      }
      for (const obs of raceState.trackObstacles) {
        const dObs = Math.hypot(obs.x - car.x, obs.y - car.y);
        if (dObs > 45 && dObs < 190 && (obs.cooldownByCar[car.id] || 0) <= 0) {
          targetX = targetX * 0.72 + obs.x * 0.28;
          targetY = targetY * 0.72 + obs.y * 0.28;
          break;
        }
      }
    }

    const distToPlayer = Math.hypot(player.x - car.x, player.y - car.y);
    if (distToPlayer < 240 && player.hp > 0 && player.wreckedTimer <= 0) {
      targetX = targetX * 0.72 + player.x * 0.28;
      targetY = targetY * 0.72 + player.y * 0.28;
    }

    const desiredAngle = Math.atan2(targetY - car.y, targetX - car.x);
    const diff = normalizeAngle(desiredAngle - car.angle);
    steer = Math.max(-1, Math.min(1, diff * 2.35));
    throttle = Math.abs(diff) > 0.95 ? 0.45 : 1.0;

    // ---- RETKARČIAIS BOTAS SUKLYSTA (paima per platų posūkį arba nepataiko į trajektoriją) ----
    if (car.aiMistakeTimer > 0) {
      car.aiMistakeTimer--;
      throttle *= 0.48;
      steer += car.aiMistakeSteerBias * 0.45;
    } else if (Math.random() < (cornerSeverity > 0.25 ? 0.012 : 0.004)) {
      car.aiMistakeTimer = 38 + Math.floor(Math.random() * 38);
      car.aiMistakeSteerBias = (Math.random() < 0.5 ? -1 : 1) * (0.38 + Math.random() * 0.35);
    }

    // ---- GRIEŽTAS „GUMYTĖS“ EFEKTAS (STRICT RUBBERBANDING – NERF AI) ----
    const HALF_SCREEN_PX = 500;
    const gapPx = car.totalProgress - player.totalProgress;
    let maxTotalProg = car.totalProgress;
    for (const other of raceState.cars) {
      if (other.totalProgress > maxTotalProg) maxTotalProg = other.totalProgress;
    }
    const isFirstPlaceBot = car.totalProgress >= maxTotalProg - 0.001;
    const isAheadOverHalfScreen = gapPx > HALF_SCREEN_PX || (distToPlayer > HALF_SCREEN_PX && gapPx > 200);

    let targetBand = 1.0;
    if (isFirstPlaceBot && isAheadOverHalfScreen) {
      targetBand = gapPx > 950 ? 0.70 : 0.75;
    } else if (isAheadOverHalfScreen) {
      targetBand = gapPx > 950 ? 0.74 : 0.79;
    } else if (gapPx > 260) {
      targetBand = 0.88;
    } else if (gapPx < -1400) {
      targetBand = 1.04;
    }
    const bandLerp = targetBand < car.rubberBandMult ? 0.1 : 0.025;
    car.rubberBandMult += (targetBand - car.rubberBandMult) * bandLerp;

    // AI ginklų naudojimas
    if (car.stats.weaponType !== 'none' && car.shootCooldown <= 0) {
      if (car.stats.weaponType === 'oil' || car.stats.weaponType === 'mines') {
        if (Math.random() < 0.012) wantsFire = true;
      } else if (distToPlayer < 320 && Math.abs(diff) < 0.42 && Math.random() < 0.045) {
        wantsFire = true;
      }
    }

    // AI naudoja gautą antrinį ginklą automatiškai po atsitiktinio 1–2 s laiko (60–120 kadrų)
    if (car.secondaryWeapon) {
      car.itemUseDelay = (car.itemUseDelay || 0) + 1;
      if (car.itemUseDelay >= (car.itemUseAt || 90)) wantsItem = true;
    }
  }

  steer = Math.max(-1, Math.min(1, steer));
  car.steerInput += (steer - car.steerInput) * 0.26;

  // ==================== 3 PUNKTAS: PADANGŲ IR TRASOS FIZIKA (BE LĖTINANČIŲ ZONŲ) ====================
  if (raceState.spline && raceState.spline.samples) {
    const cl = findClosestSample(raceState.spline.samples, car.x, car.y, car.trackSampleIndex);
    car.trackSampleIndex = cl.index;
  }

  const currentBiome = raceState.biome || 'city_asphalt';

  // ==================== 2 & 3 PUNKTAS: BIOMŲ FIZIKA IR KĖBULO PRISITAIKYMAS ====================
  let biomeGripMult = 1.0;
  let biomeSpeedMult = 1.0;
  let biomeAccelMult = 1.0;
  let biomeBrakingFriction = 0.986;

  if (currentBiome === 'winter_snow') {
    biomeSpeedMult = 0.9;
    biomeAccelMult = 0.85;
    biomeBrakingFriction = 0.993;

    if (car.chassisId === 'chassis_sports') {
      biomeGripMult = 0.25;
    } else if (car.chassisId === 'chassis_truck') {
      biomeGripMult = 0.62;
    } else {
      biomeGripMult = 0.4;
    }
  } else if (currentBiome === 'desert_sand') {
    biomeGripMult = 0.8;
    biomeSpeedMult = 0.7;
    biomeAccelMult = 0.7;

    if (car.chassisId === 'chassis_buggy') {
      biomeSpeedMult = 1.0;
      biomeAccelMult = 1.0;
    }
  } else {
    biomeGripMult = 1.0;
    biomeSpeedMult = 1.0;
    biomeAccelMult = 1.0;
    biomeBrakingFriction = 0.986;
  }

  let speedMult = car.stats.asphaltSpeedMult * biomeSpeedMult;
  let gripStat = car.stats.asphaltGrip * biomeGripMult;

  // 1. LĖTESNIS BAZINIS GREITIS IR ĮSIBĖGĖJIMAS + MINI-TURBO / SUPER-STARTO BONUSAS (+30% / +50%)
  const tankActive = car.tankTimer > 0;
  if (tankActive) gripStat = 1.0;
  const turboMult = car.turboBoostTimer > 0 ? (car.superStartActive ? 1.50 : 1.30) : 1.0;
  let maxSpeed = 5.35 * speedMult * (tankActive ? 2 : 1) * turboMult;
  if (!car.isPlayer) {
    maxSpeed *= car.aiSpeedFactor * car.rubberBandMult;
  }
  let accel = 0.18 * speedMult * (car.stats.accelMult || 1.0) * biomeAccelMult * turboMult;

  const speedMag = Math.hypot(car.vx, car.vy);

  // ==================== 2. TIKSLESNIS IR STABILESNIS VAIRAVIMAS (GRIP) ====================
  const forwardNowX = Math.cos(car.angle);
  const forwardNowY = Math.sin(car.angle);
  const vForwardNow = car.vx * forwardNowX + car.vy * forwardNowY;
  if (speedMag > 0.25 && !car.isFlying) {
    const dirSign = vForwardNow >= -0.2 ? 1 : -1;
    const lowSpeedFactor = Math.min(1, (speedMag - 0.25) / 2.2);
    const highSpeedDamping = 1 - 0.18 * Math.min(1, speedMag / Math.max(1, maxSpeed));
    const turnRate =
      (0.022 + gripStat * 0.015) * (car.stats.turnMult || 1.0) * lowSpeedFactor * highSpeedDamping;
    car.angle += car.steerInput * turnRate * dirSign;
  }

  // Greitis išskaidomas pagal NAUJĄ kėbulo kryptį:
  const newForwardX = Math.cos(car.angle);
  const newForwardY = Math.sin(car.angle);
  const newRightX = -newForwardY;
  const newRightY = newForwardX;

  let vForward = car.vx * newForwardX + car.vy * newForwardY;
  let vLateral = car.vx * newRightX + car.vy * newRightY;

  // Botai prieš posūkį atleidžia gazą ir švelniai pristabdo
  if (!car.isPlayer && vForward > maxSpeed * aiCornerSpeedCap) {
    throttle = Math.min(throttle, 0.1);
    vForward *= 0.993;
  }

  vForward += throttle * accel;
  vForward *= biomeBrakingFriction;
  if (vForward > maxSpeed) vForward = maxSpeed;
  if (vForward < -maxSpeed * 0.48) vForward = -maxSpeed * 0.48;

  // Šoninis slydimas: kuo mažesnis gripStat, tuo didesnis lateralRetention
  const baseRetention = Math.max(0.48, Math.min(0.96, 0.90 - (gripStat - 0.55) * 0.95));
  const driftBonus = 0.025 * Math.min(1, speedMag / Math.max(1, maxSpeed)) * Math.abs(car.steerInput);
  const lateralRetention = Math.min(0.96, baseRetention + driftBonus);
  vLateral *= tankActive ? 0.2 : lateralRetention;

  car.vx = newForwardX * vForward + newRightX * vLateral;
  car.vy = newForwardY * vForward + newRightY * vLateral;

  car.x += car.vx;
  car.y += car.vy;

  // 2. TRAMPLINAI IR ŠUOLIŲ FIZIKA (RAMPS & JUMPING):
  if (!car.isFlying && raceState.ramps) {
    const curSpd = Math.hypot(car.vx, car.vy);
    for (const ramp of raceState.ramps) {
      if (checkRampCollision(car, ramp)) {
        // Tikriname, ar greitis pakankamas (>70% bazinio greičio ~2.4 px/frame)
        if (curSpd >= 2.4) {
          car.isFlying = true;
          car.flyTimer = 90;
          car.flyMaxDuration = 90;
          car.trickActive = false;
          car.trickSpinAngle = 0;
          car.trickCompleted = false;
          car.trickDirection = 0;
          car.vx *= 1.15;
          car.vy *= 1.15;
          audio.jump();
          spawnSparks(car.x, car.y, 14);
          raceState.floatingTexts.push({
            x: car.x,
            y: car.y - 28,
            text: car.isPlayer ? '🚀 ŠUOLIS! (A/D TRIUKAS 360°)' : '🚀 ŠUOLIS!',
            color: '#facc15',
            life: 42
          });
          break;
        }
      }
    }
  }

  // Dykumos trasoje: už judančių mašinų nuolat kyla didesni dulkių debesys
  if (currentBiome === 'desert_sand' && speedMag > 0.4 && !car.isDead && (animTick + (car.isPlayer ? 0 : car.id.charCodeAt(car.id.length - 1))) % 2 === 0) {
    const rearWheelOffset = 22;
    const rearWid = 13;
    for (const s of [-rearWid, rearWid]) {
      if (Math.random() < 0.75) {
        const dustX = car.x - newForwardX * rearWheelOffset + newRightX * s + (Math.random() - 0.5) * 6;
        const dustY = car.y - newForwardY * rearWheelOffset + newRightY * s + (Math.random() - 0.5) * 6;
        raceState.dustParticles.push({
          x: dustX,
          y: dustY,
          vx: -newForwardX * (speedMag * 0.28) + (Math.random() - 0.5) * 1.5,
          vy: -newForwardY * (speedMag * 0.28) + (Math.random() - 0.5) * 1.5,
          r: 5 + Math.random() * 4,
          maxR: 19 + Math.random() * 12,
          color: Math.random() < 0.5 ? '217, 119, 6' : Math.random() < 0.5 ? '245, 158, 11' : '180, 83, 9',
          alpha: 0.65,
          decay: 0.022 + Math.random() * 0.015
        });
      }
    }
  }

  if (Math.abs(vLateral) > 1.15 && speedMag > 2.8 && animTick % 2 === 0) {
    const skidColor =
      currentBiome === 'winter_snow'
        ? 'rgba(241, 245, 249, 0.65)'
        : currentBiome === 'desert_sand'
        ? 'rgba(180, 83, 9, 0.55)'
        : 'rgba(15, 23, 42, 0.55)';
    raceState.skidMarks.push({
      x: car.x - newForwardX * 16 + newRightX * 13,
      y: car.y - newForwardY * 16 + newRightY * 13,
      angle: car.angle,
      color: skidColor
    });
    raceState.skidMarks.push({
      x: car.x - newForwardX * 16 - newRightX * 13,
      y: car.y - newForwardY * 16 - newRightY * 13,
      angle: car.angle,
      color: skidColor
    });
    if (raceState.skidMarks.length > 560) {
      raceState.skidMarks.splice(0, 2);
    }
    // Dreifo metu iš duslintuvo išsiveržiančios mėlynos ugnies dalelės ir padangų dūmai
    if (throttle > 0.25 && !car.isDead && car.turboBoostTimer <= 0 && animTick % 4 === 0) {
      const exhaustSign = Math.random() < 0.5 ? -10 : 10;
      raceState.dustParticles.push({
        x: car.x - newForwardX * 26 + newRightX * exhaustSign,
        y: car.y - newForwardY * 26 + newRightY * exhaustSign,
        vx: -newForwardX * 3.8 + (Math.random() - 0.5) * 1.2,
        vy: -newForwardY * 3.8 + (Math.random() - 0.5) * 1.2,
        r: 3 + Math.random() * 2.2,
        maxR: 9.5,
        color: Math.random() < 0.65 ? '56, 189, 248' : '96, 165, 250',
        alpha: 0.85,
        decay: 0.065
      });
    }
  }

  // ==================== 4 PUNKTAS: 7 GINKLŲ ŠAUDYMO MECHANIKA ====================
  if (wantsItem && car.secondaryWeapon) {
    useHeldItem(car, newForwardX, newForwardY);
  }

  if (car.stats.weaponType !== 'none' && wantsFire && car.shootCooldown <= 0) {
    triggerCarWeapon(car, newForwardX, newForwardY);
  }

  enforceTrackWalls(car);
  updateCarLapProgress(car);
}

function triggerCarWeapon(car, forwardX, forwardY) {
  const wType = car.stats.weaponType;
  const dmg = car.stats.weaponDamage;
  const weaponTier = getVisualTierInfo(car.stats?.roofLevel || 1).tier;
  car.shootCooldown = car.stats.weaponCooldown;
  car.muzzleFlash = 5;
  audio.shoot(wType);

  const frontX = car.x + forwardX * 30;
  const frontY = car.y + forwardY * 30;
  const rearX = car.x - forwardX * 34;
  const rearY = car.y - forwardY * 34;

  if (wType === 'minigun') {
    // 1. Kulkosvaidis: išvaizda evoliucionuoja pagal Tier (1..4)
    const jitter = (Math.random() - 0.5) * 0.06;
    const ang = car.angle + jitter;
    const tierRadius = weaponTier === 1 ? 3.8 : weaponTier === 2 ? 4.8 : weaponTier === 3 ? 5.6 : 6.4;
    const tierColor =
      weaponTier === 1 ? '#fde047' : weaponTier === 2 ? '#fb923c' : weaponTier === 3 ? '#ef4444' : '#f43f5e';
    raceState.projectiles.push({
      kind: 'bullet',
      tier: weaponTier,
      angle: ang,
      owner: car,
      x: frontX,
      y: frontY,
      vx: Math.cos(ang) * 16 + car.vx * 0.35,
      vy: Math.sin(ang) * 16 + car.vy * 0.35,
      radius: tierRadius,
      dmg,
      color: tierColor,
      life: 40
    });
  } else if (wType === 'shotgun') {
    // 2. Šratinis: 5 kulkos plačiu kampu į priekį (evoliucionuoja pagal Tier)
    const angles = [-0.26, -0.13, 0, 0.13, 0.26];
    const pelletColor =
      weaponTier === 1 ? '#f8fafc' : weaponTier === 2 ? '#fdba74' : weaponTier === 3 ? '#f87171' : '#facc15';
    for (const off of angles) {
      const ang = car.angle + off;
      raceState.projectiles.push({
        kind: 'pellet',
        tier: weaponTier,
        angle: ang,
        owner: car,
        x: frontX,
        y: frontY,
        vx: Math.cos(ang) * 14 + car.vx * 0.3,
        vy: Math.sin(ang) * 14 + car.vy * 0.3,
        radius: 4 + weaponTier * 0.6,
        dmg,
        color: pelletColor,
        life: 22
      });
    }
  } else if (wType === 'flamethrower') {
    // 3. Liepsnasvaidis: trumpo atstumo nuolatinė ugnies srovė (Tier 3/4 mėlyna/plazminė liepsna)
    for (let i = 0; i < 2; i++) {
      const spread = (Math.random() - 0.5) * 0.32;
      const ang = car.angle + spread;
      let flameColor = Math.random() < 0.5 ? '#f97316' : '#facc15';
      if (weaponTier === 2) {
        flameColor = Math.random() < 0.5 ? '#ea580c' : '#fde047';
      } else if (weaponTier === 3) {
        flameColor = Math.random() < 0.5 ? '#ef4444' : '#38bdf8';
      } else if (weaponTier >= 4) {
        flameColor = Math.random() < 0.5 ? '#22d3ee' : '#f43f5e';
      }
      raceState.projectiles.push({
        kind: 'flame',
        tier: weaponTier,
        angle: ang,
        owner: car,
        x: frontX,
        y: frontY,
        vx: Math.cos(ang) * 9.5 + car.vx * 0.5,
        vy: Math.sin(ang) * 9.5 + car.vy * 0.5,
        radius: 9 + weaponTier * 1.4,
        dmg,
        color: flameColor,
        life: 16 + weaponTier
      });
    }
  } else if (wType === 'rocket') {
    // 4. Raketsvaidis: lėtesnė raketa, kuri sprogsta AoE plotu!
    raceState.projectiles.push({
      kind: 'rocket',
      tier: weaponTier,
      owner: car,
      x: frontX,
      y: frontY,
      vx: forwardX * 11.5 + car.vx * 0.25,
      vy: forwardY * 11.5 + car.vy * 0.25,
      angle: car.angle,
      radius: 6.5 + weaponTier * 0.8,
      dmg,
      color: weaponTier >= 3 ? '#facc15' : '#ef4444',
      life: 65
    });
  } else if (wType === 'laser') {
    // 5. Lazeris: momentinis tiesus spindulys be skrydžio laiko!
    const beamLen = 470;
    const endX = frontX + forwardX * beamLen;
    const endY = frontY + forwardY * beamLen;

    raceState.laserBeams.push({
      x1: frontX,
      y1: frontY,
      x2: endX,
      y2: endY,
      tier: weaponTier,
      life: 12 + weaponTier * 2
    });

    for (const target of raceState.cars) {
      if (target === car || target.wreckedTimer > 0 || target.isFlying) continue;
      const distToSegment = pointToSegmentDistance(target.x, target.y, frontX, frontY, endX, endY);
      if (distToSegment <= target.radius + 8) {
        spawnSparks(target.x, target.y, 12);
        inflictCarDamage(target, Math.round(dmg), car, false, '⚡ LAZERIS!');
      }
    }

    if (raceState.trackObstacles) {
      for (const obs of [...raceState.trackObstacles]) {
        const distToSegment = pointToSegmentDistance(obs.x, obs.y, frontX, frontY, endX, endY);
        if (distToSegment <= obs.r + 6) {
          damageObstacle(obs, Math.round(dmg), car);
        }
      }
    }
  } else if (wType === 'oil') {
    // 6. Tepalo bala: išpilama iš nugaros, priešai pradeda nevaldomai suktis!
    raceState.oilSpills.push({
      owner: car,
      x: rearX,
      y: rearY,
      r: 32,
      dmg: Math.max(2, Math.round(dmg)),
      life: 520
    });
  } else if (wType === 'mines') {
    // 7. Minos: padedama sprogstamoji mina už savęs!
    raceState.mines.push({
      owner: car,
      x: rearX,
      y: rearY,
      r: 16,
      dmg: Math.round(dmg),
      armTimer: 18, // aktyvuojasi po 0.3s
      life: 650
    });
  }
}

// ==================== „MARIO KART“ STILIAUS PASIVIJIMO (CATCH-UP) MECHANIKA ====================
const ITEM_INFO = {
  oil: { icon: '🛢️', name: 'Tepalo bala' },
  mine: { icon: '💣', name: 'Mina' },
  homing_missile: { icon: '🎯', name: 'Raketa-Persekėtoja' },
  tank: { icon: '🛡️', name: 'Tanko režimas' }
};
const TANK_MODE_FRAMES = 300; // 5 sekundės (60 kadrų/s)

/**
 * Nustato kelintoje vietoje važiuoja kiekviena mašina.
 * Pozicija = apvažiuoti ratai + nuvažiuotas kelias iki finišo linijos (totalProgress);
 * finišavusios mašinos aukščiau, mirę botai – paskutiniai.
 */
function calculatePositions() {
  if (!raceState) return 1;
  const ranked = raceState.cars.map((car) => ({
    car,
    key: (car.isDead ? -1e7 : 0) + (car.finished ? 1e6 : 0) + car.totalProgress
  }));
  ranked.sort((a, b) => b.key - a.key);
  ranked.forEach((entry, idx) => {
    entry.car.position = idx + 1;
  });
  return raceState.player.position || 1;
}

// RNG PAGAL POZICIJĄ: 1–2 vieta gauna tik paprastus antrinius ginklus (tepalas / mina),
// 3+ vieta – Super Ginklus: Raketą-Persekėtoją (antrinis ginklas) arba Tanko režimą (Buff)
function rollItemForPosition(position) {
  if (position <= 2) {
    return Math.random() < 0.5 ? 'oil' : 'mine';
  }
  return Math.random() < 0.5 ? 'homing_missile' : 'tank_mode';
}

// Tanko režimas – BŪSENA (Buff): aktyvuojasi akimirksniu, netrukdo garažo ginklui (SPACE)
function activateTankMode(car) {
  car.tankTimer = TANK_MODE_FRAMES;
  car.invincibleTimer = TANK_MODE_FRAMES;
  if (car.isPlayer) {
    audio.fanfare();
    showRaceToast('🛡️ TANKO REŽIMAS! 5 s: 2× greitis, nepažeidžiamas – šauk toliau (SPACE)!', 130);
  }
}

function updateItemBoxes() {
  if (!raceState.itemBoxes) return;
  for (const box of raceState.itemBoxes) {
    if (!box.active) {
      box.respawn--;
      if (box.respawn <= 0) box.active = true;
      continue;
    }
    for (const car of raceState.cars) {
      if (car.isDead || car.wreckedTimer > 0) continue;
      if (Math.hypot(car.x - box.x, car.y - box.y) < car.radius + box.r) {
        calculatePositions();
        let rolled = rollItemForPosition(car.position);
        // Jau turint antrinį ginklą: 3+ vietoje gaunamas tik Tanko režimas, 1–2 vietoje dėžė paliekama
        if (car.secondaryWeapon && rolled !== 'tank_mode') {
          if (car.position <= 2) continue;
          rolled = 'tank_mode';
        }

        box.active = false;
        box.respawn = 900; // dėžė vėl atsiranda po ~15 s
        spawnSparks(box.x, box.y, 14);

        if (rolled === 'tank_mode') {
          activateTankMode(car);
        } else {
          // Vienkartinis antrinis ginklas saugomas ATSKIRAME kintamajame (garažo ginklas lieka nepaliestas)
          car.secondaryWeapon = rolled;
          car.itemUseDelay = 0;
          car.itemUseAt = 60 + Math.floor(Math.random() * 61); // botai iššauna po 1–2 s
          if (car.isPlayer) {
            const info = ITEM_INFO[rolled];
            audio.fanfare();
            showRaceToast(`🎁 ${info.icon} ${info.name}! Spausk SHIFT arba ENTER`, 130);
          }
        }
        break;
      }
    }
  }
}

// Iššauna antrinį (vienkartinį) ginklą – SHIFT / ENTER. Pagrindinis garažo ginklas (SPACE) nekeičiamas.
function useHeldItem(car, forwardX, forwardY) {
  const item = car.secondaryWeapon;
  if (!item) return;
  car.secondaryWeapon = null; // statusas išvalomas, HUD ikona dingsta

  const rearX = car.x - forwardX * 36;
  const rearY = car.y - forwardY * 36;

  if (item === 'oil') {
    raceState.oilSpills.push({ owner: car, x: rearX, y: rearY, r: 34, dmg: 2, life: 600 });
    audio.shoot('oil');
  } else if (item === 'mine') {
    raceState.mines.push({ owner: car, x: rearX, y: rearY, r: 16, dmg: 14, armTimer: 18, life: 650 });
    audio.shoot('mines');
  } else if (item === 'homing_missile') {
    raceState.projectiles.push({
      kind: 'homing',
      tier: 3,
      owner: car,
      target: null,
      x: car.x + forwardX * 34,
      y: car.y + forwardY * 34,
      vx: forwardX * 10.5,
      vy: forwardY * 10.5,
      angle: car.angle,
      radius: 9,
      dmg: 999,
      color: '#f43f5e',
      life: 320
    });
    audio.shoot('rocket');
  }
}

function destroyDeadCar(deadCar) {
  if (deadCar.destroyed) return;
  deadCar.destroyed = true;
  audio.explosion();
  spawnSparks(deadCar.x, deadCar.y, 24);
  raceState.floatingTexts.push({
    x: deadCar.x,
    y: deadCar.y - 24,
    text: '💥 SUTRAIŠKYTA!',
    color: '#facc15',
    life: 40
  });
}

function drawItemHud(ctx, w, h) {
  const p = raceState.player;
  if (!p) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1 PUNKTAS: Inventoriaus langelis ekrano apačioje dešiniajame kampe
  const boxSize = 74;
  const bx = w - boxSize - 20;
  const by = h - boxSize - 20;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(bx, by, boxSize, boxSize);

  if (p.secondaryWeapon && ITEM_INFO[p.secondaryWeapon]) {
    const info = ITEM_INFO[p.secondaryWeapon];
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, boxSize, boxSize);

    ctx.font = '34px "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(info.icon, bx + boxSize / 2, by + boxSize / 2 - 6);

    ctx.font = '900 9px "Nunito", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('SHIFT / ENTER', bx + boxSize / 2, by + boxSize - 8);
  } else {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(bx, by, boxSize, boxSize);
    ctx.setLineDash([]);

    ctx.font = '900 10px "Nunito", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('SUPER', bx + boxSize / 2, by + boxSize / 2 - 6);
    ctx.fillText('DĖŽĖ', bx + boxSize / 2, by + boxSize / 2 + 7);
  }

  // Tanko režimo likusio laiko juosta (aktyvuojasi paėmus dėžę)
  if (p.tankTimer > 0) {
    const pct = p.tankTimer / TANK_MODE_FRAMES;
    const barW = 200;
    const barH = 22;
    const barX = 14;
    const barY = h - barH - 14;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(barX + 3, barY + 3, (barW - 6) * pct, barH - 6);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 11px "Nunito", sans-serif';
    ctx.fillText('🛡️ TANKO REŽIMAS', barX + barW / 2, barY + barH / 2);
  }
  ctx.restore();
}

function damageObstacle(obs, dmg, attacker = null) {
  if (!obs || obs.hp <= 0) return;
  obs.hp -= dmg;
  spawnSparks(obs.x, obs.y, 8);
  const label = obs.kind === 'rock' ? '🪨' : '🛞';
  raceState.floatingTexts.push({
    x: obs.x,
    y: obs.y - 20,
    text: `${label} -${Math.round(dmg)}`,
    color: '#facc15',
    life: 30
  });

  if (obs.hp <= 0) {
    // Kliūtis sunaikinta!
    audio.explosion();
    spawnSparks(obs.x, obs.y, 22);
    raceState.floatingTexts.push({
      x: obs.x,
      y: obs.y - 32,
      text: `${label} SUNAIKINTA!`,
      color: '#4ade80',
      life: 45
    });
    const obsIndex = raceState.trackObstacles.indexOf(obs);
    if (obsIndex !== -1) {
      raceState.trackObstacles.splice(obsIndex, 1);
    }
  }
}

function updateProjectilesAndHazards() {
  // 1. Kulkos, šratai, liepsnos ir raketos
  for (let i = raceState.projectiles.length - 1; i >= 0; i--) {
    const p = raceState.projectiles[i];

    // RAKETA-PERSEKĖTOJA: seka 1-os vietos mašiną (arba artimiausią priekyje) ir sukasi link jos
    if (p.kind === 'homing') {
      const isValid = (c) => c && c !== p.owner && !c.isDead && !c.destroyed && c.hp > 0 && c.wreckedTimer <= 0;
      if (!isValid(p.target)) {
        let best = null;
        const ownerPos = p.owner?.position || 99;
        for (const c of raceState.cars) {
          if (!isValid(c)) continue;
          if (c.position < ownerPos && (!best || c.position < best.position)) best = c;
        }
        if (!best) {
          let bestD = Infinity;
          for (const c of raceState.cars) {
            if (!isValid(c)) continue;
            const d = Math.hypot(c.x - p.x, c.y - p.y);
            if (d < bestD) {
              bestD = d;
              best = c;
            }
          }
        }
        p.target = best;
      }
      if (p.target) {
        const desired = Math.atan2(p.target.y - p.y, p.target.x - p.x);
        const diff = normalizeAngle(desired - p.angle);
        p.angle += Math.max(-0.09, Math.min(0.09, diff));
      }
      const homingSpeed = 10.5;
      p.vx = Math.cos(p.angle) * homingSpeed;
      p.vy = Math.sin(p.angle) * homingSpeed;
      if (animTick % 2 === 0) {
        raceState.sparks.push({
          x: p.x - Math.cos(p.angle) * 12,
          y: p.y - Math.sin(p.angle) * 12,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          color: Math.random() < 0.5 ? '#f43f5e' : '#fde047',
          life: 12
        });
      }
    }

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.kind === 'flame') {
      p.radius += 0.65;
    } else if (p.kind === 'rocket' && animTick % 2 === 0) {
      raceState.sparks.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: '#94a3b8',
        life: 10
      });
    }

    // Patikriname susidūrimą su sunaikinamomis trasos kliūtimis (akmenimis, padangomis)
    let hitObstacle = null;
    if (raceState.trackObstacles) {
      for (const obs of raceState.trackObstacles) {
        if (Math.hypot(obs.x - p.x, obs.y - p.y) < obs.r + p.radius) {
          hitObstacle = obs;
          break;
        }
      }
    }

    if (hitObstacle) {
      if (p.kind === 'rocket') {
        triggerAoEExplosion(p.x, p.y, p.dmg, p.owner, 130);
      } else {
        damageObstacle(hitObstacle, Math.max(1, Math.round(p.dmg)), p.owner);
      }
      raceState.projectiles.splice(i, 1);
      continue;
    }

    let hitCar = null;
    for (const car of raceState.cars) {
      if (car === p.owner || car.wreckedTimer > 0 || car.isFlying) continue;
      if (Math.hypot(car.x - p.x, car.y - p.y) < car.radius + p.radius) {
        hitCar = car;
        break;
      }
    }

    if (hitCar) {
      if (p.kind === 'rocket') {
        triggerAoEExplosion(p.x, p.y, p.dmg, p.owner, 130);
      } else {
        spawnSparks(p.x, p.y, p.kind === 'flame' ? 2 : 5);
        if (p.kind === 'homing') {
          // Persekėtoja eliminuoja pataikytą mašiną
          audio.explosion();
          spawnSparks(p.x, p.y, 30);
          raceState.explosions.push({ x: p.x, y: p.y, r: 16, maxR: 110, life: 16 });
          inflictCarDamage(hitCar, Math.ceil(hitCar.maxHp) + 1, p.owner, false, '🎯 PERSEKĖTOJA!');
        } else {
          const icon = p.kind === 'flame' ? '🔥' : p.kind === 'pellet' ? '💥' : '🔫';
          inflictCarDamage(hitCar, Math.max(1, Math.round(p.dmg)), p.owner, false, icon);
        }
      }
      raceState.projectiles.splice(i, 1);
      continue;
    }

    if (p.life <= 0) {
      if (p.kind === 'rocket') {
        triggerAoEExplosion(p.x, p.y, p.dmg, p.owner, 130);
      }
      raceState.projectiles.splice(i, 1);
    }
  }

  // 2. Lazerio spindulių animacija
  for (let i = raceState.laserBeams.length - 1; i >= 0; i--) {
    raceState.laserBeams[i].life--;
    if (raceState.laserBeams[i].life <= 0) {
      raceState.laserBeams.splice(i, 1);
    }
  }

  // 3. AoE sprogimų bangos
  for (let i = raceState.explosions.length - 1; i >= 0; i--) {
    const ex = raceState.explosions[i];
    ex.r += (ex.maxR - ex.r) * 0.25;
    ex.life--;
    if (ex.life <= 0) {
      raceState.explosions.splice(i, 1);
    }
  }

  // 4. Tepalo balos (Oil Spills – tiek ginklų, tiek statinės trasos kliūtys)
  for (let i = raceState.oilSpills.length - 1; i >= 0; i--) {
    const oil = raceState.oilSpills[i];
    if (!oil.isStaticHazard) oil.life--;
    if (oil.cooldownByCar) {
      for (const cid of Object.keys(oil.cooldownByCar)) {
        if (oil.cooldownByCar[cid] > 0) oil.cooldownByCar[cid]--;
      }
    }
    for (const car of raceState.cars) {
      if (car === oil.owner || car.wreckedTimer > 0 || car.spinOutTimer > 0 || car.tankTimer > 0 || car.isFlying) continue;
      if (oil.cooldownByCar && (oil.cooldownByCar[car.id] || 0) > 0) continue;
      if (Math.hypot(car.x - oil.x, car.y - oil.y) < oil.r + car.radius * 0.6) {
        if (oil.isStaticHazard) {
          // Statinė tepalo bala veikia kaip greičio ir valdymo bauda (0 HP žalos!)
          car.spinOutTimer = 28;
          car.vx *= 0.55;
          car.vy *= 0.55;
          raceState.floatingTexts.push({
            x: car.x,
            y: car.y - 24,
            text: '🛢️ TEPALO BALA! SLYSTA!',
            color: '#38bdf8',
            life: 34
          });
          if (!oil.cooldownByCar) oil.cooldownByCar = {};
          oil.cooldownByCar[car.id] = 110;
        } else {
          // Priešo ginklo išpilta tepalo bala
          car.spinOutTimer = 38;
          const slipAngle = car.angle + (Math.random() < 0.5 ? 1.1 : -1.1);
          car.vx += Math.cos(slipAngle) * 2.2;
          car.vy += Math.sin(slipAngle) * 2.2;
          inflictCarDamage(car, oil.dmg, oil.owner, false, '🛢️ TEPALO BALA! SLYSTA!');
          oil.life = 0;
          break;
        }
      }
    }
    if (!oil.isStaticHazard && oil.life <= 0) {
      raceState.oilSpills.splice(i, 1);
    }
  }

  // 4b. Statinės trasos kliūtys: Padangų krūvos ir Akmenys (ATLAIDI APLINKOS ŽALA: 85–90% mažesnė HP žala!).
  // Veikia kaip greičio bauda (mašina stipriai sulėtėja / sustoja), o ne HP atėmimas!
  if (raceState.trackObstacles) {
    for (const obs of [...raceState.trackObstacles]) {
      for (const cid of Object.keys(obs.cooldownByCar)) {
        if (obs.cooldownByCar[cid] > 0) obs.cooldownByCar[cid]--;
      }
      for (const car of raceState.cars) {
        if (car.wreckedTimer > 0 || car.isFlying) continue;
        if (obs.hp <= 0) break;
        const dx = car.x - obs.x;
        const dy = car.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = car.radius + obs.r;
        if (car.tankTimer > 0 && dist < minDist + 6) {
          // TANKO REŽIMAS: kliūtis sunaikinama akimirksniu, mašina nesulėtėja
          damageObstacle(obs, obs.hp + 1, car);
          break;
        }
        if (dist < minDist && dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          car.x += nx * (overlap + 2);
          car.y += ny * (overlap + 2);

          // GREIČIO BAUDA: atsitrenkus į kliūtį mašina stipriai sulėtėja / beveik sustoja!
          car.vx = car.vx * 0.15 + nx * 1.1;
          car.vy = car.vy * 0.15 + ny * 1.1;

          if ((obs.cooldownByCar[car.id] || 0) <= 0) {
            obs.cooldownByCar[car.id] = 90;
            spawnSparks(obs.x + nx * obs.r, obs.y + ny * obs.r, 8);
            if (car.isPlayer) audio.crash(false);
            const label = obs.kind === 'rock' ? '🪨 AKMUO! SULĖTĖJIMAS!' : '🛞 PADANGOS! SULĖTĖJIMAS!';
            // Tik 1 HP simbolinė žala (sumažinta ~85–90% nuo buvusių 5–7 HP), ir niekada nepribaigia paskutinio 1 HP
            if (car.hp > 2) {
              inflictCarDamage(car, 1, null, false, label);
            } else {
              raceState.floatingTexts.push({
                x: car.x,
                y: car.y - 24,
                text: label,
                color: '#facc15',
                life: 34
              });
            }
          }
        }
      }
    }
  }

  // 5. Sprogstamosios Minos (Mines)
  for (let i = raceState.mines.length - 1; i >= 0; i--) {
    const mine = raceState.mines[i];
    if (mine.armTimer > 0) mine.armTimer--;
    mine.life--;

    if (mine.armTimer <= 0) {
      let triggered = false;
      for (const car of raceState.cars) {
        if (car.wreckedTimer > 0 || car.isFlying) continue;
        if (car === mine.owner && mine.life > 580) continue;
        if (Math.hypot(car.x - mine.x, car.y - mine.y) < mine.r + car.radius * 0.75) {
          triggered = true;
          break;
        }
      }
      if (triggered) {
        triggerAoEExplosion(mine.x, mine.y, mine.dmg, mine.owner, 120);
        raceState.mines.splice(i, 1);
        continue;
      }
    }

    if (mine.life <= 0) {
      raceState.mines.splice(i, 1);
    }
  }
}

function triggerAoEExplosion(x, y, baseDmg, owner, radius = 125) {
  audio.explosion();
  spawnSparks(x, y, 26);
  raceState.explosions.push({
    x,
    y,
    r: 16,
    maxR: radius,
    life: 16
  });

  for (const car of raceState.cars) {
    if (car.wreckedTimer > 0 || car.isFlying) continue;
    const dist = Math.hypot(car.x - x, car.y - y);
    if (dist <= radius) {
      const falloff = 1 - (dist / radius) * 0.5;
      const dmg = Math.max(4, Math.round(baseDmg * falloff));
      if (car !== owner) {
        inflictCarDamage(car, dmg, owner, false, '💥 SPROGIMAS!');
      }
      // Atbloškimo impulsas
      const nx = (car.x - x) / (dist || 1);
      const ny = (car.y - y) / (dist || 1);
      car.vx += nx * 6.5 * falloff;
      car.vy += ny * 6.5 * falloff;
    }
  }

  if (raceState.trackObstacles) {
    for (const obs of [...raceState.trackObstacles]) {
      const dist = Math.hypot(obs.x - x, obs.y - y);
      if (dist <= radius + obs.r) {
        const falloff = 1 - (dist / (radius + obs.r)) * 0.5;
        const dmg = Math.max(5, Math.round(baseDmg * falloff));
        damageObstacle(obs, dmg, owner);
      }
    }
  }
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function enforceTrackWalls(car) {
  // Skrendanti mašina prašoka virš sienų ir antžeminių kliūčių
  if (car.isFlying) return;

  if (raceState && raceState.spline && raceState.spline.samples) {
    const cl = findClosestSample(raceState.spline.samples, car.x, car.y, car.trackSampleIndex);
    car.trackSampleIndex = cl.index;
    const maxLat = TRACK_HALF_WIDTH + TRACK_WALL_MARGIN - car.radius;
    const absLat = Math.abs(cl.latDist);

    if (absLat > maxLat) {
      const sign = cl.latDist >= 0 ? 1 : -1;
      const s = cl.sample;
      car.x -= s.normalX * (absLat - maxLat) * sign;
      car.y -= s.normalY * (absLat - maxLat) * sign;
      car.vx *= 0.45;
      car.vy *= 0.45;
      if (Math.hypot(car.vx, car.vy) > 1.2 && animTick % 4 === 0) {
        spawnSparks(car.x, car.y, 4);
      }
    }
    return;
  }

  // Atsitrenkimas į trasos sieną veikia kaip GREIČIO BAUDA (mašina stipriai sulėtėja, bet HP nepraranda!)
  const progAngle = getTrackProgressAngle(car.x, car.y);
  const bounds = getTrackBoundsAtAngle(progAngle);

  const dxOut = (car.x - TRACK.cx) / (bounds.outerWallRx - car.radius);
  const dyOut = (car.y - TRACK.cy) / (bounds.outerWallRy - car.radius);
  const distOut = Math.hypot(dxOut, dyOut);
  if (distOut > 1.0) {
    const nx = dxOut / distOut;
    const ny = dyOut / distOut;
    car.x = TRACK.cx + nx * (bounds.outerWallRx - car.radius);
    car.y = TRACK.cy + ny * (bounds.outerWallRy - car.radius);
    car.vx *= 0.45;
    car.vy *= 0.45;
  }

  const dxIn = (car.x - TRACK.cx) / (bounds.innerWallRx + car.radius);
  const dyIn = (car.y - TRACK.cy) / (bounds.innerWallRy + car.radius);
  const distIn = Math.hypot(dxIn, dyIn);
  if (distIn < 1.0 && distIn > 0.001) {
    const nx = dxIn / distIn;
    const ny = dyIn / distIn;
    car.x = TRACK.cx + nx * (bounds.innerWallRx + car.radius);
    car.y = TRACK.cy + ny * (bounds.innerWallRy + car.radius);
    car.vx *= 0.45;
    car.vy *= 0.45;
  }
}

function updateCarLapProgress(car) {
  if (raceState && raceState.spline && raceState.spline.samples) {
    const spline = raceState.spline;
    const cl = findClosestSample(spline.samples, car.x, car.y, car.trackSampleIndex);
    car.trackSampleIndex = cl.index;
    const curDist = Math.max(0, Math.min(spline.totalLength, cl.sample.distFromStart + cl.longProj));
    const totalLen = spline.totalLength;

    if (car.lastDistFromStart > totalLen * 0.72 && curDist < totalLen * 0.28) {
      // Kirto finišo liniją į priekį!
      car.lap++;
      if (car.lap > TRACK.totalLaps) {
        car.finished = true;
        if (raceState && raceState.finishers && !raceState.finishers.includes(car)) {
          raceState.finishers.push(car);
        }
        // Pabaigos trigeris: kai žaidėjo mašina kerta finišą, lenktynės iškart baigiasi (podiumas)
        if (car.isPlayer) {
          triggerPodium();
          return;
        }
      } else if (car.isPlayer) {
        audio.correct();
        showRaceToast(`🏁 RATAS ${car.lap} / ${TRACK.totalLaps}!`, 70);
      }
    } else if (car.lastDistFromStart < totalLen * 0.28 && curDist > totalLen * 0.72) {
      // Važiuoja atbulas per liniją
      car.lap = Math.max(1, car.lap - 1);
    }

    car.lastDistFromStart = curDist;
    car.totalProgress = (car.lap - 1) * totalLen + curDist;
    return;
  }

  const angle = getTrackProgressAngle(car.x, car.y);
  const newSector = Math.min(3, Math.floor((angle / (Math.PI * 2)) * 4));

  if (newSector === (car.sector + 1) % 4) {
    if (car.sector === 3 && newSector === 0) {
      car.lap++;
      if (car.lap > TRACK.totalLaps) {
        car.finished = true;
        if (raceState && raceState.finishers && !raceState.finishers.includes(car)) {
          raceState.finishers.push(car);
        }
        // Pabaigos trigeris žaidėjui
        if (car.isPlayer) {
          triggerPodium();
          return;
        }
      } else if (car.isPlayer) {
        audio.correct();
        showRaceToast(`🏁 RATAS ${car.lap} / ${TRACK.totalLaps}!`, 70);
      }
    }
    car.sector = newSector;
  }

  // Prieš pirmą finišo linijos kirtimą mašinos, stovinčios UŽ linijos (kampas ~2π), dar nėra nuvažiavusios rato
  let adjAngle = angle;
  if (car.sector === 0 && angle > Math.PI * 1.5) {
    adjAngle = angle - Math.PI * 2;
  }
  car.totalProgress = (car.lap - 1) * (Math.PI * 2) + adjAngle;
}

function resolveCarCollision(carA, carB) {
  // ŠUOLIO FIZIKA: jei bent viena mašina skrenda (Tramplinas), susidūrimas nevyksta – skrendanti mašina perskrenda virš kitos!
  if (carA.isFlying || carB.isFlying) return;

  const dx = carB.x - carA.x;
  const dy = carB.y - carA.y;
  const dist = Math.hypot(dx, dy);
  const minDist = carA.radius + carB.radius;

  if (dist >= minDist || dist === 0) return;

  // Tanko režimu mašina akimirksniu sunaikina mirusius botus be greičio praradimo
  if (carA.tankTimer > 0 && carB.isDead) {
    destroyDeadCar(carB);
    return;
  }
  if (carB.tankTimer > 0 && carA.isDead) {
    destroyDeadCar(carA);
    return;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist;

  carA.x -= nx * overlap * 0.52;
  carA.y -= ny * overlap * 0.52;
  carB.x += nx * overlap * 0.52;
  carB.y += ny * overlap * 0.52;

  applyWheelBladesScrape(carA, carB, nx, ny);
  applyWheelBladesScrape(carB, carA, -nx, -ny);

  const rvx = carA.vx - carB.vx;
  const rvy = carA.vy - carB.vy;
  const impactSpeed = rvx * nx + rvy * ny;

  if (impactSpeed <= 0.6) return;

  const massA = carA.stats?.mass || 1.0;
  const massB = carB.stats?.mass || 1.0;
  const totalMass = massA + massB;

  const impulse = impactSpeed * 0.9;
  if (!carA.isDead) {
    carA.vx -= nx * impulse * (massB / totalMass) * 2;
    carA.vy -= ny * impulse * (massB / totalMass) * 2;
  }
  if (!carB.isDead) {
    carB.vx += nx * impulse * (massA / totalMass) * 2;
    carB.vy += ny * impulse * (massA / totalMass) * 2;
  }

  if (carA.collisionCooldown > 0 && carB.collisionCooldown > 0) return;
  carA.collisionCooldown = 12;
  carB.collisionCooldown = 12;

  const aFrontX = Math.cos(carA.angle);
  const aFrontY = Math.sin(carA.angle);
  const bFrontX = Math.cos(carB.angle);
  const bFrontY = Math.sin(carB.angle);

  const aHitsWithFront = Math.max(0, aFrontX * nx + aFrontY * ny);
  const bHitsWithFront = Math.max(0, bFrontX * -nx + bFrontY * -ny);

  const bHitOnSide = 1 - Math.abs(bFrontX * nx + bFrontY * ny);
  const aHitOnSide = 1 - Math.abs(aFrontX * nx + aFrontY * ny);

  const baseForce = Math.min(22, impactSpeed * 2.5);

  let dmgToB =
    baseForce *
    (0.45 + aHitsWithFront * 1.15) *
    carA.stats.ramMultiplier *
    (1 + bHitOnSide * 0.75) *
    (1 - bHitsWithFront * carB.stats.selfDmgReduction);

  let dmgToA =
    baseForce *
    (0.45 + bHitsWithFront * 1.15) *
    carB.stats.ramMultiplier *
    (1 + aHitOnSide * 0.75) *
    (1 - aHitsWithFront * carA.stats.selfDmgReduction);

  dmgToB = Math.max(1, Math.round(dmgToB));
  dmgToA = Math.max(1, Math.round(dmgToA));

  const hitX = (carA.x + carB.x) / 2;
  const hitY = (carA.y + carB.y) / 2;
  spawnSparks(hitX, hitY, Math.min(18, Math.round(impactSpeed * 3)));
  audio.crash(impactSpeed > 4.5);

  inflictCarDamage(carB, dmgToB, carA, bHitOnSide > 0.65 && aHitsWithFront > 0.65);
  inflictCarDamage(carA, dmgToA, carB, aHitOnSide > 0.65 && bHitsWithFront > 0.65);
}

function applyWheelBladesScrape(attacker, victim, nx, ny) {
  if (attacker.stats.sideBladeDamage <= 0 || attacker.wreckedTimer > 0 || victim.wreckedTimer > 0) return;
  if (animTick % 12 !== 0) return;

  const frontX = Math.cos(attacker.angle);
  const frontY = Math.sin(attacker.angle);
  const sideAlignment = 1 - Math.abs(frontX * nx + frontY * ny);
  if (sideAlignment > 0.45) {
    const sliceDmg = Math.max(2, Math.round(attacker.stats.sideBladeDamage / 5));
    spawnSparks((attacker.x + victim.x) / 2, (attacker.y + victim.y) / 2, 5);
    inflictCarDamage(victim, sliceDmg, attacker, false, '⚙️ PJŪKLAS!');
  }
}

function inflictCarDamage(victim, dmg, attacker, isSideTbone = false, customLabel = null) {
  if (victim.invincibleTimer > 0) return; // Tanko režimas: nepažeidžiamas
  if (victim.hp <= 0 || dmg <= 0) return;

  victim.hp = Math.max(0, victim.hp - dmg);

  if (attacker && attacker.isPlayer && !victim.isPlayer) {
    raceState.damageDealtByPlayer += dmg;
  }

  const label = customLabel
    ? `${customLabel} -${dmg}`
    : isSideTbone
      ? `💥 ŠONINIS TARANAS! -${dmg}`
      : `-${dmg} HP`;

  raceState.floatingTexts.push({
    x: victim.x,
    y: victim.y - 24,
    text: label,
    color: victim.isPlayer ? '#f87171' : isSideTbone ? '#fde047' : '#fb923c',
    life: 38
  });

  if (victim.hp <= 0 && victim.wreckedTimer <= 0) {
    victim.wreckedTimer = 180;
    if (!victim.isPlayer) {
      victim.isDead = true;
      victim.vx = 0;
      victim.vy = 0;
    }
    spawnSparks(victim.x, victim.y, 28);
    audio.crash(true);

    if (attacker && attacker.isPlayer && !victim.isPlayer) {
      raceState.takedownsByPlayer++;
      showRaceToast(`💥 SUNAIKINTAS VARŽOVAS: ${victim.name.toUpperCase()}! (+150 🪙)`, 85);
    }
  }
}

function spawnSparks(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 5.5;
    raceState.sparks.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      color: Math.random() < 0.5 ? '#fde047' : '#fb923c',
      life: 14 + Math.floor(Math.random() * 12)
    });
  }
}

function updateRaceHud(playerRank) {
  const p = raceState.player;
  document.getElementById('hud-pos').textContent = `${playerRank} / ${raceState.cars.length}`;
  document.getElementById('hud-lap').textContent = `${Math.min(TRACK.totalLaps, p.lap)} / ${TRACK.totalLaps}`;

  const sec = Math.ceil(raceState.timeRemaining);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  document.getElementById('hud-time').textContent = `${mm}:${ss}`;

  const kmh = Math.round(Math.hypot(p.vx, p.vy) * 22);
  document.getElementById('hud-speed').textContent = `${kmh} km/h`;
  document.getElementById('hud-dmg-score').textContent = `💥 ${raceState.damageDealtByPlayer} DMG`;

  const wEl = document.getElementById('hud-weapon-status');
  if (p.stats.weaponType === 'none') {
    wEl.textContent = 'Nėra ginklo';
    wEl.style.color = '#94a3b8';
  } else if (p.shootCooldown > 0) {
    wEl.textContent = `⏳ Užtaisoma (${(p.shootCooldown / 60).toFixed(1)}s)`;
    wEl.style.color = '#facc15';
  } else {
    wEl.textContent = `${p.stats.roof.icon} PARUOŠTA!`;
    wEl.style.color = '#4ade80';
  }

  const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
  document.getElementById('hud-race-hp-text').textContent = `${Math.round(p.hp)} / ${p.maxHp}`;
  document.getElementById('hud-race-hp-fill').style.width = `${hpPct}%`;

  // 1 PUNKTAS: HUD Inventoriaus langelio atnaujinimas ekrano kampe
  const invBox = document.getElementById('hud-inventory-box');
  if (invBox) {
    const invIcon = document.getElementById('hud-inventory-icon');
    const invHint = document.getElementById('hud-inventory-hint');
    const invBadge = document.getElementById('hud-inventory-badge');
    if (p.secondaryWeapon && ITEM_INFO[p.secondaryWeapon]) {
      const info = ITEM_INFO[p.secondaryWeapon];
      invBox.classList.remove('empty');
      invBox.classList.add('has-weapon');
      if (invIcon) invIcon.textContent = info.icon;
      if (invBadge) invBadge.style.display = 'block';
    } else {
      invBox.classList.remove('has-weapon');
      invBox.classList.add('empty');
      if (invIcon) invIcon.textContent = '';
      if (invHint) invHint.innerHTML = 'SUPER<br>DĖŽĖ';
      if (invBadge) invBadge.style.display = 'none';
    }
  }
}

// ==================== 2D TOP-DOWN TRASOS, KLIŪČIŲ, GINKLŲ IR MAŠINŲ PIEŠIMAS ====================
function drawShortcutZone(ctx, sc, biome) {
  ctx.save();
  const dx = sc.x2 - sc.x1;
  const dy = sc.y2 - sc.y1;
  const ang = Math.atan2(dy, dx);

  const baseColor =
    biome === 'winter_snow'
      ? 'rgba(147, 197, 253, 0.55)'
      : biome === 'desert_sand'
      ? 'rgba(120, 53, 15, 0.75)'
      : 'rgba(69, 26, 3, 0.8)';
  const borderColor =
    biome === 'winter_snow'
      ? 'rgba(59, 130, 246, 0.85)'
      : biome === 'desert_sand'
      ? 'rgba(217, 119, 6, 0.85)'
      : 'rgba(180, 83, 9, 0.85)';

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Bekelės purvo / sniego paviršius
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = sc.r * 2;
  ctx.beginPath();
  ctx.moveTo(sc.x1, sc.y1);
  ctx.lineTo(sc.x2, sc.y2);
  ctx.stroke();

  // 2. Vėžės ir provėžos
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.lineWidth = 14;
  const perpX = -Math.sin(ang) * (sc.r * 0.45);
  const perpY = Math.cos(ang) * (sc.r * 0.45);
  ctx.beginPath();
  ctx.moveTo(sc.x1 + perpX, sc.y1 + perpY);
  ctx.lineTo(sc.x2 + perpX, sc.y2 + perpY);
  ctx.moveTo(sc.x1 - perpX, sc.y1 - perpY);
  ctx.lineTo(sc.x2 - perpX, sc.y2 - perpY);
  ctx.stroke();

  // 3. Kraštų įspėjamasis žymėjimas (brūkšninė linija)
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 6;
  ctx.setLineDash([25, 20]);
  const edgePerpX = -Math.sin(ang) * sc.r;
  const edgePerpY = Math.cos(ang) * sc.r;
  ctx.beginPath();
  ctx.moveTo(sc.x1 + edgePerpX, sc.y1 + edgePerpY);
  ctx.lineTo(sc.x2 + edgePerpX, sc.y2 + edgePerpY);
  ctx.moveTo(sc.x1 - edgePerpX, sc.y1 - edgePerpY);
  ctx.lineTo(sc.x2 - edgePerpX, sc.y2 - edgePerpY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Užrašas zonos centre
  const midX = (sc.x1 + sc.x2) / 2;
  const midY = (sc.y1 + sc.y2) / 2;
  ctx.save();
  ctx.translate(midX, midY);
  ctx.rotate(ang);
  ctx.font = '900 24px "Russo One", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(250, 204, 21, 0.88)';
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4;
  ctx.strokeText(`⚠️ ${sc.name || 'BEKELĖS KIRTIMAS'} (TIK SU TANKU!)`, 0, 8);
  ctx.fillText(`⚠️ ${sc.name || 'BEKELĖS KIRTIMAS'} (TIK SU TANKU!)`, 0, 8);
  ctx.restore();

  ctx.restore();
}

function drawRamp(ctx, ramp) {
  ctx.save();
  ctx.translate(ramp.x, ramp.y);
  ctx.rotate(ramp.angle);

  const halfL = ramp.length / 2;
  const halfW = ramp.width / 2;

  // 1. Tramplino pagrindas: metalinis/įspėjamasis gradientas
  const grad = ctx.createLinearGradient(-halfL, 0, halfL, 0);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.65, '#f59e0b');
  grad.addColorStop(1, '#facc15');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-halfL, -halfW, ramp.length, ramp.width, 6);
  ctx.fill();
  ctx.stroke();

  // 2. Juodos / geltonos įspėjamosios juostos ant šonų
  ctx.fillStyle = '#0f172a';
  for (let y = -halfW + 4; y < halfW - 4; y += 18) {
    ctx.fillRect(-halfL + 3, y, 10, 10);
    ctx.fillRect(halfL - 13, y, 10, 10);
  }

  // 3. Trys didelės dinaminės šuolio strėlės (Chevron launch arrows: >>>)
  const pulse = Math.sin(animTick * 0.15) * 4;
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;

  const arrowXs = [-halfL * 0.45, 0, halfL * 0.45];
  for (const ax of arrowXs) {
    ctx.beginPath();
    ctx.moveTo(ax - 10 + pulse, -halfW * 0.45);
    ctx.lineTo(ax + 10 + pulse, 0);
    ctx.lineTo(ax - 10 + pulse, halfW * 0.45);
    ctx.lineTo(ax - 2 + pulse, halfW * 0.45);
    ctx.lineTo(ax + 18 + pulse, 0);
    ctx.lineTo(ax - 2 + pulse, -halfW * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 4. Ryški starto briauna (Launch Lip) su blizgesiu
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(halfL - 4, -halfW, 4, ramp.width);

  ctx.restore();
}

const surfacePatternCache = {};

function getSurfaceTexturePattern(ctx, biomeId) {
  if (surfacePatternCache[biomeId] !== undefined) {
    return surfacePatternCache[biomeId];
  }
  const tile = document.createElement('canvas');
  tile.width = 96;
  tile.height = 96;
  const tctx = tile.getContext('2d');
  if (!tctx) {
    surfacePatternCache[biomeId] = null;
    return null;
  }

  // Deterministiniai smulkūs grūdeliai (asfalto, ledo arba smėlio tekstūrai)
  let seed = 1337;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  if (biomeId === 'winter_snow') {
    for (let i = 0; i < 120; i++) {
      const x = nextRand() * 96;
      const y = nextRand() * 96;
      const r = 0.7 + nextRand() * 1.4;
      tctx.fillStyle = nextRand() < 0.6 ? 'rgba(255, 255, 255, 0.14)' : 'rgba(56, 189, 248, 0.1)';
      tctx.fillRect(x, y, r, r);
    }
    tctx.strokeStyle = 'rgba(224, 242, 254, 0.12)';
    tctx.lineWidth = 1;
    tctx.beginPath();
    tctx.moveTo(8, 20);
    tctx.lineTo(44, 34);
    tctx.moveTo(54, 62);
    tctx.lineTo(88, 74);
    tctx.stroke();
  } else if (biomeId === 'desert_sand') {
    for (let i = 0; i < 150; i++) {
      const x = nextRand() * 96;
      const y = nextRand() * 96;
      const r = 0.8 + nextRand() * 1.5;
      tctx.fillStyle = nextRand() < 0.55 ? 'rgba(254, 240, 138, 0.12)' : 'rgba(69, 26, 3, 0.16)';
      tctx.fillRect(x, y, r, r);
    }
  } else {
    // Subtili grūdėto asfalto tekstūra
    for (let i = 0; i < 190; i++) {
      const x = nextRand() * 96;
      const y = nextRand() * 96;
      const r = 0.8 + nextRand() * 1.3;
      tctx.fillStyle = nextRand() < 0.5 ? 'rgba(255, 255, 255, 0.075)' : 'rgba(2, 6, 23, 0.18)';
      tctx.fillRect(x, y, r, r);
    }
  }

  const pattern = ctx.createPattern(tile, 'repeat');
  surfacePatternCache[biomeId] = pattern;
  return pattern;
}

function traceTrackLoop(ctx, getRadiiFn, steps = 180) {
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const b = getTrackBoundsAtAngle(a);
    const [rx, ry] = getRadiiFn(b, a);
    const x = TRACK.cx + Math.sin(a) * rx;
    const y = TRACK.cy + Math.cos(a) * ry;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawRace() {
  if (!raceState) return;
  const ctx = raceCtx;
  const w = raceCanvas.width;
  const h = raceCanvas.height;
  // 1 PUNKTAS: TRASŲ TEMŲ (BIOMES) VIZUALIKA
  const currentBiome = raceState.biome || 'city_asphalt';
  const bInfo = BIOMES[currentBiome] || BIOMES.city_asphalt;

  ctx.clearRect(0, 0, w, h);

  ctx.save();
  // KAMERA: visi pasaulio objektai perskaičiuojami atimant kameros (x, y) poslinkį
  ctx.translate(-raceState.cameraX, -raceState.cameraY);

  // 1. Išorinis fonas pagal temą:
  // - Miestas: žalias fonas (žolė)
  // - Žiema: baltas / šviesiai melsvas fonas (sniegas/ledas)
  // - Dykuma: smėlinis / geltonas fonas (smėlynai)
  const camX = raceState.cameraX;
  const camY = raceState.cameraY;
  ctx.fillStyle = bInfo.bgTile1;
  ctx.fillRect(camX, camY, w, h);
  const tile = 160;
  const tx0 = Math.floor(camX / tile);
  const ty0 = Math.floor(camY / tile);
  const tx1 = Math.ceil((camX + w) / tile);
  const ty1 = Math.ceil((camY + h) / tile);
  ctx.fillStyle = bInfo.bgTile2;
  for (let ty = ty0; ty < ty1; ty++) {
    for (let tx = tx0; tx < tx1; tx++) {
      if ((tx + ty) % 2 === 0) ctx.fillRect(tx * tile, ty * tile, tile, tile);
    }
  }

  // ==================== TRASOS GEOMETRIJOS PIEŠIMAS (SPLINE ARBA ELIPSĖ) ====================
  if (raceState.spline && raceState.spline.samples) {
    const sp = raceState.spline;
    const samples = sp.samples;
    const sampleCount = samples.length;

    const traceSplineCenter = () => {
      ctx.beginPath();
      for (let i = 0; i < sampleCount; i++) {
        if (i === 0) ctx.moveTo(samples[i].x, samples[i].y);
        else ctx.lineTo(samples[i].x, samples[i].y);
      }
      ctx.closePath();
    };

    const traceSplineOffset = (offsetPx) => {
      ctx.beginPath();
      for (let i = 0; i < sampleCount; i++) {
        const s = samples[i];
        const ox = s.x + s.normalX * offsetPx;
        const oy = s.y + s.normalY * offsetPx;
        if (i === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
    };

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // B. Apsauginis išorinis žiedas / siena aplink kelią
    ctx.strokeStyle = bInfo.wallColor;
    ctx.lineWidth = (TRACK_HALF_WIDTH + TRACK_WALL_MARGIN) * 2;
    traceSplineCenter();
    ctx.stroke();

    // Sienos raudonai-baltas įspėjamasis kraštas (abiejose pusėse)
    for (const side of [-(TRACK_HALF_WIDTH + TRACK_WALL_MARGIN - 10), (TRACK_HALF_WIDTH + TRACK_WALL_MARGIN - 10)]) {
      traceSplineOffset(side);
      ctx.lineWidth = 20;
      ctx.strokeStyle = bInfo.wallStripe;
      ctx.stroke();
      ctx.setLineDash([44, 44]);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // C. Pagrindinė trasos kelio danga (Asfaltas / Ledas / Smėlis + smulki tekstūra)
    ctx.strokeStyle = bInfo.trackColor;
    ctx.lineWidth = TRACK_HALF_WIDTH * 2;
    traceSplineCenter();
    ctx.stroke();

    const surfaceTex = getSurfaceTexturePattern(ctx, currentBiome);
    if (surfaceTex) {
      ctx.strokeStyle = surfaceTex;
      ctx.lineWidth = TRACK_HALF_WIDTH * 2 - 8;
      traceSplineCenter();
      ctx.stroke();
    }

    // D. Bordiūrai abiejuose kelio kraštuose + raudonai-balti lenktynių borteliai posūkiuose
    for (const side of [-TRACK_HALF_WIDTH, TRACK_HALF_WIDTH]) {
      traceSplineOffset(side);
      ctx.lineWidth = 18;
      ctx.strokeStyle = 'rgba(2, 6, 23, 0.72)';
      ctx.stroke();

      ctx.lineWidth = 14;
      ctx.strokeStyle = currentBiome === 'city_asphalt' ? '#f8fafc' : bInfo.trackEdge1;
      ctx.stroke();
      ctx.setLineDash([34, 34]);
      ctx.strokeStyle = currentBiome === 'city_asphalt' ? '#ef4444' : bInfo.trackEdge2;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ryškūs raudonai-balti lenktynių borteliai (curbs) aštresniuose posūkiuose
    for (let i = 0; i < sampleCount; i++) {
      const prev = samples[(i - 2 + sampleCount) % sampleCount];
      const cur = samples[i];
      const nxt = samples[(i + 2) % sampleCount];
      const cross = prev.tangentX * nxt.tangentY - prev.tangentY * nxt.tangentX;
      if (Math.abs(cross) > 0.045) {
        const apexSide = cross > 0 ? TRACK_HALF_WIDTH - 4 : -(TRACK_HALF_WIDTH - 4);
        const cx1 = cur.x + cur.normalX * apexSide;
        const cy1 = cur.y + cur.normalY * apexSide;
        const cx2 = nxt.x + nxt.normalX * apexSide;
        const cy2 = nxt.y + nxt.normalY * apexSide;
        ctx.strokeStyle = (Math.floor(i / 2) % 2 === 0) ? '#ef4444' : '#f8fafc';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();
      }
    }

    // E. Juostų žymėjimas (brūkšninės linijos)
    ctx.strokeStyle = bInfo.laneStroke || 'rgba(250, 204, 21, 0.5)';
    ctx.lineWidth = 6;
    ctx.setLineDash([60, 50]);
    for (const laneRatio of [-0.33, 0.33]) {
      traceSplineOffset(TRACK_HALF_WIDTH * laneRatio);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // F. Finišo linija ties sample 0
    const s0 = samples[0];
    const sq = 18;
    const stepsCount = Math.floor((TRACK_HALF_WIDTH * 2) / sq);
    const startPerpX = s0.x - s0.normalX * TRACK_HALF_WIDTH;
    const startPerpY = s0.y - s0.normalY * TRACK_HALF_WIDTH;

    for (let i = 0; i < stepsCount; i++) {
      const px = startPerpX + s0.normalX * (i * sq);
      const py = startPerpY + s0.normalY * (i * sq);
      for (let c = 0; c < 2; c++) {
        const sqX = px + s0.tangentX * (c * sq - sq);
        const sqY = py + s0.tangentY * (c * sq - sq);
        ctx.fillStyle = (i + c) % 2 === 0 ? '#ffffff' : '#0f172a';
        ctx.fillRect(sqX, sqY, sq, sq);
      }
    }

    // G. Tramplinai (Ramps)
    if (raceState.ramps) {
      for (const ramp of raceState.ramps) {
        drawRamp(ctx, ramp);
      }
    }
  } else {
    // 2. Išorinis apsauginis žiedas prie sienos + apsauginė siena (elipsės fallback)
    ctx.fillStyle = bInfo.wallColor;
    ctx.strokeStyle = bInfo.wallStripe;
    ctx.lineWidth = 22;
    traceTrackLoop(ctx, (b) => [b.outerWallRx, b.outerWallRy]);
    ctx.fill();
    ctx.stroke();

    ctx.setLineDash([46, 46]);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 22;
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Pagrindinis trasos kelias su „S“ posūkiais, susiaurėjimais ir grūdėta tekstūra
    ctx.fillStyle = bInfo.trackColor;
    traceTrackLoop(ctx, (b) => [b.asphaltOuterRx, b.asphaltOuterRy]);
    ctx.fill();

    const surfaceTexFallback = getSurfaceTexturePattern(ctx, currentBiome);
    if (surfaceTexFallback) {
      ctx.fillStyle = surfaceTexFallback;
      ctx.fill();
    }

    // 3b. Raudonai-balti lenktynių bordiūrai abiejuose kelio kraštuose
    for (const edgeFn of [
      (b) => [b.asphaltOuterRx, b.asphaltOuterRy],
      (b) => [b.asphaltInnerRx, b.asphaltInnerRy]
    ]) {
      traceTrackLoop(ctx, edgeFn);
      ctx.lineWidth = 18;
      ctx.strokeStyle = 'rgba(2, 6, 23, 0.72)';
      ctx.stroke();
      ctx.lineWidth = 14;
      ctx.strokeStyle = currentBiome === 'city_asphalt' ? '#f8fafc' : bInfo.trackEdge1;
      ctx.stroke();
      ctx.setLineDash([34, 34]);
      ctx.strokeStyle = currentBiome === 'city_asphalt' ? '#ef4444' : bInfo.trackEdge2;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Juostų linijos (seka „S“ posūkius ir susiaurėjimus)
    ctx.strokeStyle = bInfo.laneStroke || 'rgba(250, 204, 21, 0.5)';
    ctx.lineWidth = 6;
    ctx.setLineDash([60, 50]);
    for (const laneRatio of [-1 / 3, 1 / 3]) {
      traceTrackLoop(ctx, (b) => [b.centerRx + b.halfW * laneRatio, b.centerRy + b.halfW * laneRatio]);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 6. Vidinis kraštas ir sala
    ctx.fillStyle = currentBiome === 'winter_snow' ? '#475569' : '#451a03';
    traceTrackLoop(ctx, (b) => [b.asphaltInnerRx - 7, b.asphaltInnerRy - 7]);
    ctx.fill();

    ctx.fillStyle = bInfo.islandColor;
    ctx.strokeStyle = currentBiome === 'winter_snow' ? '#38bdf8' : '#facc15';
    ctx.lineWidth = 22;
    traceTrackLoop(ctx, (b) => [b.innerWallRx, b.innerWallRy]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = currentBiome === 'winter_snow' ? 'rgba(15, 23, 42, 0.22)' : 'rgba(255, 255, 255, 0.22)';
    ctx.font = '900 92px "Russo One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bInfo.bannerText, TRACK.cx, TRACK.cy + 36);

    // 7. Finišo linija
    const finishX = TRACK.cx - 12;
    const finishYTop = TRACK.cy + TRACK.asphaltInnerRy;
    const finishH = TRACK.asphaltOuterRy - TRACK.asphaltInnerRy;
    const sq = 16;
    for (let row = 0; row < finishH / sq; row++) {
      for (let col = 0; col < 2; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#0f172a';
        ctx.fillRect(finishX + col * sq, finishYTop + row * sq, sq, sq);
      }
    }
  }

  // 8. Slydimo žymės (realistiškos padangų žymės)
  for (const sk of raceState.skidMarks) {
    ctx.fillStyle = sk.color;
    if (typeof sk.angle === 'number') {
      ctx.save();
      ctx.translate(sk.x, sk.y);
      ctx.rotate(sk.angle);
      ctx.fillRect(-5, -3.2, 10, 6.4);
      ctx.restore();
    } else {
      ctx.fillRect(sk.x - 3, sk.y - 3, 6, 6);
    }
  }

  // 8b. Didesni dulkių debesys Dykumos trasoje (Canvas dalelės už judančių mašinų)
  if (raceState.dustParticles && raceState.dustParticles.length > 0) {
    for (const d of raceState.dustParticles) {
      ctx.fillStyle = `rgba(${d.color}, ${Math.max(0, d.alpha).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 9. Tepalo balos (Oil Spills – statinės ir ginklų)
  for (const oil of raceState.oilSpills) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.strokeStyle = oil.isStaticHazard ? '#38bdf8' : '#475569';
    ctx.lineWidth = oil.isStaticHazard ? 3 : 2;
    ctx.beginPath();
    ctx.arc(oil.x, oil.y, oil.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tepalo blizgesys
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.arc(oil.x - oil.r * 0.25, oil.y - oil.r * 0.22, oil.r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 9b. Statinės trasos kliūtys: Padangų krūvos (tires) ir Akmenys (rock)
  if (raceState.trackObstacles) {
    for (const obs of raceState.trackObstacles) {
      ctx.save();
      ctx.translate(obs.x, obs.y);
      if (obs.kind === 'tires') {
        // Padangų krūva (3 lenktyninės padangos su raudonai-baltais kraštais)
        const offsets = [
          [-10, 7],
          [10, 7],
          [0, -8]
        ];
        for (let idx = 0; idx < offsets.length; idx++) {
          const [ox, oy] = offsets[idx];
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = idx === 2 ? '#ef4444' : '#f8fafc';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ox, oy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(ox, oy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Riedulys / Akmuo
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        const pts = 7;
        for (let pIdx = 0; pIdx < pts; pIdx++) {
          const ang = (pIdx / pts) * Math.PI * 2;
          const rad = obs.r * (pIdx % 2 === 0 ? 1.0 : 0.82);
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Akmens šviesesnis viršus
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(-5, -5, obs.r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }

      // Kliūties gyvybių (HP) juostelė
      if (obs.hp < obs.maxHp) {
        const hpBarW = 34;
        const hpBarH = 5;
        const hpPct = Math.max(0, Math.min(1, obs.hp / obs.maxHp));
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(-hpBarW / 2 - 1, -obs.r - 9, hpBarW + 2, hpBarH + 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-hpBarW / 2, -obs.r - 8, hpBarW * hpPct, hpBarH);
      }
      ctx.restore();
    }
  }

  // 9c. Ginklų dėžės (Item Boxes): geltoni kvadratai su klaustuku
  if (raceState.itemBoxes) {
    for (const box of raceState.itemBoxes) {
      if (!box.active) continue;
      const bob = Math.sin(animTick * 0.08 + box.x) * 3;
      ctx.save();
      ctx.translate(box.x, box.y + bob);
      ctx.rotate(Math.sin(animTick * 0.04 + box.y) * 0.25);
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.fillRect(-20, -20, 40, 40);
      ctx.strokeRect(-20, -20, 40, 40);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#78350f';
      ctx.font = '900 30px "Russo One", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, 2);
      ctx.restore();
    }
  }

  // 10. Sprogstamosios Minos (Mines)
  const mineBlink = Math.floor(animTick / 8) % 2 === 0;
  for (const mine of raceState.mines) {
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, mine.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = mineBlink ? '#ef4444' : '#fde047';
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 11. Lazerio spinduliai (evoliucionuoja pagal Tier 1..4)
  for (const lb of raceState.laserBeams) {
    const tier = lb.tier || 1;
    ctx.save();
    ctx.strokeStyle = tier === 1 ? '#22d3ee' : tier === 2 ? '#38bdf8' : tier === 3 ? '#f43f5e' : '#facc15';
    ctx.shadowColor = tier >= 3 ? '#f43f5e' : '#06b6d4';
    ctx.shadowBlur = 12 + tier * 5;
    ctx.lineWidth = 6 + tier * 2.5;
    ctx.beginPath();
    ctx.moveTo(lb.x1, lb.y1);
    ctx.lineTo(lb.x2, lb.y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 + tier * 0.8;
    ctx.stroke();
    ctx.restore();
  }

  // 12. Kulkos, šratai, liepsnos ir raketos (EFEKTŲ EVOLIUCIJA PAGAL TIER 1..4)
  for (const p of raceState.projectiles) {
    const tier = p.tier || 1;
    const ang = p.angle !== undefined ? p.angle : Math.atan2(p.vy, p.vx);
    ctx.save();

    if (p.kind === 'bullet' || p.kind === 'pellet') {
      if (tier === 1) {
        // Tier 1 (Lygis 1-9): maži geltoni/balti taškeliai
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (tier === 2) {
        // Tier 2 (Lygis 10-19): didesni oranžiniai brūkšneliai
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.fillStyle = '#fb923c';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-8, -3, 16, 6, 3);
        ctx.fill();
        ctx.stroke();
      } else if (tier === 3) {
        // Tier 3 (Lygis 20-29): ryškiai raudonos trasuojančios kulkos
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(-7, -3.5, 16, 7, 3.5);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-2, -1.5, 8, 3);
      } else {
        // Tier 4 (Lygis 30+): Legendinės plazminės-auksinės trasuojančios kulkos su aura
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(-26, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.roundRect(-9, -4, 20, 8, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -2, 11, 4);
      }
    } else if (p.kind === 'homing') {
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-12, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-8, -7);
      ctx.lineTo(-8, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (p.kind === 'rocket') {
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      if (tier >= 3) {
        ctx.shadowColor = tier >= 4 ? '#facc15' : '#ef4444';
        ctx.shadowBlur = 12;
      }
      // Raketos ugnies uodega
      ctx.fillStyle = tier >= 4 ? '#38bdf8' : '#f97316';
      ctx.beginPath();
      ctx.arc(-8 - tier * 1.5, 0, 4 + tier, 0, Math.PI * 2);
      ctx.fill();
      // Raketos korpusas
      ctx.fillStyle = tier >= 3 ? '#dc2626' : '#475569';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.fillRect(-7, -4, 15 + tier * 2, 8);
      ctx.strokeRect(-7, -4, 15 + tier * 2, 8);
    } else {
      // Liepsnos (flame)
      if (tier >= 3) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 13. AoE sprogimų bangos
  for (const ex of raceState.explosions) {
    ctx.save();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 14. Visi bolidai
  for (const car of raceState.cars) {
    const h = car.flyHeight || 0;

    // A. Šuolio šešėlis ant žemės: minkštas tamsus šešėlis, paslinktas į dešinę-žemyn
    if (h > 0.01) {
      const shadowDist = 26 * h;
      ctx.save();
      ctx.translate(car.x + shadowDist * 0.7, car.y + shadowDist * 0.9);
      ctx.rotate(car.angle);
      ctx.fillStyle = `rgba(2, 6, 23, ${(0.42 * (1 - h * 0.3)).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, car.radius * 1.15, car.radius * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // B. Mašinos korpusas (šuolio metu paslenkamas į viršų-kairę ir padidinamas iki +16%)
    const altScale = 1.0 + 0.16 * h;
    const altOffX = -12 * h;
    const altOffY = -18 * h;

    ctx.save();
    ctx.translate(car.x + altOffX, car.y + altOffY);
    ctx.scale(altScale, altScale);
    ctx.rotate(car.angle);

    // 2. VIZUALUS ŽAIDĖJO IŠSKYRIMAS (HIGHLIGHT): Pulsuojantis neoninis švytėjimas atskaičiavimo metu
    if (car.isPlayer && raceState.countdownActive) {
      const pulse = 0.5 + 0.5 * Math.sin(animTick * 0.18);
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 24 + pulse * 14;

      // Pulsuojantis švytintis indikatoriaus žiedas po kėbulu
      ctx.save();
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.75 + pulse * 0.25})`;
      ctx.fillStyle = `rgba(250, 204, 21, ${0.20 + pulse * 0.15})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, car.radius * 1.35 + pulse * 4, car.radius * 0.95 + pulse * 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    drawCarTopDown(
      ctx,
      {
        chassisId: car.chassisId,
        bumperId: car.bumperId,
        roofId: car.roofId,
        wheelsId: car.wheelsId,
        paintId: car.paintId,
        customBodyHex: car.isDead ? '#334155' : undefined,
        customDarkHex: car.isDead ? '#0f172a' : undefined,
        customStripeHex: car.isDead ? '#475569' : undefined,
        bumperLevel: car.stats?.bumperLevel || 1,
        roofLevel: car.stats?.roofLevel || 1,
        hpRatio: car.isDead ? 0 : car.hp / car.maxHp,
        steerAngle: car.steerInput,
        muzzleFlash: car.muzzleFlash,
        secondaryWeapon: car.isDead ? null : car.secondaryWeapon
      },
      animTick
    );

    // Tanko režimo aura (paskutinę sekundę mirksi)
    if (car.tankTimer > 0 && (car.tankTimer > 60 || Math.floor(animTick / 4) % 2 === 0)) {
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 22;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, car.radius + 12 + Math.sin(animTick * 0.3) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Jei mašina mirusi (isDead) – apdegęs tamsus dūmų ir liepsnelių efektas
    if (car.isDead) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.arc(0, 0, car.radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Rūkstantys dūmai iš sudaužytos mašinos
      if (animTick % 6 === 0) {
        raceState.sparks.push({
          x: car.x + (Math.random() - 0.5) * 20,
          y: car.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.2 - Math.random() * 0.8,
          color: Math.random() < 0.6 ? '#64748b' : '#334155',
          life: 25
        });
      }
    }

    // 3. APDOVANOJIMAS (MINI-TURBO / SUPER STARTAS): Dvigubos liepsnos iš mašinos galo
    if (car.turboBoostTimer > 0) {
      ctx.save();
      const isSuper = !!car.superStartActive;
      const flameLen = (isSuper ? 36 : 22) + Math.sin(animTick * 0.9) * 8 + (Math.random() - 0.5) * 5;
      const flameW = (isSuper ? 8 : 6) + Math.sin(animTick * 0.5) * 2;
      const exhausts = [-11, 11]; // Dvigubi išmetimo vamzdžiai gale (Y ašis)
      for (const ey of exhausts) {
        // Išorinė liepsna (Ryški ciano / neoninė mėlyna)
        ctx.beginPath();
        ctx.fillStyle = isSuper
          ? (animTick % 4 < 2 ? 'rgba(56, 189, 248, 0.96)' : 'rgba(14, 165, 233, 0.90)')
          : (animTick % 4 < 2 ? 'rgba(56, 189, 248, 0.92)' : 'rgba(14, 165, 233, 0.86)');
        ctx.shadowColor = isSuper ? '#38bdf8' : '#0284c7';
        ctx.shadowBlur = isSuper ? 20 : 14;
        ctx.moveTo(-28, ey - flameW);
        ctx.lineTo(-28 - flameLen, ey);
        ctx.lineTo(-28, ey + flameW);
        ctx.closePath();
        ctx.fill();

        // Vidurinė liepsna (Super Startui elektrinė neoninė mėlyna, Mini-Turbo – karšta oranžinė)
        ctx.beginPath();
        ctx.fillStyle = isSuper ? 'rgba(96, 165, 250, 0.98)' : 'rgba(249, 115, 22, 0.95)';
        ctx.shadowColor = isSuper ? '#60a5fa' : '#f97316';
        ctx.shadowBlur = isSuper ? 12 : 8;
        ctx.moveTo(-28, ey - flameW * 0.65);
        ctx.lineTo(-28 - flameLen * 0.72, ey);
        ctx.lineTo(-28, ey + flameW * 0.65);
        ctx.closePath();
        ctx.fill();

        // Vidinis baltas branduolys
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = isSuper ? 6 : 4;
        ctx.shadowColor = '#ffffff';
        ctx.moveTo(-28, ey - flameW * 0.35);
        ctx.lineTo(-28 - flameLen * 0.42, ey);
        ctx.lineTo(-28, ey + flameW * 0.35);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();

    // 2. VIZUALUS ŽAIDĖJO IŠSKYRIMAS (HIGHLIGHT) ATSKAIČIAVIMO METU:
    // Virš žaidėjo stogo pakabinta besisukanti/pulsuojanti rodyklė ir tekstas „TU“
    if (car.isPlayer && raceState.countdownActive) {
      const bounce = Math.sin(animTick * 0.2) * 6;
      const arrowY = car.y + altOffY - 58 + bounce;
      const rot = Math.sin(animTick * 0.14) * 0.28; // Dinaminis rodyklės siūbavimas/sukimasis

      ctx.save();
      ctx.translate(car.x + altOffX, arrowY);
      ctx.rotate(rot);

      // Neoninis švytėjimas rodyklei
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;

      // Ryškiai geltona rodyklė, rodanti žemyn į mašinos stogą
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-12, -14);
      ctx.lineTo(12, -14);
      ctx.lineTo(12, -4);
      ctx.lineTo(20, -4);
      ctx.lineTo(0, 15); // Rodyklės smaigalys žemyn į stogą
      ctx.lineTo(-20, -4);
      ctx.lineTo(-12, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tekstas „TU“ virš rodyklės
      ctx.font = '900 17px "Nunito", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 4;
      ctx.strokeText('TU', 0, -26);
      ctx.fillStyle = '#fde047';
      ctx.fillText('TU', 0, -26);

      ctx.restore();
    }

    const barW = 64;
    const barH = 8;
    const bx = car.x + altOffX - barW / 2;
    const by = car.y + altOffY - 44;
    const hpRatio = car.isDead ? 0 : Math.max(0, Math.min(1, car.hp / car.maxHp));

    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
    ctx.fillStyle = car.isDead ? '#475569' : car.isPlayer ? '#22c55e' : '#ef4444';
    ctx.fillRect(bx, by, barW * hpRatio, barH);

    ctx.font = '800 12px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = car.isDead ? '#94a3b8' : car.isPlayer ? '#fde047' : '#ffffff';
    const tag = car.isDead
      ? `💀 ${car.name} (ELIMINUOTAS)`
      : car.isFlying
      ? (car.trickActive
          ? (car.trickCompleted ? `⚡ ${car.name} (360° ATLIKTA!)` : `🔄 ${car.name} (${Math.min(360, Math.round((car.trickSpinAngle / (Math.PI * 2)) * 360))}°)`)
          : `🚀 ${car.name} (ORE!)`)
      : car.engineStallTimer > 0
      ? `💥 ${car.name} (PERKAITO!)`
      : car.turboBoostTimer > 0
      ? (car.superStartActive ? `🚀 ${car.name} (SUPER STARTAS!)` : `⚡ ${car.name} (MINI-TURBO!)`)
      : car.name;
    ctx.fillText(tag, car.x + altOffX, by - 5);
  }

  // 14b. DŪMŲ DALELĖS (Kritinė mašinų būklė: HP < 30%)
  if (raceState.smokeParticles && raceState.smokeParticles.length > 0) {
    for (const sm of raceState.smokeParticles) {
      if (sm.alpha <= 0) continue;
      ctx.fillStyle = `rgba(${sm.shade}, ${sm.shade}, ${sm.shade}, ${Math.max(0, sm.alpha).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 15. Kibirkštys ir plaukiojantys žalos skaičiai
  for (const sp of raceState.sparks) {
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const ft of raceState.floatingTexts) {
    ctx.font = '800 17px "Baloo 2", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#020617';
    ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }

  ctx.restore();

  // 16. Krintančios snaigės Žiemos trasoje (Canvas particles ekrano koordinatėse)
  if (raceState.biome === 'winter_snow' && raceState.snowflakes && raceState.snowflakes.length > 0) {
    ctx.save();
    for (const s of raceState.snowflakes) {
      s.y += s.speedY;
      s.x += s.speedX + Math.sin(animTick * s.swaySpeed + s.swayOffset) * 0.75;
      if (s.y > h + 12) {
        s.y = -12;
        s.x = Math.random() * w;
      }
      if (s.x > w + 12) s.x = -12;
      else if (s.x < -12) s.x = w + 12;

      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawItemHud(ctx, w, h);
  drawRaceMinimap(ctx, w);

  // 2. PABAIGOS EKRANAS (UI): kai gameState === 'gameOver'
  if (raceState && raceState.gameState === 'gameOver') {
    drawGameOverOverlay(ctx, w, h);
  }

  // 3. VIZUALUS PODIUMO EKRANAS (UI / CANVAS): kai gameState === 'podium'
  if (raceState && raceState.gameState === 'podium') {
    drawPodiumOverlay(ctx, w, h);
  }
}

// Minižemėlapis viršutiniame dešiniajame kampe (ekrano koordinatėse, be kameros poslinkio)
function drawRaceMinimap(ctx, canvasW) {
  if (!raceState) return;

  // 2. DINAMINIS MASTELIS IR DYDŽIAI (Pritaikyta prie worldWidth/worldHeight)
  const worldW = (raceState && raceState.worldWidth) || TRACK.worldWidth || 6600;
  const worldH = (raceState && raceState.worldHeight) || TRACK.worldHeight || 4600;
  const maxMapW = 195;
  const maxMapH = 135;
  const scale = Math.min(maxMapW / worldW, maxMapH / worldH);
  const mapW = Math.round(worldW * scale);
  const mapH = Math.round(worldH * scale);
  const mx = canvasW - mapW - 14;
  const my = 14;

  ctx.save();
  // Fonas ir auksinis rėmelis
  ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.fillRect(mx, my, mapW, mapH);
  ctx.strokeRect(mx, my, mapW, mapH);

  // Apsauga nuo taškų išlipimo už mini-žemėlapio ribų
  ctx.beginPath();
  ctx.rect(mx, my, mapW, mapH);
  ctx.clip();

  const pad = 4;
  const toMap = (x, y) => {
    const px = mx + x * scale;
    const py = my + y * scale;
    return [
      Math.max(mx + pad, Math.min(mx + mapW - pad, px)),
      Math.max(my + pad, Math.min(my + mapH - pad, py))
    ];
  };

  // 2. TRASOS FORMOS ADAPTACIJA (Aštuoniukė, Zigzagas, Žiedas per Spline)
  if (raceState.spline && raceState.spline.samples) {
    const samples = raceState.spline.samples;

    // A. Trasos kontūras / pagrindas (tamsus apvadas)
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = Math.max(6, TRACK_HALF_WIDTH * 1.9 * scale) + 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const [tx, ty] = toMap(samples[i].x, samples[i].y);
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.stroke();

    // B. Trasos danga pagal biomą
    ctx.strokeStyle =
      raceState.biome === 'winter_snow'
        ? '#38bdf8'
        : raceState.biome === 'desert_sand'
        ? '#f97316'
        : '#64748b';
    ctx.lineWidth = Math.max(5, TRACK_HALF_WIDTH * 1.8 * scale);
    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      const [tx, ty] = toMap(samples[i].x, samples[i].y);
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.stroke();

    // D. Tramplinai (Ramps) minimape
    if (raceState.ramps) {
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1;
      for (const ramp of raceState.ramps) {
        const [rx, ry] = toMap(ramp.x, ramp.y);
        ctx.fillRect(rx - 2.5, ry - 2.5, 5, 5);
        ctx.strokeRect(rx - 2.5, ry - 2.5, 5, 5);
      }
    }

    // E. Finišo linija minimape
    const s0 = samples[0];
    const [fx, fy] = toMap(s0.x, s0.y);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx - 2, fy - 2, 4, 4);
  } else {
    // Atsarginis elipsinės trasos piešimas
    ctx.strokeStyle =
      raceState.biome === 'winter_snow'
        ? '#38bdf8'
        : raceState.biome === 'desert_sand'
        ? '#f97316'
        : '#64748b';
    ctx.lineWidth = Math.max(4, TRACK_HALF_WIDTH * 1.8 * scale);
    ctx.beginPath();
    const steps = 72;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const pt = getTrackCenterPoint(a, 0);
      const [tx, ty] = toMap(pt.x, pt.y);
      if (i === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.stroke();

    const [fx, fy] = toMap(TRACK.cx, TRACK.cy + TRACK.centerRy);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx - 1.5, fy - 6, 3, 12);
  }

  // 1. ATNAUJINTAS OBJEKTŲ ATVAIZDAVIMAS:
  // A. Super-ginklų dėžės (Item Boxes) – ryškiai geltoni taškai
  if (raceState.itemBoxes) {
    for (const box of raceState.itemBoxes) {
      if (!box.active) continue; // Paimtos dėžės iki respawn nerodomos
      const [bx, by] = toMap(box.x, box.y);
      ctx.fillStyle = '#facc15'; // Ryškiai geltonas taškas
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, by, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // B. Mirę priešai (Statinės kliūtys) – tamsiai pilki taškai
  if (raceState.cars) {
    for (const car of raceState.cars) {
      if (car.isPlayer) continue;
      const isDead = car.isDead || car.hp <= 0;
      if (isDead) {
        const [px, py] = toMap(car.x, car.y);
        ctx.fillStyle = '#475569'; // Tamsiai pilkas taškas mirusiems botams
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Kryžiukas viduje statinei kliūčiai pabrėžti
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - 1.5, py - 1.5);
        ctx.lineTo(px + 1.5, py + 1.5);
        ctx.moveTo(px + 1.5, py - 1.5);
        ctx.lineTo(px - 1.5, py + 1.5);
        ctx.stroke();
      }
    }

    // C. Gyvi priešai (Botai) – ryškiai raudoni taškai
    for (const car of raceState.cars) {
      if (car.isPlayer) continue;
      const isDead = car.isDead || car.hp <= 0;
      if (!isDead) {
        const [px, py] = toMap(car.x, car.y);
        ctx.fillStyle = '#ef4444'; // Raudoni taškai gyviems priešams
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // D. Žaidėjas – išskirtinis ryškiai žalias taškas su krypties rodykle ir pulsuojančia aura
    if (raceState.player) {
      const p = raceState.player;
      const [px, py] = toMap(p.x, p.y);

      // Pulsuojanti žalia aura
      const pulse = (Math.sin(animTick * 0.15) + 1) * 1.5;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(px, py, 6 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Ryškiai žalias taškas
      ctx.fillStyle = '#22c55e'; // Ryškiai žalias
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Krypties rodyklė
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(p.angle) * 7.5, py + Math.sin(p.angle) * 7.5);
      ctx.stroke();
    }
  }

  // Mini-žemėlapio antraštė
  ctx.font = '800 10px "Nunito", sans-serif';
  ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
  ctx.textAlign = 'left';
  ctx.fillText('RADARAS', mx + 6, my + 13);

  ctx.restore();
}

// ==================== GREITAS PABAIGOS EKRANAS (GAME OVER) ====================
function triggerGameOver() {
  if (!raceState || raceState.gameState === 'gameOver') return;
  raceState.gameState = 'gameOver';

  const p = raceState.player;
  p.hp = 0;
  p.isDead = true;
  p.vx = 0;
  p.vy = 0;

  audio.crash(true);
  audio.explosion();
  spawnSparks(p.x, p.y, 40);

  // Apskaičiuojame uždirbtas monetas (žalos + sunaikinimų + paguodos prizas)
  const placeReward = 50;
  const damageReward = Math.round((raceState.damageDealtByPlayer || 0) * 2);
  const takedownReward = (raceState.takedownsByPlayer || 0) * 150;
  const totalEarned = placeReward + damageReward + takedownReward;
  raceState.coinsEarned = totalEarned;

  // Iš karto išsaugome sudaužytos mašinos būseną į localStorage, kad grįžus į garažą reikėtų remonto
  const brokenProfile = garage.getActiveProfile();
  brokenProfile.currentHp = 0;
  brokenProfile.needsRepair = true;
  garage.saveDriver();

  raceState.floatingTexts.push({
    x: p.x,
    y: p.y - 32,
    text: '💥 MAŠINA SUNAIKINTA!',
    color: '#ef4444',
    life: 75
  });

  // Rodyti HTML Game Over ekraną
  const goOverlay = document.getElementById('overlay-game-over');
  if (goOverlay) {
    const coinsEl = document.getElementById('game-over-coins');
    if (coinsEl) coinsEl.textContent = `Surinkta monetų: +${totalEarned} 🪙`;
    goOverlay.classList.remove('hidden');
  }
}

function handleGameOverReturnToGarage() {
  if (raceState) {
    const profile = garage.getActiveProfile();
    if (!raceState.coinsSaved) {
      raceState.coinsSaved = true;
      profile.coins += (raceState.coinsEarned || 0);
      profile.racesPlayed = (profile.racesPlayed || 0) + 1;
      profile.totalTakedowns = (profile.totalTakedowns || 0) + (raceState.takedownsByPlayer || 0);
    }
    profile.currentHp = 0;
    profile.needsRepair = true;
    garage.saveDriver();
  }

  const goOverlay = document.getElementById('overlay-game-over');
  if (goOverlay) goOverlay.classList.add('hidden');

  returnToGarage();
}

function drawGameOverOverlay(ctx, w, h) {
  ctx.save();
  // 1. Pusiau permatomas juodas fonas (rgba(0,0,0,0.7))
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // 2. Ekrano centre didelėmis, ryškiai raudonomis raidėmis: „MAŠINA SUNAIKINTA!“
  ctx.font = '900 48px "Russo One", "Bungee", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ef4444';
  ctx.fillText('MAŠINA SUNAIKINTA!', cx, cy - 65);

  // 3. Po juo mažesniu šriftu parodykite: „Surinkta monetų: [kiekis]“
  ctx.shadowBlur = 0;
  ctx.font = '800 24px "Nunito", sans-serif';
  ctx.fillStyle = '#fde047';
  const coins = raceState.coinsEarned || 0;
  ctx.fillText(`Surinkta monetų: +${coins} 🪙`, cx, cy - 10);

  // 4. Mygtukas „Grįžti į garažą“
  const btnW = 270;
  const btnH = 54;
  const btnX = cx - btnW / 2;
  const btnY = cy + 42;

  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(btnX, btnY, btnW, btnH, 12);
  } else {
    ctx.rect(btnX, btnY, btnW, btnH);
  }
  ctx.fill();
  ctx.stroke();

  ctx.font = '900 20px "Nunito", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('🔧 Grįžti į garažą', cx, btnY + btnH / 2);

  ctx.restore();
}

// ==================== 1, 2 & 3. FINIŠO IR PODIUMO SISTEMA ====================
function triggerPodium() {
  if (!raceState || raceState.gameState === 'podium' || raceState.gameState === 'gameOver') return;
  raceState.gameState = 'podium';
  raceState.isOver = true;

  const p = raceState.player;
  p.finished = true;
  if (!raceState.finishers) raceState.finishers = [];
  if (!raceState.finishers.includes(p)) {
    raceState.finishers.push(p);
  }

  // Sustabdome visas mašinas
  for (const car of raceState.cars) {
    car.vx = 0;
    car.vy = 0;
  }

  // 1. FINIŠO LINIJOS IR POZICIJŲ FIKSAVIMAS:
  // Finišavę eina pagal kirtimo eiliškumą, o likę botai pagal jų tuo metu esamą progresą trasoje
  const finishedList = [...raceState.finishers];
  const unfinished = raceState.cars.filter((c) => !finishedList.includes(c));
  unfinished.sort((a, b) => {
    const keyA = (a.isDead ? -1e7 : 0) + (a.totalProgress || 0);
    const keyB = (b.isDead ? -1e7 : 0) + (b.totalProgress || 0);
    return keyB - keyA;
  });
  const allRanked = [...finishedList, ...unfinished];
  allRanked.forEach((car, idx) => {
    car.position = idx + 1;
  });
  raceState.podiumCars = allRanked;

  const playerRank = p.position || 1;

  // 2. MONETŲ DALYBOS (REWARDS):
  // 1 vieta: 1000 monetų
  // 2 vieta: 500 monetų
  // 3 vieta: 250 monetų
  // 4 ir žemesnės: 50 monetų (paguodos prizas)
  let placeReward = 50;
  if (playerRank === 1) {
    placeReward = 1000;
  } else if (playerRank === 2) {
    placeReward = 500;
  } else if (playerRank === 3) {
    placeReward = 250;
  } else {
    placeReward = 50;
  }

  const damageReward = Math.round((raceState.damageDealtByPlayer || 0) * 2);
  const takedownReward = (raceState.takedownsByPlayer || 0) * 150;
  const totalEarned = placeReward + damageReward + takedownReward;

  raceState.placeReward = placeReward;
  raceState.damageReward = damageReward;
  raceState.takedownReward = takedownReward;
  raceState.coinsEarned = totalEarned;

  // Pridedame monetas prie bendro žaidėjo balanso ir išsaugome į localStorage
  if (!raceState.coinsSaved) {
    raceState.coinsSaved = true;
    const profile = garage.getActiveProfile();
    const pStats = garage.getComputedCarStats(profile);
    profile.coins += totalEarned;
    profile.currentHp = p.hp <= 0 ? 0 : Math.min(pStats.maxHp, Math.max(10, Math.round(p.hp)));
    profile.needsRepair = profile.currentHp < pStats.maxHp;
    profile.racesPlayed = (profile.racesPlayed || 0) + 1;
    if (playerRank === 1) {
      profile.wins = (profile.wins || 0) + 1;
    }
    profile.totalTakedowns = (profile.totalTakedowns || 0) + (raceState.takedownsByPlayer || 0);
    garage.saveDriver();
  }

  audio.fanfare();
  hideCountdownOverlay();
}

function handlePodiumReturnToGarage() {
  if (raceState && !raceState.coinsSaved) {
    raceState.coinsSaved = true;
    const profile = garage.getActiveProfile();
    const pStats = garage.getComputedCarStats(profile);
    profile.coins += (raceState.coinsEarned || 0);
    profile.currentHp =
      raceState.player.hp <= 0
        ? 0
        : Math.min(pStats.maxHp, Math.max(10, Math.round(raceState.player.hp)));
    profile.needsRepair = profile.currentHp < pStats.maxHp;
    profile.racesPlayed = (profile.racesPlayed || 0) + 1;
    if (raceState.player.position === 1) {
      profile.wins = (profile.wins || 0) + 1;
    }
    profile.totalTakedowns = (profile.totalTakedowns || 0) + (raceState.takedownsByPlayer || 0);
    garage.saveDriver();
  }

  returnToGarage();
}

function finishRace(playerRank) {
  triggerPodium();
}

function drawPodiumCar(ctx, car, x, y, angle, scale, rank) {
  if (!car) return;
  ctx.save();
  ctx.translate(x, y);

  // Šešėlis ant laiptelio
  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 8, (car.radius || 26) * scale * 1.05, (car.radius || 26) * scale * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Švytėjimas aplink mašiną
  if (car.isPlayer) {
    const pulse = 0.5 + 0.5 * Math.sin(animTick * 0.16);
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 22 + pulse * 12;
  } else if (rank === 1) {
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 16;
  }

  ctx.scale(scale, scale);
  ctx.rotate(angle);

  drawCarTopDown(
    ctx,
    {
      chassisId: car.chassisId,
      bumperId: car.bumperId,
      roofId: car.roofId,
      wheelsId: car.wheelsId,
      paintId: car.paintId,
      customBodyHex: car.isDead ? '#334155' : undefined,
      customDarkHex: car.isDead ? '#0f172a' : undefined,
      customStripeHex: car.isDead ? '#475569' : undefined,
      bumperLevel: car.stats?.bumperLevel || 1,
      roofLevel: car.stats?.roofLevel || 1,
      hpRatio: car.isDead ? 0.25 : 1.0,
      steerAngle: 0,
      muzzleFlash: 0,
      secondaryWeapon: null
    },
    animTick
  );

  ctx.restore();

  // Etiketė virš mašinos
  ctx.save();
  ctx.font = '900 13px "Nunito", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (car.isPlayer) {
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#15803d';
    ctx.shadowBlur = 8;
    ctx.fillText(`⭐ ${car.name} (TU) ⭐`, x, y - 48);
  } else {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(car.name, x, y - 44);
  }
  ctx.restore();
}

function drawPodiumOverlay(ctx, w, h) {
  ctx.save();
  // 1. Užtemdytas fonas (rgba(0,0,0,0.82))
  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Šventinės krentančios konfeti dalelės
  for (let i = 0; i < 36; i++) {
    const px = (i * 127 + animTick * 1.8) % w;
    const py = (i * 193 + animTick * (1.2 + (i % 4) * 0.4)) % h;
    const colors = ['#facc15', '#38bdf8', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(animTick * 0.05 + i);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-3, -2, 6, 4);
    ctx.restore();
  }

  // 2. Ekrano viršuje didelėmis, auksinėmis raidėmis: „LENKTYNĖS BAIGTOS!“
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 42px "Russo One", "Bungee", sans-serif';
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 24;
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 4;
  ctx.strokeText('🏆 LENKTYNĖS BAIGTOS! 🏆', cx, 46);
  ctx.fillStyle = '#fde047';
  ctx.fillText('🏆 LENKTYNĖS BAIGTOS! 🏆', cx, 46);

  ctx.shadowBlur = 0;
  ctx.font = '800 14px "Nunito", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('OFICIALŪS LENKTYNIŲ REZULTATAI IR APDOVANOJIMŲ PAKYLA', cx, 78);

  // 3. Ekrano centre Podiumas (3 laipteliai)
  const baseY = 360;
  const stepW = 170;
  const gap = 14;

  const topCars = raceState.podiumCars || raceState.cars || [];
  const car1 = topCars[0];
  const car2 = topCars[1];
  const car3 = topCars[2];

  // Podiumo bendras pamatas
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.fillRect(cx - 300, baseY, 600, 14);
  ctx.strokeRect(cx - 300, baseY, 600, 14);

  // Laiptelis #2 (Vidutinis, kairėje) - Sidabras
  const x2 = cx - stepW / 2 - stepW - gap;
  const y2 = 265;
  const h2 = baseY - y2; // 95
  const grad2 = ctx.createLinearGradient(0, y2, 0, baseY);
  grad2.addColorStop(0, '#f8fafc');
  grad2.addColorStop(0.35, '#94a3b8');
  grad2.addColorStop(1, '#334155');
  ctx.fillStyle = grad2;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x2, y2, stepW, h2, 10);
  else ctx.rect(x2, y2, stepW, h2);
  ctx.fill();
  ctx.stroke();

  // Ženklelis #2
  const cx2 = x2 + stepW / 2;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx2, y2 + 32, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '900 24px "Russo One", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('2', cx2, y2 + 33);
  ctx.font = '900 13px "Russo One", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('2 VIETA 🥈', cx2, y2 + 66);
  ctx.font = '800 12px "Nunito", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(car2 ? car2.name : '', cx2, y2 + 82);

  // Laiptelis #3 (Žemiausias, dešinėje) - Bronza
  const x3 = cx + stepW / 2 + gap;
  const y3 = 295;
  const h3 = baseY - y3; // 65
  const grad3 = ctx.createLinearGradient(0, y3, 0, baseY);
  grad3.addColorStop(0, '#fdba74');
  grad3.addColorStop(0.35, '#ea580c');
  grad3.addColorStop(1, '#7c2d12');
  ctx.fillStyle = grad3;
  ctx.strokeStyle = '#fed7aa';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x3, y3, stepW, h3, 10);
  else ctx.rect(x3, y3, stepW, h3);
  ctx.fill();
  ctx.stroke();

  // Ženklelis #3
  const cx3 = x3 + stepW / 2;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#fed7aa';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx3, y3 + 24, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '900 20px "Russo One", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('3', cx3, y3 + 25);
  ctx.font = '900 12px "Russo One", sans-serif';
  ctx.fillStyle = '#fed7aa';
  ctx.fillText('3 VIETA 🥉', cx3, y3 + 50);

  // Laiptelis #1 (Aukščiausias, centre) - Auksas
  const x1 = cx - stepW / 2;
  const y1 = 220;
  const h1 = baseY - y1; // 140
  const grad1 = ctx.createLinearGradient(0, y1, 0, baseY);
  grad1.addColorStop(0, '#fde047');
  grad1.addColorStop(0.35, '#eab308');
  grad1.addColorStop(1, '#92400e');
  ctx.fillStyle = grad1;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x1, y1, stepW, h1, 12);
  else ctx.rect(x1, y1, stepW, h1);
  ctx.fill();
  ctx.stroke();

  // Ženklelis #1
  const cx1 = cx;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx1, y1 + 38, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '900 32px "Russo One", sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText('1', cx1, y1 + 39);
  ctx.font = '900 16px "Russo One", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('1 VIETA 🏆', cx1, y1 + 82);
  ctx.font = '800 13px "Nunito", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(car1 ? car1.name : '', cx1, y1 + 104);

  // Mašinų atvaizdavimas ant laiptelių (išjungtas judėjimas ir dūmai)
  drawPodiumCar(ctx, car2, cx2, y2 - 25, -Math.PI / 2 + 0.14, 1.20, 2);
  drawPodiumCar(ctx, car3, cx3, y3 - 25, -Math.PI / 2 - 0.14, 1.15, 3);
  drawPodiumCar(ctx, car1, cx1, y1 - 27, -Math.PI / 2, 1.30, 1);

  // 4. Po podiumu: Žaidėjo rezultatas ir laimėtos monetos
  const playerRank = (raceState.player && raceState.player.position) || 1;
  const rankIcon = playerRank === 1 ? '🏆' : playerRank === 2 ? '🥈' : playerRank === 3 ? '🥉' : '🏁';
  const coins = raceState.coinsEarned || 0;

  const cardW = 620;
  const cardH = 80;
  const cardX = cx - cardW / 2;
  const cardY = 388;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = playerRank <= 3 ? '#eab308' : '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 14);
  else ctx.rect(cardX, cardY, cardW, cardH);
  ctx.fill();
  ctx.stroke();

  ctx.font = '900 23px "Nunito", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Tavo vieta: ${playerRank} vieta ${rankIcon}   •   Laimėjai: +${coins} 🪙 monetų!`, cx, 415);

  ctx.font = '800 13.5px "Nunito", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    `Prizas už vietą: +${raceState.placeReward || 0} 🪙   |   Žala (DMG): +${raceState.damageReward || 0} 🪙   |   Sunaikinimai: +${raceState.takedownReward || 0} 🪙`,
    cx,
    444
  );

  // 5. Mygtukas „Grįžti į garažą“
  const btnW = 320;
  const btnH = 52;
  const btnX = cx - btnW / 2;
  const btnY = 492;

  const btnGrad = ctx.createLinearGradient(0, btnY, 0, btnY + btnH);
  btnGrad.addColorStop(0, '#f59e0b');
  btnGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = btnGrad;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(btnX, btnY, btnW, btnH, 14);
  else ctx.rect(btnX, btnY, btnW, btnH);
  ctx.fill();
  ctx.stroke();

  ctx.font = '900 21px "Nunito", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('🔧 Grįžti į garažą', cx, btnY + btnH / 2);

  ctx.font = '700 12px "Nunito", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('(Taip pat gali paspausti SPACE arba ENTER klavišą)', cx, 562);

  ctx.restore();
}

function returnToGarage() {
  currentScreen = 'GARAGE';
  hideCountdownOverlay();
  document.getElementById('modal-race-results').classList.add('hidden');
  document.getElementById('screen-race').classList.add('hidden');
  document.getElementById('screen-garage').classList.remove('hidden');
  updateGarageUI();
}

function normalizeAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

// ==================== ĮVYKIŲ PRIRIŠIMAS IR PAGRINDINIS CIKLAS ====================
function initEvents() {
  document.getElementById('btn-open-profiles').addEventListener('click', openProfilesScreen);
  document.getElementById('btn-time-switch-profile').addEventListener('click', openProfilesScreen);

  document.getElementById('btn-global-timer').addEventListener('click', () => {
    const profile = garage.getActiveProfile();
    const rem = profile ? getRemainingPlaytimeSeconds(profile.driverKey) : 0;
    openTimeLimitModal(rem <= 0);
  });
  document.getElementById('btn-race-global-timer').addEventListener('click', () => {
    const profile = garage.getActiveProfile();
    const rem = profile ? getRemainingPlaytimeSeconds(profile.driverKey) : 0;
    openTimeLimitModal(rem <= 0);
  });

  document.getElementById('btn-parent-extend').addEventListener('click', handleParentPasswordExtend);
  document.getElementById('parent-password-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleParentPasswordExtend();
  });
  document.getElementById('btn-time-resume').addEventListener('click', closeTimeLimitModalAndResume);

  document.querySelectorAll('.tuning-tab[data-slot]').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tuning-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      selectedTuningSlot = tab.dataset.slot;
      updateGarageUI();
    });
  });

  const spinBtn = document.getElementById('btn-toggle-spin');
  spinBtn.addEventListener('click', () => {
    previewSpinEnabled = !previewSpinEnabled;
    spinBtn.textContent = previewSpinEnabled ? '🔄 Sukti: Įjungta' : '⏸️ Sukti: Išjungta';
  });

  document.getElementById('btn-repair-math').addEventListener('click', () => {
    startPitStopMathChallenge('repair', null);
  });

  document.getElementById('btn-repair-coins').addEventListener('click', (e) => {
    const cost = Number(e.currentTarget.dataset.cost || 120);
    const profile = garage.getActiveProfile();
    const stats = garage.getComputedCarStats(profile);
    if (profile.coins < cost) {
      alert('Nepakanka monetų! Pasirink žalią „Taisyti nemokamai“ mygtuką ir išspręsk 3 užduotis!');
      return;
    }
    profile.coins -= cost;
    profile.currentHp = stats.maxHp;
    profile.needsRepair = false;
    garage.saveDriver();
    audio.correct();
    updateGarageUI();
  });

  document.getElementById('btn-close-math').addEventListener('click', closePitStopModal);

  const closeBossBtn = document.getElementById('btn-close-boss-ticket');
  if (closeBossBtn) closeBossBtn.addEventListener('click', closeBossTicketModal);
  const cancelBossBtn = document.getElementById('btn-cancel-boss-ticket');
  if (cancelBossBtn) cancelBossBtn.addEventListener('click', closeBossTicketModal);
  const buyBossBtn = document.getElementById('btn-buy-boss-ticket');
  if (buyBossBtn) {
    buyBossBtn.addEventListener('click', () => {
      if (currentBossTrackDef) {
        startBossMathChallenge(currentBossTrackDef);
      }
    });
  }

  document.getElementById('btn-start-race').addEventListener('click', startNewRace);
  document.getElementById('btn-exit-race').addEventListener('click', () => {
    if (raceState && !raceState.isOver) {
      const profile = garage.getActiveProfile();
      const pStats = garage.getComputedCarStats(profile);
      if (raceState.player.hp <= 0) {
        profile.currentHp = 0;
        profile.needsRepair = true;
      } else {
        profile.currentHp = Math.min(pStats.maxHp, Math.max(10, Math.round(raceState.player.hp)));
        profile.needsRepair = profile.currentHp < pStats.maxHp;
      }
      garage.saveDriver();
    }
    returnToGarage();
  });
  document.getElementById('btn-results-to-garage').addEventListener('click', returnToGarage);

  const btnGameOver = document.getElementById('btn-game-over-to-garage');
  if (btnGameOver) {
    btnGameOver.addEventListener('click', handleGameOverReturnToGarage);
  }

  raceCanvas.addEventListener('click', (e) => {
    if (!raceState) return;

    if (raceState.gameState === 'gameOver') {
      const rect = raceCanvas.getBoundingClientRect();
      const scaleX = raceCanvas.width / rect.width;
      const scaleY = raceCanvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const cx = raceCanvas.width / 2;
      const cy = raceCanvas.height / 2;
      const btnW = 270;
      const btnH = 54;
      const btnX = cx - btnW / 2;
      const btnY = cy + 42;

      if (clickX >= btnX && clickX <= btnX + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        handleGameOverReturnToGarage();
      }
    }

    if (raceState.gameState === 'podium') {
      const rect = raceCanvas.getBoundingClientRect();
      const scaleX = raceCanvas.width / rect.width;
      const scaleY = raceCanvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const cx = raceCanvas.width / 2;
      const btnW = 320;
      const btnH = 52;
      const btnX = cx - btnW / 2;
      const btnY = 492;

      if (clickX >= btnX && clickX <= btnX + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        handlePodiumReturnToGarage();
      }
    }
  });

  raceCanvas.addEventListener('mousemove', (e) => {
    if (!raceState) return;
    const rect = raceCanvas.getBoundingClientRect();
    const scaleX = raceCanvas.width / rect.width;
    const scaleY = raceCanvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const cx = raceCanvas.width / 2;

    if (raceState.gameState === 'gameOver') {
      const cy = raceCanvas.height / 2;
      const btnW = 270;
      const btnH = 54;
      const btnX = cx - btnW / 2;
      const btnY = cy + 42;
      if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
        raceCanvas.style.cursor = 'pointer';
        return;
      }
    }

    if (raceState.gameState === 'podium') {
      const btnW = 320;
      const btnH = 52;
      const btnX = cx - btnW / 2;
      const btnY = 492;
      if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
        raceCanvas.style.cursor = 'pointer';
        return;
      }
    }

    raceCanvas.style.cursor = 'default';
  });
}

let lastTime = performance.now();
function mainLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  animTick++;

  if (currentScreen === 'GARAGE') {
    drawGarageTurntable();
  } else if (currentScreen === 'RACE') {
    updateRace(dt);
    drawRace();
  }

  requestAnimationFrame(mainLoop);
}

initEvents();
startGlobalPlaytimeTicker();
openProfilesScreen();
requestAnimationFrame(mainLoop);
