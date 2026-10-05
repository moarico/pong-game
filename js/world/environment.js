import * as THREE from 'three';
import { Atmosphere, DAY } from '../zh/atmos.js';
import { field, normalMapFrom } from '../zh/textures.js';

export const SKY_HORIZON = 0xbfe2f7;

// Sun, sky, haze, sea and clouds. The sky and haze are Zero Hour's light pass (see zh/atmos.js).
export class Environment {
  constructor(scene, quality, renderer) {
    this.scene = scene;
    this.hemi = new THREE.HemisphereLight(0xcfe8ff, 0x67654f, 0.35);
    scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff0d8, 3);
    scene.add(this.sun);
    scene.add(this.sun.target);
    this.atmos = new Atmosphere(renderer, scene);
    this.sunDir = this.atmos.set(DAY, this.sun, this.hemi);
    this.sun.position.copy(this.sunDir).multiplyScalar(200);
    // Sea: a scrolling ripple normal map, so the sun lays a glittering path on it and the sky reflects at grazing angles.
    const S = 256;
    const ripple = normalMapFrom(S, field(S, [8, 16, 32, 64], [0.45, 0.3, 0.15, 0.1], 4242), 9);
    ripple.repeat.set(420, 420);
    ripple.anisotropy = 8;
    this.ripple = ripple;
    this.water = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: 0x0f5c78, roughness: 0.06, metalness: 0, normalMap: ripple, normalScale: new THREE.Vector2(0.35, 0.35), transparent: true, opacity: 0.86, depthWrite: false, envMapIntensity: 1.2 }),
    );
    this.water.rotation.x = -Math.PI / 2;
    this.water.renderOrder = 1;
    scene.add(this.water);
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({ color: 0x0c3a52, roughness: 1 }));
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -26;
    scene.add(this.floor);
    this.setQuality(quality);
  }

  buildEnv() {
    return this.atmos.buildEnv();
  }

  setQuality(q) {
    const sun = this.sun;
    sun.castShadow = q !== 'low';
    const size = q === 'high' ? 4096 : 2048;
    if (sun.shadow.mapSize.x !== size) {
      sun.shadow.mapSize.set(size, size);
      if (sun.shadow.map) {
        sun.shadow.map.dispose();
        sun.shadow.map = null;
      }
    }
    const ext = q === 'high' ? 80 : 60;
    const cam = sun.shadow.camera;
    cam.left = -ext;
    cam.right = ext;
    cam.top = ext;
    cam.bottom = -ext;
    cam.near = 10;
    cam.far = 500;
    cam.updateProjectionMatrix();
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
  }

  update(dt, camera, focus, storm = 0) {
    this.atmos.update(dt, camera, storm);
    this.ripple.offset.x += dt * 0.004;
    this.ripple.offset.y += dt * 0.0025;
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
