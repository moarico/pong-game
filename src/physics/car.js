import * as THREE from 'three';
import { CAR, GRAVITY, BOOST_START } from '../config.js';
import { arenaDist, arenaNormal, arenaRay } from '../arena.js';

const UP = new THREE.Vector3(0, 1, 0);

const _fwd = new THREE.Vector3();
const _up = new THREE.Vector3();
const _left = new THREE.Vector3();
const _right = new THREE.Vector3();
const _n = new THREE.Vector3();
const _nSum = new THREE.Vector3();
const _p = new THREE.Vector3();
const _r = new THREE.Vector3();
const _t = new THREE.Vector3();
const _t2 = new THREE.Vector3();
const _J = new THREE.Vector3();
const _vp = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _qInv = new THREE.Quaternion();

const HB = CAR.hitboxHalf;
const HO = CAR.hitboxOffset;

// Box inertia of the hitbox (local axes: x = left, y = up, z = forward).
const INV_I = new THREE.Vector3(
  12 / (CAR.mass * ((2 * HB.y) ** 2 + (2 * HB.z) ** 2)),
  12 / (CAR.mass * ((2 * HB.x) ** 2 + (2 * HB.z) ** 2)),
  12 / (CAR.mass * ((2 * HB.x) ** 2 + (2 * HB.y) ** 2)),
);

// Hitbox sample points used for body-vs-arena collision.
const BODY_POINTS = [];
for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
  BODY_POINTS.push(new THREE.Vector3(HO.x + sx * HB.x, HO.y + sy * HB.y, HO.z + sz * HB.z));
}
BODY_POINTS.push(
  new THREE.Vector3(HO.x, HO.y + HB.y, HO.z),
  new THREE.Vector3(HO.x, HO.y - HB.y, HO.z),
  new THREE.Vector3(HO.x + HB.x, HO.y, HO.z),
  new THREE.Vector3(HO.x - HB.x, HO.y, HO.z),
  new THREE.Vector3(HO.x, HO.y, HO.z + HB.z),
  new THREE.Vector3(HO.x, HO.y, HO.z - HB.z),
);

function throttleAccel(speed) {
  if (speed < 1400) return 1600 - (1440 * speed) / 1400;
  if (speed < 1410) return 160 * (1 - (speed - 1400) / 10);
  return 0;
}

