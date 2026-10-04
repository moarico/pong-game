import * as THREE from 'three';
import { makeGlowTexture } from './world/structures.js';

const _c = new THREE.Color();

class ParticlePool {
  constructor(scene, capacity, additive, size) {
    this.cap = capacity;
    this.pos = new Float32Array(capacity * 3).fill(-9999);
    this.col = new Float32Array(capacity * 3);
    this.base = new Float32Array(capacity * 3);
    this.vel = new Float32Array(capacity * 3);
    this.life = new Float32Array(capacity);
    this.max = new Float32Array(capacity);
    this.grav = new Float32Array(capacity);
    this.next = 0;
    this.active = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.points = new THREE.Points(g, new THREE.PointsMaterial({
      size, vertexColors: true, sizeAttenuation: true, transparent: true, depthWrite: false,
      map: makeGlowTexture(), blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = 4;
    scene.add(this.points);
  }

  spawn(x, y, z, vx, vy, vz, color, life, grav) {
    const i = this.next;
    this.next = (this.next + 1) % this.cap;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    _c.set(color);
    this.base[i * 3] = _c.r; this.base[i * 3 + 1] = _c.g; this.base[i * 3 + 2] = _c.b;
    this.life[i] = life;
    this.max[i] = life;
    this.grav[i] = grav;
  }

  update(dt) {
    let any = false;
    for (let i = 0; i < this.cap; i++) {
      if (this.life[i] <= 0) continue;
      any = true;
      this.life[i] -= dt;
      const k = i * 3;
      if (this.life[i] <= 0) {
        this.pos[k + 1] = -9999;
        continue;
      }
      this.vel[k + 1] -= this.grav[i] * dt;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += this.vel[k + 2] * dt;
      const f = Math.min(1, (this.life[i] / this.max[i]) * 1.5);
      this.col[k] = this.base[k] * f;
      this.col[k + 1] = this.base[k + 1] * f;
      this.col[k + 2] = this.base[k + 2] * f;
    }
    if (any || this.dirty) {
      this.points.geometry.attributes.position.needsUpdate = true;
      this.points.geometry.attributes.color.needsUpdate = true;
      this.dirty = any;
    }
  }

  clear() {
    this.life.fill(0);
    this.pos.fill(-9999);
    this.dirty = true;
  }
}

export class Effects {
  constructor(game) {
    this.game = game;
    const scene = game.scene;
    this.sparks = new ParticlePool(scene, 2500, true, 0.35);
    this.dust = new ParticlePool(scene, 2500, false, 0.45);
    this.big = new ParticlePool(scene, 600, true, 2.2);
    // Tracers
    this.tracerCap = 160;
    this.tPos = new Float32Array(this.tracerCap * 6).fill(-9999);
    this.tCol = new Float32Array(this.tracerCap * 6);
    this.tBase = new Float32Array(this.tracerCap * 3);
    this.tLife = new Float32Array(this.tracerCap);
    this.tNext = 0;
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(this.tPos, 3).setUsage(THREE.DynamicDrawUsage));
    tg.setAttribute('color', new THREE.BufferAttribute(this.tCol, 3).setUsage(THREE.DynamicDrawUsage));
    this.tracers = new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.tracers.frustumCulled = false;
    scene.add(this.tracers);
    // Flash sprites (muzzle flashes and explosions)
    this.flashes = [];
    const tex = makeGlowTexture();
    for (let i = 0; i < 24; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xffc060, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      s.visible = false;
      scene.add(s);
      this.flashes.push({ s, life: 0, max: 1, grow: 0, size: 1 });
    }
    this.flashNext = 0;
  }

  reset() {
    this.sparks.clear();
    this.dust.clear();
    this.big.clear();
    this.tLife.fill(0);
    this.tPos.fill(-9999);
    for (const f of this.flashes) {
      f.life = 0;
      f.s.visible = false;
    }
  }

  tracer(a, b, color = '#ffe9a0', life = 0.07) {
    const i = this.tNext;
    this.tNext = (this.tNext + 1) % this.tracerCap;
    this.tPos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    _c.set(color);
    this.tBase.set([_c.r, _c.g, _c.b], i * 3);
    this.tLife[i] = life;
  }

  flash(pos, color, size, life, grow = 0) {
    const f = this.flashes[this.flashNext];
    this.flashNext = (this.flashNext + 1) % this.flashes.length;
    f.s.position.copy(pos);
    f.s.material.color.set(color);
    f.s.scale.setScalar(size);
    f.s.visible = true;
    f.life = life;
    f.max = life;
    f.size = size;
    f.grow = grow;
  }

  muzzle(pos) {
    this.flash(pos, 0xffd27a, 0.9, 0.05);
  }

  impact(p, n, kind = 'world') {
    const color = kind === 'actor' ? '#ff5050' : kind === 'shield' ? '#5ab8ff' : kind === 'build' ? '#d8b070' : '#e8e0c8';
    const pool = kind === 'world' || kind === 'build' ? this.dust : this.sparks;
    for (let i = 0; i < 6; i++) {
      pool.spawn(p.x, p.y, p.z,
        (n ? n.x : 0) * 2 + (Math.random() - 0.5) * 3, (n ? n.y : 0) * 2 + Math.random() * 2.5, (n ? n.z : 0) * 2 + (Math.random() - 0.5) * 3,
        color, 0.35 + Math.random() * 0.2, 9);
    }
  }

  chips(p, color) {
    for (let i = 0; i < 10; i++) {
      this.dust.spawn(p.x, p.y, p.z, (Math.random() - 0.5) * 5, Math.random() * 4 + 1, (Math.random() - 0.5) * 5, color, 0.6, 14);
    }
  }

  debris(box, color, yOff = 0) {
    const [x0, y0, z0, x1, y1, z1] = box;
    for (let i = 0; i < 40; i++) {
      this.dust.spawn(
        x0 + Math.random() * (x1 - x0), y0 + yOff + Math.random() * (y1 - y0), z0 + Math.random() * (z1 - z0),
        (Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 4, color, 0.8 + Math.random() * 0.5, 12,
      );
    }
  }

  explosion(p, radius = 4.5) {
    this.flash(p, 0xffa040, radius * 1.4, 0.45, radius * 5);
    this.flash(p, 0xffffff, radius * 0.8, 0.12, radius * 3);
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI - Math.PI / 2;
      const s = 4 + Math.random() * 10;
      this.sparks.spawn(p.x, p.y, p.z, Math.cos(a) * Math.cos(e) * s, Math.abs(Math.sin(e)) * s + 2, Math.sin(a) * Math.cos(e) * s, i % 3 ? '#ff9a3a' : '#ffe08a', 0.5 + Math.random() * 0.5, 10);
    }
    for (let i = 0; i < 18; i++) {
      this.big.spawn(p.x + (Math.random() - 0.5) * 2, p.y + Math.random(), p.z + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3, 2 + Math.random() * 3, (Math.random() - 0.5) * 3, '#ff7a2a', 0.7 + Math.random() * 0.4, -1);
    }
  }

  // Blocky burst when someone is eliminated.
  elimination(p, color) {
    for (let i = 0; i < 60; i++) {
      this.sparks.spawn(p.x + (Math.random() - 0.5) * 0.6, p.y + Math.random() * 1.8, p.z + (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 3, Math.random() * 4 + 1, (Math.random() - 0.5) * 3, i % 2 ? color : '#7fe0ff', 1.0 + Math.random() * 0.6, -1.5);
    }
  }

  trail(p, color = '#bbbbbb') {
    this.dust.spawn(p.x, p.y, p.z, (Math.random() - 0.5) * 0.6, Math.random() * 0.6, (Math.random() - 0.5) * 0.6, color, 0.8, -0.5);
  }

  update(dt) {
    this.sparks.update(dt);
    this.dust.update(dt);
    this.big.update(dt);
    let any = false;
    for (let i = 0; i < this.tracerCap; i++) {
      if (this.tLife[i] <= 0) continue;
      any = true;
      this.tLife[i] -= dt;
      const f = Math.max(0, this.tLife[i] / 0.07);
      for (let v = 0; v < 2; v++) {
        const k = i * 6 + v * 3;
        this.tCol[k] = this.tBase[i * 3] * f * (v ? 1 : 0.4);
        this.tCol[k + 1] = this.tBase[i * 3 + 1] * f * (v ? 1 : 0.4);
        this.tCol[k + 2] = this.tBase[i * 3 + 2] * f * (v ? 1 : 0.4);
      }
      if (this.tLife[i] <= 0) this.tPos.fill(-9999, i * 6, i * 6 + 6);
    }
    if (any || this.tDirty) {
      this.tracers.geometry.attributes.position.needsUpdate = true;
      this.tracers.geometry.attributes.color.needsUpdate = true;
      this.tDirty = any;
    }
    for (const f of this.flashes) {
      if (f.life <= 0) continue;
      f.life -= dt;
      if (f.life <= 0) {
        f.s.visible = false;
        continue;
      }
      const t = 1 - f.life / f.max;
      f.s.scale.setScalar(f.size + f.grow * t);
      f.s.material.opacity = 1 - t;
    }
  }
}
