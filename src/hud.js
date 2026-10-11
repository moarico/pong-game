import * as THREE from 'three';
import { S, TEAM_COLORS, ARENA } from './config.js';

const SEGMENTS = 30;
const _v = new THREE.Vector3();

function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}

function boostGaugeSVG() {
  const cx = 100, cy = 100, r = 84;
  const start = 135, sweep = 270;
  const segA = sweep / SEGMENTS;
  let segs = '';
  for (let i = 0; i < SEGMENTS; i++) {
    const a0 = ((start + i * segA + 0.8) * Math.PI) / 180;
    const a1 = ((start + (i + 1) * segA - 0.8) * Math.PI) / 180;
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    segs += `<path class="seg" d="M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}"/>`;
  }
  return `<svg viewBox="0 0 200 200" class="boost-svg">
    <defs>
      <radialGradient id="bg-grad" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#0d2a5c" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#040a1c" stop-opacity="0.92"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="72" fill="url(#bg-grad)" stroke="#2c74ff" stroke-width="2.5" stroke-opacity="0.8"/>
    <circle cx="100" cy="100" r="64" fill="none" stroke="#5fb4ff" stroke-width="1" stroke-opacity="0.25"/>
    <g class="segs">${segs}</g>
    <text x="100" y="114" text-anchor="middle" class="boost-num">33</text>
    <text x="100" y="144" text-anchor="middle" class="boost-label">BOOST</text>
  </svg>`;
}

export class Hud {
  constructor(root) {
    this.root = root;
    root.innerHTML = '';
    const sb = el('div', 'scoreboard', root);
    this.sbBlue = el('div', 'sb-team sb-blue', sb, '<span>0</span>');
    const clock = el('div', 'sb-clock', sb);
    this.sbTime = el('div', 'sb-time', clock, '5:00');
    this.sbOT = el('div', 'sb-ot', clock, '');
    this.sbOrange = el('div', 'sb-team sb-orange', sb, '<span>0</span>');
    this.viewsEl = el('div', 'hud-views', root);
    this.banner = el('div', 'banner', root);
    this.bannerMain = el('div', 'banner-main', this.banner);
    this.bannerSub = el('div', 'banner-sub', this.banner);
    this.feed = el('div', 'feed', root);
    this.fps = el('div', 'fps', root);
    this.views = [];
    this.bannerTimer = 0;
    this.lastScores = [-1, -1];
    this.lastTime = '';
  }

  show(v) { this.root.classList.toggle('hidden', !v); }

  setup(views) {
    this.viewsEl.innerHTML = '';
    this.views = views.map((v) => {
      const box = el('div', 'hud-view', this.viewsEl);
      box.style.left = v.rect[0] * 100 + '%';
      box.style.top = v.rect[1] * 100 + '%';
      box.style.width = v.rect[2] * 100 + '%';
      box.style.height = v.rect[3] * 100 + '%';
      if (views.length > 1) box.classList.add('split');
      const gauge = el('div', 'boost-gauge', box, boostGaugeSVG());
      const label = views.length > 1 ? el('div', 'player-tag', box, v.label) : null;
      if (label) label.style.color = TEAM_COLORS[v.team].css;
      const item = el('div', 'item-slot hidden', box);
      item.innerHTML = '<div class="item-icon"></div><div class="item-text"><div class="item-name"></div><div class="item-key"></div></div><div class="item-bar"><div></div></div>';
      const status = el('div', 'view-status', box);
      const center = el('div', 'view-center', box);
      const plates = el('div', 'plates', box);
      // minimap with the player's coordinates, and the camera mode (reference photo)
      const mapBox = el('div', 'minimap', box);
      const map = el('canvas', '', mapBox);
      const coords = el('div', 'coords', mapBox);
      const cam = el('div', 'cam-mode', box);
      const dev = v.player && v.player.device;
      const key = !dev || dev.type === 'any' ? 'Y / R' : dev.type === 'pad' ? 'Y' : dev.layout === 'p2' ? 'I' : 'R';
      cam.innerHTML = `<div class="cam-name"><span class="cam-dot"></span><b>BALL CAM</b></div><div class="cam-hint">PRESS ${key} TO TOGGLE</div>`;
      return {
        box, gauge, status, center, plates, plateMap: new Map(), map, mapCtx: map.getContext('2d'), coords, cam, camName: cam.querySelector('b'), mapT: 0, ballCam: null,
        item, itemIcon: item.querySelector('.item-icon'), itemName: item.querySelector('.item-name'),
        itemKey: item.querySelector('.item-key'), itemBar: item.querySelector('.item-bar div'), itemSig: '',
        segs: Array.from(gauge.querySelectorAll('.seg')),
        num: gauge.querySelector('.boost-num'),
        lastBoost: -1, statusTimer: 0, centerTimer: 0,
      };
    });
  }

