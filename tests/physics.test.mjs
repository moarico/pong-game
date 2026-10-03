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
