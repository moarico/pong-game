// Browser test: 2-player split screen driven entirely by two fake Xbox controllers.
const { chromium } = require('./pw.cjs');
const path = require('path');
const OUT = process.env.OUT || path.join(__dirname, '..', 'scratch', 'shots');
require('fs').mkdirSync(OUT, { recursive: true });

const FAKE_PADS = () => {
  const mk = (i) => ({
    index: i, id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)', connected: true, mapping: 'standard',
    axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0, touched: false })), timestamp: 0,
    vibrationActuator: { playEffect: () => { window.__rumbles = (window.__rumbles || 0) + 1; return Promise.resolve('complete'); } },
  });
  window.__pads = [mk(0), mk(1)];
  navigator.getGamepads = () => window.__pads;
  window.__btn = (i, b, v) => { const x = window.__pads[i].buttons[b]; x.value = v; x.pressed = v > 0.5; };
  window.__axis = (i, a, v) => { window.__pads[i].axes[a] = v; };
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  await page.addInitScript(FAKE_PADS);
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=low');
  await page.waitForTimeout(4000);
  const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); (function f() { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(n / 2); })(); }));
  console.log('low-quality menu fps (swiftshader):', fps);
  const frameWait = Math.max(400, Math.round(6000 / Math.max(1, fps)));
  const frames = () => page.evaluate(() => window.__app.frames || 0);
  const waitFrames = async (n) => { const f0 = await frames(); for (let i = 0; i < 200; i++) { if ((await frames()) >= f0 + n) return; await page.waitForTimeout(50); } };
  const tap = async (pad, b) => { await page.evaluate(([p, x]) => window.__btn(p, x, 1), [pad, b]); await waitFrames(2); await page.evaluate(([p, x]) => window.__btn(p, x, 0), [pad, b]); await waitFrames(2); };
  const screen = () => page.evaluate(() => window.__app.menu.screen);
  // main menu: D-pad down once -> "2 PLAYERS — VERSUS", A
  await tap(0, 13);
  await tap(0, 0);
  console.log('after select:', await screen());
  // setup: focus starts on CONTINUE
  await tap(0, 0);
  console.log('after continue:', await screen());
  console.log('focus', await page.evaluate(() => window.__app.menu.focus), 'items', await page.evaluate(() => window.__app.menu.items.length));
  await tap(0, 0); // P1 joins
  await tap(1, 0); // P2 joins
  await page.screenshot({ path: path.join(OUT, 'join.png') });
  const slots = await page.evaluate(() => window.__app.menu.joinSlots);
  console.log('join slots:', JSON.stringify(slots));
  await tap(0, 0); // start
  await page.waitForTimeout(500);
  const m0 = await page.evaluate(() => ({ views: window.__app.match.views.length, humans: window.__app.match.humans.map((h) => h.device), state: window.__app.match.state }));
  console.log('match:', JSON.stringify(m0));
  // wait for countdown (game time, not wall time)
  for (let i = 0; i < 80; i++) { const st = await page.evaluate(() => window.__app.match.state); if (st === 'playing') break; await page.waitForTimeout(300); }
  // both players: full throttle, P1 boosts, P2 steers right
  await page.evaluate(() => { window.__btn(0, 7, 1); window.__btn(0, 1, 1); window.__btn(1, 7, 1); window.__axis(1, 0, 0.6); });
  const t0 = await page.evaluate(() => window.__app.match.world.time);
  for (let i = 0; i < 80; i++) { const t = await page.evaluate(() => window.__app.match.world.time); if (t - t0 > 1.5) break; await page.waitForTimeout(250); }
  await page.screenshot({ path: path.join(OUT, 'split.png') });
  const s1 = await page.evaluate(() => window.__app.match.humans.map((h) => ({ pos: h.car.pos.toArray().map(Math.round), speed: Math.round(h.car.vel.length()), boost: Math.round(h.car.boost) })));
  console.log('cars after 1.5s game time:', JSON.stringify(s1));
  // P1 jumps
  await page.evaluate(() => { window.__btn(0, 1, 0); window.__btn(0, 0, 1); });
  await waitFrames(4);
  const air = await page.evaluate(() => ({ y: Math.round(window.__app.match.humans[0].car.pos.y), onGround: window.__app.match.humans[0].car.onGround }));
  console.log('P1 after jump press:', JSON.stringify(air));
  await page.evaluate(() => { window.__btn(0, 0, 0); });
  // pause with Start on P2
  await tap(1, 9);
  console.log('after start button:', await screen(), 'paused', await page.evaluate(() => window.__app.paused));
  await page.screenshot({ path: path.join(OUT, 'pause.png') });
  await tap(1, 9);
  console.log('after second start:', await screen(), 'paused', await page.evaluate(() => window.__app.paused));
  console.log('rumble calls:', await page.evaluate(() => window.__rumbles || 0));
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
