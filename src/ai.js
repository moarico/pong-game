import * as THREE from 'three';
import { ARENA, BALL, CAR, GRAVITY } from './config.js';
import { wallDist2D } from './arena.js';

const DIFFICULTY = {
  rookie: { itemDelay: 2.5, replan: 0.32, aimError: 650, boost: 0.35, dodge: false, kickoffFlip: false, jumpReach: 200, aerial: false, maxSpeed: 1900, wrongSideCare: 0.4 },
  pro: { itemDelay: 1.0, replan: 0.14, aimError: 260, boost: 0.85, dodge: true, kickoffFlip: true, jumpReach: 420, aerial: false, maxSpeed: 2300, wrongSideCare: 0.8 },
  allstar: { itemDelay: 0.4, replan: 0.05, aimError: 90, boost: 1, dodge: true, kickoffFlip: true, jumpReach: 1300, aerial: true, maxSpeed: 2300, wrongSideCare: 1 },
};

const _f = new THREE.Vector3();
const _u = new THREE.Vector3();
const _l = new THREE.Vector3();
const _r = new THREE.Vector3();
const _d = new THREE.Vector3();
const _a = new THREE.Vector3();
const _t = new THREE.Vector3();
const _g = new THREE.Vector3(0, -GRAVITY, 0);
const _aim = new THREE.Vector3();

const R = BALL.radius;
const HZ = ARENA.halfZ;
const GW = ARENA.goalHalfW;

// time for a held single jump to raise the car by dh (or Infinity)
function jumpTime(dh) {
  if (dh <= 0) return 0;
  const a = (CAR.jumpHoldAccel - GRAVITY) / 2;
  if (dh <= 74.6) return (-CAR.jumpImpulse + Math.sqrt(CAR.jumpImpulse ** 2 + 4 * a * dh)) / (2 * a);
  const v = 453.3, h0 = 74.6;
  const disc = v * v - 4 * 325 * (dh - h0);
  if (disc < 0) return Infinity;
  return 0.2 + (v - Math.sqrt(disc)) / 650;
}
function doubleJumpTime(dh) {
  if (dh <= 96) return jumpTime(dh);
  const v = 712, h0 = 96;
  const disc = v * v - 4 * 325 * (dh - h0);
  if (disc < 0) return Infinity;
  return 0.25 + (v - Math.sqrt(disc)) / 650;
}

const CURV = [[0, 0.0069], [500, 0.00398], [1000, 0.00235], [1500, 0.001375], [1750, 0.0011], [2500, 0.00088]];
function curvature(speed) {
  for (let i = 1; i < CURV.length; i++) {
    if (speed <= CURV[i][0]) {
      const a = CURV[i - 1], b = CURV[i];
      return a[1] + ((b[1] - a[1]) * (speed - a[0])) / (b[0] - a[0]);
    }
  }
  return CURV[CURV.length - 1][1];
}

function travelTime(dist, v0, vmax, accel) {
  v0 = Math.max(0, Math.min(v0, vmax));
  const tAcc = (vmax - v0) / accel;
  const dAcc = ((v0 + vmax) / 2) * tAcc;
  if (dist <= dAcc) return (-v0 + Math.sqrt(v0 * v0 + 2 * accel * dist)) / accel;
  return tAcc + (dist - dAcc) / vmax;
}

export class Bot {
  constructor(car, difficulty = 'pro') {
    this.car = car;
    this.cfg = DIFFICULTY[difficulty] || DIFFICULTY.pro;
    this.replanT = Math.random() * 0.1;
    this.target = new THREE.Vector3();
    this.ballTarget = new THREE.Vector3();
    this.desiredSpeed = 2300;
    this.interceptT = 1;
    this.mode = 'chase';
    this.seq = null; // scripted inputs: [{t, jump, pitch, yaw, boost}]
    this.seqT = 0;
    this.stuckT = 0;
    this.reverseT = 0;
    this.aimOffset = (Math.random() - 0.5) * this.cfg.aimError;
    this.aerialing = false;
    this.lastJumpAt = -10;
    this.careT = 0;
    this.cares = true;
    this.retreatStart = -10;
  }

