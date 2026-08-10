# One sitting: sample `.pbix` + AppSource screenshots (Windows)

**Time:** ~30–45 minutes  
**Requires:** Power BI Desktop on Windows, files from this repo  

This agent cannot run Power BI Desktop (Linux VM). Do this on your PC when you have 45 minutes — **before** Marketplace verification finishes is fine.

## Download these first

From the repo (or GitHub raw / release):

1. `ganttChart/downloads/ganttChart.pbiviz` (**1.7.1.0**)
2. `ganttChart/downloads/GanttSampleData.xlsx`

Save them in one folder, e.g. `Downloads\DataLundGantt\`.

---

## Part A — Sample report (15 min)

1. Open **Power BI Desktop**.
2. **Get data → Excel** → `GanttSampleData.xlsx` → load **Tasks**.
3. Set `Start` / `End` to **Date**; `Progress` decimal; `Duration` whole number.
4. Visualizations **… → Import a visual from a file** → `ganttChart.pbiviz`.
5. Add **DataLund Gantt**; bind:

| Well | Column |
| --- | --- |
| Task | Task |
| Start Date | Start |
| End Date | End |
| Duration | Duration |
| Progress | Progress |
| Group | Group |
| Resource | Resource |

6. Format → General: **Color by resource**, **Today line**, **Weekend shading** on. Optional: **Show time window**.
7. Add a **Group** slicer + a small table (`Task`, `Progress`) for cross-filter.
8. Duplicate page → rename **Tips**; paste short tips from [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md) §B (no “Certified” claims).
9. **File → Save as** `DataLundGantt-Sample.pbix` (no gateway).

Quick checks: Expand/Collapse works; right-click empty area + bar shows context menu; milestones Alpha Gate / Go-Live visible.

---

## Part B — Screenshots (15 min)

Requirements: PNG, **exactly 1366×768**, ≤ **1024 KB**, real Desktop chrome.

Tips: Windows display scale **100%**; crop precisely (not 1365×767).

| File | Show | Caption |
| --- | --- | --- |
| `screenshot-01.png` | Full Gantt + groups + progress + today | Task timeline with progress, groups, and today line |
| `screenshot-02.png` | Color by resource | Color bars by resource for ownership at a glance |
| `screenshot-03.png` | Milestones close-up | Zero-duration milestones on the same timeline |
| `screenshot-04.png` | Format pane open | Format pane for bars, labels, axis, weekends, time window |
| `screenshot-05.png` | Slicer / cross-filter | Works with slicers and cross-filtering |

Do **not** upload `screenshot-placeholder-1366x768.png`.

Optional: drop finished PNGs into `ganttChart/assets/store/` and the `.pbix` into `ganttChart/downloads/` on a branch when you want them in git.

---

## Part C — Smoke test (5 min)

- [ ] Column chart ↔ DataLund Gantt convert
- [ ] Cross-filter both ways
- [ ] Remove End, then Duration — no crash
- [ ] Context menu empty + bar
- [ ] Expand / Collapse

Then stop. Upload with [`SUBMISSION_PACK.md`](./SUBMISSION_PACK.md) when Partner Center enrollment is ready.
