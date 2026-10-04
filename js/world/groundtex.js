// Ground detail textures, painted procedurally at load time. Each is a tileable color map centered on mid
// gray: the terrain multiplies it (x2) into its biome color, so the island keeps its palette and gains the
// fine detail of grass blades, leaf litter, pebbles, rock strata, sand ripples and paving.
import * as THREE from 'three';
import { field } from '../zh/textures.js';
import { makeRng } from '../util.js';

const S = 512;

function canvas() {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  return c;
}

// Write a per-pixel function into a canvas. fn(x, y, i) returns [r, g, b] around 128.
function paint(fn) {
  const c = canvas(), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  for (let y = 0; y < S; y++) {
    for (let X = 0; X < S; X++) {
      const i = y * S + X, o = i * 4, v = fn(X, y, i);
      d[o] = v[0];
      d[o + 1] = v[1];
      d[o + 2] = v[2];
      d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

// Draw something at a point and its wrapped copies so strokes tile seamlessly.
function wrapDraw(x, px, py, r, fn) {
  for (const ox of [-S, 0, S]) {
    for (const oy of [-S, 0, S]) {
      const X = px + ox, Y = py + oy;
      if (X + r < 0 || X - r > S || Y + r < 0 || Y - r > S) continue;
      fn(X, Y);
    }
  }
}

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

function grass(rng) {
  const f = field(S, [4, 8, 16, 32, 64], [0.3, 0.25, 0.2, 0.15, 0.1], 11);
  const c = paint((x, y, i) => {
    const v = (f[i] - 0.5) * 60;
    return [clamp255(124 + v * 0.9), clamp255(130 + v), clamp255(118 + v * 0.8)];
  });
  const x = c.getContext('2d');
  // thousands of short blades, light and dark, leaning a little
  for (let k = 0; k < 9000; k++) {
    const px = rng() * S, py = rng() * S, L = 5 + rng() * 9, a = -Math.PI / 2 + (rng() - 0.5) * 0.9, w = 0.8 + rng() * 1.2;
    const light = rng() < 0.5, t = rng();
    const col = light ? `rgba(${170 + t * 40},${180 + t * 40},${120 + t * 20},0.55)` : `rgba(${60 + t * 30},${78 + t * 30},${52 + t * 20},0.5)`;
    wrapDraw(x, px, py, L, (X, Y) => {
      x.strokeStyle = col;
      x.lineWidth = w;
      x.beginPath();
      x.moveTo(X, Y);
      x.quadraticCurveTo(X + Math.cos(a) * L * 0.5 + (rng() - 0.5) * 3, Y + Math.sin(a) * L * 0.5, X + Math.cos(a) * L, Y + Math.sin(a) * L);
      x.stroke();
    });
  }
  // the odd clover and tiny flower
  for (let k = 0; k < 160; k++) {
    const px = rng() * S, py = rng() * S, r = 1.2 + rng() * 1.6;
    const col = rng() < 0.6 ? 'rgba(235,235,220,0.8)' : rng() < 0.5 ? 'rgba(250,215,90,0.8)' : 'rgba(205,160,235,0.75)';
    wrapDraw(x, px, py, r, (X, Y) => {
      x.fillStyle = col;
      x.beginPath();
      x.arc(X, Y, r, 0, Math.PI * 2);
      x.fill();
    });
  }
  return c;
}

function forestFloor(rng) {
  const f = field(S, [6, 12, 24, 48, 96], [0.3, 0.25, 0.2, 0.15, 0.1], 23);
  const c = paint((x, y, i) => {
    const v = (f[i] - 0.5) * 70;
    return [clamp255(124 + v), clamp255(122 + v * 0.9), clamp255(112 + v * 0.8)];
  });
  const x = c.getContext('2d');
  // fallen leaves: small ellipses in browns and old greens
  for (let k = 0; k < 2600; k++) {
    const px = rng() * S, py = rng() * S, r = 2 + rng() * 4, a = rng() * Math.PI, t = rng();
    const col = t < 0.4 ? `rgba(${150 + rng() * 40},${110 + rng() * 30},${70},0.6)` : t < 0.75 ? `rgba(${90 + rng() * 30},${100 + rng() * 30},${70},0.55)` : `rgba(70,62,52,0.55)`;
    wrapDraw(x, px, py, r * 2, (X, Y) => {
      x.fillStyle = col;
      x.beginPath();
      x.ellipse(X, Y, r, r * 0.5, a, 0, Math.PI * 2);
      x.fill();
    });
  }
  // twigs
  for (let k = 0; k < 220; k++) {
    const px = rng() * S, py = rng() * S, L = 8 + rng() * 18, a = rng() * Math.PI * 2;
    wrapDraw(x, px, py, L, (X, Y) => {
      x.strokeStyle = 'rgba(70,55,40,0.6)';
      x.lineWidth = 1 + rng();
      x.beginPath();
      x.moveTo(X, Y);
      x.lineTo(X + Math.cos(a) * L, Y + Math.sin(a) * L);
      x.stroke();
    });
  }
  return c;
}

function dryGrass(rng) {
  const f = field(S, [4, 8, 16, 32], [0.35, 0.3, 0.2, 0.15], 31);
  const c = paint((x, y, i) => {
    const v = (f[i] - 0.5) * 50;
    return [clamp255(128 + v), clamp255(124 + v), clamp255(112 + v * 0.8)];
  });
  const x = c.getContext('2d');
  for (let k = 0; k < 7000; k++) {
    const px = rng() * S, py = rng() * S, L = 6 + rng() * 12, a = rng() * Math.PI * 2, t = rng();
    const col = t < 0.5 ? `rgba(${190 + t * 40},${170 + t * 40},${110},0.5)` : `rgba(${100 + t * 30},${88 + t * 20},${60},0.5)`;
    wrapDraw(x, px, py, L, (X, Y) => {
      x.strokeStyle = col;
      x.lineWidth = 0.9 + rng() * 0.8;
      x.beginPath();
      x.moveTo(X, Y);
      x.lineTo(X + Math.cos(a) * L, Y + Math.sin(a) * L);
      x.stroke();
    });
  }
  return c;
}

function dirt(rng) {
  const f = field(S, [5, 10, 20, 40, 80, 160], [0.25, 0.22, 0.18, 0.15, 0.12, 0.08], 47);
  const c = paint((x, y, i) => {
    const v = (f[i] - 0.5) * 80;
    return [clamp255(128 + v), clamp255(124 + v * 0.95), clamp255(118 + v * 0.9)];
  });
  const x = c.getContext('2d');
  // pebbles with a lit top and a shadow under
  for (let k = 0; k < 1400; k++) {
    const px = rng() * S, py = rng() * S, r = 1.2 + rng() * rng() * 6, a = rng() * Math.PI, t = 120 + rng() * 70;
    wrapDraw(x, px, py, r * 2, (X, Y) => {
      x.fillStyle = 'rgba(40,34,28,0.45)';
      x.beginPath();
      x.ellipse(X + r * 0.25, Y + r * 0.35, r, r * 0.7, a, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = `rgba(${t},${t * 0.95},${t * 0.88},0.85)`;
      x.beginPath();
      x.ellipse(X, Y, r, r * 0.7, a, 0, Math.PI * 2);
      x.fill();
    });
  }
  return c;
}

function rock(rng) {
  const f = field(S, [3, 6, 12, 24, 48, 96, 192], [0.22, 0.2, 0.17, 0.14, 0.11, 0.09, 0.07], 59);
  const g = field(S, [4, 8], [0.6, 0.4], 61);
  const c = paint((x, y, i) => {
    // strata: warped horizontal bands
    const band = Math.sin((y / S) * Math.PI * 2 * 7 + g[i] * 9) * 0.5 + 0.5;
    const v = (f[i] - 0.5) * 110 + (band - 0.5) * 26;
    return [clamp255(128 + v), clamp255(126 + v), clamp255(122 + v * 0.95)];
  });
  const x = c.getContext('2d');
  // cracks
  for (let k = 0; k < 70; k++) {
    let px = rng() * S, py = rng() * S, a = rng() * Math.PI * 2;
    const n = 6 + Math.floor(rng() * 10);
    x.strokeStyle = 'rgba(30,28,26,0.5)';
    x.lineWidth = 0.8 + rng() * 1.4;
    for (let s = 0; s < n; s++) {
      const L = 5 + rng() * 12, nx = px + Math.cos(a) * L, ny = py + Math.sin(a) * L;
      const ax = px, ay = py;
      wrapDraw(x, ax, ay, 40, (X, Y) => {
        x.beginPath();
        x.moveTo(X, Y);
        x.lineTo(X + nx - ax, Y + ny - ay);
        x.stroke();
      });
      px = nx;
      py = ny;
      a += (rng() - 0.5) * 1.2;
    }
  }
  // lichen spots
  for (let k = 0; k < 260; k++) {
    const px = rng() * S, py = rng() * S, r = 2 + rng() * 6;
    wrapDraw(x, px, py, r, (X, Y) => {
      x.fillStyle = rng() < 0.5 ? 'rgba(150,160,110,0.3)' : 'rgba(200,190,150,0.25)';
      x.beginPath();
      x.arc(X, Y, r, 0, Math.PI * 2);
      x.fill();
    });
  }
  return c;
}

function sand(rng) {
  const f = field(S, [8, 16, 32, 64, 128], [0.3, 0.25, 0.2, 0.15, 0.1], 71);
  const w = field(S, [3, 6], [0.6, 0.4], 73);
  return paint((x, y, i) => {
    const rip = Math.sin((x / S) * Math.PI * 2 * 18 + (y / S) * Math.PI * 2 * 4 + w[i] * 10) * 0.5 + 0.5;
    const v = (f[i] - 0.5) * 34 + (rip - 0.5) * 22 + (rng() - 0.5) * 22;
    return [clamp255(130 + v), clamp255(127 + v), clamp255(120 + v * 0.9)];
  });
}

function snow(rng) {
  const f = field(S, [4, 8, 16, 32, 64], [0.3, 0.25, 0.2, 0.15, 0.1], 83);
  return paint((x, y, i) => {
    const v = (f[i] - 0.5) * 30;
    const sparkle = rng() < 0.004 ? 40 : 0;
    return [clamp255(126 + v * 0.9 + sparkle), clamp255(128 + v * 0.95 + sparkle), clamp255(132 + v + sparkle)];
  });
}

function paved(rng) {
  const f = field(S, [6, 12, 24, 48, 96, 192], [0.25, 0.22, 0.18, 0.15, 0.12, 0.08], 97);
  const c = paint((x, y, i) => {
    const v = (f[i] - 0.5) * 46 + (rng() - 0.5) * 16;
    return [clamp255(128 + v), clamp255(128 + v), clamp255(127 + v)];
  });
  const x = c.getContext('2d');
  // slab joints every quarter of the tile (2 m)
  x.strokeStyle = 'rgba(40,40,40,0.55)';
  x.lineWidth = 2;
  for (let k = 0; k <= 4; k++) {
    const p = (k * S) / 4;
    x.beginPath();
    x.moveTo(p, 0);
    x.lineTo(p, S);
    x.moveTo(0, p);
    x.lineTo(S, p);
    x.stroke();
  }
  // stains and cracks
  for (let k = 0; k < 40; k++) {
    const px = rng() * S, py = rng() * S, r = 6 + rng() * 26;
    wrapDraw(x, px, py, r, (X, Y) => {
      const gr = x.createRadialGradient(X, Y, 0, X, Y, r);
      gr.addColorStop(0, 'rgba(60,58,54,0.25)');
      gr.addColorStop(1, 'rgba(60,58,54,0)');
      x.fillStyle = gr;
      x.fillRect(X - r, Y - r, r * 2, r * 2);
    });
  }
  return c;
}

let SET = null;
// The eight detail maps, in splat channel order:
// 0 grass, 1 forest floor, 2 dry grass, 3 dirt, 4 rock, 5 sand, 6 snow, 7 paved
export function groundTextures(anisotropy = 8) {
  if (SET) return SET;
  const rng = makeRng(1337);
  const makers = [grass, forestFloor, dryGrass, dirt, rock, sand, snow, paved];
  SET = makers.map((mk) => {
    const t = new THREE.CanvasTexture(mk(rng));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.NoColorSpace; // detail data, not a color to convert
    t.anisotropy = anisotropy;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    return t;
  });
  return SET;
}
