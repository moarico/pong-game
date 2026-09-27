import * as THREE from 'three';
import { segSeg, hurtCapsule } from './combat.js';
import { groundHeight, pushOutCircle } from './ground.js';
import { makeCharacterMaterial } from './charmat.js';

// ---------------------------------------------------------------------------
// Bosses: one great foe per arena. A boss speaks the same language as the
// bandits (think / advance / receiveHit ...), so the samurai's blade, lunges,
// parries and HUD work on it unchanged; underneath it is a state machine of
// telegraphed attacks, a poise meter that breaks into a stagger, a second
// phase at half health, and a death that plays out before the victory.
// ---------------------------------------------------------------------------

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _p2 = new THREE.Vector3();
const _v = new THREE.Vector3();
const _w = new THREE.Vector3();

export const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
// Ease helpers for animation curves.
export const easeOut = (t) => 1 - (1 - t) * (1 - t);
export const easeIn = (t) => t * t;
export const easeInOut = (t) => t * t * (3 - 2 * t);
export const pulse = (t, a, b) => smooth(a[0], a[1], t) * (1 - smooth(b[0], b[1], t));

// A boss's body for the shared game loop: it moves in variable time, so the
// render position is the position.
export class BossBody {
  constructor() {
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.prevPos = new THREE.Vector3();
    this.renderPos = this.pos;
    this.yaw = 0;
    this.renderYaw = 0;
    this.radius = 1;
    this.grounded = true;
    this.control = { vel: new THREE.Vector3() };
  }

  interpolate() {
    this.renderYaw = this.yaw;
  }

  consumeEvents() {
    return {};
  }

  pushApart() {}
}

// A hurt volume: capsule a-b of radius r, damage multiplier, armour.
export function vol(part, r, mult = 1, armor = false) {
  return { a: new THREE.Vector3(), b: new THREE.Vector3(), r, part, mult, armor, on: true };
}

export class Boss {
  constructor(game, stage, o) {
    this.g = game;
    this.stage = stage;
    this.isBoss = true;
    this.name = o.name;
    this.epithet = o.epithet || '';
    this.maxHp = o.hp;
    this.hp = o.hp;
    this.poiseMax = o.poise ?? 240;
    this.body = new BossBody();
    this.root = new THREE.Group();
    this.char = { scale: 1, root: this.root, anim: { headWorld: new THREE.Vector3() } };
    this.material = makeCharacterMaterial(game.shared);
    this.volumes = [];
    this.solids = []; // [x, z, r]: ground the samurai cannot walk through
    this.lookPoint = new THREE.Vector3();
    this.focus = new THREE.Vector3(); // where the camera should keep an eye
    this.alive = false;
    this.active = false;
    this.sink = 0;
    this.shown = 0;
    this.token = false;
    this.state = 'off';
    this.stateT = 0;
    this.time = 0;
    this.phase = 1;
    this.attack = null;
    this.cooldown = 2;
    this.history = [];
    this.poise = 0;
    this.staggerT = 0;
    this.flash = 0;
    this.flashColor = new THREE.Color(1, 1, 1);
    this.attacks = {};
    this.deathT = 0;
  }

  // --- the shared enemy interface -------------------------------------------

  hittable() {
    return this.alive && this.state !== 'intro' && this.state !== 'phase' && this.state !== 'off';
  }

  targetable() {
    return this.alive;
  }

  think() {}
  fixed() {}
  endFrame() {}

  hurtVolumes() {
    return this.volumes.filter((v) => v.on);
  }

  // Nearest point on the boss's surface to `from`.
  aimPoint(from, out) {
    let best = Infinity;
    for (const v of this.volumes) {
      if (!v.on) continue;
      const d = closestOnSegment(v.a, v.b, from, _v);
      const s = d - v.r;
      if (s < best) {
        best = s;
        out.copy(_v);
        if (d > 1e-5) out.addScaledVector(_w.subVectors(from, _v).normalize(), Math.min(v.r, d));
      }
    }
    if (best === Infinity) out.copy(this.body.pos);
    return out;
  }

