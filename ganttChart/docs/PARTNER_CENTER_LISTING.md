# Partner Center listing copy — DataLund Gantt

Paste-ready text for the AppSource offer. Keep in sync with `pbiviz.json` (version **1.6.0.0**).

## Offer setup

| Field | Value |
| --- | --- |
| Offer ID (immutable) | `datalund-gantt` |
| Offer alias | DataLund Gantt |
| Offer name | DataLund Gantt |
| Publisher display name | DataLund |
| Pricing | Free |
| Request certification (first pass) | No |

## Properties / legal

| Field | Value |
| --- | --- |
| Privacy URL | https://datalund.no/privacy/ |
| Support document URL | https://datalund.no/support/ |
| Help / learn more | https://datalund.no/visuals/gantt/ |
| EULA | Standard Contract **or** [Power BI default visual EULA](https://visuals.azureedge.net/app-store/Power%20BI%20-%20Default%20Custom%20Visual%20EULA.pdf) |
| Categories | Project management / timelines (pick closest marketplace categories) |

## Listing

**Summary** (≤100 chars):

```
Free Power BI Gantt for tasks, progress, milestones, groups, and resources.
```

**Description:**

```
DataLund Gantt is a free custom visual for Microsoft Power BI that shows project tasks on a clear timeline.

Bind Task and Start Date (required), plus End Date and/or Duration. Optionally add Progress, Group, Resource, and tooltip fields.

Features:
• Task bars with optional progress fill
• Zero-duration milestones
• Collapsible groups and color-by-resource
• Today line, weekend shading, and week/date axis labels
• Selection / cross-filtering, host tooltips, and context menus
• Runs fully offline in the Power BI visual sandbox — no external network calls, no telemetry

Help and field bindings: https://datalund.no/visuals/gantt/
Support: https://datalund.no/support/
Privacy: https://datalund.no/privacy/

DataLund Gantt is published by DataLund (datalund.no). It is not affiliated with Microsoft. Power BI is a trademark of Microsoft Corporation.
```

**Keywords** (up to 3):

```
gantt
timeline
project
```

## Packages to upload

| Asset | Path |
| --- | --- |
| Visual package | `ganttChart/dist/ganttChartF8E34E29596A403E8E39808FA17C9CE9.1.6.0.0.pbiviz` (or `downloads/ganttChart.pbiviz`) |
| Store logo | `ganttChart/assets/store/logo-300.png` (300×300) |
| Sample workbook | Create in Power BI Desktop from `downloads/GanttSampleData.xlsx` + this `.pbiviz` |
| Screenshots | 1–5 PNG at 1366×768, ≤1024 KB each (replace placeholder) |

## Notes for reviewers

```
Visual: DataLund Gantt 1.6.0.0
GUID: ganttChartF8E34E29596A403E8E39808FA17C9CE9
Source: https://github.com/Datalundno/GANTT

Test steps:
1. Open the sample .pbix (or import GanttSampleData.xlsx).
2. Bind Task, Start Date, End Date/Duration; optional Progress, Group, Resource.
3. Confirm bars, progress fill, milestones, groups, today line, and format pane.
4. Right-click empty canvas and a bar — context menu appears.
5. Cross-filter with another visual; resize; pin to dashboard.
6. Visual declares privileges: [] and makes no external network calls.
```
