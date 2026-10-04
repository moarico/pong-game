import * as THREE from 'three';
import { GeoBuilder } from './geobuilder.js';
import { makeRng } from '../util.js';

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;
const SKY_FRAG = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
uniform vec3 uSunDir;
varying vec3 vDir;
void main() {
  float h = vDir.y;
  vec3 col = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(uHorizon, uBottom, clamp(-h * 4.0, 0.0, 1.0));
  float s = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
  col += vec3(1.0, 0.92, 0.75) * pow(s, 900.0) * 3.0;
  col += vec3(1.0, 0.85, 0.6) * pow(s, 12.0) * 0.25;
  gl_FragColor = vec4(col, 1.0);
}`;

export const SKY_HORIZON = 0xbfe2f7;

export class Environment {
  constructor(scene, quality) {
    this.scene = scene;
    this.sunDir = new THREE.Vector3(0.45, 0.78, 0.32).normalize();
    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x5d6a3e, 1.35);
    scene.add(this.hemi);
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    this.sun = new THREE.DirectionalLight(0xfff0d8, 2.3);
    this.sun.position.copy(this.sunDir).multiplyScalar(200);
    scene.add(this.sun);
    scene.add(this.sun.target);
    const c = (hex) => new THREE.Color(hex);
    this.skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uTop: { value: c(0x3f86e0) }, uHorizon: { value: c(SKY_HORIZON) }, uBottom: { value: c(0x2a6fb8) }, uSunDir: { value: this.sunDir } },
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), this.skyMat);
    this.sky.renderOrder = -10;
    this.sky.frustumCulled = false;
    scene.add(this.sky);
    this.water = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshPhongMaterial({ color: 0x2b86d4, specular: 0x9fd2ff, shininess: 70, transparent: true, opacity: 0.82, depthWrite: false }),
    );
    this.water.rotation.x = -Math.PI / 2;
    this.water.renderOrder = 1;
    scene.add(this.water);
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshLambertMaterial({ color: 0x1e5687 }));
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -26;
    scene.add(this.floor);
    // Clouds
    const rng = makeRng(77);
    this.clouds = new THREE.Group();
    const cloudMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0xb8bcc4, fog: false });
    for (let i = 0; i < 26; i++) {
      const gb = new GeoBuilder(rng);
      gb.jitter = 0.04;
      const n = 4 + Math.floor(rng() * 4);
      for (let k = 0; k < n; k++) gb.sphere((rng() - 0.5) * 50, (rng() - 0.3) * 8, (rng() - 0.5) * 22, 10 + rng() * 12, 8, 5, '#ffffff', 0.55);
      const m = new THREE.Mesh(gb.build(), cloudMat);
      m.position.set((rng() - 0.5) * 1800, 230 + rng() * 120, (rng() - 0.5) * 1800);
      this.clouds.add(m);
    }
    scene.add(this.clouds);
    scene.fog = new THREE.Fog(SKY_HORIZON, 200, 1100);
    this.setQuality(quality);
  }

  setQuality(q) {
    const sun = this.sun;
    sun.castShadow = q !== 'low';
    const size = q === 'high' ? 2048 : 1024;
    if (sun.shadow.mapSize.x !== size) {
      sun.shadow.mapSize.set(size, size);
      if (sun.shadow.map) {
        sun.shadow.map.dispose();
        sun.shadow.map = null;
      }
    }
    const ext = q === 'high' ? 70 : 50;
    const cam = sun.shadow.camera;
    cam.left = -ext;
    cam.right = ext;
    cam.top = ext;
    cam.bottom = -ext;
    cam.near = 10;
    cam.far = 500;
    cam.updateProjectionMatrix();
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.04;
    this.fogFar = q === 'low' ? 750 : q === 'medium' ? 1050 : 1400;
    this.fogNear = q === 'low' ? 150 : 220;
    this.scene.fog.far = this.fogFar;
    this.scene.fog.near = this.fogNear;
  }

  update(dt, camera, focus) {
    this.sky.position.copy(camera.position);
    // See further when high up (bus, skydiving) so the island isn't washed out by fog.
    const lift = Math.max(0, camera.position.y - 60);
    this.scene.fog.near = this.fogNear + lift * 0.9;
    this.scene.fog.far = this.fogFar + lift * 1.8;
    for (const c of this.clouds.children) {
      c.position.x += dt * 3;
      if (c.position.x > 950) c.position.x = -950;
    }
    if (focus) {
      // Snap the shadow camera to texels to avoid shimmering.
      const step = 2;
      const fx = Math.round(focus.x / step) * step, fz = Math.round(focus.z / step) * step;
      this.sun.target.position.set(fx, focus.y, fz);
      this.sun.position.set(fx, focus.y, fz).addScaledVector(this.sunDir, 250);
      this.sun.target.updateMatrixWorld();
    }
  }
}
