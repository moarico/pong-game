import * as THREE from 'three';
import { DIM, SAYA_DIR } from './figure.js';
import { groundHeight } from './ground.js';

// A damped spring toward target, taken in steps of at most 1/120 s so it stays
// stable however long the frame (a slow phone, a hitch). Returns [x, v].
const _sp = [0, 0];
function springTo(x, v, target, k, c, dt) {
  const n = Math.max(1, Math.ceil(dt * 120 - 1e-6));
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    v += ((target - x) * k - v * c) * h;
    x += v * h;
  }
  _sp[0] = x;
  _sp[1] = v;
  return _sp;
}

// ---------------------------------------------------------------------------
// Procedural animation for any figure.
//
// Locomotion plants each foot in the world while it bears weight (no skating),
// lifts it by the gait phase and swings it to where the hip will be when it
// lands. The pelvis rides smooth bob/sway curves, held within the legs' reach
// by a soft minimum (no kinks), so a run is as smooth as a walk. Arms, sword
// and torso blend continuously between carry, run, guard and air poses, and
// any action (an attack, a stagger, a fall) layers its own channels on top.
// All IK runs in the character's root space, in body units.
// ---------------------------------------------------------------------------

const TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const lerpAngle = (a, b, t) => a + wrapAngle(b - a) * t;
// Polynomial smooth minimum: C1-continuous, so constraints never kink the motion.
const smin = (a, b, k) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return lerp(b, a, h) - k * h * (1 - h);
};

const REACH = (DIM.THIGH + DIM.SHIN) * 0.998;

// Critically damped spring, integrated implicitly: stable at any frame time.
function spring(o, x, v, target, omega, dt) {
  const f = 1 + 2 * dt * omega;
  const oo = omega * omega;
  const hoo = dt * oo;
  const hhoo = dt * hoo;
  const det = 1 / (f + hhoo);
  const nx = (f * o[x] + dt * o[v] + hhoo * target) * det;
  o[v] = (o[v] + hoo * (target - o[x])) * det;
  o[x] = nx;
}

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _d = new THREE.Vector3();
const _p = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _e = new THREE.Vector3();
const _f = new THREE.Vector3();
const _u = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _q3 = new THREE.Quaternion();
const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();
const _eul = new THREE.Euler();
const _mid = new THREE.Vector3();
const _pp = new THREE.Vector3();
const _knee = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _X = new THREE.Vector3(1, 0, 0);
const _Y = new THREE.Vector3(0, 1, 0);
const _Z = new THREE.Vector3(0, 0, 1);

// Orientation whose +Z is `fwd` and whose +Y leans toward `upHint`.
export function lookQuat(fwd, upHint, out) {
  _z.copy(fwd).normalize();
  _y.copy(upHint).addScaledVector(_z, -upHint.dot(_z));
  if (_y.lengthSq() < 1e-8) _y.set(0, 1, 0).addScaledVector(_z, -_z.y);
  if (_y.lengthSq() < 1e-8) _y.set(1, 0, 0);
  _y.normalize();
  _x.crossVectors(_y, _z);
  _m.makeBasis(_x, _y, _z);
  return out.setFromRotationMatrix(_m);
}

// Two-bone IK. S: upper joint, T: target, a/b: bone lengths, pole: where the
// middle joint should point. knee: the lower bone folds back (legs) rather than
// forward (arms). Writes the upper bone's orientation (bones hang along -Y) and
// returns the fold angle; the middle joint lands in `mid`.
function twoBone(S, T, a, b, pole, knee, qOut, mid) {
  _d.subVectors(T, S);
  let dist = _d.length();
  _d.multiplyScalar(1 / Math.max(dist, 1e-6));
  dist = clamp(dist, Math.abs(a - b) + 1e-3, (a + b) * 0.9999);
  const cosA = clamp((a * a + dist * dist - b * b) / (2 * a * dist), -1, 1);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  _pp.copy(pole).addScaledVector(_d, -pole.dot(_d));
  if (_pp.lengthSq() < 1e-10) _pp.set(0, 0, 1).addScaledVector(_d, -_d.z);
  _pp.normalize();
  mid.copy(S).addScaledVector(_d, a * cosA).addScaledVector(_pp, a * sinA);
  _y.subVectors(S, mid).normalize();
  _z.copy(_pp).multiplyScalar(knee ? 1 : -1);
  _z.addScaledVector(_y, -_z.dot(_y)).normalize();
  _x.crossVectors(_y, _z);
  _m.makeBasis(_x, _y, _z);
  qOut.setFromRotationMatrix(_m);
  _e.copy(S).addScaledVector(_d, dist);
  _f.subVectors(_e, mid).normalize();
  _u.subVectors(mid, S).normalize();
  return Math.acos(clamp(_u.dot(_f), -1, 1));
}

// Pose channels in root space. Locomotion fills one; actions fill another.
export function makePose() {
  return {
    grip: new THREE.Vector3(),
    swordQ: new THREE.Quaternion(),
    twoHand: 0,
    left: new THREE.Vector3(),
    leftQ: new THREE.Quaternion(),
    leftGrip: 0, // left hand holding something (scabbard, handle) vs hanging free
    poleR: new THREE.Vector3(),
    poleL: new THREE.Vector3(),
  };
}

function copyPose(dst, src) {
  dst.grip.copy(src.grip);
  dst.swordQ.copy(src.swordQ);
  dst.twoHand = src.twoHand;
  dst.left.copy(src.left);
  dst.leftQ.copy(src.leftQ);
  dst.leftGrip = src.leftGrip;
  dst.poleR.copy(src.poleR);
  dst.poleL.copy(src.poleL);
}

export function blendPose(dst, src, t) {
  if (t <= 0) return;
  dst.grip.lerp(src.grip, t);
  dst.swordQ.slerp(src.swordQ, t);
  dst.twoHand = lerp(dst.twoHand, src.twoHand, t);
  dst.left.lerp(src.left, t);
  dst.leftQ.slerp(src.leftQ, t);
  dst.leftGrip = lerp(dst.leftGrip, src.leftGrip, t);
  dst.poleR.lerp(src.poleR, t).normalize();
  dst.poleL.lerp(src.poleL, t).normalize();
}

