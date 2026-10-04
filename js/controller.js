import * as THREE from 'three';
import { CAMERA, WEAPONS } from './config.js';
import { PAD } from './input.js';
import { clamp, lerp } from './util.js';
import { PIECES } from './building.js';

const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Vector3(), _q = new THREE.Vector3();
const PIECE_KEYS = { KeyQ: 'wall', KeyF: 'floor', KeyC: 'ramp', KeyV: 'roof' };

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
  }

  reset() {
    this.crouchToggle = false;
    this.padSprint = false;
    this.scoped = false;
    this.camDist = CAMERA.back;
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
    if (kp('KeyX') || pp(PAD.RS)) {
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
      cam.rotation.set(pitch, yaw, 0, 'YXZ');
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
}
