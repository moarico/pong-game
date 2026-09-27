import * as THREE from 'three';
import { Character } from './character.js';
import { Mover } from './player.js';
import { Action, Fall, MOVES } from './moves.js';
import { sweepBlade } from './combat.js';
import { SwordTrail } from './fx.js';
import { terrainHeight } from './terrain.js';
import { MOVE } from './config.js';

// ---------------------------------------------------------------------------
// Enemies: bandits, a ronin or two, and the armoured heavy. They close in
// through the grass, circle at sword's length, take turns to attack (a glint on
// the blade is the tell), guard against your cuts, reel, fall and die.
// ---------------------------------------------------------------------------

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const rand = (a, b) => a + Math.random() * (b - a);

export const KINDS = {
  bandit: { outfit: 'bandit', hp: 60, walk: 1.55, run: 4.3, attacks: ['e_kesa', 'e_yoko', 'e_tsuki'], block: 0.22, poise: false, ring: 3.4 },
  ronin: { outfit: 'ronin', hp: 85, walk: 1.65, run: 4.5, attacks: ['e_kesa', 'e_tsuki', 'e_yoko'], block: 0.42, poise: false, ring: 3.2, chain: 0.6 },
  brute: { outfit: 'brute', hp: 240, walk: 1.35, run: 3.4, attacks: ['b_cleave', 'b_sweep'], block: 0.08, poise: true, ring: 3.8 },
};

const REACH = { e_kesa: 2.1, e_gyaku: 2.0, e_yoko: 2.2, e_tsuki: 3.3, b_cleave: 2.5, b_sweep: 2.6 };

const _v = new THREE.Vector3();

export class Enemy {
  constructor(game, kind) {
    this.g = game;
    this.kind = kind;
    this.K = KINDS[kind];
    this.char = new Character(game.shared, game.wind, this.K.outfit);
    this.body = new Mover(0, 0, 0, MOVE);
    this.body.radius = 0.36 * this.char.scale;
    this.trail = new SwordTrail(0xc9d6ff, { life: 0.14 });
    this.trail.setColor(0xc9d6ff, 2.2);
    this.intent = { mx: 0, mz: 0, speed: 0, jumpPressed: false, jumpHeld: false };
    this.active = false;
    this.alive = false;
    this.prevPos = new THREE.Vector3();
    this.prevYaw = 0;
    this.lookAt = new THREE.Vector3();
  }

  spawn(x, z, yaw) {
    const b = this.body;
    b.pos.set(x, terrainHeight(x, z), z);
    b.prevPos.copy(b.pos);
    b.renderPos.copy(b.pos);
    b.vel.set(0, 0, 0);
    b.yaw = b.prevYaw = b.renderYaw = yaw;
    b.grounded = true;
    this.prevPos.copy(b.pos);
    this.prevYaw = yaw;
    this.hp = this.K.hp;
    this.maxHp = this.K.hp;
    this.alive = true;
    this.active = true;
    this.state = 'approach';
    this.stateT = 0;
    this.action = null;
    this.fall = null;
    this.token = false;
    this.cooldown = rand(0.5, 1.5);
    this.waitT = 0;
    this.circleDir = Math.random() < 0.5 ? -1 : 1;
    this.flipT = rand(2, 4);
    this.guardT = 0;
    this.deadT = 0;
    this.sink = 0;
    this.lastHitT = -10;
    this.shown = 0;
    this.char.anim.ready = false;
    this.char.root.visible = true;
    this.char.root.position.copy(b.pos);
    this.trail.cut();
  }

  hittable() {
    return this.alive;
  }

  animAction() {
    if (this.fall) return this.fall.sample();
    if (this.action) return this.action.sample();
    return null;
  }

  setState(s) {
    this.state = s;
    this.stateT = 0;
  }

  releaseToken() {
    if (this.token) {
      this.token = false;
      this.cooldown = rand(1.4, 3.0) * (this.kind === 'brute' ? 1.3 : 1);
    }
  }