// Carry poses of the drawn sword (root space, body units).
function swordPose(out, gx, gy, gz, dx, dy, dz, ux = 0, uy = 1, uz = 0) {
  out.grip.set(gx, gy, gz);
  lookQuat(_v.set(dx, dy, dz), _w.set(ux, uy, uz), out.swordQ);
  return out;
}

function newFoot(side) {
  return {
    side,
    mode: 'plant',
    plant: new THREE.Vector3(),
    yaw: 0,
    liftPos: new THREE.Vector3(),
    liftYaw: 0,
    liftPitch: 0,
    liftPhase: 0,
    target: new THREE.Vector3(),
    targetYaw: 0,
    s: 0,
    stanceAge: 0,
    need: false,
    p: 0,
    ankle: new THREE.Vector3(), // world
    pitch: 0,
    outYaw: 0,
    airRel: new THREE.Vector3(), // root-space ankle while airborne
    airStart: new THREE.Vector3(),
    landOff: new THREE.Vector3(),
  };
}

export class Animator {
  constructor(fig, { guardStance = null } = {}) {
    this.fig = fig;
    this.b = fig.bones;
    this.scale = fig.scale;
    this.time = Math.random() * 10;
    this.phase = 0;
    this.speed = 0;
    this.moveW = 0;
    this.runW = 0;
    this.airW = 0;
    this.airT = 0;
    this.fwdness = 1;
    this.feet = [newFoot(1), newFoot(-1)];
    this.ready = false;
    this.wasGrounded = true;
    this.wasMoving = false;
    this.liftNow = -1;
    this.cphase = 0;
    this.phaseAdv = 0;
    this.pelvisH = DIM.HIP_Y;
    this.pelvisV = 0;
    this.bob = 0;
    this.sway = 0;
    this.swingR = 0;
    this.swingL = 0;
    this.squash = 0;
    this.squashV = 0;
    this.lean = 0;
    this.bank = 0;
    this.accel = 0;
    this.prevFwd = 0;
    this.prevYaw = null;
    this.yawRate = 0;
    this.hatTilt = 0;
    this.hatV = 0;
    this.headYaw = 0;
    this.headPitch = 0;
    this.swordLag = 0;
    this.swordLagV = 0;
    this.sayaSwing = 0;
    this.sayaV = 0;
    this.tail = new THREE.Vector2();
    this.tailV = new THREE.Vector2();
    this.guardW = 0;
    this.v0 = 8.3;
    this.base = makePose();
    this.tmpPose = makePose();
    this.out = makePose();
    this.guardStance = guardStance || [[0.13, -0.11], [-0.1, 0.15]];
    this.relaxStance = [[0.105, 0.03], [-0.105, -0.025]];
    // Scratch for root-space working.
    this.rootQ = new THREE.Quaternion();
    this.rootQi = new THREE.Quaternion();
    this.hipsQ = new THREE.Quaternion();
    this.parentQ = new THREE.Quaternion();
    this.jointP = new THREE.Vector3();
    this.limbQ = new THREE.Quaternion();
    // Exposed for gameplay (world space, updated every frame).
    this.gripWorld = new THREE.Vector3();
    this.tipWorld = new THREE.Vector3();
    this.headWorld = new THREE.Vector3();
    this.chestWorld = new THREE.Vector3();
  }

  toLocal(world, out) {
    out.subVectors(world, this.fig.root.position).applyQuaternion(this.rootQi).multiplyScalar(1 / this.scale);
    return out;
  }

  toWorld(local, out) {
    out.copy(local).multiplyScalar(this.scale).applyQuaternion(this.rootQ).add(this.fig.root.position);
    return out;
  }

  // Neutral (standing) foot positions in root space for the current stance.
  neutral(i, act, out) {
    const r = this.relaxStance[i];
    const g = this.guardStance[i];
    let x = lerp(r[0], g[0], this.guardW);
    let z = lerp(r[1], g[1], this.guardW);
    if (act && act.stanceW > 0) {
      x = lerp(x, act.stance[i][0], act.stanceW);
      z = lerp(z, act.stance[i][1], act.stanceW);
    }
    return out.set(x, 0, z);
  }

