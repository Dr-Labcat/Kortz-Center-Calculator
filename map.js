import {
    state, FLOORS, FLOOR_IMAGE_FILES, FLOOR_IMAGES, ZONES,
    MARKER_SIZE, BUYER_REQUEST_MAX, lootByKey, secondaryItems, floorName, saveSetup
} from './state.js';
import { CATEGORY_ORDER } from './loot-values.js';
import { paintingLocations } from './painting-locations.js';

function normalizeName(s) {
    return s.trim().toLowerCase();
}

const paintingByNormalizedName = new Map(
    secondaryItems
        .filter(item => item.Category === 'Paintings')
        .map(item => [normalizeName(item.Target), item])
);

// A marker with a confirmed fixed painting returns that loot item; every
// other marker returns null and keeps the normal picker.
function fixedPaintingFor(markerId) {
    const name = paintingLocations[markerId];
    if (!name) return null;
    return paintingByNormalizedName.get(normalizeName(name)) || null;
}

// Cutter cases (red) are excluded when the crew didn't bring a plasma
// cutter, and Krisp Collection loot (that back room on the Top floor) is
// excluded when playing solo — that room needs 2+ people to get into.
// Either way the loot shouldn't count anywhere: not in the map's
// assigned-item pool, not in bags, not in payout.
function isAccessible(marker) {
    if (marker.color === 'red' && !state.hasPlasmaCutter) return false;
    if (marker.zone === 'krisp' && state.players < 2) return false;
    return true;
}

export function discoveredMarkers() {
    const result = [];
    Object.entries(FLOORS).forEach(([floor, markers]) => {
        markers.forEach(marker => {
            if (!isAccessible(marker)) return;
            const assignment = state.assignments.get(marker.id);
            if (!assignment) return;
            const item = lootByKey.get(assignment.itemKey);
            if (item) result.push({ markerId: marker.id, floor, marker, item, assignment });
        });
    });
    return result;
}

export function switchFloor(floor, onSwitchComplete) {
    state.currentFloor = floor;
    document.getElementById('mapImage').src = `Data/Map/${FLOOR_IMAGE_FILES[floor]}`;
    closeEditor();
    renderMarkers(onSwitchComplete);
}

function secondaryDisplayValue(assignment) {
    if (!assignment) return 0;
    return state.mode === 'hard' ? Math.round(assignment.value * 1.1) : assignment.value;
}

export function renderMarkers(onMarkerAction) {
    const layer = document.getElementById('markerLayer');
    const size = FLOOR_IMAGES[state.currentFloor];
    layer.innerHTML = '';

    // Zone boxes first (underneath), so markers drawn after them stay on
    // top and clickable. Zones themselves never take clicks (see the
    // .map-zone { pointer-events: none } rule).
    (ZONES[state.currentFloor] || []).forEach(zone => {
        const box = document.createElement('div');
        box.className = 'map-zone';
        box.style.left = `${(zone.x / size.width) * 100}%`;
        box.style.top = `${(zone.y / size.height) * 100}%`;
        box.style.width = `${(zone.width / size.width) * 100}%`;
        box.style.height = `${(zone.height / size.height) * 100}%`;

        const labelEl = document.createElement('span');
        labelEl.className = 'map-zone-label';
        labelEl.textContent = zone.label;
        box.appendChild(labelEl);

        layer.appendChild(box);
    });

    FLOORS[state.currentFloor].forEach(marker => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `marker ${marker.color}`;
        btn.dataset.id = marker.id;

        const disabled = !isAccessible(marker);
        if (disabled) btn.classList.add('disabled');

        const half = MARKER_SIZE / 2;
        btn.style.left = `${((marker.x - half) / size.width) * 100}%`;
        btn.style.top = `${((marker.y - half) / size.height) * 100}%`;
        btn.style.width = `${(MARKER_SIZE / size.width) * 100}%`;
        btn.style.height = `${(MARKER_SIZE / size.height) * 100}%`;

        const assignment = state.assignments.get(marker.id);
        const assignedItem = assignment ? lootByKey.get(assignment.itemKey) : null;
        if (disabled && marker.zone === 'krisp') {
            btn.title = `${marker.label} — needs 2+ players to access`;
        } else if (disabled) {
            btn.title = `${marker.label} — no plasma cutter, can't open this`;
        } else if (assignedItem) {
            btn.classList.add('assigned');
            btn.title = `${marker.label} — ${assignedItem.label} (${secondaryDisplayValue(assignment)})`;
        } else {
            btn.title = `${marker.label} — not set up yet`;
        }
        if (state.buyerMarkerIds.includes(marker.id)) {
            btn.classList.add('buyer-flagged');
            btn.title += ' — buyer request';
        }

        btn.addEventListener('click', () => {
            if (!state.setupMode) return;
            state.selectedMarker = { floor: state.currentFloor, id: marker.id, label: marker.label, color: marker.color };
            openEditor(onMarkerAction);
        });
        layer.appendChild(btn);
    });
}

