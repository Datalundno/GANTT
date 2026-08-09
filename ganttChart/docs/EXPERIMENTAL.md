# DataLund Gantt Lab

Personal / experimental build. Separate visual identity from the AppSource package so both can sit in one `.pbix`.

| | Stable (AppSource / website) | Lab |
|---|---|---|
| Display name | DataLund Gantt | DataLund Gantt Lab |
| GUID | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` | `ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90` |
| Package | `downloads/ganttChart.pbiviz` | `downloads/DataLundGanttLab.pbiviz` |

## Should Lab replace the website download?

**No.** Keep **DataLund Gantt** (stable) as the public download. Lab is a playground for multi-panel “cockpit” ideas.

## Cockpit (0.2)

When **Format → Lab → Show cockpit panels** is on (default):

| Panel | Purpose |
|---|---|
| Gantt | Timeline (main) |
| Summary | Tasks / people / milestones / avg progress in the time window |
| People on tasks | Resource workload bars (needs **Resource** field) |
| Tasks & milestones | Scrollable list; click to select / cross-filter |

In a real Power BI report you’d usually build these as **separate visuals**. Lab packs them into one visual so you can try the layout quickly. That is **not** the AppSource direction.

## Time window

3 / 6 / 9 / 12M = **from today forward** N months (not centered).

## Required vs optional

**Required:** Task, Start Date, and End Date (or Duration instead of End).

**Optional:** Group, Resource, Progress, Planned Start/End, Predecessor, Tooltips.

## Build

```bash
cd ganttChart
npm run package
cp dist/ganttChartLab*.pbiviz downloads/DataLundGanttLab.pbiviz
```
