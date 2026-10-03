// Browser test: Rumble power-ups used by a human with the keyboard (F) and a controller (RB).
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
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=' + (process.env.Q || 'medium'));
  const ev = (f, a) => page.evaluate(f, a);
  const frames = () => ev(() => (window.__app && window.__app.frames) || 0);
  const waitFrames = async (n) => { const f0 = await frames(); for (let i = 0; i < 600; i++) { if ((await frames()) >= f0 + n) return; await page.waitForTimeout(50); } };
  await waitFrames(3);
  await ev(() => {
    const a = window.__app;
    a.startMatch({ mode: 'solo', gameMode: 'rumble', items: 'all', teamSize: 1, duration: 300, difficulty: 'rookie', split: 'horizontal', humans: [{ device: { type: 'any' }, team: 0, name: 'You' }] });
    a.match.stateT = 0.05;
  });
  await waitFrames(4);
  const give = (item) => ev((it) => { const m = window.__app.match; const s = m.world.mode.st(m.humans[0].car); s.active = null; s.item = it; s.held = 0; }, item);
  const status = () => ev(() => { const m = window.__app.match; return m.world.mode.status(m.humans[0].car); });

  // tornado with the keyboard
  await ev(() => { const m = window.__app.match; const me = m.humans[0].car; m.world.ball.pos.set(me.pos.x + 300, 93, me.pos.z + 500); m.world.ball.vel.set(0, 0, 0); });
  await give('tornado');
  await waitFrames(2);
  console.log('HUD item text:', await page.textContent('.item-name'), '|', await page.textContent('.item-key'));
  await page.keyboard.down('KeyF'); await waitFrames(2); await page.keyboard.up('KeyF');
  console.log('after F:', JSON.stringify(await status()));
  await waitFrames(10);
  console.log('ball height in tornado:', await ev(() => Math.round(window.__app.match.world.ball.pos.y)));
  await ev(() => { const v = window.__app.match.humans[0].view.rig; v.distance = 1400; v.height = 500; v.ballCam = false; });
  await waitFrames(8);
  await page.screenshot({ path: path.join(OUT, 'rumble-tornado.png') });
  await ev(() => { const v = window.__app.match.humans[0].view.rig; v.distance = 280; v.height = 105; });

  // grappling hook with the controller's RB
  await ev(() => { const m = window.__app.match; const s = m.world.mode.st(m.humans[0].car); s.active = null; m.world.mode.endActive(m.humans[0].car, s); });
  await ev(() => { const m = window.__app.match; const me = m.humans[0].car; me.place(0, -2500, 0, 50); m.world.ball.pos.set(200, 700, 0); m.world.ball.vel.set(0, 0, 0); m.world.ball.iceTimer = 30; m.humans[0].view.rig.ballCam = true; m.humans[0].view.rig.snap(); });
  await give('grapple');
  await waitFrames(2);
  await ev(() => window.__btn(0, 5, 1)); await waitFrames(2); await ev(() => window.__btn(0, 5, 0));
  console.log('after RB:', JSON.stringify(await status()));
  await waitFrames(3);
  await page.screenshot({ path: path.join(OUT, 'rumble-grapple.png') });
  let closest = 1e9;
  for (let i = 0; i < 25; i++) { await waitFrames(1); closest = Math.min(closest, await ev(() => { const m = window.__app.match; return Math.round(m.humans[0].car.pos.distanceTo(m.world.ball.pos)); })); }
  console.log('closest to ball while grappling:', closest);
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
