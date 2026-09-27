import * as THREE from 'three';
import { SUN_DIR, SUN_DISC, LIGHT } from './config.js';
import { setFloor } from './ground.js';
import { Particles, Telegraphs, Shockwaves, Bolts } from './vfx.js';
import { Hazards, Projectiles } from './boss.js';

// ---------------------------------------------------------------------------
// Stages: the hilltop at dusk, and four arenas each built around one boss.
// The manager swaps the world (floor, walls, light, air) when a stage is
// entered, runs the arena's own life (water, gears, crystals, storm), and owns
// the effects every fight shares: telegraphs, shockwaves, lightning, sparks,
// smoke, hazards and projectiles.
// ---------------------------------------------------------------------------

// Four point lights shared by the characters and the arena. Stages set the
// steady ones each frame; flashes (a blast, a strike) borrow a slot and fade.
export class LightRig {
  constructor(shared) {
    this.pos = shared.uPtPos.value;
    this.col = shared.uPtCol.value;
    this.base = Array.from({ length: 4 }, () => ({ x: 0, y: 0, z: 0, r: 0, c: [0, 0, 0] }));
    this.flashes = [];
  }

  set(i, x, y, z, radius, r, g, b) {
    const L = this.base[i];
    L.x = x;
    L.y = y;
    L.z = z;
    L.r = radius;
    L.c[0] = r;
    L.c[1] = g;
    L.c[2] = b;
  }

  off(i) {
    this.base[i].r = 0;
  }

  // A brief light: it takes the slot whose steady light matters least (the last).
  flash(x, y, z, radius, r, g, b, decay = 6) {
    this.flashes.push({ x, y, z, radius, c: [r, g, b], k: 1, decay });
    if (this.flashes.length > 2) this.flashes.shift();
  }

  clear() {
    for (let i = 0; i < 4; i++) this.base[i].r = 0;
    this.flashes.length = 0;
    this.apply();
  }

  update(dt) {
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.k *= Math.exp(-f.decay * dt);
      if (f.k < 0.02) this.flashes.splice(i, 1);
    }
    this.apply();
  }

  apply() {
    for (let i = 0; i < 4; i++) {
      const L = this.base[i];
      this.pos[i].set(L.x, L.y, L.z, L.r);
      this.col[i].set(L.c[0], L.c[1], L.c[2], 0);
    }
    // Flashes take the last slots.
    this.flashes.forEach((f, k) => {
      const i = 3 - k;
      this.pos[i].set(f.x, f.y, f.z, f.radius);
      this.col[i].set(f.c[0] * f.k, f.c[1] * f.k, f.c[2] * f.k, 0);
    });
  }
}

// Catmull-Rom through camera keys { t, pos:[x,y,z], look:[x,y,z], fov }.
export function sampleKeys(keys, t, pos, look) {
  const n = keys.length;
  if (t <= keys[0].t) {
    pos.fromArray(keys[0].pos);
    look.fromArray(keys[0].look);
    return keys[0].fov ?? 50;
  }
  if (t >= keys[n - 1].t) {
    pos.fromArray(keys[n - 1].pos);
    look.fromArray(keys[n - 1].look);
    return keys[n - 1].fov ?? 50;
  }
  let k = 0;
  while (k < n - 2 && t > keys[k + 1].t) k++;
  const k0 = keys[Math.max(k - 1, 0)];
  const k1 = keys[k];
  const k2 = keys[k + 1];
  const k3 = keys[Math.min(k + 2, n - 1)];
  let u = (t - k1.t) / (k2.t - k1.t);
  u = u * u * (3 - 2 * u) * 0.5 + u * 0.5; // settle into and out of each key a little
  const cr = (a, b, c, d) => {
    const u2 = u * u;
    const u3 = u2 * u;
    return 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  };
  pos.set(cr(k0.pos[0], k1.pos[0], k2.pos[0], k3.pos[0]), cr(k0.pos[1], k1.pos[1], k2.pos[1], k3.pos[1]), cr(k0.pos[2], k1.pos[2], k2.pos[2], k3.pos[2]));
  look.set(cr(k0.look[0], k1.look[0], k2.look[0], k3.look[0]), cr(k0.look[1], k1.look[1], k2.look[1], k3.look[1]), cr(k0.look[2], k1.look[2], k2.look[2], k3.look[2]));
  const f1 = k1.fov ?? 50;
  const f2 = k2.fov ?? 50;
  return f1 + (f2 - f1) * u;
}

