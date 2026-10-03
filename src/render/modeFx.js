// Visuals for Heatseeker / Rumble: hook cables, tornado funnels, spikes,
// power-hitter glow, frozen ball, curveball and heatseeker trails.
import * as THREE from 'three';
import { S, BALL, TEAM_COLORS } from '../config.js';

const Y = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _f = new THREE.Vector3();
const _u = new THREE.Vector3();
const rand = (a, b) => a + Math.random() * (b - a);

function swirlTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,255,255,0.22)';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 256, w = 6 + Math.random() * 26;
    const grad = g.createLinearGradient(x, 0, x + w, 0);
    const a = 0.35 + Math.random() * 0.6;
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, `rgba(255,255,255,${a})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.save();
    g.translate(x, 128);
    g.transform(1, 0, -0.6, 1, 0, 0); // slanted streaks read as rotation
    g.fillRect(-w / 2, -160, w, 320);
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export class ModeFx {
  constructor(group, effects, mode) {
    this.group = group;
    this.effects = effects;
    this.mode = mode;
    this.time = 0;

    // hook cable (unit cylinder from y=0 to y=1) + claw
    this.cableGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
    this.cableGeo.translate(0, 0.5, 0);
    this.cableMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.5, 1.7) });
    this.clawGeo = new THREE.ConeGeometry(0.22, 0.5, 8);
    this.clawMat = new THREE.MeshStandardMaterial({ color: 0xcfd6e0, metalness: 1, roughness: 0.25, emissive: 0x3a4a60 });
    this.cables = new Map();

    // tornado funnel parts shared by every tornado
    this.swirl = swirlTexture();
    this.funnelGeos = [
      new THREE.CylinderGeometry(9.5, 1.4, 21, 40, 1, true),
      new THREE.CylinderGeometry(7, 1.0, 19, 40, 1, true),
      new THREE.CylinderGeometry(4.5, 0.7, 17, 32, 1, true),
    ].map((g) => { g.translate(0, g.parameters.height / 2, 0); return g; });
    this.tornados = new Map();

    // frozen ball shell
    this.ice = new THREE.Mesh(
      new THREE.IcosahedronGeometry(BALL.radius * S * 1.15, 1),
      new THREE.MeshStandardMaterial({ color: 0xcdeeff, emissive: 0x4a9fd8, emissiveIntensity: 0.6, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.55, flatShading: true, depthWrite: false }),
    );
    this.ice.visible = false;
    group.add(this.ice);
  }

  cableFor(car) {
    let c = this.cables.get(car);
    if (!c) {
      const cable = new THREE.Mesh(this.cableGeo, this.cableMat);
      const claw = new THREE.Mesh(this.clawGeo, this.clawMat);
      cable.frustumCulled = false;
      this.group.add(cable, claw);
      c = { cable, claw };
      this.cables.set(car, c);
    }
    return c;
  }

  tornadoFor(car) {
    let t = this.tornados.get(car);
    if (!t) {
      const g = new THREE.Group();
      const parts = this.funnelGeos.map((geo, i) => {
        const tex = this.swirl.clone();
        tex.needsUpdate = true;
        tex.repeat.set(3 + i, 1);
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
          map: tex, color: i === 2 ? 0xf0ece4 : 0xd2c8b6, transparent: true, opacity: [0.62, 0.7, 0.45][i],
          depthWrite: false, side: THREE.DoubleSide, blending: i === 2 ? THREE.AdditiveBlending : THREE.NormalBlending,
        }));
        m.renderOrder = 6;
        g.add(m);
        return { m, tex, speed: [2.2, -3.1, 4.5][i] };
      });
      this.group.add(g);
      t = { g, parts, grow: 0 };
      this.tornados.set(car, t);
    }
    return t;
  }

  // players: [{car, model, ipos, iquat}], ballPos in uu (interpolated)
  update(dt, players, ballMesh, ballPos) {
    this.time += dt;
    const mode = this.mode;
    const ball = mode.world.ball;
    const fx = this.effects;

    // heatseeker / curveball ball glow trail
    let trailTeam = -1;
    if (mode.name === 'heatseeker' && mode.team >= 0) trailTeam = mode.team;
    if (mode.name === 'rumble' && mode.curve) trailTeam = mode.curve.team;
    if (trailTeam >= 0 && ballMesh.visible) {
      const tc = TEAM_COLORS[trailTeam];
      const n = Math.max(1, Math.round(dt * 90 * fx.mult));
      for (let i = 0; i < n; i++) {
        fx.glow.emit(ballPos.x * S + rand(-0.4, 0.4), ballPos.y * S + rand(-0.4, 0.4), ballPos.z * S + rand(-0.4, 0.4), 0, rand(0, 0.5), 0,
          rand(0.3, 0.55), rand(0.7, 1.1), 0.15, [tc.flame[0] * 1.6, tc.flame[1] * 1.6, tc.flame[2] * 1.6, 0.6], [tc.flameEnd[0], tc.flameEnd[1], tc.flameEnd[2], 0], 1.5, 0);
      }
      ballMesh.material.emissiveIntensity = 3.2 + Math.sin(this.time * 12) * 0.6;
    } else {
      ballMesh.material.emissiveIntensity = 2.4;
    }

    // frozen ball
    const iced = ball.iceTimer > 0;
    this.ice.visible = iced && ballMesh.visible;
    if (iced) {
      this.ice.position.copy(ballMesh.position);
      this.ice.rotation.y += dt * 0.4;
      if (Math.random() < dt * 20) fx.glow.emit(ballMesh.position.x + rand(-1, 1), ballMesh.position.y + rand(-1, 1), ballMesh.position.z + rand(-1, 1), 0, -0.3, 0, 0.6, 0.12, 0.02, [1.6, 2, 2.4, 0.8], [0.6, 0.9, 1.4, 0], 0, 0);
    }

    if (mode.name !== 'rumble') return;
    const seenCables = new Set();
    const seenTornados = new Set();
    for (const p of players) {
      const car = p.car;
      const s = mode.st(car);
      const a = s.active;
      // power hitter glow + spikes on the model
      p.model.setPower(!!a && a.type === 'power', this.time);
      p.model.setSpikes(!!a && a.type === 'spikes');
      if (!a || car.demolished) continue;
      if ((a.type === 'grapple' || a.type === 'plunger') && p.ipos) {
        const c = this.cableFor(car);
        seenCables.add(car);
        _f.set(0, 0, 1).applyQuaternion(p.iquat);
        _u.set(0, 1, 0).applyQuaternion(p.iquat);
        _a.copy(p.ipos).addScaledVector(_f, 55).addScaledVector(_u, 28).multiplyScalar(S);
        const hook = a.phase === 'pull' ? ballPos : a.hook;
        _b.copy(hook).multiplyScalar(S);
        if (a.phase === 'pull') _b.addScaledVector(_a.clone().sub(_b).normalize(), BALL.radius * S * 0.9);
        const d = _a.distanceTo(_b);
        c.cable.position.copy(_a);
        c.cable.quaternion.setFromUnitVectors(Y, _b.clone().sub(_a).normalize());
        c.cable.scale.set(0.05, Math.max(0.01, d), 0.05);
        c.claw.position.copy(_b);
        c.claw.quaternion.copy(c.cable.quaternion);
        c.cable.visible = c.claw.visible = true;
      }
      if (a.type === 'tornado' && p.ipos) {
        const t = this.tornadoFor(car);
        seenTornados.add(car);
        const life = Math.min(1, a.t / 0.5) * Math.min(1, (a.dur - a.t) / 0.6);
        t.grow = life;
        t.g.visible = true;
        t.g.position.set(p.ipos.x * S, 0, p.ipos.z * S);
        t.g.scale.set(0.3 + 0.7 * life, life, 0.3 + 0.7 * life);
        for (const part of t.parts) {
          part.m.rotation.y += part.speed * dt;
          part.tex.offset.y -= dt * 0.6;
        }
        // dust kicked up and spun around the base
        const n = Math.round(dt * 70 * fx.mult);
        for (let i = 0; i < n; i++) {
          const ang = Math.random() * Math.PI * 2, r = rand(1, 6);
          const x = t.g.position.x + Math.cos(ang) * r, z = t.g.position.z + Math.sin(ang) * r;
          fx.smoke.emit(x, rand(0, 1.5), z, -Math.sin(ang) * 9, rand(3, 9), Math.cos(ang) * 9, rand(0.8, 1.6), rand(0.8, 1.4), rand(2.4, 4),
            [0.45, 0.4, 0.33, 0.45], [0.3, 0.28, 0.25, 0], 0.8, -1, rand(-2, 2));
        }
      }
    }
    for (const [car, c] of this.cables) if (!seenCables.has(car)) c.cable.visible = c.claw.visible = false;
    for (const [car, t] of this.tornados) if (!seenTornados.has(car)) t.g.visible = false;
  }
}
