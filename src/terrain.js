import * as THREE from 'three';
import { common, sharedUniforms, terrain as terrainGLSL, wind as windGLSL, atmosphere, shadow } from './glsl.js';
import { SUN_AZIMUTH, TERRAIN } from './config.js';
import { inoise, inoise5 } from './noise.js';
import { landGLSL } from './landmaps.js';

const T = TERRAIN;
const [SX, SZ] = T.sunH;
const [RX, RZ] = T.right;
const CX = SX * T.crest;
const CZ = SZ * T.crest;
const NEAR2 = T.near * T.near;
const KNOLL_K = 1 / (2 * T.knollRadius * T.knollRadius);
const FLOOR = -120;

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// Polynomial smooth maximum: land rising out of the seabed without a crease.
function smax(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + h * h * k * 0.25;
}

// A rounded mound: 1 at the centre, 0 (and flat) at the rim.
function mound(t) {
  const u = Math.max(1 - t * t, 0);
  return u * u;
}

const RIDGES = T.ridges.map(([x1, z1, x2, z2, r1, r2, h1, h2]) => {
  const dx = x2 - x1;
  const dz = z2 - z1;
  return { x1, z1, dx, dz, inv: 1 / (dx * dx + dz * dz), r1, r2, h1, h2 };
});

// Layered noise for the lie of the land. Mirrors terrainRolling() in glsl.js.
function rolling(x, z) {
  let qx = (x + T.offset[0]) * (1 / 240);
  let qy = (z + T.offset[1]) * (1 / 240);
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
  return h;
}

// The coast beyond the hilltop: the seabed, headlands and islands.
function coast(x, z, h, n) {
  h = smax(h, T.seabed + n * 0.5, 30);
  let crag = 1 - Math.abs(inoise5(x * (1 / 640) + 19, z * (1 / 640) + 7) * 2 - 1);
  crag = 0.6 + 0.6 * crag + (inoise5(x * (1 / 230) - 5, z * (1 / 230) + 11) - 0.5) * 0.35;
  for (const R of RIDGES) {
    const px = x - R.x1;
    const pz = z - R.z1;
    const t = Math.min(Math.max((px * R.dx + pz * R.dz) * R.inv, 0), 1);
    const qx = px - R.dx * t;
    const qz = pz - R.dz * t;
    const dist = Math.sqrt(qx * qx + qz * qz);
    const r = R.r1 + (R.r2 - R.r1) * t;
    if (dist < r) {
      const peak = (R.h1 + (R.h2 - R.h1) * t) * crag;
      h = smax(h, FLOOR + (peak - FLOOR) * mound(dist / r), 40);
    }
  }
  for (const [ix, iz, r, peak] of T.islands) {
    const dist = Math.hypot(x - ix, z - iz);
    if (dist < r) h = smax(h, FLOOR + (peak * crag - FLOOR) * mound(dist / r), 40);
  }
  // Spurs and gullies on the high ground.
  const rid = 1 - Math.abs(inoise5(x * (1 / 170) + 3, z * (1 / 170) - 9) * 2 - 1);
  h += (rid - 0.55) * 46 * smoothstep(90, 320, h);
  return h;
}

// Keep in sync with terrainHeight() in glsl.js (same operations, same order).
export function terrainHeight(x, z) {
  const n = rolling(x, z);
  const dx = x - CX;
  const dz = z - CZ;
  const a = dx * SX + dz * SZ; // toward the sea
  // The hill: a broad dome just ahead of the spawn, rolling over and falling to the sea
  // on three sides, and running back into the plateau inland.
  const b = dx * RX + dz * RZ; // across
  const bs = b * T.across;
  const rp = Math.max(Math.sqrt(a * a + bs * bs) - T.flat, 0);
  // The coast curves out on either side, so the bay's arms stay land.
  const fall = T.slope * (Math.sqrt(rp * rp + T.round * T.round) - T.round) * smoothstep(-450, -50, a - b * b * 0.0004);
  // Inland the ground climbs gently toward the mountains.
  const ip = Math.max(-a - 300, 0);
  const climb = 0.05 * (Math.sqrt(ip * ip + 40000) - 200);
  const r2 = x * x + z * z;
  // Smooth on the hilltop, livelier further out.
  const detail = 0.3 + 0.7 * smoothstep(150, 600, Math.sqrt(r2));
  const knoll = T.knoll * Math.exp(-r2 * KNOLL_K);
  let h = T.top - fall + climb + knoll + n * detail;
  if (r2 > NEAR2) h = coast(x, z, h, n);
  return h;
}

