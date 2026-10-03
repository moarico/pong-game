import * as THREE from 'three';
import { BALL, CAR, BIG_PADS, SMALL_PADS, RESPAWN_SPOTS } from '../config.js';
import { Ball } from './ball.js';

const _c = new THREE.Vector3();
const _l = new THREE.Vector3();
const _n = new THREE.Vector3();
const _cp = new THREE.Vector3();
const _r = new THREE.Vector3();
const _v = new THREE.Vector3();
const _t = new THREE.Vector3();
const _f = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _qi = new THREE.Quaternion();
const _ca = new THREE.Vector3();
const _cb = new THREE.Vector3();
const _fa = new THREE.Vector3();
const _fb = new THREE.Vector3();
const _pa = new THREE.Vector3();
const _pb = new THREE.Vector3();

const HB = CAR.hitboxHalf;

// Psyonix's extra "hit" impulse scale as a function of relative speed.
function hitScale(dv) {
  if (dv <= 500) return 0.65;
  if (dv <= 2300) return 0.65 - (0.1 * (dv - 500)) / 1800;
  return Math.max(0.3, 0.55 - (0.25 * (dv - 2300)) / 2300);
}

export function collideCarBall(car, ball, time, events) {
  if (car.demolished || ball.frozen) return false;
  const R = BALL.radius;
  car.hitboxCenter(_c);
  _qi.copy(car.quat).invert();
  _l.copy(ball.pos).sub(_c).applyQuaternion(_qi);
  const cx = Math.max(-HB.x, Math.min(HB.x, _l.x));
  const cy = Math.max(-HB.y, Math.min(HB.y, _l.y));
  const cz = Math.max(-HB.z, Math.min(HB.z, _l.z));
  let dx = _l.x - cx, dy = _l.y - cy, dz = _l.z - cz;
  let dist = Math.hypot(dx, dy, dz);
  if (dist >= R) return false;
  if (dist < 1e-3) {
    // ball center inside the box: push out along the shallowest axis
    const px = HB.x - Math.abs(_l.x), py = HB.y - Math.abs(_l.y), pz = HB.z - Math.abs(_l.z);
    dx = dy = dz = 0;
    if (px < py && px < pz) dx = Math.sign(_l.x) || 1;
    else if (py < pz) dy = Math.sign(_l.y) || 1;
    else dz = Math.sign(_l.z) || 1;
    dist = 0;
  } else {
    dx /= dist; dy /= dist; dz /= dist;
  }
  _n.set(dx, dy, dz).applyQuaternion(car.quat);
  const pen = R - dist;
  _cp.set(cx, cy, cz).applyQuaternion(car.quat).add(_c);

  const mb = BALL.mass, mc = CAR.mass;
  ball.pos.addScaledVector(_n, pen * (mc / (mb + mc)));
  car.pos.addScaledVector(_n, -pen * (mb / (mb + mc)));

  // relative speed before the impulse drives Psyonix's extra hit impulse
  const dvHit = Math.min(4600, _t.copy(car.vel).sub(ball.vel).length());
  _r.copy(_cp).sub(car.pos);
  _v.crossVectors(car.angVel, _r).add(car.vel); // car contact point velocity
  const relN = _t.copy(ball.vel).sub(_v).dot(_n);
  if (relN >= 0) return true;

  // inelastic rigid-body impulse
  _t.crossVectors(_r, _n);
  car.applyInvInertia(_t);
  _f.crossVectors(_t, _r);
  const k = 1 / mb + 1 / mc + _n.dot(_f);
  const j = -relN / k;
  ball.vel.addScaledVector(_n, j / mb);
  car.vel.addScaledVector(_n, -j / mc);
  if (!car.onGround) {
    _t.crossVectors(_r, _n).multiplyScalar(-j * 0.5);
    car.angVel.add(car.applyInvInertia(_t));
  }

  // spin from the tangential slide of the car across the ball
  _t.copy(_v).sub(ball.vel);
  _t.addScaledVector(_n, -_t.dot(_n));
  ball.angVel.addScaledVector(_dir.crossVectors(_n, _t), -0.6 / R);

  // extra Psyonix impulse (what makes shots fly)
  let strength = -relN;
  if (time - car.lastBallHit > 0.1) {
    car.forward(_f);
    _dir.copy(ball.pos).sub(_c);
    _dir.y *= 0.35;
    _dir.addScaledVector(_f, -0.35 * _dir.dot(_f));
    _dir.normalize();
    ball.vel.addScaledVector(_dir, dvHit * hitScale(dvHit));
    strength = Math.max(strength, dvHit);
  }
  car.lastBallHit = time;
  const sp = ball.vel.length();
  if (sp > BALL.maxSpeed) ball.vel.multiplyScalar(BALL.maxSpeed / sp);

  if (events) events.push({ type: 'ballHit', car, strength, point: _cp.clone() });
  return true;
}

