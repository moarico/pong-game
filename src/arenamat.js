import * as THREE from 'three';
import { common, sharedUniforms, atmosphere, shadow, lights } from './glsl.js';
import { MeshBuilder } from './meshbuilder.js';

// ---------------------------------------------------------------------------
// One material for the stonework, iron, brass, timber and glass of the boss
// arenas. Like the characters' material, every vertex carries its own surface
// (albedo, roughness, metalness, glow, bump, pattern), so a whole hall draws in
// a handful of calls. Stone and rock are laid out in world space, so blocks run
// on unbroken from one piece of geometry to the next.
// ---------------------------------------------------------------------------

export const APAT = {
  plain: 0,
  ashlar: 1, // dressed stone blocks in courses (param: course height in metres)
  flags: 2, // flagstone floor (param: flag size)
  brass: 3, // brushed brass plates and rivets (mesh uv in metres)
  iron: 4, // dark riveted iron, rust running down it
  wood: 5, // planks along uv.x (param: plank width)
  rock: 6, // cave rock with strata (param: scale)
  crystal: 7, // glowing crystal (param: glow)
  glass: 8, // stained glass: coloured panes in lead (param: glow; lets the light shafts through)
  lava: 9, // molten metal or lava, crusting over (param: glow)
  grate: 10, // iron grating over a glowing pit (param: cell size)
  banner: 12, // cloth that stirs in the wind, torn at the foot (uv.y = metres below the pole)
  gold: 13, // gilding, worn to the ground beneath at the edges
  emissive: 15, // plain light (param: intensity)
};

// A surface for the arena builder: `emit` rides in the translucency slot and the
// pattern parameter in the rim slot of the shared vertex layout.
export function amat(hex, o = {}) {
  const c = new THREE.Color(hex);
  return {
    color: [c.r, c.g, c.b],
    rough: o.rough ?? 0.85,
    metal: o.metal ?? 0,
    trans: o.emit ?? 0,
    bump: o.bump ?? 1,
    pat: o.pat ?? 0,
    rim: o.param ?? 1,
  };
}

