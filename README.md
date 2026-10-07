# ENSO Command Center · NDMA

AI-assisted GIS portal for monitoring **ENSO, the Indian Ocean Dipole, MJO and ocean conditions** that drive Pakistan's monsoon and drought risk.

React 19 · Vite · Tailwind CSS 4 · Mapbox GL JS 3 · Redux Toolkit · Framer Motion · Axios · Google Gemini (server-side)

---

## Quick start

```bash
npm install
cp .env.example .env        # then fill in the values
npm run dev:all             # API on :8787 + Vite on :5173 (opens the portal)
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server only (AI + climate indices fall back gracefully) |
| `npm run dev:api` | Backend only, auto-restarts on change |
| `npm run dev:all` | Both together — use this for day-to-day work |
| `npm run build` | Production build to `dist/` |
| `npm start` | Serves `dist/` **and** the API from one Node process (production) |
| `npm run lint` | ESLint |

## Environment

| Variable | Where it's used | Notes |
|---|---|---|
| `VITE_MAPBOX_ACCESS_TOKEN` | Browser | Public `pk.` token. Restrict it to your domain in the Mapbox dashboard. |
| `VITE_GEOSERVER_URL` | Browser | Optional. e.g. `http://localhost:8080/geoserver`. GeoServer must allow CORS. |
| `VITE_API_BASE_URL` | Browser | Optional. Leave empty to use same-origin `/api`. |
| `GEMINI_API_KEY` | **Server only** | Google AI Studio key. Never prefix with `VITE_` — that would ship it to every visitor. |
| `GEMINI_MODEL` | Server | Defaults to `gemini-2.5-flash`. |
| `API_PORT` | Server | Defaults to `8787`. |
| `ALLOWED_ORIGINS` | Server | Comma-separated origins allowed to call the API cross-origin. |

## Architecture

```
Browser (React)                         server/index.js (Node, zero deps)
┌──────────────────────────────┐        ┌─────────────────────────────────┐
│ AppShell                     │        │ POST /api/ai  ──► Google Gemini │
│  ├─ MapboxMap  (ONE instance)│ /api → │ GET  /api/climate/oni ─► NOAA   │
│  ├─ Pages (lazy chunks)      │        │ GET  /api/climate/dmi ─► NOAA   │
│  ├─ AIDrawer  (non-blocking) │        │ GET  /api/health                │
│  └─ MapSearch (⌘K)           │        │ static dist/ (production)       │
└──────────────────────────────┘        └─────────────────────────────────┘
        │ WMS tiles                                  
        ▼                                            
  NASA GIBS · GeoServer (WMS / WMTS / WFS)
```

### One map, deduplicated layers
The old portal created a new Mapbox map on every page (plus two extra mini-globes) and loaded **Sea Surface Height** and **Sea Surface Salinity** twice. Now:

* `src/components/map/MapboxMap.jsx` is the only place `new mapboxgl.Map` is called. It lives in the app shell and is never re-created when you change pages, basemaps or layers.
* `src/config/mapLayers.js` lists each dataset exactly once: SST, SST Anomaly, Currents, SSH Anomaly, Salinity, Precipitation, and the ENSO/IOD monitoring regions (GeoJSON).
* Layers download tiles only after they are first switched on.
* Old URLs (`/sst`, `/ssh`, `/sss`, `/ssc`, `/ssta`) open the map with that layer switched on.

### Map features
Basemaps (dark, satellite, satellite-streets, streets, light, outdoors) · globe ↔ flat projection with atmosphere · 3D terrain · auto-rotate · zoom / compass / pitch · fullscreen · locate me · scale bar · distance & area measurement (geodesic) · live cursor coordinates · place / coordinate / layer search · quick views · layer visibility, opacity and ordering · colour legends · clickable features with an inspector · GeoServer WMS/WFS layers added from GetCapabilities.

### AI (Explain · Simplify · Translate · Ask)
* One service — `src/services/aiService.js` — handles every AI action with request types `EXPLAIN_FEATURE`, `EXPLAIN_LAYER`, `EXPLAIN_MAP`, `EXPLAIN_SELECTED_FEATURE`, `SIMPLIFY_CONTENT`, `TRANSLATE_CONTENT`, `ANSWER_GIS_QUESTION`.
* Requests are sent only when the user clicks something; answers are cached by type + language + subject + content, concurrent duplicates are merged, and requests can be cancelled.
* The AI receives **structured context** (`src/config/aiFeatures.js`, layer metadata, current map state, latest index values) — never scraped UI text. Prompts and guard-rails live on the server (`server/prompts.js`): no invented data, technical terms (WMS, GeoJSON, EPSG…) kept untranslated.
* The panel always shows **Known application information** separately from the **AI-generated explanation**. If AI is unavailable, the known information still appears and the rest of the app keeps working.

### Languages
English, اردو, العربية, 中文, Français, Español. UI dictionaries are code-split (`src/i18n/locales/*.js`) and right-to-left layout is automatic for Urdu and Arabic. To add a language: create `src/i18n/locales/<code>.js` and add it to `src/i18n/languages.js`.

### Performance
Route-level code splitting with hover prefetch · mapbox-gl loaded on demand in its own chunk · animation features lazy-loaded (`LazyMotion`) · per-language dictionaries and fonts loaded on demand · iframes and videos load only when opened / scrolled into view · debounced, cancellable geocoding and WFS requests · cursor coordinates outside Redux.

## Briefing media
Videos and GIFs are not stored in git. Put them in `public/media/` — see `public/media/README.md` for the exact file names. Missing files show a placeholder instead of breaking the page.

## Data sources
NASA GIBS (map layers) · NOAA CPC Oceanic Niño Index · NOAA PSL Dipole Mode Index (HadISST) · Mapbox / OpenStreetMap basemaps.
