import * as THREE from 'three';
import { Action, Fall, MOVES } from './moves.js';
import { makePose } from './animator.js';

// ---------------------------------------------------------------------------
// Shared combat maths and the player's side of the fight: reading attack
// input, chaining combos, steering lunges toward a target, sweeping the blade
// for hits between frames, parrying, dodging and taking blows.
// ---------------------------------------------------------------------------

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const _d = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _p2 = new THREE.Vector3();
const _pose = makePose();
// Scratch for sweeping blades (no garbage per frame).
const SW = {
  base: new THREE.Vector3(),
  tip: new THREE.Vector3(),
  prevTip: new THREE.Vector3(),
  ca: new THREE.Vector3(),
  cb: new THREE.Vector3(),
  at: new THREE.Vector3(),
};

// World-space blade (habaki to point) for a root-space sword pose.
export function bladeWorld(pos, yaw, scale, pose, bladeLen, base, tip) {
  _d.set(0, 0, 1).applyQuaternion(pose.swordQ);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const put = (lx, ly, lz, out) => out.set(pos.x + (lx * cy + lz * sy) * scale, pos.y + ly * scale, pos.z + (-lx * sy + lz * cy) * scale);
  const g = pose.grip;
  put(g.x + _d.x * 0.1, g.y + _d.y * 0.1, g.z + _d.z * 0.1, base);
  const L = 0.09 + bladeLen;
  put(g.x + _d.x * L, g.y + _d.y * L, g.z + _d.z * L, tip);
}

// Closest distance between segments p-q and r-s; closest points into c1, c2.
export function segSeg(p, q, r, s, c1, c2) {
  const d1 = _a.subVectors(q, p);
  const d2 = _b.subVectors(s, r);
  const rr = _c.subVectors(p, r);
  const A = d1.dot(d1);
  const E = d2.dot(d2);
  const F = d2.dot(rr);
  let t;
  let u;
  if (A < 1e-9 && E < 1e-9) {
    t = 0;
    u = 0;
  } else if (A < 1e-9) {
    t = 0;
    u = clamp(F / E, 0, 1);
  } else {
    const C = d1.dot(rr);
    if (E < 1e-9) {
      u = 0;
      t = clamp(-C / A, 0, 1);
    } else {
      const B = d1.dot(d2);
      const den = A * E - B * B;
      t = den > 1e-9 ? clamp((B * F - C * E) / den, 0, 1) : 0;
      u = (B * t + F) / E;
      if (u < 0) {
        u = 0;
        t = clamp(-C / A, 0, 1);
      } else if (u > 1) {
        u = 1;
        t = clamp((B - C) / A, 0, 1);
      }
    }
  }
  c1.copy(p).addScaledVector(d1, t);
  c2.copy(r).addScaledVector(d2, u);
  return c1.distanceTo(c2);
}

// A body's hurt capsule, feet to crown.
export function hurtCapsule(pos, scale, a, b) {
  a.set(pos.x, pos.y + 0.3 * scale, pos.z);
  b.set(pos.x, pos.y + 1.62 * scale, pos.z);
  return 0.3 * scale;
}

