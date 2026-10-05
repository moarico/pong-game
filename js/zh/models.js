// Detailed models built from Zero Hour-style parts (parts.js): the battle bus under its balloon, the golden
// chest, the supply drop, and the off-road truck. Smooth shells come from lathes and extrusions; trim, glass,
// lights and hardware are small parts merged in. One material reads each paint's metalness and roughness.
import * as THREE from 'three';
import { Bx, Sp, Cyl, Cap, torus, partGeo, mrMaterial, MRTAB } from './parts.js';
import { zhTextures } from './textures.js';

// paints used here: [metalness, roughness]
const PAINT = {
  0x2a62b8: [0.45, 0.32], 0x1e3f73: [0.45, 0.35], 0x20262e: [0.6, 0.35], 0x0e1418: [0.2, 0.06], 0xdfe6ee: [0.3, 0.3],
  0xc9a33a: [1, 0.25], 0xe0b84a: [1, 0.2], 0x5a3a20: [0, 0.75], 0x6e4826: [0, 0.7], 0x2b2b2b: [0.1, 0.8], 0x8a9096: [0.9, 0.3],
  0xfff0b8: [0, 0.2], 0xd23a2e: [0, 0.4], 0x3a3f45: [0.7, 0.4], 0x151515: [0, 0.9],
};
for (const k in PAINT) MRTAB[k] = PAINT[k];

let MAT = null;
export function modelMaterial() {
  if (!MAT) MAT = mrMaterial({ roughness: 0.6, metalness: 0.2, envMapIntensity: 1 });
  return MAT;
}

// A side profile (in the z/y plane) extruded across x, with rounded edges.
function extrudeSide(points, width, color, bevel = 0.06, x = 0) {
  const s = new THREE.Shape();
  s.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: width - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 4 });
  // shape x -> world z, shape y -> world y, extrusion -> world x
  g.rotateY(-Math.PI / 2);
  g.translate((width - bevel * 2) / 2, 0, 0);
  return { g, p: [x, 0, 0], c: color };
}

