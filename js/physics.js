import { clamp } from './util.js';

// Collider kinds: axis-aligned boxes and "surfaces" (height functions over a footprint,
// used for ramps, stairs and sloped roofs).
export const BOX = 0;
export const SURF = 1;

const CELL = 8;

export class CollisionWorld {
  constructor(terrain) {
    this.terrain = terrain;
    this.cells = new Map();
    this.stamp = 1;
    this.nextId = 1;
    this.count = 0;
  }

  key(ix, iz) {
    return (ix + 2048) * 4096 + (iz + 2048);
  }

  box(minx, miny, minz, maxx, maxy, maxz, owner = null) {
    return this.add({ kind: BOX, minx, miny, minz, maxx, maxy, maxz, owner });
  }

  // heightFn(x, z) returns the walkable surface height; thick is the slab thickness under it.
  surface(minx, minz, maxx, maxz, miny, maxy, heightFn, thick, owner = null) {
    return this.add({ kind: SURF, minx, miny, minz, maxx, maxy, maxz, h: heightFn, thick, owner });
  }

  add(col) {
    col.id = this.nextId++;
    col._stamp = 0;
    col.keys = [];
    const x0 = Math.floor(col.minx / CELL), x1 = Math.floor(col.maxx / CELL);
    const z0 = Math.floor(col.minz / CELL), z1 = Math.floor(col.maxz / CELL);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const k = this.key(ix, iz);
        let list = this.cells.get(k);
        if (!list) this.cells.set(k, (list = []));
        list.push(col);
        col.keys.push(k);
      }
    }
    this.count++;
    return col;
  }

  remove(col) {
    if (!col || !col.keys) return;
    for (const k of col.keys) {
      const list = this.cells.get(k);
      if (!list) continue;
      const i = list.indexOf(col);
      if (i >= 0) {
        list[i] = list[list.length - 1];
        list.pop();
      }
    }
    col.keys = null;
    this.count--;
  }

  // Re-index a collider after its bounds changed (vehicles).
  update(col) {
    this.remove(col);
    const id = col.id;
    this.add(col);
    col.id = id;
  }

  // Calls fn(collider) once for every collider whose cells overlap the XZ rectangle.
  query(minx, minz, maxx, maxz, fn) {
    const s = ++this.stamp;
    const x0 = Math.floor(minx / CELL), x1 = Math.floor(maxx / CELL);
    const z0 = Math.floor(minz / CELL), z1 = Math.floor(maxz / CELL);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const list = this.cells.get(this.key(ix, iz));
        if (!list) continue;
        for (let i = 0; i < list.length; i++) {
          const c = list[i];
          if (c._stamp === s) continue;
          c._stamp = s;
          if (c.maxx < minx || c.minx > maxx || c.maxz < minz || c.minz > maxz) continue;
          if (fn(c) === false) return;
        }
      }
    }
  }

  // Highest walkable height at (x, z) that is not above maxY.
  groundAt(x, z, maxY, rr = 0.25, ignore = null) {
    let g = this.terrain.heightAt(x, z);
    this.query(x - rr, z - rr, x + rr, z + rr, (c) => {
      if (c === ignore || c.disabled) return;
      if (c.kind === BOX) {
        if (c.maxy <= maxY && c.maxy > g) g = c.maxy;
      } else if (x >= c.minx && x <= c.maxx && z >= c.minz && z <= c.maxz) {
        const hs = c.h(x, z);
        if (hs <= maxY && hs > g) g = hs;
      }
    });
    return g;
  }

  // Lowest underside above minY at (x, z).
  ceilingAt(x, z, minY, rr = 0.25, ignore = null) {
    let ceil = Infinity;
    this.query(x - rr, z - rr, x + rr, z + rr, (c) => {
      if (c === ignore || c.disabled) return;
      if (c.kind === BOX) {
        if (c.miny >= minY && c.miny < ceil) ceil = c.miny;
      } else if (x >= c.minx && x <= c.maxx && z >= c.minz && z <= c.maxz) {
        const under = c.h(x, z) - c.thick;
        if (under >= minY && under < ceil) ceil = under;
      }
    });
    return ceil;
  }

  // Moves a capsule-like body (pos = feet) by (dx, dy, dz) with sliding collision.
  // body: { pos, radius, height, step }. Returns contact flags.
  moveBody(body, dx, dy, dz, snapDown = false, ignore = null) {
    const p = body.pos;
    const r = body.radius, H = body.height, step = body.step;
    const dist = Math.max(Math.hypot(dx, dz), Math.abs(dy));
    const n = Math.min(16, Math.max(1, Math.ceil(dist / 0.3)));
    const sx = dx / n, sy = dy / n, sz = dz / n;
    const out = { onGround: false, hitCeiling: false, hitWall: false, groundCollider: null };
    for (let s = 0; s < n; s++) {
      let nx = p.x + sx, nz = p.z + sz;
      if (sx !== 0 || sz !== 0) {
        for (let iter = 0; iter < 2; iter++) {
          this.query(nx - r, nz - r, nx + r, nz + r, (c) => {
            if (c === ignore || c.disabled || c.kind !== BOX) return;
            if (c.maxy <= p.y + step || c.miny >= p.y + H) return;
            const cx = clamp(nx, c.minx, c.maxx), cz = clamp(nz, c.minz, c.maxz);
            const ddx = nx - cx, ddz = nz - cz;
            const d2 = ddx * ddx + ddz * ddz;
            if (d2 >= r * r) return;
            if (d2 > 1e-8) {
              const d = Math.sqrt(d2);
              nx = cx + (ddx / d) * r;
              nz = cz + (ddz / d) * r;
            } else {
              const pl = nx - c.minx, pr = c.maxx - nx, pb = nz - c.minz, pf = c.maxz - nz;
              const m = Math.min(pl, pr, pb, pf);
              if (m === pl) nx = c.minx - r;
              else if (m === pr) nx = c.maxx + r;
              else if (m === pb) nz = c.minz - r;
              else nz = c.maxz + r;
            }
            out.hitWall = true;
          });
        }
        if (this.surfaceBlocks(nx, nz, p.y, H, step, ignore)) {
          if (!this.surfaceBlocks(nx, p.z, p.y, H, step, ignore)) nz = p.z;
          else if (!this.surfaceBlocks(p.x, nz, p.y, H, step, ignore)) nx = p.x;
          else {
            nx = p.x;
            nz = p.z;
          }
          out.hitWall = true;
        }
        p.x = nx;
        p.z = nz;
      }
      let ny = p.y + sy;
      const g = this.groundAt(p.x, p.z, p.y + step, r * 0.7, ignore);
      if (ny <= g) {
        ny = g;
        if (sy <= 0) out.onGround = true;
      } else if (snapDown && sy <= 0 && ny - g < 0.6) {
        ny = g;
        out.onGround = true;
      }
      if (sy > 0) {
        const ceil = this.ceilingAt(p.x, p.z, p.y + H - 0.05, r * 0.7, ignore);
        if (ny + H > ceil) {
          ny = Math.max(p.y, ceil - H);
          out.hitCeiling = true;
        }
      }
      p.y = ny;
    }
    return out;
  }

  surfaceBlocks(x, z, feet, H, step, ignore) {
    let blocked = false;
    this.query(x - 0.05, z - 0.05, x + 0.05, z + 0.05, (c) => {
      if (c === ignore || c.disabled || c.kind !== SURF) return;
      if (x < c.minx || x > c.maxx || z < c.minz || z > c.maxz) return;
      const hs = c.h(x, z);
      if (hs > feet + step && hs - c.thick < feet + H) {
        blocked = true;
        return false;
      }
    });
    return blocked;
  }

  // Does any solid box overlap this AABB? (used for placement checks)
  overlapsBox(minx, miny, minz, maxx, maxy, maxz, filter) {
    let hit = false;
    this.query(minx, minz, maxx, maxz, (c) => {
      if (c.disabled || (filter && !filter(c))) return;
      if (c.maxy <= miny || c.miny >= maxy) return;
      hit = true;
      return false;
    });
    return hit;
  }

  // ---------- raycasting ----------

  rayBox(ox, oy, oz, dx, dy, dz, c, maxT) {
    let tmin = -Infinity, tmax = Infinity, axis = -1, sign = 0;
    const o = [ox, oy, oz], d = [dx, dy, dz];
    const mn = [c.minx, c.miny, c.minz], mx = [c.maxx, c.maxy, c.maxz];
    for (let a = 0; a < 3; a++) {
      if (Math.abs(d[a]) < 1e-9) {
        if (o[a] < mn[a] || o[a] > mx[a]) return null;
        continue;
      }
      let t1 = (mn[a] - o[a]) / d[a], t2 = (mx[a] - o[a]) / d[a];
      let s = -1;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
        s = 1;
      }
      if (t1 > tmin) {
        tmin = t1;
        axis = a;
        sign = s;
      }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax || tmax < 0 || tmin > maxT) return null;
    }
    if (tmin < 0) return { t: 0, tExit: tmax, axis: -1, sign: 0 };
    return { t: tmin, tExit: tmax, axis, sign };
  }

  raySurface(ox, oy, oz, dx, dy, dz, c, maxT) {
    const b = this.rayBox(ox, oy, oz, dx, dy, dz, c, maxT);
    if (!b) return null;
    const t0 = b.t, t1 = Math.min(b.tExit, maxT);
    const f = (t) => oy + dy * t - c.h(ox + dx * t, oz + dz * t);
    const steps = 10;
    let pt = t0, pf = f(t0);
    for (let i = 1; i <= steps; i++) {
      const t = t0 + ((t1 - t0) * i) / steps;
      const ft = f(t);
      if ((pf > 0) !== (ft > 0)) {
        let a = pt, bb = t;
        for (let k = 0; k < 10; k++) {
          const m = (a + bb) / 2;
          if ((f(m) > 0) === (pf > 0)) a = m;
          else bb = m;
        }
        return { t: (a + bb) / 2, up: pf > 0 };
      }
      pt = t;
      pf = ft;
    }
    return null;
  }

  terrainRay(ox, oy, oz, dx, dy, dz, maxT) {
    const T = this.terrain;
    let t = 0;
    let f = oy - T.heightAt(ox, oz);
    if (f < 0) return 0;
    while (t < maxT) {
      if (oy + dy * t > 160 && dy >= 0) return Infinity;
      const step = clamp(f * 0.5, 0.35, 10);
      const nt = Math.min(t + step, maxT);
      const nf = oy + dy * nt - T.heightAt(ox + dx * nt, oz + dz * nt);
      if (nf < 0) {
        let a = t, b = nt;
        for (let k = 0; k < 12; k++) {
          const m = (a + b) / 2;
          if (oy + dy * m - T.heightAt(ox + dx * m, oz + dz * m) > 0) a = m;
          else b = m;
        }
        return (a + b) / 2;
      }
      if (nt >= maxT) break;
      t = nt;
      f = nf;
    }
    return Infinity;
  }

  // Returns { t, x, y, z, nx, ny, nz, collider, terrain } or null. Direction must be normalized.
  raycast(ox, oy, oz, dx, dy, dz, maxDist, ignore = null, skipTerrain = false) {
    let best = maxDist;
    let bestCol = null, bestN = null;
    const s = ++this.stamp;
    // 2D DDA over grid cells.
    let ix = Math.floor(ox / CELL), iz = Math.floor(oz / CELL);
    const stepX = dx > 0 ? 1 : -1, stepZ = dz > 0 ? 1 : -1;
    const adx = Math.abs(dx), adz = Math.abs(dz);
    const tDX = adx > 1e-9 ? CELL / adx : Infinity;
    const tDZ = adz > 1e-9 ? CELL / adz : Infinity;
    let tMX = adx > 1e-9 ? ((dx > 0 ? (ix + 1) * CELL - ox : ox - ix * CELL) / adx) : Infinity;
    let tMZ = adz > 1e-9 ? ((dz > 0 ? (iz + 1) * CELL - oz : oz - iz * CELL) / adz) : Infinity;
    let tCell = 0;
    let guard = 0;
    while (tCell <= best && guard++ < 600) {
      const list = this.cells.get(this.key(ix, iz));
      if (list) {
        for (let i = 0; i < list.length; i++) {
          const c = list[i];
          if (c._stamp === s) continue;
          c._stamp = s;
          if (c.disabled || (ignore && ignore(c))) continue;
          if (c.kind === BOX) {
            const h = this.rayBox(ox, oy, oz, dx, dy, dz, c, best);
            if (h && h.t < best) {
              best = h.t;
              bestCol = c;
              bestN = [0, 0, 0];
              if (h.axis >= 0) bestN[h.axis] = h.sign;
            }
          } else {
            const h = this.raySurface(ox, oy, oz, dx, dy, dz, c, best);
            if (h && h.t < best) {
              best = h.t;
              bestCol = c;
              bestN = [0, h.up ? 1 : -1, 0];
            }
          }
        }
      }
      if (tMX < tMZ) {
        tCell = tMX;
        tMX += tDX;
        ix += stepX;
      } else {
        tCell = tMZ;
        tMZ += tDZ;
        iz += stepZ;
      }
      if (tDX === Infinity && tDZ === Infinity) break;
    }
    let terrainHit = false;
    if (!skipTerrain) {
      const tt = this.terrainRay(ox, oy, oz, dx, dy, dz, best);
      if (tt < best) {
        best = tt;
        bestCol = null;
        terrainHit = true;
      }
    }
    if (!bestCol && !terrainHit) return null;
    const x = ox + dx * best, y = oy + dy * best, z = oz + dz * best;
    let n = bestN;
    if (terrainHit) {
      const nv = this.terrain.normalAt(x, z);
      n = [nv.x, nv.y, nv.z];
    }
    return { t: best, x, y, z, nx: n[0], ny: n[1], nz: n[2], collider: bestCol, terrain: terrainHit };
  }

  // Line of sight between two points (true if nothing blocks).
  los(ax, ay, az, bx, by, bz, ignoreFn = null) {
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const len = Math.hypot(dx, dy, dz);
    if (len < 0.01) return true;
    const hit = this.raycast(ax, ay, az, dx / len, dy / len, dz / len, len - 0.05, ignoreFn);
    return !hit;
  }
}