export function openEditor(onChangeCallback) {
    const { floor, id, label, color } = state.selectedMarker;
    document.getElementById('markerEditor').classList.remove('hidden');
    document.getElementById('editorLabel').textContent = `${label} — ${floorName(floor)} floor`;
    populateEditorSelect(id, color);

    const existing = state.assignments.get(id);
    const fixed = fixedPaintingFor(id);
    if (existing) {
        document.getElementById('editorValueInput').value = existing.value;
    } else if (fixed) {
        document.getElementById('editorValueInput').value = fixed.defaultValue;
    } else {
        document.getElementById('editorValueInput').value = '';
    }
    document.getElementById('editorBuyerFlag').checked = state.buyerMarkerIds.includes(id);

    // Fixed-painting markers have no user-driven select change to trigger
    // the first save, so lock in the default value right away.
    if (!existing && fixed) {
        commitAssignment(onChangeCallback);
    }
}

export function closeEditor() {
    state.selectedMarker = null;
    document.getElementById('markerEditor').classList.add('hidden');
}

function populateEditorSelect(markerId, color) {
    const select = document.getElementById('editorSelect');
    select.innerHTML = '';
    select.disabled = false;

    const fixed = fixedPaintingFor(markerId);
    if (fixed) {
        const opt = document.createElement('option');
        opt.value = fixed.key;
        opt.textContent = fixed.label;
        select.appendChild(opt);
        select.value = fixed.key;
        select.disabled = true;
        return;
    }

    select.innerHTML = '<option value="">— none —</option>';

    let categories;
    if (color === 'green') {
        categories = ['Paintings'];
    } else if (color === 'yellow') {
        categories = ['Ornamental Eggs', 'Idols', 'Rings', 'Bracelets', 'Meteorite'];
    } else if (color === 'red') {
        categories = ['Jewelry', 'Necklaces', 'Skulls', 'Statues'];
    } else {
        // purple (Krisp Collection) has no dedicated item list yet, so it
        // shows everything, same as any other unrecognized marker color.
        categories = CATEGORY_ORDER;
    }

    categories.forEach(category => {
        const items = secondaryItems
            .filter(item => item.Category === category)
            .sort((a, b) => a.label.localeCompare(b.label));
        if (!items.length) return;
        const group = document.createElement('optgroup');
        group.label = category;
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.key;
            opt.textContent = item.label;
            group.appendChild(opt);
        });
        select.appendChild(group);
    });

    const existing = state.assignments.get(markerId);
    select.value = existing ? existing.itemKey : '';
}

export function clearMarkerFromBags(markerId) {
    state.bags.forEach(slots => {
        const idx = slots.indexOf(markerId);
        if (idx !== -1) slots.splice(idx, 1);
    });
}

export function bindEditorEvents(onUpdate) {
    document.getElementById('editorSelect').addEventListener('change', () => {
        const key = document.getElementById('editorSelect').value;
        const item = lootByKey.get(key);
        document.getElementById('editorValueInput').value = item ? item.defaultValue : '';
        commitAssignment(onUpdate);
    });

    document.getElementById('editorValueInput').addEventListener('input', () => commitAssignment(onUpdate));

    document.getElementById('editorBuyerFlag').addEventListener('change', event => {
        const { id } = state.selectedMarker;
        const alreadyFlagged = state.buyerMarkerIds.includes(id);
        if (event.target.checked && !alreadyFlagged) {
            if (state.buyerMarkerIds.length >= BUYER_REQUEST_MAX) {
                event.target.checked = false;
                alert(`You can flag at most ${BUYER_REQUEST_MAX} buyer request items.`);
                return;
            }
            state.buyerMarkerIds.push(id);
        } else if (!event.target.checked && alreadyFlagged) {
            state.buyerMarkerIds = state.buyerMarkerIds.filter(mid => mid !== id);
        }
        commitAssignment(onUpdate);
    });

    document.getElementById('editorClear').addEventListener('click', () => {
        document.getElementById('editorSelect').value = '';
        document.getElementById('editorValueInput').value = '';
        document.getElementById('editorBuyerFlag').checked = false;
        const { id } = state.selectedMarker;
        state.buyerMarkerIds = state.buyerMarkerIds.filter(mid => mid !== id);
        commitAssignment(onUpdate);
    });

    document.getElementById('editorClose').addEventListener('click', closeEditor);
}

function commitAssignment(onUpdate) {
    if (!state.selectedMarker) return;
    const { id } = state.selectedMarker;
    const key = document.getElementById('editorSelect').value;
    const valueInput = document.getElementById('editorValueInput');

    if (!key) {
        state.assignments.delete(id);
        clearMarkerFromBags(id);
        state.buyerMarkerIds = state.buyerMarkerIds.filter(mid => mid !== id);
    } else {
        const value = Number(valueInput.value) || 0;
        state.assignments.set(id, { itemKey: key, value });
    }

    saveSetup();
    if (onUpdate) onUpdate();
}