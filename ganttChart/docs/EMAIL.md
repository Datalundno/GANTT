# Email + work account for `datalund.no` (AppSource / Partner Center)

Partner Center **requires a Microsoft Entra work account**. Personal Gmail/Outlook.com accounts are rejected.  
Today `datalund.no` has **no MX records** — the domain cannot receive mail until you add an email service.

DNS for `datalund.no` is at **Domeneshop** (`ns1/ns2/ns3.hyp.net`). GitHub Pages only hosts the website; it cannot provide mailboxes.

---

## What to create

| Address | Purpose |
| --- | --- |
| **`jonas@datalund.no`** (or another **person** name) | Primary work account for Partner Center / Marketplace |
| **`support@datalund.no`** | Public support address already listed on the site |

**Do not** use role-based names as the Partner Center enrollment identity: `admin@`, `info@`, `support@`, `email@`, `marketing@` are called out as invalid for that purpose by Microsoft.

Docs: [Create a work account](https://learn.microsoft.com/en-us/partner-center/enroll/create-work-account).

---

## Recommended path: Microsoft 365 Business Basic

This gives you **both** `@datalund.no` mailboxes **and** the Entra tenant Partner Center expects.

Cost (Norway, indicative): about **kr 71 / user / month** billed yearly (ex. VAT), or a free trial then paid.  
Buy / trial: https://www.microsoft.com/nb-no/microsoft-365/business/microsoft-365-business-basic

### Step 1 — Start the subscription

1. Open the Business Basic page → **Prøv det kostnadsfritt** or **Kjøp nå**.
2. When asked for organization / domain, you can start with Microsoft’s fallback domain, e.g. `datalund.onmicrosoft.com`.
3. Create the first Global Admin as a **person** username, e.g. `jonas` → temporarily `jonas@datalund.onmicrosoft.com`.
4. Complete org name / address / payment. Use the **legal business name and address** you will later put in Partner Center (must match registry data).

### Step 2 — Connect `datalund.no` in Microsoft 365

1. Sign in to [admin.microsoft.com](https://admin.microsoft.com) as the Global Admin.
2. **Settings → Domains → Add domain** → `datalund.no`.
3. Microsoft shows a **TXT** (or MX) verification record.
4. At [Domeneshop](https://domeneshop.no/login): **Mine domener → datalund.no → DNS-pekere → Vis avanserte innstillinger**.
5. Add the verification TXT exactly as Microsoft shows (keep your existing Google Search Console TXT).
6. Back in Microsoft 365, click **Verify**.

### Step 3 — Point mail (MX / SPF / DKIM) at Microsoft

After verification, Microsoft asks you to set up DNS for services (Exchange):

| Typical record | Where |
| --- | --- |
| MX → `datalund-no.mail.protection.outlook.com` (exact host from Microsoft) | Domeneshop DNS |
| TXT `v=spf1 include:spf.protection.outlook.com -all` | Domeneshop DNS (merge carefully if other SPF exists) |
| CNAME Autodiscover / DKIM | As shown in the Microsoft wizard |

**Important:** Let Microsoft’s domain wizard be the source of truth for hostnames. Do not invent MX values.  
Do **not** point MX at GitHub Pages.

Confirm:

```bash
dig MX datalund.no +short
dig TXT datalund.no +short
```

You should see Microsoft MX + SPF after DNS propagates (minutes to a few hours).

### Step 4 — Mailboxes

1. In Microsoft 365 admin → **Users → Active users**, ensure **`jonas@datalund.no`** exists (change the UPN / primary SMTP from `@datalund.onmicrosoft.com` to `@datalund.no` after the domain is default, or create/rename as the wizard allows).
2. Make `datalund.no` the **default** domain when ready (Domains → Set as default).
3. Create **`support@datalund.no`** as either:
   - a **shared mailbox** (no extra license) that `jonas@` can open, or
   - an **alias** / forwarding address to `jonas@datalund.no`.
4. Send test mail to both addresses from an external account.
5. Turn on **MFA** for the Global Admin.

### Step 5 — Partner Center

1. Sign in to [Partner Center](https://partner.microsoft.com/dashboard) with **`jonas@datalund.no`**.
2. Enroll in **Microsoft Marketplace**.
3. Continue AppSource offer setup per [`PUBLISH.md`](./PUBLISH.md).

---

## Faster / cheaper interim (not ideal long-term)

If you only need to **start** Partner Center today:

1. Use Partner Center → **Create work account** and accept a `…@datalund.onmicrosoft.com` identity (person name, not `admin@`).
2. Separately at Domeneshop → **Epost**, create **forwarding** for `support@datalund.no` to your private inbox (as noted in Website `DOMAIN.md`).
3. Later buy Microsoft 365 and attach `datalund.no` so Partner Center and public email share one professional domain.

Forwarding alone does **not** create an Entra work account — you still need the Microsoft tenant for Marketplace.

---

## Domeneshop-only forwarding (support inbox only)

Use this **only** for the public support address if you are not ready for Microsoft 365 mail yet:

1. Domeneshop → **Mine domener → datalund.no → Epost**.
2. Create `support` → forward to your private inbox.
3. Let Domeneshop manage MX/SPF for that product.

If you later move mail to Microsoft 365, remove Domeneshop MX and replace with Microsoft’s records (one mail system at a time).

---

## Checklist

- [ ] Microsoft 365 Business Basic (or Partner Center–created Entra tenant) exists
- [ ] Person mailbox `…@datalund.no` (not role-based) works and receives mail
- [ ] `support@datalund.no` receives or forwards mail
- [ ] `dig MX datalund.no` shows your chosen provider
- [ ] MFA on Global Admin
- [ ] Partner Center sign-in with the person work account
- [ ] Then continue [`PUBLISH.md`](./PUBLISH.md)

---

## Related

- Website DNS notes: [Datalundno/Website `DOMAIN.md`](https://github.com/Datalundno/Website/blob/main/DOMAIN.md)
- Partner Center work accounts: https://learn.microsoft.com/en-us/partner-center/enroll/create-work-account
- Add custom domain in Entra / M365: https://learn.microsoft.com/en-us/entra/fundamentals/add-custom-domain
