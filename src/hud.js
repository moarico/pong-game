import * as THREE from 'three';

// ---------------------------------------------------------------------------
// HUD: the samurai's life, foes' bars over their heads, wave banners, and a
// word for the big moments. Plain DOM, positioned from the 3D scene.
// ---------------------------------------------------------------------------

const _v = new THREE.Vector3();

export class Hud {
  constructor() {
    this.life = document.getElementById('hud-life');
    this.lifeFill = this.life.querySelector('i');
    this.lifeWound = this.life.querySelector('b');
    this.foesEl = document.getElementById('hud-foes');
    this.banner = document.getElementById('banner');
    this.bannerH = this.banner.querySelector('h2');
    this.bannerP = this.banner.querySelector('p');
    this.moment = document.getElementById('moment');
    this.fallen = document.getElementById('fallen');
    this.fallenP = this.fallen.querySelector('p');
    this.foes = new Map();
    this.lastLife = -1;
    this.bannerTimer = 0;
    this.momentTimer = 0;
    this.lifeShown = 0;
  }

  show(title, sub = '', secs = 3.2) {
    this.bannerH.textContent = title;
    this.bannerP.textContent = sub;
    this.banner.classList.add('on');
    this.bannerTimer = secs;
  }

  flash(text, secs = 1.1) {
    this.moment.textContent = text;
    this.moment.classList.add('on');
    this.momentTimer = secs;
  }

  setFallen(on, text = '') {
    this.fallen.classList.toggle('on', on);
    this.fallenP.textContent = text;
  }

  foeBar(enemy) {
    let el = this.foes.get(enemy);
    if (!el) {
      el = document.createElement('div');
      el.className = 'foe';
      el.innerHTML = '<div class="bar"><b></b><i></i></div>';
      this.foesEl.appendChild(el);
      el.fill = el.querySelector('i');
      el.wound = el.querySelector('b');
      el.last = -1;
      this.foes.set(enemy, el);
    }
    return el;
  }

  // dt in real (unscaled) seconds.
  update(dt, combat, enemies, camera, w, h) {
    // Life: shown once there is a fight, or when hurt.
    const frac = combat.hp / combat.maxHp;
    if (Math.abs(frac - this.lastLife) > 1e-3) {
      const pct = `${(frac * 100).toFixed(1)}%`;
      this.lifeFill.style.width = pct;
      this.lifeWound.style.width = pct;
      this.lastLife = frac;
    }
    const wantLife = combat.inCombat || frac < 0.999 || combat.dead;
    this.lifeShown = wantLife ? 4 : Math.max(0, this.lifeShown - dt);
    this.life.classList.toggle('on', this.lifeShown > 0);

    // Foes' bars.
    for (const e of enemies) {
      const el = this.foeBar(e);
      const show = e.active && e.alive && (e.shown > 0 || e.hp < e.maxHp || (e.token && e.state === 'attack'));
      if (show) {
        _v.copy(e.char.anim.headWorld);
        _v.y += 0.42 * e.char.scale;
        _v.project(camera);
        const onScreen = _v.z < 1 && Math.abs(_v.x) < 1.1 && Math.abs(_v.y) < 1.1;
        if (onScreen) {
          el.style.transform = `translate(${((_v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((0.5 - _v.y * 0.5) * h).toFixed(1)}px)`;
          const f = Math.max(0, e.hp / e.maxHp);
          if (Math.abs(f - el.last) > 1e-3) {
            el.fill.style.width = `${(f * 100).toFixed(1)}%`;
            el.wound.style.width = `${(f * 100).toFixed(1)}%`;
            el.last = f;
          }
        }
        el.classList.toggle('on', onScreen);
      } else {
        el.classList.remove('on');
      }
    }

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner.classList.remove('on');
    }
    if (this.momentTimer > 0) {
      this.momentTimer -= dt;
      if (this.momentTimer <= 0) this.moment.classList.remove('on');
    }
  }
}
