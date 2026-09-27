import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';

// Drawn at the far plane, so it only fills what nothing else covers.
const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * viewMatrix * (modelMatrix * vec4(position, 1.0));
  gl_Position = p.xyww;
}
`;

const frag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
uniform vec2 uCloudOffset;
uniform float uSunIntensity;
varying vec3 vDir;

float fbm(vec2 p, int octaves) {
  float s = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    s += a * vnoise(p);
    p = m * p + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

// Cloud cover: broken banks of puffy cumulus, thickest in a band across the middle
// of the sky. A warp of the coordinates rounds the lumps into billows.
float cloudField(vec2 p, int octaves) {
  vec2 w = vec2(vnoise(p * 0.55 + vec2(2.3, 7.1)), vnoise(p * 0.55 + vec2(8.9, 1.7))) - 0.5;
  float n = fbm(p + w * 1.1, octaves);
  float big = vnoise(p * 0.17 + vec2(3.1, 7.7)) * 0.65 + vnoise(p * 0.41 + vec2(-2.3, 1.3)) * 0.35;
  return n + (big - 0.5) * 0.62;
}

float cover(float c) {
  return smoothstep(0.5, 0.61, c);
}

// Clear evening air: a deep, slightly smoky blue overhead over a warm band of haze
// along the horizon, and a glow around the sun.
vec3 skyBase(vec3 v) {
  float h = max(v.y, 0.0);
  float s = dot(v, uSunDisc);
  vec3 horizon = hazeColor(v);
  vec3 zenith = mix(vec3(0.17, 0.27, 0.54), vec3(0.55, 0.52, 0.66), pow(s * 0.5 + 0.5, 8.0));
  vec3 col = mix(horizon, zenith, 1.0 - exp(-h * 9.0));
  // Opposite the sun, a rosy band over the horizon (the belt of Venus).
  col += vec3(0.34, 0.18, 0.17) * pow(sat(-s), 2.0) * exp(-pow((h - 0.1) / 0.075, 2.0));
  float sc = sat(s);
  vec3 glow = uSunColor * vec3(1.0, 0.72, 0.4);
  col += glow * (0.05 * pow(sc, 7.0) + 0.3 * pow(sc, 60.0)) + uSunColor * 1.4 * pow(sc, 700.0);
  return col;
}

float sunDisk(vec3 v) {
  float ang = acos(clamp(dot(v, uSunDisc), -1.0, 1.0));
  float r = 0.0095;
  return 1.0 - smoothstep(r * 0.75, r, ang);
}

float hg(float c, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * c, 1.5));
}

// The low sun lights the clouds from beneath and behind: thick bodies go dark and
// smoky, and light scattered through the thin edges facing the sun adds a burning
// gold lining over the sky behind (brightest near the sun).
vec4 clouds(vec3 v, vec3 sky) {
  float h = v.y;
  if (h < 0.01) return vec4(sky, 0.0);
  vec2 p = v.xz / (h + 0.07) * 3.2 + uCloudOffset;
  // Heaviest in a band across the middle of the sky, breaking up overhead.
  float band = 0.05 * exp(-pow((h - 0.2) / 0.12, 2.0)) - 0.16 * smoothstep(0.22, 0.7, h);
  float c = cloudField(p, 6) + band;
  float d = cover(c);
  float fade = smoothstep(0.012, 0.09, h);
  if (d * fade < 0.003) return vec4(sky, 0.0);
  // Look toward the sun through the deck: how much cloud stands in the light's way.
  vec2 sp = normalize(uSunDisc.xz) * 0.15;
  float o1 = cover(cloudField(p + sp, 5) + band);
  float o2 = cover(cloudField(p + sp * 2.6, 3) + band);
  float sunT = exp(-(o1 * 2.4 + o2 * 1.4));
  float s = dot(v, uSunDisc);
  float phase = hg(s, 0.72) * 3.2 + 0.2;
  // Smoky blue-grey where the cloud is thick, browner toward the sun.
  vec3 body = mix(vec3(0.3, 0.3, 0.36), vec3(0.62, 0.42, 0.3), pow(s * 0.5 + 0.5, 5.0));
  body *= 0.8 + 0.5 * smoothstep(0.1, 0.5, h);
  float alpha = d * fade;
  // Light the cloud scatters toward us: all of it at thin edges, only the sunward
  // face of the thick parts.
  float scatter = (1.0 - exp(-3.5 * d)) * fade;
  vec3 tint = mix(vec3(1.0, 0.6, 0.28), vec3(1.0, 0.94, 0.82), pow(sat(s), 30.0));
  vec3 lit = uSunColor * tint * sunT * phase * scatter * (0.35 + 2.4 * (1.0 - d));
  vec3 col = sky * (1.0 - alpha) + body * alpha + lit;
  return vec4(col, alpha);
}

// Thin streaks of stratus lying just over the horizon, their undersides lit gold
// near the sun and dusky grey away from it.
vec4 streaks(vec3 v) {
  float h = v.y;
  if (h > 0.14) return vec4(0.0);
  float az = atan(v.x, v.z);
  float n = vnoise(vec2(az * 7.0 + uCloudOffset.x * 0.2, h * 150.0)) * 0.6 + vnoise(vec2(az * 19.0, h * 360.0 + 4.0)) * 0.4;
  float d = smoothstep(0.56, 0.78, n) * smoothstep(0.004, 0.022, h) * (1.0 - smoothstep(0.07, 0.14, h));
  if (d < 0.003) return vec4(0.0);
  float s = dot(v, uSunDisc);
  vec3 lit = uSunColor * vec3(1.0, 0.56, 0.24) * (0.25 + 1.6 * pow(sat(s), 8.0));
  vec3 col = mix(vec3(0.3, 0.26, 0.27), lit, pow(sat(s * 0.5 + 0.5), 4.0));
  return vec4(col, d * 0.75);
}

void main() {
  vec3 v = normalize(vDir);
  if (v.y < 0.0) {
    gl_FragColor = vec4(hazeColor(v), 1.0);
    return;
  }
  vec3 col = skyBase(v);
  col += vec3(1.0, 0.9, 0.72) * sunDisk(v) * uSunIntensity;
  vec4 st = streaks(v);
  col = mix(col, st.rgb, st.a);
  vec4 cl = clouds(v, col);
  col = cl.rgb;
  cl.a = max(cl.a, st.a);
  // Alpha carries occlusion for the light shafts: open sky lets light through.
  gl_FragColor = vec4(col, cl.a);
}
`;

export class Sky {
  constructor(shared) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uCloudOffset: { value: new THREE.Vector2(0.3, 1.7) },
        uSunIntensity: { value: 70 },
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.BackSide,
      depthWrite: false,
      depthFunc: THREE.LessEqualDepth,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), this.material);
    this.mesh.frustumCulled = false;
    // Drawn after all opaque geometry so the costly cloud shader only runs on visible sky.
    this.mesh.renderOrder = 20;
  }

  update(dt, camera, wind) {
    this.mesh.position.copy(camera.position);
    const o = this.material.uniforms.uCloudOffset.value;
    o.x -= wind.dir.x * dt * 0.004 * (0.6 + wind.strength);
    o.y -= wind.dir.y * dt * 0.004 * (0.6 + wind.strength);
  }
}
