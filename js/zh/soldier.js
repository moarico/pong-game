// Soldiers ported from Zero Hour: printed camo fabric over a body of rounded parts, with a plate
// carrier, pouches, headgear and per-soldier variety. Stormdrop outfits pick the camo, gear colors,
// headgear and glider. The rig and the walk cycle are Zero Hour's; skydiving, gliding, swimming,
// driving, harvesting, healing and dancing poses are added for the battle royale.
import * as THREE from 'three';
import { partGeo2, Bx, Sp, Dm, TL, CYL, CYL8, mulC, cnv, damp, TAU } from './parts.js';
import { weaponGeo, pickaxeGeo, healGeo, gunMaterial, gunDefs, ZH_ID } from './guns.js';
import { zhTextures } from './textures.js';
import { gliderModel } from './models.js';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const SKINS = [0xc9a07e, 0xb58a66, 0x96694a, 0x6e4c36, 0xd8b392], HAIRS = [0x2a1e16, 0x3e2a1c, 0x1a1612, 0x5a4030];
const css = (c) => '#' + c.toString(16).padStart(6, '0');
const rgbCss = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;

// Gear palettes. Zero Hour's two teams, plus new ones for the other outfits.
const TAN = { carrier: 0x8c7858, pouch: 0x7d6a4c, belt: 0x5a4c38, cap: 0x6b6448, beanie: 0x4a4a3e, glove: 0x6a5840, boot: 0x6e5a40, knee: 0x5e5040, headset: 0x3a3a36, mark: 0x3b8fd8, pack: 0x7a6a4c, helm: 0xffffff, shem: 0x8a7a5a, bala: 0x1e1f1d };
const BLACK = { carrier: 0x252624, pouch: 0x2e2f2c, belt: 0x1e1e1c, cap: 0x2a2b29, beanie: 0x2a2a28, glove: 0x171717, boot: 0x1b1b1b, knee: 0x232323, headset: 0x2a2a2a, mark: 0xc8382c, pack: 0x30322e, helm: 0x272927, shem: 0x8e3a30, bala: 0x1e1f1d };
const gear = (base, over) => ({ ...base, ...over });

