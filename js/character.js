import * as THREE from 'three';
import { GeoBuilder } from './world/geobuilder.js';
import { weaponModel, pickaxeModel, healModel } from './items.js';
import { clamp, lerp } from './util.js';

// Ten original outfits. Each is a color and shape variation of the 6-part body:
// head, torso, arms, legs, backpack and glider.
export const OUTFITS = [
  { id: 'rookie', name: 'Rookie Ranger', rarity: 0, desc: 'Fresh off the coach and ready to loot.', skin: '#e0ac85', primary: '#6b7a8f', secondary: '#3e4a5a', accent: '#d8d8d8', hair: '#5a3a24', head: 'hair', torso: 'jacket', pack: 'pack', glider: 'delta' },
  { id: 'scout', name: 'Trail Scout', rarity: 1, desc: 'Knows every shortcut on the island.', skin: '#c68a64', primary: '#4f7a3a', secondary: '#8a6a45', accent: '#e0c060', hair: '#2a1a10', head: 'cap', torso: 'vest', pack: 'pack', glider: 'para' },
  { id: 'harbor', name: 'Harbor Hand', rarity: 1, desc: 'Rain or shine, the docks stay open.', skin: '#8d5a3b', primary: '#e8b23a', secondary: '#2f4f6f', accent: '#ffffff', hair: '#1a1a1a', head: 'beanie', torso: 'jacket', pack: 'tank', glider: 'delta' },
  { id: 'circuit', name: 'Circuit Breaker', rarity: 2, desc: 'Overclocked and overcharged.', skin: '#f1c7a3', primary: '#2e86de', secondary: '#1b2838', accent: '#7ff0ff', hair: '#111', head: 'helmet', torso: 'armor', pack: 'tank', glider: 'delta', glow: true },
  { id: 'nomad', name: 'Dune Nomad', rarity: 2, desc: 'The desert wind carries no secrets.', skin: '#b07a52', primary: '#d9b37a', secondary: '#8a5a35', accent: '#c0392b', hair: '#3a2416', head: 'hood', torso: 'robe', pack: 'pack', glider: 'para' },
  { id: 'frost', name: 'Frost Warden', rarity: 2, desc: 'Guardian of the northern peaks.', skin: '#f0d0b8', primary: '#e8f1f8', secondary: '#4f86b8', accent: '#bfe8ff', hair: '#e8eef4', head: 'fur', torso: 'armor', pack: 'pack', glider: 'delta' },
  { id: 'moth', name: 'Midnight Moth', rarity: 3, desc: 'Drawn to the brightest storm.', skin: '#9c8ad8', primary: '#2b2140', secondary: '#5a3f8a', accent: '#e070ff', hair: '#1a1028', head: 'antenna', torso: 'jacket', pack: 'wings', glider: 'moth', glow: true },
  { id: 'solar', name: 'Solar Knight', rarity: 3, desc: 'Forged at high noon.', skin: '#e0ac85', primary: '#e8c34a', secondary: '#8a6a2a', accent: '#fff3b0', hair: '#7a4a1a', head: 'knight', torso: 'armor', pack: 'cape', glider: 'delta', glow: true },
  { id: 'racer', name: 'Neon Racer', rarity: 4, desc: 'Never brakes. Never looks back.', skin: '#d9a27a', primary: '#141820', secondary: '#2a2f3a', accent: '#2bffd5', hair: '#111', head: 'racer', torso: 'jacket', pack: 'rocket', glider: 'delta', glow: true },
  { id: 'phoenix', name: 'Ember Phoenix', rarity: 4, desc: 'Every fall is just a new launch.', skin: '#f2b88a', primary: '#d83a1e', secondary: '#ffb02e', accent: '#ffe080', hair: '#ff6a1a', head: 'flame', torso: 'armor', pack: 'wings', glider: 'bird', glow: true },
];

export function outfitById(id) {
  return OUTFITS.find((o) => o.id === id) || OUTFITS[0];
}

const partCache = new Map();

