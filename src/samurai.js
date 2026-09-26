import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';
import { terrainHeight } from './terrain.js';
import { MOVE } from './config.js';

// ---------------------------------------------------------------------------
// Shading: soft cloth with woven bump detail, GGX for lacquer and steel, a rim
// of sunlight around the silhouette, and the kasa's shadow falling on the face.
// ---------------------------------------------------------------------------

const vert = /* glsl */ `
uniform float uPatMode;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vPat;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vPat = uPatMode > 0.5 ? vec3(uv, 0.0) : position;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const frag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
uniform vec3 uColor;
uniform float uRough;
uniform float uMetal;
uniform float uRim;
uniform int uPattern;
uniform float uTrans;
uniform float uBump;
uniform float uPatMode;
uniform float uGroundY;
uniform vec4 uHat;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vPat;

// What polished steel sees: bright hazy sky above, the sunlit golden field below.
vec3 envColor(vec3 r) {
  vec3 sky = mix(hazeColor(r), vec3(0.6, 0.78, 1.15), smoothstep(0.1, 0.8, r.y));
  vec3 field = mix(vec3(1.05, 0.72, 0.36), uFogSunColor * 0.5, pow(sat(dot(r, uSunDir)), 3.0));
  return mix(field, sky, smoothstep(-0.12, 0.04, r.y));
}

// Bump mapping from a procedural height (surface-gradient form, no tangents needed).
vec3 bumpNormal(vec3 N, float h) {
  vec3 dpdx = dFdx(vWorld);
  vec3 dpdy = dFdy(vWorld);
  float dhdx = dFdx(h);
  float dhdy = dFdy(h);
  vec3 r1 = cross(dpdy, N);
  vec3 r2 = cross(N, dpdx);
  float det = dot(dpdx, r1);
  vec3 grad = sign(det) * (dhdx * r1 + dhdy * r2);
  return normalize(abs(det) * N - grad);
}

// Soft folds and a coarse weave. For the cape the pattern follows its cloth grid.
float fabricHeight(vec3 p) {
  if (uPatMode > 0.5) {
    float folds = vnoise(vec2(p.x * 16.0, p.y * 3.0)) * 0.7 + vnoise(vec2(p.x * 41.0, p.y * 9.0)) * 0.3;
    float weave = vnoise(p.xy * vec2(140.0, 120.0));
    return folds * 0.012 + weave * 0.0012;
  }
  float folds = vnoise(vec2((p.x + p.z) * 20.0, p.y * 5.0)) * 0.7 + vnoise(vec2((p.x - p.z) * 47.0, p.y * 11.0)) * 0.3;
  float weave = vnoise(vec2((p.x + p.z) * 260.0, p.y * 240.0));
  return folds * 0.004 + weave * 0.0006;
}

// The kasa's brim shades whatever sits beneath it from the sun.
float hatShadow(vec3 p) {
  float dy = uHat.y - p.y;
  if (dy <= 0.0 || uHat.w <= 0.0) return 1.0;
  vec3 q = p + uSunDir * (dy / max(uSunDir.y, 0.05));
  return smoothstep(uHat.w * 0.8, uHat.w * 1.02, length(q.xz - uHat.xz));
}

// ...and hides most of the sky from the face and neck beneath it.
float hatOcclusion(vec3 p) {
  float dy = uHat.y - p.y;
  if (dy <= 0.0 || uHat.w <= 0.0) return 1.0;
  float inside = 1.0 - smoothstep(uHat.w * 0.55, uHat.w * 1.1, length(p.xz - uHat.xz));
  return 1.0 - 0.7 * inside * (1.0 - smoothstep(0.2, 0.55, dy));
}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  if (uBump > 0.0) N = bumpNormal(N, fabricHeight(vPat) * uBump);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = uSunDir;
  vec3 alb = uColor;

  if (uPattern == 1) {
    // Woven straw: radial reeds and concentric binding rings.
    float a = atan(vPat.z, vPat.x);
    float rr = length(vPat.xz);
    float reeds = 0.5 + 0.5 * sin(a * 150.0 + rr * 8.0);
    float rings = smoothstep(0.75, 1.0, sin(rr * 95.0));
    alb *= 0.8 + 0.2 * reeds - 0.2 * rings;
  } else if (uPattern == 2) {
    // Hakama pinstripes.
    float a = atan(vPat.z, vPat.x);
    alb *= 0.88 + 0.12 * step(0.62, fract(a * 22.0 / TAU));
  } else if (uPattern == 3) {
    // Tsuka-ito: diamond wrap over pale rayskin.
    float a = atan(vPat.y, vPat.x) / TAU;
    float z = vPat.z * 34.0;
    float d = abs(fract(z + a * 2.0) - 0.5) + abs(fract(z - a * 2.0) - 0.5);
    alb = mix(alb, vec3(0.62, 0.58, 0.5), (1.0 - smoothstep(0.5, 0.62, d)) * 0.85);
  }

  float NdL = dot(N, L);
  float NdV = max(dot(N, V), 1e-3);
  float diff = max((NdL + 0.3) / 1.3, 0.0);

  // GGX specular.
  vec3 Hv = normalize(L + V);
  float NdH = max(dot(N, Hv), 0.0);
  float a2 = pow(max(uRough, 0.05), 4.0);
  float dd = NdH * NdH * (a2 - 1.0) + 1.0;
  float D = a2 / (PI * dd * dd);
  float F0 = mix(0.04, 1.0, uMetal);
  float F = F0 + (1.0 - F0) * pow(1.0 - max(dot(Hv, V), 0.0), 5.0);
  float k = (uRough + 1.0) * (uRough + 1.0) / 8.0;
  float nl = max(NdL, 0.0);
  float G = (NdV / (NdV * (1.0 - k) + k)) * (nl / (nl * (1.0 - k) + k));
  float spec = D * F * G / (4.0 * NdV + 1e-3);
  vec3 specCol = mix(vec3(1.0), alb, uMetal);

  // Against the sun a molten edge of light wraps the silhouette.
  float fres = pow(1.0 - NdV, 3.2);
  float back = pow(sat(dot(-V, L)), 1.6);
  float rim = fres * (0.15 + 2.4 * back) * sat(NdL + 0.6) * uRim;

  // Tall grass swallows the light around the legs; the brim shades the face.
  float grassOcc = smoothstep(0.1, 1.1, vWorld.y - uGroundY);
  float sunVis = grassOcc * hatShadow(vWorld);
  vec3 sun = uSunColor * sunVis;
  vec3 amb = mix(uAmbGround, uAmbSky, 0.5 + 0.5 * N.y) * mix(0.5, 1.0, grassOcc) * hatOcclusion(vWorld);

  vec3 R = reflect(-V, N);
  vec3 env = envColor(R) * mix(F0, 1.0, pow(1.0 - NdV, 5.0)) * (1.0 - uRough) * (1.0 - uRough);

  vec3 col = alb * (1.0 - uMetal) * (diff * sun + amb);
  col += specCol * spec * sun;
  col += specCol * env * mix(0.25, 1.0, uMetal);
  col += uSunColor * rim * sunVis * mix(vec3(1.0), alb * 1.5 + 0.25, 0.35);
  // Thin cloth and straw glow where the sun shines through them.
  float thru = pow(sat(dot(-V, L)), 2.5) * (0.35 + 0.65 * sat(-NdL + 0.3));
  col += alb * uSunColor * thru * uTrans * sunVis;
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// Frame-rate independent exponential smoothing.
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Tube running downward from y = 0 to y = -h, optionally pleated and elliptical.
function tube(r0, r1, h, { pleats = 0, depth = 0, segs = 36, rows = 6, sx = 1, sz = 1, flare = 1 } = {}) {
  const pos = [];
  const idx = [];
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    const y = -h * v;
    const r = r0 + (r1 - r0) * Math.pow(v, flare);
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const p = 1 + depth * Math.cos(a * pleats) * (0.35 + 0.65 * v);
      pos.push(Math.cos(a) * r * p * sx, y, Math.sin(a) * r * p * sz);
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i;
      const b = a + 1;
      const c = a + segs + 1;
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Box with rounded edges and analytic normals.
function roundedBox(w, h, d, r, segs = 4) {
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

// Kimono sleeve: narrow where it meets the shoulder, deep and soft where it hangs.
function drapedSleeve(side) {
  const g = roundedBox(0.07, 0.4, 0.25, 0.03);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = clamp((0.2 - y) / 0.4, 0, 1);
    p.setX(i, p.getX(i) * (0.75 + 0.25 * t) + 0.012 * side);
    p.setZ(i, p.getZ(i) * (0.5 + 0.5 * Math.pow(t, 0.7)) - 0.035 * t);
    p.setY(i, y - 0.17);
  }
  g.computeVertexNormals();
  return g;
}

function lathe(points, segs, sx = 1, sz = 1) {
  const g = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segs);
  if (sx !== 1 || sz !== 1) g.scale(sx, 1, sz);
  return g;
}

// A gently curved scabbard running along -Z from its mouth.
function bentBar(length, w, h, bend, segs = 12) {
  const g = new THREE.BoxGeometry(w, h, length, 1, 1, segs);
  g.translate(0, 0, -length / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = -p.getZ(i) / length;
    p.setY(i, p.getY(i) + bend * t * t);
  }
  g.computeVertexNormals();
  return g;
}

// Katana blade along +Z, spine up (+Y), edge down: a faceted diamond section so
// the ridge line and the flat catch the sun separately, sweeping into the kissaki.
function bladeGeometry(len) {
  const segs = 30;
  const sections = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const z = t * len;
    const sori = 0.022 * t * t;
    const kt = Math.max(0, (t - 0.9) / 0.1);
    const tipShape = Math.sqrt(Math.max(0, 1 - kt * kt));
    const w = 0.031 * (1 - 0.28 * t) * (kt > 0 ? tipShape : 1);
    const th = 0.0072 * (1 - 0.4 * t) * (kt > 0 ? tipShape : 1);
    const y0 = sori;
    sections.push([
      [0, y0, z],
      [th / 2, y0 - w * 0.28, z],
      [0, y0 - w, z],
      [-th / 2, y0 - w * 0.28, z],
    ]);
  }
  const pos = [];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...b, ...d, ...c);
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
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------
// Cloth: a travelling cape, simulated with Verlet integration.
// ---------------------------------------------------------------------------

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _a = new THREE.Vector3();

class Cloth {
  // rest(c, r) gives each particle's rest position in the anchor frame (the chest).
  constructor(material, cols, rows, rest) {
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
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) uv.push(c / (cols - 1), 1 - r / (rows - 1));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
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

// ---------------------------------------------------------------------------
// Skeleton proportions (metres)
// ---------------------------------------------------------------------------

const L1 = 0.43; // thigh
const L2 = 0.43; // shin
const ANKLE_H = 0.075;
const HIP_Y = 0.93;
const HIP_X = 0.1;
const HIP_DROP = 0.02;
const REACH = L1 + L2 - 0.004;
const UPPER_ARM = 0.28;
const FOREARM_TO_GRIP = 0.3;

// Where the ankle sits when the foot touches the ground at contact point cz,
// rolled onto the heel (pitch > 0, toes up) or onto the ball (pitch < 0).
function ankleFromContact(cz, pitch, out) {
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);
  if (pitch >= 0) {
    out.z = cz - 0.055 + 0.055 * c - ANKLE_H * s;
    out.y = 0.055 * s + ANKLE_H * c;
  } else {
    out.z = cz + 0.115 - 0.115 * c - ANKLE_H * s;
    out.y = -0.115 * s + ANKLE_H * c;
  }
  out.pitch = pitch;
  return out;
}

// Two-bone IK in the leg's plane. dz forward, dy = distance below the hip joint.
function solveLeg(dz, dy, out) {
  const D = clamp(Math.hypot(dz, dy), 0.12, REACH);
  const a = Math.atan2(dz, dy);
  const b = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  const k = Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1));
  out.hip = a + b;
  out.knee = Math.PI - k;
  return out;
}

const _euler = new THREE.Euler();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _q3 = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _mb = new THREE.Matrix4();
const _t = new THREE.Vector3();
const _d = new THREE.Vector3();
const _perp = new THREE.Vector3();
const _u = new THREE.Vector3();
const _e = new THREE.Vector3();
const _f = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _down = new THREE.Vector3(0, -1, 0);
const _up = new THREE.Vector3(0, 1, 0);
const _back = new THREE.Vector3();
const _grip = new THREE.Vector3();
const _swordDir = new THREE.Vector3();

export class Samurai {
  constructor(shared, wind) {
    this.shared = shared;
    this.wind = wind;
    this.groundY = { value: 0 };
    this.hatUniform = { value: new THREE.Vector4(0, -1000, 0, 0.36) };
    this.mats = this.makeMaterials();
    this.build();

    // Animation state.
    this.phase = 0;
    this.speed = 0;
    this.moveW = 0;
    this.runW = 0;
    this.airW = 0;
    this.airT = 0;
    this.squash = 0;
    this.squashV = 0;
    this.lean = 0;
    this.bank = 0;
    this.accel = 0;
    this.prevFwdSpeed = 0;
    this.prevYaw = null;
    this.yawRate = 0;
    this.hatTilt = 0;
    this.holdW = 1;
    this.swordW = 1;
    this.bend = [1, 1];
    this.time = 0;
    this.legState = [{}, {}];
    this.ankle = [{ z: 0, y: 0, pitch: 0 }, { z: 0, y: 0, pitch: 0 }];
    this.swordSwing = 0;
    this.swordSwingV = 0;
    this.v0 = Math.sqrt(2 * MOVE.gravity * MOVE.jumpHeight);
    this.colliders = {
      spheres: Array.from({ length: 8 }, () => [new THREE.Vector3(), 0.1]),
      capsules: Array.from({ length: 2 }, () => [new THREE.Vector3(), new THREE.Vector3(), 0.085]),
    };
  }

  makeMaterials() {
    const make = (hex, o = {}) => new THREE.ShaderMaterial({
      uniforms: {
        ...this.shared,
        uColor: { value: new THREE.Color(hex) },
        uRough: { value: o.rough ?? 0.85 },
        uMetal: { value: o.metal ?? 0 },
        uRim: { value: o.rim ?? 1 },
        uPattern: { value: o.pattern ?? 0 },
        uTrans: { value: o.trans ?? 0 },
        uBump: { value: o.bump ?? 0 },
        uPatMode: { value: o.patMode ?? 0 },
        uGroundY: this.groundY,
        uHat: this.hatUniform,
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: o.side ?? THREE.FrontSide,
    });
    return {
      cape: make('#4a4644', { rough: 0.95, trans: 0.35, bump: 1, patMode: 1, side: THREE.DoubleSide, rim: 1.1 }),
      kimono: make('#524840', { rough: 0.9, trans: 0.1, bump: 1 }),
      sleeve: make('#524840', { rough: 0.9, trans: 0.2, bump: 1 }),
      under: make('#4a4038', { rough: 0.9, bump: 1, side: THREE.DoubleSide }),
      collar: make('#cfc6b4', { rough: 0.8 }),
      hakama: make('#45403d', { rough: 0.92, pattern: 2, bump: 1, side: THREE.DoubleSide }),
      obi: make('#3b2819', { rough: 0.8, bump: 1 }),
      skin: make('#b88866', { rough: 0.6, rim: 0.8 }),
      hair: make('#141212', { rough: 0.5 }),
      hat: make('#b8955a', { rough: 0.85, pattern: 1, rim: 1.2, trans: 0.3, side: THREE.DoubleSide }),
      lacquer: make('#0f0e0f', { rough: 0.25, rim: 0.6 }),
      wrap: make('#1a1716', { rough: 0.7, pattern: 3 }),
      metal: make('#8a6a34', { rough: 0.35, metal: 1, rim: 0.4 }),
      steel: make('#c9cdd3', { rough: 0.13, metal: 1, rim: 0.3 }),
      tabi: make('#cdc6b6', { rough: 0.85 }),
      straw: make('#9e814c', { rough: 0.9 }),
      eye: make('#0c0a0a', { rough: 0.2 }),
    };
  }

  add(parent, geometry, material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.layers.enable(1);
    parent.add(m);
    return m;
  }

  build() {
    const M = this.mats;
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.body);

    this.pelvis = new THREE.Group();
    this.pelvis.position.y = HIP_Y;
    this.body.add(this.pelvis);

    // Hakama: a pleated skirt over the hips with a wide pleated tube down each leg.
    this.add(this.pelvis, tube(0.152, 0.235, 0.44, { pleats: 11, depth: 0.07, sx: 1.18, sz: 0.9, flare: 0.8, segs: 44 }), M.hakama, 0, 0.11, 0);
    // Obi and its knot.
    this.add(this.pelvis, lathe([[0.15, 0.0], [0.158, 0.02], [0.158, 0.085], [0.15, 0.105]], 32, 1.2, 0.84), M.obi, 0, 0.05, 0);
    this.add(this.pelvis, roundedBox(0.1, 0.066, 0.045, 0.018), M.obi, 0, 0.1, -0.14);

    this.buildSwords();

    this.legs = [this.buildLeg(1), this.buildLeg(-1)];

    // Torso in a kimono.
    this.spine = new THREE.Group();
    this.spine.position.y = 0.06;
    this.pelvis.add(this.spine);
    this.add(this.spine, lathe([
      [0.001, -0.03], [0.148, -0.03], [0.152, 0.05], [0.158, 0.15], [0.17, 0.26], [0.176, 0.34],
      [0.172, 0.4], [0.16, 0.44], [0.13, 0.475], [0.09, 0.5], [0.05, 0.515], [0.001, 0.52],
    ], 32, 1.22, 0.74), M.kimono);
    // Crossed collar: the pale under-kimono shows at the neck.
    const collar = new THREE.TorusGeometry(0.066, 0.017, 8, 28);
    collar.rotateX(Math.PI / 2);
    collar.scale(1.05, 1, 1.15);
    this.add(this.spine, collar, M.collar, 0, 0.5, 0.005).rotation.x = 0.28;

    this.chest = new THREE.Group();
    this.chest.position.y = 0.3;
    this.spine.add(this.chest);

    this.neck = new THREE.Group();
    this.neck.position.set(0, 0.2, 0);
    this.chest.add(this.neck);
    const neckGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.12, 12);
    neckGeo.translate(0, 0.04, 0);
    this.add(this.neck, neckGeo, M.skin);

    this.head = new THREE.Group();
    this.head.position.set(0, 0.08, 0.012);
    this.neck.add(this.head);
    const headGeo = new THREE.SphereGeometry(0.1, 28, 20);
    headGeo.scale(0.9, 1.06, 1.0);
    this.add(this.head, headGeo, M.skin, 0, 0.1, 0);
    // Hair swept back into a knot, mostly hidden by the hat.
    const hairGeo = new THREE.SphereGeometry(0.104, 24, 14, 0, Math.PI * 2, 0, 1.45);
    hairGeo.scale(0.92, 1.06, 1.02);
    this.add(this.head, hairGeo, M.hair, 0, 0.1, -0.006).rotation.x = -0.55;
    this.add(this.head, new THREE.CylinderGeometry(0.018, 0.024, 0.05, 8), M.hair, 0, 0.205, -0.03);
    // A plain, weathered face, mostly in the shade of the brim.
    const nose = new THREE.ConeGeometry(0.014, 0.04, 8);
    nose.rotateX(Math.PI / 2 + 0.35);
    this.add(this.head, nose, M.skin, 0, 0.095, 0.1);
    const eyeGeo = new THREE.SphereGeometry(0.011, 8, 6);
    eyeGeo.scale(1.3, 0.7, 0.6);
    this.add(this.head, eyeGeo, M.eye, 0.033, 0.112, 0.088);
    this.add(this.head, eyeGeo, M.eye, -0.033, 0.112, 0.088);
    const brow = new THREE.BoxGeometry(0.035, 0.008, 0.012);
    this.add(this.head, brow, M.hair, 0.034, 0.13, 0.09).rotation.z = -0.12;
    this.add(this.head, brow, M.hair, -0.034, 0.13, 0.09).rotation.z = 0.12;

    // Kasa: a wide conical straw hat with a small peak.
    this.hat = new THREE.Group();
    this.hat.position.set(0, 0.133, 0);
    this.head.add(this.hat);
    this.add(this.hat, lathe([
      [0.0, 0.16], [0.02, 0.152], [0.07, 0.125], [0.15, 0.085], [0.23, 0.047], [0.31, 0.012],
      [0.365, -0.008], [0.378, -0.016], [0.372, -0.022], [0.355, -0.017], [0.27, 0.015],
      [0.18, 0.052], [0.09, 0.09], [0.03, 0.115], [0.0, 0.118],
    ], 64), M.hat);
    this.add(this.hat, new THREE.CylinderGeometry(0.014, 0.022, 0.028, 10), M.straw, 0, 0.168, 0);
    // Chin cords.
    const cord = new THREE.CylinderGeometry(0.0035, 0.0035, 0.2, 5);
    cord.translate(0, -0.1, 0);
    this.add(this.hat, cord, M.straw, 0.075, 0.0, 0.03).rotation.set(0.25, 0, 0.35);
    this.add(this.hat, cord, M.straw, -0.075, 0.0, 0.03).rotation.set(0.25, 0, -0.35);

    this.arms = [this.buildArm(1), this.buildArm(-1)];

    // The drawn katana, carried in the right hand.
    this.sword = this.buildDrawnSword();
    this.body.add(this.sword);

    // Travelling cape over the shoulders, simulated as cloth.
    const cols = 13;
    const rows = 11;
    const hem = [0.02, -0.03, 0.01, 0.04, -0.02, 0.03, 0, -0.04, 0.02, 0.03, -0.01, -0.03, 0.02];
    this.cape = new Cloth(M.cape, cols, rows, (c, r) => {
      const u = (c / (cols - 1)) * 2 - 1;
      const v = r / (rows - 1);
      const theta = u * 1.95;
      // Drapes out over the shoulders and arms, flaring toward the hem.
      const rx = 0.215 + 0.14 * Math.sqrt(v);
      const rz = 0.15 + 0.08 * v;
      const len = 0.62 + (r === rows - 1 ? hem[c] : 0);
      return new THREE.Vector3(Math.sin(theta) * rx, 0.2 - 0.05 * u * u - v * len, -Math.cos(theta) * rz);
    });
  }

  buildLeg(side) {
    const M = this.mats;
    const hip = new THREE.Group();
    hip.position.set(HIP_X * side, -HIP_DROP, 0);
    this.pelvis.add(hip);
    const thigh = tube(0.1, 0.13, L1 + 0.06, { pleats: 7, depth: 0.06, flare: 0.9 });
    thigh.translate(0, 0.03, 0);
    this.add(hip, thigh, M.hakama);
    const knee = new THREE.Group();
    knee.position.y = -L1;
    hip.add(knee);
    this.add(knee, tube(0.128, 0.18, L2 - 0.04, { pleats: 7, depth: 0.07, flare: 1.4 }), M.hakama, 0, 0.02, 0);
    // Shin and ankle, visible below the hem.
    const shin = new THREE.CylinderGeometry(0.04, 0.034, L2 * 0.5, 10);
    shin.translate(0, -L2 * 0.75, 0);
    this.add(knee, shin, M.tabi);
    const ankle = new THREE.Group();
    ankle.position.y = -L2;
    knee.add(ankle);
    // Tabi sock on a straw sandal.
    const foot = new THREE.CapsuleGeometry(0.038, 0.14, 4, 10);
    foot.rotateX(Math.PI / 2);
    foot.scale(1.0, 0.72, 1.0);
    foot.translate(0, -0.045, 0.05);
    this.add(ankle, foot, M.tabi);
    const sole = new THREE.BoxGeometry(0.09, 0.018, 0.25);
    sole.translate(0, -ANKLE_H + 0.009, 0.055);
    this.add(ankle, sole, M.straw);
    return { hip, knee, ankle, side };
  }

  buildArm(side) {
    const M = this.mats;
    const shoulder = new THREE.Group();
    shoulder.position.set(0.2 * side, 0.15, -0.01);
    this.chest.add(shoulder);
    // The sleeve has its own pivot so it can hang with gravity and trail the arm.
    const sleevePivot = new THREE.Group();
    shoulder.add(sleevePivot);
    this.add(sleevePivot, drapedSleeve(side), M.sleeve);
    const elbow = new THREE.Group();
    elbow.position.y = -UPPER_ARM;
    shoulder.add(elbow);
    // Cuff of the under-kimono around the forearm.
    this.add(elbow, tube(0.047, 0.052, 0.15, { segs: 14, rows: 2 }), M.under, 0, 0.02, 0);
    const forearm = new THREE.CylinderGeometry(0.031, 0.028, 0.14, 10);
    forearm.translate(0, -0.17, 0);
    this.add(elbow, forearm, M.skin);
    const wrist = new THREE.Group();
    wrist.position.y = -0.245;
    elbow.add(wrist);
    const hand = new THREE.CapsuleGeometry(0.034, 0.055, 4, 8);
    hand.scale(0.9, 1, 0.62);
    hand.translate(0, -0.055, 0.005);
    this.add(wrist, hand, M.skin);
    return { shoulder, elbow, wrist, sleevePivot, side };
  }

  // Empty scabbard and the sheathed short sword, thrust through the obi on the left hip.
  buildSwords() {
    const M = this.mats;
    const sheathed = (len, hilt, bend) => {
      const g = new THREE.Group();
      this.add(g, bentBar(len, 0.032, 0.022, bend), M.lacquer);
      this.add(g, new THREE.BoxGeometry(0.034, 0.024, 0.03), M.metal, 0, bend, -len - 0.01);
      if (hilt > 0) {
        const tsuba = new THREE.CylinderGeometry(0.034, 0.034, 0.007, 18);
        tsuba.rotateX(Math.PI / 2);
        this.add(g, tsuba, M.metal, 0, 0, 0.004);
        const tsuka = new THREE.CylinderGeometry(0.0155, 0.0145, hilt, 12);
        tsuka.rotateX(Math.PI / 2);
        tsuka.translate(0, 0, hilt / 2 + 0.008);
        this.add(g, tsuka, M.wrap);
      }
      return g;
    };
    this.saya = sheathed(0.74, 0, -0.035);
    this.saya.position.set(0.14, 0.11, 0.12);
    this.saya.rotation.set(-0.5, -0.35, 0.25);
    this.pelvis.add(this.saya);
    this.wakizashi = sheathed(0.5, 0.18, -0.022);
    this.wakizashi.position.set(0.1, 0.12, 0.14);
    this.wakizashi.rotation.set(-0.4, -0.45, 0.3);
    this.pelvis.add(this.wakizashi);
  }

  // Katana with its origin at the grip; the blade runs along +Z.
  buildDrawnSword() {
    const M = this.mats;
    const g = new THREE.Group();
    const blade = bladeGeometry(0.72);
    blade.translate(0, 0.012, 0.09);
    this.add(g, blade, M.steel);
    const habaki = new THREE.BoxGeometry(0.012, 0.036, 0.028);
    this.add(g, habaki, M.metal, 0, -0.004, 0.075);
    const tsuba = new THREE.CylinderGeometry(0.038, 0.038, 0.007, 20);
    tsuba.rotateX(Math.PI / 2);
    this.add(g, tsuba, M.metal, 0, 0, 0.058);
    const tsuka = new THREE.CylinderGeometry(0.0165, 0.0155, 0.25, 14);
    tsuka.rotateX(Math.PI / 2);
    tsuka.translate(0, 0, -0.07);
    this.add(g, tsuka, M.wrap);
    const cap = new THREE.CylinderGeometry(0.0175, 0.017, 0.018, 12);
    cap.rotateX(Math.PI / 2);
    this.add(g, cap, M.metal, 0, 0, -0.2);
    return g;
  }

  addTo(scene) {
    scene.add(this.root);
    scene.add(this.cape.mesh);
  }

  // Gait: distance covered per full cycle (two steps) grows with speed.
  strideLength(speed) {
    return clamp(0.8 + 0.32 * speed + 0.022 * speed * speed, 0.9, 3.3);
  }

  footTarget(p, duty, half, lift, out) {
    const heelMax = lerp(0.28, 0.12, this.runW);
    const toeMax = lerp(0.62, 0.95, this.runW);
    if (p < duty) {
      const s = p / duty;
      const pitch = heelMax * (1 - smoothstep(0, 0.22, s)) - toeMax * smoothstep(0.58, 1, s);
      return ankleFromContact(half * (1 - 2 * s), pitch, out);
    }
    const s = (p - duty) / (1 - duty);
    const a0 = ankleFromContact(-half, -toeMax, this._a0 || (this._a0 = {}));
    const a1 = ankleFromContact(half, heelMax, this._a1 || (this._a1 = {}));
    // Hermite curve whose end tangents match the ground speed: no pops at lift-off or strike.
    const m = (-2 * half / duty) * (1 - duty);
    const s2 = s * s;
    const s3 = s2 * s;
    out.z = (2 * s3 - 3 * s2 + 1) * a0.z + (s3 - 2 * s2 + s) * m + (-2 * s3 + 3 * s2) * a1.z + (s3 - s2) * m;
    out.y = lerp(a0.y, a1.y, smoothstep(0, 1, s)) + lift * Math.sin(Math.PI * Math.pow(s, 0.8));
    // Running: the heel kicks up behind before the knee drives forward.
    out.y += this.runW * 0.2 * Math.sin(Math.PI * Math.min(1, s * 1.5)) * (1 - s);
    out.pitch = lerp(-toeMax, heelMax, smoothstep(0, 0.8, s)) - this.runW * 0.5 * Math.sin(Math.PI * s);
    return out;
  }

  // Two-bone arm IK toward a point in chest space; writes the shoulder rotation.
  solveArm(arm, T, pole, qOut) {
    const S = arm.shoulder.position;
    const a = UPPER_ARM;
    const b = FOREARM_TO_GRIP;
    _d.subVectors(T, S);
    const dist = clamp(_d.length(), 0.05, a + b - 0.002);
    _d.normalize();
    const A = Math.acos(clamp((a * a + dist * dist - b * b) / (2 * a * dist), -1, 1));
    _perp.copy(pole).addScaledVector(_d, -pole.dot(_d)).normalize();
    _u.copy(_d).multiplyScalar(Math.cos(A)).addScaledVector(_perp, Math.sin(A));
    _e.copy(S).addScaledVector(_u, a);
    _f.subVectors(T, _e).normalize();
    _y.copy(_u).negate();
    _z.copy(_f).addScaledVector(_u, -_f.dot(_u));
    if (_z.lengthSq() < 1e-8) _z.set(0, 0, 1);
    _z.normalize();
    _x.crossVectors(_y, _z);
    _mb.makeBasis(_x, _y, _z);
    qOut.setFromRotationMatrix(_mb);
    return Math.acos(clamp(_u.dot(_f), -1, 1));
  }

  // state: { pos, yaw, vel, grounded, jumped, landed, landSpeed }
  update(dt, state) {
    this.time += dt;
    const t = this.time;
    const vel = state.vel;
    const hs = Math.hypot(vel.x, vel.z);
    this.speed = damp(this.speed, hs, 14, dt);
    const speed = this.speed;
    this.moveW = damp(this.moveW, smoothstep(0.06, 0.9, speed), 9, dt);
    this.runW = damp(this.runW, smoothstep(2.4, 4.9, speed), 5, dt);
    this.airW = damp(this.airW, state.grounded ? 0 : 1, state.grounded ? 16 : 13, dt);
    const moveW = this.moveW;
    const runW = this.runW;
    const airW = this.airW;

    // Heading, turn rate and forward acceleration drive lean and bank.
    const fx = Math.sin(state.yaw);
    const fz = Math.cos(state.yaw);
    if (this.prevYaw === null) this.prevYaw = state.yaw;
    const yr = wrapAngle(state.yaw - this.prevYaw) / Math.max(dt, 1e-4);
    this.prevYaw = state.yaw;
    this.yawRate = damp(this.yawRate, yr, 10, dt);
    const fwdSpeed = vel.x * fx + vel.z * fz;
    const accel = (fwdSpeed - this.prevFwdSpeed) / Math.max(dt, 1e-4);
    this.prevFwdSpeed = fwdSpeed;
    this.accel = damp(this.accel, clamp(accel, -20, 20), 7, dt);

    if (state.jumped) {
      this.airT = 0;
      this.squashV += 0.6;
    }
    if (!state.grounded) this.airT += dt;
    if (state.landed) {
      const impact = clamp(state.landSpeed, 0, 14);
      this.squashV -= impact * 0.42;
      // Resume the gait from a double-support pose.
      this.phase = runW > 0.5 ? 0.02 : 0.05;
    }
    // Landing squash: a damped spring on the hips.
    for (let i = 0; i < 4; i++) {
      const h = dt / 4;
      const k = 150;
      const c = 2 * Math.sqrt(k) * 0.55;
      this.squashV += (-k * this.squash - c * this.squashV) * h;
      this.squash += this.squashV * h;
    }
    this.squash = clamp(this.squash, -0.3, 0.1);

    if (state.grounded) this.phase = (this.phase + (speed * dt) / this.strideLength(speed)) % 1;
    const phase = this.phase;
    const TAU = Math.PI * 2;

    // Ground gait. Duty = share of the cycle each foot spends on the ground.
    const duty = lerp(0.6, 0.32, runW);
    const stride = this.strideLength(Math.max(speed, 0.2));
    const half = ((duty * stride) / 2) * moveW;
    const lift = lerp(0.09, 0.26, runW) * moveW;
    const tgt = this.ankle;
    const idleZ = [0.035, -0.03];
    for (let i = 0; i < 2; i++) {
      const p = (phase + i * 0.5) % 1;
      this.footTarget(p, duty, half, lift, tgt[i]);
      // Standing still, settle into a relaxed stance.
      tgt[i].z = lerp(idleZ[i], tgt[i].z, moveW);
      tgt[i].y = lerp(ANKLE_H, tgt[i].y, moveW);
      tgt[i].pitch *= moveW;
    }

    // Air pose: push off with straight legs, tuck at the top, reach for the ground on the way down.
    const vy = vel.y;
    const rise = clamp(vy / this.v0, -1.5, 1);
    let tuck = rise > 0 ? smoothstep(1.0, 0.2, rise) : 1 - smoothstep(0.0, 0.85, -rise) * 0.7;
    tuck *= smoothstep(0.02, 0.16, this.airT);
    const lead = clamp(runW * 0.8 + moveW * 0.3, 0, 1);
    const airZ = [0.06 + 0.2 * lead * tuck, -0.05 - 0.2 * lead * (0.5 + 0.5 * tuck)];
    const airDy = [0.845 - tuck * 0.44, 0.845 - tuck * 0.3];
    const airPitch = -0.45 * (1 - tuck) + 0.1 * tuck;

    // Hips: bob, sway, roll and twist with the stride. Walking dips at double support,
    // running compresses at mid-stance and floats between steps.
    const bobWalk = -0.028 * Math.cos(2 * TAU * (phase - (duty - 0.5) / 2));
    const bobRun = -0.05 * Math.cos(2 * TAU * (phase - duty / 2));
    const bob = lerp(bobWalk, bobRun, runW) * moveW;
    const breath = Math.sin(t * 1.7);
    const idleSway = Math.sin(t * 0.53) * 0.012 * (1 - moveW);
    let pelvisY = HIP_Y - 0.012 * moveW - 0.05 * runW + bob + this.squash * (1 - airW * 0.7);

    // Feet follow the ground under each foot on slopes.
    const groundHere = terrainHeight(state.pos.x, state.pos.z);
    const ankleWorld = [];
    for (let i = 0; i < 2; i++) {
      const sx = HIP_X * (i === 0 ? 1 : -1);
      const wx = state.pos.x + fz * sx + fx * tgt[i].z;
      const wz = state.pos.z - fx * sx + fz * tgt[i].z;
      ankleWorld.push(tgt[i].y + (terrainHeight(wx, wz) - groundHere) * (1 - airW));
    }
    // Lower the hips if a long stride would over-stretch a leg.
    for (let i = 0; i < 2; i++) {
      const dz = tgt[i].z;
      const maxY = ankleWorld[i] + Math.sqrt(Math.max(REACH * REACH - dz * dz, 0.01)) * 0.995 + HIP_DROP;
      pelvisY = Math.min(pelvisY, lerp(maxY, pelvisY, airW));
    }
    const hipY = pelvisY - HIP_DROP;

    this.pelvis.position.set(Math.sin(TAU * phase) * 0.018 * moveW * (1 - runW * 0.5) + idleSway, pelvisY, 0);
    const pelvisYaw = 0.1 * Math.sin(TAU * (phase - 0.25)) * moveW * (1 - airW);
    const pelvisRoll = 0.045 * Math.sin(TAU * phase) * moveW * (1 - airW) + idleSway * 1.5;
    this.pelvis.rotation.set(0, pelvisYaw, pelvisRoll);

    // Legs.
    for (let i = 0; i < 2; i++) {
      const leg = this.legs[i];
      const dz = lerp(tgt[i].z, airZ[i], airW);
      const dy = lerp(hipY - ankleWorld[i], airDy[i], airW);
      const pitch = lerp(tgt[i].pitch, airPitch, airW);
      const s = solveLeg(dz, dy, this.legState[i]);
      leg.hip.rotation.set(-s.hip, 0, 0.035 * leg.side);
      leg.knee.rotation.x = s.knee;
      leg.ankle.rotation.x = s.hip - s.knee - pitch;
    }

    // Upper body: lean into acceleration and speed, bank into turns.
    const leanTarget = clamp(this.accel * 0.013, -0.12, 0.2) + 0.035 * moveW + 0.13 * runW
      + (state.grounded ? 0 : 0.06 * rise) - this.squash * 1.5;
    this.lean = damp(this.lean, leanTarget, 8, dt);
    this.bank = damp(this.bank, clamp(this.yawRate * speed * 0.03, -0.22, 0.22), 6, dt);
    this.body.rotation.set(0, 0, -this.bank);
    this.spine.rotation.set(this.lean + breath * 0.012, -pelvisYaw * 1.5, -pelvisRoll * 0.7);
    this.chest.rotation.set(breath * 0.008, -pelvisYaw * 0.6, 0);
    const headYaw = -pelvisYaw * 0.9 + Math.sin(t * 0.23) * 0.1 * (1 - moveW);
    this.head.rotation.set(-this.lean * 0.7 + Math.sin(t * 0.31) * 0.02, headYaw, pelvisRoll * 0.4);
    this.neck.rotation.set(-this.lean * 0.25, 0, 0);

    // The hat lags a touch behind the head's bounce.
    const hatTarget = clamp(-this.squashV * 0.05 + bob * 0.6, -0.12, 0.12);
    this.hatTilt = damp(this.hatTilt, hatTarget, 12, dt);
    this.hat.rotation.set(0.05 + this.hatTilt, 0, 0);

    // Place the whole figure so the arms, sword and cape can work in world space.
    this.root.position.copy(state.pos);
    this.root.rotation.set(0, state.yaw, 0);
    this.groundY.value = groundHere;
    this.root.updateMatrixWorld(true);

    this.poseArms(dt, state, { phase, rise, lead, fwdSpeed, vy });
    this.root.updateMatrixWorld(true);
    this.placeSword(dt, phase, rise);

    // The brim's disc for the face shadow.
    _t.set(0, -0.01, 0).applyMatrix4(this.hat.matrixWorld);
    this.hatUniform.value.set(_t.x, _t.y, _t.z, 0.37);

    this.updateCape(dt, state);
  }

  poseArms(dt, state, g) {
    const { phase, rise, lead, fwdSpeed, vy } = g;
    const TAU = Math.PI * 2;
    const runW = this.runW;
    const airW = this.airW;
    const moveW = this.moveW;
    const landing = smoothstep(0.02, 0.12, -this.squash);
    // Left hand steadies the empty scabbard; the right carries the blade low at its side.
    this.holdW = damp(this.holdW, (1 - airW) * (1 - landing * 0.6), 6, dt);
    this.swordW = damp(this.swordW, (1 - airW) * (1 - runW * 0.7), 6, dt);
    const swingAmp = lerp(0.3, 0.85, runW) * moveW;
    const elbowBase = lerp(0.2, 1.35, runW);
    const up = rise > 0 ? 1 - smoothstep(0.3, 1.0, this.airT * 3.5) : 0;
    const fall = smoothstep(0.0, 0.8, -rise);

    // Chest-space targets for the two hand holds.
    this.spine.updateMatrix();
    this.chest.updateMatrix();
    this.saya.updateMatrix();
    _m.multiplyMatrices(this.spine.matrix, this.chest.matrix).invert();
    const sayaGrip = _t.set(0, 0.012, -0.06).applyMatrix4(this.saya.matrix).applyMatrix4(_m).clone();
    // Right hand: low at the side, swinging gently with the stride.
    const swing = Math.sin(TAU * (phase - 0.25)) * moveW;
    _grip.set(-0.27, 0.87 + 0.012 * Math.sin(2 * TAU * phase) * moveW, 0.1 + swing * 0.07);
    _m.multiplyMatrices(this.pelvis.matrix, this.spine.matrix).multiply(this.chest.matrix).invert();
    const swordGrip = _grip.clone().applyMatrix4(_m);

    for (let i = 0; i < 2; i++) {
      const arm = this.arms[i];
      const sgn = arm.side;
      const sw = Math.sin(TAU * (phase - 0.25)) * swingAmp * (i === 0 ? -1 : 1);
      let sx = sw + 0.04;
      let sz = 0.1 * sgn;
      let ex = -(elbowBase + Math.max(0, -sw) * 0.5);
      // Airborne: arms sweep up at take-off, open wide through the apex and
      // come forward again to meet the ground.
      const airSx = lerp(lerp(0.3, -0.85, up), -0.45, fall) + (i === 0 ? 0.12 : -0.08) * lead;
      const airSz = lerp(0.95, 0.55, fall) * sgn;
      const airEx = -lerp(lerp(0.35, 0.9, up), 0.6, fall);
      sx = lerp(sx, airSx, airW);
      sz = lerp(sz, airSz, airW);
      ex = lerp(ex, airEx, airW);
      // Landing: hands drop and reach forward to absorb the impact.
      sx += this.squash * 1.2;
      ex += this.squash * 1.5;
      _euler.set(sx, 0, sz);
      arm.shoulder.quaternion.setFromEuler(_euler);
      let bend = -ex;
      const w = i === 0 ? this.holdW : this.swordW;
      if (w > 0.001) {
        const pole = i === 0 ? _x.set(0.8, -0.25, -0.55) : _x.set(-0.85, -0.3, -0.45);
        const target = i === 0 ? sayaGrip : swordGrip;
        const b = this.solveArm(arm, target, pole.clone(), _q);
        arm.shoulder.quaternion.slerp(_q, w);
        bend = lerp(bend, b, w);
      }
      arm.elbow.rotation.set(-bend, 0, 0);
      arm.wrist.rotation.set(i === 0 ? -0.25 * this.holdW : 0.15, 0, 0);

      // Sleeve: hangs with gravity whatever the arm does, blown back by the air
      // rushing past (running, falling) and trailing a beat behind the arm.
      _q2.copy(this.body.quaternion).multiply(this.pelvis.quaternion).multiply(this.spine.quaternion)
        .multiply(this.chest.quaternion).multiply(arm.shoulder.quaternion).invert();
      _d.set(0, -9.8 - vy * 0.6, -fwdSpeed * 0.6 - this.accel * 0.3).normalize().applyQuaternion(_q2);
      _q.setFromUnitVectors(_down, _d);
      _q3.identity().slerp(_q, 0.8);
      arm.sleevePivot.quaternion.slerp(_q3, 1 - Math.exp(-11 * dt));
    }
  }

  // The katana rides in the right hand: blade low and forward while walking,
  // trailing behind in a run or a leap, swinging a beat behind the arm.
  placeSword(dt, phase, rise) {
    const arm = this.arms[1];
    _t.set(0, -0.06, 0.012).applyMatrix4(arm.wrist.matrixWorld);
    this.body.worldToLocal(_t);
    this.sword.position.copy(_t);
    const walkDir = _x.set(-0.3, -0.76, 0.58).normalize();
    const runDir = _y.set(-0.35, -0.55, -0.76).normalize();
    const airDir = _z.set(-0.45, lerp(-0.2, -0.75, smoothstep(0, 0.8, -rise)), -0.7).normalize();
    _swordDir.copy(walkDir).lerp(runDir, this.runW * 0.85).lerp(airDir, this.airW).normalize();
    // A pendulum lag on the blade's swing.
    const target = Math.sin(Math.PI * 2 * (phase - 0.25)) * 0.13 * this.moveW * (1 - this.airW);
    for (let i = 0; i < 3; i++) {
      const h = dt / 3;
      this.swordSwingV += ((target - this.swordSwing) * 120 - this.swordSwingV * 12) * h;
      this.swordSwing += this.swordSwingV * h;
    }
    _swordDir.applyAxisAngle(_e.set(1, 0, 0), -this.swordSwing).normalize();
    // Spine of the blade faces up and back; the edge leads.
    _y.copy(_up).addScaledVector(_swordDir, -_up.dot(_swordDir)).normalize();
    _x.crossVectors(_y, _swordDir);
    _mb.makeBasis(_x, _y, _swordDir);
    this.sword.quaternion.setFromRotationMatrix(_mb);
    this.sword.updateMatrixWorld(true);
  }

  updateCape(dt, state) {
    const C = this.colliders;
    const chest = this.chest.matrixWorld;
    const setS = (k, x, y, z, r, m) => {
      C.spheres[k][0].set(x, y, z).applyMatrix4(m);
      C.spheres[k][1] = r;
    };
    setS(0, 0.08, 0.04, -0.01, 0.15, chest);
    setS(1, -0.08, 0.04, -0.01, 0.15, chest);
    setS(2, 0.07, -0.2, -0.01, 0.145, chest);
    setS(3, -0.07, -0.2, -0.01, 0.145, chest);
    setS(4, 0, -0.05, -0.02, 0.24, this.pelvis.matrixWorld);
    C.spheres[5][0].setFromMatrixPosition(this.arms[0].shoulder.matrixWorld);
    C.spheres[5][1] = 0.09;
    C.spheres[6][0].setFromMatrixPosition(this.arms[1].shoulder.matrixWorld);
    C.spheres[6][1] = 0.09;
    setS(7, 0, 0.1, 0, 0.16, this.head.matrixWorld);
    for (let i = 0; i < 2; i++) {
      C.capsules[i][0].setFromMatrixPosition(this.arms[i].shoulder.matrixWorld);
      C.capsules[i][1].setFromMatrixPosition(this.arms[i].elbow.matrixWorld);
      C.capsules[i][2] = 0.1;
    }
    _back.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    this.cape.update(dt, chest, this.wind, C, _back);
  }
}
