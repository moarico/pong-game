import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Builds one skinned geometry for a whole figure from many parts. Every vertex
// carries its own material (albedo, roughness, metalness, translucency, bump,
// pattern, rim) and up to four bone weights.
// ---------------------------------------------------------------------------

const _p = new THREE.Vector3();
const _n = new THREE.Vector3();
const _nm = new THREE.Matrix3();

export const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// Surface description: hex colour (sRGB) plus shading parameters.
export function mat(hex, o = {}) {
  const c = new THREE.Color(hex);
  return {
    color: [c.r, c.g, c.b],
    rough: o.rough ?? 0.85,
    metal: o.metal ?? 0,
    trans: o.trans ?? 0,
    bump: o.bump ?? 0,
    pat: o.pat ?? 0,
    rim: o.rim ?? 1,
  };
}

export class MeshBuilder {
  constructor(boneIndex) {
    this.boneIndex = boneIndex;
    this.pos = [];
    this.nor = [];
    this.uv = [];
    this.col = [];
    this.mat = [];
    this.pat = [];
    this.si = [];
    this.sw = [];
    this.idx = [];
  }

  get count() {
    return this.pos.length / 3;
  }

  // weights: a bone name, or [[name, w], ...], or a function (p) => [[name, w], ...].
  pushVertex(p, n, u, v, m, weights, tint) {
    this.pos.push(p.x, p.y, p.z);
    this.nor.push(n.x, n.y, n.z);
    this.uv.push(u, v);
    const t = tint ? tint(p, n) : 1;
    if (Array.isArray(t)) this.col.push(m.color[0] * t[0], m.color[1] * t[1], m.color[2] * t[2]);
    else this.col.push(m.color[0] * t, m.color[1] * t, m.color[2] * t);
    this.mat.push(m.rough, m.metal, m.trans, m.bump);
    this.pat.push(m.pat, m.rim);
    let w = typeof weights === 'function' ? weights(p) : weights;
    if (typeof w === 'string') w = [[w, 1]];
    const list = w
      .filter(([, x]) => x > 1e-4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    let sum = 0;
    for (const [, x] of list) sum += x;
    for (let k = 0; k < 4; k++) {
      const e = list[k];
      if (e) {
        const bi = this.boneIndex[e[0]];
        if (bi === undefined) throw new Error(`unknown bone ${e[0]}`);
        this.si.push(bi);
        this.sw.push(e[1] / sum);
      } else {
        this.si.push(0);
        this.sw.push(0);
      }
    }
  }

  // Adds a three.js geometry, transformed by `matrix` (bind space), with one
  // material. uvFn(p, uv) may remap texture coordinates (for patterns).
  add(geo, m, weights, { matrix = null, uvFn = null, tint = null } = {}) {
    const g = geo.index ? geo : geo;
    const P = g.attributes.position;
    let N = g.attributes.normal;
    if (!N) {
      g.computeVertexNormals();
      N = g.attributes.normal;
    }
    const U = g.attributes.uv;
    const base = this.count;
    let flip = false;
    if (matrix) {
      _nm.getNormalMatrix(matrix);
      flip = matrix.determinant() < 0;
    }
    for (let i = 0; i < P.count; i++) {
      _p.fromBufferAttribute(P, i);
      _n.fromBufferAttribute(N, i);
      const u0 = U ? U.getX(i) : 0;
      const v0 = U ? U.getY(i) : 0;
      let uu = u0;
      let vv = v0;
      if (uvFn) [uu, vv] = uvFn(_p, u0, v0);
      if (matrix) {
        _p.applyMatrix4(matrix);
        _n.applyMatrix3(_nm).normalize();
      }
      this.pushVertex(_p, _n, uu, vv, m, weights, tint);
    }
    if (g.index) {
      const I = g.index.array;
      for (let i = 0; i < I.length; i += 3) {
        if (flip) this.idx.push(base + I[i], base + I[i + 2], base + I[i + 1]);
        else this.idx.push(base + I[i], base + I[i + 1], base + I[i + 2]);
      }
    } else {
      for (let i = 0; i < P.count; i += 3) {
        if (flip) this.idx.push(base + i, base + i + 2, base + i + 1);
        else this.idx.push(base + i, base + i + 1, base + i + 2);
      }
    }
  }

  // A surface from a grid of points rings[j][i] (rows along the length, i around).
  // Closed loops wrap around; normals come from the grid itself so no seam shows.
  // uv: u = metres around, v = metres along (for fabric detail).
  grid(rings, m, weights, { closed = true, outward = null, tint = null, uvFn = null } = {}) {
    const rows = rings.length;
    const cols = rings[0].length;
    const base = this.count;
    const along = new Float32Array(rows);
    for (let j = 1; j < rows; j++) {
      let d = 0;
      for (let i = 0; i < cols; i++) d += rings[j][i].distanceTo(rings[j - 1][i]);
      along[j] = along[j - 1] + d / cols;
    }
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const n = new THREE.Vector3();
    const cols1 = closed ? cols + 1 : cols;
    for (let j = 0; j < rows; j++) {
      let arc = 0;
      for (let ii = 0; ii < cols1; ii++) {
        const i = ii % cols;
        if (ii > 0) arc += rings[j][i].distanceTo(rings[j][(ii - 1) % cols]);
        const ip = closed ? (i + 1) % cols : Math.min(i + 1, cols - 1);
        const im = closed ? (i - 1 + cols) % cols : Math.max(i - 1, 0);
        a.subVectors(rings[j][ip], rings[j][im]);
        b.subVectors(rings[Math.min(j + 1, rows - 1)][i], rings[Math.max(j - 1, 0)][i]);
        n.crossVectors(a, b);
        if (n.lengthSq() < 1e-14) n.set(0, 1, 0);
        n.normalize();
        if (outward) {
          const o = outward(rings[j][i], j, i);
          if (o && n.dot(o) < 0) n.negate();
        }
        let u = arc;
        let v = along[j];
        if (uvFn) [u, v] = uvFn(ii / cols, j / (rows - 1), arc, along[j]);
        this.pushVertex(rings[j][i], n, u, v, m, weights, tint);
      }
    }
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols1 - 1; i++) {
        const p0 = base + j * cols1 + i;
        const p1 = p0 + 1;
        const p2 = p0 + cols1;
        const p3 = p2 + 1;
        this.pushQuad(p0, p1, p2, p3);
      }
    }
  }

  // Quad p0-p1 (one row) and p2-p3 (next row); winding chosen to agree with the normals.
  pushQuad(p0, p1, p2, p3) {
    const P = this.pos;
    const N = this.nor;
    const ax = P[p1 * 3] - P[p0 * 3];
    const ay = P[p1 * 3 + 1] - P[p0 * 3 + 1];
    const az = P[p1 * 3 + 2] - P[p0 * 3 + 2];
    const bx = P[p2 * 3] - P[p0 * 3];
    const by = P[p2 * 3 + 1] - P[p0 * 3 + 1];
    const bz = P[p2 * 3 + 2] - P[p0 * 3 + 2];
    const fx = ay * bz - az * by;
    const fy = az * bx - ax * bz;
    const fz = ax * by - ay * bx;
    const nx = N[p0 * 3] + N[p3 * 3];
    const ny = N[p0 * 3 + 1] + N[p3 * 3 + 1];
    const nz = N[p0 * 3 + 2] + N[p3 * 3 + 2];
    if (fx * nx + fy * ny + fz * nz >= 0) this.idx.push(p0, p1, p2, p1, p3, p2);
    else this.idx.push(p0, p2, p1, p1, p2, p3);
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aMat', new THREE.Float32BufferAttribute(this.mat, 4));
    g.setAttribute('aPat', new THREE.Float32BufferAttribute(this.pat, 2));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(this.si, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(this.sw, 4));
    g.setIndex(this.count > 65535 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
    g.computeBoundingSphere();
    return g;
  }
}

