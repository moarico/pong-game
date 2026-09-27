import * as THREE from 'three';
import { SUN_DIR, SUN_DISC, LIGHT, QUALITY, QUALITY_ORDER, TRAIL_N } from './config.js';
import { Wind } from './wind.js';
import { Sky } from './sky.js';
import { Ground, Hills, terrainHeight } from './terrain.js';
import { Grass } from './grass.js';
import { Sea } from './sea.js';
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
import { Menu } from './menu.js';
import { groundHeight } from './ground.js';
import { StageManager } from './stage.js';
import { STAGES } from './stages/index.js';

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
  uSunDisc: { value: SUN_DISC.clone() },
  uSunColor: { value: LIGHT.sun.clone() },
  uAmbSky: { value: LIGHT.ambSky.clone() },
  uAmbGround: { value: LIGHT.ambGround.clone() },
  uFogColor: { value: LIGHT.fog.clone() },
  uFogSunColor: { value: LIGHT.fogSun.clone() },
  uFogDensity: { value: LIGHT.fogDensity },
  uFogFalloff: { value: LIGHT.fogFalloff },
  uMist: { value: new THREE.Vector2(LIGHT.mist, LIGHT.mistFalloff) },
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
  uArena: { value: 0 },
  uPtPos: { value: Array.from({ length: 4 }, () => new THREE.Vector4()) },
  uPtCol: { value: Array.from({ length: 4 }, () => new THREE.Vector4()) },
  uEnvSky: { value: new THREE.Vector3(0.3, 0.3, 0.35) },
  uEnvGround: { value: new THREE.Vector3(0.1, 0.08, 0.07) },
  uFlashLight: { value: 0 },
};

let qName = initialQuality();
let quality = QUALITY[qName];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60000);
camera.layers.enable(1);

const wind = new Wind(shared);
wind.boost = 0.55; // the game opens on the title, in a stiff breeze
const sky = new Sky(shared);
const ground = new Ground(shared);
const hills = new Hills(shared);
const sea = new Sea(shared);
if (hdr) sea.bake(renderer);
const grass = new Grass(shared);
const motes = new Motes(shared);
const puffs = new Puffs(shared);
const samurai = new Character(shared, wind, 'samurai', { cape: true });
scene.add(sky.mesh, ground.mesh, sea.mesh, hills.group, grass.group, motes.points, puffs.points);
samurai.addTo(scene);

// Combat effects.
const trailP = new SwordTrail(0xfff0d8, { life: 0.14 });
trailP.setColor(0xffe2bc, 3.0);
const sparks = new Sparks();
const blood = new Blood(shared);
const glints = new Glints();
scene.add(trailP.mesh, sparks.mesh, blood.points, glints.points);

// On the title screen he stands on the brow of the hill looking out over the bay,
// just left of the sun.
const SUN_YAW = Math.atan2(SUN_DIR.x, SUN_DIR.z);
const deg = THREE.MathUtils.degToRad;
const TITLE_YAW = SUN_YAW + deg(3);
const player = new Player(0, 0, TITLE_YAW);
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
    puffs.burst(x, groundHeight(x, z), z, Math.min(1, s));
    if (!stages.current) trail.ring(x, z, Math.min(1, 0.5 + s * 0.5));
    else stages.current.onImpact?.(x, z, s);
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
// The boss arenas. The hilltop's own sky, ground, sea, grass and dust step aside inside them.
const stages = new StageManager(game, scene, post, [sky.mesh, ground.mesh, sea.mesh, hills.group, grass.group, motes.points]);
for (const [id, S] of STAGES) stages.register(id, S);
game.stages = stages;
stages.onVictory = (st) => onVictory(st);
const encounter = () => (stages.current ? stages.current.encounter : director);
const trailOthers = [];
const trailSlots = Array.from({ length: 8 }, () => ({ x: 0, z: 0, s: 0, r: 1 }));

// Rise again after falling.
function revive() {
  if (!combat.dead || combat.deadT < 2.2) return;
  combat.revive();
  hud.setFallen(false);
  if (stages.current) {
    stages.restartFight();
    hud.show('Rise', 'Face it again', 2.4);
    return;
  }
  director.reset();
  hud.show('Rise', 'The grass remembers', 2.4);
}
addEventListener('keydown', revive);
addEventListener('pointerdown', revive);

// ---------------------------------------------------------------------------
// Game flow: title screen -> play <-> paused.
// ---------------------------------------------------------------------------

