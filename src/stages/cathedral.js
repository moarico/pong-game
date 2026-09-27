import * as THREE from 'three';
import { Stage } from '../stage.js';
import { ArenaBuilder, amat, APAT, makeArenaMaterial, place, pointedArch } from '../arenamat.js';
import { common, sharedUniforms, atmosphere, lights } from '../glsl.js';
import { clampRect, pushOutCircle, cameraInCircle } from '../ground.js';
import { PK, additive } from '../vfx.js';
import { mulberry32 } from '../noise.js';
import { Maw } from './maw.js';
import { WATER_Y, HALF_W, PILLAR_X, PILLAR_Z, CRYPT_Z, END_Z, ENTRY_Z, edgeZ, floorHeight, PILLARS } from './nave.js';

// ---------------------------------------------------------------------------
// The Sunken Cathedral. A gothic nave half-drowned: the floor lies under a
// hand's depth of still green water, and beyond the last pillars it breaks
// away into a flooded crypt where something waits. Light falls from a great
// rose window over the drowned apse, from lancets high in the clerestory and
// from a few candles someone still keeps lit.
// ---------------------------------------------------------------------------

const SPRING = 8.2; // arcade springing
const ARCH_TOP = 12.2;
const CLEAR_TOP = 18.5; // top of the clerestory wall
const VAULT_TOP = 24;
const AISLE_TOP = 10.8;
const ROSE = new THREE.Vector3(0, 15.5, END_Z + 0.3);
const ROSE_R = 5.4;

// ---------------------------------------------------------------------------
// The water: shallow and clear over the flagstones, black over the crypt.
// It mirrors the windows and the candles, and rings spread where anything
// breaks it.
// ---------------------------------------------------------------------------

const waterVert = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const waterFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
${lights}
uniform vec4 uRipples[16]; // x, z, start time, strength
uniform vec4 uGlowPos[6]; // windows mirrored in the water: xyz, size
uniform vec3 uGlowCol[6];
uniform float uLevel;
uniform float uCalm;
varying vec3 vWorld;

float edgeZ(float x) {
  return -8.2 + 0.55 * sin(x * 1.1 + 0.4) + 0.35 * sin(x * 2.9 + 2.1) + 0.2 * sin(x * 6.3);
}

