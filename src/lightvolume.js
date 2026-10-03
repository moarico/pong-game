import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Baked light for a hall. Every light that does not move (candles, windows,
// braziers, the furnace, the crystals) is summed once, when the hall is built,
// into a coarse 3D grid: how much light arrives at each point and from which way
// most of it comes. Walls, floors, the boss and the samurai all sample it, so a
// hall is lit by what is in it instead of by one flat ambient term, and the
// crystals on a cave roof light the rock they grow from. Pillars and other
// upright columns cast soft shadows in it. Moving and flickering lights stay
// dynamic (see LightRig); this is the steady light under them.
// ---------------------------------------------------------------------------

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export class LightVolume {
  // min, max: the box it covers ([x, y, z]); cell: metres per texel.
  constructor(min, max, cell = 0.8) {
    this.min = new THREE.Vector3(...min);
    this.size = new THREE.Vector3(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
    this.nx = Math.max(2, Math.round(this.size.x / cell));
    this.ny = Math.max(2, Math.round(this.size.y / cell));
    this.nz = Math.max(2, Math.round(this.size.z / cell));
    this.textures = null;
  }

  // lights: [{ pos: [x, y, z], color: [r, g, b] (linear, times intensity), range }]
  // occluders: upright cylinders [{ x, z, r, y0, y1 }] that shade what lies behind them.
  bake(lights, occluders = []) {
    const { nx, ny, nz, min, size } = this;
    const n = nx * ny * nz;
    const A = new Float32Array(n * 4);
    const D = new Float32Array(n * 4);
    const sx = size.x / nx;
    const sy = size.y / ny;
    const sz = size.z / nz;
    for (const L of lights) {
      const [lx, ly, lz] = L.pos;
      const [cr, cg, cb] = L.color;
      const range = L.range;
      const r2 = range * range;
      const cl = lum(cr, cg, cb);
      // Only the texels within reach.
      const i0 = Math.max(0, Math.floor((lx - range - min.x) / sx));
      const i1 = Math.min(nx - 1, Math.ceil((lx + range - min.x) / sx));
      const j0 = Math.max(0, Math.floor((ly - range - min.y) / sy));
      const j1 = Math.min(ny - 1, Math.ceil((ly + range - min.y) / sy));
      const k0 = Math.max(0, Math.floor((lz - range - min.z) / sz));
      const k1 = Math.min(nz - 1, Math.ceil((lz + range - min.z) / sz));
      // Occluders that can matter for this light.
      const occ = occluders.filter((o) => Math.hypot(o.x - lx, o.z - lz) < range + o.r);
      for (let k = k0; k <= k1; k++) {
        const pz = min.z + (k + 0.5) * sz;
        for (let j = j0; j <= j1; j++) {
          const py = min.y + (j + 0.5) * sy;
          for (let i = i0; i <= i1; i++) {
            const px = min.x + (i + 0.5) * sx;
            const dx = lx - px;
            const dy = ly - py;
            const dz = lz - pz;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 >= r2) continue;
            const f = 1 - d2 / r2;
            let att = (f * f) / (1 + d2 * 0.3);
            // Soft shadows: how close the ray passes the axis of each column.
            for (const o of occ) {
              if (att <= 0) break;
              // Closest approach of the segment p -> light to the column's axis, in plan.
              const ux = dx;
              const uz = dz;
              const uu = ux * ux + uz * uz;
              if (uu < 1e-6) continue;
              let t = ((o.x - px) * ux + (o.z - pz) * uz) / uu;
              if (t <= 0.02 || t >= 0.98) continue;
              const cx = px + ux * t - o.x;
              const cz = pz + uz * t - o.z;
              const y = py + dy * t;
              if (y < o.y0 || y > o.y1) continue;
              const dist = Math.sqrt(cx * cx + cz * cz);
              const soft = Math.min(1, Math.max(0, (dist - o.r * 0.55) / (o.r * 0.75)));
              att *= soft * soft * (3 - 2 * soft);
            }
            if (att <= 1e-5) continue;
            const q = ((k * ny + j) * nx + i) * 4;
            A[q] += cr * att;
            A[q + 1] += cg * att;
            A[q + 2] += cb * att;
            const w = (cl * att) / Math.sqrt(d2 + 1e-6);
            D[q] += dx * w;
            D[q + 1] += dy * w;
            D[q + 2] += dz * w;
          }
        }
      }
    }
    const make = (data) => {
      const half = new Uint16Array(data.length);
      for (let i = 0; i < data.length; i++) half[i] = THREE.DataUtils.toHalfFloat(Math.max(-60000, Math.min(60000, data[i])));
      const t = new THREE.Data3DTexture(half, nx, ny, nz);
      t.format = THREE.RGBAFormat;
      t.type = THREE.HalfFloatType;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = t.wrapT = t.wrapR = THREE.ClampToEdgeWrapping;
      t.unpackAlignment = 1;
      t.needsUpdate = true;
      return t;
    };
    this.dispose();
    this.textures = [make(A), make(D)];
    return this;
  }

  // Point the shared uniforms at this volume (null switches baked light off).
  static use(shared, volume) {
    if (!volume || !volume.textures) {
      shared.uLvOn.value = 0;
      return;
    }
    shared.uLvA.value = volume.textures[0];
    shared.uLvB.value = volume.textures[1];
    shared.uLvMin.value.copy(volume.min);
    shared.uLvInv.value.set(1 / volume.size.x, 1 / volume.size.y, 1 / volume.size.z);
    shared.uLvOn.value = 1;
  }

  dispose() {
    if (this.textures) for (const t of this.textures) t.dispose();
    this.textures = null;
  }
}

// Fragment shaders only: the baked light arriving at p on a surface facing N.
export const lightVolumeGLSL = /* glsl */ `
uniform highp sampler3D uLvA; // rgb: light arriving
uniform highp sampler3D uLvB; // xyz: which way most of it comes from (weighted)
uniform vec3 uLvMin;
uniform vec3 uLvInv;
uniform float uLvOn;
vec3 hallLight(vec3 p, vec3 N) {
  if (uLvOn < 0.5) return vec3(0.0);
  vec3 uvw = (p - uLvMin) * uLvInv;
  vec3 c = texture(uLvA, uvw).rgb;
  vec3 b = texture(uLvB, uvw).xyz;
  float l = max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-4);
  vec3 d = b / l;
  float len = length(d);
  float k = min(len, 1.0);
  float ndl = dot(N, d / max(len, 1e-4));
  // Light from one side shades like a soft lamp; light from all around, like ambient.
  return max(c, 0.0) * mix(1.0, max(ndl * 0.7 + 0.3, 0.0) * 1.3, k);
}
`;