const vert = /* glsl */ `
${common}
${sharedUniforms}
attribute vec3 aColor;
attribute vec4 aMat;
attribute vec2 aPat;
uniform mat4 uShadowMatrix;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;
varying vec4 vMat;
varying vec2 vPat;
varying vec3 vShadow;
void main() {
  vec3 p = position;
  int pat = int(aPat.x + 0.5);
  if (pat == 12) {
    // Banners stir: the further below the pole, the more they swing.
    float hang = uv.y;
    float w = sin(uTime * 2.1 + uv.x * 2.5 + position.x * 0.4) * 0.6 + sin(uTime * 3.4 + uv.y * 3.1 + position.z * 0.3) * 0.4;
    p += normal * w * hang * hang * 0.09 * (0.7 + uWindStrength);
  }
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  vColor = aColor;
  vMat = aMat;
  vPat = aPat;
  vShadow = (uShadowMatrix * w).xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const frag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
${shadow}
${lights}
uniform float uFloorY;
uniform float uWaterY;
uniform vec3 uCaustic;
uniform float uWet;
uniform vec3 uGrateGlow;
uniform float uGlowPulse;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vColor;
varying vec4 vMat;
varying vec2 vPat;
varying vec3 vShadow;

float fbm3(vec2 p) {
  return vnoise(p) * 0.5 + vnoise(p * 2.03 + 1.7) * 0.3 + vnoise(p * 4.1 - 2.3) * 0.2;
}

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

// World-space layout for stone: floors take x/z, walls run along their face.
vec2 worldUV(vec3 p, vec3 N) {
  if (abs(N.y) > 0.7) return p.xz;
  vec2 t = normalize(vec2(-N.z, N.x) + vec2(1e-5, 0.0));
  return vec2(dot(p.xz, t), p.y);
}

// Courses of blocks: x = metres to the nearest joint, y/z = the block's own dice.
vec3 blocks(vec2 uv, vec2 size, float stagger) {
  vec2 g = uv / size;
  float row = floor(g.y);
  g.x += fract(row * stagger);
  vec2 id = floor(g);
  vec2 f = fract(g);
  vec2 e = min(f, 1.0 - f) * size;
  return vec3(min(e.x, e.y), hash12(id), hash12(id + 7.31));
}

// Light dancing up from the water: bright threads that wander and break.
float caustic(vec2 p, float t) {
  vec2 q = p * 1.25;
  float c = sin(q.x * 1.7 + sin(q.y * 1.3 + t * 0.9) * 1.4 + t * 1.1);
  c += sin(q.y * 1.9 + sin(q.x * 1.1 - t * 0.7) * 1.6 - t * 0.8);
  c += sin((q.x + q.y) * 1.2 + sin(q.x * 0.6 + t) * 1.2 + t * 0.6);
  c /= 3.0;
  return pow(1.0 - abs(c), 7.0);
}

// Rain rings in the puddles.
float ripples(vec2 p, float t) {
  vec2 cell = floor(p * 1.6);
  float sum = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 c = cell + vec2(float(i), float(j));
      float h = hash12(c);
      float tt = fract(t * 1.1 + h);
      vec2 centre = (c + vec2(hash12(c + 3.1), hash12(c + 5.7))) / 1.6;
      float d = length(p - centre);
      float r = tt * 0.32;
      sum += sin(clamp((d - r) * 70.0, -3.14159, 3.14159)) * (1.0 - tt) * (1.0 - smoothstep(0.0, 0.05, abs(d - r)));
    }
  }
  return sum;
}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = uSunDir;
  vec3 alb = vColor;
  float rough = vMat.x;
  float metal = vMat.y;
  float glow = vMat.z;
  float bumpK = vMat.w;
  int pat = int(vPat.x + 0.5);
  float param = vPat.y;
  vec3 emit = vec3(0.0);
  float alphaOut = 1.0;
  float h = 0.0;
  float wetMask = uWet;

  if (pat == 1 || pat == 2) {
    vec2 uv = worldUV(vWorld, N);
    vec3 b = pat == 1 ? blocks(uv, vec2(2.0, 1.0) * param, 0.618) : blocks(uv + vec2(0.0, 0.0), vec2(1.0, 1.0) * param, 0.37);
    float fw = length(fwidth(uv)) / param;
    float mortar = (1.0 - smoothstep(0.01, 0.028, b.x)) * (1.0 - smoothstep(0.05, 0.25, fw));
    float grain = fbm3(uv * 5.0);
    float chip = (1.0 - smoothstep(0.0, 0.06, b.x)) * smoothstep(0.55, 0.8, vnoise(uv * 21.0));
    alb *= mix(0.74, 1.14, b.y) * (0.82 + 0.32 * grain);
    // Stains weeping down the walls.
    float stain = smoothstep(0.45, 0.8, vnoise(vec2(uv.x * 3.0, uv.y * 0.35)));
    alb *= 1.0 - 0.25 * stain * step(abs(N.y), 0.7);
    alb = mix(alb, alb * 0.32, mortar);
    if (pat == 2) {
      float crack = (1.0 - smoothstep(0.0, 0.012, abs(vnoise(uv * 1.7 + b.z * 9.0) - 0.5))) * step(0.55, b.z);
      alb *= 1.0 - 0.55 * crack;
      h -= crack * 0.002;
    }
    h += (1.0 - mortar) * 0.003 + grain * 0.0015 - chip * 0.003;
    rough = mix(rough, 0.95, mortar);
  } else if (pat == 3) {
    vec2 g = vUv * 1.4;
    vec2 f = fract(g);
    float e = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    float fw = length(fwidth(g));
    float seam = (1.0 - smoothstep(0.0, 0.025, e)) * (1.0 - smoothstep(0.08, 0.3, fw));
    vec2 rv = fract(g * 7.0) - 0.5;
    float rivet = (1.0 - smoothstep(0.16, 0.26, length(rv))) * step(e, 0.075) * (1.0 - smoothstep(0.05, 0.2, fw));
    float brush = vnoise(vec2(vUv.x * 240.0, vUv.y * 5.0));
    float patina = smoothstep(0.58, 0.82, fbm3(vUv * 2.2));
    alb *= 0.82 + 0.3 * brush;
    alb = mix(alb, vec3(0.1, 0.24, 0.19), patina * 0.65 + seam * 0.35);
    metal = mix(metal, 0.15, patina * 0.8 + seam * 0.5);
    rough = mix(rough, 0.7, patina);
    rough = mix(rough, 0.2, rivet);
    h += rivet * 0.004 * (0.3 - length(rv)) - seam * 0.0015;
  } else if (pat == 4) {
    vec2 g = vUv * 1.2;
    vec2 f = fract(g);
    float e = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    vec2 rv = fract(g * 6.0) - 0.5;
    float rivet = (1.0 - smoothstep(0.14, 0.24, length(rv))) * step(e, 0.08);
    float rust = smoothstep(0.58, 0.9, vnoise(vec2(vUv.x * 6.0, vUv.y * 0.9)) * 0.7 + vnoise(vUv * 13.0) * 0.3);
    float seam = 1.0 - smoothstep(0.0, 0.02, e);
    alb *= 0.8 + 0.3 * vnoise(vUv * 30.0);
    alb = mix(alb, vec3(0.16, 0.07, 0.035), rust * 0.6);
    alb *= 1.0 - seam * 0.5;
    rough = mix(rough, 0.95, rust);
    metal = mix(metal, 0.1, rust);
    h += rivet * 0.004 * (0.3 - length(rv)) + rust * 0.0008;
  } else if (pat == 5) {
    float w = max(param, 0.05);
    float row = floor(vUv.y / w);
    float fy = fract(vUv.y / w);
    float gap = 1.0 - smoothstep(0.0, 0.05, min(fy, 1.0 - fy));
    float id = hash12(vec2(row, 3.0));
    float grain = vnoise(vec2(vUv.x * 1.6 + id * 30.0, vUv.y * 38.0)) * 0.6 + vnoise(vec2(vUv.x * 6.0, vUv.y * 90.0 + id * 9.0)) * 0.4;
    float knot = 1.0 - smoothstep(0.0, 0.08, length(vec2(fract(vUv.x * 0.4 + id) - 0.5, (fy - 0.5) * w * 3.0)));
    alb *= (0.72 + 0.4 * id) * (0.8 + 0.35 * grain) * (1.0 - knot * 0.4);
    alb *= 1.0 - gap * 0.7;
    h += grain * 0.0015 - gap * 0.002;
  } else if (pat == 6) {
    vec3 q = vWorld * 0.9 / max(param, 0.1);
    float n = vnoise(q.xz + q.y * 0.7) * 0.5 + vnoise(q.xy * 2.1 + 3.0) * 0.3 + vnoise(q.zy * 4.3 - 1.0) * 0.2;
    float strata = 0.5 + 0.5 * sin(vWorld.y * 4.0 / param + n * 5.0);
    alb *= (0.6 + 0.6 * n) * mix(0.85, 1.1, strata);
    h += n * 0.02 + strata * 0.004;
    // Seeping wet streaks.
    wetMask = max(wetMask, smoothstep(0.62, 0.8, vnoise(vec2(q.x * 2.0 + q.z, q.y * 0.3))) * 0.8);
  } else if (pat == 7) {
    float vein = vnoise(vWorld.xz * 2.1 + vWorld.y * 1.9) * 0.6 + vnoise(vWorld.xy * 5.3 - uTime * 0.2) * 0.4;
    float core = pow(sat(1.0 - abs(dot(N, V))), 1.3);
    float pulse = 0.8 + 0.2 * sin(uTime * 1.7 + vWorld.x * 0.5 + vWorld.z * 0.3) * uGlowPulse + 0.2 * (1.0 - uGlowPulse);
    emit = alb * param * (0.2 + 0.9 * core + 0.9 * smoothstep(0.55, 0.8, vein)) * pulse;
    alb *= 0.35;
    rough = 0.08;
  } else if (pat == 8) {
    // Stained glass: jittered panes, each its own colour, leaded dark.
    vec2 g = vUv * 2.4;
    vec2 id = floor(g);
    vec2 f = fract(g);
    float best = 9.0;
    float second = 9.0;
    vec2 bestId = id;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 c = id + vec2(float(i), float(j));
        vec2 o = vec2(hash12(c), hash12(c + 11.7)) * 0.8 + 0.1;
        float d = length(g - c - o);
        if (d < best) {
          second = best;
          best = d;
          bestId = c;
        } else if (d < second) {
          second = d;
        }
      }
    }
    float fw = length(fwidth(g));
    float lead = (1.0 - smoothstep(0.03, 0.07, second - best)) * (1.0 - smoothstep(0.15, 0.5, fw));
    float k = hash12(bestId + 3.3);
    vec3 pane = k < 0.42 ? vec3(0.2, 0.45, 1.0) : k < 0.66 ? vec3(0.25, 0.9, 0.85) : k < 0.8 ? vec3(1.0, 0.78, 0.3) : k < 0.9 ? vec3(0.95, 0.25, 0.15) : vec3(0.6, 0.35, 1.0);
    // Too fine to make out: the window's average glow.
    pane = mix(pane, vec3(0.42, 0.62, 0.9), smoothstep(0.2, 0.7, fw));
    pane = mix(pane, alb, 0.45);
    float grime = 0.7 + 0.3 * vnoise(vUv * 1.3);
    emit = pane * param * grime * (1.0 - lead * 0.92);
    alb = vec3(0.02);
    rough = 0.3;
    alphaOut = 1.0 - smoothstep(0.6, 3.0, dot(emit, vec3(0.33)));
  } else if (pat == 9) {
    vec2 uv = worldUV(vWorld, N) * 0.8;
    float flow = fbm3(uv * 1.3 + vec2(uTime * 0.12, uTime * 0.05));
    float flow2 = fbm3(uv * 3.1 - vec2(uTime * 0.21, -uTime * 0.07));
    float crust = smoothstep(0.5, 0.64, flow * 0.7 + flow2 * 0.3);
    vec3 hot = mix(vec3(1.0, 0.28, 0.03), vec3(1.0, 0.8, 0.35), smoothstep(0.2, 0.0, flow2 - 0.3));
    emit = hot * param * (1.0 - crust) * (0.8 + 0.2 * sin(uTime * 3.0 + flow * 12.0));
    alb = mix(vec3(0.04, 0.025, 0.02), vec3(0.1, 0.05, 0.03), flow);
    rough = mix(0.5, 0.9, crust);
    h += crust * 0.01;
  } else if (pat == 10) {
    vec2 g = vWorld.xz / max(param, 0.05);
    vec2 f = fract(g);
    float bar = max(step(0.78, f.x), step(0.78, f.y));
    float fw = length(fwidth(g));
    bar = mix(bar, 0.4, smoothstep(0.2, 0.6, fw));
    float heat = 0.7 + 0.3 * sin(uTime * 2.3 + vWorld.x * 0.8) * sin(uTime * 1.7 + vWorld.z * 0.6);
    emit = uGrateGlow * (1.0 - bar) * heat * (0.8 + 0.4 * fbm3(vWorld.xz * 0.7 + uTime * 0.3));
    alb *= mix(0.05, 1.0, bar);
    metal = bar * metal;
    h += bar * 0.004;
  } else if (pat == 12) {
    // Cloth: a coarse weave, faded, torn at the foot.
    float fw = length(fwidth(vUv));
    float weave = vnoise(vUv * vec2(120.0, 110.0));
    alb *= 0.85 + 0.25 * weave * (1.0 - smoothstep(0.02, 0.1, fw));
    float tear = param - 0.15 - 0.35 * vnoise(vec2(vUv.x * 5.0, 1.0)) - 0.2 * vnoise(vec2(vUv.x * 17.0, 2.0));
    if (vUv.y > tear) discard;
    if (vnoise(vUv * vec2(7.0, 5.0)) > 0.84) discard;
    alb *= mix(1.0, 0.6, smoothstep(tear - 0.3, tear, vUv.y));
  } else if (pat == 13) {
    float wear = smoothstep(0.55, 0.8, fbm3(vUv * 4.0));
    alb = mix(alb, vec3(0.08, 0.07, 0.06), wear);
    metal = mix(metal, 0.0, wear);
    rough = mix(rough, 0.9, wear);
    h += (1.0 - wear) * 0.001;
  } else if (pat == 15) {
    emit = alb * param;
    alphaOut = 1.0 - smoothstep(1.0, 4.0, dot(emit, vec3(0.33)));
  }
  if (bumpK > 0.0 && h != 0.0) N = bumpNormal(N, h * bumpK);

  // Water: damp stone above the tideline, caustics dancing on walls and floor.
  float damp = 1.0 - smoothstep(uWaterY + 0.1, uWaterY + 1.2 + vnoise(vWorld.xz * 0.8 + vWorld.y) * 0.8, vWorld.y);
  if (uCaustic.r + uCaustic.g + uCaustic.b > 0.0) {
    alb = mix(alb, alb * vec3(0.55, 0.68, 0.62), damp * 0.8);
    rough = mix(rough, 0.35, damp * 0.6);
  }

  // Rain: darker, glossier, puddles in the hollows of the floor with rings in them.
  float puddle = 0.0;
  if (wetMask > 0.0) {
    alb *= mix(1.0, 0.55, wetMask);
    rough = mix(rough, 0.18, wetMask * 0.8);
    if (N.y > 0.85 && uWet > 0.0) {
      puddle = smoothstep(0.63, 0.69, fbm3(vWorld.xz * 0.23));
      if (puddle > 0.0) {
        float r = ripples(vWorld.xz, uTime);
        N = normalize(N + vec3(r * 0.08, 0.0, r * 0.05) * puddle);
        rough = mix(rough, 0.03, puddle);
        alb = mix(alb, alb * 0.3, puddle);
      }
    }
  }

  float NdL = dot(N, L);
  float NdV = max(dot(N, V), 1e-3);
  float sh = charShadow(vShadow);
  vec3 sun = uSunColor * sh;
  vec3 amb = mix(uAmbGround, uAmbSky, N.y * 0.5 + 0.5);
  // Corners and the foot of walls see less of the hall.
  float ao = mix(0.5, 1.0, smoothstep(0.0, 2.2, vWorld.y - uFloorY + (N.y > 0.7 ? 1.5 : 0.0)));

  vec3 Hv = normalize(L + V);
  float NdH = max(dot(N, Hv), 0.0);
  float a2 = pow(max(rough, 0.04), 4.0);
  float dd = NdH * NdH * (a2 - 1.0) + 1.0;
  float D = a2 / (PI * dd * dd);
  float F0 = mix(0.04, 1.0, metal);
  float F = F0 + (1.0 - F0) * pow(1.0 - max(dot(Hv, V), 0.0), 5.0);
  float nl = max(NdL, 0.0);
  float k = (rough + 1.0) * (rough + 1.0) / 8.0;
  float G = (NdV / (NdV * (1.0 - k) + k)) * (nl / (nl * (1.0 - k) + k));
  float spec = D * F * G / (4.0 * NdV + 1e-3);
  vec3 specCol = mix(vec3(1.0), alb, metal);

  vec3 R = reflect(-V, N);
  vec3 env = mix(uEnvGround, uEnvSky, smoothstep(-0.35, 0.45, R.y));
  float Fr = F0 + (1.0 - F0) * pow(1.0 - NdV, 5.0);

  vec3 col = alb * (1.0 - metal) * (nl * sun + amb * ao);
  col += specCol * spec * sun;
  col += specCol * env * Fr * (1.0 - rough) * (1.0 - rough) * mix(0.35, 1.0, metal) * ao;
  col += pointLights(vWorld, N, V, alb * (1.0 - metal * 0.7), rough, 0.15) * mix(1.0, 0.8, metal);
  if (uCaustic.r + uCaustic.g + uCaustic.b > 0.0) {
    float under = 1.0 - smoothstep(uWaterY - 0.05, uWaterY + 0.05, vWorld.y);
    float above = (1.0 - smoothstep(uWaterY, uWaterY + 2.8, vWorld.y)) * (1.0 - under) * (1.0 - smoothstep(0.7, 0.95, N.y));
    float c = caustic(vWorld.xz + vWorld.y * 0.35, uTime);
    col += uCaustic * c * (under * 1.0 + above * 0.5) * mix(0.6, 1.0, sat(N.y));
  }
  // Lightning floods the upward faces with cold light.
  col += (alb + specCol * (1.0 - rough) * 0.3) * uFlashLight * vec3(0.55, 0.65, 1.0) * (0.25 + 0.75 * sat(N.y * 0.6 + 0.4));
  col += puddle * env * 0.35;
  col += emit + alb * glow;
  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, alphaOut);
}
`;

