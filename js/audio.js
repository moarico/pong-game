import * as THREE from 'three';
import { clamp } from './util.js';

const _v = new THREE.Vector3(), _r = new THREE.Vector3();

// All sounds are synthesized with WebAudio, so the game needs no audio files.
export class AudioSystem {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.master = null;
    this.volume = 0.7;
    this.noise = null;
    this.engineNodes = null;
    this.lastPlay = new Map();
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp);
    comp.connect(this.ctx.destination);
    const len = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  // Output chain with distance attenuation and stereo pan relative to the camera.
  out(pos, vol, range) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    let gain = vol;
    let pan = 0;
    if (pos) {
      const cam = this.game.camera;
      _v.subVectors(pos, cam.position);
      const d = _v.length();
      if (d > range) return null;
      gain *= Math.pow(1 - d / range, 2);
      if (d > 0.5) {
        _r.set(1, 0, 0).applyQuaternion(cam.quaternion);
        pan = clamp(_v.normalize().dot(_r), -1, 1) * 0.8;
      }
    }
    if (gain < 0.01) return null;
    g.gain.value = gain;
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      p.connect(this.master);
    } else g.connect(this.master);
    return g;
  }

  tone(dest, type, f0, f1, t0, dur, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.01, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  burst(dest, filterType, f0, f1, t0, dur, vol, q = 1) {
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = this.noise;
    s.playbackRate.value = 0.7 + Math.random() * 0.6;
    const f = ctx.createBiquadFilter();
    f.type = filterType;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f);
    f.connect(g);
    g.connect(dest);
    s.start(t0, Math.random() * 0.5);
    s.stop(t0 + dur + 0.05);
  }

  play(name, pos = null, vol = 1) {
    if (!this.ctx || this.volume <= 0) return;
    const now = this.ctx.currentTime;
    // Avoid stacking dozens of identical sounds in one frame.
    const last = this.lastPlay.get(name) || 0;
    if (now - last < 0.025) return;
    this.lastPlay.set(name, now);
    const t = now + 0.005;
    const far = name.startsWith('shot') || name === 'explosion' ? 280 : 45;
    const dest = this.out(pos, vol, far);
    if (!dest) return;
    switch (name) {
      case 'shot-ar':
        this.burst(dest, 'bandpass', 2200, 500, t, 0.16, 0.9, 0.8);
        this.tone(dest, 'sine', 140, 50, t, 0.1, 0.6);
        break;
      case 'shot-smg':
        this.burst(dest, 'bandpass', 3000, 900, t, 0.09, 0.7, 0.9);
        this.tone(dest, 'sine', 180, 70, t, 0.06, 0.4);
        break;
      case 'shot-pistol':
        this.burst(dest, 'bandpass', 2600, 700, t, 0.12, 0.8, 1);
        this.tone(dest, 'sine', 200, 80, t, 0.08, 0.5);
        break;
      case 'shot-shotgun':
        this.burst(dest, 'lowpass', 2400, 200, t, 0.45, 1.1, 0.7);
        this.tone(dest, 'sine', 90, 40, t, 0.2, 0.9);
        this.burst(dest, 'highpass', 900, 1500, t + 0.35, 0.08, 0.25);
        this.burst(dest, 'highpass', 1200, 1800, t + 0.55, 0.06, 0.25);
        break;
      case 'shot-sniper':
        this.burst(dest, 'highpass', 4000, 1200, t, 0.08, 1.0, 0.7);
        this.burst(dest, 'lowpass', 1800, 120, t, 0.9, 0.7, 0.5);
        this.tone(dest, 'sine', 110, 40, t, 0.25, 0.8);
        break;
      case 'shot-rocket':
        this.burst(dest, 'bandpass', 400, 2400, t, 0.6, 0.8, 1.5);
        this.tone(dest, 'sawtooth', 80, 40, t, 0.3, 0.2);
        break;
      case 'explosion':
        this.burst(dest, 'lowpass', 1200, 60, t, 1.4, 1.4, 0.4);
        this.tone(dest, 'sine', 70, 25, t, 0.8, 1.0);
        break;
      case 'hit':
        this.tone(dest, 'square', 1300, 1100, t, 0.04, 0.12);
        break;
      case 'headshot':
        this.tone(dest, 'sine', 1900, 1900, t, 0.18, 0.25);
        this.tone(dest, 'sine', 2850, 2850, t + 0.02, 0.2, 0.15);
        break;
      case 'hurt':
        this.tone(dest, 'sine', 160, 70, t, 0.18, 0.5);
        break;
      case 'reload':
        this.burst(dest, 'bandpass', 3000, 2500, t, 0.04, 0.4, 4);
        this.burst(dest, 'bandpass', 2200, 1800, t + 0.25, 0.05, 0.4, 4);
        break;
      case 'empty':
        this.tone(dest, 'square', 900, 700, t, 0.03, 0.15);
        break;
      case 'swing':
        this.burst(dest, 'bandpass', 600, 1800, t, 0.16, 0.25, 1);
        break;
      case 'chop':
        this.tone(dest, 'sine', 240, 160, t, 0.12, 0.6);
        this.burst(dest, 'bandpass', 1400, 600, t, 0.1, 0.5, 2);
        break;
      case 'stone':
        this.tone(dest, 'sine', 420, 300, t, 0.08, 0.5);
        this.burst(dest, 'highpass', 2500, 1500, t, 0.12, 0.5, 1);
        break;
      case 'clang':
        this.tone(dest, 'triangle', 880, 860, t, 0.4, 0.35);
        this.tone(dest, 'triangle', 1330, 1300, t, 0.3, 0.2);
        break;
      case 'thunk':
        this.tone(dest, 'sine', 200, 90, t, 0.1, 0.5);
        break;
      case 'crit':
        this.tone(dest, 'sine', 1800, 3200, t, 0.18, 0.25);
        break;
      case 'build':
        this.tone(dest, 'sine', 180, 70, t, 0.14, 0.6);
        this.burst(dest, 'lowpass', 1500, 300, t, 0.12, 0.4);
        break;
      case 'break':
        this.burst(dest, 'lowpass', 2500, 200, t, 0.5, 0.9, 0.6);
        this.tone(dest, 'sine', 120, 50, t, 0.25, 0.5);
        break;
      case 'edit':
        this.tone(dest, 'square', 700, 1100, t, 0.06, 0.12);
        break;
      case 'deny':
        this.tone(dest, 'square', 160, 140, t, 0.12, 0.12);
        break;
      case 'pickup':
        this.tone(dest, 'sine', 880, 880, t, 0.08, 0.25);
        this.tone(dest, 'sine', 1320, 1320, t + 0.06, 0.12, 0.25);
        break;
      case 'pickupSmall':
        this.tone(dest, 'sine', 1200, 1500, t, 0.06, 0.12);
        break;
      case 'chestCue':
        for (let i = 0; i < 5; i++) this.tone(dest, 'sine', 2100 + Math.random() * 1600, 2100 + Math.random() * 1600, t + i * 0.07, 0.25, 0.12);
        break;
      case 'chestOpen':
        [660, 880, 1100, 1320, 1760].forEach((f, i) => this.tone(dest, 'triangle', f, f, t + i * 0.06, 0.3, 0.25));
        break;
      case 'healed':
        this.tone(dest, 'sine', 660, 1320, t, 0.3, 0.25);
        break;
      case 'glider':
        this.burst(dest, 'bandpass', 300, 900, t, 0.7, 0.5, 0.8);
        break;
      case 'land':
        this.tone(dest, 'sine', 120, 50, t, 0.15, 0.6);
        break;
      case 'stormWarn':
        this.tone(dest, 'sawtooth', 110, 90, t, 1.2, 0.15);
        this.tone(dest, 'sine', 440, 330, t, 0.9, 0.18);
        break;
      case 'flare':
        this.tone(dest, 'sine', 600, 2200, t, 1.2, 0.18);
        break;
      case 'elim':
        [523, 659, 784].forEach((f) => this.tone(dest, 'triangle', f, f, t, 0.5, 0.2));
        break;
      case 'victory':
        [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(dest, 'triangle', f, f, t + i * 0.14, 0.7, 0.3));
        break;
      case 'defeat':
        [440, 392, 330, 262].forEach((f, i) => this.tone(dest, 'triangle', f, f, t + i * 0.18, 0.5, 0.25));
        break;
      case 'crash':
        this.burst(dest, 'lowpass', 1800, 200, t, 0.5, 1, 0.6);
        break;
      case 'ui':
        this.tone(dest, 'sine', 1000, 1250, t, 0.05, 0.15);
        break;
      case 'uiBack':
        this.tone(dest, 'sine', 900, 650, t, 0.06, 0.15);
        break;
      case 'busJump':
        this.burst(dest, 'bandpass', 500, 1500, t, 0.5, 0.5, 0.7);
        break;
    }
  }

  startEngine() {
    if (!this.ctx || this.engineNodes) return;
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 40;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 400;
    const g = this.ctx.createGain();
    g.gain.value = 0.08;
    o.connect(f);
    f.connect(g);
    g.connect(this.master);
    o.start();
    this.engineNodes = { o, f, g };
  }

  engine(level) {
    if (!this.engineNodes) return;
    const t = this.ctx.currentTime;
    this.engineNodes.o.frequency.setTargetAtTime(40 + level * 90, t, 0.1);
    this.engineNodes.f.frequency.setTargetAtTime(350 + level * 900, t, 0.1);
  }

  stopEngine() {
    if (!this.engineNodes) return;
    try {
      this.engineNodes.o.stop();
    } catch {
      /* already stopped */
    }
    this.engineNodes = null;
  }
}