  // After physics: advance the move, give the tell, sweep the blade.
  advance(dt, player, now) {
    if (!this.active) return;
    if (this.fall) {
      this.fall.update(dt);
      if (this.fall.done && this.alive) {
        this.fall = null;
        this.setState('retreat');
      }
    }
    if (!this.alive) {
      this.deadT += dt;
      if (this.deadT > 7) this.sink += dt * 0.25;
      if (this.deadT > 11) this.deactivate();
      return;
    }
    const a = this.action;
    if (!a) return;
    const b = this.body;
    const t0 = a.t;
    a.update(dt);
    const d = a.def;
    if (d.tell !== undefined) {
      const tw = d.kind === 'slash' ? d.wind : d.keys[1][0];
      if (t0 < tw - d.tell && a.t >= tw - d.tell) this.tell(d);
    }
    if (d.kind === 'slash' && t0 < d.wind && a.t >= d.wind) this.g.audio?.play(d.sound || 'swish', { pos: b.pos, pitch: this.kind === 'brute' ? 0.75 : 1.05 });
    if (d.hitT && t0 < d.hitT[0] && a.t >= d.hitT[0]) this.g.audio?.play(d.sound || 'swish', { pos: b.pos });
    if (d.impact && t0 < d.impact && a.t >= d.impact) this.impact(d, player);
    if (d.kind === 'slash' || d.hitT) {
      sweepBlade(this, a, t0, a.t, this.prevPos, this.prevYaw, this.g.playerTargets, this.trail, now, (tg, point, dir) => this.strike(tg, a, point, dir));
    }
    if (a === this.action && a.done) {
      this.action = null;
      this.trail.cut();
      if (this.state === 'attack') {
        // Chain a second cut sometimes.
        const P = player.body;
        const dist = Math.hypot(P.pos.x - b.pos.x, P.pos.z - b.pos.z);
        if (a.def.next && Math.random() < (this.K.chain || 0) && dist < 3) this.attack(a.def.next);
        else {
          this.releaseToken();
          this.setState('retreat');
        }
      } else if (this.state === 'hurt') this.setState('retreat');
    }
  }

  // Before physics: decide what to do and steer.
  think(dt, player) {
    if (!this.active) return;
    const b = this.body;
    const P = player.body;
    const dx = P.pos.x - b.pos.x;
    const dz = P.pos.z - b.pos.z;
    const dist = Math.hypot(dx, dz);
    const toYaw = Math.atan2(dx, dz);
    this.stateT += dt;
    this.cooldown -= dt;
    this.lookAt.copy(P.pos).y += 1.45;
    const I = this.intent;
    I.mx = 0;
    I.mz = 0;
    I.speed = this.K.walk;
    const C = b.control;
    C.face = null;
    C.faceRate = 10;
    C.velW = 0;
    C.lock = 0;
    C.noJump = true;
    if (this.fall || !this.alive) {
      C.lock = 1;
      C.vel.set(0, 0, 0);
      C.velW = b.grounded ? 1 - Math.exp(-5 * dt) : 0;
      return;
    }

    if (player.dead) {
      // He has fallen: stand off and wait.
      this.releaseToken();
      if (this.state !== 'hurt' && !this.action && !this.fall) {
        if (dist < 5) this.moveDir(-dx, -dz, 0.8);
        C.face = toYaw;
      }
      return;
    }

    const K = this.K;
    switch (this.state) {
      case 'approach': {
        const run = dist > 9;
        this.moveDir(dx, dz, 1);
        I.speed = run ? K.run : K.walk * 1.2;
        if (dist < 6) this.setState('circle');
        break;
      }
      case 'circle': {
        this.waitT += dt;
        this.flipT -= dt;
        if (this.flipT <= 0) {
          this.flipT = rand(1.8, 4);
          if (Math.random() < 0.5) this.circleDir *= -1;
        }
        // Strafe round him, holding the ring.
        const tx = -dz / (dist || 1);
        const tz = dx / (dist || 1);
        const radial = clamp((dist - K.ring) * 0.9, -1, 1);
        const mx = tx * this.circleDir * 0.75 + (dx / (dist || 1)) * radial;
        const mz = tz * this.circleDir * 0.75 + (dz / (dist || 1)) * radial;
        this.moveDir(mx, mz, Math.min(1, Math.hypot(mx, mz)));
        I.speed = K.walk * 0.8;
        C.face = toYaw;
        if (dist > 9) this.setState('approach');
        if (this.token && this.cooldown <= 0) this.setState('engage');
        this.maybeGuard(player, dist);
        break;
      }
      case 'engage': {
        const name = this.pickAttack(dist);
        const reach = REACH[name] || 2;
        if (dist > reach) {
          this.moveDir(dx, dz, 1);
          I.speed = dist > 5 ? K.run * 0.8 : K.walk * 1.5;
          C.face = toYaw;
        } else {
          this.attack(name);
        }
        if (this.stateT > 3.5) {
          this.releaseToken();
          this.setState('circle');
        }
        this.maybeGuard(player, dist);
        break;
      }
      case 'attack': {
        if (this.action) {
          const d = this.action.def;
          C.lock = 1;
          const tw = d.wind ?? d.keys[1][0];
          if (this.action.t < tw - 0.05) C.face = toYaw;
          C.faceRate = 6;
          const sp = this.action.rootSpeed();
          if (sp) {
            C.vel.set(Math.sin(b.yaw) * sp, 0, Math.cos(b.yaw) * sp);
            C.velW = 1 - Math.exp(-30 * dt);
          } else {
            C.vel.set(0, 0, 0);
            C.velW = 1 - Math.exp(-8 * dt);
          }
        }
        break;
      }
      case 'retreat': {
        this.moveDir(-dx, -dz, 1);
        I.speed = K.walk * 1.1;
        C.face = toYaw;
        if (this.stateT > 0.8 || dist > K.ring + 0.5) this.setState('circle');
        break;
      }
      case 'guard': {
        C.face = toYaw;
        C.faceRate = 12;
        C.lock = 0.6;
        this.moveDir(-dx, -dz, 0.3);
        I.speed = K.walk * 0.6;
        this.guardT -= dt;
        if (this.guardT <= 0) {
          this.action = null;
          this.setState(this.token ? 'engage' : 'circle');
        }
        break;
      }
      case 'hurt': {
        C.lock = 1;
        if (this.action) {
          const sp = this.action.rootSpeed();
          C.vel.set(-Math.sin(b.yaw) * Math.abs(sp), 0, -Math.cos(b.yaw) * Math.abs(sp));
          C.velW = sp ? 1 - Math.exp(-20 * dt) : 1 - Math.exp(-8 * dt);
          if (!sp) C.vel.set(0, 0, 0);
        }
        break;
      }
      default:
        break;
    }
  }