// Catmull-Rom through a table of rows [key, v1, v2, ...] sampled at `key`.
export function profile(table) {
  return (x) => {
    const n = table.length;
    if (x <= table[0][0]) return table[0].slice(1);
    if (x >= table[n - 1][0]) return table[n - 1].slice(1);
    let k = 0;
    while (k < n - 2 && x > table[k + 1][0]) k++;
    const p0 = table[Math.max(k - 1, 0)];
    const p1 = table[k];
    const p2 = table[k + 1];
    const p3 = table[Math.min(k + 2, n - 1)];
    const t = (x - p1[0]) / (p2[0] - p1[0]);
    const t2 = t * t;
    const t3 = t2 * t;
    const out = [];
    for (let c = 1; c < p1.length; c++) {
      // Tangents scaled by key spacing so uneven tables stay smooth.
      const m1 = ((p2[c] - p0[c]) / (p2[0] - p0[0] || 1)) * (p2[0] - p1[0]);
      const m2 = ((p3[c] - p1[c]) / (p3[0] - p1[0] || 1)) * (p2[0] - p1[0]);
      out.push((2 * t3 - 3 * t2 + 1) * p1[c] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[c] + (t3 - t2) * m2);
    }
    return out;
  };
}

// Superellipse cross-section point; theta 0 = +X (left side), pi/2 = +Z (front).
export function superPoint(theta, a, bF, bB, n, cz, out) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const e = 2 / n;
  const x = a * Math.sign(c) * Math.pow(Math.abs(c), e);
  const b = s >= 0 ? bF : bB;
  const z = cz + b * Math.sign(s) * Math.pow(Math.abs(s), e);
  return out.set(x, 0, z);
}

