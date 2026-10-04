import * as THREE from 'three';
import { LOOT, WEAPONS, RARITY, AMMO_PICKUP } from './config.js';
import { itemModel, itemName, makeAmmo, makeMat, randomWeapon, randomHeal, makeHeal } from './items.js';
import { GeoBuilder } from './world/geobuilder.js';
import { makeGlowTexture } from './world/structures.js';
import { clamp } from './util.js';

const beamGeo = new THREE.CylinderGeometry(0.06, 0.22, 2.6, 6, 1, true);
beamGeo.translate(0, 1.3, 0);
const beamMats = RARITY.map((r) => new THREE.MeshBasicMaterial({ color: r.color, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));

let chestGeo = null, lidGeo = null;
function chestGeometries() {
  if (chestGeo) return;
  const gb = new GeoBuilder();
  gb.jitter = 0;
  gb.box(-0.55, 0, -0.35, 0.55, 0.5, 0.35, '#8a5a2b');
  gb.box(-0.57, 0.0, -0.37, 0.57, 0.08, 0.37, '#e0b030');
  gb.box(-0.57, 0.42, -0.37, 0.57, 0.5, 0.37, '#e0b030');
  gb.box(-0.6, 0, -0.1, -0.5, 0.5, 0.1, '#e0b030');
  gb.box(0.5, 0, -0.1, 0.6, 0.5, 0.1, '#e0b030');
  chestGeo = gb.build();
  const lb = new GeoBuilder();
  lb.jitter = 0;
  // Lid pivots at its back edge (z = +0.35).
  lb.box(-0.55, 0, -0.7, 0.55, 0.22, 0, '#9a6630');
  lb.box(-0.57, 0.15, -0.72, 0.57, 0.24, 0.02, '#f0c040');
  lb.box(-0.08, -0.12, -0.74, 0.08, 0.1, -0.68, '#f6d870');
  lidGeo = lb.build();
}

let crateGeo = null, balloonGeo = null;
function supplyGeometries() {
  if (crateGeo) return;
  const gb = new GeoBuilder();
  gb.jitter = 0;
  gb.box(-0.9, 0, -0.9, 0.9, 1.4, 0.9, '#2f6dd0');
  gb.box(-0.95, 0, -0.95, 0.95, 0.15, 0.95, '#f0c040');
  gb.box(-0.95, 1.25, -0.95, 0.95, 1.42, 0.95, '#f0c040');
  for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) gb.box(x - 0.08, 0, z - 0.08, x + 0.08, 1.42, z + 0.08, '#f0c040');
  crateGeo = gb.build();
  const bb = new GeoBuilder();
  bb.jitter = 0;
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2;
    const col = bb.rgb(i % 2 ? '#ffffff' : '#2f6dd0');
    for (let j = 0; j < 6; j++) {
      const t0 = (j / 6) * Math.PI, t1 = ((j + 1) / 6) * Math.PI;
      const P = (t, a) => [Math.sin(t) * Math.cos(a) * 2.6, Math.cos(t) * 3 + 6, Math.sin(t) * Math.sin(a) * 2.6];
      bb.triOut(P(t0, a0), P(t1, a0), P(t1, a1), col, 0, 6, 0);
      if (j > 0) bb.triOut(P(t0, a0), P(t1, a1), P(t0, a1), col, 0, 6, 0);
    }
  }
  for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) bb.boxRot(x * 1.2, 1.4, z * 1.2, 0.04, 2.4, 0.04, 0, '#dddddd');
  balloonGeo = bb.build();
}

const vmat = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.1 });

export class LootSystem {
  constructor(game) {
    this.game = game;
    this.items = [];
    this.chests = [];
    this.drops = [];
    this.group = new THREE.Group();
    this.group.name = 'loot';
    game.scene.add(this.group);
    this.mat = vmat();
    this.glowTex = makeGlowTexture();
    this.supplyTimer = LOOT.supplyFirst;
    this.cueTimer = 0;
    this.pickTimer = 0;
  }

  reset() {
    for (const it of this.items) this.group.remove(it.obj);
    for (const c of this.chests) this.group.remove(c.obj);
    for (const d of this.drops) this.removeDrop(d);
    this.items = [];
    this.chests = [];
    this.drops = [];
    this.supplyTimer = LOOT.supplyFirst;
  }

  // ---------- spawning ----------

