// Sound, ported from Zero Hour's SOUND v2. Everything is synthesized in the browser (no files), built the
// way game audio is layered: guns = crack + blast + low thump + action clack + room reflections + tail,
// several variants each, plus a separate distant version. Positional sounds go through an HRTF panner so
// you can hear front/behind/left/right, arrive late with distance (speed of sound), and your own gun ducks
// the world. Battle royale sounds (chests, building, gliding, the storm, the coach) are made the same way.
import * as THREE from 'three';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rand = (a, b) => a + (b - a) * Math.random();

// ---------- DSP helpers ----------
// Buffers are synthesized by a generator that pauses every 4k samples, so the whole set can be built in the
// background a slice at a time without freezing the game. mk2 runs one to completion.
function runJob(it) {
  let r;
  while (!(r = it.next()).done);
  return r.value;
}
let CTX = null;
function mk2(dur, fn, peak, stereo, rate) {
  try {
    return runJob(mk2gen(dur, fn, peak, stereo, rate));
  } catch (e) {
    console.warn('sound build failed', e);
    return CTX.createBuffer(1, 64, CTX.sampleRate);
  }
}
function* mk2gen(dur, fn, peak, stereo, rate) {
  const c = CTX, sr = rate || c.sampleRate, n = Math.max(1, Math.floor(dur * sr)), ch = stereo ? 2 : 1, b = c.createBuffer(ch, n, sr);
  for (let k = 0; k < ch; k++) {
    const d = b.getChannelData(k), s = { k };
    for (let i = 0; i < n; i++) {
      d[i] = fn(i / sr, s, sr, k);
      if ((i & 4095) === 4095) yield;
    }
  }
  let m = 1e-6;
  for (let k = 0; k < ch; k++) {
    const d = b.getChannelData(k);
    for (let i = 0; i < n; i++) {
      const v = d[i];
      if (v > m) m = v;
      else if (-v > m) m = -v;
    }
    yield;
  }
  const g = (peak || 0.95) / m, f = Math.min(n, Math.floor(sr * 0.006));
  for (let k = 0; k < ch; k++) {
    const d = b.getChannelData(k);
    for (let i = 0; i < n; i++) d[i] *= g;
    for (let i = 0; i < f; i++) d[n - 1 - i] *= i / f;
    yield;
  }
  return b;
}
// Filter state lives in small objects named by key, with coefficients cached until the cutoff changes.
const lpf = (s, k, x, fc, sr) => {
  const m = s.L || (s.L = {});
  let f = m[k];
  if (f === undefined) f = m[k] = { y: 0, fc: -1, a: 0 };
  if (f.fc !== fc) {
    f.fc = fc;
    f.a = 1 - Math.exp((-TAU * fc) / sr);
  }
  return (f.y += f.a * (x - f.y));
};
// State-variable filter, 2x oversampled so it stays stable at high cutoffs; q = resonance. The result object is reused.
const SVO = { l: 0, b: 0, h: 0 };
function svf(s, k, x, fc, q, sr) {
  const m = s.S || (s.S = {});
  let f = m[k];
  if (f === undefined) f = m[k] = { l: 0, b: 0, fc: -1, q: -1, f: 0, d: 0 };
  if (f.fc !== fc) {
    f.fc = fc;
    f.f = 2 * fsin((Math.PI * Math.min(fc, sr * 0.45)) / (2 * sr));
  }
  if (f.q !== q) {
    f.q = q;
    f.d = clamp(1 / Math.max(q, 0.05), 0.08, 1.95);
  }
  let l = f.l, b = f.b, h = 0;
  const ff = f.f, d = f.d;
  for (let i = 0; i < 2; i++) {
    h = x - l - d * b;
    b += ff * h;
    l += ff * b;
  }
  f.l = l;
  f.b = b;
  SVO.l = l;
  SVO.b = b;
  SVO.h = h;
  return SVO;
}
// Envelopes and oscillators read interpolated tables instead of calling Math.exp/Math.sin every sample.
const EXPT = new Float32Array(4098), SINT = new Float32Array(4098);
for (let i = 0; i < 4098; i++) {
  EXPT[i] = Math.exp((-i / 4096) * 24);
  SINT[i] = Math.sin((i / 4096) * TAU);
}
const ex = (t, d) => {
  if (t < 0) return 0;
  const x = (t / d) * 170.66666;
  if (x >= 4096) return 0;
  const i = x | 0;
  return EXPT[i] + (EXPT[i + 1] - EXPT[i]) * (x - i);
};
function fsin(x) {
  let u = x * 651.8986469;
  u -= Math.floor(u * 0.000244140625) * 4096;
  const i = u | 0;
  return SINT[i] + (SINT[i + 1] - SINT[i]) * (u - i);
}

// ---------- guns ----------
const GUNP = {
  ar: { crack: 0.9, bf: 1400, body: 1.0, bd: 0.034, th: 70, thd: 0.075, tha: 0.95, mech: 0.32, mt: 0.011, tail: 0.5, ta: 0.5, peak: 0.9 },
  smg: { crack: 0.22, bf: 680, body: 0.65, bd: 0.028, th: 92, thd: 0.045, tha: 0.55, mech: 0.6, mt: 0.007, tail: 0.2, ta: 0.2, peak: 0.62 },
  sg: { crack: 0.75, bf: 900, body: 1.25, bd: 0.075, th: 50, thd: 0.14, tha: 1.35, mech: 0.18, mt: 0.02, tail: 0.75, ta: 0.78, peak: 0.98 },
  sr: { crack: 1.25, bf: 1150, body: 1.1, bd: 0.06, th: 44, thd: 0.17, tha: 1.4, mech: 0.12, mt: 0.03, tail: 1.15, ta: 0.85, peak: 1.0 },
  lmg: { crack: 0.85, bf: 1250, body: 1.05, bd: 0.045, th: 62, thd: 0.09, tha: 1.05, mech: 0.45, mt: 0.01, tail: 0.55, ta: 0.58, peak: 0.92 },
  pis: { crack: 1.0, bf: 2000, body: 0.8, bd: 0.024, th: 112, thd: 0.04, tha: 0.62, mech: 0.32, mt: 0.006, tail: 0.32, ta: 0.36, peak: 0.74 },
};
// Stormdrop weapon type -> gun sound.
export const GUN_SND = { ar: 'ar', smg: 'smg', shotgun: 'sg', sniper: 'sr', pistol: 'pis', lmg: 'lmg', rocket: 'rocket' };

