import * as THREE from 'three';

// HDR post chain: light shafts, bloom, eye adaptation, lens flare, filmic tone map.
// The scene target's alpha channel is an occlusion mask: 0 where open sky lets
// sunlight through, 1 behind anything solid, in between for cloud and seed fluff.

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const lumaFn = /* glsl */ `
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
`;

// Sky near the sun, masked by whatever stands in front of it.
const raysPrefilter = /* glsl */ `
${lumaFn}
uniform sampler2D tScene;
uniform vec2 uSunUV;
uniform float uAspect;
varying vec2 vUv;
void main() {
  vec4 s = texture(tScene, vUv);
  vec3 c = clamp(s.rgb, 0.0, 60.0) * (1.0 - clamp(s.a, 0.0, 1.0));
  vec2 d = (vUv - uSunUV) * vec2(uAspect, 1.0);
  float w = exp(-dot(d, d) * 16.0);
  c *= smoothstep(1.5, 6.0, lum(c)) * w;
  gl_FragColor = vec4(c, 1.0);
}
`;

// Radial blur toward the sun. Run twice with shrinking steps for smooth shafts.
const raysBlur = /* glsl */ `
${lumaFn}
#define SAMPLES 28
uniform sampler2D tSrc;
uniform vec2 uSunUV;
uniform float uStep;
uniform float uDecay;
uniform vec2 uRes;
varying vec2 vUv;
void main() {
  vec2 delta = (uSunUV - vUv) * uStep / float(SAMPLES);
  vec2 uv = vUv + delta * ign(vUv * uRes);
  vec3 sum = vec3(0.0);
  float w = 1.0;
  float wsum = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    sum += texture(tSrc, uv).rgb * w;
    wsum += w;
    w *= uDecay;
    uv += delta;
  }
  gl_FragColor = vec4(sum / wsum, 1.0);
}
`;

// 13-tap downsample (Jimenez 2014). The first level uses a soft Karis average so a
// single glinting pixel cannot make the whole bloom flicker.
const bloomDown = /* glsl */ `
${lumaFn}
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uKaris;
varying vec2 vUv;
vec3 tap(vec2 o) { return clamp(texture(tSrc, vUv + o * uTexel).rgb, 0.0, 80.0); }
float kw(vec3 c) { return mix(1.0, 1.0 / (1.0 + lum(c) * 0.2), uKaris); }
void main() {
  vec3 a = tap(vec2(-2.0, 2.0));
  vec3 b = tap(vec2(0.0, 2.0));
  vec3 c = tap(vec2(2.0, 2.0));
  vec3 d = tap(vec2(-2.0, 0.0));
  vec3 e = tap(vec2(0.0, 0.0));
  vec3 f = tap(vec2(2.0, 0.0));
  vec3 g = tap(vec2(-2.0, -2.0));
  vec3 h = tap(vec2(0.0, -2.0));
  vec3 i = tap(vec2(2.0, -2.0));
  vec3 j = tap(vec2(-1.0, 1.0));
  vec3 k = tap(vec2(1.0, 1.0));
  vec3 l = tap(vec2(-1.0, -1.0));
  vec3 m = tap(vec2(1.0, -1.0));
  vec3 g0 = (a + b + d + e) * 0.25;
  vec3 g1 = (b + c + e + f) * 0.25;
  vec3 g2 = (d + e + g + h) * 0.25;
  vec3 g3 = (e + f + h + i) * 0.25;
  vec3 g4 = (j + k + l + m) * 0.25;
  float w0 = 0.125 * kw(g0);
  float w1 = 0.125 * kw(g1);
  float w2 = 0.125 * kw(g2);
  float w3 = 0.125 * kw(g3);
  float w4 = 0.5 * kw(g4);
  vec3 o = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
  gl_FragColor = vec4(o, 1.0);
}
`;

