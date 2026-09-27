import * as THREE from 'three';
import { Stage } from '../stage.js';
import { ArenaBuilder, amat, APAT, makeArenaMaterial, place, gearShape } from '../arenamat.js';
import { clampCircle, pushOutCircle, cameraInCircle } from '../ground.js';
import { PK } from '../vfx.js';
import { mulberry32 } from '../noise.js';
import { Colossus } from './colossus.js';

// ---------------------------------------------------------------------------
// The Clockwork Forge. A round foundry hall of brick and riveted iron: a
// grating over a glowing pit at its heart, molten metal running in channels
// across the floor, a furnace roaring at the far wall, a crucible pouring,
// and all round the walls great gears turning, pipes hissing, gauges
// trembling. The brass giant that works it has noticed the intruder.
// ---------------------------------------------------------------------------

export const FLOOR_R = 15.3; // walkable
const WALL_R = 20;
const WALL_H = 16;
const PIT_R = 4.6;
const FURNACE = new THREE.Vector3(0, 3, -WALL_R + 1.2);

export class ForgeStage extends Stage {
  constructor(game, manager) {
    super(game, manager);
    this.id = 'forge';
    this.title = 'The Clockwork Forge';
    this.spawn = { x: 0, z: 11.5, yaw: Math.PI };
    this.camDist = 2.4;
    this.pitchBias = -0.12;
    this.camClose = 3.2;
    this.tiltClose = 0.1;
    this.lighting = {
      sunDir: [0.05, 0.35, -0.94],
      lightDir: [0, 0.12, -1],
      sun: [2.3, 1.25, 0.55],
      ambSky: [0.09, 0.12, 0.2],
      ambGround: [0.1, 0.05, 0.025],
      fog: [0.05, 0.045, 0.05],
      fogSun: [0.75, 0.36, 0.12],
      fogDensity: 0.013,
      fogFalloff: 0.05,
      mist: [0.0, 1],
      envSky: [0.22, 0.2, 0.22],
      envGround: [0.3, 0.12, 0.04],
      rays: 0.35,
      flare: 0.25,
      bloom: 0.1,
      key: 0.17,
      range: [0.1, 6],
      wind: 0.25,
    };
    const self = this;
    const solids = [];
    this.solids = solids;
    this.floor = {
      height: () => 0,
      clamp(pos, vel) {
        clampCircle(pos, vel, 0, 0, FLOOR_R);
        for (const [x, z, r] of solids) pushOutCircle(pos, vel, x, z, r + 0.35);
        self.boss?.clampPlayer?.(pos, vel);
      },
      camera(aim, pos) {
        cameraInCircle(aim, pos, 0, 0, WALL_R - 1.2, []);
        pos.y = Math.min(pos.y, WALL_H - 2);
      },
    };
    this.intro = {
      dur: 10,
      keys: [
        { t: 0, pos: [-14, 12, 8], look: [6, 6, -12], fov: 55 },
        { t: 2.8, pos: [10, 9, 6], look: [-4, 5, -14], fov: 52 },
        { t: 5.0, pos: [5, 3.5, 7], look: [0, 4.5, -2], fov: 48 },
        { t: 7.8, pos: [-2.5, 2.2, 6], look: [0, 6.5, -2], fov: 52 },
        { t: 10, pos: [1.2, 3.4, 16.5], look: [0, 4, 4], fov: 48 },
      ],
    };
    this.preview = { pos: [4.5, 2.4, 12.5], look: [-0.5, 5.2, -3], fov: 52 };
    this.rand = mulberry32(77);
    this.gears = [];
    this.needles = [];
    this.vents = [];
    this.ventT = 0;
  }

  makeBoss() {
    return new Colossus(this.g, this);
  }

  makeMaterial() {
    return makeArenaMaterial(this.shared, { floorY: 0, grateGlow: [2.4, 0.72, 0.16] });
  }

  onImpact(x, z, s) {
    this.dust(x, z, 0.5 + s);
  }

