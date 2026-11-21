// ==================== BENDRAS 20 MINUČIŲ DIENOS ŽAIDIMO TAIMERIS (LINAS & LUKAS) ====================
// Suderinamas su esamais portalo localStorage raktais:
//   - 'bosas_global_time_linas' (Linas – 1 klasė)
//   - 'bosas_global_time_lukas' (Lukas – 3 klasė)
// Saugo { lastPlayedDate: 'YYYY-MM-DD', timePlayedTodaySeconds, dailyTimeLimitSeconds }

export const GLOBAL_TIME_KEYS = {
  linas: 'bosas_global_time_linas',
  lukas: 'bosas_global_time_lukas'
};

export const DAILY_PLAYTIME_KEY_PREFIX = 'bosas_playtime_';

export const LEGACY_PROFILE_KEYS = {
  linas: 'skaiciu_karalyste_save_linas_v2',
  lukas: 'skaiciu_karalyste_save_lukas_v2'
};

export const DEFAULT_DAILY_TIME_LIMIT_SECONDS = 1200; // 20 minučių (1200 s)
export const PARENT_PASSWORD = 'bosas123';
export const LOCKOUT_MESSAGE =
  'Šiandienos 20 min. žaidimo laikas baigėsi! Pailsėk arba pasivažinėk dviračiu.';
export const TASK_PAUSED_LABEL = '⏸ Uždavinys (laikas sustabdytas)';
export const GRACE_BANNER_TEXT = '⏳ 20 min. laikas baigėsi! Užbaik šį lygį ir pailsėk.';

function createTaskPauseTracker() {
  const activeReasons = new Set();
  let anonDepth = 0;
  return {
    set(isPaused, reason) {
      const key = typeof reason === 'string' && reason.trim() ? reason.trim() : null;
      if (isPaused) {
        if (key) activeReasons.add(key);
        else anonDepth += 1;
      } else if (key) {
        activeReasons.delete(key);
      } else if (anonDepth > 0) {
        anonDepth -= 1;
      }
      return this.isPaused();
    },
    isPaused() {
      return activeReasons.size > 0 || anonDepth > 0;
    },
    clear() {
      activeReasons.clear();
      anonDepth = 0;
    }
  };
}

const globalTaskPauseTracker = createTaskPauseTracker();
const taskPauseListeners = new Set();

function notifyTaskPauseListeners() {
  for (const fn of [...taskPauseListeners]) {
    try {
      fn();
    } catch (e) {
      // Ignoruojame klausytojo klaidas
    }
  }
}

export function setTaskPaused(isPaused, reason) {
  const state = globalTaskPauseTracker.set(Boolean(isPaused), reason);
  notifyTaskPauseListeners();
  return state;
}

export function pauseForTask(reason) {
  return setTaskPaused(true, reason);
}

export function resumeFromTask(reason) {
  return setTaskPaused(false, reason);
}

export function isTaskPaused() {
  return globalTaskPauseTracker.isPaused();
}

export function clearTaskPauses() {
  globalTaskPauseTracker.clear();
  notifyTaskPauseListeners();
}

export function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDailyPlaytimeKey(dateStr = getTodayDateString()) {
  return `${DAILY_PLAYTIME_KEY_PREFIX}${dateStr}`;
}

export function normalizeChildId(idOrGrade) {
  if (
    idOrGrade === 'linas' ||
    idOrGrade === 'grade1' ||
    idOrGrade === 1 ||
    idOrGrade === '1' ||
    idOrGrade === 0
  ) {
    return 'linas';
  }
  if (
    idOrGrade === 'lukas' ||
    idOrGrade === 'grade3' ||
    idOrGrade === 3 ||
    idOrGrade === '3'
  ) {
    return 'lukas';
  }
  return null;
}

export function getChildLabel(idOrGrade) {
  const childId = normalizeChildId(idOrGrade);
  if (childId === 'linas') return 'Linas (1 klasė)';
  if (childId === 'lukas') return 'Lukas (3 klasė)';
  return 'Žaidėjas';
}

