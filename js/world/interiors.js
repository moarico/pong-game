// Inside the buildings: rooms split by a partition wall, furniture set against the walls, and the places where
// loot and chests end up (on beds, tables and counters, and in free corners).
//
// A piece of furniture is described in "wall space": u runs along the wall it backs onto (centered on 0), v goes
// out from that wall into the room, and y goes up from the floor. Parts are boxes { b: [u0, v0, y0, u1, v1, y1], c },
// vertical cylinders { cyl: [u, v, y0, r0, r1, h], c } and balls { ball: [u, v, y, r], c }. Parts marked hi only go
// up where the wall has no window behind them.
import { lerp } from '../util.js';

const WOODS = ['#7a5236', '#8b5e3c', '#5f4430', '#a07d57', '#6b4a32'];
const FABRICS = ['#4f6d8a', '#8a4f4f', '#5b7a4f', '#7a6a8a', '#c9a24a', '#3e5c7a', '#9a6a5a', '#556070', '#2f7a7a', '#b0605a'];
const RUGS = ['#8a3b3b', '#3b5a8a', '#6a7a3b', '#8a6a3b', '#5a3b6a', '#c9b48a'];
const WHITE = '#ece8e0', STEEL = '#b9c3cc', BLACK = '#22252a', COUNTER = '#8f8f8a', CREAM = '#e8dcc6';
const BOOKS = ['#a83a32', '#2f5a8a', '#3a7a4a', '#c9a24a', '#6a3a7a', '#d8d0c0', '#2b2b2b'];

const box = (u0, v0, y0, u1, v1, y1, c, hi = false) => ({ b: [u0, v0, y0, u1, v1, y1], c, hi });

// ---------- the furniture ----------

function bed(rng, single) {
  const W = single ? 1.0 : 1.7, L = 2.1, wood = rng.pick(WOODS), sheet = rng.pick(FABRICS);
  const parts = [box(-W / 2, 0, 0, W / 2, L, 0.32, wood), box(-W / 2 + 0.05, 0.08, 0.32, W / 2 - 0.05, L - 0.04, 0.55, WHITE),
    box(-W / 2 + 0.02, 0.75, 0.5, W / 2 - 0.02, L - 0.02, 0.6, sheet), box(-W / 2 + 0.02, 0.68, 0.6, W / 2 - 0.02, 0.86, 0.63, '#f2efe8'),
    box(-W / 2, 0, 0, W / 2, 0.08, 0.95, wood)];
  if (single) parts.push(box(-0.32, 0.12, 0.55, 0.32, 0.48, 0.68, WHITE));
  else parts.push(box(-0.74, 0.12, 0.55, -0.1, 0.48, 0.68, WHITE), box(0.1, 0.12, 0.55, 0.74, 0.48, 0.68, WHITE));
  return { w: W + 0.1, d: L, parts, solid: [-W / 2, 0, W / 2, L, 0.6], tops: [[0, 1.4, 0.62]], chestBeside: true };
}

function nightstand(rng) {
  const wood = rng.pick(WOODS);
  return {
    w: 0.5, d: 0.45, solid: [-0.25, 0, 0.25, 0.45, 0.55],
    parts: [box(-0.25, 0, 0, 0.25, 0.45, 0.55, wood), box(-0.2, 0.45, 0.3, 0.2, 0.46, 0.33, BLACK), { cyl: [0, 0.22, 0.55, 0.06, 0.05, 0.22], c: '#d8d0c0' }, { cyl: [0, 0.22, 0.75, 0.16, 0.09, 0.2], c: rng.pick(['#f2e6c8', '#e8d8b8', '#c8d8e8']) }],
  };
}

function wardrobe(rng) {
  const wood = rng.pick(WOODS);
  return {
    w: 1.2, d: 0.6, tall: true, solid: [-0.6, 0, 0.6, 0.6, 2.0],
    parts: [box(-0.6, 0, 0, 0.6, 0.6, 2.0, wood), box(-0.01, 0.6, 0.08, 0.01, 0.61, 1.94, BLACK), box(-0.1, 0.6, 0.95, -0.06, 0.63, 1.15, STEEL), box(0.06, 0.6, 0.95, 0.1, 0.63, 1.15, STEEL), box(-0.62, 0, 2.0, 0.62, 0.62, 2.05, wood)],
  };
}

