import * as THREE from 'three';
import { terrainHeight } from './terrain.js';

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

// Critically damped spring (implicit, stable at any frame time).
function spring(state, target, omega, dt) {
  const f = 1 + 2 * dt * omega;
  const oo = omega * omega;
  const hoo = dt * oo;
  const hhoo = dt * hoo;
  const det = 1 / (f + hhoo);
  const x = (f * state.x + dt * state.v + hhoo * target) * det;
  const v = (state.v + hoo * (target - state.x)) * det;
  state.x = x;
  state.v = v;
}

// Third-person camera that trails the samurai: firm sideways, soft vertically so
// jumps float instead of jolting the view.
export class CameraRig {
  constructor(camera, yaw, pitch) {
    this.camera = camera;
    this.yaw = yaw; // look direction = (-sin yaw, 0, -cos yaw)
    this.pitch = pitch; // positive looks down on the samurai
    this.dist = 3.5;
    this.baseDist = 3.5;
    this.shoulder = 0.42; // over-the-shoulder offset: he stands left of centre
    this.fov = 44;
    this.aspect = 1;
    this.tx = { x: 0, v: 0 };
    this.ty = { x: 0, v: 0 };
    this.tz = { x: 0, v: 0 };
    this.ready = false;
    this.look = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.aim = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.trauma = 0;
    this.shakeT = 0;
    this.combat = 0;
  }

  // Screen shake from blows and impacts (amount ~0.2 light .. 1 huge).
  shake(amount) {
    this.trauma = Math.min(1, this.trauma + amount * 0.6);
  }

  update(dt, player, input, fight = 0) {
    const [lx, ly] = input.consumeLook();
    this.yaw -= lx;
    this.pitch = Math.min(1.1, Math.max(-0.42, this.pitch + ly));

    const p = player.renderPos;
    // Track the ground under his feet and only part of a jump, so leaps rise
    // through the frame instead of dragging the whole view up and down.
    const ground = terrainHeight(p.x, p.z);
    const air = Math.max(0, p.y - ground);
    const goalY = ground + 1.45 + air * 0.72 + (this.extraY || 0);
    if (!this.ready) {
      this.tx.x = p.x;
      this.ty.x = goalY;
      this.tz.x = p.z;
      this.ready = true;
    }
    spring(this.tx, p.x, 11, dt);
    spring(this.tz, p.z, 11, dt);
    spring(this.ty, goalY, 9, dt);

    const speed = Math.hypot(player.vel.x, player.vel.z);
    const run = smoothstep(2.4, 5.2, speed);
    // In a fight, pull back and up a little so the foes stay in view.
    this.combat = damp(this.combat, fight, 1.6, dt);
    this.dist = damp(this.dist, this.baseDist + run * 0.6 + this.combat * 0.9, 2.2, dt);
    // Portrait screens get a taller view so the sides are not cropped away.
    const baseFov = this.aspect >= 1 ? 44 : Math.min(74, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(22)) / this.aspect)) * 0.8);
    this.fov = damp(this.fov, baseFov + run * 4 + this.combat * 2, 2.5, dt);

    const pitch = this.pitch + this.combat * 0.07;
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    this.look.set(-Math.sin(this.yaw) * cp, -sp, -Math.cos(this.yaw) * cp);
    this.target.set(this.tx.x, this.ty.x, this.tz.x);
    const cam = this.camera;
    this.right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const offset = this.shoulder * Math.min(1, this.aspect) * (1 - this.combat * 0.3);
    this.aim.copy(this.target).addScaledVector(this.right, offset);
    cam.position.copy(this.aim).addScaledVector(this.look, -this.dist);
    const minY = terrainHeight(cam.position.x, cam.position.z) + 0.45;
    if (cam.position.y < minY) cam.position.y = minY;
    cam.lookAt(this.aim);
    // Shake: smooth noise, scaled by trauma squared, decaying in real time.
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    if (this.trauma > 0.001) {
      this.shakeT += dt;
      const k = this.trauma * this.trauma;
      const n = (f, o) => Math.sin(this.shakeT * f + o) * 0.6 + Math.sin(this.shakeT * f * 2.3 + o * 1.7) * 0.4;
      cam.position.addScaledVector(this.right, n(37, 1) * 0.07 * k);
      cam.position.y += n(41, 4) * 0.06 * k;
      cam.rotateZ(n(29, 7) * 0.035 * k);
      cam.rotateX(n(33, 2) * 0.02 * k);
    }
    if (Math.abs(cam.fov - this.fov) > 1e-3) {
      cam.fov = this.fov;
      cam.updateProjectionMatrix();
    }
  }
}
