import * as THREE from 'three';
import { BUILD } from './config.js';
import { GeoBuilder } from './world/geobuilder.js';
import { clamp } from './util.js';

const T = BUILD.tile; // 4 m
const H = BUILD.wallHeight; // 3 m
const WALL_T = 0.24;
const MAX_PIECES = 1600;
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // north, east, south, west
export const PIECES = ['wall', 'floor', 'ramp', 'roof'];
const WALL_VARIANTS = ['full', 'door', 'window', 'half'];

const MAT_COLORS = {
  wood: { panel: '#c8975a', trim: '#7d5230', line: '#a87a44' },
  stone: { panel: '#a9a69e', trim: '#6f6c66', line: '#8b8880' },
  metal: { panel: '#a3b3c0', trim: '#56636f', line: '#7f8f9c' },
};

// Wall openings as [x0, x1, y0, y1] in wall-local coords (x in -2..2, y in 0..3).
function wallSolids(variant) {
  switch (variant) {
    case 'door': return [[-2, -0.65, 0, 3], [0.65, 2, 0, 3], [-0.65, 0.65, 2.3, 3]];
    case 'window': return [[-2, -0.65, 0, 3], [0.65, 2, 0, 3], [-0.65, 0.65, 0, 1.2], [-0.65, 0.65, 2.3, 3]];
    case 'half': return [[-2, 2, 0, 1.5]];
    default: return [[-2, 2, 0, 3]];
  }
}

const geoCache = new Map();
function pieceGeometry(type, variant, mat) {
  const key = `${type}-${variant}-${mat}`;
  if (geoCache.has(key)) return geoCache.get(key);
  const c = MAT_COLORS[mat];
  const gb = new GeoBuilder();
  gb.jitter = 0;
  const t = WALL_T / 2;
  if (type === 'wall') {
    for (const [x0, x1, y0, y1] of wallSolids(variant)) {
      gb.box(x0, y0, -t, x1, y1, t, c.panel, false);
    }
    // frame
    const top = variant === 'half' ? 1.5 : 3;
    gb.box(-2, 0, -t - 0.02, -1.85, top, t + 0.02, c.trim);
    gb.box(1.85, 0, -t - 0.02, 2, top, t + 0.02, c.trim);
    gb.box(-2, top - 0.15, -t - 0.02, 2, top, t + 0.02, c.trim);
    gb.box(-2, 0, -t - 0.02, 2, 0.15, t + 0.02, c.trim);
    for (const yy of mat === 'wood' ? [1, 2] : mat === 'stone' ? [0.75, 1.5, 2.25] : []) {
      if (yy >= top) continue;
      for (const [x0, x1, y0, y1] of wallSolids(variant)) {
        if (yy > y0 && yy < y1) gb.box(x0, yy - 0.03, -t - 0.01, x1, yy + 0.03, t + 0.01, c.line);
      }
    }
    if (mat === 'metal') for (const xx of [-1, 0, 1]) {
      for (const [x0, x1, y0, y1] of wallSolids(variant)) {
        if (xx > x0 && xx < x1) gb.box(xx - 0.04, y0, -t - 0.01, xx + 0.04, y1, t + 0.01, c.line);
      }
    }
  } else if (type === 'floor') {
    gb.box(-2, -t, -2, 2, t, 2, c.panel, false);
    gb.box(-2, t, -2, 2, t + 0.03, -1.85, c.trim);
    gb.box(-2, t, 1.85, 2, t + 0.03, 2, c.trim);
    gb.box(-2, t, -1.85, -1.85, t + 0.03, 1.85, c.trim);
    gb.box(1.85, t, -1.85, 2, t + 0.03, 1.85, c.trim);
    if (mat !== 'metal') for (const zz of [-1, 0, 1]) gb.box(-1.85, t, zz - 0.03, 1.85, t + 0.02, zz + 0.03, c.line);
  } else if (type === 'ramp') {
    // Rises toward local -Z: low edge at z=+2 (y=0), high edge at z=-2 (y=3).
    const th = 0.25;
    const top = [[-2, 0, 2], [2, 0, 2], [2, H, -2], [-2, H, -2]];
    const bot = top.map(([x, y, z]) => [x, y - th, z]);
    const col = gb.rgb(c.panel), tr = gb.rgb(c.trim);
    const cx = 0, cy = H / 2 - 0.1, cz = 0;
    gb.triOut(top[0], top[1], top[2], col, cx, cy - 1, cz);
    gb.triOut(top[0], top[2], top[3], col, cx, cy - 1, cz);
    gb.triOut(bot[0], bot[1], bot[2], col, cx, cy + 1, cz);
    gb.triOut(bot[0], bot[2], bot[3], col, cx, cy + 1, cz);
    for (const [a, b] of [[0, 3], [1, 2], [0, 1], [3, 2]]) {
      gb.triOut(top[a], top[b], bot[b], tr, 0, H / 2, 0);
      gb.triOut(top[a], bot[b], bot[a], tr, 0, H / 2, 0);
    }
    for (let i = 1; i < 6; i++) {
      const f = i / 6;
      const z = 2 - 4 * f, y = H * f;
      gb.boxRot(0, y - 0.02, z, 3.8, 0.06, 0.1, 0, tr);
    }
  } else if (type === 'roof') {
    gb.pyramid(-2, -2, 2, 2, 0, 1.6, c.panel);
    gb.box(-2, -0.12, -2, 2, 0.02, 2, c.trim);
  }
  const g = gb.build();
  geoCache.set(key, g);
  return g;
}

