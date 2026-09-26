import * as THREE from 'three';

// A tight orthographic shadow map aimed from the sun at the samurai. The sun is so low
// that his shadow runs for many metres across the grass; a small map suffices because,
// seen from the sun, he is only a narrow silhouette.
export class CharacterShadow {
  constructor(shared, size) {
    this.shared = shared;
    this.width = 2.8;
    this.range = 40;
    this.back = 8;
    const h = this.width / 2;
    this.camera = new THREE.OrthographicCamera(-h, h, h, -h, 0.1, this.range);
    this.camera.layers.set(1);
    this.material = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
    this.bias = new THREE.Matrix4().set(
      0.5, 0, 0, 0.5,
      0, 0.5, 0, 0.5,
      0, 0, 0.5, 0.5,
      0, 0, 0, 1,
    );
    this.setSize(size);
  }

  setSize(size) {
    if (this.target && this.size === size) return;
    if (this.target) this.target.dispose();
    this.size = size;
    const depth = new THREE.DepthTexture(size, size);
    depth.minFilter = THREE.NearestFilter;
    depth.magFilter = THREE.NearestFilter;
    this.target = new THREE.WebGLRenderTarget(size, size, {
      depthBuffer: true,
      depthTexture: depth,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
    });
    this.shared.uShadowMap.value = depth;
  }

  render(renderer, scene, center, sunDir) {
    const cam = this.camera;
    cam.position.copy(center).addScaledVector(sunDir, this.back);
    cam.lookAt(center);
    cam.updateMatrixWorld();
    this.shared.uShadowMatrix.value
      .multiplyMatrices(this.bias, cam.projectionMatrix)
      .multiply(cam.matrixWorldInverse);
    this.shared.uShadowParams.value.set(this.width, this.range, (this.back - cam.near) / (cam.far - cam.near), 1);

    const prev = scene.overrideMaterial;
    scene.overrideMaterial = this.material;
    renderer.setRenderTarget(this.target);
    renderer.clear(false, true, false);
    renderer.render(scene, cam);
    scene.overrideMaterial = prev;
  }
}
