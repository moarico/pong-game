import * as THREE from 'three';
import { Stage } from '../stage.js';
import { ArenaBuilder, amat, APAT, makeArenaMaterial, place, pointedArch } from '../arenamat.js';
import { common } from '../glsl.js';
import { clampCircle, pushOutCircle, cameraInCircle } from '../ground.js';
import { PK, alphaBlend } from '../vfx.js';
import { mulberry32 } from '../noise.js';
import { Rider } from './rider.js';

// ---------------------------------------------------------------------------
// The Ruined Bastion. The courtyard of a castle the storm has been breaking
// for a hundred years: curtain walls down to rubble in places, towers
// shattered, the keep burnt out and still smouldering. Rain hammers the
// flagstones, lightning walks the hills, braziers gutter, torn banners crack
// in the gale. The rider who holds it waits in the rain.
// ---------------------------------------------------------------------------

export const FLOOR_R = 18;
const WALL_R = 23;
const MOON = new THREE.Vector3(0.38, 0.52, -0.76).normalize();

// The storm sky: low cloud boiling past, lit from within by lightning, the moon
// breaking through now and then.
const skyVert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * viewMatrix * (modelMatrix * vec4(position, 1.0));
  gl_Position = p.xyww;
}
`;

const skyFrag = /* glsl */ `
${common}
uniform float uTime;
uniform vec3 uMoon;
uniform vec4 uFlash; // direction xyz, strength
varying vec3 vDir;
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    s += a * vnoise(p);
    p = m * p + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}
