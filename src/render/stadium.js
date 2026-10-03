import * as THREE from 'three';
import { ARENA, S, TEAM_COLORS } from '../config.js';
import { wallOutline } from '../arena.js';
import * as T from './textures.js';

const { halfX: HX, halfZ: HZ, height: H, rampR: RR, goalHalfW: GW, goalH: GH, goalDepth: GD } = ARENA;

export const PRESETS = {
  night: {
    skyTop: 0x02060f, skyHorizon: 0x1b2f5a, skyBottom: 0x04070d, sunDir: [0.25, 0.75, -0.6], sunColor: 0x9fb8ff, sunGlow: 0.0,
    stars: 1, hemiSky: 0x9fb8ff, hemiGround: 0x1f2a18, hemi: 0.75, key: 0xe6eeff, keyI: 2.4, keyDir: [0.35, 1, 0.25],
    fog: 0x0b1530, fogDensity: 0.0011, envI: 0.75, exposure: 1.05, winLit: 0.55, bldg: 0x070a12,
  },
  sunset: {
    skyTop: 0x203a78, skyHorizon: 0xffa66a, skyBottom: 0x2a1a20, sunDir: [0.78, 0.07, 0.62], sunColor: 0xffb070, sunGlow: 1.0,
    stars: 0, hemiSky: 0xffd9b8, hemiGround: 0x2c2117, hemi: 0.85, key: 0xffc08a, keyI: 3.2, keyDir: [0.75, 0.32, 0.58],
    fog: 0xb07a68, fogDensity: 0.0012, envI: 0.9, exposure: 1.0, winLit: 0.3, bldg: 0x1a1620,
  },
};

function skyMaterial(p) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(p.skyTop) },
      uHorizon: { value: new THREE.Color(p.skyHorizon) },
      uBottom: { value: new THREE.Color(p.skyBottom) },
      uSunDir: { value: new THREE.Vector3(...p.sunDir).normalize() },
      uSunColor: { value: new THREE.Color(p.sunColor) },
      uSunGlow: { value: p.sunGlow },
      uStars: { value: p.stars },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHorizon, uBottom, uSunDir, uSunColor;
      uniform float uSunGlow, uStars;
      varying vec3 vDir;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.42));
        if (h < 0.0) col = mix(uHorizon, uBottom, clamp(-h * 5.0, 0.0, 1.0));
        float sd = max(dot(d, uSunDir), 0.0);
        col += uSunColor * (pow(sd, 900.0) * 40.0 + pow(sd, 18.0) * 0.6 + pow(sd, 4.0) * 0.25) * uSunGlow;
        // thin streaky clouds
        vec2 cp = d.xz / max(h + 0.12, 0.05);
        float cl = sin(cp.x * 1.7 + sin(cp.y * 0.9) * 2.0) * sin(cp.y * 2.3 + cp.x * 0.4);
        cl = smoothstep(0.55, 1.0, cl) * smoothstep(0.02, 0.25, h) * (1.0 - smoothstep(0.4, 0.9, h));
        col = mix(col, mix(uHorizon * 1.15, uSunColor, 0.4 * uSunGlow), cl * 0.35);
        vec3 sp = d * 420.0;
        float star = step(0.9982, hash(floor(sp))) * uStars * smoothstep(0.05, 0.35, h);
        col += vec3(star) * (0.6 + 0.4 * hash(floor(sp) + 3.1));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

