// Small procedural sprite textures ported from Zero Hour: muzzle flash, soft glow, smoke, dust puff, bullet hole.
import * as THREE from 'three';
import { cnv, rand, TAU } from './parts.js';

function radial(s, stops) {
  const c = cnv(s, s), x = c.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  for (const st of stops) g.addColorStop(st[0], st[1]);
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);
  return c;
}

function tex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let T = null;
export function zhTextures() {
  if (T) return T;
  T = {};
  T.glow = tex(radial(128, [[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,238,200,.65)'], [1, 'rgba(255,190,130,0)']]));
  T.puff = tex(radial(64, [[0, 'rgba(255,255,255,1)'], [0.42, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]));
  {
    // muzzle flash: hot white core, flame tongues of uneven length, a few sparks, all on a soft glow
    const c = radial(128, [[0, 'rgba(255,248,230,1)'], [0.12, 'rgba(255,214,140,.9)'], [0.4, 'rgba(255,140,50,.28)'], [1, 'rgba(255,90,20,0)']]);
    const x = c.getContext('2d');
    x.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU + rand(-0.25, 0.25), L = rand(36, 62), w = rand(6, 11), ca = Math.cos(a), sa = Math.sin(a);
      const g = x.createLinearGradient(64, 64, 64 + ca * L, 64 + sa * L);
      g.addColorStop(0, 'rgba(255,250,235,1)');
      g.addColorStop(0.35, 'rgba(255,200,110,.85)');
      g.addColorStop(1, 'rgba(255,110,30,0)');
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(64 - sa * w * 0.35, 64 + ca * w * 0.35);
      x.quadraticCurveTo(64 + ca * L * 0.4 - sa * w, 64 + sa * L * 0.4 + ca * w, 64 + ca * L, 64 + sa * L);
      x.quadraticCurveTo(64 + ca * L * 0.4 + sa * w, 64 + sa * L * 0.4 - ca * w, 64 + sa * w * 0.35, 64 - ca * w * 0.35);
      x.closePath();
      x.fill();
    }
    x.strokeStyle = 'rgba(255,226,170,.7)';
    x.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) {
      const a = rand(0, TAU), r0 = rand(14, 24), r1 = rand(40, 60);
      x.beginPath();
      x.moveTo(64 + Math.cos(a) * r0, 64 + Math.sin(a) * r0);
      x.lineTo(64 + Math.cos(a) * r1, 64 + Math.sin(a) * r1);
      x.stroke();
    }
    const core = x.createRadialGradient(64, 64, 0, 64, 64, 12);
    core.addColorStop(0, 'rgba(255,255,250,1)');
    core.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = core;
    x.fillRect(40, 40, 48, 48);
    T.flash = tex(c);
  }
  {
    const c = cnv(64, 64), x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 20);
    g.addColorStop(0, 'rgba(12,10,9,.95)');
    g.addColorStop(0.35, 'rgba(25,22,20,.9)');
    g.addColorStop(0.55, 'rgba(120,110,95,.45)');
    g.addColorStop(1, 'rgba(120,110,95,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    x.strokeStyle = 'rgba(30,26,22,.55)';
    x.lineWidth = 1;
    for (let k = 0; k < 7; k++) {
      const a = rand(0, TAU), l = rand(10, 26);
      x.beginPath();
      x.moveTo(32, 32);
      x.lineTo(32 + Math.cos(a) * l, 32 + Math.sin(a) * l);
      x.stroke();
    }
    T.hole = tex(c);
  }
  return T;
}

// Tileable value-noise fbm, 0..1 (Zero Hour's texture field).
export function field(s, periods, weights, seed) {
  const out = new Float32Array(s * s);
  let rs = seed || 7;
  const r = () => {
    rs = (rs * 16807) % 2147483647;
    return (rs - 1) / 2147483646;
  };
  for (let o = 0; o < periods.length; o++) {
    const p = periods[o], w = weights[o], g = new Float32Array(p * p);
    for (let i = 0; i < p * p; i++) g[i] = r();
    for (let y = 0; y < s; y++) {
      const fy = (y / s) * p, iy = Math.floor(fy), ty = fy - iy, sy = ty * ty * (3 - 2 * ty), y0 = iy % p, y1 = (iy + 1) % p;
      for (let x = 0; x < s; x++) {
        const fx = (x / s) * p, ix = Math.floor(fx), tx = fx - ix, sx = tx * tx * (3 - 2 * tx), x0 = ix % p, x1 = (ix + 1) % p;
        const a = g[y0 * p + x0], b = g[y0 * p + x1], c = g[y1 * p + x0], d = g[y1 * p + x1];
        const top = a + (b - a) * sx, bot = c + (d - c) * sx;
        out[y * s + x] += w * (top + (bot - top) * sy);
      }
    }
  }
  return out;
}

// A tileable normal map from a height field.
export function normalMapFrom(S, f, strength) {
  const c = cnv(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  const h = (i, j) => f[((j + S) % S) * S + ((i + S) % S)];
  for (let j = 0; j < S; j++) {
    for (let i = 0; i < S; i++) {
      const dx = (h(i + 1, j) - h(i - 1, j)) * strength, dy = (h(i, j + 1) - h(i, j - 1)) * strength, L = Math.hypot(dx, dy, 1), o = (j * S + i) * 4;
      d[o] = (-dx / L * 0.5 + 0.5) * 255;
      d[o + 1] = (-dy / L * 0.5 + 0.5) * 255;
      d[o + 2] = (1 / L * 0.5 + 0.5) * 255;
      d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
