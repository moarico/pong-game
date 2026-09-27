# Samurai at Dusk

A ronin in a straw kasa stands in a golden pampas field on rolling hills under a hazy golden-hour sun. Bandits come for him through the grass, wave after wave.

- **Combat:** a four-cut combo, a heavy thrust or a charged leaping cleave, a spinning cut, a dashing cut on the run, two aerial cuts and a plunge from the air. There's also a dodge, and a parry that opens the enemy up for a lethal riposte. Attacks turn toward the nearest enemy and step in to cutting range, and combos flow into each other. Hits land with hit-stop, screen shake, sparks or blood, and a trail of light along the blade. Big moments slow time.
- **Enemies:** bandits, ronin and an armoured heavy. They close in through the grass, circle you and take turns to attack. A glint runs along the blade just before a strike, and it's red when the strike can't be parried. They also guard against your cuts, reel back, get knocked down, and fall dead in the grass.
- **Characters:** skinned, sculpted figures: a kimono over a broad chest, a crossed collar, obi, wide pleated hakama, lacquered kote, and a kasa, jingasa or crested kabuto. The samurai wears a cloth cape that streams in the wind.
- **Movement:** planted feet that never skate, a gait that runs from a stroll to a sprint without a hitch, hips that stay within the legs' reach, and a fixed 120 Hz simulation interpolated for any frame rate.
- **Sun and grass:** a bright hazy sky with bloom, light shafts, lens flare and eye adaptation. About 200,000 grass blades and plumes wave in rolling gusts, part around every fighter, lie flat where the fallen lie, and ripple outward from heavy blows. Depth of field keeps the fight in focus.
- **Sound:** blade swishes, steel on steel, the glint before an attack, impacts and wind, all synthesised in the browser. Press `M` to mute.
- **Title screen:** the game opens on a live shot of the samurai against the setting sun, with Play, a controls screen (a controller diagram, plus keyboard and touch tabs) and a sound switch. Pause at any time to get the same menu back.
- **Controllers:** connect an Xbox (or any standard) controller, including to a phone, and press a button: the on-screen touch controls step aside, leaving only the pause button. Unplug it and they come back.

## Run it

It's a static page with no build step. [three.js](https://threejs.org) loads from the jsDelivr CDN, so you need an internet connection.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, `npx serve`). Opening `index.html` straight from disk doesn't work, because browsers block ES modules on `file://`.

## Controls

| | Keyboard and mouse | Touch | Gamepad |
|---|---|---|---|
| Move | `W A S D` or arrow keys | Left thumb (floating stick) | Left stick |
| Run | Hold `Shift` | Push the stick to its rim | Hold `RT` or `L3` |
| Jump | `Space` (hold to leap higher) | `JUMP` | `A` |
| Cut | Left click or `J` | `CUT` | `X` |
| Heavy (hold to charge) | Right click or `K` | `HEAVY` | `Y` |
| Spinning cut | `E` or `L` | `SPIN` | `RB` |
| Dodge | `Q` or `U` | `DODGE` | `B` |
| Parry | `F` or `I` | `PARRY` | `LB` or `LT` |
| Look | Mouse (the pointer locks when you press Play) | Right thumb | Right stick |
| Pause | `Esc` or `P` | Pause button, top right | `Menu` or `View` |
| Menus | Arrow keys, `Enter`, `Esc` | Tap | D-pad or left stick, `A` select, `B` back |
| Mute | `M` | | |

### Moves

- **Cut, cut, cut, cut:** a diagonal kesa, a rising cut, a wide horizontal sweep, and an overhead cleave that knocks the enemy down.
- **Heavy:** tap for a lunging thrust. Hold to raise the sword high while a glint builds, then release for a leaping cleave whose shockwave floors everyone in front of you.
- **Cut while running:** a dashing cut that carries you past your enemy.
- **In the air:** cut twice, or press heavy to plunge blade-first into the ground.
- **Spinning cut:** a hopping full turn that catches everyone around you.
- **Parry** just as the enemy's blade comes down: time slows, the enemy is thrown open, and your next cut is a riposte. Parry a little early and you still block.
- **Dodge:** a low sidestep in the direction you're moving, or backward. You can't be hit at the start of it. Dodge the heavy's red-glint cleave, because it can't be parried.

## Options

Add these to the URL hash, for example `index.html#fps,medium`:

- `low`, `medium`, `high` start at a fixed quality level. Otherwise desktops start on high, tablets on medium and phones on low, and the game steps down by itself if the frame rate drops.
- `fps` shows the frame rate and the quality level.
- `lock` keeps the chosen quality level and turns off automatic downgrades.
- `play` skips the title screen.

## Layout

```
index.html         page shell, HUD, touch controls
src/main.js        renderer, game loop, time scale (hit-stop, slow motion), quality management
src/config.js      sun direction, light colours, movement tuning, quality presets
src/glsl.js        shared shader code: noise, terrain, wind, atmosphere, character shadow
src/sky.js         sky, clouds and sun disc
src/grass.js       grass blades and susuki plumes
src/terrain.js     rolling hills, far-field ground, mountain ranges (JavaScript twin of the terrain function)
src/wind.js        wind field shared by the grass, dust and cloth
src/particles.js   drifting dust and seed fluff, landing puffs
src/figure.js      skeletons and sculpted, skinned bodies for the samurai and each kind of enemy
src/meshbuilder.js builds one skinned mesh from many parts, with a material per vertex
src/charmat.js     character shading: cloth, skin, straw, lacquer, steel, hit flash
src/animator.js    procedural animation: foot planting, gait, hips, arms and sword by IK, secondary motion
src/character.js   a figure plus its animator and optional cloth cape
src/cloth.js       cloth simulation for the cape
src/moves.js       every attack, parry, dodge, reaction and fall, as data
src/combat.js      the player's fighting: input, combos, targeting, blade sweeps, taking hits
src/enemies.js     enemy minds and bodies, waves, whose turn it is to attack
src/fx.js          sword trails, sparks, blood, glints
src/hud.js         health, enemy health bars, banners
src/menu.js        title and pause menu, controller navigation
src/audio.js       synthesised sound
src/player.js      body physics (the player's and the enemies')
src/camera.js      third-person camera, fight framing, shake
src/trail.js       where the grass is being pushed down
src/shadow.js      sunset shadows of everyone in the fight
src/post.js        depth of field, light shafts, bloom, exposure, lens flare, tone mapping
```
