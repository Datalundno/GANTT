# AGENTS.md

## Cursor Cloud specific instructions

### Repository layout
- On `main`, the only runnable product is the **Datalund marketing website** in `website/` — a Vite + TypeScript vanilla SPA (no backend, database, API, env vars, or secrets). It is a static single-page site deployed to GitHub Pages via `.github/workflows/deploy-pages.yml`.
- The `ganttChart/` Power BI custom visual referenced in the root `README.md` lives only on a separate feature branch (`cursor/gantt-chart-visual-280c`), not on `main`. Do not expect it to be present when working on `main`.

### Website (`website/`)
- All commands run from the `website/` directory. Node 22 is used in CI (`.github/workflows/deploy-pages.yml`); the VM has Node 22 available.
- Commands (see `website/package.json`):
  - Dev server: `npm run dev` — Vite on `http://localhost:5173/`.
  - Build: `npm run build` — runs `tsc && vite build`, output to `website/dist/`.
  - Preview built site: `npm run preview`.
- There is **no `lint` script and no test framework**. Type-checking is the de-facto lint and runs as part of `npm run build` (via `tsc`); to type-check without building, run `npx tsc --noEmit`.
- The site loads Google Fonts from a CDN in `website/index.html`; fonts may not load without outbound network, but this does not affect functionality or layout structure.
- `website/public/CNAME` pins the custom domain (`datalund.no`) and `vite.config.ts` sets `base: '/'`; leave these as-is for GitHub Pages deployment.
