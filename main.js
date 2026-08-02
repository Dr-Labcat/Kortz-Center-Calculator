import { state, settings, primaryItems, lootByKey, money, loadSetup } from './state.js';
import { discoveredMarkers, switchFloor, renderMarkers, bindEditorEvents, closeEditor } from './map.js';
import { renderBags, computeAutomaticAllocation } from './bags.js';

function getPrimaryValue() {
    if (state.keepPainting) return 0;
    const item = lootByKey.get(state.primaryKey);
    if (!item) return 0;
    let value = item.Base_Value;
    if (state.weeklyBonus) value *= 4;
    if (state.alarm === 'alarm') value *= 0.75;
    if (state.mode === 'hard') value *= 1.1;
    return Math.round(value);
}

function secondaryDisplayValue(assignment) {
    if (!assignment) return 0;
    return state.mode === 'hard' ? Math.round(assignment.value * 1.1) : assignment.value;
}

function buildPrimaryOptions() {
    const select = document.getElementById('primarySelect');
    select.innerHTML = primaryItems
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(item => `<option value="${item.key}">${item.label}</option>`)
        .join('');
    state.primaryKey = primaryItems[0]?.key || null;
}

function calculate() {
    const primaryValue = getPrimaryValue();
    document.getElementById('primaryValue').textContent = money(primaryValue);

    const discovered = discoveredMarkers();
    let secondaryTotal = 0;

    if (state.lootMode === 'manual') {
        for (let p = 0; p < state.players; p++) {
            let runningFill = 0;
            state.bags[p].forEach(markerId => {
                if (!markerId) return;
                const entry = discovered.find(d => d.markerId === markerId);
                if (!entry) return;
                if (runningFill + entry.item.Fill <= 100) {
                    runningFill += entry.item.Fill;
                    secondaryTotal += secondaryDisplayValue(entry.assignment);
                }
            });
        }
    } else {
        const { playerBins } = computeAutomaticAllocation(discovered);
        playerBins.forEach(bin => bin.items.forEach(entry => {
            secondaryTotal += secondaryDisplayValue(entry.assignment);
        }));
    }

    let bonusTotal = 0;
    if (state.elite) bonusTotal += state.mode === 'hard' ? settings.eliteHard : settings.eliteNormal;
    if (state.buyer) bonusTotal += state.mode === 'hard' ? settings.buyerHard : settings.buyerNormal;

    // Host takes 100% of everything (primary + secondary + bonuses). Crew
    // payout is only the bonus loot — secondary items plus elite/buyer
    // bonuses — never a cut of the primary target itself.
    const hostPay = primaryValue + secondaryTotal + bonusTotal;
    const crewBase = secondaryTotal + bonusTotal;
    const crewPay = state.players > 1 ? crewBase * 0.15 : 0;

    document.getElementById('hostValue').textContent = money(hostPay);
    document.getElementById('crewValue').textContent = money(crewPay);
}

function refreshAll() {
    renderMarkers(refreshAll);
    renderBags(refreshAll);
    calculate();
}

function bindButtonGroup(id, onChange) {
    const group = document.getElementById(id);
    if (!group) return;
    group.addEventListener('click', event => {
        const btn = event.target.closest('button');
        if (!btn) return;
        group.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        onChange(btn.dataset.value);
    });
}

function bindEvents() {
    bindButtonGroup('playersGroup', value => { state.players = Number(value); refreshAll(); });
    bindButtonGroup('modeGroup', value => { state.mode = value; refreshAll(); });
    bindButtonGroup('alarmGroup', value => { state.alarm = value; calculate(); });
    bindButtonGroup('weeklyBonusGroup', value => { state.weeklyBonus = value === 'on'; calculate(); });
    bindButtonGroup('eliteGroup', value => { state.elite = value === 'on'; calculate(); });
    bindButtonGroup('buyerGroup', value => { state.buyer = value === 'on'; calculate(); });
    bindButtonGroup('cutterGroup', value => { state.hasPlasmaCutter = value === 'yes'; refreshAll(); });
    bindButtonGroup('keepPaintingGroup', value => { state.keepPainting = value === 'on'; calculate(); });

    bindButtonGroup('lootModeGroup', value => {
        state.lootMode = value;
        document.getElementById('autoRow').classList.toggle('hidden', value !== 'automatic');
        refreshAll();
    });
    document.getElementById('prioritizeBuyer').addEventListener('change', e => {
        state.prioritizeBuyer = e.target.checked;
        refreshAll();
    });

    document.getElementById('primarySelect').addEventListener('change', e => {
        state.primaryKey = e.target.value;
        calculate();
    });

    document.getElementById('floorButtons').addEventListener('click', event => {
        const btn = event.target.closest('button');
        if (!btn) return;
        document.querySelectorAll('#floorButtons button').forEach(b => b.classList.toggle('active', b === btn));
        switchFloor(btn.dataset.floor, refreshAll);
    });

    document.getElementById('setupMode').addEventListener('change', e => {
        state.setupMode = e.target.checked;
        document.body.classList.toggle('setup-active', state.setupMode);
        document.getElementById('setupHint').style.display = state.setupMode ? 'none' : '';
        if (!state.setupMode) closeEditor();
    });

    bindEditorEvents(refreshAll);
}

function init() {
    loadSetup();
    buildPrimaryOptions();
    renderMarkers(refreshAll);
    renderBags(refreshAll);
    bindEvents();
    calculate();
}

init();