  partAt(p) {
    let best = Infinity;
    let part = null;
    for (const v of this.volumes) {
      if (!v.on) continue;
      const d = closestOnSegment(v.a, v.b, p, _v) - v.r;
      if (d < best) {
        best = d;
        part = v;
      }
    }
    return part;
  }

  // Keep the samurai out of the solid parts.
  collide(player) {
    for (const [x, z, r] of this.solids) pushOutCircle(player.pos, player.vel, x, z, r + player.radius);
  }

  // Blows from the samurai.
  receiveHit(info) {
    if (!this.hittable()) return 'ignored';
    const part = info.part || null;
    let mult = part ? part.mult : 1;
    if (this.staggerT > 0) mult *= 1.4;
    if (part && part.armor && !info.heavy) mult *= 0.35;
    const dmg = info.dmg * mult;
    this.hp -= dmg;
    this.shown = 3;
    this.flash = Math.min(1, this.flash + (part && part.mult > 1 ? 1 : 0.7));
    this.flashColor.set(part && part.mult > 1 ? 0xffe0b0 : 0xfff0e0);
    this.onDamage(dmg, info, part);
    if (this.hp <= 0) {
      this.hp = 0;
      this.die(info);
      return 'dead';
    }
    if (this.phase === 1 && this.hp < this.maxHp * 0.5 && this.state !== 'stagger') {
      this.beginPhase2();
      return 'hit';
    }
    if (this.state !== 'stagger' && this.state !== 'phase') {
      this.poise += dmg * (info.heavy ? 1.5 : 1) * (part && part.mult > 1 ? 1.3 : 1);
      if (this.poise >= this.poiseMax) this.stagger();
    }
    return 'hit';
  }

  onDamage() {}

  // --- the fight ---------------------------------------------------------------

  // Reset to the start of the fight (full health, idle, in place).
  reset() {
    this.hp = this.maxHp;
    this.alive = true;
    this.active = true;
    this.phase = 1;
    this.attack = null;
    this.cooldown = 2.2;
    this.history.length = 0;
    this.poise = 0;
    this.staggerT = 0;
    this.flash = 0;
    this.deathT = 0;
    this.time = 0;
    this.setState('idle');
    this.root.visible = true;
  }

  setState(s) {
    this.state = s;
    this.stateT = 0;
  }

  // Distance on the ground from the boss's centre (or a given point) to the samurai.
  playerDist(from = this.body.pos) {
    const P = this.g.player.pos;
    return Math.hypot(P.x - from.x, P.z - from.z);
  }

  yawToPlayer(from = this.body.pos) {
    const P = this.g.player.pos;
    return Math.atan2(P.x - from.x, P.z - from.z);
  }

  // Pick the next attack: allowed in this phase, in range, weighted, rarely the same thrice.
  chooseAttack() {
    const d = this.playerDist();
    const list = [];
    let total = 0;
    for (const [name, def] of Object.entries(this.attacks)) {
      if (def.phase && def.phase > this.phase) continue;
      if (def.range && (d < def.range[0] || d > def.range[1])) continue;
      let w = def.weight ?? 1;
      if (this.history[0] === name) w *= this.history[1] === name ? 0 : 0.35;
      if (w <= 0) continue;
      list.push([name, w]);
      total += w;
    }
    if (!list.length) return null;
    let r = Math.random() * total;
    for (const [name, w] of list) {
      r -= w;
      if (r <= 0) return name;
    }
    return list[list.length - 1][0];
  }

  startAttack(name) {
    const def = this.attacks[name];
    this.attack = { name, def, t: 0, prev: 0, dur: def.dur, fired: new Set(), hit: new Set(), data: {} };
    this.history.unshift(name);
    this.history.length = Math.min(this.history.length, 3);
    this.setState('attack');
    def.start?.call(this, this.attack);
  }

  // True once, on the frame the attack's clock passes t.
  at(a, t) {
    return a.prev < t && a.t >= t;
  }

  endAttack() {
    const a = this.attack;
    this.attack = null;
    const def = a ? a.def : null;
    this.cooldown = (def && def.cooldown ? def.cooldown : 1.2) * (this.phase === 2 ? 0.7 : 1);
    this.setState('idle');
  }

