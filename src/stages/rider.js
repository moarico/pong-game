import * as THREE from 'three';
import { Boss, vol, clamp, lerp, smooth, easeOut, easeIn, easeInOut, damp, wrapAngle } from '../boss.js';
import { MeshBuilder, mat, tubeRings } from '../meshbuilder.js';
import { PAT } from '../charmat.js';
import { Cloth } from '../cloth.js';
import { PK, SHAPE } from '../vfx.js';
import { mulberry32 } from '../noise.js';
import { clampCircle } from '../ground.js';

// ---------------------------------------------------------------------------
// The Storm Rider: a knight in black plate on a warhorse whose hide is split
// by embers, mane and tail burning, a lance of fire couched under his arm and
// a cloak torn by a hundred storms streaming behind. He circles, he charges,
// he sweeps fire across the stones, rears to stamp the ground, and calls the
// lightning down. Wounded, the storm answers him faster.
// ---------------------------------------------------------------------------

const ARENA_R = 15.5;
const UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _m = new THREE.Matrix4();

function m4(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
}

// Gait tables: duty (share of the stride on the ground), swing amplitude, knee lift, leg phase offsets (FL, FR, HL, HR).
const GAITS = {
  walk: { stride: 1.6, duty: 0.66, amp: 0.32, knee: 0.9, off: [0, 0.5, 0.75, 0.25] },
  trot: { stride: 2.6, duty: 0.5, amp: 0.45, knee: 1.25, off: [0, 0.5, 0.5, 0] },
  gallop: { stride: 4.2, duty: 0.36, amp: 0.68, knee: 1.55, off: [0.0, 0.12, 0.55, 0.66] },
};

export class Rider extends Boss {
  constructor(game, stage) {
    super(game, stage, { name: 'The Storm Rider', epithet: 'Last warden of the bastion', hp: 1800, poise: 260 });
    this.rand = mulberry32(777);
    this.glowBase = new THREE.Vector4(1.0, 0.42, 0.12, 1.0);
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.pos = new THREE.Vector3(0, 0, -10);
    this.yaw = 0;
    this.speed = 0;
    this.speedWant = 0;
    this.turnWant = 0;
    this.gaitPhase = 0;
    this.rear = 0; // 0..1 rearing up on the hind legs
    this.kneel = 0; // stumbling to the knees
    this.fall = 0; // toppled
    this.circleDir = 1;
    this.lance = { yaw: 0.05, pitch: 0.12, reach: 0 };
    this.lanceFire = 1;
    this.fireBlue = 0;
    this.build();
    this.vols = {
      body: vol('horse', 0.72, 0.8), neck: vol('horse', 0.36, 0.9), head: vol('horse', 0.34, 1.1),
      rider: vol('rider', 0.42, 1.5), helm: vol('helm', 0.28, 2.0),
      legs: [0, 1, 2, 3].map(() => vol('leg', 0.24, 0.7)),
    };
    this.volumes.push(this.vols.body, this.vols.neck, this.vols.head, this.vols.rider, this.vols.helm, ...this.vols.legs);
    this.staggerDur = 3.8;
    this.defineAttacks();
    this.root.traverse((o) => o.layers && o.layers.enable(1));
  }

  // --- the model --------------------------------------------------------------

