import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';
import { mulberry32 } from './noise.js';

// ---------------------------------------------------------------------------
// Effects for the boss arenas: sprite particles (flame, smoke, embers, steam,
// crystal shards, bubbles, rain splashes), glowing telegraphs painted on the
// floor before a blow lands, and forked lightning. All HDR; none of it touches
// the alpha channel, which the light shafts read as their occlusion mask.
// ---------------------------------------------------------------------------

const keepAlpha = {
  transparent: true,
  depthWrite: false,
  blendEquationAlpha: THREE.AddEquation,
  blendSrcAlpha: THREE.ZeroFactor,
  blendDstAlpha: THREE.OneFactor,
};

export const additive = {
  ...keepAlpha,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
};

export const alphaBlend = {
  ...keepAlpha,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
};

// Particle kinds (the sprite's look).
export const PK = { soft: 0, flame: 1, smoke: 2, ember: 3, shard: 4, bubble: 5, streak: 6 };

const partVert = /* glsl */ `
${common}
${sharedUniforms}
attribute vec4 aCol;
attribute vec4 aInfo; // size, kind, seed, spin
uniform float uPointScale;
varying vec4 vCol;
varying vec4 vInfo;
varying vec3 vWorld;
void main() {
  vCol = aCol;
  vInfo = aInfo;
  vWorld = position;
  vec4 mv = viewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aCol.a > 0.0 ? clamp(aInfo.x * uPointScale / max(-mv.z, 0.1), 1.0, 256.0) : 0.0;
}
`;

const partFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
uniform float uLit;
varying vec4 vCol;
varying vec4 vInfo;
varying vec3 vWorld;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  c.y = -c.y;
  int kind = int(vInfo.y + 0.5);
  float seed = vInfo.z;
  float spin = vInfo.w;
  float cs = cos(spin);
  float sn = sin(spin);
  vec2 r = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
  float a = 0.0;
  vec3 col = vCol.rgb;
  if (kind == 0) {
    float d = dot(c, c);
    a = exp(-d * 3.5) * (1.0 - smoothstep(0.8, 1.0, d));
  } else if (kind == 1) {
    // A tongue of flame: a teardrop licked by noise, hot at the root.
    vec2 q = vec2(c.x * (1.25 + 0.35 * c.y), c.y);
    float n = vnoise(q * 2.3 + vec2(seed * 17.0, -uTime * 3.0 - seed * 5.0)) * 0.6 + vnoise(q * 5.1 + vec2(seed * 3.0, -uTime * 5.0)) * 0.4;
    float body = 1.0 - smoothstep(0.35, 0.95, length(vec2(q.x, (q.y + 0.25) * 0.75)) + (n - 0.5) * 0.7);
    a = body;
    col *= mix(1.0, 1.8, smoothstep(0.5, 0.0, length(q + vec2(0.0, 0.35))));
  } else if (kind == 2) {
    // A lit puff of smoke or steam.
    float n = vnoise(r * 2.1 + seed * 13.0) * 0.6 + vnoise(r * 4.7 + seed * 7.0) * 0.4;
    float d = length(c) + (n - 0.5) * 0.55;
    a = 1.0 - smoothstep(0.2, 0.95, d);
    col *= 0.75 + 0.5 * n;
    // Lit from the key light above and a little from the side.
    col = col * (uAmbSky * 3.5 + uSunColor * 0.22 * sat(0.5 + 0.5 * c.y)) * uLit + col * (1.0 - uLit);
  } else if (kind == 3) {
    float d = dot(c, c);
    a = exp(-d * 9.0);
  } else if (kind == 4) {
    // A splinter of crystal: a thin diamond that glints as it tumbles.
    float d = abs(r.x) * 2.6 + abs(r.y);
    a = 1.0 - smoothstep(0.75, 0.95, d);
    col *= 0.6 + 0.9 * pow(sat(sin(spin * 3.0 + seed * 20.0)), 8.0) + 0.4 * (1.0 - d);
  } else if (kind == 5) {
    float d = length(c);
    a = smoothstep(0.55, 0.8, d) * (1.0 - smoothstep(0.85, 1.0, d)) + (1.0 - smoothstep(0.0, 0.3, length(c - vec2(-0.3, 0.35)))) * 0.8;
  } else {
    // A streak along the point's own axis.
    a = exp(-r.x * r.x * 60.0) * (1.0 - smoothstep(0.6, 1.0, abs(r.y)));
  }
  a *= vCol.a;
  if (a < 0.003) discard;
  gl_FragColor = vec4(col * a, a);
}
`;

// A pool of sprite particles simulated on the CPU.
export class Particles {
  constructor(shared, { count = 600, blend = 'add', lit = 0, order = 32 } = {}) {
    this.count = count;
    this.p = new Float32Array(count * 3);
    this.v = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    this.max = new Float32Array(count);
    this.size = new Float32Array(count * 2); // start, end
    this.c0 = new Float32Array(count * 4);
    this.c1 = new Float32Array(count * 4);
    this.phys = new Float32Array(count * 4); // drag, gravity, spin rate, floor bounce
    this.col = new Float32Array(count * 4);
    this.info = new Float32Array(count * 4);
    this.next = 0;
    this.rand = mulberry32(99 + count);
    this.floor = -1e9;
    const g = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage);
    this.colAttr = new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage);
    this.infoAttr = new THREE.BufferAttribute(this.info, 4).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('aCol', this.colAttr);
    g.setAttribute('aInfo', this.infoAttr);
    this.material = new THREE.ShaderMaterial({
      uniforms: { ...shared, uPointScale: { value: 800 }, uLit: { value: lit } },
      vertexShader: partVert,
      fragmentShader: partFrag,
      ...(blend === 'add' ? additive : alphaBlend),
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = order;
    this.alive = 0;
  }

  // o: { vel:[x,y,z], life, size:[a,b], color:[r,g,b,a], color1:[r,g,b,a], drag, gravity, spin, kind, bounce }
  emit(x, y, z, o) {
    const i = this.next;
    this.next = (this.next + 1) % this.count;
    const r = this.rand;
    this.p[i * 3] = x;
    this.p[i * 3 + 1] = y;
    this.p[i * 3 + 2] = z;
    const v = o.vel || [0, 0, 0];
    this.v[i * 3] = v[0];
    this.v[i * 3 + 1] = v[1];
    this.v[i * 3 + 2] = v[2];
    const life = o.life ?? 1;
    this.life[i] = life;
    this.max[i] = life;
    const s = o.size || [0.3, 0.3];
    this.size[i * 2] = s[0];
    this.size[i * 2 + 1] = s[1];
    const c0 = o.color || [1, 1, 1, 1];
    const c1 = o.color1 || c0;
    this.c0.set(c0.length === 4 ? c0 : [...c0, 1], i * 4);
    this.c1.set(c1.length === 4 ? c1 : [...c1, 1], i * 4);
    this.phys[i * 4] = o.drag ?? 0.5;
    this.phys[i * 4 + 1] = o.gravity ?? 0;
    this.phys[i * 4 + 2] = (o.spin ?? 0) * (r() < 0.5 ? -1 : 1);
    this.phys[i * 4 + 3] = o.bounce ?? -1;
    this.info[i * 4 + 1] = o.kind ?? PK.soft;
    this.info[i * 4 + 2] = r();
    this.info[i * 4 + 3] = r() * 6.283;
  }

  // Many at once, scattered: o.spread (m) around the point, o.speed jitter.
  burst(x, y, z, n, o, jitter = 0.3, speedJ = 0.4) {
    const r = this.rand;
    const v = o.vel || [0, 0, 0];
    const vv = [0, 0, 0];
    for (let k = 0; k < n; k++) {
      const s = 1 + (r() - 0.5) * 2 * speedJ;
      vv[0] = v[0] * s + (r() - 0.5) * 2 * (o.scatter ?? 1);
      vv[1] = v[1] * s + (r() - 0.5) * 2 * (o.scatter ?? 1) * (o.scatterY ?? 1);
      vv[2] = v[2] * s + (r() - 0.5) * 2 * (o.scatter ?? 1);
      const life = (o.life ?? 1) * (0.7 + r() * 0.6);
      this.emit(x + (r() - 0.5) * 2 * jitter, y + (r() - 0.5) * 2 * jitter * (o.jitterY ?? 1), z + (r() - 0.5) * 2 * jitter, { ...o, vel: vv, life });
    }
  }

  clear() {
    this.life.fill(0);
    this.col.fill(0);
    this.colAttr.needsUpdate = true;
  }

  update(dt, camera, renderHeight) {
    let alive = 0;
    for (let i = 0; i < this.count; i++) {
      const L = this.life[i];
      if (L <= 0) {
        if (this.col[i * 4 + 3] !== 0) this.col[i * 4 + 3] = 0;
        continue;
      }
      alive++;
      const nl = L - dt;
      this.life[i] = nl;
      const o = i * 3;
      const drag = Math.exp(-this.phys[i * 4] * dt);
      this.v[o] *= drag;
      this.v[o + 1] = this.v[o + 1] * drag - this.phys[i * 4 + 1] * dt;
      this.v[o + 2] *= drag;
      this.p[o] += this.v[o] * dt;
      this.p[o + 1] += this.v[o + 1] * dt;
      this.p[o + 2] += this.v[o + 2] * dt;
      const b = this.phys[i * 4 + 3];
      if (b >= 0 && this.p[o + 1] < this.floor) {
        this.p[o + 1] = this.floor;
        this.v[o + 1] = -this.v[o + 1] * b;
        this.v[o] *= 0.6;
        this.v[o + 2] *= 0.6;
      }
      this.info[i * 4 + 3] += this.phys[i * 4 + 2] * dt;
      const t = 1 - Math.max(nl, 0) / this.max[i];
      this.info[i * 4] = this.size[i * 2] + (this.size[i * 2 + 1] - this.size[i * 2]) * t;
      // Fade in quickly, out gently.
      const fade = Math.min(1, t * 8) * (1 - t * t);
      for (let c = 0; c < 4; c++) {
        const a = this.c0[i * 4 + c];
        this.col[i * 4 + c] = a + (this.c1[i * 4 + c] - a) * t;
      }
      this.col[i * 4 + 3] *= fade;
      if (nl <= 0) this.col[i * 4 + 3] = 0;
    }
    this.alive = alive;
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
    this.infoAttr.needsUpdate = true;
    this.material.uniforms.uPointScale.value = renderHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  }
}

// ---------------------------------------------------------------------------
// Telegraphs: shapes of light on the floor where a blow is about to land. They
// fill as the moment approaches and flash when it comes.
// ---------------------------------------------------------------------------

export const SHAPE = { circle: 0, ring: 1, rect: 2, sector: 3 };

const decalVert = /* glsl */ `
attribute vec4 aXf; // x, y, z, rotation about y
attribute vec2 aSize; // half extents (x across, z along)
attribute vec4 aShape; // shape, progress 0..1, alpha, param
attribute vec3 aCol;
varying vec2 vP;
varying vec4 vShape;
varying vec3 vCol;
varying vec2 vSize;
void main() {
  vP = position.xy;
  vShape = aShape;
  vCol = aCol;
  vSize = aSize;
  float c = cos(aXf.w);
  float s = sin(aXf.w);
  vec2 l = position.xy * aSize;
  vec3 w = vec3(aXf.x + l.x * c + l.y * s, aXf.y, aXf.z - l.x * s + l.y * c);
  gl_Position = aShape.z > 0.0 ? projectionMatrix * viewMatrix * vec4(w, 1.0) : vec4(0.0, 0.0, 2.0, 1.0);
}
`;

const decalFrag = /* glsl */ `
uniform float uTime;
varying vec2 vP;
varying vec4 vShape;
varying vec3 vCol;
varying vec2 vSize;
void main() {
  int shape = int(vShape.x + 0.5);
  float prog = vShape.y;
  float alpha = vShape.z;
  float param = vShape.w;
  float inside = 0.0;
  float edge = 0.0;
  float fill = 0.0;
  if (shape == 0) {
    float r = length(vP);
    float aa = fwidth(r) * 1.5;
    inside = 1.0 - smoothstep(1.0 - aa, 1.0, r);
    edge = smoothstep(0.9 - aa, 0.96, r) * inside;
    fill = (1.0 - smoothstep(prog - aa, prog, r)) * inside;
  } else if (shape == 1) {
    float r = length(vP);
    float aa = fwidth(r) * 1.5;
    inside = smoothstep(param - aa, param, r) * (1.0 - smoothstep(1.0 - aa, 1.0, r));
    edge = inside * (1.0 - smoothstep(0.0, 0.06 / max(1.0 - param, 0.05), min(r - param, 1.0 - r) / max(1.0 - param, 0.05)));
    fill = inside * prog;
  } else if (shape == 2) {
    vec2 q = abs(vP);
    vec2 aa = fwidth(vP) * 1.5;
    inside = (1.0 - smoothstep(1.0 - aa.x, 1.0, q.x)) * (1.0 - smoothstep(1.0 - aa.y, 1.0, q.y));
    float ex = smoothstep(1.0 - 0.12 / vSize.x - aa.x, 1.0 - 0.06 / vSize.x, q.x);
    float ez = smoothstep(1.0 - 0.12 / vSize.y - aa.y, 1.0 - 0.06 / vSize.y, q.y);
    edge = max(ex, ez) * inside;
    // Fills from the source end (z = -1) toward the far end.
    fill = (1.0 - smoothstep(prog * 2.0 - 1.0 - aa.y, prog * 2.0 - 1.0, vP.y)) * inside;
  } else {
    // A sector (cone) opening along +z with half-angle param.
    float r = length(vP);
    float ang = atan(abs(vP.x), vP.y);
    float aa = fwidth(r) * 1.5;
    float aaa = fwidth(ang) * 1.5;
    inside = (1.0 - smoothstep(1.0 - aa, 1.0, r)) * (1.0 - smoothstep(param - aaa, param, ang));
    edge = max(smoothstep(0.93, 0.98, r), smoothstep(param - 0.06, param - 0.02, ang)) * inside;
    fill = (1.0 - smoothstep(prog - aa, prog, r)) * inside;
  }
  if (inside <= 0.001) discard;
  float pulse = 0.75 + 0.25 * sin(uTime * 18.0);
  float strength = inside * 0.12 + fill * 0.35 + edge * (0.9 * pulse) + step(0.999, prog) * inside * 0.5;
  gl_FragColor = vec4(vCol * strength * alpha, 0.0);
}
`;

export class Telegraphs {
  constructor(count = 32) {
    this.count = count;
    const base = new THREE.PlaneGeometry(2, 2);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute('position', base.attributes.position);
    this.xf = new Float32Array(count * 4);
    this.sz = new Float32Array(count * 2);
    this.sh = new Float32Array(count * 4);
    this.cl = new Float32Array(count * 3);
    this.aXf = new THREE.InstancedBufferAttribute(this.xf, 4).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.InstancedBufferAttribute(this.sz, 2).setUsage(THREE.DynamicDrawUsage);
    this.aShape = new THREE.InstancedBufferAttribute(this.sh, 4).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.InstancedBufferAttribute(this.cl, 3).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aXf', this.aXf);
    g.setAttribute('aSize', this.aSize);
    g.setAttribute('aShape', this.aShape);
    g.setAttribute('aCol', this.aCol);
    g.instanceCount = count;
    this.material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: decalVert,
      fragmentShader: decalFrag,
      ...additive,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 25;
    this.items = Array.from({ length: count }, () => ({ on: false }));
  }

  // Paint a telegraph that fills over `wind` seconds, then flashes and fades over `hold`.
  // o: { x, y, z, rot, w, l (half extents), shape, param, color:[r,g,b], wind, hold, follow(item) }
  add(o) {
    let k = this.items.findIndex((it) => !it.on);
    if (k < 0) k = 0;
    const it = this.items[k];
    Object.assign(it, {
      on: true,
      t: 0,
      x: o.x,
      y: (o.y ?? 0) + 0.03,
      z: o.z,
      rot: o.rot || 0,
      w: o.w,
      l: o.l ?? o.w,
      shape: o.shape ?? SHAPE.circle,
      param: o.param ?? 0,
      color: o.color || [3.2, 0.55, 0.12],
      wind: o.wind ?? 1,
      hold: o.hold ?? 0.25,
      follow: o.follow || null,
      alpha: 1,
    });
    return it;
  }

  clear() {
    for (const it of this.items) it.on = false;
  }

  update(dt, time) {
    this.material.uniforms.uTime.value = time;
    for (let k = 0; k < this.count; k++) {
      const it = this.items[k];
      if (it.on) {
        it.t += dt;
        if (it.follow) it.follow(it);
        if (it.t > it.wind + it.hold) it.on = false;
      }
      if (!it.on) {
        this.sh[k * 4 + 2] = 0;
        continue;
      }
      const prog = Math.min(1, it.t / Math.max(it.wind, 1e-3));
      const fadeIn = Math.min(1, it.t / 0.12);
      const fadeOut = it.t > it.wind ? 1 - (it.t - it.wind) / Math.max(it.hold, 1e-3) : 1;
      this.xf.set([it.x, it.y, it.z, it.rot], k * 4);
      this.sz.set([it.w, it.l], k * 2);
      this.sh.set([it.shape, prog, fadeIn * fadeOut * it.alpha, it.param], k * 4);
      this.cl.set(it.color, k * 3);
    }
    this.aXf.needsUpdate = true;
    this.aSize.needsUpdate = true;
    this.aShape.needsUpdate = true;
    this.aCol.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
// Expanding shockwave rings (the visible half of a ground-slam hazard).
// ---------------------------------------------------------------------------

const ringVert = /* glsl */ `
attribute vec4 aRing; // x, y, z, radius
attribute vec4 aRingB; // width, alpha, height, unused
attribute vec3 aCol;
varying vec2 vUv;
varying float vAlpha;
varying vec3 vCol;
void main() {
  vUv = uv;
  vAlpha = aRingB.y;
  vCol = aCol;
  // position.x = angle (0..1), position.y = 0 inner edge .. 1 outer/top
  float a = position.x * 6.2831853;
  float r = aRing.w + (position.y - 0.5) * aRingB.x;
  vec3 w = vec3(aRing.x + cos(a) * r, aRing.y + position.y * aRingB.z, aRing.z + sin(a) * r);
  gl_Position = aRingB.y > 0.0 ? projectionMatrix * viewMatrix * vec4(w, 1.0) : vec4(0.0, 0.0, 2.0, 1.0);
}
`;

const ringFrag = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying float vAlpha;
varying vec3 vCol;
float h1(float x) { return fract(sin(x * 91.7) * 43758.5); }
void main() {
  float y = vUv.y;
  float band = sin(y * 3.14159);
  float n = h1(floor(vUv.x * 90.0) + floor(uTime * 20.0));
  float a = band * (0.7 + 0.3 * n) * vAlpha;
  gl_FragColor = vec4(vCol * a, 0.0);
}
`;

