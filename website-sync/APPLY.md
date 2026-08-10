# Website agent — ship DataLund Gantt **1.8.0.0** (branded only)

**Blocked for GANTT cloud agent:** `cursor[bot]` has no write access to `Datalundno/Website` (push 403). Apply this pack from an agent/user with Website write access, then push to `main` so Pages deploys.

Density presets are already in the branded `ganttChart.pbiviz` **1.8.0.0**. Live site is still **1.7.0.0** until this pack lands.

## Branded vs unbranded

| | **Branded — website** | **Unbranded — personal only** |
| --- | --- | --- |
| Name | DataLund Gantt | Gantt Chart |
| File | `ganttChart.pbiviz` **1.8.0.0** | `GanttChart.pbiviz` |
| Link on site | `/downloads/ganttChart.pbiviz` | **Do not add** |
| Direct release | https://github.com/Datalundno/GANTT/releases/download/v1.8.0.0/ganttChart.pbiviz | Personal only (not on site) |

## Copy from `website-sync/` (this branch or GANTT `main`)

```bash
SYNC=<path-to-GANTT>/website-sync
cp "$SYNC/public/downloads/ganttChart.pbiviz" public/downloads/ganttChart.pbiviz
cp "$SYNC/public/visuals/gantt/index.html" public/visuals/gantt/index.html
cp "$SYNC/index.html" index.html
git add public/downloads/ganttChart.pbiviz public/visuals/gantt/index.html index.html
git commit -m "Ship DataLund Gantt 1.8.0.0 (Density presets)"
git push origin main
```

## Verify

- https://datalund.no/downloads/ganttChart.pbiviz → DataLund Gantt **1.8.0.0**
- Home + help `softwareVersion` = `1.8.0.0`
- Copy mentions **Density** (Compact / Comfortable / Large)
- Copy: time window **from today**
- No white-label URL on the site
