// Gun models ported from Zero Hour. Each gun is built in parts (body / mag / pump / bolt / slide /
// charge / warhead) so the first-person view can animate them; world models and icons merge them.
// Barrels point along -Z with the grip near the origin.
import * as THREE from 'three';
import { Bx, Sp, Cyl, Cap, CYL, CYL8, torus, partGeo, mrMaterial, mulC, MRTAB } from './parts.js';

export const C_MET = 0x2b2d30, C_BLK = 0x19191b, C_POL = 0x3a3834, C_FDE = 0x8e7c5c, C_WOOD = 0x6a4428, C_STL = 0x7a7e84, C_BRS = 0xb89a4a, C_OD = 0x4a4d3a;

// Stormdrop weapon type -> Zero Hour gun.
export const ZH_ID = { ar: 'ar', smg: 'smg', shotgun: 'sg', sniper: 'sr', pistol: 'pis', rocket: 'rpg', lmg: 'lmg' };

function railItems(y, z0, z1, w, out) {
  out.push(Bx(w, 0.01, z1 - z0, 0, y, (z0 + z1) / 2, C_BLK));
  for (let z = z0 + 0.008; z < z1 - 0.004; z += 0.016) out.push(Bx(w + 0.004, 0.008, 0.007, 0, y + 0.008, z, C_BLK));
}

