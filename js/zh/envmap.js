// The sky becomes the ambient light and reflections for metal and fabric: a prefiltered environment map
// rendered from a gradient sky with a sun, the way Zero Hour lights its guns.
import * as THREE from 'three';

const VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const FRAG = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uGround;
uniform vec3 uSunDir;
uniform float uSun;
varying vec3 vDir;
void main() {
  float h = vDir.y;
  vec3 col = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.5)) : mix(uHorizon * 0.8, uGround, clamp(-h * 3.0, 0.0, 1.0));
  float s = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
  col += vec3(1.0, 0.9, 0.75) * (pow(s, 400.0) * uSun + pow(s, 8.0) * 0.35);
  gl_FragColor = vec4(col, 1.0);
}`;

export function skyEnvironment(renderer, opts = {}) {
  const scene = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(opts.top ?? 0x3f86e0) },
      uHorizon: { value: new THREE.Color(opts.horizon ?? 0xbfe2f7) },
      uGround: { value: new THREE.Color(opts.ground ?? 0x4f5a36) },
      uSunDir: { value: (opts.sunDir || new THREE.Vector3(0.45, 0.78, 0.32)).clone().normalize() },
      uSun: { value: opts.sun ?? 18 },
    },
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), mat));
  const pmrem = new THREE.PMREMGenerator(renderer);
  const prev = renderer.getRenderTarget();
  const rt = pmrem.fromScene(scene, 0, 0.1, 100);
  renderer.setRenderTarget(prev);
  pmrem.dispose();
  mat.dispose();
  return rt.texture;
}