  spawnAll(structures, rng) {
    chestGeometries();
    const chance = { high: 0.92, medium: 0.78, low: 0.62 };
    for (const s of structures.lootSpots) {
      const q = s.poi.loot || 'low';
      if (rng() > chance[q] + (s.high ? 0.1 : 0)) continue;
      const roll = rng();
      const p = new THREE.Vector3(s.x, s.y, s.z);
      if (roll < 0.55) {
        const w = randomWeapon(rng, s.high ? 'high' : q);
        this.addItem(w, p, null, true);
        const ammoType = WEAPONS[w.type].ammo;
        this.addItem(makeAmmo(ammoType), p.clone().add(new THREE.Vector3(0.6, 0, 0.3)), null, true);
      } else if (roll < 0.8) {
        this.addItem(randomHeal(rng), p, null, true);
      } else {
        const types = Object.keys(AMMO_PICKUP);
        this.addItem(makeAmmo(types[rng.weighted([30, 30, 12, 18, 6])]), p, null, true);
      }
    }
    for (const c of structures.chestSpots) this.addChest(c, rng);
  }

  addChest(spot, rng) {
    const obj = new THREE.Group();
    const base = new THREE.Mesh(chestGeo, this.mat);
    base.castShadow = true;
    const lid = new THREE.Group();
    lid.position.set(0, 0.5, 0.35);
    lid.add(new THREE.Mesh(lidGeo, this.mat));
    obj.add(base, lid);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffcc44, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(2.2, 1.4, 1);
    glow.position.y = 0.4;
    obj.add(glow);
    obj.position.set(spot.x, spot.y, spot.z);
    obj.rotation.y = spot.yaw;
    this.group.add(obj);
    this.chests.push({ pos: obj.position, obj, lid, glow, opened: false, spot, quality: spot.poi.loot === 'high' ? 'chest' : 'high', open: 0 });
  }

  addItem(item, pos, vel = null, settled = false) {
    const obj = new THREE.Group();
    const model = itemModel(item);
    obj.add(model);
    const beam = new THREE.Mesh(beamGeo, beamMats[item.rarity || 0]);
    if (item.kind === 'weapon' || item.kind === 'heal') obj.add(beam);
    obj.position.copy(pos);
    this.group.add(obj);
    const it = { item, obj, model, pos: obj.position, vel: vel ? vel.clone() : new THREE.Vector3(), settled, spin: Math.random() * 6, born: this.game.time };
    this.items.push(it);
    return it;
  }

  removeItem(it) {
    const i = this.items.indexOf(it);
    if (i >= 0) this.items.splice(i, 1);
    this.group.remove(it.obj);
  }

  // Toss an item out from a position with a little arc. `facing` limits it to a forward fan.
  toss(item, pos, i = 0, n = 1, facing = null) {
    let a = (i / Math.max(1, n)) * Math.PI * 2 + Math.random() * 0.5;
    if (facing !== null) {
      const fwd = Math.atan2(-Math.cos(facing), -Math.sin(facing));
      a = fwd + ((n > 1 ? i / (n - 1) : 0.5) - 0.5) * 2.1;
    }
    const v = new THREE.Vector3(Math.cos(a) * 2.2, 4.5, Math.sin(a) * 2.2);
    return this.addItem(item, pos.clone().add(new THREE.Vector3(0, 0.8, 0)), v, false);
  }

  dropAll(actor) {
    const list = [];
    for (const s of actor.slots) if (s) list.push(s);
    for (const [t, n] of Object.entries(actor.ammo)) if (n > 0) list.push(makeAmmo(t, n));
    for (const [t, n] of Object.entries(actor.mats)) if (n > 0) list.push(makeMat(t, n));
    list.forEach((it, i) => this.toss(it, actor.pos, i, list.length));
  }

  openChest(chest, actor) {
    if (chest.opened) return;
    chest.opened = true;
    chest.glow.visible = false;
    const rng = this.game.rng;
    const w = randomWeapon(rng, chest.quality);
    const loot = [w, makeAmmo(WEAPONS[w.type].ammo), randomHeal(rng), makeMat('wood', 30)];
    if (rng() < 0.4) loot.push(makeAmmo(rng.pick(['light', 'medium', 'shells'])));
    const p = chest.pos.clone();
    loot.forEach((it, i) => this.toss(it, p, i, loot.length, chest.obj.rotation.y));
    if (!actor.isBot || this.game.isNearPlayer(p, 30)) this.game.audio.play('chestOpen', p);
  }

  // ---------- supply drops ----------

