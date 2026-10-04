// Trees, bushes and boulders. Canopies are clouds of alpha-cut leaf cards painted at load time, with normals
// pointing out of the crown so light wraps around it softly, and a wind sway in the vertex shader. Trunks
// are tapered, branching cylinders with a bark texture. Boulders are noise-displaced spheres.
import * as THREE from 'three';
import { makeRng } from '../util.js';
import { field } from '../zh/textures.js';

// ---------- painted textures ----------

function cnv(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h ?? w;
  return c;
}

function leafTex(kind) {
  const S = 256, c = cnv(S), x = c.getContext('2d'), rng = makeRng(kind.length * 97 + 5);
  const leaf = (px, py, len, wid, a, shade) => {
    x.save();
    x.translate(px, py);
    x.rotate(a);
    const g = Math.round(150 + shade * 105);
    x.fillStyle = `rgb(${g},${g},${g})`;
    x.beginPath();
    x.moveTo(0, 0);
    x.quadraticCurveTo(wid, len * 0.45, 0, len);
    x.quadraticCurveTo(-wid, len * 0.45, 0, 0);
    x.fill();
    x.strokeStyle = `rgba(60,60,60,0.35)`;
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(0, len * 0.05);
    x.lineTo(0, len * 0.92);
    x.stroke();
    x.restore();
  };
  if (kind === 'broad') {
    // a cluster of rounded leaves on short stems, densest in the middle
    for (let i = 0; i < 70; i++) {
      const r = Math.sqrt(rng()) * S * 0.42, a = rng() * Math.PI * 2;
      leaf(S / 2 + Math.cos(a) * r * 0.9, S / 2 + Math.sin(a) * r, 26 + rng() * 22, 11 + rng() * 7, a + Math.PI / 2 + (rng() - 0.5) * 0.8, rng());
    }
  } else if (kind === 'needle') {
    // one fir branch filling the card: a stem down the middle, side twigs, needles everywhere
    const stem = (x0, y0, x1, y1, w) => {
      x.strokeStyle = 'rgb(105,105,105)';
      x.lineWidth = w;
      x.beginPath();
      x.moveTo(x0, y0);
      x.lineTo(x1, y1);
      x.stroke();
    };
    stem(S / 2, 0, S / 2, S, 4);
    for (let k = 0; k < 9; k++) {
      const y0 = 14 + k * 26, side = k % 2 ? 1 : -1, L = (S / 2 - 10) * (1 - k * 0.07);
      stem(S / 2, y0, S / 2 + side * L, y0 + 30, 2);
    }
    for (let k = 0; k < 1400; k++) {
      const t = rng(), px = S / 2 + (rng() - 0.5) * S * 0.92 * (1 - t * 0.25), py = t * S;
      if (Math.abs(px - S / 2) > S * 0.47) continue;
      const g = Math.round(130 + rng() * 120);
      x.strokeStyle = `rgb(${g},${g},${g})`;
      x.lineWidth = 1.6;
      const a = Math.PI / 2 + (rng() - 0.5) * 1.6;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + Math.cos(a) * 9, py + Math.sin(a) * 9);
      x.stroke();
    }
  } else if (kind === 'frond') {
    // a palm frond: long leaflets off a curved rib
    x.strokeStyle = 'rgb(150,150,150)';
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(S / 2, 4);
    x.quadraticCurveTo(S / 2 + 10, S / 2, S / 2, S - 4);
    x.stroke();
    for (let k = 0; k < 46; k++) {
      const t = k / 46, py = 8 + t * (S - 16), w = Math.sin(t * Math.PI) * 110 + 10;
      for (const side of [-1, 1]) {
        const g = Math.round(150 + rng() * 100);
        x.strokeStyle = `rgb(${g},${g},${g})`;
        x.lineWidth = 3.5;
        x.beginPath();
        x.moveTo(S / 2, py);
        x.quadraticCurveTo(S / 2 + side * w * 0.5, py + 6, S / 2 + side * w, py + 22);
        x.stroke();
      }
    }
  } else {
    // willow: long thin hanging leaves
    for (let i = 0; i < 26; i++) {
      const px = 10 + rng() * (S - 20);
      x.strokeStyle = 'rgb(120,120,120)';
      x.lineWidth = 1.5;
      x.beginPath();
      x.moveTo(px, 0);
      x.lineTo(px + (rng() - 0.5) * 16, S);
      x.stroke();
      for (let k = 0; k < 18; k++) leaf(px + (rng() - 0.5) * 10, k * 14 + rng() * 6, 18 + rng() * 10, 4 + rng() * 2, (rng() - 0.5) * 0.9, rng());
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function barkTex() {
  const W = 128, H = 512, c = cnv(W, H), x = c.getContext('2d'), img = x.createImageData(W, H), d = img.data;
  const f = field(128, [4, 8, 16, 32], [0.4, 0.3, 0.2, 0.1], 5);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      // vertical furrows: noise stretched along the trunk
      const n = f[((j >> 2) % 128) * 128 + i], fur = Math.sin(i * 0.35 + n * 8) * 0.5 + 0.5;
      const v = 95 + n * 90 + fur * 40, o = (j * W + i) * 4;
      d[o] = v;
      d[o + 1] = v * 0.93;
      d[o + 2] = v * 0.86;
      d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- materials ----------

export const WIND = { time: { value: 0 } };

// Sway: everything above the ground leans with a slow gust and flutters a little at the tips.
export function noBackfaceFlip(sh) {
  const chunk = THREE.ShaderChunk.normal_fragment_begin.replace('float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;', 'float faceDirection = 1.0;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', chunk);
}

function windPatch(strength) {
  return (sh) => {
    noBackfaceFlip(sh);
    sh.uniforms.uWindT = WIND.time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWindT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
	{
		vec3 wp = vec3( 0.0 );
		#ifdef USE_INSTANCING
			wp = instanceMatrix[ 3 ].xyz;
		#endif
		float h = max( transformed.y, 0.0 );
		float ph = wp.x * 0.07 + wp.z * 0.05;
		float gust = sin( uWindT * 0.9 + ph ) * 0.6 + sin( uWindT * 2.3 + ph * 1.7 ) * 0.25;
		float flutter = sin( uWindT * 7.0 + position.x * 3.0 + position.z * 2.0 + ph * 5.0 ) * 0.05;
		transformed.x += ( gust * 0.035 * h * h * 0.1 + flutter * h * 0.1 ) * ${strength.toFixed(2)};
		transformed.z += ( gust * 0.02 * h * h * 0.1 ) * ${strength.toFixed(2)};
	}`);
  };
}

const MATS = {};
export function foliageMaterials() {
  if (MATS.broad) return MATS;
  const mk = (kind, strength) => {
    const m = new THREE.MeshStandardMaterial({ map: leafTex(kind), alphaTest: 0.45, side: THREE.DoubleSide, vertexColors: true, roughness: 0.78, metalness: 0 });
    m.onBeforeCompile = windPatch(strength);
    m.customProgramCacheKey = () => 'leaves-' + strength;
    return m;
  };
  MATS.broad = mk('broad', 1);
  MATS.needle = mk('needle', 0.6);
  MATS.frond = mk('frond', 1.4);
  MATS.willow = mk('willow', 1.6);
  MATS.bark = new THREE.MeshStandardMaterial({ map: barkTex(), vertexColors: true, roughness: 0.92, metalness: 0 });
  MATS.bark.onBeforeCompile = windPatch(0.35);
  MATS.bark.customProgramCacheKey = () => 'bark';
  MATS.plain = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
  MATS.plain.onBeforeCompile = windPatch(0.2);
  MATS.plain.customProgramCacheKey = () => 'plain-wind';
  return MATS;
}

// ---------- geometry builders ----------

class Mesher {
  constructor() {
    this.P = [];
    this.N = [];
    this.U = [];
    this.C = [];
  }
  vert(p, n, u, c) {
    this.P.push(p[0], p[1], p[2]);
    this.N.push(n[0], n[1], n[2]);
    this.U.push(u[0], u[1]);
    this.C.push(c[0], c[1], c[2]);
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.U, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.C, 3));
    g.computeBoundingSphere();
    return g;
  }
}

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3();
const lin = (hex) => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
};
const shadeC = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

// A leaf card: a quad centered at p, facing a random direction, lit with the crown's outward normal.
function card(M, rng, p, size, normal, col, droop = 0) {
  // card plane axes
  _a.set(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();
  _b.set(0, 1, 0).addScaledVector(normal, 0.5).normalize();
  _c.crossVectors(_a, _b).normalize();
  _a.crossVectors(_b, _c).normalize();
  _b.y -= droop;
  _b.normalize();
  const h = size / 2, n = [normal.x, normal.y, normal.z];
  const v = (sa, sb) => [p.x + _c.x * sa * h + _b.x * sb * h, p.y + _c.y * sa * h + _b.y * sb * h, p.z + _c.z * sa * h + _b.z * sb * h];
  const p00 = v(-1, -1), p10 = v(1, -1), p11 = v(1, 1), p01 = v(-1, 1);
  // a little darker toward the bottom of each card, so the crown reads as layered
  const cd = shadeC(col, 0.82);
  M.vert(p00, n, [0, 0], cd);
  M.vert(p10, n, [1, 0], cd);
  M.vert(p11, n, [1, 1], col);
  M.vert(p00, n, [0, 0], cd);
  M.vert(p11, n, [1, 1], col);
  M.vert(p01, n, [0, 1], col);
}

// A fir branch: a card running out from the trunk along angle a, tipping down at the end.
function branchCard(M, p, a, len, normal, col, upright = false) {
  const ca = Math.cos(a), sa = Math.sin(a), n = [normal.x, normal.y, normal.z];
  let ax, ay, az, bx, by, bz;
  if (upright) {
    ax = 0.5; ay = 0; az = 0;
    bx = 0; by = len; bz = 0;
  } else {
    // across the branch (horizontal) and along it (outward, drooping)
    ax = -sa * len * 0.42; ay = 0; az = ca * len * 0.42;
    bx = ca * len; by = -len * 0.32; bz = sa * len;
  }
  const o = upright ? [p.x, p.y - len * 0.5, p.z] : [p.x - ca * len * 0.5, p.y + len * 0.16, p.z - sa * len * 0.5];
  const v = (u, w) => [o[0] + ax * (u - 0.5) * 2 + bx * w, o[1] + ay * (u - 0.5) * 2 + by * w, o[2] + az * (u - 0.5) * 2 + bz * w];
  const cd = shadeC(col, 0.8);
  // texture runs along the branch: stem at u=0.5, needles both sides
  M.vert(v(0, 0), n, [0, 1], cd);
  M.vert(v(1, 0), n, [1, 1], cd);
  M.vert(v(1, 1), n, [1, 0], col);
  M.vert(v(0, 0), n, [0, 1], cd);
  M.vert(v(1, 1), n, [1, 0], col);
  M.vert(v(0, 1), n, [0, 0], col);
  if (upright) return;
  // the same branch again, stood on edge, so the tier reads from the side as well as from above
  const k = len * 0.3;
  const w = (u, t) => [o[0] + bx * t, o[1] + by * t + (u - 0.5) * 2 * k, o[2] + bz * t];
  M.vert(w(0, 0), n, [0, 1], cd);
  M.vert(w(1, 0), n, [1, 1], cd);
  M.vert(w(1, 1), n, [1, 0], col);
  M.vert(w(0, 0), n, [0, 1], cd);
  M.vert(w(1, 1), n, [1, 0], col);
  M.vert(w(0, 1), n, [0, 0], col);
}

// Tapered cylinder from a to b with UVs for the bark.
function limb(M, a, b, r0, r1, col, seg = 7) {
  _a.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const L = _a.length();
  _a.normalize();
  const up = Math.abs(_a.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(_a, up).normalize(), w = new THREE.Vector3().crossVectors(_a, u).normalize();
  const ring = (c, r, k) => {
    const out = [];
    for (let i = 0; i <= seg; i++) {
      const t = (i / seg) * Math.PI * 2, nx = u.x * Math.cos(t) + w.x * Math.sin(t), ny = u.y * Math.cos(t) + w.y * Math.sin(t), nz = u.z * Math.cos(t) + w.z * Math.sin(t);
      out.push({ p: [c[0] + nx * r, c[1] + ny * r, c[2] + nz * r], n: [nx, ny, nz], u: [i / seg, k] });
    }
    return out;
  };
  const A = ring(a, r0, 0), B = ring(b, r1, L / 3);
  const dark = shadeC(col, 0.8);
  for (let i = 0; i < seg; i++) {
    const q = [A[i], A[i + 1], B[i + 1], B[i]];
    M.vert(q[0].p, q[0].n, q[0].u, dark);
    M.vert(q[1].p, q[1].n, q[1].u, dark);
    M.vert(q[2].p, q[2].n, q[2].u, col);
    M.vert(q[0].p, q[0].n, q[0].u, dark);
    M.vert(q[2].p, q[2].n, q[2].u, col);
    M.vert(q[3].p, q[3].n, q[3].u, col);
  }
}

// A crown of leaf cards filling a set of overlapping spheres.
function crown(M, rng, blobs, cards, size, col, varyK = 0.25) {
  const total = blobs.reduce((s, b) => s + b.r * b.r, 0);
  for (const b of blobs) {
    const n = Math.round((cards * b.r * b.r) / total);
    for (let i = 0; i < n; i++) {
      _n.set(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
      if (_n.lengthSq() > 1 || _n.lengthSq() < 0.01) {
        i--;
        continue;
      }
      _n.normalize();
      const rr = b.r * (0.55 + 0.45 * Math.cbrt(rng()));
      const p = new THREE.Vector3(b.x + _n.x * rr, b.y + _n.y * rr * 0.85, b.z + _n.z * rr);
      // outward normal from the whole crown's center gives soft, round shading
      const nrm = new THREE.Vector3(p.x - b.x * 0.6, p.y - b.y + b.r * 0.35, p.z - b.z * 0.6).normalize();
      const k = 1 - varyK / 2 + rng() * varyK + (_n.y > 0 ? 0.08 : -0.12);
      card(M, rng, p, size * (0.8 + rng() * 0.5), nrm, shadeC(col, k));
    }
  }
}

// Returns { trunk, leaves, leafMat } for a tree type. Heights are about 7-9 m at scale 1.
// lod 1 builds the far version: a quarter of the cards, each bigger, same silhouette.
export function treeParts(type, lod = 0) {
  const rng = makeRng(type.length * 131 + 7);
  const CK = lod ? 0.26 : 1, SK = lod ? 1.75 : 1;
  const T = new Mesher(), L = new Mesher();
  const bark = lin('#7a6048'), birch = lin('#d8d2c4');
  let leafMat = 'broad';
  switch (type) {
    case 'oak':
    case 'autumnA':
    case 'autumnB': {
      const leaf = type === 'oak' ? lin('#5f8f2f') : type === 'autumnA' ? lin('#d9782a') : lin('#c2462c');
      const trunkCol = type === 'autumnA' ? birch : bark;
      limb(T, [0, -0.6, 0], [0, 3.6, 0], 0.42, 0.28, trunkCol, 8);
      const blobs = [{ x: 0, y: 5.6, z: 0, r: 2.6 }];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + rng() * 0.6, d = 1.4 + rng() * 0.6, y = 4.5 + rng() * 1.5;
        limb(T, [0, 3.2, 0], [Math.cos(a) * d * 0.8, y - 0.3, Math.sin(a) * d * 0.8], 0.2, 0.08, trunkCol, 5);
        blobs.push({ x: Math.cos(a) * d, y, z: Math.sin(a) * d, r: 1.6 + rng() * 0.6 });
      }
      blobs.push({ x: 0.3, y: 7.0, z: -0.2, r: 1.7 });
      crown(L, rng, blobs, Math.round(150 * CK), 1.7 * SK, leaf);
      break;
    }
    case 'pine':
    case 'snowpine': {
      leafMat = 'needle';
      const green = lin('#3c6b34'), snow = lin('#eef3f8');
      limb(T, [0, -0.6, 0], [0, 7.6, 0], 0.36, 0.1, bark, 7);
      // tiers of spreading branches, each a ring of near-horizontal needle cards, wider toward the bottom
      for (let lvl = 0; lvl < 8; lvl++) {
        const y = 1.7 + lvl * 0.86, R = 2.9 * (1 - lvl / 9.2) + 0.25;
        const n = Math.max(3, Math.round((6 + Math.round(R * 2.4)) * (lod ? 0.4 : 1)));
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + lvl * 0.9 + rng() * 0.25;
          const r = R * (0.5 + rng() * 0.25);
          const p = new THREE.Vector3(Math.cos(a) * r, y - r * 0.18, Math.sin(a) * r);
          const nrm = new THREE.Vector3(Math.cos(a) * 0.6, 0.8, Math.sin(a) * 0.6).normalize();
          let col = shadeC(green, 0.75 + rng() * 0.3 + lvl * 0.03);
          if (type === 'snowpine' && rng() < 0.6) col = shadeC(snow, 0.88 + rng() * 0.12);
          branchCard(L, p, a, R * 1.15 * (lod ? 1.3 : 1), nrm, col);
        }
      }
      // a spire on top
      branchCard(L, new THREE.Vector3(0, 8.7, 0), 0, 1.0, new THREE.Vector3(0, 1, 0), shadeC(type === 'snowpine' ? snow : green, 1.05), true);
      break;
    }
    case 'palm': {
      leafMat = 'frond';
      let x = 0, y = -0.5;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        pts.push([x, y, 0]);
        x += 0.14 + i * 0.05;
        y += 1.3;
      }
      for (let i = 0; i < pts.length - 1; i++) limb(T, pts[i], pts[i + 1], 0.3 - i * 0.025, 0.28 - i * 0.025, lin('#8a6e4c'), 7);
      const top = pts[pts.length - 1], green = lin('#4f8a36');
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + rng() * 0.3;
        // each frond: two cards arcing out and down
        for (let s = 0; s < 2; s++) {
          const d = 1.0 + s * 1.7, drop = s * 0.9;
          const p = new THREE.Vector3(top[0] + Math.cos(a) * d, top[1] + 0.3 - drop, top[2] + Math.sin(a) * d);
          card(L, rng, p, 2.2, new THREE.Vector3(Math.cos(a) * 0.4, 0.9, Math.sin(a) * 0.4).normalize(), shadeC(green, 0.85 + rng() * 0.3), 0.2);
        }
      }
      break;
    }
    case 'swamp': {
      leafMat = 'willow';
      limb(T, [0, -0.8, 0], [0.2, 4.2, 0], 0.62, 0.36, lin('#5a4a36'), 8);
      const blobs = [{ x: 0, y: 5.4, z: 0, r: 3.2 }, { x: 1.6, y: 4.8, z: 1, r: 2 }, { x: -1.4, y: 5, z: -0.8, r: 2.2 }];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        limb(T, [0.1, 3.6, 0], [Math.cos(a) * 2.2, 5.0, Math.sin(a) * 2.2], 0.22, 0.08, lin('#5a4a36'), 5);
      }
      crown(L, rng, blobs, Math.round(120 * CK), 2.4 * SK, lin('#6d7a33'), 0.3);
      break;
    }
    case 'cactus': {
      leafMat = null;
      const g = lin('#5c8f3a');
      limb(T, [0, -0.5, 0], [0, 3.6, 0], 0.45, 0.4, g, 10);
      limb(T, [0, 1.3, 0], [0.9, 1.4, 0], 0.22, 0.22, g, 8);
      limb(T, [0.9, 1.3, 0], [1.0, 2.8, 0], 0.22, 0.19, g, 8);
      limb(T, [0, 2.0, 0], [-0.8, 2.1, 0], 0.2, 0.2, g, 8);
      limb(T, [-0.8, 2.0, 0], [-0.95, 3.1, 0], 0.2, 0.17, g, 8);
      break;
    }
    default: {
      // dead tree: bare branching limbs
      leafMat = null;
      const c = lin('#7a6a58');
      limb(T, [0, -0.5, 0], [0, 4.4, 0], 0.32, 0.14, c, 6);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + rng(), y = 2 + i * 0.5;
        limb(T, [0, y, 0], [Math.cos(a) * 1.5, y + 1.1, Math.sin(a) * 1.5], 0.12, 0.04, c, 4);
      }
    }
  }
  return { trunk: T.build(), leaves: leafMat ? L.build() : null, leafMat };
}

// A small leafy bush, about 1.2 m across at scale 1.
export function bushParts(kind) {
  const rng = makeRng(kind.length * 17 + 3);
  const L = new Mesher();
  const col = kind === 'autumn' ? lin('#b8702e') : kind === 'swamp' ? lin('#5a6a2c') : lin('#4f8a34');
  crown(L, rng, [{ x: 0, y: 0.45, z: 0, r: 0.75 }, { x: 0.45, y: 0.35, z: 0.2, r: 0.5 }, { x: -0.4, y: 0.35, z: -0.2, r: 0.55 }], 34, 0.85, col, 0.3);
  return L.build();
}

// A rounded boulder: an icosphere pushed around by noise, flattened underneath.
export function boulderGeometry(seed) {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const p = g.attributes.position, rng = makeRng(seed);
  const o = [rng() * 10, rng() * 10, rng() * 10];
  const v = new THREE.Vector3();
  const n3 = (x, y, z) => Math.sin(x * 1.7 + o[0]) * Math.sin(y * 2.1 + o[1]) * Math.sin(z * 1.9 + o[2]);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let d = 1 + 0.18 * n3(v.x * 2, v.y * 2, v.z * 2) + 0.07 * n3(v.x * 5, v.y * 5, v.z * 5);
    // a few flat facets, like split rock
    for (let k = 0; k < 3; k++) {
      const a = [Math.sin(o[k] * 3), Math.cos(o[k] * 2), Math.sin(o[k])];
      const dot = v.x * a[0] + v.y * a[1] + v.z * a[2];
      if (dot > 0.62) d = Math.min(d, 0.62 / dot + 0.08);
    }
    v.multiplyScalar(d);
    if (v.y < -0.35) v.y = -0.35 - (v.y + 0.35) * 0.2;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    // darker in the crevices and underneath
    const y = p.getY(i), k = 0.75 + 0.25 * Math.min(1, Math.max(0, y + 0.5));
    cols[i * 3] = cols[i * 3 + 1] = cols[i * 3 + 2] = k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return g;
}

// Farm crops: corn (a stalk with long arching leaves) or wheat (a clump of golden stalks).
export function cropGeometry(kind) {
  const rng = makeRng(kind === 'corn' ? 71 : 73);
  const M = new Mesher();
  if (kind === 'corn') {
    const stalk = lin('#7a9a3c'), leaf = lin('#5f8f34');
    limb(M, [0, 0, 0], [0, 2.1, 0], 0.035, 0.02, stalk, 5);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4 + rng(), y = 0.4 + i * 0.25;
      const p = new THREE.Vector3(Math.cos(a) * 0.35, y + 0.1, Math.sin(a) * 0.35);
      branchCard(M, p, a, 0.75, new THREE.Vector3(Math.cos(a) * 0.4, 0.9, Math.sin(a) * 0.4).normalize(), shadeC(leaf, 0.85 + rng() * 0.3));
    }
    // tassel
    branchCard(M, new THREE.Vector3(0, 2.25, 0), 0, 0.4, new THREE.Vector3(0, 1, 0), lin('#c9b25a'), true);
  } else {
    const gold = lin('#c8a64e');
    for (let b = 0; b < 9; b++) {
      const a = rng() * Math.PI * 2, r = rng() * 0.22, x0 = Math.cos(a) * r, z0 = Math.sin(a) * r;
      const h = 0.75 + rng() * 0.3, lean = (rng() - 0.5) * 0.15;
      limb(M, [x0, 0, z0], [x0 + lean, h, z0 + lean * 0.5], 0.009, 0.007, shadeC(gold, 0.85 + rng() * 0.2), 3);
      // the ear
      limb(M, [x0 + lean, h, z0 + lean * 0.5], [x0 + lean * 1.3, h + 0.12, z0 + lean * 0.6], 0.02, 0.012, shadeC(gold, 1.05), 3);
    }
  }
  return M.build();
}
