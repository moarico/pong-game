// Victory cinematic, played when a local player's team wins the match:
// the back of the opponent's goal flaps down, a road builds itself up into the sky, the
// winner drives up it, falls off the end into a black hole and explodes. The hole swells
// and swallows the stadium and the city, the camera pulls out to space, the Earth is eaten
// by a black hole far bigger than the planet, and then the whole universe explodes.
import * as THREE from 'three';
import { S, ARENA, TEAM_COLORS } from '../config.js';
import { BlackHole } from './blackHole.js';
import { SpaceScene } from './space.js';

const { halfZ: HZ, goalDepth: GD, goalH: GH, goalHalfW: GW } = ARENA;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOutCubic = (t) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function easeOutBounce(x) {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
}

// sky road control points in uu for the goal at +z (z is mirrored for the other end)
const ROAD = [
  [0, 0, HZ + GD + GH], [0, 0, 7150], [0, 200, 7800], [0, 700, 8600], [0, 1400, 9500], [0, 2200, 10500], [0, 3100, 11600],
  [300, 4100, 12800], [1300, 5200, 14200], [2600, 6400, 15800], [3500, 7700, 17700], [3500, 9100, 19800], [2400, 10500, 21900],
  [600, 11900, 24000], [-1200, 13300, 26200], [-2200, 14700, 28500], [-1800, 16100, 30900], [-600, 17400, 33300], [0, 18600, 35800],
];
const BH_POS = [0, 16600, 44000];
const BH_R0 = 1500; // horizon radius before the car falls in (uu)
const BH_R1 = 5500; // after
const ROAD_W = 300;
const START_Z = 1300;
const V_MAX = 11000;
const ACCEL = 5000;
const T_DRIVE = 3.3;

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _s = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function roadTextures(team) {
  const tc = TEAM_COLORS[team];
  const mk = () => { const c = document.createElement('canvas'); c.width = 256; c.height = 512; return c; };
  const base = mk(), glow = mk();
  const g = base.getContext('2d'), e = glow.getContext('2d');
  g.fillStyle = '#25282e';
  g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 2500; i++) {
    const v = 30 + Math.random() * 40;
    g.fillStyle = `rgb(${v},${v},${v + 4})`;
    g.fillRect(Math.random() * 256, Math.random() * 512, 2, 2);
  }
  e.fillStyle = '#000';
  e.fillRect(0, 0, 256, 512);
  for (const ctx of [g, e]) {
    ctx.fillStyle = ctx === g ? '#d8dde6' : '#9aa6b8';
    ctx.fillRect(12, 0, 7, 512);
    ctx.fillRect(237, 0, 7, 512);
    ctx.fillStyle = ctx === g ? tc.css : '#fff';
    for (const y0 of [60, 316]) {
      ctx.beginPath();
      ctx.moveTo(128, y0); ctx.lineTo(196, y0 + 70); ctx.lineTo(196, y0 + 120); ctx.lineTo(128, y0 + 50);
      ctx.lineTo(60, y0 + 120); ctx.lineTo(60, y0 + 70);
      ctx.closePath();
      ctx.fill();
    }
  }
  const out = [base, glow].map((c) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  });
  out[0].colorSpace = THREE.SRGBColorSpace;
  return out;
}

// discard everything past the reveal distance and light up the building edge
function revealPatch(mat, reveal, glowCol) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uReveal = reveal;
    sh.uniforms.uRevealCol = glowCol;
    sh.vertexShader = 'attribute float aS;\nvarying float vS;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvS = aS;');
    sh.fragmentShader = 'uniform float uReveal;\nuniform vec3 uRevealCol;\nvarying float vS;\n' + sh.fragmentShader
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vS > uReveal) discard;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uRevealCol * (1.0 - smoothstep(0.0, 1400.0, uReveal - vS)) * 3.0;');
  };
  return mat;
}

export class VictoryCinematic {
  constructor(match, champ, team) {
    this.match = match;
    this.app = match.app;
    this.champ = champ;
    this.team = team;
    this.target = 1 - team; // the goal we drive through
    this.s = this.target === 0 ? -1 : 1;
    this.t = 0;
    this.stage = 1;
    this.done = false;
    this.events = new Set();
    const app = this.app;
    const stadium = app.stadium;
    this.cine = stadium.cine;
    this.quality = app.settings.quality;
    this.group = new THREE.Group();
    match.group.add(this.group);

    // camera + single full-screen view
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 4500);
    this.view = { camera: this.camera, rect: [0, 0, 1, 1], hfov: 82 };
    app.gfx.setViews([this.view]);
    app.hud.show(false);
    // softer bloom so the black hole's shadow stays black
    const bloom = app.gfx.bloom;
    if (bloom) {
      this.bloomWas = { strength: bloom.strength, radius: bloom.radius };
      bloom.strength = 0.38;
      bloom.radius = 0.12;
    }
    for (const e of match.engines) app.audio.updateEngine(e, 0, 0, false, false, false);
    this.engine = app.audio.createEngine(0);

