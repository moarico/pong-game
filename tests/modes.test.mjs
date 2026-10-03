// Game-mode rule tests: Heatseeker homing and Rumble power-ups.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { World } from '../src/physics/world.js';
import { Car } from '../src/physics/car.js';
import { Heatseeker, Rumble } from '../src/physics/modes.js';
import { DT, ARENA } from '../src/config.js';

const results = [];
function test(name, fn) { try { fn(); results.push(['ok', name]); } catch (e) { results.push(['FAIL', name, e.message]); } }
function run(w, s, each) { const n = Math.round(s / DT); for (let i = 0; i < n; i++) { if (each && each(i * DT) === false) return; w.step(DT); } }
function setup(modeFn, pool) {
  const w = new World();
  const a = w.addCar(new Car(0, 'A'));
  const b = w.addCar(new Car(1, 'B'));
  a.place(0, -2000, 0, 100);
  b.place(0, 2500, Math.PI, 100);
  w.mode = modeFn(w, pool);
  w.ball.frozen = false;
  return { w, a, b };
}

test('heatseeker: a weak tap still ends up in the opponent goal', () => {
  const { w, a } = setup((w) => new Heatseeker(w));
  w.ball.pos.set(1500, 200, -1000);
  w.mode.onTouch(a);
  let goal = -1;
  run(w, 8, () => { goal = w.ball.goalState(); return goal < 0; });
  assert.equal(goal, 1);
});

test('heatseeker: backboard hit sends it back the other way', () => {
  const { w, a } = setup((w) => new Heatseeker(w));
  w.ball.pos.set(2500, 1500, 4000);
  w.ball.vel.set(0, 0, 2000);
  w.mode.onTouch(a);
  let flipped = false;
  run(w, 3, () => { if (w.mode.team === 1) flipped = true; return !flipped; });
  assert.ok(flipped);
});

function rumbleWith(item) {
  const env = setup((w) => new Rumble(w, [item]));
  const s = env.w.mode.st(env.a);
  s.item = item;
  return env;
}

test('grappling hook pulls the car to the ball', () => {
  const { w, a } = rumbleWith('grapple');
  w.ball.pos.set(0, 600, 0);
  w.ball.frozen = true; w.ball.frozen = false; w.ball.vel.set(0, 0, 0);
  const d0 = a.pos.distanceTo(w.ball.pos);
  a.input.useItem = true;
  let minD = d0;
  run(w, 1.5, () => { minD = Math.min(minD, a.pos.distanceTo(w.ball.pos)); });
  results.push(['info', `grapple: start ${d0.toFixed(0)} closest ${minD.toFixed(0)}`]);
  assert.ok(minD < 300, 'reached the ball');
});

test('plunger pulls the ball to the car', () => {
  const { w, a } = rumbleWith('plunger');
  w.ball.pos.set(0, 93, 1000);
  const d0 = a.pos.distanceTo(w.ball.pos);
  a.input.useItem = true;
  let minD = d0;
  run(w, 2, () => { minD = Math.min(minD, a.pos.distanceTo(w.ball.pos)); });
  results.push(['info', `plunger: start ${d0.toFixed(0)} closest ${minD.toFixed(0)}`]);
  assert.ok(minD < 600, 'ball came close: ' + minD);
});

test('tornado lifts the ball and nearby opponent', () => {
  const { w, a, b } = rumbleWith('tornado');
  w.ball.pos.set(300, 93, -1800);
  b.place(-400, -1700, 0, 0);
  a.input.useItem = true;
  let ballMax = 0, carMax = 0;
  run(w, 3, () => { ballMax = Math.max(ballMax, w.ball.pos.y); carMax = Math.max(carMax, b.pos.y); });
  results.push(['info', `tornado: ball rose to ${ballMax.toFixed(0)}, car to ${carMax.toFixed(0)}`]);
  assert.ok(ballMax > 600 && carMax > 300);
});

test('curveball bends a sideways ball into the goal', () => {
  const { w, a } = rumbleWith('curveball');
  w.ball.pos.set(-2500, 300, 1500);
  w.ball.vel.set(1800, 200, 600);
  a.input.useItem = true;
  let goal = -1;
  run(w, 6, () => { goal = w.ball.goalState(); return goal < 0; });
  assert.equal(goal, 1);
});

test('spikes carry the ball until a flip launches it', () => {
  const { w, a } = rumbleWith('spikes');
  a.input.useItem = true;
  run(w, 0.05);
  a.input.useItem = false;
  w.ball.pos.set(0, 93, -1830);
  a.input.throttle = 1;
  run(w, 1.5);
  assert.equal(w.ball.attachedTo, a, 'ball stuck to car');
  const dist = a.pos.distanceTo(w.ball.pos);
  assert.ok(dist < 200, 'ball rides with car ' + dist);
  a.input.jump = true; run(w, 0.05); a.input.jump = false; run(w, 0.08);
  a.input.pitch = -1; a.input.jump = true; run(w, 0.05); a.input.jump = false; a.input.pitch = 0;
  run(w, 0.3);
  assert.equal(w.ball.attachedTo, null, 'released by the flip');
  assert.ok(w.ball.vel.length() > 1200, 'launched ' + w.ball.vel.length());
});

test('boot kicks the nearest opponent away', () => {
  const { w, a, b } = rumbleWith('boot');
  b.place(0, -1200, 0, 0);
  a.input.useItem = true;
  let maxY = 0;
  run(w, 1, () => { maxY = Math.max(maxY, b.pos.y); });
  assert.ok(maxY > 300, 'victim launched ' + maxY);
});

test('power hitter demolishes on a slow bump', () => {
  const { w, a, b } = rumbleWith('power');
  a.input.useItem = true;
  run(w, 0.05);
  b.place(0, -1500, Math.PI / 2, 0);
  a.vel.set(0, 0, 700); a.input.throttle = 1;
  let demo = false;
  run(w, 1.5, () => { if (w.events.some((e) => e.type === 'demo' && e.car === b)) demo = true; w.events.length = 0; return !demo; });
  assert.ok(demo);
});

test('freezer stops the ball until it is touched', () => {
  const { w, a } = rumbleWith('freezer');
  w.ball.pos.set(0, 800, 0); w.ball.vel.set(500, 300, 0);
  a.input.useItem = true;
  run(w, 1);
  assert.ok(Math.abs(w.ball.pos.y - 800) < 30 && w.ball.vel.length() < 1, 'ball held in the air');
});

test('items are handed out over time', () => {
  const { w, a, b } = setup((w) => new Rumble(w));
  run(w, 6);
  assert.ok(w.mode.st(a).item && w.mode.st(b).item, 'both cars have items');
});

for (const r of results) console.log(r.join(' | '));
if (results.some((r) => r[0] === 'FAIL')) process.exit(1);
