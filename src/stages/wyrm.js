import * as THREE from 'three';
import { Boss, vol, clamp, lerp, smooth, easeOut, easeIn, easeInOut, damp, wrapAngle } from '../boss.js';
import { MeshBuilder, mat } from '../meshbuilder.js';
import { PAT } from '../charmat.js';
import { DynamicTube } from '../tube.js';
import { PK, SHAPE } from '../vfx.js';
import { mulberry32 } from '../noise.js';
import { PILLAR, pillarR } from './caves.js';

// ---------------------------------------------------------------------------
// The Crystal Wyrm: a serpent-dragon of dark iridescent scale, grown through
// with living crystal. Its body is a follow-the-leader chain: wherever the head
// has gone, the body goes after, so it coils about the pillar, pours across the
// floor and dives through the rock. It breathes a spray of crystal, lunges,
// sends lines of spikes bursting from the ground, burrows up beneath its prey,
// lashes its tail from the nearest coil, and brings the roof down in shards.
// Dying, it turns wholly to crystal and shatters.
// ---------------------------------------------------------------------------

const BODY_LEN = 26;
const SPACING = 0.2;
const COIL_R = 4.6;
const RINGS = 64;
const SPINES = 34;

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _u = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function bodyRadius(t) {
  return 0.12 + 0.72 * Math.pow(Math.sin(Math.min(1, t * 1.25 + 0.12) * Math.PI), 0.7) * (1 - t * 0.45) + (t < 0.05 ? (0.05 - t) * 3 : 0);
}

export class Wyrm extends Boss {
  constructor(game, stage) {
    super(game, stage, { name: 'The Crystal Wyrm', epithet: 'Heart of the glittering deep', hp: 2000, poise: 280 });
    this.rand = mulberry32(2024);
    this.glowBase = new THREE.Vector4(0.45, 0.8, 1.7, 1.0);
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.trail = [];
    this.head = new THREE.Vector3();
    this.headDir = new THREE.Vector3(0, 0, 1);
    this.headVel = new THREE.Vector3();
    this.look = { yaw: 0, pitch: 0 };
    this.jaw = 0.1;
    this.coilA = 0;
    this.mode = 'coil';
    this.target = new THREE.Vector3();
    this.bodyPts = Array.from({ length: RINGS }, () => new THREE.Vector3());
    this.tailOverride = null;
    this.build();
    this.volHead = vol('head', 0.95, 1.5);
    this.bodyVols = [];
    for (let k = 0; k < 9; k++) this.bodyVols.push(vol(k === 8 ? 'tail' : 'body', 0.8, k === 8 ? 0.9 : 0.7));
    this.volumes.push(this.volHead, ...this.bodyVols);
    this.staggerDur = 3.8;
    this.defineAttacks();
    this.root.traverse((o) => o.layers && o.layers.enable(1));
  }

  // --- the model --------------------------------------------------------------

