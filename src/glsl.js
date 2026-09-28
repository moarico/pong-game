// Shared GLSL chunks. Terrain and wind noise have exact JavaScript twins in noise.js,
// terrain.js and wind.js so the player, the cloth and the grass all agree on one world.
import { TERRAIN, GUST } from './config.js';

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

// Fragment shaders only (derivatives).
export const specAA = /* glsl */ `
// GGX alpha squared for a roughness, widened by how fast the normal N turns across
// the pixel (specular anti-aliasing): no single pixels flashing white on bumps,
// rivets and silhouettes.
float specAlpha2(float rough, vec3 N, float floorRough) {
  float r = max(rough, floorRough);
  vec3 dx = dFdx(N);
  vec3 dy = dFdy(N);
  float variance = 0.25 * (dot(dx, dx) + dot(dy, dy));
  return min(r * r * r * r + min(2.0 * variance, 0.18), 1.0);
}
`;

export const sharedUniforms = /* glsl */ `
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunDisc;
uniform vec3 uSunColor;
uniform vec3 uAmbSky;
uniform vec3 uAmbGround;
uniform vec3 uFogColor;
uniform vec3 uFogSunColor;
uniform float uFogDensity;
uniform float uFogFalloff;
uniform vec2 uMist;
uniform vec2 uWindDir;
uniform float uWindStrength;
uniform vec2 uWindScroll;
uniform float uArena; // 0 on the hilltop, 1 inside a boss arena
uniform vec4 uPtPos[4]; // point lights: position, radius (0 = off)
uniform vec4 uPtCol[4]; // colour x intensity
uniform vec3 uEnvSky; // what polished surfaces see above and below, in an arena
uniform vec3 uEnvGround;
uniform float uFlashLight; // lightning: a brief cold flood of light
`;

// Local lights in the arenas: torches, furnaces, crystals, a lure in the dark.
export const lights = /* glsl */ `
vec3 pointLights(vec3 p, vec3 N, vec3 V, vec3 alb, float rough, float wrap) {
  vec3 sum = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    vec4 L = uPtPos[i];
    if (L.w <= 0.0) continue;
    vec3 d = L.xyz - p;
    float d2 = dot(d, d);
    float r2 = L.w * L.w;
    if (d2 >= r2) continue;
    float k = 1.0 - d2 / r2;
    float att = k * k / (1.0 + d2 * 0.35);
    vec3 l = d * inversesqrt(max(d2, 1e-4));
    float ndl = max((dot(N, l) + wrap) / (1.0 + wrap), 0.0);
    vec3 h = normalize(l + V);
    float spec = pow(max(dot(N, h), 0.0), mix(90.0, 6.0, rough)) * (1.0 - rough) * 0.6;
    sum += uPtCol[i].rgb * att * (alb * ndl + spec * ndl);
  }
  return sum;
}
`;

const v2 = (a) => `vec2(${f(a[0])}, ${f(a[1])})`;
const ridgeA = TERRAIN.ridges.map(([x1, z1, x2, z2]) => `vec4(${f(x1)}, ${f(z1)}, ${f(x2 - x1)}, ${f(z2 - z1)})`);
const ridgeB = TERRAIN.ridges.map(([, , , , r1, r2, h1, h2]) => `vec4(${f(r1)}, ${f(r2)}, ${f(h1)}, ${f(h2)})`);
const ridgeInv = TERRAIN.ridges.map(([x1, z1, x2, z2]) => f(1 / ((x2 - x1) ** 2 + (z2 - z1) ** 2)));
const islands = TERRAIN.islands.map((v) => `vec4(${v.map(f).join(', ')})`);

