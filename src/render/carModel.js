import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CAR, S, TEAM_COLORS } from '../config.js';
import { treadTexture } from './textures.js';

let shared = null;
function sharedAssets() {
  if (shared) return shared;
  const tread = treadTexture();
  tread.repeat.set(3, 1);
  shared = {
    tireMat: new THREE.MeshStandardMaterial({ color: 0x2a2a2c, map: tread, roughness: 0.85, metalness: 0 }),
    tireSideMat: new THREE.MeshStandardMaterial({ color: 0x161617, roughness: 0.75 }),
    rimMat: new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.25, metalness: 1 }),
    darkMat: new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.45, metalness: 0.5 }),
    trimMat: new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.6, metalness: 0.3 }),
    glassMat: new THREE.MeshPhysicalMaterial({ color: 0x0b0f16, roughness: 0.05, metalness: 0.9, clearcoat: 1, clearcoatRoughness: 0.03 }),
    chromeMat: new THREE.MeshStandardMaterial({ color: 0xd8dde4, roughness: 0.12, metalness: 1 }),
    tailMat: new THREE.MeshStandardMaterial({ color: 0x400000, emissive: 0xff1020, emissiveIntensity: 3.5 }),
    headMat: new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0xfff2d8, emissiveIntensity: 2.2 }),
    engineMat: new THREE.MeshStandardMaterial({ color: 0xb3121c, roughness: 0.35, metalness: 0.6 }),
    spikeMat: new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.3, metalness: 0.9, emissive: 0x501008, emissiveIntensity: 0.6 }),
  };
  return shared;
}

function extrudeProfile(points, halfWidth, bevel) {
  const shape = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: halfWidth * 2 - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 4, curveSegments: 8,
  });
  // shape is in (z, y); extrusion is along +Z -> remap to x
  g.translate(0, 0, -(halfWidth - bevel));
  g.rotateY(-Math.PI / 2);
  // after rotation, original x (our z) maps to +z? rotateY(-90°): (x,y,z)->(-z, y, x)
  return g;
}

// narrow the top of a body part so it is not slab-sided
function taper(geo, y0, y1, amount) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = Math.min(1, Math.max(0, (p.getY(i) - y0) / (y1 - y0)));
    p.setX(i, p.getX(i) * (1 - amount * t * t));
  }
  geo.computeVertexNormals();
}