// filters as small closures, one set per channel, for the hot gunshot loop
function LPf(fc, sr) {
  const a = 1 - Math.exp((-TAU * fc) / sr), y = new Float64Array(1);
  return (x) => (y[0] += a * (x - y[0]));
}
function SVf(fc, q, sr) {
  const f = 2 * Math.sin((Math.PI * Math.min(fc, sr * 0.45)) / (2 * sr)), d = clamp(1 / Math.max(q, 0.05), 0.08, 1.95), st = new Float64Array(2), o = { l: 0, b: 0 };
  return (x) => {
    let l = st[0], b = st[1], h = x - l - d * b;
    b += f * h;
    l += f * b;
    h = x - l - d * b;
    b += f * h;
    l += f * b;
    st[0] = l;
    st[1] = b;
    o.l = l;
    o.b = b;
    return o;
  };
}
const sat = (x) => (x > 3 ? 1 : x < -3 ? -1 : (x * (27 + x * x)) / (27 + 9 * x * x)); // tanh, near enough for a soft clipper
function gunVariant(p, far) {
  const J = (v, a) => v * (1 + (Math.random() * 2 - 1) * a);
  const bf = J(p.bf, 0.08), bd = J(p.bd, 0.1), th = J(p.th, 0.06), tail = J(p.tail, 0.1);
  const refl = [[0.028 + Math.random() * 0.02, 0.3], [0.061 + Math.random() * 0.03, 0.18], [0.11 + Math.random() * 0.05, 0.1]];
  const fn = (t, s, sr, ch) => {
    let F = s.F;
    if (!F) {
      F = s.F = {
        hc: LPf(2600, sr), b: SVf(bf, 0.9, sr), mk: SVf(1300, 0.7, sr), r: [SVf(bf * 0.7, 1.2, sr), SVf(bf * 0.7, 1.2, sr), SVf(bf * 0.7, 1.2, sr)], tl: SVf(480 + ch * 60, 0.7, sr),
        fb: LPf(480, sr), ft: SVf(380 + ch * 50, 0.7, sr), fr: [LPf(420, sr), LPf(420, sr), LPf(420, sr)], out: SVf(far ? 2400 : 6500, 0.6, sr), ph: 0, wd: ch * 0.0045,
      };
    }
    const n = Math.random() * 2 - 1;
    let v = 0;
    if (!far) {
      v += (n - F.hc(n)) * ex(t, 0.0012) * p.crack; // supersonic crack
      v += F.b(n).b * (t < 0.0006 ? t / 0.0006 : 1) * ex(t, bd) * p.body * 2.2; // muzzle blast
      F.ph += (TAU * th * (1 + 3 * ex(t, 0.006))) / sr;
      v += fsin(F.ph) * ex(t, p.thd) * p.tha * 1.45 + fsin(F.ph * 0.5) * ex(t, p.thd * 1.6) * p.tha * 0.5; // chest thump + sub
      const mt = t - p.mt;
      if (mt > 0) v += F.mk(n).b * ex(mt, 0.008) * p.mech * 1.1; // the action cycling
      for (let k = 0; k < 3; k++) {
        const rt = t - refl[k][0] - F.wd * (k + 1);
        if (rt > 0) v += F.r[k](n).b * ex(rt, bd * 1.4) * p.body * refl[k][1] * 1.6; // walls, a little wider in stereo
      }
      v += F.tl(n).l * ex(t, tail * 0.85) * Math.min(1, t / 0.02) * p.ta * (0.9 + 0.1 * fsin(t * 23 + ch)); // rolling tail
      v = sat(v * 0.42) * 2.4; // gentle saturation: denser and punchier, like a recorded shot
    } else {
      const a = t < 0.004 ? t / 0.004 : 1;
      F.ph += (TAU * th * 0.7 * (1 + 1.5 * ex(t, 0.01))) / sr;
      v += fsin(F.ph) * ex(t, p.thd * 1.6) * p.tha * a;
      v += F.fb(n) * ex(t, bd * 3) * p.body * 2.4 * a;
      v += F.ft(n).l * ex(t, tail * 1.8) * Math.min(1, t / 0.03) * p.ta * 1.8 * (0.85 + 0.15 * fsin(t * 17 + ch));
      for (let k = 0; k < 3; k++) {
        const rt = t - refl[k][0] * 3;
        if (rt > 0) v += F.fr[k](n) * ex(rt, 0.08) * refl[k][1] * 1.4;
      }
    }
    return F.out(v).l;
  };
  return mk2gen(far ? tail * 2 + 0.4 : tail * 1.6 + 0.25, fn, far ? 0.8 : p.peak, true, far ? 24000 : 0); // distant shots have no top end to keep
}
// Clicky mechanical handling sounds from a list of [time, type, gain].
function foley(dur, events) {
  const E = events.map(([q, ty, g], i) => [q, ty, g, 'e' + i, 'x' + i]);
  return mk2(dur, (t, s, sr) => {
    let v = 0;
    const n = Math.random() * 2 - 1;
    for (const [q, ty, g, k, k2] of E) {
      const d = t - q;
      if (d < 0 || d > 0.25) continue;
      if (ty === 'click') v += svf(s, k, n, 2400, 0.6, sr).b * ex(d, 0.004) * g * 1.3;
      else if (ty === 'clack') v += (svf(s, k, n, 1100, 0.6, sr).b * ex(d, 0.012) * 1.7 + lpf(s, k2, n, 300, sr) * ex(d, 0.02) * 1.2) * g;
      else if (ty === 'slide') v += svf(s, k, n, 1800 + d * 4000, 1.4, sr).b * fsin(Math.PI * Math.min(1, d / 0.09)) * g * 1.2 * (d < 0.09 ? 1 : 0);
      else if (ty === 'thud') v += (lpf(s, k, n, 380, sr) * ex(d, 0.04) * 2.5 + fsin(TAU * 95 * d) * ex(d, 0.05)) * g;
      else if (ty === 'rustle') v += svf(s, k, n, 2600, 1.8, sr).b * fsin(Math.PI * Math.min(1, d / 0.16)) * g * (d < 0.16 ? 1 : 0) * (0.6 + 0.4 * fsin(d * 180));
      else if (ty === 'ring') v += lpf(s, k, n, 700, sr) * ex(d, 0.02) * g * 1.2;
    }
    return v;
  }, 0.9);
}
// A struck bell or chime: a few inharmonic partials with their own decays.
function chime(dur, freqs, decays, gains, peak) {
  return mk2(dur, (t) => {
    let v = 0;
    for (let i = 0; i < freqs.length; i++) v += fsin(TAU * freqs[i] * t) * ex(t, decays[i]) * gains[i];
    return v * Math.min(1, t / 0.002);
  }, peak || 0.8);
}

function* ambGen(k) {
  const D = 6, R = 22050;
  let b;
  if (k === 'wind') b = yield* mk2gen(D, (t, s, sr, ch) => {
    const n = Math.random() * 2 - 1, u = (TAU * t) / D;
    const gust = 0.55 + 0.3 * fsin(u * 2 + ch) + 0.15 * fsin(u * 5 + 1.3 * ch);
    return svf(s, 'w', n, 300 + 260 * gust, 1.4, sr).b * gust;
  }, 0.8, true, R);
  else if (k === 'engine') b = yield* mk2gen(D, (t, s, sr, ch) => {
    const n = Math.random() * 2 - 1, u = (TAU * t) / D;
    return svf(s, 'e', n, 900 + 60 * fsin(u), 6, sr).b * 0.5 + lpf(s, 'l', n, 180, sr) * 2 * (0.8 + 0.2 * fsin(u * 2 + ch));
  }, 0.7, true, R);
  else if (k === 'water') b = yield* mk2gen(D, (t, s, sr, ch) => {
    const n = Math.random() * 2 - 1, u = (TAU * t) / D;
    const lap = Math.pow(0.5 + 0.5 * fsin(u * 4 + ch * 0.7), 3);
    return lpf(s, 'w', n, 500, sr) * 2 * lap + svf(s, 'h', n, 2500, 2, sr).b * 0.12 * lap;
  }, 0.8, true, R);
  else if (k === 'birds') b = yield* mk2gen(D, (t, s, sr, ch) => {
    // a soft leafy bed with the odd chirp
    const n = Math.random() * 2 - 1;
    if (Math.random() < 0.00012) {
      s.cT = 0;
      s.cF = 2600 + Math.random() * 2400;
      s.cN = 2 + ((Math.random() * 4) | 0);
    }
    let v = svf(s, 'l', n, 3200, 0.8, sr).b * 0.05 * (0.7 + 0.3 * fsin((TAU * t) / D * 3 + ch));
    if (s.cT != null) {
      s.cT += 1 / sr;
      const per = 0.09, idx = Math.floor(s.cT / per), lt = s.cT - idx * per;
      if (idx < s.cN) {
        s.ph = (s.ph || 0) + (TAU * s.cF * (1 + 0.25 * fsin(lt * 60))) / sr;
        v += fsin(s.ph) * fsin(Math.PI * Math.min(1, lt / 0.05)) * (lt < 0.05 ? 0.35 : 0);
      } else s.cT = null;
    }
    return v;
  }, 0.5, true, R);
  else if (k === 'storm') b = yield* mk2gen(D, (t, s, sr, ch) => {
    // the storm wall: a deep churning roar with crackle
    const n = Math.random() * 2 - 1, u = (TAU * t) / D;
    if (Math.random() < 0.0006) s.pop = 0.5 + Math.random() * 0.8;
    s.pop = (s.pop || 0) * 0.992;
    return lpf(s, 'r', n, 160, sr) * 3 * (0.7 + 0.3 * fsin(u * 3 + ch)) + svf(s, 'w', n, 520 + 200 * fsin(u * 2 + ch), 2, sr).b * 0.4 + svf(s, 'c', n, 2400, 2, sr).b * s.pop;
  }, 0.8, true, R);
  else if (k === 'freefall') b = yield* mk2gen(D, (t, s, sr, ch) => {
    // rushing air: broadband with a flutter
    const n = Math.random() * 2 - 1, u = (TAU * t) / D;
    const fl = 0.8 + 0.2 * fsin(t * 31 + ch * 2) * fsin(u * 3);
    return (svf(s, 'a', n, 900 + 300 * fsin(u * 2 + ch), 0.7, sr).b * 1.2 + lpf(s, 'b', n, 240, sr) * 1.6) * fl;
  }, 0.8, true, R);
  return b;
}