  stagger() {
    this.poise = 0;
    if (this.attack) this.attack.def.cancel?.call(this, this.attack);
    this.attack = null;
    this.staggerT = this.staggerDur || 3.2;
    this.setState('stagger');
    this.g.world.slowmo(0.5, 0.35);
    this.g.hud?.flash('Staggered · strike now', 1.4);
    this.g.audio?.play('stagger', { pos: this.lookPoint });
    this.g.rig.shake(0.6);
    this.onStagger();
  }

  onStagger() {}

  beginPhase2() {
    this.phase = 2;
    this.poise = 0;
    if (this.attack) this.attack.def.cancel?.call(this, this.attack);
    this.attack = null;
    this.setState('phase');
    this.g.world.slowmo(1.1, 0.3);
    this.g.rig.shake(1);
    this.g.audio?.play('roar', { pos: this.lookPoint });
    this.stage.onPhase2?.();
    this.onPhase2();
  }

  onPhase2() {}

  die(info) {
    this.alive = false;
    if (this.attack) this.attack.def.cancel?.call(this, this.attack);
    this.attack = null;
    this.deathT = 0;
    this.setState('dying');
    this.g.world.slowmo(2.2, 0.2);
    this.g.world.hitstop(0.2);
    this.g.rig.shake(1);
    this.g.audio?.play('bossdeath', { pos: this.lookPoint });
    this.stage.hazards.clear();
    this.stage.telegraphs.clear();
    this.onDeath(info);
  }

  onDeath() {}

  // After physics: run the state machine.
  advance(dt, combat) {
    if (!this.active) return;
    this.time += dt;
    this.stateT += dt;
    this.flash = Math.max(0, this.flash - dt * 7);
    this.shown = Math.max(0, this.shown - dt);
    switch (this.state) {
      case 'intro':
        if (this.updateIntro(dt)) this.setState('idle');
        break;
      case 'idle':
        this.cooldown -= dt;
        this.updateIdle(dt, combat);
        if (this.cooldown <= 0 && !combat.dead) {
          const name = this.chooseAttack();
          if (name) this.startAttack(name);
          else this.cooldown = 0.3;
        }
        break;
      case 'attack': {
        const a = this.attack;
        a.prev = a.t;
        a.t += dt;
        a.def.update.call(this, a, dt);
        if (this.attack === a && a.t >= a.dur) {
          a.def.end?.call(this, a);
          this.endAttack();
        }
        break;
      }
      case 'stagger':
        this.staggerT -= dt;
        this.updateStagger(dt);
        if (this.staggerT <= 0) {
          this.staggerT = 0;
          this.cooldown = 0.6;
          this.setState('idle');
        }
        break;
      case 'phase':
        if (this.updatePhase(dt)) {
          this.cooldown = 0.8;
          this.setState('idle');
        }
        break;
      case 'dying':
        this.deathT += dt;
        if (this.updateDeath(dt)) {
          this.setState('dead');
          this.stage.onVictory();
        }
        break;
      default:
        break;
    }
    this.poise = Math.max(0, this.poise - dt * this.poiseMax * 0.06);
    this.material.uniforms.uFlash.value.set(this.flashColor.r, this.flashColor.g, this.flashColor.b, this.flash);
  }

  updateIntro() {
    return true;
  }

  updateIdle() {}
  updateStagger() {}

  updatePhase() {
    return this.stateT > 2.5;
  }

  updateDeath() {
    return this.deathT > 4;
  }

  animate() {}

  // --- hurting the samurai -----------------------------------------------------

  // info: { dmg, react, point, dir, unblockable, parry(able), heavy }
  hurtPlayer(info) {
    const c = this.g.combat;
    if (c.dead) return 'ignored';
    const P = this.g.player.pos;
    const dir = info.dir || _v.set(P.x - this.body.pos.x, 0, P.z - this.body.pos.z).normalize().clone();
    const point = info.point || _w.copy(P).setY(P.y + 1.1).clone();
    const res = c.receiveHit({
      dmg: info.dmg,
      react: info.react || 'flinch',
      dir,
      point,
      bladeDir: info.bladeDir || dir,
      unblockable: info.unblockable ?? !info.parry,
      heavy: info.react === 'knockdown',
      from: this,
    });
    if (res === 'parried') this.onParried(info);
    return res;
  }