let state = 'title';
let debugCam = null; // { pos, target, fov }: a fixed camera for checks from the console
let introT = 0;
let introSkip = false;
let introStarted = 0;
let victoryT = -1;
let victoryPrompt = false;
const introLook = new THREE.Vector3();
// The boss's last moments get their own camera, beside the samurai, looking up at it.
const deathCam = { w: 0, pos: new THREE.Vector3(), look: new THREE.Vector3(), quat: new THREE.Quaternion(), m: new THREE.Matrix4() };
const fadeEl = document.getElementById('fade');
const doneKey = 'samurai-vanquished';
function loadDone() {
  try {
    return JSON.parse(localStorage.getItem(doneKey) || '{}');
  } catch {
    return {};
  }
}
let camBlend = 1; // 0..1 glide from the title shot into the play camera
let wasLocked = false;
const cine = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), fov: 48.8 };

// The title shot: from just behind and above him, looking out over the crest to the
// sea. He stands right of centre with the sun a little further right, low over the
// water. The camera drifts slowly, like a held camera.
const titleEuler = new THREE.Euler(0, 0, 0, 'YXZ');
function titleShot(t) {
  const S = player.renderPos;
  const portrait = camera.aspect < 0.9;
  // Bearing of the view from the sun, bearing of him from the view, his distance.
  const view = portrait ? deg(-8) : deg(-13.6);
  const off = portrait ? deg(3.5) : deg(9.7);
  const dist = portrait ? 5.6 : 6.0;
  const drift = Math.sin(t * 0.07) * 0.12;
  const camYaw = SUN_YAW - view + Math.sin(t * 0.05) * deg(0.6);
  const toHim = camYaw - off;
  cine.pos.set(S.x - Math.sin(toHim) * dist + Math.cos(camYaw) * drift, 0, S.z - Math.cos(toHim) * dist - Math.sin(camYaw) * drift);
  const ground = terrainHeight(cine.pos.x, cine.pos.z);
  cine.pos.y = Math.max(S.y, ground) + (portrait ? 2.6 : 2.4) + Math.sin(t * 0.09) * 0.04;
  // On a tall screen he stands higher, clear of the menu at the bottom.
  titleEuler.set(portrait ? deg(-16) : deg(-8.8), camYaw + Math.PI, 0);
  cine.quat.setFromEuler(titleEuler);
  cine.fov = portrait ? 66 : 48.8;
}