function buildingMaterial(p) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: new THREE.Color(p.bldg) },
      uWin: { value: new THREE.Color(1.0, 0.82, 0.55) },
      uLit: { value: p.winLit },
      uFog: { value: new THREE.Color(p.fog) },
      uFogD: { value: p.fogDensity * 0.55 },
      uSunDir: { value: new THREE.Vector3(...p.sunDir).normalize() },
      uSunColor: { value: new THREE.Color(p.sunColor).multiplyScalar(p.sunGlow) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld; varying vec3 vN; varying float vSeed;
      void main() {
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vSeed = instanceMatrix[3].x * 0.013 + instanceMatrix[3].z * 0.071;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase, uWin, uFog, uSunDir, uSunColor; uniform float uLit, uFogD;
      varying vec3 vWorld; varying vec3 vN; varying float vSeed;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 n = normalize(vN);
        vec3 col = uBase;
        if (abs(n.y) < 0.5) {
          vec2 f = abs(n.x) > 0.5 ? vWorld.zy : vWorld.xy;
          vec2 cell = f / vec2(3.4, 3.8);
          vec2 id = floor(cell);
          vec2 fr = fract(cell);
          float win = step(0.16, fr.x) * step(fr.x, 0.84) * step(0.22, fr.y) * step(fr.y, 0.82);
          float lit = step(1.0 - uLit, hash(id + vSeed));
          float floorLit = step(0.25, hash(vec2(id.y, vSeed)));
          col += win * (lit * floorLit * uWin * (0.5 + hash(id * 1.7 + vSeed) * 1.2) + vec3(0.015, 0.02, 0.03));
          col += uSunColor * max(dot(n, uSunDir), 0.0) * 0.18 * (0.4 + win);
        } else {
          col *= 0.7;
        }
        float dist = length(vWorld - cameraPosition);
        float fogF = 1.0 - exp(-uFogD * uFogD * dist * dist);
        col = mix(col, uFog, clamp(fogF, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// Builds a strip of quads following a closed outline with a (offset, height) profile.
// offsets are measured along the stored inward normal (negative = outward).
function stripGeometry(pts, profile, { uLen = 1000, vOf = (j, y) => y / 1000, skip = null, colorOf = null } = {}) {
  const ring = pts.concat([{ ...pts[0], s: pts.total }]);
  const N = ring.length, M = profile.length;
  const pos = new Float32Array(N * M * 3);
  const uv = new Float32Array(N * M * 2);
  const col = colorOf ? new Float32Array(N * M * 3) : null;
  const sAcc = new Float32Array(M);
  const prev = [];
  for (let i = 0; i < N; i++) {
    const p = ring[i];
    for (let j = 0; j < M; j++) {
      const [w, y] = profile[j];
      const x = p.x + p.nx * w, z = p.z + p.nz * w;
      if (i > 0) sAcc[j] += Math.hypot(x - prev[j][0], z - prev[j][1]);
      prev[j] = [x, z];
      const k = i * M + j;
      pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
      uv[k * 2] = sAcc[j] / uLen;
      uv[k * 2 + 1] = vOf(j, y);
      if (col) {
        const c = colorOf(x, y, z);
        col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2];
      }
    }
  }
  const idx = [];
  for (let i = 0; i < N - 1; i++) {
    for (let j = 0; j < M - 1; j++) {
      if (skip && skip(ring[i], ring[i + 1], profile[j], profile[j + 1])) continue;
      const a = i * M + j, b = (i + 1) * M + j, c = (i + 1) * M + j + 1, d = i * M + j + 1;
      idx.push(a, d, b, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  if (col) g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const isBack = (p) => p.wall === 'orange' || p.wall === 'blue';
// skip the goal openings on the back walls
function goalCut(maxY, extra = 0.5) {
  return (p0, p1, a, b) => isBack(p0) && isBack(p1) && Math.abs(p0.x) <= GW + extra && Math.abs(p1.x) <= GW + extra && Math.max(a[1], b[1]) <= maxY + 0.5;
}

function teamTint(z, strength = 1) {
  const t = THREE.MathUtils.smoothstep(z, -2500, 2500);
  const b = new THREE.Color(TEAM_COLORS[0].main), o = new THREE.Color(TEAM_COLORS[1].main);
  const c = b.lerp(o, t);
  return [c.r * strength, c.g * strength, c.b * strength];
}

function floorShapeGeometry(pts, inset) {
  const contour = [];
  for (const p of pts) {
    const x = p.x + p.nx * inset, z = p.z + p.nz * inset;
    if (isBack(p)) {
      const s = p.wall === 'orange' ? 1 : -1;
      const first = s > 0 ? GW : -GW; // outline runs -x on orange, +x on blue
      if (Math.abs(p.x - first) < 0.5) {
        contour.push([x, z], [first, s * (HZ + GD)], [-first, s * (HZ + GD)]);
        continue;
      }
      if (Math.abs(p.x) < GW - 0.5) continue;
    }
    contour.push([x, z]);
  }
  const shape = new THREE.Shape(contour.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + T.FIELD_TEX.halfX) / (2 * T.FIELD_TEX.halfX), (pos.getZ(i) - T.FIELD_TEX.minZ) / (T.FIELD_TEX.maxZ - T.FIELD_TEX.minZ));
  }
  return g;
}

export function buildStadium(renderer, scene, opts) {
  const preset = PRESETS[opts.timeOfDay] || PRESETS.night;
  const quality = opts.quality;
  const root = new THREE.Group();
  const arena = new THREE.Group(); // in uu
  arena.scale.setScalar(S);
  root.add(arena);
  scene.add(root);
  const anim = [];

  scene.fog = new THREE.FogExp2(preset.fog, preset.fogDensity * 0.35);

  // ---- sky + city
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2500, 48, 24), skyMaterial(preset));
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  root.add(sky);

  const rnd = T.rng(42);
  const bGeo = new THREE.BoxGeometry(1, 1, 1);
  bGeo.translate(0, 0.5, 0);
  const nB = 190;
  const buildings = new THREE.InstancedMesh(bGeo, buildingMaterial(preset), nB);
  const m = new THREE.Matrix4();
  for (let i = 0; i < nB; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 170 + rnd() * 380 + (rnd() < 0.3 ? 250 : 0);
    const w = 18 + rnd() * 40, d = 18 + rnd() * 40;
    const h = 30 + Math.pow(rnd(), 2) * 260 + (r > 400 ? 60 : 0);
    m.compose(new THREE.Vector3(Math.cos(a) * r, -5, Math.sin(a) * r * 1.2), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 0.6), new THREE.Vector3(w, h, d));
    buildings.setMatrixAt(i, m);
  }
  root.add(buildings);
  // ground outside the stadium
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1400, 48), new THREE.MeshStandardMaterial({ color: 0x0d0f12, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -6;
  root.add(ground);

  // ---- lights
  const hemi = new THREE.HemisphereLight(preset.hemiSky, preset.hemiGround, preset.hemi);
  root.add(hemi);
  const key = new THREE.DirectionalLight(preset.key, preset.keyI);
  const kd = new THREE.Vector3(...preset.keyDir).normalize();
  key.position.copy(kd).multiplyScalar(90);
  key.target.position.set(0, 0, 0);
  root.add(key, key.target);
  if (quality !== 'low') {
    key.castShadow = true;
    const sz = quality === 'high' ? 2048 : 1024;
    key.shadow.mapSize.set(sz, sz);
    const c = key.shadow.camera;
    c.left = -60; c.right = 60; c.top = 70; c.bottom = -70; c.near = 10; c.far = 220;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
  }

  // ---- field
  const pts = wallOutline(200, 6);
  const fieldTex = T.fieldTexture(quality);
  const grass = T.grassDetailTexture();
  const bump = grass.clone();
  bump.repeat.set(40, 58);
  bump.needsUpdate = true;
  const floorGeo = floorShapeGeometry(pts, RR);
  const floorMat = new THREE.MeshStandardMaterial({ map: fieldTex, roughness: 0.92, metalness: 0, bumpMap: bump, bumpScale: 0.6 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.receiveShadow = true;
  arena.add(floor);

  if (quality === 'high') {
    // grass shells: stacked alpha-tested layers that give the turf some depth
    const shellTex = grass.clone();
    shellTex.repeat.set(32, 47);
    shellTex.needsUpdate = true;
    const layers = 5;
    for (let i = 1; i <= layers; i++) {
      const mat = new THREE.MeshStandardMaterial({
        map: fieldTex, alphaMap: shellTex, alphaTest: 0.25 + (i / layers) * 0.55, roughness: 0.95,
        color: new THREE.Color().setScalar(0.85 + i * 0.05),
      });
      const shell = new THREE.Mesh(floorGeo, mat);
      shell.position.y = i * 1.4;
      shell.receiveShadow = true;
      arena.add(shell);
    }
  }

  // ---- arena walls
  const rampProfile = [];
  for (let k = 0; k <= 10; k++) {
    const a = (Math.PI / 2) * (1 - k / 10);
    rampProfile.push([RR - RR * Math.cos(a), RR - RR * Math.sin(a)]);
  }
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x1b2027, roughness: 0.55, metalness: 0.35, vertexColors: true, side: THREE.DoubleSide });
  const ramp = new THREE.Mesh(
    stripGeometry(pts, rampProfile, { uLen: 400, skip: goalCut(GH), colorOf: (x, y, z) => { const c = teamTint(z, 0.35); return [0.55 + c[0], 0.55 + c[1], 0.55 + c[2]]; } }),
    rampMat,
  );
  ramp.receiveShadow = true;
  arena.add(ramp);

  // LED strip at the top of the ramp
  const ledProfile = [[0, RR - 4], [0, RR + 14]];
  const led = new THREE.Mesh(
    stripGeometry(pts, ledProfile, { skip: goalCut(GH), colorOf: (x, y, z) => teamTint(z, 4.0) }),
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false }),
  );
  arena.add(led);

  // ad boards
  const ads = T.adTexture();
  const bandTop = RR + 230;
  const band = new THREE.Mesh(
    stripGeometry(pts, [[0, RR + 14], [0, bandTop]], { uLen: 4200, vOf: (j) => j, skip: goalCut(GH) }),
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffffff, emissiveMap: ads, emissiveIntensity: 1.1, map: ads, roughness: 0.4, side: THREE.DoubleSide }),
  );
  arena.add(band);
  anim.push((dt) => { ads.offset.x = (ads.offset.x + dt * 0.012) % 1; });

  // glass walls with a faint hex pattern
  const hex = T.hexTexture(3);
  const glassProfile = [[0, bandTop], [0, GH], [0, 1100], [0, H - RR]];
  for (let k = 1; k <= 8; k++) {
    const a = (Math.PI / 2) * (k / 8);
    glassProfile.push([RR - RR * Math.cos(a), H - RR + RR * Math.sin(a)]);
  }
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7fa6d8, emissive: 0x9cc8ff, emissiveMap: hex, emissiveIntensity: 0.16,
    alphaMap: hex, transparent: true, opacity: 0.32, depthWrite: false, roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide,
  });
  hex.repeat.set(1, 1);
  const glass = new THREE.Mesh(stripGeometry(pts, glassProfile, { uLen: 900, vOf: (j, y) => y / 1040, skip: goalCut(GH) }), glassMat);
  glass.renderOrder = 2;
  arena.add(glass);
  // a very faint backing so the walls read as a surface
  const tint = new THREE.Mesh(glass.geometry, new THREE.MeshBasicMaterial({ color: 0x4a78b8, transparent: true, opacity: 0.045, depthWrite: false, side: THREE.DoubleSide }));
  tint.renderOrder = 1;
  arena.add(tint);
  // ceiling
  const ceilGeo = floorShapeGeometry(pts.map((p) => ({ ...p, wall: 'side' })), RR);
  ceilGeo.translate(0, H, 0);
  const ceilUv = ceilGeo.attributes.uv;
  for (let i = 0; i < ceilUv.count; i++) ceilUv.setXY(i, ceilGeo.attributes.position.getX(i) / 900, ceilGeo.attributes.position.getZ(i) / 1040);
  const ceil = new THREE.Mesh(ceilGeo, glassMat.clone());
  ceil.material.opacity = 0.07;
  ceil.material.emissiveIntensity = 0.05;
  ceil.renderOrder = 2;
  arena.add(ceil);

  // ramp side faces at the goal mouths
  const capPos = [];
  for (const s of [1, -1]) for (const sx of [1, -1]) {
    const x = sx * GW;
    const corner = [x, 0, s * HZ];
    for (let k = 0; k < rampProfile.length - 1; k++) {
      const [w0, y0] = rampProfile[k], [w1, y1] = rampProfile[k + 1];
      capPos.push(...corner, x, y0, s * (HZ - w0), x, y1, s * (HZ - w1));
    }
  }
  const capGeo = new THREE.BufferGeometry();
  capGeo.setAttribute('position', new THREE.Float32BufferAttribute(capPos, 3));
  capGeo.computeVertexNormals();
  arena.add(new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide })));

  // ---- goals
  const goalLights = [];
  for (const team of [0, 1]) {
    const s = team === 0 ? -1 : 1;
    const tc = TEAM_COLORS[team];
    const g = new THREE.Group();
    const netTex = T.hexTexture(4, 256);
    netTex.repeat.set(GD / 300, GH / 300);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10, emissive: tc.main, emissiveMap: netTex, emissiveIntensity: 1.4, roughness: 0.6, metalness: 0.2, side: THREE.DoubleSide,
    });
    const backTex = netTex.clone(); backTex.repeat.set((2 * GW) / 300, GH / 300); backTex.needsUpdate = true;
    const backMat = netMat.clone(); backMat.emissiveMap = backTex;
    const side1 = new THREE.Mesh(new THREE.PlaneGeometry(GD, GH), netMat);
    side1.rotation.y = Math.PI / 2;
    side1.position.set(GW, GH / 2, s * (HZ + GD / 2));
    const side2 = side1.clone();
    side2.position.x = -GW;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(2 * GW, GH), backMat);
    back.position.set(0, GH / 2, s * (HZ + GD));
    const topTex = netTex.clone(); topTex.repeat.set((2 * GW) / 300, GD / 300); topTex.needsUpdate = true;
    const topMat = netMat.clone(); topMat.emissiveMap = topTex; topMat.emissiveIntensity = 0.8;
    const top = new THREE.Mesh(new THREE.PlaneGeometry(2 * GW, GD), topMat);
    top.rotation.x = Math.PI / 2;
    top.position.set(0, GH, s * (HZ + GD / 2));
    g.add(side1, side2, back, top);
    // glowing frame
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: tc.main, emissiveIntensity: 4.5, roughness: 0.3, metalness: 0.6 });
    const dimFrameMat = new THREE.MeshStandardMaterial({ color: 0x2a2d33, emissive: tc.main, emissiveIntensity: 1.2, roughness: 0.4, metalness: 0.7 });
    const post = new THREE.BoxGeometry(46, GH + 46, 46);
    for (const sx of [-1, 1]) {
      const pm = new THREE.Mesh(post, frameMat);
      pm.position.set(sx * (GW + 23), (GH + 46) / 2, s * (HZ + 23));
      g.add(pm);
      const rear = new THREE.Mesh(new THREE.BoxGeometry(36, GH, 36), dimFrameMat);
      rear.position.set(sx * (GW + 18), GH / 2, s * (HZ + GD));
      g.add(rear);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(30, 30, GD), dimFrameMat);
      beam.position.set(sx * (GW + 15), GH + 15, s * (HZ + GD / 2));
      g.add(beam);
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2 * GW + 92, 46, 46), frameMat);
    bar.position.set(0, GH + 23, s * (HZ + 23));
    const rearBar = new THREE.Mesh(new THREE.BoxGeometry(2 * GW + 72, 30, 30), dimFrameMat);
    rearBar.position.set(0, GH + 15, s * (HZ + GD));
    g.add(bar, rearBar);
    // outer arch above the goal like a stadium gate
    const arch = new THREE.Mesh(new THREE.BoxGeometry(2 * GW + 500, 70, 80), dimFrameMat);
    arch.position.set(0, GH + 260, s * (HZ + 60));
    g.add(arch);
    arena.add(g);
    const pl = new THREE.PointLight(tc.main, 0, 40, 2);
    pl.position.set(0, 3.5, s * (HZ + GD * 0.6) * S);
    root.add(pl);
    goalLights.push({ light: pl, frameMat, netMat: [netMat, backMat, topMat], base: 4.5 });
  }

  // ---- stands
  const crowd = T.crowdTexture();
  const standMat = new THREE.MeshStandardMaterial({ map: crowd, roughness: 0.95, emissive: 0xffffff, emissiveMap: crowd, emissiveIntensity: 0.07, side: THREE.DoubleSide });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x15181e, roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const lower = [[-60, 720], [-1200, 1240], [-2300, 1760], [-3300, 2300]];
  const upper = [[-3300, 2780], [-4200, 3250], [-5100, 3720], [-5900, 4150]];
  const slopeV = (prof) => {
    let acc = 0;
    const vs = [0];
    for (let k = 1; k < prof.length; k++) { acc += Math.hypot(prof[k][0] - prof[k - 1][0], prof[k][1] - prof[k - 1][1]); vs.push(acc); }
    return (j) => vs[j] / 900;
  };
  arena.add(new THREE.Mesh(stripGeometry(pts, lower, { uLen: 3400, vOf: slopeV(lower) }), standMat));
  arena.add(new THREE.Mesh(stripGeometry(pts, upper, { uLen: 3400, vOf: slopeV(upper) }), standMat));
  // front wall below the lower bowl (cut around the goals)
  const front = new THREE.Mesh(stripGeometry(pts, [[-60, 0], [-60, GH + 40], [-60, 720]], { uLen: 4200, vOf: (j) => (j === 0 ? 0 : j === 1 ? 0.5 : 1), skip: goalCut(GH + 40, 60) }), darkMat);
  arena.add(front);
  // ribbon LED board between the decks
  const ribbonTex = T.adTexture();
  const ribbon = new THREE.Mesh(
    stripGeometry(pts, [[-3300, 2300], [-3300, 2780]], { uLen: 5200, vOf: (j) => j }),
    new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0xffffff, emissiveMap: ribbonTex, emissiveIntensity: 1.6, side: THREE.DoubleSide }),
  );
  arena.add(ribbon);
  anim.push((dt) => { ribbonTex.offset.x = (ribbonTex.offset.x - dt * 0.02) % 1; });
  // back wall with a light rim, then an open canopy so the sky and city show above the field
  arena.add(new THREE.Mesh(stripGeometry(pts, [[-5900, 4150], [-5900, 4650]], { uLen: 2000 }), darkMat));
  const rimMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide });
  arena.add(new THREE.Mesh(stripGeometry(pts, [[-5900, 4650], [-5900, 4700]], { colorOf: (x, y, z) => teamTint(z, 2.2) }), rimMat));
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x0e1014, roughness: 0.8, metalness: 0.4, side: THREE.DoubleSide });
  arena.add(new THREE.Mesh(stripGeometry(pts, [[-6500, 5350], [-4200, 5220], [-1900, 5120]], { uLen: 2000 }), roofMat));
  arena.add(new THREE.Mesh(stripGeometry(pts, [[-1900, 5120], [-1900, 5020]], { uLen: 2000 }), darkMat));

  // trusses with light strips spanning the open roof
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.6, metalness: 0.7 });
  const lightMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4.2, 4.2, 4.0), fog: false });
  const trussZ = [-3700, -1250, 1250, 3700];
  const lightGeo = new THREE.BoxGeometry(150, 14, 60);
  const lightCount = trussZ.length * 30 + 160;
  const lights = new THREE.InstancedMesh(lightGeo, lightMat, lightCount);
  let li = 0;
  for (const z of trussZ) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2 * HX + 4400, 200, 140), trussMat);
    beam.position.set(0, 5560, z);
    arena.add(beam);
    const chord = new THREE.Mesh(new THREE.BoxGeometry(2 * HX + 4400, 60, 60), trussMat);
    chord.position.set(0, 5180, z);
    arena.add(chord);
    for (let k = 0; k < 30; k++) {
      const x = -HX - 1300 + (k * (2 * HX + 2600)) / 29;
      m.makeTranslation(x, 5140, z);
      lights.setMatrixAt(li++, m);
    }
  }
  // floodlight banks along the canopy edge
  const ringPts = wallOutline(420, 3);
  for (const p of ringPts) {
    if (li >= lightCount) break;
    const x = p.x - p.nx * 1950, z = p.z - p.nz * 1950;
    m.makeRotationY(Math.atan2(p.nx, p.nz));
    m.setPosition(x, 5010, z);
    lights.setMatrixAt(li++, m);
  }
  lights.count = li;
  arena.add(lights);

  // ---- boost pads
  const pads = [];
  const padBaseMat = new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.4, metalness: 0.7 });
  const smallGeo = new THREE.CylinderGeometry(70, 80, 6, 32);
  const bigBaseGeo = new THREE.CylinderGeometry(150, 175, 14, 40);
  const ringGeo = new THREE.TorusGeometry(64, 7, 8, 40);
  const bigRingGeo = new THREE.TorusGeometry(140, 10, 8, 48);
  const orbGeo = new THREE.SphereGeometry(52, 24, 16);
  const coneGeo = new THREE.CylinderGeometry(70, 150, 260, 32, 1, true);
  for (const pad of opts.pads) {
    const grp = new THREE.Group();
    grp.position.set(pad.x, 0, pad.z);
    const glowMat = new THREE.MeshStandardMaterial({ color: 0x331a00, emissive: 0xffa21f, emissiveIntensity: pad.big ? 2.6 : 1.4 });
    glowMat.userData.base = pad.big ? 2.6 : 1.4;
    if (pad.big) {
      const base = new THREE.Mesh(bigBaseGeo, padBaseMat);
      base.position.y = 4;
      const ring = new THREE.Mesh(bigRingGeo, glowMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 12;
      const orb = new THREE.Mesh(orbGeo, new THREE.MeshStandardMaterial({ color: 0xffa020, emissive: 0xff8c10, emissiveIntensity: 3.5, roughness: 0.2 }));
      orb.position.y = 110;
      const cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: 0xff9a30, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.y = 135;
      grp.add(base, ring, orb, cone);
      pads.push({ pad, grp, ring, orb, cone, glowMat });
    } else {
      const base = new THREE.Mesh(smallGeo, padBaseMat);
      base.position.y = 2;
      const ring = new THREE.Mesh(ringGeo, glowMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 6;
      const core = new THREE.Mesh(new THREE.CircleGeometry(40, 24), glowMat);
      core.rotation.x = -Math.PI / 2;
      core.position.y = 6;
      grp.add(base, ring, core);
      pads.push({ pad, grp, ring, glowMat });
    }
    arena.add(grp);
  }

  // ---- environment map for reflections
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMaterial(preset)));
  const envLight = new THREE.MeshBasicMaterial({ color: new THREE.Color(12, 12, 11) });
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 4), envLight);
    b.position.set(Math.cos(a) * 30, 30, Math.sin(a) * 36);
    b.lookAt(0, 0, 0);
    envScene.add(b);
  }
  const envFloor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x1d3a18 }));
  envFloor.rotation.x = -Math.PI / 2;
  envFloor.position.y = -2;
  envScene.add(envFloor);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(envScene, 0.03).texture;
  pmrem.dispose();
  scene.environment = env;
  scene.environmentIntensity = preset.envI;

  // crowd bounce when someone scores
  let cheer = 0;
  let time = 0;
  anim.push((dt) => {
    time += dt;
    cheer = Math.max(0, cheer - dt * 0.18);
    crowd.offset.y = cheer > 0 ? Math.abs(Math.sin(time * 14)) * 0.012 * Math.min(1, cheer * 2) : 0;
    for (const p of pads) {
      const on = p.pad.active;
      if (p.orb) {
        p.orb.visible = on;
        p.cone.visible = on;
        p.orb.position.y = 110 + Math.sin(time * 2.2 + p.pad.x) * 12;
        p.orb.rotation.y += dt;
      }
      const b = p.glowMat.userData.base;
      p.glowMat.emissiveIntensity = on ? b * (1 + Math.sin(time * 4 + p.pad.z) * 0.18) : 0.12;
    }
    for (const gl of goalLights) {
      gl.light.intensity = Math.max(0, gl.light.intensity - dt * 900);
      gl.frameMat.emissiveIntensity += (gl.base - gl.frameMat.emissiveIntensity) * Math.min(1, dt * 1.5);
    }
  });

  return {
    root,
    exposure: preset.exposure,
    bindPads(list) { pads.forEach((p, i) => { if (list[i]) p.pad = list[i]; }); },
    dispose() {
      scene.remove(root);
      const seen = new Set();
      root.traverse((o) => {
        if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
        const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        for (const m of mats) {
          if (seen.has(m)) continue;
          seen.add(m);
          for (const k in m) if (m[k] && m[k].isTexture && !seen.has(m[k])) { seen.add(m[k]); m[k].dispose(); }
          m.dispose();
        }
      });
      env.dispose();
      scene.environment = null;
      scene.fog = null;
    },
    update(dt) { for (const f of anim) f(dt); },
    cheer(amount = 1) { cheer = Math.max(cheer, amount); },
    goalFlash(team) {
      const gl = goalLights[team];
      gl.light.intensity = 2500;
      gl.frameMat.emissiveIntensity = 14;
    },
  };
}
