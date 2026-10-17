// Minecraft-style blocks: 16x16 pixel-art textures in a texture array, a lit block material
// with per-corner ambient occlusion and sky-coloured distance fog, and voxel meshers.
import * as THREE from 'three';

// ------------------------------------------------------------------ block ids
export const B = {
  AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4, SNOW: 5, LOG: 6, LEAVES: 7, PLANKS: 8, COBBLE: 9,
  BRICK: 10, GRAVEL: 11, GLOW: 12, WOOL_BLUE: 13, WOOL_ORANGE: 14, CONCRETE: 15, DARK: 16, QUARTZ: 17,
  GLASS: 18, ROOF: 19, LAMP: 20, SPRUCE: 21, SPRUCE_LOG: 22, CLAY: 23, DEEPSLATE: 24, IRON: 25, WATER: 26,
  WOOL_WHITE: 27, OBSIDIAN: 28,
  // car parts
  PAINT: 29, TINT_GLASS: 30, CHROME: 31, HEADLIGHT: 32, TAILLIGHT: 33, RUBBER: 34, CARBON: 35, BOOSTLIGHT: 36,
};

// texture layers
const L = {
  grassTop: 0, grassSide: 1, dirt: 2, stone: 3, sand: 4, snow: 5, snowSide: 6, logSide: 7, logTop: 8, leaves: 9,
  planks: 10, cobble: 11, brick: 12, gravel: 13, glow: 14, woolBlue: 15, woolOrange: 16, concrete: 17, dark: 18,
  quartz: 19, glass: 20, roof: 21, lamp: 22, spruce: 23, spruceLog: 24, clay: 25, deepslate: 26, iron: 27, water: 28,
  woolWhite: 29, obsidian: 30, paint: 31, tint: 32, rubber: 33, carbon: 34, light: 35,
};
const LAYERS = 36;

// faces: [top, side, bottom] texture layers, plus emission and surface (roughness, metalness)
export const BLOCKS = [];
function def(id, top, side = top, bottom = top, emit = 0, rough = 0.85, metal = 0) {
  BLOCKS[id] = { top, side, bottom, emit, rough, metal };
}
def(B.GRASS, L.grassTop, L.grassSide, L.dirt);
def(B.DIRT, L.dirt);
def(B.STONE, L.stone);
def(B.SAND, L.sand);
def(B.SNOW, L.snow, L.snowSide, L.dirt);
def(B.LOG, L.logTop, L.logSide, L.logTop);
def(B.LEAVES, L.leaves);
def(B.PLANKS, L.planks);
def(B.COBBLE, L.cobble);
def(B.BRICK, L.brick);
def(B.GRAVEL, L.gravel);
def(B.GLOW, L.glow, L.glow, L.glow, 1.6, 0.6);
def(B.WOOL_BLUE, L.woolBlue, L.woolBlue, L.woolBlue, 0, 0.95);
def(B.WOOL_ORANGE, L.woolOrange, L.woolOrange, L.woolOrange, 0, 0.95);
def(B.CONCRETE, L.concrete, L.concrete, L.concrete, 0, 0.7);
def(B.DARK, L.dark, L.dark, L.dark, 0, 0.5, 0.3);
def(B.QUARTZ, L.quartz, L.quartz, L.quartz, 0, 0.45);
def(B.GLASS, L.glass, L.glass, L.glass, 0, 0.1, 0.2);
def(B.ROOF, L.roof);
def(B.LAMP, L.lamp, L.lamp, L.lamp, 3.2, 0.3);
def(B.SPRUCE, L.spruce);
def(B.SPRUCE_LOG, L.logTop, L.spruceLog, L.logTop);
def(B.CLAY, L.clay);
def(B.DEEPSLATE, L.deepslate);
def(B.IRON, L.iron, L.iron, L.iron, 0, 0.35, 0.8);
def(B.WATER, L.water, L.water, L.water, 0, 0.1);
def(B.WOOL_WHITE, L.woolWhite, L.woolWhite, L.woolWhite, 0, 0.95);
def(B.OBSIDIAN, L.obsidian, L.obsidian, L.obsidian, 0, 0.3, 0.2);
def(B.PAINT, L.paint, L.paint, L.paint, 0, 0.26, 0.45);
def(B.TINT_GLASS, L.tint, L.tint, L.tint, 0, 0.05, 0.4);
def(B.CHROME, L.iron, L.iron, L.iron, 0, 0.14, 1);
def(B.HEADLIGHT, L.light, L.light, L.light, 1.0, 0.2);
def(B.TAILLIGHT, L.light, L.light, L.light, 2.2, 0.2);
def(B.RUBBER, L.rubber, L.rubber, L.rubber, 0, 0.9);
def(B.CARBON, L.carbon, L.carbon, L.carbon, 0, 0.4, 0.3);
def(B.BOOSTLIGHT, L.light, L.light, L.light, 1.5, 0.3);