  get attackSign() { return this.car.team === 0 ? 1 : -1; }

  startSeq(steps) { this.seq = steps; this.seqT = 0; }

  // ctx: { world, pred, kickoff, teammates:[car], opponents:[car], time }
  // Rumble: decide whether to fire the power-up we are holding this frame
  wantItem(ctx) {
    const r = ctx.rumble;
    if (!r) return false;
    const s = r.st(this.car);
    if (!s.item || s.active || s.held < this.cfg.itemDelay) return false;
    const car = this.car;
    const ball = ctx.world.ball;
    const as = this.attackSign;
    const d = car.pos.distanceTo(ball.pos);
    car.forward(_f);
    _d.copy(ball.pos).sub(car.pos).normalize();
    const facing = _d.dot(_f);
    const ballToOurGoal = ball.vel.z * as < -500;
    let want = false;
    switch (s.item) {
      case 'grapple': want = d > 900 && d < 3800 && facing > 0.6 && ball.pos.y < 1500; break;
      case 'plunger': want = d > 900 && d < 3800 && (ballToOurGoal || ball.pos.z * as < -2500); break;
      case 'tornado': want = d < 700; break;
      case 'curveball': want = d < 4500 && ball.vel.z * as > 300 && ball.pos.z * as > -500; break;
      case 'spikes':
      case 'power': want = true; break;
      case 'boot': want = !!r.nearestOpponent(car, 2200); break;
      case 'freezer': want = ballToOurGoal && ball.pos.z * as < -1500 && d < 6000; break;
      default: break;
    }
    if (!want && s.held > 12) want = r.inRange(car, s.item);
    return want;
  }

  update(dt, ctx) {
    const car = this.car;
    const inp = car.input;
    if (car.demolished) return;
    // tap the power-up button (Rumble uses the press, not the hold)
    const fire = this.wantItem(ctx);
    inp.useItem = fire && !this.itemTap;
    this.itemTap = inp.useItem;
    this.replanT -= dt;
    if (this.replanT <= 0) {
      this.replanT = this.cfg.replan * (0.7 + Math.random() * 0.6);
      this.plan(ctx);
    }

    inp.throttle = 0; inp.steer = 0; inp.pitch = 0; inp.yaw = 0; inp.roll = 0;
    inp.boost = false; inp.powerslide = false;

    // scripted sequences (jumps, flips) take priority
    if (this.seq) {
      this.seqT += dt;
      let step = null;
      for (const s of this.seq) if (this.seqT >= s.t) step = s;
      if (!step || this.seqT > this.seq[this.seq.length - 1].t + 0.05 || (step.end && this.seqT >= step.t)) {
        this.seq = null;
      } else {
        inp.jump = !!step.jump;
        inp.pitch = step.pitch || 0;
        inp.yaw = step.yaw || 0;
        inp.steer = step.yaw || 0;
        inp.throttle = step.throttle ?? 1;
        inp.boost = !!step.boost && car.boost > 0;
        if (step.aerial) this.aerialControl(dt, ctx);
        return;
      }
    }
    inp.jump = false;

    if (!car.onGround) {
      if (car.turtled) {
        // tap jump to flip back over
        this.turtleTap = (this.turtleTap || 0) + 1;
        inp.jump = this.turtleTap % 8 < 4;
        return;
      }
      if (this.aerialing) this.aerialControl(dt, ctx);
      else this.recover();
      return;
    }
    this.aerialing = false;
    this.drive(dt, ctx);
  }