// Rounded-rectangle profile points.
function roundRect(z0, y0, z1, y1, r, seg = 4) {
  const pts = [];
  const corner = (cz, cy, a0) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push([cz + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(z1 - r, y0 + r, -Math.PI / 2);
  corner(z1 - r, y1 - r, 0);
  corner(z0 + r, y1 - r, Math.PI / 2);
  corner(z0 + r, y0 + r, Math.PI);
  return pts;
}

function wheel(items, x, y, z, r, w, tire, rim) {
  const side = Math.sign(x) || 1;
  items.push(Cyl(r, w, x, y, z, tire, 'x'));
  items.push(Cyl(r * 0.62, w + 0.02, x, y, z, 0x2b2b2b, 'x'));
  items.push(Cyl(r * 0.5, 0.04, x + side * (w / 2 + 0.01), y, z, rim, 'x'));
  items.push(Cyl(r * 0.16, 0.06, x + side * (w / 2 + 0.03), y, z, 0x3a3f45, 'x'));
  // tread blocks
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    items.push(Bx(w * 0.9, 0.05, 0.12, x, y + Math.sin(a) * r, z + Math.cos(a) * r, tire, Math.PI / 2 - a));
  }
}

// ---------- the battle bus ----------

export function busModel() {
  const g = new THREE.Group();
  const BLUE = 0x2a62b8, NAVY = 0x1e3f73, DARK = 0x20262e, GLASS = 0x0e1418, LIGHT = 0xdfe6ee, CHROME = 0x8a9096;
  const items = [];
  // body: rounded side profile, a little nose at the front (-z)
  const prof = roundRect(-3.3, 0.35, 3.3, 2.95, 0.38);
  items.push(extrudeSide(prof, 2.6, BLUE, 0.1));
  // skirt and stripe
  items.push(Bx(2.64, 0.3, 6.5, 0, 0.5, 0, NAVY));
  items.push(Bx(2.66, 0.08, 6.3, 0, 1.28, 0, LIGHT));
  // windows: a dark glass band with pillars, windshield and rear window
  items.push(Bx(2.64, 0.85, 5.6, 0, 1.95, 0.2, GLASS));
  for (let z = -2.4; z <= 2.9; z += 0.88) items.push(Bx(2.66, 0.9, 0.1, 0, 1.95, z, BLUE));
  items.push(Bx(2.2, 1.0, 0.06, 0, 1.95, -3.36, GLASS));
  items.push(Bx(0.08, 1.0, 0.07, 0, 1.95, -3.37, BLUE));
  items.push(Bx(2.0, 0.7, 0.06, 0, 2.0, 3.36, GLASS));
  // front: grille, bumper, headlights, sign box
  items.push(Bx(1.6, 0.5, 0.06, 0, 0.95, -3.38, DARK));
  for (let k = 0; k < 6; k++) items.push(Bx(1.5, 0.03, 0.07, 0, 0.75 + k * 0.08, -3.4, CHROME));
  items.push(Bx(2.7, 0.25, 0.22, 0, 0.45, -3.42, DARK));
  items.push(Bx(2.7, 0.25, 0.22, 0, 0.45, 3.42, DARK));
  for (const s of [-1, 1]) {
    items.push(Cyl(0.16, 0.06, s * 0.98, 1.0, -3.39, 0xfff0b8, 'z'));
    items.push(Cyl(0.19, 0.04, s * 0.98, 1.0, -3.37, CHROME, 'z'));
    items.push(Bx(0.2, 0.14, 0.04, s * 1.02, 1.0, 3.39, 0xd23a2e));
    // mirrors
    items.push(Bx(0.05, 0.05, 0.4, s * 1.42, 2.0, -3.0, DARK));
    items.push(Bx(0.08, 0.32, 0.2, s * 1.62, 1.95, -3.2, DARK));
  }
  items.push(Bx(1.4, 0.26, 0.08, 0, 2.72, -3.36, DARK));
  items.push(Bx(1.3, 0.18, 0.09, 0, 2.72, -3.37, LIGHT));
  // roof: hatch and rails, a rear ladder
  items.push(Bx(1.0, 0.1, 1.0, 0, 3.0, 0.4, DARK));
  for (const s of [-1, 1]) items.push(Bx(0.06, 0.06, 5.6, s * 1.05, 3.02, 0.2, CHROME));
  for (let k = 0; k < 6; k++) items.push(Bx(0.5, 0.04, 0.05, 0.6, 0.7 + k * 0.38, 3.42, CHROME));
  // wheels in dark arches
  for (const [x, z] of [[-1.25, -2.2], [1.25, -2.2], [-1.25, 2.2], [1.25, 2.2]]) {
    items.push(Bx(0.08, 0.9, 1.3, x * 1.04, 0.6, z, DARK));
    wheel(items, x, 0.5, z, 0.5, 0.36, 0x151515, CHROME);
  }
  // cables from the bus roof corners up to the load ring
  const ringY = 10.2;
  for (const [x, z] of [[-1.1, -2.9], [1.1, -2.9], [-1.1, 2.9], [1.1, 2.9]]) {
    items.push(...Cap(0.035, [x, 2.95, z], [x * 0.9, ringY, z * 0.42], 0x3a3f45));
  }
  // load ring and burner
  items.push(torus(1.35, 0.07, 0, ringY, 0, 0x3a3f45, [Math.PI / 2, 0, 0]));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    items.push(...Cap(0.03, [Math.cos(a) * 1.35, ringY, Math.sin(a) * 1.35], [Math.cos(a) * 1.9, ringY + 1.9, Math.sin(a) * 1.9], 0x3a3f45));
  }
  items.push(Cyl(0.32, 0.6, 0, ringY + 0.35, 0, CHROME, 'y'));
  items.push(Cyl(0.18, 0.3, 0, ringY + 0.8, 0, 0x3a3f45, 'y'));
  const mat = modelMaterial();
  const body = new THREE.Mesh(partGeo(items), mat);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  // the envelope: a smooth teardrop in tall gores of blue and pale blue, with a navy skirt
  const pts = [];
  const H = 20, R = 8.6, y0 = ringY + 1.9;
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    // narrow throat, full belly two thirds up, round crown
    const r = t < 0.12 ? 1.9 + t * 10 : R * Math.sin(Math.min(1, (t - 0.12) / 0.6) * Math.PI * 0.5) * (t > 0.72 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.72) / 0.28, 2))) : 1);
    pts.push(new THREE.Vector2(Math.max(0.01, r), y0 + t * H));
  }
  const lathe = new THREE.LatheGeometry(pts, 48);
  const pos = lathe.attributes.position, cols = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const gore = Math.floor(((Math.atan2(z, x) + Math.PI) / (Math.PI * 2)) * 16 + 0.5) % 16;
    const t = (y - y0) / H;
    c.setHex(t < 0.16 ? NAVY : gore % 2 ? 0x3b7fd4 : 0xd6e6f5);
    if (t > 0.92) c.setHex(0x3b7fd4);
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }
  lathe.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const env = new THREE.Mesh(lathe, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0, side: THREE.DoubleSide }));
  env.castShadow = true;
  g.add(env);
  // seams down each gore
  const seams = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + Math.PI / 16;
    for (let i = 0; i < pts.length - 1; i += 2) {
      const p0 = pts[i], p1 = pts[Math.min(pts.length - 1, i + 2)];
      seams.push(...Cap(0.04, [Math.cos(a) * p0.x * 1.003, p0.y, Math.sin(a) * p0.x * 1.003], [Math.cos(a) * p1.x * 1.003, p1.y, Math.sin(a) * p1.x * 1.003], NAVY));
    }
  }
  g.add(new THREE.Mesh(partGeo(seams), mat));
  // blue burner flame
  const T = zhTextures();
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow, color: 0x6ab0ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  flame.material.color.multiplyScalar(4);
  flame.position.set(0, ringY + 1.5, 0);
  flame.scale.setScalar(2.4);
  g.add(flame);
  g.userData.flame = flame;
  return g;
}