function dresser(rng) {
  const wood = rng.pick(WOODS);
  const parts = [box(-0.65, 0, 0, 0.65, 0.5, 0.85, wood)];
  for (let k = 0; k < 3; k++) parts.push(box(-0.6, 0.5, 0.12 + k * 0.25, 0.6, 0.51, 0.14 + k * 0.25, BLACK), box(-0.08, 0.5, 0.2 + k * 0.25, 0.08, 0.53, 0.23 + k * 0.25, STEEL));
  parts.push(box(-0.4, 0.02, 1.15, 0.4, 0.05, 1.75, '#a8c4d4', true), box(-0.44, 0.0, 1.11, 0.44, 0.03, 1.79, wood, true));
  return { w: 1.3, d: 0.5, parts, solid: [-0.65, 0, 0.65, 0.5, 0.85], tops: [[0.35, 0.25, 0.85]] };
}

function sofa(rng) {
  const f = rng.pick(FABRICS), rug = rng.pick(RUGS), wood = rng.pick(WOODS);
  const parts = [box(-1.1, 0.05, 0.08, 1.1, 0.95, 0.42, f), box(-1.1, 0, 0.08, 1.1, 0.26, 0.9, f), box(-1.18, 0, 0.08, -0.96, 0.95, 0.62, f), box(0.96, 0, 0.08, 1.18, 0.95, 0.62, f),
    box(-0.93, 0.26, 0.42, -0.03, 0.92, 0.53, f), box(0.03, 0.26, 0.42, 0.93, 0.92, 0.53, f), box(-1.1, 0.05, 0, 1.1, 0.9, 0.08, BLACK),
    // rug and a coffee table in front
    box(-1.3, 1.0, 0, 1.3, 2.5, 0.015, rug), box(-0.55, 1.3, 0.38, 0.55, 1.9, 0.43, wood)];
  for (const [u, v] of [[-0.5, 1.35], [0.5, 1.35], [-0.5, 1.85], [0.5, 1.85]]) parts.push(box(u - 0.03, v - 0.03, 0, u + 0.03, v + 0.03, 0.38, wood));
  parts.push(box(-0.2, 1.45, 0.43, 0.05, 1.62, 0.47, rng.pick(BOOKS)));
  return { w: 2.4, d: 2.5, parts, solid: [-1.18, 0, 1.18, 0.95, 0.62], solid2: [-0.55, 1.3, 0.55, 1.9, 0.43], tops: [[0.3, 1.6, 0.43], [0.5, 0.6, 0.53]] };
}

function tv(rng) {
  const wood = rng.pick(WOODS);
  return {
    w: 1.7, d: 0.45, tall: true, solid: [-0.8, 0, 0.8, 0.45, 0.5],
    parts: [box(-0.8, 0, 0, 0.8, 0.45, 0.5, wood), box(-0.75, 0.45, 0.1, 0.75, 0.46, 0.4, BLACK), box(-0.7, 0.12, 0.6, 0.7, 0.17, 1.38, BLACK), box(-0.66, 0.171, 0.64, 0.66, 0.175, 1.34, '#1c2a3a'), box(-0.1, 0.1, 0.5, 0.1, 0.25, 0.6, BLACK)],
  };
}

function bookshelf(rng) {
  const wood = rng.pick(WOODS);
  const parts = [box(-0.5, 0, 0, 0.5, 0.36, 1.9, wood)];
  for (let k = 0; k < 4; k++) {
    const y = 0.12 + k * 0.45;
    parts.push(box(-0.46, 0.02, y, 0.46, 0.37, y + 0.03, wood));
    let u = -0.44;
    while (u < 0.38) {
      const bw = 0.05 + rng() * 0.07, bh = 0.24 + rng() * 0.12;
      parts.push(box(u, 0.08, y + 0.03, u + bw, 0.34, y + 0.03 + bh, rng.pick(BOOKS)));
      u += bw + 0.01;
    }
  }
  return { w: 1.0, d: 0.36, tall: true, parts, solid: [-0.5, 0, 0.5, 0.36, 1.9] };
}

