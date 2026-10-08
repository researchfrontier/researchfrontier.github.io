# researchfrontier-frontend

The **ResearchFrontier** web app — a SvelteKit SPA built to fully static assets
and deployed to GitHub Pages. Editorial, motion-aware, accessible; deliberately
not a grid of rounded, shadowed cards.

## Stack & design

- **SvelteKit + `adapter-static`** (SPA, `404.html` fallback) — static output, tiny
  JS, compiler-checked a11y, first-class motion.
- Talks to the FastAPI backend over CORS; the typed client in `src/lib` is
  hand-written for the slice and will be generated from `/openapi.json` (orval →
  TanStack Query) in a later phase.
- **Design principles:** editorial not dashboard; structure from rules/space/type,
  not shadows; a display serif (Fraunces) + grotesk (Space Grotesk) + mono (IBM
  Plex Mono); one decisive accent; data + provenance are the hero; all motion
  gated behind `prefers-reduced-motion`. Light/dark via tokens in `src/app.css`.

## Pages

- `/` — hero + hottest fields (output + momentum) + your followed fields.
- `/fields/` — browse the taxonomy, filter, follow/unfollow (localStorage for now).
- `/field/{id}/` — a field: **Papers** (badged, DOI-linked), **Directions** (topic
  momentum), **Digest** (the Mon/Wed/Fri brief). 7d / 30d window toggle.
- `/about/` — method, sources, badge legend, roadmap.

## Develop

```bash
npm install
cp .env.example .env         # set VITE_API_BASE to your backend (default localhost:8000)
npm run dev                  # http://localhost:5173
```

Run the backend + db first (via `researchfrontier-infra`) so the API responds.

## Build & deploy

```bash
npm run build                # -> ./build (static)
npm run preview              # serve the build locally
```

GitHub Pages deploy is automated by `.github/workflows/deploy-pages.yml`. Push
this repo as **`researchfrontier.github.io`** in the org for the clean root URL,
set repo variable `VITE_API_BASE` to the production API, and leave `BASE_PATH`
empty (set it only for a project-page deployment). `static/.nojekyll` keeps Pages
from stripping the `_app` asset folder.