  // c: { pos, yaw, vel, grounded, landed, landSpeed, jumped, guard, action, lookAt }
  update(dt, c) {
    const b = this.b;
    const s = this.scale;
    const root = this.fig.root;
    this.time += dt;
    const t = this.time;
    const act = c.action || null;

    root.position.copy(c.pos);
    root.rotation.set(0, c.yaw, 0);
    this.rootQ.setFromAxisAngle(_Y, c.yaw);
    this.rootQi.copy(this.rootQ).invert();
    const fx = Math.sin(c.yaw);
    const fz = Math.cos(c.yaw);

    // -------------------------------------------------------------------
    // Gait blend weights.
    // -------------------------------------------------------------------
    const hs = Math.hypot(c.vel.x, c.vel.z);
    this.speed = damp(this.speed, hs, 12, dt);
    const v = this.speed / s;
    this.moveW = damp(this.moveW, smoothstep(0.08, 0.7, v), 8, dt);
    this.runW = damp(this.runW, smoothstep(2.3, 4.6, v), 5, dt);
    this.airW = damp(this.airW, c.grounded ? 0 : 1, c.grounded ? 18 : 12, dt);
    this.airArmW = damp(this.airArmW || 0, c.grounded ? 0 : 1, 8, dt);
    this.guardW = damp(this.guardW, c.guard ? 1 : 0, 4, dt);
    const moveW = this.moveW;
    const runW = this.runW;
    const airW = this.airW;
    // Walking backwards rolls the feet toe-to-heel instead.
    const fwdV = c.vel.x * fx + c.vel.z * fz;
    this.fwdness = damp(this.fwdness, hs > 0.2 ? clamp(fwdV / hs, -1, 1) : 1, 6, dt);

    if (this.prevYaw === null) this.prevYaw = c.yaw;
    const yr = wrapAngle(c.yaw - this.prevYaw) / Math.max(dt, 1e-4);
    this.prevYaw = c.yaw;
    this.yawRate = damp(this.yawRate, clamp(yr, -12, 12), 10, dt);
    const acc = (fwdV - this.prevFwd) / Math.max(dt, 1e-4);
    this.prevFwd = fwdV;
    this.accel = damp(this.accel, clamp(acc, -20, 20), 7, dt);

    if (!this.ready) this.reset(c);

    // -------------------------------------------------------------------
    // Air and landing.
    // -------------------------------------------------------------------
    if (c.jumped) {
      this.airT = 0;
      this.squashV += 0.6;
    }
    if (!c.grounded && this.wasGrounded) {
      for (const f of this.feet) {
        f.mode = 'air';
        this.toLocal(f.ankle, f.airStart);
        f.airRel.copy(f.airStart);
      }
      this.airT = 0;
    }
    if (!c.grounded) this.airT += dt;
    if (c.grounded && !this.wasGrounded) {
      for (const f of this.feet) {
        f.mode = 'plant';
        f.plant.set(f.ankle.x, groundHeight(f.ankle.x, f.ankle.z), f.ankle.z);
        f.yaw = f.outYaw;
        f.stanceAge = 0;
        // The foot was a hand's breadth up; settle it rather than snap it down.
        this.ankleFrom(f.plant, f.yaw, 0, _v);
        f.landOff.subVectors(f.ankle, _v);
      }
      this.squashV -= clamp(c.landSpeed || 0, 0, 14) * 0.42;
    }
    this.wasGrounded = c.grounded;
    for (let i = 0; i < 4; i++) {
      const h = dt / 4;
      const k = 150;
      const cc = 2 * Math.sqrt(k) * 0.55;
      this.squashV += (-k * this.squash - cc * this.squashV) * h;
      this.squash += this.squashV * h;
    }
    this.squash = clamp(this.squash, -0.3, 0.1);

    // -------------------------------------------------------------------
    // Feet.
    // -------------------------------------------------------------------
    const vRaw = hs / s;
    this.phaseAdv = 0;
    const stepRate = clamp(1.7 + 0.36 * Math.max(v, vRaw), 1.7, 4.4);
    let cyc = stepRate / 2;
    const duty = lerp(0.64, 0.3, runW) - 0.04 * smoothstep(5.5, 8, v);
    const moving = v > 0.1;
    const slide = act && act.slide > 0.5;
    if (c.grounded && !slide) {
      // Standing still: step whenever a foot has drifted from the stance (turning
      // on the spot, changing stance, coming to a stop).
      let anySwing = false;
      let anyNeed = false;
      for (let i = 0; i < 2; i++) {
        const f = this.feet[i];
        if (f.mode === 'swing') anySwing = true;
        f.need = false;
        if (f.mode === 'plant' && !moving) {
          this.neutral(i, act, _v);
          this.toWorld(_v, _w);
          const err = Math.hypot(_w.x - f.plant.x, _w.z - f.plant.z) / s;
          const yawErr = Math.abs(wrapAngle(f.yaw - c.yaw));
          f.need = err > 0.1 || yawErr > 0.55;
          if (f.need) anyNeed = true;
        }
      }
      if (!moving && anyNeed && !anySwing) {
        // Start the step at once rather than waiting for the phase to come round.
        const i = this.feet[0].need ? 0 : 1;
        const p = (this.phase + i * 0.5) % 1;
        if (p < duty || p > 0.8) this.phase = (duty + 0.01 - i * 0.5 + 1) % 1;
      }
      // Setting off from a standstill: the trailing foot steps at once.
      if (moving && !this.wasMoving && !anySwing) {
        const i = this.trailingFoot(c);
        this.phase = (duty + 0.005 - i * 0.5 + 2) % 1;
      }
      // A foot left too far behind (a burst of speed, a shove) lifts right away and
      // the gait phase re-syncs to it, rather than the hips sinking to reach it.
      if (moving) {
        const vl = Math.max(hs, 1e-3);
        const maxBack = lerp(0.44, 0.6, runW) * s;
        for (let i = 0; i < 2; i++) {
          const f = this.feet[i];
          const o = this.feet[1 - i];
          if (f.mode !== 'plant' || f.stanceAge < 0.06) continue;
          const back = -((f.plant.x - c.pos.x) * c.vel.x + (f.plant.z - c.pos.z) * c.vel.z) / vl;
          const p = (this.phase + i * 0.5) % 1;
          if (p >= duty) continue;
          if ((o.mode === 'plant' && back > maxBack * 1.08) || back > maxBack * 1.35) {
            this.phase = (duty + 0.002 - i * 0.5 + 2) % 1;
            this.liftNow = i;
          }
        }
      }
      this.wasMoving = moving;
      if (moving || anySwing || anyNeed) {
        if (!moving) cyc = Math.max(cyc, 1.3);
        this.phase = (this.phase + cyc * dt) % 1;
        this.phaseAdv = cyc * dt;
      }
      for (let i = 0; i < 2; i++) {
        const f = this.feet[i];
        const p = (this.phase + i * 0.5) % 1;
        f.p = p;
        if (f.mode === 'plant') {
          f.stanceAge += dt;
          const forced = this.liftNow === i;
          // Never lift a foot that is still out in front while moving.
          const ahead = moving && ((f.plant.x - c.pos.x) * c.vel.x + (f.plant.z - c.pos.z) * c.vel.z) / Math.max(hs, 1e-3) > 0.12 * s;
          if (forced || (p >= duty && p < 0.9 && f.stanceAge > 0.08 && (moving || f.need) && !ahead)) {
            if (forced) this.liftNow = -1;
            f.mode = 'swing';
            f.liftPos.copy(f.plant);
            f.liftYaw = f.yaw;
            f.liftPitch = f.pitch;
            f.liftPhase = p;
            f.lastP = p;
            f.wrapped = false;
            f.s = 0;
          }
        }
        if (f.mode === 'swing') {
          // Progress eases toward landing when the phase comes round, so a
          // re-synced phase bends the swing's timing instead of popping it.
          if (p < f.lastP - 0.5) f.wrapped = true;
          f.lastP = p;
          const tRem = f.wrapped ? 0 : (1 - p) / cyc;
          const inc = tRem <= dt ? 1 - f.s : ((1 - f.s) * dt) / tRem;
          f.s = Math.min(1, f.s + Math.min(inc, dt / 0.12));
          this.swingTarget(i, f, c, act, cyc, duty, Math.max(tRem, (1 - f.s) * 0.12));
          if (f.s >= 1) {
            f.mode = 'plant';
            f.plant.copy(f.target);
            f.yaw = f.targetYaw;
            f.stanceAge = 0;
          }
        }
      }
    } else if (c.grounded && slide) {
      // Skidding (dodges): feet stay down but slide with the body.
      for (let i = 0; i < 2; i++) {
        const f = this.feet[i];
        if (f.mode !== 'plant') {
          f.mode = 'plant';
          f.plant.set(f.ankle.x, 0, f.ankle.z);
          f.stanceAge = 0;
        }
        this.neutral(i, act, _v);
        this.toWorld(_v, _w);
        f.plant.x = damp(f.plant.x, _w.x, 14, dt);
        f.plant.z = damp(f.plant.z, _w.z, 14, dt);
        f.yaw = lerpAngle(f.yaw, c.yaw, 1 - Math.exp(-10 * dt));
      }
    }

    // Foot poses.
    const heelMax = lerp(0.24, 0.12, runW);
    const toeMax = lerp(0.6, 0.95, runW);
    const fw = this.fwdness;
    for (let i = 0; i < 2; i++) {
      const f = this.feet[i];
      if (f.mode === 'plant') {
        f.plant.y = groundHeight(f.plant.x, f.plant.z);
        const q = clamp(f.p / duty, 0, 1);
        const roll = heelMax * (1 - smoothstep(0, 0.22, q)) - toeMax * smoothstep(0.55, 1, q);
        f.pitch = damp(f.pitch, moveW * roll * fw, 30, dt);
        f.outYaw = f.yaw;
        this.ankleFrom(f.plant, f.outYaw, f.pitch, f.ankle);
        f.landOff.multiplyScalar(Math.exp(-22 * dt));
        f.ankle.add(f.landOff);
      } else if (f.mode === 'swing') {
        const h = f.s * f.s * (3 - 2 * f.s);
        _v.lerpVectors(f.liftPos, f.target, h);
        const dist = Math.hypot(f.target.x - f.liftPos.x, f.target.z - f.liftPos.z) / s;
        const liftH = lerp(0.075, 0.19, runW) * clamp(dist / 0.4, 0.35, 1);
        // Lift and set down softly (zero vertical speed at both ends, bar a light touch).
        const sn = Math.sin(Math.PI * f.s);
        const ks = Math.sin(Math.PI * Math.min(1, f.s * 1.5));
        const kick = runW * 0.2 * ks * ks * (1 - f.s);
        _v.y = groundHeight(_v.x, _v.z) + (liftH * (0.8 * sn * sn + 0.2 * sn) + kick) * s;
        f.pitch = lerp(f.liftPitch, heelMax * moveW * fw, smoothstep(0.15, 0.9, f.s)) - runW * 0.55 * sn * sn;
        f.outYaw = lerpAngle(f.liftYaw, f.targetYaw, h);
        this.ankleFrom(_v, f.outYaw, f.pitch, f.ankle);
        // Off the ground the foot turns about the ankle, not about heel or toe.
        const free = smoothstep(0.0, 0.3, f.s) * (1 - smoothstep(0.7, 1.0, f.s));
        _w.set(_v.x, _v.y + DIM.ANKLE_H * s, _v.z);
        f.ankle.lerp(_w, free);
      } else {
        // Airborne: push off, tuck at the top, reach for the ground on the way down.
        const vy = c.vel.y;
        const rise = clamp(vy / this.v0, -1.5, 1);
        let tuck = rise > 0 ? smoothstep(1.0, 0.2, rise) : 1 - smoothstep(0.0, 0.85, -rise) * 0.7;
        tuck *= smoothstep(0.02, 0.16, this.airT);
        // Falling: legs reach for the ground as it comes up.
        const above = (c.pos.y - groundHeight(c.pos.x, c.pos.z)) / s;
        if (rise < 0) tuck *= smoothstep(0.05, 0.7, above);
        const lead = clamp(runW * 0.8 + moveW * 0.3, 0, 1);
        const air = i === 0
          ? _v.set(DIM.HIP_X * 0.9, DIM.HIP_Y - 0.85 + tuck * 0.42, 0.06 + 0.2 * lead * tuck)
          : _v.set(-DIM.HIP_X * 0.9, DIM.HIP_Y - 0.85 + tuck * 0.3, -0.05 - 0.2 * lead * (0.5 + 0.5 * tuck));
        const k = smoothstep(0, 0.18, this.airT);
        f.airRel.lerpVectors(f.airStart, air, k);
        this.toWorld(f.airRel, f.ankle);
        f.pitch = damp(f.pitch, -0.45 * (1 - tuck) + 0.1 * tuck, 12, dt);
        f.outYaw = lerpAngle(f.outYaw, c.yaw, 1 - Math.exp(-10 * dt));
      }
    }

    // -------------------------------------------------------------------
    // Pelvis: bob, sway and twist with the stride, held within reach.
    // -------------------------------------------------------------------
    // Cosmetic phase for bob, sway, twist and arm swing: it keeps the gait's pace
    // but glides through any re-sync of the stepping phase instead of jumping.
    const pred = this.cphase + this.phaseAdv;
    const err = this.phase - pred - Math.round(this.phase - pred);
    this.cphase = (pred + err * (1 - Math.exp(-9 * dt)) + 1) % 1;
    const ph = this.cphase;
    const bobWalk = 0.012 * Math.cos(2 * TAU * (ph - duty / 2));
    const bobRun = -0.03 * Math.cos(2 * TAU * (ph - duty / 2));
    this.bob = damp(this.bob, lerp(bobWalk, bobRun, runW) * moveW * (1 - airW), 25, dt);
    this.sway = damp(this.sway, 0.02 * Math.cos(TAU * (ph - duty / 2)) * moveW * (1 - 0.6 * runW) * (1 - airW), 25, dt);
    const breath = Math.sin(t * 1.7);
    const idleSway = Math.sin(t * 0.53) * 0.01 * (1 - moveW);
    const crouch = (act ? act.crouch || 0 : 0) + 0.045 * this.guardW * (1 - moveW);
    let hipH = lerp(0.932, lerp(0.915, 0.862, runW), moveW) + this.bob - crouch;
    hipH += this.squash * (1 - airW * 0.7);
    // Reach limit for each planted or swinging foot (root space).
    const sx = this.sway + idleSway;
    let limitH = Infinity;
    for (let i = 0; i < 2; i++) {
      const f = this.feet[i];
      if (f.mode === 'air') continue;
      this.toLocal(f.ankle, _v);
      const hx = sx + DIM.HIP_X * f.side;
      const dxz = Math.hypot(_v.x - hx, _v.z);
      let maxH = _v.y + Math.sqrt(Math.max(REACH * REACH - dxz * dxz, 1e-4)) + DIM.HIP_DROP;
      // A lifted foot stops holding the hips down as its knee takes up the slack.
      if (f.mode === 'swing') maxH += smoothstep(0.0, 0.55, f.s) * 0.35;
      limitH = limitH === Infinity ? maxH : smin(limitH, maxH, 0.03);
    }
    let pelvisY = limitH === Infinity ? hipH : smin(hipH, limitH, 0.04);
    // Sink a little to keep a trailing foot planted, never a lot: past that the
    // foot takes its step early instead (see the legs below).
    const maxDip = lerp(0.05, 0.07, runW);
    pelvisY = -smin(-pelvisY, -(hipH - maxDip), 0.02);
    if (act && act.bodyW > 0) pelvisY = lerp(pelvisY, act.hipsPos.y, act.bodyW);
    // A stiff (implicit, so always stable) spring irons out anything left.
    spring(this, 'pelvisH', 'pelvisV', pelvisY, 45, dt);

    const pelvisYaw = -0.1 * Math.cos(TAU * ph) * moveW * (1 - airW) * (1 - runW * 0.3) + (act ? act.hipsYaw || 0 : 0);
    const pelvisRoll = 0.045 * Math.cos(TAU * (ph - duty / 2)) * moveW * (1 - airW) + idleSway * 1.5;
    const leanT = clamp(this.accel * 0.012, -0.12, 0.18) + 0.03 * moveW + 0.12 * runW + (c.grounded ? 0 : 0.05 * clamp(c.vel.y / this.v0, -1, 1)) - this.squash * 1.4;
    this.lean = damp(this.lean, leanT, 8, dt);
    this.bank = damp(this.bank, clamp(this.yawRate * this.speed * 0.028, -0.2, 0.2), 6, dt);

    b.hips.position.set(sx, this.pelvisH, 0.0);
    _eul.set(0.06 * runW, pelvisYaw, pelvisRoll - this.bank, 'YXZ');
    b.hips.quaternion.setFromEuler(_eul);
    if (act && act.bodyW > 0) {
      b.hips.position.lerp(act.hipsPos, act.bodyW);
      b.hips.quaternion.slerp(act.hipsQ, act.bodyW);
    }

    const twist = act ? act.twist || 0 : 0;
    const aLean = act ? act.lean || 0 : 0;
    const aSide = act ? act.side || 0 : 0;
    const guardTwist = 0.3 * this.guardW * (1 - moveW);
    b.spine.rotation.set(this.lean * 0.6 + aLean * 0.5 + breath * 0.01, -pelvisYaw * 1.3 + twist * 0.5 + guardTwist * 0.5, -pelvisRoll * 0.7 + aSide * 0.5, 'YXZ');
    b.chest.rotation.set(this.lean * 0.4 + aLean * 0.5 + breath * 0.008, -pelvisYaw * 0.35 + twist * 0.5 + guardTwist * 0.5, aSide * 0.5, 'YXZ');

    // Head: steady gaze, turning toward whatever he watches.
    let lookYaw = Math.sin(t * 0.23) * 0.1 * (1 - moveW);
    let lookPitch = 0;
    if (c.lookAt) {
      _v.subVectors(c.lookAt, c.pos).applyQuaternion(this.rootQi);
      lookYaw = clamp(Math.atan2(_v.x, _v.z) - twist - guardTwist, -1.0, 1.0);
      lookPitch = clamp(-Math.atan2(_v.y - 1.5 * s, Math.hypot(_v.x, _v.z)), -0.4, 0.5);
    }
    this.headYaw = damp(this.headYaw, lookYaw, 6, dt);
    this.headPitch = damp(this.headPitch, lookPitch, 6, dt);
    b.neck.rotation.set(-this.lean * 0.25 + this.headPitch * 0.4, this.headYaw * 0.35, 0, 'YXZ');
    b.head.rotation.set(-this.lean * 0.7 - aLean * 0.6 + this.headPitch * 0.6 + Math.sin(t * 0.31) * 0.02 + (act ? act.headPitch || 0 : 0),
      pelvisYaw * 0.2 + this.headYaw * 0.65 - twist * 0.6 - guardTwist * 0.6, pelvisRoll * 0.4 + this.bank * 0.5, 'YXZ');

    // -------------------------------------------------------------------
    // Legs.
    // -------------------------------------------------------------------
    this.hipsQ.copy(b.hips.quaternion);
    for (let i = 0; i < 2; i++) {
      const f = this.feet[i];
      const side = f.side;
      const thigh = i === 0 ? b.thighL : b.thighR;
      const shin = i === 0 ? b.shinL : b.shinR;
      const foot = i === 0 ? b.footL : b.footR;
      // Hip joint in root space.
      this.jointP.copy(thigh.position).applyQuaternion(this.hipsQ).add(b.hips.position);
      let T = this.toLocal(f.ankle, _w);
      if (act && act.legsW > 0) T.lerp(act.legs[i], act.legsW);
      // A swinging foot follows the leg: keep it within reach of the hip.
      if (f.mode !== 'plant') {
        const dd = T.distanceTo(this.jointP);
        if (dd > REACH * 0.985) T.sub(this.jointP).multiplyScalar((REACH * 0.985) / dd).add(this.jointP);
      }
      // An over-stretched planted foot: if it trails, it steps now; if it leads
      // (a sudden stop, a shove), it slides rather than the leg popping.
      const dd = T.distanceTo(this.jointP);
      if (dd > REACH * 1.03 && f.mode === 'plant') {
        const trails = T.z < this.jointP.z;
        if (trails && c.grounded && this.liftNow < 0 && f.stanceAge > 0.05 && this.feet[1 - i].mode === 'plant') {
          const dutyNow = lerp(0.64, 0.3, runW);
          this.phase = (dutyNow + 0.002 - i * 0.5 + 2) % 1;
          this.liftNow = i;
        } else if (!trails || dd > REACH * 1.12) {
          _v.subVectors(T, this.jointP).setLength(REACH * (trails ? 1.12 : 1.03));
          T = _v.add(this.jointP);
          this.toWorld(T, _e);
          f.plant.x = lerp(f.plant.x, _e.x, 0.5);
          f.plant.z = lerp(f.plant.z, _e.z, 0.5);
        }
      }
      // Knee points along the foot, a little outward.
      const footYawL = wrapAngle(f.outYaw - c.yaw);
      const pole = _pole.set(Math.sin(footYawL) + 0.12 * side, 0, Math.cos(footYawL));
      if (act && act.legsW > 0 && act.legPole) pole.lerp(act.legPole, act.legsW);
      pole.normalize();
      const Tl = _mid.copy(T);
      const k = twoBone(this.jointP, Tl, DIM.THIGH, DIM.SHIN, pole, true, this.limbQ, _knee);
      thigh.quaternion.copy(this.hipsQ).invert().multiply(this.limbQ);
      shin.quaternion.setFromAxisAngle(_X, k);
      // Foot: yaw of the plant, roll from the gait, pitch of the slope.
      _q2.copy(this.limbQ).multiply(shin.quaternion);
      const slope = this.slopePitch(f, c.yaw);
      _eul.set(-(f.pitch + slope * (1 - airW)), footYawL, 0, 'YXZ');
      _q3.setFromEuler(_eul);
      if (act && act.legsW > 0 && act.footPitch) {
        _q.setFromAxisAngle(_X, -act.footPitch[i]);
        _q3.slerp(_q.premultiply(_qa.setFromAxisAngle(_Y, footYawL)), act.legsW);
      }
      foot.quaternion.copy(_q2).invert().multiply(_q3);
    }

    // Hakama: each side follows its thigh part of the way, lagging like cloth.
    this.hakama(dt, b);

    // -------------------------------------------------------------------
    // Arms and sword.
    // -------------------------------------------------------------------
    this.locomotionPose(dt, c, ph, duty);
    const P = this.out;
    copyPose(P, this.base);
    if (act && act.w > 0 && act.pose) blendPose(P, act.pose, act.w);
    this.applyArms(dt, c, P, act);

    // -------------------------------------------------------------------
    // Secondary motion: hat, scabbard, hair and headband tails.
    // -------------------------------------------------------------------
    const hatTarget = clamp(-this.squashV * 0.05 + this.bob * 0.6 - this.pelvisV * 0.02, -0.12, 0.12);
    [this.hatTilt, this.hatV] = springTo(this.hatTilt, this.hatV, hatTarget, 160, 14, dt);
    b.hat.rotation.set(0.04 + this.hatTilt, 0, 0);
    const sayaT = -this.pelvisV * 0.4 + Math.sin(TAU * ph) * 0.05 * moveW;
    [this.sayaSwing, this.sayaV] = springTo(this.sayaSwing, this.sayaV, sayaT, 120, 9, dt);
    b.saya.rotation.set(this.sayaSwing * 0.5, 0, this.sayaSwing * 0.3);
    const tailT = _v.set(this.lean * 0.6 + this.speed * 0.09 - this.pelvisV * 0.6, 0, -this.bank + this.yawRate * 0.04);
    [this.tail.x, this.tailV.x] = springTo(this.tail.x, this.tailV.x, tailT.x, 90, 7, dt);
    [this.tail.y, this.tailV.y] = springTo(this.tail.y, this.tailV.y, tailT.z, 90, 7, dt);
    b.tail.rotation.set(clamp(this.tail.x, -0.3, 1.4) + Math.sin(t * 7.3) * 0.03 * this.speed * 0.2, 0, clamp(this.tail.y, -0.6, 0.6));

    root.updateMatrixWorld(true);
    this.gripWorld.setFromMatrixPosition(b.sword.matrixWorld);
    this.headWorld.setFromMatrixPosition(b.head.matrixWorld);
    this.chestWorld.setFromMatrixPosition(b.chest.matrixWorld);
  }