export class BuildSystem {
  constructor(game) {
    this.game = game;
    this.W = game.collision;
    this.pieces = new Map();
    this.cellIndex = new Map();
    this.falling = [];
    this.group = new THREE.Group();
    this.group.name = 'builds';
    game.scene.add(this.group);
    this.mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.blueprint = new THREE.MeshLambertMaterial({ color: 0x66c6ff, transparent: true, opacity: 0.55, emissive: 0x1a4a7a, depthWrite: false });
    this.ghostOk = new THREE.MeshBasicMaterial({ color: 0x4fb4ff, transparent: true, opacity: 0.35, depthWrite: false });
    this.ghostBad = new THREE.MeshBasicMaterial({ color: 0xff4a4a, transparent: true, opacity: 0.35, depthWrite: false });
    this.ghost = new THREE.Mesh(pieceGeometry('wall', 'full', 'wood'), this.ghostOk);
    this.ghost.visible = false;
    this.ghost.renderOrder = 5;
    game.scene.add(this.ghost);
  }

  reset() {
    for (const p of [...this.pieces.values()]) this.removePiece(p);
    for (const f of this.falling) this.group.remove(f.mesh);
    this.falling = [];
    this.pieces.clear();
    this.cellIndex.clear();
  }

  // ---------- targeting ----------

  // Vertical offset of the build grid. Pieces snap to 3 m levels measured from the ground
  // where a structure was started, so walls are not buried on sloped terrain.
  gridOffset(actor) {
    const p = actor.pos;
    const cx = Math.floor(p.x / T), cz = Math.floor(p.z / T);
    let best = null, bd = 7;
    for (let ix = cx - 1; ix <= cx + 1; ix++) {
      for (let iz = cz - 1; iz <= cz + 1; iz++) {
        const set = this.cellIndex.get(ix + ',' + iz);
        if (!set) continue;
        for (const q of set) {
          const b = q.box;
          const dy = p.y < b[1] ? b[1] - p.y : p.y > b[4] ? p.y - b[4] : 0;
          const dx = Math.max(b[0] - p.x, 0, p.x - b[3]), dz = Math.max(b[2] - p.z, 0, p.z - b[5]);
          const d = dy * 1.5 + dx + dz;
          if (d < bd) {
            bd = d;
            best = q;
          }
        }
      }
    }
    if (best) return best.yo;
    return Math.round((((p.y % H) + H) % H) * 20) / 20;
  }

