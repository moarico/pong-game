import * as THREE from 'three';
import { STORM_PHASES, STORM_START_RADIUS, STORM_FINAL_CLOSE } from './config.js';
import { lerp, fmtTime } from './util.js';

const vert = /* glsl */ `
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const frag = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  float dist = length(vWorld - cameraPosition);
  float a = atan(vWorld.z, vWorld.x);
  float bands = sin(a * 40.0 + vWorld.y * 0.05 - uTime * 1.5) * 0.5 + 0.5;
  float swirl = sin(a * 9.0 - vWorld.y * 0.02 + uTime * 0.7) * 0.5 + 0.5;
  float fadeTop = 1.0 - smoothstep(0.75, 1.0, vUv.y);
  float alpha = (0.42 + bands * 0.18 + swirl * 0.12) * fadeTop * mix(1.0, 0.3, smoothstep(120.0, 900.0, dist));
  vec3 col = mix(vec3(0.42, 0.12, 0.72), vec3(0.85, 0.45, 1.0), bands * swirl);
  gl_FragColor = vec4(col, alpha);
}`;

// The shrinking storm circle. Each phase waits, then shrinks to a new random circle
// inside the previous one at 50-60% of its radius.
export class Storm {
  constructor(game) {
    this.game = game;
    const geo = new THREE.CylinderGeometry(1, 1, 1, 128, 1, true);
    geo.translate(0, 0.5, 0);
    this.uniforms = { uTime: { value: 0 } };
    this.mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, uniforms: this.uniforms,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    }));
    this.mesh.renderOrder = 3;
    this.mesh.frustumCulled = false;
    game.scene.add(this.mesh);
    this.reset();
  }

  reset(speed = 1) {
    this.speed = speed;
    this.phaseIndex = 0;
    this.stage = 'wait';
    this.current = { x: 0, z: 0, r: STORM_START_RADIUS };
    this.from = { ...this.current };
    this.next = null;
    this.timer = STORM_PHASES[0].wait / speed;
    this.dps = 0;
    this.closed = false;
    this.planNext();
    this.updateMesh();
  }

  phaseDef() {
    if (this.phaseIndex < STORM_PHASES.length) return STORM_PHASES[this.phaseIndex];
    return { wait: 0, shrink: STORM_FINAL_CLOSE.shrink, dps: STORM_FINAL_CLOSE.dps };
  }

  planNext() {
    const rng = this.game.rng;
    const c = this.current;
    if (this.phaseIndex >= STORM_PHASES.length) {
      this.next = { x: c.x, z: c.z, r: 0 };
      return;
    }
    const r = c.r * (0.5 + rng() * 0.1);
    const room = c.r - r;
    // Keep the next circle mostly over land.
    for (let tries = 0; tries < 30; tries++) {
      const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * room;
      const x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d;
      if (Math.hypot(x, z) + r * 0.4 < 430 && this.game.terrain.heightAt(x, z) > 0.5) {
        this.next = { x, z, r };
        return;
      }
    }
    const towards = Math.min(room, Math.hypot(c.x, c.z));
    const l = Math.hypot(c.x, c.z) || 1;
    this.next = { x: c.x - (c.x / l) * towards, z: c.z - (c.z / l) * towards, r };
  }

  update(dt) {
    this.uniforms.uTime.value += dt;
    if (this.closed) return;
    this.timer -= dt;
    const def = this.phaseDef();
    if (this.stage === 'wait') {
      if (this.timer <= 0) {
        this.stage = 'shrink';
        this.from = { ...this.current };
        this.timer = def.shrink / this.speed;
        this.shrinkTotal = this.timer;
        this.game.hud.banner('The storm is closing in!', '#c77dff');
        this.game.audio.play('stormWarn', null);
      }
    } else {
      const t = 1 - Math.max(0, this.timer) / this.shrinkTotal;
      this.current = {
        x: lerp(this.from.x, this.next.x, t),
        z: lerp(this.from.z, this.next.z, t),
        r: lerp(this.from.r, this.next.r, t),
      };
      if (this.timer <= 0) {
        this.current = { ...this.next };
        this.phaseIndex++;
        if (this.phaseIndex > STORM_PHASES.length) {
          this.closed = true;
        } else {
          const nd = this.phaseDef();
          this.stage = 'wait';
          this.timer = nd.wait / this.speed;
          this.planNext();
          if (nd.wait > 0) this.game.hud.banner(`Storm eye shrinks in ${fmtTime(this.timer)}`, '#ffffff');
        }
      }
    }
    // Damage per second scales with the phase whose circle is active.
    const idx = Math.min(this.phaseIndex, STORM_PHASES.length - 1);
    this.dps = this.phaseIndex >= STORM_PHASES.length ? STORM_FINAL_CLOSE.dps : STORM_PHASES[idx].dps;
    this.updateMesh();
  }

  updateMesh() {
    const c = this.current;
    this.mesh.position.set(c.x, -60, c.z);
    this.mesh.scale.set(Math.max(0.5, c.r), 700, Math.max(0.5, c.r));
  }

  isInside(x, z) {
    return Math.hypot(x - this.current.x, z - this.current.z) <= this.current.r;
  }

  distOutside(x, z) {
    return Math.hypot(x - this.current.x, z - this.current.z) - this.current.r;
  }

  // Applies storm damage to everyone outside the circle once per second.
  tick(actors, dt) {
    const dps = this.dps || STORM_PHASES[0].dps;
    for (const a of actors) {
      if (!a.alive || a.mode === 'bus') continue;
      if (this.isInside(a.pos.x, a.pos.z)) {
        a.stormTick = 0;
        continue;
      }
      a.stormTick += dt;
      if (a.stormTick >= 1) {
        a.stormTick -= 1;
        a.takeDamage(dps, null, { ignoreShield: true, cause: 'storm' });
        if (!a.isBot) this.game.hud.flashStorm();
      }
    }
  }

  label() {
    if (this.closed) return { text: 'Storm closed', time: '' };
    if (this.stage === 'wait') return { text: this.phaseIndex >= STORM_PHASES.length ? 'Final storm' : 'Storm shrinks in', time: fmtTime(this.timer) };
    return { text: 'Storm shrinking', time: fmtTime(this.timer) };
  }
}
