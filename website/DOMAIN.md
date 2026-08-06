# Buying datalund.no

**Status (checked 2026-08-06):** `datalund.no` is **not registered** and appears available via Norid RDAP (`Domain is not registered`).

I cannot purchase the domain for you — `.no` registration requires your Norwegian identity, a registrar account, and payment. Follow the steps below.

## Requirements (.no)

As a **private person** you need:

1. Age 18+
2. Norwegian national identity number (fødselsnummer)
3. Norwegian postal address
4. A **Personal ID (PID)** from Norid before ordering

As an **organisation** you need an organisation number in the Central Coordinating Register and a Norwegian postal address.

Official overview: [Who can hold a .no domain?](https://www.norid.no/en/oss/) · [How to order](https://www.norid.no/en/nytt-domenenavn/bestille-domenenavn/)

## Steps

1. **Create your Norid PID** (private individuals)  
   Start at [Norid — new domain name](https://www.norid.no/en/nytt-domenenavn/bestille-domenenavn/) and complete the personal ID process.

2. **Pick a registrar** from Norid’s list:  
   [Registrar list](https://www.norid.no/en/nytt-domenenavn/forhandlerliste/)  
   Common options that sell to private individuals: Domeneshop, One.com, Loopia, Domenenavn.no — compare DNSSEC, price, and DNS UX.

3. **Search and order `datalund.no`** at the registrar.  
   Confirm availability again at order time (first-come registration).

4. **Point DNS at your host** after purchase:
   - **Vercel:** add the domain in the project → Domains, then set the registrar’s DNS as Vercel instructs (usually an `A`/`CNAME` to Vercel).
   - **Netlify / Cloudflare Pages:** same idea — add domain in the host, copy their DNS records to the registrar.

5. **Enable DNSSEC** if the registrar supports it (recommended by Norid).

## Cost

Norid charges registrars **65 NOK + VAT per year**. You pay the registrar’s retail price (typically a bit higher, sometimes bundled with email/hosting).

## After purchase

Connect `datalund.no` (and optionally `www`) to this site’s deploy target. The marketing site lives in `/website` and builds with:

```bash
cd website && npm install && npm run build
```

Output is `website/dist`.
