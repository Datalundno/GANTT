# Domains — datalund.no / datalund.online

**Status:** Registered at Domeneshop (navnetjenere `ns1/ns2/ns3.hyp.net`).  
Hosting: **GitHub Pages** (Actions build of `/website`).

## DNS hos Domeneshop

Slå av **WWW-videresending** når DNS er satt (ellers kan den konflikte).

### Apex — `datalund.no`

Fire `A`-pekere til GitHub Pages:

| Type | Vert | Verdi |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

### www — `www.datalund.no`

| Type | Vert | Verdi |
| --- | --- | --- |
| CNAME | `www` | `datalundno.github.io` |

### Valgfritt — `datalund.online`

Samme A/CNAME-oppsett, eller en videresending til `https://datalund.no`.

## GitHub

1. Merge PR med website + workflow til `main` (eller kjør workflow manuelt etter merge).
2. Repo → **Settings → Pages**: Source = **GitHub Actions**.
3. Etter første deploy: Settings → Pages → Custom domain = `datalund.no` (CNAME-filen i `website/public/CNAME` følger med i bygget).
4. Kryss av **Enforce HTTPS** når DNS er grønn (kan ta litt tid).

Midlertidig før DNS: test lokalt med `npm run preview`, eller åpne Pages-URLen GitHub viser under Settings → Pages etter første deploy.

## Lokal build

```bash
cd website && npm install && npm run build
```

Output: `website/dist`.
