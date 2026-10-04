// Procedural Octane-style car geometry: a body lofted from smooth cross-sections with real wheel
// arches, a glass greenhouse, conforming decals (lights, door shut lines, grilles) and
// detailed wheels. Everything is built once per quality level and shared between cars.
// Units are uu in car space: +z forward, +x left, +y up, origin 17 uu above the ground.
import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { CAR } from '../config.js';

// ------------------------------------------------------------------ shape tables
// Octane-style shell: wedge nose, bulging fenders, tall cab, short rear deck that carries
// the exposed engine. Stations run from the tail (-z) to the nose (+z).
const KZ = [-46.2, -45.5, -44.4, -40, -34, -26, -18, -8, 4, 16, 26, 34, 44, 51, 58, 65, 70, 73, 74.4];
const TOP = [13, 18.5, 21, 21.8, 22.2, 21.5, 19.5, 17.6, 16.8, 16.4, 16.2, 16, 16.4, 16.6, 15.4, 11.6, 7.4, 3.8, 0.8];
const BOT = [2, 0, -1.5, -2.5, -3, -3, -3.2, -3.2, -3.2, -3.2, -3.2, -3.2, -3, -2.8, -2.4, -2, -1.6, -1.2, -0.8];
const CY = [8, 11, 12.5, 13.5, 14, 13, 11, 9.5, 8.8, 8.6, 8.6, 9, 9.8, 10.2, 9.4, 7, 4.4, 1.8, 0];
const HALF = [30, 34.5, 36.5, 37.5, 38, 37, 35, 34, 34, 34.5, 36.2, 38.8, 40.6, 41, 39.8, 36, 30.5, 24, 17];
const DIP = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3.4, 5, 5.4, 4.6, 3.2, 1.8, 0.6, 0];
const NT = [3.4, 4, 4.6, 5, 5.2, 5.4, 5.6, 5.8, 5.8, 5.8, 5.6, 5, 4.6, 4.6, 4.4, 4, 3.4, 3, 2.6];
const NB = [3.4, 4.5, 5.5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5.5, 5, 4.8, 4.4, 4, 3.4, 3];
// greenhouse: compact, angular cab set back on the body
const GZ = [-22.5, -19, -14, -8, -1, 6, 11, 16.5, 21.5, 25.5, 28.5];
const ROOF = [21, 26.4, 31.6, 34.6, 35.4, 35.4, 34.6, 30.6, 25.6, 20.8, 16.4];
const GHALF = [27.5, 28.5, 29.5, 30, 30, 29.8, 29.5, 29, 28, 27, 25.5];

// monotone cubic interpolation (no overshoot between keys)
function interp(xs, ys) {
  const n = xs.length;
  const d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

const F = { top: interp(KZ, TOP), bot: interp(KZ, BOT), cy: interp(KZ, CY), a: interp(KZ, HALF), dip: interp(KZ, DIP), nt: interp(KZ, NT), nb: interp(KZ, NB) };
const G = { roof: interp(GZ, ROOF), half: interp(GZ, GHALF) };

function section(z) {
  return { z, top: F.top(z), bot: F.bot(z), cy: F.cy(z), a: F.a(z), dip: F.dip(z), nt: F.nt(z), nb: F.nb(z) };
}

// right-hand outline of a section; th 0 = top centre, PI = bottom centre
function outline(sec, th) {
  const s = Math.max(0, Math.sin(th)), c = Math.cos(th);
  let x, y;
  if (th <= Math.PI / 2) {
    const e = 2 / sec.nt;
    x = sec.a * Math.pow(s, e);
    y = sec.cy + (sec.top - sec.cy) * Math.pow(Math.max(0, c), e);
    const xn = x / sec.a;
    y -= sec.dip * Math.pow(Math.max(0, 1 - xn * xn * 1.15), 2); // hood dips between the fenders
  } else {
    const e = 2 / sec.nb;
    x = sec.a * Math.pow(s, e);
    y = sec.cy - (sec.cy - sec.bot) * Math.pow(Math.max(0, -c), e);
  }
  return [x, y];
}

// wheel openings
export const tyreHalf = (r) => (r < 14 ? 6.5 : 8);
const ARCHES = CAR.wheels.filter((w) => w.x > 0).map((w) => {
  const half = tyreHalf(w.r);
  const px = Math.abs(w.x) + 7;
  return { z: w.z, cy: -CAR.restHeight + w.r, R: w.r + (w.front ? 3.4 : 5.2), inner: px - half - 2.2 };
});

function archAt(z) {
  for (const ar of ARCHES) {
    const dz = z - ar.z;
    if (Math.abs(dz) < ar.R) return { ...ar, y: ar.cy + Math.sqrt(ar.R * ar.R - dz * dz) };
  }
  return null;
}

// densely sample a parametric curve and resample it to n+1 points evenly spaced by length
function resample(fn, t0, t1, n, dense = 120) {
  const pts = [];
  const len = [0];
  for (let i = 0; i <= dense; i++) {
    const p = fn(t0 + ((t1 - t0) * i) / dense);
    if (i > 0) len.push(len[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]));
    pts.push(p);
  }
  const total = len[dense];
  const out = [];
  let j = 0;
  for (let k = 0; k <= n; k++) {
    const target = (total * k) / n;
    while (j < dense - 1 && len[j + 1] < target) j++;
    const seg = len[j + 1] - len[j];
    const f = seg > 1e-9 ? (target - len[j]) / seg : 0;
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]);
  }
  return out;
}

