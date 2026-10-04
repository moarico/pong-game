import * as THREE from 'three';
import { PLAYER, WEAPONS, HEALS, AMMO_CAPS, BUILD, GATHER, MAP, MATERIALS } from './config.js';
import { CharacterModel } from './character.js';
import { clamp } from './util.js';

const SWIM_DEPTH = -1.25;
const AUTO_WEAPONS = new Set(['ar', 'smg', 'pistol', 'lmg']);
const SWITCH_TIME = 0.32;
const damp = (a, b, rate, dt) => b + (a - b) * Math.exp(-rate * dt);
let nextId = 1;

// One combatant: the human player and every bot use this class. Controllers fill `intent`.
export class Actor {
  constructor(game, { name, isBot, outfit }) {
    this.game = game;
    this.id = nextId++;
    this.name = name;
    this.isBot = isBot;
    this.outfit = outfit;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.mode = 'bus';
    this.health = PLAYER.maxHealth;
    this.shield = 0;
    this.mats = { wood: 0, stone: 0, metal: 0 };
    this.ammo = { light: 0, medium: 0, heavy: 0, shells: 0, rockets: 0 };
    this.slots = [null, null, null, null, null];
    this.sel = -1; // -1 = harvesting tool
    this.buildMode = false;
    this.buildPiece = 'wall';
    this.buildMat = 'wood';
    this.alive = true;
    this.kills = 0;
    this.placement = 0;
    this.crouching = false;
    this.sprinting = false;
    this.aiming = false;
    this.onGround = false;
    this.fireCd = 0;
    this.reloadT = 0;
    this.reloadTotal = 0;
    this.reloadItem = null;
    this.bloom = 0;
    this.heal = null;
    this.swingCd = 0;
    this.buildCd = 0;
    this.freefallT = 0;
    this.emote = false;
    this.emoteT = 0;
    this.vehicle = null;
    this.lastHitBy = null;
    this.lastHitTime = -99;
    this.damageTaken = 0;
    this.stormTick = 0;
    this.intent = this.blankIntent();
    this.aimOrigin = new THREE.Vector3();
    this.aimDir = new THREE.Vector3(0, 0, -1);
    this.body = { pos: this.pos, radius: PLAYER.radius, height: PLAYER.height, step: PLAYER.stepHeight };
    this.lastShotT = -9;
    this.switchT = 0;
    this.adsT = 0;
    this.landKick = 0;
    this.stepPh = 0;
    this.reloadShell = false;
    this.model = new CharacterModel(outfit, isBot ? name : null);
    this.model.root.visible = false;
    game.scene.add(this.model.root);
  }

  blankIntent() {
    return {
      mx: 0, mz: 0, sprint: false, jump: false, crouch: false, fire: false, firePressed: false, aim: false,
      reload: false, interact: false, edit: false, emote: false,
    };
  }

  get eyeHeight() {
    return this.crouching ? PLAYER.crouchEye : PLAYER.eye;
  }

  eye(out = new THREE.Vector3()) {
    return out.set(this.pos.x, this.pos.y + this.eyeHeight, this.pos.z);
  }

  center(out = new THREE.Vector3()) {
    return out.set(this.pos.x, this.pos.y + this.body.height * 0.55, this.pos.z);
  }

  get held() {
    return this.sel >= 0 ? this.slots[this.sel] : null;
  }

  get canAct() {
    return this.alive && (this.mode === 'ground');
  }