function setCamera(pos, quat, fov) {
  camera.position.copy(pos);
  camera.quaternion.copy(quat);
  if (Math.abs(camera.fov - fov) > 1e-3) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

function lockPointer() {
  if (isTouchDevice() || input.lockFailed || !canvas.requestPointerLock) return;
  try {
    const p = canvas.requestPointerLock();
    if (p && p.catch) p.catch(() => { input.lockFailed = true; });
  } catch {
    input.lockFailed = true;
  }
}

function startPlay() {
  if (state !== 'title') return;
  state = 'play';
  menu.close();
  input.enabled = true;
  input.syncPad();
  camBlend = 0;
  // The play camera starts over his shoulder, looking toward the sun.
  rig.yaw = Math.atan2(-SUN_DIR.x, -SUN_DIR.z);
  rig.pitch = 0.12;
  lockPointer();
  canvas.focus({ preventScroll: true });
  setTimeout(showHint, 900);
}

function pause() {
  if (state !== 'play') return;
  state = 'paused';
  input.enabled = false;
  menu.open('pause');
  if (document.pointerLockElement === canvas && document.exitPointerLock) document.exitPointerLock();
}

function resume() {
  if (state !== 'paused') return;
  state = 'play';
  menu.close();
  input.enabled = true;
  input.syncPad();
  lockPointer();
  canvas.focus({ preventScroll: true });
}

// Fade to black, do something, fade back in.
function fade(then) {
  fadeEl.classList.add('on');
  setTimeout(() => {
    then();
    setTimeout(() => fadeEl.classList.remove('on'), 120);
  }, 520);
}

// Into a boss arena: the hall, the samurai at its door, the boss in its lair, and an intro.
function startStage(id) {
  if (state !== 'title') return;
  if (id === 'hilltop') {
    startPlay();
    return;
  }
  menu.close();
  state = 'loading';
  fade(() => {
    director.reset(true);
    combat.revive();
    combat.fall = null;
    hud.setFallen(false);
    const st = stages.enter(id);
    state = 'intro';
    introT = 0;
    introSkip = false;
    introStarted = performance.now();
    victoryT = -1;
    victoryPrompt = false;
    input.enabled = false;
    document.body.classList.add('cinematic');
    hud.setBoss(st.boss);
    hud.hideCard();
    sound.setAmbient(id);
    rig.ready = false;
    rig.yaw = st.spawn.yaw + Math.PI;
    rig.pitch = 0.06;
  });
}

function endIntro() {
  const st = stages.current;
  state = 'play';
  document.body.classList.remove('cinematic');
  input.enabled = true;
  input.syncPad();
  st.boss.endIntro?.();
  camBlend = 0;
  const b = st.boss.focus;
  const P = player.pos;
  rig.yaw = Math.atan2(-(b.x - P.x), -(b.z - P.z));
  rig.pitch = 0.1;
  hud.card(st.boss.name, st.boss.epithet, 3.2);
  lockPointer();
  canvas.focus({ preventScroll: true });
}

function onVictory(st) {
  victoryT = 0;
  victoryPrompt = false;
  sound.play('victory');
  hud.card('Vanquished', `${st.boss.name} has fallen`, 6.5);
  const done = loadDone();
  done[st.id] = 1;
  try {
    localStorage.setItem(doneKey, JSON.stringify(done));
  } catch {
    // Not remembered; fine.
  }
  menu.setDone(st.id, true);
}

function returnToSelect() {
  fade(() => {
    quitToTitle();
    menu.showScreen('stages');
  });
}

function quitToTitle() {
  if (stages.current) {
    stages.exit();
    sound.setAmbient(null);
    hud.setBoss(null);
    hud.hideCard();
    hud.show('', '', 0.01);
    rig.focus = null;
    rig.extraDist = 0;
    rig.pitchBias = 0;
    rig.ready = false;
    player.pos.set(0, groundHeight(0, 0), 0);
    player.prevPos.copy(player.pos);
    player.renderPos.copy(player.pos);
    document.body.classList.remove('cinematic');
  }
  victoryT = -1;
  director.reset(true);
  combat.revive();
  combat.fall = null;
  hud.setFallen(false);
  player.yaw = player.prevYaw = player.renderYaw = TITLE_YAW;
  player.vel.set(0, 0, 0);
  state = 'title';
  input.enabled = false;
  menu.open('title');
}

const menu = new Menu({
  onPlay: startPlay,
  onStage: startStage,
  onResume: resume,
  onQuit: quitToTitle,
  onSound: () => {
    sound.start();
    sound.toggle();
    return !sound.muted;
  },
});
menu.setSound(!sound.muted);
for (const id of Object.keys(loadDone())) menu.setDone(id, true);
// Any key or tap skips an intro once it has begun, or leaves after a victory.
function skipOrLeave(e) {
  if (state === 'intro' && performance.now() - introStarted > 700) introSkip = true;
  else if (state === 'play' && victoryPrompt && e.type !== 'keyup') returnToSelect();
}
addEventListener('keydown', skipOrLeave);
addEventListener('pointerdown', skipOrLeave);
input.onPadChange = (on) => menu.setPad(on);
document.getElementById('pause').addEventListener('click', (e) => {
  e.preventDefault();
  pause();
});
// Losing the mouse lock (Esc) mid-fight pauses, like most games.
document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  if (!locked && wasLocked && state === 'play') pause();
  wasLocked = locked;
});

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

