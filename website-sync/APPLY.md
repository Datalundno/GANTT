# Website agent brief — ship DataLund Gantt 1.7.0.0

**Source repo:** [Datalundno/GANTT](https://github.com/Datalundno/GANTT)  
**Source path:** `website-sync/` on branch `cursor/website-1-7-sync-e6e8` (also [PR #9](https://github.com/Datalundno/GANTT/pull/9))  
**Target repo:** [Datalundno/Website](https://github.com/Datalundno/Website) → `main` (GitHub Pages)

## Goal

Publish Gantt **1.7.0.0** on datalund.no: host the `.pbiviz` publicly and update feature copy.

## Exact file copies

| From `website-sync/` (GANTT) | To Website |
| --- | --- |
| `public/downloads/ganttChart.pbiviz` | `public/downloads/ganttChart.pbiviz` |
| `public/downloads/GanttSampleData.xlsx` | `public/downloads/GanttSampleData.xlsx` |
| `public/visuals/gantt/index.html` | `public/visuals/gantt/index.html` |
| `index.html` | `index.html` |
| `demo-index.html` | `demo/index.html` |

## Commands

```bash
# In Website repo
git fetch https://github.com/Datalundno/GANTT.git cursor/website-1-7-sync-e6e8
git checkout -b ship-gantt-1-7

# Or clone GANTT sync folder, then:
# SYNC=/path/to/GANTT/website-sync
SYNC="<path-to-GANTT>/website-sync"
mkdir -p public/downloads public/visuals/gantt demo
cp "$SYNC/public/downloads/ganttChart.pbiviz" public/downloads/
cp "$SYNC/public/downloads/GanttSampleData.xlsx" public/downloads/
cp "$SYNC/public/visuals/gantt/index.html" public/visuals/gantt/index.html
cp "$SYNC/index.html" index.html
cp "$SYNC/demo-index.html" demo/index.html

# Helper (same copies):
# bash "$SYNC/apply-to-website.sh" .

git add public/downloads public/visuals/gantt/index.html index.html demo/index.html
git commit -m "Ship DataLund Gantt 1.7.0.0 downloads + feature copy"
git push -u origin ship-gantt-1-7
# Merge to main so Pages deploys
```

## Verify after Pages deploy

- https://datalund.no/downloads/ganttChart.pbiviz (200, downloads package)
- https://datalund.no/downloads/GanttSampleData.xlsx
- https://datalund.no/visuals/gantt/ mentions Expand/Collapse and optional time window
- Home + demo Download buttons use `/downloads/...` (not GitHub raw)

## Why

GANTT download links on GitHub can 404 for visitors when the visual repo is private. Hosting the package under Website `public/downloads/` keeps downloads public on datalund.no.