function closestSegSeg(p1, d1, p2, d2, hl, outA, outB) {
  // segments p ± d*hl
  const ax = p1.x - d1.x * hl, ay = p1.y - d1.y * hl, az = p1.z - d1.z * hl;
  const bx = p2.x - d2.x * hl, by = p2.y - d2.y * hl, bz = p2.z - d2.z * hl;
  const ux = d1.x * 2 * hl, uy = d1.y * 2 * hl, uz = d1.z * 2 * hl;
  const vx = d2.x * 2 * hl, vy = d2.y * 2 * hl, vz = d2.z * 2 * hl;
  const wx = ax - bx, wy = ay - by, wz = az - bz;
  const a = ux * ux + uy * uy + uz * uz;
  const b = ux * vx + uy * vy + uz * vz;
  const c = vx * vx + vy * vy + vz * vz;
  const d = ux * wx + uy * wy + uz * wz;
  const e = vx * wx + vy * wy + vz * wz;
  const den = a * c - b * b;
  let s = den > 1e-6 ? (b * e - c * d) / den : 0;
  s = Math.max(0, Math.min(1, s));
  let t = (b * s + e) / c;
  if (t < 0) { t = 0; s = Math.max(0, Math.min(1, -d / a)); }
  else if (t > 1) { t = 1; s = Math.max(0, Math.min(1, (b - d) / a)); }
  outA.set(ax + ux * s, ay + uy * s, az + uz * s);
  outB.set(bx + vx * t, by + vy * t, bz + vz * t);
}

export const DEMO_BOOST_SPEED = 1100; // min speed for a boosting car to demolish
const _fd = new THREE.Vector3();

// Can `atk` demolish `vic`? dir is the unit vector from atk toward vic.
export function canDemolish(atk, vic, dir) {
  if (atk.team === vic.team || atk.demolished) return false;
  atk.forward(_fd);
  if (_fd.dot(dir) < 0.5) return false; // must hit with the front of the car
  const closing = atk.vel.dot(dir) - vic.vel.dot(dir);
  if (atk.supersonic) return closing > 300;
  return atk.boosting && atk.vel.length() > DEMO_BOOST_SPEED && closing > 700;
}

