// Generates the README screenshots in docs/ (JPEG).
const { chromium } = require('./pw.cjs');
const path = require('path');
const DOCS = path.join(__dirname, '..', '..', 'docs');

async function open(browser, quality, pads) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  if (pads) {
    await page.addInitScript(() => {
      const mk = (i) => ({ index: i, id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)', connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), timestamp: 0 });
      window.__pads = [mk(0), mk(1)];
      navigator.getGamepads = () => window.__pads;
      window.__btn = (i, b, v) => { const x = window.__pads[i].buttons[b]; x.value = v; x.pressed = v > 0.5; };
    });
  }
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=' + quality);
  return page;
}
const frames = (page) => page.evaluate(() => (window.__app && window.__app.frames) || 0);
async function waitFrames(page, n) { const f0 = await frames(page); for (let i = 0; i < 800; i++) { if ((await frames(page)) >= f0 + n) return; await page.waitForTimeout(50); } }
const shot = (page, name) => page.screenshot({ path: path.join(DOCS, name), type: 'jpeg', quality: 82 });

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  // 1. main menu
  let page = await open(browser, 'high');
  await waitFrames(page, 3);
  await page.evaluate(() => { window.__app.match.time = 6; });
  await waitFrames(page, 2);
  await shot(page, 'menu.jpg');
  // 2. sunset aerial shot
  for (const [tod, file] of [['sunset', 'gameplay-sunset.jpg'], ['night', 'gameplay-night.jpg']]) {
    await page.evaluate((t) => {
      const a = window.__app;
      a.settings.timeOfDay = t;
      a.startMatch({ mode: 'solo', teamSize: 2, duration: 300, difficulty: 'pro', split: 'horizontal', humans: [{ device: { type: 'any' }, team: 0, name: 'You' }] });
      a.match.stateT = 0.05;
    }, tod);
    await waitFrames(page, 4);
    await page.evaluate(() => {
      const m = window.__app.match, car = m.humans[0].car, b = m.world.ball;
      b.frozen = false; b.pos.set(car.pos.x + 150, 650, car.pos.z + 1500); b.vel.set(0, 250, 0);
      car.vel.set(0, 0, 1500); car.boost = 76;
    });
    await page.keyboard.down('KeyW'); await page.keyboard.down('ShiftLeft');
    await waitFrames(page, 7);
    await page.keyboard.up('ShiftLeft'); await page.keyboard.up('KeyW');
    await shot(page, file);
  }
  await page.close();
  // 3. split screen
  page = await open(browser, 'medium', true);
  await waitFrames(page, 3);
  await page.evaluate(() => {
    const a = window.__app;
    a.settings.timeOfDay = 'night';
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
