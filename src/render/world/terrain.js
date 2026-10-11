// Voxel landscape around the stadium: a stone plaza, rolling hills and forests, snowy
// mountains on the landward side, and an ocean with islands toward the sunset. Columns are
// meshed in chunks with coarser blocks further away, so the world stays cheap to draw.
import * as THREE from 'three';
import { B, BLOCKS, QuadBuilder, VoxelGrid, blockMaterial, rng, skyFog } from './blocks.js';
import { SUNSET_DIR } from './sky.js';
import { buildSmoothLand, realTreeGeometry, treeMaterial, treeSpots } from './landscape.js';

// ------------------------------------------------------------------ noise
function makePerlin(seed) {
  const r = rng(seed);
  const p = new Uint8Array(512);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const grad = (h, x, y) => { switch (h & 7) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y; case 4: return x; case 5: return -x; case 6: return y; default: return -y; } };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const a = p[X] + Y, b = p[X + 1] + Y;
    const l1 = grad(p[a], x, y) + u * (grad(p[b], x - 1, y) - grad(p[a], x, y));
    const l2 = grad(p[a + 1], x, y - 1) + u * (grad(p[b + 1], x - 1, y - 1) - grad(p[a + 1], x, y - 1));
    return (l1 + v * (l2 - l1)) * 0.7;
  };
}
const perlin = makePerlin(1337);
const perlin2 = makePerlin(4242);
function fbm(x, y, oct = 4, n = perlin) {
  let a = 1, s = 0, t = 0;
  for (let i = 0; i < oct; i++) { s += a * n(x, y); t += a; x *= 2.03; y *= 2.03; a *= 0.5; }
  return s / t;
}
function ridged(x, y, oct = 5) {
  let a = 1, s = 0, t = 0, w = 1;
  for (let i = 0; i < oct; i++) {
    let v = 1 - Math.abs(perlin2(x, y));
    v *= v * w;
    w = Math.min(1, v * 1.8);
    s += a * v; t += a;
    x *= 2.1; y *= 2.1; a *= 0.5;
  }
  return s / t;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ height field (meters)
export const PLAZA_Y = -6;
export const SEA_Y = -12;
const PLAZA_R = 178;

export function heightAt(x, z) {
  const r = Math.hypot(x, z * 0.84);
  if (r < PLAZA_R) return PLAZA_Y;
  const len = Math.hypot(x, z) || 1;
  const toSea = (x * SUNSET_DIR.x + z * SUNSET_DIR.z) / len;
  let h = PLAZA_Y + 4 + fbm(x / 430, z / 430, 4) * 60 + fbm(x / 130 + 5, z / 130, 3) * 14;
  // mountains on the landward side, rising with distance
  const mMask = smooth(420, 1250, r) * smooth(0.25, -0.55, toSea);
  h += Math.pow(ridged(x / 760, z / 760, 5), 1.6) * 520 * mMask + mMask * 40;
  // ocean toward the sunset, with a scatter of islands
  const sMask = smooth(330, 720, r) * smooth(-0.15, 0.4, toSea);
  const island = Math.max(0, fbm(x / 240 + 7, z / 240 - 3, 4) - 0.18) * 160;
  h = h * (1 - sMask) + (SEA_Y - 26 + island) * sMask;
  // ease out of the flat plaza
  const b = smooth(PLAZA_R, PLAZA_R + 110, r);
  return PLAZA_Y + (h - PLAZA_Y) * b;
}

function quant(h, size) { return Math.round((h - PLAZA_Y) / size) * size + PLAZA_Y; }

function blocksFor(top, x, z, slope, r) {
  if (r < PLAZA_R + 2) return { top: B.BRICK, under: B.STONE };
  if (top < SEA_Y - 10) return { top: B.GRAVEL, under: B.DEEPSLATE };
  if (top < SEA_Y + 3) return { top: B.SAND, under: B.SAND };
  if (top > 300 - fbm(x / 90, z / 90, 2) * 40) return { top: B.SNOW, under: B.STONE };
  if (slope > 1.25 || top > 190) return { top: B.STONE, under: B.STONE };
  if (slope > 0.8 && fbm(x / 60, z / 60, 2) > 0.1) return { top: B.CLAY, under: B.CLAY };
  return { top: B.GRASS, under: B.DIRT };
}

// grass and leaves vary a little in colour across the land
function grassTint(x, z, top) {
  const n = fbm(x / 300 + 11, z / 300, 2);
  const dry = THREE.MathUtils.clamp(n * 0.8 + (top > 120 ? 0.25 : 0), -0.4, 0.5);
  const qz = (v) => Math.round(v * 40) / 40; // quantised so flat runs can merge
  return [qz(0.92 + dry * 0.25), qz(1.0 - Math.abs(dry) * 0.1), qz(0.85 - dry * 0.3)];
}

// ------------------------------------------------------------------ meshing
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function cellSizeFor(d, q) {
  if (d < 330) return q.near;
  if (d < 720) return q.near * 2;
  if (d < 1350) return q.near * 4;
  return q.near * 8;
}

function buildChunk(builder, cx, cz, chunk, size, q, trees) {
  const n = Math.round(chunk / size);
  const H = new Float32Array((n + 2) * (n + 2));
  const at = (i, j) => H[(j + 1) * (n + 2) + (i + 1)];
  for (let j = -1; j <= n; j++) for (let i = -1; i <= n; i++) {
    const x = cx + (i + 0.5) * size, z = cz + (j + 0.5) * size;
    H[(j + 1) * (n + 2) + (i + 1)] = quant(heightAt(x, z), size);
  }
  const white = [1, 1, 1];
  const corners = [[0, 1], [1, 1], [1, 0], [0, 0]];
  const emitTop = (i0, i1, j, top, def, ao, tint) => {
    const xa = cx + i0 * size, xb = cx + i1 * size, za = cz + j * size, zb = za + size;
    const P = [[xa, zb], [xb, zb], [xb, za], [xa, za]];
    builder.quad(P.map(([x, z]) => [x, top, z]), [0, 1, 0], P.map(([x, z]) => [x / size, z / size]), def.top, ao, tint, def.emit, def.rough, def.metal);
  };
  let run = null;
  const flush = () => { if (run) { emitTop(run.i0, run.i1, run.j, run.top, BLOCKS[run.block], [1, 1, 1, 1], run.tint); run = null; } };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    if (i === 0) flush();
    const x0 = cx + i * size, z0 = cz + j * size;
    const xc = x0 + size / 2, zc = z0 + size / 2;
    const r = Math.hypot(xc, zc * 0.84);
    if (r < q.inner) { flush(); continue; } // the stadium sits here
    const top = at(i, j);
    if (top < SEA_Y - 1) { flush(); continue; } // hidden under the (opaque) sea
    let slope = 0;
    for (const [dx, dz] of DIRS) slope = Math.max(slope, Math.abs(at(i + dx, j + dz) - top) / size);
    const bl = blocksFor(top, xc, zc, slope, r);
    const tint = bl.top === B.GRASS ? grassTint(xc, zc, top) : white;
    const def = BLOCKS[bl.top], under = BLOCKS[bl.under];
    // top face with corner AO from higher neighbours
    const ao = [];
    for (const [ux, uz] of corners) {
      const sx = ux ? 1 : -1, sz = uz ? 1 : -1;
      const a = at(i + sx, j) > top ? 1 : 0, b = at(i, j + sz) > top ? 1 : 0, c = at(i + sx, j + sz) > top ? 1 : 0;
      ao.push(1 - (a && b ? 3 : a + b + c) * 0.13);
    }
    // flat, unoccluded tops in a row merge into one long quad
    const plain = ao[0] === 1 && ao[1] === 1 && ao[2] === 1 && ao[3] === 1;
    if (plain && run && run.i1 === i && run.top === top && run.block === bl.top && run.tint[0] === tint[0] && run.tint[1] === tint[1] && run.tint[2] === tint[2]) {
      run.i1 = i + 1;
    } else {
      flush();
      if (plain) run = { i0: i, i1: i + 1, j, top, block: bl.top, tint };
      else emitTop(i, i + 1, j, top, def, ao, tint);
    }
    // sides down to the lowest neighbour along each edge
    for (let k = 0; k < 4; k++) {
      const [dx, dz] = DIRS[k];
      let nb = at(i + dx, j + dz);
      if (nb >= top) continue;
      // neighbours in other chunks may use a different block size: reach a little deeper
      if (i + dx < 0 || j + dz < 0 || i + dx >= n || j + dz >= n) nb -= size;
      const bottom = Math.max(nb, SEA_Y - 1);
      if (bottom >= top) continue;
      let p0, p1, nrm;
      // corners ordered so the quad faces outward
      if (dx === 1) { p0 = [x0 + size, z0]; p1 = [x0 + size, z0 + size]; nrm = [1, 0, 0]; }
      else if (dx === -1) { p0 = [x0, z0 + size]; p1 = [x0, z0]; nrm = [-1, 0, 0]; }
      else if (dz === 1) { p0 = [x0 + size, z0 + size]; p1 = [x0, z0 + size]; nrm = [0, 0, 1]; }
      else { p0 = [x0, z0]; p1 = [x0 + size, z0]; nrm = [0, 0, -1]; }
      const uOf = (p) => (dx !== 0 ? p[1] : p[0]) / size;
      const shadeSide = dx !== 0 ? 0.86 : 0.93;
      const band = (y0, y1, layer, tnt, aoBot) => {
        builder.quad(
          [[p0[0], y0, p0[1]], [p0[0], y1, p0[1]], [p1[0], y1, p1[1]], [p1[0], y0, p1[1]]], nrm,
          [[uOf(p0), y0 / size], [uOf(p0), y1 / size], [uOf(p1), y1 / size], [uOf(p1), y0 / size]],
          layer, [aoBot * shadeSide, shadeSide, shadeSide, aoBot * shadeSide], tnt, 0, 0.9, 0,
        );
      };
      const deep = top - bottom > size * 1.5;
      band(Math.max(bottom, top - size), top, def.side, tint, deep ? 0.95 : 0.8);
      if (deep) band(bottom, top - size, under.side, white, 0.62);
    }
    // trees on gentle grass
    if (trees && bl.top === B.GRASS && slope < 0.5 && r > PLAZA_R + 30) trees.push(xc, top, zc, size);
  }
  flush();
}

