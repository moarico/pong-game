import * as THREE from 'three';
import { CAR, S, TEAM_COLORS } from '../config.js';
import { treadTexture } from './textures.js';
import { carGeometry, carTextures, bodyPoint } from './carBody.js';

// Materials shared by every car (paint is per car because power-ups make it glow).
let shared = null;
function sharedAssets() {
  if (shared) return shared;
  const tread = treadTexture();
  tread.repeat.set(6, 1);
  const T = carTextures();
  const decalOpts = { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 };
  shared = {
    tireMat: new THREE.MeshStandardMaterial({ color: 0x232325, map: tread, roughness: 0.92, metalness: 0 }),
    sidewallMat: new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.72, metalness: 0 }),
    rimMat: new THREE.MeshStandardMaterial({ color: 0x2c2f34, roughness: 0.3, metalness: 0.95 }),
    lipMat: new THREE.MeshStandardMaterial({ color: 0xd9dee5, roughness: 0.16, metalness: 1 }),
    barrelMat: new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.5, metalness: 0.8, side: THREE.DoubleSide }),
    discMat: new THREE.MeshStandardMaterial({ color: 0x6b6e73, roughness: 0.42, metalness: 0.9 }),
    darkMat: new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.55, metalness: 0.25 }),
    trimMat: new THREE.MeshStandardMaterial({ color: 0x07080a, roughness: 0.18, metalness: 0.4 }),
    carbonMat: new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.38, metalness: 0.5 }),
    glassMat: new THREE.MeshPhysicalMaterial({ color: 0x06090d, roughness: 0.04, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 }),
    chromeMat: new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.1, metalness: 1 }),
    headMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.head.map, emissiveMap: T.head.emissiveMap, emissive: 0xf4f8ff, emissiveIntensity: 2.4, roughness: 0.08, metalness: 0.4 }),
    tailMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.tail.map, emissiveMap: T.tail.emissiveMap, emissive: 0xff1428, emissiveIntensity: 3.2, roughness: 0.15 }),
    panelMat: new THREE.MeshBasicMaterial({ ...decalOpts, map: T.panel }),
    grilleMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.grille, roughness: 0.6 }),
    scoopMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.scoop, roughness: 0.6 }),
    louverMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.louvers, roughness: 0.45, metalness: 0.4 }),
    badgeMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.badge, roughness: 0.2, metalness: 0.7 }),
    spikeMat: new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.3, metalness: 0.9, emissive: 0x501008, emissiveIntensity: 0.6 }),
    caliperMats: [
      new THREE.MeshStandardMaterial({ color: 0xffc21a, roughness: 0.35, metalness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0xd81e1e, roughness: 0.35, metalness: 0.25 }),
    ],
    geo: {},
  };
  // small shared parts
  const g = shared.geo;
  g.mirror = new THREE.SphereGeometry(1, 16, 10);
  g.mirror.scale(3.4, 2.1, 2.6);
  g.mirrorGlass = new THREE.CircleGeometry(1, 14);
  g.mirrorGlass.scale(2.9, 1.7, 1);
  g.stalk = new THREE.BoxGeometry(5, 1.1, 2);
  g.wing = wingGeometry();
  g.endplate = new THREE.BoxGeometry(0.9, 9, 15);
  g.upright = uprightGeometry();
  g.splitter = new THREE.BoxGeometry(52, 0.8, 6);
  g.diffuser = new THREE.BoxGeometry(48, 0.8, 11);
  g.fin = new THREE.BoxGeometry(0.7, 5, 10);
  g.pipe = new THREE.CylinderGeometry(3.3, 3.3, 5, 20, 1, true);
  g.pipe.rotateX(Math.PI / 2);
  g.pipeInner = new THREE.CircleGeometry(2.7, 20);
  g.pipeInner.rotateY(Math.PI);
  g.pipeRim = new THREE.TorusGeometry(3.2, 0.45, 6, 20);
  for (const k in g) g[k].userData.shared = true;
  return shared;
}

// airfoil-section rear wing
function wingGeometry() {
  const sh = new THREE.Shape();
  sh.moveTo(7, 0);
  sh.bezierCurveTo(4, 1.6, -3, 2.4, -7, 1.2);
  sh.lineTo(-7.2, 0.4);
  sh.bezierCurveTo(-3, 0.6, 3, 0, 7, -0.3);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 68, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.3, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -34);
  g.rotateY(Math.PI / 2); // span along x, chord along z (leading edge forward)
  return g;
}