  // Grit and sparks thrown up where something heavy lands.
  dust(x, z, s = 1) {
    const fx = this.fx;
    fx.smoke.burst(x, 0.3, z, Math.round(5 + s * 7), { vel: [0, 1.2 * s, 0], scatter: 2 * s, scatterY: 0.4, life: 1.4, size: [0.5 * s, 1.8 * s], color: [0.5, 0.42, 0.36, 0.5], color1: [0.35, 0.3, 0.28, 0], drag: 2.2, gravity: -0.2, kind: PK.smoke }, 0.6 * s);
    fx.add.burst(x, 0.2, z, Math.round(8 + s * 12), { vel: [0, 4 * s, 0], scatter: 3 * s, scatterY: 0.5, life: 0.6, size: [0.05, 0.02], color: [4, 1.8, 0.5, 1], color1: [1.5, 0.3, 0.05, 0], gravity: 9.8, drag: 0.8, kind: PK.ember, bounce: 0.3 }, 0.4);
  }

  sparks(p, dir, n = 20, s = 1) {
    this.fx.add.burst(p.x, p.y, p.z, n, { vel: [dir.x * 5 * s, dir.y * 5 * s + 2, dir.z * 5 * s], scatter: 3 * s, life: 0.55, size: [0.05, 0.02], color: [5, 2.4, 0.7, 1], color1: [2, 0.4, 0.06, 0], gravity: 9.8, drag: 0.6, kind: PK.ember, bounce: 0.35 }, 0.1);
  }

  steamPuff(p, dir, s = 1) {
    this.fx.smoke.burst(p.x, p.y, p.z, Math.round(4 + 5 * s), { vel: [dir.x * 3 * s, dir.y * 3 * s + 0.6, dir.z * 3 * s], scatter: 0.6 * s, life: 1.6, size: [0.3 * s, 2.2 * s], color: [0.95, 0.92, 0.9, 0.45], color1: [0.85, 0.82, 0.8, 0], drag: 1.6, gravity: -0.5, kind: PK.smoke }, 0.15);
  }

  build() {
    const B = new ArenaBuilder();
    const rnd = mulberry32(13);
    const brick = amat('#6b3a28', { pat: APAT.ashlar, param: 0.26, rough: 0.9 });
    const stone = amat('#5d5550', { pat: APAT.flags, param: 1.5, rough: 0.85 });
    const iron = amat('#3a3634', { pat: APAT.iron, rough: 0.55, metal: 0.8 });
    const darkIron = amat('#1f1d1c', { pat: APAT.iron, rough: 0.6, metal: 0.7 });
    const brass = amat('#b88a3e', { pat: APAT.brass, rough: 0.32, metal: 1 });
    const copper = amat('#a0583a', { pat: APAT.brass, rough: 0.35, metal: 1 });
    const grate = amat('#2b2826', { pat: APAT.grate, param: 0.32, rough: 0.5, metal: 0.8 });
    const lava = amat('#ffffff', { pat: APAT.lava, param: 5.5, rough: 0.6 });
    const glow = amat('#ffb070', { pat: APAT.emissive, param: 9, rough: 0.5 });
    const wood = amat('#4a3322', { pat: APAT.wood, param: 0.22 });
    const coal = amat('#141212', { pat: APAT.rock, param: 0.2, rough: 0.9 });
    const gauge = amat('#e9dfc4', { rough: 0.3 });
    const glass = amat('#a8c8d0', { rough: 0.05, metal: 0.3 });

    // --- Floor: grating over the pit, iron plates, a stone apron by the walls -------------
    const disc = new THREE.CircleGeometry(PIT_R, 48);
    B.add(disc, grate, null, { matrix: place(0, 0, 0, -Math.PI / 2, 0, 0), uvFn: (p) => [p.x, p.y] });
    disc.dispose();
    B.torus(PIT_R + 0.1, 0.18, brass, place(0, 0.03, 0, Math.PI / 2, 0, 0), 8, 64);
    const ring = new THREE.RingGeometry(PIT_R + 0.2, FLOOR_R + 0.8, 64, 6);
    B.add(ring, iron, null, { matrix: place(0, 0, 0, -Math.PI / 2, 0, 0), uvFn: (p) => [p.x, p.y] });
    ring.dispose();
    const apron = new THREE.RingGeometry(FLOOR_R + 0.8, WALL_R + 0.2, 64, 2);
    B.add(apron, stone, null, { matrix: place(0, 0.02, 0, -Math.PI / 2, 0, 0), uvFn: (p) => [p.x, p.y] });
    apron.dispose();
    // Riveted seams radiating out across the plates.
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const r0 = PIT_R + 0.4;
      const len = FLOOR_R + 0.5 - r0;
      B.box(0.12, 0.04, len, darkIron, place(Math.sin(a) * (r0 + len / 2), 0.01, Math.cos(a) * (r0 + len / 2), 0, a, 0));
    }
    // Two molten channels from the furnace into the pit.
    this.channels = [];
    for (const s of [-1, 1]) {
      const x = s * 2.2;
      const z0 = -WALL_R + 2;
      const z1 = -PIT_R + 0.4;
      const len = z1 - z0;
      B.box(0.9, 0.06, len, lava, place(x, -0.005, (z0 + z1) / 2));
      B.box(0.25, 0.22, len, darkIron, place(x - 0.58, 0.05, (z0 + z1) / 2));
      B.box(0.25, 0.22, len, darkIron, place(x + 0.58, 0.05, (z0 + z1) / 2));
      this.channels.push({ x, z0, z1 });
    }

