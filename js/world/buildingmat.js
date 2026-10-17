// Building surfaces. Every paint carries a surface tag (geobuilder.js), and this material multiplies a matching
// detail texture into the paint color, projected in world space so it lines up across a whole wall: stucco,
// clapboard, roof shingles, brick, cut stone, corrugated metal and concrete. Untagged paints pick plaster on
// walls and concrete on floors. A little grime gathers low on walls.
import * as THREE from 'three';
import { field } from '../zh/textures.js';
import { makeRng } from '../util.js';

const S = 512;
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

function paint(fn) {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d'), img = x.createImageData(S, S), d = img.data;
  for (let y = 0; y < S; y++) {
    for (let X = 0; X < S; X++) {
      const i = y * S + X, o = i * 4, v = fn(X, y, i);
      d[o] = clamp255(v[0]);
      d[o + 1] = clamp255(v[1]);
      d[o + 2] = clamp255(v[2]);
      d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

function plaster() {
  const f = field(S, [4, 8, 16, 32, 64, 128], [0.22, 0.2, 0.18, 0.16, 0.13, 0.11], 201);
  const g = field(S, [3, 6], [0.6, 0.4], 202);
  return paint((x, y, i) => {
    // stucco grain plus faint rain streaks running down
    const streak = (Math.sin(x * 0.21 + g[i] * 6) * 0.5 + 0.5) * (y / S) * 10;
    const v = 128 + (f[i] - 0.5) * 38 - streak * 0.6;
    return [v + 1, v, v - 2];
  });
}

function planks() {
  const f = field(S, [4, 8, 16, 32], [0.3, 0.3, 0.2, 0.2], 211);
  const rng = makeRng(212);
  const boardH = S / 8, shade = [];
  for (let b = 0; b < 8; b++) shade.push((rng() - 0.5) * 26);
  return paint((x, y, i) => {
    const b = Math.floor(y / boardH), t = (y % boardH) / boardH;
    // wood grain stretched along the board, a dark gap and a shadow under each board's lip
    const grain = Math.sin(x * 0.05 + f[(y * S + ((x * 7) % S)) % (S * S)] * 14 + b * 3) * 10;
    let v = 132 + shade[b] + grain + (f[i] - 0.5) * 30;
    if (t < 0.06) v -= 55;
    else if (t > 0.88) v -= (t - 0.88) * 260;
    return [v + 4, v, v - 6];
  });
}

function shingles() {
  const f = field(S, [8, 16, 32, 64], [0.3, 0.3, 0.2, 0.2], 221);
  const rng = makeRng(222);
  const rowH = S / 10, tileW = S / 8, shade = [];
  for (let k = 0; k < 200; k++) shade.push((rng() - 0.5) * 34);
  return paint((x, y, i) => {
    const r = Math.floor(y / rowH), t = (y % rowH) / rowH;
    const off = r % 2 ? tileW / 2 : 0, c = Math.floor((x + off) / tileW), u = ((x + off) % tileW) / tileW;
    let v = 128 + shade[(r * 13 + c) % 200] + (f[i] - 0.5) * 30;
    // each course overlaps the one below: shadow at the bottom edge, gaps between tiles
    v -= Math.max(0, t - 0.8) * 220;
    if (u < 0.04 || u > 0.96) v -= 40;
    return [v, v - 1, v - 2];
  });
}

function brick() {
  const f = field(S, [8, 16, 32, 64], [0.3, 0.3, 0.2, 0.2], 231);
  const rng = makeRng(232);
  const rowH = S / 16, bw = S / 8, shade = [];
  for (let k = 0; k < 300; k++) shade.push([(rng() - 0.5) * 36, (rng() - 0.5) * 14]);
  return paint((x, y, i) => {
    const r = Math.floor(y / rowH), t = (y % rowH) / rowH;
    const off = r % 2 ? bw / 2 : 0, c = Math.floor((x + off) / bw), u = ((x + off) % bw) / bw;
    const mortar = t < 0.14 || u < 0.05;
    if (mortar) return [168 + (f[i] - 0.5) * 20, 164 + (f[i] - 0.5) * 20, 156];
    const s = shade[(r * 17 + c) % 300];
    const v = 120 + s[0] + (f[i] - 0.5) * 26;
    return [v + s[1], v - 4, v - 8];
  });
}

function stone() {
  const f = field(S, [6, 12, 24, 48, 96], [0.3, 0.25, 0.2, 0.15, 0.1], 241);
  const rng = makeRng(242);
  const rowH = S / 6, shade = [];
  for (let k = 0; k < 200; k++) shade.push((rng() - 0.5) * 40);
  const widths = [];
  for (let r = 0; r < 6; r++) {
    const row = [];
    let x = -rng() * 60;
    while (x < S) {
      x += 50 + rng() * 70;
      row.push(x);
    }
    widths.push(row);
  }
  return paint((x, y, i) => {
    const r = Math.floor(y / rowH), t = (y % rowH) / rowH;
    const row = widths[r];
    let c = 0;
    while (c < row.length && row[c] < x) c++;
    const edge = Math.min(...row.map((b) => Math.abs(b - x)));
    let v = 126 + shade[(r * 23 + c) % 200] + (f[i] - 0.5) * 44;
    if (t < 0.05 || t > 0.96 || edge < 3) v -= 60;
    return [v, v - 2, v - 5];
  });
}

function metal() {
  const f = field(S, [4, 8, 16, 32], [0.3, 0.3, 0.2, 0.2], 251);
  const g = field(S, [2, 4], [0.6, 0.4], 252);
  return paint((x, y, i) => {
    // vertical corrugation with rust and dirt bleeding down
    const corr = Math.sin((x / S) * Math.PI * 2 * 24) * 18;
    const rust = Math.max(0, g[i] - 0.6) * 140 * (y / S);
    const v = 128 + corr + (f[i] - 0.5) * 24;
    return [v + rust * 0.6, v - rust * 0.1, v - rust * 0.5];
  });
}

function concrete() {
  const f = field(S, [6, 12, 24, 48, 96, 192], [0.25, 0.22, 0.18, 0.15, 0.12, 0.08], 261);
  const rng = makeRng(262);
  return paint((x, y, i) => {
    const v = 128 + (f[i] - 0.5) * 40 + (rng() - 0.5) * 14;
    return [v, v, v - 1];
  });
}

let TEX = null;
function textures() {
  if (TEX) return TEX;
  TEX = [plaster, planks, shingles, brick, stone, metal, concrete].map((mk) => {
    const t = new THREE.CanvasTexture(mk());
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.NoColorSpace;
    t.anisotropy = 8;
    return t;
  });
  return TEX;
}

const FRAG = /* glsl */ `
uniform sampler2D tB1;
uniform sampler2D tB2;
uniform sampler2D tB3;
uniform sampler2D tB4;
uniform sampler2D tB5;
uniform sampler2D tB6;
uniform sampler2D tB7;
varying float vSurf;
varying vec3 vBW;
varying vec3 vBN;
vec3 bDet( sampler2D t, vec2 uv ) { return texture2D( t, uv ).rgb * 2.0; }
vec3 buildingDetail() {
	vec3 n = normalize( vBN ), a = abs( n );
	// wall coordinates run along the wall with v up; floors and roofs use the ground plane
	bool wall = a.y < 0.55;
	vec2 uv = wall ? ( a.x > a.z ? vBW.zy : vBW.xy ) : vBW.xz;
	float s = floor( vSurf + 0.5 );
	if ( s < 0.5 ) s = wall ? 1.0 : 7.0;
	vec3 d;
	if ( s < 1.5 ) d = bDet( tB1, uv / 3.0 );
	else if ( s < 2.5 ) d = bDet( tB2, uv / 2.0 );
	else if ( s < 3.5 ) d = bDet( tB3, ( wall ? uv : vec2( uv.x, uv.y ) ) / 2.2 );
	else if ( s < 4.5 ) d = bDet( tB4, uv / 2.0 );
	else if ( s < 5.5 ) d = bDet( tB5, uv / 3.0 );
	else if ( s < 6.5 ) d = bDet( tB6, uv / 2.5 );
	else d = bDet( tB7, uv / 4.0 );
	return d;
}
`;

let MAT = null;
export function buildingMaterial() {
  if (MAT) return MAT;
  const tex = textures();
  MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 });
  MAT.onBeforeCompile = (sh) => {
    for (let i = 0; i < 7; i++) sh.uniforms['tB' + (i + 1)] = { value: tex[i] };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aSurf;\nvarying float vSurf;\nvarying vec3 vBW;\nvarying vec3 vBN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSurf = aSurf;\nvBW = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\nvBN = normalize( mat3( modelMatrix ) * objectNormal );');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FRAG)
      .replace('#include <color_fragment>', '#include <color_fragment>\n\tdiffuseColor.rgb *= buildingDetail();');
  };
  MAT.customProgramCacheKey = () => 'stormdrop-building';
  return MAT;
}
