# AppSource submission pack — DataLund Gantt 1.7.1.0

Everything you can paste into Partner Center **without** Power BI Desktop is below.  
Assets that **require Windows + Power BI Desktop** are listed at the end.

> **Environment note:** Cursor Cloud Agents run **Linux**. Power BI Desktop is **Windows-only**, so this agent cannot open Power BI or produce AppSource-valid screenshots / `.pbix`. Those must be captured on your PC (see [`WINDOWS_CAPTURE.md`](./WINDOWS_CAPTURE.md)).

---

## 1) Offer setup

| Field | Paste / choose |
| --- | --- |
| Offer ID | `datalund-gantt` |
| Offer alias | `DataLund Gantt` |
| Offer name | `DataLund Gantt` |
| Publisher | DataLund |
| Setup details | **My offer does not require purchase of a service and does not offer in app purchases** |
| Power BI certification | **Unchecked** (first publish) |

---

## 2) Properties

| Field | Value |
| --- | --- |
| Categories (pick up to 2) | **Change over time**, **Other** |
| Industries (optional, up to 2) | Professional services — and/or leave blank |
| Privacy policy URL | `https://datalund.no/privacy/` |
| Support document URL | `https://datalund.no/support/` |
| EULA | Standard Contract **or** [Power BI default visual EULA](https://visuals.azureedge.net/app-store/Power%20BI%20-%20Default%20Custom%20Visual%20EULA.pdf) |

Power BI visual categories are fixed by Microsoft (not “Project management”). Gantt fits **Change over time** best; **Other** is a solid second.

---

## 3) Listing — English (required)

**Name**

```
DataLund Gantt
```

**Summary** (75 chars, limit 100)

```
Free Power BI Gantt for tasks, progress, milestones, groups, and resources.
```

**Description**

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

**Keywords** (exactly 3)

```
gantt
timeline
project
```

**Help / learn more** (if a separate field appears): `https://datalund.no/visuals/gantt/`

---

## 4) Listing — Norwegian (optional second language)

Only add if Partner Center lets you add `nb-NO` / Norwegian. Keep English as primary.

**Name**

```
DataLund Gantt
```

**Summary**

```
Gratis Power BI-Gantt for oppgaver, fremdrift, milestolper, grupper og ressurser.
```

**Description**

```
DataLund Gantt er et gratis egendefinert visualobjekt for Microsoft Power BI som viser prosjektoppgaver på en tydelig tidslinje.

For hvem
Prosjektledere, PMO, konsulenter og analytikere som vil ha en lesbar plan inne i Power BI-rapporter.

Felt
• Påkrevd: Oppgave (Task), Startdato, og sluttdato og/eller varighet
• Valgfritt: Fremdrift, Gruppe, Ressurs, Verktøytips

Funksjoner
• Oppgavestolper med valgfri fremdriftsfylling
• Milestolper med null varighet
• Sammenleggbare grupper (utvid / skjuli)
• Valgfritt tidsvindu fra i dag (3 / 6 / 9 / 12 måneder)
• Farge etter ressurs, i-dag-linje, helgeskygge
• Uke-/datomerking på aksen
• Utvalg og kryssfiltrering
• Verktøytips og hurtigmeny
• Ingen utgående nettverkskall / ingen telemetri

Hjelp: https://datalund.no/visuals/gantt/
Support: https://datalund.no/support/
Personvern: https://datalund.no/privacy/

Publisert av DataLund (datalund.no). Ikke tilknyttet Microsoft. Power BI er et varemerke tilhørende Microsoft Corporation.
```

**Keywords**

```
gantt
tidslinje
prosjekt
```

---

## 5) Notes for certification / reviewers

```
Visual: DataLund Gantt 1.7.1.0
GUID: ganttChartF8E34E29596A403E8E39808FA17C9CE9
Publisher: DataLund
Source: https://github.com/Datalundno/GANTT
Help: https://datalund.no/visuals/gantt/
Support: https://datalund.no/support/
Privacy: https://datalund.no/privacy/

Package: upload ganttChart.pbiviz 1.7.1.0 from this submission (matches sample .pbix).

How to test:
1. Open the sample .pbix (or import GanttSampleData.xlsx into a blank report).
2. Bind Task, Start Date, End Date and/or Duration; optionally Progress, Group, Resource, Tooltips.
3. Confirm task bars, progress fill, milestones (zero duration), collapsible groups, Expand/Collapse, optional time window, today line, weekend shading, and format pane.
4. Right-click empty plot area and a task bar — context menu appears.
5. Add a slicer or companion visual; confirm cross-filtering both ways.
6. Resize the visual; scroll if many rows.
7. privileges: [] — no external network calls (pbiviz package --certification-audit clean).

Power BI certification: NOT requested on this first publish. We will request certification in a later update after AppSource approval (needed for Export to PDF / PowerPoint).
```

---

## 6) Files ready in repo now

| Asset | Path | Status |
| --- | --- | --- |
| `.pbiviz` 1.7.1.0 | `ganttChart/downloads/ganttChart.pbiviz` | Ready |
| Store logo 300×300 | `ganttChart/assets/store/logo-300.png` | Ready — open it and confirm it looks sharp before upload |
| Sample Excel | `ganttChart/downloads/GanttSampleData.xlsx` | Ready |
| Listing copy | this file + `PARTNER_CENTER_LISTING.md` | Ready |

---

## 7) Blocked until you have Power BI Desktop (Windows)

| Asset | Why |
| --- | --- |
| `DataLundGantt-Sample.pbix` | Must be authored in Power BI Desktop |
| Screenshots 1366×768 (1–5 PNGs) | AppSource requires **real** Desktop UI; mocks are rejected |

One-sitting instructions: [`WINDOWS_CAPTURE.md`](./WINDOWS_CAPTURE.md).

When those files exist on your machine, upload them with the package above — no need to wait for Marketplace verification to *prepare* them.