// Base class for an arena. Subclasses fill in:
//   id, title, bossName, bossTitle, lighting, spawn {x, z, yaw}, floor {height, clamp, camera},
//   intro { dur, keys }, preview { pos, look, fov }, build(), update(dt, time), makeBoss().
export class Stage {
  constructor(game, manager) {
    this.g = game;
    this.m = manager;
    this.shared = game.shared;
    this.group = new THREE.Group();
    this.group.visible = false;
    this.built = false;
    this.fx = manager.fx;
    this.hazards = manager.hazards;
    this.projectiles = manager.projectiles;
    this.telegraphs = manager.telegraphs;
    this.waves = manager.waves;
    this.bolts = manager.bolts;
    this.lights = manager.lights;
    this.boss = null;
    this.time = 0;
    this.lightDir = new THREE.Vector3(0, 1, 0);
    this.encounter = {
      enemies: [],
      all: [],
      update: () => {},
      reset: () => this.m.restartFight(),
    };
  }

  ensureBuilt(scene) {
    if (this.built) return;
    this.build();
    this.boss = this.makeBoss();
    this.group.add(this.boss.root);
    this.encounter.enemies = [this.boss];
    this.encounter.all = [this.boss];
    scene.add(this.group);
    this.built = true;
  }

  // The samurai's starting spot, the boss in its lair.
  place() {
    const P = this.g.player;
    const s = this.spawn;
    P.pos.set(s.x, this.floor.height(s.x, s.z), s.z);
    P.prevPos.copy(P.pos);
    P.renderPos.copy(P.pos);
    P.vel.set(0, 0, 0);
    P.yaw = P.prevYaw = P.renderYaw = s.yaw;
    P.grounded = true;
  }

  enter() {}
  exit() {}
  update() {}
  onPhase2() {}

  onVictory() {
    this.m.onVictory?.(this);
  }

  // Camera during the intro. Returns the fov, or 0 when the intro is over.
  introCamera(t, pos, look) {
    if (t >= this.intro.dur) return 0;
    return sampleKeys(this.intro.keys, t, pos, look);
  }
}

export class StageManager {
  constructor(game, scene, post, hilltopObjects) {
    this.g = game;
    this.scene = scene;
    this.post = post;
    this.shared = game.shared;
    this.hilltop = hilltopObjects;
    this.stages = {};
    this.current = null;
    this.lights = new LightRig(game.shared);
    this.fx = {
      add: new Particles(game.shared, { count: 1400, blend: 'add', order: 34 }),
      smoke: new Particles(game.shared, { count: 700, blend: 'alpha', lit: 1, order: 30 }),
    };
    this.telegraphs = new Telegraphs(32);
    this.waves = new Shockwaves(12);
    this.bolts = new Bolts(5);
    this.hazards = new Hazards(game);
    this.projectiles = new Projectiles(game, scene);
    this.fxGroup = new THREE.Group();
    this.fxGroup.add(this.fx.add.points, this.fx.smoke.points, this.telegraphs.mesh, this.waves.mesh, this.bolts.group);
    this.fxGroup.visible = false;
    scene.add(this.fxGroup);
    const c = post.m.composite.uniforms;
    this.postDefaults = { rays: c.uRays.value, flare: c.uFlare.value, bloom: c.uBloom.value, key: post.m.exposure.uniforms.uKey.value, range: post.m.exposure.uniforms.uRange.value.clone() };
  }

  register(id, StageClass) {
    this.stages[id] = new StageClass(this.g, this);
  }

  get encounter() {
    return this.current ? this.current.encounter : null;
  }

  enter(id) {
    const st = this.stages[id];
    if (!st) return null;
    if (this.current && this.current !== st) this.exit();
    st.ensureBuilt(this.scene);
    this.current = st;
    st.group.visible = true;
    this.fxGroup.visible = true;
    for (const o of this.hilltop) o.visible = false;
    this.applyLighting(st.lighting);
    setFloor(st.floor);
    this.clearEffects();
    st.place();
    st.boss.reset();
    st.enter();
    return st;
  }

