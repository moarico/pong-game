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
    this.bossEl = document.getElementById('boss-bar');
    this.bossName = this.bossEl.querySelector('.bb-name');
    this.bossSub = this.bossEl.querySelector('.bb-sub');
    this.bossFill = this.bossEl.querySelector('.bar i');
    this.bossWound = this.bossEl.querySelector('.bar b');
    this.bossLast = -1;
    this.boss = null;
    this.cardEl = document.getElementById('title-card');
    this.cardH = this.cardEl.querySelector('h1');
    this.cardP = this.cardEl.querySelector('p');
    this.cardTimer = 0;
    this.whiteEl = document.getElementById('whiteout');
    this.white = 0;
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

  // A boss's name across the top of the screen and its life beneath.
  setBoss(boss) {
    this.boss = boss;
    this.bossLast = -1;
    if (boss) {
      this.bossName.textContent = boss.name;
      this.bossSub.textContent = boss.epithet;
    }
    this.bossEl.classList.toggle('on', !!boss);
  }

  // The big cinematic caption (stage titles, the boss's name, victory).
  card(title, sub = '', secs = 4) {
    this.cardH.textContent = title;
    this.cardP.textContent = sub;
    this.cardEl.classList.add('on');
    this.cardTimer = secs;
  }

  // Blinded by a flash of light (fades on its own).
  whiteout(amount = 1) {
    this.white = Math.max(this.white, amount);
  }

  hideCard() {
    this.cardTimer = 0;
    this.cardEl.classList.remove('on');
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
    if (this.boss) {
      const f = Math.max(0, this.boss.hp / this.boss.maxHp);
      if (Math.abs(f - this.bossLast) > 1e-3) {
        this.bossFill.style.width = `${(f * 100).toFixed(2)}%`;
        this.bossWound.style.width = `${(f * 100).toFixed(2)}%`;
        this.bossLast = f;
      }
      this.bossEl.classList.toggle('stagger', this.boss.state === 'stagger');
    }
    if (this.white > 0 || this.whiteShown) {
      this.white = Math.max(0, this.white - dt * 0.55);
      const o = Math.min(1, this.white * 1.2);
      this.whiteEl.style.opacity = o.toFixed(3);
      this.whiteShown = o > 0;
    }
    if (this.cardTimer > 0) {
      this.cardTimer -= dt;
      if (this.cardTimer <= 0) this.cardEl.classList.remove('on');
    }
    for (const e of enemies) {
      if (e.isBoss) continue;
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
