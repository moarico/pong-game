import * as THREE from 'three';
import { common, sharedUniforms, terrain as terrainGLSL, atmosphere, shadow } from './glsl.js';
import { SUN_AZIMUTH } from './config.js';

// Keep in sync with terrainHeight() in glsl.js.
export function terrainHeight(x, z) {
  return Math.sin(x * 0.031 + 1.7) * Math.cos(z * 0.027 - 0.4) * 2.2
    + Math.sin(x * 0.067 - z * 0.052 + 2.3) * 0.7
    + Math.cos(x * 0.121 + z * 0.143 - 1.1) * 0.25;
}

// Radial grid that follows the camera: fine under the player, coarse at the horizon.
function makeGroundGeometry() {
  const rings = 96;
  const segs = 160;
  const inner = 0.35;
  const outer = 1400;
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
void main() {
  vec2 xz = position.xz + uSnap;
  vec3 w = vec3(xz.x, terrainHeight(xz), xz.y);
  vWorld = w;
  vShadow = (uShadowMatrix * vec4(w, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
`;

const groundFrag = /* glsl */ `
${common}
${sharedUniforms}
${terrainGLSL}
${atmosphere}
${shadow}
varying vec3 vWorld;
varying vec3 vShadow;
void main() {
  vec3 N = terrainNormal(vWorld.xz);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = uSunDir;
  float dist = length(vWorld.xz - cameraPosition.xz);

  // Up close this is the shaded soil between stems; further out it stands in for
  // the grass canopy itself once the blades have faded, so the field never thins.
  float n = vnoise(vWorld.xz * 1.3) * 0.6 + vnoise(vWorld.xz * 5.1) * 0.4;
  vec3 soil = mix(vec3(0.045, 0.028, 0.016), vec3(0.11, 0.07, 0.038), n);
  float patchN = inoise(vWorld.xz * 0.045 + 7.0);
  float patchN2 = inoise(vWorld.xz * 0.21 - 3.0);
  vec3 canopy = mix(vec3(0.38, 0.26, 0.14), vec3(0.5, 0.38, 0.23), patchN2 * 0.8);
  canopy *= mix(0.8, 1.08, patchN);
  float far = smoothstep(9.0, 55.0, dist);
  vec3 alb = mix(soil, canopy, far);

  float sunVis = terrainSunVis(vWorld + N * 0.05) * charShadow(vShadow);
  float fwd = sat(dot(-V, L));
  float diff = mix(sat(dot(N, L) * 2.0 + 0.1), sat(dot(N, L) * 0.6 + 0.5), far);
  float trans = (pow(fwd, 5.0) * 1.1 + pow(fwd, 1.8) * 0.28) * far;
  vec3 sun = uSunColor * sunVis;
  vec3 col = alb * sun * (diff * mix(0.35, 1.0, far) + trans * vec3(1.05, 0.82, 0.55));
  col += alb * mix(uAmbGround, uAmbSky, 0.6) * mix(0.45, 1.0, far);
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

// Two rings of low hills on the horizon, lost in the haze like ink-wash layers.
function hillProfile(a, seed, sunA) {
  let h = 0;
  h += Math.sin(a * 3 + seed * 1.7) * 0.5;
  h += Math.sin(a * 7 + seed * 2.9) * 0.28;
  h += Math.sin(a * 13 + seed * 0.7) * 0.14;
  h += Math.sin(a * 31 + seed * 5.1) * 0.06;
  // Treeline fuzz along the crest.
  h += (Math.sin(a * 271 + seed) * 0.5 + Math.sin(a * 523 + seed * 3.1) * 0.5) * 0.035;
  h = 0.55 + h * 0.6;
  // Keep a low saddle under the sun so it sets into a valley, not behind a wall.
  let d = Math.abs(((a - sunA + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
  const saddle = 0.45 + 0.55 * Math.min(1, d / 0.55);
  return Math.max(0.08, h * saddle);
}

function makeHillRing(radius, height, seed, sunA) {
  const segs = 720;
  const pos = [];
  const hf = [];
  const idx = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const h = hillProfile(a, seed, sunA) * height;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    pos.push(x, -40, z, x, h, z);
    hf.push(0, 1);
  }
  // Wound to face inward: the ring is only ever seen from its centre.
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aTop', new THREE.Float32BufferAttribute(hf, 1));
  g.setIndex(idx);
  return g;
}

const hillVert = /* glsl */ `
attribute float aTop;
uniform vec2 uCenter;
varying vec3 vWorld;
varying float vTop;
void main() {
  vec3 w = position + vec3(uCenter.x, 0.0, uCenter.y);
  vWorld = w;
  vTop = aTop;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
`;

const hillFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
uniform vec3 uTint;
uniform float uHaze;
varying vec3 vWorld;
varying float vTop;
void main() {
  vec3 v = normalize(vWorld - cameraPosition);
  // Mist pools at the foot of the hills; crests stand out a little darker.
  float haze = mix(uHaze + (1.0 - uHaze) * 0.55, uHaze, smoothstep(-10.0, 45.0, vWorld.y));
  vec3 col = mix(uTint, hazeColor(v), haze);
  gl_FragColor = vec4(col, 1.0);
}
`;

export class Hills {
  constructor(shared) {
    this.group = new THREE.Group();
    // Azimuth of the sun in the ring's angle convention (x = cos a, z = sin a).
    const sunA = Math.atan2(-Math.cos(SUN_AZIMUTH), Math.sin(SUN_AZIMUTH));
    const rings = [
      { radius: 560, height: 34, seed: 1.3, haze: 0.6, tint: [0.03, 0.025, 0.04] },
      { radius: 920, height: 80, seed: 4.1, haze: 0.78, tint: [0.045, 0.04, 0.065] },
    ];
    this.materials = [];
    rings.forEach((r, i) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          ...shared,
          uCenter: { value: new THREE.Vector2() },
          uTint: { value: new THREE.Color().setRGB(...r.tint) },
          uHaze: { value: r.haze },
        },
        vertexShader: hillVert,
        fragmentShader: hillFrag,
      });
      const mesh = new THREE.Mesh(makeHillRing(r.radius, r.height, r.seed, sunA), mat);
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
