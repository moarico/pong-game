import * as THREE from 'three';
import { common, sharedUniforms, terrain, wind, atmosphere, shadow } from './glsl.js';
import { TRAIL_N } from './config.js';
import { mulberry32 } from './noise.js';

// Where along the stalk the feathery seed head begins.
const PLUME_START = 0.62;

// ---------------------------------------------------------------------------
// Blades
// ---------------------------------------------------------------------------

const bladeVert = /* glsl */ `
${common}
${sharedUniforms}
${terrain}
${wind}
#define TRAIL_N ${TRAIL_N}
attribute vec2 aOffset;
attribute vec4 aRand;
uniform float uTile;
uniform float uFadeStart;
uniform float uFadeEnd;
uniform float uWidth;
uniform float uHeight;
uniform float uLodWidth;
uniform float uInteract;
uniform vec2 uCamXZ;
uniform vec2 uCamFwdXZ;
uniform float uCullCos;
uniform vec4 uTrail[TRAIL_N];
uniform vec4 uImpact;
uniform mat4 uShadowMatrix;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vRound;
varying vec3 vAlbedo;
varying vec3 vShadow;
varying float vT;
varying float vSide;
varying float vGust;
varying float vSunVis;
flat varying float vSeed;

// Blades lean away from the samurai, from his fresh footsteps (which spring back
// slowly) and from the ring that runs out when he lands.
vec2 interaction(vec2 root) {
  vec2 push = vec2(0.0);
  for (int i = 0; i < TRAIL_N; i++) {
    vec4 tp = uTrail[i];
    vec2 d = root - tp.xy;
    float l = length(d);
    float f = tp.z * (1.0 - smoothstep(tp.w * 0.2, tp.w, l));
    push += d / max(l, 0.04) * f;
  }
  vec2 dI = root - uImpact.xy;
  float lI = length(dI);
  float ring = uImpact.z * 5.0;
  float wave = exp(-pow((lI - ring) / 0.5, 2.0)) * uImpact.w * exp(-uImpact.z * 2.2);
  push += dI / max(lI, 0.04) * wave;
  float pl = length(push);
  return pl > 1.3 ? push * (1.3 / pl) : push;
}

void main() {
  // Instances live in a tile that wraps around the camera, so the field never ends.
  vec2 root = aOffset + uTile * floor((uCamXZ - aOffset) / uTile + 0.5);
  vec2 rel = root - uCamXZ;
  float dist = length(rel);
  // Distance fade by thinning: each blade drops out at its own point, so the canopy
  // keeps its height and no ring shows where one detail level hands over to the next.
  float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, dist);
  float rank = fract(aRand.x * 7.31 + aRand.z * 3.17);
  float keep = smoothstep(rank * 0.92, rank * 0.92 + 0.08, fade);
  if (keep <= 0.0 || (dist > 4.0 && dot(rel, uCamFwdXZ) < uCullCos * dist)) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }
  float r0 = aRand.x;
  float r1 = aRand.y;
  float r2 = aRand.z;
  float r3 = aRand.w;
  float groundY = terrainHeight(root);
  float patchN = inoise(root * 0.045 + 7.0);
  float patchN2 = inoise(root * 0.21 - 3.0);
  // Nothing grows on the beach.
  float dry = smoothstep(3.0, 6.5, groundY + (patchN - 0.5) * 2.0);
  if (dry <= 0.0) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }

  float H = uHeight * mix(0.55, 1.12, r1) * mix(0.7, 1.2, patchN) * mix(0.6, 1.0, keep) * dry;
  // Never let a blade fill the lens when the camera dips into the grass.
  float camAbove = cameraPosition.y - groundY;
  H *= mix(smoothstep(0.35, 1.5, dist), 1.0, smoothstep(H + 0.1, H + 0.6, camAbove));
  // Survivors broaden a little so the field stays just as full while it thins.
  float W = uWidth * mix(0.65, 1.35, r2) * (1.0 + dist * uLodWidth) * keep * sqrt(0.92 / max(fade, 0.2));

  // Random facing, turning toward the camera with distance so far blades never go edge-on.
  float ang = r0 * TAU;
  vec2 face = vec2(cos(ang), sin(ang));
  vec2 camSide = vec2(-rel.y, rel.x) / max(dist, 1e-3);
  camSide *= sign(dot(face, camSide) + 1e-4);
  face = normalize(mix(face, camSide, smoothstep(5.0, 28.0, dist) * 0.8));

  // Wind: gust bands roll across the field; each blade also flutters on its own phase.
  float gust = windGust(root);
  float ws = uWindStrength;
  float stiff = mix(0.75, 1.3, r3);
  float phase = uTime * (1.4 + ws * 1.6 + r2 * 0.9) + dot(root, vec2(0.23, 0.17)) + r0 * TAU;
  float flutter = sin(phase) * 0.62 + sin(phase * 2.37 + r1 * 5.0) * 0.38;
  float windAmt = ws * (0.2 + 1.1 * gust) / stiff;
  vec2 perp = vec2(-uWindDir.y, uWindDir.x);
  vec2 windVec = uWindDir * (windAmt + flutter * (0.04 + 0.13 * ws * (0.35 + gust)))
               + perp * flutter * 0.07 * (0.3 + ws);

  vec2 push = uInteract > 0.5 ? interaction(root) : vec2(0.0);

  float leanAng = fract(r3 * 3.7 + r0 * 1.3) * TAU;
  // Pampas leaves spring up and arch outward under their own length.
  vec2 lean = vec2(cos(leanAng), sin(leanAng)) * mix(0.1, 0.55, fract(r1 * 13.7));
  vec2 tilt = lean * 0.45 + push * 1.1;
  vec2 curve = lean * 1.1 + windVec + push * 0.3;
  vec2 total = tilt + curve;
  float tl = length(total);
  vec2 B = tl > 1e-4 ? total / tl : vec2(1.0, 0.0);
  float a0 = dot(tilt, B);
  float cv = dot(curve, B);
  float tip = a0 + cv;
  if (abs(tip) > 1.5) {
    float k = 1.5 / abs(tip);
    a0 *= k;
    cv *= k;
  }

  // Constant-curvature arc: length-preserving, so a blade bowing in the wind shortens.
  float t = position.y;
  float side = position.x;
  float at = a0 + cv * t;
  float hz;
  float vt;
  if (abs(cv) > 1e-3) {
    hz = (cos(a0) - cos(at)) / cv;
    vt = (sin(at) - sin(a0)) / cv;
  } else {
    hz = t * sin(a0);
    vt = t * cos(a0);
  }
  vec3 spine = vec3(root.x + B.x * hz * H, groundY + vt * H, root.y + B.y * hz * H);
  vec3 T = vec3(B.x * sin(at), cos(at), B.y * sin(at));
  vec3 S0 = vec3(face.x, 0.0, face.y);
  vec3 S = S0 - dot(S0, T) * T;
  float sl = length(S);
  S = sl > 1e-3 ? S / sl : normalize(cross(T, vec3(0.0, 0.0, 1.0)) + 1e-4);
  vec3 N = cross(S, T);
  float tw = (r2 - 0.5) * 2.4 * t + flutter * 0.3 * t;
  vec3 Sx = S * cos(tw) + N * sin(tw);
  vec3 Nx = cross(Sx, T);
  float wprof = pow(1.0 - t, 0.72) * (0.8 + 0.2 * sin(t * PI));
  vec3 pos = spine + Sx * (side * 0.5 * W * wprof);

  vWorld = pos;
  vNormal = Nx;
  vRound = Sx * side;
  vT = t;
  vSide = side;
  vGust = gust;
  vSeed = floor(r0 * 4096.0) + r3;
  // Dense stems shade each other's bases; rises in the ground shade whole hollows.
  vSunVis = mix(0.12, 1.0, smoothstep(0.1, 0.9, t));

  // Light golden-brown straw, with pale bleached patches and the odd darker stem.
  vec3 cLight = vec3(0.24, 0.14, 0.045);
  vec3 cPale = vec3(0.4, 0.29, 0.13);
  vec3 cDeep = vec3(0.085, 0.055, 0.022);
  vec3 cOlive = vec3(0.17, 0.15, 0.06);
  vec3 alb = mix(cLight, cPale, r1 * 0.75 * patchN2);
  alb = mix(alb, cDeep, r3 * r3 * r3 * 0.85);
  alb = mix(alb, cOlive, smoothstep(0.58, 0.92, patchN) * 0.4 * r2);
  vAlbedo = alb;
  vShadow = (uShadowMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`;

const bladeFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
${shadow}
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vRound;
varying vec3 vAlbedo;
varying vec3 vShadow;
varying float vT;
varying float vSide;
varying float vGust;
varying float vSunVis;
flat varying float vSeed;

void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 Nf = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 N = normalize(Nf + vRound * 0.5);
  vec3 L = uSunDir;
  float t = vT;

  vec3 alb = vAlbedo * mix(0.4, 1.05, smoothstep(0.0, 0.9, t));
  alb = mix(alb, vec3(0.72, 0.6, 0.4), smoothstep(0.7, 1.0, t) * 0.35);
  // A passing gust flips blades to their paler, shinier side: the wind becomes visible.
  alb *= 1.0 + vGust * 0.32;

  float sunVis = vSunVis * charShadow(vShadow);
  float NdL = dot(N, L);
  float diff = sat(NdL * 0.55 + 0.45);
  // Looking toward the sun, light pours through the thin dry blades.
  float fwd = sat(dot(-V, L));
  float trans = (pow(fwd, 5.0) * 0.8 + pow(fwd, 1.8) * 0.16) * (0.12 + 0.88 * t * t);
  float fres = pow(1.0 - abs(dot(Nf, V)), 3.0);
  float rim = fres * fwd * fwd * (0.3 + 0.9 * t) * 1.5;
  vec3 Hv = normalize(L + V);
  float NdH = sat(dot(N, Hv));
  float spec = pow(NdH, 36.0) * 0.26 * (0.5 + vGust);
  // Glimmer: tiny facets near the blade edges catch the sun and twinkle as they flutter.
  float h = hash12(vec2(vSeed, floor(t * 42.0)));
  float spark = step(0.978, h) * smoothstep(0.62, 0.98, abs(vSide)) * step(0.4, t);
  float tw = pow(0.5 + 0.5 * sin(uTime * (4.0 + h * 8.0) + h * 80.0), 10.0);
  float glint = spark * tw * (pow(fwd, 3.0) * 5.0 + pow(NdH, 30.0) * 4.0);

  vec3 sun = uSunColor * sunVis;
  vec3 col = alb * sun * (diff + trans * vec3(1.0, 0.8, 0.55));
  col += sun * (rim * vec3(1.0, 0.86, 0.66) + spec + glint);
  col += alb * mix(uAmbGround, uAmbSky, 0.5 + 0.5 * N.y) * mix(0.3, 1.0, t);
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Susuki plumes: tall stalks topped with silky seed heads that blaze when backlit
// ---------------------------------------------------------------------------

