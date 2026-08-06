# Website follow-up — rename download to DataLundGantt.pbiviz

This agent could not push to [Datalundno/Website](https://github.com/Datalundno/Website) (403). Apply locally after merging the GANTT rename to `main`.

In `src/main.ts`:

1. Change the download URL to:
   `https://github.com/Datalundno/GANTT/raw/main/ganttChart/downloads/DataLundGantt.pbiviz`
2. Change the CTA to:
   `Download DataLund Gantt` with `download="DataLundGantt.pbiviz"`

Or apply the patch:

```bash
cd /path/to/Website
git apply /path/to/GANTT/ganttChart/docs/patches/website-datalundgantt-pbiviz.patch
```

Until `main` has `DataLundGantt.pbiviz`, use the branch URL:

`https://github.com/Datalundno/GANTT/raw/cursor/appsource-checklist-e6e8/ganttChart/downloads/DataLundGantt.pbiviz`
