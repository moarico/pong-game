import * as THREE from 'three';
import { S, DT, BALL, KICKOFF_SPOTS, TEAM_COLORS, ARENA } from './config.js';
import { World } from './physics/world.js';
import { Car } from './physics/car.js';
import { predictBall } from './physics/ball.js';
import { Bot } from './ai.js';
import { CarModel } from './render/carModel.js';
import { Effects } from './render/effects.js';
import { CameraRig } from './render/cameraRig.js';
import { ballTextures } from './render/textures.js';

const BOT_NAMES = ['Atlas', 'Blitz', 'Comet', 'Dash', 'Echo', 'Flare', 'Ghost', 'Havoc', 'Jinx', 'Nova', 'Rex', 'Zippy', 'Vortex', 'Turbo'];
const REPLAY_SECONDS = 6;
const SNAP_HZ = 60;

let ballTex = null;
function ballMesh() {
  if (!ballTex) ballTex = ballTextures(1024);
  const mat = new THREE.MeshStandardMaterial({
    map: ballTex.map, emissive: 0xffffff, emissiveMap: ballTex.emissiveMap, emissiveIntensity: 2.4,
    roughness: 1, roughnessMap: ballTex.roughnessMap, metalness: 0.65, bumpMap: ballTex.bumpMap, bumpScale: 1.2,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(BALL.radius * S, 64, 40), mat);
  m.castShadow = true;
  return m;
}

const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _bp = new THREE.Vector3();
const _bq = new THREE.Quaternion();

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class Match {
  // cfg: { mode, teamSize, duration (s, 0 = unlimited), difficulty, humans:[{device, team, name}], split }
  constructor(app, cfg) {
    this.app = app;
    this.cfg = cfg;
    this.attract = cfg.mode === 'attract';
    this.world = new World();
    this.group = new THREE.Group();
    app.gfx.scene.add(this.group);
    this.effects = new Effects(this.group, app.settings.quality);
    this.ball = ballMesh();
    this.group.add(this.ball);
    if (app.settings.quality === 'low') this.ballBlob = this.addBlob(1.7, 1.7);

    // players
    this.players = [];
    const names = shuffle(BOT_NAMES.slice());
    for (const team of [0, 1]) {
      const humans = cfg.humans.filter((h) => h.team === team);
      for (let i = 0; i < cfg.teamSize; i++) {
        const h = humans[i];
        const car = this.world.addCar(new Car(team, h ? h.name : names.pop()));
        const model = new CarModel(team);
        this.group.add(model.root);
        if (app.settings.quality === 'low') model.blob = this.addBlob(1.6, 2.2);
        const p = { car, model, human: !!h, device: h ? h.device : null, bot: h ? null : new Bot(car, cfg.difficulty), name: car.name };
        this.players.push(p);
      }
    }
    this.humans = this.players.filter((p) => p.human);

    // views
    this.views = [];
    const n = this.humans.length;
    if (this.attract || n === 0) {
      const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);
      this.views.push({ camera: cam, rect: [0, 0, 1, 1], hfov: 90, rig: new CameraRig(cam) });
    } else {
      this.humans.forEach((p, i) => {
        const cam = new THREE.PerspectiveCamera(70, 1, 0.05, 3000);
        let rect = [0, 0, 1, 1];
        if (n === 2) rect = cfg.split === 'vertical' ? [i * 0.5, 0, 0.5, 1] : [0, i * 0.5, 1, 0.5];
        const rig = new CameraRig(cam);
        rig.ballCam = app.settings.ballCam;
        if (n === 2 && cfg.split !== 'vertical') { rig.distance = 310; rig.height = 120; }
        const view = { camera: cam, rect, hfov: app.settings.fov, rig, player: p, label: p.name, team: p.car.team };
        p.view = view;
        p.viewIndex = i;
        this.views.push(view);
      });
    }
    this.replayCam = new THREE.PerspectiveCamera(55, 1, 0.1, 3000);
    this.replayRig = new CameraRig(this.replayCam);
    this.replayView = { camera: this.replayCam, rect: [0, 0, 1, 1], hfov: 80 };
    app.gfx.setViews(this.views);

    if (!this.attract) {
      app.hud.setup(this.views);
      app.hud.show(true);
      this.engines = this.humans.map((p, i) => app.audio.createEngine(n === 2 && cfg.split === 'vertical' ? (i === 0 ? -0.5 : 0.5) : 0));
    } else {
      this.engines = [];
    }

    this.scores = [0, 0];
    this.clock = cfg.duration || 0;
    this.unlimited = !cfg.duration;
    this.overtime = false;
    this.state = 'countdown';
    this.stateT = 0;
    this.acc = 0;
    this.pred = [];
    this.predFrame = 0;
    this.threat = -1;
    this.frame = 0;
    this.time = 0;
    // replay ring buffer
    this.snapSize = 9 + 13 * this.players.length;
    this.snapCount = REPLAY_SECONDS * SNAP_HZ;
    this.snaps = new Float32Array(this.snapSize * this.snapCount);
    this.snapHead = 0;
    this.snapFilled = 0;
    this.stepIndex = 0;
    this.fakeCars = this.players.map((p) => ({ team: p.car.team, vel: new THREE.Vector3(), boosting: false, supersonic: false, demolished: false, steerVisual: 0, wheelSpin: 0, wheelDist: [17, 17, 17, 17], onGround: true }));
    this.kickoff();
  }

  addBlob(w, l) {
    if (!Match.blobTex) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(0,0,0,0.55)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      Match.blobTex = new THREE.CanvasTexture(c);
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), new THREE.MeshBasicMaterial({ map: Match.blobTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = 1;
    this.group.add(m);
    return m;
  }

  placeBlob(blob, pos, quat, height) {
    if (!blob) return;
    const h = pos.y - height;
    blob.visible = h < 600;
    blob.position.set(pos.x * S, 0.03, pos.z * S);
    const k = Math.max(0.4, 1 - h / 800);
    blob.scale.setScalar(k);
    blob.material.opacity = k;
    if (quat) blob.rotation.z = Math.atan2(2 * (quat.w * quat.y + quat.x * quat.z), 1 - 2 * (quat.y * quat.y + quat.z * quat.z));
  }

  dispose() {
    this.app.gfx.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
      if (o.material && o.material !== this.ball.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) m.dispose();
      }
    });
    this.app.audio.stopEngines();
  }

  // ---------------------------------------------------------------- flow
  kickoff() {
    const w = this.world;
    w.ball.reset();
    w.resetPads();
    this.ball.visible = true;
    const idx = shuffle([0, 1, 2, 3, 4]);
    for (const team of [0, 1]) {
      const mates = this.players.filter((p) => p.car.team === team);
      const sign = team === 0 ? 1 : -1;
      mates.forEach((p, i) => {
        const s = KICKOFF_SPOTS[idx[i % 5]];
        p.car.place(s[0] * sign, s[1] * sign, team === 0 ? s[2] : s[2] + Math.PI);
        p.car.frozen = true;
        p.car.input.jump = false;
        p.car.prevJump = false;
      });
    }
    for (const v of this.views) if (v.rig) v.rig.snap();
    this.state = 'countdown';
    this.stateT = this.attract ? 1.2 : 3;
    this.lastBeep = 4;
    this.threat = -1;
    this.acc = 0;
    if (!this.attract) this.app.hud.hideBanner();
  }

  startPlay() {
    this.state = 'playing';
    for (const p of this.players) p.car.frozen = false;
    this.world.ball.frozen = false;
    if (!this.attract) {
      this.app.hud.showBanner('GO!', '', 'go', 0.8);
      this.app.audio.beep(true);
    }
  }

  scored(goalOf) {
    const team = 1 - goalOf; // the team that scored
    const w = this.world;
    const ball = w.ball;
    this.scores[team]++;
    const last = ball.lastTouch, prev = ball.prevTouch;
    const scorer = last && last.team === team ? last : prev && prev.team === team ? prev : null;
    const assist = scorer && prev && prev !== scorer && prev.team === team && last === scorer ? prev : null;
    if (scorer) { scorer.stats.goals++; scorer.stats.score += 100; }
    if (assist) { assist.stats.assists++; assist.stats.score += 50; }
    const point = ball.pos.clone();
    this.goalTime = this.time;
    this.goalTeam = team;
    this.goalOf = goalOf;
    this.effects.explosion(point, team, true);
    this.app.stadium.goalFlash(goalOf);
    this.app.stadium.cheer(1);
    // shockwave pushes cars away
    for (const p of this.players) {
      const c = p.car;
      if (c.demolished) continue;
      const d = c.pos.distanceTo(point);
      if (d < 2600) {
        const push = c.pos.clone().sub(point).setY(0).normalize().multiplyScalar((1 - d / 2600) * 1800);
        c.vel.add(push);
        c.vel.y += (1 - d / 2600) * 700;
        c.noGround = 0.15;
        c.onGround = false;
      }
    }
    ball.frozen = true;
    ball.vel.set(0, 0, 0);
    this.ball.visible = false;
    for (const v of this.views) if (v.rig) v.rig.addShake(1);
    if (!this.attract) {
      this.app.audio.goal();
      for (const p of this.humans) this.app.input.rumble(p.device, 1, 1, 700);
      const tc = TEAM_COLORS[team];
      const who = scorer ? scorer.name : team === 0 ? 'Blue' : 'Orange';
      this.app.hud.showBanner('GOAL!', scorer ? `${who} scored${assist ? ' • assist: ' + assist.name : ''}` : 'Own goal', team === 0 ? 'blue' : 'orange', 2.6);
      this.app.hud.addFeed(`<b style="color:${tc.css}">${who}</b> scored!`, team);
    }
    this.state = 'goal';
    this.stateT = 2.8;
    this.endAfterGoal = this.overtime || (!this.unlimited && this.clock <= 0);
  }

  startReplay() {
    if (this.attract || this.snapFilled < SNAP_HZ * 2 || !this.app.settings.replays) { this.afterReplay(); return; }
    this.state = 'replay';
    const avail = this.snapFilled / SNAP_HZ;
    const goalAge = this.time - this.goalTime;
    this.replayEnd = Math.max(0, goalAge - 0.35);
    this.replayStart = Math.min(avail - 0.05, goalAge + 4.2);
    this.replayT = this.replayStart; // seconds before "now"
    this.replayExploded = false;
    this.app.gfx.setViews([this.replayView]);
    this.replayRig.snap();
    this.app.hud.setup([]);
    this.app.hud.showBanner('REPLAY', 'Press A / Space to skip', 'replay', 99);
    this.ball.visible = true;
    this.effects.clear();
  }

  afterReplay() {
    if (this.state === 'replay') {
      this.app.gfx.setViews(this.views);
      this.app.hud.setup(this.views);
      this.app.hud.hideBanner();
    }
    if (this.endAfterGoal) { this.finish(); return; }
    this.kickoff();
  }

  finish() {
    this.state = 'over';
    this.stateT = 3;
    for (const p of this.players) { p.car.frozen = true; p.car.boosting = false; }
    this.world.ball.frozen = true;
    const win = this.scores[0] > this.scores[1] ? 0 : 1;
    this.winner = win;
    this.app.audio.horn();
    this.app.stadium.cheer(0.8);
    this.app.hud.showBanner(win === 0 ? 'BLUE WINS!' : 'ORANGE WINS!', `${this.scores[0]} - ${this.scores[1]}`, win === 0 ? 'blue' : 'orange', 99);
  }

  results() {
    const rows = this.players.map((p) => ({ name: p.name, team: p.car.team, human: p.human, ...p.car.stats }));
    rows.sort((a, b) => b.score - a.score);
    const mvp = rows.filter((r) => r.team === this.winner).sort((a, b) => b.score - a.score)[0];
    return { scores: this.scores.slice(), winner: this.winner, rows, mvp: mvp ? mvp.name : '' };
  }

  // ---------------------------------------------------------------- per frame
  update(dt) {
    dt = Math.min(dt, 0.1);
    this.time += dt;
    this.frame++;
    const app = this.app;
    const input = app.input;

    // human controls
    let skip = false;
    for (const p of this.humans) {
      const c = input.controls(p.device);
      p.controls = c;
      if (c.pause && this.state !== 'over' && app.frames !== app.resumeFrame) { app.pauseMatch(p); return; }
      if (c.skip) skip = true;
      if (c.ballCam && p.view) {
        p.view.rig.ballCam = !p.view.rig.ballCam;
        app.hud.viewStatus(p.viewIndex, p.view.rig.ballCam ? 'BALL CAM' : 'CAR CAM');
      }
      const ci = p.car.input;
      ci.throttle = c.throttle; ci.steer = c.steer; ci.pitch = c.pitch; ci.yaw = c.yaw; ci.roll = c.roll;
      ci.jump = c.jump; ci.boost = c.boost; ci.powerslide = c.powerslide;
    }

    // ball prediction for the bots (and shot detection)
    if (this.frame % 3 === 0 || this.pred.length === 0) {
      predictBall(this.world.ball, 3.5, 1 / 60, this.pred);
      this.threat = this.goalIn(this.pred);
    }
    const kickoff = this.world.ball.lastTouch === null && this.state === 'playing';
    for (const p of this.players) {
      if (!p.bot) continue;
      p.bot.update(dt, {
        world: this.world, pred: this.pred, time: this.world.time, kickoff,
        teammates: this.players.filter((q) => q.car.team === p.car.team).map((q) => q.car),
        opponents: this.players.filter((q) => q.car.team !== p.car.team).map((q) => q.car),
      });
    }

    // state machine
    switch (this.state) {
      case 'countdown': {
        this.stateT -= dt;
        const n = Math.ceil(this.stateT);
        if (!this.attract && n < this.lastBeep && n > 0) {
          this.lastBeep = n;
          app.hud.showBanner(String(n), this.overtime ? 'OVERTIME' : '', 'count', 1);
          app.audio.beep(false);
        }
        if (this.stateT <= 0) this.startPlay();
        break;
      }
      case 'playing':
        if (!this.unlimited) {
          if (this.overtime) this.clock += dt;
          else if (this.clock > 0) this.clock = Math.max(0, this.clock - dt);
        }
        break;
      case 'goal':
        this.stateT -= dt;
        if (this.stateT <= 0) this.startReplay();
        break;
      case 'replay':
        this.replayT -= dt;
        if (skip || this.replayT <= this.replayEnd) this.afterReplay();
        break;
      case 'over':
        this.stateT -= dt;
        if (this.stateT <= 0 && !this.resultsShown) {
          this.resultsShown = true;
          app.showResults(this.results());
        }
        break;
      default:
        break;
    }

    if (this.state === 'replay') {
      this.renderReplay(dt);
      return;
    }

    // physics
    {
      this.acc += dt;
      let steps = 0;
      while (this.acc >= DT && steps < 12) {
        this.world.step(DT);
        this.acc -= DT;
        steps++;
        if (this.stepIndex++ % (120 / SNAP_HZ) === 0) this.recordSnap();
        if (this.state === 'playing') {
          const g = this.world.ball.goalState();
          if (g >= 0) { this.scored(g); break; }
        }
      }
      if (steps >= 12) this.acc = 0;
    }

    // time up: the game ends once the ball touches the ground
    if (this.state === 'playing' && !this.unlimited && !this.overtime && this.clock <= 0) {
      const b = this.world.ball;
      if (b.pos.y < BALL.radius + 25 || b.frozen) {
        if (this.scores[0] === this.scores[1]) {
          this.overtime = true;
          this.clock = 0;
          app.hud.showBanner('OVERTIME', 'Next goal wins', 'ot', 2.5);
          app.audio.horn();
          this.kickoff();
          this.stateT = 4;
        } else {
          this.finish();
        }
      }
    }

    this.processEvents();
    this.renderFrame(dt);
  }

  goalIn(pred) {
    for (const s of pred) {
      if (Math.abs(s.pos.x) < ARENA.goalHalfW && s.pos.y < ARENA.goalH) {
        if (s.pos.z > ARENA.halfZ + BALL.radius) return 1;
        if (s.pos.z < -ARENA.halfZ - BALL.radius) return 0;
      }
    }
    return -1;
  }

  processEvents() {
    const app = this.app;
    const ev = this.world.events;
    const humanCars = this.humans.map((p) => p.car);
    const near = (pt) => {
      if (!pt || humanCars.length === 0) return 0.6;
      let d = Infinity;
      for (const c of humanCars) d = Math.min(d, c.pos.distanceTo(pt));
      return Math.max(0.15, 1 - d / 7000);
    };
    for (const e of ev) {
      const hp = e.car ? this.humans.find((p) => p.car === e.car) : null;
      switch (e.type) {
        case 'ballHit':
          if (e.strength > 350) this.effects.hit(e.point, e.strength);
          if (!this.attract) {
            if (e.strength > 250) app.audio.hit(e.strength * near(e.point));
            if (hp) app.input.rumble(hp.device, Math.min(1, e.strength / 2500), 0.4, 120);
            this.onTouch(e.car, hp);
          }
          break;
        case 'bounce':
          if (!this.attract && e.strength > 400) app.audio.bounce(e.strength * near(e.point));
          break;
        case 'jump':
          if (hp) app.audio.jump();
          break;
        case 'dodge':
          if (hp) app.audio.dodge();
          break;
        case 'land':
          if (hp) { app.audio.land(e.strength); app.input.rumble(hp.device, 0.15, 0.2, 60); }
          break;
        case 'bump':
          if (!this.attract) {
            app.audio.bump();
            const bp = this.humans.find((p) => p.car === e.by);
            if (hp) app.input.rumble(hp.device, 0.7, 0.5, 200);
            if (bp) app.input.rumble(bp.device, 0.4, 0.3, 120);
          }
          break;
        case 'demo':
          this.effects.explosion(e.point, e.car.team, false);
          e.by.stats.score += 25;
          if (!this.attract) {
            app.audio.demo();
            app.hud.addFeed(`<b style="color:${TEAM_COLORS[e.by.team].css}">${e.by.name}</b> 💥 <b style="color:${TEAM_COLORS[e.car.team].css}">${e.car.name}</b>`);
            if (hp) { app.input.rumble(hp.device, 1, 1, 450); app.hud.viewCenter(hp.viewIndex, 'DEMOLISHED', 2.8); }
            const ap = this.humans.find((p) => p.car === e.by);
            if (ap) { app.input.rumble(ap.device, 0.6, 0.6, 200); app.hud.viewCenter(ap.viewIndex, 'DEMOLITION!', 1.5); }
          }
          break;
        case 'boostPickup':
          this.effects.boostPickup(e.pad);
          if (hp) { app.audio.boostPickup(e.big); if (e.big) app.input.rumble(hp.device, 0.1, 0.3, 80); }
          break;
        default:
          break;
      }
    }
    ev.length = 0;
  }

  onTouch(car, hp) {
    if (this.state !== 'playing') return;
    if (this.world.time - (car.lastShotCheck || -10) < 0.4) return;
    car.lastShotCheck = this.world.time;
    const prev = this.threat;
    const buf = this._shotBuf || (this._shotBuf = []);
    predictBall(this.world.ball, 3, 1 / 40, buf);
    const now = this.goalIn(buf);
    this.threat = now;
    if (prev === car.team && now !== car.team) {
      car.stats.saves++;
      car.stats.score += 50;
      this.app.hud.addFeed(`<b style="color:${TEAM_COLORS[car.team].css}">${car.name}</b> made a save!`);
      if (hp) this.app.hud.viewCenter(hp.viewIndex, 'SAVE!', 1.5);
    }
    if (now === 1 - car.team && prev !== now) {
      car.stats.shots++;
      car.stats.score += 20;
      if (hp) this.app.hud.viewCenter(hp.viewIndex, 'SHOT ON GOAL', 1.2);
    }
  }

  // ---------------------------------------------------------------- replay buffer
  recordSnap() {
    const o = this.snapHead * this.snapSize;
    const s = this.snaps;
    const b = this.world.ball;
    s[o] = this.time;
    s[o + 1] = b.pos.x; s[o + 2] = b.pos.y; s[o + 3] = b.pos.z;
    s[o + 4] = b.quat.x; s[o + 5] = b.quat.y; s[o + 6] = b.quat.z; s[o + 7] = b.quat.w;
    s[o + 8] = this.ball.visible ? 1 : 0;
    let k = o + 9;
    for (const p of this.players) {
      const c = p.car;
      s[k] = c.pos.x; s[k + 1] = c.pos.y; s[k + 2] = c.pos.z;
      s[k + 3] = c.quat.x; s[k + 4] = c.quat.y; s[k + 5] = c.quat.z; s[k + 6] = c.quat.w;
      s[k + 7] = c.vel.x; s[k + 8] = c.vel.y; s[k + 9] = c.vel.z;
      s[k + 10] = (c.boosting ? 1 : 0) | (c.supersonic ? 2 : 0) | (c.demolished ? 4 : 0) | (c.onGround ? 8 : 0);
      s[k + 11] = c.steerVisual; s[k + 12] = c.wheelSpin;
      k += 13;
    }
    this.snapHead = (this.snapHead + 1) % this.snapCount;
    this.snapFilled = Math.min(this.snapCount, this.snapFilled + 1);
  }

  // index of the snapshot `age` seconds before the newest one (fractional)
  snapAt(age) {
    const f = Math.min(this.snapFilled - 1, Math.max(0, age * SNAP_HZ));
    const i0 = Math.floor(f);
    const t = f - i0;
    const a = (this.snapHead - 1 - i0 + this.snapCount * 2) % this.snapCount;
    const b = (a - 1 + this.snapCount) % this.snapCount;
    return { a: a * this.snapSize, b: b * this.snapSize, t }; // interpolate a -> b by t (older)
  }

  renderReplay(dt) {
    const { a, b, t } = this.snapAt(this.replayT);
    const s = this.snaps;
    const lerp = (i) => s[a + i] + (s[b + i] - s[a + i]) * t;
    _bp.set(lerp(1), lerp(2), lerp(3));
    _bq.set(s[a + 4], s[a + 5], s[a + 6], s[a + 7]);
    this.ball.position.copy(_bp).multiplyScalar(S);
    this.ball.quaternion.copy(_bq);
    this.ball.visible = s[a + 8] > 0.5;
    let k = 9;
    this.players.forEach((p, i) => {
      const fc = this.fakeCars[i];
      _p.set(lerp(k), lerp(k + 1), lerp(k + 2));
      _q.set(s[a + k + 3], s[a + k + 4], s[a + k + 5], s[a + k + 6]);
      _bq.set(s[b + k + 3], s[b + k + 4], s[b + k + 5], s[b + k + 6]);
      _q.slerp(_bq, t);
      fc.vel.set(s[a + k + 7], s[a + k + 8], s[a + k + 9]);
      const fl = s[a + k + 10];
      fc.boosting = !!(fl & 1); fc.supersonic = !!(fl & 2); fc.demolished = !!(fl & 4);
      fc.steerVisual = s[a + k + 11]; fc.wheelSpin = s[a + k + 12];
      p.model.update(fc, _p, _q, dt);
      this.effects.carTrail(fc, _p, _q, dt);
      k += 13;
    });
    if (!this.replayExploded && this.ball.visible === false) {
      this.replayExploded = true;
      this.effects.explosion(_bp, this.goalTeam, true);
    }
    this.replayRig.updateReplay(dt, _bp, this.goalOf === 1 ? ARENA.halfZ : -ARENA.halfZ, this.replayT);
    this.effects.update(dt);
    this.app.stadium.update(dt);
    this.app.hud.update(dt);
    this.app.gfx.render();
  }

  renderFrame(dt) {
    const app = this.app;
    const alpha = this.acc / DT;
    const wb = this.world.ball;
    _bp.lerpVectors(wb.prevPos, wb.pos, alpha);
    _bq.slerpQuaternions(wb.prevQuat, wb.quat, alpha);
    this.ball.position.copy(_bp).multiplyScalar(S);
    this.ball.quaternion.copy(_bq);
    if (this.ball.visible) this.effects.ballTrail(wb, _bp);
    this.placeBlob(this.ballBlob, _bp, null, BALL.radius);
    if (this.ballBlob) this.ballBlob.visible = this.ballBlob.visible && this.ball.visible;
    const carPos = [];
    for (const p of this.players) {
      const c = p.car;
      _p.lerpVectors(c.prevPos, c.pos, alpha);
      _q.slerpQuaternions(c.prevQuat, c.quat, alpha);
      p.ipos = (p.ipos || new THREE.Vector3()).copy(_p);
      p.iquat = (p.iquat || new THREE.Quaternion()).copy(_q);
      p.model.update(c, _p, _q, dt);
      this.placeBlob(p.model.blob, _p, _q, 17);
      if (p.model.blob) p.model.blob.visible = p.model.blob.visible && !c.demolished;
      this.effects.carTrail(c, _p, _q, dt);
      carPos.push({ car: c, pos: p.ipos, name: p.name });
    }
    // cameras
    if (this.attract) {
      const v = this.views[0];
      const t = this.time * 0.05;
      const cam = v.camera;
      const r = 62;
      cam.position.set(Math.cos(t) * r * 0.62, 13 + Math.sin(t * 0.7) * 4, Math.sin(t) * r * 0.8);
      cam.up.set(0, 1, 0);
      const look = _p.copy(_bp).multiplyScalar(S * 0.6);
      cam.lookAt(look.x, 2, look.z);
    } else {
      for (const p of this.humans) {
        const v = p.view;
        const c = p.controls || {};
        v.rig.update(dt, p.car, p.ipos, p.iquat, this.ball.visible ? _bp : null, c.lookX || 0, c.lookY || 0);
        app.hud.setBoost(p.viewIndex, p.car.boost);
        app.hud.updatePlates(p.viewIndex, v.camera, carPos, p.car);
      }
      this.humans.forEach((p, i) => {
        const c = p.car;
        app.audio.updateEngine(this.engines[i], c.vel.length(), c.input.throttle, c.boosting, c.onGround, !c.demolished && !c.frozen);
      });
      app.hud.setScore(this.scores[0], this.scores[1]);
      app.hud.setClock(this.clock, this.overtime, this.unlimited);
      app.hud.update(dt);
    }
    this.effects.update(dt);
    app.stadium.update(dt);
    app.gfx.render();
  }

  // used while paused: keep drawing the frozen frame
  renderPaused() {
    this.app.gfx.render();
  }
}