function tick(realDt, live, draw = true) {
  input.enabled = state === 'play';
  input.update();
  if (state === 'play' && input.pausePressed) {
    input.pausePressed = false;
    pause();
  }
  menu.update(realDt);
  const dt = state === 'paused' || state === 'loading' ? 0 : world.advance(realDt);
  shared.uTime.value += dt;
  const enc = encounter();
  const enemies = enc.enemies;
  const arena = stages.current;

  // Decide: the player's buttons, the foes' minds.
  combat.think(dt, enemies);
  for (const e of enemies) e.think(dt, combat);
  if (state === 'play' && !arena) director.update(dt);

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
      if (a.collide) a.collide(player);
      else if (!combat.dead) player.pushApart(a.body, 0.35);
      if (a.isBoss) continue;
      for (let j = i + 1; j < enemies.length; j++) if (enemies[j].active && enemies[j].alive && !enemies[j].isBoss) a.body.pushApart(enemies[j].body);
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
  const groundY = groundHeight(pos.x, pos.z);
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
    if (!e.active || e.isBoss || trailOthers.length >= trailSlots.length) continue;
    const b = e.body.renderPos;
    const o = trailSlots[trailOthers.length];
    o.x = b.x;
    o.z = b.z;
    o.s = e.alive ? 0.9 : 1.1 * Math.max(0, 1 - e.sink * 2);
    o.r = e.alive ? 0.85 * e.char.scale : 1.25;
    trailOthers.push(o);
  }
  if (!arena) trail.update(dt, pos, player.grounded, pos.y - groundY, ev.landed, ev.landSpeed, trailOthers);
  // A stiff breeze off the sea while the title is up: the cloak streams, the plumes bow.
  wind.boost += ((state === 'play' || arena ? 0 : 0.55) - wind.boost) * Math.min(1, realDt * 0.8);
  if (arena) {
    const boss = arena.boss;
    rig.focus = boss.alive || boss.state === 'dying' ? boss.focus : null;
    rig.focusW = 1;
    // Tall foes close by: the camera stands back and looks up to keep them in frame.
    const bd = Math.hypot(boss.focus.x - player.pos.x, boss.focus.z - player.pos.z);
    const near = THREE.MathUtils.smoothstep(10, 3, bd);
    rig.extraDist = (arena.camDist ?? 1.2) + (arena.camClose ?? 0) * near;
    rig.pitchBias = (arena.pitchBias ?? -0.08) - (arena.tiltClose ?? 0) * near;
  }
  if (state === 'intro') {
    introT += realDt;
    const fov = arena.introCamera(introT, cine.pos, introLook);
    arena.introEvents?.(introT, hud);
    if (fov && !introSkip) {
      camera.position.copy(cine.pos);
      camera.lookAt(introLook);
      cine.quat.copy(camera.quaternion);
      cine.fov = fov;
      if (Math.abs(camera.fov - fov) > 1e-3) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      rig.update(realDt, player, input, 0);
      setCamera(cine.pos, cine.quat, cine.fov);
    } else {
      rig.update(realDt, player, input, 1);
      endIntro();
      if (introSkip) {
        arena.boss.skipIntro?.();
        hud.hideCard();
        camBlend = 1;
      }
    }
  } else if (state === 'title') {
    rig.update(realDt, player, input, 0);
    titleShot(world.time);
    setCamera(cine.pos, cine.quat, cine.fov);
  } else if (state === 'play') {
    rig.update(realDt, player, input, combat.inCombat);
    if (victoryT >= 0) {
      victoryT += realDt;
      if (victoryT > 3 && hud.boss) hud.setBoss(null);
      if (victoryT > 6.5 && !victoryPrompt) {
        victoryPrompt = true;
        hud.show('Victory', isTouchDevice() ? 'Tap to choose your next battle' : 'Press any key to choose your next battle', 9999);
      }
    }
    if (camBlend < 1) {
      // Glide from the title shot into the play camera.
      camBlend = Math.min(1, camBlend + realDt / 1.6);
      const e = camBlend * camBlend * (3 - 2 * camBlend);
      camera.position.lerpVectors(cine.pos, camera.position, e);
      camera.quaternion.slerpQuaternions(cine.quat, camera.quaternion, e);
      camera.fov = cine.fov + (rig.fov - cine.fov) * e;
      camera.updateProjectionMatrix();
    }
  }

  // Death camera: blend toward a framing of the dying boss, then back.
  if (arena && state === 'play') {
    const boss = arena.boss;
    const want = boss.state === 'dying' && boss.deathT < (arena.deathCam ?? 5.5) ? 1 : 0;
    deathCam.w += (want - deathCam.w) * Math.min(1, realDt * (want ? 2.5 : 1.2));
    if (deathCam.w > 0.001) {
      const P = player.pos;
      const B = boss.focus;
      const dx = B.x - P.x;
      const dz = B.z - P.z;
      const d = Math.hypot(dx, dz) || 1;
      const t = boss.deathT || 0;
      const side = 2.5 + t * 0.25;
      deathCam.pos.set(P.x - (dx / d) * 4 - (dz / d) * side, P.y + 2.2 + t * 0.15, P.z - (dz / d) * 4 + (dx / d) * side);
      deathCam.look.copy(B);
      deathCam.m.lookAt(deathCam.pos, deathCam.look, camera.up);
      deathCam.quat.setFromRotationMatrix(deathCam.m);
      const e = deathCam.w * deathCam.w * (3 - 2 * deathCam.w);
      camera.position.lerp(deathCam.pos, e);
      camera.quaternion.slerp(deathCam.quat, e);
    }
  } else deathCam.w = 0;

  if (debugCam) {
    camera.position.copy(debugCam.pos);
    camera.lookAt(debugCam.target);
    if (camera.fov !== debugCam.fov) {
      camera.fov = debugCam.fov;
      camera.updateProjectionMatrix();
    }
  }

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

  if (!arena) {
    sky.update(dt, camera, wind);
    ground.update(camera);
    hills.update(camera);
    sea.update(camera);
    motes.update(dt, wind, camera, post.h);
  } else {
    stages.update(dt, camera, post.h);
  }
  puffs.update(dt, wind, camera, post.h);

  center.copy(pos).y += 0.95;
  casters.length = 0;
  for (const e of enemies) if (e.active && e.sink < 0.5) casters.push(e.body.renderPos);
  if (draw) shadow.render(renderer, scene, center, shared.uSunDir.value, casters);
  // Keep the samurai's chest in focus; in a fight, soften the blur so foes stay readable.
  center.y += 0.35;
  post.focus = camera.position.distanceTo(center);
  post.dof = quality.dof * (1 - 0.55 * rig.combat) * (state === 'play' ? 1 : 0.4) * (arena ? 0.35 : 1);
  if (draw) post.render(scene, camera, dt, stages.lightDir);

  combat.endFrame();
  for (const e of enemies) e.endFrame();
  hud.update(realDt, combat, enc.all, camera, innerWidth, innerHeight);
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

