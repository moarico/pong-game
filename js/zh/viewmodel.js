// First-person hands and guns, ported from Zero Hour. The gun is drawn by its own camera in its own
// little scene. Springs drive everything (recoil, look sway, landing, sprint tuck) so motion has weight,
// and the parts move: mags come out and go back in, pumps rack, bolts cycle, slides blow back, brass flies.
import * as THREE from 'three';
import { partGeo, partGeo2, Sp, Cap, Cyl, TL, CYL, mrMaterial, mulC, damp, smooth, rand, TAU } from './parts.js';
import { gunDefs, ZH_ID, pickaxeItems, healItems, C_BRS } from './guns.js';
import { zhTextures } from './textures.js';
import { WEAPONS } from '../config.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => smooth(clamp((x - a) / (b - a), 0, 1));
const V3a = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];

// Hip positions per gun (x right, y up, z forward is negative).
const HIPP = { pis: [0.13, -0.15, -0.38], rpg: [0.2, -0.19, -0.46], pick: [0.21, -0.18, -0.44], heal: [0.14, -0.21, -0.46] };

function chain(pts, r, c) {
  const o = [];
  for (let i = 0; i < pts.length - 1; i++) o.push(...Cap(r * (1 - i * 0.06), pts[i], pts[i + 1], c));
  return o;
}

// Closed around a vertical grip, index finger resting straight along the frame.
function fistItems(mirror, GLV, KNK) {
  const m = mirror ? -1 : 1, P = (x, y, z) => [x * m, y, z], it = [Sp(0.023, 0.05, 0.034, 0.024 * m, -0.004, 0.012, GLV), Sp(0.012, 0.046, 0.03, 0.041 * m, -0.002, 0.008, KNK)];
  for (const [y, r] of [[0.012, 0.0088], [-0.012, 0.0088], [-0.035, 0.0078]]) it.push(...chain([P(0.026, y, -0.012), P(0.012, y, -0.032), P(-0.008, y, -0.035), P(-0.023, y, -0.02)], r, GLV));
  it.push(...chain([P(0.026, 0.034, -0.012), P(0.021, 0.036, -0.045), P(0.017, 0.036, -0.07)], 0.0086, GLV));
  it.push(...chain([P(0.014, 0.04, 0.028), P(-0.008, 0.047, 0.018), P(-0.023, 0.043, -0.002)], 0.0096, GLV));
  it.push(Sp(0.03, 0.03, 0.034, 0.028 * m, -0.035, 0.036, GLV));
  return it;
}

// Cupped under a handguard, fingers wrapped up the far side, thumb along the near side.
function supportItems(GLV, KNK) {
  const it = [Sp(0.03, 0.018, 0.05, -0.008, -0.04, 0, GLV), Sp(0.012, 0.03, 0.045, 0.039, -0.013, 0, KNK)];
  for (const z of [-0.036, -0.012, 0.012, 0.034]) it.push(...chain([[-0.002, -0.044, z], [0.026, -0.037, z], [0.041, -0.012, z], [0.037, 0.014, z]], 0.0086, GLV));
  it.push(...chain([[-0.03, -0.034, 0.03], [-0.041, -0.01, 0.01], [-0.037, 0.012, -0.02]], 0.0096, GLV));
  it.push(Sp(0.032, 0.03, 0.036, -0.014, -0.055, 0.045, GLV));
  return it;
}

function limbGeo(a, b, rA, rB) {
  return partGeo2(TL(a, b, rA, rB, 0xffffff));
}

function newSpring() {
  return {
    sx: 0, sy: 0, sxv: 0, syv: 0, tilt: 0, kz: 0, krx: 0, kry: 0, krz: 0, ky: 0, kzv: 0, krxv: 0, kryv: 0, krzv: 0, kyv: 0,
    spr: 0, air: 0, lastShot: -9, shellCyc: 0, slide: 0, landed: false,
  };
}
function spr(S, k, target, stiff, dmp, dt) {
  const v = k + 'v';
  S[v] += ((target - S[k]) * stiff - S[v] * dmp) * dt;
  S[k] += S[v] * dt;
}

const SKYRAYS = [[0, 1, 0], [0.6, 0.8, 0], [-0.6, 0.8, 0], [0, 0.8, 0.6], [0, 0.8, -0.6], [0.42, 0.8, 0.42], [-0.42, 0.8, -0.42]].map((v) => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
});

