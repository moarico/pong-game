import { firstPad } from './input.js';

// ---------------------------------------------------------------------------
// Title and pause menu, over a live shot of the samurai against the sun.
// Mouse, touch and keyboard work as usual; a controller moves the focus with
// the d-pad or left stick, A selects, B goes back, Menu resumes.
// ---------------------------------------------------------------------------

export class Menu {
  constructor({ onPlay, onResume, onQuit, onSound, onStage }) {
    this.el = document.getElementById('menu');
    this.main = document.getElementById('menu-main');
    this.controls = document.getElementById('menu-controls');
    this.stagesEl = document.getElementById('menu-stages');
    this.cards = [...this.stagesEl.querySelectorAll('.stage-card')];
    this.sback = document.getElementById('m-sback');
    this.btn = {
      play: document.getElementById('m-play'),
      controls: document.getElementById('m-controls'),
      sound: document.getElementById('m-sound'),
      quit: document.getElementById('m-quit'),
      back: document.getElementById('m-back'),
    };
    this.tabs = ['pad', 'keys', 'touch'].map((k) => ({ key: k, tab: document.getElementById(`t-${k}`), panel: document.getElementById(`p-${k}`) }));
    this.chip = document.getElementById('pad-chip');
    this.cb = { onPlay, onResume, onQuit, onSound, onStage };
    this.mode = 'title';
    this.screen = 'main';
    this.isOpen = false;
    this.index = 0;
    this.prev = {};
    this.repeat = 0;
    this.lastDir = 0;

    this.btn.play.addEventListener('click', () => this.activatePlay());
    this.btn.controls.addEventListener('click', () => this.showScreen('controls'));
    this.btn.back.addEventListener('click', () => this.showScreen('main'));
    this.btn.sound.addEventListener('click', () => this.setSound(this.cb.onSound?.()));
    this.btn.quit.addEventListener('click', () => this.cb.onQuit?.());
    this.tabs.forEach((t, i) => t.tab.addEventListener('click', () => this.selectTab(i)));
    for (const c of this.cards) c.addEventListener('click', () => this.cb.onStage?.(c.dataset.stage));
    this.sback.addEventListener('click', () => this.showScreen('main'));
    for (const b of this.el.querySelectorAll('.mi, .tab, .stage-card')) {
      b.addEventListener('pointerenter', () => this.focusEl(b));
    }
    addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (this.screen === 'stages' && e.code.startsWith('Arrow')) this.moveGrid(e.code);
      else if (e.code === 'ArrowDown' || e.code === 'ArrowRight' && this.onTab()) this.move(e.code === 'ArrowDown' ? 1 : 1, e.code);
      else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft' && this.onTab()) this.move(-1, e.code);
      else if (e.code === 'Escape' || e.code === 'Backspace') this.back();
      else if (e.code === 'KeyP' && this.mode === 'pause') this.cb.onResume?.();
      else return;
      e.preventDefault();
    });
  }

  items() {
    if (this.screen === 'controls') return [...this.tabs.map((t) => t.tab), this.btn.back];
    if (this.screen === 'stages') return [...this.cards, this.sback];
    return [this.btn.play, this.btn.controls, this.btn.sound, this.btn.quit].filter((b) => !b.hidden);
  }

  onTab() {
    return this.screen === 'controls' && this.tabs.some((t) => t.tab === this.items()[this.index]);
  }

  open(mode) {
    this.mode = mode;
    this.isOpen = true;
    this.el.hidden = false;
    this.el.classList.remove('fading');
    this.el.classList.toggle('paused', mode === 'pause');
    this.btn.play.textContent = mode === 'pause' ? 'Resume' : 'Play';
    this.btn.quit.hidden = mode !== 'pause';
    document.body.classList.add('menu-open');
    this.showScreen('main');
    this.syncPad();
  }

  close() {
    this.isOpen = false;
    document.body.classList.remove('menu-open');
    this.el.classList.add('fading');
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      if (!this.isOpen) this.el.hidden = true;
    }, 900);
    if (document.activeElement && this.el.contains(document.activeElement)) document.activeElement.blur();
  }

  showScreen(name) {
    this.screen = name;
    this.main.hidden = name !== 'main';
    this.controls.hidden = name !== 'controls';
    this.stagesEl.hidden = name !== 'stages';
    this.el.classList.toggle('sub', name === 'controls');
    this.el.classList.toggle('stages', name === 'stages');
    if (name === 'stages') this.onStagesShown?.();
    if (name === 'controls') this.selectTab(this.tabs.findIndex((t) => t.tab.getAttribute('aria-selected') === 'true'), false);
    this.index = name === 'controls' ? this.items().length - 1 : name === 'stages' ? Math.max(0, this.cards.indexOf(this.lastCard)) : 0;
    this.focusIndex(this.index);
  }

  selectTab(i, focus = true) {
    this.tabs.forEach((t, k) => {
      t.tab.setAttribute('aria-selected', String(k === i));
      t.panel.hidden = k !== i;
    });
    if (focus) this.focusIndex(i);
  }

  setSound(on) {
    this.btn.sound.textContent = on ? 'Sound: on' : 'Sound: off';
  }

  setPad(connected) {
    this.chip.hidden = !connected;
  }

  activatePlay() {
    if (this.mode === 'pause') this.cb.onResume?.();
    else this.showScreen('stages');
  }

  // Mark the halls whose boss has fallen.
  setDone(id, on) {
    const c = this.cards.find((k) => k.dataset.stage === id);
    if (c) c.classList.toggle('done', on);
  }

  // Grid moves on the stage select: the hilltop across the top, the halls two by two, Back below.
  moveGrid(code) {
    const rows = [[0], [1, 2], [3, 4], [5]];
    const i = this.index;
    let r = rows.findIndex((row) => row.includes(i));
    let c = Math.max(0, rows[r].indexOf(i));
    if (code === 'ArrowLeft' || code === 'ArrowRight') {
      const row = rows[r];
      c = (c + (code === 'ArrowLeft' ? -1 : 1) + row.length) % row.length;
    } else {
      r = (r + (code === 'ArrowUp' ? -1 : 1) + rows.length) % rows.length;
      c = Math.min(c, rows[r].length - 1);
    }
    this.focusIndex(rows[r][c]);
  }

  back() {
    if (this.screen === 'controls' || this.screen === 'stages') this.showScreen('main');
    else if (this.mode === 'pause') this.cb.onResume?.();
  }

  focusEl(el) {
    const i = this.items().indexOf(el);
    if (i >= 0) this.focusIndex(i);
  }

  focusIndex(i) {
    const list = this.items();
    if (!list.length) return;
    this.index = (i + list.length) % list.length;
    for (const b of this.el.querySelectorAll('.focus')) b.classList.remove('focus');
    const el = list[this.index];
    if (this.cards.includes(el)) this.lastCard = el;
    el.classList.add('focus');
    try {
      el.focus({ preventScroll: true });
    } catch {
      // Focus is a nicety.
    }
  }

  move(d, code) {
    const list = this.items();
    const cur = list[this.index];
    // Left and right move along the tab row; up and down leave it.
    if (this.onTab() && (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'padH')) {
      const tabs = this.tabs.map((t) => t.tab);
      const i = (tabs.indexOf(cur) + d + tabs.length) % tabs.length;
      this.selectTab(i);
      return;
    }
    if (this.screen === 'controls') {
      // Up/down toggles between the tab row and Back.
      const onTabs = this.onTab();
      if (onTabs) this.focusIndex(list.length - 1);
      else this.focusIndex(this.tabs.findIndex((t) => t.tab.getAttribute('aria-selected') === 'true'));
      return;
    }
    this.focusIndex(this.index + d);
  }

  syncPad() {
    const p = firstPad();
    this.prev = {};
    if (!p) return;
    for (let i = 0; i < p.buttons.length; i++) this.prev[i] = !!p.buttons[i]?.pressed;
    this.lastDir = 0;
  }

  // Controller navigation, once per frame while open (real seconds).
  update(dt) {
    if (!this.isOpen) return;
    const p = firstPad();
    if (!p) return;
    const btn = (i) => !!p.buttons[i]?.pressed;
    const edge = (i) => {
      const on = btn(i);
      const hit = on && !this.prev[i];
      this.prev[i] = on;
      return hit;
    };
    // Direction from the d-pad or the left stick, with key-repeat.
    const ay = p.axes[1] || 0;
    const ax = p.axes[0] || 0;
    let dir = 0;
    let horiz = false;
    if (btn(12) || ay < -0.6) dir = -1;
    else if (btn(13) || ay > 0.6) dir = 1;
    else if (btn(14) || ax < -0.6) {
      dir = -1;
      horiz = true;
    } else if (btn(15) || ax > 0.6) {
      dir = 1;
      horiz = true;
    }
    const code = dir ? (horiz ? 'padH' : 'padV') : 0;
    const go = () => {
      if (this.screen === 'stages') this.moveGrid(horiz ? (dir < 0 ? 'ArrowLeft' : 'ArrowRight') : dir < 0 ? 'ArrowUp' : 'ArrowDown');
      else this.move(dir, code);
    };
    if (code !== this.lastDir) {
      this.repeat = 0.38;
      if (dir) go();
    } else if (dir) {
      this.repeat -= dt;
      if (this.repeat <= 0) {
        this.repeat = 0.15;
        go();
      }
    }
    this.lastDir = code;
    for (const i of [12, 13, 14, 15]) this.prev[i] = btn(i);
    if (edge(0)) this.items()[this.index]?.click();
    if (edge(1)) this.back();
    if (edge(9) || edge(8)) {
      if (this.mode === 'pause') this.cb.onResume?.();
      else if (this.screen !== 'stages') this.showScreen('stages');
    }
  }
}
