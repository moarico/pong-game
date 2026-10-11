// Realistic version of the landscape: the same height field as the block world, drawn as a
// smooth mesh with blended grass, rock, sand, snow and paving, plus broadleaf and pine trees.
// The mesh is a polar grid around the stadium whose rings widen with distance, cut into
// sectors so the parts behind the camera are culled.
import * as THREE from 'three';
import { skyFog, rng } from './blocks.js';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ detail textures
// Tileable grey detail maps (mean ~0.5); the terrain colour comes from the vertices.
function valueNoise(N, cells, seed) {
  const r = rng(seed);
  const g = new Float32Array(cells * cells).map(() => r());
  const out = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const fx = (x / N) * cells, fy = (y / N) * cells;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = fx - x0, ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const at = (i, j) => g[((j % cells) * cells) + (i % cells)];
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
    out[y * N + x] = a + (b - a) * sy;
  }
  return out;
}

function greyTexture(N, data) {
  let mean = 0;
  for (let i = 0; i < data.length; i++) mean += data[i];
  mean /= data.length;
  const px = new Uint8Array(N * N * 4);
  for (let i = 0; i < N * N; i++) {
    const v = Math.max(0, Math.min(255, Math.round((data[i] - mean + 0.5) * 255)));
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
    px[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(px, N, N);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

let detail = null;
function detailTextures() {
  if (detail) return detail;
  const N = 256;
  // grass: soft clumps plus thousands of short blade strokes
  const grass = valueNoise(N, 16, 3).map((v, i) => v * 0.35);
  const r = rng(9);
  for (let k = 0; k < 14000; k++) {
    const x = Math.floor(r() * N), y = Math.floor(r() * N), len = 2 + Math.floor(r() * 4), v = 0.15 + r() * 0.55;
    const lean = r() < 0.5 ? -1 : 1;
    for (let j = 0; j < len; j++) {
      const xx = (x + (j > len / 2 ? lean : 0) + N) % N, yy = (y + j) % N;
      grass[yy * N + xx] += v * (1 - j / len) * 0.6;
    }
  }
  // rock: layered noise with darker cracks
  const n1 = valueNoise(N, 8, 21), n2 = valueNoise(N, 32, 22), n3 = valueNoise(N, 64, 23);
  const rock = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    const crack = Math.abs(n2[i] - 0.5) < 0.025 ? -0.25 : 0;
    rock[i] = n1[i] * 0.5 + n2[i] * 0.3 + n3[i] * 0.2 + crack;
  }
  // paving: square slabs with joints
  const pave = valueNoise(N, 64, 31).map((v) => v * 0.15);
  const slab = valueNoise(4, 4, 32);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const sx = Math.floor(x / 64), sy = Math.floor(y / 64);
    pave[y * N + x] += 0.45 + slab[(sy * 4 + sx) % 16] * 0.12 - ((x % 64) < 2 || (y % 64) < 2 ? 0.3 : 0);
  }
  detail = { grass: greyTexture(N, grass), rock: greyTexture(N, rock), pave: greyTexture(N, pave) };
  return detail;
}

// ------------------------------------------------------------------ sky-cube fog for standard materials
// Same far haze as the block world: distance fog coloured by the live sky.
export function withSkyFog(mat, key) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.uniforms.uSkyCube = skyFog.cube;
    sh.uniforms.uFogDensity = skyFog.density;
    sh.uniforms.uFogMix = skyFog.mix;
    sh.uniforms.uFogTint = skyFog.tint;
    sh.vertexShader = 'varying vec3 vFogDir;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
 {
   vec4 fw = vec4(transformed, 1.0);
   #ifdef USE_INSTANCING
     fw = instanceMatrix * fw;
   #endif
   vFogDir = (modelMatrix * fw).xyz - cameraPosition;
 }`);
    sh.fragmentShader = 'uniform samplerCube uSkyCube;\nuniform float uFogDensity, uFogMix;\nuniform vec3 uFogTint;\nvarying vec3 vFogDir;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
 {
   float fd = length(vFogDir);
   float ff = 1.0 - exp(-pow(fd * uFogDensity, 1.6));
   vec3 dir = normalize(vFogDir);
   dir.y = max(dir.y, 0.015);
   gl_FragColor.rgb = mix(gl_FragColor.rgb, textureLod(uSkyCube, dir, 3.0).rgb * uFogTint, clamp(ff, 0.0, 1.0) * uFogMix);
 }`);
  };
  mat.fog = false;
  mat.customProgramCacheKey = () => key;
  return mat;
}

