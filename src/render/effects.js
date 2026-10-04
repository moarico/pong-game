import * as THREE from 'three';
import { S, TEAM_COLORS } from '../config.js';

// GPU-instanced camera-facing particles. Positions are in meters.
class ParticleSystem {
  constructor(max, additive) {
    this.max = max;
    this.count = 0;
    this.p = new Float32Array(max * 3);
    this.v = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.size = new Float32Array(max * 2);
    this.c0 = new Float32Array(max * 4);
    this.c1 = new Float32Array(max * 4);
    this.phys = new Float32Array(max * 4); // drag, gravity, rotation, rotSpeed

    const geo = new THREE.InstancedBufferGeometry();
    const base = new THREE.PlaneGeometry(1, 1);
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    this.aPos = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4).setUsage(THREE.DynamicDrawUsage);
    this.aSR = new THREE.InstancedBufferAttribute(new Float32Array(max * 2), 2).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('iPos', this.aPos);
    geo.setAttribute('iCol', this.aCol);
    geo.setAttribute('iSR', this.aSR);
    geo.instanceCount = 0;
    this.geo = geo;

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {},
      vertexShader: /* glsl */ `
        attribute vec3 iPos; attribute vec4 iCol; attribute vec2 iSR;
        varying vec2 vUv; varying vec4 vCol; varying float vSeed;
        void main() {
          vec4 mv = viewMatrix * vec4(iPos, 1.0);
          float c = cos(iSR.y), s = sin(iSR.y);
          vec2 p = vec2(c * position.x - s * position.y, s * position.x + c * position.y) * iSR.x;
          mv.xy += p;
          vUv = uv;
          vCol = iCol;
          vSeed = fract(iPos.x * 3.17 + iPos.z * 1.31);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: additive
        ? /* glsl */ `
        varying vec2 vUv; varying vec4 vCol;
        void main() {
          float r = length(vUv - 0.5) * 2.0;
          float a = 1.0 - smoothstep(0.0, 1.0, r);
          a *= a;
          gl_FragColor = vec4(vCol.rgb, vCol.a * a);
          #include <colorspace_fragment>
        }`
        : /* glsl */ `
        varying vec2 vUv; varying vec4 vCol; varying float vSeed;
        float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          vec2 d = vUv - 0.5;
          float r = length(d) * 2.0;
          float puff = n(vUv * 4.0 + vSeed * 17.0) * 0.6 + n(vUv * 9.0 - vSeed * 5.0) * 0.4;
          float a = (1.0 - smoothstep(0.35, 1.0, r + (puff - 0.5) * 0.5));
          gl_FragColor = vec4(vCol.rgb * (0.8 + puff * 0.4), vCol.a * a);
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = additive ? 5 : 4;
  }

  emit(x, y, z, vx, vy, vz, life, s0, s1, col0, col1, drag = 0, grav = 0, rotSpeed = 0) {
    let i;
    if (this.count < this.max) i = this.count++;
    else i = Math.floor(Math.random() * this.max);
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.life[i] = life; this.maxLife[i] = life;
    this.size[i * 2] = s0; this.size[i * 2 + 1] = s1;
    this.c0.set(col0, i * 4);
    this.c1.set(col1, i * 4);
    this.phys[i * 4] = drag; this.phys[i * 4 + 1] = grav; this.phys[i * 4 + 2] = Math.random() * 6.28; this.phys[i * 4 + 3] = rotSpeed;
  }

  update(dt) {
    const { p, v, life, maxLife, size, c0, c1, phys } = this;
    const ap = this.aPos.array, ac = this.aCol.array, asr = this.aSR.array;
    let n = this.count;
    for (let i = 0; i < n; i++) {
      life[i] -= dt;
      if (life[i] <= 0) {
        // swap-remove
        n--;
        if (i !== n) {
          p.copyWithin(i * 3, n * 3, n * 3 + 3);
          v.copyWithin(i * 3, n * 3, n * 3 + 3);
          life[i] = life[n]; maxLife[i] = maxLife[n];
          size.copyWithin(i * 2, n * 2, n * 2 + 2);
          c0.copyWithin(i * 4, n * 4, n * 4 + 4);
          c1.copyWithin(i * 4, n * 4, n * 4 + 4);
          phys.copyWithin(i * 4, n * 4, n * 4 + 4);
          i--;
        }
        continue;
      }
      const drag = Math.max(0, 1 - phys[i * 4] * dt);
      v[i * 3] *= drag; v[i * 3 + 1] = v[i * 3 + 1] * drag - phys[i * 4 + 1] * dt; v[i * 3 + 2] *= drag;
      p[i * 3] += v[i * 3] * dt; p[i * 3 + 1] += v[i * 3 + 1] * dt; p[i * 3 + 2] += v[i * 3 + 2] * dt;
      phys[i * 4 + 2] += phys[i * 4 + 3] * dt;
    }
    this.count = n;
    for (let i = 0; i < n; i++) {
      const t = 1 - life[i] / maxLife[i];
      ap[i * 3] = p[i * 3]; ap[i * 3 + 1] = p[i * 3 + 1]; ap[i * 3 + 2] = p[i * 3 + 2];
      for (let k = 0; k < 4; k++) ac[i * 4 + k] = c0[i * 4 + k] + (c1[i * 4 + k] - c0[i * 4 + k]) * t;
      asr[i * 2] = size[i * 2] + (size[i * 2 + 1] - size[i * 2]) * t;
      asr[i * 2 + 1] = phys[i * 4 + 2];
    }
    this.geo.instanceCount = n;
    if (n > 0) {
      this.aPos.clearUpdateRanges(); this.aPos.addUpdateRange(0, n * 3); this.aPos.needsUpdate = true;
      this.aCol.clearUpdateRanges(); this.aCol.addUpdateRange(0, n * 4); this.aCol.needsUpdate = true;
      this.aSR.clearUpdateRanges(); this.aSR.addUpdateRange(0, n * 2); this.aSR.needsUpdate = true;
    }
  }

  clear() { this.count = 0; this.geo.instanceCount = 0; }
}

