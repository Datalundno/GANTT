# Gantt Chart (Power BI visual)

Unbranded Gantt custom visual for Microsoft Power BI.

| | Value |
| --- | --- |
| Display name | **Gantt Chart** |
| GUID | `ganttChartWL7E4A9C2F1B8D4056AE12F34B56C78D01` |
| Version | 1.8.2.0 |
| Package | [`downloads/GanttChart.pbiviz`](downloads/GanttChart.pbiviz) |

Same feature set as branded 1.9.2.0: phases that share a Line draw on one row, and Past events can show all, keep the last calendar month, or hide past bars. Version stays on the white-label 1.8.x line.

```bash
cd ganttChart
npm install
npm run lint
pbiviz package
cp dist/ganttChartWL7E4A9C2F1B8D4056AE12F34B56C78D01.1.8.2.0.pbiviz downloads/GanttChart.pbiviz
```
