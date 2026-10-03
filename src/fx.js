import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';
import { groundHeight } from './ground.js';
import { mulberry32 } from './noise.js';

// ---------------------------------------------------------------------------
// Combat effects: sword trails, sparks, blood, glints. All HDR, so the bloom
// and the sun's glare pick them up.
// ---------------------------------------------------------------------------

// Additive blending that leaves the alpha channel (the light-shaft mask) alone.
function glow(options) {
  return new THREE.ShaderMaterial({
    ...options,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
}

// ---------------------------------------------------------------------------
// Sword trail: a ribbon between the blade's base and point over the last
// fraction of a second, brightest at the point and fading as it ages.
// ---------------------------------------------------------------------------

const trailVert = /* glsl */ `
attribute float aAge;
attribute float aSide;
varying float vAge;
varying float vSide;
void main() {
  vAge = aAge;
  vSide = aSide;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

const trailFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uLife;
varying float vAge;
varying float vSide;
void main() {
  float a = clamp(1.0 - vAge / uLife, 0.0, 1.0);
  // A thin bright line where the point passed, a faint veil toward the hilt.
  float streak = pow(smoothstep(0.8, 0.99, vSide), 3.0);
  float smear = smoothstep(0.35, 0.95, vSide) * 0.1;
  float core = (streak + smear) * pow(a, 2.2);
  vec3 col = mix(uColor, vec3(1.0, 0.97, 0.92) * length(uColor), pow(a, 3.0) * streak);
  gl_FragColor = vec4(col * core, 0.0);
}
`;

export class SwordTrail {
  constructor(color, { n = 40, life = 0.16 } = {}) {
    this.n = n;
    this.life = life;
    this.base = [];
    this.tip = [];
    this.time = [];
    for (let i = 0; i < n; i++) {
      this.base.push(new THREE.Vector3());
      this.tip.push(new THREE.Vector3());
      this.time.push(-1e9);
    }
    this.head = 0;
    this.count = 0;
    this.now = 0;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(n * 2 * 3);
    this.age = new Float32Array(n * 2);
    const side = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      side[i * 2] = 0;
      side[i * 2 + 1] = 1;
    }
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.ageAttr = new THREE.BufferAttribute(this.age, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('aAge', this.ageAttr);
    g.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
    const idx = [];
    for (let i = 0; i < n - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    g.setIndex(idx);
    this.material = glow({
      uniforms: { uColor: { value: new THREE.Color(color) }, uLife: { value: life } },
      vertexShader: trailVert,
      fragmentShader: trailFrag,
      side: THREE.DoubleSide,
      forceSinglePass: true, // additive: both faces in one pass
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 30;
    this.mesh.visible = false;
  }

  setColor(hex, k = 1) {
    this.material.uniforms.uColor.value.set(hex).multiplyScalar(k);
  }

  push(base, tip, t) {
    this.head = (this.head + 1) % this.n;
    this.base[this.head].copy(base);
    this.tip[this.head].copy(tip);
    this.time[this.head] = t;
    this.count = Math.min(this.count + 1, this.n);
  }

  // A break in the ribbon (so two separate swings don't join up).
  cut() {
    this.count = 0;
  }

  update(now) {
    this.now = now;
    let live = 0;
    // Newest first, oldest last.
    for (let k = 0; k < this.n; k++) {
      const i = (this.head - k + this.n) % this.n;
      const age = k < this.count ? now - this.time[i] : 1e9;
      const src = k < this.count ? i : this.head;
      const b = this.base[src];
      const tp = this.tip[src];
      const o = k * 6;
      this.pos[o] = b.x;
      this.pos[o + 1] = b.y;
      this.pos[o + 2] = b.z;
      this.pos[o + 3] = tp.x;
      this.pos[o + 4] = tp.y;
      this.pos[o + 5] = tp.z;
      const a = Math.min(age, 1e3);
      this.age[k * 2] = a;
      this.age[k * 2 + 1] = a;
      if (age < this.life) live++;
    }
    this.mesh.visible = live > 1;
    this.posAttr.needsUpdate = true;
    this.ageAttr.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
// Sparks: short motion-stretched streaks where steel meets steel.
// ---------------------------------------------------------------------------

const sparkVert = /* glsl */ `
attribute float aHeat;
varying float vHeat;
void main() {
  vHeat = aHeat;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;
const sparkFrag = /* glsl */ `
varying float vHeat;
void main() {
  vec3 hot = vec3(6.0, 4.2, 2.2);
  vec3 cool = vec3(2.6, 0.7, 0.12);
  gl_FragColor = vec4(mix(cool, hot, vHeat) * vHeat, 0.0);
}
`;

export class Sparks {
  constructor(count = 220) {
    this.count = count;
    this.p = new Float32Array(count * 3);
    this.v = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    this.max = new Float32Array(count);
    this.next = 0;
    this.rand = mulberry32(11);
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(count * 2 * 3);
    this.heat = new Float32Array(count * 2);
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.heatAttr = new THREE.BufferAttribute(this.heat, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('aHeat', this.heatAttr);
    this.mesh = new THREE.LineSegments(g, glow({ vertexShader: sparkVert, fragmentShader: sparkFrag }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 31;
  }

  burst(at, dir, n = 24, speed = 6, spread = 0.9) {
    const r = this.rand;
    for (let k = 0; k < n; k++) {
      const i = this.next;
      this.next = (this.next + 1) % this.count;
      this.p.set([at.x, at.y, at.z], i * 3);
      // A cone around `dir`, plus a scatter.
      let x = dir.x + (r() - 0.5) * 2 * spread;
      let y = dir.y + (r() - 0.3) * 2 * spread;
      let z = dir.z + (r() - 0.5) * 2 * spread;
      const l = Math.hypot(x, y, z) || 1;
      const s = speed * (0.35 + r() * 0.9);
      this.v.set([(x / l) * s, (y / l) * s, (z / l) * s], i * 3);
      this.max[i] = 0.18 + r() * 0.35;
      this.life[i] = this.max[i];
    }
  }

  update(dt) {
    for (let i = 0; i < this.count; i++) {
      const o = i * 3;
      const q = i * 6;
      if (this.life[i] <= 0) {
        this.heat[i * 2] = this.heat[i * 2 + 1] = 0;
        this.pos.fill(0, q, q + 6);
        continue;
      }
      this.life[i] -= dt;
      this.v[o + 1] -= 9.8 * dt;
      const drag = Math.exp(-2.5 * dt);
      this.v[o] *= drag;
      this.v[o + 1] *= drag;
      this.v[o + 2] *= drag;
      this.p[o] += this.v[o] * dt;
      this.p[o + 1] += this.v[o + 1] * dt;
      this.p[o + 2] += this.v[o + 2] * dt;
      const h = Math.max(0, this.life[i] / this.max[i]);
      // Streak length follows speed: fast sparks read as lines.
      const k = 0.022;
      this.pos[q] = this.p[o];
      this.pos[q + 1] = this.p[o + 1];
      this.pos[q + 2] = this.p[o + 2];
      this.pos[q + 3] = this.p[o] - this.v[o] * k;
      this.pos[q + 4] = this.p[o + 1] - this.v[o + 1] * k;
      this.pos[q + 5] = this.p[o + 2] - this.v[o + 2] * k;
      this.heat[i * 2] = h;
      this.heat[i * 2 + 1] = h * 0.4;
    }
    this.posAttr.needsUpdate = true;
    this.heatAttr.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
// Blood: dark droplets flung along the cut that fall into the grass, and a
// brief mist.
// ---------------------------------------------------------------------------

const bloodVert = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
attribute float aLife;
attribute float aSize;
uniform float uPointScale;
varying float vLife;
varying vec3 vWorld;
void main() {
  vLife = aLife;
  vWorld = position;
  vec4 mv = viewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aLife > 0.0 ? max(aSize * uPointScale / max(-mv.z, 0.1), 1.5) : 0.0;
}
`;
const bloodFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
varying float vLife;
varying vec3 vWorld;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0 || vLife <= 0.0) discard;
  // Lit by the low sun from behind: a dark core with a crimson rim of light.
  vec3 col = vec3(0.09, 0.005, 0.004) + uSunColor * vec3(0.16, 0.01, 0.005) * (1.0 - d);
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

export class Blood {
  constructor(shared, count = 260) {
    this.count = count;
    this.p = new Float32Array(count * 3);
    this.v = new Float32Array(count * 3);
    this.lifeA = new Float32Array(count);
    this.size = new Float32Array(count);
    this.next = 0;
    this.rand = mulberry32(5);
    const g = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage);
    this.lifeAttr = new THREE.BufferAttribute(this.lifeA, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('aLife', this.lifeAttr);
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    this.material = new THREE.ShaderMaterial({
      uniforms: { ...shared, uPointScale: { value: 800 } },
      vertexShader: bloodVert,
      fragmentShader: bloodFrag,
      transparent: false,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
  }

  spray(at, dir, n = 26, speed = 3.5) {
    const r = this.rand;
    for (let k = 0; k < n; k++) {
      const i = this.next;
      this.next = (this.next + 1) % this.count;
      this.p.set([at.x + (r() - 0.5) * 0.08, at.y + (r() - 0.5) * 0.08, at.z + (r() - 0.5) * 0.08], i * 3);
      const s = speed * (0.3 + r());
      this.v.set([
        dir.x * s + (r() - 0.5) * 1.6,
        dir.y * s + 0.8 + r() * 1.8,
        dir.z * s + (r() - 0.5) * 1.6,
      ], i * 3);
      this.lifeA[i] = 1.2 + r();
      this.size[i] = 0.008 + r() * r() * 0.02;
    }
    this.points.geometry.attributes.aSize.needsUpdate = true;
  }

  update(dt, camera, renderHeight) {
    for (let i = 0; i < this.count; i++) {
      if (this.lifeA[i] <= 0) continue;
      const o = i * 3;
      this.lifeA[i] -= dt;
      this.v[o + 1] -= 9.8 * dt;
      this.p[o] += this.v[o] * dt;
      this.p[o + 1] += this.v[o + 1] * dt;
      this.p[o + 2] += this.v[o + 2] * dt;
      // Lost in the grass once it falls below the stems' mid-height.
      if (this.p[o + 1] < groundHeight(this.p[o], this.p[o + 2]) + 0.25) this.lifeA[i] = 0;
    }
    this.posAttr.needsUpdate = true;
    this.lifeAttr.needsUpdate = true;
    this.material.uniforms.uPointScale.value = renderHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  }
}

// ---------------------------------------------------------------------------
// Glints: a four-pointed star flaring on a blade (the tell before an enemy
// strikes, red if it cannot be parried) or at a clash.
// ---------------------------------------------------------------------------

const glintVert = /* glsl */ `
attribute vec4 aData; // size, intensity, rotation, unused
attribute vec3 aColor;
uniform float uPointScale;
varying vec3 vColor;
varying float vRot;
varying float vI;
void main() {
  vColor = aColor;
  vRot = aData.z;
  vI = aData.y;
  vec4 mv = viewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aData.y > 0.0 ? aData.x * uPointScale / max(-mv.z, 0.1) : 0.0;
}
`;
const glintFrag = /* glsl */ `
varying vec3 vColor;
varying float vRot;
varying float vI;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float cs = cos(vRot);
  float sn = sin(vRot);
  c = mat2(cs, -sn, sn, cs) * c;
  float r = length(c);
  float star = exp(-abs(c.x) * 26.0) * exp(-abs(c.y) * 2.6) + exp(-abs(c.y) * 26.0) * exp(-abs(c.x) * 2.6);
  float core = exp(-r * r * 30.0);
  float halo = exp(-r * 5.0) * 0.25;
  float v = (star * 0.8 + core + halo) * (1.0 - smoothstep(0.85, 1.0, r));
  gl_FragColor = vec4(vColor * v * vI, 0.0);
}
`;

export class Glints {
  constructor(count = 24) {
    this.count = count;
    this.items = [];
    const g = new THREE.BufferGeometry();
    this.p = new Float32Array(count * 3);
    this.d = new Float32Array(count * 4);
    this.c = new Float32Array(count * 3);
    this.pAttr = new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage);
    this.dAttr = new THREE.BufferAttribute(this.d, 4).setUsage(THREE.DynamicDrawUsage);
    this.cAttr = new THREE.BufferAttribute(this.c, 3).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.pAttr);
    g.setAttribute('aData', this.dAttr);
    g.setAttribute('aColor', this.cAttr);
    this.material = glow({ uniforms: { uPointScale: { value: 800 } }, vertexShader: glintVert, fragmentShader: glintFrag });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 32;
    for (let i = 0; i < count; i++) this.items.push({ life: 0, max: 1, size: 0.3, color: new THREE.Color(), pos: new THREE.Vector3(), follow: null, rot: 0, i: 1 });
    this.next = 0;
  }

  // follow(out) may keep the glint on a moving blade.
  flash(pos, { color = 0xfff2d8, size = 0.5, life = 0.3, intensity = 6, follow = null } = {}) {
    const it = this.items[this.next];
    this.next = (this.next + 1) % this.count;
    it.pos.copy(pos);
    it.color.set(color);
    it.size = size;
    it.life = life;
    it.max = life;
    it.i = intensity;
    it.follow = follow;
    it.rot = Math.random() * 0.5;
    return it;
  }

  update(dt, camera, renderHeight) {
    for (let k = 0; k < this.count; k++) {
      const it = this.items[k];
      if (it.life > 0) {
        it.life -= dt;
        if (it.follow) it.follow(it.pos);
        it.rot += dt * 1.5;
      }
      const x = Math.max(0, it.life / it.max);
      // Swells quickly, fades slowly.
      const env = Math.sin(Math.PI * Math.pow(1 - x, 0.6));
      const o = k * 3;
      this.p[o] = it.pos.x;
      this.p[o + 1] = it.pos.y;
      this.p[o + 2] = it.pos.z;
      this.d[k * 4] = it.size * (0.6 + 0.4 * env);
      this.d[k * 4 + 1] = it.life > 0 ? it.i * env : 0;
      this.d[k * 4 + 2] = it.rot;
      this.c[o] = it.color.r;
      this.c[o + 1] = it.color.g;
      this.c[o + 2] = it.color.b;
    }
    this.pAttr.needsUpdate = true;
    this.dAttr.needsUpdate = true;
    this.cAttr.needsUpdate = true;
    this.material.uniforms.uPointScale.value = renderHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  }
}
