// The small stuff that makes the island feel lived in: power lines along the roads, street lamps, benches,
// hydrants and bins in town, picket fences and mailboxes round the houses, and camps, ruins, lookouts and
// trailers out in the wilds.
import * as THREE from 'three';
import { POIS, ROAD_HALF_WIDTH } from './island.js';
import { lerp } from '../util.js';

const POLE = '#6b5a48', DARK = '#3a3f45';
const TOWNS = ['city', 'lake', 'suburb', 'outpost', 'beach'];

function inPoi(x, z, pad = 0, types = null) {
  return POIS.find((p) => (!types || types.includes(p.type)) && Math.hypot(p.x - x, p.z - z) < p.r + pad);
}

// Power poles every ~34 m along one side of each road outside town, with sagging wires between them.
export function powerLines(S) {
  const T = S.T, gb = S.gb, rng = S.rng;
  const wires = [];
  for (const road of T.roads) {
    const pts = road.points;
    const side = rng.chance(0.5) ? 1 : -1;
    let last = null, acc = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc < 34) continue;
      acc = 0;
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az) || 1;
      const nx = -(bz - az) / len, nz = (bx - ax) / len;
      const x = pts[i][0] + nx * side * (ROAD_HALF_WIDTH + 2.6), z = pts[i][1] + nz * side * (ROAD_HALF_WIDTH + 2.6);
      const g = T.heightAt(x, z);
      if (g < 0.8 || inPoi(x, z, 4, ['city', 'castle', 'factory', 'power', 'observatory']) || T.distToRiver(x, z) < 4 || !S.rectClear(x - 0.4, z - 0.4, x + 0.4, z + 0.4, 0.5, { ignoreRoads: true, maxSlope: 3 })) {
        last = null;
        continue;
      }
      const H = 8.2, yaw = Math.atan2(bx - ax, bz - az);
      gb.cylinder(x, g - 0.4, z, 0.16, 0.12, H + 0.4, 7, POLE);
      gb.boxRot(x, g + H - 0.6, z, 2.2, 0.14, 0.14, yaw, POLE);
      const ex = Math.cos(yaw), ez = -Math.sin(yaw);
      const tips = [-0.95, 0, 0.95].map((o) => [x + ex * o, g + H - 0.38 + (o === 0 ? 0.25 : 0), z + ez * o]);
      for (const [tx, ty, tz] of tips) gb.cylinder(tx, ty - 0.12, tz, 0.05, 0.04, 0.16, 5, '#d8e4e8');
      S.W.box(x - 0.18, g - 0.5, z - 0.18, x + 0.18, g + H, z + 0.18);
      if (last) {
        for (let k = 0; k < 3; k++) {
          const [p0, p1] = [last[k], tips[k]];
          const n = 8, sag = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]) * 0.035;
          for (let s = 0; s < n; s++) {
            const t0 = s / n, t1 = (s + 1) / n;
            const y0 = lerp(p0[1], p1[1], t0) - sag * 4 * t0 * (1 - t0), y1 = lerp(p0[1], p1[1], t1) - sag * 4 * t1 * (1 - t1);
            wires.push(lerp(p0[0], p1[0], t0), y0, lerp(p0[2], p1[2], t0), lerp(p0[0], p1[0], t1), y1, lerp(p0[2], p1[2], t1));
          }
        }
      }
      last = tips;
    }
  }
  if (wires.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(wires, 3));
    const lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x1c1e22, fog: true }));
    lines.name = 'power-lines';
    S.group.add(lines);
  }
}

