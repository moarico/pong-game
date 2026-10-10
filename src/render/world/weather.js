// Weather for the blocky world: cloud cover, rain streaks around whichever camera is
// drawing, lightning bolts on the horizon and thick fog. Everything is driven from the
// stadium update; the sky reads `cover` and `flash`.
import * as THREE from 'three';

export const WEATHER = {
  clear: { cover: 0.52, rain: 0, haze: 0, storm: false, wet: 0 },
  cloudy: { cover: 0.76, rain: 0, haze: 1100, storm: false, wet: 0.1 },
  rain: { cover: 0.86, rain: 1, haze: 420, storm: false, wet: 0.8 },
  storm: { cover: 0.96, rain: 1.5, haze: 320, storm: true, wet: 1 },
  fog: { cover: 0.7, rain: 0, haze: 130, storm: false, wet: 0.25 },
};

// fog densities for the block shader (exp of pow 1.6) and three's FogExp2 so that the haze
// reaches about half strength at `haze` metres
export function fogDensities(cfg) {
  if (!cfg.haze) return { block: 0.00055, scene: 0.00018 };
  return { block: Math.max(0.00055, 0.795 / cfg.haze), scene: Math.max(0.00018, 0.833 / cfg.haze) };
}

const BOX = 60; // metres around the camera
const RAIN_GREY = new THREE.Color(0.7, 0.75, 0.85);
const HEIGHT = 34;

