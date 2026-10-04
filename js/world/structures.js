import * as THREE from 'three';
import { GeoBuilder, worldMaterial } from './geobuilder.js';
import { POIS, LAKE, ROAD_HALF_WIDTH } from './island.js';
import { makeRng, clamp, lerp } from '../util.js';

// Local building frame rotated by multiples of 90 degrees so every box stays axis aligned.
class Frame {
  constructor(cx, cz, rot) {
    this.cx = cx;
    this.cz = cz;
    this.rot = ((rot % 4) + 4) % 4;
    this.yaw = (this.rot * Math.PI) / 2;
  }
  tw(lx, lz) {
    switch (this.rot) {
      case 0: return [this.cx + lx, this.cz + lz];
      case 1: return [this.cx + lz, this.cz - lx];
      case 2: return [this.cx - lx, this.cz - lz];
      default: return [this.cx - lz, this.cz + lx];
    }
  }
  tl(x, z) {
    const dx = x - this.cx, dz = z - this.cz;
    switch (this.rot) {
      case 0: return [dx, dz];
      case 1: return [-dz, dx];
      case 2: return [-dx, -dz];
      default: return [dz, -dx];
    }
  }
  rect(lx0, lz0, lx1, lz1) {
    const [ax, az] = this.tw(lx0, lz0), [bx, bz] = this.tw(lx1, lz1);
    return [Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)];
  }
}

const WALLS = ['#e8dcc6', '#d9b38c', '#a7c4d9', '#c96f53', '#f2efe6', '#9fb48a', '#d6a756', '#c9a7c9'];
const ROOFS = ['#a8473a', '#5a6470', '#3e5c7a', '#7a4b2f', '#46603f', '#8a3b52'];
const TOWER_WALLS = ['#c7ccd3', '#b9a99a', '#7d8fa3', '#d8d2c4', '#a3b8a8', '#d4b9a0'];
const WOOD = '#8e6a46', DARK_WOOD = '#5f4430', FLOOR = '#a07d57', FOUNDATION = '#8d8a85', STONE = '#9a958c';

export class Structures {
  constructor(terrain, collision, seed = 99) {
    this.T = terrain;
    this.W = collision;
    this.rng = makeRng(seed);
    this.group = new THREE.Group();
    this.group.name = 'structures';
    this.buildings = [];
    this.lootSpots = [];
    this.chestSpots = [];
    this.footprints = [];
    this.animated = [];
    this.metalSpots = [];
    this.vehicleSpots = [];
    this.gb = null;
    this.glass = null;
    this.rects = [];
  }

  // ---------- emit helpers ----------

  box(F, lx0, y0, lz0, lx1, y1, lz1, color, solid = true, owner = null) {
    const [x0, z0, x1, z1] = F.rect(lx0, lz0, lx1, lz1);
    this.gb.box(x0, y0, z0, x1, y1, z1, color);
    if (solid) return this.W.box(x0, y0, z0, x1, y1, z1, owner);
    return null;
  }

  glassPane(F, lx0, y0, lz0, lx1, y1, lz1) {
    const [x0, z0, x1, z1] = F.rect(lx0, lz0, lx1, lz1);
    this.glass.box(x0, y0, z0, x1, y1, z1, '#9fdcff');
  }

  surface(F, lx0, lz0, lx1, lz1, y0, y1, hLocal, thick) {
    const [x0, z0, x1, z1] = F.rect(lx0, lz0, lx1, lz1);
    return this.W.surface(x0, z0, x1, z1, y0, y1, (x, z) => {
      const [lx, lz] = F.tl(x, z);
      return hLocal(lx, lz);
    }, thick);
  }

  // Wall running along local X at local z = zc. Openings: {c, w, y0, y1} relative to floor y.
  wallX(F, xa, xb, zc, y, h, T, openings, color) {
    const ops = openings.slice().sort((a, b) => a.c - b.c);
    let cur = xa;
    for (const o of ops) {
      const oa = o.c - o.w / 2, ob = o.c + o.w / 2;
      if (oa > cur) this.box(F, cur, y, zc - T / 2, oa, y + h, zc + T / 2, color);
      if (o.y0 > 0.01) this.box(F, oa, y, zc - T / 2, ob, y + o.y0, zc + T / 2, color);
      if (o.y1 < h - 0.01) this.box(F, oa, y + o.y1, zc - T / 2, ob, y + h, zc + T / 2, color);
      if (o.glass) this.glassPane(F, oa, y + o.y0, zc - 0.03, ob, y + o.y1, zc + 0.03);
      cur = ob;
    }
    if (cur < xb) this.box(F, cur, y, zc - T / 2, xb, y + h, zc + T / 2, color);
  }

  wallZ(F, za, zb, xc, y, h, T, openings, color) {
    const ops = openings.slice().sort((a, b) => a.c - b.c);
    let cur = za;
    for (const o of ops) {
      const oa = o.c - o.w / 2, ob = o.c + o.w / 2;
      if (oa > cur) this.box(F, xc - T / 2, y, cur, xc + T / 2, y + h, oa, color);
      if (o.y0 > 0.01) this.box(F, xc - T / 2, y, oa, xc + T / 2, y + o.y0, ob, color);
      if (o.y1 < h - 0.01) this.box(F, xc - T / 2, y + o.y1, oa, xc + T / 2, y + h, ob, color);
      if (o.glass) this.glassPane(F, xc - 0.03, y + o.y0, oa, xc + 0.03, y + o.y1, ob);
      cur = ob;
    }
    if (cur < zb) this.box(F, xc - T / 2, y, cur, xc + T / 2, y + h, zb, color);
  }

  // Slab covering [x0,x1]x[z0,z1] minus an optional rectangular hole.
  slab(F, x0, z0, x1, z1, yTop, th, color, hole) {
    if (!hole) return this.box(F, x0, yTop - th, z0, x1, yTop, z1, color);
    const [hx0, hz0, hx1, hz1] = hole;
    if (hz0 > z0) this.box(F, x0, yTop - th, z0, x1, yTop, hz0, color);
    if (hz1 < z1) this.box(F, x0, yTop - th, hz1, x1, yTop, z1, color);
    if (hx0 > x0) this.box(F, x0, yTop - th, hz0, hx0, yTop, hz1, color);
    if (hx1 < x1) this.box(F, hx1, yTop - th, hz0, x1, yTop, hz1, color);
  }

  windowsFor(len, count, wW, y0, y1, glass) {
    const out = [];
    if (count <= 0) return out;
    for (let i = 0; i < count; i++) {
      const c = -len / 2 + (len * (i + 0.5)) / count;
      out.push({ c, w: wW, y0, y1, glass });
    }
    return out;
  }

  // ---------- site selection ----------

