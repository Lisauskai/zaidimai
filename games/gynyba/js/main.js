// ==================== BUBIŲ TVIRTOVĖ: PAGRINDINIS VALDIKLIS ====================
import {
  initPlaytimeTimer,
  getRemainingPlaytimeSeconds,
  formatMMSS
} from '../../../shared/playtime-timer.js?v=20261121s';
import {
  TOWER_LIST,
  ENEMY_LIST,
  BOSS_LIST,
  TARGETING_PRIORITIES,
  CAMPAIGN_ZONES,
  CAMPAIGN_LEVELS,
  STAR_TECH_CATALOG,
  createDefaultTechTree,
  normalizeTechTree,
  computeSpentTechStars,
  computeAvailableTechStars,
  getLevelById,
  getTowerStats,
  getUpgradeCost,
  getTowerEvolutions,
  computeSellRefund,
  calculateStarsForHearts,
  getProfileModifier,
  buildTaskReviewSummary,
  createKnowledgeGateSession,
  eduTaskGenerator,
  renderTaskVisual
} from './balance.js?v=20261121s';
import { TDEngine } from './engine.js?v=20261121s';
import { audioManager } from './audio.js?v=20261121s';

const SAVE_KEY = 'gynyba_save_v1';
const DEFAULT_ENCOUNTERED_ENEMIES = ['garden_slug', 'rushing_hedgehog', 'armored_beetle'];

function loadSaveData() {
  const createEmpty = () => ({
    stars: 0,
    bestWave: 0,
    unlockedLevels: ['lvl_1'],
    levelStars: {},
    veteranClearedLevels: [],
    techTree: createDefaultTechTree(),
    encounteredEnemies: [...DEFAULT_ENCOUNTERED_ENEMIES]
  });
  const def = { linas: createEmpty(), lukas: createEmpty() };

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);

    const normalizeBucket = (b) => {
      const levelStars = {};
      if (b?.levelStars && typeof b.levelStars === 'object') {
        for (const [k, v] of Object.entries(b.levelStars)) {
          const n = Math.max(0, Math.min(3, Number(v) || 0));
          if (n > 0) levelStars[k] = n;
        }
      }
      // Migracija iš ankstesnių 3 žemėlapių raktų, jei yra
      if (b?.mapStars) {
        if ((Number(b.mapStars.bubiai) || 0) > 0 && !levelStars.lvl_1) {
          levelStars.lvl_1 = Math.min(3, Number(b.mapStars.bubiai));
        }
        if ((Number(b.mapStars.kurtuvenai) || 0) > 0 && !levelStars.lvl_7) {
          levelStars.lvl_7 = Math.min(3, Number(b.mapStars.kurtuvenai));
        }
        if ((Number(b.mapStars.dagilelis) || 0) > 0 && !levelStars.lvl_10) {
          levelStars.lvl_10 = Math.min(3, Number(b.mapStars.dagilelis));
        }
      }

      const unlockedSet = new Set(['lvl_1']);
      if (Array.isArray(b?.unlockedLevels)) {
        b.unlockedLevels.forEach((id) => {
          if (typeof id === 'string') unlockedSet.add(id);
        });
      }

      const veteranSet = new Set();
      if (Array.isArray(b?.veteranClearedLevels)) {
        b.veteranClearedLevels.forEach((id) => {
          if (typeof id === 'string') veteranSet.add(id);
        });
      }

      const encounteredSet = new Set(DEFAULT_ENCOUNTERED_ENEMIES);
      if (Array.isArray(b?.encounteredEnemies)) {
        b.encounteredEnemies.forEach((id) => {
          if (typeof id === 'string') encounteredSet.add(id);
        });
      }

      const levelStarsTotal = Object.values(levelStars).reduce((acc, s) => acc + s, 0);
      const totalStars = levelStarsTotal + veteranSet.size;
      return {
        stars: Math.max(totalStars, Number(b?.stars) || 0),
        bestWave: Math.max(0, Number(b?.bestWave) || 0),
        unlockedLevels: Array.from(unlockedSet),
        levelStars,
        veteranClearedLevels: Array.from(veteranSet),
        techTree: normalizeTechTree(b?.techTree),
        encounteredEnemies: Array.from(encounteredSet)
      };
    };

    return {
      linas: normalizeBucket(parsed?.linas),
      lukas: normalizeBucket(parsed?.lukas)
    };
  } catch (e) {
    return def;
  }
}

function persistSaveData(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignoruojame localStorage klaidas
  }
}

// ==================== DOM NUORODOS ====================
const screenProfiles = document.getElementById('screen-profiles');
const screenCampaign = document.getElementById('screen-campaign');
const screenGame = document.getElementById('screen-game');
const topProfilePill = document.getElementById('top-profile-pill');
const uiActiveProfile = document.getElementById('ui-active-profile');
const btnSwitchProfile = document.getElementById('btn-switch-profile');
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const btnOpenEncyclopedia = document.getElementById('btn-open-encyclopedia');
const btnOpenTechTop = document.getElementById('btn-open-tech-top');
const topAvailStars = document.getElementById('top-avail-stars');
const btnOpenTechTree = document.getElementById('btn-open-tech-tree');
const campaignAvailStars = document.getElementById('campaign-avail-stars');
const btnOpenEncyclopediaCamp = document.getElementById('btn-open-encyclopedia-camp');

const techTreeModal = document.getElementById('tech-tree-modal');
const techAvailStarsEl = document.getElementById('tech-avail-stars');
const btnResetTechStars = document.getElementById('btn-reset-tech-stars');
const techTreeGrid = document.getElementById('tech-tree-grid');

const encyclopediaModal = document.getElementById('encyclopedia-modal');
const encyclopediaContent = document.getElementById('encyclopedia-content');
const btnEncyTabTowers = document.getElementById('btn-ency-tab-towers');
const btnEncyTabEnemies = document.getElementById('btn-ency-tab-enemies');
const btnEncyTabWorld = document.getElementById('btn-ency-tab-world');

const campaignZonesBar = document.getElementById('campaign-zones-bar');
const campaignJourneyMap = document.getElementById('campaign-journey-map');
const campaignZoneRects = document.getElementById('campaign-zone-rects');
const campaignNodesLayer = document.getElementById('campaign-nodes-layer');
const campaignRoadShadow = document.getElementById('campaign-road-shadow');
const campaignRoadLine = document.getElementById('campaign-road-line');
const campaignTotalStars = document.getElementById('campaign-total-stars');
const campaignVeteranCount = document.getElementById('campaign-veteran-count');
const campaignUnlockedCount = document.getElementById('campaign-unlocked-count');
const btnCampTab1 = document.getElementById('btn-camp-tab-1');
const btnCampTab2 = document.getElementById('btn-camp-tab-2');
const btnVeteranToggle = document.getElementById('btn-veteran-toggle');

const knowledgeGateModal = document.getElementById('knowledge-gate-modal');
const kgBadgeEl = document.getElementById('kg-badge');
const kgCategoryBadgeEl = document.getElementById('kg-category-badge');
const kgRemainingPillEl = document.getElementById('kg-remaining-pill');
const kgMistakesPillEl = document.getElementById('kg-mistakes-pill');
const kgVisualCanvas = document.getElementById('kg-visual-canvas');
const kgQuestionEl = document.getElementById('kg-question');
const kgPenaltyBannerEl = document.getElementById('kg-penalty-banner');
const kgOptionsEl = document.getElementById('kg-options');
const kgExplanationBoxEl = document.getElementById('kg-explanation-box');
const kgFeedbackEl = document.getElementById('kg-feedback');
const btnKgNext = document.getElementById('btn-kg-next');
const kgTitleEl = document.getElementById('kg-title');
const kgSubtitleEl = document.getElementById('kg-subtitle');
const btnResultNextLevel = document.getElementById('btn-result-next-level');

const canvasFrame = document.getElementById('canvas-frame');
const canvas = document.getElementById('gynyba-canvas');
const padBuildMenu = document.getElementById('pad-build-menu');
const padBuildOptions = document.getElementById('pad-build-options');
const towerInspectorMenu = document.getElementById('tower-inspector-menu');
const inspectorPriorityGrid = document.getElementById('inspector-priority-grid');
const inspectorEvolutionsBox = document.getElementById('inspector-evolutions-box');
const inspectorEvolutionsGrid = document.getElementById('inspector-evolutions-grid');
const btnRallyPoint = document.getElementById('btn-rally-point');
const wavePreviewCard = document.getElementById('wave-preview-card');
const wavePreviewHeadline = document.getElementById('wave-preview-headline');
const wavePreviewList = document.getElementById('wave-preview-list');
const wavePreviewWarnings = document.getElementById('wave-preview-warnings');
const bossHpBar = document.getElementById('boss-hp-bar');
const bossHpName = document.getElementById('boss-hp-name');
const bossHpPhase = document.getElementById('boss-hp-phase');
const bossHpNumbers = document.getElementById('boss-hp-numbers');
const bossHpFill = document.getElementById('boss-hp-fill');
const bonusZoneTooltip = document.getElementById('bonus-zone-tooltip');
const resultOverlay = document.getElementById('battle-result-overlay');

const btnSpeedToggle = document.getElementById('btn-speed-toggle');
const btnPauseToggle = document.getElementById('btn-pause-toggle');
const btnCallWave = document.getElementById('btn-call-wave');
const uiCallWaveLabel = document.getElementById('ui-call-wave-label');
const uiEarlyWaveBonus = document.getElementById('ui-early-wave-bonus');
const btnUpgradeTower = document.getElementById('btn-upgrade-tower');
const btnSmartUpgrade = document.getElementById('btn-smart-upgrade');
const btnSellTower = document.getElementById('btn-sell-tower');