// ------------------------------------------------------------------ pixel art
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];

function paintLayers() {
  const N = 16;
  const data = new Uint8Array(N * N * 4 * LAYERS);
  const put = (layer, x, y, c, a = 255) => {
    const o = (layer * N * N + y * N + x) * 4;
    data[o] = Math.max(0, Math.min(255, c[0]));
    data[o + 1] = Math.max(0, Math.min(255, c[1]));
    data[o + 2] = Math.max(0, Math.min(255, c[2]));
    data[o + 3] = a;
  };
  const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  // noisy fill from a small palette
  const noisy = (layer, pal, seed, weights) => {
    const r = rng(seed);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = r();
      let i = 0;
      if (weights) { let acc = 0; for (i = 0; i < pal.length - 1; i++) { acc += weights[i]; if (v < acc) break; } } else i = Math.floor(v * pal.length);
      put(layer, x, y, hex(pal[i]));
    }
  };
  noisy(L.grassTop, [0x5d9c3a, 0x6aab42, 0x4f8a31, 0x74b54a, 0x568f36], 1);
  noisy(L.dirt, [0x8a5d3b, 0x7a5232, 0x966a45, 0x6b462a, 0x84593a], 2);
  noisy(L.grassSide, [0x8a5d3b, 0x7a5232, 0x966a45, 0x6b462a], 3);
  {
    const r = rng(4);
    for (let x = 0; x < N; x++) {
      const d = 3 + Math.floor(r() * 3);
      for (let y = 0; y < d; y++) put(L.grassSide, x, y, hex([0x5d9c3a, 0x6aab42, 0x4f8a31][Math.floor(r() * 3)]));
    }
  }
  noisy(L.stone, [0x828282, 0x777777, 0x8e8e8e, 0x6c6c6c, 0x7d7d7d], 5);
  noisy(L.sand, [0xdbcf9b, 0xd3c590, 0xe3d8a8, 0xcbbd86], 6);
  noisy(L.snow, [0xf4f8fc, 0xe8eef6, 0xffffff, 0xdfe7f1], 7);
  noisy(L.snowSide, [0x8a5d3b, 0x7a5232, 0x966a45, 0x6b462a], 8);
  {
    const r = rng(9);
    for (let x = 0; x < N; x++) { const d = 3 + Math.floor(r() * 3); for (let y = 0; y < d; y++) put(L.snowSide, x, y, hex([0xf4f8fc, 0xe8eef6, 0xffffff][Math.floor(r() * 3)])); }
  }
  // log bark: vertical streaks
  {
    const r = rng(10);
    for (let x = 0; x < N; x++) {
      const base = [0x6b4d2c, 0x5a3f22, 0x76552f][Math.floor(r() * 3)];
      for (let y = 0; y < N; y++) put(L.logSide, x, y, shade(hex(base), 0.85 + r() * 0.25));
    }
    const r2 = rng(11);
    for (let x = 0; x < N; x++) {
      const base = [0x3e2a18, 0x332314, 0x4a3320][Math.floor(r2() * 3)];
      for (let y = 0; y < N; y++) put(L.spruceLog, x, y, shade(hex(base), 0.85 + r2() * 0.25));
    }
  }
  // log top: rings
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    const ring = Math.floor(d) % 2;
    put(L.logTop, x, y, d > 6.5 ? hex(0x5a3f22) : ring ? hex(0xb08a5a) : hex(0x9c7848));
  }
  noisy(L.leaves, [0x3f7a2a, 0x356b22, 0x4a8a33, 0x2c5a1c, 0x22471a], 12, [0.25, 0.25, 0.2, 0.18, 0.12]);
  noisy(L.spruce, [0x2c4f2c, 0x24432a, 0x335a33, 0x1c351f], 13);
  // planks
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const band = Math.floor(y / 4);
    let c = hex([0xa8834f, 0x9c7845, 0xb08b57, 0x987443][band]);
    if (y % 4 === 3 || (x === (band * 5 + 3) % 16)) c = hex(0x6e5130);
    put(L.planks, x, y, shade(c, 0.92 + ((x * 7 + y * 3) % 5) * 0.03));
  }
  // cobble: blobby stones with dark mortar
  {
    const r = rng(14);
    const cells = [];
    for (let i = 0; i < 11; i++) cells.push([r() * 16, r() * 16, 0.75 + r() * 0.35]);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let d1 = 99, d2 = 99, k = 1;
      for (const [cx, cy, kk] of cells) {
        for (const [ox, oy] of [[0, 0], [16, 0], [-16, 0], [0, 16], [0, -16]]) {
          const d = Math.hypot(x - cx - ox, y - cy - oy);
          if (d < d1) { d2 = d1; d1 = d; k = kk; } else if (d < d2) d2 = d;
        }
      }
      put(L.cobble, x, y, d2 - d1 < 1.1 ? hex(0x4a4a4a) : shade(hex(0x8d8d8d), k));
    }
  }
  // stone bricks
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const row = Math.floor(y / 4);
    const off = row % 2 ? 4 : 0;
    const mortar = y % 4 === 0 || (x + off) % 8 === 0;
    put(L.brick, x, y, mortar ? hex(0x5c5c5c) : shade(hex(0x8b8b8b), 0.9 + ((x * 13 + y * 7) % 6) * 0.03));
  }
  noisy(L.gravel, [0x8a8580, 0x6f6a66, 0x9c968f, 0x5c5855, 0x7c7671], 15);
  // glowstone
  {
    const r = rng(16);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) put(L.glow, x, y, hex([0xffe39a, 0xf9c45a, 0xd99a3a, 0xfff2c8, 0xb8782a][Math.floor(r() * 5)]));
  }
  // wool / concrete / quartz with a subtle weave
  const weave = (layer, base, seed) => {
    const r = rng(seed);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) put(layer, x, y, shade(hex(base), 0.88 + r() * 0.16 - ((x + y) % 2) * 0.04));
  };
  weave(L.woolBlue, 0x2f62d6, 17);
  weave(L.woolOrange, 0xf07a1c, 18);
  weave(L.woolWhite, 0xe8ecf0, 31);
  weave(L.concrete, 0x9a9ea6, 19);
  weave(L.dark, 0x2a2d33, 20);
  weave(L.quartz, 0xe9e4dc, 21);
  weave(L.deepslate, 0x3e3e44, 26);
  weave(L.obsidian, 0x1a1424, 32);
  // glass: frame + pale pane
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const edge = x === 0 || y === 0 || x === 15 || y === 15;
    put(L.glass, x, y, edge ? hex(0xcfd9e0) : (x - y === 3 || x - y === 4) ? hex(0xeaf4fb) : hex(0x9cc3d8));
  }
  // red roof tiles
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const row = Math.floor(y / 4), off = row % 2 ? 2 : 0;
    const gap = y % 4 === 3 || (x + off) % 4 === 0;
    put(L.roof, x, y, gap ? hex(0x6a2418) : shade(hex(0xa8452e), 0.9 + ((x * 5 + y) % 4) * 0.05));
  }
  // lamp panel: bright cells in a dark frame
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const frame = x < 1 || y < 1 || x > 14 || y > 14 || x === 8 || y === 8;
    put(L.lamp, x, y, frame ? hex(0x2a2d33) : hex(0xfff6e0));
  }
  noisy(L.clay, [0xa8643f, 0x9a5a37, 0xb46e46, 0x8e5232], 22);
  // iron: brushed metal
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) put(L.iron, x, y, shade(hex(0xc4c9cf), 0.86 + ((x * 3 + y * 11) % 7) * 0.025 + (x === 0 || y === 0 ? -0.15 : 0)));
  noisy(L.water, [0x2e64b8, 0x3a72c8, 0x2a5aa8], 23);
  // car paint: white base (tinted per team) with a soft bevel so each block reads
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const edge = x === 0 || y === 0 ? 1.08 : x === 15 || y === 15 ? 0.82 : 1;
    put(L.paint, x, y, shade([235, 235, 238], edge * (0.97 + ((x * 7 + y * 13) % 5) * 0.012)));
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const edge = x === 0 || y === 0 || x === 15 || y === 15;
    put(L.tint, x, y, edge ? hex(0x22262c) : (x - y === 4 || x - y === 5) ? hex(0x3c4a5a) : hex(0x10161e));
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) put(L.rubber, x, y, hex((x + y * 3) % 7 === 0 ? 0x101012 : y % 4 === 0 ? 0x26262a : 0x1c1c1f));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) put(L.carbon, x, y, hex(((x >> 1) + (y >> 1)) % 2 ? 0x1c1e22 : 0x2a2d33));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    put(L.light, x, y, shade([255, 255, 255], d > 6.5 ? 0.55 : d > 4.5 ? 0.85 : 1));
  }
  const tex = new THREE.DataArrayTexture(data, N, N, LAYERS);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

