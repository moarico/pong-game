import * as THREE from 'three';
import { profile, superPoint, smoothstep, lerp, clamp, ribbonRings, capRings, tubeRings } from './meshbuilder.js';

// ---------------------------------------------------------------------------
// The samurai's head: a lean young face with high cheekbones, a strong jaw and a
// squared chin, a straight nose and full lips, shaggy black hair falling from
// under the kasa. The head is lofted from horizontal slices, the features are
// pushed out of it, and the fine detail (eyes, brows, lips) is drawn by the
// character shader from uv = face coordinates in metres.
// ---------------------------------------------------------------------------

// Head-local centre of the face: on the head's axis, at the eye line.
export const FACE_C = new THREE.Vector3(0, 0.105, 0.015);

// Slices from chin to crown: half-width, depth to the front, depth to the back,
// forward shift, squareness (2 = ellipse).
const SLICES = profile([
  // y       a       bF     bB     cz      n
  [-0.121, 0.008, 0.06, 0.008, 0.024, 2.0],
  [-0.117, 0.03, 0.083, 0.014, 0.018, 2.6],
  [-0.109, 0.042, 0.089, 0.02, 0.014, 3.1],
  [-0.096, 0.052, 0.093, 0.032, 0.009, 3.0],
  [-0.077, 0.06, 0.094, 0.056, 0.004, 2.8],
  [-0.052, 0.066, 0.094, 0.079, 0.0, 2.7],
  [-0.026, 0.0712, 0.094, 0.093, -0.004, 2.6],
  [0.0, 0.0732, 0.094, 0.1, -0.006, 2.5],
  [0.022, 0.0738, 0.097, 0.102, -0.006, 2.4],
  [0.05, 0.0712, 0.091, 0.101, -0.008, 2.3],
  [0.08, 0.065, 0.077, 0.091, -0.01, 2.2],
  [0.103, 0.048, 0.052, 0.063, -0.012, 2.1],
  [0.116, 0.02, 0.02, 0.024, -0.012, 2.0],
  [0.1195, 0.004, 0.004, 0.005, -0.012, 2.0],
]);
const Y_BOTTOM = -0.121;
const Y_TOP = 0.1195;

const _s = new THREE.Vector3();

// A point on the bare skull (no features), face-centred coordinates.
function slicePoint(theta, y, out) {
  const [a, bF, bB, cz, n] = SLICES(y);
  superPoint(theta, a, bF, bB, n, cz, _s);
  return out.set(_s.x, y, _s.z);
}

const g2 = (dx, sx, dy, sy) => Math.exp(-(dx * dx) / (sx * sx) - (dy * dy) / (sy * sy));

// How far the features stand out of the bare skull at (x, y) on the front of the face.
function relief(x, y) {
  const ax = Math.abs(x);
  let d = 0;
  // Brow ridge: straight and firm.
  d += 0.0048 * Math.exp(-(((y - 0.021) / 0.0085) ** 2)) * smoothstep(0.064, 0.036, ax);
  // Eye sockets beneath it, with the curve of the eyeball between the lids.
  d -= 0.0105 * g2(ax - 0.031, 0.0175, y - 0.001, 0.0125);
  d += 0.0042 * g2(ax - 0.031, 0.0105, y - 0.0005, 0.0062);
  // Nose: a straight, narrow bridge running down to a defined tip, wings at either side.
  const tn = clamp((0.013 - y) / 0.058, 0, 1);
  const bw = lerp(0.005, 0.0088, tn);
  const bridge = Math.exp(-((x / bw) ** 2)) * smoothstep(0.018, 0.007, y) * smoothstep(-0.058, -0.047, y);
  d += bridge * lerp(0.005, 0.025, Math.pow(tn, 1.2));
  d += 0.0042 * g2(x, 0.0082, y + 0.0455, 0.0065);
  d += 0.0042 * g2(ax - 0.0128, 0.0058, y + 0.0495, 0.0052);
  // Lips: the upper a little thinner, the lower fuller; a line between; the hollow
  // below the lower lip; a faint groove down from the nose.
  const my = -0.0725;
  d += 0.0046 * g2(x, 0.0215, y - (my + 0.0056), 0.0044);
  d += 0.0061 * g2(x, 0.0195, y - (my - 0.0063), 0.0049);
  d -= 0.0021 * g2(x, 0.0235, y - my, 0.0011);
  d -= 0.0034 * g2(x, 0.021, y + 0.0885, 0.0042);
  d -= 0.0009 * g2(x, 0.0026, y + 0.061, 0.0058);
  // Chin: squared and prominent, with a faint cleft.
  d += 0.0072 * g2(x, 0.021, y + 0.1035, 0.011) * (1 + 0.25 * smoothstep(0.004, 0.016, ax));
  d -= 0.0011 * g2(x, 0.0024, y + 0.106, 0.0075);
  // High cheekbones, hollows beneath them.
  d += 0.0046 * g2(ax - 0.05, 0.016, y + 0.013, 0.012);
  d -= 0.0034 * g2(ax - 0.046, 0.015, y + 0.058, 0.016);
  // The jaw's edge.
  d += 0.0022 * g2(ax - 0.047, 0.012, y + 0.086, 0.01);
  return d;
}