  build() {
    const rnd = this.rand;
    const scales = mat('#ffffff', { pat: PAT.scales, rough: 0.33, rim: 1.3 });
    const crystal = mat('#9fd6ff', { pat: PAT.crystal, rough: 0.1, rim: 2.2 });
    const bone = mat('#cfd6e6', { pat: PAT.bone, rough: 0.3, trans: 0.3 });
    const eye = mat('#c8f4ff', { pat: PAT.glow, rim: 8 });
    const mouth = mat('#5a2040', { rough: 0.4 });
    const scaleTint = (p, n) => {
      const top = n ? clamp(n.y * 0.5 + 0.5, 0, 1) : 0.7;
      const k = 0.85 + 0.25 * Math.sin(p.x * 5 + p.z * 3);
      return [lerp(0.28, 0.07, top) * k, lerp(0.24, 0.08, top) * k, lerp(0.4, 0.2, top) * k];
    };
    // Body.
    this.tube = new DynamicTube(this.material, {
      rings: RINGS,
      sides: 14,
      length: BODY_LEN,
      radius: bodyRadius,
      surface: scales,
      tint: (t, u) => {
        const belly = Math.pow(Math.max(0, Math.cos(u * Math.PI * 2)), 2);
        const k = 0.85 + 0.2 * Math.sin(t * 90);
        return [lerp(0.07, 0.3, belly) * k, lerp(0.09, 0.26, belly) * k, lerp(0.2, 0.36, belly) * k];
      },
    });
    this.root.add(this.tube.mesh);
    // Spine crystals, instanced along the back.
    {
      const B = new MeshBuilder(null);
      const pts = [new THREE.Vector2(0.001, -0.2), new THREE.Vector2(0.24, 0), new THREE.Vector2(0.28, 0.5), new THREE.Vector2(0.2, 1.0), new THREE.Vector2(0.001, 1.35)];
      const g = new THREE.LatheGeometry(pts, 6).toNonIndexed();
      g.computeVertexNormals();
      B.add(g, crystal, null, {});
      g.dispose();
      this.spines = new THREE.InstancedMesh(B.build(), this.material, SPINES);
      this.spines.frustumCulled = false;
      this.spineSeed = Array.from({ length: SPINES }, () => ({ tilt: (rnd() - 0.5) * 0.5, s: 0.7 + rnd() * 0.6, twist: rnd() * 6 }));
      this.root.add(this.spines);
    }
    // Head (local +Z forward): skull, jaw, horns, crystal mane, eyes.
    this.headGroup = new THREE.Group();
    this.root.add(this.headGroup);
    const H = new MeshBuilder(null);
    const skull = [];
    const prof = (z) => {
      // half width, top, bottom along the head (z from -1.4 at the neck to 2.3 at the snout)
      const t = (z + 1.4) / 3.7;
      const w = lerp(0.95, 0.32, Math.pow(t, 1.2)) * (1 + 0.15 * Math.exp(-((t - 0.3) ** 2) * 40));
      const top = lerp(0.8, 0.28, Math.pow(t, 0.9)) + 0.12 * Math.exp(-((t - 0.32) ** 2) * 60);
      const bot = lerp(-0.45, -0.12, t);
      return [w, top, bot];
    };
    for (let j = 0; j <= 18; j++) {
      const z = -1.4 + (j / 18) * 3.7;
      const [w, top, bot] = prof(z);
      const ring = [];
      for (let i = 0; i <= 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        ring.push(new THREE.Vector3(w * Math.sign(c) * Math.pow(Math.abs(c), 0.85), s > 0 ? top * Math.pow(s, 0.8) : bot * Math.pow(-s, 0.9), z));
      }
      skull.push(ring);
    }
    H.grid(skull, scales, null, { closed: false, tint: scaleTint, outward: (p) => new THREE.Vector3(p.x, p.y - 0.1, 0) });
    // Brow ridges, nostrils, teeth of the upper jaw.
    for (const s of [-1, 1]) {
      const e = new THREE.SphereGeometry(0.13, 12, 8);
      H.add(e, eye, null, { matrix: new THREE.Matrix4().makeTranslation(s * 0.55, 0.42, 0.45) });
      e.dispose();
      const ridge = new THREE.ConeGeometry(0.12, 0.9, 6);
      ridge.translate(0, 0.45, 0);
      H.add(ridge, bone, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(s * 0.55, 0.62, 0.3), new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.3, 0, s * -0.35)), new THREE.Vector3(1, 1, 1)) });
      ridge.dispose();
      for (let k = 0; k < 8; k++) {
        const z = 0.4 + k * 0.22;
        const [w, , bot] = prof(z);
        const len = 0.14 + (k === 6 ? 0.25 : 0) + rnd() * 0.08;
        const tg = new THREE.ConeGeometry(0.035, len, 5);
        tg.translate(0, -len / 2, 0);
        H.add(tg, bone, null, { matrix: new THREE.Matrix4().makeTranslation(s * w * 0.85, bot + 0.02, z) });
        tg.dispose();
      }
      // Great crystal horns sweeping back from the crown.
      for (let k = 0; k < 3; k++) {
        const len = 2.2 - k * 0.55;
        const hg = new THREE.ConeGeometry(0.16 - k * 0.03, len, 6).toNonIndexed();
        hg.computeVertexNormals();
        hg.translate(0, len / 2, 0);
        H.add(hg, crystal, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(s * (0.45 + k * 0.12), 0.72 - k * 0.1, -0.5 - k * 0.35), new THREE.Quaternion().setFromEuler(new THREE.Euler(-2.1 + k * 0.1, 0, s * (-0.45 - k * 0.15))), new THREE.Vector3(1, 1, 1)) });
        hg.dispose();
      }
    }
    // A crest of crystal down the back of the skull.
    for (let k = 0; k < 5; k++) {
      const len = 0.9 - k * 0.12;
      const g = new THREE.ConeGeometry(0.1, len, 6).toNonIndexed();
      g.computeVertexNormals();
      g.translate(0, len / 2, 0);
      H.add(g, crystal, null, { matrix: new THREE.Matrix4().compose(new THREE.Vector3(0, 0.82 - k * 0.05, 0.1 - k * 0.35), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.9, 0, 0)), new THREE.Vector3(1, 1, 1)) });
      g.dispose();
    }
    this.headMesh = new THREE.Mesh(H.build(), this.material);
    this.headMesh.frustumCulled = false;
    this.headGroup.add(this.headMesh);
    // Jaw hinged under the back of the skull.
    this.jawGroup = new THREE.Group();
    this.jawGroup.position.set(0, -0.3, -0.9);
    this.headGroup.add(this.jawGroup);
    const J = new MeshBuilder(null);
    const jaw = [];
    for (let j = 0; j <= 14; j++) {
      const z = (j / 14) * 3.1;
      const t = j / 14;
      const w = lerp(0.8, 0.26, Math.pow(t, 1.1));
      const d = lerp(0.35, 0.12, t);
      const ring = [];
      for (let i = 0; i <= 16; i++) {
        const a = Math.PI + (i / 16) * Math.PI;
        ring.push(new THREE.Vector3(Math.cos(a) * w, Math.sin(a) * d, z));
      }
      jaw.push(ring);
    }
    J.grid(jaw, scales, null, { closed: false, tint: scaleTint, outward: (p) => new THREE.Vector3(p.x, p.y, 0) });
    const floorG = [];
    for (let j = 0; j <= 14; j++) {
      const z = (j / 14) * 3.1;
      const w = lerp(0.78, 0.25, Math.pow(j / 14, 1.1));
      floorG.push([new THREE.Vector3(-w, 0, z), new THREE.Vector3(0, -0.12, z), new THREE.Vector3(w, 0, z)]);
    }
    J.grid(floorG, mouth, null, { closed: false, outward: () => new THREE.Vector3(0, 1, 0) });
    for (const s of [-1, 1]) {
      for (let k = 0; k < 9; k++) {
        const z = 0.5 + k * 0.28;
        const w = lerp(0.8, 0.26, Math.pow(z / 3.1, 1.1));
        const len = 0.16 + (k === 7 ? 0.28 : 0) + rnd() * 0.08;
        const tg = new THREE.ConeGeometry(0.035, len, 5);
        tg.translate(0, len / 2, 0);
        J.add(tg, bone, null, { matrix: new THREE.Matrix4().makeTranslation(s * w * 0.85, 0.0, z) });
        tg.dispose();
      }
    }
    this.jawMesh = new THREE.Mesh(J.build(), this.material);
    this.jawMesh.frustumCulled = false;
    this.jawGroup.add(this.jawMesh);
    // A glow in the throat for the breath.
    const G = new MeshBuilder(null);
    const gs = new THREE.SphereGeometry(0.3, 12, 8);
    G.add(gs, mat('#bfe8ff', { pat: PAT.glow, rim: 10 }), null, {});
    gs.dispose();
    this.throat = new THREE.Mesh(G.build(), this.material);
    this.throat.position.set(0, -0.05, 0.6);
    this.headGroup.add(this.throat);
  }

  // --- the body follows the head ------------------------------------------------

  pushTrail(p) {
    const T = this.trail;
    const last = T[T.length - 1];
    if (last && last.distanceToSquared(p) < SPACING * SPACING) return;
    T.push(p.clone());
    const maxN = Math.ceil(BODY_LEN / SPACING) + 8;
    if (T.length > maxN) T.splice(0, T.length - maxN);
  }

  // Samples from the head back along where it has been.
  sampleBody() {
    const T = this.trail;
    const out = this.bodyPts;
    const n = out.length;
    const step = BODY_LEN / (n - 1);
    out[0].copy(this.head);
    let k = 1;
    let acc = 0;
    let a = this.head;
    for (let i = T.length - 1; i >= 0 && k < n; i--) {
      const b = T[i];
      const seg = a.distanceTo(b);
      while (k < n && acc + seg >= k * step) {
        const f = seg > 1e-6 ? (k * step - acc) / seg : 0;
        out[k].lerpVectors(a, b, f);
        k++;
      }
      acc += seg;
      a = b;
    }
    // Not enough trail yet: carry on in the last direction.
    for (; k < n; k++) {
      _v.subVectors(out[k - 1], out[Math.max(k - 2, 0)]);
      if (_v.lengthSq() < 1e-8) _v.set(0, 0, -1);
      out[k].copy(out[k - 1]).addScaledVector(_v.normalize(), step);
    }
    return out;
  }

  // Lay down a whole body coiled about the pillar (for the start of the fight).
  coilTrail(a0 = 0, y0 = 1.4) {
    this.trail.length = 0;
    const n = Math.ceil(BODY_LEN / SPACING) + 2;
    for (let i = n; i >= 0; i--) {
      const s = (i * SPACING) / (COIL_R * 1.05);
      const a = a0 - s;
      const y = y0 + (1 - i / n) * 5.5;
      this.trail.push(new THREE.Vector3(PILLAR.x + Math.sin(a) * COIL_R, y, PILLAR.z + Math.cos(a) * COIL_R));
    }
    this.coilA = a0;
    this.head.copy(this.trail[this.trail.length - 1]);
    this.headDir.set(Math.cos(a0), 0, -Math.sin(a0));
  }

  // --- steering ---------------------------------------------------------------------

  // Move the head toward p, turning at most `turn` rad/s, at `speed` m/s.
  steer(p, speed, turn, dt) {
    const want = _v.subVectors(p, this.head);
    const d = want.length();
    if (d < 1e-4) return 0;
    want.divideScalar(d);
    const cur = this.headDir;
    const ang = Math.acos(clamp(cur.dot(want), -1, 1));
    const k = ang > 1e-4 ? Math.min(1, (turn * dt) / ang) : 1;
    cur.lerp(want, k).normalize();
    const step = Math.min(speed * dt, d);
    this.head.addScaledVector(cur, step);
    return d;
  }

  // Idle: circling the pillar, rising and falling along it.
  coil(dt, speed = 2.6) {
    this.coilA += (speed / COIL_R) * dt;
    const a = this.coilA;
    const y = 4.5 + 2.8 * Math.sin(a * 0.45);
    this.target.set(PILLAR.x + Math.sin(a) * COIL_R, y, PILLAR.z + Math.cos(a) * COIL_R);
    this.steer(this.target, speed * 1.4, 2.5, dt);
  }

  // --- posing -----------------------------------------------------------------------

  pose(dt, time) {
    this.pushTrail(this.head);
    const pts = this.sampleBody();
    // A tail lash bends the end of the body away from the trail.
    if (this.tailOverride) {
      const o = this.tailOverride;
      const i0 = o.i0;
      const pivot = pts[i0].clone();
      const dir = _u.set(Math.sin(o.ang), 0, Math.cos(o.ang));
      const step = BODY_LEN / (pts.length - 1);
      for (let i = i0 + 1; i < pts.length; i++) {
        const f = Math.min(1, (i - i0) / 6);
        const p = _w.copy(pivot).addScaledVector(dir, (i - i0) * step);
        p.y = lerp(pivot.y, 0.5, Math.min(1, (i - i0) / 4));
        pts[i].lerp(p, f * o.w);
      }
    }
    this.tube.update(pts);
    // Spine crystals along the back.
    for (let k = 0; k < SPINES; k++) {
      const t = 0.035 + (k / (SPINES - 1)) * 0.8;
      const p = this.tube.at(t, _v);
      const j = Math.floor(t * (RINGS - 1));
      const tan = this.tube.frames[j].t;
      const up = _w.copy(UP).addScaledVector(tan, -UP.dot(tan));
      if (up.lengthSq() < 1e-4) up.copy(this.tube.frames[j].n);
      up.normalize();
      const r = bodyRadius(t);
      const S = this.spineSeed[k];
      p.addScaledVector(up, r * 0.8);
      // Tilt back along the body.
      _u.copy(up).addScaledVector(tan, 0.45 + S.tilt * 0.3).normalize();
      _q.setFromUnitVectors(UP, _u);
      const size = (0.55 + 0.9 * Math.sin(Math.min(1, t * 1.3) * Math.PI)) * S.s * (this.spineScale ?? 1);
      _s.set(size, size * (0.9 + 0.3 * Math.sin(time * 2 + k)), size);
      _m.compose(p, _q, _s);
      this.spines.setMatrixAt(k, _m);
    }
    this.spines.instanceMatrix.needsUpdate = true;
    // Head at the front of the body, looking along its path, turned toward prey.
    const h = this.head;
    const back = pts[2];
    const fwd = _v.subVectors(h, back);
    if (fwd.lengthSq() < 1e-6) fwd.copy(this.headDir);
    fwd.normalize();
    const yaw = Math.atan2(fwd.x, fwd.z) + this.look.yaw;
    const pitch = -Math.asin(clamp(fwd.y, -1, 1)) + this.look.pitch;
    this.headGroup.position.copy(h);
    this.headGroup.rotation.set(pitch, yaw, Math.sin(time * 1.3) * 0.05 + (this.headRoll || 0), 'YXZ');
    this.jawGroup.rotation.x = this.jaw * 0.9;
    this.throat.visible = this.breathGlow > 0.02;
    this.throat.scale.setScalar(0.5 + (this.breathGlow || 0) * 1.2);
    this.headGroup.updateMatrixWorld(true);
    // Hurt volumes.
    const M = this.headGroup.matrixWorld;
    this.volHead.a.set(0, 0.1, -1.1).applyMatrix4(M);
    this.volHead.b.set(0, 0, 1.8).applyMatrix4(M);
    const seg = 1 / this.bodyVols.length;
    this.bodyVols.forEach((v, k) => {
      const t0 = 0.05 + k * seg * 0.95;
      const t1 = t0 + seg * 0.95;
      this.tube.at(t0, v.a);
      this.tube.at(Math.min(t1, 1), v.b);
      v.r = bodyRadius((t0 + t1) / 2) + 0.12;
      v.on = v.a.y > -0.5 || v.b.y > -0.5;
    });
    this.volHead.on = h.y > -0.6;
    this.lookPoint.set(0, 0.2, 0.8).applyMatrix4(M);
    this.focus.copy(this.lookPoint).lerp(_v.set(PILLAR.x, 4, PILLAR.z), 0.25);
    this.char.anim.headWorld.copy(this.lookPoint);
    this.mouth = (this.mouth || new THREE.Vector3()).set(0, -0.1, 2.2).applyMatrix4(M);
    // The wyrm's own glow (slot 0).
    const gw = this.material.uniforms.uGlow.value;
    const I = (0.6 + (this.breathGlow || 0) * 4) * gw.w;
    this.stage.lights.set(0, this.lookPoint.x, this.lookPoint.y + 0.5, this.lookPoint.z, 10 + (this.breathGlow || 0) * 8, gw.x * I, gw.y * I, gw.z * I);
    this.solids.length = 0;
    if (h.y < 1.5 && h.y > -0.5) this.solids.push([h.x, h.z, 0.9]);
  }

  // --- the fight ----------------------------------------------------------------------

  reset() {
    super.reset();
    this.coilTrail(0.4, 1.4);
    this.mode = 'coil';
    this.look.yaw = 0;
    this.look.pitch = 0;
    this.jaw = 0.1;
    this.breathGlow = 0;
    this.tailOverride = null;
    this.spineScale = 1;
    this.headRoll = 0;
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    for (const m of [this.tube.mesh, this.spines, this.headGroup]) m.visible = true;
    this.shattered = false;
  }

  startIntro() {
    this.setState('intro');
    this.coilTrail(-1.2, 0.9);
    this.introFx = 0;
    this.material.uniforms.uGlow.value.w = 0.15;
  }

  // Asleep round the pillar; the eyes kindle, it lifts its head, uncoils, descends.
  updateIntro(dt) {
    const t = this.stateT;
    const glow = this.material.uniforms.uGlow.value;
    glow.w = lerp(0.15, 1, smooth(5.8, 7.2, t));
    if (t < 6) {
      // Stir only a little.
      this.look.pitch = 0.4;
      this.jaw = 0.05;
    } else if (t < 8.5) {
      this.coil(dt, 1.2 + (t - 6) * 0.8);
      this.look.pitch = lerp(0.4, -0.35, smooth(6, 7.5, t));
      this.jaw = 0.1 + smooth(7.8, 8.3, t) * 0.9;
    } else {
      const P = this.g.player.pos;
      this.target.set(lerp(PILLAR.x, P.x, 0.35), 3.2, lerp(PILLAR.z, P.z, 0.35));
      this.steer(this.target, 5, 2.2, dt);
      this.jaw = damp(this.jaw, 0.2, 3, dt);
      this.lookAtPlayer(dt, 2);
    }
    if (t > 7.9 && this.introFx < 1) {
      this.introFx = 1;
      this.g.audio?.play('roar', { pos: this.lookPoint, pitch: 1.1 });
      this.g.audio?.play('crystal', { pos: this.lookPoint, pitch: 0.6 });
      this.g.rig.shake(0.7);
      this.stage.shards(this.lookPoint, 30, 1.2);
    }
    return t > 10.5;
  }

  skipIntro() {
    this.stateT = 10.5;
    this.material.uniforms.uGlow.value.copy(this.glowBase);
    this.look.pitch = 0;
    this.jaw = 0.15;
  }

  endIntro() {
    if (this.state === 'intro') this.skipIntro();
    this.setState('idle');
    this.cooldown = 1.5;
  }

  previewPose() {
    this.setState('preview');
    this.coilTrail(1.2, 1.2);
    for (let i = 0; i < 40; i++) {
      this.coil(1 / 30, 3);
      this.pushTrail(this.head);
    }
    this.look.pitch = -0.25;
    this.look.yaw = 0.3;
    this.jaw = 0.8;
    this.breathGlow = 0.3;
  }

  lookAtPlayer(dt, rate = 3) {
    const P = this.g.player.pos;
    const fwd = this.headDir;
    const want = Math.atan2(P.x - this.head.x, P.z - this.head.z);
    const cur = Math.atan2(fwd.x, fwd.z);
    this.look.yaw = damp(this.look.yaw, clamp(wrapAngle(want - cur), -1.2, 1.2), rate, dt);
    const dy = P.y + 1 - this.head.y;
    const dh = Math.hypot(P.x - this.head.x, P.z - this.head.z);
    const pitchWant = -Math.atan2(dy, dh) + Math.asin(clamp(fwd.y, -1, 1));
    this.look.pitch = damp(this.look.pitch, clamp(pitchWant, -0.9, 0.9), rate, dt);
  }

  updateIdle(dt) {
    // Back to the pillar, round and round it; resurface first if below ground.
    if (this.head.y < 0.5) {
      this.target.set(PILLAR.x + Math.sin(this.coilA) * COIL_R, 3, PILLAR.z + Math.cos(this.coilA) * COIL_R);
      this.steer(this.target, 7, 3, dt);
      if (this.head.distanceTo(this.target) < 1) this.mode = 'coil';
    } else this.coil(dt);
    this.lookAtPlayer(dt);
    this.jaw = damp(this.jaw, 0.12 + 0.08 * Math.sin(this.time * 1.4), 3, dt);
    this.breathGlow = damp(this.breathGlow || 0, 0, 3, dt);
  }

  // A point on the floor between the pillar and the samurai, at `dist` from him.
  approachPoint(dist, height, out) {
    const P = this.g.player.pos;
    const d = _v.set(this.head.x - P.x, 0, this.head.z - P.z);
    if (d.lengthSq() < 1e-4) d.set(0, 0, -1);
    d.normalize();
    out.set(P.x + d.x * dist, height, P.z + d.z * dist);
    // Stay within the cave.
    const r = Math.hypot(out.x, out.z);
    if (r > 15) out.multiplyScalar(15 / r).setY(height);
    return out;
  }

  defineAttacks() {
    const self = this;
    const st = () => self.stage;
    this.attacks = {
      breath: {
        weight: 2.2,
        range: [3, 30],
        dur: 5.0,
        cooldown: 1.3,
        start(a) {
          a.data.spot = self.approachPoint(7.5, 4.2, new THREE.Vector3());
          a.data.sweep = (Math.random() < 0.5 ? -1 : 1) * (self.phase === 2 ? 0.55 : 0.3);
          self.g.audio?.play('crystal', { pos: self.lookPoint, pitch: 0.7 });
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          if (t < 1.4) {
            self.steer(a.data.spot, 9, 3, dt);
            self.lookAtPlayer(dt, 5);
            self.breathGlow = smooth(0.3, 1.4, t);
            self.jaw = damp(self.jaw, 0.5, 4, dt);
            // Light gathering at the mouth.
            if (self.mouth && Math.random() < 0.8) {
              const m = self.mouth;
              const off = new THREE.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
              st().fx.add.emit(m.x + off.x, m.y + off.y, m.z + off.z, { vel: [-off.x * 2, -off.y * 2, -off.z * 2], life: 0.45, size: [0.08, 0.03], color: [1, 1.8, 3.5, 1], color1: [0.5, 1, 2, 0], drag: 0, kind: PK.shard, spin: 10 });
            }
          }
          if (self.at(a, 0.35)) {
            const hp = self.head;
            a.data.dir = Math.atan2(P.x - hp.x, P.z - hp.z);
            a.data.tel = st().telegraphs.add({ shape: SHAPE.sector, x: hp.x, z: hp.z, w: 11, l: 11, rot: a.data.dir, param: 0.4 + Math.abs(a.data.sweep), wind: 1.05, hold: 1.8, color: [1.4, 2.2, 4.0] });
          }
          if (a.data.tel && t < 1.4) {
            a.data.tel.x = self.head.x;
            a.data.tel.z = self.head.z;
            a.data.dir = Math.atan2(P.x - self.head.x, P.z - self.head.z);
            a.data.tel.rot = a.data.dir;
          }
          if (self.at(a, 1.4)) {
            self.g.audio?.play('shatter', { pos: self.lookPoint, pitch: 1.3 });
            a.data.hz = st().hazards.add({ shape: 'sector', x: self.head.x, z: self.head.z, r: 11, half: 0.38, rot: a.data.dir, delay: 0, dur: 1.8, tick: 0.3, dmg: 8, react: 'flinch', owner: self, height: 3 });
          }
          if (t >= 1.4 && t < 3.2) {
            const u = (t - 1.4) / 1.8;
            const ang = a.data.dir + a.data.sweep * Math.sin(u * Math.PI);
            if (a.data.hz) a.data.hz.rot = ang;
            self.look.yaw = damp(self.look.yaw, wrapAngle(ang - Math.atan2(self.headDir.x, self.headDir.z)), 8, dt);
            self.look.pitch = damp(self.look.pitch, 0.35, 5, dt);
            self.jaw = damp(self.jaw, 0.95, 10, dt);
            const m = self.mouth;
            const d = new THREE.Vector3(Math.sin(ang), -0.3, Math.cos(ang)).normalize();
            for (let k = 0; k < 5; k++) {
              const sp = 10 + Math.random() * 6;
              const j = new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.6);
              st().fx.add.emit(m.x, m.y, m.z, { vel: [(d.x + j.x) * sp, (d.y + j.y) * sp, (d.z + j.z) * sp], life: 0.9, size: [0.2, 0.12], color: [1.2, 2.2, 4.2, 1], color1: [0.4, 0.8, 2, 0], gravity: 3, drag: 0.8, kind: PK.shard, spin: 16, bounce: 0.2 });
            }
            if (Math.random() < 0.3) st().fx.smoke.emit(m.x, m.y, m.z, { vel: [d.x * 6, d.y * 6, d.z * 6], life: 1.2, size: [0.5, 2.5], color: [0.6, 0.8, 1.2, 0.2], color1: [0.4, 0.6, 1, 0], drag: 1.2, kind: PK.smoke });
            self.breathGlow = 1;
          }
          if (t >= 3.2) {
            self.breathGlow = damp(self.breathGlow, 0, 4, dt);
            self.jaw = damp(self.jaw, 0.2, 4, dt);
            self.coil(dt, 2);
          }
        },
        cancel() {
          self.breathGlow = 0;
        },
      },
      lunge: {
        weight: 2.6,
        range: [2.5, 16],
        dur: 3.0,
        cooldown: 0.9,
        start(a) {
          a.data.spot = self.approachPoint(6.5, 3.6, new THREE.Vector3());
          self.g.audio?.play('roar', { pos: self.lookPoint, pitch: 1.5 });
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          if (t < 0.9) {
            self.steer(a.data.spot, 11, 3.5, dt);
            self.lookAtPlayer(dt, 6);
            self.jaw = damp(self.jaw, 0.8, 5, dt);
            // Rear back.
            self.head.y = damp(self.head.y, 4.6, 3, dt);
          }
          if (self.at(a, 0.7)) self.glint(true);
          if (self.at(a, 0.9)) {
            a.data.goal = new THREE.Vector3(P.x, 0.9, P.z);
            const d = a.data.goal.clone().sub(self.head).setY(0).normalize();
            a.data.goal.addScaledVector(d, 1.5);
            self.g.audio?.play('whoosh', { pos: self.lookPoint, pitch: 0.8 });
          }
          if (t >= 0.9 && t < 1.25) {
            self.steer(a.data.goal, 30, 10, dt);
            self.look.yaw = damp(self.look.yaw, 0, 10, dt);
            self.look.pitch = damp(self.look.pitch, 0, 10, dt);
            self.jaw = t < 1.15 ? 0.9 : 0.05;
            self.limbStrike(a, 'bite', self.volHead.a, self.volHead.b, self.volHead.r, { dmg: 26, react: 'stagger', parry: true });
          }
          if (self.at(a, 1.15)) {
            self.g.audio?.play('bite', { pos: self.lookPoint });
            st().dust(self.head.x, self.head.z, 0.8);
          }
          if (t >= 1.25 && t < 2.2) {
            // Snout on the floor a moment: strike it.
            self.head.y = damp(self.head.y, 0.9, 5, dt);
            self.jaw = damp(self.jaw, 0.25, 4, dt);
          }
          if (t >= 2.2) self.coil(dt, 3);
        },
      },
      spikes: {
        weight: 2.2,
        range: [2, 26],
        dur: 3.8,
        cooldown: 1.1,
        start(a) {
          a.data.spot = self.approachPoint(8, 4.5, new THREE.Vector3());
          a.data.lines = null;
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          if (t < 0.9) {
            self.steer(a.data.spot, 10, 3, dt);
            self.lookAtPlayer(dt, 5);
            self.head.y = damp(self.head.y, 5.5, 3, dt);
            self.jaw = damp(self.jaw, 0.6, 4, dt);
          } else if (t < 1.1) {
            // Dive the head into the floor.
            self.head.y = lerp(5.5, 0.4, easeIn((t - 0.9) / 0.2));
            self.look.pitch = damp(self.look.pitch, 0.9, 10, dt);
          }
          if (self.at(a, 1.1)) {
            self.g.rig.shake(0.8);
            self.g.audio?.play('slam', { pos: self.head, pitch: 1.1 });
            st().dust(self.head.x, self.head.z, 1.8);
            st().shards(self.head.clone().setY(0.5), 30, 1.2);
            const base = Math.atan2(P.x - self.head.x, P.z - self.head.z);
            const n = self.phase === 2 ? 5 : 3;
            a.data.lines = [];
            for (let i = 0; i < n; i++) {
              const ang = base + (i - (n - 1) / 2) * 0.32;
              for (let k = 1; k <= 11; k++) {
                const x = self.head.x + Math.sin(ang) * k * 1.3;
                const z = self.head.z + Math.cos(ang) * k * 1.3;
                if (Math.hypot(x, z) > 16.5) break;
                a.data.lines.push({ x, z, at: 1.1 + k * 0.09, done: false });
                st().telegraphs.add({ shape: SHAPE.circle, x, z, w: 0.85, wind: 0.45 + k * 0.09, hold: 0.2, color: [1.4, 2.4, 4.2] });
              }
            }
          }
          if (a.data.lines) {
            for (const s of a.data.lines) {
              if (!s.done && t >= s.at + 0.45) {
                s.done = true;
                self.eruptSpike(s.x, s.z);
              }
            }
          }
          if (t > 1.6) {
            self.head.y = damp(self.head.y, 3, 2, dt);
            self.look.pitch = damp(self.look.pitch, 0, 3, dt);
          }
          if (t > 2.6) self.coil(dt, 2.5);
        },
      },
      burrow: {
        weight: 1.7,
        range: [0, 30],
        dur: 6.6,
        cooldown: 1.2,
        start(a) {
          a.data.dive = self.approachPoint(9, 0, new THREE.Vector3());
          a.data.phase = 0;
          self.g.audio?.play('rumble', { pos: self.head });
        },
        update(a, dt) {
          const t = a.t;
          const P = self.g.player.pos;
          const S = st();
          if (t < 1.3) {
            // Down into the rock.
            _v.copy(a.data.dive).setY(t < 0.8 ? 2 : -4);
            self.steer(_v, 10, 4, dt);
          } else if (t < 3.2) {
            // Beneath the floor, homing on him; the ground heaves over it.
            _v.set(P.x, -4, P.z);
            self.steer(_v, 9, 2.5, dt);
            if (Math.random() < 0.6) S.dust(self.head.x + (Math.random() - 0.5), self.head.z + (Math.random() - 0.5), 0.35);
            if (self.at(a, 2.0)) self.g.audio?.play('rumble', { pos: P });
          } else if (t < 4.1) {
            if (!a.data.tel) {
              a.data.hole = new THREE.Vector3(P.x, 0, P.z);
              a.data.tel = S.telegraphs.add({ shape: SHAPE.circle, x: P.x, z: P.z, w: 2.3, wind: 0.85, hold: 0.25, color: [1.6, 2.4, 4.4] });
              self.g.hud?.flash('The ground cracks beneath you', 0.9);
            }
            _v.copy(a.data.hole).setY(-4);
            self.steer(_v, 12, 6, dt);
            if (Math.random() < 0.8) S.dust(a.data.hole.x + (Math.random() - 0.5) * 3, a.data.hole.z + (Math.random() - 0.5) * 3, 0.3);
          } else if (t < 4.7) {
            if (self.at(a, 4.1)) {
              const h = a.data.hole;
              self.head.set(h.x, -3, h.z);
              self.headDir.set(0, 1, 0);
              S.hazards.add({ shape: 'circle', x: h.x, z: h.z, r: 2.3, dur: 0.15, dmg: 30, react: 'knockdown', owner: self, height: 3 });
              S.dust(h.x, h.z, 2.5);
              S.shards(h.clone().setY(0.5), 50, 1.6);
              S.waves.add(h.x, 0, h.z, { speed: 7, max: 6, width: 0.6, height: 0.7, color: [1.2, 2, 3.8], r0: 1.5 });
              self.g.rig.shake(1);
              self.g.audio?.play('slam', { pos: h, pitch: 0.9 });
              self.g.audio?.play('roar', { pos: h, pitch: 1.2 });
              for (let k = 0; k < 6; k++) self.eruptSpike(h.x + Math.sin(k) * 2.4, h.z + Math.cos(k) * 2.4, false);
            }
            _v.copy(a.data.hole).setY(8);
            self.steer(_v, 22, 12, dt);
            self.jaw = 0.9;
          } else {
            // Arc over and back down into the rock.
            const h = a.data.hole;
            _v.set(h.x + (PILLAR.x - h.x) * 0.3, t < 5.4 ? 6 : -5, h.z + (PILLAR.z - h.z) * 0.3);
            self.steer(_v, 10, 2.8, dt);
            self.jaw = damp(self.jaw, 0.2, 3, dt);
          }
        },
      },
      tail: {
        weight: () => (self.nearestBody() && self.nearestBody().d < 8 ? 2.4 : 0),
        range: [0, 30],
        dur: 3.0,
        cooldown: 1.0,
        start(a) {
          const nb = self.nearestBody();
          a.data.i0 = clamp(nb ? nb.i : 30, 14, RINGS - 16);
          const piv = self.bodyPts[a.data.i0];
          const P = self.g.player.pos;
          const toP = Math.atan2(P.x - piv.x, P.z - piv.z);
          const side = Math.random() < 0.5 ? -1 : 1;
          a.data.a0 = toP - side * 1.6;
          a.data.a1 = toP + side * 1.1;
          self.tailOverride = { i0: a.data.i0, ang: a.data.a0, w: 0 };
          const L = (RINGS - 1 - a.data.i0) * (BODY_LEN / (RINGS - 1));
          a.data.tel = st().telegraphs.add({ shape: SHAPE.sector, x: piv.x, z: piv.z, w: L, l: L, rot: (a.data.a0 + a.data.a1) / 2, param: Math.abs(a.data.a1 - a.data.a0) / 2, wind: 1.1, hold: 0.5, color: [1.5, 2.3, 4.2] });
          self.g.audio?.play('crystal', { pos: piv, pitch: 0.5 });
        },
        update(a, dt) {
          const t = a.t;
          const o = self.tailOverride;
          if (!o) return;
          self.lookAtPlayer(dt);
          o.w = smooth(0, 0.6, t) * (1 - smooth(2.3, 3.0, t));
          o.ang = t < 1.1 ? a.data.a0 - 0.2 * smooth(0.6, 1.1, t) : lerp(a.data.a0 - 0.2, a.data.a1, easeInOut(clamp((t - 1.1) / 0.45, 0, 1)));
          if (self.at(a, 1.1)) self.g.audio?.play('whoosh', { pos: self.lookPoint, pitch: 0.6 });
          if (t > 1.1 && t < 1.6) {
            for (let k = 5; k < 9; k++) {
              const v = self.bodyVols[k];
              self.limbStrike(a, 'tail', v.a, v.b, v.r - 0.05, { dmg: 22, react: 'knockdown', unblockable: true });
            }
          }
        },
        end() {
          self.tailOverride = null;
        },
        cancel() {
          self.tailOverride = null;
        },
      },
      hail: {
        weight: 1.8,
        phase: 2,
        range: [0, 30],
        dur: 4.8,
        cooldown: 1.3,
        start() {
          self.g.audio?.play('roar', { pos: self.lookPoint, pitch: 0.9 });
          self.g.hud?.flash('The roof is falling', 1.2);
        },
        update(a, dt) {
          const t = a.t;
          self.coil(dt, 1.5);
          self.look.pitch = damp(self.look.pitch, t < 1.2 ? -0.9 : 0, 3, dt);
          self.jaw = damp(self.jaw, t < 1.4 ? 0.95 : 0.2, 4, dt);
          if (self.at(a, 0.9)) self.g.rig.shake(0.9);
          for (let k = 0; k < 8; k++) {
            if (self.at(a, 1.0 + k * 0.35)) self.dropShard(k);
          }
        },
      },
    };
  }

  // The part of the body nearest the samurai.
  nearestBody() {
    const P = this.g.player.pos;
    let best = null;
    for (let i = 8; i < RINGS; i += 2) {
      const p = this.bodyPts[i];
      if (p.y > 2.5 || p.y < -0.5) continue;
      const d = Math.hypot(p.x - P.x, p.z - P.z);
      if (!best || d < best.d) best = { i, d };
    }
    return best;
  }

  glint(parryable) {
    const p = this.lookPoint.clone();
    this.g.fx.glints.flash(p, { color: parryable ? 0xfff4e0 : 0xff4020, size: 1.2, life: 0.45, intensity: 12 });
    this.g.audio?.play(parryable ? 'glint' : 'warn', { pos: p });
  }

  // A crystal spike bursting from the floor (hurts when `hurts`).
  eruptSpike(x, z, hurts = true) {
    const S = this.stage;
    if (!this.spikePool) {
      const B = new MeshBuilder(null);
      const pts = [new THREE.Vector2(0.001, -1.6), new THREE.Vector2(0.45, -1.2), new THREE.Vector2(0.5, 0.2), new THREE.Vector2(0.38, 0.9), new THREE.Vector2(0.001, 1.7)];
      const g = new THREE.LatheGeometry(pts, 6).toNonIndexed();
      g.computeVertexNormals();
      B.add(g, mat('#a9dcff', { pat: PAT.crystal, rough: 0.1, rim: 2.4 }), null, {});
      g.dispose();
      this.spikePool = new THREE.InstancedMesh(B.build(), this.material, 48);
      this.spikePool.frustumCulled = false;
      this.spikePool.count = 48;
      this.spikes = Array.from({ length: 48 }, () => ({ on: false }));
      _m.makeScale(0, 0, 0);
      for (let i = 0; i < 48; i++) this.spikePool.setMatrixAt(i, _m);
      S.group.add(this.spikePool);
      this.spikeNext = 0;
    }
    const k = this.spikeNext;
    this.spikeNext = (k + 1) % 48;
    Object.assign(this.spikes[k], { on: true, x, z, t: 0, tilt: (Math.random() - 0.5) * 0.5, rot: Math.random() * 6, s: 0.8 + Math.random() * 0.5 });
    if (hurts) S.hazards.add({ shape: 'circle', x, z, r: 0.85, dur: 0.15, dmg: 20, react: 'knockdown', owner: this, height: 2 });
    S.shards(new THREE.Vector3(x, 0.3, z), 8, 0.8);
    S.dust(x, z, 0.4);
    if (Math.random() < 0.4) this.g.audio?.play('crystal', { pos: { x, z }, pitch: 0.8 + Math.random() * 0.5 });
  }

  updateSpikes(dt) {
    if (!this.spikes) return;
    for (let i = 0; i < this.spikes.length; i++) {
      const s = this.spikes[i];
      if (!s.on) continue;
      s.t += dt;
      const up = easeOut(Math.min(1, s.t / 0.12));
      const gone = smooth(1.6, 2.2, s.t);
      if (s.t > 1.6 && !s.broke) {
        s.broke = true;
        this.stage.shards(new THREE.Vector3(s.x, 0.8, s.z), 10, 0.7);
      }
      const sc = s.s * (1 - gone);
      _q.setFromEuler(new THREE.Euler(s.tilt, s.rot, s.tilt * 0.5));
      _m.compose(_v.set(s.x, -1.6 + up * 1.5 - gone * 1.2, s.z), _q, _s.set(sc, sc, sc));
      this.spikePool.setMatrixAt(i, _m);
      if (s.t > 2.2) {
        s.on = false;
        s.broke = false;
        _m.makeScale(0, 0, 0);
        this.spikePool.setMatrixAt(i, _m);
      }
    }
    this.spikePool.instanceMatrix.needsUpdate = true;
  }

  // A crystal stalactite shaken loose from the roof.
  dropShard(k) {
    const S = this.stage;
    const P = this.g.player.pos;
    const a = Math.random() * Math.PI * 2;
    const r = k % 3 === 0 ? 0 : 1.5 + Math.random() * 4;
    const x = clamp(P.x + Math.sin(a) * r, -15, 15);
    const z = clamp(P.z + Math.cos(a) * r, -15, 15);
    S.telegraphs.add({ shape: SHAPE.circle, x, z, w: 1.5, wind: 1.1, hold: 0.2, color: [1.5, 2.3, 4.3] });
    const B = new MeshBuilder(null);
    const g = new THREE.ConeGeometry(0.45, 2.6, 6).toNonIndexed();
    g.computeVertexNormals();
    g.rotateX(Math.PI);
    B.add(g, mat('#b8a0ff', { pat: PAT.crystal, rough: 0.1, rim: 2 }), null, {});
    g.dispose();
    const mesh = new THREE.Mesh(B.build(), this.material);
    // Falls from the roof to the floor in 1.1 s.
    const y0 = 20;
    const fallT = 1.1;
    S.projectiles.add({
      mesh,
      pos: new THREE.Vector3(x, y0, z),
      vel: new THREE.Vector3(0, 0, 0),
      gravity: (2 * (y0 - 0.6)) / (fallT * fallT),
      radius: 0.6,
      life: 3,
      dmg: 22,
      react: 'knockdown',
      owner: this,
      onGround: (o) => {
        S.hazards.add({ shape: 'circle', x, z, r: 1.5, dur: 0.12, dmg: 22, react: 'knockdown', owner: this, height: 3 });
        S.shards(new THREE.Vector3(x, 0.5, z), 34, 1.3, [2.2, 1.4, 3.6]);
        S.dust(x, z, 1);
        this.g.audio?.play('shatter', { pos: o.pos, pitch: 1.1 });
        this.g.rig.shake(0.3);
      },
      onHitPlayer: () => S.shards(new THREE.Vector3(x, 1, z), 20, 1),
    });
  }

  // --- stagger, phase two, death ----------------------------------------------------

  updateStagger(dt) {
    const t = this.stateT;
    // Stunned: the head down on the floor, swaying.
    const down = smooth(0, 0.5, t) * (1 - smooth(this.staggerDur - 0.6, this.staggerDur, t));
    if (down > 0.01) {
      this.target.set(this.head.x + this.headDir.x * 0.5, lerp(3, 0.9, down), this.head.z + this.headDir.z * 0.5);
      this.steer(this.target, 4, 2, dt);
    }
    this.head.y = damp(this.head.y, lerp(3, 0.9, down), 6, dt);
    this.headRoll = Math.sin(t * 5) * 0.25 * down;
    this.look.pitch = damp(this.look.pitch, 0.1, 3, dt);
    this.jaw = 0.4 + Math.sin(t * 3) * 0.1;
    if (t > this.staggerDur - 0.1) this.headRoll = 0;
  }

  onStagger() {
    this.tailOverride = null;
    this.breathGlow = 0;
    this.g.audio?.play('crystal', { pos: this.lookPoint, pitch: 0.5 });
  }

  onPhase2() {
    this.tailOverride = null;
    this.breathGlow = 0;
    this.phaseFx = 0;
  }

  updatePhase(dt) {
    const t = this.stateT;
    // Rears up the pillar and screams at the roof.
    this.target.set(PILLAR.x + Math.sin(this.coilA) * COIL_R, 10, PILLAR.z + Math.cos(this.coilA) * COIL_R);
    this.coilA += dt * 0.4;
    this.steer(this.target, 6, 3, dt);
    this.look.pitch = damp(this.look.pitch, -0.8, 3, dt);
    this.jaw = damp(this.jaw, 0.95, 4, dt);
    const glow = this.material.uniforms.uGlow.value;
    const k = smooth(0.5, 2, t);
    glow.set(lerp(0.45, 1.6, k), lerp(0.8, 0.45, k), lerp(1.7, 1.8, k), 1 + Math.sin(t * 17) * 0.25 * (1 - smooth(2.5, 3.2, t)));
    this.spineScale = 1 + 0.25 * k;
    if (t > 0.8 && this.phaseFx < 1) {
      this.phaseFx = 1;
      this.g.audio?.play('roar', { pos: this.lookPoint, pitch: 0.8 });
      this.g.audio?.play('shatter', { pos: this.lookPoint, pitch: 0.7 });
      this.g.rig.shake(1);
      this.g.hud?.card('The Wyrm blazes', 'Its crystals burn violet', 3);
      for (let i = 0; i < 12; i++) {
        const p = this.tube.at(i / 12, new THREE.Vector3());
        this.stage.shards(p, 10, 1, [2.4, 1.2, 3.6]);
      }
    }
    return t > 3.2;
  }

  onDeath() {
    this.tailOverride = null;
    this.breathGlow = 0;
    this.deathFx = 0;
  }

  // It writhes, turns wholly to crystal, and shatters.
  updateDeath(dt) {
    const t = this.deathT;
    const glow = this.material.uniforms.uGlow.value;
    if (t < 1.6) {
      this.target.set(this.head.x + Math.sin(t * 7) * 2, 5 + Math.sin(t * 5) * 1.5, this.head.z + Math.cos(t * 6) * 2);
      this.steer(this.target, 6, 5, dt);
      this.jaw = 0.5 + 0.45 * Math.sin(t * 9);
      this.headRoll = Math.sin(t * 13) * 0.3;
    } else if (t < 3.4) {
      // Crystallising: frozen, brightening to white-blue.
      const k = smooth(1.6, 3.2, t);
      glow.set(lerp(glow.x, 2.2, k * 0.2), lerp(glow.y, 2.6, k * 0.2), lerp(glow.z, 3.2, k * 0.2), 1 + k * 2.5);
      this.headRoll = damp(this.headRoll, 0, 5, dt);
      if (Math.random() < dt * 20) {
        const p = this.tube.at(Math.random(), new THREE.Vector3());
        this.stage.fx.add.emit(p.x, p.y, p.z, { life: 0.3, size: [0.6, 0.1], color: [3, 4, 6, 1], color1: [0, 0, 0, 0], kind: PK.ember });
        if (Math.random() < 0.3) this.g.audio?.play('crystal', { pos: p, pitch: 1 + Math.random() });
      }
    } else if (!this.shattered) {
      this.shattered = true;
      for (const m of [this.tube.mesh, this.spines, this.headGroup]) m.visible = false;
      for (let i = 0; i < RINGS; i += 2) {
        const p = this.bodyPts[i];
        const n = 14;
        this.stage.fx.add.burst(p.x, p.y, p.z, n, { vel: [0, 2.5, 0], scatter: 5, life: 1.8, size: [0.22, 0.08], color: [1.4, 2.2, 4, 1], color1: [0.3, 0.5, 1.2, 0], gravity: 9.8, drag: 0.4, kind: PK.shard, spin: 18, bounce: 0.35 }, bodyRadius(i / RINGS));
      }
      this.stage.shards(this.lookPoint, 60, 2);
      this.stage.lights.flash(this.lookPoint.x, this.lookPoint.y, this.lookPoint.z, 30, 12, 18, 30, 3);
      this.g.audio?.play('shatter', { pos: this.lookPoint, pitch: 0.6 });
      this.g.audio?.play('shatter', { pos: this.lookPoint, pitch: 0.9 });
      this.g.audio?.play('bossdeath', { pos: this.lookPoint, pitch: 1.4 });
      this.g.rig.shake(1.2);
      this.g.hud?.whiteout(0.4);
    }
    return t > 6.5;
  }

  hitFx(point, dir, killing, part) {
    const S = this.stage;
    S.shards(point, killing ? 50 : part && part.part === 'head' ? 18 : 12, 0.8, part && part.part === 'head' ? [2.4, 2.2, 4] : [1.2, 1.8, 3.2]);
    this.g.fx.glints.flash(point, { color: 0xc8e6ff, size: 0.5, life: 0.15, intensity: 7 });
    this.g.audio?.play('crystal', { pos: point, pitch: 1.3 + Math.random() * 0.4 });
  }

  advance(dt, combat, now) {
    super.advance(dt, combat, now);
    if (!this.active) return;
    this.updateSpikes(dt);
    this.pose(dt, this.time);
    this.body.pos.copy(this.head).setY(Math.max(0, this.head.y - 1));
  }
}