  setScore(s0, s1) {
    if (s0 !== this.lastScores[0]) { this.sbBlue.firstChild.textContent = s0; this.pulse(this.sbBlue); }
    if (s1 !== this.lastScores[1]) { this.sbOrange.firstChild.textContent = s1; this.pulse(this.sbOrange); }
    this.lastScores = [s0, s1];
  }

  pulse(e) {
    if (this.lastScores[0] < 0) return;
    e.classList.remove('pulse');
    void e.offsetWidth;
    e.classList.add('pulse');
  }

  setClock(seconds, overtime, infinite) {
    let txt;
    if (infinite) txt = '∞';
    else {
      const s = Math.max(0, overtime ? Math.floor(seconds) : Math.ceil(seconds));
      txt = `${overtime ? '+' : ''}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
    if (txt !== this.lastTime) { this.sbTime.textContent = txt; this.lastTime = txt; }
    this.sbOT.textContent = overtime ? 'OVERTIME' : '';
  }

  setBoost(i, boost) {
    const v = this.views[i];
    if (!v) return;
    const b = Math.round(boost);
    if (b === v.lastBoost) return;
    v.lastBoost = b;
    v.num.textContent = b;
    const lit = Math.ceil((boost / 100) * SEGMENTS - 0.001);
    v.segs.forEach((s, k) => s.classList.toggle('on', k < lit));
    v.gauge.classList.toggle('empty', b === 0);
    v.gauge.classList.toggle('full', b === 100);
  }

  // Rumble power-up slot: st = {item, active, frac, next}; info = ITEMS table
  setItem(i, st, info, keyHint) {
    const v = this.views[i];
    if (!v) return;
    if (!st) { v.item.classList.add('hidden'); return; }
    v.item.classList.remove('hidden');
    const sig = `${st.item}|${st.active}|${keyHint}|${st.item ? '' : Math.ceil(st.next || 0)}`;
    if (sig !== v.itemSig) {
      v.itemSig = sig;
      const it = st.item ? info[st.item] : null;
      v.item.classList.toggle('ready', !!st.item && !st.active);
      v.item.classList.toggle('active', !!st.active);
      v.item.classList.toggle('empty', !st.item);
      v.itemIcon.textContent = it ? it.icon : '⏳';
      v.itemName.textContent = it ? it.name : 'Power-up';
      v.itemKey.innerHTML = !st.item ? `next in ${Math.ceil(st.next || 0)}s` : st.active ? 'active' : `press <b>${keyHint}</b>`;
    }
    v.itemBar.style.transform = `scaleX(${st.active ? st.frac : st.item ? 1 : 0})`;
  }

  viewStatus(i, text, time = 1.6) {
    const v = this.views[i];
    if (!v) return;
    v.status.textContent = text;
    v.status.classList.add('visible');
    v.statusTimer = time;
  }

  viewCenter(i, text, time = 2) {
    const v = this.views[i];
    if (!v) return;
    v.center.textContent = text;
    v.center.classList.add('visible');
    v.centerTimer = time;
  }

  showBanner(main, sub = '', cls = '', time = 2) {
    this.bannerMain.textContent = main;
    this.bannerSub.textContent = sub;
    this.banner.className = 'banner visible ' + cls;
    this.bannerTimer = time;
  }

  hideBanner() {
    this.banner.className = 'banner';
    this.bannerTimer = 0;
  }

  addFeed(html, team = -1) {
    const item = el('div', 'feed-item' + (team >= 0 ? ' team' + team : ''), this.feed, html);
    setTimeout(() => item.classList.add('fade'), 3500);
    setTimeout(() => item.remove(), 4200);
    while (this.feed.children.length > 5) this.feed.firstChild.remove();
  }

  // cars: [{car, pos(uu), name}] ; camera of the view
  updatePlates(i, camera, cars, ownCar) {
    const v = this.views[i];
    if (!v) return;
    const w = v.box.clientWidth, h = v.box.clientHeight;
    const seen = new Set();
    for (const c of cars) {
      if (c.car === ownCar || c.car.demolished) continue;
      _v.set(c.pos.x * S, (c.pos.y + 95) * S, c.pos.z * S).project(camera);
      if (_v.z > 1 || _v.z < -1 || Math.abs(_v.x) > 1.1 || Math.abs(_v.y) > 1.1) continue;
      let p = v.plateMap.get(c.car.id);
      if (!p) {
        p = el('div', 'plate team' + c.car.team, v.plates, c.name);
        v.plateMap.set(c.car.id, p);
      }
      const sx = ((_v.x + 1) / 2) * w, sy = ((1 - _v.y) / 2) * h;
      const dist = camera.position.distanceTo(_v.set(c.pos.x * S, c.pos.y * S, c.pos.z * S));
      p.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(0.55, Math.min(1, 12 / dist)).toFixed(3)})`;
      p.style.display = '';
      seen.add(c.car.id);
    }
    for (const [id, p] of v.plateMap) if (!seen.has(id)) p.style.display = 'none';
  }

