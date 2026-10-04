import * as THREE from 'three';
import { MAP } from '../config.js';
import { POIS, LAKE, MOUNTAIN, BIOMES, RIVERS, ROADS, ROAD_HALF_WIDTH, BIOME_COLORS } from './island.js';
import { makeNoise2D, fbm, smoothstep, lerp, clamp, resamplePolyline, distToSegment } from '../util.js';
import { GeoBuilder } from './geobuilder.js';
import { terrainMaterial } from './terrainmat.js';

export const BIOME_IDS = ['grass', 'forest', 'snow', 'desert', 'swamp', 'autumn', 'farm'];

// Buckets line segments into a grid so "nearest segment" queries stay fast.
class SegmentIndex {
  constructor(cell, reach) {
    this.cell = cell;
    this.reach = reach;
    this.map = new Map();
    this.segs = [];
  }
  key(ix, iz) {
    return (ix + 512) * 1024 + (iz + 512);
  }
  add(ax, az, bx, bz, data) {
    const seg = { ax, az, bx, bz, data };
    this.segs.push(seg);
    const r = this.reach;
    const x0 = Math.floor((Math.min(ax, bx) - r) / this.cell), x1 = Math.floor((Math.max(ax, bx) + r) / this.cell);
    const z0 = Math.floor((Math.min(az, bz) - r) / this.cell), z1 = Math.floor((Math.max(az, bz) + r) / this.cell);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const k = this.key(ix, iz);
        let list = this.map.get(k);
        if (!list) this.map.set(k, (list = []));
        list.push(seg);
      }
    }
  }
  nearest(x, z) {
    const list = this.map.get(this.key(Math.floor(x / this.cell), Math.floor(z / this.cell)));
    let best = null;
    let bestD = this.reach;
    if (!list) return null;
    for (const s of list) {
      const r = distToSegment(x, z, s.ax, s.az, s.bx, s.bz);
      if (r.d < bestD) {
        bestD = r.d;
        best = { d: r.d, t: r.t, seg: s };
      }
    }
    return best;
  }
}

const srgb = new THREE.Color();
function hexToRgb(hex) {
  srgb.set(hex);
  // THREE stores linear; convert back to sRGB components for palette math.
  const c = srgb.clone().convertLinearToSRGB();
  return [c.r, c.g, c.b];
}
const PAL = {};
for (const k of Object.keys(BIOME_COLORS)) PAL[k] = BIOME_COLORS[k].map(hexToRgb);
const C = {
  sand: hexToRgb('#e8d79c'),
  wetSand: hexToRgb('#c8b47c'),
  deep: hexToRgb('#5d7f86'),
  rock: hexToRgb('#8a8580'),
  darkRock: hexToRgb('#6c6863'),
  snow: hexToRgb('#f1f5fa'),
  pavement: hexToRgb('#8e9196'),
  street: hexToRgb('#55585e'),
  concrete: hexToRgb('#8b867b'),
  dirt: hexToRgb('#8d6f4a'),
  courtyard: hexToRgb('#b6a27c'),
  mud: hexToRgb('#6b5a3c'),
};
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
// Splat channels for the detail textures (see groundtex.js).
const G = { grass: 0, forest: 1, dry: 2, dirt: 3, rock: 4, sand: 5, snow: 6, paved: 7 };
// What each biome's ground is made of.
const BIOME_SPLAT = {
  grass: [[G.grass, 1]],
  forest: [[G.forest, 0.7], [G.grass, 0.3]],
  snow: [[G.snow, 0.8], [G.rock, 0.2]],
  desert: [[G.sand, 0.75], [G.dirt, 0.25]],
  swamp: [[G.forest, 0.5], [G.dirt, 0.5]],
  autumn: [[G.dry, 0.55], [G.forest, 0.45]],
  farm: [[G.dry, 0.55], [G.grass, 0.25], [G.dirt, 0.2]],
};
// Move the splat weights toward one channel by t (the same blend the colors get).
function splatTo(sp, ch, t) {
  if (t <= 0) return;
  for (let i = 0; i < 8; i++) sp[i] *= 1 - t;
  sp[ch] += t;
}

