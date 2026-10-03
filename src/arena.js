// Arena collision is a signed distance field: arenaDist() returns how far a point
// is from the nearest solid surface (positive inside the playable space).
// The field is a rounded octagon with curved floor/ceiling ramps, unioned with
// the two goal boxes. The same shape description drives the stadium meshes.
import { ARENA } from './config.js';

const HX = ARENA.halfX;
const HZ = ARENA.halfZ;
const H = ARENA.height;
const K = ARENA.chamfer;
const RHO = ARENA.cornerR;
const RR = ARENA.rampR;
const GW = ARENA.goalHalfW;
const GH = ARENA.goalH;
const GD = ARENA.goalDepth;

// Octagon shrunk by RHO; the real wall is this polygon offset outward by RHO.
const SX = HX - RHO;
const SZ = HZ - RHO;
const CH = HX + HZ - K - RHO * Math.SQRT2; // chamfer line: |x| + |z| = CH
const V1X = SX, V1Z = CH - SX;
const V2X = CH - SZ, V2Z = SZ;

function segDist2(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  let t = ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = px - ax - dx * t, ez = pz - az - dz * t;
  return ex * ex + ez * ez;
}

// Signed 2D distance to the side walls (negative inside the arena footprint).
export function wallDist2D(x, z) {
  const px = x < 0 ? -x : x;
  const pz = z < 0 ? -z : z;
  const d2 = Math.min(
    segDist2(px, pz, SX, 0, V1X, V1Z),
    segDist2(px, pz, V1X, V1Z, V2X, V2Z),
    segDist2(px, pz, V2X, V2Z, 0, SZ),
  );
  const inside = px < SX && pz < SZ && px + pz < CH;
  const d = Math.sqrt(d2);
  return (inside ? -d : d) - RHO;
}

function fieldDist(x, y, z) {
  const u = wallDist2D(x, z);
  const v = Math.abs(y - H / 2) - H / 2;
  const qx = u + RR, qy = v + RR;
  const ox = qx > 0 ? qx : 0, oy = qy > 0 ? qy : 0;
  return -(Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - RR);
}

function goalDist(x, y, z) {
  return Math.min(GW - Math.abs(x), y, GH - y, HZ + GD - Math.abs(z));
}

export function arenaDist(x, y, z) {
  const a = fieldDist(x, y, z);
  const b = goalDist(x, y, z);
  return a > b ? a : b;
}

// Surface normal (pointing into the playable space) at p, written to out.
export function arenaNormal(x, y, z, out) {
  const e = 1.0;
  const nx = arenaDist(x + e, y, z) - arenaDist(x - e, y, z);
  const ny = arenaDist(x, y + e, z) - arenaDist(x, y - e, z);
  const nz = arenaDist(x, y, z + e) - arenaDist(x, y, z - e);
  const l = Math.hypot(nx, ny, nz) || 1;
  out.x = nx / l; out.y = ny / l; out.z = nz / l;
  return out;
}

// Sphere-traced ray cast against the arena. Returns hit distance or -1.
export function arenaRay(ox, oy, oz, dx, dy, dz, maxT) {
  let t = 0;
  for (let i = 0; i < 32; i++) {
    const d = arenaDist(ox + dx * t, oy + dy * t, oz + dz * t);
    if (d < 0.5) return t;
    t += d;
    if (t > maxT) return -1;
  }
  return t <= maxT ? t : -1;
}

// ---------------------------------------------------------------------------
// Geometry helpers for building meshes that match the collision shape.

// Walk the wall outline (u = 0) counter-clockwise. Returns samples with the
// point, the inward normal, the arc length and which wall it belongs to.
// Splits at x = ±goalHalfW on the back walls so goal openings cut cleanly.
export function wallOutline(step = 220, arcSegs = 5) {
  const P = [
    [SX, -V1Z], [SX, V1Z], [V2X, SZ], [-V2X, SZ],
    [-SX, V1Z], [-SX, -V1Z], [-V2X, -SZ], [V2X, -SZ],
  ];
  const pts = [];
  const push = (x, z, nx, nz, wall) => {
    const prev = pts[pts.length - 1];
    if (prev && Math.abs(prev.x - x) < 1e-6 && Math.abs(prev.z - z) < 1e-6) return;
    pts.push({ x, z, nx: -nx, nz: -nz, wall });
  };
  for (let i = 0; i < 8; i++) {
    const a = P[i], b = P[(i + 1) % 8], c = P[(i + 2) % 8];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    const n = [dz / len, -dx / len]; // outward
    const wall = i === 2 ? 'orange' : i === 6 ? 'blue' : i % 2 === 0 ? 'side' : 'corner';
    // split points along the edge
    const ts = [];
    const segs = Math.max(1, Math.ceil(len / step));
    for (let k = 0; k <= segs; k++) ts.push(k / segs);
    if (wall === 'orange' || wall === 'blue') {
      for (const gx of [GW, -GW]) {
        const t = (gx - a[0]) / dx;
        if (t > 0 && t < 1) ts.push(t);
      }
      ts.sort((p, q) => p - q);
    }
    for (const t of ts) {
      push(a[0] + dx * t + n[0] * RHO, a[1] + dz * t + n[1] * RHO, n[0], n[1], wall);
    }
    // corner arc around b
    const dx2 = c[0] - b[0], dz2 = c[1] - b[1];
    const len2 = Math.hypot(dx2, dz2);
    const n2 = [dz2 / len2, -dx2 / len2];
    const a0 = Math.atan2(n[1], n[0]);
    let a1 = Math.atan2(n2[1], n2[0]);
    while (a1 < a0) a1 += Math.PI * 2;
    for (let k = 1; k < arcSegs; k++) {
      const ang = a0 + (a1 - a0) * (k / arcSegs);
      push(b[0] + Math.cos(ang) * RHO, b[1] + Math.sin(ang) * RHO, Math.cos(ang), Math.sin(ang), 'arc');
    }
  }
  // arc length
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    pts[i].s = s;
  }
  pts.total = s + Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].z - pts[pts.length - 1].z);
  return pts;
}

export const ARENA_SHAPE = { HX, HZ, H, RR, GW, GH, GD, RHO };