function reportBootError(errOrMessage) {
  const banner = typeof document !== 'undefined' ? document.getElementById('boot-error-banner') : null;
  const text = errOrMessage instanceof Error
    ? `${errOrMessage.name}: ${errOrMessage.message}`
    : String(errOrMessage || 'Nežinoma paleidimo klaida');
  if (typeof console !== 'undefined' && console.error) {
    console.error('[Bubių Tvirtovė Boot Error]', errOrMessage);
  }
  if (banner) {
    banner.textContent = `⚠️ Žaidimo paleidimo klaida: ${text}. Pabandyk perkrauti puslapį (Ctrl+F5).`;
    banner.classList.remove('hidden');
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('error', (event) => {
    reportBootError(event?.error || event?.message || 'Klaida skripte');
  });
  window.addEventListener('unhandledrejection', (event) => {
    reportBootError(event?.reason || 'Neapdorota asinchroninė klaida');
  });
}

let saveData = loadSaveData();
let activeProfile = null;
let lastFrameTimestamp = 0;
let pendingGateLevelId = null;
let activeGateMode = null; // 'pre_level' | 'post_level' | 'smart_upgrade' | null
let pendingVictoryReward = null;
let kgNextAction = null;
let victoryGateTimeoutId = null;
let smartUpgradeRestorePause = null;

let encyActiveTab = 'towers';
let activeCampaignAct = 'act1';
let veteranModeSelected = false;
let modalRestorePause = null;
let engine = null;

function recordEnemyEncounter(enemyId) {
  if (!activeProfile || !enemyId) return;
  const bucket = saveData[activeProfile];
  if (!bucket) return;
  if (!bucket.encounteredEnemies.includes(enemyId)) {
    bucket.encounteredEnemies.push(enemyId);
    persistSaveData(saveData);
  }
}

engine = new TDEngine(canvas, {
  onStateChange: () => syncBattleUI(),
  onSelectionChange: () => syncSelectionUI(),
  onBonusZoneChange: (zone) => renderBonusZoneTooltip(zone),
  onWavePreviewChange: (preview) => renderWavePreviewCard(preview),
  onGameResult: (result) => handleGameResult(result),
  onEnemyEncountered: (enemyId) => recordEnemyEncounter(enemyId)
});
syncBattleUI();
syncSelectionUI();

function isInBattleView() {
  return Boolean(screenGame && !screenGame.classList.contains('hidden'));
}

const playtimeTimer = initPlaytimeTimer({
  containerSelector: '#top-playtime-slot',
  portalUrl: '../../index.html',
  shouldCount: () => Boolean(activeProfile) && (!isInBattleView() || !engine.isPaused()),
  onSwitchProfile: () => showProfileScreen(),
  onLock: () => {
    engine.setExternalLocked(true);
    closePadMenus();
  },
  onUnlock: () => {
    engine.setExternalLocked(false);
  },
  onTick: () => updateProfileCards()
});

function updateProfileCards() {
  const linasTimeEl = document.getElementById('linas-time-left');
  const lukasTimeEl = document.getElementById('lukas-time-left');
  const linasStatsEl = document.getElementById('linas-save-stats');
  const lukasStatsEl = document.getElementById('lukas-save-stats');

  if (linasTimeEl) {
    const rem1 = getRemainingPlaytimeSeconds('linas');
    linasTimeEl.textContent = formatMMSS(rem1);
    linasTimeEl.style.color = rem1 > 0 ? '#7dd3fc' : '#f87171';
  }
  if (lukasTimeEl) {
    const rem3 = getRemainingPlaytimeSeconds('lukas');
    lukasTimeEl.textContent = formatMMSS(rem3);
    lukasTimeEl.style.color = rem3 > 0 ? '#7dd3fc' : '#f87171';
  }
  if (linasStatsEl) {
    linasStatsEl.textContent = `⭐ ${saveData.linas.stars} • Banga ${saveData.linas.bestWave}`;
  }
  if (lukasStatsEl) {
    lukasStatsEl.textContent = `⭐ ${saveData.lukas.stars} • Banga ${saveData.lukas.bestWave}`;
  }
}

function positionFloatingMenu(menuEl, padX, padY) {
  if (!menuEl || !canvasFrame || !canvas) return;
  const frameRect = canvasFrame.getBoundingClientRect();
  if (!frameRect.width) return;

  const scaleX = frameRect.width / canvas.width;
  const scaleY = frameRect.height / canvas.height;
  const px = padX * scaleX;
  const py = padY * scaleY;

  const menuRect = menuEl.getBoundingClientRect();
  const menuW = menuRect.width || menuEl.offsetWidth || 320;
  const menuH = menuRect.height || menuEl.offsetHeight || 240;

  let left = px + 26;
  if (left + menuW > frameRect.width - 10) {
    left = px - menuW - 26;
  }
  left = Math.max(10, Math.min(frameRect.width - menuW - 10, left));

  let top = py - menuH / 2;
  if (top + menuH > frameRect.height - 10) {
    top = frameRect.height - menuH - 10;
  }
  top = Math.max(10, Math.min(frameRect.height - menuH - 10, top));

  menuEl.style.left = `${Math.round(left)}px`;
  menuEl.style.top = `${Math.round(top)}px`;
}

function closePadMenus() {
  padBuildMenu?.classList.add('hidden');
  towerInspectorMenu?.classList.add('hidden');
}

function renderBonusZoneTooltip(zone) {
  if (!bonusZoneTooltip || !canvasFrame || !canvas) return;
  if (!zone) {
    bonusZoneTooltip.classList.add('hidden');
    return;
  }

  const claimedNote = zone.kind === 'gold' && zone.claimed ? ' (Jau paimta šioje kovoje ✓)' : '';
  bonusZoneTooltip.innerHTML = '';
  const titleDiv = document.createElement('div');
  titleDiv.className = 'bonus-zone-tooltip-title';
  titleDiv.textContent = `${zone.title}${claimedNote}`;
  const descDiv = document.createElement('div');
  descDiv.className = 'bonus-zone-tooltip-desc';
  descDiv.textContent = zone.description;
  bonusZoneTooltip.appendChild(titleDiv);
  bonusZoneTooltip.appendChild(descDiv);
  bonusZoneTooltip.classList.remove('hidden');

  const frameRect = canvasFrame.getBoundingClientRect();
  if (frameRect.width) {
    const scaleX = frameRect.width / canvas.width;
    const scaleY = frameRect.height / canvas.height;
    const px = zone.x * scaleX;
    const py = zone.y * scaleY;
    const tipW = 248;
    const tipH = 78;
    const left = Math.max(10, Math.min(frameRect.width - tipW - 10, px - tipW / 2));
    const top = py > tipH + 28 ? py - tipH - 22 : Math.min(frameRect.height - tipH - 10, py + 32);
    bonusZoneTooltip.style.left = `${Math.round(left)}px`;
    bonusZoneTooltip.style.top = `${Math.round(top)}px`;
  }
}

function renderWavePreviewCard(preview) {
  if (!wavePreviewCard || !wavePreviewHeadline || !wavePreviewList) return;
  if (!preview || !preview.groups || preview.groups.length === 0) {
    wavePreviewCard.classList.add('hidden');
    return;
  }

  wavePreviewHeadline.textContent = preview.headline;
  if (wavePreviewWarnings) {
    const warnings = Array.isArray(preview.warnings) ? preview.warnings : [];
    wavePreviewWarnings.innerHTML = '';
    if (warnings.length > 0) {
      warnings.forEach((warnText) => {
        const pill = document.createElement('span');
        pill.className = 'wave-warn-pill';
        pill.textContent = warnText;
        wavePreviewWarnings.appendChild(pill);
      });
      wavePreviewWarnings.classList.remove('hidden');
    } else {
      wavePreviewWarnings.classList.add('hidden');
    }
  }
  wavePreviewList.innerHTML = '';

  preview.groups.forEach((g) => {
    const row = document.createElement('div');
    row.className = 'wave-preview-row';

    const top = document.createElement('div');
    top.className = 'wave-preview-row-top';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${g.icon} ${g.name}`;
    const countSpan = document.createElement('span');
    countSpan.className = 'wave-preview-count';
    countSpan.textContent = `×${g.count}`;
    top.appendChild(nameSpan);
    top.appendChild(countSpan);

    const tip = document.createElement('div');
    tip.className = 'wave-preview-tip';
    tip.textContent = g.counterTip || '';

    row.appendChild(top);
    if (g.counterTip) row.appendChild(tip);
    wavePreviewList.appendChild(row);
  });

  wavePreviewCard.classList.remove('hidden');
}

function syncBuildMenuAffordability() {
  if (!padBuildOptions || padBuildMenu?.classList.contains('hidden')) return;
  padBuildOptions.querySelectorAll('.build-option-btn').forEach((btn) => {
    const cost = Number(btn.dataset.cost) || 0;
    btn.disabled = engine.coins < cost;
  });
}

function renderPadBuildMenu(pad) {
  if (!padBuildMenu || !padBuildOptions) return;
  padBuildOptions.innerHTML = '';

  TOWER_LIST.forEach((towerDef) => {
    const stats = getTowerStats(towerDef.id, 1);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'build-option-btn';
    btn.dataset.towerId = towerDef.id;
    btn.dataset.cost = String(stats.cost);
    btn.disabled = engine.coins < stats.cost;
    btn.title = `${towerDef.name}: ${towerDef.desc}`;
    btn.innerHTML = `
      <span class="build-option-icon">${towerDef.icon}</span>
      <span class="build-option-name">${towerDef.shortName}</span>
      <span class="build-option-meta">${stats.cost} 🪙 • R:${stats.range}</span>
    `;

    btn.addEventListener('pointerenter', () => {
      engine.setPreviewTowerType(towerDef.id);
    });
    btn.addEventListener('focus', () => {
      engine.setPreviewTowerType(towerDef.id);
    });
    btn.addEventListener('click', () => {
      engine.setPreviewTowerType(towerDef.id);
      if (engine.buildTowerOnSelectedPad(towerDef.id)) {
        closePadMenus();
      }
    });

    padBuildOptions.appendChild(btn);
  });

  towerInspectorMenu?.classList.add('hidden');
  padBuildMenu.classList.remove('hidden');
  positionFloatingMenu(padBuildMenu, pad.x, pad.y);
}

function formatTowerStatsLine(tower, stats) {
  const effRange = tower.effectiveRange || stats.range;
  const parts = [];
  if (tower.type === 'solar_laser') {
    parts.push(`DPS: ${stats.dps} (iki ${(stats.dps * (stats.maxRamp || 2.5)).toFixed(0)})`);
    parts.push(`Šarvų kirtimas: ${Math.round((stats.armorPierce || 0) * 100)}%`);
  } else if (tower.type === 'mower_barracks') {
    parts.push(`Robotai: ${stats.unitCount}`);
    parts.push(`HP: ${stats.unitMaxHp}`);
    parts.push(`Žala/s: ${stats.unitDps}`);
  } else if (tower.type === 'solar_station') {
    parts.push(`Pajamos: +${stats.incomeAmount} 🪙 / ${stats.incomeInterval}s`);
    parts.push(`Aura: +${Math.round((stats.auraRangeBonus || 0.12) * 100)}% nuotolio`);
  } else {
    parts.push(`Žala: ${stats.damage}`);
    parts.push(`Greitis: ${stats.cooldown.toFixed(2)}s`);
    if (stats.slowPercentage) {
      parts.push(`Sulėtina: ${Math.round(stats.slowPercentage * 100)}%`);
    }
    if (tower.type === 'dagilelis_sound' && stats.auraFireRateBonus) {
      parts.push(`Aura: +${Math.round(stats.auraFireRateBonus * 100)}% greičio`);
    }
  }
  parts.push(`Nuotolis: ${effRange}`);
  return parts.join(' • ');
}

function syncSmartUpgradeButton(tower) {
  if (!btnSmartUpgrade) return;
  if (!tower || tower.level >= 3) {
    btnSmartUpgrade.classList.add('hidden');
    return;
  }
  btnSmartUpgrade.classList.remove('hidden');
  if (!engine.smartUpgradeUsedInWave) {
    btnSmartUpgrade.disabled = false;
    btnSmartUpgrade.textContent = '🧠 Nemokamas patobulinimas (1 užd.)';
  } else {
    btnSmartUpgrade.disabled = true;
    btnSmartUpgrade.textContent = '🧠 Išnaudota šią bangą';
  }
}

function renderTowerInspectorMenu(pad, tower) {
  if (!towerInspectorMenu || !inspectorPriorityGrid) return;
  const stats = getTowerStats(tower.type, tower.level, tower.evolutionId);
  const titleEl = document.getElementById('inspector-tower-title');
  const statsEl = document.getElementById('inspector-tower-stats');

  if (titleEl) {
    const icon = tower.evolutionId ? stats.evolutionIcon : stats.icon;
    const name = tower.evolutionId ? stats.evolutionName : stats.name;
    titleEl.textContent =
      tower.level === 4 ? `${icon} ${name} (Tier 4)` : `${icon} ${name} • Lyg. ${tower.level}/3`;
  }
  if (statsEl) {
    statsEl.textContent = formatTowerStatsLine(tower, stats);
  }

  inspectorPriorityGrid.innerHTML = '';
  TARGETING_PRIORITIES.forEach((prio) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `priority-btn${tower.priority === prio.id ? ' active' : ''}`;
    btn.title = prio.desc;
    btn.textContent = `${prio.icon} ${prio.label}`;
    btn.addEventListener('click', () => {
      engine.setTowerPriority(tower.padIndex, prio.id);
    });
    inspectorPriorityGrid.appendChild(btn);
  });

  // 4-ojo lygio šakotos evoliucijos (rodomos pasiekus 3 lygį)
  if (inspectorEvolutionsBox && inspectorEvolutionsGrid) {
    if (tower.level === 3 && !tower.evolutionId) {
      const evos = getTowerEvolutions(tower.type);
      inspectorEvolutionsGrid.innerHTML = '';
      evos.forEach((evo) => {
        const evoBtn = document.createElement('button');
        evoBtn.type = 'button';
        evoBtn.className = 'evo-btn';
        evoBtn.dataset.cost = String(evo.cost);
        evoBtn.disabled = engine.coins < evo.cost;
        evoBtn.innerHTML = `
          <span class="evo-title">${evo.icon} ${evo.name}</span>
          <span class="evo-cost">${evo.cost} 🪙</span>
          <span class="evo-desc">${evo.desc}</span>
        `;
        evoBtn.addEventListener('click', () => {
          engine.evolveTower(tower.padIndex, evo.id);
        });
        inspectorEvolutionsGrid.appendChild(evoBtn);
      });
      inspectorEvolutionsBox.classList.remove('hidden');
    } else {
      inspectorEvolutionsBox.classList.add('hidden');
      inspectorEvolutionsGrid.innerHTML = '';
    }
  }

  // Barakų Rally Point perkėlimo mygtukas
  if (btnRallyPoint) {
    btnRallyPoint.classList.toggle('hidden', tower.type !== 'mower_barracks');
  }

  const upgradeCost = getUpgradeCost(tower.type, tower.level);
  if (btnUpgradeTower) {
    if (tower.level >= 4) {
      btnUpgradeTower.textContent = '✦ Tier 4 Evoliucija';
      btnUpgradeTower.disabled = true;
    } else if (upgradeCost === null) {
      btnUpgradeTower.textContent = '✨ Rinkis evoliuciją';
      btnUpgradeTower.disabled = true;
    } else {
      btnUpgradeTower.textContent = `⬆️ Tobulinti (${upgradeCost} 🪙)`;
      btnUpgradeTower.disabled = engine.coins < upgradeCost;
    }
  }

  syncSmartUpgradeButton(tower);

  if (btnSellTower) {
    const refund = computeSellRefund(tower.totalInvested);
    btnSellTower.textContent = `💰 Parduoti (+${refund} 🪙)`;
  }

  padBuildMenu?.classList.add('hidden');
  towerInspectorMenu.classList.remove('hidden');
  positionFloatingMenu(towerInspectorMenu, pad.x, pad.y);
}

function syncSelectionUI() {
  if (!engine) return;
  if (engine.placingRallyPadIndex !== null) {
    closePadMenus();
    return;
  }
  if (engine.selectedPadIndex === null) {
    closePadMenus();
    return;
  }
  const pad = engine.map.pads[engine.selectedPadIndex];
  if (!pad) {
    closePadMenus();
    return;
  }
  const tower = engine.getTowerAtPad(engine.selectedPadIndex);
  if (tower) {
    renderTowerInspectorMenu(pad, tower);
  } else {
    renderPadBuildMenu(pad);
  }
}

function syncBossHpBarUI() {
  if (!bossHpBar) return;
  const bosses = activeProfile && isInBattleView() ? (engine?.getActiveBosses?.() || []) : [];
  if (bosses.length === 0) {
    bossHpBar.classList.add('hidden');
    bossHpBar.classList.remove('is-phase-2');
    return;
  }

  bossHpBar.classList.remove('hidden');
  const anyPhase2 = bosses.some((b) => b.phase === 2 || Boolean(b.phase2Triggered));
  bossHpBar.classList.toggle('is-phase-2', anyPhase2);

  if (bossHpName) {
    bossHpName.textContent = bosses.map((b) => `${b.icon || '👑'} ${b.name}`).join(' + ');
  }
  if (bossHpPhase) {
    const anyPhaseShield = bosses.some((b) => (b.phase2ShieldTimer || 0) > 0);
    const shiftBoss = bosses.find((b) => b.shieldShiftMode);
    let label = anyPhase2 ? '⚡ 2 FAZĖ' : '1 FAZĖ';
    if (shiftBoss) {
      label += shiftBoss.shieldShiftMode === 'mirror' ? ' • 🪞 VEIDRODIS' : ' • 🛡️ ŠARVAI';
    }
    if (anyPhaseShield) {
      label += ' • 🛡️ SKYDAS';
    }
    bossHpPhase.textContent = label;
  }

  const totalHp = bosses.reduce((sum, b) => sum + Math.max(0, Math.ceil(b.hp)), 0);
  const totalMaxHp = Math.max(1, bosses.reduce((sum, b) => sum + Math.max(1, Math.ceil(b.maxHp)), 0));
  const totalShield = bosses.reduce((sum, b) => sum + Math.max(0, Math.ceil(b.shield || 0)), 0);

  if (bossHpNumbers) {
    bossHpNumbers.textContent = totalShield > 0
      ? `${totalHp} + 🛡️${totalShield} / ${totalMaxHp}`
      : `${totalHp} / ${totalMaxHp}`;
  }
  if (bossHpFill) {
    const pct = Math.max(0, Math.min(100, (totalHp / totalMaxHp) * 100));
    bossHpFill.style.width = `${pct.toFixed(1)}%`;
  }
}

function syncBattleUI() {
  if (!engine) return;
  syncBossHpBarUI();
  const heartsEl = document.getElementById('hud-hearts');
  const maxHeartsEl = document.getElementById('hud-max-hearts');
  const starsPreviewEl = document.getElementById('hud-stars-preview');
  const coinsEl = document.getElementById('hud-coins');
  const waveEl = document.getElementById('hud-wave');

  if (heartsEl) heartsEl.textContent = String(engine.hearts);
  if (maxHeartsEl) maxHeartsEl.textContent = String(engine.maxHearts || 20);
  if (starsPreviewEl) {
    if (engine.veteranMode) {
      starsPreviewEl.textContent = '🔥 👑';
    } else {
      const stars = calculateStarsForHearts(engine.hearts);
      starsPreviewEl.textContent = stars > 0 ? '⭐'.repeat(stars) : '💔';
    }
  }
  if (coinsEl) coinsEl.textContent = String(engine.coins);
  if (waveEl) waveEl.textContent = `${engine.wave} / ${engine.map.maxWaves}`;

  if (btnSpeedToggle) {
    btnSpeedToggle.textContent = `⏩ ${engine.speedMultiplier}x`;
    btnSpeedToggle.classList.toggle('is-active', engine.speedMultiplier === 2);
  }
  if (btnPauseToggle) {
    btnPauseToggle.textContent = engine.manualPaused ? '▶️ Tęsti' : '⏸ Pauzė';
    btnPauseToggle.classList.toggle('is-active', engine.manualPaused);
  }

  if (btnCallWave && uiCallWaveLabel && uiEarlyWaveBonus) {
    const canCall = engine.canCallWaveEarly();
    btnCallWave.disabled = !canCall;
    btnCallWave.title = engine.nextWavePreview?.headline || 'Kviesti kitą bangą';

    if (engine.wave >= engine.map.maxWaves) {
      uiCallWaveLabel.textContent = engine.gameResult ? '🏁 Kova baigta' : `⚔️ Paskutinė banga (${engine.wave}/${engine.map.maxWaves})`;
      uiEarlyWaveBonus.classList.add('hidden');
    } else if (engine.wave === 0) {
      uiCallWaveLabel.textContent = '🌊 Pradėti 1-ąją bangą!';
      uiEarlyWaveBonus.classList.add('hidden');
    } else if (canCall) {
      const nextWave = engine.wave + 1;
      const bonus = engine.getEarlyWaveBonusCoins();
      const secText = engine.interWaveTimer > 0 ? ` (${Math.ceil(engine.interWaveTimer)}s)` : '';
      uiCallWaveLabel.textContent = `🔔 Kviesti ${nextWave}-ąją bangą${secText}`;
      if (bonus > 0) {
        uiEarlyWaveBonus.textContent = `+${bonus} 🪙`;
        uiEarlyWaveBonus.classList.remove('hidden');
      } else {
        uiEarlyWaveBonus.classList.add('hidden');
      }
    } else {
      uiCallWaveLabel.textContent = `⚔️ Vyksta ${engine.wave}/${engine.map.maxWaves} banga...`;
      uiEarlyWaveBonus.classList.add('hidden');
    }
  }

  // Jei atidarytas statybos ar inspektoriaus langas – atnaujiname įperkamumo būseną
  syncBuildMenuAffordability();
  if (towerInspectorMenu && !towerInspectorMenu.classList.contains('hidden') && engine.selectedPadIndex !== null) {
    const t = engine.getTowerAtPad(engine.selectedPadIndex);
    if (t && btnUpgradeTower) {
      const upCost = getUpgradeCost(t.type, t.level);
      btnUpgradeTower.disabled = t.level >= 3 || upCost === null || engine.coins < upCost;
    }
    syncSmartUpgradeButton(t);
    if (inspectorEvolutionsGrid && !inspectorEvolutionsBox?.classList.contains('hidden')) {
      inspectorEvolutionsGrid.querySelectorAll('.evo-btn').forEach((evoBtn) => {
        const c = Number(evoBtn.dataset.cost) || 0;
        evoBtn.disabled = engine.coins < c;
      });
    }
  }

  // Išsaugome pasiektą geriausią bangą
  if (activeProfile && engine.wave > (saveData[activeProfile]?.bestWave || 0)) {
    saveData[activeProfile].bestWave = engine.wave;
    persistSaveData(saveData);
    updateProfileCards();
  }
}

function hideKgNextButton() {
  kgNextAction = null;
  btnKgNext?.classList.add('hidden');
}

function showKgNextButton(label, onNext) {
  kgNextAction = typeof onNext === 'function' ? onNext : null;
  if (!btnKgNext) return;
  btnKgNext.textContent = label || 'Kitas uždavinys →';
  btnKgNext.classList.remove('hidden');
}

function clearEduModalTimers(restorePause = true) {
  hideKgNextButton();
  activeGateMode = null;
  if (victoryGateTimeoutId) {
    clearTimeout(victoryGateTimeoutId);
    victoryGateTimeoutId = null;
  }
  playtimeTimer?.setTaskPaused(false, 'pre_level_gate');
  playtimeTimer?.setTaskPaused(false, 'post_level_gate');
  playtimeTimer?.setTaskPaused(false, 'knowledge_gate');
  playtimeTimer?.setTaskPaused(false, 'smart_upgrade');
  if (restorePause && smartUpgradeRestorePause !== null) {
    engine.setPaused(smartUpgradeRestorePause);
    smartUpgradeRestorePause = null;
  }
}

function commitPendingVictoryReward(reward) {
  if (!reward || reward.claimed || !activeProfile) return;
  reward.claimed = true;

  const bucket = saveData[activeProfile];
  let newlyClearedVeteran = false;
  if (bucket) {
    if (!Array.isArray(bucket.veteranClearedLevels)) bucket.veteranClearedLevels = [];
    if (reward.isVeteran) {
      if (!bucket.veteranClearedLevels.includes(reward.mapId)) {
        bucket.veteranClearedLevels.push(reward.mapId);
        newlyClearedVeteran = true;
      }
    } else {
      bucket.levelStars[reward.mapId] = Math.max(bucket.levelStars[reward.mapId] || 0, reward.stars);
    }
    if (reward.nextLvlId && !bucket.unlockedLevels.includes(reward.nextLvlId)) {
      bucket.unlockedLevels.push(reward.nextLvlId);
    }
    const levelStarsSum = Object.values(bucket.levelStars).reduce((acc, s) => acc + s, 0);
    bucket.stars = levelStarsSum + bucket.veteranClearedLevels.length;
    bucket.bestWave = Math.max(bucket.bestWave || 0, reward.wave);
    persistSaveData(saveData);
    updateProfileCards();
    syncTechStarsUI();
    renderCampaignMap();
  }

  const descEl = document.getElementById('result-desc');
  if (descEl) {
    descEl.textContent = reward.isVeteran
      ? `Žvaigždutės išsaugotos! Atlaikei su ${reward.hearts} / ${reward.maxHearts || 10} širdelių (+35% priešų HP)!${
          newlyClearedVeteran
            ? ' Užsidėta auksinė karūnėlė 👑 ir pridėta +1 ⭐ Išradimų Medžiui!'
            : ' Auksinė karūnėlė 👑 apginta dar kartą!'
        }`
      : `Žvaigždutės išsaugotos! Išsaugojai ${reward.hearts} / ${reward.maxHearts || 20} širdelių ir pelnei ${reward.stars} žvaigždutę(-es)!`;
  }

  const nextLvl = reward.nextLvlId ? getLevelById(reward.nextLvlId) : null;
  if (btnResultNextLevel && nextLvl) {
    btnResultNextLevel.textContent = `▶️ Kitas lygis (${nextLvl.levelNumber}) →`;
    btnResultNextLevel.dataset.nextLevelId = nextLvl.id;
    btnResultNextLevel.classList.remove('hidden');
  } else {
    btnResultNextLevel?.classList.add('hidden');
  }
}

function handleGameResult(result) {
  if (!result || !resultOverlay) return;
  clearEduModalTimers(true);
  knowledgeGateModal?.classList.add('hidden');
  closePadMenus();

  const iconEl = document.getElementById('result-icon');
  const titleEl = document.getElementById('result-title');
  const starsEl = document.getElementById('result-stars');
  const descEl = document.getElementById('result-desc');
  const currentLvl = getLevelById(engine.mapId);
  const nextLvl =
    currentLvl.levelNumber < CAMPAIGN_LEVELS.length
      ? getLevelById(currentLvl.levelNumber + 1)
      : null;

  if (result.status === 'victory') {
    const isVeteran = Boolean(result.veteranMode || engine.veteranMode);
    pendingVictoryReward = {
      mapId: engine.mapId,
      stars: result.stars,
      wave: result.wave,
      hearts: result.hearts,
      maxHearts: engine.maxHearts || (isVeteran ? 10 : 20),
      isVeteran,
      nextLvlId: nextLvl ? nextLvl.id : null,
      claimed: false
    };

    if (iconEl) iconEl.textContent = isVeteran ? '👑' : '🏆';
    if (titleEl) {
      titleEl.textContent = isVeteran
        ? `${engine.map.title} – VETERANO PERGALĖ!`
        : `${engine.map.title} APGINTAS!`;
    }
    if (starsEl) {
      starsEl.textContent = isVeteran
        ? '👑🔥👑'
        : '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
    }
    if (descEl) {
      descEl.textContent = `Puikiai apgynei tvirtovę (${result.hearts} ❤️)! Po 2 sek. atsidarys Pergalės vartai (3 užd.), kad išsaugotum žvaigždutes${
        nextLvl ? ` ir atrakintum ${nextLvl.levelNumber}-ąjį lygį` : ''
      }!`;
    }

    if (btnResultNextLevel) {
      btnResultNextLevel.textContent = '🔐 Pergalės vartai (3 užd.) →';
      btnResultNextLevel.dataset.nextLevelId = nextLvl ? nextLvl.id : '';
      btnResultNextLevel.classList.remove('hidden');
    }

    const rewardSnapshot = pendingVictoryReward;
    victoryGateTimeoutId = setTimeout(() => {
      victoryGateTimeoutId = null;
      if (!activeProfile || !isInBattleView() || resultOverlay?.classList.contains('hidden')) return;
      if (!rewardSnapshot.claimed) {
        openKnowledgeGateModal({ mode: 'post_level', reward: rewardSnapshot });
      }
    }, 2000);
  } else {
    pendingVictoryReward = null;
    if (iconEl) iconEl.textContent = '💔';
    if (titleEl) titleEl.textContent = 'TVIRTOVĖ NEATLAIKĖ!';
    if (starsEl) starsEl.textContent = '☆☆☆';
    if (descEl) {
      descEl.textContent = `Pasiekei ${result.wave}-ąją bangą. Pakeisk bokštelių taikymo prioritetus arba statyk prie sankirtos ir bandyk dar kartą!`;
    }
    btnResultNextLevel?.classList.add('hidden');
  }

  resultOverlay.classList.remove('hidden');

  if (result.status !== 'victory') {
    playtimeTimer.setActiveGameplay(false);
  }
}

function renderTaskPromptAndOptions(task, onPick) {
  if (kgCategoryBadgeEl) kgCategoryBadgeEl.textContent = task.categoryLabel || '🧠 Užduotis';
  if (kgQuestionEl) kgQuestionEl.textContent = task.prompt;
  if (kgVisualCanvas) renderTaskVisual(kgVisualCanvas, task);

  hideKgNextButton();
  kgPenaltyBannerEl?.classList.add('hidden');
  kgExplanationBoxEl?.classList.add('hidden');
  kgFeedbackEl?.classList.add('hidden');

  if (!kgOptionsEl) return;
  kgOptionsEl.innerHTML = '';
  kgOptionsEl.classList.toggle('kg-options-three', task.options.length === 3);

  let answered = false;
  task.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kg-opt-btn';
    btn.textContent = String(opt);
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const isCorrect = opt === task.correctAnswer;
      kgOptionsEl.querySelectorAll('.kg-opt-btn').forEach((b) => {
        b.disabled = true;
        if (b.textContent === String(task.correctAnswer)) {
          b.classList.add('kg-opt-correct');
        }
      });
      if (!isCorrect) {
        btn.classList.add('kg-opt-wrong');
      }
      onPick(isCorrect);
    });
    kgOptionsEl.appendChild(btn);
  });
}

function requestStartLevelWithPreGate(mapId, battleOpts = {}) {
  if (!activeProfile) return;
  if (getRemainingPlaytimeSeconds(activeProfile) <= 0) {
    playtimeTimer.setActiveGameplay(false);
    return;
  }
  if (isInBattleView()) {
    engine.setPaused(true);
    if (!playtimeTimer.setActiveGameplay(false)) return;
  }
  openKnowledgeGateModal({
    mode: 'pre_level',
    mapId,
    battleOpts
  });
}

function openKnowledgeGateModal(configOrLevelId, legacyOpts = {}) {
  if (!knowledgeGateModal || !activeProfile) return;
  const config =
    typeof configOrLevelId === 'object' && configOrLevelId !== null
      ? configOrLevelId
      : { mode: 'pre_level', mapId: configOrLevelId, battleOpts: legacyOpts };

  const mode = config.mode === 'post_level' ? 'post_level' : 'pre_level';
  const reward = config.reward || null;
  const targetId = mode === 'post_level' ? (reward?.mapId || engine.mapId) : config.mapId;
  const targetLvl = getLevelById(targetId);
  const pauseReason = mode === 'post_level' ? 'post_level_gate' : 'pre_level_gate';
  const battleOpts = config.battleOpts || {};

  clearEduModalTimers(true);
  activeGateMode = mode;
  playtimeTimer.setTaskPaused(true, pauseReason);
  pendingGateLevelId = targetLvl.id;
  const session = createKnowledgeGateSession(3);

  const cleanTitle = targetLvl.title.replace(/^\d+\.\s*/, '');
  if (mode === 'post_level') {
    if (kgBadgeEl) kgBadgeEl.textContent = '🏆 PERGALĖS VARTAI';
    if (kgTitleEl) kgTitleEl.textContent = `Užtvirtink pergalę: ${targetLvl.levelNumber} lygis (${cleanTitle})`;
    if (kgSubtitleEl) {
      kgSubtitleEl.textContent = 'Išspręsk 3 užduotis, kad išsaugotum žvaigždutes ir atrakintum kitą lygį! Klaida = +2 užd.';
    }
  } else {
    if (kgBadgeEl) kgBadgeEl.textContent = battleOpts.veteranMode ? '🔥 PASIRENGIMO VARTAI (VETERANAS)' : '🚀 PASIRENGIMO VARTAI';
    if (kgTitleEl) kgTitleEl.textContent = `Pasirengimas kovai: ${targetLvl.levelNumber} lygis (${cleanTitle})`;
    if (kgSubtitleEl) {
      kgSubtitleEl.textContent = 'Išspręsk 3 užduotis prieš pradedant lygį! Kiekviena klaida prideda +2 uždavinius.';
    }
  }

  const syncGateCounters = () => {
    if (kgRemainingPillEl) {
      kgRemainingPillEl.textContent = `Liko: ${session.remaining} užd.`;
    }
    if (kgMistakesPillEl) {
      if (session.mistakes > 0) {
        kgMistakesPillEl.textContent = `Klaidos: ${session.mistakes}`;
        kgMistakesPillEl.classList.remove('hidden');
      } else {
        kgMistakesPillEl.classList.add('hidden');
      }
    }
  };

  const renderRound = () => {
    syncGateCounters();
    const task = eduTaskGenerator.generateTask(activeProfile);
    renderTaskPromptAndOptions(task, (isCorrect) => {
      const outcome = session.submitAnswer(isCorrect);
      const review = buildTaskReviewSummary(task, outcome.isCorrect);
      syncGateCounters();

      if (outcome.isCorrect) {
        audioManager.playGateSuccess();
        if (outcome.complete) {
          if (mode === 'post_level') {
            commitPendingVictoryReward(reward);
            const nextLvl = reward?.nextLvlId ? getLevelById(reward.nextLvlId) : null;
            if (kgFeedbackEl) {
              kgFeedbackEl.style.color = '#86efac';
              kgFeedbackEl.textContent = nextLvl
                ? `🎉 Pergalė užtvirtinta! Žvaigždutės išsaugotos ir ${nextLvl.levelNumber} lygis atrakintas!`
                : '🎉 Pergalė užtvirtinta! Visos žvaigždutės išsaugotos!';
              kgFeedbackEl.classList.remove('hidden');
            }
            if (kgExplanationBoxEl) {
              kgExplanationBoxEl.textContent = review.explanationText;
              kgExplanationBoxEl.classList.remove('hidden');
            }
            showKgNextButton('Išsaugoti ir tęsti →', () => {
              knowledgeGateModal.classList.add('hidden');
              pendingGateLevelId = null;
              activeGateMode = null;
              playtimeTimer.setTaskPaused(false, pauseReason);
              playtimeTimer.setActiveGameplay(false);
            });
            return;
          }

          const bucket = saveData[activeProfile];
          if (bucket && !bucket.unlockedLevels.includes(targetLvl.id)) {
            bucket.unlockedLevels.push(targetLvl.id);
            persistSaveData(saveData);
          }
          if (kgFeedbackEl) {
            kgFeedbackEl.style.color = '#86efac';
            kgFeedbackEl.textContent = `🎉 Šaunuolis! Pasirengimo vartai įveikti — ${targetLvl.levelNumber} lygis paruoštas!`;
            kgFeedbackEl.classList.remove('hidden');
          }
          if (kgExplanationBoxEl) {
            kgExplanationBoxEl.textContent = review.explanationText;
            kgExplanationBoxEl.classList.remove('hidden');
          }
          renderCampaignMap();
          showKgNextButton('Pradėti kovą! →', () => {
            knowledgeGateModal.classList.add('hidden');
            pendingGateLevelId = null;
            activeGateMode = null;
            playtimeTimer.setTaskPaused(false, pauseReason);
            if (getRemainingPlaytimeSeconds(activeProfile) <= 0) {
              playtimeTimer.setActiveGameplay(false);
              return;
            }
            enterBattleLevel(targetLvl.id, battleOpts);
          });
          return;
        }

        if (kgFeedbackEl) {
          kgFeedbackEl.style.color = '#86efac';
          kgFeedbackEl.textContent = `✅ Teisingai! Liko dar ${outcome.remaining} užd.`;
          kgFeedbackEl.classList.remove('hidden');
        }
        if (kgExplanationBoxEl) {
          kgExplanationBoxEl.textContent = review.explanationText;
          kgExplanationBoxEl.classList.remove('hidden');
        }
        showKgNextButton('Kitas uždavinys →', renderRound);
        return;
      }

      // Klaidos bausmė (+2) + paaiškinimas su rankiniu „Kitas uždavinys →“ mygtuku
      audioManager.playGateMistake();
      if (kgPenaltyBannerEl) {
        kgPenaltyBannerEl.textContent = outcome.warning;
        kgPenaltyBannerEl.classList.remove('hidden');
      }
      if (kgExplanationBoxEl) {
        kgExplanationBoxEl.textContent = review.explanationText;
        kgExplanationBoxEl.classList.remove('hidden');
      }
      showKgNextButton('Kitas uždavinys →', renderRound);
    });
  };

  renderRound();
  knowledgeGateModal.classList.remove('hidden');
}

function openSmartUpgradeModal(padIndex) {
  if (!knowledgeGateModal || !activeProfile || !engine.canUseSmartUpgrade(padIndex)) return;
  clearEduModalTimers(false);
  activeGateMode = 'smart_upgrade';
  playtimeTimer.setTaskPaused(true, 'smart_upgrade');
  pendingGateLevelId = null;

  smartUpgradeRestorePause = engine.manualPaused;
  engine.setPaused(true);
  engine.consumeSmartUpgradeAttempt();
  closePadMenus();

  const tower = engine.getTowerAtPad(padIndex);
  if (!tower) {
    clearEduModalTimers(true);
    return;
  }

  if (kgBadgeEl) kgBadgeEl.textContent = '🧠 PROTINGAS PATOBULINIMAS';
  if (kgTitleEl) kgTitleEl.textContent = 'Nemokamas bokštelio patobulinimas!';
  if (kgSubtitleEl) {
    kgSubtitleEl.textContent = 'Išspręsk iš 1-o karto teisingai ir pakelk bokštelio lygį už 0 🪙!';
  }
  if (kgRemainingPillEl) kgRemainingPillEl.textContent = '1 užduotis (1 bandymas)';
  kgMistakesPillEl?.classList.add('hidden');

  const task = eduTaskGenerator.generateTask(activeProfile);
  renderTaskPromptAndOptions(task, (isCorrect) => {
    const review = buildTaskReviewSummary(task, isCorrect);
    if (isCorrect) {
      audioManager.playGateSuccess();
      engine.applyFreeSmartUpgrade(padIndex);
      if (kgFeedbackEl) {
        kgFeedbackEl.style.color = '#86efac';
        kgFeedbackEl.textContent = '✅ Teisingai! Bokštelis nemokamai patobulintas!';
        kgFeedbackEl.classList.remove('hidden');
      }
      if (kgExplanationBoxEl) {
        kgExplanationBoxEl.textContent = review.explanationText;
        kgExplanationBoxEl.classList.remove('hidden');
      }
      showKgNextButton('Tęsti žaidimą →', () => {
        knowledgeGateModal.classList.add('hidden');
        clearEduModalTimers(true);
      });
      return;
    }

    audioManager.playGateMistake();
    if (kgPenaltyBannerEl) {
      kgPenaltyBannerEl.textContent = '❌ Suklydai! Šios bangos nemokamas patobulinimas sudegė.';
      kgPenaltyBannerEl.classList.remove('hidden');
    }
    if (kgExplanationBoxEl) {
      kgExplanationBoxEl.textContent = review.explanationText;
      kgExplanationBoxEl.classList.remove('hidden');
    }
    showKgNextButton('Tęsti žaidimą →', () => {
      knowledgeGateModal.classList.add('hidden');
      clearEduModalTimers(true);
    });
  });

  knowledgeGateModal.classList.remove('hidden');
}

function renderCampaignMap() {
  if (!activeProfile) return;
  const bucket = saveData[activeProfile];
  const veteranSet = new Set(Array.isArray(bucket.veteranClearedLevels) ? bucket.veteranClearedLevels : []);
  const beatenCount = Object.values(bucket.levelStars).filter((s) => s > 0).length;

  if (beatenCount === 0) {
    veteranModeSelected = false;
  }

  if (campaignTotalStars) {
    campaignTotalStars.textContent = `${bucket.stars} / ${CAMPAIGN_LEVELS.length * 3}`;
  }
  if (campaignVeteranCount) {
    campaignVeteranCount.textContent = `${veteranSet.size} / ${CAMPAIGN_LEVELS.length}`;
  }
  if (campaignUnlockedCount) {
    campaignUnlockedCount.textContent = `${bucket.unlockedLevels.length} / ${CAMPAIGN_LEVELS.length}`;
  }

  const isAct2 = activeCampaignAct === 'act2';
  btnCampTab1?.classList.toggle('active', !isAct2);
  btnCampTab1?.setAttribute('aria-selected', !isAct2 ? 'true' : 'false');
  btnCampTab2?.classList.toggle('active', isAct2);
  btnCampTab2?.setAttribute('aria-selected', isAct2 ? 'true' : 'false');
  campaignJourneyMap?.classList.toggle('is-act-2', isAct2);

  if (btnVeteranToggle) {
    btnVeteranToggle.disabled = beatenCount === 0;
    btnVeteranToggle.classList.toggle('is-active', veteranModeSelected);
    btnVeteranToggle.setAttribute('aria-pressed', veteranModeSelected ? 'true' : 'false');
    btnVeteranToggle.textContent = veteranModeSelected
      ? '🔥 Veterano iššūkis: ĮJUNGTA (10 ❤️, +35% HP)'
      : '🔥 Veterano iššūkis: IŠJUNGTA';
  }

  const visibleZones = CAMPAIGN_ZONES.filter((z) => (isAct2 ? z.zoneId >= 5 : z.zoneId <= 4));
  const visibleLevels = CAMPAIGN_LEVELS.filter((l) => (isAct2 ? l.zoneId >= 5 : l.zoneId <= 4));

  if (campaignZonesBar) {
    campaignZonesBar.innerHTML = '';
    visibleZones.forEach((z) => {
      const pill = document.createElement('div');
      pill.className = 'campaign-zone-pill';
      pill.style.borderColor = z.accent;
      pill.innerHTML = `
        <strong>${z.icon} ${z.zoneId}. ${z.name}</strong>
        <span>${z.desc}</span>
      `;
      campaignZonesBar.appendChild(pill);
    });
  }

  if (campaignZoneRects) {
    const rects = isAct2
      ? [
          { x: 0, w: 180, fill: 'rgba(251, 191, 36, 0.09)' },
          { x: 180, w: 275, fill: 'rgba(45, 212, 191, 0.09)' },
          { x: 455, w: 275, fill: 'rgba(56, 189, 248, 0.09)' },
          { x: 730, w: 270, fill: 'rgba(168, 85, 247, 0.10)' }
        ]
      : [
          { x: 0, w: 250, fill: 'rgba(34, 197, 94, 0.08)' },
          { x: 250, w: 250, fill: 'rgba(56, 189, 248, 0.08)' },
          { x: 500, w: 250, fill: 'rgba(16, 185, 129, 0.08)' },
          { x: 750, w: 250, fill: 'rgba(244, 63, 94, 0.08)' }
        ];
    campaignZoneRects.innerHTML = rects
      .map((r) => `<rect x="${r.x}" y="0" width="${r.w}" height="520" fill="${r.fill}"/>`)
      .join('');
  }

  const getTabPos = (idx, count) => {
    if (!isAct2) {
      const yAct1 = [74, 42, 72, 34, 68, 38, 74, 34, 68, 36, 72, 32];
      return {
        x: 6 + (idx / Math.max(1, count - 1)) * 88,
        y: yAct1[idx] ?? 50
      };
    }
    const yAct2 = [68, 34, 72, 28, 66, 38, 76, 26, 62, 34, 74, 28, 64, 34, 74, 26, 66, 30];
    return {
      x: 4.8 + (idx / Math.max(1, count - 1)) * 90.4,
      y: yAct2[idx] ?? 50
    };
  };

  // Kelio SVG linija per aktyvaus skirtuko lygius
  if (campaignRoadShadow && campaignRoadLine && visibleLevels.length > 0) {
    const pts = visibleLevels.map((_, idx) => {
      const p = getTabPos(idx, visibleLevels.length);
      return { x: (p.x / 100) * 1000, y: (p.y / 100) * 520 };
    });
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` Q ${cx} ${prev.y}, ${curr.x} ${curr.y}`;
    }
    campaignRoadShadow.setAttribute('d', d);
    campaignRoadLine.setAttribute('d', d);
  }

  if (campaignNodesLayer) {
    campaignNodesLayer.innerHTML = '';
    visibleLevels.forEach((lvl, idx) => {
      const globalIdx = CAMPAIGN_LEVELS.findIndex((l) => l.id === lvl.id);
      const isUnlocked = bucket.unlockedLevels.includes(lvl.id);
      const stars = bucket.levelStars[lvl.id] || 0;
      const isBeaten = stars > 0;
      const isVeteranCleared = veteranSet.has(lvl.id);
      const isVeteranReady = Boolean(veteranModeSelected && isBeaten);
      const prevLvl = globalIdx > 0 ? CAMPAIGN_LEVELS[globalIdx - 1] : null;
      const prevBeaten = !prevLvl || (bucket.levelStars[prevLvl.id] || 0) > 0;
      const isGateReady = !isUnlocked && prevBeaten;
      const isBoss = Boolean(lvl.isBossLevel || (lvl.zoneId <= 5 ? lvl.levelInZone === 3 : lvl.levelInZone === 5));
      const zone = CAMPAIGN_ZONES.find((z) => z.zoneId === lvl.zoneId);
      const pos = getTabPos(idx, visibleLevels.length);

      const node = document.createElement('button');
      node.type = 'button';
      node.className = `campaign-node ${
        isUnlocked
          ? isBeaten
            ? 'is-unlocked is-beaten'
            : 'is-unlocked'
          : isGateReady
            ? 'is-gate-ready'
            : 'is-locked'
      }${isBoss ? ' is-boss' : ''}${isVeteranCleared ? ' is-veteran-cleared' : ''}${
        isVeteranReady ? ' is-veteran-ready' : ''
      }`;
      node.style.left = `${pos.x.toFixed(2)}%`;
      node.style.top = `${pos.y.toFixed(2)}%`;
      if (isUnlocked && zone) {
        node.style.borderColor = isBeaten ? '#4ade80' : zone.accent;
      }

      node.title = isUnlocked
        ? `${lvl.title} (${lvl.maxWaves} bangos)${isVeteranReady ? ' – 🔥 VETERANO REŽIMAS!' : ''}`
        : isGateReady
          ? `Pasiruošęs atrakinti: ${lvl.title} – spausk ir įveik Žinių Vartus!`
          : `Užrakinta – pirmiausia įveik ${lvl.levelNumber - 1}-ąjį lygį`;

      const statusBadge = isUnlocked
        ? `${isBoss ? '👑 ' : ''}${lvl.levelNumber}`
        : isGateReady
          ? `🔐 ${lvl.levelNumber}`
          : `🔒 ${lvl.levelNumber}`;

      const starsText = isUnlocked
        ? '★'.repeat(stars) + '☆'.repeat(3 - stars)
        : isGateReady
          ? 'ŽIN. VARTAI'
          : 'UŽRAKINTA';

      const crownHtml = isVeteranCleared
        ? '<span class="node-veteran-crown" title="Įveiktas Veterano režimu">👑</span>'
        : '';

      node.innerHTML = `
        ${crownHtml}
        <span class="node-num">${statusBadge}</span>
        <span class="node-stars">${starsText}</span>
        <span class="node-waves">${lvl.maxWaves} bang.</span>
      `;

      node.addEventListener('click', () => {
        if (isUnlocked || isGateReady) {
          requestStartLevelWithPreGate(lvl.id, {
            veteranMode: Boolean(isBeaten && veteranModeSelected)
          });
        }
      });

      campaignNodesLayer.appendChild(node);
    });
  }
}


function syncTechStarsUI() {
  if (!activeProfile) {
    btnOpenTechTop?.classList.add('hidden');
    return;
  }
  const bucket = saveData[activeProfile];
  const avail = computeAvailableTechStars(bucket.stars, bucket.techTree);
  if (campaignAvailStars) campaignAvailStars.textContent = String(avail);
  if (topAvailStars) topAvailStars.textContent = String(avail);
  if (techAvailStarsEl) techAvailStarsEl.textContent = String(avail);
  btnOpenTechTop?.classList.remove('hidden');
}

function closeFeatureModals() {
  techTreeModal?.classList.add('hidden');
  encyclopediaModal?.classList.add('hidden');
  if (modalRestorePause !== null) {
    engine.setPaused(modalRestorePause);
    modalRestorePause = null;
  }
}

function renderTechTreeModal() {
  if (!activeProfile || !techTreeGrid) return;
  const bucket = saveData[activeProfile];
  const avail = computeAvailableTechStars(bucket.stars, bucket.techTree);
  const spent = computeSpentTechStars(bucket.techTree);

  if (techAvailStarsEl) techAvailStarsEl.textContent = String(avail);
  if (btnResetTechStars) btnResetTechStars.disabled = spent <= 0;

  techTreeGrid.innerHTML = '';
  STAR_TECH_CATALOG.forEach((item) => {
    const rank = bucket.techTree[item.id] || 0;
    const isMax = rank >= item.maxRank;
    const nextCost = isMax ? 0 : item.costs[rank];

    const card = document.createElement('div');
    card.className = `tech-card${isMax ? ' is-maxed' : ''}`;
    card.innerHTML = `
      <div class="tech-card-head">
        <span class="tech-icon">${item.icon}</span>
        <span class="tech-rank-badge">Rangas ${rank} / ${item.maxRank}</span>
      </div>
      <h4>${item.name}</h4>
      <p>${item.desc}</p>
    `;

    const buyBtn = document.createElement('button');
    buyBtn.type = 'button';
    buyBtn.className = `tech-buy-btn${isMax ? ' is-maxed' : ''}`;
    if (isMax) {
      buyBtn.textContent = `✅ Pilnai išmokta (${item.rankLabels[rank - 1]})`;
      buyBtn.disabled = true;
    } else {
      buyBtn.textContent = `⭐ Išmokti (${nextCost} žvaigžd.)`;
      buyBtn.disabled = avail < nextCost;
      buyBtn.addEventListener('click', () => buyTechUpgrade(item.id));
    }
    card.appendChild(buyBtn);
    techTreeGrid.appendChild(card);
  });
}

function buyTechUpgrade(techId) {
  if (!activeProfile) return;
  const bucket = saveData[activeProfile];
  const item = STAR_TECH_CATALOG.find((t) => t.id === techId);
  if (!item) return;

  const rank = bucket.techTree[item.id] || 0;
  if (rank >= item.maxRank) return;
  const cost = item.costs[rank] || 0;
  const avail = computeAvailableTechStars(bucket.stars, bucket.techTree);
  if (avail < cost) return;

  bucket.techTree[item.id] = rank + 1;
  persistSaveData(saveData);
  engine.setTechTree(bucket.techTree);
  if (isInBattleView() && engine.wave === 0 && engine.towers.length === 0) {
    engine.loadMap(engine.mapId, activeProfile, { veteranMode: Boolean(engine.veteranMode) });
  }
  audioManager.playTowerUpgrade(3);
  syncTechStarsUI();
  renderTechTreeModal();
}

function resetTechTree() {
  if (!activeProfile) return;
  const bucket = saveData[activeProfile];
  if (computeSpentTechStars(bucket.techTree) <= 0) return;

  bucket.techTree = createDefaultTechTree();
  persistSaveData(saveData);
  engine.setTechTree(bucket.techTree);
  if (isInBattleView() && engine.wave === 0 && engine.towers.length === 0) {
    engine.loadMap(engine.mapId, activeProfile, { veteranMode: Boolean(engine.veteranMode) });
  }
  audioManager.playCoinChime();
  syncTechStarsUI();
  renderTechTreeModal();
}

function openTechTreeModal() {
  if (!activeProfile || !techTreeModal) return;
  if (isInBattleView() && modalRestorePause === null) {
    modalRestorePause = engine.manualPaused;
    engine.setPaused(true);
  }
  encyclopediaModal?.classList.add('hidden');
  syncTechStarsUI();
  renderTechTreeModal();
  techTreeModal.classList.remove('hidden');
}

function getEncounteredSetForEncyclopedia() {
  if (activeProfile && saveData[activeProfile]) {
    return new Set(saveData[activeProfile].encounteredEnemies || DEFAULT_ENCOUNTERED_ENEMIES);
  }
  return new Set([
    ...(saveData.linas?.encounteredEnemies || DEFAULT_ENCOUNTERED_ENEMIES),
    ...(saveData.lukas?.encounteredEnemies || DEFAULT_ENCOUNTERED_ENEMIES)
  ]);
}

function renderEncyclopediaTab(tab = 'towers') {
  encyActiveTab = tab === 'enemies' ? 'enemies' : tab === 'world' ? 'world' : 'towers';
  btnEncyTabTowers?.classList.toggle('active', encyActiveTab === 'towers');
  btnEncyTabEnemies?.classList.toggle('active', encyActiveTab === 'enemies');
  btnEncyTabWorld?.classList.toggle('active', encyActiveTab === 'world');
  if (!encyclopediaContent) return;

  encyclopediaContent.innerHTML = '';

  if (encyActiveTab === 'world') {
    const worldEntries = [
      {
        icon: '🔨',
        title: 'Statybos aikštelė (Plaktukas)',
        meta: 'Šviesi akmeninė / bazės plokštė prie kelio',
        desc: 'Tai paruošta pamatų vieta Tavo bokšteliui. Paspausk ant jos, kad atsidarytum statybos ratą ir matytum tikslų šūvio spindulį.',
        tip: '💡 Statyk bokštelius posūkiuose ir šalia bonusinių taškų!'
      },
      {
        icon: '🪙',
        title: 'Derlinga / Lobio zona (+🪙)',
        meta: 'Auksinis žiedas su kibirkštėlėmis ant žemės',
        desc: 'Pastatyk bent vieną bokštelį švytinčiame zonos spindulyje ir iškart gauk +18 🪙 papildomų monetų kovos pradžiai!',
        tip: '💡 Vieną kartą per lygį – idealu brangesniam startiniam bokšteliui!'
      },
      {
        icon: '⚡',
        title: 'Galios / Akustikos zona (+⚡)',
        meta: 'Žydras energijos kristalas ant žemės',
        desc: 'Visi bokšteliai, pastatyti netoli šios zonos, gauna nuolatinį +15% šaudymo greičio pagreitinimą visos kovos metu.',
        tip: '💡 Derink su „Dagilėlio“ bokšteliu – greičio bonusai sumuojasi!'
      },
      {
        icon: '▶',
        title: 'Priešų įėjimo vartai ir bangos ženklas',
        meta: 'Kelio pradžia su rodykle',
        desc: 'Čia į žemėlapį įžengia priešų būriai. Užvedus arba paspaudus ant šaukiančio bangos ženkliuko pamatysi, kokie priešai ateis!',
        tip: '💡 Skubėdamas kviesti kitą bangą anksčiau laiko gausi papildomų monetų!'
      },
      {
        icon: '🏰',
        title: 'Bubių Tvirtovė (Finišas)',
        meta: '2.5D bokštas su plevėsuojančia vėliava',
        desc: 'Paskutinė gynybos linija! Kiekvienas prasiveržęs priešas atima širdeles ir priverčia tvirtovę suvirpėti.',
        tip: '💡 Jei priešai prasiveržia – pastatyk Vejapjovių Barakus ar Katapultą netoli finišo.'
      },
      {
        icon: '✨',
        title: 'Bokštų auros (+⚡ / +🔭)',
        meta: '„Dagilėlio“ ir Saulės Stoties palaikymas',
        desc: '„Dagilėlio“ garso bokštas pagreitina kaimynus (+15–30% ⚡), o Saulės Baterijų Stotis praplečia gretimų bokštų nuotolį (+12–15% 🔭).',
        tip: '💡 Kaimynystėje stovintys bokštai veikia kur kas stipriau nei po vieną!'
      }
    ];
    worldEntries.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'ency-card';
      card.innerHTML = `
        <div class="ency-card-head">
          <span class="ency-icon">${item.icon}</span>
          <div>
            <h4>${item.title}</h4>
            <div class="ency-meta">${item.meta}</div>
          </div>
        </div>
        <p class="ency-desc">${item.desc}</p>
        <div class="ency-tip">${item.tip}</div>
      `;
      encyclopediaContent.appendChild(card);
    });
    return;
  }

  if (encyActiveTab === 'towers') {
    TOWER_LIST.forEach((towerDef) => {
      const s1 = getTowerStats(towerDef.id, 1);
      const evos = getTowerEvolutions(towerDef.id);
      const evoNames = evos.map((e) => `${e.icon} ${e.name}`).join(' / ');

      const card = document.createElement('article');
      card.className = 'ency-card';
      card.innerHTML = `
        <div class="ency-card-head">
          <span class="ency-icon">${towerDef.icon}</span>
          <div>
            <h4>${towerDef.name}</h4>
            <div class="ency-meta">Kaina: ${s1.cost} 🪙 • Nuotolis: ${s1.range}</div>
          </div>
        </div>
        <p class="ency-desc">${towerDef.desc}</p>
        <div class="ency-tip">✨ 4 lygio šakos: ${evoNames}</div>
      `;
      encyclopediaContent.appendChild(card);
    });
    return;
  }

  const encounteredSet = getEncounteredSetForEncyclopedia();
  const allEnemies = [...ENEMY_LIST, ...BOSS_LIST];
  allEnemies.forEach((enemy) => {
    const isSeen = encounteredSet.has(enemy.id);
    const card = document.createElement('article');
    card.className = `ency-card${enemy.isBoss ? ' is-boss' : ''}${isSeen ? '' : ' is-locked'}`;

    if (!isSeen) {
      card.innerHTML = `
        <div class="ency-card-head">
          <span class="ency-icon">❓</span>
          <div>
            <h4>Dar nesutiktas priešas</h4>
            <div class="ency-meta">${enemy.isBoss ? '👑 Zonos Bosas' : 'Keliauk toliau kampanijoje'}</div>
          </div>
        </div>
        <p class="ency-desc">Šis priešas pasirodys vėlesnėse bangose arba kitoje Bubių Tvirtovės zonoje.</p>
        <div class="ency-tip">🔒 Sutik priešą kovoje, kad atrakintum jo silpnąsias vietas!</div>
      `;
    } else {
      const attrs = [];
      if (enemy.armor > 0) attrs.push(`🛡️ ${Math.round(enemy.armor * 100)}% šarvų`);
      if ((enemy.energyResist || 0) > 0) attrs.push(`🪞 ${Math.round(enemy.energyResist * 100)}% prieš energiją`);
      if ((enemy.healInterval || 0) > 0) attrs.push(`💚 Gydo (+${Math.round((enemy.healPctNormal || 0.12) * 100)}%)`);
      if (enemy.shieldShiftInterval > 0) attrs.push('🔄 Kintantis skydas (8s)');
      if (enemy.isFlying) attrs.push('🪽 Skraidantis');
      if (enemy.isCamo) attrs.push('👁️ Nematomas');
      if (enemy.isBoss) attrs.push('👑 2 fazių bosas');
      const attrLine = attrs.length > 0 ? ` • ${attrs.join(' • ')}` : '';
      card.innerHTML = `
        <div class="ency-card-head">
          <span class="ency-icon">${enemy.icon}</span>
          <div>
            <h4>${enemy.name}</h4>
            <div class="ency-meta">❤️ ${enemy.baseHp} baz. HP • 🪙 +${enemy.reward}${attrLine}</div>
          </div>
        </div>
        <div class="ency-tip">${enemy.counterTip || '💡 Derink kelis skirtingus bokštelius prie posūkių!'}</div>
      `;
    }
    encyclopediaContent.appendChild(card);
  });
}

function openEncyclopediaModal(defaultTab = 'towers') {
  if (!encyclopediaModal) return;
  if (isInBattleView() && modalRestorePause === null) {
    modalRestorePause = engine.manualPaused;
    engine.setPaused(true);
  }
  techTreeModal?.classList.add('hidden');
  renderEncyclopediaTab(defaultTab);
  encyclopediaModal.classList.remove('hidden');
}

function showCampaignMapView() {
  if (!activeProfile) return;
  clearEduModalTimers(false);
  closeFeatureModals();
  closePadMenus();
  resultOverlay?.classList.add('hidden');
  knowledgeGateModal?.classList.add('hidden');
  engine.setPaused(false);
  document.body.classList.remove('in-battle-mode');
  screenGame?.classList.add('hidden');
  screenCampaign?.classList.remove('hidden');
  syncBossHpBarUI();
  playtimeTimer.setActiveGameplay(false);
  pendingVictoryReward = null;
  syncTechStarsUI();
  renderCampaignMap();
}

function enterBattleLevel(mapId, opts = {}) {
  if (!activeProfile) return;
  if (getRemainingPlaytimeSeconds(activeProfile) <= 0) {
    playtimeTimer.setActiveGameplay(false);
    return;
  }
  playtimeTimer.setActiveGameplay(true);
  document.body.classList.add('in-battle-mode');
  screenCampaign?.classList.add('hidden');
  screenGame?.classList.remove('hidden');
  selectMap(mapId, opts);
}

function selectProfile(profileId) {
  activeProfile = profileId === 'linas' ? 'linas' : 'lukas';
  const mod = getProfileModifier(activeProfile);
  veteranModeSelected = false;
  const maxUnlockedNum = saveData[activeProfile].unlockedLevels.reduce((mx, id) => {
    const n = getLevelById(id)?.levelNumber || 1;
    return Math.max(mx, n);
  }, 1);
  activeCampaignAct = maxUnlockedNum >= 13 ? 'act2' : 'act1';

  screenProfiles?.classList.add('hidden');
  topProfilePill?.classList.remove('hidden');
  btnSwitchProfile?.classList.remove('hidden');
  resultOverlay?.classList.add('hidden');

  if (uiActiveProfile) {
    uiActiveProfile.textContent = `👤 ${mod.label}`;
  }

  const badgeEl = document.getElementById('ui-profile-balance-badge');
  if (badgeEl) {
    badgeEl.textContent = mod.badgeText;
    badgeEl.classList.toggle('is-lukas', activeProfile === 'lukas');
  }

  engine.setTechTree(saveData[activeProfile].techTree);
  engine.setProfile(activeProfile);
  showCampaignMapView();
  const allowed = playtimeTimer.setActiveChild(activeProfile);
  engine.setExternalLocked(!allowed);
}

function showProfileScreen() {
  activeProfile = null;
  pendingVictoryReward = null;
  clearEduModalTimers(false);
  closeFeatureModals();
  closePadMenus();
  resultOverlay?.classList.add('hidden');
  knowledgeGateModal?.classList.add('hidden');
  playtimeTimer.clearActiveChild();
  document.body.classList.remove('in-battle-mode');
  screenGame?.classList.add('hidden');
  screenCampaign?.classList.add('hidden');
  screenProfiles?.classList.remove('hidden');
  syncBossHpBarUI();
  topProfilePill?.classList.add('hidden');
  btnSwitchProfile?.classList.add('hidden');
  syncTechStarsUI();
  updateProfileCards();
}

function selectMap(mapId, opts = {}) {
  pendingVictoryReward = null;
  clearEduModalTimers(false);
  knowledgeGateModal?.classList.add('hidden');
  closePadMenus();
  resultOverlay?.classList.add('hidden');
  engine.loadMap(mapId, activeProfile || 'lukas', { veteranMode: Boolean(opts?.veteranMode) });

  const badgeEl = document.getElementById('ui-active-level-badge');
  if (badgeEl) {
    badgeEl.textContent = engine.veteranMode ? `🔥 VETERANAS • ${engine.map.badge}` : engine.map.badge;
    badgeEl.classList.toggle('is-veteran', Boolean(engine.veteranMode));
  }

  const titleEl = document.getElementById('map-title');
  const subEl = document.getElementById('map-subtitle');
  if (titleEl) titleEl.textContent = engine.map.title;
  if (subEl) subEl.textContent = engine.map.subtitle;
}

function animationLoop(timestamp) {
  if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
  const rawDt = Math.min(0.05, (timestamp - lastFrameTimestamp) / 1000);
  lastFrameTimestamp = timestamp;

  if (activeProfile && isInBattleView()) {
    engine.update(rawDt);
    syncBossHpBarUI();
    engine.render();
  }

  requestAnimationFrame(animationLoop);
}

// ==================== ĮVYKIŲ SUSIEJIMAS ====================
document.getElementById('btn-select-linas')?.addEventListener('click', () => selectProfile('linas'));
document.getElementById('btn-select-lukas')?.addEventListener('click', () => selectProfile('lukas'));
btnSwitchProfile?.addEventListener('click', showProfileScreen);
document.getElementById('btn-back-campaign')?.addEventListener('click', showCampaignMapView);
document.getElementById('btn-result-campaign')?.addEventListener('click', showCampaignMapView);
document.getElementById('btn-close-kg')?.addEventListener('click', () => {
  const closedMode = activeGateMode;
  clearEduModalTimers(true);
  knowledgeGateModal?.classList.add('hidden');
  if (closedMode === 'pre_level') {
    showCampaignMapView();
    return;
  }
  if (isInBattleView() && engine.gameResult && activeProfile && getRemainingPlaytimeSeconds(activeProfile) <= 0) {
    playtimeTimer.setActiveGameplay(false);
  }
});

btnKgNext?.addEventListener('click', () => {
  const action = kgNextAction;
  hideKgNextButton();
  if (typeof action === 'function') {
    action();
  }
});

btnResultNextLevel?.addEventListener('click', () => {
  if (!activeProfile) return;
  if (pendingVictoryReward && !pendingVictoryReward.claimed) {
    openKnowledgeGateModal({ mode: 'post_level', reward: pendingVictoryReward });
    return;
  }
  const nextId = btnResultNextLevel.dataset.nextLevelId;
  if (!nextId) return;
  requestStartLevelWithPreGate(nextId, { veteranMode: false });
});

btnSpeedToggle?.addEventListener('click', () => {
  engine.toggleSpeed();
});

btnPauseToggle?.addEventListener('click', () => {
  engine.togglePause();
});

btnCallWave?.addEventListener('click', () => {
  engine.callNextWaveEarly();
});

document.getElementById('btn-restart-map')?.addEventListener('click', () => {
  requestStartLevelWithPreGate(engine.mapId, { veteranMode: Boolean(engine.veteranMode) });
});

document.getElementById('btn-result-replay')?.addEventListener('click', () => {
  requestStartLevelWithPreGate(engine.mapId, { veteranMode: Boolean(engine.veteranMode) });
});

btnCampTab1?.addEventListener('click', () => {
  activeCampaignAct = 'act1';
  renderCampaignMap();
});

btnCampTab2?.addEventListener('click', () => {
  activeCampaignAct = 'act2';
  renderCampaignMap();
});

btnVeteranToggle?.addEventListener('click', () => {
  if (!activeProfile) return;
  const bucket = saveData[activeProfile];
  const beatenCount = Object.values(bucket?.levelStars || {}).filter((s) => s > 0).length;
  if (beatenCount === 0) return;
  veteranModeSelected = !veteranModeSelected;
  renderCampaignMap();
});

document.getElementById('btn-close-build-menu')?.addEventListener('click', () => {
  engine.clearSelection();
});

document.getElementById('btn-close-inspector')?.addEventListener('click', () => {
  engine.clearSelection();
});

document.getElementById('btn-close-wave-preview')?.addEventListener('click', () => {
  engine.pinnedWavePreview = false;
  renderWavePreviewCard(null);
});

btnUpgradeTower?.addEventListener('click', () => {
  if (engine.selectedPadIndex !== null) {
    engine.upgradeTower(engine.selectedPadIndex);
  }
});

btnSmartUpgrade?.addEventListener('click', () => {
  if (engine.selectedPadIndex !== null) {
    openSmartUpgradeModal(engine.selectedPadIndex);
  }
});

btnRallyPoint?.addEventListener('click', () => {
  if (engine.selectedPadIndex !== null) {
    engine.startRallyPlacement(engine.selectedPadIndex);
  }
});

btnSellTower?.addEventListener('click', () => {
  if (engine.selectedPadIndex !== null) {
    engine.sellTower(engine.selectedPadIndex);
  }
});

canvas?.addEventListener('pointerdown', (event) => {
  if (!activeProfile) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const mx = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const my = ((event.clientY - rect.top) * canvas.height) / rect.height;
  engine.handleCanvasTap(mx, my);
});

btnOpenTechTree?.addEventListener('click', openTechTreeModal);
btnOpenTechTop?.addEventListener('click', openTechTreeModal);
document.getElementById('btn-close-tech-modal')?.addEventListener('click', closeFeatureModals);
btnResetTechStars?.addEventListener('click', resetTechTree);

btnOpenEncyclopedia?.addEventListener('click', () => openEncyclopediaModal('towers'));
btnOpenEncyclopediaCamp?.addEventListener('click', () => openEncyclopediaModal('towers'));
document.getElementById('btn-close-ency-modal')?.addEventListener('click', closeFeatureModals);
btnEncyTabTowers?.addEventListener('click', () => renderEncyclopediaTab('towers'));
btnEncyTabEnemies?.addEventListener('click', () => renderEncyclopediaTab('enemies'));
btnEncyTabWorld?.addEventListener('click', () => renderEncyclopediaTab('world'));

canvas?.addEventListener('pointermove', (event) => {
  if (!activeProfile || event.pointerType !== 'mouse') return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const mx = ((event.clientX - rect.left) * canvas.width) / rect.width;
  const my = ((event.clientY - rect.top) * canvas.height) / rect.height;
  engine.handleCanvasHover(mx, my);
});

canvas?.addEventListener('pointerleave', () => {
  engine.clearCanvasHover();
  if (!engine.pinnedWavePreview) {
    renderWavePreviewCard(null);
  }
});

function syncAudioToggleButton() {
  if (!btnAudioToggle) return;
  const muted = audioManager.isMuted();
  btnAudioToggle.classList.toggle('is-muted', muted);
  btnAudioToggle.setAttribute('aria-pressed', muted ? 'true' : 'false');
  btnAudioToggle.textContent = muted ? '🔇 Be garso' : '🔊 Garsas';
}

btnAudioToggle?.addEventListener('click', () => {
  const muted = audioManager.toggleMute();
  syncAudioToggleButton();
  if (!muted) {
    audioManager.playCoinChime();
  }
});

syncAudioToggleButton();
updateProfileCards();
requestAnimationFrame(animationLoop);
