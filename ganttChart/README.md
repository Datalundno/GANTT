# DataLund Gantt (Power BI visual)

Free custom **Gantt** visual for Microsoft Power BI by **DataLund** ([datalund.no](https://datalund.no/)).

- Product page: https://datalund.no/visuals/gantt/
- Support: https://datalund.no/support/
- Privacy: https://datalund.no/privacy/
- **AppSource step-by-step (TOS-safe):** [`docs/APPSOURCE.md`](docs/APPSOURCE.md)
- Site: [Datalundno/Website](https://github.com/Datalundno/Website)

## Download (latest package)

| Artifact | Link |
| --- | --- |
| **Branded** `.pbiviz` (website) | [v1.7.1.0 ganttChart.pbiviz](https://github.com/Datalundno/GANTT/releases/download/v1.7.1.0/ganttChart.pbiviz) |
| Website mirror | https://datalund.no/downloads/ganttChart.pbiviz |
| Sample Excel | [GanttSampleData.xlsx](downloads/GanttSampleData.xlsx) |
| Store logo 300×300 | [`assets/store/logo-300.png`](assets/store/logo-300.png) |

Personal unbranded build (not for the website): [whitelabel-1.7.1.0 GanttChart.pbiviz](https://github.com/Datalundno/GANTT/releases/download/whitelabel-1.7.1.0/GanttChart.pbiviz).

## Name & identity

| Field | Value |
| --- | --- |
| Display name | **DataLund Gantt** |
| Publisher | DataLund |
| GUID | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` (immutable after AppSource publish) |
| Version | **1.7.1.0** — time window from today; Expand/Collapse; optional Format time window |

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
cp dist/ganttChartF8E34E29596A403E8E39808FA17C9CE9.*.pbiviz downloads/ganttChart.pbiviz
```
