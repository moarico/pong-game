# Samurai at Dusk

A ronin in a straw kasa walks through a golden pampas field on rolling hills, katana drawn, under a hazy golden-hour sun. This is a demo of sunlight, grass and movement, nothing else yet.

- **Sun:** a bright, hazy golden-hour sky with a big soft sun over the hill crest. There is HDR bloom, light shafts that break around the samurai and through the clouds, lens flare, and eye adaptation. Height fog fills the valleys, and layered ranges fade into the haze.
- **Glimmer:** the polished blade flashes as it catches the sun. Blade edges twinkle as they flutter, dust and seed fluff ignite when they drift in front of the sun, and backlit plumes glow gold.
- **Grass:** light golden-brown pampas leaves and feathery seed plumes, about 200,000 instances on high settings, all animated on the GPU. Gusts roll across the hills as visible waves. The grass parts around the samurai, springs back behind him, and ripples outward when he lands. Distant grass thins out gradually, so no detail-level rings show.
- **Samurai:** a simulated cloth cape that streams in the wind. He carries a drawn katana in his right hand, and his left hand steadies the empty scabbard (both hands use arm IK). The sleeves hang with gravity, the clothes have woven fabric shading, and the brim of the hat shades his face.
- **Camera:** over the shoulder, with depth of field focused on the samurai, so the near grass melts into soft bokeh.
- **Movement:** a fixed 120 Hz simulation with render interpolation, eased acceleration and turning, coyote time and jump buffering, and a variable jump height. Legs use two-bone IK with heel-to-toe foot roll. The hips bob, sway and twist with the stride, and landings squash on a spring.

## Run it

It is a static page with no build step. [three.js](https://threejs.org) loads from the jsDelivr CDN, so you need an internet connection.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, `npx serve`). Opening `index.html` straight from disk does not work because browsers block ES modules on `file://`.

## Controls

| | Keyboard and mouse | Touch | Gamepad |
|---|---|---|---|
| Walk | `W A S D` or arrow keys | Left thumb (floating stick) | Left stick |
| Run | Hold `Shift` | Push the stick to its rim | Hold `B`, `RT` or `L3` |
| Jump | `Space` (hold to leap higher) | `JUMP` button | `A` |
| Look | Drag, or click to lock the pointer (`Esc` releases it) | Right thumb | Right stick |

## Options

Add these to the URL hash, for example `index.html#fps,medium`:

- `low`, `medium`, `high` start at a fixed quality level. Otherwise desktops start on high, phones on medium, and the game steps down by itself if the frame rate drops.
- `fps` shows the frame rate and the quality level.
- `lock` keeps the chosen quality level and turns off automatic downgrades.

## Layout

```
index.html        page shell, HUD, touch controls
src/main.js       renderer, game loop, quality management
src/config.js     sun direction, light colours, movement tuning, quality presets
src/glsl.js       shared shader code: noise, terrain, wind, atmosphere, character shadow
src/sky.js        sunset sky, clouds and sun disc
src/grass.js      grass blades and susuki plumes
src/terrain.js    rolling hills, far-field ground, mountain ranges (JavaScript twin of the terrain function)
src/wind.js       wind field shared by the grass, dust and cloth
src/particles.js  drifting dust and seed fluff, landing puffs
src/samurai.js    samurai model, procedural animation, cape cloth, drawn katana
src/player.js     movement physics
src/camera.js     third-person camera
src/trail.js      where the grass is being pushed down
src/shadow.js     the samurai's long sunset shadow
src/post.js       depth of field, light shafts, bloom, exposure, lens flare, tone mapping
```