  onParried() {
    this.poise += this.poiseMax * 0.45;
    if (this.poise >= this.poiseMax) this.stagger();
  }

  // Does the capsule a-b (radius r) touch the samurai? Returns the contact point or null.
  touchesPlayer(a, b, r) {
    const pr = hurtCapsule(this.g.player.pos, this.g.char.scale, _a, _b);
    const d = segSeg(a, b, _a, _b, _p1, _p2);
    return d < r + pr ? _p2.clone() : null;
  }

  // One strike of a limb along its path this frame (a0->a1 root, b0->b1 tip swept):
  // hits once per attack.
  limbStrike(a, key, p0, p1, r, info) {
    if (a.hit.has(key)) return false;
    const hit = this.touchesPlayer(p0, p1, r);
    if (!hit) return false;
    a.hit.add(key);
    const P = this.g.player.pos;
    const res = this.hurtPlayer({ ...info, point: hit, dir: info.dir || new THREE.Vector3(P.x - p0.x, 0, P.z - p0.z).normalize() });
    return res;
  }
}

// Distance from p to segment a-b; closest point into out.
export function closestOnSegment(a, b, p, out) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abz = b.z - a.z;
  const L = abx * abx + aby * aby + abz * abz;
  let t = L > 1e-9 ? ((p.x - a.x) * abx + (p.y - a.y) * aby + (p.z - a.z) * abz) / L : 0;
  t = clamp(t, 0, 1);
  out.set(a.x + abx * t, a.y + aby * t, a.z + abz * t);
  return out.distanceTo(p);
}

// ---------------------------------------------------------------------------
// Hazards: areas of the floor that hurt for a while (shockwave rings, spikes,
// fire, steam, lightning). Each can be jumped (rings) or dodged through.
// ---------------------------------------------------------------------------

export class Hazards {
  constructor(game) {
    this.g = game;
    this.list = [];
  }

  // h: { shape:'circle'|'ring'|'rect'|'sector', x, z, r, rot, w, l, half, delay, dur,
  //      speed, width, height (rings: jump clear above this), dmg, react, tick (s, repeat), owner, unblockable }
  add(h) {
    const o = { delay: 0, dur: 0.15, dmg: 20, react: 'flinch', tick: 0, t: 0, hitAt: -1e9, height: 99, ...h };
    this.list.push(o);
    return o;
  }

  clear() {
    this.list.length = 0;
  }

  inside(h, x, z, y) {
    const dx = x - h.x;
    const dz = z - h.z;
    switch (h.shape) {
      case 'ring': {
        const r = (h.r0 ?? 0.5) + (h.speed ?? 8) * Math.max(0, h.t - h.delay);
        const d = Math.hypot(dx, dz);
        return Math.abs(d - r) < (h.width ?? 0.6) && y < h.height;
      }
      case 'rect': {
        const c = Math.cos(h.rot || 0);
        const s = Math.sin(h.rot || 0);
        const lx = dx * c - dz * s;
        const lz = dx * s + dz * c;
        return Math.abs(lx) < h.w && Math.abs(lz) < h.l && y < h.height;
      }
      case 'sector': {
        const d = Math.hypot(dx, dz);
        if (d > h.r || y > h.height) return false;
        const ang = Math.atan2(dx, dz);
        return Math.abs(wrapAngle(ang - (h.rot || 0))) < h.half;
      }
      default:
        return Math.hypot(dx, dz) < h.r && y < h.height;
    }
  }

  update(dt) {
    const P = this.g.player.pos;
    const y = P.y - groundHeight(P.x, P.z);
    for (let i = this.list.length - 1; i >= 0; i--) {
      const h = this.list[i];
      h.t += dt;
      if (h.t > h.delay + h.dur) {
        this.list.splice(i, 1);
        continue;
      }
      if (h.t < h.delay || !h.owner) continue;
      if (h.done) continue;
      if (h.t - h.hitAt < (h.tick || 1e9)) continue;
      if (!this.inside(h, P.x, P.z, y)) continue;
      h.hitAt = h.t;
      const res = h.owner.hurtPlayer({ dmg: h.dmg, react: h.react, unblockable: h.unblockable ?? true, dir: new THREE.Vector3(P.x - h.x, 0, P.z - h.z).normalize() });
      if (!h.tick && res !== 'dodged') h.done = true;
      h.onHit?.(res);
    }
  }
}