function plant(rng) {
  const pot = rng.pick(['#b0603a', '#d8d0c0', '#3a3c40']);
  return {
    w: 0.55, d: 0.55,
    parts: [{ cyl: [0, 0.27, 0, 0.17, 0.21, 0.42], c: pot }, { ball: [0, 0.27, 0.72, 0.32], c: rng.pick(['#3f7a3a', '#4a8a3f', '#356a32']) }, { ball: [0.1, 0.2, 0.95, 0.2], c: '#4f8f45' }],
    solid: [-0.2, 0.07, 0.2, 0.47, 0.6],
  };
}

function kitchen(rng, len) {
  const cab = rng.pick([WHITE, '#7a5236', '#5b6b7d', '#a8b4a0', CREAM]);
  const top = rng.pick([COUNTER, '#2b2b2b', '#d8d3c9']);
  const h = len / 2;
  const parts = [box(-h, 0, 0, h, 0.6, 0.86, cab), box(-h, 0, 0.86, h, 0.64, 0.92, top), box(-h, 0.55, 0, h, 0.6, 0.1, BLACK)];
  for (let u = -h + 0.6; u < h - 0.05; u += 0.6) parts.push(box(u - 0.005, 0.6, 0.12, u + 0.005, 0.61, 0.82, BLACK));
  // sink with a faucet, stove with burners and an oven door
  const s = -h + 0.6 + Math.floor(rng() * Math.max(1, (len - 1.2) / 0.6)) * 0.6 * 0.5;
  parts.push(box(s - 0.3, 0.12, 0.9, s + 0.3, 0.5, 0.925, STEEL), box(s - 0.25, 0.16, 0.86, s + 0.25, 0.46, 0.921, '#5a6066'), { cyl: [s, 0.08, 0.92, 0.02, 0.02, 0.3], c: STEEL });
  const st = h - 0.45;
  parts.push(box(st - 0.3, 0.04, 0.92, st + 0.3, 0.62, 0.94, BLACK), box(st - 0.28, 0.6, 0.15, st + 0.28, 0.62, 0.75, '#1a1c20'));
  for (const [du, dv] of [[-0.13, 0.2], [0.13, 0.2], [-0.13, 0.45], [0.13, 0.45]]) parts.push({ cyl: [st + du, dv, 0.94, 0.08, 0.08, 0.012], c: '#3a3c40' });
  // upper cabinets and a hood over the stove
  parts.push(box(-h, 0, 1.5, h, 0.35, 2.2, cab, true), box(st - 0.35, 0, 1.35, st + 0.35, 0.5, 1.5, STEEL, true));
  for (let u = -h + 0.6; u < h - 0.05; u += 0.6) parts.push(box(u - 0.005, 0.35, 1.52, u + 0.005, 0.36, 2.18, BLACK, true));
  const tops = [];
  for (let u = -h + 0.4; u < h - 0.9; u += 0.9) if (Math.abs(u - s) > 0.5) tops.push([u, 0.3, 0.92]);
  return { w: len, d: 0.64, parts, solid: [-h, 0, h, 0.64, 0.92], tops };
}

function fridge() {
  return {
    w: 0.85, d: 0.72, tall: true, solid: [-0.42, 0, 0.42, 0.72, 1.85],
    parts: [box(-0.42, 0, 0, 0.42, 0.72, 1.85, STEEL), box(-0.4, 0.72, 1.18, 0.4, 0.73, 1.2, '#5a6066'), box(0.3, 0.72, 0.5, 0.34, 0.76, 1.1, '#e8ecf0'), box(0.3, 0.72, 1.3, 0.34, 0.76, 1.7, '#e8ecf0')],
  };
}

