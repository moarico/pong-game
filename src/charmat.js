import * as THREE from 'three';
import { common, sharedUniforms, atmosphere, lights } from './glsl.js';

// ---------------------------------------------------------------------------
// One material for a whole character. Every vertex carries its own albedo and
// surface type (cloth, skin, straw, lacquer, steel...), so a figure draws in a
// single skinned call. Shading: soft cloth with woven bump detail, GGX for
// lacquer and steel, a molten rim of sunlight around the silhouette, the kasa's
// shadow on the face, and a hit flash.
// ---------------------------------------------------------------------------

// Surface patterns (aPat.x).
export const PAT = {
  none: 0,
  straw: 1, // uv = (angle / 2pi, radius): radial reeds and binding rings
  stripe: 2, // uv.x in metres around: hakama pinstripes
  wrap: 3, // uv = (angle / 2pi, metres along): diamond tsuka-ito over rayskin
  plates: 4, // uv.y in metres along: lacquered kote plates
  gaiter: 5, // diagonal kyahan wraps
  lames: 6, // armour lames with red lacing
  hamon: 7, // uv.x across the blade (0 spine .. 1 edge): frosted temper line
  face: 8, // uv = face coordinates in metres (x across, y up from the eye line): eyes, brows, lips
  brocade: 9, // uv in metres of cloth: a dark damask of medallions and vines
  cloak: 10, // damask, with a torn hem and the odd hole (uv.y = metres above the hem)
  // Monsters and machines (uv in metres unless noted).
  glow: 11, // pure light: albedo x rim value x uGlow (eyes, lures, furnaces)
  scales: 12, // overlapping scales with an oily sheen
  brass: 13, // brushed brass plates, rivets, verdigris in the seams
  crystal: 14, // faceted crystal with a cold fire inside (rim value = glow)
  bone: 15, // ivory, pitted and cracked (teeth, horns, skulls)
  flesh: 16, // wet skin, mottled; suckers along the underside (uv.x = around, 0..1)
  armor: 17, // dark hammered steel, scratched, bright on the worn edges
  hide: 18, // short black hair, split by glowing cracks (rim value = glow)
};

