import * as THREE from 'three';
import { GeoBuilder } from './geobuilder.js';
import { POIS, LAKE } from './island.js';
import { makeRng } from '../util.js';

function treeGeometry(type) {
  const gb = new GeoBuilder(makeRng(type.length * 31));
  gb.jitter = 0.08;
  const trunk = '#6b4a2f';
  switch (type) {
    case 'oak':
    case 'autumnA':
    case 'autumnB': {
      const leaf = type === 'oak' ? '#4f9a3a' : type === 'autumnA' ? '#e0862e' : '#c8452f';
      gb.cylinder(0, -0.5, 0, 0.42, 0.28, 4.2, 6, trunk);
      gb.sphere(0, 4.8, 0, 2.5, 7, 5, leaf);
      gb.sphere(1.1, 4.1, 0.6, 1.8, 6, 4, leaf);
      gb.sphere(-0.9, 4.3, -0.6, 1.9, 6, 4, leaf);
      gb.sphere(0.2, 6.2, -0.2, 1.5, 6, 4, leaf);
      break;
    }
    case 'pine':
    case 'snowpine': {
      const g = '#2f6e3a';
      const w = type === 'snowpine' ? '#e6eef4' : '#3a7d43';
      gb.cylinder(0, -0.5, 0, 0.35, 0.25, 2.6, 6, trunk);
      gb.cone(0, 1.6, 0, 2.6, 3.4, 7, g);
      gb.cone(0, 3.6, 0, 2.0, 3.0, 7, type === 'snowpine' ? w : g);
      gb.cone(0, 5.5, 0, 1.4, 2.6, 7, w);
      break;
    }
    case 'palm': {
      let x = 0, y = -0.5;
      for (let i = 0; i < 5; i++) {
        gb.cylinder(x, y, 0, 0.32 - i * 0.03, 0.29 - i * 0.03, 1.5, 6, '#8a6a45');
        x += 0.18 + i * 0.06;
        y += 1.45;
      }
      const leaf = '#3d9a3a';
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const c = Math.cos(a), s = Math.sin(a);
        const base = [x, y, 0];
        const mid = [x + c * 2.2, y + 0.4, s * 2.2];
        const tip = [x + c * 3.8, y - 1.0, s * 3.8];
        const px = -s * 0.6, pz = c * 0.6;
        const col = gb.rgb(leaf);
        gb.tri(base, [mid[0] + px, mid[1], mid[2] + pz], [mid[0] - px, mid[1], mid[2] - pz], col);
        gb.tri(base, [mid[0] - px, mid[1], mid[2] - pz], [mid[0] + px, mid[1], mid[2] + pz], col);
        gb.tri([mid[0] + px, mid[1], mid[2] + pz], tip, [mid[0] - px, mid[1], mid[2] - pz], col);
        gb.tri([mid[0] - px, mid[1], mid[2] - pz], tip, [mid[0] + px, mid[1], mid[2] + pz], col);
      }
      gb.sphere(x, y - 0.2, 0, 0.45, 6, 4, '#6b4a2f');
      break;
    }
    case 'cactus': {
      const g = '#5c8f3a';
      gb.cylinder(0, -0.5, 0, 0.45, 0.4, 4, 7, g);
      gb.sphere(0, 3.5, 0, 0.4, 7, 4, g);
      gb.cylinder(0.4, 1.4, 0, 0.22, 0.22, 0.2, 6, g);
      gb.boxRot(0.75, 1.3, 0, 0.8, 0.4, 0.4, 0, g);
      gb.cylinder(1.0, 1.3, 0, 0.22, 0.2, 1.5, 6, g);
      gb.boxRot(-0.7, 2.0, 0, 0.7, 0.36, 0.36, 0, g);
      gb.cylinder(-0.95, 2.0, 0, 0.2, 0.18, 1.1, 6, g);
      break;
    }
    case 'swamp': {
      gb.cylinder(0, -0.8, 0, 0.6, 0.35, 5, 6, '#4d3f2c');
      gb.sphere(0, 5.4, 0, 3.6, 8, 5, '#5d6b2c', 0.45);
      gb.sphere(1.5, 4.8, 1, 2, 6, 4, '#6a7a33', 0.5);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        gb.cylinder(Math.cos(a) * 2.6, 2.6, Math.sin(a) * 2.6, 0.05, 0.12, 2.4, 4, '#7a8a45');
      }
      break;
    }
    case 'dead': {
      const c = '#7a6a58';
      gb.cylinder(0, -0.5, 0, 0.3, 0.18, 4.5, 5, c);
      gb.boxRot(0.6, 2.4, 0, 1.4, 0.18, 0.18, 0.3, c);
      gb.boxRot(-0.5, 3.1, 0.2, 1.2, 0.16, 0.16, 2.2, c);
      gb.boxRot(0.2, 3.7, -0.4, 1, 0.14, 0.14, 4.1, c);
      break;
    }
  }
  return gb.build();
}

