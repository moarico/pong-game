import * as THREE from 'three';
import { WEAPONS, HEALS, RARITY, RARITY_DAMAGE_STEP, RARITY_ODDS, WEAPON_SPAWN_WEIGHTS, AMMO_PICKUP, AMMO_NAMES } from './config.js';
import { GeoBuilder } from './world/geobuilder.js';
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

const geoCache = new Map();
const matCache = new Map();

function lambert(key, opts) {
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshLambertMaterial(opts));
  return matCache.get(key);
}

export function vertexMaterial() {
  return lambert('vertex', { vertexColors: true });
}

// Weapon geometry points along -Z; grip near the origin.
function weaponGeometry(type, rarity) {
  const key = `w-${type}-${rarity}`;
  if (geoCache.has(key)) return geoCache.get(key);
  const gb = new GeoBuilder();
  gb.jitter = 0;
  const body = '#3a3d42', dark = '#24262a', acc = RARITY[rarity].color, wood = '#8a5a35';
  switch (type) {
    case 'ar':
      gb.box(-0.05, -0.04, -0.45, 0.05, 0.08, 0.12, body);
      gb.box(-0.045, -0.02, 0.12, 0.045, 0.06, 0.38, dark);
      gb.box(-0.03, -0.18, -0.2, 0.03, -0.04, -0.1, dark);
      gb.box(-0.03, -0.14, 0.0, 0.03, -0.04, 0.06, dark);
      gb.box(-0.02, 0.0, -0.78, 0.02, 0.04, -0.45, dark);
      gb.box(-0.051, 0.0, -0.4, 0.051, 0.03, -0.05, acc);
      gb.box(-0.02, 0.08, -0.15, 0.02, 0.13, 0.0, dark);
      break;
    case 'shotgun':
      gb.box(-0.045, -0.03, -0.3, 0.045, 0.07, 0.1, body);
      gb.box(-0.03, 0.0, -0.85, 0.03, 0.06, -0.3, dark);
      gb.box(-0.045, -0.06, -0.7, 0.045, 0.0, -0.4, wood);
      gb.box(-0.04, -0.06, 0.1, 0.04, 0.05, 0.4, wood);
      gb.box(-0.046, 0.02, -0.25, 0.046, 0.05, 0.0, acc);
      gb.box(-0.025, -0.14, 0.0, 0.025, -0.03, 0.06, dark);
      break;
    case 'smg':
      gb.box(-0.045, -0.03, -0.3, 0.045, 0.08, 0.1, body);
      gb.box(-0.02, 0.0, -0.45, 0.02, 0.04, -0.3, dark);
      gb.box(-0.025, -0.25, -0.2, 0.025, -0.03, -0.13, dark);
      gb.box(-0.025, -0.14, 0.0, 0.025, -0.03, 0.06, dark);
      gb.box(-0.046, 0.03, -0.25, 0.046, 0.06, 0.05, acc);
      gb.box(-0.02, -0.02, 0.1, 0.02, 0.04, 0.25, dark);
      break;
    case 'pistol':
      gb.box(-0.035, -0.0, -0.22, 0.035, 0.08, 0.05, body);
      gb.box(-0.03, -0.16, -0.02, 0.03, 0.0, 0.05, dark);
      gb.box(-0.036, 0.05, -0.2, 0.036, 0.07, -0.02, acc);
      break;
    case 'sniper':
      gb.box(-0.045, -0.04, -0.4, 0.045, 0.07, 0.12, body);
      gb.box(-0.02, 0.0, -1.15, 0.02, 0.04, -0.4, dark);
      gb.box(-0.045, -0.06, 0.12, 0.045, 0.05, 0.45, wood);
      gb.cylinder(0, 0.1, -0.15, 0.045, 0.045, 0.06, 8, dark);
      gb.boxRot(0, 0.12, -0.15, 0.09, 0.09, 0.42, 0, dark);
      gb.box(-0.046, 0.0, -0.38, 0.046, 0.03, -0.1, acc);
      gb.box(-0.025, -0.15, 0.0, 0.025, -0.03, 0.06, dark);
      break;
    case 'rocket':
      gb.boxRot(0, -0.08, -0.25, 0.2, 0.2, 1.1, 0, '#55663f');
      gb.box(-0.11, -0.1, -0.82, 0.11, 0.14, -0.72, acc);
      gb.box(-0.11, -0.1, 0.2, 0.11, 0.14, 0.32, acc);
      gb.box(-0.025, -0.24, -0.05, 0.025, -0.08, 0.03, dark);
      gb.box(-0.06, 0.12, -0.3, -0.02, 0.2, -0.1, dark);
      break;
  }
  const g = gb.build();
  geoCache.set(key, g);
  return g;
}

