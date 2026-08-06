# Power BI Desktop — sample `.pbix` + screenshots

You need **Power BI Desktop** for these AppSource assets. Use visual package **1.6.0.0** from this repo (`downloads/ganttChart.pbiviz`). Do not mix versions between the `.pbix` and the uploaded `.pbiviz`.

Files you’ll need locally:

| File | Path |
| --- | --- |
| Visual | `ganttChart/downloads/ganttChart.pbiviz` |
| Sample data | `ganttChart/downloads/GanttSampleData.xlsx` |
| Store logo (already done) | `ganttChart/assets/store/logo-300.png` |

When finished, drop outputs here (or keep them private until upload):

- `ganttChart/downloads/DataLundGantt-Sample.pbix`
- `ganttChart/assets/store/screenshot-01.png` … `screenshot-05.png` (optional count 1–5)

---

## A) Import data + visual

1. Open **Power BI Desktop** (offline is fine).
2. **Home → Get data → Excel workbook** → select `GanttSampleData.xlsx` → load sheet **Tasks**.
3. Confirm columns: `Task`, `Start`, `End`, `Duration`, `Progress`, `Group`, `Resource`.
4. Mark `Start` / `End` as **Date** (not Date/Time) if Power BI guessed wrong.
5. Mark `Progress` as decimal; `Duration` as whole number.
6. Visualizations pane → **…** → **Import a visual from a file** → choose `ganttChart.pbiviz`.
7. Add **DataLund Gantt** to the canvas.

### Field bindings

| Visual well | Column |
| --- | --- |
| Task | Task |
| Start Date | Start |
| End Date | End |
| Duration | Duration |
| Progress | Progress |
| Group | Group |
| Resource | Resource |

Optional: put `Resource` (or another column) in **Tooltips** as well.

You should see:

- Progress fills on several bars
- Groups: Discovery / Build / Launch (collapsible)
- Milestones: **Alpha Gate**, **Go-Live** (zero duration)
- **QA** driven by Duration (no End)
- Today line if “Show today line” is on

---

## B) Build the sample report (2 pages)

### Page 1 — “Demo”

1. Title text box: **DataLund Gantt — sample**
2. Full-width Gantt with all fields bound
3. Add a simple **slicer** on `Group` (shows filters work)
4. Add a **table** or **clustered bar** of `Task` + `Progress` (shows cross-filter)
5. Turn on format options worth showcasing:
   - General → Color by resource = On
   - General → Show today line = On
   - General → Weekend shading = On
   - Axis labels = Week + date (or Date)

### Page 2 — “Tips”

Short text boxes (keep honest, no “Certified” claims):

```
Required fields: Task + Start Date, plus End Date and/or Duration.

Milestones: same Start and End (zero duration).

Progress: 0–1 or 0–100.

Groups collapse/expand in the label pane.

This visual runs in the Power BI sandbox — no outbound network.
Help: https://datalund.no/visuals/gantt/
```

### Save

- **File → Save as** → `DataLundGantt-Sample.pbix`
- No gateway, no live DirectQuery, no external dataset
- File should open offline after download

---

## C) Screenshots (AppSource)

Requirements: **PNG**, exactly **1366×768**, each **≤ 1024 KB**, 1–5 images, real Desktop UI.

### Capture tips

1. Set Windows display scale to **100%** if possible.
2. Resize the Power BI window / report page so the visual fills most of the canvas.
3. Use Snipping Tool / ShareX / built-in screenshot, then crop or pad to **exactly** 1366×768 (not 1365×767).
4. Avoid misleading Microsoft logos that imply Microsoft built the visual.
5. Replace `assets/store/screenshot-placeholder-1366x768.png`.

### Suggested set + captions

| File | Scene | Caption (Partner Center) |
| --- | --- | --- |
| `screenshot-01.png` | Full Gantt with groups + progress + today line | Task timeline with progress, groups, and today line |
| `screenshot-02.png` | Color by resource on | Color bars by resource for ownership at a glance |
| `screenshot-03.png` | Milestone close-up (Alpha Gate / Go-Live) | Zero-duration milestones on the same timeline |
| `screenshot-04.png` | Format pane open (Bars / General) | Format pane for bars, labels, axis, and weekends |
| `screenshot-05.png` | Cross-filter with slicer or companion chart | Works with slicers and cross-filtering |

Compress if needed (`pngquant` / TinyPNG) until each file is ≤ 1024 KB without looking blurry.

---

## D) Quick Desktop smoke test (before upload)

Run through these once and fix anything that errors in the console (View → Developer → show console if enabled):

- [ ] Convert a column chart → DataLund Gantt and back
- [ ] Click a bar → table/other visual filters; click other visual → Gantt filters
- [ ] Remove fields one at a time (especially End, then Duration) — no crash
- [ ] Empty visual / only Task bound — landing or empty state, no crash
- [ ] Right-click empty space **and** a bar — context menu
- [ ] Resize narrow/wide; scroll label pane if many tasks
- [ ] High contrast (Windows) smoke look

When the `.pbix` and screenshots are ready, continue Partner Center upload using [`PARTNER_CENTER_LISTING.md`](./PARTNER_CENTER_LISTING.md).