  moveDir(x, z, mag) {
    const l = Math.hypot(x, z) || 1;
    this.intent.mx = (x / l) * mag;
    this.intent.mz = (z / l) * mag;
  }

  pickAttack(dist) {
    if (!this.nextAttack) {
      const list = this.K.attacks;
      this.nextAttack = dist > 2.6 && list.includes('e_tsuki') && Math.random() < 0.5 ? 'e_tsuki' : list[Math.floor(Math.random() * list.length)];
    }
    return this.nextAttack;
  }

  attack(name) {
    const entryBody = this.action ? this.action.bodySnapshot() : null;
    this.action = new Action(name, this.char.anim.out, { entryBody });
    this.nextAttack = null;
    this.setState('attack');
    const d = MOVES[name];
    // Close to a cutting distance with the lunge, no further.
    const P = this.g.player;
    const dist = Math.hypot(P.pos.x - this.body.pos.x, P.pos.z - this.body.pos.z);
    if (d.move) this.action.dist = clamp(dist - 1.1, 0.1, d.move.dist * 1.4);
    this.trail.setColor(d.unblockable ? 0xff5030 : 0xc9d6ff, d.unblockable ? 3.2 : 2.2);
    this.trail.cut();
  }

  // The tell: a star of light runs along the blade just before he strikes.
  tell(d) {
    const tip = (out) => out.set(0, 0.01, 0.09 + this.char.bladeLen * 0.7).applyMatrix4(this.char.fig.bones.sword.matrixWorld);
    this.g.fx.glints.flash(tip(new THREE.Vector3()), {
      color: d.unblockable ? 0xff3a20 : 0xfff4e0,
      size: d.unblockable ? 0.95 : 0.7,
      life: 0.42,
      intensity: d.unblockable ? 11 : 9,
      follow: tip,
    });
    this.g.audio?.play(d.unblockable ? 'warn' : 'glint', { pos: this.body.pos });
  }

  maybeGuard(player, dist) {
    const pa = player.action;
    if (!pa || this.guardCheck === pa || dist > 3.2 || this.fall) return;
    this.guardCheck = pa;
    const d = pa.def;
    if (!(d.kind === 'slash' || d.hitT) || d.reaction) return;
    if (Math.random() < this.K.block) {
      this.action = new Action('e_guard', this.char.anim.out, {});
      this.guardT = rand(0.7, 1.3);
      this.setState('guard');
    }
  }

  impact(d, player) {
    const b = this.body;
    const fx = this.g.fx;
    const cx = b.pos.x + Math.sin(b.yaw) * 1.1;
    const cz = b.pos.z + Math.cos(b.yaw) * 1.1;
    fx.groundImpact(cx, cz, d.shake || 0.6);
    this.g.rig.shake((d.shake || 0.6) * 0.6);
    this.g.audio?.play('impact', { pos: b.pos });
    const P = player.body;
    if (d.radius && Math.hypot(P.pos.x - cx, P.pos.z - cz) < d.radius && this.action && !this.action.hits.has(player)) {
      this.action.hits.add(player);
      const p = P.pos.clone();
      p.y += 0.9;
      this.strike(player, this.action, p, new THREE.Vector3(P.pos.x - b.pos.x, 0.3, P.pos.z - b.pos.z).normalize());
    }
  }

