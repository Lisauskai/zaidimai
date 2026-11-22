// ==================== BOSAS.EU – NEAPEINAMAS UŽDUOČIŲ SKOLOS VARIKLIS ====================
// Saugo nebaigtas užduočių skolas localStorage (`bosas_edu_debt_v1`) atskirai `linas` ir `lukas`.
// Suderinamas su ES moduliais (`export`) ir pasiekiamas per `window.BosasEduGate`.

import {
  PROFILES,
  normalizeProfile,
  generateTask,
  renderTaskVisual
} from './edu-bank.js?v=20261122a';
import { setTaskPaused } from './playtime-timer.js?v=20261122a';

export const DEBT_STORAGE_KEY = 'bosas_edu_debt_v1';
export const RELOAD_WINDOW_MS = 300000; // 5 minutės
export const MAX_RELOAD_PENALTIES = 3;
export const MISTAKE_PENALTY = 2;

export const RELOAD_PENALTY_MESSAGE =
  'Pabėgti perkrovus puslapį nepavyko! Pridėtas +1 papildomas uždavinys.';
export const MISTAKE_PENALTY_MESSAGE =
  'Neteisingai! Pridedami +2 papildomi uždaviniai.';

const GATE_PAUSE_REASON = 'edu_gate';

// Kad tame pačiame puslapio užkrovime (be realaus F5) pakartotinis patikrinimas neduotų antros baudos
const sessionCheckedProfiles = new Set();

let overlayEl = null;
let keydownHandler = null;
let activeModalState = null;

function getStorage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch (e) {
    // Ignore storage access errors
  }
  return null;
}

function createEmptyDebtBucket() {
  return {
    active: false,
    remaining: 0,
    mistakes: 0,
    title: '',
    currentTask: null,
    recentIds: [],
    reloadPenalties: 0,
    updatedAt: 0
  };
}

function normalizeDebtBucket(raw) {
  const empty = createEmptyDebtBucket();
  if (!raw || typeof raw !== 'object') return empty;
  const remaining = Math.max(0, Math.floor(Number(raw.remaining) || 0));
  const active = Boolean(raw.active) && remaining > 0;
  const recentIds = Array.isArray(raw.recentIds)
    ? raw.recentIds.filter((id) => typeof id === 'string' && id.trim()).slice(-25)
    : [];
  return {
    active,
    remaining: active ? remaining : 0,
    mistakes: Math.max(0, Math.floor(Number(raw.mistakes) || 0)),
    title: typeof raw.title === 'string' ? raw.title : '',
    currentTask: active && raw.currentTask && typeof raw.currentTask === 'object' ? raw.currentTask : null,
    recentIds,
    reloadPenalties: Math.max(0, Math.floor(Number(raw.reloadPenalties) || 0)),
    updatedAt: Number(raw.updatedAt) || 0
  };
}

export function readDebtStore() {
  const def = {
    linas: createEmptyDebtBucket(),
    lukas: createEmptyDebtBucket()
  };
  const storage = getStorage();
  if (!storage) return def;
  try {
    const raw = storage.getItem(DEBT_STORAGE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return {
      linas: normalizeDebtBucket(parsed?.linas),
      lukas: normalizeDebtBucket(parsed?.lukas)
    };
  } catch (e) {
    return def;
  }
}

export function writeDebtStore(store) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DEBT_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    // Ignore quota errors
  }
}

export function getProfileDebt(profileId) {
  const profile = normalizeProfile(profileId);
  const store = readDebtStore();
  return store[profile];
}

export function getDebtSummary(profileId) {
  const debt = getProfileDebt(profileId);
  return {
    active: Boolean(debt.active && debt.remaining > 0),
    remaining: debt.active ? debt.remaining : 0,
    mistakes: debt.mistakes || 0,
    title: debt.title || ''
  };
}

function pushRecentId(recentIds, taskId) {
  const next = Array.isArray(recentIds) ? [...recentIds] : [];
  if (taskId && typeof taskId === 'string') {
    next.push(taskId);
  }
  while (next.length > 25) next.shift();
  return next;
}

