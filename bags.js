import { state, BAG_CAPACITY, money, floorName } from './state.js';
import { discoveredMarkers } from './map.js';

function secondaryDisplayValue(assignment) {
    if (!assignment) return 0;
    return state.mode === 'hard' ? Math.round(assignment.value * 1.1) : assignment.value;
}

function usedMarkerIds(excludePlayerIdx, excludeSlotIdx) {
    const used = new Set();
    state.bags.slice(0, state.players).forEach((slots, playerIdx) => {
        slots.forEach((markerId, slotIdx) => {
            if (playerIdx === excludePlayerIdx && slotIdx === excludeSlotIdx) return;
            if (markerId) used.add(markerId);
        });
    });
    return used;
}

function renderManualBags(container, discovered, onChangeCallback) {
    for (let p = 0; p < state.players; p++) {
        const panel = document.createElement('div');
        panel.className = 'player-panel';

        const head = document.createElement('div');
        head.className = 'player-panel-head';
        head.innerHTML = `<span>Player ${p + 1}</span>`;
        const fillReadout = document.createElement('span');
        fillReadout.className = 'bag-fill-readout';
        head.appendChild(fillReadout);
        panel.appendChild(head);

        const columnHead = document.createElement('div');
        columnHead.className = 'bag-slot bag-slot-headings';
        columnHead.innerHTML = '<span></span><span class="slot-value">Value</span><span class="slot-fill">Fill</span><span></span>';
        panel.appendChild(columnHead);

        let runningFill = 0;

        state.bags[p].forEach((markerId, slotIdx) => {
            const row = document.createElement('div');
            row.className = 'bag-slot';

            const select = document.createElement('select');
            select.innerHTML = '<option value="">— empty —</option>';
            const used = usedMarkerIds(p, slotIdx);
            discovered.forEach(entry => {
                if (used.has(entry.markerId)) return;
                const opt = document.createElement('option');
                opt.value = entry.markerId;
                opt.textContent = `${entry.item.label} — ${floorName(entry.floor)} floor`;
                select.appendChild(opt);
            });
            select.value = markerId || '';

            const valueSpan = document.createElement('span');
            valueSpan.className = 'slot-value';
            const fillSpan = document.createElement('span');
            fillSpan.className = 'slot-fill';

            const entry = discovered.find(d => d.markerId === markerId);
            if (entry) {
                fillSpan.textContent = `${entry.item.Fill}%`;
                if (runningFill + entry.item.Fill <= BAG_CAPACITY) {
                    runningFill += entry.item.Fill;
                    valueSpan.textContent = money(secondaryDisplayValue(entry.assignment));
                } else {
                    row.classList.add('overflow');
                    valueSpan.textContent = "doesn't fit";
                }
            } else {
                valueSpan.textContent = '—';
                fillSpan.textContent = '—';
            }

            select.addEventListener('change', () => {
                state.bags[p][slotIdx] = select.value || null;
                onChangeCallback();
            });

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'slot-remove';
            removeBtn.textContent = '×';
            removeBtn.title = 'Remove slot';
            removeBtn.addEventListener('click', () => {
                state.bags[p].splice(slotIdx, 1);
                onChangeCallback();
            });

            row.append(select, valueSpan, fillSpan, removeBtn);
            panel.appendChild(row);
        });

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'add-slot-button';
        addBtn.textContent = '+ Add item';
        const anyUnclaimedLeft = discovered.some(e => !usedMarkerIds(-1, -1).has(e.markerId));
        if (runningFill >= BAG_CAPACITY || !anyUnclaimedLeft) addBtn.disabled = true;
        addBtn.addEventListener('click', () => {
            state.bags[p].push(null);
            onChangeCallback();
        });
        panel.appendChild(addBtn);

        fillReadout.textContent = `${runningFill} / ${BAG_CAPACITY}`;
        if (runningFill > BAG_CAPACITY) fillReadout.classList.add('over');
        container.appendChild(panel);
    }
}

