import * as THREE from 'three';
import { WEAPONS, HEALS, AMMO_CAPS, BUILD } from './config.js';
import { POIS } from './world/island.js';
import { angleTo, wrapAngle, clamp, lerp } from './util.js';

const _e = new THREE.Vector3(), _t = new THREE.Vector3(), _d = new THREE.Vector3();

function segHitsRect(ax, az, bx, bz, r) {
  // Liang-Barsky style test of segment vs rectangle [x0,z0,x1,z1]
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dz = bz - az;
  const p = [-dx, dx, -dz, dz];
  const q = [ax - r[0], r[2] - ax, az - r[1], r[3] - az];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-9) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return t1 > 0.001 && t0 < 0.999;
}

export class BotBrain {
  constructor(game, actor, rng, difficulty = 1) {
    this.game = game;
    this.a = actor;
    this.rng = rng;
    actor.brain = this;
    const base = [0.15, 0.45, 0.75][difficulty] ?? 0.45;
    this.skill = clamp(base + (rng() - 0.5) * 0.3, 0.05, 0.95);
    this.reset();
  }

  reset() {
    this.state = 'bus';
    this.target = null;
    this.targetSeenAt = -99;
    this.targetLastPos = new THREE.Vector3();
    this.route = [];
    this.goalTag = null;
    this.thinkT = this.rng() * 0.3;
    this.perceiveT = this.rng() * 0.3;
    this.stuckT = 0;
    this.stuckCount = 0;
    this.lastPos = new THREE.Vector3();
    this.detourT = 0;
    this.detourYaw = 0;
    this.reactT = 0;
    this.strafe = 1;
    this.strafeT = 0;
    this.burstT = 0;
    this.pauseT = 0;
    this.aimErr = new THREE.Vector3();
    this.aimErrT = 0;
    this.buildCd = 0;
    this.lootUntil = 0;
    this.lootTarget = null;
    this.ignore = new Set();
    this.landedAt = 0;
    this.investigate = null;
    this.healCd = 0;
    this.roamGoal = null;
    this.harvestTarget = null;
    this.chooseDrop();
  }

  // ---------- drop planning ----------

  chooseDrop() {
    const rng = this.rng;
    const weights = POIS.map((p) => (p.loot === 'high' ? 3 : p.loot === 'medium' ? 2 : 1.2));
    this.dropPoi = POIS[rng.weighted(weights)];
    const bs = this.game.structures.buildings.filter((b) => b.poi === this.dropPoi);
    if (bs.length) {
      const b = rng.pick(bs);
      this.landTarget = { x: b.door.out[0] + (rng() - 0.5) * 6, z: b.door.out[2] + (rng() - 0.5) * 6 };
    } else this.landTarget = { x: this.dropPoi.x + (rng() - 0.5) * 30, z: this.dropPoi.z + (rng() - 0.5) * 30 };
    this.jumpAt = null;
  }

  planJump() {
    const bus = this.game.bus;
    let p = bus.closestProgress(this.landTarget.x, this.landTarget.z);
    const c = bus.pointAt(p, new THREE.Vector3());
    if (Math.hypot(c.x - this.landTarget.x, c.z - this.landTarget.z) > 330) {
      // Too far from the bus path: pick the closest named area instead.
      let best = null, bd = Infinity;
      for (const poi of POIS) {
        const q = bus.closestProgress(poi.x, poi.z);
        const cp = bus.pointAt(q, new THREE.Vector3());
        const d = Math.hypot(cp.x - poi.x, cp.z - poi.z) + this.rng() * 150;
        if (d < bd) {
          bd = d;
          best = poi;
        }
      }
      this.dropPoi = best;
      this.landTarget = { x: best.x + (this.rng() - 0.5) * 40, z: best.z + (this.rng() - 0.5) * 40 };
      p = bus.closestProgress(this.landTarget.x, this.landTarget.z);
    }
    this.jumpAt = clamp(p - 0.04 + this.rng() * 0.05, 0.03, 0.98);
  }

  // ---------- events ----------