export function terrainMaterial() {
  const d = detailTextures();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.tGrass = { value: d.grass };
    sh.uniforms.tRock = { value: d.rock };
    sh.uniforms.tPave = { value: d.pave };
    sh.vertexShader = 'attribute vec4 aSurf;\nvarying vec4 vSurf;\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n vSurf = aSurf; vWNrm = normalize(mat3(modelMatrix) * objectNormal);')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'uniform sampler2D tGrass, tRock, tPave;\nvarying vec4 vSurf;\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', `
 vec3 an = abs(normalize(vWNrm));
 float grassD = texture2D(tGrass, vWPos.xz * 0.42).r * 0.6 + texture2D(tGrass, vWPos.xz * 0.057).r * 0.4;
 float rTop = texture2D(tRock, vWPos.xz * 0.06).r;
 float rSide = texture2D(tRock, (an.x > an.z ? vWPos.zy : vWPos.xy) * 0.06).r;
 float rockD = mix(rTop, rSide, smoothstep(0.35, 0.75, 1.0 - an.y));
 float paveD = texture2D(tPave, vWPos.xz * 0.22).r;
 float macro = texture2D(tRock, vWPos.xz * 0.0035).r;
 float wGrass = clamp(1.0 - vSurf.x - vSurf.y - vSurf.z - vSurf.w, 0.0, 1.0);
 float dt = grassD * wGrass + rockD * vSurf.x + mix(0.5, grassD, 0.3) * vSurf.y + mix(0.5, rockD, 0.12) * vSurf.z + paveD * vSurf.w;
 diffuseColor.rgb *= (0.5 + dt) * (0.82 + macro * 0.36);`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = 0.95 - vSurf.z * 0.4 - vSurf.w * 0.12;');
  };
  return withSkyFog(mat, 'terrainReal');
}

// ------------------------------------------------------------------ ground colours
// picked as on-screen (sRGB) colours; vertex colours are linear
export const lin = (c) => c.map((v) => Math.pow(v, 2.2));
const C = Object.fromEntries(Object.entries({
  grassLush: [0.3, 0.44, 0.16], grassDry: [0.5, 0.5, 0.26], dirt: [0.42, 0.33, 0.22],
  rock: [0.47, 0.45, 0.42], rockWarm: [0.53, 0.47, 0.4], sand: [0.8, 0.72, 0.55], wetSand: [0.55, 0.51, 0.42],
  snow: [0.93, 0.94, 0.97], pave: [0.56, 0.56, 0.54],
}).map(([k, v]) => [k, lin(v)]));
const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ------------------------------------------------------------------ terrain mesh
const LAND_Q = {
  high: { seg: 480, growth: 1.03, sectors: 16 },
  medium: { seg: 384, growth: 1.04, sectors: 16 },
  low: { seg: 256, growth: 1.055, sectors: 16 },
};

