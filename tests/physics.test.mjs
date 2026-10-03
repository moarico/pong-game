import assert from 'node:assert/strict';
import * as THREE from 'three';
import { World } from '../src/physics/world.js';
import { Car } from '../src/physics/car.js';
import { arenaDist } from '../src/arena.js';
import { DT, BALL, ARENA } from '../src/config.js';

const results = [];
function test(name, fn) {
  try { fn(); results.push(['ok', name]); }
  catch (e) { results.push(['FAIL', name, e.message]); }
}
function run(world, seconds, each) {
  const n = Math.round(seconds / DT);
  for (let i = 0; i < n; i++) { if (each) each(i * DT); world.step(DT); }
}

test('arena distance sanity', () => {
  assert.ok(Math.abs(arenaDist(0, 100, 0) - 100) < 1e-6);
  assert.ok(Math.abs(arenaDist(0, 1000, 0) - 1000) < 1e-6);
  assert.ok(Math.abs(arenaDist(4000, 1000, 0) - 96) < 1e-6);
  assert.ok(arenaDist(0, 300, ARENA.halfZ + 400) > 200); // inside goal
  assert.ok(arenaDist(2000, 300, ARENA.halfZ + 100) < 0); // behind back wall
  assert.ok(arenaDist(4000, 1000, 4900) < 0); // outside chamfer corner
});

test('car reaches throttle and boost top speeds', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(0, -3000, 0, 100);
  w.ball.reset(); w.ball.pos.set(3000, 93, 3000);
  car.input.throttle = 1;
  run(w, 2.5);
  const v1 = car.vel.length();
  assert.ok(v1 > 1350 && v1 < 1420, 'throttle speed ' + v1);
  assert.ok(Math.abs(car.pos.y - 17) < 2, 'ride height ' + car.pos.y);
  car.input.boost = true;
  run(w, 1.2);
  assert.ok(car.vel.length() > 2200, 'boost speed ' + car.vel.length());
  results.push(['info', `throttle ${v1.toFixed(0)} boost ${car.vel.length().toFixed(0)} boost left ${car.boost.toFixed(1)}`]);
});

test('jump heights', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(0, -2000, 0);
  run(w, 0.3);
  let maxY = 0;
  car.input.jump = true;
  run(w, 1.4, () => { maxY = Math.max(maxY, car.pos.y); });
  results.push(['info', `single jump apex ${maxY.toFixed(0)}`]);
  assert.ok(maxY > 200 && maxY < 280, 'single jump ' + maxY);
  car.input.jump = false;
  run(w, 1.5);
  assert.ok(car.onGround, 'landed');
  // double jump
  maxY = 0;
  car.input.jump = true; run(w, 0.25, () => { maxY = Math.max(maxY, car.pos.y); });
  car.input.jump = false; run(w, 0.05);
  car.input.jump = true; run(w, 1.5, () => { maxY = Math.max(maxY, car.pos.y); });
  results.push(['info', `double jump apex ${maxY.toFixed(0)}`]);
  assert.ok(maxY > 400, 'double jump ' + maxY);
});

test('drives up the side wall', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(2500, 0, Math.PI / 2 - 0.25, 100); // facing +X (left side wall), angled
  car.input.throttle = 1; car.input.boost = true;
  let maxY = 0, groundedHigh = false;
  run(w, 2.0, () => { maxY = Math.max(maxY, car.pos.y); if (car.onGround && car.pos.y > 600) groundedHigh = true; });
  results.push(['info', `wall drive max height ${maxY.toFixed(0)} pos ${car.pos.toArray().map(v=>v.toFixed(0))}`]);
  assert.ok(groundedHigh, 'car should be grounded on the wall above 600uu');
});

test('ball bounces with restitution', () => {
  const w = new World();
  w.ball.frozen = false;
  w.ball.pos.set(0, 1000, 0);
  let peaks = []; let prevVy = 0;
  run(w, 4, () => { const vy = w.ball.vel.y; if (prevVy > 0 && vy <= 0) peaks.push(w.ball.pos.y); prevVy = vy; });
  results.push(['info', `ball bounce peaks ${peaks.slice(0,3).map(p=>p.toFixed(0))}`]);
  assert.ok(peaks[0] > 330 && peaks[0] < 450, 'first bounce peak ' + peaks[0]);
});