export class Shockwaves {
  constructor(count = 12) {
    this.count = count;
    const segs = 96;
    const pos = [];
    const uv = [];
    const idx = [];
    for (let i = 0; i <= segs; i++) {
      for (let j = 0; j <= 1; j++) {
        pos.push(i / segs, j, 0);
        uv.push(i / segs, j);
      }
    }
    for (let i = 0; i < segs; i++) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    this.ra = new Float32Array(count * 4);
    this.rb = new Float32Array(count * 4);
    this.rc = new Float32Array(count * 3);
    this.aRing = new THREE.InstancedBufferAttribute(this.ra, 4).setUsage(THREE.DynamicDrawUsage);
    this.aRingB = new THREE.InstancedBufferAttribute(this.rb, 4).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.InstancedBufferAttribute(this.rc, 3).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aRing', this.aRing);
    g.setAttribute('aRingB', this.aRingB);
    g.setAttribute('aCol', this.aCol);
    g.instanceCount = count;
    this.material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      ...additive,
      side: THREE.DoubleSide,
      forceSinglePass: true, // additive: both faces in one pass
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 26;
    this.items = Array.from({ length: count }, () => ({ on: false }));
  }

  // A ring from (x, y, z) expanding at `speed` m/s to `max` radius.
  add(x, y, z, { speed = 9, max = 14, width = 0.5, height = 0.6, color = [2.2, 1.2, 0.5], r0 = 0.5 } = {}) {
    let k = this.items.findIndex((it) => !it.on);
    if (k < 0) k = 0;
    const it = this.items[k];
    Object.assign(it, { on: true, x, y, z, r: r0, speed, max, width, height, color });
    return it;
  }