function dining(rng) {
  const wood = rng.pick(WOODS), seat = rng.pick(WOODS);
  const parts = [box(-0.6, 0.35, 0.72, 0.6, 1.25, 0.77, wood)];
  for (const [u, v] of [[-0.55, 0.4], [0.55, 0.4], [-0.55, 1.2], [0.55, 1.2]]) parts.push(box(u - 0.03, v - 0.03, 0, u + 0.03, v + 0.03, 0.72, wood));
  const chair = (u, v, face) => {
    parts.push(box(u - 0.22, v - 0.22, 0.42, u + 0.22, v + 0.22, 0.47, seat));
    for (const [a, b] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) parts.push(box(u + a - 0.02, v + b - 0.02, 0, u + a + 0.02, v + b + 0.02, 0.42, seat));
    if (face === 'u-') parts.push(box(u + 0.18, v - 0.22, 0.47, u + 0.22, v + 0.22, 0.95, seat));
    if (face === 'u+') parts.push(box(u - 0.22, v - 0.22, 0.47, u - 0.18, v + 0.22, 0.95, seat));
    if (face === 'v-') parts.push(box(u - 0.22, v + 0.18, 0.47, u + 0.22, v + 0.22, 0.95, seat));
  };
  chair(-0.95, 0.8, 'u+');
  chair(0.95, 0.8, 'u-');
  chair(-0.3, 1.6, 'v-');
  chair(0.3, 1.6, 'v-');
  parts.push({ cyl: [0, 0.8, 0.77, 0.09, 0.06, 0.14], c: rng.pick(['#d8d0c0', '#3a7a8a', '#c9a24a']) });
  return { w: 2.4, d: 1.85, parts, solid: [-0.6, 0.35, 0.6, 1.25, 0.77], tops: [[0.3, 0.6, 0.77]] };
}

function desk(rng) {
  const top = rng.pick(['#ece8e0', '#8b5e3c', '#5f4430', '#c8ccd0']);
  const parts = [box(-0.7, 0, 0.72, 0.7, 0.7, 0.76, top), box(-0.68, 0.02, 0, -0.62, 0.68, 0.72, BLACK), box(0.62, 0.02, 0, 0.68, 0.68, 0.72, BLACK),
    box(-0.32, 0.1, 0.8, 0.32, 0.14, 1.15, BLACK), box(-0.29, 0.141, 0.83, 0.29, 0.145, 1.12, '#22405a'), box(-0.04, 0.05, 0.76, 0.04, 0.12, 0.82, BLACK),
    box(-0.22, 0.3, 0.76, 0.22, 0.45, 0.78, '#3a3c40'),
    // chair
    box(-0.25, 0.85, 0.44, 0.25, 1.3, 0.5, '#2b2d30'), box(-0.25, 1.26, 0.5, 0.25, 1.32, 1.0, '#2b2d30'), { cyl: [0, 1.07, 0, 0.04, 0.04, 0.44], c: BLACK }];
  return { w: 1.45, d: 1.35, parts, solid: [-0.7, 0, 0.7, 0.7, 0.76], tops: [[0.45, 0.4, 0.76]] };
}

function bathtub() {
  return { w: 1.75, d: 0.8, solid: [-0.85, 0, 0.85, 0.8, 0.56], parts: [box(-0.85, 0, 0, 0.85, 0.8, 0.56, WHITE), box(-0.75, 0.1, 0.42, 0.75, 0.7, 0.57, '#a8c8d8'), { cyl: [-0.7, 0.4, 0.56, 0.02, 0.02, 0.2], c: STEEL }] };
}

function toilet() {
  return {
    w: 0.6, d: 0.75, solid: [-0.22, 0, 0.22, 0.7, 0.45],
    parts: [box(-0.22, 0, 0.35, 0.22, 0.2, 0.85, WHITE), { cyl: [0, 0.45, 0, 0.17, 0.21, 0.42], c: WHITE }, { cyl: [0, 0.45, 0.42, 0.22, 0.22, 0.03], c: '#f4f2ee' }],
  };
}

function vanity(rng) {
  return {
    w: 0.85, d: 0.5, solid: [-0.4, 0, 0.4, 0.5, 0.85],
    parts: [box(-0.4, 0, 0, 0.4, 0.5, 0.82, rng.pick(WOODS)), box(-0.42, 0, 0.82, 0.42, 0.52, 0.88, WHITE), box(-0.18, 0.12, 0.86, 0.18, 0.4, 0.89, '#c8d8e0'),
      box(-0.35, 0, 1.2, 0.35, 0.03, 1.8, '#a8c4d4', true), box(-0.38, 0, 1.17, 0.38, 0.02, 1.83, STEEL, true)],
  };
}

