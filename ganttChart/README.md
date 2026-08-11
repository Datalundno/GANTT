# DataLund Gantt (Power BI visual)

Free custom **Gantt** visual for Microsoft Power BI by **DataLund** ([datalund.no](https://datalund.no/)).

- Product page: https://datalund.no/visuals/gantt/
- Support: https://datalund.no/support/
- Privacy: https://datalund.no/privacy/
- **AppSource step-by-step (TOS-safe):** [`docs/APPSOURCE.md`](docs/APPSOURCE.md)
- **Certification readiness:** [`docs/CERTIFICATION.md`](docs/CERTIFICATION.md)
- Site: [Datalundno/Website](https://github.com/Datalundno/Website)

## Download (latest package)

| Artifact | Link |
| --- | --- |
| **Branded** `.pbiviz` (website / AppSource) | [Releases](https://github.com/Datalundno/GANTT/releases) |
| Website mirror | https://datalund.no/downloads/ganttChart.pbiviz |
| Sample Excel | [GanttSampleData.xlsx](downloads/GanttSampleData.xlsx) |
| Store logo 300×300 | [`assets/store/logo-300.png`](assets/store/logo-300.png) |

This package is **one visual, one GUID**. Unbranded builds use a different GUID and must stay off the `certification` branch and off datalund.no.

## Name & identity

| Field | Value |
| --- | --- |
| Display name | **DataLund Gantt** |
| Publisher | DataLund |
| Author email | `support@datalund.no` |
| GUID | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` (immutable after AppSource publish) |
| Version | **1.9.1.0** — certification packaging hygiene (branded contact, nb-NO, no website-sync in-repo) |

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
npx pbiviz package --certification-audit
cp dist/ganttChartF8E34E29596A403E8E39808FA17C9CE9.*.pbiviz downloads/ganttChart.pbiviz
```
