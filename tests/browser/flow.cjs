// Browser test: single player with keyboard; goal -> replay -> kickoff; time up -> results; rematch.
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
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=' + (process.env.Q || 'low'));
  const ev = (f, a) => page.evaluate(f, a);
  const frames = () => ev(() => (window.__app && window.__app.frames) || 0);
  const waitFrames = async (n) => { const f0 = await frames(); for (let i = 0; i < 400; i++) { if ((await frames()) >= f0 + n) return; await page.waitForTimeout(50); } };
  const press = async (key) => { await page.keyboard.down(key); await waitFrames(2); await page.keyboard.up(key); await waitFrames(2); };
  const waitState = async (st, maxMs = 60000) => { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { if ((await ev(() => window.__app.match.state)) === st) return true; await page.waitForTimeout(200); } return false; };
  await waitFrames(5);
  await press('Enter'); // PLAY vs CPU
  await press('Enter'); // KICK OFF
  console.log('solo started:', JSON.stringify(await ev(() => ({ humans: window.__app.match.humans.length, cars: window.__app.match.players.length, menu: window.__app.menu.visible }))));
  console.log('playing:', await waitState('playing'));
  await page.keyboard.down('KeyW');
  await waitFrames(20);
  console.log('car speed with W held:', await ev(() => Math.round(window.__app.match.humans[0].car.vel.length())));
  await page.keyboard.up('KeyW');
  // force a goal for blue
  await ev(() => { const b = window.__app.match.world.ball; b.pos.set(0, 200, 4800); b.vel.set(0, 0, 2500); b.lastTouch = window.__app.match.humans[0].car; });
  console.log('goal state:', await waitState('goal', 20000), 'scores', JSON.stringify(await ev(() => window.__app.match.scores)));
  await waitFrames(3);
  await page.screenshot({ path: path.join(OUT, 'goal.png') });
  console.log('replay:', await waitState('replay', 30000));
  await waitFrames(25);
  await page.screenshot({ path: path.join(OUT, 'replay.png') });
  await press('Space');
  console.log('after skip:', await ev(() => window.__app.match.state));
  console.log('stats:', JSON.stringify(await ev(() => window.__app.match.humans[0].car.stats)));
  // time up
  await waitState('playing');
  await ev(() => { window.__app.match.clock = 0.5; });
  // blue (the player) won: the victory cinematic plays and can be skipped
  console.log('victory cinematic:', await waitState('victory', 60000));
  for (let i = 0; i < 200; i++) { if (await ev(() => window.__app.match.cine && window.__app.match.cine.t > 1.1)) break; await page.waitForTimeout(100); }
  await page.screenshot({ path: path.join(OUT, 'victory.png') });
  await press('Space');
  console.log('over:', await waitState('over', 60000));
  for (let i = 0; i < 100; i++) { if (await ev(() => window.__app.menu.screen === 'results')) break; await page.waitForTimeout(300); }
  console.log('results screen:', await ev(() => window.__app.menu.screen));
  await page.screenshot({ path: path.join(OUT, 'results.png') });
  await press('Enter'); // rematch
  console.log('rematch:', JSON.stringify(await ev(() => ({ state: window.__app.match.state, scores: window.__app.match.scores, menu: window.__app.menu.visible }))));
  // pause + quit to menu with keyboard
  await press('Escape');
  console.log('paused:', await ev(() => window.__app.paused), await ev(() => window.__app.menu.screen));
  await press('ArrowDown'); await press('ArrowDown'); await press('ArrowDown');
  await press('Enter');
  console.log('after quit:', await ev(() => ({ screen: window.__app.menu.screen, attract: window.__app.match.attract })));
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
