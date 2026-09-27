import * as THREE from 'three';
import { SUN_DIR, LIGHT, QUALITY, QUALITY_ORDER, TRAIL_N } from './config.js';
import { Wind } from './wind.js';
import { Sky } from './sky.js';
import { Ground, Hills, terrainHeight } from './terrain.js';
import { Grass } from './grass.js';
import { Motes, Puffs } from './particles.js';
import { Character } from './character.js';
import { Player } from './player.js';
import { Input, isTouchDevice } from './input.js';
import { CameraRig } from './camera.js';
import { Post } from './post.js';
import { CharacterShadow } from './shadow.js';
import { Trail } from './trail.js';
import { PlayerCombat } from './combat.js';
import { Director } from './enemies.js';
import { SwordTrail, Sparks, Blood, Glints } from './fx.js';
import { Hud } from './hud.js';
import { Sound } from './audio.js';

const canvas = document.getElementById('game');
const veil = document.getElementById('veil');
const hint = document.getElementById('hint');
const fpsEl = document.getElementById('fps');
const errorEl = document.getElementById('error');

function fail(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  veil.classList.add('gone');
}

// Options come from the query string or, where that is unavailable, the #hash
// (e.g. #low, #medium, #high, #fps).
const opts = new URLSearchParams(location.search);
for (const part of location.hash.replace(/^#/, '').split(/[&,]/)) if (part) opts.set(part, '1');

function initialQuality() {
  for (const q of QUALITY_ORDER) if (opts.has(q) || opts.get('q') === q) return q;
  const small = Math.min(screen.width, screen.height) < 820;
  // Phones start light (the watchdog can still step down); tablets in between.
  if (isTouchDevice()) return small ? 'low' : 'medium';
  return small ? 'medium' : 'high';
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
} catch (err) {
  fail('This demo needs WebGL 2. Try a recent version of Chrome, Edge, Firefox or Safari.');
  throw err;
}
renderer.autoClear = false;
const hdr = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');

const shared = {
  uTime: { value: 0 },
  uSunDir: { value: SUN_DIR.clone() },
  uSunColor: { value: LIGHT.sun.clone() },
  uAmbSky: { value: LIGHT.ambSky.clone() },
  uAmbGround: { value: LIGHT.ambGround.clone() },
  uFogColor: { value: LIGHT.fog.clone() },
  uFogSunColor: { value: LIGHT.fogSun.clone() },
  uFogDensity: { value: LIGHT.fogDensity },
  uFogFalloff: { value: LIGHT.fogFalloff },
  uWindDir: { value: new THREE.Vector2(1, 0) },
  uWindStrength: { value: 0.5 },
  uWindScroll: { value: new THREE.Vector2() },
  uCamXZ: { value: new THREE.Vector2() },
  uCamFwdXZ: { value: new THREE.Vector2(0, -1) },
  uCullCos: { value: 0.3 },
  uTrail: { value: Array.from({ length: TRAIL_N }, () => new THREE.Vector4(0, 0, 0, 1)) },
  uImpact: { value: new THREE.Vector4(0, 0, 99, 0) },
  uShadowMap: { value: null },
  uShadowMatrix: { value: new THREE.Matrix4() },
  uShadowParams: { value: new THREE.Vector4(2.8, 40, 0.2, 0) },
};

let qName = initialQuality();
let quality = QUALITY[qName];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 8000);
camera.layers.enable(1);

const wind = new Wind(shared);
const sky = new Sky(shared);
const ground = new Ground(shared);
const hills = new Hills(shared);
const grass = new Grass(shared);
const motes = new Motes(shared);
const puffs = new Puffs(shared);
const samurai = new Character(shared, wind, 'samurai', { cape: true });
scene.add(sky.mesh, ground.mesh, hills.group, grass.group, motes.points, puffs.points);
samurai.addTo(scene);

// Combat effects.
const trailP = new SwordTrail(0xfff0d8, { life: 0.14 });
trailP.setColor(0xffe2bc, 3.0);
const sparks = new Sparks();
const blood = new Blood(shared);
const glints = new Glints();
scene.add(trailP.mesh, sparks.mesh, blood.points, glints.points);

// Start facing the setting sun, with the camera nudged so it sits just beside the hat.
const player = new Player(0, 0, Math.atan2(SUN_DIR.x, SUN_DIR.z));
const input = new Input(canvas);
const rig = new CameraRig(camera, 0.0, -0.06);
const trail = new Trail(shared);
const shadow = new CharacterShadow(shared, quality.shadowSize);
const post = new Post(renderer);
const hud = new Hud();
const sound = new Sound();

// Game time: runs slower for slow-motion moments and all but stops for the
// split second a blow lands (hit-stop).
const world = {
  time: 0,
  scale: 1,
  stop: 0,
  slow: 0,
  slowFor: 1,
  slowScale: 1,
  hitstop(d) {
    this.stop = Math.max(this.stop, d);
  },
  slowmo(d, s) {
    this.slow = Math.max(this.slow, d);
    this.slowFor = Math.max(this.slow, 0.01);
    this.slowScale = Math.min(this.slow > 0 ? this.slowScale : 1, s);
  },
  advance(dt) {
    let k = 1;
    if (this.slow > 0) {
      this.slow -= dt;
      // Ease back to full speed over the last third.
      const x = Math.min(1, Math.max(0, this.slow / (this.slowFor * 0.35)));
      k = this.slowScale + (1 - this.slowScale) * (1 - x);
      if (this.slow <= 0) this.slowScale = 1;
    }
    if (this.stop > 0) {
      this.stop -= dt;
      k = Math.min(k, 0.03);
    }
    this.scale = k;
    const g = dt * k;
    this.time += g;
    return g;
  },
};

const fx = {
  trailP,
  sparks,
  blood,
  glints,
  puffs,
  groundImpact(x, z, s) {
    puffs.burst(x, terrainHeight(x, z), z, Math.min(1, s));
    trail.ring(x, z, Math.min(1, 0.5 + s * 0.5));
  },
};

const game = {
  shared, wind, player, char: samurai, input, fx, world, rig, audio: sound, hud,
  combat: null,
  playerTargets: [],
  onWave(n, list) {
    const heavy = list.includes('brute');
    const names = ['', 'Bandits in the grass', 'More of them', 'A heavy among them', 'They keep coming', 'Hold the field'];
    hud.show(`Wave ${n}`, heavy ? 'An armoured heavy comes: dodge the red glint' : names[Math.min(n, names.length - 1)] || 'Hold the field');
    sound.play('wave');
  },
  onWaveCleared(n) {
    world.slowmo(1.4, 0.25);
    hud.show('The field is quiet', n === 1 ? 'For now' : `Wave ${n} cleared`, 3.4);
  },
  onEnemyKilled() {
    game.kills = (game.kills || 0) + 1;
  },
  onPlayerDeath() {
    hud.setFallen(true, '');
    setTimeout(() => {
      if (game.combat.dead) hud.setFallen(true, isTouchDevice() ? 'Tap to rise again' : 'Press any key to rise again');
    }, 2200);
  },
};
game.combat = new PlayerCombat(game);
game.playerTargets = [game.combat];
const combat = game.combat;
const director = new Director(game, scene);
const trailOthers = [];
const trailSlots = Array.from({ length: 8 }, () => ({ x: 0, z: 0, s: 0, r: 1 }));

// Rise again after falling.
function revive() {
  if (!combat.dead || combat.deadT < 2.2) return;
  combat.revive();
  director.reset();
  hud.setFallen(false);
  hud.show('Rise', 'The grass remembers', 2.4);
}
addEventListener('keydown', revive);
addEventListener('pointerdown', revive);

let appliedKey = '';
function applyQuality() {
  const maxSamples = renderer.capabilities.maxSamples || 0;
  const msaa = hdr ? Math.min(quality.msaa, maxSamples) : 0;
  const pr = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
  renderer.setPixelRatio(pr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  // Reallocating render targets is costly; skip it when nothing actually changed.
  const key = `${size.x}x${size.y}/${msaa}/${quality.bloomLevels}`;
  if (key !== appliedKey) post.setSize(size.x, size.y, msaa, quality.bloomLevels);
  appliedKey = key;
  grass.setQuality(quality, msaa);
  motes.setQuality(quality);
  shadow.setSize(quality.shadowSize);
  rig.aspect = window.innerWidth / window.innerHeight;
  camera.aspect = rig.aspect;
  camera.updateProjectionMatrix();
}
if (!hdr) {
  // Without float render targets the HDR chain would clip; keep it simple and cheap.
  qName = 'low';
  quality = QUALITY.low;
}
applyQuality();
// Phones fire bursts of resize events as the address bar slides; settle first.
let resizeTimer = 0;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applyQuality, 120);
});

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

