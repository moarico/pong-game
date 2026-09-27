import { terrainHeight } from './terrain.js';
import { PLAY_RADIUS } from './config.js';

// ---------------------------------------------------------------------------
// The floor under everyone's feet. On the hilltop it is the terrain; in a boss
// arena the stage supplies its own floor and walls. Everything that walks,
// plants a foot, frames a shot or drops a spark asks here.
// ---------------------------------------------------------------------------

const hilltop = {
  height: terrainHeight,
  // Keep a body inside the playable area (mutates pos and vel).
  clamp(pos, vel) {
    const r = Math.hypot(pos.x, pos.z);
    if (r <= PLAY_RADIUS) return;
    const nx = pos.x / r;
    const nz = pos.z / r;
    pos.x = nx * PLAY_RADIUS;
    pos.z = nz * PLAY_RADIUS;
    const out = vel.x * nx + vel.z * nz;
    if (out > 0) {
      vel.x -= out * nx;
      vel.z -= out * nz;
    }
  },
  // Pull the camera in front of anything solid between it and its subject.
  camera: null,
};

let floor = hilltop;

export function groundHeight(x, z) {
  return floor.height(x, z);
}

export function clampToArena(pos, vel) {
  floor.clamp(pos, vel);
}

export function clampCamera(aim, pos) {
  if (floor.camera) floor.camera(aim, pos);
}

// A stage installs { height(x, z), clamp(pos, vel), camera(aim, pos) }; null restores the hilltop.
export function setFloor(f) {
  floor = f || hilltop;
}

// Helpers for arenas: clamp inside a circle, push out of round pillars.
export function clampCircle(pos, vel, cx, cz, radius) {
  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const r = Math.hypot(dx, dz);
  if (r <= radius || r < 1e-6) return;
  const nx = dx / r;
  const nz = dz / r;
  pos.x = cx + nx * radius;
  pos.z = cz + nz * radius;
  const out = vel.x * nx + vel.z * nz;
  if (out > 0) {
    vel.x -= out * nx;
    vel.z -= out * nz;
  }
}

export function pushOutCircle(pos, vel, cx, cz, radius) {
  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const r = Math.hypot(dx, dz);
  if (r >= radius) return false;
  const nx = r > 1e-6 ? dx / r : 1;
  const nz = r > 1e-6 ? dz / r : 0;
  pos.x = cx + nx * radius;
  pos.z = cz + nz * radius;
  const into = vel.x * nx + vel.z * nz;
  if (into < 0 && vel) {
    vel.x -= into * nx;
    vel.z -= into * nz;
  }
  return true;
}

export function clampRect(pos, vel, x0, x1, z0, z1) {
  if (pos.x < x0) {
    pos.x = x0;
    if (vel.x < 0) vel.x = 0;
  } else if (pos.x > x1) {
    pos.x = x1;
    if (vel.x > 0) vel.x = 0;
  }
  if (pos.z < z0) {
    pos.z = z0;
    if (vel.z < 0) vel.z = 0;
  } else if (pos.z > z1) {
    pos.z = z1;
    if (vel.z > 0) vel.z = 0;
  }
}

// The camera may not leave a circle around (cx, cz) nor pass into round pillars:
// slide it toward its subject until the way is clear.
export function cameraInCircle(aim, pos, cx, cz, radius, pillars = []) {
  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const r = Math.hypot(dx, dz);
  if (r > radius) {
    // Find t in [0,1] along aim->pos where the circle is crossed.
    const ax = aim.x - cx;
    const az = aim.z - cz;
    const ux = pos.x - aim.x;
    const uz = pos.z - aim.z;
    const A = ux * ux + uz * uz;
    const B = 2 * (ax * ux + az * uz);
    const C = ax * ax + az * az - radius * radius;
    const disc = B * B - 4 * A * C;
    if (A > 1e-9 && disc >= 0) {
      const t = Math.max(0, Math.min(1, (-B + Math.sqrt(disc)) / (2 * A)));
      pos.x = aim.x + ux * t;
      pos.z = aim.z + uz * t;
      pos.y = aim.y + (pos.y - aim.y) * t;
    }
  }
  for (const [px, pz, pr] of pillars) {
    const ux = pos.x - aim.x;
    const uz = pos.z - aim.z;
    const A = ux * ux + uz * uz;
    if (A < 1e-9) continue;
    const ax = aim.x - px;
    const az = aim.z - pz;
    const B = 2 * (ax * ux + az * uz);
    const C = ax * ax + az * az - pr * pr;
    if (C < 0) continue; // the subject itself is inside: nothing sensible to do
    const disc = B * B - 4 * A * C;
    if (disc < 0) continue;
    const t = (-B - Math.sqrt(disc)) / (2 * A);
    if (t > 0 && t < 1) {
      const k = Math.max(0.15, t - 0.05);
      pos.x = aim.x + ux * k;
      pos.z = aim.z + uz * k;
      pos.y = aim.y + (pos.y - aim.y) * k;
    }
  }
}
