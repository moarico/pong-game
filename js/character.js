// Characters: one artist-made, skinned body (Kenney's Animated Characters, CC0) wearing an outfit
// texture, animated with KayKit's professional motion set (CC0) retargeted onto its skeleton.
// Legs and upper body are separate layers, so a player can run one way, aim another and reload at once.
// Crouching, aiming up and down, skydiving and holding the glider are procedural on top of the clips.
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { ASSETS } from './assets.js';
import { weaponGeo, pickaxeGeo, healGeo, gunMaterial, gunDefs, ZH_ID } from './zh/guns.js';
import { zhTextures } from './zh/textures.js';
import { gliderModel } from './zh/models.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const damp = (a, b, rate, dt) => b + (a - b) * Math.exp(-rate * dt);
const hex = (css) => new THREE.Color(css).getHex();

// tex: which painted skin; tint: repaint its clothes. Colors are for menus, gliders and first-person sleeves.
export const OUTFITS = [
  { id: 'rookie', name: 'Rookie', rarity: 0, tex: 'male', desc: 'Fresh off the Sky Coach and ready to loot.', primary: '#f2f2ef', secondary: '#e6e6e2', accent: '#16a37e', skin: '#f5946f', glove: '#f5946f', glider: 'delta' },
  { id: 'kickflip', name: 'Kickflip', rarity: 0, tex: 'skater-male', desc: 'Lands every drop like a rail grind.', primary: '#e8553f', secondary: '#1f4f86', accent: '#ffffff', skin: '#f5946f', glove: '#f5946f', glider: 'para' },
  { id: 'drifter', name: 'Wasteland Drifter', rarity: 1, tex: 'survivor-male', desc: 'Has slept in every barn on the island.', primary: '#cfe3ea', secondary: '#2a2a2a', accent: '#8a5a32', skin: '#f5946f', glove: '#2a2422', glider: 'para' },
  { id: 'grindrail', name: 'Grindrail', rarity: 1, tex: 'skater-female', desc: 'Black tee, red stripe, no brakes.', primary: '#1e1e22', secondary: '#2a2a2e', accent: '#e8382c', skin: '#f5946f', glove: '#f5946f', glider: 'delta' },
  { id: 'scrapper', name: 'Scrapper', rarity: 2, tex: 'survivor-female', tint: { skin: '#8a5636' }, desc: 'Builds a fort out of anything she finds.', primary: '#cfe6ee', secondary: '#b07c4a', accent: '#c0392b', skin: '#8a5636', glove: '#2a2422', glider: 'bird' },
  { id: 'shambler', name: 'Shambler', rarity: 2, tex: 'zombie-1', desc: 'Still hungry. Still looting.', primary: '#a08a70', secondary: '#6f8796', accent: '#6fd0e0', skin: '#a9b8c2', glove: '#a9b8c2', glider: 'moth' },
  { id: 'circuit', name: 'Circuit', rarity: 3, tex: 'cyborg-female', desc: 'Half chrome, all focus.', primary: '#2a2a2e', secondary: '#1f4f86', accent: '#ff5a3c', skin: '#f5946f', glove: '#1a1a1e', glider: 'delta' },
  { id: 'nightmare', name: 'Nightmare', rarity: 3, tex: 'zombie-2', desc: 'Rises when the storm rolls in.', primary: '#1f3a50', secondary: '#a0b0b8', accent: '#e8e8e8', skin: '#a9b8c2', glove: '#a9b8c2', glider: 'moth' },
  { id: 'nightfall', name: 'Nightfall', rarity: 4, tex: 'skater-female', tint: { shirt: '#5b2a99', pants: '#1c1428' }, desc: 'Drawn to the storm. Leaves no trace.', primary: '#5b2a99', secondary: '#1c1428', accent: '#b25cff', skin: '#f5946f', glove: '#f5946f', glider: 'moth' },
  { id: 'marshal', name: 'Sun Marshal', rarity: 4, tex: 'male', tint: { shirt: '#e8b440', pants: '#3a2e1e' }, desc: 'Forged at high noon. Shines brightest at the end.', primary: '#e8b440', secondary: '#3a2e1e', accent: '#ffd23f', skin: '#f5946f', glove: '#f5946f', glider: 'bird' },
];
for (const o of OUTFITS) {
  // first-person hands read these
  o.gear = { glove: hex(o.glove), carrier: hex(o.primary), mark: hex(o.accent) };
}

