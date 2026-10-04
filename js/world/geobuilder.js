import * as THREE from 'three';

// Accumulates flat-shaded, vertex-colored triangles and turns them into one BufferGeometry.
// Used for buildings, props and models so whole areas render in a single draw call.
const tmpColor = new THREE.Color();

export class GeoBuilder {
  constructor(rng = Math.random) {
    this.pos = [];
    this.nor = [];
    this.col = [];
    this.rng = rng;
    this.jitter = 0.06;
  }

  get vertexCount() {
    return this.pos.length / 3;
  }

  rgb(color) {
    if (Array.isArray(color)) return color;
    tmpColor.set(color);
    const j = this.jitter ? 1 + (this.rng() - 0.5) * 2 * this.jitter : 1;
    return [tmpColor.r * j, tmpColor.g * j, tmpColor.b * j];
  }

  // Flat triangle; vertices in counter-clockwise order seen from the front.
  tri(a, b, c, rgb) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    this.pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    this.nor.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
    this.col.push(rgb[0], rgb[1], rgb[2], rgb[0], rgb[1], rgb[2], rgb[0], rgb[1], rgb[2]);
  }

  // Triangle whose winding is fixed so its normal points away from (cx, cy, cz).
  triOut(a, b, c, rgb, cx, cy, cz) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (a[0] + b[0] + c[0]) / 3 - cx, my = (a[1] + b[1] + c[1]) / 3 - cy, mz = (a[2] + b[2] + c[2]) / 3 - cz;
    if (nx * mx + ny * my + nz * mz < 0) this.tri(a, c, b, rgb);
    else this.tri(a, b, c, rgb);
  }

  quad(p0, p1, p2, p3, rgb) {
    this.tri(p0, p1, p2, rgb);
    this.tri(p0, p2, p3, rgb);
  }

  box(x0, y0, z0, x1, y1, z1, color, skipBottom = true) {
    const c = this.rgb(color);
    this.quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], c);
    if (!skipBottom) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], c);
    this.quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], c);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], c);
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], c);
    this.quad([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], c);
  }

  // Box given by center and size (y is the bottom).
  boxC(cx, y, cz, sx, sy, sz, color, skipBottom = true) {
    this.box(cx - sx / 2, y, cz - sz / 2, cx + sx / 2, y + sy, cz + sz / 2, color, skipBottom);
  }

  // Box rotated around Y by `yaw` radians, centered at (cx, y, cz) with bottom at y.
  boxRot(cx, y, cz, sx, sy, sz, yaw, color) {
    const c = this.rgb(color);
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    const p = (lx, ly, lz) => [cx + lx * cs + lz * sn, y + ly, cz - lx * sn + lz * cs];
    const hx = sx / 2, hz = sz / 2;
    const v = [
      p(-hx, 0, -hz), p(hx, 0, -hz), p(hx, 0, hz), p(-hx, 0, hz),
      p(-hx, sy, -hz), p(hx, sy, -hz), p(hx, sy, hz), p(-hx, sy, hz),
    ];
    const ccx = cx, ccy = y + sy / 2, ccz = cz;
    const faces = [[4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [0, 3, 2, 1]];
    for (const f of faces) {
      this.triOut(v[f[0]], v[f[1]], v[f[2]], c, ccx, ccy, ccz);
      this.triOut(v[f[0]], v[f[2]], v[f[3]], c, ccx, ccy, ccz);
    }
  }

  cylinder(cx, y0, cz, rBottom, rTop, h, seg, color, caps = true) {
    const c = this.rgb(color);
    const y1 = y0 + h;
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const b0 = [cx + Math.cos(a0) * rBottom, y0, cz + Math.sin(a0) * rBottom];
      const b1 = [cx + Math.cos(a1) * rBottom, y0, cz + Math.sin(a1) * rBottom];
      const t0 = [cx + Math.cos(a0) * rTop, y1, cz + Math.sin(a0) * rTop];
      const t1 = [cx + Math.cos(a1) * rTop, y1, cz + Math.sin(a1) * rTop];
      if (rTop > 0.0001) {
        this.triOut(b0, t0, t1, c, cx, y0 + h / 2, cz);
        this.triOut(b0, t1, b1, c, cx, y0 + h / 2, cz);
        if (caps) this.tri([cx, y1, cz], t1, t0, c);
      } else {
        this.triOut(b0, t0, b1, c, cx, y0, cz);
      }
      if (caps) this.tri([cx, y0, cz], b0, b1, c);
    }
  }

  cone(cx, y0, cz, r, h, seg, color) {
    this.cylinder(cx, y0, cz, r, 0, h, seg, color, true);
  }

  // Low-poly ellipsoid. sy scales height.
  sphere(cx, cy, cz, r, seg, rings, color, sy = 1, hemisphere = false) {
    const c = this.rgb(color);
    const maxRing = hemisphere ? Math.ceil(rings / 2) : rings;
    const P = (j, i) => {
      const th = (j / rings) * Math.PI;
      const ph = (i / seg) * Math.PI * 2;
      return [cx + Math.sin(th) * Math.cos(ph) * r, cy + Math.cos(th) * r * sy, cz + Math.sin(th) * Math.sin(ph) * r];
    };
    for (let j = 0; j < maxRing; j++) {
      for (let i = 0; i < seg; i++) {
        const a = P(j, i), b = P(j + 1, i), d = P(j, i + 1), e = P(j + 1, i + 1);
        if (j > 0) this.triOut(a, b, d, c, cx, cy, cz);
        if (j < rings - 1) this.triOut(b, e, d, c, cx, cy, cz);
      }
    }
  }

  // Gable roof over a footprint. axis 'x' => ridge runs along X.
  gable(x0, z0, x1, z1, y0, h, axis, color, endColor) {
    const c = this.rgb(color);
    const e = this.rgb(endColor || color);
    if (axis === 'x') {
      const zm = (z0 + z1) / 2;
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y0 + h, zm], [x0, y0 + h, zm], c);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y0 + h, zm], [x1, y0 + h, zm], c);
      this.tri([x0, y0, z0], [x0, y0, z1], [x0, y0 + h, zm], e);
      this.tri([x1, y0, z1], [x1, y0, z0], [x1, y0 + h, zm], e);
    } else {
      const xm = (x0 + x1) / 2;
      this.quad([x1, y0, z1], [x1, y0, z0], [xm, y0 + h, z0], [xm, y0 + h, z1], c);
      this.quad([x0, y0, z0], [x0, y0, z1], [xm, y0 + h, z1], [xm, y0 + h, z0], c);
      this.tri([x0, y0, z1], [x1, y0, z1], [xm, y0 + h, z1], e);
      this.tri([x1, y0, z0], [x0, y0, z0], [xm, y0 + h, z0], e);
    }
  }

  pyramid(x0, z0, x1, z1, y0, h, color) {
    const c = this.rgb(color);
    const ax = (x0 + x1) / 2, az = (z0 + z1) / 2;
    const apex = [ax, y0 + h, az];
    const cxy = y0 + h * 0.3;
    this.triOut([x0, y0, z0], [x1, y0, z0], apex, c, ax, cxy, az);
    this.triOut([x1, y0, z0], [x1, y0, z1], apex, c, ax, cxy, az);
    this.triOut([x1, y0, z1], [x0, y0, z1], apex, c, ax, cxy, az);
    this.triOut([x0, y0, z1], [x0, y0, z0], apex, c, ax, cxy, az);
  }

  // Appends another builder's triangles.
  merge(other) {
    for (let i = 0; i < other.pos.length; i++) {
      this.pos.push(other.pos[i]);
      this.nor.push(other.nor[i]);
      this.col.push(other.col[i]);
    }
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

// Shared vertex-color material for static world geometry.
let worldMat = null;
export function worldMaterial() {
  if (!worldMat) worldMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  return worldMat;
}
