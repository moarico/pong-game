// ---------------------------------------------------------------------------
// Dynamic resolution. Holds the frame rate by moving the internal resolution (the
// frame is always presented sharp) and, once that is at its floor or makes no
// difference, the density of the grass.
//
// Frame rate alone cannot say what holds a frame back: at 60 Hz a frame that takes
// 20 ms and one the system caps at 30 fps (Low Power Mode, a background iframe)
// both show 30 fps. So it also watches how long the GPU takes over each frame (a
// fence polled from timers, see GpuClock) and only lowers the resolution when the
// GPU is actually the bottleneck, only keeps lowering while that pays off, and
// only raises it when the GPU has room to spare.
// ---------------------------------------------------------------------------

const DOWN_BELOW = 56; // fps
const SMOOTH = 58.5;
const GPU_FULL = 15.5; // ms of GPU work that no longer fits a 60 Hz frame
const GPU_ROOMY = 9.5; // ms that leaves room for a step up

export class Governor {
  constructor() {
    this.clock = 0;
    this.fps = 0;
    this.gpu = null;
    this.freezeFor = 60;
    this.upBlockFor = 20;
    this.reset(0, 0, 0);
  }

  // A fresh start at `level`, allowed to move between min and max.
  reset(level, min, max) {
    this.min = min;
    this.max = max;
    this.level = Math.max(min, Math.min(level, max));
    this.grass = 1;
    this.pixelsDontHelp = false;
    this.sceneChanged();
  }

  // Costs just changed (a new place): measure afresh, try again sooner.
  sceneChanged() {
    this.down = null;
    this.noGain = 0;
    this.probe = null;
    this.calm = 0;
    this.freeze = 0;
    this.upBlock = 0;
    this.pixelsDontHelp = false;
    this.settle();
  }

  // Forget the current measurement (after a change).
  settle() {
    this.t = 0;
    this.win = 0;
    this.frames = 0;
  }

  setRange(min, max) {
    this.min = min;
    this.max = max;
    this.level = Math.max(min, Math.min(this.level, max));
  }

  // Feed the real duration of each frame and the latest GPU time estimate (ms, or
  // null where it cannot be measured). Returns true when level or grass changed.
  update(dt, gpuMs = null) {
    this.clock += dt;
    this.t += dt;
    if (this.t < 2.5) return false; // let a change (or new shaders) settle first
    this.win += dt;
    this.frames++;
    if (this.win < 1.2) return false;
    const fps = this.frames / this.win;
    this.win = 0;
    this.frames = 0;
    this.fps = fps;
    this.gpu = gpuMs;
    const known = gpuMs != null;
    const cost = known ? gpuMs : 1000 / fps;
    const saturated = known ? gpuMs > GPU_FULL : fps < DOWN_BELOW;
    const roomy = known ? gpuMs < GPU_ROOMY : true;

    // Did the last step up cost too much? Go back, and wait longer before trying again.
    if (this.probe) {
      const before = this.probe;
      this.probe = null;
      if (fps < Math.min(DOWN_BELOW, before * 0.93) || (known && gpuMs > GPU_FULL)) {
        this.upBlock = this.clock + this.upBlockFor;
        this.upBlockFor = Math.min(this.upBlockFor * 2, 300);
        return this.set(this.level - 1, this.grass);
      }
    }
    // Are the steps down paying off?
    if (this.down) {
      if (cost > this.down.cost * 0.93) {
        this.noGain++;
      } else {
        this.noGain = 0;
        this.down.keep = { level: this.level, grass: this.grass };
      }
      this.down.cost = Math.min(this.down.cost, cost);
      // Frame rates snap to whole vsync steps, so without GPU times be more patient.
      if (this.noGain >= (known ? 2 : 5)) {
        // That lever does nothing here: undo it back to the last step that helped.
        const k = this.down.keep;
        const wasPixels = k.level !== this.level;
        this.down = null;
        this.noGain = 0;
        if (wasPixels && known && !this.pixelsDontHelp) {
          // The GPU is busy with something other than pixels: try the grass next.
          this.pixelsDontHelp = true;
        } else {
          this.freeze = this.clock + this.freezeFor;
          this.freezeFor = Math.min(this.freezeFor * 2, 600);
        }
        return this.set(k.level, k.grass);
      }
    }
    if (fps < DOWN_BELOW && saturated) {
      this.calm = 0;
      if (this.clock < this.freeze) return false;
      if (!this.down) this.down = { keep: { level: this.level, grass: this.grass }, cost };
      const thin = this.grass > 0.55;
      if (this.pixelsDontHelp && thin) return this.set(this.level, Math.max(0.55, this.grass * 0.8));
      if (this.level > this.min) return this.set(this.level - 1, this.grass);
      if (thin) return this.set(this.level, Math.max(0.55, this.grass * 0.8));
      return false;
    }
    this.down = null;
    this.noGain = 0;
    if (fps < SMOOTH || !roomy) {
      this.calm = 0;
      return false;
    }
    this.calm++;
    if (this.calm < 5 || this.clock < this.upBlock) return false;
    this.calm = 0;
    if (this.grass < 1) return this.set(this.level, Math.min(1, this.grass / 0.8));
    if (this.level < this.max) {
      this.probe = fps;
      return this.set(this.level + 1, this.grass);
    }
    return false;
  }

  set(level, grass) {
    const l = Math.max(this.min, Math.min(level, this.max));
    this.settle();
    if (l === this.level && grass === this.grass) return false;
    this.level = l;
    this.grass = grass;
    return true;
  }
}

// Rough GPU time per frame: a fence placed after the frame's commands, polled from
// timers (a fence's status can only change between tasks). Records the last poll
// that still found it unsignalled, a lower bound that main-thread delays cannot
// inflate. One fence in flight at a time.
export class GpuClock {
  constructor(gl) {
    this.gl = gl;
    this.ok = typeof gl.fenceSync === 'function';
    this.pending = false;
    this.samples = [];
  }

  mark() {
    if (!this.ok || this.pending) return;
    const gl = this.gl;
    let sync;
    try {
      sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
    } catch {
      sync = null;
    }
    if (!sync) {
      this.ok = false;
      return;
    }
    this.pending = true;
    const t0 = performance.now();
    let busyUntil = 0;
    const check = () => {
      const now = performance.now() - t0;
      let done;
      try {
        done = gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.SIGNALED;
      } catch {
        done = true;
        this.ok = false;
      }
      if (done || now > 80) {
        gl.deleteSync(sync);
        this.pending = false;
        this.samples.push(done ? busyUntil : 80);
        if (this.samples.length > 30) this.samples.shift();
        return;
      }
      busyUntil = now;
      setTimeout(check, 2);
    };
    setTimeout(check, 2);
  }

  // Median of recent frames (ms), or null when unknown.
  estimate() {
    if (!this.ok || this.samples.length < 8) return null;
    const s = [...this.samples].sort((a, b) => a - b);
    return s[s.length >> 1];
  }

  clear() {
    this.samples.length = 0;
  }
}
