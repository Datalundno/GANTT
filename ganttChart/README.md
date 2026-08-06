# DataLund Gantt Lab (experimental branch)

> **Not for AppSource.** Stable store visual lives on `main`. This branch is a playground: toolbar time windows, dependency arrows, status colors, richer graphics.

See [`docs/EXPERIMENTAL.md`](docs/EXPERIMENTAL.md).

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
cp dist/ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90.0.1.0.0.pbiviz downloads/DataLundGanttLab.pbiviz
```

Import the Lab `.pbiviz` alongside the stable visual — different GUID, so both can coexist in Desktop.