void main() {
  vec3 toCam = cameraPosition - vWorld;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  float floorY = vWorld.z < edgeZ(vWorld.x) ? -7.5 : 0.0;
  float depth = vWorld.y - floorY;
  // Slow swell and fine ripples, calmer as they fade with distance.
  vec2 p = vWorld.xz;
  vec2 g = vec2(0.0);
  g += vec2(cos(p.x * 0.9 + uTime * 0.7), sin(p.y * 0.8 - uTime * 0.6)) * 0.012;
  g += vec2(sin(p.y * 2.3 + uTime * 1.3 + p.x), cos(p.x * 2.1 - uTime * 1.1)) * 0.008;
  float fade = 1.0 - smoothstep(10.0, 45.0, dist);
  g += (vec2(vnoise(p * 3.1 + uTime * 0.3), vnoise(p * 3.1 - uTime * 0.27 + 7.0)) - 0.5) * 0.05 * fade;
  // Rings from footsteps, splashes, tentacles.
  for (int i = 0; i < 16; i++) {
    vec4 r = uRipples[i];
    if (r.w <= 0.0) continue;
    float age = uTime - r.z;
    if (age < 0.0 || age > 4.0) continue;
    vec2 d = p - r.xy;
    float len = length(d);
    float front = age * 2.4;
    float x = len - front;
    float env = exp(-x * x * 5.0) * exp(-age * 1.1) * r.w;
    g += (d / max(len, 1e-3)) * cos(x * 11.0) * env * 0.35;
  }
  g *= uCalm;
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  float NdV = max(dot(N, V), 1e-3);
  vec3 R = reflect(-V, N);
  float F = 0.02 + 0.98 * pow(1.0 - NdV, 5.0);
  // The hall mirrored: dark stone, the windows and flames as bright smears.
  vec3 refl = mix(uEnvGround, uEnvSky, smoothstep(-0.2, 0.5, R.y)) * 0.8;
  for (int i = 0; i < 6; i++) {
    vec4 gp = uGlowPos[i];
    if (gp.w <= 0.0) continue;
    vec3 d = gp.xyz - vWorld;
    float l = length(d);
    float c = dot(R, d / l);
    float w = gp.w / l;
    refl += uGlowCol[i] * smoothstep(1.0 - w * w * 0.9, 1.0, c) * 1.2;
  }
  for (int i = 0; i < 3; i++) {
    vec4 L = uPtPos[i];
    if (L.w <= 0.0) continue;
    vec3 d = L.xyz - vWorld;
    float l = length(d);
    float c = max(dot(R, d / l), 0.0);
    refl += uPtCol[i].rgb * pow(c, 900.0 / (1.0 + l * 0.1)) * 1.5 / (1.0 + l * 0.08);
  }
  float murk = 1.0 - exp(-max(depth, 0.0) * 1.3);
  vec3 body = mix(vec3(0.02, 0.06, 0.055), vec3(0.002, 0.009, 0.012), smoothstep(0.3, 3.0, depth));
  body *= uAmbSky * 4.0 + pointLights(vWorld - vec3(0.0, 0.3, 0.0), vec3(0.0, 1.0, 0.0), V, vec3(0.3, 0.5, 0.45), 1.0, 0.5) * 0.25;
  vec3 col = mix(body, refl, F) + refl * 0.03;
  // Scum and floating petals of algae in the still corners.
  float scum = smoothstep(0.62, 0.8, vnoise(p * 0.45) * 0.6 + vnoise(p * 1.7) * 0.4) * 0.35;
  col = mix(col, vec3(0.05, 0.07, 0.04) * (uAmbSky * 3.0 + 0.2), scum * (1.0 - F));
  col = applyFog(col, vWorld);
  float alpha = mix(0.5, 0.97, murk);
  alpha = max(alpha, F);
  gl_FragColor = vec4(col, alpha);
}
`;

// ---------------------------------------------------------------------------

export class CathedralStage extends Stage {
  constructor(game, manager) {
    super(game, manager);
    this.id = 'cathedral';
    this.title = 'The Sunken Cathedral';
    this.spawn = { x: 0, z: 16.5, yaw: Math.PI };
    this.camDist = 1.4;
    this.pitchBias = -0.1;
    this.lighting = {
      sunDir: [0.08, 0.52, -0.85],
      lightDir: [0, 0.32, -0.95],
      sun: [0.5, 1.0, 0.95].map((v) => v * 1.25),
      ambSky: [0.07, 0.15, 0.17],
      ambGround: [0.025, 0.045, 0.045],
      fog: [0.03, 0.075, 0.08],
      fogSun: [0.35, 0.8, 0.72],
      fogDensity: 0.022,
      fogFalloff: 0.03,
      mist: [0.22, 1.1],
      envSky: [0.12, 0.3, 0.3],
      envGround: [0.02, 0.05, 0.05],
      rays: 0.55,
      flare: 0.6,
      bloom: 0.09,
      key: 0.16,
      range: [0.1, 6],
      wind: 0.15,
    };
    const self = this;
    this.floor = {
      height: floorHeight,
      clamp(pos, vel) {
        clampRect(pos, vel, -HALF_W + 0.7, HALF_W - 0.7, -30, ENTRY_Z - 0.8);
        const ez = edgeZ(pos.x) + 0.45;
        if (pos.z < ez) {
          pos.z = ez;
          if (vel.z < 0) vel.z = 0;
        }
        for (const [x, z, r] of PILLARS) pushOutCircle(pos, vel, x, z, r + 0.35);
        self.boss?.clampPlayer?.(pos, vel);
      },
      camera(aim, pos) {
        cameraInCircle(aim, pos, 0, -3, 60, PILLARS.map(([x, z, r]) => [x, z, r + 0.35]));
        pos.x = Math.max(-HALF_W + 0.6, Math.min(HALF_W - 0.6, pos.x));
        pos.z = Math.min(ENTRY_Z - 0.5, pos.z);
        pos.y = Math.min(pos.y, VAULT_TOP - 3);
      },
    };
    this.intro = {
      dur: 9.5,
      keys: [
        { t: 0, pos: [0, 19, 20], look: [0, 12, -10], fov: 52 },
        { t: 3.2, pos: [3.5, 11, 6], look: [0, 8, -20], fov: 50 },
        { t: 5.2, pos: [2.2, 3.2, -1], look: [0, 3.5, -15], fov: 46 },
        { t: 7.6, pos: [-3, 2.2, 3], look: [0, 5.5, -14], fov: 50 },
        { t: 9.5, pos: [1.2, 3.2, 21], look: [0, 3.5, 8], fov: 46 },
      ],
    };
    this.preview = { pos: [3.2, 2.6, 14.5], look: [-0.6, 5.2, -12], fov: 50 };
    this.rand = mulberry32(31);
    this.ripples = Array.from({ length: 16 }, () => new THREE.Vector4());
    this.rippleNext = 0;
    this.lastStep = new THREE.Vector3();
    this.dripT = 0;
    this.moteT = 0;
    this.flames = [];
    this.windowPos = ROSE;
  }

  makeBoss() {
    return new Maw(this.g, this);
  }

  // Rings on the water at (x, z).
  ripple(x, z, strength = 1) {
    const r = this.ripples[this.rippleNext];
    this.rippleNext = (this.rippleNext + 1) % this.ripples.length;
    r.set(x, z, this.shared.uTime.value, strength);
  }

  splash(x, z, s = 1, y = WATER_Y) {
    this.ripple(x, z, Math.min(1.5, s));
    const fx = this.fx;
    fx.smoke.burst(x, y + 0.2, z, Math.round(6 + s * 8), { vel: [0, 2.2 * s, 0], scatter: 1.4 * s, life: 0.9, size: [0.35 * s, 1.2 * s], color: [0.85, 1.0, 0.98, 0.5], color1: [0.7, 0.85, 0.85, 0], drag: 1.8, gravity: 1.5, kind: PK.smoke }, 0.4 * s);
    fx.add.burst(x, y + 0.3, z, Math.round(4 + s * 5), { vel: [0, 2.5 * s, 0], scatter: 1.2 * s, life: 0.5, size: [0.4 * s, 0.9 * s], color: [0.25, 0.4, 0.38, 0.6], color1: [0.1, 0.18, 0.17, 0], drag: 2, gravity: 2, kind: PK.soft }, 0.3 * s);
    fx.add.burst(x, y + 0.1, z, Math.round(14 + s * 20), { vel: [0, 4.5 * s, 0], scatter: 2.2 * s, scatterY: 0.6, life: 0.8, size: [0.06, 0.03], color: [0.5, 0.8, 0.75, 1], color1: [0.2, 0.4, 0.4, 0], drag: 0.6, gravity: 9.8, kind: PK.soft }, 0.3);
  }

  onImpact(x, z, s) {
    this.splash(x, z, 0.5 + s * 0.6);
  }

  build() {
    const B = new ArenaBuilder();
    const rnd = mulberry32(7);
    const stone = amat('#6f7a74', { pat: APAT.ashlar, param: 0.52, rough: 0.9 });
    const pillarStone = amat('#77807a', { pat: APAT.ashlar, param: 0.42, rough: 0.88 });
    const trim = amat('#5d6560', { rough: 0.8, bump: 1 });
    const flags = amat('#5a625c', { pat: APAT.flags, param: 1.25, rough: 0.8 });
    const dark = amat('#2b312f', { pat: APAT.ashlar, param: 0.6, rough: 0.95 });
    const wood = amat('#3b2a1c', { pat: APAT.wood, param: 0.2, rough: 0.8 });
    const iron = amat('#2a2826', { pat: APAT.iron, rough: 0.6, metal: 0.7 });
    const wax = amat('#d9ccb0', { rough: 0.6 });
    const gold = amat('#a8843c', { pat: APAT.gold, rough: 0.35, metal: 1 });
    const glassBlue = amat('#4f86b8', { pat: APAT.glass, param: 3.2, rough: 0.3 });
    const glassRose = amat('#7fb6c4', { pat: APAT.glass, param: 8.5, rough: 0.3 });
    const cloth = (hex) => amat(hex, { pat: APAT.banner, param: 4.2, rough: 0.95, bump: 0 });

    // --- The floor, its broken edge, the crypt below ---------------------------------
    const rows = [];
    const cols = 52;
    for (let j = 0; j <= 30; j++) {
      const ring = [];
      for (let i = 0; i <= cols; i++) {
        const x = -HALF_W + (i / cols) * HALF_W * 2;
        const z0 = edgeZ(x);
        const z = z0 + (ENTRY_Z - z0) * (j / 30);
        ring.push(new THREE.Vector3(x, 0, z));
      }
      rows.push(ring);
    }
    B.grid(rows, flags, null, { closed: false, outward: () => new THREE.Vector3(0, 1, 0), uvFn: (u, v, arc, along) => [arc, along] });
    // The broken lip: a ragged face dropping into the dark water.
    const lip = [];
    for (let k = 0; k <= 3; k++) {
      const ring = [];
      for (let i = 0; i <= cols * 2; i++) {
        const x = -HALF_W + (i / (cols * 2)) * HALF_W * 2;
        const y = -k * 0.9;
        ring.push(new THREE.Vector3(x, y, edgeZ(x) - k * 0.15 - (k ? rnd() * 0.25 : 0)));
      }
      lip.push(ring);
    }
    B.grid(lip, dark, null, { closed: false, outward: () => new THREE.Vector3(0, 0, -1) });
    // Slabs that slid into the crypt.
    for (let i = 0; i < 16; i++) {
      const x = (rnd() - 0.5) * 22;
      const z = edgeZ(x) - 0.4 - rnd() * 3.5;
      B.box(0.9 + rnd() * 1.4, 0.3, 0.8 + rnd() * 1.1, flags, place(x, -0.4 - rnd() * 1.5, z, (rnd() - 0.5) * 0.9, rnd() * 3, (rnd() - 0.5) * 0.9));
    }
    // The crypt floor and walls far below.
    B.box(HALF_W * 2, 0.5, 20, dark, place(0, -7.8, -18));

    // --- Clustered pillars -------------------------------------------------------------
    const pillar = (x, z, h, y0 = 0) => {
      B.lathe([[0.001, 0], [1.35, 0], [1.35, 0.35], [1.15, 0.45], [1.15, 0.75], [1.0, 0.85], [0.9, 1.0], [0.001, 1.0]], trim, place(x, y0, z), 8);
      const sh = h - 1.6 - y0;
      B.cylinder(0.72, 0.72, sh, pillarStone, place(x, y0 + 1.0 + sh / 2, z), 16);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
        const r = k % 2 ? 0.2 : 0.16;
        B.cylinder(r, r, sh, pillarStone, place(x + Math.cos(a) * 0.76, y0 + 1.0 + sh / 2, z + Math.sin(a) * 0.76), 8);
      }
      // Capital: a bell of stone leaves under a square abacus.
      B.lathe([[0.001, 0], [0.8, 0], [0.95, 0.25], [1.2, 0.55], [1.25, 0.62], [0.001, 0.62]], trim, place(x, h - 0.62, z), 16);
      B.box(2.6, 0.28, 2.6, trim, place(x, h + 0.14, z));
    };
    for (const [x, z] of PILLARS) pillar(x, z, SPRING);
    for (const z of CRYPT_Z) for (const s of [-1, 1]) pillar(s * PILLAR_X, z, SPRING, -4);

    // --- Arcades, clerestory and aisle walls --------------------------------------------
    // Side wall above the arcade, following the arches, pierced by pairs of lancets.
    const sideWall = (side) => {
      const zs = [ENTRY_Z, ...PILLAR_Z, ...CRYPT_Z, END_Z];
      const shape = new THREE.Shape();
      shape.moveTo(ENTRY_Z, SPRING);
      // Along the bottom: an arch between each pair of supports.
      for (let i = 0; i < zs.length - 1; i++) {
        const za = zs[i];
        const zb = zs[i + 1];
        const w = za - zb - 1.4;
        const mid = (za + zb) / 2;
        const arch = pointedArch(w, SPRING, ARCH_TOP - SPRING, 8);
        shape.lineTo(za - 0.7, SPRING);
        for (const [ax, ay] of arch) shape.lineTo(mid - ax, ay);
        shape.lineTo(zb + 0.7, SPRING);
      }
      shape.lineTo(END_Z, CLEAR_TOP + 0.5);
      shape.lineTo(ENTRY_Z, CLEAR_TOP + 0.5);
      shape.lineTo(ENTRY_Z, SPRING);
      // Clerestory lancets: two per bay.
      for (let i = 0; i < zs.length - 1; i++) {
        const mid = (zs[i] + zs[i + 1]) / 2;
        for (const o of [-1.25, 1.25]) {
          const hole = new THREE.Path();
          const lw = 1.3;
          const pts = pointedArch(lw, 16.4, 1.4, 6);
          hole.moveTo(mid + o - lw / 2, 13.2);
          for (const [ax, ay] of pts) hole.lineTo(mid + o + ax, ay);
          hole.lineTo(mid + o + lw / 2, 13.2);
          hole.closePath();
          shape.holes.push(hole);
        }
      }
      const g = new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: false, curveSegments: 6 });
      // Shape x runs along world z; extrude along world x.
      const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(side, 0, 0));
      m.setPosition(side * (PILLAR_X - 0.55), 0, 0);
      if (side < 0) m.multiply(new THREE.Matrix4().makeScale(1, 1, 1));
      B.add(g, stone, null, { matrix: m, uvFn: (p, u, v) => [u, v] });
      g.dispose();
      // Glass in the lancets.
      for (let i = 0; i < zs.length - 1; i++) {
        const mid = (zs[i] + zs[i + 1]) / 2;
        for (const o of [-1.25, 1.25]) {
          const s = new THREE.Shape();
          const lw = 1.3;
          const pts = pointedArch(lw, 16.4, 1.4, 6);
          s.moveTo(-lw / 2, 13.2);
          for (const [ax, ay] of pts) s.lineTo(ax, ay);
          s.lineTo(lw / 2, 13.2);
          s.closePath();
          const gg = new THREE.ShapeGeometry(s, 6);
          const mm = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -side), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-side, 0, 0));
          mm.setPosition(side * (PILLAR_X - 0.55 + 0.55), 0, mid + o);
          B.add(gg, glassBlue, null, { matrix: mm, uvFn: (p, u, v) => [p.x + 3, p.y] });
          gg.dispose();
        }
      }
    };
    sideWall(1);
    sideWall(-1);
    // String course and the ledge along the top of the arcade.
    for (const side of [-1, 1]) {
      B.box(1.5, 0.3, ENTRY_Z - END_Z, trim, place(side * PILLAR_X, 12.9, (ENTRY_Z + END_Z) / 2));
      B.box(1.5, 0.3, ENTRY_Z - END_Z, trim, place(side * PILLAR_X, CLEAR_TOP + 0.4, (ENTRY_Z + END_Z) / 2));
    }

    // Outer aisle walls with tall lancets, one per bay.
    for (const side of [-1, 1]) {
      const shape = new THREE.Shape();
      shape.moveTo(ENTRY_Z, 0);
      shape.lineTo(END_Z, 0);
      shape.lineTo(END_Z, AISLE_TOP + 1);
      shape.lineTo(ENTRY_Z, AISLE_TOP + 1);
      shape.closePath();
      const zs = [ENTRY_Z, ...PILLAR_Z, ...CRYPT_Z, END_Z];
      const wins = [];
      for (let i = 0; i < zs.length - 1; i++) {
        const mid = (zs[i] + zs[i + 1]) / 2;
        const lw = 1.7;
        const hole = new THREE.Path();
        const pts = pointedArch(lw, 7.6, 1.8, 6);
        hole.moveTo(mid - lw / 2, 2.6);
        for (const [ax, ay] of pts) hole.lineTo(mid + ax, ay);
        hole.lineTo(mid + lw / 2, 2.6);
        hole.closePath();
        shape.holes.push(hole);
        wins.push(mid);
      }
      const g = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false, curveSegments: 6 });
      const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(side, 0, 0));
      m.setPosition(side * HALF_W, 0, 0);
      B.add(g, stone, null, { matrix: m });
      g.dispose();
      for (const mid of wins) {
        const s = new THREE.Shape();
        const lw = 1.7;
        const pts = pointedArch(lw, 7.6, 1.8, 6);
        s.moveTo(-lw / 2, 2.6);
        for (const [ax, ay] of pts) s.lineTo(ax, ay);
        s.lineTo(lw / 2, 2.6);
        s.closePath();
        const gg = new THREE.ShapeGeometry(s, 6);
        const mm = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -side), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-side, 0, 0));
        mm.setPosition(side * (HALF_W + 0.5), 0, mid);
        B.add(gg, glassBlue, null, { matrix: mm, uvFn: (p, u, v) => [p.x + 7, p.y] });
        gg.dispose();
        // A mullion down the middle.
        B.box(0.12, 6.6, 0.18, trim, place(side * (HALF_W + 0.35), 5.9, mid));
      }
      // The aisle's low vault, a flat ceiling on ribs.
      B.box(HALF_W - PILLAR_X, 0.5, ENTRY_Z - END_Z, dark, place(side * (PILLAR_X + HALF_W) / 2, AISLE_TOP + 0.25, (ENTRY_Z + END_Z) / 2));
      for (const z of [...PILLAR_Z, ...CRYPT_Z]) B.box(HALF_W - PILLAR_X, 0.35, 0.5, trim, place(side * (PILLAR_X + HALF_W) / 2, AISLE_TOP - 0.15, z));
      // Engaged half-columns on the outer wall.
      for (const z of [...PILLAR_Z, ...CRYPT_Z]) B.cylinder(0.45, 0.45, AISLE_TOP, pillarStone, place(side * (HALF_W - 0.1), AISLE_TOP / 2, z), 10);
    }

    // --- The high vault: pointed barrel bays, transverse and diagonal ribs -------------
    const vaultY = (x) => {
      // Pointed profile across the nave from springing CLEAR_TOP to VAULT_TOP.
      const w = PILLAR_X * 2;
      const rise = VAULT_TOP - CLEAR_TOP;
      const r = (w * w * 0.25 + rise * rise) / w;
      const cx = w / 2 - r; // centre of the arc for the right half (mirrored)
      const ax = Math.abs(x);
      const dx = ax - cx;
      return CLEAR_TOP + Math.sqrt(Math.max(r * r - dx * dx, 0));
    };
    const vrows = [];
    for (let j = 0; j <= 40; j++) {
      const z = ENTRY_Z + (END_Z - ENTRY_Z) * (j / 40);
      const ring = [];
      for (let i = 0; i <= 24; i++) {
        const x = -PILLAR_X + (i / 24) * PILLAR_X * 2;
        ring.push(new THREE.Vector3(x, vaultY(x) + 0.3, z));
      }
      vrows.push(ring);
    }
    B.grid(vrows, stone, null, { closed: false, outward: () => new THREE.Vector3(0, -1, 0) });
    const ribPts = (fn, n = 24) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
    const rib = (pts, r) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const g = new THREE.TubeGeometry(curve, pts.length * 2, r, 6, false);
      B.add(g, trim, null, { uvFn: (p, u, v) => [u * 10, v] });
      g.dispose();
    };
    for (const z of [...PILLAR_Z, ENTRY_Z - 0.2, ...CRYPT_Z, END_Z + 0.4]) {
      rib(ribPts((u) => new THREE.Vector3(-PILLAR_X + u * PILLAR_X * 2, vaultY(-PILLAR_X + u * PILLAR_X * 2), z)), 0.28);
    }
    const tz = [ENTRY_Z, ...PILLAR_Z, ...CRYPT_Z, END_Z];
    for (let i = 0; i < tz.length - 1; i++) {
      const za = tz[i];
      const zb = tz[i + 1];
      for (const s of [-1, 1]) {
        rib(ribPts((u) => {
          const x = s * (-PILLAR_X + u * PILLAR_X * 2);
          return new THREE.Vector3(x, vaultY(x) - 0.05, za + (zb - za) * u);
        }), 0.18);
      }
      // A carved boss where the ribs cross.
      B.lathe([[0.001, 0.25], [0.5, 0.15], [0.55, 0], [0.3, -0.3], [0.001, -0.35]], gold, place(0, VAULT_TOP - 0.05, (za + zb) / 2), 12);
    }
    // Wall-shafts rising from each capital to the vault.
    for (const [x, z] of PILLARS) B.cylinder(0.22, 0.22, CLEAR_TOP - SPRING, pillarStone, place(x - Math.sign(x) * 0.6, (CLEAR_TOP + SPRING) / 2 + 0.2, z), 8);

    // --- The end wall: the rose window over two lancets --------------------------------
    {
      const shape = new THREE.Shape();
      shape.moveTo(-HALF_W, -8);
      shape.lineTo(HALF_W, -8);
      shape.lineTo(HALF_W, AISLE_TOP + 1);
      shape.lineTo(PILLAR_X, AISLE_TOP + 1);
      shape.lineTo(PILLAR_X, CLEAR_TOP);
      for (let i = 0; i <= 20; i++) {
        const x = PILLAR_X - (i / 20) * PILLAR_X * 2;
        shape.lineTo(x, vaultY(x) + 0.4);
      }
      shape.lineTo(-PILLAR_X, AISLE_TOP + 1);
      shape.lineTo(-HALF_W, AISLE_TOP + 1);
      shape.closePath();
      const hole = new THREE.Path();
      hole.absarc(0, ROSE.y, ROSE_R, 0, Math.PI * 2, false);
      shape.holes.push(hole);
      for (const x of [-3.6, 3.6]) {
        const h = new THREE.Path();
        const lw = 2.2;
        const pts = pointedArch(lw, 8.5, 2.2, 6);
        h.moveTo(x - lw / 2, 1.2);
        for (const [ax, ay] of pts) h.lineTo(x + ax, ay);
        h.lineTo(x + lw / 2, 1.2);
        h.closePath();
        shape.holes.push(h);
      }
      const g = new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false, curveSegments: 24 });
      B.add(g, stone, null, { matrix: place(0, 0, END_Z - 1.4) });
      g.dispose();
      // Rose glass and its tracery: spokes, rings of roundels.
      const disc = new THREE.CircleGeometry(ROSE_R, 48);
      B.add(disc, glassRose, null, { matrix: place(0, ROSE.y, END_Z - 0.9), uvFn: (p, u, v) => [p.x * 0.8 + 5, p.y * 0.8 + 5] });
      disc.dispose();
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        B.box(0.16, ROSE_R * 2, 0.3, trim, place(0, ROSE.y, END_Z - 0.75, 0, 0, a));
      }
      B.torus(ROSE_R, 0.22, trim, place(0, ROSE.y, END_Z - 0.75), 8, 64);
      B.torus(ROSE_R * 0.42, 0.16, trim, place(0, ROSE.y, END_Z - 0.75), 8, 40);
      B.torus(0.7, 0.14, trim, place(0, ROSE.y, END_Z - 0.75), 8, 24);
      for (let k = 0; k < 16; k++) {
        const a = ((k + 0.5) / 16) * Math.PI * 2;
        B.torus(0.62, 0.09, trim, place(Math.cos(a) * ROSE_R * 0.72, ROSE.y + Math.sin(a) * ROSE_R * 0.72, END_Z - 0.74), 6, 18);
      }
      for (const x of [-3.6, 3.6]) {
        const s = new THREE.Shape();
        const lw = 2.2;
        const pts = pointedArch(lw, 8.5, 2.2, 6);
        s.moveTo(-lw / 2, 1.2);
        for (const [ax, ay] of pts) s.lineTo(ax, ay);
        s.lineTo(lw / 2, 1.2);
        s.closePath();
        const gg = new THREE.ShapeGeometry(s, 6);
        B.add(gg, glassBlue, null, { matrix: place(x, 0, END_Z - 0.9), uvFn: (p, u, v) => [p.x + x, p.y] });
        gg.dispose();
        B.box(0.14, 9.2, 0.2, trim, place(x, 5.6, END_Z - 0.75));
      }
      // An altar table half drowned beneath the rose.
      B.box(4.2, 1.1, 1.6, trim, place(0, -0.3, END_Z + 2.6));
      B.box(4.6, 0.2, 1.9, gold, place(0, 0.35, END_Z + 2.6));
    }

    // --- The west wall behind the samurai, its great doors shut -------------------------
    {
      const shape = new THREE.Shape();
      shape.moveTo(-HALF_W, 0);
      shape.lineTo(HALF_W, 0);
      shape.lineTo(HALF_W, AISLE_TOP + 1);
      shape.lineTo(PILLAR_X, AISLE_TOP + 1);
      shape.lineTo(PILLAR_X, CLEAR_TOP);
      for (let i = 0; i <= 20; i++) {
        const x = PILLAR_X - (i / 20) * PILLAR_X * 2;
        shape.lineTo(x, vaultY(x) + 0.4);
      }
      shape.lineTo(-PILLAR_X, AISLE_TOP + 1);
      shape.lineTo(-HALF_W, AISLE_TOP + 1);
      shape.closePath();
      const g = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false, curveSegments: 8 });
      B.add(g, stone, null, { matrix: place(0, 0, ENTRY_Z) });
      g.dispose();
      // Doors: planked, iron-strapped, set in a deep pointed portal.
      const door = new THREE.Shape();
      const dp = pointedArch(4.4, 4.5, 2.6, 8);
      door.moveTo(-2.2, 0);
      for (const [ax, ay] of dp) door.lineTo(ax, ay);
      door.lineTo(2.2, 0);
      door.closePath();
      const dg = new THREE.ShapeGeometry(door, 8);
      B.add(dg, wood, null, { matrix: place(0, 0, ENTRY_Z - 0.05, 0, Math.PI, 0), uvFn: (p, u, v) => [p.y, p.x + 3] });
      dg.dispose();
      for (const y of [1.2, 3.0, 5.0]) B.box(4.2, 0.14, 0.08, iron, place(0, y, ENTRY_Z - 0.1));
      for (let k = 0; k < 4; k++) {
        const arch = pointedArch(5.2 + k * 0.5, 4.5, 2.9 + k * 0.25, 10).map(([x, y]) => new THREE.Vector3(x, y, ENTRY_Z - 0.2 - k * 0.1));
        rib(arch, 0.14);
      }
    }

    // --- Props: pews, candelabras, statues, rubble, banners, weed -----------------------
    const pew = (x, z, rotY, tilt = 0) => {
      const m = place(x, 0, z, tilt, rotY, 0);
      const part = (w, h, d, px, py, pz) => B.box(w, h, d, wood, m.clone().multiply(place(px, py, pz)));
      part(3.2, 0.08, 0.5, 0, 0.48, 0);
      part(3.2, 0.7, 0.07, 0, 0.9, -0.24);
      part(0.08, 1.1, 0.6, -1.55, 0.55, -0.02);
      part(0.08, 1.1, 0.6, 1.55, 0.55, -0.02);
    };
    for (let k = 0; k < 7; k++) {
      const side = k % 2 ? 1 : -1;
      const z = 17 - k * 3.4 + (rnd() - 0.5);
      if (z < -5) continue;
      pew(side * (10.4 + rnd() * 0.6), z, Math.PI / 2 + (rnd() - 0.5) * 0.4, rnd() < 0.3 ? 0.5 : 0);
    }
    pew(-4.8, 19.2, 0.25, 0);
    pew(5.2, 19.6, -0.3, 1.3);
    this.floaters = [];
    // Pews and planks adrift over the crypt, bobbing (built separately so they can move).
    for (let k = 0; k < 4; k++) {
      const F = new ArenaBuilder();
      const m = new THREE.Matrix4();
      F.box(3.2, 0.08, 0.5, wood, m.clone().multiply(place(0, 0.48, 0)));
      F.box(3.2, 0.7, 0.07, wood, m.clone().multiply(place(0, 0.9, -0.24)));
      F.box(0.08, 1.1, 0.6, wood, m.clone().multiply(place(-1.55, 0.55, 0)));
      const mesh = F.mesh(this.arenaMat || (this.arenaMat = this.makeMaterial()));
      const x = (k - 1.5) * 5 + (rnd() - 0.5) * 2;
      const z = -13 - rnd() * 9;
      mesh.position.set(x, -0.35, z);
      mesh.rotation.set(Math.PI * 0.5 * (k % 2), rnd() * 6, 0.2);
      this.group.add(mesh);
      this.floaters.push({ mesh, x, z, ph: rnd() * 6, rot: mesh.rotation.clone() });
    }
    // Candelabras by the doors: tall iron stands, a crown of candles.
    this.candles = [];
    const candelabra = (x, z) => {
      B.lathe([[0.001, 0], [0.45, 0], [0.4, 0.12], [0.12, 0.3], [0.08, 0.5], [0.08, 2.2], [0.14, 2.3], [0.1, 2.4], [0.001, 2.4]], iron, place(x, 0, z), 10);
      B.torus(0.42, 0.035, iron, place(x, 2.35, z, Math.PI / 2, 0, 0), 6, 24);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        const cx = x + Math.cos(a) * 0.42;
        const cz = z + Math.sin(a) * 0.42;
        const h = 0.18 + rnd() * 0.22;
        B.cylinder(0.045, 0.05, h, wax, place(cx, 2.4 + h / 2, cz), 8);
        this.candles.push(new THREE.Vector3(cx, 2.43 + h, cz));
      }
      B.cylinder(0.05, 0.05, 0.3, wax, place(x, 2.55, z), 8);
      this.candles.push(new THREE.Vector3(x, 2.73, z));
    };
    candelabra(-4.6, 17.8);
    candelabra(4.6, 17.8);
    this.candleLights = [new THREE.Vector3(-4.6, 2.9, 17.8), new THREE.Vector3(4.6, 2.9, 17.8)];
    // Hooded saints in the aisles, up to their knees in water.
    const saint = (x, z, rot) => {
      B.box(1.2, 1.2, 1.2, trim, place(x, 0.6, z, 0, rot, 0));
      B.lathe([[0.001, 0], [0.5, 0], [0.55, 0.9], [0.45, 1.8], [0.34, 2.3], [0.001, 2.3]], pillarStone, place(x, 1.2, z, 0, rot, 0), 14);
      B.lathe([[0.001, 0], [0.26, 0.05], [0.3, 0.3], [0.24, 0.55], [0.001, 0.62]], pillarStone, place(x, 3.45, z, 0, rot, 0), 12);
      B.lathe([[0.001, -0.1], [0.34, 0.0], [0.38, 0.35], [0.28, 0.7], [0.001, 0.78]], dark, place(x, 3.4, z - 0.04, -0.2, rot, 0), 12);
    };
    saint(-11.6, 6, Math.PI / 2);
    saint(11.6, 0, -Math.PI / 2);
    saint(-11.6, -6, Math.PI / 2);
    saint(11.6, 12, -Math.PI / 2);
    // Rubble fallen from the vault.
    for (let k = 0; k < 28; k++) {
      const side = rnd() < 0.5 ? -1 : 1;
      const x = side * (8.6 + rnd() * 3.6);
      const z = -6 + rnd() * 26;
      const s = 0.25 + rnd() * 0.6;
      B.box(s * (1 + rnd()), s * 0.7, s * (1 + rnd()), rnd() < 0.5 ? stone : trim, place(x, s * 0.25, z, rnd(), rnd() * 6, rnd()));
    }
    // A fallen section of rib lying across the nave by the crypt.
    B.cylinder(0.3, 0.3, 5.5, trim, place(-5, 0.25, -4.6, 0, 0.5, Math.PI / 2), 8);
    // Banners hanging from the ledge: faded, torn.
    for (const [x, z, hex] of [[-PILLAR_X + 0.9, 12, '#5a1f1c'], [PILLAR_X - 0.9, 6, '#1f3350'], [-PILLAR_X + 0.9, 0, '#26402f'], [PILLAR_X - 0.9, -6, '#5a1f1c']]) {
      const g = new THREE.PlaneGeometry(1.5, 4.6, 6, 12);
      const side = Math.sign(x);
      B.add(g, cloth(hex), null, { matrix: place(x, 12.6 - 2.3, z, 0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0), uvFn: (p, u, v) => [u * 1.5, (1 - v) * 4.6] });
      g.dispose();
      B.cylinder(0.05, 0.05, 1.8, iron, place(x, 12.62, z, Math.PI / 2, 0, 0), 6);
    }
    // Weed trailing from the arches and down the pillars.
    const weed = amat('#1d2e1c', { rough: 0.7, trans: 0.3 });
    for (let k = 0; k < 26; k++) {
      const [px, pz] = PILLARS[Math.floor(rnd() * PILLARS.length)];
      const a = rnd() * Math.PI * 2;
      const top = 2 + rnd() * 6;
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const y = top - i * (top / 8) * 0.9;
        pts.push(new THREE.Vector3(px + Math.cos(a) * 0.95 + Math.sin(i * 1.3 + k) * 0.08, y, pz + Math.sin(a) * 0.95 + Math.cos(i * 1.1 + k) * 0.08));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const g = new THREE.TubeGeometry(curve, 12, 0.03 + rnd() * 0.03, 4, false);
      B.add(g, weed, null, {});
      g.dispose();
    }

    this.arenaMat = this.arenaMat || this.makeMaterial();
    const mesh = B.mesh(this.arenaMat);
    this.group.add(mesh);

    // The chandelier: an iron ring on chains, swaying over the nave.
    const C = new ArenaBuilder();
    C.torus(2.1, 0.07, iron, place(0, 0, 0, Math.PI / 2, 0, 0), 6, 40);
    C.torus(1.4, 0.05, iron, place(0, 0.25, 0, Math.PI / 2, 0, 0), 6, 32);
    this.chandelierCandles = [];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const lit = k % 3 !== 2;
      C.cylinder(0.04, 0.045, 0.22, wax, place(Math.cos(a) * 2.1, 0.13, Math.sin(a) * 2.1), 6);
      if (lit) this.chandelierCandles.push(new THREE.Vector3(Math.cos(a) * 2.1, 0.27, Math.sin(a) * 2.1));
    }
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      const top = new THREE.Vector3(0, 5.5, 0);
      const bot = new THREE.Vector3(Math.cos(a) * 2.1, 0, Math.sin(a) * 2.1);
      const g = new THREE.TubeGeometry(new THREE.LineCurve3(bot, top), 1, 0.025, 4, false);
      C.add(g, iron, null, {});
      g.dispose();
    }
    const cg = new THREE.CylinderGeometry(0.03, 0.03, 20, 4);
    C.add(cg, iron, null, { matrix: place(0, 15.5, 0) });
    cg.dispose();
    this.chandelier = C.mesh(this.arenaMat);
    this.chandelier.position.set(0, 12.5, 7);
    this.group.add(this.chandelier);

    // --- The water ---------------------------------------------------------------------
    this.waterMat = new THREE.ShaderMaterial({
      uniforms: {
        ...this.shared,
        uRipples: { value: this.ripples },
        uGlowPos: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
        uGlowCol: { value: Array.from({ length: 6 }, () => new THREE.Vector3()) },
        uLevel: { value: WATER_Y },
        uCalm: { value: 1 },
      },
      vertexShader: waterVert,
      fragmentShader: waterFrag,
      transparent: true,
      depthWrite: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const gp = this.waterMat.uniforms.uGlowPos.value;
    const gc = this.waterMat.uniforms.uGlowCol.value;
    gp[0].set(ROSE.x, ROSE.y, ROSE.z, ROSE_R * 0.9);
    gc[0].set(1.4, 2.6, 2.5);
    gp[1].set(-3.6, 5, END_Z, 1.2);
    gc[1].set(0.5, 1.0, 1.4);
    gp[2].set(3.6, 5, END_Z, 1.2);
    gc[2].set(0.5, 1.0, 1.4);
    gp[3].set(-HALF_W, 5, 6, 0.9);
    gc[3].set(0.3, 0.6, 0.9);
    gp[4].set(HALF_W, 5, 0, 0.9);
    gc[4].set(0.3, 0.6, 0.9);
    const wg = new THREE.PlaneGeometry(HALF_W * 2, ENTRY_Z - END_Z, 1, 1);
    wg.rotateX(-Math.PI / 2);
    this.water = new THREE.Mesh(wg, this.waterMat);
    this.water.position.set(0, WATER_Y, (ENTRY_Z + END_Z) / 2);
    this.water.renderOrder = 10;
    this.water.frustumCulled = false;
    this.group.add(this.water);
  }

  makeMaterial() {
    return makeArenaMaterial(this.shared, { floorY: 0, waterY: WATER_Y, caustic: [0.25, 0.55, 0.5] });
  }

  enter(restart = false) {
    if (!restart) this.boss.startIntro();
    this.waterMat.uniforms.uCalm.value = 1;
    this.lastStep.copy(this.g.player.pos);
    for (const r of this.ripples) r.w = 0;
    this.level = WATER_Y;
  }

  introEvents(t, hud) {
    if (t > 0.6 && !this.saidTitle) {
      this.saidTitle = true;
      hud.card('The Sunken Cathedral', 'Something stirs beneath the nave', 3.6);
    }
    if (t < 0.1) this.saidTitle = false;
  }

  update(dt, time) {
    const cam = this.g.rig.camera;
    // Light shafts stream from the rose window toward wherever we stand.
    this.lightDir.subVectors(ROSE, cam.position).normalize();
    this.shared.uSunDisc.value.copy(this.lightDir);
    // Candles: steady flames with the odd gutter.
    const L = this.lights;
    const flick = (k) => 0.85 + 0.15 * Math.sin(time * 13 + k * 7) * Math.sin(time * 7.3 + k * 3);
    const cl = this.candleLights;
    L.set(1, cl[0].x, cl[0].y, cl[0].z, 9, 2.6 * flick(1), 1.3 * flick(1), 0.45);
    L.set(2, cl[1].x, cl[1].y, cl[1].z, 9, 2.6 * flick(2), 1.3 * flick(2), 0.45);
    const fx = this.fx;
    const rnd = this.rand;
    // Flames on every candle.
    this.flameT = (this.flameT || 0) + dt;
    if (this.flameT > 0.05) {
      this.flameT = 0;
      for (const c of this.candles) {
        fx.add.emit(c.x + (rnd() - 0.5) * 0.01, c.y + 0.02, c.z + (rnd() - 0.5) * 0.01, { vel: [0, 0.35, 0], life: 0.28, size: [0.07, 0.03], color: [2.6, 1.2, 0.35, 1], color1: [1.4, 0.35, 0.08, 0], drag: 1, kind: PK.flame });
      }
      const ch = this.chandelier;
      for (const c of this.chandelierCandles) {
        const w = c.clone().applyMatrix4(ch.matrixWorld);
        fx.add.emit(w.x, w.y + 0.02, w.z, { vel: [0, 0.3, 0], life: 0.26, size: [0.07, 0.03], color: [2.4, 1.1, 0.3, 1], color1: [1.2, 0.3, 0.06, 0], drag: 1, kind: PK.flame });
      }
    }
    // The chandelier sways on its chains.
    this.chandelier.rotation.z = Math.sin(time * 0.35) * 0.03;
    this.chandelier.rotation.x = Math.sin(time * 0.27 + 1) * 0.025;
    this.chandelier.rotation.y = time * 0.02;
    // Adrift over the crypt.
    for (const f of this.floaters) {
      f.mesh.position.y = this.level - 0.45 + Math.sin(time * 0.8 + f.ph) * 0.05;
      f.mesh.rotation.x = f.rot.x + Math.sin(time * 0.6 + f.ph) * 0.05;
      f.mesh.rotation.z = f.rot.z + Math.cos(time * 0.5 + f.ph) * 0.05;
    }
    // Dust in the light, slow as snow.
    this.moteT += dt;
    while (this.moteT > 0.045) {
      this.moteT -= 0.045;
      const x = (rnd() - 0.5) * 20;
      const z = -18 + rnd() * 36;
      const y = 1 + rnd() * 14;
      fx.add.emit(x, y, z, { vel: [(rnd() - 0.5) * 0.08, -0.03 - rnd() * 0.04, (rnd() - 0.5) * 0.08], life: 7, size: [0.03, 0.03], color: [0.5, 0.75, 0.7, 0.9], color1: [0.4, 0.6, 0.55, 0], drag: 0.1, kind: PK.ember });
    }
    // Mist creeping over the water.
    if (rnd() < dt * 6) {
      const x = (rnd() - 0.5) * 24;
      const z = -24 + rnd() * 44;
      fx.smoke.emit(x, WATER_Y + 0.25, z, { vel: [(rnd() - 0.5) * 0.25, 0.02, (rnd() - 0.5) * 0.25], life: 7, size: [1.8, 3.2], color: [0.34, 0.5, 0.48, 0.14], color1: [0.3, 0.45, 0.45, 0], drag: 0.2, kind: PK.smoke });
    }
    // Drips from the vault, each a ring and a tick in the silence.
    this.dripT -= dt;
    if (this.dripT <= 0) {
      this.dripT = 0.25 + rnd() * 0.9;
      const x = (rnd() - 0.5) * 16;
      const z = -16 + rnd() * 34;
      fx.add.emit(x, 18, z, { vel: [0, -2, 0], life: 1.9, size: [0.03, 0.03], color: [0.5, 0.7, 0.7, 0.8], color1: [0.5, 0.7, 0.7, 0.8], drag: 0, gravity: 9.8, kind: PK.soft });
      this.pendingDrips = this.pendingDrips || [];
      this.pendingDrips.push({ x, z, t: 1.85 });
    }
    if (this.pendingDrips) {
      for (let i = this.pendingDrips.length - 1; i >= 0; i--) {
        const d = this.pendingDrips[i];
        d.t -= dt;
        if (d.t <= 0) {
          this.ripple(d.x, d.z, 0.35);
          if (Math.hypot(d.x - cam.position.x, d.z - cam.position.z) < 18) this.g.audio?.play('drip', { pos: { x: d.x, z: d.z } });
          this.pendingDrips.splice(i, 1);
        }
      }
    }
    // Wading: rings spread from his steps.
    const P = this.g.player;
    if (P.grounded && P.pos.distanceTo(this.lastStep) > 0.7) {
      this.lastStep.copy(P.pos);
      this.ripple(P.pos.x, P.pos.z, 0.45);
      if (Math.hypot(P.vel.x, P.vel.z) > 3) fx.add.burst(P.pos.x, WATER_Y + 0.05, P.pos.z, 6, { vel: [P.vel.x * 0.2, 1.4, P.vel.z * 0.2], scatter: 0.7, life: 0.5, size: [0.04, 0.02], color: [0.5, 0.7, 0.66, 0.9], color1: [0.3, 0.45, 0.45, 0], gravity: 9.8, drag: 0.5 }, 0.15);
    }
    if (this.g.combat.body.grounded && this.g.combat.action && this.g.combat.action.name === 'dodge' && !this.dodgeSplash) {
      this.dodgeSplash = true;
      this.splash(P.pos.x, P.pos.z, 0.5);
    } else if (!this.g.combat.action || this.g.combat.action.name !== 'dodge') this.dodgeSplash = false;
    this.water.position.y = this.level;
  }

  onPhase2() {
    this.levelTarget = WATER_Y + 0.12;
  }
}
