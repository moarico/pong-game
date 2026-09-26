import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';
import { terrainHeight } from './terrain.js';
import { MOVE } from './config.js';

// ---------------------------------------------------------------------------
// Shading: soft cloth diffuse, GGX for lacquer and metal, and a strong rim of
// sunlight around the silhouette when the samurai stands against the sun.
// ---------------------------------------------------------------------------

const vert = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vLocal = position;
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
uniform float uGroundY;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vLocal;

vec3 envColor(vec3 r) {
  vec3 sky = hazeColor(r);
  vec3 up = mix(sky, vec3(0.06, 0.06, 0.12), smoothstep(0.05, 0.7, r.y));
  return mix(uAmbGround * 1.6, up, smoothstep(-0.25, 0.05, r.y));
}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = uSunDir;
  vec3 alb = uColor;

  if (uPattern == 1) {
    // Woven straw: radial reeds and concentric binding rings.
    float a = atan(vLocal.z, vLocal.x);
    float rr = length(vLocal.xz);
    float reeds = 0.5 + 0.5 * sin(a * 120.0 + rr * 8.0);
    float rings = smoothstep(0.75, 1.0, sin(rr * 95.0));
    alb *= 0.8 + 0.18 * reeds - 0.22 * rings;
  } else if (uPattern == 2) {
    // Hakama pinstripes.
    float a = atan(vLocal.z, vLocal.x);
    alb *= 0.88 + 0.12 * step(0.62, fract(a * 22.0 / TAU));
  } else if (uPattern == 3) {
    // Tsuka-ito: diamond wrap over pale rayskin.
    float a = atan(vLocal.y, vLocal.x) / TAU;
    float z = vLocal.z * 34.0;
    float d = abs(fract(z + a * 2.0) - 0.5) + abs(fract(z - a * 2.0) - 0.5);
    alb = mix(alb, vec3(0.62, 0.58, 0.5), smoothstep(0.62, 0.5, d) * 0.85);
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

  // The low sun behind the samurai paints a molten edge around the silhouette.
  float fres = pow(1.0 - NdV, 3.2);
  float back = pow(sat(dot(-V, L)), 1.6);
  float rim = fres * (0.12 + 2.6 * back) * sat(NdL + 0.6) * uRim;

  // Grass swallows the light around the legs.
  float grassOcc = smoothstep(0.08, 0.95, vWorld.y - uGroundY);
  vec3 sun = uSunColor * grassOcc;
  vec3 amb = mix(uAmbGround, uAmbSky, 0.5 + 0.5 * N.y) * mix(0.45, 1.0, grassOcc);

  vec3 R = reflect(-V, N);
  vec3 env = envColor(R) * mix(F0, 1.0, pow(1.0 - NdV, 5.0)) * (1.0 - uRough) * (1.0 - uRough);

  vec3 col = alb * (1.0 - uMetal) * (diff * sun + amb);
  col += specCol * spec * sun;
  col += specCol * env * mix(0.25, 1.0, uMetal);
  col += uSunColor * rim * grassOcc * mix(vec3(1.0), alb * 1.5 + 0.25, 0.35);
  // Thin cloth and straw glow when the sun shines through them.
  float thru = pow(sat(dot(-V, L)), 2.5) * (0.35 + 0.65 * sat(-NdL + 0.3));
  col += alb * uSunColor * thru * uTrans * grassOcc;
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

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

// Box with rounded edges and analytic normals (a soft, padded look for cloth).
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
  const g = roundedBox(0.07, 0.42, 0.26, 0.03);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = clamp((0.21 - y) / 0.42, 0, 1);
    p.setX(i, p.getX(i) * (0.75 + 0.25 * t) + 0.012 * side);
    p.setZ(i, p.getZ(i) * (0.5 + 0.5 * Math.pow(t, 0.7)) - 0.035 * t);
    p.setY(i, y - 0.18);
  }
  g.computeVertexNormals();
  return g;
}

function lathe(points, segs, sx = 1, sz = 1) {
  const g = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segs);
  if (sx !== 1 || sz !== 1) g.scale(sx, 1, sz);
  return g;
}