  forward(out = new THREE.Vector3()) {
    return out.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  // Desired world-space movement direction from the intent (length <= 1).
  moveVector() {
    const I = this.intent;
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
    let x = fx * I.mz + rx * I.mx, z = fz * I.mz + rz * I.mx;
    const l = Math.hypot(x, z);
    if (l > 1) {
      x /= l;
      z /= l;
    }
    return { x, z, len: Math.min(1, l) };
  }

  // ---------- inventory ----------

  selectSlot(i) {
    if (i === this.sel && !this.buildMode) return;
    this.buildMode = false;
    const changed = i !== this.sel;
    this.sel = i;
    this.cancelReload();
    this.cancelHeal();
    this.fireCd = Math.max(this.fireCd, 0.25);
    this.emote = false;
    if (changed) {
      this.switchT = SWITCH_TIME;
      this.adsT = 0;
      if (!this.isBot) this.game.audio.snd('swap', { vol: 0.5 });
    }
  }

  cycleSlot(d) {
    const order = [-1, 0, 1, 2, 3, 4];
    let idx = order.indexOf(this.sel);
    for (let k = 0; k < 6; k++) {
      idx = (idx + d + 6) % 6;
      const s = order[idx];
      if (s === -1 || this.slots[s]) {
        this.selectSlot(s);
        return;
      }
    }
  }

  setBuildMode(on, piece) {
    if (on && !this.canAct) return;
    this.buildMode = on;
    if (piece) this.buildPiece = piece;
    if (on) {
      this.cancelReload();
      this.cancelHeal();
      this.aiming = false;
      this.emote = false;
      if (this.mats[this.buildMat] < BUILD.cost) this.autoMaterial();
    }
  }

  autoMaterial() {
    for (const m of MATERIALS) {
      if (this.mats[m] >= BUILD.cost) {
        this.buildMat = m;
        return true;
      }
    }
    return false;
  }

  cycleMaterial() {
    const i = MATERIALS.indexOf(this.buildMat);
    this.buildMat = MATERIALS[(i + 1) % 3];
  }

  addAmmo(type, n) {
    const room = AMMO_CAPS[type] - this.ammo[type];
    const take = Math.max(0, Math.min(room, n));
    this.ammo[type] += take;
    return take;
  }

  addMat(type, n) {
    const room = BUILD.matCap - this.mats[type];
    const take = Math.max(0, Math.min(room, n));
    this.mats[type] += take;
    return take;
  }

  // Put a weapon or consumable into the inventory. Returns { taken, dropped, leftover }.
  receive(item) {
    if (item.kind === 'ammo') {
      const t = this.addAmmo(item.type, item.count);
      item.count -= t;
      return { taken: t > 0, leftover: item.count > 0 ? item : null };
    }
    if (item.kind === 'mat') {
      const t = this.addMat(item.type, item.count);
      item.count -= t;
      return { taken: t > 0, leftover: item.count > 0 ? item : null };
    }
    if (item.kind === 'heal') {
      const cap = HEALS[item.type].stack;
      for (const s of this.slots) {
        if (s && s.kind === 'heal' && s.type === item.type && s.count < cap) {
          const t = Math.min(cap - s.count, item.count);
          s.count += t;
          item.count -= t;
          if (item.count <= 0) return { taken: true, leftover: null };
        }
      }
    }
    const empty = this.slots.indexOf(null);
    if (empty >= 0) {
      this.slots[empty] = item;
      if (this.sel === -1 && item.kind === 'weapon' && !this.buildMode && this.isBot) this.selectSlot(empty);
      return { taken: true, leftover: null };
    }
    // Swap with the held slot.
    if (this.sel >= 0) {
      const dropped = this.slots[this.sel];
      this.slots[this.sel] = item;
      this.cancelReload();
      this.cancelHeal();
      return { taken: true, leftover: null, dropped };
    }
    return { taken: false, leftover: item };
  }

  // ---------- weapons ----------

  weaponDef() {
    const h = this.held;
    return h && h.kind === 'weapon' ? WEAPONS[h.type] : null;
  }

  currentSpread() {
    const def = this.weaponDef();
    if (!def) return 0;
    let s = this.aiming ? def.spreadAds : def.spreadHip;
    const sp = Math.hypot(this.vel.x, this.vel.z);
    if (sp > 0.5) s += def.moveSpread * clamp(sp / PLAYER.walk, 0, 1.6);
    if (!this.onGround) s += 2;
    s += this.bloom;
    if (this.crouching) s *= 0.75;
    return s;
  }

  startReload() {
    const item = this.held;
    if (!item || item.kind !== 'weapon' || this.reloadT > 0) return;
    const def = WEAPONS[item.type];
    if (item.ammo >= def.mag || this.ammo[def.ammo] <= 0) return;
    this.reloadItem = item;
    // Pump shotguns load one shell at a time and can fire between shells.
    this.reloadShell = !!def.pellets;
    this.reloadTotal = (this.reloadShell ? def.reload / def.mag : def.reload) * (1 - 0.03 * item.rarity);
    this.reloadT = this.reloadTotal;
    this.cancelHeal();
    if (this.isBot && this.game.isNearPlayer(this.pos, 30)) this.game.audio.play('reload', this.pos);
  }

  cancelReload() {
    this.reloadT = 0;
    this.reloadItem = null;
  }

  finishReload() {
    const item = this.reloadItem;
    this.reloadItem = null;
    this.reloadT = 0;
    if (!item) return;
    const def = WEAPONS[item.type];
    if (this.reloadShell) {
      if (this.ammo[def.ammo] <= 0) return;
      item.ammo++;
      this.ammo[def.ammo]--;
      if (item.ammo < def.mag && this.ammo[def.ammo] > 0) {
        this.reloadItem = item;
        this.reloadT = this.reloadTotal;
      } else if (!this.isBot) this.game.audio.snd('pump', { vol: 0.7 });
      return;
    }
    const take = Math.min(def.mag - item.ammo, this.ammo[def.ammo]);
    item.ammo += take;
    this.ammo[def.ammo] -= take;
  }

  tryFire(item) {
    const def = WEAPONS[item.type];
    // a shell reload can be cut short to fire what is already loaded
    if (this.reloadT > 0 && this.reloadShell && item.ammo > 0 && this.intent.firePressed) this.cancelReload();
    if (this.fireCd > 0 || this.reloadT > 0 || this.switchT > 0) return;
    if (!AUTO_WEAPONS.has(item.type) && !this.intent.firePressed) return;
    if (item.ammo <= 0) {
      if (this.ammo[def.ammo] > 0) this.startReload();
      else if (this.intent.firePressed && !this.isBot) this.game.audio.play('empty', this.pos);
      return;
    }
    item.ammo--;
    this.fireCd = 1 / def.rate;
    this.lastShotT = this.game.time;
    this.game.combat.fire(this, item);
    this.bloom = Math.min(def.bloomMax, this.bloom + def.bloom);
    this.model.fired();
    if (!this.isBot) this.game.onPlayerFire(def);
    this.emote = false;
    if (item.ammo <= 0 && this.ammo[def.ammo] > 0) this.reloadPending = 0.25;
  }

  // ---------- healing ----------

  canUseHeal(item) {
    const d = HEALS[item.type];
    if (d.hp) return this.health < d.cap;
    return this.shield < d.cap;
  }

  startHeal() {
    const item = this.held;
    if (!item || item.kind !== 'heal' || this.heal) return false;
    if (!this.canUseHeal(item)) {
      if (!this.isBot && this.intent.firePressed) this.game.hud.toast(HEALS[item.type].hp ? 'Health is already high enough' : 'Shield is already high enough');
      return false;
    }
    this.heal = { item, t: 0, total: HEALS[item.type].time };
    this.sprinting = false;
    if (!this.isBot) this.game.audio.snd(HEALS[item.type].hp ? 'pouch' : 'shield_drink', { vol: 0.6 });
    return true;
  }

  cancelHeal() {
    this.heal = null;
  }

  finishHeal() {
    const item = this.heal.item;
    const d = HEALS[item.type];
    if (d.hp) this.health = Math.min(d.cap, this.health + d.hp);
    if (d.shield) this.shield = Math.min(d.cap, this.shield + d.shield);
    item.count--;
    if (item.count <= 0) {
      const i = this.slots.indexOf(item);
      if (i >= 0) this.slots[i] = null;
      if (this.sel === i) this.sel = this.slots.findIndex((s) => s);
    }
    this.heal = null;
    if (!this.isBot) this.game.audio.play('healed', this.pos);
  }

  // ---------- damage ----------

  takeDamage(amount, attacker, opts = {}) {
    if (!this.alive || amount <= 0) return 0;
    let dealt = 0;
    if (!opts.ignoreShield && this.shield > 0) {
      const s = Math.min(this.shield, amount);
      this.shield -= s;
      amount -= s;
      dealt += s;
    }
    const h = Math.min(this.health, amount);
    this.health -= amount;
    dealt += h;
    this.cancelHeal();
    this.emote = false;
    this.model.flinch = 1;
    if (attacker && attacker !== this) {
      this.lastHitBy = attacker;
      this.lastHitTime = this.game.time;
    }
    this.damageTaken += dealt;
    if (this.health <= 0) {
      this.health = 0;
      this.game.eliminate(this, attacker, opts.cause || 'eliminated');
    }
    return dealt;
  }

  // ---------- update ----------

  update(dt) {
    if (!this.alive) return;
    this.fireCd = Math.max(0, this.fireCd - dt);
    this.switchT = Math.max(0, this.switchT - dt);
    this.landKick = Math.max(0, this.landKick - dt * 4);
    this.swingCd = Math.max(0, this.swingCd - dt);
    this.buildCd = Math.max(0, this.buildCd - dt);
    const def = this.weaponDef();
    this.bloom = Math.max(0, this.bloom - dt * (def ? 4 : 0) * (def && def.bloomMax ? 1 : 0));
    if (this.mode === 'bus' || this.mode === 'vehicle') {
      this.updateModel(dt);
      return;
    }
    this.updateMovement(dt);
    if (this.mode !== 'ground') this.adsT = 0;
    if (this.mode === 'ground') this.updateActions(dt);
    else if (this.mode === 'swim') {
      this.cancelHeal();
      this.buildMode = false;
      this.aiming = false;
    }
    this.updateModel(dt);
  }

  updateMovement(dt) {
    const I = this.intent;
    const W = this.game.collision;
    const mv = this.moveVector();
    if (this.mode === 'freefall' || this.mode === 'glide') {
      this.crouching = false;
      this.body.height = PLAYER.height;
      this.freefallT += dt;
      let sideSpeed, down;
      if (this.mode === 'freefall') {
        sideSpeed = PLAYER.freefallSide;
        down = I.mz < -0.3 ? PLAYER.freefallDown * 0.78 : PLAYER.freefallDown;
      } else {
        sideSpeed = PLAYER.glideForward;
        down = PLAYER.glideDown;
      }
      let tx = mv.x * sideSpeed, tz = mv.z * sideSpeed;
      if (this.mode === 'glide' && mv.len < 0.1) {
        const f = this.forward();
        tx = f.x * sideSpeed * 0.6;
        tz = f.z * sideSpeed * 0.6;
      }
      const k = 1 - Math.exp(-dt * (this.mode === 'glide' ? 2.5 : 1.8));
      this.vel.x += (tx - this.vel.x) * k;
      this.vel.z += (tz - this.vel.z) * k;
      this.vel.y += (-down - this.vel.y) * (1 - Math.exp(-dt * 3));
      const res = W.moveBody(this.body, this.vel.x * dt, this.vel.y * dt, this.vel.z * dt);
      const ground = W.groundAt(this.pos.x, this.pos.z, this.pos.y + 0.1);
      const above = this.pos.y - Math.max(ground, 0);
      if (this.mode === 'freefall' && ((I.jump && this.freefallT > 0.6) || above < PLAYER.autoGlideHeight)) {
        this.mode = 'glide';
        this.vel.y = Math.max(this.vel.y, -15);
        if (!this.isBot) this.game.audio.play('glider', this.pos);
      }
      if (this.pos.y < SWIM_DEPTH) {
        this.pos.y = SWIM_DEPTH;
        this.mode = 'swim';
        this.vel.y = 0;
      } else if (res.onGround) {
        this.mode = 'ground';
        this.vel.y = 0;
        this.onGround = true;
        this.landKick = 0.8;
        if (!this.isBot) this.game.audio.play('land', this.pos);
      }
      this.clampBoundary();
      return;
    }
    // Ground / swim
    const swimming = this.mode === 'swim';
    if (I.crouch !== this.crouching && !swimming) {
      if (!I.crouch) {
        const ceil = W.ceilingAt(this.pos.x, this.pos.z, this.pos.y + PLAYER.crouchHeight - 0.05, 0.3);
        if (ceil > this.pos.y + PLAYER.height) this.crouching = false;
      } else this.crouching = true;
    }
    if (swimming) this.crouching = false;
    this.body.height = this.crouching ? PLAYER.crouchHeight : PLAYER.height;
    const firing = I.fire && this.held && this.held.kind === 'weapon';
    const wantSprint = I.sprint && I.mz > 0.3 && !this.crouching && !this.aiming && !swimming && !this.buildMode && !firing;
    this.sprinting = wantSprint;
    if (this.sprinting && this.heal) this.cancelHeal();
    let speed = this.crouching ? PLAYER.crouch : this.sprinting ? PLAYER.sprint : PLAYER.walk;
    if (this.aiming) speed *= PLAYER.adsSpeedMul;
    if (swimming) speed = PLAYER.swim;
    else if (this.pos.y < -0.3) speed *= 0.75;
    if (this.heal) speed = Math.min(speed, PLAYER.walk * 0.7);
    const tx = mv.x * speed, tz = mv.z * speed;
    const k = 1 - Math.exp(-dt * (this.onGround || swimming ? 12 : 2.5));
    this.vel.x += (tx - this.vel.x) * k;
    this.vel.z += (tz - this.vel.z) * k;
    let jumped = false;
    if (I.jump && (this.onGround || swimming)) {
      this.vel.y = Math.sqrt(2 * PLAYER.gravity * (swimming ? 0.9 : PLAYER.jumpHeight));
      this.onGround = false;
      jumped = true;
      this.emote = false;
    }
    if (!swimming || jumped) this.vel.y -= PLAYER.gravity * dt;
    this.vel.y = Math.max(this.vel.y, -60);
    const impactVy = this.vel.y;
    const res = W.moveBody(this.body, this.vel.x * dt, this.vel.y * dt, this.vel.z * dt, this.onGround && !jumped && this.vel.y <= 0);
    if (res.onGround) {
      if (!this.onGround && impactVy < -PLAYER.fallDamageSpeed) {
        const dmg = Math.round((-impactVy - PLAYER.fallDamageSpeed) * 7);
        this.takeDamage(dmg, null, { ignoreShield: true, cause: 'fell' });
      }
      if (!this.onGround && impactVy < -8) {
        this.landKick = Math.min(1, -impactVy / 16);
        if (!this.isBot) this.game.audio.snd('land', { vol: 0.7 });
        else if (this.game.isNearPlayer(this.pos, 25)) this.game.audio.snd('land', { x: this.pos.x, y: this.pos.y, z: this.pos.z, vol: 0.4, ref: 6 });
      }
      this.vel.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    if (res.hitCeiling && this.vel.y > 0) this.vel.y = 0;
    if (this.pos.y <= SWIM_DEPTH) {
      this.pos.y = SWIM_DEPTH;
      if (this.vel.y < 0) this.vel.y = 0;
      this.mode = 'swim';
      this.onGround = false;
    } else if (this.mode === 'swim' && (this.onGround || this.pos.y > SWIM_DEPTH + 0.3)) {
      this.mode = 'ground';
    }
    // footsteps
    const hs = Math.hypot(this.vel.x, this.vel.z);
    if ((this.onGround || this.mode === 'swim') && hs > 1.2) {
      this.stepPh += hs * dt;
      const L = this.mode === 'swim' ? 2.2 : this.sprinting ? 1.9 : 1.45;
      if (this.stepPh > L) {
        this.stepPh = 0;
        this.game.audio.footstep(this);
      }
    }
    this.clampBoundary();
  }

  clampBoundary() {
    const r = Math.hypot(this.pos.x, this.pos.z);
    if (r > MAP.boundaryRadius) {
      this.pos.x *= MAP.boundaryRadius / r;
      this.pos.z *= MAP.boundaryRadius / r;
    }
  }

  updateActions(dt) {
    const I = this.intent;
    if (I.emote) this.emote = !this.emote;
    if (this.emote && (Math.abs(I.mx) + Math.abs(I.mz) > 0.1 || I.fire)) this.emote = false;
    if (I.interact) this.game.interact(this);
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) this.finishReload();
    }
    if (this.reloadPending !== undefined) {
      this.reloadPending -= dt;
      if (this.reloadPending <= 0) {
        this.reloadPending = undefined;
        this.startReload();
      }
    }
    if (this.heal) {
      this.heal.t += dt;
      if (this.heal.t >= this.heal.total) {
        this.finishHeal();
        const next = this.held;
        if (I.fire && next && next.kind === 'heal') this.startHeal();
      }
    }
    if (this.buildMode) {
      this.aiming = false;
      this.adsT = 0;
      if (I.fire && this.buildCd <= 0) {
        if (this.game.build.tryPlace(this)) this.buildCd = 0.12;
        else if (I.firePressed && !this.isBot) this.game.audio.play('deny', this.pos);
      }
      if (I.edit) this.game.build.editTarget(this);
      return;
    }
    const item = this.held;
    this.aiming = !!(I.aim && item && item.kind === 'weapon' && !this.sprinting);
    {
      const d = item && item.kind === 'weapon' ? WEAPONS[item.type] : null;
      const want = d && this.aiming && this.reloadT <= 0 && this.switchT <= 0 ? 1 : 0;
      this.adsT = damp(this.adsT, want, (1 / Math.max(0.05, d ? d.adsTime || 0.2 : 0.2)) * 2.2, dt);
      if (this.adsT < 0.002) this.adsT = 0;
    }
    if (I.reload) this.startReload();
    if (this.sel === -1) {
      if (I.fire && this.swingCd <= 0) {
        this.swingCd = 1 / GATHER.swingRate;
        this.model.swing = 1;
        this.game.combat.melee(this);
      }
    } else if (item && item.kind === 'weapon') {
      if (I.fire) this.tryFire(item);
    } else if (item && item.kind === 'heal') {
      if (I.firePressed || (I.fire && !this.heal && this.isBot)) this.startHeal();
    }
  }