let GUNS = null;
export function gunDefs() {
  if (GUNS) return GUNS;
  const G = {};
  // KR-4 carbine: M4 pattern with an M-LOK rail, red dot and a curved mag
  {
    const b = [Bx(0.046, 0.058, 0.2, 0, 0.004, -0.045, C_MET), Bx(0.05, 0.05, 0.075, 0, -0.03, -0.105, C_MET), Bx(0.05, 0.056, 0.245, 0, 0.06, -0.07, 0x33363a),
      Bx(0.002, 0.022, 0.05, 0.026, 0.062, -0.06, C_BLK), { g: CYL, s: [0.009, 0.02, 0.009], p: [0.032, 0.068, 0.0], r: [0, 0, Math.PI / 2], c: C_BLK },
      { g: CYL8, s: [0.031, 0.3, 0.031], p: [0, 0.058, -0.345], r: [Math.PI / 2, 0, Math.PI / 8], c: C_POL }, Cyl(0.011, 0.2, 0, 0.058, -0.585, C_BLK, 'z'), Cyl(0.016, 0.065, 0, 0.058, -0.71, C_BLK, 'z'),
      Bx(0.002, 0.012, 0.03, 0.017, 0.058, -0.71, 0x0c0c0c), Bx(0.002, 0.012, 0.03, -0.017, 0.058, -0.71, 0x0c0c0c),
      Bx(0.03, 0.09, 0.042, 0, -0.055, 0.03, C_POL, -0.3), Sp(0.016, 0.012, 0.022, 0, -0.098, 0.045, C_POL), Bx(0.006, 0.006, 0.062, 0, -0.029, -0.02, C_BLK), Bx(0.006, 0.03, 0.006, 0, -0.016, -0.052, C_BLK), Bx(0.004, 0.018, 0.006, 0, -0.016, -0.014, C_STL),
      Cyl(0.014, 0.16, 0, 0.055, 0.14, C_BLK, 'z'), Bx(0.04, 0.07, 0.12, 0, 0.035, 0.245, C_POL), Bx(0.036, 0.02, 0.1, 0, 0.074, 0.245, C_POL), Bx(0.042, 0.08, 0.012, 0, 0.03, 0.307, C_BLK),
      Bx(0.03, 0.022, 0.05, 0, 0.108, -0.085, C_BLK), torus(0.021, 0.0055, 0, 0.137, -0.088, C_BLK), Cyl(0.007, 0.014, 0.029, 0.137, -0.088, C_BLK, 'x'), Bx(0.018, 0.018, 0.012, 0, 0.106, 0.005, C_BLK), Bx(0.018, 0.012, 0.018, 0, 0.104, -0.46, C_BLK)];
    for (const s of [-1, 1]) for (const z of [-0.27, -0.33, -0.39, -0.45]) b.push(Bx(0.004, 0.01, 0.03, s * 0.029, 0.058, z, 0x121212));
    railItems(0.09, -0.2, 0.045, 0.034, b);
    railItems(0.093, -0.49, -0.21, 0.028, b);
    G.ar = {
      body: b, mag: [Bx(0.028, 0.06, 0.07, 0, -0.075, -0.1, C_BLK, 0.1), Bx(0.028, 0.06, 0.068, 0, -0.13, -0.09, C_BLK, 0.22), Bx(0.031, 0.012, 0.072, 0, -0.162, -0.08, C_BLK, 0.3)], charge: [Bx(0.03, 0.012, 0.02, 0, 0.089, 0.057, C_BLK)],
      grip: [0, -0.05, 0.03], rake: -0.3, fore: [0, 0.058, -0.37], port: [0.03, 0.062, -0.06], muzzle: [0, 0.058, -0.75], well: [0, -0.06, -0.1], sightY: 0.137, adsZ: 0.5, dot: { p: [0, 0.137, -0.088], r: 0.016 },
    };
  }
  // Vespa-9: compact SMG with a can
  {
    const b = [Cyl(0.026, 0.3, 0, 0.042, -0.08, C_MET, 'z'), Cyl(0.028, 0.12, 0, 0.036, -0.27, C_POL, 'z'), Cyl(0.02, 0.15, 0, 0.042, -0.41, C_BLK, 'z'), Cyl(0.021, 0.012, 0, 0.042, -0.485, 0x101010, 'z'),
      Bx(0.03, 0.085, 0.04, 0, -0.05, 0.03, C_POL, -0.25), Sp(0.015, 0.012, 0.02, 0, -0.092, 0.042, C_POL), Bx(0.006, 0.006, 0.05, 0, -0.024, -0.02, C_BLK), Bx(0.004, 0.016, 0.006, 0, -0.012, -0.014, C_STL),
      Cyl(0.005, 0.19, 0.015, 0.035, 0.15, C_BLK, 'z'), Cyl(0.005, 0.19, -0.015, 0.035, 0.15, C_BLK, 'z'), Bx(0.05, 0.06, 0.012, 0, 0.03, 0.245, C_BLK),
      Bx(0.026, 0.02, 0.045, 0, 0.078, -0.06, C_BLK), torus(0.017, 0.005, 0, 0.1, -0.062, C_BLK), Bx(0.002, 0.018, 0.04, 0.027, 0.045, -0.05, C_BLK)];
    railItems(0.07, -0.18, 0.05, 0.03, b);
    G.smg = {
      body: b, mag: [Bx(0.024, 0.07, 0.034, 0, -0.05, -0.1, C_BLK, 0.1), Bx(0.024, 0.07, 0.034, 0, -0.115, -0.09, C_BLK, 0.2), Bx(0.027, 0.01, 0.038, 0, -0.152, -0.082, C_BLK, 0.25)],
      grip: [0, -0.042, 0.03], rake: -0.25, fore: [0, 0.036, -0.27], port: [0.028, 0.045, -0.05], muzzle: [0, 0.042, -0.5], well: [0, -0.03, -0.1], sightY: 0.1, adsZ: 0.46, dot: { p: [0, 0.1, -0.062], r: 0.0125 },
    };
  }
  // Mastiff 12: pump shotgun with wood furniture
  {
    const b = [Bx(0.05, 0.07, 0.22, 0, 0.02, -0.04, C_MET), Cyl(0.014, 0.5, 0, 0.046, -0.4, C_BLK, 'z'), Cyl(0.013, 0.38, 0, 0.012, -0.34, C_BLK, 'z'), Cyl(0.016, 0.012, 0, 0.012, -0.53, C_STL, 'z'),
      Bx(0.04, 0.08, 0.27, 0, -0.012, 0.2, C_WOOD, -0.1), Sp(0.022, 0.04, 0.012, 0, -0.01, 0.335, C_BLK), Bx(0.03, 0.08, 0.04, 0, -0.05, 0.05, C_WOOD, -0.3), Bx(0.006, 0.006, 0.05, 0, -0.024, -0.015, C_BLK),
      Sp(0.006, 0.007, 0.006, 0, 0.064, -0.64, C_STL), Bx(0.02, 0.01, 0.01, 0, 0.058, -0.02, C_BLK), Bx(0.002, 0.03, 0.07, 0.026, 0.02, -0.03, 0x0c0c0c)];
    const pump = [Cyl(0.026, 0.15, 0, 0.01, -0.32, C_WOOD, 'z')];
    for (const z of [-0.37, -0.34, -0.31, -0.28]) pump.push(Cyl(0.0275, 0.006, 0, 0.01, z, 0x4a2c18, 'z'));
    G.sg = { body: b, pump, grip: [0, -0.048, 0.05], rake: -0.3, fore: [0, 0.01, -0.32], port: [0.028, 0.02, -0.03], muzzle: [0, 0.046, -0.66], well: [0, -0.02, -0.02], sightY: 0.066, adsZ: 0.5 };
  }
  // Kodiak .338: bolt action with a big scope
  {
    const b = [Cyl(0.022, 0.26, 0, 0.03, -0.04, C_MET, 'z'), Cyl(0.013, 0.55, 0, 0.03, -0.45, C_BLK, 'z'), Bx(0.032, 0.028, 0.075, 0, 0.03, -0.76, C_BLK),
      Bx(0.045, 0.058, 0.3, 0, 0.0, -0.12, C_OD), Bx(0.042, 0.08, 0.3, 0, -0.006, 0.21, C_OD), Bx(0.036, 0.024, 0.14, 0, 0.048, 0.2, C_OD), Bx(0.044, 0.09, 0.014, 0, -0.005, 0.36, C_BLK),
      Bx(0.03, 0.085, 0.042, 0, -0.05, 0.05, C_OD, -0.3), Bx(0.006, 0.006, 0.05, 0, -0.028, 0.0, C_BLK),
      Cyl(0.017, 0.3, 0, 0.1, -0.06, C_BLK, 'z'), Cyl(0.028, 0.075, 0, 0.1, -0.25, C_BLK, 'z', 0.019), Cyl(0.021, 0.06, 0, 0.1, 0.12, C_BLK, 'z'), Cyl(0.01, 0.022, 0, 0.125, -0.06, C_BLK, 'y'), Cyl(0.01, 0.022, 0.024, 0.1, -0.06, C_BLK, 'x'),
      Bx(0.03, 0.035, 0.02, 0, 0.075, -0.16, C_BLK), Bx(0.03, 0.035, 0.02, 0, 0.075, 0.04, C_BLK), Cyl(0.029, 0.004, 0, 0.1, -0.29, 0x2a4a6a, 'z')];
    G.sr = {
      body: b, mag: [Bx(0.03, 0.06, 0.06, 0, -0.035, -0.06, C_BLK)], bolt: [Cyl(0.005, 0.05, 0.034, 0.03, 0.05, C_STL, 'x'), Sp(0.012, 0.012, 0.012, 0.062, 0.03, 0.05, C_BLK)],
      grip: [0, -0.048, 0.05], rake: -0.3, fore: [0, 0.0, -0.28], port: [0.024, 0.04, -0.02], muzzle: [0, 0.03, -0.8], well: [0, -0.02, -0.06], sightY: 0.1, adsZ: 0.4,
    };
  }
  // Brute M6: belt-fed LMG
  {
    const b = [Bx(0.06, 0.08, 0.3, 0, 0.02, -0.05, C_MET), Bx(0.062, 0.026, 0.2, 0, 0.072, -0.05, C_BLK), Bx(0.012, 0.03, 0.12, 0, 0.11, -0.2, C_BLK), Bx(0.012, 0.03, 0.012, 0, 0.09, -0.15, C_BLK), Bx(0.012, 0.03, 0.012, 0, 0.09, -0.25, C_BLK),
      Cyl(0.014, 0.36, 0, 0.03, -0.44, C_BLK, 'z'), Bx(0.03, 0.012, 0.24, 0, 0.052, -0.42, C_MET), { g: CYL8, s: [0.032, 0.18, 0.032], p: [0, 0.024, -0.33], r: [Math.PI / 2, 0, Math.PI / 8], c: C_POL },
      Cyl(0.009, 0.2, 0.02, -0.012, -0.5, C_BLK, 'z'), Cyl(0.009, 0.2, -0.02, -0.012, -0.5, C_BLK, 'z'), Cyl(0.016, 0.05, 0, 0.03, -0.64, C_BLK, 'z'),
      Bx(0.045, 0.08, 0.2, 0, 0.0, 0.2, C_POL), Bx(0.047, 0.085, 0.012, 0, 0.0, 0.302, C_BLK), Bx(0.03, 0.085, 0.042, 0, -0.055, 0.05, C_POL, -0.3), Bx(0.006, 0.006, 0.06, 0, -0.03, -0.0, C_BLK),
      torus(0.008, 0.003, 0, 0.1, 0.03, C_BLK), Bx(0.004, 0.03, 0.004, 0, 0.098, -0.585, C_BLK), Bx(0.002, 0.03, 0.06, 0.031, 0.03, -0.06, 0x0c0c0c)];
    const mag = [Bx(0.09, 0.1, 0.11, -0.045, -0.07, -0.09, 0x4a4a3a), Bx(0.092, 0.012, 0.112, -0.045, -0.02, -0.09, 0x3a3a2e)];
    for (let i = 0; i < 5; i++) mag.push(Bx(0.012, 0.012, 0.03, 0.012, 0.005 + i * 0.004, -0.09 + (i - 2) * 0.012, C_BRS));
    G.lmg = { body: b, mag, grip: [0, -0.055, 0.05], rake: -0.3, fore: [0, 0.024, -0.33], port: [0.034, 0.03, -0.06], muzzle: [0, 0.03, -0.67], well: [-0.04, -0.05, -0.09], sightY: 0.1, adsZ: 0.52 };
  }
  // X9 sidearm
  {
    const b = [Bx(0.024, 0.02, 0.16, 0, 0.01, -0.06, C_BLK), Bx(0.026, 0.1, 0.045, 0, -0.045, 0.01, C_BLK, -0.25), Bx(0.028, 0.075, 0.01, 0, -0.04, -0.013, 0x222222, -0.25),
      Bx(0.005, 0.006, 0.05, 0, -0.012, -0.05, C_BLK), Bx(0.004, 0.015, 0.005, 0, -0.004, -0.035, C_STL), Bx(0.026, 0.012, 0.045, 0, -0.097, 0.024, C_BLK)];
    const slide = [Bx(0.026, 0.03, 0.182, 0, 0.034, -0.07, C_MET), Bx(0.004, 0.018, 0.03, 0.013, 0.036, 0.0, 0x1a1a1a), Bx(0.022, 0.01, 0.008, 0, 0.053, 0.008, C_BLK), Bx(0.005, 0.01, 0.006, 0, 0.053, -0.152, C_BLK),
      Sp(0.0025, 0.0025, 0.0015, 0, 0.056, -0.1565, 0x6aff8a), Sp(0.0025, 0.0025, 0.0015, -0.007, 0.056, 0.0125, 0x6aff8a), Sp(0.0025, 0.0025, 0.0015, 0.007, 0.056, 0.0125, 0x6aff8a)];
    for (let z = 0.0; z < 0.03; z += 0.008) slide.push(Bx(0.0275, 0.024, 0.003, 0, 0.034, z, 0x1c1c1e));
    G.pis = { body: b, slide, grip: [0, -0.04, 0.012], rake: -0.25, fore: [-0.005, -0.045, 0.012], port: [0.016, 0.04, -0.04], muzzle: [0, 0.034, -0.165], well: [0, -0.09, 0.02], sightY: 0.055, adsZ: 0.44, pistol: 1 };
  }
  // RPG-9
  {
    const b = [Cyl(0.043, 0.95, 0, 0.04, -0.2, 0x4a5a3a, 'z'), Cyl(0.056, 0.1, 0, 0.04, 0.3, C_BLK, 'z', 0.046), Cyl(0.046, 0.02, 0, 0.04, -0.12, C_BLK, 'z'), Cyl(0.046, 0.02, 0, 0.04, -0.4, C_BLK, 'z'),
      Bx(0.03, 0.09, 0.04, 0, -0.05, 0, C_BLK, -0.2), Bx(0.03, 0.09, 0.04, 0, -0.04, -0.28, C_BLK, -0.2), Bx(0.02, 0.06, 0.03, -0.066, 0.1, -0.3, C_BLK), Cyl(0.016, 0.04, -0.066, 0.14, -0.3, C_BLK, 'z')];
    const cone = new THREE.ConeGeometry(0.066, 0.26, 12);
    cone.rotateX(-Math.PI / 2);
    G.rpg = {
      body: b, war: [{ g: cone, p: [0, 0.04, -0.86], c: 0x5a6a4a, b: [0.13, 0.13, 0.26] }, Cyl(0.038, 0.12, 0, 0.04, -0.68, 0x5a6a4a, 'z'), Cyl(0.006, 0.04, 0.045, 0.04, -0.72, 0x2a2a2a, 'x')],
      grip: [0, -0.045, 0], rake: -0.2, fore: [0, -0.04, -0.28], port: null, muzzle: [0, 0.04, -0.75], well: null, sightY: 0.1, adsZ: 0.5,
    };
  }
  GUNS = G;
  return G;
}