// Town furniture along the streets: lamps every ~18 m, plus benches, hydrants and bins here and there.
export function streetFurniture(S) {
  const T = S.T, gb = S.gb, rng = S.rng;
  for (const road of T.roads) {
    const pts = road.points;
    let acc = 0, flip = 1;
    for (let i = 1; i < pts.length - 1; i++) {
      acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc < 18) continue;
      acc = 0;
      flip = -flip;
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az) || 1;
      const nx = -(bz - az) / len, nz = (bx - ax) / len;
      const x = pts[i][0] + nx * flip * (ROAD_HALF_WIDTH + 1.2), z = pts[i][1] + nz * flip * (ROAD_HALF_WIDTH + 1.2);
      if (!inPoi(x, z, 10, TOWNS)) continue;
      const g = T.heightAt(x, z);
      if (g < 0.6 || !S.rectClear(x - 0.3, z - 0.3, x + 0.3, z + 0.3, 0.3, { ignoreRoads: true, maxSlope: 3 })) continue;
      // lamp: a pole curving out over the road with a lamp head
      gb.cylinder(x, g - 0.2, z, 0.1, 0.07, 6.2, 7, DARK);
      const hx = x - nx * flip * 1.4, hz = z - nz * flip * 1.4;
      gb.boxRot((x + hx) / 2, g + 5.9, (z + hz) / 2, 0.1, 0.1, 1.5, Math.atan2(hx - x, hz - z), DARK);
      gb.boxRot(hx, g + 5.7, hz, 0.36, 0.18, 0.7, Math.atan2(hx - x, hz - z), DARK);
      gb.boxRot(hx, g + 5.66, hz, 0.28, 0.04, 0.56, Math.atan2(hx - x, hz - z), '#fff6d8');
      S.W.box(x - 0.12, g - 0.2, z - 0.12, x + 0.12, g + 6, z + 0.12);
      // now and then a bench, a hydrant or a bin a little further along
      const r = rng();
      const px = x + (bx - ax) / len * 2.2, pz = z + (bz - az) / len * 2.2;
      const pg = T.heightAt(px, pz);
      const yaw = Math.atan2(nx * flip, nz * flip);
      if (r < 0.3) {
        gb.boxRot(px, pg + 0.42, pz, 1.6, 0.06, 0.45, yaw + Math.PI / 2, '#8b5e3c');
        gb.boxRot(px - nx * flip * 0.2, pg + 0.5, pz - nz * flip * 0.2, 1.6, 0.4, 0.05, yaw + Math.PI / 2, '#8b5e3c');
        for (const o of [-0.7, 0.7]) gb.boxRot(px + (bx - ax) / len * o, pg, pz + (bz - az) / len * o, 0.08, 0.45, 0.4, yaw + Math.PI / 2, DARK);
        S.W.box(px - 0.5, pg, pz - 0.5, px + 0.5, pg + 0.5, pz + 0.5);
      } else if (r < 0.5) {
        gb.cylinder(px, pg - 0.05, pz, 0.16, 0.14, 0.7, 8, '#c8342a');
        gb.sphere(px, pg + 0.68, pz, 0.15, 8, 5, '#c8342a', 1, true);
        gb.boxRot(px, pg + 0.42, pz, 0.46, 0.1, 0.1, yaw, '#c8342a');
        S.W.box(px - 0.2, pg, pz - 0.2, px + 0.2, pg + 0.8, pz + 0.2);
      } else if (r < 0.7) {
        gb.cylinder(px, pg - 0.05, pz, 0.28, 0.3, 0.95, 10, '#3a6a4a');
        gb.cylinder(px, pg + 0.9, pz, 0.32, 0.32, 0.06, 10, '#2f4a3a');
        S.W.box(px - 0.3, pg, pz - 0.3, px + 0.3, pg + 1, pz + 0.3);
      }
    }
  }
}

// A picket fence round a house's yard, open at the front path, and a mailbox by the gate.
export function yard(S, b) {
  const gb = S.gb, T = S.T, rng = S.rng, F = b.frame;
  const w = Math.abs(b.x1 - b.x0), d = Math.abs(b.z1 - b.z0);
  const lw = F.rot % 2 ? d : w, ld = F.rot % 2 ? w : d;
  const m = 3.2, X0 = -lw / 2 - m, X1 = lw / 2 + m, Z0 = -ld / 2 - m, Z1 = ld / 2 + m + 1.6;
  const col = rng.pick(['#f2efe8', '#e8e0d0', '#8b5e3c', '#d8d0c0']);
  const doorLx = b.door ? F.tl(b.door.out[0], b.door.out[2])[0] : 0;
  const seg = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 0.32));
    let blocked = false;
    for (let k = 0; k <= n; k++) {
      const [x, z] = F.tw(lerp(ax, bx, k / n), lerp(az, bz, k / n));
      if (T.heightAt(x, z) < 0.5 || T.distToRoad(x, z) < ROAD_HALF_WIDTH + 0.6) {
        blocked = true;
        break;
      }
    }
    if (blocked) return;
    for (let k = 0; k <= n; k++) {
      const [x, z] = F.tw(lerp(ax, bx, k / n), lerp(az, bz, k / n));
      const g = T.heightAt(x, z);
      gb.box(x - 0.04, g - 0.2, z - 0.04, x + 0.04, g + 0.85, z + 0.04, col);
    }
    for (const h of [0.3, 0.68]) {
      const [x0, z0] = F.tw(ax, az), [x1, z1] = F.tw(bx, bz);
      const gm = T.heightAt((x0 + x1) / 2, (z0 + z1) / 2);
      gb.boxRot((x0 + x1) / 2, gm + h, (z0 + z1) / 2, 0.05, 0.07, len, Math.atan2(x1 - x0, z1 - z0), col);
    }
    const [x0, z0] = F.tw(ax, az), [x1, z1] = F.tw(bx, bz);
    S.W.box(Math.min(x0, x1) - 0.05, T.heightAt((x0 + x1) / 2, (z0 + z1) / 2) - 0.2, Math.min(z0, z1) - 0.05, Math.max(x0, x1) + 0.05, T.heightAt((x0 + x1) / 2, (z0 + z1) / 2) + 0.9, Math.max(z0, z1) + 0.05);
  };
  // front with a gate gap at the path, sides, and the back with a gap too
  seg(X0, Z1, doorLx - 1.2, Z1);
  seg(doorLx + 1.2, Z1, X1, Z1);
  seg(X0, Z0, X0, Z1);
  seg(X1, Z0, X1, Z1);
  seg(X0, Z0, -0.9, Z0);
  seg(0.9, Z0, X1, Z0);
  // mailbox just outside the gate
  const [mx, mz] = F.tw(doorLx + 1.7, Z1 + 0.5);
  const mg = T.heightAt(mx, mz);
  if (mg > 0.5) {
    gb.box(mx - 0.05, mg - 0.2, mz - 0.05, mx + 0.05, mg + 1.0, mz + 0.05, POLE);
    gb.boxRot(mx, mg + 1.0, mz, 0.26, 0.24, 0.45, F.yaw, rng.pick(['#2f4a6a', '#3a3a3a', '#a83a32', '#e8e0d0']));
    gb.boxRot(mx + 0.14, mg + 1.15, mz, 0.03, 0.18, 0.06, F.yaw, '#d23a2e');
  }
}

