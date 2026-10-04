import * as THREE from 'three';
import { MAP } from './config.js';
import { busModel } from './zh/models.js';

// The "Sky Coach": a bus carried across the island by a hot-air balloon (model in zh/models.js).
export function buildBusModel() {
  return busModel();
}

export class Bus {
  constructor(game) {
    this.game = game;
    this.model = buildBusModel();
    this.model.visible = false;
    game.scene.add(this.model);
    this.pos = new THREE.Vector3();
    this.dir = new THREE.Vector3();
    this.active = false;
  }

  start(rng) {
    const a = rng() * Math.PI * 2;
    const off = (rng() - 0.5) * 260;
    this.dir.set(Math.cos(a), 0, Math.sin(a));
    const perp = new THREE.Vector3(-this.dir.z, 0, this.dir.x);
    this.length = 1360;
    this.origin = perp.clone().multiplyScalar(off).addScaledVector(this.dir, -this.length / 2);
    this.origin.y = MAP.busAltitude;
    this.t = 0;
    this.progress = 0;
    this.active = true;
    this.doorsOpen = false;
    this.model.visible = true;
    this.model.rotation.y = Math.atan2(-this.dir.x, -this.dir.z);
    this.update(0);
  }

  pointAt(progress, out = new THREE.Vector3()) {
    return out.copy(this.origin).addScaledVector(this.dir, progress * this.length);
  }

  // Bus progress (0..1) where the path passes closest to (x, z).
  closestProgress(x, z) {
    const dx = x - this.origin.x, dz = z - this.origin.z;
    return Math.max(0, Math.min(1, (dx * this.dir.x + dz * this.dir.z) / this.length));
  }

  update(dt) {
    if (!this.active) return;
    this.t += dt;
    this.progress = Math.min(1, (this.t * MAP.busSpeed) / this.length);
    this.doorsOpen = this.t > 3;
    this.pointAt(this.progress, this.pos);
    this.model.position.copy(this.pos);
    this.model.position.y += Math.sin(this.t * 1.3) * 0.4;
    this.model.userData.flame.scale.setScalar(2.2 + Math.sin(this.t * 17) * 0.35 + Math.sin(this.t * 5.3) * 0.2);
    for (const a of this.game.actors) {
      if (a.alive && a.mode === 'bus') a.pos.copy(this.pos);
    }
    if (this.progress >= 1) {
      for (const a of this.game.actors) if (a.alive && a.mode === 'bus') this.game.jumpFromBus(a);
      this.active = false;
    }
  }

  hide() {
    this.model.visible = false;
    this.active = false;
  }
}
