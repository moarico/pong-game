import { OUTFITS } from './character.js';
import { RARITY, TIPS, GAME_TITLE, WEAPONS, HEALS, AMMO_NAMES } from './config.js';
import { paintArt } from './art.js';
import { iconFor, iconUrl, itemName } from './items.js';
import { PAD } from './input.js';
import { fmtTime } from './util.js';

const LOGO = `
<div class="logo">
  <svg class="bolt" viewBox="0 0 64 96"><path d="M38 0 L6 54 H28 L20 96 L58 34 H36 Z"/></svg>
  <span class="word">${GAME_TITLE}</span>
</div>`;

function $(sel, root = document) {
  return root.querySelector(sel);
}

export class Menus {
  constructor(game) {
    this.game = game;
    this.screens = {};
    for (const el of document.querySelectorAll('.screen')) this.screens[el.id.replace('screen-', '')] = el;
    this.current = null;
    this.prev = null;
    this.overlay = null;
    this.invSel = -1;
    this.build();
  }

  build() {
    const g = this.game;
    // ---------- title ----------
    const title = this.screens.title;
    title.innerHTML = `<canvas class="art"></canvas>
      <div class="title-center">${LOGO}<div class="tagline">BATTLE ROYALE &middot; DROP. LOOT. BUILD. SURVIVE.</div>
      <button class="btn big yellow" data-nav id="btn-start">PRESS TO START</button></div>
      <div class="corner-note">Keyboard &amp; mouse or Xbox controller</div>`;
    $('#btn-start', title).onclick = () => {
      g.audio.unlock();
      g.audio.play('ui');
      this.show('lobby');
    };
    // ---------- lobby ----------
    const lobby = this.screens.lobby;
    lobby.innerHTML = `
      <div class="topbar">${LOGO}
        <nav><button class="tab sel" data-nav data-go="lobby">PLAY</button><button class="tab" data-nav data-go="locker">LOCKER</button>
        <button class="tab" data-nav data-go="settings">SETTINGS</button><button class="tab" data-nav data-go="controls">CONTROLS</button></nav></div>
      <div class="lobby-left">
        <div class="mode-card"><div class="mode-name">SOLO</div><div class="mode-sub"><span id="lobby-players"></span> players &middot; Stormdrop Isle</div>
        <div class="mode-sub">Storm: <span id="lobby-storm"></span> &middot; Bots: <span id="lobby-diff"></span></div></div>
        <div class="outfit-tag"><span id="lobby-outfit"></span><small id="lobby-rarity"></small></div>
      </div>
      <div class="lobby-right"><button class="btn huge yellow" data-nav id="btn-play">PLAY</button></div>`;
    $('#btn-play', lobby).onclick = () => {
      g.audio.play('ui');
      g.startMatch();
    };
    for (const b of lobby.querySelectorAll('[data-go]')) b.onclick = () => this.show(b.dataset.go);
    // ---------- locker ----------
    const locker = this.screens.locker;
    locker.innerHTML = `
      <div class="topbar">${LOGO}<nav><button class="tab" data-nav data-go="lobby">PLAY</button><button class="tab sel" data-nav data-go="locker">LOCKER</button>
        <button class="tab" data-nav data-go="settings">SETTINGS</button><button class="tab" data-nav data-go="controls">CONTROLS</button></nav></div>
      <div class="locker-info"><h2 id="lk-name"></h2><div id="lk-rarity" class="rarity-pill"></div><p id="lk-desc"></p>
        <div class="lk-parts">Head &middot; Torso &middot; Arms &middot; Legs &middot; Backpack &middot; Glider</div>
        <div class="row"><button class="btn yellow" data-nav id="lk-equip">EQUIP</button><button class="btn" data-nav id="lk-glider">PREVIEW GLIDER</button></div>
        <div class="hint">Drag the model to rotate it</div></div>
      <div class="locker-grid" id="lk-grid"></div>`;
    for (const b of locker.querySelectorAll('[data-go]')) b.onclick = () => this.show(b.dataset.go);
    const grid = $('#lk-grid', locker);
    this.lockerSel = g.settings.outfit;
    for (const o of OUTFITS) {
      const card = document.createElement('button');
      card.className = 'card';
      card.dataset.nav = '';
      card.dataset.id = o.id;
      card.style.setProperty('--rar', RARITY[o.rarity].color);
      card.innerHTML = `<div class="swatch" style="background:linear-gradient(160deg, ${o.primary} 0 45%, ${o.secondary} 45% 75%, ${o.accent} 75%)">
        <div class="mini-head" style="background:${o.skin}"></div><div class="mini-body" style="background:${o.primary};border-color:${o.secondary}"></div></div>
        <div class="cname">${o.name}</div><div class="crar">${RARITY[o.rarity].name}</div>`;
      card.onclick = () => {
        g.audio.play('ui');
        this.selectOutfit(o.id);
      };
      grid.appendChild(card);
    }
    $('#lk-equip', locker).onclick = () => {
      g.settings.outfit = this.lockerSel;
      g.saveSettings();
      g.audio.play('pickup');
      this.selectOutfit(this.lockerSel);
    };
    $('#lk-glider', locker).onclick = () => {
      g.lobby.showGlider = !g.lobby.showGlider;
      $('#lk-glider', locker).textContent = g.lobby.showGlider ? 'PREVIEW OUTFIT' : 'PREVIEW GLIDER';
    };
    // ---------- settings ----------
    this.buildSettings();
    // ---------- controls ----------
    const controls = this.screens.controls;
    controls.innerHTML = `
      <div class="topbar">${LOGO}<nav><button class="tab" data-nav data-go="lobby">PLAY</button><button class="tab" data-nav data-go="locker">LOCKER</button>
        <button class="tab" data-nav data-go="settings">SETTINGS</button><button class="tab sel" data-nav data-go="controls">CONTROLS</button></nav></div>
      <div class="panel controls-panel"><table>
        <tr><th>Action</th><th>Keyboard &amp; mouse</th><th>Xbox controller</th></tr>
        <tr><td>Move</td><td>W A S D</td><td>Left stick</td></tr>
        <tr><td>Sprint</td><td>Shift</td><td>Left stick click</td></tr>
        <tr><td>Look / aim</td><td>Mouse</td><td>Right stick</td></tr>
        <tr><td>Fire / use</td><td>Left mouse</td><td>RT</td></tr>
        <tr><td>Aim down sights</td><td>Right mouse</td><td>LT</td></tr>
        <tr><td>Next / previous weapon</td><td>Mouse wheel, 1-5, H (harvesting tool)</td><td>RB / LB, D-pad down (tool)</td></tr>
        <tr><td>Jump / open glider</td><td>Space</td><td>A</td></tr>
        <tr><td>Crouch</td><td>Ctrl</td><td>B</td></tr>
        <tr><td>Reload / interact</td><td>R / E</td><td>X</td></tr>
        <tr><td>Build mode</td><td>Q wall &middot; F floor &middot; C ramp &middot; V roof</td><td>Y</td></tr>
        <tr><td>In build mode</td><td>Left mouse place &middot; G or right mouse edit &middot; T material</td><td>RT place &middot; LT edit &middot; X/B/Y/A wall/floor/ramp/roof &middot; D-pad right material</td></tr>
        <tr><td>Inventory</td><td>I</td><td>D-pad up</td></tr>
        <tr><td>Emote</td><td>B</td><td>D-pad left</td></tr>
        <tr><td>First / third person</td><td>Z</td><td>Settings menu</td></tr>
        <tr><td>Switch shoulder (third person)</td><td>X</td><td>Right stick click</td></tr>
        <tr><td>Map</td><td>Tab or M</td><td>Select (View)</td></tr>
        <tr><td>Menu</td><td>Esc</td><td>Start (Menu)</td></tr>
      </table></div>`;
    for (const b of controls.querySelectorAll('[data-go]')) b.onclick = () => this.show(b.dataset.go);
    // ---------- loading ----------
    this.screens.loading.innerHTML = `<canvas class="art"></canvas><div class="loading-box">
      <div class="loading-title">STORMDROP ISLE</div><div class="loading-stage" id="ld-stage">Loading...</div>
      <div class="loadbar"><div class="fill" id="ld-fill"></div></div><div class="tip"><b>TIP</b> <span id="ld-tip"></span></div></div>`;
    // ---------- pause ----------
    this.screens.pause.innerHTML = `<div class="panel pause-panel"><h2 id="pause-title">PAUSED</h2>
      <button class="btn yellow" data-nav id="ps-resume">RESUME</button>
      <button class="btn" data-nav id="ps-settings">SETTINGS</button>
      <button class="btn" data-nav id="ps-controls">CONTROLS</button>
      <button class="btn red" data-nav id="ps-leave">LEAVE MATCH</button></div>`;
    $('#ps-resume').onclick = () => g.resume();
    $('#ps-settings').onclick = () => this.show('settings', true);
    $('#ps-controls').onclick = () => this.show('controls', true);
    $('#ps-leave').onclick = () => g.leaveMatch();
    // ---------- end ----------
    this.screens.end.innerHTML = `<div class="end-wrap"><div class="placement" id="end-place"></div><div class="end-title" id="end-title"></div>
      <div class="end-sub" id="end-sub"></div><div class="end-stats" id="end-stats"></div>
      <div class="row"><button class="btn big yellow" data-nav id="end-again">PLAY AGAIN</button><button class="btn big" data-nav id="end-lobby">LOBBY</button></div></div>`;
    $('#end-again').onclick = () => g.startMatch();
    $('#end-lobby').onclick = () => {
      g.toLobby();
    };
    // ---------- inventory overlay ----------
    this.inv = document.getElementById('inventory');
  }