// env: { heightAt, fbm, SEA_Y, PLAZA_Y, plazaR, extent }
export function buildSmoothLand(group, quality, env) {
  const q = LAND_Q[quality] || LAND_Q.high;
  const { heightAt, fbm, SEA_Y, PLAZA_Y, plazaR, extent } = env;
  const r0 = 100;
  const radii = [];
  for (let r = r0; r < extent * 1.02; r *= q.growth) radii.push(r);
  radii.push(extent * 1.05);
  const mat = terrainMaterial();
  const per = Math.round(q.seg / q.sectors); // segments per sector (seg is a multiple of sectors)
  const meshes = [];
  const surfAt = (x, z, h, ny) => {
    const slope = 1 - ny;
    const re = Math.hypot(x, z * 0.84);
    const paved = 1 - smooth(plazaR - 4, plazaR + 3, re);
    const n = fbm(x / 70 + 3, z / 70, 2);
    const snowLine = 300 - fbm(x / 90, z / 90, 2) * 45;
    const snow = smooth(snowLine - 15, snowLine + 15, h) * (1 - smooth(0.45, 0.7, slope));
    const rock = Math.max(smooth(0.16, 0.36, slope), smooth(170, 230, h) * 0.85) * (1 - snow);
    const sand = (1 - smooth(SEA_Y + 1.5, SEA_Y + 4, h)) * (1 - rock);
    const k = 1 - paved;
    return { paved, rock: rock * k, sand: sand * k * (1 - snow), snow: snow * k, n };
  };
  for (let s = 0; s < q.sectors; s++) {
    const nA = per + 1, nR = radii.length;
    const pos = new Float32Array(nA * nR * 3), nrm = new Float32Array(nA * nR * 3), col = new Float32Array(nA * nR * 3), surf = new Float32Array(nA * nR * 4);
    let v = 0;
    for (let j = 0; j < nR; j++) {
      const r = radii[j];
      const step = Math.max(0.6, r * (q.growth - 1) * 0.5);
      for (let i = 0; i < nA; i++) {
        const a = ((s * per + i) / q.seg) * Math.PI * 2;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        const h = heightAt(x, z);
        const hx = heightAt(x + step, z) - heightAt(x - step, z), hz = heightAt(x, z + step) - heightAt(x, z - step);
        const nv = new THREE.Vector3(-hx / (2 * step), 1, -hz / (2 * step)).normalize();
        pos.set([x, h, z], v * 3);
        nrm.set([nv.x, nv.y, nv.z], v * 3);
        const sf = surfAt(x, z, h, nv.y);
        // colour: grass varies lush to dry, rock warm to grey, wet sand under the waterline
        let c = mix3(C.grassLush, C.grassDry, smooth(-0.25, 0.45, sf.n + (h > 100 ? 0.25 : 0)));
        if (sf.n < -0.2) c = mix3(c, C.dirt, smooth(-0.2, -0.4, sf.n) * 0.4);
        const rockC = mix3(C.rock, C.rockWarm, smooth(-0.3, 0.3, sf.n));
        const sandC = h < SEA_Y ? C.wetSand : C.sand;
        c = mix3(c, rockC, sf.rock);
        c = mix3(c, sandC, sf.sand);
        c = mix3(c, C.snow, sf.snow);
        c = mix3(c, C.pave, sf.paved);
        col.set(c, v * 3);
        surf.set([sf.rock, sf.sand, sf.snow, sf.paved], v * 4);
        v++;
      }
    }
    const idx = [];
    for (let j = 0; j < nR - 1; j++) for (let i = 0; i < nA - 1; i++) {
      const a = j * nA + i, b = a + 1, c = a + nA, d = c + 1;
      // skip cells entirely under the sea
      if (pos[a * 3 + 1] < SEA_Y - 3 && pos[b * 3 + 1] < SEA_Y - 3 && pos[c * 3 + 1] < SEA_Y - 3 && pos[d * 3 + 1] < SEA_Y - 3) continue;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSurf', new THREE.BufferAttribute(surf, 4));
    g.setIndex(idx);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat);
    m.receiveShadow = false;
    group.add(m);
    meshes.push(m);
  }
  // the paved square under the stadium (seen when the victory cinematic lifts it away)
  const disc = new THREE.CircleGeometry(r0 + 1, 96).rotateX(-Math.PI / 2);
  const n = disc.attributes.position.count;
  disc.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).fill(C.pave[0]), 3));
  const ps = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) ps[i * 4 + 3] = 1;
  disc.setAttribute('aSurf', new THREE.BufferAttribute(ps, 4));
  const centre = new THREE.Mesh(disc, mat);
  centre.position.y = PLAZA_Y;
  group.add(centre);
  return { material: mat, meshes };
}

// ------------------------------------------------------------------ trees
// Unit-height trees (base at y = 0); instances scale them to metres.
function colorGeo(g, fn) {
  const p = g.attributes.position;
  const c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) c.set(fn(p.getX(i), p.getY(i), p.getZ(i)), i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}

function bark(g) { return colorGeo(g, () => lin([0.33, 0.25, 0.18])); }

// foliage normals point out of the canopy's centre so it shades like a soft volume
function canopy(geos, centre, shade) {
  const merged = mergeList(geos);
  const p = merged.attributes.position, n = merged.attributes.normal;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i) - centre.x, (p.getY(i) - centre.y) * 1.4, p.getZ(i) - centre.z).normalize();
    n.setXYZ(i, v.x, v.y, v.z);
  }
  return colorGeo(merged, shade);
}

function mergeList(geos) {
  const out = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  for (const g of out) { g.deleteAttribute('uv'); }
  let count = 0;
  for (const g of out) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3), nrm = new Float32Array(count * 3);
  let o = 0;
  for (const g of out) {
    pos.set(g.attributes.position.array, o * 3);
    nrm.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  m.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  return m;
}

function jitter(g, amount, seed) {
  const r = rng(seed);
  const p = g.attributes.position;
  const key = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!key.has(k)) key.set(k, [(r() - 0.5) * amount, (r() - 0.5) * amount, (r() - 0.5) * amount]);
    const d = key.get(k);
    p.setXYZ(i, p.getX(i) + d[0], p.getY(i) + d[1], p.getZ(i) + d[2]);
  }
  return g;
}

