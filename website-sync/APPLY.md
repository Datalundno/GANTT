# Apply to Datalundno/Website (1.7.0.0)

This agent **cannot push** to `Datalundno/Website` (403). Apply these files on that repo so datalund.no serves the package publicly.

**Why:** `Datalundno/GANTT` is **private**, so links like  
`github.com/Datalundno/GANTT/raw/main/.../ganttChart.pbiviz` **404 for visitors**.  
Host the `.pbiviz` on the public Website repo instead.

## Copy map

| This folder | Website repo |
| --- | --- |
| `public/downloads/ganttChart.pbiviz` | `public/downloads/ganttChart.pbiviz` |
| `public/downloads/GanttSampleData.xlsx` | `public/downloads/GanttSampleData.xlsx` |
| `public/visuals/gantt/index.html` | `public/visuals/gantt/index.html` |
| `index.html` | `index.html` |
| `demo-index.html` | `demo/index.html` |

## One-liner (from a machine with Website write access)

```bash
git clone https://github.com/Datalundno/Website.git
cd Website
# copy from this website-sync/ folder, then:
git checkout -b ship-gantt-1-7
# …paste files…
git add public/downloads public/visuals/gantt/index.html index.html demo/index.html
git commit -m "Ship DataLund Gantt 1.7.0.0 downloads + feature copy"
git push -u origin ship-gantt-1-7
```

After Pages deploys:

- https://datalund.no/downloads/ganttChart.pbiviz
- https://datalund.no/visuals/gantt/

## What changed on the site

- Download buttons → `/downloads/...` (no private GitHub raw URLs)
- Features mention Expand/Collapse + optional time window
- `softwareVersion` 1.7.0.0 in JSON-LD