function ensureCurrentTask(profile, bucket) {
  if (
    bucket.currentTask &&
    Array.isArray(bucket.currentTask.options) &&
    bucket.currentTask.options.length === 4 &&
    typeof bucket.currentTask.correctIndex === 'number'
  ) {
    return bucket.currentTask;
  }
  const task = generateTask(profile, { recentIds: bucket.recentIds });
  bucket.currentTask = task;
  bucket.recentIds = pushRecentId(bucket.recentIds, task?.id);
  return task;
}

/**
 * Sukuria naują skolą arba tęsia esamą (NENURESETINDAMAS remaining!).
 * Jei puslapis buvo perkrautas su aktyvia skola per 5 min. (< 300000 ms),
 * prideda +1 papildomą uždavinį (maks. 3 kartus per skolą) ir išlaiko TĄ PATĮ currentTask.
 */
export function startOrResumeDebt(profileId, count = 3, title = 'Žinių vartai', options = {}) {
  const profile = normalizeProfile(profileId);
  const now = typeof options.now === 'number' ? options.now : Date.now();
  const store = readDebtStore();
  const bucket = store[profile];
  let reloadPenaltyApplied = false;

  if (bucket.active && bucket.remaining > 0) {
    // Esama skola – NENURESETINAME remaining ir NEKEIČIAME currentTask!
    const isFreshSessionLoad = options.simulateReload === true || !sessionCheckedProfiles.has(profile);
    sessionCheckedProfiles.add(profile);

    if (
      isFreshSessionLoad &&
      bucket.updatedAt > 0 &&
      now - bucket.updatedAt < RELOAD_WINDOW_MS &&
      bucket.reloadPenalties < MAX_RELOAD_PENALTIES
    ) {
      bucket.remaining += 1;
      bucket.reloadPenalties += 1;
      bucket.updatedAt = now;
      reloadPenaltyApplied = true;
    }

    ensureCurrentTask(profile, bucket);
    store[profile] = bucket;
    writeDebtStore(store);

    return {
      resumed: true,
      reloadPenaltyApplied,
      reloadPenaltyMessage: reloadPenaltyApplied ? RELOAD_PENALTY_MESSAGE : '',
      debt: bucket
    };
  }

  // Nauja skola
  const initialCount = Math.max(1, Math.floor(Number(count) || 3));
  const recentIds = Array.isArray(bucket.recentIds) ? bucket.recentIds.slice(-25) : [];
  const firstTask = generateTask(profile, { recentIds });

  const newBucket = {
    active: true,
    remaining: initialCount,
    mistakes: 0,
    title: String(title || 'Žinių vartai').trim(),
    currentTask: firstTask,
    recentIds: pushRecentId(recentIds, firstTask?.id),
    reloadPenalties: 0,
    updatedAt: now
  };

  sessionCheckedProfiles.add(profile);
  store[profile] = newBucket;
  writeDebtStore(store);

  return {
    resumed: false,
    reloadPenaltyApplied: false,
    reloadPenaltyMessage: '',
    debt: newBucket
  };
}

/**
 * Įvertina atsakymą į dabartinį uždavinį ir iškart įrašo atnaujintą būseną į localStorage.
 * - Teisingas: remaining -= 1
 * - Neteisingas: remaining += 2, mistakes += 1
 * Jei dar liko uždavinių, iškart sugeneruoja ir išsaugo kitą currentTask, kad F5 negalėtų jo apeiti.
 */
