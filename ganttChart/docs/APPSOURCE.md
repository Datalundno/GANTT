# AppSource upload checklist — DataLund Gantt

Publisher brand: **Datalund** (`datalund.no`)  
Visual display name: **DataLund Gantt**  
Repo: https://github.com/Datalundno/GANTT  
GUID (never change after first publish): `ganttChartF8E34E29596A403E8E39808FA17C9CE9`

This checklist is written to stay within Microsoft Marketplace / Power BI visual policies (including [§1180](https://learn.microsoft.com/en-us/legal/marketplace/certification-policies#1180-power-bi-visuals)). It is practical guidance, not legal advice.

Paste-ready Partner Center fields: [`PARTNER_CENTER_LISTING.md`](./PARTNER_CENTER_LISTING.md).

### Progress (2026-08-06)

Continuing while custom-domain TLS / DNS finishes propagating. Content is already served; AppSource submit still needs a clean private-window HTTPS check later.

| Step | Status |
| --- | --- |
| **1** datalund.no pages live | Content OK at `/visuals/gantt/`, `/support/`, `/privacy/` — re-check **Enforce HTTPS** / cert after propagation ([Website Pages settings](https://github.com/Datalundno/Website/settings/pages)) |
| **2** package build | Done — lint / package / certification-audit / `npm audit` 0; `downloads/ganttChart.pbiviz` refreshed |
| **2** sample `.pbix` + screenshots | **Needs Power BI Desktop** — follow [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md) |
| **3** policy self-check | Code/docs aligned; remaining items are listing honesty at submit time |
| **4–7** Partner Center | **Needs publisher account** — use [`PARTNER_CENTER_LISTING.md`](./PARTNER_CENTER_LISTING.md) |

---

## 0) Naming recommendation

| Option | Verdict |
| --- | --- |
| **DataLund Gantt** (chosen) | Branded, searchable, under 50 chars, not a Microsoft trademark |
| “Gantt Chart” alone | Too generic; hard to find; easy to look like a Microsoft-owned visual |
| Names with “Microsoft”, “Power BI Certified”, or Office logos | Avoid — trademark / affiliation risk |

In Partner Center **Offer name**, use **DataLund Gantt**.  
Offer ID example (immutable): `datalund-gantt` (lowercase, hyphens OK).

---

## 1) Before Partner Center — go-live on datalund.no

Do this **first**. AppSource rejects broken privacy/support links.

- [x] Point DNS for `datalund.no` at GitHub Pages (see [Datalundno/Website](https://github.com/Datalundno/Website) `DOMAIN.md`) — apex `A` → GitHub Pages IPs; `www` `CNAME` → `datalundno.github.io`
- [x] Deploy [Datalundno/Website](https://github.com/Datalundno/Website) so these resolve (content verified 2026-08-06):
  - [x] `https://datalund.no/visuals/gantt/` ← Help / learn more
  - [x] `https://datalund.no/support/` ← Support (must be **different** from Help)
  - [x] `https://datalund.no/privacy/` ← Privacy policy
- [ ] **Enforce HTTPS** in Website repo Pages settings (required for a valid `datalund.no` certificate — AppSource reviewers use real browsers)
- [ ] Open each URL in a private browser window (no login wall, no cert warning)
- [x] Confirm privacy policy accurately describes: no telemetry, no external calls, sandbox-only

---

## 2) Build the submission package

From `ganttChart/` (requires `powerbi-visuals-tools` on `PATH`, e.g. `npm i -g powerbi-visuals-tools`):

```bash
npm install
npm run lint
pbiviz package
pbiviz package --certification-audit   # expect: no external requests
npm audit                              # expect: 0 high/moderate ideally
cp dist/ganttChartF8E34E29596A403E8E39808FA17C9CE9.1.6.0.0.pbiviz downloads/ganttChart.pbiviz
```

- [x] Use packaged file: `dist/ganttChart…1.6.0.0.pbiviz` (also copied to `downloads/ganttChart.pbiviz`)
- [x] Confirm `pbiviz.json` has real author name/email, supportUrl, description (no `localhost`)
- [x] GUID unchanged (`ganttChartF8E34E29596A403E8E39808FA17C9CE9`)
- [x] Store logo ready: `assets/store/logo-300.png` (exactly **300×300** PNG)

### Sample `.pbix` (required)

Step-by-step: [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md).

- [ ] In Power BI Desktop, create a report using `downloads/GanttSampleData.xlsx`
- [ ] Import **this same** `.pbiviz` version
- [ ] Show progress, groups, milestones, today line, and format pane
- [ ] Add a short “Tips” page
- [ ] Save offline `.pbix` (no live gateway / external dataset required to open)
- [ ] Version of visual inside `.pbix` **matches** the uploaded `.pbiviz`

### Screenshots (required)

Captions + capture notes are in [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md) §C.

- [ ] 1–5 PNG screenshots, exactly **1366×768**, each ≤ **1024 KB**
- [ ] Capture real Power BI Desktop UI (replace the mock in `assets/store/screenshot-placeholder-1366x768.png`)
- [ ] Add short callout text for key features
- [ ] No misleading Microsoft logos implying Microsoft built your visual
- [ ] Inclusive / accessible imagery (Partner Center expectation)

---

## 3) TOS / policy self-check (do not skip)

### Pricing & acquisition (§1180.1)

- [x] Listing is **free** to acquire from AppSource
- [x] If you later add paid features, mark “additional purchase may be required”, keep prior free features free, and follow IAP guidelines — **this visual currently has no IAP**

### Functionality (§1180.2)

- [ ] Works in Power BI Desktop **and** Power BI service *(smoke-test in Desktop/service before submit)*
- [x] Context menu on empty space **and** on data points (implemented)
- [ ] Pin to dashboard, filters, focus mode, formatting behave reasonably *(Desktop/service)*
- [ ] Handles strings, empties, negatives, large row counts, large numbers without console crashes *(Desktop)*
- [x] Does **not** open external windows / sites without explicit user action
- [x] Does **not** ask users to install extra files
- [x] Does **not** ask for Microsoft credentials outside approved OAuth (N/A — no auth)
- [x] No pop-ups except user-triggered (N/A — none)
- [x] No unreasonable privileges (`privileges: []`)

### Listing honesty

- [x] Description does **not** claim Microsoft affiliation or “official Microsoft visual” (see listing copy)
- [x] Description does **not** claim **Power BI Certified** until Microsoft actually certifies it
- [x] Do not use Microsoft product logos as your commercial logo
- [ ] Screenshots match real product behavior *(create in Desktop)*
- [x] Privacy policy matches reality (this visual has no outbound network)

### Intellectual property

- [x] You own or have rights to name **DataLund**, logo, screenshots, sample data
- [x] No scraped third-party charts / stock you cannot license
- [ ] MIT license in repo is fine for source; Partner Center still needs an **EULA** selection (standard Microsoft contract **or** [Power BI visuals default EULA PDF](https://visuals.azureedge.net/app-store/Power%20BI%20-%20Default%20Custom%20Visual%20EULA.pdf) **or** your own)

### Certification (optional, later)

- [ ] Publish to AppSource first (recommended), then request certification
- [ ] Certification needs a `certification` branch matching the package, source access for Microsoft, `npm audit` / eslint clean, no external calls
- [ ] Do **not** check certification until those are ready — false certification claims violate listing rules

---

## 4) Partner Center account

- [ ] Create / sign in to [Partner Center](https://partner.microsoft.com/dashboard)
- [ ] Enroll in **Microsoft Marketplace** (commercial marketplace) program
- [ ] Complete publisher profile (legal business info, tax/payout as required — even for free visuals)
- [ ] Use a work email if required by enrollment path
- [ ] Publisher display name should be **DataLund** (or your legal entity that owns datalund.no)

---

## 5) Create the Power BI visual offer

1. Partner Center → Marketplace offers → **New offer** → **Power BI visual**
2. **Offer ID:** `datalund-gantt` (cannot change later)
3. **Offer alias:** internal name, e.g. `DataLund Gantt`
4. Product setup:
   - [ ] Free (not “requires purchase of a service” unless you truly have IAP)
   - [ ] Do **not** request Power BI certification on the first pass unless repo/`certification` branch is ready

### Properties / legal

- [ ] Categories appropriate for project / timeline visuals
- [ ] EULA: prefer **Standard Contract** *or* Power BI default visual EULA link (simplest TOS-safe path)
- [ ] Privacy URL: `https://datalund.no/privacy/`
- [ ] Support document URL: `https://datalund.no/support/`

### Offer listing

- [ ] Name: `DataLund Gantt`
- [ ] Summary (≤100 chars), e.g.  
  `Free Power BI Gantt for tasks, progress, milestones, groups, and resources.`
- [ ] Description: value, how to bind fields, features, link to `https://datalund.no/visuals/gantt/`, state it is free, state it works offline in the sandbox
- [ ] Keywords (up to 3): e.g. `gantt`, `timeline`, `project`
- [ ] Logo: 300×300 PNG
- [ ] Screenshots: 1366×768 PNGs + captions
- [ ] Optional video (YouTube/Vimeo HTTPS)

### Packages

- [ ] Upload `.pbiviz`
- [ ] Upload sample `.pbix`
- [ ] Notes for certification / reviewers: brief test instructions, field bindings, link to source if requesting certification

### Availability

- [ ] Markets / countries you can support
- [ ] Hide from discovery only if you intentionally want soft-launch (usually leave discoverable)

---

## 6) Pre-submit test matrix (rejection prevention)

Run through [submission testing](https://learn.microsoft.com/en-us/power-bi/developer/visuals/submission-testing):

- [ ] Convert column chart ↔ DataLund Gantt without errors
- [ ] Selection cross-filters other visuals; other visuals filter this one
- [ ] Remove fields in random order — no console errors
- [ ] Format pane with empty / partial buckets
- [ ] Filters + slicers; tooltips stay correct
- [ ] Resize / scroll / pin to dashboard
- [ ] Reading view + edit view
- [ ] Bad data: nulls, inverted dates, huge row counts
- [ ] High contrast (Windows) smoke test
- [ ] Touch / click targets usable

---

## 7) Submit & after approval

- [ ] **Save draft** → **Review and publish** → submit
- [ ] Watch Partner Center certification / validation email
- [ ] AppSource listing link appears hours after approval; Desktop/Service catalog can take **~10–14 days** to update
- [ ] Do **not** change GUID on updates; bump four-part version (`1.6.0.0` → `1.6.1.0` / `1.7.0.0`)
- [ ] Keep datalund.no privacy/support pages online for the life of the listing

---

## 8) What this repo already satisfies

| Requirement | Status |
| --- | --- |
| Context menu (empty + datapoint) | Done |
| Landing page | Done |
| No external network privileges | Done |
| Certification audit (no fetch/XHR) | Done (re-verified 2026-08-06) |
| English string resources | Done |
| allowInteractions | Done |
| Real support/privacy target URLs | Point to datalund.no (deployed; enable Enforce HTTPS) |
| 300×300 logo | `ganttChart/assets/store/logo-300.png` |
| Sample Excel | `ganttChart/downloads/GanttSampleData.xlsx` |
| Packaged `.pbiviz` 1.6.0.0 | `ganttChart/downloads/ganttChart.pbiviz` |
| Partner Center listing copy | `ganttChart/docs/PARTNER_CENTER_LISTING.md` |
| Sample `.pbix` | **You create in Desktop** |
| Live HTTPS (valid custom-domain cert) | **Enable Enforce HTTPS** on [Datalundno/Website](https://github.com/Datalundno/Website/settings/pages) |

---

## Official docs

- [Publish Power BI visuals](https://learn.microsoft.com/en-us/power-bi/developer/visuals/office-store)
- [Create Power BI visual offer](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/power-bi-visual-offer-setup)
- [Offer listing details](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/power-bi-visual-offer-listing)
- [Submission testing](https://learn.microsoft.com/en-us/power-bi/developer/visuals/submission-testing)
- [Marketplace certification policies §1180](https://learn.microsoft.com/en-us/legal/marketplace/certification-policies#1180-power-bi-visuals)
- [Power BI certification (optional)](https://learn.microsoft.com/en-us/power-bi/developer/visuals/power-bi-custom-visuals-certified)
