// Primitive-merging helpers ported from Zero Hour. Models are lists of small parts (boxes,
// ellipsoids, cylinders, capsules) merged into one geometry with per-vertex color and a
// per-vertex [metalness, roughness] pair, so a single material draws a whole gun or soldier.
import * as THREE from 'three';

export const TAU = Math.PI * 2;
const SC1 = new THREE.Vector3(1, 1, 1), _SC = new THREE.Vector3();
export const _Y = new THREE.Vector3(0, 1, 0);

// What each paint is made of: [metalness, roughness]. Blued and parkerized steel is glossy,
// polymer and gloves are matte, brass and blades shine. Anything unlisted is painted or cloth.
export const MRTAB = {
  0x2b2d30: [0.85, 0.34], 0x2c2e30: [0.85, 0.34], 0x33363a: [0.8, 0.36], 0x19191b: [0.5, 0.42], 0x1d1e20: [0.5, 0.42], 0x7a7e84: [1, 0.24], 0x6a6c70: [1, 0.3],
  0xb89a4a: [1, 0.22], 0xc4c8cc: [1, 0.12], 0x8a8e92: [1, 0.2], 0x9aa0a6: [1, 0.18], 0x0c0c0c: [0.4, 0.45], 0x121212: [0.4, 0.45], 0x101010: [0.6, 0.35], 0x1c1c1e: [0.7, 0.34],
  0x222222: [0.5, 0.4], 0x1a1a1a: [0.4, 0.45], 0x14161a: [0.3, 0.12], 0x2a4a6a: [0.2, 0.04], 0x1e2a30: [0.1, 0.06], 0x3a3834: [0, 0.62], 0x45423c: [0, 0.62], 0x8e7c5c: [0, 0.7],
  0x4a4d3a: [0, 0.72], 0x6a4428: [0, 0.5], 0x2b2d2b: [0, 0.86], 0x1c1d1c: [0, 0.9], 0x3a3c3a: [0, 0.9], 0x4a5a3a: [0.35, 0.5], 0x5a6a4a: [0.35, 0.5], 0x4a4a3a: [0.05, 0.7],
  0x3a3a2e: [0.05, 0.7], 0x7a8288: [0.55, 0.42], 0x6e767c: [0.55, 0.42],
};
const MR0 = [0.02, 0.62];

// Materials that read partGeo's per-vertex [metalness, roughness].
export function mrPatch(sh) {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nattribute vec2 aMR;\nvarying vec2 vMR;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMR = aMR;');
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec2 vMR;')
    .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vMR.x;')
    .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vMR.y > 0.0 ? vMR.y : roughness;');
}

export function mrMaterial(opts = {}) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.2, ...opts });
  m.onBeforeCompile = mrPatch;
  m.customProgramCacheKey = () => 'zh-mr';
  return m;
}