// theta where the outline crosses height y (outline y falls monotonically with theta)
function thetaAtY(sec, y) {
  let lo = 0, hi = Math.PI;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (outline(sec, mid)[1] > y) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// theta in the lower quadrant where the outline is at half-width x
function thetaAtXLow(sec, x) {
  let lo = Math.PI / 2, hi = Math.PI;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (outline(sec, mid)[0] > x) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// ------------------------------------------------------------------ body
function buildBody(q) {
  const MA = q.ringA, MB = q.ringB, MC = q.ringC;
  const side = MA + MB + MC; // points per side, top centre .. bottom centre
  const ringN = side * 2;
  // stations, with pairs hugging each arch edge so the openings stay crisp
  const zs = [];
  for (let z = KZ[0]; z < KZ[KZ.length - 1]; z += q.step) zs.push(z);
  zs.push(KZ[KZ.length - 1]);
  for (const ar of ARCHES) for (const e of [-1, 1]) zs.push(ar.z + e * (ar.R - 0.04), ar.z + e * (ar.R + 0.04));
  zs.sort((a, b) => a - b);

  const pos = [], dark = [];
  for (const z of zs) {
    const sec = section(z);
    const ar = archAt(z);
    const lipY = ar ? ar.y : Math.min(sec.cy - 1, -0.5);
    const thLip = thetaAtY(sec, lipY);
    const A = resample((t) => outline(sec, t), 0, thLip, MA);
    let B, C;
    if (ar) {
      const xEdge = A[MA][0];
      const xi = Math.min(ar.inner, xEdge - 0.5);
      B = resample((t) => [xEdge + (xi - xEdge) * t, ar.y], 0, 1, MB);
      const thF = thetaAtXLow(sec, xi);
      const yF = outline(sec, thF)[1];
      const wall = Math.max(0.01, ar.y - yF);
      const floorLen = (() => { let l = 0, p = outline(sec, thF); for (let i = 1; i <= 30; i++) { const c = outline(sec, thF + ((Math.PI - thF) * i) / 30); l += Math.hypot(c[0] - p[0], c[1] - p[1]); p = c; } return l; })();
      const split = wall / (wall + floorLen);
      C = resample((t) => (t < split ? [xi, ar.y - wall * (t / split)] : outline(sec, thF + (Math.PI - thF) * ((t - split) / (1 - split)))), 0, 1, MC, 200);
    } else {
      B = resample(() => A[MA], 0, 1, MB, 2);
      C = resample((t) => outline(sec, t), thLip, Math.PI, MC);
    }
    const right = A.concat(B.slice(1), C.slice(1)); // side + 1 points
    const isDark = (k, x, y, z2) => {
      if (k > MA + (ar ? 0 : MB)) return 1; // wheel wells, sills, under-tray
      return z2 < -44.6 ? 1 : 0; // the tail is the dark rear frame
    };
    // ring: right side top -> bottom, then left side bottom -> top (no repeats)
    for (let k = 0; k <= side; k++) { const [x, y] = right[k]; pos.push(-x, y, z); dark.push(isDark(k, x, y, z)); }
    for (let k = side - 1; k >= 1; k--) { const [x, y] = right[k]; pos.push(x, y, z); dark.push(isDark(k, x, y, z)); }
  }
  // note: +x is the car's left, so the "right" outline is placed at -x
  const S = zs.length;
  const idx = [];
  const darkTri = [];
  for (let i = 0; i < S - 1; i++) {
    for (let k = 0; k < ringN; k++) {
      const a = i * ringN + k, b = i * ringN + ((k + 1) % ringN), c = (i + 1) * ringN + k, d = (i + 1) * ringN + ((k + 1) % ringN);
      const dk = dark[a] && dark[b] && dark[c] && dark[d] ? 1 : 0;
      idx.push(a, b, c, b, d, c);
      darkTri.push(dk, dk);
    }
  }
  // end caps
  const capCentre = (i) => {
    let y = 0;
    for (let k = 0; k < ringN; k++) y += pos[(i * ringN + k) * 3 + 1];
    return y / ringN;
  };
  const tailC = pos.length / 3;
  pos.push(0, capCentre(0), zs[0] - 0.3);
  dark.push(0);
  const noseC = pos.length / 3;
  pos.push(0, capCentre(S - 1), zs[S - 1] + 0.3);
  dark.push(0);
  for (let k = 0; k < ringN; k++) {
    const k2 = (k + 1) % ringN;
    idx.push(tailC, k, k2);
    darkTri.push(1);
    idx.push(noseC, (S - 1) * ringN + k2, (S - 1) * ringN + k);
    darkTri.push(1);
  }
  return grouped(pos, idx, darkTri.map((d) => (d ? 1 : 0)), 2);
}

// sort triangles into material groups
function grouped(pos, idx, triGroup, nGroups) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const sorted = [];
  for (let m = 0; m < nGroups; m++) {
    const start = sorted.length;
    for (let t = 0; t < triGroup.length; t++) if (triGroup[t] === m) sorted.push(idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]);
    g.addGroup(start, sorted.length - start, m);
  }
  g.setIndex(sorted);
  g.computeVertexNormals();
  return g;
}