function buildParts(o) {
  if (partCache.has(o.id)) return partCache.get(o.id);
  const make = (fn) => {
    const gb = new GeoBuilder();
    gb.jitter = 0;
    fn(gb);
    return gb.build();
  };
  const P = o.primary, S = o.secondary, A = o.accent, K = o.skin, H = o.hair;
  const parts = {};
  parts.head = make((gb) => {
    gb.sphere(0, 0.17, 0, 0.17, 10, 7, K, 1.1);
    gb.box(-0.075, 0.17, -0.165, -0.035, 0.22, -0.14, '#1d1d24');
    gb.box(0.035, 0.17, -0.165, 0.075, 0.22, -0.14, '#1d1d24');
    gb.box(-0.04, 0.09, -0.16, 0.04, 0.11, -0.145, '#8a4a40');
    switch (o.head) {
      case 'hair':
        gb.sphere(0, 0.22, 0.02, 0.175, 10, 7, H, 0.85, true);
        gb.box(-0.16, 0.12, 0.0, 0.16, 0.3, 0.17, H);
        break;
      case 'cap':
        gb.sphere(0, 0.22, 0, 0.18, 10, 7, S, 0.8, true);
        gb.box(-0.13, 0.24, -0.33, 0.13, 0.26, -0.12, S);
        gb.box(-0.03, 0.36, -0.03, 0.03, 0.38, 0.03, A);
        break;
      case 'beanie':
        gb.sphere(0, 0.22, 0, 0.185, 10, 7, A === '#ffffff' ? '#c0392b' : A, 0.95, true);
        gb.box(-0.19, 0.2, -0.19, 0.19, 0.26, 0.19, '#ffffff');
        break;
      case 'helmet':
        gb.sphere(0, 0.18, 0, 0.205, 10, 7, P, 1.05);
        gb.box(-0.15, 0.13, -0.215, 0.15, 0.25, -0.17, A);
        break;
      case 'hood':
        gb.sphere(0, 0.19, 0.03, 0.215, 10, 7, P, 1.1);
        gb.box(-0.13, 0.04, -0.2, 0.13, 0.14, -0.12, A);
        gb.box(-0.13, 0.14, -0.19, 0.13, 0.26, -0.17, '#3a2a1a');
        break;
      case 'fur':
        gb.sphere(0, 0.2, 0.02, 0.21, 10, 7, '#f4f6f8', 1.05, true);
        gb.box(-0.21, 0.12, -0.05, 0.21, 0.2, 0.2, '#f4f6f8');
        gb.box(-0.2, 0.32, -0.02, -0.12, 0.42, 0.06, S);
        gb.box(0.12, 0.32, -0.02, 0.2, 0.42, 0.06, S);
        break;
      case 'antenna':
        gb.sphere(0, 0.2, 0.02, 0.19, 10, 7, P, 1.05, true);
        gb.boxRot(-0.08, 0.32, 0, 0.03, 0.28, 0.03, 0, A);
        gb.boxRot(0.08, 0.32, 0, 0.03, 0.28, 0.03, 0, A);
        gb.sphere(-0.08, 0.62, 0, 0.04, 6, 4, A);
        gb.sphere(0.08, 0.62, 0, 0.04, 6, 4, A);
        break;
      case 'knight':
        gb.sphere(0, 0.18, 0, 0.21, 10, 7, P, 1.1);
        gb.box(-0.15, 0.17, -0.22, 0.15, 0.2, -0.18, '#222');
        gb.box(-0.03, 0.36, -0.12, 0.03, 0.5, 0.2, A);
        break;
      case 'racer':
        gb.sphere(0, 0.18, 0, 0.21, 10, 7, P, 1.08);
        gb.box(-0.17, 0.12, -0.22, 0.17, 0.26, -0.15, A);
        gb.box(-0.02, 0.38, -0.2, 0.02, 0.4, 0.2, A);
        break;
      case 'flame':
        gb.sphere(0, 0.22, 0.02, 0.18, 10, 7, H, 0.8, true);
        for (let i = 0; i < 5; i++) gb.cone(-0.12 + i * 0.06, 0.28, 0.02 + (i % 2) * 0.05, 0.06, 0.22 + (i % 2) * 0.08, 5, i % 2 ? A : S);
        break;
    }
  });
  parts.torso = make((gb) => {
    gb.box(-0.25, 0, -0.14, 0.25, 0.58, 0.14, P);
    gb.box(-0.26, -0.02, -0.15, 0.26, 0.08, 0.15, '#2b2b2b');
    gb.box(-0.04, 0, -0.152, 0.04, 0.07, -0.145, A);
    switch (o.torso) {
      case 'jacket':
        gb.box(-0.16, 0.48, -0.16, 0.16, 0.62, 0.12, S);
        gb.box(-0.02, 0.08, -0.15, 0.02, 0.56, -0.142, A);
        break;
      case 'vest':
        gb.box(-0.255, 0.1, -0.15, -0.06, 0.52, 0.15, S);
        gb.box(0.06, 0.1, -0.15, 0.255, 0.52, 0.15, S);
        break;
      case 'armor':
        gb.box(-0.22, 0.2, -0.17, 0.22, 0.52, -0.13, S);
        gb.box(-0.1, 0.28, -0.18, 0.1, 0.42, -0.165, A);
        gb.box(-0.34, 0.46, -0.15, -0.18, 0.62, 0.15, S);
        gb.box(0.18, 0.46, -0.15, 0.34, 0.62, 0.15, S);
        break;
      case 'robe':
        gb.box(-0.28, -0.32, -0.16, 0.28, 0.1, 0.16, P);
        gb.box(-0.2, 0.45, -0.17, 0.2, 0.6, 0.16, A);
        break;
    }
  });
  parts.arm = make((gb) => {
    gb.box(-0.075, -0.32, -0.08, 0.075, 0.04, 0.08, o.torso === 'vest' ? K : P);
    gb.box(-0.07, -0.55, -0.075, 0.07, -0.32, 0.075, o.torso === 'armor' ? S : P);
    gb.box(-0.06, -0.66, -0.065, 0.06, -0.55, 0.065, o.glow ? A : K);
  });
  parts.leg = make((gb) => {
    gb.box(-0.1, -0.5, -0.11, 0.1, 0.02, 0.11, S);
    gb.box(-0.095, -0.82, -0.105, 0.095, -0.5, 0.105, S);
    gb.box(-0.1, -0.92, -0.17, 0.1, -0.8, 0.12, o.torso === 'armor' ? A : '#2a2a2a');
  });
  parts.pack = make((gb) => {
    switch (o.pack) {
      case 'pack':
        gb.box(-0.18, -0.05, 0.0, 0.18, 0.36, 0.2, S);
        gb.box(-0.14, 0.0, 0.2, 0.14, 0.18, 0.26, P);
        break;
      case 'tank':
        gb.cylinder(-0.08, -0.1, 0.12, 0.08, 0.08, 0.5, 8, A);
        gb.cylinder(0.08, -0.1, 0.12, 0.08, 0.08, 0.5, 8, A);
        break;
      case 'wings':
        for (const s of [-1, 1]) {
          const c = gb.rgb(o.id === 'moth' ? S : A);
          gb.tri([0, 0.3, 0.05], [s * 0.75, 0.62, 0.22], [s * 0.6, -0.05, 0.18], c);
          gb.tri([0, 0.3, 0.05], [s * 0.6, -0.05, 0.18], [s * 0.75, 0.62, 0.22], c);
          gb.tri([0, 0.15, 0.05], [s * 0.45, -0.35, 0.2], [s * 0.15, -0.3, 0.15], gb.rgb(P));
          gb.tri([0, 0.15, 0.05], [s * 0.15, -0.3, 0.15], [s * 0.45, -0.35, 0.2], gb.rgb(P));
        }
        break;
      case 'cape': {
        const c = gb.rgb('#b0302a');
        gb.quad([-0.24, 0.5, 0.16], [0.24, 0.5, 0.16], [0.3, -0.75, 0.32], [-0.3, -0.75, 0.32], c);
        gb.quad([-0.3, -0.75, 0.32], [0.3, -0.75, 0.32], [0.24, 0.5, 0.16], [-0.24, 0.5, 0.16], c);
        break;
      }
      case 'rocket':
        gb.cylinder(0, -0.15, 0.14, 0.12, 0.12, 0.5, 8, S);
        gb.cone(0, 0.35, 0.14, 0.12, 0.18, 8, A);
        gb.box(-0.16, -0.15, 0.1, 0.16, -0.05, 0.18, A);
        break;
    }
  });
  parts.glider = make((gb) => {
    const c1 = gb.rgb(P), c2 = gb.rgb(A), c3 = gb.rgb(S);
    switch (o.glider) {
      case 'delta':
        gb.tri([0, 0.3, -1.2], [-1.6, 0, 0.6], [0, 0.12, 0.3], c1);
        gb.tri([0, 0.3, -1.2], [0, 0.12, 0.3], [1.6, 0, 0.6], c2);
        gb.tri([0, 0.3, -1.2], [0, 0.12, 0.3], [-1.6, 0, 0.6], c1);
        gb.tri([0, 0.3, -1.2], [1.6, 0, 0.6], [0, 0.12, 0.3], c2);
        gb.box(-0.03, -0.9, -0.03, 0.03, 0.12, 0.03, gb.rgb('#333'));
        gb.box(-0.5, -0.9, -0.03, 0.5, -0.86, 0.03, gb.rgb('#333'));
        break;
      case 'para':
        for (let i = 0; i < 7; i++) {
          const a0 = -0.9 + (i / 7) * 1.8, a1 = -0.9 + ((i + 1) / 7) * 1.8;
          const p = (a, z) => [Math.sin(a) * 1.8, Math.cos(a) * 0.7 - 0.2, z];
          const col = i % 2 ? c1 : c2;
          gb.quad(p(a0, -0.6), p(a1, -0.6), p(a1, 0.6), p(a0, 0.6), col);
          gb.quad(p(a0, 0.6), p(a1, 0.6), p(a1, -0.6), p(a0, -0.6), col);
        }
        for (const s of [-1, 1]) gb.boxRot(s * 0.75, -0.9, 0, 0.02, 1.3, 0.02, 0, gb.rgb('#ddd'));
        break;
      case 'moth':
      case 'bird':
        for (const s of [-1, 1]) {
          const col = o.glider === 'moth' ? c3 : c1;
          gb.tri([0, 0.1, -0.3], [s * 2.0, 0.5, -0.6], [s * 1.6, 0.0, 0.8], col);
          gb.tri([0, 0.1, -0.3], [s * 1.6, 0.0, 0.8], [s * 2.0, 0.5, -0.6], col);
          gb.tri([0, 0.1, -0.3], [s * 1.2, 0.2, 0.3], [s * 0.4, 0.05, 0.9], c2);
          gb.tri([0, 0.1, -0.3], [s * 0.4, 0.05, 0.9], [s * 1.2, 0.2, 0.3], c2);
        }
        gb.box(-0.03, -0.9, -0.03, 0.03, 0.1, 0.03, gb.rgb('#333'));
        break;
    }
  });
  partCache.set(o.id, parts);
  return parts;
}