test('car hitting ball launches it', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(0, -1500, 0, 100);
  w.ball.frozen = false;
  car.input.throttle = 1; car.input.boost = true;
  let hitSpeed = 0;
  run(w, 1.5, () => { hitSpeed = Math.max(hitSpeed, w.ball.vel.length()); });
  results.push(['info', `ball speed after boosted hit ${hitSpeed.toFixed(0)}, last touch ${w.ball.lastTouch === car}`]);
  assert.ok(hitSpeed > 2000, 'ball speed ' + hitSpeed);
});

test('ball rolls into goal and is detected', () => {
  const w = new World();
  w.ball.frozen = false;
  w.ball.pos.set(0, 93, 4500);
  w.ball.vel.set(0, 0, 1500);
  let goal = -1;
  run(w, 2, () => { if (goal < 0) goal = w.ball.goalState(); });
  assert.equal(goal, 1);
});

test('ball hitting post area does not tunnel through back wall', () => {
  const w = new World();
  w.ball.frozen = false;
  w.ball.pos.set(2000, 300, 4000);
  w.ball.vel.set(0, 0, 5000);
  run(w, 1);
  assert.ok(w.ball.pos.z < ARENA.halfZ, 'ball z ' + w.ball.pos.z);
});

test('front flip adds speed', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(0, -3000, 0);
  car.input.throttle = 1;
  run(w, 1.0);
  const v0 = car.vel.length();
  car.input.jump = true; run(w, 0.05);
  car.input.jump = false; run(w, 0.05);
  car.input.pitch = -1; car.input.jump = true; run(w, 0.05);
  car.input.jump = false; car.input.pitch = 0;
  let maxV = 0;
  run(w, 1.2, () => { maxV = Math.max(maxV, car.vel.length()); });
  results.push(['info', `flip: before ${v0.toFixed(0)} max ${maxV.toFixed(0)} landed ${car.onGround} up.y ${car.up(new THREE.Vector3()).y.toFixed(2)}`]);
  assert.ok(maxV > v0 + 350, 'flip speed');
});

test('turtle recovery', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(0, 0, 0);
  car.quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
  car.pos.y = 60;
  car.onGround = false;
  run(w, 1.0);
  car.input.jump = true; run(w, 0.1); car.input.jump = false;
  run(w, 2.5);
  results.push(['info', `turtle: up.y ${car.up(new THREE.Vector3()).y.toFixed(2)} onGround ${car.onGround} y ${car.pos.y.toFixed(1)}`]);
  assert.ok(car.onGround, 'recovered');
});

for (const r of results) console.log(r.join(' | '));
if (results.some(r => r[0] === 'FAIL')) process.exit(1);

// ---- edge cases (appended)
const edge = [];
function edgeTest(name, fn) { try { fn(); edge.push(['ok', name]); } catch (e) { edge.push(['FAIL', name, e.message]); } }

edgeTest('car driving into the goal stops at the back of the net', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(0, 3000, 0, 100);
  car.input.throttle = 1; car.input.boost = true;
  run(w, 2.5);
  assert.ok(car.pos.z < ARENA.halfZ + ARENA.goalDepth, 'inside goal ' + car.pos.z);
  assert.ok(car.pos.z > ARENA.halfZ, 'reached goal ' + car.pos.z);
  assert.ok(Number.isFinite(car.pos.x + car.pos.y + car.pos.z));
});

edgeTest('car hitting the goal post bounces off', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(ARENA.goalHalfW + 10, 3500, 0, 100);
  car.input.throttle = 1; car.input.boost = true;
  run(w, 2);
  assert.ok(car.pos.z < ARENA.halfZ + 30, 'stopped by the back wall/post ' + car.pos.z);
});