const plumeVert = /* glsl */ `
${common}
${sharedUniforms}
${terrain}
${wind}
#define TRAIL_N ${TRAIL_N}
#define PLUME_START ${PLUME_START.toFixed(2)}
attribute vec2 aOffset;
attribute vec4 aRand;
uniform float uTile;
uniform float uFadeStart;
uniform float uFadeEnd;
uniform float uWidth;
uniform float uHeight;
uniform float uLodWidth;
uniform float uInteract;
uniform vec2 uCamXZ;
uniform vec2 uCamFwdXZ;
uniform float uCullCos;
uniform vec4 uTrail[TRAIL_N];
uniform vec4 uImpact;
uniform mat4 uShadowMatrix;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vShadow;
varying float vS;
varying float vSide;
varying float vSunVis;
flat varying float vSeed;

vec2 interaction(vec2 root) {
  vec2 push = vec2(0.0);
  for (int i = 0; i < TRAIL_N; i++) {
    vec4 tp = uTrail[i];
    vec2 d = root - tp.xy;
    float l = length(d);
    float f = tp.z * (1.0 - smoothstep(tp.w * 0.2, tp.w * 1.15, l));
    push += d / max(l, 0.04) * f;
  }
  vec2 dI = root - uImpact.xy;
  float lI = length(dI);
  float wave = exp(-pow((lI - uImpact.z * 5.0) / 0.5, 2.0)) * uImpact.w * exp(-uImpact.z * 2.2);
  push += dI / max(lI, 0.04) * wave;
  float pl = length(push);
  return pl > 1.3 ? push * (1.3 / pl) : push;
}

float a0_;
float c1_;
float droop_;
float angleAt(float s) {
  float p = max(s - PLUME_START, 0.0) / (1.0 - PLUME_START);
  return a0_ + c1_ * s + droop_ * p * p;
}

void main() {
  vec2 root = aOffset + uTile * floor((uCamXZ - aOffset) / uTile + 0.5);
  vec2 rel = root - uCamXZ;
  float dist = length(rel);
  float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, dist);
  float r0 = aRand.x;
  float r1 = aRand.y;
  float r2 = aRand.z;
  float r3 = aRand.w;
  float rank = fract(r0 * 5.13 + r3 * 2.71);
  float keep = smoothstep(rank * 0.9, rank * 0.9 + 0.1, fade);
  // Susuki grows in clumps.
  float clump = inoise(root * 0.085 + 13.0) * 0.7 + inoise(root * 0.3 - 5.0) * 0.3;
  float present = smoothstep(0.18, 0.42, clump + (r1 - 0.5) * 0.3);
  if (keep <= 0.0 || present <= 0.01 || (dist > 4.0 && dot(rel, uCamFwdXZ) < uCullCos * dist)) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }
  float groundY = terrainHeight(root);
  float patchN = inoise(root * 0.045 + 7.0);
  float dry = smoothstep(3.0, 6.5, groundY + (patchN - 0.5) * 2.0);
  if (dry <= 0.0) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }
  float H = uHeight * mix(0.8, 1.22, r1) * mix(0.85, 1.1, patchN) * present * mix(0.7, 1.0, keep) * dry;
  float camAbove = cameraPosition.y - groundY;
  H *= mix(smoothstep(0.35, 1.6, dist), 1.0, smoothstep(H * 0.8, H + 0.4, camAbove));

  // Top-heavy plumes sway slower and further than the leaves.
  float gust = windGust(root);
  float ws = uWindStrength;
  float stiff = mix(0.8, 1.25, r3);
  float phase = uTime * (0.95 + ws * 1.2 + r2 * 0.6) + dot(root, vec2(0.19, 0.13)) + r0 * TAU;
  float flutter = sin(phase) * 0.65 + sin(phase * 2.13 + r1 * 4.0) * 0.35;
  float windAmt = ws * (0.3 + 1.2 * gust) / stiff;
  vec2 perp = vec2(-uWindDir.y, uWindDir.x);
  vec2 windVec = uWindDir * (windAmt + flutter * (0.05 + 0.16 * ws * (0.35 + gust)))
               + perp * flutter * 0.08 * (0.3 + ws);
  vec2 push = uInteract > 0.5 ? interaction(root) : vec2(0.0);

  float leanAng = r3 * TAU;
  vec2 lean = vec2(cos(leanAng), sin(leanAng)) * mix(0.03, 0.22, r2);
  vec2 tilt = lean * 0.5 + push * 1.0;
  vec2 curve = lean * 0.5 + windVec * 0.8 + push * 0.25;
  vec2 total = tilt + curve;
  float tl = length(total);
  vec2 B = tl > 1e-4 ? total / tl : vec2(1.0, 0.0);
  a0_ = dot(tilt, B);
  c1_ = dot(curve, B);
  droop_ = 0.55 + 0.9 * r2 + windAmt * 0.7;
  float tipA = a0_ + c1_;
  if (abs(tipA) > 1.35) {
    float k = 1.35 / abs(tipA);
    a0_ *= k;
    c1_ *= k;
  }

  // Integrate the stalk's curve (the plume droops more than a constant arc allows).
  float t = position.y;
  float side = position.x;
  vec2 acc = vec2(0.0);
  float ds = t / 6.0;
  for (int i = 0; i < 6; i++) {
    float a = angleAt((float(i) + 0.5) * ds);
    acc += vec2(sin(a), cos(a)) * ds;
  }
  float at = angleAt(t);
  vec3 spine = vec3(root.x + B.x * acc.x * H, groundY + acc.y * H, root.y + B.y * acc.x * H);
  vec3 T = vec3(B.x * sin(at), cos(at), B.y * sin(at));
  float ang = r0 * TAU + position.z * PI * 0.5;
  vec3 S0 = vec3(cos(ang), 0.0, sin(ang));
  vec3 S = S0 - dot(S0, T) * T;
  float sl = length(S);
  S = sl > 1e-3 ? S / sl : normalize(cross(T, vec3(0.0, 0.0, 1.0)) + 1e-4);

  float s = sat((t - PLUME_START) / (1.0 - PLUME_START));
  // A slender, feathery head: narrow where it leaves the stem, fullest two thirds up,
  // tapering to a soft point.
  float wPlume = uWidth * mix(0.7, 1.3, r2) * pow(sin(PI * pow(s, 0.62)), 0.85) * (1.0 - s * 0.2);
  float w = mix(0.006, wPlume, smoothstep(0.0, 0.08, s)) * (1.0 + dist * uLodWidth) * keep;
  vec3 pos = spine + S * (side * 0.5 * w);

  vWorld = pos;
  vNormal = cross(S, T);
  vS = s;
  vSide = side;
  vSeed = floor(r0 * 4096.0) + r3;
  vSunVis = mix(0.3, 1.0, smoothstep(0.1, 0.7, t));
  vShadow = (uShadowMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
}
`;