let blockTex = null;
export function blockTexture() {
  if (!blockTex) blockTex = paintLayers();
  return blockTex;
}

// ------------------------------------------------------------------ material
// Shared sky cube for fog: distant blocks fade into the actual sky behind them.
export const skyFog = { cube: { value: null }, density: { value: 0.00055 }, mix: { value: 1 }, tint: { value: new THREE.Color(1, 1, 1) } };

// MeshStandardMaterial driven by per-vertex block layer, AO, emission and surface values.
export function blockMaterial({ fog = true, side = THREE.FrontSide, emissiveBoost = 1 } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 1, metalness: 0, side, fog: false });
  mat.userData.emissiveBoost = { value: emissiveBoost };
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uBlocks = { value: blockTexture() };
    sh.uniforms.uSkyCube = skyFog.cube;
    sh.uniforms.uFogDensity = skyFog.density;
    sh.uniforms.uFogMix = skyFog.mix;
    sh.uniforms.uFogTint = skyFog.tint;
    sh.uniforms.uEmitBoost = mat.userData.emissiveBoost;
    sh.defines = sh.defines || {};
    if (fog) sh.defines.BLOCK_FOG = '';
    sh.vertexShader = `attribute float aLayer;
attribute vec4 aSurf; // ao, emit, roughness, metalness
varying float vLayer;
varying vec4 vSurf;
varying vec2 vBUv;
varying vec3 vWorldDir;
` + sh.vertexShader
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n vLayer = aLayer; vSurf = aSurf; vBUv = uv;')
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
 {
   vec4 wp = vec4(transformed, 1.0);
   #ifdef USE_INSTANCING
     wp = instanceMatrix * wp;
   #endif
   wp = modelMatrix * wp;
   vWorldDir = wp.xyz - cameraPosition;
 }`);
    sh.fragmentShader = `uniform sampler2DArray uBlocks;