const bloomUp = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uScale;
varying vec2 vUv;
void main() {
  vec2 d = uTexel;
  vec3 s = texture(tSrc, vUv).rgb * 4.0;
  s += (texture(tSrc, vUv + vec2(-d.x, 0.0)).rgb + texture(tSrc, vUv + vec2(d.x, 0.0)).rgb
      + texture(tSrc, vUv + vec2(0.0, -d.y)).rgb + texture(tSrc, vUv + vec2(0.0, d.y)).rgb) * 2.0;
  s += texture(tSrc, vUv + vec2(-d.x, -d.y)).rgb + texture(tSrc, vUv + vec2(d.x, -d.y)).rgb
     + texture(tSrc, vUv + vec2(-d.x, d.y)).rgb + texture(tSrc, vUv + vec2(d.x, d.y)).rgb;
  gl_FragColor = vec4(s / 16.0 * uScale, 1.0);
}
`;

// Depth of field, prep: half-resolution colour plus signed circle of confusion
// (negative in front of the focus plane, positive behind it; in half-res pixels).
const dofPrep = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform vec2 uClip;
uniform vec3 uDof;
uniform float uMaxBlur;
varying vec2 vUv;
float viewZ(float d) {
  float z = d * 2.0 - 1.0;
  return 2.0 * uClip.x * uClip.y / (uClip.y + uClip.x - z * (uClip.y - uClip.x));
}
void main() {
  vec3 c = texture(tScene, vUv).rgb;
  float z = viewZ(texture(tDepth, vUv).r);
  float f = uDof.x;
  float coc = z > f ? (1.0 - f / z) * uDof.y : -min((f / z - 1.0) * uDof.z, uMaxBlur);
  gl_FragColor = vec4(clamp(c, 0.0, 60.0), coc);
}
`;

// Depth of field, gather: each tap counts where its own blur disc reaches this pixel.
// Foreground blur spills over whatever is behind it; background blur never bleeds
// onto sharper things in front.
const dofGather = /* glsl */ `
${lumaFn}
#define TAU 6.283185307179586
#define TAPS 32
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uMaxBlur;
varying vec2 vUv;
void main() {
  vec4 c0 = texture(tSrc, vUv);
  float nearR = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.7854;
    nearR = max(nearR, -texture(tSrc, vUv + vec2(cos(a), sin(a)) * uMaxBlur * 0.55 * uTexel).a);
  }
  float R = max(abs(c0.a), nearR * 0.75);
  if (R < 0.5) {
    gl_FragColor = vec4(c0.rgb, R);
    return;
  }
  vec3 acc = c0.rgb;
  float wsum = 1.0;
  float rot = ign(gl_FragCoord.xy) * TAU;
  for (int i = 0; i < TAPS; i++) {
    float fi = float(i) + 0.5;
    float r = sqrt(fi / float(TAPS)) * R;
    float a = fi * 2.39996 + rot;
    vec4 s = texture(tSrc, vUv + vec2(cos(a), sin(a)) * r * uTexel);
    float reach = s.a > c0.a + 0.5 ? min(abs(s.a), abs(c0.a)) : abs(s.a);
    float w = smoothstep(r - 1.0, r + 0.5, reach);
    acc += s.rgb * w;
    wsum += w;
  }
  gl_FragColor = vec4(acc / wsum, R);
}
`;

