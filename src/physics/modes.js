// Game-mode rules that plug into World.step: Heatseeker and Rumble (power-ups).
import * as THREE from 'three';
import { ARENA, BALL, GRAVITY } from '../config.js';

const HZ = ARENA.halfZ;
const GW = ARENA.goalHalfW;
const GH = ARENA.goalH;
const R = BALL.radius;

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _f = new THREE.Vector3();
const _q = new THREE.Quaternion();

// goal the given team shoots at
const attackZ = (team) => (team === 0 ? 1 : -1) * (HZ + 450);

class NoRules {
  reset() {}
  preStep() {}
  preBall() {}
  onTouch() {}
  postStep() {}
}

// ---------------------------------------------------------------------------
// Heatseeker: after every touch the ball homes in on the toucher's target goal
// and speeds up a little. Hitting the backboard sends it back the other way.
export class Heatseeker extends NoRules {
  constructor(world) {
    super();
    this.world = world;
    this.name = 'heatseeker';
    this.reset();
    world.ball.force = (st, dt) => this.force(st, dt);
  }

  reset() {
    this.team = -1;
    this.speed = 0;
    this.lastBoost = -10;
    this.lastFlip = -10;
  }

  onTouch(car) {
    const t = this.world.time;
    if (car.team !== this.team || t - this.lastBoost > 0.5) {
      this.speed = Math.min(4200, Math.max(1500, this.speed + 160));
      this.lastBoost = t;
    }
    this.team = car.team;
  }

  force(st, dt) {
    if (this.team < 0) return;
    _a.set(0, 330, attackZ(this.team)).sub(st.pos);
    const dist = _a.length();
    if (dist < 1) return;
    _a.multiplyScalar(this.speed / dist);
    st.vel.y += GRAVITY * dt * 0.92; // it flies rather than falls
    st.vel.lerp(_a, 1 - Math.exp(-dt * 1.5));
  }

  postStep() {
    if (this.team < 0) return;
    const b = this.world.ball;
    const wallZ = (this.team === 0 ? 1 : -1) * HZ;
    const nearWall = Math.abs(b.pos.z - wallZ) < R + 40;
    const inMouth = Math.abs(b.pos.x) < GW && b.pos.y < GH;
    if (nearWall && !inMouth && this.world.time - this.lastFlip > 0.6) {
      // backboard: send it back toward the shooter's own goal
      this.team = 1 - this.team;
      this.lastFlip = this.world.time;
      this.world.events.push({ type: 'heatseekFlip', point: b.pos.clone() });
    }
  }
}

// ---------------------------------------------------------------------------
// Rumble power-ups (after Rocket League's Rumble mode)
export const ITEMS = {
  grapple: { name: 'Grappling Hook', icon: '🪝', hint: 'Pulls you to the ball' },
  plunger: { name: 'Plunger', icon: '🪠', hint: 'Pulls the ball to you' },
  tornado: { name: 'Tornado', icon: '🌪️', hint: 'Spins up everything near you' },
  curveball: { name: 'Curveball', icon: '🌀', hint: 'Curves the ball into their goal' },
  spikes: { name: 'Spikes', icon: '📌', hint: 'The ball sticks to your car' },
  boot: { name: 'Boot', icon: '👢', hint: 'Kicks the nearest opponent away' },
  power: { name: 'Power Hitter', icon: '💥', hint: 'Huge hits and demolish on contact' },
  freezer: { name: 'Freezer', icon: '❄️', hint: 'Freezes the ball in place' },
};
export const ITEM_KEYS = Object.keys(ITEMS);

const RANGE = { grapple: 4200, plunger: 4200, curveball: 5000, freezer: 6000, boot: 4500 };

export class Rumble extends NoRules {
  constructor(world, pool = ITEM_KEYS) {
    super();
    this.world = world;
    this.name = 'rumble';
    this.pool = pool.length ? pool : ITEM_KEYS;
    this.state = new Map();
    this.curve = null; // {team, t}
    this.reset();
  }

  st(car) {
    let s = this.state.get(car);
    if (!s) {
      s = { item: null, timer: 3, held: 0, active: null, prevUse: false };
      this.state.set(car, s);
    }
    return s;
  }

  reset() {
    for (const car of this.world.cars) {
      const s = this.st(car);
      this.endActive(car, s);
      s.item = null;
      s.timer = 2 + Math.random() * 3;
      s.prevUse = !!car.input.useItem;
    }
    this.curve = null;
    this.world.ball.iceTimer = 0;
    this.world.ball.attachedTo = null;
  }

  give(car, s) {
    s.item = this.pool[Math.floor(Math.random() * this.pool.length)];
    s.held = 0;
    this.world.events.push({ type: 'itemGet', car, item: s.item });
  }

