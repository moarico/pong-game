// Landmarks around the blocky stadium: floating sky islands with waterfalls, castles,
// a lighthouse out at sea and slow airships, all built from voxels.
import * as THREE from 'three';
import { B, QuadBuilder, VoxelGrid, blockMaterial, rng } from './blocks.js';
import { heightAt, SEA_Y, fbm } from './terrain.js';
import { buildRealFeatures } from './realFeatures.js';

// ------------------------------------------------------------------ generators
function island(R, seed, { depth = 1.6, castle = false, trees = 5, stream = true } = {}) {
  const r = rng(seed);
  const D = Math.round(R * depth);
  const topH = 4;
  const g = new VoxelGrid(2 * R + 3, D + topH + (castle ? 40 : 14), 2 * R + 3);
  const base = D;
  const tops = new Map();
  for (let z = 0; z < g.nz; z++) for (let x = 0; x < g.nx; x++) {
    const dx = x - R - 1, dz = z - R - 1;
    const ang = Math.atan2(dz, dx);
    const edge = R * (0.82 + 0.18 * fbm(Math.cos(ang) * 1.3 + seed, Math.sin(ang) * 1.3, 3) * 2.2);
    const d = Math.hypot(dx, dz);
    if (d > edge) continue;
    const k = d / edge;
    const top = base + Math.round(fbm(x / 9 + seed, z / 9, 2) * 2 + (1 - k) * 1.5);
    const hang = Math.pow(1 - k, 0.75) * D * (0.75 + 0.35 * fbm(x / 5 - seed, z / 5, 2)) + (r() < 0.05 ? r() * D * 0.4 : 0);
    const bottom = Math.max(0, Math.round(top - hang - 1));
    for (let y = bottom; y <= top; y++) {
      const b = y === top ? B.GRASS : y >= top - 2 ? B.DIRT : (r() < 0.06 ? B.GRAVEL : B.STONE);
      g.set(x, y, z, b);
    }
    tops.set(x + ',' + z, top);
  }
  const topAt = (x, z) => tops.get(x + ',' + z);
  // trees
  for (let i = 0; i < trees; i++) {
    const a = r() * Math.PI * 2, rr = r() * R * 0.7;
    const x = Math.round(R + 1 + Math.cos(a) * rr), z = Math.round(R + 1 + Math.sin(a) * rr);
    const t = topAt(x, z);
    if (t === undefined || (castle && rr < R * 0.55)) continue;
    const h = 4 + Math.floor(r() * 3);
    for (let y = 1; y <= h; y++) g.set(x, t + y, z, B.LOG);
    for (let y = h - 1; y <= h + 2; y++) for (let ox = -2; ox <= 2; ox++) for (let oz = -2; oz <= 2; oz++) {
      if (Math.abs(ox) + Math.abs(oz) + Math.max(0, y - h) * 1.5 <= 3 && g.get(x + ox, t + y, z + oz) === 0) g.set(x + ox, t + y, z + oz, B.LEAVES);
    }
  }
  // a stream running to the edge, where the waterfall starts
  let fall = null;
  if (stream) {
    const a = seed * 2.39;
    const dir = [Math.cos(a), Math.sin(a)];
    let last = null;
    for (let s = 0; s < R + 4; s += 0.5) {
      const x = Math.round(R + 1 + dir[0] * s), z = Math.round(R + 1 + dir[1] * s);
      const t = topAt(x, z);
      if (t === undefined) break;
      g.set(x, t, z, B.WATER);
      last = { x, z, t };
    }
    if (last) fall = { x: last.x + dir[0] * 0.8, y: last.t + 0.9, z: last.z + dir[1] * 0.8, dir };
  }
  if (castle) buildCastle(g, R + 1, base + 3, R + 1, Math.round(R * 0.55), r);
  return { grid: g, fall, center: [R + 1, base, R + 1] };
}

