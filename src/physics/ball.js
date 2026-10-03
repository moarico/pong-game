import * as THREE from 'three';
import { BALL, GRAVITY, ARENA } from '../config.js';
import { arenaDist, arenaNormal } from '../arena.js';

const _n = new THREE.Vector3();
const _vPerp = new THREE.Vector3();
const _vPara = new THREE.Vector3();
const _spin = new THREE.Vector3();
const _s = new THREE.Vector3();
const _tmp = new THREE.Vector3();

// Ball bounce model after "Rocket Science" (chip): restitution on the normal
// component, spin-aware friction on the tangential component.
const MU = BALL.friction;
const Y_RATIO = 2.0;
const SPIN_A = 0.0003;

// Advances a plain ball state {pos, vel, angVel} by dt. Returns the impact
// speed of the strongest bounce this step (0 when nothing was hit).
export function stepBallState(st, dt) {
  const R = BALL.radius;
  st.vel.y -= GRAVITY * dt;
  st.vel.multiplyScalar(1 - BALL.drag * dt);
  const sp = st.vel.length();
  if (sp > BALL.maxSpeed) st.vel.multiplyScalar(BALL.maxSpeed / sp);
  st.pos.addScaledVector(st.vel, dt);

  let impact = 0;
  for (let iter = 0; iter < 2; iter++) {
    const d = arenaDist(st.pos.x, st.pos.y, st.pos.z);
    if (d >= R) break;
    arenaNormal(st.pos.x, st.pos.y, st.pos.z, _n);
    st.pos.addScaledVector(_n, R - d);
    const vn = st.vel.dot(_n);
    if (vn < 0) {
      _vPerp.copy(_n).multiplyScalar(vn);
      _vPara.copy(st.vel).sub(_vPerp);
      _spin.crossVectors(_n, st.angVel).multiplyScalar(R);
      _s.copy(_vPara).add(_spin);
      const sLen = Math.max(_s.length(), 1e-4);
      const ratio = -vn / sLen;
      const restitution = -vn < 40 ? 0 : BALL.restitution;
      const dvPara = _tmp.copy(_s).multiplyScalar(-Math.min(1, Y_RATIO * ratio) * MU);
      st.vel.addScaledVector(_vPerp, -(1 + restitution));
      st.vel.add(dvPara);
      st.angVel.add(_spin.crossVectors(dvPara, _n).multiplyScalar(SPIN_A * R));
      impact = Math.max(impact, -vn);
    }
  }

  // rolling: gently pull spin toward the rolling speed while on the floor
  const w = st.angVel.length();
  if (w > BALL.maxSpin) st.angVel.multiplyScalar(BALL.maxSpin / w);
  return impact;
}

export class Ball {
  constructor() {
    this.pos = new THREE.Vector3(0, BALL.radius, 0);
    this.vel = new THREE.Vector3();
    this.angVel = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.prevPos = this.pos.clone();
    this.prevQuat = this.quat.clone();
    this.lastTouch = null;
    this.prevTouch = null;
    this.lastTouchTime = -10;
    this.frozen = false;
  }

  reset() {
    this.pos.set(0, BALL.radius, 0);
    this.vel.set(0, 0, 0);
    this.angVel.set(0, 0, 0);
    this.prevPos.copy(this.pos);
    this.lastTouch = null;
    this.prevTouch = null;
    this.frozen = true;
  }

  step(dt) {
    this.prevPos.copy(this.pos);
    this.prevQuat.copy(this.quat);
    if (this.frozen) return 0;
    const impact = stepBallState(this, dt);
    // visual spin
    const w = this.angVel.length();
    if (w > 1e-4) {
      _tmp.copy(this.angVel).divideScalar(w);
      _q.setFromAxisAngle(_tmp, w * dt);
      this.quat.premultiply(_q).normalize();
    }
    return impact;
  }

  // Which goal the ball is fully inside: 0 = blue's goal, 1 = orange's goal, -1 none.
  goalState() {
    const R = BALL.radius;
    if (Math.abs(this.pos.x) < ARENA.goalHalfW && this.pos.y < ARENA.goalH) {
      if (this.pos.z > ARENA.halfZ + R) return 1;
      if (this.pos.z < -ARENA.halfZ - R) return 0;
    }
    return -1;
  }
}

const _q = new THREE.Quaternion();

// Predicts the ball path; fills `out` with {t, pos, vel} slices.
export function predictBall(ball, seconds, dt, out) {
  const st = {
    pos: ball.pos.clone(),
    vel: ball.vel.clone(),
    angVel: ball.angVel.clone(),
  };
  const n = Math.round(seconds / dt);
  out.length = 0;
  if (ball.frozen) {
    for (let i = 0; i <= n; i++) out.push({ t: i * dt, pos: st.pos.clone(), vel: new THREE.Vector3() });
    return out;
  }
  for (let i = 0; i <= n; i++) {
    out.push({ t: i * dt, pos: st.pos.clone(), vel: st.vel.clone() });
    stepBallState(st, dt);
  }
  return out;
}