  clear() {
    for (const it of this.items) it.on = false;
  }

  update(dt, time) {
    this.material.uniforms.uTime.value = time;
    for (let k = 0; k < this.count; k++) {
      const it = this.items[k];
      if (it.on) {
        it.r += it.speed * dt;
        if (it.r > it.max) it.on = false;
      }
      if (!it.on) {
        this.rb[k * 4 + 1] = 0;
        continue;
      }
      const a = 1 - Math.pow(it.r / it.max, 2);
      this.ra.set([it.x, it.y + 0.02, it.z, it.r], k * 4);
      this.rb.set([it.width, a, it.height, 0], k * 4);
      this.rc.set(it.color, k * 3);
    }
    this.aRing.needsUpdate = true;
    this.aRingB.needsUpdate = true;
    this.aCol.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
// Forked lightning: a jagged ribbon from the clouds (or a lance) to the ground,
// with branches, flickering out over a few tenths of a second.
// ---------------------------------------------------------------------------

const boltVert = /* glsl */ `
attribute float aSide;
attribute float aW;
varying float vSide;
varying float vW;
void main() {
  vSide = aSide;
  vW = aW;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

const boltFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying float vSide;
varying float vW;
void main() {
  float core = exp(-vSide * vSide * 18.0);
  float halo = exp(-vSide * vSide * 3.0) * 0.25;
  gl_FragColor = vec4(uColor * (core * 2.5 + halo) * uAlpha * vW, 0.0);
}
`;

export class Bolts {
  constructor(count = 4) {
    this.group = new THREE.Group();
    this.items = [];
    this.rand = mulberry32(1234);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0.75, 0.82, 1.0).multiplyScalar(14) }, uAlpha: { value: 0 } },
        vertexShader: boltVert,
        fragmentShader: boltFrag,
        ...additive,
        side: THREE.DoubleSide,
        forceSinglePass: true, // additive: both faces in one pass
      });
      // Attributes from the start (a strike fills them in): a shader compiled for a
      // geometry without positions is a different shader, compiled again mid-fight.
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3));
      g.setAttribute('aSide', new THREE.Float32BufferAttribute(new Float32Array(3), 1));
      g.setAttribute('aW', new THREE.Float32BufferAttribute(new Float32Array(3), 1));
      const mesh = new THREE.Mesh(g, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 33;
      mesh.visible = false;
      this.group.add(mesh);
      this.items.push({ mesh, mat, t: 0, life: 0 });
    }
  }

  // Strike from `a` to `b` (Vector3s), seen from `eye` (the ribbon faces it).
  strike(a, b, eye, { width = 0.35, life = 0.45, color = null } = {}) {
    const it = this.items.find((x) => !x.mesh.visible) || this.items[0];
    const r = this.rand;
    const paths = [];
    // Midpoint displacement for the main channel.
    const main = [a.clone(), b.clone()];
    let pts = main;
    let disp = a.distanceTo(b) * 0.18;
    for (let lvl = 0; lvl < 6; lvl++) {
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const m = pts[i].clone().lerp(pts[i + 1], 0.5);
        m.x += (r() - 0.5) * 2 * disp;
        m.y += (r() - 0.5) * disp * 0.5;
        m.z += (r() - 0.5) * 2 * disp;
        next.push(m, pts[i + 1]);
      }
      pts = next;
      disp *= 0.55;
    }
    paths.push({ pts, w: width });
    // A few branches off the upper two thirds.
    const nb = 2 + Math.floor(r() * 3);
    for (let k = 0; k < nb; k++) {
      const s = Math.floor(r() * pts.length * 0.65);
      const start = pts[s];
      const dir = new THREE.Vector3(r() - 0.5, -0.6 - r() * 0.5, r() - 0.5).normalize();
      const len = a.distanceTo(b) * (0.12 + r() * 0.2);
      const bp = [start.clone()];
      for (let i = 1; i <= 8; i++) {
        const p = bp[i - 1].clone().addScaledVector(dir, len / 8);
        p.x += (r() - 0.5) * len * 0.12;
        p.z += (r() - 0.5) * len * 0.12;
        bp.push(p);
      }
      paths.push({ pts: bp, w: width * 0.45 });
    }
    // Ribbons facing the eye.
    const pos = [];
    const side = [];
    const wv = [];
    const idx = [];
    const t = new THREE.Vector3();
    const toEye = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (const path of paths) {
      const P = path.pts;
      const base = pos.length / 3;
      for (let i = 0; i < P.length; i++) {
        t.subVectors(P[Math.min(i + 1, P.length - 1)], P[Math.max(i - 1, 0)]).normalize();
        toEye.subVectors(eye, P[i]).normalize();
        n.crossVectors(t, toEye).normalize();
        const w = path.w * (1 - (i / P.length) * 0.5);
        pos.push(P[i].x + n.x * w, P[i].y + n.y * w, P[i].z + n.z * w);
        pos.push(P[i].x - n.x * w, P[i].y - n.y * w, P[i].z - n.z * w);
        side.push(1, -1);
        const fade = path.w < width ? 0.6 : 1;
        wv.push(fade, fade);
      }
      for (let i = 0; i < P.length - 1; i++) {
        const q = base + i * 2;
        idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
      }
    }
    const g = it.mesh.geometry;
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
    g.setAttribute('aW', new THREE.Float32BufferAttribute(wv, 1));
    g.setIndex(idx);
    g.computeBoundingSphere();
    if (color) it.mat.uniforms.uColor.value.copy(color);
    it.t = 0;
    it.life = life;
    it.mesh.visible = true;
    return it;
  }

  clear() {
    for (const it of this.items) it.mesh.visible = false;
  }

  update(dt) {
    for (const it of this.items) {
      if (!it.mesh.visible) continue;
      it.t += dt;
      const k = it.t / it.life;
      if (k >= 1) {
        it.mesh.visible = false;
        continue;
      }
      // A few restrikes, then gone.
      const flick = k < 0.15 ? 1 : k < 0.3 ? 0.35 : k < 0.45 ? 0.9 : (1 - k) * 0.6;
      it.mat.uniforms.uAlpha.value = flick;
    }
  }
}
