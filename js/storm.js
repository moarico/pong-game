import * as THREE from 'three';
import { STORM_PHASES, STORM_START_RADIUS, STORM_FINAL_CLOSE } from './config.js';
import { lerp, fmtTime } from './util.js';
import { ATM, HAZE_GLSL } from './zh/atmos.js';

const vert = /* glsl */ `
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
// A towering curtain of violet cloud: churning fbm swirls lit from inside, a bright seam where it meets the
// ground, more see-through up close, and melting into the haze far away.
const frag = /* glsl */ `
uniform float uTime;
uniform vec3 zhSunDir;
uniform vec3 zhFogCol;
uniform vec3 zhFogSun;
uniform vec4 zhFogP;
uniform vec3 zhCamPos;
varying vec3 vWorld;
varying vec2 vUv;
${HAZE_GLSL}
float sh( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
float sn( vec2 p ) { vec2 i = floor( p ), f = fract( p ), u = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( sh( i ), sh( i + vec2( 1.0, 0.0 ) ), u.x ), mix( sh( i + vec2( 0.0, 1.0 ) ), sh( i + vec2( 1.0, 1.0 ) ), u.x ), u.y ); }
float sfbm( vec2 p ) { float s = 0.0, a = 0.5; for ( int i = 0; i < 5; i ++ ) { s += a * sn( p ); p = p * 2.03 + vec2( 3.1, 1.7 ); a *= 0.5; } return s; }
void main() {
  float dist = length( vWorld - cameraPosition );
  float ang = atan( vWorld.z, vWorld.x );
  vec2 q = vec2( ang * 60.0, vWorld.y * 0.035 );
  vec2 warp = vec2( sfbm( q * 0.6 + vec2( uTime * 0.05, 0.0 ) ), sfbm( q * 0.6 + vec2( 4.0, - uTime * 0.04 ) ) );
  float n = sfbm( q + warp * 2.2 + vec2( - uTime * 0.12, uTime * 0.03 ) );
  vec3 deep = vec3( 0.16, 0.04, 0.36 ), mid = vec3( 0.55, 0.18, 1.05 ), hot = vec3( 1.4, 0.7, 2.4 );
  float glow = smoothstep( 0.62, 0.9, sfbm( q * 1.7 - warp + vec2( uTime * 0.2, 0.0 ) ) );
  vec3 col = mix( deep, mid, smoothstep( 0.25, 0.75, n ) ) + hot * glow * 0.25;
  // the bright seam along the ground
  float seam = exp( - abs( vWorld.y - 2.0 ) * 0.08 );
  col += vec3( 1.2, 0.5, 2.2 ) * seam * 0.8;
  float fadeTop = 1.0 - smoothstep( 0.35, 1.0, vUv.y );
  // seen from high above (the coach, skydiving) the wall is a glowing ring, not a sheet over everything
  float above = smoothstep( 120.0, 420.0, cameraPosition.y );
  fadeTop *= 1.0 - above * 0.75 * smoothstep( 0.08, 0.5, vUv.y );
  float near = smoothstep( 6.0, 60.0, dist );   // you can see through it when you stand at it
  float far = 1.0 - 0.7 * smoothstep( 150.0, 650.0, dist );   // and a distant wall is a veil, not a ceiling
  float alpha = ( 0.38 + 0.32 * n + 0.2 * seam ) * fadeTop * mix( 0.35, 1.0, near ) * far;
  // the haze swallows it with distance like everything else
  float f = zhFog( vWorld );
  col = mix( col, zhHaze( normalize( vWorld - zhCamPos ) ) * 0.9 + vec3( 0.05, 0.0, 0.12 ), f * 0.85 );
  alpha *= 1.0 - f * 0.55;
  gl_FragColor = vec4( col, alpha );
}`;

// The shrinking storm circle. Each phase waits, then shrinks to a new random circle
// inside the previous one at 50-60% of its radius.
export class Storm {
  constructor(game) {
    this.game = game;
    const geo = new THREE.CylinderGeometry(1, 1, 1, 128, 1, true);
    geo.translate(0, 0.5, 0);
    this.uniforms = {
      uTime: { value: 0 }, zhSunDir: { value: ATM.sun }, zhFogCol: { value: ATM.col }, zhFogSun: { value: ATM.sunCol }, zhFogP: { value: ATM.p }, zhCamPos: { value: ATM.cam },
    };
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
    this.mesh.position.set(c.x, -40, c.z);
    this.mesh.scale.set(Math.max(0.5, c.r), 300, Math.max(0.5, c.r));
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