export function submitDebtAnswer(profileId, selectedIndex, options = {}) {
  const profile = normalizeProfile(profileId);
  const now = typeof options.now === 'number' ? options.now : Date.now();
  const store = readDebtStore();
  const bucket = store[profile];

  if (!bucket.active || bucket.remaining <= 0) {
    return {
      isCorrect: true,
      complete: true,
      remaining: 0,
      mistakes: bucket.mistakes,
      answeredTask: null,
      nextTask: null,
      warning: '',
      explanation: ''
    };
  }

  const answeredTask = ensureCurrentTask(profile, bucket);
  const isCorrect = Number(selectedIndex) === Number(answeredTask.correctIndex);

  if (isCorrect) {
    bucket.remaining = Math.max(0, bucket.remaining - 1);
  } else {
    bucket.remaining += MISTAKE_PENALTY;
    bucket.mistakes += 1;
  }

  const complete = bucket.remaining === 0;
  let nextTask = null;

  if (complete) {
    bucket.active = false;
    bucket.currentTask = null;
    bucket.reloadPenalties = 0;
    bucket.updatedAt = now;
  } else {
    nextTask = generateTask(profile, { recentIds: bucket.recentIds });
    bucket.currentTask = nextTask;
    bucket.recentIds = pushRecentId(bucket.recentIds, nextTask?.id);
    bucket.updatedAt = now;
  }

  store[profile] = bucket;
  writeDebtStore(store);

  return {
    isCorrect,
    complete,
    remaining: bucket.remaining,
    mistakes: bucket.mistakes,
    answeredTask,
    nextTask,
    correctAnswer: answeredTask.options[answeredTask.correctIndex],
    warning: isCorrect ? '' : MISTAKE_PENALTY_MESSAGE,
    explanation: answeredTask.explanation || ''
  };
}

export function resetGateSessionForTest() {
  sessionCheckedProfiles.clear();
}

export function isGateOpen() {
  return Boolean(activeModalState);
}

// ==================== DOM MODALAS (NEUŽDAROMAS) ====================

function ensureModalDOM() {
  if (typeof document === 'undefined') return null;
  if (overlayEl && document.body.contains(overlayEl)) return overlayEl;

  overlayEl = document.createElement('div');
  overlayEl.id = 'bosas-edu-gate-overlay';
  overlayEl.className = 'bosas-edu-gate-overlay is-hidden';
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-modal', 'true');
  overlayEl.setAttribute('aria-labelledby', 'bosas-edu-gate-title');

  // JOKIO × mygtuko ir jokio „Atšaukti“!
  overlayEl.innerHTML = `
    <div class="bosas-edu-gate-card">
      <div class="bosas-edu-gate-header">
        <span class="bosas-edu-gate-badge" data-el="badge">🔐 ŽINIŲ VARTAI</span>
        <span class="bosas-edu-gate-profile" data-el="profile">1 klasė (Linas)</span>
      </div>
      <div class="bosas-edu-gate-pills">
        <span class="bosas-edu-gate-pill is-topic" data-el="topic">Matematika</span>
        <span class="bosas-edu-gate-pill is-remaining" data-el="remaining">Liko: 3 užd.</span>
        <span class="bosas-edu-gate-pill is-mistakes is-hidden" data-el="mistakes">Klaidos: 0</span>
      </div>
      <h2 id="bosas-edu-gate-title" class="bosas-edu-gate-title" data-el="title">Žinių vartai</h2>
      <p class="bosas-edu-gate-subtitle" data-el="subtitle">
        Išspręsk visus uždavinius, kad galėtum tęsti! Kiekviena klaida prideda +2 uždavinius.
      </p>
      <div class="bosas-edu-gate-reload-banner is-hidden" data-el="reloadBanner"></div>
      <div class="bosas-edu-gate-visual is-hidden" data-el="visual"></div>
      <div class="bosas-edu-gate-prompt" data-el="prompt"></div>
      <div class="bosas-edu-gate-options" data-el="options"></div>
      <div class="bosas-edu-gate-feedback is-hidden" data-el="feedback"></div>
      <div class="bosas-edu-gate-explanation is-hidden" data-el="explanation"></div>
      <button type="button" class="bosas-edu-gate-next-btn is-hidden" data-el="nextBtn">
        Kitas uždavinys →
      </button>
    </div>
  `;

  // Paspaudimas už kortelės ribų NIEKO nedaro (neuždaro)
  overlayEl.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.body.appendChild(overlayEl);
  return overlayEl;
}

