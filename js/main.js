import * as THREE from 'three';
import { BOT_NAMES } from './config.js';
import { makeRng, shuffle, storageGet, storageSet } from './util.js';
import { Terrain } from './world/terrain.js';
import { Structures, buildAnimatedProps, makeGlowTexture } from './world/structures.js';
import { Props } from './world/props.js';
import { Environment } from './world/environment.js';
import { CollisionWorld } from './physics.js';
import { Actor } from './actor.js';
import { BotBrain } from './bots.js';
import { OUTFITS, outfitById } from './character.js';
import { BuildSystem } from './building.js';
import { LootSystem } from './loot.js';
import { Storm } from './storm.js';
import { Combat } from './combat.js';
import { Effects } from './effects.js';
import { Bus } from './bus.js';
import { VehicleSystem } from './vehicles.js';
import { Input } from './input.js';
import { PlayerController } from './controller.js';
import { HUD } from './hud.js';
import { Menus } from './menus.js';
import { LobbyStage } from './lobby.js';
import { AudioSystem } from './audio.js';

const SETTINGS_KEY = 'stormdrop-settings-v1';
const DEFAULTS = {
  mouseSens: 1, padSens: 1, invertY: false, fov: 80, volume: 0.7, quality: 'medium', players: 25,
  difficulty: 1, stormSpeed: 1, showFps: false, name: 'You', outfit: 'rookie', shoulder: 1,
};
const tick = () => new Promise((r) => setTimeout(r, 16));

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.settings = { ...DEFAULTS, ...storageGet(SETTINGS_KEY, {}) };
    if (!OUTFITS.some((o) => o.id === this.settings.outfit)) this.settings.outfit = DEFAULTS.outfit;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: this.settings.quality !== 'low', powerPreference: 'high-performance' });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(80, innerWidth / innerHeight, 0.1, 2600);
    this.camera.rotation.order = 'YXZ';
    this.input = new Input(this.canvas);
    this.audio = new AudioSystem(this);
    this.audio.setVolume(this.settings.volume);
    this.lobby = new LobbyStage(this);
    this.menus = new Menus(this);
    this.state = 'title';
    this.phase = 'none';
    this.time = 0;
    this.dt = 0.016;
    this.actors = [];
    this.player = null;
    this.worldReady = false;
    this.rng = makeRng(Date.now() & 0xffffff);
    this.weakSpot = { target: null, pos: new THREE.Vector3(), sprite: null };
    this.applySettings(false);
    addEventListener('resize', () => this.resize());
    this.resize();
    this.input.onLockChange = (locked) => {
      if (!locked && this.state === 'playing' && !this.menus.invOpen && this.input.lastDevice !== 'pad') this.pause();
    };
    document.addEventListener('pointerlockerror', () => {
      if (this.state === 'playing' && this.input.lastDevice !== 'pad') this.pause('CLICK RESUME TO PLAY');
    });
    addEventListener('beforeunload', (e) => {
      if (this.state === 'playing' || this.state === 'paused') {
        e.preventDefault();
        e.returnValue = '';
      }
    });
    // Any key or click on the title screen continues.
    const startFromTitle = () => {
      if (this.state === 'title' && this.menus.current === 'title') document.getElementById('btn-start').click();
    };
    addEventListener('keydown', (e) => {
      if (e.code !== 'Tab') startFromTitle();
    });
    this.canvas.addEventListener('click', () => {
      if (this.state === 'playing' && !this.input.locked && !this.menus.invOpen) this.input.requestLock();
    });
    this.menus.show('title');
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
    window.game = this;
  }

  // ---------- settings ----------

  saveSettings() {
    storageSet(SETTINGS_KEY, this.settings);
  }

  applySettings(save = true) {
    const S = this.settings;
    S.players = Math.max(20, Math.min(30, Math.round(S.players)));
    this.audio.setVolume(S.volume);
    const dpr = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(Math.min(dpr, S.quality === 'high' ? 2 : S.quality === 'medium' ? 1.25 : 0.85));
    if (this.env) this.env.setQuality(S.quality);
    if (this.menus) this.menus.refreshLobby();
    if (save) this.saveSettings();
  }

  resize() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  // ---------- world ----------

  async loadWorld() {
    const step = async (f, label) => {
      this.menus.setLoading(f, label);
      await tick();
    };
    await step(0.05, 'Raising the island...');
    this.terrain = new Terrain();
    this.terrain.generate();
    await step(0.3, 'Building the towns...');
    this.collision = new CollisionWorld(this.terrain);
    this.structures = new Structures(this.terrain, this.collision);
    this.structures.generate();
    await step(0.48, 'Planting trees...');
    this.props = new Props(this.terrain, this.collision, this.structures);
    this.props.generate();
    await step(0.6, 'Painting the map...');
    this.scene.add(this.terrain.buildMesh());
    this.scene.add(this.terrain.buildRoadMesh());
    this.scene.add(this.structures.group);
    this.scene.add(this.props.group);
    buildAnimatedProps(this.structures, this.scene);
    this.mapCanvas = this.terrain.buildMapCanvas(1024, this.structures.footprints);
    await step(0.7, 'Fueling the Sky Coach...');
    this.env = new Environment(this.scene, this.settings.quality);
    this.fx = new Effects(this);
    this.combat = new Combat(this);
    this.build = new BuildSystem(this);
    this.loot = new LootSystem(this);
    this.storm = new Storm(this);
    this.bus = new Bus(this);
    this.vehicles = new VehicleSystem(this);
    this.vehicles.spawnAll(this.structures.pickVehicleSpots(12));
    this.hud = new HUD(this);
    this.hud.setMapImage(this.mapCanvas);
    this.controller = new PlayerController(this);
    const ws = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0x4fd8ff, blending: THREE.AdditiveBlending, depthTest: false, transparent: true }));
    ws.scale.setScalar(0.55);
    ws.visible = false;
    ws.renderOrder = 10;
    this.scene.add(ws);
    this.weakSpot.sprite = ws;
    // Compile shaders once so the first frames of the match don't hitch.
    this.renderer.compile(this.scene, this.camera);
    this.worldReady = true;
  }

  // ---------- match flow ----------

  async startMatch() {
    if (this.starting) return;
    this.starting = true;
    this.audio.unlock();
    this.audio.stopEngine();
    this.lobby.active = false;
    this.state = 'loading';
    if (this.hud) this.hud.show(false);
    this.menus.toggleInventory(false);
    this.menus.startLoading();
    await tick();
    if (!this.worldReady) await this.loadWorld();
    this.menus.setLoading(0.85, 'Hiding loot...');
    await tick();
    this.resetMatch();
    this.menus.setLoading(1, 'Boarding the Sky Coach...');
    await tick();
    this.menus.hideAll();
    this.hud.show(true);
    this.state = 'playing';
    this.input.capture = true;
    this.input.requestLock();
    this.starting = false;
  }

  resetMatch() {
    const S = this.settings;
    this.rng = makeRng((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    this.build.reset();
    this.loot.reset();
    this.props.reset();
    this.vehicles.reset();
    this.fx.reset();
    this.combat.reset();
    this.storm.reset(S.stormSpeed);
    this.loot.spawnAll(this.structures, this.rng);
    for (const a of this.actors) this.scene.remove(a.model.root);
    this.actors = [];
    this.player = new Actor(this, { name: S.name || 'You', isBot: false, outfit: outfitById(S.outfit) });
    this.actors.push(this.player);
    const names = shuffle(BOT_NAMES.slice(), this.rng);
    for (let i = 0; i < S.players - 1; i++) {
      const bot = new Actor(this, { name: names[i % names.length], isBot: true, outfit: this.rng.pick(OUTFITS) });
      this.actors.push(bot);
    }
    this.time = 0;
    this.matchTime = 0;
    this.playerDamage = 0;
    this.phase = 'bus';
    this.ended = false;
    this.endAt = null;
    this.deathInfo = null;
    this.weakSpot.target = null;
    this.bus.start(this.rng);
    for (const a of this.actors) {
      a.mode = 'bus';
      a.pos.copy(this.bus.pos);
      if (a.isBot) new BotBrain(this, a, this.rng, S.difficulty);
    }
    this.controller.reset();
    this.controller.shoulder = S.shoulder || 1;
    this.controller.busYaw = this.bus.model.rotation.y + Math.PI * 0.6;
    this.controller.busPitch = -0.3;
    this.hud.toggleMap(false);
    this.hud.banner('Drop when you are ready!', '#ffd23f');
  }

  aliveCount() {
    let n = 0;
    for (const a of this.actors) if (a.alive) n++;
    return n;
  }

  isNearPlayer(p, r) {
    return this.player && this.player.pos.distanceTo(p) < r;
  }

  jumpFromBus(a) {
    if (a.mode !== 'bus') return;
    a.mode = 'freefall';
    a.freefallT = 0;
    a.pos.copy(this.bus.pos).add(new THREE.Vector3((Math.random() - 0.5) * 3, -4, (Math.random() - 0.5) * 3));
    a.vel.copy(this.bus.dir).multiplyScalar(12);
    a.model.root.visible = true;
    if (!a.isBot) {
      a.yaw = this.controller.busYaw;
      a.pitch = -0.6;
      this.audio.play('busJump');
    }
  }

  noise(pos, radius, source) {
    for (const a of this.actors) {
      if (!a.isBot || !a.alive || a === source || !a.brain) continue;
      if (a.pos.distanceTo(pos) < radius) a.brain.hear(pos);
    }
  }

  findInteractable(a) {
    if (a === this.player && this._interactFrame === this.frame) return this._interact;
    let best = this.loot.nearestInteractable(a);
    const v = this.vehicles.nearest(a);
    if (v) {
      const d = Math.hypot(v.pos.x - a.pos.x, v.pos.z - a.pos.z);
      if (!best || d < best.dist) best = { kind: 'vehicle', ref: v, label: 'Drive truck', dist: d };
    }
    if (a === this.player) {
      this._interactFrame = this.frame;
      this._interact = best;
    }
    return best;
  }

  interact(a) {
    const near = this.findInteractable(a);
    if (!near) return;
    if (near.kind === 'chest') this.loot.openChest(near.ref, a);
    else if (near.kind === 'drop') this.loot.openDrop(near.ref, a);
    else if (near.kind === 'item') this.loot.pickup(a, near.ref);
    else if (near.kind === 'vehicle') near.ref.enter(a);
    if (a === this.player) this._interactFrame = -1;
  }

  eliminate(victim, killer, cause) {
    if (!victim.alive) return;
    victim.placement = this.aliveCount();
    victim.alive = false;
    if (victim.vehicle) victim.vehicle.exit();
    victim.mode = 'dead';
    victim.model.root.visible = false;
    victim.cancelHeal();
    this.fx.elimination(victim.pos, victim.outfit.accent);
    this.loot.dropAll(victim);
    let text;
    if (killer && killer !== victim) {
      killer.kills++;
      text = `<b>${killer.name}</b> eliminated <b>${victim.name}</b> <small>${cause}</small>`;
    } else if (cause === 'storm') text = `<b>${victim.name}</b> was lost in the storm`;
    else if (cause === 'fell') text = `<b>${victim.name}</b> fell to their elimination`;
    else text = `<b>${victim.name}</b> was eliminated`;
    this.hud.feed(text);
    if (killer === this.player && victim !== this.player) {
      this.hud.elimination(`ELIMINATED <b>${victim.name}</b>`);
      this.audio.play('elim');
    }
    if (victim === this.player) {
      this.deathInfo = { by: killer && killer !== victim ? killer.name : null, cause: killer && killer !== victim ? cause : cause === 'storm' ? 'Lost in the storm' : cause === 'fell' ? 'Fall damage' : '' };
      this.hud.banner('You were eliminated', '#ff5a5a');
      this.endAt = this.time + 2.8;
      this.audio.stopEngine();
    } else if (this.player.alive && this.aliveCount() === 1) {
      this.hud.banner('#1 VICTORY!', '#ffd23f');
      this.endAt = this.time + 3.5;
    }
  }

  endMatch() {
    if (this.ended) return;
    this.ended = true;
    const p = this.player;
    const victory = p.alive;
    this.state = 'end';
    this.input.capture = false;
    this.input.exitLock();
    this.hud.show(false);
    this.audio.stopEngine();
    this.menus.toggleInventory(false);
    const damage = this.playerDamage;
    this.menus.showEnd({
      victory, placement: victory ? 1 : p.placement, kills: p.kills, time: this.matchTime, total: this.actors.length,
      by: this.deathInfo?.by, cause: this.deathInfo?.cause, damage,
    });
  }

  pause(title = 'PAUSED') {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.input.exitLock();
    this.menus.toggleInventory(false);
    this.menus.show('pause');
    document.getElementById('pause-title').textContent = title;
  }

  resume() {
    if (this.state !== 'paused') return;
    this.menus.hideAll();
    this.state = 'playing';
    this.input.requestLock();
  }

  leaveMatch() {
    this.toLobby();
  }

  toLobby() {
    this.state = 'lobby';
    this.input.capture = false;
    this.input.exitLock();
    this.audio.stopEngine();
    if (this.hud) this.hud.show(false);
    this.menus.toggleInventory(false);
    this.menus.show('lobby');
  }

  // ---------- loop ----------

  loop(t) {
    requestAnimationFrame((tt) => this.loop(tt));
    const dt = Math.min(0.05, Math.max(0.001, (t - this.last) / 1000));
    this.last = t;
    this.frame = (this.frame || 0) + 1;
    this.input.poll();
    if (this.state === 'playing') {
      if (this.menus.invOpen) this.menus.updatePad();
      this.updateMatch(dt);
      this.renderer.render(this.scene, this.camera);
    } else {
      this.menus.updatePad();
      if (this.lobby.active) {
        this.lobby.update(dt);
        this.renderer.render(this.lobby.scene, this.lobby.camera);
      } else if ((this.state === 'paused' || this.state === 'end') && this.worldReady) {
        this.renderer.render(this.scene, this.camera);
      }
    }
    this.input.endFrame();
  }

  updateMatch(dt) {
    this.dt = dt;
    this.time += dt;
    this.matchTime += dt;
    const p = this.player;
    if (p.alive && !this.menus.invOpen) this.controller.update(dt);
    else {
      p.intent = p.blankIntent();
      if (this.menus.invOpen) {
        const I = this.input;
        if (I.keyPressed('KeyI') || I.keyPressed('Escape')) this.menus.toggleInventory(false);
      }
    }
    if (this.state !== 'playing') return; // paused from the controller
    if (this.bus.active) this.bus.update(dt);
    else if (this.phase === 'bus') this.phase = 'playing';
    for (const a of this.actors) if (a.brain) a.brain.update(dt);
    this.controller.updateAim();
    this.vehicles.update(dt);
    for (const a of this.actors) a.update(dt);
    this.storm.update(dt);
    this.storm.tick(this.actors, dt);
    this.combat.update(dt);
    this.build.update(dt);
    this.loot.update(dt);
    this.props.update(dt);
    this.structures.update(dt, this.time);
    this.controller.updateCamera(dt);
    this.fx.update(dt);
    this.build.updateGhost(p.alive ? p : null);
    this.updateWeakSpot();
    this.env.update(dt, this.camera, p.alive ? p.pos : this.camera.position);
    this.hud.update(dt);
    if (this.endAt !== null && this.time >= this.endAt) this.endMatch();
  }

  updateWeakSpot() {
    const ws = this.weakSpot, p = this.player;
    let show = false;
    if (ws.target && ws.target.alive && p.alive && p.sel === -1 && !p.buildMode && p.pos.distanceTo(ws.pos) < 6) {
      const o = p.aimOrigin, d = p.aimDir;
      const hit = this.collision.raycast(o.x, o.y, o.z, d.x, d.y, d.z, 6);
      show = !!hit && hit.collider && hit.collider.owner === ws.target;
    }
    ws.sprite.visible = show;
    if (show) {
      ws.sprite.position.copy(ws.pos);
      ws.sprite.scale.setScalar(0.45 + Math.sin(this.time * 8) * 0.08);
    }
  }
}

new Game();