  buildSettings() {
    const g = this.game;
    const S = g.settings;
    const el = this.screens.settings;
    el.innerHTML = `
      <div class="topbar">${LOGO}<nav class="nav-lobby"><button class="tab" data-nav data-go="lobby">PLAY</button><button class="tab" data-nav data-go="locker">LOCKER</button>
        <button class="tab sel" data-nav data-go="settings">SETTINGS</button><button class="tab" data-nav data-go="controls">CONTROLS</button></nav></div>
      <div class="panel settings-panel">
        <label>Mouse sensitivity <input type="range" min="0.2" max="3" step="0.05" data-k="mouseSens" data-nav><output></output></label>
        <label>Controller look speed <input type="range" min="0.3" max="3" step="0.05" data-k="padSens" data-nav><output></output></label>
        <label>Invert look Y <input type="checkbox" data-k="invertY" data-nav></label>
        <label>Camera <select data-k="view" data-nav><option value="first">First person</option><option value="third">Third person</option></select></label>
        <label>Field of view <input type="range" min="65" max="100" step="1" data-k="fov" data-nav><output></output></label>
        <label>Volume <input type="range" min="0" max="1" step="0.05" data-k="volume" data-nav><output></output></label>
        <label>Graphics quality <select data-k="quality" data-nav><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label>Players in a match <input type="range" min="20" max="30" step="1" data-k="players" data-nav><output></output></label>
        <label>Bot difficulty <select data-k="difficulty" data-nav><option value="0">Easy</option><option value="1">Normal</option><option value="2">Hard</option></select></label>
        <label>Storm speed <select data-k="stormSpeed" data-nav><option value="1">Normal (about 24 min)</option><option value="2">Fast (about 12 min)</option><option value="4">Very fast (about 6 min)</option></select></label>
        <label>Show FPS <input type="checkbox" data-k="showFps" data-nav></label>
        <label>Player name <input type="text" maxlength="16" data-k="name" data-nav></label>
        <button class="btn back-btn" data-nav id="st-back">BACK</button>
      </div>`;
    for (const b of el.querySelectorAll('[data-go]')) b.onclick = () => this.show(b.dataset.go);
    for (const input of el.querySelectorAll('[data-k]')) {
      const k = input.dataset.k;
      const out = input.parentElement.querySelector('output');
      const fmt = (v) => (k === 'volume' ? Math.round(v * 100) + '%' : k === 'fov' ? v + '°' : String(v));
      if (input.type === 'checkbox') input.checked = !!S[k];
      else input.value = S[k];
      if (out) out.textContent = fmt(input.value);
      const apply = () => {
        let v = input.type === 'checkbox' ? input.checked : input.value;
        if (input.type === 'range' || k === 'difficulty' || k === 'stormSpeed') v = parseFloat(v);
        S[k] = v;
        if (out) out.textContent = fmt(input.value);
        g.applySettings();
      };
      input.addEventListener('input', apply);
      input.addEventListener('change', apply);
    }
    $('#st-back', el).onclick = () => this.back();
  }

