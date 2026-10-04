import * as THREE from 'three';
import { CAR, S, TEAM_COLORS } from '../config.js';
import { treadTexture } from './textures.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { carGeometry, carTextures, bodyPoint, tyreHalf } from './carBody.js';

// Materials shared by every car (paint is per car because power-ups make it glow).
let shared = null;
function sharedAssets() {
  if (shared) return shared;
  const tread = treadTexture();
  tread.repeat.set(7, 1);
  const T = carTextures();
  const decalOpts = { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 };
  shared = {
    tireMat: new THREE.MeshStandardMaterial({ color: 0x232325, map: tread, roughness: 0.92, metalness: 0 }),
    sidewallMat: new THREE.MeshStandardMaterial({ color: 0x19191b, roughness: 0.75, metalness: 0 }),
    rimMat: new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.32, metalness: 0.9 }),
    lipMat: new THREE.MeshStandardMaterial({ color: 0x8d939b, roughness: 0.22, metalness: 1 }),
    barrelMat: new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.5, metalness: 0.8, side: THREE.DoubleSide }),
    discMat: new THREE.MeshStandardMaterial({ color: 0x6b6e73, roughness: 0.42, metalness: 0.9 }),
    darkMat: new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.55, metalness: 0.3 }),
    frameMat: new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.42, metalness: 0.75 }),
    trimMat: new THREE.MeshStandardMaterial({ color: 0x07080a, roughness: 0.18, metalness: 0.4 }),
    glassMat: new THREE.MeshPhysicalMaterial({ color: 0x06090d, roughness: 0.04, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 }),
    chromeMat: new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.1, metalness: 1 }),
    engineMat: new THREE.MeshPhysicalMaterial({ color: 0xb0121a, roughness: 0.3, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 }),
    tailLampMat: new THREE.MeshStandardMaterial({ color: 0x300004, emissive: 0xff1a24, emissiveMap: T.lamp, emissiveIntensity: 3.4, roughness: 0.2 }),
    headMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.head.map, emissiveMap: T.head.emissiveMap, emissive: 0xf4f8ff, emissiveIntensity: 2.4, roughness: 0.08, metalness: 0.4 }),
    panelMat: new THREE.MeshBasicMaterial({ ...decalOpts, map: T.panel }),
    ventMat: new THREE.MeshStandardMaterial({ ...decalOpts, map: T.vents, roughness: 0.5, metalness: 0.3 }),
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
  g.engine = new RoundedBoxGeometry(38, 13, 20, 3, 2.4);
  g.blower = new RoundedBoxGeometry(22, 13, 17, 3, 2.4);
  g.blowerTop = new RoundedBoxGeometry(18, 1.8, 13, 2, 0.8);
  g.stack = new THREE.LatheGeometry([new THREE.Vector2(2.6, 0), new THREE.Vector2(2.6, 5), new THREE.Vector2(3.2, 7.4), new THREE.Vector2(4.2, 8.6)], 18);
  g.pulley = new THREE.CylinderGeometry(3, 3, 2, 18);
  g.pulley.rotateZ(Math.PI / 2);
  g.belt = new RoundedBoxGeometry(2.2, 11, 16, 2, 1);
  g.bar = new THREE.CylinderGeometry(1.1, 1.1, 1, 10);
  g.bar.rotateZ(Math.PI / 2); // along x, unit length
  g.post = new THREE.CylinderGeometry(1.1, 1.1, 1, 10); // along y, unit length
  g.shaft = new THREE.CylinderGeometry(1.5, 1.5, 1, 10);
  g.shaft.rotateZ(Math.PI / 2);
  g.lampHousing = new THREE.CylinderGeometry(3.9, 3.9, 2.4, 22);
  g.lampHousing.rotateX(Math.PI / 2);
  g.lamp = new THREE.CircleGeometry(3.2, 22);
  g.lamp.rotateY(Math.PI);
  g.undertray = new RoundedBoxGeometry(52, 3, 9, 2, 1.2);
  g.wing = wingGeometry();
  g.endplate = endplateGeometry();
  g.strut = strutGeometry();
  g.pipe = new THREE.CylinderGeometry(4.6, 4.2, 6, 22, 1, true);
  g.pipe.rotateX(Math.PI / 2);
  g.pipeInner = new THREE.CircleGeometry(3.9, 22);
  g.pipeInner.rotateY(Math.PI);
  g.pipeRim = new THREE.TorusGeometry(4.5, 0.6, 8, 22);
  for (const k in g) g[k].userData.shared = true;
  return shared;
}

// the Octane's big swept rear wing (airfoil section, span along x)
function wingGeometry() {
  const sh = new THREE.Shape();
  sh.moveTo(9, 0);
  sh.bezierCurveTo(5, 2, -4, 2.8, -9, 1.6);
  sh.lineTo(-9.2, 0.6);
  sh.bezierCurveTo(-4, 0.9, 4, 0.2, 9, -0.4);
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 74, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.4, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -37);
  g.rotateY(Math.PI / 2); // chord along z (leading edge toward +z), span along x
  return g;
}