export function makeArenaMaterial(shared, o = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uFloorY: { value: o.floorY ?? 0 },
      uWaterY: { value: o.waterY ?? -100 },
      uCaustic: { value: new THREE.Vector3(...(o.caustic || [0, 0, 0])) },
      uWet: { value: o.wet ?? 0 },
      uGrateGlow: { value: new THREE.Vector3(...(o.grateGlow || [2.5, 0.7, 0.15])) },
      uGlowPulse: { value: o.glowPulse ?? 1 },
    },
    vertexShader: vert,
    fragmentShader: frag,
    side: o.side ?? THREE.FrontSide,
  });
}

// ---------------------------------------------------------------------------
// Building blocks for arenas. Everything lands in one MeshBuilder (no bones);
// uv is in metres wherever a pattern reads it.
// ---------------------------------------------------------------------------

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();

export function place(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _e.set(rx, ry, rz, 'YXZ');
  _q.setFromEuler(_e);
  _s.set(sx, sy, sz);
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), _q, _s);
}

export class ArenaBuilder extends MeshBuilder {
  constructor() {
    super(null);
  }

  // A three.js geometry with uv rescaled to metres (su x sv).
  geo(geometry, m, matrix, su = 1, sv = 1) {
    this.add(geometry, m, null, { matrix, uvFn: (p, u, v) => [u * su, v * sv] });
    geometry.dispose();
  }

