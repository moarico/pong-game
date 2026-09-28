import * as THREE from 'three';
import { common, terrain as terrainGLSL } from './glsl.js';
import { TERRAIN, GUST } from './config.js';
import { mulberry32 } from './noise.js';

// ---------------------------------------------------------------------------
// The land never changes, so what the shaders need to know about it is baked
// once at startup instead of being worked out again by every vertex of every
// frame: height, slope and hill shade near the hilltop (1 m texels) and across
// the bay (16 m texels), and under the grass a finer map of the ground height
// and the patchiness that decides which blades are pale and where plumes clump.
// Heights near the hilltop are stored relative to it, so half floats hold them
// to about a centimetre.
// ---------------------------------------------------------------------------

export const LAND = {
  base: TERRAIN.top,
  near: 1024, // metres across, centred on the spawn
  far: 16000,
  grass: 768,
  res: 1024,
};

const f1 = (x) => x.toFixed(1);

// Uniform declarations and lookups for shaders that read the maps.
export const landGLSL = /* glsl */ `
uniform sampler2D uLandNear; // height - base, normal.x, normal.z, sun visibility
uniform sampler2D uLandFar; // height, normal.x, normal.z, sun visibility
uniform sampler2D uLandGrass; // height - base, patch, fine patch, clump
uniform float uLandOk;
#define LAND_BASE ${f1(LAND.base)}
#define LAND_NEAR ${f1(LAND.near)}
#define LAND_FAR ${f1(LAND.far)}
#define LAND_GRASS ${f1(LAND.grass)}

// x: height, yz: normal.xz, w: sun visibility. Near map on the hilltop, blending
// into the far map before its edge.
vec4 landSample(vec2 p) {
  vec4 f = textureLod(uLandFar, p / LAND_FAR + 0.5, 0.0);
  float edge = max(abs(p.x), abs(p.y)) / (LAND_NEAR * 0.5);
  if (edge > 0.97) return f;
  vec4 n = textureLod(uLandNear, p / LAND_NEAR + 0.5, 0.0);
  n.x += LAND_BASE;
  return mix(n, f, smoothstep(0.8, 0.97, edge));
}

bool landCovers(vec2 p) {
  return uLandOk > 0.5 && max(abs(p.x), abs(p.y)) < LAND_FAR * 0.49;
}

vec3 landNormal(vec4 s) {
  return normalize(vec3(s.y, sqrt(max(1.0 - s.y * s.y - s.z * s.z, 0.0)), s.z));
}

// Under the grass: x height, y patch, z fine patch, w clump.
vec4 grassLand(vec2 p) {
  vec4 g = textureLod(uLandGrass, p / LAND_GRASS + 0.5, 0.0);
  g.x += LAND_BASE;
  return g;
}
`;

const bakeVert = 'varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }';

const shapeFrag = /* glsl */ `
${common}
uniform vec3 uSunDir;
${terrainGLSL}
uniform float uSize;
uniform float uBase;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float h = terrainHeight(p);
  vec3 n = terrainNormal(p);
  float sv = terrainSunVis(vec3(p.x, h, p.y) + n * 0.05);
  gl_FragColor = vec4(h - uBase, n.x, n.z, sv);
}
`;

const grassFrag = /* glsl */ `
${common}
uniform vec3 uSunDir;
${terrainGLSL}
uniform float uSize;
uniform float uBase;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float patchN = inoise(p * 0.045 + 7.0);
  float patchN2 = inoise(p * 0.21 - 3.0);
  float clump = inoise(p * 0.085 + 13.0) * 0.7 + inoise(p * 0.3 - 5.0) * 0.3;
  gl_FragColor = vec4(terrainHeight(p) - uBase, patchN, patchN2, clump);
}
`;

// Gust noise: a small tiling value-noise texture (4 texels to a lattice cell).
// The grass samples it on the GPU and the cloth reads the very same bytes here,
// so the gust that bends the field is the gust that tugs the cloak.
function makeGustData() {
  const { res, cells } = GUST;
  const rand = mulberry32(1234);
  const lat = new Float32Array(cells * cells);
  for (let i = 0; i < lat.length; i++) lat[i] = rand();
  const at = (i, j) => lat[((j % cells + cells) % cells) * cells + ((i % cells + cells) % cells)];
  const data = new Uint8Array(res * res);
  const k = res / cells;
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = (x + 0.5) / k;
      const v = (y + 0.5) / k;
      const i = Math.floor(u);
      const j = Math.floor(v);
      let fx = u - i;
      let fy = v - j;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const a = at(i, j) + (at(i + 1, j) - at(i, j)) * fx;
      const b = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * fx;
      data[y * res + x] = Math.round((a + (b - a) * fy) * 255);
    }
  }
  return data;
}
export const gustData = makeGustData();

// Bilinear, wrapping lookup of the gust texture at lattice coordinates (u, v):
// the same sample the GPU takes.
export function gustSample(u, v) {
  const { res, cells } = GUST;
  const k = res / cells;
  const x = u * k - 0.5;
  const y = v * k - 0.5;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const w = (n) => ((n % res) + res) % res;
  const d = gustData;
  const a = d[w(y0) * res + w(x0)];
  const b = d[w(y0) * res + w(x0 + 1)];
  const c = d[w(y0 + 1) * res + w(x0)];
  const e = d[w(y0 + 1) * res + w(x0 + 1)];
  return ((a + (b - a) * fx) * (1 - fy) + (c + (e - c) * fx) * fy) / 255;
}

export function makeGustTexture() {
  const t = new THREE.DataTexture(gustData, GUST.res, GUST.res, THREE.RedFormat, THREE.UnsignedByteType);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

// Bake the maps (needs half-float render targets). Returns false if it could not.
export function bakeLand(renderer, shared) {
  const make = () => new THREE.WebGLRenderTarget(LAND.res, LAND.res, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  const cam = new THREE.Camera();
  const prev = renderer.getRenderTarget();
  const run = (frag, size, base) => {
    const target = make();
    const mat = new THREE.ShaderMaterial({
      uniforms: { uSize: { value: size }, uBase: { value: base }, uSunDir: shared.uSunDir },
      vertexShader: bakeVert,
      fragmentShader: frag,
      depthTest: false,
      depthWrite: false,
    });
    quad.material = mat;
    renderer.setRenderTarget(target);
    renderer.render(quad, cam);
    mat.dispose();
    return target;
  };
  try {
    const near = run(shapeFrag, LAND.near, LAND.base);
    const far = run(shapeFrag, LAND.far, 0);
    const grass = run(grassFrag, LAND.grass, LAND.base);
    // A quick check that the bake produced numbers where the spawn is.
    const px = new Uint16Array(4);
    renderer.readRenderTargetPixels(near, LAND.res >> 1, LAND.res >> 1, 1, 1, px);
    renderer.setRenderTarget(prev);
    quad.geometry.dispose();
    // (Where half floats cannot be read back the buffer stays zero, which passes.)
    const h = THREE.DataUtils.fromHalfFloat(px[0]);
    if (!Number.isFinite(h) || Math.abs(h) > 40) {
      near.dispose();
      far.dispose();
      grass.dispose();
      return false;
    }
    shared.uLandNear.value = near.texture;
    shared.uLandFar.value = far.texture;
    shared.uLandGrass.value = grass.texture;
    shared.uLandOk.value = 1;
    return true;
  } catch (err) {
    renderer.setRenderTarget(prev);
    console.warn('land bake failed', err);
    return false;
  }
}