  build() {
    const rnd = this.rand;
    const hide = mat('#141012', { pat: PAT.hide, rough: 0.55, rim: 1.6 });
    const armor = mat('#26262a', { pat: PAT.armor, rough: 0.35, metal: 1, rim: 1.2 });
    const trim = mat('#8a6a2e', { pat: PAT.armor, rough: 0.3, metal: 1 });
    const leather = mat('#2a1a12', { rough: 0.75 });
    const cloth = mat('#4a0f10', { pat: PAT.brocade, rough: 0.9, bump: 1 });
    const bone = mat('#bdb3a0', { pat: PAT.bone, rough: 0.4 });
    const eyes = mat('#ff9a3a', { pat: PAT.glow, rim: 8 });
    const hoofGlow = mat('#ff7a2a', { pat: PAT.glow, rim: 4 });
    const wood = mat('#3a281a', { rough: 0.6 });
    const steel = mat('#b8bcc4', { pat: PAT.hamon, rough: 0.2, metal: 1 });
    const mesh = (B) => {
      const m = new THREE.Mesh(B.build(), this.material);
      m.frustumCulled = false;
      return m;
    };
    const add = (B, g, m, matrix, uvs = 1) => {
      B.add(g, m, null, { matrix, uvFn: (p, u, v) => [u * uvs * 2, v * uvs] });
      g.dispose();
    };
    const tube = (B, pts, r, m, segs = 8) => {
      B.grid(tubeRings(pts, r, segs), m, null, { closed: true });
    };

    // Horse: barrel, chest, rump, belly, withers.
    this.horse = new THREE.Group();
    this.root.add(this.horse);
    {
      const B = new MeshBuilder(null);
      add(B, new THREE.SphereGeometry(1, 28, 18), hide, m4(0, 1.55, 0, 0, 0, 0, 0.58, 0.64, 1.2), 2);
      add(B, new THREE.SphereGeometry(0.62, 22, 16), hide, m4(0, 1.5, 0.95, 0, 0, 0, 1, 1.02, 0.95), 2);
      add(B, new THREE.SphereGeometry(0.64, 22, 16), hide, m4(0, 1.62, -0.95, 0, 0, 0, 1.02, 1, 1.05), 2);
      add(B, new THREE.SphereGeometry(0.4, 16, 12), hide, m4(0, 1.95, 0.72, 0, 0, 0, 0.9, 0.9, 1.4), 2);
      // Barding: a peytral over the chest, a crupper over the rump, a saddle with a red cloth.
      add(B, new THREE.CylinderGeometry(0.72, 0.7, 0.55, 20, 1, true, -Math.PI * 0.55, Math.PI * 1.1), armor, m4(0, 1.45, 0.98, 0, 0, 0));
      add(B, new THREE.TorusGeometry(0.71, 0.03, 6, 24, Math.PI * 1.1), trim, m4(0, 1.72, 0.98, Math.PI / 2, 0, Math.PI * 0.95));
      add(B, new THREE.SphereGeometry(0.7, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), armor, m4(0, 1.75, -1.0, 0, 0, 0, 1, 1, 1.1));
      add(B, new THREE.BoxGeometry(0.7, 0.14, 0.75), leather, m4(0, 2.18, 0.1, 0.05, 0, 0));
      add(B, new THREE.BoxGeometry(0.62, 0.3, 0.12), leather, m4(0, 2.3, -0.28));
      add(B, new THREE.BoxGeometry(0.4, 0.22, 0.1), leather, m4(0, 2.28, 0.46));
      for (const s of [-1, 1]) add(B, new THREE.BoxGeometry(0.04, 0.9, 1.0), cloth, m4(s * 0.56, 1.72, 0.05, 0, 0, s * 0.12));
      // Ember glow along the belly.
      for (let k = 0; k < 10; k++) add(B, new THREE.SphereGeometry(0.03, 6, 4), hoofGlow, m4((rnd() - 0.5) * 0.5, 1.0 + rnd() * 0.1, (rnd() - 0.5) * 1.6));
      this.horse.add(mesh(B));
    }
    // Neck and head, pivoting at the withers.
    this.neck = new THREE.Group();
    this.neck.position.set(0, 1.9, 0.95);
    this.horse.add(this.neck);
    {
      const B = new MeshBuilder(null);
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push(new THREE.Vector3(0, t * 0.95, t * 0.45 + t * t * 0.15));
      }
      B.grid(tubeRings(pts, (t) => lerp(0.4, 0.24, t), 14, 1.25), hide, null, { closed: true });
      // A crest of dark bristle under the flames.
      tube(B, pts.map((p) => p.clone().add(new THREE.Vector3(0, 0.22, -0.18))), 0.06, leather, 6);
      this.neck.add(mesh(B));
      this.headG = new THREE.Group();
      this.headG.position.set(0, 0.98, 0.62);
      this.neck.add(this.headG);
      const H = new MeshBuilder(null);
      const rings = [];
      for (let j = 0; j <= 12; j++) {
        const t = j / 12;
        const z = t * 0.72;
        const w = lerp(0.2, 0.13, t) * (1 + 0.15 * Math.sin(t * Math.PI));
        const top = lerp(0.2, 0.1, t);
        const bot = lerp(-0.22, -0.14, t);
        const ring = [];
        for (let i = 0; i <= 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const c = Math.cos(a);
          const s = Math.sin(a);
          ring.push(new THREE.Vector3(w * c, s > 0 ? top * s : bot * -s * -1, z));
        }
        rings.push(ring);
      }
      H.grid(rings, hide, null, { closed: false, outward: (p) => new THREE.Vector3(p.x, p.y, 0) });
      // Chamfron with a spike, ears, eyes like coals.
      add(H, new THREE.BoxGeometry(0.28, 0.06, 0.5), armor, m4(0, 0.2, 0.3, -0.12, 0, 0));
      add(H, new THREE.ConeGeometry(0.04, 0.3, 6), steel, m4(0, 0.3, 0.26, -0.5, 0, 0));
      for (const s of [-1, 1]) {
        add(H, new THREE.ConeGeometry(0.05, 0.16, 6), hide, m4(s * 0.1, 0.24, 0.02, -0.3, 0, s * 0.2));
        add(H, new THREE.SphereGeometry(0.045, 10, 8), eyes, m4(s * 0.16, 0.08, 0.2));
        add(H, new THREE.SphereGeometry(0.03, 8, 6), eyes, m4(s * 0.07, -0.05, 0.71), 1);
      }
      this.headG.add(mesh(H));
      this.headG.rotation.x = 0.95;
    }
    // Legs: shoulder/hip, knee, hoof.
    this.legs = [];
    const legDef = [
      [0.3, 1.38, 0.88, true],
      [-0.3, 1.38, 0.88, true],
      [0.32, 1.5, -0.98, false],
      [-0.32, 1.5, -0.98, false],
    ];
    for (const [x, y, z, front] of legDef) {
      const hip = new THREE.Group();
      hip.position.set(x, y, z);
      this.horse.add(hip);
      const U = new MeshBuilder(null);
      const upper = front ? 0.72 : 0.78;
      add(U, new THREE.CylinderGeometry(front ? 0.17 : 0.2, 0.1, upper, 12), hide, m4(0, -upper / 2, 0));
      add(U, new THREE.SphereGeometry(front ? 0.2 : 0.24, 12, 8), hide, m4(0, -0.05, 0));
      hip.add(mesh(U));
      const knee = new THREE.Group();
      knee.position.set(0, -upper, 0);
      hip.add(knee);
      const L = new MeshBuilder(null);
      const lower = front ? 0.6 : 0.62;
      add(L, new THREE.SphereGeometry(0.1, 10, 8), hide, m4(0, 0, 0));
      add(L, new THREE.CylinderGeometry(0.07, 0.065, lower, 10), hide, m4(0, -lower / 2, 0));
      // Feathered fetlock and a hoof shod in embers.
      add(L, new THREE.CylinderGeometry(0.1, 0.13, 0.14, 12), hide, m4(0, -lower + 0.02, 0.02));
      add(L, new THREE.CylinderGeometry(0.1, 0.12, 0.11, 12), armor, m4(0, -lower - 0.08, 0.03));
      add(L, new THREE.CylinderGeometry(0.115, 0.115, 0.02, 12), hoofGlow, m4(0, -lower - 0.14, 0.03));
      knee.add(mesh(L));
      this.legs.push({ hip, knee, front, upper, lower, phase: 0, lastStance: false, x });
    }
    // Tail root.
    this.tailRoot = new THREE.Vector3(0, 1.9, -1.55);

