import * as THREE from 'three';
import { ARENA } from '../config.js';
import { wallOutline } from '../arena.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function tex(c, { srgb = true, repeat = false, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  return t;
}

// Small deterministic PRNG so the stadium looks the same every load.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FIELD_TEX = { minZ: -(ARENA.halfZ + ARENA.goalDepth), maxZ: ARENA.halfZ + ARENA.goalDepth, halfX: ARENA.halfX };

// Grass field with mowing stripes and markings. Covers x∈[-HX,HX], z∈[minZ,maxZ].
export function fieldTexture(quality) {
  const SC = quality === 'low' ? 8 : 5.3333; // uu per pixel
  const W = Math.round((2 * ARENA.halfX) / SC);
  const Hh = Math.round((FIELD_TEX.maxZ - FIELD_TEX.minZ) / SC);
  const c = canvas(W, Hh);
  const g = c.getContext('2d');
  const px = (x) => (x + ARENA.halfX) / SC;
  const pz = (z) => (FIELD_TEX.maxZ - z) / SC;
  const len = (d) => d / SC;

  // base + mowing stripes across the field
  const stripe = 512;
  for (let z = FIELD_TEX.minZ; z < FIELD_TEX.maxZ; z += stripe) {
    const k = Math.floor((z - FIELD_TEX.minZ) / stripe);
    g.fillStyle = k % 2 ? '#3f7f2c' : '#356f25';
    g.fillRect(0, pz(z + stripe), W, len(stripe) + 1);
  }
  // subtle team tint toward each end
  let grad = g.createLinearGradient(0, pz(-ARENA.halfZ), 0, pz(0));
  grad.addColorStop(0, 'rgba(40,110,255,0.10)');
  grad.addColorStop(1, 'rgba(40,110,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, pz(0), W, pz(FIELD_TEX.minZ) - pz(0));
  grad = g.createLinearGradient(0, pz(ARENA.halfZ), 0, pz(0));
  grad.addColorStop(0, 'rgba(255,120,30,0.10)');
  grad.addColorStop(1, 'rgba(255,120,30,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, pz(0));

  // grass noise
  const img = g.getImageData(0, 0, W, Hh);
  const d = img.data;
  const r = rng(7);
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 26 + (r() < 0.04 ? -18 : 0);
    d[i] = Math.max(0, Math.min(255, d[i] + n * 0.6));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 0.4));
  }
  g.putImageData(img, 0, 0);

  // goal floors: darker
  for (const s of [1, -1]) {
    g.fillStyle = 'rgba(10,20,10,0.45)';
    const z0 = s * ARENA.halfZ, z1 = s * (ARENA.halfZ + ARENA.goalDepth);
    g.fillRect(px(-ARENA.goalHalfW), Math.min(pz(z0), pz(z1)), len(2 * ARENA.goalHalfW), Math.abs(pz(z1) - pz(z0)));
  }

  // markings
  const line = (w, color) => { g.lineWidth = len(w); g.strokeStyle = color; };
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const white = 'rgba(245,250,255,0.85)';
  // boundary following the floor edge
  const pts = wallOutline(160, 6);
  line(34, white);
  g.beginPath();
  pts.forEach((p, i) => {
    const x = p.x + p.nx * (ARENA.rampR + 60), z = p.z + p.nz * (ARENA.rampR + 60);
    if (i === 0) g.moveTo(px(x), pz(z)); else g.lineTo(px(x), pz(z));
  });
  g.closePath();
  g.stroke();
  // halfway line + center circle
  g.beginPath(); g.moveTo(px(-ARENA.halfX + 340), pz(0)); g.lineTo(px(ARENA.halfX - 340), pz(0)); g.stroke();
  g.beginPath(); g.arc(px(0), pz(0), len(1000), 0, Math.PI * 2); g.stroke();
  g.fillStyle = white;
  g.beginPath(); g.arc(px(0), pz(0), len(60), 0, Math.PI * 2); g.fill();

  for (const s of [-1, 1]) {
    const team = s < 0 ? 'rgba(70,150,255,0.95)' : 'rgba(255,140,50,0.95)';
    const gl = s * (ARENA.halfZ - 340);
    // goal line in team color
    line(40, team);
    g.beginPath(); g.moveTo(px(-ARENA.goalHalfW), pz(s * ARENA.halfZ)); g.lineTo(px(ARENA.goalHalfW), pz(s * ARENA.halfZ)); g.stroke();
    // penalty box
    line(30, white);
    g.beginPath();
    g.moveTo(px(-1800), pz(gl)); g.lineTo(px(-1800), pz(s * (ARENA.halfZ - 1500)));
    g.lineTo(px(1800), pz(s * (ARENA.halfZ - 1500))); g.lineTo(px(1800), pz(gl));
    g.stroke();
    // goal box
    line(26, team);
    g.beginPath();
    g.moveTo(px(-1150), pz(gl)); g.lineTo(px(-1150), pz(s * (ARENA.halfZ - 800)));
    g.lineTo(px(1150), pz(s * (ARENA.halfZ - 800))); g.lineTo(px(1150), pz(gl));
    g.stroke();
    // arc
    line(30, white);
    g.beginPath();
    const cy = pz(s * (ARENA.halfZ - 1500));
    if (s < 0) g.arc(px(0), cy, len(700), Math.PI, 0, false);
    else g.arc(px(0), cy, len(700), 0, Math.PI, false);
    g.stroke();
    // chevrons pointing toward the opponent goal
    line(26, s < 0 ? 'rgba(70,150,255,0.55)' : 'rgba(255,140,50,0.55)');
    for (const xx of [-2600, 2600]) {
      for (let k = 0; k < 3; k++) {
        const zc = s * (2000 + k * 260);
        g.beginPath();
        g.moveTo(px(xx - 220), pz(zc + s * 160));
        g.lineTo(px(xx), pz(zc));
        g.lineTo(px(xx + 220), pz(zc + s * 160));
        g.stroke();
      }
    }
  }
  const t = tex(c, { aniso: 16 });
  return t;
}