function numberTexture(n, teamCss) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const g = c.getContext('2d');
  g.font = 'italic 900 132px Arial Black, Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  g.lineWidth = 18;
  g.strokeStyle = '#101216';
  g.strokeText(String(n), 128, 84);
  g.fillStyle = '#f4f6fa';
  g.fillText(String(n), 128, 84);
  g.lineWidth = 4;
  g.strokeStyle = teamCss;
  g.strokeText(String(n), 128, 84);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class CarModel {
  constructor(team, number = 0) {
    const A = sharedAssets();
    const tc = TEAM_COLORS[team];
    this.team = team;
    this.root = new THREE.Group(); // meters, follows physics
    this.body = new THREE.Group(); // uu
    this.body.scale.setScalar(S);
    this.root.add(this.body);

    const paint = new THREE.MeshPhysicalMaterial({ color: tc.main, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 });
    const paintDark = new THREE.MeshPhysicalMaterial({ color: tc.dark, metalness: 0.6, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 });
    this.paint = paint;

    const add = (geo, mat, x = 0, y = 0, z = 0, parent = this.body) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // main body shell (side profile in z/y)
    const bodyProfile = [[-46, 3], [-48, 18], [-43, 26], [-20, 29], [10, 27], [38, 22], [60, 17], [71, 11], [72, 4], [64, -1], [-40, -1]];
    const bodyGeo = extrudeProfile(bodyProfile, 31, 6);
    taper(bodyGeo, 8, 30, 0.2);
    add(bodyGeo, paint);
    // cabin
    const cabinProfile = [[-30, 26], [-24, 41], [-6, 45], [8, 42], [22, 27]];
    const cabinGeo = extrudeProfile(cabinProfile, 24, 4);
    taper(cabinGeo, 27, 45, 0.22);
    add(cabinGeo, A.glassMat);
    add(new RoundedBoxGeometry(40, 3, 22, 2, 1.5), paint, 0, 45.2, -9);
    // pillars
    for (const sx of [-1, 1]) {
      const p = add(new THREE.BoxGeometry(2.5, 18, 3), paint, sx * 22.5, 36, 15);
      p.rotation.x = -0.75;
    }
    // hood stripe + scoop
    add(new THREE.BoxGeometry(10, 1.2, 40), A.darkMat, 0, 26.4, 40).rotation.x = 0.17;
    add(new RoundedBoxGeometry(18, 6, 14, 2, 2), A.darkMat, 0, 27.5, 22);
    // wheel arches (half cylinders hugging the tyres)
    for (const w of CAR.wheels) {
      const sx = Math.sign(w.x);
      const cy = -CAR.restHeight + w.r;
      const arch = new THREE.CylinderGeometry(w.r + 5, w.r + 5, 17, 20, 1, false, -Math.PI / 2, Math.PI);
      arch.rotateZ(Math.PI / 2);
      const f = add(arch, paintDark, sx * (Math.abs(w.x) + 7), cy + 1, w.z);
      f.rotation.x = 0;
      const lip = new THREE.TorusGeometry(w.r + 5, 1.6, 6, 20, Math.PI);
      lip.rotateY(Math.PI / 2);
      add(lip, A.trimMat, sx * (Math.abs(w.x) + 15.5), cy + 1, w.z);
    }
    // front splitter + rear diffuser
    add(new RoundedBoxGeometry(66, 2.5, 14, 2, 1), A.darkMat, 0, -2.5, 64);
    add(new RoundedBoxGeometry(56, 4, 9, 2, 1.5), A.darkMat, 0, 2, -47);
    // side skirts
    for (const sx of [-1, 1]) add(new RoundedBoxGeometry(5, 7, 52, 2, 2), A.trimMat, sx * 31, 2, 9);
    // front grille + bumper
    add(new RoundedBoxGeometry(50, 9, 6, 2, 2.5), A.darkMat, 0, 5, 70);
    add(new RoundedBoxGeometry(62, 4, 10, 2, 1.5), A.trimMat, 0, -1, 66);
    // headlights
    for (const sx of [-1, 1]) add(new RoundedBoxGeometry(10, 4, 3, 2, 1.2), A.headMat, sx * 21, 13, 70.5);
    // rear engine block + exhausts
    add(new RoundedBoxGeometry(46, 16, 10, 2, 3), A.darkMat, 0, 14, -46);
    // exposed supercharger on the rear deck: red block, chrome intakes and belt cover
    add(new RoundedBoxGeometry(30, 9, 16, 2, 2.5), A.engineMat, 0, 32, -33);
    add(new RoundedBoxGeometry(22, 3, 13, 2, 1), A.chromeMat, 0, 37.5, -33);
    for (const sx of [-1, 1]) {
      const intake = add(new THREE.CylinderGeometry(3.4, 4, 8, 14), A.chromeMat, sx * 7, 42, -31);
      intake.castShadow = false;
      add(new THREE.CircleGeometry(2.8, 14), A.darkMat, sx * 7, 46.05, -31).rotation.x = -Math.PI / 2;
    }
    add(new RoundedBoxGeometry(4, 12, 18, 2, 1.5), A.darkMat, 16, 31, -33);
    const pipe = new THREE.CylinderGeometry(4.2, 4.8, 12, 16);
    pipe.rotateX(Math.PI / 2);
    const pipeHole = new THREE.CircleGeometry(3, 16);
    for (const sx of [-1, 1]) {
      add(pipe, A.chromeMat, sx * 13, 9, -50);
      const hole = add(pipeHole, A.darkMat, sx * 13, 9, -56.1);
      hole.rotation.y = Math.PI;
      hole.castShadow = false;
    }
    // tail lights: slim LED bars
    for (const sx of [-1, 1]) {
      const t = add(new RoundedBoxGeometry(17, 3.2, 2, 2, 1), A.tailMat, sx * 26, 21.5, -48.3);
      t.castShadow = false;
    }
    // spoiler
    for (const sx of [-1, 1]) {
      const st = add(new THREE.BoxGeometry(3, 26, 7), A.darkMat, sx * 17, 40, -40);
      st.rotation.x = -0.35;
    }
    const wing = add(new RoundedBoxGeometry(80, 3.5, 20, 2, 1.5), paint, 0, 53, -45);
    wing.rotation.x = 0.12;
    for (const sx of [-1, 1]) add(new RoundedBoxGeometry(2.5, 15, 24, 2, 1), A.darkMat, sx * 40, 50, -45);
    // antenna
    add(new THREE.CylinderGeometry(0.6, 0.6, 22, 6), A.darkMat, -16, 56, -24);
    add(new THREE.SphereGeometry(2.4, 10, 8), paint, -16, 67, -24);

    // wheels
    this.wheels = [];
    const tireGeoCache = {};
    for (const w of CAR.wheels) {
      const sx = Math.sign(w.x);
      const pivot = new THREE.Group();
      pivot.position.set(sx * (Math.abs(w.x) + 7), -CAR.restHeight + w.r, w.z);
      const spin = new THREE.Group();
      pivot.add(spin);
      const key = w.r;
      if (!tireGeoCache[key]) {
        const tg = new THREE.CylinderGeometry(w.r, w.r, 12, 28, 1, true);
        tg.rotateZ(Math.PI / 2);
        const side = new THREE.RingGeometry(w.r * 0.62, w.r, 28);
        const rim = new THREE.CylinderGeometry(w.r * 0.64, w.r * 0.64, 11, 6);
        rim.rotateZ(Math.PI / 2);
        const hub = new THREE.CylinderGeometry(w.r * 0.22, w.r * 0.22, 12.5, 12);
        hub.rotateZ(Math.PI / 2);
        tireGeoCache[key] = { tg, side, rim, hub };
      }
      const gc = tireGeoCache[key];
      add(gc.tg, A.tireMat, 0, 0, 0, spin);
      for (const s2 of [-1, 1]) {
        const sd = add(gc.side, A.tireSideMat, s2 * 6, 0, 0, spin);
        sd.rotation.y = s2 * Math.PI / 2;
      }
      add(gc.rim, A.rimMat, 0, 0, 0, spin);
      add(gc.hub, A.chromeMat, 0, 0, 0, spin);
      this.body.add(pivot);
      this.wheels.push({ pivot, spin, front: w.front, r: w.r, baseY: pivot.position.y });
    }

    // boost flame (two cones, additive)
    const fc = new THREE.Color(...tc.flame);
    const flameGeo = new THREE.ConeGeometry(7, 46, 16, 1, true);
    flameGeo.translate(0, -23, 0);
    flameGeo.rotateX(-Math.PI / 2); // tip points -z
    this.flame = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: fc.clone().multiplyScalar(1.4), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.flame.position.set(0, 12, -50);
    const coreGeo = new THREE.ConeGeometry(3.6, 26, 12, 1, true);
    coreGeo.translate(0, -13, 0);
    coreGeo.rotateX(-Math.PI / 2);
    this.flameCore = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.flame.add(this.flameCore);
    this.body.add(this.flame);
    this.flame.visible = false;
    // exhaust glow (always on, brighter when boosting)
    this.exhaustGlow = new THREE.Mesh(new THREE.CircleGeometry(6, 16), new THREE.MeshBasicMaterial({ color: fc.clone().multiplyScalar(1.5), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.exhaustGlow.position.set(0, 12, -51.5);
    this.exhaustGlow.rotation.y = Math.PI;
    this.body.add(this.exhaustGlow);
    this.flicker = 0;

    // racing number on both doors (like the reference photos)
    if (number) {
      const tex = numberTexture(number, tc.css);
      const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.35, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -2 });
      for (const sx of [-1, 1]) {
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(26, 15), mat);
        plate.position.set(sx * 31.2, 15, 8);
        plate.rotation.y = sx * Math.PI / 2;
        this.body.add(plate);
      }
    }

    this.spikes = null;
    this.powerOn = false;
  }

  // Rumble spikes: studs all over the body
  setSpikes(on) {
    if (on && !this.spikes) {
      const A = sharedAssets();
      this.spikes = new THREE.Group();
      const geo = new THREE.ConeGeometry(3.2, 13, 6);
      const spots = [[0, 47, -9], [12, 45, -2], [-12, 45, -2], [12, 45, -16], [-12, 45, -16], [0, 29, 30], [14, 25, 44], [-14, 25, 44],
        [0, 20, 66], [33, 22, 30], [-33, 22, 30], [33, 22, -14], [-33, 22, -14], [0, 26, -47]];
      for (const [x, y, z] of spots) {
        const m = new THREE.Mesh(geo, A.spikeMat);
        m.position.set(x, y, z);
        // point outward from the body centre
        const dir = new THREE.Vector3(x, y - 18, z - 10).normalize();
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        this.spikes.add(m);
      }
      this.body.add(this.spikes);
    }
    if (this.spikes) this.spikes.visible = on;
  }

  // Rumble power hitter: pulsing red glow on the paint
  setPower(on, time) {
    if (on) {
      this.paint.emissive.setRGB(1, 0.08, 0.02);
      this.paint.emissiveIntensity = 0.5 + Math.sin(time * 14) * 0.25;
    } else if (this.powerOn) {
      this.paint.emissive.setRGB(0, 0, 0);
      this.paint.emissiveIntensity = 1;
    }
    this.powerOn = on;
  }

  // pos/quat already interpolated (uu, quaternion)
  update(car, pos, quat, dt) {
    this.root.visible = !car.demolished;
    if (car.demolished) return;
    this.root.position.set(pos.x * S, pos.y * S, pos.z * S);
    this.root.quaternion.copy(quat);
    for (const w of this.wheels) {
      w.spin.rotation.x = car.wheelSpin * (12.5 / w.r);
      if (w.front) w.pivot.rotation.y = -car.steerVisual * 0.42;
    }
    // suspension: drop wheels a bit in the air
    for (let i = 0; i < 4; i++) {
      const w = this.wheels[i];
      const d = car.wheelDist[i];
      const target = d >= 0 ? w.baseY + (CAR.restHeight - d) * 0.6 : w.baseY - 4;
      w.pivot.position.y += (Math.max(w.baseY - 6, Math.min(w.baseY + 6, target)) - w.pivot.position.y) * Math.min(1, dt * 20);
    }
    this.flicker += dt * 40;
    const boosting = car.boosting;
    this.flame.visible = boosting;
    if (boosting) {
      const f = 0.85 + Math.sin(this.flicker) * 0.12 + Math.random() * 0.15;
      this.flame.scale.set(f, f, f * (car.supersonic ? 1.35 : 1.0));
    }
    this.exhaustGlow.material.opacity = boosting ? 1 : 0.45;
  }
}
