import { TEAM_COLORS } from './config.js';
import { padLabel } from './input.js';
import { ITEMS, ITEM_KEYS } from './physics/modes.js';

function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}

const MODES = {
  solo: { title: 'PLAY vs CPU', humans: 1 },
  versus: { title: '2 PLAYERS — VERSUS', humans: 2 },
  coop: { title: '2 PLAYERS — CO-OP vs CPU', humans: 2 },
};

const CONTROLS_HTML = `
<div class="controls-grid">
  <div class="ctrl-col">
    <h3><span class="pad-icon">🎮</span> Xbox Controller</h3>
    <table>
      <tr><td><span class="btn rt">RT</span></td><td>Accelerate</td></tr>
      <tr><td><span class="btn lt">LT</span></td><td>Brake / Reverse</td></tr>
      <tr><td><span class="btn stick">L-Stick</span></td><td>Steer · Pitch &amp; yaw in the air</td></tr>
      <tr><td><span class="btn a">A</span></td><td>Jump · press again to double jump / flip (with stick)</td></tr>
      <tr><td><span class="btn b">B</span></td><td>Boost</td></tr>
      <tr><td><span class="btn x">X</span></td><td>Powerslide · Air roll (hold)</td></tr>
      <tr><td><span class="btn y">Y</span></td><td>Ball cam on/off</td></tr>
      <tr><td><span class="btn lb">LB</span> <span class="btn lb">RB</span></td><td>Air roll left / right</td></tr>
      <tr><td><span class="btn lb">RB</span></td><td>Use power-up (Rumble mode)</td></tr>
      <tr><td><span class="btn stick">R-Stick</span></td><td>Look around</td></tr>
      <tr><td><span class="btn menu">☰</span></td><td>Pause</td></tr>
    </table>
  </div>
  <div class="ctrl-col">
    <h3>⌨️🖱️ Keyboard &amp; Mouse</h3>
    <table>
      <tr><th></th><th>Player 1</th><th>Player 2</th></tr>
      <tr><td>Drive / steer</td><td>W A S D</td><td>Arrow keys</td></tr>
      <tr><td>Jump / flip</td><td>Space or Right mouse</td><td>K</td></tr>
      <tr><td>Boost</td><td>Left Shift or Left mouse</td><td>L</td></tr>
      <tr><td>Powerslide / air roll</td><td>C or Ctrl</td><td>J</td></tr>
      <tr><td>Air roll L / R</td><td>Q / E</td><td>U / O</td></tr>
      <tr><td>Ball cam</td><td>R or Middle mouse</td><td>I</td></tr>
      <tr><td>Use power-up (Rumble)</td><td>F</td><td>H</td></tr>
      <tr><td>Pause</td><td>Esc</td><td>P</td></tr>
    </table>
    <p class="hint">In single player both key sets work. Flip = jump, then jump again while holding a direction.</p>
  </div>
</div>`;

export class Menu {
  constructor(app, root) {
    this.app = app;
    this.root = root;
    this.visible = false;
    this.items = [];
    this.focus = 0;
    this.screen = null;
    this.joinSlots = [null, null];
    root.addEventListener('mousemove', () => { this.mouse = true; });
  }

  hide() {
    this.visible = false;
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
    this.screen = null;
  }

  show(name, data) {
    this.visible = true;
    this.root.classList.remove('hidden');
    this.root.innerHTML = '';
    this.root.className = 'menu screen-' + name;
    this.screen = name;
    this.data = data;
    this.items = [];
    this.focus = 0;
    this.onBack = null;
    this.custom = null;
    const fn = this['screen_' + name];
    fn.call(this, data);
    this.refreshFocus();
  }

  panel(title, sub) {
    const p = el('div', 'panel', this.root);
    if (title) el('div', 'panel-title', p, title);
    if (sub) el('div', 'panel-sub', p, sub);
    return p;
  }

  button(parent, label, action, cls = '') {
    const b = el('div', 'item button ' + cls, parent, `<span>${label}</span>`);
    const item = { el: b, type: 'button', action };
    b.addEventListener('click', () => { this.focus = this.items.indexOf(item); this.activate(); });
    b.addEventListener('mouseenter', () => { this.focus = this.items.indexOf(item); this.refreshFocus(); });
    this.items.push(item);
    return item;
  }