// body top surface height at half-width x (for seating the greenhouse)
function bodyTopAt(z, x) {
  const sec = section(z);
  let lo = 0, hi = Math.PI / 2;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (outline(sec, mid)[0] < x) lo = mid; else hi = mid;
  }
  return outline(sec, (lo + hi) / 2)[1];
}

// ------------------------------------------------------------------ greenhouse
function buildGreenhouse(q) {
  const M = q.ringG;
  const zs = [];
  for (let z = GZ[0]; z < GZ[GZ.length - 1]; z += q.step) zs.push(z);
  zs.push(GZ[GZ.length - 1]);
  const ringN = 2 * M + 1;
  const pos = [], cat = [];
  const sections = zs.map((z) => {
    const gb = G.half(z);
    const yb = bodyTopAt(z, gb) - 0.7;
    const h = Math.max(0.25, G.roof(z) - yb);
    const pts = resample((th) => {
      const s = Math.sin(th), c = Math.cos(th);
      const y = yb + h * Math.pow(Math.max(0, c), 2 / 5);
      const tumble = 1 - 0.2 * Math.pow((y - yb) / h, 1.2);
      return [gb * Math.pow(Math.max(0, s), 2 / 5) * tumble, y];
    }, 0, Math.PI / 2, M);
    return { z, h, pts };
  });
  // where the tallest section turns from roof to side; the same profile index is used
  // everywhere so the glass edges run in clean lines along the car
  const tall = sections.reduce((a, b) => (b.h > a.h ? b : a));
  let corner = M;
  for (let k = 0; k < M; k++) {
    const p = tall.pts;
    if (Math.abs(p[k + 1][1] - p[k][1]) > Math.abs(p[k + 1][0] - p[k][0])) { corner = k; break; }
  }
  const band = (k) => (k >= M - 1 ? 3 : k > corner + 1 ? 2 : k >= corner - 1 ? 1 : 0); // 0 top, 1 rail, 2 side, 3 seal
  for (const { z, pts } of sections) {
    // left base .. roof .. right base
    for (let k = M; k >= 0; k--) { pos.push(pts[k][0], pts[k][1], z); cat.push(band(k)); }
    for (let k = 1; k <= M; k++) { pos.push(-pts[k][0], pts[k][1], z); cat.push(band(k)); }
  }
  const S = zs.length;
  const idx = [];
  for (let i = 0; i < S - 1; i++) {
    for (let k = 0; k < ringN - 1; k++) {
      const a = i * ringN + k, b = i * ringN + k + 1, c = (i + 1) * ringN + k, d = (i + 1) * ringN + k + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  // materials: 0 paint (roof, pillars, rails), 1 glass, 2 black trim
  const tri = [];
  for (let t = 0; t < idx.length / 3; t += 2) {
    const ia = idx[t * 3], ib = idx[t * 3 + 1];
    const c = Math.max(cat[ia], cat[ib]);
    const z = pos[ia * 3 + 2];
    let m;
    if (c === 3) m = 2;
    else if (c === 2) m = z > -3.2 && z < 0.8 ? 2 : 1; // side glass with a black B-pillar
    else if (c === 1) m = 0;
    else m = z > 11 || z < -9 ? 1 : 0; // windscreen and rear glass, painted roof
    tri.push(m, m);
  }
  return grouped(pos, idx, tri, 3);
}

// ------------------------------------------------------------------ canvases for decals
function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function texOf(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// swept headlight: smoked lens, two projectors and an LED daytime-running strip
function headlightTextures() {
  const W = 256, H = 112;
  const c = canvas(W, H), e = canvas(W, H);
  const g = c.getContext('2d'), ge = e.getContext('2d');
  const shape = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(8, 70); ctx.bezierCurveTo(40, 20, 150, 8, 248, 14); ctx.lineTo(240, 52);
    ctx.bezierCurveTo(170, 60, 90, 80, 30, 104); ctx.closePath();
  };
  shape(g);
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#2a3038');
  grd.addColorStop(1, '#0b0d10');
  g.fillStyle = grd;
  g.fill();
  g.save();
  g.clip();
  for (const [cx, cy, r] of [[150, 38, 17], [196, 32, 14]]) {
    const rg = g.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, r);
    rg.addColorStop(0, '#ffffff');
    rg.addColorStop(0.35, '#c9d2dc');
    rg.addColorStop(1, '#3a414a');
    g.fillStyle = rg;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  g.lineWidth = 3;
  g.strokeStyle = '#8b939c';
  shape(g);
  g.stroke();
  ge.fillStyle = '#000';
  ge.fillRect(0, 0, W, H);
  ge.strokeStyle = '#fff';
  ge.lineWidth = 7;
  ge.lineCap = 'round';
  ge.beginPath(); ge.moveTo(36, 80); ge.bezierCurveTo(70, 50, 120, 62, 232, 44); ge.stroke();
  for (const [cx, cy, r] of [[150, 38, 7], [196, 32, 6]]) { ge.fillStyle = '#c8ccd0'; ge.beginPath(); ge.arc(cx, cy, r, 0, Math.PI * 2); ge.fill(); }
  return { map: texOf(c), emissiveMap: texOf(e) };
}

// round tail lamp: bright ring and a dimmer centre
function lampTexture() {
  const c = canvas(64, 64);
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  rg.addColorStop(0, '#4a0a0c');
  rg.addColorStop(0.45, '#c01822');
  rg.addColorStop(0.62, '#ffffff');
  rg.addColorStop(0.75, '#ff3a40');
  rg.addColorStop(1, '#5a0306');
  g.fillStyle = rg;
  g.fillRect(0, 0, 64, 64);
  return texOf(c);
}

// door and engine-cover shut lines, door handle
function panelLineTexture() {
  const W = 512, H = 320;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  g.clearRect(0, 0, W, H);
  g.strokeStyle = 'rgba(0,0,0,0.9)';
  g.lineWidth = 5;
  // door: front edge behind the front wheel, rear edge ahead of the side intake
  g.beginPath();
  g.moveTo(470, 40); g.lineTo(476, 250); g.quadraticCurveTo(476, 290, 430, 292);
  g.lineTo(80, 292); g.quadraticCurveTo(40, 290, 38, 250); g.lineTo(46, 40);
  g.stroke();
  // handle
  roundRect(g, 120, 108, 70, 14, 7);
  g.fillStyle = 'rgba(0,0,0,0.55)';
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.18)';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(124, 107); g.lineTo(186, 107); g.stroke();
  return texOf(c);
}

// twin hood vents
function hoodVentTexture() {
  const W = 256, H = 128;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  g.clearRect(0, 0, W, H);
  for (const x0 of [22, 140]) {
    g.beginPath();
    g.moveTo(x0, 100); g.lineTo(x0 + 94, 100); g.lineTo(x0 + 80, 30); g.lineTo(x0 + 14, 30); g.closePath();
    g.fillStyle = '#08090b';
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 2;
    g.stroke();
    for (let y = 40; y < 96; y += 11) {
      g.fillStyle = '#25282d';
      g.fillRect(x0 + 12 + (100 - y) * 0.2, y, 70 - (100 - y) * 0.4, 4);
    }
  }
  return texOf(c);
}

function badgeTexture() {
  const c = canvas(64, 64);
  const g = c.getContext('2d');
  g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2);
  g.fillStyle = '#c9ced6'; g.fill();
  g.beginPath(); g.arc(32, 32, 24, 0, Math.PI * 2);
  g.fillStyle = '#121418'; g.fill();
  g.fillStyle = '#e8ecf2';
  g.font = 'italic 900 26px Arial Black, Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('RA', 32, 34);
  return texOf(c);
}

