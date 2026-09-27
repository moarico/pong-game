import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';

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
uniform float uGroundY;
uniform vec4 uHat;
uniform vec4 uFlash;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;
varying vec4 vMat;
varying vec2 vPatRim;

// What polished steel sees: bright hazy sky above, the sunlit golden field below.
vec3 envColor(vec3 r) {
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

  if (pat == 1) {
    float a = vUv.x * TAU;
    float rr = vUv.y;
    float reeds = 0.5 + 0.5 * sin(a * 150.0 + rr * 8.0);
    float rings = smoothstep(0.75, 1.0, sin(rr * 95.0));
    alb *= 0.8 + 0.2 * reeds - 0.2 * rings;
  } else if (pat == 2) {
    alb *= 0.88 + 0.12 * step(0.66, fract(vUv.x * 28.0));
  } else if (pat == 3) {
    float z = vUv.y * 34.0;
    float d = abs(fract(z + vUv.x * 2.0) - 0.5) + abs(fract(z - vUv.x * 2.0) - 0.5);
    alb = mix(alb, vec3(0.62, 0.58, 0.5), (1.0 - smoothstep(0.5, 0.62, d)) * 0.85);
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
  float rim = fres * (0.15 + 2.4 * back) * sat(NdL + 0.6) * rimAmt;

  // Tall grass swallows the light around the legs; the brim shades the face.
  float grassOcc = smoothstep(0.1, 1.1, vWorld.y - uGroundY);
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
    },
    vertexShader: vert,
    fragmentShader: frag,
    side: THREE.DoubleSide,
  });
}