uniform samplerCube uSkyCube;
uniform float uFogDensity, uFogMix, uEmitBoost;
uniform vec3 uFogTint;
varying float vLayer;
varying vec4 vSurf;
varying vec2 vBUv;
varying vec3 vWorldDir;
` + sh.fragmentShader
      .replace('#include <map_fragment>', `vec4 blockTexel = texture(uBlocks, vec3(vBUv.x, 1.0 - vBUv.y, vLayer));
 diffuseColor.rgb *= blockTexel.rgb * vSurf.x;`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vSurf.z;')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vSurf.w;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += blockTexel.rgb * vColor.rgb * vSurf.y * uEmitBoost;')
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
 #ifdef BLOCK_FOG
 {
   float dist = length(vWorldDir);
   float f = 1.0 - exp(-pow(dist * uFogDensity, 1.6));
   vec3 dir = normalize(vWorldDir);
   dir.y = max(dir.y, 0.015);
   vec3 skyC = textureLod(uSkyCube, dir, 3.0).rgb * uFogTint;
   gl_FragColor.rgb = mix(gl_FragColor.rgb, skyC, clamp(f, 0.0, 1.0) * uFogMix);
 }
 #endif`);
  };
  mat.customProgramCacheKey = () => `block${fog ? 1 : 0}`;
  return mat;
}