  option(parent, label, values, get, set) {
    const row = el('div', 'item option', parent);
    el('span', 'opt-label', row, label);
    const ctl = el('span', 'opt-ctl', row);
    const left = el('span', 'arrow', ctl, '◀');
    const val = el('span', 'opt-value', ctl);
    const right = el('span', 'arrow', ctl, '▶');
    const item = { el: row, type: 'option', values, get, set, val };
    const render = () => {
      const cur = get();
      const v = values.find((x) => x.value === cur) || values[0];
      val.textContent = v.label;
    };
    item.render = render;
    item.change = (d) => {
      const cur = get();
      let i = values.findIndex((x) => x.value === cur);
      i = (i + d + values.length) % values.length;
      set(values[i].value);
      render();
      this.app.audio.click();
      if (this.onOptionChange) this.onOptionChange();
    };
    left.addEventListener('click', (e) => { e.stopPropagation(); item.change(-1); });
    right.addEventListener('click', (e) => { e.stopPropagation(); item.change(1); });
    row.addEventListener('click', () => item.change(1));
    row.addEventListener('mouseenter', () => { this.focus = this.items.indexOf(item); this.refreshFocus(); });
    render();
    this.items.push(item);
    return item;
  }

  refreshFocus() {
    this.items.forEach((it, i) => it.el.classList.toggle('focused', i === this.focus));
  }

  activate() {
    const it = this.items[this.focus];
    if (!it) return;
    if (it.type === 'button') { this.app.audio.select(); it.action(); }
    else if (it.type === 'option') it.change(1);
  }

  update(nav) {
    if (!this.visible) return;
    if (this.custom && this.custom(nav)) return;
    const visibleItems = this.items.length;
    if (nav.up && visibleItems) { this.focus = (this.focus - 1 + visibleItems) % visibleItems; this.refreshFocus(); this.app.audio.click(); }
    if (nav.down && visibleItems) { this.focus = (this.focus + 1) % visibleItems; this.refreshFocus(); this.app.audio.click(); }
    const it = this.items[this.focus];
    if (it && it.type === 'option') {
      if (nav.left) it.change(-1);
      if (nav.right) it.change(1);
    }
    if (nav.confirm) this.activate();
    if (nav.back && this.onBack) { this.app.audio.click(); this.onBack(); }
    if (nav.start && this.onStart) this.onStart();
  }

  // ------------------------------------------------------------ screens
  screen_main() {
    const logo = el('div', 'logo', this.root);
    logo.innerHTML = '<div class="logo-top">ROCKET</div><div class="logo-bottom">ARENA</div><div class="logo-tag">supersonic car soccer</div>';
    const p = this.panel();
    p.classList.add('main-panel');
    this.button(p, '▶  PLAY vs CPU', () => this.show('setup', 'solo'), 'primary');
    this.button(p, '👥  2 PLAYERS — VERSUS', () => this.show('setup', 'versus'));
    this.button(p, '🤝  2 PLAYERS — CO-OP vs CPU', () => this.show('setup', 'coop'));
    this.button(p, '⚙  SETTINGS', () => this.show('settings'));
    this.button(p, '🎮  CONTROLS', () => this.show('controls'));
    this.button(p, '⛶  FULLSCREEN', () => this.app.toggleFullscreen());
    const foot = el('div', 'footer', this.root);
    this.padStatus(foot);
  }

  padStatus(foot) {
    const update = () => {
      const pads = this.app.input.connectedPads();
      if (this.app.input.gamepadBlocked) {
        foot.innerHTML = '<span class="footer-hint warn">⚠️ Controllers are blocked on this page. Keyboard &amp; mouse work. For controllers, open the game from its own web address.</span>';
        return;
      }
      foot.innerHTML = pads.length
        ? pads.map((p, i) => `<span class="pad-chip">🎮 ${padLabel(p.id)} ${i + 1}</span>`).join('') + '<span class="footer-hint">Ⓐ select · Ⓑ back</span>'
        : '<span class="footer-hint">Connect an Xbox controller and press any button · or use mouse / keyboard (Enter to select)</span>';
    };
    update();
    this.footerTimer = setInterval(() => { if (!foot.isConnected) clearInterval(this.footerTimer); else update(); }, 1000);
  }