// ---------------------------------------------------------------------------
// Projectiles: thrown gears, crystal spears, fireballs. A perfect parry sends a
// reflectable one back at whoever threw it.
// ---------------------------------------------------------------------------

export class Projectiles {
  constructor(game, scene) {
    this.g = game;
    this.scene = scene;
    this.list = [];
  }

  // p: { mesh, pos, vel, gravity, radius, life, dmg, react, owner, reflectable, spin:[x,y,z],
  //      onGround(p), onExpire(p), onUpdate(p, dt), onReflectHit(p) }
  add(p) {
    const o = { gravity: 0, radius: 0.5, life: 5, dmg: 20, react: 'stagger', t: 0, reflected: false, ...p };
    if (o.mesh) this.scene.add(o.mesh);
    this.list.push(o);
    return o;
  }

  remove(o) {
    const i = this.list.indexOf(o);
    if (i >= 0) this.list.splice(i, 1);
    if (o.mesh) this.scene.remove(o.mesh);
  }

  clear() {
    for (const o of this.list) if (o.mesh) this.scene.remove(o.mesh);
    this.list.length = 0;
  }

  update(dt) {
    const g = this.g;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const o = this.list[i];
      o.t += dt;
      o.vel.y -= o.gravity * dt;
      o.pos.addScaledVector(o.vel, dt);
      if (o.mesh) {
        o.mesh.position.copy(o.pos);
        if (o.spin) {
          o.mesh.rotation.x += o.spin[0] * dt;
          o.mesh.rotation.y += o.spin[1] * dt;
          o.mesh.rotation.z += o.spin[2] * dt;
        }
      }
      o.onUpdate?.(o, dt);
      if (o.dead) {
        this.remove(o);
        continue;
      }
      if (o.reflected) {
        // Flying back: does it find its owner?
        const owner = o.owner;
        if (owner && owner.alive) {
          for (const v of owner.volumes) {
            if (!v.on) continue;
            if (closestOnSegment(v.a, v.b, o.pos, _v) < v.r + o.radius) {
              owner.receiveHit({ dmg: o.reflectDmg ?? o.dmg * 3, react: 'stagger', heavy: true, dir: o.vel.clone().normalize(), point: o.pos.clone(), part: v, from: g.combat });
              owner.poise += owner.poiseMax * 0.5;
              if (owner.alive && owner.poise >= owner.poiseMax && owner.state !== 'stagger') owner.stagger();
              o.onReflectHit?.(o);
              this.remove(o);
              break;
            }
          }
          if (!this.list.includes(o)) continue;
        }
      } else if (!g.combat.dead) {
        const pr = hurtCapsule(g.player.pos, g.char.scale, _a, _b);
        if (closestOnSegment(_a, _b, o.pos, _v) < pr + o.radius) {
          const res = o.owner.hurtPlayer({ dmg: o.dmg, react: o.react, parry: !!o.reflectable, unblockable: !o.reflectable, point: o.pos.clone(), dir: o.vel.clone().setY(0).normalize() });
          if (res === 'parried' && o.reflectable) {
            // Straight back where it came from, faster.
            o.reflected = true;
            const target = o.owner.lookPoint;
            const sp = o.vel.length() * 1.35 + 6;
            o.vel.subVectors(target, o.pos).normalize().multiplyScalar(sp);
            o.gravity = 0;
            g.hud?.flash('Deflected', 1);
            continue;
          }
          if (res !== 'dodged') {
            o.onHitPlayer?.(o);
            this.remove(o);
            continue;
          }
        }
      }
      const gy = groundHeight(o.pos.x, o.pos.z);
      if (o.pos.y < gy + o.radius * 0.5 && o.vel.y <= 0 && !o.rolls) {
        o.onGround?.(o);
        this.remove(o);
        continue;
      }
      if (o.t > o.life) {
        o.onExpire?.(o);
        this.remove(o);
      }
    }
  }
}