// castle: curtain wall, corner towers with pointed roofs, a tall keep with lit windows
function buildCastle(g, cx, y0, cz, half, r) {
  const wallH = 8;
  for (let x = cx - half; x <= cx + half; x++) for (let z = cz - half; z <= cz + half; z++) {
    for (let y = y0 - 3; y < y0; y++) if (g.get(x, y, z) === 0) g.set(x, y, z, B.COBBLE); // foundation
    const onWall = x <= cx - half + 1 || x >= cx + half - 1 || z <= cz - half + 1 || z >= cz + half - 1;
    if (!onWall) { g.set(x, y0 - 1, z, B.COBBLE); continue; }
    const gate = z >= cz + half - 1 && Math.abs(x - cx) <= 1;
    for (let y = y0; y < y0 + wallH; y++) if (!(gate && y < y0 + 4)) g.set(x, y, z, B.BRICK);
    if ((x + z) % 2 === 0) g.set(x, y0 + wallH, z, B.BRICK);
  }
  const tower = (tx, tz, rad, h, roofColor) => {
    for (let x = tx - rad; x <= tx + rad; x++) for (let z = tz - rad; z <= tz + rad; z++) {
      if (Math.hypot(x - tx, z - tz) > rad + 0.4) continue;
      for (let y = y0 - 3; y < y0 + h; y++) g.set(x, y, z, B.BRICK);
      const rim = Math.hypot(x - tx, z - tz) > rad - 0.6;
      if (rim && (x + z) % 2 === 0) g.set(x, y0 + h, z, B.BRICK);
    }
    // windows
    for (let y = y0 + 4; y < y0 + h - 2; y += 4) for (const [ox, oz] of [[rad, 0], [-rad, 0], [0, rad], [0, -rad]]) g.set(tx + ox, y, tz + oz, B.GLOW);
    // stepped pointed roof
    for (let k = 0; k <= rad + 2; k++) {
      const rr = rad + 1 - k;
      for (let x = tx - rr; x <= tx + rr; x++) for (let z = tz - rr; z <= tz + rr; z++) {
        if (Math.hypot(x - tx, z - tz) <= rr + 0.3) g.set(x, y0 + h + 1 + k * 1, z, roofColor);
      }
    }
    // banner
    g.set(tx, y0 + h + rad + 4, tz, B.LOG);
    g.set(tx, y0 + h + rad + 5, tz, B.LOG);
    g.set(tx + 1, y0 + h + rad + 5, tz, r() < 0.5 ? B.WOOL_BLUE : B.WOOL_ORANGE);
  };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tower(cx + sx * half, cz + sz * half, 2, wallH + 6, B.ROOF);
  // keep
  const kh = 3;
  for (let x = cx - kh; x <= cx + kh; x++) for (let z = cz - kh; z <= cz + kh; z++) {
    for (let y = y0; y < y0 + 20; y++) g.set(x, y, z, B.BRICK);
    if ((x === cx - kh || x === cx + kh || z === cz - kh || z === cz + kh) && (x + z) % 2 === 0) g.set(x, y0 + 20, z, B.BRICK);
  }
  for (let y = y0 + 4; y < y0 + 19; y += 4) for (let k = -1; k <= 1; k += 2) {
    g.set(cx + k, y, cz + kh, B.GLOW); g.set(cx + k, y, cz - kh, B.GLOW); g.set(cx + kh, y, cz + k, B.GLOW); g.set(cx - kh, y, cz + k, B.GLOW);
  }
  tower(cx, cz, 2, 26, B.ROOF);
}