// ---------- the golden chest ----------

export function chestParts() {
  const WOOD = 0x5a3a20, WOOD2 = 0x6e4826, GOLD = 0xc9a33a, GOLD2 = 0xe0b84a;
  const base = [Bx(1.08, 0.48, 0.66, 0, 0.26, 0, WOOD)];
  // planks
  for (let k = 0; k < 4; k++) base.push(Bx(1.09, 0.012, 0.67, 0, 0.1 + k * 0.11, 0, WOOD2));
  // gold bands, corners, feet and the lock plate
  for (const x of [-0.42, 0.42]) base.push(Bx(0.08, 0.5, 0.68, x, 0.26, 0, GOLD));
  // a gold rim around the open top (not a lid-sized slab), a dark hold inside, and a gold base plate
  base.push(Bx(1.12, 0.06, 0.08, 0, 0.5, -0.31, GOLD2), Bx(1.12, 0.06, 0.08, 0, 0.5, 0.31, GOLD2), Bx(0.08, 0.06, 0.56, -0.52, 0.5, 0, GOLD2), Bx(0.08, 0.06, 0.56, 0.52, 0.5, 0, GOLD2));
  base.push(Bx(0.98, 0.012, 0.54, 0, 0.497, 0, 0x22140a), Bx(1.12, 0.06, 0.7, 0, 0.04, 0, GOLD));
  // side handles
  for (const x of [-0.565, 0.565]) base.push(Bx(0.025, 0.05, 0.2, x, 0.34, 0, GOLD2), Bx(0.03, 0.1, 0.025, x, 0.3, -0.09, GOLD), Bx(0.03, 0.1, 0.025, x, 0.3, 0.09, GOLD));
  for (const x of [-0.55, 0.55]) for (const z of [-0.34, 0.34]) base.push(Bx(0.08, 0.5, 0.08, x, 0.26, z, GOLD2));
  base.push(Bx(0.2, 0.22, 0.03, 0, 0.36, -0.345, GOLD2), Sp(0.03, 0.04, 0.02, 0, 0.33, -0.36, 0x2b2b2b));
  for (const x of [-0.3, 0.3]) for (const y of [0.15, 0.38]) base.push(Sp(0.018, 0.018, 0.012, x, y, -0.335, GOLD2));
  // lid: a curved top around a hinge at its back edge (local z = 0)
  const lid = [];
  const half = new THREE.CylinderGeometry(0.35, 0.35, 1.08, 20, 1, false, 0, Math.PI);
  half.rotateZ(Math.PI / 2); // axis along x, the half-round on top
  lid.push({ g: half, p: [0, 0, -0.35], c: WOOD, r: [0, 0, 0] });
  lid.push({ g: new THREE.BoxGeometry(1.08, 0.04, 0.7), p: [0, 0.0, -0.35], c: WOOD2 });
  for (const x of [-0.42, 0.42, 0]) {
    const band = new THREE.CylinderGeometry(0.365, 0.365, 0.08, 20, 1, false, 0, Math.PI);
    band.rotateZ(Math.PI / 2);
    lid.push({ g: band, p: [x, 0, -0.35], c: x === 0 ? GOLD2 : GOLD, s: [1, 1, 1] });
  }
  lid.push(Bx(0.16, 0.14, 0.04, 0, -0.02, -0.71, GOLD2));
  return { base: partGeo(base), lid: partGeo(lid) };
}

