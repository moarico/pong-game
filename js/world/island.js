// Hand-designed layout of the island: named areas, biomes, rivers and roads.
// Coordinates: +X is east, +Z is south (north is -Z). The island spans roughly -480..480.

// loot: 'high' (contested), 'medium' or 'low'.
export const POIS = [
  { id: 'neon', name: 'Neon Heights', x: 0, z: 30, r: 72, type: 'city', loot: 'high' },
  { id: 'crown', name: 'Crown Citadel', x: 165, z: 95, r: 50, type: 'castle', loot: 'high' },
  { id: 'rustbelt', name: 'Rustbelt Works', x: -215, z: 245, r: 64, type: 'factory', loot: 'high' },
  { id: 'observatory', name: 'Skyline Observatory', x: 300, z: -150, r: 42, type: 'observatory', loot: 'high' },
  { id: 'frostpeak', name: 'Frostpeak Lodge', x: 205, z: -285, r: 56, type: 'snow', loot: 'medium' },
  { id: 'mirage', name: 'Mirage Mesa', x: 235, z: 225, r: 60, type: 'desert', loot: 'medium' },
  { id: 'murkwater', name: 'Murkwater Bayou', x: -325, z: 30, r: 58, type: 'swamp', loot: 'medium' },
  { id: 'golden', name: 'Golden Acres', x: -40, z: -305, r: 60, type: 'farm', loot: 'medium' },
  { id: 'glimmer', name: 'Glimmer Lake', x: -150, z: -130, r: 66, type: 'lake', loot: 'medium' },
  { id: 'voltage', name: 'Voltage Yard', x: -175, z: 95, r: 52, type: 'power', loot: 'medium' },
  { id: 'harbor', name: 'Harbor Point', x: -355, z: -170, r: 46, type: 'harbor', loot: 'low' },
  { id: 'timberline', name: 'Timberline Camp', x: 85, z: -150, r: 44, type: 'camp', loot: 'low' },
  { id: 'amberwood', name: 'Amberwood Hollow', x: -240, z: -280, r: 48, type: 'cabins', loot: 'low' },
  { id: 'sunscorch', name: 'Sunscorch Outpost', x: 95, z: 340, r: 42, type: 'outpost', loot: 'low' },
  { id: 'coral', name: 'Coral Cove', x: -70, z: 380, r: 46, type: 'beach', loot: 'low' },
];

export const LAKE = { x: -150, z: -130, r: 38, depth: -4.5 };

export const MOUNTAIN = { x: 305, z: -140, height: 105, sigma: 90 };

// Biome anchors: each point belongs to the biome with the nearest (noise-warped) anchor.
export const BIOMES = {
  grass: [[0, 30], [-175, 95], [-150, -130], [165, 95], [-215, 245], [60, 180], [-60, -120], [-80, 300], [20, 280]],
  forest: [[85, -150], [130, -40], [-30, -200]],
  snow: [[300, -150], [195, -290], [400, -40], [300, -300]],
  desert: [[235, 225], [110, 340], [340, 140], [180, 380]],
  swamp: [[-330, 30], [-300, 140], [-380, -40]],
  autumn: [[-240, -280], [-330, -150], [-150, -330]],
  farm: [[-40, -305], [40, -330], [-100, -250]],
};

export const RIVERS = [
  {
    halfWidth: 5,
    bank: 7,
    points: [
      [150, -45], [95, -62], [40, -62], [-20, -68], [-70, -85], [-115, -112], [-150, -130],
      [-195, -138], [-250, -118], [-300, -98], [-350, -85], [-420, -75], [-520, -70],
    ],
  },
  {
    halfWidth: 4.5,
    bank: 7,
    points: [
      [300, 40], [255, 105], [215, 155], [165, 195], [130, 260], [165, 330], [195, 400], [215, 520],
    ],
  },
];

export const ROAD_HALF_WIDTH = 3.5;

export const ROADS = [
  [[0, 30], [85, 70], [165, 95]],
  [[0, 30], [-90, 70], [-175, 95]],
  [[0, 30], [40, -60], [85, -150]],
  [[0, 30], [-80, -30], [-150, -80]],
  [[-175, 95], [-200, 170], [-215, 245]],
  [[-175, 95], [-250, 60], [-325, 30]],
  [[-215, 245], [-150, 320], [-70, 380]],
  [[-70, 380], [10, 365], [95, 340]],
  [[95, 340], [170, 285], [235, 225]],
  [[235, 225], [205, 160], [165, 95]],
  [[85, -150], [145, -220], [205, -285]],
  [[205, -285], [270, -230], [300, -150]],
  [[85, -150], [25, -235], [-40, -305]],
  [[-40, -305], [-140, -300], [-240, -280]],
  [[-150, -180], [-100, -250], [-40, -305]],
  [[-240, -280], [-300, -225], [-355, -170]],
  [[-355, -170], [-345, -70], [-325, 30]],
  [[0, 30], [30, 180], [95, 340]],
];

// Biome ground palettes (sRGB hex).
export const BIOME_COLORS = {
  grass: ['#5fae3e', '#6dbb46', '#4f9c37'],
  forest: ['#3f8a33', '#4b9a3a', '#356f2c'],
  snow: ['#eef3f8', '#dfe8f1', '#f7fbff'],
  desert: ['#e3b46a', '#d99c55', '#ecc684'],
  swamp: ['#55652f', '#4a5a2b', '#62683a'],
  autumn: ['#9f8a3c', '#a8783a', '#8f8a40'],
  farm: ['#8cbf4a', '#c9b450', '#8b6b3d'],
};
