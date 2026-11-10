# PreSim

Browser-based ground-control training simulator for Gothenburg Landvetter (ESGG), styled after EuroScope
(ESAA profile, sector files, Ground Radar / TopSky / CDM plugin settings).

## Run
No build step. Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000     # then open http://localhost:8000

Voice input (push-to-talk with Left Ctrl) needs a Chromium-based browser / the Claude desktop app and is
provided by Claude artifact capabilities (`dictation`, `tts`, `sample`). Outside Claude the typed radio box works.

## Layout
    index.html          page markup + script load order
    css/style.css       all styling
    fonts/SMR_ESGG.ttf  taxiway/stand label font from the sector files
    data/airport.js     generated airport data `D` (map, stands, holding points, network, list layouts)
    data/sids.js        SID waypoint tables (AIRAC) `SIDF`, `FXP`
    js/core.js          canvas, projection, helpers, global state
    js/network.js       ground network snapping + routing (Dijkstra, ordered "via" routing)
    js/aircraft.js      aircraft model, landing/rollout, taxi physics, SID logic
    js/labels.js        Ground Radar plugin tag lines
    js/radar.js         radar drawing
    js/lists.js         EuroScope-style lists, menus, flight-plan and DEP CLEARANCE dialogs, tag ownership/transfer
    js/input.js         mouse/keyboard input, side panel, runway selector, other controllers
    js/voice.js         ATC phraseology parser, pilot readbacks (TTS), push-to-talk
    js/main.js          startup and main loop
    tools/build_single.py   bundle everything into one self-contained HTML file (dist/presim.html)
    backend/            reserved for a future server (multi-user, persistence)

Scripts are classic (non-module) scripts that share one global scope, so load order in `index.html` matters.

## Conventions
- All UI text in English.
- Status (STS) is never changed automatically; voice commands only move aircraft and produce readbacks.
- Dragging uses the right mouse button, except moving a radar tag (left button).