  updateModel(dt) {
    const m = this.model;
    m.root.position.copy(this.pos);
    if (this.isBot) m.lod(this.pos.distanceTo(this.game.camera.position));
    if (this.mode === 'vehicle' && this.vehicle) {
      m.root.rotation.set(0, this.vehicle.yaw, 0);
    } else {
      m.root.rotation.set(0, this.yaw, 0);
    }
    let holding = null;
    if (this.mode === 'ground') {
      if (this.buildMode) {
        holding = 'build';
        m.setHeld('build');
      } else if (this.sel === -1) {
        holding = 'pickaxe';
        m.setHeld('pickaxe');
      } else {
        const it = this.held;
        if (it && it.kind === 'weapon') {
          holding = 'gun';
          m.setHeld(it);
        } else if (it && it.kind === 'heal') {
          holding = 'heal';
          m.setHeld(it);
        } else m.setHeld(null);
      }
    } else m.setHeld(null);
    m.animate({
      dt, mode: this.mode, speed: Math.hypot(this.vel.x, this.vel.z), crouch: this.crouching,
      pitch: this.pitch, holding, aiming: this.aiming, emote: this.emote, sprinting: this.sprinting, onGround: this.onGround,
      reload: this.reloadT > 0 && this.reloadTotal > 0 ? 1 - this.reloadT / this.reloadTotal : -1, switching: this.switchT / SWITCH_TIME,
    });
  }

  // Reset for a new match.
  resetForMatch() {
    this.health = PLAYER.maxHealth;
    this.shield = 0;
    this.mats = { wood: 0, stone: 0, metal: 0 };
    for (const k of Object.keys(this.ammo)) this.ammo[k] = 0;
    this.slots = [null, null, null, null, null];
    this.sel = -1;
    this.buildMode = false;
    this.alive = true;
    this.kills = 0;
    this.placement = 0;
    this.mode = 'bus';
    this.vel.set(0, 0, 0);
    this.heal = null;
    this.reloadT = 0;
    this.adsT = 0;
    this.switchT = 0;
    this.lastShotT = -9;
    this.vehicle = null;
    this.emote = false;
    this.damageTaken = 0;
    this.model.root.visible = false;
  }
}

export { SWIM_DEPTH };
