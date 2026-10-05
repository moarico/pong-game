import * as THREE from 'three';
import { WEAPONS, HEALS, RARITY, RARITY_DAMAGE_STEP, RARITY_ODDS, WEAPON_SPAWN_WEIGHTS, AMMO_PICKUP, AMMO_NAMES } from './config.js';
import { weaponGeo, pickaxeGeo, healGeo, gunMaterial, cachedGeo } from './zh/guns.js';
import { Bx, Cyl } from './zh/parts.js';
import { itemIcons } from './zh/icons.js';
import { clamp } from './util.js';

let uid = 1;

export function makeWeapon(type, rarity) {
  const def = WEAPONS[type];
  rarity = clamp(rarity, def.rarities[0], def.rarities[1]);
  return { kind: 'weapon', type, rarity, ammo: def.mag, uid: uid++ };
}

export function makeHeal(type, count) {
  const def = HEALS[type];
  return { kind: 'heal', type, count: count ?? def.spawn, rarity: def.rarity, uid: uid++ };
}

export function makeAmmo(type, count) {
  return { kind: 'ammo', type, count: count ?? AMMO_PICKUP[type], rarity: 0, uid: uid++ };
}

export function makeMat(type, count) {
  return { kind: 'mat', type, count, rarity: 0, uid: uid++ };
}

export function itemName(item) {
  if (!item) return '';
  if (item.kind === 'weapon') return `${RARITY[item.rarity].name} ${WEAPONS[item.type].name}`;
  if (item.kind === 'heal') return HEALS[item.type].name + (item.count > 1 ? ` x${item.count}` : '');
  if (item.kind === 'ammo') return `${AMMO_NAMES[item.type]} Ammo x${item.count}`;
  if (item.kind === 'mat') return `${item.type[0].toUpperCase() + item.type.slice(1)} x${item.count}`;
  return '?';
}

export function rarityColor(item) {
  return RARITY[item?.rarity ?? 0].color;
}

export function weaponDamage(item) {
  return WEAPONS[item.type].damage * (1 + RARITY_DAMAGE_STEP * item.rarity);
}

export function headDamage(item) {
  const def = WEAPONS[item.type];
  const mul = 1 + RARITY_DAMAGE_STEP * item.rarity;
  if (def.headDamage) return def.headDamage * mul;
  return def.damage * (def.headMul || 1) * mul;
}

export function randomRarity(rng, quality) {
  return rng.weighted(RARITY_ODDS[quality]);
}

export function randomWeapon(rng, quality) {
  const types = Object.keys(WEAPON_SPAWN_WEIGHTS);
  let rarity = randomRarity(rng, quality);
  for (let tries = 0; tries < 20; tries++) {
    const type = types[rng.weighted(types.map((t) => WEAPON_SPAWN_WEIGHTS[t]))];
    const [lo, hi] = WEAPONS[type].rarities;
    if (rarity >= lo && rarity <= hi) return makeWeapon(type, rarity);
    if (tries > 10) return makeWeapon(type, clamp(rarity, lo, hi));
  }
  return makeWeapon('ar', rarity);
}

export function randomHeal(rng) {
  const types = ['bandage', 'medkit', 'mini', 'big'];
  return makeHeal(types[rng.weighted([35, 15, 32, 18])]);
}

// ---------- 3D models ----------
// Guns, the harvesting tool and consumables are Zero Hour-style part models (see zh/guns.js).

const matCache = new Map();

function lambert(key, opts) {
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...opts }));
  return matCache.get(key);
}

export function vertexMaterial() {
  return lambert('vertex', { vertexColors: true });
}

export function weaponModel(type, rarity = 0) {
  const m = new THREE.Mesh(weaponGeo(type, rarity), gunMaterial());
  m.castShadow = true;
  return m;
}

export function pickaxeModel(accent = '#ffcc33') {
  const m = new THREE.Mesh(pickaxeGeo(new THREE.Color(accent).getHex()), gunMaterial());
  m.castShadow = true;
  return m;
}

export function healModel(type) {
  const m = new THREE.Mesh(healGeo(type), gunMaterial());
  m.castShadow = true;
  return m;
}

