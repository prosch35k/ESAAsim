# Scenarios

Every `.txt` sweatbox file in this folder becomes a button in the **Scenario** dialog.
The file name (without `.txt`) is the button text, e.g. `ESGG S1 SIM03.txt` -> "ESGG S1 SIM03".

To add one: drop the file here and push to `main`. A GitHub Action (`.github/workflows/scenarios.yml`)
rebuilds `data/scenarios.js` and bumps the cache version automatically.

Without GitHub: run `python3 tools/build_scenarios.py` yourself and commit the result.
When the app is served by a web server that shows directory listings, new files are also picked up live, with no build.