// A point on the face: skull plus features, pushed along the slice's outward direction.
export function facePoint(theta, y, out, grow = 0) {
  slicePoint(theta, y, out);
  const cz = SLICES(y)[3];
  const nx = out.x;
  const nz = out.z - cz;
  const nl = Math.hypot(nx, nz) || 1;
  const front = smoothstep(0.035, 0.075, out.z);
  const d = front * relief(out.x, y) + grow;
  out.x += (nx / nl) * d;
  out.z += (nz / nl) * d;
  return out;
}

// Rings from chin to crown, denser across the eyes and mouth.
function headRows() {
  const ys = [];
  let y = Y_BOTTOM;
  while (y < Y_TOP) {
    ys.push(y);
    const fine = Math.max(g2(0, 1, y - 0.004, 0.022), g2(0, 1, y + 0.07, 0.03), g2(0, 1, y + 0.045, 0.012));
    y += lerp(0.0062, 0.0026, fine);
  }
  ys.push(Y_TOP);
  return ys;
}

// uv for the face shader: face coordinates in metres.
const faceUv = (p) => [p.x - FACE_C.x, p.y - FACE_C.y];

export function buildYoungHead(ctx, W) {
  const { M, B, T, bind } = ctx;
  const HM = T('head');
  const head = bind.head;
  const toBind = (p) => p.clone().add(FACE_C).add(head);

  // Skin.
  // Columns crowd together across the face, where the detail is.
  const cols = 150;
  const colTheta = (i) => {
    const t0 = (i / cols) * Math.PI * 2;
    return t0 - 0.62 * Math.sin(t0 - Math.PI / 2);
  };
  const rows = headRows();
  const rings = [];
  const p = new THREE.Vector3();
  for (const y of rows) {
    const ring = [];
    for (let i = 0; i < cols; i++) ring.push(toBind(facePoint(colTheta(i), y, p)));
    rings.push(ring);
  }
  const top = rings[rings.length - 1];
  const apex = new THREE.Vector3();
  for (const q of top) apex.add(q);
  apex.divideScalar(top.length);
  rings.push(top.map((q) => q.clone().lerp(apex, 0.98)));
  B.grid(rings, M.face, 'head', {
    outward: (q) => new THREE.Vector3(q.x - head.x, 0.25 * (q.y - head.y - FACE_C.y), q.z - head.z - FACE_C.z),
    uvFn: (u, v) => [0, 0],
  });
  // The grid gives uv in metres along the surface; replace them with face coordinates.
  const start = B.count - rings.length * (cols + 1);
  for (let k = start; k < B.count; k++) {
    B.uv[k * 2] = B.pos[k * 3] - head.x - FACE_C.x;
    B.uv[k * 2 + 1] = B.pos[k * 3 + 1] - head.y - FACE_C.y;
  }

  // Ears, tucked under the hair.
  for (const sx of [1, -1]) {
    const ear = new THREE.SphereGeometry(1, 14, 12);
    const ep = ear.attributes.position;
    for (let i = 0; i < ep.count; i++) {
      const x = ep.getX(i);
      const y = ep.getY(i);
      const z = ep.getZ(i);
      // A shell: thin, rim rolled, lobe at the bottom.
      const r = 1 + 0.12 * y;
      ep.setXYZ(i, x * 0.005, y * 0.027, z * 0.016 * r);
    }
    ear.computeVertexNormals();
    const m = new THREE.Matrix4().makeTranslation(sx * 0.0735, FACE_C.y - 0.008, FACE_C.z - 0.012)
      .multiply(new THREE.Matrix4().makeRotationY(sx * 0.25))
      .multiply(new THREE.Matrix4().makeRotationX(-0.12));
    B.add(ear, M.ear, 'head', { matrix: HM.clone().multiply(m) });
  }

  buildHair(ctx, W);
}