// ------------------------------------------------------------------ trees
function treeGeometry(kind) {
  const g = new VoxelGrid(5, 9, 5);
  if (kind === 'oak') {
    for (let y = 0; y < 5; y++) g.set(2, y, 2, B.LOG);
    for (let y = 3; y <= 4; y++) for (let x = 0; x < 5; x++) for (let z = 0; z < 5; z++) {
      if ((x === 0 || x === 4) && (z === 0 || z === 4)) continue;
      if (!(x === 2 && z === 2)) g.set(x, y, z, B.LEAVES);
    }
    for (let x = 1; x < 4; x++) for (let z = 1; z < 4; z++) g.set(x, 5, z, B.LEAVES);
    for (const [x, z] of [[2, 1], [1, 2], [2, 2], [3, 2], [2, 3]]) g.set(x, 6, z, B.LEAVES);
  } else {
    for (let y = 0; y < 7; y++) g.set(2, y, 2, B.SPRUCE_LOG);
    const layer = (y, r) => {
      for (let x = 2 - r; x <= 2 + r; x++) for (let z = 2 - r; z <= 2 + r; z++) if (!(x === 2 && z === 2 && y < 7)) g.set(x, y, z, B.SPRUCE);
    };
    layer(2, 2); layer(3, 1); layer(4, 2); layer(5, 1); layer(6, 1); layer(7, 0); layer(8, 0);
  }
  if (kind === 'oakFar' || kind === 'spruceFar') {
    // distant trees: a trunk and one canopy block
    g.cells.fill(0);
    const spruce = kind === 'spruceFar';
    for (let y = 0; y < 3; y++) g.set(2, y, 2, spruce ? B.SPRUCE_LOG : B.LOG);
    g.box(0, 2, 0, 4, spruce ? 7 : 5, 4, spruce ? B.SPRUCE : B.LEAVES);
  }
  const b = new QuadBuilder();
  // unit footprint: 5 voxels wide -> 1, base at y = 0 (instances are scaled to metres)
  g.mesh(b, 1 / 5, [-0.5, 0, -0.5], { aoStrength: 0 });
  return b.build();
}

