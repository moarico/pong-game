// Landmarks for the realistic world: rocky floating islands with forests and waterfalls,
// stone castles, a lighthouse on a sea stack and two slow airships. Stone and rock share the
// terrain's world-space texturing, so everything sits in the same light and haze.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from './blocks.js';
import { terrainMaterial, realTreeGeometry, treeMaterial, withSkyFog, lin } from './landscape.js';

const STONE = lin([0.72, 0.69, 0.63]), STONE_DARK = lin([0.55, 0.53, 0.5]), SLATE = lin([0.28, 0.31, 0.36]), ROCK = lin([0.48, 0.45, 0.41]);
const GRASS = lin([0.3, 0.44, 0.16]), DIRT = lin([0.42, 0.33, 0.22]);

// vertex colour + surface weights (rock, sand, snow, paved) for the terrain material
function paint(g, color, surf = [1, 0, 0, 0]) {
  const n = g.attributes.position.count;
  const c = new Float32Array(n * 3), s = new Float32Array(n * 4);
  const fn = typeof color === 'function' ? color : () => color;
  for (let i = 0; i < n; i++) {
    const v = fn(g.attributes.position.getX(i), g.attributes.position.getY(i), g.attributes.position.getZ(i));
    c.set(v.slice(0, 3), i * 3);
    s.set(v.length > 3 ? v.slice(3) : surf, i * 4);
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  g.setAttribute('aSurf', new THREE.BufferAttribute(s, 4));
  if (g.attributes.uv) g.deleteAttribute('uv');
  return g;
}

const merge = (list) => mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)));

// ------------------------------------------------------------------ floating island
function islandGeometry(R, seed, depth) {
  const r = rng(seed);
  const ph = r() * 10;
  let g = new THREE.SphereGeometry(1, 56, 30);
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position;
  const noise = (a, b) => Math.sin(a * 3.1 + ph) * 0.5 + Math.sin(a * 7.3 - b * 2 + ph * 2) * 0.25 + Math.sin(a * 13.7 + b * 5 + ph) * 0.12;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(z, x);
    const rim = R * (1 + 0.16 * noise(a, 0));
    const rho = Math.hypot(x, z);
    if (y >= 0) {
      // gently domed grassy top
      p.setXYZ(i, x * rim, R * (0.05 * (1 - rho * rho) + 0.02 * noise(a * 2, rho)) , z * rim);
    } else {
      // jagged rock hanging below, longest in the middle
      const hang = depth * R * (0.75 + 0.35 * noise(a * 1.7, y));
      const t = -y;
      const pull = 0.9 + 0.25 * noise(a * 3, t * 4);
      p.setXYZ(i, x * rim * pull, -Math.pow(t, 0.8) * hang - 0.02 * R, z * rim * pull);
    }
  }
  g.computeVertexNormals();
  paint(g, (x, y) => {
    if (y > -0.012 * R) return [...GRASS, 0, 0, 0, 0];
    if (y > -0.1 * R) return [...DIRT, 0.6, 0, 0, 0];
    const k = Math.min(1, -y / (depth * R));
    return [ROCK[0] * (1 - k * 0.35), ROCK[1] * (1 - k * 0.35), ROCK[2] * (1 - k * 0.3), 1, 0, 0, 0];
  });
  return g;
}