function lighthouse() {
  const R = 4, H = 30;
  const g = new VoxelGrid(21, H + 14, 21);
  const c = 10;
  // rock base from the sea floor up
  for (let x = 0; x < 21; x++) for (let z = 0; z < 21; z++) {
    const d = Math.hypot(x - c, z - c);
    const top = Math.round(5 - d * 0.5 + fbm(x / 4, z / 4, 2) * 2);
    if (d > 10) continue;
    for (let y = 0; y <= top; y++) g.set(x, y, z, y === top && d > 5 ? B.SAND : B.STONE);
  }
  for (let y = 6; y < 6 + H; y++) for (let x = c - R; x <= c + R; x++) for (let z = c - R; z <= c + R; z++) {
    const d = Math.hypot(x - c, z - c);
    const rad = R - (y - 6) / H * 1.4;
    if (d > rad + 0.4) continue;
    g.set(x, y, z, Math.floor((y - 6) / 4) % 2 ? B.WOOL_ORANGE : B.QUARTZ);
  }
  const top = 6 + H;
  for (let x = c - 3; x <= c + 3; x++) for (let z = c - 3; z <= c + 3; z++) {
    const d = Math.hypot(x - c, z - c);
    if (d > 3.4) continue;
    g.set(x, top, z, B.DARK);
    if (d > 2.4) { g.set(x, top + 1, z, B.GLASS); g.set(x, top + 2, z, B.GLASS); } else { g.set(x, top + 1, z, B.LAMP); g.set(x, top + 2, z, B.LAMP); }
    g.set(x, top + 3, z, B.DARK);
    if (d < 2) g.set(x, top + 4, z, B.DARK);
  }
  return { grid: g, lamp: [c + 0.5, top + 1.6, c + 0.5] };
}

