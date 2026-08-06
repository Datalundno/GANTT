# GANTT / Datalund

Power BI custom visuals and the **Datalund** marketing site ([datalund.no](https://datalund.no)).

| Path | Purpose |
| --- | --- |
| [`ganttChart/`](ganttChart/) | **DataLund Gantt** Power BI visual + AppSource package |
| [`website/`](website/) | Public site (Vite) for datalund.no |
| [`ganttChart/docs/APPSOURCE.md`](ganttChart/docs/APPSOURCE.md) | Step-by-step AppSource upload checklist (TOS-safe) |

## Live URLs (after Pages deploy)

- https://datalund.no/
- https://datalund.no/visuals/gantt/ (Help)
- https://datalund.no/support/
- https://datalund.no/privacy/

## Website

```bash
cd website
npm install
npm run dev
```

Deployed with GitHub Pages. DNS: [`website/DOMAIN.md`](website/DOMAIN.md).

## Visual package

```bash
cd ganttChart
npm install
pbiviz package
```

Download: [`ganttChart/downloads/ganttChart.pbiviz`](ganttChart/downloads/ganttChart.pbiviz)
