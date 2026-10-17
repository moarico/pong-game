// Artist-made models (CC0, see CREDITS.md) baked for the world: every mesh of a model is merged into one
// geometry with per-vertex color and per-vertex [metalness, roughness], so a whole car or street lamp draws
// with one material and can be instanced or merged into a town's geometry.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ASSETS } from './assets.js';
import { mrMaterial } from './zh/parts.js';

// Real-world scale for each model family (the kits are built at toy scale).
export const KIT_SCALE = { car: 1.55, city: 5 };

// Kenney's cars, with how often each turns up parked around the island.
export const CARS = [
  ['sedan', 6], ['suv', 5], ['suv-luxury', 3], ['hatchback', 5], ['taxi', 2], ['police-car', 2], ['van', 3],
  ['truck', 4], ['truck-flat', 2], ['delivery-truck', 2], ['ambulance', 1], ['garbage-truck', 1], ['sports-sedan', 2], ['firetruck', 1],
];
export const CITY_PROPS = ['streetlight', 'firehydrant', 'dumpster', 'bench', 'box_A', 'box_B'];
export const KIT_FILES = [...CARS.map(([n]) => 'car-' + n), ...CITY_PROPS.map((n) => 'city-' + n)];

// What each material is made of, by name: [metalness, roughness].
function surface(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('window') || n.includes('glass')) return [0.2, 0.06];
  if (n.includes('tire') || n.includes('rubber')) return [0, 0.92];
  if (n.includes('light')) return [0, 0.15];
  if (n.includes('paint') || n.includes('car')) return [0.35, 0.32];
  if (n.includes('metal') || n.includes('chrome') || n.includes('grill')) return [0.8, 0.3];
  if (n.includes('plastic')) return [0, 0.55];
  return [0.05, 0.6];
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const IMG = new Map();
function texSampler(tex) {
  if (!tex || !tex.image) return null;
  if (IMG.has(tex)) return IMG.get(tex);
  const im = tex.image, c = document.createElement('canvas');
  c.width = im.width;
  c.height = im.height;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
  const f = (u, v) => {
    u -= Math.floor(u);
    v -= Math.floor(v);
    const o = (Math.min(H - 1, Math.floor(v * H)) * W + Math.min(W - 1, Math.floor(u * W))) * 4;
    return [toLinear(d[o] / 255), toLinear(d[o + 1] / 255), toLinear(d[o + 2] / 255)];
  };
  IMG.set(tex, f);
  return f;
}

