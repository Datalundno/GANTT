# DataLund Gantt (Power BI visual)

Free custom **Gantt** visual for Microsoft Power BI by **DataLund** ([datalund.no](https://datalund.no/)).

## Download (latest package)

| Artifact | Link |
| --- | --- |
| Visual (`.pbiviz`) | [ganttChart.pbiviz](https://github.com/Chartvik/GANTT/raw/main/ganttChart/downloads/ganttChart.pbiviz) |
| Sample Excel | [GanttSampleData.xlsx](https://github.com/Chartvik/GANTT/raw/main/ganttChart/downloads/GanttSampleData.xlsx) |
| Store logo 300×300 | [`assets/store/logo-300.png`](assets/store/logo-300.png) |

- Product page: https://datalund.no/visuals/gantt/
- Support: https://datalund.no/support/
- Privacy: https://datalund.no/privacy/
- **AppSource step-by-step (TOS-safe):** [`docs/APPSOURCE.md`](docs/APPSOURCE.md)
- Site files to deploy: [`/website`](../website/README.md)

## Name & identity

| Field | Value |
| --- | --- |
| Display name | **DataLund Gantt** |
| Publisher | DataLund |
| GUID | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` (immutable after AppSource publish) |

## Toolchain

| Requirement | Version |
| --- | --- |
| Node.js | **>= 20.19.0** |
| `powerbi-visuals-tools` | **7.2.1** |
| `powerbi-visuals-api` | **5.11.1** |
| `d3` | **7.9.0** |

```bash
cd ganttChart
npm install
npm run lint
pbiviz package
pbiviz package --certification-audit
```

## Features

- Timeline with auto or fixed axis granularity; date / ISO week / both labels
- Progress track + fill; milestones; today line; weekend shading
- Collapsible groups; color-by-resource
- Selection / cross-filter; host tooltips; context menu; landing page
- High-contrast; English localization; no outbound network

## Format pane

| Card | Properties |
| --- | --- |
| Bars | Height, corner radius, fill, progress fill |
| Task labels | Font size, font family, pane width |
| General | Color by resource, today line, axis granularity/labels, weekend shading |

Not affiliated with Microsoft Corporation. Power BI is a trademark of Microsoft.
