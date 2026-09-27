import * as THREE from 'three';
import { Boss, vol, clamp, lerp, smooth, easeOut, easeIn, easeInOut, damp, wrapAngle } from '../boss.js';
import { MeshBuilder, mat } from '../meshbuilder.js';
import { PAT } from '../charmat.js';
import { PK, SHAPE } from '../vfx.js';
import { gearShape } from '../arenamat.js';
import { mulberry32 } from '../noise.js';
import { clampCircle } from '../ground.js';

// ---------------------------------------------------------------------------
// The Brass Colossus: the forge's own engine, walking. Eight metres of riveted
// brass and iron on piston legs, a furnace for a heart behind a grilled door,
// a boiler on its back and a wrench the length of a boat in its fist. Each
// step is planted (two-bone IK on the legs) and shakes the floor. It slams,
// sweeps, scalds, stomps and hurls gears from its back; hotter still, it
// opens its furnace and charges, leaving burning slag, then must kneel to vent.
// ---------------------------------------------------------------------------

const HIP_Y = 5.1;
const THIGH = 2.55;
const SHIN = 2.5;
const ANKLE = 0.6;
const HIP_X = 1.25;
const ARENA_R = 12.5;

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();

function m4(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
}

// Arm pose: shoulder (x forward swing, z outward), twist, elbow bend.
function armPose(sx, sz, twist, elbow) {
  return { sx, sz, twist, elbow };
}
function lerpPose(a, b, t, out) {
  out.sx = lerp(a.sx, b.sx, t);
  out.sz = lerp(a.sz, b.sz, t);
  out.twist = lerp(a.twist, b.twist, t);
  out.elbow = lerp(a.elbow, b.elbow, t);
  return out;
}
// Keyframes [[t, pose], ...] sampled with smooth easing between keys.
function track(keys, t, out) {
  if (t <= keys[0][0]) return lerpPose(keys[0][1], keys[0][1], 0, out);
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0] = keys[i];
    const [t1, p1] = keys[i + 1];
    if (t <= t1) return lerpPose(p0, p1, easeInOut((t - t0) / (t1 - t0)), out);
  }
  return lerpPose(keys[keys.length - 1][1], keys[keys.length - 1][1], 0, out);
}

const R_IDLE = armPose(-0.55, -0.12, 0.2, -1.2); // wrench held upright before him
const L_IDLE = armPose(-0.15, 0.18, 0, -0.5);

export class Colossus extends Boss {
  constructor(game, stage) {
    super(game, stage, { name: 'The Brass Colossus', epithet: 'Engine of the Clockwork Forge', hp: 2200, poise: 300 });
    this.rand = mulberry32(1111);
    this.glowBase = new THREE.Vector4(1.0, 0.55, 0.25, 1.0);
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.build();
    this.pos = new THREE.Vector3(0, 0, -2);
    this.yaw = 0;
    this.vel = new THREE.Vector3();
    this.hipY = HIP_Y;
    this.hipDrop = 0; // kneeling, crouching
    this.lean = 0; // torso pitch forward
    this.twist = 0; // torso twist
    this.headNod = 0;
    this.chestOpen = 0;
    this.heat = 0; // phase 2 glow
    this.armR = { ...R_IDLE };
    this.armL = { ...L_IDLE };
    this.feet = [0, 1].map((i) => ({
      side: i === 0 ? 1 : -1,
      pos: new THREE.Vector3(),
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
      yaw: 0,
      t: 1,
      stepping: false,
      lift: 0,
      forced: null,
    }));
    this.gearsOnBack = 2;
    this.vols = {
      shinL: vol('leg', 0.78, 0.6), shinR: vol('leg', 0.78, 0.6),
      footL: vol('foot', 0.62, 0.5), footR: vol('foot', 0.62, 0.5),
      thighL: vol('leg', 0.85, 0.7), thighR: vol('leg', 0.85, 0.7),
      torso: vol('body', 1.8, 1.0), core: vol('core', 0.85, 2.4),
      head: vol('head', 1.05, 1.8), armR: vol('arm', 0.6, 1.0), armL: vol('arm', 0.6, 1.0),
      wrench: vol('wrench', 0.5, 0.35, true),
    };
    this.volumes.push(...Object.values(this.vols));
    this.staggerDur = 4.2;
    this.defineAttacks();
    this.root.traverse((o) => o.layers && o.layers.enable(1));
  }

  // --- the model --------------------------------------------------------------