// Sweeps an action's blade over (t0, t1] against targets, calling onHit(target, point, dir)
// at most once per target per action. Also feeds the trail.
export function sweepBlade(owner, action, t0, t1, prevPos, prevYaw, targets, trail, now, onHit) {
  const char = owner.char;
  const scale = char.scale;
  const n = Math.max(2, Math.ceil((t1 - t0) / 0.004));
  const pos = owner.body.renderPos;
  const yaw = owner.body.renderYaw;
  const { base, tip, prevTip, ca, cb, at } = SW;
  let havePrev = false;
  const d = action.def;
  const hot = d.kind === 'slash' ? t1 >= d.wind - 0.02 && t0 <= d.wind + d.strike + 0.12 : true;
  for (let k = 1; k <= n; k++) {
    const f = k / n;
    const t = t0 + (t1 - t0) * f;
    action.sword(t, _pose);
    at.lerpVectors(prevPos, pos, f);
    const y = prevYaw + wrapAngle(yaw - prevYaw) * f;
    bladeWorld(at, y, scale, _pose, char.bladeLen, base, tip);
    if (trail && hot && action.w > 0.5) trail.push(base, tip, now - (1 - f) * (t1 - t0) / Math.max(action.speed, 1e-3));
    if (targets && action.hitActive(t)) {
      for (const tg of targets) {
        if (!tg.hittable() || action.hits.has(tg)) continue;
        const r = hurtCapsule(tg.body.pos, tg.char.scale, ca, cb);
        const dist = segSeg(base, tip, ca, cb, _p1, _p2);
        if (dist < r) {
          action.hits.add(tg);
          // Direction the blade was travelling at the point of contact.
          const dir = havePrev ? tip.clone().sub(prevTip).normalize() : new THREE.Vector3(0, -1, 0);
          onHit(tg, _p1.clone(), dir);
        }
      }
    }
    prevTip.copy(tip);
    havePrev = true;
  }
}

// ---------------------------------------------------------------------------
// The player.
// ---------------------------------------------------------------------------

export class PlayerCombat {
  constructor(game) {
    this.g = game; // { player, char, input, fx, audio, world, rig }
    this.body = game.player;
    this.char = game.char;
    this.maxHp = 100;
    this.hp = 100;
    this.action = null;
    this.fall = null;
    this.state = 'free';
    this.buffer = null;
    this.bufferT = 0;
    this.charge = 0;
    this.airAttacks = 0;
    this.spinCd = 0;
    this.riposte = 0;
    this.sinceHurt = 99;
    this.dead = false;
    this.deadT = 0;
    this.prevPos = new THREE.Vector3().copy(this.body.pos);
    this.prevYaw = this.body.yaw;
    this.lastT = 0;
    this.moveYaw = 0;
    this.target = null;
    this.lunge = 1;
    this.inCombat = 0;
    this.lookAt = new THREE.Vector3();
    this.hasLook = false;
    this.flags = { perfectDodge: 0 };
    this.plungeFrom = 0;
  }

  hittable() {
    return !this.dead;
  }

  // What the animator should layer this frame.
  animAction() {
    if (this.fall) return this.fall.sample();
    if (this.action) return this.action.sample();
    return null;
  }

  press(type) {
    this.buffer = type;
    this.bufferT = 0.3;
  }

  // Before physics: read the buttons, start moves, steer the body.
  think(dt, enemies) {
    const I = this.g.input;
    const body = this.body;
    const fx = this.g.fx;
    this.spinCd = Math.max(0, this.spinCd - dt);
    this.riposte = Math.max(0, this.riposte - dt);
    this.sinceHurt += dt;
    if (I.attackPressed) this.press('light');
    if (I.heavyPressed) this.press('heavy');
    if (I.spinPressed) this.press('spin');
    if (I.dodgePressed) this.press('dodge');
    if (I.parryPressed) this.press('parry');
    I.attackPressed = I.heavyPressed = I.spinPressed = I.dodgePressed = I.parryPressed = false;
    this.bufferT -= dt;
    if (this.bufferT <= 0) this.buffer = null;

    // Nearby foes: fight stance, where to look.
    let near = null;
    let nearD = Infinity;
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = e.body.pos.distanceTo(body.pos);
      if (d < nearD) {
        nearD = d;
        near = e;
      }
    }
    this.inCombat = near && nearD < 11 ? 1 : 0;
    this.hasLook = !!near && nearD < 14;
    if (near) this.lookAt.copy(near.body.pos).y += 1.5 * near.char.scale;

    if (this.dead) {
      this.deadT += dt;
      this.drive(dt);
      return;
    }
    if (this.sinceHurt > 5 && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 6 * dt);

