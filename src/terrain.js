import * as THREE from 'three';
import { common, sharedUniforms, terrain as terrainGLSL, wind as windGLSL, atmosphere, shadow } from './glsl.js';
import { SUN_AZIMUTH, TERRAIN } from './config.js';
import { inoise, inoise5 } from './noise.js';

const HERO_K = 1 / (2 * TERRAIN.heroRadius * TERRAIN.heroRadius);

// Keep in sync with terrainHeight() in glsl.js (same operations, same order).
export function terrainHeight(x, z) {
  let qx = (x + TERRAIN.offset[0]) * (1 / 240);
  let qy = (z + TERRAIN.offset[1]) * (1 / 240);
  let h = (inoise5(qx, qy) - 0.5) * 26;
  let rx = 0.8 * qx - 0.6 * qy;
  let ry = 0.6 * qx + 0.8 * qy;
  qx = rx * 2.3 + 3.1;
  qy = ry * 2.3 + 1.7;
  h += (inoise5(qx, qy) - 0.5) * 9;
  rx = 0.8 * qx - 0.6 * qy;
  ry = 0.6 * qx + 0.8 * qy;
  qx = rx * 2.4 - 1.3;
  qy = ry * 2.4 + 5.2;
  h += (inoise5(qx, qy) - 0.5) * 2.6;
  rx = 0.8 * qx - 0.6 * qy;
  ry = 0.6 * qx + 0.8 * qy;
  qx = rx * 2.5 + 7.7;
  qy = ry * 2.5 - 2.4;
  h += (inoise5(qx, qy) - 0.5) * 0.8;
  const dx = x - TERRAIN.hero[0];
  const dz = z - TERRAIN.hero[1];
  h += TERRAIN.heroHeight * Math.exp(-(dx * dx + dz * dz) * HERO_K);
  return h;
}

