// Grass blades around the camera. The world is cut into tiles; each tile scatters clumps deterministically
// (so grass never swims as you move), only where the ground is grassy, tinted to the ground beneath, and
// shrinking away toward the edge of the ring so it never pops. Blades sway in the wind.
import * as THREE from 'three';
import { WIND, noBackfaceFlip } from './foliage.js';

const TILE = 8;
const RADIUS = 46;
const PER_TILE = 110;

function hash(i, j, k) {
  let h = (i * 374761393 + j * 668265263 + k * 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function clumpGeometry() {
  const P = [], N = [], C = [];
  const blades = 9;
  for (let b = 0; b < blades; b++) {
    const a = (b / blades) * Math.PI * 2 + hash(b, 1, 2) * 1.2;
    const r = 0.06 + hash(b, 3, 4) * 0.14;
    const bx = Math.cos(a) * r, bz = Math.sin(a) * r;
    const h = 0.26 + hash(b, 5, 6) * 0.3, w = 0.022 + hash(b, 7, 8) * 0.014;
    const lean = 0.15 + hash(b, 9, 10) * 0.3, la = a + (hash(b, 11, 12) - 0.5);
    const sx = -Math.sin(la), sz = Math.cos(la);
    const seg = 3;
    const pt = (t) => {
      const bend = lean * t * t;
      return [bx + Math.cos(la) * bend, h * t, bz + Math.sin(la) * bend];
    };
    for (let s = 0; s < seg; s++) {
      const t0 = s / seg, t1 = (s + 1) / seg;
      const p0 = pt(t0), p1 = pt(t1), w0 = w * (1 - t0 * 0.85), w1 = w * (1 - t1 * 0.85);
      const c0 = 0.62 + t0 * 0.45, c1 = 0.62 + t1 * 0.45;
      const A = [p0[0] - sx * w0, p0[1], p0[2] - sz * w0], B = [p0[0] + sx * w0, p0[1], p0[2] + sz * w0];
      const Cc = [p1[0] + sx * w1, p1[1], p1[2] + sz * w1], D = [p1[0] - sx * w1, p1[1], p1[2] - sz * w1];
      for (const [p, c] of [[A, c0], [B, c0], [Cc, c1], [A, c0], [Cc, c1], [D, c1]]) {
        P.push(p[0], p[1], p[2]);
        // normals mostly up so blades light like the ground they grow from
        N.push(0, 1, 0);
        C.push(c, c, c);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  g.computeBoundingSphere();
  return g;
}

export class GrassField {
  constructor(game) {
    this.game = game;
    const T = game.terrain;
    this.T = T;
    const tiles = Math.ceil(RADIUS / TILE) * 2 + 1;
    this.cap = tiles * tiles * PER_TILE;
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85, metalness: 0 });
    mat.onBeforeCompile = (sh) => {
      noBackfaceFlip(sh);
      sh.uniforms.uWindT = WIND.time;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWindT;').replace('#include <begin_vertex>', `#include <begin_vertex>
	{
		vec3 wp = instanceMatrix[ 3 ].xyz;
		float h = transformed.y;
		float ph = wp.x * 0.21 + wp.z * 0.17;
		float gust = sin( uWindT * 1.3 + wp.x * 0.05 + wp.z * 0.03 ) * 0.5 + 0.5;
		float sway = sin( uWindT * 2.6 + ph ) * ( 0.25 + 0.75 * gust );
		transformed.x += sway * h * h * 0.35;
		transformed.z += sway * h * h * 0.2;
	}`);
    };
    mat.customProgramCacheKey = () => 'grass-blades';
    this.mesh = new THREE.InstancedMesh(clumpGeometry(), mat, this.cap);
    this.mesh.count = 0;
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.name = 'grass';
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.cap * 3), 3);
    game.scene.add(this.mesh);
    this.cx = null;
    this.cz = null;
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._v = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this.enabled = true;
    this.tiles = new Map();
  }

  // How grassy the ground is at a point (0..1) and its color, from the terrain's nearest vertex.
  sample(x, z, out) {
    const T = this.T, N = T.N;
    const i = Math.round((x + T.half) / T.cell), j = Math.round((z + T.half) / T.cell);
    if (i < 0 || j < 0 || i > N || j > N) return 0;
    const k = j * (N + 1) + i, s = T.splat;
    out[0] = T.colors[k * 3];
    out[1] = T.colors[k * 3 + 1];
    out[2] = T.colors[k * 3 + 2];
    // grass, forest floor, dry grass count; the rest (dirt, rock, sand, snow, paving) do not
    return s[k * 8] + s[k * 8 + 1] * 0.55 + s[k * 8 + 2] * 0.9;
  }

  // The clumps of one tile, worked out once and cached: [x, y, z, rotation, scale, height, r, g, b] each.
  tileData(ti, tj) {
    const key = ti * 100003 + tj;
    let t = this.tiles.get(key);
    if (t) return t;
    const T = this.T, W = this.game.collision, col = [0, 0, 0], c = new THREE.Color();
    t = [];
    for (let k = 0; k < PER_TILE; k++) {
      const x = (ti + hash(ti, tj, k * 2)) * TILE, z = (tj + hash(ti, tj, k * 2 + 1)) * TILE;
      const gr = this.sample(x, z, col);
      if (gr < 0.35 || hash(ti, tj, k + 991) > gr) continue;
      const y = T.heightAt(x, z);
      if (y < 0.6) continue;
      if (T.distToRoad(x, z) < 4.6) continue;
      // not under buildings or rocks: the terrain must be the top surface there
      const top = W.groundAt(x, z, y + 3);
      if (top > y + 0.3) continue;
      c.setRGB(col[0], col[1], col[2], THREE.SRGBColorSpace);
      const v = 0.9 + hash(ti, tj, k + 13) * 0.25;
      t.push(x, y - 0.02, z, hash(ti, tj, k + 55) * 6.28, 0.75 + hash(ti, tj, k + 77) * 0.6, 0.8 + hash(ti, tj, k + 33) * 0.5, c.r * v * 1.1, c.g * v * 1.05, c.b * v * 0.95);
    }
    this.tiles.set(key, t);
    if (this.tiles.size > 4000) this.tiles.clear();
    return t;
  }

  rebuild(cx, cz) {
    const n = Math.ceil(RADIUS / TILE);
    let count = 0;
    const ti0 = Math.floor(cx / TILE), tj0 = Math.floor(cz / TILE);
    for (let tj = tj0 - n; tj <= tj0 + n; tj++) {
      for (let ti = ti0 - n; ti <= ti0 + n; ti++) {
        const t = this.tileData(ti, tj);
        for (let q = 0; q < t.length; q += 9) {
          const x = t[q], z = t[q + 2], d = Math.hypot(x - cx, z - cz);
          if (d > RADIUS) continue;
          // shrink away toward the edge of the ring so blades never pop in
          const s = t[q + 4] * (1 - Math.max(0, (d - RADIUS * 0.6) / (RADIUS * 0.4)));
          this._q.setFromEuler(this._e.set(0, t[q + 3], 0));
          this._m.compose(this._v.set(x, t[q + 1], z), this._q, this._s.set(s * 1.2, s * t[q + 5], s * 1.2));
          this.mesh.setMatrixAt(count, this._m);
          this.mesh.instanceColor.setXYZ(count, t[q + 6], t[q + 7], t[q + 8]);
          if (++count >= this.cap) break;
        }
      }
    }
    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }

  update(camera) {
    if (!this.enabled) {
      this.mesh.visible = false;
      return;
    }
    const p = camera.position;
    // no grass while high in the air
    const ground = this.T.heightAt(p.x, p.z);
    this.mesh.visible = p.y - ground < 60;
    if (!this.mesh.visible) return;
    const cx = Math.round(p.x / 2) * 2, cz = Math.round(p.z / 2) * 2;
    if (cx === this.cx && cz === this.cz) return;
    this.cx = cx;
    this.cz = cz;
    this.rebuild(cx, cz);
  }
}
