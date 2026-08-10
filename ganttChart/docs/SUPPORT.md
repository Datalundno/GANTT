# Support — DataLund Gantt

**Canonical live URL:** https://datalund.no/support/

## Contact

- Website: https://datalund.no/support/
- Product / help: https://datalund.no/visuals/gantt/
- Email: jonas.lundervold@gmail.com
- GitHub Issues: https://github.com/Datalundno/GANTT/issues

## Before you open a ticket

1. Confirm you are on the latest `.pbiviz` / AppSource version.
2. Bind at least **Task** and **Start Date**, plus **End Date** or **Duration**.
3. Include Power BI version, visual version, field-well screenshot, and sanitized sample data if possible.

## FAQ

### Export to PDF / PowerPoint shows “Dette visualobjektet støtter ikke eksportering”

English: **“This visual does not support exporting.”**

This is a **Power BI platform limit**, not a crash in DataLund Gantt. Microsoft only includes **[certified](https://learn.microsoft.com/en-us/power-bi/developer/visuals/power-bi-custom-visuals-certified)** custom visuals when you use **Export → PDF** or **Export → PowerPoint**. Uncertified custom visuals (including a `.pbiviz` imported from AppSource or GitHub before certification) are replaced with that error in the exported file.

| What you need | Status for DataLund Gantt |
| --- | --- |
| Rendering events API (`renderingStarted` / `renderingFinished`) | Already implemented |
| No outbound network / empty `privileges` | Already met |
| Microsoft **Power BI Certified** badge | Required for native PDF/PPT export — request after AppSource publish (see [`APPSOURCE.md`](./APPSOURCE.md)) |

**Until certification ships**, use a screenshot or *Copy visual as image* (where Power BI offers it) if you need a static picture of the Gantt.

Official docs: [Export reports to PDF](https://learn.microsoft.com/en-us/power-bi/collaborate-share/end-user-pdf#visuals-that-arent-supported).

## Docs

- AppSource checklist: [`APPSOURCE.md`](./APPSOURCE.md)
- Sample Excel: `../downloads/GanttSampleData.xlsx`