function endplateGeometry() {
  const sh = new THREE.Shape();
  sh.moveTo(10, -5); sh.lineTo(-11, -3); sh.lineTo(-13, 8); sh.lineTo(4, 5); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 1 });
  g.translate(0, 0, -0.5);
  g.rotateY(-Math.PI / 2); // plate in the y/z plane
  return g;
}

// wing strut, leaning back from the rear deck
function strutGeometry() {
  const sh = new THREE.Shape();
  sh.moveTo(4, 0); sh.lineTo(-3, 0); sh.lineTo(-11, 21); sh.lineTo(-5, 21); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 1 });
  g.translate(0, 0, -0.8);
  g.rotateY(-Math.PI / 2);
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
    for (const k of ['doorR', 'doorL']) add(d[k], A.panelMat, 0, 0, 0, this.body, false);
    add(d.hoodVents, A.ventMat, 0, 0, 0, this.body, false);
    add(d.badge, A.badgeMat, 0, 0, 0, this.body, false);
    if (number) {
      const numMat = new THREE.MeshStandardMaterial({
        map: numberTexture(number, tc.css), transparent: true, depthWrite: false, roughness: 0.3, metalness: 0.2,
        polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5,
      });
      for (const k of ['numR', 'numL']) add(d[k], numMat, 0, 0, 0, this.body, false);
    }

    // exposed rear: engine, red supercharger with chrome intake trumpets, frame, round lamps
    add(A.geo.engine, A.frameMat, 0, 25.5, -36.5);
    add(A.geo.blower, A.engineMat, 0, 38, -33.5);
    add(A.geo.blowerTop, A.chromeMat, 0, 45.2, -33.5, this.body, false);
    for (const sx of [-1, 1]) add(A.geo.stack, A.chromeMat, sx * 5.2, 45.8, -31);
    add(A.geo.belt, A.darkMat, 12.5, 33, -28.5);
    add(A.geo.pulley, A.chromeMat, 12.8, 37, -23.5);
    const bar = (len, x, y, z, mat = A.frameMat) => { const m = add(A.geo.bar, mat, x, y, z); m.scale.x = len; return m; };
    const post = (len, x, y, z) => { const m = add(A.geo.post, A.frameMat, x, y, z); m.scale.y = len; return m; };
    bar(66, 0, 17.5, -46.2);
    bar(62, 0, 2.5, -46.4);
    for (const sx of [-1, 1]) {
      post(15, sx * 33.5, 10, -46.3);
      post(12, sx * 14, 8.6, -46.3);
      for (const lx of [33.5, 24.5]) {
        add(A.geo.lampHousing, A.trimMat, sx * (lx - 4.4), 10.8, -46.6);
        add(A.geo.lamp, A.tailLampMat, sx * (lx - 4.4), 10.8, -47.85, this.body, false);
      }
    }
    add(A.geo.undertray, A.frameMat, 0, -3.5, -42);
    // drive shafts to each wheel
    for (const w of CAR.wheels) {
      const sx = Math.sign(w.x);
      const inner = 13, outer = Math.abs(w.x) + 7 - tyreHalf(w.r) * 0.4;
      const m = add(A.geo.shaft, A.frameMat, sx * (inner + outer) / 2, -CAR.restHeight + w.r, w.z, this.body, false);
      m.scale.x = outer - inner;
    }

    // big swept wing in body colour on leaning struts
    const wing = add(A.geo.wing, paint, 0, 51, -52);
    wing.rotation.x = 0.42;
    wing.scale.set(1.12, 1.1, 1.25);
    for (const sx of [-1, 1]) {
      const st = add(A.geo.strut, A.frameMat, sx * 14, 21, -33);
      st.scale.set(1, 1.42, 1.35);
      const ep = add(A.geo.endplate, paint, sx * 41.8, 51.5, -52);
      ep.rotation.x = 0.3;
      ep.scale.set(1, 1.2, 1.25);
    }

    // centre boost exhaust
    add(A.geo.pipe, A.chromeMat, 0, 6.5, -46.5);
    add(A.geo.pipeRim, A.chromeMat, 0, 6.5, -49.5, this.body, false);
    add(A.geo.pipeInner, A.darkMat, 0, 6.5, -48.6, this.body, false);

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
    this.flame.position.set(0, 6.5, -49);
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
    const gm = new THREE.Mesh(A.geo.pipeInner, glowMat);
    gm.position.set(0, 6.5, -48.4);
    this.exhaustGlow.add(gm);
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
        new THREE.Vector3(0, 35.6, 2), new THREE.Vector3(13, 34.2, -6), new THREE.Vector3(-13, 34.2, -6), new THREE.Vector3(13, 34.2, 9), new THREE.Vector3(-13, 34.2, 9),
        new THREE.Vector3(0, 15.5, 52), bodyPoint(51, 1, 0.42), bodyPoint(51, -1, 0.42), new THREE.Vector3(0, 3, 74.5),
        bodyPoint(8, 1, 0.55), bodyPoint(8, -1, 0.55), bodyPoint(-34, 1, 0.3), bodyPoint(-34, -1, 0.3), new THREE.Vector3(0, 41, -36), new THREE.Vector3(0, 18, -47),
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
