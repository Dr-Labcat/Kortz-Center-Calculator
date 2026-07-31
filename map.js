import {
    state, FLOORS, FLOOR_IMAGE_FILES, FLOOR_IMAGES,
    MARKER_SIZE, BUYER_REQUEST_MAX, lootByKey, secondaryItems, floorName, saveSetup
} from './state.js';
import { CATEGORY_ORDER } from './loot-values.js';

// Cutter cases (red) are excluded entirely when the crew didn't bring a
// plasma cutter — they can't be opened, so they shouldn't count anywhere:
// not in the map's assigned-item pool, not in bags, not in payout.
export function discoveredMarkers() {
    const result = [];
    Object.entries(FLOORS).forEach(([floor, markers]) => {
        markers.forEach(marker => {
            if (marker.color === 'red' && !state.hasPlasmaCutter) return;
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

    FLOORS[state.currentFloor].forEach(marker => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `marker ${marker.color}`;
        btn.dataset.id = marker.id;

        const disabledByCutter = marker.color === 'red' && !state.hasPlasmaCutter;
        if (disabledByCutter) btn.classList.add('disabled');

        const half = MARKER_SIZE / 2;
        btn.style.left = `${((marker.x - half) / size.width) * 100}%`;
        btn.style.top = `${((marker.y - half) / size.height) * 100}%`;
        btn.style.width = `${(MARKER_SIZE / size.width) * 100}%`;
        btn.style.height = `${(MARKER_SIZE / size.height) * 100}%`;

        const assignment = state.assignments.get(marker.id);
        const assignedItem = assignment ? lootByKey.get(assignment.itemKey) : null;
        if (disabledByCutter) {
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
    document.getElementById('editorValueInput').value = existing ? existing.value : '';
    document.getElementById('editorBuyerFlag').checked = state.buyerMarkerIds.includes(id);
}

export function closeEditor() {
    state.selectedMarker = null;
    document.getElementById('markerEditor').classList.add('hidden');
}

function populateEditorSelect(markerId, color) {
    const select = document.getElementById('editorSelect');
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