  box(w, h, d, m, matrix) {
    const g = new THREE.BoxGeometry(w, h, d);
    // Per-face uv in metres: each face's own extent.
    const uv = g.attributes.uv;
    const n = g.attributes.normal;
    for (let i = 0; i < uv.count; i++) {
      const nx = Math.abs(n.getX(i));
      const ny = Math.abs(n.getY(i));
      const su = nx > 0.5 ? d : w;
      const sv = ny > 0.5 ? d : h;
      uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    }
    this.add(g, m, null, { matrix });
    g.dispose();
  }

  cylinder(rTop, rBot, h, m, matrix, radial = 16, open = false) {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, radial, 1, open);
    this.geo(g, m, matrix, Math.PI * (rTop + rBot), h);
  }

  // Lathe a profile [[r, y], ...] around Y.
  lathe(profile, m, matrix, segs = 24) {
    const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, segs);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += pts[i].distanceTo(pts[i - 1]);
    const circ = Math.PI * 2 * Math.max(...profile.map((p) => p[0]));
    this.geo(g, m, matrix, circ, len);
  }

  // A flat-faceted crystal: a hexagonal prism with a pointed tip.
  crystal(r, h, m, matrix, sides = 6, tip = 0.35) {
    const pts = [
      new THREE.Vector2(0.001, -0.1 * h),
      new THREE.Vector2(r * 0.85, 0),
      new THREE.Vector2(r, h * (1 - tip) * 0.5),
      new THREE.Vector2(r * 0.9, h * (1 - tip)),
      new THREE.Vector2(0.001, h),
    ];
    const g = new THREE.LatheGeometry(pts, sides).toNonIndexed();
    g.computeVertexNormals();
    this.add(g, m, null, { matrix });
    g.dispose();
  }

  // Extrude a 2D shape (THREE.Shape) by depth along +Z, then place it.
  extrude(shape, depth, m, matrix, bevel = 0) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 1,
      curveSegments: 10,
    });
    this.add(g, m, null, { matrix, uvFn: (p, u, v) => [u, v] });
    g.dispose();
  }

  torus(R, r, m, matrix, radial = 10, tubular = 32, arc = Math.PI * 2) {
    const g = new THREE.TorusGeometry(R, r, radial, tubular, arc);
    this.geo(g, m, matrix, R * arc, r * Math.PI * 2);
  }

  mesh(material) {
    const mesh = new THREE.Mesh(this.build(), material);
    mesh.frustumCulled = false;
    return mesh;
  }
}