const plumeFrag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
${shadow}
uniform float uA2C;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec3 vShadow;
varying float vS;
varying float vSide;
varying float vSunVis;
flat varying float vSeed;

void main() {
  float s = vS;
  float u = vSide;
  float isPlume = step(1e-4, s);
  float alpha = 1.0;
  vec3 alb = vec3(0.24, 0.15, 0.06);
  float glow = 1.0;
  if (isPlume > 0.5) {
    // A silky seed head like a feather: a stiff spine with tufts of fine hairs
    // sweeping up and out from it, ragged at the edges, thinning toward the tip.
    float au = abs(u);
    float pale = fract(vSeed * 0.618);
    float q = s * 24.0 - au * 1.6 + step(0.0, u) * 0.5 + vSeed * 0.37;
    float tuft = floor(q);
    float fq = fract(q);
    float h1 = hash12(vec2(tuft, vSeed));
    float h2 = hash12(vec2(tuft + 17.0, vSeed * 1.7));
    // Each tuft reaches out its own length; tufts shorten toward the tip.
    float reach = mix(0.55, 1.0, h1) * (1.0 - 0.45 * smoothstep(0.55, 1.0, s));
    float thick = 0.62 - 0.3 * au;
    float fw = fwidth(q);
    float line = smoothstep(thick + fw, thick - fw, fq);
    // Too fine to resolve: fall back to the average cover of the tufts.
    line = mix(line, thick, smoothstep(0.35, 0.9, fw));
    float edge = 1.0 - smoothstep(reach - 0.12, reach, au);
    float spine = 1.0 - smoothstep(0.08, 0.16, au);
    alpha = max(spine, line * edge) * (0.75 + 0.25 * h2);
    alpha *= smoothstep(0.0, 0.1, s);
    alb = mix(vec3(0.34, 0.22, 0.1), vec3(0.8, 0.64, 0.42), (0.4 + 0.6 * pale) * mix(0.55, 1.0, h2));
    alb = mix(alb, vec3(0.3, 0.19, 0.09), spine * 0.7);
    // Fine hairs out at the edge scatter the most light; the spine hardly any.
    glow = (0.5 + 0.8 * pale) * (0.35 + 0.9 * smoothstep(0.1, 0.8, au)) * (0.6 + 0.8 * h2);
  }
  if (uA2C < 0.5 && alpha < 0.5) discard;
  if (alpha < 0.06) discard;

  vec3 V = normalize(cameraPosition - vWorld);
  vec3 N = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 L = uSunDir;
  float fwd = sat(dot(-V, L));
  // Fine fibres scatter light forward: backlit plumes blaze gold.
  float trans = (pow(fwd, 3.0) * 0.9 + pow(fwd, 12.0) * 2.0) * mix(0.2, glow, isPlume);
  // Fluffy fibres scatter light every way: a soft, wrapped diffuse.
  float diff = mix(sat(dot(N, L) * 0.55 + 0.45), sat(dot(N, L) * 0.3 + 0.5), isPlume);
  float sunVis = vSunVis * charShadow(vShadow);
  vec3 sun = uSunColor * sunVis;
  vec3 col = alb * sun * (diff + trans * vec3(1.05, 0.9, 0.7));
  vec3 Hv = normalize(L + V);
  col += sun * alb * pow(sat(abs(dot(N, Hv))), 18.0) * 0.4 * isPlume;
  col += alb * mix(uAmbGround, uAmbSky, 0.6) * mix(0.7, 1.1, isPlume);
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, uA2C > 0.5 ? alpha : 1.0);
}
`;

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

function bladeGeometry(segments) {
  const pos = [];
  const idx = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pos.push(-1, t, 0, 1, t, 0);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

function plumeGeometry(stemSegs, plumeSegs) {
  const ts = [];
  for (let i = 0; i < stemSegs; i++) ts.push((i / stemSegs) * PLUME_START);
  for (let i = 0; i <= plumeSegs; i++) ts.push(PLUME_START + (i / plumeSegs) * (1 - PLUME_START));
  const pos = [];
  const idx = [];
  for (let strip = 0; strip < 2; strip++) {
    const base = pos.length / 3;
    for (const t of ts) pos.push(-1, t, strip, 1, t, strip);
    for (let i = 0; i < ts.length - 1; i++) {
      const a = base + i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

// Jittered-grid scatter, shuffled so any prefix of the instances is an even subset
// (quality levels simply draw fewer instances).
function scatter(count, tile, seed) {
  const rand = mulberry32(seed);
  const n = Math.ceil(Math.sqrt(count));
  const cell = tile / n;
  const total = n * n;
  const order = new Uint32Array(total);
  for (let i = 0; i < total; i++) order[i] = i;
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  const offsets = new Float32Array(total * 2);
  const rands = new Float32Array(total * 4);
  for (let k = 0; k < total; k++) {
    const i = order[k];
    const gx = i % n;
    const gz = Math.floor(i / n);
    offsets[k * 2] = -tile / 2 + (gx + rand()) * cell;
    offsets[k * 2 + 1] = -tile / 2 + (gz + rand()) * cell;
    rands[k * 4] = rand();
    rands[k * 4 + 1] = rand();
    rands[k * 4 + 2] = rand();
    rands[k * 4 + 3] = rand();
  }
  return { offsets, rands, total };
}

const BLADE_LAYERS = [
  { tile: 34, count: 56000, segments: 6, fadeStart: 8.5, fadeEnd: 16.5, width: 0.02, height: 0.92, lodWidth: 0.025, interact: 1, order: 2 },
  { tile: 92, count: 48000, segments: 4, fadeStart: 27, fadeEnd: 44, width: 0.05, height: 0.92, lodWidth: 0.02, interact: 1, order: 4 },
  { tile: 320, count: 48000, segments: 2, fadeStart: 95, fadeEnd: 152, width: 0.12, height: 0.92, lodWidth: 0.012, interact: 0, order: 5 },
];

// Seed plumes are what the eye reads as a pampas field, so they get their own dense layers.
const PLUME_LAYERS = [
  { tile: 40, count: 15000, stem: 3, plume: 9, fadeStart: 12, fadeEnd: 19.5, width: 0.046, height: 1.26, lodWidth: 0.02, interact: 1, order: 3 },
  { tile: 104, count: 20000, stem: 2, plume: 5, fadeStart: 30, fadeEnd: 50, width: 0.07, height: 1.26, lodWidth: 0.015, interact: 1, order: 4 },
  { tile: 280, count: 18000, stem: 1, plume: 3, fadeStart: 85, fadeEnd: 135, width: 0.12, height: 1.26, lodWidth: 0.01, interact: 0, order: 5 },
];

export class Grass {
  constructor(shared) {
    this.group = new THREE.Group();
    this.layers = [];
    let seed = 11;
    const add = (def, geometry, vertexShader, fragmentShader, plume) => {
      const { offsets, rands, total } = scatter(def.count, def.tile, seed++);
      geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 2));
      geometry.setAttribute('aRand', new THREE.InstancedBufferAttribute(rands, 4));
      geometry.instanceCount = total;
      const material = new THREE.ShaderMaterial({
        uniforms: {
          ...shared,
          uTile: { value: def.tile },
          uFadeStart: { value: def.fadeStart },
          uFadeEnd: { value: def.fadeEnd },
          uWidth: { value: def.width },
          uHeight: { value: def.height },
          uLodWidth: { value: def.lodWidth },
          uInteract: { value: def.interact },
          uA2C: { value: 1 },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = def.order;
      this.group.add(mesh);
      this.layers.push({ def, mesh, material, geometry, total, plume });
    };
    for (const def of BLADE_LAYERS) add(def, bladeGeometry(def.segments), bladeVert, bladeFrag, false);
    for (const def of PLUME_LAYERS) add(def, plumeGeometry(def.stem, def.plume), plumeVert, plumeFrag, true);
  }

  setQuality(q, msaa) {
    for (const l of this.layers) {
      const f = l.plume ? q.plumes : q.grass;
      l.geometry.instanceCount = Math.max(1, Math.floor(l.total * f));
      // Fewer, slightly broader blades keep the field just as full.
      l.material.uniforms.uWidth.value = l.def.width / Math.sqrt(f);
      if (l.plume) {
        const a2c = msaa > 0;
        l.material.uniforms.uA2C.value = a2c ? 1 : 0;
        if (l.material.alphaToCoverage !== a2c) {
          l.material.alphaToCoverage = a2c;
          l.material.needsUpdate = true;
        }
      }
    }
  }
}