  strike(player, a, point, dir) {
    const d = a.def;
    const b = this.body;
    const away = new THREE.Vector3(player.body.pos.x - b.pos.x, 0, player.body.pos.z - b.pos.z).normalize();
    const res = player.receiveHit({ dmg: d.dmg, react: d.react, dir: away, point, bladeDir: dir, unblockable: !!d.unblockable, heavy: d.react === 'knockdown', from: this });
    if (res === 'parried') {
      this.action = new Action('e_parried', this.char.anim.out, {});
      this.trail.cut();
      this.releaseToken();
      this.setState('hurt');
      this.stateT = 0;
    } else if (res === 'blocked') {
      this.action = new Action('recoil', this.char.anim.out, { entryBody: a.bodySnapshot() });
      this.trail.cut();
      this.releaseToken();
      this.setState('hurt');
    }
  }

  // Blows from the player. Returns 'blocked' | 'hit' | 'dead' | 'ignored'.
  receiveHit(info) {
    if (!this.alive) return 'ignored';
    const b = this.body;
    const facing = Math.abs(wrapAngle(Math.atan2(-info.dir.x, -info.dir.z) - b.yaw)) < 1.9;
    if (this.state === 'guard' && facing) {
      if (!info.breaks) {
        this.guardT = Math.max(this.guardT, 0.3);
        this.g.audio?.play('clash', { pos: info.point });
        return 'blocked';
      }
      // Guard broken.
      info = { ...info, react: 'stagger' };
    }
    this.hp -= info.dmg;
    this.lastHitT = this.g.world.time;
    this.shown = 3;
    this.char.hit(0xfff0e0, 1.0);
    if (this.hp <= 0) {
      this.die(info);
      return 'dead';
    }
    // The heavy shrugs off light cuts mid-swing.
    if (this.K.poise && this.state === 'attack' && info.react === 'flinch') return 'hit';
    this.releaseToken();
    this.trail.cut();
    const turn = Math.atan2(-info.dir.x, -info.dir.z);
    b.yaw = b.yaw + wrapAngle(turn - b.yaw) * 0.6;
    if (info.react === 'knockdown' && !this.K.poise) {
      this.action = null;
      this.fall = new Fall('knockdown');
      b.vel.set(info.dir.x * (info.knock || 3), 0, info.dir.z * (info.knock || 3));
      this.setState('down');
    } else {
      const heavyHit = info.react === 'stagger' || info.react === 'knockdown';
      this.action = new Action(heavyHit ? 'stagger' : 'flinch', this.char.anim.out, {});
      b.vel.addScaledVector(info.dir, (info.knock || 1) * 0.8);
      this.setState('hurt');
    }
    return 'hit';
  }

  die(info) {
    this.alive = false;
    this.releaseToken();
    this.action = null;
    this.trail.cut();
    const back = info.heavy || info.react === 'knockdown';
    this.fall = new Fall(back ? 'deathBack' : 'deathFwd');
    const turn = Math.atan2(-info.dir.x, -info.dir.z);
    this.body.yaw = back ? turn : turn + Math.PI * 0.15;
    this.body.vel.set(info.dir.x * (info.knock || 2) * 0.8, 0, info.dir.z * (info.knock || 2) * 0.8);
    this.state = 'dead';
    this.deadT = 0;
    this.g.onEnemyKilled?.(this);
  }

  deactivate() {
    this.active = false;
    this.char.root.visible = false;
    if (this.char.cape) this.char.cape.mesh.visible = false;
    this.trail.mesh.visible = false;
  }

  fixed(dt) {
    if (!this.active) return;
    this.body.step(dt, this.intent);
  }

  animate(dt, now) {
    if (!this.active) return;
    const b = this.body;
    const ev = b.consumeEvents();
    const guard = this.alive && this.state !== 'approach';
    const pos = b.renderPos;
    if (this.sink > 0) {
      _v.copy(pos);
      _v.y -= this.sink;
    }
    this.char.update(dt, {
      pos: this.sink > 0 ? _v : pos,
      yaw: b.renderYaw,
      vel: b.vel,
      grounded: b.grounded,
      jumped: ev.jumped,
      landed: ev.landed,
      landSpeed: ev.landSpeed,
      guard,
      action: this.animAction(),
      lookAt: this.alive ? this.lookAt : null,
    });
    this.trail.update(now);
    this.shown = Math.max(0, this.shown - dt);
  }

