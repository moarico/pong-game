// The big blocky stadium shell: two tiers of stepped stands packed with a pixel-art crowd,
// a concourse ad band, a team-coloured parapet, a stone outer facade and giant voxel
// floodlight towers outside. Profiles are in uu (arena space); towers are in metres.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { B, QuadBuilder, VoxelGrid, blockMaterial } from './blocks.js';
import { S, TEAM_COLORS } from '../../config.js';

const TIER1 = { steps: 18, rise: 92, depth: 150, start: [-60, 720] };
const TIER2 = { steps: 22, rise: 150, depth: 170 };
const CONCOURSE_TOP = 2900;
export const RIM = { offset: 7000, y: 6600, inner: 6740 };

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function pixelTex(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// a row of blocky fans in front of their seat backs
function crowdTexture() {
  const W = 512, H = 32;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  let s = 99;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.fillStyle = '#15171c';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#23262e';
  for (let x = 0; x < W; x += 8) g.fillRect(x + 1, 6, 6, 10); // seat backs
  const shirts = ['#2f62d6', '#f07a1c', '#2f62d6', '#f07a1c', '#e8ecf0', '#1c1c1c', '#8a2a2a', '#3a7a3a', '#c8b040', '#5a5f6e', '#2f62d6', '#f07a1c'];
  const skins = ['#d7a98a', '#b9845f', '#8d5a3b', '#5e3b26', '#e8c4a6'];
  const hair = ['#2a1c12', '#5a3a1c', '#1a1a1a', '#c8a050', '#7a4a2a'];
  for (let x = 0; x < W; x += 8) {
    if (r() < 0.08) continue; // empty seat
    const sh = shirts[Math.floor(r() * shirts.length)];
    const sk = skins[Math.floor(r() * skins.length)];
    const up = r() < 0.2;
    const y0 = 9 + Math.floor(r() * 3);
    g.fillStyle = sh;
    g.fillRect(x + 1, y0 + 8, 6, H - y0 - 8);
    g.fillStyle = sk;
    g.fillRect(x + 2, y0 + 2, 4, 5);
    g.fillStyle = hair[Math.floor(r() * hair.length)];
    g.fillRect(x + 2, y0 + 1, 4, 2);
    if (up) {
      g.fillStyle = sk;
      g.fillRect(x, y0 - 3, 1, 8);
      g.fillRect(x + 7, y0 - 3, 1, 8);
      if (r() < 0.5) { g.fillStyle = r() < 0.5 ? '#2f62d6' : '#f07a1c'; g.fillRect(x - 1, y0 - 6, 10, 3); } // scarf
    }
  }
  return pixelTex(c);
}

// seat rows seen from above
function seatTexture() {
  const c = canvas(64, 16);
  const g = c.getContext('2d');
  g.fillStyle = '#3a3f4a';
  g.fillRect(0, 0, 64, 16);
  for (let x = 0; x < 64; x += 8) { g.fillStyle = '#4c5260'; g.fillRect(x + 1, 2, 6, 8); g.fillStyle = '#2a2e36'; g.fillRect(x + 1, 10, 6, 2); }
  return pixelTex(c);
}

// stone-brick outer facade with lit windows
function facadeTexture() {
  const c = canvas(64, 64);
  const g = c.getContext('2d');
  for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 16) {
    const off = (y / 8) % 2 ? 8 : 0;
    const v = 120 + Math.floor(Math.random() * 30);
    g.fillStyle = `rgb(${v},${v},${v + 4})`;
    g.fillRect((x + off) % 64, y, 16, 8);
    g.fillStyle = 'rgb(80,80,84)';
    g.fillRect((x + off) % 64, y, 16, 1);
    g.fillRect((x + off) % 64, y, 1, 8);
  }
  g.fillStyle = '#ffd890';
  g.fillRect(24, 20, 16, 12);
  g.fillStyle = '#3a3020';
  g.fillRect(31, 20, 2, 12);
  // emission: only the windows glow
  const e = canvas(64, 64);
  const ge = e.getContext('2d');
  ge.fillStyle = '#000';
  ge.fillRect(0, 0, 64, 64);
  ge.fillStyle = '#ffd890';
  ge.fillRect(24, 20, 7, 12);
  ge.fillRect(33, 20, 7, 12);
  return { map: pixelTex(c), emit: pixelTex(e) };
}

