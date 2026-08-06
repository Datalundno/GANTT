# DataLund Gantt Lab

Personal / experimental build. Separate visual identity from the AppSource package so both can sit in one `.pbix`.

| | Stable (AppSource) | Lab |
|---|---|---|
| Display name | DataLund Gantt | DataLund Gantt Lab |
| GUID | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` | `ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90` |
| Package | `downloads/DataLundGantt.pbiviz` | `downloads/DataLundGanttLab.pbiviz` |

## Should Lab replace the website download?

**No.** Keep **DataLund Gantt** (stable) as the public download on datalund.no and for AppSource.

| Audience | Offer |
|---|---|
| Website visitors / AppSource | Stable — fewer fields, familiar chart |
| You / early testers | Lab — optional extras, still simple defaults |

Lab can be a secondary “Preview / Lab” link later if you want. Do not make it the primary download until you are ready to certify those extras (or drop them from the certified build).

## Required vs optional

**Required:** Task, Start Date, and End Date (or Duration instead of End).

**Optional:** Category, Progress, Status, Planned Start/End, Predecessor, Milestone, Description.

## What Lab adds (all optional)

- Toolbar: 3 / 6 / 9 / 12 months and All
- Expand / collapse categories
- Planned baseline (when Planned Start/End are mapped)
- Soft FS dependency lines (when Predecessor is mapped)
- Format pane **Lab**: status colors, legend, progress, baseline, deps, rounded bars, animation, month grid

**Quiet by default:** status colors, legend, progress, rounded bars, animation, and month grid are **off**. Baseline and dependencies stay **on** so mapped fields appear without opening Format.

## Build

```bash
cd ganttChart
npm run package
# → dist/datalundGanttLab.*.pbiviz → copy to downloads/DataLundGanttLab.pbiviz
```
