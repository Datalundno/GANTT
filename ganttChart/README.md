# DataLund Gantt Lab (experimental branch)

> **Not for AppSource or the public website download.** Stable store visual lives on `main`.
>
> Lab **0.2** adds a cockpit: Gantt + people load + task list (toggle in Format → Lab).

See [`docs/EXPERIMENTAL.md`](docs/EXPERIMENTAL.md) — including why Lab should **not** replace the simpler website package yet.

| | Value |
| --- | --- |
| Display name | **DataLund Gantt Lab** |
| GUID | `ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90` |
| Package | [`downloads/DataLundGanttLab.pbiviz`](downloads/DataLundGanttLab.pbiviz) |
| Sample | [`downloads/GanttSampleData.xlsx`](downloads/GanttSampleData.xlsx) |

```bash
cd ganttChart
npm install
npm run lint
pbiviz package
cp dist/ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90.*.pbiviz downloads/DataLundGanttLab.pbiviz
```

Import Lab alongside the stable visual — different GUID, so both can coexist in Desktop.