// ---------- the supply drop ----------

export function supplyParts() {
  const BLUE = 0x2a62b8, GOLD = 0xc9a33a, METAL = 0x3a3f45;
  const crate = [Bx(1.76, 1.36, 1.76, 0, 0.7, 0, BLUE)];
  for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) crate.push(Bx(0.14, 1.44, 0.14, x, 0.72, z, GOLD));
  for (const y of [0.06, 1.38]) {
    crate.push(Bx(1.9, 0.12, 0.14, 0, y, -0.9, GOLD), Bx(1.9, 0.12, 0.14, 0, y, 0.9, GOLD), Bx(0.14, 0.12, 1.9, -0.9, y, 0, GOLD), Bx(0.14, 0.12, 1.9, 0.9, y, 0, GOLD));
  }
  for (const s of [-1, 1]) {
    crate.push(Bx(1.4, 0.1, 0.04, 0, 0.7, s * 0.9, 0xdfe6ee));
    crate.push(Bx(0.04, 0.1, 1.4, s * 0.9, 0.7, 0, 0xdfe6ee));
  }
  const balloon = [];
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    pts.push(new THREE.Vector2(Math.max(0.01, 2.7 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.5) * (t > 0.7 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.7) / 0.3, 2))) : 1) + (t < 0.1 ? 0.4 : 0)), 3.6 + t * 5));
  }
  const lathe = new THREE.LatheGeometry(pts, 24);
  const pos = lathe.attributes.position, cols = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const gore = Math.floor(((Math.atan2(pos.getZ(i), pos.getX(i)) + Math.PI) / (Math.PI * 2)) * 8 + 0.5) % 8;
    c.setHex(gore % 2 ? 0x3b7fd4 : 0xeef3f8);
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }
  lathe.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  for (const [x, z] of [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]]) balloon.push(...Cap(0.025, [x, 1.42, z], [x * 1.6, 3.8, z * 1.6], METAL));
  return { crate: partGeo(crate), balloon: lathe, lines: partGeo(balloon) };
}

// ---------- the off-road truck ----------

