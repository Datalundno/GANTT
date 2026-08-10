# DataLund Task List — agent kickoff

Copy this file into the new Task List repo (or point the agent at it). Implement a **separate** Power BI custom visual that ships as an uploadable `.pbiviz`. Do **not** fold Task List into Gantt or Resource Load.

**Reference implementation:** [Datalundno/GANTT](https://github.com/Datalundno/GANTT) → `ganttChart/` (DataLund Gantt 1.8.x).  
**Sibling briefs:** Resource Load → `RESOURCE_LOAD.md` in the Gantt repo (separate visual).  
**Suite contracts:** follow the density table and field-role names below (same as Gantt `SUITE.md`).

---

## 1) One job

**Task List** is a **browse + select** list of tasks/projects — scannable rows that drive cross-filtering to Gantt, Resource Load, and native visuals.

| | |
| --- | --- |
| **Display name** | DataLund Task List |
| **Publisher** | DataLund (`datalund.no`) |
| **Offer ID (example)** | `datalund-task-list` |
| **Primary audience** | Project / PMO “pulse” pages next to DataLund Gantt |
| **Output** | Importable `.pbiviz` (+ later AppSource) |

Gantt answers *when*. Resource Load answers *who is busy*. Task List answers *what’s in the portfolio right now* and lets the user **pick rows** to filter the page.

---

## 2) Suite contracts (mandatory)

### Density presets

Format → **General → Density**. Use **exactly** these names and numbers. Do not invent Small/Medium/Huge.

| Preset | Intent | barHeight | rowGap | fontSize | labelWidth | cornerRadius |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Compact** | Many visuals on one page | 16 | 8 | 10 | 140 | 2 |
| **Comfortable** | Default | 28 | 12 | 12 | 200 | 4 |
| **Large** | Sparse pages / presenting | 36 | 16 | 14 | 240 | 6 |
| **Custom** | Use each visual’s own size sliders | — | — | — | — | — |

For a list visual, map density to **row height**, **font size**, **horizontal padding**, and **corner radius** of any progress track / status chip. Copy `ganttChart/src/suite/density.ts` and extend with list-specific derived sizes if needed — keep the preset **names** identical.

### Shared field role **names**

Keep role `name` values identical to the suite so reports can reuse the same columns:

| Role | `name` | Kind | Notes |
| --- | --- | --- | --- |
| Task | `task` | Grouping | **Required.** Row title (project / task name). |
| Group | `group` | Grouping | Optional. Phase / parent; supports section headers or a column. |
| Resource | `resource` | Grouping | Optional. Assignee / project lead column. |
| Progress | `progress` | Measure | Optional. 0–1 or 0–100; show as bar or %. |
| Start Date | `startDate` | GroupingOrMeasure | Optional. Column / sort. |
| End Date | `endDate` | GroupingOrMeasure | Optional. Column / sort. |
| Duration | `duration` | Measure | Optional. Days; alternative to End. |
| Status | `status` | Grouping | **Optional but recommended.** RAG or project status text (see below). |
| Tooltips | `tooltipFields` | Grouping | Optional; up to ~8 extra fields (milestones, obstacles, notes). |

**Do not rename** existing suite role names (`task`, `group`, `resource`, `progress`, `startDate`, `endDate`, `duration`, `tooltipFields`).

#### Status role (suite extension for Task List)

Gantt/Resource Load do not require `status`. Task List should add:

| Role | `name` | Kind | Notes |
| --- | --- | --- | --- |
| Status | `status` | Grouping | Free text or RAG (`Red` / `Amber` / `Green`, or R/A/G). Used for color chip + sort. |

Document this addition in the new repo README. Do **not** change Gantt capabilities; other visuals may adopt `status` later.

Display names in the field well can be friendlier (“Project”, “Project lead”, “RAG”) but `capabilities.json` `name` values must stay stable.

---

## 3) Visual behaviour (v1 scope)

### Layout

One composition: a **vertical list** (not a mini-dashboard).

- Each **row** = one task (from `task`).
- Columns (show/hide via format pane or auto if bound):
  - Status chip (if `status` bound)
  - Task name (always)
  - Resource
  - Group / phase
  - Progress bar + %
  - Start / End (compact date format)
- Optional **group headers** when `group` is bound (collapsible nice-to-have; static section headers OK for v1).
- Density presets control row height and type size.
- Landing page when `task` is missing (branded DataLund, short bind steps).
- Empty / error message states.
- Virtualize or cap rows sensibly (match Gantt’s dataReduction top count mindset; document limit in README).

**No cards-as-decoration.** Rows are the interaction surface. Status is a small chip/dot in the row — not floating badges over a hero.

### Encoding

1. **Status / RAG:** map common values case-insensitively:
   - Red / R / Critical → red chip  
   - Amber / Yellow / A / At risk → amber chip  
   - Green / G / On track → green chip  
   - Unknown / other → neutral chip + full text in tooltip  
   Allow format-pane overrides for the three RAG colors.
2. **Progress:** track + fill (reuse Gantt progress color language) or numeric %; clamp 0–100.
3. **Sort (v1):** format option or stable default — by Group then Task, or by Status (Red first), or by End date. Pick a sensible default; expose at least one sort control if feasible.
4. **Stale / missing dates:** still show the row; don’t crash. Invalid progress → hide bar or show “—”.

### Interaction

- **Click row** → select that task’s `selectionId` (cross-filter Gantt / other visuals). Multi-select with Ctrl/Cmd if the host selection manager supports it (same patterns as Gantt).
- **Clear selection** on empty list background click.
- Tooltips: all bound columns + tooltipFields.
- Context menu on empty space and on rows (AppSource expectation).
- Keyboard: basic focus/aria where practical (`supportsKeyboardFocus` like Gantt).

### Out of scope for v1

- Inline editing of List values.
- Rich text / Markdown rendering of obstacles.
- Sparklines / RAG trend history (that’s a future “Pulse” visual if needed).
- Embedded Gantt bars inside the list.
- Cockpit / multi-panel lab UI.
- Whitelabel dual-brand packaging (can add later like Gantt).

---

## 4) Architecture (clone from Gantt, then simplify)

Suggested folder layout:

```text
taskList/
  pbiviz.json
  capabilities.json
  package.json
  src/
    visual.ts
    settings.ts
    suite/density.ts
    data/types.ts
    data/converter.ts
    data/groups.ts       # optional section headers by group
    render/layout.ts
    render/rows.ts       # list rows, chips, progress
    utils/status.ts      # RAG mapping
    utils/tooltips.ts
    utils/contrast.ts
  style/visual.less
  stringResources/en-US/resources.resjson
  assets/icon.png
  assets/store/logo-300.png
  downloads/              # packaged .pbiviz + sample xlsx
  docs/PRIVACY.md
  docs/SUPPORT.md
  docs/APPSOURCE.md
  README.md
```

### Toolchain (match Gantt)

| Requirement | Version |
| --- | --- |
| Node.js | >= 20.19.0 |
| `powerbi-visuals-tools` | 7.2.1 |
| `powerbi-visuals-api` | 5.11.1 |
| `d3` | 7.9.0 (or DOM-only if you prefer; D3 joins are fine) |
| Formatting model | `powerbi-visuals-utils-formattingmodel` 7.x |

### Patterns to copy

From [Datalundno/GANTT](https://github.com/Datalundno/GANTT) `ganttChart/`:

- Table `dataViewMappings` + role index converter
- Selection manager + `registerOnSelectCallback`
- Density resolve in `update()` before layout
- Formatting settings cards aligned 1:1 with `capabilities.json`
- High-contrast helpers
- Landing page, tooltips role, context menu, empty `privileges`, no external requests

You do **not** need Gantt’s time axis, weekend shading, or time-window toolbar for v1.

### Identity (new visual — generate once, never change)

| Field | Value |
| --- | --- |
| `visual.name` | `taskList` (or similar camelCase) |
| `displayName` | `DataLund Task List` |
| `guid` | **Generate a new GUID** (do not reuse Gantt or Resource Load) |
| `version` | Start at `1.0.0.0` |
| `supportUrl` | `https://datalund.no/support/` |
| Help / product URL | `https://datalund.no/visuals/task-list/` (Website repo can add page later) |
| Author | DataLund / same email as Gantt `pbiviz.json` |

---

## 5) Capabilities sketch

Minimum conditions:

- `task` min 1, max 1  
- `group` max 1  
- `resource` max 1  
- `progress` max 1  
- `startDate` max 1  
- `endDate` max 1  
- `duration` max 1  
- `status` max 1  
- `tooltipFields` max 8  

Required to render: **Task** only. Everything else enriches columns.

Format objects (v1):

- **General:** density, sortOrder (e.g. name / status / endDate), showGroupHeaders, alternateRowShading (bool)  
- **Status:** red / amber / green colors  
- **Progress:** track/fill colors, show percent label  
- **Labels / rows:** fontSize, fontFamily, row padding (Custom density uses these)

---

## 6) Sample data & Lists mapping

Ship a small Excel sample with columns the visual binds to.

Typical Microsoft Lists → roles:

| Lists field | Role |
| --- | --- |
| Project name | `task` |
| Project status or RAG from updates | `status` |
| Project lead | `resource` |
| Phase / Type / Domain / Primary arena | `group` |
| Progress (%) | `progress` |
| Start date / Estimated end | `startDate` / `endDate` |
| Next milestone, obstacles, development | `tooltipFields` |

Report tip: bind the **latest** update’s RAG/progress (via measure or pre-aggregated table) so the list shows current pulse, not history.

---

## 7) Packaging & acceptance criteria

```bash
cd taskList   # or repo root if visual lives at root
npm install
npm run lint
pbiviz package
pbiviz package --certification-audit   # no external requests
cp dist/*.pbiviz downloads/taskList.pbiviz
```

**Done when:**

- [ ] `.pbiviz` imports into Power BI Desktop without errors  
- [ ] Landing page shows until Task is bound  
- [ ] Rows render for each task; optional columns appear when fields are bound  
- [ ] RAG/status chips color correctly for Red/Amber/Green variants  
- [ ] Progress displays when bound  
- [ ] Clicking a row cross-filters other visuals (verify next to Gantt if available)  
- [ ] Density presets change row/type size per suite table  
- [ ] Tooltips show bound fields  
- [ ] No network calls; empty `privileges`  
- [ ] README explains field binding, status mapping, and density  
- [ ] Privacy + Support markdown exist (sandbox-only, no telemetry)  

AppSource polish (logo 300×300, 1366×768 screenshots, sample `.pbix`) can follow v1 — mirror Gantt `docs/APPSOURCE.md`.

---

## 8) Implementation order

1. Scaffold `pbiviz` project + package metadata + icon stub  
2. `capabilities.json` (include `status`) + settings + density module  
3. Converter → row view model  
4. Render list rows (name, chip, progress, meta columns)  
5. Selection, tooltips, context menu, landing page  
6. Group headers + sort option  
7. Sample Excel + README  
8. `pbiviz package` and smoke-test checklist above  

---

## 9) Agent rules

- Follow this file and the density/role contracts; do not invent parallel naming for shared roles.  
- One visual, one job — browse + select list only.  
- Prefer copying proven Gantt utilities (selection, tooltips, contrast, density) over rewriting host integration.  
- Keep code structured (`data/`, `render/`, `suite/`, `utils/`) like Gantt.  
- Free visual; branded **DataLund Task List**.  
- When the package builds, place a stable copy under `downloads/` for website/release mirroring.

---

## 10) Reference links

- Gantt source: https://github.com/Datalundno/GANTT  
- Resource Load brief (sibling): `RESOURCE_LOAD.md` in the Gantt repo  
- Website: https://github.com/Datalundno/Website → https://datalund.no  
- Gantt product page pattern: https://datalund.no/visuals/gantt/  
- Power BI custom visuals: https://learn.microsoft.com/en-us/power-bi/developer/visuals/  
