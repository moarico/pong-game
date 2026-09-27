// Keyboard, mouse, touch and gamepad, reduced to: a move vector, run, jump, the
// fighting buttons (light, heavy, spin, dodge, parry) and look deltas.

// Fighting keys: left hand around WASD, or right hand on J K L / U I.
const ACTION_KEYS = {
  KeyJ: 'attack',
  KeyK: 'heavy',
  KeyE: 'spin', KeyL: 'spin',
  KeyQ: 'dodge', KeyU: 'dodge',
  KeyF: 'parry', KeyI: 'parry',
};

const MOVE_KEYS = {
  KeyW: [0, 1], ArrowUp: [0, 1],
  KeyS: [0, -1], ArrowDown: [0, -1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.moveX = 0; // right +
    this.moveY = 0; // forward +
    this.run = false;
    this.jumpHeld = false;
    this.jumpPressed = false; // latched until the simulation consumes it
    this.attackPressed = false;
    this.heavyPressed = false;
    this.heavyHeld = false;
    this.spinPressed = false;
    this.dodgePressed = false;
    this.parryPressed = false;
    this.usedAttack = false;
    this.lockFailed = false;
    this.lookX = 0;
    this.lookY = 0;
    this.lastInputTime = 0;
    this.usedMove = false;
    this.usedJump = false;
    this.usedLook = false;
    this.touch = { stickId: null, lookId: null, ox: 0, oy: 0, x: 0, y: 0, lx: 0, ly: 0 };
    this.stickVec = [0, 0];
    this.dragging = false;
    this.sensitivity = 0.0024;
    this.bind();
  }

  bind() {
    const c = this.canvas;
    addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (!e.repeat) this.pressJump();
        e.preventDefault();
      }
      const act = ACTION_KEYS[e.code];
      if (act && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.press(act);
        e.preventDefault();
      }
      if (MOVE_KEYS[e.code]) e.preventDefault();
      this.keys.add(e.code);
      this.poke();
    });
    addEventListener('keyup', (e) => {
      if (e.code === 'Space') this.jumpHeld = false;
      if (e.code === 'KeyK') this.heavyHeld = false;
      this.keys.delete(e.code);
    });
    addEventListener('blur', () => {
      this.keys.clear();
      this.jumpHeld = false;
      this.heavyHeld = false;
      this.dragging = false;
    });

    // Mouse: the first click locks the pointer (mouse looks, left button cuts,
    // right button is the heavy blow). Where the browser refuses the lock, drag
    // to look and click without dragging to attack.
    c.addEventListener('mousedown', (e) => {
      if (e.button !== 0 && e.button !== 2) return;
      c.focus();
      if (document.pointerLockElement === c) {
        if (e.button === 0) this.press('attack');
        else this.press('heavy');
        return;
      }
      this.dragging = true;
      this.drag = { x: e.clientX, y: e.clientY, t: performance.now(), button: e.button, moved: 0 };
      c.classList.add('looking');
      if (!this.lockFailed && c.requestPointerLock) {
        try {
          const p = c.requestPointerLock();
          if (p && p.catch) p.catch(() => { this.lockFailed = true; });
        } catch {
          this.lockFailed = true;
        }
      } else if (e.button === 2) {
        // Unlocked right button: charge while held.
        this.press('heavy');
      }
    });
    document.addEventListener('pointerlockerror', () => { this.lockFailed = true; });
    addEventListener('mouseup', (e) => {
      if (e.button === 2) this.heavyHeld = false;
      const d = this.drag;
      if (this.dragging && d && this.lockFailed && e.button === 0 && d.moved < 8 && performance.now() - d.t < 350) this.press('attack');
      this.dragging = false;
      this.drag = null;
      if (document.pointerLockElement !== c) c.classList.remove('looking');
    });
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === c || this.dragging) {
        if (this.drag) this.drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
        this.lookX += e.movementX * this.sensitivity;
        this.lookY += e.movementY * this.sensitivity;
        this.usedLook = true;
        this.poke();
      }
    });
    document.addEventListener('pointerlockchange', () => {
      c.classList.toggle('looking', document.pointerLockElement === c);
    });
    c.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch: left side is a floating stick, right side looks around, button jumps.
    const stickEl = document.getElementById('stick');
    const knobEl = stickEl && stickEl.firstElementChild;
    const jumpEl = document.getElementById('jump');
    const t = this.touch;
    const setStick = () => {
      if (!stickEl) return;
      stickEl.style.left = `${t.ox}px`;
      stickEl.style.top = `${t.oy}px`;
      knobEl.style.transform = `translate(${this.stickVec[0] * 42}px, ${-this.stickVec[1] * 42}px)`;
    };
    c.addEventListener('touchstart', (e) => {
      document.body.classList.add('touch');
      for (const tt of e.changedTouches) {
        if (tt.clientX < innerWidth * 0.45 && t.stickId === null) {
          t.stickId = tt.identifier;
          t.ox = tt.clientX;
          t.oy = tt.clientY;
          this.stickVec = [0, 0];
          stickEl && stickEl.classList.add('on');
          setStick();
        } else if (t.lookId === null) {
          t.lookId = tt.identifier;
          t.lx = tt.clientX;
          t.ly = tt.clientY;
        }
      }
      this.poke();
      e.preventDefault();
    }, { passive: false });
    c.addEventListener('touchmove', (e) => {
      for (const tt of e.changedTouches) {
        if (tt.identifier === t.stickId) {
          const dx = tt.clientX - t.ox;
          const dy = tt.clientY - t.oy;
          const r = 52;
          const len = Math.hypot(dx, dy);
          const k = len > r ? r / len : 1;
          this.stickVec = [(dx * k) / r, (-dy * k) / r];
          setStick();
          this.usedMove = true;
        } else if (tt.identifier === t.lookId) {
          this.lookX += (tt.clientX - t.lx) * 0.0055;
          this.lookY += (tt.clientY - t.ly) * 0.0045;
          t.lx = tt.clientX;
          t.ly = tt.clientY;
          this.usedLook = true;
        }
      }
      e.preventDefault();
    }, { passive: false });
    const endTouch = (e) => {
      for (const tt of e.changedTouches) {
        if (tt.identifier === t.stickId) {
          t.stickId = null;
          this.stickVec = [0, 0];
          stickEl && stickEl.classList.remove('on');
        } else if (tt.identifier === t.lookId) {
          t.lookId = null;
        }
      }
    };
    c.addEventListener('touchend', endTouch);
    c.addEventListener('touchcancel', endTouch);
    if (jumpEl) {
      jumpEl.addEventListener('touchstart', (e) => {
        document.body.classList.add('touch');
        jumpEl.classList.add('down');
        this.pressJump();
        e.preventDefault();
      }, { passive: false });
      const release = (e) => {
        jumpEl.classList.remove('down');
        this.jumpHeld = false;
        e.preventDefault();
      };
      jumpEl.addEventListener('touchend', release);
      jumpEl.addEventListener('touchcancel', release);
      jumpEl.addEventListener('mousedown', (e) => {
        this.pressJump();
        e.preventDefault();
      });
      jumpEl.addEventListener('mouseup', () => { this.jumpHeld = false; });
    }
    for (const [id, act] of [['btn-attack', 'attack'], ['btn-heavy', 'heavy'], ['btn-spin', 'spin'], ['btn-dodge', 'dodge'], ['btn-parry', 'parry']]) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.addEventListener('touchstart', (e) => {
        document.body.classList.add('touch');
        el.classList.add('down');
        this.press(act);
        e.preventDefault();
      }, { passive: false });
      const up = (e) => {
        el.classList.remove('down');
        if (act === 'heavy') this.heavyHeld = false;
        e.preventDefault();
      };
      el.addEventListener('touchend', up);
      el.addEventListener('touchcancel', up);
      el.addEventListener('mousedown', (e) => {
        this.press(act);
        e.preventDefault();
      });
      el.addEventListener('mouseup', () => { if (act === 'heavy') this.heavyHeld = false; });
    }
    if (matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0) {
      document.body.classList.add('touch');
    }
  }

  press(act) {
    if (act === 'attack') this.attackPressed = true;
    else if (act === 'heavy') {
      this.heavyPressed = true;
      this.heavyHeld = true;
    } else if (act === 'spin') this.spinPressed = true;
    else if (act === 'dodge') this.dodgePressed = true;
    else if (act === 'parry') this.parryPressed = true;
    this.usedAttack = true;
    this.poke();
  }

  pressJump() {
    this.jumpPressed = true;
    this.jumpHeld = true;
    this.usedJump = true;
    this.poke();
  }

  poke() {
    this.lastInputTime = performance.now();
  }

  // Called once per rendered frame.
  update() {
    let x = 0;
    let y = 0;
    for (const code of this.keys) {
      const m = MOVE_KEYS[code];
      if (m) {
        x += m[0];
        y += m[1];
      }
    }
    const kl = Math.hypot(x, y);
    if (kl > 0) {
      x /= kl;
      y /= kl;
      this.usedMove = true;
    }
    this.run = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');

    // Touch stick: analog; pushing to the rim breaks into a run.
    const sx = this.stickVec[0];
    const sy = this.stickVec[1];
    const sl = Math.hypot(sx, sy);
    if (sl > 0.12) {
      const mag = Math.min(1, (sl - 0.12) / 0.8);
      x = (sx / sl) * mag;
      y = (sy / sl) * mag;
      if (sl > 0.95) this.run = true;
    }

    this.pollGamepad((gx, gy, run) => {
      x = gx;
      y = gy;
      if (run) this.run = true;
    });

    this.moveX = x;
    this.moveY = y;
  }

  pollGamepad(apply) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p || !p.connected) continue;
      const dz = (v) => (Math.abs(v) < 0.14 ? 0 : (v - Math.sign(v) * 0.14) / 0.86);
      const gx = dz(p.axes[0] || 0);
      const gy = -dz(p.axes[1] || 0);
      const run = !!(p.buttons[7]?.pressed || p.buttons[10]?.pressed);
      // X cuts, Y is the heavy blow, B dodges, RB spins, LB parries.
      const btn = (i) => !!p.buttons[i]?.pressed;
      const prev = this.padPrev || (this.padPrev = {});
      for (const [i, act] of [[2, 'attack'], [3, 'heavy'], [1, 'dodge'], [5, 'spin'], [4, 'parry']]) {
        const on = btn(i);
        if (on && !prev[i]) this.press(act);
        if (!on && prev[i] && act === 'heavy') this.heavyHeld = false;
        prev[i] = on;
      }
      if (gx || gy) {
        apply(gx, gy, run);
        this.usedMove = true;
      }
      const rx = dz(p.axes[2] || 0);
      const ry = dz(p.axes[3] || 0);
      if (rx || ry) {
        this.lookX += rx * 0.045;
        this.lookY += ry * 0.035;
      }
      const a = !!p.buttons[0]?.pressed;
      if (a && !this.padJump) this.pressJump();
      if (!a && this.padJump) this.jumpHeld = false;
      this.padJump = a;
      if (gx || gy || rx || ry || a) this.poke();
      break;
    }
  }

  consumeLook() {
    const l = [this.lookX, this.lookY];
    this.lookX = 0;
    this.lookY = 0;
    return l;
  }
}
