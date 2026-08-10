# Website agent — ship DataLund Gantt **1.9.0.0** (branded only)

Apply in **`Datalundno/Website`**, push to `main` so Pages deploys.

## Branded vs unbranded

| | **Branded — website** | **Unbranded — personal only** |
| --- | --- | --- |
| Name | DataLund Gantt | Gantt Chart |
| File | `ganttChart.pbiviz` **1.9.0.0** | `GanttChart.pbiviz` |
| Link on site | `/downloads/ganttChart.pbiviz` | **Do not add** |
| Direct release | https://github.com/Datalundno/GANTT/releases/download/v1.9.0.0/ganttChart.pbiviz | (personal build if published) |

## Copy from `website-sync/` (GANTT branch)

```bash
SYNC=<path-to-GANTT>/website-sync
cp "$SYNC/public/downloads/ganttChart.pbiviz" public/downloads/ganttChart.pbiviz
cp "$SYNC/public/downloads/GanttSampleData.xlsx" public/downloads/GanttSampleData.xlsx
cp "$SYNC/public/visuals/gantt/index.html" public/visuals/gantt/index.html
cp "$SYNC/index.html" index.html
git add public/downloads/ganttChart.pbiviz public/downloads/GanttSampleData.xlsx public/visuals/gantt/index.html index.html
git commit -m "Ship DataLund Gantt 1.9.0.0 (Color by + ecosystem fields copy)"
git push origin main
```

## Verify

- https://datalund.no/downloads/ganttChart.pbiviz → DataLund Gantt **1.9.0.0**
- Help Fields: Task / Start Date / End Date core; Duration & Tooltips “also supported later”
- Format copy: **Color by** (not Color by resource)
- Home + help `softwareVersion` = `1.9.0.0`
- No white-label URL on the site