export function gunItems(id, rarity = 0) {
  const d = gunDefs()[id];
  if (!d) return [];
  return rarityItems([].concat(d.body, d.mag || [], d.pump || [], d.bolt || [], d.slide || [], d.charge || [], d.war || []), rarity);
}

// ---------- rarity finishes ----------
// Common guns are plain black and gunmetal. Each tier up recolors the furniture and tints the metal:
// green, blue, purple, then a full gold finish for legendary.
const POLY = [C_POL, 0x45423c, C_FDE, C_OD, 0x5a6a4a, 0x4a5a3a, 0x4a4a3a, 0x3a3a2e, 0x222222];
const RAR_SWAP = [
  null,
  { poly: 0x3f8a3a, met: 0x2c3a2e, rcv: 0x34463a, blk: 0x1d2a1f, stl: null, wood: 0x55753a },
  { poly: 0x2f66c4, met: 0x26324a, rcv: 0x2c3c5c, blk: 0x1a2030, stl: 0x8fb4e8, wood: 0x2f548e },
  { poly: 0x7038c4, met: 0x2c2442, rcv: 0x3c2c60, blk: 0x241c32, stl: 0xbb9cf0, wood: 0x5a2f8a },
  { poly: 0xd8a83c, met: 0xd8a83c, rcv: 0xc89430, blk: 0x6e5420, stl: 0xf4d26e, wood: 0x3a2416 },
];
export const RARITY_MR = {
  0x3f8a3a: [0.15, 0.38], 0x2c3a2e: [0.85, 0.32], 0x1d2a1f: [0.55, 0.4], 0x34463a: [0.8, 0.34], 0x55753a: [0.05, 0.45],
  0x2f66c4: [0.15, 0.34], 0x26324a: [0.85, 0.3], 0x2c3c5c: [0.8, 0.32], 0x1a2030: [0.55, 0.38], 0x8fb4e8: [1, 0.2], 0x2f548e: [0.05, 0.42],
  0x7038c4: [0.2, 0.3], 0x2c2442: [0.85, 0.28], 0x3c2c60: [0.8, 0.3], 0x241c32: [0.55, 0.36], 0xbb9cf0: [1, 0.18], 0x5a2f8a: [0.05, 0.4],
  0xd8a83c: [1, 0.22], 0xc89430: [1, 0.26], 0x6e5420: [1, 0.34], 0xf4d26e: [1, 0.14], 0x3a2416: [0, 0.4],
};
Object.assign(MRTAB, RARITY_MR);
export function rarityItems(items, rarity) {
  const m = RAR_SWAP[rarity | 0];
  if (!m) return items;
  const map = (c) => {
    if (POLY.includes(c)) return m.poly;
    if (c === C_MET) return m.met;
    if (c === 0x33363a) return m.rcv;
    if (c === C_BLK && m.blk) return m.blk;
    if ((c === C_STL || c === C_BRS) && m.stl) return m.stl;
    if ((c === C_WOOD || c === 0x4a2c18) && m.wood) return m.wood;
    return c;
  };
  return items.map((p) => (p.c === undefined ? p : { ...p, c: map(p.c) }));
}

