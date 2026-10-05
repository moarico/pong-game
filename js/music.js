// Music, played live on Web Audio (no files): a laid-back lobby theme, a driving tune for the ride in the
// Sky Coach, and a fanfare for the win. A small step sequencer schedules notes a moment ahead of time on
// pads, a bass, a plucked arpeggio and a drum kit, all into one bus with a touch of echo.

const N = (name) => {
  const m = /^([A-G])(#|b)?(\d)$/.exec(name);
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * Math.pow(2, (base + (+m[3] + 1) * 12 - 69) / 12);
};
const chord = (...names) => names.map(N);

// Each track: tempo, swing, chords (one per bar), and patterns over 16 steps per bar.
const TRACKS = {
  lobby: {
    bpm: 96, bars: 8, gain: 0.9,
    chords: [chord('F3', 'A3', 'C4', 'E4'), chord('C3', 'E3', 'G3', 'D4'), chord('D3', 'F3', 'A3', 'C4'), chord('Bb2', 'D3', 'F3', 'A3'),
      chord('F3', 'A3', 'C4', 'E4'), chord('C3', 'E3', 'G3', 'B3'), chord('D3', 'F3', 'A3', 'E4'), chord('Bb2', 'D3', 'F3', 'C4')],
    bass: [N('F2'), N('C2'), N('D2'), N('Bb1'), N('F2'), N('C2'), N('D2'), N('Bb1')],
    kick: 'x.....x...x.....', snare: '....x.......x...', hat: '..x...x...x...x.', arp: 'x.x.x.x.x.x.x.x.', arpOct: 2, arpDecay: 0.32, pad: 0.11, padCut: 1400,
  },
  bus: {
    bpm: 122, bars: 8, gain: 0.9,
    chords: [chord('D3', 'F3', 'A3', 'C4'), chord('Bb2', 'D3', 'F3', 'A3'), chord('F3', 'A3', 'C4', 'E4'), chord('C3', 'E3', 'G3', 'B3'),
      chord('D3', 'F3', 'A3', 'E4'), chord('Bb2', 'D3', 'F3', 'C4'), chord('F3', 'A3', 'C4', 'G4'), chord('A2', 'C#3', 'E3', 'G3')],
    bass: [N('D2'), N('Bb1'), N('F2'), N('C2'), N('D2'), N('Bb1'), N('F2'), N('A1')],
    kick: 'x...x...x...x...', snare: '....x.......x..x', hat: 'xxxxxxxxxxxxxxxx', arp: 'xxxxxxxxxxxxxxxx', arpOct: 2, arpDecay: 0.18, pad: 0.08, padCut: 2200,
  },
};

export class Music {
  constructor(audio) {
    this.audio = audio;
    this.track = null;
    this.level = 0.5;
    this.bus = null;
    this.timer = null;
  }

  setup() {
    const c = this.audio.ctx;
    if (this.bus || !c || !this.audio.master) return !!this.bus;
    this.bus = c.createGain();
    this.bus.gain.value = this.level * 0.5;
    this.bus.connect(this.audio.master);
    // a dotted-eighth echo shared by the plucks
    this.echo = c.createDelay(1);
    this.echo.delayTime.value = 0.42;
    const fb = c.createGain();
    fb.gain.value = 0.32;
    const tone = c.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2400;
    this.echoIn = c.createGain();
    this.echoIn.gain.value = 0.35;
    this.echoIn.connect(this.echo);
    this.echo.connect(tone);
    tone.connect(fb);
    fb.connect(this.echo);
    tone.connect(this.bus);
    // a second of white noise for the drums
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = nb;
    return true;
  }

  setLevel(v) {
    this.level = v;
    if (this.bus) this.bus.gain.setTargetAtTime(v * 0.5, this.audio.ctx.currentTime, 0.1);
  }

  // name: 'lobby' | 'bus' | null
  play(name) {
    if (name === this.trackName) return;
    if (!this.setup()) return;
    this.trackName = name;
    const c = this.audio.ctx;
    window.clearInterval(this.timer);
    this.timer = null;
    // fade whatever is playing out, then start the new one on a fresh gain
    if (this.out) {
      const g = this.out;
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.setValueAtTime(g.gain.value, c.currentTime);
      g.gain.linearRampToValueAtTime(0, c.currentTime + 1.2);
      setTimeout(() => g.disconnect(), 1500);
      this.out = null;
    }
    const T = TRACKS[name];
    if (!T) return;
    this.track = T;
    this.out = c.createGain();
    this.out.gain.setValueAtTime(0, c.currentTime);
    this.out.gain.linearRampToValueAtTime(T.gain, c.currentTime + 1.5);
    this.out.connect(this.bus);
    this.step = 0;
    this.next = c.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 40);
    this.schedule();
  }

  schedule() {
    const c = this.audio.ctx, T = this.track;
    if (!c || !T || !this.out) return;
    const dt = 60 / T.bpm / 4;
    while (this.next < c.currentTime + 0.25) {
      const bar = Math.floor(this.step / 16) % T.bars, st = this.step % 16, t = this.next;
      const ch = T.chords[bar];
      if (st === 0) this.pad(t, ch, dt * 16, T.pad, T.padCut);
      if (st === 0 || st === 8 || (st === 14 && T === TRACKS.bus)) this.bass(t, T.bass[bar] * (st === 14 ? 2 : 1), dt * (st === 14 ? 2 : 6));
      if (T.arp[st] === 'x') {
        const k = this.step % 8;
        const notes = [...ch, ...ch.map((f) => f * 2)];
        this.pluck(t, notes[[0, 2, 1, 3, 4, 3, 2, 5][k] % notes.length] * T.arpOct, T.arpDecay);
      }
      if (T.kick[st] === 'x') this.kick(t);
      if (T.snare[st] === 'x') this.snare(t);
      if (T.hat[st] === 'x') this.hat(t, st % 4 === 2 ? 0.5 : 0.28);
      this.step++;
      this.next += dt;
    }
  }

  env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  pad(t, freqs, dur, vol, cut) {
    const c = this.audio.ctx;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cut;
    f.Q.value = 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.5);
    g.gain.setValueAtTime(vol, t + dur - 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);
    f.connect(g);
    g.connect(this.out);
    for (const fr of freqs) {
      for (const det of [-6, 7]) {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = fr;
        o.detune.value = det;
        o.connect(f);
        o.start(t);
        o.stop(t + dur + 0.5);
      }
    }
  }

  bass(t, f0, dur) {
    const c = this.audio.ctx;
    const o = c.createOscillator(), s = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth';
    s.type = 'sine';
    o.frequency.value = f0;
    s.frequency.value = f0;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(220, t + 0.25);
    this.env(g, t, 0.01, 0.32, dur);
    o.connect(f);
    s.connect(g);
    f.connect(g);
    g.connect(this.out);
    o.start(t);
    s.start(t);
    o.stop(t + dur + 0.1);
    s.stop(t + dur + 0.1);
  }

  pluck(t, f0, decay) {
    const c = this.audio.ctx;
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'square';
    o.frequency.value = f0;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(4200, t);
    f.frequency.exponentialRampToValueAtTime(700, t + decay);
    this.env(g, t, 0.004, 0.07, decay);
    o.connect(f);
    f.connect(g);
    g.connect(this.out);
    g.connect(this.echoIn);
    o.start(t);
    o.stop(t + decay + 0.05);
  }

  kick(t) {
    const c = this.audio.ctx;
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    this.env(g, t, 0.002, 0.9, 0.28);
    o.connect(g);
    g.connect(this.out);
    o.start(t);
    o.stop(t + 0.35);
  }

  snare(t) {
    const c = this.audio.ctx;
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = this.noise;
    f.type = 'bandpass';
    f.frequency.value = 1900;
    f.Q.value = 0.8;
    this.env(g, t, 0.002, 0.45, 0.16);
    n.connect(f);
    f.connect(g);
    g.connect(this.out);
    n.start(t, Math.random() * 0.5);
    n.stop(t + 0.2);
    const o = c.createOscillator(), og = c.createGain();
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    this.env(og, t, 0.002, 0.25, 0.09);
    o.connect(og);
    og.connect(this.out);
    o.start(t);
    o.stop(t + 0.12);
  }

  hat(t, vol) {
    const c = this.audio.ctx;
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = this.noise;
    f.type = 'highpass';
    f.frequency.value = 7500;
    this.env(g, t, 0.001, vol * 0.35, 0.045);
    n.connect(f);
    f.connect(g);
    g.connect(this.out);
    n.start(t, Math.random() * 0.5);
    n.stop(t + 0.06);
  }

  // The win: a rising brass-ish fanfare over a big chord.
  fanfare() {
    if (!this.setup()) return;
    this.play(null);
    const c = this.audio.ctx, t0 = c.currentTime + 0.15;
    const out = c.createGain();
    out.gain.value = 1;
    out.connect(this.bus);
    const prev = this.out;
    this.out = out;
    const notes = [[0, 'C4', 0.18], [0.18, 'E4', 0.18], [0.36, 'G4', 0.18], [0.54, 'C5', 0.5], [1.1, 'A4', 0.18], [1.28, 'C5', 0.18], [1.46, 'E5', 1.4]];
    for (const [dt, n, dur] of notes) {
      const t = t0 + dt;
      for (const det of [-5, 5]) {
        const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
        o.type = 'sawtooth';
        o.frequency.value = N(n);
        o.detune.value = det;
        f.type = 'lowpass';
        f.frequency.setValueAtTime(800, t);
        f.frequency.linearRampToValueAtTime(3200, t + 0.06);
        this.env(g, t, 0.02, 0.09, dur);
        o.connect(f);
        f.connect(g);
        g.connect(out);
        o.start(t);
        o.stop(t + dur + 0.1);
      }
      this.kick(t);
    }
    this.pad(t0 + 1.46, chord('C3', 'G3', 'C4', 'E4'), 2.4, 0.12, 2400);
    this.snare(t0 + 1.46);
    setTimeout(() => {
      out.disconnect();
      if (this.out === out) this.out = prev;
    }, 5000);
  }

  stop() {
    this.play(null);
  }
}