function attachEscapeBlocker() {
  if (typeof window === 'undefined' || keydownHandler) return;
  keydownHandler = (e) => {
    if (!activeModalState) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  window.addEventListener('keydown', keydownHandler, true);
}

function detachEscapeBlocker() {
  if (typeof window === 'undefined' || !keydownHandler) return;
  window.removeEventListener('keydown', keydownHandler, true);
  keydownHandler = null;
}

function closeGateModalAndFinish() {
  const prevState = activeModalState;
  activeModalState = null;

  if (overlayEl) {
    overlayEl.classList.add('is-hidden');
  }
  detachEscapeBlocker();

  // Atstatome 20 min. taimerį
  setTaskPaused(false, GATE_PAUSE_REASON);

  if (prevState && typeof prevState.onComplete === 'function') {
    const cb = prevState.onComplete;
    cb();
  }
}

function openGateModal(profile, sessionInfo, onComplete) {
  const root = ensureModalDOM();
  if (!root) {
    // Be DOM (pvz., Node.js aplinkoje) nieko nerenderiname
    return;
  }

  // Sustabdome 20 min. taimerį, kol vaikas sprendžia uždavinius
  setTaskPaused(true, GATE_PAUSE_REASON);
  attachEscapeBlocker();

  activeModalState = {
    profile,
    onComplete: typeof onComplete === 'function' ? onComplete : null,
    showReloadBanner: Boolean(sessionInfo.reloadPenaltyApplied),
    reloadBannerText: sessionInfo.reloadPenaltyMessage || ''
  };

  const q = (name) => root.querySelector(`[data-el="${name}"]`);
  const badgeEl = q('badge');
  const profileEl = q('profile');
  const topicEl = q('topic');
  const remainingEl = q('remaining');
  const mistakesEl = q('mistakes');
  const titleEl = q('title');
  const reloadBannerEl = q('reloadBanner');
  const visualEl = q('visual');
  const promptEl = q('prompt');
  const optionsEl = q('options');
  const feedbackEl = q('feedback');
  const explanationEl = q('explanation');
  const nextBtn = q('nextBtn');

  if (profileEl) {
    profileEl.textContent = PROFILES[profile]?.label || profile;
  }

  const renderCurrentStep = () => {
    const debt = getProfileDebt(profile);
    if (!debt.active || debt.remaining <= 0) {
      closeGateModalAndFinish();
      return;
    }

    const task = debt.currentTask || ensureCurrentTask(profile, debt);
    if (badgeEl) {
      badgeEl.textContent = sessionInfo.resumed ? '⚠️ NEBAIGTA UŽDUOČIŲ SKOLA' : '🔐 ŽINIŲ VARTAI';
    }
    if (titleEl) {
      titleEl.textContent = debt.title || 'Žinių vartai';
    }
    if (topicEl) {
      topicEl.textContent = `📚 ${task.topicLabel || 'Užduotis'}`;
    }
    if (remainingEl) {
      remainingEl.textContent = `Liko: ${debt.remaining} užd.`;
    }
    if (mistakesEl) {
      if (debt.mistakes > 0) {
        mistakesEl.textContent = `Klaidos: ${debt.mistakes}`;
        mistakesEl.classList.remove('is-hidden');
      } else {
        mistakesEl.classList.add('is-hidden');
      }
    }

    if (reloadBannerEl) {
      if (activeModalState?.showReloadBanner && activeModalState.reloadBannerText) {
        reloadBannerEl.textContent = `⚠️ ${activeModalState.reloadBannerText}`;
        reloadBannerEl.classList.remove('is-hidden');
      } else {
        reloadBannerEl.classList.add('is-hidden');
      }
    }

    if (visualEl) {
      if (task.visualSpec) {
        renderTaskVisual(visualEl, task.visualSpec);
        visualEl.classList.remove('is-hidden');
      } else {
        visualEl.innerHTML = '';
        visualEl.classList.add('is-hidden');
      }
    }

    if (promptEl) {
      promptEl.textContent = task.prompt;
    }

    if (feedbackEl) {
      feedbackEl.classList.add('is-hidden');
      feedbackEl.classList.remove('is-success', 'is-penalty');
      feedbackEl.textContent = '';
    }
    if (explanationEl) {
      explanationEl.classList.add('is-hidden');
      explanationEl.textContent = '';
    }
    if (nextBtn) {
      nextBtn.classList.add('is-hidden');
      nextBtn.onclick = null;
    }

    if (optionsEl) {
      optionsEl.innerHTML = '';
      let answered = false;

      task.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bosas-edu-gate-opt-btn';
        btn.textContent = String(opt);
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;

          // Perkrovimo pranešimą parodėme vieną kartą, po atsakymo paslepiame
          if (activeModalState) {
            activeModalState.showReloadBanner = false;
          }

          const outcome = submitDebtAnswer(profile, idx);

          optionsEl.querySelectorAll('.bosas-edu-gate-opt-btn').forEach((b, bIdx) => {
            b.disabled = true;
            if (bIdx === task.correctIndex) {
              b.classList.add('is-correct');
            }
          });
          if (!outcome.isCorrect) {
            btn.classList.add('is-wrong');
          }

          if (remainingEl) {
            remainingEl.textContent = `Liko: ${outcome.remaining} užd.`;
          }
          if (mistakesEl && outcome.mistakes > 0) {
            mistakesEl.textContent = `Klaidos: ${outcome.mistakes}`;
            mistakesEl.classList.remove('is-hidden');
          }

          if (feedbackEl) {
            feedbackEl.classList.remove('is-hidden', 'is-success', 'is-penalty');
            if (outcome.isCorrect) {
              feedbackEl.classList.add('is-success');
              feedbackEl.textContent = outcome.complete
                ? '🎉 Šaunuolis! Visi uždaviniai išspręsti!'
                : `✅ Teisingai! Liko dar ${outcome.remaining} užd.`;
            } else {
              feedbackEl.classList.add('is-penalty');
              feedbackEl.textContent = `❌ ${outcome.warning}`;
            }
          }

          if (explanationEl && outcome.explanation) {
            explanationEl.textContent = `💡 Paaiškinimas: ${outcome.explanation}`;
            explanationEl.classList.remove('is-hidden');
          }

          if (nextBtn) {
            nextBtn.textContent = outcome.complete ? 'Tęsti →' : 'Kitas uždavinys →';
            nextBtn.classList.remove('is-hidden');
            nextBtn.onclick = () => {
              if (outcome.complete) {
                closeGateModalAndFinish();
              } else {
                renderCurrentStep();
              }
            };
          }
        });
        optionsEl.appendChild(btn);
      });
    }
  };

  root.classList.remove('is-hidden');
  renderCurrentStep();
}

