import * as THREE from 'three';

const deg = THREE.MathUtils.degToRad;

// Golden-hour sun a hand's width above the hill crest, a little right of the starting view (-Z).
export const SUN_ELEVATION = deg(13);
export const SUN_AZIMUTH = deg(8);
export const SUN_DIR = new THREE.Vector3(
  Math.sin(SUN_AZIMUTH) * Math.cos(SUN_ELEVATION),
  Math.sin(SUN_ELEVATION),
  -Math.cos(SUN_AZIMUTH) * Math.cos(SUN_ELEVATION),
).normalize();

// Wind blows from the left of the starting view toward the right and slightly toward the camera.
export const WIND_DIR = new THREE.Vector2(0.88, 0.47).normalize();

// All colours are linear RGB (the scene renders in HDR and is tone-mapped at the end).
const lin = (r, g, b) => new THREE.Color().setRGB(r, g, b);
export const LIGHT = {
  sun: lin(1.0, 0.8, 0.56).multiplyScalar(4.2),
  ambSky: lin(0.55, 0.6, 0.72),
  ambGround: lin(0.42, 0.29, 0.15),
  fog: lin(1.35, 1.45, 1.65),
  fogSun: lin(4.8, 2.95, 1.25),
  fogDensity: 0.0019,
  fogFalloff: 1 / 90,
};

// Rolling hills: layered noise plus one broad hill rising toward the sun from the spawn,
// so the opening view looks up a golden slope with the sun just over its crest.
export const TERRAIN = {
  offset: [180, -480],
  hero: [Math.sin(SUN_AZIMUTH) * 150, -Math.cos(SUN_AZIMUTH) * 150],
  heroHeight: 16,
  heroRadius: 80,
};

// Player tuning. Distances in metres, times in seconds.
export const MOVE = {
  walkSpeed: 1.45,
  runSpeed: 5.4,
  groundAccel: 9.5,
  groundDecel: 11.0,
  airAccel: 2.2,
  turnRate: 11.0,
  maxTurnSpeed: 13.0,
  gravity: 24.0,
  fallGravityMul: 1.55,
  shortJumpGravityMul: 2.4,
  apexGravityMul: 0.62,
  apexBand: 1.6,
  jumpHeight: 1.45,
  coyoteTime: 0.11,
  jumpBuffer: 0.13,
  maxFallSpeed: 22,
};

// Grass push slots: the samurai, his footsteps, then foes and the fallen.
export const TRAIL_N = 16;
export const TRAIL_STEPS = 8;

export const QUALITY = {
  high: { name: 'high', pixelRatio: 1.5, msaa: 4, grass: 1.0, plumes: 1.0, motes: 1.0, bloomLevels: 6, shadowSize: 1024, dof: 1 },
  medium: { name: 'medium', pixelRatio: 1.15, msaa: 4, grass: 0.6, plumes: 0.65, motes: 0.7, bloomLevels: 6, shadowSize: 1024, dof: 1 },
  low: { name: 'low', pixelRatio: 0.9, msaa: 0, grass: 0.36, plumes: 0.42, motes: 0.5, bloomLevels: 5, shadowSize: 512, dof: 0 },
};
// Last resort for weak phones: fewer pixels and less grass.
QUALITY.lowest = { name: 'lowest', pixelRatio: 0.72, msaa: 0, grass: 0.24, plumes: 0.28, motes: 0.35, bloomLevels: 4, shadowSize: 512, dof: 0 };
export const QUALITY_ORDER = ['lowest', 'low', 'medium', 'high'];