// ------------------------------------------------------------------ geometry builder
export class QuadBuilder {
  constructor() {
    this.pos = [];
    this.nor = [];
    this.uv = [];
    this.col = [];
    this.layer = [];
    this.surf = [];
    this.idx = [];
  }

  // p: 4 corners (counter-clockwise seen from outside), n normal, uvs per corner, ao per corner
  quad(p, n, uvs, layer, ao, color, emit, rough, metal) {
    const base = this.pos.length / 3;
    for (let i = 0; i < 4; i++) {
      this.pos.push(p[i][0], p[i][1], p[i][2]);
      this.nor.push(n[0], n[1], n[2]);
      this.uv.push(uvs[i][0], uvs[i][1]);
      this.col.push(color[0], color[1], color[2]);
      this.layer.push(layer);
      this.surf.push(ao[i], emit, rough, metal);
    }
    // flip the diagonal so AO interpolates without the classic anisotropy artefact
    if (ao[0] + ao[2] < ao[1] + ao[3]) this.idx.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
    else this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  get quads() { return this.pos.length / 12; }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aLayer', new THREE.Float32BufferAttribute(this.layer, 1));
    g.setAttribute('aSurf', new THREE.Float32BufferAttribute(this.surf, 4));
    g.setIndex(this.pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
    g.computeBoundingSphere();
    return g;
  }
}

// ------------------------------------------------------------------ 3D voxel grids
const FACES = [
  { n: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], u: [2, 1] }, // +x
  { n: [-1, 0, 0], c: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], u: [2, 1] }, // -x
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], u: [0, 2] }, // +y
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], u: [0, 2] }, // -y
  { n: [0, 0, 1], c: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], u: [0, 1] }, // +z
  { n: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], u: [0, 1] }, // -z
];

export class VoxelGrid {
  constructor(nx, ny, nz) {
    this.nx = nx; this.ny = ny; this.nz = nz;
    this.cells = new Uint8Array(nx * ny * nz);
    this.tints = null; // optional per-cell RGB tint (Uint8Array, 3 per cell)
  }

  idx(x, y, z) { return x + this.nx * (y + this.ny * z); }

