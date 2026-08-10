# Website agent — ship DataLund Gantt **1.8.1.0** (branded only)

Apply in **`Datalundno/Website`**, push to `main` so Pages deploys.

**Note:** GANTT cloud agent cannot push to Website (`cursor[bot]` 403).

## Branded vs unbranded

| | **Branded — website** | **Unbranded — personal only** |
| --- | --- | --- |
| Name | DataLund Gantt | Gantt Chart |
| File | `ganttChart.pbiviz` **1.8.1.0** | `GanttChart.pbiviz` |
| Link on site | `/downloads/ganttChart.pbiviz` | **Do not add** |
| Direct release | https://github.com/Datalundno/GANTT/releases/download/v1.8.1.0/ganttChart.pbiviz | https://github.com/Datalundno/GANTT/releases/download/whitelabel-1.8.1.0/GanttChart.pbiviz |

## Copy from `website-sync/` (GANTT)

```bash
SYNC=<path-to-GANTT>/website-sync
cp "$SYNC/public/downloads/ganttChart.pbiviz" public/downloads/ganttChart.pbiviz
cp "$SYNC/public/visuals/gantt/index.html" public/visuals/gantt/index.html
cp "$SYNC/index.html" index.html
git add public/downloads/ganttChart.pbiviz public/visuals/gantt/index.html index.html
git commit -m "Ship DataLund Gantt 1.8.1.0 (Color by)"
git push origin main
```

## Verify

- https://datalund.no/downloads/ganttChart.pbiviz → DataLund Gantt **1.8.1.0**
- Home + help `softwareVersion` = `1.8.1.0`
- Copy mentions Color by (Resource / Group / Task)
- No white-label URL on the site