// Exact multi-bin knapsack: one bin per player, each capacity 100 fill
// units (tracked in units of 10). Buyer-flagged items (up to 5, when
// "prioritize buyer request" is on) are placed first via first-fit, then
// the remaining pool is optimized exactly over whatever capacity is left —
// so the DP never has to guess, and nothing gets dropped unless it truly
// doesn't fit anywhere.
export function computeAutomaticAllocation(discovered) {
    const players = state.players;
    const CAP_UNITS = BAG_CAPACITY / 10;
    const BASE = CAP_UNITS + 1;

    let pool = discovered.slice();
    const forcedEntries = [];
    if (state.prioritizeBuyer && state.buyerMarkerIds.length) {
        state.buyerMarkerIds.forEach(id => {
            const idx = pool.findIndex(e => e.markerId === id);
            if (idx !== -1) {
                forcedEntries.push(pool[idx]);
                pool.splice(idx, 1);
            }
        });
    }

    const initialCaps = new Array(players).fill(CAP_UNITS);
    const playerItems = Array.from({ length: players }, () => []);
    forcedEntries.forEach(entry => {
        const w = entry.item.Fill / 10;
        for (let b = 0; b < players; b++) {
            if (initialCaps[b] >= w) {
                initialCaps[b] -= w;
                playerItems[b].push(entry);
                return;
            }
        }
        // doesn't fit anywhere — falls through to the general leftover list below
    });

    function encode(caps) {
        let code = 0;
        for (let i = 0; i < caps.length; i++) code = code * BASE + caps[i];
        return code;
    }
    function decode(code) {
        const caps = new Array(players).fill(0);
        for (let i = players - 1; i >= 0; i--) { caps[i] = code % BASE; code = Math.floor(code / BASE); }
        return caps;
    }

    const n = pool.length;
    const weights = pool.map(e => e.item.Fill / 10);
    const values = pool.map(e => secondaryDisplayValue(e.assignment));
    const totalStates = Math.pow(BASE, players);

    let dpNext = new Array(totalStates).fill(0);
    const choiceTable = new Array(n);

    for (let idx = n - 1; idx >= 0; idx--) {
        const dpCur = new Array(totalStates).fill(0);
        const choice = new Int8Array(totalStates).fill(-1);
        const w = weights[idx];
        const v = values[idx];
        for (let code = 0; code < totalStates; code++) {
            let best = dpNext[code];
            let bestBin = -1;
            const caps = decode(code);
            for (let b = 0; b < players; b++) {
                if (caps[b] >= w) {
                    const newCaps = caps.slice();
                    newCaps[b] -= w;
                    const candidate = dpNext[encode(newCaps)] + v;
                    if (candidate > best) { best = candidate; bestBin = b; }
                }
            }
            dpCur[code] = best;
            choice[code] = bestBin;
        }
        choiceTable[idx] = choice;
        dpNext = dpCur;
    }

    let code = encode(initialCaps);
    for (let idx = 0; idx < n; idx++) {
        const bin = choiceTable[idx][code];
        if (bin !== -1) {
            playerItems[bin].push(pool[idx]);
            const caps = decode(code);
            caps[bin] -= weights[idx];
            code = encode(caps);
        }
    }

    const playerBins = playerItems.map(items => ({
        items,
        fill: items.reduce((sum, e) => sum + e.item.Fill, 0)
    }));

    const selectedIds = new Set();
    playerBins.forEach(bin => bin.items.forEach(e => selectedIds.add(e.markerId)));
    const leftover = discovered.filter(e => !selectedIds.has(e.markerId));

    return { playerBins, leftover };
}

function renderAutomaticBags(container, discovered) {
    const { playerBins, leftover } = computeAutomaticAllocation(discovered);

    playerBins.forEach((bin, p) => {
        const panel = document.createElement('div');
        panel.className = 'player-panel';

        const head = document.createElement('div');
        head.className = 'player-panel-head';
        head.innerHTML = `<span>Player ${p + 1}</span>`;
        const fillReadout = document.createElement('span');
        fillReadout.className = 'bag-fill-readout';
        fillReadout.textContent = `${bin.fill} / ${BAG_CAPACITY}`;
        head.appendChild(fillReadout);
        panel.appendChild(head);

        if (!bin.items.length) {
            const empty = document.createElement('p');
            empty.className = 'hint';
            empty.textContent = 'Nothing assigned yet';
            panel.appendChild(empty);
        }

        bin.items.forEach(entry => {
            const row = document.createElement('div');
            row.className = 'auto-item-row';
            const name = document.createElement('span');
            name.className = 'auto-item-name';
            const buyerTag = state.buyerMarkerIds.includes(entry.markerId) ? ' (buyer request)' : '';
            name.textContent = `${entry.item.label} — ${floorName(entry.floor)} floor${buyerTag}`;
            const figures = document.createElement('span');
            figures.className = 'auto-item-figures';
            figures.textContent = `${money(secondaryDisplayValue(entry.assignment))} · ${entry.item.Fill}%`;
            row.append(name, figures);
            panel.appendChild(row);
        });

        container.appendChild(panel);
    });

    if (leftover.length) {
        const note = document.createElement('div');
        note.className = 'auto-leftover';
        note.textContent = `Not taken, no room left: ${leftover.map(e => e.item.label).join(', ')}`;
        container.appendChild(note);
    }
}

export function renderBags(onChangeCallback) {
    const container = document.getElementById('bagsContainer');
    container.innerHTML = '';
    const discovered = discoveredMarkers();
    if (state.lootMode === 'manual') {
        renderManualBags(container, discovered, onChangeCallback);
    } else {
        renderAutomaticBags(container, discovered);
    }
}