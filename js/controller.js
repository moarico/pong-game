import * as THREE from 'three';
import { CAMERA, WEAPONS } from './config.js';
import { PAD } from './input.js';
import { clamp, lerp } from './util.js';
import { PIECES } from './building.js';

const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Vector3(), _q = new THREE.Vector3();
const PIECE_KEYS = { KeyQ: 'wall', KeyF: 'floor', KeyC: 'ramp', KeyV: 'roof' };
const DEG = Math.PI / 180;
const damp = (a, b, rate, dt) => b + (a - b) * Math.exp(-rate * dt);
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const rand = (a, b) => a + (b - a) * Math.random();

// Turns keyboard/mouse/gamepad input into the human actor's intent and drives the camera.
export class PlayerController {
  constructor(game) {
    this.game = game;
    this.shoulder = 1;
    this.camDist = CAMERA.back;
    this.fov = CAMERA.fov;
    this.scoped = false;
    this.padSprint = false;
    this.crouchToggle = false;
    this.busYaw = 0;
    this.busPitch = -0.25;
    this.shake = 0;
    // first-person feel (Zero Hour): view punch and kick springs, eye height, strafe roll
    this.firstPerson = game.settings.view !== 'third';
    this.punchP = 0;
    this.punchV = 0;
    this.punchY = 0;
    this.punchVY = 0;
    this.camY = null;
    this.roll = 0;
    this.lookDX = 0;
    this.lookDY = 0;
    this.fpActive = false;
  }

  // Is the camera in the player's head right now? (airborne, bus, vehicle and emotes use the chase camera)
  get inHead() {
    const a = this.game.player;
    return this.firstPerson && a && a.alive && (a.mode === 'ground' || a.mode === 'swim') && !a.emote;
  }

  // Recoil: the muzzle climbs and the view kicks, then springs settle it.
  onFire(def) {
    const a = this.game.player;
    const rec = def.rec || [1, 0.3];
    const r = rec[0] * DEG, k = 1 - 0.35 * a.adsT;
    a.pitch += r * 0.5 * k;
    a.yaw += rand(-1, 1) * rec[1] * DEG * 0.6 * k;
    this.punchV += r * 9 * k;
    this.punchVY += rand(-1, 1) * rec[1] * DEG * 5;
    const big = def.kind === 'projectile' || def.pellets;
    this.shake += def.splash ? 0.5 : big ? 0.18 : 0.03;
  }

  reset() {
    this.crouchToggle = false;
    this.padSprint = false;
    this.scoped = false;
    this.camDist = CAMERA.back;
    this.punchP = this.punchV = this.punchY = this.punchVY = 0;
    this.camY = null;
  }

  setFirstPerson(on) {
    this.firstPerson = on;
    this.game.settings.view = on ? 'first' : 'third';
    this.game.saveSettings();
    this.game.hud.toast(on ? 'First-person view' : 'Third-person view');
  }

