// Hand-designed layout of the island: coastline, named areas, biomes, rivers and roads.
// Coordinates: +X is east, +Z is south (north is -Z). The main island spans roughly -460..470.
// Rough layout: snowy peaks in the east, desert and red mesas in the south and south-east, autumn woods in
// the west around a lagoon and bayou, dark forest and farmland in the north, the city in the middle.

// loot: 'high' (contested), 'medium' or 'low'. sea: direction (radians, atan2(z, x)) toward open water.
export const POIS = [
  { id: 'neon', name: 'Neon Heights', x: 0, z: 30, r: 72, type: 'city', loot: 'high' },
  { id: 'crown', name: 'Crown Citadel', x: 150, z: -212, r: 50, type: 'castle', loot: 'high' },
  { id: 'rustbelt', name: 'Rustbelt Works', x: -150, z: 262, r: 64, type: 'factory', loot: 'high' },
  { id: 'observatory', name: 'Skyline Observatory', x: 330, z: -60, r: 42, type: 'observatory', loot: 'high' },
  { id: 'frostpeak', name: 'Frostpeak Lodge', x: 290, z: 82, r: 56, type: 'snow', loot: 'medium' },
  { id: 'mirage', name: 'Mirage Mesa', x: 228, z: 232, r: 60, type: 'desert', loot: 'medium' },
  { id: 'murkwater', name: 'Murkwater Bayou', x: -318, z: 176, r: 58, type: 'swamp', loot: 'medium' },
  { id: 'golden', name: 'Golden Acres', x: -70, z: -280, r: 60, type: 'farm', loot: 'medium' },
  { id: 'glimmer', name: 'Glimmer Lake', x: -140, z: -120, r: 66, type: 'lake', loot: 'medium' },
  { id: 'voltage', name: 'Voltage Yard', x: -168, z: 92, r: 52, type: 'power', loot: 'medium' },
  { id: 'harbor', name: 'Harbor Point', x: -332, z: -186, r: 46, type: 'harbor', loot: 'low', sea: Math.PI * 1.13 },
  { id: 'timberline', name: 'Timberline Camp', x: -204, z: -290, r: 44, type: 'camp', loot: 'low' },
  { id: 'amberwood', name: 'Amberwood Hollow', x: -276, z: -72, r: 48, type: 'cabins', loot: 'low' },
  { id: 'sunscorch', name: 'Sunscorch Outpost', x: 68, z: 342, r: 42, type: 'outpost', loot: 'low' },
  { id: 'coral', name: 'Coral Cove', x: -300, z: 330, r: 46, type: 'beach', loot: 'low' },
  { id: 'redrock', name: 'Redrock Gulch', x: 140, z: 388, r: 40, type: 'desert', loot: 'low' },
  { id: 'gullrock', name: 'Gull Rock', x: -40, z: -462, r: 22, type: 'camp', loot: 'low' },
  { id: 'maple', name: 'Maple Grove', x: 112, z: -14, r: 58, type: 'suburb', loot: 'medium' },
  { id: 'pitstop', name: 'Pit Stop', x: -80, z: 170, r: 30, type: 'outpost', loot: 'low' },
];

export const LAKE = { x: -140, z: -120, r: 38, depth: -4.5 };

// Coast radius every 15 degrees, starting due east and turning toward the south (+Z).
export const COAST = [
  430, 440, 466, 478, 470, 452, 440, 440, 458, 486, 452, 360, 410, 426, 452, 468, 432, 392, 380, 392, 420, 396, 448, 438,
];

// Small islands off the coast.
export const ISLETS = [
  { x: -40, z: -462, r: 40, h: 9 },
  { x: -478, z: 236, r: 26, h: 5 },
  { x: 436, z: 372, r: 30, h: 7 },
];

// Bays cut into the coastline (the west lagoon behind the bayou).
export const BAYS = [{ x: -376, z: 100, r: 96 }];

// Ponds the rivers rise from.
export const PONDS = [
  { x: 66, z: -168, r: 16 },
  { x: 238, z: -12, r: 26 },
  { x: -232, z: -206, r: 12 },
  { x: 252, z: -128, r: 14 },
];

// Peaks and hills: snow massif in the east, castle hill in the north, forest hills in the north-west.
export const MOUNTAINS = [
  { x: 330, z: -60, height: 102, sigma: 74, ridge: 0.18 },
  { x: 292, z: -186, height: 64, sigma: 50, ridge: 0.22 },
  { x: 390, z: 20, height: 46, sigma: 40, ridge: 0.2 },
  { x: 150, z: -214, height: 20, sigma: 58, ridge: 0.1 },
  { x: -232, z: -244, height: 22, sigma: 56, ridge: 0.12 },
  { x: -40, z: 196, height: 10, sigma: 64, ridge: 0.08 },
];