function tierProfile(o0, y0, n, rise, depth) {
  const risers = [], treads = [];
  let o = o0, y = y0;
  for (let k = 0; k < n; k++) {
    risers.push([[o, y], [o, y + rise]]);
    treads.push([[o, y + rise], [o - depth, y + rise]]);
    y += rise;
    o -= depth;
  }
  return { risers, treads, end: [o, y] };
}

// ------------------------------------------------------------------ floodlight tower
function towerGeometry() {
  const H = 64, W = 6;
  const g = new VoxelGrid(16, H + 12, 8);
  const x0 = 5, z0 = 1;
  for (let y = 0; y < H; y++) {
    for (const [cx, cz] of [[0, 0], [W - 1, 0], [0, W - 1], [W - 1, W - 1]]) g.set(x0 + cx, y, z0 + cz, B.IRON);
    if (y % 6 === 0) {
      for (let k = 0; k < W; k++) { g.set(x0 + k, y, z0, B.IRON); g.set(x0 + k, y, z0 + W - 1, B.IRON); g.set(x0, y, z0 + k, B.IRON); g.set(x0 + W - 1, y, z0 + k, B.IRON); }
    } else {
      const d = y % 6;
      g.set(x0 + d, y, z0, B.IRON); g.set(x0 + W - 1 - d, y, z0 + W - 1, B.IRON);
      g.set(x0, y, z0 + d, B.IRON); g.set(x0 + W - 1, y, z0 + W - 1 - d, B.IRON);
    }
  }
  // light bank at the top facing +z (toward the pitch once rotated)
  g.box(0, H, 0, 15, H + 1, 7, B.DARK);
  for (let y = H + 2; y < H + 11; y++) for (let x = 0; x < 16; x++) {
    g.set(x, y, 6, B.DARK);
    if (y < H + 10 && x > 0 && x < 15) g.set(x, y, 7, (x + y) % 3 === 0 ? B.DARK : B.LAMP);
  }
  g.box(0, H + 11, 0, 15, H + 11, 7, B.DARK);
  const b = new QuadBuilder();
  g.mesh(b, 1.5, [-8 * 1.5, 0, -4 * 1.5]);
  return b.build();
}

