import * as THREE from 'three';
import { Boss, vol, clamp, lerp, smooth, easeOut, easeIn, easeInOut, damp, wrapAngle } from '../boss.js';
import { MeshBuilder, mat, profile } from '../meshbuilder.js';
import { PAT } from '../charmat.js';
import { DynamicTube, bezier } from '../tube.js';
import { PK, SHAPE } from '../vfx.js';
import { mulberry32 } from '../noise.js';
import { WATER_Y, edgeZ, PILLARS } from './nave.js';

// ---------------------------------------------------------------------------
// The Maw of the Deep: an anglerfish grown vast in the flooded crypt. A head
// like an overturned boat, an underslung jaw of needle teeth, a lure on a
// stalk that lights the nave, and arms enough to reach anywhere the water
// does. It slams and sweeps with its tentacles, blinds with its lure, lunges
// across the broken floor to bite, and, wounded, spits and sends the flood
// itself rolling down the nave.
// ---------------------------------------------------------------------------

const HOME = new THREE.Vector3(0, 2.5, -14.2);
const HINGE_Z = -2.6;
const TENT_LEN = 10;

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _m = new THREE.Matrix4();
const UP = new THREE.Vector3(0, 1, 0);

// Upper head: half width, top, underside (m), along the head from the neck to the snout.
const UPPER = profile([
  [-3.8, 2.2, 1.7, -2.4],
  [-2.8, 2.7, 2.05, -1.1],
  [-1.5, 2.8, 2.0, -0.45],
  [0.0, 2.65, 1.65, -0.22],
  [1.2, 2.25, 1.15, -0.14],
  [2.1, 1.65, 0.72, -0.09],
  [2.65, 0.95, 0.38, -0.05],
  [2.9, 0.25, 0.12, -0.03],
]);
// Lower jaw (hinge space): half width, depth below the lip, lip height.
const JAW = profile([
  [-0.6, 2.3, 1.3, 0.0],
  [0.6, 2.75, 1.6, 0.04],
  [2.4, 2.8, 1.45, 0.1],
  [4.0, 2.6, 1.15, 0.16],
  [5.4, 2.1, 0.85, 0.2],
  [6.2, 1.3, 0.55, 0.22],
  [6.55, 0.35, 0.28, 0.16],
]);

function spow(x, e) {
  return Math.sign(x) * Math.pow(Math.abs(x), e);
}

export class Maw extends Boss {
  constructor(game, stage) {
    super(game, stage, { name: 'The Maw of the Deep', epithet: 'Warden of the drowned nave', hp: 1700, poise: 280 });
    this.rand = mulberry32(404);
    this.glowBase = new THREE.Vector4(0.45, 1.0, 0.9, 1.0);
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.headGroup = new THREE.Group();
    this.jawGroup = new THREE.Group();
    this.root.add(this.headGroup);
    this.headGroup.add(this.jawGroup);
    this.jawGroup.position.set(0, -0.05, HINGE_Z);
    this.buildHead();
    this.buildFins();
    this.buildLure();
    this.buildTentacles();
    this.head = { pos: HOME.clone(), yaw: 0, pitch: 0, roll: 0, jaw: 0.1, bob: 0 };
    this.lureCharge = 0;
    this.lureRed = 0;
    this.lureWorld = new THREE.Vector3();
    this.lureVel = new THREE.Vector3();
    this.lureLow = 0;
    this.resting = 0;
    this.volHead = vol('head', 2.0, 1.0);
    this.volJaw = vol('jaw', 1.25, 0.8);
    this.volLure = vol('lure', 0.55, 2.2);
    this.volumes.push(this.volHead, this.volJaw, this.volLure);
    for (const T of this.tents) this.volumes.push(...T.vols);
    this.staggerDur = 3.6;
    this.defineAttacks();
    this.root.traverse((o) => o.layers && o.layers.enable(1));
  }

  // --- the model --------------------------------------------------------------

