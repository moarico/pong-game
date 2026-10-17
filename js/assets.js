// Loads the art made by real artists before the game starts: the animated character, its outfit
// textures, and (as they are added) vehicles, nature and city props. Everything here is CC0; see CREDITS.md.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KIT_FILES } from './kit.js';

const loader = new GLTFLoader();

export const ASSETS = {
  character: null, // { scene, animations } — one body and skeleton shared by every outfit
  skins: {}, // outfit id -> THREE.Texture
  models: {}, // name -> loaded glTF scene (props, vehicles, nature)
};

const SKIN_FILES = ['male', 'skater-male', 'skater-female', 'survivor-male', 'survivor-female', 'zombie-1', 'zombie-2', 'cyborg-female'];

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

// Repaint parts of a skin, keeping the painted shading and dirt: `shirt` and `pants` recolor the clothes
// (shirt fills the lower-left quarter, pants the lower-right band), `skin` recolors the skin tone everywhere.
function recolor(img, tint) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  const W = c.width, H = c.height, d = x.getImageData(0, 0, W, H), p = d.data;
  const col = (css) => (css ? { r: parseInt(css.slice(1, 3), 16) / 255, g: parseInt(css.slice(3, 5), 16) / 255, b: parseInt(css.slice(5, 7), 16) / 255 } : null);
  const shirt = col(tint.shirt), pants = col(tint.pants), skin = col(tint.skin);
  // the face sits at (0.3, 0.4) of the texture: its color is this skin's tone
  const f = (Math.floor(H * 0.39) * W + Math.floor(W * 0.29)) * 4, fr = p[f], fg = p[f + 1], fb = p[f + 2];
  const fl = 0.3 * fr + 0.59 * fg + 0.11 * fb;
  const isSkin = (r, g, b) => Math.abs(r - fr) + Math.abs(g - fg) + Math.abs(b - fb) < 70;
  const paint = (o, c, l) => {
    p[o] = Math.min(255, c.r * 255 * l);
    p[o + 1] = Math.min(255, c.g * 255 * l);
    p[o + 2] = Math.min(255, c.b * 255 * l);
  };
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const o = (j * W + i) * 4, r = p[o], g = p[o + 1], b = p[o + 2], lum = 0.3 * r + 0.59 * g + 0.11 * b;
      if (isSkin(r, g, b)) {
        if (skin) paint(o, skin, Math.min(1.2, lum / fl));
        continue;
      }
      if (j < H / 2) continue;
      const inShirt = i < W * 0.625, inPants = !inShirt && j > H * 0.75;
      const cc = inShirt ? shirt : inPants ? pants : null;
      if (cc) paint(o, cc, Math.min(1.15, lum / 255 + 0.12));
    }
  }
  x.putImageData(d, 0, 0);
  return c;
}

function skinTexture(src) {
  const t = src.getContext ? new THREE.CanvasTexture(src) : new THREE.Texture(src);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false; // glTF UV convention
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

export async function loadAssets(outfits, onProgress = () => {}) {
  let done = 0;
  const MODEL_FILES = KIT_FILES; // read here, not at module load: kit.js and this module import each other
  const total = 1 + SKIN_FILES.length + MODEL_FILES.length;
  const tick = () => onProgress(++done / total);
  const [character, images] = await Promise.all([
    loader.loadAsync('assets/characters/character.glb').then((g) => (tick(), g)),
    Promise.all(SKIN_FILES.map((n) => loadImage(`assets/characters/skins/${n}.png`).then((img) => (tick(), [n, img])))),
    Promise.all(MODEL_FILES.map((n) => loader.loadAsync(`assets/models/${n}.glb`).then((g) => (tick(), (ASSETS.models[n] = g.scene))))),
  ]);
  ASSETS.character = character;
  const byName = Object.fromEntries(images);
  for (const o of outfits) {
    const img = byName[o.tex] || byName.male;
    ASSETS.skins[o.id] = skinTexture(o.tint ? recolor(img, o.tint) : img);
  }
}