  plan(ctx) {
    const car = this.car;
    const ball = ctx.world.ball;
    const as = this.attackSign;
    const pred = ctx.pred;
    car.forward(_f);
    const speed = car.vel.length();
    const boostOk = car.boost > 8 && this.cfg.boost > 0.3;
    const vmax = boostOk ? Math.min(this.cfg.maxSpeed, 2200) : 1400;
    const accel = boostOk ? 1900 : 1000;

    // --- kickoff
    if (ctx.kickoff) {
      const taker = this.isClosest(ctx, ball.pos);
      if (taker) {
        this.mode = 'kickoff';
        this.target.copy(ball.pos).add(_t.set(0, 0, -as * 40));
        this.ballTarget.copy(ball.pos);
        this.desiredSpeed = 2300;
        return;
      }
      this.mode = 'support';
      this.setSupportTarget(ctx, true);
      return;
    }

    // --- find intercept
    const reach = this.cfg.jumpReach;
    let hit = null;
    let ownGoalDanger = null;
    for (let i = 2; i < pred.length; i += 2) {
      const s = pred[i];
      if (!ownGoalDanger && s.pos.z * as < -(HZ + R * 0.5) && Math.abs(s.pos.x) < GW + 100) ownGoalDanger = s;
      if (hit) continue;
      if (s.pos.y > reach + R) continue;
      this.shotDir(s.pos, ownGoalDanger || ctx.threatOwn, _a);
      _t.copy(s.pos).addScaledVector(_a, -(R + 70));
      _d.copy(_t).sub(car.pos).setY(0);
      const dist = _d.length();
      _d.normalize();
      const ang = Math.acos(THREE.MathUtils.clamp(_d.dot(_f.clone().setY(0).normalize()), -1, 1));
      const v0 = car.vel.dot(_d);
      let eta = travelTime(Math.max(0, dist - 60), v0, vmax, accel) + ang * 0.32;
      if (s.pos.y > 150) eta += 0.1;
      if (eta <= s.t + 0.02) { hit = s; break; }
    }
    if (!hit) hit = pred[pred.length - 1];
    this.interceptT = hit.t;
    this.ballTarget.copy(hit.pos);

    // --- role in the team
    let attacker = true;
    for (const mate of ctx.teammates) {
      if (mate === car || mate.demolished) continue;
      const theirs = mate.pos.distanceTo(hit.pos) / Math.max(800, mate.vel.length() * 0.8 + 600);
      const mine = car.pos.distanceTo(hit.pos) / Math.max(800, speed * 0.8 + 600);
      const mateBehind = (hit.pos.z - mate.pos.z) * as > 0;
      if (theirs + (mateBehind ? 0 : 0.6) < mine - 0.15) { attacker = false; break; }
    }

    // wrong side of the ball (between ball and opponent goal)?
    const ahead = (car.pos.z - hit.pos.z) * as;
    const ballOnOurHalf = hit.pos.z * as < 0;
    const danger = !!ownGoalDanger;

    if (danger && (ahead > -200 || attacker)) {
      // shadow back / save
      if (ahead > 300) {
        this.mode = 'retreat';
        this.setRetreatTarget(hit.pos);
        this.desiredSpeed = 2300;
        return;
      }
      this.mode = 'save';
      this.setHitTarget(hit, ownGoalDanger);
      return;
    }

    if (!attacker) {
      if (car.boost < 30 && Math.random() < this.cfg.boost && this.setBoostTarget(ctx)) { this.mode = 'boost'; return; }
      this.mode = 'support';
      this.setSupportTarget(ctx, false);
      return;
    }

    // wrong side: go around/back (with hysteresis so we don't flip-flop)
    this.careT -= this.cfg.replan;
    if (this.careT <= 0) { this.careT = 2; this.cares = Math.random() < this.cfg.wrongSideCare; }
    const stillRetreating = this.mode === 'retreat' && ahead > -150 && ctx.time - this.retreatStart < 3;
    if ((ahead > 250 && this.cares) || stillRetreating) {
      if (this.mode !== 'retreat') this.retreatStart = ctx.time;
      this.mode = 'retreat';
      if (ballOnOurHalf || ahead > 1500) this.setRetreatTarget(hit.pos);
      else this.target.set(hit.pos.x * 0.5 + (car.pos.x > hit.pos.x ? 900 : -900), 0, hit.pos.z - as * 1300);
      this.clampTarget();
      this.desiredSpeed = 2300;
      return;
    }

    if (car.boost < 15 && !ballOnOurHalf && hit.t > 2.2 && this.setBoostTarget(ctx)) { this.mode = 'boost'; return; }

    this.mode = 'attack';
    this.setHitTarget(hit, null);
  }

