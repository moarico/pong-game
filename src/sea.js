import * as THREE from 'three';
import { common, sharedUniforms, atmosphere, terrain as terrainGLSL } from './glsl.js';
import { SUN_AZIMUTH } from './config.js';

// ---------------------------------------------------------------------------
// The bay: an evening sea that mirrors the glowing sky, with a road of glitter
// running out to the sun. Wind waves and a long swell roll in toward the land;
// the water is clear and green over the shallows and dark over the deep, and
// foam laps at the shore. One large disc follows the camera. How deep the water
// is comes from a map of the seabed baked once at startup (and, right at the
// shore, from the terrain itself), so the waterline is soft, never a hard seam.
// ---------------------------------------------------------------------------

// The baked map covers this square around the spawn (metres).
const MAP_SIZE = 16000;
const MAP_RES = 1024;

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
${terrainGLSL}
${atmosphere}
uniform sampler2D uSeabed;
uniform float uMapSize;
uniform float uMapOk;
uniform vec2 uSwell;
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

// Slope of the sea surface: a long swell rolling in toward the land and wind
// waves scattered around it, each travelling at its own deep-water speed and
// gathering into groups that come and go, then fine ripples. Waves too small for
// the pixel are dropped and become roughness.
vec2 waveSlope(vec2 p, float footprint, out float rough, out float crest) {
  vec2 g = vec2(0.0);
  float lost = 0.0;
  crest = 0.0;
  float base = atan(uSwell.y, uSwell.x);
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    float L = 52.0 * pow(0.72, fi);
    // Long waves keep to the swell; short ones come from all around.
    float ang = base + (hash12(vec2(fi, 3.7)) - 0.5) * (0.5 + fi * 0.16);
    vec2 d = vec2(cos(ang), sin(ang));
    float k = TAU / L;
    float w = sqrt(9.81 * k);
    float keep = 1.0 - smoothstep(0.6, 1.6, footprint * 2.2 / L);
    if (keep <= 0.0) {
      lost += pow(L * 0.009 * k, 2.0);
      continue;
    }
    // Groups: each train swells and fades across the water.
    float grp = vnoise(p / (L * 5.0) + vec2(fi * 7.31, fi * 3.17) + d * uTime * 0.02);
    float A = L * 0.009 * (0.35 + 1.3 * grp);
    float ph = k * dot(d, p) - w * uTime + fi * 1.9;
    // A trochoid leans its crests forward: sharpen the slope on the front face.
    float sn = sin(ph);
    float cs = cos(ph);
    g += d * (A * k * cs * (1.0 + 0.35 * sn)) * keep;
    lost += (A * k) * (A * k) * (1.0 - keep);
    crest += smoothstep(0.6, 1.0, sn) * keep * A * k * 5.0;
  }
  // Cat's-paw ripples where the gusts touch the water.
  float amp = 0.05;
  float freq = 1.1;
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  vec2 q = p;
  for (int i = 0; i < 3; i++) {
    float keep = 1.0 - smoothstep(0.35, 1.2, footprint * freq);
    g += noised(q * freq + uWindDir * uTime * (0.8 + float(i) * 0.5)).xy * amp * keep;
    lost += amp * amp * (1.0 - keep) * 0.5;
    q = m * q;
    amp *= 0.55;
    freq *= 2.1;
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

// Metres of water below this point of the surface.
float waterDepth(vec2 p, float dist) {
  vec2 uv = p / uMapSize + 0.5;
  float baked = texture(uSeabed, clamp(uv, 0.0, 1.0)).r;
  bool inMap = uMapOk > 0.5 && uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0;
  float ground = inMap ? baked : -60.0;
  // Close to the shore, ask the terrain itself: the waterline is exact.
  if ((ground > -8.0 && dist < 2500.0) || (uMapOk < 0.5 && dist < 900.0)) ground = terrainHeight(p);
  return -ground;
}

void main() {
  vec3 toCam = cameraPosition - vWorld;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  // How many metres of sea one pixel covers, stretched at grazing angles.
  float footprint = dist * 0.0016 / max(V.y, 0.03);
  float depth = waterDepth(vWorld.xz, dist);
  if (depth < -0.5) discard;
  float rough;
  float crest;
  vec2 g = waveSlope(vWorld.xz, footprint, rough, crest);
  // Waves flatten out as the water shoals.
  float calm = smoothstep(0.0, 3.0, depth);
  g *= mix(0.35, 1.0, calm);
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  float NdV = max(dot(N, V), 1e-3);
  vec3 R = reflect(-V, N);
  R.y = abs(R.y);

  float F = 0.02 + 0.98 * pow(1.0 - NdV, 5.0);
  vec3 refl = skyAbove(R) * 0.6;
  // The water itself: clear green over sand in the shallows, dark and blue in the
  // deep, lit a little by the low sun shining through the wave crests.
  float murk = 1.0 - exp(-max(depth, 0.0) * 0.28);
  vec3 shallow = vec3(0.07, 0.13, 0.1);
  vec3 deep = vec3(0.004, 0.016, 0.026);
  vec3 body = mix(shallow, deep, murk);
  float fwd = sat(dot(-V, uSunDisc));
  body += uSunColor * vec3(0.02, 0.05, 0.04) * crest * pow(fwd, 3.0) * (0.3 + 0.7 * murk);
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

  // Surf: bands of foam running in over the shallows and a lace of it at the edge,
  // broken up so it never looks drawn.
  float shore = 1.0 - smoothstep(0.0, 2.6, depth);
  float lace = vnoise(vWorld.xz * 0.9 + uTime * 0.15) * 0.6 + vnoise(vWorld.xz * 2.7 - uTime * 0.1) * 0.4;
  float bands = sin(depth * 4.2 + uTime * 1.35 + lace * 2.5) * 0.5 + 0.5;
  float foam = shore * smoothstep(0.62, 0.92, bands) * smoothstep(0.35, 0.7, lace);
  foam = max(foam, (1.0 - smoothstep(0.0, 0.45, depth)) * smoothstep(0.25, 0.6, lace));
  foam += crest * 0.12 * calm * (1.0 - smoothstep(60.0, 400.0, dist));
  foam = sat(foam) * (1.0 - smoothstep(600.0, 1800.0, dist));
  vec3 foamCol = (uSunColor * (0.18 + 0.5 * pow(fwd, 2.0)) + uAmbSky * 0.9) * vec3(0.9, 0.9, 0.86);
  col = mix(col, foamCol, foam * 0.85);

  col = applyFog(col, vWorld);
  // Shallow water shows the seabed through it; the edge fades out to nothing.
  float alpha = mix(0.35, 1.0, murk) * smoothstep(0.0, 0.25, depth);
  alpha = max(alpha, foam * smoothstep(-0.05, 0.1, depth));
  gl_FragColor = vec4(col, alpha);
}
`;

// Bakes the terrain's height over the bay into a texture, once.
const bakeFrag = /* glsl */ `
${common}
uniform vec3 uSunDir;
${terrainGLSL}
uniform float uMapSize;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * uMapSize;
  gl_FragColor = vec4(terrainHeight(p), 0.0, 0.0, 1.0);
}
`;

export class Sea {
  constructor(shared, level = 0) {
    const g = new THREE.CircleGeometry(1, 96);
    const swell = new THREE.Vector2(-Math.sin(SUN_AZIMUTH), Math.cos(SUN_AZIMUTH));
    this.map = new THREE.WebGLRenderTarget(MAP_RES, MAP_RES, {
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      generateMipmaps: false,
    });
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uCenter: { value: new THREE.Vector2() },
        uRadius: { value: 42000 },
        uLevel: { value: level },
        uSeabed: { value: this.map.texture },
        uMapSize: { value: MAP_SIZE },
        uMapOk: { value: 0 },
        uSwell: { value: swell },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      // Colour blends over the seabed; the alpha channel (the light-shaft mask) keeps
      // what the ground beneath wrote.
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
    // After the ground (so hidden sea is rejected early), before the sky.
    this.mesh.renderOrder = 8;
  }

  // Use a height map baked elsewhere (red = height, same extent as MAP_SIZE).
  useMap(texture) {
    this.map.dispose();
    this.material.uniforms.uSeabed.value = texture;
    this.material.uniforms.uMapOk.value = 1;
  }

  // Render the seabed map. Call once, after the renderer exists, if it can draw
  // into half-float targets; without the map the shore is found the slow way.
  bake(renderer) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uMapSize: { value: MAP_SIZE } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: bakeFrag,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(this.map);
    renderer.render(quad, new THREE.Camera());
    renderer.setRenderTarget(prev);
    this.material.uniforms.uMapOk.value = 1;
    mat.dispose();
    quad.geometry.dispose();
  }

  update(camera) {
    this.material.uniforms.uCenter.value.set(camera.position.x, camera.position.z);
  }
}
