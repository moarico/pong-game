import * as THREE from 'three';
import { buildFigure } from './figure.js';
import { Animator } from './animator.js';
import { Cloth } from './cloth.js';
import { mat } from './meshbuilder.js';
import { PAT } from './charmat.js';
import { groundHeight } from './ground.js';
import { MOVE } from './config.js';

const _v = new THREE.Vector3();
const _back = new THREE.Vector3();

// A figure brought to life: skinned body, procedural animation, an optional
// cloth cape, and the bits of state the renderer needs (hat shade, hit flash).
export class Character {
  constructor(shared, wind, outfit, { cape = false, capeColor = '#4a4644' } = {}) {
    this.fig = buildFigure(shared, outfit);
    this.anim = new Animator(this.fig);
    this.anim.v0 = Math.sqrt(2 * MOVE.gravity * MOVE.jumpHeight);
    this.wind = wind;
    this.root = this.fig.root;
    this.scale = this.fig.scale;
    this.uniforms = this.fig.material.uniforms;
    this.flash = 0;
    this.flashColor = new THREE.Color(1, 1, 1);
    this.bladeLen = this.fig.dims.bladeLen;
    this.hatRadius = this.fig.dims.hatRadius || 0;
    this.visible = true;
    if (cape) this.buildCape(capeColor);
  }

  buildCape(hex) {
    const cols = 15;
    const rows = 15;
    // Rest shape in chest space: over the shoulders and down the back to the calves,
    // flaring toward the hem (torn by the shader).
    const rest = (c, r) => {
      const u = (c / (cols - 1)) * 2 - 1;
      const v = r / (rows - 1);
      const theta = u * 1.72;
      const rx = 0.21 + 0.17 * Math.sqrt(v);
      const rz = 0.115 + 0.13 * v;
      return new THREE.Vector3(Math.sin(theta) * rx, 0.25 - 0.05 * u * u - v * 1.0, -0.012 - Math.cos(theta) * rz);
    };
    const surface = mat(this.fig.outfit.cloak || hex, { rough: 0.95, trans: 0.22, bump: 1, rim: 1.1, pat: PAT.cloak });
    this.cape = new Cloth(this.fig.material, cols, rows, rest, surface, [1.5, 1.0]);
    this.cape.drag = 2.5; // a light travelling cloak: the wind takes it
    this.colliders = {
      spheres: Array.from({ length: 8 }, () => [new THREE.Vector3(), 0.1]),
      capsules: Array.from({ length: 6 }, () => [new THREE.Vector3(), new THREE.Vector3(), 0.1]),
    };
  }

  addTo(scene) {
    scene.add(this.root);
    if (this.cape) scene.add(this.cape.mesh);
  }

  removeFrom(scene) {
    scene.remove(this.root);
    if (this.cape) scene.remove(this.cape.mesh);
  }

  // state: { pos, yaw, vel, grounded, jumped, landed, landSpeed, guard, action, lookAt }
  update(dt, state) {
    this.anim.update(dt, state);
    const u = this.uniforms;
    u.uGroundY.value = groundHeight(state.pos.x, state.pos.z);
    if (this.hatRadius > 0) {
      _v.set(0, -0.01, 0).applyMatrix4(this.fig.bones.hat.matrixWorld);
      u.uHat.value.set(_v.x, _v.y, _v.z, this.hatRadius * this.scale * 0.98);
    }
    this.flash = Math.max(0, this.flash - dt * 9);
    u.uFlash.value.set(this.flashColor.r, this.flashColor.g, this.flashColor.b, this.flash);
    if (this.cape) this.updateCape(dt, state);
  }

  hit(color = 0xffffff, amount = 1) {
    this.flashColor.set(color);
    this.flash = Math.max(this.flash, amount);
  }

  // The blade from the habaki to the point, in world space.
  blade(base, tip) {
    const m = this.fig.bones.sword.matrixWorld;
    base.set(0, 0, 0.1).applyMatrix4(m);
    tip.set(0, 0.02, 0.09 + this.bladeLen).applyMatrix4(m);
  }

  updateCape(dt, state) {
    const C = this.colliders;
    const b = this.fig.bones;
    const chest = b.chest.matrixWorld;
    const setS = (k, x, y, z, r, m) => {
      C.spheres[k][0].set(x, y, z).applyMatrix4(m);
      C.spheres[k][1] = r * this.scale;
    };
    setS(0, 0.08, 0.05, -0.01, 0.15, chest);
    setS(1, -0.08, 0.05, -0.01, 0.15, chest);
    setS(2, 0.07, -0.19, 0.0, 0.15, chest);
    setS(3, -0.07, -0.19, 0.0, 0.15, chest);
    setS(4, 0, -0.08, -0.01, 0.25, b.hips.matrixWorld);
    C.spheres[5][0].setFromMatrixPosition(b.armL.matrixWorld);
    C.spheres[5][1] = 0.095 * this.scale;
    C.spheres[6][0].setFromMatrixPosition(b.armR.matrixWorld);
    C.spheres[6][1] = 0.095 * this.scale;
    setS(7, 0, 0.1, 0.0, 0.15, b.head.matrixWorld);
    C.capsules[0][0].setFromMatrixPosition(b.armL.matrixWorld);
    C.capsules[0][1].setFromMatrixPosition(b.foreL.matrixWorld);
    C.capsules[0][2] = 0.09 * this.scale;
    C.capsules[1][0].setFromMatrixPosition(b.armR.matrixWorld);
    C.capsules[1][1].setFromMatrixPosition(b.foreR.matrixWorld);
    C.capsules[1][2] = 0.09 * this.scale;
    // The legs in their wide hakama.
    const leg = (k, a, c, r) => {
      C.capsules[k][0].setFromMatrixPosition(a.matrixWorld);
      C.capsules[k][1].setFromMatrixPosition(c.matrixWorld);
      C.capsules[k][2] = r * this.scale;
    };
    leg(2, b.thighL, b.shinL, 0.15);
    leg(3, b.thighR, b.shinR, 0.15);
    leg(4, b.shinL, b.footL, 0.13);
    leg(5, b.shinR, b.footR, 0.13);
    _back.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
    this.cape.update(dt, chest, this.wind, C, _back);
  }
}