// Everything in one job, guns first so the first shots of a match already have sound.
function* soundJobs(B) {
  for (const id in GUNP) B[id] = [yield* gunVariant(GUNP[id], false)];
  for (const id in GUNP) {
    for (let k = 1; k < 4; k++) B[id].push(yield* gunVariant(GUNP[id], false));
    B['far_' + id] = [yield* gunVariant(GUNP[id], true)];
    B['far_' + id].push(yield* gunVariant(GUNP[id], true));
  }
  yield;
  B.rocket = [yield* mk2gen(1.3, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    const pop = lpf(s, 'p', n, 900, sr) * ex(t, 0.03) * 2.2 + fsin(TAU * 70 * t) * ex(t, 0.06);
    const roar = svf(s, 'r', n, 700 + 900 * ex(t, 0.4), 0.8, sr).b * (t < 0.03 ? t / 0.03 : 1) * ex(t, 0.55) * 1.6;
    return pop + roar + lpf(s, 't', n, 500, sr) * ex(t, 0.7) * 0.8;
  }, 0.95, true)];
  yield;
  B.boom = [];
  for (let q = 0; q < 2; q++) {
    B.boom.push(yield* mk2gen(2.6, (t, s, sr) => {
      const n = Math.random() * 2 - 1;
      s.ph = (s.ph || 0) + (TAU * (34 + 70 * ex(t, 0.05))) / sr;
      const deb = Math.random() < 0.003 * ex(t, 0.6) ? (Math.random() * 2 - 1) * 2.4 : 0;
      return fsin(s.ph) * ex(t, 0.45) * 1.6 + lpf(s, 'a', n, 420, sr) * ex(t, 0.5) * 3.2 + lpf(s, 'b', n, 120, sr) * ex(t, 1.1) * 5 + n * ex(t, 0.012) * 1.2 + deb + svf(s, 'c', n, 2500, 1, sr).b * ex(t, 0.08) * 0.6;
    }, 1, true, 32000));
  }
  yield;
  B.far_boom = [yield* mk2gen(3, (t, s, sr) => {
    const n = Math.random() * 2 - 1, a = t < 0.02 ? t / 0.02 : 1;
    s.ph = (s.ph || 0) + (TAU * 30) / sr;
    return (fsin(s.ph) * ex(t, 0.6) + lpf(s, 'a', n, 200, sr) * ex(t, 1.2) * 5) * a;
  }, 0.9, true, 16000)];
  yield;
  B.whiz = [0, 1, 2].map(() => mk2(0.32, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    const snap = (n - lpf(s, 'h', n, 3500, sr)) * ex(t, 0.0025) * 1.4;
    const w = svf(s, 'w', n, 2600 - t * 5000, 6, sr).b * fsin(Math.PI * Math.min(1, t / 0.22)) * 0.9;
    return snap + w;
  }, 0.9));
  yield;
  // bullet impacts by surface
  B.imp_stone = [0, 1].map(() => mk2(0.25, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return (n - lpf(s, 'h', n, 2200, sr)) * ex(t, 0.01) * 1.4 + lpf(s, 'd', n, 1400, sr) * ex(t, 0.06) * 0.8 + (Math.random() < 0.004 * ex(t, 0.08) ? (Math.random() - 0.5) * 2 : 0);
  }));
  yield;
  B.imp_metal = [0, 1].map(() => mk2(0.22, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return svf(s, 'b', n, 900, 0.9, sr).b * ex(t, 0.03) * 2.2 + lpf(s, 'l', n, 250, sr) * ex(t, 0.05) * 2 + n * ex(t, 0.002) * 0.6;
  }));
  yield;
  B.imp_wood = [0, 1].map(() => mk2(0.2, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return svf(s, 'b', n, 650, 1.5, sr).b * ex(t, 0.03) * 2 + fsin(TAU * 210 * t) * ex(t, 0.035) * 0.5 + n * ex(t, 0.003) * 0.5;
  }));
  yield;
  B.imp_dirt = [0, 1].map(() => mk2(0.22, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 'l', n, 600, sr) * ex(t, 0.05) * 2.4 + (Math.random() < 0.02 * ex(t, 0.05) ? Math.random() - 0.5 : 0);
  }));
  yield;
  B.imp_flesh = [0, 1].map(() => mk2(0.16, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 'l', n, 420, sr) * ex(t, 0.03) * 2.6 + svf(s, 'b', n, 1400, 1.2, sr).b * ex(t, 0.008) * 0.6;
  }));
  yield;
  // shield hits: a glassy zap
  B.imp_shield = [0, 1].map(() => mk2(0.25, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    s.ph = (s.ph || 0) + (TAU * (1900 - 900 * Math.min(1, t / 0.2))) / sr;
    return fsin(s.ph) * ex(t, 0.05) * 0.5 + svf(s, 'g', n, 5200, 4, sr).b * ex(t, 0.03) * 0.9 + (n - lpf(s, 'h', n, 4000, sr)) * ex(t, 0.003) * 0.6;
  }, 0.8));
  yield;
  // hit feedback
  B.tick = [mk2(0.08, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 't', n, 900, sr) * ex(t, 0.012) * 2.2 + (n - lpf(s, 'h', n, 4000, sr)) * ex(t, 0.0025) * 0.8 + fsin(TAU * 150 * t) * ex(t, 0.018) * 0.6;
  })];
  yield;
  B.kill = [mk2(0.28, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 't', n, 380, sr) * ex(t, 0.05) * 2.8 + fsin(TAU * 72 * t) * ex(t, 0.08) * 1.2 + lpf(s, 'c', n, 1200, sr) * ex(t, 0.01) * 0.6;
  })];
  yield;
  B.head = [mk2(0.22, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 't', n, 500, sr) * ex(t, 0.035) * 2.6 + (n - lpf(s, 'h', n, 2500, sr)) * ex(t, 0.003) * 0.9 + fsin(TAU * 85 * t) * ex(t, 0.06);
  })];
  yield;
  B.shieldbreak = [mk2(0.5, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    const sh = svf(s, 's', n, 3800 - 2000 * Math.min(1, t / 0.3), 3, sr).b * ex(t, 0.12) * 1.2;
    return sh + fsin(TAU * 1250 * t) * ex(t, 0.08) * 0.4 + fsin(TAU * 1870 * t) * ex(t, 0.06) * 0.3 + lpf(s, 'l', n, 300, sr) * ex(t, 0.04) * 1.2;
  }, 0.8)];
  yield;
  B.hurt = [0, 1].map(() => mk2(0.3, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 'a', n, 260, sr) * ex(t, 0.06) * 3 + fsin(TAU * 62 * t) * ex(t, 0.07) + svf(s, 'b', n, 1200, 2, sr).b * ex(t, 0.015) * 0.5;
  }));
  yield;
  // footsteps: heel then toe, colored by surface
  const step = (surf) => {
    const toe = 0.035 + Math.random() * 0.03, P = [[0, 1, 'h', 'H'], [toe, 0.55, 't', 'T']];
    return mk2(0.2, (t, s, sr) => {
      const n = Math.random() * 2 - 1;
      let v = 0;
      for (const [q, g, k, k2] of P) {
        const d = t - q;
        if (d < 0) continue;
        if (surf === 'stone') v += (svf(s, k, n, 2800, 1.2, sr).b * ex(d, 0.012) * 1.5 + lpf(s, k2, n, 500, sr) * ex(d, 0.02) * 1.4 + fsin(TAU * 120 * d) * ex(d, 0.018) * 0.4) * g;
        else if (surf === 'metal') v += (svf(s, k, n, 600, 0.9, sr).b * ex(d, 0.04) * 2.2 + lpf(s, k2, n, 200, sr) * ex(d, 0.05) * 1.6) * g;
        else if (surf === 'wood') v += (svf(s, k, n, 520, 2, sr).b * ex(d, 0.035) * 2 + fsin(TAU * 180 * d) * ex(d, 0.04) * 0.6) * g;
        else if (surf === 'grass') v += (svf(s, k, n, 3200, 1.6, sr).b * fsin(Math.PI * Math.min(1, d / 0.07)) * (d < 0.07 ? 0.9 : 0) + lpf(s, k2, n, 700, sr) * ex(d, 0.03) * 1.2) * g;
        else if (surf === 'sand') v += (svf(s, k, n, 1800, 0.8, sr).b * fsin(Math.PI * Math.min(1, d / 0.09)) * (d < 0.09 ? 0.8 : 0) + lpf(s, k2, n, 400, sr) * ex(d, 0.04) * 1.4) * g;
        else if (surf === 'water') v += (svf(s, k, n, 900 + 1400 * Math.min(1, d / 0.08), 1.4, sr).b * fsin(Math.PI * Math.min(1, d / 0.12)) * (d < 0.12 ? 1.3 : 0)) * g;
        else v += (lpf(s, k, n, 1100, sr) * ex(d, 0.045) * 2 + (Math.random() < 0.06 * ex(d, 0.05) ? (Math.random() - 0.5) * 0.8 : 0)) * g;
      }
      return v;
    }, 0.9);
  };
  yield;
  for (const surf of ['stone', 'metal', 'wood', 'dirt', 'grass', 'sand', 'water']) {
    B['st_' + surf] = [];
    for (let q = 0; q < 4; q++) {
      B['st_' + surf].push(step(surf));
      yield;
    }
  }
  B.gear = [0, 1].map(() => foley(0.14, [[0, 'click', 0.5], [0.03, 'click', 0.35], [0.055, 'click', 0.4], [0.08, 'rustle', 0.5]]));
  yield;
  B.land = [mk2(0.35, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 'a', n, 300, sr) * ex(t, 0.07) * 3 + fsin(TAU * 70 * t) * ex(t, 0.06) + svf(s, 'g', n, 3000, 1, sr).b * ex(t, 0.02) * 0.4;
  })];
  yield;
  // weapon handling foley
  B.mrel = [foley(0.08, [[0, 'click', 1]])];
  B.magout = [foley(0.3, [[0, 'click', 0.8], [0.02, 'slide', 0.7], [0.12, 'thud', 0.35]])];
  yield;
  B.pouch = [foley(0.3, [[0, 'rustle', 0.9], [0.1, 'rustle', 0.6]])];
  B.magin = [foley(0.25, [[0, 'slide', 0.5], [0.06, 'clack', 1.1], [0.075, 'click', 0.6]])];
  yield;
  B.charge = [foley(0.35, [[0, 'clack', 0.8], [0.02, 'slide', 0.4], [0.13, 'clack', 1.2], [0.14, 'ring', 0.25]])];
  B.slap = [foley(0.2, [[0, 'clack', 1.2], [0.01, 'ring', 0.3]])];
  yield;
  B.boltup = [foley(0.12, [[0, 'click', 1], [0.01, 'clack', 0.4]])];
  B.boltback = [foley(0.2, [[0, 'slide', 1], [0.08, 'clack', 0.6]])];
  yield;
  B.boltfwd = [foley(0.2, [[0, 'slide', 0.8], [0.07, 'clack', 1]])];
  B.boltdown = [foley(0.1, [[0, 'clack', 1], [0.01, 'ring', 0.2]])];
  B.bolt = B.boltfwd;
  yield;
  B.pumpback = [foley(0.18, [[0, 'clack', 0.9], [0.02, 'slide', 0.8]])];
  B.pumpfwd = [foley(0.18, [[0, 'slide', 0.7], [0.07, 'clack', 1.2], [0.08, 'ring', 0.2]])];
  yield;
  B.pump = [foley(0.3, [[0, 'clack', 0.9], [0.02, 'slide', 0.8], [0.14, 'slide', 0.7], [0.2, 'clack', 1.1]])];
  B.shellin = [foley(0.18, [[0, 'slide', 0.5], [0.05, 'click', 0.9], [0.06, 'clack', 0.5]])];
  yield;
  B.cover = [foley(0.3, [[0, 'clack', 1], [0.03, 'ring', 0.3], [0.1, 'click', 0.5]])];
  B.rocketin = [foley(0.4, [[0, 'slide', 0.9], [0.18, 'clack', 1.2], [0.2, 'ring', 0.3]])];
  yield;
  B.sliderel = [foley(0.15, [[0, 'clack', 1.3], [0.01, 'ring', 0.35]])];
  B.adsin = [foley(0.18, [[0, 'rustle', 0.5], [0.08, 'click', 0.15]])];
  B.adsout = [foley(0.14, [[0, 'rustle', 0.35]])];
  yield;
  B.swap = [foley(0.3, [[0, 'rustle', 0.7], [0.06, 'clack', 0.5], [0.12, 'click', 0.4]])];
  B.empty = [foley(0.1, [[0, 'click', 1]])];
  B.deny = [foley(0.14, [[0, 'clack', 0.5], [0.05, 'click', 0.4]])];
  yield;
  B.knife = [mk2(0.3, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return svf(s, 'w', n, 900 + t * 9000, 2.5, sr).b * fsin((Math.PI * t) / 0.3) ** 2 * 1.5;
  })];
  yield;
  B.bounce = [0, 1].map(() => mk2(0.15, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 't', n, 600, sr) * ex(t, 0.02) * 2.4 + svf(s, 'b', n, 1200, 0.8, sr).b * ex(t, 0.01);
  }));
  yield;
  const swoosh = (dur, f0, f1, g) => mk2(dur, (t, s, sr) => {
    const n = Math.random() * 2 - 1, u = t / dur;
    return svf(s, 'w', n, f0 + (f1 - f0) * u, 1.2, sr).b * fsin(Math.PI * u) * g + lpf(s, 'l', n, 200, sr) * ex(t, 0.08) * g * 1.5;
  }, 0.7);
  B.cap = [swoosh(0.45, 500, 2200, 1)];
  yield;
  B.ready = [swoosh(0.6, 400, 1800, 1)];
  yield;
  B.level = [swoosh(0.7, 300, 2400, 1)];
  yield;
  B.heart = [mk2(0.6, (t) => {
    const a = fsin(TAU * 52 * t) * ex(t, 0.05), d = t - 0.24, b = d > 0 ? fsin(TAU * 46 * d) * ex(d, 0.06) : 0;
    return a + b * 0.8;
  })];
  yield;
  // brass casings landing after your shots: two or three bright pings and a skitter
  B.brass = [];
  for (let q = 0; q < 4; q++) {
    yield;
    const at = [0, 0.05 + Math.random() * 0.04, 0.12 + Math.random() * 0.06], f = [3100 + Math.random() * 900, 5200 + Math.random() * 1200, 7400 + Math.random() * 1500];
    B.brass.push(mk2(0.4, (t) => {
      let v = 0;
      for (let k = 0; k < 3; k++) {
        const d = t - at[k];
        if (d < 0) continue;
        const g = [1, 0.5, 0.28][k];
        for (let j = 0; j < 3; j++) v += fsin(TAU * f[j] * (1 + k * 0.013) * d) * ex(d, 0.028 / (j + 1)) * g * (j ? 0.5 : 1);
        v += (Math.random() * 2 - 1) * ex(d, 0.002) * g * 0.4;
      }
      return v;
    }, 0.5));
  }
  yield;
  // ricochet: a bright whine bending down as the round tumbles away
  B.rico = [];
  for (let q = 0; q < 3; q++) {
    yield;
    const f0 = 2600 + Math.random() * 1800, dur = 0.45 + Math.random() * 0.25;
    B.rico.push(mk2(dur, (t, s, sr) => {
      const u = t / dur, fr = f0 * (1 - 0.45 * u), n = Math.random() * 2 - 1;
      s.ph = (s.ph || 0) + (TAU * fr * (1 + 0.004 * fsin(t * 90))) / sr;
      return (fsin(s.ph) * 0.8 + svf(s, 'n', n, fr, 8, sr).b * 0.6) * Math.min(1, t / 0.008) * Math.pow(1 - u, 1.6) + (n - lpf(s, 'h', n, 3000, sr)) * ex(t, 0.004) * 0.8;
    }, 0.55));
  }
  yield;
  // grit and stones pattering down after a close blast
  B.debris = [yield* mk2gen(2.2, (t, s, sr) => {
    const n = Math.random() * 2 - 1, rate = 90 * ex(t, 0.5) + 6;
    if (Math.random() < rate / sr) {
      s.env = 1;
      s.f = 600 + Math.random() * 2400;
    }
    s.env = (s.env || 0) * 0.9983;
    return svf(s, 'd', n, s.f || 1000, 2, sr).b * s.env * Math.min(1, t / 0.05) * (0.4 + 0.6 * ex(t, 0.9));
  }, 0.6, true, 32000)];
  yield;
  // ---------- battle royale sounds, built the same way ----------
  // harvesting: axe into wood, pick on stone, wrench on metal
  B.chop = [0, 1].map(() => mk2(0.3, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return svf(s, 'b', n, 420, 2.2, sr).b * ex(t, 0.05) * 2.4 + fsin(TAU * 160 * t) * ex(t, 0.06) * 0.9 + (n - lpf(s, 'h', n, 2500, sr)) * ex(t, 0.004) * 1.2;
  }));
  yield;
  B.pickstone = [0, 1].map(() => mk2(0.3, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return (n - lpf(s, 'h', n, 1800, sr)) * ex(t, 0.012) * 1.6 + svf(s, 'r', n, 2300, 6, sr).b * ex(t, 0.06) * 0.8 + lpf(s, 'l', n, 500, sr) * ex(t, 0.04) * 1.2;
  }));
  yield;
  B.clang = [0, 1].map(() => chime(0.7, [880 + Math.random() * 60, 1390, 2210, 3170], [0.2, 0.12, 0.08, 0.05], [1, 0.6, 0.4, 0.25], 0.8));
  yield;
  B.whoosh = [mk2(0.28, (t, s, sr) => {
    const n = Math.random() * 2 - 1, u = t / 0.28;
    return svf(s, 'w', n, 500 + 1600 * u, 1.6, sr).b * fsin(Math.PI * u) ** 2 * 1.4;
  }, 0.6)];
  yield;
  B.crit = [chime(0.45, [1760, 2640, 3520], [0.12, 0.08, 0.05], [1, 0.5, 0.3], 0.7)];
  yield;
  // building: a piece slamming into place, by material
  const build = (mat) => mk2(0.45, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    if (mat === 'wood') return svf(s, 'b', n, 380, 2.4, sr).b * ex(t, 0.07) * 2.6 + fsin(TAU * 120 * t) * ex(t, 0.08) * 1.1 + (n - lpf(s, 'h', n, 2000, sr)) * ex(t, 0.005) * 0.8 + svf(s, 'k', n, 900, 3, sr).b * ex(t - 0.09, 0.03) * 0.8;
    if (mat === 'stone') return lpf(s, 'l', n, 260, sr) * ex(t, 0.09) * 3.2 + (n - lpf(s, 'h', n, 1500, sr)) * ex(t, 0.02) * 1.2 + fsin(TAU * 70 * t) * ex(t, 0.1);
    return svf(s, 'm', n, 700, 4, sr).b * ex(t, 0.12) * 2 + fsin(TAU * 310 * t) * ex(t, 0.18) * 0.6 + fsin(TAU * 497 * t) * ex(t, 0.12) * 0.4 + lpf(s, 'l', n, 200, sr) * ex(t, 0.06) * 2;
  }, 0.9);
  B.build_wood = [build('wood'), build('wood')];
  yield;
  B.build_stone = [build('stone'), build('stone')];
  yield;
  B.build_metal = [build('metal'), build('metal')];
  yield;
  B.break = [0, 1].map(() => mk2(0.9, (t, s, sr) => {
    const n = Math.random() * 2 - 1, rate = 260 * ex(t, 0.25) + 4;
    if (Math.random() < rate / sr) {
      s.env = 1;
      s.f = 300 + Math.random() * 1800;
    }
    s.env = (s.env || 0) * 0.998;
    return lpf(s, 'l', n, 380, sr) * ex(t, 0.12) * 2.4 + svf(s, 'd', n, s.f || 800, 2.5, sr).b * s.env * 1.2 + fsin(TAU * 64 * t) * ex(t, 0.1);
  }, 0.95));
  yield;
  B.edit = [foley(0.16, [[0, 'click', 0.8], [0.05, 'clack', 0.6]])];
  // loot
  B.pickup = [foley(0.3, [[0, 'rustle', 0.7], [0.08, 'clack', 0.8], [0.1, 'click', 0.5]])];
  B.pickupSmall = [foley(0.2, [[0, 'rustle', 0.6], [0.06, 'click', 0.4]])];
  yield;
  // a chest calling out: a shimmering cluster of little bells
  B.chestCue = [mk2(1.2, (t) => {
    let v = 0;
    for (let k = 0; k < 6; k++) {
      const d = t - k * 0.13;
      if (d < 0) continue;
      const f = [2093, 2637, 3136, 2349, 2794, 3520][k];
      v += (fsin(TAU * f * d) + 0.4 * fsin(TAU * f * 2.01 * d)) * ex(d, 0.18) * (1 - k * 0.08);
    }
    return v;
  }, 0.6)];
  yield;
  B.chestOpen = [mk2(1.4, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    // lid creak, a thump, then a rising chord
    const creak = t < 0.3 ? svf(s, 'c', n, 700 + 400 * fsin(t * 40), 9, sr).b * fsin((Math.PI * t) / 0.3) * 0.6 : 0;
    const thump = lpf(s, 't', n, 300, sr) * ex(t - 0.3, 0.05) * (t > 0.3 ? 2.2 : 0);
    let ch = 0;
    for (let k = 0; k < 5; k++) {
      const d = t - 0.32 - k * 0.06;
      if (d < 0) continue;
      const f = [523, 659, 784, 1047, 1319][k];
      ch += (fsin(TAU * f * d) + 0.3 * fsin(TAU * f * 3 * d)) * ex(d, 0.35) * 0.45;
    }
    return creak + thump + ch;
  }, 0.85)];
  yield;
  B.healed = [chime(0.7, [784, 1175, 1568], [0.25, 0.2, 0.15], [0.8, 0.6, 0.4], 0.6)];
  B.heal_loop = [foley(0.3, [[0, 'rustle', 0.5], [0.15, 'rustle', 0.4]])];
  B.shield_drink = [mk2(0.5, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    const g = Math.max(0, fsin(TAU * 7 * t));
    return lpf(s, 'g', n, 500, sr) * g * g * 2 + fsin(TAU * (180 + 60 * fsin(TAU * 7 * t)) * t) * g * 0.3;
  }, 0.6)];
  yield;
  // airborne
  B.glider = [mk2(0.7, (t, s, sr) => {
    const n = Math.random() * 2 - 1, u = t / 0.7;
    return svf(s, 'w', n, 300 + 900 * u, 1.2, sr).b * fsin(Math.PI * Math.min(1, u * 1.4)) * 1.4 + lpf(s, 'p', n, 160, sr) * ex(t - 0.18, 0.08) * (t > 0.18 ? 3 : 0);
  }, 0.8)];
  yield;
  B.busJump = [mk2(0.6, (t, s, sr) => {
    const n = Math.random() * 2 - 1, u = t / 0.6;
    return svf(s, 'w', n, 1500 - 900 * u, 1.1, sr).b * fsin(Math.PI * u) * 1.3;
  }, 0.7)];
  yield;
  B.horn = [mk2(1.0, (t, s) => {
    s.ph = (s.ph || 0) + (TAU * 392) / CTX.sampleRate;
    s.p2 = (s.p2 || 0) + (TAU * 494) / CTX.sampleRate;
    const env = Math.min(1, t / 0.03) * Math.min(1, (1 - t) / 0.1);
    return (fsin(s.ph) + 0.4 * fsin(s.ph * 2) + 0.8 * fsin(s.p2) + 0.3 * fsin(s.p2 * 2)) * env * (t < 0.4 || t > 0.5 ? 1 : 0.2);
  }, 0.6)];
  yield;
  B.stormWarn = [mk2(2.2, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    s.ph = (s.ph || 0) + (TAU * (110 + 8 * fsin(TAU * 0.8 * t))) / sr;
    const sw = Math.min(1, t / 0.4) * Math.min(1, (2.2 - t) / 0.8);
    return (fsin(s.ph) + 0.5 * fsin(s.ph * 1.5) + 0.25 * fsin(s.ph * 2.02)) * sw * 0.6 + lpf(s, 'r', n, 120, sr) * sw * 1.6;
  }, 0.75)];
  yield;
  B.flare = [mk2(1.4, (t, s, sr) => {
    const n = Math.random() * 2 - 1, u = t / 1.4;
    return svf(s, 'f', n, 600 + 2200 * u, 6, sr).b * Math.min(1, t / 0.1) * (1 - u) * 1.2 + (n - lpf(s, 'h', n, 3000, sr)) * 0.08 * (1 - u);
  }, 0.6)];
  yield;
  B.crash = [0, 1].map(() => mk2(0.6, (t, s, sr) => {
    const n = Math.random() * 2 - 1;
    return lpf(s, 'l', n, 420, sr) * ex(t, 0.08) * 3 + svf(s, 'm', n, 900, 3, sr).b * ex(t, 0.15) * 1.4 + (Math.random() < 0.01 * ex(t, 0.2) ? (Math.random() - 0.5) * 3 : 0);
  }, 0.95));
  yield;
  // the ambience beds, ready before the first match needs them
  for (const k of ['wind', 'water', 'birds', 'engine', 'storm', 'freefall']) {
    if (!B['amb_' + k]) B['amb_' + k] = yield* ambGen(k);
  }
}

