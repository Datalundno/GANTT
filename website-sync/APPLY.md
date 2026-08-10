# Website agent — ship DataLund Gantt **1.8.0.0** (branded only)

Apply in **`Datalundno/Website`**, push to `main` so Pages deploys.

## Branded vs unbranded

| | **Branded — website** | **Unbranded — personal only** |
| --- | --- | --- |
| Name | DataLund Gantt | Gantt Chart |
| File | `ganttChart.pbiviz` **1.8.0.0** | `GanttChart.pbiviz` |
| Link on site | `/downloads/ganttChart.pbiviz` | **Do not add** |
| Direct release | https://github.com/Datalundno/GANTT/releases/download/v1.8.0.0/ganttChart.pbiviz | https://github.com/Datalundno/GANTT/releases/download/whitelabel-1.8.0.0/GanttChart.pbiviz |

## Copy from `website-sync/` (GANTT `main`)

```bash
SYNC=<path-to-GANTT>/website-sync
cp "$SYNC/public/downloads/ganttChart.pbiviz" public/downloads/ganttChart.pbiviz
cp "$SYNC/public/visuals/gantt/index.html" public/visuals/gantt/index.html
cp "$SYNC/index.html" index.html
git add public/downloads/ganttChart.pbiviz public/visuals/gantt/index.html index.html
git commit -m "Ship DataLund Gantt 1.8.0.0 (time window from today)"
git push origin main
```

## Verify

- https://datalund.no/downloads/ganttChart.pbiviz → DataLund Gantt **1.8.0.0**
- Home + help `softwareVersion` = `1.8.0.0`
- Copy: time window **from today**
- No white-label URL on the site
