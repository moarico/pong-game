import * as THREE from 'three';
import { LOOT, WEAPONS, RARITY, AMMO_PICKUP } from './config.js';
import { itemModel, itemName, makeAmmo, makeMat, randomWeapon, randomHeal, makeHeal } from './items.js';
import { chestParts, supplyParts, modelMaterial } from './zh/models.js';
import { makeGlowTexture } from './world/structures.js';
import { clamp } from './util.js';

// Floor loot effects share one texture: the left half is a soft round glow for the ground, the right half a
// vertical fade for the light beam. Each rarity gets its own beam height and color.
let fxTex = null;
function lootFxTexture() {
  if (fxTex) return fxTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,0.95)');
  r.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const v = g.createLinearGradient(0, 64, 0, 0);
  v.addColorStop(0, 'rgba(255,255,255,0.9)');
  v.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  v.addColorStop(1, 'rgba(255,255,255,0)');
  // soft sides on the beam
  for (let x = 64; x < 128; x++) {
    const k = Math.sin(((x - 64) / 63) * Math.PI);
    g.globalAlpha = k * k;
    g.fillStyle = v;
    g.fillRect(x, 0, 1, 64);
  }
  fxTex = new THREE.CanvasTexture(c);
  fxTex.colorSpace = THREE.SRGBColorSpace;
  return fxTex;
}
const BEAM_H = [1.4, 2.1, 2.8, 3.8, 5.2];
const fxGeos = [];
function lootFxGeometry(rarity) {
  if (fxGeos[rarity]) return fxGeos[rarity];
  const P = [], U = [];
  const quad = (a, b, c, d, ua, ub, uc, ud) => {
    P.push(...a, ...b, ...c, ...a, ...c, ...d);
    U.push(...ua, ...ub, ...uc, ...ua, ...uc, ...ud);
  };
  // ground glow
  const R = 0.75 + rarity * 0.12;
  quad([-R, 0.03, -R], [R, 0.03, -R], [R, 0.03, R], [-R, 0.03, R], [0, 0], [0.5, 0], [0.5, 1], [0, 1]);
  // two crossed beam planes
  const h = BEAM_H[rarity], w = 0.16 + rarity * 0.03;
  for (const [dx, dz] of [[w, 0], [0, w]]) quad([-dx, 0, -dz], [dx, 0, dz], [dx, h, dz], [-dx, h, -dz], [0.5, 0], [1, 0], [1, 1], [0.5, 1]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.computeBoundingSphere();
  fxGeos[rarity] = g;
  return g;
}
let fxMats = null;
function lootFxMaterials() {
  if (!fxMats) {
    fxMats = RARITY.map((r, i) => new THREE.MeshBasicMaterial({
      map: lootFxTexture(), color: new THREE.Color(r.color).multiplyScalar(i >= 3 ? 1.6 : 1.1), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    }));
  }
  return fxMats;
}

// Sparkle sprite for chests and the best floor loot.
let starTex = null;
function sparkleTexture() {
  if (starTex) return starTex;
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.25, 'rgba(255,255,255,0.5)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(15, 2, 2, 28);
  g.fillRect(2, 15, 28, 2);
  starTex = new THREE.CanvasTexture(c);
  starTex.colorSpace = THREE.SRGBColorSpace;
  return starTex;
}

let chestGeo = null, lidGeo = null;
function chestGeometries() {
  if (chestGeo) return;
  const c = chestParts();
  chestGeo = c.base;
  lidGeo = c.lid;
}

let crateGeo = null, balloonGeo = null, linesGeo = null;
function supplyGeometries() {
  if (crateGeo) return;
  const c = supplyParts();
  crateGeo = c.crate;
  balloonGeo = c.balloon;
  linesGeo = c.lines;
}

const vmat = () => modelMaterial();

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
    // Closed chests: the gold trim glows and pulses (gold picked out by its color), which the camera blooms.
    this.chestGlow = { value: 1 };
    this.chestMat = modelMaterial();
    const base = this.chestMat.onBeforeCompile, glow = this.chestGlow;
    this.chestMat.onBeforeCompile = (sh) => {
      base(sh);
      sh.uniforms.uGoldGlow = glow;
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uGoldGlow;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_COLOR\ntotalEmissiveRadiance += vColor.rgb * smoothstep( 0.25, 0.45, vColor.r - vColor.b ) * uGoldGlow;\n#endif');
    };
    this.chestMat.customProgramCacheKey = () => 'chest-gold';
    // sparkles drifting around nearby chests and the best floor loot
    const N = 256;
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    sg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    sg.setDrawRange(0, 0);
    this.sparkles = new THREE.Points(sg, new THREE.PointsMaterial({
      map: sparkleTexture(), size: 0.22, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    }));
    this.sparkles.frustumCulled = false;
    this.sparkles.renderOrder = 4;
    this.group.add(this.sparkles);
    this.sparkleMax = N;
    this.bursts = [];
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
    const base = new THREE.Mesh(chestGeo, this.chestMat);
    base.castShadow = true;
    const lid = new THREE.Group();
    lid.position.set(0, 0.5, 0.35);
    const lidMesh = new THREE.Mesh(lidGeo, this.chestMat);
    lid.add(lidMesh);
    obj.add(base, lid);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc23a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(3.2, 2.2, 1);
    glow.position.y = 0.45;
    obj.add(glow);
    obj.position.set(spot.x, spot.y, spot.z);
    obj.rotation.y = spot.yaw;
    this.group.add(obj);
    this.chests.push({ pos: obj.position, obj, base, lid, lidMesh, glow, opened: false, spot, quality: spot.poi.loot === 'high' ? 'chest' : 'high', open: 0, seed: Math.random() * 100 });
  }

  addItem(item, pos, vel = null, settled = false) {
    const obj = new THREE.Group();
    const model = itemModel(item);
    obj.add(model);
    let fx = null;
    if (item.kind === 'weapon' || item.kind === 'heal') {
      fx = new THREE.Mesh(lootFxGeometry(item.rarity || 0), lootFxMaterials()[item.rarity || 0]);
      fx.renderOrder = 3;
      obj.add(fx);
    }
    obj.position.copy(pos);
    this.group.add(obj);
    const it = { item, obj, model, fx, pos: obj.position, vel: vel ? vel.clone() : new THREE.Vector3(), settled, spin: Math.random() * 6, born: this.game.time };
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
    chest.base.material = this.mat;
    chest.lidMesh.material = this.mat;
    this.burst(chest.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), 0xffd060);
    const rng = this.game.rng;
    const w = randomWeapon(rng, chest.quality);
    const loot = [w, makeAmmo(WEAPONS[w.type].ammo), randomHeal(rng), makeMat('wood', 30)];
    if (rng() < 0.4) loot.push(makeAmmo(rng.pick(['light', 'medium', 'shells'])));
    const p = chest.pos.clone();
    loot.forEach((it, i) => this.toss(it, p, i, loot.length, chest.obj.rotation.y));
    if (!actor.isBot || this.game.isNearPlayer(p, 30)) this.game.audio.play('chestOpen', p);
  }

  // A flash of light where a chest or supply drop bursts open.
  burst(pos, color) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color(color).multiplyScalar(3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    sprite.position.copy(pos);
    this.group.add(sprite);
    this.bursts.push({ sprite, t: 0 });
  }

  // Sparkles: a few motes rising around each closed chest near the camera, and around epic and legendary loot.
  updateSparkles(t, cam) {
    const pos = this.sparkles.geometry.attributes.position, col = this.sparkles.geometry.attributes.color;
    let n = 0;
    const emit = (x, y, z, r, g, b, count, seed, radius, height) => {
      for (let i = 0; i < count && n < this.sparkleMax; i++) {
        const h = (seed * 13.37 + i * 7.91) % 1;
        const ph = (t * 0.32 + i / count + h) % 1;
        const a = h * 6.283 + t * 0.6 + i;
        const rr = radius * (0.6 + 0.4 * Math.sin(h * 40 + t));
        pos.setXYZ(n, x + Math.cos(a) * rr, y + 0.1 + ph * height, z + Math.sin(a) * rr);
        const f = Math.sin(ph * Math.PI) * (0.6 + 0.4 * Math.sin(t * 9 + i * 3));
        col.setXYZ(n, r * f, g * f, b * f);
        n++;
      }
    };
    for (const c of this.chests) {
      if (c.opened || Math.abs(c.pos.x - cam.x) + Math.abs(c.pos.z - cam.z) > 40) continue;
      emit(c.pos.x, c.pos.y, c.pos.z, 3, 2.3, 0.8, 10, c.seed, 0.75, 1.5);
    }
    for (const it of this.items) {
      const r = it.item.rarity || 0;
      if (r < 3 || !it.settled || Math.abs(it.pos.x - cam.x) + Math.abs(it.pos.z - cam.z) > 30) continue;
      const c = r === 4 ? [3, 2, 0.5] : [2, 0.9, 3];
      emit(it.pos.x, it.pos.y, it.pos.z, c[0], c[1], c[2], 6, it.spin, 0.5, 1.2);
    }
    this.sparkles.geometry.setDrawRange(0, n);
    pos.needsUpdate = true;
    col.needsUpdate = true;
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
    const balloon = new THREE.Mesh(balloonGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, side: THREE.DoubleSide }));
    balloon.castShadow = true;
    obj.add(crate, balloon, new THREE.Mesh(linesGeo, this.mat));
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
    this.burst(d.pos.clone().add(new THREE.Vector3(0, 1, 0)), 0x7ab8ff);
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
      const md = Math.abs(it.pos.x - camPos.x) + Math.abs(it.pos.z - camPos.z);
      const near = md < 200;
      it.obj.visible = near;
      if (near) {
        it.model.rotation.y = t * 0.9 + it.spin;
        it.model.position.y = 0.2 + Math.sin(t * 2 + it.spin) * 0.07;
        if (it.fx) it.fx.visible = md < 140;
      }
    }
    // chest trim shimmer
    this.chestGlow.value = 0.55 + 0.35 * Math.sin(t * 3.2) + 0.15 * Math.sin(t * 7.9);
    for (const c of this.chests) {
      if (c.opened && c.open < 1) {
        // the lid flies open past its stop and settles back
        c.open = Math.min(1, c.open + dt * 3);
        const e = c.open;
        c.lid.rotation.x = -(1.95 * (1 - Math.pow(1 - e, 3)) + Math.sin(e * Math.PI) * 0.35);
      }
      if (!c.opened) c.glow.material.opacity = 0.5 + Math.sin(t * 3.2 + c.seed) * 0.22;
    }
    this.updateSparkles(t, camPos);
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.t += dt;
      const k = b.t / 0.6;
      b.sprite.scale.setScalar(0.6 + k * 4.5);
      b.sprite.material.opacity = Math.max(0, 1 - k);
      if (k >= 1) {
        this.group.remove(b.sprite);
        b.sprite.material.dispose();
        this.bursts.splice(i, 1);
      }
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
