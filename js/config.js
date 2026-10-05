// Every tuning number for the game lives here so it is easy to adjust.
// Distances are meters, times are seconds, speeds are m/s.

export const GAME_TITLE = 'STORMDROP';

export const MAP = {
  size: 1000, // island play area is 1000 x 1000 m
  half: 500,
  terrainSize: 1120, // terrain mesh extends a little into the ocean
  terrainSegments: 256,
  seaLevel: 0,
  seaFloor: -24,
  busAltitude: 560, // drop height 500-600 m
  busSpeed: 36,
  boundaryRadius: 620,
};

export const PLAYER = {
  height: 1.8,
  crouchHeight: 1.2,
  radius: 0.4,
  eye: 1.6,
  crouchEye: 1.05,
  walk: 5,
  sprint: 7.5,
  crouch: 2.5,
  adsSpeedMul: 0.6,
  swim: 3.2,
  jumpHeight: 1.2,
  gravity: 20,
  stepHeight: 0.55,
  freefallDown: 50,
  freefallSide: 20,
  glideForward: 15,
  glideDown: 6,
  autoGlideHeight: 85, // glider opens on its own this high above ground
  maxHealth: 100,
  maxShield: 100,
  fallDamageSpeed: 19, // impact speed (m/s) above which landing hurts (a drop of about 3 floors)
  fallDamagePerMs: 4.5, // damage per m/s of impact above that
};

export const CAMERA = {
  right: 0.7,
  up: 0.4,
  back: 3,
  fov: 80,
  adsFov: 52,
  scopeFov: 16,
  adsZoom: 1.95, // Zero Hour's fixed zoom for iron and red-dot sights
  scopeZoom: 4.2,
};

// Storm: wait, shrink time, damage per second. Radius shrinks to ~50-60% each phase.
export const STORM_PHASES = [
  { wait: 240, shrink: 180, dps: 1 },
  { wait: 180, shrink: 120, dps: 1 },
  { wait: 120, shrink: 90, dps: 3 },
  { wait: 120, shrink: 60, dps: 5 },
  { wait: 90, shrink: 60, dps: 7 },
  { wait: 60, shrink: 45, dps: 9 },
  { wait: 60, shrink: 30, dps: 10 },
];
export const STORM_START_RADIUS = 720; // covers the whole 1000 x 1000 island
export const STORM_FINAL_CLOSE = { shrink: 40, dps: 10 }; // after phase 7 the eye closes fully

export const BUILD = {
  tile: 4,
  wallHeight: 3,
  cost: 10,
  matCap: 999,
  hp: { wood: 150, stone: 300, metal: 450 },
  buildTime: { wood: 1.5, stone: 3, metal: 4.5 }, // time to reach full HP; metal slowest
  startHpFrac: 0.3,
  reach: 7,
};

export const MATERIALS = ['wood', 'stone', 'metal'];

export const GATHER = {
  min: 20,
  max: 30,
  weakMin: 40,
  weakMax: 50,
  swingRate: 1.6, // swings per second
  damage: 50,
  weakDamage: 100,
  reach: 3.2,
  playerDamage: 20,
  structureDamage: 50,
};

// Healing items: use time is interrupted by damage or sprinting.
export const HEALS = {
  bandage: { name: 'Bandages', short: 'BND', hp: 15, time: 4, cap: 75, stack: 15, spawn: 5, rarity: 0, color: '#e8e4dc' },
  medkit: { name: 'Med Kit', short: 'MED', hp: 100, time: 10, cap: 100, stack: 3, spawn: 1, rarity: 1, color: '#e2463f' },
  mini: { name: 'Mini Shield', short: 'MINI', shield: 25, time: 2, cap: 50, stack: 6, spawn: 3, rarity: 1, color: '#47a6ff' },
  big: { name: 'Shield Jug', short: 'BIG', shield: 50, time: 5, cap: 100, stack: 3, spawn: 1, rarity: 2, color: '#2f6dff' },
};