  build() {
    const brass = mat('#c4953f', { pat: PAT.brass, rough: 0.32, metal: 1, rim: 1.1 });
    const copper = mat('#b0643a', { pat: PAT.brass, rough: 0.36, metal: 1 });
    const iron = mat('#34302d', { pat: PAT.armor, rough: 0.45, metal: 1 });
    const dark = mat('#1b1918', { pat: PAT.armor, rough: 0.6, metal: 0.8 });
    const glow = mat('#ffb66a', { pat: PAT.glow, rim: 6 });
    const hotGlow = mat('#ffd6a0', { pat: PAT.glow, rim: 9 });
    const leather = mat('#2a1c14', { rough: 0.8 });
    const rnd = this.rand;
    const mesh = (B) => {
      const m = new THREE.Mesh(B.build(), this.material);
      m.frustumCulled = false;
      return m;
    };
    const rivetRing = (B, y, r, n, m, rad = 0.06) => {
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const g = new THREE.SphereGeometry(rad, 6, 4);
        B.add(g, m, null, { matrix: m4(Math.cos(a) * r, y, Math.sin(a) * r) });
        g.dispose();
      }
    };
    const cyl = (B, r0, r1, h, m, matrix, seg = 18) => {
      const g = new THREE.CylinderGeometry(r0, r1, h, seg, 1);
      B.add(g, m, null, { matrix, uvFn: (p, u, v) => [u * Math.PI * 2 * r1, v * h] });
      g.dispose();
    };
    const box = (B, w, h, d, m, matrix) => {
      const g = new THREE.BoxGeometry(w, h, d);
      B.add(g, m, null, { matrix, uvFn: (p, u, v) => [u * Math.max(w, d), v * h] });
      g.dispose();
    };
    const sphere = (B, r, m, matrix, ws = 16, hs = 12, phiL = Math.PI * 2, thL = Math.PI) => {
      const g = new THREE.SphereGeometry(r, ws, hs, 0, phiL, 0, thL);
      B.add(g, m, null, { matrix, uvFn: (p, u, v) => [u * r * 6, v * r * 3] });
      g.dispose();
    };
    const lathe = (B, prof, m, matrix, seg = 24) => {
      const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg);
      B.add(g, m, null, { matrix, uvFn: (p, u, v) => [u * 8, v * 3] });
      g.dispose();
    };
    const gear = (B, r, teeth, thick, m, matrix, spokes = 5) => {
      const g = new THREE.ExtrudeGeometry(gearShape(r, teeth, { spokes, tooth: 0.12 }), { depth: thick, bevelEnabled: false, curveSegments: 8 });
      g.translate(0, 0, -thick / 2);
      B.add(g, m, null, { matrix, uvFn: (p) => [p.x, p.y] });
      g.dispose();
    };
    const tube = (B, pts, r, m) => {
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 6, r, 8, false);
      B.add(g, m, null, { uvFn: (p, u, v) => [u * 10, v] });
      g.dispose();
    };

    // Hips: a barrel of iron plates with a turning gear at its heart.
    this.hips = new THREE.Group();
    this.root.add(this.hips);
    {
      const B = new MeshBuilder(null);
      cyl(B, 1.35, 1.2, 1.3, iron, m4(0, 0, 0, 0, 0, Math.PI / 2), 20);
      for (const s of [-1, 1]) {
        sphere(B, 0.62, brass, m4(s * 1.15, -0.25, 0));
        gear(B, 0.8, 12, 0.2, brass, m4(s * 0.72, 0, 0, 0, Math.PI / 2, 0));
      }
      // Tassets: hanging iron plates.
      for (let k = 0; k < 5; k++) {
        const x = -1.2 + k * 0.6;
        box(B, 0.52, 1.1, 0.12, brass, m4(x, -0.8, 1.05, 0.2, 0, 0));
        box(B, 0.52, 1.1, 0.12, brass, m4(x, -0.8, -1.05, -0.2, 0, 0));
      }
      this.hips.add(mesh(B));
    }
    // Torso: a barrel chest, furnace door in front, boiler and chimney behind.
    this.torso = new THREE.Group();
    this.torso.position.set(0, 0.7, 0);
    this.hips.add(this.torso);
    {
      const B = new MeshBuilder(null);
      lathe(B, [[1.2, 0], [1.55, 0.4], [2.0, 1.4], [2.15, 2.1], [2.0, 2.8], [1.4, 3.25], [0.9, 3.4]], brass, m4(0, 0, 0), 28);
      for (const y of [0.45, 1.4, 2.1, 2.8]) rivetRing(B, y, [1.55, 2.0, 2.15, 2.0][[0.45, 1.4, 2.1, 2.8].indexOf(y)] + 0.02, 32, iron, 0.06);
      // Iron bands.
      for (const [y, r] of [[1.0, 1.85], [2.5, 2.1]]) {
        const g = new THREE.TorusGeometry(r, 0.09, 6, 40);
        B.add(g, iron, null, { matrix: m4(0, y, 0, Math.PI / 2, 0, 0) });
        g.dispose();
      }
      // The furnace door frame: a thick ring of iron, bars across the glow behind.
      const g = new THREE.TorusGeometry(0.85, 0.16, 8, 28);
      B.add(g, iron, null, { matrix: m4(0, 1.9, 2.02) });
      g.dispose();
      const disc = new THREE.CircleGeometry(0.82, 28);
      B.add(disc, glow, null, { matrix: m4(0, 1.9, 1.96) });
      disc.dispose();
      // Boiler on the back, a chimney, a pressure valve, pipes to the shoulders.
      cyl(B, 1.0, 1.0, 2.6, copper, m4(0, 1.9, -1.75), 18);
      lathe(B, [[1.0, 0], [0.7, 0.35], [0.001, 0.45]], copper, m4(0, 3.2, -1.75));
      cyl(B, 0.35, 0.42, 2.2, dark, m4(0.5, 3.6, -2.0), 12);
      const cap = new THREE.TorusGeometry(0.42, 0.08, 6, 16);
      B.add(cap, iron, null, { matrix: m4(0.5, 4.7, -2.0, Math.PI / 2, 0, 0) });
      cap.dispose();
      for (const s of [-1, 1]) {
        tube(B, [new THREE.Vector3(s * 0.6, 2.4, -2.5), new THREE.Vector3(s * 1.6, 2.9, -1.8), new THREE.Vector3(s * 2.0, 3.0, -0.6)], 0.14, copper);
        tube(B, [new THREE.Vector3(s * 0.8, 0.8, -2.4), new THREE.Vector3(s * 1.7, 1.3, -1.2), new THREE.Vector3(s * 1.9, 1.5, 0.2)], 0.1, brass);
      }
      // A gauge on the chest, gears visible through a panel on the flank.
      sphere(B, 0.28, brass, m4(1.2, 2.55, 1.55, Math.PI / 2, 0, 0), 12, 6, Math.PI * 2, Math.PI / 2);
      gear(B, 0.6, 12, 0.14, brass, m4(-1.95, 1.7, 0.4, 0, Math.PI / 2, 0));
      gear(B, 0.4, 9, 0.14, copper, m4(-2.02, 1.05, 0.9, 0, Math.PI / 2, 0));
      this.torso.add(mesh(B));
      // The furnace door, hinged on its left edge.
      this.door = new THREE.Group();
      this.door.position.set(-0.85, 1.9, 2.1);
      const D = new MeshBuilder(null);
      const plate = new THREE.CylinderGeometry(0.84, 0.84, 0.12, 24);
      D.add(plate, iron, null, { matrix: m4(0.85, 0, 0, Math.PI / 2, 0, 0) });
      plate.dispose();
      for (let k = -3; k <= 3; k++) box(D, 0.08, 1.4 - Math.abs(k) * 0.15, 0.1, dark, m4(0.85 + k * 0.2, 0, 0.08));
      rivetRing(D, 0, 0.72, 12, brass, 0.05);
      this.door.add(mesh(D));
      this.torso.add(this.door);
      // Gears on the back, to be torn off and thrown.
      this.backGears = [];
      for (const s of [-1, 1]) {
        const G = new MeshBuilder(null);
        gear(G, 0.95, 16, 0.25, brass, new THREE.Matrix4(), 5);
        const gm = mesh(G);
        gm.position.set(s * 1.25, 2.3, -2.3);
        gm.rotation.set(0.2, s * 0.35, 0);
        this.torso.add(gm);
        this.backGears.push(gm);
      }
      // A white-hot core behind the door (seen when it opens).
      const C = new MeshBuilder(null);
      sphere(C, 0.6, hotGlow, new THREE.Matrix4(), 16, 12);
      this.core = mesh(C);
      this.core.position.set(0, 1.9, 1.7);
      this.torso.add(this.core);
    }
    // Head: a riveted helm with porthole eyes and a grille for a mouth.
    this.head = new THREE.Group();
    this.head.position.set(0, 3.35, 0.35);
    this.torso.add(this.head);
    {
      const B = new MeshBuilder(null);
      cyl(B, 0.95, 1.05, 1.3, brass, m4(0, 0.55, 0), 20);
      sphere(B, 0.95, brass, m4(0, 1.2, 0), 20, 10, Math.PI * 2, Math.PI / 2);
      rivetRing(B, 0.12, 1.06, 20, iron, 0.05);
      rivetRing(B, 1.2, 0.97, 20, iron, 0.05);
      // Brow: a jutting visor ridge.
      box(B, 1.9, 0.18, 0.5, iron, m4(0, 1.02, 0.85, 0.35, 0, 0));
      for (const s of [-1, 1]) {
        const rim = new THREE.TorusGeometry(0.28, 0.08, 8, 20);
        B.add(rim, iron, null, { matrix: m4(s * 0.42, 0.68, 0.98) });
        rim.dispose();
        const eye = new THREE.CircleGeometry(0.27, 20);
        B.add(eye, glow, null, { matrix: m4(s * 0.42, 0.68, 0.96), tint: () => 1.2 });
        eye.dispose();
        // Ear pipes.
        cyl(B, 0.12, 0.12, 0.8, copper, m4(s * 1.05, 0.9, -0.1, 0, 0, s * 0.4), 8);
      }
      // Grille mouth.
      for (let k = -3; k <= 3; k++) box(B, 0.07, 0.45, 0.1, dark, m4(k * 0.12, 0.2, 1.0));
      box(B, 1.0, 0.08, 0.12, iron, m4(0, 0.44, 1.0));
      box(B, 1.0, 0.08, 0.12, iron, m4(0, -0.03, 1.0));
      // A steam whistle on the crown.
      cyl(B, 0.1, 0.14, 0.6, brass, m4(0, 2.35, -0.2), 10);
      this.head.add(mesh(B));
    }
    // Shoulders and arms.
    this.arms = [];
    for (const s of [1, -1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(s * 2.35, 2.75, 0);
      this.torso.add(shoulder);
      const B = new MeshBuilder(null);
      sphere(B, 1.05, brass, m4(0, 0.15, 0), 18, 10, Math.PI * 2, Math.PI / 2);
      sphere(B, 0.75, iron, m4(0, 0, 0));
      rivetRing(B, 0.2, 1.04, 18, iron, 0.05);
      // Steam vents on top.
      for (const o of [-0.35, 0.35]) cyl(B, 0.14, 0.16, 0.6, copper, m4(s * 0.3, 1.1, o), 10);
      cyl(B, 0.5, 0.45, 2.0, iron, m4(0, -1.2, 0), 14);
      // Pistons down the upper arm.
      cyl(B, 0.1, 0.1, 1.8, brass, m4(0.45 * s, -1.2, 0.35), 8);
      cyl(B, 0.1, 0.1, 1.8, brass, m4(-0.45 * s, -1.2, -0.3), 8);
      shoulder.add(mesh(B));
      const elbow = new THREE.Group();
      elbow.position.set(0, -2.3, 0);
      shoulder.add(elbow);
      const E = new MeshBuilder(null);
      gear(E, 0.62, 12, 0.3, brass, m4(0, 0, 0, 0, Math.PI / 2, 0));
      cyl(E, 0.55, 0.45, 2.0, brass, m4(0, -1.1, 0), 14);
      for (const y of [-0.5, -1.2, -1.8]) {
        const g = new THREE.TorusGeometry(0.52 - (y + 0.5) * 0.05, 0.05, 6, 20);
        E.add(g, iron, null, { matrix: m4(0, y, 0, Math.PI / 2, 0, 0) });
        g.dispose();
      }
      elbow.add(mesh(E));
      const hand = new THREE.Group();
      hand.position.set(0, -2.25, 0);
      elbow.add(hand);
      const H = new MeshBuilder(null);
      if (s < 0) {
        // Right: a great fist closed round the wrench.
        box(H, 0.9, 0.8, 0.8, iron, m4(0, -0.2, 0));
        for (let k = 0; k < 4; k++) cyl(H, 0.14, 0.14, 0.6, brass, m4(-0.3 + k * 0.2, -0.55, 0.3, Math.PI / 2, 0, 0), 8);
      } else {
        // Left: a three-fingered claw.
        box(H, 0.8, 0.6, 0.7, iron, m4(0, -0.1, 0));
        for (let k = 0; k < 3; k++) {
          const a = (k - 1) * 0.5;
          const pts = [new THREE.Vector3(Math.sin(a) * 0.3, -0.35, 0.1), new THREE.Vector3(Math.sin(a) * 0.45, -0.9, 0.35), new THREE.Vector3(Math.sin(a) * 0.4, -1.35, 0.15)];
          tube(H, pts, 0.1, brass);
          const tip = new THREE.ConeGeometry(0.1, 0.35, 8);
          H.add(tip, dark, null, { matrix: m4(Math.sin(a) * 0.4, -1.5, 0.12, Math.PI, 0, 0) });
          tip.dispose();
        }
        const th = [new THREE.Vector3(0, -0.2, -0.25), new THREE.Vector3(0, -0.8, -0.5), new THREE.Vector3(0, -1.2, -0.3)];
        tube(H, th, 0.11, brass);
      }
      hand.add(mesh(H));
      this.arms.push({ s, shoulder, elbow, hand });
    }
    // The wrench, in the right fist: handle along the hand's +Z.
    this.wrench = new THREE.Group();
    this.wrench.position.set(0, -0.55, 0);
    this.arms[1].hand.add(this.wrench);
    {
      const B = new MeshBuilder(null);
      box(B, 0.34, 0.5, 4.4, iron, m4(0, 0, 1.6));
      // Leather-bound grip.
      for (let k = 0; k < 6; k++) box(B, 0.4, 0.56, 0.12, leather, m4(0, 0, -0.2 + k * 0.18));
      // The jaw: an open C at the far end.
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 1.05, 0.62, Math.PI * 2 - 0.62, false);
      shape.absarc(0, 0, 0.5, Math.PI * 2 - 0.9, 0.9, true);
      shape.closePath();
      const g = new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1, curveSegments: 14 });
      g.translate(0, 0, -0.275);
      B.add(g, iron, null, { matrix: m4(0, 0, 4.25, 0, -Math.PI / 2, -Math.PI / 2), uvFn: (p) => [p.x, p.y] });
      g.dispose();
      // Brass collar and the other end's ring.
      const ringG = new THREE.TorusGeometry(0.42, 0.14, 8, 18);
      B.add(ringG, brass, null, { matrix: m4(0, 0, -0.75, 0, Math.PI / 2, 0) });
      ringG.dispose();
      box(B, 0.46, 0.62, 0.25, brass, m4(0, 0, 3.35));
      this.wrench.add(mesh(B));
    }
    // Legs: thighs, shins and feet posed by IK in root space.
    this.legs = [];
    for (const s of [1, -1]) {
      const thigh = new THREE.Group();
      const shin = new THREE.Group();
      const foot = new THREE.Group();
      this.root.add(thigh, shin, foot);
      const T = new MeshBuilder(null);
      cyl(T, 0.82, 0.68, THIGH - 0.3, brass, m4(0, -THIGH / 2, 0), 16);
      cyl(T, 0.12, 0.12, THIGH * 0.8, iron, m4(0.55 * s, -THIGH / 2, 0.45), 8);
      for (const y of [-0.3, -1.1, -1.9]) {
        const g = new THREE.TorusGeometry(0.66, 0.06, 6, 20);
        T.add(g, iron, null, { matrix: m4(0, y, 0, Math.PI / 2, 0, 0) });
        g.dispose();
      }
      thigh.add(mesh(T));
      const S = new MeshBuilder(null);
      gear(S, 0.78, 14, 0.3, brass, m4(s * 0.1, 0, 0, 0, Math.PI / 2, 0));
      sphere(S, 0.62, iron, m4(0, 0, 0));
      cyl(S, 0.7, 0.56, SHIN - 0.2, iron, m4(0, -SHIN / 2, 0), 16);
      // Greave: a curved brass plate over the shin.
      const gv = new THREE.CylinderGeometry(0.82, 0.68, SHIN * 0.8, 16, 1, true, -Math.PI * 0.45, Math.PI * 0.9);
      S.add(gv, brass, null, { matrix: m4(0, -SHIN / 2, 0), uvFn: (p, u, v) => [u * 2, v * 2] });
      gv.dispose();
      cyl(S, 0.1, 0.1, SHIN * 0.8, brass, m4(0.5 * s, -SHIN / 2, -0.4), 8);
      shin.add(mesh(S));
      const F = new MeshBuilder(null);
      sphere(F, 0.5, iron, m4(0, 0.05, 0));
      box(F, 1.1, 0.55, 1.5, iron, m4(0, -0.33, 0.25));
      box(F, 1.2, 0.25, 1.9, brass, m4(0, -0.5, 0.35));
      for (let k = -1; k <= 1; k++) {
        const toe = new THREE.ConeGeometry(0.2, 0.7, 6);
        F.add(toe, dark, null, { matrix: m4(k * 0.38, -0.5, 1.55, Math.PI / 2, 0, 0) });
        toe.dispose();
      }
      box(F, 0.9, 0.3, 0.6, dark, m4(0, -0.48, -0.7));
      foot.add(mesh(F));
      this.legs.push({ s, thigh, shin, foot });
    }
  }

  // --- posing -----------------------------------------------------------------

  toLocal(world, out) {
    out.subVectors(world, this.pos);
    return out.applyAxisAngle(THREE.Object3D.DEFAULT_UP, -this.yaw);
  }

  toWorld(local, out) {
    return out.copy(local).applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.yaw).add(this.pos);
  }

  // Orient group g at p so that its -Y runs along `dir`, keeping +Z toward `fwd`.
  aim(g, p, dir, fwd) {
    _y.copy(dir).negate().normalize();
    _z.copy(fwd).addScaledVector(_y, -fwd.dot(_y)).normalize();
    _x.crossVectors(_y, _z).normalize();
    _m.makeBasis(_x, _y, _z);
    g.position.copy(p);
    g.quaternion.setFromRotationMatrix(_m);
  }

  // Two-bone IK for one leg: hip (root space) to ankle target (root space).
  solveLeg(L, hip, ankle, footYaw, footPitch) {
    const d0 = _v.subVectors(ankle, hip);
    let d = d0.length();
    const maxD = THIGH + SHIN - 0.02;
    if (d > maxD) {
      ankle.copy(hip).addScaledVector(d0.normalize(), maxD);
      d = maxD;
    }
    const dir = _v.subVectors(ankle, hip).normalize().clone();
    const pole = _w.set(Math.sin(footYaw), 0, Math.cos(footYaw));
    pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    const a = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(THIGH * THIGH - a * a, 0));
    const knee = hip.clone().addScaledVector(dir, a).addScaledVector(pole, h);
    const fwd = new THREE.Vector3(Math.sin(footYaw), 0, Math.cos(footYaw));
    this.aim(L.thigh, hip, knee.clone().sub(hip), fwd);
    this.aim(L.shin, knee, ankle.clone().sub(knee), fwd);
    L.foot.position.copy(ankle);
    L.foot.rotation.set(footPitch, footYaw, 0, 'YXZ');
    L.knee = knee;
  }

  pose(dt, time) {
    this.root.position.copy(this.pos);
    this.root.rotation.set(this.rootPitch || 0, this.yaw, this.rootRoll || 0, 'YXZ');
    const bob = this.stepBob || 0;
    this.hips.position.set(0, this.hipY - this.hipDrop + bob, this.hipShift || 0);
    this.hips.rotation.set(0, 0, this.sway || 0);
    this.torso.rotation.set(this.lean, this.twist, 0, 'YXZ');
    this.head.rotation.set(this.headNod, this.headYaw || 0, 0, 'YXZ');
    this.door.rotation.y = -this.chestOpen * 1.9;
    this.core.visible = this.chestOpen > 0.05 || this.heat > 0.3;
    this.core.scale.setScalar(0.8 + this.chestOpen * 0.3 + Math.sin(time * 14) * 0.03);
    // Arms.
    const apply = (arm, p) => {
      arm.shoulder.rotation.set(p.sx, p.twist * arm.s, p.sz * arm.s, 'XYZ');
      arm.elbow.rotation.set(p.elbow, 0, 0);
    };
    apply(this.arms[0], this.armL);
    apply(this.arms[1], this.armR);
    this.root.updateMatrixWorld(true);
    // Legs: hips to feet by IK.
    const hipsM = this.hips.matrix;
    this.legs.forEach((L, i) => {
      const F = this.feet[i];
      const hip = new THREE.Vector3(L.s * HIP_X, -0.3, 0).applyMatrix4(hipsM);
      const footLocal = this.toLocal(F.pos, new THREE.Vector3());
      const ankle = footLocal.clone();
      ankle.y += ANKLE;
      const fy = wrapAngle(F.yaw - this.yaw);
      this.solveLeg(L, hip, ankle, fy, F.lift * -0.35);
    });
    this.root.updateMatrixWorld(true);
    this.updateVolumes();
  }

  updateVolumes() {
    const V = this.vols;
    const wp = (obj, x, y, z, out) => out.set(x, y, z).applyMatrix4(obj.matrixWorld);
    this.legs.forEach((L, i) => {
      const k = i === 0 ? 'L' : 'R';
      wp(L.thigh, 0, -0.2, 0, V['thigh' + k].a);
      wp(L.thigh, 0, -THIGH + 0.3, 0, V['thigh' + k].b);
      wp(L.shin, 0, 0, 0, V['shin' + k].a);
      wp(L.shin, 0, -SHIN + 0.3, 0, V['shin' + k].b);
      wp(L.foot, 0, -0.35, -0.5, V['foot' + k].a);
      wp(L.foot, 0, -0.35, 1.3, V['foot' + k].b);
    });
    wp(this.torso, 0, 0.6, 0, V.torso.a);
    wp(this.torso, 0, 2.7, 0, V.torso.b);
    wp(this.torso, 0, 1.9, 1.8, V.core.a);
    V.core.b.copy(V.core.a);
    V.core.on = this.chestOpen > 0.4 || this.state === 'stagger';
    wp(this.head, 0, 0.4, 0.2, V.head.a);
    wp(this.head, 0, 1.2, 0.1, V.head.b);
    const aR = this.arms[1];
    const aL = this.arms[0];
    wp(aR.elbow, 0, 0, 0, V.armR.a);
    wp(aR.hand, 0, 0, 0, V.armR.b);
    wp(aL.elbow, 0, 0, 0, V.armL.a);
    wp(aL.hand, 0, -0.8, 0, V.armL.b);
    wp(this.wrench, 0, 0, 0.6, V.wrench.a);
    wp(this.wrench, 0, 0, 4.4, V.wrench.b);
    this.wrenchHead = (this.wrenchHead || new THREE.Vector3()).copy(V.wrench.b);
    wp(this.head, 0, 0.8, 0.3, this.lookPoint);
    this.focus.set(this.pos.x, Math.min(this.lookPoint.y - 1.5, 6), this.pos.z);
    this.char.anim.headWorld.copy(this.lookPoint);
    // The samurai can walk between the legs, not through the feet.
    this.solids.length = 0;
    for (const F of this.feet) if (F.lift < 0.3) this.solids.push([F.pos.x + Math.sin(F.yaw) * 0.3, F.pos.z + Math.cos(F.yaw) * 0.3, 1.05]);
    // The furnace lights his chest and the floor about him.
    const glowW = this.material.uniforms.uGlow.value.w;
    const I = (1 + this.chestOpen * 4 + this.heat * 1.5) * glowW;
    wp(this.torso, 0, 1.9, 2.4, _v);
    this.stage.lights.set(0, _v.x, _v.y, _v.z, 9 + this.chestOpen * 6, 2.2 * I, 1.0 * I, 0.35 * I);
  }

  // --- walking ------------------------------------------------------------------

  // Where a foot would rest if he stood still here, facing his way.
  footHome(F, out) {
    const lead = this.vel.clone().multiplyScalar(0.45);
    return this.toWorld(_w.set(F.side * HIP_X * 1.05, 0, 0.25), out).add(lead).setY(0);
  }

  updateGait(dt) {
    if (this.pivot) {
      // Spinning on the spot: the feet grind round with him.
      for (const F of this.feet) {
        if (F.forced) continue;
        this.footHome(F, F.pos);
        F.yaw = this.yaw;
        F.stepping = false;
        F.lift = 0;
      }
      this.stepBob = -0.2;
      return;
    }
    const speed = this.vel.length();
    const stepDur = speed > 5 ? 0.34 : speed > 2.5 ? 0.46 : 0.6;
    let bob = 0;
    for (let i = 0; i < 2; i++) {
      const F = this.feet[i];
      const O = this.feet[1 - i];
      if (F.forced) continue; // an attack is moving this foot
      if (F.stepping) {
        F.t += dt / F.dur;
        const u = Math.min(1, F.t);
        const e = easeInOut(u);
        F.pos.lerpVectors(F.from, F.to, e);
        F.lift = Math.sin(u * Math.PI);
        F.pos.y = F.lift * (0.55 + speed * 0.06);
        F.yaw = lerp(F.yaw0, F.yawTo, e);
        bob = Math.max(bob, Math.sin(u * Math.PI) * 0.18);
        if (u >= 1) {
          F.stepping = false;
          F.lift = 0;
          F.pos.y = 0;
          this.onFootfall(F, speed);
        }
      } else if (!O.stepping && !O.forced) {
        const home = this.footHome(F, new THREE.Vector3());
        const off = home.distanceTo(F.pos);
        const yawOff = Math.abs(wrapAngle(this.yaw - F.yaw));
        if (off > 1.0 || yawOff > 0.45) {
          F.stepping = true;
          F.t = 0;
          F.dur = stepDur;
          F.from.copy(F.pos);
          F.to.copy(home);
          F.yaw0 = F.yaw;
          F.yawTo = this.yaw;
        }
      }
    }
    this.stepBob = -0.12 + bob * 0.6;
    this.sway = damp(this.sway || 0, (this.feet[0].stepping ? -1 : this.feet[1].stepping ? 1 : 0) * 0.04, 4, dt);
  }

  onFootfall(F, speed) {
    const P = this.g.player.pos;
    const d = Math.hypot(P.x - F.pos.x, P.z - F.pos.z);
    this.g.rig.shake(clamp(0.35 - d * 0.02, 0.05, 0.35) * (1 + speed * 0.08));
    this.g.audio?.play('clank', { pos: F.pos, pitch: 0.5 });
    this.stage.dust(F.pos.x + Math.sin(F.yaw) * 0.4, F.pos.z + Math.cos(F.yaw) * 0.4, 0.5);
  }

  placeFeet() {
    for (const F of this.feet) {
      this.footHome(F, F.pos);
      F.yaw = this.yaw;
      F.stepping = false;
      F.forced = null;
      F.lift = 0;
    }
  }

  // Walk toward a point (or stop). Turns first when facing away.
  walkToward(target, stopAt, dt, speedMax = 2.1) {
    const dx = target.x - this.pos.x;
    const dz = target.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    const want = Math.atan2(dx, dz);
    const dy = wrapAngle(want - this.yaw);
    this.yaw = wrapAngle(this.yaw + clamp(dy, -1.3 * dt, 1.3 * dt));
    const go = d > stopAt && Math.abs(dy) < 1.0 ? speedMax * (this.phase === 2 ? 1.3 : 1) : 0;
    const fwd = _v.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    this.vel.lerp(fwd.multiplyScalar(go), 1 - Math.exp(-3 * dt));
    return d;
  }

  moveBody(dt) {
    this.pos.addScaledVector(this.vel, dt);
    clampCircle(this.pos, this.vel, 0, 0, ARENA_R);
    this.body.pos.copy(this.pos);
    this.body.yaw = this.yaw;
  }

  // --- the fight ----------------------------------------------------------------

  reset() {
    super.reset();
    this.pos.set(0, 0, -2.5);
    this.yaw = 0;
    this.vel.set(0, 0, 0);
    this.hipDrop = 0;
    this.lean = 0;
    this.twist = 0;
    this.headNod = 0;
    this.chestOpen = 0;
    this.heat = 0;
    this.rootPitch = 0;
    this.rootRoll = 0;
    this.hipShift = 0;
    Object.assign(this.armR, R_IDLE);
    Object.assign(this.armL, L_IDLE);
    this.gearsOnBack = 2;
    for (const g of this.backGears) g.visible = true;
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.placeFeet();
  }

  startIntro() {
    this.setState('intro');
    this.introFx = 0;
    this.material.uniforms.uGlow.value.w = 0;
  }

  // Dormant, knelt over his wrench; the eyes kindle, steam, and he rises.
  updateIntro(dt) {
    const t = this.stateT;
    const rise = easeInOut(smooth(6.0, 8.6, t));
    this.hipDrop = lerp(2.2, 0, rise);
    this.lean = lerp(0.75, 0, rise) - smooth(8.2, 8.8, t) * 0.12 * (1 - smooth(9.2, 9.9, t));
    this.headNod = lerp(0.6, 0, smooth(5.4, 7.5, t)) - smooth(7.6, 8.4, t) * 0.35 * (1 - smooth(8.8, 9.6, t));
    const glow = this.material.uniforms.uGlow.value;
    const kindle = smooth(5.0, 5.8, t);
    glow.w = kindle * (t < 5.8 ? (Math.sin(t * 40) > 0 ? 1 : 0.3) : 1);
    lerpPose(armPose(-0.9, -0.2, 0.1, -0.2), R_IDLE, rise, this.armR);
    lerpPose(armPose(-0.6, 0.3, 0, -0.3), armPose(-0.9, 0.35, 0.3, -1.6), smooth(7.6, 8.4, t) * (1 - smooth(9.0, 9.8, t)), this.armL);
    if (t > 5.4 && this.introFx < 1) {
      this.introFx = 1;
      this.ventAll(1);
      this.g.audio?.play('steam', { pos: this.lookPoint, pitch: 0.8 });
    }
    if (t > 7.9 && this.introFx < 2) {
      this.introFx = 2;
      this.g.audio?.play('whistle', { pos: this.lookPoint, pitch: 0.7 });
      this.g.audio?.play('roar', { pos: this.lookPoint, pitch: 0.55 });
      this.g.rig.shake(0.8);
      this.ventAll(1.4);
    }
    return t > 10;
  }

  skipIntro() {
    this.stateT = 10;
    this.hipDrop = 0;
    this.lean = 0;
    this.headNod = 0;
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    Object.assign(this.armR, R_IDLE);
    Object.assign(this.armL, L_IDLE);
  }

  endIntro() {
    if (this.state === 'intro') this.skipIntro();
    this.setState('idle');
    this.cooldown = 1.4;
  }

  previewPose() {
    this.setState('preview');
    this.pos.set(0.6, 0, 0.5);
    this.yaw = -0.12;
    this.placeFeet();
    Object.assign(this.armR, armPose(-2.6, -0.25, 0.3, -0.6));
    Object.assign(this.armL, armPose(-0.5, 0.35, 0, -0.9));
    this.lean = -0.12;
    this.chestOpen = 0.2;
  }

  ventAll(s = 1) {
    this.root.updateMatrixWorld(true);
    for (const arm of this.arms) {
      for (const o of [-0.35, 0.35]) {
        const p = new THREE.Vector3(arm.s * 0.3, 1.45, o).applyMatrix4(arm.shoulder.matrixWorld);
        this.stage.steamPuff(p, new THREE.Vector3(0, 1, 0), s);
      }
    }
    const c = new THREE.Vector3(0.5, 4.8, -2.0).applyMatrix4(this.torso.matrixWorld);
    this.stage.fx.smoke.burst(c.x, c.y, c.z, 8, { vel: [0, 2.5, 0], scatter: 0.5, life: 3, size: [0.6, 2.8], color: [0.12, 0.1, 0.1, 0.6], color1: [0.1, 0.09, 0.09, 0], drag: 0.6, kind: PK.smoke }, 0.2);
  }

  updateIdle(dt) {
    const P = this.g.player.pos;
    this.walkToward(P, 6.0, dt);
    this.relaxPose(dt);
    // Chimney smoke, now and then a hiss.
    if (Math.random() < dt * 2) {
      const c = new THREE.Vector3(0.5, 4.8, -2.0).applyMatrix4(this.torso.matrixWorld);
      this.stage.fx.smoke.emit(c.x, c.y, c.z, { vel: [0, 1.8, 0], life: 3, size: [0.5, 2.2], color: [0.12, 0.1, 0.1, 0.45], color1: [0.1, 0.09, 0.09, 0], drag: 0.5, kind: PK.smoke });
    }
  }

  relaxPose(dt) {
    const k = 1 - Math.exp(-4 * dt);
    lerpPose(this.armR, R_IDLE, k, this.armR);
    lerpPose(this.armL, L_IDLE, k, this.armL);
    this.lean = damp(this.lean, 0.05 + Math.sin(this.time * 0.8) * 0.02, 3, dt);
    this.twist = damp(this.twist, 0, 3, dt);
    this.hipDrop = damp(this.hipDrop, 0, 3, dt);
    this.chestOpen = damp(this.chestOpen, this.heat * 0.15, 3, dt);
    const P = this.g.player.pos;
    const hy = wrapAngle(Math.atan2(P.x - this.pos.x, P.z - this.pos.z) - this.yaw);
    this.headYaw = damp(this.headYaw || 0, clamp(hy, -0.7, 0.7), 3, dt);
    const dist = this.playerDist();
    this.headNod = damp(this.headNod, clamp(0.5 - dist * 0.05, 0, 0.45), 2, dt);
  }

  // Where along his facing a blow will land, at `ahead` metres (toward the samurai if nearer).
  strikePoint(ahead, out) {
    const P = this.g.player.pos;
    const fwd = _v.set(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const toP = _w.set(P.x - this.pos.x, 0, P.z - this.pos.z);
    const along = clamp(toP.dot(fwd), ahead * 0.7, ahead * 1.15);
    return out.copy(this.pos).addScaledVector(fwd, along).setY(0);
  }

  defineAttacks() {
    const self = this;
    const stage = () => self.stage;
    this.attacks = {
      slam: {
        weight: 3,
        range: [2.5, 10],
        dur: 3.5,
        cooldown: 1.0,
        start(a) {
          a.data.pt = self.strikePoint(5.6, new THREE.Vector3());
          a.data.tel = stage().telegraphs.add({ shape: SHAPE.circle, x: a.data.pt.x, z: a.data.pt.z, w: 2.4, wind: 1.3, hold: 0.3, color: [3.4, 0.5, 0.1] });
          self.g.audio?.play('whistle', { pos: self.lookPoint, pitch: 0.9 });
        },
        update(a, dt) {
          const t = a.t;
          if (t < 1.0) {
            self.walkToward(a.data.pt, 5.4, dt, 1.2);
            a.data.pt.copy(self.strikePoint(5.6, _v));
            a.data.tel.x = a.data.pt.x;
            a.data.tel.z = a.data.pt.z;
          } else self.vel.multiplyScalar(Math.exp(-6 * dt));
          track([[0, R_IDLE], [1.0, armPose(-3.0, -0.2, 0.1, -0.9)], [1.15, armPose(-3.1, -0.2, 0.1, -0.8)], [1.32, armPose(-1.05, -0.05, 0.05, -0.05)], [2.4, armPose(-1.0, -0.05, 0.05, -0.05)], [3.4, R_IDLE]], t, self.armR);
          track([[0, L_IDLE], [1.0, armPose(-0.9, 0.5, 0, -1.4)], [1.32, armPose(-0.4, 0.3, 0, -0.4)], [3.4, L_IDLE]], t, self.armL);
          self.lean = t < 1.0 ? lerp(0.05, -0.28, smooth(0, 1, t)) : t < 1.35 ? lerp(-0.28, 0.42, smooth(1.0, 1.32, t)) : lerp(0.42, 0.05, smooth(2.4, 3.4, t));
          self.hipDrop = t > 1.2 ? 0.6 * (1 - smooth(2.4, 3.4, t)) : 0;
          if (self.at(a, 0.85)) self.glintAt(self.wrenchHead, false);
          if (self.at(a, 1.32)) {
            const p = a.data.pt;
            stage().hazards.add({ shape: 'circle', x: p.x, z: p.z, r: 2.4, dur: 0.12, dmg: 32, react: 'knockdown', owner: self });
            stage().hazards.add({ shape: 'ring', x: p.x, z: p.z, r0: 2.2, speed: 9, width: 0.55, height: 0.7, dur: 1.2, dmg: 18, react: 'stagger', owner: self });
            stage().waves.add(p.x, 0, p.z, { speed: 9, max: 13, width: 0.5, height: 0.7, color: [3.0, 1.4, 0.45], r0: 2.2 });
            stage().dust(p.x, p.z, 2.2);
            stage().sparks(p.clone().setY(0.3), new THREE.Vector3(0, 1, 0), 60, 1.4);
            self.stage.lights.flash(p.x, 1.5, p.z, 12, 8, 3.5, 1, 7);
            self.g.rig.shake(1.0);
            self.g.audio?.play('slam', { pos: p });
            self.g.audio?.play('clank', { pos: p, pitch: 0.4 });
          }
        },
      },
      sweep: {
        weight: 2.2,
        range: [0, 7.5],
        dur: 3.0,
        cooldown: 1.0,
        start(a) {
          const P = self.g.player.pos;
          self.yaw = wrapAngle(self.yaw + clamp(wrapAngle(Math.atan2(P.x - self.pos.x, P.z - self.pos.z) - self.yaw), -0.6, 0.6));
          a.data.tel = stage().telegraphs.add({ shape: SHAPE.sector, x: self.pos.x, z: self.pos.z, w: 7.2, l: 7.2, rot: self.yaw, param: 1.35, wind: 1.05, hold: 0.45, color: [3.4, 0.55, 0.12] });
          self.g.audio?.play('whistle', { pos: self.lookPoint, pitch: 1.1 });
        },
        update(a, dt) {
          const t = a.t;
          self.vel.multiplyScalar(Math.exp(-6 * dt));
          a.data.tel.x = self.pos.x;
          a.data.tel.z = self.pos.z;
          // Wind back to his right, then the wrench swings round at hip height.
          track([[0, R_IDLE], [0.95, armPose(-1.45, -1.15, -0.7, -0.15)], [1.05, armPose(-1.45, -1.2, -0.7, -0.15)], [1.55, armPose(-1.5, 0.9, 0.8, -0.15)], [2.2, armPose(-1.3, 0.8, 0.6, -0.3)], [3.0, R_IDLE]], t, self.armR);
          self.twist = t < 1.05 ? lerp(0, -0.85, smooth(0, 1.0, t)) : t < 1.55 ? lerp(-0.85, 1.0, smooth(1.05, 1.55, t)) : lerp(1.0, 0, smooth(2.2, 3.0, t));
          self.hipDrop = 0.7 * smooth(0.6, 1.0, t) * (1 - smooth(2.2, 3.0, t));
          if (self.at(a, 0.8)) self.glintAt(self.wrenchHead, false);
          if (self.at(a, 1.1)) self.g.audio?.play('whoosh', { pos: self.wrenchHead, pitch: 0.55 });
          if (t > 1.1 && t < 1.6) {
            const V = self.vols.wrench;
            self.limbStrike(a, 'wrench', V.a, V.b, 0.6, { dmg: 26, react: 'knockdown', unblockable: true });
            self.limbStrike(a, 'wrench', self.vols.armR.a, V.a, 0.55, { dmg: 26, react: 'knockdown', unblockable: true });
          }
        },
      },
      steam: {
        weight: 1.6,
        range: [0, 11],
        dur: 4.2,
        cooldown: 1.2,
        start(a) {
          a.data.tel = stage().telegraphs.add({ shape: SHAPE.sector, x: self.pos.x, z: self.pos.z, w: 9.5, l: 9.5, rot: self.yaw, param: 0.5, wind: 1.3, hold: 1.7, color: [2.4, 2.4, 2.6] });
          self.g.audio?.play('whistle', { pos: self.lookPoint, pitch: 1.3 });
          self.g.hud?.flash('Steam building · get out of its line', 1.2);
        },
        update(a, dt) {
          const t = a.t;
          self.vel.multiplyScalar(Math.exp(-5 * dt));
          // Track him slowly while it vents.
          const P = self.g.player.pos;
          const want = Math.atan2(P.x - self.pos.x, P.z - self.pos.z);
          self.yaw = wrapAngle(self.yaw + clamp(wrapAngle(want - self.yaw), -0.35 * dt, 0.35 * dt));
          a.data.tel.x = self.pos.x;
          a.data.tel.z = self.pos.z;
          a.data.tel.rot = self.yaw;
          self.chestOpen = smooth(0.3, 1.2, t) * (1 - smooth(3.2, 3.9, t));
          track([[0, R_IDLE], [1.0, armPose(-0.5, -0.9, 0, -0.6)], [3.3, armPose(-0.5, -0.9, 0, -0.6)], [4.1, R_IDLE]], t, self.armR);
          track([[0, L_IDLE], [1.0, armPose(-0.5, 0.9, 0, -0.6)], [3.3, armPose(-0.5, 0.9, 0, -0.6)], [4.1, L_IDLE]], t, self.armL);
          self.lean = damp(self.lean, t > 1.2 && t < 3.2 ? 0.28 : 0.05, 4, dt);
          if (self.at(a, 1.3)) {
            a.data.hz = stage().hazards.add({ shape: 'sector', x: self.pos.x, z: self.pos.z, r: 9.5, half: 0.48, rot: self.yaw, delay: 0, dur: 1.9, tick: 0.35, dmg: 9, react: 'flinch', owner: self, height: 4 });
            self.g.audio?.play('steam', { pos: self.lookPoint, pitch: 0.7 });
          }
          if (a.data.hz) {
            a.data.hz.x = self.pos.x;
            a.data.hz.z = self.pos.z;
            a.data.hz.rot = self.yaw;
          }
          if (t > 1.3 && t < 3.2) {
            const c = _v.set(0, 1.9, 2.3).applyMatrix4(self.torso.matrixWorld);
            const fwd = new THREE.Vector3(Math.sin(self.yaw), -0.25, Math.cos(self.yaw));
            for (let k = 0; k < 3; k++) {
              const spread = (Math.random() - 0.5) * 0.7;
              const d = fwd.clone().applyAxisAngle(THREE.Object3D.DEFAULT_UP, spread);
              stage().fx.smoke.emit(c.x, c.y, c.z, { vel: [d.x * 9, d.y * 9 + 0.5, d.z * 9], life: 1.3, size: [0.5, 2.6], color: [1, 0.97, 0.95, 0.5], color1: [0.9, 0.88, 0.86, 0], drag: 1.0, gravity: -0.8, kind: PK.smoke });
            }
          }
        },
        cancel() {
          self.chestOpen = 0;
        },
      },
      stomp: {
        weight: () => (self.playerDist() < 3.5 ? 3.5 : 1.5),
        range: [0, 4.8],
        dur: 2.6,
        cooldown: 0.9,
        start(a) {
          // The foot nearest him.
          const P = self.g.player.pos;
          const d0 = self.feet[0].pos.distanceTo(P);
          const d1 = self.feet[1].pos.distanceTo(P);
          const F = d0 < d1 ? self.feet[0] : self.feet[1];
          a.data.F = F;
          F.forced = true;
          F.stepping = false;
          F.from.copy(F.pos);
          // Land beside him, not beyond the reach of his leg.
          const to = P.clone().setY(0);
          const home = self.footHome(F, new THREE.Vector3());
          if (to.distanceTo(home) > 2.6) to.sub(home).setLength(2.6).add(home);
          F.to.copy(to);
          a.data.tel = stage().telegraphs.add({ shape: SHAPE.circle, x: to.x, z: to.z, w: 2.2, wind: 1.1, hold: 0.25, color: [3.4, 0.5, 0.1] });
          self.g.audio?.play('whistle', { pos: self.lookPoint, pitch: 0.8 });
        },
        update(a, dt) {
          const t = a.t;
          const F = a.data.F;
          self.vel.multiplyScalar(Math.exp(-6 * dt));
          const up = t < 0.9 ? easeOut(smooth(0, 0.9, t)) : t < 1.1 ? 1 - easeIn(smooth(0.9, 1.1, t)) : 0;
          const across = smooth(0, 1.0, t);
          F.pos.lerpVectors(F.from, F.to, across);
          F.pos.y = up * 2.4;
          F.lift = up;
          self.sway = (F.side > 0 ? -1 : 1) * 0.08 * up;
          self.lean = damp(self.lean, -0.1 * up, 4, dt);
          track([[0, R_IDLE], [0.8, armPose(-0.8, -0.8, 0, -0.9)], [1.2, armPose(-0.5, -0.4, 0, -0.9)], [2.5, R_IDLE]], t, self.armR);
          track([[0, L_IDLE], [0.8, armPose(-0.8, 0.8, 0, -0.9)], [1.2, armPose(-0.5, 0.4, 0, -0.9)], [2.5, L_IDLE]], t, self.armL);
          if (self.at(a, 1.1)) {
            const p = F.to;
            F.pos.copy(p);
            F.lift = 0;
            stage().hazards.add({ shape: 'circle', x: p.x, z: p.z, r: 2.2, dur: 0.12, dmg: 28, react: 'knockdown', owner: self });
            stage().hazards.add({ shape: 'ring', x: p.x, z: p.z, r0: 2.0, speed: 8, width: 0.55, height: 0.65, dur: 1.0, dmg: 14, react: 'stagger', owner: self });
            stage().waves.add(p.x, 0, p.z, { speed: 8, max: 10, width: 0.5, height: 0.6, color: [2.6, 1.3, 0.5], r0: 2.0 });
            stage().dust(p.x, p.z, 2);
            self.g.rig.shake(0.9);
            self.g.audio?.play('slam', { pos: p, pitch: 0.8 });
          }
          if (t > 1.2) F.forced = null;
        },
        cancel(a) {
          if (a.data.F) {
            a.data.F.forced = null;
            a.data.F.pos.y = 0;
            a.data.F.lift = 0;
          }
        },
      },
      spin: {
        // Round he goes, the wrench low about his knees: jump it or dodge through.
        weight: () => {
          const P = self.g.player.pos;
          const behind = Math.abs(wrapAngle(Math.atan2(P.x - self.pos.x, P.z - self.pos.z) - self.yaw)) > 1.7;
          return behind ? 4 : self.playerDist() < 4 ? 2 : 0.5;
        },
        range: [0, 6.2],
        dur: 3.3,
        cooldown: 1.1,
        start(a) {
          a.data.yaw0 = self.yaw;
          a.data.tel = stage().telegraphs.add({ shape: SHAPE.ring, x: self.pos.x, z: self.pos.z, w: 6.6, l: 6.6, param: 0.2, wind: 1.0, hold: 1.0, color: [3.4, 0.6, 0.12] });
          self.g.audio?.play('whistle', { pos: self.lookPoint, pitch: 1.0 });
          self.g.hud?.flash('Jump the wrench', 1.0);
        },
        update(a, dt) {
          const t = a.t;
          self.vel.multiplyScalar(Math.exp(-6 * dt));
          a.data.tel.x = self.pos.x;
          a.data.tel.z = self.pos.z;
          const low = armPose(-0.55, 1.45, -0.2, -0.05);
          track([[0, R_IDLE], [0.9, low], [2.0, low], [3.2, R_IDLE]], t, self.armR);
          track([[0, L_IDLE], [0.9, armPose(-0.3, 1.3, 0, -0.4)], [2.0, armPose(-0.3, 1.3, 0, -0.4)], [3.2, L_IDLE]], t, self.armL);
          self.hipDrop = 1.2 * smooth(0.3, 0.9, t) * (1 - smooth(2.1, 3.0, t));
          self.lean = 0.2 * smooth(0.3, 0.9, t) * (1 - smooth(2.1, 3.0, t));
          self.pivot = t > 0.9 && t < 2.0;
          if (t > 0.9 && t < 2.0) {
            const u = easeInOut((t - 0.9) / 1.1);
            self.yaw = wrapAngle(a.data.yaw0 + u * Math.PI * 2);
            const V = self.vols.wrench;
            self.limbStrike(a, 'spin', V.a, V.b, 0.5, { dmg: 26, react: 'knockdown', unblockable: true });
            if (Math.random() < 0.7) stage().sparks(V.b.clone().setY(0.1), new THREE.Vector3(0, 1, 0), 3, 0.7);
          }
          if (self.at(a, 0.9)) self.g.audio?.play('whoosh', { pos: self.lookPoint, pitch: 0.45 });
          if (self.at(a, 1.45)) self.g.audio?.play('whoosh', { pos: self.lookPoint, pitch: 0.5 });
          if (t >= 2.0) self.pivot = false;
        },
        cancel() {
          self.pivot = false;
        },
        end() {
          self.pivot = false;
        },
      },
      gears: {
        weight: 1.7,
        range: [4, 30],
        dur: 3.4,
        cooldown: 1.1,
        start(a) {
          a.data.n = self.phase === 2 ? 2 : 1;
          if (self.gearsOnBack <= 0) {
            self.gearsOnBack = 2;
            for (const g of self.backGears) g.visible = true;
          }
        },
        update(a, dt) {
          const t = a.t;
          self.walkToward(self.g.player.pos, 99, dt, 0);
          track([[0, L_IDLE], [0.7, armPose(0.9, 1.0, 0, -2.0)], [1.0, armPose(0.9, 1.0, 0, -2.0)], [1.35, armPose(-1.7, 0.25, 0, -0.2)], [1.7, armPose(0.9, 1.0, 0, -2.0)], [2.05, armPose(-1.7, 0.25, 0, -0.2)], [3.3, L_IDLE]], t, self.armL);
          self.twist = t < 1.0 ? -0.5 * smooth(0, 0.7, t) : t < 1.35 ? lerp(-0.5, 0.35, smooth(1.0, 1.35, t)) : lerp(0.35, 0, smooth(2.2, 3.2, t));
          if (self.at(a, 0.9)) self.g.audio?.play('gear', { pos: self.lookPoint });
          if (self.at(a, 1.3)) self.throwGear(0);
          if (a.data.n > 1 && self.at(a, 2.0)) self.throwGear(1);
        },
      },
      claw: {
        weight: 1.6,
        range: [0, 6],
        dur: 2.3,
        cooldown: 0.8,
        start() {
          self.g.audio?.play('clank', { pos: self.lookPoint, pitch: 1.3 });
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          if (t < 0.7) self.walkToward(P, 4.2, dt, 1.4);
          else self.vel.multiplyScalar(Math.exp(-6 * dt));
          track([[0, L_IDLE], [0.75, armPose(-2.4, 0.7, 0.2, -1.2)], [0.95, armPose(-2.5, 0.72, 0.2, -1.2)], [1.2, armPose(-0.7, 0.05, -0.2, -0.1)], [1.6, armPose(-0.65, 0.05, -0.2, -0.15)], [2.3, L_IDLE]], t, self.armL);
          self.lean = t < 0.95 ? -0.15 * smooth(0, 0.8, t) : t < 1.25 ? lerp(-0.15, 0.4, smooth(0.95, 1.2, t)) : lerp(0.4, 0.05, smooth(1.6, 2.3, t));
          self.hipDrop = 0.8 * smooth(0.95, 1.2, t) * (1 - smooth(1.6, 2.3, t));
          if (self.at(a, 0.62)) self.glintAt(self.arms[0].hand.getWorldPosition(new THREE.Vector3()), true);
          if (t > 0.98 && t < 1.25) {
            const V = self.vols.armL;
            // A parryable blow: a perfect parry staggers him.
            self.limbStrike(a, 'claw', V.a, V.b, 0.85, { dmg: 22, react: 'stagger', parry: true });
          }
          if (self.at(a, 1.2)) {
            const h = self.vols.armL.b;
            stage().dust(h.x, h.z, 0.8);
            self.g.audio?.play('impact', { pos: h });
          }
        },
      },
      charge: {
        weight: 1.6,
        phase: 2,
        range: [6, 40],
        dur: 6.4,
        cooldown: 1.0,
        start(a) {
          a.data.dir = null;
          a.data.trail = 0;
          self.g.audio?.play('whistle', { pos: self.lookPoint, pitch: 0.6 });
          self.g.hud?.flash('The furnace opens · dodge the charge', 1.4);
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          self.chestOpen = smooth(0, 1.0, t) * (1 - smooth(5.6, 6.3, t));
          if (t < 1.2) {
            self.walkToward(P, 99, dt, 0);
            self.hipDrop = 0.9 * smooth(0.2, 1.1, t);
            self.lean = lerp(0.05, 0.45, smooth(0.2, 1.1, t));
            track([[0, R_IDLE], [1.1, armPose(-0.3, -0.5, 0, -0.4)]], t, self.armR);
            track([[0, L_IDLE], [1.1, armPose(-0.3, 0.5, 0, -0.4)]], t, self.armL);
            if (!a.data.tel && t > 0.25) {
              a.data.tel = stage().telegraphs.add({ shape: SHAPE.rect, x: self.pos.x, z: self.pos.z, w: 1.8, l: 7, rot: self.yaw, wind: 0.95, hold: 0.3, color: [3.6, 0.8, 0.12] });
            }
            if (a.data.tel) {
              const fwd = new THREE.Vector3(Math.sin(self.yaw), 0, Math.cos(self.yaw));
              a.data.tel.x = self.pos.x + fwd.x * 7;
              a.data.tel.z = self.pos.z + fwd.z * 7;
              a.data.tel.rot = self.yaw;
            }
          } else if (t < 3.3) {
            if (!a.data.dir) {
              a.data.dir = new THREE.Vector3(Math.sin(self.yaw), 0, Math.cos(self.yaw));
              self.g.audio?.play('roar', { pos: self.lookPoint, pitch: 0.6 });
            }
            const run = Math.min(1, (t - 1.2) / 0.3) * (Math.hypot(self.pos.x, self.pos.z) < ARENA_R - 0.3 ? 1 : 0);
            self.vel.copy(a.data.dir).multiplyScalar(11 * run);
            self.hipDrop = 0.6;
            self.lean = 0.5;
            // Slag spills behind him and burns.
            a.data.trail += dt * 11 * run;
            if (a.data.trail > 1.3) {
              a.data.trail = 0;
              self.slag(self.pos.x - a.data.dir.x * 1.2, self.pos.z - a.data.dir.z * 1.2);
            }
            const V = self.vols.torso;
            _v.copy(self.pos).setY(1);
            _w.copy(self.pos).setY(3);
            self.limbStrike(a, 'body', _v, _w, 1.7, { dmg: 30, react: 'knockdown', unblockable: true, dir: a.data.dir.clone() });
            self.limbStrike(a, 'body', V.a, V.b, V.r, { dmg: 30, react: 'knockdown', unblockable: true, dir: a.data.dir.clone() });
          } else {
            // Spent: down on one knee, venting, the furnace wide open.
            self.vel.multiplyScalar(Math.exp(-5 * dt));
            if (self.at(a, 3.35)) {
              self.g.rig.shake(0.7);
              self.ventAll(1.5);
              self.g.audio?.play('steam', { pos: self.lookPoint, pitch: 0.6 });
              self.g.hud?.flash('Overheated · strike the core', 1.6);
            }
            self.hipDrop = lerp(0.6, 2.0, smooth(3.3, 3.8, t)) * (1 - smooth(5.6, 6.3, t));
            self.lean = lerp(0.5, 0.75, smooth(3.3, 3.8, t)) * (1 - smooth(5.6, 6.3, t));
            if (Math.random() < dt * 8) self.ventAll(0.5);
          }
        },
        cancel() {
          self.chestOpen = 0;
        },
      },
    };
  }

  // A glint on the weapon: the tell (red: must dodge, white: may be parried).
  glintAt(p, parryable) {
    const c = p.clone();
    this.stage.fx.add.emit(c.x, c.y, c.z, { life: 0.4, size: [1.6, 0.3], color: parryable ? [5, 5, 4.5, 1] : [6, 1.2, 0.4, 1], color1: [0, 0, 0, 0], kind: PK.ember });
    this.g.fx.glints.flash(c, { color: parryable ? 0xfff4e0 : 0xff4020, size: 1.4, life: 0.45, intensity: 12 });
    this.g.audio?.play(parryable ? 'glint' : 'warn', { pos: c });
  }

  // Burning slag where he charged.
  slag(x, z) {
    const st = this.stage;
    st.hazards.add({ shape: 'circle', x, z, r: 1.2, delay: 0.2, dur: 3.5, tick: 0.5, dmg: 6, react: 'flinch', owner: this, height: 1.2 });
    st.telegraphs.add({ shape: SHAPE.circle, x, z, w: 1.25, wind: 0.01, hold: 3.6, color: [2.2, 0.5, 0.08] });
    for (let k = 0; k < 6; k++) {
      st.fx.add.emit(x + (Math.random() - 0.5), 0.1, z + (Math.random() - 0.5), { vel: [0, 0.8, 0], life: 3.4, size: [0.5, 0.2], color: [3.5, 1.2, 0.2, 1], color1: [1, 0.2, 0.02, 0], drag: 1.5, kind: PK.flame });
    }
  }

  // Tear a gear from his back and send it rolling at the samurai.
  throwGear(i) {
    const back = this.backGears[i % 2];
    back.visible = false;
    this.gearsOnBack--;
    const hand = this.arms[0].hand.getWorldPosition(new THREE.Vector3());
    const P = this.g.player.pos;
    const dir = new THREE.Vector3(P.x - hand.x, 0, P.z - hand.z).normalize();
    const B = new MeshBuilder(null);
    const g = new THREE.ExtrudeGeometry(gearShape(0.95, 16, { spokes: 5, tooth: 0.12 }), { depth: 0.25, bevelEnabled: false });
    g.translate(0, 0, -0.125);
    B.add(g, mat('#c4953f', { pat: PAT.brass, rough: 0.3, metal: 1 }), null, { uvFn: (p) => [p.x, p.y] });
    g.dispose();
    const inner = new THREE.Group();
    const mesh = new THREE.Mesh(B.build(), this.material);
    inner.add(mesh);
    // Rolling on its rim: face across its path.
    mesh.rotation.y = Math.PI / 2;
    const start = hand.clone();
    const speed = 13;
    const st = this.stage;
    let bounced = false;
    st.projectiles.add({
      mesh: inner,
      pos: start,
      vel: dir.clone().multiplyScalar(speed).setY(0),
      gravity: 0,
      radius: 0.95,
      life: 4.5,
      dmg: 24,
      react: 'knockdown',
      owner: this,
      reflectable: true,
      reflectDmg: 110,
      rolls: true,
      onUpdate: (o, dt) => {
        // Fall to the floor and roll, sparking.
        if (!o.reflected) {
          o.pos.y = Math.max(0.95, o.pos.y - dt * 9);
          const h = Math.hypot(o.pos.x, o.pos.z);
          if (h > 14.8 && !bounced) {
            bounced = true;
            const n = new THREE.Vector3(o.pos.x, 0, o.pos.z).normalize();
            o.vel.addScaledVector(n, -2 * o.vel.dot(n));
            this.g.audio?.play('clank', { pos: o.pos, pitch: 1.2 });
          } else if (h > 15.5) o.dead = true;
        }
        inner.rotation.y = Math.atan2(o.vel.x, o.vel.z);
        mesh.rotation.x -= (o.vel.length() / 0.95) * dt;
        if (Math.random() < 0.6) st.sparks(new THREE.Vector3(o.pos.x, 0.05, o.pos.z), new THREE.Vector3(-o.vel.x, 2, -o.vel.z).normalize(), 2, 0.6);
      },
      onReflectHit: (o) => {
        st.sparks(o.pos, new THREE.Vector3(0, 1, 0), 60, 1.5);
        this.g.audio?.play('clank', { pos: o.pos, pitch: 0.6 });
        this.g.rig.shake(0.6);
      },
      onHitPlayer: (o) => st.sparks(o.pos, new THREE.Vector3(0, 1, 0), 30, 1),
    });
    this.g.audio?.play('whoosh', { pos: hand, pitch: 1.3 });
  }

  // --- stagger, phase two, death ----------------------------------------------------

  onStagger() {
    this.vel.set(0, 0, 0);
    for (const F of this.feet) {
      F.forced = null;
      F.stepping = false;
      F.pos.y = 0;
      F.lift = 0;
    }
    this.ventAll(1.2);
    this.g.audio?.play('steam', { pos: this.lookPoint, pitch: 0.5 });
  }

  // Down on his hands, venting: head and heart within reach.
  updateStagger(dt) {
    const t = this.stateT;
    const down = easeOut(smooth(0, 0.7, t)) * (1 - smooth(this.staggerDur - 0.9, this.staggerDur, t));
    this.hipDrop = 2.4 * down;
    this.lean = lerp(0.05, 1.05, down);
    this.headNod = lerp(0, -0.5, down);
    this.chestOpen = 0.7 * down;
    Object.assign(this.armR, lerpPose(R_IDLE, armPose(-1.2, -0.3, 0, -0.3), down, {}));
    Object.assign(this.armL, lerpPose(L_IDLE, armPose(-1.2, 0.3, 0, -0.3), down, {}));
    if (Math.random() < dt * 5 * down) this.ventAll(0.4);
  }

  onPhase2() {
    this.vel.set(0, 0, 0);
    for (const F of this.feet) F.forced = null;
    this.phaseFx = 0;
  }

  updatePhase(dt) {
    const t = this.stateT;
    this.vel.multiplyScalar(Math.exp(-5 * dt));
    this.heat = smooth(0.3, 2.2, t);
    const glow = this.material.uniforms.uGlow.value;
    glow.set(lerp(1.0, 1.5, this.heat), lerp(0.55, 0.2, this.heat), lerp(0.25, 0.08, this.heat), 1 + this.heat * 0.4);
    this.chestOpen = smooth(0.2, 0.8, t) * (1 - smooth(2.6, 3.4, t));
    this.lean = lerp(0.05, -0.3, smooth(0, 0.8, t)) * (1 - smooth(2.6, 3.4, t));
    // Beats his chest with the claw.
    track([[0, L_IDLE], [0.6, armPose(-1.6, -0.3, 0.3, -2.2)], [0.8, armPose(-1.2, -0.5, 0.3, -2.3)], [1.0, armPose(-1.6, -0.3, 0.3, -2.2)], [1.2, armPose(-1.2, -0.5, 0.3, -2.3)], [2.2, armPose(-1.6, 0.8, 0.3, -1.0)], [3.3, L_IDLE]], t, this.armL);
    track([[0, R_IDLE], [2.0, armPose(-2.8, -0.4, 0.2, -0.5)], [3.3, R_IDLE]], t, this.armR);
    if ((this.at2(t, 0.8) || this.at2(t, 1.2)) && this.phaseFx < 3) {
      this.phaseFx++;
      this.g.audio?.play('clank', { pos: this.lookPoint, pitch: 0.5 });
      this.g.rig.shake(0.5);
    }
    if (t > 1.6 && this.phaseFx < 4) {
      this.phaseFx = 4;
      this.ventAll(2);
      this.g.audio?.play('whistle', { pos: this.lookPoint, pitch: 0.55 });
      this.g.audio?.play('roar', { pos: this.lookPoint, pitch: 0.5 });
      this.g.hud?.card('The furnace roars', 'The Colossus runs hot', 3);
      this.g.rig.shake(1);
    }
    this.lastPhaseT = t;
    return t > 3.4;
  }

  at2(t, x) {
    const prev = this.lastPhaseT ?? 0;
    return prev < x && t >= x;
  }

  onDeath() {
    this.vel.set(0, 0, 0);
    for (const F of this.feet) {
      F.forced = null;
      F.stepping = false;
      F.pos.y = 0;
      F.lift = 0;
    }
    this.deathFx = 0;
  }

  // Sparks, steam, a stagger to the knees, and the long fall forward.
  updateDeath(dt) {
    const t = this.deathT;
    const knees = easeIn(smooth(1.4, 2.4, t));
    const fall = easeIn(smooth(3.2, 4.4, t));
    this.hipDrop = lerp(0, 2.3, knees);
    this.lean = lerp(0, 0.4, knees) + fall * 0.3;
    this.rootPitch = fall * 1.35;
    this.hipShift = fall * 1.5;
    this.headNod = 0.4 * knees;
    Object.assign(this.armR, lerpPose(R_IDLE, armPose(-0.2, -0.4, 0, -0.1), knees, {}));
    Object.assign(this.armL, lerpPose(L_IDLE, armPose(-0.2, 0.4, 0, -0.1), knees, {}));
    const glow = this.material.uniforms.uGlow.value;
    glow.w = Math.max(0, 1 - smooth(1.5, 4.5, t)) * (t > 1 && Math.sin(t * 43) > 0.4 ? 0.3 : 1);
    this.chestOpen = 0.6 * (1 - smooth(3, 4.5, t));
    if (Math.random() < dt * 14 && t < 3.5) {
      const p = this.lookPoint.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, -Math.random() * 3, (Math.random() - 0.5) * 3));
      this.stage.sparks(p, new THREE.Vector3(Math.random() - 0.5, 1, Math.random() - 0.5).normalize(), 14, 1);
      if (Math.random() < 0.3) this.ventAll(0.6);
    }
    if (t > 2.3 && this.deathFx < 1) {
      this.deathFx = 1;
      this.g.rig.shake(0.8);
      this.stage.dust(this.pos.x, this.pos.z, 1.8);
      this.g.audio?.play('slam', { pos: this.pos, pitch: 0.6 });
    }
    if (t > 4.3 && this.deathFx < 2) {
      this.deathFx = 2;
      const f = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      const p = this.pos.clone().addScaledVector(f, 5);
      this.g.rig.shake(1.2);
      this.stage.dust(p.x, p.z, 3);
      this.stage.dust(p.x + f.z * 2, p.z - f.x * 2, 2.2);
      this.stage.dust(p.x - f.z * 2, p.z + f.x * 2, 2.2);
      this.stage.waves.add(p.x, 0, p.z, { speed: 10, max: 14, width: 0.6, height: 0.5, color: [2, 1.2, 0.6], r0: 2 });
      this.g.audio?.play('slam', { pos: p, pitch: 0.45 });
      this.g.audio?.play('clank', { pos: p, pitch: 0.35 });
    }
    return t > 7;
  }

  hitFx(point, dir, killing, part) {
    const st = this.stage;
    const soft = part && (part.part === 'core');
    st.sparks(point, dir.clone().negate().add(new THREE.Vector3(0, 0.6, 0)).normalize(), killing ? 60 : soft ? 30 : 18, soft ? 1.2 : 0.9);
    this.g.fx.glints.flash(point, { color: soft ? 0xffc080 : 0xffe0a0, size: 0.5, life: 0.15, intensity: 7 });
    if (part && part.armor) this.g.audio?.play('clash', { pos: point });
    else this.g.audio?.play('clank', { pos: point, pitch: 1.4 + Math.random() * 0.3 });
    if (soft) st.fx.add.burst(point.x, point.y, point.z, 10, { vel: [dir.x * 2, 2, dir.z * 2], scatter: 1.5, life: 0.8, size: [0.2, 0.05], color: [4, 1.6, 0.3, 1], color1: [1, 0.2, 0.02, 0], gravity: 4, kind: PK.flame }, 0.1);
  }

  advance(dt, combat, now) {
    super.advance(dt, combat, now);
    if (!this.active) return;
    if (this.state !== 'preview') {
      if (this.state !== 'attack' && this.state !== 'idle') this.vel.multiplyScalar(Math.exp(-6 * dt));
      this.moveBody(dt);
      if (this.state !== 'dying' && this.state !== 'dead') this.updateGait(dt);
    }
    this.pose(dt, this.time);
  }
}
