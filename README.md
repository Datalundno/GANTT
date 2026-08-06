# DataLund Gantt

Free custom **Gantt** visual for Microsoft Power BI by **DataLund** ([datalund.no](https://datalund.no/)).

| Path | Purpose |
| --- | --- |
| [`ganttChart/`](ganttChart/) | Power BI visual |
| [`ganttChart/docs/APPSOURCE.md`](ganttChart/docs/APPSOURCE.md) | AppSource checklist (`main`) |
| [`ganttChart/docs/EXPERIMENTAL.md`](ganttChart/docs/EXPERIMENTAL.md) | **Lab** features (this experimental branch) |

## Branches

| Branch | Visual | Notes |
| --- | --- | --- |
| `main` | DataLund Gantt | AppSource / stable |
| `cursor/experimental-gantt-lab-e6e8` | **DataLund Gantt Lab** | Toolbar, deps, fancy graphics — **not for store** |

## Website

https://github.com/Datalundno/Website → [datalund.no](https://datalund.no)

## Lab package (this branch)

```bash
cd ganttChart
npm install
pbiviz package
cp dist/ganttChartLab9F2E4A1B7C8D4056AE12F34B56C78D90.0.1.0.0.pbiviz downloads/DataLundGanttLab.pbiviz
```

Download: [`ganttChart/downloads/DataLundGanttLab.pbiviz`](ganttChart/downloads/DataLundGanttLab.pbiviz) (after build)