  // The build piece the actor is standing on, if any.
  pieceUnder(actor) {
    const p = actor.pos;
    const set = this.cellIndex.get(Math.floor(p.x / T) + ',' + Math.floor(p.z / T));
    if (!set) return null;
    for (const q of set) {
      if (q.type !== 'ramp' && q.type !== 'floor') continue;
      const top = q.type === 'floor' ? q.box[4] : q.colliders[0]?.h(p.x, p.z);
      if (top !== undefined && Math.abs(top - p.y) < 0.45) return q;
    }
    return null;
  }

  // Where would `actor` place their selected piece right now?
  target(actor, type = actor.buildPiece) {
    const p = actor.pos;
    const fx = -Math.sin(actor.yaw), fz = -Math.cos(actor.yaw);
    const dir = Math.abs(fx) > Math.abs(fz) ? (fx > 0 ? 1 : 3) : fz > 0 ? 2 : 0;
    const [dx, dz] = DIRS[dir];
    const cx = Math.floor(p.x / T), cz = Math.floor(p.z / T);
    const yo = this.gridOffset(actor);
    const feetLevel = Math.floor((p.y - yo + 0.5) / H);
    const pitch = actor.pitch;
    let t;
    if (type === 'wall') {
      const level = feetLevel + (pitch > 0.5 ? 1 : 0);
      if (dir === 1) t = { type, axis: 'x', ix: cx + 1, iz: cz, iy: level };
      else if (dir === 3) t = { type, axis: 'x', ix: cx, iz: cz, iy: level };
      else if (dir === 2) t = { type, axis: 'z', ix: cx, iz: cz + 1, iy: level };
      else t = { type, axis: 'z', ix: cx, iz: cz, iy: level };
    } else if (type === 'floor') {
      const under = pitch < -0.6;
      const level = feetLevel + (pitch > 0.35 ? 1 : 0);
      t = { type, ix: under ? cx : cx + dx, iz: under ? cz : cz + dz, iy: level };
    } else if (type === 'ramp') {
      // Standing on a ramp that points the same way: continue it one level up.
      const on = this.pieceUnder(actor);
      let level = feetLevel;
      if (on && on.type === 'ramp' && on.dir === dir) level = on.iy + 1;
      else if (on) level = on.iy;
      if (pitch > 0.9) level += 1;
      t = { type, ix: cx + dx, iz: cz + dz, iy: level, dir };
    } else {
      const level = pitch < -0.4 ? feetLevel : feetLevel + 1;
      t = { type, ix: cx + dx, iz: cz + dz, iy: level };
    }
    t.yo = yo;
    t.key = this.key(t);
    t.mat = actor.buildMat;
    return t;
  }

  key(t) {
    const o = Math.round(t.yo * 20);
    if (t.type === 'wall') return `w:${t.axis}:${t.ix}:${t.iy}:${t.iz}:${o}`;
    return `${t.type[0]}:${t.ix}:${t.iy}:${t.iz}:${o}`;
  }

  aabb(t) {
    const x0 = t.ix * T, z0 = t.iz * T, y0 = t.iy * H + t.yo;
    if (t.type === 'wall') {
      if (t.axis === 'x') return [x0 - WALL_T / 2, y0, z0, x0 + WALL_T / 2, y0 + H, z0 + T];
      return [x0, y0, z0 - WALL_T / 2, x0 + T, y0 + H, z0 + WALL_T / 2];
    }
    if (t.type === 'floor') return [x0, y0 - WALL_T / 2, z0, x0 + T, y0 + WALL_T / 2, z0 + T];
    if (t.type === 'ramp') return [x0, y0 - 0.25, z0, x0 + T, y0 + H, z0 + T];
    return [x0, y0 - 0.12, z0, x0 + T, y0 + 1.6, z0 + T];
  }

