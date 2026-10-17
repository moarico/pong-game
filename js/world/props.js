import * as THREE from 'three';
import { GeoBuilder } from './geobuilder.js';
import { POIS, LAKE } from './island.js';
import { makeRng } from '../util.js';
import { treeParts, bushParts, boulderGeometry, foliageMaterials, cropGeometry, WIND } from './foliage.js';
import { rockMaterial } from './terrainmat.js';
import { sedanGeometry } from '../zh/models.js';

function metalGeometry(kind) {
  const gb = new GeoBuilder(makeRng(kind.length * 7));
  gb.jitter = 0.05;
  if (kind === 'car') {
    return sedanGeometry();
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
    this.mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 });
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._v = new THREE.Vector3();
    this._s = new THREE.Vector3();
  }

  // Instanced meshes split into 128 m chunks, so the camera and the shadow pass cull what is out of view.
  // items: [{ x, z, ... }]; place(item, mesh, index) fills one instance. Returns the meshes created.
  chunked(name, geo, mat, items, place, shadow = true) {
    const CH = 128, by = new Map(), out = [];
    for (const it of items) {
      const k = Math.floor(it.x / CH) + ',' + Math.floor(it.z / CH);
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(it);
    }
    for (const [key, list] of by) {
      const mesh = new THREE.InstancedMesh(geo, mat, list.length);
      mesh.castShadow = shadow;
      mesh.receiveShadow = true;
      mesh.name = name + '-' + key;
      list.forEach((it, i) => place(it, mesh, i));
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
      this.group.add(mesh);
      out.push(mesh);
    }
    return out;
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
    for (let gx = -510; gx <= 510; gx += step) {
      for (let gz = -510; gz <= 510; gz += step) {
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
    // Trees are instanced per 128 m chunk so the camera culls whole chunks, and far chunks swap their
    // canopies for a low-detail version with a quarter of the leaf cards.
    const M = foliageMaterials();
    const CH = 128;
    this.treeChunks = [];
    for (const type of TREE_TYPES) {
      const list = trees[type];
      if (!list.length) continue;
      const parts = treeParts(type), far = parts.leaves ? treeParts(type, 1) : null;
      const byChunk = new Map();
      for (const t of list) {
        const k = Math.floor(t.x / CH) + ',' + Math.floor(t.z / CH);
        if (!byChunk.has(k)) byChunk.set(k, []);
        byChunk.get(k).push(t);
      }
      for (const [key, items] of byChunk) {
        const mesh = new THREE.InstancedMesh(parts.trunk, type === 'cactus' || type === 'dead' ? M.plain : M.bark, items.length);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = 'trees-' + type + '-' + key;
        let leaves = null, leavesFar = null;
        if (parts.leaves) {
          leaves = new THREE.InstancedMesh(parts.leaves, M[parts.leafMat], items.length);
          leaves.castShadow = true;
          leaves.receiveShadow = true;
          leaves.name = 'leaves-' + type + '-' + key;
          leavesFar = new THREE.InstancedMesh(far.leaves, M[parts.leafMat], items.length);
          leavesFar.castShadow = true;
          leavesFar.receiveShadow = true;
          leavesFar.visible = false;
          leavesFar.name = 'leavesfar-' + type + '-' + key;
        }
        items.forEach((t, i) => {
          const y = this.T.heightAt(t.x, t.z);
          const tint = 0.85 + rng() * 0.3;
          mesh.setColorAt(i, new THREE.Color(tint, tint, tint));
          if (leaves) {
            const lt = 0.82 + rng() * 0.36;
            const lc = new THREE.Color(lt * (0.95 + rng() * 0.1), lt, lt * (0.95 + rng() * 0.1));
            leaves.setColorAt(i, lc);
            leavesFar.setColorAt(i, lc);
          }
          const hp = Math.round(type === 'cactus' ? 120 : 150 * t.s + 60);
          const h = {
            kind: 'tree', type, x: t.x, y, z: t.z, s: t.s, rot: t.r, hp, maxHp: hp, resource: 'wood',
            mesh, mesh2: leaves, mesh3: leavesFar, index: i, alive: true, shake: 0,
          };
          const rad = (type === 'swamp' ? 0.6 : 0.45) * t.s;
          h.collider = this.W.box(t.x - rad, y - 1, t.z - rad, t.x + rad, y + 6.5 * t.s, t.z + rad, h);
          this.setMatrix(h);
          this.harvestables.push(h);
        });
        const cx = (Math.floor(items[0].x / CH) + 0.5) * CH, cz = (Math.floor(items[0].z / CH) + 0.5) * CH;
        for (const m of [mesh, leaves, leavesFar]) {
          if (!m) continue;
          m.instanceMatrix.needsUpdate = true;
          if (m.instanceColor) m.instanceColor.needsUpdate = true;
          m.computeBoundingSphere();
          this.group.add(m);
        }
        this.treeChunks.push({ cx, cz, leaves, leavesFar });
        this.meshes[type] = mesh;
      }
    }
    this.generateRocks();
    this.generateBushes();
    this.generateMetal();
    this.generateCrops();
  }

  generateRocks() {
    const rng = this.rng;
    const list = [];
    for (let gx = -500; gx <= 500; gx += 20) {
      for (let gz = -500; gz <= 500; gz += 20) {
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
    // three boulder shapes, dealt out in turn
    const rmat = rockMaterial();
    const c = new THREE.Color();
    for (let k = 0; k < 3; k++) {
      const geo = boulderGeometry(91 + k * 37);
      const mine = list.filter((_, i) => i % 3 === k);
      this.chunked('rocks' + k, geo, rmat, mine, (r, mesh, i) => {
        const y = this.T.heightAt(r.x, r.z);
        c.set(r.biome === 'desert' ? '#b98d64' : r.biome === 'snow' ? '#9ea4aa' : '#8f8b84');
        c.multiplyScalar(0.85 + this.rng() * 0.3);
        mesh.setColorAt(i, c);
        const hp = Math.round(200 + 60 * r.sx * r.sz);
        const h = { kind: 'rock', type: 'rock', x: r.x, y: y - 0.3 * r.sy, z: r.z, sx: r.sx, sy: r.sy, sz: r.sz, rot: r.r, hp, maxHp: hp, resource: 'stone', mesh, index: i, alive: true, shake: 0 };
        const ext = Math.max(r.sx, r.sz) * 0.8;
        h.collider = this.W.box(r.x - ext, y - 2, r.z - ext, r.x + ext, y + r.sy * 0.75, r.z + ext, h);
        this.setMatrix(h);
        this.harvestables.push(h);
      });
    }
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
    // leafy bushes, one set of chunked meshes per kind of leaf color
    const M = foliageMaterials();
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (const kind of ['green', 'autumn', 'swamp']) {
      const mine = pts.filter((p) => (p.b === 'autumn' ? 'autumn' : p.b === 'swamp' ? 'swamp' : 'green') === kind);
      if (!mine.length) continue;
      this.chunked('bushes-' + kind, bushParts(kind), M.broad, mine, (p, mesh, i) => {
        m.compose(new THREE.Vector3(p.x, p.y - 0.15, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 6, 0)), new THREE.Vector3(p.s * 1.3, p.s * 1.0, p.s * 1.3));
        mesh.setMatrixAt(i, m);
        const k = 0.85 + rng() * 0.3;
        mesh.setColorAt(i, c.setRGB(k, k, k));
      });
    }
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
    for (let i = 0; i < 16000 && pts.length < 4200; i++) {
      const x = -40 + (rng() - 0.5) * 260, z = -300 + (rng() - 0.5) * 200;
      if (this.T.biomeAt(x, z) !== 'farm') continue;
      const h = this.T.heightAt(x, z);
      if (h < 1.2) continue;
      if (this.T.distToRoad(x, z) < 6 || this.blocked(x, z, 2)) continue;
      const fx = Math.floor(x / 30), fz = Math.floor(z / 22);
      const kind = Math.abs(Math.sin(fx * 3.1 + fz * 7.7)) % 1;
      if (kind < 0.35) continue;
      // snap to rows
      const rz = Math.round(z / 1.2) * 1.2;
      pts.push({ x, z: rz, y: this.T.heightAt(x, rz), corn: kind > 0.7 });
    }
    // corn stalks and wheat clumps, swaying with the grass
    const M = foliageMaterials();
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (const corn of [true, false]) {
      const mine = pts.filter((p) => p.corn === corn);
      if (!mine.length) continue;
      this.cropChunks = this.cropChunks || [];
      this.cropChunks.push(...this.chunked(corn ? 'crops-corn' : 'crops-wheat', cropGeometry(corn ? 'corn' : 'wheat'), corn ? M.frond : M.plain, mine, (p, mesh, i) => {
        const s = 0.85 + rng() * 0.3;
        m.compose(new THREE.Vector3(p.x, p.y - 0.05, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rng() * 6.28, 0)), new THREE.Vector3(s, s * (0.9 + rng() * 0.2), s));
        mesh.setMatrixAt(i, m);
        const k = 0.85 + rng() * 0.3;
        mesh.setColorAt(i, c.setRGB(k, k, k));
      }, corn));
    }
  }

  setMatrix(h, wobble = 0) {
    const q = this._q.setFromEuler(this._e.set(wobble * 0.05, h.rot, wobble * 0.04));
    if (!h.alive) this._s.set(0.0001, 0.0001, 0.0001);
    else if (h.kind === 'rock') this._s.set(h.sx, h.sy, h.sz);
    else this._s.set(h.s, h.s, h.s);
    this._m.compose(this._v.set(h.x, h.y, h.z), q, this._s);
    h.mesh.setMatrixAt(h.index, this._m);
    h.mesh.instanceMatrix.needsUpdate = true;
    if (h.mesh2) {
      h.mesh2.setMatrixAt(h.index, this._m);
      h.mesh2.instanceMatrix.needsUpdate = true;
    }
    if (h.mesh3) {
      h.mesh3.setMatrixAt(h.index, this._m);
      h.mesh3.instanceMatrix.needsUpdate = true;
    }
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

  // Near chunks show full canopies, far ones the low-detail cards.
  updateLod(camera) {
    if (!this.treeChunks) return;
    const p = camera.position;
    // crops are dense and small: only the fields near you are drawn
    for (const m of this.cropChunks || []) {
      const c = m.boundingSphere.center;
      m.visible = Math.hypot(c.x - p.x, c.z - p.z) < 130 + m.boundingSphere.radius;
    }
    for (const c of this.treeChunks) {
      if (!c.leaves) continue;
      const near = Math.hypot(c.cx - p.x, c.cz - p.z) < 150;
      c.leaves.visible = near;
      c.leavesFar.visible = !near;
    }
  }

  update(dt) {
    WIND.time.value += dt;
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
