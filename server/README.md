# ESAAsim relay server

A tiny WebSocket relay (no dependencies) that lets a mentor and students share one session.
The mentor's program runs the simulation; students see the same traffic and send instructions as proposals.

## Run locally
    node server.js        # listens on PORT (default 8080)
In Connect use `ws://localhost:8080`.

## Free hosting (Render)
1. Push this repo to GitHub (already done).
2. render.com -> New -> Web Service -> pick the repo.
3. Root Directory: `server`, Build Command: (empty), Start Command: `node server.js`, Instance type: Free.
4. When deployed, copy the URL (https://xxx.onrender.com) and use `wss://xxx.onrender.com` in Connect.
Free instances sleep after ~15 min idle; the first connection can take ~30 s to wake it up.
Fly.io and Railway work the same way (start command `node server.js`, listen on `PORT`).

## VATSIM login (OAuth2)
The server performs the VATSIM Connect login (the client secret must never be in the app). Set these environment variables:

| Variable | Value |
|---|---|
| `VATSIM_CLIENT_ID` | from your VATSIM Connect client |
| `VATSIM_CLIENT_SECRET` | from your VATSIM Connect client |
| `VATSIM_REDIRECT_URI` | `https://<your-server>/auth/callback` (register exactly this in the client) |
| `VATSIM_AUTH_BASE` | optional; `https://auth-dev.vatsim.net` for the sandbox (default is production) |
| `SESSION_SECRET` | any long random string |

Scopes requested: `full_name vatsim_details`. Rating S2 or higher may choose mentor or student; OBS/S1 are always students (enforced by the server).
Without `VATSIM_CLIENT_ID` the server requires no login (handy for local testing). `VATSIM_MOCK=1` fakes a login for testing only.
Request a client at https://vatsim.dev (Connect). 