function airship() {
  const g = new VoxelGrid(26, 14, 10);
  for (let x = 0; x < 26; x++) for (let y = 4; y < 14; y++) for (let z = 0; z < 10; z++) {
    const ex = (x - 12.5) / 12.5, ey = (y - 9) / 4.6, ez = (z - 4.5) / 4.6;
    if (ex * ex + ey * ey + ez * ez <= 1) g.set(x, y, z, x % 6 === 2 ? B.WOOL_ORANGE : B.WOOL_WHITE);
  }
  g.box(8, 1, 3, 16, 3, 6, B.PLANKS);
  g.box(9, 2, 3, 15, 2, 3, B.GLASS);
  g.box(9, 2, 6, 15, 2, 6, B.GLASS);
  g.box(10, 3, 4, 14, 4, 5, B.LOG);
  g.box(0, 7, 4, 1, 11, 5, B.DARK); // fins
  g.box(0, 8, 1, 1, 10, 8, B.DARK);
  return g;
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
      void main() {
        vec2 px = floor(vec2(vUv.x * 8.0, vUv.y * 90.0 + uTime * 26.0));
        float n = hash(px);
        float fromTop = 1.0 - vUv.y;
        vec3 col = mix(vec3(0.24, 0.45, 0.78), vec3(0.85, 0.93, 1.0), step(0.72, n));
        col = mix(col, vec3(0.95), smoothstep(0.55, 1.0, fromTop) * 0.6);
        float a = (0.85 - fromTop * 0.55) * (1.0 - smoothstep(0.62, 1.0, fromTop));
        a *= smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
        gl_FragColor = vec4(col * uLight, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// ------------------------------------------------------------------ assemble
export function buildFeatures(root, quality, style = 'blocky') {
  if (style === 'realistic') return buildRealFeatures(root, quality, { heightAt, SEA_Y });
  const group = new THREE.Group();
  root.add(group);
  const mat = blockMaterial();
  const builder = new QuadBuilder();
  const falls = [];
  const fallMat = waterfallMaterial();
  const addFall = (x, y, z, dir, width, height) => {
    const geo = new THREE.PlaneGeometry(width, height);
    geo.translate(0, -height / 2, 0);
    const m = new THREE.Mesh(geo, fallMat);
    m.position.set(x, y, z);
    m.rotation.y = Math.atan2(dir[0], dir[1]);
    m.renderOrder = 3;
    group.add(m);
    falls.push(m);
  };
  const ISLANDS = [
    { pos: [-330, 250, 880], R: 26, v: 3, castle: true, trees: 8, seed: 3 },
    { pos: [430, 185, 760], R: 14, v: 2.5, trees: 6, seed: 7 },
    { pos: [180, 235, -960], R: 18, v: 3, trees: 7, seed: 11 },
    { pos: [-840, 165, -260], R: 12, v: 2.5, trees: 4, seed: 13 },
    { pos: [780, 310, 140], R: 9, v: 2.5, trees: 2, seed: 17, stream: false },
    // high and close enough to show above the stands from the pitch
    { pos: [-380, 380, 330], R: 22, v: 2.6, castle: true, trees: 8, seed: 23 },
  ];
  const lowQ = quality === 'low';
  for (const isl of ISLANDS) {
    if (lowQ && isl.R < 12) continue;
    const { grid, fall, center } = island(isl.R, isl.seed, { castle: isl.castle, trees: isl.trees, stream: isl.stream !== false });
    const origin = [isl.pos[0] - center[0] * isl.v, isl.pos[1] - center[1] * isl.v, isl.pos[2] - center[2] * isl.v];
    grid.mesh(builder, isl.v, origin);
    if (fall) addFall(origin[0] + fall.x * isl.v, origin[1] + fall.y * isl.v, origin[2] + fall.z * isl.v, fall.dir, isl.v * 2.2, 150 + isl.R * 3);
  }
  // castle on the hills, landward
  {
    const cx = 560, cz = -640;
    const gy = heightAt(cx, cz);
    const g = new VoxelGrid(44, 48, 44);
    for (let x = 0; x < 44; x++) for (let z = 0; z < 44; z++) for (let y = 0; y < 6; y++) g.set(x, y, z, y === 5 ? B.GRASS : B.STONE);
    buildCastle(g, 22, 6, 22, 15, rng(5));
    g.mesh(builder, 2.2, [cx - 22 * 2.2, gy - 6 * 2.2, cz - 22 * 2.2]);
  }
  // lighthouse on a rock out at sea
  let beam = null;
  {
    const lx = -640, lz = 860;
    const { grid, lamp } = lighthouse();
    const v = 1.6;
    const origin = [lx - 10.5 * v, SEA_Y - 3, lz - 10.5 * v];
    grid.mesh(builder, v, origin);
    const bg = new THREE.ConeGeometry(14, 240, 24, 1, true);
    bg.translate(0, -120, 0);
    bg.rotateZ(Math.PI / 2);
    beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    beam.position.set(origin[0] + lamp[0] * v, origin[1] + lamp[1] * v, origin[2] + lamp[2] * v);
    group.add(beam);
  }
  const mesh = new THREE.Mesh(builder.build(), mat);
  group.add(mesh);

  // airships
  const shipGeo = (() => { const b = new QuadBuilder(); airship().mesh(b, 1.6, [-20.8, -9.6, -8]); return b.build(); })();
  const ships = [
    { r: 330, y: 270, speed: 0.016, phase: 0.6 },
    { r: 980, y: 300, speed: -0.008, phase: 2.8 },
  ].map((s) => { const m = new THREE.Mesh(shipGeo, mat); group.add(m); return { ...s, mesh: m }; });

  let t = 0;
  return {
    group,
    material: mat,
    update(dt, sky) {
      t += dt;
      fallMat.uniforms.uTime.value = t;
      const light = 0.35 + sky.w.day * 0.75 + sky.w.sunset * 0.6;
      fallMat.uniforms.uLight.value.setScalar(light);
      for (const s of ships) {
        const a = s.phase + t * s.speed;
        s.mesh.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.3 + s.phase) * 4, Math.sin(a) * s.r);
        s.mesh.rotation.y = -a + (s.speed > 0 ? Math.PI : 0);
      }
      if (beam) {
        beam.visible = sky.w.night + sky.w.sunset * 0.4 > 0.2;
        beam.rotation.y = t * 0.6;
      }
      mat.userData.emissiveBoost.value = 0.35 + sky.w.night * 1.6 + sky.w.sunset * 0.5;
    },
  };
}