  endFrame() {
    this.prevPos.copy(this.body.renderPos);
    this.prevYaw = this.body.renderYaw;
  }
}

// ---------------------------------------------------------------------------
// The director: waves of foes, who gets to attack, and the pool of figures.
// ---------------------------------------------------------------------------

const WAVES = [
  ['bandit', 'bandit'],
  ['bandit', 'bandit', 'ronin'],
  ['bandit', 'ronin', 'brute'],
  ['bandit', 'bandit', 'ronin', 'ronin'],
  ['ronin', 'bandit', 'bandit', 'brute'],
];

export class Director {
  constructor(game, scene) {
    this.g = game;
    this.scene = scene;
    this.pool = { bandit: [], ronin: [], brute: [] };
    this.enemies = [];
    this.wave = 0;
    this.phase = 'calm';
    this.timer = 5;
    this.kills = 0;
    // Build every figure up front so a wave never hitches.
    const counts = { bandit: 3, ronin: 2, brute: 1 };
    for (const kind of Object.keys(counts)) {
      for (let i = 0; i < counts[kind]; i++) {
        const e = new Enemy(game, kind);
        e.char.addTo(scene);
        scene.add(e.trail.mesh);
        e.char.root.visible = false;
        this.pool[kind].push(e);
      }
    }
    this.all = [...this.pool.bandit, ...this.pool.ronin, ...this.pool.brute];
  }

  get alive() {
    return this.enemies.filter((e) => e.alive);
  }

  take(kind) {
    const free = this.pool[kind].find((e) => !e.active);
    if (free) return free;
    const e = new Enemy(this.g, kind);
    e.char.addTo(this.scene);
    this.scene.add(e.trail.mesh);
    this.pool[kind].push(e);
    this.all.push(e);
    return e;
  }

  spawnWave() {
    const list = WAVES[Math.min(this.wave, WAVES.length - 1)].slice();
    if (this.wave >= WAVES.length) list.push(Math.random() < 0.5 ? 'bandit' : 'ronin');
    this.wave++;
    const P = this.g.player;
    const camYaw = this.g.rig.yaw;
    // In front of the camera, out in the grass, spread across the view.
    const fwd = Math.atan2(-Math.sin(camYaw), -Math.cos(camYaw));
    list.forEach((kind, i) => {
      const e = this.take(kind);
      const ang = fwd + (i - (list.length - 1) / 2) * 0.42 + (Math.random() - 0.5) * 0.2;
      const r = 17 + Math.random() * 5;
      const x = P.pos.x + Math.sin(ang) * r;
      const z = P.pos.z + Math.cos(ang) * r;
      e.spawn(x, z, Math.atan2(P.pos.x - x, P.pos.z - z));
      if (!this.enemies.includes(e)) this.enemies.push(e);
    });
    this.phase = 'fight';
    this.g.onWave?.(this.wave, list);
  }

  update(dt) {
    const player = this.g.combat;
    if (this.phase === 'calm') {
      // The first wave waits until he has taken a few steps.
      const started = this.wave > 0 || this.g.input.usedMove || this.g.world.time > 12;
      if (started && !player.dead) this.timer -= dt;
      if (this.timer <= 0) this.spawnWave();
    } else if (this.phase === 'fight' && !this.enemies.some((e) => e.alive)) {
      this.phase = 'calm';
      this.timer = 6;
      this.g.onWaveCleared?.(this.wave);
    }
    // Attack turns: one at a time early on, two later. The longest-waiting goes next.
    const maxTokens = this.wave >= 3 ? 2 : 1;
    let held = 0;
    for (const e of this.enemies) if (e.alive && e.token) held++;
    while (held < maxTokens && !player.dead) {
      let next = null;
      for (const e of this.enemies) {
        if (e.alive && !e.token && e.state === 'circle' && e.cooldown <= 0 && (!next || e.waitT > next.waitT)) next = e;
      }
      if (!next) break;
      next.token = true;
      next.waitT = 0;
      held++;
    }
    if (this.enemies.some((e) => !e.active)) this.enemies = this.enemies.filter((e) => e.active);
  }

  // Everyone back to the start (after the player falls).
  reset() {
    for (const e of this.all) {
      e.releaseToken();
      e.deactivate();
      e.alive = false;
    }
    this.enemies = [];
    this.wave = Math.max(0, this.wave - 1);
    this.phase = 'calm';
    this.timer = 4;
  }
}
