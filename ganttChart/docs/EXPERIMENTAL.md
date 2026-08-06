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
- **Status colors** — done / late / at risk / on track / future (format pane toggle)
- **Richer graphics** — gradients, progress sheen, milestone gems, today marker + label, month grid, bar motion
- **Weekend shading** on by default

## Field wells

Same as stable, plus optional:

| Well | Purpose |
| --- | --- |
| Predecessor | Name of the predecessor **Task** (FS link) |

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
