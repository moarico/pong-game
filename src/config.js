import * as THREE from 'three';

const deg = THREE.MathUtils.degToRad;

// The sun hangs low over the bay, a little right of the starting view (-Z). The disc,
// the sky's glow and the glitter on the sea sit just above the horizon (SUN_DISC);
// surfaces are lit from a touch higher (SUN_DIR) so the hilltop stays in the light.
export const SUN_AZIMUTH = deg(8);
export const SUN_ELEVATION = deg(9);
export const SUN_DISC_ELEVATION = deg(3.4);
const sunVector = (el) => new THREE.Vector3(
  Math.sin(SUN_AZIMUTH) * Math.cos(el),
  Math.sin(el),
  -Math.cos(SUN_AZIMUTH) * Math.cos(el),
).normalize();
export const SUN_DIR = sunVector(SUN_ELEVATION);
export const SUN_DISC = sunVector(SUN_DISC_ELEVATION);

// Wind blows from the left of the starting view toward the right and slightly toward the camera.
export const WIND_DIR = new THREE.Vector2(0.88, 0.47).normalize();

// All colours are linear RGB (the scene renders in HDR and is tone-mapped at the end).
const lin = (r, g, b) => new THREE.Color().setRGB(r, g, b);
export const LIGHT = {
  sun: lin(1.0, 0.7, 0.4).multiplyScalar(3.3),
  ambSky: lin(0.34, 0.42, 0.62),
  ambGround: lin(0.36, 0.22, 0.1),
  // Air away from the sun: soft, warm grey. Toward it: orange, then molten gold.
  fog: lin(0.46, 0.38, 0.34),
  fogSun: lin(7.2, 3.0, 0.8),
  fogDensity: 0.00005, // per metre at sea level
  fogFalloff: 1 / 420, // clears with height
  mist: 0.00012, // a thin sea mist lying in the bay and the valleys
  mistFalloff: 1 / 26,
};

// The world: a grassy hilltop 150 m above a bay. The land rolls over a crest toward
// the sun and falls to the sea; headlands and islands stand in the water on either
// side, and mountains rise inland behind. Positions are given as a bearing from the
// sun (degrees, + to the right) and a distance from the spawn (metres).
const sunH = [Math.sin(SUN_AZIMUTH), -Math.cos(SUN_AZIMUTH)];
const right = [-sunH[1], sunH[0]];
const polar = (bearing, dist) => {
  const b = deg(bearing);
  return [
    (sunH[0] * Math.cos(b) + right[0] * Math.sin(b)) * dist,
    (sunH[1] * Math.cos(b) + right[1] * Math.sin(b)) * dist,
  ];
};
// Ridges: [from, to, radius at each end, height above the sea at each end].
const ridge = (b1, d1, b2, d2, r1, r2, h1, h2) => [...polar(b1, d1), ...polar(b2, d2), r1, r2, h1, h2];
export const TERRAIN = {
  offset: [180, -480],
  sunH,
  right,
  top: 150, // the hilltop above the sea
  crest: 10, // centre of the dome, metres toward the sun from the spawn
  knoll: 1.5, // a low rise under the spawn, so he stands on the brow
  knollRadius: 10,
  flat: 8, // radius of its level top
  slope: 0.42, // the fall of its sides, far from the top
  round: 90, // how gently the top rolls over into that fall
  across: 1.25, // sides fall faster than the front: a ridge running out to the sea
  seabed: -45,
  // Beyond this distance from the spawn the coast, islands and far hills come in.
  near: 300,
  // Each rises from a floor well below the sea, so the part above water is narrower
  // than the radius given here.
  ridges: [
    ridge(-118, 900, -42, 1450, 420, 260, 110, 30), // low headland, near left
    ridge(-105, 3200, -34, 6600, 1500, 1000, 330, 170), // far left hills
    ridge(-80, 7500, -28, 11000, 2000, 1200, 600, 260), // far left mountains
    ridge(112, 1100, 4, 2700, 520, 320, 160, 60), // headland, near right
    ridge(80, 2600, 8, 4900, 700, 420, 260, 90), // second headland, right
    ridge(62, 5000, 11, 9400, 1300, 800, 420, 130), // far right hills
    ridge(128, 3600, 232, 3600, 1800, 1800, 520, 520), // mountains inland, behind
  ],
  // Islands: [x, z, radius, height].
  islands: [
    [...polar(-41, 2300), 400, 44],
    [...polar(-50, 2050), 200, 16],
    [...polar(-14, 5200), 350, 30],
    [...polar(-21, 7400), 520, 50],
  ],
};
// The playable ground: a soft boundary keeps the fight on the hilltop.
export const PLAY_RADIUS = 180;

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