edgeTest('car driving up the wall onto the ceiling falls back down', () => {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.place(2800, 0, Math.PI / 2, 100);
  car.input.throttle = 1; car.input.boost = true;
  let maxY = 0;
  run(w, 2.2, () => { maxY = Math.max(maxY, car.pos.y); });
  car.input.boost = false; car.input.throttle = 0;
  run(w, 5);
  edge.push(['info', `ceiling run max height ${maxY.toFixed(0)}, final y ${car.pos.y.toFixed(0)} onGround ${car.onGround}`]);
  assert.ok(maxY > 1500, 'climbed high');
  assert.ok(car.pos.y < 400, 'came back down');
});

edgeTest('six cars + ball step cost', () => {
  const w = new World();
  for (let i = 0; i < 6; i++) { const c = w.addCar(new Car(i % 2)); c.place(-2000 + i * 800, (i % 2 ? 1 : -1) * 2000, 0, 100); c.input.throttle = 1; c.input.boost = true; c.input.steer = 0.3; }
  w.ball.frozen = false;
  const t0 = performance.now();
  run(w, 10);
  const ms = (performance.now() - t0) / (10 * 120);
  edge.push(['info', `world step with 6 cars: ${(ms * 1000).toFixed(0)} µs`]);
  assert.ok(ms < 1.5, 'step too slow: ' + ms + 'ms');
});

// ---- handling + boost demolitions
function turnTest(handling) {
  const w = new World();
  const car = w.addCar(new Car(0));
  car.handling = handling;
  car.place(0, -3000, 0, 100);
  car.input.throttle = 1; car.input.boost = true;
  run(w, 1.4);
  car.input.boost = false; car.input.steer = 1;
  const f = new THREE.Vector3();
  let slipMax = 0;
  const yaw0 = Math.atan2(car.forward(f).x, f.z);
  run(w, 0.6, () => {
    car.forward(f);
    const v = car.vel.clone().setY(0).normalize();
    slipMax = Math.max(slipMax, Math.acos(Math.min(1, Math.max(-1, v.dot(f.setY(0).normalize())))));
  });
  car.forward(f);
  const turned = Math.abs(Math.atan2(f.x, f.z) - yaw0);
  return { turned, slipDeg: (slipMax * 180) / Math.PI, speed: car.vel.length() };
}
edgeTest('easy handling turns tighter and slides less than realistic', () => {
  const easy = turnTest('easy'), real = turnTest('realistic');
  edge.push(['info', `0.6s full lock at speed: easy turned ${(easy.turned * 57.3).toFixed(0)}deg slip ${easy.slipDeg.toFixed(1)}deg | realistic turned ${(real.turned * 57.3).toFixed(0)}deg slip ${real.slipDeg.toFixed(1)}deg`]);
  assert.ok(easy.turned > real.turned * 1.15, 'easy should turn more');
  assert.ok(easy.slipDeg < real.slipDeg, 'easy should slide less');
});

function ram({ boost, speed, sameTeam = false, headOn = false }) {
  const w = new World();
  const a = w.addCar(new Car(0, 'A'));
  const b = w.addCar(new Car(sameTeam ? 0 : 1, 'B'));
  a.place(0, -600, 0, 100);
  b.place(0, 0, headOn ? Math.PI : Math.PI / 2, 100);
  a.vel.set(0, 0, speed);
  if (headOn) { b.vel.set(0, 0, -speed); b.input.boost = boost; b.input.throttle = 1; }
  a.input.boost = boost; a.input.throttle = 1;
  let demos = [];
  run(w, 0.6, () => { for (const e of w.events) if (e.type === 'demo') demos.push(e.car.name); w.events.length = 0; });
  return demos;
}
edgeTest('boosting into an opponent demolishes it', () => {
  assert.deepEqual(ram({ boost: true, speed: 1500 }), ['B']);
});
edgeTest('no demolition without boost below supersonic', () => {
  assert.deepEqual(ram({ boost: false, speed: 1300 }), []);
});
edgeTest('no demolition on teammates', () => {
  assert.deepEqual(ram({ boost: true, speed: 1600, sameTeam: true }), []);
});
edgeTest('head-on boosting cars both explode', () => {
  assert.deepEqual(ram({ boost: true, speed: 1500, headOn: true }).sort(), ['A', 'B']);
});

for (const r of edge) console.log(r.join(' | '));
if (edge.some((r) => r[0] === 'FAIL')) process.exit(1);