export class ViewModel {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.01, 6);
    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x5d6a3e, 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff0d8, 2.3);
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);
    this.mat = mrMaterial({ roughness: 0.46, metalness: 0.3, envMapIntensity: 0.42 });
    this.sleeve = null;
    this.outfit = null;
    this.items = new Map();
    this.root = new THREE.Group();
    this.scene.add(this.root);
    const T = zhTextures();
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.flash, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
    this.flash.material.color.setScalar(1.6);
    this.flash.visible = false;
    this.flash.renderOrder = 3;
    this.flash2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow, color: 0xffb060, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
    this.flash2.visible = false;
    this.flash2.renderOrder = 3;
    this.light = new THREE.PointLight(0xffa850, 0, 1.6, 2);
    this.root.add(this.flash, this.flash2, this.light);
    this.flashT = 0;
    this.cur = null;
    this.curKey = '';
    this.S = newSpring();
    this.shells = [];
    this.shi = 0;
    const shellGeo = partGeo([Cyl(0.0045, 0.02, 0, 0, 0, C_BRS, 'z')]);
    this.shotShell = partGeo([Cyl(0.009, 0.028, 0, 0, 0.004, 0xa02a22, 'z'), Cyl(0.0092, 0.008, 0, 0, -0.014, C_BRS, 'z')]);
    this.shellGeo = shellGeo;
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(shellGeo, this.mat);
      m.visible = false;
      this.scene.add(m);
      this.shells.push({ m, t: 9, v: new THREE.Vector3(), s: new THREE.Vector3() });
    }
    this.sunVis = 1;
    this.skyVis = 1;
    this.probeT = 0;
    this.lookDX = 0;
    this.lookDY = 0;
  }

  setEnvironment(tex) {
    this.scene.environment = tex;
  }

  setOutfit(outfit, fabricMat) {
    if (this.outfit === outfit) return;
    this.outfit = outfit;
    this.sleeve = fabricMat.clone();
    this.sleeve.envMapIntensity = 0.5;
    for (const it of this.items.values()) this.root.remove(it.root);
    this.items.clear();
    this.cur = null;
    this.curKey = '';
  }

  // Build (once) the gun or tool with the hands on it.
  build(key) {
    if (this.items.has(key)) return this.items.get(key);
    const o = this.outfit, GLV = o ? o.gear.glove : 0x1c1d1e, KNK = mulC(GLV, 0.8);
    const cuff = o ? mulC(o.gear.carrier, 0.75) : 0x3a3c3a;
    let d;
    let pistolGrip = false;
    if (key === 'pick') {
      d = { body: pickaxeItems(o ? o.gear.mark : 0xffcc33), grip: [0, -0.01, 0], rake: 0, fore: null, sightY: 0, adsZ: 0.4, hip: HIPP.pick };
    } else if (key.startsWith('heal-')) {
      const type = key.slice(5);
      const big = type === 'medkit' || type === 'big';
      d = { body: healItems(type).map((p) => ({ ...p, p: [p.p[0], p.p[1] + (big ? 0.12 : 0.07), p.p[2] - 0.02] })), grip: [0, 0, 0], rake: 0, fore: big ? [-0.11, 0.05, -0.02] : null, sightY: 0, adsZ: 0.4, hip: big ? [0.17, -0.27, -0.62] : HIPP.heal };
    } else {
      const id = ZH_ID[key] || 'ar';
      d = { ...gunDefs()[id], id, hip: HIPP[id] || [0.2, -0.2, -0.52] };
      pistolGrip = !!d.pistol;
    }
    const root = new THREE.Group(), parts = {};
    const mesh = (items) => new THREE.Mesh(partGeo(items), this.mat);
    root.add(mesh(d.body));
    for (const k of ['mag', 'pump', 'bolt', 'slide', 'charge', 'war']) {
      if (!d[k]) continue;
      const g = new THREE.Group();
      g.add(mesh(d[k]));
      root.add(g);
      parts[k] = g;
    }
    // right hand on the grip, sleeve running back out of frame
    const hR = new THREE.Group();
    hR.position.set(d.grip[0], d.grip[1], d.grip[2]);
    root.add(hR);
    const fg = partGeo(fistItems(false, GLV, KNK));
    fg.applyMatrix4(new THREE.Matrix4().makeRotationX(d.rake || 0));
    hR.add(new THREE.Mesh(fg, this.mat));
    const wR = [0.036, -0.062, 0.078], eR = V3a(wR, [0.08, -0.2, 0.28]);
    hR.add(new THREE.Mesh(limbGeo(wR, eR, 0.033, 0.047), this.sleeve));
    hR.add(new THREE.Mesh(partGeo(Cap(0.034, wR, V3a(wR, [0.006, -0.012, 0.02]), cuff)), this.mat));
    let hL = null;
    if (d.fore) {
      hL = new THREE.Group();
      hL.position.set(d.fore[0], d.fore[1], d.fore[2]);
      root.add(hL);
      const lg = pistolGrip ? partGeo(fistItems(true, GLV, KNK)) : partGeo(supportItems(GLV, KNK));
      if (pistolGrip) lg.applyMatrix4(new THREE.Matrix4().makeRotationX(d.rake));
      hL.add(new THREE.Mesh(lg, this.mat));
      const wL = pistolGrip ? [-0.04, -0.06, 0.07] : [-0.02, -0.07, 0.075], eL = V3a(wL, [-0.13, -0.21, 0.26]);
      hL.add(new THREE.Mesh(limbGeo(wL, eL, 0.033, 0.047), this.sleeve));
      hL.add(new THREE.Mesh(partGeo([...Cap(0.035, wL, V3a(wL, [-0.004, -0.01, 0.02]), cuff),
        { g: CYL, s: [0.036, 0.018, 0.036], p: V3a(wL, [-0.02, -0.03, 0.045]), r: [0.9, 0, 0.4], c: 0x151515 }, Sp(0.014, 0.005, 0.014, ...V3a(wL, [-0.036, -0.01, 0.05]), 0x1e2a30)]), this.mat));
      hL.userData.home = hL.position.clone();
    }
    root.visible = false;
    this.root.add(root);
    const it = { root, parts, hR, hL, d, key };
    this.items.set(key, it);
    return it;
  }

  ejectShell(it, shotgun) {
    const port = it.d.port;
    if (!port) return;
    const s = this.shells[this.shi];
    this.shi = (this.shi + 1) % this.shells.length;
    s.m.geometry = shotgun ? this.shotShell : this.shellGeo;
    s.m.position.set(port[0], port[1], port[2]);
    it.root.localToWorld(s.m.position);
    s.m.visible = true;
    s.t = 0;
    s.v.set(rand(1.1, 1.7), rand(0.9, 1.5), rand(0.1, 0.5));
    s.s.set(rand(-20, 20), rand(-30, 30), rand(-20, 20));
    s.m.rotation.set(rand(0, 3), rand(0, 3), 0);
  }

  updateShells(dt) {
    for (const s of this.shells) {
      if (!s.m.visible) continue;
      s.t += dt;
      if (s.t > 0.7) {
        s.m.visible = false;
        continue;
      }
      s.v.y -= 7 * dt;
      s.m.position.addScaledVector(s.v, dt);
      s.m.rotation.x += s.s.x * dt;
      s.m.rotation.y += s.s.y * dt;
      s.m.rotation.z += s.s.z * dt;
    }
  }

  // Called by the actor whenever the player's gun goes off.
  fired() {
    this.flashT = 0.05;
    this.flash.material.rotation = Math.random() * TAU;
  }

  // Shade the gun with the world: is the sun blocked right in front of the eyes, how much sky is overhead.
  probe(dt, camPos, fwd) {
    const g = this.game, W = g.collision, sd = g.env.sunDir;
    this.probeT -= dt;
    if (this.probeT <= 0) {
      this.probeT = 0.1;
      const lit = W.raycast(camPos.x + fwd.x * 0.45, camPos.y - 0.12, camPos.z + fwd.z * 0.45, sd.x, sd.y, sd.z, 140) ? 0 : 1;
      let open = 0;
      for (const r of SKYRAYS) if (!W.raycast(camPos.x, camPos.y, camPos.z, r[0], r[1], r[2], 45)) open++;
      this.litT = lit;
      this.openT = open / SKYRAYS.length;
    }
    this.sunVis = damp(this.sunVis, this.litT ?? 1, 9, dt);
    this.skyVis = damp(this.skyVis, this.openT ?? 1, 3, dt);
    const env = g.env;
    this.sun.color.copy(env.sun.color);
    this.sun.intensity = env.sun.intensity * (0.08 + 0.92 * this.sunVis);
    const e = 0.25 + 0.75 * this.skyVis;
    this.mat.envMapIntensity = e * 0.42;
    if (this.sleeve) this.sleeve.envMapIntensity = e * 0.5;
    this.hemi.color.copy(env.hemi.color);
    this.hemi.groundColor.copy(env.hemi.groundColor);
    this.hemi.intensity = env.hemi.intensity * 0.7 * e;
  }

  // a: the player actor. view: { fov, aspect }
  update(dt, a, cam) {
    const S = this.S, g = this.game;
    // what is in the hands
    let key = '';
    const held = a.held;
    if (a.mode === 'ground' && !a.buildMode) {
      if (a.sel === -1) key = 'pick';
      else if (held && held.kind === 'weapon') key = held.type;
      else if (held && held.kind === 'heal') key = 'heal-' + held.type;
    }
    if (key !== this.curKey) {
      if (this.cur) this.cur.root.visible = false;
      this.curKey = key;
      this.cur = key ? this.build(key) : null;
      if (this.cur) {
        const mz = this.cur.d.muzzle || [0, 0, -0.3];
        this.cur.root.add(this.flash, this.flash2, this.light);
        this.flash.position.set(mz[0], mz[1], mz[2] - 0.03);
        this.flash2.position.copy(this.flash.position);
        this.light.position.set(mz[0], mz[1], mz[2] + 0.05);
      }
    }
    this.updateShells(dt);
    const it = this.cur;
    if (!it) return;
    const it0 = it.root, vw = it, d = it.d;
    it0.visible = true;
    const def = held && held.kind === 'weapon' ? WEAPONS[held.type] : null;
    // muzzle flash: star sprite + soft glow + a quick light that warms the hands and gun
    this.flashT -= dt;
    const fl = this.flashT > 0 && !!def;
    this.flash.visible = fl;
    this.flash2.visible = fl;
    this.light.intensity = fl ? 2.6 : 0;
    if (fl) {
      const s = rand(0.2, 0.3) * (held.type === 'shotgun' || held.type === 'sniper' ? 1.5 : 1);
      this.flash.scale.set(s, s, 1);
      this.flash2.scale.set(s * 1.6, s * 1.6, 1);
      this.flash2.material.opacity = 0.6;
    }
    const t = smooth(a.adsT), hip = d.hip, asp = clamp(this.cam.aspect / 1.78, 1, 1.7);
    // --- shot impulses: kick back, muzzle climb, a little random roll ---
    if (a.lastShotT !== S.lastShot) {
      S.lastShot = a.lastShotT;
      if (def) {
        const r = def.rec ? def.rec[0] : 1, big = held.type === 'shotgun' || held.type === 'sniper' || held.type === 'rocket';
        const k = 1 - t * 0.55;
        S.kzv += (big ? 5.5 : 2.2) * r * 0.55 * k;
        S.krxv += (big ? 9 : 3.2) * r * 0.5 * k;
        S.kryv += rand(-1, 1) * 1.6 * k;
        S.krzv += rand(-1, 1) * (big ? 5 : 2.4) * k;
        S.kyv += (big ? 0.6 : 0.2) * k;
        if (held.type === 'pistol') S.slide = 1;
        if (!big && held.type !== 'rocket') this.ejectShell(it, false);
        S.shellCyc = 0;
      }
    }
    for (const k of ['kz', 'krx', 'kry', 'krz', 'ky']) spr(S, k, 0, 210, 19, dt);
    // --- look inertia: the gun lags behind your aim and swings back ---
    const ls = 1 - t * 0.75;
    spr(S, 'sx', clamp(-this.lookDX * 2.6, -0.12, 0.12) * ls, 120, 15, dt);
    spr(S, 'sy', clamp(-this.lookDY * 2.6, -0.09, 0.09) * ls, 120, 15, dt);
    // --- strafe tilt, sprint pose, bob, breathing, jump and landing ---
    const cy = Math.cos(a.yaw), sy = Math.sin(a.yaw), right = a.vel.x * cy - a.vel.z * sy, hs = Math.hypot(a.vel.x, a.vel.z), mv = a.onGround ? Math.min(1, hs / 5) : 0;
    S.tilt = damp(S.tilt, clamp(-right / 6, -1, 1) * 0.09 * (1 - t * 0.6), 8, dt);
    S.spr = damp(S.spr, a.sprinting ? 1 : 0, 9, dt);
    S.air = damp(S.air, a.onGround ? 0 : 1, 10, dt);
    if (a.landKick > 0.05 && !S.landed) {
      S.landed = true;
      S.kyv -= a.landKick * 1.4;
    }
    if (a.landKick <= 0.05) S.landed = false;
    const ph = a.model.stride * 2.2, bw = (1 - t * 0.88) * (1 + S.spr * 1.2);
    const bx = Math.cos(ph) * 0.013 * mv * bw, by = -Math.abs(Math.sin(ph)) * 0.016 * mv * bw, brz = Math.cos(ph) * 0.02 * mv * bw;
    const T = g.time;
    const br = Math.sin(T * 1.7) * 0.0035 * (1 - t * 0.7), brx = Math.sin(T * 1.1) * 0.004 * (1 - t * 0.8);
    const sightY = d.sightY || 0, adsZ = d.adsZ || 0.5;
    let x = lerp(hip[0] * asp, 0, t) + bx + S.sx * 0.13 * (1 - t);
    let y = lerp(hip[1], -sightY, t) + by + br + S.sy * 0.1 * (1 - t) + S.ky * 0.02 - S.air * 0.012;
    let z = lerp(hip[2], -adsZ, t) + S.kz * 0.04;
    let rx = S.sy + S.krx * 0.06 + brx - S.air * 0.05, ry = S.sx + 0.035 * (1 - t), rz = -0.035 * (1 - t) + S.tilt + brz + S.krz * 0.02;
    // sprint: weapon rolled in and tucked, bouncing with the run
    x -= 0.07 * S.spr;
    y -= 0.055 * S.spr;
    z += 0.03 * S.spr;
    rx -= 0.3 * S.spr;
    ry += 0.65 * S.spr;
    rz += 0.4 * S.spr;
    y += Math.sin(ph * 2) * 0.012 * S.spr;
    // --- reloads: mag out, hand down, new mag in, slap, back up ---
    const mag = vw.parts.mag, war = vw.parts.war, hL = vw.hL;
    let lhx = 0, lhy = 0, lhz = 0;
    if (mag) {
      mag.position.set(0, 0, 0);
      mag.rotation.set(0, 0, 0);
      mag.visible = true;
    }
    if (war) {
      war.position.set(0, 0, 0);
      war.visible = true;
    }
    const shellReload = held && held.type === 'shotgun';
    if (a.reloadT > 0 && a.reloadTotal > 0 && def) {
      const f = 1 - a.reloadT / a.reloadTotal;
      if (shellReload) {
        S.shellCyc = 1;
        const push = Math.sin(Math.min(1, f) * Math.PI);
        if (hL && d.well) {
          lhx = (d.well[0] - d.fore[0]) * 0.8;
          lhy = d.well[1] - d.fore[1] - 0.02 - push * 0.02;
          lhz = d.well[2] - d.fore[2] + 0.04 - push * 0.04;
        }
        rz += 0.28;
        rx += 0.08;
        y -= 0.02;
      } else {
        const tilt = sm(0, 0.14, f) - sm(0.86, 1, f);
        rz += tilt * 0.5;
        rx += tilt * 0.14;
        x -= tilt * 0.025;
        y -= tilt * 0.018;
        if (held.type === 'rocket' && war) {
          const out = sm(0.15, 0.35, f), inn = sm(0.55, 0.78, f);
          war.visible = f < 0.35 || f > 0.5;
          war.position.z = out > 0 && f < 0.5 ? -0.25 * out : -0.3 * (1 - inn);
          war.position.y = f < 0.5 ? -0.1 * out : -0.1 * (1 - inn);
        } else if (mag) {
          const out = sm(0.12, 0.3, f), inn = sm(0.42, 0.56, f);
          mag.visible = f < 0.32 || f > 0.4;
          if (f < 0.4) {
            mag.position.y = -0.3 * out;
            mag.rotation.x = 0.5 * out;
          } else {
            mag.position.y = -0.3 * (1 - inn);
            mag.rotation.x = 0.35 * (1 - inn);
          }
        }
        const jolt = sm(0.54, 0.57, f) - sm(0.57, 0.66, f);
        y += jolt * 0.012;
        rx -= jolt * 0.06;
        const slap = sm(0.74, 0.77, f) - sm(0.77, 0.86, f);
        rx -= slap * 0.08;
        z += slap * 0.01;
        if (hL && d.well) {
          const reach = sm(0.06, 0.18, f) * (1 - sm(0.66, 0.8, f)), dip = sm(0.26, 0.34, f) * (1 - sm(0.4, 0.5, f));
          lhx = (d.well[0] - d.fore[0]) * reach;
          lhy = (d.well[1] - 0.06 - d.fore[1]) * reach - dip * 0.3;
          lhz = (d.well[2] + 0.02 - d.fore[2]) * reach + dip * 0.05;
        }
      }
    }
    // pump / bolt cycling after each shot, pistol slide blowback
    const since = g.time - a.lastShotT;
    if (vw.parts.pump) {
      let pp = 0;
      if (since > 0.14 && since < 0.62) {
        const f = (since - 0.14) / 0.48;
        pp = Math.sin(f * Math.PI);
        if (f > 0.45 && S.shellCyc === 0) {
          S.shellCyc = 1;
          this.ejectShell(it, true);
        }
      }
      vw.parts.pump.position.z = pp * 0.085;
      if (hL && !(a.reloadT > 0)) lhz += pp * 0.085;
      rx += pp * 0.04;
    }
    if (vw.parts.bolt) {
      const b = vw.parts.bolt;
      b.position.set(0, 0, 0);
      b.rotation.set(0, 0, 0);
      if (since > 0.3 && since < 1.05) {
        const f = (since - 0.3) / 0.75, up = sm(0, 0.2, f) * (1 - sm(0.8, 1, f)), back = sm(0.2, 0.45, f) * (1 - sm(0.55, 0.8, f));
        b.rotation.z = up * 1.2;
        b.position.z = back * 0.07;
        rz += up * 0.18;
        rx += up * 0.05;
        if (f > 0.5 && S.shellCyc === 0) {
          S.shellCyc = 1;
          this.ejectShell(it, false);
        }
      }
    }
    if (vw.parts.slide) {
      S.slide = damp(S.slide, 0, 28, dt);
      const empty = held && held.ammo === 0 && !(a.reloadT > 0);
      vw.parts.slide.position.z = empty ? 0.035 : S.slide * 0.035;
    }
    if (hL) {
      const h = hL.userData.home;
      hL.position.set(h.x + lhx, h.y + lhy, h.z + lhz);
    }
    // weapon swap: old gun drops away, new one swings up from below
    if (a.switchT > 0) {
      const s = smooth(a.switchT / 0.32);
      y -= s * 0.3;
      rx -= s * 0.8;
      rz += s * 0.3;
    }
    // harvesting tool: carried forward at the right hip, head up; wind up over the shoulder and chop
    if (this.curKey === 'pick') {
      rx -= 1.0;
      ry -= 0.2;
      rz += 0.25;
      const sw = a.model.swing;
      if (sw > 0) {
        const u = 1 - sw;
        const lift = u < 0.3 ? sm(0, 0.3, u) : 1 - sm(0.3, 0.55, u);
        const hit = sm(0.3, 0.5, u) * (1 - sm(0.65, 1, u));
        rx += lift * 0.95 - hit * 0.6;
        y += lift * 0.06 - hit * 0.04;
        z += lift * 0.05 - hit * 0.12;
        x -= hit * 0.1;
        rz += hit * 0.45;
      }
    }
    // healing: bring the item up and work it
    if (a.heal && this.curKey.startsWith('heal-')) {
      const f = clamp(a.heal.t / a.heal.total, 0, 1);
      const up = sm(0, 0.12, f) * (1 - sm(0.94, 1, f));
      y += up * 0.08 + Math.sin(f * a.heal.total * 9) * 0.006 * up;
      z += up * 0.08;
      rx += up * 0.45;
      x -= up * 0.1;
    }
    it0.position.set(x, y, z);
    it0.rotation.set(rx, ry, rz);
    const scoped = def && def.scope && a.adsT > 0.88;
    it0.visible = !scoped;
  }

  render(renderer) {
    const ac = renderer.autoClear;
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(this.scene, this.cam);
    renderer.autoClear = ac;
  }

  hideAll() {
    if (this.cur) this.cur.root.visible = false;
    this.cur = null;
    this.curKey = '';
  }
}
