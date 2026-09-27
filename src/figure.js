import * as THREE from 'three';
import { MeshBuilder, mat, profile, superPoint, ribbonRings, tubeRings, capRings, smoothstep, lerp, clamp } from './meshbuilder.js';
import { makeCharacterMaterial, PAT } from './charmat.js';
import { buildYoungHead, buildChinCords } from './face.js';

// ---------------------------------------------------------------------------
// Figures: a skeleton and one skinned, sculpted mesh per character. The body is
// built from smooth swept surfaces (torso, hakama, sleeves, gaiters) whose
// weights blend across the joints, plus rigid details (head, hands, kasa,
// swords). Bind pose: standing at the origin, facing +Z, +X on his left.
// ---------------------------------------------------------------------------

export const DIM = {
  HIP_Y: 0.93,
  HIP_X: 0.1,
  HIP_DROP: 0.02,
  THIGH: 0.43,
  SHIN: 0.43,
  ANKLE_H: 0.075,
  HEEL: 0.055,
  BALL: 0.115,
  UPPER_ARM: 0.28,
  FOREARM: 0.25,
  GRIP: 0.072, // wrist to the centre of the fist
  HANDLE: 0.135, // right hand to left hand along a two-handed grip
};

const REST = [
  ['hips', null, 0, DIM.HIP_Y, 0],
  ['spine', 'hips', 0, 0.085, -0.005],
  ['chest', 'spine', 0, 0.2, 0],
  ['neck', 'chest', 0, 0.25, -0.015],
  ['head', 'neck', 0, 0.08, 0.02],
  ['hat', 'head', 0, 0.16, 0],
  ['tail', 'head', 0, 0.12, -0.09],
  ['clavL', 'chest', 0.03, 0.195, -0.012],
  ['armL', 'clavL', 0.16, -0.01, 0],
  ['foreL', 'armL', 0, -DIM.UPPER_ARM, 0],
  ['handL', 'foreL', 0, -DIM.FOREARM, 0],
  ['clavR', 'chest', -0.03, 0.195, -0.012],
  ['armR', 'clavR', -0.16, -0.01, 0],
  ['foreR', 'armR', 0, -DIM.UPPER_ARM, 0],
  ['handR', 'foreR', 0, -DIM.FOREARM, 0],
  ['thighL', 'hips', DIM.HIP_X, -DIM.HIP_DROP, 0],
  ['shinL', 'thighL', 0, -DIM.THIGH, 0],
  ['footL', 'shinL', 0, -DIM.SHIN, 0],
  ['thighR', 'hips', -DIM.HIP_X, -DIM.HIP_DROP, 0],
  ['shinR', 'thighR', 0, -DIM.THIGH, 0],
  ['footR', 'shinR', 0, -DIM.SHIN, 0],
  ['hakL', 'hips', DIM.HIP_X, -DIM.HIP_DROP, 0],
  ['hakR', 'hips', -DIM.HIP_X, -DIM.HIP_DROP, 0],
  ['saya', 'hips', 0.13, 0.055, 0.105],
  ['sword', null, 0, 0, 0],
];

// Outfits. Colours are sRGB hex; everything else is shape.
export const OUTFITS = {
  samurai: {
    scale: 1,
    build: 1,
    kimono: '#2e2a27', hakama: '#262220', obi: '#2c2219', collar: '#4a423b', trim: '#1b1715',
    skin: '#b98463', hair: '#0e0c0b', gaiter: '#221e1b', tabi: '#1e1a17', glove: '#1b1613',
    scarf: '#34302c', strap: '#4b301d', cloak: '#2a2624', hat: '#8a6a3e', cord: '#2e2218',
    sleeves: 'kote', headwear: 'kasa', face: 'young', hairStyle: null, armor: null,
    blade: 'katana', koshiita: true,
  },
  bandit: {
    scale: 1,
    build: 0.98,
    kimono: '#2e3a52', hakama: '#3a3430', obi: '#6a1f16', collar: '#8a8070', trim: '#1c2130',
    skin: '#9a7458', hair: '#121010', gaiter: '#2a2622', tabi: '#9c9484', glove: '#9a7458',
    band: '#b8b2a6', mask: '#1b1c22',
    sleeves: 'tied', headwear: 'hachimaki', face: 'mask', hairStyle: 'ponytail', armor: null,
    blade: 'katana', koshiita: false,
  },
  ronin: {
    scale: 1.02,
    build: 1.02,
    kimono: '#6b2a1d', hakama: '#2f2b29', obi: '#1d1a18', collar: '#b0a48c', trim: '#3a1610',
    skin: '#a07a5e', hair: '#161312', gaiter: '#2d2723', tabi: '#aaa292', glove: '#a07a5e',
    mask: '#2a2020',
    sleeves: 'tied', headwear: 'jingasa', face: 'mask', hairStyle: 'ponytail', armor: null,
    blade: 'katana', koshiita: false,
  },
  brute: {
    scale: 1.13,
    build: 1.1,
    kimono: '#1e1b1b', hakama: '#2a1c18', obi: '#141010', collar: '#6a5e50', trim: '#101010',
    skin: '#a07252', hair: '#0e0c0c', gaiter: '#1e1a18', tabi: '#6c645a', glove: '#1a1412',
    armorColor: '#3a0c0a', mask: '#6e1410',
    sleeves: 'kote', headwear: 'kabuto', face: 'menpo', hairStyle: null, armor: 'do',
    blade: 'nodachi', koshiita: false,
  },
};

const W = (...pairs) => pairs;

// How the scabbard hangs from its bone: mouth at the bone, running back and down.
export const SAYA_EULER = new THREE.Euler(-0.46, -0.38, 0.25, 'YXZ');
export const SAYA_DIR = new THREE.Vector3(0, 0, -1).applyEuler(SAYA_EULER);

export function buildFigure(shared, outfitName) {
  const o = OUTFITS[outfitName];
  const boneIndex = {};
  REST.forEach(([name], i) => { boneIndex[name] = i; });
  const bind = {};
  for (const [name, parent, x, y, z] of REST) {
    const p = new THREE.Vector3(x, y, z);
    if (parent) p.add(bind[parent]);
    bind[name] = p;
  }
  const at = (name, x = 0, y = 0, z = 0) => bind[name].clone().add(new THREE.Vector3(x, y, z));
  const T = (name, x = 0, y = 0, z = 0) => new THREE.Matrix4().makeTranslation(bind[name].x + x, bind[name].y + y, bind[name].z + z);

  const M = makeMats(o);
  const B = new MeshBuilder(boneIndex);
  const ctx = { o, M, B, bind, at, T, dims: {} };

  torso(ctx);
  collar(ctx);
  obi(ctx);
  if (o.scarf) {
    straps(ctx);
    scarf(ctx);
  }
  hakama(ctx);
  legs(ctx);
  arms(ctx);
  neckAndHead(ctx);
  headwear(ctx);
  if (o.armor) armor(ctx);
  swords(ctx);

  // Bones.
  const bones = {};
  const list = [];
  for (const [name, parent, x, y, z] of REST) {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(x, y, z);
    bones[name] = b;
    list.push(b);
    if (parent) bones[parent].add(b);
  }
  const root = new THREE.Group();
  root.add(bones.hips, bones.sword);
  const geometry = B.build();
  const material = makeCharacterMaterial(shared);
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.layers.enable(1);
  root.add(mesh);
  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(list);
  mesh.bind(skeleton);
  root.scale.setScalar(o.scale);
  return { root, bones, mesh, material, skeleton, outfit: o, bind, scale: o.scale, dims: ctx.dims };
}

