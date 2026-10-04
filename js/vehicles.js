import * as THREE from 'three';
import { VEHICLE } from './config.js';
import { truckGeometry, modelMaterial } from './zh/models.js';
import { clamp } from './util.js';

const COLORS = ['#4a5a3a', '#7a2a22', '#2f4f6f', '#c9a23a', '#3a3f45', '#d8d8d0'];
export class Vehicle {
  constructor(game, spot, color) {
    this.game = game;
    this.kind = 'vehicle';
    this.spawn = spot;
    this.color = color;
    this.mesh = new THREE.Mesh(truckGeometry(color), modelMaterial());
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.root = new THREE.Group();
    this.root.add(this.mesh);
    game.scene.add(this.root);
    this.pos = new THREE.Vector3();
    this.collider = null;
    this.reset();
  }

  reset() {
    const W = this.game.collision;
    this.pos.set(this.spawn.x, W.terrain.heightAt(this.spawn.x, this.spawn.z), this.spawn.z);
    this.yaw = this.spawn.yaw;
    this.speed = 0;
    this.hp = VEHICLE.hp;
    this.driver = null;
    this.dead = false;
    this.root.visible = true;
    this.hitCd = new Map();
    if (this.collider) W.remove(this.collider);
    this.collider = W.box(0, 0, 0, 0, 0, 0, this);
    this.pos.y = W.groundAt(this.pos.x, this.pos.z, this.pos.y + 3, 0.3, this.collider);
    this.updateCollider();
    this.syncMesh(0);
  }

  updateCollider() {
    const c = this.collider;
    const cs = Math.abs(Math.cos(this.yaw)), sn = Math.abs(Math.sin(this.yaw));
    const hx = 1.05 * cs + 2.4 * sn, hz = 1.05 * sn + 2.4 * cs;
    c.minx = this.pos.x - hx;
    c.maxx = this.pos.x + hx;
    c.minz = this.pos.z - hz;
    c.maxz = this.pos.z + hz;
    c.miny = this.pos.y + 0.3;
    c.maxy = this.pos.y + 2.0;
    this.game.collision.update(c);
  }

  forward() {
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  seatPosition(out) {
    const f = this.forward();
    const r = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    return out.copy(this.pos).addScaledVector(r, -0.45).addScaledVector(f, -0.6).add(new THREE.Vector3(0, 0.55, 0));
  }

  enter(actor) {
    if (this.driver || this.dead) return false;
    this.driver = actor;
    actor.vehicle = this;
    actor.mode = 'vehicle';
    actor.buildMode = false;
    actor.cancelHeal();
    actor.cancelReload();
    actor.vel.set(0, 0, 0);
    if (!actor.isBot) this.game.audio.startEngine();
    return true;
  }

  exit() {
    const a = this.driver;
    if (!a) return;
    this.driver = null;
    a.vehicle = null;
    a.mode = 'ground';
    const W = this.game.collision;
    const r = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    for (const side of [-1, 1, 0]) {
      const p = this.pos.clone().addScaledVector(r, side * 2.4);
      if (side === 0) p.addScaledVector(this.forward(), 3.6);
      const g = W.groundAt(p.x, p.z, this.pos.y + 3);
      if (!W.overlapsBox(p.x - 0.4, g + 0.3, p.z - 0.4, p.x + 0.4, g + 1.8, p.z + 0.4)) {
        a.pos.set(p.x, g, p.z);
        break;
      }
    }
    a.vel.set(0, 0, 0);
    if (!a.isBot) this.game.audio.stopEngine();
  }

  damage(amount, attacker) {
    if (this.dead) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
      const p = this.pos.clone().add(new THREE.Vector3(0, 1, 0));
      this.game.fx.explosion(p, 4);
      this.game.audio.play('explosion', p);
      const d = this.driver;
      if (d) {
        this.exit();
        this.game.combat.damageActor(d, 40, attacker, 'Vehicle explosion');
      }
      this.root.visible = false;
      this.game.collision.remove(this.collider);
      this.collider = null;
    }
  }