const _v = new THREE.Vector3();
const _f = new THREE.Vector3();
const _u = new THREE.Vector3();
const _l = new THREE.Vector3();
const _e = new THREE.Vector3();
const rand = (a, b) => a + Math.random() * (b - a);

export class Effects {
  constructor(scene, quality) {
    this.scene = scene;
    this.mult = quality === 'low' ? 0.45 : quality === 'medium' ? 0.75 : 1;
    this.glow = new ParticleSystem(quality === 'low' ? 1500 : 4000, true);
    this.smoke = new ParticleSystem(quality === 'low' ? 600 : 1800, false);
    scene.add(this.glow.mesh, this.smoke.mesh);
    this.flashes = [];
    this.sphereGeo = new THREE.SphereGeometry(1, 32, 16);
    this.ringGeo = new THREE.TorusGeometry(1, 0.06, 8, 64);
  }

  clear() {
    this.glow.clear();
    this.smoke.clear();
    for (const f of this.flashes) this.scene.remove(f.mesh);
    this.flashes.length = 0;
  }

  // per-frame trails for a car (pos uu, quat)
  carTrail(car, pos, quat, dt) {
    if (car.demolished) return;
    const tc = TEAM_COLORS[car.team];
    _f.set(0, 0, 1).applyQuaternion(quat);
    _u.set(0, 1, 0).applyQuaternion(quat);
    _l.set(1, 0, 0).applyQuaternion(quat);
    if (car.boosting) {
      _e.copy(pos).addScaledVector(_f, -51).addScaledVector(_u, 6.5).multiplyScalar(S);
      const cv = _v.copy(car.vel).multiplyScalar(S);
      const n = Math.max(1, Math.round(dt * 150 * this.mult));
      const fl = tc.flame, fe = tc.flameEnd;
      for (let i = 0; i < n; i++) {
        const back = rand(7, 12);
        const j = Math.random() * dt;
        this.glow.emit(
          _e.x - _f.x * back * j + rand(-0.03, 0.03), _e.y - _f.y * back * j + rand(-0.03, 0.03), _e.z - _f.z * back * j + rand(-0.03, 0.03),
          cv.x * 0.2 - _f.x * back + rand(-0.5, 0.5), cv.y * 0.2 - _f.y * back + rand(-0.5, 0.5), cv.z * 0.2 - _f.z * back + rand(-0.5, 0.5),
          rand(0.1, 0.2), rand(0.12, 0.2), rand(0.3, 0.55),
          [fl[0] * 1.1, fl[1] * 1.1, fl[2] * 1.1, 0.55], [fe[0], fe[1], fe[2], 0], 2, 0,
        );
      }
      if (Math.random() < dt * 40 * this.mult) {
        const sm = [fe[0] * 0.9 + 0.1, fe[1] * 0.9 + 0.1, fe[2] * 0.9 + 0.1];
        this.smoke.emit(
          _e.x - _f.x * 0.4, _e.y - _f.y * 0.4, _e.z - _f.z * 0.4,
          cv.x * 0.25 - _f.x * 2 + rand(-0.4, 0.4), cv.y * 0.25 + rand(0, 0.6), cv.z * 0.25 - _f.z * 2 + rand(-0.4, 0.4),
          rand(0.7, 1.1), 0.35, rand(1.4, 2.2),
          [sm[0], sm[1], sm[2], 0.22], [0.25, 0.25, 0.28, 0], 1.2, -0.3, rand(-1, 1),
        );
      }
    }
    if (car.boosting && Math.random() < dt * 60 * this.mult) {
      // hot sparks spitting out of the exhaust (see reference photos)
      const fl = tc.flame;
      const cv = _v.copy(car.vel).multiplyScalar(S * 0.3);
      for (let i = 0; i < 2; i++) {
        this.glow.emit(_e.x, _e.y, _e.z,
          cv.x - _f.x * rand(4, 9) + rand(-2.5, 2.5), cv.y + rand(-1, 3), cv.z - _f.z * rand(4, 9) + rand(-2.5, 2.5),
          rand(0.25, 0.55), rand(0.05, 0.09), 0.02, [fl[0] * 3, fl[1] * 3, fl[2] * 3, 1], [fl[0], fl[1] * 0.6, fl[2] * 0.4, 0], 1.5, 7);
      }
    }
    if (car.supersonic) {
      // white streaks from the rear wheels
      for (const sx of [-1, 1]) {
        if (Math.random() > 0.8 * this.mult) continue;
        _e.copy(pos).addScaledVector(_l, sx * 30).addScaledVector(_f, -36).addScaledVector(_u, 5).multiplyScalar(S);
        this.glow.emit(_e.x, _e.y, _e.z, 0, 0, 0, 0.28, 0.12, 0.04, [1.6, 1.7, 1.8, 0.8], [0.8, 0.9, 1.0, 0], 0, 0);
      }
    }
  }

