// Visual check: beauty shots of the car, goal, gameplay and the sunset stadium (high quality).
const { chromium } = require('./pw.cjs');
const path = require('path');
const OUT = process.env.OUT || path.join(__dirname, '..', 'scratch', 'shots');
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=' + (process.env.Q || 'high'));
  const ev = (f, a) => page.evaluate(f, a);
  const frames = () => ev(() => (window.__app && window.__app.frames) || 0);
  const waitFrames = async (n) => { const f0 = await frames(); for (let i = 0; i < 600; i++) { if ((await frames()) >= f0 + n) return; await page.waitForTimeout(50); } };
  await waitFrames(2);
  await ev((tod) => {
    const a = window.__app;
    a.settings.timeOfDay = tod;
    a.startMatch({ mode: 'solo', teamSize: 2, duration: 300, difficulty: 'pro', split: 'horizontal', humans: [{ device: { type: 'any' }, team: 0, name: 'You' }] });
    a.match.stateT = 0.05;
  }, process.env.TOD || 'night');
  await waitFrames(3);
  // drive + boost
  await page.keyboard.down('KeyW'); await page.keyboard.down('ShiftLeft');
  await waitFrames(9);
  const tod = process.env.TOD || 'night';
  await page.screenshot({ path: path.join(OUT, `hq-play-${tod}.png`) });
  await page.keyboard.up('ShiftLeft'); await page.keyboard.up('KeyW');
  // put the ball in the air in front of us + our car flying with boost
  await ev(() => {
    const m = window.__app.match, car = m.humans[0].car, b = m.world.ball;
    b.pos.set(car.pos.x + 200, 700, car.pos.z + 1400); b.vel.set(0, 200, 0);
    car.pos.y = 300; car.vel.set(0, 300, 1600); car.onGround = false; car.noGround = 0.3; car.input.boost = true; car.boost = 80;
  });
  await page.keyboard.down('ShiftLeft');
  await waitFrames(5);
  await page.screenshot({ path: path.join(OUT, `hq-air-${tod}.png`) });
  await page.keyboard.up('ShiftLeft');
  // beauty shot of the car
  await ev(() => {
    const a = window.__app, m = a.match;
    a.paused = true;
    const car = m.humans[0];
    const p = car.model.root.position;
    const cam = m.views[0].camera;
    cam.position.set(p.x + 2.2, p.y + 0.9, p.z + 2.6);
    cam.up.set(0, 1, 0);
    cam.lookAt(p.x, p.y + 0.15, p.z);
  });
  await waitFrames(2);
  await page.screenshot({ path: path.join(OUT, `hq-car-${tod}.png`) });
  await ev(() => {
    const m = window.__app.match;
    const cam = m.views[0].camera;
    cam.position.set(9, 3.5, 36);
    cam.lookAt(0, 3, 51.2);
  });
  await waitFrames(2);
  await page.screenshot({ path: path.join(OUT, `hq-goal-${tod}.png`) });
  await ev(() => {
    const m = window.__app.match;
    const cam = m.views[0].camera;
    cam.position.set(-30, 12, -45);
    cam.lookAt(0, 4, 10);
  });
  await waitFrames(2);
  await page.screenshot({ path: path.join(OUT, `hq-overview-${tod}.png`) });
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
