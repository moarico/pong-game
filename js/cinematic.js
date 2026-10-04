import * as THREE from 'three';
import { busModel } from './zh/models.js';
import { CharacterModel, OUTFITS } from './character.js';

// The live title backdrop: the real island at golden-hour-bright midday, the Sky Coach crossing high above,
// and a squad dropping in, one of them gliding past the camera. Frames of it become the loading key art.
export class TitleCinematic {
  constructor(game) {
    this.game = game;
    this.group = new THREE.Group();
    this.bus = busModel();
    this.group.add(this.bus);
    const pick = ['nightfall', 'vanguard', 'woodland', 'arctic', 'marshal'];
    this.squad = pick.map((id, i) => {
      const o = OUTFITS.find((x) => x.id === id) || OUTFITS[i];
      const m = new CharacterModel(o, 'title-' + i);
      m.root.visible = true;
      this.group.add(m.root);
      // the lead (0) glides right in front of the camera; the rest spread out ahead and below
      const off = i === 0 ? new THREE.Vector3() : new THREE.Vector3((i % 2 ? -1 : 1) * (10 + i * 7), -8 - i * 5, 20 + i * 16);
      return { m, mode: i === 0 ? 'glide' : i % 2 ? 'freefall' : 'glide', off };
    });
    this.t = 0;
    this.active = false;
    this.shots = [];
    this.shotAt = [3.5, 9.5, 15.5];
    this._v = new THREE.Vector3();
    this._f = new THREE.Vector3();
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.t = 0;
    this.game.scene.add(this.group);
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    this.game.scene.remove(this.group);
  }

  update(dt) {
    const g = this.game, cam = g.camera;
    this.t += dt;
    const T = this.t % 24;
    // the lead glider sweeps in toward the middle of the island, losing height
    const dir = this._f.set(0.62, 0, -0.78).normalize();
    const lead = this._v.set(-260, 330, 330).addScaledVector(dir, T * 15);
    lead.y -= T * 4.2;
    const right = new THREE.Vector3(-dir.z, 0, dir.x);
    for (const s of this.squad) {
      const p = s.m.root.position.copy(lead).addScaledVector(right, s.off.x).addScaledVector(dir, s.off.z);
      p.y += s.off.y;
      if (s.mode === 'freefall') p.y -= T * 9;
      s.m.root.rotation.set(0, Math.atan2(-dir.x, -dir.z), 0);
      s.m.setHeld(null);
      s.m.animate({ dt, mode: s.mode, speed: 0, pitch: -0.4, holding: null, emote: false, onGround: false });
    }
    // the coach crosses high behind them
    const bp = this.bus.position.set(-420 + T * 34, 420, 120 - T * 8);
    bp.y += Math.sin(this.t * 1.3) * 0.5;
    this.bus.rotation.y = Math.atan2(-34, 8) + Math.PI;
    this.bus.userData.flame.scale.setScalar(2.2 + Math.sin(this.t * 17) * 0.35);
    // camera: behind and beside the lead, slowly swinging around, looking ahead over the island
    const sw = Math.sin(this.t * 0.12) * 0.5;
    const side = new THREE.Vector3(-dir.z, 0, dir.x);
    cam.position.copy(lead).addScaledVector(dir, -7.5).addScaledVector(side, 3.5 + sw * 3);
    cam.position.y += 2.2;
    const look = lead.clone().addScaledVector(dir, 24).addScaledVector(side, -sw * 6);
    look.y -= 9;
    cam.lookAt(look);
    cam.fov = 62;
    cam.updateProjectionMatrix();
    g.env.update(dt, cam, lead, 0);
  }

  // Grab a frame for the loading screens right after it renders.
  maybeCapture() {
    const t = this.t;
    if (this.shotAt.length && t >= this.shotAt[0]) {
      this.shotAt.shift();
      try {
        this.shots.push(this.game.renderer.domElement.toDataURL('image/jpeg', 0.86));
      } catch {
        /* capture is optional */
      }
    }
  }
}