  screen_setup(mode) {
    const s = this.app.settings;
    const m = MODES[mode];
    const p = this.panel(m.title, mode === 'solo' ? 'You (blue) vs CPU (orange)' : mode === 'versus' ? 'Player 1 (blue) vs Player 2 (orange) · split screen' : 'Player 1 & Player 2 (blue) vs CPU (orange) · split screen');
    const teamSizes = mode === 'coop' ? [{ label: '2 vs 2', value: 2 }, { label: '3 vs 3', value: 3 }] : [{ label: '1 vs 1', value: 1 }, { label: '2 vs 2', value: 2 }, { label: '3 vs 3', value: 3 }];
    const key = 'teamSize_' + mode;
    if (!teamSizes.some((t) => t.value === s[key])) s[key] = teamSizes[0].value;
    this.option(p, 'Game mode', [
      { label: 'Soccar', value: 'soccar' },
      { label: 'Heatseeker (ball homes in)', value: 'heatseeker' },
      { label: 'Rumble (power-ups)', value: 'rumble' },
    ], () => s.gameMode, (v) => { s.gameMode = v; });
    this.option(p, 'Power-ups (Rumble)', [{ label: 'All, random', value: 'all' }].concat(ITEM_KEYS.map((k) => ({ label: `${ITEMS[k].name} only`, value: k }))), () => s.items, (v) => { s.items = v; });
    this.option(p, 'Team size', teamSizes, () => s[key], (v) => { s[key] = v; });
    this.option(p, 'Match length', [{ label: '3 minutes', value: 180 }, { label: '5 minutes', value: 300 }, { label: '7 minutes', value: 420 }, { label: '1 minute', value: 60 }, { label: 'Unlimited', value: 0 }], () => s.duration, (v) => { s.duration = v; });
    this.option(p, 'CPU skill', [{ label: 'Rookie', value: 'rookie' }, { label: 'Pro', value: 'pro' }, { label: 'All-Star', value: 'allstar' }], () => s.difficulty, (v) => { s.difficulty = v; });
    this.option(p, 'Stadium', [{ label: 'Night', value: 'night' }, { label: 'Sunset', value: 'sunset' }], () => s.timeOfDay, (v) => { s.timeOfDay = v; });
    if (mode !== 'solo') this.option(p, 'Split screen', [{ label: 'Top / Bottom', value: 'horizontal' }, { label: 'Side by side', value: 'vertical' }], () => s.split, (v) => { s.split = v; });
    const go = () => {
      this.app.saveSettings();
      if (mode === 'solo') this.app.startMatch({ mode, gameMode: s.gameMode, items: s.items, teamSize: s[key], duration: s.duration, difficulty: s.difficulty, split: s.split, humans: [{ device: { type: 'any' }, team: 0, name: 'You' }] });
      else this.show('join', mode);
    };
    this.button(p, mode === 'solo' ? '▶  KICK OFF' : '▶  CONTINUE', go, 'primary');
    this.button(p, '◀  BACK', () => this.show('main'));
    this.onBack = () => this.show('main');
    this.focus = this.items.length - 2;
  }

