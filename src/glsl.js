// Shared GLSL chunks. Terrain and wind noise have exact JavaScript twins in noise.js,
// terrain.js and wind.js so the player, the cloth and the grass all agree on one world.
import { TERRAIN } from './config.js';

const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

export const common = /* glsl */ `
#ifndef PI
#define PI 3.141592653589793
#endif
#define TAU 6.283185307179586

float sat(float x) { return clamp(x, 0.0, 1.0); }
vec2 sat(vec2 x) { return clamp(x, 0.0, 1.0); }
vec3 sat(vec3 x) { return clamp(x, 0.0, 1.0); }

// Float hash (Dave Hoskins, "Hash without Sine"). Visual detail only.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Integer-lattice value noise, bit-exact with noise.js.
uint pcgHash(uint v) {
  uint state = v * 747796405u + 2891336453u;
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}
float latticeHash(ivec2 p) {
  uint h = pcgHash((uint(p.x) * 1597334677u) ^ (uint(p.y) * 3812015801u));
  return float(h) * (1.0 / 4294967296.0);
}
float inoise(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl) + ivec2(65536);
  vec2 f = p - fl;
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = latticeHash(i);
  float b = latticeHash(i + ivec2(1, 0));
  float c = latticeHash(i + ivec2(0, 1));
  float d = latticeHash(i + ivec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// Same lattice, quintic fade: smooth enough in slope for rolling hills.
float inoise5(vec2 p) {
  vec2 fl = floor(p);
  ivec2 i = ivec2(fl) + ivec2(65536);
  vec2 f = p - fl;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = latticeHash(i);
  float b = latticeHash(i + ivec2(1, 0));
  float c = latticeHash(i + ivec2(0, 1));
  float d = latticeHash(i + ivec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`;

export const sharedUniforms = /* glsl */ `
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uAmbSky;
uniform vec3 uAmbGround;
uniform vec3 uFogColor;
uniform vec3 uFogSunColor;
uniform float uFogDensity;
uniform float uFogFalloff;
uniform vec2 uWindDir;
uniform float uWindStrength;
uniform vec2 uWindScroll;
`;

// Keep in sync with terrainHeight() in terrain.js.
export const terrain = /* glsl */ `
float terrainHeight(vec2 p) {
  vec2 q = (p + vec2(${f(TERRAIN.offset[0])}, ${f(TERRAIN.offset[1])})) * (1.0 / 240.0);
  float h = (inoise5(q) - 0.5) * 26.0;
  q = mat2(0.8, 0.6, -0.6, 0.8) * q * 2.3 + vec2(3.1, 1.7);
  h += (inoise5(q) - 0.5) * 9.0;
  q = mat2(0.8, 0.6, -0.6, 0.8) * q * 2.4 + vec2(-1.3, 5.2);
  h += (inoise5(q) - 0.5) * 2.6;
  q = mat2(0.8, 0.6, -0.6, 0.8) * q * 2.5 + vec2(7.7, -2.4);
  h += (inoise5(q) - 0.5) * 0.8;
  vec2 d = p - vec2(${f(TERRAIN.hero[0])}, ${f(TERRAIN.hero[1])});
  h += ${f(TERRAIN.heroHeight)} * exp(-dot(d, d) * ${f(1 / (2 * TERRAIN.heroRadius * TERRAIN.heroRadius))});
  return h;
}

vec3 terrainNormal(vec2 p) {
  float e = 0.6;
  float hx = terrainHeight(p + vec2(e, 0.0)) - terrainHeight(p - vec2(e, 0.0));
  float hz = terrainHeight(p + vec2(0.0, e)) - terrainHeight(p - vec2(0.0, e));
  return normalize(vec3(-hx, 2.0 * e, -hz));
}

// Soft shadows the hills cast across each other (1 = sunlit).
float terrainSunVis(vec3 p) {
  vec2 d = normalize(uSunDir.xz);
  float tanSun = uSunDir.y / length(uSunDir.xz);
  float m = -1.0;
  m = max(m, (terrainHeight(p.xz + d * 7.0) - p.y) / 7.0);
  m = max(m, (terrainHeight(p.xz + d * 22.0) - p.y) / 22.0);
  m = max(m, (terrainHeight(p.xz + d * 60.0) - p.y) / 60.0);
  return 1.0 - smoothstep(tanSun - 0.04, tanSun + 0.01, m);
}
`;

// Keep in sync with Wind.gustAt() in wind.js.
export const wind = /* glsl */ `
float windGust(vec2 p) {
  vec2 q = p - uWindScroll;
  vec2 d = uWindDir;
  vec2 r = vec2(dot(q, d), dot(q, vec2(-d.y, d.x)));
  float n = inoise(r * vec2(0.060, 0.024)) * 0.62 + inoise(r * vec2(0.15, 0.07) + vec2(17.0, 3.0)) * 0.38;
  return smoothstep(0.26, 0.8, n);
}
`;

export const atmosphere = /* glsl */ `
// Colour of the air in direction v: cool blue-grey haze away from the sun,
// molten gold toward it.
vec3 hazeColor(vec3 v) {
  float s = dot(v, uSunDir);
  vec3 c = mix(uFogColor, uFogSunColor, pow(s * 0.5 + 0.5, 6.0));
  c += uFogSunColor * 0.45 * pow(sat(s), 24.0);
  return c;
}

// Exponential height fog: valleys fill with haze, crests stand clearer.
float fogAmount(vec3 wp) {
  vec3 d = wp - cameraPosition;
  float dist = length(d);
  float k = uFogFalloff;
  float a = uFogDensity * exp(-k * cameraPosition.y);
  float ky = k * d.y;
  float t = abs(ky) > 1e-4 ? (1.0 - exp(-ky)) / ky : 1.0;
  return 1.0 - exp(-a * dist * max(t, 0.0));
}

vec3 applyFog(vec3 col, vec3 wp) {
  vec3 v = normalize(wp - cameraPosition);
  return mix(col, hazeColor(v), fogAmount(wp));
}
`;

// Soft shadow of the samurai (the only shadow caster). Fragment shaders only.
export const shadow = /* glsl */ `
uniform sampler2D uShadowMap;
uniform vec4 uShadowParams; // x: map width (m), y: depth range (m), z: caster depth (0..1), w: enabled

float charShadow(vec3 sc) {
  if (uShadowParams.w < 0.5) return 1.0;
  if (sc.x < 0.002 || sc.x > 0.998 || sc.y < 0.002 || sc.y > 0.998 || sc.z >= 1.0) return 1.0;
  float behind = max(sc.z - uShadowParams.z, 0.0) * uShadowParams.y;
  // Penumbra widens with distance from the caster, like a real sun shadow.
  float radius = (behind * 0.032 + 0.012) / uShadowParams.x;
  float rot = hash12(gl_FragCoord.xy) * TAU;
  float lit = 0.0;
  for (int i = 0; i < 12; i++) {
    float fi = float(i) + 0.5;
    float r = sqrt(fi / 12.0) * radius;
    float a = fi * 2.39996 + rot;
    float d = texture(uShadowMap, sc.xy + vec2(cos(a), sin(a)) * r).r;
    lit += step(sc.z - 0.0006, d);
  }
  return mix(lit / 12.0, 1.0, smoothstep(22.0, 30.0, behind));
}
`;