// ---------------------------------------------------------------------------
// Hair: a close cap over the scalp and ragged locks: a fringe over the brow,
// strands down past the cheekbones to the jaw, flicking out at the ends, and a
// shaggy nape.
// ---------------------------------------------------------------------------

// Hairline height at bearing theta (0 = his left side, pi/2 = front).
function hairline(theta) {
  const front = Math.max(0, Math.sin(theta));
  const back = Math.max(0, -Math.sin(theta));
  // The fringe falls to the brows in ragged points; the sides cover the ears.
  const jag = 0.009 * Math.abs(Math.sin(theta * 23.0)) + 0.005 * Math.sin(theta * 57.0);
  return lerp(-0.035, 0.03 + jag * front, front * front) - 0.05 * Math.pow(back, 1.5);
}

function scalpPoint(theta, y, lift, out) {
  slicePoint(theta, y, out);
  const cz = SLICES(y)[3];
  const nx = out.x;
  const nz = out.z - cz;
  const nl = Math.hypot(nx, nz) || 1;
  // Near the crown the outward direction tips upward.
  const up = smoothstep(0.07, 0.12, y);
  out.x += (nx / nl) * lift * (1 - up * 0.6);
  out.z += (nz / nl) * lift * (1 - up * 0.6);
  out.y += lift * up;
  return out;
}

function buildHair(ctx, W) {
  const { M, B, bind } = ctx;
  const head = bind.head;
  const toBind = (q) => q.clone().add(FACE_C).add(head);
  // Cap: from the crown down to the hairline, thicker on top.
  const cols = 72;
  const rows = 16;
  const rings = [];
  const q = new THREE.Vector3();
  for (let j = 0; j <= rows; j++) {
    const t = j / rows;
    const ring = [];
    for (let i = 0; i < cols; i++) {
      const th = (i / cols) * Math.PI * 2;
      const y = lerp(Y_TOP - 0.001, hairline(th), t);
      // Thick over the ears and the back, thinner at the brow.
      const side = 1 - Math.abs(Math.sin(th));
      const lift = lerp(0.009, 0.004 + 0.008 * side, t * t) + 0.0015 * Math.sin(th * 7 + t * 5);
      ring.push(toBind(scalpPoint(th, y, lift, q)));
    }
    rings.push(ring);
  }
  B.grid(rings, M.hair, 'head', { outward: (p) => new THREE.Vector3(p.x - head.x, p.y - head.y - 0.1, p.z - head.z) });

  // Locks: ribbons laid over the scalp and falling free at the ends.
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // A lock lies over the scalp while the skull swells out beneath it, then hangs
  // straight down where the head falls away (past the temples, below the crown at
  // the back), its end kicking outward.
  const surf = new THREE.Vector3();
  const lock = (th0, th1, y0, y1, width, flick) => {
    const n = 9;
    const pts = [];
    const ups = [];
    let hang = null;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const th = lerp(th0, th1, t * t);
      const y = Math.min(lerp(y0, y1, t), Y_TOP - 0.002);
      const lift = 0.006 + 0.003 * t;
      scalpPoint(th, y, lift, surf);
      const cz = SLICES(y)[3];
      const out = new THREE.Vector3(Math.cos(th), 0, Math.sin(th));
      let pnt = surf.clone();
      if (hang) {
        // Hanging straight down from where it left the scalp, kicking out at the end.
        const h = hang.clone().setY(y).addScaledVector(out, flick * t * t * t);
        const rh = Math.hypot(h.x, h.z - cz);
        const rs = Math.hypot(surf.x, surf.z - cz);
        if (rh > rs) pnt = h;
      } else if (y < 0.035) {
        hang = surf.clone();
      }
      pts.push(toBind(pnt));
      ups.push(out.clone().multiplyScalar(0.8).add(new THREE.Vector3(0, 0.2, 0)).normalize());
    }
    const r = capRings(ribbonRings(pts, ups, width, 0.005, 6, (t) => (1 - 0.9 * t * t) * (0.75 + 0.25 * Math.sin(Math.PI * Math.min(1, t * 1.6)))), true, 0.002);
    B.grid(r, M.hair, 'head', { outward: null });
  };
  const deg = Math.PI / 180;
  // A few loose locks over the fringe, the longest reaching the eyes.
  for (let k = 0; k < 5; k++) {
    const u = (k / 4) * 2 - 1;
    const th = Math.PI / 2 + u * 0.5 + (rnd() - 0.5) * 0.1;
    lock(th - u * 0.04, th + u * 0.12 + (rnd() - 0.5) * 0.3, 0.1, 0.004 + rnd() * 0.02 + Math.abs(u) * 0.01, 0.03 + rnd() * 0.01, 0.005 + rnd() * 0.004);
  }
  // Side locks framing the face, down past the cheekbones, ends flicking outward.
  for (const side of [1, -1]) {
    for (let k = 0; k < 9; k++) {
      const a = (side > 0 ? 0 : Math.PI) + side * (4 + k * 7) * deg;
      const end = a + side * (-6 + rnd() * 12) * deg;
      lock(a, end, 0.104, -0.012 - rnd() * 0.05 - (k < 4 ? 0.02 : 0), 0.028 + rnd() * 0.01, 0.012 + rnd() * 0.018);
    }
  }
  // Back: shaggy to the nape.
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI / 2 + ((k / 8) * 2 - 1) * 92 * deg;
    lock(a, a + (rnd() - 0.5) * 0.3, 0.112, -0.058 - rnd() * 0.03, 0.03 + rnd() * 0.008, 0.008 + rnd() * 0.012);
  }
  // A few loose locks over the crown so the top isn't a smooth shell.
  for (let k = 0; k < 7; k++) {
    const a = rnd() * Math.PI * 2;
    lock(a, a + (rnd() - 0.5) * 0.5, Y_TOP - 0.004, 0.06 + rnd() * 0.03, 0.024, 0.004);
  }
}

