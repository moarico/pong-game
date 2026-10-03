import * as THREE from 'three';
import { S } from '../config.js';
import { arenaDist, arenaNormal } from '../arena.js';

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const _d = new THREE.Vector3();
const _t = new THREE.Vector3();
const _n = new THREE.Vector3();
const _c = new THREE.Vector3();
const _L = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _target = new THREE.Vector3();
const _id = new THREE.Quaternion();

function slerpDir(out, a, b, t) {
  // rotate unit vector a toward unit vector b by fraction t
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  if (dot > 0.99999) return out.copy(b);
  _q.setFromUnitVectors(a, b);
  _id.identity().slerp(_q, t);
  return out.copy(a).applyQuaternion(_id);
}

// Rocket League style chase camera (distance 270, height 100, ball cam).
export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.dir = new THREE.Vector3(0, 0, 1);
    this.camUp = new THREE.Vector3(0, 1, 0);
    this.look = new THREE.Vector3(0, 0, 1);
    this.pos = new THREE.Vector3();
    this.ballCam = true;
    this.shake = 0;
    this.first = true;
    this.distance = 280;
    this.height = 105;
    this.lookYaw = 0;
  }

  snap() { this.first = true; }

  addShake(a) { this.shake = Math.min(1.5, this.shake + a); }

  update(dt, car, carPos, carQuat, ballPos, lookX = 0, lookY = 0) {
    const k = this.first ? 1 : 1 - Math.exp(-dt * 6);
    // camera "up": follow the surface while driving on walls
    const upTarget = car.onGround && car.groundNormal.y > -0.2 ? car.groundNormal : WORLD_UP;
    this.camUp.lerp(upTarget, this.first ? 1 : 1 - Math.exp(-dt * 3.5)).normalize();
    const up = this.camUp;

    // desired horizontal direction
    if (this.ballCam && ballPos) {
      _d.copy(ballPos).sub(carPos);
    } else {
      _d.set(0, 0, 1).applyQuaternion(carQuat);
      if (!car.onGround && car.vel.lengthSq() > 500 * 500) _d.lerp(_t.copy(car.vel).normalize(), 0.5);
    }
    _d.addScaledVector(up, -_d.dot(up));
    if (_d.lengthSq() < 1) _d.copy(this.dir);
    _d.normalize();
    const dot = this.dir.dot(_d);
    if (this.first) this.dir.copy(_d);
    else if (dot < -0.95) {
      // turning around: rotate through the side instead of collapsing
      _t.crossVectors(up, this.dir).normalize();
      this.dir.addScaledVector(_t, 0.25).normalize();
    } else {
      slerpDir(this.dir, this.dir, _d, this.ballCam ? 1 - Math.exp(-dt * 7.5) : 1 - Math.exp(-dt * 5.5));
    }
    this.dir.addScaledVector(up, -this.dir.dot(up)).normalize();

    // right stick looks around
    this.lookYaw += (lookX * Math.PI * 0.95 - this.lookYaw) * Math.min(1, dt * 10);
    const viewDir = _c.copy(this.dir);
    if (Math.abs(this.lookYaw) > 0.001) viewDir.applyAxisAngle(up, -this.lookYaw);

    const speed = car.vel.length();
    const dist = this.distance + Math.min(60, speed * 0.02);
    const desired = _t.copy(carPos).addScaledVector(viewDir, -dist).addScaledVector(up, this.height + lookY * -60);
    if (this.first) this.pos.copy(desired);
    else this.pos.lerp(desired, 1 - Math.exp(-dt * 14));

    // keep the camera inside the arena
    for (let i = 0; i < 2; i++) {
      const d = arenaDist(this.pos.x, this.pos.y, this.pos.z);
      if (d < 40) {
        arenaNormal(this.pos.x, this.pos.y, this.pos.z, _n);
        this.pos.addScaledVector(_n, 40 - d);
      }
    }

    // look direction
    _target.copy(carPos).addScaledVector(up, 70).addScaledVector(viewDir, 260);
    _L.copy(_target).sub(this.pos).normalize();
    if (this.ballCam && ballPos && Math.abs(this.lookYaw) < 0.3) {
      const toBall = _t.copy(ballPos).sub(this.pos).normalize();
      _L.copy(toBall);
      // keep the car on screen (lower part of the view)
      const toCar = _n.copy(carPos).addScaledVector(up, 10).sub(this.pos).normalize();
      const maxA = THREE.MathUtils.degToRad(this.camera.fov * 0.5) * 0.82;
      const ang = Math.acos(THREE.MathUtils.clamp(toCar.dot(_L), -1, 1));
      if (ang > maxA) slerpDir(_L, toCar, _L, maxA / ang);
      // never look down steeply
      const el = _L.dot(up);
      if (el < -0.35) { _L.addScaledVector(up, -0.35 - el).normalize(); }
    }
    if (this.first) this.look.copy(_L);
    else slerpDir(this.look, this.look, _L, 1 - Math.exp(-dt * 12));
    this.first = false;

    // shake
    this.shake = Math.max(0, this.shake - dt * 2.2);
    const s = this.shake * this.shake * 14;
    this.camera.up.copy(up);
    this.camera.position.set(
      (this.pos.x + (Math.random() - 0.5) * s) * S,
      (this.pos.y + (Math.random() - 0.5) * s) * S,
      (this.pos.z + (Math.random() - 0.5) * s) * S,
    );
    _target.copy(this.pos).addScaledVector(this.look, 1000).multiplyScalar(S);
    this.camera.lookAt(_target);
  }

  // broadcast-style camera for replays
  updateReplay(dt, ballPos, goalZ, t) {
    const side = Math.sign(ballPos.x || 1);
    _t.set(side * 2600 + Math.sin(t * 0.3) * 400, 900, goalZ * 0.55);
    if (this.first) this.pos.copy(_t);
    this.pos.lerp(_t, 1 - Math.exp(-dt * 1.5));
    _L.copy(ballPos).sub(this.pos).normalize();
    if (this.first) this.look.copy(_L);
    else slerpDir(this.look, this.look, _L, 1 - Math.exp(-dt * 6));
    this.first = false;
    this.camera.up.set(0, 1, 0);
    this.camera.position.copy(this.pos).multiplyScalar(S);
    _target.copy(this.pos).addScaledVector(this.look, 1000).multiplyScalar(S);
    this.camera.lookAt(_target);
  }
}