// Eye adaptation plus how much of the sun disc is currently unobstructed.
const exposureFrag = /* glsl */ `
${lumaFn}
uniform sampler2D tLum;
uniform sampler2D tPrev;
uniform sampler2D tScene;
uniform vec2 uSunUV;
uniform float uSunRadius;
uniform float uAspect;
uniform float uDt;
uniform float uInit;
uniform float uKey;
uniform vec2 uRange;
varying vec2 vUv;
void main() {
  float sumL = 0.0;
  float sumW = 0.0;
  for (int y = 0; y < 9; y++) {
    for (int x = 0; x < 13; x++) {
      vec2 uv = (vec2(float(x), float(y)) + 0.5) / vec2(13.0, 9.0);
      float l = clamp(lum(texture(tLum, uv).rgb), 1e-4, 24.0);
      vec2 d = (uv - vec2(0.5, 0.46)) * vec2(1.4, 1.0);
      float w = exp(-dot(d, d) * 2.6);
      sumL += log(l) * w;
      sumW += w;
    }
  }
  float avg = exp(sumL / sumW);
  float target = clamp(uKey / avg, uRange.x, uRange.y);
  float vis = 0.0;
  for (int i = 0; i < 16; i++) {
    float fi = float(i) + 0.5;
    float a = fi * 2.39996;
    float r = sqrt(fi / 16.0) * uSunRadius;
    vis += 1.0 - texture(tScene, uSunUV + vec2(cos(a) / uAspect, sin(a)) * r).a;
  }
  vis /= 16.0;
  vec2 prev = texture(tPrev, vec2(0.5)).rg;
  if (uInit > 0.5) prev = vec2(target, vis);
  float ke = 1.0 - exp(-uDt * (target < prev.x ? 2.2 : 1.3));
  float kv = 1.0 - exp(-uDt * 14.0);
  float e = exp(mix(log(max(prev.x, 1e-4)), log(target), ke));
  gl_FragColor = vec4(e, mix(prev.y, vis, kv), avg, 1.0);
}
`;

const compositeFrag = /* glsl */ `
${lumaFn}
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tRays;
uniform sampler2D tExposure;
uniform sampler2D tDof;
uniform float uDofOn;
uniform vec2 uSunUV;
uniform float uSunOn;
uniform float uAspect;
uniform float uTime;
uniform float uBloom;
uniform float uBloomNorm;
uniform float uRays;
uniform float uFlare;
uniform vec3 uSunTint;
uniform vec2 uRes;
uniform int uDebug;
uniform float uGrain;
varying vec2 vUv;

// ACES fitted (Stephen Hill).
vec3 acesFit(vec3 c) {
  const mat3 inM = mat3(0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777);
  const mat3 outM = mat3(1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602);
  c = inM * c;
  vec3 a = c * (c + 0.0245786) - 0.000090537;
  vec3 b = c * (0.983729 * c + 0.4329510) + 0.238081;
  return clamp(outM * (a / b), 0.0, 1.0);
}

vec3 toSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

float ghost(vec2 p, vec2 c, float r) {
  float d = length(p - c);
  return (1.0 - smoothstep(r * 0.5, r, d)) * (0.5 + 0.5 * smoothstep(r * 0.3, r, d));
}

vec3 lensFlare(vec2 uv) {
  vec2 asp = vec2(uAspect, 1.0);
  vec2 p = (uv - 0.5) * asp;
  vec2 s = (uSunUV - 0.5) * asp;
  vec3 f = vec3(0.0);
  // Faint ghost reflections strung along the line through the lens centre.
  f += vec3(1.0, 0.6, 0.28) * ghost(p, s * -0.24, 0.042) * 0.02;
  f += vec3(0.6, 0.85, 0.5) * ghost(p, s * -0.52, 0.08) * 0.008;
  f += vec3(0.35, 0.55, 1.0) * ghost(p, s * -1.18, 0.15) * 0.006;
  // Starburst and a thin anamorphic streak.
  vec2 d = p - s;
  float r = length(d);
  float ang = atan(d.y, d.x);
  float burst = pow(abs(cos(ang * 3.0 + 0.4)), 60.0) + 0.6 * pow(abs(cos(ang * 4.0 + 1.3)), 90.0);
  f += uSunTint * burst * exp(-r * 7.0) * 0.14;
  f += uSunTint * exp(-abs(d.y) * 260.0) * exp(-abs(d.x) * 2.6) * 0.12;
  return f;
}

void main() {
  vec2 uv = vUv;
  vec2 dc = uv - 0.5;
  // A whisper of lateral chromatic aberration toward the frame edges.
  float ca = dot(dc, dc) * 0.0065;
  vec3 col;
  col.r = texture(tScene, uv - dc * ca).r;
  col.g = texture(tScene, uv).g;
  col.b = texture(tScene, uv + dc * ca).b;
  col = clamp(col, 0.0, 1e4);
  if (uDofOn > 0.5) {
    vec4 dof = texture(tDof, uv);
    col = mix(col, dof.rgb, smoothstep(0.35, 1.2, dof.a));
  }

  vec3 bloom = texture(tBloom, uv).rgb * uBloomNorm;
  vec3 rays = texture(tRays, uv).rgb * uRays;
  if (uDebug == 1) { bloom = col; rays = vec3(0.0); }
  if (uDebug == 2) { col = rays * 4.0; bloom = col; }
  if (uDebug == 3) { col = bloom; }
  col = mix(col, bloom, uBloom);
  col += rays;

  vec3 ex = texture(tExposure, vec2(0.5)).rgb;
  // Debug: raw scene light (a quarter of it, no tone curve), exposure in the corner.
  if (uDebug == 4) {
    vec3 raw = gl_FragCoord.x < 6.0 && gl_FragCoord.y < 6.0 ? vec3(ex.r * 0.5) : col * 0.25;
    gl_FragColor = vec4(toSRGB(clamp(raw, 0.0, 1.0)), 1.0);
    return;
  }
  float sunVis = ex.g * uSunOn;
  col += lensFlare(uv) * uFlare * sunVis;
  // Veiling glare: staring into the sun lifts the blacks, as a real lens does.
  col += uSunTint * 0.012 * sunVis;

  col = acesFit(col * ex.r);

  // Grade: rich, saturated sunset colour with deep, clean shadows.
  float l = lum(col);
  col *= mix(vec3(1.0, 0.98, 1.03), vec3(1.03, 1.0, 0.95), smoothstep(0.05, 0.6, l));
  col = max(mix(vec3(l), col, 1.22), 0.0);
  // A gentle S-curve for contrast (in display space, below).

  vec3 o = toSRGB(col);
  o = mix(o, o * o * (3.0 - 2.0 * o), 0.28);

  vec2 q = dc * vec2(uAspect, 1.0);
  o *= mix(1.0, 1.0 - smoothstep(0.2, 1.2, length(q)), 0.5);
  // Fine grain and dither against banding in the sky (here, or after upscaling).
  float n = ign(gl_FragCoord.xy + fract(uTime * 7.3) * 113.0);
  o += (n - 0.5) * (2.0 / 255.0) * uGrain;
  gl_FragColor = vec4(o, 1.0);
}
`;