  hakama(dt, b) {
    if (!this.hak) this.hak = [{ x: 0, z: 0, vx: 0, vz: 0 }, { x: 0, z: 0, vx: 0, vz: 0 }];
    for (let i = 0; i < 2; i++) {
      const thigh = i === 0 ? b.thighL : b.thighR;
      const bone = i === 0 ? b.hakL : b.hakR;
      const h = this.hak[i];
      _v.set(0, -1, 0).applyQuaternion(thigh.quaternion);
      const fwd = Math.atan2(_v.z, -_v.y);
      const out = Math.atan2(_v.x, -_v.y) * (i === 0 ? 1 : -1);
      const tx = clamp(fwd * 0.55, -0.32, 0.62);
      const tz = clamp(out * 0.6, -0.05, 0.3);
      // Under-damped spring: the cloth overshoots a touch and settles.
      const k = 260;
      const cdamp = 18;
      [h.x, h.vx] = springTo(h.x, h.vx, tx, k, cdamp, dt);
      [h.z, h.vz] = springTo(h.z, h.vz, tz, k, cdamp, dt);
      if (Math.abs(h.x - tx) > 0.8) h.x = tx;
      bone.rotation.set(-h.x, 0, h.z * (i === 0 ? 1 : -1), 'XZY');
    }
  }