export function realTreeGeometry(kind) {
  const leaf = (col, base, top) => {
    const y = lin(col);
    return (x, yy, z) => {
      const t = Math.min(1, Math.max(0, (yy - base) / (top - base)));
      const k = 0.45 + t * 0.75; // darker under the canopy
      return [y[0] * k, y[1] * k, y[2] * k];
    };
  };
  if (kind === 'oak' || kind === 'oakFar') {
    const far = kind === 'oakFar';
    const trunk = bark(new THREE.CylinderGeometry(0.035, 0.06, 0.45, far ? 4 : 6).translate(0, 0.225, 0));
    const blobs = far
      ? [new THREE.IcosahedronGeometry(0.38, 0).scale(1, 0.85, 1).translate(0, 0.6, 0)]
      : [[0, 0.64, 0, 0.34], [0.22, 0.52, 0.06, 0.25], [-0.2, 0.54, -0.1, 0.26], [0.02, 0.5, -0.23, 0.24], [-0.05, 0.82, 0.04, 0.22]]
        .map(([x, y, z, rr], i) => jitter(new THREE.IcosahedronGeometry(rr, 1), rr * 0.3, 40 + i).translate(x, y, z));
    const crown = canopy(blobs, new THREE.Vector3(0, 0.6, 0), leaf([0.27, 0.42, 0.15], 0.3, 1.0));
    return mergeList2([trunk, crown]);
  }
  // pine: stacked drooping cones
  const far = kind === 'spruceFar';
  const trunk = bark(new THREE.CylinderGeometry(0.02, 0.045, 0.4, far ? 4 : 6).translate(0, 0.2, 0));
  const tiers = far
    ? [new THREE.ConeGeometry(0.24, 0.85, 5).translate(0, 0.55, 0)]
    : [[0.26, 0.42, 0.36], [0.21, 0.36, 0.55], [0.16, 0.3, 0.72], [0.1, 0.26, 0.88]].map(([rr, h, y], i) => jitter(new THREE.ConeGeometry(rr, h, 8, 1), rr * 0.18, 60 + i).translate(0, y, 0));
  const crown = canopy(tiers, new THREE.Vector3(0, 0.6, 0), leaf([0.16, 0.3, 0.17], 0.15, 1.0));
  return mergeList2([trunk, crown]);
}

function mergeList2(geos) {
  const out = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let count = 0;
  for (const g of out) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3), nrm = new Float32Array(count * 3), col = new Float32Array(count * 3);
  let o = 0;
  for (const g of out) {
    pos.set(g.attributes.position.array, o * 3);
    nrm.set(g.attributes.normal.array, o * 3);
    col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  m.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  m.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return m;
}

export function treeMaterial() {
  return withSkyFog(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 }), 'treeReal');
}

// candidate tree spots on gentle grass, denser in forest patches
export function treeSpots(env, quality) {
  const { heightAt, fbm, SEA_Y, plazaR, extent } = env;
  const r = rng(77);
  const spots = [];
  const near = quality === 'high' ? 9 : quality === 'medium' ? 11 : 14;
  for (let z = -extent; z < extent; z += near) {
    for (let x = -extent; x < extent; x += near) {
      const d = Math.hypot(x, z);
      if (d > 600 && (Math.abs(x / near) % 2 === 1 || Math.abs(z / near) % 2 === 1)) continue; // sparser far out
      const px = x + (r() - 0.5) * near, pz = z + (r() - 0.5) * near;
      if (Math.hypot(px, pz * 0.84) < plazaR + 30) continue;
      const dens = fbm(px / 180 + 3, pz / 180 - 8, 3);
      if (r() > (dens > 0.05 ? 0.6 : 0.05)) continue;
      const h = heightAt(px, pz);
      if (h < SEA_Y + 3 || h > 260) continue;
      const slope = Math.abs(heightAt(px + 2, pz) - heightAt(px - 2, pz)) / 4 + Math.abs(heightAt(px, pz + 2) - heightAt(px, pz - 2)) / 4;
      if (slope > 0.45) continue;
      spots.push({ x: px, y: h - 0.3, z: pz, pine: h > 70 || dens > 0.32, dens });
    }
  }
  // densest forest first, so a capped count keeps whole woods rather than a thin scatter
  return spots.sort((a, b) => b.dens - a.dens);
}