  selectOutfit(id) {
    const g = this.game;
    this.lockerSel = id;
    const o = OUTFITS.find((x) => x.id === id);
    g.lobby.setOutfit(id);
    const L = this.screens.locker;
    $('#lk-name', L).textContent = o.name;
    const pill = $('#lk-rarity', L);
    pill.textContent = RARITY[o.rarity].name.toUpperCase() + ' OUTFIT';
    pill.style.background = RARITY[o.rarity].color;
    $('#lk-desc', L).textContent = o.desc;
    const equipped = g.settings.outfit === id;
    $('#lk-equip', L).textContent = equipped ? 'EQUIPPED' : 'EQUIP';
    $('#lk-equip', L).classList.toggle('disabled', equipped);
    for (const c of L.querySelectorAll('.card')) {
      c.classList.toggle('sel', c.dataset.id === id);
      c.classList.toggle('equipped', c.dataset.id === g.settings.outfit);
    }
  }

  // ---------- screen switching ----------

  show(name, fromPause = false) {
    const g = this.game;
    if (this.current === name) return;
    this.prev = fromPause ? 'pause' : this.current;
    this.returnTo = fromPause ? 'pause' : name === 'settings' || name === 'controls' ? this.current : null;
    for (const [k, el] of Object.entries(this.screens)) el.classList.toggle('active', k === name);
    this.current = name;
    // Tab bar is hidden when settings/controls open from the pause menu.
    for (const nav of document.querySelectorAll('.screen nav')) nav.style.display = fromPause ? 'none' : '';
    if (name === 'title') paintArt($('canvas.art', this.screens.title), 'title', 7);
    if (name === 'lobby') {
      g.lobby.setOutfit(g.settings.outfit);
      g.lobby.setLayout('lobby');
      g.lobby.showGlider = false;
      this.refreshLobby();
    }
    if (name === 'locker') {
      g.lobby.setLayout('locker');
      this.selectOutfit(g.settings.outfit);
    }
    g.lobby.active = name === 'lobby' || name === 'locker' || ((name === 'settings' || name === 'controls') && !fromPause && g.state !== 'paused');
    this.focusFirst();
  }