  update(dt) {
    const g = this.game, inp = g.input, a = g.player, S = g.settings;
    const I = a.intent;
    const pad = !!inp.pad;
    // ----- look -----
    const zoom = this.fov / CAMERA.fov;
    const ms = 0.0022 * S.mouseSens * zoom;
    let dyaw = -inp.dx * ms;
    let dpitch = -inp.dy * ms * (S.invertY ? -1 : 1);
    if (pad) {
      const rx = inp.axes[2], ry = inp.axes[3];
      const ps = 3.0 * S.padSens * zoom * dt;
      dyaw -= Math.sign(rx) * rx * rx * ps;
      dpitch -= Math.sign(ry) * ry * ry * ps * 0.75 * (S.invertY ? -1 : 1);
    }
    this.lookDX = -dyaw;
    this.lookDY = -dpitch;
    if (a.mode === 'bus') {
      this.busYaw += dyaw;
      this.busPitch = clamp(this.busPitch + dpitch, -1.2, 0.4);
    } else {
      a.yaw += dyaw;
      a.pitch = clamp(a.pitch + dpitch, -1.45, 1.45);
    }
    // ----- buttons -----
    const kp = (c) => inp.keyPressed(c);
    const pp = (b) => inp.padPressed(b);
    const build = a.buildMode;
    // Menus / overlays
    if (kp('Tab') || kp('KeyM') || pp(PAD.SELECT)) g.hud.toggleMap();
    if (kp('KeyI') || pp(PAD.UP)) g.menus.toggleInventory();
    if (pp(PAD.START)) {
      g.pause();
      return;
    }
    if (kp('KeyZ')) this.setFirstPerson(!this.firstPerson);
    if (kp('KeyX') || (pp(PAD.RS) && !this.firstPerson)) {
      this.shoulder *= -1;
      S.shoulder = this.shoulder;
    }
    // Movement
    let mx = (inp.key('KeyD') ? 1 : 0) - (inp.key('KeyA') ? 1 : 0);
    let mz = (inp.key('KeyW') ? 1 : 0) - (inp.key('KeyS') ? 1 : 0);
    if (pad) {
      mx += inp.axes[0];
      mz -= inp.axes[1];
    }
    I.mx = clamp(mx, -1, 1);
    I.mz = clamp(mz, -1, 1);
    if (pp(PAD.LS)) this.padSprint = !this.padSprint;
    if (Math.hypot(I.mx, I.mz) < 0.2) this.padSprint = false;
    I.sprint = inp.key('ShiftLeft') || inp.key('ShiftRight') || this.padSprint;
    I.jump = kp('Space') || (!build && pp(PAD.A));
    if (kp('ControlLeft') || kp('ControlRight') || (!build && pp(PAD.B))) this.crouchToggle = !this.crouchToggle;
    if (I.sprint && I.mz > 0.3) this.crouchToggle = false;
    I.crouch = this.crouchToggle;
    // Fire / aim
    const rt = inp.trigger(PAD.RT) > 0.4, lt = inp.trigger(PAD.LT) > 0.4;
    I.fire = inp.mouseButtons[0] || rt;
    I.firePressed = inp.mousePressed[0] || pp(PAD.RT);
    I.aim = !build && (inp.mouseButtons[2] || lt);
    I.edit = build && (kp('KeyG') || inp.mousePressed[2] || pp(PAD.LT));
    if (!build && kp('KeyG')) I.edit = false;
    I.emote = kp('KeyB') || pp(PAD.LEFT);
    // Interact / reload (gamepad X does both, preferring interaction)
    const near = g.findInteractable(a);
    I.interact = kp('KeyE') || (!build && pp(PAD.X) && !!near);
    I.reload = kp('KeyR') || (!build && pp(PAD.X) && !near);
    // Slots
    for (let i = 0; i < 5; i++) if (kp('Digit' + (i + 1))) a.selectSlot(i);
    if (kp('KeyH') || pp(PAD.DOWN)) a.selectSlot(-1);
    if (inp.wheel) a.cycleSlot(inp.wheel > 0 ? 1 : -1);
    if (pp(PAD.RB)) a.cycleSlot(1);
    if (pp(PAD.LB)) a.cycleSlot(-1);
    // Building
    for (const [code, piece] of Object.entries(PIECE_KEYS)) {
      if (kp(code)) a.setBuildMode(true, piece);
    }
    if (kp('KeyT') || (build && pp(PAD.RIGHT))) a.cycleMaterial();
    if (build) {
      if (pp(PAD.X)) a.buildPiece = 'wall';
      if (pp(PAD.B)) a.buildPiece = 'floor';
      if (pp(PAD.Y)) a.buildPiece = 'ramp';
      if (pp(PAD.A)) a.buildPiece = 'roof';
    } else if (pp(PAD.Y)) {
      a.setBuildMode(true, a.buildPiece || PIECES[0]);
    }
    // Bus / vehicle specific
    if (a.mode === 'bus' && (kp('Space') || pp(PAD.A)) && g.bus.doorsOpen) g.jumpFromBus(a);
    if (a.mode === 'vehicle') {
      I.jump = inp.key('Space') || inp.padDown(PAD.A);
      if (kp('KeyE') || pp(PAD.X)) a.vehicle.exit();
      I.interact = false;
    }
    if (kp('Escape')) g.pause();
  }

