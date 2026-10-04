import * as THREE from 'three';
import { WEAPONS, HEALS, RARITY, PLAYER, BUILD } from './config.js';
import { POIS } from './world/island.js';
import { iconFor, iconUrl, itemName } from './items.js';
import { clamp, fmtTime, angleTo, wrapAngle } from './util.js';

const _v = new THREE.Vector3();
const PIECE_LABEL = { wall: 'Wall', floor: 'Floor', ramp: 'Ramp', roof: 'Roof' };
const PIECE_KEYS_KB = { wall: 'Q', floor: 'F', ramp: 'C', roof: 'V' };
const PIECE_KEYS_PAD = { wall: 'X', floor: 'B', ramp: 'Y', roof: 'A' };

function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}

function pieceIcon(type) {
  const s = {
    wall: '<rect x="4" y="5" width="24" height="22" rx="1"/>',
    floor: '<path d="M2 20 L16 12 L30 20 L16 28 Z"/>',
    ramp: '<path d="M3 27 L29 27 L29 6 Z"/>',
    roof: '<path d="M2 24 L16 6 L30 24 Z"/>',
  }[type];
  return `<svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">${s}</svg>`;
}

export class HUD {
  constructor(game) {
    this.game = game;
    const root = document.getElementById('hud');
    this.root = root;
    root.innerHTML = '';
    this.compass = el('canvas', 'compass', root);
    this.compass.width = 520;
    this.compass.height = 40;
    this.top = el('div', 'topinfo', root);
    this.topStorm = el('div', 'ti storm', this.top);
    this.topAlive = el('div', 'ti alive', this.top);
    this.topKills = el('div', 'ti kills', this.top);
    this.minimapWrap = el('div', 'minimap', root);
    this.minimap = el('canvas', '', this.minimapWrap);
    this.minimap.width = this.minimap.height = 210;
    this.killfeed = el('div', 'killfeed', root);
    this.bannerEl = el('div', 'banner', root);
    this.toastEl = el('div', 'toast', root);
    this.crosshair = el('div', 'crosshair', root, '<i class="l"></i><i class="r"></i><i class="t"></i><i class="b"></i><i class="dot"></i>');
    this.hitmark = el('div', 'hitmarker', root, '<i></i><i></i><i></i><i></i>');
    this.promptEl = el('div', 'prompt', root);
    this.progress = el('div', 'progress', root, '<div class="label"></div><div class="bar"><div class="fill"></div></div>');
    this.vitals = el('div', 'vitals', root, `
      <div class="vrow shield"><span class="ico">&#x26E8;</span><div class="vbar"><div class="vfill"></div></div><span class="num">0</span></div>
      <div class="vrow health"><span class="ico">&#x271A;</span><div class="vbar"><div class="vfill"></div></div><span class="num">100</span></div>`);
    this.right = el('div', 'rightstack', root);
    this.mats = el('div', 'mats', this.right);
    this.matEls = {};
    for (const m of ['wood', 'stone', 'metal']) this.matEls[m] = el('div', 'mat ' + m, this.mats, `<span class="mi"></span><span class="mc">0</span>`);
    this.ammoEl = el('div', 'ammo', this.right);
    this.hotbar = el('div', 'hotbar', this.right);
    this.slotEls = [];
    const pickUrl = iconUrl({ kind: 'heal', type: 'pickaxe' });
    const pick = el('div', 'slot pick', this.hotbar, `<div class="sicon">${pickUrl ? `<img src="${pickUrl}" alt="">` : '&#x26CF;'}</div><div class="skey">H</div>`);
    this.slotEls.push(pick);
    for (let i = 0; i < 5; i++) this.slotEls.push(el('div', 'slot', this.hotbar, `<div class="sicon"></div><div class="scount"></div><div class="skey">${i + 1}</div>`));
    this.buildbar = el('div', 'buildbar', root);
    this.pieceEls = {};
    for (const p of ['wall', 'floor', 'ramp', 'roof']) this.pieceEls[p] = el('div', 'piece', this.buildbar, `${pieceIcon(p)}<span class="pk"></span><span class="pl">${PIECE_LABEL[p]}</span>`);
    this.dmgLayer = el('div', 'dmglayer', root);
    this.dmgPool = [];
    this.stormOverlay = el('div', 'stormoverlay', root);
    this.dmgDir = el('div', 'dmgdir', root);
    this.scope = el('div', 'scope', root, '<div class="lens"></div><div class="h"></div><div class="v"></div>');
    this.busUi = el('div', 'busui', root);
    this.gatherEl = el('div', 'gather', root);
    this.pieceHp = el('div', 'piecehp', root, '<div class="fill"></div>');
    this.elimEl = el('div', 'elimmsg', root);
    this.fps = el('div', 'fps', root);
    this.spectate = el('div', 'spectate', root);
    this.bigmap = document.getElementById('bigmap');
    this.bigCanvas = this.bigmap.querySelector('canvas');
    this.mapImage = null;
    this.state = {};
    this.timers = { banner: 0, toast: 0, hit: 0, gather: 0, pieceHp: 0, elim: 0, storm: 0 };
    this.dmgArcs = [];
    this.frames = 0;
    this.fpsT = 0;
    this.showMap = false;
  }