const TRUCKS = new Map();
export function truckGeometry(color) {
  const key = String(color);
  if (TRUCKS.has(key)) return TRUCKS.get(key);
  const paint = new THREE.Color(color).getHex();
  if (!MRTAB[paint]) MRTAB[paint] = [0.35, 0.38];
  const DARK = 0x20262e, GLASS = 0x0e1418, CHROME = 0x8a9096, BLACK = 0x151515;
  const items = [];
  // lower body: long box with rounded edges, front faces -z
  items.push(extrudeSide(roundRect(-2.45, 0.55, 2.45, 1.25, 0.18), 2.0, paint, 0.08));
  // hood sloping to the windshield, cab, and the bed walls
  items.push(extrudeSide([[-2.4, 1.2], [-0.9, 1.2], [-0.85, 1.42], [-2.35, 1.36]], 1.9, paint, 0.05));
  items.push(extrudeSide([[-0.9, 1.2], [0.7, 1.2], [0.6, 2.15], [-0.45, 2.15], [-0.95, 1.45]], 1.86, paint, 0.06));
  items.push(Bx(1.7, 0.62, 0.06, 0, 1.73, -0.73, GLASS));
  for (const s of [-1, 1]) {
    items.push(Bx(0.06, 0.55, 1.15, s * 0.95, 1.72, -0.12, GLASS));
    items.push(Bx(0.08, 0.5, 1.6, s * 0.97, 1.5, 1.6, paint));
    // fenders flared over the wheels
    // fenders flared over the wheels
    for (const z of [-1.55, 1.55]) items.push(extrudeSide([[z - 0.68, 0.98], [z + 0.68, 0.98], [z + 0.5, 1.32], [z - 0.5, 1.32]], 0.3, DARK, 0.03, s * 1.02));
  }
  items.push(Bx(1.94, 0.5, 0.08, 0, 1.5, 2.42, paint));
  items.push(Bx(1.86, 0.06, 1.6, 0, 1.22, 1.6, DARK));
  // roll bar, light bar, bull bar, bumpers, lights, mirrors, spare tire
  items.push(...Cap(0.05, [-0.85, 1.25, 0.95], [-0.85, 2.2, 0.95], DARK), ...Cap(0.05, [0.85, 1.25, 0.95], [0.85, 2.2, 0.95], DARK), ...Cap(0.05, [-0.85, 2.2, 0.95], [0.85, 2.2, 0.95], DARK));
  items.push(Bx(1.2, 0.1, 0.12, 0, 2.2, -0.35, DARK));
  for (let k = 0; k < 5; k++) items.push(Cyl(0.05, 0.03, -0.4 + k * 0.2, 2.2, -0.42, 0xfff0b8, 'z'));
  items.push(Bx(2.1, 0.22, 0.25, 0, 0.62, -2.52, DARK), Bx(2.1, 0.22, 0.25, 0, 0.62, 2.52, DARK));
  items.push(...Cap(0.05, [-0.7, 0.75, -2.62], [-0.7, 1.35, -2.62], DARK), ...Cap(0.05, [0.7, 0.75, -2.62], [0.7, 1.35, -2.62], DARK), ...Cap(0.05, [-0.7, 1.35, -2.62], [0.7, 1.35, -2.62], DARK));
  items.push(Bx(1.0, 0.3, 0.05, 0, 1.0, -2.47, DARK));
  for (const s of [-1, 1]) {
    items.push(Cyl(0.13, 0.06, s * 0.72, 1.02, -2.47, 0xfff0b8, 'z'));
    items.push(Bx(0.18, 0.12, 0.05, s * 0.8, 1.02, 2.47, 0xd23a2e));
    items.push(Bx(0.06, 0.2, 0.14, s * 1.05, 1.75, -0.75, DARK));
  }
  items.push(Cyl(0.42, 0.28, 0, 1.25, 2.62, BLACK, 'z'), Cyl(0.24, 0.3, 0, 1.25, 2.62, CHROME, 'z'));
  // the four big wheels
  for (const [x, z] of [[-1.02, -1.55], [1.02, -1.55], [-1.02, 1.55], [1.02, 1.55]]) wheel(items, x, 0.48, z, 0.48, 0.38, BLACK, CHROME);
  const g = partGeo(items);
  TRUCKS.set(key, g);
  return g;
}

// ---------- gliders ----------