export const AMMO_TYPES = ['light', 'medium', 'heavy', 'shells', 'rockets'];
export const AMMO_CAPS = { light: 250, medium: 200, heavy: 30, shells: 50, rockets: 12 };
export const AMMO_PICKUP = { light: 36, medium: 30, heavy: 6, shells: 8, rockets: 3 };
export const AMMO_NAMES = { light: 'Light', medium: 'Medium', heavy: 'Heavy', shells: 'Shells', rockets: 'Rockets' };

export const RARITY = [
  { name: 'Common', color: '#a7aeb6' },
  { name: 'Uncommon', color: '#4fcf5a' },
  { name: 'Rare', color: '#3c9cff' },
  { name: 'Epic', color: '#b25cff' },
  { name: 'Legendary', color: '#ffb22e' },
];
export const RARITY_DAMAGE_STEP = 0.08; // +8% damage per tier above common: a gold gun hits a third harder than a gray one
// Bots hit softer than players, by difficulty (easy, normal, hard).
export const BOT_DAMAGE = [0.5, 0.68, 0.85];

// Common-tier weapon values. falloff: [full damage until, reaches mul at, mul].
export const WEAPONS = {
  ar: {
    name: 'KR-4 Carbine', short: 'AR', damage: 30, headMul: 1.5, rate: 5.5, mag: 30, reload: 2.3,
    ammo: 'medium', range: 300, falloff: [50, 160, 0.7], spreadHip: 2.4, spreadAds: 0.45,
    bloom: 0.45, bloomMax: 3.5, moveSpread: 1.6, structure: 30, rarities: [0, 4], kind: 'hitscan',
    recoil: 0.9, rec: [0.62, 0.28], adsTime: 0.18, slot: 'rifle',
  },
  shotgun: {
    name: 'Mastiff 12 Pump', short: 'PUMP', damage: 78, headDamage: 125, pellets: 10, rate: 0.7, mag: 5,
    reload: 5, ammo: 'shells', range: 55, falloff: [5, 32, 0.15], spreadHip: 6, spreadAds: 4.2,
    bloom: 0, bloomMax: 0, moveSpread: 1, structure: 70, rarities: [0, 4], kind: 'pellets',
    recoil: 4, rec: [3.2, 0.9], adsTime: 0.18, slot: 'shotgun',
  },
  smg: {
    name: 'Vespa-9 SMG', short: 'SMG', damage: 17, headMul: 1.5, rate: 12, mag: 30, reload: 2,
    ammo: 'light', range: 130, falloff: [20, 70, 0.6], spreadHip: 3.4, spreadAds: 2,
    bloom: 0.25, bloomMax: 3, moveSpread: 1.2, structure: 17, rarities: [0, 3], kind: 'hitscan',
    recoil: 0.5, rec: [0.5, 0.36], adsTime: 0.14, slot: 'smg',
  },
  pistol: {
    name: 'X9 Sidearm', short: 'PSTL', damage: 24, headMul: 1.75, rate: 6.5, mag: 16, reload: 1.5,
    ammo: 'light', range: 160, falloff: [30, 100, 0.65], spreadHip: 2, spreadAds: 0.8,
    bloom: 0.5, bloomMax: 3, moveSpread: 1.2, structure: 24, rarities: [0, 2], kind: 'hitscan',
    recoil: 1.2, rec: [1.35, 0.3], adsTime: 0.12, slot: 'pistol',
  },
  sniper: {
    name: 'Kodiak .338 Sniper', short: 'SNPR', damage: 105, headDamage: 157, rate: 0.3, mag: 1, reload: 3,
    ammo: 'heavy', range: 1200, spreadHip: 7, spreadAds: 0, bloom: 0, bloomMax: 0, moveSpread: 2,
    structure: 105, rarities: [2, 4], kind: 'projectile', speed: 380, gravity: 9.8,
    recoil: 6, rec: [3.6, 0.8], adsTime: 0.26, slot: 'sniper', scope: true,
  },
  rocket: {
    name: 'RPG-9 Launcher', short: 'RKT', damage: 110, rate: 0.75, mag: 1, reload: 4,
    ammo: 'rockets', range: 400, spreadHip: 1.5, spreadAds: 0.3, bloom: 0, bloomMax: 0,
    moveSpread: 1, structure: 450, rarities: [3, 4], kind: 'projectile', speed: 55, gravity: 0,
    splash: 4.5, recoil: 5, rec: [5, 0.6], adsTime: 0.22, slot: 'rocket',
  },
  lmg: {
    name: 'Brute M6 LMG', short: 'LMG', damage: 24, headMul: 1.5, rate: 8, mag: 100, reload: 5,
    ammo: 'medium', range: 260, falloff: [40, 140, 0.7], spreadHip: 3.3, spreadAds: 0.7,
    bloom: 0.3, bloomMax: 3.2, moveSpread: 1.8, structure: 24, rarities: [1, 3], kind: 'hitscan',
    recoil: 0.8, rec: [0.58, 0.42], adsTime: 0.26, slot: 'lmg',
  },
};