  reset(c) {
    const s = this.scale;
    for (let i = 0; i < 2; i++) {
      const f = this.feet[i];
      this.neutral(i, null, _v);
      this.toWorld(_v, f.plant);
      f.plant.y = groundHeight(f.plant.x, f.plant.z);
      f.yaw = c.yaw;
      f.outYaw = c.yaw;
      f.mode = 'plant';
      this.ankleFrom(f.plant, f.yaw, 0, f.ankle);
    }
    this.pelvisH = DIM.HIP_Y;
    this.ready = true;
    this.wasGrounded = c.grounded;
    void s;
  }

  // Which planted foot is furthest behind the direction of travel.
  trailingFoot(c) {
    let best = 0;
    let bestBack = -Infinity;
    const vl = Math.max(Math.hypot(c.vel.x, c.vel.z), 1e-3);
    for (let i = 0; i < 2; i++) {
      const f = this.feet[i];
      const back = -((f.plant.x - c.pos.x) * c.vel.x + (f.plant.z - c.pos.z) * c.vel.z) / vl;
      if (back > bestBack) {
        bestBack = back;
        best = i;
      }
    }
    return best;
  }

  swingTarget(i, f, c, act, cyc, duty, tRemain) {
    const s = this.scale;
    const stanceT = duty / cyc;
    const lead = lerp(0.46, 0.36, this.runW);
    const ahead = Math.min(tRemain + stanceT * lead, 0.6);
    const yawPred = c.yaw + clamp(this.yawRate * Math.min(tRemain, 0.25), -0.8, 0.8);
    // Moving: feet land a little either side of the line of travel; standing: in stance.
    this.neutral(i, act, _v);
    const width = lerp(0.1, 0.075, this.runW) * f.side;
    _v.x = lerp(_v.x, width, this.moveW);
    _v.z = lerp(_v.z, 0, this.moveW);
    const cy = Math.cos(yawPred);
    const sy = Math.sin(yawPred);
    const ox = (_v.x * cy + _v.z * sy) * s;
    const oz = (-_v.x * sy + _v.z * cy) * s;
    let tx = c.pos.x + c.vel.x * ahead + ox;
    let tz = c.pos.z + c.vel.z * ahead + oz;
    // Never reach absurdly far (dashes, knockbacks).
    const hx = c.pos.x + ox;
    const hz = c.pos.z + oz;
    const dx = tx - hx;
    const dz = tz - hz;
    const dl = Math.hypot(dx, dz);
    const maxL = 0.72 * s;
    if (dl > maxL) {
      tx = hx + (dx * maxL) / dl;
      tz = hz + (dz * maxL) / dl;
    }
    f.target.set(tx, groundHeight(tx, tz), tz);
    f.targetYaw = yawPred + 0.07 * f.side * (1 - this.runW);
  }