  // Aim ray from the camera through the crosshair, starting next to the player's head.
  updateAim() {
    const a = this.game.player, cam = this.game.camera;
    cam.getWorldDirection(_f);
    a.eye(_e);
    if (this.fpActive) {
      // shots follow where you aim, not the punch and shake of the view
      a.aimOrigin.copy(_e);
      a.aimDir.set(-Math.sin(a.yaw) * Math.cos(a.pitch), Math.sin(a.pitch), -Math.cos(a.yaw) * Math.cos(a.pitch));
      return;
    }
    if (this.scoped) {
      a.aimOrigin.copy(_e);
    } else {
      const t0 = Math.max(0, _q.subVectors(_e, cam.position).dot(_f));
      a.aimOrigin.copy(cam.position).addScaledVector(_f, t0);
    }
    a.aimDir.copy(_f);
  }

  updateCamera(dt) {
    const g = this.game, a = g.player, cam = g.camera, S = g.settings;
    const W = g.collision;
    let targetFov = S.fov;
    this.scoped = false;
    a.model.root.visible = a.alive && a.mode !== 'bus';
    // view springs
    this.punchV += (-this.punchP * 190 - this.punchV * 24) * dt;
    this.punchP += this.punchV * dt;
    this.punchVY += (-this.punchY * 190 - this.punchVY * 24) * dt;
    this.punchY += this.punchVY * dt;
    this.fpActive = this.inHead;
    if (this.fpActive) {
      this.updateFirstPerson(dt);
      return;
    }
    this.camY = null;
    if (a.mode === 'bus') {
      const c = g.bus.pos;
      const yaw = this.busYaw, pitch = this.busPitch;
      _f.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
      cam.position.set(c.x, c.y + 8, c.z).addScaledVector(_f, -34);
      cam.lookAt(c.x, c.y + 8, c.z);
    } else if (a.mode === 'vehicle' && a.vehicle) {
      const v = a.vehicle;
      _f.set(-Math.sin(a.yaw) * Math.cos(a.pitch), Math.sin(a.pitch), -Math.cos(a.yaw) * Math.cos(a.pitch));
      _p.set(v.pos.x, v.pos.y + 2.2, v.pos.z);
      const want = 8.5;
      const hit = W.raycast(_p.x, _p.y, _p.z, -_f.x, -_f.y + 0.15, -_f.z, want, (c) => c.owner === v);
      const d = hit ? Math.max(1.5, hit.t - 0.3) : want;
      cam.position.copy(_p).addScaledVector(_f, -d).add(new THREE.Vector3(0, 0.15 * d, 0));
      cam.lookAt(_p.x + _f.x * 10, _p.y + _f.y * 10 + 0.5, _p.z + _f.z * 10);
    } else {
      const yaw = a.yaw, pitch = a.pitch;
      _f.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
      _r.set(Math.cos(yaw), 0, -Math.sin(yaw));
      const held = a.held;
      const def = held && held.kind === 'weapon' ? WEAPONS[held.type] : null;
      const airborne = a.mode === 'freefall' || a.mode === 'glide';
      if (def && def.scope && a.aiming && a.alive) {
        this.scoped = true;
        targetFov = CAMERA.scopeFov;
        a.eye(cam.position);
        a.model.root.visible = false;
      } else {
        if (a.aiming) targetFov = Math.min(S.fov, CAMERA.adsFov);
        const back = airborne ? 6.5 : CAMERA.back;
        const right = airborne ? 0 : CAMERA.right * this.shoulder;
        const up = airborne ? 1.4 : CAMERA.up;
        a.eye(_p);
        if (airborne) _p.y -= 0.6;
        // desired camera position
        const dx = _r.x * right - _f.x * back, dy = up - _f.y * back, dz = _r.z * right - _f.z * back;
        const len = Math.hypot(dx, dy, dz);
        const hit = W.raycast(_p.x, _p.y, _p.z, dx / len, dy / len, dz / len, len + 0.3);
        let want = hit ? Math.max(0.3, hit.t - 0.3) : len;
        // Smooth outward motion, snap inward to avoid clipping.
        this.camDist = want < this.camDist ? want : lerp(this.camDist, want, 1 - Math.exp(-dt * 6));
        const k = this.camDist / len;
        cam.position.set(_p.x + dx * k, _p.y + dy * k, _p.z + dz * k);
        // Keep the camera above water/terrain.
        const gy = g.terrain.heightAt(cam.position.x, cam.position.z);
        if (cam.position.y < gy + 0.3) cam.position.y = gy + 0.3;
        if (this.camDist < 0.9) a.model.root.visible = false;
      }
      cam.rotation.set(pitch + this.punchP, yaw + this.punchY, 0, 'YXZ');
    }
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 2);
      cam.position.x += (Math.random() - 0.5) * this.shake * 0.3;
      cam.position.y += (Math.random() - 0.5) * this.shake * 0.3;
    }
    this.fov = lerp(this.fov, targetFov, 1 - Math.exp(-dt * (this.scoped ? 30 : 14)));
    if (Math.abs(cam.fov - this.fov) > 0.01) {
      cam.fov = this.fov;
      cam.updateProjectionMatrix();
    }
  }

  // Zero Hour's first-person camera: eye height eases over steps and crouches, the head bobs with the
  // stride, landings dip the view, strafing rolls it a hair, and aiming zooms by a fixed factor.
  updateFirstPerson(dt) {
    const g = this.game, a = g.player, cam = g.camera, S = g.settings;
    a.model.root.visible = false;
    const held = a.held;
    const def = held && held.kind === 'weapon' ? WEAPONS[held.type] : null;
    const ty = a.pos.y + a.eyeHeight;
    if (this.camY === null) this.camY = ty;
    const d = ty - this.camY;
    if (Math.abs(d) > 1.2 || !a.onGround || d < 0) this.camY = d < 0 && a.onGround && d > -0.7 ? damp(this.camY, ty, 30, dt) : ty;
    else this.camY = damp(this.camY, ty, 15, dt);
    const hs = Math.hypot(a.vel.x, a.vel.z), mv = a.onGround ? Math.min(1, hs / 5) : 0, ads = a.adsT;
    const bt = a.model.stride * 2.2, by = Math.abs(Math.sin(bt)) * 0.045 * mv * (1 - ads * 0.85), bx = Math.cos(bt) * 0.025 * mv * (1 - ads * 0.85);
    this.shake = Math.max(0, this.shake - dt * 2.2);
    const sh = this.shake * this.shake * 0.06, lk = a.landKick || 0;
    const cy = Math.cos(a.yaw), sy = Math.sin(a.yaw);
    cam.position.set(a.pos.x + cy * bx, this.camY + by - lk * 0.12, a.pos.z - sy * bx);
    const strafe = (a.vel.x * cy - a.vel.z * sy) / 6;
    this.roll = damp(this.roll, -clamp(strafe, -1, 1) * 0.012 * (1 - ads * 0.6), 7, dt);
    cam.rotation.set(a.pitch + this.punchP + rand(-sh, sh), a.yaw + this.punchY + rand(-sh, sh), Math.cos(bt) * 0.004 * mv + this.roll, 'YXZ');
    // zoom: one fixed factor for sights, a stronger one for scopes
    const zoom = def ? (def.scope ? CAMERA.scopeZoom : CAMERA.adsZoom) : 1;
    const af = lerp(1, zoom, smooth(ads));
    const vt = (Math.tan((S.fov * DEG) / 2) / af) * (1 + 0.07 * (a.sprinting ? 1 : 0));
    const f = (2 * Math.atan(vt)) / DEG;
    this.scoped = !!(def && def.scope && ads > 0.88);
    this.fov = damp(this.fov, f, 14, dt);
    if (Math.abs(cam.fov - this.fov) > 0.01) {
      cam.fov = this.fov;
      cam.updateProjectionMatrix();
    }
    // the gun is drawn by its own camera: keep its field of view tied to the world's
    const vm = g.viewmodel;
    if (vm) {
      const vf = clamp(this.fov * 0.66, 40, 68);
      if (Math.abs(vm.cam.fov - vf) > 0.01 || vm.cam.aspect !== cam.aspect) {
        vm.cam.fov = vf;
        vm.cam.aspect = cam.aspect;
        vm.cam.updateProjectionMatrix();
      }
      vm.lookDX = this.lookDX;
      vm.lookDY = this.lookDY;
    }
  }
}
