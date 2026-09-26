// Shared GLSL chunks. Terrain and wind noise have exact JavaScript twins in noise.js and
// terrain.js so the player, the cloth and the grass all agree on the same world.

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

// Integer-lattice value noise, bit-exact with inoise() in noise.js.
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
uniform vec2 uWindDir;
uniform float uWindStrength;
uniform vec2 uWindScroll;
`;

// Keep in sync with terrain.js.
export const terrain = /* glsl */ `
float terrainHeight(vec2 p) {
  return sin(p.x * 0.031 + 1.7) * cos(p.y * 0.027 - 0.4) * 2.2
       + sin(p.x * 0.067 - p.y * 0.052 + 2.3) * 0.7
       + cos(p.x * 0.121 + p.y * 0.143 - 1.1) * 0.25;
}

vec3 terrainNormal(vec2 p) {
  float a = p.x * 0.031 + 1.7, b = p.y * 0.027 - 0.4;
  float c = p.x * 0.067 - p.y * 0.052 + 2.3;
  float e = p.x * 0.121 + p.y * 0.143 - 1.1;
  float dx = 0.031 * cos(a) * cos(b) * 2.2 + 0.067 * cos(c) * 0.7 - 0.121 * sin(e) * 0.25;
  float dz = -0.027 * sin(a) * sin(b) * 2.2 - 0.052 * cos(c) * 0.7 - 0.143 * sin(e) * 0.25;
  return normalize(vec3(-dx, 1.0, -dz));
}

// Long, soft shadows the low sun casts across the rolling ground (1 = sunlit).
float terrainSunVis(vec3 p) {
  vec2 d = normalize(uSunDir.xz);
  float tanSun = uSunDir.y / length(uSunDir.xz);
  float m = -1.0;
  m = max(m, (terrainHeight(p.xz + d * 4.0) - p.y) * 0.25);
  m = max(m, (terrainHeight(p.xz + d * 11.0) - p.y) / 11.0);
  m = max(m, (terrainHeight(p.xz + d * 25.0) - p.y) / 25.0);
  m = max(m, (terrainHeight(p.xz + d * 52.0) - p.y) / 52.0);
  return 1.0 - smoothstep(tanSun - 0.03, tanSun + 0.012, m);
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
// Colour of the air in direction v: violet-rose away from the sun, molten gold toward it.
vec3 hazeColor(vec3 v) {
  float s = dot(v, uSunDir);
  vec3 c = mix(uFogColor, uFogSunColor, pow(s * 0.5 + 0.5, 5.0));
  c += uFogSunColor * 0.7 * pow(sat(s), 28.0);
  return c;
}

vec3 applyFog(vec3 col, vec3 wp) {
  vec3 d = wp - cameraPosition;
  float dist = length(d);
  vec3 v = d / max(dist, 1e-4);
  float fog = 1.0 - exp(-dist * uFogDensity);
  return mix(col, hazeColor(v), fog);
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