let charMat = null;
let glowMat = null;
function materials() {
  if (!charMat) {
    charMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    glowMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x222222 });
  }
  return { charMat, glowMat };
}

export class CharacterModel {
  constructor(outfit) {
    this.outfit = outfit;
    const parts = buildParts(outfit);
    const { charMat: cm, glowMat: gm } = materials();
    const mat = outfit.glow ? gm : cm;
    const mesh = (g) => {
      const m = new THREE.Mesh(g, mat);
      m.castShadow = true;
      return m;
    };
    this.root = new THREE.Group();
    this.body = new THREE.Group(); // tilts for skydiving
    this.root.add(this.body);
    this.hips = new THREE.Group();
    this.hips.position.y = 0.92;
    this.body.add(this.hips);
    this.torso = new THREE.Group();
    this.torso.add(mesh(parts.torso));
    this.hips.add(this.torso);
    this.head = new THREE.Group();
    this.head.position.y = 0.6;
    this.head.add(mesh(parts.head));
    this.torso.add(this.head);
    this.armL = new THREE.Group();
    this.armL.position.set(-0.33, 0.52, 0);
    this.armL.add(mesh(parts.arm));
    this.torso.add(this.armL);
    this.armR = new THREE.Group();
    this.armR.position.set(0.33, 0.52, 0);
    this.armR.add(mesh(parts.arm));
    this.torso.add(this.armR);
    this.legL = new THREE.Group();
    this.legL.position.set(-0.12, 0, 0);
    this.legL.add(mesh(parts.leg));
    this.hips.add(this.legL);
    this.legR = new THREE.Group();
    this.legR.position.set(0.12, 0, 0);
    this.legR.add(mesh(parts.leg));
    this.hips.add(this.legR);
    this.pack = new THREE.Group();
    this.pack.position.set(0, 0.18, 0.14);
    this.pack.add(mesh(parts.pack));
    this.torso.add(this.pack);
    this.glider = new THREE.Group();
    this.glider.position.set(0, 2.55, 0);
    this.glider.add(mesh(parts.glider));
    this.glider.visible = false;
    this.root.add(this.glider);
    this.hand = new THREE.Group();
    this.hand.position.set(0, -0.6, 0);
    this.hand.rotation.x = -Math.PI / 2;
    this.armR.add(this.hand);
    this.held = null;
    this.heldKey = '';
    this.phase = 0;
    this.swing = 0;
    this.recoil = 0;
    this.emoteT = 0;
  }