export function buildBlockStands({ arena, root, pts, stripGeometry, teamTint, cuttable, quality, flood }) {
  const crowd = crowdTexture();
  const seats = seatTexture();
  const facade = facadeTexture();
  const tint = (amount) => (x, y, z) => { const c = teamTint(z, 1); return [1 - amount + c[0] * amount * 1.6, 1 - amount + c[1] * amount * 1.6, 1 - amount + c[2] * amount * 1.6]; };
  const t1 = tierProfile(TIER1.start[0], TIER1.start[1], TIER1.steps, TIER1.rise, TIER1.depth);
  const t2start = [t1.end[0] - 240, CONCOURSE_TOP];
  const t2 = tierProfile(t2start[0], t2start[1], TIER2.steps, TIER2.rise, TIER2.depth);
  const risers = [...t1.risers, ...t2.risers].map((p) => stripGeometry(pts, p, { uLen: 3600, vOf: (j) => j, colorOf: tint(0.22) }));
  const treads = [...t1.treads, ...t2.treads].map((p) => stripGeometry(pts, p, { uLen: 450, vOf: (j) => j, colorOf: tint(0.35) }));
  const crowdMat = cuttable(new THREE.MeshStandardMaterial({ map: crowd, vertexColors: true, roughness: 0.95, emissive: 0xffffff, emissiveMap: crowd, emissiveIntensity: 0.05, side: THREE.DoubleSide }));
  const seatMat = cuttable(new THREE.MeshStandardMaterial({ map: seats, vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }));
  const crowdMesh = new THREE.Mesh(mergeGeometries(risers), crowdMat);
  const seatMesh = new THREE.Mesh(mergeGeometries(treads), seatMat);
  for (const g of [...risers, ...treads]) g.dispose();
  crowdMesh.receiveShadow = seatMesh.receiveShadow = true;
  arena.add(crowdMesh, seatMesh);

  // concourse: a lit ad band between the tiers and a walkway
  const ads = arena.userData.adsTexture;
  const band = new THREE.Mesh(
    stripGeometry(pts, [[t1.end[0], t1.end[1]], [t1.end[0], CONCOURSE_TOP]], { uLen: 5200, vOf: (j) => j }),
    cuttable(new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0xffffff, emissiveMap: ads, emissiveIntensity: 1.5, side: THREE.DoubleSide })),
  );
  arena.add(band);
  const walkMat = cuttable(new THREE.MeshStandardMaterial({ color: 0x8e939c, roughness: 0.8, side: THREE.DoubleSide }));
  arena.add(new THREE.Mesh(stripGeometry(pts, [[t1.end[0], CONCOURSE_TOP], [t2start[0], CONCOURSE_TOP]], { uLen: 1000 }), walkMat));

  // team-coloured parapet and the stone outer facade
  const rimMat = cuttable(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, emissive: 0xffffff, emissiveIntensity: 0.0, side: THREE.DoubleSide }));
  const rimColor = (x, y, z) => { const c = teamTint(z, 1); return [0.15 + c[0] * 0.9, 0.15 + c[1] * 0.9, 0.15 + c[2] * 0.9]; };
  arena.add(new THREE.Mesh(stripGeometry(pts, [[t2.end[0], t2.end[1]], [t2.end[0], RIM.y], [-RIM.offset, RIM.y]], { colorOf: rimColor }), rimMat));
  const glowRim = cuttable(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide }));
  arena.add(new THREE.Mesh(stripGeometry(pts, [[t2.end[0] + 2, RIM.y - 110], [t2.end[0] + 2, RIM.y - 40]], { colorOf: (x, y, z) => teamTint(z, 3) }), glowRim));
  const facadeMat = cuttable(new THREE.MeshStandardMaterial({ map: facade.map, roughness: 0.9, emissive: 0xffffff, emissiveMap: facade.emit, emissiveIntensity: 0, side: THREE.DoubleSide }));
  const facadeMesh = new THREE.Mesh(stripGeometry(pts, [[-RIM.offset, RIM.y], [-RIM.offset, -600]], { uLen: 800, vOf: (j, y) => y / 800 }), facadeMat);
  arena.add(facadeMesh);
  // the void under the upper tier, seen from outside, gets a dark ceiling
  const underMat = cuttable(new THREE.MeshStandardMaterial({ color: 0x24272d, roughness: 0.9, side: THREE.DoubleSide }));
  arena.add(new THREE.Mesh(stripGeometry(pts, [[t2start[0], CONCOURSE_TOP], [-RIM.offset, CONCOURSE_TOP]], { uLen: 1000 }), underMat));

  // floodlight towers around the outside
  const towerMat = blockMaterial();
  towerMat.userData.emissiveBoost.value = 1.4;
  const towerGeo = towerGeometry();
  const towers = [];
  const spots = [[112, 126], [-112, 126], [112, -126], [-112, -126], [136, 0], [-136, 0]];
  const glowTex = (() => {
    const c = canvas(64, 64);
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,250,235,1)');
    gr.addColorStop(0.25, 'rgba(255,240,210,0.45)');
    gr.addColorStop(1, 'rgba(255,230,190,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xfff4e0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 });
  for (const [x, z] of spots) {
    const t = new THREE.Group();
    t.position.set(x, -6, z);
    t.rotation.y = Math.atan2(-x, -z); // light bank faces the pitch
    const m = new THREE.Mesh(towerGeo, towerMat);
    t.add(m);
    const glow = new THREE.Sprite(glowMat);
    glow.position.set(0, 64 * 1.5 + 9, 6 * 1.5 + 3);
    glow.scale.setScalar(46);
    t.add(glow);
    root.add(t);
    towers.push({ group: t, glow });
  }

  return {
    crowd,
    profile: {
      // stands cross-section behind a goal, [offset behind the back wall, height] (victory cinematic)
      standEdge: [[880, 1316], [Math.abs(t1.end[0]), t1.end[1]], [Math.abs(t1.end[0]), CONCOURSE_TOP], [Math.abs(t2start[0]), CONCOURSE_TOP], [Math.abs(t2.end[0]), t2.end[1]], [RIM.offset, RIM.y]],
      roofEdge: [[RIM.offset, RIM.y], [RIM.offset, -600]],
    },
    update(dt, sky) {
      const night = sky.w.night, dusk = sky.w.sunset;
      facadeMat.emissiveIntensity = 0.15 + night * 0.9 + dusk * 0.3;
      crowdMat.emissiveIntensity = 0.05 + night * 0.12;
      glowMat.opacity = 0.35 + night * 0.65 + dusk * 0.35;
      towerMat.userData.emissiveBoost.value = 0.8 + night * 1.6 + dusk * 0.6;
      if (flood) flood.intensity = Math.max(flood.intensity, 0);
    },
  };
}