// A tube with an elliptical cross-section swept along a polyline, its section
// turned so that `up(t)` (e.g. a surface normal) is the thickness direction.
export function ribbonRings(points, ups, w, h, segs = 10, widthFn = null) {
  const rings = [];
  const T = new THREE.Vector3();
  const B = new THREE.Vector3();
  const U = new THREE.Vector3();
  for (let k = 0; k < points.length; k++) {
    const a = points[Math.max(k - 1, 0)];
    const b = points[Math.min(k + 1, points.length - 1)];
    T.subVectors(b, a).normalize();
    U.copy(ups[k]).addScaledVector(T, -ups[k].dot(T)).normalize();
    B.crossVectors(T, U).normalize();
    const f = widthFn ? widthFn(k / (points.length - 1)) : 1;
    const ring = [];
    for (let i = 0; i < segs; i++) {
      const ang = (i / segs) * Math.PI * 2;
      ring.push(points[k].clone().addScaledVector(B, Math.cos(ang) * w * 0.5 * f).addScaledVector(U, Math.sin(ang) * h * 0.5));
    }
    rings.push(ring);
  }
  return rings;
}

// Rings of a round tube along a polyline (for cords, hair, straps, limbs).
export function tubeRings(points, radius, segs = 12, flat = 1) {
  const rings = [];
  const T = new THREE.Vector3();
  const N = new THREE.Vector3(1, 0, 0);
  const B = new THREE.Vector3();
  for (let k = 0; k < points.length; k++) {
    const a = points[Math.max(k - 1, 0)];
    const b = points[Math.min(k + 1, points.length - 1)];
    T.subVectors(b, a).normalize();
    // Parallel transport keeps the section from twisting along the path.
    N.addScaledVector(T, -N.dot(T));
    if (N.lengthSq() < 1e-6) N.set(0, 0, 1).addScaledVector(T, -T.z);
    N.normalize();
    B.crossVectors(T, N).normalize();
    const r = typeof radius === 'function' ? radius(k / (points.length - 1)) : radius;
    const ring = [];
    for (let i = 0; i < segs; i++) {
      const ang = (i / segs) * Math.PI * 2;
      ring.push(points[k].clone().addScaledVector(N, Math.cos(ang) * r).addScaledVector(B, Math.sin(ang) * r * flat));
    }
    rings.push(ring);
  }
  return rings;
}

// Closes a tube end with a fan to its centre (e.g. the tip of a cord).
export function capRings(rings, atEnd, bulge = 0) {
  const ring = atEnd ? rings[rings.length - 1] : rings[0];
  const c = new THREE.Vector3();
  for (const p of ring) c.add(p);
  c.divideScalar(ring.length);
  const prev = atEnd ? rings[rings.length - 2] : rings[1];
  const pc = new THREE.Vector3();
  for (const p of prev) pc.add(p);
  pc.divideScalar(prev.length);
  const dir = c.clone().sub(pc).normalize();
  const tip = c.clone().addScaledVector(dir, bulge);
  const inner = ring.map((p) => p.clone().lerp(tip, 0.6).addScaledVector(dir, bulge * 0.3));
  // A tiny ring rather than a single point keeps the normals well defined.
  const point = ring.map((p) => p.clone().lerp(tip, 0.97));
  if (atEnd) rings.push(inner, point);
  else rings.unshift(point, inner);
  return rings;
}