// ------------------------------------------------------------------ decals
const _o = new THREE.Object3D();
function decal(mesh, position, dir, size, up = null, flipU = false) {
  _o.position.copy(position);
  _o.up.copy(up || new THREE.Vector3(0, 1, 0));
  _o.lookAt(position.clone().add(dir));
  const g = new DecalGeometry(mesh, position, _o.rotation.clone(), size);
  if (flipU) {
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
  }
  return g;
}

// ------------------------------------------------------------------ wheels
function buildWheel(r, half, q) {
  const seg = q.wheelSeg;
  const rimR = r * 0.6;
  const toAxleX = (g) => g.rotateZ(-Math.PI / 2); // lathe axis Y -> car X (outer face +x)
  // tyre: rounded sidewalls with a flat tread band
  const tread = new THREE.LatheGeometry([
    new THREE.Vector2(r * 0.975, -half * 0.93), new THREE.Vector2(r, -half * 0.72), new THREE.Vector2(r, half * 0.72), new THREE.Vector2(r * 0.975, half * 0.93),
  ], seg);
  toAxleX(tread);
  const side = (s) => {
    const pts = [
      new THREE.Vector2(r * 0.975, s * half * 0.93), new THREE.Vector2(r * 0.93, s * half), new THREE.Vector2(r * 0.84, s * half * 1.02),
      new THREE.Vector2(r * 0.75, s * half * 0.97), new THREE.Vector2(rimR + 0.4, s * half * 0.9), new THREE.Vector2(rimR, s * half * 0.84),
    ];
    if (s < 0) pts.reverse();
    const g = new THREE.LatheGeometry(pts, seg);
    toAxleX(g);
    return g;
  };
  // rim barrel and lip
  const barrel = new THREE.CylinderGeometry(rimR - 0.2, rimR - 0.2, half * 1.6, seg, 1, true);
  barrel.rotateZ(Math.PI / 2);
  barrel.translate(-half * 0.1, 0, 0);
  const lip = new THREE.TorusGeometry(rimR - 0.1, 0.42, 6, seg);
  lip.rotateY(Math.PI / 2);
  lip.translate(half * 0.8, 0, 0);
  // five double spokes, dished toward the hub
  const spokes = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const g = new THREE.BoxGeometry(1.4, rimR - r * 0.2, 2.6, 1, 4, 1);
    g.translate(0, (rimR + r * 0.2) / 2 - 0.2, 0);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k);
      const f = (y - r * 0.2) / (rimR - r * 0.2); // 0 at hub, 1 at rim
      p.setZ(k, p.getZ(k) * (1.25 - 0.45 * f)); // taper
      p.setX(k, p.getX(k) + half * (0.48 + 0.3 * f)); // concave face
    }
    g.rotateX((i / n) * Math.PI * 2 + 0.3);
    spokes.push(g);
  }
  const hub = new THREE.CylinderGeometry(r * 0.22, r * 0.24, 1.6, 20);
  hub.rotateZ(Math.PI / 2);
  hub.translate(half * 0.5, 0, 0);
  const cap = new THREE.CircleGeometry(r * 0.12, 20);
  cap.rotateY(Math.PI / 2);
  cap.translate(half * 0.5 + 0.82, 0, 0);
  const nuts = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.CylinderGeometry(0.45, 0.45, 0.9, 6);
    g.rotateZ(Math.PI / 2);
    const a = (i / 5) * Math.PI * 2;
    g.translate(half * 0.5 + 0.9, Math.cos(a) * r * 0.165, Math.sin(a) * r * 0.165);
    nuts.push(g);
  }
  // brake disc spins with the wheel; the caliper does not
  const disc = new THREE.CylinderGeometry(r * 0.6, r * 0.6, 1.2, seg);
  disc.rotateZ(Math.PI / 2);
  disc.translate(-half * 0.05, 0, 0);
  const caliper = new THREE.TorusGeometry(r * 0.55, 1.15, 6, 10, 1.0);
  caliper.scale(1, 1, 1.9);
  caliper.rotateY(Math.PI / 2);
  caliper.rotateX(Math.PI * 0.62);
  caliper.translate(half * 0.08, 0, 0);
  const mergeAll = (list) => {
    const m = mergeGeos(list);
    for (const g of list) g.dispose();
    return m;
  };
  return {
    tread, sideOut: side(1), sideIn: side(-1), barrel, lip,
    spokes: mergeAll(spokes.concat([hub])), nuts: mergeAll(nuts), cap, disc, caliper,
  };
}