const RELOAD_CUES = {
  mag: [[0.1, 'mrel', 0.5], [0.2, 'magout', 0.7], [0.36, 'pouch', 0.45], [0.555, 'magin', 0.85], [0.76, 'charge', 0.75]],
  pis: [[0.1, 'mrel', 0.5], [0.2, 'magout', 0.6], [0.36, 'pouch', 0.4], [0.555, 'magin', 0.8], [0.77, 'sliderel', 0.8]],
  sr: [[0.08, 'boltup', 0.6], [0.2, 'magout', 0.6], [0.36, 'pouch', 0.4], [0.555, 'magin', 0.8], [0.72, 'boltfwd', 0.8], [0.8, 'boltdown', 0.7]],
  lmg: [[0.08, 'cover', 0.8], [0.22, 'magout', 0.7], [0.38, 'pouch', 0.45], [0.555, 'magin', 0.9], [0.66, 'cover', 0.8], [0.78, 'charge', 0.8]],
  rpg: [[0.62, 'rocketin', 0.9]],
  shell: [[0.5, 'shellin', 0.7]],
};

// A street-sized room: noise tail plus a handful of early reflections, a little different in each ear.
function streetIR(c) {
  const sr = c.sampleRate, L = Math.floor(sr * 1.7), ir = c.createBuffer(2, L, sr), early = [];
  for (let k = 0; k < 12; k++) early.push([0.011 + Math.random() * 0.15, (0.35 + Math.random() * 0.65) * Math.exp(-k * 0.13), Math.random()]);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < L; i++) {
      const t = i / sr, k = 0.05 + 0.45 * Math.exp(-t / 0.22);
      lp += k * (Math.random() * 2 - 1 - lp);
      d[i] = lp * Math.exp(-t / 0.4) * (t < 0.012 ? t / 0.012 : 1) * 0.9;
    }
    for (const [t0, g, pan] of early) {
      const i0 = Math.floor(t0 * sr), gg = g * (ch ? pan : 1 - pan) * 1.5, w = Math.floor(sr * 0.004);
      for (let j = 0; j < w && i0 + j < L; j++) d[i0 + j] += (Math.random() * 2 - 1) * gg * Math.exp(-j / (sr * 0.0011));
    }
  }
  return ir;
}