  // turf and dirt thrown up by spinning or sliding tyres (k = skid strength 0..1)
  dirt(car, pos, quat, k, dt) {
    if (k <= 0) return;
    _f.set(0, 0, 1).applyQuaternion(quat);
    _l.set(1, 0, 0).applyQuaternion(quat);
    const n = Math.round(dt * 70 * k * this.mult + Math.random());
    for (let i = 0; i < n; i++) {
      const w = i % 2 ? 1 : -1;
      _e.copy(pos).addScaledVector(_l, w * 34).addScaledVector(_f, -36).multiplyScalar(S);
      const back = rand(2, 6);
      const grass = Math.random() < 0.45;
      const col = grass ? [0.12, 0.22, 0.06, 1] : [0.16, 0.11, 0.06, 1];
      this.smoke.emit(_e.x, 0.12, _e.z,
        car.vel.x * S * 0.2 - _f.x * back + _l.x * w * rand(0, 2), rand(2.5, 5.5), car.vel.z * S * 0.2 - _f.z * back + _l.z * w * rand(0, 2),
        rand(0.5, 0.9), rand(0.05, 0.11), rand(0.04, 0.08), col, [col[0], col[1], col[2], 0.7], 0.3, 13, rand(-10, 10));
    }
    if (Math.random() < dt * 10 * k * this.mult) {
      _e.copy(pos).addScaledVector(_f, -40).multiplyScalar(S);
      this.smoke.emit(_e.x, 0.15, _e.z, -_f.x * 1.5, rand(0.3, 0.9), -_f.z * 1.5, rand(0.7, 1.2), 0.3, rand(1, 1.6),
        [0.36, 0.33, 0.25, 0.3], [0.3, 0.28, 0.24, 0], 1, -0.2, rand(-1, 1));
    }
  }