  screen_join(mode) {
    const s = this.app.settings;
    const input = this.app.input;
    const p = this.panel('PRESS TO JOIN', 'Controller players press <b>Ⓐ</b>. The keyboard &amp; mouse player clicks a slot or presses <b>Space</b>.');
    const blocked = el('div', 'join-blocked', p);
    const slotsEl = el('div', 'join-slots', p);
    this.joinSlots = [null, null];
    const sameDev = (a, b) => a && b && a.type === b.type && (a.type === 'pad' ? a.index === b.index : a.layout === b.layout);
    const devName = (d) => (d.type === 'pad'
      ? '🎮 ' + padLabel(input.pads[d.index]?.id)
      : d.layout === 'p1' ? '⌨️🖱️ Keyboard &amp; Mouse' : '⌨️ Keyboard (arrow keys)');
    const ready = () => !!(this.joinSlots[0] && this.joinSlots[1]);
    let render = () => {};
    const join = (dev, pref) => {
      if (this.joinSlots.some((d) => sameDev(d, dev))) return false;
      const free = pref >= 0 && !this.joinSlots[pref] ? pref : this.joinSlots.findIndex((d) => !d);
      if (free < 0) return false;
      this.joinSlots[free] = dev;
      this.app.audio.select();
      if (dev.type === 'pad') input.rumble(dev, 0.5, 0.5, 150);
      render();
      return true;
    };
    const slotEls = [0, 1].map((i) => {
      const team = mode === 'versus' ? i : 0;
      const box = el('div', 'join-slot team' + team, slotsEl);
      el('div', 'join-title', box, `PLAYER ${i + 1}`);
      const body = el('div', 'join-body', box);
      // clicking an empty slot joins the keyboard & mouse player there
      box.addEventListener('click', () => {
        if (this.joinSlots[i]) return;
        if (!join({ type: 'kb', layout: 'p1' }, i)) join({ type: 'kb', layout: 'p2' }, i);
      });
      return { box, body, team };
    });
    const status = el('div', 'join-status', p);
    const start = () => {
      if (!ready()) return;
      const humans = this.joinSlots.map((d, i) => ({ device: d, team: mode === 'versus' ? i : 0, name: `Player ${i + 1}` }));
      const ts = s['teamSize_' + mode];
      this.app.startMatch({ mode, gameMode: s.gameMode, items: s.items, teamSize: ts, duration: s.duration, difficulty: s.difficulty, split: s.split, humans });
    };
    const startBtn = this.button(p, '▶  START MATCH', start, 'primary');
    this.button(p, '◀  BACK', () => this.show('setup', mode));
    render = () => {
      slotEls.forEach((se, i) => {
        const d = this.joinSlots[i];
        se.box.classList.toggle('joined', !!d);
        se.box.classList.toggle('clickable', !d);
        if (d) {
          const leave = d.type === 'pad' ? 'Press Ⓑ to leave' : 'Press Backspace to leave';
          se.body.innerHTML = `<div class="join-device">${devName(d)}</div><div class="join-team" style="color:${TEAM_COLORS[se.team].css}">${se.team === 0 ? 'BLUE' : 'ORANGE'} TEAM</div><div class="join-leave">${leave}</div>`;
        } else {
          se.body.innerHTML = '<div class="join-wait">Press <b>Ⓐ</b> on a controller<br><span><b>Click here</b> or press <b>Space</b> for keyboard &amp; mouse</span></div>';
        }
      });
      status.innerHTML = ready() ? '<b>Ready!</b> Press <b>Ⓐ</b>, <b>Start</b>, <b>Enter</b> or click <b>Start match</b>' : 'Waiting for players…';
      status.classList.toggle('ready', ready());
      startBtn.el.classList.toggle('hidden', !ready());
      blocked.innerHTML = input.gamepadBlocked
        ? '⚠️ This page is not allowed to read game controllers, so only keyboard &amp; mouse work here. To play with a controller, open the game from its own web address (GitHub Pages) or from the downloaded <b>index.html</b>.'
        : '';
      blocked.classList.toggle('hidden', !input.gamepadBlocked);
    };
    render();
    this.custom = (nav) => {
      // controllers
      for (const st of input.connectedPads()) {
        const dev = { type: 'pad', index: st.index };
        const slot = this.joinSlots.findIndex((d) => sameDev(d, dev));
        if (st.pressed('a') || st.pressed('menu')) {
          if (slot < 0) join(dev, -1);
          else if (ready()) { start(); return true; }
        }
        if (st.pressed('b')) {
          if (slot >= 0) { this.joinSlots[slot] = null; this.app.audio.click(); render(); } else { this.show('setup', mode); return true; }
        }
      }
      // keyboard: Space joins keyboard & mouse, Enter joins a second keyboard player on the arrow keys
      const kb = (code) => input.keysPressed.has(code);
      if (ready() && (kb('Space') || kb('Enter') || kb('NumpadEnter'))) { start(); return true; }
      if (kb('Space')) join({ type: 'kb', layout: 'p1' }, -1);
      if (kb('Enter') || kb('NumpadEnter')) join({ type: 'kb', layout: 'p2' }, -1);
      if (kb('Backspace')) {
        for (let i = 1; i >= 0; i--) if (this.joinSlots[i] && this.joinSlots[i].type === 'kb') { this.joinSlots[i] = null; render(); break; }
      }
      if (kb('Escape')) { this.show('setup', mode); return true; }
      if (input.gamepadBlocked && !this.blockedShown) { this.blockedShown = true; render(); }
      return true; // swallow normal navigation; buttons still work with the mouse
    };
  }