export class Terrain {
  constructor(seed = 20241) {
    this.N = MAP.terrainSegments;
    this.size = MAP.terrainSize;
    this.half = this.size / 2;
    this.cell = this.size / this.N;
    this.n1 = makeNoise2D(seed);
    this.n2 = makeNoise2D(seed + 11);
    this.n3 = makeNoise2D(seed + 23);
    const V = (this.N + 1) * (this.N + 1);
    this.heights = new Float32Array(V);
    this.biomes = new Uint8Array(V);
    this.colors = new Float32Array(V * 3); // sRGB 0..1
    this.roads = [];
    this.bridges = [];
  }

  // ---------- generation ----------

  biomeWeights(x, z) {
    const wx = x + 34 * this.n1(x / 130, z / 130);
    const wz = z + 34 * this.n2(x / 130 + 40, z / 130 + 40);
    const dists = {};
    let minD = Infinity, id = 'grass';
    for (const name of BIOME_IDS) {
      let d = Infinity;
      for (const [ax, az] of BIOMES[name]) d = Math.min(d, Math.hypot(wx - ax, wz - az));
      dists[name] = d;
      if (d < minD) {
        minD = d;
        id = name;
      }
    }
    const w = {};
    for (const name of BIOME_IDS) w[name] = Math.exp(-(dists[name] - minD) / 22);
    let sum = 0;
    for (const name of BIOME_IDS) sum += w[name];
    for (const name of BIOME_IDS) w[name] /= sum;
    w.id = id;
    return w;
  }

  coastDistance(x, z) {
    const r = Math.hypot(x, z);
    const a = Math.atan2(z, x);
    const coast = 440 + 30 * this.n1(Math.cos(a) * 1.2 + 3, Math.sin(a) * 1.2 + 3) + 14 * this.n2(Math.cos(a) * 3 + 9, Math.sin(a) * 3 + 9);
    return r / coast;
  }

  baseHeight(x, z, w) {
    const d = this.coastDistance(x, z);
    let h = 5.5 + 6 * fbm(this.n2, x / 170, z / 170, 4) + 2.2 * fbm(this.n3, x / 45, z / 45, 2);
    h = Math.max(h, 2.2);
    const md = Math.hypot(x - MOUNTAIN.x, z - MOUNTAIN.z);
    const ridge = 1 - Math.abs(this.n2(x / 70, z / 70));
    h += MOUNTAIN.height * Math.exp(-(md * md) / (2 * MOUNTAIN.sigma * MOUNTAIN.sigma)) * (0.86 + 0.16 * ridge);
    h = lerp(h, 0.5 + 1.7 * this.n3(x / 26, z / 26), w.swamp);
    h += w.desert * (1.5 * Math.sin(x * 0.09 + z * 0.03 + 2.5 * this.n1(x / 60, z / 60)) + 1.4);
    h = lerp(h, 4.5 + 1.2 * this.n2(x / 90, z / 90), w.farm * 0.75);
    if (d > 1) return lerp(-2.5, MAP.seaFloor, smoothstep(1.0, 1.2, d));
    return lerp(h, -2.5, smoothstep(0.82, 1.0, d));
  }