function makeMats(o) {
  return {
    kimono: mat(o.kimono, { rough: 0.9, trans: 0.12, bump: 1, pat: o.scarf ? PAT.brocade : 0 }),
    trim: mat(o.trim, { rough: 0.85, bump: 1 }),
    collar: mat(o.collar, { rough: 0.8, bump: 0.6 }),
    hakama: mat(o.hakama, { rough: 0.92, pat: PAT.stripe, bump: 1.2, trans: 0.08 }),
    hakamaIn: mat(o.hakama, { rough: 0.95, bump: 1 }),
    obi: mat(o.obi, { rough: 0.75, bump: 0.8 }),
    skin: mat(o.skin, { rough: 0.58, rim: 0.8, trans: 0.06 }),
    face: mat(o.skin, { rough: 0.52, rim: 0.8, trans: 0.08, pat: PAT.face }),
    ear: mat(o.skin, { rough: 0.6, rim: 0.8, trans: 0.5 }),
    lip: mat(o.skin, { rough: 0.45 }),
    hair: mat(o.hair, { rough: 0.5, rim: 1.2 }),
    eye: mat('#0c0a0a', { rough: 0.15 }),
    white: mat('#d8d0c0', { rough: 0.4 }),
    hat: mat(o.hat || '#b8955a', { rough: 0.8, pat: PAT.straw, rim: o.hat ? 0.55 : 1.2, trans: 0.1 }),
    straw: mat(o.hat ? '#6e5432' : '#9e814c', { rough: 0.9, trans: 0.12 }),
    lacquer: mat('#0f0e0f', { rough: 0.22, rim: 0.6 }),
    kote: mat('#141213', { rough: 0.3, pat: PAT.plates, rim: 0.7 }),
    glove: mat(o.glove, { rough: 0.7, rim: 0.8 }),
    wrap: mat('#1a1716', { rough: 0.7, pat: PAT.wrap }),
    brass: mat('#8a6a34', { rough: 0.35, metal: 1, rim: 0.4 }),
    iron: mat('#2a2826', { rough: 0.45, metal: 1, rim: 0.4 }),
    steel: mat('#c9cdd3', { rough: 0.12, metal: 1, rim: 0.3, pat: PAT.hamon }),
    gaiter: mat(o.gaiter, { rough: 0.9, pat: PAT.gaiter }),
    tabi: mat(o.tabi, { rough: 0.85, bump: 0.5 }),
    cord: mat(o.cord || '#2b2521', { rough: 0.8 }),
    scarf: mat(o.scarf || '#34302c', { rough: 0.95, bump: 1.6, pat: PAT.brocade, trans: 0.05 }),
    strap: mat(o.strap || '#4b301d', { rough: 0.42, bump: 0.5, rim: 0.9 }),
    band: mat(o.band || '#b8b2a6', { rough: 0.85, bump: 0.6, trans: 0.25 }),
    mask: mat(o.mask || '#1b1c22', { rough: 0.9, bump: 1 }),
    armor: mat(o.armorColor || '#5a0f0c', { rough: 0.3, pat: PAT.lames, rim: 0.8 }),
    menpo: mat(o.mask || '#8a1410', { rough: 0.28, rim: 0.8 }),
    gold: mat('#b88a38', { rough: 0.25, metal: 1, rim: 0.5 }),
    hairWhite: mat('#d9d4ca', { rough: 0.6, rim: 1.2 }),
  };
}

// ---------------------------------------------------------------------------
// Torso: a kimono over a broad chest, narrowing to the waist, with a sloped
// shoulder line that runs up into the collar.
// ---------------------------------------------------------------------------

function torsoProfile(build) {
  const P = profile([
    // y      a      bF     bB     cz      n
    [0.95, 0.150, 0.118, 0.114, 0.000, 2.3],
    [1.05, 0.153, 0.122, 0.112, 0.006, 2.3],
    [1.15, 0.164, 0.134, 0.116, 0.012, 2.4],
    [1.24, 0.179, 0.142, 0.124, 0.014, 2.6],
    [1.32, 0.195, 0.137, 0.13, 0.010, 2.8],
    [1.38, 0.206, 0.124, 0.124, 0.004, 3.0],
    [1.42, 0.203, 0.107, 0.107, -0.003, 3.1],
    [1.45, 0.182, 0.094, 0.097, -0.007, 2.9],
    [1.475, 0.146, 0.080, 0.085, -0.010, 2.6],
    [1.495, 0.102, 0.068, 0.072, -0.012, 2.3],
    [1.51, 0.066, 0.058, 0.060, -0.013, 2.1],
  ]);
  return (y) => {
    const [a, bF, bB, cz, n] = P(y);
    const k = lerp(1, build, smoothstep(1.0, 1.35, y));
    return [a * k, bF * lerp(1, build, 0.5), bB * lerp(1, build, 0.5), cz, n];
  };
}

function torsoSurface(ctx) {
  const prof = torsoProfile(ctx.o.build);
  const tmp = new THREE.Vector3();
  const point = (theta, y, off = 0, out = new THREE.Vector3()) => {
    const [a, bF, bB, cz, n] = prof(y);
    superPoint(theta, a + off, bF + off, bB + off, n, cz, tmp);
    return out.set(tmp.x, y, tmp.z);
  };
  const normal = (theta, y, out = new THREE.Vector3()) => {
    const p0 = point(theta - 0.01, y);
    const p1 = point(theta + 0.01, y);
    const q0 = point(theta, y - 0.005);
    const q1 = point(theta, y + 0.005);
    const du = p1.sub(p0);
    const dv = q1.sub(q0);
    out.crossVectors(dv, du).normalize();
    // Outward: away from the body axis.
    const c = point(theta, y);
    if (out.x * c.x + out.z * (c.z - 0.0) < 0) out.negate();
    return out;
  };
  return { prof, point, normal };
}

function torsoWeights(p) {
  const y = p.y;
  const hips = 1 - smoothstep(0.99, 1.1, y);
  const chest = smoothstep(1.17, 1.31, y);
  const spine = Math.max(0, 1 - hips - chest);
  const sh = smoothstep(0.1, 0.2, Math.abs(p.x)) * smoothstep(1.3, 1.41, y);
  const neck = smoothstep(1.475, 1.52, y) * 0.5;
  const clav = p.x > 0 ? 'clavL' : 'clavR';
  return W(['hips', hips], ['spine', spine], ['chest', chest * (1 - sh * 0.55) * (1 - neck)], [clav, chest * sh * 0.55], ['neck', chest * neck]);
}

function torso(ctx) {
  const { M, B } = ctx;
  const S = torsoSurface(ctx);
  ctx.torso = S;
  const rings = [];
  const rows = 44;
  const cols = 56;
  for (let j = 0; j <= rows; j++) {
    const y = lerp(0.95, 1.515, j / rows);
    const ring = [];
    for (let i = 0; i < cols; i++) ring.push(S.point((i / cols) * Math.PI * 2, y));
    rings.push(ring);
  }
  B.grid(rings, M.kimono, torsoWeights, { outward: (p) => new THREE.Vector3(p.x, 0, p.z) });
  // The kimono blouses a little over the obi.
}

// ---------------------------------------------------------------------------
// Crossed collar (left over right) and the pale under-collar at the neck.
// ---------------------------------------------------------------------------