export function outfitById(id) {
  return OUTFITS.find((o) => o.id === id) || OUTFITS[0];
}

// Sleeve fabric for the first-person arms: the outfit's shirt color with a soft weave.
const FAB = new Map();
export function fabricMat(o) {
  if (FAB.has(o.id)) return FAB.get(o.id);
  const S = 64, c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  x.fillStyle = o.primary;
  x.fillRect(0, 0, S, S);
  for (let i = 0; i < 400; i++) {
    x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${0.03 + Math.random() * 0.04})`;
    x.fillRect(Math.random() * S, Math.random() * S, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, vertexColors: true, roughness: 0.9, metalness: 0, envMapIntensity: 0.55 });
  FAB.set(o.id, m);
  return m;
}

// ---------- shared clip sets ----------

const UPPER = new Set(['Spine', 'Chest', 'Head', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand']);
let CLIPS = null; // name -> { dur, lo, up }
let RIG = null; // scale and measured rest values

function clipSets() {
  if (CLIPS) return CLIPS;
  CLIPS = {};
  for (const c of ASSETS.character.animations) {
    const bone = (t) => t.name.split('.')[0];
    CLIPS[c.name] = {
      dur: c.duration,
      lo: new THREE.AnimationClip(c.name + ':lo', c.duration, c.tracks.filter((t) => !UPPER.has(bone(t)))),
      up: new THREE.AnimationClip(c.name + ':up', c.duration, c.tracks.filter((t) => UPPER.has(bone(t)))),
    };
  }
  const box = new THREE.Box3().setFromObject(ASSETS.character.scene);
  RIG = { scale: 1.8 / (box.max.y - box.min.y) };
  return CLIPS;
}

// ---------- the model ----------

const _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _r = new THREE.Quaternion();
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _ax = new THREE.Vector3();
const CURL = 1; // finger curl direction about each finger bone's local X

// Rotate a bone by `angle` about a world-space axis, on top of whatever the clips posed.
function turn(bone, axis, angle) {
  if (!angle) return;
  bone.parent.getWorldQuaternion(_pq);
  _r.setFromAxisAngle(axis, angle);
  _q.copy(_pq).invert().multiply(_r).multiply(_pq);
  bone.quaternion.premultiply(_q);
  bone.updateMatrixWorld(true);
}

// Swing a bone so that it points from itself toward `dirWorld` (its child sets its current direction).
function point(bone, child, dirWorld, amount = 1) {
  bone.getWorldPosition(_v);
  child.getWorldPosition(_v2);
  const cur = _v2.sub(_v).normalize();
  _r.setFromUnitVectors(cur, _ax.copy(dirWorld).normalize());
  if (amount < 1) _r.slerp(_q.identity(), 1 - amount);
  bone.parent.getWorldQuaternion(_pq);
  _q.copy(_pq).invert().multiply(_r).multiply(_pq);
  bone.quaternion.premultiply(_q);
  bone.updateMatrixWorld(true);
}

// Two-bone IK: bend upper/lower so `end` reaches `target`, elbow toward `pole`.
const _A = new THREE.Vector3(), _B = new THREE.Vector3(), _C = new THREE.Vector3(), _d = new THREE.Vector3(), _pp = new THREE.Vector3(), _el = new THREE.Vector3();
function reach(upper, lower, end, target, pole) {
  upper.getWorldPosition(_A);
  lower.getWorldPosition(_B);
  end.getWorldPosition(_C);
  const a = _A.distanceTo(_B), b = _B.distanceTo(_C);
  const d = clamp(_A.distanceTo(target), 1e-3, (a + b) * 0.999);
  _d.subVectors(target, _A).normalize();
  const along = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - along * along));
  _pp.copy(pole).addScaledVector(_d, -pole.dot(_d)).normalize();
  _el.copy(_A).addScaledVector(_d, along).addScaledVector(_pp, h);
  point(upper, lower, _el.sub(_A));
  lower.getWorldPosition(_B);
  point(lower, end, _el.subVectors(target, _B));
}

export class CharacterModel {
  constructor(outfit, name = null) {
    clipSets();
    this.outfit = outfit;
    this.name = name;
    this.root = new THREE.Group();
    this.body = new THREE.Group(); // tilts for skydiving and swimming, drops for crouching and seats
    this.root.add(this.body);
    this.rig = cloneSkinned(ASSETS.character.scene);
    this.rig.scale.setScalar(RIG.scale);
    this.rig.rotation.y = Math.PI; // the artist's model faces +Z; the game's characters face -Z
    this.body.add(this.rig);
    const mat = new THREE.MeshStandardMaterial({ map: ASSETS.skins[outfit.id], roughness: 0.78, metalness: 0, envMapIntensity: 0.6 });
    this.meshes = [];
    this.rig.traverse((o) => {
      if (o.isSkinnedMesh) {
        o.material = mat;
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false; // its bind-pose bounds don't follow the animation
        this.meshes.push(o);
      }
    });
    const b = (n) => this.rig.getObjectByName(n);
    this.bones = {
      hips: b('Hips'), spine: b('Spine'), chest: b('Chest'), head: b('Head'),
      lArm: b('LeftArm'), lFore: b('LeftForeArm'), lHand: b('LeftHand'), rArm: b('RightArm'), rFore: b('RightForeArm'), rHand: b('RightHand'),
      lUp: b('LeftUpLeg'), lLeg: b('LeftLeg'), lFoot: b('LeftFoot'), rUp: b('RightUpLeg'), rLeg: b('RightLeg'), rFoot: b('RightFoot'),
      rIndex: b('RightHandIndex1'), lIndex: b('LeftHandIndex1'),
    };
    this.curlFingers();
    this.mixer = new THREE.AnimationMixer(this.rig);
    this.layers = { lo: new Map(), up: new Map() };
    // a gun in the right hand, aimed where the player looks
    this.gun = new THREE.Mesh(weaponGeo('ar'), gunMaterial());
    this.gun.castShadow = true;
    this.gun.visible = false;
    this.root.add(this.gun);
    const T = zhTextures();
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.flash, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: 0xffffff }));
    this.flash.scale.set(0.5, 0.5, 1);
    this.flash.visible = false;
    this.gun.add(this.flash);
    // tools and consumables sit in the right fist
    this.grip = new THREE.Group();
    this.grip.scale.setScalar(1 / RIG.scale);
    this.bones.rHand.add(this.grip);
    this.glider = new THREE.Group();
    this.glider.position.set(0, 2.3, 0); // the bar (0.62 m below) meets the raised hands
    this.glider.add(gliderModel(outfit));
    this.glider.visible = false;
    this.root.add(this.glider);
    this.held = null;
    this.heldKey = '';
    this.gunType = 'ar';
    this.oneHanded = false;
    this.stride = 0;
    this.swing = 0;
    this.lastSwing = 0;
    this.recoil = 0;
    this.flinch = 0;
    this.flashT = 0;
    this.t = Math.random() * 10;
    this.ph = 0;
    this.crouchK = 0;
    this.tilt = 0;
    this.drop = 0;
    this.shot = null;
    this.lean = 0;
    this.skip = 0;
    this.cnt = 0;
    this.acc = 0;
    this.shadowNear = true;
  }

  // Kenney's hands are open; close them into fists for holding things.
  curlFingers() {
    for (const side of ['Left', 'Right']) {
      for (const [n, a] of [['Index1', 1.2], ['Index2', 1.3], ['Index3', 1.0]]) {
        const bone = this.rig.getObjectByName(`${side}Hand${n}`);
        if (bone) bone.rotateX(a * CURL);
      }
    }
  }

  // what: { kind:'weapon', type, rarity } | 'pickaxe' | { kind:'heal', type } | 'build' | null
  setHeld(what) {
    const key = !what ? '' : typeof what === 'string' ? what : `${what.kind}-${what.type}-${what.rarity | 0}`;
    if (key === this.heldKey) return;
    this.heldKey = key;
    if (this.held) {
      this.grip.remove(this.held);
      this.held = null;
    }
    if (what && what.kind === 'weapon') {
      this.gunType = what.type;
      this.oneHanded = what.type === 'pistol';
      this.gun.geometry = weaponGeo(what.type, what.rarity);
      const d = gunDefs()[ZH_ID[what.type] || 'ar'];
      const mz = d.muzzle || [0, 0, -0.3];
      this.flash.position.set(mz[0], mz[1], mz[2] - 0.05);
      return;
    }
    if (what === 'pickaxe') {
      this.held = new THREE.Mesh(pickaxeGeo(this.outfit.gear.mark), gunMaterial());
      // the handle runs through the fist, head up and forward
      this.held.rotation.set(0, 0, 2.44);
      this.held.position.set(0, 0.06, 0.02);
    } else if (what && what.kind === 'heal') {
      this.held = new THREE.Mesh(healGeo(what.type), gunMaterial());
      this.held.position.set(0, 0.06, 0.03);
    }
    if (this.held) {
      this.held.castShadow = this.shadowNear;
      this.grip.add(this.held);
    }
  }

  // Far characters animate less often and stop casting shadows.
  lod(dist) {
    this.skip = dist > 160 ? 3 : dist > 80 ? 1 : 0;
    const near = dist < 70;
    if (near === this.shadowNear) return;
    this.shadowNear = near;
    this.root.traverse((o) => {
      if (o.isMesh) o.castShadow = near;
    });
  }

  fired() {
    this.recoil = 1;
    this.flashT = 0.05;
    this.flash.material.rotation = Math.random() * TAU;
  }

  // ---------- animation layers ----------

  // Set this frame's clips for a layer: entries are [clipName, weight, time].
  pose(layer, entries, dt) {
    const L = this.layers[layer];
    for (const s of L.values()) s.target = 0;
    for (const [name, w, time] of entries) {
      let s = L.get(name);
      if (!s) {
        const set = CLIPS[name];
        if (!set) continue;
        const a = this.mixer.clipAction(set[layer]);
        a.play();
        a.paused = true;
        a.setEffectiveWeight(0);
        s = { a, w: 0, target: 0, dur: set.dur };
        L.set(name, s);
      }
      s.target += w;
      s.a.time = clamp(time, 0, s.dur - 1e-4);
    }
    let sum = 0;
    const k = 1 - Math.exp(-dt * 12);
    for (const s of L.values()) {
      s.w += (s.target - s.w) * k;
      if (s.target === 0 && s.w < 0.01) s.w = 0;
      sum += s.w;
    }
    for (const s of L.values()) {
      const w = sum > 0 ? s.w / sum : 0;
      s.a.enabled = w > 0;
      s.a.setEffectiveWeight(w);
    }
  }

  loopT(name, rate = 1) {
    const d = CLIPS[name] ? CLIPS[name].dur : 1;
    return (this.t * rate) % d;
  }

  // Start a one-shot clip on a layer (pickaxe swings, landings).
  play(name, layer, len) {
    const d = CLIPS[name] ? CLIPS[name].dur : 1;
    this.shot = { name, layer, t0: this.t, len: len || d, dur: d };
  }

  // p: { dt, mode, speed, crouch, pitch, holding ('gun'|'pickaxe'|'heal'|'build'|null), aiming, emote,
  //      sprinting, onGround, reload (0..1 or -1), switching (0..1), vf, vr (velocity along facing / right) }
  animate(p) {
    let dt = p.dt;
    this.acc += dt;
    if (this.skip && this.cnt++ % (this.skip + 1)) return;
    dt = this.acc;
    this.acc = 0;
    this.t += dt;
    const mode = p.mode, hs = p.speed || 0, pitch = p.pitch || 0;
    const B = this.bones;
    const gunOut = p.holding === 'gun' && mode === 'ground';
    this.glider.visible = mode === 'glide';
    this.flashT -= dt;
    this.recoil = Math.max(0, this.recoil - dt * 8);
    this.flinch = Math.max(0, this.flinch - dt * 5);
    if (this.swing > this.lastSwing + 0.3) this.play('1H_Melee_Attack_Chop', 'up', 0.62);
    this.lastSwing = this.swing;
    this.swing = Math.max(0, this.swing - dt * 3.2);
    this.crouchK = damp(this.crouchK, p.crouch && mode === 'ground' && p.onGround ? 1 : 0, 12, dt);
    const lo = [], up = [];
    let tilt = 0, seat = false, emote = false;
    if (mode === 'freefall') {
      lo.push(['Jump_Idle', 1, this.loopT('Jump_Idle')]);
      up.push(['Jump_Idle', 1, this.loopT('Jump_Idle')]);
      tilt = -1.2 + clamp(-pitch, -0.3, 0.6) * 0.4;
    } else if (mode === 'glide') {
      lo.push(['Jump_Idle', 1, this.loopT('Jump_Idle', 0.6)]);
      up.push(['Jump_Idle', 1, 0.5]);
      tilt = -0.12;
    } else if (mode === 'vehicle') {
      lo.push(['Sit_Chair_Idle', 1, this.loopT('Sit_Chair_Idle')]);
      up.push(['Sit_Chair_Idle', 1, this.loopT('Sit_Chair_Idle')]);
      seat = true;
    } else if (p.emote && mode === 'ground') {
      lo.push(['Cheer', 1, this.loopT('Cheer')]);
      up.push(['Cheer', 1, this.loopT('Cheer')]);
      emote = true;
    } else {
      // legs: idle stance, or a direction-blended walk/run whose cadence follows the speed
      const swim = mode === 'swim';
      const fwd = p.vf ?? hs, side = p.vr ?? 0;
      const moving = hs > 0.35;
      this.ph = (this.ph + dt * (0.55 + hs * 0.2)) % 1;
      this.stride += hs * dt;
      const legs = [];
      if (!p.onGround && mode === 'ground') legs.push(['Jump_Idle', 1, this.loopT('Jump_Idle')]);
      else if (swim) legs.push(['Running_B', 1, this.ph * CLIPS.Running_B.dur * 0.7]);
      else if (!moving) legs.push([gunOut ? '2H_Ranged_Aiming' : 'Idle', 1, this.loopT(gunOut ? '2H_Ranged_Aiming' : 'Idle')]);
      else {
        const a = Math.atan2(side, fwd), cf = Math.cos(a), sf = Math.sin(a);
        const run = smooth(2.4, 4.2, hs) * (1 - this.crouchK * 0.6);
        const at = (n) => this.ph * CLIPS[n].dur;
        if (cf > 0) {
          legs.push(['Running_A', cf * run, at('Running_A')]);
          legs.push(['Walking_A', cf * (1 - run), at('Walking_A')]);
        } else legs.push(['Walking_Backwards', -cf, at('Walking_Backwards')]);
        if (sf > 0) legs.push(['Running_Strafe_Right', sf, at('Running_Strafe_Right')]);
        else if (sf < 0) legs.push(['Running_Strafe_Left', -sf, at('Running_Strafe_Left')]);
      }
      lo.push(...legs);
      // upper body: what the hands are doing
      const shot = this.shot && this.shot.layer === 'up' && this.t - this.shot.t0 < this.shot.len ? this.shot : null;
      if (gunOut) {
        const aimClip = this.oneHanded ? '1H_Ranged_Aiming' : '2H_Ranged_Aiming';
        if (p.reload >= 0) {
          const rc = this.oneHanded ? '1H_Ranged_Reload' : '2H_Ranged_Reload';
          up.push([rc, 1, clamp(p.reload, 0, 1) * CLIPS[rc].dur]);
        } else up.push([aimClip, 1, this.loopT(aimClip)]);
      } else if (shot) {
        up.push([shot.name, 1, ((this.t - shot.t0) / shot.len) * shot.dur]);
      } else if (p.holding === 'heal') up.push(['Use_Item', 1, this.loopT('Use_Item')]);
      else if (p.holding === 'build') up.push(['1H_Ranged_Aiming', 1, this.loopT('1H_Ranged_Aiming')]);
      else up.push(...legs);
      if (swim) tilt = -1.0;
    }
    this.pose('lo', lo, dt);
    this.pose('up', up, dt);
    this.mixer.update(0);
    this.rig.updateMatrixWorld(true);
    // ---------- procedural layers ----------
    this.root.updateMatrixWorld(true);
    const right = _v.set(1, 0, 0).applyQuaternion(this.root.quaternion).clone();
    // crouch: bend the knees and lower the body; lean in a little
    const c = this.crouchK;
    let drop = 0;
    if (c > 0.01) {
      const th = c * 0.95;
      for (const [u, l, f] of [[B.lUp, B.lLeg, B.lFoot], [B.rUp, B.rLeg, B.rFoot]]) {
        turn(u, right, th);
        turn(l, right, -th * 2);
        turn(f, right, th);
      }
      drop = 0.54 * (1 - Math.cos(th));
      turn(B.spine, right, -0.25 * c);
    }
    // aim: the chest and head follow the look pitch so the gun points where the player looks
    if (gunOut || p.holding === 'build') {
      const lowReady = p.sprinting ? 0.55 : 0;
      const sw = (p.switching || 0) * 0.7;
      const pa = clamp(pitch, -1.2, 1.2);
      turn(B.spine, right, pa * 0.4 - lowReady * 0.5 - sw * 0.5 + this.recoil * 0.05);
      turn(B.chest, right, pa * 0.4 - lowReady * 0.5 - sw * 0.5 + this.recoil * 0.04);
      turn(B.head, right, pa * 0.15);
    } else if (mode === 'ground' && !emote) turn(B.head, right, clamp(pitch, -0.8, 0.8) * 0.5);
    if (this.flinch > 0) turn(B.chest, _v2.set(0, 0, 1).applyQuaternion(this.root.quaternion), Math.sin(this.t * 40) * 0.12 * this.flinch);
    // glider: both hands up on the bar
    if (mode === 'glide') {
      const upv = _v2.set(0, 1, 0);
      for (const [s, arm, fore, hand] of [[1, B.lArm, B.lFore, B.lHand], [-1, B.rArm, B.rFore, B.rHand]]) {
        const d = new THREE.Vector3(s * 0.35, 1, -0.05).applyQuaternion(this.root.quaternion);
        point(arm, fore, d);
        point(fore, hand, d.add(upv.set(s * -0.1, 0.2, 0)));
      }
    }
    // seats: hands forward on the wheel
    if (seat) {
      for (const [arm, fore, hand] of [[B.lArm, B.lFore, B.lHand], [B.rArm, B.rFore, B.rHand]]) {
        point(arm, fore, new THREE.Vector3(0, -0.45, -1).applyQuaternion(this.root.quaternion), 0.8);
        point(fore, hand, new THREE.Vector3(0, 0.1, -1).applyQuaternion(this.root.quaternion), 0.8);
      }
    }
    // body: skydive and swim tilt, crouch and seat height
    this.tilt = damp(this.tilt, tilt, 8, dt);
    this.body.rotation.x = this.tilt;
    let y = -drop;
    if (seat) {
      B.hips.getWorldPosition(_v2);
      y = 0.55 - (_v2.y - this.root.position.y - this.body.position.y);
    }
    this.drop = damp(this.drop, y, 14, dt);
    this.body.position.y = this.drop;
    // the gun: its grip in the right fist, pointing along the look direction; the left hand on the foregrip
    this.gun.visible = gunOut;
    this.flash.visible = this.flashT > 0 && gunOut;
    if (gunOut) {
      this.rig.updateMatrixWorld(true);
      const d = gunDefs()[ZH_ID[this.gunType] || 'ar'];
      const aimP = p.sprinting ? -0.6 : clamp(pitch, -1.2, 1.2) - (p.switching || 0) * 0.8;
      this.gun.rotation.set(aimP - this.recoil * 0.08, 0, 0);
      this.gun.updateMatrix();
      B.rHand.localToWorld(_v2.set(0, 0.06, 0));
      this.root.worldToLocal(_v2);
      const g = d.grip || [0, -0.05, 0.03];
      this.gun.position.copy(_v2).sub(_v.set(g[0], g[1], g[2]).applyQuaternion(this.gun.quaternion));
      this.gun.updateMatrixWorld(true);
      if (p.reload < 0 || this.oneHanded) {
        const f = this.oneHanded ? [g[0] - 0.035, g[1] - 0.01, g[2] + 0.01] : d.fore || [0, 0, -0.3];
        const tgt = this.gun.localToWorld(new THREE.Vector3(f[0], f[1] - (this.oneHanded ? 0 : 0.04), f[2]));
        // the hand bone is the wrist: aim it so the palm, not the wrist, lands on the grip
        tgt.addScaledVector(_v.set(0, 0, 1).applyQuaternion(this.root.quaternion), 0.05);
        const pole = new THREE.Vector3(-0.7, -1, 0).applyQuaternion(this.root.quaternion);
        reach(B.lArm, B.lFore, B.lHand, tgt, pole);
      }
    }
    if (this.glider.visible) this.glider.rotation.z = Math.sin(this.t * 1.7) * 0.05;
  }

  // World position of the gun muzzle for tracers and flashes.
  muzzle(out) {
    if (!this.gun.visible) {
      this.bones.head.updateWorldMatrix(true, false);
      return this.bones.head.getWorldPosition(out).add(_v.set(0, 0.1, 0));
    }
    this.gun.updateWorldMatrix(true, false);
    const d = gunDefs()[ZH_ID[this.gunType] || 'ar'];
    const m = d.muzzle || [0, 0, -0.3];
    return this.gun.localToWorld(out.set(m[0], m[1], m[2]));
  }
}

// Locker card portraits: each outfit rendered once, head and shoulders in a three-quarter view.
let PORTRAITS = null;
export function outfitPortraits() {
  if (PORTRAITS) return PORTRAITS;
  PORTRAITS = {};
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), alpha: true, antialias: true, preserveDrawingBuffer: true });
  } catch {
    return PORTRAITS;
  }
  renderer.setSize(192, 184, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x40486a, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(1.5, 2.5, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe0ff, 1.6);
  rim.position.set(-2, 1.5, -2);
  scene.add(rim);
  const cam = new THREE.PerspectiveCamera(26, 192 / 184, 0.1, 20);
  cam.position.set(0.9, 1.45, 3.1);
  cam.lookAt(0, 1.12, 0);
  for (const o of OUTFITS) {
    const m = new CharacterModel(o);
    m.root.rotation.y = Math.PI + 0.35;
    for (let i = 0; i < 20; i++) m.animate({ dt: 1 / 30, mode: 'ground', speed: 0, pitch: 0, onGround: true, holding: null, reload: -1 });
    scene.add(m.root);
    renderer.render(scene, cam);
    PORTRAITS[o.id] = renderer.domElement.toDataURL('image/png');
    scene.remove(m.root);
  }
  renderer.dispose();
  return PORTRAITS;
}
