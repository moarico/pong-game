// Keyboard + Gamepad API input. Xbox controllers report the "standard" mapping
// in Chrome/Edge (including Edge on Xbox consoles); Firefox on Linux reports a
// raw layout which is translated below.

const BTN = ['a', 'b', 'x', 'y', 'lb', 'rb', 'lt', 'rt', 'view', 'menu', 'ls', 'rs', 'up', 'down', 'left', 'right', 'guide'];

const KEY_LAYOUTS = {
  solo: {
    up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
    jump: ['Space', 'KeyK'], boost: ['ShiftLeft', 'ShiftRight', 'KeyL'], slide: ['ControlLeft', 'KeyC', 'KeyJ'],
    rollL: ['KeyQ', 'KeyU'], rollR: ['KeyE', 'KeyO'], cam: ['KeyR', 'KeyI'], pause: ['Escape', 'KeyP'],
    mouse: { boost: 0, jump: 2, cam: 1 },
  },
  p1: {
    up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
    jump: ['Space'], boost: ['ShiftLeft'], slide: ['ControlLeft', 'KeyC'],
    rollL: ['KeyQ'], rollR: ['KeyE'], cam: ['KeyR'], pause: ['Escape'],
    mouse: { boost: 0, jump: 2, cam: 1 },
  },
  p2: {
    up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
    jump: ['KeyK', 'Numpad0'], boost: ['KeyL', 'NumpadDecimal'], slide: ['KeyJ', 'Numpad1'],
    rollL: ['KeyU'], rollR: ['KeyO'], cam: ['KeyI', 'Numpad2'], pause: ['KeyP'],
  },
};

const GAME_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'ShiftLeft', 'ShiftRight', 'ControlLeft']);

function deadzone2(x, y, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return [0, 0];
  const s = Math.min(1, (m - dz) / (1 - dz)) / m;
  return [x * s, y * s];
}

class PadState {
  constructor(index) {
    this.index = index;
    this.id = '';
    this.connected = false;
    this.b = {};
    this.prev = {};
    for (const k of BTN) { this.b[k] = 0; this.prev[k] = 0; }
    this.lx = 0; this.ly = 0; this.rx = 0; this.ry = 0;
    this.triggerSeenNeg = [false, false];
    this.navRepeat = { dir: '', t: 0 };
    this.raw = null;
  }
  pressed(k) { return this.b[k] > 0.5 && this.prev[k] <= 0.5; }
  down(k) { return this.b[k] > 0.5; }
}