  hideAll() {
    for (const el of Object.values(this.screens)) el.classList.remove('active');
    this.current = null;
  }

  back() {
    if (this.returnTo === 'pause') this.show('pause');
    else this.show(this.returnTo && this.returnTo !== 'settings' ? this.returnTo : 'lobby');
  }

  refreshLobby() {
    const g = this.game, S = g.settings;
    const o = OUTFITS.find((x) => x.id === S.outfit) || OUTFITS[0];
    $('#lobby-players').textContent = S.players;
    $('#lobby-storm').textContent = { 1: 'Normal', 2: 'Fast', 4: 'Very fast' }[S.stormSpeed] || 'Normal';
    $('#lobby-diff').textContent = ['Easy', 'Normal', 'Hard'][S.difficulty] || 'Normal';
    $('#lobby-outfit').textContent = o.name;
    const r = $('#lobby-rarity');
    r.textContent = RARITY[o.rarity].name;
    r.style.color = RARITY[o.rarity].color;
  }

  // ---------- loading ----------

  startLoading() {
    const variants = ['drop', 'storm', 'build', 'title'];
    const v = variants[Math.floor(Math.random() * variants.length)];
    this.show('loading');
    const cv = $('canvas.art', this.screens.loading);
    // key art: a frame of the island flyover if one was captured, else the painted art
    const shots = this.game.cinematic ? this.game.cinematic.shots : [];
    const L = this.screens.loading;
    if (shots.length) {
      L.style.backgroundImage = `url(${shots[Math.floor(Math.random() * shots.length)]})`;
      L.classList.add('keyart');
    } else {
      L.style.backgroundImage = '';
      L.classList.remove('keyart');
      paintArt(cv, v, Math.floor(Math.random() * 1000));
    }
    $('#ld-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
    this.setLoading(0, 'Preparing the island...');
  }

  setLoading(f, stage) {
    $('#ld-fill').style.width = `${Math.round(f * 100)}%`;
    if (stage) $('#ld-stage').textContent = stage;
  }

  // ---------- end screen ----------

  showEnd(info) {
    const g = this.game;
    this.show('end');
    const S = this.screens.end;
    S.classList.toggle('victory', info.victory);
    $('#end-place').textContent = `#${info.placement}`;
    $('#end-title').textContent = info.victory ? 'VICTORY!' : 'ELIMINATED';
    $('#end-sub').innerHTML = info.victory ? 'Last one standing on Stormdrop Isle' : info.by ? `Eliminated by <b>${info.by}</b>${info.cause ? ' with ' + info.cause : ''}` : info.cause || '';
    $('#end-stats').innerHTML = `<div><b>${info.kills}</b><span>Eliminations</span></div><div><b>${Math.round(info.damage)}</b><span>Damage dealt</span></div>
      <div><b>${fmtTime(info.time)}</b><span>Time survived</span></div><div><b>${info.total}</b><span>Players</span></div>`;
    if (info.victory) this.confetti();
    g.audio.play(info.victory ? 'victory' : 'defeat');
  }

  confetti() {
    const host = this.screens.end;
    for (const c of host.querySelectorAll('.confetti')) c.remove();
    const colors = ['#ffd23f', '#3c9cff', '#b25cff', '#4fcf5a', '#ff5a5a'];
    for (let i = 0; i < 80; i++) {
      const d = document.createElement('i');
      d.className = 'confetti';
      d.style.left = Math.random() * 100 + '%';
      d.style.background = colors[i % colors.length];
      d.style.animationDelay = Math.random() * 2 + 's';
      d.style.animationDuration = 2.5 + Math.random() * 2 + 's';
      host.appendChild(d);
    }
  }

  // ---------- inventory ----------

  toggleInventory(force) {
    const g = this.game;
    const open = force ?? this.inv.classList.contains('hidden');
    if (open && g.state !== 'playing') return;
    this.inv.classList.toggle('hidden', !open);
    this.invOpen = open;
    if (open) {
      this.invSel = g.player.sel;
      this.renderInventory();
      g.input.exitLock();
    } else if (g.state === 'playing') {
      g.input.requestLock();
    }
  }

  renderInventory() {
    const g = this.game, a = g.player;
    const slots = a.slots.map((s, i) => {
      const r = s ? RARITY[s.rarity].color : 'transparent';
      let detail = '';
      if (s && s.kind === 'weapon') {
        const d = WEAPONS[s.type];
        detail = `${Math.round(d.damage * (1 + 0.05 * s.rarity))} dmg &middot; ${d.rate}/s &middot; ${s.ammo}/${d.mag}`;
      } else if (s && s.kind === 'heal') {
        const d = HEALS[s.type];
        detail = d.hp ? `+${d.hp} HP (max ${d.cap}) &middot; ${d.time}s` : `+${d.shield} shield (max ${d.cap}) &middot; ${d.time}s`;
      }
      return `<button class="islot ${i === this.invSel ? 'sel' : ''}" data-nav data-i="${i}" style="--rar:${r}">
        <div class="sicon">${iconUrl(s) ? `<img src="${iconUrl(s)}" alt="">` : s ? iconFor(s) : ''}</div><div class="iname">${s ? itemName(s) : 'Empty'}</div><div class="idet">${detail}</div></button>`;
    }).join('');
    const ammo = Object.entries(a.ammo).map(([k, v]) => `<div><b>${v}</b><span>${AMMO_NAMES[k]}</span></div>`).join('');
    const mats = Object.entries(a.mats).map(([k, v]) => `<div class="m ${k}"><b>${v}</b><span>${k}</span></div>`).join('');
    this.inv.innerHTML = `<div class="panel inv-panel"><h2>INVENTORY</h2><div class="islots">${slots}</div>
      <div class="inv-help">Click a slot to select it, click another to swap. ${g.input.lastDevice === 'pad' ? 'A select/swap &middot; Y drop &middot; B close' : 'Drop removes the selected item.'}</div>
      <div class="row"><button class="btn red" data-nav id="inv-drop">DROP</button><button class="btn" data-nav id="inv-close">CLOSE</button></div>
      <h3>Ammo</h3><div class="inv-grid">${ammo}</div><h3>Materials</h3><div class="inv-grid">${mats}</div></div>`;
    for (const b of this.inv.querySelectorAll('.islot')) {
      b.onclick = () => {
        const i = +b.dataset.i;
        if (this.invSel >= 0 && this.invSel !== i) {
          const tmp = a.slots[i];
          a.slots[i] = a.slots[this.invSel];
          a.slots[this.invSel] = tmp;
          a.cancelReload();
          a.cancelHeal();
          this.invSel = i;
          a.sel = a.slots[a.sel] || a.sel === -1 ? a.sel : -1;
        } else this.invSel = i;
        g.audio.play('ui');
        this.renderInventory();
      };
    }
    $('#inv-drop', this.inv).onclick = () => this.dropSelected();
    $('#inv-close', this.inv).onclick = () => this.toggleInventory(false);
    this.focusFirst(this.inv);
  }

  dropSelected() {
    const g = this.game, a = g.player;
    const i = this.invSel;
    if (i < 0 || !a.slots[i]) return;
    const item = a.slots[i];
    a.slots[i] = null;
    if (a.sel === i) a.selectSlot(-1);
    g.loot.toss(item, a.pos, 0, 1);
    g.audio.play('uiBack');
    this.renderInventory();
  }

  // ---------- gamepad navigation ----------

  activeRoot() {
    if (this.invOpen) return this.inv;
    return this.current ? this.screens[this.current] : null;
  }

  focusFirst(root = this.activeRoot()) {
    if (!root || this.game.input.lastDevice !== 'pad') return;
    const first = root.querySelector('[data-nav]:not(.disabled)');
    if (first) first.focus();
  }

  navigate(dx, dy) {
    const root = this.activeRoot();
    if (!root) return;
    const items = [...root.querySelectorAll('[data-nav]')].filter((e) => e.offsetParent !== null);
    if (!items.length) return;
    const cur = document.activeElement && items.includes(document.activeElement) ? document.activeElement : null;
    if (!cur) {
      items[0].focus();
      return;
    }
    if (cur.type === 'range' && dx !== 0) {
      const step = parseFloat(cur.step) || 1;
      cur.value = parseFloat(cur.value) + dx * step;
      cur.dispatchEvent(new Event('input'));
      return;
    }
    const r = cur.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bd = Infinity;
    for (const e of items) {
      if (e === cur) continue;
      const q = e.getBoundingClientRect();
      const ex = q.left + q.width / 2, ey = q.top + q.height / 2;
      const vx = ex - cx, vy = ey - cy;
      const along = vx * dx + vy * dy;
      if (along <= 4) continue;
      const across = Math.abs(vx * dy - vy * dx);
      const d = along + across * 2.5;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    if (best) {
      best.focus();
      this.game.audio.play('ui');
    }
  }

  // Polled every frame while a menu is visible.
  updatePad() {
    const inp = this.game.input;
    if (!inp.pad) return;
    this.navCd = (this.navCd || 0) - 1 / 60;
    let dx = 0, dy = 0;
    if (inp.padPressed(PAD.LEFT)) dx = -1;
    if (inp.padPressed(PAD.RIGHT)) dx = 1;
    if (inp.padPressed(PAD.UP)) dy = -1;
    if (inp.padPressed(PAD.DOWN)) dy = 1;
    if (!dx && !dy && this.navCd <= 0) {
      if (Math.abs(inp.axes[0]) > 0.6) dx = Math.sign(inp.axes[0]);
      else if (Math.abs(inp.axes[1]) > 0.6) dy = Math.sign(inp.axes[1]);
      if (dx || dy) this.navCd = 0.22;
    }
    if (dx || dy) this.navigate(dx, dy);
    const active = document.activeElement;
    if (inp.padPressed(PAD.A)) {
      if (active && active.matches('[data-nav]')) {
        if (active.type === 'checkbox') {
          active.checked = !active.checked;
          active.dispatchEvent(new Event('change'));
        } else if (active.tagName === 'SELECT') {
          active.selectedIndex = (active.selectedIndex + 1) % active.options.length;
          active.dispatchEvent(new Event('change'));
        } else active.click();
      } else this.focusFirst();
    }
    if (this.invOpen && inp.padPressed(PAD.Y)) this.dropSelected();
    if (inp.padPressed(PAD.B)) {
      if (this.invOpen) this.toggleInventory(false);
      else if (this.current === 'pause') this.game.resume();
      else if (this.current === 'settings' || this.current === 'controls') this.back();
      else if (this.current === 'locker') this.show('lobby');
    }
    if (inp.padPressed(PAD.START) && this.current === 'pause') this.game.resume();
  }
}
