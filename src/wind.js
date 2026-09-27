import { WIND_DIR } from './config.js';
import { inoise, noise1 } from './noise.js';

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// One wind for the whole world. The grass shader, the dust, the clouds and the
// samurai's sash all read from here, so a gust you see rolling across the field
// is the same gust that tugs the cloth when it reaches you.
export class Wind {
  constructor(shared) {
    this.shared = shared;
    this.dir = WIND_DIR.clone();
    this.time = 0;
    this.strength = 0.55;
    this.boost = 0; // extra wind for the title screen
    this.scroll = shared.uWindScroll.value; // metres the gust pattern has travelled
    shared.uWindDir.value.copy(this.dir);
  }

  update(dt) {
    this.time += dt;
    const t = this.time;
    // Slow swells between calm and blustery, with the odd strong spell.
    const swell = noise1(t * 0.055, 1) * 0.7 + noise1(t * 0.19, 2) * 0.3;
    const spell = smoothstep(0.62, 0.9, noise1(t * 0.021, 3));
    this.strength = 0.3 + swell * 0.5 + spell * 0.35 + this.boost;
    // Gust bands travel downwind faster when it blows harder.
    const speed = 3.2 + this.strength * 5.0;
    this.scroll.x += this.dir.x * speed * dt;
    this.scroll.y += this.dir.y * speed * dt;
    // The grass feels only part of the title screen's extra breeze; the cloth all of it.
    this.shared.uWindStrength.value = this.strength - this.boost * 0.6;
  }

  // Gust intensity (0..1) at a world position. Mirrors windGust() in glsl.js.
  gustAt(x, z) {
    const qx = x - this.scroll.x;
    const qz = z - this.scroll.y;
    const d = this.dir;
    const rx = qx * d.x + qz * d.y;
    const rz = -qx * d.y + qz * d.x;
    const n = inoise(rx * 0.06, rz * 0.024) * 0.62 + inoise(rx * 0.15 + 17, rz * 0.07 + 3) * 0.38;
    return smoothstep(0.26, 0.8, n);
  }

  // Air velocity (m/s) at a point, including gusts and a little turbulence.
  velocityAt(x, y, z, out) {
    const g = this.gustAt(x, z);
    const base = this.strength * (2.0 + 6.0 * g);
    const t = this.time;
    const tx = (noise1(t * 1.7 + x * 0.3, 7) - 0.5) * 2.2 * (0.4 + this.strength);
    const ty = (noise1(t * 1.3 + y * 0.5, 8) - 0.5) * 1.2 * (0.4 + this.strength);
    const tz = (noise1(t * 1.9 + z * 0.3, 9) - 0.5) * 2.2 * (0.4 + this.strength);
    out.set(this.dir.x * base + tx, ty, this.dir.y * base + tz);
    return out;
  }
}
