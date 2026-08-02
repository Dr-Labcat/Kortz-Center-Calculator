// Marker positions for the Top floor, in the native pixel space of
// Bell_Building_Top_Floor_Secondary_Targets_Standardized size.png (1333 x 1884).
// Coordinates are pixel-verified against the in-game "$" icon glyph baked
// into the map art (measured, not guessed — see each icon's dead centre).
//
// top-12 / top-13 were mis-typed as paintings — corrected to smash cases.
// top-3, top-4, top-7, top-8, top-9, top-10, top-11 keep their own normal
// colors/types (that's deliberate) but carry `zone: 'krisp'` so the app
// knows to bundle them into one all-or-nothing Krisp Collection grab
// instead of letting them be picked individually — see state.js's ZONES
// entry for the visual box drawn around them, and bags.js for the bundling.
export default [
    { id: 'top-1', x: 357, y: 1328, label: 'Painting', type: 'painting', color: 'green' },
    { id: 'top-2', x: 357, y: 1493, label: 'Painting', type: 'painting', color: 'green' },
    { id: 'top-3', x: 1070, y: 1533, label: 'Painting', type: 'painting', color: 'green', zone: 'krisp' },
    { id: 'top-4', x: 1291, y: 1626, label: 'Painting', type: 'painting', color: 'green', zone: 'krisp' },
    { id: 'top-5', x: 1083, y: 1017, label: 'Plasma cutter case', type: 'cutter case', color: 'red' },
    { id: 'top-6', x: 1083, y: 1216, label: 'Plasma cutter case', type: 'cutter case', color: 'red' },
    { id: 'top-7', x: 758, y: 1549, label: 'Plasma cutter case', type: 'cutter case', color: 'red', zone: 'krisp' },
    { id: 'top-8', x: 946, y: 1698, label: 'Plasma cutter case', type: 'cutter case', color: 'red', zone: 'krisp' },
    { id: 'top-9', x: 1153, y: 1696, label: 'Smash case', type: 'alarm case', color: 'yellow', zone: 'krisp' },
    { id: 'top-10', x: 759, y: 1696, label: 'Smash case', type: 'alarm case', color: 'yellow', zone: 'krisp' },
    { id: 'top-11', x: 655, y: 1552, label: 'Smash case', type: 'alarm case', color: 'yellow', zone: 'krisp' },
    { id: 'top-12', x: 1084, y: 1433, label: 'Smash case', type: 'alarm case', color: 'yellow' },
    { id: 'top-13', x: 1085, y: 811, label: 'Smash case', type: 'alarm case', color: 'yellow' }
];
