# DataLund Gantt Lab (experimental)

**Not for AppSource.** This branch pushes the visual with lab-only features so you can try ideas without touching the store package.

| | Stable (AppSource) | Lab (this branch) |
| --- | --- | --- |
| Display name | DataLund Gantt | **DataLund Gantt Lab** |
| GUID | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` | `ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90` |
| Download | `DataLundGantt.pbiviz` (main) | `downloads/DataLundGanttLab.pbiviz` |
| Coexist in Desktop? | Yes — different GUID |

## Lab features

- **Time window toolbar** — 3M / 6M / 9M / 12M / All (centered on today)
- **Expand / Collapse all** groups
- **Dependency arrows** — bind **Predecessor** (task name of the upstream task, finish-to-start)
- **Planned vs actual** — optional **Planned Start / Planned End**; thinner baseline bars under actual (Format → Lab → Show planned bars)
- **Status colors** — done / late / at risk / on track / future (format pane toggle)
- **Status legend** — Done / Late / … chips on the toolbar (**off by default**; Format → Lab → Show status legend)
- **Progress fill** — optional (**off by default**; Format → Lab → Show progress)
- **Richer graphics** — gradients, progress sheen, milestone gems, today marker + label, month grid, bar motion
- **Weekend shading** on by default

## Field wells

**Required:** Task + Start Date + End Date (Duration can replace End Date).

| Well | Required? | Purpose |
| --- | --- | --- |
| Task | Yes | Task name |
| Start Date | Yes | Actual / current start |
| End Date | Yes* | Actual / current end (*or Duration) |
| Duration | No | Alternative to End Date |
| Planned Start | No | Baseline / plan start |
| Planned End | No | Baseline / plan end |
| Progress | No | % complete (Format → Lab → Show progress) |
| Group / Resource / Predecessor / Tooltips | No | Layout, color, FS links, extras |

## Build

```bash
cd ganttChart
npm install
npm run lint
pbiviz package
cp dist/ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90.0.1.0.0.pbiviz downloads/DataLundGanttLab.pbiviz
```

## Notes

- Lab chrome (toolbar buttons) is intentional; do not copy into the AppSource visual without a design pass and certification review.
- Prefer Power BI date slicers for production windowing; the toolbar is for exploration.
- Dependency matching is by exact task name (first match wins).