export function getGlobalTimeKey(idOrGrade) {
  const childId = normalizeChildId(idOrGrade) || 'linas';
  return GLOBAL_TIME_KEYS[childId];
}

export function formatMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function readChildFallbackForToday(childId, today) {
  try {
    const rawGlobal = localStorage.getItem(GLOBAL_TIME_KEYS[childId]);
    if (rawGlobal) {
      const parsed = JSON.parse(rawGlobal);
      if (parsed && typeof parsed === 'object' && parsed.lastPlayedDate === today) {
        const limit = Math.max(60, Number(parsed.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS);
        const played = Math.max(0, Number(parsed.timePlayedTodaySeconds) || 0);
        return {
          remaining: Math.max(0, limit - played),
          limit
        };
      }
    }

    const rawLegacy = localStorage.getItem(LEGACY_PROFILE_KEYS[childId]);
    if (rawLegacy) {
      const legacyObj = JSON.parse(rawLegacy);
      if (legacyObj && legacyObj.lastPlayedDate === today) {
        const limit = Math.max(60, Number(legacyObj.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS);
        const played = Math.max(0, Number(legacyObj.timePlayedTodaySeconds) || 0);
        return {
          remaining: Math.max(0, limit - played),
          limit
        };
      }
    }
  } catch (e) {
    // Ignoruojame localStorage skaitymo klaidas
  }
  return {
    remaining: DEFAULT_DAILY_TIME_LIMIT_SECONDS,
    limit: DEFAULT_DAILY_TIME_LIMIT_SECONDS
  };
}

function readDailyBucket(today = getTodayDateString()) {
  const dailyKey = getDailyPlaytimeKey(today);
  try {
    const rawDaily = localStorage.getItem(dailyKey);
    if (rawDaily) {
      const parsed = JSON.parse(rawDaily);
      if (parsed && typeof parsed === 'object') {
        const limLinas = Math.max(
          60,
          Number(parsed.limits?.linas) || DEFAULT_DAILY_TIME_LIMIT_SECONDS
        );
        const limLukas = Math.max(
          60,
          Number(parsed.limits?.lukas) || DEFAULT_DAILY_TIME_LIMIT_SECONDS
        );
        const remLinas = Math.max(
          0,
          parsed.linas !== undefined ? Number(parsed.linas) : limLinas
        );
        const remLukas = Math.max(
          0,
          parsed.lukas !== undefined ? Number(parsed.lukas) : limLukas
        );
        return {
          linas: remLinas,
          lukas: remLukas,
          limits: { linas: limLinas, lukas: limLukas }
        };
      }
    }
  } catch (e) {
    // Ignoruojame localStorage klaidas
  }

  const fbLinas = readChildFallbackForToday('linas', today);
  const fbLukas = readChildFallbackForToday('lukas', today);
  const freshBucket = {
    linas: fbLinas.remaining,
    lukas: fbLukas.remaining,
    limits: { linas: fbLinas.limit, lukas: fbLukas.limit }
  };
  try {
    localStorage.setItem(dailyKey, JSON.stringify(freshBucket));
  } catch (e) {
    // Ignoruojame saugojimo klaidas
  }
  return freshBucket;
}

export function loadGlobalPlaytime(idOrGrade) {
  const childId = normalizeChildId(idOrGrade) || 'linas';
  const today = getTodayDateString();
  const bucket = readDailyBucket(today);

  const rawRemaining =
    bucket[childId] !== undefined ? Number(bucket[childId]) : DEFAULT_DAILY_TIME_LIMIT_SECONDS;
  const dailyTimeLimitSeconds = Math.max(
    60,
    Number(bucket.limits?.[childId]) || DEFAULT_DAILY_TIME_LIMIT_SECONDS,
    Number.isFinite(rawRemaining) ? rawRemaining : 0
  );
  const remainingSeconds = Math.max(
    0,
    Math.min(dailyTimeLimitSeconds, Number.isFinite(rawRemaining) ? rawRemaining : dailyTimeLimitSeconds)
  );
  const timePlayedTodaySeconds = Math.max(0, dailyTimeLimitSeconds - remainingSeconds);

  const result = {
    lastPlayedDate: today,
    timePlayedTodaySeconds,
    dailyTimeLimitSeconds,
    remainingSeconds
  };

  // Laikome abu formatus sinchronizuotus: bosas_playtime_YYYY-MM-DD ir bosas_global_time_<vaikas>
  try {
    localStorage.setItem(
      GLOBAL_TIME_KEYS[childId],
      JSON.stringify({
        lastPlayedDate: today,
        timePlayedTodaySeconds,
        dailyTimeLimitSeconds
      })
    );
  } catch (e) {
    // Ignoruojame saugojimo klaidas
  }

  return result;
}

export function saveGlobalPlaytime(idOrGrade, timeData) {
  const childId = normalizeChildId(idOrGrade) || 'linas';
  const today = getTodayDateString();
  const activeDate = timeData?.lastPlayedDate || today;
  const dailyTimeLimitSeconds = Math.max(
    60,
    Number(timeData?.dailyTimeLimitSeconds) || DEFAULT_DAILY_TIME_LIMIT_SECONDS
  );
  const timePlayedTodaySeconds = Math.max(0, Number(timeData?.timePlayedTodaySeconds) || 0);
  const remainingSeconds = Math.max(0, dailyTimeLimitSeconds - timePlayedTodaySeconds);

  const payload = {
    lastPlayedDate: activeDate,
    timePlayedTodaySeconds,
    dailyTimeLimitSeconds
  };

  try {
    localStorage.setItem(GLOBAL_TIME_KEYS[childId], JSON.stringify(payload));
    const bucket = readDailyBucket(activeDate);
    bucket[childId] = remainingSeconds;
    if (!bucket.limits) {
      bucket.limits = {
        linas: DEFAULT_DAILY_TIME_LIMIT_SECONDS,
        lukas: DEFAULT_DAILY_TIME_LIMIT_SECONDS
      };
    }
    bucket.limits[childId] = dailyTimeLimitSeconds;
    localStorage.setItem(getDailyPlaytimeKey(activeDate), JSON.stringify(bucket));
  } catch (e) {
    // Ignoruojame saugojimo klaidas
  }
  return { ...payload, remainingSeconds };
}

export function getRemainingPlaytimeSeconds(idOrGrade) {
  const data = loadGlobalPlaytime(idOrGrade);
  return Math.max(0, data.dailyTimeLimitSeconds - data.timePlayedTodaySeconds);
}

export function setRemainingPlaytimeSeconds(idOrGrade, remainingSeconds) {
  const data = loadGlobalPlaytime(idOrGrade);
  const clampedRem = Math.max(0, Math.round(Number(remainingSeconds) || 0));
  const limit = Math.max(data.dailyTimeLimitSeconds, clampedRem);
  return saveGlobalPlaytime(idOrGrade, {
    lastPlayedDate: data.lastPlayedDate,
    dailyTimeLimitSeconds: limit,
    timePlayedTodaySeconds: Math.max(0, limit - clampedRem)
  });
}

function injectSharedTimerStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('shared-playtime-timer-styles')) return;

  const style = document.createElement('style');
  style.id = 'shared-playtime-timer-styles';
  style.textContent = `
    .spt-top-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 12px;
      border: 2px solid rgba(56, 189, 248, 0.55);
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.92));
      color: #e0f2fe;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.14);
      transition: transform 0.14s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
    }
    .spt-top-badge:hover {
      transform: translateY(-1px);
      border-color: rgba(125, 211, 252, 0.9);
    }
    .spt-top-badge.is-idle {
      opacity: 0.9;
      border-color: rgba(148, 163, 184, 0.4);
      color: #cbd5e1;
    }
    .spt-top-badge.is-low-time {
      border-color: rgba(248, 113, 113, 0.9);
      background: linear-gradient(180deg, rgba(127, 29, 29, 0.92), rgba(69, 10, 10, 0.95));
      color: #fecaca;
      animation: sptLowTimePulse 1.2s ease-in-out infinite;
    }
    .spt-top-badge.is-locked {
      border-color: #ef4444;
      background: #7f1d1d;
      color: #ffffff;
    }
    .spt-top-badge.is-task-paused {
      border-color: rgba(52, 211, 153, 0.78);
      background: linear-gradient(180deg, rgba(6, 78, 59, 0.88), rgba(15, 23, 42, 0.92));
      color: #a7f3d0;
    }
    .spt-top-badge.is-grace-expired {
      border-color: #fb923c;
      background: linear-gradient(180deg, rgba(194, 65, 12, 0.92), rgba(124, 45, 18, 0.94));
      color: #ffedd5;
    }
    .spt-grace-banner {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99990;
      pointer-events: none;
      padding: 10px 22px;
      border-radius: 999px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      border: 2px solid #fed7aa;
      color: #ffffff;
      font-family: 'Fredoka', 'Outfit', system-ui, sans-serif;
      font-size: 0.96rem;
      font-weight: 700;
      box-shadow: 0 12px 28px rgba(234, 88, 12, 0.45);
      max-width: calc(100vw - 24px);
      text-align: center;
    }
    .spt-grace-banner.spt-hidden {
      display: none !important;
    }
    @keyframes sptLowTimePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
      50% { box-shadow: 0 0 16px 3px rgba(239, 68, 68, 0.65); }
    }

    .spt-lock-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(2, 6, 23, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .spt-lock-overlay.spt-hidden {
      display: none !important;
    }
    .spt-lock-card {
      width: 100%;
      max-width: 520px;
      border-radius: 24px;
      padding: 28px 26px;
      background: linear-gradient(160deg, rgba(15, 23, 48, 0.98) 0%, rgba(10, 17, 36, 0.99) 100%);
      border: 2px solid rgba(56, 189, 248, 0.45);
      box-shadow: 0 28px 64px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.16);
      color: #f8fafc;
      text-align: center;
      font-family: 'Outfit', system-ui, sans-serif;
    }
    .spt-lock-card.is-expired {
      border-color: rgba(248, 113, 113, 0.75);
      box-shadow: 0 28px 64px rgba(0, 0, 0, 0.85), 0 0 42px rgba(239, 68, 68, 0.25);
    }
    .spt-lock-icon {
      font-size: 3.1rem;
      line-height: 1;
      margin-bottom: 12px;
    }
    .spt-lock-child-pill {
      display: inline-block;
      margin-bottom: 12px;
      padding: 5px 12px;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.16);
      border: 1px solid rgba(56, 189, 248, 0.45);
      color: #7dd3fc;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .spt-lock-title {
      font-family: 'Fredoka', 'Outfit', system-ui, sans-serif;
      font-size: clamp(1.28rem, 2.8vw, 1.62rem);
      font-weight: 700;
      line-height: 1.3;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .spt-lock-sub {
      font-size: 0.96rem;
      line-height: 1.5;
      color: #cbd5e1;
      margin-bottom: 18px;
    }
    .spt-parent-box {
      text-align: left;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(148, 163, 184, 0.28);
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 18px;
    }
    .spt-parent-label {
      display: block;
      font-size: 0.84rem;
      font-weight: 700;
      color: #fde68a;
      margin-bottom: 8px;
    }
    .spt-parent-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .spt-parent-input {
      flex: 1 1 180px;
      min-width: 0;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1.5px solid rgba(148, 163, 184, 0.4);
      background: #020617;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.94rem;
      outline: none;
    }
    .spt-parent-input:focus {
      border-color: #38bdf8;
    }
    .spt-parent-btn {
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(251, 191, 36, 0.5);
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
    }
    .spt-parent-feedback {
      margin-top: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #fca5a5;
    }
    .spt-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .spt-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 12px 16px;
      border-radius: 13px;
      font-family: 'Fredoka', 'Outfit', system-ui, sans-serif;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }
    .spt-btn-resume {
      background: linear-gradient(135deg, #10b981, #059669);
    }
    .spt-btn-switch {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
    }
    .spt-btn-portal {
      background: rgba(51, 65, 85, 0.9);
    }
    .spt-btn.spt-hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Inicializuoja bendrą 20 min. dienos taimerį žaidime.
 * @param {Object} options
 * @param {string|HTMLElement} [options.containerSelector] - Elementas arba selektorius, į kurį įdedamas viršutinis laikmačio indikatorius
 * @param {string} [options.portalUrl='../../index.html'] - Grįžimo į portalą nuoroda
 * @param {string|null} [options.initialChild=null] - Pradinis žaidėjas ('linas' | 'lukas' | 'grade1' | 'grade3' | null)
 * @param {Function} [options.shouldCount] - Grąžina true, jei šią sekundę reikia skaičiuoti laiką
 * @param {Function} [options.onLock] - Kviečiama, kai laikas baigiasi ir ekranas užrakinamas
 * @param {Function} [options.onUnlock] - Kviečiama, kai tėvai pratęsia laiką
 * @param {Function} [options.onSwitchProfile] - Kviečiama paspaudus „Keisti žaidėją“
 * @param {Function} [options.onTick] - Kviečiama kas sekundę su (remainingSeconds, childId)
 */
export function initPlaytimeTimer(options = {}) {
  injectSharedTimerStyles();

  const portalUrl = options.portalUrl || '../../index.html';
  let activeChild = normalizeChildId(options.initialChild);
  let modalOpen = false;
  let locked = false;
  let activeGameplay = false;
  let graceExpired = false;
  let intervalId = null;
  const taskTracker = createTaskPauseTracker();
  const isAnyTaskPaused = () => taskTracker.isPaused() || globalTaskPauseTracker.isPaused();

  // 1. Viršutinis likusio laiko indikatorius
  let badgeBtn = null;
  const container =
    typeof options.containerSelector === 'string'
      ? document.querySelector(options.containerSelector)
      : options.containerSelector;

  if (container) {
    badgeBtn = document.createElement('button');
    badgeBtn.type = 'button';
    badgeBtn.id = 'shared-playtime-badge';
    badgeBtn.className = 'spt-top-badge is-idle';
    badgeBtn.title = 'Dienos 20 min. žaidimo laikas (spausk norėdamas valdyti)';
    badgeBtn.addEventListener('click', () => {
      if (!activeChild) return;
      const rem = getRemainingPlaytimeSeconds(activeChild);
      openModal(rem <= 0);
    });
    container.appendChild(badgeBtn);
  }

  // 2. Užrakinimo / Tėvų kontrolės modalas
  let overlay = document.getElementById('shared-playtime-lock-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'shared-playtime-lock-modal';
    overlay.className = 'spt-lock-overlay spt-hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'spt-lock-title');
    overlay.innerHTML = `
      <div class="spt-lock-card">
        <div class="spt-lock-icon" aria-hidden="true">⏳</div>
        <div id="spt-lock-child-pill" class="spt-lock-child-pill">Linas (1 klasė)</div>
        <h2 id="spt-lock-title" class="spt-lock-title"></h2>
        <p id="spt-lock-sub" class="spt-lock-sub"></p>

        <div class="spt-parent-box">
          <label for="spt-parent-password" class="spt-parent-label">
            🔐 Tėvų atrakinimas (slaptažodis pratęsimui +10 min.):
          </label>
          <div class="spt-parent-row">
            <input
              type="password"
              id="spt-parent-password"
              class="spt-parent-input"
              placeholder="Tėvų slaptažodis..."
              autocomplete="off"
            />
            <button type="button" id="spt-parent-extend-btn" class="spt-parent-btn">
              ➕ +10 min.
            </button>
          </div>
          <div id="spt-parent-feedback" class="spt-parent-feedback spt-hidden"></div>
        </div>

        <div class="spt-actions">
          <button type="button" id="spt-btn-resume" class="spt-btn spt-btn-resume spt-hidden">
            ▶️ Tęsti žaidimą
          </button>
          <button type="button" id="spt-btn-switch" class="spt-btn spt-btn-switch">
            👤 Keisti žaidėją
          </button>
          <a id="spt-btn-portal" href="${portalUrl}" class="spt-btn spt-btn-portal">
            ← Į portalą
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const cardEl = overlay.querySelector('.spt-lock-card');
  const childPillEl = overlay.querySelector('#spt-lock-child-pill');
  const titleEl = overlay.querySelector('#spt-lock-title');
  const subEl = overlay.querySelector('#spt-lock-sub');
  const passInput = overlay.querySelector('#spt-parent-password');
  const extendBtn = overlay.querySelector('#spt-parent-extend-btn');
  const feedbackEl = overlay.querySelector('#spt-parent-feedback');
  const resumeBtn = overlay.querySelector('#spt-btn-resume');
  const switchBtn = overlay.querySelector('#spt-btn-switch');
  const portalLink = overlay.querySelector('#spt-btn-portal');
  if (portalLink) portalLink.href = portalUrl;

  let graceBanner =
    typeof document !== 'undefined' ? document.getElementById('shared-playtime-grace-banner') : null;
  if (!graceBanner && typeof document !== 'undefined') {
    graceBanner = document.createElement('div');
    graceBanner.id = 'shared-playtime-grace-banner';
    graceBanner.className = 'spt-grace-banner spt-hidden';
    graceBanner.setAttribute('role', 'status');
    graceBanner.textContent = GRACE_BANNER_TEXT;
    document.body.appendChild(graceBanner);
  }

  function updateGraceBanner() {
    if (!graceBanner) return;
    const show = Boolean(activeChild && graceExpired && activeGameplay && !modalOpen);
    graceBanner.classList.toggle('spt-hidden', !show);
  }

  function renderBadge() {
    if (!badgeBtn) return;
    if (!activeChild) {
      badgeBtn.className = 'spt-top-badge is-idle';
      const linasRem = formatMMSS(getRemainingPlaytimeSeconds('linas'));
      const lukasRem = formatMMSS(getRemainingPlaytimeSeconds('lukas'));
      badgeBtn.textContent = `⏳ Linas ${linasRem} • Lukas ${lukasRem}`;
      return;
    }

    const rem = getRemainingPlaytimeSeconds(activeChild);
    const shortName = activeChild === 'linas' ? 'Linas' : 'Lukas';
    badgeBtn.classList.remove(
      'is-idle',
      'is-low-time',
      'is-locked',
      'is-task-paused',
      'is-grace-expired'
    );

    if (isAnyTaskPaused()) {
      badgeBtn.textContent = TASK_PAUSED_LABEL;
      badgeBtn.classList.add('is-task-paused');
      return;
    }

    badgeBtn.textContent = `⏳ ${shortName}: ${formatMMSS(rem)}`;

    if (rem <= 0 && activeGameplay) {
      badgeBtn.classList.add('is-grace-expired');
    } else if (rem <= 0) {
      badgeBtn.classList.add('is-locked');
    } else if (rem < 300) {
      badgeBtn.classList.add('is-low-time');
    }
  }

  function closeModal() {
    if (
      activeChild &&
      getRemainingPlaytimeSeconds(activeChild) <= 0 &&
      !(activeGameplay && graceExpired)
    ) {
      return;
    }
    modalOpen = false;
    locked = false;
    overlay.classList.add('spt-hidden');
    updateGraceBanner();
    renderBadge();
  }

  function openModal(forceExpired = true) {
    if (!activeChild) return;
    const remaining = getRemainingPlaytimeSeconds(activeChild);
    const expired = forceExpired || remaining <= 0;
    const inGraceFinishMode = expired && activeGameplay && graceExpired;

    modalOpen = true;
    locked = expired && !inGraceFinishMode;

    if (passInput) passInput.value = '';
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.classList.add('spt-hidden');
    }

    if (childPillEl) {
      childPillEl.textContent = getChildLabel(activeChild);
    }
    cardEl?.classList.toggle('is-expired', expired);

    if (inGraceFinishMode) {
      if (titleEl) titleEl.textContent = GRACE_BANNER_TEXT;
      if (subEl) {
        subEl.textContent = `${getChildLabel(activeChild)} pasiekė 20 min. ribą lygio metu. Gali užbaigti šį lygį ir Žinių vartus, o tada pailsėti!`;
      }
      if (resumeBtn) {
        resumeBtn.textContent = '▶️ Užbaigti pradėtą lygį';
        resumeBtn.classList.remove('spt-hidden');
      }
    } else if (expired) {
      if (titleEl) titleEl.textContent = LOCKOUT_MESSAGE;
      if (subEl) {
        subEl.textContent = `${getChildLabel(activeChild)} šiandien jau išnaudojo savo 20 minučių žaidimo laiką. Visi tavo pasiekimai yra saugiai išsaugoti!`;
      }
      resumeBtn?.classList.add('spt-hidden');
    } else {
      if (titleEl) {
        titleEl.textContent = `⏳ Liko šiandien: ${formatMMSS(remaining)}`;
      }
      if (subEl) {
        subEl.textContent =
          'Žaidimas pristabdytas. Gali grįžti į žaidimą, pakeisti žaidėją arba grįžti į portalą.';
      }
      if (resumeBtn) {
        resumeBtn.textContent = '▶️ Tęsti žaidimą';
        resumeBtn.classList.remove('spt-hidden');
      }
    }

    overlay.classList.remove('spt-hidden');
    updateGraceBanner();
    renderBadge();

    if (expired && !inGraceFinishMode && typeof options.onLock === 'function') {
      options.onLock(activeChild);
    }
  }

  function handleTimeExpired() {
    if (!activeChild) return;
    if (activeGameplay) {
      graceExpired = true;
      updateGraceBanner();
      renderBadge();
      return;
    }
    graceExpired = false;
    updateGraceBanner();
    if (!modalOpen || !locked) {
      openModal(true);
    }
  }

  function handleExtend() {
    if (!activeChild || !passInput || !feedbackEl) return;
    if (passInput.value.trim() === PARENT_PASSWORD) {
      const data = loadGlobalPlaytime(activeChild);
      data.dailyTimeLimitSeconds =
        Math.max(data.dailyTimeLimitSeconds, data.timePlayedTodaySeconds) + 600;
      saveGlobalPlaytime(activeChild, data);
      passInput.value = '';
      feedbackEl.classList.add('spt-hidden');
      locked = false;
      graceExpired = false;
      closeModal();
      if (typeof options.onUnlock === 'function') {
        options.onUnlock(activeChild);
      }
    } else {
      feedbackEl.textContent = '❌ Neteisingas tėvų slaptažodis!';
      feedbackEl.classList.remove('spt-hidden');
    }
  }

  extendBtn?.addEventListener('click', handleExtend);
  passInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExtend();
    }
  });
  resumeBtn?.addEventListener('click', closeModal);
  switchBtn?.addEventListener('click', () => {
    activeChild = null;
    modalOpen = false;
    locked = false;
    activeGameplay = false;
    graceExpired = false;
    taskTracker.clear();
    overlay.classList.add('spt-hidden');
    updateGraceBanner();
    renderBadge();
    if (typeof options.onSwitchProfile === 'function') {
      options.onSwitchProfile();
    }
  });

  function checkAndTick() {
    if (!activeChild) {
      renderBadge();
      updateGraceBanner();
      return;
    }

    if (isAnyTaskPaused()) {
      renderBadge();
      updateGraceBanner();
      return;
    }

    const data = loadGlobalPlaytime(activeChild);
    if (data.timePlayedTodaySeconds >= data.dailyTimeLimitSeconds) {
      handleTimeExpired();
      return;
    }

    if (graceExpired) {
      graceExpired = false;
      updateGraceBanner();
    }

    if (modalOpen || locked) return;
    if (
      typeof document !== 'undefined' &&
      (document.hidden || document.visibilityState === 'hidden')
    ) {
      return;
    }
    if (typeof options.shouldCount === 'function' && !options.shouldCount()) return;

    data.timePlayedTodaySeconds += 1;
    saveGlobalPlaytime(activeChild, data);

    const remaining = Math.max(0, data.dailyTimeLimitSeconds - data.timePlayedTodaySeconds);
    renderBadge();
    if (typeof options.onTick === 'function') {
      options.onTick(remaining, activeChild);
    }

    if (remaining <= 0) {
      handleTimeExpired();
    }
  }

  function syncFromStorage() {
    renderBadge();
    if (!activeChild) {
      updateGraceBanner();
      return;
    }
    const rem = getRemainingPlaytimeSeconds(activeChild);
    if (rem <= 0 && !locked) {
      handleTimeExpired();
    } else if (rem > 0) {
      graceExpired = false;
      updateGraceBanner();
      if (locked) {
        closeModal();
        if (typeof options.onUnlock === 'function') {
          options.onUnlock(activeChild);
        }
      }
    }
    if (typeof options.onTick === 'function') {
      options.onTick(rem, activeChild);
    }
  }

  const onTaskChange = () => {
    renderBadge();
    updateGraceBanner();
  };
  taskPauseListeners.add(onTaskChange);

  const onStorageSync = (e) => {
    if (
      e.key === null ||
      e.key === GLOBAL_TIME_KEYS.linas ||
      e.key === GLOBAL_TIME_KEYS.lukas ||
      (typeof e.key === 'string' && e.key.startsWith(DAILY_PLAYTIME_KEY_PREFIX))
    ) {
      syncFromStorage();
    }
  };

  const onVisibilityOrFocus = () => {
    if (typeof document !== 'undefined' && !document.hidden) {
      syncFromStorage();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorageSync);
    window.addEventListener('focus', onVisibilityOrFocus);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
  }

  intervalId = setInterval(checkAndTick, 1000);
  renderBadge();

  if (activeChild && getRemainingPlaytimeSeconds(activeChild) <= 0) {
    openModal(true);
  }

  return {
    setActiveChild(idOrGrade) {
      activeChild = normalizeChildId(idOrGrade);
      modalOpen = false;
      locked = false;
      activeGameplay = false;
      graceExpired = false;
      taskTracker.clear();
      overlay.classList.add('spt-hidden');
      updateGraceBanner();
      renderBadge();
      if (activeChild && getRemainingPlaytimeSeconds(activeChild) <= 0) {
        openModal(true);
        return false;
      }
      return true;
    },
    clearActiveChild() {
      activeChild = null;
      modalOpen = false;
      locked = false;
      activeGameplay = false;
      graceExpired = false;
      taskTracker.clear();
      overlay.classList.add('spt-hidden');
      updateGraceBanner();
      renderBadge();
    },
    getActiveChild() {
      return activeChild;
    },
    isLocked() {
      return locked || modalOpen;
    },
    setTaskPaused(isPaused, reason) {
      const state = taskTracker.set(Boolean(isPaused), reason);
      renderBadge();
      updateGraceBanner();
      return state || globalTaskPauseTracker.isPaused();
    },
    pauseForTask(reason) {
      return this.setTaskPaused(true, reason);
    },
    resumeFromTask(reason) {
      return this.setTaskPaused(false, reason);
    },
    isTaskPaused() {
      return isAnyTaskPaused();
    },
    clearTaskPauses() {
      taskTracker.clear();
      renderBadge();
      updateGraceBanner();
    },
    setActiveGameplay(isInLevel) {
      activeGameplay = Boolean(isInLevel);
      if (!activeChild) {
        graceExpired = false;
        updateGraceBanner();
        renderBadge();
        return true;
      }
      const rem = getRemainingPlaytimeSeconds(activeChild);
      if (activeGameplay) {
        if (rem <= 0) {
          graceExpired = true;
        }
        updateGraceBanner();
        renderBadge();
        return !locked;
      }
      graceExpired = false;
      updateGraceBanner();
      if (rem <= 0) {
        openModal(true);
        return false;
      }
      renderBadge();
      return !locked;
    },
    isInActiveGameplay() {
      return activeGameplay;
    },
    isGracePeriodActive() {
      return Boolean(activeChild && activeGameplay && graceExpired);
    },
    checkNow() {
      checkAndTick();
    },
    refreshUI() {
      renderBadge();
      updateGraceBanner();
    },
    openModal(forceExpired = false) {
      openModal(forceExpired);
    },
    destroy() {
      taskPauseListeners.delete(onTaskChange);
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorageSync);
        window.removeEventListener('focus', onVisibilityOrFocus);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      }
    }
  };
}