  spawnSupplyDrop() {
    supplyGeometries();
    const storm = this.game.storm;
    const T = this.game.terrain;
    const c = storm.next || storm.current;
    let x = 0, z = 0;
    for (let tries = 0; tries < 60; tries++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * c.r * 0.8;
      x = c.x + Math.cos(a) * r;
      z = c.z + Math.sin(a) * r;
      if (T.heightAt(x, z) > 1.5 && Math.hypot(x, z) < 430) break;
    }
    const ground = this.game.collision.groundAt(x, z, 400);
    const obj = new THREE.Group();
    const crate = new THREE.Mesh(crateGeo, this.mat);
    crate.castShadow = true;
    const balloon = new THREE.Mesh(balloonGeo, this.mat);
    obj.add(crate, balloon);
    obj.position.set(x, ground + 160, z);
    this.group.add(obj);
    // Flare: a bright sprite that shoots up and hangs in the sky, plus a smoke column.
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xff3a2a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    flare.scale.setScalar(14);
    flare.position.set(x, ground + 2, z);
    this.game.scene.add(flare);
    const columnGeo = new THREE.CylinderGeometry(0.6, 1.4, 220, 8, 1, true);
    columnGeo.translate(0, 110, 0);
    const column = new THREE.Mesh(columnGeo, new THREE.MeshBasicMaterial({ color: 0xff5a3a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    column.position.set(x, ground, z);
    this.game.scene.add(column);
    const drop = { obj, crate, balloon, flare, column, pos: obj.position, ground, landed: false, opened: false, t: 0 };
    this.drops.push(drop);
    this.game.hud.banner('Supply drop incoming!', '#4aa8ff');
    this.game.audio.play('flare', null);
    return drop;
  }

  removeDrop(d) {
    this.group.remove(d.obj);
    this.game.scene.remove(d.flare);
    this.game.scene.remove(d.column);
  }

  openDrop(d, actor) {
    if (d.opened || !d.landed) return;
    d.opened = true;
    const rng = this.game.rng;
    const w = randomWeapon(rng, 'supply');
    const loot = [w, makeAmmo(WEAPONS[w.type].ammo, AMMO_PICKUP[WEAPONS[w.type].ammo] * 2), makeHeal(rng.chance(0.5) ? 'big' : 'medkit'), makeMat('wood', 100), makeMat('stone', 100), makeMat('metal', 100)];
    loot.forEach((it, i) => this.toss(it, d.pos, i, loot.length));
    this.game.audio.play('chestOpen', d.pos);
    this.group.remove(d.obj);
    this.game.scene.remove(d.column);
    d.removed = true;
  }

  // ---------- interaction ----------

  nearestInteractable(actor) {
    const p = actor.pos;
    let best = null, bestScore = Infinity;
    const fwd = actor.forward();
    const consider = (kind, ref, pos, range, label) => {
      const dx = pos.x - p.x, dz = pos.z - p.z, dy = pos.y - p.y;
      const d = Math.hypot(dx, dz);
      if (d > range || Math.abs(dy) > 2.2) return;
      const facing = d > 0.01 ? (dx * fwd.x + dz * fwd.z) / d : 1;
      const score = d - facing * 0.8;
      if (score < bestScore) {
        bestScore = score;
        best = { kind, ref, label, dist: d };
      }
    };
    for (const c of this.chests) if (!c.opened) consider('chest', c, c.pos, 2.4, 'Open Chest');
    for (const d of this.drops) if (d.landed && !d.opened) consider('drop', d, d.pos, 2.8, 'Open Supply Drop');
    for (const it of this.items) {
      if (it.item.kind !== 'weapon' && it.item.kind !== 'heal') continue;
      consider('item', it, it.pos, 2.0, 'Pick up ' + itemName(it.item));
    }
    return best;
  }

  pickup(actor, it) {
    const res = actor.receive(it.item);
    if (!res.taken) {
      if (!actor.isBot) this.game.hud.toast('Inventory full - select a slot to swap');
      return false;
    }
    this.removeItem(it);
    if (res.leftover) this.addItem(res.leftover, it.pos.clone(), null, true);
    if (res.dropped) this.toss(res.dropped, actor.pos, 0, 1);
    if (!actor.isBot) this.game.audio.play('pickup', actor.pos);
    return true;
  }

  // ---------- update ----------

  update(dt) {
    const game = this.game;
    const W = game.collision;
    const t = game.time;
    const player = game.player;
    const camPos = game.camera.position;
    for (const it of this.items) {
      if (!it.settled) {
        it.vel.y -= 18 * dt;
        // Stop sliding sideways into walls.
        const nx = it.pos.x + it.vel.x * dt, nz = it.pos.z + it.vel.z * dt;
        if (W.overlapsBox(nx - 0.15, it.pos.y + 0.05, nz - 0.15, nx + 0.15, it.pos.y + 0.4, nz + 0.15)) {
          it.vel.x = 0;
          it.vel.z = 0;
        }
        it.pos.addScaledVector(it.vel, dt);
        const g = Math.max(W.groundAt(it.pos.x, it.pos.z, it.pos.y + 0.5), -1.2);
        if (it.pos.y <= g + 0.05) {
          it.pos.y = g + 0.05;
          it.vel.set(0, 0, 0);
          it.settled = true;
        }
      }
      const near = Math.abs(it.pos.x - camPos.x) + Math.abs(it.pos.z - camPos.z) < 220;
      it.obj.visible = near;
      if (near) {
        it.model.rotation.y = t * 1.2 + it.spin;
        it.model.position.y = 0.15 + Math.sin(t * 2 + it.spin) * 0.06;
      }
    }
    for (const c of this.chests) {
      if (c.opened && c.open < 1) {
        c.open = Math.min(1, c.open + dt * 4);
        c.lid.rotation.x = -c.open * 1.9;
      }
      if (!c.opened) c.glow.material.opacity = 0.45 + Math.sin(t * 4 + c.pos.x) * 0.2;
    }
    // Chest shimmer cue for the human player.
    this.cueTimer -= dt;
    if (this.cueTimer <= 0 && player && player.alive && player.mode === 'ground') {
      this.cueTimer = 1.4;
      let best = null, bd = LOOT.chestCueRange;
      for (const c of this.chests) {
        if (c.opened) continue;
        const d = c.pos.distanceTo(player.pos);
        if (d < bd) {
          bd = d;
          best = c;
        }
      }
      if (best) game.audio.play('chestCue', best.pos, clamp(1 - bd / LOOT.chestCueRange, 0.1, 1));
    }
    // Auto pick-up of ammo and materials.
    this.pickTimer -= dt;
    if (this.pickTimer <= 0) {
      this.pickTimer = 0.12;
      for (const a of game.actors) {
        if (!a.alive || (a.mode !== 'ground' && a.mode !== 'swim')) continue;
        for (let i = this.items.length - 1; i >= 0; i--) {
          const it = this.items[i];
          if (it.item.kind !== 'ammo' && it.item.kind !== 'mat') continue;
          if (!it.settled && t - it.born < 0.6) continue;
          if (Math.abs(it.pos.x - a.pos.x) > 1.5 || Math.abs(it.pos.z - a.pos.z) > 1.5 || Math.abs(it.pos.y - a.pos.y) > 2) continue;
          const before = it.item.count;
          a.receive(it.item);
          if (it.item.count <= 0) this.removeItem(it);
          if (it.item.count < before && !a.isBot) game.audio.play('pickupSmall', a.pos);
        }
      }
    }
    // Supply drops
    if (game.phase === 'playing') {
      this.supplyTimer -= dt;
      if (this.supplyTimer <= 0 && game.storm.phaseIndex < 6) {
        this.supplyTimer = LOOT.supplyMin + Math.random() * (LOOT.supplyMax - LOOT.supplyMin);
        this.spawnSupplyDrop();
      }
    }
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.t += dt;
      if (!d.landed) {
        d.pos.y -= LOOT.supplyFall * dt;
        d.obj.rotation.y += dt * 0.3;
        if (d.pos.y <= d.ground) {
          d.pos.y = d.ground;
          d.landed = true;
          d.balloon.visible = false;
        }
      }
      // flare rises then drifts down slowly
      const f = d.flare;
      const peak = d.ground + 140;
      if (d.t < 2) f.position.y = d.ground + (peak - d.ground) * (d.t / 2);
      else f.position.y = Math.max(d.ground + 20, peak - (d.t - 2) * 2);
      f.material.opacity = 0.7 + Math.sin(d.t * 12) * 0.3;
      if (d.opened && d.t > 0 && !d.flareGone) {
        d.flareGone = true;
        this.game.scene.remove(d.flare);
      }
      if (d.removed) this.drops.splice(i, 1);
    }
  }
}