    // --- The wall: brick drum, iron buttresses and bands -----------------------------------
    const rings = [];
    for (let j = 0; j <= 12; j++) {
      const y = (j / 12) * WALL_H;
      const r = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        r.push(new THREE.Vector3(Math.sin(a) * WALL_R, y, Math.cos(a) * WALL_R));
      }
      rings.push(r);
    }
    B.grid(rings, brick, null, { closed: false, outward: (p) => new THREE.Vector3(-p.x, 0, -p.z) });
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + 0.1;
      B.box(1.0, WALL_H, 0.7, iron, place(Math.sin(a) * (WALL_R - 0.3), WALL_H / 2, Math.cos(a) * (WALL_R - 0.3), 0, a, 0));
      // Rivets up the buttress.
      for (let y = 0.6; y < WALL_H; y += 0.9) {
        for (const o of [-0.35, 0.35]) {
          const g = new THREE.SphereGeometry(0.05, 6, 4);
          B.add(g, darkIron, null, { matrix: place(Math.sin(a) * (WALL_R - 0.66) + Math.cos(a) * o, y, Math.cos(a) * (WALL_R - 0.66) - Math.sin(a) * o) });
          g.dispose();
        }
      }
    }
    for (const y of [0.5, 7.2, 12.5]) B.torus(WALL_R - 0.35, 0.15, iron, place(0, y, 0, Math.PI / 2, 0, 0), 6, 96);

    // --- Roof: a cone of iron and soot on radial trusses; a hood over the pit ------------
    B.lathe([[WALL_R + 0.2, 0], [WALL_R * 0.6, 4], [5, 7.5], [3, 8.2], [0.001, 8.3]], darkIron, place(0, WALL_H, 0), 48);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const pts = [new THREE.Vector3(Math.sin(a) * (WALL_R - 0.5), WALL_H - 0.2, Math.cos(a) * (WALL_R - 0.5)), new THREE.Vector3(Math.sin(a) * 4, WALL_H + 5.5, Math.cos(a) * 4)];
      const g = new THREE.TubeGeometry(new THREE.LineCurve3(pts[0], pts[1]), 1, 0.25, 4, false);
      B.add(g, iron, null, {});
      g.dispose();
    }
    B.lathe([[3.2, 0], [1.6, 3.5], [1.2, 9]], darkIron, place(0, 11.5, 0), 24);
    B.torus(3.2, 0.2, brass, place(0, 11.5, 0, Math.PI / 2, 0, 0), 6, 48);

    // --- The furnace --------------------------------------------------------------------
    {
      const fz = -WALL_R + 0.5;
      B.box(11, 10, 3, brick, place(0, 5, fz));
      // The mouth: a deep arch glowing white-hot within.
      const mouth = new THREE.Shape();
      mouth.moveTo(-3, 0);
      mouth.lineTo(3, 0);
      mouth.lineTo(3, 2.6);
      mouth.absarc(0, 2.6, 3, 0, Math.PI, false);
      mouth.lineTo(-3, 0);
      const mg = new THREE.ShapeGeometry(mouth, 16);
      B.add(mg, glow, null, { matrix: place(0, 0.05, fz + 1.52) });
      mg.dispose();
      for (let k = 0; k < 7; k++) {
        const x = -2.7 + k * 0.9;
        B.box(0.12, 5.4, 0.12, darkIron, place(x, 2.7, fz + 1.7));
      }
      B.torus(3.1, 0.3, iron, place(0, 2.6, fz + 1.65, 0, 0, 0), 8, 32, Math.PI);
      B.box(0.6, 2.6, 0.6, iron, place(-3.1, 1.3, fz + 1.65));
      B.box(0.6, 2.6, 0.6, iron, place(3.1, 1.3, fz + 1.65));
      // Hood and chimney.
      B.lathe([[6.5, 0], [4.5, 2], [2.2, 3.5], [1.8, 12]], iron, place(0, 10, fz + 0.4, 0, 0, 0), 24);
      // Bellows either side.
      for (const s of [-1, 1]) {
        B.box(1.8, 0.2, 2.6, wood, place(s * 7.2, 1.2, fz + 2.4, 0.25, 0, 0));
        B.box(1.8, 0.2, 2.6, wood, place(s * 7.2, 0.4, fz + 2.4, -0.05, 0, 0));
        B.cylinder(0.25, 0.4, 1.6, brass, place(s * 5.8, 0.8, fz + 2.2, 0, 0, Math.PI / 2), 10);
      }
      // A heap of coal before the fire.
      for (let k = 0; k < 40; k++) {
        const x = (rnd() - 0.5) * 7;
        const z = fz + 3.4 + rnd() * 1.6;
        const s = 0.2 + rnd() * 0.3;
        B.box(s, s * 0.8, s, coal, place(x, s * 0.3, z, rnd() * 3, rnd() * 3, rnd() * 3));
      }
      this.furnaceZ = fz;
    }

    // --- Pipes, flanges, valves, gauges round the walls ---------------------------------
    const arcPipe = (r, y, a0, a1, rad, m) => {
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const a = a0 + ((a1 - a0) * i) / 40;
        pts.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r));
      }
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, rad, 10, false);
      B.add(g, m, null, { uvFn: (p, u, v) => [u * 60, v * rad * 6] });
      g.dispose();
      for (let i = 0; i <= 8; i++) {
        const a = a0 + ((a1 - a0) * i) / 8;
        B.torus(rad * 1.35, rad * 0.35, iron, place(Math.sin(a) * r, y, Math.cos(a) * r, 0, a + Math.PI / 2, 0), 6, 16);
      }
    };
    arcPipe(WALL_R - 0.9, 3.2, 0.5, 2.6, 0.35, copper);
    arcPipe(WALL_R - 0.9, 3.2, -2.6, -0.5, 0.35, copper);
    arcPipe(WALL_R - 1.2, 5.6, 0.7, 5.6, 0.25, brass);
    arcPipe(WALL_R - 0.8, 9.5, -2.9, 2.9, 0.45, darkIron);
    for (const a of [0.9, 1.7, 2.3, -0.9, -1.6, -2.2, 3.3, 4.0]) {
      const x = Math.sin(a) * (WALL_R - 0.9);
      const z = Math.cos(a) * (WALL_R - 0.9);
      B.cylinder(0.22, 0.22, 7, brass, place(x, 3.5, z), 10);
      // Valve wheel.
      B.torus(0.4, 0.05, iron, place(x - Math.sin(a) * 0.3, 2.2, z - Math.cos(a) * 0.3, 0, a, 0), 6, 18);
      for (let k = 0; k < 4; k++) B.box(0.8, 0.04, 0.04, iron, place(x - Math.sin(a) * 0.3, 2.2, z - Math.cos(a) * 0.3, 0, a, (k * Math.PI) / 4));
      this.vents.push({ p: new THREE.Vector3(x - Math.sin(a) * 0.35, 5.6, z - Math.cos(a) * 0.35), dir: new THREE.Vector3(-Math.sin(a), 0.3, -Math.cos(a)).normalize(), t: rnd() * 5 });
    }
    // Pressure gauges with trembling needles.
    for (const a of [1.2, -1.25, 2.9, -2.95, 0.3, -0.3]) {
      const r = WALL_R - 1.05;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      B.cylinder(0.42, 0.42, 0.14, brass, place(x, 4.4, z, Math.PI / 2, a, 0), 20);
      const face = new THREE.CircleGeometry(0.36, 24);
      B.add(face, gauge, null, { matrix: place(x - Math.sin(a) * 0.08, 4.4, z - Math.cos(a) * 0.08, 0, a + Math.PI, 0) });
      face.dispose();
      const cover = new THREE.CircleGeometry(0.37, 24);
      B.add(cover, glass, null, { matrix: place(x - Math.sin(a) * 0.1, 4.4, z - Math.cos(a) * 0.1, 0, a + Math.PI, 0) });
      cover.dispose();
      this.needles.push({ x: x - Math.sin(a) * 0.09, z: z - Math.cos(a) * 0.09, a, ph: rnd() * 6 });
    }

    // --- Catwalk round the wall ------------------------------------------------------
    {
      const cw = new THREE.RingGeometry(WALL_R - 2.2, WALL_R - 0.4, 96, 1);
      B.add(cw, grate, null, { matrix: place(0, 7.0, 0, -Math.PI / 2, 0, 0), uvFn: (p) => [p.x, p.y] });
      cw.dispose();
      const cw2 = new THREE.RingGeometry(WALL_R - 2.2, WALL_R - 0.4, 96, 1);
      B.add(cw2, darkIron, null, { matrix: place(0, 6.96, 0, Math.PI / 2, 0, 0), uvFn: (p) => [p.x, p.y] });
      cw2.dispose();
      B.torus(WALL_R - 2.2, 0.05, iron, place(0, 8.1, 0, Math.PI / 2, 0, 0), 6, 128);
      B.torus(WALL_R - 2.2, 0.04, iron, place(0, 7.6, 0, Math.PI / 2, 0, 0), 6, 128);
      for (let k = 0; k < 48; k++) {
        const a = (k / 48) * Math.PI * 2;
        B.box(0.06, 1.1, 0.06, iron, place(Math.sin(a) * (WALL_R - 2.2), 7.55, Math.cos(a) * (WALL_R - 2.2)));
        if (k % 4 === 0) {
          const pts = [new THREE.Vector3(Math.sin(a) * (WALL_R - 2.1), 6.95, Math.cos(a) * (WALL_R - 2.1)), new THREE.Vector3(Math.sin(a) * (WALL_R - 0.4), 5.4, Math.cos(a) * (WALL_R - 0.4))];
          const g = new THREE.TubeGeometry(new THREE.LineCurve3(pts[0], pts[1]), 1, 0.08, 4, false);
          B.add(g, iron, null, {});
          g.dispose();
        }
      }
    }

    // --- The crucible gantry: a girder, chains, a tilted pot pouring --------------------
    {
      const cx = 10.5;
      const cz = -10;
      B.box(0.6, 0.8, 16, iron, place(cx, 12, cz + 3, 0, 0.3, 0));
      for (const o of [-1, 1]) {
        const top = new THREE.Vector3(cx + o * 0.6, 12, cz);
        const bot = new THREE.Vector3(cx + o * 1.2, 6.4, cz);
        const g = new THREE.TubeGeometry(new THREE.LineCurve3(bot, top), 1, 0.05, 4, false);
        B.add(g, iron, null, {});
        g.dispose();
      }
      B.lathe([[0.001, -1.4], [1.1, -1.3], [1.35, -0.2], [1.45, 1.0], [1.55, 1.1], [1.3, 1.1]], darkIron, place(cx, 5.4, cz, 0, 0, 0.5), 20);
      const lip = new THREE.CircleGeometry(1.3, 20);
      B.add(lip, lava, null, { matrix: place(cx, 5.4, cz, -Math.PI / 2 + 0.5, 0, 0.5) });
      lip.dispose();
      this.pour = { top: new THREE.Vector3(cx - 1.4, 5.8, cz), bottom: new THREE.Vector3(cx - 1.9, 0.2, cz) };
      // The mould it pours into, overflowing into a runnel toward the pit.
      B.box(2.2, 0.6, 2.2, darkIron, place(cx - 1.9, 0.3, cz));
      B.box(1.8, 0.05, 1.8, lava, place(cx - 1.9, 0.62, cz));
      this.solids.push([cx - 1.9, cz, 1.4]);
    }
    const pourG = new THREE.CylinderGeometry(0.16, 0.22, 1, 10, 6, true);
    const pourB = new ArenaBuilder();
    pourB.add(pourG, lava, null, { uvFn: (p, u, v) => [u * 2, v * 6] });
    pourG.dispose();

    // --- Anvils, grinding wheel, barrels, crates, cogs ------------------------------------
    const anvil = (x, z, rot) => {
      const m = place(x, 0, z, 0, rot, 0);
      const part = (w, h, d, px, py, pz, mm = darkIron) => B.box(w, h, d, mm, m.clone().multiply(place(px, py, pz)));
      part(0.9, 0.3, 0.7, 0, 0.15, 0, wood);
      part(0.35, 0.5, 0.35, 0, 0.55, 0);
      part(1.2, 0.3, 0.45, 0, 0.95, 0);
      const horn = new THREE.ConeGeometry(0.2, 0.7, 8);
      B.add(horn, darkIron, null, { matrix: m.clone().multiply(place(0.9, 0.97, 0, 0, 0, -Math.PI / 2)) });
      horn.dispose();
      part(0.08, 0.08, 0.6, -0.2, 1.15, 0.1, wood);
      this.solids.push([x, z, 0.8]);
    };
    anvil(-9.5, -6.5, 0.6);
    anvil(12.4, 4.5, -1.2);
    // The grinding wheel throws sparks.
    const gw = [-12.4, 5.2];
    B.box(1.4, 0.9, 0.8, wood, place(gw[0], 0.45, gw[1], 0, 0.9, 0));
    this.grinder = new THREE.Vector3(gw[0] + 0.1, 1.35, gw[1] + 0.2);
    this.solids.push([gw[0], gw[1], 0.9]);
    for (let k = 0; k < 7; k++) {
      const a = 0.5 + k * 0.85 + rnd() * 0.3;
      const r = FLOOR_R + 1.6 + rnd() * 1.4;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (z < -14) continue;
      if (k % 2) B.cylinder(0.45, 0.45, 1.2, wood, place(x, 0.6, z), 12);
      else B.box(1.1, 1.1, 1.1, wood, place(x, 0.55, z, 0, rnd(), 0));
    }
    for (let k = 0; k < 5; k++) {
      const a = rnd() * Math.PI * 2;
      const r = FLOOR_R + 1.2 + rnd() * 2;
      const g = new THREE.ExtrudeGeometry(gearShape(0.5 + rnd() * 0.5, 10 + Math.floor(rnd() * 8), { spokes: 0 }), { depth: 0.18, bevelEnabled: false });
      B.add(g, brass, null, { matrix: place(Math.sin(a) * r, 0.1 + k * 0.02, Math.cos(a) * r, -Math.PI / 2 + (rnd() - 0.5) * 0.3, rnd() * 6, 0) });
      g.dispose();
    }

    this.arenaMat = this.makeMaterial();
    this.group.add(B.mesh(this.arenaMat));

    // --- Turning gears set into the wall (each its own mesh) ----------------------------
    const addGear = (a, y, r, teeth, speed, m, depthOff = 0) => {
      const G = new ArenaBuilder();
      const g = new THREE.ExtrudeGeometry(gearShape(r, teeth, { spokes: r > 2 ? 6 : 4, tooth: 0.08 }), { depth: 0.5, bevelEnabled: false, curveSegments: 12 });
      G.add(g, m, null, { uvFn: (p) => [p.x, p.y] });
      g.dispose();
      const hub = new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.9, 16);
      G.add(hub, darkIron, null, { matrix: place(0, 0, 0.25, Math.PI / 2, 0, 0) });
      hub.dispose();
      const mesh = G.mesh(this.arenaMat);
      const R = WALL_R - 0.9 - depthOff;
      mesh.position.set(Math.sin(a) * R, y, Math.cos(a) * R);
      mesh.rotation.set(0, a + Math.PI, 0, 'YXZ');
      this.group.add(mesh);
      this.gears.push({ mesh, speed, a });
      return mesh;
    };
    // Meshing pairs: speeds in inverse ratio to their teeth.
    addGear(2.2, 9.5, 4.2, 36, 0.12, brass);
    addGear(2.62, 5.2, 2.2, 18, -0.24, copper, 0.2);
    addGear(-2.3, 8.5, 3.6, 30, -0.15, brass);
    addGear(-1.9, 12.4, 2.0, 16, 0.28, copper, 0.2);
    addGear(1.0, 12.5, 2.4, 20, 0.2, brass);
    addGear(-0.95, 4.2, 1.8, 14, 0.35, darkIron);
    addGear(3.9, 10.2, 5.0, 44, 0.08, darkIron, -0.2);
    addGear(-3.9, 9.8, 4.4, 38, -0.1, brass, -0.2);

    // Gauge needles.
    const needleG = new ArenaBuilder();
    needleG.box(0.03, 0.3, 0.02, amat('#801010', { rough: 0.4 }), place(0, 0.13, 0));
    const needleGeo = needleG.build();
    for (const n of this.needles) {
      const mesh = new THREE.Mesh(needleGeo, this.arenaMat);
      mesh.position.set(n.x, 4.4, n.z);
      mesh.rotation.set(0, n.a + Math.PI, 0, 'YXZ');
      this.group.add(mesh);
      n.mesh = mesh;
    }
    // The molten pour.
    this.pourMesh = pourB.mesh(this.arenaMat);
    this.group.add(this.pourMesh);
    // Chains hanging from the roof, hooks swaying.
    this.chains = [];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.4;
      const r = 8 + (k % 2) * 3;
      const C = new ArenaBuilder();
      const len = 5 + (k % 3) * 1.5;
      for (let i = 0; i < len / 0.24; i++) {
        C.torus(0.1, 0.025, iron, place(0, -i * 0.24, 0, 0, (i % 2) * Math.PI / 2, 0), 4, 10);
      }
      const hook = new THREE.TorusGeometry(0.28, 0.05, 6, 16, Math.PI * 1.4);
      C.add(hook, darkIron, null, { matrix: place(0, -len - 0.3, 0, 0, 0, 0.9) });
      hook.dispose();
      const mesh = C.mesh(this.arenaMat);
      mesh.position.set(Math.sin(a) * r, WALL_H + 2, Math.cos(a) * r);
      this.group.add(mesh);
      this.chains.push({ mesh, ph: rnd() * 6 });
    }
  }

  enter(restart = false) {
    if (!restart) this.boss.startIntro();
    this.overheat = 0;
  }

  introEvents(t, hud) {
    if (t > 0.6 && !this.saidTitle) {
      this.saidTitle = true;
      hud.card('The Clockwork Forge', 'The furnace never sleeps', 3.6);
    }
    if (t < 0.1) this.saidTitle = false;
  }

  onPhase2() {
    this.overheat = 1;
  }

  update(dt, time) {
    const fx = this.fx;
    const rnd = this.rand;
    const L = this.lights;
    const heat = 1 + 0.3 * (this.overheat || 0);
    const fl = 0.85 + 0.15 * Math.sin(time * 9) * Math.sin(time * 5.3 + 1);
    L.set(1, 0, 2.5, this.furnaceZ + 3.5, 26, 7 * fl * heat, 2.6 * fl * heat, 0.7 * fl);
    L.set(2, 0, -0.3, 0, 9, 3.2 * heat, 1.0 * heat, 0.25);
    this.arenaMat.uniforms.uGrateGlow.value.set(2.4 * heat, 0.72 * heat, 0.16 * heat);
    // Gears turn; needles tremble.
    for (const g of this.gears) g.mesh.rotation.z = time * g.speed * heat;
    for (const n of this.needles) n.mesh.rotation.z = -0.6 + Math.sin(time * 0.7 + n.ph) * 0.4 + Math.sin(time * 23 + n.ph) * 0.03 * heat;
    for (const c of this.chains) {
      c.mesh.rotation.x = Math.sin(time * 0.6 + c.ph) * 0.03;
      c.mesh.rotation.z = Math.cos(time * 0.5 + c.ph) * 0.03;
    }
    // The pour: a column of molten metal from the crucible's lip.
    const P = this.pour;
    const len = P.top.distanceTo(P.bottom);
    this.pourMesh.position.lerpVectors(P.top, P.bottom, 0.5);
    this.pourMesh.scale.set(1 + Math.sin(time * 11) * 0.08, len, 1 + Math.cos(time * 13) * 0.08);
    if (rnd() < dt * 12) this.sparks(P.bottom.clone().setY(0.7), new THREE.Vector3(0, 0.8, 0), 3, 0.5);
    // Embers rising through the grating.
    if (rnd() < dt * 25 * heat) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * PIT_R;
      fx.add.emit(Math.cos(a) * r, 0.1, Math.sin(a) * r, { vel: [(rnd() - 0.5) * 0.5, 1.2 + rnd() * 1.6, (rnd() - 0.5) * 0.5], life: 2.5, size: [0.05, 0.02], color: [4, 1.4, 0.3, 1], color1: [1.2, 0.2, 0.02, 0], drag: 0.4, kind: PK.ember });
    }
    // Heat haze and smoke over the pit and under the roof.
    if (rnd() < dt * 3) fx.smoke.emit((rnd() - 0.5) * 6, 1, (rnd() - 0.5) * 6, { vel: [0, 1.2, 0], life: 6, size: [1.5, 4], color: [0.3, 0.25, 0.22, 0.12], color1: [0.2, 0.18, 0.17, 0], drag: 0.3, kind: PK.smoke });
    // Furnace flames licking at the mouth.
    if (rnd() < dt * 30) {
      const x = (rnd() - 0.5) * 5;
      fx.add.emit(x, 0.4 + rnd() * 1.5, this.furnaceZ + 1.9, { vel: [0, 1.5 + rnd(), 0.8], life: 0.7, size: [0.6, 0.2], color: [4, 1.6, 0.4, 1], color1: [1.5, 0.3, 0.05, 0], drag: 1, kind: PK.flame });
    }
    // The grinding wheel.
    if (rnd() < dt * 20) this.sparks(this.grinder, new THREE.Vector3(0.6, 0.3, 0.7).normalize(), 4, 0.7);
    // Vents sigh steam now and then.
    for (const v of this.vents) {
      v.t -= dt;
      if (v.t <= 0) {
        v.t = 3 + rnd() * 6;
        this.steamPuff(v.p, v.dir, 0.8);
        if (this.g.rig.camera.position.distanceTo(v.p) < 16) this.g.audio?.play('steam', { pos: v.p, pitch: 1.2 });
      }
    }
    // Molten channels throw the odd spark.
    for (const c of this.channels) {
      if (rnd() < dt * 4) {
        const z = c.z0 + rnd() * (c.z1 - c.z0);
        this.sparks(new THREE.Vector3(c.x, 0.05, z), new THREE.Vector3(0, 1, 0), 2, 0.4);
      }
    }
  }
}