function mergeGeos(list) {
  // light-weight merge for non-indexed + indexed mixes: convert all to non-indexed
  const parts = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let count = 0;
  for (const g of parts) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3), uv = new Float32Array(count * 2);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
    o += g.attributes.position.count;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  m.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  m.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return m;
}

// ------------------------------------------------------------------ public
const QUALITY = {
  high: { step: 1.1, ringA: 26, ringB: 5, ringC: 12, ringG: 18, wheelSeg: 40 },
  medium: { step: 1.6, ringA: 20, ringB: 4, ringC: 9, ringG: 14, wheelSeg: 28 },
  low: { step: 2.6, ringA: 14, ringB: 3, ringC: 6, ringG: 9, wheelSeg: 18 },
};

const cache = {};

export function carGeometry(quality = 'high') {
  if (cache[quality]) return cache[quality];
  const q = QUALITY[quality] || QUALITY.high;
  const body = buildBody(q);
  const greenhouse = buildGreenhouse(q);
  // decals need a mesh to project onto
  const bodyMesh = new THREE.Mesh(body);
  bodyMesh.updateMatrixWorld(true);
  const ghMesh = new THREE.Mesh(greenhouse);
  ghMesh.updateMatrixWorld(true);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const decals = {
    headR: decal(bodyMesh, V(-23, 7, 69), V(-0.45, 0.55, 0.7).normalize(), V(13, 6, 10)),
    headL: decal(bodyMesh, V(23, 7, 69), V(0.45, 0.55, 0.7).normalize(), V(13, 6, 10)),
    doorR: decal(bodyMesh, V(-34.5, 7, 8), V(-1, 0, 0), V(40, 21, 9)),
    doorL: decal(bodyMesh, V(34.5, 7, 8), V(1, 0, 0), V(40, 21, 9)),
    numR: decal(bodyMesh, V(-34.5, 7.5, 5), V(-1, 0, 0), V(19, 11.5, 9)),
    numL: decal(bodyMesh, V(34.5, 7.5, 5), V(1, 0, 0), V(19, 11.5, 9)),
    hoodVents: decal(bodyMesh, V(0, 11.5, 50), V(0, 1, 0.25).normalize(), V(24, 13, 8), V(0, 0, 1)),
    badge: decal(bodyMesh, V(0, 4, 72.6), V(0, 0.6, 0.8).normalize(), V(4.5, 4.5, 6)),
  };
  // (each side's projector faces outward, so its texture already reads correctly)
  const wheels = {};
  for (const w of CAR.wheels) {
    if (!wheels[w.r]) wheels[w.r] = buildWheel(w.r, tyreHalf(w.r), q);
  }
  const all = [body, greenhouse, ...Object.values(decals)];
  for (const wset of Object.values(wheels)) all.push(...Object.values(wset));
  for (const g of all) g.userData.shared = true;
  cache[quality] = { body, greenhouse, decals, wheels, arches: ARCHES };
  return cache[quality];
}

let tex = null;
export function carTextures() {
  if (tex) return tex;
  tex = {
    head: headlightTextures(),
    lamp: lampTexture(),
    panel: panelLineTexture(),
    vents: hoodVentTexture(),
    badge: badgeTexture(),
  };
  return tex;
}

// a point on the body skin, for things like spikes: z, side (-1 right / +1 left), height fraction
export function bodyPoint(z, sideSign, th) {
  const sec = section(z);
  const [x, y] = outline(sec, th);
  return new THREE.Vector3(sideSign * x, y, z);
}

export { G as greenhouseShape, bodyTopAt };