const _fw = new THREE.Vector3(), _up = new THREE.Vector3();

export class AudioSystem {
  constructor(game) {
    this.game = game;
    this.ctx = null;
    this.volume = 0.7;
    this.ok = false;
    this.building = false;
    this.err = '';
    this.B = {};
    this.voices = 0;
    this.listen = new THREE.Vector3();
    this.frameNo = 0;
    this.listenFrame = -1;
    this.lastImp = 0;
    this.lastRemoteGun = 0;
    this.ring = 0;
    this.muffle = 0;
    this.amb = {};
    this.engineLoop = null;
    this.prevReload = -1;
    this.prevAds = 0;
    this.prevSpr = false;
    this.lastShot = -9;
    this.cyc = {};
    this.brassQ = [];
    this.brassT = 0;
    this.menu = true;
    this.lastPlay = new Map();
    for (const ev of ['pointerdown', 'mousedown', 'touchend', 'keydown', 'click']) window.addEventListener(ev, () => this.unlock(), { capture: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.unlock();
    });
  }

  graph() {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) {
      this.err = 'This browser has no Web Audio';
      return false;
    }
    try {
      this.ctx = new C();
    } catch (e) {
      this.err = 'Audio could not start: ' + e.message;
      return false;
    }
    const c = this.ctx;
    CTX = c;
    this.master = c.createGain();
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value = 0.002;
    comp.release.value = 0.18;
    const lim = c.createDynamicsCompressor();
    lim.threshold.value = -4;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.001;
    lim.release.value = 0.08;
    this.master.connect(comp);
    comp.connect(lim);
    lim.connect(c.destination);
    // muffling = crossfade between the clean mix and a fixed low-passed copy (no filter automation, so it can't glitch)
    this.mufG = c.createGain();
    this.dry = c.createGain();
    this.wet = c.createGain();
    this.wet.gain.value = 0;
    const mlp = c.createBiquadFilter();
    mlp.type = 'lowpass';
    mlp.frequency.value = 900;
    this.mufG.connect(this.dry);
    this.mufG.connect(mlp);
    mlp.connect(this.wet);
    this.dry.connect(this.master);
    this.wet.connect(this.master);
    this.world = c.createGain(); // everything happening around you
    this.world.connect(this.mufG);
    this.self = c.createGain(); // your own gun, hands and body
    this.self.connect(this.mufG);
    this.ambBus = c.createGain();
    this.ambBus.gain.value = 0.3;
    this.ambBus.connect(this.world);
    this.uiBus = c.createGain();
    this.uiBus.connect(this.master);
    // short room + a slapback echo off the buildings
    this.rev = c.createConvolver();
    this.rev.buffer = streetIR(c);
    this.revIn = c.createGain();
    this.revIn.gain.value = 0.26;
    this.revIn.connect(this.rev);
    this.rev.connect(this.mufG);
    this.echoIn = c.createGain();
    this.echoIn.gain.value = 0.18;
    const dl = c.createDelay(1);
    dl.delayTime.value = 0.19;
    const fb = c.createGain();
    fb.gain.value = 0.3;
    const ef = c.createBiquadFilter();
    ef.type = 'lowpass';
    ef.frequency.value = 1900;
    this.echoIn.connect(dl);
    dl.connect(ef);
    ef.connect(fb);
    fb.connect(dl);
    ef.connect(this.mufG);
    this.applyVolume();
    return true;
  }

  // Start audio the way Safari wants it: inside a click or key press, with a silent blip, then build the
  // sounds in small slices after the click has returned.
  unlock() {
    if (!this.ctx && !this.err) this.graph();
    const c = this.ctx;
    if (!c) return;
    if (c.state !== 'running' && c.state !== 'closed') {
      try {
        const r = c.resume();
        if (r && r.catch) r.catch(() => {});
      } catch {
        /* resume is best effort */
      }
      try {
        const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource();
        s.buffer = b;
        s.connect(c.destination);
        s.start(0);
      } catch {
        /* silent unlock blip is optional */
      }
    }
    if (!this.building && !this.ok) {
      this.building = true;
      setTimeout(() => this.buildChunked(), 30);
    }
  }

  buildChunked() {
    const it = soundJobs(this.B);
    this.ok = true;
    const slice = () => {
      const t0 = performance.now();
      try {
        while (performance.now() - t0 < 9) {
          if (it.next().done) {
            this.building = false;
            return;
          }
        }
      } catch (e) {
        this.err = 'Sound build failed: ' + (e && e.message);
        console.warn(e);
        this.building = false;
        return;
      }
      setTimeout(slice, 0);
    };
    slice();
  }

  setVolume(v) {
    this.volume = v;
    this.applyVolume();
  }

  setMenu(on) {
    this.menu = on;
    this.applyVolume();
  }

  applyVolume() {
    if (this.master) this.master.gain.value = this.volume * 0.85;
    if (this.world) this.ambBus.gain.value = this.menu ? 0.12 : 0.3;
  }

  setListener() {
    const cam = this.game.camera, c = this.ctx, l = c.listener;
    if (!l) return;
    this.listen.copy(cam.position);
    cam.getWorldDirection(_fw);
    _up.set(0, 1, 0).applyQuaternion(cam.quaternion);
    try {
      if (l.positionX) {
        l.positionX.value = cam.position.x;
        l.positionY.value = cam.position.y;
        l.positionZ.value = cam.position.z;
        l.forwardX.value = _fw.x;
        l.forwardY.value = _fw.y;
        l.forwardZ.value = _fw.z;
        l.upX.value = _up.x;
        l.upY.value = _up.y;
        l.upZ.value = _up.z;
      } else {
        l.setPosition(cam.position.x, cam.position.y, cam.position.z);
        l.setOrientation(_fw.x, _fw.y, _fw.z, _up.x, _up.y, _up.z);
      }
    } catch {
      /* older listeners */
    }
  }

  // name: buffer set. o: { vol, x, y, z, ref, rate, jit, rev, hi, self, ui }
  snd(name, o = {}) {
    if (!this.ok || !this.ctx || this.ctx.state !== 'running') return null;
    let set = this.B[name];
    if (!set) return null;
    const c = this.ctx;
    let vol = o.vol == null ? 1 : o.vol, d = 0, far = false;
    const pos = o.x != null;
    if (pos) {
      const L = this.game.camera.position;
      d = Math.hypot(L.x - o.x, L.y - o.y, L.z - o.z);
      const ref = o.ref || 10;
      vol *= 1 / (1 + Math.pow(Math.max(0, d) / ref, 1.35));
      if (vol < 0.005) return null;
      if (this.B['far_' + name] && d > 30) {
        set = this.B['far_' + name];
        vol *= 1.6;
        far = true;
      }
    }
    if (this.voices > 48 && !o.hi) return null;
    const buf = Array.isArray(set) ? set[(Math.random() * set.length) | 0] : set;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = (o.rate || 1) * (1 + (o.jit == null ? 0.04 : o.jit) * (Math.random() * 2 - 1));
    const g = c.createGain();
    g.gain.value = vol;
    let head = src;
    if (pos && d > 12 && !far) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = Math.max(900, 20000 * Math.exp(-d / 34));
      src.connect(f);
      head = f;
    }
    head.connect(g);
    let out = g;
    if (pos && d > 0.8) {
      if (this.listenFrame !== this.frameNo) {
        this.listenFrame = this.frameNo;
        this.setListener();
      }
      const pn = c.createPanner();
      pn.panningModel = 'HRTF';
      pn.distanceModel = 'linear';
      pn.rolloffFactor = 0;
      pn.refDistance = 1;
      pn.maxDistance = 1e4;
      try {
        if (pn.positionX) {
          pn.positionX.value = o.x;
          pn.positionY.value = o.y;
          pn.positionZ.value = o.z;
        } else pn.setPosition(o.x, o.y, o.z);
      } catch {
        /* older panners */
      }
      g.connect(pn);
      out = pn;
    }
    const bus = o.ui ? this.uiBus : !pos || d <= 0.8 || o.self ? this.self : this.world;
    out.connect(bus);
    if (o.rev) {
      out.connect(this.revIn);
      if (!far) out.connect(this.echoIn);
    }
    const delay = pos && d > 10 ? d / 343 : 0; // sound arrives late from far away
    this.voices++;
    let done = false;
    const fin = () => {
      if (!done) {
        done = true;
        this.voices = Math.max(0, this.voices - 1);
      }
    };
    src.onended = fin;
    setTimeout(fin, ((buf.duration / Math.max(0.25, src.playbackRate.value)) + delay + 1.5) * 1000);
    src.start(c.currentTime + delay);
    // your own gunshot briefly ducks everything else so you always hear it
    if (!pos && GUNP[name]) {
      const w = this.world.gain, t = c.currentTime;
      w.cancelScheduledValues(t);
      w.setValueAtTime(w.value, t);
      w.linearRampToValueAtTime(0.55, t + 0.012);
      w.setTargetAtTime(1, t + 0.07, 0.12);
    }
    // a blast close to you dulls the world for a moment
    if (name === 'boom' && pos && d < 9) this.ring = Math.max(this.ring, 1 - d / 9);
    return src;
  }

  // Gunfire. Your own is loud and close; everyone else's falls off with distance and is rate-limited.
  gunshot(actor, type) {
    const id = GUN_SND[type] || 'ar';
    if (actor === this.game.player && this.game.state === 'playing') {
      this.snd(id, { vol: 1, rev: true, hi: true, jit: 0.03 });
      return;
    }
    const L = this.game.camera.position, p = actor.pos;
    const d = Math.hypot(p.x - L.x, p.y + 1.4 - L.y, p.z - L.z);
    const now = this.ctx ? this.ctx.currentTime : 0;
    if (d < 40) {
      if (now - this.lastRemoteGun > (d < 16 ? 0.05 : 0.15)) {
        this.lastRemoteGun = now;
        this.snd(id, { x: p.x, y: p.y + 1.4, z: p.z, ref: d < 16 ? 9 : 7, rev: true, vol: d < 16 ? 0.5 : 0.4, jit: 0.06, hi: true });
      }
    } else if (d < 260) {
      // far battles: the distant variant, quieter the further away
      if (now - this.lastRemoteGun > 0.12) {
        this.lastRemoteGun = now;
        this.snd(id, { x: p.x, y: p.y + 1.4, z: p.z, ref: 22, vol: 0.55, jit: 0.06 });
      }
    }
  }

  // Compatibility layer for the game's named events.
  play(name, pos = null, vol = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const last = this.lastPlay.get(name) || 0;
    if (now - last < 0.025) return;
    this.lastPlay.set(name, now);
    const P = (o) => (pos ? { x: pos.x, y: pos.y, z: pos.z, ...o } : o);
    switch (name) {
      case 'explosion':
        this.snd('boom', P({ ref: 30, rev: true, hi: true, vol: 1.2 * vol }));
        if (pos && this.listen.distanceTo(pos) < 30) this.snd('debris', P({ vol: 0.55, ref: 9 }));
        return;
      case 'hit':
        this.snd('tick', { vol: 0.55, hi: true, jit: 0.03 });
        return;
      case 'headshot':
        this.snd('head', { vol: 0.75, hi: true, jit: 0.03 });
        return;
      case 'shieldbreak':
        this.snd('shieldbreak', { vol: 0.6, hi: true });
        return;
      case 'elim':
        this.snd('kill', { vol: 0.8, hi: true });
        this.snd('level', { vol: 0.35, ui: true });
        return;
      case 'hurt':
        this.snd('hurt', { vol: 0.7, hi: true });
        return;
      case 'reload':
        if (pos) this.snd('magout', P({ vol: 0.4 * vol, ref: 5 }));
        return;
      case 'empty':
        this.snd('empty', P({ vol: 0.6, ref: 4 }));
        return;
      case 'deny':
        this.snd('deny', { vol: 0.5 });
        return;
      case 'swing':
        this.snd('whoosh', P({ vol: 0.5 * vol, ref: 5 }));
        return;
      case 'chop':
        this.snd('chop', P({ vol: 0.8 * vol, ref: 8 }));
        return;
      case 'stone':
        this.snd('pickstone', P({ vol: 0.8 * vol, ref: 8 }));
        return;
      case 'clang':
        this.snd('clang', P({ vol: 0.55 * vol, ref: 8 }));
        return;
      case 'thunk':
        this.snd('imp_dirt', P({ vol: 0.7 * vol, ref: 6 }));
        return;
      case 'crit':
        this.snd('crit', { vol: 0.45 });
        return;
      case 'build':
        this.snd('build_wood', P({ vol: 0.75, ref: 10 }));
        return;
      case 'build_wood':
      case 'build_stone':
      case 'build_metal':
        this.snd(name, P({ vol: 0.75, ref: 10 }));
        return;
      case 'break':
        this.snd('break', P({ vol: 0.9, ref: 14, rev: true }));
        return;
      case 'edit':
        this.snd('edit', P({ vol: 0.6, ref: 6 }));
        return;
      case 'pickup':
        this.snd('pickup', P({ vol: 0.6 * vol, ref: 5, ui: !pos }));
        return;
      case 'pickupSmall':
        this.snd('pickupSmall', P({ vol: 0.45 * vol, ref: 5 }));
        return;
      case 'chestCue':
        this.snd('chestCue', P({ vol: 0.5 * vol, ref: 4, jit: 0.02 }));
        return;
      case 'chestOpen':
        this.snd('chestOpen', P({ vol: 0.7 * vol, ref: 8 }));
        return;
      case 'healed':
        this.snd('healed', { vol: 0.5 });
        return;
      case 'glider':
        this.snd('glider', { vol: 0.8 });
        return;
      case 'land':
        this.snd('land', P({ vol: 0.7, ref: 6 }));
        return;
      case 'stormWarn':
        this.snd('stormWarn', { vol: 0.7, ui: true });
        return;
      case 'flare':
        this.snd('flare', { vol: 0.5, ui: true });
        return;
      case 'crash':
        this.snd('crash', P({ vol: 0.9, ref: 10 }));
        return;
      case 'busJump':
        this.snd('busJump', { vol: 0.8 });
        return;
      case 'horn':
        this.snd('horn', P({ vol: 0.6, ref: 60 }));
        return;
      case 'victory':
        this.tones([523, 659, 784, 1046, 1318], 0.14, 0.7, 0.3);
        return;
      case 'defeat':
        this.tones([440, 392, 330, 262], 0.18, 0.5, 0.25);
        return;
      case 'ui':
        this.blip(1000, 1250, 0.05, 0.12);
        return;
      case 'uiBack':
        this.blip(900, 650, 0.06, 0.12);
        return;
      default:
        if (this.B[name]) this.snd(name, P({ vol }));
    }
  }

  // Short UI tones are made live (they are needed before the sound set finishes building).
  blip(f0, f1, dur, vol) {
    const c = this.ctx;
    if (!c || !this.master) return;
    const t = c.currentTime + 0.003, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.uiBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  tones(freqs, step, dur, vol) {
    const c = this.ctx;
    if (!c || !this.master) return;
    freqs.forEach((f, i) => {
      const t = c.currentTime + 0.01 + i * step, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
      o.type = 'triangle';
      o2.type = 'sine';
      o.frequency.value = f;
      o2.frequency.value = f * 2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const g2 = c.createGain();
      g2.gain.value = 0.25;
      o.connect(g);
      o2.connect(g2);
      g2.connect(g);
      g.connect(this.uiBus);
      o.start(t);
      o2.start(t);
      o.stop(t + dur + 0.05);
      o2.stop(t + dur + 0.05);
    });
  }

  // ---------- footsteps, impacts, near misses ----------

  surfaceUnder(a) {
    if (a.mode === 'swim' || a.pos.y < -0.25) return 'water';
    const W = this.game.collision;
    const h = W.raycast(a.pos.x, a.pos.y + 0.3, a.pos.z, 0, -1, 0, 0.8);
    if (!h) return 'grass';
    const o = h.collider && h.collider.owner;
    if (o && o.kind === 'build') return o.mat === 'stone' ? 'stone' : o.mat === 'metal' ? 'metal' : 'wood';
    if (o && o.kind === 'vehicle') return 'metal';
    if (h.terrain) {
      const T = this.game.terrain;
      const y = a.pos.y;
      if (y < 2.2) return 'sand';
      if (T.distToRoad(a.pos.x, a.pos.z) < 3.5) return 'stone';
      const b = T.biomeAt(a.pos.x, a.pos.z);
      return b === 'desert' || b === 'beach' ? 'sand' : b === 'snow' ? 'dirt' : 'grass';
    }
    return 'stone';
  }

  footstep(a) {
    if (!this.ok) return;
    const v = a.crouching ? 0.22 : a.sprinting ? 1 : 0.62, s = this.surfaceUnder(a);
    if (a === this.game.player) {
      if (this.game.controller && !this.game.controller.firstPerson) {
        this.snd('st_' + s, { vol: v * 0.4, jit: 0.1 });
      } else this.snd('st_' + s, { vol: v * 0.45, jit: 0.1 });
      if (a.sprinting && Math.random() < 0.55) this.snd('gear', { vol: 0.14, jit: 0.1 });
      return;
    }
    const L = this.game.camera.position;
    const d = Math.hypot(a.pos.x - L.x, a.pos.y - L.y, a.pos.z - L.z);
    if (d > 26) return;
    // enemy footsteps carry: they are the main warning you get
    this.snd('st_' + s, { x: a.pos.x, y: a.pos.y + 0.1, z: a.pos.z, vol: v * 1.5, ref: 9, jit: 0.1, hi: true });
    if (a.sprinting && d < 14 && Math.random() < 0.6) this.snd('gear', { x: a.pos.x, y: a.pos.y + 1, z: a.pos.z, vol: 0.45, ref: 6, jit: 0.1 });
  }

  impact(point, surf) {
    if (!this.ok) return;
    const now = performance.now();
    if (now - this.lastImp < 35) return;
    this.lastImp = now;
    const k = surf === 'metal' ? 'imp_metal' : surf === 'wood' ? 'imp_wood' : surf === 'dirt' || surf === 'grass' || surf === 'sand' ? 'imp_dirt' : surf === 'flesh' ? 'imp_flesh' : surf === 'shield' ? 'imp_shield' : 'imp_stone';
    this.snd(k, { x: point.x, y: point.y, z: point.z, vol: 0.5, ref: 6, jit: 0.12 });
    // now and then a round glances off stone or steel and whines away
    if ((surf === 'metal' || surf === 'stone') && Math.random() < 0.12 && this.listen.distanceTo(point) < 28) this.snd('rico', { x: point.x, y: point.y, z: point.z, vol: 0.3, ref: 7, jit: 0.12 });
  }

  whiz(strength) {
    this.snd('whiz', { vol: 0.55 * strength, jit: 0.15, hi: true });
  }

  // ---------- loops: the vehicle engine and the ambience beds ----------

  loop(name) {
    const buf = this.B[name];
    if (!this.ok || !buf || !this.ctx) return null;
    const c = this.ctx, s = c.createBufferSource();
    s.buffer = Array.isArray(buf) ? buf[0] : buf;
    s.loop = true;
    const g = c.createGain();
    g.gain.value = 0;
    s.connect(g);
    g.connect(this.ambBus);
    s.start(c.currentTime, Math.random() * 5);
    return { s, g };
  }

  startEngine() {
    if (this.engineLoop || !this.ok) return;
    const L = this.loop('amb_engine');
    if (!L) return;
    L.g.disconnect();
    L.g.connect(this.self);
    this.engineLoop = L;
    L.g.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.2);
  }

  engine(level) {
    const L = this.engineLoop;
    if (!L) return;
    const t = this.ctx.currentTime;
    L.s.playbackRate.setTargetAtTime(0.7 + level * 0.9, t, 0.1);
    L.g.gain.setTargetAtTime(0.35 + level * 0.35, t, 0.1);
  }

  stopEngine() {
    const L = this.engineLoop;
    if (!L) return;
    this.engineLoop = null;
    try {
      L.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      L.s.stop(this.ctx.currentTime + 0.5);
    } catch {
      /* already stopped */
    }
  }

  // Each bed fades toward a target level every frame.
  bed(name, level) {
    let L = this.amb[name];
    if (!L) {
      if (level <= 0.001 || !this.B['amb_' + name]) return;
      L = this.amb[name] = this.loop('amb_' + name);
      if (!L) return;
    }
    if (Math.abs((L.lv ?? -1) - level) > 0.01) {
      L.lv = level;
      L.g.gain.setTargetAtTime(level, this.ctx.currentTime, 0.4);
    }
  }

  stopBeds() {
    for (const k of Object.keys(this.amb)) this.bed(k, 0);
  }

  // ---------- per frame: reload foley in sync with the hands, cycling, ambience, muffling ----------

  frame(dt) {
    if (!this.ok || !this.ctx || this.ctx.state !== 'running') return;
    this.frameNo++;
    const g = this.game, a = g.player, playing = g.state === 'playing' && a;
    this.listen.copy(g.camera.position);
    // ambience: wind always, waves near the shore, birds in the green, a roar near the storm wall, rushing air when falling
    if (playing) {
      const cam = g.camera.position;
      const h = g.terrain ? g.terrain.heightAt(cam.x, cam.z) : 0;
      const alt = cam.y - Math.max(0, h);
      const nearSea = clamp(1 - (h - 0) / 6, 0, 1) * (alt < 40 ? 1 : 0);
      const falling = a.alive && (a.mode === 'freefall' || a.mode === 'glide') ? (a.mode === 'freefall' ? 1 : 0.45) : 0;
      let stormNear = 0;
      if (g.storm && g.storm.current) {
        const s = g.storm.current, d = Math.hypot(cam.x - s.x, cam.z - s.z);
        stormNear = clamp(1 - Math.abs(d - s.r) / 60, 0, 1);
        if (d > s.r) stormNear = Math.max(stormNear, 0.85);
      }
      this.bed('wind', 0.35 + clamp(alt / 300, 0, 0.5));
      this.bed('water', nearSea * 0.7);
      this.bed('birds', a.mode === 'ground' && alt < 30 ? 0.5 * (1 - nearSea) : 0);
      this.bed('storm', stormNear * 0.9);
      this.bed('freefall', falling * 1.1);
    } else this.stopBeds();
    // ringing ears after a close blast and the low-health muffle
    let target = 20000;
    if (this.ring > 0) {
      this.ring = Math.max(0, this.ring - dt * 0.45);
      target = Math.min(target, 20000 - 19000 * Math.min(1, this.ring * 1.3));
    }
    if (playing && a.alive && a.health < 35) target = Math.min(target, 1800 + a.health * 120);
    const m = clamp(1 - target / 20000, 0, 0.92);
    if (Math.abs(m - this.muffle) > 0.01) {
      const t = this.ctx.currentTime, tc = m > this.muffle ? 0.04 : 0.4;
      this.muffle = m;
      this.dry.gain.setTargetAtTime(1 - m * 0.85, t, tc);
      this.wet.gain.setTargetAtTime(m * 1.1, t, tc);
    }
    if (!playing || !a.alive || a.mode !== 'ground') {
      this.prevReload = -1;
      return;
    }
    const held = a.held, type = held && held.kind === 'weapon' ? held.type : null;
    // reload foley, timed to the hands
    if (type && a.reloadT > 0 && a.reloadTotal > 0) {
      const f = 1 - a.reloadT / a.reloadTotal;
      const cues = type === 'shotgun' ? RELOAD_CUES.shell : RELOAD_CUES[type === 'pistol' ? 'pis' : type === 'sniper' ? 'sr' : type === 'lmg' ? 'lmg' : type === 'rocket' ? 'rpg' : 'mag'];
      const pf = this.prevReload;
      for (const [q, k, v] of cues) if (v > 0 && f >= q && (pf < q || pf > f)) this.snd(k, { vol: v, jit: 0.05 });
      this.prevReload = f;
    } else this.prevReload = -1;
    // pump and bolt cycling after a shot, in time with the animation; brass landing
    const since = g.time - a.lastShotT;
    if (a.lastShotT !== this.lastShot) {
      this.lastShot = a.lastShotT;
      this.cyc = {};
      if (type && type !== 'shotgun' && type !== 'rocket' && this.brassQ.length < 3) this.brassQ.push(g.time + rand(0.38, 0.62) + (type === 'sniper' ? 0.55 : 0));
    }
    while (this.brassQ.length && g.time >= this.brassQ[0]) {
      this.brassQ.shift();
      if (g.time - this.brassT > 0.08) {
        this.brassT = g.time;
        this.snd('brass', { vol: rand(0.07, 0.13), jit: 0.12 });
      }
    }
    const cue = (tag, at, k, v) => {
      if (since >= at && !this.cyc[tag]) {
        this.cyc[tag] = 1;
        this.snd(k, { vol: v, jit: 0.05 });
      }
    };
    if (type === 'shotgun' && since < 1) {
      cue('pb', 0.16, 'pumpback', 0.8);
      cue('pf', 0.4, 'pumpfwd', 0.85);
    }
    if (type === 'sniper' && since < 1.2) {
      cue('bu', 0.32, 'boltup', 0.6);
      cue('bb', 0.48, 'boltback', 0.75);
      cue('bf', 0.74, 'boltfwd', 0.8);
      cue('bd', 0.93, 'boltdown', 0.7);
    }
    // aim in/out cloth and sprint start
    if (a.adsT > 0.3 && this.prevAds <= 0.3) this.snd('adsin', { vol: 0.35 });
    if (a.adsT < 0.3 && this.prevAds >= 0.3) this.snd('adsout', { vol: 0.25 });
    this.prevAds = a.adsT;
    if (a.sprinting && !this.prevSpr) this.snd('gear', { vol: 0.2 });
    this.prevSpr = a.sprinting;
  }
}
