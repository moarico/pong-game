import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';

// ---------------------------------------------------------------------------
// The bay: a still evening sea that mirrors the glowing sky, with a road of
// glitter running out to the sun. One large disc that follows the camera; the
// terrain drawn before it shows through wherever the land stands above the water.
// ---------------------------------------------------------------------------

const vert = /* glsl */ `
uniform vec2 uCenter;
uniform float uRadius;
uniform float uLevel;
varying vec3 vWorld;
void main() {
  vec3 w = vec3(uCenter.x + position.x * uRadius, uLevel, uCenter.y - position.y * uRadius);
  vWorld = w;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
`;

const frag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
varying vec3 vWorld;

// Value noise with its analytic gradient (xy) and value (z).
vec3 noised(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 du = 6.0 * f * (1.0 - f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return vec3(du * (vec2(b - a, c - a) + (a - b - c + d) * u.yx), a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y);
}

// Wave slopes: long swell rolling in from the sea, chop on top, drifting with time.
// Detail the pixel can't resolve is dropped and returned as roughness instead.
vec2 waveSlope(vec2 p, float footprint, out float rough) {
  vec2 g = vec2(0.0);
  float amp = 0.34;
  float freq = 0.045;
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  vec2 drift = vec2(0.9, 0.35) * uTime;
  float lost = 0.0;
  for (int i = 0; i < 6; i++) {
    // Octaves finer than the pixel fade out and add to the roughness.
    float keep = 1.0 - smoothstep(0.35, 1.2, footprint * freq);
    vec2 q = p * freq + drift * freq * (1.0 + float(i) * 0.4);
    g += noised(q).xy * amp * keep;
    lost += amp * amp * (1.0 - keep);
    p = m * p;
    amp *= 0.56;
    freq *= 2.05;
  }
  rough = sqrt(lost);
  return g;
}

vec3 skyAbove(vec3 r) {
  float h = max(r.y, 0.0);
  float s = dot(r, uSunDisc);
  vec3 horizon = hazeColor(r);
  vec3 zenith = mix(vec3(0.17, 0.27, 0.54), vec3(0.55, 0.52, 0.66), pow(s * 0.5 + 0.5, 8.0));
  vec3 col = mix(horizon, zenith, 1.0 - exp(-h * 9.0));
  col += uSunColor * (0.04 * pow(sat(s), 5.0) + 0.3 * pow(sat(s), 40.0));
  // The underside of the cloud deck, dimly, higher up.
  return col * mix(1.0, 0.72, smoothstep(0.05, 0.4, h));
}

void main() {
  vec3 toCam = cameraPosition - vWorld;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  // How many metres of sea one pixel covers, stretched at grazing angles.
  float footprint = dist * 0.0016 / max(V.y, 0.03);
  float rough;
  vec2 g = waveSlope(vWorld.xz, footprint, rough);
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  float NdV = max(dot(N, V), 1e-3);
  vec3 R = reflect(-V, N);
  R.y = abs(R.y);

  float F = 0.02 + 0.98 * pow(1.0 - NdV, 5.0);
  // Ripples tilt the mirror toward darker, higher sky and scatter it: the sea reads
  // darker than the air above it, except in the glow under the sun.
  vec3 refl = skyAbove(R) * 0.4;
  // Deep, dark water; a little sunlight scattered back up out of it.
  vec3 body = vec3(0.006, 0.014, 0.02) + uSunColor * vec3(0.01, 0.012, 0.01) * sat(dot(-V, uSunDisc) * 0.5 + 0.5);
  vec3 col = mix(body, refl, F);

  // The glitter road: the sun's reflection spread by the waves (GGX), wider where
  // the waves are too small to see.
  vec3 L = uSunDisc;
  vec3 Hv = normalize(L + V);
  float NdH = max(dot(N, Hv), 0.0);
  float a = clamp(0.022 + rough * 0.12, 0.022, 0.075);
  float a2 = a * a;
  float dd = NdH * NdH * (a2 - 1.0) + 1.0;
  float D = a2 / (PI * dd * dd);
  float NdL = max(dot(N, L), 0.0);
  float Fs = 0.02 + 0.98 * pow(1.0 - max(dot(Hv, V), 0.0), 5.0);
  float k = a * 0.5;
  float G = NdL / (NdL * (1.0 - k) + k) / (NdV * (1.0 - k) + k);
  float spec = D * Fs * G * 0.25;
  // Sparkle: single facets catching the sun up close.
  vec2 cell = floor(vWorld.xz * 3.0);
  float tw = step(0.985, hash12(cell + floor(uTime * 6.0)));
  spec *= 1.0 + tw * 4.0 * (1.0 - smoothstep(20.0, 300.0, dist));
  col += uSunColor * spec * 1.6 * smoothstep(-0.02, 0.05, L.y);

  col = applyFog(col, vWorld);
  gl_FragColor = vec4(col, 1.0);
}
`;

export class Sea {
  constructor(shared, level = 0) {
    const g = new THREE.CircleGeometry(1, 96);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uCenter: { value: new THREE.Vector2() },
        uRadius: { value: 42000 },
        uLevel: { value: level },
      },
      vertexShader: vert,
      fragmentShader: frag,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
    // After the ground (so hidden sea is rejected early), before the sky.
    this.mesh.renderOrder = 8;
  }

  update(camera) {
    this.material.uniforms.uCenter.value.set(camera.position.x, camera.position.z);
  }
}
