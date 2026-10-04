// Keyboard, mouse and gamepad state with per-frame edge detection.

export const PAD = {
  A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SELECT: 8, START: 9, LS: 10, RS: 11,
  UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15,
};

const GAME_KEYS = new Set([
  'Tab', 'Space', 'ControlLeft', 'ControlRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyF', 'KeyC', 'KeyV',
  'KeyE', 'KeyR', 'KeyG', 'KeyT', 'KeyB', 'KeyH', 'KeyM', 'KeyI', 'KeyX', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
]);

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = new Set();
    this.pressed = new Set();
    this.mouseButtons = [false, false, false];
    this.mousePressed = [false, false, false];
    this.dx = 0;
    this.dy = 0;
    this.wheel = 0;
    this.locked = false;
    this.capture = false; // true while a match is running (blocks browser shortcuts)
    this.wantLock = false;
    this.pad = null;
    this.padPrev = new Array(17).fill(false);
    this.padNow = new Array(17).fill(false);
    this.axes = [0, 0, 0, 0];
    this.lastDevice = 'kbm';
    this.onLockChange = null;

    window.addEventListener('keydown', (e) => {
      if (this.capture && GAME_KEYS.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.down.add(e.code);
      this.pressed.add(e.code);
      this.lastDevice = 'kbm';
    });
    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    });
    window.addEventListener('blur', () => {
      this.down.clear();
      this.mouseButtons = [false, false, false];
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.dx += e.movementX;
      this.dy += e.movementY;
      this.lastDevice = 'kbm';
    });
    canvas.addEventListener('mousedown', (e) => {
      if (e.button > 2) return;
      this.mouseButtons[e.button] = true;
      this.mousePressed[e.button] = true;
      this.lastDevice = 'kbm';
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button > 2) return;
      this.mouseButtons[e.button] = false;
    });
    window.addEventListener('wheel', (e) => {
      if (this.locked) this.wheel += Math.sign(e.deltaY);
    }, { passive: true });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      // A lock request can finish after the game already paused; release it again.
      if (this.locked && !this.wantLock) {
        document.exitPointerLock();
        return;
      }
      if (!this.locked) this.mouseButtons = [false, false, false];
      if (this.onLockChange) this.onLockChange(this.locked);
    });
  }

  requestLock() {
    this.wantLock = true;
    if (this.locked) return;
    try {
      const p = this.canvas.requestPointerLock?.({ unadjustedMovement: true });
      if (p && p.catch) p.catch(() => this.canvas.requestPointerLock?.());
    } catch {
      /* pointer lock is optional (e.g. gamepad-only play) */
    }
  }

  exitLock() {
    this.wantLock = false;
    if (document.pointerLockElement) document.exitPointerLock();
  }

  poll() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    this.pad = null;
    for (const p of pads) {
      if (p && p.connected && p.buttons.length >= 16) {
        this.pad = p;
        break;
      }
    }
    for (let i = 0; i < 17; i++) this.padPrev[i] = this.padNow[i];
    if (this.pad) {
      for (let i = 0; i < 17; i++) {
        const b = this.pad.buttons[i];
        this.padNow[i] = !!b && (b.pressed || b.value > 0.5);
      }
      const dz = (v) => (Math.abs(v) < 0.16 ? 0 : (v - Math.sign(v) * 0.16) / 0.84);
      this.axes = [dz(this.pad.axes[0] || 0), dz(this.pad.axes[1] || 0), dz(this.pad.axes[2] || 0), dz(this.pad.axes[3] || 0)];
      if (this.padNow.some((v, i) => v && !this.padPrev[i]) || this.axes.some((v) => Math.abs(v) > 0.3)) this.lastDevice = 'pad';
    } else {
      this.padNow.fill(false);
      this.axes = [0, 0, 0, 0];
    }
  }

  endFrame() {
    this.pressed.clear();
    this.mousePressed = [false, false, false];
    this.dx = 0;
    this.dy = 0;
    this.wheel = 0;
  }

  key(code) {
    return this.down.has(code);
  }

  keyPressed(code) {
    return this.pressed.has(code);
  }

  padDown(b) {
    return this.padNow[b];
  }

  padPressed(b) {
    return this.padNow[b] && !this.padPrev[b];
  }

  trigger(b) {
    if (!this.pad) return 0;
    const v = this.pad.buttons[b];
    return v ? v.value : 0;
  }
}