// The kasa's chin cords: from the hat's inner ring down in front of the ears,
// along the jaw, to a knot under the chin with two short ends hanging from it.
export function buildChinCords(ctx, W, material) {
  const { B, bind } = ctx;
  const head = bind.head;
  const toBind = (q) => q.clone().add(FACE_C).add(head);
  const deg = Math.PI / 180;
  const q = new THREE.Vector3();
  const knot = new THREE.Vector3(0, -0.132, 0.058);
  for (const side of [1, -1]) {
    const pts = [];
    const route = [
      [8, 0.07, 0.012], [12, 0.03, 0.01], [22, -0.01, 0.009], [34, -0.05, 0.008], [52, -0.09, 0.008], [70, -0.112, 0.009],
    ];
    for (const [a, y, lift] of route) {
      const th = side > 0 ? a * deg : Math.PI - a * deg;
      pts.push(toBind(facePoint(th, y, q, lift)));
    }
    pts.push(toBind(knot.clone().setX(side * 0.006)));
    const weights = (p) => {
      const k = smoothstep(head.y + 0.16, head.y + 0.1, p.y);
      return W(['hat', 1 - k], ['head', k]);
    };
    B.grid(tubeRings(pts, 0.0021, 6), material, weights, { outward: null });
    // Loose ends below the knot.
    const ends = [knot.clone().setX(side * 0.004), knot.clone().add(new THREE.Vector3(side * 0.008, -0.022, 0.006)), knot.clone().add(new THREE.Vector3(side * 0.011, -0.046, 0.004))].map(toBind);
    B.grid(capRings(tubeRings(ends, 0.0019, 6), true, 0.002), material, 'head', { outward: null });
  }
  const k = new THREE.SphereGeometry(0.0055, 10, 8);
  B.add(k, material, 'head', { matrix: new THREE.Matrix4().makeTranslation(head.x + knot.x, head.y + FACE_C.y + knot.y, head.z + FACE_C.z + knot.z) });
}
