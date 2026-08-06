# Datalund website

Marketing site for [Datalund](https://datalund.no) — custom Power BI visualizations.

## AppSource legal pages (copied from `public/` on build)

| URL | File |
| --- | --- |
| `/visuals/gantt/` | Help / product |
| `/support/` | Support (must differ from Help) |
| `/privacy/` | Privacy policy |

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Hosted on **GitHub Pages** via `.github/workflows/deploy-pages.yml` (builds on push to `main`).

Domain + DNS: [DOMAIN.md](./DOMAIN.md).