  buildHead() {
    const B = new MeshBuilder(null);
    const skin = mat('#ffffff', { pat: PAT.scales, rough: 0.42, rim: 1.2 });
    const flesh = mat('#ffffff', { pat: PAT.flesh, rough: 0.3, rim: 0.4 });
    const tooth = mat('#d8d0ba', { pat: PAT.bone, rough: 0.3, trans: 0.35, rim: 0.8 });
    const glowEye = mat('#dcff9c', { pat: PAT.glow, rim: 7 });
    const glowSpot = mat('#6ffff0', { pat: PAT.glow, rim: 4 });
    const rnd = this.rand;
    const skinTint = (p) => {
      const belly = smooth(0.4, -0.2, p.y);
      const mottle = 0.75 + 0.5 * Math.abs(Math.sin(p.x * 3.1 + p.z * 1.7) * Math.sin(p.z * 2.3 - p.y * 1.9));
      const r = lerp(0.1, 0.22, belly) * mottle;
      const g = lerp(0.14, 0.26, belly) * mottle;
      const b = lerp(0.15, 0.24, belly) * mottle;
      return [r, g, b];
    };
    const fleshTint = (p) => {
      const k = 0.8 + 0.3 * Math.sin(p.z * 4 + p.x * 3);
      return [0.3 * k, 0.07 * k, 0.08 * k];
    };
    // Upper head: skin over the top and sides, the palate beneath.
    const ringsSkin = [];
    const ringsPal = [];
    const NZ = 22;
    const z0 = -3.8;
    const z1 = 2.9;
    const sec = (z, th) => {
      const [hw, top, bot] = UPPER(z);
      const c = Math.cos(th);
      const s = Math.sin(th);
      const x = hw * spow(c, 0.8);
      const y = s >= 0 ? top * Math.pow(s, 0.85) : bot * Math.pow(-s, 0.9);
      return new THREE.Vector3(x, y, z);
    };
    for (let j = 0; j <= NZ; j++) {
      const z = z0 + (z1 - z0) * (j / NZ);
      const rs = [];
      const rp = [];
      for (let i = 0; i <= 28; i++) {
        const th = -0.12 * Math.PI + (i / 28) * 1.24 * Math.PI;
        rs.push(sec(z, th));
      }
      for (let i = 0; i <= 10; i++) {
        const th = 1.12 * Math.PI + (i / 10) * 0.76 * Math.PI;
        rp.push(sec(z, th).add(new THREE.Vector3(0, 0.12 * Math.sin((i / 10) * Math.PI), 0)));
      }
      ringsSkin.push(rs);
      ringsPal.push(rp);
    }
    B.grid(ringsSkin, skin, null, { closed: false, tint: skinTint, outward: (p) => new THREE.Vector3(p.x, p.y - 0.5, 0) });
    B.grid(ringsPal, flesh, null, { closed: false, tint: fleshTint, outward: () => new THREE.Vector3(0, -1, 0) });
    // Brow ridges over the eyes and a knobbled crown.
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const len = 0.5 - k * 0.08;
        const g = new THREE.ConeGeometry(0.1, len, 5);
        g.translate(0, len / 2, 0);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.0 - k * 0.1, 0, s * -0.5));
        B.add(g, tooth, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(s * (1.72 - k * 0.1), 1.5 - k * 0.04, 0.15 - k * 0.32), q, new THREE.Vector3(1, 1, 1)), tint: () => 0.55 });
        g.dispose();
      }
      const eye = new THREE.SphereGeometry(0.16, 14, 10);
      B.add(eye, glowEye, null, { matrix: new THREE.Matrix4().makeTranslation(s * 1.9, 1.38, 0.35) });
      eye.dispose();
      const socket = new THREE.TorusGeometry(0.23, 0.06, 6, 16);
      B.add(socket, skin, null, { matrix: new THREE.Matrix4().makeRotationY(s * Math.PI / 2).setPosition(s * 1.87, 1.38, 0.35), tint: () => [0.06, 0.07, 0.07] });
      socket.dispose();
    }
    // Bioluminescent spots in lines along the flanks.
    for (let k = 0; k < 34; k++) {
      const s = k % 2 ? 1 : -1;
      const z = -3.2 + (Math.floor(k / 2) / 17) * 4.6;
      const th = 0.12 + ((k * 7) % 5) * 0.07;
      const p = sec(z, s > 0 ? th : Math.PI - th);
      const n = new THREE.Vector3(p.x, p.y - 0.4, 0).normalize();
      const g = new THREE.SphereGeometry(0.05 + rnd() * 0.04, 6, 4);
      B.add(g, glowSpot, null, { matrix: new THREE.Matrix4().makeTranslation(p.x + n.x * 0.02, p.y + n.y * 0.02, p.z) });
      g.dispose();
    }
    // Upper teeth, hanging from the lip.
    for (const s of [-1, 1]) {
      for (let k = 0; k < 9; k++) {
        const z = -1.0 + k * 0.42 + (rnd() - 0.5) * 0.14;
        if (z > 2.7) continue;
        const [hw, , bot] = UPPER(z);
        const len = (0.25 + 0.55 * smooth(-1, 2.5, z)) * (k % 3 === 1 ? 1.5 : 0.8 + rnd() * 0.4);
        const g = new THREE.ConeGeometry(0.06 + len * 0.1, len, 6);
        g.translate(0, -len / 2, 0);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0, s * -0.18));
        B.add(g, tooth, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(s * hw * 0.9, bot + 0.04, z), q, new THREE.Vector3(1, 1, 1)) });
        g.dispose();
      }
    }
    // Spines along the crown.
    for (let k = 0; k < 6; k++) {
      const z = -3.3 + k * 0.5;
      const [, top] = UPPER(z);
      const len = 0.9 - k * 0.1;
      const g = new THREE.ConeGeometry(0.08, len, 6);
      g.translate(0, len / 2, 0);
      B.add(g, tooth, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(0, top - 0.05, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.7, 0, 0)), new THREE.Vector3(1, 1, 1)) });
      g.dispose();
    }
    // The body, sloping down and back into the water.
    const body = [];
    for (let j = 0; j <= 10; j++) {
      const t = j / 10;
      const cz = -3.6 - t * 6;
      const cy = 0.3 - t * 5.5;
      const r = 2.35 - t * 0.9;
      const ring = [];
      for (let i = 0; i <= 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ring.push(new THREE.Vector3(Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 0.95, cz));
      }
      body.push(ring);
    }
    B.grid(body, skin, null, { closed: false, tint: skinTint, outward: (p) => new THREE.Vector3(p.x, 0.5, 0) });
    this.headMesh = new THREE.Mesh(B.build(), this.material);
    this.headMesh.frustumCulled = false;
    this.headGroup.add(this.headMesh);

    // Lower jaw (hinge space): the outer skin, the floor of the mouth, a palisade of teeth.
    const J = new MeshBuilder(null);
    const outer = [];
    const inner = [];
    const NJ = 20;
    for (let j = 0; j <= NJ; j++) {
      const z = -0.6 + 6.8 * (j / NJ);
      const [hw, depth, lip] = JAW(Math.min(z, 6.2));
      const ro = [];
      for (let i = 0; i <= 22; i++) {
        const th = Math.PI - 0.12 + (i / 22) * (Math.PI + 0.24);
        const c = Math.cos(th);
        const s = Math.sin(th);
        const x = hw * spow(c, 0.75);
        const y = s < 0 ? -depth * Math.pow(-s, 0.8) : lip * s * 4;
        ro.push(new THREE.Vector3(x, y + lip, z));
      }
      outer.push(ro);
      const ri = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const x = hw * 0.97 * (1 - 2 * u);
        ri.push(new THREE.Vector3(x, lip + 0.02 - 0.32 * Math.sin(u * Math.PI) * smooth(-0.5, 1.5, z), z));
      }
      inner.push(ri);
    }
    J.grid(outer, skin, null, { closed: false, tint: skinTint, outward: (p) => new THREE.Vector3(p.x, p.y + 0.3, 0) });
    J.grid(inner, flesh, null, { closed: false, tint: fleshTint, outward: () => new THREE.Vector3(0, 1, 0) });
    for (const s of [-1, 1]) {
      for (let k = 0; k < 18; k++) {
        const z = 0.2 + k * 0.36 + (rnd() - 0.5) * 0.1;
        if (z > 6.3) continue;
        const [hw, , lip] = JAW(z);
        const len = 0.45 + 1.0 * smooth(1, 5.6, z) + rnd() * 0.35;
        const g = new THREE.ConeGeometry(0.05 + len * 0.07, len, 6);
        g.translate(0, len / 2, 0);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.35 - 0.3 * smooth(4, 6, z), 0, s * (0.12 + rnd() * 0.15)));
        J.add(g, tooth, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(s * hw * 0.95, lip + 0.02, z), q, new THREE.Vector3(1, 1, 1)) });
        g.dispose();
      }
    }
    // Fangs at the front of the jaw, splayed outward.
    for (const x of [-0.7, -0.25, 0.25, 0.7]) {
      const len = 1.05 + rnd() * 0.3;
      const g = new THREE.ConeGeometry(0.1, len, 7);
      g.translate(0, len / 2, 0);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.55, 0, -x * 0.35));
      J.add(g, tooth, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(x, 0.14, 5.9 - Math.abs(x) * 0.3), q, new THREE.Vector3(1, 1, 1)) });
      g.dispose();
    }
    this.jawMesh = new THREE.Mesh(J.build(), this.material);
    this.jawMesh.frustumCulled = false;
    this.jawGroup.add(this.jawMesh);
  }

  buildFins() {
    this.fins = [];
    const membrane = mat('#ffffff', { rough: 0.55, trans: 0.6, rim: 1.4 });
    const ray = mat('#b8b09a', { pat: PAT.bone, rough: 0.4 });
    for (const s of [-1, 1]) {
      const B = new MeshBuilder(null);
      const rays = 8;
      const rings = [];
      for (let j = 0; j <= 8; j++) {
        const t = j / 8;
        const ring = [];
        for (let i = 0; i < rays; i++) {
          const a = -0.9 + (i / (rays - 1)) * 1.6;
          const len = 3.0 - Math.abs(a - 0.1) * 0.8;
          const dir = new THREE.Vector3(s * Math.cos(a) * 0.8, Math.sin(a) * 0.9 - 0.2, -0.6 - Math.cos(a) * 0.3).normalize();
          const p = dir.multiplyScalar(len * t);
          // Scalloped trailing edge between the rays.
          p.y += Math.sin(t * Math.PI) * 0.12;
          ring.push(p);
        }
        rings.push(ring);
      }
      B.grid(rings, membrane, null, { closed: false, tint: (p) => [0.16, 0.22, 0.22 + 0.05 * Math.sin(p.y * 6)] });
      for (let i = 0; i < rays; i++) {
        const pts = rings.map((r) => r[i]);
        const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.035, 5, false);
        B.add(g, ray, null, {});
        g.dispose();
      }
      const pivot = new THREE.Group();
      pivot.position.set(s * 2.3, -0.3, -2.1);
      const mesh = new THREE.Mesh(B.build(), this.material);
      mesh.frustumCulled = false;
      pivot.add(mesh);
      this.headGroup.add(pivot);
      this.fins.push({ pivot, s });
    }
  }

  buildLure() {
    const stalkSurf = mat('#ffffff', { pat: PAT.scales, rough: 0.4 });
    this.stalk = new DynamicTube(this.material, {
      rings: 18,
      sides: 8,
      length: 6,
      radius: (t) => 0.15 - t * 0.09,
      surface: stalkSurf,
      tint: (t) => [0.14 + t * 0.1, 0.18 + t * 0.12, 0.18 + t * 0.14],
    });
    this.root.add(this.stalk.mesh);
    this.stalkPts = Array.from({ length: 16 }, () => new THREE.Vector3());
    const B = new MeshBuilder(null);
    const bulb = mat('#e8fff8', { pat: PAT.glow, rim: 9 });
    const shell = mat('#6fb8b0', { rough: 0.15, trans: 0.8, rim: 2 });
    const g = new THREE.SphereGeometry(0.3, 18, 12);
    B.add(g, bulb, null, {});
    g.dispose();
    const g2 = new THREE.SphereGeometry(0.4, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.8);
    B.add(g2, shell, null, { matrix: new THREE.Matrix4().makeRotationX(Math.PI) });
    g2.dispose();
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        pts.push(new THREE.Vector3(Math.cos(a) * (0.22 + t * 0.12), -0.25 - t * 0.55, Math.sin(a) * (0.22 + t * 0.12)));
      }
      const tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.008, 3, false);
      B.add(tg, bulb, null, { tint: () => 0.15 });
      tg.dispose();
    }
    this.bulb = new THREE.Mesh(B.build(), this.material);
    this.bulb.frustumCulled = false;
    this.root.add(this.bulb);
  }

  buildTentacles() {
    this.tents = [];
    const surf = mat('#ffffff', { pat: PAT.flesh, rough: 0.34, rim: 1.1 });
    const homes = [
      [-5.2, -11.2], [5.4, -11.6], [-8.4, -16.0], [8.2, -15.6], [-4.0, -20.5], [4.6, -20.8],
    ];
    homes.forEach(([x, z], k) => {
      const tube = new DynamicTube(this.material, {
        rings: 38,
        sides: 10,
        length: TENT_LEN,
        radius: (t) => 0.06 + 0.42 * Math.pow(1 - t, 0.85),
        surface: surf,
        tint: (t, u) => {
          const under = Math.pow(Math.max(0, Math.cos((u - 0.5) * Math.PI * 2)), 3);
          const k2 = 0.85 + 0.2 * Math.sin(t * 40 + u * 9);
          return [lerp(0.12, 0.45, under) * k2, lerp(0.15, 0.36, under) * k2, lerp(0.16, 0.34, under) * k2];
        },
      });
      this.root.add(tube.mesh);
      const T = {
        k,
        tube,
        home: new THREE.Vector3(x, -0.6, z),
        root: new THREE.Vector3(x, -0.6, z),
        dir: new THREE.Vector3(-x, 0, 12 - z).setY(0).normalize(),
        state: 'idle',
        e: 1, // how far out of the water (0..1)
        s: 0, // raised (0) .. lying flat on the floor (1)
        h: 0.6, // raised height scale
        busy: false,
        ph: k * 1.7,
        pts: Array.from({ length: 40 }, () => new THREE.Vector3()),
        vols: [vol('arm', 0.4, 0.8), vol('arm', 0.3, 0.8), vol('arm', 0.2, 0.8)],
        hits: [0, 1, 2].map(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), r: 0.3 })),
        pinned: false,
        hp: 150,
        sweepA: 0,
      };
      this.tents.push(T);
    });
  }

  // --- posing -----------------------------------------------------------------

  // Centreline of a tentacle from its state: raised and swaying, or lying along the floor.
  shapeTentacle(T, time) {
    const pts = T.pts;
    const n = pts.length;
    const L = TENT_LEN;
    const root = T.root;
    const d = T.dir;
    const side = _w.crossVectors(d, UP).normalize().clone();
    const h = T.h;
    const p0 = new THREE.Vector3().copy(root).setY(root.y - 1.5);
    const p1 = root.clone().addScaledVector(UP, 3.4 * h + 1).addScaledVector(d, -0.6);
    const p2 = root.clone().addScaledVector(UP, 7.4 * h).addScaledVector(d, 1.4 + (1 - h) * 2);
    const p3 = root.clone().addScaledVector(UP, 6.2 * h).addScaledVector(d, 4.6 + (1 - h) * 2.5);
    bezier(p0, p1, p2, p3, pts);
    const sink = (1 - T.e) * (L + 2);
    const wig = T.pinned ? 0.12 : 1;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const p = pts[i];
      // The floor pose: out of the water and flat along the flagstones.
      const along = u * (L + 1.2) - 1.2;
      const fy = along < 0 ? -1.2 + (along + 1.2) * 1.2 : 0.32 + Math.sin(u * 9 + time * 2 + T.ph) * 0.05 * wig;
      _v.copy(root).addScaledVector(d, Math.max(along, 0));
      _v.y = along < 0 ? root.y + fy - root.y : fy;
      _v.addScaledVector(side, Math.sin(u * 7.3 - time * 1.4 + T.ph) * 0.25 * u * wig);
      p.lerp(_v, T.s);
      // Writhing.
      const amp = (1 - T.s * 0.85) * u;
      p.addScaledVector(side, Math.sin(u * 5.1 - time * 2.6 + T.ph) * 0.45 * amp);
      p.y += Math.cos(u * 4.3 - time * 2.1 + T.ph) * 0.3 * amp;
      p.y -= sink;
    }
  }

  updateTentacle(T, dt, time) {
    this.shapeTentacle(T, time);
    T.tube.mesh.visible = T.e > 0.01;
    T.tube.update(T.pts, TENT_LEN + 1.5);
    const P = T.tube.points;
    const N = P.length;
    const seg = [[0.08, 0.38], [0.38, 0.7], [0.7, 0.98]];
    seg.forEach(([a, b], i) => {
      const v = T.vols[i];
      const h = T.hits[i];
      T.tube.at(a, h.a);
      T.tube.at(b, h.b);
      h.r = T.tube.radius((a + b) / 2);
      // The blade sweeps above the floor: an arm lying flat is cut a little higher up.
      v.a.copy(h.a);
      v.b.copy(h.b);
      v.a.y = Math.max(v.a.y, 0.6);
      v.b.y = Math.max(v.b.y, 0.6);
      v.r = h.r + (Math.min(h.a.y, h.b.y) < 0.8 ? 0.35 : 0.12);
      v.mult = T.pinned ? 1.35 : 0.8;
      v.on = T.e > 0.5 && (h.a.y > -0.3 || h.b.y > -0.3);
    });
    void N;
  }

  headMatrix() {
    this.headGroup.updateMatrixWorld(true);
    return this.headGroup.matrixWorld;
  }

  // Pose head, jaw, fins, lure; then everything hangs off them.
  pose(dt, time) {
    const H = this.head;
    const g = this.headGroup;
    g.position.copy(H.pos);
    g.position.y += H.bob;
    g.rotation.set(H.pitch, H.yaw, H.roll, 'YXZ');
    this.jawGroup.rotation.x = H.jaw * 0.85;
    for (const f of this.fins) {
      f.pivot.rotation.set(Math.sin(time * 1.3 + f.s) * 0.12, f.s * (0.2 + Math.sin(time * 0.9) * 0.15), f.s * Math.sin(time * 1.7) * 0.2);
    }
    const M = this.headMatrix();
    // The lure: rooted on the crown, arching forward, the bulb lagging on a spring.
    const sway = Math.sin(time * 0.8) * 0.4;
    const low = this.lureLow;
    const a = _v.set(0, 2.35, 0.1).applyMatrix4(M).clone();
    const b = new THREE.Vector3(sway * 0.3, 4.4 - low * 1.2, -0.4 + low * 0.8).applyMatrix4(M);
    const c = new THREE.Vector3(sway * 0.6, 5.6 - low * 3.6, 1.6 + low * 2.4).applyMatrix4(M);
    const want = new THREE.Vector3(sway, 4.6 - low * 4.4 + Math.sin(time * 1.9) * 0.15, 3.7 + low * 1.4).applyMatrix4(M);
    if (!this.lureInit) {
      this.lureWorld.copy(want);
      this.lureInit = true;
    }
    // Critically damped follow, so the bulb swings when the head moves.
    const k = 38;
    const cdamp = 2 * Math.sqrt(k) * 0.55;
    this.lureVel.addScaledVector(_w.subVectors(want, this.lureWorld), k * dt);
    this.lureVel.multiplyScalar(Math.exp(-cdamp * dt));
    this.lureWorld.addScaledVector(this.lureVel, dt);
    bezier(a, b, c, this.lureWorld, this.stalkPts);
    this.stalk.update(this.stalkPts);
    this.bulb.position.copy(this.lureWorld);
    this.bulb.rotation.set(Math.sin(time * 1.3) * 0.3, time * 0.4, Math.cos(time * 1.1) * 0.3);
    const lc = this.lureCharge;
    this.bulb.scale.setScalar(1 + lc * 0.5 + Math.sin(time * 18) * lc * 0.08);
    // Hurt volumes.
    this.volHead.a.set(0, 1.2, -3.0).applyMatrix4(M);
    this.volHead.b.set(0, 1.0, 1.6).applyMatrix4(M);
    this.jawGroup.updateMatrixWorld(true);
    const JM = this.jawGroup.matrixWorld;
    this.volJaw.a.set(0, -0.5, 0.8).applyMatrix4(JM);
    this.volJaw.b.set(0, -0.3, 5.4).applyMatrix4(JM);
    this.volLure.a.copy(this.lureWorld);
    this.volLure.b.copy(this.lureWorld);
    this.jawTip = (this.jawTip || new THREE.Vector3()).set(0, 0, 5.8).applyMatrix4(JM);
    const above = this.volHead.a.y > -1;
    this.volHead.on = above;
    this.volJaw.on = above;
    this.volLure.on = this.lureWorld.y > -0.2;
    this.lookPoint.set(0, 1.4, 0).applyMatrix4(M);
    this.focus.copy(this.lookPoint);
    this.char.anim.headWorld.copy(this.lookPoint);
    // The lure lights the nave (slot 0).
    const glow = this.material.uniforms.uGlow.value;
    const on = glow.w;
    const lr = lerp(0.5, 3.2, this.lureRed);
    const lg = lerp(1.6, 0.5, this.lureRed);
    const lb = lerp(1.5, 0.3, this.lureRed);
    const I = (1.2 + lc * 5) * on;
    this.stage.lights.set(0, this.lureWorld.x, this.lureWorld.y, this.lureWorld.z, 16 + lc * 10, lr * I, lg * I, lb * I);
    // Solid ground where the head rests on the floor.
    this.solids.length = 0;
    if (this.resting > 0.5) {
      const tip = this.jawTip;
      const mid = _v.lerpVectors(this.volJaw.a, this.volJaw.b, 0.5);
      this.solids.push([tip.x, tip.z, 1.3], [mid.x, mid.z, 2.0]);
    }
  }

  // --- the fight ----------------------------------------------------------------

  reset() {
    super.reset();
    this.head.pos.copy(HOME);
    this.head.yaw = 0;
    this.head.pitch = 0;
    this.head.jaw = 0.1;
    this.lureCharge = 0;
    this.lureRed = 0;
    this.lureLow = 0;
    this.resting = 0;
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    for (const T of this.tents) {
      T.root.copy(T.home);
      T.state = 'idle';
      T.e = 1;
      T.s = 0;
      T.h = 0.6;
      T.busy = false;
      T.pinned = false;
      T.hp = 150;
    }
    this.stage.level = WATER_Y;
    if (this.stage.waterMat) this.stage.waterMat.uniforms.uCalm.value = 1;
    this.hideWave();
  }

  // The intro: the lure rises first, then the head surges out of the crypt.
  startIntro() {
    this.setState('intro');
    this.head.pos.set(HOME.x, -9, HOME.z);
    for (const T of this.tents) T.e = 0;
    this.introFx = 0;
  }

  updateIntro(dt) {
    const t = this.stateT;
    const H = this.head;
    const riseLure = smooth(3.0, 5.0, t);
    const riseHead = easeOut(smooth(5.0, 6.4, t));
    H.pos.y = lerp(-9, HOME.y, riseHead) - (1 - riseLure) * 2.5 * (1 - riseHead);
    H.pitch = lerp(0.5, -0.25, riseHead) + smooth(7.5, 9, t) * 0.25;
    H.jaw = 0.1 + smooth(5.6, 6.3, t) * 0.9 - smooth(7.8, 8.8, t) * 0.75;
    this.lureLow = -(1 - riseHead) * 1.2;
    for (const T of this.tents) T.e = smooth(5.6 + T.k * 0.15, 6.8 + T.k * 0.15, t);
    if (t > 3.9 && this.introFx < 1) {
      this.introFx = 1;
      this.stage.splash(this.lureWorld.x, this.lureWorld.z, 0.7, WATER_Y);
    }
    if (t > 5.4 && this.introFx < 2) {
      this.introFx = 2;
      this.stage.splash(H.pos.x, H.pos.z + 1, 2.4);
      this.stage.splash(H.pos.x - 2, H.pos.z + 2, 1.6);
      this.stage.splash(H.pos.x + 2, H.pos.z + 2, 1.6);
      this.g.audio?.play('splash', { pos: H.pos });
      this.g.rig.shake(0.5);
    }
    if (t > 5.9 && this.introFx < 3) {
      this.introFx = 3;
      this.g.audio?.play('roar', { pos: H.pos, pitch: 0.9 });
      this.g.rig.shake(0.8);
      this.bubbles(H.pos, 40);
    }
    if (t > 7.4 && this.introFx < 4) {
      this.introFx = 4;
      this.stage.introBoss?.();
    }
    return t > 9.5;
  }

  skipIntro() {
    this.stateT = 9.5;
    this.head.pos.copy(HOME);
    this.head.pitch = 0;
    this.head.jaw = 0.1;
    this.lureLow = 0;
    for (const T of this.tents) T.e = 1;
  }

  endIntro() {
    if (this.state === 'intro') this.skipIntro();
    this.setState('idle');
    this.cooldown = 1.6;
  }

  previewPose() {
    this.setState('preview');
    this.head.pos.set(0.6, 2.2, -13.6);
    this.head.pitch = -0.22;
    this.head.yaw = -0.08;
    this.head.jaw = 0.85;
    const raise = [[-5.5, -9.8, 0.9], [5.6, -10.2, 0.8], [-8.6, -14.5, 0.7], [8.4, -14.2, 0.75], [-3.4, -17, 0.5], [3.9, -17.5, 0.55]];
    this.tents.forEach((T, k) => {
      T.root.set(raise[k][0], -0.6, raise[k][1]);
      T.h = raise[k][2];
      T.e = 1;
      T.s = 0;
      T.dir.set(-raise[k][0] * 0.4, 0, 8).normalize();
    });
    this.lureCharge = 0.25;
  }

  bubbles(at, n = 20) {
    const fx = this.stage.fx;
    fx.add.burst(at.x, WATER_Y + 0.1, at.z, n, { vel: [0, 1.2, 0], scatter: 1.2, life: 1.2, size: [0.12, 0.2], color: [0.4, 0.7, 0.65, 0.8], color1: [0.3, 0.5, 0.5, 0], drag: 1.5, gravity: -0.5, kind: PK.bubble }, 1.4);
  }

  // Which tentacle to use next: a free one, preferring those nearest the target.
  pickTentacle(tx, tz) {
    let best = null;
    let bd = Infinity;
    for (const T of this.tents) {
      if (T.busy) continue;
      const d = Math.hypot(T.home.x - tx, T.home.z - tz) + this.rand() * 3;
      if (d < bd) {
        bd = d;
        best = T;
      }
    }
    return best;
  }

  release(T) {
    T.busy = false;
    T.pinned = false;
    T.state = 'return';
    T.t = 0;
  }

  // Idle tentacles writhe around the head; returning ones rise again at home.
  updateTentacles(dt, time) {
    const P = this.g.player.pos;
    for (const T of this.tents) {
      if (!T.busy) {
        if (T.state === 'return') {
          T.t += dt;
          if (T.t < 0.8) T.e = Math.max(0, T.e - dt * 2.5);
          else {
            if (T.root.distanceToSquared(T.home) > 0.01) {
              T.root.copy(T.home);
              T.s = 0;
              T.h = 0.6;
            }
            T.e = Math.min(1, T.e + dt * 0.9);
            if (T.e >= 1) T.state = 'idle';
          }
        }
        if (this.alive) {
          const want = _v.set(P.x - T.root.x, 0, P.z - T.root.z).normalize();
          T.dir.lerp(want, 1 - Math.exp(-dt * 0.8)).normalize();
          T.h = damp(T.h, 0.55 + 0.12 * Math.sin(time * 0.5 + T.k), 2, dt);
          T.s = damp(T.s, 0, 3, dt);
        }
      }
      this.updateTentacle(T, dt, time);
    }
  }

  // A slam: rise, tower over the target, whip down, lie pinned, sink away.
  // Shared by the single slam and the storm. Returns true when finished.
  slamStep(T, t, a, key, wind = 1.5, dt = 1 / 60) {
    const d = a.data[key];
    const P = this.g.player.pos;
    const stage = this.stage;
    const tSlam = wind + 0.22;
    if (!d.started) {
      d.started = true;
      // Emerge off to one side of him, or from the crypt if he is near the edge.
      const ang = Math.atan2(-P.x * 0.3, -1) + (this.rand() - 0.5) * 1.6;
      let rx = P.x + Math.sin(ang) * 6.2;
      let rz = P.z + Math.cos(ang) * 6.2;
      rx = clamp(rx, -11.5, 11.5);
      rz = clamp(rz, -24, 19);
      T.root.set(rx, -0.4, rz);
      T.dir.set(P.x - rx, 0, P.z - rz).normalize();
      T.e = 0;
      T.s = 0;
      T.h = 1;
      T.busy = true;
      T.pinned = false;
      stage.splash(rx, rz, 1.2);
      this.g.audio?.play('splash', { pos: T.root });
      d.tel = this.stage.telegraphs.add({ shape: SHAPE.rect, x: 0, z: 0, w: 0.75, l: TENT_LEN / 2, wind: wind - 0.1, hold: 0.35, color: [3.2, 0.5, 0.15] });
      d.impact = false;
    }
    const tel = d.tel;
    if (t < wind - 0.25) {
      T.e = Math.min(1, t / 0.55);
      // Track him while towering.
      const want = _v.set(P.x - T.root.x, 0, P.z - T.root.z).normalize();
      T.dir.lerp(want, 1 - Math.exp(-6 * dt)).normalize();
      T.h = 1 + Math.sin(t * 5) * 0.03;
    }
    if (tel) {
      tel.x = T.root.x + T.dir.x * (TENT_LEN / 2 - 0.2);
      tel.z = T.root.z + T.dir.z * (TENT_LEN / 2 - 0.2);
      tel.y = 0.02;
      tel.rot = Math.atan2(T.dir.x, T.dir.z);
    }
    if (t >= wind - 0.25 && t < wind) {
      // Rear back before the blow.
      T.h = 1 + smooth(wind - 0.25, wind, t) * 0.15;
      if (!d.woosh) {
        d.woosh = true;
        this.g.audio?.play('whoosh', { pos: T.root, pitch: 0.7 });
      }
    }
    if (t >= wind && t < tSlam) T.s = easeIn((t - wind) / (tSlam - wind));
    if (t >= tSlam && !d.impact) {
      d.impact = true;
      T.s = 1;
      T.pinned = true;
      // Everything under it.
      this.updateTentacle(T, 0, this.time);
      for (const v of T.hits) {
        if (this.touchesPlayer(v.a, v.b, v.r + 0.15)) {
          if (!a.hit.has(key)) {
            a.hit.add(key);
            this.hurtPlayer({ dmg: 24, react: 'knockdown', unblockable: true });
          }
        }
      }
      for (let i = 1; i <= 4; i++) {
        const p = T.tube.at(i / 4.5, _v);
        stage.splash(p.x, p.z, 0.9 - i * 0.1);
      }
      this.stage.waves.add(T.root.x + T.dir.x * 5, 0.02, T.root.z + T.dir.z * 5, { speed: 7, max: 4.5, width: 0.35, height: 0.4, color: [0.9, 1.6, 1.5], r0: 1 });
      this.g.rig.shake(0.55);
      this.g.audio?.play('slam', { pos: T.root });
    }
    if (t >= tSlam && t < tSlam + 1.9) {
      T.s = 1;
      T.pinned = true;
    }
    if (t >= tSlam + 1.9) {
      T.pinned = false;
      T.e = Math.max(0, 1 - (t - tSlam - 1.9) / 0.6);
      if (T.e <= 0) {
        this.release(T);
        return true;
      }
    }
    return false;
  }

  defineAttacks() {
    const self = this;
    this.attacks = {
      slam: {
        weight: 3,
        dur: 4.4,
        cooldown: 0.9,
        start(a) {
          const P = self.g.player.pos;
          a.data.T = self.pickTentacle(P.x, P.z);
          a.data.one = {};
          if (!a.data.T) a.dur = 0;
        },
        update(a, dt) {
          if (!a.data.T) return;
          if (self.slamStep(a.data.T, a.t, a, 'one', 1.55, dt)) a.t = a.dur;
        },
        cancel(a) {
          if (a.data.T) self.release(a.data.T);
        },
      },
      sweep: {
        weight: 2,
        dur: 3.8,
        cooldown: 1.0,
        start(a) {
          const P = self.g.player.pos;
          const T = self.pickTentacle(P.x, P.z);
          a.data.T = T;
          if (!T) {
            a.dur = 0;
            return;
          }
          const side = P.x > 0 ? 1 : -1;
          const rx = side * 11.6;
          const rz = clamp(P.z - 3.5, edgeZ(rx) + 1, 18);
          T.root.set(rx, -0.4, rz);
          T.busy = true;
          T.e = 0;
          T.s = 1;
          // Lying along the wall, it swings out across the nave toward him.
          const a0 = Math.atan2(0, 1);
          const toward = Math.atan2(P.x - rx, P.z - rz);
          const spread = wrapAngle(toward - a0);
          a.data.a0 = a0 - Math.sign(spread) * 0.2;
          a.data.a1 = toward + Math.sign(spread) * 0.9;
          T.dir.set(Math.sin(a.data.a0), 0, Math.cos(a.data.a0));
          const mid = (a.data.a0 + a.data.a1) / 2;
          a.data.tel = self.stage.telegraphs.add({ shape: SHAPE.sector, x: rx, z: rz, w: TENT_LEN, l: TENT_LEN, rot: mid, param: Math.abs(a.data.a1 - a.data.a0) / 2 + 0.05, wind: 1.35, hold: 0.7, color: [3.2, 0.6, 0.12] });
          self.stage.splash(rx, rz, 1.1);
          self.g.audio?.play('splash', { pos: T.root });
        },
        update(a) {
          const T = a.data.T;
          if (!T) return;
          const t = a.t;
          T.e = Math.min(1, t / 0.5);
          T.s = 1;
          T.h = 0.4;
          let ang = a.data.a0;
          if (t > 1.0 && t < 1.4) ang = a.data.a0 - (a.data.a1 - a.data.a0) * 0.08 * smooth(1.0, 1.4, t);
          if (t >= 1.4) ang = lerp(a.data.a0, a.data.a1, easeInOut(clamp((t - 1.4) / 0.55, 0, 1)));
          T.dir.set(Math.sin(ang), 0, Math.cos(ang));
          if (self.at(a, 1.4)) self.g.audio?.play('whoosh', { pos: T.root, pitch: 0.6 });
          if (t >= 1.4 && t <= 2.0) {
            for (const v of T.hits) {
              if (!a.hit.has('sweep') && self.touchesPlayer(v.a, v.b, v.r + 0.05)) {
                a.hit.add('sweep');
                self.hurtPlayer({ dmg: 22, react: 'knockdown', unblockable: true });
              }
            }
            if (Math.random() < 0.5) {
              const p = T.tube.at(0.4 + Math.random() * 0.5, _v);
              self.stage.splash(p.x, p.z, 0.5);
            }
          }
          if (t > 2.9) T.e = Math.max(0, 1 - (t - 2.9) / 0.7);
          if (t >= a.dur - 0.05) self.release(T);
        },
        cancel(a) {
          if (a.data.T) self.release(a.data.T);
        },
      },
      flash: {
        weight: 1.6,
        dur: 3.4,
        cooldown: 1.2,
        start(a) {
          self.g.audio?.play('lure', { pos: self.lureWorld });
          self.g.hud?.flash('The lure brightens · break its line of sight', 1.8);
        },
        update(a, dt) {
          const t = a.t;
          self.lureCharge = smooth(0, 2.3, t) * (1 - smooth(2.35, 2.9, t));
          self.head.pitch = damp(self.head.pitch, -0.25, 3, dt);
          if (self.at(a, 2.35)) {
            const L = self.lureWorld;
            self.stage.lights.flash(L.x, L.y, L.z, 60, 40, 60, 55, 3);
            self.g.audio?.play('flash', { pos: L });
            self.stage.fx.add.burst(L.x, L.y, L.z, 40, { vel: [0, 0, 0], scatter: 6, life: 0.6, size: [0.15, 0.05], color: [3, 6, 5.5, 1], color1: [0.5, 1.5, 1.4, 0], drag: 2, kind: PK.ember }, 0.2);
            // Blinded, unless a pillar stands between, or he is mid-dodge.
            const P = self.g.player.pos;
            let hidden = false;
            for (const [x, z, r] of PILLARS) if (segCircle(L.x, L.z, P.x, P.z, x, z, r * 0.95)) hidden = true;
            const cam = self.g.rig.camera;
            const facing = _v.subVectors(L, cam.position).normalize().dot(cam.getWorldDirection(_w)) > 0.2;
            if (!hidden) {
              const res = self.hurtPlayer({ dmg: 14, react: 'stagger', unblockable: true, point: P.clone().setY(P.y + 1.5) });
              if (res !== 'dodged' && facing) self.g.hud?.whiteout(1.4);
              else if (res !== 'dodged') self.g.hud?.whiteout(0.5);
            } else {
              self.g.hud?.whiteout(0.25);
              self.g.hud?.flash('Sheltered', 0.9);
            }
          }
        },
        end() {
          self.lureCharge = 0;
        },
        cancel() {
          self.lureCharge = 0;
        },
      },
      bite: {
        weight: 2.4,
        dur: 5.4,
        cooldown: 1.0,
        ok() {
          const P = self.g.player.pos;
          return P.z < 3 && Math.abs(P.x) < 8.5;
        },
        start(a) {
          const P = self.g.player.pos;
          a.data.x = clamp(P.x, -4.5, 4.5);
          const ez = edgeZ(a.data.x);
          a.data.z = ez - 3.35;
          a.data.tel = self.stage.telegraphs.add({ shape: SHAPE.rect, x: a.data.x, z: ez + 2.2, w: 3.0, l: 2.6, rot: 0, wind: 1.2, hold: 0.3, color: [3.4, 0.4, 0.1] });
          self.g.audio?.play('roar', { pos: self.lookPoint, pitch: 1.2 });
        },
        update(a, dt) {
          const t = a.t;
          const H = self.head;
          const back = smooth(0, 1.0, t);
          const surge = easeIn(smooth(1.0, 1.28, t));
          const ret = smooth(4.2, 5.4, t);
          const x = lerp(HOME.x, a.data.x, Math.max(back * 0.3, surge) * (1 - ret));
          H.pos.x = x;
          H.pos.z = lerp(lerp(HOME.z, HOME.z - 2, back), a.data.z, surge) * (1 - ret) + HOME.z * ret;
          H.pos.y = lerp(lerp(HOME.y, HOME.y + 0.6, back), 1.25, surge) * (1 - ret) + HOME.y * ret;
          H.pitch = lerp(lerp(0, -0.35, back), 0.12, surge) * (1 - ret);
          H.yaw = damp(H.yaw, 0, 4, dt);
          H.jaw = t < 1.25 ? lerp(0.1, 1.0, back) : t < 1.4 ? lerp(1.0, 0.05, (t - 1.25) / 0.15) : lerp(0.05, 0.25, smooth(1.4, 2, t)) * (1 - ret) + 0.1 * ret;
          self.resting = t > 1.3 && t < 4.3 ? 1 : 0;
          self.lureLow = smooth(1.4, 2.2, t) * (1 - smooth(4.0, 4.6, t));
          if (self.at(a, 1.25)) {
            self.g.audio?.play('bite', { pos: H.pos });
            self.g.rig.shake(0.9);
            const ez = edgeZ(a.data.x);
            for (let i = 0; i < 5; i++) self.stage.splash(a.data.x + (i - 2) * 1.2, ez + 0.3, 1.0);
            const P = self.g.player.pos;
            if (Math.abs(P.x - a.data.x) < 3.1 && P.z < ez + 4.9 && P.z > ez - 0.5) {
              self.hurtPlayer({ dmg: 34, react: 'knockdown', unblockable: true });
            }
          }
        },
        end() {
          self.resting = 0;
          self.lureLow = 0;
        },
        cancel() {
          self.resting = 0;
        },
      },
      spit: {
        weight: 1.8,
        phase: 2,
        dur: 3.4,
        cooldown: 1.0,
        update(a, dt) {
          const H = self.head;
          H.pitch = damp(H.pitch, -0.2, 3, dt);
          H.jaw = damp(H.jaw, 0.25 + 0.5 * Math.abs(Math.sin(a.t * 6)), 8, dt);
          for (const [k, tt] of [[0, 1.0], [1, 1.6], [2, 2.2]]) {
            if (self.at(a, tt)) self.spit(k);
          }
        },
      },
      surge: {
        weight: 1.3,
        phase: 2,
        dur: 7,
        cooldown: 1.4,
        start(a) {
          self.g.audio?.play('roar', { pos: self.lookPoint, pitch: 0.8 });
          a.data.waveZ = null;
          for (const T of self.tents) if (!T.busy) T.e = 1;
        },
        update(a, dt) {
          const t = a.t;
          const H = self.head;
          const stage = self.stage;
          // Dive.
          const dive = smooth(0.3, 1.3, t) * (1 - smooth(5.6, 6.8, t));
          H.pos.y = lerp(HOME.y, -7, dive);
          H.pitch = lerp(0, 0.6, dive);
          for (const T of self.tents) if (!T.busy) T.e = 1 - dive;
          // The water drains toward the crypt, then comes back all at once.
          stage.level = lerp(WATER_Y, -0.25, smooth(1.2, 2.2, t)) * (1 - smooth(2.5, 3.2, t)) + WATER_Y * smooth(2.5, 3.2, t) + 0.1 * smooth(2.5, 3.2, t) * (1 - smooth(5, 6, t));
          if (self.at(a, 1.3)) {
            self.g.hud?.flash('The water recedes · dodge through the wave', 2);
            stage.telegraphs.add({ shape: SHAPE.rect, x: 0, z: edgeZ(0) + 1.2, w: 12.5, l: 0.9, wind: 1.3, hold: 0.2, color: [3, 0.6, 0.15] });
            self.g.audio?.play('rumble');
          }
          if (self.at(a, 2.6)) {
            a.data.waveZ = edgeZ(0) - 1;
            self.showWave();
            self.g.audio?.play('splash', { pitch: 0.6 });
          }
          if (a.data.waveZ !== null && t < 6.2) {
            a.data.waveZ += 7.2 * dt;
            const wz = a.data.waveZ;
            self.placeWave(wz, t);
            const P = self.g.player.pos;
            if (!a.hit.has('wave') && Math.abs(P.z - wz) < 0.9 && P.y < 2.6) {
              a.hit.add('wave');
              const res = self.hurtPlayer({ dmg: 28, react: 'knockdown', unblockable: true, dir: new THREE.Vector3(0, 0, 1) });
              if (res === 'dodged') self.g.hud?.flash('Through the wave', 0.9);
            }
            if (Math.random() < 0.8) stage.splash(-11 + Math.random() * 22, wz + 0.4, 0.8);
            if (Math.random() < 0.3) stage.ripple(-11 + Math.random() * 22, wz, 1);
            if (wz > 21) {
              a.data.waveZ = null;
              self.hideWave();
            }
          }
        },
        end() {
          self.hideWave();
          self.stage.level = WATER_Y + (self.phase === 2 ? 0.1 : 0);
        },
        cancel() {
          self.hideWave();
          self.stage.level = WATER_Y;
        },
      },
      storm: {
        weight: 1.6,
        phase: 2,
        dur: 5.2,
        cooldown: 1.2,
        start(a) {
          const P = self.g.player.pos;
          a.data.Ts = [];
          for (let k = 0; k < 3; k++) {
            const T = self.pickTentacle(P.x, P.z);
            if (!T) break;
            T.busy = true;
            a.data.Ts.push(T);
            a.data['s' + k] = {};
          }
          if (!a.data.Ts.length) a.dur = 0;
        },
        update(a, dt) {
          a.data.Ts.forEach((T, k) => {
            const t = a.t - k * 0.7;
            if (t >= 0 && !a.data['done' + k]) {
              if (self.slamStep(T, t, a, 's' + k, 1.15, dt)) a.data['done' + k] = true;
            }
          });
        },
        cancel(a) {
          for (const T of a.data.Ts || []) self.release(T);
        },
      },
    };
  }

  // A glob of lure-lit bile: a perfect parry sends it back.
  spit(k) {
    const P = this.g.player.pos;
    const from = this.jawTip.clone();
    from.y += 0.8;
    const lead = k === 1 ? 0 : k === 0 ? -1.6 : 1.6;
    const side = _v.set(P.z - from.z, 0, -(P.x - from.x)).normalize();
    const target = P.clone().addScaledVector(side, lead * 0.6);
    const T = 1.05;
    const g = 12;
    const vel = new THREE.Vector3((target.x - from.x) / T, (target.y + 1 - from.y) / T + 0.5 * g * T, (target.z - from.z) / T);
    const B = new MeshBuilder(null);
    const sg = new THREE.SphereGeometry(0.32, 14, 10);
    B.add(sg, mat('#baffee', { pat: PAT.glow, rim: 6 }), null, {});
    sg.dispose();
    const mesh = new THREE.Mesh(B.build(), this.material);
    const fx = this.stage.fx;
    this.stage.projectiles.add({
      mesh,
      pos: from,
      vel,
      gravity: g,
      radius: 0.45,
      life: 4,
      dmg: 16,
      react: 'stagger',
      owner: this,
      reflectable: true,
      reflectDmg: 90,
      onUpdate: (o) => {
        fx.add.emit(o.pos.x, o.pos.y, o.pos.z, { vel: [0, 0.2, 0], life: 0.35, size: [0.3, 0.05], color: [0.6, 1.8, 1.5, 0.8], color1: [0.1, 0.4, 0.4, 0], kind: PK.soft });
      },
      onGround: (o) => {
        this.stage.splash(o.pos.x, o.pos.z, 0.8);
        this.stage.hazards.add({ shape: 'circle', x: o.pos.x, z: o.pos.z, r: 1.3, delay: 0, dur: 0.12, dmg: 12, react: 'flinch', owner: this });
      },
      onHitPlayer: (o) => this.stage.splash(o.pos.x, o.pos.z, 0.6),
      onReflectHit: (o) => {
        this.stage.fx.add.burst(o.pos.x, o.pos.y, o.pos.z, 30, { vel: [0, 0, 0], scatter: 5, life: 0.5, size: [0.12, 0.04], color: [1, 3, 2.6, 1], color1: [0.2, 0.6, 0.5, 0], kind: PK.ember, drag: 2 }, 0.3);
        this.g.audio?.play('flash', { pos: o.pos });
      },
    });
    this.g.audio?.play('whoosh', { pos: from, pitch: 1.4 });
  }

  // Built with the hall (hidden), so the wave's shader compiles up front.
  prepare() {
    this.makeWave();
    this.wave.visible = false;
  }

  // The flood wave: a curling wall of water rolling down the nave.
  makeWave() {
    if (this.wave) return;
    const g = new THREE.PlaneGeometry(26, 3, 40, 10);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const v = (pos.getY(i) + 1.5) / 3; // 0 foot .. 1 crest
      const curl = Math.sin(v * Math.PI * 0.9) * 0.9 + v * v * 0.8;
      pos.setXYZ(i, x, v * 2.6, curl);
    }
    g.computeVertexNormals();
    const m = new THREE.ShaderMaterial({
      uniforms: { ...this.g.shared },
      vertexShader: /* glsl */ `
        varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;
        void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uAmbSky; uniform vec3 uSunColor;
        varying vec3 vWorld; varying vec3 vN; varying vec2 vUv;
        float h(vec2 p) { return fract(sin(dot(p, vec2(12.9, 78.2))) * 43758.5); }
        void main() {
          vec3 V = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - abs(dot(normalize(vN), V)), 3.0);
          float foam = smoothstep(0.7, 0.95, vUv.y + (h(floor(vUv * vec2(60.0, 8.0) + uTime * 4.0)) - 0.5) * 0.2);
          vec3 col = mix(vec3(0.02, 0.08, 0.08), vec3(0.1, 0.35, 0.32), vUv.y) + fres * uSunColor * 0.3;
          col = mix(col, vec3(0.8, 0.95, 0.9) * (uAmbSky * 3.0 + 0.3), foam);
          gl_FragColor = vec4(col, 0.82 + foam * 0.15);
        }`,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    this.wave = new THREE.Mesh(g, m);
    this.wave.frustumCulled = false;
    this.wave.renderOrder = 12;
    this.stage.group.add(this.wave);
  }

  showWave() {
    this.makeWave();
    this.wave.visible = true;
  }

  placeWave(z, t) {
    if (!this.wave) return;
    this.wave.position.set(0, -0.1, z);
    this.wave.scale.y = 1 + Math.sin(t * 5) * 0.04;
  }

  hideWave() {
    if (this.wave) this.wave.visible = false;
  }

  updateIdle(dt) {
    const H = this.head;
    const P = this.g.player.pos;
    const want = clamp(Math.atan2(P.x - H.pos.x, P.z - H.pos.z), -0.6, 0.6);
    H.yaw = damp(H.yaw, want, 2, dt);
    H.pos.lerp(HOME, 1 - Math.exp(-2 * dt));
    H.pitch = damp(H.pitch, -0.12 + Math.sin(this.time * 0.6) * 0.05, 2, dt);
    H.jaw = damp(H.jaw, 0.5 + 0.16 * (0.5 + 0.5 * Math.sin(this.time * 1.2)), 3, dt);
  }

  updateStagger(dt) {
    const H = this.head;
    const t = this.stateT;
    const x = clamp(this.g.player.pos.x, -4, 4);
    const ez = edgeZ(x);
    const slump = easeOut(smooth(0, 0.6, t)) * (1 - smooth(this.staggerDur - 0.7, this.staggerDur, t));
    H.pos.x = lerp(H.pos.x, x, slump * dt * 2);
    H.pos.z = lerp(HOME.z, ez - 3.4, slump);
    H.pos.y = lerp(HOME.y, 1.1, slump);
    H.pitch = lerp(0, 0.18, slump) + Math.sin(t * 9) * 0.02;
    H.roll = Math.sin(t * 3) * 0.06 * slump;
    H.jaw = 0.3 + Math.sin(t * 2) * 0.05;
    this.resting = slump > 0.6 ? 1 : 0;
    this.lureLow = slump;
    for (const T of this.tents) if (!T.busy) T.h = damp(T.h, 0.25, 3, dt);
    if (t > this.staggerDur - 0.1) {
      this.resting = 0;
      H.roll = 0;
    }
  }

  onStagger() {
    for (const T of this.tents) if (T.busy) this.release(T);
    this.g.audio?.play('roar', { pos: this.lookPoint, pitch: 1.5 });
    this.stage.splash(this.head.pos.x, this.head.pos.z + 4, 1.6);
  }

  onPhase2() {
    for (const T of this.tents) if (T.busy) this.release(T);
    this.phaseFx = 0;
  }

  updatePhase(dt) {
    const t = this.stateT;
    const H = this.head;
    const rear = smooth(0, 0.8, t) * (1 - smooth(2.4, 3.2, t));
    H.pos.y = HOME.y + rear * 2.4;
    H.pitch = -0.5 * rear;
    H.jaw = 0.1 + rear * 0.95;
    H.roll = Math.sin(t * 14) * 0.03 * rear;
    this.lureRed = smooth(0.4, 1.6, t);
    const glow = this.material.uniforms.uGlow.value;
    glow.set(lerp(this.glowBase.x, 1.4, this.lureRed), lerp(this.glowBase.y, 0.35, this.lureRed), lerp(this.glowBase.z, 0.2, this.lureRed), 1 + Math.sin(t * 20) * 0.3 * rear);
    this.stage.level = WATER_Y + 0.1 * smooth(0.5, 3, t);
    if (t > 0.5 && !this.phaseFx) {
      this.phaseFx = 1;
      this.stage.splash(H.pos.x, H.pos.z + 2, 2.2);
      this.bubbles(H.pos, 60);
      this.g.hud?.card('The Maw awakens', 'The flood answers it', 3);
    }
    for (const T of this.tents) T.h = damp(T.h, 1.0, 2, dt);
    return t > 3.3;
  }

  onDeath() {
    for (const T of this.tents) if (T.busy) this.release(T);
    this.hideWave();
    this.lureCharge = 0;
  }

  updateDeath(dt) {
    const t = this.deathT;
    const H = this.head;
    const thrash = 1 - smooth(1.2, 2.2, t);
    H.roll = Math.sin(t * 11) * 0.12 * thrash;
    H.pitch = -0.4 * thrash * smooth(0, 0.3, t) + smooth(2, 6, t) * 0.6;
    H.jaw = 0.2 + 0.8 * thrash * Math.abs(Math.sin(t * 5));
    H.pos.y = lerp(HOME.y + thrash * 1.2, -9, easeIn(smooth(1.8, 7, t)));
    const glow = this.material.uniforms.uGlow.value;
    const flicker = t > 1.5 ? (Math.sin(t * 37) > 0.3 - t * 0.1 ? 1 : 0.2) : 1;
    glow.w = Math.max(0, 1 - smooth(2.5, 5.5, t)) * flicker;
    for (const T of this.tents) {
      T.h = damp(T.h, 0.15, 1.5, dt);
      T.e = Math.max(0, 1 - smooth(2 + T.k * 0.25, 5 + T.k * 0.25, t));
    }
    if (Math.random() < dt * 20 && H.pos.y > -6) this.bubbles(H.pos, 6);
    if (t > 0.1 && !this.deathFx) {
      this.deathFx = 1;
      this.stage.splash(H.pos.x, H.pos.z + 2, 2.5);
    }
    if (t > 2 && this.deathFx < 2) {
      this.deathFx = 2;
      this.g.audio?.play('splash', { pos: H.pos, pitch: 0.5 });
    }
    return t > 7.2;
  }

  die(info) {
    this.deathFx = 0;
    super.die(info);
  }

  // Where the samurai's blade lands: ichor that glows as it spatters.
  hitFx(point, dir, killing, part) {
    const fx = this.stage.fx;
    const n = killing ? 50 : part && part.part === 'lure' ? 30 : 18;
    const glowy = part && part.part === 'lure';
    fx.add.burst(point.x, point.y, point.z, n, {
      vel: [dir.x * 3, 1.5, dir.z * 3],
      scatter: 2.2,
      life: 0.6,
      size: [glowy ? 0.12 : 0.07, 0.03],
      color: glowy ? [1.5, 4, 3.5, 1] : [0.25, 0.9, 0.75, 1],
      color1: [0.05, 0.2, 0.15, 0],
      gravity: 9,
      drag: 1.2,
      kind: PK.ember,
    }, 0.15);
    fx.smoke.burst(point.x, point.y, point.z, 4, { vel: [dir.x, 0.5, dir.z], scatter: 0.6, life: 0.9, size: [0.2, 0.7], color: [0.05, 0.12, 0.1, 0.7], color1: [0.03, 0.06, 0.05, 0], drag: 2, kind: PK.smoke }, 0.1);
  }

  onDamage(dmg, info, part) {
    // A pinned arm cut deep enough recoils into the dark.
    for (const T of this.tents) {
      if (part && T.vols.includes(part)) {
        T.hp -= dmg;
        if (T.hp <= 0 && T.busy) {
          T.hp = 150;
          this.release(T);
          this.g.audio?.play('roar', { pos: T.root, pitch: 1.8 });
          this.poise += this.poiseMax * 0.3;
        }
      }
    }
  }

  advance(dt, combat, now) {
    super.advance(dt, combat, now);
    if (!this.active) return;
    const time = this.time;
    this.head.bob = Math.sin(time * 0.9) * 0.18 * (this.resting ? 0.2 : 1);
    this.updateTentacles(dt, time);
    this.pose(dt, time);
    // Bubbles about the head, more when it is angry.
    if (this.alive && Math.random() < dt * (this.phase === 2 ? 5 : 2)) this.bubbles(_v.copy(this.head.pos).setZ(this.head.pos.z + 1), 4);
  }

  animate() {}
}

// Does segment (ax,az)-(bx,bz) pass through circle (cx,cz,r)?
function segCircle(ax, az, bx, bz, cx, cz, r) {
  const dx = bx - ax;
  const dz = bz - az;
  const L = dx * dx + dz * dz;
  let t = L > 1e-9 ? ((cx - ax) * dx + (cz - az) * dz) / L : 0;
  t = clamp(t, 0, 1);
  const px = ax + dx * t - cx;
  const pz = az + dz * t - cz;
  return px * px + pz * pz < r * r;
}
