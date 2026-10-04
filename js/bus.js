import * as THREE from 'three';
import { MAP } from './config.js';
import { GeoBuilder, worldMaterial } from './world/geobuilder.js';
import { makeGlowTexture } from './world/structures.js';

// The "Sky Coach": a bus carried across the island by a hot-air balloon.
export function buildBusModel() {
  const g = new THREE.Group();
  const gb = new GeoBuilder();
  gb.jitter = 0;
  // bus body (front faces -Z)
  gb.box(-1.3, 0, -3.2, 1.3, 2.6, 3.2, '#2f6dd0');
  gb.box(-1.32, 1.3, -3.0, 1.32, 2.2, 2.6, '#bfe4ff');
  for (let z = -2.6; z < 2.6; z += 1.1) gb.box(-1.34, 1.3, z, 1.34, 2.2, z + 0.12, '#2f6dd0');
  gb.box(-1.2, 0.9, -3.25, 1.2, 2.2, -3.18, '#bfe4ff');
  gb.box(-1.31, 0.3, -3.2, 1.31, 0.6, 3.2, '#f0c040');
  gb.box(-1.0, 2.6, -2.5, 1.0, 2.9, 2.5, '#244f9a');
  for (const [x, z] of [[-1.2, -2.2], [1.2, -2.2], [-1.2, 2.2], [1.2, 2.2]]) gb.box(x - 0.2, -0.45, z - 0.45, x + 0.2, 0.45, z + 0.45, '#1e1e1e');
  gb.box(-1.0, 0.4, -3.3, -0.6, 0.8, -3.2, '#fff6b0');
  gb.box(0.6, 0.4, -3.3, 1.0, 0.8, -3.2, '#fff6b0');
  // ropes
  for (const [x, z] of [[-1.1, -2.8], [1.1, -2.8], [-1.1, 2.8], [1.1, 2.8]]) {
    const top = [x * 2.2, 9, z * 1.1];
    gb.boxRot((x + top[0]) / 2, 2.9, (z + top[2]) / 2, 0.06, 6.4, 0.06, 0, '#d8d0c0');
  }
  // burner + balloon
  gb.cylinder(0, 8.6, 0, 0.6, 0.8, 0.8, 8, '#555');
  const cols = ['#e84a5f', '#ffffff', '#2f6dd0', '#f0c040'];
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2;
    const col = gb.rgb(cols[i % 4]);
    for (let j = 0; j < 9; j++) {
      const t0 = (j / 9) * Math.PI, t1 = ((j + 1) / 9) * Math.PI;
      const rr = (t) => Math.sin(t) * 7 * (t > Math.PI * 0.6 ? 1 - (t - Math.PI * 0.6) * 0.45 : 1);
      const P = (t, a) => [Math.cos(a) * rr(t), 17 + Math.cos(t) * 8, Math.sin(a) * rr(t)];
      gb.triOut(P(t0, a0), P(t1, a0), P(t1, a1), col, 0, 17, 0);
      gb.triOut(P(t0, a0), P(t1, a1), P(t0, a1), col, 0, 17, 0);
    }
  }
  const mesh = new THREE.Mesh(gb.build(), worldMaterial());
  mesh.castShadow = true;
  g.add(mesh);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xff9a30, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.position.set(0, 9.6, 0);
  flame.scale.setScalar(2.2);
  g.add(flame);
  g.userData.flame = flame;
  return g;
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
    this.model.userData.flame.scale.setScalar(2 + Math.sin(this.t * 17) * 0.4);
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