// Live renders of each hall for the stage select, taken behind the loading veil.
async function renderPreviews() {
  const src = renderer.domElement;
  // Render at a fixed landscape size whatever the screen, then put everything back.
  const pw = 960;
  const ph = 540;
  renderer.setPixelRatio(1);
  renderer.setSize(pw, ph, false);
  post.setSize(pw, ph, 0, quality.bloomLevels);
  camera.aspect = pw / ph;
  rig.aspect = camera.aspect;
  camera.updateProjectionMatrix();
  const shoot = (cv) => {
    const ctx = cv.getContext('2d');
    const aw = cv.width / cv.height;
    let sw = src.width;
    let sh = sw / aw;
    if (sh > src.height) {
      sh = src.height;
      sw = sh * aw;
    }
    ctx.drawImage(src, (src.width - sw) / 2, (src.height - sh) * 0.45, sw, sh, 0, 0, cv.width, cv.height);
    cv.classList.add('ready');
  };
  for (const card of document.querySelectorAll('.stage-card')) {
    const id = card.dataset.stage;
    const cv = card.querySelector('canvas');
    try {
      if (id !== 'hilltop') {
        const st = stages.enter(id);
        if (!st) continue;
        st.boss.previewPose?.();
        const pv = st.preview;
        debugCam = { pos: new THREE.Vector3(...pv.pos), target: new THREE.Vector3(...pv.look), fov: pv.fov };
      }
      post.init = true;
      for (let i = 0; i < 40; i++) tick(1 / 30, false, false);
      tick(1 / 30, false, true);
      tick(1 / 30, false, true);
      shoot(cv);
      await new Promise((r) => setTimeout(r, 0));
    } catch (err) {
      console.warn('preview', id, err);
    }
  }
  debugCam = null;
  if (stages.current) stages.exit();
  appliedKey = '';
  applyQuality();
  post.init = true;
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
  if (!opts.has('nopreview')) await renderPreviews();
  last = performance.now();
  if (opts.has('play')) {
    state = 'title';
    startPlay();
  } else {
    menu.open('title');
  }
  requestAnimationFrame(frame);
  requestAnimationFrame(() => veil.classList.add('gone'));
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
  play() {
    startPlay();
    camBlend = 1;
  },
  get state() {
    return state;
  },
  set debugCam(v) {
    debugCam = v;
  },
  groundAt: (x, z) => groundHeight(x, z),
  stages,
  startStage(id) {
    state = 'title';
    startStage(id);
  },
  skipIntro() {
    introSkip = true;
  },
  get introT() {
    return introT;
  },
  get introInfo() {
    return { introT, introSkip, since: performance.now() - introStarted, state };
  },
  // Advance the game by n fixed steps (for deterministic captures and tests);
  // draw = false runs the game without rendering.
  step(n = 1, dt = 1 / 30, draw = true) {
    for (let i = 0; i < n; i++) tick(dt, false, draw);
  },
  setQuality(name) {
    if (!QUALITY[name]) return;
    qName = name;
    quality = QUALITY[name];
    applyQuality();
  },
};

start();