function collar(ctx) {
  const { M, B } = ctx;
  const S = ctx.torso;
  const band = (thetaFn, yFn, n, w, h, off, m, shift = 0) => {
    const pts = [];
    const ups = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const th = thetaFn(t);
      const y = yFn(t);
      const nrm = S.normal(th, y);
      const p = S.point(th, y, 0).addScaledVector(nrm, off + h * 0.5);
      if (shift) {
        // Nudge toward the neck along the surface.
        const up = S.point(th, y + 0.01).sub(S.point(th, y)).normalize();
        p.addScaledVector(up, shift);
      }
      pts.push(p);
      ups.push(nrm);
    }
    B.grid(ribbonRings(pts, ups, w, h, 10), m, torsoWeights, { outward: null });
  };
  // Over the back of the neck and down the front: the left panel crosses over to the
  // right hip; the right panel shows only down to the crossing at the sternum.
  const leftY = profile([[-Math.PI / 2, 1.505], [0.35, 1.5], [Math.PI / 2, 1.25], [2.25, 0.985]]);
  const rightY = profile([[0, 1.505], [Math.PI / 2 + 0.35, 1.5], [Math.PI, 1.25], [Math.PI + 0.12, 1.215]]);
  const thLeft = (t) => lerp(-Math.PI / 2, 2.25, t);
  const yLeft = (t) => leftY(thLeft(t))[0];
  const dRight = (t) => lerp(0, Math.PI + 0.12, t);
  const thRight = (t) => -Math.PI / 2 - dRight(t);
  const yRight = (t) => rightY(dRight(t))[0];
  band(thLeft, yLeft, 64, 0.03, 0.007, 0.001, M.collar, 0.012);
  band(thRight, yRight, 40, 0.03, 0.007, 0.0, M.collar, 0.012);
  band(thLeft, yLeft, 64, 0.036, 0.009, 0.004, M.trim, -0.004);
  band(thRight, yRight, 40, 0.036, 0.009, 0.003, M.trim, -0.004);
}

// ---------------------------------------------------------------------------
// Scarf: a heavy length of cloth wound three times round the neck, sitting low
// in front under the chin and high at the back, its loose end draped over the
// chest.
// ---------------------------------------------------------------------------

function scarf(ctx) {
  const { M, B, at } = ctx;
  const n0 = at('neck');
  const cz = n0.z + 0.006;
  const wraps = [
    // y      rx     rz     tube   tilt  twist
    [1.468, 0.108, 0.1, 0.034, 0.018, 0.0],
    [1.508, 0.094, 0.087, 0.03, 0.026, 1.7],
    [1.546, 0.079, 0.074, 0.025, 0.034, 3.1],
  ];
  const neckW = (p) => {
    const a = smoothstep(1.46, 1.56, p.y);
    return W(['chest', 1 - a], ['neck', a * 0.8], ['head', a * 0.2]);
  };
  for (const [y, rx, rz, tube, tilt, twist] of wraps) {
    const pts = [];
    const n = 40;
    for (let k = 0; k <= n; k++) {
      const th = (k / n) * Math.PI * 2;
      // Folds: the cloth bunches and slackens as it goes round.
      const f = 1 + 0.07 * Math.sin(th * 3 + twist) + 0.04 * Math.sin(th * 7 + twist * 2);
      pts.push(new THREE.Vector3(Math.cos(th) * rx * f, y - tilt * Math.sin(th) + 0.006 * Math.sin(th * 5 + twist), cz + Math.sin(th) * rz * f));
    }
    const rad = (t) => tube * (1 + 0.18 * Math.sin(t * Math.PI * 2 * 4 + twist));
    B.grid(tubeRings(pts, rad, 14, 0.8), M.scarf, neckW, { outward: null });
  }
  // The loose end: a soft fold hanging down over the chest from under the wraps.
  const S = ctx.torso;
  const rows = [];
  for (let j = 0; j <= 10; j++) {
    const t = j / 10;
    const y = lerp(1.47, 1.33, t);
    const half = lerp(0.62, 0.3, t) * (1 - 0.3 * t * t);
    const ring = [];
    for (let i = 0; i <= 12; i++) {
      const u = (i / 12) * 2 - 1;
      const th = Math.PI / 2 + 0.25 + u * half;
      const bulge = 0.022 + 0.014 * Math.cos(u * Math.PI / 2) * (1 - t) + 0.006 * Math.sin(u * 9 + t * 4);
      ring.push(S.point(th, y, bulge));
    }
    rows.push(ring);
  }
  B.grid(rows, M.scarf, torsoWeights, { closed: false, outward: (p) => new THREE.Vector3(p.x, 0, p.z) });
}

// ---------------------------------------------------------------------------
// Straps: two leather bands crossing the chest and the back, shoulder to hip,
// from under the scarf; an iron ring where they cross in front.
// ---------------------------------------------------------------------------

function straps(ctx) {
  const { M, B } = ctx;
  const S = ctx.torso;
  const band = (th0, th1, y0, y1, off) => {
    const pts = [];
    const ups = [];
    const n = 24;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const th = lerp(th0, th1, t);
      const y = lerp(y0, y1, t);
      const nrm = S.normal(th, y);
      pts.push(S.point(th, y, 0.009 + off).addScaledVector(nrm, 0.003));
      ups.push(nrm);
    }
    B.grid(ribbonRings(pts, ups, 0.042, 0.006, 8), M.strap, torsoWeights, { outward: null });
  };
  // Front: left shoulder to right hip over right shoulder to left hip.
  band(0.95, 2.45, 1.4, 1.02, 0.0);
  band(2.2, 0.72, 1.4, 1.02, 0.006);
  // Back.
  band(-0.95, -2.45, 1.4, 1.02, 0.0);
  band(-2.2, -0.72, 1.4, 1.02, 0.006);
  // The ring where the front straps cross.
  const cross = S.point(Math.PI / 2 + 0.08, 1.225, 0.02);
  const ring = new THREE.TorusGeometry(0.016, 0.0035, 6, 18);
  B.add(ring, M.iron, W(['chest', 0.5], ['spine', 0.5]), { matrix: new THREE.Matrix4().makeTranslation(cross.x, cross.y, cross.z) });
}

// ---------------------------------------------------------------------------
// Obi: a thick sash with rounded edges and a knot at the back.
// ---------------------------------------------------------------------------

function obi(ctx) {
  const { M, B } = ctx;
  const S = ctx.torso;
  const y0 = 0.965;
  const y1 = 1.08;
  const rings = [];
  const cols = 56;
  const rows = 14;
  for (let j = 0; j <= rows; j++) {
    const t = j / rows;
    const e = Math.pow(Math.abs(2 * t - 1), 6);
    const y = lerp(y0, y1, t);
    const off = 0.004 + 0.011 * (1 - e);
    const ring = [];
    for (let i = 0; i < cols; i++) ring.push(S.point((i / cols) * Math.PI * 2, y, off));
    rings.push(ring);
  }
  B.grid(rings, M.obi, W(['hips', 1]), { outward: (p) => new THREE.Vector3(p.x, 0, p.z) });
  // Knot.
  const knot = new THREE.SphereGeometry(1, 20, 14);
  knot.scale(0.075, 0.045, 0.03);
  B.add(knot, M.obi, W(['hips', 0.7], ['spine', 0.3]), { matrix: new THREE.Matrix4().makeTranslation(0, 1.035, -0.145) });
  const tails = new THREE.BoxGeometry(0.05, 0.12, 0.012, 1, 3, 1);
  const tm = new THREE.Matrix4().makeRotationZ(0.25).setPosition(-0.03, 0.97, -0.15);
  B.add(tails, M.obi, 'hips', { matrix: tm });
}

// ---------------------------------------------------------------------------
// Hakama: wide pleated trousers that hang like a skirt, each side following
// its thigh and, toward the hem, its shin. Plus the stiff back board.
// ---------------------------------------------------------------------------

// Each side of the hakama hangs from its own bone, which follows the thigh only
// part of the way (and lags like cloth); the middle blends the two.
function hakamaWeights(p) {
  const t = clamp((1.0 - p.y) / 0.8, 0, 1);
  const sL = smoothstep(-0.12, 0.12, p.x);
  const hips = 1 - smoothstep(0.03, 0.45, t);
  const rest = 1 - hips;
  return W(['hips', hips], ['hakL', rest * sL], ['hakR', rest * (1 - sL)]);
}