  exit() {
    const st = this.current;
    if (!st) return;
    st.exit();
    st.group.visible = false;
    st.boss.active = false;
    st.boss.alive = false;
    this.current = null;
    this.fxGroup.visible = false;
    for (const o of this.hilltop) o.visible = true;
    this.clearEffects();
    setFloor(null);
    this.restoreHilltop();
  }

  // After a fall: the boss back to full strength, the samurai back at the door.
  restartFight() {
    const st = this.current;
    if (!st) return;
    this.clearEffects();
    st.place();
    st.boss.reset();
    st.enter(true);
  }

  clearEffects() {
    this.hazards.clear();
    this.projectiles.clear();
    this.telegraphs.clear();
    this.waves.clear();
    this.bolts.clear();
    this.fx.add.clear();
    this.fx.smoke.clear();
    this.lights.clear();
    this.shared.uFlashLight.value = 0;
  }

  applyLighting(L) {
    const s = this.shared;
    s.uSunDir.value.fromArray(L.sunDir).normalize();
    this.current.lightDir.fromArray(L.lightDir || L.sunDir).normalize();
    s.uSunDisc.value.copy(this.current.lightDir);
    s.uSunColor.value.fromArray(L.sun);
    s.uAmbSky.value.fromArray(L.ambSky);
    s.uAmbGround.value.fromArray(L.ambGround);
    s.uFogColor.value.fromArray(L.fog);
    s.uFogSunColor.value.fromArray(L.fogSun || L.fog);
    s.uFogDensity.value = L.fogDensity;
    s.uFogFalloff.value = L.fogFalloff;
    s.uMist.value.fromArray(L.mist || [0, 1]);
    s.uEnvSky.value.fromArray(L.envSky);
    s.uEnvGround.value.fromArray(L.envGround);
    s.uArena.value = 1;
    const c = this.post.m.composite.uniforms;
    c.uRays.value = L.rays ?? 0;
    c.uFlare.value = L.flare ?? 0;
    c.uBloom.value = L.bloom ?? this.postDefaults.bloom;
    this.post.m.exposure.uniforms.uKey.value = L.key ?? 0.2;
    this.post.m.exposure.uniforms.uRange.value.fromArray(L.range || [0.06, 4]);
    this.post.init = true;
    this.g.wind.scale = L.wind ?? 0.2;
  }

  restoreHilltop() {
    const s = this.shared;
    s.uSunDir.value.copy(SUN_DIR);
    s.uSunDisc.value.copy(SUN_DISC);
    s.uSunColor.value.copy(LIGHT.sun);
    s.uAmbSky.value.copy(LIGHT.ambSky);
    s.uAmbGround.value.copy(LIGHT.ambGround);
    s.uFogColor.value.copy(LIGHT.fog);
    s.uFogSunColor.value.copy(LIGHT.fogSun);
    s.uFogDensity.value = LIGHT.fogDensity;
    s.uFogFalloff.value = LIGHT.fogFalloff;
    s.uMist.value.set(LIGHT.mist, LIGHT.mistFalloff);
    s.uArena.value = 0;
    s.uFlashLight.value = 0;
    const c = this.post.m.composite.uniforms;
    const d = this.postDefaults;
    c.uRays.value = d.rays;
    c.uFlare.value = d.flare;
    c.uBloom.value = d.bloom;
    this.post.m.exposure.uniforms.uKey.value = d.key;
    this.post.m.exposure.uniforms.uRange.value.copy(d.range);
    this.post.init = true;
    this.g.wind.scale = 1;
  }

  // The direction the light shafts and flare radiate from.
  get lightDir() {
    return this.current ? this.current.lightDir : SUN_DISC;
  }

  update(dt, camera, renderHeight) {
    const st = this.current;
    if (!st) return;
    st.time += dt;
    st.update(dt, st.time);
    this.hazards.update(dt);
    this.projectiles.update(dt);
    this.telegraphs.update(dt, st.time);
    this.waves.update(dt, st.time);
    this.bolts.update(dt);
    this.fx.add.update(dt, camera, renderHeight);
    this.fx.smoke.update(dt, camera, renderHeight);
    this.lights.update(dt);
    const fl = this.shared.uFlashLight;
    fl.value = Math.max(0, fl.value - dt * 5);
  }
}