// Radial grid that follows the camera: fine under the player, coarse at the horizon.
function makeGroundGeometry() {
  const rings = 150;
  const segs = 256;
  const inner = 0.35;
  const outer = 13000;
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
${landGLSL}
uniform vec2 uSnap;
uniform mat4 uShadowMatrix;
varying vec3 vWorld;
varying vec3 vShadow;
varying vec3 vNormal;
varying float vSunVis;
void main() {
  vec2 xz = position.xz + uSnap;
  // Normal and hill shadow per vertex (the grid is dense where it matters), baked
  // where the maps reach, worked out beyond them.
  vec4 land;
  if (landCovers(xz)) {
    land = landSample(xz);
  } else {
    float h = terrainHeight(xz);
    vec3 n = terrainNormal(xz);
    land = vec4(h, n.x, n.z, terrainSunVis(vec3(xz.x, h, xz.y) + n * 0.05));
  }
  vec3 w = vec3(xz.x, land.x, xz.y);
  vWorld = w;
  // Far off, sea and seabed lie closer together than the depth buffer can tell
  // apart and the shallows would flicker: sink the drowned ground a little with
  // distance (nobody can see the seabed there; its colour comes from vWorld).
  float camDist = length(xz - cameraPosition.xz);
  w.y -= smoothstep(0.0, -0.6, w.y) * camDist * 0.0014;
  vNormal = landNormal(land);
  vSunVis = land.w;
  vShadow = (uShadowMatrix * vec4(w, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
`;

const groundFrag = /* glsl */ `
${common}
${sharedUniforms}
${terrainGLSL}
${windGLSL}
${landGLSL}
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
  vec3 soil = mix(vec3(0.05, 0.032, 0.016), vec3(0.11, 0.07, 0.035), n);
  vec2 wd = uWindDir;
  vec2 combed = vec2(dot(p, wd) * 0.35, dot(p, vec2(-wd.y, wd.x)) * 2.2);
  float streak = vnoise(combed) * 0.6 + vnoise(combed * 2.7 + 3.0) * 0.4;
  float patchN;
  float patchN2;
  if (uLandOk > 0.5 && max(abs(p.x), abs(p.y)) < LAND_GRASS * 0.49) {
    vec4 gm = grassLand(p);
    patchN = gm.y;
    patchN2 = gm.z;
  } else {
    patchN = inoise(p * 0.045 + 7.0);
    patchN2 = inoise(p * 0.21 - 3.0);
  }
  vec3 canopy = mix(vec3(0.42, 0.24, 0.085), vec3(0.6, 0.4, 0.17), patchN2 * 0.7 + streak * 0.3);
  canopy *= mix(0.78, 1.1, patchN) * mix(0.85, 1.1, streak);
  float gust = windGust(p);
  canopy *= 1.0 + gust * 0.25;
  float far = smoothstep(6.0, 45.0, dist);
  vec3 alb = mix(soil, canopy, far);
  float plumes = smoothstep(0.55, 0.85, vnoise(p * 3.3) * 0.6 + vnoise(p * 9.1) * 0.4) * far;

  // Beyond the hilltop the pampas gives way to dark scrub and pine on the headlands,
  // with pale rock where the land meets the sea.
  // Further out: golden meadows on the lower slopes, dark pine woods in the folds and
  // up the mountains, pale rock on the steeps and where the land meets the sea.
  // (Only the far land and the shore need these; the hilltop skips them.)
  float wild = smoothstep(420.0, 900.0, length(p));
  bool shore = vWorld.y < 8.0;
  float scrubN = wild > 0.0 || shore ? inoise(p * 0.004 + 3.0) * 0.6 + inoise(p * 0.019) * 0.4 : 0.5;
  vec3 rock = vec3(0.16, 0.13, 0.1);
  if (wild > 0.0) {
    // The coast out toward the sun is wooded and dark against it; inland, meadows.
    float sunward = smoothstep(-0.1, 0.5, dot(normalize(p), normalize(uSunDisc.xz)));
    float forest = smoothstep(0.42, 0.6, scrubN + smoothstep(160.0, 420.0, vWorld.y) * 0.4 - smoothstep(20.0, 90.0, vWorld.y) * 0.25 + 0.2 + sunward * 0.45);
    vec3 meadow = canopy * vec3(0.8, 0.74, 0.62);
    vec3 woods = mix(vec3(0.035, 0.038, 0.022), vec3(0.08, 0.07, 0.035), scrubN);
    vec3 scrub = mix(meadow, woods, forest);
    scrub = mix(scrub, rock, sat((1.0 - smoothstep(1.5, 9.0, vWorld.y)) * 0.8 + smoothstep(0.5, 0.75, 1.0 - N.y) * 0.6));
    alb = mix(alb, scrub, wild);
  }

  // The shore: a strip of sand darkened where the surf wets it, rock where the land
  // drops steeply into the water, and under the shallows a seabed of sand and weed
  // fading into the dark.
  float steep = smoothstep(0.62, 0.85, 1.0 - N.y);
  float beach = 0.0;
  float wet = 0.0;
  float under = smoothstep(0.0, -1.5, vWorld.y);
  if (shore) {
    float y = vWorld.y + (scrubN - 0.5) * 1.6;
    beach = 1.0 - smoothstep(2.5, 7.0, y);
    wet = 1.0 - smoothstep(-0.1, 1.4, y + (vnoise(p * 0.7 + uTime * 0.2) - 0.5) * 0.35);
    vec3 sand = mix(vec3(0.36, 0.29, 0.2), vec3(0.3, 0.24, 0.17), n);
    sand = mix(sand, sand * 0.52, wet);
    vec3 shoreCol = mix(sand, rock * mix(0.8, 1.1, n), steep);
    shoreCol = mix(shoreCol, mix(vec3(0.2, 0.18, 0.12), vec3(0.06, 0.09, 0.07), smoothstep(-0.5, -5.0, vWorld.y + (patchN - 0.5) * 3.0)), under);
    alb = mix(alb, shoreCol, beach);
  }
  float solid = max(wild, beach);
  plumes *= 1.0 - solid;

  float sunVis = vSunVis * charShadow(vShadow);
  float fwd = sat(dot(-V, L));
  float NdL = dot(N, L);
  float diff = mix(sat(NdL * 2.0 + 0.1) * 0.4, sat(NdL * 0.6 + 0.55), far);
  diff = mix(diff, sat(NdL * 1.1 + 0.05), solid);
  float trans = (pow(fwd, 4.0) * 1.1 + pow(fwd, 1.6) * 0.25) * far * (1.0 - solid);
  vec3 sun = uSunColor * sunVis;
  // Light reaching the seabed dims with depth.
  sun *= exp(min(vWorld.y, 0.0) * 0.35);
  vec3 col = alb * sun * (diff + trans * vec3(1.1, 0.85, 0.55));
  col += vec3(0.9, 0.75, 0.55) * plumes * sun * (0.08 + trans * 0.9);
  col += alb * mix(uAmbGround, uAmbSky, 0.65) * mix(0.35, 1.0, far) * mix(1.0, 0.5, under);
  // Wet sand holds a sheen of the sky and a smear of the sun.
  float gloss = wet * beach * (1.0 - steep) * (1.0 - under);
  float fres = pow(1.0 - sat(dot(N, V)), 4.0);
  vec3 Hs = normalize(L + V);
  col += gloss * (uAmbSky * 0.6 * fres + uSunColor * sunVis * 0.5 * pow(sat(dot(N, Hs)), 90.0));
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
function ridgeNoise(a, freq, seed) {
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

// Distant land along the horizon, beyond the terrain: a curtain around the camera
// whose skyline dips low under the sun and rises into mountains to either side.
function makeRange(radius, height, freq, seed, sunA, low) {
  const segs = 1100;
  const pos = [];
  const idx = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    // Walk the noise around a circle so the skyline wraps seamlessly.
    const u = Math.cos(a) * 3 + 10;
    const v = Math.sin(a) * 3 + 10;
    let h = ridgeNoise(u + v * 0.37, freq, seed) * 0.7 + ridgeNoise(v - u * 0.21, freq * 1.3, seed + 5) * 0.3;
    // Bearing from the sun: open sea beneath it, the land stepping up to either side.
    const d = Math.abs(((a - sunA + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI);
    h *= low + (1 - low) * smoothstep(0.15, 1.1, d);
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    pos.push(x, -400, z, x, h * height, z);
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
uniform float uTop;
varying vec3 vWorld;
void main() {
  // Crests catch a little of the low sun; the feet sink into the haze.
  float up = smoothstep(0.0, uTop, vWorld.y);
  vec3 col = uTint * (0.7 + 0.5 * up);
  gl_FragColor = vec4(applyFog(col, vWorld), 1.0);
}
`;

export class Hills {
  constructor(shared) {
    this.group = new THREE.Group();
    const sunA = Math.atan2(-Math.cos(SUN_AZIMUTH), Math.sin(SUN_AZIMUTH));
    const ranges = [
      { radius: 14000, height: 520, freq: 0.9, seed: 3.1, low: 0.12, tint: [0.035, 0.035, 0.045] },
      { radius: 19000, height: 800, freq: 0.7, seed: 8.3, low: 0.16, tint: [0.045, 0.045, 0.06] },
      { radius: 26000, height: 1300, freq: 0.55, seed: 1.9, low: 0.2, tint: [0.06, 0.06, 0.08] },
    ];
    this.materials = [];
    ranges.forEach((r, i) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          ...shared,
          uCenter: { value: new THREE.Vector2() },
          uTint: { value: new THREE.Color().setRGB(...r.tint) },
          uTop: { value: r.height * 0.6 },
        },
        vertexShader: rangeVert,
        fragmentShader: rangeFrag,
      });
      const mesh = new THREE.Mesh(makeRange(r.radius, r.height, r.freq, r.seed, sunA, r.low), mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 9 + i;
      this.materials.push(mat);
      this.group.add(mesh);
    });
  }

  update(camera) {
    for (const m of this.materials) m.uniforms.uCenter.value.set(camera.position.x, camera.position.z);
  }
}