  // Ankle position for a foot whose sole touches `contact` (the point under the
  // ankle when flat), rolled onto the heel (pitch > 0) or the ball (pitch < 0).
  ankleFrom(contact, yaw, pitch, out) {
    const s = this.scale;
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    // Rotated forward and up vectors of the foot.
    const Fx = fx * cp;
    const Fy = sp;
    const Fz = fz * cp;
    const Ux = -fx * sp;
    const Uy = cp;
    const Uz = -fz * sp;
    const H = DIM.ANKLE_H * s;
    if (pitch >= 0) {
      const hx = contact.x - fx * DIM.HEEL * s;
      const hz = contact.z - fz * DIM.HEEL * s;
      out.set(hx + Ux * H + Fx * DIM.HEEL * s, contact.y + Uy * H + Fy * DIM.HEEL * s, hz + Uz * H + Fz * DIM.HEEL * s);
    } else {
      const bx = contact.x + fx * DIM.BALL * s;
      const bz = contact.z + fz * DIM.BALL * s;
      out.set(bx + Ux * H - Fx * DIM.BALL * s, contact.y + Uy * H - Fy * DIM.BALL * s, bz + Uz * H - Fz * DIM.BALL * s);
    }
    return out;
  }

  slopePitch(f, yaw) {
    const s = this.scale;
    const x = f.mode === 'plant' ? f.plant.x : f.ankle.x;
    const z = f.mode === 'plant' ? f.plant.z : f.ankle.z;
    const fx = Math.sin(f.outYaw);
    const fz = Math.cos(f.outYaw);
    const d = 0.12 * s;
    const h1 = groundHeight(x + fx * d, z + fz * d);
    const h0 = groundHeight(x - fx * d, z - fz * d);
    void yaw;
    return Math.atan2(h1 - h0, 2 * d);
  }

