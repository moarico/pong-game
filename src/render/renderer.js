import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Film-style grade on the final (display) image: a little more contrast and colour, warm
// highlights, cool shadows and a soft vignette.
const GradeShader = {
  name: 'Grade',
  uniforms: { tDiffuse: { value: null }, uAmount: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    varying vec2 vUv;
    void main() {
      vec4 src = texture2D(tDiffuse, vUv);
      vec3 c = src.rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 g = (c - 0.5) * 1.1 + 0.5;
      g = mix(vec3(l), g, 1.2);
      g += vec3(0.035, 0.012, -0.03) * smoothstep(0.45, 1.0, l) + vec3(-0.018, 0.004, 0.03) * (1.0 - smoothstep(0.0, 0.4, l));
      vec2 d = vUv - 0.5;
      g *= 1.0 - dot(d, d) * 0.55;
      gl_FragColor = vec4(mix(c, clamp(g, 0.0, 1.0), uAmount), src.a);
    }`,
};

// Renders every player view (split screen) into one target, then blooms the lot.
class MultiViewPass extends Pass {
  constructor(owner) {
    super();
    this.owner = owner;
    this.needsSwap = false;
  }
  render(renderer, writeBuffer, readBuffer) {
    const target = this.renderToScreen ? null : readBuffer;
    this.owner.renderViews(target);
  }
}

export class GameRenderer {
  constructor(container, quality) {
    this.quality = quality;
    this.container = container;
    const renderer = new THREE.WebGLRenderer({ antialias: quality !== 'low', powerPreference: 'high-performance', stencil: false });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = quality !== 'low';
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.autoClear = false;
    renderer.localClippingEnabled = true; // the victory cinematic cuts a gap through the stands
    container.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.overrideScene = null; // drawn instead of the stadium scene (victory cinematic in space)
    this.views = [];
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.75 : quality === 'medium' ? 1.25 : 1);
    renderer.setPixelRatio(this.pixelRatio);

    if (quality !== 'low') {
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: quality === 'high' ? 4 : 0 });
      this.composer = new EffectComposer(renderer, rt);
      this.composer.addPass(new MultiViewPass(this));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.35, 0.92);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
      this.grade = new ShaderPass(GradeShader);
      this.composer.addPass(this.grade);
    }
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
  }

  setExposure(e) { this.renderer.toneMappingExposure = e; }

  // views: [{camera, rect:[x, y, w, h]}] with rect normalized, origin top-left
  setViews(views) {
    this.views = views;
    this.updateCameras();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h);
    if (this.composer) {
      this.composer.setPixelRatio(this.pixelRatio);
      this.composer.setSize(w, h);
    }
    this.updateCameras();
  }

  updateCameras() {
    for (const v of this.views) {
      const aspect = (v.rect[2] * this.width) / Math.max(1, v.rect[3] * this.height);
      const hfov = THREE.MathUtils.degToRad(v.hfov || 100);
      let vfov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / aspect));
      vfov = THREE.MathUtils.clamp(vfov, 47, 78);
      v.camera.fov = vfov;
      v.camera.aspect = aspect;
      v.camera.updateProjectionMatrix();
    }
  }

  renderViews(target) {
    const r = this.renderer;
    r.setRenderTarget(target);
    r.setClearColor(0x000000, 1);
    r.clear(true, true, false);
    const tw = target ? target.width : this.width * this.pixelRatio;
    const th = target ? target.height : this.height * this.pixelRatio;
    const scale = target ? 1 : 1 / this.pixelRatio;
    for (const v of this.views) {
      const x = Math.round(v.rect[0] * tw), w = Math.round(v.rect[2] * tw);
      const hh = Math.round(v.rect[3] * th);
      const y = Math.round((1 - v.rect[1] - v.rect[3]) * th);
      if (target) {
        target.viewport.set(x, y, w, hh);
        target.scissor.set(x, y, w, hh);
        target.scissorTest = true;
        r.setRenderTarget(target);
      } else {
        r.setViewport(x * scale, y * scale, w * scale, hh * scale);
        r.setScissor(x * scale, y * scale, w * scale, hh * scale);
        r.setScissorTest(true);
      }
      v.camera.layers.enable(1); // distant scenery lives on layer 1
      v.camera.layers.enable(2); // boost pads (not reflected, no shadows)
      r.render(this.overrideScene || this.scene, v.camera);
    }
    if (target) {
      target.viewport.set(0, 0, target.width, target.height);
      target.scissor.set(0, 0, target.width, target.height);
      target.scissorTest = false;
      r.setRenderTarget(target);
    } else {
      r.setViewport(0, 0, this.width, this.height);
      r.setScissorTest(false);
    }
  }

  render() {
    if (this.composer) this.composer.render();
    else this.renderViews(null);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    if (this.composer) this.composer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
