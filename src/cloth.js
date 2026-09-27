import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Cloth: a travelling cape, simulated with Verlet integration at 120 Hz. The
// collar row is pinned to the shoulders; the rest hangs, collides with the
// body and streams in the wind.
// ---------------------------------------------------------------------------

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const lerp = (a, b, t) => a + (b - a) * t;

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _a = new THREE.Vector3();

export class Cloth {
  // rest(c, r) gives each particle's rest position in the anchor frame (the chest).
  constructor(material, cols, rows, rest, surface, size = [1, 1]) {
    this.cols = cols;
    this.rows = rows;
    const n = cols * rows;
    this.n = n;
    this.rest = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) this.rest.push(rest(c, r));
    this.p = new Float32Array(n * 3);
    this.q = new Float32Array(n * 3);
    this.anchorPrev = new Float32Array(cols * 3);
    this.anchorNext = new Float32Array(cols * 3);
    this.cons = [];
    const id = (c, r) => r * cols + c;
    const link = (i, j, k) => this.cons.push([i, j, this.rest[i].distanceTo(this.rest[j]), k]);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c + 1 < cols) link(id(c, r), id(c + 1, r), 1);
        if (r + 1 < rows) link(id(c, r), id(c, r + 1), 1);
        if (c + 1 < cols && r + 1 < rows) {
          link(id(c, r), id(c + 1, r + 1), 0.7);
          link(id(c + 1, r), id(c, r + 1), 0.7);
        }
        if (c + 2 < cols) link(id(c, r), id(c + 2, r), 0.25);
        if (r + 2 < rows) link(id(c, r), id(c, r + 2), 0.25);
      }
    }
    const g = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
    const uv = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) uv.push((c / (cols - 1)) * size[0], (1 - r / (rows - 1)) * size[1]);
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const col = [];
    const mt = [];
    const pt = [];
    for (let i = 0; i < n; i++) {
      col.push(...surface.color);
      mt.push(surface.rough, surface.metal, surface.trans, surface.bump);
      pt.push(surface.pat, surface.rim);
    }
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('aMat', new THREE.Float32BufferAttribute(mt, 4));
    g.setAttribute('aPat', new THREE.Float32BufferAttribute(pt, 2));
    const idx = [];
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = id(c, r);
        const b = id(c + 1, r);
        const d = id(c, r + 1);
        const e = id(c + 1, r + 1);
        idx.push(a, d, b, b, d, e);
      }
    }
    g.setIndex(idx);
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = false;
    this.mesh.layers.enable(1);
    this.acc = 0;
    this.time = 0;
    this.ready = false;
  }

  reset(matrix) {
    for (let i = 0; i < this.n; i++) {
      _v.copy(this.rest[i]).applyMatrix4(matrix);
      this.p[i * 3] = this.q[i * 3] = _v.x;
      this.p[i * 3 + 1] = this.q[i * 3 + 1] = _v.y;
      this.p[i * 3 + 2] = this.q[i * 3 + 2] = _v.z;
    }
    for (let c = 0; c < this.cols; c++) {
      for (let k = 0; k < 3; k++) this.anchorPrev[c * 3 + k] = this.p[c * 3 + k];
    }
    this.ready = true;
  }

  // matrix: this frame's anchor frame. colliders: { spheres: [[Vector3, r]], capsules: [[a, b, r]] }.
  update(dt, matrix, wind, colliders, back) {
    if (!this.ready) this.reset(matrix);
    for (let c = 0; c < this.cols; c++) {
      _v.copy(this.rest[c]).applyMatrix4(matrix);
      this.anchorNext[c * 3] = _v.x;
      this.anchorNext[c * 3 + 1] = _v.y;
      this.anchorNext[c * 3 + 2] = _v.z;
    }
    const h = 1 / 120;
    this.acc = Math.min(this.acc + dt, 0.1);
    const steps = Math.floor(this.acc / h);
    const P = this.p;
    const Q = this.q;
    for (let s = 0; s < steps; s++) {
      this.acc -= h;
      this.time += h;
      const f = (s + 1) / steps;
      // Pinned collar follows the shoulders, interpolated across sub-steps.
      let mx = 0;
      let my = 0;
      let mz = 0;
      for (let c = 0; c < this.cols; c++) {
        mx -= P[c * 3];
        my -= P[c * 3 + 1];
        mz -= P[c * 3 + 2];
        for (let k = 0; k < 3; k++) {
          const v = lerp(this.anchorPrev[c * 3 + k], this.anchorNext[c * 3 + k], f);
          P[c * 3 + k] = v;
          Q[c * 3 + k] = v;
        }
        mx += P[c * 3];
        my += P[c * 3 + 1];
        mz += P[c * 3 + 2];
      }
      // Inertia scale: most of the body's own motion carries the cloth along rigidly,
      // so only wind and the remainder swing it (a leap no longer flings it skyward).
      const inertia = 0.7 / this.cols;
      for (let i = this.cols; i < this.n; i++) {
        const o = i * 3;
        P[o] += mx * inertia;
        P[o + 1] += my * inertia;
        P[o + 2] += mz * inertia;
        Q[o] += mx * inertia;
        Q[o + 1] += my * inertia;
        Q[o + 2] += mz * inertia;
      }
      for (let i = this.cols; i < this.n; i++) {
        const o = i * 3;
        const vx = (P[o] - Q[o]) * 0.992;
        const vy = (P[o + 1] - Q[o + 1]) * 0.992;
        const vz = (P[o + 2] - Q[o + 2]) * 0.992;
        wind.velocityAt(P[o], P[o + 1], P[o + 2], _w);
        const row = Math.floor(i / this.cols);
        const ws = Math.hypot(_w.x, _w.z);
        // The hem ripples like a flag; the higher rows mostly drag along.
        const flap = Math.sin(this.time * (7 + ws * 1.5) - row * 0.8 + (i % this.cols) * 0.4) * ws * 0.12 * row;
        const drag = 1.5;
        const ax = drag * (_w.x - vx / h) + back.x * flap;
        const ay = -9.8 + drag * 0.35 * (_w.y - vy / h) + flap * 0.3;
        const az = drag * (_w.z - vz / h) + back.z * flap;
        Q[o] = P[o];
        Q[o + 1] = P[o + 1];
        Q[o + 2] = P[o + 2];
        P[o] += vx + ax * h * h;
        P[o + 1] += vy + ay * h * h;
        P[o + 2] += vz + az * h * h;
      }
      for (let it = 0; it < 5; it++) {
        for (const [i, j, len, k] of this.cons) {
          const oi = i * 3;
          const oj = j * 3;
          const dx = P[oj] - P[oi];
          const dy = P[oj + 1] - P[oi + 1];
          const dz = P[oj + 2] - P[oi + 2];
          const d = Math.hypot(dx, dy, dz) || 1e-6;
          const diff = ((d - len) / d) * k;
          const pinI = i < this.cols;
          const pinJ = j < this.cols;
          const wi = pinI ? 0 : pinJ ? 1 : 0.5;
          const wj = pinJ ? 0 : pinI ? 1 : 0.5;
          P[oi] += dx * diff * wi;
          P[oi + 1] += dy * diff * wi;
          P[oi + 2] += dz * diff * wi;
          P[oj] -= dx * diff * wj;
          P[oj + 1] -= dy * diff * wj;
          P[oj + 2] -= dz * diff * wj;
        }
        // The row just under the collar rides on the shoulders; collide the rest,
        // and never let the cloth climb above the collar and over the head.
        let collarY = Infinity;
        for (let c = 0; c < this.cols; c++) collarY = Math.min(collarY, P[c * 3 + 1]);
        for (let i = this.cols; i < this.n; i++) {
          if (i >= this.cols * 2) this.collide(i, colliders);
          const cap = collarY + 0.14 - 0.01 * Math.floor(i / this.cols);
          if (P[i * 3 + 1] > cap) P[i * 3 + 1] = cap;
        }
      }
    }
    for (let k = 0; k < this.cols * 3; k++) this.anchorPrev[k] = this.anchorNext[k];
    this.posAttr.array.set(P);
    this.posAttr.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
    this.mesh.geometry.computeBoundingSphere();
  }

  collide(i, colliders) {
    const o = i * 3;
    _v.set(this.p[o], this.p[o + 1], this.p[o + 2]);
    let moved = false;
    for (const [c, r] of colliders.spheres) {
      _w.subVectors(_v, c);
      const d = _w.length();
      if (d < r && d > 1e-6) {
        _v.copy(c).addScaledVector(_w, r / d);
        moved = true;
      }
    }
    for (const [a, b, r] of colliders.capsules) {
      _w.subVectors(b, a);
      const t = clamp(_a.subVectors(_v, a).dot(_w) / Math.max(_w.lengthSq(), 1e-8), 0, 1);
      _a.copy(a).addScaledVector(_w, t);
      _w.subVectors(_v, _a);
      const d = _w.length();
      if (d < r && d > 1e-6) {
        _v.copy(_a).addScaledVector(_w, r / d);
        moved = true;
      }
    }
    if (moved) {
      this.p[o] = _v.x;
      this.p[o + 1] = _v.y;
      this.p[o + 2] = _v.z;
    }
  }
}
