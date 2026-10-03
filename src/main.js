import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { Hud } from './hud.js';
import { Menu } from './menu.js';
import { Match } from './game.js';
import { GameRenderer } from './render/renderer.js';
import { buildStadium } from './render/stadium.js';
import { BIG_PADS, SMALL_PADS } from './config.js';

const SETTINGS_KEY = 'rocketArena.settings.v1';

function defaultQuality() {
  const ua = navigator.userAgent || '';
  if (/Xbox/i.test(ua)) return 'medium';
  if (/Android|iPhone|iPad|Mobile/i.test(ua)) return 'low';
  return 'high';
}

function loadSettings() {
  const d = {
    quality: defaultQuality(), volume: 0.7, rumble: true, ballCam: true, fov: 100, replays: true, showFps: false,
    timeOfDay: 'night', split: 'horizontal', duration: 300, difficulty: 'pro',
    teamSize_solo: 1, teamSize_versus: 1, teamSize_coop: 2,
  };
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...d, ...s };
  } catch (e) {
    return d;
  }
}

class App {
  constructor() {
    this.settings = loadSettings();
    const params = new URLSearchParams(location.search);
    if (params.get('quality')) this.settings.quality = params.get('quality');
    this.input = new Input();
    this.audio = new AudioEngine();
    this.audio.volume = this.settings.volume;
    this.input.onActivity = () => this.audio.resume();
    const rumble = this.input.rumble.bind(this.input);
    this.input.rumble = (...a) => { if (this.settings.rumble) rumble(...a); };
    this.input.onPadConnect = (gp, connected) => this.toast(connected ? '🎮 Controller connected' : 'Controller disconnected');
    this.hud = new Hud(document.getElementById('hud'));
    this.hud.show(false);
    this.menu = new Menu(this, document.getElementById('menu'));
    this.container = document.getElementById('game');
    this.paused = false;
    this.match = null;
    this.buildGraphics();
    this.startAttract();
    this.last = performance.now();
    this.fpsT = 0; this.fpsN = 0;
    document.getElementById('loading')?.remove();
    requestAnimationFrame((t) => this.loop(t));
    window.__app = this; // handy for debugging / automated tests
  }

  buildGraphics() {
    if (this.gfx) this.gfx.dispose();
    this.gfx = new GameRenderer(this.container, this.settings.quality);
    this.builtQuality = this.settings.quality;
    this.buildStadium();
  }

  buildStadium() {
    if (this.stadium) this.stadium.dispose();
    const pads = BIG_PADS.map(([x, z]) => ({ x, z, big: true, active: true })).concat(SMALL_PADS.map(([x, z]) => ({ x, z, big: false, active: true })));
    this.stadium = buildStadium(this.gfx.renderer, this.gfx.scene, { quality: this.settings.quality, timeOfDay: this.settings.timeOfDay, pads });
    this.gfx.setExposure(this.stadium.exposure);
    this.builtTime = this.settings.timeOfDay;
  }

  saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch (e) { /* storage unavailable */ }
  }

  applySettings() {
    this.saveSettings();
    this.audio.setVolume(this.settings.volume);
    if (this.settings.quality !== this.builtQuality) {
      this.disposeMatch();
      this.buildGraphics();
      this.startAttract(false);
    }
  }

  ensureStadium() {
    if (this.settings.timeOfDay !== this.builtTime) this.buildStadium();
  }

  disposeMatch() {
    if (this.match) this.match.dispose();
    this.match = null;
  }

  startAttract(showMenu = true) {
    this.disposeMatch();
    this.paused = false;
    this.hud.show(false);
    this.match = new Match(this, { mode: 'attract', teamSize: 2, duration: 0, difficulty: 'pro', humans: [] });
    this.stadium.bindPads(this.match.world.pads);
    if (showMenu) this.menu.show('main');
  }

  startMatch(cfg) {
    this.audio.resume();
    this.lastCfg = cfg;
    this.disposeMatch();
    this.ensureStadium();
    this.menu.hide();
    this.paused = false;
    this.match = new Match(this, cfg);
    this.stadium.bindPads(this.match.world.pads);
  }

  restartMatch() {
    if (this.lastCfg) this.startMatch(this.lastCfg);
  }

  pauseMatch() {
    if (this.paused) return;
    this.paused = true;
    this.menu.show('pause');
  }

  resume() {
    this.paused = false;
    this.menu.hide();
    this.resumeFrame = this.frames;
    if (this.match) {
      this.match.acc = 0;
      // a held jump button must not trigger a jump the moment we resume
      for (const p of this.match.humans) p.car.prevJump = true;
    }
  }

  quitToMenu() {
    this.startAttract(true);
  }

  showResults(results) {
    this.menu.show('results', results);
  }

  toggleFullscreen() { toggleFullscreen(); }

  toast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2800);
  }

  loop(t) {
    requestAnimationFrame((tt) => this.loop(tt));
    const dt = Math.min(0.1, Math.max(0, (t - this.last) / 1000));
    this.last = t;
    this.input.update();
    const nav = this.input.menu();
    if (this.menu.visible) this.menu.update(nav);
    if (this.match) {
      if (this.paused) {
        for (const e of this.match.engines) this.audio.updateEngine(e, 0, 0, false, false, false);
        this.match.renderPaused();
      } else {
        this.match.update(dt);
      }
    }
    // fps (+ a one-time hint when the chosen graphics level is too heavy)
    this.fpsT += dt; this.fpsN++;
    if (this.fpsT > 0.5) {
      const fps = this.fpsN / this.fpsT;
      this.hud.setFps(this.settings.showFps ? `${Math.round(fps)} FPS` : '');
      const playing = this.match && !this.match.attract && !this.paused;
      this.slowT = playing && fps < 32 && this.settings.quality !== 'low' ? (this.slowT || 0) + this.fpsT : 0;
      if (this.slowT > 6 && !this.slowHinted) {
        this.slowHinted = true;
        this.toast('Running slowly? Lower Graphics in Settings for a smoother game');
      }
      this.fpsT = 0; this.fpsN = 0;
    }
    this.input.endFrame();
    this.frames = (this.frames || 0) + 1;
  }
}

// Edge on Xbox maps the controller's B button to "browser back"; keep the game on screen.
function trapBackButton() {
  try {
    history.pushState({ game: 1 }, '');
    window.addEventListener('popstate', () => history.pushState({ game: 1 }, ''));
  } catch (e) { /* history API unavailable (file:// in some browsers) */ }
}

export function toggleFullscreen() {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  } catch (e) { /* not supported */ }
}

function boot() {
  trapBackButton();
  window.addEventListener('keydown', (e) => { if (e.code === 'KeyF' && !e.repeat && window.__app && window.__app.menu.visible) toggleFullscreen(); });
  try {
    new App();
  } catch (e) {
    console.error(e);
    const l = document.getElementById('loading');
    if (l) l.innerHTML = `<div class="err">Could not start the game: ${e.message}<br>Your browser needs WebGL 2 support.</div>`;
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