// The graded frame, rendered at the internal resolution, drawn to the screen at full
// resolution with a sharp Catmull-Rom filter (clamped to the neighbouring pixels so
// bright edges cannot ring), then grain and dither at screen resolution.
const upscaleFrag = /* glsl */ `
${lumaFn}
uniform sampler2D tSrc;
uniform vec2 uSrcSize;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 pos = vUv * uSrcSize;
  vec2 t1 = floor(pos - 0.5) + 0.5;
  vec2 f = pos - t1;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 inv = 1.0 / uSrcSize;
  vec2 p0 = (t1 - 1.0) * inv;
  vec2 p3 = (t1 + 2.0) * inv;
  vec2 p12 = (t1 + w2 / w12) * inv;
  vec3 c = texture(tSrc, vec2(p12.x, p0.y)).rgb * (w12.x * w0.y)
         + texture(tSrc, vec2(p0.x, p12.y)).rgb * (w0.x * w12.y)
         + texture(tSrc, p12).rgb * (w12.x * w12.y)
         + texture(tSrc, vec2(p3.x, p12.y)).rgb * (w3.x * w12.y)
         + texture(tSrc, vec2(p12.x, p3.y)).rgb * (w12.x * w3.y);
  c /= w12.x * w0.y + w0.x * w12.y + w12.x * w12.y + w3.x * w12.y + w12.x * w3.y;
  // No ringing: stay within the four texels around this point.
  ivec2 i0 = ivec2(t1 - 0.5);
  ivec2 lim = ivec2(uSrcSize) - 1;
  vec3 a = texelFetch(tSrc, clamp(i0, ivec2(0), lim), 0).rgb;
  vec3 b = texelFetch(tSrc, clamp(i0 + ivec2(1, 0), ivec2(0), lim), 0).rgb;
  vec3 d = texelFetch(tSrc, clamp(i0 + ivec2(0, 1), ivec2(0), lim), 0).rgb;
  vec3 e = texelFetch(tSrc, clamp(i0 + ivec2(1, 1), ivec2(0), lim), 0).rgb;
  c = clamp(c, min(min(a, b), min(d, e)), max(max(a, b), max(d, e)));
  float n = ign(gl_FragCoord.xy + fract(uTime * 7.3) * 113.0);
  c += (n - 0.5) * (2.0 / 255.0);
  gl_FragColor = vec4(c, 1.0);
}
`;