function hakama(ctx) {
  const { M, B, o } = ctx;
  const P = profile([
    // y     a      bF     bB     n
    [1.005, 0.157, 0.124, 0.120, 2.3],
    [0.95, 0.176, 0.136, 0.13, 2.3],
    [0.85, 0.212, 0.158, 0.148, 2.2],
    [0.70, 0.252, 0.185, 0.172, 2.1],
    [0.50, 0.29, 0.212, 0.198, 2.0],
    [0.32, 0.315, 0.232, 0.216, 2.0],
    [0.19, 0.326, 0.24, 0.224, 2.0],
  ]);
  const hemY = 0.19;
  const tmp = new THREE.Vector3();
  const cols = 72;
  const point = (theta, y, inset = 0) => {
    const [a, bF, bB, n] = P(y);
    const k = lerp(1, o.build, 0.7);
    const depth = 0.075 * smoothstep(1.0, 0.45, y);
    // Pleats: seven folds in front, fewer behind.
    const front = Math.sin(theta) > 0;
    const f = front ? Math.abs(Math.sin((theta - Math.PI / 2) * 5.0)) : Math.abs(Math.sin(theta * 2.0));
    const pl = 1 + depth * (Math.pow(f, 0.6) - 0.6);
    superPoint(theta, a * k * pl - inset, bF * k * pl - inset, bB * k * pl - inset, n, 0, tmp);
    return new THREE.Vector3(tmp.x, y, tmp.z);
  };
  const rings = [];
  const rows = 40;
  for (let j = 0; j <= rows; j++) {
    const y = lerp(1.005, hemY, j / rows);
    const ring = [];
    for (let i = 0; i < cols; i++) ring.push(point((i / cols) * Math.PI * 2, y));
    rings.push(ring);
  }
  // Fold the hem inward so its edge has thickness.
  const inner = [];
  for (let i = 0; i < cols; i++) inner.push(point((i / cols) * Math.PI * 2, hemY + 0.004, 0.009));
  rings.push(inner);
  const inner2 = [];
  for (let i = 0; i < cols; i++) inner2.push(point((i / cols) * Math.PI * 2, hemY + 0.06, 0.012));
  rings.push(inner2);
  B.grid(rings, M.hakama, hakamaWeights, { outward: (p, j) => (j <= rows ? new THREE.Vector3(p.x, 0, p.z) : new THREE.Vector3(-p.x, 0, -p.z)) });
  ctx.dims.hakamaHem = hemY;

  if (o.koshiita) {
    // Koshi-ita: the stiff trapezoid board at the small of the back.
    const S = ctx.torso;
    const kr = [];
    for (let j = 0; j <= 6; j++) {
      const y = lerp(1.0, 1.135, j / 6);
      const half = lerp(0.52, 0.4, j / 6);
      const ring = [];
      for (let i = 0; i <= 10; i++) {
        const th = -Math.PI / 2 + lerp(-half, half, i / 10);
        ring.push(S.point(th, y, 0.022));
      }
      kr.push(ring);
    }
    B.grid(kr, M.hakama, W(['hips', 0.7], ['spine', 0.3]), { closed: false, outward: (p) => new THREE.Vector3(p.x, 0, p.z) });
  }
}

// ---------------------------------------------------------------------------
// Legs: wrapped gaiters on the shins, tabi and straw sandals.
// ---------------------------------------------------------------------------

