import * as THREE from 'three';

// ---------------------------------------------------------------------------
// A tube whose centreline is set every frame: tentacles, a lure's stalk, a
// wyrm's body. The curve is resampled by arc length so the rings stay evenly
// spaced however it bends, and framed by parallel transport so it never
// twists. Surfaces use the character material's per-vertex layout.
// ---------------------------------------------------------------------------

const _t = new THREE.Vector3();
const _n = new THREE.Vector3();
const _b = new THREE.Vector3();
const _q = new THREE.Vector3();
const _d = new THREE.Vector3();

export class DynamicTube {
  // o: { rings, sides, radius(t) (t 0 root .. 1 tip), surface (mat()), length (rest, m), tint(t, u) -> k, cap }
  constructor(material, o) {
    this.rings = o.rings ?? 32;
    this.sides = o.sides ?? 12;
    this.radius = o.radius;
    this.length = o.length ?? 1;
    const R = this.rings;
    const S = this.sides + 1; // a seam column so uv wraps cleanly
    const count = R * S + 1; // + the tip point
    this.pos = new Float32Array(count * 3);
    this.nor = new Float32Array(count * 3);
    const uv = new Float32Array(count * 2);
    const col = new Float32Array(count * 3);
    const matA = new Float32Array(count * 4);
    const pat = new Float32Array(count * 2);
    const m = o.surface;
    for (let j = 0; j < R; j++) {
      const t = j / (R - 1);
      for (let i = 0; i < S; i++) {
        const k = j * S + i;
        const u = i / this.sides;
        uv[k * 2] = u;
        uv[k * 2 + 1] = t * this.length;
        const tint = o.tint ? o.tint(t, u) : 1;
        const tc = Array.isArray(tint) ? tint : [tint, tint, tint];
        col[k * 3] = m.color[0] * tc[0];
        col[k * 3 + 1] = m.color[1] * tc[1];
        col[k * 3 + 2] = m.color[2] * tc[2];
        matA.set([m.rough, m.metal, m.trans, m.bump], k * 4);
        pat.set([m.pat, o.rimAt ? o.rimAt(t, u) : m.rim], k * 2);
      }
    }
    const tip = R * S;
    uv[tip * 2] = 0.5;
    uv[tip * 2 + 1] = this.length;
    col.set([m.color[0], m.color[1], m.color[2]], tip * 3);
    matA.set([m.rough, m.metal, m.trans, m.bump], tip * 4);
    pat.set([m.pat, m.rim], tip * 2);
    const idx = [];
    for (let j = 0; j < R - 1; j++) {
      for (let i = 0; i < this.sides; i++) {
        const a = j * S + i;
        const b = a + 1;
        const c = a + S;
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }
    // Close the tip with a fan.
    for (let i = 0; i < this.sides; i++) {
      const a = (R - 1) * S + i;
      idx.push(a, a + 1, tip);
    }
    const g = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.norAttr = new THREE.BufferAttribute(this.nor, 3).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('normal', this.norAttr);
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aMat', new THREE.BufferAttribute(matA, 4));
    g.setAttribute('aPat', new THREE.BufferAttribute(pat, 2));
    g.setIndex(idx);
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = false;
    this.mesh.layers.enable(1);
    // Sampled centreline (world), for hit volumes and attachments.
    this.points = Array.from({ length: R }, () => new THREE.Vector3());
    this.frames = Array.from({ length: R }, () => ({ n: new THREE.Vector3(), b: new THREE.Vector3(), t: new THREE.Vector3() }));
    this.up0 = new THREE.Vector3(0, -1, 0); // the underside at the root
  }

  // points: a polyline (Vector3[]) from root to tip. Only `maxLen` metres of it are used.
  update(points, maxLen = Infinity) {
    const R = this.rings;
    const S = this.sides + 1;
    // Arc lengths along the input polyline.
    const n = points.length;
    const acc = this.acc && this.acc.length === n ? this.acc : (this.acc = new Float32Array(n));
    acc[0] = 0;
    for (let i = 1; i < n; i++) acc[i] = acc[i - 1] + points[i].distanceTo(points[i - 1]);
    const total = Math.min(acc[n - 1], maxLen);
    let seg = 1;
    for (let j = 0; j < R; j++) {
      const s = (j / (R - 1)) * total;
      while (seg < n - 1 && acc[seg] < s) seg++;
      const a = acc[seg - 1];
      const b = acc[seg];
      const f = b > a ? (s - a) / (b - a) : 0;
      this.points[j].lerpVectors(points[seg - 1], points[seg], Math.min(Math.max(f, 0), 1));
    }
    // Parallel-transport frames.
    _n.copy(this.up0);
    for (let j = 0; j < R; j++) {
      const p = this.points[j];
      const pa = this.points[Math.max(j - 1, 0)];
      const pb = this.points[Math.min(j + 1, R - 1)];
      _t.subVectors(pb, pa);
      if (_t.lengthSq() < 1e-10) _t.set(0, 1, 0);
      _t.normalize();
      _n.addScaledVector(_t, -_n.dot(_t));
      if (_n.lengthSq() < 1e-8) _n.set(1, 0, 0).addScaledVector(_t, -_t.x);
      _n.normalize();
      _b.crossVectors(_t, _n).normalize();
      const F = this.frames[j];
      F.t.copy(_t);
      F.n.copy(_n);
      F.b.copy(_b);
      const t = j / (R - 1);
      const r = this.radius(t);
      // Slope of the radius tilts the normals so tapering reads right.
      const r2 = this.radius(Math.min(1, t + 1 / (R - 1)));
      const slope = (r - r2) / Math.max(total / (R - 1), 1e-4);
      for (let i = 0; i < S; i++) {
        const ang = (i / this.sides) * Math.PI * 2;
        const c = Math.cos(ang);
        const sn = Math.sin(ang);
        _q.copy(_n).multiplyScalar(c).addScaledVector(_b, sn);
        const k = (j * S + i) * 3;
        this.pos[k] = p.x + _q.x * r;
        this.pos[k + 1] = p.y + _q.y * r;
        this.pos[k + 2] = p.z + _q.z * r;
        _d.copy(_q).addScaledVector(_t, slope).normalize();
        this.nor[k] = _d.x;
        this.nor[k + 1] = _d.y;
        this.nor[k + 2] = _d.z;
      }
    }
    // The tip point, a little beyond the last ring.
    const last = this.points[R - 1];
    const F = this.frames[R - 1];
    const k = R * S * 3;
    const rt = this.radius(1);
    this.pos[k] = last.x + F.t.x * rt * 0.8;
    this.pos[k + 1] = last.y + F.t.y * rt * 0.8;
    this.pos[k + 2] = last.z + F.t.z * rt * 0.8;
    this.nor[k] = F.t.x;
    this.nor[k + 1] = F.t.y;
    this.nor[k + 2] = F.t.z;
    this.posAttr.needsUpdate = true;
    this.norAttr.needsUpdate = true;
    this.total = total;
  }

  // Point and radius at fraction t along the current tube.
  at(t, out) {
    const f = Math.min(Math.max(t, 0), 1) * (this.rings - 1);
    const j = Math.floor(f);
    const j2 = Math.min(j + 1, this.rings - 1);
    return out.lerpVectors(this.points[j], this.points[j2], f - j);
  }
}

// A cubic Bezier sampled into `out` (Vector3[]).
export function bezier(p0, p1, p2, p3, out) {
  const n = out.length;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    out[i].set(
      p0.x * a + p1.x * b + p2.x * c + p3.x * d,
      p0.y * a + p1.y * b + p2.y * c + p3.y * d,
      p0.z * a + p1.z * b + p2.z * c + p3.z * d,
    );
  }
  return out;
}
