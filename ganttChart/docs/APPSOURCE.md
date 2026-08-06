# AppSource / Power BI Visualization Shop checklist

This visual is packaged for submission to [Microsoft AppSource (Power BI visuals)](https://appsource.microsoft.com/marketplace/apps?product=power-bi-visuals).

Keep the visual **GUID** stable forever: `ganttChartF8E34E29596A403E8E39808FA17C9CE9`.

## Package metadata (done in repo)

| Field | Value |
| --- | --- |
| Display name | Gantt Chart |
| Version | See `pbiviz.json` (four-part `x.x.x.x`) |
| Author | Chartvik / jonas.lundervold@gmail.com |
| Support URL | https://github.com/Chartvik/GANTT/issues |
| GitHub URL | https://github.com/Chartvik/GANTT |
| Privacy policy | https://github.com/Chartvik/GANTT/blob/main/ganttChart/docs/PRIVACY.md *(use `main` after merge)* |
| Pane icon | `assets/icon.png` (20×20) |
| Store logo | `assets/store/logo-300.png` (300×300 PNG) |

## Visual capabilities required by AppSource guidelines

Implemented in this package:

- [x] Context menu on empty space **and** data points
- [x] Landing page (`supportsLandingPage` + `supportsEmptyDataView`)
- [x] Keyboard focus capability (`supportsKeyboardFocus`)
- [x] Host tooltips + selection / cross-filter
- [x] High-contrast palette support
- [x] English `stringResources`
- [x] No external network privileges (`privileges: []`)
- [x] Rendering events (`renderingStarted` / `Finished` / `Failed`)

## Partner Center assets you must upload

Create these outside the package (Partner Center listing):

| Asset | Spec | Status |
| --- | --- | --- |
| `.pbiviz` package | Built with `pbiviz package` | `downloads/ganttChart.pbiviz` |
| Sample `.pbix` | Offline sample report highlighting value | **Create in Power BI Desktop** using `downloads/GanttSampleData.xlsx` |
| Logo | PNG **300×300** | `assets/store/logo-300.png` |
| Screenshots | 1–5 PNG, **1366×768**, ≤1024 KB, with callout text | Capture in Desktop; mock starter: `assets/store/screenshot-placeholder-1366x768.png` |
| Support URL | `https://…` | GitHub Issues (or your site) |
| Privacy URL | `https://…` | `docs/PRIVACY.md` on GitHub |
| EULA | Standard Microsoft contract, PBI visuals contract, or custom | MIT license + Partner Center legal tab |

### Screenshot ideas (1366×768)

1. Full Gantt with groups expanded, progress fills, today line  
2. Color-by-resource + tooltips  
3. Week-number axis labels + weekend shading  
4. Milestones + collapsed groups  
5. Format pane open showing Bars / Labels / General  

Add short text bubbles explaining the feature shown.

## Build & certification hygiene

From `ganttChart/`:

```bash
npm install
npm run lint
pbiviz package
pbiviz package --certification-audit
npm audit
```

For **Power BI certification** (optional, after AppSource publish):

1. Publish to AppSource first (recommended).
2. Create a lowercase `certification` branch matching the submitted package.
3. Ensure `.gitignore` excludes `node_modules`, `.tmp`, `dist`.
4. In Partner Center, check **Request Power BI certification** and provide source access notes for `pbicvsupport`.

## Submit

1. Enroll in [Partner Center](https://partner.microsoft.com/dashboard).
2. Create a **Power BI visual** offer.
3. Upload `.pbiviz`, sample `.pbix`, logo, screenshots, privacy/support links, EULA.
4. Do **not** change the GUID on updates.
5. After approval, optionally request certification.

Docs: [Publish Power BI visuals](https://learn.microsoft.com/en-us/power-bi/developer/visuals/office-store) · [Guidelines](https://learn.microsoft.com/en-us/power-bi/developer/visuals/guidelines-powerbi-visuals) · [Certification](https://learn.microsoft.com/en-us/power-bi/developer/visuals/power-bi-custom-visuals-certified)
