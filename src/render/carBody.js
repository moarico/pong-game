// Procedural sports-car geometry: a body lofted from smooth cross-sections with real wheel
// arches, a glass greenhouse, conforming decals (lights, door shut lines, grilles) and
// detailed wheels. Everything is built once per quality level and shared between cars.
// Units are uu in car space: +z forward, +x left, +y up, origin 17 uu above the ground.
import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { CAR } from '../config.js';

// ------------------------------------------------------------------ shape tables
// stations from the tail (-z) to the nose (+z)
const KZ = [-58.4, -57.6, -56.5, -53, -46, -34, -22, -10, 2, 16, 30, 40, 51, 62, 71, 77, 81, 83, 84.2];
const TOP = [6, 13, 17.5, 20.5, 22.5, 22.8, 21.5, 19.5, 18.6, 18.4, 18, 16.5, 16.5, 15.5, 12, 8.5, 4.5, 1, -2.5];
const BOT = [-2, -5, -6.5, -8, -9.5, -10.5, -11, -11, -11, -11, -11, -11, -10.5, -10.2, -9.8, -9.2, -8.6, -7.6, -6];
const CY = [2, 8, 12, 15, 16.5, 17.5, 15, 11, 9, 9, 9.5, 11, 12, 10.5, 6.5, 2.5, -1, -3, -4.3];
const HALF = [22, 33.5, 38.5, 41.8, 44.0, 44.6, 42.6, 40, 39.2, 39.2, 39.6, 40.6, 41.3, 40.4, 37.4, 33.6, 28.2, 21, 10];
const DIP = [0, 0.5, 1.5, 2.2, 2.5, 2.5, 1.8, 0.5, 0, 0, 0, 2, 3, 2.8, 2, 1.2, 0.5, 0, 0];
const NT = [2.4, 2.6, 2.8, 3, 3.2, 3.2, 3.2, 3.4, 3.4, 3.4, 3.2, 3.2, 3.2, 3.2, 3, 2.8, 2.6, 2.4, 2.2];
const NB = [2.6, 3, 3.4, 3.6, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.6, 3.4, 3, 2.8, 2.6, 2.4];
// greenhouse
const GZ = [-35, -31, -24, -16, -8, 0, 8, 16, 24, 31, 36.5, 38.6];
const ROOF = [21.6, 23.6, 27.4, 30.8, 32.6, 33.2, 33, 31.6, 27.8, 23.3, 19.5, 17];
const GHALF = [30, 32, 33.5, 34, 34, 33.8, 33.5, 33, 32, 30.5, 29, 27];

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
const ARCHES = CAR.wheels.filter((w) => w.x > 0).map((w) => {
  const half = w.r < 14 ? 5.5 : 6.5;
  const px = Math.abs(w.x) + 7;
  return { z: w.z, cy: -CAR.restHeight + w.r, R: w.r + 3.6, inner: px - half - 2.2 };
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
    const lipY = ar ? ar.y : Math.min(sec.cy - 1, -6.8);
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
    // side intakes ahead of the rear wheels (mid-engine look)
    for (let k = 0; k < right.length; k++) {
      const [x, y] = right[k];
      const bz = THREE.MathUtils.smoothstep(z, -22, -18) * (1 - THREE.MathUtils.smoothstep(z, -9, -5));
      const by = THREE.MathUtils.smoothstep(y, -2, 2) * (1 - THREE.MathUtils.smoothstep(y, 9, 13));
      if (k <= MA && bz * by > 0) right[k] = [x - 4.5 * bz * by * Math.min(1, (x / sec.a - 0.7) * 4), y];
    }
    const isDark = (k, x, y, z2) => {
      if (k > MA + (ar ? 0 : MB)) return 1; // wheel wells, sills, under-tray
      const bz = z2 > -21 && z2 < -6 && y > -1 && y < 12 && x > sec.a - 3.5;
      return bz ? 1 : 0;
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
  const pos = [], base = [];
  for (const z of zs) {
    const gb = G.half(z);
    const yb = bodyTopAt(z, gb) - 0.7;
    const h = Math.max(0.25, G.roof(z) - yb);
    const pts = resample((th) => {
      const s = Math.sin(th), c = Math.cos(th);
      const y = yb + h * Math.pow(Math.max(0, c), 2 / 2.7);
      const tumble = 1 - 0.27 * Math.pow((y - yb) / h, 1.6);
      return [gb * Math.pow(Math.max(0, s), 2 / 2.7) * tumble, y];
    }, 0, Math.PI / 2, M);
    // left base .. roof .. right base
    for (let k = M; k >= 0; k--) { pos.push(pts[k][0], pts[k][1], z); base.push(M - k); }
    for (let k = 1; k <= M; k++) { pos.push(-pts[k][0], pts[k][1], z); base.push(M - k); }
  }
  const S = zs.length;
  const idx = [];
  for (let i = 0; i < S - 1; i++) {
    for (let k = 0; k < ringN - 1; k++) {
      const a = i * ringN + k, b = i * ringN + k + 1, c = (i + 1) * ringN + k, d = (i + 1) * ringN + k + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  // classify: 0 paint (roof, pillars), 1 glass, 2 black trim
  const g0 = new THREE.BufferGeometry();
  g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g0.setIndex(idx);
  g0.computeVertexNormals();
  const P = g0.attributes.position;
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3(), n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  const tri = [];
  for (let t = 0; t < idx.length / 3; t++) {
    // both triangles of a quad share a material so the glass edges don't zig-zag
    if (t % 2 === 1) { tri.push(tri[t - 1]); continue; }
    const ia = idx[t * 3], ib = idx[t * 3 + 1], ic = idx[t * 3 + 2];
    vA.fromBufferAttribute(P, ia); vB.fromBufferAttribute(P, ib); vC.fromBufferAttribute(P, ic);
    n.crossVectors(e1.subVectors(vB, vA), e2.subVectors(vC, vA)).normalize();
    const z = (vA.z + vB.z + vC.z) / 3;
    const ax = Math.abs(n.x);
    const minBase = Math.min(base[ia], base[ib], base[ic]);
    let m = 1;
    if (minBase <= 0 && Math.max(base[ia], base[ib], base[ic]) <= 1) m = 2; // window seal along the beltline
    else if (ax > 0.4 && ax < 0.84) m = 0; // pillars and roof rails
    else if (z > -7 && z < 15 && n.y > 0.72) m = 0; // roof panel
    else if (z > -3.2 && z < 0.6 && ax >= 0.84) m = 2; // B-pillar
    else if (Math.abs(n.z) > 0.25 && n.y < 0.8 && ax < 0.4 && z < -27) m = 0; // short tail of the fastback
    tri.push(m);
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

// full-width LED light bar
function tailTextures() {
  const W = 512, H = 40;
  const c = canvas(W, H), e = canvas(W, H);
  const g = c.getContext('2d'), ge = e.getContext('2d');
  roundRect(g, 4, 6, W - 8, H - 12, 12);
  g.fillStyle = '#2a0204';
  g.fill();
  g.strokeStyle = '#151618';
  g.lineWidth = 4;
  g.stroke();
  ge.fillStyle = '#000';
  ge.fillRect(0, 0, W, H);
  ge.fillStyle = '#ff2030';
  roundRect(ge, 14, 15, W - 28, 6, 3);
  ge.fill();
  for (const x of [20, W - 110]) { roundRect(ge, x, 11, 90, 14, 6); ge.fill(); }
  return { map: texOf(c), emissiveMap: texOf(e) };
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

// honeycomb grille, alpha-shaped
function grilleTexture(shape) {
  const W = 256, H = 64;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  g.save();
  shape(g, W, H);
  g.clip();
  g.fillStyle = '#060607';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#2c2f34';
  g.lineWidth = 1.5;
  const r = 4.5;
  for (let y = 0, row = 0; y < H + r; y += r * 1.5, row++) {
    for (let x = (row % 2) * r * 0.866; x < W + r; x += r * 1.732) {
      g.beginPath();
      for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k + Math.PI / 6; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      g.closePath();
      g.stroke();
    }
  }
  g.restore();
  g.strokeStyle = '#1a1c20';
  g.lineWidth = 4;
  shape(g, W, H);
  g.stroke();
  return texOf(c);
}

function louverTexture() {
  const W = 256, H = 160;
  const c = canvas(W, H);
  const g = c.getContext('2d');
  roundRect(g, 4, 4, W - 8, H - 8, 18);
  g.fillStyle = '#0a0b0d';
  g.fill();
  for (let y = 18; y < H - 14; y += 13) {
    const gr = g.createLinearGradient(0, y, 0, y + 9);
    gr.addColorStop(0, '#3a3e45');
    gr.addColorStop(1, '#121417');
    g.fillStyle = gr;
    roundRect(g, 16, y, W - 32, 8, 4);
    g.fill();
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
  const rimR = r * 0.68;
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
  const n = 10;
  for (let i = 0; i < n; i++) {
    const g = new THREE.BoxGeometry(1.3, rimR - r * 0.2, 1.5, 1, 4, 1);
    g.translate(0, (rimR + r * 0.2) / 2 - 0.2, 0);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k);
      const f = (y - r * 0.2) / (rimR - r * 0.2); // 0 at hub, 1 at rim
      p.setZ(k, p.getZ(k) * (1.25 - 0.45 * f)); // taper
      p.setX(k, p.getX(k) + half * (0.48 + 0.3 * f)); // concave face
    }
    g.rotateX(((i - (i % 2)) / n) * Math.PI * 2 + (i % 2 ? 0.2 : -0.2) + 0.3);
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
    headR: decal(bodyMesh, V(-28.5, 5, 76.5), V(-0.62, 0.22, 0.75).normalize(), V(17, 7.4, 12)),
    headL: decal(bodyMesh, V(28.5, 5, 76.5), V(0.62, 0.22, 0.75).normalize(), V(17, 7.4, 12), null, false),
    tail: decal(bodyMesh, V(0, 14.2, -57), V(0, 0.15, -1).normalize(), V(72, 5.6, 9)),
    doorR: decal(bodyMesh, V(-40, 5, 12.5), V(-1, 0, 0), V(41, 26, 9)),
    doorL: decal(bodyMesh, V(40, 5, 12.5), V(1, 0, 0), V(41, 26, 9)),
    numR: decal(bodyMesh, V(-40, 3.5, 10), V(-1, 0, 0), V(21, 12.5, 9)),
    numL: decal(bodyMesh, V(40, 3.5, 10), V(1, 0, 0), V(21, 12.5, 9)),
    scoopR: decal(bodyMesh, V(-41, 5.2, -13.5), V(-1, 0, 0), V(15.5, 13, 12)),
    scoopL: decal(bodyMesh, V(41, 5.2, -13.5), V(1, 0, 0), V(15.5, 13, 12)),
    grille: decal(bodyMesh, V(0, -3.2, 83), V(0, 0.05, 1).normalize(), V(52, 7, 10)),
    louvers: decal(bodyMesh, V(0, 22, -45.5), V(0, 1, 0), V(30, 16, 8), V(0, 0, -1)),
    badge: decal(bodyMesh, V(0, 3.4, 81.6), V(0, 0.55, 0.84).normalize(), V(5.5, 5.5, 6)),
  };
  // mirror the left-side textures so they read correctly
  for (const k of ['headR', 'doorR', 'numR', 'scoopR']) {
    const uv = decals[k].attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
  }
  const wheels = {};
  for (const w of CAR.wheels) {
    const half = w.r < 14 ? 5.5 : 6.5;
    if (!wheels[w.r]) wheels[w.r] = buildWheel(w.r, half, q);
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
    tail: tailTextures(),
    panel: panelLineTexture(),
    grille: grilleTexture((g, W, H) => { g.beginPath(); g.moveTo(6, 10); g.lineTo(W - 6, 10); g.lineTo(W - 34, H - 6); g.lineTo(34, H - 6); g.closePath(); }),
    scoop: grilleTexture((g, W, H) => { g.beginPath(); g.moveTo(16, 10); g.lineTo(W - 8, 4); g.lineTo(W - 20, H - 6); g.lineTo(30, H - 10); g.closePath(); }),
    louvers: louverTexture(),
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
