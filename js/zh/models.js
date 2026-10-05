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
  const BLUE = 0x2a62b8, NAVY = 0x1e3f73, DARK = 0x20262e, GLASS = 0x14161a, LIGHT = 0xdfe6ee, CHROME = 0x8a9096, BLACK = 0x151515;
  if (!MRTAB[BLUE]) MRTAB[BLUE] = [0.35, 0.32];
  if (!MRTAB[LIGHT]) MRTAB[LIGHT] = [0.2, 0.35];
  const items = [];
  // A classic coach with a short hood: passenger box from z -3.45 to 4.2, hood out front to -4.45.
  items.push(extrudeSide(roundRect(-3.45, 0.42, 4.2, 3.05, 0.4), 2.6, BLUE, 0.1));
  items.push(extrudeSide([[-4.48, 0.55], [-3.4, 0.55], [-3.4, 1.66], [-3.62, 1.74], [-4.3, 1.6], [-4.48, 1.36]], 2.2, BLUE, 0.1));
  // navy skirt, white band under the windows, a thin band above them
  items.push(Bx(2.64, 0.32, 7.6, 0, 0.6, 0.38, NAVY), Bx(2.65, 0.12, 7.6, 0, 1.36, 0.38, LIGHT), Bx(2.65, 0.06, 7.6, 0, 2.6, 0.38, LIGHT));
  // side windows: framed panes, slightly inset, both sides; the door is on the right at the front
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 7; k++) {
      const z = -2.75 + k * 0.96;
      if (sx > 0 && k === 0) continue;
      items.push(Bx(0.04, 0.86, 0.86, sx * 1.3, 1.98, z, LIGHT), Bx(0.06, 0.74, 0.74, sx * 1.305, 1.98, z, GLASS));
      items.push(Bx(0.07, 0.04, 0.74, sx * 1.31, 2.1, z, LIGHT));
    }
    // mirrors on arms at the front corners
    items.push(...Cap(0.025, [sx * 1.25, 2.2, -3.35], [sx * 1.6, 2.25, -3.55], DARK), Bx(0.1, 0.36, 0.22, sx * 1.66, 2.1, -3.58, DARK));
    // fenders, mud flaps
    items.push(extrudeSide([[-4.5, 0.75], [-3.3, 0.75], [-3.45, 1.25], [-4.35, 1.25]], 0.36, DARK, 0.04, sx * 1.06));
    items.push(Bx(0.04, 0.4, 0.3, sx * 1.2, 0.45, -3.25, BLACK), Bx(0.04, 0.4, 0.3, sx * 1.2, 0.45, 3.4, BLACK));
    // headlights and turn signals on the fenders, tail lights at the back
    items.push(Cyl(0.17, 0.08, sx * 0.92, 1.12, -4.46, 0xfff0b8, 'z'), Cyl(0.2, 0.05, sx * 0.92, 1.12, -4.43, CHROME, 'z'), Bx(0.12, 0.08, 0.05, sx * 1.1, 1.3, -4.4, 0xffa040));
    items.push(Bx(0.18, 0.3, 0.05, sx * 1.12, 1.0, 4.24, 0xd23a2e), Bx(0.18, 0.12, 0.05, sx * 1.12, 1.25, 4.24, 0xffa040));
  }
  // folding door: two tall glass leaves in a light frame
  items.push(Bx(0.05, 2.0, 0.92, 1.3, 1.45, -2.75, LIGHT));
  for (const z of [-2.97, -2.53]) items.push(Bx(0.06, 1.7, 0.38, 1.31, 1.5, z, GLASS));
  items.push(Bx(0.07, 0.05, 0.86, 1.31, 1.0, -2.75, LIGHT), Bx(0.4, 0.08, 0.9, 1.1, 0.42, -2.75, DARK));
  // windshield in two panes, sign box above it
  items.push(Bx(2.3, 1.02, 0.06, 0, 2.08, -3.47, LIGHT), Bx(1.08, 0.9, 0.07, -0.56, 2.08, -3.48, GLASS), Bx(1.08, 0.9, 0.07, 0.56, 2.08, -3.48, GLASS));
  items.push(Bx(1.9, 0.34, 0.1, 0, 2.8, -3.47, DARK));
  // hood: grille with chrome slats, a badge, front bumper with a step
  items.push(Bx(1.2, 0.6, 0.05, 0, 1.08, -4.5, DARK));
  for (let k = 0; k < 7; k++) items.push(Bx(1.12, 0.035, 0.06, 0, 0.82 + k * 0.08, -4.52, CHROME));
  items.push(Bx(0.3, 0.1, 0.05, 0, 1.47, -4.5, CHROME));
  items.push(Bx(2.7, 0.26, 0.24, 0, 0.55, -4.6, CHROME), Bx(2.7, 0.26, 0.24, 0, 0.55, 4.32, DARK));
  // rear: emergency door with a window, a ladder, the engine grille and an exhaust
  items.push(Bx(1.0, 2.0, 0.05, 0, 1.6, 4.22, LIGHT), Bx(0.8, 0.7, 0.06, 0, 2.15, 4.23, GLASS), Bx(0.12, 0.04, 0.1, 0.35, 1.5, 4.26, CHROME));
  for (let k = 0; k < 6; k++) items.push(Bx(0.42, 0.04, 0.05, -0.95, 0.8 + k * 0.36, 4.27, CHROME));
  items.push(...Cap(0.03, [-1.16, 0.75, 4.27], [-1.16, 2.9, 4.27], CHROME), ...Cap(0.03, [-0.74, 0.75, 4.27], [-0.74, 2.9, 4.27], CHROME));
  items.push(Cyl(0.06, 0.6, 1.0, 0.4, 4.1, DARK, 'z'));
  // roof: trims along the edges, two hatches, an air unit, and the steel cradle the cables hang from
  for (const sx of [-1, 1]) items.push(Bx(0.08, 0.08, 7.5, sx * 1.22, 3.02, 0.38, LIGHT));
  items.push(Bx(0.9, 0.08, 0.9, 0, 3.08, -1.2, DARK), Bx(0.9, 0.08, 0.9, 0, 3.08, 2.0, DARK), Bx(1.2, 0.3, 1.0, 0, 3.2, 0.4, 0xb9c3cc));
  for (let k = 0; k < 4; k++) items.push(Bx(1.0, 0.02, 0.08, 0, 3.36, 0.05 + k * 0.23, DARK));
  const CR = [[-1.1, -3.0], [1.1, -3.0], [-1.1, 3.8], [1.1, 3.8]];
  for (const sx of [-1.1, 1.1]) items.push(...Cap(0.06, [sx, 3.2, -3.0], [sx, 3.2, 3.8], DARK));
  for (const z of [-3.0, 3.8]) items.push(...Cap(0.06, [-1.1, 3.2, z], [1.1, 3.2, z], DARK));
  for (const [x, z] of CR) items.push(...Cap(0.06, [x, 3.0, z], [x, 3.25, z], DARK));
  // wheels: singles up front under the hood, doubles at the back
  for (const sx of [-1, 1]) {
    wheel(items, sx * 1.12, 0.52, -3.9, 0.52, 0.34, BLACK, CHROME);
    wheel(items, sx * 1.12, 0.52, 2.65, 0.52, 0.34, BLACK, CHROME);
    wheel(items, sx * 0.78, 0.52, 2.65, 0.52, 0.3, BLACK, 0x3a3f45);
    // fender lip arching over the rear wheels
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6) * Math.PI;
      items.push(Bx(0.1, 0.1, 0.36, sx * 1.33, 0.52 + Math.sin(a) * 0.66, 2.65 + Math.cos(a) * 0.66, DARK, Math.PI / 2 - a, 0, 0));
    }
  }
  // cables from the cradle corners up to the load ring
  const ringY = 11.2;
  for (const [x, z] of CR) items.push(...Cap(0.04, [x, 3.25, z], [x * 0.85, ringY, z * 0.3], 0x3a3f45));
  items.push(...Cap(0.03, [-1.1, 3.25, 0.4], [-1.2, ringY, 0], 0x3a3f45), ...Cap(0.03, [1.1, 3.25, 0.4], [1.2, ringY, 0], 0x3a3f45));
  // load ring and burner
  items.push(torus(1.35, 0.07, 0, ringY, 0, 0x3a3f45, [Math.PI / 2, 0, 0]));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    items.push(...Cap(0.03, [Math.cos(a) * 1.35, ringY, Math.sin(a) * 1.35], [Math.cos(a) * 1.9, ringY + 1.9, Math.sin(a) * 1.9], 0x3a3f45));
  }
  items.push(Cyl(0.32, 0.6, 0, ringY + 0.35, 0, CHROME, 'y'));
  items.push(Cyl(0.18, 0.3, 0, ringY + 0.8, 0, 0x3a3f45, 'y'));
  // lit destination sign over the windshield
  const sign = document.createElement('canvas');
  sign.width = 256;
  sign.height = 48;
  const sc = sign.getContext('2d');
  sc.fillStyle = '#0b0f18';
  sc.fillRect(0, 0, 256, 48);
  sc.fillStyle = '#ffd23f';
  sc.font = 'bold 34px sans-serif';
  sc.textAlign = 'center';
  sc.fillText('SKY COACH', 128, 37);
  const signTex = new THREE.CanvasTexture(sign);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.28), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }));
  signMesh.position.set(0, 2.8, -3.53);
  signMesh.rotation.y = Math.PI;
  g.add(signMesh);
  const mat = modelMaterial();
  const body = new THREE.Mesh(partGeo(items), mat);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  // the envelope: a smooth teardrop in tall gores of blue and pale blue, with a navy skirt
  const pts = [];
  const H = 22, R = 9.4, y0 = ringY + 1.9;
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    // narrow throat, full belly two thirds up, round crown
    const r = t < 0.12 ? 1.9 + t * 10 : R * Math.sin(Math.min(1, (t - 0.12) / 0.6) * Math.PI * 0.5) * (t > 0.72 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.72) / 0.28, 2))) : 1);
    pts.push(new THREE.Vector2(Math.max(0.01, r), y0 + t * H));
  }
  const lathe = new THREE.LatheGeometry(pts, 96);
  const pos = lathe.attributes.position, cols = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const frac = ((Math.atan2(z, x) + Math.PI) / (Math.PI * 2)) * 16;
    const gore = Math.floor(frac + 0.5) % 16;
    const t = (y - y0) / H;
    c.setHex(t < 0.16 ? NAVY : gore % 2 ? 0x3b7fd4 : 0xd6e6f5);
    if (t > 0.92) c.setHex(0x3b7fd4);
    // a seam down each gore boundary
    const u = (frac + 0.5) % 1;
    if (u < 0.02 || u > 0.98) c.setHex(NAVY);
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }
  lathe.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const env = new THREE.Mesh(lathe, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0, side: THREE.DoubleSide }));
  env.castShadow = true;
  g.add(env);
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
// An open-top 4x4 pickup. The body is one geometry; the four wheels are their own geometry so they can spin
// and the front pair can steer. Front faces -z; the driver sits on the left seat behind the wheel.
export const TRUCK = {
  wheels: [[-1.02, -1.55], [1.02, -1.55], [-1.02, 1.55], [1.02, 1.55]], wheelY: 0.48, wheelR: 0.48,
  seat: [-0.45, 0.88, 0.32], // where the driver's feet-origin goes, in truck space
  glass: { w: 1.72, h: 0.56, y: 1.86, z: -0.86, tilt: -0.28 },
};
export function truckGeometry(color) {
  const key = String(color);
  if (TRUCKS.has(key)) return TRUCKS.get(key);
  const paint = new THREE.Color(color).getHex();
  if (!MRTAB[paint]) MRTAB[paint] = [0.35, 0.36];
  const DARK = 0x20262e, CHROME = 0x8a9096, BLACK = 0x151515, SEAT = 0x3a2c22, DASH = 0x262a30, TRIM = 0x2e3238;
  const items = [];
  // lower body with rounded ends, front faces -z
  items.push(extrudeSide(roundRect(-2.45, 0.55, 2.45, 1.22, 0.18), 2.0, paint, 0.08));
  // hood with a raised center and a grille
  items.push(extrudeSide([[-2.4, 1.18], [-0.9, 1.18], [-0.86, 1.42], [-2.32, 1.36]], 1.92, paint, 0.05));
  items.push(Bx(0.9, 0.05, 1.3, 0, 1.43, -1.62, paint, 0.04, 0, 0));
  items.push(Bx(1.5, 0.42, 0.06, 0, 0.98, -2.47, DARK));
  for (let i = 0; i < 7; i++) items.push(Bx(0.04, 0.34, 0.03, -0.6 + i * 0.2, 0.98, -2.5, CHROME));
  // open cab: low door panels, a dashboard, two bucket seats, the steering wheel and a windshield frame
  for (const sx of [-1, 1]) {
    items.push(Bx(0.08, 0.5, 1.6, sx * 0.96, 1.46, -0.1, paint));
    items.push(Bx(0.1, 0.05, 1.62, sx * 0.96, 1.73, -0.1, TRIM));
    items.push(Bx(0.02, 0.06, 0.14, sx * 1.01, 1.48, -0.3, CHROME));
  }
  items.push(Bx(1.84, 0.3, 0.3, 0, 1.38, -0.78, DASH), Bx(1.84, 0.06, 0.36, 0, 1.55, -0.76, TRIM));
  items.push(Cyl(0.06, 0.04, -0.62, 1.48, -0.62, 0xd0d6dc, 'z'), Cyl(0.06, 0.04, -0.28, 1.48, -0.62, 0xd0d6dc, 'z'));
  for (const x of [-0.45, 0.45]) {
    items.push(Bx(0.66, 0.14, 0.6, x, 1.31, 0.3, SEAT), Bx(0.62, 0.62, 0.14, x, 1.66, 0.62, SEAT, -0.12, 0, 0), Bx(0.3, 0.16, 0.1, x, 2.04, 0.66, SEAT, -0.12, 0, 0));
  }
  items.push(...Cap(0.025, [-0.45, 1.5, -0.6], [-0.45, 1.66, -0.38], DARK));
  {
    const ring = new THREE.TorusGeometry(0.19, 0.022, 8, 24);
    items.push({ g: ring, p: [-0.45, 1.7, -0.36], r: [-0.9, 0, 0], c: DARK });
    items.push(Bx(0.36, 0.03, 0.03, -0.45, 1.7, -0.36, DARK, -0.9, 0, 0));
  }
  // windshield frame (the glass is a separate see-through pane)
  const G = TRUCK.glass;
  for (const sx of [-1, 1]) items.push(Bx(0.06, 0.66, 0.06, sx * 0.9, G.y, G.z, DARK, G.tilt, 0, 0));
  items.push(Bx(1.86, 0.06, 0.08, 0, G.y + 0.31, G.z + 0.09, DARK, G.tilt, 0, 0), Bx(1.86, 0.05, 0.06, 0, G.y - 0.31, G.z - 0.09, DARK));
  // bed: walls, floor, tailgate
  for (const sx of [-1, 1]) items.push(Bx(0.08, 0.5, 1.62, sx * 0.97, 1.47, 1.62, paint), Bx(0.1, 0.05, 1.64, sx * 0.97, 1.73, 1.62, TRIM));
  items.push(Bx(1.94, 0.5, 0.08, 0, 1.47, 2.42, paint), Bx(1.86, 0.06, 1.6, 0, 1.24, 1.6, DARK));
  // fenders flared over the wheels
  for (const sx of [-1, 1]) for (const z of [-1.55, 1.55]) items.push(extrudeSide([[z - 0.7, 0.98], [z + 0.7, 0.98], [z + 0.52, 1.34], [z - 0.52, 1.34]], 0.3, DARK, 0.03, sx * 1.02));
  // roll bar with a light bar, bumpers, a bull bar, lights, mirrors and the spare tire
  items.push(...Cap(0.05, [-0.85, 1.25, 0.95], [-0.85, 2.25, 0.95], DARK), ...Cap(0.05, [0.85, 1.25, 0.95], [0.85, 2.25, 0.95], DARK), ...Cap(0.05, [-0.85, 2.25, 0.95], [0.85, 2.25, 0.95], DARK));
  items.push(Bx(1.2, 0.1, 0.12, 0, 2.3, 0.95, DARK));
  for (let k = 0; k < 5; k++) items.push(Cyl(0.05, 0.03, -0.4 + k * 0.2, 2.3, 0.88, 0xfff0b8, 'z'));
  items.push(Bx(2.1, 0.22, 0.25, 0, 0.62, -2.52, DARK), Bx(2.1, 0.22, 0.25, 0, 0.62, 2.52, DARK));
  items.push(...Cap(0.05, [-0.7, 0.75, -2.64], [-0.7, 1.32, -2.64], DARK), ...Cap(0.05, [0.7, 0.75, -2.64], [0.7, 1.32, -2.64], DARK), ...Cap(0.05, [-0.7, 1.32, -2.64], [0.7, 1.32, -2.64], DARK));
  for (const sx of [-1, 1]) {
    items.push(Cyl(0.13, 0.06, sx * 0.76, 1.12, -2.47, 0xfff0b8, 'z'), Cyl(0.15, 0.04, sx * 0.76, 1.12, -2.45, CHROME, 'z'));
    items.push(Bx(0.18, 0.12, 0.05, sx * 0.8, 1.02, 2.47, 0xd23a2e));
    items.push(Bx(0.05, 0.16, 0.2, sx * 1.08, 1.82, -0.62, DARK), Cyl(0.015, 0.16, sx * 1.02, 1.74, -0.62, DARK, 'x'));
  }
  items.push(Cyl(0.42, 0.28, 0, 1.25, 2.62, BLACK, 'z'), Cyl(0.24, 0.3, 0, 1.25, 2.62, CHROME, 'z'));
  // axles and a skid plate under the body
  items.push(Cyl(0.06, 2.0, 0, 0.48, -1.55, DARK, 'x'), Cyl(0.06, 2.0, 0, 0.48, 1.55, DARK, 'x'), Bx(1.2, 0.06, 3.6, 0, 0.5, 0, DARK));
  const g = partGeo(items);
  TRUCKS.set(key, g);
  return g;
}