function picture(rng) {
  const frame = rng.pick(['#2b2b2b', '#8b5e3c', '#c9a24a', WHITE]);
  return {
    w: 0.9, d: 0.06, wallOnly: true,
    parts: [box(-0.42, 0, 1.3, 0.42, 0.03, 1.9, frame, true), box(-0.36, 0.02, 1.36, 0.36, 0.035, 1.84, rng.pick(['#5a8ac8', '#d8a050', '#5a9a5a', '#a85050', '#7a6aa8']), true)],
  };
}

// Shop pieces: wall shelving full of goods, a drinks cooler and the checkout counter.
function wallShelf(rng, len) {
  const h = len / 2;
  const parts = [box(-h, 0, 0, h, 0.5, 2.0, '#d8d8d4')];
  for (let k = 0; k < 4; k++) {
    const y = 0.15 + k * 0.48;
    parts.push(box(-h + 0.03, 0.02, y, h - 0.03, 0.5, y + 0.03, '#b9c3cc'));
    let u = -h + 0.06;
    while (u < h - 0.2) {
      const gw = 0.12 + rng() * 0.18, gh = 0.15 + rng() * 0.22;
      parts.push(box(u, 0.08, y + 0.03, u + gw, 0.42, y + 0.03 + gh, rng.pick(['#d84a3a', '#3a8ad8', '#f0c040', '#4ab05a', '#e87a2a', '#ffffff', '#8a4ac8'])));
      u += gw + 0.02;
    }
  }
  return { w: len, d: 0.5, tall: true, parts, solid: [-h, 0, h, 0.5, 2.0], tops: [[0, 0.3, 0.66]] };
}

function cooler(len) {
  const h = len / 2;
  const parts = [box(-h, 0, 0, h, 0.7, 2.1, '#e8ecf0'), box(-h + 0.05, 0.69, 0.1, h - 0.05, 0.72, 1.95, '#9fdcff')];
  for (let u = -h + 0.7; u < h; u += 0.7) parts.push(box(u - 0.02, 0.7, 0.1, u + 0.02, 0.74, 1.95, '#b9c3cc'));
  const cols = ['#d84a3a', '#3a8ad8', '#f0c040', '#4ab05a', '#e87a2a'];
  for (let k = 0; k < 4; k++) for (let u = -h + 0.12; u < h - 0.1; u += 0.12) parts.push({ cyl: [u, 0.45, 0.2 + k * 0.45, 0.035, 0.035, 0.24], c: cols[(Math.round(u * 10) + k) % cols.length] });
  return { w: len, d: 0.74, tall: true, parts, solid: [-h, 0, h, 0.74, 2.1] };
}

function checkout(rng) {
  return {
    w: 2.2, d: 0.8, solid: [-1.1, 0, 1.1, 0.8, 1.0],
    parts: [box(-1.1, 0, 0, 1.1, 0.8, 0.95, rng.pick(['#3a5a8a', '#8a3a3a', '#3a7a5a'])), box(-1.12, 0, 0.95, 1.12, 0.82, 1.0, COUNTER), box(0.5, 0.2, 1.0, 0.85, 0.5, 1.25, BLACK), box(0.55, 0.22, 1.25, 0.8, 0.25, 1.4, '#22405a')],
    tops: [[-0.5, 0.4, 1.0]],
  };
}

// Offices: a desk pod and a meeting table.
function meeting(rng) {
  const wood = rng.pick(WOODS);
  const parts = [box(-1.0, 0.4, 0.72, 1.0, 1.4, 0.77, wood), box(-0.9, 0.85, 0, -0.8, 0.95, 0.72, BLACK), box(0.8, 0.85, 0, 0.9, 0.95, 0.72, BLACK)];
  for (const u of [-0.6, 0, 0.6]) for (const v of [0.05, 1.75]) parts.push(box(u - 0.22, v, 0.44, u + 0.22, v + 0.4, 0.5, '#2b2d30'));
  return { w: 2.2, d: 2.2, parts, solid: [-1.0, 0.4, 1.0, 1.4, 0.77], tops: [[0.4, 0.9, 0.77]] };
}