  groundStats(x0, z0, x1, z1) {
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i <= 2; i++) {
      for (let j = 0; j <= 2; j++) {
        const h = this.T.heightAt(lerp(x0, x1, i / 2), lerp(z0, z1, j / 2));
        mn = Math.min(mn, h);
        mx = Math.max(mx, h);
      }
    }
    return { min: mn, max: mx };
  }

  rectClear(x0, z0, x1, z1, gap, opts = {}) {
    for (const r of this.rects) {
      if (x0 - gap < r[2] && x1 + gap > r[0] && z0 - gap < r[3] && z1 + gap > r[1]) return false;
    }
    const pts = [];
    for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) pts.push([lerp(x0, x1, i / 3), lerp(z0, z1, j / 3)]);
    for (const [x, z] of pts) {
      if (!opts.ignoreRoads && this.T.distToRoad(x, z) < ROAD_HALF_WIDTH + 2.5) return false;
      if (this.T.distToRiver(x, z) < (opts.water ? 0 : 5)) return false;
      if (!opts.water && this.T.heightAt(x, z) < 1.0) return false;
      if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + (opts.water ? -10 : 4)) return false;
    }
    if (!opts.water) {
      const g = this.groundStats(x0, z0, x1, z1);
      if (g.max - g.min > (opts.maxSlope ?? 4.5)) return false;
    }
    return true;
  }

  // Find a free spot for a w x d footprint in a ring around the POI center.
  findSite(poi, w, d, rMin, rMax, opts = {}) {
    for (let tries = 0; tries < 80; tries++) {
      const a = this.rng() * Math.PI * 2;
      const rr = lerp(rMin, rMax, Math.sqrt(this.rng()));
      const cx = Math.round(poi.x + Math.cos(a) * rr), cz = Math.round(poi.z + Math.sin(a) * rr);
      let rot = opts.rot ?? Math.floor(this.rng() * 4);
      if (opts.faceCenter) {
        // Door is on local +Z; pick the rotation whose front faces the POI center.
        const dx = poi.x - cx, dz = poi.z - cz;
        if (Math.abs(dx) > Math.abs(dz)) rot = dx > 0 ? 1 : 3;
        else rot = dz > 0 ? 0 : 2;
      }
      const ww = rot % 2 ? d : w, dd = rot % 2 ? w : d;
      const x0 = cx - ww / 2, x1 = cx + ww / 2, z0 = cz - dd / 2, z1 = cz + dd / 2;
      if (!this.rectClear(x0, z0, x1, z1, opts.gap ?? 3, opts)) continue;
      this.rects.push([x0, z0, x1, z1]);
      return { x: cx, z: cz, rot };
    }
    return null;
  }

  reserve(x0, z0, x1, z1) {
    this.rects.push([x0, z0, x1, z1]);
  }

  // ---------- buildings ----------

  // Generic enterable building. Door on local +Z, stairs along local -Z wall.
  house(poi, o) {
    const rng = this.rng;
    const F = new Frame(o.x, o.z, o.rot || 0);
    const w = o.w, d = o.d, floors = o.floors || 1, fh = o.fh || 3.2, T = 0.3;
    const x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2;
    const [wx0, wz0, wx1, wz1] = F.rect(x0, z0, x1, z1);
    const stilts = o.stilts || 0;
    const g = this.groundStats(wx0, wz0, wx1, wz1);
    const base = (o.baseY ?? g.max + 0.15) + stilts;
    const wall = o.wall || rng.pick(WALLS);
    const roofC = o.roofColor || rng.pick(ROOFS);
    const trim = o.trim || '#6b5442';
    const b = {
      id: this.buildings.length, poi, x0: wx0, z0: wz0, x1: wx1, z1: wz1, baseY: base, floors, fh,
      frame: F, stairs: [], door: null, roofY: base + floors * fh, type: o.type || 'house',
    };
    this.buildings.push(b);
    this.footprints.push({ x0: wx0, z0: wz0, x1: wx1, z1: wz1 });
    // Foundation or stilts
    if (stilts > 0) {
      this.box(F, x0, base - 0.35, z0, x1, base, z1, FLOOR);
      for (const [px, pz] of [[x0 + 0.3, z0 + 0.3], [x1 - 0.3, z0 + 0.3], [x0 + 0.3, z1 - 0.3], [x1 - 0.3, z1 - 0.3]]) {
        this.box(F, px - 0.25, g.min - 2, pz - 0.25, px + 0.25, base - 0.35, pz + 0.25, DARK_WOOD);
      }
    } else {
      this.box(F, x0 - 0.2, g.min - 3, z0 - 0.2, x1 + 0.2, base, z1 + 0.2, o.foundation || FOUNDATION);
    }
    // Stairs lanes along the back wall
    const L = fh / 0.75;
    const laneW = 1.6;
    const sx = x0 + T + 0.6;
    const lanes = [
      [z0 + T, z0 + T + laneW],
      [z0 + T + laneW, z0 + T + 2 * laneW],
    ];
    const stairFloors = floors - 1 + (o.roofAccess ? 1 : 0);
    const doorW = o.doorW || 1.6, doorH = o.doorH || 2.4;
    const doorX = o.doorX ?? (w > 8 ? clamp((rng() - 0.5) * (w - 6), -w / 2 + 2, w / 2 - 2) : 0);
    for (let f = 0; f < floors; f++) {
      const y = base + f * fh;
      // floor slab (ground floor uses the foundation)
      if (f > 0) {
        const lane = lanes[(f - 1) % 2];
        this.slab(F, x0, z0, x1, z1, y, 0.25, FLOOR, [sx, lane[0], sx + L, lane[1]]);
      }
      const winY0 = o.winY0 ?? 1.0, winY1 = o.winY1 ?? Math.min(fh - 0.6, 2.2);
      const nWinX = o.windows === false ? 0 : Math.max(1, Math.floor(w / (o.winSpacing || 4)));
      const nWinZ = o.windows === false ? 0 : Math.max(1, Math.floor(d / (o.winSpacing || 4)));
      const winW = o.winW || 1.3;
      // front (+Z)
      let front = this.windowsFor(w, nWinX, winW, winY0, winY1, o.glass);
      if (f === 0) {
        front = front.filter((wd) => Math.abs(wd.c - doorX) > doorW / 2 + winW / 2 + 0.3);
        front.push({ c: doorX, w: doorW, y0: 0, y1: doorH });
        if (o.backDoor) front.push({ c: -doorX, w: doorW, y0: 0, y1: doorH });
      }
      this.wallX(F, x0, x1, z1 - T / 2, y, fh, T, front, wall);
      // back (-Z): stairs are here, so only high windows
      const backOps = f === 0 && o.backDoor ? [{ c: doorX, w: doorW, y0: 0, y1: doorH }] : this.windowsFor(w, nWinX, winW, Math.max(winY0, 1.6), winY1, o.glass);
      this.wallX(F, x0, x1, z0 + T / 2, y, fh, T, backOps, wall);
      this.wallZ(F, z0 + T, z1 - T, x0 + T / 2, y, fh, T, this.windowsFor(d - 2 * T, nWinZ, winW, winY0, winY1, o.glass).map((q) => ({ ...q, c: q.c })), wall);
      this.wallZ(F, z0 + T, z1 - T, x1 - T / 2, y, fh, T, this.windowsFor(d - 2 * T, nWinZ, winW, winY0, winY1, o.glass), wall);
      // trim band
      this.box(F, x0 - 0.05, y + fh - 0.25, z0 - 0.05, x1 + 0.05, y + fh, z0 + 0.02, trim, false);
      this.box(F, x0 - 0.05, y + fh - 0.25, z1 - 0.02, x1 + 0.05, y + fh, z1 + 0.05, trim, false);
      // stairs from this floor up
      if (f < stairFloors) {
        const lane = lanes[f % 2];
        const up = f % 2 === 0; // rises toward +X on even floors
        const steps = 9;
        for (let s = 0; s < steps; s++) {
          const xa = sx + (L * s) / steps, xb = sx + (L * (s + 1)) / steps;
          const sh = up ? (fh * (s + 1)) / steps : (fh * (steps - s)) / steps;
          this.box(F, xa, y, lane[0], xb, y + sh, lane[1], s % 2 ? '#8b6b48' : '#7d5f3f', false);
        }
        this.surface(F, sx, lane[0], sx + L, lane[1], y, y + fh, (lx) => {
          const t = clamp((lx - sx) / L, 0, 1);
          return y + (up ? t : 1 - t) * fh;
        }, fh);
        const lzc = (lane[0] + lane[1]) / 2;
        const lowX = up ? sx - 0.7 : sx + L + 0.7, highX = up ? sx + L + 0.7 : sx - 0.7;
        const [bx, bz] = F.tw(lowX, lzc), [tx, tz] = F.tw(highX, lzc);
        b.stairs.push({ bottom: [bx, y, bz], top: [tx, y + fh, tz] });
      }
      // loot spots on this floor
      const spots = [];
      const nLoot = o.lootPerFloor ?? 1;
      for (let i = 0; i < nLoot * 4 && spots.length < nLoot; i++) {
        const lx = lerp(x0 + 1.2, x1 - 1.2, rng());
        const lz = lerp(z0 + T + 2 * laneW + 0.8, z1 - 1.2, rng());
        if (lz > z1 - 2.2 && Math.abs(lx - doorX) < 1.5) continue;
        if (spots.some(([ax, az]) => Math.hypot(ax - lx, az - lz) < 1.8)) continue;
        spots.push([lx, lz]);
      }
      for (const [lx, lz] of spots) {
        const [wx, wz] = F.tw(lx, lz);
        this.lootSpots.push({ x: wx, y: y + 0.05, z: wz, poi, building: b, floor: f });
      }
    }
    // chest: against the +X side wall on a random floor
    if (o.chest !== false) {
      const f = Math.floor(rng() * floors);
      const y = base + f * fh;
      const lz = lerp(z0 + T + 2 * laneW + 0.6, z1 - 1.6, rng());
      const [cx, cz] = F.tw(x1 - T - 0.55, lz);
      this.chestSpots.push({ x: cx, y, z: cz, yaw: F.yaw + Math.PI / 2, poi, building: b, floor: f });
    }
    // furniture: a low cabinet against the -X wall on each floor (out of the walking lanes)
    if (o.furniture !== false && d > 7) {
      for (let f = 0; f < floors; f++) {
        const y = base + f * fh;
        const lz = lerp(z0 + T + 2 * laneW + 0.6, z1 - 2, 0.5);
        this.box(F, x0 + T, y, lz - 0.9, x0 + T + 0.6, y + 0.9, lz + 0.9, rng.pick(['#7a5236', '#5b6b7d', '#8a4f4f', '#4f7a5b']));
      }
    }
    // roof
    const top = base + floors * fh;
    const hole = o.roofAccess ? [sx, lanes[(floors - 1) % 2][0], sx + L, lanes[(floors - 1) % 2][1]] : null;
    const roofType = o.roof || 'gable';
    this.slab(F, x0, z0, x1, z1, top + 0.25, 0.3, roofType === 'flat' ? '#7c7a76' : FLOOR, hole);
    if (roofType === 'flat') {
      const ph = 0.9;
      this.box(F, x0, top + 0.25, z0, x1, top + 0.25 + ph, z0 + 0.25, wall);
      this.box(F, x0, top + 0.25, z1 - 0.25, x1, top + 0.25 + ph, z1, wall);
      this.box(F, x0, top + 0.25, z0 + 0.25, x0 + 0.25, top + 0.25 + ph, z1 - 0.25, wall);
      this.box(F, x1 - 0.25, top + 0.25, z0 + 0.25, x1, top + 0.25 + ph, z1 - 0.25, wall);
      b.roofY = top + 0.25;
      if (o.roofAccess) {
        const [rx, rz] = F.tw(lerp(x0, x1, 0.7), lerp(z0, z1, 0.65));
        this.lootSpots.push({ x: rx, y: top + 0.3, z: rz, poi, building: b, floor: floors });
      }
    } else if (roofType === 'gable' || roofType === 'steep') {
      const ov = 0.5;
      const alongX = w >= d;
      const span = alongX ? d : w;
      const rh = span * (roofType === 'steep' ? 0.55 : 0.32);
      const ry = top + 0.25;
      const [gx0, gz0, gx1, gz1] = F.rect(x0 - ov, z0 - ov, x1 + ov, z1 + ov);
      // Ridge axis in world space: local X maps to world X for rot 0/2, to world Z for rot 1/3.
      const worldAxis = (alongX ? F.rot % 2 === 0 : F.rot % 2 === 1) ? 'x' : 'z';
      this.gb.gable(gx0, gz0, gx1, gz1, ry, rh, worldAxis, roofC, wall);
      const half = span / 2 + ov;
      this.surface(F, x0 - ov, z0 - ov, x1 + ov, z1 + ov, ry, ry + rh, (lx, lz) => {
        const off = alongX ? Math.abs(lz) : Math.abs(lx);
        return ry + rh * clamp(1 - off / half, 0, 1);
      }, 0.4);
      b.roofY = ry + rh;
    } else if (roofType === 'pyramid') {
      const ov = 0.6;
      const ry = top + 0.25;
      const rh = Math.min(w, d) * 0.45;
      const [gx0, gz0, gx1, gz1] = F.rect(x0 - ov, z0 - ov, x1 + ov, z1 + ov);
      this.gb.pyramid(gx0, gz0, gx1, gz1, ry, rh, roofC);
      const hw = w / 2 + ov, hd = d / 2 + ov;
      this.surface(F, x0 - ov, z0 - ov, x1 + ov, z1 + ov, ry, ry + rh, (lx, lz) => ry + rh * clamp(1 - Math.max(Math.abs(lx) / hw, Math.abs(lz) / hd), 0, 1), 0.4);
      b.roofY = ry + rh;
    }
    // Door record (and an exterior ramp for raised buildings)
    const [dox, doz] = F.tw(doorX, z1 + 1.4), [dix, diz] = F.tw(doorX, z1 - 1.6);
    if (stilts > 0) {
      const run = Math.max(3, stilts / 0.6);
      const gy = this.T.heightAt(...F.tw(doorX, z1 + run));
      const rise = base - gy;
      this.surface(F, doorX - 0.9, z1, doorX + 0.9, z1 + run, gy, base, (lx, lz) => base - clamp((lz - z1) / run, 0, 1) * rise, 0.4);
      const steps = Math.max(4, Math.round(run / 0.8));
      for (let s = 0; s < steps; s++) {
        const za = z1 + (run * s) / steps, zb = z1 + (run * (s + 1)) / steps;
        this.box(F, doorX - 0.9, gy - 0.5, za, doorX + 0.9, base - (rise * s) / steps, zb, s % 2 ? WOOD : DARK_WOOD, false);
      }
      const [ox2, oz2] = F.tw(doorX, z1 + run + 1.2);
      b.door = { out: [ox2, gy, oz2], mid: [dox, base, doz], in: [dix, base, diz] };
    } else {
      b.door = { out: [dox, base, doz], in: [dix, base, diz] };
      // doorstep
      this.box(F, doorX - 1, g.min - 1, z1, doorX + 1, base - 0.02, z1 + 1.1, FOUNDATION);
    }
    return b;
  }

  // Simple solid prop with collider (crates, containers, machinery).
  solid(x, z, w, d, h, color, yBase = null) {
    const y = yBase ?? this.T.heightAt(x, z) - 0.5;
    this.gb.box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2, color);
    return this.W.box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2);
  }

  container(x, z, alongX, color, stack = 1) {
    const w = alongX ? 6 : 2.5, d = alongX ? 2.5 : 6;
    let y = this.T.heightAt(x, z) - 0.2;
    for (let s = 0; s < stack; s++) {
      this.gb.box(x - w / 2, y, z - d / 2, x + w / 2, y + 2.6, z + d / 2, s ? this.rng.pick(['#c4553b', '#3b7bc4', '#3ba06a', '#c9a23a']) : color);
      this.W.box(x - w / 2, y, z - d / 2, x + w / 2, y + 2.6, z + d / 2);
      y += 2.6;
    }
    this.reserve(x - w / 2, z - d / 2, x + w / 2, z + d / 2);
  }

  cylinderTower(x, z, r0, r1, h, color, seg = 12, yBase = null, capColor = null) {
    const y = yBase ?? this.T.heightAt(x, z) - 1;
    this.gb.cylinder(x, y, z, r0, r1, h, seg, color);
    if (capColor) this.gb.sphere(x, y + h, z, r1 * 1.02, seg, 6, capColor, 0.6, true);
    const ri = Math.max(r0, r1) * 0.78;
    this.W.box(x - ri, y, z - ri, x + ri, y + h, z + ri);
    this.reserve(x - r0, z - r0, x + r0, z + r0);
    this.footprints.push({ x0: x - r0, z0: z - r0, x1: x + r0, z1: z + r0 });
    return y + h;
  }

  outdoorLoot(poi, x, z, n = 1) {
    for (let i = 0; i < n; i++) {
      const lx = x + (this.rng() - 0.5) * 6, lz = z + (this.rng() - 0.5) * 6;
      const y = this.W.groundAt(lx, lz, 200);
      if (y < 0.3) continue;
      this.lootSpots.push({ x: lx, y: y + 0.05, z: lz, poi, building: null, floor: 0 });
    }
  }

  // ---------- POI generators ----------

  generate() {
    for (const poi of POIS) {
      this.gb = new GeoBuilder(this.rng);
      this.glass = new GeoBuilder(this.rng);
      this.glass.jitter = 0;
      const fn = this['gen_' + poi.type];
      if (fn) fn.call(this, poi);
      this.flush(poi.id);
    }
    // Lone houses around the island for low loot between named areas.
    this.gb = new GeoBuilder(this.rng);
    this.glass = new GeoBuilder(this.rng);
    const lone = { id: 'wild', name: 'Wilds', loot: 'low', x: 0, z: 0, r: 0, type: 'wild' };
    let placed = 0;
    for (let tries = 0; tries < 400 && placed < 14; tries++) {
      const x = (this.rng() - 0.5) * 820, z = (this.rng() - 0.5) * 820;
      if (POIS.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + 40)) continue;
      if (this.T.heightAt(x, z) < 2 || this.T.heightAt(x, z) > 40) continue;
      const near = this.T.distToRoad(x, z);
      if (near < 9) continue;
      const w = 8, d = 7;
      if (!this.rectClear(x - w / 2, z - d / 2, x + w / 2, z + d / 2, 30, { maxSlope: 3 })) continue;
      this.reserve(x - w / 2, z - d / 2, x + w / 2, z + d / 2);
      const biome = this.T.biomeAt(x, z);
      const roof = biome === 'desert' ? 'flat' : biome === 'snow' ? 'steep' : 'gable';
      this.house(lone, { x, z, w, d, rot: this.rng.int(0, 3), floors: this.rng.chance(0.4) ? 2 : 1, roof, lootPerFloor: 1, wall: biome === 'desert' ? '#e0b98a' : undefined });
      placed++;
    }
    this.flush('wild');
  }

  flush(name) {
    if (this.gb.vertexCount > 0) {
      const mesh = new THREE.Mesh(this.gb.build(), worldMaterial());
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = 'poi-' + name;
      this.group.add(mesh);
    }
    if (this.glass && this.glass.vertexCount > 0) {
      const mat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false });
      const mesh = new THREE.Mesh(this.glass.build(), mat);
      mesh.name = 'glass-' + name;
      mesh.renderOrder = 2;
      this.group.add(mesh);
    }
  }

  lootN(poi, perHigh = 3, perMed = 2, perLow = 1) {
    return poi.loot === 'high' ? perHigh : poi.loot === 'medium' ? perMed : perLow;
  }

  gen_city(poi) {
    const rng = this.rng;
    // Landmark spire
    const s = this.findSite(poi, 12, 12, 6, 26, { gap: 2 });
    if (s) {
      const y = this.T.heightAt(s.x, s.z) - 0.5;
      const F = new Frame(s.x, s.z, 0);
      const parts = [[11, 26, '#b9c3cf'], [8, 22, '#9fb0c4'], [5.5, 18, '#c8d2de'], [3.4, 10, '#e2e8ef']];
      let yy = y;
      for (const [sz, h, c] of parts) {
        this.box(F, -sz / 2, yy, -sz / 2, sz / 2, yy + h, sz / 2, c);
        for (let k = 2; k < h; k += 3) this.box(F, -sz / 2 - 0.05, yy + k, -sz / 2 - 0.05, sz / 2 + 0.05, yy + k + 0.35, sz / 2 + 0.05, '#5f88b8', false);
        yy += h;
      }
      this.gb.cylinder(s.x, yy, s.z, 0.25, 0.08, 14, 6, '#d0d0d0');
      this.footprints.push({ x0: s.x - 5.5, z0: s.z - 5.5, x1: s.x + 5.5, z1: s.z + 5.5 });
      this.animated.push({ kind: 'beacon', x: s.x, y: yy + 14.3, z: s.z, color: 0xff3030 });
    }
    for (let i = 0; i < 9; i++) {
      const w = rng.pick([12, 14, 16]), d = rng.pick([12, 14]);
      const site = this.findSite(poi, w, d, 18, poi.r - 6, { faceCenter: false, gap: 3 });
      if (!site) continue;
      const floors = rng.int(3, 6);
      this.house(poi, {
        ...site, w, d, floors, fh: 3.2, roof: 'flat', roofAccess: true, glass: true, winW: 2.4, winSpacing: 3.6,
        wall: rng.pick(TOWER_WALLS), lootPerFloor: 2, type: 'tower',
      });
    }
    for (let i = 0; i < 5; i++) {
      const site = this.findSite(poi, 14, 9, 25, poi.r + 4, { gap: 3 });
      if (!site) continue;
      const b = this.house(poi, { ...site, w: 14, d: 9, floors: 1, fh: 3.6, roof: 'flat', glass: true, winW: 3, wall: rng.pick(WALLS), lootPerFloor: 2, type: 'shop' });
      // awning
      const F = b.frame;
      this.box(F, -6, b.baseY + 2.6, 4.5, 6, b.baseY + 2.8, 6.2, rng.pick(['#d24b4b', '#3c8dd2', '#e0a030', '#3fae6a']), false);
    }
    for (let i = 0; i < 6; i++) {
      const a = rng() * Math.PI * 2;
      const r = 20 + rng() * 40;
      this.metalSpots.push({ x: poi.x + Math.cos(a) * r, z: poi.z + Math.sin(a) * r, kind: 'car' });
    }
  }

  gen_castle(poi) {
    const rng = this.rng;
    const half = 30, H = 7, th = 2;
    const cx = poi.x, cz = poi.z;
    const gy = poi.ground - 0.2;
    const F = new Frame(cx, cz, 0);
    // Curtain walls run between the corner towers, which sit centered on the corners.
    const tw = 4.5;
    const sides = [
      { axis: 'x', fixed: -half, from: -half + tw, to: half - tw },
      { axis: 'x', fixed: half, from: -half + tw, to: half - tw },
      { axis: 'z', fixed: -half, from: -half + tw, to: half - tw },
      { axis: 'z', fixed: half, from: -half + tw, to: half - tw },
    ];
    for (const s of sides) {
      // gates where roads cross
      const ops = [];
      for (let t = s.from + 6; t < s.to - 6; t += 1) {
        const [wx, wz] = s.axis === 'x' ? F.tw(t, s.fixed) : F.tw(s.fixed, t);
        if (this.T.distToRoad(wx, wz) < ROAD_HALF_WIDTH) {
          if (!ops.some((o) => Math.abs(o.c - t) < 10)) ops.push({ c: t, w: 8, y0: 0, y1: 5 });
        }
      }
      if (s.axis === 'x' && s.fixed === -half && ops.length === 0) ops.push({ c: 0, w: 8, y0: 0, y1: 5 });
      if (s.axis === 'x') this.wallX(F, s.from, s.to, s.fixed, gy, H, th, ops, STONE);
      else this.wallZ(F, s.from, s.to, s.fixed, gy, H, th, ops, STONE);
      // crenellations
      for (let t = s.from; t < s.to; t += 3) {
        if (ops.some((o) => Math.abs(o.c - t - 0.75) < o.w / 2)) continue;
        if (s.axis === 'x') this.box(F, t, gy + H, s.fixed - th / 2, t + 1.5, gy + H + 1, s.fixed + th / 2, '#8c877e');
        else this.box(F, s.fixed - th / 2, gy + H, t, s.fixed + th / 2, gy + H + 1, t + 1.5, '#8c877e');
      }
    }
    this.reserve(cx - half - 2, cz - half - 2, cx + half + 2, cz + half + 2);
    this.footprints.push({ x0: cx - half, z0: cz - half, x1: cx + half, z1: cz - half + 2 });
    this.footprints.push({ x0: cx - half, z0: cz + half - 2, x1: cx + half, z1: cz + half });
    this.footprints.push({ x0: cx - half, z0: cz - half, x1: cx - half + 2, z1: cz + half });
    this.footprints.push({ x0: cx + half - 2, z0: cz - half, x1: cx + half, z1: cz + half });
    // Corner towers (enterable, roof access)
    const corners = [[-1, -1, 0], [1, -1, 0], [-1, 1, 2], [1, 1, 2]];
    // Keep the ring reserved for other POIs only; the courtyard is filled by hand below.
    this.rects = this.rects.filter((r) => !(r[0] === cx - half - 2 && r[1] === cz - half - 2));
    for (const [sx, sz, rot] of corners) {
      const tx = cx + sx * half, tz = cz + sz * half;
      this.house(poi, {
        x: tx, z: tz, rot, w: 9, d: 9, floors: 3, fh: 3.6, roof: 'flat', roofAccess: true,
        wall: '#a39d93', baseY: gy + 0.1, windows: true, winW: 0.8, lootPerFloor: 1, chest: rng.chance(0.5), type: 'tower', furniture: false, doorX: (rot === 0 ? -sx : sx) * 2.5,
      });
      this.reserve(tx - 5, tz - 5, tx + 5, tz + 5);
    }
    // Keep
    this.house(poi, {
      x: cx, z: cz - 4, rot: 0, w: 18, d: 16, floors: 3, fh: 3.6, roof: 'flat', roofAccess: true, wall: '#b3ada2', baseY: gy + 0.2,
      winW: 1, lootPerFloor: 3, type: 'keep', doorX: 0,
    });
    this.reserve(cx - 9, cz - 12, cx + 9, cz + 4);
    // Stables / small houses in the courtyard
    for (let i = 0; i < 3; i++) {
      const site = this.findSite(poi, 8, 6, 12, 22, { gap: 2, ignoreRoads: true, faceCenter: true });
      if (site) this.house(poi, { ...site, w: 8, d: 6, floors: 1, roof: 'gable', wall: '#c9b79a', roofColor: '#7a3b2f', lootPerFloor: 2, baseY: gy + 0.15 });
    }
    // Flags (landmark color)
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const fx = cx + sx * half + 2, fz = cz + sz * half + 2;
      const top = gy + 0.1 + 3 * 3.6 + 1.2;
      this.gb.cylinder(fx, top, fz, 0.1, 0.1, 6, 5, '#d0d0d0');
      this.gb.box(fx, top + 4.4, fz - 0.05, fx + 2.4, top + 5.8, fz + 0.05, '#d4372f');
    }
  }

  gen_factory(poi) {
    const rng = this.rng;
    for (let i = 0; i < 3; i++) {
      const site = this.findSite(poi, 24, 16, 10, poi.r - 12, { gap: 5 });
      if (!site) continue;
      const b = this.house(poi, {
        ...site, w: 24, d: 16, floors: 1, fh: 7, roof: 'flat', wall: rng.pick(['#9a8f80', '#7f8a92', '#a07a5a']), doorW: 4.5, doorH: 5,
        backDoor: true, winY0: 4.4, winY1: 6.2, winW: 2.4, winSpacing: 5, lootPerFloor: 4, type: 'warehouse', furniture: false,
      });
      // Crates inside
      const F = b.frame;
      for (let k = 0; k < 3; k++) {
        const lx = -8 + k * 6 + rng() * 2, lz = 1 + rng() * 3;
        this.box(F, lx - 1, b.baseY, lz - 1, lx + 1, b.baseY + 1.6, lz + 1, '#8a6d45');
      }
    }
    // Two-floor office
    const off = this.findSite(poi, 12, 10, 10, poi.r - 6, { gap: 4 });
    if (off) this.house(poi, { ...off, w: 12, d: 10, floors: 2, roof: 'flat', roofAccess: true, wall: '#c7c1b4', lootPerFloor: 2 });
    // Chimneys
    for (let i = 0; i < 2; i++) {
      const site = this.findSite(poi, 4, 4, 5, poi.r - 8, { gap: 2 });
      if (site) this.cylinderTower(site.x, site.z, 1.8, 1.4, 30, '#8d4b3b', 10);
      if (site) this.animated.push({ kind: 'smoke', x: site.x, y: this.T.heightAt(site.x, site.z) + 29, z: site.z });
    }
    // Containers
    for (let i = 0; i < 8; i++) {
      const site = this.findSite(poi, 7, 7, 12, poi.r, { gap: 2 });
      if (!site) continue;
      this.rects.pop();
      this.container(site.x, site.z, rng.chance(0.5), rng.pick(['#c4553b', '#3b7bc4', '#3ba06a', '#c9a23a']), rng.chance(0.35) ? 2 : 1);
      this.outdoorLoot(poi, site.x + 4, site.z + 4, rng.chance(0.5) ? 1 : 0);
    }
    for (let i = 0; i < 6; i++) {
      const a = rng() * Math.PI * 2;
      this.metalSpots.push({ x: poi.x + Math.cos(a) * rng.range(10, poi.r), z: poi.z + Math.sin(a) * rng.range(10, poi.r), kind: rng.chance(0.5) ? 'barrels' : 'car' });
    }
  }

  gen_power(poi) {
    for (let i = 0; i < 2; i++) {
      const site = this.findSite(poi, 26, 26, 14, poi.r - 6, { gap: 4 });
      if (!site) continue;
      const y = this.T.heightAt(site.x, site.z) - 1;
      this.gb.cylinder(site.x, y, site.z, 12, 8.5, 18, 18, '#cfcac0', false);
      this.gb.cylinder(site.x, y + 18, site.z, 8.5, 9.5, 10, 18, '#d8d3c9', false);
      this.gb.cylinder(site.x, y + 1, site.z, 11.6, 8.1, 17, 18, '#a9a49b', false);
      this.W.box(site.x - 8.2, y, site.z - 8.2, site.x + 8.2, y + 28, site.z + 8.2);
      this.footprints.push({ x0: site.x - 11, z0: site.z - 11, x1: site.x + 11, z1: site.z + 11 });
      this.animated.push({ kind: 'steam', x: site.x, y: y + 28, z: site.z });
      this.outdoorLoot(poi, site.x, site.z, 2);
    }
    const ctl = this.findSite(poi, 14, 10, 6, poi.r - 6, { gap: 4 });
    if (ctl) this.house(poi, { ...ctl, w: 14, d: 10, floors: 2, roof: 'flat', roofAccess: true, wall: '#b9c0c4', glass: true, winW: 2, lootPerFloor: 2 });
    const wh = this.findSite(poi, 18, 12, 6, poi.r - 4, { gap: 4 });
    if (wh) this.house(poi, { ...wh, w: 18, d: 12, floors: 1, fh: 5.5, roof: 'flat', wall: '#8f9aa1', doorW: 3.5, doorH: 4, winY0: 3.4, winY1: 4.8, lootPerFloor: 3, furniture: false });
    for (let i = 0; i < 6; i++) {
      const site = this.findSite(poi, 4, 3, 8, poi.r, { gap: 1.5 });
      if (!site) continue;
      this.solid(site.x, site.z, 3.2, 2.2, 2.6, '#6f7a80');
      this.gb.box(site.x - 1.4, this.T.heightAt(site.x, site.z) + 2.1, site.z - 0.2, site.x + 1.4, this.T.heightAt(site.x, site.z) + 2.4, site.z + 0.2, '#e0c13a');
    }
    // Pylons
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const px = poi.x + Math.cos(a) * (poi.r + 8), pz = poi.z + Math.sin(a) * (poi.r + 8);
      if (this.T.heightAt(px, pz) < 1) continue;
      const y = this.T.heightAt(px, pz) - 0.5;
      this.gb.box(px - 1.2, y, pz - 1.2, px + 1.2, y + 1, pz + 1.2, '#888');
      this.gb.cylinder(px, y, pz, 1.0, 0.25, 22, 4, '#9aa3a8');
      this.gb.box(px - 4, y + 18, pz - 0.2, px + 4, y + 18.4, pz + 0.2, '#9aa3a8');
      this.W.box(px - 0.8, y, pz - 0.8, px + 0.8, y + 22, pz + 0.8);
    }
  }

  gen_snow(poi) {
    const rng = this.rng;
    const lodge = this.findSite(poi, 16, 11, 0, 18, { gap: 4, maxSlope: 6 });
    if (lodge) this.house(poi, { ...lodge, w: 16, d: 11, floors: 2, roof: 'steep', wall: '#8b5e3c', roofColor: '#e9eef3', trim: '#4f3423', lootPerFloor: 2 });
    for (let i = 0; i < 6; i++) {
      const site = this.findSite(poi, 8, 7, 18, poi.r, { gap: 4, maxSlope: 6, faceCenter: true });
      if (site) this.house(poi, { ...site, w: 8, d: 7, floors: rng.chance(0.3) ? 2 : 1, roof: 'steep', wall: rng.pick(['#7a5236', '#8e6a46', '#a3542f']), roofColor: '#eef3f8', lootPerFloor: 1 });
    }
    // Ski lift-ish poles
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const px = lerp(poi.x + 20, 300, t), pz = lerp(poi.z - 10, -150, t);
      const y = this.T.heightAt(px, pz) - 0.5;
      this.gb.cylinder(px, y, pz, 0.35, 0.3, 9, 6, '#4a4f55');
      this.gb.box(px - 1.6, y + 8.5, pz - 0.2, px + 1.6, y + 8.9, pz + 0.2, '#4a4f55');
    }
  }

  gen_observatory(poi) {
    const gy = poi.ground;
    const main = { x: poi.x, z: poi.z, rot: 0 };
    this.reserve(poi.x - 9, poi.z - 9, poi.x + 9, poi.z + 9);
    const b = this.house(poi, { ...main, w: 16, d: 16, floors: 2, fh: 3.6, roof: 'flat', roofAccess: true, wall: '#e6e9ee', glass: true, winW: 1.6, lootPerFloor: 3, baseY: gy + 0.2 });
    const top = b.roofY;
    // Dome sits on the back half of the roof; the stair opening stays clear on the front.
    const dx = poi.x + 3, dz = poi.z + 2;
    this.gb.sphere(dx, top, dz, 5, 16, 10, '#c9d1da', 1, true);
    this.gb.box(dx - 0.6, top + 2, dz - 6.5, dx + 0.6, top + 5.2, dz - 4, '#3a4652');
    this.gb.cylinder(dx, top + 3.5, dz - 3, 0.8, 0.8, 5, 8, '#5d6a78');
    this.W.box(dx - 3.6, top, dz - 3.6, dx + 3.6, top + 4.2, dz + 3.6);
    this.animated.push({ kind: 'beacon', x: dx, y: top + 5.4, z: dz, color: 0x66ccff });
    for (let i = 0; i < 2; i++) {
      const site = this.findSite(poi, 9, 7, 16, poi.r, { gap: 3, maxSlope: 6, faceCenter: true });
      if (site) this.house(poi, { ...site, w: 9, d: 7, floors: 1, roof: 'flat', wall: '#d3d9e0', lootPerFloor: 2 });
    }
    // Radio dish
    const ds = this.findSite(poi, 6, 6, 14, poi.r + 6, { gap: 2, maxSlope: 7 });
    if (ds) {
      const y = this.T.heightAt(ds.x, ds.z) - 0.3;
      this.gb.cylinder(ds.x, y, ds.z, 0.6, 0.4, 5, 6, '#9aa3ad');
      this.gb.sphere(ds.x, y + 6.5, ds.z, 3, 12, 8, '#e8edf2', 0.35, false);
      this.W.box(ds.x - 0.6, y, ds.z - 0.6, ds.x + 0.6, y + 5, ds.z + 0.6);
    }
  }

  gen_desert(poi) {
    const rng = this.rng;
    for (let i = 0; i < 8; i++) {
      const w = rng.pick([8, 10, 12]), d = rng.pick([7, 8, 10]);
      const site = this.findSite(poi, w, d, 6, poi.r, { gap: 4 });
      if (!site) continue;
      this.house(poi, {
        ...site, w, d, floors: rng.chance(0.4) ? 2 : 1, roof: 'flat', roofAccess: rng.chance(0.5),
        wall: rng.pick(['#e0b98a', '#d9a066', '#e8c9a0', '#c98b5a']), trim: '#8a5a32', lootPerFloor: 2,
      });
    }
    const wt = this.findSite(poi, 6, 6, 10, poi.r, { gap: 3 });
    if (wt) this.waterTower(wt.x, wt.z);
    for (let i = 0; i < 3; i++) {
      const a = rng() * Math.PI * 2;
      this.metalSpots.push({ x: poi.x + Math.cos(a) * rng.range(15, poi.r), z: poi.z + Math.sin(a) * rng.range(15, poi.r), kind: 'car' });
    }
  }

  waterTower(x, z) {
    const y = this.T.heightAt(x, z) - 0.3;
    for (const [ox, oz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
      this.gb.box(x + ox - 0.2, y, z + oz - 0.2, x + ox + 0.2, y + 11, z + oz + 0.2, '#6b5a48');
      this.W.box(x + ox - 0.2, y, z + oz - 0.2, x + ox + 0.2, y + 11, z + oz + 0.2);
    }
    this.gb.cylinder(x, y + 11, z, 3.2, 3.2, 5, 12, '#a87e55');
    this.gb.cone(x, y + 16, z, 3.4, 1.6, 12, '#7a5a3a');
    this.W.box(x - 2.6, y + 11, z - 2.6, x + 2.6, y + 16, z + 2.6);
    this.footprints.push({ x0: x - 3, z0: z - 3, x1: x + 3, z1: z + 3 });
  }

  gen_swamp(poi) {
    const rng = this.rng;
    const houses = [];
    for (let i = 0; i < 7; i++) {
      const site = this.findSite(poi, 9, 8, i === 0 ? 0 : 14, poi.r, { gap: 5, water: true, faceCenter: true });
      if (!site) continue;
      const g = this.groundStats(site.x - 5, site.z - 5, site.x + 5, site.z + 5);
      const baseY = Math.max(g.max, 0.5) + 0.2;
      const b = this.house(poi, {
        ...site, w: i === 0 ? 12 : 9, d: i === 0 ? 10 : 8, floors: i === 0 ? 2 : 1, stilts: 2.6, baseY,
        roof: 'gable', wall: rng.pick(['#6f7d5a', '#7d6a50', '#5f6f62', '#8a7a5a']), roofColor: rng.pick(['#4a4038', '#3e4a3a']),
        lootPerFloor: 2,
      });
      houses.push(b);
    }
    // Boardwalks between stilt houses
    for (let i = 1; i < houses.length; i++) {
      const a = houses[i].door.out, b = houses[0].door.out;
      this.boardwalk(a[0], a[2], b[0], b[2]);
    }
    // Dead trees and fallen logs are handled by props (swamp biome).
  }

  boardwalk(ax, az, bx, bz) {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.ceil(len / 3);
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const x0 = lerp(ax, bx, t0), z0 = lerp(az, bz, t0), x1 = lerp(ax, bx, t1), z1 = lerp(az, bz, t1);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const h = Math.max(this.T.heightAt(mx, mz), 0) + 0.7;
      const gx0 = Math.min(x0, x1) - 1, gx1 = Math.max(x0, x1) + 1, gz0 = Math.min(z0, z1) - 1, gz1 = Math.max(z0, z1) + 1;
      if (this.T.heightAt(mx, mz) > 0.6) continue;
      this.gb.box(gx0, h - 0.2, gz0, gx1, h, gz1, i % 2 ? WOOD : '#7a5b3d');
      this.gb.box(mx - 0.15, h - 2.5, mz - 0.15, mx + 0.15, h - 0.2, mz + 0.15, DARK_WOOD);
      this.W.box(gx0, h - 0.2, gz0, gx1, h, gz1);
    }
  }

  gen_farm(poi) {
    const rng = this.rng;
    const barn = this.findSite(poi, 16, 12, 0, 22, { gap: 6 });
    if (barn) {
      this.house(poi, { ...barn, w: 16, d: 12, floors: 1, fh: 5.5, roof: 'gable', wall: '#b03a2e', roofColor: '#5a3a2a', trim: '#f0e6d8', doorW: 4, doorH: 4.2, backDoor: true, winY0: 3.2, winY1: 4.6, lootPerFloor: 3, type: 'barn', furniture: false });
    }
    const fh = this.findSite(poi, 11, 9, 14, poi.r - 6, { gap: 6, faceCenter: true });
    if (fh) this.house(poi, { ...fh, w: 11, d: 9, floors: 2, roof: 'gable', wall: '#f2efe6', roofColor: '#3e5c7a', lootPerFloor: 2 });
    const sh = this.findSite(poi, 8, 7, 18, poi.r, { gap: 5, faceCenter: true });
    if (sh) this.house(poi, { ...sh, w: 8, d: 7, floors: 1, roof: 'gable', wall: '#c9b48a', lootPerFloor: 1 });
    for (let i = 0; i < 2; i++) {
      const s = this.findSite(poi, 7, 7, 10, poi.r - 10, { gap: 3 });
      if (s) this.cylinderTower(s.x, s.z, 3.2, 3.2, 13, '#d9dde0', 14, null, '#b9c0c6');
    }
    // Windmill landmark
    const wm = this.findSite(poi, 8, 8, 20, poi.r + 10, { gap: 4 });
    if (wm) {
      const y = this.T.heightAt(wm.x, wm.z) - 0.5;
      this.gb.cylinder(wm.x, y, wm.z, 3.4, 1.8, 20, 8, '#efe7d6');
      this.gb.cone(wm.x, y + 20, wm.z, 2.4, 3, 8, '#8a3b2f');
      this.W.box(wm.x - 2.4, y, wm.z - 2.4, wm.x + 2.4, y + 20, wm.z + 2.4);
      this.footprints.push({ x0: wm.x - 3, z0: wm.z - 3, x1: wm.x + 3, z1: wm.z + 3 });
      this.animated.push({ kind: 'windmill', x: wm.x, y: y + 18, z: wm.z + 2.6 });
      this.outdoorLoot(poi, wm.x + 4, wm.z + 4, 1);
    }
    // Hay bales
    for (let i = 0; i < 8; i++) {
      const a = rng() * Math.PI * 2, r = rng.range(15, poi.r + 20);
      const x = poi.x + Math.cos(a) * r, z = poi.z + Math.sin(a) * r;
      if (this.T.distToRoad(x, z) < 6 || this.T.heightAt(x, z) < 1) continue;
      const y = this.T.heightAt(x, z) - 0.2;
      this.gb.cylinder(x, y, z, 1, 1, 1.4, 10, '#d9b84a');
      this.W.box(x - 0.8, y, z - 0.8, x + 0.8, y + 1.4, z + 0.8);
    }
    for (let i = 0; i < 2; i++) this.metalSpots.push({ x: poi.x + rng.range(-30, 30), z: poi.z + rng.range(-30, 30), kind: 'tractor' });
  }

  gen_lake(poi) {
    const rng = this.rng;
    for (let i = 0; i < 9; i++) {
      const w = rng.pick([9, 10, 12]), d = rng.pick([8, 9]);
      const site = this.findSite(poi, w, d, LAKE.r + 9, poi.r, { gap: 4, faceCenter: true });
      if (!site) continue;
      this.house(poi, { ...site, w, d, floors: rng.chance(0.5) ? 2 : 1, roof: 'gable', lootPerFloor: 2 });
    }
    // Docks reaching into the lake
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.9;
      const sx = LAKE.x + Math.cos(a) * (LAKE.r + 2), sz = LAKE.z + Math.sin(a) * (LAKE.r + 2);
      const ex = LAKE.x + Math.cos(a) * (LAKE.r - 14), ez = LAKE.z + Math.sin(a) * (LAKE.r - 14);
      if (this.T.distToRiver(sx, sz) < 6) continue;
      this.dock(sx, sz, ex, ez, 2.2);
      this.outdoorLoot(poi, ex, ez, 1);
    }
  }

  dock(ax, az, bx, bz, w) {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.ceil(len / 2.5);
    const y = 1.0;
    for (let i = 0; i < n; i++) {
      const mx = lerp(ax, bx, (i + 0.5) / n), mz = lerp(az, bz, (i + 0.5) / n);
      const top = Math.max(y, this.T.heightAt(mx, mz) + 0.1);
      this.gb.box(mx - w / 2, top - 0.25, mz - w / 2, mx + w / 2, top, mz + w / 2, i % 2 ? WOOD : '#9a7650');
      this.gb.box(mx - 0.15, -4, mz - 0.15, mx + 0.15, top - 0.25, mz + 0.15, DARK_WOOD);
      this.W.box(mx - w / 2, top - 0.25, mz - w / 2, mx + w / 2, top, mz + w / 2);
    }
  }

  gen_harbor(poi) {
    const rng = this.rng;
    // Lighthouse on the seaward side
    let lh = null;
    for (let tries = 0; tries < 30 && !lh; tries++) {
      const a = Math.PI + (rng() - 0.5) * 1.2;
      const x = poi.x + Math.cos(a) * rng.range(20, 36), z = poi.z + Math.sin(a) * rng.range(20, 36);
      if (this.T.heightAt(x, z) > 1.5 && this.rectClear(x - 4, z - 4, x + 4, z + 4, 2, {})) lh = { x, z };
    }
    if (lh) {
      const y = this.T.heightAt(lh.x, lh.z) - 1;
      for (let k = 0; k < 6; k++) this.gb.cylinder(lh.x, y + k * 5, lh.z, 3.2 - k * 0.18, 3.2 - (k + 1) * 0.18, 5, 12, k % 2 ? '#d33b32' : '#f4f1ea', false);
      this.gb.cylinder(lh.x, y + 30, lh.z, 2.6, 2.6, 0.5, 12, '#333');
      this.gb.cylinder(lh.x, y + 33.5, lh.z, 2.4, 0.2, 2, 12, '#d33b32');
      this.W.box(lh.x - 2.4, y, lh.z - 2.4, lh.x + 2.4, y + 33, lh.z + 2.4);
      this.reserve(lh.x - 4, lh.z - 4, lh.x + 4, lh.z + 4);
      this.footprints.push({ x0: lh.x - 3, z0: lh.z - 3, x1: lh.x + 3, z1: lh.z + 3 });
      this.animated.push({ kind: 'lighthouse', x: lh.x, y: y + 31.8, z: lh.z });
      this.outdoorLoot(poi, lh.x + 5, lh.z, 1);
    }
    const wh = this.findSite(poi, 18, 12, 4, poi.r - 6, { gap: 4 });
    if (wh) this.house(poi, { ...wh, w: 18, d: 12, floors: 1, fh: 5, roof: 'gable', wall: '#7f97a8', roofColor: '#5a6470', doorW: 3.5, doorH: 3.8, winY0: 3, winY1: 4.2, lootPerFloor: 3, furniture: false });
    for (let i = 0; i < 3; i++) {
      const site = this.findSite(poi, 8, 7, 10, poi.r, { gap: 4, faceCenter: true });
      if (site) this.house(poi, { ...site, w: 8, d: 7, floors: rng.chance(0.5) ? 2 : 1, roof: 'gable', lootPerFloor: 1 });
    }
    // Docks out to sea (westward)
    for (let i = 0; i < 3; i++) {
      const zOff = (i - 1) * 16;
      let sx = poi.x - 10, sz = poi.z + zOff;
      // walk west until the water starts
      for (let k = 0; k < 80 && this.T.heightAt(sx, sz) > 0.3; k++) sx -= 1;
      if (this.T.heightAt(sx, sz) > 0.3) continue;
      this.dock(sx + 4, sz, sx - 22, sz, 3);
      this.outdoorLoot(poi, sx - 18, sz, 1);
    }
    for (let i = 0; i < 4; i++) {
      const site = this.findSite(poi, 7, 7, 8, poi.r, { gap: 2 });
      if (!site) continue;
      this.rects.pop();
      this.container(site.x, site.z, rng.chance(0.5), rng.pick(['#c4553b', '#3b7bc4', '#3ba06a']), 1);
    }
  }

  gen_camp(poi) {
    const rng = this.rng;
    for (let i = 0; i < 5; i++) {
      const site = this.findSite(poi, 7, 6, 10, poi.r, { gap: 5, faceCenter: true, maxSlope: 6 });
      if (site) this.house(poi, { ...site, w: 7, d: 6, floors: 1, roof: 'gable', wall: rng.pick(['#8e6a46', '#7a5236', '#9a7a52']), roofColor: '#46603f', lootPerFloor: 1 });
    }
    // Tents and campfire
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const x = poi.x + Math.cos(a) * 7, z = poi.z + Math.sin(a) * 7;
      if (this.T.distToRoad(x, z) < 5) continue;
      const y = this.T.heightAt(x, z) - 0.1;
      this.gb.pyramid(x - 1.6, z - 1.6, x + 1.6, z + 1.6, y, 2.2, rng.pick(['#d97a2b', '#2b8ad9', '#3fae6a']));
      this.W.box(x - 1, y, z - 1, x + 1, y + 1.4, z + 1);
      this.outdoorLoot(poi, x, z, rng.chance(0.6) ? 1 : 0);
    }
    const y = this.T.heightAt(poi.x, poi.z);
    this.gb.cylinder(poi.x, y - 0.1, poi.z, 1.1, 1.1, 0.35, 8, '#6d6862');
    this.animated.push({ kind: 'fire', x: poi.x, y: y + 0.4, z: poi.z });
    // Lookout tower
    const lt = this.findSite(poi, 5, 5, 18, poi.r + 6, { gap: 3, maxSlope: 6 });
    if (lt) {
      const gy = this.T.heightAt(lt.x, lt.z) - 0.3;
      for (const [ox, oz] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) {
        this.gb.box(lt.x + ox - 0.15, gy, lt.z + oz - 0.15, lt.x + ox + 0.15, gy + 9, lt.z + oz + 0.15, DARK_WOOD);
        this.W.box(lt.x + ox - 0.15, gy, lt.z + oz - 0.15, lt.x + ox + 0.15, gy + 9, lt.z + oz + 0.15);
      }
      this.gb.box(lt.x - 2.2, gy + 8.7, lt.z - 2.2, lt.x + 2.2, gy + 9, lt.z + 2.2, WOOD);
      this.W.box(lt.x - 2.2, gy + 8.7, lt.z - 2.2, lt.x + 2.2, gy + 9, lt.z + 2.2);
      this.gb.pyramid(lt.x - 2.6, lt.z - 2.6, lt.x + 2.6, lt.z + 2.6, gy + 11.5, 1.6, '#46603f');
      this.lootSpots.push({ x: lt.x, y: gy + 9.05, z: lt.z, poi, building: null, floor: 0, high: true });
    }
  }

  gen_cabins(poi) {
    const rng = this.rng;
    const big = this.findSite(poi, 12, 9, 0, 16, { gap: 5 });
    if (big) this.house(poi, { ...big, w: 12, d: 9, floors: 2, roof: 'gable', wall: '#8a5a3a', roofColor: '#a8473a', lootPerFloor: 1 });
    for (let i = 0; i < 5; i++) {
      const site = this.findSite(poi, 7, 6, 14, poi.r, { gap: 5, faceCenter: true, maxSlope: 6 });
      if (site) this.house(poi, { ...site, w: 7, d: 6, floors: 1, roof: 'gable', wall: rng.pick(['#9a6a42', '#b07a4a', '#7a5236']), roofColor: rng.pick(['#a8473a', '#c9772f']), lootPerFloor: 1 });
    }
  }

  gen_outpost(poi) {
    const rng = this.rng;
    // Gas station canopy on the road
    const gx = poi.x, gz = poi.z;
    const y = this.T.heightAt(gx, gz);
    for (const [ox, oz] of [[-5, -3], [5, -3], [-5, 3], [5, 3]]) {
      this.gb.box(gx + ox - 0.25, y - 0.2, gz + oz - 0.25, gx + ox + 0.25, y + 4.5, gz + oz + 0.25, '#e8e8e8');
      this.W.box(gx + ox - 0.25, y - 0.2, gz + oz - 0.25, gx + ox + 0.25, y + 4.5, gz + oz + 0.25);
    }
    this.gb.box(gx - 7, y + 4.5, gz - 4.5, gx + 7, y + 5.3, gz + 4.5, '#d24b3c');
    this.W.box(gx - 7, y + 4.5, gz - 4.5, gx + 7, y + 5.3, gz + 4.5);
    this.reserve(gx - 7, gz - 5, gx + 7, gz + 5);
    this.lootSpots.push({ x: gx, y: y + 5.35, z: gz, poi, building: null, floor: 0, high: true });
    const shop = this.findSite(poi, 12, 8, 12, poi.r, { gap: 4, faceCenter: true });
    if (shop) this.house(poi, { ...shop, w: 12, d: 8, floors: 1, fh: 3.6, roof: 'flat', glass: true, winW: 2.6, wall: '#efe4cf', lootPerFloor: 3 });
    for (let i = 0; i < 3; i++) {
      const site = this.findSite(poi, 7, 6, 14, poi.r, { gap: 4 });
      if (site) this.house(poi, { ...site, w: 7, d: 6, floors: 1, roof: 'flat', wall: rng.pick(['#c98b5a', '#d9a066']), lootPerFloor: 1 });
    }
    const wt = this.findSite(poi, 6, 6, 14, poi.r + 6, { gap: 3 });
    if (wt) this.waterTower(wt.x, wt.z);
    this.metalSpots.push({ x: gx + 9, z: gz + 8, kind: 'car' }, { x: gx - 10, z: gz + 9, kind: 'car' });
  }

  gen_beach(poi) {
    const rng = this.rng;
    for (let i = 0; i < 6; i++) {
      const site = this.findSite(poi, 6, 6, 6, poi.r, { gap: 5, faceCenter: true });
      if (!site) continue;
      this.house(poi, {
        ...site, w: 6, d: 6, floors: 1, stilts: 1.4, roof: 'pyramid', wall: rng.pick(['#f2e3c2', '#e8d0a8', '#9fd6e0']),
        roofColor: '#c9a24a', lootPerFloor: 1, windows: true,
      });
    }
    const shop = this.findSite(poi, 12, 8, 4, poi.r - 10, { gap: 4 });
    if (shop) this.house(poi, { ...shop, w: 12, d: 8, floors: 1, roof: 'flat', wall: '#ffd27a', glass: true, winW: 2.2, lootPerFloor: 2, roofAccess: true });
    // Lifeguard tower and umbrellas
    for (let i = 0; i < 8; i++) {
      const a = rng() * Math.PI * 2, r = rng.range(10, poi.r + 15);
      const x = poi.x + Math.cos(a) * r, z = poi.z + Math.sin(a) * r;
      const h = this.T.heightAt(x, z);
      if (h < 0.6 || h > 4) continue;
      this.gb.cylinder(x, h - 0.2, z, 0.06, 0.06, 2.4, 5, '#ddd');
      this.gb.cone(x, h + 2.0, z, 1.6, 0.7, 8, rng.pick(['#e84a5f', '#2ab7ca', '#fed766', '#ffffff']));
    }
    const lg = this.findSite(poi, 4, 4, poi.r - 10, poi.r + 12, { gap: 2 });
    if (lg) {
      const gy = this.T.heightAt(lg.x, lg.z) - 0.2;
      for (const [ox, oz] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) this.gb.box(lg.x + ox - 0.1, gy, lg.z + oz - 0.1, lg.x + ox + 0.1, gy + 3.5, lg.z + oz + 0.1, '#f4f1ea');
      this.gb.box(lg.x - 1.6, gy + 3.5, lg.z - 1.6, lg.x + 1.6, gy + 3.7, lg.z + 1.6, WOOD);
      this.W.box(lg.x - 1.6, gy + 3.5, lg.z - 1.6, lg.x + 1.6, gy + 3.7, lg.z + 1.6);
      this.gb.box(lg.x - 1.6, gy + 3.7, lg.z - 1.6, lg.x + 1.6, gy + 4.9, lg.z - 1.4, '#e84a5f');
      this.gb.pyramid(lg.x - 1.9, lg.z - 1.9, lg.x + 1.9, lg.z + 1.9, gy + 5.6, 1.2, '#e84a5f');
      this.lootSpots.push({ x: lg.x, y: gy + 3.75, z: lg.z, poi, building: null, floor: 0, high: true });
    }
  }

  // Vehicle parking spots along roads, away from POI centers.
  pickVehicleSpots(count) {
    const spots = [];
    const roads = this.T.roads;
    for (let tries = 0; tries < 400 && spots.length < count; tries++) {
      const road = this.rng.pick(roads);
      const i = this.rng.int(4, road.points.length - 6);
      const [x, z] = road.points[i];
      const [nx, nz] = road.points[i + 2];
      if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 90)) continue;
      if (this.T.distToRiver(x, z) < 15) continue;
      const yaw = Math.atan2(-(nx - x), -(nz - z));
      const px = -(nz - z), pz = nx - x;
      const len = Math.hypot(px, pz) || 1;
      const sx = x + (px / len) * 1.8, sz = z + (pz / len) * 1.8;
      let blocked = false;
      this.W.query(sx - 3, sz - 3, sx + 3, sz + 3, () => {
        blocked = true;
        return false;
      });
      if (blocked) continue;
      spots.push({ x: sx, z: sz, yaw });
    }
    return spots;
  }

  update(dt, t) {
    for (const a of this.animated) {
      if (a.update) a.update(dt, t);
    }
  }
}