  aimPoint(ballPos, danger) {
    const as = this.attackSign;
    if (danger) {
      // clear it toward the side wall, away from our goal
      return _aim.set(ballPos.x >= 0 ? 4000 : -4000, 0, ballPos.z + as * 3000);
    }
    return _aim.set(THREE.MathUtils.clamp(ballPos.x * 0.25 + this.aimOffset, -GW + 150, GW - 150), 0, as * (HZ + 300));
  }

  // Shot direction from the ball, bent toward our approach direction when the
  // ideal line would need a long detour (or would put us behind a wall).
  shotDir(ballPos, danger, out) {
    const aim = this.aimPoint(ballPos, danger);
    out.copy(aim).sub(ballPos).setY(0).normalize();
    _l.copy(ballPos).sub(this.car.pos).setY(0);
    if (_l.lengthSq() < 1) return out;
    _l.normalize();
    const ang = Math.acos(THREE.MathUtils.clamp(out.dot(_l), -1, 1));
    const f = THREE.MathUtils.clamp((ang - 0.6) / 1.6, 0, 0.75);
    if (f > 0) out.lerp(_l, f).normalize();
    return out;
  }

  setHitTarget(hit, danger) {
    const car = this.car;
    this.shotDir(hit.pos, danger, _a);
    const dist = _t.copy(hit.pos).sub(car.pos).setY(0).length();
    // approach from behind the ball along the shot line, staying off the walls
    let back = THREE.MathUtils.clamp(dist * 0.45, R + 40, 1200);
    while (back > R + 40) {
      _t.copy(hit.pos).addScaledVector(_a, -back);
      if (wallDist2D(_t.x, _t.z) < -320 && Math.abs(_t.z) < HZ - 250) break;
      back -= 80;
    }
    back = Math.max(back, R + 40);
    this.target.copy(hit.pos).addScaledVector(_a, -back);
    this.target.y = 0;
    this.clampTarget();
    const travel = car.pos.distanceTo(this.target) + back;
    const timeLeft = Math.max(0.05, hit.t);
    const bouncing = hit.pos.y > 180;
    this.desiredSpeed = bouncing ? THREE.MathUtils.clamp(travel / timeLeft, 300, 2300) : 2300;
    // close to the ball but pointing the wrong way: slow down to turn tighter
    car.forward(_f);
    _f.setY(0).normalize();
    const misalign = Math.acos(THREE.MathUtils.clamp(_f.dot(_a), -1, 1));
    if (dist < 1100 && misalign > 0.6 && !danger) this.desiredSpeed = Math.min(this.desiredSpeed, 700 + (1100 - Math.min(1100, misalign * 500)));
  }

  setRetreatTarget(ballPos) {
    const as = this.attackSign;
    // back post on the far side from the ball
    const x = ballPos.x > 0 ? -GW * 0.8 : GW * 0.8;
    this.target.set(x, 0, -as * (HZ - 350));
  }

  setSupportTarget(ctx, kickoff) {
    const car = this.car;
    const ball = ctx.world.ball;
    const as = this.attackSign;
    const idx = ctx.teammates.indexOf(car);
    const side = idx % 2 === 0 ? -1 : 1;
    if (kickoff) {
      if (car.boost < 60 && Math.abs(car.pos.x) > 1000) {
        this.target.set(Math.sign(car.pos.x) * 3072, 0, -as * 4096);
      } else {
        this.target.set(0, 0, -as * (HZ - 500));
      }
    } else {
      const z = ball.pos.z - as * (2200 + idx * 900);
      this.target.set(ball.pos.x * 0.35 + side * 1100, 0, Math.max(-HZ + 400, Math.min(HZ - 400, z * as)) * as);
    }
    this.clampTarget();
    const d = car.pos.distanceTo(this.target);
    this.desiredSpeed = d > 1500 ? 2300 : d > 400 ? 1400 : 300;
  }

