import * as THREE from 'three';
import { CharacterModel, OUTFITS } from './character.js';
import { RARITY } from './config.js';
import { skyEnvironment } from './zh/envmap.js';

// The 3D stage behind the lobby and locker menus: the equipped outfit on a pedestal.
export class LobbyStage {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
    const bg = document.createElement('canvas');
    bg.width = 4;
    bg.height = 256;
    const c = bg.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#0f2f7a');
    g.addColorStop(0.55, '#2563c9');
    g.addColorStop(1, '#5aa2f0');
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(bg);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = tex;
    this.scene.environment = skyEnvironment(game.renderer, { top: 0x2563c9, horizon: 0xa8d0ff, ground: 0x1b3f8f, sun: 8, sunDir: new THREE.Vector3(0.4, 0.7, 0.6) });
    this.scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x31408a, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2, 4, 3);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fd0ff, 1.4);
    rim.position.set(-3, 2, -3);
    this.scene.add(rim);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.25, 40), new THREE.MeshLambertMaterial({ color: 0x1b3f8f }));
    ped.position.y = -0.125;
    this.scene.add(ped);
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.03, 8, 64), new THREE.MeshBasicMaterial({ color: 0x7fd0ff }));
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.y = 0.01;
    this.scene.add(this.ring);
    // floating sparkles
    const pts = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      pts[i * 3] = (Math.random() - 0.5) * 12;
      pts[i * 3 + 1] = Math.random() * 6;
      pts[i * 3 + 2] = -2 - Math.random() * 6;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    this.sparkles = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xbfe6ff, size: 0.04, transparent: true, opacity: 0.7 }));
    this.scene.add(this.sparkles);
    this.model = null;
    this.outfitId = null;
    this.spin = Math.PI; // model faces -Z; turn it toward the camera
    this.dragging = false;
    this.offsetX = 0;
    this.showGlider = false;
    this.layout = 'lobby';
    const canvas = game.renderer.domElement;
    canvas.addEventListener('pointerdown', (e) => {
      if (!this.active) return;
      this.dragging = true;
      this.lastX = e.clientX;
    });
    window.addEventListener('pointerup', () => (this.dragging = false));
    window.addEventListener('pointermove', (e) => {
      if (!this.active || !this.dragging) return;
      this.spin += (e.clientX - this.lastX) * 0.01;
      this.lastX = e.clientX;
    });
  }

  setOutfit(id) {
    if (this.outfitId === id && this.model) return;
    if (this.model) this.scene.remove(this.model.root);
    const outfit = OUTFITS.find((o) => o.id === id) || OUTFITS[0];
    this.model = new CharacterModel(outfit);
    this.model.root.visible = true;
    this.model.setHeld('pickaxe');
    this.scene.add(this.model.root);
    this.outfitId = id;
    this.ring.material.color.set(RARITY[outfit.rarity].color);
  }

  setLayout(layout) {
    this.layout = layout;
  }

  update(dt) {
    if (!this.model) return;
    if (!this.dragging) this.spin += dt * (this.layout === 'locker' ? 0.25 : 0.4);
    const m = this.model;
    m.root.rotation.y = this.spin;
    m.setHeld(this.showGlider ? null : 'pickaxe');
    m.animate({ dt, mode: this.showGlider ? 'glide' : 'ground', speed: 0, pitch: 0, holding: this.showGlider ? null : 'pickaxe', emote: false, onGround: true });
    m.root.position.y = this.showGlider ? 0.3 + Math.sin(performance.now() / 500) * 0.05 : 0;
    const aspect = innerWidth / innerHeight;
    this.camera.aspect = aspect;
    // Frame the model left of center in the locker so the card grid fits on the right.
    const shift = this.layout === 'locker' && aspect > 1 ? 0.9 : this.layout === 'lobby' && aspect > 1 ? -0.4 : 0;
    const dist = this.showGlider ? 11.5 : 5.4;
    this.camera.position.set(shift * (this.showGlider ? 1.8 : 1), 1.25 + (this.showGlider ? 1.6 : 0), dist);
    this.camera.lookAt(shift * (this.showGlider ? 1.8 : 1), 1.0 + (this.showGlider ? 1.35 : 0), 0);
    this.camera.updateProjectionMatrix();
    this.sparkles.rotation.y += dt * 0.02;
  }
}
