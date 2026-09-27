import * as THREE from 'three';
import { lookQuat, makePose, blendPose } from './animator.js';

// ---------------------------------------------------------------------------
// Moves: attacks, parries, dodges, hit reactions and falls, as data.
//
// A slash is a swing: the blade turns about an axis through a pivot near the
// chest while the hands ride out along it, so the point draws a true arc (and
// so does its trail). Each move runs windup -> strike -> follow-through, the
// windup blending from whatever pose came before, so combos flow into one
// another. Other moves are short keyframe tracks. Everything is in the
// character's root space: +Z forward, +X to his left, +Y up.
// ---------------------------------------------------------------------------

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (x) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
const sine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x, 0, 1));
const easeOut = (x) => 1 - (1 - clamp(x, 0, 1)) ** 2;
const easeIn = (x) => clamp(x, 0, 1) ** 2;

const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _d = new THREE.Vector3();
const _e = new THREE.Vector3();
const _g = new THREE.Vector3();
const _u = new THREE.Vector3();

function axisFrom(d0, dm) {
  return V(d0).normalize().cross(V(dm).normalize()).normalize();
}

// A swing about `axis` through `pivot`, starting from blade direction d0.
function swing(o) {
  const axis = o.axis ? V(o.axis).normalize() : axisFrom(o.d0, o.dm);
  return {
    pivot: V(o.pivot),
    axis,
    d0: V(o.d0).normalize(),
    a1: o.a1,
    r0: o.r0 ?? 0.3,
    r1: o.r1 ?? 0.36,
    bulge: o.bulge ?? 0.1,
    lift: o.lift ?? 0,
  };
}

function sampleSwing(sw, u, pose) {
  _q.setFromAxisAngle(sw.axis, sw.a1 * u);
  _d.copy(sw.d0).applyQuaternion(_q);
  // The edge leads the cut.
  _e.crossVectors(sw.axis, _d).normalize();
  if (sw.a1 < 0) _e.negate();
  const r = lerp(sw.r0, sw.r1, clamp(u, 0, 1)) + sw.bulge * Math.sin(Math.PI * clamp(u, 0, 1));
  pose.grip.copy(sw.pivot).addScaledVector(_d, r);
  pose.grip.y += sw.lift * Math.sin(Math.PI * clamp(u, 0, 1));
  lookQuat(_d, _e.negate(), pose.swordQ);
  return pose;
}

// Keyframed sword pose: [t, grip, dir, edge]. Smooth-stepped between keys.
function sampleKeys(keys, t, pose) {
  let k = 0;
  while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
  const a = keys[k];
  const b = keys[Math.min(k + 1, keys.length - 1)];
  const x = b[0] > a[0] ? smooth((t - a[0]) / (b[0] - a[0])) : 1;
  pose.grip.set(lerp(a[1][0], b[1][0], x), lerp(a[1][1], b[1][1], x), lerp(a[1][2], b[1][2], x));
  const qa = a.q || (a.q = lookQuat(V(a[2]), V(a[3]).negate(), new THREE.Quaternion()));
  const qb = b.q || (b.q = lookQuat(V(b[2]), V(b[3]).negate(), new THREE.Quaternion()));
  pose.swordQ.copy(qa).slerp(qb, x);
  return pose;
}

// Piecewise-linear track [[t, v], ...] with smoothstep between points.
function track(pts, t) {
  if (!pts) return 0;
  if (typeof pts === 'number') return pts;
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (t <= b[0]) return lerp(a[1], b[1], smooth((t - a[0]) / (b[0] - a[0])));
  }
  return pts[pts.length - 1][1];
}

// ---------------------------------------------------------------------------
// The move list.
// ---------------------------------------------------------------------------

// Common guard stance (right foot forward) and some attack stances.
const ST_GUARD = [[0.13, -0.11], [-0.1, 0.15]];
const ST_LUNGE_L = [[0.14, 0.26], [-0.13, -0.2]];
const ST_LUNGE_R = [[0.12, -0.2], [-0.12, 0.28]];
const ST_WIDE = [[0.2, 0.05], [-0.2, -0.05]];