// What goes in each kind of room, most important first.
const ROOMS = {
  living: (rng, R) => [sofa(rng), tv(rng), rng.chance(0.6) ? bookshelf(rng) : plant(rng), plant(rng), picture(rng), picture(rng)],
  kitchen: (rng, R) => [kitchen(rng, Math.min(3.6, Math.max(1.8, Math.floor((R.long - 1) / 0.6) * 0.6))), fridge(), dining(rng), plant(rng), picture(rng)],
  studio: (rng, R) => [sofa(rng), kitchen(rng, Math.min(3.0, Math.max(1.8, Math.floor((R.long - 2.5) / 0.6) * 0.6))), fridge(), tv(rng), plant(rng), picture(rng)],
  bedroom: (rng) => [bed(rng, rng.chance(0.3)), nightstand(rng), rng.chance(0.5) ? wardrobe(rng) : dresser(rng), nightstand(rng), picture(rng), plant(rng)],
  kids: (rng) => [bed(rng, true), desk(rng), bookshelf(rng), picture(rng)],
  bath: (rng) => [bathtub(), toilet(), vanity(rng)],
  study: (rng) => [desk(rng), bookshelf(rng), sofa(rng), plant(rng), picture(rng)],
  office: (rng) => [desk(rng), desk(rng), desk(rng), meeting(rng), plant(rng), bookshelf(rng), picture(rng)],
  shop: (rng, R) => [wallShelf(rng, Math.min(4, R.long - 1)), cooler(Math.min(2.8, R.long - 1.5)), checkout(rng), wallShelf(rng, 2.4), plant(rng)],
  storage: (rng) => [wallShelf(rng, 2.4), plant(rng)],
};

// ---------- placing it ----------

// Fit one piece against a wall of the room. Returns the placement or null.
function fit(room, piece, occ, rng) {
  const walls = room.walls.slice().sort(() => rng() - 0.5);
  for (const wl of walls) {
    if (piece.wallOnly && !wl.solidWall) continue;
    const len = wl.to - wl.from;
    if (len < piece.w) continue;
    const steps = Math.max(1, Math.floor((len - piece.w) / 0.25));
    const start = Math.floor(rng() * (steps + 1));
    for (let k = 0; k <= steps; k++) {
      const at = wl.from + piece.w / 2 + ((start + k) % (steps + 1)) * 0.25;
      const r = footprint(room, wl.side, at, piece.w, piece.d);
      if (r[0] < room.x0 - 0.01 || r[2] > room.x1 + 0.01 || r[1] < room.z0 - 0.01 || r[3] > room.z1 + 0.01) continue;
      if (!piece.wallOnly && occ.some((o) => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1])) continue;
      const blocked = (wl.wins || []).some(([a, b]) => at + piece.w / 2 > a - 0.05 && at - piece.w / 2 < b + 0.05);
      if ((piece.tall || piece.wallOnly) && blocked) continue;
      return { wl, at, rect: r, dropHi: blocked };
    }
  }
  return null;
}

function footprint(room, side, at, w, d) {
  if (side === 'z0') return [at - w / 2, room.z0, at + w / 2, room.z0 + d];
  if (side === 'z1') return [at - w / 2, room.z1 - d, at + w / 2, room.z1];
  if (side === 'x0') return [room.x0, at - w / 2, room.x0 + d, at + w / 2];
  return [room.x1 - d, at - w / 2, room.x1, at + w / 2];
}

// wall space (u, v) -> building local (x, z)
function toLocal(room, side, at, u, v) {
  if (side === 'z0') return [at + u, room.z0 + v];
  if (side === 'z1') return [at - u, room.z1 - v];
  if (side === 'x0') return [room.x0 + v, at - u];
  return [room.x1 - v, at + u];
}