// Flat-topped red rock buttes in the southern desert.
export const MESAS = [
  { x: 186, z: 330, r: 24, h: 17 },
  { x: 262, z: 322, r: 18, h: 13 },
  { x: 322, z: 262, r: 20, h: 15 },
  { x: 122, z: 276, r: 15, h: 11 },
];

// Biome anchors: each point belongs to the biome with the nearest (noise-warped) anchor.
export const BIOMES = {
  grass: [[0, 30], [-168, 92], [-130, 220], [86, -70], [-40, -100], [120, 40], [-70, 330], [-200, 200]],
  forest: [[-204, -290], [-300, -270], [30, -200], [-130, -370], [140, -300], [60, -380]],
  snow: [[330, -60], [292, -186], [390, 20], [290, 82], [230, -100]],
  desert: [[228, 232], [340, 210], [110, 310], [180, 140], [140, 388], [30, 410], [250, 380]],
  swamp: [[-318, 176], [-380, 250], [-250, 150]],
  autumn: [[-276, -72], [-200, -30], [-380, -40], [-340, -150]],
  farm: [[-70, -280], [-10, -320]],
};

export const RIVERS = [
  // from the snow foothills west past the castle hill, through Glimmer Lake, out into the west lagoon
  {
    halfWidth: 5,
    bank: 7,
    points: [
      [252, -128], [205, -112], [152, -96], [96, -104], [40, -96], [-20, -112], [-80, -122], [-140, -120],
      [-172, -72], [-186, -22], [-214, 28], [-258, 66], [-300, 92], [-340, 100], [-440, 104],
    ],
  },
  // from the snow valley south through the desert to the south coast
  {
    halfWidth: 4.5,
    bank: 7,
    points: [
      [238, -12], [196, 40], [160, 100], [128, 168], [88, 222], [40, 262], [0, 308], [-28, 370], [-48, 430], [-60, 530],
    ],
  },
  // north river from the castle hill down to a delta on the north shore
  {
    halfWidth: 4,
    bank: 6,
    points: [[66, -168], [40, -236], [62, -290], [40, -342], [12, -390], [0, -440], [-8, -520]],
  },
  // a creek through the north-west woods
  {
    halfWidth: 3.2,
    bank: 5,
    points: [[-232, -206], [-262, -236], [-292, -252], [-340, -280], [-400, -304], [-470, -320]],
  },
];

export const ROAD_HALF_WIDTH = 3.5;

export const ROADS = [
  [[0, 30], [-90, 70], [-168, 92]],
  [[0, 30], [50, -60], [108, -140], [150, -212]],
  [[0, 30], [100, 110], [178, 180], [228, 232]],
  [[0, 30], [-50, 140], [-110, 212], [-150, 262]],
  [[0, 30], [-60, -40], [-104, -88]],
  [[-168, 92], [-250, 132], [-318, 176]],
  [[-150, 262], [-225, 305], [-300, 330]],
  [[-150, 262], [-62, 318], [10, 348], [68, 342]],
  [[68, 342], [150, 296], [228, 232]],
  [[68, 342], [106, 372], [140, 388]],
  [[228, 232], [270, 160], [290, 82]],
  [[150, -212], [60, -258], [-10, -280], [-70, -280]],
  [[-70, -280], [-140, -296], [-204, -290]],
  [[-204, -290], [-270, -240], [-332, -186]],
  [[-332, -186], [-310, -130], [-276, -72]],
  [[-276, -72], [-216, -102], [-180, -116]],
  [[-140, -162], [-104, -222], [-70, -280]],
  [[0, 30], [58, 10], [112, -14]],
  [[112, -14], [196, 30], [290, 82]],
];

// Biome ground palettes (sRGB hex).
export const BIOME_COLORS = {
  grass: ['#4f8a34', '#5b9439', '#467d2d'],
  forest: ['#355f27', '#3e6c2c', '#2e5622'],
  snow: ['#eef3f8', '#dfe8f1', '#f7fbff'],
  desert: ['#d9a862', '#cf9450', '#e2b87a'],
  swamp: ['#4a5a2a', '#405026', '#566034'],
  autumn: ['#93622f', '#a4522c', '#857034'],
  farm: ['#6fa63c', '#b9a248', '#7a5e36'],
};