export const OUTFITS = [
  { id: 'recruit', name: 'Recruit', rarity: 0, desc: 'Standard issue. Fresh off the Sky Coach and ready to loot.', head: 'helmet', pack: false, camo: [[150, 136, 104], [118, 112, 80], [112, 92, 68], [166, 154, 120]], seed: 1234, gear: TAN, glider: 'delta', face: { skin: 1, hair: 0 } },
  { id: 'militia', name: 'Irregular', rarity: 0, desc: 'Dark kit, no insignia, no questions.', head: 'bala', pack: false, camo: [[70, 72, 67], [56, 58, 54], [84, 86, 80], [44, 45, 42]], seed: 777, gear: BLACK, glider: 'para', face: { skin: 2, hair: 2 } },
  { id: 'woodland', name: 'Woodland Scout', rarity: 1, desc: 'Knows every tree line on the island.', head: 'cap', pack: true, camo: [[86, 98, 62], [60, 74, 46], [104, 86, 58], [40, 44, 34]], seed: 2201, gear: gear(TAN, { carrier: 0x55603e, pouch: 0x4c5638, belt: 0x3a3a2a, cap: 0x56603e, glove: 0x4a4434, boot: 0x4a3c2c, knee: 0x46503a, pack: 0x55603e, mark: 0xe0c060 }), glider: 'para', face: { skin: 0, hair: 1, beard: true } },
  { id: 'nomad', name: 'Dune Nomad', rarity: 1, desc: 'The desert wind carries no secrets.', head: 'shemagh', pack: true, camo: [[196, 170, 124], [170, 142, 100], [214, 194, 150], [146, 118, 82]], seed: 3307, gear: gear(TAN, { carrier: 0xa08a64, pouch: 0x8e7856, belt: 0x6a5840, shem: 0xc8b48a, pack: 0x9a845e, mark: 0xc0392b }), glider: 'para', face: { skin: 3, hair: 2, beard: true } },
  { id: 'arctic', name: 'Frost Warden', rarity: 2, desc: 'Guardian of the northern peaks.', head: 'beanie', pack: true, camo: [[226, 230, 234], [196, 204, 212], [168, 178, 190], [238, 240, 242]], seed: 4409, gear: gear(TAN, { carrier: 0xd8dce0, pouch: 0xc4cad0, belt: 0x8a9098, beanie: 0x4f86b8, glove: 0x3a3e44, boot: 0x4a4e54, knee: 0xb0b6bc, pack: 0xd0d4d8, headset: 0x4a4e54, mark: 0x7fd0ff }), glider: 'delta', face: { skin: 4, hair: 3 } },
  { id: 'urban', name: 'Urban Breacher', rarity: 2, desc: 'First through the door, every time.', head: 'helmetB', pack: false, camo: [[112, 118, 126], [88, 94, 102], [138, 144, 150], [64, 68, 74]], seed: 5511, gear: gear(BLACK, { carrier: 0x3a4048, pouch: 0x444a52, helm: 0x3a4048, mark: 0x2e86de }), glider: 'delta', face: { skin: 1, hair: 0, glasses: true } },
  { id: 'nightfall', name: 'Nightfall', rarity: 3, desc: 'Drawn to the storm. Leaves no trace.', head: 'bala', pack: true, camo: [[38, 32, 48], [28, 24, 36], [54, 44, 72], [20, 18, 26]], seed: 6613, gear: gear(BLACK, { carrier: 0x1e1a26, pouch: 0x2a2434, bala: 0x16141c, helm: 0x1e1a26, glove: 0x141218, pack: 0x241e2e, mark: 0xb25cff }), glider: 'moth', face: { skin: 0, hair: 2 } },
  { id: 'viper', name: 'Jungle Viper', rarity: 3, desc: 'Strikes from the river reeds.', head: 'beanie', pack: true, camo: [[64, 90, 44], [40, 58, 30], [98, 112, 58], [28, 34, 22]], seed: 7717, gear: gear(TAN, { carrier: 0x3e4a2c, pouch: 0x4a5634, belt: 0x2a2e20, beanie: 0x2e3a22, glove: 0x2a2e20, boot: 0x2e2a20, knee: 0x3a4430, pack: 0x46502e, mark: 0x4fcf5a }), glider: 'bird', face: { skin: 2, hair: 1, beard: true } },
  { id: 'vanguard', name: 'Crimson Vanguard', rarity: 4, desc: 'Leads every push. Never looks back.', head: 'helmet', pack: true, camo: [[132, 40, 34], [92, 26, 24], [40, 34, 34], [168, 60, 44]], seed: 8819, gear: gear(BLACK, { carrier: 0x2a2222, pouch: 0x3a2a28, mark: 0xffb22e, pack: 0x3a2624 }), glider: 'bird', face: { skin: 1, hair: 3, glasses: true } },
  { id: 'marshal', name: 'Sun Marshal', rarity: 4, desc: 'Forged at high noon. Shines brightest at the end.', head: 'cap', pack: true, camo: [[204, 168, 92], [168, 132, 62], [226, 196, 120], [130, 98, 46]], seed: 9923, gear: gear(TAN, { carrier: 0x6a5430, pouch: 0x7a6236, belt: 0x4a3a20, cap: 0x2a2620, glove: 0x3a2e1e, boot: 0x3a2e1e, pack: 0x6a5430, mark: 0xffd23f, headset: 0x2a2620 }), glider: 'delta', face: { skin: 4, hair: 1 } },
];
for (const o of OUTFITS) {
  // Flat colors for menus, cards and effects.
  o.primary = rgbCss(o.camo[0]);
  o.secondary = rgbCss(o.camo[2]);
  o.accent = css(o.gear.mark);
  o.skin = css(SKINS[o.face.skin]);
}

