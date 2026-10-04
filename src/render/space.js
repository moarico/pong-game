// Second half of the victory cinematic: deep space. The camera pulls back from the Earth
// to reveal a black hole far bigger than the planet, the Earth is torn apart and swallowed,
// then the whole universe explodes. Units: 1 = Earth radius.
import * as THREE from 'three';
import { BlackHole, NOISE_GLSL } from './blackHole.js';

const HB = 20; // event horizon radius (Earth radii)
const OUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;
const EQ_GLSL = /* glsl */ `
  vec2 eqUv(vec3 d) { return vec2(atan(d.x, d.z) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5); }
  vec3 eqDir(vec2 uv) {
    float lon = (uv.x - 0.5) * 6.2831853, lat = (uv.y - 0.5) * 3.1415927;
    return vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  }
`;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Render a procedural equirectangular map into a texture once.
function bake(renderer, w, h, body, type = THREE.UnsignedByteType) {
  const rt = new THREE.WebGLRenderTarget(w, h, { type, depthBuffer: false, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  rt.texture.wrapS = THREE.RepeatWrapping;
  const mat = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `varying vec2 vUv;\n${NOISE_GLSL}\n${EQ_GLSL}\nvoid main() { vec3 dir = eqDir(vUv);\n${body}\n}`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(rt);
  renderer.render(scene, cam);
  renderer.setRenderTarget(prev);
  mat.dispose();
  mesh.geometry.dispose();
  return rt;
}

// R: terrain height, G: dryness, B: clouds, A: city lights
const EARTH_BAKE = /* glsl */ `
  float h = fbm(dir * 1.7 + vec3(3.7, 1.1, 0.0)) * 0.72 + fbm(dir * 6.5 + 7.0) * 0.28;
  float dry = fbm(dir * 3.2 + 11.0);
  float cl = fbm(dir * vec3(2.2, 4.6, 2.2) + 23.0) * 0.75 + fbm(dir * 11.0 + 5.0) * 0.25;
  cl = smoothstep(0.47, 0.7, cl);
  float city = step(0.76, vnoise(dir * 190.0)) * smoothstep(0.35, 0.65, vnoise(dir * 22.0));
  gl_FragColor = vec4(h, dry, cl, city);
`;

// Milky Way, nebulae and unresolved star dust
const SKY_BAKE = /* glsl */ `
  vec3 gN = normalize(vec3(0.25, 0.92, 0.3));
  vec3 gC = normalize(vec3(-0.8, 0.12, 0.55));
  float b = dot(dir, gN);
  float band = exp(-b * b * 14.0);
  float core = pow(max(dot(dir, gC), 0.0), 5.0);
  float n = fbm(dir * 3.0);
  float n2 = fbm(dir * 9.0 + 5.0);
  float dust = smoothstep(0.45, 0.72, fbm(dir * 7.0 + 2.0)) * exp(-b * b * 70.0);
  vec3 mw = vec3(0.5, 0.58, 0.85) * band * (0.25 + n * n2 * 1.6) * 0.5 + vec3(1.0, 0.78, 0.5) * core * band * (0.6 + n) * 1.3;
  mw *= 1.0 - dust * 0.9;
  vec3 neb = vec3(0.5, 0.12, 0.45) * smoothstep(0.58, 0.85, fbm(dir * 1.8 + 9.0)) * 0.22
           + vec3(0.08, 0.28, 0.55) * smoothstep(0.6, 0.88, fbm(dir * 2.4 + 3.0)) * 0.2;
  float sd = pow(hash13(floor(dir * 900.0)), 400.0) * (0.4 + band * 2.0);
  vec3 col = mw + neb + vec3(sd) + vec3(0.002, 0.003, 0.006);
  gl_FragColor = vec4(col, 1.0);
`;

function skyMaterial(tex) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTex: { value: tex },
      uBH: { value: new THREE.Vector3() },
      uBHR: { value: HB },
      uWarp: { value: 0 },
      uFlash: { value: 0 },
      uFlashDir: { value: new THREE.Vector3(0, 0, 1) },
      uSun: { value: new THREE.Vector3(1, 0, 0) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = (modelMatrix * vec4(position, 0.0)).xyz;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex; uniform vec3 uBH, uFlashDir, uSun; uniform float uBHR, uWarp, uFlash;
      varying vec3 vDir;
      ${EQ_GLSL}
      void main() {
        vec3 d = normalize(vDir);
        // gravitational lensing: bend the view ray around the black hole (point-lens model)
        vec3 toB = uBH - cameraPosition;
        float dist = length(toB);
        vec3 b = toB / dist;
        float thH = asin(min(uBHR / dist, 0.999));
        float thE = thH * 1.55;
        float c = clamp(dot(d, b), -1.0, 1.0);
        float th = acos(c);
        vec3 sdir = d;
        if (th > 1e-4 && th < 1.4) {
          float beta = th - thE * thE / th;
          vec3 perp = normalize(d - b * c);
          float ab = min(abs(beta), 3.0);
          sdir = b * cos(ab) + perp * sign(beta) * sin(ab);
        }
        vec3 col;
        if (uWarp > 0.0) {
          // stars streak away from the explosion
          col = vec3(0.0);
          for (int i = 0; i < 6; i++) {
            float k = float(i) / 5.0 * uWarp * 0.5;
            col += texture2D(uTex, eqUv(normalize(mix(sdir, uFlashDir, k)))).rgb;
          }
          col = col / 6.0 * (1.0 + uWarp * 0.8);
        } else {
          col = texture2D(uTex, eqUv(sdir)).rgb;
        }
        float sd = max(dot(d, uSun), 0.0);
        col += vec3(1.0, 0.95, 0.85) * (pow(sd, 3000.0) * 40.0 + pow(sd, 200.0) * 0.6 + pow(sd, 12.0) * 0.04);
        float fl = max(dot(d, uFlashDir), 0.0);
        col += uFlash * vec3(1.0, 0.85, 0.7) * (pow(fl, 60.0) * 3.0 + pow(fl, 10.0) * 0.12) + uFlash * uFlash * uFlash * vec3(0.9, 0.8, 1.0) * 0.6;
        gl_FragColor = vec4(col, 1.0);
        ${OUT}
      }`,
  });
}

const DEFORM_GLSL = /* glsl */ `
  uniform vec3 uAxis; uniform float uStretch;
  // tidal stretching toward the black hole (spaghettification)
  vec3 deform(vec3 p) {
    float x = dot(p, uAxis);
    vec3 perp = p - uAxis * x;
    float k = uStretch;
    float nx = x * (1.0 + k) + max(x, 0.0) * max(x, 0.0) * k * 1.3;
    return uAxis * nx + perp / sqrt(1.0 + k);
  }
  vec3 deformNormal(vec3 n0, vec3 p) {
    vec3 t1 = normalize(cross(n0, abs(n0.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 t2 = cross(n0, t1);
    vec3 pa = deform(normalize(n0 + t1 * 0.01));
    vec3 pb = deform(normalize(n0 + t2 * 0.01));
    return normalize(cross(pa - p, pb - p));
  }
`;

function earthMaterial(map, shared) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uMap: { value: map },
      uSun: { value: new THREE.Vector3(1, 0, 0) },
      uBH: { value: new THREE.Vector3() },
      uBHLight: { value: 0.5 },
      uMelt: { value: 0 },
      uCloudRot: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      ${DEFORM_GLSL}
      varying vec3 vN0; varying vec3 vNW; varying vec3 vW;
      void main() {
        vN0 = normalize(position);
        vec3 p = deform(position);
        vNW = normalize(mat3(modelMatrix) * deformNormal(vN0, p));
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap; uniform vec3 uSun, uBH; uniform float uBHLight, uMelt, uCloudRot, uTime;
      varying vec3 vN0; varying vec3 vNW; varying vec3 vW;
      ${NOISE_GLSL}
      ${EQ_GLSL}
      void main() {
        vec4 m = texture2D(uMap, eqUv(vN0));
        float ca = cos(uCloudRot), sa = sin(uCloudRot);
        vec3 cd = vec3(ca * vN0.x + sa * vN0.z, vN0.y, -sa * vN0.x + ca * vN0.z);
        float cl = texture2D(uMap, eqUv(cd)).b;
        float h = m.r;
        float land = smoothstep(0.522, 0.535, h);
        float lat = abs(vN0.y);
        vec3 ocean = mix(vec3(0.003, 0.012, 0.05), vec3(0.012, 0.06, 0.13), smoothstep(0.42, 0.522, h));
        vec3 green = vec3(0.06, 0.13, 0.035);
        vec3 desert = vec3(0.42, 0.32, 0.17);
        vec3 rock = vec3(0.24, 0.2, 0.16);
        vec3 landCol = mix(green, desert, smoothstep(0.47, 0.62, m.g) * (1.0 - smoothstep(0.45, 0.75, lat)));
        landCol = mix(landCol, rock, smoothstep(0.62, 0.7, h));
        vec3 albedo = mix(ocean, landCol, land);
        float ice = smoothstep(0.8, 0.88, lat + (h - 0.5) * 0.35);
        albedo = mix(albedo, vec3(0.85, 0.9, 0.95), ice);
        vec3 N = normalize(vNW);
        vec3 V = normalize(cameraPosition - vW);
        float sunD = dot(N, uSun);
        float day = smoothstep(-0.1, 0.25, sunD);
        vec3 col = albedo * max(sunD, 0.0) * 1.15;
        vec3 H = normalize(uSun + V);
        col += (1.0 - land) * (1.0 - ice) * pow(max(dot(N, H), 0.0), 120.0) * 0.45 * day * (1.0 - cl);
        col = mix(col, vec3(0.92) * max(sunD, 0.0) * 0.85, cl * 0.85);
        // orange light from the accretion disk
        vec3 Lb = normalize(uBH - vW);
        float bl = max(dot(N, Lb), 0.0);
        col += mix(albedo * 1.5, vec3(0.7), cl * 0.7) * vec3(1.0, 0.5, 0.18) * bl * uBHLight;
        // cities on the night side
        col += vec3(1.0, 0.62, 0.28) * m.a * land * (1.0 - ice) * (1.0 - day) * (1.0 - cl) * 1.4;
        // atmosphere
        float fr = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        col += vec3(0.2, 0.45, 1.0) * fr * (0.1 + day * 0.6);
        // tidal forces crack the crust open
        float crack = 1.0 - abs(fbm3(vN0 * 7.0 + uTime * 0.15) * 2.0 - 1.0);
        crack = pow(crack, 10.0);
        col = mix(col, vec3(2.4, 0.75, 0.15), clamp(crack * uMelt * 3.0, 0.0, 1.0));
        col += vec3(1.2, 0.35, 0.08) * uMelt * uMelt * 0.5;
        gl_FragColor = vec4(col, 1.0);
        ${OUT}
      }`,
  });
}

function atmosphereMaterial(shared) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uSun: { value: new THREE.Vector3(1, 0, 0) }, uFade: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      ${DEFORM_GLSL}
      varying vec3 vNW; varying vec3 vW;
      void main() {
        vec3 n0 = normalize(position);
        vec3 p = deform(position);
        vNW = normalize(mat3(modelMatrix) * deformNormal(n0, p));
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun; uniform float uFade;
      varying vec3 vNW; varying vec3 vW;
      void main() {
        vec3 N = normalize(vNW);
        vec3 V = normalize(cameraPosition - vW);
        float rim = pow(1.0 - max(dot(N, V), 0.0), 4.0);
        float lit = smoothstep(-0.35, 0.4, dot(N, uSun));
        gl_FragColor = vec4(vec3(0.3, 0.6, 1.0) * rim * (0.1 + lit * 1.1) * uFade, 1.0);
        ${OUT}
      }`,
  });
}

function pointsMaterial(additive = true) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScale: { value: 1 }, uAtten: { value: 0 }, uI: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSize; attribute vec3 aCol;
      uniform float uScale, uAtten;
      varying vec3 vCol;
      void main() {
        vCol = aCol;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float s = uAtten > 0.5 ? aSize * uScale / -mv.z : aSize * uScale;
        gl_PointSize = clamp(s, 0.0, 64.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uI;
      varying vec3 vCol;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = exp(-r * r * 4.0) * (1.0 - smoothstep(0.8, 1.0, r));
        gl_FragColor = vec4(vCol * a * uI, 1.0);
        ${OUT}
      }`,
  });
}

function galaxyTexture(seed) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const core = g.createRadialGradient(128, 128, 0, 128, 128, 60);
  core.addColorStop(0, 'rgba(255,240,210,1)');
  core.addColorStop(0.3, 'rgba(255,200,150,0.5)');
  core.addColorStop(1, 'rgba(120,120,200,0)');
  g.fillStyle = core;
  g.fillRect(0, 0, 256, 256);
  const arms = 2 + Math.floor(rnd() * 2);
  for (let i = 0; i < 2600; i++) {
    const arm = i % arms;
    const t = Math.pow(rnd(), 0.7);
    const a = t * 7 + (arm / arms) * Math.PI * 2 + (rnd() - 0.5) * 0.6;
    const r = 8 + t * 110 + (rnd() - 0.5) * 14 * t;
    const x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r;
    const b = (1 - t) * 0.5 + 0.15;
    g.fillStyle = rnd() < 0.15 ? `rgba(255,170,200,${b})` : `rgba(170,200,255,${b})`;
    g.fillRect(x, y, 1.6, 1.6);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function explosionMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uI: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vL; varying vec3 vNW; varying vec3 vW;
      void main() {
        vL = position;
        vNW = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uI;
      varying vec3 vL; varying vec3 vNW; varying vec3 vW;
      ${NOISE_GLSL}
      void main() {
        float f = abs(dot(normalize(vNW), normalize(cameraPosition - vW)));
        float n = fbm3(vL * 4.0 + vec3(0.0, uTime * 1.5, 0.0));
        float edge = pow(1.0 - f, 2.0);
        vec3 col = mix(vec3(1.0, 0.72, 0.4), vec3(1.0, 0.3, 0.08), edge);
        col = mix(col, vec3(0.65, 0.35, 1.0), smoothstep(0.5, 0.8, n) * 0.7);
        gl_FragColor = vec4(col * (0.2 + edge * 1.3) * (0.35 + n) * uI, 1.0);
        ${OUT}
      }`,
  });
}

function shockMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uI: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uI;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float a = smoothstep(0.8, 0.98, r) * (1.0 - smoothstep(0.98, 1.0, r));
        gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * a * a * 1.4 * uI, 1.0);
        ${OUT}
      }`,
  });
}

function raysMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uI: { value: 0 }, uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uI, uTime;
      varying vec2 vP;
      ${NOISE_GLSL}
      void main() {
        float r = length(vP);
        float a = atan(vP.y, vP.x);
        float rays = pow(max(fbm3(vec3(cos(a) * 7.0, sin(a) * 7.0, uTime * 0.5)) - 0.45, 0.0) / 0.55, 2.5) * 4.0;
        float fall = exp(-r * 3.5) * (1.0 - smoothstep(0.4, 0.9, r));
        vec3 col = mix(vec3(1.0, 0.85, 0.6), vec3(0.75, 0.6, 1.0), smoothstep(0.05, 0.4, r));
        gl_FragColor = vec4(col * (rays * fall + exp(-r * 9.0) * 1.5) * uI, 1.0);
        ${OUT}
      }`,
  });
}

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qi = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

function sph(azDeg, elDeg, r) {
  const a = THREE.MathUtils.degToRad(azDeg), e = THREE.MathUtils.degToRad(elDeg);
  return new THREE.Vector3(Math.cos(e) * Math.sin(a) * r, Math.sin(e) * r, Math.cos(e) * Math.cos(a) * r);
}

export class SpaceScene {
  // fx: { flash(color, peak, rise, hold, fall), text(main, sub), sound(name), shake(amount) }
  constructor(renderer, quality, fx) {
    this.fx = fx;
    this.quality = quality;
    const low = quality === 'low';
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.004, 40000);
    this.t = 0;
    this.events = new Set();

    // baked maps
    const high = quality === 'high';
    this.skyRT = bake(renderer, high ? 4096 : 2048, high ? 2048 : 1024, SKY_BAKE, THREE.HalfFloatType);
    this.earthRT = bake(renderer, low ? 1024 : 2048, low ? 512 : 1024, EARTH_BAKE);

    // sky + stars (both follow the camera so they are infinitely far away)
    this.skyGroup = new THREE.Group();
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(9000, 64, 32), skyMaterial(this.skyRT.texture));
    this.sky.renderOrder = -10;
    this.skyGroup.add(this.sky);
    this.scene.add(this.skyGroup);
    {
      const n = low ? 2500 : 6000;
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n);
      const gN = new THREE.Vector3(0.25, 0.92, 0.3).normalize();
      for (let i = 0; i < n; i++) {
        _v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        if (_v.lengthSq() > 1 || _v.lengthSq() < 0.01) { i--; continue; }
        _v.normalize();
        if (i % 3 === 0) _v.addScaledVector(gN, -_v.dot(gN) * 0.9).normalize(); // crowd the galactic plane
        _v.multiplyScalar(8000);
        pos.set([_v.x, _v.y, _v.z], i * 3);
        const temp = Math.random();
        const c = temp < 0.2 ? [1.0, 0.75, 0.55] : temp < 0.7 ? [1.0, 0.96, 0.92] : [0.7, 0.82, 1.0];
        const b = 0.4 + Math.pow(Math.random(), 4) * 2.4;
        col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
        size[i] = 1.2 + Math.pow(Math.random(), 6) * 3.2;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      this.starMat = pointsMaterial();
      this.starMat.uniforms.uScale.value = Math.min(window.devicePixelRatio || 1, 2);
      this.stars = new THREE.Points(g, this.starMat);
      this.stars.renderOrder = -9;
      this.stars.frustumCulled = false;
      this.skyGroup.add(this.stars);
    }

    // distant galaxies
    this.galaxies = [];
    for (let i = 0; i < 9; i++) {
      const mat = new THREE.SpriteMaterial({ map: galaxyTexture(i + 3), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55, rotation: Math.random() * 6.28 });
      const sp = new THREE.Sprite(mat);
      _v.set(Math.random() * 2 - 1, (Math.random() * 2 - 1) * 0.6, Math.random() * 2 - 1).normalize();
      sp.position.copy(_v).multiplyScalar(5200 + Math.random() * 1500);
      const s = 260 + Math.random() * 380;
      sp.scale.set(s, s * (0.35 + Math.random() * 0.65), 1);
      sp.userData = { base: sp.position.clone(), s: sp.scale.clone() };
      sp.renderOrder = -8;
      this.scene.add(sp);
      this.galaxies.push(sp);
    }

    // black hole
    this.bh = new BlackHole({ jets: true, segments: low ? 0.6 : 1 });
    this.bh.group.scale.setScalar(HB);
    this.bh.group.rotation.set(-0.04, 0, 0.07);
    this.scene.add(this.bh.group);

    // shot layout: the wide shot sits 430 out from the hole, the Earth 60 in front of the camera
    this.wideCam = sph(38, 8, 430);
    const toBH = _v.copy(this.wideCam).negate().normalize();
    const right = new THREE.Vector3().crossVectors(toBH, UP).normalize();
    const camUp = new THREE.Vector3().crossVectors(right, toBH).normalize();
    this.wideLook = new THREE.Vector3().addScaledVector(right, 40).addScaledVector(camUp, 10);
    this.earth0 = this.wideCam.clone().addScaledVector(toBH.clone().addScaledVector(right, -0.34).addScaledVector(camUp, -0.19).normalize(), 60);

    // Earth
    const shared = { uAxis: { value: new THREE.Vector3(1, 0, 0) }, uStretch: { value: 0 } };
    this.earthShared = shared;
    this.earth = new THREE.Group();
    this.earthMat = earthMaterial(this.earthRT.texture, shared);
    this.earthMesh = new THREE.Mesh(new THREE.SphereGeometry(1, low ? 96 : 160, low ? 64 : 120), this.earthMat);
    this.atmoMat = atmosphereMaterial(shared);
    this.atmo = new THREE.Mesh(new THREE.SphereGeometry(1.045, 96, 64), this.atmoMat);
    this.atmo.renderOrder = 2;
    this.earth.add(this.earthMesh, this.atmo);
    this.earth.rotation.z = 0.41; // axial tilt
    this.earth.position.copy(this.earth0);
    this.scene.add(this.earth);
    this.earthAlive = true;

    // light: sun from behind the camera's starting side
    const bDir = this.earth0.clone().negate().normalize(); // Earth -> black hole
    const eRight = new THREE.Vector3().crossVectors(bDir, UP).normalize();
    this.startDir = new THREE.Vector3().addScaledVector(bDir, -0.35).addScaledVector(eRight, -1.0).addScaledVector(UP, 0.32).normalize();
    this.sunDir = new THREE.Vector3().addScaledVector(this.startDir, 1).addScaledVector(bDir, 0.45).addScaledVector(UP, 0.25).normalize();
    this.earthMat.uniforms.uSun.value.copy(this.sunDir);
    this.atmoMat.uniforms.uSun.value.copy(this.sunDir);
    this.sky.material.uniforms.uSun.value.copy(this.sunDir);

    // matter torn off the Earth, spiralling into the hole
    {
      const n = low ? 1400 : 3600;
      this.streamN = n;
      const g = new THREE.BufferGeometry();
      this.sPos = new Float32Array(n * 3);
      this.sCol = new Float32Array(n * 3);
      this.sSize = new Float32Array(n);
      g.setAttribute('position', new THREE.BufferAttribute(this.sPos, 3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('aCol', new THREE.BufferAttribute(this.sCol, 3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('aSize', new THREE.BufferAttribute(this.sSize, 1).setUsage(THREE.DynamicDrawUsage));
      this.streamGeo = g;
      this.streamMat = pointsMaterial();
      this.streamMat.uniforms.uAtten.value = 1;
      this.stream = new THREE.Points(g, this.streamMat);
      this.stream.frustumCulled = false;
      this.stream.renderOrder = 8;
      this.scene.add(this.stream);
      this.parts = [];
      for (let i = 0; i < n; i++) {
        this.parts.push({ alive: false, born: 0, life: 1, off: new THREE.Vector3(), spin: 0, hot: false, size: 1, src: new THREE.Vector3() });
      }
      this.emitAcc = 0;
    }

    // explosion pieces
    this.core = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), explosionMaterial());
    this.core.visible = false;
    this.core.renderOrder = 9;
    this.shock = new THREE.Mesh(new THREE.RingGeometry(0.5, 1, 160, 1), shockMaterial());
    this.shock.rotation.x = -Math.PI / 2;
    this.shock.visible = false;
    this.shock.renderOrder = 9;
    this.rays = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), raysMaterial());
    this.rays.visible = false;
    this.rays.renderOrder = 10;
    this.scene.add(this.core, this.shock, this.rays);
    for (const o of [this.core, this.shock, this.rays]) o.frustumCulled = false;

    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.shakeAmt = 0;
    this.fov = 55;
    this.duration = 19.8;
    this.update(0);
  }

  // where the Earth is at time t (it spirals into the hole during 6..12 s)
  earthAt(t, out) {
    const u = clamp01((t - 6) / 6.2);
    // slow at first, then a fast final plunge
    const f = 0.75 * Math.pow(u, 2.2) + 0.25 * Math.pow(u, 12);
    const r0 = this.earth0.length();
    const r = r0 * Math.pow((HB * 0.25) / r0, f);
    const k = 1 - r / r0;
    const az0 = Math.atan2(this.earth0.x, this.earth0.z);
    const az = az0 + 1.25 * Math.pow(u, 2.6);
    const y = this.earth0.y * (1 - k);
    const h = Math.sqrt(Math.max(0, r * r - y * y));
    return out.set(Math.sin(az) * h, y, Math.cos(az) * h);
  }

  emitStream(dt, t, rate) {
    this.emitAcc += rate * dt;
    const E = this.earth.position;
    for (const p of this.parts) {
      if (this.emitAcc < 1) break;
      if (p.alive) continue;
      this.emitAcc -= 1;
      p.alive = true;
      p.born = t;
      p.life = 2.4 + Math.random() * 2.4;
      // leave from the side facing the hole
      _v.copy(E).negate().normalize();
      _w.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      if (_w.dot(_v) < 0) _w.addScaledVector(_v, -2 * _w.dot(_v));
      _w.lerp(_v, 0.35).normalize();
      p.off.copy(_w).multiplyScalar(1.02 + this.earthShared.uStretch.value * 0.8 * Math.random());
      p.src.copy(E);
      p.spin = 0.9 + Math.random() * 1.2;
      p.hot = Math.random() < 0.55;
      p.size = p.hot ? 0.12 + Math.random() * 0.25 : 0.08 + Math.random() * 0.15;
    }
    if (this.emitAcc > 1) this.emitAcc = 1;
  }

  updateStream(t) {
    const P = this.sPos, C = this.sCol, Z = this.sSize;
    for (let i = 0; i < this.streamN; i++) {
      const p = this.parts[i];
      if (!p.alive) { Z[i] = 0; continue; }
      const u = (t - p.born) / p.life;
      if (u >= 1) { p.alive = false; Z[i] = 0; continue; }
      // start on the (moving) Earth, then fall in along a tightening spiral
      _v.copy(this.earthAlive ? this.earth.position : p.src).add(p.off);
      const r0 = _v.length();
      const k = Math.pow(u, 1.5);
      const r = r0 * (1 - k) + HB * 0.92 * k;
      _w.copy(_v).divideScalar(r0);
      const ang = p.spin * Math.pow(u, 2.2) * 2.2;
      const c = Math.cos(ang), s = Math.sin(ang);
      const x = _w.x * c + _w.z * s, z = -_w.x * s + _w.z * c;
      const y = _w.y * (1 - k);
      const len = Math.hypot(x, y, z);
      P[i * 3] = (x / len) * r; P[i * 3 + 1] = (y / len) * r; P[i * 3 + 2] = (z / len) * r;
      const heat = Math.min(1, u * 1.6);
      const fade = Math.min(1, (1 - u) * 6) * Math.min(1, u * 12);
      if (p.hot) {
        C[i * 3] = (1.6 + heat) * fade; C[i * 3 + 1] = (0.55 + heat * 0.9) * fade; C[i * 3 + 2] = (0.15 + heat * 0.8) * fade;
      } else {
        C[i * 3] = (0.35 + heat * 1.2) * fade; C[i * 3 + 1] = (0.3 + heat * 0.7) * fade; C[i * 3 + 2] = (0.28 + heat * 0.4) * fade;
      }
      Z[i] = p.size * (1 + u * 6) * (0.4 + 0.6 * (r / r0));
    }
    const g = this.streamGeo;
    g.attributes.position.needsUpdate = true;
    g.attributes.aCol.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
  }

  once(name) {
    if (this.events.has(name)) return false;
    this.events.add(name);
    return true;
  }

  // drives the whole space sequence; t = seconds since the cut to space
  update(dt) {
    const t = this.t;
    this.t += dt;
    const fx = this.fx;
    const cam = this.camera;
    const bhU = this.bh.u;

    // ---- Earth motion and tearing
    if (this.earthAlive) {
      this.earthAt(t, this.earth.position);
      this.earth.rotateY(dt * 0.08);
      const r = this.earth.position.length();
      _v.copy(this.earth.position).negate().normalize(); // world dir to the hole
      this.earth.getWorldQuaternion(_q);
      _qi.copy(_q).invert();
      this.earthShared.uAxis.value.copy(_v).applyQuaternion(_qi);
      const st = Math.pow(clamp01((95 - r) / 75), 2) * 7;
      this.earthShared.uStretch.value = st;
      this.earthMat.uniforms.uMelt.value = clamp01((140 - r) / 110);
      this.earthMat.uniforms.uBHLight.value = 0.35 + clamp01((300 - r) / 250) * 1.6;
      this.earthMat.uniforms.uCloudRot.value += dt * 0.03;
      this.earthMat.uniforms.uTime.value = t;
      this.earthMat.uniforms.uBH.value.set(0, 0, 0);
      // swallowed once its centre is well inside the horizon
      if (r < HB * 0.55) {
        this.earthAlive = false;
        this.earth.visible = false;
        fx.flash('#ffd9a8', 0.35, 0.05, 0, 0.6);
        fx.sound('gulp');
      }
    }
    if (t < 12.5) this.emitStream(dt, t, t < 6 ? 260 : 700);
    this.updateStream(t);

    // ---- black hole state
    const unstable = smooth(12.3, 14.0, t);
    bhU.uHot.value = unstable * 0.8;
    bhU.uJet.value = smooth(12.6, 13.4, t) * (1 - smooth(14.2, 14.6, t));
    // keep the disk from flooding the frame when the camera is right next to it
    const near = 0.5 + 0.5 * smooth(70, 220, this.camPos.length());
    bhU.uI.value = (1 + unstable * 0.6 + (t > 12.6 && t < 14 ? Math.sin(t * 40) * 0.15 * unstable : 0)) * near;
    const pulse = 1 + (t > 12.6 && t < 14.0 ? Math.sin(t * 22) * 0.035 * unstable : 0);
    const tB = t - 14.0; // universe explodes
    if (tB > 0) {
      if (this.once('boom')) {
        fx.sound('bigboom');
        fx.flash('#ffffff', 0.55, 0.05, 0.05, 0.8);
        fx.shake(1.5);
        this.core.visible = true;
        this.shock.visible = true;
        this.rays.visible = true;
      }
      bhU.uBurst.value = clamp01(tB / 1.2);
      this.bh.horizon.scale.setScalar(Math.max(0.001, 1 - tB * 3));
      const R = HB * (0.6 + 3.2 * Math.pow(tB, 2.4));
      this.core.scale.setScalar(R);
      this.core.material.uniforms.uTime.value = tB;
      this.core.material.uniforms.uI.value = 0.7 * (1 - smooth(3.5, 5, tB));
      const Rs = HB * (1 + 9 * Math.pow(tB, 1.8));
      this.shock.scale.setScalar(Rs);
      this.shock.material.uniforms.uI.value = 1 - smooth(2.0, 3.4, tB);
      this.rays.material.uniforms.uI.value = smooth(0, 0.15, tB) * (1 - smooth(2.6, 3.4, tB)) * 0.45;
      this.rays.material.uniforms.uTime.value = tB;
      const skyU = this.sky.material.uniforms;
      skyU.uWarp.value = smooth(0.2, 2.6, tB);
      skyU.uFlash.value = smooth(0.8, 3.0, tB);
      for (const g of this.galaxies) {
        const d = g.userData.base.length();
        const hit = clamp01((R - d * 0.15) / (d * 0.3));
        g.position.copy(g.userData.base).multiplyScalar(1 + hit * 0.6);
        g.material.opacity = 0.55 + hit * 2 * (1 - hit);
      }
      if (tB > 2.3 && this.once('white')) fx.flash('#ffffff', 1, 1.0, 99, 1);
      if (tB > 3.4 && this.once('text')) fx.text('final');
    }
    this.bh.group.scale.setScalar(HB * pulse);

    // ---- camera
    const wide = this.wideCam;
    if (t < 6.5) {
      // pull back from the planet until the black hole fills the sky behind it
      const u = easeInOut(clamp01(t / 6.3));
      const d0 = 1.85, d1 = this.wideCam.distanceTo(this.earth0);
      const dist = d0 * Math.pow(d1 / d0, u);
      _w.copy(wide).sub(this.earth0).normalize();
      _v.copy(this.startDir).lerp(_w, smooth(0.15, 1, u)).normalize();
      this.camPos.copy(this.earth0).addScaledVector(_v, dist);
      _w.copy(this.earth0).multiplyScalar(-0.006).add(this.earth0); // a little toward the hole
      this.camLook.copy(_w).lerp(this.wideLook, smooth(0.25, 1, u));
      this.fov = 55;
    } else if (t < 12.4) {
      // ride along with the Earth as it falls in
      const u = smooth(6.3, 7.8, t);
      const E = this.earth.position;
      _v.copy(E).normalize(); // outward
      _w.crossVectors(UP, _v).normalize(); // along the orbit
      const target = this._target || (this._target = new THREE.Vector3());
      target.copy(E).addScaledVector(_v, 7).addScaledVector(_w, -5).addScaledVector(UP, 2.5);
      if (target.length() < HB * 2.2) target.setLength(HB * 2.2);
      this.camPos.lerpVectors(wide, target, u);
      _v.copy(E).multiplyScalar(0.65);
      this.camLook.lerpVectors(this.wideLook, _v, u);
      this.fov = 55 + u * 5;
    } else {
      // back out for the end of everything
      const u = smooth(12.4, 13.8, t);
      if (!this.fromPos) { this.fromPos = this.camPos.clone(); this.fromLook = this.camLook.clone(); this.farPos = sph(30, 9, 640); }
      this.camPos.lerpVectors(this.fromPos, this.farPos, easeInOut(u));
      this.camLook.copy(this.fromLook).multiplyScalar(1 - easeInOut(u));
      this.fov = 60 + smooth(14, 16, t) * 18;
    }
    this.shakeAmt = Math.max(0, this.shakeAmt - dt * 0.5);
    const sh = Math.max(this.shakeAmt, unstable * 0.25) * (t > 17 ? 0 : 1);
    cam.position.copy(this.camPos);
    if (sh > 0) {
      const k = 0.004 * sh * cam.position.distanceTo(this.camLook);
      cam.position.x += (Math.random() - 0.5) * k;
      cam.position.y += (Math.random() - 0.5) * k;
      cam.position.z += (Math.random() - 0.5) * k;
    }
    cam.up.set(0, 1, 0);
    cam.lookAt(this.camLook);
    // the explosion's ray billboard sits on the hole, facing the camera
    this.rays.position.set(0, 0, 0);
    this.rays.quaternion.copy(cam.quaternion);
    this.rays.scale.setScalar(cam.position.length() * 2.2);

    this.skyGroup.position.copy(cam.position);
    const skyU = this.sky.material.uniforms;
    skyU.uBH.value.set(0, 0, 0);
    skyU.uBHR.value = Math.max(0.0001, this.bh.group.scale.x * this.bh.horizon.scale.x);
    skyU.uFlashDir.value.copy(cam.position).negate().normalize();
    this.atmoMat.uniforms.uFade.value = 1;
    this.bh.update(dt, cam);
  }

  get done() { return this.t >= this.duration; }

  dispose() {
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    this.bh.dispose();
    this.skyRT.dispose();
    this.earthRT.dispose();
  }
}