const FIXED = 1 / 120;
let acc = 0;
let last = performance.now();
const fwd = new THREE.Vector3();
const center = new THREE.Vector3();
const casters = [];

// Frame-time watchdog: step quality down (never up) if the device is struggling.
const perf = { t: 0, frames: 0, sum: 0, downgrades: 0, fps: 0 };
function watchPerformance(dt) {
  perf.t += dt;
  if (perf.t < 3) return; // let shaders warm up first
  perf.frames++;
  perf.sum += dt;
  if (perf.sum >= 2) {
    const avg = perf.sum / perf.frames;
    perf.fps = 1 / avg;
    perf.frames = 0;
    perf.sum = 0;
    const idx = QUALITY_ORDER.indexOf(qName);
    if (avg > 1 / 38 && idx > 0 && perf.downgrades < 3 && !opts.has('lock')) {
      qName = QUALITY_ORDER[idx - 1];
      quality = QUALITY[qName];
      perf.downgrades++;
      perf.t = 1.5;
      applyQuality();
    }
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000;
  last = now;
  if (!(dt > 0) || window.samurai.paused) return;
  tick(Math.min(dt, 0.1), true);
}

function tick(realDt, live) {
  const dt = world.advance(realDt);
  shared.uTime.value += dt;
  input.update();
  const enemies = director.enemies;

  // Decide: the player's buttons, the foes' minds.
  combat.think(dt, enemies);
  for (const e of enemies) e.think(dt, combat);
  director.update(dt);

  // Physics at a fixed 120 Hz, interpolated for rendering.
  acc += dt;
  let steps = 0;
  while (acc >= FIXED && steps < 16) {
    player.fixedUpdate(FIXED, input, rig.yaw);
    for (const e of enemies) e.fixed(FIXED);
    // Bodies don't pass through each other (the fallen don't block).
    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i];
      if (!a.active || !a.alive) continue;
      if (!combat.dead) player.pushApart(a.body, 0.35);
      for (let j = i + 1; j < enemies.length; j++) if (enemies[j].active && enemies[j].alive) a.body.pushApart(enemies[j].body);
    }
    acc -= FIXED;
    steps++;
  }
  if (steps === 16) acc = 0;
  player.interpolate(acc / FIXED);
  for (const e of enemies) if (e.active) e.body.interpolate(acc / FIXED);

  // Moves play out: blades sweep, blows land.
  combat.advance(dt, enemies);
  for (const e of enemies) e.advance(dt, combat, world.time);

  wind.update(dt);
  const ev = player.consumeEvents();
  const pos = player.renderPos;
  const groundY = terrainHeight(pos.x, pos.z);
  const running = Math.hypot(player.vel.x, player.vel.z) > 3;
  samurai.update(dt, {
    pos,
    yaw: player.renderYaw,
    vel: player.vel,
    grounded: player.grounded,
    jumped: ev.jumped,
    landed: ev.landed,
    landSpeed: ev.landSpeed,
    guard: combat.inCombat && !running && !combat.dead,
    action: combat.animAction(),
    lookAt: combat.hasLook && !combat.dead ? combat.lookAt : null,
  });
  for (const e of enemies) e.animate(dt, world.time);
  if (ev.landed) puffs.burst(pos.x, groundY, pos.z, Math.min(1, ev.landSpeed / 9));

  // Grass parts around foes, and lies flat where the fallen lie.
  trailOthers.length = 0;
  for (const e of enemies) {
    if (!e.active || trailOthers.length >= trailSlots.length) continue;
    const b = e.body.renderPos;
    const o = trailSlots[trailOthers.length];
    o.x = b.x;
    o.z = b.z;
    o.s = e.alive ? 0.9 : 1.1 * Math.max(0, 1 - e.sink * 2);
    o.r = e.alive ? 0.85 * e.char.scale : 1.25;
    trailOthers.push(o);
  }
  trail.update(dt, pos, player.grounded, pos.y - groundY, ev.landed, ev.landSpeed, trailOthers);
  rig.update(realDt, player, input, combat.inCombat);

  trailP.update(world.time);
  sparks.update(dt);
  blood.update(dt, camera, post.h);
  glints.update(dt, camera, post.h);

  camera.updateMatrixWorld();
  camera.getWorldDirection(fwd);
  shared.uCamXZ.value.set(camera.position.x, camera.position.z);
  const fl = Math.hypot(fwd.x, fwd.z) || 1;
  shared.uCamFwdXZ.value.set(fwd.x / fl, fwd.z / fl);
  const halfH = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect);
  shared.uCullCos.value = Math.cos(Math.min(Math.PI, halfH + 0.45));

  sky.update(dt, camera, wind);
  ground.update(camera);
  hills.update(camera);
  motes.update(dt, wind, camera, post.h);
  puffs.update(dt, wind, camera, post.h);

  center.copy(pos).y += 0.95;
  casters.length = 0;
  for (const e of enemies) if (e.active && e.sink < 0.5) casters.push(e.body.renderPos);
  shadow.render(renderer, scene, center, SUN_DIR, casters);
  // Keep the samurai's chest in focus; in a fight, soften the blur so foes stay readable.
  center.y += 0.35;
  post.focus = camera.position.distanceTo(center);
  post.dof = quality.dof * (1 - 0.55 * rig.combat);
  post.render(scene, camera, dt, SUN_DIR);

  combat.endFrame();
  for (const e of enemies) e.endFrame();
  hud.update(realDt, combat, director.all, camera, innerWidth, innerHeight);
  sound.setListener(camera.position.x, camera.position.z, rig.yaw);
  sound.setWind(wind.strength);

  if (live) watchPerformance(realDt);
  if (!fpsEl.hidden && perf.fps) fpsEl.textContent = `${perf.fps.toFixed(0)} fps · ${qName}`;
}