export const WEAPON_SPAWN_WEIGHTS = { ar: 28, shotgun: 24, smg: 17, pistol: 13, lmg: 6, sniper: 8, rocket: 4 };

// Rarity odds by loot quality [common, uncommon, rare, epic, legendary].
export const RARITY_ODDS = {
  low: [46, 33, 16, 4.5, 0.5],
  medium: [34, 36, 22, 7, 1],
  high: [22, 34, 30, 11, 3],
  chest: [14, 32, 34, 15, 5],
  supply: [0, 0, 0, 60, 40],
};

export const LOOT = {
  floorPerFloor: { low: 1, medium: 2, high: 3 },
  supplyFirst: 120,
  supplyMin: 120,
  supplyMax: 180,
  supplyFall: 5,
  chestCueRange: 14,
};

export const INVENTORY = { slots: 5 };

export const VEHICLE = { maxSpeed: 26, reverse: 9, accel: 9, brake: 18, turn: 1.7, hp: 600 };

export const BOT_NAMES = [
  'PixelViper', 'NovaKnight', 'GritGoose', 'LagSpike', 'ByteBandit', 'Quillfire', 'MossyMango',
  'TurboTaco', 'SirLoot', 'ZapZebra', 'EchoFox', 'CrispyPanda', 'Wombatron', 'RiftRunner',
  'SnackAttack', 'ChillPenguin', 'VoltVixen', 'Dunebug', 'MistyMoose', 'CobaltCrow',
  'SprocketSam', 'HopScotch', 'Glimmerling', 'RustyRidge', 'TofuTitan', 'JollyJackal',
  'KiloKoala', 'BlazeBadger', 'NimbusNed', 'OrbitOtter',
];

export const TIPS = [
  'Shields soak damage before health. Drink a Shield Jug before you take a fight.',
  'Gold chests hum and glow. Listen for the shimmer when you enter a building.',
  'Every piece costs 10 materials. Wood builds fastest; metal is toughest but slowest.',
  'The storm ignores shields. Watch the timer at the top of the screen and move early.',
  'Aim down sights to tighten bullet spread. Moving and sprinting widen it.',
  'Snipers have bullet drop. Aim a little higher on far targets.',
  'Hit the glowing weak spot while gathering for double materials.',
  'Healing is interrupted by damage or sprinting. Find cover first.',
  'Pieces that lose their support collapse. Shoot the bottom of a tower to drop it.',
  'Supply drops fall from the sky every few minutes. Look for the red flare.',
  'Rockets wreck structures. Build a second wall behind your first one.',
  'Switch shoulders to peek around corners without stepping out.',
  'Crouching makes you harder to hit and steadies your aim.',
  'Eliminated players drop everything they carried.',
  'Trucks parked on roads can carry you out of the storm fast. Press E to drive.',
];