// Little places between the named areas: campsites, stone ruins, hunting lookouts and old trailers.
export function wildSpots(S, count = 16) {
  const T = S.T, rng = S.rng;
  const poi = { id: 'wild', name: 'Wilds', loot: 'low', x: 0, z: 0, r: 0, type: 'wild' };
  let placed = 0;
  for (let tries = 0; tries < 500 && placed < count; tries++) {
    const x = (rng() - 0.5) * 840, z = (rng() - 0.5) * 840;
    if (POIS.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + 30)) continue;
    const h = T.heightAt(x, z);
    if (h < 2 || h > 55 || T.distToRoad(x, z) < 8 || T.distToRiver(x, z) < 6) continue;
    if (!S.rectClear(x - 5, z - 5, x + 5, z + 5, 12, { maxSlope: 2.5, ignoreRoads: true })) continue;
    S.reserve(x - 5, z - 5, x + 5, z + 5);
    const kind = rng.pick(['camp', 'ruin', 'lookout', 'trailer', 'camp', 'ruin']);
    if (kind === 'camp') camp(S, x, z, poi);
    else if (kind === 'ruin') ruin(S, x, z, poi);
    else if (kind === 'lookout') lookout(S, x, z, poi);
    else trailer(S, x, z, poi);
    placed++;
  }
}

function camp(S, x, z, poi) {
  const gb = S.gb, T = S.T, rng = S.rng;
  const g = T.heightAt(x, z);
  gb.cylinder(x, g - 0.1, z, 0.7, 0.7, 0.2, 9, '#6d6862');
  S.animated.push({ kind: 'fire', x, y: g + 0.25, z });
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    const tx = x + Math.cos(a) * 3.4, tz = z + Math.sin(a) * 3.4, tg = T.heightAt(tx, tz);
    if (k < 2) {
      gb.pyramid(tx - 1.4, tz - 1.1, tx + 1.4, tz + 1.1, tg - 0.05, 1.7, rng.pick(['#d97a2b', '#2b8ad9', '#3fae6a', '#c9a23a']));
      S.W.box(tx - 1.1, tg, tz - 0.8, tx + 1.1, tg + 1.3, tz + 0.8);
      S.lootSpots.push({ x: tx, y: tg + 0.05, z: tz + 1.4, poi, building: null, floor: 0 });
    } else {
      // log seats round the fire and a supply crate
      gb.boxRot(x + 1.6, tg + 0.2, z - 0.6, 1.6, 0.35, 0.35, 0.4, '#6b4a32');
      gb.box(tx - 0.5, tg - 0.05, tz - 0.5, tx + 0.5, tg + 0.8, tz + 0.5, '#8a6d45');
      S.W.box(tx - 0.5, tg, tz - 0.5, tx + 0.5, tg + 0.8, tz + 0.5);
      S.lootSpots.push({ x: tx, y: tg + 0.85, z: tz, poi, building: null, floor: 0 });
    }
  }
}