// ==================== VIEŠOJI API SĄSAJA ŽAIDIMAMS ====================

/**
 * Patikrina, ar vaikas turi nebaigtą skolą iš bet kurio žaidimo,
 * ir jei taip – iškart priverstinai užrakina ekraną su skolos langu.
 */
export function enforcePendingDebt(profileId, onComplete = null, options = {}) {
  const profile = normalizeProfile(profileId);
  const existing = getProfileDebt(profile);
  if (!existing.active || existing.remaining <= 0) {
    return false;
  }
  const sessionInfo = startOrResumeDebt(profile, existing.remaining, existing.title || 'Nebaigta užduočių skola', options);
  openGateModal(profile, sessionInfo, onComplete);
  return true;
}

/**
 * Atidaro neuždaromą vartų langą su `count` užduotimis.
 * Jei skola jau egzistuoja – skaičius NENURESETINAMAS, tęsiama esama skola!
 */
export function requireGate(profileId, count = 3, title = 'Žinių vartai', onComplete = null, options = {}) {
  const profile = normalizeProfile(profileId);
  const sessionInfo = startOrResumeDebt(profile, count, title, options);
  openGateModal(profile, sessionInfo, onComplete);
  return sessionInfo;
}

export const BosasEduGate = Object.freeze({
  DEBT_STORAGE_KEY,
  RELOAD_WINDOW_MS,
  MAX_RELOAD_PENALTIES,
  MISTAKE_PENALTY,
  RELOAD_PENALTY_MESSAGE,
  MISTAKE_PENALTY_MESSAGE,
  enforcePendingDebt,
  requireGate,
  getDebtSummary,
  getProfileDebt,
  startOrResumeDebt,
  submitDebtAnswer,
  isGateOpen,
  resetGateSessionForTest
});

if (typeof window !== 'undefined') {
  window.BosasEduGate = BosasEduGate;
}
if (typeof globalThis !== 'undefined') {
  globalThis.BosasEduGate = BosasEduGate;
}

export default BosasEduGate;