  onDamaged(attacker) {
    if (!attacker || !attacker.alive || attacker === this.a) return;
    if (!this.target || this.target === attacker || this.rng() < 0.5) {
      this.target = attacker;
      this.targetSeenAt = this.game.time;
      this.targetLastPos.copy(attacker.pos);
      this.reactT = Math.min(this.reactT, 0.25);
    }
    this.underFire = this.game.time;
    if (this.a.heal) this.a.cancelHeal();
    // Panic wall toward the shooter.
    const a = this.a;
    if (a.mode === 'ground' && this.buildCd <= 0 && this.rng() < this.skill * 0.7) {
      const d = Math.hypot(attacker.pos.x - a.pos.x, attacker.pos.z - a.pos.z);
      if (d > 8 && (a.mats.wood + a.mats.stone + a.mats.metal) >= BUILD.cost) {
        this.buildCd = 2.5 + this.rng() * 2;
        const yaw = a.yaw, pitch = a.pitch;
        a.yaw = angleTo(a.pos.x, a.pos.z, attacker.pos.x, attacker.pos.z);
        a.pitch = 0;
        const piece = a.buildPiece;
        a.buildPiece = 'wall';
        if (!a.autoMaterial()) return;
        this.game.build.tryPlace(a);
        if (this.rng() < this.skill * 0.6) {
          a.buildPiece = 'ramp';
          this.game.build.tryPlace(a);
        }
        a.buildPiece = piece;
        a.yaw = yaw;
        a.pitch = pitch;
      }
    }
  }

  hear(pos) {
    if (this.target || this.state === 'storm') return;
    if (this.rng() < 0.5 + this.skill * 0.3) this.investigate = pos.clone();
  }

  // ---------- helpers ----------

  weapons() {
    return this.a.slots.map((s, i) => [s, i]).filter(([s]) => s && s.kind === 'weapon');
  }

  hasAmmoFor(item) {
    return item.ammo > 0 || this.a.ammo[WEAPONS[item.type].ammo] > 0;
  }

  bestWeaponFor(dist) {
    let best = -1, bs = -Infinity;
    for (const [w, i] of this.weapons()) {
      if (!this.hasAmmoFor(w)) continue;
      const t = w.type;
      let s = w.rarity * 2;
      if (dist < 10) s += { shotgun: 30, smg: 24, ar: 14, pistol: 12, sniper: -10, rocket: -20 }[t];
      else if (dist < 45) s += { ar: 26, smg: 18, pistol: 14, shotgun: 6, sniper: 4, rocket: 10 }[t];
      else s += { sniper: 30, ar: 22, rocket: 8, pistol: 6, smg: 4, shotgun: -20 }[t];
      if (s > bs) {
        bs = s;
        best = i;
      }
    }
    return best;
  }

  currentBuilding() {
    const p = this.a.pos;
    for (const b of this.game.structures.buildings) {
      if (p.x > b.x0 && p.x < b.x1 && p.z > b.z0 && p.z < b.z1 && p.y > b.baseY - 0.6 && p.y < b.roofY + 0.5) return b;
    }
    return null;
  }

  floorOf(b, y) {
    return clamp(Math.round((y - b.baseY) / b.fh), 0, b.stairs.length);
  }

  // Waypoints to a target, threading doors and stairs.
  routeTo(x, y, z, building = null, floor = 0) {
    const route = [];
    const cur = this.currentBuilding();
    const push = (p) => route.push(new THREE.Vector3(p[0], p[1], p[2]));
    let f = cur ? this.floorOf(cur, this.a.pos.y) : 0;
    if (cur && cur !== building) {
      for (; f > 0; f--) {
        const s = cur.stairs[f - 1];
        if (!s) break;
        push(s.top);
        push(s.bottom);
      }
      push(cur.door.in);
      if (cur.door.mid) push(cur.door.mid);
      push(cur.door.out);
    }
    if (building && cur !== building) {
      this.addCorners(route, building, route.length ? route[route.length - 1] : this.a.pos);
      push(building.door.out);
      if (building.door.mid) push(building.door.mid);
      push(building.door.in);
      f = 0;
    }
    if (building) {
      while (f < floor && building.stairs[f]) {
        push(building.stairs[f].bottom);
        push(building.stairs[f].top);
        f++;
      }
      while (f > floor && building.stairs[f - 1]) {
        push(building.stairs[f - 1].top);
        push(building.stairs[f - 1].bottom);
        f--;
      }
    }
    route.push(new THREE.Vector3(x, y, z));
    return route;
  }

