# Domains — datalund.no / datalund.online

**Status:** Registered at Domeneshop (navnetjenere `ns1/ns2/ns3.hyp.net`).  
**GitHub org:** [Datalundno](https://github.com/Datalundno) (renamed from Chartvik)  
**Repo:** https://github.com/Datalundno/GANTT  
Hosting: **GitHub Pages** (Actions build of `/website`).

Temporary Pages URL (before / without custom domain): https://datalundno.github.io/GANTT/

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

> After the org rename, the Pages host is **`datalundno.github.io`** (not `chartvik.github.io`). Update DNS if you still have the old CNAME.

### Valgfritt — `datalund.online`

Samme A/CNAME-oppsett, eller en videresending til `https://datalund.no`.

## GitHub Pages (Datalundno/GANTT)

1. Repo → **Settings → Pages**: Source = **GitHub Actions**.
2. Custom domain = `datalund.no` (the `website/public/CNAME` file ships in the build).
3. Enable **Enforce HTTPS** when DNS is green.
4. Confirm these AppSource URLs resolve:
   - https://datalund.no/visuals/gantt/
   - https://datalund.no/support/
   - https://datalund.no/privacy/

## Lokal build

```bash
cd website && npm install && npm run build
```

Output: `website/dist`.