  inRange(car, item) {
    const r = RANGE[item];
    if (!r) return true;
    if (item === 'boot') return !!this.nearestOpponent(car, r);
    return car.pos.distanceTo(this.world.ball.pos) < r;
  }

  nearestOpponent(car, range) {
    let best = null, bd = range;
    for (const o of this.world.cars) {
      if (o.team === car.team || o.demolished) continue;
      const d = o.pos.distanceTo(car.pos);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  // returns true when the item was used
  use(car) {
    const s = this.st(car);
    if (!s.item || s.active || car.demolished || this.world.ball.frozen) return false;
    const item = s.item;
    if (!this.inRange(car, item)) {
      this.world.events.push({ type: 'itemFail', car, item });
      return false;
    }
    s.item = null;
    const w = this.world;
    const ball = w.ball;
    switch (item) {
      case 'grapple':
      case 'plunger':
        s.active = { type: item, phase: 'shoot', t: 0, hook: car.pos.clone() };
        break;
      case 'tornado':
        s.active = { type: 'tornado', t: 0, dur: 5.5 };
        break;
      case 'spikes':
        s.active = { type: 'spikes', t: 0, dur: 10, offset: null };
        break;
      case 'power':
        s.active = { type: 'power', t: 0, dur: 8 };
        car.hitPower = 1.8;
        break;
      case 'curveball':
        this.curve = { team: car.team, t: 4 };
        if (ball.vel.length() < 1200) {
          // a slow ball gets a push so the curve has something to work with
          ball.vel.addScaledVector(_a.set(0, 0, Math.sign(attackZ(car.team))), 900);
          ball.vel.y += 250;
        }
        s.timer = 9;
        break;
      case 'freezer':
        ball.iceTimer = 3.5;
        ball.vel.set(0, 0, 0);
        s.timer = 9;
        break;
      case 'boot': {
        const v = this.nearestOpponent(car, RANGE.boot);
        _a.copy(v.pos).sub(car.pos).setY(0).normalize();
        v.vel.addScaledVector(_a, 1700);
        v.vel.y += 1050;
        v.noGround = 0.25;
        v.onGround = false;
        v.angVel.set(Math.random() - 0.5, 0, Math.random() - 0.5).multiplyScalar(8);
        w.events.push({ type: 'boot', car: v, by: car, point: v.pos.clone() });
        s.timer = 9;
        break;
      }
      default:
        break;
    }
    w.events.push({ type: 'itemUse', car, item });
    return true;
  }

  endActive(car, s) {
    const a = s.active;
    if (!a) return;
    if (a.type === 'power') car.hitPower = 1;
    if (a.type === 'spikes' && this.world.ball.attachedTo === car) this.release(car, false);
    s.active = null;
    s.timer = 8 + Math.random() * 3;
  }

  release(car, launch) {
    const ball = this.world.ball;
    if (ball.attachedTo !== car) return;
    ball.attachedTo = null;
    if (launch) {
      car.forward(_f);
      ball.vel.copy(car.vel).addScaledVector(_f, 950);
      ball.vel.y += 250;
    }
  }

  preStep(dt) {
    const w = this.world;
    const ball = w.ball;
    for (const car of w.cars) {
      const s = this.st(car);
      // using an item (edge triggered so holding the button doesn't repeat)
      const pressed = !!car.input.useItem && !s.prevUse;
      s.prevUse = !!car.input.useItem;
      if (car.demolished) { if (s.active) this.endActive(car, s); continue; }
      if (pressed) this.use(car);
      if (!s.item && !s.active) {
        s.timer -= dt;
        if (s.timer <= 0 && !ball.frozen) this.give(car, s);
      }
      if (s.item) s.held += dt;
      const a = s.active;
      if (!a) continue;
      a.t += dt;
      switch (a.type) {
        case 'grapple':
        case 'plunger': {
          if (a.phase === 'shoot') {
            _a.copy(ball.pos).sub(a.hook);
            const d = _a.length();
            const step = 6000 * dt;
            if (d <= step + R) {
              a.hook.copy(ball.pos);
              a.phase = 'pull';
              a.pullT = 0;
              w.events.push({ type: 'hooked', car, item: a.type, point: ball.pos.clone() });
            } else {
              a.hook.addScaledVector(_a, step / d);
            }
            if (a.t > 1.0 && a.phase === 'shoot') this.endActive(car, s);
          } else {
            a.pullT += dt;
            a.hook.copy(ball.pos);
            _a.copy(ball.pos).sub(car.pos);
            const d = _a.length();
            _a.divideScalar(Math.max(1, d));
            if (a.type === 'grapple') {
              car.vel.addScaledVector(_a, 5400 * dt);
              car.vel.y += GRAVITY * 0.6 * dt;
              car.noGround = 0.12;
              if (d < 230 || a.pullT > 2) this.endActive(car, s);
            } else {
              ball.vel.addScaledVector(_a, -6800 * dt);
              ball.vel.y += GRAVITY * 0.5 * dt;
              if (d < 380 || a.pullT > 1.8) this.endActive(car, s);
            }
          }
          break;
        }
        case 'tornado': {
          const rad = 1050;
          const swirl = (body, mass) => {
            _a.copy(body.pos).sub(car.pos);
            const h = Math.hypot(_a.x, _a.z);
            if (h > rad || body.pos.y > 2200) return false;
            const k = 1 - h / rad;
            _b.set(-_a.z, 0, _a.x).normalize(); // tangential
            body.vel.addScaledVector(_b, 2000 * k * dt * mass);
            body.vel.y += (GRAVITY + 900 * k + 150) * dt * mass;
            if (h > 1) body.vel.addScaledVector(_a.set(_a.x / h, 0, _a.z / h), -700 * k * dt * mass);
            return true;
          };
          if (!ball.attachedTo && ball.iceTimer <= 0) swirl(ball, 1);
          for (const o of w.cars) {
            if (o === car || o.demolished) continue;
            if (swirl(o, 0.85)) { o.noGround = 0.1; o.onGround = false; }
          }
          if (a.t > a.dur) this.endActive(car, s);
          break;
        }
        case 'spikes':
        case 'power':
          if (a.t > a.dur) this.endActive(car, s);
          break;
        default:
          break;
      }
    }

    // curveball: bend the ball's path toward the target goal
    if (this.curve && !ball.attachedTo && ball.iceTimer <= 0) {
      this.curve.t -= dt;
      const vh = Math.hypot(ball.vel.x, ball.vel.z);
      _a.set(-ball.pos.x, 0, attackZ(this.curve.team) - ball.pos.z).normalize();
      const cur = Math.atan2(ball.vel.x, ball.vel.z);
      const want = Math.atan2(_a.x, _a.z);
      let diff = want - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const turn = Math.sign(diff) * Math.min(Math.abs(diff), 2.2 * dt);
      const sp = Math.max(vh, 1500);
      ball.vel.x = Math.sin(cur + turn) * sp;
      ball.vel.z = Math.cos(cur + turn) * sp;
      if (this.curve.t <= 0) this.curve = null;
    }
  }

  // spikes: carry the ball on the car
  preBall() {
    const ball = this.world.ball;
    const car = ball.attachedTo;
    if (!car) return;
    const s = this.st(car);
    if (!s.active || s.active.type !== 'spikes' || car.demolished) { this.release(car, false); return; }
    ball.prevPos.copy(ball.pos);
    _a.copy(s.active.offset).applyQuaternion(car.quat);
    ball.pos.copy(car.pos).add(_a);
    ball.vel.copy(car.vel);
  }

  onTouch(car) {
    const ball = this.world.ball;
    if (ball.iceTimer > 0) ball.iceTimer = 0; // touching thaws the ball
    if (this.curve && this.curve.team !== car.team) this.curve = null;
    // another car knocks the ball off the spikes
    if (ball.attachedTo && ball.attachedTo !== car) this.release(ball.attachedTo, false);
    const s = this.st(car);
    if (s.active && s.active.type === 'spikes' && !ball.attachedTo) {
      _q.copy(car.quat).invert();
      const off = ball.pos.clone().sub(car.pos).applyQuaternion(_q);
      off.setLength(Math.max(off.length(), R + 52));
      s.active.offset = off;
      ball.attachedTo = car;
      ball.lastTouch = car;
    }
  }

  postStep() {
    // spiked ball comes off when its carrier flips or gets bumped
    const ball = this.world.ball;
    if (!ball.attachedTo) return;
    for (const e of this.world.events) {
      if (e.type === 'dodge' && e.car === ball.attachedTo) { this.release(e.car, true); break; }
      if (e.type === 'bump' && e.car === ball.attachedTo) { this.release(e.car, false); break; }
    }
  }

  // for HUD: item in hand, or the active effect and its remaining fraction
  status(car) {
    const s = this.st(car);
    if (s.active) {
      const a = s.active;
      const frac = a.dur ? Math.max(0, 1 - a.t / a.dur) : 1;
      return { item: a.type, active: true, frac };
    }
    if (s.item) return { item: s.item, active: false, frac: 1 };
    return { item: null, active: false, frac: 0, next: Math.max(0, s.timer) };
  }
}

export function createMode(world, name, pool) {
  if (name === 'heatseeker') return new Heatseeker(world);
  if (name === 'rumble') return new Rumble(world, pool);
  return null;
}

