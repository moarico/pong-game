import * as THREE from 'three';
import { Stage } from '../stage.js';
import { ArenaBuilder, amat, APAT, makeArenaMaterial, place } from '../arenamat.js';
import { common, sharedUniforms, atmosphere } from '../glsl.js';
import { clampCircle, pushOutCircle, cameraInCircle } from '../ground.js';
import { PK } from '../vfx.js';
import { mulberry32 } from '../noise.js';
import { Wyrm } from './wyrm.js';

// ---------------------------------------------------------------------------
// The Crystal Caves. A vaulted cavern deep under the mountain, lit by its own
// crystals: blue and violet and teal, grown in clusters from floor, wall and
// roof. A pillar of living rock holds up the dark, a stair of old stone
// winding round it; miners' scaffolding clings to one wall, a waterfall fills
// a glowing pool, and a crack in the roof lets down one cold shaft of light.
// Around the pillar, asleep, lies the wyrm the crystals grew on.
// ---------------------------------------------------------------------------

export const FLOOR_R = 16.5;
export const PILLAR = new THREE.Vector3(0, 0, -4);
export const PILLAR_R = 3.3;
const CAVE_R = 23;
const CAVE_H = 24;
const HOLE = new THREE.Vector3(5, CAVE_H - 1, 3);
const POOL = new THREE.Vector3(-12, 0, -7);

// Radius of the pillar at height y (its rock swells and narrows).
export function pillarR(y) {
  return PILLAR_R - 0.8 * Math.sin(Math.min(y, 20) / 20 * Math.PI) + 2.5 * Math.max(0, (y - 18) / 6) ** 2;
}

const poolFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
varying vec3 vWorld;
void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  vec2 p = vWorld.xz;
  float n = vnoise(p * 1.3 + uTime * 0.25) * 0.6 + vnoise(p * 3.1 - uTime * 0.4) * 0.4;
  float veins = pow(1.0 - abs(sin(p.x * 1.7 + sin(p.y * 1.3 + uTime * 0.7) * 1.4 + uTime * 0.5) * 0.5 + sin(p.y * 1.9 - uTime * 0.6) * 0.5), 5.0);
  float fres = pow(1.0 - max(V.y, 0.0), 4.0);
  vec3 deep = vec3(0.02, 0.08, 0.16);
  vec3 glow = vec3(0.2, 0.75, 1.1);
  vec3 col = deep + glow * (0.25 * n + 0.9 * veins) + uEnvSky * fres * 0.8;
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 0.92);
}
`;

const fallFrag = /* glsl */ `
${common}
uniform float uTime;
varying vec2 vUv;
void main() {
  float x = vUv.x;
  float streak = vnoise(vec2(x * 9.0, vUv.y * 2.0 + uTime * 5.0)) * 0.6 + vnoise(vec2(x * 17.0, vUv.y * 4.0 + uTime * 7.0)) * 0.4;
  float edge = smoothstep(0.0, 0.15, x) * smoothstep(1.0, 0.85, x);
  float a = smoothstep(0.35, 0.8, streak) * edge;
  vec3 col = vec3(0.4, 0.75, 1.0) * (0.6 + 1.4 * a);
  gl_FragColor = vec4(col * a * 0.8, 0.0);
}
`;

export class CavesStage extends Stage {
  constructor(game, manager) {
    super(game, manager);
    this.id = 'caves';
    this.title = 'The Crystal Caves';
    this.spawn = { x: 1.5, z: 12, yaw: Math.PI };
    this.camDist = 1.8;
    this.pitchBias = -0.1;
    this.camClose = 1.6;
    this.tiltClose = 0.08;
    this.lighting = {
      sunDir: [-0.2, 0.9, -0.15],
      lightDir: [0.2, 0.95, 0.1],
      sun: [0.32, 0.42, 0.7],
      ambSky: [0.05, 0.065, 0.15],
      ambGround: [0.035, 0.02, 0.06],
      fog: [0.012, 0.018, 0.045],
      fogSun: [0.25, 0.4, 0.75],
      fogDensity: 0.03,
      fogFalloff: 0.04,
      mist: [0.08, 0.9],
      envSky: [0.25, 0.3, 0.6],
      envGround: [0.08, 0.06, 0.16],
      rays: 0.5,
      flare: 0.2,
      bloom: 0.11,
      key: 0.16,
      range: [0.1, 7],
      wind: 0.12,
    };
    const self = this;
    this.solids = [];
    this.floor = {
      height: () => 0,
      clamp(pos, vel) {
        clampCircle(pos, vel, 0, 0, FLOOR_R);
        pushOutCircle(pos, vel, PILLAR.x, PILLAR.z, PILLAR_R + 0.35);
        for (const [x, z, r] of self.solids) pushOutCircle(pos, vel, x, z, r + 0.35);
      },
      camera(aim, pos) {
        cameraInCircle(aim, pos, 0, 0, CAVE_R - 3, [[PILLAR.x, PILLAR.z, PILLAR_R + 0.4]]);
        pos.y = Math.min(pos.y, CAVE_H - 6);
      },
    };
    this.intro = {
      dur: 10.5,
      keys: [
        { t: 0, pos: [-13, 3, 10], look: [-12, 2, -8], fov: 55 },
        { t: 2.8, pos: [12, 6, 9], look: [15, 5, -3], fov: 55 },
        { t: 5.2, pos: [7, 5, 6], look: [0, 9, -4], fov: 52 },
        { t: 7.8, pos: [2.5, 3.4, 5.5], look: [0, 6, -4], fov: 50 },
        { t: 10.5, pos: [2.8, 3.6, 17], look: [0.5, 3.5, 4], fov: 48 },
      ],
    };
    this.preview = { pos: [8.5, 4.2, 15], look: [0, 7, -4], fov: 50 };
    this.rand = mulberry32(55);
    this.sporeT = 0;
  }

  makeBoss() {
    return new Wyrm(this.g, this);
  }

  makeMaterial() {
    return makeArenaMaterial(this.shared, { floorY: 0, glowPulse: 1 });
  }

  onImpact(x, z, s) {
    this.dust(x, z, 0.4 + s * 0.6);
  }

  dust(x, z, s = 1) {
    const fx = this.fx;
    fx.smoke.burst(x, 0.3, z, Math.round(5 + s * 7), { vel: [0, 1.0 * s, 0], scatter: 1.8 * s, scatterY: 0.4, life: 1.6, size: [0.5 * s, 2 * s], color: [0.45, 0.45, 0.62, 0.45], color1: [0.3, 0.3, 0.45, 0], drag: 2.2, gravity: -0.2, kind: PK.smoke }, 0.6 * s);
    fx.add.burst(x, 0.2, z, Math.round(6 + s * 8), { vel: [0, 3.5 * s, 0], scatter: 2.5 * s, life: 0.8, size: [0.08, 0.03], color: [0.8, 1.2, 2.6, 1], color1: [0.3, 0.3, 1.0, 0], gravity: 9.8, drag: 0.6, kind: PK.shard, spin: 12, bounce: 0.3 }, 0.4);
  }

  // Splinters of crystal, glinting as they tumble.
  shards(p, n = 20, s = 1, color = [1.2, 1.8, 3.2]) {
    this.fx.add.burst(p.x, p.y, p.z, n, { vel: [0, 3 * s, 0], scatter: 4 * s, life: 1.1, size: [0.14 * s, 0.06], color: [...color, 1], color1: [color[0] * 0.3, color[1] * 0.3, color[2] * 0.4, 0], gravity: 9.8, drag: 0.5, kind: PK.shard, spin: 14, bounce: 0.35 }, 0.3 * s);
  }

  build() {
    const B = new ArenaBuilder();
    const rnd = mulberry32(17);
    const rock = amat('#4a4658', { pat: APAT.rock, param: 0.7, rough: 0.8 });
    const rockDark = amat('#302d3a', { pat: APAT.rock, param: 1.1, rough: 0.9 });
    const stone = amat('#5d5a66', { pat: APAT.ashlar, param: 0.35, rough: 0.85 });
    const wood = amat('#4a3624', { pat: APAT.wood, param: 0.2, rough: 0.8 });
    const iron = amat('#2c2a2a', { pat: APAT.iron, rough: 0.5, metal: 0.8 });
    const lantern = amat('#ffb45e', { pat: APAT.emissive, param: 6 });
    const sky = amat('#cfe2ff', { pat: APAT.emissive, param: 14 });
    const palette = ['#4f8dff', '#8a5cff', '#3fe0e8', '#b36bff', '#5fb0ff', '#ff6bd0'];
    const crystal = (hex, glow = 2.1) => amat(hex, { pat: APAT.crystal, param: glow, rough: 0.1 });
    const noise = (x, y, z) => Math.sin(x * 0.7 + y * 0.3) * Math.sin(z * 0.6 - y * 0.4) + 0.5 * Math.sin(x * 1.9 + z * 1.3) * Math.sin(y * 1.1);

    // --- Floor and the cave dome ----------------------------------------------------
    const floorG = new THREE.CircleGeometry(CAVE_R + 1, 72, 0, Math.PI * 2);
    B.add(floorG, rock, null, { matrix: place(0, 0, 0, -Math.PI / 2, 0, 0), uvFn: (p) => [p.x, p.y] });
    floorG.dispose();
    const rings = [];
    for (let j = 0; j <= 26; j++) {
      const v = j / 26;
      const ang = v * Math.PI * 0.5;
      const ring = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const r0 = CAVE_R * Math.cos(ang) + 0.001;
        const y0 = CAVE_H * Math.sin(ang) - 0.3;
        const x0 = Math.sin(a) * r0;
        const z0 = Math.cos(a) * r0;
        const d = noise(x0 * 0.35, y0 * 0.35, z0 * 0.35) * 2.2 + noise(x0 * 1.1, y0 * 1.1, z0 * 1.1) * 0.6;
        const k = 1 + d / CAVE_R;
        ring.push(new THREE.Vector3(x0 * k, y0 + d * 0.5 * Math.sin(ang), z0 * k));
      }
      rings.push(ring);
    }
    B.grid(rings, rock, null, { closed: false, outward: (p) => new THREE.Vector3(-p.x, -p.y * 0.4, -p.z) });
    // The crack in the roof and its light.
    const hole = new THREE.CircleGeometry(1.7, 18);
    B.add(hole, sky, null, { matrix: place(HOLE.x, HOLE.y + 0.4, HOLE.z, Math.PI / 2, 0, 0) });
    hole.dispose();

    // --- The pillar and its stair ---------------------------------------------------
    {
      const rows = [];
      for (let j = 0; j <= 30; j++) {
        const y = (j / 30) * (CAVE_H + 1) - 0.3;
        const ring = [];
        for (let i = 0; i <= 32; i++) {
          const a = (i / 32) * Math.PI * 2;
          const r = pillarR(y) + noise(Math.sin(a) * 3, y * 0.5, Math.cos(a) * 3) * 0.35;
          ring.push(new THREE.Vector3(PILLAR.x + Math.sin(a) * r, y, PILLAR.z + Math.cos(a) * r));
        }
        rows.push(ring);
      }
      B.grid(rows, rockDark, null, { closed: false, outward: (p) => new THREE.Vector3(p.x - PILLAR.x, 0, p.z - PILLAR.z) });
      // Steps spiralling up, cantilevered from the rock; a few fallen away.
      const turns = 2.4;
      const n = 70;
      for (let k = 0; k < n; k++) {
        if (k % 17 === 9 || k % 23 === 14) continue;
        const t = k / n;
        const a = Math.PI * 0.2 + t * turns * Math.PI * 2;
        const y = 2.3 + t * 18;
        const r0 = pillarR(y) - 0.1;
        const w = 2.2;
        const rc = r0 + w / 2;
        B.box(w, 0.28, 0.95, stone, place(PILLAR.x + Math.sin(a) * rc, y, PILLAR.z + Math.cos(a) * rc, 0, a + Math.PI / 2, 0));
        // A post every few steps.
        if (k % 4 === 0) B.box(0.14, 0.9, 0.14, wood, place(PILLAR.x + Math.sin(a) * (r0 + w - 0.1), y + 0.55, PILLAR.z + Math.cos(a) * (r0 + w - 0.1)));
      }
      // A rope rail along the posts.
      const rail = [];
      for (let k = 0; k <= 60; k++) {
        const t = k / 60;
        const a = Math.PI * 0.2 + t * turns * Math.PI * 2;
        const y = 2.3 + t * 18 + 1.0;
        const r = pillarR(y - 1) - 0.1 + 2.1;
        rail.push(new THREE.Vector3(PILLAR.x + Math.sin(a) * r, y, PILLAR.z + Math.cos(a) * r));
      }
      const rg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rail), 240, 0.025, 4, false);
      B.add(rg, wood, null, {});
      rg.dispose();
    }

    // --- Stalactites and stalagmites ------------------------------------------------
    for (let k = 0; k < 46; k++) {
      const a = rnd() * Math.PI * 2;
      const r = 3 + rnd() * (CAVE_R - 6);
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (Math.hypot(x - PILLAR.x, z - PILLAR.z) < 6) continue;
      const ang = Math.acos(Math.min(1, r / CAVE_R));
      const y = CAVE_H * Math.sin(ang) - 0.5;
      const len = 1.5 + rnd() * 4.5;
      const g = new THREE.ConeGeometry(0.2 + len * 0.1, len, 7);
      B.add(g, rock, null, { matrix: place(x, y - len / 2, z, Math.PI, rnd() * 3, 0) });
      g.dispose();
    }
    for (let k = 0; k < 30; k++) {
      const a = rnd() * Math.PI * 2;
      const r = FLOOR_R + 1 + rnd() * 5;
      const len = 0.8 + rnd() * 3.5;
      const g = new THREE.ConeGeometry(0.3 + len * 0.15, len, 7);
      B.add(g, rock, null, { matrix: place(Math.sin(a) * r, len / 2 - 0.1, Math.cos(a) * r, 0, rnd() * 3, 0) });
      g.dispose();
    }

    // --- Crystal clusters -------------------------------------------------------------
    const cluster = (x, y, z, n, size, dirUp = 1, hexes = palette, glow = 1.6) => {
      const hex = hexes[Math.floor(rnd() * hexes.length)];
      const m = crystal(hex, glow * (0.7 + rnd() * 0.6));
      for (let k = 0; k < n; k++) {
        const s = size * (0.35 + rnd() * 0.75);
        const tilt = (rnd() - 0.5) * 1.2;
        const tilt2 = (rnd() - 0.5) * 1.2;
        const off = size * 0.5;
        const mtx = place(x + (rnd() - 0.5) * off, y, z + (rnd() - 0.5) * off, dirUp > 0 ? tilt : Math.PI + tilt, rnd() * 6, tilt2);
        B.crystal(s * 0.22, s, m, mtx, 6, 0.3);
      }
    };
    // Big clusters about the floor's edge.
    this.bigCrystals = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + rnd() * 0.3;
      const r = FLOOR_R + 0.8 + rnd() * 2.5;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      const size = 1.6 + rnd() * 2.2;
      cluster(x, 0, z, 5 + Math.floor(rnd() * 6), size);
      if (size > 3) this.bigCrystals.push(new THREE.Vector3(x, size * 0.4, z));
    }
    // A few inside the arena for cover and colour.
    for (const [x, z, s] of [[-9, 6, 1.7], [10.5, 3, 1.5], [-6, -12, 1.8], [8, -11, 1.4]]) {
      cluster(x, 0, z, 6, s);
      this.solids.push([x, z, s * 0.45]);
    }
    // Round the pillar's foot and up its flanks.
    for (let k = 0; k < 10; k++) {
      const a = rnd() * Math.PI * 2;
      const y = rnd() < 0.5 ? 0 : 3 + rnd() * 14;
      const r = pillarR(y) + 0.1;
      cluster(PILLAR.x + Math.sin(a) * r, y, PILLAR.z + Math.cos(a) * r, 4, 0.9 + rnd() * 0.9);
    }
    // Hanging from the roof.
    for (let k = 0; k < 18; k++) {
      const a = rnd() * Math.PI * 2;
      const r = 5 + rnd() * 13;
      const ang = Math.acos(Math.min(1, r / CAVE_R));
      cluster(Math.sin(a) * r, CAVE_H * Math.sin(ang) - 0.6, Math.cos(a) * r, 5, 1.4 + rnd(), -1);
    }
    // On the walls.
    for (let k = 0; k < 20; k++) {
      const a = rnd() * Math.PI * 2;
      const y = 2 + rnd() * 12;
      const ang = Math.asin(Math.min(1, y / CAVE_H));
      const r = CAVE_R * Math.cos(ang) - 0.6;
      cluster(Math.sin(a) * r, y, Math.cos(a) * r, 4, 1.0 + rnd() * 1.2);
    }

    // --- Miners' scaffolding on the east wall, a cart on rails -----------------------
    {
      const x0 = 17.5;
      for (const z of [-5, -1.5, 2, 5.5]) {
        for (const x of [x0, x0 + 2.2]) B.box(0.28, 10.5, 0.28, wood, place(x, 5.25, z));
      }
      for (const y of [3.8, 7.6]) {
        B.box(2.6, 0.18, 11.2, wood, place(x0 + 1.1, y, 0.25));
        for (const z of [-5, -1.5, 2, 5.5]) B.box(2.4, 0.2, 0.2, wood, place(x0 + 1.1, y - 0.2, z));
        B.box(0.08, 0.08, 11, wood, place(x0 - 0.1, y + 1.0, 0.25));
      }
      for (let k = 0; k < 3; k++) {
        const z = -5 + k * 3.5;
        B.box(0.16, 5.4, 0.16, wood, place(x0, 1.9, z + 1.75, 0.8, 0, 0));
        B.box(0.16, 5.4, 0.16, wood, place(x0, 5.7, z + 1.75, -0.8, 0, 0));
      }
      // Ladder.
      B.box(0.1, 4, 0.1, wood, place(x0 - 0.5, 2, -3.1));
      B.box(0.1, 4, 0.1, wood, place(x0 - 0.5, 2, -2.5));
      for (let y = 0.3; y < 3.9; y += 0.4) B.box(0.08, 0.06, 0.6, wood, place(x0 - 0.5, y, -2.8));
      // Lanterns on the posts.
      this.lanterns = [];
      for (const [x, y, z] of [[x0 - 0.2, 3.2, -1.5], [x0 - 0.2, 7.0, 2], [x0 - 0.2, 3.2, 5.5]]) {
        B.box(0.28, 0.4, 0.28, iron, place(x, y, z));
        B.box(0.2, 0.3, 0.2, lantern, place(x, y, z));
        this.lanterns.push(new THREE.Vector3(x, y, z));
      }
      // Rails curving into a tunnel, a cart left on them.
      const railPts = (off) => {
        const pts = [];
        for (let k = 0; k <= 30; k++) {
          const t = k / 30;
          const a = -0.3 + t * 1.2;
          const r = 15.8 + off;
          pts.push(new THREE.Vector3(Math.cos(a) * r, 0.06, Math.sin(a) * r * 0.9 - 2));
        }
        return pts;
      };
      for (const off of [-0.5, 0.5]) {
        const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts(off)), 60, 0.05, 4, false);
        B.add(g, iron, null, {});
        g.dispose();
      }
      for (let k = 0; k < 30; k++) {
        const t = k / 30;
        const a = -0.3 + t * 1.2;
        B.box(1.4, 0.08, 0.22, wood, place(Math.cos(a) * 15.8, 0.02, Math.sin(a) * 15.8 * 0.9 - 2, 0, -a, 0));
      }
      const ca = 0.3;
      const cx = Math.cos(ca) * 15.8;
      const cz = Math.sin(ca) * 15.8 * 0.9 - 2;
      B.box(1.2, 0.8, 1.7, iron, place(cx, 0.75, cz, 0, -ca, 0));
      for (const o of [-0.6, 0.6]) {
        for (const w of [-0.45, 0.45]) B.cylinder(0.22, 0.22, 0.1, iron, place(cx + o * Math.cos(-ca + Math.PI / 2) + w, 0.25, cz + o * Math.sin(-ca + Math.PI / 2), 0, 0, Math.PI / 2), 10);
      }
      for (let k = 0; k < 6; k++) B.box(0.3, 0.25, 0.3, crystal(palette[k % 3], 1.2), place(cx + (rnd() - 0.5) * 0.7, 1.25, cz + (rnd() - 0.5) * 1.1, rnd(), rnd(), rnd()));
      this.solids.push([cx, cz, 1.1]);
    }

    // --- Rubble and fallen shards across the floor ---------------------------------------
    for (let k = 0; k < 90; k++) {
      const a = rnd() * Math.PI * 2;
      const r = 2 + Math.sqrt(rnd()) * (FLOOR_R + 3);
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (Math.hypot(x - PILLAR.x, z - PILLAR.z) < PILLAR_R + 0.3) continue;
      const s = 0.12 + rnd() * rnd() * 0.7;
      const g = new THREE.DodecahedronGeometry(s, 0);
      B.add(g, rnd() < 0.5 ? rock : rockDark, null, { matrix: place(x, s * 0.35, z, rnd() * 3, rnd() * 3, rnd() * 3, 1 + rnd() * 0.6, 0.6 + rnd() * 0.4, 1 + rnd() * 0.5) });
      g.dispose();
    }
    for (let k = 0; k < 45; k++) {
      const a = rnd() * Math.PI * 2;
      const r = 1.5 + Math.sqrt(rnd()) * FLOOR_R;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (Math.hypot(x - PILLAR.x, z - PILLAR.z) < PILLAR_R + 0.3) continue;
      const s = 0.15 + rnd() * 0.35;
      B.crystal(s * 0.25, s, crystal(palette[Math.floor(rnd() * palette.length)], 1.4), place(x, 0, z, (rnd() - 0.5) * 2.4, rnd() * 6, (rnd() - 0.5) * 2.4), 6, 0.3);
    }

    // --- The glowing pool and its waterfall ---------------------------------------------
    B.lathe([[4.6, 0.25], [4.2, 0.05], [3.8, -0.2], [0.001, -0.25]], rockDark, place(POOL.x, 0, POOL.z), 24);
    this.solids.push([POOL.x, POOL.z, 3.6]);

    this.arenaMat = this.makeMaterial();
    this.group.add(B.mesh(this.arenaMat));

    const pm = new THREE.ShaderMaterial({
      uniforms: { ...this.shared },
      vertexShader: 'varying vec3 vWorld; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: poolFrag,
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const pg = new THREE.CircleGeometry(4.1, 40);
    pg.rotateX(-Math.PI / 2);
    const pool = new THREE.Mesh(pg, pm);
    pool.position.set(POOL.x, 0.1, POOL.z);
    this.group.add(pool);
    const fm = new THREE.ShaderMaterial({
      uniforms: { uTime: this.shared.uTime },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }',
      fragmentShader: fallFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 13, 1, 8), fm);
    const fa = Math.atan2(POOL.x, POOL.z);
    fall.position.set(POOL.x + Math.sin(fa) * 3.3, 6.4, POOL.z + Math.cos(fa) * 3.3);
    fall.rotation.y = fa;
    fall.renderOrder = 27;
    this.group.add(fall);
    this.fallBase = new THREE.Vector3(fall.position.x, 0.2, fall.position.z);
  }

  enter(restart = false) {
    if (!restart) this.boss.startIntro();
  }

  introEvents(t, hud) {
    if (t > 0.6 && !this.saidTitle) {
      this.saidTitle = true;
      hud.card('The Crystal Caves', 'The deep glows where something sleeps', 3.6);
    }
    if (t < 0.1) this.saidTitle = false;
  }

  update(dt, time) {
    const fx = this.fx;
    const rnd = this.rand;
    const cam = this.g.rig.camera;
    // The shaft of daylight from the roof.
    this.lightDir.subVectors(HOLE, cam.position).normalize();
    this.shared.uSunDisc.value.copy(this.lightDir);
    const L = this.lights;
    const b0 = this.bigCrystals[0] || new THREE.Vector3(-12, 2, 8);
    const b1 = this.bigCrystals[1] || new THREE.Vector3(12, 2, -8);
    const pulse = (k) => 0.85 + 0.15 * Math.sin(time * 1.3 + k * 2);
    L.set(1, b0.x * 0.8, 2.2, b0.z * 0.8, 17, 1.2 * pulse(1), 1.8 * pulse(1), 4.2 * pulse(1));
    L.set(2, b1.x * 0.8, 2.2, b1.z * 0.8, 17, 2.6 * pulse(2), 1.2 * pulse(2), 4.4 * pulse(2));
    // Spores drifting in the glow.
    this.sporeT += dt;
    while (this.sporeT > 0.05) {
      this.sporeT -= 0.05;
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 18;
      const c = rnd() < 0.5 ? [0.4, 0.9, 1.6, 1] : [0.9, 0.5, 1.6, 1];
      fx.add.emit(Math.sin(a) * r, 0.5 + rnd() * 12, Math.cos(a) * r, { vel: [(rnd() - 0.5) * 0.12, 0.05 + rnd() * 0.08, (rnd() - 0.5) * 0.12], life: 6, size: [0.04, 0.04], color: c, color1: [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5, 0], drag: 0.1, kind: PK.ember });
    }
    // Mist from the waterfall's foot, drops in the shaft of light.
    if (rnd() < dt * 8) fx.smoke.emit(this.fallBase.x + (rnd() - 0.5) * 2, 0.3, this.fallBase.z + (rnd() - 0.5) * 2, { vel: [(rnd() - 0.5) * 0.6, 0.5, (rnd() - 0.5) * 0.6], life: 3, size: [0.6, 2.2], color: [0.5, 0.7, 1.0, 0.18], color1: [0.4, 0.6, 0.9, 0], drag: 1, kind: PK.smoke });
    if (rnd() < dt * 3) fx.smoke.emit(HOLE.x + (rnd() - 0.5) * 3, HOLE.y - 2 - rnd() * 6, HOLE.z + (rnd() - 0.5) * 3, { vel: [0, -0.2, 0], life: 8, size: [2, 4], color: [0.6, 0.7, 0.9, 0.06], color1: [0.5, 0.6, 0.8, 0], drag: 0.2, kind: PK.smoke });
  }

  onPhase2() {
    this.arenaMat.uniforms.uGlowPulse.value = 1;
  }
}