// Ammo: a small olive can with a colored band and a row of rounds standing in an open tray on top.
function ammoGeometry(type) {
  return cachedGeo('ammo-' + type, () => {
    const band = { light: 0x7f97b5, medium: 0x5d9a5a, heavy: 0x4a4f57, shells: 0xc64a3a, rockets: 0x6e7a48 }[type];
    const P = [Bx(0.34, 0.16, 0.2, 0, 0.08, 0, 0x4a4d3a), Bx(0.345, 0.04, 0.205, 0, 0.1, 0, band), Bx(0.34, 0.02, 0.2, 0, 0.17, 0, 0x3a3c30), Bx(0.12, 0.02, 0.03, 0, 0.19, 0, 0x2b2b2b)];
    const tip = type === 'shells' ? 0xc64a3a : 0xb89a4a;
    const n = type === 'rockets' ? 2 : type === 'heavy' ? 3 : 5;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * (type === 'rockets' ? 0.14 : 0.06);
      if (type === 'rockets') P.push(Cyl(0.035, 0.18, x, 0.27, 0.05, 0x6e7a48, 'y'), Cyl(0.02, 0.06, x, 0.39, 0.05, 0x3a3c30, 'y', 0.001));
      else if (type === 'shells') P.push(Cyl(0.022, 0.07, x, 0.215, 0.05, tip, 'y'), Cyl(0.023, 0.02, x, 0.19, 0.05, 0xb89a4a, 'y'));
      else P.push(Cyl(0.012, 0.06, x, 0.21, 0.05, 0xb89a4a, 'y'), Cyl(0.012, 0.03, x, 0.25, 0.05, type === 'heavy' ? 0x3a3a3a : 0xc8a050, 'y', 0.002));
    }
    return P;
  });
}

// Materials: a stack of planks, a pile of cut stone, or a stack of steel sheets.
function matGeometry(type) {
  return cachedGeo('mat-' + type, () => {
    const P = [];
    if (type === 'wood') {
      for (let l = 0; l < 3; l++) for (let i = 0; i < 3 - (l === 2 ? 1 : 0); i++) {
        const w = l % 2 ? 0.48 : 0.1, d = l % 2 ? 0.1 : 0.48;
        const off = (i - 1) * 0.12 + (l === 2 ? 0.06 : 0);
        P.push(Bx(w, 0.06, d, l % 2 ? 0 : off, 0.03 + l * 0.062, l % 2 ? off : 0, [0xb07c4a, 0x9a6a3c, 0xc08a52][(i + l) % 3]));
      }
    } else if (type === 'stone') {
      const bricks = [[-0.12, 0, -0.06], [0.12, 0, -0.06], [0, 0, 0.1], [-0.06, 1, 0.0], [0.08, 1, 0.02]];
      bricks.forEach(([x, l, z], i) => P.push(Bx(0.2, 0.11, 0.14, x, 0.055 + l * 0.11, z, [0x9a9a96, 0x8a8a86, 0xa8a6a0][i % 3], 0, i * 0.4, 0)));
    } else {
      for (let l = 0; l < 4; l++) P.push(Bx(0.46, 0.025, 0.3, (l % 2) * 0.02, 0.013 + l * 0.027, (l % 2) * -0.015, l % 2 ? 0xb9c3cc : 0x8a8e92, 0, l * 0.06, 0));
      P.push(Bx(0.06, 0.03, 0.32, -0.2, 0.12, 0, 0x6a6c70), Bx(0.06, 0.03, 0.32, 0.2, 0.12, 0, 0x6a6c70));
    }
    return P;
  });
}

export function itemModel(item) {
  let mesh;
  if (item.kind === 'weapon') {
    mesh = weaponModel(item.type, item.rarity);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.y = 0.12;
    const g = new THREE.Group();
    g.add(mesh);
    g.scale.setScalar(1.7);
    return g;
  }
  if (item.kind === 'heal') {
    mesh = healModel(item.type);
    mesh.position.y = 0.1;
    const g = new THREE.Group();
    g.add(mesh);
    g.scale.setScalar(2.2);
    return g;
  }
  else if (item.kind === 'ammo') mesh = new THREE.Mesh(ammoGeometry(item.type), gunMaterial());
  else mesh = new THREE.Mesh(matGeometry(item.type), gunMaterial());
  const g = new THREE.Group();
  g.add(mesh);
  g.scale.setScalar(1.6);
  return g;
}

// Rendered picture of an item for the hotbar and inventory (null for ammo and materials).
export function iconUrl(item) {
  if (!item) return null;
  const icons = itemIcons();
  if (item.kind === 'weapon') return icons[item.type + ':' + (item.rarity | 0)] || icons[item.type] || null;
  if (item.kind === 'heal') return icons[item.type] || null;
  return null;
}

export function iconFor(item) {
  if (!item) return '';
  if (item.kind === 'weapon') return WEAPONS[item.type].short;
  if (item.kind === 'heal') return HEALS[item.type].short;
  return '';
}
