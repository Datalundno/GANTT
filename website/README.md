# Deploy datalund.no

Static site for AppSource Help / Support / Privacy URLs.

## Required live URLs (HTTPS)

| Purpose | URL | Notes |
| --- | --- | --- |
| Help / product | `https://datalund.no/visuals/gantt/` | Must differ from Support URL |
| Support | `https://datalund.no/support/` | Used in `pbiviz.json` `supportUrl` |
| Privacy | `https://datalund.no/privacy/` | Required by Partner Center |
| Home | `https://datalund.no/` | Optional |

## Suggested deploy (GitHub Pages)

1. In the GitHub repo: **Settings → Pages**
2. Source: deploy from `/website` on `main` (or use a `gh-pages` branch that mirrors `website/`)
3. Custom domain: `datalund.no`
4. Add DNS at your registrar:
   - `A` / `AAAA` records for GitHub Pages, **or**
   - `CNAME` for `www` → `chartvik.github.io` (adjust to your Pages target)
5. Enable **Enforce HTTPS** once DNS propagates
6. Verify all three URLs open publicly **before** submitting to AppSource

## Other hosts

Any static host works (Cloudflare Pages, Netlify, Azure Static Web Apps, Vercel). Upload the contents of `website/` to the site root so `/privacy/`, `/support/`, and `/visuals/gantt/` resolve.