  // stadium fire jets when someone scores; points in uu
  pyro(points, team, dt) {
    const tc = TEAM_COLORS[team];
    for (const pt of points) {
      const n = Math.round(dt * 110 * this.mult);
      for (let i = 0; i < n; i++) {
        const hot = Math.random() < 0.5;
        this.glow.emit(pt.x * S + rand(-0.3, 0.3), pt.y * S, pt.z * S + rand(-0.3, 0.3), rand(-0.8, 0.8), rand(14, 22), rand(-0.8, 0.8),
          rand(0.35, 0.7), rand(0.5, 0.9), rand(1.1, 1.9), hot ? [2.1, 1.0, 0.25, 0.85] : [tc.flame[0] * 1.6, tc.flame[1] * 1.1, tc.flame[2] * 0.9, 0.8],
          [0.9, 0.18, 0.03, 0], 1.2, 2);
      }
    }
  }

  ballTrail(ball, pos) {
    const sp = ball.vel.length();
    if (sp < 2600) return;
    if (Math.random() > ((sp - 2600) / 2000) * this.mult) return;
    _e.copy(pos).multiplyScalar(S);
    this.glow.emit(_e.x + rand(-0.3, 0.3), _e.y + rand(-0.3, 0.3), _e.z + rand(-0.3, 0.3), 0, 0, 0, 0.35, 1.0, 0.2, [0.6, 0.85, 1.4, 0.35], [0.2, 0.4, 1.0, 0], 0, 0);
  }

  hit(point, strength) {
    const p = _e.copy(point).multiplyScalar(S);
    const n = Math.round(Math.min(40, strength / 60) * this.mult);
    for (let i = 0; i < n; i++) {
      const sp = rand(3, 9) * Math.min(2, strength / 1500);
      _v.set(rand(-1, 1), rand(-0.2, 1), rand(-1, 1)).normalize().multiplyScalar(sp);
      this.glow.emit(p.x, p.y, p.z, _v.x, _v.y, _v.z, rand(0.15, 0.35), rand(0.06, 0.12), 0.02, [3, 2.6, 1.8, 1], [2, 0.8, 0.2, 0], 2, 6);
    }
    if (strength > 1800) this.flash(p, 0xbfe3ff, 1.6, 0.18, 2.5);
  }

  boostPickup(pad) {
    const n = Math.round((pad.big ? 40 : 12) * this.mult);
    for (let i = 0; i < n; i++) {
      this.glow.emit(pad.x * S + rand(-0.6, 0.6), rand(0.1, 0.4), pad.z * S + rand(-0.6, 0.6), rand(-1, 1), rand(2, 6), rand(-1, 1), rand(0.3, 0.6), rand(0.1, 0.25), 0.02, [3, 1.8, 0.4, 1], [2, 0.6, 0.05, 0], 1, 2);
    }
  }