  // what: { kind:'weapon', type, rarity } | 'pickaxe' | { kind:'heal', type } | 'build' | null
  setHeld(what) {
    const key = !what ? '' : typeof what === 'string' ? what : `${what.kind}-${what.type}-${what.rarity ?? ''}`;
    if (key === this.heldKey) return;
    this.heldKey = key;
    if (this.held) {
      this.hand.remove(this.held);
      this.held = null;
    }
    if (!what || what === 'build') return;
    if (what === 'pickaxe') {
      this.held = pickaxeModel(this.outfit.accent);
      this.held.rotation.x = Math.PI / 2;
      this.held.position.set(0, 0, 0.0);
    } else if (what.kind === 'weapon') {
      this.held = weaponModel(what.type, what.rarity);
    } else if (what.kind === 'heal') {
      this.held = healModel(what.type);
      this.held.rotation.x = Math.PI / 2;
    }
    if (this.held) this.hand.add(this.held);
  }

  // p: { mode, speed, crouch, pitch, holding ('gun'|'pickaxe'|'heal'|'build'|null), aiming, dt, emote, swingT }
  animate(p) {
    const dt = p.dt;
    const mode = p.mode;
    const k = 1 - Math.exp(-dt * 14);
    const target = {
      bodyX: 0, hipsY: 0.92, torsoX: 0, headX: 0,
      armLX: 0, armLZ: 0.08, armRX: 0, armRZ: -0.08, armRY: 0, armLY: 0,
      legLX: 0, legRX: 0, legLZ: 0, legRZ: 0,
    };
    this.glider.visible = mode === 'glide';
    const pitch = p.pitch || 0;
    if (mode === 'freefall') {
      target.bodyX = -1.25 + clamp(-pitch, -0.3, 0.6) * 0.4;
      target.armLZ = 1.3;
      target.armRZ = -1.3;
      target.armLX = 0.3;
      target.armRX = 0.3;
      target.legLZ = 0.35;
      target.legRZ = -0.35;
      target.headX = 0.9;
      this.phase += dt * 6;
      target.legLX = Math.sin(this.phase) * 0.15;
      target.legRX = -Math.sin(this.phase) * 0.15;
    } else if (mode === 'glide') {
      target.armLZ = 2.7;
      target.armRZ = -2.7;
      target.legLX = 0.2;
      target.legRX = -0.1;
      target.bodyX = -0.15;
    } else if (mode === 'vehicle') {
      target.hipsY = 0.55;
      target.legLX = Math.PI / 2;
      target.legRX = Math.PI / 2;
      target.armLX = 1.1;
      target.armRX = 1.1;
      target.armLZ = -0.2;
      target.armRZ = 0.2;
    } else if (mode === 'bus' || mode === 'dead') {
      // hidden
    } else {
      const sp = p.speed || 0;
      const moving = sp > 0.3;
      this.phase += dt * (moving ? 2.4 + sp * 1.25 : 0);
      const amp = moving ? clamp(sp / 6, 0.3, 1) * 0.75 : 0;
      target.legLX = Math.sin(this.phase) * amp;
      target.legRX = -Math.sin(this.phase) * amp;
      target.armLX = -Math.sin(this.phase) * amp * 0.8;
      target.armRX = Math.sin(this.phase) * amp * 0.8;
      if (mode === 'swim') {
        target.bodyX = -1.1;
        target.armLX = Math.sin(this.phase) * 1.4 + 1.5;
        target.armRX = -Math.sin(this.phase) * 1.4 + 1.5;
      }
      if (p.crouch) {
        target.hipsY = 0.6;
        target.legLX += 1.0;
        target.legRX += 0.5;
        target.torsoX = -0.25;
      }
      target.headX = clamp(pitch, -0.8, 0.8) * 0.5;
      if (p.holding === 'gun') {
        target.armRX = Math.PI / 2 + pitch;
        target.armRZ = 0.05;
        target.armLX = Math.PI / 2 + pitch - 0.05;
        target.armLZ = -0.55;
        target.armLY = -0.4;
        if (p.aiming) target.armRX += 0.02;
        target.armRX += this.recoil * 0.4;
      } else if (p.holding === 'pickaxe') {
        target.armRX = Math.PI / 2.6 + pitch * 0.4;
        if (this.swing > 0) target.armRX = lerp(0.2, 2.6, Math.sin((1 - this.swing) * Math.PI));
      } else if (p.holding === 'heal') {
        target.armRX = 1.2;
        target.armLX = 1.2;
        target.armLZ = -0.4;
        target.armRZ = 0.4;
      } else if (p.holding === 'build') {
        target.armRX = Math.PI / 2 + pitch * 0.6;
      }
      if (p.emote) {
        this.emoteT += dt;
        const e = this.emoteT * 6;
        target.armLZ = 1.5 + Math.sin(e) * 1.2;
        target.armRZ = -1.5 + Math.sin(e + Math.PI) * 1.2;
        target.armLX = 0;
        target.armRX = 0;
        target.hipsY = 0.92 + Math.abs(Math.sin(e)) * 0.12 - 0.06;
        target.legLX = Math.sin(e) * 0.4;
        target.legRX = -Math.sin(e) * 0.4;
        target.torsoX = Math.sin(e * 0.5) * 0.15;
        this.torso.rotation.y = Math.sin(e * 0.5) * 0.5;
      } else {
        this.emoteT = 0;
        this.torso.rotation.y *= 0.8;
      }
    }
    const sm = (obj, prop, v) => (obj[prop] += (v - obj[prop]) * k);
    sm(this.body.rotation, 'x', target.bodyX);
    sm(this.hips.position, 'y', target.hipsY);
    sm(this.torso.rotation, 'x', target.torsoX);
    sm(this.head.rotation, 'x', target.headX);
    sm(this.armL.rotation, 'x', target.armLX);
    sm(this.armL.rotation, 'z', target.armLZ);
    sm(this.armL.rotation, 'y', target.armLY);
    sm(this.armR.rotation, 'x', target.armRX);
    sm(this.armR.rotation, 'z', target.armRZ);
    sm(this.armR.rotation, 'y', target.armRY);
    sm(this.legL.rotation, 'x', target.legLX);
    sm(this.legR.rotation, 'x', target.legRX);
    sm(this.legL.rotation, 'z', target.legLZ);
    sm(this.legR.rotation, 'z', target.legRZ);
    this.swing = Math.max(0, this.swing - dt * 3.2);
    this.recoil = Math.max(0, this.recoil - dt * 8);
    if (this.glider.visible) this.glider.rotation.z = Math.sin(performance.now() / 600) * 0.05;
  }

  // World position of the gun muzzle (approximate) for tracers.
  muzzle(out) {
    this.hand.updateWorldMatrix(true, false);
    out.set(0, 0.03, -0.7);
    return this.hand.localToWorld(out);
  }
}
