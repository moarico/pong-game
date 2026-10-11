// Sky for the blocky world: sun, moon, stars and drifting lit clouds over a time-of-day
// cycle. The sky is rendered into a cube map (one face per frame) that is used as the
// scene background, the reflection environment and the colour of distant fog.
import * as THREE from 'three';
import { skyFog } from './blocks.js';

// direction the sun sets in (over the ocean); seen ahead-right from the blue team's end
export const SUNSET_DIR = new THREE.Vector3(-0.55, 0, 0.83).normalize();
const SIDE = new THREE.Vector3().crossVectors(SUNSET_DIR, new THREE.Vector3(0, 1, 0)).normalize();
const UP = new THREE.Vector3(0, 1, 0);
const TILT = THREE.MathUtils.degToRad(32);

export const TIME_PRESETS = { sunset: 17.78, day: 13.2, night: 0.6 };

const NOISE = /* glsl */ `
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 6; i++) { s += a * vnoise(p); p = r * p * 2.02 + 3.1; a *= 0.5; }
    return s;
  }
`;

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonDir: { value: new THREE.Vector3(0, -1, 0) },
      uWind: { value: new THREE.Vector2() },
      uZenith: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uHorizonAway: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
      uSunColor: { value: new THREE.Color() },
      uCloudLit: { value: new THREE.Color() },
      uCloudShadow: { value: new THREE.Color() },
      uCloudAway: { value: new THREE.Color() },
      uCover: { value: 0.35 },
      uNight: { value: 0 },
      uFlash: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDir, uMoonDir, uZenith, uHorizon, uHorizonAway, uGlow, uSunColor, uCloudLit, uCloudShadow, uCloudAway;
      uniform vec2 uWind;
      uniform float uCover, uNight, uFlash;
      varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 sunH = normalize(vec3(uSunDir.x, 0.0, uSunDir.z) + 1e-5);
        float toward = dot(normalize(vec3(d.x, 0.0, d.z) + 1e-5), sunH) * 0.5 + 0.5;
        vec3 horizon = mix(uHorizonAway, uHorizon, pow(toward, 2.2));
        vec3 col = mix(horizon, uZenith, pow(smoothstep(0.0, 0.55, h), 0.5));
        float sd = max(dot(d, uSunDir), 0.0);
        float band = 1.0 - smoothstep(0.0, 0.8, abs(h));
        col += uGlow * (pow(sd, 4.0) * 0.55 * band + pow(sd, 40.0) * 0.35);
        if (h < 0.0) col = mix(col, horizon * 0.4, smoothstep(0.0, -0.25, h));
        // stars
        if (uNight > 0.01 && h > 0.0) {
          vec3 sp = d * 280.0;
          float st = step(0.9972, hash13(floor(sp)));
          col += vec3(st) * uNight * (0.4 + 0.8 * hash13(floor(sp) + 2.3)) * smoothstep(0.02, 0.3, h) * (1.0 - uCover);
        }
        // sun and moon discs
        float sunDisc = smoothstep(0.99955, 0.99975, sd);
        col += uSunColor * (sunDisc * 8.0 + pow(sd, 600.0) * 0.8) * (1.0 - uCover * 0.7);
        float md = max(dot(d, uMoonDir), 0.0);
        col += vec3(0.9, 0.94, 1.0) * (smoothstep(0.99935, 0.99955, md) * 2.4 + pow(md, 300.0) * 0.25) * uNight;
        // clouds on a curved layer
        if (h > -0.02) {
          float hh = max(h, 0.0) + 0.045;
          vec2 p = d.xz / hh * 0.9 + uWind;
          vec2 q = vec2(fbm(p * 0.35 + 1.7), fbm(p * 0.35 + 9.2));
          float n = fbm(p * 0.3 + q * 1.6);
          float cov = mix(0.6, 0.3, uCover);
          float dens = smoothstep(cov, cov + 0.13, n);
          // light: denser cloud between this point and the sun means shadow
          vec2 ps = p + sunH.xz * 0.35;
          float ns = fbm(ps * 0.3 + q * 1.6);
          float shade = smoothstep(cov - 0.02, cov + 0.3, ns) * 0.8 + smoothstep(cov + 0.1, cov + 0.4, n) * 0.35;
          // clouds toward the sun burn gold, the far side of the sky turns pink
          vec3 lit = mix(uCloudAway, uCloudLit, pow(toward, 1.4));
          vec3 cc = mix(lit, uCloudShadow, clamp(shade * 0.85 + uCover * 0.35, 0.0, 1.0));
          float rim = smoothstep(0.0, 0.45, dens) * (1.0 - smoothstep(0.55, 1.0, dens));
          cc += uGlow * rim * pow(sd, 2.0) * 1.4; // bright edges facing the sun
          cc += uCloudLit * pow(toward, 3.0) * 0.35 * (1.0 - clamp(shade, 0.0, 1.0)) * (1.0 - uCover * 0.8);
          cc += uGlow * pow(sd, 6.0) * (1.0 - dens * 0.7) * 1.2;
          cc += uGlow * pow(sd, 3.0) * 0.25;
          float fade = smoothstep(0.0, 0.1, h);
          col = mix(col, cc, dens * mix(0.35, 0.96, fade));
          // high streaky cirrus
          float ci = fbm(vec2(p.x * 0.25, p.y * 1.3) + 4.0);
          col += uCloudLit * smoothstep(0.58, 0.85, ci) * 0.18 * fade * (1.0 - uCover);
        }
        col += vec3(0.75, 0.8, 1.0) * uFlash;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