// A box with its edges and corners cut at 45 degrees. The thin chamfers catch the light, so hard parts read
// as machined and molded pieces instead of raw blocks.
const CHAMFER = new Map();
function chamferBox(w, h, d) {
  const c = Math.min(Math.min(w, h, d) * 0.2, 0.03);
  const key = w.toFixed(4) + ',' + h.toFixed(4) + ',' + d.toFixed(4);
  if (CHAMFER.has(key)) return CHAMFER.get(key).clone();
  const H = [w / 2, h / 2, d / 2];
  // corner point (signs s) on the face perpendicular to axis a
  const Q = (s, a) => [0, 1, 2].map((k) => s[k] * (k === a ? H[k] : H[k] - c));
  const P = [], N = [];
  const poly = (pts) => {
    const cx = pts.reduce((t, p) => t + p[0], 0), cy = pts.reduce((t, p) => t + p[1], 0), cz = pts.reduce((t, p) => t + p[2], 0);
    for (let i = 1; i < pts.length - 1; i++) {
      let A = pts[0], B = pts[i], C = pts[i + 1];
      const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (nx * cx + ny * cy + nz * cz < 0) {
        [B, C] = [C, B];
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }
      const l = Math.hypot(nx, ny, nz) || 1;
      for (const p of [A, B, C]) {
        P.push(p[0], p[1], p[2]);
        N.push(nx / l, ny / l, nz / l);
      }
    }
  };
  const S = [-1, 1];
  for (let a = 0; a < 3; a++) {
    const b = (a + 1) % 3, k = (a + 2) % 3;
    for (const sa of S) {
      // face
      const f = [];
      for (const [sb, sk] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const s = [0, 0, 0];
        s[a] = sa;
        s[b] = sb;
        s[k] = sk;
        f.push(Q(s, a));
      }
      poly(f);
      // chamfer strip between this face and the next axis' faces
      for (const sb of S) {
        const e = [];
        for (const sk of [-1, 1]) {
          const s = [0, 0, 0];
          s[a] = sa;
          s[b] = sb;
          s[k] = sk;
          e.push(Q(s, a), Q(s, b));
        }
        poly([e[0], e[1], e[3], e[2]]);
      }
    }
  }
  for (const sx of S) for (const sy of S) for (const sz of S) poly([Q([sx, sy, sz], 0), Q([sx, sy, sz], 1), Q([sx, sy, sz], 2)]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  CHAMFER.set(key, g);
  return g.clone();
}

function forEachPart(items, fn) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pv = new THREE.Vector3(), nm = new THREE.Matrix3();
  for (const it of items) {
    let g = it.g ? it.g.clone() : it.sharp ? new THREE.BoxGeometry(it.b[0], it.b[1], it.b[2]) : chamferBox(it.b[0], it.b[1], it.b[2]);
    if (g.index) {
      const ng = g.toNonIndexed();
      g.dispose();
      g = ng;
    }
    if (it.q) q.copy(it.q);
    else {
      const r = it.r || [0, 0, 0];
      e.set(r[0], r[1], r[2]);
      q.setFromEuler(e);
    }
    pv.set(it.p[0], it.p[1], it.p[2]);
    m.compose(pv, q, it.s ? _SC.set(it.s[0], it.s[1], it.s[2]) : SC1);
    nm.getNormalMatrix(m);
    fn(it, g, m, nm);
    g.dispose();
  }
}

// Hard parts: color + [metalness, roughness] per vertex, with a little baked top-light.
export function partGeo(items) {
  const P = [], N = [], C = [], MR = [], v = new THREE.Vector3(), col = new THREE.Color();
  forEachPart(items, (it, g, m, nm) => {
    const pa = g.attributes.position, na = g.attributes.normal;
    col.setHex(it.c);
    const mr = MRTAB[it.c] || MR0;
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m);
      P.push(v.x, v.y, v.z);
      v.fromBufferAttribute(na, i).applyMatrix3(nm).normalize();
      N.push(v.x, v.y, v.z);
      const sh = v.y > 0.6 ? 1.04 : v.y < -0.6 ? 0.62 : 0.9;
      C.push(col.r * sh, col.g * sh, col.b * sh);
      MR.push(mr[0], mr[1]);
    }
  });
  const G = new THREE.BufferGeometry();
  G.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  G.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  G.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  G.setAttribute('aMR', new THREE.Float32BufferAttribute(MR, 2));
  G.computeBoundingSphere();
  return G;
}