// Radial grid that follows the camera: fine under the player, coarse at the horizon.
function makeGroundGeometry() {
  const rings = 110;
  const segs = 192;
  const inner = 0.35;
  const outer = 2600;
  const pos = [0, 0, 0];
  const idx = [];
  for (let r = 0; r < rings; r++) {
    const radius = inner * Math.pow(outer / inner, r / (rings - 1));
    for (let s = 0; s < segs; s++) {
      const a = (s / segs) * Math.PI * 2;
      pos.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
  }
  for (let s = 0; s < segs; s++) idx.push(0, 1 + ((s + 1) % segs), 1 + s);
  for (let r = 0; r < rings - 1; r++) {
    for (let s = 0; s < segs; s++) {
      const a = 1 + r * segs + s;
      const b = 1 + r * segs + ((s + 1) % segs);
      const c = a + segs;
      const d = b + segs;
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

const groundVert = /* glsl */ `
${common}
${sharedUniforms}
${terrainGLSL}
uniform vec2 uSnap;
uniform mat4 uShadowMatrix;
varying vec3 vWorld;
varying vec3 vShadow;
varying vec3 vNormal;
varying float vSunVis;
void main() {
  vec2 xz = position.xz + uSnap;
  vec3 w = vec3(xz.x, terrainHeight(xz), xz.y);
  vWorld = w;
  // Normal and hill shadow per vertex: the grid is dense where it matters.
  vNormal = terrainNormal(xz);
  vSunVis = terrainSunVis(w + vNormal * 0.05);
  vShadow = (uShadowMatrix * vec4(w, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
`;

const groundFrag = /* glsl */ `
${common}
${sharedUniforms}
${terrainGLSL}
${windGLSL}
${atmosphere}
${shadow}
varying vec3 vWorld;
varying vec3 vShadow;
varying vec3 vNormal;
varying float vSunVis;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = uSunDir;
  float dist = length(vWorld.xz - cameraPosition.xz);
  vec2 p = vWorld.xz;

  // Up close: shaded litter between the stems. Further out this surface stands in
  // for the pampas canopy itself, combed by the wind and flecked with seed heads.
  float n = vnoise(p * 1.3) * 0.6 + vnoise(p * 5.1) * 0.4;
  vec3 soil = mix(vec3(0.06, 0.04, 0.022), vec3(0.13, 0.085, 0.045), n);
  vec2 wd = uWindDir;
  vec2 combed = vec2(dot(p, wd) * 0.35, dot(p, vec2(-wd.y, wd.x)) * 2.2);
  float streak = vnoise(combed) * 0.6 + vnoise(combed * 2.7 + 3.0) * 0.4;
  float patchN = inoise(p * 0.045 + 7.0);
  float patchN2 = inoise(p * 0.21 - 3.0);
  vec3 canopy = mix(vec3(0.43, 0.26, 0.11), vec3(0.6, 0.42, 0.22), patchN2 * 0.7 + streak * 0.3);
  canopy *= mix(0.78, 1.1, patchN) * mix(0.85, 1.1, streak);
  float gust = windGust(p);
  canopy *= 1.0 + gust * 0.25;
  float far = smoothstep(6.0, 45.0, dist);
  vec3 alb = mix(soil, canopy, far);
  float plumes = smoothstep(0.55, 0.85, vnoise(p * 3.3) * 0.6 + vnoise(p * 9.1) * 0.4) * far;

  float sunVis = vSunVis * charShadow(vShadow);
  float fwd = sat(dot(-V, L));
  float NdL = dot(N, L);
  float diff = mix(sat(NdL * 2.0 + 0.1) * 0.4, sat(NdL * 0.6 + 0.55), far);
  float trans = (pow(fwd, 4.0) * 1.1 + pow(fwd, 1.6) * 0.25) * far;
  vec3 sun = uSunColor * sunVis;
  vec3 col = alb * sun * (diff + trans * vec3(1.1, 0.85, 0.55));
  col += vec3(0.9, 0.75, 0.55) * plumes * sun * (0.08 + trans * 0.9);
  col += alb * mix(uAmbGround, uAmbSky, 0.65) * mix(0.35, 1.0, far);
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

export class Ground {
  constructor(shared) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uSnap: { value: new THREE.Vector2() },
      },
      vertexShader: groundVert,
      fragmentShader: groundFrag,
    });
    this.mesh = new THREE.Mesh(makeGroundGeometry(), this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 6;
  }

  update(camera) {
    // Snap so vertices don't swim over the terrain as the camera moves.
    const s = 2;
    this.material.uniforms.uSnap.value.set(
      Math.round(camera.position.x / s) * s,
      Math.round(camera.position.z / s) * s,
    );
  }
}

// Ridged 1D noise: sharp crests, rounded valleys.
function ridge(a, freq, seed) {
  let h = 0;
  let amp = 0.55;
  let f = freq;
  for (let o = 0; o < 5; o++) {
    const n = inoise(a * f, seed + o * 13.7);
    h += (1 - Math.abs(n * 2 - 1)) * amp;
    amp *= 0.5;
    f *= 2.1;
  }
  return h;
}

function makeRange(radius, height, freq, seed, sunA) {
  const segs = 900;
  const pos = [];
  const idx = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    // Walk the noise around a circle so the skyline wraps seamlessly.
    const u = Math.cos(a) * 3 + 10;
    const v = Math.sin(a) * 3 + 10;
    let h = ridge(u + v * 0.37, freq, seed) * 0.7 + ridge(v - u * 0.21, freq * 1.3, seed + 5) * 0.3;
    // Keep the sky around the sun clear.
    const d = Math.abs(((a - sunA + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
    h *= 0.35 + 0.65 * Math.min(1, d / 0.7);
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    pos.push(x, -60, z, x, h * height, z);
  }
  // Wound to face inward: a range is only ever seen from its centre.
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

const rangeVert = /* glsl */ `
uniform vec2 uCenter;
varying vec3 vWorld;
void main() {
  vec3 w = position + vec3(uCenter.x, 0.0, uCenter.y);
  vWorld = w;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
`;

const rangeFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
uniform vec3 uTint;
uniform float uHaze;
uniform float uTop;
varying vec3 vWorld;
void main() {
  vec3 v = normalize(vWorld - cameraPosition);
  // Mist pools at the foot of each range; the crests read a little darker.
  float haze = mix(uHaze + (1.0 - uHaze) * 0.6, uHaze, smoothstep(-20.0, uTop, vWorld.y));
  gl_FragColor = vec4(mix(uTint, hazeColor(v), haze), 1.0);
}
`;

export class Hills {
  constructor(shared) {
    this.group = new THREE.Group();
    const sunA = Math.atan2(-Math.cos(SUN_AZIMUTH), Math.sin(SUN_AZIMUTH));
    const ranges = [
      { radius: 1500, height: 170, freq: 0.9, seed: 3.1, haze: 0.5, tint: [0.1, 0.11, 0.14] },
      { radius: 2200, height: 300, freq: 0.7, seed: 8.3, haze: 0.64, tint: [0.12, 0.13, 0.17] },
      { radius: 3100, height: 480, freq: 0.55, seed: 1.9, haze: 0.76, tint: [0.15, 0.16, 0.2] },
    ];
    this.materials = [];
    ranges.forEach((r, i) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          ...shared,
          uCenter: { value: new THREE.Vector2() },
          uTint: { value: new THREE.Color().setRGB(...r.tint) },
          uHaze: { value: r.haze },
          uTop: { value: r.height * 0.6 },
        },
        vertexShader: rangeVert,
        fragmentShader: rangeFrag,
      });
      const mesh = new THREE.Mesh(makeRange(r.radius, r.height, r.freq, r.seed, sunA), mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 7 + i;
      this.materials.push(mat);
      this.group.add(mesh);
    });
  }

  update(camera) {
    for (const m of this.materials) m.uniforms.uCenter.value.set(camera.position.x, camera.position.z);
  }
}