export function weaponModel(type, rarity) {
  const m = new THREE.Mesh(weaponGeometry(type, rarity), vertexMaterial());
  m.castShadow = true;
  return m;
}

export function pickaxeModel(accent = '#ffcc33') {
  const key = 'pick-' + accent;
  if (!geoCache.has(key)) {
    const gb = new GeoBuilder();
    gb.jitter = 0;
    gb.box(-0.025, -0.25, -0.025, 0.025, 0.55, 0.025, '#6b4a2f');
    gb.box(-0.03, 0.42, -0.24, 0.03, 0.52, 0.24, '#9aa3ad');
    gb.box(-0.02, 0.43, -0.3, 0.02, 0.5, -0.24, accent);
    gb.box(-0.035, 0.4, -0.05, 0.035, 0.54, 0.05, accent);
    geoCache.set(key, gb.build());
  }
  const m = new THREE.Mesh(geoCache.get(key), vertexMaterial());
  m.castShadow = true;
  return m;
}

function healGeometry(type) {
  const key = 'h-' + type;
  if (geoCache.has(key)) return geoCache.get(key);
  const gb = new GeoBuilder();
  gb.jitter = 0;
  if (type === 'bandage') {
    gb.cylinder(0, 0, 0, 0.09, 0.09, 0.12, 8, '#f2efe8');
    gb.cylinder(0.12, 0, 0.04, 0.08, 0.08, 0.1, 8, '#e8e2d6');
  } else if (type === 'medkit') {
    gb.box(-0.2, 0, -0.13, 0.2, 0.2, 0.13, '#e2463f');
    gb.box(-0.03, 0.2, -0.09, 0.03, 0.21, 0.09, '#ffffff');
    gb.box(-0.09, 0.2, -0.03, 0.09, 0.21, 0.03, '#ffffff');
    gb.box(-0.06, 0.2, -0.02, 0.06, 0.26, 0.02, '#333');
  } else if (type === 'mini') {
    gb.sphere(0, 0.1, 0, 0.1, 8, 6, '#47a6ff');
    gb.cylinder(0, 0.18, 0, 0.03, 0.03, 0.08, 6, '#dfefff');
  } else {
    gb.cylinder(0, 0, 0, 0.13, 0.13, 0.32, 10, '#2f6dff');
    gb.cylinder(0, 0.32, 0, 0.13, 0.05, 0.06, 10, '#7fb0ff');
    gb.cylinder(0, 0.38, 0, 0.05, 0.05, 0.05, 6, '#dfefff');
  }
  const g = gb.build();
  geoCache.set(key, g);
  return g;
}

export function healModel(type) {
  return new THREE.Mesh(healGeometry(type), vertexMaterial());
}

const AMMO_COLORS = { light: '#7f97b5', medium: '#5d9a5a', heavy: '#4a4f57', shells: '#c64a3a', rockets: '#6e7a48' };
const MAT_COLORS = { wood: '#b07c4a', stone: '#9a9a96', metal: '#b9c3cc' };

function smallBoxGeometry(key, color, w, h, d, stripe) {
  if (geoCache.has(key)) return geoCache.get(key);
  const gb = new GeoBuilder();
  gb.jitter = 0;
  gb.box(-w / 2, 0, -d / 2, w / 2, h, d / 2, color);
  if (stripe) gb.box(-w / 2 - 0.005, h * 0.4, -d / 2 - 0.005, w / 2 + 0.005, h * 0.6, d / 2 + 0.005, stripe);
  const g = gb.build();
  geoCache.set(key, g);
  return g;
}

export function itemModel(item) {
  let mesh;
  if (item.kind === 'weapon') {
    mesh = weaponModel(item.type, item.rarity);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.y = 0.15;
    const g = new THREE.Group();
    g.add(mesh);
    g.scale.setScalar(1.4);
    return g;
  }
  if (item.kind === 'heal') mesh = healModel(item.type);
  else if (item.kind === 'ammo') mesh = new THREE.Mesh(smallBoxGeometry('a-' + item.type, AMMO_COLORS[item.type], 0.34, 0.2, 0.22, '#e8d36a'), vertexMaterial());
  else mesh = new THREE.Mesh(smallBoxGeometry('m-' + item.type, MAT_COLORS[item.type], 0.5, 0.25, 0.3, null), vertexMaterial());
  const g = new THREE.Group();
  g.add(mesh);
  g.scale.setScalar(1.6);
  return g;
}

export function iconFor(item) {
  if (!item) return '';
  if (item.kind === 'weapon') return WEAPONS[item.type].short;
  if (item.kind === 'heal') return HEALS[item.type].short;
  return '';
}