    // The rider, in the saddle.
    this.rider = new THREE.Group();
    this.rider.position.set(0, 2.28, 0.1);
    this.horse.add(this.rider);
    {
      const B = new MeshBuilder(null);
      for (const s of [-1, 1]) {
        tube(B, [new THREE.Vector3(s * 0.16, 0.05, 0), new THREE.Vector3(s * 0.36, -0.1, 0.22), new THREE.Vector3(s * 0.46, -0.3, 0.38)], 0.12, armor);
        tube(B, [new THREE.Vector3(s * 0.46, -0.3, 0.38), new THREE.Vector3(s * 0.5, -0.62, 0.3), new THREE.Vector3(s * 0.5, -0.86, 0.26)], 0.09, armor);
        add(B, new THREE.SphereGeometry(0.12, 10, 8), trim, m4(s * 0.46, -0.3, 0.4));
        add(B, new THREE.BoxGeometry(0.13, 0.1, 0.32), armor, m4(s * 0.5, -0.92, 0.34));
      }
      this.rider.add(mesh(B));
    }
    this.torso = new THREE.Group();
    this.torso.position.set(0, 0.12, 0);
    this.rider.add(this.torso);
    {
      const B = new MeshBuilder(null);
      const g = new THREE.LatheGeometry([[0.2, 0], [0.27, 0.1], [0.3, 0.3], [0.36, 0.48], [0.34, 0.6], [0.2, 0.68], [0.1, 0.7]].map(([r, y]) => new THREE.Vector2(r, y)), 20);
      add(B, g, armor, m4(0, 0, 0, 0, 0, 0, 1, 1, 0.82));
      // A ridge down the breastplate, gold edging, lames over the hips.
      add(B, new THREE.BoxGeometry(0.04, 0.5, 0.06), trim, m4(0, 0.35, 0.28, -0.12, 0, 0));
      for (let k = 0; k < 4; k++) add(B, new THREE.CylinderGeometry(0.31 + k * 0.025, 0.33 + k * 0.025, 0.08, 20, 1, true), armor, m4(0, -0.04 - k * 0.07, 0, 0, 0, 0, 1, 1, 0.85));
      // Pauldrons: layered plates with a spike.
      for (const s of [-1, 1]) {
        for (let k = 0; k < 3; k++) add(B, new THREE.SphereGeometry(0.2 - k * 0.02, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), k === 0 ? armor : trim, m4(s * (0.37 + k * 0.02), 0.62 - k * 0.07, 0, 0, 0, s * (-0.5 - k * 0.2)));
        add(B, new THREE.ConeGeometry(0.035, 0.22, 6), steel, m4(s * 0.44, 0.78, 0, 0, 0, s * -0.6));
      }
      add(B, new THREE.CylinderGeometry(0.13, 0.17, 0.12, 14), armor, m4(0, 0.72, 0));
      this.torso.add(mesh(B));
    }
    this.helm = new THREE.Group();
    this.helm.position.set(0, 0.78, 0.02);
    this.torso.add(this.helm);
    {
      const B = new MeshBuilder(null);
      add(B, new THREE.CylinderGeometry(0.17, 0.19, 0.34, 18), armor, m4(0, 0.17, 0));
      add(B, new THREE.SphereGeometry(0.17, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), armor, m4(0, 0.34, 0, 0, 0, 0, 1, 0.6, 1));
      add(B, new THREE.BoxGeometry(0.28, 0.03, 0.05), eyes, m4(0, 0.2, 0.17));
      for (let k = 0; k < 5; k++) add(B, new THREE.BoxGeometry(0.02, 0.1, 0.03), armor, m4(-0.08 + k * 0.04, 0.08, 0.18));
      // Horns sweeping out and forward.
      for (const s of [-1, 1]) {
        const pts = [];
        for (let i = 0; i <= 8; i++) {
          const t = i / 8;
          pts.push(new THREE.Vector3(s * (0.16 + t * 0.32), 0.28 + Math.sin(t * Math.PI * 0.8) * 0.28, -0.02 + t * t * 0.3));
        }
        B.grid(tubeRings(pts, (t) => 0.06 * (1 - t) + 0.006, 8), bone, null, { closed: true });
      }
      this.helm.add(mesh(B));
    }
    // Arms: the right couches the lance, the left holds the reins.
    this.arms = [];
    for (const s of [-1, 1]) {
      const upper = new THREE.Group();
      const fore = new THREE.Group();
      const hand = new THREE.Group();
      this.torso.add(upper, fore, hand);
      const U = new MeshBuilder(null);
      add(U, new THREE.CylinderGeometry(0.085, 0.075, 0.32, 10), armor, m4(0, -0.16, 0));
      add(U, new THREE.SphereGeometry(0.09, 10, 8), trim, m4(0, -0.32, 0));
      upper.add(mesh(U));
      const F = new MeshBuilder(null);
      add(F, new THREE.CylinderGeometry(0.075, 0.09, 0.3, 10), armor, m4(0, -0.15, 0));
      add(F, new THREE.CylinderGeometry(0.1, 0.085, 0.08, 10), trim, m4(0, -0.28, 0));
      fore.add(mesh(F));
      const Hn = new MeshBuilder(null);
      add(Hn, new THREE.BoxGeometry(0.1, 0.1, 0.12), armor, m4(0, 0, 0));
      hand.add(mesh(Hn));
      this.arms.push({ s, upper, fore, hand, shoulder: new THREE.Vector3(s * 0.4, 0.6, 0) });
    }
    // The lance, pivoting at the grip; its head burns.
    this.lanceG = new THREE.Group();
    this.torso.add(this.lanceG);
    {
      const B = new MeshBuilder(null);
      add(B, new THREE.CylinderGeometry(0.035, 0.045, 4.2, 10), wood, m4(0, 0, 1.3, Math.PI / 2, 0, 0));
      add(B, new THREE.ConeGeometry(0.16, 0.5, 14, 1, true), armor, m4(0, 0, 0.35, -Math.PI / 2, 0, 0));
      add(B, new THREE.TorusGeometry(0.05, 0.015, 6, 12), trim, m4(0, 0, 3.3));
      // Leaf-shaped head.
      const leaf = new THREE.LatheGeometry([[0.001, 0], [0.07, 0.12], [0.08, 0.3], [0.05, 0.5], [0.001, 0.62]].map(([r, y]) => new THREE.Vector2(r, y)), 4);
      add(B, leaf, steel, m4(0, 0, 3.35, Math.PI / 2, 0, 0, 1, 1, 0.35));
      this.lanceG.add(mesh(B));
    }
    // The cloak: cloth over the shoulders, streaming back over the horse.
    const cols = 11;
    const rows = 13;
    const rest = (c, r) => {
      const u = (c / (cols - 1)) * 2 - 1;
      const v = r / (rows - 1);
      return new THREE.Vector3(u * (0.34 + v * 0.35), 0.64 - v * 1.35, -0.16 - v * 0.55 - Math.cos(u * 1.4) * 0.05);
    };
    const surface = mat('#1b1416', { pat: PAT.cloak, rough: 0.95, trans: 0.12, bump: 1, rim: 0.9 });
    this.cape = new Cloth(this.material, cols, rows, rest, surface, [1.4, 1.7]);
    this.cape.drag = 2.2;
    this.capeColliders = {
      spheres: [[new THREE.Vector3(), 0.72], [new THREE.Vector3(), 0.4]],
      capsules: [[new THREE.Vector3(), new THREE.Vector3(), 0.66]],
    };
    // The cloth lives in world space, beside (not inside) the moving rig.
    this.stage.group.add(this.cape.mesh);
  }

  // Orient group g at p so its -Y runs along dir, +Z toward fwd.
  aim(g, p, dir, fwd) {
    _y.copy(dir).negate().normalize();
    _z.copy(fwd).addScaledVector(_y, -fwd.dot(_y));
    if (_z.lengthSq() < 1e-6) _z.set(0, 0, 1).addScaledVector(_y, -_y.z);
    _z.normalize();
    _x.crossVectors(_y, _z).normalize();
    _m.makeBasis(_x, _y, _z);
    g.position.copy(p);
    g.quaternion.setFromRotationMatrix(_m);
  }

  // Two-bone arm from shoulder to hand (torso space), elbow out and down.
  poseArm(A, hand) {
    const S = A.shoulder;
    const L1 = 0.33;
    const L2 = 0.31;
    const d0 = _v.subVectors(hand, S);
    let d = d0.length();
    if (d > L1 + L2 - 0.01) {
      hand.copy(S).addScaledVector(d0.normalize(), L1 + L2 - 0.01);
      d = L1 + L2 - 0.01;
    }
    const dir = _v.subVectors(hand, S).normalize().clone();
    const pole = new THREE.Vector3(A.s * 0.8, -0.6, -0.2).normalize();
    pole.addScaledVector(dir, -pole.dot(dir)).normalize();
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(L1 * L1 - a * a, 0));
    const elbow = S.clone().addScaledVector(dir, a).addScaledVector(pole, h);
    const fwd = new THREE.Vector3(0, 0, 1);
    this.aim(A.upper, S, elbow.clone().sub(S), fwd);
    this.aim(A.fore, elbow, hand.clone().sub(elbow), fwd);
    A.hand.position.copy(hand);
  }

  // --- posing and the gait ----------------------------------------------------------

  pose(dt, time) {
    this.root.position.copy(this.pos);
    this.root.rotation.set(0, this.yaw, 0);
    const H = this.horse;
    // Gait: the phase runs with the ground covered.
    const sp = Math.abs(this.speed);
    const g = sp < 2.4 ? GAITS.walk : sp < 7 ? GAITS.trot : GAITS.gallop;
    this.gaitPhase = (this.gaitPhase + (dt * sp) / g.stride) % 1;
    const still = smooth(0.3, 1.2, sp);
    // Rearing pivots on the hind hooves; kneeling folds the forelegs; falling rolls him over.
    const rearA = this.rear * 1.0;
    const pivot = _w.set(0, 0.05, -0.98);
    const bob = sp > 7 ? Math.cos(this.gaitPhase * Math.PI * 4) * 0.08 : sp > 2.4 ? Math.abs(Math.sin(this.gaitPhase * Math.PI * 2)) * 0.05 : 0;
    const kneelDrop = this.kneel * 0.75;
    H.rotation.set(-rearA + this.kneel * 0.32 + (sp > 7 ? Math.sin(this.gaitPhase * Math.PI * 2) * 0.05 : 0), 0, this.fall * 1.45, 'XYZ');
    // Keep the pivot where it was.
    const c = Math.cos(-rearA);
    const s = Math.sin(-rearA);
    const py = pivot.y * c - pivot.z * s;
    const pz = pivot.y * s + pivot.z * c;
    H.position.set(this.fall * 0.9, pivot.y - py + bob * still - kneelDrop - this.fall * 0.6, pivot.z - pz + this.kneel * 0.3);
    // Legs.
    this.legs.forEach((L, i) => {
      const ph = (this.gaitPhase + g.off[i]) % 1;
      let upper = 0;
      let knee = 0;
      if (sp > 0.2) {
        if (ph < g.duty) {
          const u = ph / g.duty;
          upper = lerp(-g.amp, g.amp, u);
          knee = 0.08;
        } else {
          const u = (ph - g.duty) / (1 - g.duty);
          upper = lerp(g.amp, -g.amp, easeInOut(u));
          knee = Math.sin(u * Math.PI) * g.knee;
        }
        const stance = ph < g.duty;
        if (stance && !L.lastStance && sp > 0.8 && Math.random() < 0.9) this.g.audio?.play('hoof', { pos: this.pos, pitch: 0.8 + Math.random() * 0.3 });
        if (stance && !L.lastStance && sp > 7 && Math.random() < 0.5) this.hoofFx(L);
        L.lastStance = stance;
      }
      upper *= still;
      knee *= still;
      if (L.front) {
        // Rearing: forelegs paw the air.
        const flail = Math.sin(time * 9 + i * 1.7);
        upper = lerp(upper, -0.6 + flail * 0.5, this.rear);
        knee = lerp(knee, 1.4 + flail * 0.4, this.rear);
        upper = lerp(upper, -0.2, this.kneel);
        knee = lerp(knee, 2.4, this.kneel);
        L.hip.rotation.x = upper;
        L.knee.rotation.x = knee;
      } else {
        upper = lerp(upper, rearA * 0.9 + 0.25, this.rear);
        knee = lerp(knee, -0.5, this.rear);
        L.hip.rotation.x = upper + this.kneel * 0.3;
        L.knee.rotation.x = -knee * 0.6;
      }
    });
    // Neck and head: tossing at the gallop, flung up when rearing.
    this.neck.rotation.x = -0.1 + Math.sin(this.gaitPhase * Math.PI * 4) * 0.08 * still - this.rear * 0.4 + this.kneel * 0.5 + (this.neckNod || 0);
    this.headG.rotation.x = 0.95 - this.rear * 0.3 + (this.headToss || 0);
    // Rider: stays upright over a rearing horse; the lance by its pose.
    this.rider.rotation.x = rearA * 0.7 - this.kneel * 0.25;
    this.torso.rotation.set(this.riderLean || 0, this.riderTwist || 0, 0, 'YXZ');
    this.helm.rotation.set(this.helmNod || 0, this.helmYaw || 0, 0, 'YXZ');
    const L = this.lance;
    const grip = new THREE.Vector3(-0.28 + L.reach * 0.05, 0.3 + L.reach * 0.1, 0.14 + L.reach * 0.35);
    this.lanceG.position.copy(grip);
    this.lanceG.rotation.set(-L.pitch, L.yaw, 0, 'YXZ');
    this.poseArm(this.arms[0], grip.clone().add(new THREE.Vector3(0, 0, 0.02)));
    this.poseArm(this.arms[1], new THREE.Vector3(0.18, 0.22, 0.42));
    this.root.updateMatrixWorld(true);
    this.updateVolumes(time);
    // Cloak.
    const C = this.capeColliders;
    C.spheres[0][0].set(0, 1.62, -0.95).applyMatrix4(H.matrixWorld);
    C.spheres[1][0].set(0, 0.3, -0.02).applyMatrix4(this.torso.matrixWorld);
    C.capsules[0][0].set(0, 1.6, -0.9).applyMatrix4(H.matrixWorld);
    C.capsules[0][1].set(0, 1.6, 0.8).applyMatrix4(H.matrixWorld);
    const back = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    if (this.cape.mesh.visible) this.cape.update(dt, this.torso.matrixWorld, this.g.wind, C, back);
  }

  hoofFx(L) {
    const p = new THREE.Vector3(0, -L.lower - 0.14, 0).applyMatrix4(L.knee.matrixWorld);
    this.stage.splash(p.x, p.z, 0.3);
    this.stage.fx.add.burst(p.x, 0.05, p.z, 5, { vel: [0, 1.5, 0], scatter: 1.2, life: 0.5, size: [0.05, 0.02], color: [4, 1.4, 0.3, 1], color1: [1, 0.2, 0.02, 0], gravity: 6, kind: PK.ember }, 0.1);
  }

  updateVolumes(time) {
    const V = this.vols;
    const H = this.horse.matrixWorld;
    V.body.a.set(0, 1.55, -0.95).applyMatrix4(H);
    V.body.b.set(0, 1.55, 0.95).applyMatrix4(H);
    V.neck.a.set(0, 0.1, 0).applyMatrix4(this.neck.matrixWorld);
    V.neck.b.set(0, 0.9, 0.5).applyMatrix4(this.neck.matrixWorld);
    V.head.a.set(0, 0, 0.1).applyMatrix4(this.headG.matrixWorld);
    V.head.b.set(0, -0.05, 0.6).applyMatrix4(this.headG.matrixWorld);
    V.rider.a.set(0, 0.0, 0).applyMatrix4(this.torso.matrixWorld);
    V.rider.b.set(0, 0.62, 0).applyMatrix4(this.torso.matrixWorld);
    V.helm.a.set(0, 0.1, 0).applyMatrix4(this.helm.matrixWorld);
    V.helm.b.set(0, 0.32, 0).applyMatrix4(this.helm.matrixWorld);
    this.legs.forEach((L, i) => {
      V.legs[i].a.set(0, -0.1, 0).applyMatrix4(L.hip.matrixWorld);
      V.legs[i].b.set(0, -L.lower, 0).applyMatrix4(L.knee.matrixWorld);
    });
    this.lanceBase = (this.lanceBase || new THREE.Vector3()).set(0, 0, 0.4).applyMatrix4(this.lanceG.matrixWorld);
    this.lanceTip = (this.lanceTip || new THREE.Vector3()).set(0, 0, 3.8).applyMatrix4(this.lanceG.matrixWorld);
    this.lookPoint.set(0, 0.2, 0).applyMatrix4(this.helm.matrixWorld);
    this.focus.set(this.pos.x, 2.2, this.pos.z);
    this.char.anim.headWorld.copy(this.lookPoint);
    this.body.pos.copy(this.pos);
    this.body.yaw = this.yaw;
    // The horse is solid; he cannot be walked through.
    this.solids.length = 0;
    if (this.fall < 0.5) this.solids.push([(V.body.a.x + V.body.b.x) / 2, (V.body.a.z + V.body.b.z) / 2, 0.9], [V.body.b.x, V.body.b.z, 0.7], [V.body.a.x, V.body.a.z, 0.7]);
    // Fire: the lance head, the mane, the tail.
    const glow = this.material.uniforms.uGlow.value.w;
    const fx = this.stage.fx;
    const blue = this.fireBlue;
    const fc = [lerp(4, 1.4, blue), lerp(1.6, 2.2, blue), lerp(0.35, 4.5, blue), 1];
    const fc1 = [lerp(1.4, 0.3, blue), lerp(0.25, 0.6, blue), lerp(0.04, 1.8, blue), 0];
    if (this.lanceFire > 0.05 && glow > 0.1) {
      for (let k = 0; k < 2; k++) {
        const t = 0.85 + Math.random() * 0.15;
        const p = _v.lerpVectors(this.lanceBase, this.lanceTip, t);
        fx.add.emit(p.x, p.y, p.z, { vel: [(Math.random() - 0.5) * 0.4, 1.4, (Math.random() - 0.5) * 0.4], life: 0.45, size: [0.35 * this.lanceFire, 0.1], color: fc, color1: fc1, drag: 1.2, kind: PK.flame });
      }
      const I = 3.2 * this.lanceFire * glow;
      this.stage.lights.set(0, this.lanceTip.x, this.lanceTip.y, this.lanceTip.z, 9, fc[0] * I * 0.45, fc[1] * I * 0.45, fc[2] * I * 0.45);
    } else this.stage.lights.off(0);
    if (glow > 0.1 && this.fall < 0.3) {
      // Mane along the neck's crest, tail from the rump.
      const t = Math.random();
      const p = new THREE.Vector3(0, 0.22 + t * 0.95, -0.18 + t * 0.6).applyMatrix4(this.neck.matrixWorld);
      fx.add.emit(p.x, p.y, p.z, { vel: [-Math.sin(this.yaw) * this.speed * 0.4 + (Math.random() - 0.5) * 0.3, 1.1, -Math.cos(this.yaw) * this.speed * 0.4 + (Math.random() - 0.5) * 0.3], life: 0.5, size: [0.3, 0.08], color: fc, color1: fc1, drag: 1.5, kind: PK.flame });
      const tp = this.tailRoot.clone().applyMatrix4(H);
      fx.add.emit(tp.x, tp.y - Math.random() * 0.6, tp.z, { vel: [-Math.sin(this.yaw) * (this.speed * 0.5 + 1) + (Math.random() - 0.5) * 0.5, 0.6 - Math.random() * 0.6, -Math.cos(this.yaw) * (this.speed * 0.5 + 1)], life: 0.6, size: [0.32, 0.08], color: fc, color1: fc1, drag: 1.3, kind: PK.flame });
    }
  }

  // --- steering ----------------------------------------------------------------------

  // Turn toward a heading and run at a speed, as a horse can (wide turns at speed).
  ride(yawWant, speedWant, dt, turnMul = 1) {
    const sp = Math.abs(this.speed);
    const rate = (sp > 7 ? 0.9 : sp > 2.4 ? 1.7 : 2.4) * turnMul;
    this.yaw = wrapAngle(this.yaw + clamp(wrapAngle(yawWant - this.yaw), -rate * dt, rate * dt));
    const acc = speedWant > this.speed ? 6 : 9;
    this.speed += clamp(speedWant - this.speed, -acc * dt, acc * dt);
  }

  move(dt) {
    this.pos.x += Math.sin(this.yaw) * this.speed * dt;
    this.pos.z += Math.cos(this.yaw) * this.speed * dt;
    const r = Math.hypot(this.pos.x, this.pos.z);
    if (r > ARENA_R) {
      this.pos.multiplyScalar(ARENA_R / r);
      this.pos.y = 0;
    }
  }

  yawTo(p) {
    return Math.atan2(p.x - this.pos.x, p.z - this.pos.z);
  }

  // Circle him at a distance, as a horseman does.
  circle(dt, radius = 10, speed = 5.5) {
    const P = this.g.player.pos;
    const a = Math.atan2(this.pos.x - P.x, this.pos.z - P.z);
    const next = a + this.circleDir * 0.5;
    const tx = P.x + Math.sin(next) * radius;
    const tz = P.z + Math.cos(next) * radius;
    // Keep inside the walls.
    const r = Math.hypot(tx, tz);
    const k = r > ARENA_R - 1.5 ? (ARENA_R - 1.5) / r : 1;
    this.ride(Math.atan2(tx * k - this.pos.x, tz * k - this.pos.z), speed, dt);
  }

  // --- the fight ------------------------------------------------------------------------

  reset() {
    super.reset();
    this.pos.set(0, 0, -11);
    this.yaw = 0;
    this.speed = 0;
    this.rear = 0;
    this.kneel = 0;
    this.fall = 0;
    this.fireBlue = 0;
    this.lanceFire = 1;
    Object.assign(this.lance, { yaw: 0.05, pitch: 0.12, reach: 0 });
    this.riderLean = 0;
    this.riderTwist = 0;
    this.helmNod = 0;
    this.helmYaw = 0;
    this.neckNod = 0;
    this.headToss = 0;
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.cape.mesh.visible = true;
    this.cape.ready = false;
    this.rider.position.set(0, 2.28, 0.1);
    this.rider.rotation.set(0, 0, 0);
  }

  startIntro() {
    this.setState('intro');
    this.introFx = 0;
    this.material.uniforms.uGlow.value.w = 0;
    this.lanceFire = 0;
    this.lance.pitch = -1.2;
  }

  // Waiting in the rain; lightning finds him; the fire wakes; he rears; the lance comes down.
  updateIntro(dt) {
    const t = this.stateT;
    const glow = this.material.uniforms.uGlow.value;
    this.speed = 0;
    const P = this.g.player.pos;
    this.yaw = damp(this.yaw, this.yawTo(P), 1.5, dt);
    glow.w = smooth(4.6, 5.4, t) * (t < 5.4 ? (Math.sin(t * 50) > 0 ? 1 : 0.2) : 1);
    this.lanceFire = smooth(5.0, 5.8, t);
    this.rear = smooth(6.0, 6.7, t) * (1 - smooth(7.4, 8.1, t));
    this.lance.pitch = lerp(-1.2, 0.12, smooth(7.6, 8.6, t));
    this.helmNod = lerp(0.35, 0, smooth(4.6, 5.6, t));
    if (t > 5.0 && this.introFx < 1) {
      this.introFx = 1;
      this.g.audio?.play('fire', { pos: this.pos, pitch: 0.7 });
    }
    if (t > 6.1 && this.introFx < 2) {
      this.introFx = 2;
      this.g.audio?.play('whinny', { pos: this.pos });
      this.stage.lightning(this.pos.clone().add(new THREE.Vector3(-6, 0, -4)), 1.5);
    }
    if (t > 7.5 && this.introFx < 3) {
      this.introFx = 3;
      this.g.rig.shake(0.7);
      this.stage.splash(this.pos.x, this.pos.z + 1, 1.6);
      this.g.audio?.play('slam', { pos: this.pos, pitch: 1.1 });
    }
    return t > 9.8;
  }

  skipIntro() {
    this.stateT = 9.8;
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.lanceFire = 1;
    this.rear = 0;
    this.lance.pitch = 0.12;
    this.helmNod = 0;
  }

  endIntro() {
    if (this.state === 'intro') this.skipIntro();
    this.setState('idle');
    this.cooldown = 1.4;
  }

  previewPose() {
    this.setState('preview');
    this.pos.set(-0.6, 0, -6.5);
    this.yaw = 0.35;
    this.speed = 0;
    this.rear = 0.65;
    this.lance.pitch = 0.55;
    this.lance.yaw = 0.25;
    this.helmNod = -0.1;
  }

  updateIdle(dt) {
    this.circle(dt, 10, this.phase === 2 ? 7 : 5.5);
    if (Math.random() < dt * 0.15) this.circleDir *= -1;
    this.relax(dt);
  }

  relax(dt) {
    const L = this.lance;
    L.pitch = damp(L.pitch, 0.12, 3, dt);
    L.yaw = damp(L.yaw, 0.05, 3, dt);
    L.reach = damp(L.reach, 0, 4, dt);
    this.rear = damp(this.rear, 0, 4, dt);
    this.riderLean = damp(this.riderLean || 0, 0, 3, dt);
    this.riderTwist = damp(this.riderTwist || 0, 0, 3, dt);
    this.neckNod = damp(this.neckNod || 0, 0, 3, dt);
    const P = this.g.player.pos;
    this.helmYaw = damp(this.helmYaw || 0, clamp(wrapAngle(this.yawTo(P) - this.yaw), -1.1, 1.1), 3, dt);
  }

  glint(p, parryable) {
    this.g.fx.glints.flash(p.clone(), { color: parryable ? 0xfff4e0 : 0xff4020, size: 1.1, life: 0.45, intensity: 12 });
    this.g.audio?.play(parryable ? 'glint' : 'warn', { pos: p });
  }

  firePatch(x, z, life = 3.5) {
    const S = this.stage;
    S.hazards.add({ shape: 'circle', x, z, r: 1.0, delay: 0.1, dur: life, tick: 0.5, dmg: 7, react: 'flinch', owner: this, height: 1.2 });
    this.firePatches = this.firePatches || [];
    this.firePatches.push({ x, z, t: life });
  }

  defineAttacks() {
    const self = this;
    const S = () => self.stage;
    this.attacks = {
      charge: {
        weight: 2.6,
        range: [6, 40],
        dur: 5.4,
        cooldown: 0.8,
        start(a) {
          a.data.dir = null;
          a.data.trail = 0;
          a.data.strikes = 0;
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          const L = self.lance;
          if (t < 1.4) {
            // Wheel round to face him, rear, level the lance.
            self.ride(self.yawTo(P), t < 0.5 ? 2 : 0, dt, 2.2);
            self.rear = smooth(0.4, 0.8, t) * (1 - smooth(1.0, 1.35, t)) * 0.7;
            L.pitch = damp(L.pitch, 0.02, 4, dt);
            L.yaw = damp(L.yaw, 0.12, 4, dt);
            if (self.at(a, 0.55)) self.g.audio?.play('whinny', { pos: self.pos, pitch: 1.1 });
            if (self.at(a, 1.0)) self.glint(self.lanceTip, false);
            if (self.at(a, 0.3)) {
              a.data.tel = S().telegraphs.add({ shape: SHAPE.rect, x: 0, z: 0, w: 1.25, l: 12, wind: 1.1, hold: 0.8, color: [3.6, 0.55, 0.12] });
            }
            if (a.data.tel) {
              const f = new THREE.Vector3(Math.sin(self.yaw), 0, Math.cos(self.yaw));
              a.data.tel.x = self.pos.x + f.x * 12;
              a.data.tel.z = self.pos.z + f.z * 12;
              a.data.tel.rot = self.yaw;
            }
          } else if (t < 4.0) {
            if (!a.data.dir) {
              a.data.dir = self.yaw;
              self.g.audio?.play('whoosh', { pos: self.pos, pitch: 0.7 });
            }
            const edge = Math.hypot(self.pos.x, self.pos.z) > ARENA_R - 1.2 && t > 1.8;
            self.ride(a.data.dir, edge ? 3 : 15, dt, 0.2);
            self.riderLean = damp(self.riderLean || 0, 0.25, 4, dt);
            // Lance and horse both strike.
            self.limbStrike(a, 'charge', self.lanceBase, self.lanceTip, 0.3, { dmg: 32, react: 'knockdown', unblockable: true });
            const V = self.vols.body;
            self.limbStrike(a, 'charge', V.a, V.b, V.r + 0.1, { dmg: 26, react: 'knockdown', unblockable: true });
            if (self.phase === 2) {
              a.data.trail += dt * Math.abs(self.speed);
              if (a.data.trail > 1.6) {
                a.data.trail = 0;
                const f = new THREE.Vector3(Math.sin(self.yaw), 0, Math.cos(self.yaw));
                self.firePatch(self.pos.x - f.x * 1.5, self.pos.z - f.z * 1.5);
                if (a.data.strikes < 3 && Math.random() < 0.4) {
                  a.data.strikes++;
                  self.strikeAt(self.pos.x - f.x * 3, self.pos.z - f.z * 3, 0.9);
                }
              }
            }
          } else {
            self.ride(self.yawTo(P), 0, dt, 1.5);
            self.riderLean = damp(self.riderLean || 0, 0, 3, dt);
          }
        },
      },
      sweep: {
        weight: 2.2,
        range: [0, 10],
        dur: 3.6,
        cooldown: 1.0,
        start(a) {
          a.data.fired = [];
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          const L = self.lance;
          // Close in alongside him, then swing the burning lance across.
          if (t < 1.2) {
            const d = self.playerDist();
            const side = wrapAngle(self.yawTo(P) - self.yaw);
            self.ride(self.yawTo(P) - Math.sign(side || 1) * 0.9, d > 3.5 ? 7 : 3, dt, 1.6);
            L.yaw = damp(L.yaw, -1.3, 4, dt);
            L.pitch = damp(L.pitch, -0.05, 4, dt);
            self.riderTwist = damp(self.riderTwist || 0, -0.5, 4, dt);
            if (self.at(a, 0.9)) self.glint(self.lanceTip, false);
            if (self.at(a, 0.6)) {
              const f = self.yaw;
              a.data.tel = S().telegraphs.add({ shape: SHAPE.sector, x: self.pos.x, z: self.pos.z, w: 5, l: 5, rot: f, param: 1.4, wind: 0.65, hold: 0.5, color: [3.6, 0.7, 0.12] });
            }
            if (a.data.tel) {
              a.data.tel.x = self.pos.x;
              a.data.tel.z = self.pos.z;
              a.data.tel.rot = self.yaw;
            }
          } else if (t < 1.75) {
            self.ride(self.yaw, 3, dt);
            const u = easeInOut((t - 1.2) / 0.55);
            L.yaw = lerp(-1.3, 1.4, u);
            self.riderTwist = lerp(-0.5, 0.55, u);
            if (self.at(a, 1.2)) self.g.audio?.play('fire', { pos: self.lanceTip, pitch: 1.2 });
            self.limbStrike(a, 'sweep', self.lanceBase, self.lanceTip, 0.35, { dmg: 26, react: 'knockdown', unblockable: true });
            // Fire left along the arc.
            const tip = self.lanceTip;
            if (!a.data.fired.some((q) => Math.hypot(q[0] - tip.x, q[1] - tip.z) < 1.3)) {
              a.data.fired.push([tip.x, tip.z]);
              self.firePatch(tip.x, tip.z, self.phase === 2 ? 5 : 3.5);
            }
          } else {
            self.ride(self.yaw, 4, dt);
            self.relax(dt);
          }
        },
      },
      rear: {
        weight: () => (self.playerDist() < 5 ? 3 : 1),
        range: [0, 7],
        dur: 3.0,
        cooldown: 0.9,
        start(a) {
          const f = new THREE.Vector3(Math.sin(self.yaw), 0, Math.cos(self.yaw));
          a.data.pt = self.pos.clone().addScaledVector(f, 1.9);
          a.data.tel = S().telegraphs.add({ shape: SHAPE.circle, x: a.data.pt.x, z: a.data.pt.z, w: 2.6, wind: 1.25, hold: 0.25, color: [3.6, 0.5, 0.1] });
          self.g.audio?.play('whinny', { pos: self.pos, pitch: 0.9 });
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          if (t < 0.6) self.ride(self.yawTo(P), 0, dt, 1.5);
          else self.ride(self.yaw, 0, dt);
          const f = new THREE.Vector3(Math.sin(self.yaw), 0, Math.cos(self.yaw));
          a.data.pt.copy(self.pos).addScaledVector(f, 1.9);
          a.data.tel.x = a.data.pt.x;
          a.data.tel.z = a.data.pt.z;
          self.rear = t < 1.1 ? easeOut(smooth(0, 1.0, t)) : 1 - easeIn(smooth(1.1, 1.3, t));
          self.lance.pitch = damp(self.lance.pitch, t < 1.1 ? 0.9 : 0.1, 4, dt);
          if (self.at(a, 1.3)) {
            const p = a.data.pt;
            S().hazards.add({ shape: 'circle', x: p.x, z: p.z, r: 2.6, dur: 0.12, dmg: 28, react: 'knockdown', owner: self });
            S().hazards.add({ shape: 'ring', x: p.x, z: p.z, r0: 2.4, speed: 8, width: 0.55, height: 0.65, dur: 1.0, dmg: 14, react: 'stagger', owner: self });
            S().waves.add(p.x, 0, p.z, { speed: 8, max: 10, width: 0.5, height: 0.55, color: [3, 1.2, 0.4], r0: 2.3 });
            S().splash(p.x, p.z, 1.8);
            for (let k = 0; k < 8; k++) S().fire(p.x + (Math.random() - 0.5) * 2, 0.1, p.z + (Math.random() - 0.5) * 2, 1.2, 0.9);
            self.g.rig.shake(0.9);
            self.g.audio?.play('slam', { pos: p, pitch: 1.0 });
          }
        },
      },
      lightning: {
        weight: 1.7,
        range: [0, 40],
        dur: 5.2,
        cooldown: 1.2,
        start(a) {
          a.data.n = self.phase === 2 ? 7 : 5;
          a.data.pts = [];
          self.g.hud?.flash('He calls the storm', 1.2);
        },
        update(a, dt) {
          const t = a.t;
          self.ride(self.yawTo(self.g.player.pos), 0, dt, 1.5);
          const L = self.lance;
          L.pitch = damp(L.pitch, t < 4.2 ? 1.35 : 0.1, 3, dt);
          self.riderLean = damp(self.riderLean || 0, t < 4 ? -0.2 : 0, 3, dt);
          if (self.at(a, 0.9)) {
            // The first bolt finds his raised lance.
            S().lightning(self.lanceTip.clone(), 1.2);
            self.g.audio?.play('flash', { pos: self.lanceTip });
          }
          for (let k = 0; k < a.data.n; k++) {
            const tt = 1.2 + k * 0.42;
            if (self.at(a, tt)) {
              const P = self.g.player.pos;
              const lead = k === 0 ? 0 : 1.8;
              const ang = Math.random() * Math.PI * 2;
              const x = P.x + Math.sin(ang) * lead * Math.random() + self.g.player.vel.x * 0.5;
              const z = P.z + Math.cos(ang) * lead * Math.random() + self.g.player.vel.z * 0.5;
              S().telegraphs.add({ shape: SHAPE.circle, x, z, w: 1.6, wind: 1.0, hold: 0.25, color: [1.6, 2.0, 4.2] });
              a.data.pts.push({ x, z, at: tt + 1.0 });
            }
          }
          for (const s of a.data.pts) {
            if (!s.done && t >= s.at) {
              s.done = true;
              self.strikeAt(s.x, s.z, 1);
            }
          }
        },
      },
      thrust: {
        weight: 2,
        range: [2, 6],
        dur: 2.2,
        cooldown: 0.8,
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          const L = self.lance;
          self.ride(self.yawTo(P), t < 0.5 ? 2 : 0, dt, 2.5);
          const want = wrapAngle(self.yawTo(P) - self.yaw);
          L.yaw = damp(L.yaw, clamp(want, -0.8, 0.8), 6, dt);
          if (t < 0.6) {
            L.reach = lerp(0, -1, smooth(0, 0.55, t));
            L.pitch = damp(L.pitch, 0.18, 6, dt);
          } else if (t < 0.85) L.reach = lerp(-1, 1.4, easeIn((t - 0.6) / 0.25));
          else L.reach = lerp(1.4, 0, smooth(1.2, 2.0, t));
          if (self.at(a, 0.45)) self.glint(self.lanceTip, true);
          if (t > 0.65 && t < 0.9) self.limbStrike(a, 'thrust', self.lanceBase, self.lanceTip, 0.3, { dmg: 20, react: 'stagger', parry: true });
        },
      },
    };
  }

  // A bolt from the clouds to (x, z).
  strikeAt(x, z, s = 1) {
    const S = this.stage;
    S.lightning(new THREE.Vector3(x, 0, z), s);
    S.hazards.add({ shape: 'circle', x, z, r: 1.6, dur: 0.12, dmg: 24, react: 'knockdown', owner: this, height: 3 });
    S.fx.add.burst(x, 0.2, z, 36, { vel: [0, 4, 0], scatter: 4, life: 0.5, size: [0.06, 0.02], color: [3, 3.5, 5, 1], color1: [0.5, 0.6, 1.5, 0], gravity: 9.8, kind: PK.ember, bounce: 0.3 }, 0.2);
    S.splash(x, z, 1.1);
    S.telegraphs.add({ shape: SHAPE.circle, x, z, w: 1.2, wind: 0.01, hold: 2.5, color: [0.4, 0.3, 0.5] });
    this.g.rig.shake(0.35);
    this.g.audio?.play('thunder');
  }

  updateStagger(dt) {
    const t = this.stateT;
    this.speed = damp(this.speed, 0, 5, dt);
    const down = easeOut(smooth(0, 0.6, t)) * (1 - smooth(this.staggerDur - 0.8, this.staggerDur, t));
    this.kneel = down;
    this.riderLean = lerp(0, 0.6, down);
    this.helmNod = lerp(0, 0.5, down);
    this.lance.pitch = damp(this.lance.pitch, -0.6 * down, 4, dt);
    this.lanceFire = 1 - down * 0.6;
  }

  onStagger() {
    this.g.audio?.play('whinny', { pos: this.pos, pitch: 0.7 });
    this.stage.splash(this.pos.x, this.pos.z, 1.5);
  }

  onPhase2() {
    this.phaseFx = 0;
  }

  updatePhase(dt) {
    const t = this.stateT;
    this.ride(this.yaw, 0, dt);
    this.lance.pitch = damp(this.lance.pitch, t < 2.4 ? 1.4 : 0.1, 3, dt);
    this.rear = smooth(0.8, 1.4, t) * (1 - smooth(2.2, 2.8, t)) * 0.8;
    if (t > 0.9 && this.phaseFx < 1) {
      this.phaseFx = 1;
      this.stage.lightning(this.lanceTip.clone(), 2);
      this.g.audio?.play('flash', { pos: this.lanceTip });
      this.g.audio?.play('whinny', { pos: this.pos, pitch: 0.8 });
      this.g.hud?.card('The storm answers', 'Blue fire takes the lance', 3);
    }
    this.fireBlue = smooth(0.9, 1.8, t);
    const glow = this.material.uniforms.uGlow.value;
    glow.set(lerp(1.0, 0.4, this.fireBlue), lerp(0.42, 0.7, this.fireBlue), lerp(0.12, 1.8, this.fireBlue), 1.2);
    return t > 3.2;
  }

  onDeath() {
    this.deathFx = 0;
  }

  // Lightning takes the lance; the horse rears, screams and goes over; the fire dies.
  updateDeath(dt) {
    const t = this.deathT;
    this.speed = damp(this.speed, 0, 3, dt);
    if (t > 0.3 && this.deathFx < 1) {
      this.deathFx = 1;
      this.stage.lightning(this.lanceTip.clone(), 2.5);
      this.g.audio?.play('whinny', { pos: this.pos, pitch: 0.75 });
      this.g.hud?.whiteout(0.35);
    }
    this.rear = smooth(0.2, 0.9, t) * (1 - smooth(1.4, 2.2, t));
    this.fall = easeIn(smooth(1.6, 2.6, t));
    this.riderLean = lerp(0, -0.6, smooth(1.0, 2.2, t));
    this.lance.pitch = lerp(this.lance.pitch, -0.3, 0.05);
    const glow = this.material.uniforms.uGlow.value;
    glow.w = Math.max(0, 1 - smooth(2.4, 4.5, t));
    this.lanceFire = glow.w;
    if (t > 2.6 && this.deathFx < 2) {
      this.deathFx = 2;
      this.g.rig.shake(1.0);
      this.stage.splash(this.pos.x + 1, this.pos.z, 2.5);
      this.g.audio?.play('slam', { pos: this.pos, pitch: 0.7 });
    }
    if (t > 2.6 && Math.random() < dt * 10) {
      const p = this.vols.body.a.clone().lerp(this.vols.body.b, Math.random());
      this.stage.fx.smoke.emit(p.x, p.y + 0.3, p.z, { vel: [0, 1.2, 0], life: 2.5, size: [0.4, 2], color: [0.15, 0.14, 0.14, 0.5], color1: [0.1, 0.1, 0.1, 0], drag: 0.8, kind: PK.smoke });
    }
    return t > 6.5;
  }

  hitFx(point, dir, killing, part) {
    const S = this.stage;
    if (part && (part.part === 'rider' || part.part === 'helm')) {
      S.fx.add.burst(point.x, point.y, point.z, 16, { vel: [-dir.x * 2, 1.5, -dir.z * 2], scatter: 2.5, life: 0.4, size: [0.05, 0.02], color: [5, 3, 1.5, 1], color1: [1.5, 0.4, 0.1, 0], gravity: 9.8, kind: PK.ember }, 0.05);
      this.g.audio?.play('clash', { pos: point });
    } else {
      S.fx.add.burst(point.x, point.y, point.z, killing ? 40 : 18, { vel: [dir.x * 2, 1.5, dir.z * 2], scatter: 2, life: 0.6, size: [0.07, 0.03], color: [4, 1.2, 0.2, 1], color1: [1, 0.15, 0.02, 0], gravity: 6, kind: PK.ember }, 0.1);
      this.g.fx.blood.spray(point, dir, killing ? 30 : 14, 2.5);
    }
  }

  advance(dt, combat, now) {
    super.advance(dt, combat, now);
    if (!this.active) return;
    if (this.state !== 'preview') this.move(dt);
    if (this.state !== 'attack' && this.state !== 'idle' && this.state !== 'preview') this.speed = damp(this.speed, 0, 3, dt);
    // Burning ground where fire was left.
    if (this.firePatches) {
      for (let i = this.firePatches.length - 1; i >= 0; i--) {
        const f = this.firePatches[i];
        f.t -= dt;
        if (Math.random() < dt * 14) this.stage.fire(f.x, 0.05, f.z, 0.9, 0.6);
        if (f.t <= 0) this.firePatches.splice(i, 1);
      }
    }
    this.pose(dt, this.time);
  }
}