// Fabric and skin: color + box-projected UVs in part space so a camo print stays glued to the limb.
export function partGeo2(items) {
  if (!items.length) return null;
  const P = [], N = [], C = [], U = [], v = new THREE.Vector3(), w = new THREE.Vector3(), col = new THREE.Color();
  forEachPart(items, (it, g, m, nm) => {
    const pa = g.attributes.position, na = g.attributes.normal;
    col.setHex(it.c);
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m);
      w.fromBufferAttribute(na, i).applyMatrix3(nm).normalize();
      P.push(v.x, v.y, v.z);
      N.push(w.x, w.y, w.z);
      // soft fake occlusion: undersides darker, tops a touch lighter
      const sh = 0.8 + 0.2 * (w.y * 0.5 + 0.5) + (w.y > 0.7 ? 0.04 : 0);
      C.push(col.r * sh, col.g * sh, col.b * sh);
      const ax = Math.abs(w.x), ay = Math.abs(w.y), az = Math.abs(w.z);
      let u, t;
      if (ax >= ay && ax >= az) {
        u = v.z;
        t = v.y;
      } else if (ay >= az) {
        u = v.x;
        t = v.z;
      } else {
        u = v.x;
        t = v.y;
      }
      U.push(u * 6.2, t * 6.2);
    }
  });
  const G = new THREE.BufferGeometry();
  G.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  G.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  G.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  G.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  G.computeBoundingSphere();
  return G;
}

export const SPH = new THREE.SphereGeometry(1, 14, 10);
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 14);
export const CYL8 = new THREE.CylinderGeometry(1, 1, 1, 8);
export const DOME = new THREE.SphereGeometry(1, 18, 10, 0, TAU, 0, Math.PI * 0.56);

export const Bx = (sx, sy, sz, x, y, z, c, rx, ry, rz) => ({ b: [sx, sy, sz], p: [x, y, z], c, r: [rx || 0, ry || 0, rz || 0] });
export const Sp = (rx, ry, rz, x, y, z, c, rot) => ({ g: SPH, s: [rx, ry, rz], p: [x, y, z], r: rot || [0, 0, 0], c, b: [rx * 2, ry * 2, rz * 2] });
export const Dm = (rx, ry, rz, x, y, z, c, rot) => ({ g: DOME, s: [rx, ry, rz], p: [x, y, z], r: rot || [0, 0, 0], c });

export function Cyl(r, h, x, y, z, c, axis, r2) {
  const rot = axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  const b = axis === 'x' ? [h, r * 2, r * 2] : axis === 'z' ? [r * 2, r * 2, h] : [r * 2, h, r * 2];
  const g = r2 == null || r2 === r ? CYL : new THREE.CylinderGeometry(r2 / r, 1, 1, 12);
  return { g, s: [r, h, r], p: [x, y, z], r: rot, c, b };
}

// Capsule between two points.
export function Cap(r, a, b, c) {
  const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A), L = d.length();
  d.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(_Y, d), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return [
    { g: CYL, s: [r, L, r], p: mid, q, c, b: [r * 2, L, r * 2] },
    { g: SPH, s: [r, r, r], p: a, c, b: [r * 2, r * 2, r * 2] },
    { g: SPH, s: [r, r, r], p: b, c, b: [r * 2, r * 2, r * 2] },
  ];
}

// Tapered limb between two points, with a rounded end.
export function TL(a, b, rA, rB, c) {
  const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), d = B.clone().sub(A), L = d.length();
  d.normalize();
  return [
    { g: new THREE.CylinderGeometry(rB, rA, L, 14, 1, true), p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], q: new THREE.Quaternion().setFromUnitVectors(_Y, d), c },
    { g: SPH, s: [rB, rB, rB], p: b, c },
  ];
}

export function torus(r, tube, x, y, z, c, rot) {
  return { g: new THREE.TorusGeometry(r, tube, 8, 20), p: [x, y, z], r: rot || [0, 0, 0], c, b: [r * 2 + tube * 2, r * 2 + tube * 2, tube * 2] };
}

export function mulC(c, m) {
  const cl = (v) => Math.max(0, Math.min(255, v | 0));
  return (cl(((c >> 16) & 255) * m) << 16) | (cl(((c >> 8) & 255) * m) << 8) | cl((c & 255) * m);
}

export function hexOf(css) {
  return new THREE.Color(css).getHex();
}

export function cnv(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export const damp = (a, b, rate, dt) => b + (a - b) * Math.exp(-rate * dt);
export const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const rand = (a, b) => a + (b - a) * Math.random();