// A parked sedan for the streets (white body, so instance colors paint it). It runs along x, nose at -x.
let SEDAN = null;
export function sedanGeometry() {
  if (SEDAN) return SEDAN;
  const BODY = 0xf2f2f2, GLASS = 0x14161a, DARK = 0x20262e, CHROME = 0x8a9096, BLACK = 0x151515;
  if (!MRTAB[BODY]) MRTAB[BODY] = [0.4, 0.3];
  const items = [];
  // lower body and the greenhouse, side profiles extruded across the car (x = length here, via a 90 degree turn)
  const lower = extrudeSide(roundRect(-2.2, 0.32, 2.2, 0.98, 0.2), 1.8, BODY, 0.08);
  const cabin = extrudeSide([[-1.05, 0.95], [1.15, 0.95], [0.75, 1.5], [-0.65, 1.52]], 1.62, BODY, 0.06);
  for (const it of [lower, cabin]) it.r = [0, Math.PI / 2, 0];
  items.push(lower, cabin);
  // windows: windshield, rear glass and side glass
  items.push(Bx(0.06, 0.66, 1.5, -0.86, 1.23, 0, GLASS, 0, 0, -0.61), Bx(0.06, 0.64, 1.5, 0.95, 1.225, 0, GLASS, 0, 0, 0.63));
  for (const sz of [-1, 1]) {
    items.push(Bx(1.55, 0.4, 0.04, 0.05, 1.22, sz * 0.81, GLASS), Bx(0.06, 0.42, 0.05, 0.05, 1.22, sz * 0.82, BODY));
    items.push(Bx(0.08, 0.04, 0.2, -0.95, 1.05, sz * 0.95, DARK));
    for (const x of [-1.35, 1.35]) wheelX(items, x, 0.34, sz * 0.82, 0.34, 0.24, BLACK, CHROME, sz);
    items.push(Bx(0.22, 0.12, 0.04, -2.22, 0.78, sz * 0.62, 0xfff0b8), Bx(0.12, 0.14, 0.04, 2.22, 0.78, sz * 0.62, 0xd23a2e));
  }
  items.push(Bx(0.18, 0.18, 1.86, -2.24, 0.45, 0, CHROME), Bx(0.18, 0.18, 1.86, 2.24, 0.45, 0, DARK), Bx(0.05, 0.22, 0.9, -2.27, 0.7, 0, DARK));
  SEDAN = partGeo(items);
  return SEDAN;
}
function wheelX(items, x, y, z, r, w, tire, rim, side) {
  items.push(Cyl(r, w, x, y, z, tire, 'z'), Cyl(r * 0.6, w + 0.02, x, y, z, 0x2b2b2b, 'z'), Cyl(r * 0.5, 0.03, x, y, z + side * (w / 2 + 0.01), rim, 'z'));
}

// One wheel, centered on its axle (x is the axle direction, +x the outer side), so it can spin around x.
let WHEEL = null;
export function truckWheelGeometry() {
  if (WHEEL) return WHEEL;
  const items = [];
  wheel(items, 0, 0, 0, TRUCK.wheelR, 0.38, 0x151515, 0x8a9096);
  WHEEL = partGeo(items);
  return WHEEL;
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