  setCamMode(i, ballCam) {
    const v = this.views[i];
    if (!v || v.ballCam === ballCam) return;
    v.ballCam = ballCam;
    v.camName.textContent = ballCam ? 'BALL CAM' : 'CAR CAM';
    v.cam.classList.toggle('off', !ballCam);
  }

  // top-down map of the pitch: pads, cars (arrows) and the ball; the player's attacking end is up
  updateMinimap(i, cars, ball, pads, own, dt) {
    const v = this.views[i];
    if (!v) return;
    v.mapT -= dt;
    if (v.mapT > 0) return;
    v.mapT = 1 / 20;
    const cv = v.map;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = v.mapCtx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const { halfX: HX, halfZ: HZ, chamfer: C, goalHalfW: GW, goalDepth: GD } = ARENA;
    const sc = Math.min((W - 12) / (2 * HX), (H - 12) / (2 * (HZ + GD)));
    const flip = own && own.team === 1 ? -1 : 1;
    const X = (x) => W / 2 + x * sc * flip, Y = (z) => H / 2 - z * sc * flip;
    // pitch
    g.beginPath();
    for (const [x, z] of [[HX, HZ - C], [HX - C, HZ], [-HX + C, HZ], [-HX, HZ - C], [-HX, -HZ + C], [-HX + C, -HZ], [HX - C, -HZ], [HX, -HZ + C]]) g.lineTo(X(x), Y(z));
    g.closePath();
    g.fillStyle = 'rgba(40, 96, 46, 0.55)';
    g.fill();
    g.lineWidth = 1.5;
    g.strokeStyle = 'rgba(230, 240, 255, 0.75)';
    g.stroke();
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(230, 240, 255, 0.35)';
    g.beginPath(); g.moveTo(X(-HX), Y(0)); g.lineTo(X(HX), Y(0)); g.stroke();
    g.beginPath(); g.arc(X(0), Y(0), 1000 * sc, 0, Math.PI * 2); g.stroke();
    for (const t of [0, 1]) {
      const z = t === 0 ? -HZ : HZ;
      g.fillStyle = TEAM_COLORS[t].css;
      g.fillRect(Math.min(X(-GW), X(GW)), Math.min(Y(z), Y(z + (t === 0 ? -GD : GD))), Math.abs(X(GW) - X(-GW)), Math.abs(GD * sc));
    }
    for (const p of pads) {
      g.fillStyle = p.active ? 'rgba(255, 190, 60, 0.95)' : 'rgba(255, 190, 60, 0.25)';
      g.beginPath(); g.arc(X(p.x), Y(p.z), p.big ? 2.6 : 1.4, 0, Math.PI * 2); g.fill();
    }
    for (const c of cars) {
      if (c.demolished) continue;
      const a = Math.atan2(c.fx * flip, c.fz * flip);
      g.save();
      g.translate(X(c.x), Y(c.z));
      g.rotate(a);
      g.beginPath(); g.moveTo(0, -6); g.lineTo(4.2, 4.5); g.lineTo(0, 2.4); g.lineTo(-4.2, 4.5); g.closePath();
      g.fillStyle = TEAM_COLORS[c.team].css;
      g.fill();
      if (c.own) { g.lineWidth = 1.6; g.strokeStyle = '#ffffff'; g.stroke(); }
      g.restore();
    }
    if (ball) {
      g.fillStyle = '#ffffff';
      g.shadowColor = 'rgba(120, 190, 255, 0.9)'; g.shadowBlur = 6;
      g.beginPath(); g.arc(X(ball.x), Y(ball.z), 3.2, 0, Math.PI * 2); g.fill();
      g.shadowBlur = 0;
    }
    if (own) v.coords.textContent = `X: ${Math.round(own.x / 10)}  Y: ${Math.round(own.y / 10)}  Z: ${Math.round(own.z / 10)}`;
  }

  update(dt) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner.classList.remove('visible');
    }
    for (const v of this.views) {
      if (v.statusTimer > 0) { v.statusTimer -= dt; if (v.statusTimer <= 0) v.status.classList.remove('visible'); }
      if (v.centerTimer > 0) { v.centerTimer -= dt; if (v.centerTimer <= 0) v.center.classList.remove('visible'); }
    }
  }

  setFps(text) { this.fps.textContent = text; }
}
