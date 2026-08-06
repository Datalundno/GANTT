# DataLund Gantt Lab

Personal / experimental build. Separate visual identity from the AppSource package so both can sit in one `.pbix`.

| | Stable (AppSource / website) | Lab |
|---|---|---|
| Display name | DataLund Gantt | DataLund Gantt Lab |
| GUID | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` | `ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90` |
| Package | `downloads/ganttChart.pbiviz` | `downloads/DataLundGanttLab.pbiviz` |

## Should Lab replace the website download?

**No.** Keep **DataLund Gantt** (stable) as the public download on datalund.no and for AppSource.

## What should ship to stable (product direction)

| Feature | Decision |
|---|---|
| Expand / Collapse all | **Ship** — easy win when Group is used |
| Time window (3/6/9/12M + All) | **Ship** — Format toggle, **off by default** (not everyone uses month cycles) |
| Planned Start / End | **Do not ship** — prefer a confirmed flag + the same date fields |
| Dependencies / status colors / chrome | Stay in Lab |

Stable `1.7.0.0` (see PR for toolbar/expand) follows that list.

## Required vs optional (Lab)

**Required:** Task, Start Date, and End Date (or Duration instead of End).

**Optional:** Group, Resource, Progress, Planned Start/End, Predecessor, Tooltips.

## What Lab still adds beyond stable

- Planned baseline bars (Lab-only wells)
- Soft FS dependency lines
- Status colors, legend, progress toggle, rounded bars, animation, month grid

**Quiet by default** for polish toggles. Baseline and dependencies stay on when those fields are mapped.

## Build

```bash
cd ganttChart
npm run package
# → dist/ganttChartLab*.pbiviz → copy to downloads/DataLundGanttLab.pbiviz
```
