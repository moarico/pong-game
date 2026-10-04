import * as THREE from 'three';
import { WEAPONS, GATHER } from './config.js';
import { weaponDamage, headDamage } from './items.js';
import { clamp, lerp } from './util.js';
import { makeGlowTexture } from './world/structures.js';

const DEG = Math.PI / 180;
const _u = new THREE.Vector3(), _v = new THREE.Vector3(), _d = new THREE.Vector3(), _m = new THREE.Vector3(), _p = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function falloffMul(def, dist) {
  if (!def.falloff) return 1;
  const [near, far, mul] = def.falloff;
  if (dist <= near) return 1;
  if (dist >= far) return mul;
  return lerp(1, mul, (dist - near) / (far - near));
}

// Ray against a standing character: a vertical cylinder for the body and a sphere for the head.
function rayCharacter(o, d, a, maxT) {
  const H = a.body.height;
  const px = a.pos.x, py = a.pos.y, pz = a.pos.z;
  let best = null;
  // head sphere
  const hy = py + H - 0.2, hr = 0.24;
  {
    const ox = o.x - px, oy = o.y - hy, oz = o.z - pz;
    const b = ox * d.x + oy * d.y + oz * d.z;
    const c = ox * ox + oy * oy + oz * oz - hr * hr;
    const disc = b * b - c;
    if (disc >= 0) {
      const t = -b - Math.sqrt(disc);
      if (t >= 0 && t < maxT) best = { t, head: true };
    }
  }
  // body cylinder
  const r = a.mode === 'freefall' ? 0.8 : 0.42;
  const y0 = py + (a.mode === 'freefall' ? 0.2 : 0), y1 = py + H - 0.4;
  const ox = o.x - px, oz = o.z - pz;
  const A = d.x * d.x + d.z * d.z;
  if (A > 1e-8) {
    const B = 2 * (ox * d.x + oz * d.z);
    const C = ox * ox + oz * oz - r * r;
    const disc = B * B - 4 * A * C;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      for (const t of [(-B - sq) / (2 * A), (-B + sq) / (2 * A)]) {
        if (t < 0 || t >= maxT) continue;
        const y = o.y + d.y * t;
        if (y >= y0 && y <= y1) {
          if (!best || t < best.t) best = { t, head: false };
          break;
        }
      }
    }
  }
  // caps (for shots from directly above/below)
  if (Math.abs(d.y) > 1e-6) {
    for (const yc of [y1, y0]) {
      const t = (yc - o.y) / d.y;
      if (t < 0 || t >= maxT) continue;
      const x = o.x + d.x * t - px, z = o.z + d.z * t - pz;
      if (x * x + z * z <= r * r && (!best || t < best.t)) best = { t, head: false };
    }
  }
  return best;
}