// one quad per drop; the vertex shader places it from a seed so nothing is updated on the CPU
function rainMesh(n) {
  const seed = new Float32Array(n * 4 * 4);
  const corner = new Float32Array(n * 4 * 2);
  const idx = new Uint32Array(n * 6);
  for (let i = 0; i < n; i++) {
    const s = [Math.random(), Math.random(), Math.random(), 0.75 + Math.random() * 0.5];
    for (let k = 0; k < 4; k++) {
      seed.set(s, (i * 4 + k) * 4);
      corner[(i * 4 + k) * 2] = k & 1 ? 1 : -1;
      corner[(i * 4 + k) * 2 + 1] = k & 2 ? 1 : 0;
    }
    const v = i * 4;
    idx.set([v, v + 1, v + 2, v + 1, v + 3, v + 2], i * 6);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 4 * 3), 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  g.setAttribute('aCorner', new THREE.BufferAttribute(corner, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, // quads are built in view space, so their winding varies
    fog: false,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uWind: { value: new THREE.Vector2(2.5, 1.2) }, uColor: { value: new THREE.Color(0.55, 0.62, 0.72) } },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      attribute vec2 aCorner;
      uniform float uTime, uAmount;
      uniform vec2 uWind;
      varying float vA;
      varying float vU;
      void main() {
        const float B = ${BOX.toFixed(1)}, H = ${HEIGHT.toFixed(1)};
        vec3 c = cameraPosition;
        float fall = uTime * 26.0 * aSeed.w;
        // world-anchored positions that wrap around the camera
        float y = c.y - H * 0.4 + fract(aSeed.z - (fall + c.y) / H) * H;
        vec2 drift = uWind * (fall / 26.0);
        float x = c.x + (fract(aSeed.x + (drift.x - c.x) / B) - 0.5) * B;
        float z = c.z + (fract(aSeed.y + (drift.y - c.z) / B) - 0.5) * B;
        vec3 top = vec3(x, y, z);
        float len = 0.95 * aSeed.w;
        vec3 dir = normalize(vec3(uWind.x, -26.0, uWind.y) / 26.0);
        vec3 p = top + dir * len * aCorner.y;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vec4 mvTop = viewMatrix * vec4(top, 1.0);
        vec4 mvBot = viewMatrix * vec4(top + dir * len, 1.0);
        vec2 sd = normalize(mvBot.xy - mvTop.xy + vec2(1e-5, 0.0));
        // about a pixel wide at any distance
        mv.xy += vec2(-sd.y, sd.x) * aCorner.x * max(0.01, -mv.z * 0.0035);
        gl_Position = projectionMatrix * mv;
        float d = length(p - c);
        float show = step(aSeed.x * 0.37 + aSeed.y * 0.63, uAmount);
        vA = show * step(0.05, p.y) * (1.0 - smoothstep(B * 0.2, B * 0.5, d)) * smoothstep(0.6, 2.5, d);
        vU = aCorner.x;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vA;
      varying float vU;
      void main() {
        if (vA <= 0.0) discard;
        gl_FragColor = vec4(uColor * vA * (1.0 - abs(vU)) * 1.1, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return mesh;
}

// jagged lightning bolt as a ribbon of additive quads
function boltGeometry() {
  const pts = [];
  let x = 0, y = 0;
  const seg = 22;
  for (let i = 0; i <= seg; i++) {
    pts.push(new THREE.Vector3(x, y, 0));
    y -= 1 / seg;
    x += (Math.random() - 0.5) * 0.09;
  }
  // a couple of branches
  const branches = [];
  for (let b = 0; b < 3; b++) {
    const s = 3 + Math.floor(Math.random() * 12);
    const bp = [pts[s].clone()];
    let bx = bp[0].x, by = bp[0].y;
    const dirx = Math.random() < 0.5 ? -1 : 1;
    for (let i = 0; i < 6; i++) { bx += dirx * 0.03 + (Math.random() - 0.5) * 0.03; by -= 0.03; bp.push(new THREE.Vector3(bx, by, 0)); }
    branches.push(bp);
  }
  const pos = [], alpha = [], idx = [];
  const strip = (list, w, a) => {
    const base = pos.length / 3;
    list.forEach((p) => { pos.push(p.x - w, p.y, 0, p.x + w, p.y, 0); alpha.push(a, a); });
    for (let i = 0; i < list.length - 1; i++) { const v = base + i * 2; idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
  };
  strip(pts, 0.006, 1);
  strip(pts, 0.03, 0.18);
  for (const b of branches) strip(b, 0.004, 0.7);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aA', new THREE.Float32BufferAttribute(alpha, 1));
  g.setIndex(idx);
  return g;
}

export class Weather {
  constructor(root, quality, kind, layer) {
    this.kind = WEATHER[kind] ? kind : 'clear';
    this.cfg = WEATHER[this.kind];
    this.time = 0;
    this.flash = 0;
    this.nextStrike = 4 + Math.random() * 6;
    this.onThunder = null;
    this.group = new THREE.Group();
    root.add(this.group);
    if (this.cfg.rain > 0) {
      this.rain = rainMesh(quality === 'high' ? 9000 : quality === 'medium' ? 6000 : 3000);
      this.rain.material.uniforms.uAmount.value = Math.min(1, this.cfg.rain);
      this.rain.layers.set(layer);
      this.group.add(this.rain);
    }
    if (this.cfg.storm) {
      this.boltMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide,
        uniforms: { uI: { value: 0 } },
        vertexShader: 'attribute float aA; varying float vA; void main() { vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform float uI; varying float vA; void main() { gl_FragColor = vec4(vec3(0.75, 0.82, 1.0) * 4.0 * vA * uI, 1.0); }',
      });
      this.bolt = new THREE.Mesh(boltGeometry(), this.boltMat);
      this.bolt.visible = false;
      this.bolt.frustumCulled = false;
      this.bolt.layers.set(layer);
      this.group.add(this.bolt);
    }
  }

  // sky: SkySystem (flash is pushed into it); returns the extra light from lightning
  update(dt, sky) {
    this.time += dt;
    if (this.rain) {
      const u = this.rain.material.uniforms;
      u.uTime.value = this.time;
      // rain picks up the sky colour so it reads at sunset and at night
      u.uColor.value.copy(sky.colors.horizon).lerp(RAIN_GREY, 0.5).multiplyScalar(0.55 + sky.w.day * 0.4 + this.flash * 2);
    }
    if (this.cfg.storm) {
      this.nextStrike -= dt;
      if (this.nextStrike <= 0) this.strike();
      this.flash = Math.max(0, this.flash - dt * 2.6);
      // flicker: a strike is several quick pulses
      const pulse = this.flash > 0 ? this.flash * (0.6 + 0.4 * Math.sin(this.time * 47) * Math.sin(this.time * 23)) : 0;
      sky.flash = Math.max(sky.flash, pulse * 1.3);
      this.boltMat.uniforms.uI.value = pulse;
      this.bolt.visible = pulse > 0.03;
      return pulse;
    }
    return 0;
  }

  strike() {
    this.nextStrike = 5 + Math.random() * 11;
    this.flash = 1;
    // a new bolt 350-900 m out, tall enough to show above the 66 m stands
    this.bolt.geometry.dispose();
    this.bolt.geometry = boltGeometry();
    const a = Math.random() * Math.PI * 2, r = 350 + Math.random() * 550;
    const h = 520 + Math.random() * 240;
    this.bolt.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
    this.bolt.scale.set(h * 1.1, h, 1);
    this.bolt.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); // face the stadium
    if (this.onThunder) this.onThunder(1 - ((r - 350) / 550) * 0.7, r / 340);
  }

  dispose() {
    this.group.removeFromParent();
    if (this.rain) { this.rain.geometry.dispose(); this.rain.material.dispose(); }
    if (this.bolt) { this.bolt.geometry.dispose(); this.boltMat.dispose(); }
  }
}