    this.cine.screenFor(this.target).visible = false; // the big screen would hide the road
    this.buildOverlay();
    this.buildRoad();
    this.buildBlackHole();
    this.stageCars();
    this.buildCutEdges();
    this.buildDebris();
    this.shake = 0;
    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.camUp = new THREE.Vector3(0, 1, 0);
    this.camInit = false;
    this.caption(`${team === 0 ? 'BLUE' : 'ORANGE'} WINS!`, `${match.scores[0]} - ${match.scores[1]}`, team === 0 ? 'blue' : 'orange');
    app.audio.cine('rise');
  }

  P(x, y, z) { return new THREE.Vector3(x, y, this.s * z); }

  once(name) {
    if (this.events.has(name)) return false;
    this.events.add(name);
    return true;
  }

  // ------------------------------------------------------------------ overlay (DOM)
  buildOverlay() {
    const el = document.createElement('div');
    el.className = 'cine';
    el.innerHTML = '<div class="cine-fill"></div><div class="cine-bar top"></div><div class="cine-bar bottom"></div>'
      + '<div class="cine-text"><div class="cine-main"></div><div class="cine-sub"></div></div><div class="cine-skip">Press A / Space to skip</div>';
    document.body.appendChild(el);
    this.overlay = el;
    this.fill = el.querySelector('.cine-fill');
    this.textEl = el.querySelector('.cine-text');
    this.mainEl = el.querySelector('.cine-main');
    this.subEl = el.querySelector('.cine-sub');
    this.flashes = [];
    requestAnimationFrame(() => el.classList.add('on'));
  }

  // full-screen colour flash: ramps up over `rise`, holds, then fades over `fall` (seconds)
  flash(color, peak, rise, hold, fall) {
    this.flashes.push({ color, peak, rise: Math.max(0.001, rise), hold, fall: Math.max(0.001, fall), t: 0 });
  }

  updateFlashes(dt) {
    let best = 0, color = '#fff';
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.t += dt;
      let a;
      if (f.t < f.rise) a = f.t / f.rise;
      else if (f.t < f.rise + f.hold) a = 1;
      else a = 1 - (f.t - f.rise - f.hold) / f.fall;
      if (a <= 0 && f.t > f.rise) { this.flashes.splice(i, 1); continue; }
      a *= f.peak;
      if (a > best) { best = a; color = f.color; }
    }
    this.fill.style.opacity = best.toFixed(3);
    this.fill.style.background = color;
  }

  caption(main, sub = '', cls = '') {
    this.mainEl.textContent = main;
    this.subEl.textContent = sub;
    this.textEl.className = 'cine-text show ' + cls;
  }

  hideCaption() { this.textEl.className = 'cine-text'; }

  // ------------------------------------------------------------------ road
  buildRoad() {
    const pts = ROAD.map(([x, y, z]) => this.P(x, y, z));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    curve.arcLengthDivisions = 3000;
    const L = curve.getLength();
    const n = Math.ceil(L / 40);
    const samples = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const p = curve.getPointAt(u);
      const T = curve.getTangentAt(u).normalize();
      samples.push({ s: u * L, p, T, U: new THREE.Vector3(), R: new THREE.Vector3(), bank: 0 });
    }
    // banking from the horizontal curvature
    for (let i = 0; i <= n; i++) {
      const a = samples[Math.max(0, i - 3)], b = samples[Math.min(n, i + 3)];
      const R = _v.crossVectors(samples[i].T, UP).normalize();
      const k = _w.subVectors(b.T, a.T).dot(R) / Math.max(1, b.s - a.s);
      samples[i].k = k;
    }
    for (let i = 0; i <= n; i++) {
      let acc = 0, cnt = 0;
      for (let j = Math.max(0, i - 25); j <= Math.min(n, i + 25); j++) { acc += samples[j].k; cnt++; }
      const bank = THREE.MathUtils.clamp((acc / cnt) * 9000, -0.5, 0.5);
      const sm = samples[i];
      sm.R.crossVectors(sm.T, UP).normalize();
      sm.U.crossVectors(sm.R, sm.T).normalize();
      const c = Math.cos(bank), sn = Math.sin(bank);
      const U = sm.U.clone(), R = sm.R.clone();
      sm.U.copy(U).multiplyScalar(c).addScaledVector(R, sn);
      sm.R.copy(R).multiplyScalar(c).addScaledVector(U, -sn);
    }
    this.samples = samples;
    this.roadLen = L;
    this.groundLen = HZ + GD + GH - START_Z;
    this.totalLen = this.groundLen + L;
    this.roadEnd = samples[n];

    // geometry: deck, frame with rails, LED strips
    const tc = TEAM_COLORS[this.team];
    this.reveal = { value: 0 };
    const glowCol = { value: new THREE.Color(tc.light).multiplyScalar(1.5) };
    const [map, emap] = roadTextures(this.team);
    const W = ROAD_W;
    const deckMat = revealPatch(new THREE.MeshStandardMaterial({
      map, emissiveMap: emap, emissive: new THREE.Color(tc.main), emissiveIntensity: 0.9, roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide,
    }), this.reveal, glowCol);
    const frameMat = revealPatch(new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide }), this.reveal, glowCol);
    const ledMat = revealPatch(new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color(tc.light), emissiveIntensity: 2.2, side: THREE.DoubleSide }), this.reveal, glowCol);
    this.roadMats = [deckMat, frameMat, ledMat];
    this.road = new THREE.Group();
    this.road.add(
      new THREE.Mesh(this.sweep([[-W, 0], [W, 0]], 1200), deckMat),
      new THREE.Mesh(this.sweep([[-W + 22, 1], [-W + 22, 40], [-W - 4, 40], [-W - 4, -55], [W + 4, -55], [W + 4, 40], [W - 22, 40], [W - 22, 1]], 900), frameMat),
      new THREE.Mesh(this.sweep([[-W - 2, 41.5], [-W + 20, 41.5]], 900), ledMat),
      new THREE.Mesh(this.sweep([[W - 20, 41.5], [W + 2, 41.5]], 900), ledMat),
      new THREE.Mesh(this.sweep([[-W - 5, 8], [-W - 5, 24]], 900), ledMat),
      new THREE.Mesh(this.sweep([[W + 5, 24], [W + 5, 8]], 900), ledMat),
    );
    for (const m of this.road.children) { m.frustumCulled = false; m.castShadow = false; }
    this.group.add(this.road);
  }

  // extrude a cross-section (lateral, up) in uu along the road
  sweep(profile, vLen) {
    const N = this.samples.length, M = profile.length;
    const pos = new Float32Array(N * M * 3), uv = new Float32Array(N * M * 2), aS = new Float32Array(N * M);
    for (let i = 0; i < N; i++) {
      const sm = this.samples[i];
      for (let j = 0; j < M; j++) {
        const [a, b] = profile[j];
        const k = i * M + j;
        // R points right; the profile's lateral axis is right-positive
        pos[k * 3] = (sm.p.x + sm.R.x * a + sm.U.x * b) * S;
        pos[k * 3 + 1] = (sm.p.y + sm.R.y * a + sm.U.y * b) * S;
        pos[k * 3 + 2] = (sm.p.z + sm.R.z * a + sm.U.z * b) * S;
        uv[k * 2] = M === 2 ? j : j / (M - 1);
        uv[k * 2 + 1] = sm.s / vLen;
        aS[k] = sm.s;
      }
    }
    const idx = [];
    for (let i = 0; i < N - 1; i++) {
      for (let j = 0; j < M - 1; j++) {
        const a = i * M + j, b = (i + 1) * M + j, c = (i + 1) * M + j + 1, d = i * M + j + 1;
        idx.push(a, b, d, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // position/orientation along the whole drive (ground run + road), s in uu
  frameAt(s, out) {
    if (s < this.groundLen) {
      out.p.set(0, 0, this.s * (START_Z + s));
      out.T.set(0, 0, this.s);
      out.U.set(0, 1, 0);
      out.R.crossVectors(out.T, UP).normalize();
      return out;
    }
    const sr = s - this.groundLen;
    const smp = this.samples;
    const f = sr / (this.roadLen / (smp.length - 1));
    if (f >= smp.length - 1) {
      const e = smp[smp.length - 1];
      out.p.copy(e.p).addScaledVector(e.T, sr - this.roadLen);
      out.T.copy(e.T); out.U.copy(e.U); out.R.copy(e.R);
      return out;
    }
    const i = Math.floor(f), k = f - i;
    const a = smp[i], b = smp[i + 1];
    out.p.lerpVectors(a.p, b.p, k);
    out.T.lerpVectors(a.T, b.T, k).normalize();
    out.U.lerpVectors(a.U, b.U, k).normalize();
    out.R.lerpVectors(a.R, b.R, k).normalize();
    return out;
  }

  // distance travelled at cinematic time t
  driveDist(t) {
    const tt = Math.max(0, t - T_DRIVE);
    const ta = V_MAX / ACCEL;
    if (tt < ta) return 0.5 * ACCEL * tt * tt;
    return 0.5 * ACCEL * ta * ta + V_MAX * (tt - ta);
  }

  driveSpeed(t) {
    const tt = Math.max(0, t - T_DRIVE);
    return Math.min(V_MAX, ACCEL * tt);
  }

  timeAt(dist) {
    const ta = V_MAX / ACCEL;
    const da = 0.5 * ACCEL * ta * ta;
    if (dist < da) return T_DRIVE + Math.sqrt((2 * dist) / ACCEL);
    return T_DRIVE + ta + (dist - da) / V_MAX;
  }

  // ------------------------------------------------------------------ black hole, cars, debris
  buildBlackHole() {
    this.bhPos = this.P(...BH_POS);
    this.bh = new BlackHole({ segments: this.quality === 'low' ? 0.6 : 1 });
    this.bh.group.position.copy(this.bhPos).multiplyScalar(S);
    this.bh.group.scale.setScalar(BH_R0 * S);
    // tilt the disk toward the wide shot's camera so it is seen at a Gargantua-like angle
    const toCam = _v.set(-560, 0, this.s * -260).sub(_w.copy(this.bhPos).multiplyScalar(S).setY(0)).normalize();
    this.bh.group.quaternion.setFromUnitVectors(UP, _w.copy(UP).addScaledVector(toCam, 0.3).normalize());
    this.bh.u.uI.value = 0.6;
    this.bh.u.uGlow.value = 0.6;
    this.group.add(this.bh.group);
    this.bhR = BH_R0;
    this.tEnd = this.timeAt(this.totalLen);
    this.fallDur = 1.25;
    this.tBoom = this.tEnd + this.fallDur;
    this.tSuck = this.tBoom + 0.55;
    this.tSpace = this.tSuck + 5.6;
    // clear buildings out of the road's way
    const b = this.cine.buildings;
    this.bMats = [];
    this.roadBlocked = new Set();
    const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
    for (let i = 0; i < b.count; i++) {
      b.getMatrixAt(i, _m);
      this.bMats.push(_m.clone());
      _m.decompose(pos, quat, scl);
      let blocked = false;
      for (let k = 0; k < this.samples.length; k += 4) {
        const sm = this.samples[k];
        const dx = sm.p.x * S - pos.x, dz = sm.p.z * S - pos.z;
        const r = Math.max(scl.x, scl.z) * 0.75 + 12;
        if (dx * dx + dz * dz < r * r && pos.y + scl.y + 8 > sm.p.y * S) { blocked = true; break; }
      }
      if (blocked) {
        this.roadBlocked.add(i);
        _m.compose(pos, quat, _s.set(0, 0, 0));
        b.setMatrixAt(i, _m);
      }
    }
    b.instanceMatrix.needsUpdate = true;
  }

  stageCars() {
    const m = this.match;
    const s = this.s;
    this.carState = { team: this.team, vel: new THREE.Vector3(), boosting: false, supersonic: false, demolished: false, steerVisual: 0, wheelSpin: 0, wheelDist: [17, 17, 17, 17], onGround: true };
    // everybody else lines the run-up to the goal
    const others = m.players.filter((p) => p !== this.champ);
    others.forEach((p, i) => {
      const side = p.car.team === this.team ? 1 : -1;
      const row = Math.floor(i / 2);
      const x = side * (700 + (i % 2) * 260);
      const z = s * (2300 + row * 1300 + (i % 2) * 400);
      p.model.root.position.set(x * S, 17 * S, z * S);
      p.model.root.quaternion.setFromAxisAngle(UP, Math.atan2(-x, 0));
      p.model.root.scale.setScalar(1);
      p.model.flame.visible = false;
      p.model.root.visible = true;
    });
    for (const p of m.players) if (p.model.blob) p.model.blob.visible = false;
    if (m.ballBlob) m.ballBlob.visible = false;
    // ball sits off to the side
    this.ballWasVisible = m.ball.visible;
    m.ball.visible = true;
    m.ball.position.set(-1900 * S, 93 * S, s * 3200 * S);
    this.champ.model.root.visible = true;
    this.champ.model.root.scale.setScalar(1);
    this.frame = { p: new THREE.Vector3(), T: new THREE.Vector3(), U: new THREE.Vector3(), R: new THREE.Vector3() };
    this.camFrame = { p: new THREE.Vector3(), T: new THREE.Vector3(), U: new THREE.Vector3(), R: new THREE.Vector3() };
    this.carPos = new THREE.Vector3();
    this.carQuat = new THREE.Quaternion();
    this.placeChamp(0, 0);
  }

  // glowing seams where the slot is cut through the stands
  buildCutEdges() {
    const tc = TEAM_COLORS[this.team];
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(tc.light).multiplyScalar(3), fog: false });
    this.edgeMat = mat;
    this.edges = [];
    const mk = (prof) => {
      const path = new THREE.CurvePath();
      for (let i = 0; i < prof.length - 1; i++) {
        const a = prof[i], b = prof[i + 1];
        path.add(new THREE.LineCurve3(new THREE.Vector3(0, a[1] * S, this.s * (HZ + a[0]) * S), new THREE.Vector3(0, b[1] * S, this.s * (HZ + b[0]) * S)));
      }
      return new THREE.TubeGeometry(path, prof.length * 8, 0.22, 6, false);
    };
    for (const side of [-1, 1]) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(mk(this.cine.standEdge), mat), new THREE.Mesh(mk(this.cine.roofEdge), mat));
      g.userData.side = side;
      g.visible = false;
      this.cine.arena.parent.add(g); // with the stadium so it leaves with it
      this.edges.push(g);
    }
  }

  buildDebris() {
    const low = this.quality === 'low';
    const n = low ? 180 : 420;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.1 });
    const mesh = new THREE.InstancedMesh(geo, mat, n);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    const col = new THREE.Color();
    const s = this.s;
    this.debris = [];
    for (let i = 0; i < n; i++) {
      const kind = Math.random();
      const d = { p0: new THREE.Vector3(), size: new THREE.Vector3(), axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), spin: 2 + Math.random() * 6 };
      if (kind < 0.45) {
        // turf ripped out of the field
        d.p0.set((Math.random() * 2 - 1) * 38, 0.3, (Math.random() * 2 - 1) * 48);
        d.size.set(1.5 + Math.random() * 4, 0.4 + Math.random() * 0.6, 1.5 + Math.random() * 4);
        col.setRGB(0.07 + Math.random() * 0.05, 0.16 + Math.random() * 0.08, 0.04);
      } else if (kind < 0.8) {
        // chunks of the stands, seats and all
        const a = Math.random() * Math.PI * 2;
        const r = 1 + Math.random() * 0.45;
        d.p0.set(Math.cos(a) * 52 * r, 8 + Math.random() * 30, Math.sin(a) * 63 * r);
        d.size.set(1 + Math.random() * 5, 0.8 + Math.random() * 3, 1 + Math.random() * 5);
        const seat = Math.random();
        if (seat < 0.3) col.setHex(TEAM_COLORS[d.p0.z * s > 0 ? this.target : this.team].main).multiplyScalar(0.5);
        else col.setRGB(0.2, 0.21, 0.23);
      } else {
        // lights, ad boards, anything
        d.p0.set((Math.random() * 2 - 1) * 70, Math.random() * 50, (Math.random() * 2 - 1) * 90);
        d.size.set(0.3 + Math.random() * 2, 0.3 + Math.random() * 2, 0.3 + Math.random() * 2);
        col.setRGB(0.5 + Math.random() * 0.5, 0.5, 0.5);
      }
      d.t0 = Math.random() * 3.6;
      d.dur = 2.2 + Math.random() * 1.8;
      d.swirl = 1.5 + Math.random() * 2.5;
      d.lift = 8 + Math.random() * 25;
      this.debris.push(d);
      mesh.setColorAt(i, col);
      mesh.setMatrixAt(i, _m.makeScale(0, 0, 0));
    }
    mesh.instanceColor.needsUpdate = true;
    mesh.visible = false;
    this.debrisMesh = mesh;
    this.group.add(mesh);
  }

  // pulled into the hole: start point p0 (m), progress u 0..1; returns scale factor
  suckPos(p0, u, swirl, lift, out) {
    const B = _w.copy(this.bhPos).multiplyScalar(S);
    const rel = _v.copy(p0).sub(B);
    const r0 = rel.length();
    const f = Math.pow(u, 1.7);
    const hR = this.bhR * S;
    const r = r0 * (1 - f) + hR * 0.6 * f;
    const ang = swirl * Math.pow(u, 2.4);
    const c = Math.cos(ang), sn = Math.sin(ang);
    const x = rel.x * c + rel.z * sn, z = -rel.x * sn + rel.z * c;
    out.set(x, rel.y, z).multiplyScalar(r / r0).add(B);
    out.y += lift * Math.sin(Math.PI * Math.min(1, u * 1.5)) * (1 - u);
    return clamp01((r - hR * 0.75) / (hR * 1.2));
  }

  // ------------------------------------------------------------------ per frame
  placeChamp(t, dt) {
    const f = this.frameAt(this.driveDist(t), this.frame);
    this.carPos.copy(f.p).addScaledVector(f.U, 17);
    _m.makeBasis(_v.copy(f.R).negate(), f.U, f.T);
    this.carQuat.setFromRotationMatrix(_m);
    const sp = this.driveSpeed(t);
    const c = this.carState;
    c.vel.copy(f.T).multiplyScalar(sp);
    c.boosting = t > T_DRIVE - 0.1;
    c.supersonic = sp > 2200;
    c.wheelSpin += (sp / 17) * dt;
    const model = this.champ.model;
    model.update(c, this.carPos, this.carQuat, dt);
    this.match.effects.carTrail(c, this.carPos, this.carQuat, dt);
  }

  update(dt, skip) {
    if (this.done) return false;
    dt = Math.min(dt, 0.05);
    const t = this.t;
    this.t += dt;
    if (skip && t > 1.0) { this.finish(true); return false; }
    this.updateFlashes(dt);
    if (this.stage === 1) this.updateStadium(t, dt);
    else this.updateSpace(t, dt);
    if (this.done) return false;
    this.app.gfx.render();
    return true;
  }

  updateStadium(t, dt) {
    const app = this.app;
    const cine = this.cine;
    const match = this.match;
    const s = this.s;
    const tc = TEAM_COLORS[this.team];

    if (t > 2.6 && this.once('caption-off')) this.hideCaption();
    // goal back flaps down, the stands open up
    const flapU = clamp01((t - 0.6) / 1.1);
    cine.setGoalFlap(this.target, (Math.PI / 2) * easeOutBounce(flapU));
    if (t > 0.6 && this.once('flap')) { app.audio.cine('flap'); app.stadium.goalFlash(this.target); }
    if (t > 1.2 && this.once('flapLand')) app.audio.cine('clunk');
    const cutW = GW * easeInOut(clamp01((t - 0.5) / 1.1));
    cine.setCut(this.target, t < this.tSuck + 2.3 ? cutW : 0); // closed again before the stands fly away
    for (const e of this.edges) {
      e.visible = cutW > 1 && t < this.tSuck + 2.2;
      e.position.x = e.userData.side * cutW * S;
    }
    // the road builds itself into the sky
    const buildU = easeInOut(clamp01((t - 1.1) / 2.5));
    if (t > 1.1 && this.once('build')) app.audio.cine('build');
    if (t < this.tBoom) this.reveal.value = this.roadLen * buildU;
    else this.reveal.value = this.roadLen * (1 - easeInOut(clamp01((t - this.tBoom) / 3.2))); // swallowed from the end
    if (t > T_DRIVE - 0.2 && this.once('go')) app.audio.cine('launch');

    // the winner drives
    if (t < this.tEnd) {
      this.placeChamp(t, dt);
      const sp = this.driveSpeed(t);
      app.audio.updateEngine(this.engine, Math.min(2300, sp), t > T_DRIVE ? 1 : 0, t > T_DRIVE - 0.1, true, true);
    } else if (t < this.tBoom) {
      // off the end of the road and into the hole
      if (this.once('fall')) {
        this.fallFrom = this.roadEnd.p.clone().addScaledVector(this.roadEnd.U, 17);
        this.fallDir = this.roadEnd.T.clone();
        this.fallQuat = this.carQuat.clone();
        app.audio.cine('whoosh');
      }
      const u = clamp01((t - this.tEnd) / this.fallDur);
      const k = Math.pow(u, 1.35);
      const P0 = this.fallFrom, P1 = _w.copy(P0).addScaledVector(this.fallDir, 4200), P2 = this.bhPos;
      const a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k;
      this.carPos.set(P0.x * a + P1.x * b + P2.x * c, P0.y * a + P1.y * b + P2.y * c, P0.z * a + P1.z * b + P2.z * c);
      // nose dives toward the hole, then it is stretched like spaghetti
      const vel = _v.set(2 * (1 - k) * (P1.x - P0.x) + 2 * k * (P2.x - P1.x), 2 * (1 - k) * (P1.y - P0.y) + 2 * k * (P2.y - P1.y), 2 * (1 - k) * (P1.z - P0.z) + 2 * k * (P2.z - P1.z)).normalize();
      _q.setFromUnitVectors(_s.set(0, 0, 1), vel);
      _q2.setFromAxisAngle(_s.set(0, 0, 1), u * u * 9);
      _q.multiply(_q2);
      this.carQuat.copy(this.fallQuat).slerp(_q, smooth(0, 0.5, u));
      const c2 = this.carState;
      c2.vel.copy(vel).multiplyScalar(V_MAX);
      c2.boosting = u < 0.4;
      const model = this.champ.model;
      model.update(c2, this.carPos, this.carQuat, dt);
      const d = this.carPos.distanceTo(this.bhPos);
      const stretch = clamp01(1 - (d - this.bhR) / (this.bhR * 3));
      model.root.scale.set(1 - stretch * 0.7, 1 - stretch * 0.7, 1 + stretch * 5);
      if (c2.boosting) match.effects.carTrail(c2, this.carPos, this.carQuat, dt);
      app.audio.updateEngine(this.engine, 2300, 0, false, false, u < 0.6);
    } else if (this.once('boom')) {
      // the car explodes inside the hole, and the hole swells
      this.champ.model.root.visible = false;
      app.audio.updateEngine(this.engine, 0, 0, false, false, false);
      app.audio.cine('boom');
      this.flash('#fff3e0', 0.35, 0.04, 0.05, 0.6);
      this.shake = 1.4;
      const B = _v.copy(this.bhPos).multiplyScalar(S);
      const fx = match.effects;
      this.nova = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.5, 0.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      this.nova.position.copy(B);
      this.ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 128), new THREE.MeshBasicMaterial({ color: new THREE.Color(tc.light).multiplyScalar(5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      this.ring.position.copy(B);
      this.ring.quaternion.copy(this.bh.group.quaternion).multiply(_q.setFromAxisAngle(_s.set(1, 0, 0), Math.PI / 2));
      this.group.add(this.nova, this.ring);
      const fl = tc.flame;
      const n = Math.round(320 * fx.mult);
      for (let i = 0; i < n; i++) {
        _w.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(40 + Math.random() * 160);
        fx.glow.emit(B.x, B.y, B.z, _w.x, _w.y, _w.z, 0.8 + Math.random() * 1.4, 2 + Math.random() * 4, 0.6 + Math.random() * 1.5,
          [fl[0] * 1.6, fl[1] * 1.6, fl[2] * 1.6, 1], [1.4, 0.4, 0.08, 0], 0.6, 0);
      }
    }
    if (this.nova) {
      const u = (t - this.tBoom) / 0.9;
      this.nova.visible = u < 1;
      if (u < 1) {
        this.nova.scale.setScalar(this.bhR * S * (1 + 1.6 * easeOutCubic(u)));
        this.nova.material.opacity = (1 - u) * (1 - u);
      }
      const v = (t - this.tBoom) / 1.8;
      this.ring.visible = v < 1;
      if (v < 1) {
        this.ring.scale.setScalar(this.bhR * S * (2 + 22 * easeOutCubic(v)));
        this.ring.material.opacity = 1 - v;
      }
    }
    // the black hole grows after it eats the car
    const grow = easeOutCubic(clamp01((t - this.tBoom) / 2.6));
    this.bhR = BH_R0 + (BH_R1 - BH_R0) * grow;
    this.bh.group.scale.setScalar(this.bhR * S);
    this.bh.u.uI.value = 0.6 + grow * 0.4;
    this.bh.u.uGlow.value = 0.6 + grow * 0.6;

    // everything gets sucked in
    if (t > this.tSuck) this.updateSuck(t - this.tSuck);

    this.updateCamera(t, dt);
    this.bh.update(dt, this.camera);
    match.effects.update(dt);
    app.stadium.update(dt);

    // hand over to space
    if (t > this.tSpace - 0.45 && this.once('toSpace')) {
      this.flash('#d6ebff', 1, 0.45, 0.12, 1.1);
      app.audio.cine('whoosh');
    }
    if (t > this.tSpace && this.once('space')) this.enterSpace();
  }

  updateSuck(ts) {
    const match = this.match;
    const app = this.app;
    if (this.once('suck')) {
      app.audio.cine('drone');
      this.debrisMesh.visible = true;
      // capture start positions of everything loose
      this.loose = [];
      for (const p of match.players) {
        if (p === this.champ) continue;
        this.loose.push({ obj: p.model.root, p0: p.model.root.position.clone(), q0: p.model.root.quaternion.clone(), t0: 0.2 + Math.random() * 1.2, dur: 2.4 + Math.random(), axis: new THREE.Vector3(Math.random() - 0.5, 1, Math.random() - 0.5).normalize(), spin: 3 + Math.random() * 4, swirl: 2 + Math.random() * 2, lift: 15 });
      }
      this.loose.push({ obj: match.ball, p0: match.ball.position.clone(), q0: match.ball.quaternion.clone(), t0: 0.1, dur: 2.6, axis: new THREE.Vector3(1, 0, 0), spin: 6, swirl: 2.5, lift: 20 });
      const B = _v.copy(this.bhPos).multiplyScalar(S);
      this.bStart = this.bMats.map((m, i) => {
        const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
        m.decompose(pos, quat, scl);
        const d = pos.distanceTo(B);
        return {
          pos, quat, scl, t0: 0.6 + (d / 900) * 2.6 + Math.random() * 0.5, dur: 2.4 + Math.random() * 1.2,
          axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          spin: 0.6 + Math.random() * 1.6, swirl: 1 + Math.random() * 2, hidden: this.roadBlocked.has(i),
        };
      });
    }
    // debris chunks
    const mesh = this.debrisMesh;
    const tmp = this._tmp || (this._tmp = new THREE.Vector3());
    for (let i = 0; i < this.debris.length; i++) {
      const d = this.debris[i];
      const u = clamp01((ts - d.t0) / d.dur);
      if (u <= 0 || u >= 1) { mesh.setMatrixAt(i, _m.makeScale(0, 0, 0)); continue; }
      const k = this.suckPos(d.p0, u, d.swirl, d.lift, tmp);
      _q.setFromAxisAngle(d.axis, d.spin * (ts - d.t0));
      _s.copy(d.size).multiplyScalar(k * Math.min(1, u * 8));
      mesh.setMatrixAt(i, _m.compose(tmp, _q, _s));
    }
    mesh.instanceMatrix.needsUpdate = true;
    // cars and the ball
    for (const l of this.loose) {
      const u = clamp01((ts - l.t0) / l.dur);
      if (u <= 0) continue;
      const k = this.suckPos(l.p0, u, l.swirl, l.lift, tmp);
      l.obj.position.copy(tmp);
      _q.setFromAxisAngle(l.axis, l.spin * (ts - l.t0) * u);
      l.obj.quaternion.copy(l.q0).premultiply(_q);
      l.obj.scale.setScalar(Math.max(0.001, k));
      l.obj.visible = u < 1;
    }
    // the city
    const bld = this.cine.buildings;
    for (let i = 0; i < this.bStart.length; i++) {
      const b = this.bStart[i];
      if (b.hidden) continue;
      const u = clamp01((ts - b.t0) / b.dur);
      if (u <= 0) continue;
      const k = this.suckPos(b.pos, u, b.swirl, 0, tmp);
      _q.setFromAxisAngle(b.axis, b.spin * (ts - b.t0)).multiply(b.quat);
      _s.copy(b.scl).multiplyScalar(k);
      bld.setMatrixAt(i, _m.compose(tmp, _q, _s));
    }
    bld.instanceMatrix.needsUpdate = true;
    // finally the stadium itself rips off the ground
    const ua = clamp01((ts - 2.4) / 2.9);
    if (ua > 0) {
      const arena = this.cine.arena;
      const k = this.suckPos(_s.set(0, 0, 0), ua, 1.2, 30, tmp);
      arena.position.copy(tmp);
      arena.quaternion.setFromAxisAngle(_v.set(1, 0, 0.4).normalize(), -this.s * 1.4 * ua * ua);
      arena.scale.setScalar(S * Math.max(0.001, k));
      arena.visible = k > 0.002;
      for (const e of this.edges) e.visible = false;
      if (this.once('arenaGo')) app.audio.cine('tear');
    }
  }

  updateCamera(t, dt) {
    const cam = this.camera;
    const s = this.s;
    const pos = this.camPos, look = this.camLook;
    let up = UP;
    let snap = false;
    if (t < 3.7) {
      // establishing shot: the goal opens and the road shoots into the sky
      const u = t / 3.7;
      pos.set(430 - 120 * u, 200 - 30 * u, s * (300 + 380 * u)).multiplyScalar(S);
      const goal = _v.set(0, 380, s * 6000);
      const front = this.frameAt(this.groundLen + this.reveal.value, this.camFrame).p;
      const k1 = smooth(1.2, 2.6, t);
      look.copy(goal).lerp(front, k1 * 0.85).lerp(this.bhPos, smooth(2.7, 3.6, t) * 0.8).multiplyScalar(S);
      snap = !this.camInit;
    } else if (t < this.tEnd - 0.3) {
      // chase cam along the road
      if (this.once('chaseCut')) snap = true;
      const sd = this.driveDist(t);
      const f = this.frameAt(sd - 560, this.camFrame);
      _v.copy(f.p).addScaledVector(f.U, 200);
      pos.copy(_v).multiplyScalar(S);
      look.copy(this.carPos).addScaledVector(this.frame.T, 900).addScaledVector(this.frame.U, 60).multiplyScalar(S);
      up = this.camUpTarget || (this.camUpTarget = new THREE.Vector3());
      up.copy(f.U);
    } else if (t < this.tSuck) {
      // side-on: off the end of the road and down into the hole
      if (this.once('sideCut')) {
        snap = true;
        const E = this.roadEnd.p;
        const side = _w.crossVectors(this.roadEnd.T, UP).normalize();
        this.sidePos = E.clone().lerp(this.bhPos, 0.45).addScaledVector(side, 6800).add(_v.set(0, 1300, 0)).addScaledVector(this.roadEnd.T, -1800);
        this.sideLook = E.clone().lerp(this.bhPos, 0.55);
      }
      const u = clamp01((t - this.tEnd + 0.3) / (this.tBoom - this.tEnd + 0.3));
      pos.copy(this.sidePos).lerp(this.sideLook, u * 0.25);
      // recoil from the blast
      pos.addScaledVector(_v.subVectors(this.sidePos, this.sideLook), 1.2 * easeOutCubic(clamp01((t - this.tBoom) / 0.55)));
      pos.multiplyScalar(S);
      look.copy(this.sideLook).multiplyScalar(S);
    } else {
      // wide: the hole pulls the stadium apart; slowly pull back toward space
      if (this.once('wideCut')) snap = true;
      const u = clamp01((t - this.tSuck) / (this.tSpace - this.tSuck));
      const L = _w.set(0, 90, s * 170);
      const C0 = _v.set(-560, 420, s * -260);
      pos.copy(C0).sub(L).multiplyScalar(1 + 1.2 * u * u).add(L);
      pos.y += 300 * u * u;
      look.copy(L).lerp(_w.set(0, 140, s * 300), u);
    }
    if (snap || !this.camInit) {
      this.camInit = true;
      this.camUp.copy(up);
    } else {
      this.camUp.lerp(up, 1 - Math.exp(-dt * 6)).normalize();
    }
    this.shake = Math.max(0, this.shake - dt * 0.9);
    const suckShake = t > this.tSuck ? 0.25 + 0.35 * clamp01((t - this.tSuck) / 4) : 0;
    const sh = Math.max(this.shake, suckShake);
    cam.position.copy(pos);
    if (sh > 0) {
      const k = 0.006 * sh * pos.distanceTo(look);
      cam.position.x += (Math.random() - 0.5) * k;
      cam.position.y += (Math.random() - 0.5) * k;
      cam.position.z += (Math.random() - 0.5) * k;
    }
    cam.up.copy(this.camUp);
    cam.lookAt(look);
  }

  // ------------------------------------------------------------------ space
  enterSpace() {
    const app = this.app;
    this.stage = 2;
    this.hideStadiumBits();
    app.audio.stopEngine(this.engine);
    const fx = {
      flash: (c, p, r, h, f) => this.flash(c, p, r, h, f),
      text: () => this.caption(`${this.team === 0 ? 'BLUE' : 'ORANGE'} WINS!`, '...and blew up the universe', 'final ' + (this.team === 0 ? 'blue' : 'orange')),
      sound: (n) => app.audio.cine(n),
      shake: (a) => { this.space.shakeAmt = Math.max(this.space.shakeAmt, a); },
    };
    this.space = new SpaceScene(app.gfx.renderer, this.quality, fx);
    this.view.camera = this.space.camera;
    this.view.hfov = 80;
    app.gfx.overrideScene = this.space.scene;
    app.gfx.setViews([this.view]);
    app.audio.cine('space');
  }

  updateSpace(t, dt) {
    const sp = this.space;
    sp.update(dt);
    const want = 80 * (sp.fov / 55);
    if (Math.abs(want - this.view.hfov) > 0.5) { this.view.hfov = want; this.app.gfx.updateCameras(); }
    if (sp.done) this.finish(false);
  }

  hideStadiumBits() {
    // nothing from the stadium shows in space
    this.debrisMesh.visible = false;
    for (const e of this.edges) e.visible = false;
  }

  // ------------------------------------------------------------------ end
  finish(skipped) {
    if (this.done) return;
    this.done = true;
    this.app.audio.cine('stop');
    this.restore();
    // fade from white back to the stadium under the results screen
    this.overlay.classList.add('out');
    this.fill.style.transition = `opacity ${skipped ? 0.35 : 1.2}s ease`;
    this.fill.style.background = '#fff';
    this.fill.style.opacity = skipped ? '0.6' : '1';
    requestAnimationFrame(() => { this.fill.style.opacity = '0'; });
    const el = this.overlay;
    setTimeout(() => el.remove(), skipped ? 600 : 1800);
    this.textEl.className = 'cine-text';
  }

  restore() {
    const app = this.app;
    const match = this.match;
    if (this.bloomWas && app.gfx.bloom) Object.assign(app.gfx.bloom, this.bloomWas);
    app.gfx.overrideScene = null;
    if (this.space) { this.space.dispose(); this.space = null; }
    this.cine.reset();
    const b = this.cine.buildings;
    this.bMats.forEach((m, i) => b.setMatrixAt(i, m));
    b.instanceMatrix.needsUpdate = true;
    for (const e of this.edges) { e.parent.remove(e); e.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    this.edgeMat.dispose();
    for (const p of match.players) { p.model.root.scale.setScalar(1); p.model.root.visible = true; }
    match.ball.scale.setScalar(1);
    match.ball.visible = this.ballWasVisible;
    match.effects.clear();
    this.group.parent.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const mm of mats) { if (mm.map) mm.map.dispose(); if (mm.emissiveMap) mm.emissiveMap.dispose(); mm.dispose(); }
      }
    });
    this.bh.dispose();
    app.audio.stopEngine(this.engine);
  }

  dispose() {
    if (!this.done) {
      this.done = true;
      this.app.audio.cine('stop');
      this.restore();
    }
    this.overlay.remove();
  }
}