function legs(ctx) {
  const { M, B, at, o } = ctx;
  for (const side of [1, -1]) {
    const S = side > 0 ? 'L' : 'R';
    const shin = at(`shin${S}`);
    const rp = profile([
      [0.0, 0.046, 0.0],
      [0.1, 0.053, -0.006],
      [0.18, 0.055, -0.009],
      [0.27, 0.047, -0.004],
      [0.36, 0.04, 0.0],
      [0.41, 0.041, 0.0],
    ]);
    const rings = [];
    for (let j = 0; j <= 18; j++) {
      const d = lerp(0.03, 0.415, j / 18);
      const [r, dz] = rp(d);
      const ring = [];
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        ring.push(new THREE.Vector3(shin.x + Math.cos(a) * r, shin.y - d, shin.z + dz + Math.sin(a) * r * 1.05));
      }
      rings.push(ring);
    }
    B.grid(rings, M.gaiter, `shin${S}`, { outward: (p) => new THREE.Vector3(p.x - shin.x, 0, p.z - shin.z) });

    // Foot: ankle, tabi, sandal, straps. Foot-local: ankle at origin, toes +Z.
    const F = ctx.T(`foot${S}`);
    const ank = new THREE.CylinderGeometry(0.04, 0.043, 0.075, 16, 1, true);
    B.add(ank, M.tabi, `foot${S}`, { matrix: F.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.0, -0.004)) });
    const foot = new THREE.SphereGeometry(1, 24, 16);
    const fp = foot.attributes.position;
    for (let i = 0; i < fp.count; i++) {
      let x = fp.getX(i) * 0.046;
      let y = fp.getY(i) * 0.04;
      let z = fp.getZ(i) * 0.128;
      // Wider across the ball, flat underneath, rounded heel.
      x *= 1 + 0.2 * smoothstep(-0.02, 0.08, z) - 0.25 * smoothstep(0.08, 0.13, z);
      y = Math.max(y, -0.028);
      y *= 1 - 0.35 * smoothstep(0.02, 0.13, z);
      fp.setXYZ(i, x, y - 0.043, z + 0.045);
    }
    foot.computeVertexNormals();
    B.add(foot, M.tabi, `foot${S}`, { matrix: F });
    const sole = roundedBox(0.098, 0.016, 0.27, 0.007);
    B.add(sole, M.straw, `foot${S}`, { matrix: F.clone().multiply(new THREE.Matrix4().makeTranslation(0, -DIM.ANKLE_H + 0.008, 0.048)) });
    // Straps from the toe post back around the ankle.
    const f0 = at(`foot${S}`);
    for (const k of [1, -1]) {
      const pts = [
        new THREE.Vector3(0, -0.058, 0.13),
        new THREE.Vector3(0.03 * k, -0.035, 0.07),
        new THREE.Vector3(0.046 * k, -0.03, 0.0),
        new THREE.Vector3(0.03 * k, -0.035, -0.045),
      ].map((p) => p.add(f0));
      B.grid(tubeRings(pts, 0.0045, 6), M.cord, `foot${S}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Arms: a soft sleeve over the upper arm (blending into the shoulder and the
// elbow), lacquered kote or bare forearms, fists that close around a grip.
// ---------------------------------------------------------------------------

function arms(ctx) {
  const { M, B, at, o } = ctx;
  for (const side of [1, -1]) {
    const S = side > 0 ? 'L' : 'R';
    const sh = at(`arm${S}`);
    const clav = `clav${S}`;
    const arm = `arm${S}`;
    const fore = `fore${S}`;
    const hand = `hand${S}`;
    const tied = o.sleeves === 'tied';
    // Upper sleeve.
    const top = sh.y + 0.045;
    const bottom = tied ? sh.y - 0.17 : sh.y - 0.325;
    const rp = tied
      ? profile([[0, 0.058], [0.03, 0.074], [0.1, 0.082], [0.17, 0.078], [0.2, 0.066], [0.215, 0.058]])
      : profile([[0, 0.058], [0.03, 0.072], [0.08, 0.078], [0.16, 0.074], [0.26, 0.068], [0.33, 0.064], [0.37, 0.068]]);
    const rows = 20;
    const rings = [];
    for (let j = 0; j <= rows; j++) {
      const y = lerp(top, bottom, j / rows);
      const [r] = rp(top - y);
      const ring = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const fold = 1 + 0.03 * Math.sin(a * 3 + j * 0.7) * smoothstep(0.1, 0.3, top - y);
        ring.push(new THREE.Vector3(sh.x + Math.cos(a) * r * fold, y, sh.z + Math.sin(a) * r * 0.9 * fold));
      }
      rings.push(ring);
    }
    const sleeveW = (p) => {
      const d = top - p.y;
      const c = 0.5 * (1 - smoothstep(0.02, 0.08, d));
      const f = 0.5 * smoothstep(DIM.UPPER_ARM - 0.06, DIM.UPPER_ARM + 0.05, d - 0.045);
      return W([clav, c], [arm, 1 - c - f], [fore, f]);
    };
    B.grid(rings, M.kimono, sleeveW, { outward: (p) => new THREE.Vector3(p.x - sh.x, 0, p.z - sh.z) });

    const el = at(fore);
    if (tied) {
      // Bare arm below the tied-up sleeve: biceps, elbow, forearm, wrist.
      const ap = profile([
        [0.0, 0.043], [0.08, 0.047], [0.2, 0.041], [0.28, 0.037], [0.34, 0.044], [0.42, 0.041], [0.5, 0.031], [0.53, 0.029],
      ]);
      const start = sh.y - 0.12;
      const end = el.y - DIM.FOREARM + 0.005;
      const ar = [];
      for (let j = 0; j <= 26; j++) {
        const y = lerp(start, end, j / 26);
        const [r] = ap(start - y);
        const ring = [];
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          ring.push(new THREE.Vector3(sh.x + Math.cos(a) * r, y, sh.z + Math.sin(a) * r * 0.92));
        }
        ar.push(ring);
      }
      const armW = (p) => {
        const f = smoothstep(el.y + 0.05, el.y - 0.05, p.y);
        return W([arm, 1 - f], [fore, f]);
      };
      B.grid(ar, M.skin, armW, { outward: (p) => new THREE.Vector3(p.x - sh.x, 0, p.z - sh.z) });
      // Cloth wrap at the wrist.
      const wr = [];
      for (let j = 0; j <= 4; j++) {
        const y = lerp(el.y - 0.16, el.y - DIM.FOREARM + 0.012, j / 4);
        const ring = [];
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          ring.push(new THREE.Vector3(sh.x + Math.cos(a) * 0.039, y, sh.z + Math.sin(a) * 0.036));
        }
        wr.push(ring);
      }
      B.grid(wr, M.band, fore);
    } else {
      // Kote: lacquered plates over a mail sleeve, from elbow to wrist.
      const kp = profile([[0, 0.056], [0.06, 0.056], [0.13, 0.05], [0.2, 0.042], [0.245, 0.037]]);
      const kr = [];
      for (let j = 0; j <= 16; j++) {
        const d = lerp(-0.02, 0.245, j / 16);
        const [r] = kp(Math.max(d, 0));
        const ring = [];
        for (let i = 0; i < 20; i++) {
          const a = (i / 20) * Math.PI * 2;
          ring.push(new THREE.Vector3(sh.x + Math.cos(a) * r, el.y - d, sh.z + Math.sin(a) * r * 0.9));
        }
        kr.push(ring);
      }
      const koteW = (p) => {
        const f = smoothstep(el.y + 0.03, el.y - 0.05, p.y);
        return W([arm, 1 - f], [fore, f]);
      };
      B.grid(kr, M.kote, koteW, { outward: (p) => new THREE.Vector3(p.x - sh.x, 0, p.z - sh.z), uvFn: (u, v, arc, along) => [arc, along] });
    }

    // Fist. Hand-local: wrist at origin, fist centre at (0, -GRIP, 0), grip axis along Z.
    const H = ctx.T(hand);
    const skinHand = tied ? M.skin : M.glove;
    const fist = roundedBox(0.056, 0.078, 0.09, 0.022);
    B.add(fist, skinHand, hand, { matrix: H.clone().multiply(new THREE.Matrix4().makeTranslation(0, -DIM.GRIP + 0.004, 0.004)) });
    const thumb = new THREE.CapsuleGeometry(0.013, 0.035, 4, 8);
    thumb.rotateX(Math.PI / 2 - 0.35);
    B.add(thumb, skinHand, hand, { matrix: H.clone().multiply(new THREE.Matrix4().makeTranslation(0, -DIM.GRIP + 0.03, 0.046)) });
    const wrist = new THREE.CylinderGeometry(0.032, 0.03, 0.05, 12, 1, true);
    B.add(wrist, skinHand, W([hand, 0.6], [fore, 0.4]), { matrix: H.clone().multiply(new THREE.Matrix4().makeTranslation(0, -0.01, 0)) });
  }
}

// ---------------------------------------------------------------------------
// Neck and head: skull, jaw, brow, nose, eyes, ears, hair.
// ---------------------------------------------------------------------------

// Head-local skull surface for a unit direction (head centre at HC).
const HC = new THREE.Vector3(0, 0.1, 0.012);
function skull(v, out, grow = 0) {
  let sx = 0.079;
  let sy = 0.103;
  let sz = 0.095;
  const low = smoothstep(0.05, -0.85, v.y);
  const front = smoothstep(-0.2, 0.75, v.z);
  sx *= 1 - 0.3 * low * (0.35 + 0.65 * front);
  sz *= 1 - 0.05 * front * (1 - low) + 0.06 * smoothstep(0.1, -0.8, v.z) * smoothstep(-0.7, 0.2, v.y);
  let x = v.x * sx;
  let y = v.y * sy;
  let z = v.z * sz;
  // Chin and jaw come forward; brow ridge; cheekbones; sockets.
  z += 0.012 * low * front * smoothstep(-0.2, 0.6, v.z);
  z += 0.006 * Math.exp(-((v.y - 0.28) ** 2) / 0.012) * smoothstep(0.5, 0.95, v.z) * (1 - 2.5 * Math.min(0.3, Math.abs(v.x)) + 0.3);
  const ex = Math.abs(v.x) - 0.38;
  z -= 0.006 * Math.exp(-(ex * ex + (v.y - 0.12) ** 2) / 0.02) * front;
  const cx = Math.abs(v.x) - 0.55;
  x += Math.sign(v.x) * 0.004 * Math.exp(-(cx * cx + (v.y + 0.05) ** 2) / 0.04) * front;
  // Flat-ish sides at the temples.
  x *= 1 - 0.05 * smoothstep(0.3, 0.8, v.y);
  const g = 1 + grow;
  return out.set(HC.x + x * g, HC.y + y * g, HC.z + z * g);
}

function sphereMap(geo, fn) {
  const P = geo.attributes.position;
  const v = new THREE.Vector3();
  const o = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) {
    v.fromBufferAttribute(P, i).normalize();
    fn(v, o);
    P.setXYZ(i, o.x, o.y, o.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function neckAndHead(ctx) {
  const { M, B, at, o, T } = ctx;
  const n0 = at('neck');
  // Neck.
  const nr = [];
  for (let j = 0; j <= 10; j++) {
    const y = lerp(1.44, 1.63, j / 10);
    const r = lerp(0.054, 0.047, smoothstep(1.44, 1.56, y));
    const ring = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      ring.push(new THREE.Vector3(Math.cos(a) * r * o.build, y, n0.z + 0.004 + Math.sin(a) * r));
    }
    nr.push(ring);
  }
  const neckW = (p) => {
    const a = smoothstep(1.46, 1.51, p.y);
    const b = smoothstep(1.555, 1.6, p.y);
    return W(['chest', 1 - a], ['neck', a * (1 - b)], ['head', b]);
  };
  B.grid(nr, M.skin, neckW, { outward: (p) => new THREE.Vector3(p.x, 0, p.z - n0.z) });

  if (o.face === 'young') {
    buildYoungHead(ctx, W);
    return;
  }

  const HM = T('head');
  // Face tint: shadowed sockets, a hint of lip, stubble or beard for the ronin.
  const beard = o.face === 'beard';
  const faceTint = (p) => {
    const q = p.clone().sub(ctx.bind.head).sub(HC);
    const ux = q.x / 0.079;
    const uy = q.y / 0.103;
    const uz = q.z / 0.095;
    let t = 1;
    const ex = Math.abs(ux) - 0.38;
    t *= 1 - 0.18 * Math.exp(-(ex * ex + (uy - 0.12) ** 2) / 0.02) * smoothstep(0.3, 0.8, uz);
    if (beard) {
      const jaw = smoothstep(0.0, -0.35, uy) * smoothstep(-0.5, 0.2, uz);
      const lipZone = Math.exp(-(ux * ux) / 0.05 - ((uy + 0.42) ** 2) / 0.004) * smoothstep(0.6, 0.9, uz);
      const must = Math.exp(-(ux * ux) / 0.09 - ((uy + 0.3) ** 2) / 0.006) * smoothstep(0.6, 0.9, uz);
      const k = Math.max(jaw * 0.82, must * 0.85) * (1 - lipZone);
      return [lerp(t, 0.16, k), lerp(t, 0.14, k), lerp(t, 0.13, k)];
    }
    return t;
  };
  const head = sphereMap(new THREE.SphereGeometry(1, 44, 34), (v, out) => skull(v, out));
  B.add(head, M.skin, 'head', { matrix: HM, tint: faceTint });

  // Nose: a soft wedge.
  if (o.face !== 'mask' && o.face !== 'menpo') {
    const nose = new THREE.SphereGeometry(1, 14, 10);
    const np = nose.attributes.position;
    for (let i = 0; i < np.count; i++) {
      const x = np.getX(i);
      const y = np.getY(i);
      const z = np.getZ(i);
      const w = 0.011 * (0.55 + 0.45 * smoothstep(1, -1, y));
      np.setXYZ(i, x * w, y * 0.026, Math.max(z, -0.2) * 0.017 * (0.3 + 0.7 * smoothstep(1, -0.6, y)));
    }
    nose.computeVertexNormals();
    B.add(nose, M.skin, 'head', { matrix: HM.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.083, 0.1).multiply(new THREE.Matrix4().makeRotationX(-0.2))) });
  }
  // Eyes and brows.
  const eyeGeo = new THREE.SphereGeometry(1, 10, 8);
  eyeGeo.scale(0.0115, 0.0065, 0.006);
  for (const sx of [1, -1]) {
    B.add(eyeGeo, M.eye, 'head', { matrix: HM.clone().multiply(new THREE.Matrix4().makeTranslation(0.031 * sx, 0.112, 0.093)) });
    const brow = roundedBox(0.034, 0.008, 0.012, 0.003);
    const bm = new THREE.Matrix4().makeTranslation(0.032 * sx, 0.127, 0.097).multiply(new THREE.Matrix4().makeRotationZ(-0.16 * sx));
    B.add(brow, M.hair, 'head', { matrix: HM.clone().multiply(bm) });
    // Ears.
    const ear = new THREE.SphereGeometry(1, 12, 10);
    ear.scale(0.011, 0.027, 0.019);
    B.add(ear, M.ear, 'head', { matrix: HM.clone().multiply(new THREE.Matrix4().makeTranslation(0.079 * sx, 0.1, 0.004)) });
  }
  if (beard) {
    // Mustache and a short chin beard.
    const must = [new THREE.Vector3(-0.024, 0.052, 0.102), new THREE.Vector3(0, 0.058, 0.111), new THREE.Vector3(0.024, 0.052, 0.102)];
    B.grid(capRings(capRings(tubeRings(must.map((p) => p.add(ctx.bind.head)), (t) => 0.004 + 0.003 * Math.sin(Math.PI * t), 8), true, 0.004), false, 0.004), M.hair, 'head');
  }

  // Hair: a cap over the crown and back of the head.
  if (o.hairStyle) {
    const cap = new THREE.SphereGeometry(1, 36, 24, 0, Math.PI * 2, 0, 1.9);
    cap.rotateX(-1.02);
    sphereMap(cap, (v, out) => skull(v, out, 0.045));
    B.add(cap, M.hair, 'head', { matrix: HM });
    if (o.hairStyle === 'topknot') {
      const knot = new THREE.CapsuleGeometry(0.016, 0.05, 4, 10);
      knot.rotateX(Math.PI / 2 - 0.2);
      B.add(knot, M.hair, 'head', { matrix: HM.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.212, -0.005)) });
    } else if (o.hairStyle === 'ponytail') {
      const tail = ctx.bind.tail;
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        pts.push(new THREE.Vector3(0, -0.02 - t * 0.22 + 0.04 * Math.sin(t * 2), -0.01 - t * 0.05).add(tail));
      }
      B.grid(capRings(tubeRings(pts, (t) => lerp(0.02, 0.007, t), 10, 0.8), true, 0.01), M.hair, W(['tail', 1]));
      const tie = new THREE.CylinderGeometry(0.019, 0.019, 0.02, 10);
      B.add(tie, M.band, 'tail', { matrix: new THREE.Matrix4().makeTranslation(tail.x, tail.y - 0.03, tail.z - 0.01) });
    }
  }

  // Mask over the lower face (bandits), or the lacquered menpo.
  if (o.face === 'mask' || o.face === 'menpo') {
    const menpo = o.face === 'menpo';
    const g = new THREE.SphereGeometry(1, 32, 18, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.49, Math.PI * 0.43);
    sphereMap(g, (v, out) => {
      skull(v, out, menpo ? 0.1 : 0.07);
      // A ridge over the nose.
      const nx = v.x;
      out.z += 0.018 * Math.exp(-(nx * nx) / 0.02) * smoothstep(-0.2, -0.02, v.y) * smoothstep(0.5, 0.9, v.z);
      return out;
    });
    B.add(g, menpo ? M.menpo : M.mask, 'head', { matrix: HM });
    if (menpo) {
      for (const sx of [1, -1]) {
        const pts = [new THREE.Vector3(0.006 * sx, 0.05, 0.128), new THREE.Vector3(0.04 * sx, 0.04, 0.11), new THREE.Vector3(0.062 * sx, 0.0, 0.084)];
        B.grid(capRings(tubeRings(pts.map((p) => p.add(ctx.bind.head)), (t) => 0.007 * (1 - 0.6 * t), 8), true, 0.008), M.hairWhite, 'head');
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Headwear.
// ---------------------------------------------------------------------------

function headwear(ctx) {
  const { M, B, o, T, bind } = ctx;
  const HT = T('hat');
  if (o.headwear === 'kasa') {
    // A wide, shallow cone of woven bamboo with a small knob at the peak and a
    // thick rolled rim.
    const R = 0.405;
    const pts = [
      [0.0, 0.14], [0.012, 0.137], [0.03, 0.124], [0.07, 0.1], [0.13, 0.073], [0.2, 0.047], [0.27, 0.025], [0.33, 0.009],
      [0.375, -0.002], [0.398, -0.009], [R, -0.015], [0.4, -0.021], [0.385, -0.02], [0.33, -0.006], [0.25, 0.017],
      [0.16, 0.047], [0.08, 0.078], [0.03, 0.099], [0.0, 0.106],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const kasa = new THREE.LatheGeometry(pts, 96);
    B.add(kasa, M.hat, 'hat', { matrix: HT, uvFn: (p, u) => [u, Math.hypot(p.x, p.z)] });
    const peak = new THREE.SphereGeometry(0.016, 12, 8);
    peak.scale(1, 0.8, 1);
    B.add(peak, M.straw, 'hat', { matrix: HT.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.142, 0)) });
    // The ring inside that sits on the head.
    const ring = new THREE.CylinderGeometry(0.084, 0.088, 0.045, 28, 1, true);
    B.add(ring, M.straw, 'hat', { matrix: HT.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.066, -0.004)) });
    // Loose straw ends bristling round the rim.
    let sd = 3;
    const rnd = () => {
      sd = (sd * 16807) % 2147483647;
      return sd / 2147483647;
    };
    for (let k = 0; k < 90; k++) {
      const a = (k / 90) * Math.PI * 2 + rnd() * 0.05;
      const len = 0.012 + rnd() * 0.022;
      const out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      const side = new THREE.Vector3(-out.z, 0, out.x);
      const base = out.clone().multiplyScalar(R - 0.004).add(new THREE.Vector3(0, -0.015, 0));
      const dir = out.clone().multiplyScalar(0.8).addScaledVector(side, (rnd() - 0.5) * 0.9).add(new THREE.Vector3(0, -0.35 - rnd() * 0.3, 0)).normalize();
      const tip = base.clone().addScaledVector(dir, len);
      const p0 = base.clone().add(bind.hat);
      const p1 = tip.clone().add(bind.hat);
      B.grid(tubeRings([p0, p0.clone().lerp(p1, 0.5), p1], (t) => 0.0014 * (1 - t * 0.8), 3), M.straw, 'hat', { outward: null });
    }
    if (o.face === 'young') buildChinCords(ctx, W, M.cord);
    else {
      for (const sx of [1, -1]) {
        const c = [
          new THREE.Vector3(0.08 * sx, 0.05, 0.015),
          new THREE.Vector3(0.086 * sx, -0.04, 0.035),
          new THREE.Vector3(0.07 * sx, -0.11, 0.055),
          new THREE.Vector3(0.03 * sx, -0.158, 0.07),
          new THREE.Vector3(0.0, -0.166, 0.072),
        ].map((p) => p.add(bind.hat));
        B.grid(tubeRings(c, 0.0032, 6), M.straw, 'hat');
      }
    }
    ctx.dims.hatRadius = R;
  } else if (o.headwear === 'jingasa') {
    const pts = [[0, 0.1], [0.03, 0.09], [0.12, 0.05], [0.24, 0.0], [0.27, -0.012], [0.265, -0.02], [0.2, 0.0], [0.1, 0.04], [0.0, 0.055]]
      .map(([r, y]) => new THREE.Vector2(r, y));
    B.add(new THREE.LatheGeometry(pts, 56), M.lacquer, 'hat', { matrix: HT.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.025, 0)) });
    const mon = new THREE.TorusGeometry(0.03, 0.005, 6, 20);
    mon.rotateX(-0.5);
    B.add(mon, M.gold, 'hat', { matrix: HT.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.085, 0.07)) });
    const ring = new THREE.CylinderGeometry(0.086, 0.09, 0.05, 24, 1, true);
    B.add(ring, M.cord, 'hat', { matrix: HT.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.035, -0.004)) });
    for (const sx of [1, -1]) {
      const c = [new THREE.Vector3(0.082 * sx, 0.02, 0.01), new THREE.Vector3(0.085 * sx, -0.07, 0.04), new THREE.Vector3(0.03 * sx, -0.155, 0.07), new THREE.Vector3(0, -0.162, 0.072)]
        .map((p) => p.add(bind.hat));
      B.grid(tubeRings(c, 0.003, 6), M.cord, 'hat');
    }
    ctx.dims.hatRadius = 0.27;
  } else if (o.headwear === 'hachimaki') {
    // Headband around the brow, knotted behind with two tails.
    const pts = [];
    const ups = [];
    const v = new THREE.Vector3();
    const q = new THREE.Vector3();
    for (let k = 0; k <= 40; k++) {
      const a = (k / 40) * Math.PI * 2;
      const lat = 0.33 + 0.1 * (0.5 - 0.5 * Math.sin(a));
      v.set(Math.cos(a) * Math.cos(lat), Math.sin(lat), Math.sin(a) * Math.cos(lat)).normalize();
      skull(v, q, 0.075);
      pts.push(q.clone().add(bind.head));
      ups.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
    }
    B.grid(ribbonRings(pts, ups, 0.026, 0.006, 8), M.band, 'head');
    for (const sx of [1, -1]) {
      const tp = [];
      const tu = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        tp.push(new THREE.Vector3(0.012 * sx + 0.03 * sx * t, 0.02 - 0.14 * t, -0.005 - 0.07 * t).add(bind.tail));
        tu.push(new THREE.Vector3(sx, 0, -0.3).normalize());
      }
      B.grid(ribbonRings(tp, tu, 0.004, 0.024, 6, (t) => 1 - 0.3 * t), M.band, W(['tail', 1]));
    }
  } else if (o.headwear === 'kabuto') {
    // Helmet bowl, flared neck guard, turn-backs and a gilded crescent.
    const bowl = new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.55);
    bowl.scale(0.118, 0.12, 0.126);
    B.add(bowl, M.lacquer, 'head', { matrix: T('head', 0, 0.105, 0.005) });
    const ridges = new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.12);
    ridges.scale(0.03, 0.02, 0.03);
    B.add(ridges, M.gold, 'head', { matrix: T('head', 0, 0.222, 0.005) });
    const sp = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      sp.push(new THREE.Vector2(0.125 + 0.1 * t * t + 0.02 * t, 0.12 - 0.13 * t));
    }
    const shikoro = new THREE.LatheGeometry(sp, 40, Math.PI * 0.25, Math.PI * 1.5);
    shikoro.rotateY(Math.PI * 0.5);
    B.add(shikoro, M.armor, 'head', { matrix: T('head', 0, 0.0, -0.01), uvFn: (p) => [Math.atan2(p.z, p.x) * 0.2, p.y] });
    const crest = new THREE.TorusGeometry(0.12, 0.009, 6, 32, Math.PI * 0.8);
    crest.rotateZ(Math.PI * 0.1);
    crest.scale(1.2, 1, 0.3);
    B.add(crest, M.gold, 'head', { matrix: T('head', 0, 0.18, 0.13) });
  }
}

// ---------------------------------------------------------------------------
// Armour for the heavy: lamellar cuirass, shoulder guards and tassets.
// ---------------------------------------------------------------------------

function armor(ctx) {
  const { M, B } = ctx;
  const S = ctx.torso;
  const rings = [];
  for (let j = 0; j <= 18; j++) {
    const y = lerp(1.0, 1.4, j / 18);
    const off = 0.03 + 0.008 * Math.sin((j / 18) * Math.PI);
    const ring = [];
    for (let i = 0; i < 48; i++) ring.push(S.point((i / 48) * Math.PI * 2, y, off));
    rings.push(ring);
  }
  B.grid(rings, M.armor, torsoWeights, { outward: (p) => new THREE.Vector3(p.x, 0, p.z) });
  // Kusazuri: plates hanging around the hips that swing with the legs.
  for (let k = 0; k < 7; k++) {
    const th = (k / 7) * Math.PI * 2 + Math.PI / 14;
    const pr = [];
    for (let j = 0; j <= 5; j++) {
      const y = lerp(1.0, 0.7, j / 5);
      const ring = [];
      for (let i = 0; i <= 6; i++) {
        const t = th + lerp(-0.42, 0.42, i / 6);
        const r = 1.1 + 0.28 * (j / 5);
        ring.push(new THREE.Vector3(Math.cos(t) * 0.165 * r * ctx.o.build, y, Math.sin(t) * 0.13 * r));
      }
      pr.push(ring);
    }
    B.grid(pr, M.armor, hakamaWeights, { closed: false, outward: (p) => new THREE.Vector3(p.x, 0, p.z) });
  }
  // Sode: broad plates on the shoulders.
  for (const side of [1, -1]) {
    const Sd = side > 0 ? 'L' : 'R';
    const sh = ctx.at(`arm${Sd}`);
    const pr = [];
    for (let j = 0; j <= 6; j++) {
      const y = lerp(sh.y + 0.06, sh.y - 0.2, j / 6);
      const ring = [];
      for (let i = 0; i <= 8; i++) {
        const a = lerp(-0.95, 0.95, i / 8);
        const r = 0.1 + 0.03 * (j / 6);
        ring.push(new THREE.Vector3(sh.x + side * Math.cos(a) * r, y, sh.z + Math.sin(a) * r));
      }
      pr.push(ring);
    }
    B.grid(pr, M.armor, W([`clav${Sd}`, 0.45], [`arm${Sd}`, 0.55]), { closed: false, outward: (p) => new THREE.Vector3(p.x - sh.x, 0, p.z - sh.z) });
  }
}

// ---------------------------------------------------------------------------
// Swords: the drawn blade on its own bone, the empty scabbard and the short
// sword thrust through the obi.
// ---------------------------------------------------------------------------

// Blade along +Z, spine up (+Y), edge down: a faceted diamond section so the
// ridge line and the flat catch the sun separately, sweeping into the kissaki.
function bladeGeometry(len, width, sori) {
  const segs = 36;
  const sections = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const z = t * len;
    const y0 = sori * t * t;
    const kt = Math.max(0, (t - 0.9) / 0.1);
    const tip = Math.sqrt(Math.max(0, 1 - kt * kt));
    const w = width * (1 - 0.28 * t) * (kt > 0 ? tip : 1);
    const th = width * 0.23 * (1 - 0.4 * t) * (kt > 0 ? tip : 1);
    sections.push([
      [0, y0, z, 0, t],
      [th / 2, y0 - w * 0.28, z, 0.28, t],
      [0, y0 - w, z, 1, t],
      [-th / 2, y0 - w * 0.28, z, 0.28, t],
    ]);
  }
  const pos = [];
  const uv = [];
  const quad = (a, b, c, d) => {
    for (const v of [a, b, c, b, d, c]) {
      pos.push(v[0], v[1], v[2]);
      uv.push(v[3], v[4] * len);
    }
  };
  for (let i = 0; i < segs; i++) {
    const s0 = sections[i];
    const s1 = sections[i + 1];
    for (let k = 0; k < 4; k++) {
      const k1 = (k + 1) % 4;
      quad(s0[k], s0[k1], s1[k], s1[k1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

function swords(ctx) {
  const { M, B, o, bind } = ctx;
  const long = o.blade === 'nodachi';
  const bladeLen = long ? 0.98 : 0.72;
  const handle = long ? 0.34 : 0.25;
  // Drawn sword: origin at the right hand's grip, blade toward +Z.
  const blade = bladeGeometry(bladeLen, long ? 0.034 : 0.031, long ? 0.03 : 0.022);
  blade.translate(0, 0.012, 0.09);
  B.add(blade, M.steel, 'sword');
  B.add(new THREE.BoxGeometry(0.012, 0.036, 0.028), M.brass, 'sword', { matrix: new THREE.Matrix4().makeTranslation(0, -0.004, 0.075) });
  const tsuba = new THREE.CylinderGeometry(0.038, 0.038, 0.007, 24);
  tsuba.rotateX(Math.PI / 2);
  tsuba.scale(1, 1.15, 1);
  B.add(tsuba, M.iron, 'sword', { matrix: new THREE.Matrix4().makeTranslation(0, -0.002, 0.058) });
  const tsuka = new THREE.CylinderGeometry(0.0165, 0.0155, handle, 16, 8);
  tsuka.rotateX(Math.PI / 2);
  tsuka.translate(0, 0, 0.055 - handle / 2);
  B.add(tsuka, M.wrap, 'sword', { uvFn: (p) => [Math.atan2(p.y, p.x) / (Math.PI * 2), p.z] });
  const kashira = new THREE.CylinderGeometry(0.0175, 0.017, 0.018, 12);
  kashira.rotateX(Math.PI / 2);
  B.add(kashira, M.brass, 'sword', { matrix: new THREE.Matrix4().makeTranslation(0, 0, 0.055 - handle - 0.004) });
  ctx.dims.bladeLen = bladeLen;
  ctx.dims.handle = handle;

  // Scabbards through the obi on the left hip.
  const sheathed = (len, hiltLen, bend, curve) => {
    const g = new THREE.Group();
    const parts = [];
    const bar = new THREE.BoxGeometry(0.03, 0.021, len, 1, 1, 14);
    bar.translate(0, 0, -len / 2);
    const p = bar.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = -p.getZ(i) / len;
      p.setY(i, p.getY(i) + bend * t * t);
    }
    bar.computeVertexNormals();
    parts.push([bar, M.lacquer, null]);
    parts.push([new THREE.BoxGeometry(0.033, 0.024, 0.03), M.brass, new THREE.Matrix4().makeTranslation(0, bend, -len - 0.01)]);
    if (hiltLen > 0) {
      const ts = new THREE.CylinderGeometry(0.03, 0.03, 0.006, 18);
      ts.rotateX(Math.PI / 2);
      parts.push([ts, M.iron, new THREE.Matrix4().makeTranslation(0, 0, 0.004)]);
      const tk = new THREE.CylinderGeometry(0.0145, 0.0135, hiltLen, 12, 4);
      tk.rotateX(Math.PI / 2);
      tk.translate(0, 0, hiltLen / 2 + 0.008);
      parts.push([tk, M.wrap, null, true]);
    }
    return parts;
  };
  const saya = bind.saya;
  const place = (parts, pos, rot) => {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'YXZ')).setPosition(pos);
    for (const [geo, mm, local, wrapped] of parts) {
      const mx = local ? m.clone().multiply(local) : m;
      B.add(geo, mm, 'saya', { matrix: mx, uvFn: wrapped ? (p) => [Math.atan2(p.y, p.x) / (Math.PI * 2), p.z] : null });
    }
  };
  place(sheathed(long ? 0.98 : 0.74, 0, -0.035), saya.clone(), [SAYA_EULER.x, SAYA_EULER.y, SAYA_EULER.z]);
  if (!long) place(sheathed(0.5, 0.18, -0.022), saya.clone().add(new THREE.Vector3(-0.035, 0.012, 0.03)), [-0.38, -0.46, 0.3]);
}

// Box with rounded edges and analytic normals.
export function roundedBox(w, h, d, r, segs = 3) {
  const g = new THREE.BoxGeometry(w, h, d, segs * 2, segs * 2, segs * 2);
  const p = g.attributes.position;
  const n = g.attributes.normal;
  const ix = w / 2 - r;
  const iy = h / 2 - r;
  const iz = d / 2 - r;
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    c.set(clamp(v.x, -ix, ix), clamp(v.y, -iy, iy), clamp(v.z, -iz, iz));
    v.sub(c);
    if (v.lengthSq() < 1e-12) v.set(0, 1, 0);
    v.normalize();
    n.setXYZ(i, v.x, v.y, v.z);
    p.setXYZ(i, c.x + v.x * r, c.y + v.y * r, c.z + v.z * r);
  }
  return g;
}