export function collideCars(a, b, time, events, bumpTimes) {
  if (a.demolished || b.demolished) return;
  a.hitboxCenter(_ca);
  b.hitboxCenter(_cb);
  if (_ca.distanceToSquared(_cb) > 250 * 250) return;
  a.forward(_fa);
  b.forward(_fb);
  const rad = 36;
  closestSegSeg(_ca, _fa, _cb, _fb, HB.z - rad * 0.6, _pa, _pb);
  _n.copy(_pb).sub(_pa);
  let dist = _n.length();
  if (dist >= rad * 2) return;
  if (dist < 1e-3) { _n.set(1, 0, 0); dist = 0; } else _n.divideScalar(dist);
  const pen = rad * 2 - dist;
  a.pos.addScaledVector(_n, -pen / 2);
  b.pos.addScaledVector(_n, pen / 2);
  const vrel = _t.copy(b.vel).sub(a.vel).dot(_n);
  if (vrel >= 0) return;

  // demolitions: ramming an opponent nose-first while boosting (or supersonic) blows it up;
  // two boosting cars meeting head-on both explode
  _dir.copy(_n).negate();
  const aDemo = canDemolish(a, b, _n);
  const bDemo = canDemolish(b, a, _dir);
  if (aDemo || bDemo) {
    for (const [atk, vic] of [[a, b], [b, a]]) {
      if (atk === a ? !aDemo : !bDemo) continue;
      const point = vic.pos.clone();
      vic.demolish();
      atk.stats.demos++;
      if (events) events.push({ type: 'demo', car: vic, by: atk, point });
    }
    return;
  }

  const key = a.id < b.id ? a.id * 1000 + b.id : b.id * 1000 + a.id;
  const last = bumpTimes.get(key) ?? -10;
  const sa = a.vel.dot(_n), sb = -b.vel.dot(_n);
  const attacker = sa >= sb ? a : b;
  const victim = attacker === a ? b : a;
  const nn = attacker === a ? _n : _dir;
  attacker.forward(_f);
  const frontHit = _f.dot(nn) > 0.55;

  // equal-mass impulse with a little bounce
  const j = (-(1 + 0.3) * vrel) / 2;
  a.vel.addScaledVector(_n, -j);
  b.vel.addScaledVector(_n, j);
  const approach = -vrel;
  if (frontHit && approach > 350 && time - last > 0.25) {
    // bump: launch the victim away and slightly up
    victim.vel.addScaledVector(nn, approach * 0.55);
    victim.vel.y += Math.min(600, approach * 0.28);
    victim.noGround = 0.15;
    victim.onGround = false;
    bumpTimes.set(key, time);
    if (events) events.push({ type: 'bump', car: victim, by: attacker, strength: approach, point: _pb.clone() });
  }
}

export class World {
  constructor() {
    this.ball = new Ball();
    this.cars = [];
    this.time = 0;
    this.events = [];
    this.bumpTimes = new Map();
    this.pads = [];
    for (const [x, z] of BIG_PADS) this.pads.push({ x, z, big: true, active: true, timer: 0 });
    for (const [x, z] of SMALL_PADS) this.pads.push({ x, z, big: false, active: true, timer: 0 });
    this.respawnIndex = 0;
  }

  addCar(car) {
    car.events = this.events;
    this.cars.push(car);
    return car;
  }

  resetPads() {
    for (const p of this.pads) { p.active = true; p.timer = 0; }
  }

  respawn(car) {
    const spot = RESPAWN_SPOTS[this.respawnIndex++ % RESPAWN_SPOTS.length];
    const sign = car.team === 0 ? 1 : -1;
    const yaw = car.team === 0 ? spot[2] : Math.PI - spot[2];
    car.place(spot[0] * sign, spot[1] * sign, yaw);
    this.events.push({ type: 'respawn', car });
  }

  step(dt) {
    this.time += dt;
    const { ball, cars } = this;
    for (const car of cars) {
      if (car.demolished) {
        car.respawnTimer -= dt;
        car.prevPos.copy(car.pos);
        if (car.respawnTimer <= 0) this.respawn(car);
        continue;
      }
      car.step(dt);
    }
    const impact = ball.step(dt);
    if (impact > 250) this.events.push({ type: 'bounce', strength: impact, point: ball.pos.clone() });

    for (const car of cars) {
      if (collideCarBall(car, ball, this.time, this.events)) {
        if (ball.lastTouch !== car) {
          ball.prevTouch = ball.lastTouch;
          ball.lastTouch = car;
        }
        ball.lastTouchTime = this.time;
      }
    }
    for (let i = 0; i < cars.length; i++) {
      for (let j = i + 1; j < cars.length; j++) collideCars(cars[i], cars[j], this.time, this.events, this.bumpTimes);
    }

    for (const pad of this.pads) {
      if (!pad.active) {
        pad.timer -= dt;
        if (pad.timer <= 0) pad.active = true;
        continue;
      }
      const r = pad.big ? 208 : 144;
      for (const car of cars) {
        if (car.demolished || car.boost >= 100 || car.pos.y > 180) continue;
        const dx = car.pos.x - pad.x, dz = car.pos.z - pad.z;
        if (dx * dx + dz * dz < r * r) {
          car.boost = pad.big ? 100 : Math.min(100, car.boost + 12);
          pad.active = false;
          pad.timer = pad.big ? 10 : 4;
          this.events.push({ type: 'boostPickup', car, big: pad.big, pad });
          break;
        }
      }
    }
  }
}
