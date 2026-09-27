import * as THREE from 'three';
import { MOVE } from './config.js';
import { terrainHeight } from './terrain.js';

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Body physics for anyone on foot: eased acceleration and turning, gravity with
// a floaty apex and a snappy fall, terrain following. It runs on a fixed 120 Hz
// step and is interpolated for rendering, so motion is equally smooth at 30, 60
// or 144 frames per second. Moves steer it through `control` (lunges, hops,
// spins, locked facing) without touching the rest.
export class Mover {
  constructor(x = 0, z = 0, yaw = 0, tuning = MOVE) {
    this.T = tuning;
    this.pos = new THREE.Vector3(x, terrainHeight(x, z), z);
    this.vel = new THREE.Vector3();
    this.yaw = yaw; // facing = (sin yaw, 0, cos yaw)
    this.grounded = true;
    this.coyote = 0;
    this.buffer = 0;
    this.prevPos = this.pos.clone();
    this.prevYaw = yaw;
    this.renderPos = this.pos.clone();
    this.renderYaw = yaw;
    this.jumpVel = Math.sqrt(2 * tuning.gravity * tuning.jumpHeight);
    this.radius = 0.38;
    // One-frame events for the animator; cleared after it reads them.
    this.jumped = false;
    this.landed = false;
    this.landSpeed = 0;
    this.control = {
      lock: 0, // 0..1: how much of the stick is ignored
      vel: new THREE.Vector3(), // world velocity to follow (root motion)
      velW: 0, // 0..1: how firmly
      face: null, // yaw to turn toward
      faceRate: 18,
      spin: 0, // extra yaw per second (spinning moves)
      hop: 0, // one-shot upward speed
      gravity: 1,
      fall: 0, // extra downward speed (a plunge)
      noJump: false,
    };
  }

  // intent: { mx, mz } world-space move vector (length up to 1), speed, jumpPressed, jumpHeld.
  step(dt, intent) {
    const T = this.T;
    const C = this.control;
    this.prevPos.copy(this.pos);
    this.prevYaw = this.yaw;

    const free = 1 - C.lock;
    const mx = intent.mx * free;
    const mz = intent.mz * free;
    const mag = Math.min(1, Math.hypot(mx, mz));
    const tvx = mx * intent.speed;
    const tvz = mz * intent.speed;

    // Ease toward the target velocity: quick but never instant, on the ground and in the air.
    const cur = Math.hypot(this.vel.x, this.vel.z);
    const want = Math.hypot(tvx, tvz);
    const rate = this.grounded ? (want >= cur ? T.groundAccel : T.groundDecel) : T.airAccel;
    const k = 1 - Math.exp(-rate * dt);
    this.vel.x += (tvx - this.vel.x) * k;
    this.vel.z += (tvz - this.vel.z) * k;
    if (C.velW > 0) {
      const w = Math.min(1, C.velW);
      this.vel.x += (C.vel.x - this.vel.x) * w;
      this.vel.z += (C.vel.z - this.vel.z) * w;
    }

    const maxTurn = T.maxTurnSpeed * dt;
    if (C.face !== null) {
      const turn = 1 - Math.exp(-C.faceRate * dt);
      const step = wrapAngle(C.face - this.yaw) * turn;
      this.yaw = wrapAngle(this.yaw + Math.min(Math.max(step, -maxTurn * 2), maxTurn * 2));
    } else if (mag > 0.08) {
      const target = Math.atan2(mx, mz);
      const turn = 1 - Math.exp(-T.turnRate * (this.grounded ? 1 : 0.4) * dt);
      // Eased, but never whipping round faster than a body can turn.
      const step = Math.min(Math.max(wrapAngle(target - this.yaw) * turn, -maxTurn), maxTurn);
      this.yaw = wrapAngle(this.yaw + step);
    }
    if (C.spin) this.yaw = wrapAngle(this.yaw + C.spin * dt);

    // Jump with buffering (press slightly early) and coyote time (press slightly late).
    if (intent.jumpPressed && !C.noJump) this.buffer = T.jumpBuffer;
    else this.buffer = Math.max(0, this.buffer - dt);
    this.coyote = this.grounded ? T.coyoteTime : Math.max(0, this.coyote - dt);
    if (this.buffer > 0 && this.coyote > 0 && !C.noJump) {
      this.vel.y = this.jumpVel;
      this.grounded = false;
      this.coyote = 0;
      this.buffer = 0;
      this.jumped = true;
    }
    if (C.hop > 0) {
      this.vel.y = Math.max(this.vel.y, C.hop);
      this.grounded = false;
      this.coyote = 0;
      this.jumped = true;
      this.hopping = true;
      C.hop = 0;
    }
    if (this.hopping && (this.grounded || this.vel.y <= 0)) this.hopping = false;

    if (!this.grounded) {
      let g = T.gravity * C.gravity;
      if (this.vel.y < 0) g *= T.fallGravityMul;
      else if (!intent.jumpHeld && !this.hopping) g *= T.shortJumpGravityMul; // tap for a hop, hold for a leap
      if (intent.jumpHeld && Math.abs(this.vel.y) < T.apexBand) g *= T.apexGravityMul;
      this.vel.y = Math.max(this.vel.y - g * dt, -T.maxFallSpeed - C.fall);
      if (C.fall > 0) this.vel.y = Math.min(this.vel.y, -C.fall);
    }

    this.pos.addScaledVector(this.vel, dt);
    const ground = terrainHeight(this.pos.x, this.pos.z);
    if (this.grounded) {
      // Follow the rolling ground; step off crests into a fall.
      if (this.pos.y - ground < 0.25) {
        this.pos.y = ground;
        this.vel.y = 0;
      } else {
        this.grounded = false;
      }
    } else if (this.pos.y <= ground) {
      this.pos.y = ground;
      if (this.vel.y <= 0) {
        this.landed = true;
        this.landSpeed = -this.vel.y;
        this.vel.y = 0;
        this.grounded = true;
      }
    }
  }