  // Hands and blade while walking, running, guarding or in the air.
  locomotionPose(dt, c, ph, duty) {
    const P = this.base;
    const T2 = this.tmpPose;
    const moveW = this.moveW;
    const runW = this.runW;
    const airW = this.airW;
    const g = this.guardW;
    const t = this.time;
    // Arm swing (right arm forward when the left leg leads), smoothed so gait resets never pop.
    this.swingR = damp(this.swingR, Math.cos(TAU * ph) * moveW * (1 - airW), 18, dt);
    this.swingL = -this.swingR;
    const sw = this.swingR;
    const breath = Math.sin(t * 1.7);

    // Relaxed carry: blade low at his side, tip forward and down.
    swordPose(P, -0.25, 0.855 + 0.01 * breath, 0.12 + sw * 0.07, -0.2, -0.74, 0.64, 0, 1, 0.2);
    P.twoHand = 0;
    P.poleR.set(-0.55, -0.35, -0.75).normalize();
    P.poleL.set(0.6, -0.4, -0.7).normalize();
    // Left hand steadies the scabbard at the obi, thumb toward its mouth.
    const saya = this.b.saya;
    saya.updateMatrix();
    _v.copy(SAYA_DIR).multiplyScalar(0.055).applyMatrix4(saya.matrix);
    _v.applyQuaternion(this.b.hips.quaternion).add(this.b.hips.position);
    P.left.copy(_v);
    _w.copy(SAYA_DIR).applyQuaternion(saya.quaternion).applyQuaternion(this.b.hips.quaternion).negate();
    lookQuat(_w, _up, P.leftQ);
    P.leftGrip = 1;

    // Running: blade trails behind, left arm pumps free.
    if (runW > 0.001) {
      swordPose(T2, -0.29, 0.93 + 0.02 * sw, -0.02 + sw * 0.16, -0.3, -0.42, -0.86, 0, 1, 0);
      T2.twoHand = 0;
      T2.left.set(0.23, 0.98 + 0.03 * Math.abs(sw), 0.05 - sw * 0.22);
      lookQuat(_v.set(0, -0.2, 1), _up, T2.leftQ);
      T2.leftGrip = 0;
      T2.poleR.set(-0.5, -0.3, -0.8).normalize();
      T2.poleL.set(0.4, -0.3, -0.85).normalize();
      blendPose(P, T2, runW * (1 - g * 0.3));
    }
    // Guard (kamae): both hands on the hilt, the point at the enemy's throat.
    if (g > 0.001) {
      const gb = g * (1 - runW);
      swordPose(T2, -0.035, 1.02 + 0.006 * breath + 0.01 * Math.abs(sw), 0.33, 0.07, 0.5, 0.86, 0, 1, -0.4);
      T2.twoHand = 1;
      T2.left.copy(T2.grip);
      T2.leftQ.copy(T2.swordQ);
      T2.leftGrip = 1;
      T2.poleR.set(-0.45, -0.85, -0.25).normalize();
      T2.poleL.set(0.45, -0.85, -0.25).normalize();
      blendPose(P, T2, gb);
    }
    // Airborne: blade held out and back for balance, free hand wide.
    if (this.airArmW > 0.001) {
      this.fall = damp(this.fall || 0, c.grounded ? this.fall || 0 : smoothstep(0, 0.8, -c.vel.y / this.v0), 8, dt);
      const fall = this.fall;
      swordPose(T2, -0.34, 1.05 - 0.1 * fall, -0.08, -0.5, -0.12 - 0.4 * fall, -0.86, 0, 1, 0);
      T2.twoHand = 0;
      T2.left.set(0.36, 1.18 - 0.15 * fall, 0.08);
      lookQuat(_v.set(0.3, 0, 1), _up, T2.leftQ);
      T2.leftGrip = 0;
      T2.poleR.set(-0.5, -0.4, -0.75).normalize();
      T2.poleL.set(0.3, -0.6, -0.7).normalize();
      blendPose(P, T2, this.airArmW);
    }
    // Pendulum lag on the carried blade.
    const lagT = sw * 0.12 * (1 - g) * (1 - airW);
    [this.swordLag, this.swordLagV] = springTo(this.swordLag, this.swordLagV, lagT, 110, 11, dt);
    _q.setFromAxisAngle(_X, -this.swordLag);
    P.swordQ.multiply(_q);
  }