  setMapImage(canvas) {
    this.mapImage = canvas;
  }

  show(on) {
    this.root.classList.toggle('hidden', !on);
    if (!on) this.toggleMap(false);
  }

  // ---------- transient messages ----------

  banner(text, color = '#fff') {
    this.bannerEl.textContent = text;
    this.bannerEl.style.color = color;
    this.bannerEl.classList.add('on');
    this.timers.banner = 3.2;
  }

  toast(text) {
    this.toastEl.textContent = text;
    this.toastEl.classList.add('on');
    this.timers.toast = 1.8;
  }

  elimination(text) {
    this.elimEl.innerHTML = text;
    this.elimEl.classList.add('on');
    this.timers.elim = 2.6;
  }

  feed(html) {
    const line = el('div', 'kf', this.killfeed, html);
    setTimeout(() => line.classList.add('fade'), 5500);
    setTimeout(() => line.remove(), 6500);
    while (this.killfeed.children.length > 6) this.killfeed.firstChild.remove();
  }

  hitMarker(head, kill) {
    this.hitmark.className = 'hitmarker on' + (head ? ' head' : '') + (kill ? ' kill' : '');
    this.timers.hit = 0.18;
  }

  damageNumber(pos, amount, head, shield) {
    let d = this.dmgPool.find((x) => !x.active);
    if (!d) {
      if (this.dmgPool.length > 40) return;
      d = { el: el('div', 'dmgnum', this.dmgLayer), active: false };
      this.dmgPool.push(d);
    }
    d.active = true;
    d.t = 0;
    d.pos = pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.4, (Math.random() - 0.5) * 0.6));
    d.el.textContent = amount;
    d.el.className = 'dmgnum' + (head ? ' head' : shield ? ' shield' : '');
  }

  damageFrom(pos) {
    const a = this.game.player;
    // Positive relative yaw means the attacker is to the left; CSS rotates clockwise.
    const rel = wrapAngle(angleTo(a.pos.x, a.pos.z, pos.x, pos.z) - a.yaw);
    const arc = el('div', 'arc', this.dmgDir);
    arc.style.transform = `rotate(${-rel}rad)`;
    setTimeout(() => arc.remove(), 900);
    this.game.audio.play('hurt', null);
  }

  flashStorm() {
    this.timers.storm = 0.5;
    this.stormOverlay.classList.add('hurt');
  }

  gather(res, n, crit) {
    if (n <= 0) {
      this.gatherEl.textContent = `${res} full`;
    } else this.gatherEl.textContent = `+${n} ${res}${crit ? '  WEAK SPOT!' : ''}`;
    this.gatherEl.className = 'gather on ' + res + (crit ? ' crit' : '');
    this.timers.gather = 0.9;
  }

  structureHit(piece) {
    this.pieceHp.classList.add('on');
    this.pieceHp.firstChild.style.width = `${clamp(piece.hp / piece.maxHp, 0, 1) * 100}%`;
    this.timers.pieceHp = 1;
  }

  toggleMap(force) {
    this.showMap = force ?? !this.showMap;
    this.bigmap.classList.toggle('hidden', !this.showMap);
  }

  // ---------- per frame ----------

  set(key, value, fn) {
    if (this.state[key] === value) return;
    this.state[key] = value;
    fn(value);
  }

  update(dt) {
    const g = this.game, a = g.player;
    if (!a) return;
    for (const k of Object.keys(this.timers)) this.timers[k] -= dt;
    if (this.timers.banner <= 0) this.bannerEl.classList.remove('on');
    if (this.timers.toast <= 0) this.toastEl.classList.remove('on');
    if (this.timers.hit <= 0) this.hitmark.classList.remove('on');
    if (this.timers.gather <= 0) this.gatherEl.classList.remove('on');
    if (this.timers.pieceHp <= 0) this.pieceHp.classList.remove('on');
    if (this.timers.elim <= 0) this.elimEl.classList.remove('on');
    if (this.timers.storm <= 0) this.stormOverlay.classList.remove('hurt');
    const pad = g.input.lastDevice === 'pad';
    // vitals
    this.set('shield', Math.ceil(a.shield), (v) => {
      this.vitals.querySelector('.shield .vfill').style.width = `${(v / PLAYER.maxShield) * 100}%`;
      this.vitals.querySelector('.shield .num').textContent = v;
    });
    this.set('health', Math.ceil(a.health), (v) => {
      this.vitals.querySelector('.health .vfill').style.width = `${(v / PLAYER.maxHealth) * 100}%`;
      this.vitals.querySelector('.health .num').textContent = v;
      this.vitals.querySelector('.health').classList.toggle('low', v <= 30);
    });
    // materials
    for (const m of ['wood', 'stone', 'metal']) {
      this.set('mat-' + m, a.mats[m] + (a.buildMode && a.buildMat === m ? 's' : ''), () => {
        this.matEls[m].querySelector('.mc').textContent = a.mats[m];
        this.matEls[m].classList.toggle('sel', a.buildMode && a.buildMat === m);
      });
    }
    // hotbar
    const sig = a.slots.map((s) => (s ? `${s.kind}${s.type}${s.rarity}${s.count ?? ''}` : '-')).join('|') + a.sel + (a.buildMode ? 'b' : '') + pad;
    this.set('hotbar', sig, () => {
      this.slotEls[0].classList.toggle('sel', a.sel === -1 && !a.buildMode);
      this.slotEls[0].querySelector('.skey').textContent = pad ? '' : 'H';
      for (let i = 0; i < 5; i++) {
        const s = a.slots[i];
        const e = this.slotEls[i + 1];
        e.classList.toggle('sel', a.sel === i && !a.buildMode);
        e.style.setProperty('--rar', s ? RARITY[s.rarity].color : 'transparent');
        e.classList.toggle('filled', !!s);
        const url = iconUrl(s), ic = e.querySelector('.sicon');
        if (url) ic.innerHTML = `<img src="${url}" alt="">`;
        else ic.textContent = s ? iconFor(s) : '';
        e.querySelector('.scount').textContent = s && s.kind === 'heal' ? s.count : '';
        e.querySelector('.skey').textContent = pad ? '' : i + 1;
        e.title = s ? itemName(s) : '';
      }
    });
    const held = a.held;
    let ammoText = '';
    if (held && held.kind === 'weapon') {
      const def = WEAPONS[held.type];
      ammoText = `<b>${held.ammo}</b><span>${a.ammo[def.ammo]}</span><em>${RARITY[held.rarity].name} ${def.name}</em>`;
    } else if (held && held.kind === 'heal') {
      ammoText = `<b>${held.count}</b><em>${HEALS[held.type].name}</em>`;
    } else if (!a.buildMode) ammoText = '<em>Harvesting Tool</em>';
    else ammoText = `<em>${a.buildMat[0].toUpperCase() + a.buildMat.slice(1)} &middot; ${BUILD.cost} per piece</em>`;
    this.set('ammo', ammoText, (v) => (this.ammoEl.innerHTML = v));
    // build bar
    this.set('build', `${a.buildMode}${a.buildPiece}${pad}`, () => {
      this.buildbar.classList.toggle('on', a.buildMode);
      for (const p of Object.keys(this.pieceEls)) {
        this.pieceEls[p].classList.toggle('sel', a.buildPiece === p);
        this.pieceEls[p].querySelector('.pk').textContent = pad ? PIECE_KEYS_PAD[p] : PIECE_KEYS_KB[p];
      }
    });
    // top info
    const st = g.storm.label();
    this.set('storm', st.text + st.time, () => (this.topStorm.innerHTML = `<span class="sic"></span>${st.time || '--'}<small>${st.text}</small>`));
    this.set('alive', g.aliveCount(), (v) => (this.topAlive.innerHTML = `<span class="pic"></span>${v}<small>Players left</small>`));
    this.set('kills', a.kills, (v) => (this.topKills.innerHTML = `<span class="kic"></span>${v}<small>Eliminations</small>`));
    // progress (heal / reload)
    let prog = null;
    if (a.heal) prog = { label: 'Using ' + HEALS[a.heal.item.type].name, f: a.heal.t / a.heal.total };
    else if (a.reloadT > 0) prog = { label: 'Reloading', f: 1 - a.reloadT / a.reloadTotal };
    this.progress.classList.toggle('on', !!prog);
    if (prog) {
      this.set('proglabel', prog.label, (v) => (this.progress.querySelector('.label').textContent = v));
      this.progress.querySelector('.fill').style.width = `${clamp(prog.f, 0, 1) * 100}%`;
    }
    // prompt
    const near = a.alive && (a.mode === 'ground' || a.mode === 'swim') ? g.findInteractable(a) : null;
    const key = pad ? '<kbd class="pad x">X</kbd>' : '<kbd>E</kbd>';
    let prompt = near ? `${key} ${near.label}` : '';
    if (a.mode === 'vehicle') prompt = `${key} Exit vehicle`;
    this.set('prompt', prompt, (v) => {
      this.promptEl.innerHTML = v;
      this.promptEl.classList.toggle('on', !!v);
    });
    // crosshair
    const scoped = g.controller.scoped;
    this.crosshair.classList.toggle('hidden', scoped || a.mode !== 'ground' || !a.alive);
    // in first person the gun's own sights take over as you aim
    this.crosshair.style.opacity = g.controller.fpActive ? String(clamp(1 - a.adsT * 1.6, 0, 1)) : '';
    if (!scoped) {
      const spread = a.buildMode || a.sel === -1 ? 0.3 : a.currentSpread();
      const fov = g.camera.fov * (Math.PI / 180);
      const px = (Math.tan(spread * (Math.PI / 180)) / Math.tan(fov / 2)) * (innerHeight / 2);
      this.crosshair.style.setProperty('--gap', `${clamp(px, 3, 120)}px`);
    }
    this.scope.classList.toggle('on', scoped);
    this.stormOverlay.classList.toggle('on', a.alive && a.mode !== 'bus' && !g.storm.isInside(a.pos.x, a.pos.z));
    // bus UI
    let busText = '';
    if (a.mode === 'bus') {
      const left = Math.max(0, (1 - g.bus.progress) * g.bus.length / 36);
      busText = g.bus.doorsOpen
        ? `<div class="big">${pad ? 'Press <kbd class="pad a">A</kbd>' : 'Press <kbd>SPACE</kbd>'} to jump</div><div>Auto-drop in ${fmtTime(left)}</div>`
        : '<div class="big">The doors open soon...</div>';
    } else if (a.mode === 'freefall') busText = `<div>${pad ? '<kbd class="pad a">A</kbd>' : '<kbd>SPACE</kbd>'} open glider &middot; altitude ${Math.round(a.pos.y - g.terrain.heightAt(a.pos.x, a.pos.z))} m</div>`;
    this.set('bus', busText, (v) => {
      this.busUi.innerHTML = v;
      this.busUi.classList.toggle('on', !!v);
    });
    this.updateDamageNumbers(dt);
    this.drawCompass();
    this.drawMinimap();
    if (this.showMap) this.drawBigMap();
    // fps
    this.frames++;
    this.fpsT += dt;
    if (this.fpsT > 0.5) {
      this.fps.textContent = g.settings.showFps ? `${Math.round(this.frames / this.fpsT)} FPS` : '';
      this.frames = 0;
      this.fpsT = 0;
    }
  }

  updateDamageNumbers(dt) {
    const cam = this.game.camera;
    for (const d of this.dmgPool) {
      if (!d.active) continue;
      d.t += dt;
      if (d.t > 0.9) {
        d.active = false;
        d.el.style.opacity = 0;
        continue;
      }
      _v.copy(d.pos);
      _v.y += d.t * 1.2;
      _v.project(cam);
      if (_v.z > 1) {
        d.el.style.opacity = 0;
        continue;
      }
      const x = (_v.x * 0.5 + 0.5) * innerWidth, y = (-_v.y * 0.5 + 0.5) * innerHeight;
      d.el.style.transform = `translate(${x}px, ${y}px) scale(${1 + Math.max(0, 0.15 - d.t) * 3})`;
      d.el.style.opacity = d.t < 0.6 ? 1 : 1 - (d.t - 0.6) / 0.3;
    }
  }

  drawCompass() {
    const c = this.compass.getContext('2d');
    const w = this.compass.width, h = this.compass.height;
    c.clearRect(0, 0, w, h);
    const a = this.game.player;
    const yaw = a.mode === 'bus' ? this.game.controller.busYaw : a.yaw;
    let heading = ((-yaw * 180) / Math.PI) % 360;
    if (heading < 0) heading += 360;
    const pxPerDeg = 3.2;
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.fillRect(0, 6, w, h - 12);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const names = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
    for (let d = Math.floor(heading - 90); d <= heading + 90; d++) {
      const dd = ((d % 360) + 360) % 360;
      if (dd % 5) continue;
      const x = w / 2 + (d - heading) * pxPerDeg;
      const fade = 1 - Math.abs(x - w / 2) / (w / 2);
      c.globalAlpha = clamp(fade * 1.4, 0, 1);
      if (names[dd] !== undefined) {
        c.fillStyle = dd === 0 ? '#ffd23f' : '#fff';
        c.font = 'bold 17px "Barlow Condensed", sans-serif';
        c.fillText(names[dd], x, h / 2);
      } else if (dd % 15 === 0) {
        c.fillStyle = '#fff';
        c.font = '12px "Barlow Condensed", sans-serif';
        c.fillText(String(dd), x, h / 2);
      } else {
        c.fillStyle = 'rgba(255,255,255,0.7)';
        c.fillRect(x - 0.5, h / 2 - 4, 1, 8);
      }
    }
    c.globalAlpha = 1;
    c.fillStyle = '#ffd23f';
    c.beginPath();
    c.moveTo(w / 2 - 6, 2);
    c.lineTo(w / 2 + 6, 2);
    c.lineTo(w / 2, 9);
    c.fill();
  }

  worldToMap(x, z, size, cx, cz, span) {
    return [size / 2 + ((x - cx) / span) * size, size / 2 + ((z - cz) / span) * size];
  }

  drawStorm(c, size, cx, cz, span) {
    const s = this.game.storm;
    const [sx, sy] = this.worldToMap(s.current.x, s.current.z, size, cx, cz, span);
    const sr = (s.current.r / span) * size;
    c.save();
    c.fillStyle = 'rgba(120, 40, 200, 0.42)';
    c.beginPath();
    c.rect(0, 0, size, size);
    c.arc(sx, sy, Math.max(0.5, sr), 0, Math.PI * 2, true);
    c.fill('evenodd');
    c.strokeStyle = '#c77dff';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(sx, sy, Math.max(0.5, sr), 0, Math.PI * 2);
    c.stroke();
    if (s.next && s.stage === 'wait' && !s.closed) {
      const [nx, ny] = this.worldToMap(s.next.x, s.next.z, size, cx, cz, span);
      c.strokeStyle = '#ffffff';
      c.setLineDash([6, 4]);
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(nx, ny, (s.next.r / span) * size, 0, Math.PI * 2);
      c.stroke();
      c.setLineDash([]);
    }
    c.restore();
  }

  drawMarkers(c, size, cx, cz, span, big) {
    const g = this.game, a = g.player;
    for (const d of g.loot.drops) {
      if (d.opened) continue;
      const [x, y] = this.worldToMap(d.pos.x, d.pos.z, size, cx, cz, span);
      c.fillStyle = '#4aa8ff';
      c.fillRect(x - 4, y - 4, 8, 8);
      c.strokeStyle = '#fff';
      c.strokeRect(x - 4, y - 4, 8, 8);
    }
    if (a.mode === 'bus' || g.bus.active) {
      const p0 = g.bus.pointAt(0), p1 = g.bus.pointAt(1);
      const [x0, y0] = this.worldToMap(p0.x, p0.z, size, cx, cz, span);
      const [x1, y1] = this.worldToMap(p1.x, p1.z, size, cx, cz, span);
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.setLineDash([5, 5]);
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();
      c.setLineDash([]);
      const [bx, by] = this.worldToMap(g.bus.pos.x, g.bus.pos.z, size, cx, cz, span);
      c.fillStyle = '#2f6dd0';
      c.beginPath();
      c.arc(bx, by, big ? 7 : 5, 0, Math.PI * 2);
      c.fill();
    }
    // player arrow
    const [px, py] = this.worldToMap(a.pos.x, a.pos.z, size, cx, cz, span);
    const yaw = a.mode === 'bus' ? g.controller.busYaw : a.yaw;
    c.save();
    c.translate(px, py);
    c.rotate(-yaw);
    c.fillStyle = '#ffd23f';
    c.strokeStyle = '#000';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, -8);
    c.lineTo(6, 6);
    c.lineTo(0, 3);
    c.lineTo(-6, 6);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  drawMinimap() {
    const c = this.minimap.getContext('2d');
    const size = this.minimap.width;
    const a = this.game.player;
    const span = a.mode === 'bus' || a.mode === 'freefall' ? 700 : 240;
    const cx = a.pos.x, cz = a.pos.z;
    c.fillStyle = '#2a5f9e';
    c.fillRect(0, 0, size, size);
    if (this.mapImage) {
      const T = this.game.terrain;
      const px = this.mapImage.width / T.size;
      const sx = (cx - span / 2 + T.half) * px, sy = (cz - span / 2 + T.half) * px;
      c.drawImage(this.mapImage, sx, sy, span * px, span * px, 0, 0, size, size);
    }
    this.drawStorm(c, size, cx, cz, span);
    this.drawMarkers(c, size, cx, cz, span, false);
  }

  drawBigMap() {
    const cv = this.bigCanvas;
    const size = Math.min(innerWidth, innerHeight) * 0.86;
    if (cv.width !== Math.round(size)) cv.width = cv.height = Math.round(size);
    const c = cv.getContext('2d');
    const T = this.game.terrain;
    const span = 1000, cx = 0, cz = 0;
    c.fillStyle = '#2a5f9e';
    c.fillRect(0, 0, cv.width, cv.height);
    if (this.mapImage) {
      const px = this.mapImage.width / T.size;
      c.drawImage(this.mapImage, (cx - span / 2 + T.half) * px, (cz - span / 2 + T.half) * px, span * px, span * px, 0, 0, cv.width, cv.height);
    }
    // grid
    c.strokeStyle = 'rgba(255,255,255,0.12)';
    c.lineWidth = 1;
    for (let i = 1; i < 10; i++) {
      const p = (i / 10) * cv.width;
      c.beginPath();
      c.moveTo(p, 0);
      c.lineTo(p, cv.height);
      c.moveTo(0, p);
      c.lineTo(cv.width, p);
      c.stroke();
    }
    c.fillStyle = 'rgba(255,255,255,0.6)';
    c.font = 'bold 13px "Barlow Condensed", sans-serif';
    for (let i = 0; i < 10; i++) {
      c.fillText(String.fromCharCode(65 + i), (i + 0.5) * (cv.width / 10) - 4, 14);
      c.fillText(String(i + 1), 4, (i + 0.5) * (cv.height / 10) + 4);
    }
    this.drawStorm(c, cv.width, cx, cz, span);
    c.textAlign = 'center';
    c.lineJoin = 'round';
    for (const p of POIS) {
      const [x, y] = this.worldToMap(p.x, p.z, cv.width, cx, cz, span);
      c.font = `bold ${Math.round(cv.width / 52)}px "Barlow Condensed", sans-serif`;
      c.lineWidth = 4;
      c.strokeStyle = 'rgba(0,0,0,0.75)';
      c.strokeText(p.name.toUpperCase(), x, y);
      c.fillStyle = p.loot === 'high' ? '#ffd23f' : '#ffffff';
      c.fillText(p.name.toUpperCase(), x, y);
    }
    c.textAlign = 'left';
    this.drawMarkers(c, cv.width, cx, cz, span, true);
  }
}
