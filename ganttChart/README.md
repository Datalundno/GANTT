# Power BI Gantt Chart Visual (internal)

Custom Gantt chart visual built with the Power BI Visuals SDK for local use in **Power BI Desktop** (Import a visual from a file). Not intended for AppSource certification.

## Toolchain

Verified against current packages (see plan notes):

| Requirement | Version |
| --- | --- |
| Node.js | **>= 20.19.0** (`powerbi-visuals-tools` engines) |
| `powerbi-visuals-tools` (`pbiviz`) | **7.2.1** |
| `powerbi-visuals-api` | **5.11.1** (`pbiviz.json` `apiVersion`) |
| `powerbi-visuals-utils-formattingmodel` | **7.1.0** |
| `d3` | **7.9.0** |

```bash
npm i -g powerbi-visuals-tools@latest
node -v   # must be >= 20.19.0
```

## Project layout

```text
ganttChart/
├── capabilities.json          # Data roles + table mapping + format objects
├── pbiviz.json
├── src/
│   ├── visual.ts              # IVisual entry
│   ├── settings.ts            # getFormattingModel settings cards
│   ├── data/
│   │   ├── types.ts
│   │   └── converter.ts       # Role-based mapping (never by column index order)
│   ├── render/
│   │   ├── layout.ts
│   │   ├── axis.ts
│   │   └── bars.ts
│   └── utils/
│       ├── dates.ts
│       └── contrast.ts
└── style/visual.less
```

## Install dependencies

From this folder:

```bash
npm install
```

## Package for Power BI Desktop (primary workflow)

```bash
pbiviz package
```

This writes a `.pbiviz` file under `dist/`. In Power BI Desktop:

1. Open a report.
2. Visualizations pane → **…** → **Import a visual from a file**.
3. Select `dist/ganttChart*.pbiviz`.
4. Bind fields:
   - **Task** (required)
   - **Start Date** (required)
   - **End Date** and/or **Duration**
   - Optional: Progress, Group, Resource, Tooltips

Re-run `pbiviz package` and re-import after code changes (Desktop does not live-reload packaged visuals).

## Local live development (optional — Power BI Service)

For the developer visual in the Power BI service:

```bash
# One-time SSL certificate
pbiviz --install-cert

# Serve the visual (keep this running)
pbiviz start
```

Then enable developer mode in Power BI service settings and drop the developer visual onto a report. This path is optional for Desktop-only workflows.

## Current status (Phase 4)

Working:

- Role-based table mapping; readable time scale + scroll; milestones; progress; today line
- Collapsible groups; color-by-resource
- **Selection / cross-filter** — click a bar; Ctrl/Cmd-click for multi-select; click empty canvas to clear; unselected bars dim
- **Host tooltips** — hover a bar for task, dates, duration, progress, group, resource, and Tooltips-role fields

Still planned: weekend shading / axis granularity override (Phase 5 polish).

## Notes

- No custom webpack config — bundling is handled by `pbiviz`.
- The visual runs in a sandboxed iframe: no external network calls and no `window.parent` access.
- Columns are always resolved by **role name**, so reordering fields in the field well does not break mapping.