// A smooth sheet from a grid of points; col(i, j) gives each vertex color.
function sheet(nu, nv, at, col) {
  const P = [], C = [], idx = [];
  const c = new THREE.Color();
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      const p = at(i / nu, j / nv);
      P.push(p[0], p[1], p[2]);
      c.setHex(col(i / nu, j / nv));
      C.push(c.r, c.g, c.b);
    }
  }
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i, b = a + 1, d = a + nu + 1, e = d + 1;
      idx.push(a, d, b, b, d, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

let SAILMAT = null;
// Hands meet the control bar about 0.6 m below the glider's origin.
export function gliderModel(o) {
  const hex = (css) => new THREE.Color(css).getHex();
  const c1 = hex(o.primary), c2 = hex(o.secondary), c3 = hex(o.accent);
  const METAL = 0x8a9096, DARK = 0x20262e;
  if (!SAILMAT) SAILMAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, side: THREE.DoubleSide });
  const g = new THREE.Group();
  const frame = [];
  let sail;
  if (o.glider === 'para') {
    // a ram-air canopy: an arc of cells, a little airfoil thickness, lines down to the risers
    const R = 2.7, cy = -1.5, span = 1.05, cells = 9;
    const at = (top) => (u, v) => {
      const a = (u - 0.5) * 2 * span, th = top ? 0.2 * Math.sin(Math.PI * Math.min(1, v * 1.15)) : 0;
      return [Math.sin(a) * (R + th), cy + Math.cos(a) * (R + th), -1.0 + v * 2.0];
    };
    const col = (u, v) => (v < 0.12 ? c3 : Math.floor(u * cells) % 2 ? c1 : c2);
    const top = sheet(54, 10, at(true), col), bot = sheet(54, 10, at(false), (u) => (Math.floor(u * cells) % 2 ? c1 : c2));
    sail = [top, bot];
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6 - 0.5) * 2 * span * 0.95;
      const p = [Math.sin(a) * R, cy + Math.cos(a) * R, -0.2];
      const side = a < 0 ? -1 : 1;
      frame.push(...Cap(0.008, p, [side * 0.45, 0.05, 0], 0xdfe6ee));
    }
    // risers and the frame the hands hold
    for (const s of [-1, 1]) frame.push(...Cap(0.03, [s * 0.45, 0.05, 0], [s * 0.45, -0.62, 0], METAL));
    frame.push(...Cap(0.03, [-0.5, -0.62, 0], [0.5, -0.62, 0], METAL));
    for (const s of [-1, 1]) frame.push(Cyl(0.045, 0.16, s * 0.4, -0.62, 0, DARK, 'x'));
  } else if (o.glider === 'moth' || o.glider === 'bird') {
    // two swept, cambered wings over a central keel
    const moth = o.glider === 'moth';
    for (const s of [-1, 1]) {
      const wing = sheet(16, 8, (u, v) => {
        const x = s * (0.15 + u * 2.3);
        const lead = -0.5 - u * 0.3 + (moth ? Math.sin(u * Math.PI) * 0.3 : 0);
        const trail = 0.4 + u * 0.6 - (moth ? 0 : u * u * 0.7);
        const z = lead + (trail - lead) * v;
        const y = 0.35 + Math.sin(u * Math.PI * 0.5) * 0.35 + Math.sin(v * Math.PI) * 0.12;
        return [x, y, z];
      }, (u, v) => (v > 0.75 ? c3 : moth ? (u > 0.6 ? c2 : c1) : Math.floor(u * 6) % 2 ? c1 : c2));
      sail = (sail || []).concat([wing]);
    }
    frame.push(...Cap(0.03, [0, 0.35, -0.6], [0, 0.35, 0.6], METAL));
    for (const s of [-1, 1]) frame.push(...Cap(0.025, [0, 0.35, 0], [s * 0.45, -0.62, 0], METAL));
    frame.push(...Cap(0.03, [-0.5, -0.62, 0], [0.5, -0.62, 0], METAL));
  } else {
    // a hang glider: a cambered delta sail on a leading-edge frame, an A-frame down to the control bar
    const tipX = 2.4, nose = -1.6, tail = 0.9;
    for (const s of [-1, 1]) {
      const half = sheet(14, 8, (u, v) => {
        const lx = s * u * tipX, lz = nose + u * (tail - nose) * 0.95;
        const z = lz + v * (tail - lz) * (1 - u * 0.85);
        const y = 0.45 - u * 0.15 + Math.sin(v * Math.PI) * 0.18 * (1 - u * 0.6);
        return [lx, y, z];
      }, (u, v) => (v > 0.8 ? c3 : u > 0.5 ? c2 : c1));
      sail = (sail || []).concat([half]);
      frame.push(...Cap(0.035, [0, 0.45, nose], [s * tipX, 0.3, nose + (tail - nose) * 0.95], METAL));
      // battens across the sail
      for (let k = 1; k < 5; k++) {
        const u = k / 5, lx = s * u * tipX, lz = nose + u * (tail - nose) * 0.95;
        frame.push(...Cap(0.012, [lx, 0.45 - u * 0.15, lz], [lx, 0.45 - u * 0.15, lz + (tail - lz) * (1 - u * 0.85)], 0xdfe6ee));
      }
      frame.push(...Cap(0.03, [0, 0.45, 0], [s * 0.5, -0.62, 0.15], METAL));
    }
    frame.push(...Cap(0.04, [0, 0.47, nose], [0, 0.47, tail], METAL));
    frame.push(...Cap(0.03, [-0.55, -0.62, 0.15], [0.55, -0.62, 0.15], METAL));
  }
  for (const s of sail) {
    const m = new THREE.Mesh(s, SAILMAT);
    m.castShadow = true;
    g.add(m);
  }
  g.add(new THREE.Mesh(partGeo(frame), modelMaterial()));
  return g;
}