// Bake one mesh into position/normal/color/aMR, in model space.
// Quantized files store attributes as normalized integers; expand them to floats before transforming.
function floatAttr(a) {
  if (!a || a.array instanceof Float32Array) return a;
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  return new THREE.BufferAttribute(out, a.itemSize);
}
function bakeMesh(mesh, matrix) {
  const src = mesh.geometry, f = new THREE.BufferGeometry();
  for (const n of ['position', 'normal', 'uv', 'color']) if (src.getAttribute(n)) f.setAttribute(n, floatAttr(src.getAttribute(n)));
  if (src.index) f.setIndex(src.index);
  const g = f.index ? f.toNonIndexed() : f;
  g.applyMatrix4(matrix);
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const n = g.getAttribute('position').count;
  const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const base = mat.color || new THREE.Color(1, 1, 1);
  const sample = texSampler(mat.map), uv = g.getAttribute('uv'), vc = g.getAttribute('color');
  const col = new Float32Array(n * 3), mr = new Float32Array(n * 2), [m, r] = surface(mat.name);
  for (let i = 0; i < n; i++) {
    let c = [1, 1, 1];
    if (sample && uv) c = sample(uv.getX(i), uv.getY(i));
    if (vc) c = [c[0] * vc.getX(i), c[1] * vc.getY(i), c[2] * vc.getZ(i)];
    col[i * 3] = c[0] * base.r;
    col[i * 3 + 1] = c[1] * base.g;
    col[i * 3 + 2] = c[2] * base.b;
    mr[i * 2] = m;
    mr[i * 2 + 1] = r;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', g.getAttribute('position').clone());
  out.setAttribute('normal', g.getAttribute('normal').clone());
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setAttribute('aMR', new THREE.BufferAttribute(mr, 2));
  return out;
}

const BAKED = new Map();
const pathOf = (o) => {
  const names = [];
  for (let p = o; p; p = p.parent) if (p.name) names.push(p.name);
  return names.join('/');
};
// opts.part(path) keeps meshes whose node path (mesh and ancestor names) passes; opts.mat(name) filters
// by material name. The result is scaled to real size and, unless keepOrigin, centered on x/z standing
// on y = 0; with center it is centered on all three axes (wheels spin about their own middle).
export function bakeModel(file, opts = {}) {
  const key = file + '|' + (opts.tag || '') + '|' + (opts.scale ?? '') + (opts.keepOrigin ? 'o' : '') + (opts.center ? 'c' : '');
  if (BAKED.has(key)) return BAKED.get(key);
  const scene = ASSETS.models[file];
  if (!scene) throw new Error('model not loaded: ' + file);
  const scale = opts.scale ?? KIT_SCALE[file.split('-')[0]] ?? 1;
  scene.updateMatrixWorld(true);
  const parts = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (opts.part && !opts.part(pathOf(o))) return;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (opts.mat && !opts.mat(m.name || '')) return;
    parts.push(bakeMesh(o, o.matrixWorld));
  });
  if (!parts.length) return null;
  const g = mergeGeometries(parts);
  g.scale(scale, scale, scale);
  g.computeBoundingBox();
  const b = g.boundingBox;
  if (opts.center) g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -(b.min.z + b.max.z) / 2);
  else if (!opts.keepOrigin) g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  BAKED.set(key, g);
  return g;
}

// Where a model's named parts sit (e.g. a car's wheel hubs), in the same scaled space as bakeModel(keepOrigin).
export function partCenters(file, test, scale = KIT_SCALE[file.split('-')[0]] ?? 1) {
  const scene = ASSETS.models[file], out = [];
  scene.updateMatrixWorld(true);
  const seen = new Set();
  scene.traverse((o) => {
    if (!o.isMesh || !test(pathOf(o))) return;
    // a part split by material is a group of meshes: measure the whole node
    const top = o.parent && o.parent.isGroup && o.parent.name && test(o.parent.name) ? o.parent : o;
    if (seen.has(top)) return;
    seen.add(top);
    const box = new THREE.Box3().setFromObject(top);
    out.push({ name: top.name, c: box.getCenter(new THREE.Vector3()).multiplyScalar(scale), size: box.getSize(new THREE.Vector3()).multiplyScalar(scale) });
  });
  return out;
}

let MAT = null;
export function kitMaterial() {
  if (!MAT) MAT = mrMaterial({ roughness: 0.6, metalness: 0.1, envMapIntensity: 1 });
  return MAT;
}

// Append a baked model to a GeoBuilder (towns merge their street furniture into one mesh).
const _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _n = new THREE.Matrix3();
export function addToBuilder(gb, geo, x, y, z, yaw = 0, s = 1) {
  _m.makeRotationY(yaw).scale(_v.set(s, s, s)).setPosition(x, y, z);
  _n.getNormalMatrix(_m);
  const P = geo.getAttribute('position'), N = geo.getAttribute('normal'), C = geo.getAttribute('color');
  for (let i = 0; i < P.count; i++) {
    _v.fromBufferAttribute(P, i).applyMatrix4(_m);
    gb.pos.push(_v.x, _v.y, _v.z);
    _v.fromBufferAttribute(N, i).applyMatrix3(_n).normalize();
    gb.nor.push(_v.x, _v.y, _v.z);
    gb.col.push(C.getX(i), C.getY(i), C.getZ(i));
    gb.surf.push(8); // SURF.plain
  }
}