export class Combat {
  constructor(game) {
    this.game = game;
    this.projectiles = [];
    this.group = new THREE.Group();
    game.scene.add(this.group);
    this.rocketGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
    this.rocketGeo.rotateX(Math.PI / 2);
    this.rocketMat = new THREE.MeshLambertMaterial({ color: 0x6e7a48, emissive: 0x331100 });
    this.bulletMat = new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xfff0a0, blending: THREE.AdditiveBlending, depthWrite: false });
  }

  reset() {
    for (const p of this.projectiles) this.group.remove(p.mesh);
    this.projectiles = [];
  }

  spreadDir(dir, spreadDeg, out) {
    out.copy(dir);
    if (spreadDeg <= 0.001) return out;
    _u.crossVectors(dir, Math.abs(dir.y) > 0.95 ? _m.set(1, 0, 0) : UP).normalize();
    _v.crossVectors(dir, _u).normalize();
    const ang = Math.sqrt(Math.random()) * spreadDeg * DEG;
    const phi = Math.random() * Math.PI * 2;
    const t = Math.tan(ang);
    out.addScaledVector(_u, Math.cos(phi) * t).addScaledVector(_v, Math.sin(phi) * t).normalize();
    return out;
  }

  muzzlePos(actor, out) {
    if (actor.model.root.visible && actor.mode === 'ground') return actor.model.muzzle(out);
    return actor.eye(out);
  }

  fire(actor, item) {
    const def = WEAPONS[item.type];
    const spread = actor.currentSpread();
    const o = actor.aimOrigin;
    const muzzle = this.muzzlePos(actor, new THREE.Vector3());
    const dmg = weaponDamage(item), head = headDamage(item);
    const g = this.game;
    if (def.kind === 'projectile') {
      const dir = this.spreadDir(actor.aimDir, spread, new THREE.Vector3());
      this.spawnProjectile(actor, item, o.clone(), dir.multiplyScalar(def.speed), muzzle);
    } else {
      const pellets = def.pellets || 1;
      const per = dmg / pellets, perHead = head / pellets;
      const dir = new THREE.Vector3();
      for (let i = 0; i < pellets; i++) {
        this.spreadDir(actor.aimDir, spread, dir);
        const hit = this.trace(actor, o, dir, def.range);
        const end = hit ? hit.point : _p.copy(o).addScaledVector(dir, Math.min(def.range, 160));
        if (pellets === 1 || i % 3 === 0) g.fx.tracer(muzzle, end, def.kind === 'pellets' ? '#ffd27a' : '#fff0b0');
        if (hit) this.applyHit(actor, item, def, hit, per * falloffMul(def, hit.t), perHead * falloffMul(def, hit.t), def.structure / pellets, dir);
      }
    }
    g.fx.muzzle(muzzle);
    g.audio.play('shot-' + item.type, actor.pos);
    g.noise(actor.pos, def.kind === 'pellets' ? 70 : 110, actor);
  }

  // Nearest hit along a ray: world geometry or a character.
  trace(shooter, o, d, range, ignoreActors = false) {
    const W = this.game.collision;
    const vehicle = shooter.vehicle;
    const wh = W.raycast(o.x, o.y, o.z, d.x, d.y, d.z, range, vehicle ? (c) => c.owner === vehicle : null);
    const maxT = wh ? wh.t : range;
    const ah = ignoreActors ? null : this.rayActors(o, d, maxT, shooter);
    if (ah) return { t: ah.t, point: o.clone().addScaledVector(d, ah.t), actor: ah.actor, head: ah.head };
    if (wh) return { t: wh.t, point: new THREE.Vector3(wh.x, wh.y, wh.z), normal: new THREE.Vector3(wh.nx, wh.ny, wh.nz), collider: wh.collider, terrain: wh.terrain };
    return null;
  }

  rayActors(o, d, maxT, shooter) {
    let best = null;
    for (const a of this.game.actors) {
      if (a === shooter || !a.alive || a.mode === 'bus') continue;
      const dx = a.pos.x - o.x, dz = a.pos.z - o.z;
      // quick reject: distance from ray in XZ
      const along = dx * d.x + dz * d.z;
      if (along < -2) continue;
      const h = rayCharacter(o, d, a, best ? best.t : maxT);
      if (h && (!best || h.t < best.t)) best = { t: h.t, head: h.head, actor: a };
    }
    return best;
  }

  applyHit(shooter, item, def, hit, dmg, headDmg, structDmg, dir) {
    const g = this.game;
    if (hit.actor) {
      const target = hit.actor;
      const amount = hit.head ? headDmg : dmg;
      const hadShield = target.shield > 0;
      this.damageActor(target, amount, shooter, def.name, hit.head, hit.point, hadShield);
      g.fx.impact(hit.point, null, hadShield ? 'shield' : 'actor');
      return;
    }
    const owner = hit.collider?.owner;
    if (owner && owner.kind === 'build') {
      g.build.damage(owner, structDmg, shooter);
      g.fx.impact(hit.point, hit.normal, 'build');
      if (!shooter.isBot) g.hud.structureHit(owner);
    } else if (owner && owner.kind === 'vehicle') {
      owner.damage(dmg, shooter);
      g.fx.impact(hit.point, hit.normal, 'shield');
    } else {
      g.fx.impact(hit.point, hit.normal, 'world');
    }
  }

  damageActor(target, amount, shooter, cause, head = false, point = null, shieldHit = false) {
    const g = this.game;
    amount = Math.round(amount);
    if (amount <= 0 || !target.alive) return;
    const wasAlive = target.alive;
    const dealt = target.takeDamage(amount, shooter, { cause });
    if (shooter === g.player && target !== shooter) g.playerDamage += dealt;
    if (shooter && !shooter.isBot && shooter !== target) {
      g.hud.damageNumber(point || target.center(), amount, head, shieldHit);
      g.hud.hitMarker(head, wasAlive && !target.alive);
      g.audio.play(head ? 'headshot' : 'hit', null);
    }
    if (!target.isBot && shooter && shooter !== target) g.hud.damageFrom(shooter.pos);
    if (target.brain && shooter && shooter !== target) target.brain.onDamaged(shooter);
  }

  // ---------- projectiles ----------

  spawnProjectile(actor, item, origin, vel, muzzle) {
    const def = WEAPONS[item.type];
    let mesh;
    if (item.type === 'rocket') {
      mesh = new THREE.Mesh(this.rocketGeo, this.rocketMat);
    } else {
      mesh = new THREE.Sprite(this.bulletMat);
      mesh.scale.setScalar(0.5);
    }
    mesh.position.copy(muzzle);
    this.group.add(mesh);
    // The projectile flies from the aim origin; the mesh blends in from the muzzle.
    this.projectiles.push({ owner: actor, item, def, pos: origin, vel, life: item.type === 'rocket' ? 8 : 3.5, mesh, blend: 0, muzzle: muzzle.clone(), travelled: 0 });
    if (item.type === 'sniper') this.game.fx.tracer(muzzle, origin.clone().addScaledVector(vel, 0.25 / vel.length() * 40), '#fff6c0');
  }

  update(dt) {
    const g = this.game;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      const step = p.vel.length() * dt;
      _d.copy(p.vel).normalize();
      const hit = this.trace(p.owner, p.pos, _d, step + 0.05);
      if (hit) {
        if (p.item.type === 'rocket') this.explode(hit.point.clone().addScaledVector(_d, -0.3), p.owner, p.item);
        else {
          const dmg = weaponDamage(p.item), head = headDamage(p.item);
          this.applyHit(p.owner, p.item, p.def, hit, dmg, head, p.def.structure, _d);
          if (p.travelled > 30) g.fx.tracer(p.mesh.position, hit.point, '#fff6c0');
        }
        this.group.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }
      const prev = p.mesh.position.clone();
      p.pos.addScaledVector(p.vel, dt);
      p.travelled += step;
      if (p.def.gravity) p.vel.y -= p.def.gravity * dt;
      p.blend = Math.min(1, p.blend + dt * 6);
      p.mesh.position.lerpVectors(p.muzzle, p.pos, p.item.type === 'rocket' ? Math.min(1, p.blend * 2) : 1);
      if (p.item.type === 'rocket') {
        p.mesh.lookAt(p.mesh.position.clone().add(p.vel));
        g.fx.trail(p.mesh.position, '#cfcfcf');
        g.fx.sparks.spawn(p.mesh.position.x, p.mesh.position.y, p.mesh.position.z, 0, 0, 0, '#ff9a3a', 0.12, 0);
      } else if (p.travelled > 20) {
        g.fx.tracer(prev, p.mesh.position, '#fff0b0');
      }
      if (p.life <= 0 || p.pos.y < -30) {
        if (p.item.type === 'rocket') this.explode(p.pos.clone(), p.owner, p.item);
        this.group.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  explode(pos, owner, item) {
    const g = this.game;
    const W = g.collision;
    const def = WEAPONS[item.type];
    const R = def.splash;
    const base = weaponDamage(item);
    g.fx.explosion(pos, R);
    g.audio.play('explosion', pos);
    g.noise(pos, 160, owner);
    for (const a of g.actors) {
      if (!a.alive || a.mode === 'bus') continue;
      const d = a.center(_m).distanceTo(pos);
      if (d > R + 0.5) continue;
      // Splash is blocked by cover unless the target is right next to the blast.
      if (d > 1.5 && !W.los(pos.x, pos.y + 0.2, pos.z, _m.x, _m.y, _m.z)) continue;
      const amount = base * clamp(1 - (d / R) * 0.5, 0.4, 1);
      this.damageActor(a, amount, owner, def.name, false, _m.clone(), a.shield > 0);
    }
    // Structures in range
    const hitPieces = new Set();
    W.query(pos.x - R, pos.z - R, pos.x + R, pos.z + R, (c) => {
      const o = c.owner;
      if (!o) return;
      const cx = clamp(pos.x, c.minx, c.maxx), cy = clamp(pos.y, c.miny, c.maxy), cz = clamp(pos.z, c.minz, c.maxz);
      const d = Math.hypot(cx - pos.x, cy - pos.y, cz - pos.z);
      if (d > R) return;
      if (o.kind === 'build') hitPieces.add([o, d]);
      else if (o.kind === 'vehicle') o.damage(base * 2, owner);
    });
    for (const [piece, d] of hitPieces) g.build.damage(piece, def.structure * clamp(1 - (d / R) * 0.4, 0.5, 1), owner);
  }

  // ---------- harvesting tool ----------

  melee(actor) {
    const g = this.game;
    let o = actor.aimOrigin;
    const d = actor.aimDir;
    const reach = GATHER.reach;
    g.audio.play('swing', actor.pos);
    let ah = this.rayActors(o, d, reach, actor);
    let wh = g.collision.raycast(o.x, o.y, o.z, d.x, d.y, d.z, reach);
    if (!ah && (!wh || wh.terrain)) {
      // Over-the-shoulder aim can pass beside a trunk the player is facing; retry from the eye.
      const eye = actor.eye(new THREE.Vector3());
      const ah2 = this.rayActors(eye, d, reach, actor);
      const wh2 = g.collision.raycast(eye.x, eye.y, eye.z, d.x, d.y, d.z, reach);
      if (ah2 || (wh2 && !wh2.terrain)) {
        o = eye;
        ah = ah2;
        wh = wh2;
      }
    }
    if (ah && (!wh || ah.t < wh.t)) {
      this.damageActor(ah.actor, GATHER.playerDamage, actor, 'Harvesting Tool', false, o.clone().addScaledVector(d, ah.t));
      return;
    }
    if (!wh) return;
    const point = new THREE.Vector3(wh.x, wh.y, wh.z);
    const normal = new THREE.Vector3(wh.nx, wh.ny, wh.nz);
    const owner = wh.collider?.owner;
    if (!owner) {
      g.fx.impact(point, normal, 'world');
      g.audio.play('thunk', point);
      return;
    }
    if (owner.kind === 'build') {
      g.build.damage(owner, GATHER.structureDamage, actor);
      g.fx.impact(point, normal, 'build');
      g.audio.play('thunk', point);
      if (!actor.isBot) g.hud.structureHit(owner);
      return;
    }
    if (owner.kind === 'vehicle') {
      owner.damage(GATHER.structureDamage, actor);
      g.audio.play('clang', point);
      return;
    }
    if (owner.kind === 'tree' || owner.kind === 'rock' || owner.kind === 'metal') {
      let crit = false;
      const ws = g.weakSpot;
      if (!actor.isBot && ws.target === owner && ws.pos.distanceTo(point) < 0.55) crit = true;
      const amount = crit ? Math.round(lerp(GATHER.weakMin, GATHER.weakMax, Math.random())) : Math.round(lerp(GATHER.min, GATHER.max, Math.random()));
      const taken = actor.addMat(owner.resource, amount);
      g.props.hit(owner, crit ? GATHER.weakDamage : GATHER.damage);
      const chipColor = owner.resource === 'wood' ? '#a8763f' : owner.resource === 'stone' ? '#a0a0a0' : '#c0c8d0';
      g.fx.chips(point, chipColor);
      g.audio.play(owner.resource === 'wood' ? 'chop' : owner.resource === 'stone' ? 'stone' : 'clang', point);
      if (!actor.isBot) {
        g.hud.gather(owner.resource, taken, crit);
        if (crit) g.audio.play('crit', null);
        this.moveWeakSpot(owner, point, normal, actor);
      }
    }
  }

  moveWeakSpot(target, point, normal, actor) {
    const ws = this.game.weakSpot;
    if (!target.alive) {
      ws.target = null;
      return;
    }
    // Pick a new spot on the surface around the hit point.
    _u.crossVectors(normal, UP);
    if (_u.lengthSq() < 0.01) _u.set(1, 0, 0);
    _u.normalize();
    const c = target.collider;
    const nx = clamp(point.x + _u.x * (Math.random() - 0.5) * 1.6, c.minx, c.maxx);
    const nz = clamp(point.z + _u.z * (Math.random() - 0.5) * 1.6, c.minz, c.maxz);
    const ny = clamp(point.y + (Math.random() - 0.5) * 1.2, Math.max(c.miny, actor.pos.y + 0.4), Math.min(c.maxy, actor.pos.y + 2.2));
    ws.target = target;
    ws.pos.set(nx, ny, nz).addScaledVector(normal, 0.06);
  }
}