// Max turning curvature (1/uu) at a given forward speed.
const CURV = [[0, 0.0069], [500, 0.00398], [1000, 0.00235], [1500, 0.001375], [1750, 0.0011], [2500, 0.00088]];
function curvature(speed) {
  speed = Math.abs(speed);
  for (let i = 1; i < CURV.length; i++) {
    if (speed <= CURV[i][0]) {
      const a = CURV[i - 1], b = CURV[i];
      const t = (speed - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * t;
    }
  }
  return CURV[CURV.length - 1][1];
}

export function emptyInput() {
  return { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, jump: false, boost: false, powerslide: false, useItem: false };
}

let carIds = 0;

export class Car {
  constructor(team, name = 'Player') {
    this.id = carIds++;
    this.team = team;
    this.name = name;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.angVel = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.prevPos = new THREE.Vector3();
    this.prevQuat = new THREE.Quaternion();
    this.input = emptyInput();
    this.hitPower = 1; // Rumble power hitter raises this
    this.handling = 'easy'; // 'easy' (arcade grip, default) or 'realistic' (Rocket League values)
    this.prevJump = false;
    this.boost = BOOST_START;
    this.onGround = false;
    this.groundNormal = new THREE.Vector3(0, 1, 0);
    this.wheelContacts = 0;
    this.wheelDist = [0, 0, 0, 0];
    this.hasJumped = false;
    this.canDodge = false;
    this.jumpHold = 0;
    this.noGround = 0;
    this.sinceJump = 10;
    this.dodgeTime = 0;
    this.dodgeAxis = new THREE.Vector3();
    this.dodgePitchSign = 0;
    this.boosting = false;
    this.supersonic = false;
    this.demolished = false;
    this.respawnTimer = 0;
    this.frozen = false;
    this.turtleTime = 0;
    this.selfRight = 0;
    this.yawRate = 0;
    this.steerVisual = 0;
    this.wheelSpin = 0;
    this.lastBallHit = -10;
    this.bodyHit = 0;
    this.events = null; // world event sink
    this.stats = { goals: 0, assists: 0, shots: 0, saves: 0, demos: 0, score: 0 };
  }

  forward(out) { return out.set(0, 0, 1).applyQuaternion(this.quat); }
  up(out) { return out.set(0, 1, 0).applyQuaternion(this.quat); }
  left(out) { return out.set(1, 0, 0).applyQuaternion(this.quat); }

  hitboxCenter(out) {
    return out.set(HO.x, HO.y, HO.z).applyQuaternion(this.quat).add(this.pos);
  }

  place(x, z, yaw, boost = BOOST_START) {
    this.pos.set(x, CAR.restHeight, z);
    this.vel.set(0, 0, 0);
    this.angVel.set(0, 0, 0);
    this.quat.setFromAxisAngle(UP, yaw);
    this.prevPos.copy(this.pos);
    this.prevQuat.copy(this.quat);
    this.boost = boost;
    this.onGround = true;
    this.groundNormal.set(0, 1, 0);
    this.hasJumped = false;
    this.canDodge = false;
    this.jumpHold = 0;
    this.noGround = 0;
    this.dodgeTime = 0;
    this.demolished = false;
    this.supersonic = false;
    this.boosting = false;
    this.turtleTime = 0;
    this.yawRate = 0;
  }

  demolish() {
    this.demolished = true;
    this.respawnTimer = 3;
    this.vel.set(0, 0, 0);
    this.angVel.set(0, 0, 0);
    this.boosting = false;
  }

  speed() { return this.vel.length(); }

  // world-space inverse inertia applied to v (in place)
  applyInvInertia(v) {
    _qInv.copy(this.quat).invert();
    v.applyQuaternion(_qInv);
    v.x *= INV_I.x; v.y *= INV_I.y; v.z *= INV_I.z;
    return v.applyQuaternion(this.quat);
  }

  step(dt) {
    this.prevPos.copy(this.pos);
    this.prevQuat.copy(this.quat);
    if (this.demolished || this.frozen) {
      this.boosting = false;
      this.prevJump = this.input.jump;
      return;
    }
    const inp = this.input;
    const jumpPressed = inp.jump && !this.prevJump;
    this.prevJump = inp.jump;
    this.sinceJump += dt;
    if (this.noGround > 0) this.noGround -= dt;

    this.forward(_fwd);
    this.up(_up);
    this.left(_left);

    // --- wheel ray casts (suspension contacts)
    let contacts = 0;
    let distSum = 0;
    _nSum.set(0, 0, 0);
    if (this.noGround <= 0) {
      const maxLen = CAR.restHeight + 14;
      for (let i = 0; i < 4; i++) {
        const w = CAR.wheels[i];
        _p.copy(this.pos).addScaledVector(_left, w.x).addScaledVector(_fwd, w.z);
        const t = arenaRay(_p.x, _p.y, _p.z, -_up.x, -_up.y, -_up.z, maxLen);
        this.wheelDist[i] = t;
        if (t >= 0) {
          contacts++;
          distSum += t;
          _p.addScaledVector(_up, -t + 2);
          arenaNormal(_p.x, _p.y, _p.z, _n);
          _nSum.add(_n);
        }
      }
    } else {
      this.wheelDist.fill(-1);
    }
    this.wheelContacts = contacts;

    let grounded = false;
    if (contacts >= 2) {
      _n.copy(_nSum).normalize();
      if (_n.dot(_up) > 0.55) {
        grounded = true;
        // gravity pulls harder away from the surface than the wheels can stick (ceiling)
        if (-GRAVITY * _n.y > CAR.stickyAccel) {
          grounded = false;
          if (contacts >= 3) { this.hasJumped = false; this.canDodge = true; this.sinceJump = 0; }
        }
      }
    }

    let airJumpPressed = jumpPressed;
    if (grounded && jumpPressed) {
      airJumpPressed = false;
      // jump off whatever surface we are on
      this.vel.addScaledVector(_up, CAR.jumpImpulse);
      this.jumpHold = CAR.jumpHoldTime;
      this.hasJumped = true;
      this.leftWithoutJump = false;
      this.canDodge = true;
      this.sinceJump = 0;
      this.noGround = 0.12;
      grounded = false;
      this.onGround = false;
      if (this.events) this.events.push({ type: 'jump', car: this });
    }

    if (grounded) {
      this.groundStep(dt, _n, distSum / contacts);
    } else {
      this.airStep(dt, airJumpPressed);
    }

    this.bodyCollide(dt, grounded);

    // speed cap + supersonic state
    const sp = this.vel.length();
    if (sp > CAR.maxSpeed) this.vel.multiplyScalar(CAR.maxSpeed / sp);
    if (sp >= CAR.supersonic) this.supersonic = true;
    else if (sp < CAR.supersonic - 100) this.supersonic = false;

    // visuals
    this.steerVisual += (inp.steer - this.steerVisual) * Math.min(1, dt * 12);
    this.forward(_fwd);
    this.wheelSpin += (this.vel.dot(_fwd) / 14) * dt;
  }

  groundStep(dt, n, avgDist) {
    const inp = this.input;
    const wasAir = !this.onGround;
    this.onGround = true;
    this.groundNormal.copy(n);
    this.hasJumped = false;
    this.leftWithoutJump = false;
    this.canDodge = false;
    this.jumpHold = 0;
    this.dodgeTime = 0;
    this.turtleTime = 0;
    this.selfRight = 0;

    if (wasAir) {
      const impact = -this.vel.dot(n);
      if (this.events && impact > 250) this.events.push({ type: 'land', car: this, strength: impact });
    }

    // align car up with the surface
    this.up(_up);
    _q.setFromUnitVectors(_up, n);
    _q2.identity().slerp(_q, 1 - Math.exp(-dt * 28));
    this.quat.premultiply(_q2).normalize();

    // gravity, with the part pressing into the surface cancelled
    this.vel.y -= GRAVITY * dt;
    const vn = this.vel.dot(n);
    if (vn < 40) this.vel.addScaledVector(n, -vn);

    // forward direction in the surface plane
    this.forward(_fwd);
    _fwd.addScaledVector(n, -_fwd.dot(n)).normalize();
    _right.crossVectors(_fwd, n).normalize();

    const vf = this.vel.dot(_fwd);
    let throttle = inp.throttle;
    const boosting = inp.boost && this.boost > 0;
    if (boosting) throttle = 1;
    let accel = 0;
    if (throttle !== 0) {
      if (vf * throttle >= 0 || Math.abs(vf) < 25) {
        accel = throttleAccel(Math.abs(vf)) * throttle;
      } else {
        accel = CAR.brakeAccel * Math.sign(throttle);
        if (Math.abs(vf) < CAR.brakeAccel * dt) accel = -vf / dt;
      }
    } else if (Math.abs(vf) > 0) {
      const dec = Math.min(CAR.coastDecel, Math.abs(vf) / dt);
      accel = -Math.sign(vf) * dec;
    }
    this.vel.addScaledVector(_fwd, accel * dt);
    if (boosting) {
      this.vel.addScaledVector(_fwd, CAR.boostAccelGround * dt);
      this.boost = Math.max(0, this.boost - CAR.boostUsePerSec * dt);
    }
    this.boosting = boosting;

    // steering: yaw about the surface normal
    const easy = this.handling !== 'realistic';
    const vf2 = this.vel.dot(_fwd);
    let curv = curvature(vf2);
    // easy handling: tighter turning at speed so high-speed corrections don't feel sluggish
    if (easy) curv *= 1 + 0.55 * Math.min(1, Math.max(0, (Math.abs(vf2) - 400) / 1600));
    let targetYaw = -inp.steer * curv * vf2;
    if (inp.powerslide) targetYaw *= 1.35;
    this.yawRate += (targetYaw - this.yawRate) * (1 - Math.exp(-dt * (easy ? 26 : 18)));
    if (Math.abs(this.yawRate) > 1e-5) {
      _q.setFromAxisAngle(n, this.yawRate * dt);
      this.quat.premultiply(_q).normalize();
      // easy handling: the tyres carry the velocity round with the car, so it goes where it points
      if (easy && !inp.powerslide) this.vel.applyQuaternion(_q2.identity().slerp(_q, 0.85));
    }

    // lateral tire friction (weaker on walls, much weaker while power sliding)
    const grip = Math.min(1, Math.max(0.3, (GRAVITY * Math.max(0, n.y) + CAR.stickyAccel) / (GRAVITY + CAR.stickyAccel)));
    const k = (inp.powerslide ? 2.2 : easy ? 30 : 14) * grip;
    this.forward(_fwd);
    _fwd.addScaledVector(n, -_fwd.dot(n)).normalize();
    _right.crossVectors(_fwd, n).normalize();
    const vl = this.vel.dot(_right);
    this.vel.addScaledVector(_right, -vl * (1 - Math.exp(-dt * k)));

    // integrate + keep the car at ride height
    this.pos.addScaledVector(this.vel, dt);
    const corr = CAR.restHeight - avgDist;
    this.pos.addScaledVector(n, corr * (1 - Math.exp(-dt * 30)));
    // only the driven yaw remains as angular velocity
    this.angVel.copy(n).multiplyScalar(this.yawRate);
  }

  airStep(dt, jumpPressed) {
    const inp = this.input;
    if (this.onGround) {
      // just left the ground without jumping: keep one jump/dodge available
      this.onGround = false;
      if (!this.hasJumped) { this.canDodge = true; this.sinceJump = 0; this.hasJumped = true; this.leftWithoutJump = true; }
    }
    this.onGround = false;
    this.yawRate = 0;

    this.forward(_fwd);
    this.up(_up);
    this.left(_left);
    _right.copy(_left).negate();

    this.vel.y -= GRAVITY * dt;

    // holding jump makes the first jump higher
    if (this.jumpHold > 0) {
      if (inp.jump) {
        this.vel.addScaledVector(_up, CAR.jumpHoldAccel * dt);
        this.jumpHold -= dt;
      } else {
        this.jumpHold = 0;
      }
    }

    // second jump: double jump or dodge
    const jumpWindow = this.leftWithoutJump ? 1e9 : CAR.doubleJumpWindow;
    if (jumpPressed && this.canDodge && this.sinceJump < jumpWindow) {
      this.canDodge = false;
      this.jumpHold = 0;
      const fwdAmt = -inp.pitch;
      const sideAmt = inp.yaw;
      if (Math.abs(fwdAmt) + Math.abs(sideAmt) >= 0.5) {
        let fx = fwdAmt, sx = sideAmt;
        const l = Math.hypot(fx, sx);
        if (l > 1) { fx /= l; sx /= l; }
        // horizontal frame from the car heading
        _t.set(_fwd.x, 0, _fwd.z);
        if (_t.lengthSq() < 1e-4) _t.set(-_up.x, 0, -_up.z);
        _t.normalize();
        _t2.set(-_t.z, 0, _t.x); // right of heading
        const fImp = fx >= 0 ? CAR.dodgeImpulse : CAR.dodgeImpulse * 1.066;
        const spd = this.vel.length();
        const sImp = CAR.dodgeImpulse * (1 + 0.9 * Math.min(1, spd / CAR.maxSpeed));
        this.vel.addScaledVector(_t, fx * fImp).addScaledVector(_t2, sx * sImp * 0.9);
        this.vel.y *= 0.35;
        // flip spin around the car's own axes
        this.angVel.copy(_right).multiplyScalar(-fx * CAR.maxAngVel).addScaledVector(_fwd, sx * CAR.maxAngVel);
        this.dodgeTime = CAR.dodgeTime;
        this.dodgeAxis.copy(this.angVel);
        this.dodgePitchSign = Math.sign(-fx);
        if (this.events) this.events.push({ type: 'dodge', car: this });
      } else {
        this.vel.addScaledVector(_up, CAR.jumpImpulse);
        if (this.events) this.events.push({ type: 'jump', car: this });
      }
    }

    // rotation
    if (this.selfRight > 0) {
      // flipping back onto the wheels after landing on the roof/side
      this.selfRight -= dt;
      _t.set(_fwd.x, 0, _fwd.z);
      if (_t.lengthSq() < 1e-3) _t.set(-_up.x, 0, -_up.z);
      if (_t.lengthSq() < 1e-6) _t.set(0, 0, 1);
      _t.normalize();
      _q2.setFromAxisAngle(UP, Math.atan2(_t.x, _t.z));
      this.quat.slerp(_q2, 1 - Math.exp(-dt * 9));
      this.angVel.set(0, 0, 0);
    } else if (this.dodgeTime > 0) {
      this.dodgeTime -= dt;
      // flip cancel: pull the stick against the flip to stop the rotation
      const pitchAgainst = this.dodgePitchSign !== 0 && Math.sign(inp.pitch) === this.dodgePitchSign && Math.abs(inp.pitch) > 0.5;
      if (pitchAgainst) {
        const wP = this.angVel.dot(_right);
        this.angVel.addScaledVector(_right, -wP * Math.min(1, dt * 20));
      }
    } else {
      let pitchIn = inp.pitch;
      let yawIn = inp.yaw;
      let rollIn = inp.roll;
      if (inp.powerslide) { rollIn = Math.max(-1, Math.min(1, rollIn + inp.yaw)); yawIn = 0; }
      let wP = this.angVel.dot(_right);
      let wY = this.angVel.dot(_up);
      let wR = this.angVel.dot(_fwd);
      wP += (CAR.airPitch * pitchIn - CAR.dampPitch * wP * (1 - Math.abs(pitchIn))) * dt;
      wY += (-CAR.airYaw * yawIn - CAR.dampYaw * wY * (1 - Math.abs(yawIn))) * dt;
      wR += (CAR.airRoll * rollIn - CAR.dampRoll * wR) * dt;
      this.angVel.copy(_right).multiplyScalar(wP).addScaledVector(_up, wY).addScaledVector(_fwd, wR);
    }
    const w = this.angVel.length();
    if (w > CAR.maxAngVel) this.angVel.multiplyScalar(CAR.maxAngVel / w);

    // boost / air throttle
    const boosting = inp.boost && this.boost > 0;
    if (boosting) {
      this.vel.addScaledVector(_fwd, CAR.boostAccelAir * dt);
      this.boost = Math.max(0, this.boost - CAR.boostUsePerSec * dt);
    } else if (inp.throttle !== 0) {
      this.vel.addScaledVector(_fwd, CAR.airThrottleAccel * inp.throttle * dt);
    }
    this.boosting = boosting;

    // integrate
    this.pos.addScaledVector(this.vel, dt);
    const wl = this.angVel.length();
    if (wl > 1e-6) {
      _t.copy(this.angVel).divideScalar(wl);
      _q.setFromAxisAngle(_t, wl * dt);
      this.quat.premultiply(_q).normalize();
    }

    // stuck on the roof/side: jump (or wait) to flip back over
    this.up(_up);
    arenaNormal(this.pos.x, this.pos.y, this.pos.z, _n);
    this.turtled = this.bodyHit > 0 && this.vel.lengthSq() < 300 * 300 && _up.dot(_n) < 0.5;
    if (this.turtled) {
      this.turtleTime += dt;
      if ((jumpPressed && this.turtleTime > 0.15) || this.turtleTime > 2.5) {
        this.vel.y += 340;
        this.selfRight = 0.6;
        this.turtleTime = 0;
        this.canDodge = false;
      }
    } else {
      this.turtleTime = 0;
    }
  }

  // Resolve hitbox penetration with the arena.
  bodyCollide(dt, grounded) {
    this.bodyHit = Math.max(0, this.bodyHit - dt);
    for (let iter = 0; iter < 3; iter++) {
      let deepest = 0;
      let idx = -1;
      for (let i = 0; i < BODY_POINTS.length; i++) {
        _p.copy(BODY_POINTS[i]).applyQuaternion(this.quat).add(this.pos);
        const d = arenaDist(_p.x, _p.y, _p.z);
        if (d < deepest) {
          if (grounded) {
            arenaNormal(_p.x, _p.y, _p.z, _n);
            this.up(_up);
            if (Math.abs(_n.dot(_up)) > 0.6) continue;
          }
          deepest = d;
          idx = i;
        }
      }
      if (idx < 0) return;
      _p.copy(BODY_POINTS[idx]).applyQuaternion(this.quat).add(this.pos);
      arenaNormal(_p.x, _p.y, _p.z, _n);
      this.pos.addScaledVector(_n, -deepest + 0.1);
      this.bodyHit = 0.2;
      _r.copy(_p).sub(this.pos);
      if (grounded) {
        const vn = this.vel.dot(_n);
        if (vn < 0) this.vel.addScaledVector(_n, -vn * 1.2);
        continue;
      }
      // rigid body impulse with friction
      _vp.crossVectors(this.angVel, _r).add(this.vel);
      const vn = _vp.dot(_n);
      if (vn >= 0) continue;
      _t.crossVectors(_r, _n);
      this.applyInvInertia(_t);
      _t2.crossVectors(_t, _r);
      const kN = 1 / CAR.mass + _n.dot(_t2);
      const e = vn < -350 ? 0.3 : 0.0;
      const jn = (-(1 + e) * vn) / kN;
      _J.copy(_n).multiplyScalar(jn);
      // friction
      _t.copy(_vp).addScaledVector(_n, -vn);
      const tl = _t.length();
      if (tl > 1e-3) {
        _t.divideScalar(tl);
        const jt = Math.min(0.6 * jn, (tl * CAR.mass) / 2);
        _J.addScaledVector(_t, -jt);
      }
      this.vel.addScaledVector(_J, 1 / CAR.mass);
      _t.crossVectors(_r, _J);
      this.angVel.add(this.applyInvInertia(_t));
    }
  }
}