function metalGeometry(kind) {
  const gb = new GeoBuilder(makeRng(kind.length * 7));
  gb.jitter = 0.05;
  if (kind === 'car') {
    gb.box(-2.1, 0.35, -0.95, 2.1, 1.15, 0.95, '#ffffff');
    gb.box(-1.0, 1.15, -0.85, 1.0, 1.85, 0.85, '#e6e6e6');
    gb.box(-0.95, 1.2, -0.87, 0.95, 1.75, 0.87, '#2c3a45');
    for (const [x, z] of [[-1.3, -0.9], [1.3, -0.9], [-1.3, 0.9], [1.3, 0.9]]) gb.box(x - 0.38, 0, z - 0.14, x + 0.38, 0.76, z + 0.14, '#222', false);
  } else if (kind === 'barrels') {
    for (const [x, z] of [[0, 0], [0.75, 0.2], [0.2, 0.8]]) {
      gb.cylinder(x, 0, z, 0.38, 0.38, 1.1, 8, '#ffffff');
      gb.cylinder(x, 0.5, z, 0.4, 0.4, 0.1, 8, '#555');
    }
  } else {
    gb.box(-1.6, 0.6, -0.8, 1.2, 1.6, 0.8, '#ffffff');
    gb.box(-1.4, 1.6, -0.6, 0, 2.6, 0.6, '#dddddd');
    for (const z of [-0.95, 0.95]) {
      gb.box(-2.3, 0, z - 0.2, -0.5, 1.8, z + 0.2, '#222', false);
      gb.box(0.5, 0, z - 0.15, 1.5, 1.0, z + 0.15, '#222', false);
    }
  }
  return gb.build();
}

const TREE_TYPES = ['oak', 'pine', 'snowpine', 'autumnA', 'autumnB', 'palm', 'cactus', 'swamp', 'dead'];
const METAL_TYPES = ['car', 'barrels', 'tractor'];
const METAL_COLORS = { car: ['#b8452f', '#3f6fa8', '#c9a23a', '#7d8a8f', '#8a5a9a'], barrels: ['#c44a2f', '#2f7ac4', '#c9a23a'], tractor: ['#3f8a3a', '#c9502f'] };

const BIOME_TREES = {
  grass: { density: 0.22, types: [['oak', 7], ['pine', 3]] },
  forest: { density: 0.5, types: [['pine', 6], ['oak', 4]] },
  snow: { density: 0.3, types: [['snowpine', 1]] },
  desert: { density: 0.06, types: [['cactus', 6], ['dead', 2]] },
  swamp: { density: 0.34, types: [['swamp', 6], ['dead', 3]] },
  autumn: { density: 0.42, types: [['autumnA', 5], ['autumnB', 4], ['pine', 1]] },
  farm: { density: 0.05, types: [['oak', 1]] },
};

export class Props {
  constructor(terrain, collision, structures, seed = 4242) {
    this.T = terrain;
    this.W = collision;
    this.S = structures;
    this.rng = makeRng(seed);
    this.group = new THREE.Group();
    this.group.name = 'props';
    this.harvestables = [];
    this.meshes = {};
    this.shaking = new Set();
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._v = new THREE.Vector3();
    this._s = new THREE.Vector3();
  }

  blocked(x, z, pad) {
    for (const r of this.S.rects) {
      if (x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad) return true;
    }
    return false;
  }