  applyArms(dt, c, P, act) {
    const b = this.b;
    const A = this.armScratch || (this.armScratch = {
      D: new THREE.Vector3(), chestP: new THREE.Vector3(), chestQ: new THREE.Quaternion(),
      sh: new THREE.Vector3(), clavQ: new THREE.Quaternion(), G: new THREE.Vector3(),
      H: new THREE.Vector3(), W: new THREE.Vector3(), handQ: new THREE.Quaternion(),
      gripQ: new THREE.Quaternion(), dir: new THREE.Vector3(), mid: new THREE.Vector3(),
    });
    // Sword bone.
    b.sword.position.copy(P.grip);
    b.sword.quaternion.copy(P.swordQ);
    const D = A.D.set(0, 0, 1).applyQuaternion(P.swordQ);
    // Chest frame (root space).
    A.chestQ.copy(b.hips.quaternion).multiply(b.spine.quaternion);
    A.chestP.copy(b.chest.position).applyQuaternion(A.chestQ);
    _v.copy(b.spine.position).applyQuaternion(b.hips.quaternion);
    A.chestP.add(_v).add(b.hips.position);
    A.chestQ.multiply(b.chest.quaternion);

    // Clavicles shrug when the hands go high.
    for (let i = 0; i < 2; i++) {
      const clav = i === 0 ? b.clavL : b.clavR;
      const hy = i === 0 ? lerp(P.left.y, P.grip.y, P.twoHand) : P.grip.y;
      const raise = smoothstep(1.2, 1.75, hy) * 0.28;
      clav.rotation.set(0, 0, raise * (i === 0 ? 1 : -1));
    }

    for (let i = 1; i >= 0; i--) {
      const right = i === 1;
      const clav = right ? b.clavR : b.clavL;
      const arm = right ? b.armR : b.armL;
      const fore = right ? b.foreR : b.foreL;
      const hand = right ? b.handR : b.handL;
      // Shoulder in root space.
      A.clavQ.copy(A.chestQ).multiply(clav.quaternion);
      A.sh.copy(clav.position).applyQuaternion(A.chestQ).add(A.chestP);
      _v.copy(arm.position).applyQuaternion(A.clavQ);
      A.sh.add(_v);

      // Grip point and hand orientation.
      if (right) {
        A.G.copy(P.grip);
        this.gripQuat(A.G, D, A.sh, A.handQ);
      } else {
        A.H.copy(P.grip).addScaledVector(D, -DIM.HANDLE);
        A.G.copy(P.left).lerp(A.H, P.twoHand);
        A.gripQ.copy(P.leftQ).slerp(P.swordQ, P.twoHand);
        A.dir.set(0, 0, 1).applyQuaternion(A.gripQ);
        this.gripQuat(A.G, A.dir, A.sh, A.handQ);
        // A free hand keeps its own orientation; a gripping one closes on the handle.
        A.gripQ.copy(P.leftQ).slerp(A.handQ, Math.max(P.leftGrip, P.twoHand));
        A.handQ.copy(A.gripQ);
      }
      // Wrist sits back from the fist along the hand's +Y.
      _y.set(0, 1, 0).applyQuaternion(A.handQ);
      A.W.copy(A.G).addScaledVector(_y, DIM.GRIP);
      const pole = right ? P.poleR : P.poleL;
      const k = twoBone(A.sh, A.W, DIM.UPPER_ARM, DIM.FOREARM, pole, false, this.limbQ, A.mid);
      arm.quaternion.copy(A.clavQ).invert().multiply(this.limbQ);
      fore.quaternion.setFromAxisAngle(_X, -k);
      _q2.copy(this.limbQ).multiply(fore.quaternion);
      hand.quaternion.copy(_q2).invert().multiply(A.handQ);
    }
    void dt;
    void c;
    void act;
  }

  // Hand orientation holding a handle along `dir` at G: fist closed around the
  // axis, the back of the hand facing away from the shoulder.
  gripQuat(G, dir, shoulder, out) {
    _z.copy(dir).normalize();
    _y.subVectors(shoulder, G);
    _y.addScaledVector(_z, -_y.dot(_z));
    if (_y.lengthSq() < 1e-8) _y.set(0, 1, 0).addScaledVector(_z, -_z.y);
    _y.normalize();
    _x.crossVectors(_y, _z);
    _m.makeBasis(_x, _y, _z);
    return out.setFromRotationMatrix(_m);
  }
}