void main() {
  vec3 v = normalize(vDir);
  float h = max(v.y, 0.0);
  vec2 p = v.xz / (h + 0.12) * 1.6 + vec2(uTime * 0.05, uTime * 0.02);
  vec2 w = vec2(fbm(p * 0.7 + uTime * 0.03), fbm(p * 0.7 + 7.3 - uTime * 0.02));
  float c = fbm(p + w * 1.4);
  float thick = smoothstep(0.35, 0.75, c);
  vec3 base = mix(vec3(0.02, 0.025, 0.035), vec3(0.06, 0.065, 0.08), h);
  // Cloud undersides, darker where thick.
  vec3 col = mix(base * 1.8, vec3(0.012, 0.014, 0.02), thick);
  // The moon and a halo, through the thin places.
  float md = dot(v, uMoon);
  float moon = smoothstep(0.9994, 0.9997, md);
  float halo = pow(max(md, 0.0), 60.0) * 0.5 + pow(max(md, 0.0), 8.0) * 0.08;
  float clear = 1.0 - thick * 0.85;
  col += vec3(0.7, 0.78, 0.95) * (moon * 6.0 + halo) * clear;
  // Lightning lights the cloud from inside.
  float fl = uFlash.w * (0.35 + 0.65 * pow(max(dot(v, uFlash.xyz), 0.0), 3.0));
  col += vec3(0.55, 0.62, 0.9) * fl * (0.4 + thick * 1.2);
  // Toward the horizon, rain haze.
  col = mix(col, vec3(0.035, 0.04, 0.055) + vec3(0.3, 0.34, 0.5) * fl * 0.3, exp(-h * 12.0) * 0.8);
  gl_FragColor = vec4(col, 1.0 - moon * clear);
}
`;

// Rain: streaks that wrap in a box around the camera, blown by the wind.
const rainVert = /* glsl */ `
attribute vec3 aSeed;
attribute float aEnd;
uniform float uTime;
uniform vec3 uCam;
uniform vec2 uWind;
varying float vFade;
void main() {
  vec3 box = vec3(36.0, 22.0, 36.0);
  float speed = 13.0 + aSeed.y * 4.0;
  vec3 vel = vec3(uWind.x, -speed, uWind.y);
  vec3 p = aSeed * box + vel * uTime;
  p = mod(p - uCam + box * 0.5, box) - box * 0.5 + uCam;
  p -= vel * aEnd * 0.045;
  vFade = 1.0 - smoothstep(10.0, 18.0, length(p.xz - uCam.xz));
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

const rainFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uFlashLight;
varying float vFade;
void main() {
  vec3 col = uColor * (1.0 + uFlashLight * 6.0);
  gl_FragColor = vec4(col, 0.22 * vFade);
}
`;

export class BastionStage extends Stage {
  constructor(game, manager) {
    super(game, manager);
    this.id = 'bastion';
    this.title = 'The Ruined Bastion';
    this.spawn = { x: 0, z: 13.5, yaw: Math.PI };
    this.camDist = 1.6;
    this.pitchBias = -0.06;
    this.camClose = 1.2;
    this.tiltClose = 0.06;
    this.lighting = {
      sunDir: MOON.toArray(),
      lightDir: MOON.toArray(),
      sun: [0.34, 0.4, 0.58],
      ambSky: [0.085, 0.095, 0.14],
      ambGround: [0.035, 0.035, 0.04],
      fog: [0.035, 0.04, 0.055],
      fogSun: [0.18, 0.21, 0.3],
      fogDensity: 0.016,
      fogFalloff: 0.02,
      mist: [0.03, 0.8],
      envSky: [0.14, 0.16, 0.24],
      envGround: [0.03, 0.03, 0.035],
      rays: 0.28,
      flare: 0.35,
      bloom: 0.1,
      key: 0.15,
      range: [0.1, 7],
      wind: 1.5,
    };
    const self = this;
    this.solids = [];
    this.floor = {
      height: () => 0,
      clamp(pos, vel) {
        clampCircle(pos, vel, 0, 0, FLOOR_R);
        for (const [x, z, r] of self.solids) pushOutCircle(pos, vel, x, z, r + 0.35);
      },
      camera(aim, pos) {
        cameraInCircle(aim, pos, 0, 0, WALL_R - 2, []);
      },
    };
    this.intro = {
      dur: 9.8,
      keys: [
        { t: 0, pos: [0, 12, 24], look: [0, 4, -6], fov: 58 },
        { t: 3.0, pos: [-10, 5, 8], look: [0, 2.5, -10], fov: 52 },
        { t: 5.6, pos: [-2.5, 2.2, -4.5], look: [0, 2.6, -11], fov: 46 },
        { t: 7.6, pos: [2.8, 1.6, -5], look: [0, 3.2, -11], fov: 50 },
        { t: 9.8, pos: [1.2, 3.2, 18], look: [0, 3, 6], fov: 48 },
      ],
    };
    this.preview = { pos: [4.2, 2.1, 7.5], look: [-0.5, 3.0, -8], fov: 54 };
    this.rand = mulberry32(99);
    this.flash = new THREE.Vector4(0, 1, 0, 0);
    this.strikeT = 4;
    this.pendingThunder = [];
    this.braziers = [];
  }

  makeBoss() {
    return new Rider(this.g, this);
  }

  makeMaterial() {
    return makeArenaMaterial(this.shared, { floorY: 0, wet: 1 });
  }

  onImpact(x, z, s) {
    this.splash(x, z, 0.4 + s * 0.5);
  }

  splash(x, z, s = 1) {
    const fx = this.fx;
    fx.add.burst(x, 0.05, z, Math.round(8 + s * 14), { vel: [0, 3 * s, 0], scatter: 2 * s, scatterY: 0.5, life: 0.6, size: [0.05, 0.02], color: [0.5, 0.55, 0.7, 0.9], color1: [0.2, 0.22, 0.3, 0], gravity: 9.8, drag: 0.5, kind: PK.soft }, 0.3 * s);
    fx.smoke.burst(x, 0.3, z, Math.round(3 + s * 5), { vel: [0, 0.8 * s, 0], scatter: 1.4 * s, scatterY: 0.3, life: 1.3, size: [0.5 * s, 1.8 * s], color: [0.35, 0.36, 0.42, 0.45], color1: [0.25, 0.26, 0.3, 0], drag: 2, kind: PK.smoke }, 0.5 * s);
  }

  fire(x, y, z, s = 1, life = 0.7) {
    this.fx.add.emit(x + (Math.random() - 0.5) * 0.3 * s, y, z + (Math.random() - 0.5) * 0.3 * s, { vel: [(Math.random() - 0.5) * 0.4, 1.4 + Math.random(), (Math.random() - 0.5) * 0.4], life, size: [0.5 * s, 0.15 * s], color: [4, 1.6, 0.35, 1], color1: [1.4, 0.25, 0.04, 0], drag: 1, kind: PK.flame });
  }

  // A bolt from the clouds to `to` (or a distant one), its flash and its thunder.
  lightning(to = null, strength = 1) {
    const cam = this.g.rig.camera.position;
    const rnd = this.rand;
    let b;
    if (to) b = to.clone();
    else {
      const a = rnd() * Math.PI * 2;
      const r = 45 + rnd() * 60;
      b = new THREE.Vector3(cam.x + Math.sin(a) * r, -2, cam.z + Math.cos(a) * r);
    }
    const a = b.clone().add(new THREE.Vector3((rnd() - 0.5) * 20, 70 + rnd() * 20, (rnd() - 0.5) * 20));
    this.bolts.strike(a, b, cam, { width: to ? 0.35 : 0.9, life: 0.5 });
    const dir = a.clone().sub(cam).normalize();
    this.flash.set(dir.x, dir.y, dir.z, Math.min(2.5, this.flash.w + 1.6 * strength));
    this.shared.uFlashLight.value = Math.max(this.shared.uFlashLight.value, (to ? 1.4 : 0.7) * strength);
    const dist = b.distanceTo(cam);
    this.pendingThunder.push({ t: to ? 0.05 : Math.min(3, dist / 90), pos: b });
  }

  build() {
    const B = new ArenaBuilder();
    const rnd = mulberry32(21);
    const stone = amat('#6a6660', { pat: APAT.ashlar, param: 0.55, rough: 0.9 });
    const stoneDark = amat('#4a4744', { pat: APAT.ashlar, param: 0.6, rough: 0.9 });
    const flags = amat('#57544f', { pat: APAT.flags, param: 1.4, rough: 0.7 });
    const slate = amat('#2a2b30', { pat: APAT.flags, param: 0.4, rough: 0.6 });
    const wood = amat('#3a2a1c', { pat: APAT.wood, param: 0.22, rough: 0.8 });
    const iron = amat('#2a2826', { pat: APAT.iron, rough: 0.5, metal: 0.8 });
    const ember = amat('#ff8a3a', { pat: APAT.emissive, param: 4 });
    const bark = amat('#2a221c', { pat: APAT.rock, param: 0.3, rough: 0.9 });
    const cloth = (hex) => amat(hex, { pat: APAT.banner, param: 4.4, rough: 0.95, bump: 0 });

    // --- The courtyard floor ----------------------------------------------------------
    const floorG = new THREE.CircleGeometry(WALL_R + 3, 72);
    B.add(floorG, flags, null, { matrix: place(0, 0, 0, -Math.PI / 2, 0, 0), uvFn: (p) => [p.x, p.y] });
    floorG.dispose();

    // --- The curtain wall: sections between towers, some broken ------------------------
    const towers = [];
    const NT = 6;
    for (let k = 0; k < NT; k++) {
      const a = (k / NT) * Math.PI * 2 + Math.PI / NT;
      towers.push([Math.sin(a) * WALL_R, Math.cos(a) * WALL_R, a]);
    }
    const wallSeg = (x0, z0, x1, z1, h, broken) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const ang = Math.atan2(x1 - x0, z1 - z0);
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      const n = Math.max(1, Math.round(len / 1.5));
      // Build the wall as columns so a breach can bite a ragged hole in it.
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const px = x0 + (x1 - x0) * t;
        const pz = z0 + (z1 - z0) * t;
        let hh = h;
        if (broken) {
          const m = Math.abs(t - broken.at) / broken.w;
          if (m < 1) hh = h * (broken.depth + (1 - broken.depth) * (m * m)) + (rnd() - 0.5) * 0.8;
        }
        if (hh <= 0.3) continue;
        B.box(len / n + 0.02, hh, 2.4, stone, place(px, hh / 2, pz, 0, ang + Math.PI / 2, 0));
        // Crenellations on intact stretches.
        if (hh > h - 0.2 && i % 2 === 0) B.box(len / n * 0.7, 0.9, 0.6, stone, place(px - Math.cos(ang) * 0, hh + 0.45, pz, 0, ang + Math.PI / 2, 0).multiply(place(0, 0, -0.9)));
        if (hh > h - 0.2 && i % 2 === 0) B.box(len / n * 0.7, 0.9, 0.6, stone, place(px, hh + 0.45, pz, 0, ang + Math.PI / 2, 0).multiply(place(0, 0, 0.9)));
      }
      // A walkway ledge along the inside.
      if (!broken) B.box(len, 0.25, 0.6, stoneDark, place(cx - Math.sin(ang + Math.PI / 2) * 0, h - 0.4, cz, 0, ang + Math.PI / 2, 0).multiply(place(0, 0, 1.45)));
      if (broken) {
        // Rubble spilled from the breach.
        const bx = x0 + (x1 - x0) * broken.at;
        const bz = z0 + (z1 - z0) * broken.at;
        for (let k = 0; k < 26; k++) {
          const s = 0.3 + rnd() * 0.9;
          const inward = -(2 + rnd() * 4);
          const nx = bx / WALL_R;
          const nz = bz / WALL_R;
          const lx = bx + nx * inward * 0.6 + (rnd() - 0.5) * 4;
          const lz = bz + nz * inward * 0.6 + (rnd() - 0.5) * 4;
          B.box(s * 1.4, s, s, stone, place(lx, s * 0.4, lz, rnd(), rnd() * 6, rnd()));
        }
      }
    };
    for (let k = 0; k < NT; k++) {
      const [x0, z0] = towers[k];
      const [x1, z1] = towers[(k + 1) % NT];
      // Leave room for the towers themselves.
      const d = Math.hypot(x1 - x0, z1 - z0);
      const ux = (x1 - x0) / d;
      const uz = (z1 - z0) / d;
      const broken = k === 1 ? { at: 0.5, w: 0.3, depth: 0.05 } : k === 4 ? { at: 0.35, w: 0.22, depth: 0.35 } : null;
      // The gate (south) is its own piece.
      if (k === 5) {
        wallSeg(x0 + ux * 3, z0 + uz * 3, x0 + ux * (d / 2 - 3), z0 + uz * (d / 2 - 3), 9, null);
        wallSeg(x0 + ux * (d / 2 + 3), z0 + uz * (d / 2 + 3), x1 - ux * 3, z1 - uz * 3, 9, null);
        this.gate = [x0 + ux * (d / 2), z0 + uz * (d / 2), Math.atan2(ux, uz)];
      } else wallSeg(x0 + ux * 3, z0 + uz * 3, x1 - ux * 3, z1 - uz * 3, 9, broken);
    }
    // Towers: round, battered, one burnt to a stump; conical slate roofs on the rest.
    towers.forEach(([x, z], k) => {
      const h = k === 3 ? 8 : 15 + (k % 2) * 3;
      B.cylinder(3.2, 3.5, h, stone, place(x, h / 2, z), 24);
      if (k !== 3) {
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          if (i % 2) B.box(1.0, 1.0, 0.6, stone, place(x + Math.sin(a) * 3.1, h + 0.5, z + Math.cos(a) * 3.1, 0, a, 0));
        }
        if (k % 2 === 0) B.lathe([[3.6, 0], [0.001, 5.5]], slate, place(x, h + 0.05, z), 20);
        // Arrow slits: dark gashes.
        for (let i = 0; i < 4; i++) {
          const a = Math.atan2(-x, -z) + (i - 1.5) * 0.4;
          B.box(0.18, 1.3, 0.2, amat('#0a0a0c', { rough: 1 }), place(x + Math.sin(a) * 3.2, 5 + (i % 2) * 4, z + Math.cos(a) * 3.2, 0, a, 0));
        }
      } else {
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          const hh = rnd() * 2.5;
          B.box(1.2, hh + 0.3, 0.8, stone, place(x + Math.sin(a) * 3.0, h + hh / 2, z + Math.cos(a) * 3.0, 0, a, 0));
        }
      }
      this.solids.push([x, z, 3.6]);
    });
    // The gatehouse: an arch with the portcullis half raised, a room above.
    if (this.gate) {
      const [gx, gz, ga] = this.gate;
      const shape = new THREE.Shape();
      shape.moveTo(-4, 0);
      shape.lineTo(4, 0);
      shape.lineTo(4, 11);
      shape.lineTo(-4, 11);
      shape.closePath();
      const hole = new THREE.Path();
      const arch = pointedArch(3.4, 4.2, 1.8, 10);
      hole.moveTo(-1.7, 0.01);
      for (const [ax, ay] of arch) hole.lineTo(ax, ay);
      hole.lineTo(1.7, 0.01);
      hole.closePath();
      shape.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(shape, { depth: 3.2, bevelEnabled: false, curveSegments: 8 });
      g.translate(0, 0, -1.6);
      B.add(g, stone, null, { matrix: place(gx, 0, gz, 0, ga + Math.PI / 2, 0) });
      g.dispose();
      for (let i = 0; i < 7; i++) B.box(0.1, 3.4, 0.1, iron, place(gx + (i - 3) * 0.48 * Math.sin(ga), 4.4, gz + (i - 3) * 0.48 * Math.cos(ga), 0, ga + Math.PI / 2, 0));
      for (let i = 0; i < 4; i++) B.box(3.4, 0.1, 0.1, iron, place(gx, 3.2 + i * 0.8, gz, 0, ga + Math.PI / 2, 0));
    }
    // The keep: tall, burnt out, windows still glowing.
    {
      const kz = -WALL_R - 9;
      B.box(16, 22, 12, stoneDark, place(0, 11, kz));
      for (let i = 0; i < 9; i++) {
        const x = -7 + i * 1.75 + (rnd() - 0.5) * 0.4;
        const hh = rnd() * 3.5;
        B.box(1.5, hh + 0.5, 1.5, stoneDark, place(x, 22 + hh / 2, kz + 5.5));
      }
      for (const [x, y] of [[-4.5, 8], [0, 8], [4.5, 8], [-4.5, 14], [4.5, 14], [0, 16]]) {
        const w = new THREE.Shape();
        const pts = pointedArch(1.4, y + 1.2, 0.8, 6);
        w.moveTo(-0.7, y - 1.2);
        for (const [ax, ay] of pts) w.lineTo(ax, ay);
        w.lineTo(0.7, y - 1.2);
        w.closePath();
        const wg = new THREE.ShapeGeometry(w, 6);
        B.add(wg, (x + y) % 3 === 0 ? amat('#0c0a0a', { rough: 1 }) : ember, null, { matrix: place(x, 0, kz + 6.02) });
        wg.dispose();
      }
    }
    // Hills beyond, dark against the storm.
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2 + rnd() * 0.2;
      const r = 70 + rnd() * 40;
      const h = 10 + rnd() * 22;
      const g = new THREE.ConeGeometry(18 + rnd() * 20, h, 8);
      B.add(g, amat('#1a1c20', { pat: APAT.rock, param: 3, rough: 1 }), null, { matrix: place(Math.sin(a) * r, h / 2 - 2, Math.cos(a) * r, 0, rnd() * 3, 0) });
      g.dispose();
    }
    // Graves outside the breach.
    for (let k = 0; k < 14; k++) {
      const a = 2.1 + (rnd() - 0.5) * 0.9;
      const r = WALL_R + 5 + rnd() * 12;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (k % 3 === 0) {
        B.box(0.16, 1.4, 0.16, stoneDark, place(x, 0.7, z, (rnd() - 0.5) * 0.3, rnd(), (rnd() - 0.5) * 0.3));
        B.box(0.8, 0.16, 0.16, stoneDark, place(x, 1.05, z, 0, rnd(), 0));
      } else B.box(0.7, 0.9 + rnd() * 0.4, 0.2, stoneDark, place(x, 0.45, z, (rnd() - 0.5) * 0.4, rnd() * 3, (rnd() - 0.5) * 0.2));
    }

    // --- Braziers, statues, a well, a dead tree, banners, rubble ------------------------
    const brazier = (x, z) => {
      B.lathe([[0.001, 0], [0.45, 0], [0.38, 0.15], [0.1, 0.35], [0.08, 1.1], [0.2, 1.2], [0.6, 1.55], [0.62, 1.6], [0.001, 1.6]], iron, place(x, 0, z), 12);
      const coals = new THREE.CircleGeometry(0.55, 14);
      B.add(coals, ember, null, { matrix: place(x, 1.58, z, -Math.PI / 2, 0, 0) });
      coals.dispose();
      this.braziers.push(new THREE.Vector3(x, 1.7, z));
      this.solids.push([x, z, 0.55]);
    };
    brazier(-7.5, 7.5);
    brazier(7.5, 7.5);
    brazier(-9, -8);
    brazier(9, -8);
    const statue = (x, z, rot, headless) => {
      B.box(1.6, 1.4, 1.6, stoneDark, place(x, 0.7, z, 0, rot, 0));
      B.lathe([[0.001, 0], [0.55, 0], [0.5, 1.0], [0.42, 1.6], [0.5, 2.2], [0.3, 2.45], [0.001, 2.5]], stone, place(x, 1.4, z, 0, rot, 0), 12);
      if (!headless) B.lathe([[0.001, 0], [0.2, 0.05], [0.24, 0.3], [0.001, 0.45]], stone, place(x, 3.9, z, 0, rot, 0), 10);
      // A greatsword held point-down before it.
      B.box(0.08, 2.4, 0.3, stone, place(x + Math.sin(rot) * 0.7, 1.5 + 1.2, z + Math.cos(rot) * 0.7, 0, rot, 0));
      B.box(0.7, 0.1, 0.12, stone, place(x + Math.sin(rot) * 0.7, 3.2, z + Math.cos(rot) * 0.7, 0, rot, 0));
      this.solids.push([x, z, 1.1]);
    };
    statue(-12.5, -2, Math.PI / 2, true);
    statue(12.5, 2, -Math.PI / 2, false);
    // The well.
    {
      const x = 11;
      const z = 11;
      B.lathe([[1.2, 0], [1.2, 0.9], [1.0, 0.9], [1.0, 0.1], [0.001, 0.1]], stone, place(x, 0, z), 18);
      for (const s of [-1, 1]) B.box(0.2, 2.6, 0.2, wood, place(x + s * 1.0, 1.3, z));
      B.box(2.4, 0.2, 0.2, wood, place(x, 2.5, z));
      B.cylinder(0.12, 0.12, 1.8, wood, place(x, 2.1, z, 0, 0, Math.PI / 2), 8);
      this.solids.push([x, z, 1.4]);
    }
    // A dead tree, crooked and bare.
    {
      const x = -12;
      const z = 10;
      const branch = (p0, dir, len, r, depth) => {
        const pts = [p0.clone()];
        const d = dir.clone();
        for (let i = 1; i <= 5; i++) {
          d.add(new THREE.Vector3((rnd() - 0.5) * 0.35, (rnd() - 0.4) * 0.2, (rnd() - 0.5) * 0.35)).normalize();
          pts.push(pts[i - 1].clone().addScaledVector(d, len / 5));
        }
        const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, r, 6, false);
        B.add(g, bark, null, {});
        g.dispose();
        if (depth > 0) {
          for (let k = 0; k < 2 + (depth > 1 ? 1 : 0); k++) {
            const at = pts[2 + Math.floor(rnd() * 3)];
            const nd = d.clone().add(new THREE.Vector3((rnd() - 0.5) * 1.5, rnd() * 0.6, (rnd() - 0.5) * 1.5)).normalize();
            branch(at, nd, len * 0.6, r * 0.55, depth - 1);
          }
        }
      };
      branch(new THREE.Vector3(x, -0.2, z), new THREE.Vector3(0.1, 1, 0.05).normalize(), 5.5, 0.32, 3);
      this.solids.push([x, z, 0.6]);
    }
    // Banner poles with torn banners.
    this.banners = [];
    for (const [x, z, hex] of [[-5, -14, '#5a1510'], [5, -14, '#5a1510'], [-15, 5, '#1c2a44'], [15, -5, '#1c2a44']]) {
      B.cylinder(0.08, 0.1, 7, wood, place(x, 3.5, z), 8);
      B.cylinder(0.05, 0.05, 1.8, wood, place(x + 0.9, 6.8, z, 0, 0, Math.PI / 2), 6);
      const g = new THREE.PlaneGeometry(1.7, 3.8, 8, 12);
      B.add(g, cloth(hex), null, { matrix: place(x + 0.9, 6.8 - 1.9, z, 0, Math.PI / 2 * (x > 0 ? -1 : 1) * 0 , 0), uvFn: (p, u, v) => [u * 1.7, (1 - v) * 3.8] });
      g.dispose();
      this.solids.push([x, z, 0.3]);
    }
    // Fallen masonry across the courtyard.
    for (let k = 0; k < 24; k++) {
      const a = rnd() * Math.PI * 2;
      const r = FLOOR_R - 3 + rnd() * 6;
      const s = 0.3 + rnd() * 0.6;
      B.box(s * 1.8, s, s * 1.1, rnd() < 0.5 ? stone : stoneDark, place(Math.sin(a) * r, s * 0.4, Math.cos(a) * r, rnd() * 0.4, rnd() * 6, rnd() * 0.4));
    }

    this.arenaMat = this.makeMaterial();
    this.group.add(B.mesh(this.arenaMat));

    // --- The storm sky and the rain -----------------------------------------------------
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { uTime: this.shared.uTime, uMoon: { value: MOON.clone() }, uFlash: { value: this.flash } },
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      side: THREE.BackSide,
      depthWrite: false,
      depthFunc: THREE.LessEqualDepth,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), this.skyMat);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = 20;
    this.group.add(this.sky);
    const N = 4200;
    const seeds = new Float32Array(N * 2 * 3);
    const ends = new Float32Array(N * 2);
    const r = mulberry32(5);
    for (let i = 0; i < N; i++) {
      const sx = r();
      const sy = r();
      const sz = r();
      seeds.set([sx, sy, sz, sx, sy, sz], i * 6);
      ends[i * 2] = 0;
      ends[i * 2 + 1] = 1;
    }
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    rg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    rg.setAttribute('aEnd', new THREE.BufferAttribute(ends, 1));
    this.rainMat = new THREE.ShaderMaterial({
      uniforms: { uTime: this.shared.uTime, uCam: { value: new THREE.Vector3() }, uWind: { value: new THREE.Vector2(3, 1) }, uColor: { value: new THREE.Color(0.55, 0.6, 0.75) }, uFlashLight: this.shared.uFlashLight },
      vertexShader: rainVert,
      fragmentShader: rainFrag,
      ...alphaBlend,
    });
    this.rain = new THREE.LineSegments(rg, this.rainMat);
    this.rain.frustumCulled = false;
    this.rain.renderOrder = 29;
    this.group.add(this.rain);
  }

  enter(restart = false) {
    if (!restart) this.boss.startIntro();
    this.flash.w = 0;
    this.pendingThunder.length = 0;
    this.strikeT = 2.5;
  }

  introEvents(t, hud) {
    if (t > 0.6 && !this.saidTitle) {
      this.saidTitle = true;
      hud.card('The Ruined Bastion', 'Someone still holds these walls', 3.6);
    }
    if (t < 0.1) this.saidTitle = false;
    if (t > 2.9 && !this.introBolt) {
      this.introBolt = true;
      this.lightning(null, 1.4);
    }
    if (t < 0.1) this.introBolt = false;
  }

  update(dt, time) {
    const fx = this.fx;
    const rnd = this.rand;
    const cam = this.g.rig.camera.position;
    this.sky.position.copy(cam);
    this.rainMat.uniforms.uCam.value.copy(cam);
    const w = this.g.wind;
    this.rainMat.uniforms.uWind.value.set(w.dir.x * (2 + w.strength * 3), w.dir.y * (2 + w.strength * 3));
    this.lightDir.copy(MOON);
    this.shared.uSunDisc.value.copy(MOON);
    this.flash.w = Math.max(0, this.flash.w - dt * 3.5);
    // Distant lightning now and then; closer, more often, as the fight goes on.
    this.strikeT -= dt;
    if (this.strikeT <= 0) {
      this.strikeT = (this.boss && this.boss.phase === 2 ? 2.5 : 4.5) + rnd() * 6;
      this.lightning(null, 0.8 + rnd() * 0.6);
    }
    for (let i = this.pendingThunder.length - 1; i >= 0; i--) {
      const th = this.pendingThunder[i];
      th.t -= dt;
      if (th.t <= 0) {
        this.g.audio?.play('thunder');
        this.pendingThunder.splice(i, 1);
      }
    }
    // Braziers: guttering flames, sparks torn off in the wind; two light the yard.
    const L = this.lights;
    this.braziers.forEach((b, k) => {
      if (rnd() < dt * 26) this.fire(b.x, b.y, b.z, 0.9);
      if (rnd() < dt * 6) fx.add.emit(b.x, b.y + 0.6, b.z, { vel: [w.dir.x * 2 + (rnd() - 0.5), 1.5, w.dir.y * 2 + (rnd() - 0.5)], life: 1.6, size: [0.04, 0.02], color: [4, 1.5, 0.3, 1], color1: [1, 0.2, 0.02, 0], drag: 0.3, kind: PK.ember });
    });
    const P = this.g.player.pos;
    let best = [0, 1];
    const d = this.braziers.map((b) => b.distanceToSquared(P));
    best = d.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(0, 2);
    best.forEach((i, s) => {
      const b = this.braziers[i];
      const f = 0.8 + 0.2 * Math.sin(time * 11 + i) * Math.sin(time * 6.3 + i * 2);
      L.set(1 + s, b.x, b.y + 0.4, b.z, 11, 3.6 * f, 1.5 * f, 0.4 * f);
    });
    // Rain spattering on the stones about us.
    const n = Math.round(dt * 160);
    for (let k = 0; k < n; k++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 12;
      fx.add.emit(cam.x + Math.sin(a) * r, 0.03, cam.z + Math.cos(a) * r, { vel: [(rnd() - 0.5) * 0.8, 1.2 + rnd(), (rnd() - 0.5) * 0.8], life: 0.22, size: [0.035, 0.02], color: [0.5, 0.55, 0.7, 0.8], color1: [0.3, 0.33, 0.4, 0], gravity: 9.8, drag: 0.2, kind: PK.soft });
    }
  }

  onPhase2() {
    this.lightning(null, 2);
  }
}
