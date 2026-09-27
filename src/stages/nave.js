// The layout of the Sunken Cathedral, shared by the hall and the thing in its crypt.

export const WATER_Y = 0.14;
export const HALF_W = 13; // outer walls
export const PILLAR_X = 7.5;
export const PILLAR_Z = [15, 9, 3, -3, -9];
export const CRYPT_Z = [-15, -21]; // pillars standing in the flooded crypt
export const END_Z = -27;
export const ENTRY_Z = 21;

// The broken edge of the nave floor, where it falls away into the crypt.
export function edgeZ(x) {
  return -8.2 + 0.55 * Math.sin(x * 1.1 + 0.4) + 0.35 * Math.sin(x * 2.9 + 2.1) + 0.2 * Math.sin(x * 6.3);
}

export function floorHeight(x, z) {
  return z < edgeZ(x) ? -7.5 : 0;
}

export const PILLARS = [];
for (const z of PILLAR_Z) for (const s of [-1, 1]) PILLARS.push([s * PILLAR_X, z, 1.05]);
