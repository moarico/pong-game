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
  float cov = vnoise(p * 0.21 + 3.1);
  return smoothstep(0.44, 0.74, n + (cov - 0.5) * 0.38);
}

vec3 skyBase(vec3 v) {
  float h = max(v.y, 0.0);
  float s = dot(v, uSunDir);
  float s01 = s * 0.5 + 0.5;
  vec3 horizon = hazeColor(v);
  vec3 mid = mix(vec3(0.19, 0.1, 0.16), vec3(2.3, 0.82, 0.26), pow(s01, 4.0));
  vec3 zen = vec3(0.028, 0.034, 0.085);
  vec3 col = mix(horizon, mid, smoothstep(0.0, 0.2, h));
  col = mix(col, zen, smoothstep(0.14, 0.8, h));
  // Mie scattering: the wide golden bloom of air around a low sun.
  float sc = sat(s);
  col += uSunColor * (0.05 * pow(sc, 5.0) + 0.24 * pow(sc, 36.0) + 1.5 * pow(sc, 420.0));
  return col;
}

float sunDisk(vec3 v) {
  float ang = acos(clamp(dot(v, uSunDir), -1.0, 1.0));
  float r = 0.0115;
  float disk = 1.0 - smoothstep(r * 0.8, r, ang);
  float q = min(ang / r, 1.0);
  return disk * (0.6 + 0.4 * sqrt(1.0 - q * q)); // limb darkening
}

// Returns lit cloud colour and coverage.
vec4 clouds(vec3 v) {
  float h = max(v.y, 0.0);
  vec2 p = v.xz / (h + 0.085) * 3.1 + uCloudOffset;
  float d = cloudDensity(p);
  float fade = smoothstep(0.0, 0.13, v.y);
  if (d * fade < 0.002) return vec4(0.0);
  // Two taps toward the sun estimate how much cloud the light passes through.
  vec2 sp = normalize(uSunDir.xz);
  float d1 = cloudDensity(p + sp * 0.17);
  float d2 = cloudDensity(p + sp * 0.46);
  float light = exp(-(d1 * 1.0 + d2 * 0.55));
  float s = dot(v, uSunDir);
  float s01 = s * 0.5 + 0.5;
  // Shadowed cores stay cool slate-violet; only the sunward edges catch fire.
  vec3 core = mix(vec3(0.032, 0.04, 0.09), vec3(0.3, 0.08, 0.06), pow(s01, 7.0) * 0.8);
  vec3 lit = mix(vec3(0.7, 0.16, 0.17), vec3(3.6, 1.35, 0.36), pow(s01, 3.0));
  // A sharp terminator: bodies stay dark, only the sunward rims burn.
  vec3 col = mix(core, lit, smoothstep(0.32, 0.92, light));
  // Silver-gold lining where thin cloud crosses the sun's glare.
  float thin = 1.0 - d;
  col += uFogSunColor * (pow(sat(s), 7.0) * 1.1 + pow(sat(s), 40.0) * 5.5) * thin * (0.35 + 0.65 * light);
  return vec4(col, d * fade);
}

void main() {
  vec3 v = normalize(vDir);
  if (v.y < 0.0) {
    gl_FragColor = vec4(hazeColor(v), 1.0);
    return;
  }
  vec3 col = skyBase(v);
  col += vec3(1.0, 0.8, 0.55) * sunDisk(v) * uSunIntensity;
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
        uSunIntensity: { value: 120 },
      },
      vertexShader: vert,
      fragmentShader: frag,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), this.material);
    this.mesh.scale.setScalar(1500);
    this.mesh.frustumCulled = false;
    // Drawn after all opaque geometry so the costly cloud shader only runs on visible sky.
    this.mesh.renderOrder = 20;
  }

  update(dt, camera, wind) {
    this.mesh.position.copy(camera.position);
    const o = this.material.uniforms.uCloudOffset.value;
    o.x -= wind.dir.x * dt * 0.006 * (0.6 + wind.strength);
    o.y -= wind.dir.y * dt * 0.006 * (0.6 + wind.strength);
  }
}
