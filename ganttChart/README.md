# Power BI Gantt Chart Visual (Chartvik)

Custom Gantt chart visual for **Microsoft Power BI**, packaged for import in Power BI Desktop and submission to the **Power BI Visualization shop (AppSource)**.

Publisher: **Chartvik** · Support: [GitHub Issues](https://github.com/Chartvik/GANTT/issues)

## Download (this branch)

| Artifact | Link |
| --- | --- |
| Visual package (`.pbiviz`) | [ganttChart.pbiviz](https://github.com/Chartvik/GANTT/raw/cursor/gantt-chart-visual-280c/ganttChart/downloads/ganttChart.pbiviz) |
| Sample Excel | [GanttSampleData.xlsx](https://github.com/Chartvik/GANTT/raw/cursor/gantt-chart-visual-280c/ganttChart/downloads/GanttSampleData.xlsx) |
| AppSource logo (300×300) | [`assets/store/logo-300.png`](assets/store/logo-300.png) |

AppSource submission steps: [`docs/APPSOURCE.md`](docs/APPSOURCE.md) · Privacy: [`docs/PRIVACY.md`](docs/PRIVACY.md)

## Toolchain

| Requirement | Version |
| --- | --- |
| Node.js | **>= 20.19.0** |
| `powerbi-visuals-tools` (`pbiviz`) | **7.2.1** |
| `powerbi-visuals-api` | **5.11.1** |
| `powerbi-visuals-utils-formattingmodel` | **7.1.0** |
| `d3` | **7.9.0** |

```bash
npm i -g powerbi-visuals-tools@latest
node -v   # must be >= 20.19.0
```

## Project layout

```text
ganttChart/
├── capabilities.json
├── pbiviz.json
├── assets/
│   ├── icon.png                 # 20×20 pane icon
│   └── store/logo-300.png       # AppSource listing logo
├── stringResources/en-US/
├── docs/                        # Privacy, support, AppSource checklist
├── downloads/                   # Packaged .pbiviz + sample Excel
├── src/
│   ├── visual.ts
│   ├── settings.ts
│   ├── data/
│   ├── render/
│   └── utils/
└── style/visual.less
```

## Install & package

```bash
cd ganttChart
npm install
npm run lint
pbiviz package
# optional certification audit (no external requests expected)
pbiviz package --certification-audit
```

Import `dist/ganttChart*.pbiviz` (or `downloads/ganttChart.pbiviz`) in Power BI Desktop via **… → Import a visual from a file**.

### Field bindings

- **Task** (required)
- **Start Date** (required)
- **End Date** and/or **Duration**
- Optional: Progress, Group, Resource, Tooltips

## Features

- Timeline with auto or fixed axis granularity (day / week / month / quarter)
- Axis labels: date, ISO week number, or both
- Progress track + fill; zero-duration milestones
- Today line; optional weekend shading
- Collapsible groups; color-by-resource
- Selection / cross-filter; host tooltips; context menu
- Landing page when no fields are bound
- High-contrast support; English localization keys

### Format pane

| Card | Properties |
| --- | --- |
| Bars | Height, corner radius, fill, progress fill |
| Task labels | Font size, font family, pane width |
| General | Color by resource, today line + color, axis granularity, axis labels, weekend shading |

## Notes

- Do **not** change the visual GUID when publishing updates to AppSource.
- No custom webpack config — bundling is handled by `pbiviz`.
- Sandboxed iframe: no external network calls and no `window.parent` access.
- Columns are resolved by **role name**, not by field-well order.