  flash(p, color, size, dur, intensity = 3) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const mesh = new THREE.Mesh(this.sphereGeo, mat);
    mesh.position.copy(p);
    mesh.scale.setScalar(0.01);
    this.scene.add(mesh);
    this.flashes.push({ mesh, t: 0, dur, size, kind: 'sphere' });
  }

  ring(p, color, size, dur) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const mesh = new THREE.Mesh(this.ringGeo, mat);
    mesh.position.copy(p);
    mesh.rotation.x = Math.PI / 2;
    this.scene.add(mesh);
    this.flashes.push({ mesh, t: 0, dur, size, kind: 'ring' });
  }

  explosion(point, team, big) {
    const tc = TEAM_COLORS[team];
    const p = _e.copy(point).multiplyScalar(S).clone();
    const fl = tc.flame, fe = tc.flameEnd;
    const n = Math.round((big ? 420 : 140) * this.mult);
    const spd = big ? 28 : 12;
    for (let i = 0; i < n; i++) {
      _v.set(rand(-1, 1), rand(-0.3, 1), rand(-1, 1)).normalize().multiplyScalar(rand(0.2, 1) * spd);
      this.glow.emit(p.x, p.y, p.z, _v.x, _v.y, _v.z, rand(0.5, big ? 1.6 : 0.9), rand(0.3, 0.8), rand(0.1, 0.4), [fl[0] * 3, fl[1] * 3, fl[2] * 3, 1], [fe[0] * 2, fe[1] * 2, fe[2] * 2, 0], 2.2, big ? 3 : 4);
    }
    const ns = Math.round((big ? 90 : 40) * this.mult);
    for (let i = 0; i < ns; i++) {
      _v.set(rand(-1, 1), rand(0, 1), rand(-1, 1)).normalize().multiplyScalar(rand(1, big ? 10 : 5));
      this.smoke.emit(p.x, p.y, p.z, _v.x, _v.y, _v.z, rand(1.2, 2.4), rand(0.8, 1.4), rand(2.5, big ? 6 : 3.5), [0.3, 0.3, 0.33, 0.55], [0.12, 0.12, 0.14, 0], 1.6, -0.6, rand(-1, 1));
    }
    this.flash(p, tc.main, big ? 9 : 3, big ? 0.55 : 0.3, 4);
    this.ring(p, tc.light, big ? 26 : 8, big ? 0.9 : 0.5);
  }

  // car demolition: fireball, burning debris, black smoke, flash and shockwave
  demolition(point, team) {
    const tc = TEAM_COLORS[team];
    const p = _e.copy(point).multiplyScalar(S).clone();
    p.y += 0.3;
    const nFire = Math.round(170 * this.mult);
    for (let i = 0; i < nFire; i++) {
      _v.set(rand(-1, 1), rand(-0.2, 1), rand(-1, 1)).normalize().multiplyScalar(rand(2, 11));
      const hot = Math.random() < 0.35;
      this.glow.emit(p.x, p.y, p.z, _v.x, _v.y, _v.z, rand(0.3, 0.8), rand(0.3, 0.7), rand(0.1, 0.35),
        hot ? [1.8, 1.3, 0.7, 0.7] : [1.6, 0.6, 0.12, 0.7], [0.8, 0.15, 0.02, 0], 2.5, -1.5);
    }
    // team-coloured sparks so you can tell whose car blew up
    const nSpark = Math.round(60 * this.mult);
    for (let i = 0; i < nSpark; i++) {
      _v.set(rand(-1, 1), rand(0, 1.2), rand(-1, 1)).normalize().multiplyScalar(rand(6, 16));
      this.glow.emit(p.x, p.y, p.z, _v.x, _v.y, _v.z, rand(0.4, 0.8), rand(0.08, 0.16), 0.03,
        [tc.flame[0] * 3, tc.flame[1] * 3, tc.flame[2] * 3, 1], [tc.flameEnd[0], tc.flameEnd[1], tc.flameEnd[2], 0], 1, 9);
    }
    // debris chunks arcing out
    const nDebris = Math.round(40 * this.mult);
    for (let i = 0; i < nDebris; i++) {
      _v.set(rand(-1, 1), rand(0.4, 1.4), rand(-1, 1)).normalize().multiplyScalar(rand(5, 13));
      this.smoke.emit(p.x, p.y, p.z, _v.x, _v.y, _v.z, rand(0.8, 1.5), rand(0.12, 0.25), rand(0.08, 0.15),
        [0.05, 0.05, 0.06, 1], [0.05, 0.05, 0.06, 0.8], 0.4, 14, rand(-12, 12));
    }
    const nSmoke = Math.round(70 * this.mult);
    for (let i = 0; i < nSmoke; i++) {
      _v.set(rand(-1, 1), rand(0.2, 1), rand(-1, 1)).normalize().multiplyScalar(rand(1, 5));
      this.smoke.emit(p.x, p.y, p.z, _v.x, _v.y, _v.z, rand(1.6, 3), rand(0.8, 1.4), rand(3, 5.5),
        [0.12, 0.1, 0.1, 0.75], [0.05, 0.05, 0.06, 0], 1.3, -0.8, rand(-1, 1));
    }
    this.flash(p, 0xff8a30, 3, 0.25, 2);
    this.ring(p, 0xffb060, 10, 0.55);
  }

  update(dt) {
    this.glow.update(dt);
    this.smoke.update(dt);
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.t += dt;
      const k = f.t / f.dur;
      if (k >= 1) {
        this.scene.remove(f.mesh);
        f.mesh.material.dispose();
        this.flashes.splice(i, 1);
        continue;
      }
      const e = 1 - Math.pow(1 - k, 3);
      f.mesh.scale.setScalar(Math.max(0.01, f.size * e));
      f.mesh.material.opacity = 1 - k;
    }
  }
}

