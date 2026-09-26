import * as THREE from 'three';
import { MOVE } from './config.js';
import { terrainHeight } from './terrain.js';

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Movement runs on a fixed 120 Hz step and is interpolated for rendering, so motion
// is equally smooth at 30, 60 or 144 frames per second.
export class Player {
  constructor(x = 0, z = 0, yaw = 0) {
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
    this.jumpVel = Math.sqrt(2 * MOVE.gravity * MOVE.jumpHeight);
    // One-frame events for the animator; cleared after it reads them.
    this.jumped = false;
    this.landed = false;
    this.landSpeed = 0;
  }

  fixedUpdate(dt, input, camYaw) {
    this.prevPos.copy(this.pos);
    this.prevYaw = this.yaw;

    // Camera-relative intent.
    const fx = -Math.sin(camYaw);
    const fz = -Math.cos(camYaw);
    const rx = Math.cos(camYaw);
    const rz = -Math.sin(camYaw);
    const mx = rx * input.moveX + fx * input.moveY;
    const mz = rz * input.moveX + fz * input.moveY;
    const mag = Math.min(1, Math.hypot(mx, mz));
    const top = input.run ? MOVE.runSpeed : MOVE.walkSpeed;
    const tvx = mx * top;
    const tvz = mz * top;

    // Ease toward the target velocity: quick but never instant, on the ground and in the air.
    const cur = Math.hypot(this.vel.x, this.vel.z);
    const want = Math.hypot(tvx, tvz);
    const rate = this.grounded ? (want >= cur ? MOVE.groundAccel : MOVE.groundDecel) : MOVE.airAccel;
    const k = 1 - Math.exp(-rate * dt);
    this.vel.x += (tvx - this.vel.x) * k;
    this.vel.z += (tvz - this.vel.z) * k;

    if (mag > 0.08) {
      const target = Math.atan2(mx, mz);
      const turn = 1 - Math.exp(-MOVE.turnRate * (this.grounded ? 1 : 0.4) * dt);
      this.yaw = wrapAngle(this.yaw + wrapAngle(target - this.yaw) * turn);
    }

    // Jump with buffering (press slightly early) and coyote time (press slightly late).
    if (input.jumpPressed) {
      this.buffer = MOVE.jumpBuffer;
      input.jumpPressed = false;
    } else {
      this.buffer = Math.max(0, this.buffer - dt);
    }
    this.coyote = this.grounded ? MOVE.coyoteTime : Math.max(0, this.coyote - dt);
    if (this.buffer > 0 && this.coyote > 0) {
      this.vel.y = this.jumpVel;
      this.grounded = false;
      this.coyote = 0;
      this.buffer = 0;
      this.jumped = true;
    }

    if (!this.grounded) {
      let g = MOVE.gravity;
      if (this.vel.y < 0) g *= MOVE.fallGravityMul;
      else if (!input.jumpHeld) g *= MOVE.shortJumpGravityMul; // tap for a hop, hold for a leap
      if (input.jumpHeld && Math.abs(this.vel.y) < MOVE.apexBand) g *= MOVE.apexGravityMul;
      this.vel.y = Math.max(this.vel.y - g * dt, -MOVE.maxFallSpeed);
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

  interpolate(alpha) {
    this.renderPos.lerpVectors(this.prevPos, this.pos, alpha);
    this.renderYaw = this.prevYaw + wrapAngle(this.yaw - this.prevYaw) * alpha;
  }

  consumeEvents() {
    const e = { jumped: this.jumped, landed: this.landed, landSpeed: this.landSpeed };
    this.jumped = false;
    this.landed = false;
    return e;
  }
}
