import * as THREE from 'three';
import { SUN_DIR, LIGHT, QUALITY, QUALITY_ORDER, TRAIL_N } from './config.js';
import { Wind } from './wind.js';
import { Sky } from './sky.js';
import { Ground, Hills, terrainHeight } from './terrain.js';
import { Grass } from './grass.js';
import { Motes, Puffs } from './particles.js';
import { Samurai } from './samurai.js';
import { Player } from './player.js';
import { Input } from './input.js';
import { CameraRig } from './camera.js';
import { Post } from './post.js';
import { CharacterShadow } from './shadow.js';
import { Trail } from './trail.js';

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
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 820;
  return coarse || small ? 'medium' : 'high';
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
const samurai = new Samurai(shared, wind);
scene.add(sky.mesh, ground.mesh, hills.group, grass.group, motes.points, puffs.points);
samurai.addTo(scene);

// Start facing the setting sun, with the camera nudged so it sits just beside the hat.
const player = new Player(0, 0, Math.atan2(SUN_DIR.x, SUN_DIR.z));
const input = new Input(canvas);
const rig = new CameraRig(camera, 0.0, -0.06);
const trail = new Trail(shared);
const shadow = new CharacterShadow(shared, quality.shadowSize);
const post = new Post(renderer);

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
    if (avg > 1 / 38 && idx > 0 && perf.downgrades < 2 && !opts.has('lock')) {
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

function tick(dt, live) {
  shared.uTime.value += dt;
  input.update();

  acc += dt;
  let steps = 0;
  while (acc >= FIXED && steps < 16) {
    player.fixedUpdate(FIXED, input, rig.yaw);
    acc -= FIXED;
    steps++;
  }
  if (steps === 16) acc = 0;
  player.interpolate(acc / FIXED);

  wind.update(dt);
  const ev = player.consumeEvents();
  const pos = player.renderPos;
  const groundY = terrainHeight(pos.x, pos.z);
  samurai.update(dt, {
    pos,
    yaw: player.renderYaw,
    vel: player.vel,
    grounded: player.grounded,
    jumped: ev.jumped,
    landed: ev.landed,
    landSpeed: ev.landSpeed,
  });
  if (ev.landed) puffs.burst(pos.x, groundY, pos.z, Math.min(1, ev.landSpeed / 9));
  trail.update(dt, pos, player.grounded, pos.y - groundY, ev.landed, ev.landSpeed);
  rig.update(dt, player, input);

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
  shadow.render(renderer, scene, center, SUN_DIR);
  // Keep the samurai's chest in focus.
  center.y += 0.35;
  post.focus = camera.position.distanceTo(center);
  post.dof = quality.dof;
  post.render(scene, camera, dt, SUN_DIR);

  if (live) watchPerformance(dt);
  if (!fpsEl.hidden && perf.fps) fpsEl.textContent = `${perf.fps.toFixed(0)} fps · ${qName}`;
}

// Controls hint: fades in with the scene, fades out once walking and jumping are tried.
function showHint() {
  hint.classList.remove('gone');
  const shownAt = performance.now();
  const check = () => {
    const elapsed = performance.now() - shownAt;
    const tried = input.usedMove && input.usedJump;
    if ((tried && elapsed > 2500) || elapsed > 14000) hint.classList.add('gone');
    else setTimeout(check, 500);
  };
  setTimeout(check, 500);
}

async function start() {
  if (opts.has('fps')) fpsEl.hidden = false;
  try {
    // Compile every program up front so the first frames do not hitch.
    rig.update(0.016, player, input);
    await renderer.compileAsync(scene, camera);
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
  player, rig, input, camera, renderer, wind, post, shared,
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
