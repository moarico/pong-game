// Hotbar and inventory icons, rendered once from the same gun, tool and consumable models the game uses.
import * as THREE from 'three';
import { weaponGeo, pickaxeGeo, healGeo, gunMaterial } from './guns.js';
import { skyEnvironment } from './envmap.js';

let ICONS = null;

export function itemIcons() {
  if (ICONS) return ICONS;
  ICONS = {};
  let renderer;
  try {
    const canvas = document.createElement('canvas');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  } catch {
    return ICONS;
  }
  renderer.setSize(256, 128, false);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.environment = skyEnvironment(renderer, { top: 0x9ab8d8, horizon: 0xf2f4f6, ground: 0x6a6660, sun: 6 });
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 4, 1);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe0ff, 1.4);
  rim.position.set(-2, 1, -3);
  scene.add(rim);
  const cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.25, -0.25, 0.01, 20);
  const mat = gunMaterial();
  const shoot = (geo, name, rot, pad = 1.12) => {
    const m = new THREE.Mesh(geo, mat);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    scene.add(m);
    const bb = new THREE.Box3().setFromObject(m);
    const c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
    // camera on +X looking back at the model: the barrel (-Z) points right
    const w = Math.max(s.z, 0.001) * pad, h = s.y * pad;
    const half = Math.max(w / 2, h);
    cam.left = -half;
    cam.right = half;
    cam.top = half / 2;
    cam.bottom = -half / 2;
    cam.position.set(c.x + 5, c.y + 0.4, c.z + 0.25);
    cam.lookAt(c);
    cam.updateProjectionMatrix();
    renderer.render(scene, cam);
    ICONS[name] = renderer.domElement.toDataURL('image/png');
    scene.remove(m);
  };
  for (const t of ['ar', 'smg', 'shotgun', 'pistol', 'sniper', 'rocket', 'lmg']) {
    shoot(weaponGeo(t), t);
    for (let r = 1; r <= 4; r++) shoot(weaponGeo(t, r), t + ':' + r);
  }
  for (const h of ['bandage', 'medkit', 'mini', 'big']) shoot(healGeo(h), h, [0, -0.5, 0], 1.6);
  shoot(pickaxeGeo(0xffcc33), 'pickaxe', [-0.9, 0, 0], 1.15);
  renderer.dispose();
  return ICONS;
}