// Controls hint: fades in with the scene, fades out once walking and jumping are tried.
function showHint() {
  hint.classList.remove('gone');
  const shownAt = performance.now();
  const check = () => {
    const elapsed = performance.now() - shownAt;
    const tried = input.usedMove && input.usedAttack;
    if ((tried && elapsed > 6000) || elapsed > 22000) hint.classList.add('gone');
    else setTimeout(check, 500);
  };
  setTimeout(check, 500);
}

async function start() {
  if (opts.has('fps')) fpsEl.hidden = false;
  try {
    // Compile every program up front so the first frames do not hitch.
    rig.update(0.016, player, input);
    // Everything that appears later (effects, foes) is compiled now, not mid-fight.
    const later = [trailP.mesh, ...director.all.map((e) => e.char.root), ...director.all.map((e) => e.trail.mesh)];
    for (const m of later) m.visible = true;
    await renderer.compileAsync(scene, camera);
    for (const m of later) m.visible = false;
  } catch {
    // Older browsers without parallel compile simply compile on first draw.
  }
  last = performance.now();
  requestAnimationFrame(frame);
  requestAnimationFrame(() => veil.classList.add('gone'));
  setTimeout(showHint, 900);
  canvas.focus({ preventScroll: true });
}

canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  fail('The graphics context was lost. Reload the page to continue.');
});

// Handle for automated checks and tinkering from the console.
window.samurai = {
  player, rig, input, camera, renderer, wind, post, shared, scene, grass, character: samurai,
  combat, director, world, hud, sound,
  get quality() { return qName; },
  paused: false,
  // Advance the game by n fixed steps (for deterministic captures and tests).
  step(n = 1, dt = 1 / 30) {
    for (let i = 0; i < n; i++) tick(dt, false);
  },
  setQuality(name) {
    if (!QUALITY[name]) return;
    qName = name;
    quality = QUALITY[name];
    applyQuality();
  },
};

start();