function ruin(S, x, z, poi) {
  const gb = S.gb, T = S.T, rng = S.rng;
  const g = T.heightAt(x, z) - 0.3;
  const sz = 4.5;
  const walls = [[-sz, -sz, sz, -sz], [sz, -sz, sz, sz], [-sz, sz, -1, sz], [-sz, -sz, -sz, sz]];
  for (const [ax, az, bx, bz] of walls) {
    const len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 1.5);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, h = 0.6 + rng() * 2.6;
      const cx = x + lerp(ax, bx, t), cz = z + lerp(az, bz, t);
      const along = Math.abs(bx - ax) > Math.abs(bz - az);
      const hx = along ? 0.78 : 0.3, hz = along ? 0.3 : 0.78;
      gb.box(cx - hx, g, cz - hz, cx + hx, g + h, cz + hz, rng.pick(['#9a958c', '#8c877e', '#a39d93']));
      S.W.box(cx - hx, g, cz - hz, cx + hx, g + h, cz + hz);
    }
  }
  for (let k = 0; k < 4; k++) {
    const rx = x + (rng() - 0.5) * 7, rz = z + (rng() - 0.5) * 7;
    gb.boxRot(rx, T.heightAt(rx, rz) - 0.1, rz, 0.6 + rng() * 0.5, 0.3 + rng() * 0.3, 0.5, rng() * 3, '#8c877e');
  }
  S.lootSpots.push({ x, y: T.heightAt(x, z) + 0.05, z, poi, building: null, floor: 0, high: true });
}

function lookout(S, x, z, poi) {
  const gb = S.gb, T = S.T;
  const g = T.heightAt(x, z) - 0.3, H = 7;
  for (const [ox, oz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) {
    gb.box(x + ox - 0.14, g, z + oz - 0.14, x + ox + 0.14, g + H, z + oz + 0.14, '#5f4430');
    S.W.box(x + ox - 0.14, g, z + oz - 0.14, x + ox + 0.14, g + H, z + oz + 0.14);
  }
  gb.box(x - 2, g + H - 0.3, z - 2, x + 2, g + H, z + 2, '#8e6a46', false);
  S.W.box(x - 2, g + H - 0.3, z - 2, x + 2, g + H, z + 2);
  for (const s of [-1, 1]) {
    gb.box(x - 2, g + H, z + s * 2 - 0.05, x + 2, g + H + 1, z + s * 2 + 0.05, '#8e6a46');
    gb.box(x + s * 2 - 0.05, g + H, z - 2, x + s * 2 + 0.05, g + H + 1, z + 2, '#8e6a46');
  }
  gb.pyramid(x - 2.4, z - 2.4, x + 2.4, z + 2.4, g + H + 2.3, 1.3, '#46603f');
  for (const [ox, oz] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]]) gb.box(x + ox - 0.06, g + H, z + oz - 0.06, x + ox + 0.06, g + H + 2.3, z + oz + 0.06, '#5f4430');
  // a ladder up one side (build a ramp to get up there)
  const lx = x + 2.3;
  for (let k = 0; k < 14; k++) gb.box(lx - 0.05, g + 0.4 + k * 0.48, z - 0.4, lx + 0.05, g + 0.45 + k * 0.48, z + 0.4, '#8e6a46');
  S.lootSpots.push({ x, y: g + H + 0.05, z, poi, building: null, floor: 0, high: true });
}

function trailer(S, x, z, poi) {
  const gb = S.gb, T = S.T, rng = S.rng;
  const g = T.heightAt(x, z);
  const yaw = rng() * Math.PI;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const body = rng.pick(['#e8e0d0', '#d8c8a8', '#c8d8e0']);
  gb.boxRot(x, g + 0.5, z, 2.4, 2.4, 6, yaw, body);
  gb.boxRot(x, g + 1.5, z, 2.42, 0.25, 6.02, yaw, rng.pick(['#2f6dd0', '#c8342a', '#3a8a5a']));
  gb.boxRot(x + c * 1.21, g + 1.7, z - s * 1.21, 0.04, 0.6, 3.5, yaw, '#22303a');
  for (const o of [-1.5, 1.5]) gb.cylinder(x + s * o + c * 1.0, g + 0.05, z + c * o - s * 1.0, 0.42, 0.42, 0.3, 10, '#1a1a1a');
  gb.boxRot(x + s * 3.6, g + 0.35, z + c * 3.6, 0.15, 0.15, 1.6, yaw, DARK);
  const hx = Math.abs(c) * 1.2 + Math.abs(s) * 3, hz = Math.abs(s) * 1.2 + Math.abs(c) * 3;
  S.W.box(x - hx, g, z - hz, x + hx, g + 2.9, z + hz);
  const lx = x - c * 2.2, lz = z + s * 2.2;
  S.lootSpots.push({ x: lx, y: T.heightAt(lx, lz) + 0.05, z: lz, poi, building: null, floor: 0 });
}