// A toothed gear outline (in XY), with a bore and optional spoke cut-outs.
export function gearShape(r, teeth, { tooth = 0.12, bore = 0.18, spokes = 0, rim = 0.22 } = {}) {
  const shape = new THREE.Shape();
  const ro = r;
  const ri = r * (1 - tooth);
  const n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = i % 4;
    const rr = k === 1 || k === 2 ? ro : ri;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, r * bore, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  // Spoked gears: windows between the hub and the rim.
  if (spokes > 0) {
    const inner = r * bore * 1.8;
    const outer = ri * (1 - rim);
    for (let s = 0; s < spokes; s++) {
      const a0 = (s / spokes) * Math.PI * 2 + 0.18;
      const a1 = ((s + 1) / spokes) * Math.PI * 2 - 0.18;
      const w = new THREE.Path();
      w.moveTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
      for (let i = 0; i <= 8; i++) {
        const a = a0 + ((a1 - a0) * i) / 8;
        w.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      }
      w.lineTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
      w.closePath();
      shape.holes.push(w);
    }
  }
  return shape;
}

// A pointed (gothic) arch outline: springing at y0, span w, rise to the apex.
export function pointedArch(w, y0, rise, n = 10) {
  const r = (w * w * 0.25 + rise * rise) / w; // circle radius through springers and apex
  const pts = [];
  const cx = -w / 2 + r;
  const a0 = Math.PI;
  const a1 = Math.atan2(rise, -cx);
  for (let i = 0; i <= n; i++) {
    // Left arc from the springer to the apex.
    const a = a0 + (a1 - a0) * (i / n);
    pts.push([cx + Math.cos(a) * r, y0 + Math.sin(a) * r]);
  }
  for (let i = n - 1; i >= 0; i--) pts.push([-pts[i][0], pts[i][1]]);
  return pts;
}
