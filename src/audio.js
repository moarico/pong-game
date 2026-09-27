// ---------------------------------------------------------------------------
// Sound, synthesised on the fly with WebAudio (no files): blade swishes, steel
// on steel, flesh, the ground taking a heavy blow, the glint that warns of an
// attack, and wind over the grass. Starts on the first key or tap (browsers
// require a gesture); M mutes.
// ---------------------------------------------------------------------------

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      this.muted = localStorage.getItem('samurai-muted') === '1';
    } catch {
      // Storage may be unavailable; sound simply starts unmuted.
    }
    this.listener = { x: 0, z: 0, yaw: 0 };
    const start = () => this.start();
    // iPhones only unlock sound on a finished tap (touchend / click).
    for (const ev of ['keydown', 'mousedown', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'click']) addEventListener(ev, start, { once: false, passive: true });
    addEventListener('keydown', (e) => {
      if (e.code === 'KeyM' && !e.repeat) this.toggle();
    });
  }

  start() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch {
      return;
    }
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(c.destination);
    // A second of white noise to cut sounds from.
    const len = c.sampleRate;
    this.noise = c.createBuffer(1, len, c.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.startWind();
  }

  toggle() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('samurai-muted', this.muted ? '1' : '0');
    } catch {
      // Not persisted; fine.
    }
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }

  setListener(x, z, yaw) {
    this.listener.x = x;
    this.listener.z = z;
    this.listener.yaw = yaw;
  }

  // Wind: filtered noise breathing with the gusts.
  startWind() {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 0.6;
    this.windGain = c.createGain();
    this.windGain.gain.value = 0.0;
    const mix = c.createGain();
    mix.gain.value = 0.6;
    src.connect(lp).connect(this.windGain);
    src.connect(bp).connect(mix).connect(this.windGain);
    this.windGain.connect(this.master);
    this.windBand = bp;
    src.start();
  }

  setWind(strength) {
    if (!this.ctx || !this.windGain) return;
    const t = this.ctx.currentTime;
    this.windGain.gain.setTargetAtTime(0.035 + strength * 0.07, t, 0.4);
    this.windBand.frequency.setTargetAtTime(600 + strength * 700, t, 0.5);
  }

  // Output node for a sound at `pos` (panned and attenuated), or centred.
  out(pos, gain = 1) {
    const c = this.ctx;
    const g = c.createGain();
    g.gain.value = gain;
    if (pos && c.createStereoPanner) {
      const dx = pos.x - this.listener.x;
      const dz = pos.z - this.listener.z;
      const dist = Math.hypot(dx, dz);
      // Camera right = (cos yaw, -sin yaw).
      const right = (dx * Math.cos(this.listener.yaw) - dz * Math.sin(this.listener.yaw)) / Math.max(dist, 1);
      const p = c.createStereoPanner();
      p.pan.value = Math.max(-0.8, Math.min(0.8, right));
      g.gain.value = gain / (1 + Math.max(0, dist - 3) / 8);
      g.connect(p).connect(this.master);
    } else {
      g.connect(this.master);
    }
    return g;
  }

  noiseBurst(dest, t, dur, type, f0, f1, q = 1, peak = 0.5, attack = 0.01) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  tone(dest, t, dur, f0, f1, peak, type = 'sine', attack = 0.004) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // Struck steel: inharmonic partials ringing down.
  ring(dest, t, base, peak, decay) {
    const partials = [1, 1.34, 1.78, 2.38, 3.0, 4.1];
    partials.forEach((m, i) => {
      const f = base * m * (1 + (Math.random() - 0.5) * 0.02);
      this.tone(dest, t, decay * (1 - i * 0.09), f, f * 0.998, peak / (1 + i * 0.6), 'sine', 0.002);
    });
  }

  play(name, { pos = null, pitch = 1 } = {}) {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const c = this.ctx;
    const t = c.currentTime + 0.005;
    const p = pitch * (0.94 + Math.random() * 0.12);
    switch (name) {
      case 'swish': {
        const o = this.out(pos, 0.9);
        this.noiseBurst(o, t, 0.2, 'bandpass', 650 * p, 2600 * p, 1.4, 0.55, 0.03);
        this.noiseBurst(o, t + 0.02, 0.14, 'highpass', 3000 * p, 5000 * p, 0.7, 0.12, 0.02);
        break;
      }
      case 'thrust': {
        const o = this.out(pos, 0.8);
        this.noiseBurst(o, t, 0.13, 'bandpass', 1500 * p, 3400 * p, 1.6, 0.5, 0.015);
        break;
      }
      case 'heavy': {
        const o = this.out(pos, 1);
        this.noiseBurst(o, t, 0.32, 'bandpass', 380 * p, 1500 * p, 1.2, 0.7, 0.05);
        this.tone(o, t, 0.3, 90 * p, 55 * p, 0.25);
        break;
      }
      case 'spin': {
        const o = this.out(pos, 0.9);
        this.noiseBurst(o, t, 0.2, 'bandpass', 600, 1800, 1.3, 0.5, 0.03);
        this.noiseBurst(o, t + 0.15, 0.22, 'bandpass', 900, 2600, 1.3, 0.45, 0.03);
        break;
      }
      case 'hit':
      case 'kill': {
        const o = this.out(pos, name === 'kill' ? 1.2 : 1);
        this.noiseBurst(o, t, 0.08, 'highpass', 2600, 1800, 0.8, 0.35, 0.002);
        this.noiseBurst(o, t, 0.16, 'lowpass', 1400, 300, 0.9, 0.6, 0.004);
        this.tone(o, t, 0.16, 140, 60, 0.5);
        if (name === 'kill') this.tone(o, t + 0.02, 0.4, 70, 42, 0.45);
        break;
      }
      case 'hurt': {
        const o = this.out(null, 0.9);
        this.noiseBurst(o, t, 0.2, 'lowpass', 900, 200, 0.8, 0.6, 0.004);
        this.tone(o, t, 0.25, 110, 50, 0.55);
        break;
      }
      case 'clash': {
        const o = this.out(pos, 0.85);
        this.noiseBurst(o, t, 0.05, 'highpass', 4000, 3000, 0.6, 0.5, 0.001);
        this.ring(o, t, 1480 * p, 0.12, 0.7);
        break;
      }
      case 'parry': {
        const o = this.out(pos, 1.1);
        this.noiseBurst(o, t, 0.06, 'highpass', 4200, 3000, 0.6, 0.6, 0.001);
        this.ring(o, t, 1320, 0.16, 1.6);
        this.ring(o, t + 0.01, 2210, 0.07, 1.2);
        this.tone(o, t, 0.5, 120, 60, 0.35);
        break;
      }
      case 'glint': {
        const o = this.out(pos, 0.5);
        this.tone(o, t, 0.5, 3150, 3150, 0.07, 'sine', 0.01);
        this.tone(o, t + 0.03, 0.45, 4720, 4720, 0.04, 'sine', 0.01);
        break;
      }
      case 'warn': {
        const o = this.out(pos, 0.7);
        this.tone(o, t, 0.6, 196, 170, 0.18, 'triangle', 0.02);
        this.tone(o, t, 0.6, 2600, 2500, 0.05, 'sine', 0.01);
        break;
      }
      case 'impact': {
        const o = this.out(pos, 1);
        this.tone(o, t, 0.45, 70, 38, 0.6);
        this.noiseBurst(o, t, 0.35, 'lowpass', 700, 120, 0.7, 0.5, 0.005);
        break;
      }
      case 'dodge': {
        const o = this.out(null, 0.7);
        this.noiseBurst(o, t, 0.22, 'bandpass', 420, 900, 0.9, 0.35, 0.03);
        break;
      }
      case 'charge': {
        const o = this.out(null, 0.6);
        this.tone(o, t, 0.5, 520, 1560, 0.06, 'sine', 0.05);
        this.ring(o, t + 0.05, 2400, 0.03, 0.6);
        break;
      }
      case 'wave': {
        const o = this.out(null, 0.7);
        this.tone(o, t, 1.8, 98, 96, 0.22, 'triangle', 0.08);
        this.tone(o, t + 0.25, 1.6, 147, 145, 0.12, 'triangle', 0.08);
        break;
      }
      default:
        break;
    }
  }
}
