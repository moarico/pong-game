// Browser test: switching graphics quality and stadium rebuilds cleanly.
const { chromium } = require('./pw.cjs');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
  await page.goto('file://' + path.join(__dirname, '..', '..', 'index.html') + '?quality=low');
  const ev = (f, a) => page.evaluate(f, a);
  const frames = () => ev(() => (window.__app && window.__app.frames) || 0);
  const waitFrames = async (n) => { const f0 = await frames(); for (let i = 0; i < 600; i++) { if ((await frames()) >= f0 + n) return; await page.waitForTimeout(50); } };
  await waitFrames(3);
  await ev(() => { const a = window.__app; a.menu.show('settings'); a.settings.quality = 'medium'; a.applySettings(); a.menu.show('main'); });
  await waitFrames(3);
  console.log('quality now', await ev(() => window.__app.gfx.quality), 'canvases', await ev(() => document.querySelectorAll('canvas').length));
  await ev(() => { const a = window.__app; a.settings.timeOfDay = 'sunset'; a.startMatch({ mode: 'solo', teamSize: 3, duration: 60, difficulty: 'allstar', split: 'horizontal', humans: [{ device: { type: 'any' }, team: 0, name: 'You' }] }); });
  await waitFrames(5);
  console.log('3v3 match cars', await ev(() => window.__app.match.players.length), 'built', await ev(() => window.__app.builtTime));
  await ev(() => window.__app.quitToMenu());
  await waitFrames(3);
  await ev(() => { window.__app.settings.quality = 'low'; window.__app.applySettings(); });
  await waitFrames(3);
  console.log('quality now', await ev(() => window.__app.gfx.quality), 'canvases', await ev(() => document.querySelectorAll('canvas').length));
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