// ------------------------------------------------------------------ water
function waterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSky: skyFog.cube,
      uFogDensity: skyFog.density,
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color(1, 1, 1) },
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x06243a) },
      uRain: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform samplerCube uSky;
      uniform vec3 uSunDir, uSunColor, uDeep;
      uniform float uTime, uFogDensity, uRain;
      varying vec3 vW;
      vec2 wave(vec2 p, vec2 dir, float freq, float speed, float amp) {
        float ph = dot(p, dir) * freq + uTime * speed;
        return dir * cos(ph) * amp * freq;
      }
      void main() {
        vec2 p = vW.xz;
        vec2 g = wave(p, normalize(vec2(0.8, 0.6)), 0.06, 1.1, 0.35) + wave(p, normalize(vec2(-0.5, 0.86)), 0.11, 1.7, 0.18)
               + wave(p, normalize(vec2(0.2, -0.98)), 0.23, 2.3, 0.08) + wave(p, normalize(vec2(-0.9, -0.3)), 0.47, 3.1, 0.04);
        g *= 1.0 + uRain * 0.8;
        vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 toCam = cameraPosition - vW;
        float dist = length(toCam);
        vec3 V = toCam / dist;
        // calm the normals with distance to avoid shimmer
        N = normalize(mix(N, vec3(0.0, 1.0, 0.0), clamp(dist / 1600.0, 0.0, 0.85)));
        vec3 R = reflect(-V, N);
        R.y = abs(R.y);
        vec3 refl = textureLod(uSky, R, 1.0).rgb;
        float fres = 0.03 + 0.97 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        vec3 col = mix(uDeep * (0.25 + 0.75 * textureLod(uSky, vec3(0.0, 1.0, 0.0), 5.0).rgb), refl, fres);
        col += uSunColor * pow(max(dot(R, uSunDir), 0.0), 220.0) * 6.0 * (1.0 - uRain);
        float f = 1.0 - exp(-pow(dist * uFogDensity, 1.6));
        vec3 fd = -V; fd.y = max(fd.y, 0.015);
        col = mix(col, textureLod(uSky, fd, 3.0).rgb, clamp(f, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// ------------------------------------------------------------------ build
const QUALITY = {
  high: { near: 4, extent: 2400, chunk: 160, oaks: 700, spruces: 300, treeNear: 600 },
  medium: { near: 6, extent: 2200, chunk: 192, oaks: 420, spruces: 180, treeNear: 480 },
  low: { near: 8, extent: 1900, chunk: 256, oaks: 220, spruces: 90, treeNear: 380 },
};

export function buildTerrain(root, quality, { inner = 132, style = 'blocky' } = {}) {
  const q = { ...(QUALITY[quality] || QUALITY.high), inner };
  const group = new THREE.Group();
  root.add(group);
  if (style === 'realistic') return buildRealTerrain(group, quality, q);
  const mat = blockMaterial();
  const treeSpots = [];
  // chunks grouped into large tiles: few draw calls, still frustum culled
  const tile = q.chunk * 4;
  const tiles = new Map();
  for (let cz = -q.extent; cz < q.extent; cz += q.chunk) {
    for (let cx = -q.extent; cx < q.extent; cx += q.chunk) {
      const mx = cx + q.chunk / 2, mz = cz + q.chunk / 2;
      const d = Math.hypot(mx, mz);
      const nearest = Math.hypot(Math.max(0, Math.abs(mx) - q.chunk / 2), Math.max(0, Math.abs(mz) - q.chunk / 2));
      if (nearest < q.inner * 0.6 && d < q.inner * 0.6) continue;
      const size = cellSizeFor(nearest, q);
      const key = `${Math.floor(cx / tile)},${Math.floor(cz / tile)}`;
      if (!tiles.has(key)) tiles.set(key, new QuadBuilder());
      buildChunk(tiles.get(key), cx, cz, q.chunk, size, q, treeSpots);
    }
  }
  const meshes = [];
  for (const b of tiles.values()) {
    if (!b.quads) continue;
    const m = new THREE.Mesh(b.build(), mat);
    m.receiveShadow = false;
    group.add(m);
    meshes.push(m);
  }

  const water = addSea(group, q);

  // forests: oaks in the lowlands, spruces higher up
  const r = rng(77);
  const oakSpots = [], spruceSpots = [];
  for (let k = 0; k < treeSpots.length; k += 4) {
    const [x, y, z, size] = [treeSpots[k], treeSpots[k + 1], treeSpots[k + 2], treeSpots[k + 3]];
    const dens = fbm(x / 180 + 3, z / 180 - 8, 3);
    const chance = (dens > 0.05 ? 0.55 : 0.05) * (size <= 8 ? 1 : 0.6);
    if (r() > chance) continue;
    (y > 70 || dens > 0.32 ? spruceSpots : oakSpots).push([x + (r() - 0.5) * size * 0.6, y, z + (r() - 0.5) * size * 0.6]);
  }
  const place = (spots, max, geo, hMin, hMax) => {
    // keep a spread-out subset when there are more spots than trees
    const pick = spots.length > max ? spots.filter((_, i) => (i * max) % spots.length < max) : spots;
    const mesh = new THREE.InstancedMesh(geo, mat, pick.length);
    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    pick.forEach(([x, y, z], i) => {
      const h = hMin + r() * (hMax - hMin);
      q4.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.floor(r() * 4) * Math.PI / 2);
      s.set(h * 0.6, h, h * 0.6);
      m4.compose(p.set(x, y, z), q4, s);
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    group.add(mesh);
    return mesh;
  };
  const near = (sp) => sp.filter(([x, , z]) => Math.hypot(x, z) < q.treeNear);
  const far = (sp) => sp.filter(([x, , z]) => Math.hypot(x, z) >= q.treeNear);
  const oaks = place(near(oakSpots), q.oaks, treeGeometry('oak'), 7, 11);
  const spruces = place(near(spruceSpots), q.spruces, treeGeometry('spruce'), 11, 17);
  place(far(oakSpots), q.oaks * 2, treeGeometry('oakFar'), 7, 11);
  place(far(spruceSpots), q.spruces * 2, treeGeometry('spruceFar'), 11, 17);

  return { group, water, oaks, spruces, material: mat, update: seaUpdater(water) };
}

function addSea(group, q) {
  const water = new THREE.Mesh(new THREE.PlaneGeometry(q.extent * 2.4, q.extent * 2.4), waterMaterial());
  water.rotation.x = -Math.PI / 2;
  water.position.y = SEA_Y + 0.4;
  group.add(water);
  return water;
}

function seaUpdater(water) {
  return (dt, sky) => {
    const u = water.material.uniforms;
    u.uTime.value += dt;
    u.uSunDir.value.copy(sky.sunDir);
    u.uSunColor.value.copy(sky.colors.sun).multiplyScalar(sky.w.day + sky.w.sunset);
  };
}

// realistic: smooth textured ground, broadleaf and pine forests
function buildRealTerrain(group, quality, q) {
  const env = { heightAt, fbm, SEA_Y, PLAZA_Y, plazaR: PLAZA_R, extent: q.extent };
  const land = buildSmoothLand(group, quality, env);
  const water = addSea(group, q);
  const mat = treeMaterial();
  const r = rng(91);
  const spots = treeSpots(env, quality);
  const place = (list, max, geo, hMin, hMax, cull = false) => {
    const pick = list.slice(0, max); // spots come densest-forest first
    const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, pick.length));
    mesh.count = pick.length;
    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const c = new THREE.Color();
    pick.forEach(({ x, y, z }, i) => {
      const h = hMin + r() * (hMax - hMin);
      q4.setFromAxisAngle(up, r() * Math.PI * 2);
      const w = h * (0.85 + r() * 0.3);
      s.set(w, h, w);
      m4.compose(p.set(x, y, z), q4, s);
      mesh.setMatrixAt(i, m4);
      c.setRGB(0.8 + r() * 0.4, 0.85 + r() * 0.3, 0.8 + r() * 0.4); // each tree a slightly different green
      mesh.setColorAt(i, c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (cull && pick.length) mesh.computeBoundingSphere(); else mesh.frustumCulled = false;
    group.add(mesh);
    return mesh;
  };
  const nearR = q.treeNear * 0.8;
  const near = (l) => l.filter((t) => Math.hypot(t.x, t.z) < nearR);
  const oakSpots = spots.filter((t) => !t.pine), pineSpots = spots.filter((t) => t.pine);
  const oaks = place(near(oakSpots), q.oaks, realTreeGeometry('oak'), 9, 15);
  const spruces = place(near(pineSpots), q.spruces, realTreeGeometry('spruce'), 13, 21);
  // distant woods in eight wedges, so the ones behind the camera are culled
  const farOak = realTreeGeometry('oakFar'), farPine = realTreeGeometry('spruceFar');
  for (let k = 0; k < 8; k++) {
    const wedge = (l) => l.filter((t) => Math.hypot(t.x, t.z) >= nearR && Math.floor(((Math.atan2(t.z, t.x) / (Math.PI * 2)) + 1) * 8) % 8 === k);
    place(wedge(oakSpots), Math.round(q.oaks * 0.6), farOak, 9, 15, true);
    place(wedge(pineSpots), Math.round(q.spruces * 0.6), farPine, 13, 21, true);
  }
  return { group, water, oaks, spruces, material: land.material, update: seaUpdater(water) };
}

export { fbm, ridged };
