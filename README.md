# Stormdrop

A browser battle royale built with Three.js. You ride the Sky Coach (a bus under a hot-air balloon) over a 1 km island, drop and glide to one of 15 named areas, then loot, build and fight 19-29 bots while the storm closes in. The last one standing wins.

Everything in the game is original: the island, logo, art, outfits and sounds are generated in code. There are no external assets apart from the vendored Three.js build and the Google Fonts in `index.html`.

## Run it

The game is plain ES modules with no build step, but browsers block modules from `file://`, so serve the folder:

```bash
npm start            # node server.mjs  ->  http://localhost:8080
# or
python3 -m http.server 8080
```

Open the page, click **Press to start**, then **Play**. Click the game once if the browser asks for mouse capture.

## Controls

| Action | Keyboard & mouse | Xbox controller |
| --- | --- | --- |
| Move | W A S D | Left stick |
| Sprint | Shift | Left stick click |
| Look / aim | Mouse | Right stick |
| Fire / use | Left mouse | RT |
| Aim down sights | Right mouse | LT |
| Next / previous weapon | Mouse wheel, 1-5, H (harvesting tool) | RB / LB, D-pad down (tool) |
| Jump / open glider | Space | A |
| Crouch | Ctrl | B |
| Reload / interact | R / E | X (interacts when something is near, otherwise reloads) |
| Build | Q wall, F floor, C ramp, V roof | Y |
| In build mode | Left mouse place, G or right mouse edit, T material | RT place, LT edit, X/B/Y/A wall/floor/ramp/roof, D-pad right material |
| Inventory | I | D-pad up |
| Emote | B | D-pad left |
| Switch shoulder | X | Right stick click |
| Map | Tab or M | Select (View) |
| Menu | Esc | Start (Menu) |

## What's in the game

**Scale.** The island is 1000 x 1000 m. Players are 1.8 m tall with a 0.4 m capsule radius. Walk/sprint/crouch speeds are 5/7.5/2.5 m/s, and a jump reaches about 1.2 m. Freefall is 50 m/s down; the glider moves 15 m/s forward and 6 m/s down and opens on its own 85 m above the ground. The bus flies at 560 m.

**Storm.** It has the seven phases from the design table (waits, shrink times and damage per second). The first circle covers the whole island. Each next circle is 50-60% of the previous radius, with its center somewhere inside the old circle. After phase 7 the eye closes completely. Storm damage skips shields. The storm speed setting (normal, fast or very fast) gives roughly 24, 12 or 6 minute matches.

**Building.**
- Pieces snap to a 4 x 4 m grid with 3 m walls: wall, floor, ramp and pyramid roof.
- Each piece costs 10 materials; each material caps at 999.
- Wood, stone and metal have 150/300/450 HP. A piece starts weak and builds up to full HP, and metal is the slowest.
- Edit mode cuts a door, window or half-wall into a wall, or turns a ramp.
- A destroyed piece breaks, and anything that loses its connection to the ground collapses.
- The vertical grid lines up with the ground where a structure starts, so walls are not buried on slopes.
- Gathering gives 20-30 materials per swing, or 40-50 if you hit the glowing weak spot.

**Health and healing.** You have 100 health and 100 shield, and shield takes damage first. Bandages heal +15 HP up to 75. A med kit heals to 100. Mini shields give +25 up to 50, and the Shield Jug gives +50 up to 100. Using an item is interrupted by damage or sprinting.

**Weapons.**
- Assault rifle, pump shotgun, SMG, pistol, bolt sniper and rocket launcher, with the damage, fire rate, magazine and reload values from the design table.
- Rarity adds 5% damage per tier, and headshots do 1.5x-2x.
- Spread grows while moving and shrinks while aiming.
- Rifles are hitscan. The sniper fires a projectile with bullet drop, and rockets do splash and heavy structure damage.

**Inventory and loot.**
- 5 slots, and healing items take slots too. Ammo caps are light 250, medium 200, heavy 30, shells 50 and rockets 12.
- Ground items glow in their rarity color.
- Each building has one gold chest that plays a shimmer when you are close.
- Floor loot is denser in the high-loot areas.
- A supply drop falls every 2-3 minutes under a balloon, marked by a red flare.
- Eliminated players drop everything they carried.

**Camera.** Over the shoulder, 0.7 m right, 0.4 m up and 3 m back. FOV is 80, or 52 when aiming. You can switch shoulders. The sniper scope is first person with a zoom overlay.

**HUD.**
- Health and shield bars bottom left; hotbar, ammo and materials bottom right.
- Minimap with the storm top right; players left, eliminations and storm timer at the top, under a compass strip.
- Damage numbers, hit markers, damage direction, kill feed, and a full map with area names.

**Island.**
- 15 named areas with different biomes and loot levels.
  - **High loot:** Neon Heights (city), Crown Citadel (castle), Rustbelt Works (factory) and Skyline Observatory (mountain top).
  - **Medium:** Frostpeak Lodge, Mirage Mesa, Murkwater Bayou, Golden Acres, Glimmer Lake and Voltage Yard.
  - **Low:** Harbor Point, Timberline Camp, Amberwood Hollow, Sunscorch Outpost and Coral Cove.
- Two rivers, a lake, and roads with bridges between the areas.
- Drivable trucks are parked on the roads.
- Landmarks visible from far away: the city spire, the observatory on the snowy peak, the lighthouse and the windmill.

**Bots.** Each bot chooses a drop area and times its jump. Once down, it loots through doors and up stairs, opens chests, and picks a weapon by range. In fights it strafes, aims with skill-based error, builds a panic wall when shot, heals behind cover, gathers materials and rotates ahead of the storm. You can set the bot difficulty.

**Menus.** Title screen with logo and art. Lobby with Play, Locker, Settings and Controls. The loading screen shows a progress bar, a random tip and key art. You pick your jump from the bus, and the end screen shows your placement (#1 is the victory screen), eliminations, damage and time survived, with Play Again.

**Skins.** Ten original outfits made from six parts each: head, torso, arms, legs, backpack and glider. The locker shows rarity borders, a rotating preview and a glider preview.

## Code map

| File | What it does |
| --- | --- |
| `js/config.js` | Every tuning number (speeds, storm phases, weapons, heals, loot odds) |
| `js/world/island.js` | Named areas, biomes, rivers, roads |
| `js/world/terrain.js` | Heightmap, biomes, river/lake carving, road flattening, minimap painting |
| `js/world/structures.js` | Buildings per area (doors, stairs, loot spots, chests), landmarks |
| `js/world/props.js` | Instanced trees, rocks, wrecks (harvestable), bushes, crops |
| `js/physics.js` | Spatial hash, capsule movement with steps and ramps, raycasts |
| `js/actor.js` | Shared player/bot logic: movement modes, weapons, healing, inventory |
| `js/building.js` | Grid building, edits, build-up HP, structural collapse |
| `js/combat.js` | Hitscan, pellets, sniper drop, rockets, harvesting with weak spots |
| `js/loot.js` | Floor loot, chests, supply drops, death drops |
| `js/storm.js` | Storm phases and the storm wall shader |
| `js/bots.js` | Bot AI |
| `js/controller.js`, `js/input.js` | Keyboard/mouse/gamepad input and the camera |
| `js/hud.js`, `js/menus.js`, `js/lobby.js`, `js/art.js` | HUD, menus, locker stage, generated key art |
| `js/audio.js` | Synthesized WebAudio sound effects |

Three.js r186 is vendored in `vendor/` (MIT, see `vendor/THREE-LICENSE.txt`).