// Keep in sync with terrainHeight() in terrain.js.
export const terrain = /* glsl */ `
#define NRIDGE ${TERRAIN.ridges.length}
#define NISLAND ${TERRAIN.islands.length}
const vec4 RIDGE_A[NRIDGE] = vec4[NRIDGE](${ridgeA.join(', ')});
const vec4 RIDGE_B[NRIDGE] = vec4[NRIDGE](${ridgeB.join(', ')});
const float RIDGE_INV[NRIDGE] = float[NRIDGE](${ridgeInv.join(', ')});
const vec4 ISLANDS[NISLAND] = vec4[NISLAND](${islands.join(', ')});

float terrainRolling(vec2 p) {
  vec2 q = (p + ${v2(TERRAIN.offset)}) * (1.0 / 240.0);
  float h = (inoise5(q) - 0.5) * 26.0;
  q = mat2(0.8, 0.6, -0.6, 0.8) * q * 2.3 + vec2(3.1, 1.7);
  h += (inoise5(q) - 0.5) * 9.0;
  q = mat2(0.8, 0.6, -0.6, 0.8) * q * 2.4 + vec2(-1.3, 5.2);
  h += (inoise5(q) - 0.5) * 2.6;
  q = mat2(0.8, 0.6, -0.6, 0.8) * q * 2.5 + vec2(7.7, -2.4);
  h += (inoise5(q) - 0.5) * 0.8;
  return h;
}

float terrainSmax(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return max(a, b) + h * h * k * 0.25;
}

float terrainMound(float t) {
  float u = max(1.0 - t * t, 0.0);
  return u * u;
}

// The coast beyond the hilltop: the seabed, headlands and islands.
float terrainCoast(vec2 p, float h, float n) {
  h = terrainSmax(h, ${f(TERRAIN.seabed)} + n * 0.5, 30.0);
  float crag = 1.0 - abs(inoise5(p * (1.0 / 640.0) + vec2(19.0, 7.0)) * 2.0 - 1.0);
  crag = 0.6 + 0.6 * crag + (inoise5(p * (1.0 / 230.0) + vec2(-5.0, 11.0)) - 0.5) * 0.35;
  for (int i = 0; i < NRIDGE; i++) {
    vec4 A = RIDGE_A[i];
    vec4 B = RIDGE_B[i];
    vec2 q = p - A.xy;
    float t = clamp(dot(q, A.zw) * RIDGE_INV[i], 0.0, 1.0);
    float dist = length(q - A.zw * t);
    float r = mix(B.x, B.y, t);
    if (dist < r) {
      float peak = mix(B.z, B.w, t) * crag;
      h = terrainSmax(h, -120.0 + (peak + 120.0) * terrainMound(dist / r), 40.0);
    }
  }
  for (int i = 0; i < NISLAND; i++) {
    vec4 I = ISLANDS[i];
    float dist = length(p - I.xy);
    if (dist < I.z) h = terrainSmax(h, -120.0 + (I.w * crag + 120.0) * terrainMound(dist / I.z), 40.0);
  }
  // Spurs and gullies on the high ground.
  float rid = 1.0 - abs(inoise5(p * (1.0 / 170.0) + vec2(3.0, -9.0)) * 2.0 - 1.0);
  h += (rid - 0.55) * 46.0 * smoothstep(90.0, 320.0, h);
  return h;
}

float terrainHeight(vec2 p) {
  float n = terrainRolling(p);
  vec2 d = p - ${v2(TERRAIN.sunH.map((v) => v * TERRAIN.crest))};
  float a = dot(d, ${v2(TERRAIN.sunH)});
  // The hill: a broad dome just ahead of the spawn, rolling over and falling to the sea
  // on three sides, and running back into the plateau inland.
  float b = dot(d, ${v2(TERRAIN.right)});
  float rp = max(length(vec2(a, b * ${f(TERRAIN.across)})) - ${f(TERRAIN.flat)}, 0.0);
  // The coast curves out on either side, so the bay's arms stay land.
  float fall = ${f(TERRAIN.slope)} * (sqrt(rp * rp + ${f(TERRAIN.round * TERRAIN.round)}) - ${f(TERRAIN.round)}) * smoothstep(-450.0, -50.0, a - b * b * 0.0004);
  // Inland the ground climbs gently toward the mountains.
  float ip = max(-a - 300.0, 0.0);
  float climb = 0.05 * (sqrt(ip * ip + 40000.0) - 200.0);
  float r2 = dot(p, p);
  // Smooth on the hilltop, livelier further out.
  float detail = 0.3 + 0.7 * smoothstep(150.0, 600.0, sqrt(r2));
  float knoll = ${f(TERRAIN.knoll)} * exp(-r2 * ${f(1 / (2 * TERRAIN.knollRadius * TERRAIN.knollRadius))});
  float h = ${f(TERRAIN.top)} - fall + climb + knoll + n * detail;
  if (r2 > ${f(TERRAIN.near * TERRAIN.near)}) h = terrainCoast(p, h, n);
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

// Keep in sync with Wind.gustAt() in wind.js: both read the same gust texture.
export const wind = /* glsl */ `
uniform sampler2D uGustTex;
float windGust(vec2 p) {
  vec2 q = p - uWindScroll;
  vec2 d = uWindDir;
  vec2 r = vec2(dot(q, d), dot(q, vec2(-d.y, d.x)));
  const float k = ${(1 / GUST.cells).toFixed(6)};
  float n = textureLod(uGustTex, r * vec2(0.060, 0.024) * k, 0.0).r * 0.62
          + textureLod(uGustTex, (r * vec2(0.15, 0.07) + vec2(17.0, 3.0)) * k, 0.0).r * 0.38;
  return smoothstep(0.26, 0.8, n);
}
`;

export const atmosphere = /* glsl */ `
// Colour of the air in direction v: dim, cool grey away from the sun, deepening to
// orange and then molten gold toward it.
vec3 hazeColor(vec3 v) {
  float s = dot(v, uSunDisc);
  vec3 c = mix(uFogColor, uFogSunColor, pow(s * 0.5 + 0.5, 15.0));
  c += uFogSunColor * (0.3 * pow(sat(s), 30.0) + 0.9 * pow(sat(s), 160.0));
  return c;
}

// Optical depth of an exponential layer (density a at y = 0, falloff k) along the
// segment from the camera to wp.
float fogLayer(vec3 d, float dist, float a, float k) {
  float ky = k * d.y;
  float t = abs(ky) > 1e-4 ? (1.0 - exp(-ky)) / ky : 1.0;
  return a * exp(-k * cameraPosition.y) * dist * max(t, 0.0);
}

// Height fog: a broad haze that thins with altitude, and a low mist over the sea.
float fogAmount(vec3 wp) {
  vec3 d = wp - cameraPosition;
  float dist = length(d);
  float od = fogLayer(d, dist, uFogDensity, uFogFalloff) + fogLayer(d, dist, uMist.x, uMist.y);
  return 1.0 - exp(-od);
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