export function outfitById(id) {
  return OUTFITS.find((o) => o.id === id) || OUTFITS[0];
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Outfit sets the kit; the person wearing it varies by name (bots) or comes from the outfit (you).
function soldierVariant(o, name) {
  if (!name) return { head: o.head, pack: o.pack, beard: !!o.face.beard, skin: o.face.skin, hair: o.face.hair, glasses: !!o.face.glasses, holster: true };
  const h = hashStr(name + '#' + o.id), r = (k, n) => Math.floor((((h >>> (k * 4)) & 15) / 16) * n);
  return { head: o.head, pack: o.pack, beard: r(1, 3) === 0, skin: r(3, 5), hair: r(4, 4), glasses: r(5, 4) === 0 && o.head !== 'bala', holster: r(6, 2) === 0 };
}

// ---------- materials ----------

// Seamless printed camo: periodic noise so it tiles with no visible edges.
function camoTex(cols, seed, scale) {
  const S = 256, c = cnv(S, S), x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const field = () => {
    const w = [];
    for (let k = 0; k < 7; k++) w.push([1 + Math.floor(rnd() * (scale || 5)), Math.floor(rnd() * (scale || 5)) - 2, rnd() * TAU, 0.5 + rnd()]);
    return w;
  };
  const F = [field(), field(), field()];
  const ev = (f, u, v) => {
    let n = 0;
    for (const [a, b, p, amp] of f) n += Math.sin(TAU * (a * u + b * v) + p) * amp;
    return n;
  };
  for (let j = 0; j < S; j++) {
    for (let i = 0; i < S; i++) {
      const u = i / S, v = j / S;
      let k = 0;
      if (ev(F[0], u, v) > -0.1) k = 1;
      if (ev(F[1], u, v) > 0.45) k = 2;
      if (ev(F[2], u, v) > 0.95) k = 3;
      const g = (Math.random() - 0.5) * 8, o = (j * S + i) * 4, cc = cols[k];
      d[o] = clamp(cc[0] + g, 0, 255);
      d[o + 1] = clamp(cc[1] + g, 0, 255);
      d[o + 2] = clamp(cc[2] + g, 0, 255);
      d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const FAB = new Map();
let GEARMAT = null;
export function fabricMat(o) {
  if (!FAB.has(o.id)) FAB.set(o.id, new THREE.MeshStandardMaterial({ map: camoTex(o.camo, o.seed, 4), vertexColors: true, roughness: 0.9, metalness: 0, envMapIntensity: 0.55 }));
  return FAB.get(o.id);
}
function gearMat() {
  if (!GEARMAT) GEARMAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.04, envMapIntensity: 0.55 });
  return GEARMAT;
}

// ---------- geometry ----------

const pair = (fab, gr) => ({ f: partGeo2(fab), g: partGeo2(gr), fl: partGeo2(fab, true), gl: partGeo2(gr, true) });
const SG = new Map();

function soldierGeos(o, v) {
  const G = o.gear, W = 0xffffff, skin = SKINS[v.skin], hair = HAIRS[v.hair];
  const key = [o.id, v.head, v.beard, v.pack, v.skin, v.hair, v.glasses, v.holster].join('.');
  if (SG.has(key)) return SG.get(key);
  // legs
  const thigh = {};
  for (const sx of [-1, 1]) {
    const fab = [Sp(0.12, 0.098, 0.118, 0, -0.02, 0, W), { g: new THREE.CylinderGeometry(0.116, 0.089, 0.42, 14), p: [0, -0.23, 0], c: W }, Bx(0.032, 0.13, 0.11, sx * 0.104, -0.22, 0.005, 0xe0e0e0)];
    const gr = [Bx(0.1, 0.11, 0.034, 0, -0.43, -0.08, G.knee), { g: CYL, s: [0.092, 0.022, 0.092], p: [0, -0.43, 0], c: G.belt }];
    if (sx === 1 && v.holster) gr.push(Bx(0.045, 0.13, 0.075, 0.098, -0.1, 0.01, G.pouch), Bx(0.03, 0.05, 0.035, 0.1, -0.02, 0.02, 0x1a1a1a), Bx(0.05, 0.025, 0.08, 0.098, -0.16, 0.01, G.belt));
    thigh[sx] = pair(fab, gr);
  }
  const shin = pair(
    [Sp(0.088, 0.072, 0.09, 0, 0, 0, W), { g: new THREE.CylinderGeometry(0.09, 0.071, 0.3, 14), p: [0, -0.17, 0], c: W }, Sp(0.07, 0.09, 0.06, 0, -0.1, 0.035, W)],
    [{ g: new THREE.CylinderGeometry(0.075, 0.079, 0.16, 14), p: [0, -0.36, 0], c: G.boot }, Sp(0.08, 0.06, 0.14, 0, -0.408, -0.052, G.boot), Sp(0.064, 0.05, 0.055, 0, -0.416, -0.162, mulC(G.boot, 0.88)),
      Bx(0.142, 0.036, 0.32, 0, -0.446, -0.058, 0x1a1a19), Bx(0.03, 0.012, 0.09, 0, -0.372, -0.066, mulC(G.boot, 0.75))],
  );
  // torso: shirt underneath, plate carrier, pouches, radio, belt kit
  const tf = [Sp(0.176, 0.105, 0.12, 0, 0.03, 0, W), Sp(0.152, 0.13, 0.11, 0, 0.16, 0, W), Sp(0.212, 0.12, 0.125, 0, 0.27, 0, W), Sp(0.228, 0.2, 0.138, 0, 0.36, 0, W), Sp(0.15, 0.07, 0.105, 0, 0.505, 0.012, W), { g: new THREE.CylinderGeometry(0.07, 0.085, 0.06, 14), p: [0, 0.53, 0], c: W }];
  const tg = [{ g: CYL, s: [0.074, 0.075, 0.07], p: [0, 0.575, 0], c: skin },
    Bx(0.34, 0.3, 0.05, 0, 0.35, -0.132, G.carrier), Bx(0.34, 0.31, 0.046, 0, 0.355, 0.132, G.carrier), Sp(0.222, 0.078, 0.148, 0, 0.25, 0, G.carrier), Bx(0.3, 0.022, 0.056, 0, 0.5, -0.132, mulC(G.carrier, 0.85)),
    Bx(0.062, 0.034, 0.3, -0.12, 0.52, 0, G.carrier), Bx(0.062, 0.034, 0.3, 0.12, 0.52, 0, G.carrier),
    Sp(0.175, 0.03, 0.124, 0, 0.07, 0, G.belt), Bx(0.03, 0.04, 0.012, 0, 0.07, -0.125, 0x8a8a80),
    Bx(0.13, 0.055, 0.034, 0, 0.44, -0.166, G.pouch), Bx(0.05, 0.035, 0.01, 0.11, 0.455, -0.184, G.mark), Bx(0.018, 0.1, 0.018, -0.13, 0.4, -0.17, 0x1a1a1a), Bx(0.024, 0.03, 0.024, -0.13, 0.46, -0.17, 0x3a3a3a),
    Bx(0.06, 0.13, 0.065, -0.225, 0.33, 0.07, 0x2a2a28), { g: CYL8, s: [0.006, 0.32, 0.006], p: [-0.225, 0.54, 0.085], c: 0x151515 }, Sp(0.04, 0.045, 0.04, 0.2, 0.28, -0.1, 0x3a4030),
    Bx(0.06, 0.07, 0.05, -0.12, 0.07, -0.105, G.pouch), Bx(0.06, 0.07, 0.05, 0.12, 0.07, -0.105, G.pouch)];
  for (const x of [-0.1, 0, 0.1]) tg.push(Bx(0.064, 0.11, 0.046, x, 0.27, -0.18, G.pouch), Bx(0.069, 0.032, 0.051, x, 0.334, -0.18, mulC(G.pouch, 0.88)), Bx(0.022, 0.012, 0.004, x, 0.318, -0.206, 0x1a1a1a));
  if (v.pack) tg.push(Bx(0.26, 0.32, 0.13, 0, 0.35, 0.215, G.pack), Bx(0.22, 0.1, 0.04, 0, 0.24, 0.29, mulC(G.pack, 0.9)), { g: CYL, s: [0.05, 0.22, 0.05], p: [0, 0.53, 0.19], r: [0, 0, Math.PI / 2], c: mulC(G.pack, 0.85) }, Bx(0.03, 0.2, 0.02, -0.08, 0.36, 0.28, mulC(G.pack, 0.8)), Bx(0.03, 0.2, 0.02, 0.08, 0.36, 0.28, mulC(G.pack, 0.8)));
  else tg.push(Bx(0.17, 0.23, 0.042, 0, 0.36, 0.172, G.pouch), Bx(0.012, 0.2, 0.012, 0.05, 0.36, 0.195, mulC(G.pouch, 0.7)));
  const torso = pair(tf, tg);
  // head and face
  const hf = [], hg = [Sp(0.098, 0.11, 0.106, 0, 0.162, 0, skin), Sp(0.084, 0.056, 0.086, 0, 0.1, -0.006, skin), Sp(0.04, 0.024, 0.022, 0, 0.076, -0.07, skin), Bx(0.12, 0.018, 0.026, 0, 0.186, -0.092, mulC(skin, 0.96)),
    Sp(0.014, 0.026, 0.018, 0, 0.152, -0.101, mulC(skin, 0.93)),
    Sp(0.016, 0.03, 0.022, -0.097, 0.155, 0.005, skin), Sp(0.016, 0.03, 0.022, 0.097, 0.155, 0.005, skin),
    Sp(0.012, 0.0065, 0.005, -0.035, 0.171, -0.095, 0xc8beb2), Sp(0.012, 0.0065, 0.005, 0.035, 0.171, -0.095, 0xc8beb2), Sp(0.006, 0.006, 0.003, -0.035, 0.171, -0.0995, 0x1e1712), Sp(0.006, 0.006, 0.003, 0.035, 0.171, -0.0995, 0x1e1712),
    Bx(0.04, 0.011, 0.012, -0.038, 0.188, -0.101, hair), Bx(0.04, 0.011, 0.012, 0.038, 0.188, -0.101, hair), Bx(0.042, 0.006, 0.006, 0, 0.106, -0.106, mulC(skin, 0.62))];
  if (!v.beard) hg.push(Sp(0.086, 0.058, 0.088, 0, 0.098, -0.006, mulC(skin, 0.82)));
  else hg.push(Sp(0.088, 0.062, 0.09, 0, 0.094, -0.008, hair), Sp(0.044, 0.034, 0.03, 0, 0.07, -0.07, hair), Bx(0.05, 0.013, 0.012, 0, 0.122, -0.1, hair));
  if (v.glasses && v.head !== 'bala') hg.push(Bx(0.1, 0.024, 0.012, 0, 0.172, -0.108, 0x121212), Bx(0.008, 0.008, 0.09, -0.05, 0.176, -0.06, 0x121212), Bx(0.008, 0.008, 0.09, 0.05, 0.176, -0.06, 0x121212));
  const cups = () => hg.push({ g: CYL, s: [0.037, 0.028, 0.037], p: [-0.106, 0.152, 0.005], r: [0, 0, Math.PI / 2], c: G.headset }, { g: CYL, s: [0.037, 0.028, 0.037], p: [0.106, 0.152, 0.005], r: [0, 0, Math.PI / 2], c: G.headset });
  if (v.head === 'helmet') {
    hf.push(Dm(0.136, 0.122, 0.146, 0, 0.214, 0.004, 0xf0f0f0));
    hg.push(Bx(0.012, 0.03, 0.11, -0.133, 0.222, 0, 0x2a2a28), Bx(0.012, 0.03, 0.11, 0.133, 0.222, 0, 0x2a2a28), Bx(0.046, 0.036, 0.022, 0, 0.29, -0.135, 0x1e1e1e), Bx(0.1, 0.03, 0.02, 0, 0.27, 0.138, 0x2a2a28), Sp(0.101, 0.03, 0.106, 0, 0.2, 0.012, hair));
    cups();
  } else if (v.head === 'cap') {
    hg.push(Dm(0.106, 0.072, 0.114, 0, 0.2, 0, G.cap), Bx(0.15, 0.012, 0.085, 0, 0.203, -0.128, G.cap, -0.14), Sp(0.101, 0.03, 0.108, 0, 0.2, 0.01, hair));
    cups();
  } else if (v.head === 'beanie') {
    hg.push(Dm(0.11, 0.105, 0.116, 0, 0.17, 0.003, G.beanie), { g: CYL, s: [0.112, 0.035, 0.118], p: [0, 0.182, 0.003], c: mulC(G.beanie, 0.85) });
  } else if (v.head === 'bala') {
    hg.push(Sp(0.104, 0.118, 0.112, 0, 0.16, 0, G.bala), Sp(0.087, 0.056, 0.093, 0, 0.098, -0.012, G.bala), Bx(0.1, 0.026, 0.01, 0, 0.172, -0.108, skin),
      Sp(0.013, 0.009, 0.006, -0.036, 0.172, -0.114, 0x1a1714), Sp(0.013, 0.009, 0.006, 0.036, 0.172, -0.114, 0x1a1714), Dm(0.132, 0.12, 0.142, 0, 0.214, 0.004, G.helm), Bx(0.046, 0.036, 0.022, 0, 0.29, -0.135, 0x151515));
  } else if (v.head === 'shemagh') {
    hg.push(Sp(0.1, 0.064, 0.106, 0, 0.1, -0.012, G.shem), { g: CYL, s: [0.078, 0.075, 0.078], p: [0, 0.045, 0], c: G.shem }, Sp(0.03, 0.06, 0.03, 0.02, 0.02, 0.1, mulC(G.shem, 0.8)), Dm(0.104, 0.1, 0.11, 0, 0.18, 0.01, hair));
  } else if (v.head === 'helmetB') {
    hg.push(Dm(0.136, 0.122, 0.146, 0, 0.214, 0.004, G.helm), Bx(0.046, 0.036, 0.022, 0, 0.29, -0.135, 0x151515), Sp(0.101, 0.03, 0.106, 0, 0.2, 0.012, hair));
    cups();
  }
  const head = pair(hf, hg);
  // arms holding a rifle (used whenever a gun is out)
  const af = [Sp(0.1, 0.095, 0.1, 0.215, 0.045, -0.005, W), Sp(0.1, 0.095, 0.1, -0.215, 0.045, -0.005, W)].concat(
    TL([0.215, 0.03, 0], [0.25, -0.19, -0.12], 0.084, 0.066, W), TL([0.25, -0.19, -0.12], [0.1, -0.1, -0.29], 0.066, 0.052, W),
    TL([-0.215, 0.03, 0], [-0.19, -0.15, -0.24], 0.084, 0.066, W), TL([-0.19, -0.15, -0.24], [0.02, -0.07, -0.54], 0.066, 0.052, W));
  const ag = [Sp(0.05, 0.05, 0.042, 0.262, -0.2, -0.11, G.knee), Sp(0.05, 0.05, 0.042, -0.2, -0.16, -0.228, G.knee),
    Sp(0.088, 0.03, 0.088, 0.222, -0.04, -0.035, G.mark), Sp(0.088, 0.03, 0.088, -0.207, -0.03, -0.068, G.mark),
    Sp(0.056, 0.05, 0.068, 0.098, -0.098, -0.305, G.glove), Sp(0.023, 0.023, 0.04, 0.072, -0.078, -0.31, G.glove), { g: CYL, s: [0.05, 0.03, 0.05], p: [0.118, -0.112, -0.27], r: [0.9, 0, -0.5], c: mulC(G.glove, 0.8) },
    Sp(0.058, 0.048, 0.07, 0.02, -0.075, -0.556, G.glove), Sp(0.023, 0.023, 0.04, -0.008, -0.054, -0.54, G.glove), { g: CYL, s: [0.05, 0.03, 0.05], p: [0.03, -0.083, -0.515], r: [1.2, 0, 0.1], c: mulC(G.glove, 0.8) }];
  const arms = pair(af, ag);
  // free arms for everything else: upper arm from the shoulder, forearm from the elbow, a gloved fist
  const upper = pair([Sp(0.1, 0.095, 0.1, 0, 0, 0, W)].concat(TL([0, -0.01, 0], [0, -0.27, 0], 0.084, 0.066, W)), [Sp(0.088, 0.03, 0.088, 0, -0.07, 0, G.mark)]);
  const fore = pair(TL([0, 0, 0], [0, -0.23, 0], 0.066, 0.052, W),
    [Sp(0.05, 0.05, 0.042, 0, 0, 0.02, G.knee), { g: CYL, s: [0.05, 0.03, 0.05], p: [0, -0.215, 0], c: mulC(G.glove, 0.8) }, Sp(0.05, 0.062, 0.056, 0, -0.28, 0, G.glove), Sp(0.022, 0.04, 0.022, 0, -0.27, -0.045, G.glove)]);
  const out = { thigh, shin, torso, head, arms, upper, fore };
  SG.set(key, out);
  return out;
}

// ---------- the model ----------

export class CharacterModel {
  constructor(outfit, name = null) {
    this.outfit = outfit;
    const v = soldierVariant(outfit, name);
    const g = soldierGeos(outfit, v);
    const fab = fabricMat(outfit), gm = gearMat();
    this.lodMeshes = [];
    const add = (grp, pr) => {
      for (const [geo, lo, mat] of [[pr.f, pr.fl, fab], [pr.g, pr.gl, gm]]) {
        if (!geo) continue;
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true;
        m.receiveShadow = true;
        grp.add(m);
        if (lo) this.lodMeshes.push({ m, hi: geo, lo });
      }
    };
    this.root = new THREE.Group();
    this.body = new THREE.Group(); // tilts for skydiving and swimming
    this.root.add(this.body);
    this.hips = new THREE.Group();
    this.hips.position.y = 0.92;
    this.body.add(this.hips);
    this.legs = [];
    for (const s of [-1, 1]) {
      const th = new THREE.Group();
      th.position.set(s * 0.125, 0, 0);
      th.rotation.z = s * 0.035;
      this.hips.add(th);
      add(th, g.thigh[s]);
      const sh = new THREE.Group();
      sh.position.y = -0.46;
      th.add(sh);
      add(sh, g.shin);
      this.legs.push([th, sh]);
    }
    this.torso = new THREE.Group();
    this.hips.add(this.torso);
    add(this.torso, g.torso);
    this.head = new THREE.Group();
    this.head.position.y = 0.56;
    this.torso.add(this.head);
    add(this.head, g.head);
    // rifle arms + gun
    this.aim = new THREE.Group();
    this.aim.position.y = 0.42;
    this.torso.add(this.aim);
    add(this.aim, g.arms);
    this.gun = new THREE.Mesh(weaponGeo('ar'), gunMaterial());
    this.gun.castShadow = true;
    this.gun.position.set(0.08, -0.06, -0.29);
    this.aim.add(this.gun);
    const T = zhTextures();
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.flash, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color: 0xffffff }));
    this.flash.scale.set(0.5, 0.5, 1);
    this.flash.visible = false;
    this.gun.add(this.flash);
    // free arms
    this.arms = [];
    for (const s of [-1, 1]) {
      const up = new THREE.Group();
      up.position.set(s * 0.215, 0.465, -0.005);
      this.torso.add(up);
      add(up, g.upper);
      const fo = new THREE.Group();
      fo.position.y = -0.27;
      up.add(fo);
      add(fo, g.fore);
      const hand = new THREE.Group();
      hand.position.set(0, -0.28, -0.02);
      fo.add(hand);
      this.arms.push({ up, fo, hand, s });
    }
    this.glider = new THREE.Group();
    this.glider.position.set(0, 2.55, 0);
    this.glider.add(gliderModel(outfit));
    this.glider.visible = false;
    this.root.add(this.glider);
    this.held = null;
    this.heldKey = '';
    this.gunType = 'ar';
    this.mode = 'ground';
    this.stride = 0;
    this.swing = 0;
    this.recoil = 0;
    this.flinch = 0;
    this.flashT = 0;
    this.emoteT = 0;
    this.holding = null;
    this.t = 0;
  }

  // what: { kind:'weapon', type, rarity } | 'pickaxe' | { kind:'heal', type } | 'build' | null
  setHeld(what) {
    const key = !what ? '' : typeof what === 'string' ? what : `${what.kind}-${what.type}-${what.rarity | 0}`;
    if (key === this.heldKey) return;
    this.heldKey = key;
    const hand = this.arms[1].hand;
    if (this.held) {
      hand.remove(this.held);
      this.held = null;
    }
    if (what && what.kind === 'weapon') {
      this.gunType = what.type;
      this.gun.geometry = weaponGeo(what.type, what.rarity);
      const d = gunDefs()[ZH_ID[what.type] || 'ar'];
      const mz = d.muzzle || [0, 0, -0.3];
      this.flash.position.set(mz[0], mz[1], mz[2] - 0.05);
      return;
    }
    if (what === 'pickaxe') {
      this.held = new THREE.Mesh(pickaxeGeo(this.outfit.gear.mark), gunMaterial());
      this.held.rotation.x = -Math.PI / 2;
      this.held.position.set(0, -0.02, 0);
    } else if (what && what.kind === 'heal') {
      this.held = new THREE.Mesh(healGeo(what.type), gunMaterial());
      this.held.position.set(0, -0.04, -0.06);
    }
    if (this.held) {
      this.held.castShadow = true;
      hand.add(this.held);
    }
  }

  // Far soldiers stop casting shadows (they are a few pixels tall and cost a lot of draw calls).
  lod(dist) {
    // past ~40 m the body swaps to its coarse version
    const far = dist > 40;
    if (far !== this.far) {
      this.far = far;
      for (const L of this.lodMeshes) L.m.geometry = far ? L.lo : L.hi;
    }
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

  // p: { dt, mode, speed, crouch, pitch, holding ('gun'|'pickaxe'|'heal'|'build'|null), aiming, emote,
  //      sprinting, onGround, reload (0..1 or -1), switching (0..1), vehicle }
  animate(p) {
    const dt = p.dt, mode = p.mode, k = 1 - Math.exp(-dt * 14);
    this.t += dt;
    const hs = p.speed || 0, pitch = p.pitch || 0, c = p.crouch ? 1 : 0;
    const gunOut = p.holding === 'gun' && (mode === 'ground' || mode === 'swim');
    this.aim.visible = gunOut;
    for (const A of this.arms) A.up.visible = !gunOut;
    this.glider.visible = mode === 'glide';
    this.flashT -= dt;
    this.flash.visible = this.flashT > 0 && gunOut;
    this.recoil = Math.max(0, this.recoil - dt * 8);
    this.swing = Math.max(0, this.swing - dt * 3.2);
    this.flinch = Math.max(0, this.flinch - dt * 5);
    const [l, r] = this.legs;
    // pose targets
    const P = {
      bodyX: 0, hipsY: 0.92, torsoX: 0, torsoY: 0, headX: pitch * 0.3, aimX: 0,
      lth: 0, lsh: -0.1, rth: 0, rsh: -0.1, lthz: -0.035, rthz: 0.035,
      arm: [{ x: 0.05, z: -0.08, ex: 0.15 }, { x: 0.05, z: 0.08, ex: 0.15 }],
    };
    if (mode === 'freefall') {
      P.bodyX = -1.25 + clamp(-pitch, -0.3, 0.6) * 0.4;
      P.headX = 0.9;
      const w = Math.sin(this.t * 6) * 0.15;
      P.lth = 0.25 + w;
      P.rth = 0.25 - w;
      P.lsh = -0.6;
      P.rsh = -0.6;
      P.lthz = -0.35;
      P.rthz = 0.35;
      P.arm[0] = { x: 0.3, z: -1.35, ex: 0.5 };
      P.arm[1] = { x: 0.3, z: 1.35, ex: 0.5 };
    } else if (mode === 'glide') {
      P.bodyX = -0.12;
      P.lth = 0.25;
      P.rth = -0.05;
      P.lsh = -0.5;
      P.rsh = -0.25;
      P.arm[0] = { x: 0.1, z: -2.75, ex: 0.1 };
      P.arm[1] = { x: 0.1, z: 2.75, ex: 0.1 };
    } else if (mode === 'vehicle') {
      P.hipsY = 0.55;
      P.lth = 1.45;
      P.rth = 1.45;
      P.lsh = -1.35;
      P.rsh = -1.35;
      P.arm[0] = { x: 1.05, z: -0.15, ex: 0.55 };
      P.arm[1] = { x: 1.05, z: 0.15, ex: 0.55 };
    } else if (mode === 'ground' || mode === 'swim') {
      this.stride += hs * dt;
      const ph = this.stride * 2.2, mv = Math.min(1, hs / 4);
      const s = Math.sin(ph) * mv * (p.sprinting ? 0.85 : 0.6);
      P.hipsY = lerp(0.92, 0.62, c) + Math.abs(Math.cos(ph)) * 0.03 * mv;
      P.lth = s + c * 1.3;
      P.rth = -s + c * 1.3;
      P.lsh = -(0.1 + Math.max(0, -s) * 1.1) - c * 1.9;
      P.rsh = -(0.1 + Math.max(0, s) * 1.1) - c * 1.9;
      P.torsoX = (gunOut ? pitch * 0.3 : 0) + (p.sprinting ? -0.12 : 0);
      if (!p.onGround && mode === 'ground') {
        P.lth = 0.6;
        P.lsh = -1.0;
        P.rth = 0.2;
        P.rsh = -0.5;
      }
      // free arms swing opposite the legs
      const sw = s * 0.9;
      P.arm[0] = { x: -sw + 0.05, z: -0.08, ex: 0.2 + Math.max(0, -sw) * 0.5 };
      P.arm[1] = { x: sw + 0.05, z: 0.08, ex: 0.2 + Math.max(0, sw) * 0.5 };
      if (gunOut) {
        P.aimX = p.sprinting ? -0.6 : pitch * 0.7;
        P.aimX -= this.recoil * 0.06;
        if (p.reload >= 0) P.aimX += Math.sin(p.reload * Math.PI) * 0.5;
        if (p.switching > 0) P.aimX -= p.switching * 0.8;
      } else if (p.holding === 'pickaxe') {
        // wind up over the shoulder, then chop down through the target
        const u = this.swing > 0 ? 1 - this.swing : 1;
        const base = 0.55 + pitch * 0.3;
        if (u < 0.4) {
          const f = u / 0.4;
          P.arm[1] = { x: lerp(base, 2.8, f), z: 0.12, ex: lerp(1.0, 0.35, f) };
          P.torsoY = -f * 0.3;
        } else if (u < 1) {
          const f = (u - 0.4) / 0.6;
          P.arm[1] = { x: lerp(2.8, 0.2, Math.sqrt(f)), z: 0.12, ex: lerp(0.35, 0.6, f) };
          P.torsoY = -0.3 * (1 - f);
        } else P.arm[1] = { x: base, z: 0.12, ex: 1.0 };
      } else if (p.holding === 'heal') {
        P.arm[0] = { x: 0.85, z: 0.35, ex: 1.25 };
        P.arm[1] = { x: 0.85, z: -0.35, ex: 1.25 };
      } else if (p.holding === 'build') {
        P.arm[1] = { x: 1.2 + pitch * 0.6, z: 0.05, ex: 0.3 };
        P.arm[0] = { x: 0.35, z: -0.12, ex: 0.6 };
      }
      if (mode === 'swim') {
        P.bodyX = -1.05;
        P.headX = 0.8;
        const st = this.t * 3.2;
        P.arm[0] = { x: 1.6 + Math.sin(st) * 1.3, z: -0.25, ex: 0.3 };
        P.arm[1] = { x: 1.6 - Math.sin(st) * 1.3, z: 0.25, ex: 0.3 };
        P.lth = Math.sin(st * 2) * 0.3;
        P.rth = -Math.sin(st * 2) * 0.3;
        P.lsh = -0.2;
        P.rsh = -0.2;
        this.aim.visible = false;
        for (const A of this.arms) A.up.visible = true;
      }
      if (p.emote && mode === 'ground') {
        this.emoteT += dt;
        const e = this.emoteT * 6;
        P.arm[0] = { x: 0.3 + Math.sin(e) * 0.4, z: -1.5 - Math.sin(e) * 1.0, ex: 0.6 + Math.sin(e * 2) * 0.4 };
        P.arm[1] = { x: 0.3 - Math.sin(e) * 0.4, z: 1.5 - Math.sin(e + Math.PI) * 1.0, ex: 0.6 - Math.sin(e * 2) * 0.4 };
        P.hipsY = 0.92 + Math.abs(Math.sin(e)) * 0.08 - 0.06;
        P.lth = Math.max(0, Math.sin(e)) * 0.6;
        P.rth = Math.max(0, -Math.sin(e)) * 0.6;
        P.lsh = -P.lth * 1.4;
        P.rsh = -P.rth * 1.4;
        P.torsoY = Math.sin(e * 0.5) * 0.5;
        this.aim.visible = false;
        for (const A of this.arms) A.up.visible = true;
      } else this.emoteT = 0;
    }
    const sm = (obj, prop, v) => (obj[prop] += (v - obj[prop]) * k);
    sm(this.body.rotation, 'x', P.bodyX);
    sm(this.hips.position, 'y', P.hipsY);
    sm(this.torso.rotation, 'x', P.torsoX);
    sm(this.torso.rotation, 'y', P.torsoY);
    this.torso.rotation.z = Math.sin(this.t * 40) * 0.08 * this.flinch;
    sm(this.head.rotation, 'x', P.headX);
    // the gun follows the aim immediately (it is what other players read)
    this.aim.rotation.x = gunOut ? damp(this.aim.rotation.x, P.aimX, 22, dt) : P.aimX;
    sm(l[0].rotation, 'x', P.lth);
    sm(l[1].rotation, 'x', P.lsh);
    sm(r[0].rotation, 'x', P.rth);
    sm(r[1].rotation, 'x', P.rsh);
    sm(l[0].rotation, 'z', P.lthz);
    sm(r[0].rotation, 'z', P.rthz);
    for (let i = 0; i < 2; i++) {
      const A = this.arms[i], T = P.arm[i];
      sm(A.up.rotation, 'x', T.x);
      sm(A.up.rotation, 'z', T.z);
      sm(A.fo.rotation, 'x', T.ex);
    }
    if (this.glider.visible) this.glider.rotation.z = Math.sin(this.t * 1.7) * 0.05;
  }

  // World position of the gun muzzle for tracers and flashes.
  muzzle(out) {
    if (!this.aim.visible) {
      this.head.updateWorldMatrix(true, false);
      return this.head.localToWorld(out.set(0, 0.1, -0.3));
    }
    this.gun.updateWorldMatrix(true, false);
    const d = gunDefs()[ZH_ID[this.gunType] || 'ar'];
    const m = d.muzzle || [0, 0, -0.3];
    return this.gun.localToWorld(out.set(m[0], m[1], m[2]));
  }
}