  screen_settings() {
    const s = this.app.settings;
    const p = this.panel('SETTINGS');
    this.option(p, 'Graphics', [{ label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }, { label: 'Low (fast)', value: 'low' }], () => s.quality, (v) => { s.quality = v; });
    this.option(p, 'Handling', [{ label: 'Easy (recommended)', value: 'easy' }, { label: 'Realistic (Rocket League)', value: 'realistic' }], () => s.handling, (v) => { s.handling = v; });
    this.option(p, 'Default camera', [{ label: 'Ball cam', value: true }, { label: 'Car cam', value: false }], () => s.ballCam, (v) => { s.ballCam = v; });
    this.option(p, 'Field of view', [90, 95, 100, 105, 110].map((v) => ({ label: v + '°', value: v })), () => s.fov, (v) => { s.fov = v; });
    this.option(p, 'Goal replays', [{ label: 'On', value: true }, { label: 'Off', value: false }], () => s.replays, (v) => { s.replays = v; });
    this.option(p, 'Controller rumble', [{ label: 'On', value: true }, { label: 'Off', value: false }], () => s.rumble, (v) => { s.rumble = v; });
    this.option(p, 'Volume', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => ({ label: v === 0 ? 'Off' : String(v), value: v / 10 })), () => Math.round(s.volume * 10) / 10, (v) => { s.volume = v; this.app.audio.setVolume(v); });
    this.option(p, 'Show FPS', [{ label: 'Off', value: false }, { label: 'On', value: true }], () => s.showFps, (v) => { s.showFps = v; });
    const done = () => { this.app.applySettings(); this.show('main'); };
    this.button(p, '◀  BACK', done, 'primary');
    this.onBack = done;
  }

  screen_controls() {
    const p = this.panel('CONTROLS');
    p.classList.add('wide');
    el('div', 'controls', p, CONTROLS_HTML);
    this.button(p, '◀  BACK', () => this.show('main'), 'primary');
    this.onBack = () => this.show('main');
  }

  screen_pause() {
    const p = this.panel('PAUSED');
    this.button(p, '▶  RESUME', () => this.app.resume(), 'primary');
    this.button(p, '↻  RESTART MATCH', () => this.app.restartMatch());
    this.button(p, '🎮  CONTROLS', () => this.show('pauseControls'));
    this.button(p, '⏏  QUIT TO MENU', () => this.app.quitToMenu());
    this.onBack = () => this.app.resume();
    this.onStart = () => this.app.resume();
  }

  screen_pauseControls() {
    const p = this.panel('CONTROLS');
    p.classList.add('wide');
    el('div', 'controls', p, CONTROLS_HTML);
    this.button(p, '◀  BACK', () => this.show('pause'), 'primary');
    this.onBack = () => this.show('pause');
  }

  screen_results(r) {
    const p = this.panel(r.winner === 0 ? 'BLUE TEAM WINS' : 'ORANGE TEAM WINS');
    p.classList.add('wide', 'results', r.winner === 0 ? 'win-blue' : 'win-orange');
    el('div', 'final-score', p, `<span class="b">${r.scores[0]}</span><span class="dash">–</span><span class="o">${r.scores[1]}</span>`);
    const rows = r.rows.map((x) => `<tr class="team${x.team}"><td class="nm">${x.name === r.mvp ? '<span class="mvp">MVP</span> ' : ''}${x.name}${x.human ? '' : ' <span class="cpu">CPU</span>'}</td><td>${x.score}</td><td>${x.goals}</td><td>${x.assists}</td><td>${x.saves}</td><td>${x.shots}</td><td>${x.demos}</td></tr>`).join('');
    el('table', 'stats', p, `<tr><th>Player</th><th>Score</th><th>Goals</th><th>Assists</th><th>Saves</th><th>Shots</th><th>Demos</th></tr>${rows}`);
    this.button(p, '↻  REMATCH', () => this.app.restartMatch(), 'primary');
    this.button(p, '⏏  MAIN MENU', () => this.app.quitToMenu());
    this.onBack = () => this.app.quitToMenu();
  }
}