const C = (h) => new THREE.Color(h);
const PAL = {
  night: { zenith: C(0x040816), horizon: C(0x16223e), away: C(0x0e1830), glow: C(0x000000), sun: C(0x000000), lit: C(0x39436a), shadow: C(0x0b0f1e), litAway: C(0x2c3456) },
  sunset: { zenith: C(0x0a1f5c), horizon: C(0xff8a1e), away: C(0x3a4a8a), glow: C(0xff7a10), sun: C(0xfff2c8), lit: C(0xffa53a), shadow: C(0x2a2650), litAway: C(0xd0707e) },
  day: { zenith: C(0x2a68d4), horizon: C(0xb3d4f0), away: C(0x9cc2ea), glow: C(0xfff0d8), sun: C(0xfff4e0), lit: C(0xffffff), shadow: C(0x8e9cb8), litAway: C(0xf2f4f8) },
};

const _c = new THREE.Color();
function blend(key, w, out) {
  out.setRGB(0, 0, 0);
  for (const k of ['night', 'sunset', 'day']) out.add(_c.copy(PAL[k][key]).multiplyScalar(w[k]));
  return out;
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export class SkySystem {
  constructor(renderer, scene, quality, { time = 'sunset', weather = 'clear' } = {}) {
    this.renderer = renderer;
    this.scene = scene;
    this.cycle = time === 'cycle';
    this.hours = TIME_PRESETS[time] ?? TIME_PRESETS.sunset;
    this.size = quality === 'high' ? 512 : quality === 'medium' ? 256 : 128;
    this.rt = new THREE.WebGLCubeRenderTarget(this.size, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.skyScene = new THREE.Scene();
    this.mat = skyMaterial();
    const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), this.mat);
    box.frustumCulled = false;
    this.skyScene.add(box);
    this.cams = [];
    const dirs = [[1, 0, 0, 0, -1, 0], [-1, 0, 0, 0, -1, 0], [0, 1, 0, 0, 0, 1], [0, -1, 0, 0, 0, -1], [0, 0, 1, 0, -1, 0], [0, 0, -1, 0, -1, 0]];
    for (const [x, y, z, ux, uy, uz] of dirs) {
      const cam = new THREE.PerspectiveCamera(90, 1, 0.1, 10);
      cam.up.set(ux, uy, uz);
      cam.lookAt(x, y, z);
      this.cams.push(cam);
    }
    this.face = 0;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envRT = null;
    this.envTimer = 0;
    this.wind = new THREE.Vector2(Math.random() * 50, Math.random() * 50);
    this.sunDir = new THREE.Vector3();
    this.moonDir = new THREE.Vector3();
    this.lightDir = new THREE.Vector3();
    this.w = { night: 0, sunset: 0, day: 1 };
    this.weather = weather;
    this.cover = 0.35;
    this.flash = 0;
    this.colors = { zenith: new THREE.Color(), horizon: new THREE.Color(), away: new THREE.Color(), sun: new THREE.Color(), glow: new THREE.Color() };
    skyFog.cube.value = this.rt.texture;
    scene.background = this.rt.texture;
    this.compute();
    this.renderAll();
    this.refreshEnv();
  }

  setWeather(cover) { this.cover = cover; }

  compute() {
    const th = ((this.hours - 6) / 12) * Math.PI;
    this.sunDir.copy(SUNSET_DIR).multiplyScalar(-Math.cos(th))
      .addScaledVector(UP, Math.sin(th) * Math.cos(TILT)).addScaledVector(SIDE, Math.sin(th) * Math.sin(TILT)).normalize();
    this.moonDir.copy(this.sunDir).negate().addScaledVector(SIDE, 0.25).normalize();
    const el = THREE.MathUtils.radToDeg(Math.asin(this.sunDir.y));
    const day = smooth(-2, 16, el);
    const sunset = smooth(-8, 1, el) * (1 - smooth(5, 24, el));
    const night = 1 - smooth(-12, -1, el);
    const sum = day + sunset + night || 1;
    this.w.day = day / sum; this.w.sunset = sunset / sum; this.w.night = night / sum;
    this.elevation = el;
    for (const k of ['zenith', 'horizon', 'away', 'sun', 'glow']) blend(k === 'away' ? 'away' : k, this.w, this.colors[k]);
    // the main light follows the sun by day and the moon at night
    if (el > -3) this.lightDir.copy(this.sunDir); else this.lightDir.copy(this.moonDir);
    if (this.lightDir.y < 0.12) { this.lightDir.y = 0.12; this.lightDir.normalize(); }
    const u = this.mat.uniforms;
    u.uSunDir.value.copy(this.sunDir);
    u.uMoonDir.value.copy(this.moonDir);
    u.uZenith.value.copy(this.colors.zenith);
    u.uHorizon.value.copy(this.colors.horizon);
    u.uHorizonAway.value.copy(this.colors.away);
    u.uGlow.value.copy(this.colors.glow);
    u.uSunColor.value.copy(this.colors.sun);
    blend('lit', this.w, u.uCloudLit.value);
    blend('shadow', this.w, u.uCloudShadow.value);
    blend('litAway', this.w, u.uCloudAway.value);
    // overcast skies are greyer and darker
    if (this.cover > 0.62) {
      const k = (this.cover - 0.62) * 2.6;
      const grey = new THREE.Color(0.32, 0.34, 0.38).multiplyScalar(0.3 + this.w.day * 0.9 + this.w.sunset * 0.5);
      for (const c of [u.uZenith.value, u.uHorizon.value, u.uHorizonAway.value, u.uCloudLit.value, u.uCloudAway.value]) c.lerp(grey, k * 0.8);
      u.uCloudShadow.value.multiplyScalar(1 - k * 0.5);
      u.uGlow.value.multiplyScalar(1 - k * 0.8);
    }
    u.uCover.value = this.cover;
    u.uNight.value = this.w.night;
    u.uFlash.value = this.flash;
  }

  renderFace(i) {
    const r = this.renderer;
    const prev = r.getRenderTarget();
    const prevXr = r.xr.enabled;
    r.xr.enabled = false;
    this.rt.texture.generateMipmaps = i === 5;
    r.setRenderTarget(this.rt, i);
    r.render(this.skyScene, this.cams[i]);
    r.setRenderTarget(prev);
    r.xr.enabled = prevXr;
  }

  renderAll() { for (let i = 0; i < 6; i++) this.renderFace(i); }

  refreshEnv() {
    const old = this.envRT;
    this.envRT = this.pmrem.fromCubemap(this.rt.texture);
    this.scene.environment = this.envRT.texture;
    if (old) old.dispose();
  }

  update(dt) {
    if (this.cycle) this.hours = (this.hours + dt * (24 / 480)) % 24; // a full day every 8 minutes
    this.wind.x += dt * 0.012;
    this.wind.y += dt * 0.006;
    this.mat.uniforms.uWind.value.copy(this.wind);
    this.flash = Math.max(0, this.flash - dt * 3);
    this.compute();
    // one cube face per frame keeps the clouds moving at almost no cost
    this.renderFace(this.face);
    this.face = (this.face + 1) % 6;
    this.envTimer += dt;
    if (this.envTimer > (this.cycle ? 2 : 6)) { this.envTimer = 0; this.refreshEnv(); }
  }

  dispose() {
    if (this.scene.background === this.rt.texture) this.scene.background = null;
    if (this.envRT && this.scene.environment === this.envRT.texture) this.scene.environment = null;
    if (skyFog.cube.value === this.rt.texture) skyFog.cube.value = null;
    this.rt.dispose();
    if (this.envRT) this.envRT.dispose();
    this.pmrem.dispose();
    this.mat.dispose();
  }
}
