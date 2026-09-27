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

  // extra: other casters' positions; the map widens to take in those nearby.
  render(renderer, scene, center, sunDir, extra = []) {
    const cam = this.camera;
    cam.position.copy(center).addScaledVector(sunDir, this.back);
    cam.lookAt(center);
    cam.updateMatrixWorld();
    // Fit the view (in the light's frame) around everyone within reach.
    let half = 1.4;
    const inv = cam.matrixWorldInverse;
    for (const p of extra) {
      if (p.distanceToSquared(center) > 13 * 13) continue;
      this.tmp = (this.tmp || new THREE.Vector3()).copy(p).applyMatrix4(inv);
      half = Math.max(half, Math.abs(this.tmp.x) + 1.1, Math.abs(this.tmp.y) + 1.3);
    }
    half = Math.min(half, 13);
    // Ease the size so the penumbra doesn't pump.
    this.half = this.half ? this.half + (half - this.half) * 0.12 : half;
    if (Math.abs(cam.right - this.half) > 1e-3) {
      cam.left = -this.half;
      cam.right = this.half;
      cam.top = this.half;
      cam.bottom = -this.half;
      cam.updateProjectionMatrix();
    }
    this.width = this.half * 2;
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