  isGrounded(t, box) {
    const [x0, y0, z0, x1, , z1] = box;
    const terrain = this.game.terrain;
    let maxT = -Infinity;
    for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5], [0.5, 0], [0.5, 1], [0, 0.5], [1, 0.5]]) {
      maxT = Math.max(maxT, terrain.heightAt(x0 + (x1 - x0) * u, z0 + (z1 - z0) * v));
    }
    if (y0 <= maxT + 0.35) return true;
    // Resting on (or touching) static world geometry also counts.
    return this.W.overlapsBox(x0 - 0.15, y0 - 0.2, z0 - 0.15, x1 + 0.15, y0 + 0.3, z1 + 0.15, (c) => !c.owner);
  }

  neighborsOf(box, exclude) {
    const out = [];
    const [x0, y0, z0, x1, y1, z1] = box;
    const e = 0.12;
    const cx0 = Math.floor((x0 - 1) / T), cx1 = Math.floor((x1 + 1) / T);
    const cz0 = Math.floor((z0 - 1) / T), cz1 = Math.floor((z1 + 1) / T);
    const seen = new Set();
    for (let ix = cx0; ix <= cx1; ix++) {
      for (let iz = cz0; iz <= cz1; iz++) {
        const set = this.cellIndex.get(ix + ',' + iz);
        if (!set) continue;
        for (const p of set) {
          if (p === exclude || seen.has(p) || p.dead) continue;
          seen.add(p);
          const b = p.box;
          if (b[0] - e < x1 && b[3] + e > x0 && b[1] - e < y1 && b[4] + e > y0 && b[2] - e < z1 && b[5] + e > z0) out.push(p);
        }
      }
    }
    return out;
  }

  validate(actor, t) {
    if (this.pieces.has(t.key)) return { ok: false, reason: 'occupied' };
    if (actor.mats[t.mat] < BUILD.cost) {
      if (!actor.autoMaterial()) return { ok: false, reason: 'No materials' };
      t.mat = actor.buildMat;
    }
    if (this.pieces.size >= MAX_PIECES) return { ok: false, reason: 'Build limit reached' };
    const box = this.aabb(t);
    if (box[4] < this.game.terrain.heightAt((box[0] + box[3]) / 2, (box[2] + box[5]) / 2) - 0.2) return { ok: false, reason: 'underground' };
    if (!this.isGrounded(t, box) && this.neighborsOf(box, null).length === 0) return { ok: false, reason: 'No support' };
    return { ok: true, box };
  }

  // ---------- placing ----------

  tryPlace(actor) {
    if (!actor.canAct) return false;
    const t = this.target(actor);
    const v = this.validate(actor, t);
    if (!v.ok) {
      if (!actor.isBot && v.reason === 'No materials') this.game.hud.toast('Not enough materials');
      return false;
    }
    actor.mats[t.mat] -= BUILD.cost;
    this.place(t, actor);
    return true;
  }

  place(t, owner) {
    const piece = {
      kind: 'build', key: t.key, type: t.type, ix: t.ix, iy: t.iy, iz: t.iz, yo: t.yo, axis: t.axis, dir: t.dir ?? 0,
      mat: t.mat, variant: 'full', owner, maxHp: BUILD.hp[t.mat], age: 0,
      buildTotal: BUILD.buildTime[t.mat], colliders: [], dead: false,
    };
    piece.hp = piece.maxHp * BUILD.startHpFrac;
    piece.box = this.aabb(t);
    piece.grounded = this.isGrounded(t, piece.box);
    piece.neighbors = new Set(this.neighborsOf(piece.box, piece));
    for (const n of piece.neighbors) n.neighbors.add(piece);
    piece.mesh = new THREE.Mesh(pieceGeometry(piece.type, piece.variant, piece.mat), this.blueprint);
    piece.mesh.castShadow = true;
    piece.mesh.receiveShadow = true;
    this.positionMesh(piece, piece.mesh);
    this.group.add(piece.mesh);
    this.makeColliders(piece);
    this.pieces.set(piece.key, piece);
    this.indexPiece(piece, true);
    this.game.audio.play('build_' + piece.mat, new THREE.Vector3((piece.box[0] + piece.box[3]) / 2, piece.box[1], (piece.box[2] + piece.box[5]) / 2));
    return piece;
  }

  indexPiece(piece, add) {
    const cx0 = Math.floor(piece.box[0] / T), cx1 = Math.floor((piece.box[3] - 0.01) / T);
    const cz0 = Math.floor(piece.box[2] / T), cz1 = Math.floor((piece.box[5] - 0.01) / T);
    for (let ix = cx0; ix <= cx1; ix++) {
      for (let iz = cz0; iz <= cz1; iz++) {
        const k = ix + ',' + iz;
        let set = this.cellIndex.get(k);
        if (add) {
          if (!set) this.cellIndex.set(k, (set = new Set()));
          set.add(piece);
        } else if (set) {
          set.delete(piece);
          if (!set.size) this.cellIndex.delete(k);
        }
      }
    }
  }

  positionMesh(piece, mesh) {
    const x0 = piece.ix * T, z0 = piece.iz * T, y0 = piece.iy * H + piece.yo;
    mesh.rotation.set(0, 0, 0);
    if (piece.type === 'wall') {
      if (piece.axis === 'x') {
        mesh.position.set(x0, y0, z0 + T / 2);
        mesh.rotation.y = Math.PI / 2;
      } else mesh.position.set(x0 + T / 2, y0, z0);
    } else if (piece.type === 'floor') {
      mesh.position.set(x0 + T / 2, y0, z0 + T / 2);
    } else if (piece.type === 'ramp') {
      mesh.position.set(x0 + T / 2, y0, z0 + T / 2);
      mesh.rotation.y = -piece.dir * (Math.PI / 2);
    } else {
      mesh.position.set(x0 + T / 2, y0, z0 + T / 2);
    }
  }

  makeColliders(piece) {
    for (const c of piece.colliders) this.W.remove(c);
    piece.colliders = [];
    const x0 = piece.ix * T, z0 = piece.iz * T, y0 = piece.iy * H + piece.yo;
    const add = (c) => piece.colliders.push(c);
    if (piece.type === 'wall') {
      for (const [a0, a1, b0, b1] of wallSolids(piece.variant)) {
        if (piece.axis === 'x') add(this.W.box(x0 - WALL_T / 2, y0 + b0, z0 + 2 + a0, x0 + WALL_T / 2, y0 + b1, z0 + 2 + a1, piece));
        else add(this.W.box(x0 + 2 + a0, y0 + b0, z0 - WALL_T / 2, x0 + 2 + a1, y0 + b1, z0 + WALL_T / 2, piece));
      }
    } else if (piece.type === 'floor') {
      add(this.W.box(x0, y0 - WALL_T / 2, z0, x0 + T, y0 + WALL_T / 2, z0 + T, piece));
    } else if (piece.type === 'ramp') {
      const dir = piece.dir;
      const fn = (x, z) => {
        let t;
        if (dir === 0) t = (z0 + T - z) / T;
        else if (dir === 1) t = (x - x0) / T;
        else if (dir === 2) t = (z - z0) / T;
        else t = (x0 + T - x) / T;
        return y0 + clamp(t, 0, 1) * H;
      };
      add(this.W.surface(x0, z0, x0 + T, z0 + T, y0 - 0.3, y0 + H, fn, 0.3, piece));
    } else {
      const fn = (x, z) => y0 + 1.6 * clamp(1 - Math.max(Math.abs(x - x0 - 2), Math.abs(z - z0 - 2)) / 2, 0, 1);
      add(this.W.surface(x0, z0, x0 + T, z0 + T, y0 - 0.12, y0 + 1.6, fn, 0.3, piece));
    }
  }

  // ---------- editing ----------

  editTarget(actor) {
    const o = actor.aimOrigin, d = actor.aimDir;
    const hit = this.W.raycast(o.x, o.y, o.z, d.x, d.y, d.z, 8, null, true);
    const piece = hit?.collider?.owner;
    if (!piece || piece.kind !== 'build' || piece.dead) return false;
    if (piece.owner !== actor) {
      if (!actor.isBot) this.game.hud.toast('You can only edit your own builds');
      return false;
    }
    if (piece.type === 'wall') {
      piece.variant = WALL_VARIANTS[(WALL_VARIANTS.indexOf(piece.variant) + 1) % WALL_VARIANTS.length];
    } else if (piece.type === 'ramp') {
      piece.dir = (piece.dir + 1) % 4;
    } else {
      return false;
    }
    piece.mesh.geometry = pieceGeometry(piece.type, piece.variant, piece.mat);
    this.positionMesh(piece, piece.mesh);
    this.makeColliders(piece);
    if (!actor.isBot) {
      const label = piece.type === 'wall' ? { full: 'Wall', door: 'Door', window: 'Window', half: 'Half wall' }[piece.variant] : 'Ramp rotated';
      this.game.hud.toast('Edit: ' + label);
      this.game.audio.play('edit', actor.pos);
    }
    return true;
  }

  // ---------- damage / destruction ----------

  damage(piece, amount, attacker) {
    if (piece.dead) return;
    piece.hp -= amount;
    piece.flash = 0.12;
    if (piece.hp <= 0) this.destroy(piece);
  }

  removePiece(piece) {
    piece.dead = true;
    for (const c of piece.colliders) this.W.remove(c);
    piece.colliders = [];
    this.group.remove(piece.mesh);
    this.pieces.delete(piece.key);
    this.indexPiece(piece, false);
    for (const n of piece.neighbors) n.neighbors.delete(piece);
  }

  destroy(piece) {
    if (piece.dead) return;
    const neighbors = [...piece.neighbors];
    this.removePiece(piece);
    this.game.fx.debris(piece.box, MAT_COLORS[piece.mat].panel);
    this.game.audio.play('break', new THREE.Vector3((piece.box[0] + piece.box[3]) / 2, piece.box[1] + 1, (piece.box[2] + piece.box[5]) / 2));
    // Anything no longer connected to the ground collapses.
    const supported = new Set();
    for (const n of neighbors) {
      if (n.dead || supported.has(n)) continue;
      const comp = [];
      const seen = new Set([n]);
      const queue = [n];
      let grounded = false;
      while (queue.length && comp.length < 3000) {
        const p = queue.shift();
        comp.push(p);
        if (p.grounded) {
          grounded = true;
          break;
        }
        for (const q of p.neighbors) {
          if (!seen.has(q) && !q.dead) {
            seen.add(q);
            queue.push(q);
          }
        }
      }
      if (grounded) {
        for (const p of seen) supported.add(p);
        continue;
      }
      for (const p of comp) this.collapse(p);
    }
  }

  collapse(piece) {
    if (piece.dead) return;
    this.removePiece(piece);
    this.group.add(piece.mesh);
    piece.mesh.material = this.blueprint;
    this.falling.push({ mesh: piece.mesh, vy: 0, t: 0, box: piece.box, mat: piece.mat });
  }

  update(dt) {
    for (const p of this.pieces.values()) {
      p.age += dt;
      if (p.hp < p.maxHp && p.age < p.buildTotal) {
        p.hp = Math.min(p.maxHp, p.hp + ((p.maxHp * (1 - BUILD.startHpFrac)) / p.buildTotal) * dt);
      }
      if (p.mesh.material === this.blueprint && p.age > 0.3) p.mesh.material = this.mat;
    }
    for (let i = this.falling.length - 1; i >= 0; i--) {
      const f = this.falling[i];
      f.t += dt;
      f.vy -= 18 * dt;
      f.mesh.position.y += f.vy * dt;
      f.mesh.rotation.x += dt * 0.6;
      if (f.t > 0.9) {
        this.group.remove(f.mesh);
        this.game.fx.debris(f.box, MAT_COLORS[f.mat].panel, f.mesh.position.y - f.box[1]);
        this.falling.splice(i, 1);
      }
    }
  }

  // Ghost preview for the human player.
  updateGhost(actor) {
    if (!actor || !actor.buildMode || !actor.canAct) {
      this.ghost.visible = false;
      return null;
    }
    const t = this.target(actor);
    const v = this.validate(actor, t);
    const g = pieceGeometry(t.type, 'full', t.mat);
    if (this.ghost.geometry !== g) this.ghost.geometry = g;
    const fake = { type: t.type, ix: t.ix, iy: t.iy, iz: t.iz, yo: t.yo, axis: t.axis, dir: t.dir ?? 0 };
    this.positionMesh(fake, this.ghost);
    this.ghost.material = v.ok ? this.ghostOk : this.ghostBad;
    this.ghost.visible = true;
    return { target: t, ok: v.ok, reason: v.reason };
  }
}
