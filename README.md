# Samurai at Dusk

A samurai walking through a field of wind-blown, light-brown susuki grass at sunset. This is a demo of sunlight, grass and movement, nothing else yet.

- **Sun:** a low sun with HDR bloom, light shafts that break around the samurai and through gaps in the clouds, lens flare, and eye adaptation. Looking into the sun turns the samurai into a silhouette with a burning rim.
- **Glimmer:** blade edges catch the light and twinkle as they flutter. Dust and seed fluff drift on the wind and ignite when they pass in front of the sun. Seed plumes blaze gold when backlit.
- **Grass:** up to about 200,000 instanced blades plus susuki plumes, all animated on the GPU. Gusts roll across the field as visible waves. The grass parts around the samurai, springs back behind him, and ripples outward when he lands.
- **Movement:** a fixed 120 Hz simulation with render interpolation, eased acceleration and turning, coyote time and jump buffering, and a variable jump height. Legs use two-bone IK with heel-to-toe foot roll. The hips bob, sway and twist with the stride. Landings squash on a spring. The sleeves and sash swing with the wind and the motion.

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
src/terrain.js    ground and distant hills (JavaScript twin of the terrain function)
src/wind.js       wind field shared by the grass, dust and cloth
src/particles.js  drifting dust and seed fluff, landing puffs
src/samurai.js    samurai model, procedural animation, sash cloth
src/player.js     movement physics
src/camera.js     third-person camera
src/trail.js      where the grass is being pushed down
src/shadow.js     the samurai's long sunset shadow
src/post.js       light shafts, bloom, exposure, lens flare, tone mapping
```
