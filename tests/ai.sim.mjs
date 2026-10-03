// Headless bot-vs-bot simulation: checks that bots touch the ball and score.
import { World } from '../src/physics/world.js';
import { Car } from '../src/physics/car.js';
import { Bot } from '../src/ai.js';
import { predictBall } from '../src/physics/ball.js';
import { DT, KICKOFF_SPOTS } from '../src/config.js';

const diff = process.argv[2] || 'pro';
const size = +(process.argv[3] || 1);
const seconds = +(process.argv[4] || 180);
const w = new World();
const cars = [], bots = [];
for (const team of [0, 1]) for (let i = 0; i < size; i++) {
  const c = w.addCar(new Car(team, `T${team}-${i}`));
  cars.push(c); bots.push(new Bot(c, diff));
}
function kickoff() {
  w.ball.reset(); w.ball.frozen = false;
  for (const team of [0, 1]) {
    const mates = cars.filter((c) => c.team === team);
    mates.forEach((c, i) => {
      const s = KICKOFF_SPOTS[i];
      const sign = team === 0 ? 1 : -1;
      c.place(s[0] * sign, s[1] * sign, team === 0 ? s[2] : Math.PI + s[2]);
    });
  }
}
kickoff();
const score = [0, 0];
let touches = 0, demos = 0, pred = [];
let t = 0, frame = 0, stuckFrames = 0;
const n = Math.round(seconds / DT);
for (let i = 0; i < n; i++) {
  if (i % 2 === 0) {
    if (frame % 3 === 0) predictBall(w.ball, 3.5, 1 / 60, pred);
    frame++;
    for (const b of bots) {
      b.update(DT * 2, {
        world: w, pred, time: w.time,
        kickoff: w.ball.lastTouch === null,
        teammates: cars.filter((c) => c.team === b.car.team),
        opponents: cars.filter((c) => c.team !== b.car.team),
      });
    }
  }
  w.step(DT);
  for (const e of w.events) { if (e.type === 'ballHit') touches++; if (e.type === 'demo') demos++; }
  w.events.length = 0;
  const g = w.ball.goalState();
  if (g >= 0) { score[1 - g]++; kickoff(); }
  if (w.ball.vel.lengthSq() < 1 && w.ball.lastTouch) stuckFrames++;
  for (const c of cars) if (!Number.isFinite(c.pos.x)) throw new Error('NaN car');
}
console.log(`${diff} ${size}v${size} ${seconds}s -> score ${score.join('-')}, touches ${touches}, demos ${demos}, ball idle frames ${stuckFrames}`);
for (const c of cars) console.log(`  ${c.name} pos ${c.pos.toArray().map((v) => v.toFixed(0)).join(',')} onGround ${c.onGround} boost ${c.boost.toFixed(0)}`);
