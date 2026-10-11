// Generates the README screenshots in docs/ (JPEG).
const { chromium } = require('./pw.cjs');
const path = require('path');
const DOCS = path.join(__dirname, '..', '..', 'docs');
const Q = process.env.Q || 'high';

async function open(browser, settings, pads) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.addInitScript((s) => { localStorage.setItem('rocketArena.settings.v1', JSON.stringify(s)); }, { world: 'realistic', timeOfDay: 'sunset', weather: 'clear', quality: Q, ...settings });
  if (pads) {
    await page.addInitScript(() => {
      const mk = (i) => ({ index: i, id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)', connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), timestamp: 0 });
      window.__pads = [mk(0), mk(1)];
      navigator.getGamepads = () => window.__pads;
      window.__btn = (i, b, v) => { const x = window.__pads[i].buttons[b]; x.value = v; x.pressed = v > 0.5; };
    });
  }
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=' + Q);
  return page;
}
const frames = (page) => page.evaluate(() => (window.__app && window.__app.frames) || 0);
async function waitFrames(page, n) { const f0 = await frames(page); for (let i = 0; i < 2400; i++) { if ((await frames(page)) >= f0 + n) return; await page.waitForTimeout(50); } }
const shot = (page, name) => page.screenshot({ path: path.join(DOCS, name), type: 'jpeg', quality: 82, timeout: 300000 });
const solo = (page, teamSize = 2) => page.evaluate((n) => {
  const a = window.__app;
  a.startMatch({ mode: 'solo', gameMode: 'soccar', teamSize: n, duration: 300, difficulty: 'pro', split: 'horizontal', humans: [{ device: { type: 'any' }, team: 0, name: 'You' }] });
  a.match.stateT = 0.05;
}, teamSize);
// freeze the game and place the first view's camera (metres)
const camAt = (page, pos, look) => page.evaluate(({ pos, look }) => {
  const a = window.__app;
  a.paused = true;
  a.hud.show(false);
  const cam = a.match.views[0].camera;
  cam.far = 6000; cam.updateProjectionMatrix();
  cam.up.set(0, 1, 0); cam.position.set(...pos); cam.lookAt(...look);
  for (let i = 0; i < 8; i++) a.stadium.update(1 / 30);
}, { pos, look });

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  // 1. main menu over the attract match
  let page = await open(browser, {});
  await waitFrames(page, 3);
  await page.evaluate(() => { window.__app.match.time = 6; });
  await waitFrames(page, 2);
  await shot(page, 'menu.jpg');

  // 2. sunset gameplay: boosting at the ball
  await solo(page);
  await waitFrames(page, 4);
  await page.evaluate(() => {
    const m = window.__app.match, car = m.humans[0].car, b = m.world.ball;
    b.frozen = false; b.pos.set(car.pos.x + 150, 650, car.pos.z + 1500); b.vel.set(0, 250, 0);
    car.vel.set(0, 0, 1500); car.boost = 76;
  });
  await page.keyboard.down('KeyW'); await page.keyboard.down('ShiftLeft');
  await waitFrames(page, 7);
  await page.keyboard.up('ShiftLeft'); await page.keyboard.up('KeyW');
  await shot(page, 'gameplay-sunset.jpg');

  // 3. the world around the stadium
  await camAt(page, [-420, 300, -480], [0, 0, 160]);
  await waitFrames(page, 3);
  await shot(page, 'world.jpg');

  // 4. goal explosion with flying blocks
  await page.evaluate(() => {
    const a = window.__app, m = a.match;
    a.paused = false;
    m.world.ball.frozen = false; m.world.ball.pos.set(0, 300, 5170); m.world.ball.vel.set(0, 0, 900);
  });
  await waitFrames(page, 6);
  await camAt(page, [14, 9, 30], [0, 3, 51]);
  await waitFrames(page, 2);
  await shot(page, 'goal-explosion.jpg');

  // 5. voxel car close-up
  await solo(page, 1);
  await waitFrames(page, 6);
  await page.evaluate(() => {
    const a = window.__app, m = a.match;
    a.paused = true; a.hud.show(false);
    const v = m.views[0]; v.hfov = 50; a.gfx.updateCameras();
    const p = m.humans[0].model.root, cam = v.camera, q = p.quaternion;
    const o = new p.position.constructor(1.6, 0.55, 1.9).applyQuaternion(q).add(p.position);
    const l = new p.position.constructor(0, 0.05, 0.1).applyQuaternion(q).add(p.position);
    cam.up.set(0, 1, 0); cam.position.copy(o); cam.lookAt(l);
  });
  await waitFrames(page, 3);
  await shot(page, 'car.jpg');
  await page.close();

  // 6. thunderstorm at night, with a lightning strike
  page = await open(browser, { timeOfDay: 'night', weather: 'storm' });
  await waitFrames(page, 3);
  await solo(page);
  await waitFrames(page, 6);
  await page.evaluate(() => {
    const a = window.__app, w = a.stadium.world.weather;
    w.strike();
    w.bolt.position.set(320, 520, 1000); w.bolt.scale.set(560, 520, 1); w.bolt.rotation.y = Math.PI;
    w.time = 0.033;
    a.stadium.update(0.001);
    a.paused = true;
  });
  await waitFrames(page, 2);
  await shot(page, 'gameplay-storm.jpg');
  await page.close();

  // 7. split screen, daytime
  page = await open(browser, { timeOfDay: 'day', quality: 'medium' }, true);
  await waitFrames(page, 3);
  await page.evaluate(() => {
    const a = window.__app;
    a.startMatch({ mode: 'versus', teamSize: 1, duration: 300, difficulty: 'pro', split: 'horizontal', humans: [{ device: { type: 'pad', index: 0 }, team: 0, name: 'Player 1' }, { device: { type: 'pad', index: 1 }, team: 1, name: 'Player 2' }] });
    a.match.stateT = 0.05;
  });
  await waitFrames(page, 3);
  await page.evaluate(() => { window.__btn(0, 7, 1); window.__btn(0, 1, 1); window.__btn(1, 7, 1); window.__btn(1, 1, 1); });
  await waitFrames(page, 10);
  await shot(page, 'split-screen.jpg');
  await browser.close();
  console.log('done');
})();