export const MOVES = {
  // --- Light combo -------------------------------------------------------
  // Kesa-giri: diagonal cut from over the right shoulder down to the left hip.
  kesa: {
    kind: 'slash', dur: 0.56, wind: 0.13, strike: 0.13, antic: 0.1, follow: 0.06,
    swing: swing({ pivot: [-0.03, 1.28, 0.1], d0: [-0.5, 0.8, -0.35], dm: [0.15, 0.0, 1.0], a1: 3.0, r0: 0.28, r1: 0.34, bulge: 0.14 }),
    hit: [0.18, 0.88], combo: [0.27, 0.56], cancel: 0.3, next: 'gyaku',
    twist: [0.55, -0.5], lean: [0.02, 0.22], crouch: [0.02, 0.09], hipsYaw: [0.2, -0.2],
    move: { dist: 0.45, max: 2.1, t0: 0.0, t1: 0.2 }, stance: ST_LUNGE_L,
    dmg: 20, react: 'flinch', knock: 1.2, sound: 'swish',
  },
  // Gyaku-kesa: rising diagonal back up to the right.
  gyaku: {
    kind: 'slash', dur: 0.54, wind: 0.1, strike: 0.13, antic: 0.08, follow: 0.06,
    swing: swing({ pivot: [0.0, 1.2, 0.12], d0: [0.62, -0.62, 0.45], dm: [0.0, 0.15, 1.0], a1: 2.85, r0: 0.3, r1: 0.3, bulge: 0.14 }),
    hit: [0.18, 0.86], combo: [0.24, 0.54], cancel: 0.28, next: 'yoko',
    twist: [-0.5, 0.5], lean: [0.18, 0.05], crouch: [0.08, 0.03], hipsYaw: [-0.2, 0.2],
    move: { dist: 0.4, max: 1.4, t0: 0.0, t1: 0.17 }, stance: ST_LUNGE_R,
    dmg: 20, react: 'flinch', knock: 1.2, sound: 'swish',
  },
  // Yoko-giri: a wide horizontal cut from right to left.
  yoko: {
    kind: 'slash', dur: 0.62, wind: 0.13, strike: 0.15, antic: 0.1, follow: 0.05,
    swing: swing({ pivot: [0.0, 1.2, 0.05], d0: [-0.93, 0.1, -0.3], dm: [0.0, 0.05, 1.0], a1: 3.55, r0: 0.34, r1: 0.36, bulge: 0.12 }),
    hit: [0.12, 0.9], combo: [0.29, 0.62], cancel: 0.3, next: 'karatake',
    twist: [0.7, -0.65], lean: [0.08, 0.14], crouch: [0.06, 0.1], hipsYaw: [0.3, -0.3],
    move: { dist: 0.45, max: 1.5, t0: 0.0, t1: 0.2 }, stance: ST_WIDE,
    dmg: 24, react: 'flinch', knock: 1.8, wide: true, sound: 'swish',
  },
  // Karatake-wari: the finisher, an overhead cleave straight down.
  karatake: {
    kind: 'slash', dur: 0.82, wind: 0.24, strike: 0.12, antic: 0.1, follow: 0.03,
    swing: swing({ pivot: [-0.02, 1.33, 0.06], axis: [1, 0, 0], d0: [0.03, 0.58, -0.81], a1: 3.3, r0: 0.3, r1: 0.44, bulge: 0.1 }),
    hit: [0.35, 0.95], cancel: 0.5,
    twist: [0.15, 0.0], lean: [-0.12, 0.4], crouch: [0.0, 0.2], hipsYaw: [0, 0],
    move: { dist: 0.7, max: 1.8, t0: 0.08, t1: 0.3 }, stance: ST_LUNGE_R,
    dmg: 38, react: 'knockdown', knock: 3.5, impact: 0.36, shake: 0.6, sound: 'heavy',
  },

  // --- Heavy -----------------------------------------------------------
  // Tsuki: a straight thrust with a long lunge.
  tsuki: {
    kind: 'keys', dur: 0.62,
    keys: [
      [0.0, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
      [0.17, [-0.2, 1.05, -0.05], [0.08, 0.05, 1.0], [0, -1, 0]],
      [0.27, [-0.02, 1.22, 0.66], [0.02, 0.05, 1.0], [0, -1, 0]],
      [0.45, [-0.02, 1.2, 0.62], [0.02, 0.04, 1.0], [0, -1, 0]],
      [0.62, [-0.04, 1.05, 0.4], [0.07, 0.4, 0.9], [0, -1, 0.2]],
    ],
    hitT: [0.19, 0.34], cancel: 0.36,
    twist: [[0, 0], [0.17, 0.35], [0.27, -0.15], [0.62, 0]], lean: [[0, 0], [0.17, -0.05], [0.27, 0.3], [0.62, 0.1]],
    crouch: [[0, 0], [0.17, 0.08], [0.27, 0.16], [0.62, 0.05]],
    move: { dist: 1.4, max: 2.6, t0: 0.15, t1: 0.3 }, stance: [[0.12, -0.3], [-0.12, 0.34]],
    dmg: 30, react: 'stagger', knock: 3, pierce: true, sound: 'thrust',
  },
  // Held heavy: raised high (jodan) while charging, then a leaping cleave.
  jodan: {
    kind: 'keys', dur: 99, hold: true,
    keys: [
      [0.0, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
      [0.22, [-0.03, 1.74, 0.1], [0.02, 0.6, -0.8], [0, 0.8, 0.6]],
    ],
    twist: [[0, 0], [0.22, 0.12]], lean: [[0, 0], [0.22, -0.12]], crouch: [[0, 0], [0.22, 0.1]], stance: ST_GUARD,
  },
  kabutowari: {
    kind: 'slash', dur: 0.9, wind: 0.05, strike: 0.2, antic: 0.02, follow: 0.02, fromCharge: true,
    swing: swing({ pivot: [-0.02, 1.33, 0.06], axis: [1, 0, 0], d0: [0.02, 0.6, -0.8], a1: 3.35, r0: 0.34, r1: 0.46, bulge: 0.12 }),
    hit: [0.4, 1.0], cancel: 0.6,
    twist: [0.1, 0.0], lean: [-0.15, 0.45], crouch: [0.05, 0.24],
    move: { dist: 1.8, max: 2.8, t0: 0.0, t1: 0.26 }, hop: 3.6, stance: ST_LUNGE_R,
    dmg: 60, dmgCharged: 95, react: 'knockdown', knock: 5, impact: 0.26, shake: 1, radius: 2.4, sound: 'heavy',
  },

  // --- Specials ----------------------------------------------------------
  // Kaiten-giri: a hopping full turn, blade held wide.
  kaiten: {
    kind: 'keys', dur: 0.72, spin: { t0: 0.07, t1: 0.42 }, hop: 4.3,
    keys: [
      [0.0, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
      [0.1, [-0.46, 1.12, 0.02], [-0.96, -0.05, -0.2], [0.2, 0, 1]],
      [0.42, [-0.5, 1.12, 0.1], [-0.96, -0.05, 0.25], [0.25, 0, 1]],
      [0.72, [-0.2, 1.0, 0.3], [-0.2, -0.3, 0.9], [-1, 0, 0]],
    ],
    hitT: [0.12, 0.44], cancel: 0.5, move: { dist: 0.8, t0: 0.02, t1: 0.4 },
    twist: [[0, 0], [0.1, 0.3], [0.42, 0.2], [0.72, 0]], lean: [[0, 0], [0.1, 0.1], [0.72, 0.05]], crouch: [[0, 0], [0.1, 0.1], [0.5, 0.1], [0.72, 0.03]],
    stance: ST_WIDE, dmg: 26, react: 'stagger', knock: 3.2, radius: 2.3, all: true, sound: 'spin', cooldown: 1.2,
  },
  // Nuki-do: the running cut, dashing past with a low horizontal slash.
  nukido: {
    kind: 'slash', dur: 0.66, wind: 0.08, strike: 0.16, antic: 0.05, follow: 0.08,
    swing: swing({ pivot: [0.0, 1.1, 0.12], axis: [0, -1, 0], d0: [0.82, -0.18, 0.55], a1: 3.6, r0: 0.34, r1: 0.4, bulge: 0.1 }),
    hit: [0.05, 0.95], cancel: 0.4,
    twist: [-0.5, 0.55], lean: [0.3, 0.12], crouch: [0.18, 0.1], hipsYaw: [-0.25, 0.3],
    move: { dist: 3.4, t0: 0.02, t1: 0.32 }, stance: ST_WIDE, slide: [0.24, 0.56],
    dmg: 34, react: 'stagger', knock: 2.5, sound: 'swish',
  },
  // Aerial cuts.
  air1: {
    kind: 'slash', dur: 0.42, wind: 0.07, strike: 0.12, antic: 0.06, follow: 0.05, air: true,
    swing: swing({ pivot: [0.0, 1.25, 0.1], d0: [-0.9, 0.3, -0.25], dm: [0.0, -0.1, 1.0], a1: 3.4, r0: 0.3, r1: 0.34, bulge: 0.12 }),
    hit: [0.12, 0.9], combo: [0.2, 0.42], next: 'air2',
    twist: [0.5, -0.5], lean: [0.05, 0.15], crouch: [0, 0],
    dmg: 20, react: 'flinch', knock: 1.5, hang: 0.35, sound: 'swish',
  },
  air2: {
    kind: 'slash', dur: 0.44, wind: 0.07, strike: 0.12, antic: 0.06, follow: 0.05, air: true,
    swing: swing({ pivot: [0.0, 1.25, 0.1], d0: [0.7, 0.55, -0.2], dm: [0.1, -0.1, 1.0], a1: 3.1, r0: 0.3, r1: 0.34, bulge: 0.12 }),
    hit: [0.12, 0.9],
    twist: [-0.5, 0.45], lean: [0.1, 0.2], crouch: [0, 0],
    dmg: 22, react: 'flinch', knock: 2, hang: 0.3, sound: 'swish',
  },
  // Plunge: from the air, straight down, blade first.
  plunge: {
    kind: 'keys', dur: 99, hold: true, air: true,
    keys: [
      [0.0, [-0.1, 1.1, 0.2], [0.0, 0.3, 1.0], [0, -1, 0]],
      [0.12, [-0.02, 1.5, 0.16], [0.0, -0.95, 0.3], [0, 0, 1]],
    ],
    twist: [[0, 0], [0.12, 0.05]], lean: [[0, 0], [0.12, -0.1]], crouch: 0,
  },
  plungeLand: {
    kind: 'keys', dur: 0.7,
    keys: [
      [0.0, [-0.02, 1.2, 0.3], [0.0, -0.93, 0.36], [0, 0, 1]],
      [0.06, [-0.02, 0.72, 0.5], [0.0, -0.9, 0.44], [0, 0, 1]],
      [0.4, [-0.02, 0.74, 0.5], [0.0, -0.9, 0.44], [0, 0, 1]],
      [0.7, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
    ],
    hitT: [0.0, 0.08], cancel: 0.42,
    twist: [[0, 0.05], [0.7, 0]], lean: [[0, 0.3], [0.06, 0.55], [0.4, 0.5], [0.7, 0.05]], crouch: [[0, 0.3], [0.06, 0.4], [0.4, 0.36], [0.7, 0.04]],
    stance: [[0.16, 0.2], [-0.16, -0.22]], dmg: 40, react: 'knockdown', knock: 4, impact: 0.0, shake: 0.8, radius: 2.2, all: true,
  },
  // Riposte after a perfect parry: a single, lethal kesa.
  riposte: {
    kind: 'slash', dur: 0.7, wind: 0.08, strike: 0.11, antic: 0.12, follow: 0.1,
    swing: swing({ pivot: [-0.03, 1.28, 0.1], d0: [-0.5, 0.8, -0.35], dm: [0.15, 0.0, 1.0], a1: 3.05, r0: 0.28, r1: 0.36, bulge: 0.16 }),
    hit: [0.15, 0.95], cancel: 0.5,
    twist: [0.6, -0.6], lean: [0.0, 0.3], crouch: [0.02, 0.14], hipsYaw: [0.25, -0.25],
    move: { dist: 0.9, max: 2.2, t0: 0.0, t1: 0.16 }, stance: ST_LUNGE_L,
    dmg: 150, react: 'stagger', knock: 3, sound: 'swish',
  },

  // --- Defence -----------------------------------------------------------
  parry: {
    kind: 'keys', dur: 0.42,
    keys: [
      [0.0, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
      [0.06, [-0.08, 1.3, 0.3], [0.64, 0.62, 0.44], [-0.3, 0.2, 1]],
      [0.3, [-0.08, 1.3, 0.3], [0.64, 0.62, 0.44], [-0.3, 0.2, 1]],
      [0.42, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
    ],
    twist: [[0, 0], [0.06, 0.25], [0.3, 0.25], [0.42, 0]], lean: [[0, 0], [0.06, -0.08], [0.42, 0]], crouch: [[0, 0.02], [0.06, 0.08], [0.42, 0.04]],
    stance: ST_GUARD, perfect: 0.18, guard: 0.36,
  },
  dodge: {
    kind: 'keys', dur: 0.46,
    keys: [
      [0.0, [-0.2, 0.95, 0.1], [-0.3, -0.4, 0.8], [0, -1, 0]],
      [0.1, [-0.28, 0.9, -0.05], [-0.3, -0.42, -0.86], [0, -1, 0]],
      [0.46, [-0.25, 0.9, 0.05], [-0.25, -0.5, 0.5], [0, -1, 0]],
    ],
    twist: 0, lean: [[0, 0], [0.08, 0.35], [0.3, 0.3], [0.46, 0.05]], crouch: [[0, 0], [0.08, 0.26], [0.32, 0.22], [0.46, 0.05]],
    move: { dist: 3.3, t0: 0.0, t1: 0.3, dodge: true }, slide: [0.0, 0.42], iframes: [0.02, 0.3], cancel: 0.3,
  },
  // Blade clashes and the swing bounces back.
  recoil: {
    kind: 'keys', dur: 0.4,
    keys: [
      [0.0, [-0.05, 1.25, 0.45], [0.2, 0.3, 0.93], [0, -1, 0]],
      [0.08, [-0.18, 1.35, 0.15], [-0.2, 0.8, -0.2], [0, 0, 1]],
      [0.4, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
    ],
    twist: [[0, 0], [0.08, 0.3], [0.4, 0]], lean: [[0, 0], [0.08, -0.25], [0.4, 0]], crouch: [[0, 0], [0.08, 0.06], [0.4, 0]],
    move: { dist: -0.35, t0: 0.0, t1: 0.15 },
  },

  // --- Enemy moves: slower, telegraphed versions ---------------------------
  e_kesa: {
    kind: 'slash', dur: 0.95, wind: 0.46, strike: 0.15, antic: 0.14, follow: 0.06, tell: 0.22,
    swing: swing({ pivot: [-0.03, 1.28, 0.1], d0: [-0.5, 0.8, -0.35], dm: [0.15, 0.0, 1.0], a1: 3.0, r0: 0.28, r1: 0.34, bulge: 0.14 }),
    hit: [0.2, 0.86], combo: [0.66, 0.8], next: 'e_gyaku',
    twist: [0.55, -0.5], lean: [-0.05, 0.22], crouch: [0.02, 0.09], hipsYaw: [0.2, -0.2],
    move: { dist: 0.7, t0: 0.4, t1: 0.62 }, stance: ST_LUNGE_L,
    dmg: 14, react: 'flinch', sound: 'swish',
  },
  e_gyaku: {
    kind: 'slash', dur: 0.75, wind: 0.2, strike: 0.15, antic: 0.1, follow: 0.06, tell: 0.12,
    swing: swing({ pivot: [0.0, 1.2, 0.12], d0: [0.62, -0.62, 0.45], dm: [0.0, 0.15, 1.0], a1: 2.85, r0: 0.3, r1: 0.3, bulge: 0.14 }),
    hit: [0.2, 0.86],
    twist: [-0.5, 0.5], lean: [0.18, 0.05], crouch: [0.08, 0.03], hipsYaw: [-0.2, 0.2],
    move: { dist: 0.5, t0: 0.14, t1: 0.34 }, stance: ST_LUNGE_R,
    dmg: 14, react: 'flinch', sound: 'swish',
  },
  e_yoko: {
    kind: 'slash', dur: 1.0, wind: 0.5, strike: 0.17, antic: 0.12, follow: 0.05, tell: 0.24,
    swing: swing({ pivot: [0.0, 1.2, 0.05], d0: [-0.93, 0.1, -0.3], dm: [0.0, 0.05, 1.0], a1: 3.55, r0: 0.34, r1: 0.36, bulge: 0.12 }),
    hit: [0.15, 0.88],
    twist: [0.7, -0.65], lean: [0.02, 0.14], crouch: [0.06, 0.1], hipsYaw: [0.3, -0.3],
    move: { dist: 0.8, t0: 0.42, t1: 0.66 }, stance: ST_WIDE,
    dmg: 16, react: 'flinch', sound: 'swish',
  },
  e_tsuki: {
    kind: 'keys', dur: 1.05, tell: 0.3,
    keys: [
      [0.0, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
      [0.5, [-0.22, 1.05, -0.08], [0.08, 0.05, 1.0], [0, -1, 0]],
      [0.62, [-0.02, 1.22, 0.66], [0.02, 0.05, 1.0], [0, -1, 0]],
      [0.8, [-0.02, 1.2, 0.62], [0.02, 0.04, 1.0], [0, -1, 0]],
      [1.05, [-0.04, 1.05, 0.4], [0.07, 0.4, 0.9], [0, -1, 0.2]],
    ],
    hitT: [0.53, 0.68],
    twist: [[0, 0], [0.5, 0.35], [0.62, -0.15], [1.05, 0]], lean: [[0, 0], [0.5, -0.08], [0.62, 0.3], [1.05, 0.05]],
    crouch: [[0, 0], [0.5, 0.1], [0.62, 0.16], [1.05, 0.03]],
    move: { dist: 1.9, t0: 0.5, t1: 0.68 }, stance: [[0.12, -0.3], [-0.12, 0.34]],
    dmg: 18, react: 'stagger', sound: 'thrust',
  },
  // The heavy's overhead cleave cannot be parried: the glint is red. Dodge it.
  b_cleave: {
    kind: 'slash', dur: 1.55, wind: 0.85, strike: 0.16, antic: 0.1, follow: 0.03, tell: 0.4, unblockable: true,
    swing: swing({ pivot: [-0.02, 1.33, 0.06], axis: [1, 0, 0], d0: [0.03, 0.58, -0.81], a1: 3.3, r0: 0.3, r1: 0.44, bulge: 0.1 }),
    hit: [0.3, 0.98],
    twist: [0.15, 0.0], lean: [-0.2, 0.42], crouch: [0.0, 0.22],
    move: { dist: 0.9, t0: 0.82, t1: 1.02 }, stance: ST_LUNGE_R,
    dmg: 30, react: 'knockdown', impact: 1.01, shake: 0.9, radius: 1.5, sound: 'heavy',
  },
  b_sweep: {
    kind: 'slash', dur: 1.2, wind: 0.62, strike: 0.2, antic: 0.14, follow: 0.05, tell: 0.3,
    swing: swing({ pivot: [0.0, 1.15, 0.05], d0: [-0.93, 0.0, -0.3], dm: [0.0, -0.05, 1.0], a1: 3.7, r0: 0.36, r1: 0.4, bulge: 0.14 }),
    hit: [0.12, 0.9],
    twist: [0.8, -0.7], lean: [0.02, 0.18], crouch: [0.1, 0.14], hipsYaw: [0.35, -0.35],
    move: { dist: 0.8, t0: 0.56, t1: 0.8 }, stance: ST_WIDE,
    dmg: 22, react: 'stagger', sound: 'heavy',
  },
  // Guard: blade held across the body to catch a cut.
  e_guard: {
    kind: 'keys', dur: 99, hold: true,
    keys: [
      [0.0, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
      [0.12, [-0.12, 1.32, 0.28], [0.92, 0.3, 0.25], [-0.2, 0.3, 1]],
    ],
    twist: [[0, 0], [0.12, 0.2]], lean: [[0, 0], [0.12, -0.05]], crouch: [[0, 0.02], [0.12, 0.08]], stance: ST_GUARD,
  },
  // Parried: thrown wide open.
  e_parried: {
    kind: 'keys', dur: 1.35, reaction: true,
    keys: [
      [0.0, [-0.1, 1.3, 0.4], [0.2, 0.5, 0.84], [0, -1, 0]],
      [0.14, [-0.34, 1.55, -0.12], [-0.45, 0.8, -0.4], [0, -0.3, 1]],
      [0.95, [-0.34, 1.35, -0.05], [-0.5, 0.5, -0.6], [0, -0.3, 1]],
      [1.35, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
    ],
    twist: [[0, 0], [0.14, 0.55], [0.95, 0.4], [1.35, 0]], lean: [[0, 0], [0.12, -0.45], [0.95, -0.3], [1.35, 0]],
    crouch: [[0, 0], [0.14, 0.1], [0.95, 0.12], [1.35, 0]], headPitch: [[0, 0], [0.12, -0.3], [1.35, 0]],
    move: { dist: -0.9, t0: 0.0, t1: 0.35 }, stance: ST_WIDE,
  },

  // --- Reactions -----------------------------------------------------------
  flinch: {
    kind: 'keys', dur: 0.4, reaction: true,
    keys: [
      [0.0, [-0.1, 1.05, 0.25], [0.1, 0.3, 0.95], [0, -1, 0]],
      [0.08, [-0.2, 1.1, 0.05], [-0.4, 0.5, 0.75], [0, -1, 0]],
      [0.4, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
    ],
    twist: [[0, 0], [0.08, 0.35], [0.4, 0]], lean: [[0, 0], [0.07, -0.3], [0.4, 0]], crouch: [[0, 0], [0.08, 0.08], [0.4, 0]], headPitch: [[0, 0], [0.07, -0.25], [0.4, 0]],
    move: { dist: -0.35, t0: 0.0, t1: 0.2 },
  },
  stagger: {
    kind: 'keys', dur: 0.85, reaction: true,
    keys: [
      [0.0, [-0.1, 1.05, 0.25], [0.1, 0.3, 0.95], [0, -1, 0]],
      [0.12, [-0.3, 1.1, -0.1], [-0.6, 0.4, -0.3], [0, -1, 0]],
      [0.55, [-0.3, 0.95, 0.0], [-0.4, -0.5, 0.6], [0, -1, 0]],
      [0.85, [-0.04, 1.02, 0.33], [0.07, 0.5, 0.86], [0, -1, 0.2]],
    ],
    twist: [[0, 0], [0.12, 0.5], [0.55, 0.2], [0.85, 0]], lean: [[0, 0], [0.1, -0.45], [0.35, -0.2], [0.55, 0.25], [0.85, 0]],
    crouch: [[0, 0], [0.12, 0.12], [0.55, 0.16], [0.85, 0]], headPitch: [[0, 0], [0.1, -0.35], [0.55, 0.2], [0.85, 0]],
    move: { dist: -1.1, t0: 0.0, t1: 0.4 }, stance: ST_WIDE,
  },
};

// Falls: full-body keyframes (hips in root space and their pitch), limbs by IK.
// [t, hipsY, hipsZ, hipsPitch, footZ, kneesUp]
export const FALLS = {
  // Knocked flat on his back, then up again.
  knockdown: {
    dur: 1.9, getUp: true,
    keys: [
      [0.0, 0.93, 0.0, 0.0, 0.0, 0],
      [0.12, 0.8, -0.15, -0.35, 0.05, 0],
      [0.42, 0.16, -0.55, -1.45, 0.3, 1],
      [0.55, 0.13, -0.6, -1.55, 0.32, 1],
      [1.3, 0.13, -0.6, -1.55, 0.3, 1],
      [1.55, 0.5, -0.25, -0.5, -0.15, 1],
      [1.9, 0.93, 0.0, 0.0, 0.0, 0],
    ],
  },
  // Cut down: knees buckle, then he pitches forward into the grass.
  deathFwd: {
    dur: 1.6,
    keys: [
      [0.0, 0.93, 0.0, 0.0, 0.0, 0],
      [0.25, 0.72, -0.05, 0.25, -0.05, 0],
      [0.6, 0.5, 0.0, 0.55, -0.35, -1],
      [1.05, 0.16, 0.45, 1.5, -0.4, -1],
      [1.6, 0.13, 0.5, 1.56, -0.42, -1],
    ],
  },
  // Thrown back by a heavy blow.
  deathBack: {
    dur: 1.3,
    keys: [
      [0.0, 0.93, 0.0, 0.0, 0.0, 0],
      [0.15, 0.82, -0.2, -0.4, 0.1, 0],
      [0.5, 0.16, -0.62, -1.5, 0.28, 1],
      [1.3, 0.13, -0.66, -1.56, 0.3, 1],
    ],
  },
};

// ---------------------------------------------------------------------------
// A move in progress. Gameplay advances it; the animator samples it.
// ---------------------------------------------------------------------------

export class Action {
  constructor(name, entry, { entryBody = null, speed = 1, charged = 0, dir = 0 } = {}) {
    this.name = name;
    this.def = MOVES[name];
    this.t = 0;
    this.speed = speed;
    this.charged = charged;
    this.dir = dir;
    this.entry = makePose();
    copyInto(this.entry, entry);
    this.entryBody = entryBody || { twist: 0, lean: 0, crouch: 0, hipsYaw: 0 };
    this.pose = makePose();
    this.w = 1;
    this.hits = new Set();
    this.done = false;
    this.released = false;
    // Channels read by the animator.
    this.twist = 0;
    this.lean = 0;
    this.side = 0;
    this.crouch = 0;
    this.hipsYaw = 0;
    this.headPitch = 0;
    this.stanceW = 0;
    this.stance = [[0, 0], [0, 0]];
    this.slide = 0;
    this.bodyW = 0;
    this.legsW = 0;
  }

  get dur() {
    return this.def.dur;
  }

  update(dt) {
    this.t += dt * this.speed;
    const d = this.def;
    if (!d.hold && this.t >= d.dur) this.done = true;
  }

  // Swing progress (-antic .. 1+follow) at time t, and whether in the strike.
  swingU(t) {
    const d = this.def;
    if (t < d.wind) return -d.antic * sine(t / d.wind);
    const x = (t - d.wind) / d.strike;
    if (x < 1) return -d.antic + (1 + d.antic) * sine(x);
    return 1 + d.follow * easeOut((t - d.wind - d.strike) / 0.12);
  }

  hitActive(t = this.t) {
    const d = this.def;
    if (d.kind === 'slash') {
      if (t < d.wind || t > d.wind + d.strike + 0.03) return false;
      const u = this.swingU(t);
      return u >= d.hit[0] && u <= d.hit[1];
    }
    return !!d.hitT && t >= d.hitT[0] && t <= d.hitT[1];
  }

  inCombo() {
    const c = this.def.combo;
    return !!c && this.t >= c[0] && this.t <= c[1];
  }

  canCancel() {
    return this.def.cancel !== undefined && this.t >= this.def.cancel;
  }

  // Sword pose at time t (root space), into `out`.
  sword(t, out) {
    const d = this.def;
    if (d.kind === 'slash') {
      const u = this.swingU(t);
      sampleSwing(d.swing, u, out);
      if (t < d.wind && !d.fromCharge) {
        // Windup: from wherever the blade was into the drawn-back start.
        const k = sine(t / d.wind);
        _g.copy(out.grip);
        _q.copy(out.swordQ);
        out.grip.copy(this.entry.grip).lerp(_g, k);
        out.swordQ.copy(this.entry.swordQ).slerp(_q, k);
      }
    } else {
      sampleKeys(d.keys, t, out);
      if (t < d.keys[1][0] && !d.fromCharge) {
        // First key blends from the entry pose.
        const k = sine(t / d.keys[1][0]);
        _g.copy(out.grip);
        _q.copy(out.swordQ);
        sampleKeys(d.keys, d.keys[1][0], out);
        _u.copy(out.grip);
        out.grip.copy(this.entry.grip).lerp(_u, k);
        _q2.copy(out.swordQ);
        out.swordQ.copy(this.entry.swordQ).slerp(_q2, k);
      }
    }
    return out;
  }

  // Everything the animator needs this frame.
  sample() {
    const d = this.def;
    const t = this.t;
    const P = this.pose;
    this.sword(t, P);
    P.twoHand = d.oneHand ? 0 : 1;
    P.leftGrip = 1;
    P.left.copy(P.grip);
    P.leftQ.copy(P.swordQ);
    P.poleR.set(-0.5, -0.75, -0.4).normalize();
    P.poleL.set(0.5, -0.75, -0.4).normalize();
    // Body channels.
    let k;
    if (d.kind === 'slash') {
      const u = clamp(this.swingU(t), 0, 1);
      const wk = t < d.wind ? sine(t / d.wind) : 1;
      const ch = (arr, key) => lerp(this.entryBody[key] || 0, lerp(arr[0], arr[1], sine(u)), wk);
      this.twist = ch(d.twist, 'twist');
      this.lean = ch(d.lean, 'lean');
      this.crouch = ch(d.crouch, 'crouch');
      this.hipsYaw = d.hipsYaw ? ch(d.hipsYaw, 'hipsYaw') : 0;
    } else {
      this.twist = track(d.twist, t);
      this.lean = track(d.lean, t);
      this.crouch = track(d.crouch, t);
      this.hipsYaw = track(d.hipsYaw, t);
      this.headPitch = track(d.headPitch, t);
      k = d.keys[1][0];
      if (t < k) {
        const e = sine(t / k);
        this.twist = lerp(this.entryBody.twist || 0, this.twist, e);
        this.lean = lerp(this.entryBody.lean || 0, this.lean, e);
        this.crouch = lerp(this.entryBody.crouch || 0, this.crouch, e);
      }
    }
    if (d.stance) {
      this.stanceW = clamp(t / 0.12, 0, 1);
      this.stance = d.stance;
    }
    this.slide = d.slide && t >= d.slide[0] && t <= d.slide[1] ? 1 : 0;
    // Fade back to locomotion over the last stretch, unless chained into.
    const fade = d.hold ? 1 : clamp((d.dur - t) / Math.min(0.2, d.dur * 0.4), 0, 1);
    this.w = smooth(fade);
    const bw = this.w;
    this.twist *= bw;
    this.lean *= bw;
    this.crouch *= bw;
    this.hipsYaw *= bw;
    this.headPitch *= bw;
    this.stanceW *= bw;
    return this;
  }

  // Forward speed from the move's lunge at time t. The lunge covers `this.dist`
  // (set when a target is picked; the move's own step otherwise).
  rootSpeed(t = this.t) {
    const m = this.def.move;
    if (!m || t < m.t0 || t > m.t1) return 0;
    const x = (t - m.t0) / (m.t1 - m.t0);
    const dist = this.dist ?? m.dist;
    // Distance follows smoothstep, so speed is its derivative.
    return (dist * 6 * x * (1 - x)) / (m.t1 - m.t0);
  }

  // Snapshot of the body channels (to hand on to a chained move).
  bodySnapshot() {
    return { twist: this.twist, lean: this.lean, crouch: this.crouch, hipsYaw: this.hipsYaw };
  }
}

function copyInto(dst, src) {
  dst.grip.copy(src.grip);
  dst.swordQ.copy(src.swordQ);
  dst.twoHand = src.twoHand;
  dst.left.copy(src.left);
  dst.leftQ.copy(src.leftQ);
  dst.leftGrip = src.leftGrip;
  dst.poleR.copy(src.poleR);
  dst.poleL.copy(src.poleL);
}

// A fall (knockdown or death): overrides the hips and legs.
export class Fall {
  constructor(name, facingSign = 1) {
    this.name = name;
    this.def = FALLS[name];
    this.t = 0;
    this.done = false;
    this.pose = makePose();
    this.w = 1;
    this.bodyW = 1;
    this.legsW = 1;
    this.hipsPos = new THREE.Vector3();
    this.hipsQ = new THREE.Quaternion();
    this.legs = [new THREE.Vector3(), new THREE.Vector3()];
    this.legPole = new THREE.Vector3(0, 0, 1);
    this.footPitch = [0, 0];
    this.twist = 0;
    this.lean = 0;
    this.side = 0;
    this.crouch = 0;
    this.hipsYaw = 0;
    this.headPitch = 0;
    this.stanceW = 0;
    this.stance = [[0, 0], [0, 0]];
    this.slide = 0;
    this.sign = facingSign;
  }

  update(dt) {
    this.t += dt;
    if (this.t >= this.def.dur) {
      this.t = this.def.dur;
      this.done = true;
    }
  }

  sample() {
    const K = this.def.keys;
    const t = this.t;
    let k = 0;
    while (k < K.length - 2 && t > K[k + 1][0]) k++;
    const a = K[k];
    const b = K[k + 1];
    const x = smooth((t - a[0]) / (b[0] - a[0]));
    const hy = lerp(a[1], b[1], x);
    const hz = lerp(a[2], b[2], x);
    const pitch = lerp(a[3], b[3], x);
    const fz = lerp(a[4], b[4], x);
    const kneesUp = lerp(a[5], b[5], x);
    this.hipsPos.set(0, hy, hz);
    this.hipsQ.setFromAxisAngle(_u.set(1, 0, 0), pitch);
    // Feet: on the ground, ahead of or behind the hips.
    this.legs[0].set(0.13, 0.08, fz);
    this.legs[1].set(-0.13, 0.08, fz + 0.04);
    // Knees bend upward when lying on the back, down when face down, else forward.
    this.legPole.set(0, kneesUp, 1 - Math.abs(kneesUp) * 0.7).normalize();
    this.footPitch[0] = this.footPitch[1] = -Math.abs(pitch) * 0.5;
    // Arms fall limp: the hands drop toward the ground beside him.
    const P = this.pose;
    const lie = Math.min(1, Math.abs(pitch) / 1.5);
    const side = pitch < 0 ? -1 : 1;
    P.grip.set(-0.42, lerp(0.9, 0.1, lie), hz + side * 0.3 * lie);
    lookQuat(_d.set(-0.4, -0.2 * (1 - lie), 0.9), _e.set(0, 1, 0), P.swordQ);
    P.twoHand = 0;
    P.leftGrip = 0;
    P.left.set(0.4, lerp(0.95, 0.1, lie), hz + side * 0.25 * lie);
    lookQuat(_d.set(0.2, -0.5, 0.8), _e.set(0, 1, 0), P.leftQ);
    P.poleR.set(-0.3, 0.5, -0.8).normalize();
    P.poleL.set(0.3, 0.5, -0.8).normalize();
    this.headPitch = pitch < 0 ? 0.3 * lie : -0.2 * lie;
    this.w = 1;
    this.bodyW = smooth(t / 0.08);
    this.legsW = this.bodyW;
    if (this.def.getUp && t > this.def.dur - 0.2) {
      const f = smooth((this.def.dur - t) / 0.2);
      this.bodyW *= f;
      this.legsW *= f;
      this.w = f;
    }
    return this;
  }
}

export { blendPose };
