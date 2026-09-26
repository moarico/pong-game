import * as THREE from 'three';

const deg = THREE.MathUtils.degToRad;

// The sun hangs low over the field, a little left of the starting view (-Z).
export const SUN_ELEVATION = deg(6.5);
export const SUN_AZIMUTH = deg(-11);
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
  sun: lin(1.0, 0.66, 0.4).multiplyScalar(3.3),
  ambSky: lin(0.15, 0.125, 0.185),
  ambGround: lin(0.11, 0.07, 0.04),
  fog: lin(0.34, 0.22, 0.28),
  fogSun: lin(3.2, 1.35, 0.42),
  fogDensity: 0.0045,
};

// Player tuning. Distances in metres, times in seconds.
export const MOVE = {
  walkSpeed: 1.6,
  runSpeed: 5.4,
  groundAccel: 9.5,
  groundDecel: 11.0,
  airAccel: 2.2,
  turnRate: 11.0,
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

export const TRAIL_N = 10;

export const QUALITY = {
  high: { name: 'high', pixelRatio: 1.5, msaa: 4, grass: 1.0, plumes: 1.0, motes: 1.0, bloomLevels: 6, shadowSize: 1024 },
  medium: { name: 'medium', pixelRatio: 1.15, msaa: 4, grass: 0.6, plumes: 0.65, motes: 0.7, bloomLevels: 6, shadowSize: 1024 },
  low: { name: 'low', pixelRatio: 0.9, msaa: 0, grass: 0.36, plumes: 0.42, motes: 0.5, bloomLevels: 5, shadowSize: 512 },
};
export const QUALITY_ORDER = ['low', 'medium', 'high'];
