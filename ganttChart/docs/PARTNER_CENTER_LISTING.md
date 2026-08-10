# Partner Center listing copy — DataLund Gantt

Paste-ready text for the AppSource offer. Keep in sync with `pbiviz.json` (version **1.7.1.0**).

## Offer setup

| Field | Value |
| --- | --- |
| Offer ID (immutable) | `datalund-gantt` |
| Offer alias | DataLund Gantt |
| Offer name | DataLund Gantt |
| Publisher display name | DataLund |
| Pricing | Free — *My offer does not require purchase of a service and does not offer in app purchases* |
| Request certification (first pass) | **No** |

## Properties / legal

| Field | Value |
| --- | --- |
| Privacy URL | https://datalund.no/privacy/ |
| Support document URL | https://datalund.no/support/ |
| Help / learn more | https://datalund.no/visuals/gantt/ |
| EULA | Standard Contract **or** [Power BI default visual EULA](https://visuals.azureedge.net/app-store/Power%20BI%20-%20Default%20Custom%20Visual%20EULA.pdf) |
| Categories (max 2) | **Change over time**, **Other** |

## Listing

**Summary** (≤100 chars):

```
Free Power BI Gantt for tasks, progress, milestones, groups, and resources.
```

**Description:**

```
DataLund Gantt is a free custom visual for Microsoft Power BI that shows project tasks on a clear timeline.

Who it is for
Project managers, PMO teams, consultants, and analysts who need a readable schedule inside Power BI reports—without leaving the Microsoft ecosystem.

What you bind
• Required: Task, Start Date, and End Date and/or Duration
• Optional: Progress, Group, Resource, Tooltips

Key features
• Task bars with optional progress fill
• Zero-duration milestones on the same axis
• Collapsible groups with Expand / Collapse
• Optional time window from today (3 / 6 / 9 / 12 months)
• Color-by-resource, today line, weekend shading
• Week / date axis labels
• Selection and cross-filtering with other visuals
• Host tooltips and context menus (empty canvas and data points)
• Landing page when fields are not bound yet

Privacy and security
Runs entirely in the Power BI visual sandbox. No outbound network calls, no telemetry, and no declared WebAccess / storage privileges.

Learn more: https://datalund.no/visuals/gantt/
Support: https://datalund.no/support/
Privacy: https://datalund.no/privacy/

DataLund Gantt is published by DataLund (datalund.no). It is not affiliated with, endorsed by, or sponsored by Microsoft. Power BI is a trademark of Microsoft Corporation.
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
| Visual package | `ganttChart/downloads/ganttChart.pbiviz` (built as `dist/ganttChartF8E34E29596A403E8E39808FA17C9CE9.1.7.1.0.pbiviz`) |
| Store logo | `ganttChart/assets/store/logo-300.png` (300×300) |
| Sample workbook | Create in Power BI Desktop — see [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md) |
| Screenshots | 1–5 PNG at 1366×768, ≤1024 KB each — captions in `DESKTOP_SAMPLE.md` §C |

## Notes for reviewers

```
Visual: DataLund Gantt 1.7.1.0
GUID: ganttChartF8E34E29596A403E8E39808FA17C9CE9
Source: https://github.com/Datalundno/GANTT

Test steps:
1. Open the sample .pbix (or import GanttSampleData.xlsx).
2. Bind Task, Start Date, End Date/Duration; optional Progress, Group, Resource.
3. Confirm bars, progress fill, milestones, groups, Expand/Collapse, optional time window, today line, and format pane.
4. Right-click empty canvas and a bar — context menu appears.
5. Cross-filter with another visual; resize; pin to dashboard.
6. Visual declares privileges: [] and makes no external network calls.

Certification: not requested on this first publish. Will request Power BI certification in a follow-up after AppSource approval.
```