// Builds the animated landmark objects (lights, windmill blades, smoke) and returns them.
export function buildAnimatedProps(structures, scene) {
  const out = [];
  const flareTex = makeGlowTexture();
  for (const a of structures.animated) {
    if (a.kind === 'beacon') {
      const mat = new THREE.SpriteMaterial({ map: flareTex, color: a.color, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
      const sp = new THREE.Sprite(mat);
      sp.position.set(a.x, a.y, a.z);
      sp.scale.setScalar(6);
      scene.add(sp);
      a.update = (dt, t) => {
        const on = Math.sin(t * 3) > 0;
        sp.material.opacity = on ? 1 : 0.15;
      };
      out.push(sp);
    } else if (a.kind === 'windmill') {
      const g = new THREE.Group();
      const gb = new GeoBuilder();
      gb.jitter = 0;
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const c = Math.cos(ang), s = Math.sin(ang);
        // blade as a thin rotated box built manually
        const pts = (r, w) => [c * r - s * w, s * r + c * w];
        const [ax, ay] = pts(1, -0.15), [bx, by] = pts(9, -0.9), [cx, cy] = pts(9, 0.9), [dx, dy] = pts(1, 0.15);
        const col = gb.rgb('#f4efe2');
        gb.quad([ax, ay, 0], [bx, by, 0], [cx, cy, 0], [dx, dy, 0], col);
        gb.quad([dx, dy, -0.1], [cx, cy, -0.1], [bx, by, -0.1], [ax, ay, -0.1], col);
      }
      gb.sphere(0, 0, 0, 0.8, 8, 6, '#8a3b2f');
      const m = new THREE.Mesh(gb.build(), worldMaterial());
      g.add(m);
      g.position.set(a.x, a.y, a.z);
      scene.add(g);
      a.update = (dt) => {
        m.rotation.z += dt * 0.8;
      };
      out.push(g);
    } else if (a.kind === 'lighthouse') {
      const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: 0xfff2b0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      lamp.position.set(a.x, a.y, a.z);
      lamp.scale.setScalar(9);
      scene.add(lamp);
      const beamGeo = new THREE.CylinderGeometry(0.4, 4, 60, 12, 1, true);
      beamGeo.rotateZ(Math.PI / 2);
      beamGeo.translate(30, 0, 0);
      const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      beam.position.set(a.x, a.y, a.z);
      scene.add(beam);
      a.update = (dt) => {
        beam.rotation.y += dt * 0.9;
      };
      out.push(lamp, beam);
    } else if (a.kind === 'smoke' || a.kind === 'steam' || a.kind === 'fire') {
      const n = a.kind === 'fire' ? 6 : 10;
      const puffs = [];
      const color = a.kind === 'smoke' ? 0x6e6a66 : a.kind === 'steam' ? 0xffffff : 0xff8a2a;
      for (let i = 0; i < n; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
          map: flareTex, color, transparent: true, depthWrite: false,
          blending: a.kind === 'fire' ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: 0.5,
        }));
        sp.userData.t = i / n;
        scene.add(sp);
        puffs.push(sp);
        out.push(sp);
      }
      const rise = a.kind === 'fire' ? 1.6 : a.kind === 'steam' ? 22 : 16;
      const size = a.kind === 'fire' ? 1.2 : a.kind === 'steam' ? 14 : 6;
      a.update = (dt) => {
        for (const sp of puffs) {
          sp.userData.t = (sp.userData.t + dt * (a.kind === 'fire' ? 1.2 : 0.08)) % 1;
          const t = sp.userData.t;
          sp.position.set(a.x + Math.sin(t * 6 + sp.id) * t * 2, a.y + t * rise, a.z + Math.cos(t * 5 + sp.id) * t * 2);
          sp.scale.setScalar(size * (0.4 + t));
          sp.material.opacity = (1 - t) * (a.kind === 'steam' ? 0.55 : 0.6);
        }
      };
    }
  }
  return out;
}

let glowTex = null;
export function makeGlowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}