export class Post {
  constructor(renderer) {
    this.renderer = renderer;
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.quad = new THREE.Mesh(g);
    this.quad.frustumCulled = false;
    const mat = (fragmentShader, uniforms, extra = {}) => new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
      ...extra,
    });
    this.m = {
      prefilter: mat(raysPrefilter, { tScene: { value: null }, uSunUV: { value: new THREE.Vector2() }, uAspect: { value: 1 } }),
      blur: mat(raysBlur, {
        tSrc: { value: null }, uSunUV: { value: new THREE.Vector2() }, uStep: { value: 1 },
        uDecay: { value: 0.96 }, uRes: { value: new THREE.Vector2() },
      }),
      down: mat(bloomDown, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uKaris: { value: 0 } }),
      // Each wider level adds a little less: a bright core without a veil over everything.
      up: mat(bloomUp, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uScale: { value: 0.7 } }, {
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
      }),
      dofPrep: mat(dofPrep, {
        tScene: { value: null }, tDepth: { value: null }, uClip: { value: new THREE.Vector2(0.1, 1000) },
        uDof: { value: new THREE.Vector3(4, 2, 7) }, uMaxBlur: { value: 12 },
      }),
      dofGather: mat(dofGather, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uMaxBlur: { value: 12 } }),
      exposure: mat(exposureFrag, {
        tLum: { value: null }, tPrev: { value: null }, tScene: { value: null },
        uSunUV: { value: new THREE.Vector2() }, uSunRadius: { value: 0.02 }, uAspect: { value: 1 },
        uDt: { value: 0 }, uInit: { value: 1 }, uKey: { value: 0.2 }, uRange: { value: new THREE.Vector2(0.06, 2.0) },
      }),
      composite: mat(compositeFrag, {
        tScene: { value: null }, tBloom: { value: null }, tRays: { value: null }, tExposure: { value: null },
        uSunUV: { value: new THREE.Vector2() }, uSunOn: { value: 0 }, uAspect: { value: 1 }, uTime: { value: 0 },
        uBloom: { value: 0.06 }, uBloomNorm: { value: 1 }, uRays: { value: 0.26 }, uFlare: { value: 4 },
        uSunTint: { value: new THREE.Color().setRGB(1.0, 0.72, 0.42) }, uRes: { value: new THREE.Vector2() }, uDebug: { value: 0 }, tDof: { value: null }, uDofOn: { value: 0 },
        uGrain: { value: 1 },
      }),
      upscale: mat(upscaleFrag, { tSrc: { value: null }, uSrcSize: { value: new THREE.Vector2() }, uTime: { value: 0 } }),
    };
    this.sunNdc = new THREE.Vector3();
    this.fwd = new THREE.Vector3();
    this.expIndex = 0;
    this.init = true;
    this.time = 0;
    this.targets = null;
    this.focus = 4;
    this.dof = 1;
  }

  rt(w, h, opts = {}) {
    return new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
      ...opts,
    });
  }

  // w, h: the internal resolution everything renders at. outW, outH: the screen's.
  setSize(w, h, msaa, bloomLevels, outW = w, outH = h) {
    if (this.targets) {
      for (const t of this.all) t.dispose();
    }
    const depthTexture = new THREE.DepthTexture(w, h);
    depthTexture.minFilter = THREE.NearestFilter;
    depthTexture.magFilter = THREE.NearestFilter;
    const scene = this.rt(w, h, { depthBuffer: true, samples: msaa, depthTexture });
    const hw = Math.max(1, w >> 1);
    const hh = Math.max(1, h >> 1);
    const raysA = this.rt(hw, hh);
    const raysB = this.rt(hw, hh);
    const dofA = this.rt(hw, hh);
    const dofB = this.rt(hw, hh);
    const bloom = [];
    let bw = w;
    let bh = h;
    for (let i = 0; i < bloomLevels; i++) {
      bw = Math.max(1, bw >> 1);
      bh = Math.max(1, bh >> 1);
      bloom.push(this.rt(bw, bh));
    }
    // Exposure history survives resizes so the image does not flash.
    if (!this.exposure) {
      this.exposure = [this.rt(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }),
        this.rt(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })];
    }
    // Drawn straight to the screen when the sizes match; otherwise graded into an
    // 8-bit frame first and scaled up.
    this.direct = outW === w && outH === h;
    const ldr = this.direct ? null : new THREE.WebGLRenderTarget(w, h, {
      type: THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
    this.targets = { scene, raysA, raysB, bloom, dofA, dofB, ldr };
    this.all = [scene, raysA, raysB, dofA, dofB, ...bloom, ...(ldr ? [ldr] : [])];
    this.msaa = msaa;
    this.outW = outW;
    this.outH = outH;
    this.m.upscale.uniforms.uSrcSize.value.set(w, h);
    this.m.composite.uniforms.uGrain.value = this.direct ? 1 : 0;
    // Blur sizes are authored for a 540-pixel-tall half-resolution buffer.
    this.dofScale = hh / 540;
    this.w = w;
    this.h = h;
    this.m.blur.uniforms.uRes.value.set(hw, hh);
    this.m.composite.uniforms.uRes.value.set(w, h);
    this.m.composite.uniforms.uBloomNorm.value = 1 / bloomLevels;
  }

  pass(material, target) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.quad, this.cam);
  }

  render(scene, camera, dt, sunDir) {
    const r = this.renderer;
    const T = this.targets;
    const m = this.m;
    this.time += dt;
    const aspect = this.w / this.h;

    r.setRenderTarget(T.scene);
    r.setClearColor(0x000000, 1);
    r.clear(true, true, false);
    r.render(scene, camera);

    // Depth of field focused on the samurai: soft foreground grass, gently hazy distance.
    const dofOn = this.dof > 0;
    if (dofOn) {
      const k = this.dofScale;
      const p = m.dofPrep.uniforms;
      p.tScene.value = T.scene.texture;
      p.tDepth.value = T.scene.depthTexture;
      p.uClip.value.set(camera.near, camera.far);
      p.uDof.value.set(this.focus, 2.0 * k * this.dof, 7.0 * k * this.dof);
      p.uMaxBlur.value = 12 * k;
      this.pass(m.dofPrep, T.dofA);
      const g = m.dofGather.uniforms;
      g.tSrc.value = T.dofA.texture;
      g.uTexel.value.set(1 / T.dofA.width, 1 / T.dofA.height);
      g.uMaxBlur.value = 12 * k;
      this.pass(m.dofGather, T.dofB);
    }

    // Where is the sun on screen, and is it in front of us at all?
    camera.getWorldDirection(this.fwd);
    const facing = this.fwd.dot(sunDir);
    this.sunNdc.copy(camera.position).addScaledVector(sunDir, 1000).project(camera);
    const sx = this.sunNdc.x * 0.5 + 0.5;
    const sy = this.sunNdc.y * 0.5 + 0.5;
    const edge = Math.max(Math.abs(this.sunNdc.x), Math.abs(this.sunNdc.y));
    const sunOn = facing > 0 ? smooth(-0.05, 0.3, facing) * (1 - smooth(1.0, 1.9, edge)) : 0;

    if (sunOn > 0.001) {
      m.prefilter.uniforms.tScene.value = T.scene.texture;
      m.prefilter.uniforms.uSunUV.value.set(sx, sy);
      m.prefilter.uniforms.uAspect.value = aspect;
      this.pass(m.prefilter, T.raysA);
      m.blur.uniforms.uSunUV.value.set(sx, sy);
      m.blur.uniforms.tSrc.value = T.raysA.texture;
      m.blur.uniforms.uStep.value = 0.92;
      m.blur.uniforms.uDecay.value = 0.965;
      this.pass(m.blur, T.raysB);
      m.blur.uniforms.tSrc.value = T.raysB.texture;
      m.blur.uniforms.uStep.value = 0.07;
      m.blur.uniforms.uDecay.value = 1.0;
      this.pass(m.blur, T.raysA);
    } else if (this.raysLive !== false) {
      r.setRenderTarget(T.raysA);
      r.setClearColor(0x000000, 1);
      r.clear(true, false, false);
    }
    this.raysLive = sunOn > 0.001;

    // Bloom: downsample chain.
    let src = T.scene;
    for (let i = 0; i < T.bloom.length; i++) {
      m.down.uniforms.tSrc.value = src.texture;
      m.down.uniforms.uTexel.value.set(1 / src.width, 1 / src.height);
      m.down.uniforms.uKaris.value = i === 0 ? 1 : 0;
      this.pass(m.down, T.bloom[i]);
      src = T.bloom[i];
    }

    // Eye adaptation from a small, already-blurred copy of the frame.
    const prev = this.exposure[this.expIndex];
    const next = this.exposure[1 - this.expIndex];
    m.exposure.uniforms.tLum.value = T.bloom[Math.min(3, T.bloom.length - 1)].texture;
    m.exposure.uniforms.tPrev.value = prev.texture;
    m.exposure.uniforms.tScene.value = T.scene.texture;
    m.exposure.uniforms.uSunUV.value.set(sx, sy);
    m.exposure.uniforms.uSunRadius.value = 0.0115 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 0.5 * 1.6;
    m.exposure.uniforms.uAspect.value = aspect;
    m.exposure.uniforms.uDt.value = Math.min(dt, 0.1);
    m.exposure.uniforms.uInit.value = this.init ? 1 : 0;
    this.pass(m.exposure, next);
    this.expIndex = 1 - this.expIndex;
    this.init = false;

    // Bloom: upsample and accumulate back up the chain.
    for (let i = T.bloom.length - 1; i > 0; i--) {
      m.up.uniforms.tSrc.value = T.bloom[i].texture;
      m.up.uniforms.uTexel.value.set(1 / T.bloom[i].width, 1 / T.bloom[i].height);
      this.pass(m.up, T.bloom[i - 1]);
    }

    const c = m.composite.uniforms;
    c.tScene.value = T.scene.texture;
    c.tBloom.value = T.bloom[0].texture;
    c.tRays.value = T.raysA.texture;
    c.tExposure.value = next.texture;
    c.tDof.value = T.dofB.texture;
    c.uDofOn.value = dofOn ? 1 : 0;
    c.uSunUV.value.set(sx, sy);
    c.uSunOn.value = sunOn;
    c.uAspect.value = aspect;
    c.uTime.value = this.time;
    if (this.direct) {
      this.pass(m.composite, null);
      return;
    }
    this.pass(m.composite, T.ldr);
    m.upscale.uniforms.tSrc.value = T.ldr.texture;
    m.upscale.uniforms.uTime.value = this.time;
    this.pass(m.upscale, null);
  }

  // Can the scene target actually be drawn into? (Multisampled half floats are not
  // everywhere.) Call after setSize.
  sceneComplete() {
    const r = this.renderer;
    const gl = r.getContext();
    r.setRenderTarget(this.targets.scene);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    r.setRenderTarget(null);
    return ok;
  }
}

function smooth(a, b, x) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}
