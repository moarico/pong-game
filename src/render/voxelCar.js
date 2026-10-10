// Voxel versions of the Octane, its wheels and the ball for the blocky world: the smooth
// car shape is sampled into blocks with glossy paint, tinted glass, chrome and lights.
import * as THREE from 'three';
import { B, QuadBuilder, VoxelGrid } from './world/blocks.js';
import { CAR, TEAM_COLORS, BALL } from '../config.js';
import { insideBody, insideCab, cabHalfWidth, tyreHalf } from './carBody.js';

const V = 3; // body voxel size (uu)
const BOX = { x0: -45, x1: 45, y0: -9, y1: 63, z0: -66, z1: 78 };

const rgb = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
const RED = rgb(0xc0141c);
const LAMP_RED = rgb(0xff0806);
const LAMP_WHITE = rgb(0xfff4e6);

function solidAt(x, y, z, team) {
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
  // rear frame with four round tail lamps and the centre exhaust
  if (z >= -50 && z < -44.4) {
    for (const lx of [29.1, 20.1]) if (Math.hypot(ax - lx, y - 10.8) <= 4) return [B.TAILLIGHT, LAMP_RED];
    if (Math.hypot(x, y - 6.5) <= 4.8) return Math.hypot(x, y - 6.5) <= 3.2 ? [B.BOOSTLIGHT, rgb(TEAM_COLORS[team].light)] : [B.CHROME];
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

export function voxelCarGeometry(team) {
  if (cache['car' + team]) return cache['car' + team];
  const nx = Math.ceil((BOX.x1 - BOX.x0) / V), ny = Math.ceil((BOX.y1 - BOX.y0) / V), nz = Math.ceil((BOX.z1 - BOX.z0) / V);
  const g = new VoxelGrid(nx, ny, nz);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = BOX.x0 + (i + 0.5) * V, y = BOX.y0 + (j + 0.5) * V, z = BOX.z0 + (k + 0.5) * V;
    const s = solidAt(x, y, z, team);
    if (s) g.set(i, j, k, s[0], s[1]);
  }
  const b = new QuadBuilder();
  g.mesh(b, V, [BOX.x0, BOX.y0, BOX.z0], { aoStrength: 0.36 });
  const geo = b.build();
  geo.userData.shared = true;
  cache['car' + team] = geo;
  return geo;
}

// blocky wheel: chunky tyre, dark six-spoke rim, chrome hub; outer face toward +x
export function voxelWheelGeometry(r, team) {
  const key = `wheel${r}_${team}`;
  if (cache[key]) return cache[key];
  const v = 2;
  const half = tyreHalf(r);
  const n = Math.ceil((2 * r) / v), w = Math.ceil((2 * half) / v);
  const g = new VoxelGrid(w, n, n);
  const cal = rgb(team === 0 ? 0xffc21a : 0xd81e1e);
  for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < w; i++) {
    const y = -r + (j + 0.5) * v, z = -r + (k + 0.5) * v, x = -half + (i + 0.5) * v;
    const d = Math.hypot(y, z);
    if (d > r) continue;
    if (d > r * 0.62) { g.set(i, j, k, B.RUBBER); continue; }
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

// blocky ball: dark panels with light seams and glowing blue cores
export function voxelBallGeometry() {
  if (cache.ball) return cache.ball;
  const R = BALL.radius;
  const v = R / 11;
  const n = 22;
  const g = new VoxelGrid(n, n, n);
  const cores = [[1, 0.2, 0.3], [-0.8, 0.5, -0.4], [0.1, -0.9, 0.6], [-0.2, 0.3, 0.95], [0.4, 0.9, -0.5]].map((c) => new THREE.Vector3(...c).normalize());
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
    if (near > 0.975) { g.set(i, j, k, B.BOOSTLIGHT, [90, 170, 255]); continue; }
    const seam = best - second < 0.06;
    const ring = near > 0.93;
    const shade = 150 + Math.round((Math.sin(x * 0.21) + Math.cos(z * 0.17)) * 12);
    if (seam || ring) g.set(i, j, k, B.PAINT, ring ? [30, 44, 70] : [52, 56, 66]);
    else g.set(i, j, k, B.PAINT, [shade * 0.8 | 0, shade * 0.82 | 0, shade * 0.86 | 0]);
  }
  const b = new QuadBuilder();
  g.mesh(b, v, [-R, -R, -R], { aoStrength: 0.25 });
  const geo = b.build();
  geo.userData.shared = true;
  cache.ball = geo;
  return geo;
}