// swan-neck wing mount
function uprightGeometry() {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.lineTo(5, 0);
  sh.quadraticCurveTo(3, 6, -1, 11.5);
  sh.lineTo(-4, 11.5);
  sh.quadraticCurveTo(1, 5, 0, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: false });
  g.translate(0, 0, -0.6);
  g.rotateY(-Math.PI / 2); // profile in the y/z plane, thin in x
  return g;
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
  constructor(team, number = 0, quality = 'high') {
    const A = sharedAssets();
    const geo = carGeometry(quality);
    const tc = TEAM_COLORS[team];
    this.team = team;
    this.root = new THREE.Group(); // meters, follows physics
    this.body = new THREE.Group(); // uu
    this.body.scale.setScalar(S);
    this.root.add(this.body);

    const paint = new THREE.MeshPhysicalMaterial({
      color: tc.main, metalness: 0.4, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.035, envMapIntensity: 1.2,
    });
    this.paint = paint;

    const add = (g, mat, x = 0, y = 0, z = 0, parent = this.body, shadow = true) => {
      const mesh = new THREE.Mesh(g, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = shadow;
      mesh.receiveShadow = shadow;
      parent.add(mesh);
      return mesh;
    };

    // shell and greenhouse (material groups: paint / black trim / glass)
    add(geo.body, [paint, A.darkMat]);
    add(geo.greenhouse, [paint, A.glassMat, A.trimMat]);

    // conforming decals: lights, shut lines, grilles, numbers
    const d = geo.decals;
    for (const k of ['headR', 'headL']) add(d[k], A.headMat, 0, 0, 0, this.body, false);
    add(d.tail, A.tailMat, 0, 0, 0, this.body, false);
    for (const k of ['doorR', 'doorL']) add(d[k], A.panelMat, 0, 0, 0, this.body, false);
    for (const k of ['scoopR', 'scoopL']) add(d[k], A.scoopMat, 0, 0, 0, this.body, false);
    add(d.grille, A.grilleMat, 0, 0, 0, this.body, false);
    add(d.louvers, A.louverMat, 0, 0, 0, this.body, false);
    add(d.badge, A.badgeMat, 0, 0, 0, this.body, false);
    if (number) {
      const numMat = new THREE.MeshStandardMaterial({
        map: numberTexture(number, tc.css), transparent: true, depthWrite: false, roughness: 0.3, metalness: 0.2,
        polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5,
      });
      for (const k of ['numR', 'numL']) add(d[k], numMat, 0, 0, 0, this.body, false);
    }

    // mirrors on the doors at the base of the windscreen
    for (const sx of [-1, 1]) {
      const m = add(A.geo.mirror, paint, sx * 36.6, 22, 30);
      m.rotation.y = sx * 0.2;
      const gl = add(A.geo.mirrorGlass, A.chromeMat, sx * 36.9, 22, 27.45, this.body, false);
      gl.rotation.y = Math.PI;
      const st = add(A.geo.stalk, A.darkMat, sx * 34, 19.6, 30.6);
      st.rotation.z = sx * 0.6;
    }

    // aero: splitter, diffuser with fins, swan-neck rear wing
    add(A.geo.splitter, A.carbonMat, 0, -9.3, 79);
    add(A.geo.diffuser, A.carbonMat, 0, -7.6, -53);
    for (let i = -2; i <= 2; i++) add(A.geo.fin, A.carbonMat, i * 9, -5.4, -53.5);
    for (const sx of [-1, 1]) add(A.geo.upright, A.carbonMat, sx * 13, 21.2, -45);
    add(A.geo.wing, A.carbonMat, 0, 32.4, -50.5);
    for (const sx of [-1, 1]) add(A.geo.endplate, A.carbonMat, sx * 34.6, 31.6, -50.5);

    // twin centre exhausts
    for (const sx of [-1, 1]) {
      add(A.geo.pipe, A.chromeMat, sx * 6, 1.5, -57.2);
      const rim = add(A.geo.pipeRim, A.chromeMat, sx * 6, 1.5, -59.6, this.body, false);
      rim.rotation.y = 0;
      add(A.geo.pipeInner, A.darkMat, sx * 6, 1.5, -58.6, this.body, false);
    }

    // wheels: spinning tyre/rim/disc, caliper fixed to the upright
    this.wheels = [];
    const caliperMat = A.caliperMats[team];
    for (const w of CAR.wheels) {
      const sx = Math.sign(w.x);
      const wg = geo.wheels[w.r];
      const pivot = new THREE.Group();
      pivot.position.set(sx * (Math.abs(w.x) + 7), -CAR.restHeight + w.r, w.z);
      const spin = new THREE.Group();
      pivot.add(spin);
      const wheel = new THREE.Group(); // outer face toward +x, mirrored on the right side
      if (sx < 0) wheel.rotation.y = Math.PI;
      spin.add(wheel);
      add(wg.tread, A.tireMat, 0, 0, 0, wheel);
      add(wg.sideOut, A.sidewallMat, 0, 0, 0, wheel);
      add(wg.sideIn, A.sidewallMat, 0, 0, 0, wheel);
      add(wg.barrel, A.barrelMat, 0, 0, 0, wheel, false);
      add(wg.lip, A.lipMat, 0, 0, 0, wheel, false);
      add(wg.spokes, A.rimMat, 0, 0, 0, wheel);
      add(wg.nuts, A.chromeMat, 0, 0, 0, wheel, false);
      add(wg.cap, A.badgeMat, 0, 0, 0, wheel, false);
      add(wg.disc, A.discMat, 0, 0, 0, wheel, false);
      const cal = new THREE.Group();
      if (sx < 0) cal.rotation.y = Math.PI;
      add(wg.caliper, caliperMat, 0, 0, 0, cal, false);
      pivot.add(cal);
      this.body.add(pivot);
      this.wheels.push({ pivot, spin, front: w.front, r: w.r, baseY: pivot.position.y });
    }

    // boost flame (two cones, additive) out of the exhausts
    const fc = new THREE.Color(...tc.flame);
    const flameGeo = new THREE.ConeGeometry(7, 46, 16, 1, true);
    flameGeo.translate(0, -23, 0);
    flameGeo.rotateX(-Math.PI / 2); // tip points -z
    this.flame = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: fc.clone().multiplyScalar(1.4), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.flame.position.set(0, 1.5, -59);
    const coreGeo = new THREE.ConeGeometry(3.6, 26, 12, 1, true);
    coreGeo.translate(0, -13, 0);
    coreGeo.rotateX(-Math.PI / 2);
    this.flameCore = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.flame.add(this.flameCore);
    this.body.add(this.flame);
    this.flame.visible = false;
    // exhaust glow (always on, brighter when boosting)
    this.exhaustGlow = new THREE.Group();
    const glowMat = new THREE.MeshBasicMaterial({ color: fc.clone().multiplyScalar(1.5), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
    this.exhaustGlow.material = glowMat;
    for (const sx of [-1, 1]) {
      const gm = new THREE.Mesh(A.geo.pipeInner, glowMat);
      gm.position.set(sx * 6, 1.5, -58.4);
      this.exhaustGlow.add(gm);
    }
    this.body.add(this.exhaustGlow);
    this.flicker = 0;

    this.spikes = null;
    this.powerOn = false;
  }

  // Rumble spikes: studs all over the body
  setSpikes(on) {
    if (on && !this.spikes) {
      const A = sharedAssets();
      this.spikes = new THREE.Group();
      const geo = new THREE.ConeGeometry(3.2, 13, 6);
      const spots = [
        new THREE.Vector3(0, 33.5, 2), new THREE.Vector3(13, 32, -6), new THREE.Vector3(-13, 32, -6), new THREE.Vector3(13, 32, 10), new THREE.Vector3(-13, 32, 10),
        new THREE.Vector3(0, 14.5, 58), bodyPoint(64, 1, 0.33), bodyPoint(64, -1, 0.33), new THREE.Vector3(0, 0, 84),
        bodyPoint(30, 1, 0.5), bodyPoint(30, -1, 0.5), bodyPoint(-22, 1, 0.42), bodyPoint(-22, -1, 0.42), new THREE.Vector3(0, 21, -46), new THREE.Vector3(0, 15, -58),
      ];
      for (const p of spots) {
        const m = new THREE.Mesh(geo, A.spikeMat);
        m.position.copy(p);
        // point outward from the body centre
        const dir = new THREE.Vector3(p.x, p.y + 10, (p.z - 10) * 0.6).normalize();
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
