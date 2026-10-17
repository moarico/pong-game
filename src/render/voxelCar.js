// Voxel versions of the Octane, its wheels and the ball for the blocky world: the smooth
// car shape is sampled into blocks with glossy paint, tinted glass, chrome and lights.
import * as THREE from 'three';
import { B, QuadBuilder, VoxelGrid } from './world/blocks.js';
import { CAR, TEAM_COLORS, BALL, EXHAUST_X } from '../config.js';
import { insideBody, insideCab, cabHalfWidth, tyreHalf } from './carBody.js';

const BOX = { x0: -45, x1: 45, y0: -9, y1: 63, z0: -66, z1: 78 };

const rgb = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
const RED = rgb(0xc0141c);
const LAMP_RED = rgb(0xff0806);
const LAMP_WHITE = rgb(0xfff4e6);
// exhaust glow: a saturated team colour so it reads blue/orange instead of blooming white
const EXHAUST = [[40, 120, 255], [255, 120, 20]];

function solidAt(x, y, z, team, V) {
  const paint = rgb(TEAM_COLORS[team].main);
  // body shell
  if (insideBody(x, y, z)) {
    if (z < -44.4) return [B.CARBON];
    if (y < -0.5) return [B.CARBON];
    if (z > 63 && Math.abs(x) > 13 && Math.abs(x) < 29 && y > 3 && y < 11) return [B.HEADLIGHT, LAMP_WHITE];
    if (z > 43 && z < 56 && Math.abs(x) > 3 && Math.abs(x) < 12 && y > 10) return [B.CARBON];
    return [B.PAINT, paint];
  }
  // cab: windscreen, side windows, painted roof and pillars
  const t = insideCab(x, y, z);
  if (t >= 0) {
    if (t < 0.12) return [B.CARBON];
    const side = Math.abs(x) > cabHalfWidth(z, t) - V * 1.2;
    if (z > 10.5) return side && t > 0.15 ? [B.PAINT, paint] : [B.TINT_GLASS];
    if (z < -9) return side && t > 0.2 ? [B.PAINT, paint] : [B.TINT_GLASS];
    if (t > 0.8) return [B.PAINT, paint];
    if (side) return z > -3.5 && z < 0.5 ? [B.CARBON] : [B.TINT_GLASS];
    return [B.PAINT, paint];
  }
  const ax = Math.abs(x);
  // exposed engine with a red supercharger, chrome top and intake trumpets
  if (ax <= 19 && y >= 19 && y <= 32 && z >= -46.5 && z <= -26.5) return [B.CARBON];
  if (ax <= 11 && y > 32 && y <= 44.5 && z >= -42 && z <= -25) return [B.PAINT, RED];
  if (ax <= 9 && y > 44.5 && y <= 46.5 && z >= -40 && z <= -27) return [B.CHROME];
  if (y > 46.5 && y <= 54 && Math.hypot(ax - 5.2, z + 31) <= 3.2) return [B.CHROME];
  // rear frame: big square tail lights and twin boost exhausts (reference photo)
  if (z >= -50 && z < -44.4) {
    if (ax >= 20 && ax <= 32 && y >= 6.5 && y <= 14.5) return [B.TAILLIGHT, LAMP_RED];
    const ex = EXHAUST_X[1];
    const de = Math.hypot(ax - ex, y - 6.5);
    if (de <= 4.6) return de <= 3.1 ? [B.BOOSTLIGHT, EXHAUST[team]] : [B.CHROME];
    if (z > -47.5 && ((y > 15.5 && y < 19 && ax < 34) || (y > 0 && y < 4.5 && ax < 31) || (ax > 32 && ax < 35 && y > 2 && y < 18))) return [B.CARBON];
  }
  // big wing in body colour, raked up at the back, with endplates and struts
  const wingY = 51 + (-52 - z) * 0.43;
  if (z >= -63 && z <= -41) {
    if (ax <= 41 && Math.abs(y - wingY) <= 1.6) return [B.PAINT, paint];
    if (ax > 40 && ax <= 43.5 && y >= wingY - 6 && y <= wingY + 7) return [B.PAINT, paint];
  }
  const sz = -31 - (y - 21) * 0.55; // struts lean back
  if (ax >= 12.5 && ax <= 15.5 && y >= 21 && y <= 49 && Math.abs(z - sz) <= 2) return [B.CARBON];
  return null;
}

const cache = {};

// outer face of the body (uu) at height y and length z, for decals on the blocky sides
export function voxelSideX(V, y, z) {
  const nx = Math.ceil((BOX.x1 - BOX.x0) / V);
  const j = Math.floor((y - BOX.y0) / V), k = Math.floor((z - BOX.z0) / V);
  const yc = BOX.y0 + (j + 0.5) * V, zc = BOX.z0 + (k + 0.5) * V;
  for (let i = nx - 1; i >= 0; i--) {
    const x = BOX.x0 + (i + 0.5) * V;
    if (solidAt(x, yc, zc, 0, V)) return x + V / 2;
  }
  return 33;
}