// ------------------------------------------------------------------ castle (metres, base at y = 0)
function castleGeometry(half) {
  const parts = [], windows = [];
  const stone = (g, c = STONE) => parts.push(paint(g, c));
  const box = (w, h, d, x, y, z, c) => stone(new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z), c);
  const wallH = 9, wallT = 2.2;
  // curtain walls with crenellations
  for (const [x, z, w, d] of [[0, -half, 2 * half, wallT], [0, half, 2 * half, wallT], [-half, 0, wallT, 2 * half], [half, 0, wallT, 2 * half]]) {
    box(w, wallH, d, x, 0, z);
    const along = w > d;
    const len = along ? w : d;
    for (let k = -len / 2 + 1; k < len / 2; k += 2.4) box(along ? 1.2 : wallT, 1.4, along ? wallT : 1.2, along ? x + k : x, wallH, along ? z : z + k);
  }
  // gate
  parts.push(paint(new THREE.BoxGeometry(4, 6, 0.6).translate(0, 3, half + wallT / 2 + 0.05), [0.02, 0.018, 0.015, 0, 0, 0, 0]));
  const tower = (x, z, rad, h, roofH) => {
    stone(new THREE.CylinderGeometry(rad, rad * 1.08, h, 18).translate(x, h / 2, z));
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      box(1.1, 1.3, 1.1, x + Math.cos(a) * (rad - 0.4), h, z + Math.sin(a) * (rad - 0.4));
    }
    stone(new THREE.ConeGeometry(rad * 1.2, roofH, 18).translate(x, h + 1.3 + roofH / 2, z), SLATE);
    for (let y = 4; y < h - 2; y += 5) {
      for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        windows.push(new THREE.BoxGeometry(0.7, 1.3, 0.3).rotateY(-a).translate(x + Math.cos(a) * (rad + 0.05), y, z + Math.sin(a) * (rad + 0.05)));
      }
    }
  };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tower(sx * half, sz * half, 3, 15, 7);
  // keep and its tall tower
  box(12, 20, 12, 0, 0, -1.5);
  for (const [x, z] of [[-6, 4.5], [6, 4.5], [-6, -7.5], [6, -7.5]]) box(1.2, 1.4, 1.2, x, 20, z);
  for (let y = 5; y < 19; y += 5) for (const x of [-3, 3]) windows.push(new THREE.BoxGeometry(0.8, 1.6, 0.3).translate(x, y, 4.55));
  tower(0, -1.5, 3.2, 32, 10);
  return { stone: merge(parts), windows: mergeGeometries(windows.map((g) => g.toNonIndexed())) };
}

// ------------------------------------------------------------------ lighthouse on a sea stack
function lighthouseGeometry() {
  const parts = [];
  let rock = new THREE.SphereGeometry(16, 28, 16);
  rock.deleteAttribute('uv');
  rock = mergeVertices(rock);
  const p = rock.attributes.position, r = rng(5);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 1 + 0.18 * Math.sin(Math.atan2(z, x) * 5 + y * 0.3) + (r() - 0.5) * 0.08;
    p.setXYZ(i, x * k, y > 0 ? y * 0.45 : y, z * k);
  }
  rock.computeVertexNormals();
  parts.push(paint(rock, (x, y) => [...lin(y > 5 ? [0.45, 0.43, 0.4] : [0.36, 0.34, 0.32]), 1, 0, 0, 0]));
  const towerH = 30;
  const tower = new THREE.CylinderGeometry(2.6, 4, towerH, 28, 12).translate(0, 7 + towerH / 2, 0);
  parts.push(paint(tower, (x, y) => [...lin(Math.floor((y - 7) / 5) % 2 ? [0.75, 0.16, 0.13] : [0.92, 0.91, 0.88]), 0, 0, 1, 0]));
  parts.push(paint(new THREE.CylinderGeometry(4, 4, 0.7, 24).translate(0, 7 + towerH + 0.35, 0), [...lin([0.2, 0.2, 0.22]), 0, 0, 0, 1]));
  parts.push(paint(new THREE.ConeGeometry(2.9, 3, 20).translate(0, 7 + towerH + 5.6, 0), [...lin([0.55, 0.12, 0.1]), 0, 0, 1, 0]));
  const lantern = new THREE.CylinderGeometry(2.2, 2.2, 3.4, 20).translate(0, 7 + towerH + 2.4, 0);
  return { stone: merge(parts), lantern, lamp: [0, 7 + towerH + 2.4, 0] };
}

