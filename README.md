# Rocket Arena

A Rocket League–style car soccer game that runs in the browser. It has 3D graphics, physics modelled on the real game, CPU opponents, **local 2-player split screen**, and full **Xbox controller** support.

![Gameplay at sunset](docs/gameplay-sunset.jpg)

| Main menu | 2-player split screen |
| --- | --- |
| ![Menu](docs/menu.jpg) | ![Split screen](docs/split-screen.jpg) |

![Night stadium](docs/gameplay-night.jpg)

## Features

- **Physics close to the real game.** It uses Rocket League's units and numbers: 2300 uu/s top speed, boost, supersonic, jump and double jump, flips and dodges, air roll, powerslide, and Psyonix-style ball hits. Cars can drive up the curved walls. The ball bounces and spins realistically.
- **Full soccar arena.** Standard field size with the corner walls and goals. All 34 boost pads are in their real positions: 6 big pads give 100 boost and 28 small pads give 12.
- **Game modes**
  - *Play vs CPU*: 1v1, 2v2 or 3v3 against bots with three skill levels (Rookie, Pro, All-Star).
  - *2 Players — Versus*: split screen, Player 1 (blue) vs Player 2 (orange). You can fill the teams with bots for 2v2 or 3v3.
  - *2 Players — Co-op*: split screen, both players on blue against CPU opponents.
- **Match rules.** Kickoff countdown, 3/5/7-minute or unlimited matches, and a golden-goal overtime. Time runs out only once the ball touches the ground. Goal explosions are followed by an instant replay. Supersonic hits demolish cars. The post-game screen shows stats (score, goals, assists, saves, shots, demos) and an MVP.
- **Realistic visuals.** Night or sunset stadium with a city skyline, a crowd and floodlights. The grass is mowed in stripes. Goals glow and the walls are hex-glass. Lighting is physically based, with shadows and bloom. The ball has glowing panels, and boost flames and smoke trails come in team colours.
- **HUD in Rocket League style.** Score and clock bar, circular boost meter, name plates, ball cam / car cam.
- **Sound effects** for the engine, boost, hits, goals and the crowd. All of them are generated in code, so no audio files are needed.
- **Controller rumble** on hits, bumps, demolitions and goals.

## Playing

### Quick start

Open `index.html` in Chrome, Edge or Firefox. No install or build is needed because the compiled game (`dist/game.js`) is already in the repo.

You can also serve the folder:

```bash
npm start          # serves the folder on http://localhost:8080
```

### On an Xbox

1. Host the game online. The easiest way is **GitHub Pages**: on GitHub open *Settings → Pages*, then choose *Deploy from a branch* with the `main` branch and the `/ (root)` folder.
2. On the Xbox, open **Microsoft Edge** and go to your Pages URL (`https://<user>.github.io/<repo>/`).
3. Pick **⛶ Fullscreen** in the main menu, or use Edge's full-screen option. Then play with your controllers.

The game uses the browser's Gamepad API, which works with Xbox One and Xbox Series controllers in Edge, Chrome and Firefox. On a PC, connect the controllers over USB or Bluetooth and press any button so the browser detects them.

### Two players

1. Choose **2 PLAYERS — VERSUS** (or **CO-OP vs CPU**) and set the match options.
2. On the join screen, each player presses **A** on their own controller. Keyboard players press **Space** (WASD layout) or **Enter** (arrow-keys layout). Press **B** to leave.
3. Once both players have joined, press **A** or **Start** to kick off. The screen splits top/bottom; you can switch to side-by-side in the setup screen.

## Controls

| Action | Xbox controller | Keyboard P1 | Keyboard P2 |
| --- | --- | --- | --- |
| Accelerate | **RT** | W | ↑ |
| Brake / reverse | **LT** | S | ↓ |
| Steer, and pitch/yaw in the air | **Left stick** | A / D (W / S pitch) | ← / → |
| Jump; press again to double jump, or flip with a stick direction | **A** | Space | K |
| Boost | **B** | Left Shift | L |
| Powerslide; hold for air roll | **X** | C / Left Ctrl | J |
| Air roll left / right | **LB / RB** | Q / E | U / O |
| Ball cam on/off | **Y** | R | I |
| Look around | **Right stick** | – | – |
| Pause | **☰ Menu** | Esc | P |

In single player, both keyboard layouts and any connected controller work together.

Moves to try:
- **Flip:** jump, then press jump again while pushing the stick. Front flips add a big burst of speed.
- **Wall driving:** drive into a wall at speed and the car rides up the curve.
- **Demolition:** hit an opponent head-on while supersonic (white trail).
- **Getting unstuck:** if you land on your roof, press jump to flip back onto your wheels.

## Settings

Graphics quality, default camera, field of view, goal replays, rumble, volume and an FPS counter can be changed in **Settings**. The defaults are **High** on desktop and **Medium** on Xbox. Choose **Low** on slower machines. You can also force a quality level with the URL, e.g. `index.html?quality=low`.

## Development

```bash
npm install        # three.js + esbuild
npm run build      # bundles src/ into dist/game.js (commit this file so the game runs without a build)
npm run dev        # live dev server on http://localhost:8080 that rebuilds on save
npm test           # physics unit tests + a headless bot-vs-bot simulation
npm run test:browser   # Playwright tests: 2P with two simulated Xbox pads, full match flow
```

### Project layout

```
index.html, style.css      page, HUD and menu styles
dist/game.js               built game (generated by `npm run build`)
src/
  main.js                  app bootstrap, main loop, settings
  config.js                arena size, physics constants, boost pad layout
  arena.js                 arena collision (signed distance field) + outline for meshes
  physics/                 car, ball and world simulation (fixed 120 Hz step)
  ai.js                    CPU players
  game.js                  match flow: kickoff, goals, overtime, replays, stats
  input.js                 keyboard + Gamepad API (Xbox mapping, rumble)
  hud.js, menu.js          scoreboard/boost meter and controller-friendly menus
  audio.js                 WebAudio sound effects
  render/                  three.js stadium, car model, effects, camera, renderer
tests/                     node + Playwright tests
```

---

Rocket Arena is a fan-made, non-commercial tribute. It is not affiliated with or endorsed by Psyonix or Epic Games. "Rocket League" is a trademark of Psyonix LLC.