// V: block size in uu (2 for close up, 3.5 for the distant LOD)
export function voxelCarGeometry(team, V = 2) {
  const key = `car${team}_${V}`;
  if (cache[key]) return cache[key];
  const nx = Math.ceil((BOX.x1 - BOX.x0) / V), ny = Math.ceil((BOX.y1 - BOX.y0) / V), nz = Math.ceil((BOX.z1 - BOX.z0) / V);
  const g = new VoxelGrid(nx, ny, nz);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = BOX.x0 + (i + 0.5) * V, y = BOX.y0 + (j + 0.5) * V, z = BOX.z0 + (k + 0.5) * V;
    const s = solidAt(x, y, z, team, V);
    if (s) g.set(i, j, k, s[0], s[1]);
  }
  const b = new QuadBuilder();
  g.mesh(b, V, [BOX.x0, BOX.y0, BOX.z0], { aoStrength: 0.36 });
  const geo = b.build();
  geo.userData.shared = true;
  cache[key] = geo;
  return geo;
}

// blocky wheel: chunky treaded tyre, dark six-spoke rim, chrome hub; outer face toward +x
export function voxelWheelGeometry(r, team, v = 1.5) {
  const key = `wheel${r}_${team}_${v}`;
  if (cache[key]) return cache[key];
  const half = tyreHalf(r);
  const n = Math.ceil((2 * r) / v), w = Math.ceil((2 * half) / v);
  const g = new VoxelGrid(w, n, n);
  const cal = rgb(team === 0 ? 0xffc21a : 0xd81e1e);
  for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < w; i++) {
    const y = -r + (j + 0.5) * v, z = -r + (k + 0.5) * v, x = -half + (i + 0.5) * v;
    const d = Math.hypot(y, z);
    if (d > r) continue;
    if (d > r * 0.62) {
      // tread blocks around the rim of the tyre
      const a = Math.atan2(z, y);
      const lug = d > r - v * 1.2 && Math.floor(((a / (Math.PI * 2)) + 1) * 24) % 2 === 0 && Math.abs(x) < half - v;
      g.set(i, j, k, lug ? B.DARK : B.RUBBER);
      continue;
    }
    const outer = x > half - v * 1.6;
    if (!outer) { if (d > r * 0.5 && i === Math.floor(w / 2)) g.set(i, j, k, B.PAINT, cal); continue; }
    const a = Math.atan2(z, y);
    const spoke = Math.abs(((a / (Math.PI / 3)) % 1 + 1) % 1 - 0.5) < 0.18;
    if (d < r * 0.2) g.set(i, j, k, B.CHROME);
    else if (spoke || d > r * 0.54) g.set(i, j, k, B.DARK);
  }
  const b = new QuadBuilder();
  g.mesh(b, v, [-half, -r, -r], { aoStrength: 0.3 });
  const geo = b.build();
  geo.userData.shared = true;
  cache[key] = geo;
  return geo;
}

// blocky ball: stone-grey blocks in mixed shades, dark seams and glowing blue cores
export function voxelBallGeometry(res = 16) {
  const key = 'ball' + res;
  if (cache[key]) return cache[key];
  const R = BALL.radius;
  const v = R / res;
  const n = res * 2;
  const g = new VoxelGrid(n, n, n);
  const cores = [[1, 0.2, 0.3], [-0.8, 0.5, -0.4], [0.1, -0.9, 0.6], [-0.2, 0.3, 0.95], [0.4, 0.9, -0.5], [-0.3, -0.6, -0.75]].map((c) => new THREE.Vector3(...c).normalize());
  const hash = (a, b, c) => { const h = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return h - Math.floor(h); };
  const dir = new THREE.Vector3();
  for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = -R + (i + 0.5) * v, y = -R + (j + 0.5) * v, z = -R + (k + 0.5) * v;
    const d = Math.hypot(x, y, z);
    if (d > R) continue;
    dir.set(x, y, z).normalize();
    let near = 0, best = -2, second = -2;
    for (const c of cores) {
      const dd = dir.dot(c);
      if (dd > best) { second = best; best = dd; } else if (dd > second) second = dd;
      near = Math.max(near, dd);
    }
    if (near > 0.972) { g.set(i, j, k, B.BOOSTLIGHT, [70, 160, 255]); continue; }
    const seam = best - second < 0.07;
    const ring = near > 0.935;
    if (seam || ring) { g.set(i, j, k, B.PAINT, ring ? [26, 36, 58] : [38, 40, 46]); continue; }
    // stone panels: each block a slightly different grey, in patches
    const patch = hash(Math.floor(x / (R * 0.3)), Math.floor(y / (R * 0.3)), Math.floor(z / (R * 0.3)));
    const sh = 120 + patch * 70 + (hash(i, j, k) - 0.5) * 34;
    g.set(i, j, k, B.PAINT, [sh * 0.97 | 0, sh * 0.98 | 0, sh | 0]);
  }
  const b = new QuadBuilder();
  g.mesh(b, v, [-R, -R, -R], { aoStrength: 0.25 });
  const geo = b.build();
  geo.userData.shared = true;
  cache[key] = geo;
  return geo;
}
