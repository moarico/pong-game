import { makeRng } from './util.js';

// Procedurally painted key art for the title and loading screens (original artwork).

function islandPath(c, rng, x0, x1, base, height, bumps) {
  c.beginPath();
  c.moveTo(x0, base);
  const n = bumps;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const env = Math.sin(t * Math.PI);
    const y = base - env * height * (0.6 + rng() * 0.4);
    c.lineTo(x, y);
  }
  c.lineTo(x1, base);
  c.closePath();
}

function cloud(c, x, y, s, alpha) {
  c.fillStyle = `rgba(255,255,255,${alpha})`;
  for (const [dx, dy, r] of [[0, 0, 1], [0.9, 0.15, 0.75], [-0.9, 0.2, 0.7], [0.4, -0.45, 0.7], [-0.35, -0.35, 0.6]]) {
    c.beginPath();
    c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
    c.fill();
  }
}

function balloonBus(c, x, y, s) {
  const cols = ['#e84a5f', '#ffffff', '#2f6dd0', '#f0c040'];
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  for (let i = 0; i < 8; i++) {
    c.fillStyle = cols[i % 4];
    c.beginPath();
    c.ellipse(0, 0, 60 - i * 7.5, 70, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = 'rgba(0,0,0,0.15)';
  c.beginPath();
  c.ellipse(18, 10, 40, 60, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#d8d0c0';
  c.lineWidth = 2;
  for (const dx of [-40, -14, 14, 40]) {
    c.beginPath();
    c.moveTo(dx * 0.8, 58);
    c.lineTo(dx * 0.9, 118);
    c.stroke();
  }
  c.fillStyle = '#2f6dd0';
  c.fillRect(-55, 112, 110, 44);
  c.fillStyle = '#bfe4ff';
  for (let i = 0; i < 5; i++) c.fillRect(-48 + i * 21, 118, 16, 14);
  c.fillStyle = '#f0c040';
  c.fillRect(-55, 140, 110, 6);
  c.fillStyle = '#1e1e1e';
  c.beginPath();
  c.arc(-32, 157, 9, 0, Math.PI * 2);
  c.arc(32, 157, 9, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#ff9a30';
  c.beginPath();
  c.arc(0, 76, 9, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function glider(c, x, y, s, color) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.rotate(-0.12);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(0, -30);
  c.lineTo(-90, 10);
  c.lineTo(0, 0);
  c.lineTo(90, 10);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.beginPath();
  c.moveTo(0, -30);
  c.lineTo(90, 10);
  c.lineTo(0, 0);
  c.fill();
  c.strokeStyle = '#333';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(0, -4);
  c.lineTo(0, 40);
  c.moveTo(-20, 40);
  c.lineTo(20, 40);
  c.stroke();
  // rider
  c.fillStyle = '#2b2140';
  c.fillRect(-9, 44, 18, 30);
  c.fillStyle = '#f1c7a3';
  c.beginPath();
  c.arc(0, 38, 8, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#2b2140';
  c.fillRect(-8, 74, 7, 22);
  c.fillRect(1, 74, 7, 22);
  c.strokeStyle = '#2b2140';
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(-8, 48);
  c.lineTo(-18, 40);
  c.moveTo(8, 48);
  c.lineTo(18, 40);
  c.stroke();
  c.restore();
}

function stormWall(c, x0, w, h, t) {
  const g = c.createLinearGradient(x0, 0, x0 + w, 0);
  g.addColorStop(0, 'rgba(120,40,200,0)');
  g.addColorStop(0.25, 'rgba(120,40,200,0.55)');
  g.addColorStop(1, 'rgba(70,20,130,0.85)');
  c.fillStyle = g;
  c.fillRect(x0, 0, w, h);
  c.strokeStyle = 'rgba(220,160,255,0.35)';
  c.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    c.beginPath();
    const yy = (i / 14) * h;
    c.moveTo(x0 + w * 0.2, yy);
    c.bezierCurveTo(x0 + w * 0.5, yy + 40 + t, x0 + w * 0.7, yy - 30, x0 + w, yy + 20);
    c.stroke();
  }
  // lightning
  c.strokeStyle = 'rgba(255,240,255,0.9)';
  c.lineWidth = 3;
  c.beginPath();
  let lx = x0 + w * 0.6, ly = 0;
  c.moveTo(lx, ly);
  for (let i = 0; i < 7; i++) {
    lx += (Math.sin(i * 7.3) * 0.5) * 40;
    ly += h * 0.08;
    c.lineTo(lx, ly);
  }
  c.stroke();
}

export function paintArt(cv, variant = 'title', seed = 7) {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(cv.clientWidth * scale) || 1280;
  cv.height = Math.round(cv.clientHeight * scale) || 720;
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const rng = makeRng(seed);
  const palettes = {
    title: ['#1d3c8f', '#4e7fd6', '#ffb36b', '#ffd98a'],
    drop: ['#2a6fd1', '#69a9ee', '#bfe3ff', '#e8f6ff'],
    storm: ['#24124a', '#5a2c9a', '#c27ad8', '#f0b0d0'],
    build: ['#123a7a', '#2e6fc9', '#7fc1ff', '#d8efff'],
  };
  const [s0, s1, s2, s3] = palettes[variant] || palettes.title;
  const sky = c.createLinearGradient(0, 0, 0, h * 0.72);
  sky.addColorStop(0, s0);
  sky.addColorStop(0.45, s1);
  sky.addColorStop(0.85, s2);
  sky.addColorStop(1, s3);
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  // sun
  const sx = w * (variant === 'title' ? 0.72 : 0.2), sy = h * 0.42;
  const sun = c.createRadialGradient(sx, sy, 0, sx, sy, h * 0.35);
  sun.addColorStop(0, 'rgba(255,250,220,0.95)');
  sun.addColorStop(0.12, 'rgba(255,230,160,0.8)');
  sun.addColorStop(1, 'rgba(255,200,120,0)');
  c.fillStyle = sun;
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) cloud(c, rng() * w, h * (0.08 + rng() * 0.35), 20 + rng() * 40, 0.35 + rng() * 0.4);
  // ocean
  const horizon = h * 0.7;
  const sea = c.createLinearGradient(0, horizon, 0, h);
  sea.addColorStop(0, '#3c8fd8');
  sea.addColorStop(1, '#13427e');
  c.fillStyle = sea;
  c.fillRect(0, horizon, w, h - horizon);
  c.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 40; i++) c.fillRect(rng() * w, horizon + rng() * (h - horizon), 20 + rng() * 40, 2);
  // far island
  c.fillStyle = '#5d86a8';
  islandPath(c, rng, w * 0.02, w * 0.4, horizon + 2, h * 0.08, 14);
  c.fill();
  // main island
  c.fillStyle = '#3f8f45';
  islandPath(c, rng, w * 0.22, w * 0.98, horizon + 6, h * 0.12, 22);
  c.fill();
  c.fillStyle = '#e8d79c';
  c.fillRect(w * 0.22, horizon + 2, w * 0.76, 6);
  // mountain with snow
  c.fillStyle = '#7d8a94';
  c.beginPath();
  c.moveTo(w * 0.7, horizon);
  c.lineTo(w * 0.83, horizon - h * 0.26);
  c.lineTo(w * 0.97, horizon);
  c.fill();
  c.fillStyle = '#f2f6fa';
  c.beginPath();
  c.moveTo(w * 0.78, horizon - h * 0.18);
  c.lineTo(w * 0.83, horizon - h * 0.26);
  c.lineTo(w * 0.875, horizon - h * 0.19);
  c.lineTo(w * 0.84, horizon - h * 0.2);
  c.lineTo(w * 0.81, horizon - h * 0.17);
  c.fill();
  // observatory dome
  c.fillStyle = '#dfe6ee';
  c.beginPath();
  c.arc(w * 0.83, horizon - h * 0.26, h * 0.012, Math.PI, 0);
  c.fill();
  // city spire
  c.fillStyle = '#9fb0c4';
  const tx = w * 0.5;
  c.fillRect(tx - 12, horizon - h * 0.2, 24, h * 0.2);
  c.fillRect(tx - 7, horizon - h * 0.3, 14, h * 0.1);
  c.fillRect(tx - 1.5, horizon - h * 0.36, 3, h * 0.06);
  c.fillStyle = '#ff4a4a';
  c.beginPath();
  c.arc(tx, horizon - h * 0.362, 4, 0, Math.PI * 2);
  c.fill();
  for (let i = 0; i < 6; i++) {
    c.fillStyle = ['#c7ccd3', '#b9a99a', '#7d8fa3'][i % 3];
    const bx = tx - 90 + i * 32, bh = h * (0.05 + rng() * 0.07);
    c.fillRect(bx, horizon - bh, 24, bh);
  }
  // lighthouse
  const lx = w * 0.27;
  c.fillStyle = '#f4f1ea';
  c.fillRect(lx - 6, horizon - h * 0.12, 12, h * 0.12);
  c.fillStyle = '#d33b32';
  for (let i = 0; i < 3; i++) c.fillRect(lx - 6, horizon - h * 0.12 + i * h * 0.04, 12, h * 0.02);
  c.fillStyle = 'rgba(255,240,170,0.9)';
  c.beginPath();
  c.arc(lx, horizon - h * 0.125, 6, 0, Math.PI * 2);
  c.fill();
  // trees
  for (let i = 0; i < 40; i++) {
    const x = w * (0.24 + rng() * 0.45), y = horizon + 2;
    c.fillStyle = rng() < 0.3 ? '#d9772b' : '#2f6e3a';
    c.beginPath();
    c.moveTo(x - 6, y);
    c.lineTo(x, y - 18 - rng() * 12);
    c.lineTo(x + 6, y);
    c.fill();
  }
  if (variant === 'storm') stormWall(c, w * 0.55, w * 0.45, h, 10);
  if (variant === 'title' || variant === 'build') balloonBus(c, w * (variant === 'title' ? 0.3 : 0.75), h * 0.18, h / 900);
  if (variant === 'drop' || variant === 'title') glider(c, w * (variant === 'title' ? 0.62 : 0.55), h * 0.3, h / 700, variant === 'title' ? '#e070ff' : '#2bffd5');
  if (variant === 'build') {
    // ramp tower silhouette
    c.fillStyle = '#c8975a';
    c.strokeStyle = '#7d5230';
    c.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const x = w * 0.18 + (i % 2) * 60, y = horizon - i * 55;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 60, y - 55);
      c.lineTo(x + 70, y - 55);
      c.lineTo(x + 10, y);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillRect(x - 6, y - 55, 8, 55);
    }
  }
  // vignette
  const v = c.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,20,0.45)');
  c.fillStyle = v;
  c.fillRect(0, 0, w, h);
}