    // Held heavy: charge while held, strike on release.
    if (this.action && this.action.name === 'jodan') {
      this.charge += dt;
      if (this.charge > 0.35 && !this.chargeGlint) {
        this.chargeGlint = true;
        fx.glints.flash(this.bladeTip(new THREE.Vector3()), { color: 0xffe2a8, size: 0.7, life: 0.45, intensity: 7, follow: (p) => this.bladeTip(p) });
        this.g.audio?.play('charge');
      }
      if (!I.heavyHeld || this.charge > 1.6) {
        const full = this.charge >= 0.35;
        this.startMove(full ? 'kabutowari' : 'tsuki', enemies, { charged: clamp((this.charge - 0.35) / 0.9, 0, 1) });
        this.charge = 0;
        this.chargeGlint = false;
      }
    }
    // Plunge: dropping blade-first until the ground.
    if (this.action && this.action.name === 'plunge' && body.grounded && this.action.t > 0.05) {
      this.startMove('plungeLand', enemies, {});
      this.impact(this.action, enemies);
    }

    this.tryBuffered(enemies);
    this.drive(dt);
  }

  // After physics: advance the move, sweep the blade, fire its events.
  advance(dt, enemies) {
    if (this.fall) {
      this.fall.update(dt);
      if (this.fall.done && !this.dead) this.fall = null;
    }
    const a = this.action;
    if (!a) return;
    const t0 = a.t;
    a.update(dt);
    this.moveEvents(a, t0, enemies);
    if (a === this.action) {
      sweepBlade(this, a, t0, a.t, this.prevPos, this.prevYaw, enemies, this.g.fx.trailP, this.g.world.time, (e, point, dir) => this.strike(e, a, point, dir));
    }
    if (this.action && this.action.done) this.endAction();
  }

  tryBuffered(enemies) {
    if (!this.buffer || this.fall) return;
    const b = this.buffer;
    const a = this.action;
    const body = this.body;
    const air = !body.grounded;
    const speed = Math.hypot(body.vel.x, body.vel.z);
    let next = null;
    const free = !a || a.w < 0.35;
    const cancel = !a || a.canCancel() || (a.def.kind === 'slash' && a.t < a.def.wind * 0.5) || a.def.hold;
    if (b === 'dodge') {
      if (!a || cancel || a.def.reaction) next = 'dodge';
    } else if (b === 'parry') {
      if (!a || cancel) next = 'parry';
    } else if (b === 'spin') {
      if (this.spinCd <= 0 && (!a || cancel)) next = 'kaiten';
    } else if (b === 'heavy') {
      if (air && (!a || a.def.air || cancel)) next = 'plunge';
      else if (!air && (free || cancel)) next = 'jodan';
    } else if (b === 'light') {
      if (a && a.inCombo() && a.def.next && (!air || MOVES[a.def.next].air)) next = a.def.next;
      else if (free || (a && a.canCancel() && !a.def.reaction)) {
        if (this.riposte > 0 && !air) next = 'riposte';
        else if (air) next = this.airAttacks < 2 ? 'air1' : null;
        else if (speed > 4.0 && !a) next = 'nukido';
        else next = 'kesa';
      }
    }
    if (!next) return;
    if (a && a.def.reaction && next !== 'dodge') return;
    this.buffer = null;
    this.startMove(next, enemies, {});
  }

  startMove(name, enemies, { charged = 0 } = {}) {
    const body = this.body;
    const def = MOVES[name];
    const prev = this.action;
    const entryBody = prev ? prev.bodySnapshot() : null;
    const act = new Action(name, this.char.anim.out, { entryBody, charged });
    this.action = act;
    this.g.fx.trailP.cut();
    if (name === 'air1' || name === 'air2') this.airAttacks++;
    if (name === 'kaiten') this.spinCd = def.cooldown || 1;
    if (name === 'riposte') {
      this.riposte = 0;
      this.g.world.slowmo(0.55, 0.3);
      this.g.hud?.flash('Riposte', 0.9);
    }
    // Which way: the stick if held, else toward the nearest foe ahead, else straight on.
    const I = this.g.input;
    const cam = this.g.rig.yaw;
    const sx = Math.cos(cam) * I.moveX - Math.sin(cam) * I.moveY;
    const sz = -Math.sin(cam) * I.moveX - Math.cos(cam) * I.moveY;
    const stick = Math.hypot(sx, sz) > 0.2;
    const want = stick ? Math.atan2(sx, sz) : body.yaw;
    if (name === 'dodge') {
      act.moveYaw = stick ? want : body.yaw + Math.PI;
      act.faceYaw = null;
      this.g.audio?.play('dodge');
      return act;
    }
    this.target = null;
    this.lunge = 1;
    act.faceYaw = want;
    act.moveYaw = want;
    if (def.move || def.kind === 'slash' || def.hitT) {
      const range = name === 'nukido' ? 7 : name === 'tsuki' || name === 'kabutowari' ? 5.5 : name === 'kesa' ? 3.6 : 3.2;
      let best = null;
      let bestScore = Infinity;
      for (const e of enemies) {
        if (!e.alive) continue;
        const dx = e.body.pos.x - body.pos.x;
        const dz = e.body.pos.z - body.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > range) continue;
        const ang = Math.abs(wrapAngle(Math.atan2(dx, dz) - want));
        if (ang > (stick ? 1.1 : 1.6)) continue;
        const score = dist + ang * 2.2;
        if (score < bestScore) {
          bestScore = score;
          best = e;
        }
      }
      if (best) {
        this.target = best;
        const dx = best.body.pos.x - body.pos.x;
        const dz = best.body.pos.z - body.pos.z;
        const dist = Math.hypot(dx, dz);
        act.faceYaw = Math.atan2(dx, dz);
        act.moveYaw = act.faceYaw;
        // Close the gap to a good cutting distance, no further.
        if (def.move && def.move.dist > 0 && name !== 'nukido') {
          const ideal = name === 'tsuki' ? 1.05 : 1.15;
          act.dist = clamp(dist - ideal, 0.05, def.move.max || def.move.dist);
        }
      }
    }
    if (def.hop) body.control.hop = def.hop;
    return act;
  }

  endAction() {
    const a = this.action;
    this.action = null;
    if (a && a.name === 'kaiten') this.g.fx.trailP.cut();
  }

  // Timed events inside a move: swishes, ground impacts.
  moveEvents(a, t0, enemies) {
    const d = a.def;
    const at = (t) => t0 < t && a.t >= t;
    if (d.kind === 'slash' && at(d.wind)) this.g.audio?.play(d.sound || 'swish', { pitch: a.name === 'karatake' ? 0.8 : 1 });
    if (d.hitT && at(d.hitT[0])) this.g.audio?.play(d.sound || 'swish');
    if (d.impact !== undefined && d.impact > 0 && at(d.impact)) this.impact(a, enemies);
  }

  // A blow that lands on the ground: shake, dust, a ripple through the grass,
  // and everyone close enough (in front, for a cleave) is struck.
  impact(a, enemies) {
    const d = a.def;
    const body = this.body;
    const fx = this.g.fx;
    const fwdX = Math.sin(body.yaw);
    const fwdZ = Math.cos(body.yaw);
    const cx = body.pos.x + fwdX * 0.9;
    const cz = body.pos.z + fwdZ * 0.9;
    fx.groundImpact(cx, cz, d.shake || 0.6);
    this.g.rig.shake(d.shake || 0.6);
    this.g.audio?.play('impact');
    if (!d.radius) return;
    for (const e of enemies) {
      if (!e.hittable() || a.hits.has(e)) continue;
      const dx = e.body.pos.x - cx;
      const dz = e.body.pos.z - cz;
      const dist = Math.hypot(dx, dz);
      if (dist > d.radius) continue;
      a.hits.add(e);
      const p = e.body.pos.clone();
      p.y += 1.0;
      this.strike(e, a, p, new THREE.Vector3(dx, 0.4, dz).normalize());
    }
  }

  strike(e, a, point, dir) {
    const d = a.def;
    const fx = this.g.fx;
    let dmg = d.dmg;
    if (d.dmgCharged) dmg = d.dmg + (d.dmgCharged - d.dmg) * a.charged;
    const away = new THREE.Vector3(e.body.pos.x - this.body.pos.x, 0, e.body.pos.z - this.body.pos.z).normalize();
    const heavy = d.react === 'knockdown' || d.react === 'stagger';
    const res = e.receiveHit({
      dmg, react: d.react, knock: d.knock || 1, dir: away, point, bladeDir: dir, heavy,
      breaks: heavy || d.radius > 0 || a.name === 'nukido' || a.name === 'kaiten', from: this, move: a.name,
    });
    if (res === 'blocked') {
      fx.sparks.burst(point, dir.clone().negate().add(new THREE.Vector3(0, 0.5, 0)), 26, 6);
      fx.glints.flash(point, { color: 0xffd9a0, size: 0.6, life: 0.2, intensity: 8 });
      this.g.audio?.play('clash', { pos: point });
      this.g.world.hitstop(0.06);
      this.g.rig.shake(0.25);
      // The blade bounces off his guard.
      if (!heavy) {
        this.action = new Action('recoil', this.char.anim.out, { entryBody: a.bodySnapshot() });
        this.action.faceYaw = a.faceYaw;
        this.action.moveYaw = this.body.yaw;
      }
      return;
    }
    if (res === 'ignored') return;
    const killing = res === 'dead';
    fx.blood.spray(point, dir, killing ? 44 : 22, killing ? 4.5 : 3);
    fx.glints.flash(point, { color: 0xfff0dc, size: 0.35, life: 0.12, intensity: 5 });
    this.g.audio?.play(killing ? 'kill' : 'hit', { pos: point });
    const stop = killing ? 0.12 : heavy ? 0.1 : 0.065;
    this.g.world.hitstop(stop);
    this.g.rig.shake(killing ? 0.45 : heavy ? 0.35 : 0.18);
  }

  bladeTip(out) {
    const m = this.char.fig.bones.sword.matrixWorld;
    return out.set(0, 0.01, 0.09 + this.char.bladeLen).applyMatrix4(m);
  }

  // Blows from enemies. Returns 'dodged' | 'parried' | 'blocked' | 'hit' | 'dead'.
  receiveHit(info) {
    if (this.dead) return 'ignored';
    const a = this.action;
    const fx = this.g.fx;
    if (a && a.name === 'dodge' && a.t >= a.def.iframes[0] && a.t <= a.def.iframes[1]) {
      // A dodge at the last instant slows the world for a heartbeat.
      if (a.t < 0.16 && !this.flags.perfectDodge) {
        this.flags.perfectDodge = 1;
        this.g.world.slowmo(0.35, 0.35);
        this.g.hud?.flash('Evaded', 0.8);
      }
      return 'dodged';
    }
    if (a && a.name === 'parry' && !info.unblockable) {
      const p = info.point;
      const out = new THREE.Vector3().subVectors(p, this.body.pos).setY(0).normalize().add(new THREE.Vector3(0, 0.6, 0));
      if (a.t <= a.def.perfect) {
        fx.sparks.burst(p, out, 60, 8.5, 1.1);
        fx.glints.flash(p, { color: 0xffe8c0, size: 1.1, life: 0.35, intensity: 12 });
        this.g.audio?.play('parry', { pos: p });
        this.g.world.hitstop(0.08);
        this.g.world.slowmo(0.7, 0.28);
        this.g.rig.shake(0.35);
        this.riposte = 1.8;
        this.buffer = null;
        this.g.hud?.flash('Parried · strike now');
        return 'parried';
      }
      if (a.t <= a.def.guard) {
        fx.sparks.burst(p, out, 30, 6);
        fx.glints.flash(p, { color: 0xffd9a0, size: 0.6, life: 0.22, intensity: 8 });
        this.g.audio?.play('clash', { pos: p });
        this.g.world.hitstop(0.05);
        this.g.rig.shake(0.2);
        this.body.vel.addScaledVector(info.dir, 2.5);
        return 'blocked';
      }
    }
    // Hit.
    this.hp -= info.dmg;
    this.sinceHurt = 0;
    this.char.hit(0xff3020, 0.9);
    fx.blood.spray(info.point, info.bladeDir, 18, 2.5);
    this.g.audio?.play('hurt', { pos: info.point });
    this.g.world.hitstop(0.07);
    this.g.rig.shake(0.5);
    this.g.onPlayerHurt?.(info);
    if (this.hp <= 0) {
      this.hp = 0;
      this.die(info);
      return 'dead';
    }
    // Knocked off balance: a flinch, or off his feet from a heavy blow.
    this.charge = 0;
    this.chargeGlint = false;
    const turn = Math.atan2(-info.dir.x, -info.dir.z);
    if (info.react === 'knockdown') {
      this.action = null;
      this.fall = new Fall('knockdown');
      this.body.yaw = turn;
      this.body.vel.set(info.dir.x * 4, 0, info.dir.z * 4);
    } else {
      this.action = new Action(info.react === 'stagger' ? 'stagger' : 'flinch', this.char.anim.out, {});
      this.action.faceYaw = turn;
      this.action.moveYaw = turn + Math.PI;
    }
    return 'hit';
  }

  die(info) {
    this.dead = true;
    this.deadT = 0;
    this.action = null;
    this.fall = new Fall(info.heavy ? 'deathBack' : 'deathFwd');
    this.g.world.slowmo(1.2, 0.3);
    this.g.onPlayerDeath?.();
  }

  revive() {
    this.dead = false;
    this.hp = this.maxHp;
    this.action = null;
    this.buffer = null;
    // Pick himself up out of the grass.
    this.fall = new Fall('knockdown');
    this.fall.t = 1.3;
  }

  // Steer the body: lunges, facing, hops, spins, the plunge.
  drive(dt) {
    const body = this.body;
    const C = body.control;
    const a = this.action;
    C.velW = 0;
    C.face = null;
    C.spin = 0;
    C.gravity = 1;
    C.fall = 0;
    C.lock = 0;
    C.noJump = false;
    if (this.dead || this.fall) {
      C.lock = 1;
      C.noJump = true;
      C.vel.set(0, 0, 0);
      C.velW = body.grounded ? 1 - Math.exp(-6 * dt) : 0;
    } else if (a) {
      const d = a.def;
      C.lock = d.air ? 0.6 : 1;
      C.noJump = !d.air && a.name !== 'dodge';
      if (a.name === 'dodge') C.noJump = true;
      const sp = a.rootSpeed();
      if (sp !== 0) {
        C.vel.set(Math.sin(a.moveYaw) * sp, 0, Math.cos(a.moveYaw) * sp);
        C.velW = 1 - Math.exp(-30 * dt);
      } else if (body.grounded && !d.air) {
        C.vel.set(0, 0, 0);
        C.velW = 1 - Math.exp(-9 * dt);
      }
      if (a.faceYaw !== null && a.faceYaw !== undefined && (d.kind !== 'slash' || a.t < d.wind + d.strike)) {
        // Track a moving target through the windup.
        if (this.target && this.target.alive && a.t < (d.wind || 0.2)) {
          a.faceYaw = Math.atan2(this.target.body.pos.x - body.pos.x, this.target.body.pos.z - body.pos.z);
          a.moveYaw = a.faceYaw;
        }
        C.face = a.faceYaw;
        C.faceRate = 22;
      }
      if (d.spin && a.t >= d.spin.t0 && a.t <= d.spin.t1) {
        C.spin = (Math.PI * 2) / (d.spin.t1 - d.spin.t0);
        C.face = null;
      }
      if (d.hang && !body.grounded) C.gravity = d.hang;
      if (a.name === 'plunge') {
        C.gravity = a.t < 0.12 ? 0.05 : 1;
        C.fall = a.t < 0.12 ? 0 : 20;
        if (a.t < 0.12) body.vel.y = Math.max(body.vel.y, 0.5);
      }
    }
    if (body.grounded) this.airAttacks = 0;
    if (body.grounded && this.flags.perfectDodge && !(a && a.name === 'dodge')) this.flags.perfectDodge = 0;
  }

  // Remember where the body was, for sweeping the next frame's blade.
  endFrame() {
    this.prevPos.copy(this.body.renderPos);
    this.prevYaw = this.body.renderYaw;
  }
}
