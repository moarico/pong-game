// Skid marks torn into the grass by sliding, spinning or hard-braking tyres.
import * as THREE from 'three';
import { S, CAR } from '../config.js';

const _f = new THREE.Vector3();
const _l = new THREE.Vector3();
const _u = new THREE.Vector3();
const _r = new THREE.Vector3();

export class TireMarks {
  constructor(group, max = 2400, height = 0.02) {
    this.max = max;
    this.height = height; // sits on top of the grass blades on high quality
    this.head = 0;
    this.pos = new Float32Array(max * 4 * 3);
    this.col = new Float32Array(max * 4 * 4);
    const idx = new Uint32Array(max * 6);
    for (let i = 0; i < max; i++) {
      const v = i * 4;
      idx.set([v, v + 1, v + 2, v + 2, v + 1, v + 3], i * 6);
    }
    const g = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.colAttr = new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', this.posAttr);
    g.setAttribute('color', this.colAttr);
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.setDrawRange(0, 0);
    this.geo = g;
    this.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 1;
    group.add(this.mesh);
    this.prev = new Map();
    this.used = 0;
    this.dirty = false;
  }

  clear() {
    this.used = 0;
    this.head = 0;
    this.prev.clear();
    this.geo.setDrawRange(0, 0);
  }

  // How hard the car is tearing up the turf right now (0 = clean rolling).
  static skid(car) {
    if (!car.onGround || car.demolished || car.groundNormal.y < 0.95 || car.pos.y > 45) return 0;
    car.forward(_f);
    car.left(_l);
    const sp = car.vel.length();
    const slip = Math.abs(car.vel.dot(_l));
    const fwd = car.vel.dot(_f);
    const inp = car.input;
    let k = 0;
    if (inp.powerslide && sp > 250) k = Math.max(k, 0.9);
    if (slip > 140) k = Math.max(k, Math.min(1, (slip - 140) / 400));
    if ((inp.throttle > 0.5 || car.boosting) && Math.abs(fwd) < 650) k = Math.max(k, 0.7); // wheelspin launch
    if (inp.throttle * fwd < 0 && Math.abs(fwd) > 450) k = Math.max(k, 0.8); // hard braking
    return k;
  }

  // pos/quat: interpolated car transform (uu)
  update(car, pos, quat, k) {
    _f.set(0, 0, 1).applyQuaternion(quat);
    _l.set(1, 0, 0).applyQuaternion(quat);
    _u.set(0, 1, 0).applyQuaternion(quat);
    for (let w = 0; w < 4; w++) {
      const key = car.id * 4 + w;
      if (k <= 0 || (CAR.wheels[w].front && k < 0.75)) { this.prev.delete(key); continue; }
      const wh = CAR.wheels[w];
      _r.copy(pos).addScaledVector(_l, wh.x + Math.sign(wh.x) * 7).addScaledVector(_f, wh.z);
      const x = _r.x * S, z = _r.z * S;
      const p = this.prev.get(key);
      if (!p) { this.prev.set(key, { x, z }); continue; }
      const dx = x - p.x, dz = z - p.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.08) continue;
      if (d > 4) { this.prev.set(key, { x, z }); continue; } // teleport (respawn), not a skid
      this.addQuad(p.x, p.z, x, z, dx / d, dz / d, 0.72 * k);
      p.x = x; p.z = z;
    }
  }

  addQuad(x0, z0, x1, z1, dx, dz, a) {
    const hw = 0.07; // half tyre width in meters
    const nx = -dz * hw, nz = dx * hw;
    const y = this.height;
    const i = this.head;
    const o = i * 12;
    const P = this.pos;
    P[o] = x0 + nx; P[o + 1] = y; P[o + 2] = z0 + nz;
    P[o + 3] = x0 - nx; P[o + 4] = y; P[o + 5] = z0 - nz;
    P[o + 6] = x1 + nx; P[o + 7] = y; P[o + 8] = z1 + nz;
    P[o + 9] = x1 - nx; P[o + 10] = y; P[o + 11] = z1 - nz;
    const c = i * 16;
    for (let v = 0; v < 4; v++) this.col.set([0.045, 0.035, 0.018, a], c + v * 4);
    this.head = (this.head + 1) % this.max;
    this.used = Math.min(this.max, this.used + 1);
    this.dirty = true;
  }

  flush() {
    if (!this.dirty) return;
    this.dirty = false;
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
    this.geo.setDrawRange(0, this.used * 6);
  }
}