  buildRoadPolylines() {
    const idx = new SegmentIndex(32, 14);
    ROADS.forEach((pts, ri) => {
      // Subdivide with gentle perpendicular wobble so roads look hand-laid.
      const raw = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
        const len = Math.hypot(bx - ax, bz - az);
        const n = Math.max(1, Math.round(len / 26));
        const px = -(bz - az) / len, pz = (bx - ax) / len;
        for (let k = 0; k < n; k++) {
          const t = k / n;
          const edge = Math.sin(t * Math.PI);
          const off = k === 0 ? 0 : 6 * edge * this.n1(ri * 7.1 + i * 3.3 + t * 2.1, 0.5);
          raw.push([lerp(ax, bx, t) + px * off, lerp(az, bz, t) + pz * off]);
        }
      }
      raw.push(pts[pts.length - 1].slice());
      const points = resamplePolyline(raw, 3);
      const road = { points, heights: new Float32Array(points.length) };
      this.roads.push(road);
      for (let i = 0; i < points.length - 1; i++) {
        idx.add(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], { road, i });
      }
    });
    this.roadIndex = idx;
  }

  buildRiverIndex() {
    const idx = new SegmentIndex(32, 70);
    for (const river of RIVERS) {
      const pts = resamplePolyline(river.points, 10);
      river.samples = pts;
      for (let i = 0; i < pts.length - 1; i++) idx.add(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { river });
    }
    this.riverIndex = idx;
  }

  generate() {
    const N = this.N;
    this.buildRoadPolylines();
    this.buildRiverIndex();
    // POI flatten targets
    for (const p of POIS) {
      const w = this.biomeWeights(p.x, p.z);
      p.ground = Math.max(2.8, this.baseHeight(p.x, p.z, w));
    }
    const weightsCache = new Array((N + 1) * (N + 1));
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const k = j * (N + 1) + i;
        const x = -this.half + i * this.cell, z = -this.half + j * this.cell;
        const w = this.biomeWeights(x, z);
        weightsCache[k] = w;
        this.biomes[k] = BIOME_IDS.indexOf(w.id);
        let h = this.baseHeight(x, z, w);
        for (const p of POIS) {
          if (p.type === 'swamp') continue;
          const dd = Math.hypot(x - p.x, z - p.z);
          if (dd > p.r * 1.35) continue;
          h = lerp(h, p.ground, 1 - smoothstep(p.r * 0.8, p.r * 1.3, dd));
        }
        const ld = Math.hypot(x - LAKE.x, z - LAKE.z);
        if (ld < LAKE.r * 1.2) h = Math.min(h, lerp(h, LAKE.depth, 1 - smoothstep(LAKE.r * 0.55, LAKE.r * 1.08, ld)));
        const riv = this.riverIndex.nearest(x, z);
        if (riv) {
          const rv = riv.seg.data.river;
          const dR = riv.d;
          const valley = 1 - smoothstep(rv.halfWidth, rv.halfWidth + 55, dR);
          const vt = 0.9 + Math.max(0, dR - rv.halfWidth) * 0.16;
          h = Math.min(h, lerp(h, vt, valley * 0.9));
          const road = this.roadIndex.nearest(x, z);
          const bridge = road ? 1 - smoothstep(ROAD_HALF_WIDTH + 1, ROAD_HALF_WIDTH + 5, road.d) : 0;
          const ch = (1 - smoothstep(rv.halfWidth, rv.halfWidth + rv.bank, dR)) * (1 - bridge);
          h = lerp(h, Math.min(h, -1.9), ch);
        }
        this.heights[k] = h;
      }
    }
    // Road heights follow the smoothed terrain, then the terrain is flattened under them.
    for (const road of this.roads) {
      const n = road.points.length;
      const raw = new Float32Array(n);
      for (let i = 0; i < n; i++) raw[i] = this.heightAt(road.points[i][0], road.points[i][1]);
      let cur = raw;
      for (let pass = 0; pass < 3; pass++) {
        const out = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          let s = 0, c = 0;
          for (let o = -6; o <= 6; o++) {
            const q = clamp(i + o, 0, n - 1);
            s += cur[q];
            c++;
          }
          out[i] = s / c;
        }
        cur = out;
      }
      for (let i = 0; i < n; i++) road.heights[i] = Math.max(1.4, cur[i]);
    }
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const k = j * (N + 1) + i;
        const x = -this.half + i * this.cell, z = -this.half + j * this.cell;
        const road = this.roadIndex.nearest(x, z);
        if (!road) continue;
        const { road: rd, i: si } = road.seg.data;
        const hr = lerp(rd.heights[si], rd.heights[Math.min(si + 1, rd.heights.length - 1)], road.t);
        const w = 1 - smoothstep(ROAD_HALF_WIDTH + 0.5, ROAD_HALF_WIDTH + 5.5, road.d);
        this.heights[k] = lerp(this.heights[k], hr - 0.1, w);
      }
    }
    this.findBridges();
    this.computeColors(weightsCache);
  }

  findBridges() {
    for (const road of this.roads) {
      let run = null;
      for (let i = 0; i < road.points.length; i++) {
        const [x, z] = road.points[i];
        const riv = this.riverIndex.nearest(x, z);
        const over = riv && riv.d < riv.seg.data.river.halfWidth + riv.seg.data.river.bank + 1;
        if (over) {
          if (!run) run = { road, from: i, to: i };
          run.to = i;
        } else if (run) {
          this.bridges.push(run);
          run = null;
        }
      }
      if (run) this.bridges.push(run);
    }
  }

  computeColors(weightsCache) {
    const N = this.N;
    this.splat = new Float32Array((N + 1) * (N + 1) * 8);
    const sp = new Float32Array(8);
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const k = j * (N + 1) + i;
        const x = -this.half + i * this.cell, z = -this.half + j * this.cell;
        const c = this.groundColor(x, z, this.heights[k], weightsCache[k], sp);
        this.colors[k * 3] = c[0];
        this.colors[k * 3 + 1] = c[1];
        this.colors[k * 3 + 2] = c[2];
        this.splat.set(sp, k * 8);
      }
    }
  }

  // Ground color (biome palette) and, into sp, the splat weights of the detail textures.
  groundColor(x, z, h, w, sp = new Float32Array(8)) {
    sp.fill(0);
    const nA = (this.n1(x / 32, z / 32) + 1) / 2;
    const nB = (this.n3(x / 11, z / 11) + 1) / 2;
    let col = [0, 0, 0];
    for (const name of BIOME_IDS) {
      if (w[name] < 0.02) continue;
      let c;
      const p = PAL[name];
      if (name === 'farm') {
        const fx = Math.floor((x + 6 * this.n2(z / 40, 0)) / 30);
        const fz = Math.floor(z / 22);
        const hsh = Math.abs(Math.sin(fx * 12.9898 + fz * 78.233) * 43758.5453) % 1;
        c = p[Math.floor(hsh * 3)];
        const stripe = Math.sin((hsh > 0.5 ? x : z) * 1.6) * 0.04;
        c = [c[0] + stripe, c[1] + stripe, c[2] + stripe];
      } else {
        c = mix3(mix3(p[0], p[1], nA), p[2], nB * 0.5);
      }
      col[0] += c[0] * w[name];
      col[1] += c[1] * w[name];
      col[2] += c[2] * w[name];
      for (const [ch, f] of BIOME_SPLAT[name]) sp[ch] += f * w[name];
    }
    {
      let t = 0;
      for (let i = 0; i < 8; i++) t += sp[i];
      if (t > 0) for (let i = 0; i < 8; i++) sp[i] /= t;
      else sp[G.grass] = 1;
    }
    // Slope and altitude
    const s = this.slopeAtRaw(x, z);
    if (h > 46) {
      col = mix3(col, C.snow, smoothstep(46, 58, h));
      splatTo(sp, G.snow, smoothstep(46, 58, h));
    }
    if (s > 0.75) {
      col = mix3(col, h > 50 ? C.darkRock : C.rock, smoothstep(0.75, 1.2, s) * 0.85);
      splatTo(sp, G.rock, smoothstep(0.65, 1.1, s));
    }
    // POI ground
    for (const p of POIS) {
      const d = Math.hypot(x - p.x, z - p.z);
      if (d > p.r) continue;
      const inner = 1 - smoothstep(p.r * 0.75, p.r, d);
      let g = null;
      if (p.type === 'city') {
        const gx = Math.abs(((x - p.x + 1000) % 26) - 13), gz = Math.abs(((z - p.z + 1000) % 26) - 13);
        g = gx > 10.5 || gz > 10.5 ? C.street : C.pavement;
      } else if (p.type === 'factory' || p.type === 'power') g = C.concrete;
      else if (p.type === 'castle') g = d < p.r * 0.62 ? C.courtyard : null;
      else if (p.type === 'camp' || p.type === 'cabins') g = d < p.r * 0.4 ? C.dirt : null;
      if (g) {
        const t = inner * (p.type === 'castle' || p.type === 'camp' || p.type === 'cabins' ? 0.8 : 0.92);
        col = mix3(col, g, t);
        splatTo(sp, g === C.dirt ? G.dirt : G.paved, t);
      }
    }
    // Shores, river banks and underwater
    const coast = this.coastDistance(x, z);
    if (h < 2.4 && (coast > 0.8 || w.desert > 0.5)) {
      col = mix3(col, C.sand, smoothstep(2.4, 1.0, h));
      splatTo(sp, G.sand, smoothstep(2.4, 1.0, h));
    }
    if (h < 1.2 && w.swamp > 0.5) {
      col = mix3(col, C.mud, smoothstep(1.2, 0.2, h));
      splatTo(sp, G.dirt, smoothstep(1.2, 0.2, h));
    } else if (h < 1.0) {
      col = mix3(col, C.wetSand, smoothstep(1.0, 0.0, h));
      splatTo(sp, G.sand, smoothstep(1.0, 0.0, h));
    }
    if (h < 0) {
      col = mix3(C.wetSand, C.deep, smoothstep(0, -8, h));
      splatTo(sp, G.sand, 1);
    }
    return col;
  }

  // ---------- queries ----------

  vIndex(i, j) {
    return j * (this.N + 1) + i;
  }

  heightAt(x, z) {
    const fx = (x + this.half) / this.cell, fz = (z + this.half) / this.cell;
    if (fx < 0 || fz < 0 || fx >= this.N || fz >= this.N) return MAP.seaFloor;
    const i = Math.floor(fx), j = Math.floor(fz);
    const u = fx - i, v = fz - j;
    const H = this.heights, W = this.N + 1;
    const ha = H[j * W + i], hb = H[j * W + i + 1], hc = H[(j + 1) * W + i], hd = H[(j + 1) * W + i + 1];
    if (u + v <= 1) return ha + (hb - ha) * u + (hc - ha) * v;
    return hd + (hc - hd) * (1 - u) + (hb - hd) * (1 - v);
  }

  slopeAtRaw(x, z) {
    const e = this.cell;
    const dx = (this.heightAt(x + e, z) - this.heightAt(x - e, z)) / (2 * e);
    const dz = (this.heightAt(x, z + e) - this.heightAt(x, z - e)) / (2 * e);
    return Math.hypot(dx, dz);
  }

  normalAt(x, z, out = new THREE.Vector3()) {
    const e = 1;
    const dx = this.heightAt(x + e, z) - this.heightAt(x - e, z);
    const dz = this.heightAt(x, z + e) - this.heightAt(x, z - e);
    return out.set(-dx, 2 * e, -dz).normalize();
  }

  biomeAt(x, z) {
    const i = clamp(Math.round((x + this.half) / this.cell), 0, this.N);
    const j = clamp(Math.round((z + this.half) / this.cell), 0, this.N);
    return BIOME_IDS[this.biomes[this.vIndex(i, j)]];
  }

  distToRoad(x, z) {
    const r = this.roadIndex.nearest(x, z);
    return r ? r.d : Infinity;
  }

  distToRiver(x, z) {
    const r = this.riverIndex.nearest(x, z);
    return r ? r.d - r.seg.data.river.halfWidth : Infinity;
  }

  isLand(x, z, minH = 0.6) {
    return this.heightAt(x, z) > minH;
  }

  // ---------- meshes ----------

  buildMesh() {
    const N = this.N, W = N + 1;
    const pos = new Float32Array(W * W * 3);
    const col = new Float32Array(W * W * 3);
    const c = new THREE.Color();
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const k = j * W + i;
        pos[k * 3] = -this.half + i * this.cell;
        pos[k * 3 + 1] = this.heights[k];
        pos[k * 3 + 2] = -this.half + j * this.cell;
        c.setRGB(this.colors[k * 3], this.colors[k * 3 + 1], this.colors[k * 3 + 2], THREE.SRGBColorSpace);
        col[k * 3] = c.r;
        col[k * 3 + 1] = c.g;
        col[k * 3 + 2] = c.b;
      }
    }
    const idx = new Uint32Array(N * N * 6);
    let p = 0;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const a = j * W + i, b = a + 1, cc = a + W, d = cc + 1;
        idx[p++] = a; idx[p++] = cc; idx[p++] = b;
        idx[p++] = b; idx[p++] = cc; idx[p++] = d;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const s0 = new Float32Array(W * W * 4), s1 = new Float32Array(W * W * 4);
    for (let k = 0; k < W * W; k++) {
      for (let c4 = 0; c4 < 4; c4++) {
        s0[k * 4 + c4] = this.splat[k * 8 + c4];
        s1[k * 4 + c4] = this.splat[k * 8 + 4 + c4];
      }
    }
    g.setAttribute('aSplat0', new THREE.BufferAttribute(s0, 4));
    g.setAttribute('aSplat1', new THREE.BufferAttribute(s1, 4));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeVertexNormals();
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, terrainMaterial());
    mesh.receiveShadow = true;
    mesh.name = 'terrain';
    return mesh;
  }

  buildRoadMesh() {
    const gb = new GeoBuilder();
    gb.jitter = 0;
    const asphalt = gb.rgb('#3d4046');
    const line = gb.rgb('#e8d36a');
    const hw = ROAD_HALF_WIDTH;
    for (const road of this.roads) {
      const pts = road.points;
      const L = [], R = [], CL = [], CR = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        let tx = b[0] - a[0], tz = b[1] - a[1];
        const len = Math.hypot(tx, tz) || 1;
        tx /= len;
        tz /= len;
        const px = -tz, pz = tx;
        const y = road.heights[i] + 0.06;
        L.push([pts[i][0] + px * hw, y, pts[i][1] + pz * hw]);
        R.push([pts[i][0] - px * hw, y, pts[i][1] - pz * hw]);
        CL.push([pts[i][0] + px * 0.12, y + 0.02, pts[i][1] + pz * 0.12]);
        CR.push([pts[i][0] - px * 0.12, y + 0.02, pts[i][1] - pz * 0.12]);
      }
      for (let i = 0; i < pts.length - 1; i++) {
        // Both windings are emitted through triOut toward a point below so faces point up.
        const cx = pts[i][0], cz = pts[i][1], cy = road.heights[i] - 5;
        gb.triOut(L[i], R[i], R[i + 1], asphalt, cx, cy, cz);
        gb.triOut(L[i], R[i + 1], L[i + 1], asphalt, cx, cy, cz);
        if (i % 2 === 0) {
          gb.triOut(CL[i], CR[i], CR[i + 1], line, cx, cy, cz);
          gb.triOut(CL[i], CR[i + 1], CL[i + 1], line, cx, cy, cz);
        }
      }
    }
    // Bridge railings
    const rail = '#c9c3b5';
    for (const br of this.bridges) {
      const { road } = br;
      const from = Math.max(0, br.from - 2), to = Math.min(road.points.length - 1, br.to + 2);
      for (let i = from; i < to; i++) {
        const [ax, az] = road.points[i], [bx, bz] = road.points[i + 1];
        const len = Math.hypot(bx - ax, bz - az) || 1;
        const tx = (bx - ax) / len, tz = (bz - az) / len;
        const px = -tz, pz = tx;
        const yaw = Math.atan2(tx, tz);
        const y = road.heights[i];
        for (const side of [-1, 1]) {
          const ox = px * (hw + 0.2) * side, oz = pz * (hw + 0.2) * side;
          gb.boxRot((ax + bx) / 2 + ox, y + 0.9, (az + bz) / 2 + oz, 0.2, 0.15, len + 0.05, yaw, rail);
          gb.boxRot(ax + ox, y - 0.6, az + oz, 0.25, 1.6, 0.25, yaw, rail);
        }
      }
    }
    const mesh = new THREE.Mesh(
      gb.build(),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }),
    );
    mesh.receiveShadow = true;
    mesh.name = 'roads';
    return mesh;
  }

  // Top-down painted map used by the minimap and the full map.
  buildMapCanvas(px = 512, footprints = []) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = px;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(px, px);
    const W = this.N + 1;
    const scale = this.size / px;
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const wx = -this.half + (x + 0.5) * scale, wz = -this.half + (y + 0.5) * scale;
        const fx = clamp(Math.round((wx + this.half) / this.cell), 0, this.N);
        const fz = clamp(Math.round((wz + this.half) / this.cell), 0, this.N);
        const k = fz * W + fx;
        const h = this.heightAt(wx, wz);
        let r = this.colors[k * 3], g = this.colors[k * 3 + 1], b = this.colors[k * 3 + 2];
        const shade = clamp(0.82 + (this.heightAt(wx - 3, wz - 3) - h) * 0.12, 0.6, 1.15);
        r *= shade;
        g *= shade;
        b *= shade;
        if (h < 0) {
          const t = smoothstep(0, -10, h);
          r = lerp(0.36, 0.13, t);
          g = lerp(0.62, 0.36, t);
          b = lerp(0.85, 0.66, t);
        }
        const o = (y * px + x) * 4;
        img.data[o] = clamp(r * 255, 0, 255);
        img.data[o + 1] = clamp(g * 255, 0, 255);
        img.data[o + 2] = clamp(b * 255, 0, 255);
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const toPx = (v) => (v + this.half) / scale;
    ctx.strokeStyle = 'rgba(60,62,68,0.9)';
    ctx.lineWidth = Math.max(1.5, (ROAD_HALF_WIDTH * 2) / scale);
    ctx.lineJoin = 'round';
    for (const road of this.roads) {
      ctx.beginPath();
      road.points.forEach(([x, z], i) => (i ? ctx.lineTo(toPx(x), toPx(z)) : ctx.moveTo(toPx(x), toPx(z))));
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(70,64,60,0.85)';
    for (const f of footprints) ctx.fillRect(toPx(f.x0), toPx(f.z0), Math.max(1, (f.x1 - f.x0) / scale), Math.max(1, (f.z1 - f.z0) / scale));
    return cv;
  }
}