  generate() {
    const rng = this.rng;
    const trees = {};
    for (const t of TREE_TYPES) trees[t] = [];
    // Trees on a jittered grid
    const step = 9;
    for (let gx = -480; gx <= 480; gx += step) {
      for (let gz = -480; gz <= 480; gz += step) {
        const x = gx + (rng() - 0.5) * step * 0.9, z = gz + (rng() - 0.5) * step * 0.9;
        const h = this.T.heightAt(x, z);
        if (h < 0.4) continue;
        const coast = this.T.coastDistance(x, z);
        let type = null;
        if (coast > 0.9 && h < 3.5 && this.T.biomeAt(x, z) !== 'snow') {
          if (rng() < 0.12) type = 'palm';
        } else {
          if (h < 1.0) continue;
          const biome = this.T.biomeAt(x, z);
          const info = BIOME_TREES[biome];
          let dens = info.density;
          if (h > 62) dens *= 0.3;
          const poi = POIS.find((p) => Math.hypot(p.x - x, p.z - z) < p.r);
          if (poi) dens *= poi.type === 'swamp' || poi.type === 'camp' || poi.type === 'cabins' ? 0.6 : 0.12;
          if (rng() > dens) continue;
          const w = info.types.map((t) => t[1]);
          type = info.types[rng.weighted(w)][0];
        }
        if (!type) continue;
        if (this.T.distToRoad(x, z) < 6.5 || this.T.distToRiver(x, z) < 2 || this.blocked(x, z, 3)) continue;
        if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 2) continue;
        if (this.T.slopeAtRaw(x, z) > 1.3) continue;
        trees[type].push({ x, z, s: rng.range(0.8, 1.35), r: rng() * Math.PI * 2 });
      }
    }
    for (const type of TREE_TYPES) {
      const list = trees[type];
      if (!list.length) continue;
      const mesh = new THREE.InstancedMesh(treeGeometry(type), this.mat, list.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = 'trees-' + type;
      list.forEach((t, i) => {
        const y = this.T.heightAt(t.x, t.z);
        const tint = 0.85 + rng() * 0.3;
        mesh.setColorAt(i, new THREE.Color(tint, tint, tint));
        const hp = Math.round(type === 'cactus' ? 120 : 150 * t.s + 60);
        const h = {
          kind: 'tree', type, x: t.x, y, z: t.z, s: t.s, rot: t.r, hp, maxHp: hp, resource: 'wood',
          mesh, index: i, alive: true, shake: 0,
        };
        const rad = (type === 'swamp' ? 0.6 : 0.45) * t.s;
        h.collider = this.W.box(t.x - rad, y - 1, t.z - rad, t.x + rad, y + 6.5 * t.s, t.z + rad, h);
        this.setMatrix(h);
        this.harvestables.push(h);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      this.group.add(mesh);
      this.meshes[type] = mesh;
    }
    this.generateRocks();
    this.generateBushes();
    this.generateMetal();
    this.generateCrops();
  }

  generateRocks() {
    const rng = this.rng;
    const list = [];
    for (let gx = -470; gx <= 470; gx += 20) {
      for (let gz = -470; gz <= 470; gz += 20) {
        const x = gx + (rng() - 0.5) * 18, z = gz + (rng() - 0.5) * 18;
        const h = this.T.heightAt(x, z);
        if (h < 0.8) continue;
        const biome = this.T.biomeAt(x, z);
        let p = biome === 'snow' ? 0.35 : biome === 'desert' ? 0.25 : biome === 'farm' ? 0.04 : 0.12;
        if (h > 40) p = 0.45;
        if (POIS.some((q) => Math.hypot(q.x - x, q.z - z) < q.r * 0.9)) p *= 0.15;
        if (rng() > p) continue;
        if (this.T.distToRoad(x, z) < 7 || this.blocked(x, z, 3) || this.T.distToRiver(x, z) < 1) continue;
        list.push({ x, z, sx: rng.range(1.0, 2.6), sy: rng.range(0.7, 1.8), sz: rng.range(1.0, 2.6), r: rng() * Math.PI * 2, biome });
      }
    }
    const geo = new THREE.DodecahedronGeometry(1, 0);
    geo.computeVertexNormals();
    const cols = new Float32Array(geo.attributes.position.count * 3).fill(1);
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const mesh = new THREE.InstancedMesh(geo, this.mat, list.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'rocks';
    const c = new THREE.Color();
    list.forEach((r, i) => {
      const y = this.T.heightAt(r.x, r.z);
      c.set(r.biome === 'desert' ? '#c79a6a' : r.biome === 'snow' ? '#9aa1a8' : '#8d8a84');
      c.multiplyScalar(0.85 + this.rng() * 0.3);
      mesh.setColorAt(i, c);
      const hp = Math.round(200 + 60 * r.sx * r.sz);
      const h = { kind: 'rock', type: 'rock', x: r.x, y: y - 0.3 * r.sy, z: r.z, sx: r.sx, sy: r.sy, sz: r.sz, rot: r.r, hp, maxHp: hp, resource: 'stone', mesh, index: i, alive: true, shake: 0 };
      const ext = Math.max(r.sx, r.sz) * 0.8;
      h.collider = this.W.box(r.x - ext, y - 2, r.z - ext, r.x + ext, y + r.sy * 0.75, r.z + ext, h);
      this.setMatrix(h);
      this.harvestables.push(h);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    this.group.add(mesh);
    this.meshes.rock = mesh;
  }

  generateBushes() {
    const rng = this.rng;
    const pts = [];
    for (let i = 0; i < 1400; i++) {
      const x = (rng() - 0.5) * 900, z = (rng() - 0.5) * 900;
      const h = this.T.heightAt(x, z);
      if (h < 1 || h > 50) continue;
      const b = this.T.biomeAt(x, z);
      if (b === 'desert' || b === 'snow') continue;
      if (this.T.distToRoad(x, z) < 5 || this.blocked(x, z, 1.5)) continue;
      pts.push({ x, z, y: h, s: rng.range(0.7, 1.5), b });
    }
    const geo = new THREE.IcosahedronGeometry(1, 0);
    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3));
    const mesh = new THREE.InstancedMesh(geo, this.mat, pts.length);
    mesh.receiveShadow = true;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    pts.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, p.y + 0.3 * p.s, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 6, 0)), new THREE.Vector3(p.s * 1.3, p.s * 0.9, p.s * 1.3));
      mesh.setMatrixAt(i, m);
      c.set(p.b === 'autumn' ? '#b8702e' : p.b === 'swamp' ? '#5a6a2c' : '#4a8f35');
      c.multiplyScalar(0.85 + rng() * 0.3);
      mesh.setColorAt(i, c);
    });
    mesh.name = 'bushes';
    this.group.add(mesh);
  }

  generateMetal() {
    const rng = this.rng;
    const spots = this.S.metalSpots.slice();
    // Wrecks along roads
    for (let i = 0; i < 26; i++) {
      const road = rng.pick(this.T.roads);
      const k = rng.int(2, road.points.length - 3);
      const [x, z] = road.points[k];
      const [nx, nz] = road.points[k + 1];
      const px = -(nz - z), pz = nx - x;
      const len = Math.hypot(px, pz) || 1;
      const side = rng.chance(0.5) ? 1 : -1;
      spots.push({ x: x + (px / len) * 6.5 * side, z: z + (pz / len) * 6.5 * side, kind: 'car' });
    }
    const byKind = { car: [], barrels: [], tractor: [] };
    for (const s of spots) {
      const h = this.T.heightAt(s.x, s.z);
      if (h < 0.8 || this.blocked(s.x, s.z, 1.5)) continue;
      let clash = false;
      this.W.query(s.x - 2.5, s.z - 2.5, s.x + 2.5, s.z + 2.5, () => {
        clash = true;
        return false;
      });
      if (clash) continue;
      byKind[s.kind].push({ ...s, y: h, rot: rng.chance(0.5) ? 0 : Math.PI / 2, color: rng.pick(METAL_COLORS[s.kind]) });
    }
    for (const kind of METAL_TYPES) {
      const list = byKind[kind];
      if (!list.length) continue;
      const mesh = new THREE.InstancedMesh(metalGeometry(kind), this.mat, list.length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = 'metal-' + kind;
      list.forEach((s, i) => {
        mesh.setColorAt(i, new THREE.Color(s.color));
        const hp = kind === 'barrels' ? 150 : 300;
        const h = { kind: 'metal', type: kind, x: s.x, y: s.y - 0.05, z: s.z, s: 1, rot: s.rot, hp, maxHp: hp, resource: 'metal', mesh, index: i, alive: true, shake: 0 };
        const ex = kind === 'barrels' ? 0.9 : s.rot === 0 ? 2.1 : 1.0;
        const ez = kind === 'barrels' ? 0.9 : s.rot === 0 ? 1.0 : 2.1;
        h.collider = this.W.box(s.x - ex, s.y - 0.5, s.z - ez, s.x + ex, s.y + (kind === 'tractor' ? 2.6 : kind === 'car' ? 1.8 : 1.1), s.z + ez, h);
        this.setMatrix(h);
        this.harvestables.push(h);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      this.group.add(mesh);
      this.meshes['metal-' + kind] = mesh;
    }
  }

  generateCrops() {
    const rng = this.rng;
    const pts = [];
    for (let i = 0; i < 9000 && pts.length < 2600; i++) {
      const x = -40 + (rng() - 0.5) * 260, z = -300 + (rng() - 0.5) * 200;
      if (this.T.biomeAt(x, z) !== 'farm') continue;
      const h = this.T.heightAt(x, z);
      if (h < 1.2) continue;
      if (this.T.distToRoad(x, z) < 6 || this.blocked(x, z, 2)) continue;
      const fx = Math.floor(x / 30), fz = Math.floor(z / 22);
      const kind = Math.abs(Math.sin(fx * 3.1 + fz * 7.7)) % 1;
      if (kind < 0.35) continue;
      // snap to rows
      const rz = Math.round(z / 1.6) * 1.6;
      pts.push({ x, z: rz, y: this.T.heightAt(x, rz), corn: kind > 0.7 });
    }
    const geo = new THREE.BoxGeometry(0.5, 1, 0.5).toNonIndexed();
    geo.translate(0, 0.5, 0);
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3));
    const mesh = new THREE.InstancedMesh(geo, this.mat, pts.length);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    pts.forEach((p, i) => {
      const hgt = p.corn ? 1.9 : 0.9;
      m.compose(new THREE.Vector3(p.x, p.y - 0.1, p.z), new THREE.Quaternion(), new THREE.Vector3(1, hgt, 1));
      mesh.setMatrixAt(i, m);
      c.set(p.corn ? '#5e9e38' : '#d9bd55').multiplyScalar(0.85 + rng() * 0.3);
      mesh.setColorAt(i, c);
    });
    mesh.name = 'crops';
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  setMatrix(h, wobble = 0) {
    const q = this._q.setFromEuler(this._e.set(wobble * 0.05, h.rot, wobble * 0.04));
    if (!h.alive) this._s.set(0.0001, 0.0001, 0.0001);
    else if (h.kind === 'rock') this._s.set(h.sx, h.sy, h.sz);
    else this._s.set(h.s, h.s, h.s);
    this._m.compose(this._v.set(h.x, h.y, h.z), q, this._s);
    h.mesh.setMatrixAt(h.index, this._m);
    h.mesh.instanceMatrix.needsUpdate = true;
  }

  // Apply a pickaxe hit. Returns true if destroyed.
  hit(h, damage) {
    if (!h.alive) return false;
    h.hp -= damage;
    h.shake = 0.25;
    this.shaking.add(h);
    if (h.hp <= 0) {
      h.alive = false;
      this.W.remove(h.collider);
      this.shaking.delete(h);
      this.setMatrix(h);
      return true;
    }
    return false;
  }

  update(dt) {
    for (const h of this.shaking) {
      h.shake -= dt;
      if (h.shake <= 0) {
        h.shake = 0;
        this.shaking.delete(h);
        this.setMatrix(h);
      } else {
        this.setMatrix(h, Math.sin(h.shake * 60) * h.shake * 4);
      }
    }
  }

  reset() {
    for (const h of this.harvestables) {
      if (!h.alive) {
        h.alive = true;
        this.W.add(h.collider);
      }
      h.hp = h.maxHp;
      h.shake = 0;
      this.setMatrix(h);
    }
    this.shaking.clear();
  }
}
