// Browser test: 2 players, one Xbox controller (simulated) + one keyboard & mouse player.
const { chromium } = require('./pw.cjs');
const path = require('path');
const OUT = process.env.OUT || path.join(__dirname, '..', 'scratch', 'shots');
require('fs').mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  await page.addInitScript(() => {
    const mk = (i) => ({ index: i, id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)', connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), timestamp: 0 });
    window.__pads = [mk(0)];
    navigator.getGamepads = () => window.__pads;
    window.__btn = (i, b, v) => { const x = window.__pads[i].buttons[b]; x.value = v; x.pressed = v > 0.5; };
  });
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=low');
  const ev = (f, a) => page.evaluate(f, a);
  const frames = () => ev(() => (window.__app && window.__app.frames) || 0);
  const waitFrames = async (n) => { const f0 = await frames(); for (let i = 0; i < 400; i++) { if ((await frames()) >= f0 + n) return; await page.waitForTimeout(50); } };
  const tap = async (b) => { await ev((x) => window.__btn(0, x, 1), b); await waitFrames(2); await ev((x) => window.__btn(0, x, 0), b); await waitFrames(2); };
  await waitFrames(5);
  await tap(13); await tap(0); // main menu -> 2 PLAYERS VERSUS
  await tap(0); // setup -> CONTINUE
  console.log('screen:', await ev(() => window.__app.menu.screen));
  await tap(0); // controller joins
  await page.click('.join-slot:nth-child(2)'); // keyboard & mouse player clicks the free slot
  await waitFrames(2);
  console.log('slots:', JSON.stringify(await ev(() => window.__app.menu.joinSlots)));
  console.log('start button visible:', await page.isVisible('text=START MATCH'));
  await page.screenshot({ path: path.join(OUT, 'join-mixed.png') });
  await page.keyboard.press('Enter');
  await waitFrames(3);
  console.log('match humans:', JSON.stringify(await ev(() => window.__app.match.humans.map((h) => ({ dev: h.device, team: h.car.team })))));
  for (let i = 0; i < 100; i++) { if ((await ev(() => window.__app.match.state)) === 'playing') break; await page.waitForTimeout(200); }
  // controller: hold RT. keyboard & mouse: hold W + left mouse (boost)
  await ev(() => window.__btn(0, 7, 1));
  await page.mouse.move(480, 300);
  await page.keyboard.down('KeyW');
  await page.mouse.down({ button: 'left' });
  await waitFrames(6);
  const mid = await ev(() => window.__app.match.humans.map((h) => ({ speed: Math.round(h.car.vel.length()), boosting: h.car.boosting, boost: Math.round(h.car.boost) })));
  console.log('while driving:', JSON.stringify(mid));
  await page.mouse.up({ button: 'left' });
  await page.mouse.down({ button: 'right' }); // jump
  await waitFrames(4);
  console.log('K&M player after right click:', JSON.stringify(await ev(() => { const c = window.__app.match.humans[1].car; return { y: Math.round(c.pos.y), onGround: c.onGround }; })));
  await page.mouse.up({ button: 'right' });
  await page.keyboard.up('KeyW');
  await page.screenshot({ path: path.join(OUT, 'split-mixed.png') });
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();

  // controllers blocked (e.g. embedded page): join screen should say so
  const b2 = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p2 = await b2.newPage({ viewport: { width: 960, height: 540 } });
  await p2.addInitScript(() => { navigator.getGamepads = () => { throw new DOMException('getGamepads() is not allowed in this document', 'SecurityError'); }; });
  await p2.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=low');
  await p2.waitForTimeout(3000);
  await p2.evaluate(() => window.__app.menu.show('join', 'versus'));
  await p2.waitForTimeout(800);
  console.log('blocked notice:', (await p2.textContent('.join-blocked')).slice(0, 70));
  await p2.screenshot({ path: path.join(OUT, 'join-blocked.png') });
  await b2.close();
})();
