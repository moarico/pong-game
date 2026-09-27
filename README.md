# Samurai at Dusk

A ronin in a woven kasa stands in a golden pampas field on a hilltop above the sea, with the sun going down over the bay. Bandits come for him through the grass, wave after wave. Beyond the hill wait four halls, each ruled by one great foe.

## The halls and their bosses

Press Play to choose a battle. Each card on the stage select is a live render of its hall.

- **The Sunken Cathedral: the Maw of the Deep.**
  - **The hall:** a gothic nave flooded to the ankle, with clustered pillars, pointed arcades, a ribbed vault and stained glass. Light pours through a great rose window, caustics play on the flagstones and ripples spread from every step.
  - **The Maw:** a vast anglerfish rises from the drowned crypt with a glowing lure and six tentacles. It slams and sweeps with its arms, blinds you with its lure (hide behind a pillar or dodge) and lunges across the broken floor to bite. Wounded, it spits bile (parry it back) and sends a flood rolling down the nave.
- **The Clockwork Forge: the Brass Colossus.**
  - **The hall:** a round foundry with a glowing pit, molten channels, a roaring furnace and a pouring crucible. Great gears turn in the walls, and the pipes, gauges and vents hiss.
  - **The Colossus:** an eight-metre steam engine on planted, stomping feet. It fights with a wrench slam whose shockwave you can jump, a sweep, a steam blast, a stomp, a parryable claw and a low spin. It also throws gears that a perfect parry sends back into it. Hotter, it opens its furnace and charges, then must kneel to vent with its core exposed.
- **The Crystal Caves: the Crystal Wyrm.**
  - **The hall:** a cavern lit by its own crystals, with a pillar wrapped in a spiral stair, miners' scaffolding and a glowing pool under a waterfall.
  - **The Wyrm:** its body follows wherever its head has been, so it coils about the pillar and dives through the rock. It breathes a spray of crystal, lunges, sends spikes bursting along the floor, burrows up beneath you and lashes its tail. In its second phase it brings the roof down. When it dies it turns to crystal and shatters.
- **The Ruined Bastion: the Storm Rider.**
  - **The hall:** a castle courtyard in a thunderstorm, with rain, lightning, braziers and banners tearing in the gale.
  - **The Rider:** a knight on a warhorse split by embers, with a flaming lance and a cloak streaming behind. He charges through you, sweeps fire across the stones, rears to stamp a shockwave and calls lightning down. Wounded, his fire turns blue and the storm follows his charges.

Bosses signal their attacks with glowing shapes on the floor that fill as the blow comes. A white glint means you can parry the attack; a red one means you must dodge. Enough damage breaks a boss's poise and it staggers, dropping its weak point within reach. At half health each boss enters a second phase with new attacks. Every boss has an intro, a death scene and a victory screen, and the halls you've won are marked on the stage select.

- **Combat:** a four-cut combo, a heavy thrust or a charged leaping cleave, a spinning cut, a dashing cut on the run, two aerial cuts and a plunge from the air. There's also a dodge, and a parry that opens the enemy up for a lethal riposte. Attacks turn toward the nearest enemy and step in to cutting range, and combos flow into each other. Hits land with hit-stop, screen shake, sparks or blood, and a trail of light along the blade. Big moments slow time.
- **Enemies:** bandits, ronin and an armoured heavy. They close in through the grass, circle you and take turns to attack. A glint runs along the blade just before a strike, and it's red when the strike can't be parried. They also guard against your cuts, reel back, get knocked down, and fall dead in the grass.
- **Characters:** skinned, sculpted figures: a kimono over a broad chest, a crossed collar, obi, wide pleated hakama, lacquered kote, and a kasa, jingasa or crested kabuto. The samurai is a young ronin with a strong jaw and shaggy black hair under a wide woven bamboo kasa tied beneath his chin. He wears a heavy wrapped scarf, leather straps crossed over a dark damask robe, and a long, tattered cloak that streams in the wind.
- **Movement:** planted feet that never skate, a gait that runs from a stroll to a sprint without a hitch, hips that stay within the legs' reach, and a fixed 120 Hz simulation interpolated for any frame rate.
- **The coast:** the hill rolls over a crest and falls to a bay. Headlands, islands and far mountains stand in the water, and the sun lays a road of glitter across the sea. Inland, meadows and pine woods climb toward the mountains.
- **Sun and sky:** a low sun under a deck of broken cloud, dark and smoky where it's thick, burning gold at the edges, with blue showing through overhead. There's bloom, light shafts, lens flare, eye adaptation and a thin sea mist.
- **Grass:** about 200,000 grass blades and feathery susuki plumes wave in rolling gusts. The grass parts around every fighter, lies flat where the fallen lie, and ripples outward from heavy blows. Depth of field keeps the fight in focus.
- **Sound:** blade swishes, steel on steel, the glint before an attack, impacts and wind, all synthesised in the browser. Press `M` to mute.
- **Title screen:** the game opens on a live shot of the samurai from behind on the crest of the hill, looking out over the bay into the setting sun, his cloak and the plumes blowing in a stiff breeze. The menu has Play, a controls screen (a controller diagram, plus keyboard and touch tabs) and a sound switch. Pause at any time to get the same menu back.
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
- `nopreview` skips rendering the stage select previews at startup.

## Layout

```
index.html         page shell, HUD, touch controls
src/main.js        renderer, game loop, time scale (hit-stop, slow motion), quality management
src/config.js      sun direction, light colours, movement tuning, quality presets
src/glsl.js        shared shader code: noise, terrain, wind, atmosphere, character shadow
src/sky.js         sky, clouds and sun disc
src/sea.js         the bay: sky reflections and the sun's glitter
src/grass.js       grass blades and susuki plumes
src/terrain.js     the hilltop, coast, headlands and islands, far mountain ranges (JavaScript twin of the terrain function)
src/wind.js        wind field shared by the grass, dust and cloth
src/particles.js   drifting dust and seed fluff, landing puffs
src/figure.js      skeletons and sculpted, skinned bodies for the samurai and each kind of enemy
src/face.js        the samurai's face and hair, and the kasa's chin cords
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
src/ground.js      the floor under everyone's feet: the terrain on the hilltop, each hall's own floor and walls
src/stage.js       stage manager: entering and leaving halls, light and air per hall, shared effects, intros
src/boss.js        boss base: attack state machine, poise and stagger, phases, hazards, reflectable projectiles
src/arenamat.js    hall shading (stone, flagstones, brass, iron, timber, rock, crystal, glass, lava, grating, banners) and builders
src/vfx.js         sprite particles, floor telegraphs, shockwave rings, lightning
src/tube.js        tubes rebuilt every frame from a curve (tentacles, the wyrm's body)
src/stages/        the four halls and their bosses: cathedral + maw, forge + colossus, caves + wyrm, bastion + rider
```