const vert = /* glsl */ `
#include <skinning_pars_vertex>
attribute vec3 aColor;
attribute vec4 aMat;
attribute vec2 aPat;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;
varying vec4 vMat;
varying vec2 vPatRim;
void main() {
  #include <skinbase_vertex>
  #include <beginnormal_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  #ifdef USE_INSTANCING
  transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
  objectNormal = mat3(instanceMatrix) * objectNormal;
  #endif
  vec4 w = modelMatrix * vec4(transformed, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * objectNormal);
  vUv = uv;
  vColor = aColor;
  vMat = aMat;
  vPatRim = aPat;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const frag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
${lights}
uniform float uGroundY;
uniform vec4 uHat;
uniform vec4 uFlash;
uniform vec4 uGlow;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;
varying vec4 vMat;
varying vec2 vPatRim;

// What polished steel sees: bright hazy sky above, the sunlit golden field below
// (or, in an arena, the hall around it).
vec3 envColor(vec3 r) {
  if (uArena > 0.5) return mix(uEnvGround, uEnvSky, smoothstep(-0.35, 0.45, r.y));
  vec3 sky = mix(hazeColor(r), vec3(0.6, 0.78, 1.15), smoothstep(0.1, 0.8, r.y));
  vec3 field = mix(vec3(1.05, 0.72, 0.36), uFogSunColor * 0.5, pow(sat(dot(r, uSunDir)), 3.0));
  return mix(field, sky, smoothstep(-0.12, 0.04, r.y));
}

// Bump mapping from a procedural height (surface-gradient form, no tangents needed).
vec3 bumpNormal(vec3 N, float h) {
  vec3 dpdx = dFdx(vWorld);
  vec3 dpdy = dFdy(vWorld);
  float dhdx = dFdx(h);
  float dhdy = dFdy(h);
  vec3 r1 = cross(dpdy, N);
  vec3 r2 = cross(N, dpdx);
  float det = dot(dpdx, r1);
  vec3 grad = sign(det) * (dhdx * r1 + dhdy * r2);
  return normalize(abs(det) * N - grad);
}

// Soft folds and a coarse weave, laid out in metres of cloth.
float fabricHeight(vec2 p) {
  float folds = vnoise(vec2(p.x * 16.0, p.y * 3.5)) * 0.7 + vnoise(vec2(p.x * 41.0, p.y * 9.0)) * 0.3;
  float weave = vnoise(p * vec2(230.0, 210.0));
  return folds * 0.006 + weave * 0.0007;
}

// Damask: medallions in a half-drop repeat, linked by a diamond trellis of vines,
// woven in a slightly paler, sheenier thread. Fades to its average when too fine to see.
float damask(vec2 uv) {
  vec2 g = uv * 16.0;
  vec2 cell = floor(g);
  vec2 f = fract(g + vec2(0.5 * mod(cell.y, 2.0), 0.0)) - 0.5;
  float r = length(f);
  float ang = atan(f.y, f.x);
  float petals = 0.5 + 0.5 * cos(ang * 5.0 + r * 9.0);
  float medallion = (1.0 - smoothstep(0.3, 0.34, r)) * smoothstep(0.05, 0.12, r) * smoothstep(0.35, 0.65, petals + 0.25 * sin(r * 40.0));
  float vine = 1.0 - smoothstep(0.0, 0.035, abs(abs(f.x) + abs(f.y) - 0.46));
  float m = max(medallion, vine * 0.7);
  float fw = length(fwidth(g));
  return mix(m, 0.22, smoothstep(0.25, 0.7, fw));
}

// The kasa's brim shades whatever sits beneath it from the sun.
float hatShadow(vec3 p) {
  float dy = uHat.y - p.y;
  if (dy <= 0.0 || uHat.w <= 0.0) return 1.0;
  vec3 q = p + uSunDir * (dy / max(uSunDir.y, 0.05));
  return smoothstep(uHat.w * 0.8, uHat.w * 1.02, length(q.xz - uHat.xz));
}

// ...and hides most of the sky from the face and neck beneath it.
float hatOcclusion(vec3 p) {
  float dy = uHat.y - p.y;
  if (dy <= 0.0 || uHat.w <= 0.0) return 1.0;
  float inside = 1.0 - smoothstep(uHat.w * 0.55, uHat.w * 1.1, length(p.xz - uHat.xz));
  return 1.0 - 0.7 * inside * (1.0 - smoothstep(0.2, 0.55, dy));
}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = uSunDir;
  vec3 alb = vColor;
  float rough = vMat.x;
  float metal = vMat.y;
  float trans = vMat.z;
  float bump = vMat.w;
  int pat = int(vPatRim.x + 0.5);
  float rimAmt = vPatRim.y;
  vec3 emit = vec3(0.0);
  float sheen = 0.0;

  if (pat == 1) {
    // Woven cane: strips running round the cone, over one spoke and under the next,
    // dark gaps between them, every piece of cane its own shade.
    float su = vUv.x * 72.0;
    float rr = vUv.y;
    float band = rr * 62.0;
    float over = mod(floor(band) + floor(su), 2.0);
    float bf = fract(band);
    float sf = fract(su);
    float strip = smoothstep(0.0, 0.16, bf) * (1.0 - smoothstep(0.84, 1.0, bf));
    float spoke = 1.0 - smoothstep(0.12, 0.22, abs(sf - 0.5));
    float shade = mix(0.28, 1.0, strip);
    shade *= mix(1.0, 0.7, spoke * (1.0 - over));
    shade *= 0.86 + 0.28 * hash12(floor(vec2(su, band)));
    float fw = max(fwidth(band), fwidth(su));
    alb *= mix(shade, 0.74, smoothstep(0.35, 0.9, fw));
    N = bumpNormal(N, strip * 0.0015 * (1.0 - smoothstep(0.35, 0.9, fw)));
  } else if (pat == 9) {
    float m = damask(vUv);
    alb = mix(alb, alb * 1.45 + vec3(0.01, 0.01, 0.011), m * 0.4);
    rough = mix(rough, 0.6, m * 0.5);
  } else if (pat == 10) {
    // A traveller's cloak: damask worn thin, the hem torn into tatters, a few holes.
    float hem = vUv.y;
    float n = vnoise(vec2(vUv.x * 16.0, 0.0)) * 0.6 + vnoise(vec2(vUv.x * 43.0, 3.0)) * 0.4;
    float tear = 0.015 + 0.12 * n * n + 0.2 * smoothstep(0.9, 1.0, vnoise(vec2(vUv.x * 7.0, 7.0)));
    if (hem < tear) discard;
    if (hem < 0.45 && vnoise(vUv * vec2(15.0, 11.0) + 5.0) > 0.87) discard;
    float m = damask(vUv);
    alb = mix(alb, alb * 1.6 + vec3(0.01), m * 0.45);
    alb *= mix(0.72, 1.0, smoothstep(0.0, 0.06, hem - tear));
  } else if (pat == 2) {
    alb *= 0.88 + 0.12 * step(0.66, fract(vUv.x * 28.0));
  } else if (pat == 3) {
    float z = vUv.y * 34.0;
    float d = abs(fract(z + vUv.x * 2.0) - 0.5) + abs(fract(z - vUv.x * 2.0) - 0.5);
    alb = mix(alb, vec3(0.2, 0.16, 0.13), (1.0 - smoothstep(0.5, 0.62, d)) * 0.85);
  } else if (pat == 4) {
    // Horizontal lacquered splints over dark mail.
    float f = fract(vUv.y * 13.0);
    float gap = smoothstep(0.8, 0.88, f);
    float mail = step(0.5, fract(vUv.x * 90.0 + step(0.5, fract(vUv.y * 90.0)) * 0.5));
    alb = mix(alb, vec3(0.05, 0.05, 0.055) * (0.7 + 0.3 * mail), gap);
    rough = mix(rough, 0.55, gap);
    N = bumpNormal(N, (1.0 - gap) * f * 0.0012);
  } else if (pat == 5) {
    float f = fract(vUv.y * 26.0 + vUv.x * 5.0);
    float edge = smoothstep(0.0, 0.15, f) * (1.0 - smoothstep(0.85, 1.0, f));
    alb *= 0.8 + 0.2 * edge;
    N = bumpNormal(N, edge * 0.0015);
  } else if (pat == 6) {
    // Lacquered lames laced with dark silk.
    float f = fract(vUv.y * 22.0);
    float lace = step(0.86, fract(vUv.x * 14.0)) * step(0.2, f) * (1.0 - step(0.8, f));
    float groove = smoothstep(0.86, 0.96, f);
    alb = mix(alb, vec3(0.1, 0.07, 0.06), lace);
    rough = mix(rough, 0.9, lace);
    alb *= 1.0 - 0.55 * groove;
    N = bumpNormal(N, f * 0.002);
  } else if (pat == 8) {
    // Face detail. Eyes: almond openings, dark irises, a lash line along the upper lid.
    vec2 p = vUv;
    float ax = abs(p.x);
    vec2 e = vec2(ax - 0.031, p.y - 0.0005);
    float t = e.x / 0.0142;
    float w = max(1.0 - t * t, 0.0);
    float lidU = 0.0041 * pow(w, 0.75) + 0.0009 * t;
    float lidL = -0.0029 * pow(w, 0.85) + 0.0004 * t;
    float aa = 0.00035;
    float open = step(abs(t), 1.0) * smoothstep(lidL - aa, lidL + aa, e.y) * smoothstep(lidU + aa, lidU - aa, e.y);
    float ir = length(vec2(ax - 0.0302, p.y - 0.0002));
    float iris = 1.0 - smoothstep(0.0042, 0.005, ir);
    float pupil = 1.0 - smoothstep(0.0017, 0.0023, ir);
    vec3 eyeC = mix(vec3(0.5, 0.43, 0.38), mix(vec3(0.075, 0.045, 0.03), vec3(0.012, 0.01, 0.01), pupil), iris);
    // The upper lid shades the top of the eye.
    eyeC *= mix(0.55, 1.0, smoothstep(lidU - 0.0006, lidU - 0.0028, e.y));
    alb = mix(alb, eyeC, open);
    rough = mix(rough, 0.12, open);
    float lash = smoothstep(0.0011, 0.0002, abs(e.y - lidU - 0.0002)) * step(abs(t), 1.1);
    alb = mix(alb, vec3(0.025, 0.02, 0.018), lash * 0.95);
    float crease = smoothstep(0.0008, 0.0, abs(e.y - lidU - 0.0042 * (1.0 - 0.5 * t * t))) * step(abs(t), 0.95);
    alb *= 1.0 - 0.22 * crease;
    // Brows: straight, thick, dark, tapering at the outer end.
    float bx = (ax - 0.013) / 0.04;
    float bxc = clamp(bx, 0.0, 1.0);
    float bc = 0.0205 + 0.0012 * bxc - 0.003 * bxc * bxc;
    float bh = 0.0034 * (1.0 - 0.45 * bxc);
    float brow = (1.0 - smoothstep(bh * 0.5, bh, abs(p.y - bc))) * smoothstep(0.0, 0.08, bx) * (1.0 - smoothstep(0.92, 1.0, bx));
    brow *= 0.75 + 0.25 * vnoise(vec2(p.x * 2200.0, p.y * 600.0));
    alb = mix(alb, vec3(0.03, 0.024, 0.02), brow * 0.92);
    // Lips: a little darker and rosier than the skin, a fine line between.
    float my = -0.0725;
    float lx = ax / 0.0215;
    float lw = sqrt(max(1.0 - lx * lx, 0.0));
    float upTop = my + 0.0065 * lw - 0.0012 * exp(-pow(p.x / 0.0035, 2.0)) + 0.0008 * exp(-pow((ax - 0.0055) / 0.004, 2.0));
    float loBot = my - 0.0085 * pow(max(1.0 - pow(ax / 0.0195, 2.0), 0.0), 0.6);
    float lip = smoothstep(upTop + 0.0007, upTop - 0.0007, p.y) * smoothstep(loBot - 0.0009, loBot + 0.0009, p.y) * step(lx, 1.0);
    alb *= mix(vec3(1.0), vec3(0.82, 0.62, 0.58), lip);
    rough = mix(rough, 0.38, lip);
    float mline = smoothstep(0.0009, 0.0, abs(p.y - my - 0.0006 * cos(p.x * 140.0))) * smoothstep(0.025, 0.019, ax);
    alb *= 1.0 - 0.6 * mline;
    // Nostrils.
    float nost = 1.0 - smoothstep(0.0012, 0.0024, length(vec2((ax - 0.0072) * 0.55, p.y + 0.0548)));
    alb *= 1.0 - 0.5 * nost;
    // A shadow of stubble along the jaw and lip; the socket skin a touch darker.
    float jaw = smoothstep(-0.06, -0.1, p.y) * smoothstep(0.012, 0.03, ax) + smoothstep(0.012, 0.004, abs(p.y + 0.062)) * smoothstep(0.02, 0.01, ax);
    alb *= 1.0 - 0.08 * jaw;
    alb *= 1.0 - 0.1 * exp(-pow((ax - 0.031) / 0.02, 2.0) - pow((p.y - 0.004) / 0.013, 2.0));
  } else if (pat == 11) {
    emit = alb * rimAmt * uGlow.rgb * uGlow.a;
    rimAmt = 0.0;
  } else if (pat == 12) {
    // Scales in overlapping rows, each rimmed dark, every one its own shade.
    vec2 g = vUv * vec2(7.0, 9.0);
    float row = floor(g.y);
    g.x += 0.5 * mod(row, 2.0);
    vec2 f = fract(g) - vec2(0.5, 0.05);
    float d = length(vec2(f.x, f.y * 1.15));
    float fw = length(fwidth(g));
    float edge = smoothstep(0.4, 0.52, d) * (1.0 - smoothstep(0.4, 0.9, fw));
    alb *= mix(0.8 + 0.4 * hash12(floor(g)), 0.42, edge);
    rough = mix(rough, min(rough + 0.25, 1.0), edge);
    N = bumpNormal(N, (0.6 - d) * 0.006 * (1.0 - smoothstep(0.3, 0.8, fw)));
    sheen = 1.0;
  } else if (pat == 13) {
    // Brushed brass plates on a riveted grid, dulled and greened in the seams.
    vec2 g = vUv * 1.6;
    vec2 f = fract(g);
    float e = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    float fw = length(fwidth(g));
    float seam = (1.0 - smoothstep(0.0, 0.025, e)) * (1.0 - smoothstep(0.08, 0.3, fw));
    vec2 rv = fract(g * 7.0) - 0.5;
    float rivet = (1.0 - smoothstep(0.16, 0.26, length(rv))) * step(e, 0.075) * (1.0 - smoothstep(0.05, 0.2, fw));
    float brush = vnoise(vec2(vUv.x * 260.0, vUv.y * 5.0));
    float patina = smoothstep(0.58, 0.82, vnoise(vUv * 2.7) * 0.6 + vnoise(vUv * 10.0) * 0.4);
    alb *= 0.82 + 0.3 * brush;
    alb = mix(alb, vec3(0.12, 0.27, 0.21), patina * 0.6 + seam * 0.35);
    metal = mix(metal, 0.15, patina * 0.8 + seam * 0.5);
    rough = mix(rough, 0.72, patina);
    rough = mix(rough, 0.22, rivet);
    N = bumpNormal(N, rivet * 0.004 * (0.3 - length(rv)) - seam * 0.0015);
  } else if (pat == 14) {
    // Crystal: facets come from the geometry; inside, veins of cold fire.
    float vein = vnoise(vWorld.xz * 3.1 + vWorld.y * 2.3) * 0.6 + vnoise(vWorld.xy * 7.3 - uTime * 0.2) * 0.4;
    float core = pow(sat(1.0 - abs(dot(N, V))), 1.2);
    float pulse = 0.85 + 0.15 * sin(uTime * 2.1 + vWorld.x * 0.7 + vWorld.z * 0.5);
    emit = alb * uGlow.rgb * uGlow.a * rimAmt * (0.25 + 0.9 * core + 0.8 * smoothstep(0.55, 0.8, vein)) * pulse;
    rough = 0.08;
    rimAmt = 0.4;
  } else if (pat == 15) {
    float pits = vnoise(vUv * 55.0);
    float crack = smoothstep(0.025, 0.0, abs(vnoise(vUv * 7.0) - 0.5)) * 0.7;
    alb *= (0.86 + 0.18 * pits) * (1.0 - crack * 0.6);
    rough = mix(rough, 0.9, crack);
  } else if (pat == 16) {
    // Wet skin: mottled, veined, pale suckers down the underside.
    float mott = vnoise(vUv * vec2(9.0, 4.0)) * 0.6 + vnoise(vUv * vec2(25.0, 11.0)) * 0.4;
    alb *= 0.7 + 0.55 * mott;
    float vein = smoothstep(0.03, 0.0, abs(vnoise(vUv * vec2(6.0, 2.5) + 3.0) - 0.5));
    alb = mix(alb, alb * vec3(0.6, 0.35, 0.5), vein * 0.5);
    float under = 1.0 - smoothstep(0.12, 0.2, abs(fract(vUv.x) - 0.5));
    vec2 sc = vec2(fract(vUv.x) * 9.0, vUv.y * 5.5);
    sc.y += 0.5 * mod(floor(sc.x), 2.0);
    vec2 sf = fract(sc) - 0.5;
    float sd = length(sf);
    float ring = (1.0 - smoothstep(0.26, 0.34, sd)) * under;
    float hole = (1.0 - smoothstep(0.1, 0.16, sd)) * under;
    alb = mix(alb, vec3(0.55, 0.42, 0.4), ring * 0.7);
    alb *= 1.0 - hole * 0.7;
    N = bumpNormal(N, (ring - hole) * 0.01);
    rough = 0.3;
    sheen = 0.6;
  } else if (pat == 17) {
    // Dark hammered steel, scratched, bright where the edges have worn.
    float ham = vnoise(vUv * 38.0) * 0.6 + vnoise(vUv * 90.0) * 0.4;
    float scratch = smoothstep(0.012, 0.0, abs(vnoise(vec2(vUv.x * 140.0, vUv.y * 9.0)) - 0.5)) * 0.8;
    alb *= 0.75 + 0.35 * ham + scratch * 0.9;
    rough = mix(rough, 0.25, scratch);
    N = bumpNormal(N, ham * 0.0025);
  } else if (pat == 18) {
    // Black hide over embers: short hair, and cracks glowing from within.
    float hair = vnoise(vec2(vUv.x * 380.0, vUv.y * 26.0));
    alb *= 0.8 + 0.3 * hair;
    float c = abs(vnoise(vUv * 3.2 + 1.7) - 0.5);
    float crack = smoothstep(0.03, 0.0, c) * smoothstep(0.35, 0.6, vnoise(vUv * 1.3));
    emit = vec3(1.0, 0.36, 0.08) * uGlow.a * rimAmt * crack * (0.8 + 0.2 * sin(uTime * 5.0 + vUv.y * 9.0));
    sheen = 0.3;
  } else if (pat == 7) {
    // Frosty tempered edge below a wavy hamon; mirror-polished body above it.
    float h = 0.6 + 0.07 * sin(vUv.y * 38.0) + 0.035 * sin(vUv.y * 91.0 + 1.3);
    float edgeM = smoothstep(h - 0.04, h + 0.04, vUv.x);
    rough = mix(rough, 0.3, edgeM);
    alb = mix(alb, vec3(0.93, 0.94, 0.96), edgeM);
  }
  if (bump > 0.0) N = bumpNormal(N, fabricHeight(vUv) * bump);

  float NdL = dot(N, L);
  float NdV = max(dot(N, V), 1e-3);
  float diff = max((NdL + 0.3) / 1.3, 0.0);

  // GGX specular.
  vec3 Hv = normalize(L + V);
  float NdH = max(dot(N, Hv), 0.0);
  float a2 = pow(max(rough, 0.05), 4.0);
  float dd = NdH * NdH * (a2 - 1.0) + 1.0;
  float D = a2 / (PI * dd * dd);
  float F0 = mix(0.04, 1.0, metal);
  float F = F0 + (1.0 - F0) * pow(1.0 - max(dot(Hv, V), 0.0), 5.0);
  float k = (rough + 1.0) * (rough + 1.0) / 8.0;
  float nl = max(NdL, 0.0);
  float G = (NdV / (NdV * (1.0 - k) + k)) * (nl / (nl * (1.0 - k) + k));
  float spec = D * F * G / (4.0 * NdV + 1e-3);
  vec3 specCol = mix(vec3(1.0), alb, metal);

  // Against the sun a molten edge of light wraps the silhouette.
  float fres = pow(1.0 - NdV, 3.2);
  float back = pow(sat(dot(-V, L)), 1.6);
  float rim = fres * (0.12 + 1.5 * back) * sat(NdL + 0.6) * rimAmt;

  // Tall grass swallows the light around the legs; the brim shades the face.
  float grassOcc = mix(smoothstep(0.1, 1.1, vWorld.y - uGroundY), 1.0, uArena);
  float sunVis = grassOcc * hatShadow(vWorld);
  vec3 sun = uSunColor * sunVis;
  vec3 amb = mix(uAmbGround, uAmbSky, 0.5 + 0.5 * N.y) * mix(0.5, 1.0, grassOcc) * hatOcclusion(vWorld);

  vec3 R = reflect(-V, N);
  vec3 env = envColor(R) * mix(F0, 1.0, pow(1.0 - NdV, 5.0)) * (1.0 - rough) * (1.0 - rough);

  vec3 col = alb * (1.0 - metal) * (diff * sun + amb);
  col += specCol * spec * sun;
  col += specCol * env * mix(0.25, 1.0, metal);
  col += uSunColor * rim * sunVis * mix(vec3(1.0), alb * 1.5 + 0.25, 0.35);
  // Thin cloth, straw and ears glow where the sun shines through them.
  float thru = pow(sat(dot(-V, L)), 2.5) * (0.35 + 0.65 * sat(-NdL + 0.3));
  col += alb * uSunColor * thru * trans * sunVis;
  // Torches, furnaces and lures close by; lightning; an oily sheen on scales and skin.
  if (uArena > 0.5) col += pointLights(vWorld, N, V, alb * (1.0 - metal * 0.7), rough, 0.25) * mix(1.0, 0.75, metal);
  col += alb * uFlashLight * vec3(0.55, 0.65, 1.0) * (0.35 + 0.65 * sat(N.y * 0.5 + 0.5));
  col += sheen * (vec3(0.03, 0.05, 0.06) * uAmbSky * 6.0) * pow(1.0 - NdV, 2.0);
  col += emit;
  // Struck: a brief flash that blooms around the silhouette.
  col += uFlash.rgb * uFlash.a * uFlash.a * (0.12 + 1.4 * fres);
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Per-character uniforms live on the material, the lighting ones are shared.
export function makeCharacterMaterial(shared) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uGroundY: { value: 0 },
      uHat: { value: new THREE.Vector4(0, -1000, 0, 0) },
      uFlash: { value: new THREE.Vector4(1, 1, 1, 0) },
      uGlow: { value: new THREE.Vector4(1, 1, 1, 1) },
    },
    vertexShader: vert,
    fragmentShader: frag,
    side: THREE.DoubleSide,
  });
}