// Tiling grass detail used as a bump map and for the grass "shell" layers.
export function grassDetailTexture() {
  const N = 256;
  const c = canvas(N, N);
  const g = c.getContext('2d');
  const img = g.createImageData(N, N);
  const r = rng(11);
  const vals = new Float32Array(N * N);
  for (let i = 0; i < 9000; i++) {
    const x = Math.floor(r() * N), y = Math.floor(r() * N);
    const v = 0.35 + r() * 0.65;
    const h = 1 + Math.floor(r() * 3);
    for (let k = 0; k < h; k++) {
      const yy = (y + k) % N;
      vals[yy * N + x] = Math.max(vals[yy * N + x], v * (1 - k * 0.2));
    }
  }
  for (let i = 0; i < N * N; i++) {
    const v = Math.round(vals[i] * 255);
    img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = tex(c, { srgb: false, repeat: true });
  t.magFilter = THREE.NearestFilter;
  return t;
}

// Seamless flat-topped hexagon grid lines (white on black).
export function hexTexture(lineW = 3, size = 512) {
  const r = size / 6;
  const W = size, Hh = Math.round(Math.sqrt(3) * r * 4);
  const c = canvas(W, Hh);
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, Hh);
  g.strokeStyle = '#fff';
  g.lineWidth = lineW;
  const h = Math.sqrt(3) * r;
  for (let col = -1; col <= 5; col++) {
    for (let row = -1; row <= 5; row++) {
      const cx = 1.5 * r * col;
      const cy = h * (row + (col % 2 ? 0.5 : 0));
      g.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = (Math.PI / 3) * k;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
  }
  return tex(c, { srgb: false, repeat: true });
}

// LED advertising boards.
export function adTexture() {
  const W = 2048, Hh = 128;
  const c = canvas(W, Hh);
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, Hh);
  grad.addColorStop(0, '#05070c');
  grad.addColorStop(1, '#0b1220');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, Hh);
  const words = ['ROCKET ARENA', 'SUPERSONIC', 'ROCKET ARENA', 'BOOST', 'ROCKET ARENA', 'AERIAL CUP'];
  const seg = W / words.length;
  words.forEach((w, i) => {
    const x0 = i * seg;
    g.fillStyle = 'rgba(120,180,255,0.18)';
    g.fillRect(x0 + 4, 8, seg - 8, Hh - 16);
    // logo disc
    g.fillStyle = i % 2 ? '#ff8a2a' : '#4aa8ff';
    g.beginPath(); g.arc(x0 + 58, Hh / 2, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(x0 + 58, Hh / 2, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = i % 2 ? '#ff8a2a' : '#4aa8ff';
    g.beginPath(); g.arc(x0 + 64, Hh / 2 - 4, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f4f8ff';
    g.font = 'bold italic 54px Arial, Helvetica, sans-serif';
    g.textBaseline = 'middle';
    g.fillText(w, x0 + 104, Hh / 2 + 2, seg - 120);
  });
  return tex(c, { repeat: true });
}

// Rows of spectators.
export function crowdTexture() {
  const W = 1024, Hh = 512;
  const c = canvas(W, Hh);
  const g = c.getContext('2d');
  g.fillStyle = '#14161c';
  g.fillRect(0, 0, W, Hh);
  const r = rng(23);
  const rows = 8;
  const rh = Hh / rows;
  const shirts = ['#c8641c', '#2a62c4', '#9aa3ad', '#1c1c1c', '#8a2a2a', '#b89a3a', '#2a6a3a', '#3a3f4a', '#c8641c', '#2a62c4', '#30343c', '#5a6070', '#20232a'];
  const skins = ['#c9a185', '#b08060', '#8a5a3c', '#5a3a26', '#d2b096'];
  for (let row = 0; row < rows; row++) {
    const y0 = row * rh;
    // seat row
    g.fillStyle = row % 2 ? '#20232b' : '#1a1d24';
    g.fillRect(0, y0 + rh * 0.62, W, rh * 0.38);
    g.fillStyle = '#2b3140';
    g.fillRect(0, y0 + rh * 0.6, W, 3);
    for (let x = 4; x < W - 4; x += 15 + r() * 4) {
      if (r() < 0.12) continue;
      const sh = shirts[Math.floor(r() * shirts.length)];
      const sk = skins[Math.floor(r() * skins.length)];
      const by = y0 + rh * (0.32 + r() * 0.08);
      g.fillStyle = sh;
      g.fillRect(x - 6, by, 12, rh * 0.36);
      g.fillStyle = sk;
      g.beginPath(); g.arc(x, by - 6, 5.5, 0, Math.PI * 2); g.fill();
      if (r() < 0.18) { // arms up
        g.fillStyle = sk;
        g.fillRect(x - 9, by - 18, 3, 16);
        g.fillRect(x + 6, by - 18, 3, 16);
      }
      if (r() < 0.06) { // flag or scarf
        g.fillStyle = r() < 0.5 ? '#ff7a1a' : '#2f7bff';
        g.fillRect(x - 10, by - 26, 20, 10);
      }
    }
  }
  // soften so distant rows read as a crowd rather than noise
  const c2 = canvas(W, Hh);
  const g2 = c2.getContext('2d');
  g2.filter = 'blur(1.2px) saturate(0.8)';
  g2.drawImage(c, 0, 0);
  return tex(c2, { repeat: true });
}

// Truncated-icosahedron panel ball texture (color, emissive, roughness, bump).
export function ballTextures(size = 1024) {
  const W = size, Hh = size / 2;
  const phi = (1 + Math.sqrt(5)) / 2;
  const dirs = [];
  const add = (x, y, z, pent) => { const l = Math.hypot(x, y, z); dirs.push([x / l, y / l, z / l, pent]); };
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    add(0, a, b * phi, 1); add(a, b * phi, 0, 1); add(a * phi, 0, b, 1);
  }
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c2 of [-1, 1]) add(a, b, c2, 0);
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    add(0, a / phi, b * phi, 0); add(a / phi, b * phi, 0, 0); add(a * phi, 0, b / phi, 0);
  }
  const mk = () => { const c = canvas(W, Hh); return [c, c.getContext('2d')]; };
  const [cc, gc] = mk(), [ce, ge] = mk(), [cr, gr] = mk(), [cb, gb] = mk();
  const ic = gc.createImageData(W, Hh), ie = ge.createImageData(W, Hh), ir = gr.createImageData(W, Hh), ib = gb.createImageData(W, Hh);
  const rnd = rng(5);
  const noise = new Float32Array(64 * 32);
  for (let i = 0; i < noise.length; i++) noise[i] = rnd();
  for (let py = 0; py < Hh; py++) {
    const v = (py + 0.5) / Hh;
    const st = Math.sin(Math.PI * v), ct = Math.cos(Math.PI * v);
    for (let pxx = 0; pxx < W; pxx++) {
      const u = (pxx + 0.5) / W;
      const x = -Math.cos(2 * Math.PI * u) * st, y = ct, z = Math.sin(2 * Math.PI * u) * st;
      let b1 = -2, b2 = -2, bi = 0;
      for (let i = 0; i < 32; i++) {
        const dd = dirs[i];
        const dt = x * dd[0] + y * dd[1] + z * dd[2];
        if (dt > b1) { b2 = b1; b1 = dt; bi = i; } else if (dt > b2) b2 = dt;
      }
      const pent = dirs[bi][3];
      const edge = b1 - b2;
      const seam = edge < 0.006 ? 1 : edge < 0.014 ? 1 - (edge - 0.006) / 0.008 : 0;
      const ang = Math.acos(Math.min(1, b1));
      const n = noise[((py >> 4) % 32) * 64 + ((pxx >> 4) % 64)] * 0.08;
      let cr2, cg2, cb2;
      if (pent) { cr2 = 52; cg2 = 58; cb2 = 66; } else { cr2 = 128; cg2 = 134; cb2 = 140; }
      // inner bevel ring on each panel
      const bevel = edge < 0.03 ? 0.85 : 1;
      const k = (1 - seam * 0.85) * bevel * (1 + n);
      const i4 = (py * W + pxx) * 4;
      ic.data[i4] = cr2 * k; ic.data[i4 + 1] = cg2 * k; ic.data[i4 + 2] = cb2 * k; ic.data[i4 + 3] = 255;
      // glowing rings on the pentagons
      let e = 0;
      if (pent) {
        if (ang < 0.07) e = 1;
        else if (ang > 0.12 && ang < 0.15) e = 0.9;
      }
      ie.data[i4] = 60 * e; ie.data[i4 + 1] = 170 * e; ie.data[i4 + 2] = 255 * e; ie.data[i4 + 3] = 255;
      const rough = seam > 0 ? 200 : pent ? 95 : 120;
      ir.data[i4] = rough; ir.data[i4 + 1] = rough; ir.data[i4 + 2] = rough; ir.data[i4 + 3] = 255;
      const bump = 255 * (1 - seam) * (edge < 0.03 ? 0.6 + edge * 13 : 1);
      ib.data[i4] = bump; ib.data[i4 + 1] = bump; ib.data[i4 + 2] = bump; ib.data[i4 + 3] = 255;
    }
  }
  gc.putImageData(ic, 0, 0); ge.putImageData(ie, 0, 0); gr.putImageData(ir, 0, 0); gb.putImageData(ib, 0, 0);
  return {
    map: tex(cc),
    emissiveMap: tex(ce),
    roughnessMap: tex(cr, { srgb: false }),
    bumpMap: tex(cb, { srgb: false }),
  };
}

export function treadTexture() {
  const c = canvas(256, 64);
  const g = c.getContext('2d');
  g.fillStyle = '#1b1b1d';
  g.fillRect(0, 0, 256, 64);
  g.strokeStyle = '#0a0a0b';
  g.lineWidth = 6;
  for (let x = -64; x < 320; x += 18) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 14, 30); g.lineTo(x, 64); g.stroke();
  }
  g.fillStyle = '#0c0c0d';
  g.fillRect(0, 30, 256, 4);
  return tex(c, { repeat: true });
}

// Dark carbon/plastic noise used on car accents.
export function carbonTexture() {
  const c = canvas(64, 64);
  const g = c.getContext('2d');
  for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 8) {
    g.fillStyle = (x + y) % 16 ? '#1a1c20' : '#24272c';
    g.fillRect(x, y, 8, 8);
  }
  return tex(c, { repeat: true });
}
