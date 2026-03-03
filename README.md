# Steam CS2 MVP

Minimal Next.js + TypeScript app to view Steam profile + CS2 hours with alias support.

Prerequisites
- Node 18+, npm
- Docker (optional)

Run locally (npm)

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

Open http://localhost:3000

Quick helper (Windows): there's a helper script `run-dev.bat` that kills node, removes build dirs and starts the dev server. Run it as Administrator if you still have permission issues:

```powershell
.\run-dev.bat
```

Alias testing (local)
- To simulate `<steamId>.tuti` behavior locally, either add a hosts entry mapping `7656119....tuti` to `127.0.0.1` or use the fallback route `/alias/<steamId>`.

Troubleshooting permissions on Windows
- If Next.js fails creating `.next`/trace with `EPERM` errors:
	- Close all `node.exe` processes in Task Manager.
	- Run your terminal as Administrator and re-run `run-dev.bat`.
	- If issues persist, move the project to a different folder (e.g. `C:\proyectos\SteamAliasApp`) and try again.

Testing with the sample Steam ID
- Open this URL in your browser once server is up:

```
http://localhost:3000/profiles/76561198261520885
```

Or call the API directly:

```bash
curl http://localhost:3000/api/profile/76561198261520885
```

Docker

```bash
docker compose up --build
```

Notes / limitations
- Uses scraping and public profile XML endpoint; some data (hours) may be unavailable for private profiles.
- Caching with SQLite (`data/cache.db`) for 10 minutes.
- Rate limiting is in-memory (per-process), appropriate for local/dev only.
- Heuristic cheater risk is simplistic and not authoritative.