// ------------------------------------------------------------------ airship
function airshipGeometry() {
  const env = new THREE.SphereGeometry(1, 40, 20).scale(22, 7.5, 7.5);
  const colorBy = (g, fn) => {
    const pa = g.attributes.position, c = new Float32Array(pa.count * 3);
    for (let i = 0; i < pa.count; i++) c.set(fn(pa.getX(i), pa.getY(i), pa.getZ(i)), i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    if (g.attributes.uv) g.deleteAttribute('uv');
    return g.index ? g.toNonIndexed() : g;
  };
  const parts = [colorBy(env, (x) => lin(Math.abs(((x + 22) % 9) - 4.5) < 0.9 ? [0.9, 0.5, 0.2] : [0.92, 0.9, 0.86]))];
  parts.push(colorBy(new THREE.BoxGeometry(9, 2.6, 3.4).translate(0, -9, 0), () => lin([0.45, 0.32, 0.22])));
  parts.push(colorBy(new THREE.BoxGeometry(8.6, 0.9, 3.5).translate(0, -8.6, 0), () => lin([0.2, 0.24, 0.3])));
  for (const [x, y, z, w, h, d] of [[-20, 0, 0, 4, 0.4, 9], [-20, 0, 0, 4, 9, 0.4]]) parts.push(colorBy(new THREE.BoxGeometry(w, h, d).translate(x, y, z), () => lin([0.75, 0.4, 0.2])));
  for (const sz of [-1, 1]) parts.push(colorBy(new THREE.CylinderGeometry(0.15, 0.15, 6.2, 6).translate(0, -4.4, sz * 1.5).rotateX(sz * 0.12), () => lin([0.25, 0.25, 0.25])));
  return mergeGeometries(parts);
}

// ------------------------------------------------------------------ waterfall
function waterfallMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uLight: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uLight;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      void main() {
        float fromTop = 1.0 - vUv.y;
        // falling streaks of foam
        float n = vnoise(vec2(vUv.x * 18.0, vUv.y * 6.0 + uTime * 3.0)) * 0.6 + vnoise(vec2(vUv.x * 40.0, vUv.y * 14.0 + uTime * 5.5)) * 0.4;
        vec3 col = mix(vec3(0.42, 0.58, 0.7), vec3(0.92, 0.96, 1.0), smoothstep(0.45, 0.8, n));
        col = mix(col, vec3(0.95), smoothstep(0.6, 1.0, fromTop) * 0.7); // spray toward the bottom
        float a = (0.8 - fromTop * 0.45) * (1.0 - smoothstep(0.7, 1.0, fromTop));
        a *= smoothstep(0.0, 0.25, vUv.x) * (1.0 - smoothstep(0.75, 1.0, vUv.x));
        a *= 0.65 + n * 0.5;
        gl_FragColor = vec4(col * uLight, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// ------------------------------------------------------------------ assemble
// env: { heightAt, SEA_Y }
export function buildRealFeatures(root, quality, env) {
  const { heightAt, SEA_Y } = env;
  const group = new THREE.Group();
  root.add(group);
  const stoneMat = terrainMaterial();
  const glowMat = withSkyFog(new THREE.MeshStandardMaterial({ color: 0x1a140c, emissive: 0xffc070, emissiveIntensity: 0.3, roughness: 0.6 }), 'glowReal');
  const stoneParts = [], windowParts = [], treeSpots = [];
  const falls = [];
  const fallMat = waterfallMaterial();
  const r = rng(12);

  const ISLANDS = [
    { pos: [-330, 250, 880], R: 70, depth: 1.5, castle: true, trees: 18, seed: 3 },
    { pos: [430, 185, 760], R: 36, depth: 1.7, trees: 12, seed: 7 },
    { pos: [180, 235, -960], R: 48, depth: 1.5, trees: 16, seed: 11 },
    { pos: [-840, 165, -260], R: 32, depth: 1.8, trees: 9, seed: 13 },
    { pos: [780, 310, 140], R: 24, depth: 1.6, trees: 6, seed: 17, fall: false },
    // high and close enough to show above the stands from the pitch, over the sunset end
    { pos: [-380, 380, 330], R: 58, depth: 1.4, castle: true, trees: 12, seed: 23 },
  ];
  for (const isl of ISLANDS) {
    if (quality === 'low' && isl.R < 30) continue;
    const [x0, y0, z0] = isl.pos;
    stoneParts.push(islandGeometry(isl.R, isl.seed, isl.depth).translate(x0, y0, z0));
    for (let k = 0; k < isl.trees; k++) {
      const a = r() * Math.PI * 2, rr = (isl.castle ? 0.62 + r() * 0.3 : r() * 0.8) * isl.R;
      const k = rr / isl.R;
      treeSpots.push({ x: x0 + Math.cos(a) * rr, y: y0 + isl.R * 0.05 * (1 - k * k) - 0.4, z: z0 + Math.sin(a) * rr });
    }
    if (isl.castle) {
      const c = castleGeometry(isl.R * 0.33);
      stoneParts.push(c.stone.translate(x0, y0 + isl.R * 0.04, z0));
      windowParts.push(c.windows.translate(x0, y0 + isl.R * 0.04, z0));
    }
    if (isl.fall !== false) {
      const a = isl.seed * 2.39;
      const dir = [Math.cos(a), Math.sin(a)];
      const h = 160 + isl.R * 1.2;
      const geo = new THREE.PlaneGeometry(isl.R * 0.22, h).translate(0, -h / 2, 0);
      const m = new THREE.Mesh(geo, fallMat);
      m.position.set(x0 + dir[0] * isl.R * 1.02, y0 + 1, z0 + dir[1] * isl.R * 1.02);
      m.rotation.y = Math.atan2(dir[0], dir[1]);
      m.renderOrder = 3;
      group.add(m);
      falls.push(m);
    }
  }
  // a castle on the hills, landward
  {
    const cx = 560, cz = -640;
    const gy = heightAt(cx, cz);
    const c = castleGeometry(24);
    // a stone platform levels the hilltop
    stoneParts.push(paint(new THREE.CylinderGeometry(36, 40, 14, 32).translate(cx, gy - 6, cz), [...STONE_DARK, 1, 0, 0, 0]));
    stoneParts.push(c.stone.scale(1.3, 1.3, 1.3).translate(cx, gy + 1, cz));
    windowParts.push(c.windows.scale(1.3, 1.3, 1.3).translate(cx, gy + 1, cz));
  }
  // lighthouse out at sea
  let beam = null, lanternMesh = null;
  {
    const lx = -640, lz = 860;
    const l = lighthouseGeometry();
    stoneParts.push(l.stone.translate(lx, SEA_Y - 2, lz));
    lanternMesh = new THREE.Mesh(l.lantern.translate(lx, SEA_Y - 2, lz), withSkyFog(new THREE.MeshStandardMaterial({ color: 0x222018, emissive: 0xfff0c0, emissiveIntensity: 1.2, roughness: 0.2 }), 'lanternReal'));
    group.add(lanternMesh);
    const bg = new THREE.ConeGeometry(14, 240, 24, 1, true);
    bg.translate(0, -120, 0);
    bg.rotateZ(Math.PI / 2);
    beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    beam.position.set(lx + l.lamp[0], SEA_Y - 2 + l.lamp[1], lz + l.lamp[2]);
    group.add(beam);
  }
  const stone = new THREE.Mesh(merge(stoneParts), stoneMat);
  group.add(stone);
  const windows = new THREE.Mesh(merge(windowParts), glowMat);
  group.add(windows);

  // trees on the islands
  const tm = treeMaterial();
  const trees = new THREE.InstancedMesh(realTreeGeometry('oak'), tm, treeSpots.length);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  treeSpots.forEach((t, i) => {
    const h = 9 + r() * 6;
    m4.compose(new THREE.Vector3(t.x, t.y, t.z), q4.setFromAxisAngle(up, r() * 6.28), new THREE.Vector3(h, h, h));
    trees.setMatrixAt(i, m4);
  });
  trees.frustumCulled = false;
  group.add(trees);

  // airships
  const shipMat = withSkyFog(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65 }), 'shipReal');
  const shipGeo = airshipGeometry();
  const ships = [
    { r: 330, y: 270, speed: 0.016, phase: 0.6 },
    { r: 980, y: 300, speed: -0.008, phase: 2.8 },
  ].map((s) => { const m = new THREE.Mesh(shipGeo, shipMat); group.add(m); return { ...s, mesh: m }; });

  let t = 0;
  return {
    group,
    material: stoneMat,
    update(dt, sky) {
      t += dt;
      fallMat.uniforms.uTime.value = t;
      fallMat.uniforms.uLight.value.setScalar(0.35 + sky.w.day * 0.75 + sky.w.sunset * 0.6);
      for (const s of ships) {
        const a = s.phase + t * s.speed;
        s.mesh.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.3 + s.phase) * 4, Math.sin(a) * s.r);
        s.mesh.rotation.y = -a + (s.speed > 0 ? Math.PI : 0);
      }
      const night = sky.w.night + sky.w.sunset * 0.35;
      glowMat.emissiveIntensity = 0.15 + night * 2.2;
      lanternMesh.material.emissiveIntensity = 0.6 + night * 2.5;
      beam.visible = sky.w.night + sky.w.sunset * 0.4 > 0.2;
      beam.rotation.y = t * 0.6;
    },
  };
}