  get(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= this.nx || y >= this.ny || z >= this.nz) return 0;
    return this.cells[this.idx(x, y, z)];
  }

  set(x, y, z, b, tint) {
    if (x < 0 || y < 0 || z < 0 || x >= this.nx || y >= this.ny || z >= this.nz) return;
    const i = this.idx(x, y, z);
    this.cells[i] = b;
    if (tint) {
      if (!this.tints) this.tints = new Uint8Array(this.cells.length * 3).fill(255);
      this.tints[i * 3] = tint[0]; this.tints[i * 3 + 1] = tint[1]; this.tints[i * 3 + 2] = tint[2];
    }
  }

  box(x0, y0, z0, x1, y1, z1, b) {
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, z, b);
  }

  solid(x, y, z) {
    const b = this.get(x, y, z);
    return b !== 0 && b !== B.GLASS && b !== B.WATER;
  }

  // Greedy mesher: visible faces with the same block, tint and corner AO are merged into
  // rectangles. origin + voxel size map the grid into world/local space.
  mesh(builder, size = 1, origin = [0, 0, 0], opts = {}) {
    const { aoStrength = 0.42 } = opts;
    const dims = [this.nx, this.ny, this.nz];
    const tintKey = (i) => (this.tints ? this.tints[i * 3] * 65536 + this.tints[i * 3 + 1] * 256 + this.tints[i * 3 + 2] : 0xffffff);
    const FACE_SHADE = [0.86, 1, 0.92];
    for (let d = 0; d < 3; d++) {
      const u = (d + 1) % 3, v = (d + 2) % 3;
      const nu = dims[u], nv = dims[v];
      const keys = new Float64Array(nu * nv);
      const aos = new Float32Array(nu * nv * 4);
      const cell = [0, 0, 0], o = [0, 0, 0], t = [0, 0, 0];
      for (const sgn of [1, -1]) {
        for (let x = 0; x < dims[d]; x++) {
          // build the mask of visible faces in this slice
          for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
            cell[d] = x; cell[u] = i; cell[v] = j;
            const k = j * nu + i;
            keys[k] = 0;
            const b = this.get(cell[0], cell[1], cell[2]);
            if (!b) continue;
            o[0] = cell[0]; o[1] = cell[1]; o[2] = cell[2]; o[d] += sgn;
            const nb = this.get(o[0], o[1], o[2]);
            if (nb === b || (nb && nb !== B.GLASS && nb !== B.WATER)) continue;
            let aoKey = 0;
            for (let c = 0; c < 4; c++) {
              const cu = c === 1 || c === 2 ? 1 : -1, cv = c >= 2 ? 1 : -1;
              t[0] = o[0]; t[1] = o[1]; t[2] = o[2]; t[u] += cu;
              const a1 = this.solid(t[0], t[1], t[2]) ? 1 : 0;
              t[u] -= cu; t[v] += cv;
              const a2 = this.solid(t[0], t[1], t[2]) ? 1 : 0;
              t[u] += cu;
              const a3 = this.solid(t[0], t[1], t[2]) ? 1 : 0;
              const occ = a1 && a2 ? 3 : a1 + a2 + a3;
              aos[k * 4 + c] = 1 - occ * (aoStrength / 3);
              aoKey = aoKey * 4 + occ;
            }
            keys[k] = b + 256 * aoKey + 65536 * 256 * tintKey(this.idx(cell[0], cell[1], cell[2]));
          }
          // merge rectangles
          for (let j = 0; j < nv; j++) for (let i = 0; i < nu;) {
            const k = j * nu + i;
            const key = keys[k];
            if (!key) { i++; continue; }
            let w = 1;
            while (i + w < nu && keys[k + w] === key) w++;
            let h = 1;
            outer: while (j + h < nv) {
              for (let q = 0; q < w; q++) if (keys[(j + h) * nu + i + q] !== key) break outer;
              h++;
            }
            for (let jj = 0; jj < h; jj++) for (let q = 0; q < w; q++) keys[(j + jj) * nu + i + q] = 0;
            const b = key % 256;
            const def = BLOCKS[b];
            cell[d] = x; cell[u] = i; cell[v] = j;
            const ci = this.idx(cell[0], cell[1], cell[2]);
            const tint = this.tints ? [this.tints[ci * 3] / 255, this.tints[ci * 3 + 1] / 255, this.tints[ci * 3 + 2] / 255] : [1, 1, 1];
            const plane = x + (sgn > 0 ? 1 : 0);
            const rect = [[i, j], [i + w, j], [i + w, j + h], [i, j + h]];
            const order = sgn > 0 ? [0, 1, 2, 3] : [0, 3, 2, 1];
            const corners = [], uvs = [], ao = [];
            const shade = d === 1 ? (sgn > 0 ? 1 : 0.7) : FACE_SHADE[d];
            for (const c of order) {
              const p = [0, 0, 0];
              p[d] = plane; p[u] = rect[c][0]; p[v] = rect[c][1];
              corners.push([origin[0] + p[0] * size, origin[1] + p[1] * size, origin[2] + p[2] * size]);
              // textures stay upright on walls: (horizontal, y)
              uvs.push(d === 0 ? [p[2], p[1]] : d === 2 ? [p[0], p[1]] : [p[0], p[2]]);
              ao.push(aos[k * 4 + c] * shade);
            }
            const n = [0, 0, 0];
            n[d] = sgn;
            const layer = d === 1 ? (sgn > 0 ? def.top : def.bottom) : def.side;
            builder.quad(corners, n, uvs, layer, ao, tint, def.emit, def.rough, def.metal);
            i += w;
          }
        }
      }
    }
    return builder;
  }
}

export { rng, L as LAYER };