  update(dt) {
    if (this.dead) return;
    const W = this.game.collision;
    const d = this.driver;
    if (d && !d.alive) this.exit();
    const I = this.driver ? this.driver.intent : null;
    const throttle = I ? I.mz : 0;
    const steer = I ? I.mx : 0;
    if (throttle > 0.05) {
      if (this.speed < 0) this.speed += VEHICLE.brake * dt;
      else this.speed += VEHICLE.accel * throttle * dt;
    } else if (throttle < -0.05) {
      if (this.speed > 0) this.speed -= VEHICLE.brake * dt;
      else this.speed -= VEHICLE.accel * 0.6 * dt;
    } else {
      this.speed *= 1 - 0.7 * dt;
      if (Math.abs(this.speed) < 0.1) this.speed = 0;
    }
    if (I && I.jump) this.speed *= 1 - 3 * dt;
    const onRoad = this.game.terrain.distToRoad(this.pos.x, this.pos.z) < 5;
    const maxF = onRoad ? VEHICLE.maxSpeed : VEHICLE.maxSpeed * 0.7;
    this.speed = clamp(this.speed, -VEHICLE.reverse, maxF);
    this.yaw -= steer * VEHICLE.turn * clamp(this.speed / 8, -1, 1) * dt;
    if (Math.abs(this.speed) > 0.01) {
      const f = this.forward();
      const nx = this.pos.x + f.x * this.speed * dt, nz = this.pos.z + f.z * this.speed * dt;
      const ng = W.groundAt(nx, nz, this.pos.y + 1.6, 0.4, this.collider);
      let blocked = ng < -0.9 || ng - this.pos.y > 1.4;
      const probeX = nx + f.x * Math.sign(this.speed) * 1.8, probeZ = nz + f.z * Math.sign(this.speed) * 1.8;
      if (!blocked) {
        W.query(Math.min(nx, probeX) - 1.2, Math.min(nz, probeZ) - 1.2, Math.max(nx, probeX) + 1.2, Math.max(nz, probeZ) + 1.2, (c) => {
          if (c === this.collider || c.disabled) return;
          if (c.maxy <= ng + 0.7 || c.miny >= ng + 2) return;
          // distance from the probe segment to the box
          for (const t of [0, 0.5, 1]) {
            const px = nx + (probeX - nx) * t, pz = nz + (probeZ - nz) * t;
            const cx = clamp(px, c.minx, c.maxx), cz = clamp(pz, c.minz, c.maxz);
            if (Math.hypot(px - cx, pz - cz) < 1.0) {
              const o = c.owner;
              if (o && o.kind === 'build' && Math.abs(this.speed) > 10) {
                this.game.build.damage(o, 600, this.driver);
                this.speed *= 0.6;
              } else blocked = true;
              return false;
            }
          }
        });
      }
      if (blocked) {
        if (Math.abs(this.speed) > 8 && this.driver && !this.driver.isBot) this.game.audio.play('crash', this.pos);
        this.speed = -this.speed * 0.25;
      } else {
        this.pos.x = nx;
        this.pos.z = nz;
        this.pos.y += (ng - this.pos.y) * Math.min(1, dt * 12);
        if (ng > this.pos.y) this.pos.y = ng;
      }
    } else {
      const g = W.groundAt(this.pos.x, this.pos.z, this.pos.y + 1.6, 0.4, this.collider);
      this.pos.y += (g - this.pos.y) * Math.min(1, dt * 12);
    }
    // Run over people
    if (Math.abs(this.speed) > 6) {
      for (const a of this.game.actors) {
        if (a === this.driver || !a.alive || a.mode === 'bus' || a.mode === 'vehicle') continue;
        const dx = a.pos.x - this.pos.x, dz = a.pos.z - this.pos.z;
        if (dx * dx + dz * dz > 6 || Math.abs(a.pos.y - this.pos.y) > 2) continue;
        if ((this.hitCd.get(a) || 0) > this.game.time) continue;
        this.hitCd.set(a, this.game.time + 1);
        const f = this.forward();
        a.vel.set(f.x * this.speed * 0.6, 6, f.z * this.speed * 0.6);
        a.onGround = false;
        this.game.combat.damageActor(a, Math.abs(this.speed) * 2.5, this.driver, 'Truck');
        this.speed *= 0.8;
      }
    }
    this.updateCollider();
    this.syncMesh(dt);
    if (this.driver) {
      this.seatPosition(this.driver.pos);
      if (!this.driver.isBot) this.game.audio.engine(Math.abs(this.speed) / VEHICLE.maxSpeed);
    }
  }

  syncMesh() {
    const T = this.game.terrain;
    const f = this.forward();
    const r = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const hF = T.heightAt(this.pos.x + f.x * 1.8, this.pos.z + f.z * 1.8);
    const hB = T.heightAt(this.pos.x - f.x * 1.8, this.pos.z - f.z * 1.8);
    const hL = T.heightAt(this.pos.x - r.x * 1, this.pos.z - r.z * 1);
    const hR = T.heightAt(this.pos.x + r.x * 1, this.pos.z + r.z * 1);
    const pitch = clamp(Math.atan2(hF - hB, 3.6), -0.5, 0.5);
    const roll = clamp(Math.atan2(hR - hL, 2), -0.4, 0.4);
    this.root.position.copy(this.pos);
    this.root.rotation.set(0, this.yaw, 0);
    this.mesh.rotation.set(pitch, 0, -roll);
  }
}

export class VehicleSystem {
  constructor(game) {
    this.game = game;
    this.list = [];
  }

  spawnAll(spots) {
    spots.forEach((s, i) => this.list.push(new Vehicle(this.game, s, COLORS[i % COLORS.length])));
  }

  reset() {
    for (const v of this.list) v.reset();
  }

  update(dt) {
    for (const v of this.list) v.update(dt);
  }

  nearest(actor, range = 3.4) {
    let best = null, bd = range;
    for (const v of this.list) {
      if (v.dead || v.driver) continue;
      const d = Math.hypot(v.pos.x - actor.pos.x, v.pos.z - actor.pos.z);
      if (d < bd && Math.abs(v.pos.y - actor.pos.y) < 2.5) {
        bd = d;
        best = v;
      }
    }
    return best;
  }
}
