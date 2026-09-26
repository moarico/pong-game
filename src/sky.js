import * as THREE from 'three';
import { common, sharedUniforms, atmosphere } from './glsl.js';

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * viewMatrix * (modelMatrix * vec4(position, 1.0));
}
`;

const frag = /* glsl */ `
${common}
${sharedUniforms}
${atmosphere}
uniform vec2 uCloudOffset;
uniform float uSunIntensity;
varying vec3 vDir;

float fbm5(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    s += a * vnoise(p);
    p = m * p + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}

float cloudDensity(vec2 p) {
  float n = fbm5(p);
  float cov = vnoise(p * 0.18 + 3.1);
  return smoothstep(0.47, 0.82, n + (cov - 0.5) * 0.35);
}

// Clear golden-hour air: blue overhead, warming to cream and gold toward the sun.
vec3 skyBase(vec3 v) {
  float h = max(v.y, 0.0);
  float s = dot(v, uSunDir);
  float s01 = s * 0.5 + 0.5;
  vec3 horizon = hazeColor(v);
  vec3 zenith = mix(vec3(0.55, 0.9, 1.75), vec3(1.8, 1.3, 0.85), pow(s01, 5.0));
  vec3 col = mix(horizon, zenith, pow(smoothstep(0.0, 1.0, h), 0.5));
  // Mie scattering in the haze: a wide, soft glow around the sun.
  float sc = sat(s);
  col += uSunColor * (0.06 * pow(sc, 3.0) + 0.28 * pow(sc, 16.0) + 1.0 * pow(sc, 140.0));
  return col;
}

float sunDisk(vec3 v) {
  float ang = acos(clamp(dot(v, uSunDir), -1.0, 1.0));
  float r = 0.0125;
  return 1.0 - smoothstep(r * 0.72, r, ang);
}

// Soft, low-contrast cloud banks: grey-blue in shade, warm white where lit,
// burning gold where they cross the sun.
vec4 clouds(vec3 v) {
  float h = max(v.y, 0.0);
  vec2 p = v.xz / (h + 0.1) * 1.4 + uCloudOffset;
  float d = cloudDensity(p);
  float fade = smoothstep(0.0, 0.16, v.y);
  if (d * fade < 0.002) return vec4(0.0);
  vec2 sp = normalize(uSunDir.xz);
  float light = exp(-cloudDensity(p + sp * 0.2) * 1.3);
  float s = dot(v, uSunDir);
  float s01 = s * 0.5 + 0.5;
  vec3 shade = mix(vec3(1.0, 1.08, 1.28), vec3(1.8, 1.35, 0.95), pow(s01, 4.0));
  vec3 lit = mix(vec3(2.3, 2.2, 2.15), vec3(4.4, 3.2, 1.9), pow(s01, 4.0));
  vec3 col = mix(shade, lit, light);
  col += uFogSunColor * (pow(sat(s), 8.0) * 0.8 + pow(sat(s), 50.0) * 3.0) * (1.0 - d);
  return vec4(col, d * fade * 0.85);
}

void main() {
  vec3 v = normalize(vDir);
  if (v.y < 0.0) {
    gl_FragColor = vec4(hazeColor(v), 1.0);
    return;
  }
  vec3 col = skyBase(v);
  col += vec3(1.0, 0.86, 0.66) * sunDisk(v) * uSunIntensity;
  vec4 cl = clouds(v);
  col = mix(col, cl.rgb, cl.a);
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
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), this.material);
    this.mesh.scale.setScalar(5000);
    this.mesh.frustumCulled = false;
    // Drawn after all opaque geometry so the costly cloud shader only runs on visible sky.
    this.mesh.renderOrder = 20;
  }

  update(dt, camera, wind) {
    this.mesh.position.copy(camera.position);
    const o = this.material.uniforms.uCloudOffset.value;
    o.x -= wind.dir.x * dt * 0.005 * (0.6 + wind.strength);
    o.y -= wind.dir.y * dt * 0.005 * (0.6 + wind.strength);
  }
}