  setBoostTarget(ctx) {
    const car = this.car;
    const as = this.attackSign;
    let best = null, bestD = Infinity;
    for (const p of ctx.world.pads) {
      if (!p.big || !p.active) continue;
      if (p.z * as > 1500) continue; // stay out of the opponent's corners
      const d = Math.hypot(p.x - car.pos.x, p.z - car.pos.z);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (!best || bestD > 4500) return false;
    this.target.set(best.x, 0, best.z);
    this.desiredSpeed = 2300;
    return true;
  }

  clampTarget() {
    this.target.x = THREE.MathUtils.clamp(this.target.x, -ARENA.halfX + 250, ARENA.halfX - 250);
    this.target.z = THREE.MathUtils.clamp(this.target.z, -HZ + 150, HZ - 150);
  }

  isClosest(ctx, p) {
    const my = this.car.pos.distanceTo(p);
    for (const m of ctx.teammates) {
      if (m === this.car) continue;
      const d = m.pos.distanceTo(p);
      if (d < my - 5 || (Math.abs(d - my) <= 5 && m.pos.x * this.attackSign < this.car.pos.x * this.attackSign)) return false;
    }
    return true;
  }

  drive(dt, ctx) {
    const car = this.car;
    const inp = car.input;
    const n = car.groundNormal;
    car.forward(_f);
    _r.crossVectors(_f, n).normalize();
    const speed = car.vel.length();
    const fwdSpeed = car.vel.dot(_f);
    const ball = ctx.world.ball;

    // carrying the ball on spikes: drive at their goal and flip to shoot it off
    if (ball.attachedTo === car) {
      _t.set(0, 0, this.attackSign * (HZ - 300));
      _d.copy(_t).sub(car.pos);
      _d.addScaledVector(n, -_d.dot(n));
      const a2 = Math.atan2(_d.dot(_r), _d.dot(_f));
      inp.throttle = 1;
      inp.steer = THREE.MathUtils.clamp(a2 * 3, -1, 1);
      inp.boost = Math.abs(a2) < 0.4 && car.boost > 0;
      if (_d.length() < 2600 && Math.abs(a2) < 0.3 && ctx.time - this.lastJumpAt > 1.2) {
        this.lastJumpAt = ctx.time;
        this.startSeq([{ t: 0, jump: true }, { t: 0.06, jump: false }, { t: 0.09, jump: true, pitch: -1 }, { t: 0.19, jump: false, end: true }]);
      }
      return;
    }

    // when close to the ball, steer straight through it toward the aim point
    let tgt = this.target;
    const ballDist = car.pos.distanceTo(ball.pos);
    if ((this.mode === 'attack' || this.mode === 'save' || this.mode === 'kickoff') && ballDist < 650 && ball.pos.y < 260) {
      this.shotDir(ball.pos, this.mode === 'save', _a);
      _t.copy(ball.pos).addScaledVector(_a, -(R * 0.6));
      // only if we are roughly behind the ball
      _d.copy(ball.pos).sub(car.pos).setY(0).normalize();
      if (_d.dot(_a) > 0.2) tgt = _t;
    }

    // inside a goal: leave through the mouth first
    if (Math.abs(car.pos.z) > HZ - 60 && (Math.abs(tgt.x) > GW - 100 || Math.abs(tgt.z) < HZ - 200)) {
      const gz = Math.sign(car.pos.z);
      if (Math.abs(car.pos.z) > HZ + 60 || Math.abs(car.pos.x) > GW - 80) {
        tgt = _t.set(THREE.MathUtils.clamp(tgt.x, -GW + 250, GW - 250), 0, gz * (HZ - 500));
      }
    }

    _d.copy(tgt).sub(car.pos);
    _d.addScaledVector(n, -_d.dot(n));
    const dist = _d.length();
    const ang = Math.atan2(_d.dot(_r), _d.dot(_f));

    let steer = THREE.MathUtils.clamp(ang * 3.2, -1, 1);
    let throttle = 1;
    let powerslide = Math.abs(ang) > 1.6 && speed > 500;
    let want = this.desiredSpeed;
    if (this.mode === 'support' || this.mode === 'boost') want = Math.min(want, dist > 1200 ? 2300 : Math.max(300, dist * 1.2));
    // target inside our turning circle: slow down instead of orbiting it
    const turnR = 1 / curvature(Math.max(fwdSpeed, 0));
    if (Math.abs(ang) > 0.3 && dist < 2 * turnR * Math.sin(Math.min(Math.abs(ang), Math.PI / 2)) * 1.05) {
      want = Math.min(want, Math.max(250, fwdSpeed * 0.5));
      if (Math.abs(ang) > 1.0) powerslide = speed > 350;
    }
    if (fwdSpeed > want + 250) throttle = fwdSpeed > want + 600 ? -1 : 0;

    // stuck against something
    if (this.reverseT > 0) {
      this.reverseT -= dt;
      inp.throttle = -1;
      inp.steer = -steer;
      return;
    }
    if (speed < 120 && throttle > 0) {
      this.stuckT += dt;
      if (this.stuckT > 1.2) { this.reverseT = 0.8; this.stuckT = 0; }
    } else this.stuckT = 0;

    let boost = false;
    if (car.boost > 0 && Math.abs(ang) < 0.3 && fwdSpeed < Math.min(this.cfg.maxSpeed, want) - 80 && dist > 400) {
      const keep = this.mode === 'kickoff' || this.mode === 'save' || this.mode === 'retreat' ? 0 : this.cfg.boost < 1 ? 20 : 8;
      boost = car.boost > keep && Math.random() < this.cfg.boost + 0.1;
    }
    if (fwdSpeed > this.cfg.maxSpeed - 50) boost = false;

    inp.throttle = throttle;
    inp.steer = steer;
    inp.powerslide = powerslide;
    inp.boost = boost;

    // kickoff flip
    if (this.mode === 'kickoff' && this.cfg.kickoffFlip && ballDist < 520 + speed * 0.12 && speed > 1100 && Math.abs(ang) < 0.25) {
      this.startSeq([{ t: 0, jump: true, boost: true }, { t: 0.07, jump: false, boost: true }, { t: 0.1, jump: true, pitch: -1, yaw: THREE.MathUtils.clamp(ang * 2, -0.4, 0.4) }, { t: 0.2, jump: false, pitch: -1, end: true }]);
      return;
    }

    // jumps for the ball
    const now = ctx.time;
    if (now - this.lastJumpAt < 1.2) return;
    const bh = ball.pos.y;
    _d.copy(ball.pos).sub(car.pos);
    const horiz = Math.hypot(_d.x, _d.z);
    const relV = car.vel.clone().sub(ball.vel);
    const closing = Math.max(1, relV.dot(_d.clone().setY(0).normalize()));
    const tContact = Math.max(0, horiz - 110) / closing;
    const facing = _d.clone().setY(0).normalize().dot(_f.clone().setY(0).normalize());

    if (this.cfg.dodge && bh < 220 && horiz < 360 && facing > 0.85 && speed > 600 && tContact < 0.2 && (this.mode === 'attack' || this.mode === 'save')) {
      // flip into the ball for a powerful shot
      const side = THREE.MathUtils.clamp(_d.dot(_r) / 120, -0.6, 0.6);
      this.lastJumpAt = now;
      this.startSeq([{ t: 0, jump: true }, { t: 0.06, jump: false }, { t: 0.09, jump: true, pitch: -1, yaw: side }, { t: 0.19, jump: false, pitch: -0.4, end: true }]);
      return;
    }
    if (bh > 190 && bh < this.cfg.jumpReach + 100 && facing > 0.8 && horiz < 1400) {
      const dh = bh - 110;
      const single = dh < 230;
      const tj = single ? jumpTime(dh) : doubleJumpTime(dh);
      const ballFall = ball.vel.y < 0 ? (bh - 110 - R) / Math.max(1, -ball.vel.y) : Infinity;
      const tReach = Math.min(tContact, ballFall + 0.3);
      if (Number.isFinite(tj) && Math.abs(tReach - tj) < 0.06 && (single || this.cfg.jumpReach > 350)) {
        this.lastJumpAt = now;
        if (single) {
          this.startSeq([{ t: 0, jump: true }, { t: Math.min(0.2, tj), jump: true }, { t: tj + 0.02, jump: false, end: true }]);
        } else if (this.cfg.aerial && dh > 520) {
          this.aerialing = true;
          this.startSeq([{ t: 0, jump: true, aerial: true }, { t: 0.2, jump: false, aerial: true }, { t: 0.24, jump: true, aerial: true, boost: true }, { t: 0.3, jump: false, aerial: true, boost: true, end: true }]);
        } else {
          this.startSeq([{ t: 0, jump: true }, { t: 0.2, jump: false }, { t: 0.24, jump: true }, { t: 0.3, jump: false, end: true }]);
        }
      }
    } else if (this.cfg.aerial && bh > 520 && bh < 1500 && facing > 0.9 && horiz < 1500 && car.boost > 30 && speed > 400) {
      // fast aerial when the ball arrives roughly when we could
      const ballEta = this.interceptT;
      const need = (bh - 120) / 600 + 0.3;
      if (Math.abs(ballEta - need) < 0.25 && this.ballTarget.y > 450) {
        this.lastJumpAt = now;
        this.aerialing = true;
        this.startSeq([{ t: 0, jump: true, aerial: true, boost: true }, { t: 0.2, jump: false, aerial: true, boost: true }, { t: 0.24, jump: true, aerial: true, boost: true }, { t: 0.3, jump: false, aerial: true, boost: true, end: true }]);
      }
    }
  }

  // point the nose at a target direction (PD on pitch / yaw, keep wheels down via roll)
  orient(dir, upHint) {
    const car = this.car;
    const inp = car.input;
    car.forward(_f); car.up(_u); car.left(_l);
    _r.copy(_l).negate();
    const w = car.angVel;
    const pitchErr = Math.atan2(dir.dot(_u), dir.dot(_f));
    const yawErr = Math.atan2(dir.dot(_r), dir.dot(_f));
    const wP = w.dot(_r), wY = -w.dot(_u), wR = w.dot(_f);
    inp.pitch = THREE.MathUtils.clamp(pitchErr * 3.5 - wP * 0.55, -1, 1);
    inp.yaw = THREE.MathUtils.clamp(yawErr * 3.5 - wY * 0.55, -1, 1);
    const rollErr = Math.atan2(_l.dot(upHint), _u.dot(upHint)); // >0: left side high -> roll right
    inp.roll = THREE.MathUtils.clamp(rollErr * 2.5 - wR * 0.4, -1, 1);
    inp.steer = inp.yaw;
    inp.powerslide = false;
  }

  aerialControl(dt, ctx) {
    const car = this.car;
    const inp = car.input;
    const ball = ctx.world.ball;
    // target the ball's predicted position at a time we can reach
    const pred = ctx.pred;
    let s = pred[pred.length - 1];
    for (let i = 1; i < pred.length; i++) {
      const p = pred[i];
      const d = p.pos.distanceTo(car.pos) - R - 40;
      const v = car.vel.length();
      if (d / Math.max(900, v + 500 * p.t) <= p.t) { s = p; break; }
    }
    const t = Math.max(0.1, s.t);
    // required average acceleration (beyond gravity)
    _a.copy(s.pos).sub(car.pos).addScaledVector(car.vel, -t).multiplyScalar(2 / (t * t)).sub(_g);
    const need = _a.length();
    if (need > 1500 || car.boost <= 0 || car.pos.distanceTo(ball.pos) < R + 60) {
      if (need > 1500 && !this.seq) this.aerialing = false;
    }
    _d.copy(_a).normalize();
    this.orient(_d, _t.set(0, 1, 0));
    car.forward(_f);
    inp.boost = car.boost > 0 && _f.dot(_d) > 0.75 && need > 250;
    inp.throttle = 1;
  }

  recover() {
    const car = this.car;
    const inp = car.input;
    _d.set(car.vel.x, 0, car.vel.z);
    if (_d.lengthSq() < 100) { car.forward(_d); _d.y = 0; }
    _d.normalize();
    // land wheels-down, nose along travel
    this.orient(_d, _t.set(0, 1, 0));
    inp.throttle = 1;
    inp.boost = false;
  }
}