// A slightly curved scabbard or hilt along -Z (from the guard backwards).
function bentBar(length, w, h, bend, segs = 12) {
  const g = new THREE.BoxGeometry(w, h, length, 1, 1, segs);
  g.translate(0, 0, -length / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    const t = -z / length;
    p.setY(i, p.getY(i) + bend * t * t);
  }
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------
// Cloth: two sash tails simulated with Verlet integration.
// ---------------------------------------------------------------------------

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();

class Ribbon {
  constructor(material, n, length, width) {
    this.n = n;
    this.seg = length / (n - 1);
    this.width = width;
    this.time = 0;
    this.phase = Math.random() * 6.28;
    this.flapDir = new THREE.Vector3(0, 0, 1);
    this.p = Array.from({ length: n }, () => new THREE.Vector3());
    this.q = Array.from({ length: n }, () => new THREE.Vector3());
    this.acc = 0;
    const g = new THREE.BufferGeometry();
    this.posArr = new Float32Array(n * 2 * 3);
    this.nrmArr = new Float32Array(n * 2 * 3);
    g.setAttribute('position', new THREE.BufferAttribute(this.posArr, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(this.nrmArr, 3).setUsage(THREE.DynamicDrawUsage));
    const idx = [];
    for (let i = 0; i < n - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    g.setIndex(idx);
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = false;
    this.mesh.layers.enable(1);
  }

  reset(anchor, back) {
    for (let i = 0; i < this.n; i++) {
      this.p[i].copy(anchor).addScaledVector(back, 0.02 * i);
      this.p[i].y -= this.seg * i;
      this.q[i].copy(this.p[i]);
    }
  }

  // collide(p) pushes a point out of the body.
  update(dt, anchor, wind, collide, back) {
    const h = 1 / 120;
    this.flapDir.copy(back);
    this.acc = Math.min(this.acc + dt, 0.1);
    while (this.acc >= h) {
      this.acc -= h;
      this.time += h;
      for (let i = 1; i < this.n; i++) {
        const p = this.p[i];
        const q = this.q[i];
        const vx = (p.x - q.x) * 0.995;
        const vy = (p.y - q.y) * 0.995;
        const vz = (p.z - q.z) * 0.995;
        wind.velocityAt(p.x, p.y, p.z, _w);
        // Drag toward the moving air: the tail streams downwind and flutters in gusts.
        const drag = 3.0 + i * 0.2;
        // Flutter: a wave running down the tail, like a pennant in the wind.
        const ws = Math.hypot(_w.x, _w.z);
        const flap = Math.sin(this.time * (8 + ws * 1.8) - i * 0.9 + this.phase) * ws * (0.5 + 0.2 * i);
        const ax = drag * (_w.x - vx / h) + this.flapDir.x * flap;
        const ay = -9.8 + drag * (_w.y - vy / h) + flap * 0.35;
        const az = drag * (_w.z - vz / h) + this.flapDir.z * flap;
        q.copy(p);
        p.x += vx + ax * h * h;
        p.y += vy + ay * h * h;
        p.z += vz + az * h * h;
      }
      this.p[0].copy(anchor);
      this.q[0].copy(anchor);
      for (let it = 0; it < 4; it++) {
        for (let i = 0; i < this.n - 1; i++) {
          const a = this.p[i];
          const b = this.p[i + 1];
          _v.subVectors(b, a);
          const len = _v.length() || 1e-6;
          const diff = (len - this.seg) / len;
          if (i === 0) {
            b.addScaledVector(_v, -diff);
          } else {
            a.addScaledVector(_v, diff * 0.5);
            b.addScaledVector(_v, -diff * 0.5);
          }
        }
        for (let i = 1; i < this.n; i++) collide(this.p[i]);
      }
    }
  }

  updateGeometry(side) {
    const n = this.n;
    for (let i = 0; i < n; i++) {
      const prev = this.p[Math.max(0, i - 1)];
      const next = this.p[Math.min(n - 1, i + 1)];
      _v.subVectors(next, prev).normalize();
      // Keep the ribbon flat across the samurai's back, perpendicular to its length.
      _w.copy(side).addScaledVector(_v, -side.dot(_v)).normalize();
      const taper = 1 - 0.25 * (i / (n - 1));
      const hw = this.width * 0.5 * taper;
      const p = this.p[i];
      const o = i * 6;
      this.posArr[o] = p.x - _w.x * hw;
      this.posArr[o + 1] = p.y - _w.y * hw;
      this.posArr[o + 2] = p.z - _w.z * hw;
      this.posArr[o + 3] = p.x + _w.x * hw;
      this.posArr[o + 4] = p.y + _w.y * hw;
      this.posArr[o + 5] = p.z + _w.z * hw;
      const nx = _w.y * _v.z - _w.z * _v.y;
      const ny = _w.z * _v.x - _w.x * _v.z;
      const nz = _w.x * _v.y - _w.y * _v.x;
      this.nrmArr[o] = this.nrmArr[o + 3] = nx;
      this.nrmArr[o + 1] = this.nrmArr[o + 4] = ny;
      this.nrmArr[o + 2] = this.nrmArr[o + 5] = nz;
    }
    const g = this.mesh.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.normal.needsUpdate = true;
    g.computeBoundingSphere();
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

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// Frame-rate independent exponential smoothing.
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

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

export class Samurai {
  constructor(shared, wind) {
    this.shared = shared;
    this.wind = wind;
    this.groundY = { value: 0 };
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
    this.holdBend = 1;
    this.time = 0;
    this.legState = [{}, {}];
    this.ankle = [{ z: 0, y: 0, pitch: 0 }, { z: 0, y: 0, pitch: 0 }];
    this.ribbonsReady = false;
    this.v0 = Math.sqrt(2 * MOVE.gravity * MOVE.jumpHeight);
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
        uGroundY: this.groundY,
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: o.side ?? THREE.FrontSide,
    });
    return {
      kimono: make('#27324a', { rough: 0.9, trans: 0.12 }),
      sleeve: make('#27324a', { rough: 0.9, trans: 0.2 }),
      under: make('#3a4660', { rough: 0.9, side: THREE.DoubleSide }),
      collar: make('#d8d0c0', { rough: 0.8 }),
      hakama: make('#3a3434', { rough: 0.92, pattern: 2, side: THREE.DoubleSide }),
      obi: make('#7c2323', { rough: 0.75 }),
      sash: make('#701b1b', { rough: 0.8, side: THREE.DoubleSide, rim: 0.08, trans: 1.6 }),
      skin: make('#c49474', { rough: 0.6, rim: 0.8 }),
      hair: make('#141212', { rough: 0.5 }),
      mask: make('#1c2233', { rough: 0.9 }),
      hat: make('#b89660', { rough: 0.85, pattern: 1, rim: 1.2, trans: 0.3, side: THREE.DoubleSide }),
      lacquer: make('#110f10', { rough: 0.22, rim: 0.6 }),
      wrap: make('#1d1917', { rough: 0.7, pattern: 3 }),
      metal: make('#a07c3c', { rough: 0.3, metal: 1, rim: 0.4 }),
      tabi: make('#d2cbbb', { rough: 0.85 }),
      straw: make('#a2854f', { rough: 0.9 }),
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

    // Torso in a kimono and haori.
    this.spine = new THREE.Group();
    this.spine.position.y = 0.06;
    this.pelvis.add(this.spine);
    this.add(this.spine, lathe([
      [0.001, -0.03], [0.148, -0.03], [0.152, 0.05], [0.158, 0.15], [0.17, 0.26], [0.176, 0.34],
      [0.172, 0.4], [0.155, 0.45], [0.12, 0.49], [0.06, 0.515], [0.001, 0.52],
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
    // Cloth mask over the lower face, and eyes in the shadow of the brim.
    const maskGeo = new THREE.SphereGeometry(0.104, 24, 10, Math.PI / 2 - 1.15, 2.3, 1.62, 0.95);
    maskGeo.scale(0.92, 1.05, 1.03);
    this.add(this.head, maskGeo, M.mask, 0, 0.1, 0);
    const eyeGeo = new THREE.SphereGeometry(0.011, 8, 6);
    eyeGeo.scale(1.3, 0.7, 0.6);
    this.add(this.head, eyeGeo, M.eye, 0.033, 0.112, 0.088);
    this.add(this.head, eyeGeo, M.eye, -0.033, 0.112, 0.088);

    // Kasa: a shallow woven straw hat.
    this.hat = new THREE.Group();
    this.hat.position.set(0, 0.133, 0);
    this.head.add(this.hat);
    this.add(this.hat, lathe([
      [0.0, 0.135], [0.03, 0.132], [0.08, 0.112], [0.15, 0.078], [0.22, 0.046], [0.29, 0.016],
      [0.335, -0.002], [0.347, -0.011], [0.343, -0.018], [0.33, -0.013], [0.26, 0.012],
      [0.17, 0.05], [0.09, 0.085], [0.03, 0.1], [0.0, 0.102],
    ], 56), M.hat);
    this.add(this.hat, new THREE.CylinderGeometry(0.02, 0.028, 0.03, 10), M.metal, 0, 0.145, 0);
    // Chin cords.
    const cord = new THREE.CylinderGeometry(0.0035, 0.0035, 0.2, 5);
    cord.translate(0, -0.1, 0);
    this.add(this.hat, cord, M.straw, 0.075, 0.0, 0.03).rotation.set(0.25, 0, 0.35);
    this.add(this.hat, cord, M.straw, -0.075, 0.0, 0.03).rotation.set(0.25, 0, -0.35);

    this.arms = [this.buildArm(1), this.buildArm(-1)];

    // Sash tails from the knot, streaming in the wind.
    this.ribbons = [
      new Ribbon(M.sash, 10, 0.64, 0.042),
      new Ribbon(M.sash, 9, 0.52, 0.038),
    ];
    this.ribbonGroup = new THREE.Group();
    for (const r of this.ribbons) this.ribbonGroup.add(r.mesh);
    this.knotAnchors = [new THREE.Vector3(0.026, 0.09, -0.16), new THREE.Vector3(-0.022, 0.085, -0.16)];
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
    // Kimono sleeve: a deep, soft pocket hanging from the upper arm. It has its own
    // pivot so it can swing a beat behind the arm.
    const sleevePivot = new THREE.Group();
    shoulder.add(sleevePivot);
    const sleeve = drapedSleeve(side);
    this.add(sleevePivot, sleeve, M.sleeve);
    const elbow = new THREE.Group();
    elbow.position.y = -0.28;
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

  // Two-bone IK that lays the left hand on the katana's hilt. Works in chest space.
  solveHold(arm, qOut) {
    this.spine.updateMatrix();
    this.chest.updateMatrix();
    this.katana.updateMatrix();
    _m.multiplyMatrices(this.spine.matrix, this.chest.matrix).invert();
    const T = _t.set(0, 0.012, 0.075).applyMatrix4(this.katana.matrix).applyMatrix4(_m);
    const S = arm.shoulder.position;
    const a = 0.28;
    const b = 0.3;
    _d.subVectors(T, S);
    const dist = clamp(_d.length(), 0.05, a + b - 0.002);
    _d.normalize();
    const A = Math.acos(clamp((a * a + dist * dist - b * b) / (2 * a * dist), -1, 1));
    _perp.set(0.8 * arm.side, -0.25, -0.55);
    _perp.addScaledVector(_d, -_perp.dot(_d)).normalize();
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
    this.holdBend = Math.acos(clamp(_u.dot(_f), -1, 1));
  }

  buildSwords() {
    const M = this.mats;
    const sword = (len, hilt, bend) => {
      const g = new THREE.Group();
      this.add(g, bentBar(len, 0.032, 0.022, bend), M.lacquer);
      const tip = new THREE.BoxGeometry(0.034, 0.024, 0.03);
      this.add(g, tip, M.metal, 0, bend, -len - 0.01);
      const tsuba = new THREE.CylinderGeometry(0.038, 0.038, 0.007, 20);
      tsuba.rotateX(Math.PI / 2);
      this.add(g, tsuba, M.metal, 0, 0, 0.004);
      const tsuka = new THREE.CylinderGeometry(0.0165, 0.0155, hilt, 14);
      tsuka.rotateX(Math.PI / 2);
      tsuka.translate(0, 0, hilt / 2 + 0.008);
      this.add(g, tsuka, M.wrap);
      const cap = new THREE.CylinderGeometry(0.0175, 0.017, 0.018, 12);
      cap.rotateX(Math.PI / 2);
      this.add(g, cap, M.metal, 0, -0.003, hilt + 0.012);
      return g;
    };
    // Daisho thrust through the obi on the left hip, hilts forward.
    this.katana = sword(0.74, 0.25, -0.035);
    this.katana.position.set(0.14, 0.11, 0.12);
    this.katana.rotation.set(-0.5, -0.35, 0.25);
    this.pelvis.add(this.katana);
    this.wakizashi = sword(0.5, 0.18, -0.022);
    this.wakizashi.position.set(0.1, 0.12, 0.14);
    this.wakizashi.rotation.set(-0.4, -0.45, 0.3);
    this.pelvis.add(this.wakizashi);
  }

  addTo(scene) {
    scene.add(this.root);
    scene.add(this.ribbonGroup);
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
    const a = (fwdSpeed - this.prevFwdSpeed) / Math.max(dt, 1e-4);
    this.prevFwdSpeed = fwdSpeed;
    this.accel = damp(this.accel, clamp(a, -20, 20), 7, dt);

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
    const sub = 4;
    for (let i = 0; i < sub; i++) {
      const h = dt / sub;
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
    const half = (duty * stride) / 2 * moveW;
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
      const off = (terrainHeight(wx, wz) - groundHere) * (1 - airW);
      ankleWorld.push(tgt[i].y + off);
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
      const dzG = tgt[i].z;
      const dyG = hipY - ankleWorld[i];
      const dz = lerp(dzG, airZ[i], airW);
      const dy = lerp(dyG, airDy[i], airW);
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
    this.hat.rotation.set(0.07 + this.hatTilt, 0, 0);

    // Arms swing against the legs; the left hand rests on the katana while walking.
    const landing = smoothstep(0.02, 0.12, -this.squash);
    this.holdW = damp(this.holdW, (1 - runW) * (1 - airW) * (1 - landing), 6, dt);
    const swingAmp = lerp(0.3, 0.85, runW) * moveW;
    const elbowBase = lerp(0.2, 1.35, runW);
    const up = rise > 0 ? 1 - smoothstep(0.3, 1.0, this.airT * 3.5) : 0;
    for (let i = 0; i < 2; i++) {
      const arm = this.arms[i];
      const sgn = arm.side;
      const sw = Math.sin(TAU * (phase - 0.25)) * swingAmp * (i === 0 ? -1 : 1);
      let sx = sw + 0.04;
      let sz = 0.1 * sgn;
      let ex = -(elbowBase + Math.max(0, -sw) * 0.5);
      // Airborne: arms sweep up at take-off, open wide through the apex and
      // come forward again to meet the ground.
      const fall = smoothstep(0.0, 0.8, -rise);
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
      if (i === 0 && this.holdW > 0.001) {
        this.solveHold(arm, _q);
        arm.shoulder.quaternion.slerp(_q, this.holdW);
        bend = lerp(bend, this.holdBend, this.holdW);
      }
      arm.elbow.rotation.set(-bend, 0, 0);
      arm.wrist.rotation.set(i === 0 ? -0.25 * this.holdW : 0.1, 0, 0);

      // Sleeve: hangs with gravity whatever the arm does, blown back by the air
      // rushing past (running, falling) and trailing a beat behind the arm.
      _q2.copy(this.body.quaternion).multiply(this.pelvis.quaternion).multiply(this.spine.quaternion)
        .multiply(this.chest.quaternion).multiply(arm.shoulder.quaternion).invert();
      _d.set(0, -9.8 - vy * 0.6, -fwdSpeed * 0.6 - this.accel * 0.3).normalize().applyQuaternion(_q2);
      _q.setFromUnitVectors(_down, _d);
      _q3.identity().slerp(_q, 0.8);
      arm.sleevePivot.quaternion.slerp(_q3, 1 - Math.exp(-11 * dt));
    }

    // Place the whole figure.
    this.root.position.copy(state.pos);
    this.root.rotation.set(0, state.yaw, 0);
    this.groundY.value = groundHere;
    this.root.updateMatrixWorld(true);

    this.updateRibbons(dt, state);
  }

  updateRibbons(dt, state) {
    const side = _side.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
    const back = _back.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    const center = _center.setFromMatrixPosition(this.pelvis.matrixWorld);
    const yaw = state.yaw;
    const collide = (p) => {
      // Elliptical cone around the hakama: the tails fall over it instead of through it.
      const dx = p.x - center.x;
      const dz = p.z - center.z;
      const lx = dx * Math.cos(yaw) - dz * Math.sin(yaw);
      const lz = dx * Math.sin(yaw) + dz * Math.cos(yaw);
      const drop = center.y + 0.15 - p.y;
      if (drop < 0 || drop > 0.95) return;
      const rx = 0.2 + drop * 0.16;
      const rz = 0.17 + drop * 0.12;
      const e = (lx / rx) ** 2 + (lz / rz) ** 2;
      if (e < 1) {
        const k = 1 / Math.sqrt(e) - 1;
        const nlx = lx * (1 + k);
        const nlz = lz * (1 + k);
        p.x = center.x + nlx * Math.cos(yaw) + nlz * Math.sin(yaw);
        p.z = center.z - nlx * Math.sin(yaw) + nlz * Math.cos(yaw);
      }
    };
    for (let i = 0; i < this.ribbons.length; i++) {
      const anchor = _anchor.copy(this.knotAnchors[i]).applyMatrix4(this.pelvis.matrixWorld);
      const r = this.ribbons[i];
      if (!this.ribbonsReady) r.reset(anchor, back);
      r.update(dt, anchor, this.wind, collide, back);
      r.updateGeometry(side);
    }
    this.ribbonsReady = true;
  }
}

const _euler = new THREE.Euler();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _q3 = new THREE.Quaternion();
const _down = new THREE.Vector3(0, -1, 0);
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
const _side = new THREE.Vector3();
const _back = new THREE.Vector3();
const _center = new THREE.Vector3();
const _anchor = new THREE.Vector3();
