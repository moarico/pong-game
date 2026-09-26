// JavaScript twins of the integer-lattice noise in glsl.js (bit-exact hashing).

function pcgHash(v) {
  const state = (Math.imul(v, 747796405) + 2891336453) >>> 0;
  const word = Math.imul(((state >>> ((state >>> 28) + 4)) ^ state) >>> 0, 277803737) >>> 0;
  return ((word >>> 22) ^ word) >>> 0;
}

function latticeHash(x, y) {
  return pcgHash((Math.imul(x, 1597334677) ^ Math.imul(y, 3812015801)) >>> 0) / 4294967296;
}

export function inoise(x, y) {
  const fx = Math.floor(x);
  const fy = Math.floor(y);
  const ix = fx + 65536;
  const iy = fy + 65536;
  const tx = x - fx;
  const ty = y - fy;
  const ux = tx * tx * (3 - 2 * tx);
  const uy = ty * ty * (3 - 2 * ty);
  const a = latticeHash(ix, iy);
  const b = latticeHash(ix + 1, iy);
  const c = latticeHash(ix, iy + 1);
  const d = latticeHash(ix + 1, iy + 1);
  return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
}

// Smooth 1D noise in [0, 1] for slow global variation (wind strength and the like).
export function noise1(t, seed = 0) {
  return inoise(t, seed * 17.13 + 0.5);
}

// Deterministic PRNG for scene generation.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
