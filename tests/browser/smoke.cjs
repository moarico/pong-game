// Browser smoke test: menu -> single player match, screenshots, console errors.
const { chromium } = require('./pw.cjs');
const path = require('path');
const OUT = process.env.OUT || path.join(__dirname, '..', '..', 'tests', 'scratch', 'shots');
require('fs').mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  const q = process.env.Q || 'high';
  const url = 'file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=' + q;
  await page.goto(url);
  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.join(OUT, `menu-${q}.png`) });
  const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); function f() { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(n / 2); } requestAnimationFrame(f); }));
  console.log('menu fps', fps);
  // start single player via keyboard: Enter on "PLAY vs CPU" then Enter on KICK OFF
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `setup-${q}.png`) });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, `countdown-${q}.png`) });
  await page.waitForTimeout(2500);
  await page.keyboard.down('KeyW');
  await page.keyboard.down('ShiftLeft');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, `play1-${q}.png`) });
  await page.waitForTimeout(1500);
  await page.keyboard.up('ShiftLeft');
  await page.screenshot({ path: path.join(OUT, `play2-${q}.png`) });
  const state = await page.evaluate(() => {
    const m = window.__app.match;
    return { state: m.state, scores: m.scores, clock: m.clock, car: m.players[0].car.pos.toArray().map(Math.round), speed: Math.round(m.players[0].car.vel.length()), ball: m.world.ball.pos.toArray().map(Math.round) };
  });
  console.log(JSON.stringify(state));
  await page.keyboard.up('KeyW');
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