function rectLocal(room, side, at, u0, v0, u1, v1) {
  const [ax, az] = toLocal(room, side, at, u0, v0), [bx, bz] = toLocal(room, side, at, u1, v1);
  return [Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)];
}

// The direction a piece faces (into the room), as a yaw in the building's frame.
function facingYaw(side) {
  return { z0: Math.PI, z1: 0, x0: -Math.PI / 2, x1: Math.PI / 2 }[side];
}

function emit(S, F, y, room, pl, piece) {
  const { wl, at } = pl;
  for (const p of piece.parts) {
    if (p.hi && pl.dropHi) continue;
    if (p.b) {
      const [u0, v0, y0, u1, v1, y1] = p.b;
      const r = rectLocal(room, wl.side, at, u0, v0, u1, v1);
      S.box(F, r[0], y + y0, r[1], r[2], y + y1, r[3], p.c, false);
    } else if (p.cyl) {
      const [u, v, y0, r0, r1, h] = p.cyl;
      const [lx, lz] = toLocal(room, wl.side, at, u, v);
      const [wx, wz] = F.tw(lx, lz);
      S.gb.cylinder(wx, y + y0, wz, r0, r1, h, 10, p.c);
    } else if (p.ball) {
      const [u, v, yy, r] = p.ball;
      const [lx, lz] = toLocal(room, wl.side, at, u, v);
      const [wx, wz] = F.tw(lx, lz);
      S.gb.sphere(wx, y + yy, wz, r, 8, 6, p.c);
    }
  }
  // one collider per solid block of the piece
  for (const s of [piece.solid, piece.solid2]) {
    if (!s) continue;
    const r = rectLocal(room, wl.side, at, s[0], s[1], s[2], s[3]);
    const [x0, z0, x1, z1] = F.rect(r[0], r[1], r[2], r[3]);
    S.W.box(x0, y, z0, x1, y + s[4], z1);
  }
}

// Furnish one floor of a building. ctx: { F, b, y, rooms: [{ x0, z0, x1, z1, kind, walls }], keep: [rects], rng }.
// Returns loot spots on furniture tops and free spots along the walls for chests.
export function furnishFloor(S, ctx) {
  const { F, y, rng } = ctx;
  const occ = ctx.keep.map((r) => r.slice());
  const tops = [], chestSpots = [], floorSpots = [];
  for (const room of ctx.rooms) {
    const make = ROOMS[room.kind];
    if (!make) continue;
    const R = { long: Math.max(room.x1 - room.x0, room.z1 - room.z0) };
    for (const piece of make(rng, R)) {
      if (piece.w <= 0) continue;
      const pl = fit(room, piece, occ, rng);
      if (!pl) continue;
      emit(S, F, y, room, pl, piece);
      if (!piece.wallOnly) occ.push([pl.rect[0] - 0.1, pl.rect[1] - 0.1, pl.rect[2] + 0.1, pl.rect[3] + 0.1]);
      for (const [u, v, h] of piece.tops || []) {
        const [lx, lz] = toLocal(room, pl.wl.side, pl.at, u, v);
        tops.push([lx, lz, h]);
      }
    }
    // free wall spots for a chest (1.2 wide, 0.8 deep), and open floor for loot
    const chest = { w: 1.25, d: 0.85, parts: [] };
    for (let k = 0; k < 3; k++) {
      const pl = fit(room, chest, occ, rng);
      if (!pl) break;
      const [lx, lz] = toLocal(room, pl.wl.side, pl.at, 0, 0.42);
      chestSpots.push({ lx, lz, yaw: facingYaw(pl.wl.side) });
      occ.push(pl.rect);
    }
    for (let k = 0; k < 8; k++) {
      const lx = lerp(room.x0 + 0.6, room.x1 - 0.6, rng()), lz = lerp(room.z0 + 0.6, room.z1 - 0.6, rng());
      if (occ.some((o) => lx > o[0] - 0.3 && lx < o[2] + 0.3 && lz > o[1] - 0.3 && lz < o[3] + 0.3)) continue;
      floorSpots.push([lx, lz, 0]);
    }
  }
  return { tops, chestSpots, floorSpots };
}