  // Keep bodies from overlapping (called after everyone has moved).
  pushApart(other, share = 0.5) {
    const dx = this.pos.x - other.pos.x;
    const dz = this.pos.z - other.pos.z;
    const d = Math.hypot(dx, dz);
    const min = this.radius + other.radius;
    if (d >= min || d < 1e-5) return;
    const push = min - d;
    const nx = dx / d;
    const nz = dz / d;
    this.pos.x += nx * push * share;
    this.pos.z += nz * push * share;
    other.pos.x -= nx * push * (1 - share);
    other.pos.z -= nz * push * (1 - share);
  }

  interpolate(alpha) {
    this.renderPos.lerpVectors(this.prevPos, this.pos, alpha);
    this.renderYaw = this.prevYaw + wrapAngle(this.yaw - this.prevYaw) * alpha;
  }

  consumeEvents() {
    const e = this.events || (this.events = {});
    e.jumped = this.jumped;
    e.landed = this.landed;
    e.landSpeed = this.landSpeed;
    this.jumped = false;
    this.landed = false;
    return e;
  }
}

// The player's body: the stick, camera-relative, drives the mover.
export class Player extends Mover {
  constructor(x = 0, z = 0, yaw = 0) {
    super(x, z, yaw);
    this.intent = { mx: 0, mz: 0, speed: 0, jumpPressed: false, jumpHeld: false };
  }

  fixedUpdate(dt, input, camYaw) {
    const fx = -Math.sin(camYaw);
    const fz = -Math.cos(camYaw);
    const rx = Math.cos(camYaw);
    const rz = -Math.sin(camYaw);
    const I = this.intent;
    I.mx = rx * input.moveX + fx * input.moveY;
    I.mz = rz * input.moveX + fz * input.moveY;
    I.speed = input.run ? this.T.runSpeed : this.T.walkSpeed;
    I.jumpPressed = input.jumpPressed;
    input.jumpPressed = false;
    I.jumpHeld = input.jumpHeld;
    this.step(dt, I);
  }
}
