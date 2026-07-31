import loot, { CATEGORY_ORDER } from './loot-values.js';
import lowerMarkers from './Data/Map/lower-markers.js';
import mainMarkers from './Data/Map/main-markers.js';
import topMarkers from './Data/Map/top-markers.js';

export const FLOOR_IMAGE_FILES = {
    lower: 'Bell_Building_Lower_Floor_Secondary_Targets_Standardized size.png',
    main: 'Bell_Building_Main_Floor_Secondary_Targets_Standardized size.png',
    top: 'Bell_Building_Top_Floor_Secondary_Targets_Standardized size.png'
};

export const FLOOR_IMAGES = {
    lower: { width: 1333, height: 1884 },
    main: { width: 1333, height: 1884 },
    top: { width: 1333, height: 1884 }
};

export const FLOORS = { lower: lowerMarkers, main: mainMarkers, top: topMarkers };
export const MARKER_SIZE = 60;
export const BAG_CAPACITY = 100;
export const BUYER_REQUEST_MAX = 5;

// Non-interactive visual groupings drawn on top of a floor's map — a thick
// bordered box around a cluster of markers, purely for labeling a named
// area. These never respond to clicks; the markers inside keep their own
// individual colors and stay independently clickable.
export const ZONES = {
    lower: [],
    main: [],
    top: [
        { id: 'krisp-zone', label: 'Krisp Collection', x: 580, y: 1440, width: 730, height: 350 }
    ]
};

export const settings = {
    cost: 100000,
    eliteNormal: 50000,
    eliteHard: 100000,
    buyerNormal: 50000,
    buyerHard: 100000
};

export const state = {
    players: 1,
    mode: 'normal',
    alarm: 'noAlarm',
    weeklyBonus: false,
    elite: false,
    buyer: false,
    hasPlasmaCutter: true,
    keepPainting: false,
    primaryKey: null,
    setupMode: false,
    currentFloor: 'lower',
    selectedMarker: null,
    assignments: new Map(),
    buyerMarkerIds: [],        // up to BUYER_REQUEST_MAX marker ids
    lootMode: 'manual',
    prioritizeBuyer: false,
    bags: [[], [], [], []]
};

export const lootByKey = new Map(loot.map(item => [item.key, item]));
export const primaryItems = loot.filter(item => item.Type === 'Primary');
export const secondaryItems = loot.filter(item => item.Type === 'Secondary');

export function money(amount) {
    const rounded = Math.round(amount);
    return (rounded < 0 ? '-$' : '$') + Math.abs(rounded).toLocaleString('en-US');
}

export function floorName(floor) {
    return floor.charAt(0).toUpperCase() + floor.slice(1);
}

// ---------- Secondary loot setup persistence ----------
// Saves just the map setup (which marker has which item/value, and which
// markers are flagged as buyer requests) — not the per-run toggles like
// players/mode, since those take one click to reset each session anyway.

const STORAGE_KEY = 'kortzCalculatorSetup';

export function saveSetup() {
    try {
        const payload = {
            assignments: Array.from(state.assignments.entries()),
            buyerMarkerIds: state.buyerMarkerIds
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
        console.warn('Could not save loot setup:', err);
    }
}

export function loadSetup() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const payload = JSON.parse(raw);
        if (Array.isArray(payload.assignments)) {
            state.assignments = new Map(payload.assignments);
        }
        if (Array.isArray(payload.buyerMarkerIds)) {
            state.buyerMarkerIds = payload.buyerMarkerIds.slice(0, BUYER_REQUEST_MAX);
        }
    } catch (err) {
        console.warn('Could not load saved loot setup:', err);
    }
}