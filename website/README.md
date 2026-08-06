# Datalund website

Marketing site for [Datalund](https://datalund.no) — custom Power BI visualizations.

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

## Domain

See [DOMAIN.md](./DOMAIN.md) for how to buy and connect `datalund.no`.

## Deploy

`vercel.json` is configured for a Vite static build from this folder. Import the `/website` directory (or monorepo root with Root Directory = `website`) in Vercel/Netlify, then attach the domain after purchase.