export class Input {
  constructor() {
    this.keys = new Set();
    this.keysPressed = new Set();
    this.mouse = new Set();
    this.mousePressed = new Set();
    this.gamepadBlocked = false;
    this.pads = [];
    this.onActivity = null;
    this.onPadConnect = null;
    this.kbNav = { dir: '', t: 0 };
    this.lastFrame = performance.now();
    try { navigator.gamepadInputEmulation = 'gamepad'; } catch (e) { /* only exists on old Edge/Xbox */ }

    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.has(e.code) && !(e.target && e.target.tagName === 'INPUT')) e.preventDefault();
      if (!e.repeat) this.keysPressed.add(e.code);
      this.keys.add(e.code);
      if (this.onActivity) this.onActivity();
    });
    window.addEventListener('keyup', (e) => { this.keys.delete(e.code); });
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.clear(); });
    window.addEventListener('pointerdown', () => { if (this.onActivity) this.onActivity(); });
    // mouse buttons drive the keyboard & mouse player; menus still get normal clicks
    window.addEventListener('mousedown', (e) => {
      if (!this.mouse.has(e.button)) this.mousePressed.add(e.button);
      this.mouse.add(e.button);
      if (e.button === 1) e.preventDefault(); // no auto-scroll on middle click
    });
    window.addEventListener('mouseup', (e) => { this.mouse.delete(e.button); });
    // a release outside the page never sends mouseup; resync from the live button mask
    window.addEventListener('mousemove', (e) => {
      if (!(e.buttons & 1)) this.mouse.delete(0);
      if (!(e.buttons & 2)) this.mouse.delete(2);
      if (!(e.buttons & 4)) this.mouse.delete(1);
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('gamepadconnected', (e) => {
      if (this.onPadConnect) this.onPadConnect(e.gamepad, true);
    });
    window.addEventListener('gamepaddisconnected', (e) => {
      const p = this.pads[e.gamepad.index];
      if (p) p.connected = false;
      if (this.onPadConnect) this.onPadConnect(e.gamepad, false);
    });
  }

  // Poll gamepads; call once at the start of every frame.
  update() {
    const now = performance.now();
    this.dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    let list = [];
    try {
      list = navigator.getGamepads ? navigator.getGamepads() : [];
    } catch (e) {
      // the page is embedded somewhere that does not allow controller access
      list = [];
      this.gamepadBlocked = true;
    }
    for (const p of this.pads) if (p) p.connected = false;
    for (let i = 0; i < list.length; i++) {
      const gp = list[i];
      if (!gp || !gp.connected) continue;
      const st = this.pads[gp.index] || (this.pads[gp.index] = new PadState(gp.index));
      st.connected = true;
      st.id = gp.id;
      st.raw = gp;
      for (const k of BTN) st.prev[k] = st.b[k];
      this.readPad(st, gp);
      if (this.onActivity) for (const k of BTN) if (st.pressed(k)) { this.onActivity(); break; }
    }
  }

  readPad(st, gp) {
    const bv = (i) => (gp.buttons[i] ? (typeof gp.buttons[i] === 'object' ? gp.buttons[i].value || (gp.buttons[i].pressed ? 1 : 0) : gp.buttons[i]) : 0);
    const ax = (i) => (gp.axes[i] !== undefined ? gp.axes[i] : 0);
    if (gp.mapping === 'standard' || gp.axes.length < 6) {
      BTN.forEach((k, i) => { st.b[k] = bv(i); });
      [st.lx, st.ly] = deadzone2(ax(0), ax(1));
      [st.rx, st.ry] = deadzone2(ax(2), ax(3));
    } else {
      // Xbox pad on Firefox/Linux: triggers are axes 2 and 5 (-1..1), d-pad axes 6/7
      const map = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, view: 6, menu: 7, guide: 8, ls: 9, rs: 10 };
      for (const k of BTN) st.b[k] = 0;
      for (const k in map) st.b[k] = bv(map[k]);
      const trig = (axis, slot) => {
        const v = ax(axis);
        if (v < -0.5) st.triggerSeenNeg[slot] = true;
        return st.triggerSeenNeg[slot] ? (v + 1) / 2 : Math.max(0, v);
      };
      st.b.lt = trig(2, 0);
      st.b.rt = trig(5, 1);
      st.b.left = ax(6) < -0.5 ? 1 : 0;
      st.b.right = ax(6) > 0.5 ? 1 : 0;
      st.b.up = ax(7) < -0.5 ? 1 : 0;
      st.b.down = ax(7) > 0.5 ? 1 : 0;
      [st.lx, st.ly] = deadzone2(ax(0), ax(1));
      [st.rx, st.ry] = deadzone2(ax(3), ax(4));
    }
  }

  // Clears per-frame key edges; call at the end of every frame.
  endFrame() {
    this.keysPressed.clear();
    this.mousePressed.clear();
  }

  connectedPads() {
    return this.pads.filter((p) => p && p.connected);
  }

  anyKey(codes) { for (const c of codes) if (this.keys.has(c)) return true; return false; }
  anyKeyPressed(codes) { for (const c of codes) if (this.keysPressed.has(c)) return true; return false; }

  keyboardControls(layoutName) {
    const L = KEY_LAYOUTS[layoutName];
    const M = L.mouse;
    const up = this.anyKey(L.up) ? 1 : 0, down = this.anyKey(L.down) ? 1 : 0;
    const left = this.anyKey(L.left) ? 1 : 0, right = this.anyKey(L.right) ? 1 : 0;
    const mDown = (b) => !!M && this.mouse.has(M[b]);
    const mPressed = (b) => !!M && this.mousePressed.has(M[b]);
    return {
      throttle: up - down,
      steer: right - left,
      pitch: down - up,
      yaw: right - left,
      roll: (this.anyKey(L.rollR) ? 1 : 0) - (this.anyKey(L.rollL) ? 1 : 0),
      jump: this.anyKey(L.jump) || mDown('jump'),
      boost: this.anyKey(L.boost) || mDown('boost'),
      powerslide: this.anyKey(L.slide),
      ballCam: this.anyKeyPressed(L.cam) || mPressed('cam'),
      pause: this.anyKeyPressed(L.pause),
      lookX: 0,
      lookY: 0,
      skip: this.anyKeyPressed(L.jump) || mPressed('jump'),
      digitalSteer: true,
    };
  }

  padControls(st) {
    const dpadX = st.b.right - st.b.left;
    const dpadY = st.b.down - st.b.up;
    const steer = Math.abs(st.lx) > Math.abs(dpadX) ? st.lx : dpadX;
    const pitch = Math.abs(st.ly) > Math.abs(dpadY) ? st.ly : dpadY;
    return {
      throttle: st.b.rt - st.b.lt,
      steer,
      pitch,
      yaw: steer,
      roll: st.b.rb - st.b.lb,
      jump: st.down('a'),
      boost: st.down('b'),
      powerslide: st.down('x'),
      ballCam: st.pressed('y'),
      pause: st.pressed('menu'),
      lookX: st.rx,
      lookY: st.ry,
      skip: st.pressed('a'),
      digitalSteer: Math.abs(st.lx) < 0.01 && Math.abs(dpadX) > 0, // d-pad steering is on/off like keys
    };
  }

  // device: {type:'pad', index} | {type:'kb', layout} | {type:'any'}
  controls(device) {
    if (device.type === 'kb') return this.keyboardControls(device.layout);
    if (device.type === 'pad') {
      const st = this.pads[device.index];
      if (!st || !st.connected) return emptyControls();
      return this.padControls(st);
    }
    // merge keyboard + every pad
    const out = this.keyboardControls('solo');
    for (const st of this.connectedPads()) {
      const c = this.padControls(st);
      for (const k in c) {
        if (k === 'digitalSteer') continue;
        if (typeof c[k] === 'boolean') out[k] = out[k] || c[k];
        else if (Math.abs(c[k]) > Math.abs(out[k])) {
          out[k] = c[k];
          if (k === 'steer') out.digitalSteer = c.digitalSteer;
        }
      }
    }
    return out;
  }

  // Menu navigation edges from every device, with stick auto-repeat.
  menu() {
    const out = { up: false, down: false, left: false, right: false, confirm: false, back: false, start: false, source: null };
    const kp = (codes) => this.anyKeyPressed(codes);
    if (kp(['ArrowUp', 'KeyW'])) out.up = true;
    if (kp(['ArrowDown', 'KeyS'])) out.down = true;
    if (kp(['ArrowLeft', 'KeyA'])) out.left = true;
    if (kp(['ArrowRight', 'KeyD'])) out.right = true;
    if (kp(['Enter', 'NumpadEnter', 'Space'])) { out.confirm = true; out.source = { type: 'kb' }; }
    if (kp(['Escape', 'Backspace'])) out.back = true;
    for (const st of this.connectedPads()) {
      if (st.pressed('up')) out.up = true;
      if (st.pressed('down')) out.down = true;
      if (st.pressed('left')) out.left = true;
      if (st.pressed('right')) out.right = true;
      if (st.pressed('a')) { out.confirm = true; out.source = { type: 'pad', index: st.index }; }
      if (st.pressed('b')) out.back = true;
      if (st.pressed('menu')) out.start = true;
      // left stick with repeat
      let dir = '';
      if (st.ly < -0.6) dir = 'up';
      else if (st.ly > 0.6) dir = 'down';
      else if (st.lx < -0.6) dir = 'left';
      else if (st.lx > 0.6) dir = 'right';
      const r = st.navRepeat;
      if (dir && dir !== r.dir) { out[dir] = true; r.t = 0.38; }
      else if (dir) { r.t -= this.dt || 0.016; if (r.t <= 0) { out[dir] = true; r.t = 0.13; } }
      r.dir = dir;
    }
    return out;
  }

  rumble(device, strong, weak, ms) {
    const pads = device.type === 'pad' ? [this.pads[device.index]] : device.type === 'any' ? this.connectedPads() : [];
    for (const st of pads) {
      const gp = st && st.raw;
      if (!gp) continue;
      try {
        if (gp.vibrationActuator && gp.vibrationActuator.playEffect) {
          gp.vibrationActuator.playEffect('dual-rumble', { startDelay: 0, duration: ms, weakMagnitude: Math.min(1, weak), strongMagnitude: Math.min(1, strong) }).catch(() => {});
        } else if (gp.hapticActuators && gp.hapticActuators[0]) {
          gp.hapticActuators[0].pulse(Math.min(1, Math.max(strong, weak)), ms);
        }
      } catch (e) { /* rumble is optional */ }
    }
  }
}

export function emptyControls() {
  return { throttle: 0, steer: 0, pitch: 0, yaw: 0, roll: 0, jump: false, boost: false, powerslide: false, ballCam: false, pause: false, lookX: 0, lookY: 0, skip: false };
}

export function padLabel(id) {
  if (!id) return 'Controller';
  const s = id.toLowerCase();
  if (s.includes('xbox') || s.includes('xinput') || s.includes('045e')) return 'Xbox Controller';
  if (s.includes('dualsense') || s.includes('dualshock') || s.includes('054c')) return 'PlayStation Controller';
  return 'Controller';
}
