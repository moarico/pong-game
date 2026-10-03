// Physics runs in Unreal units (uu), the units Rocket League uses (1 uu ≈ 1 cm).
// The renderer works in meters, so every position is multiplied by S before drawing.
export const S = 0.01;

export const PHYSICS_HZ = 120;
export const DT = 1 / PHYSICS_HZ;
export const GRAVITY = 650;

// Standard soccar arena. Y is up, goals sit on the ±Z ends, blue defends -Z.
export const ARENA = {
  halfX: 4096,
  halfZ: 5120,
  height: 2044,
  chamfer: 1150, // size of the 45° corner walls
  cornerR: 400, // rounding where the corner walls meet the side walls
  rampR: 280, // curved transition between the floor/ceiling and the walls
  goalHalfW: 893,
  goalH: 642,
  goalDepth: 880,
};

export const BALL = {
  radius: 93,
  mass: 30,
  maxSpeed: 6000,
  maxSpin: 6,
  drag: 0.0305,
  restitution: 0.6,
  friction: 0.285,
};

export const CAR = {
  mass: 180,
  restHeight: 17,
  // Octane hitbox
  hitboxHalf: { x: 42.1, y: 18.08, z: 59.0 },
  hitboxOffset: { x: 0, y: 20.75, z: 13.88 },
  wheels: [
    { x: 25.9, z: 51.25, r: 12.5, front: true },
    { x: -25.9, z: 51.25, r: 12.5, front: true },
    { x: 29.5, z: -33.75, r: 15, front: false },
    { x: -29.5, z: -33.75, r: 15, front: false },
  ],
  maxSpeed: 2300,
  maxDriveSpeed: 1410,
  supersonic: 2200,
  boostAccelGround: 991.67,
  boostAccelAir: 1058.33,
  boostUsePerSec: 33.3,
  brakeAccel: 3500,
  coastDecel: 525,
  airThrottleAccel: 66.67,
  jumpImpulse: 291.67,
  jumpHoldAccel: 1458.33,
  jumpHoldTime: 0.2,
  doubleJumpWindow: 1.25,
  dodgeImpulse: 500,
  dodgeTime: 0.65,
  stickyAccel: 325,
  maxAngVel: 5.5,
  // air control (rad/s^2) and damping, after Rocket League
  airRoll: 36.08,
  airPitch: 12.15,
  airYaw: 8.92,
  dampRoll: 4.47,
  dampPitch: 2.8,
  dampYaw: 1.89,
};

export const BOOST_START = 33;

// Rocket League soccar boost pad layout ([x, z]).
export const BIG_PADS = [
  [-3584, 0], [3584, 0],
  [-3072, -4096], [3072, -4096],
  [-3072, 4096], [3072, 4096],
];
export const SMALL_PADS = [
  [0, -4240], [-1792, -4184], [1792, -4184], [-940, -3308], [940, -3308],
  [0, -2816], [-3584, -2484], [3584, -2484], [-1788, -2300], [1788, -2300],
  [-2048, -1036], [0, -1024], [2048, -1036], [-1024, 0], [1024, 0],
  [-2048, 1036], [0, 1024], [2048, 1036], [-1788, 2300], [1788, 2300],
  [-3584, 2484], [3584, 2484], [0, 2816], [-940, 3310], [940, 3308],
  [-1792, 4184], [1792, 4184], [0, 4240],
];

// Kickoff spawns for the blue team ([x, z, yaw]); orange uses the mirrored spot.
// yaw 0 faces +Z (toward the orange goal).
export const KICKOFF_SPOTS = [
  [-2048, -2560, Math.PI / 4],
  [2048, -2560, -Math.PI / 4],
  [-256, -3840, 0],
  [256, -3840, 0],
  [0, -4608, 0],
];
export const RESPAWN_SPOTS = [
  [-2304, -4608, 0],
  [-2688, -4608, 0],
  [2304, -4608, 0],
  [2688, -4608, 0],
];

export const TEAM_COLORS = {
  0: { main: 0x0f6bff, light: 0x5fb4ff, dark: 0x0a3a9a, css: '#2f7bff', flame: [0.55, 0.85, 1.0], flameEnd: [0.1, 0.3, 1.0] },
  1: { main: 0xff6a12, light: 0xffb060, dark: 0x8a2a00, css: '#ff7a1a', flame: [1.0, 0.85, 0.45], flameEnd: [1.0, 0.28, 0.04] },
};
