import { TRAIL_N, TRAIL_STEPS } from './config.js';

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// Feeds the grass shader where the samurai is pressing it down: his feet now,
// the footsteps behind him (the grass springs back over a few seconds) and the
// ring that ripples out when he lands.
export class Trail {
  constructor(shared) {
    this.slots = shared.uTrail.value; // Vector4: x, z, strength, radius
    this.impact = shared.uImpact.value; // Vector4: x, z, age, strength
    this.bound = shared.uTrailBound.value; // Vector3: centre x, z and reach
    this.points = [];
    this.lastX = null;
    this.lastZ = 0;
    this.impact.set(0, 0, 99, 0);
  }

  // others: [{ x, z, s, r }] for foes (standing or fallen) sharing the field.
  update(dt, pos, grounded, heightAboveGround, landed, landSpeed, others = []) {
    for (const p of this.points) p.age += dt;
    this.points = this.points.filter((p) => p.age < 4);

    if (this.lastX === null) {
      this.lastX = pos.x;
      this.lastZ = pos.z;
    }
    const moved = Math.hypot(pos.x - this.lastX, pos.z - this.lastZ);
    if (grounded && moved > 0.32) {
      this.points.push({ x: pos.x, z: pos.z, age: 0 });
      this.lastX = pos.x;
      this.lastZ = pos.z;
      if (this.points.length > TRAIL_STEPS) this.points.shift();
    }

    // Slot 0: the samurai himself, fading as he leaves the grass tops behind in a jump.
    const touch = 1 - smoothstep(0.15, 0.95, heightAboveGround);
    this.slots[0].set(pos.x, pos.z, 0.95 * touch, 0.85);
    for (let i = 1; i <= TRAIL_STEPS; i++) {
      const p = this.points[this.points.length - i];
      if (p) {
        const s = 0.75 * Math.exp(-p.age * 0.85) * smoothstep(0, 0.15, p.age + 0.05);
        this.slots[i].set(p.x, p.z, s, 0.62);
      } else {
        this.slots[i].set(0, 0, 0, 1);
      }
    }
    for (let i = TRAIL_STEPS + 1, k = 0; i < TRAIL_N; i++, k++) {
      const o = others[k];
      if (o) this.slots[i].set(o.x, o.z, o.s, o.r);
      else this.slots[i].set(0, 0, 0, 1);
    }

    if (landed) this.ring(pos.x, pos.z, Math.min(1, landSpeed / 9) * 0.9);
    else this.impact.z += dt;

    // How far from the samurai anything is pressing the grass: blades beyond it skip the work.
    let reach = 0;
    for (const s of this.slots) {
      if (s.z <= 0) continue;
      reach = Math.max(reach, Math.hypot(s.x - pos.x, s.y - pos.z) + s.w * 1.2);
    }
    const I = this.impact;
    if (I.w > 0.01 && I.z < 3) reach = Math.max(reach, Math.hypot(I.x - pos.x, I.y - pos.z) + I.z * 5 + 1.6);
    this.bound.set(pos.x, pos.z, reach);
  }

  // A ring running out through the grass (landings, heavy blows).
  ring(x, z, strength) {
    if (this.impact.z < 0.25 && this.impact.w > strength) return;
    this.impact.set(x, z, 0, strength);
  }
}
