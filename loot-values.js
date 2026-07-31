// Loot value reference data, sourced from Data/Values/primary_targets_values.csv
// and Data/Values/secondary_targets_values.csv.
//
// Primary items store a single Base_Value (normal mode, no alarm, not the
// first grab this week). The rest are computed with flat multipliers in
// script.js: x4 for first-time-this-week, x0.75 for triggering the alarm,
// x1.10 for Hard mode — all of these stack multiplicatively.
//
// Secondary items store Min_Value/Max_Value since the real payout is a
// spectrum — the setup-map editor lets the user type in the exact value
// they see in-game rather than assuming a fixed number. Hard mode still
// applies its own flat x1.10 on top of whatever value is entered.

const rawItems = [
    { Target: 'A Cast of Characters', Type: 'Primary', Base_Value: 306000 },
    { Target: 'A Winding Road Home', Type: 'Primary', Base_Value: 314000 },
    { Target: 'Breathless', Type: 'Primary', Base_Value: 307500 },
    { Target: 'Brother Brother', Type: 'Primary', Base_Value: 305500 },
    { Target: 'Chat on Fruit', Type: 'Primary', Base_Value: 310000 },
    { Target: 'Consumato', Type: 'Primary', Base_Value: 308000 },
    { Target: 'Gone To Seed', Type: 'Primary', Base_Value: 306500 },
    { Target: 'Hare Oneself Think', Type: 'Primary', Base_Value: 304500 },
    { Target: 'I, Fruit', Type: 'Primary', Base_Value: 312000 },
    { Target: 'I Hear Voices', Type: 'Primary', Base_Value: 308500 },
    { Target: 'In Excess of Success', Type: 'Primary', Base_Value: 313000 },
    { Target: 'Juiced', Type: 'Primary', Base_Value: 313500 },
    { Target: 'La Dernière Débauche', Type: 'Primary', Base_Value: 481250 },
    { Target: 'Mi O Melee', Type: 'Primary', Base_Value: 317000 },
    { Target: 'Pumpkin', Type: 'Primary', Base_Value: 310500 },
    { Target: 'Stacks Study V', Type: 'Primary', Base_Value: 311500 },
    { Target: 'Teckels', Type: 'Primary', Base_Value: 314500 },
    { Target: 'The Downfall of Rome', Type: 'Primary', Base_Value: 305000 },
    { Target: 'The Girl With the Pearl Necklace', Type: 'Primary', Base_Value: 309500 },
    { Target: 'The Outcome of Endeavour', Type: 'Primary', Base_Value: 365000 },
    { Target: 'To Beat About the Bush', Type: 'Primary', Base_Value: 312500 },
    { Target: 'True Love', Type: 'Primary', Base_Value: 307000 },
    { Target: 'Trust', Type: 'Primary', Base_Value: 315000 },
    { Target: 'Twindifference', Type: 'Primary', Base_Value: 311000 },
    { Target: 'Until Death', Type: 'Primary', Base_Value: 315500 },
    { Target: 'What Are Melons?', Type: 'Primary', Base_Value: 316000 },
    { Target: 'Winter, Nowhere in Particular', Type: 'Primary', Base_Value: 309000 },

    { Target: 'Canis Hominem Edit', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: 'Cooked', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: 'Do You See Me', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: "Don't Forgo These Blueprints", Type: 'Secondary', Category: 'Paintings', Min_Value: 140000, Max_Value: 162500, Fill: 50 },
    { Target: 'Explain Yourself', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: 'Het Gouden Hondje', Type: 'Secondary', Category: 'Paintings', Min_Value: 70000, Max_Value: 92500, Fill: 50 },
    { Target: 'La Duchesse', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: 'Orange Crush', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: 'Sod Off', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: 'Swingset Study No. LXIX', Type: 'Secondary', Category: 'Paintings', Min_Value: 70000, Max_Value: 92500, Fill: 50 },
    { Target: 'The Chief', Type: 'Secondary', Category: 'Paintings', Min_Value: 102500, Max_Value: 122500, Fill: 50 },
    { Target: 'The Great Circle Back', Type: 'Secondary', Category: 'Paintings', Min_Value: 140000, Max_Value: 162500, Fill: 50 },
    { Target: 'The Hunter Becomes the Hunted', Type: 'Secondary', Category: 'Paintings', Min_Value: 70000, Max_Value: 92500, Fill: 50 },
    { Target: 'With Friends Like These', Type: 'Secondary', Category: 'Paintings', Min_Value: 70000, Max_Value: 92500, Fill: 50 },
    { Target: 'Coquard Carcanet (Emerald)', Type: 'Secondary', Category: 'Necklaces', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Coquard Carcanet (Imperial Topaz)', Type: 'Secondary', Category: 'Necklaces', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Coquard Carcanet (Red Spinel)', Type: 'Secondary', Category: 'Necklaces', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Coquard Carcanet (Sapphire)', Type: 'Secondary', Category: 'Necklaces', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Coquard Carcanet (Tanzanite)', Type: 'Secondary', Category: 'Necklaces', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Coquard Carcanet (Yellow Diamond)', Type: 'Secondary', Category: 'Necklaces', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Aquamarine Gemstone', Type: 'Secondary', Category: 'Jewelry', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Emerald Gemstone', Type: 'Secondary', Category: 'Jewelry', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Gray Spinel Gemstone', Type: 'Secondary', Category: 'Jewelry', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Purple Sapphire Gemstone', Type: 'Secondary', Category: 'Jewelry', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Ruby Gemstone', Type: 'Secondary', Category: 'Jewelry', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Tanzanite Gemstone', Type: 'Secondary', Category: 'Jewelry', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Yellow Topaz Gemstone', Type: 'Secondary', Category: 'Jewelry', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Memento Non Mori (Amethyst)', Type: 'Secondary', Category: 'Skulls', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Memento Non Mori (Diamond)', Type: 'Secondary', Category: 'Skulls', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Memento Non Mori (Emerald)', Type: 'Secondary', Category: 'Skulls', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Memento Non Mori (Gold)', Type: 'Secondary', Category: 'Skulls', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Memento Non Mori (Ruby)', Type: 'Secondary', Category: 'Skulls', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Memento Non Mori (Sapphire)', Type: 'Secondary', Category: 'Skulls', Min_Value: 77500, Max_Value: 100000, Fill: 30 },
    { Target: 'Cremello Dutch Warmblood', Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Gold Turkoman', Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Marble Sabino Criollo', Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Perlino Andalusian', Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Silver Dapple Pinto', Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: "Venus d'Algernon (Bronze)", Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: "Venus d'Algernon (Gold)", Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: "Venus d'Algernon (Ivory)", Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: "Venus d'Algernon (Marble)", Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: "Venus d'Algernon (Silver)", Type: 'Secondary', Category: 'Statues', Min_Value: 100000, Max_Value: 127500, Fill: 30 },
    { Target: 'Crate in the truck', Type: 'Secondary', Category: 'Crate', Min_Value: 105000, Max_Value: 140000, Fill: 30 },
    { Target: 'Œuf de Coquard de vouivre', Type: 'Secondary', Category: 'Ornamental Eggs', Min_Value: 50000, Max_Value: 64000, Fill: 20 },
    { Target: 'Œuf de Coquard des abimes', Type: 'Secondary', Category: 'Ornamental Eggs', Min_Value: 50000, Max_Value: 64000, Fill: 20 },
    { Target: 'Œuf de Coquard décoratif', Type: 'Secondary', Category: 'Ornamental Eggs', Min_Value: 50000, Max_Value: 64000, Fill: 20 },
    { Target: 'Œuf de Coquard enchanté', Type: 'Secondary', Category: 'Ornamental Eggs', Min_Value: 50000, Max_Value: 64000, Fill: 20 },
    { Target: 'Œuf de Coquard forestier', Type: 'Secondary', Category: 'Ornamental Eggs', Min_Value: 50000, Max_Value: 64000, Fill: 20 },
    { Target: 'Œuf de Coquard royal', Type: 'Secondary', Category: 'Ornamental Eggs', Min_Value: 50000, Max_Value: 64000, Fill: 20 },
    { Target: 'Œuf de Coquard verdoyant', Type: 'Secondary', Category: 'Ornamental Eggs', Min_Value: 50000, Max_Value: 64000, Fill: 20 },
    { Target: 'Fertility Statue (Bronze)', Type: 'Secondary', Category: 'Idols', Min_Value: 70000, Max_Value: 96000, Fill: 20 },
    { Target: 'Fertility Statue (Gold)', Type: 'Secondary', Category: 'Idols', Min_Value: 70000, Max_Value: 96000, Fill: 20 },
    { Target: 'Fertility Statue (Ivory)', Type: 'Secondary', Category: 'Idols', Min_Value: 70000, Max_Value: 96000, Fill: 20 },
    { Target: 'Fertility Statue (Mahogany)', Type: 'Secondary', Category: 'Idols', Min_Value: 70000, Max_Value: 96000, Fill: 20 },
    { Target: 'Fertility Statue (Silver)', Type: 'Secondary', Category: 'Idols', Min_Value: 70000, Max_Value: 96000, Fill: 20 },
    { Target: 'Meteorite Fragment', Type: 'Secondary', Category: 'Meteorite', Min_Value: 70000, Max_Value: 92500, Fill: 20 },
    { Target: 'Antique Rings', Type: 'Secondary', Category: 'Rings', Min_Value: 42000, Max_Value: 53000, Fill: 10 },
    { Target: 'Art Deco Rings', Type: 'Secondary', Category: 'Rings', Min_Value: 42000, Max_Value: 53000, Fill: 10 },
    { Target: 'Coquard Rings', Type: 'Secondary', Category: 'Rings', Min_Value: 42000, Max_Value: 53000, Fill: 10 },
    { Target: 'Antique Bands', Type: 'Secondary', Category: 'Bracelets', Min_Value: 28000, Max_Value: 35000, Fill: 10 },
    { Target: 'Art Deco Circlets', Type: 'Secondary', Category: 'Bracelets', Min_Value: 42000, Max_Value: 53000, Fill: 10 },
    { Target: 'Byzantine Hoops', Type: 'Secondary', Category: 'Bracelets', Min_Value: 28000, Max_Value: 35000, Fill: 10 },
    { Target: 'Coquard Bracelets', Type: 'Secondary', Category: 'Bracelets', Min_Value: 28000, Max_Value: 35000, Fill: 10 },
    { Target: 'Pharaonic Bangles', Type: 'Secondary', Category: 'Bracelets', Min_Value: 28000, Max_Value: 35000, Fill: 10 },
    { Target: 'Deposit Box (10,000 · 5% chance)', Type: 'Secondary', Category: 'Deposit Boxes', Min_Value: 10000, Max_Value: 10000, Fill: 30 },
    { Target: 'Deposit Box (12,500 · 5% chance)', Type: 'Secondary', Category: 'Deposit Boxes', Min_Value: 12500, Max_Value: 12500, Fill: 30 },
    { Target: 'Deposit Box (8,000 · 35% chance)', Type: 'Secondary', Category: 'Deposit Boxes', Min_Value: 8000, Max_Value: 8000, Fill: 30 },
    { Target: 'Deposit Box (5,000 · 10% chance)', Type: 'Secondary', Category: 'Deposit Boxes', Min_Value: 5000, Max_Value: 5000, Fill: 30 },
    { Target: 'Deposit Box (6,000 · 10% chance)', Type: 'Secondary', Category: 'Deposit Boxes', Min_Value: 6000, Max_Value: 6000, Fill: 30 },
    { Target: 'Deposit Box (7,500 · 35% chance)', Type: 'Secondary', Category: 'Deposit Boxes', Min_Value: 7500, Max_Value: 7500, Fill: 30 }
];

export default rawItems.map((item, index) => {
    const defaultValue = item.Type === 'Secondary'
        ? Math.round((item.Min_Value + item.Max_Value) / 2 / 500) * 500
        : item.Base_Value;
    return { ...item, key: item.Target, label: item.Target, defaultValue, index };
});

// Category display order for the setup-map item picker (cosmetic grouping —
// see script.js for the one hard filter that's actually applied).
export const CATEGORY_ORDER = [
    'Paintings', 'Jewelry', 'Necklaces', 'Bracelets', 'Rings', 'Ornamental Eggs',
    'Statues', 'Skulls', 'Idols', 'Meteorite', 'Crate', 'Deposit Boxes'
];
