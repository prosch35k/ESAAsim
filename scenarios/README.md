# Scenarios

Every `.txt` sweatbox file in this folder shows up in the **Scenario** dialog in the simulator.
The file name (without `.txt`) is the name shown there, e.g. `ESGG S1 SIM03.txt` -> "ESGG S1 SIM03".

To add a scenario:

1. Put the sweatbox `.txt` file in this folder.
2. Run `python3 tools/build_scenarios.py` (regenerates `data/scenarios.js`).
3. Bump the `?v=` on the `data/scenarios.js` tag in `index.html`, then commit.
