# DataLund Gantt

Free custom **Gantt** visual for Microsoft Power BI by **DataLund** ([datalund.no](https://datalund.no/)).

| Path | Purpose |
| --- | --- |
| [`ECOSYSTEM.md`](ECOSYSTEM.md) | Pointer to the suite contract (canonical on Website) |
| [`SUITE.md`](SUITE.md) | Local suite seed — defer to ECOSYSTEM on conflict |
| [`ganttChart/`](ganttChart/) | Power BI visual + AppSource package |
| [`ganttChart/docs/APPSOURCE.md`](ganttChart/docs/APPSOURCE.md) | AppSource upload checklist |
| [`ganttChart/docs/CERTIFICATION.md`](ganttChart/docs/CERTIFICATION.md) | Certification readiness notes |

## Downloads

| Build | Link |
| --- | --- |
| **Branded (website / AppSource)** — DataLund Gantt | [Latest release](https://github.com/Datalundno/GANTT/releases) · [datalund.no/downloads](https://datalund.no/downloads/ganttChart.pbiviz) |

This repository packages **one** Power BI visual GUID (`ganttChartF8E34E29596A403E8E39808FA17C9CE9`). Unbranded / white-label builds (different GUID) are personal-only and must not live on the `certification` branch or on datalund.no.

## Website

Marketing site, downloads HTML, and the canonical ecosystem contract live in **https://github.com/Datalundno/Website** → [datalund.no](https://datalund.no). Do not commit site HTML or sync packs into this visual repo.

## Visual package

```bash
cd ganttChart
npm install
npm run lint
npm run package
npx pbiviz package --certification-audit
```

Privacy policy: https://datalund.no/privacy/ · Support: https://datalund.no/support/
