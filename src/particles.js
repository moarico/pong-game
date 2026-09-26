import * as THREE from 'three';
import { common, sharedUniforms, terrain } from './glsl.js';
import { mulberry32 } from './noise.js';

// Additive blending that leaves the alpha channel (the light-shaft occlusion mask) alone.
function glowMaterial(options) {
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

const moteVert = /* glsl */ `
${common}
${sharedUniforms}
${terrain}
attribute vec4 aSeed;
uniform float uBox;
uniform float uBoxH;
uniform vec2 uDrift;
uniform float uPointScale;
varying float vBright;
varying float vSoft;

void main() {
  float r = aSeed.w;
  vec3 p = vec3(aSeed.x * uBox, 0.0, aSeed.z * uBox);
  // Carried by the wind, each mote at its own pace, with a lazy swirl.
  p.xz += uDrift * (0.55 + r * 0.9);
  p.x += sin(uTime * (0.23 + r * 0.31) + aSeed.y * 40.0) * 0.7;
  p.z += cos(uTime * (0.19 + r * 0.27) + aSeed.x * 33.0) * 0.7;
  vec2 c = cameraPosition.xz;
  p.xz = c + mod(p.xz - c + uBox * 0.5, uBox) - uBox * 0.5;
  float hy = aSeed.y * uBoxH + sin(uTime * (0.17 + r * 0.25) + r * 30.0) * 0.4;
  p.y = terrainHeight(p.xz) + 0.2 + hy;

  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(-mv.z, 0.05);

  // Seed fluff is larger and softer than dust.
  float fluff = step(0.86, r);
  float worldSize = mix(0.012, 0.028, r * r) + fluff * 0.035;
  float px = worldSize * uPointScale / dist;
  float size = max(px, 1.6);
  gl_PointSize = size;

  // Henyey-Greenstein forward scattering: motes between you and the sun ignite.
  vec3 v = normalize(p - cameraPosition);
  float cosT = dot(v, uSunDir);
  float g = 0.78;
  float hg = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosT, 1.5);
  float twinkle = pow(0.5 + 0.5 * sin(uTime * (1.7 + r * 6.5) + r * 71.0), 3.0);
  float edge = (1.0 - smoothstep(uBox * 0.36, uBox * 0.5, length(p.xz - c))) * smoothstep(0.6, 2.0, dist);
  // Energy stays constant when a mote shrinks below a pixel, so it glimmers instead of popping.
  float energy = (px * px) / (size * size);
  vBright = (0.05 + hg * 0.1) * mix(0.3, 1.0, twinkle) * edge * energy * mix(1.0, 0.6, fluff);
  vSoft = fluff;
}
`;

const moteFrag = /* glsl */ `
uniform vec3 uSunColor;
uniform float uIntensity;
varying float vBright;
varying float vSoft;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0) discard;
  float a = exp(-d * mix(4.5, 2.2, vSoft));
  gl_FragColor = vec4(uSunColor * vBright * a * uIntensity, 0.0);
}
`;

export class Motes {
  constructor(shared, count = 2600) {
    const rand = mulberry32(99);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) seeds[i] = rand();
    const g = new THREE.BufferGeometry();
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    // Positions are computed in the shader; this attribute only sets the vertex count.
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    this.geometry = g;
    this.total = count;
    this.drift = new THREE.Vector2();
    this.material = glowMaterial({
      uniforms: {
        ...shared,
        uBox: { value: 34 },
        uBoxH: { value: 5.5 },
        uDrift: { value: this.drift },
        uPointScale: { value: 800 },
        uIntensity: { value: 1 },
      },
      vertexShader: moteVert,
      fragmentShader: moteFrag,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 30;
  }

  setQuality(q) {
    this.geometry.setDrawRange(0, Math.floor(this.total * q.motes));
  }

  update(dt, wind, camera, renderHeight) {
    const speed = 0.6 + wind.strength * 2.2;
    this.drift.x += wind.dir.x * speed * dt;
    this.drift.y += wind.dir.y * speed * dt;
    this.material.uniforms.uPointScale.value =
      renderHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  }
}

// A soft puff of dust and seed fluff kicked up when the samurai lands.
const puffVert = /* glsl */ `
${common}
${sharedUniforms}
attribute vec4 aState; // xyz unused, w = life 0..1 (1 = just born)
attribute float aSize;
uniform float uPointScale;
varying float vA;
void main() {
  vec4 mv = viewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(-mv.z, 0.05);
  float life = aState.w;
  float px = aSize * (1.6 - life * 0.9) * uPointScale / dist;
  gl_PointSize = clamp(px, 1.0, 96.0);
  vec3 v = normalize(position - cameraPosition);
  float fwd = max(dot(v, uSunDir), 0.0);
  vA = life * life * (0.05 + 0.5 * pow(fwd, 4.0)) * step(0.001, life);
}
`;

const puffFrag = /* glsl */ `
uniform vec3 uSunColor;
varying float vA;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0) discard;
  float a = (1.0 - d) * (1.0 - d);
  gl_FragColor = vec4(uSunColor * vec3(1.0, 0.85, 0.65) * vA * a, 0.0);
}
`;

export class Puffs {
  constructor(shared, count = 72) {
    this.count = count;
    this.pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.state = new Float32Array(count * 4);
    this.size = new Float32Array(count);
    this.next = 0;
    this.rand = mulberry32(7);
    const g = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.stateAttr = new THREE.BufferAttribute(this.state, 4).setUsage(THREE.DynamicDrawUsage);
    this.sizeAttr = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('aState', this.stateAttr);
    g.setAttribute('aSize', this.sizeAttr);
    this.material = glowMaterial({
      uniforms: { ...shared, uPointScale: { value: 800 } },
      vertexShader: puffVert,
      fragmentShader: puffFrag,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 31;
    this.windVel = new THREE.Vector3();
  }

  burst(x, y, z, strength) {
    const n = Math.round(10 + strength * 22);
    for (let k = 0; k < n; k++) {
      const i = this.next;
      this.next = (this.next + 1) % this.count;
      const a = this.rand() * Math.PI * 2;
      const sp = (0.6 + this.rand() * 1.6) * (0.5 + strength);
      this.pos[i * 3] = x + Math.cos(a) * 0.25;
      this.pos[i * 3 + 1] = y + 0.1 + this.rand() * 0.25;
      this.pos[i * 3 + 2] = z + Math.sin(a) * 0.25;
      this.vel[i * 3] = Math.cos(a) * sp;
      this.vel[i * 3 + 1] = 0.4 + this.rand() * 1.1 * (0.4 + strength);
      this.vel[i * 3 + 2] = Math.sin(a) * sp;
      this.state[i * 4 + 3] = 0.6 + this.rand() * 0.4;
      this.size[i] = 0.05 + this.rand() * 0.09;
    }
  }

  update(dt, wind, camera, renderHeight) {
    const drag = Math.exp(-3.2 * dt);
    for (let i = 0; i < this.count; i++) {
      const life = this.state[i * 4 + 3];
      if (life <= 0) continue;
      const px = this.pos[i * 3];
      const py = this.pos[i * 3 + 1];
      const pz = this.pos[i * 3 + 2];
      wind.velocityAt(px, py, pz, this.windVel);
      const k = 1 - drag;
      this.vel[i * 3] = this.vel[i * 3] * drag + this.windVel.x * 0.5 * k;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * drag + (0.25 + this.windVel.y * 0.3) * k;
      this.vel[i * 3 + 2] = this.vel[i * 3 + 2] * drag + this.windVel.z * 0.5 * k;
      this.pos[i * 3] = px + this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] = py + this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] = pz + this.vel[i * 3 + 2] * dt;
      this.state[i * 4 + 3] = Math.max(0, life - dt * 0.7);
    }
    this.posAttr.needsUpdate = true;
    this.stateAttr.needsUpdate = true;
    this.sizeAttr.needsUpdate = true;
    this.material.uniforms.uPointScale.value =
      renderHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  }
}
