// A black hole: event horizon, swirling accretion disk with Doppler beaming, the lensed
// image of the far side of the disk wrapped around the shadow, a photon ring, a glow and
// (when it goes unstable) polar jets. Local units: 1 = horizon radius.
import * as THREE from 'three';

export const NOISE_GLSL = /* glsl */ `
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
                   mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
                   mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return s;
  }
  float fbm3(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.07 + 11.3; a *= 0.5; }
    return s / 0.875;
  }
`;

const OUT = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

const DISK_IN = 1.3;
const DISK_OUT = 7.5;

function diskMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uBurst;
      varying vec3 vL; varying vec3 vW; varying vec3 vVel;
      void main() {
        vec3 p = position;
        vL = p;
        p.xz *= 1.0 + uBurst * (3.0 + length(p.xz) * 0.4);
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        vVel = mat3(modelMatrix) * vec3(-position.z, 0.0, position.x);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uI, uHot, uBurst;
      varying vec3 vL; varying vec3 vW; varying vec3 vVel;
      ${NOISE_GLSL}
      void main() {
        float r = length(vL.xz);
        float t = clamp((r - ${DISK_IN.toFixed(2)}) / (${(DISK_OUT - DISK_IN).toFixed(2)}), 0.0, 1.0);
        float a = atan(vL.z, vL.x);
        // differential rotation: the inner disk laps the outer disk, shearing the gas into streaks
        float ang = a - uTime * 2.2 / pow(r, 1.5);
        vec2 q = vec2(cos(ang), sin(ang)) * r;
        float n = fbm(vec3(q * 1.5, r * 1.3));
        float streak = fbm3(vec3(q * 4.5, r * 9.0));
        float dens = smoothstep(0.0, 0.05, t) * pow(1.0 - t, 1.7) * (0.3 + 0.95 * n) * (0.65 + 0.6 * streak);
        vec3 col = mix(vec3(1.0, 0.94, 0.84), vec3(1.0, 0.56, 0.18), smoothstep(0.0, 0.3, t));
        col = mix(col, vec3(0.7, 0.14, 0.03), smoothstep(0.3, 1.0, t));
        col = mix(col, vec3(1.0, 0.96, 0.92), uHot * 0.8);
        // relativistic beaming: the side of the disk spinning toward us is brighter
        float dop = dot(normalize(vVel), normalize(cameraPosition - vW));
        float beam = pow(1.0 + 0.4 * dop, 2.6);
        vec3 c = col * dens * beam * 0.85 * uI * (1.0 + uHot * 1.5) * (1.0 - smoothstep(0.2, 1.0, uBurst));
        gl_FragColor = vec4(c, 1.0);
        ${OUT}
      }`,
  });
}

function haloMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uI, uHot, uSide, uBurst;
      varying vec2 vP;
      ${NOISE_GLSL}
      void main() {
        float r = length(vP);
        if (r < 0.97) discard;
        float th = atan(vP.y, vP.x);
        float ring = exp(-pow((r - 1.035) / 0.016, 2.0));
        float band = smoothstep(1.03, 1.1, r) * exp(-(r - 1.1) * 2.4);
        // the far half of the disk is bent over the top of the shadow (and thinly under it)
        float side = vP.y * uSide / r;
        float arc = mix(0.18, 1.0, smoothstep(-0.35, 0.85, side));
        float ang = th - uTime * 0.3;
        float n = fbm3(vec3(cos(ang) * r * 3.0, sin(ang) * r * 3.0, r * 5.0));
        vec3 col = mix(vec3(1.0, 0.9, 0.74), vec3(1.0, 0.48, 0.14), smoothstep(1.05, 1.9, r));
        col = mix(col, vec3(1.0), uHot * 0.7);
        vec3 c = col * band * arc * (0.3 + 1.1 * n) * 0.85 + vec3(1.0, 0.92, 0.82) * ring * 1.3;
        c *= uI * (1.0 + uHot) * (1.0 - smoothstep(0.0, 0.4, uBurst)) * (1.0 - smoothstep(2.5, 3.0, r));
        gl_FragColor = vec4(c, 1.0);
        ${OUT}
      }`,
  });
}

function glowMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uI, uHot, uGlow;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float g = exp(-r * 0.6) * 0.16 + exp(-r * 0.2) * 0.025;
        g *= smoothstep(0.95, 1.4, r) * (1.0 - smoothstep(10.0, 15.0, r));
        vec3 col = mix(vec3(1.0, 0.5, 0.18), vec3(1.0, 0.9, 0.8), uHot);
        gl_FragColor = vec4(col * g * uI * uGlow * (1.0 + uHot * 2.0), 1.0);
        ${OUT}
      }`,
  });
}

function jetMaterial(u) {
  return new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main() {
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uJet;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      ${NOISE_GLSL}
      void main() {
        float along = 1.0 - vUv.y; // 0 at the hole, 1 at the tip
        float n = fbm3(vec3(vUv.x * 12.0, along * 6.0 - uTime * 9.0, 1.0));
        float facing = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        float a = pow(facing, 1.5) * (1.0 - along) * (0.4 + n) * smoothstep(0.0, 0.05, along);
        vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(0.4, 0.55, 1.0), along);
        gl_FragColor = vec4(col * a * 3.0 * uJet, 1.0);
        ${OUT}
      }`,
  });
}

const _m = new THREE.Matrix4();
const _v = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export class BlackHole {
  constructor({ jets = false, segments = 1 } = {}) {
    this.group = new THREE.Group();
    this.u = {
      uTime: { value: 0 }, uI: { value: 1 }, uHot: { value: 0 }, uSide: { value: 1 }, uBurst: { value: 0 }, uGlow: { value: 1 }, uJet: { value: 0 },
    };
    this.horizon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }));
    this.horizon.renderOrder = 1;
    const dg = new THREE.RingGeometry(DISK_IN, DISK_OUT, Math.round(192 * segments), 20);
    dg.rotateX(-Math.PI / 2);
    this.disk = new THREE.Mesh(dg, diskMaterial(this.u));
    this.disk.renderOrder = 6;
    // billboards (re-oriented toward the camera every frame)
    this.billboard = new THREE.Group();
    this.halo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), haloMaterial(this.u));
    this.halo.renderOrder = 5;
    this.glow = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), glowMaterial(this.u));
    this.glow.renderOrder = 4;
    this.billboard.add(this.glow, this.halo);
    this.group.add(this.horizon, this.disk, this.billboard);
    if (jets) {
      const jg = new THREE.CylinderGeometry(3.2, 0.12, 70, 32, 1, true);
      jg.translate(0, 35.6, 0);
      const jm = jetMaterial(this.u);
      const j1 = new THREE.Mesh(jg, jm);
      const j2 = new THREE.Mesh(jg, jm);
      j2.rotation.x = Math.PI;
      this.jets = new THREE.Group();
      this.jets.add(j1, j2);
      this.jets.visible = false;
      for (const j of [j1, j2]) j.renderOrder = 7;
      this.group.add(this.jets);
    }
    this.group.traverse((o) => { o.frustumCulled = false; });
  }

  // keep the lensed ring facing the camera, tilted to match the disk
  update(dt, camera) {
    this.u.uTime.value += dt;
    this.group.updateMatrixWorld();
    _m.copy(this.group.matrixWorld).invert();
    _v.copy(camera.position).applyMatrix4(_m); // camera in local space
    _z.copy(_v).normalize();
    _y.copy(UP).addScaledVector(_z, -UP.dot(_z));
    if (_y.lengthSq() < 1e-6) _y.set(0, 0, 1).addScaledVector(_z, -_z.z);
    _y.normalize();
    _x.crossVectors(_y, _z);
    _m.makeBasis(_x, _y, _z);
    this.billboard.quaternion.setFromRotationMatrix(_m);
    this.u.uSide.value = _v.y >= 0 ? 1 : -1;
    if (this.jets) this.jets.visible = this.u.uJet.value > 0.001;
  }

  dispose() {
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }
}
