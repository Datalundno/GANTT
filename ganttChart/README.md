# Gantt Chart (Power BI visual)

Unbranded Gantt custom visual for Microsoft Power BI.

| | Value |
| --- | --- |
| Display name | **Gantt Chart** |
| GUID | `ganttChartWL7E4A9C2F1B8D4056AE12F34B56C78D01` |
| Version | 1.8.1.0 |
| Package | [`downloads/GanttChart.pbiviz`](downloads/GanttChart.pbiviz) |

Density: Format → General → Density (Compact / Comfortable / Large / Custom).  
Color by: Format → General → Color by (Default / Resource / Group / Task).

```bash
cd ganttChart
npm install
npm run lint
pbiviz package
cp dist/ganttChartWL7E4A9C2F1B8D4056AE12F34B56C78D01.1.8.1.0.pbiviz downloads/GanttChart.pbiviz
```