  // Walk around a building instead of into its wall on the way to the door.
  addCorners(route, b, from) {
    const pad = 1.6;
    const r = [b.x0 - pad, b.z0 - pad, b.x1 + pad, b.z1 + pad];
    const inner = [b.x0 - 0.3, b.z0 - 0.3, b.x1 + 0.3, b.z1 + 0.3];
    const door = b.door.mid || b.door.out;
    if (!segHitsRect(from.x, from.z, door[0], door[2], inner)) return;
    const corners = [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]];
    let best = null, bd = Infinity;
    for (let i = 0; i < 4; i++) {
      const c = corners[i];
      if (!segHitsRect(from.x, from.z, c[0], c[1], inner) && !segHitsRect(c[0], c[1], door[0], door[2], inner)) {
        const d = Math.hypot(c[0] - from.x, c[1] - from.z) + Math.hypot(door[0] - c[0], door[2] - c[1]);
        if (d < bd) {
          bd = d;
          best = [c];
        }
      }
      for (const j of [(i + 1) % 4, (i + 3) % 4]) {
        const c2 = corners[j];
        if (!segHitsRect(from.x, from.z, c[0], c[1], inner) && !segHitsRect(c2[0], c2[1], door[0], door[2], inner)) {
          const d = Math.hypot(c[0] - from.x, c[1] - from.z) + Math.hypot(c2[0] - c[0], c2[1] - c[1]) + Math.hypot(door[0] - c2[0], door[2] - c2[1]);
          if (d < bd) {
            bd = d;
            best = [c, c2];
          }
        }
      }
    }
    if (best) for (const c of best) route.push(new THREE.Vector3(c[0], b.baseY, c[1]));
  }

  setRoute(route, tag) {
    this.route = route;
    this.goalTag = tag;
    this.stuckT = 0;
    this.stuckCount = 0;
  }

  // Steer along the current route. Returns true when the route is finished.
  followRoute(dt, sprint) {
    const a = this.a, I = a.intent;
    while (this.route.length) {
      const wp = this.route[0];
      const d = Math.hypot(wp.x - a.pos.x, wp.z - a.pos.z);
      const last = this.route.length === 1;
      if (d < (last ? 1.1 : 0.9) && (last || Math.abs(wp.y - a.pos.y) < 2.5)) this.route.shift();
      else break;
    }
    if (!this.route.length) return true;
    const wp = this.route[0];
    let yaw = angleTo(a.pos.x, a.pos.z, wp.x, wp.z);
    if (this.detourT > 0) {
      this.detourT -= dt;
      yaw = this.detourYaw;
    }
    this.turnTo(yaw, dt, 7);
    a.pitch *= 0.9;
    I.mz = 1;
    I.sprint = sprint && Math.hypot(wp.x - a.pos.x, wp.z - a.pos.z) > 6;
    // stuck detection
    this.stuckT += dt;
    if (this.stuckT > 0.6) {
      const moved = Math.hypot(a.pos.x - this.lastPos.x, a.pos.z - this.lastPos.z);
      this.lastPos.copy(a.pos);
      this.stuckT = 0;
      if (moved < 0.5 && a.mode === 'ground') {
        this.stuckCount++;
        I.jump = true;
        if (this.stuckCount >= 2) {
          this.detourT = 0.8 + this.rng() * 0.8;
          this.detourYaw = yaw + (this.rng() < 0.5 ? 1 : -1) * (Math.PI / 2 + this.rng() * 0.6);
        }
        if (this.stuckCount >= 9) {
          this.route = [];
          this.stuckCount = 0;
          if (this.lootTarget) this.ignore.add(this.lootTarget);
          this.lootTarget = null;
          return true;
        }
      } else this.stuckCount = Math.max(0, this.stuckCount - 1);
    }
    return false;
  }

  turnTo(yaw, dt, rate) {
    const a = this.a;
    const diff = wrapAngle(yaw - a.yaw);
    const step = rate * dt;
    a.yaw = wrapAngle(a.yaw + clamp(diff, -step, step));
    return Math.abs(diff);
  }

  // ---------- perception ----------

  perceive() {
    const a = this.a, g = this.game;
    const range = 70 + this.skill * 80;
    const eye = a.eye(_e);
    let best = null, bd = Infinity;
    for (const o of g.actors) {
      if (o === a || !o.alive || o.mode === 'bus') continue;
      const d = o.pos.distanceTo(a.pos);
      if (d > range) continue;
      // Rough field of view: things behind are noticed only up close.
      const toYaw = angleTo(a.pos.x, a.pos.z, o.pos.x, o.pos.z);
      if (Math.abs(wrapAngle(toYaw - a.yaw)) > 1.9 && d > 18 && o !== this.target) continue;
      const score = d - (o === this.target ? 25 : 0);
      if (score >= bd) continue;
      o.center(_t);
      if (!g.collision.los(eye.x, eye.y, eye.z, _t.x, _t.y, _t.z)) {
        if (!(o.mode === 'freefall' || o.mode === 'glide') && !g.collision.los(eye.x, eye.y, eye.z, o.pos.x, o.pos.y + 1.6, o.pos.z)) continue;
      }
      bd = score;
      best = o;
    }
    if (best) {
      if (best !== this.target) this.reactT = lerp(0.8, 0.25, this.skill) + this.rng() * 0.3;
      this.target = best;
      this.targetSeenAt = g.time;
      this.targetLastPos.copy(best.pos);
    } else if (this.target && (!this.target.alive || g.time - this.targetSeenAt > 4)) {
      this.target = null;
    }
  }

  // ---------- main update ----------

  update(dt) {
    const a = this.a, g = this.game, I = a.intent;
    I.fire = false;
    I.firePressed = false;
    I.jump = false;
    I.reload = false;
    I.interact = false;
    I.aim = false;
    I.sprint = false;
    I.mx = 0;
    I.mz = 0;
    I.edit = false;
    I.emote = false;
    I.crouch = false;
    if (!a.alive) return;
    this.buildCd -= dt;
    this.healCd -= dt;
    if (a.mode === 'bus') {
      if (this.jumpAt === null) this.planJump();
      if (g.bus.doorsOpen && g.bus.progress >= this.jumpAt) g.jumpFromBus(a);
      return;
    }
    if (a.mode === 'freefall' || a.mode === 'glide') {
      const d = Math.hypot(this.landTarget.x - a.pos.x, this.landTarget.z - a.pos.z);
      a.yaw = angleTo(a.pos.x, a.pos.z, this.landTarget.x, this.landTarget.z);
      I.mz = d > 4 ? 1 : 0;
      this.landedAt = g.time;
      this.lootUntil = g.time + 70 + this.rng() * 70;
      this.updateAim();
      return;
    }
    if (a.mode === 'vehicle') {
      a.vehicle?.exit();
      return;
    }
    this.perceiveT -= dt;
    if (this.perceiveT <= 0) {
      this.perceiveT = 0.3 + this.rng() * 0.15;
      this.perceive();
    }
    this.thinkT -= dt;
    if (this.thinkT <= 0) {
      this.thinkT = 0.5 + this.rng() * 0.3;
      this.decide();
    }
    if (this.state !== 'harvest') this.harvestAim = null;
    switch (this.state) {
      case 'fight': this.doFight(dt); break;
      case 'heal': this.doHeal(dt); break;
      case 'storm': this.doMove(dt, true); break;
      case 'loot': this.doLoot(dt); break;
      case 'harvest': this.doHarvest(dt); break;
      default: this.doMove(dt, false);
    }
    this.updateAim();
  }

  decide() {
    const a = this.a, g = this.game, storm = g.storm;
    const visibleTarget = this.target && this.target.alive && g.time - this.targetSeenAt < 2.5;
    const hasWeapon = this.weapons().some(([w]) => this.hasAmmoFor(w));
    const outside = storm.distOutside(a.pos.x, a.pos.z) > -5;
    const next = storm.next;
    const outsideNext = next && Math.hypot(a.pos.x - next.x, a.pos.z - next.z) > next.r - 10;
    const urgent = outside || (outsideNext && (storm.stage === 'shrink' || storm.timer < 45));
    const total = a.health + a.shield;
    const healSlot = this.pickHealSlot();
    if (visibleTarget && hasWeapon && !(outside && storm.distOutside(a.pos.x, a.pos.z) > 40)) {
      this.state = 'fight';
      return;
    }
    if (visibleTarget && !hasWeapon) {
      // Run away from danger toward safety.
      this.state = 'storm';
      this.planSafeRoute(true);
      return;
    }
    if (healSlot >= 0 && total < 160 && this.healCd <= 0 && a.mode === 'ground' && !(outside && a.health < 40 && storm.dps > 2) && g.time - (this.underFire || -99) > 3) {
      this.state = 'heal';
      return;
    }
    if (urgent) {
      if (this.state !== 'storm' || !this.route.length) this.planSafeRoute(false);
      this.state = 'storm';
      return;
    }
    if (this.investigate) {
      this.setRoute([this.investigate], 'investigate');
      this.investigate = null;
      this.state = 'move';
      return;
    }
    if ((g.time < this.lootUntil || !hasWeapon || this.weapons().length < 2) && this.state !== 'harvest') {
      this.state = 'loot';
      return;
    }
    const mats = a.mats.wood + a.mats.stone + a.mats.metal;
    if (mats < 60 && this.rng() < 0.3 && this.state !== 'harvest') {
      this.harvestTarget = null;
      this.state = 'harvest';
      return;
    }
    if (this.state === 'harvest') return;
    if (this.state !== 'move' || !this.route.length) {
      this.state = 'move';
      this.planRoam();
    }
  }

  planSafeRoute(flee) {
    const g = this.game, a = this.a;
    const c = g.storm.next || g.storm.current;
    let x, z;
    for (let i = 0; i < 12; i++) {
      const ang = this.rng() * Math.PI * 2, r = Math.sqrt(this.rng()) * c.r * 0.6;
      x = c.x + Math.cos(ang) * r;
      z = c.z + Math.sin(ang) * r;
      if (g.terrain.heightAt(x, z) > 0.8) break;
    }
    if (flee && this.target) {
      const away = angleTo(this.target.pos.x, this.target.pos.z, a.pos.x, a.pos.z);
      x = a.pos.x - Math.sin(away) * 40;
      z = a.pos.z - Math.cos(away) * 40;
    }
    this.setRoute(this.routeTo(x, g.terrain.heightAt(x, z), z), 'safe');
  }

  planRoam() {
    const g = this.game;
    const c = g.storm.next || g.storm.current;
    // Head for a named area inside the safe zone, or a random spot in it.
    const pois = POIS.filter((p) => Math.hypot(p.x - c.x, p.z - c.z) < c.r * 0.85);
    let x, z;
    if (pois.length && this.rng() < 0.6) {
      const p = this.rng.pick(pois);
      x = p.x + (this.rng() - 0.5) * p.r;
      z = p.z + (this.rng() - 0.5) * p.r;
    } else {
      const ang = this.rng() * Math.PI * 2, r = Math.sqrt(this.rng()) * c.r * 0.7;
      x = c.x + Math.cos(ang) * r;
      z = c.z + Math.sin(ang) * r;
    }
    this.setRoute(this.routeTo(x, g.terrain.heightAt(x, z), z), 'roam');
    this.lootUntil = g.time + 25 + this.rng() * 30;
  }

  doMove(dt, urgent) {
    const a = this.a;
    if (a.sel === -1 || !a.held) {
      const w = this.bestWeaponFor(30);
      if (w >= 0) a.selectSlot(w);
    }
    if (this.followRoute(dt, urgent || this.rng() < 0.002 || this.route.length > 0)) {
      if (this.state === 'move') this.planRoam();
    }
    // Reload while walking.
    const h = a.held;
    if (h && h.kind === 'weapon' && h.ammo < WEAPONS[h.type].mag * 0.5) a.intent.reload = true;
  }

  // ---------- fighting ----------

  doFight(dt) {
    const a = this.a, g = this.game, I = a.intent, t = this.target;
    if (!t || !t.alive) {
      this.state = 'move';
      return;
    }
    const dist = t.pos.distanceTo(a.pos);
    const slot = this.bestWeaponFor(dist);
    if (slot >= 0 && slot !== a.sel && a.reloadT <= 0 && a.fireCd <= 0.05) a.selectSlot(slot);
    const yaw = angleTo(a.pos.x, a.pos.z, t.pos.x, t.pos.z);
    const yawErr = this.turnTo(yaw, dt, 4 + this.skill * 6);
    const visible = g.time - this.targetSeenAt < 0.6;
    // movement: strafe and keep a preferred distance
    this.strafeT -= dt;
    if (this.strafeT <= 0) {
      this.strafeT = 0.5 + this.rng() * 1.2;
      this.strafe = this.rng() < 0.5 ? -1 : 1;
      if (this.rng() < 0.15 + this.skill * 0.2) I.jump = true;
    }
    const held = a.held;
    const type = held && held.kind === 'weapon' ? held.type : null;
    const want = type === 'shotgun' ? 6 : type === 'smg' ? 12 : type === 'sniper' ? 70 : 28;
    I.mx = this.strafe * (type === 'sniper' ? 0.3 : 1);
    I.mz = dist > want + 6 ? 1 : dist < want - 6 ? -0.7 : 0;
    if (!visible) {
      // Push toward the last seen position.
      I.mz = 1;
      I.mx = 0;
    }
    // Stay out of the storm while fighting.
    if (g.storm.distOutside(a.pos.x, a.pos.z) > -3) {
      const c = g.storm.current;
      const toYaw = angleTo(a.pos.x, a.pos.z, c.x, c.z);
      const rel = wrapAngle(toYaw - a.yaw);
      I.mz = Math.cos(rel);
      I.mx = -Math.sin(rel);
    }
    if (!type) return;
    const def = WEAPONS[type];
    if (held.ammo <= 0) {
      I.reload = true;
      return;
    }
    this.reactT -= dt;
    I.aim = dist > 15 && type !== 'shotgun';
    if (type === 'sniper') I.mx *= 0.2;
    if (this.reactT > 0 || yawErr > 0.25 || dist > def.range * 0.9) return;
    // Ease off the strafe while shooting so spread stays reasonable.
    if (type !== 'shotgun') I.mx *= 0.45;
    if (!visible && g.time - this.targetSeenAt > 2) return;
    // Bursts so bloom can settle.
    if (this.pauseT > 0) {
      this.pauseT -= dt;
      return;
    }
    this.burstT += dt;
    const burstLen = type === 'smg' ? 0.9 : type === 'ar' ? 0.5 + this.skill * 0.4 : 0.1;
    if (this.burstT > burstLen) {
      this.burstT = 0;
      this.pauseT = type === 'ar' || type === 'smg' || type === 'pistol' ? 0.25 + (1 - this.skill) * 0.35 : 0.15;
      return;
    }
    if (type === 'rocket' && dist < 9) return;
    I.fire = true;
    I.firePressed = a.fireCd <= 0;
  }

  updateAim() {
    const a = this.a, g = this.game;
    a.eye(a.aimOrigin);
    const t = this.target;
    if (this.state === 'fight' && t && t.alive) {
      this.aimErrT -= g.dt || 0.016;
      const dist = t.pos.distanceTo(a.pos);
      if (this.aimErrT <= 0) {
        this.aimErrT = 0.12 + this.rng() * 0.12;
        // Angular error grows with distance; a moving target adds a reaction-lag offset.
        const base = lerp(0.04, 0.008, this.skill) * dist;
        const moving = Math.hypot(t.vel.x, t.vel.z) * lerp(0.15, 0.04, this.skill);
        const s = base + moving + (t.mode === 'ground' ? 0 : 0.6);
        this.aimErr.set((this.rng() - 0.5) * 2 * s, (this.rng() - 0.5) * 1.6 * s, (this.rng() - 0.5) * 2 * s);
      }
      const visible = g.time - this.targetSeenAt < 0.6;
      if (visible) {
        const head = this.rng() < this.skill * 0.2;
        _t.set(t.pos.x, t.pos.y + (head ? t.body.height - 0.2 : t.body.height * 0.6), t.pos.z);
        // lead sniper shots
        const held = a.held;
        if (held && held.type === 'sniper') {
          const tof = dist / WEAPONS.sniper.speed;
          _t.addScaledVector(t.vel, tof);
          _t.y += 0.5 * WEAPONS.sniper.gravity * tof * tof;
        }
      } else {
        _t.copy(this.targetLastPos).add(new THREE.Vector3(0, 1.2, 0));
      }
      _t.add(this.aimErr);
      _d.subVectors(_t, a.aimOrigin).normalize();
      a.aimDir.copy(_d);
      a.pitch = Math.asin(clamp(_d.y, -1, 1));
    } else if (this.harvestAim) {
      _d.subVectors(this.harvestAim, a.aimOrigin).normalize();
      a.aimDir.copy(_d);
      a.pitch = Math.asin(clamp(_d.y, -1, 1));
    } else {
      a.aimDir.set(-Math.sin(a.yaw) * Math.cos(a.pitch), Math.sin(a.pitch), -Math.cos(a.yaw) * Math.cos(a.pitch));
    }
  }

  // ---------- healing ----------

  pickHealSlot() {
    const a = this.a;
    let best = -1, bs = 0;
    a.slots.forEach((s, i) => {
      if (!s || s.kind !== 'heal') return;
      const d = HEALS[s.type];
      let score = 0;
      if (d.shield && a.shield < d.cap) score = (d.cap - a.shield) * (s.type === 'mini' ? 1.2 : 1);
      if (d.hp && a.health < d.cap) score = (d.cap - a.health) * (s.type === 'medkit' && a.health < 50 ? 1.5 : 0.9);
      if (score > bs) {
        bs = score;
        best = i;
      }
    });
    return best;
  }

  doHeal(dt) {
    const a = this.a, I = a.intent;
    if (a.mode !== 'ground') {
      this.state = 'move';
      return;
    }
    if (this.target && this.game.time - this.targetSeenAt < 1) {
      this.state = 'fight';
      return;
    }
    if (a.heal) {
      I.fire = true;
      I.crouch = true;
      return;
    }
    const slot = this.pickHealSlot();
    if (slot < 0) {
      I.crouch = false;
      this.state = 'move';
      this.healCd = 3;
      return;
    }
    if (a.sel !== slot) a.selectSlot(slot);
    I.fire = true;
    I.firePressed = true;
    I.crouch = true;
    if (!a.heal && !a.canUseHeal(a.slots[slot])) {
      this.healCd = 5;
      this.state = 'move';
    }
  }

  // ---------- looting ----------

  wantItem(item) {
    const a = this.a;
    if (item.kind === 'weapon') {
      const ws = this.weapons();
      const same = ws.find(([w]) => w.type === item.type);
      if (same) return item.rarity > same[0].rarity ? 2 : 0;
      if (a.slots.includes(null)) return 3;
      const worst = ws.reduce((m, [w]) => (w.rarity < m.rarity ? w : m), ws[0][0]);
      return item.rarity > worst.rarity + 1 ? 1 : 0;
    }
    if (item.kind === 'heal') {
      const have = a.slots.find((s) => s && s.kind === 'heal' && s.type === item.type);
      if (have) return have.count < HEALS[item.type].stack ? 2 : 0;
      return a.slots.includes(null) ? 2 : 0;
    }
    if (item.kind === 'ammo') {
      const uses = this.weapons().some(([w]) => WEAPONS[w.type].ammo === item.type);
      return uses && a.ammo[item.type] < AMMO_CAPS[item.type] ? 1.5 : 0;
    }
    if (item.kind === 'mat') return a.mats[item.type] < 400 ? 1 : 0;
    return 0;
  }

  findLoot() {
    const a = this.a, L = this.game.loot;
    let best = null, bs = -Infinity;
    const consider = (ref, pos, value, building, floor) => {
      if (this.ignore.has(ref) || value <= 0) return;
      const d = pos.distanceTo(a.pos) + Math.abs(pos.y - a.pos.y) * 3;
      if (d > 70) return;
      const s = value * 12 - d;
      if (s > bs) {
        bs = s;
        best = { ref, pos, building, floor };
      }
    };
    for (const c of L.chests) if (!c.opened) consider(c, c.pos, 4, c.spot.building, c.spot.floor);
    for (const d of L.drops) if (d.landed && !d.opened) consider(d, d.pos, 6, null, 0);
    for (const it of L.items) {
      if (!it.settled) continue;
      const v = this.wantItem(it.item);
      if (v > 0) consider(it, it.pos, v, it.building || this.buildingAt(it.pos), it.floor ?? null);
    }
    return best;
  }

  buildingAt(p) {
    for (const b of this.game.structures.buildings) {
      if (p.x > b.x0 && p.x < b.x1 && p.z > b.z0 && p.z < b.z1 && p.y > b.baseY - 0.6 && p.y < b.roofY + 0.5) return b;
    }
    return null;
  }

  doLoot(dt) {
    const a = this.a, I = a.intent, L = this.game.loot;
    if (a.sel === -1) {
      const w = this.bestWeaponFor(30);
      if (w >= 0) a.selectSlot(w);
    }
    const lt = this.lootTarget;
    const stillValid = lt && (lt.ref.opened === false || (lt.ref.item && L.items.includes(lt.ref)) || (lt.ref.landed && !lt.ref.opened));
    if (!stillValid) {
      this.lootTarget = this.findLoot();
      if (!this.lootTarget) {
        if (this.weapons().length === 0) {
          // Nothing nearby: head for the nearest named area.
          this.lootUntil = this.game.time + 40;
          this.state = 'move';
          this.planRoam();
        } else {
          this.lootUntil = 0;
          this.state = 'move';
        }
        return;
      }
      const t = this.lootTarget;
      const b = t.building;
      const floor = b ? this.floorOf(b, t.pos.y) : 0;
      this.setRoute(this.routeTo(t.pos.x, t.pos.y, t.pos.z, b, floor), 'loot');
    }
    const t = this.lootTarget;
    const d = Math.hypot(t.pos.x - a.pos.x, t.pos.z - a.pos.z);
    if (d < 1.8 && Math.abs(t.pos.y - a.pos.y) < 1.6) {
      I.mz = 0;
      a.yaw = angleTo(a.pos.x, a.pos.z, t.pos.x, t.pos.z);
      if (t.ref.item) {
        if (t.ref.item.kind === 'weapon' && !a.slots.includes(null) && !t.ref.item.__swap) {
          // Swap out the worst weapon.
          const ws = this.weapons();
          const worst = ws.reduce((m, cur) => (cur[0].rarity < m[0].rarity ? cur : m), ws[0]);
          a.selectSlot(worst[1]);
        }
        if (t.ref.item.kind === 'ammo' || t.ref.item.kind === 'mat') {
          // auto pick-up happens by walking over it
          a.intent.mz = 0.4;
        } else if (!L.pickup(a, t.ref)) this.ignore.add(t.ref);
      } else if (t.ref.spot) {
        L.openChest(t.ref, a);
      } else {
        L.openDrop(t.ref, a);
      }
      this.lootTarget = null;
      return;
    }
    if (this.followRoute(dt, d > 15)) {
      if (d > 2.5) this.ignore.add(t.ref);
      this.lootTarget = null;
    }
  }

  // ---------- harvesting ----------

  doHarvest(dt) {
    const a = this.a, I = a.intent, props = this.game.props;
    const mats = a.mats.wood + a.mats.stone + a.mats.metal;
    if (mats >= 200 || (this.harvestTarget && !this.harvestTarget.alive)) {
      this.harvestTarget = null;
      this.harvestAim = null;
      if (mats >= 200) {
        this.state = 'move';
        return;
      }
    }
    if (!this.harvestTarget) {
      let best = null, bd = 45;
      for (const h of props.harvestables) {
        if (!h.alive || h.kind === 'metal') continue;
        const d = Math.abs(h.x - a.pos.x) + Math.abs(h.z - a.pos.z);
        if (d < bd) {
          bd = d;
          best = h;
        }
      }
      if (!best) {
        this.state = 'move';
        return;
      }
      this.harvestTarget = best;
      this.setRoute([new THREE.Vector3(best.x, best.y, best.z)], 'harvest');
    }
    const h = this.harvestTarget;
    const d = Math.hypot(h.x - a.pos.x, h.z - a.pos.z);
    const reach = h.kind === 'rock' ? Math.max(h.sx, h.sz) * 0.8 + 1.4 : 1.8;
    if (d > reach) {
      this.route = [new THREE.Vector3(h.x, h.y, h.z)];
      this.followRoute(dt, false);
      this.harvestAim = null;
      if (this.stuckCount > 6) this.harvestTarget = null;
      return;
    }
    if (a.sel !== -1) a.selectSlot(-1);
    a.yaw = angleTo(a.pos.x, a.pos.z, h.x, h.z);
    this.harvestAim = new THREE.Vector3(h.x, a.pos.y + 1.2, h.z);
    I.fire = true;
  }
}
