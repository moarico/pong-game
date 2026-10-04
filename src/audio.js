// All sounds are synthesized with WebAudio, so the game ships without audio files.
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.7;
    this.engines = [];
    this.cineNodes = [];
  }

  init() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      this.ctx = new AC();
    } catch (e) {
      return false;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);
    // shared noise buffer
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b = (b + 0.02 * w) / 1.02; // brownish
      d[i] = w * 0.6 + b * 3;
    }
    // crowd ambience
    const crowdSrc = this.loopNoise();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 700;
    bp.Q.value = 0.6;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.23;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.015;
    this.crowdGain = ctx.createGain();
    this.crowdGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(this.crowdGain.gain);
    crowdSrc.connect(bp).connect(this.crowdGain).connect(this.master);
    lfo.start();
    return true;
  }

  resume() {
    if (!this.init()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  get ready() { return this.ctx && this.ctx.state === 'running'; }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  loopNoise() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.loopStart = Math.random();
    src.start(0, Math.random() * 1.5);
    return src;
  }

  burst({ dur = 0.2, gain = 0.5, freq = 1200, endFreq = null, type = 'lowpass', q = 0.7, pan = 0, delay = 0 }) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (endFreq) f.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    let node = src.connect(f).connect(g);
    if (p) { p.pan.value = pan; node = node.connect(p); }
    node.connect(this.master);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  tone({ freq = 440, endFreq = null, dur = 0.2, gain = 0.3, type = 'sine', delay = 0, attack = 0.005 }) {
    if (!this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // ----- engine loops (one per local player)
  createEngine(pan = 0) {
    if (!this.ctx) return null;
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; out.connect(p).connect(this.master); } else out.connect(this.master);
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth';
    const o2 = ctx.createOscillator(); o2.type = 'square';
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.5;
    o1.connect(lp); o2.connect(g2).connect(lp);
    lp.connect(out);
    o1.start(); o2.start();
    // boost hiss
    const bn = this.loopNoise();
    const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 900; bf.Q.value = 0.5;
    const bg = ctx.createGain(); bg.gain.value = 0;
    bn.connect(bf).connect(bg);
    if (p) bg.connect(p); else bg.connect(this.master);
    const e = { out, o1, o2, lp, bg, bf, nodes: [o1, o2, bn] };
    this.engines.push(e);
    return e;
  }

  updateEngine(e, speed, throttle, boosting, onGround, active) {
    if (!e || !this.ctx) return;
    const t = this.ctx.currentTime;
    const th = Math.abs(throttle);
    const f = 38 + speed * 0.05 + th * 14;
    e.o1.frequency.setTargetAtTime(f, t, 0.06);
    e.o2.frequency.setTargetAtTime(f * 0.5, t, 0.06);
    e.lp.frequency.setTargetAtTime(240 + speed * 0.9 + th * 700, t, 0.08);
    e.out.gain.setTargetAtTime(active ? 0.05 + th * 0.06 + (onGround ? 0.02 : 0) : 0, t, 0.1);
    e.bg.gain.setTargetAtTime(active && boosting ? 0.22 : 0, t, 0.04);
    e.bf.frequency.setTargetAtTime(boosting ? 700 + speed * 0.4 : 900, t, 0.1);
  }

  stopEngine(e) {
    if (!e) return;
    try { e.out.gain.value = 0; e.bg.gain.value = 0; for (const n of e.nodes) n.stop(); } catch (err) { /* already stopped */ }
    this.engines = this.engines.filter((x) => x !== e);
  }

  stopEngines() {
    for (const e of this.engines) {
      try { e.out.gain.value = 0; e.bg.gain.value = 0; for (const n of e.nodes) n.stop(); } catch (err) { /* already stopped */ }
    }
    this.engines = [];
  }

  // ----- one shots
  hit(strength, pan = 0) {
    const s = Math.min(1, strength / 3500);
    this.burst({ dur: 0.12 + s * 0.15, gain: 0.25 + s * 0.6, freq: 900 + s * 3000, endFreq: 200, pan });
    this.tone({ freq: 140, endFreq: 45, dur: 0.18 + s * 0.15, gain: 0.25 + s * 0.5 });
    if (s > 0.6) this.burst({ dur: 0.35, gain: 0.25 * s, freq: 4000, endFreq: 800, type: 'highpass', pan });
  }

  bounce(strength) {
    const s = Math.min(1, strength / 2500);
    this.tone({ freq: 90, endFreq: 40, dur: 0.15, gain: 0.08 + s * 0.2 });
    this.burst({ dur: 0.08, gain: 0.05 + s * 0.15, freq: 600, endFreq: 150 });
  }

  bump() {
    this.burst({ dur: 0.18, gain: 0.5, freq: 1500, endFreq: 200 });
    this.tone({ freq: 220, endFreq: 70, dur: 0.15, gain: 0.3, type: 'triangle' });
  }

  demo() {
    this.burst({ dur: 0.9, gain: 0.9, freq: 3000, endFreq: 80 });
    this.tone({ freq: 90, endFreq: 30, dur: 0.7, gain: 0.7 });
    this.burst({ dur: 0.5, gain: 0.3, freq: 6000, endFreq: 1500, type: 'highpass', delay: 0.05 });
  }

  goal() {
    this.burst({ dur: 1.8, gain: 1.0, freq: 4000, endFreq: 60 });
    this.tone({ freq: 70, endFreq: 25, dur: 1.2, gain: 0.9 });
    this.burst({ dur: 0.6, gain: 0.4, freq: 7000, endFreq: 2000, type: 'highpass', delay: 0.05 });
    this.cheer(1);
  }

  cheer(amount) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const g = this.crowdGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.05 + 0.35 * amount, t + 0.4);
    g.linearRampToValueAtTime(0.05 + 0.25 * amount, t + 2.5);
    g.linearRampToValueAtTime(0.05, t + 6);
    // a few "voices"
    for (let i = 0; i < 6; i++) {
      this.burst({ dur: 1.2 + Math.random(), gain: 0.06 * amount, freq: 500 + Math.random() * 900, type: 'bandpass', q: 4, delay: Math.random() * 1.2, pan: Math.random() * 2 - 1 });
    }
  }

  boostPickup(big) {
    if (big) {
      this.tone({ freq: 520, endFreq: 1200, dur: 0.18, gain: 0.12, type: 'triangle' });
      this.tone({ freq: 780, endFreq: 1600, dur: 0.2, gain: 0.08, type: 'triangle', delay: 0.06 });
    } else {
      this.tone({ freq: 1100, endFreq: 1500, dur: 0.07, gain: 0.06, type: 'triangle' });
    }
  }

  jump() { this.burst({ dur: 0.16, gain: 0.12, freq: 700, endFreq: 2400, type: 'bandpass', q: 1.2 }); }
  dodge() { this.burst({ dur: 0.25, gain: 0.16, freq: 1800, endFreq: 500, type: 'bandpass', q: 1 }); }
  land(strength) { this.tone({ freq: 70, endFreq: 40, dur: 0.12, gain: Math.min(0.25, strength / 3000) }); }

  beep(go) {
    this.tone({ freq: go ? 880 : 523, dur: go ? 0.5 : 0.18, gain: 0.25, type: 'square' });
    this.tone({ freq: go ? 1760 : 1046, dur: go ? 0.45 : 0.15, gain: 0.08, type: 'sine' });
  }

  horn() {
    for (const f of [220, 277, 330]) this.tone({ freq: f, dur: 1.4, gain: 0.12, type: 'sawtooth', attack: 0.04 });
  }

  itemGet() {
    this.tone({ freq: 660, endFreq: 990, dur: 0.12, gain: 0.08, type: 'triangle' });
    this.tone({ freq: 990, endFreq: 1320, dur: 0.14, gain: 0.07, type: 'triangle', delay: 0.08 });
  }

  itemUse(item, vol = 1) {
    const v = Math.max(0.2, vol);
    switch (item) {
      case 'grapple':
      case 'plunger':
        this.burst({ dur: 0.25, gain: 0.25 * v, freq: 2500, endFreq: 700, type: 'bandpass', q: 2 });
        break;
      case 'tornado':
        this.burst({ dur: 2.5, gain: 0.35 * v, freq: 300, endFreq: 1400, type: 'bandpass', q: 0.8 });
        this.burst({ dur: 3, gain: 0.2 * v, freq: 900, endFreq: 400, type: 'bandpass', q: 3, delay: 0.3 });
        break;
      case 'freezer':
        this.tone({ freq: 1800, endFreq: 3200, dur: 0.4, gain: 0.12 * v, type: 'sine' });
        this.burst({ dur: 0.5, gain: 0.25 * v, freq: 6000, endFreq: 3000, type: 'highpass' });
        break;
      case 'curveball':
        this.tone({ freq: 300, endFreq: 1200, dur: 0.5, gain: 0.15 * v, type: 'sawtooth' });
        break;
      case 'power':
      case 'spikes':
        this.tone({ freq: 140, endFreq: 420, dur: 0.35, gain: 0.25 * v, type: 'square' });
        break;
      default:
        this.burst({ dur: 0.2, gain: 0.3 * v, freq: 1200, endFreq: 200 });
    }
  }

  hook(vol = 1) {
    this.tone({ freq: 900, endFreq: 500, dur: 0.12, gain: 0.2 * Math.max(0.2, vol), type: 'square' });
    this.burst({ dur: 0.1, gain: 0.2 * Math.max(0.2, vol), freq: 4000, endFreq: 1500, type: 'highpass' });
  }

  // ----- victory cinematic
  cine(name) {
    if (!this.ready) return;
    const ctx = this.ctx;
    switch (name) {
      case 'rise': // fanfare
        [523, 659, 784, 1046].forEach((f, i) => this.tone({ freq: f, dur: 0.9, gain: 0.09, type: 'triangle', delay: i * 0.11, attack: 0.02 }));
        this.tone({ freq: 131, dur: 1.6, gain: 0.18, type: 'sawtooth', attack: 0.05 });
        break;
      case 'flap':
        this.burst({ dur: 1.0, gain: 0.25, freq: 3000, endFreq: 500, type: 'bandpass', q: 1.5 });
        this.tone({ freq: 160, endFreq: 70, dur: 0.6, gain: 0.25, type: 'square' });
        break;
      case 'clunk':
        this.tone({ freq: 70, endFreq: 30, dur: 0.5, gain: 0.7 });
        this.burst({ dur: 0.4, gain: 0.6, freq: 1500, endFreq: 100 });
        break;
      case 'build':
        this.tone({ freq: 90, endFreq: 900, dur: 2.6, gain: 0.12, type: 'sawtooth', attack: 0.3 });
        for (let i = 0; i < 12; i++) this.tone({ freq: 700 + i * 90, dur: 0.12, gain: 0.05, type: 'square', delay: i * 0.2 });
        break;
      case 'launch':
        this.burst({ dur: 1.4, gain: 0.7, freq: 500, endFreq: 3000, type: 'bandpass', q: 0.7 });
        this.tone({ freq: 60, endFreq: 120, dur: 1.2, gain: 0.4, type: 'sawtooth' });
        break;
      case 'whoosh':
        this.burst({ dur: 1.3, gain: 0.5, freq: 300, endFreq: 4000, type: 'bandpass', q: 1.2 });
        break;
      case 'boom':
        this.burst({ dur: 2.6, gain: 1.0, freq: 3500, endFreq: 40 });
        this.tone({ freq: 60, endFreq: 18, dur: 2.4, gain: 1.0 });
        this.burst({ dur: 0.8, gain: 0.5, freq: 7000, endFreq: 1500, type: 'highpass', delay: 0.03 });
        break;
      case 'tear':
        this.burst({ dur: 3.0, gain: 0.8, freq: 200, endFreq: 1200, type: 'lowpass' });
        for (let i = 0; i < 8; i++) this.burst({ dur: 0.3, gain: 0.35, freq: 2500, endFreq: 300, delay: Math.random() * 2.5 });
        break;
      case 'drone':
        this.startDrone(32, 0.55);
        break;
      case 'space': {
        this.stopCine(1.5);
        this.startDrone(24, 0.45);
        // a cold, wide pad
        const t = ctx.currentTime;
        const out = ctx.createGain();
        out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(0.06, t + 3);
        out.connect(this.master);
        const srcs = [110, 164.8, 220.5, 329.6].map((f, i) => {
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.value = f * (1 + (i % 2 ? 0.003 : -0.002));
          o.connect(out);
          o.start(t);
          return o;
        });
        this.cineNodes.push({ out, srcs });
        break;
      }
      case 'gulp':
        this.tone({ freq: 180, endFreq: 20, dur: 1.6, gain: 0.8 });
        this.burst({ dur: 1.5, gain: 0.6, freq: 1200, endFreq: 60 });
        break;
      case 'bigboom':
        this.stopCine(0.2);
        this.burst({ dur: 5.0, gain: 1.0, freq: 5000, endFreq: 30 });
        this.tone({ freq: 50, endFreq: 15, dur: 4.5, gain: 1.0 });
        this.tone({ freq: 100, endFreq: 25, dur: 3.0, gain: 0.6, type: 'sawtooth' });
        this.burst({ dur: 1.5, gain: 0.6, freq: 8000, endFreq: 2000, type: 'highpass', delay: 0.05 });
        this.burst({ dur: 4.0, gain: 0.5, freq: 600, endFreq: 80, delay: 0.6 });
        break;
      case 'stop':
        this.stopCine(0.6);
        break;
      default:
        break;
    }
  }

  // a deep rumbling drone that keeps rising until stopped
  startDrone(base, gain) {
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(gain, t + 1.5);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(140, t);
    lp.frequency.linearRampToValueAtTime(700, t + 9);
    lp.Q.value = 3;
    lp.connect(out).connect(this.master);
    const srcs = [1, 1.012, 0.5].map((m) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(base * m, t);
      o.frequency.linearRampToValueAtTime(base * m * 1.8, t + 10);
      o.connect(lp);
      o.start(t);
      return o;
    });
    const n = this.loopNoise();
    const ng = ctx.createGain();
    ng.gain.value = 0.6;
    n.connect(ng).connect(lp);
    srcs.push(n);
    this.cineNodes = this.cineNodes || [];
    this.cineNodes.push({ out, srcs });
  }

  stopCine(fade = 0.5) {
    if (!this.ctx || !this.cineNodes) return;
    const t = this.ctx.currentTime;
    for (const c of this.cineNodes) {
      try {
        c.out.gain.cancelScheduledValues(t);
        c.out.gain.setValueAtTime(Math.max(0.0001, c.out.gain.value), t);
        c.out.gain.exponentialRampToValueAtTime(0.0001, t + fade);
        for (const s of c.srcs) s.stop(t + fade + 0.05);
      } catch (err) { /* already stopped */ }
    }
    this.cineNodes = [];
  }

  click() { this.tone({ freq: 1400, dur: 0.04, gain: 0.05, type: 'square' }); }
  select() { this.tone({ freq: 900, endFreq: 1400, dur: 0.09, gain: 0.08, type: 'triangle' }); }
}