// ---------- the harvesting tool and consumables, built the same way ----------

// Harvesting tool: hickory haft, forged steel head with a colored wrap. Haft runs along +Y from the grip.
export function pickaxeItems(accent = 0xffcc33) {
  const wrap = accent, steel = 0x8a8e92, dark = 0x2b2d30, edge = 0xc4c8cc;
  const taper = (r, h, x, y, z, c, tilt) => ({ g: TAPER, s: [r, h, r], p: [x, y, z], r: [-Math.PI / 2 - tilt, 0, 0], c });
  const P = [
    // haft: hickory with a wrapped grip, a pommel and a collar under the head
    Cyl(0.017, 0.62, 0, 0.2, 0, C_WOOD, 'y', 0.015), Cyl(0.024, 0.03, 0, -0.105, 0, dark, 'y'),
    Cyl(0.03, 0.06, 0, 0.47, 0, dark, 'y'), Cyl(0.026, 0.02, 0, 0.43, 0, wrap, 'y'),
    // head: a forged center with a long curved pick in front and a short spike behind
    Bx(0.05, 0.075, 0.1, 0, 0.5, 0, steel), Bx(0.052, 0.02, 0.102, 0, 0.53, 0, wrap),
    Bx(0.044, 0.052, 0.1, 0, 0.497, -0.095, steel, 0.06), Bx(0.036, 0.042, 0.09, 0, 0.488, -0.18, steel, 0.16), Bx(0.028, 0.032, 0.08, 0, 0.47, -0.255, steel, 0.3),
    Bx(0.006, 0.03, 0.2, 0, 0.475, -0.17, edge, 0.17),
    taper(0.016, 0.07, 0, 0.452, -0.32, edge, 0.42),
    Bx(0.042, 0.05, 0.06, 0, 0.5, 0.075, steel, -0.08), taper(0.02, 0.06, 0, 0.495, 0.13, steel, Math.PI - 0.1),
  ];
  for (let i = 0; i < 4; i++) P.push(Cyl(0.0195, 0.022, 0, -0.07 + i * 0.034, 0, i % 2 ? dark : wrap, 'y'));
  return P;
}
const TAPER = new THREE.CylinderGeometry(0.08, 1, 1, 8);

