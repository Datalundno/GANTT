# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
A single Power BI **custom visual** (a Gantt chart) built with the Power BI Visuals SDK. All code lives in [`ganttChart/`](ganttChart/); there is no separate backend/frontend. See [`ganttChart/README.md`](ganttChart/README.md) for the full toolchain and field-binding details.

### Node / pbiviz environment gotchas
- The build tool is `pbiviz` (`powerbi-visuals-tools`). It is **not** a project dependency in `package.json`; it is installed **globally** by the startup update script (pinned to `7.2.1`).
- On this VM the active `node` is `/exec-daemon/node` and npm's default global prefix resolves to `/` (not writable). The update script fixes this by pointing npm's global prefix at the nvm node dir (whose `bin/` is already on `PATH`), so `pbiviz` lands on `PATH` for all shells. If `pbiviz: command not found`, re-run: `npm config set prefix "$(dirname "$(dirname "$(which npm)")")"` then `npm install -g powerbi-visuals-tools@7.2.1`.
- Node must be `>= 20.19.0` (satisfied by the VM's node).

### Common commands (run from `ganttChart/`)
- Lint: `npm run lint` (eslint via `eslint-plugin-powerbi-visuals`).
- Build a distributable: `pbiviz package` → writes `dist/*.pbiviz` (also runs lint first).
- Dev server (live reload for the Power BI **Service** developer visual): `pbiviz start` → serves the compiled bundle over HTTPS on `https://localhost:8080/` (assets at `/assets/visual.js`, `/assets/status`). Uses a self-signed cert auto-generated under `~/pbiviz-certs`.

### Testing / running caveats
- The visual only fully **renders inside Power BI Desktop (Windows) or the Power BI Service**, neither of which runs on this Linux VM. Do not expect an interactive app UI here.
- To validate the actual rendering logic without a Power BI host, drive the pure source pipeline directly: `convertDataView` (in `src/data/converter.ts`) turns a mock `DataView` into a view model, and the `src/render/*` functions draw the SVG with d3. These modules have no runtime dependency on the Power BI host (the `powerbi-visuals-api` imports are type-only), so they can be exercised under Node with `jsdom` for a DOM. This is the recommended "does it actually work" check.
- There are no automated test suites, no git hooks, and no `.cursor/environment.json` in this repo.