export function healItems(type) {
  switch (type) {
    case 'bandage':
      return [Cyl(0.05, 0.075, 0, 0, 0, 0xe8e4dc, 'x'), Cyl(0.02, 0.08, 0, 0, 0, 0xbab4aa, 'x'), Bx(0.075, 0.003, 0.09, 0, -0.049, -0.05, 0xe8e4dc, 0.2), Bx(0.03, 0.03, 0.004, 0.0, 0.0, 0.05, 0xc23a32)];
    case 'medkit':
      return [Bx(0.26, 0.17, 0.09, 0, 0, 0, 0xc23a32), Bx(0.27, 0.02, 0.095, 0, 0.06, 0, 0x8e2a24), Bx(0.03, 0.09, 0.004, 0, 0, -0.047, 0xf2efe8), Bx(0.09, 0.03, 0.004, 0, 0, -0.047, 0xf2efe8),
        Bx(0.12, 0.016, 0.03, 0, 0.1, 0, 0x2a2a2a), Bx(0.012, 0.03, 0.03, -0.055, 0.09, 0, 0x2a2a2a), Bx(0.012, 0.03, 0.03, 0.055, 0.09, 0, 0x2a2a2a)];
    case 'mini':
      return [Sp(0.045, 0.05, 0.045, 0, 0, 0, 0x3a8ae6), Cyl(0.016, 0.04, 0, 0.06, 0, 0xcfe4ff, 'y'), Cyl(0.02, 0.012, 0, 0.085, 0, 0x2a2a2a, 'y'), Sp(0.03, 0.02, 0.006, 0, 0.0, -0.043, 0xffffff)];
    default:
      return [Cyl(0.075, 0.2, 0, 0, 0, 0x2f6dff, 'y'), Cyl(0.077, 0.02, 0, 0.06, 0, 0x1a3a8a, 'y'), Cyl(0.077, 0.02, 0, -0.06, 0, 0x1a3a8a, 'y'),
        Cyl(0.05, 0.05, 0, 0.12, 0, 0x7fb0ff, 'y'), Cyl(0.022, 0.03, 0, 0.16, 0, 0xdfefff, 'y'), Bx(0.03, 0.08, 0.02, 0.08, 0.02, 0, 0x2a2a2a)];
  }
}

// ---------- shared world materials and cached geometry ----------

let GUNMAT = null;
export function gunMaterial() {
  if (!GUNMAT) GUNMAT = mrMaterial({ roughness: 0.72, metalness: 0.08, envMapIntensity: 0.9 });
  return GUNMAT;
}

const GEO = new Map();
export function cachedGeo(key, items) {
  if (!GEO.has(key)) GEO.set(key, partGeo(typeof items === 'function' ? items() : items));
  return GEO.get(key);
}

export function weaponGeo(type, rarity = 0) {
  return cachedGeo('gun-' + type + ':' + (rarity | 0), () => gunItems(ZH_ID[type] || 'ar', rarity));
}

export function pickaxeGeo(accentHex) {
  return cachedGeo('pick-' + accentHex, () => pickaxeItems(accentHex));
}

export function healGeo(type) {
  return cachedGeo('heal-' + type, () => healItems(type));
}

export function muzzleOf(type) {
  const d = gunDefs()[ZH_ID[type] || 'ar'];
  return d && d.muzzle ? d.muzzle : [0, 0, -0.3];
}

export { Cap, mulC };
