# Publish DataLund Gantt to AppSource — step-by-step

This is the **do-this-in-order** guide. Full policy checklist: [`APPSOURCE.md`](./APPSOURCE.md). Paste-ready listing text: [`PARTNER_CENTER_LISTING.md`](./PARTNER_CENTER_LISTING.md). Desktop assets: [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md).

**Goal today:** get the visual **live on AppSource** (discoverable).  
**Do not** request Power BI certification on the first submit — that delays approval. Request certification in a follow-up update once the listing is live (that unlocks Export to PDF / PowerPoint).

---

## Status snapshot (repo + site)

| Step | Status |
| --- | --- |
| HTTPS help `https://datalund.no/visuals/gantt/` | Live |
| HTTPS support `https://datalund.no/support/` | Live (different from help) |
| HTTPS privacy `https://datalund.no/privacy/` | Live |
| Download `https://datalund.no/downloads/ganttChart.pbiviz` | Live |
| GUID stable | `ganttChartF8E34E29596A403E8E39808FA17C9CE9` |
| Version | **1.7.1.0** |
| Store logo 300×300 | `assets/store/logo-300.png` |
| Sample Excel | `downloads/GanttSampleData.xlsx` |
| Packaged `.pbiviz` | `downloads/ganttChart.pbiviz` |
| Certification audit (no external requests) | Clean |
| Runtime `npm audit` (`--omit=dev`) | 0 vulnerabilities |
| Sample `.pbix` | **You create in Power BI Desktop** |
| Real screenshots 1366×768 | **You capture in Power BI Desktop** |
| Partner Center offer | **You create / submit** |

---

## Phase 0 — Accounts (you, once)

### 0a. Email on `datalund.no` (do this first)

Partner Center needs a **work account**, not Gmail/Outlook.com.  
`datalund.no` currently has **no MX records**.

Follow [`EMAIL.md`](./EMAIL.md):

1. Prefer **Microsoft 365 Business Basic** (trial or paid) for `datalund.no`.
2. Create a **person** mailbox such as `jonas@datalund.no` (not `admin@` / `support@`).
3. Also ensure `support@datalund.no` receives mail (shared mailbox or alias).
4. Verify with `dig MX datalund.no +short`.

### 0b. Partner Center

1. Sign in to [Partner Center](https://partner.microsoft.com/dashboard) with the person work account.
2. Enroll the publisher in the **Microsoft Marketplace** program if not already enrolled.
3. Complete publisher profile (legal business info). Tax/payout may still be required even for a free visual.
4. Publisher display name: **DataLund** (or the legal entity that owns datalund.no).

Verification can take days (legal business verification). Do Phase 1–2 and [`WINDOWS_CAPTURE.md`](./WINDOWS_CAPTURE.md) in parallel while waiting. All paste-ready Partner Center text is in [`SUBMISSION_PACK.md`](./SUBMISSION_PACK.md).

---

## Phase 1 — Fresh package (already done in this repo)

From `ganttChart/` on a machine with Node ≥ 20.19:

```bash
npm install
npm run lint
npx --yes powerbi-visuals-tools@7.2.1 package
npx --yes powerbi-visuals-tools@7.2.1 package --certification-audit
npm audit --omit=dev
cp dist/ganttChartF8E34E29596A403E8E39808FA17C9CE9.*.pbiviz downloads/ganttChart.pbiviz
```

Upload **this** `.pbiviz` (1.7.1.0), not an older build.

---

## Phase 2 — Desktop assets (you, ~30–60 min)

Power BI Desktop is required. Follow [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md) exactly:

1. Import `downloads/GanttSampleData.xlsx`.
2. Import `downloads/ganttChart.pbiviz` (same version you will upload).
3. Build a 2-page sample report → save **`DataLundGantt-Sample.pbix`** (offline, no gateway).
4. Capture **1–5** screenshots at **exactly 1366×768** PNG, each ≤ 1024 KB.
5. Run the smoke-test checklist in that doc (context menu, cross-filter, bad fields, resize).

Replace the placeholder `assets/store/screenshot-placeholder-1366x768.png` with real shots (keep them local if you prefer not to commit).

---

## Phase 3 — Create the offer in Partner Center

1. Partner Center → **Marketplace offers** → **+ New offer** → **Power BI visual**.
2. Fill:

| Field | Value |
| --- | --- |
| Offer ID | `datalund-gantt` (**immutable** — choose carefully) |
| Offer alias | `DataLund Gantt` |

3. **Offer setup**
   - Select: **My offer does not require purchase of a service and does not offer in app purchases** (free).
   - **Power BI certification:** leave **unchecked** on first publish.
   - Customer leads / CRM: optional — skip unless you want leads wired now.
4. **Save draft**, then complete the left-nav tabs:

### Properties

- Privacy: `https://datalund.no/privacy/`
- Support: `https://datalund.no/support/`
- EULA: Standard Contract **or** [Power BI default visual EULA](https://visuals.azureedge.net/app-store/Power%20BI%20-%20Default%20Custom%20Visual%20EULA.pdf)
- Categories: closest match for project / timeline / reporting visuals

### Offer listing

Paste from [`PARTNER_CENTER_LISTING.md`](./PARTNER_CENTER_LISTING.md):

- Name: **DataLund Gantt**
- Summary, description, keywords
- Logo: `assets/store/logo-300.png`
- Screenshots + captions from Desktop phase
- Help link: `https://datalund.no/visuals/gantt/`

### Packages

- Upload `downloads/ganttChart.pbiviz` (1.7.1.0)
- Upload `DataLundGantt-Sample.pbix`
- Paste **Notes for reviewers** from the listing doc

### Availability

- Choose markets you can support
- Leave discoverable (do not hide unless soft-launching on purpose)

---

## Phase 4 — Pre-submit self-check

Before **Review and publish**:

- [ ] Privacy / support / help URLs open in a private window (no login wall)
- [ ] Listing does **not** say “Power BI Certified” or imply Microsoft built it
- [ ] `.pbix` visual version matches uploaded `.pbiviz` (1.7.1.0)
- [ ] Screenshots are real Desktop UI at 1366×768
- [ ] Smoke tests from [`DESKTOP_SAMPLE.md`](./DESKTOP_SAMPLE.md) §D passed
- [ ] Certification checkbox is **off** for this first pass

Official testing matrix: [Submission testing](https://learn.microsoft.com/en-us/power-bi/developer/visuals/submission-testing).

---

## Phase 5 — Submit

1. **Save draft** → **Review and publish** → submit.
2. Watch Partner Center + email for validation / certification feedback.
3. After approval:
   - AppSource product page can appear within hours.
   - Power BI Desktop / Service visual store can take **~10–14 days** to show the new visual.
4. Keep datalund.no privacy + support pages online for the life of the listing.
5. Never change the GUID. For updates, bump the four-part version in `pbiviz.json` / `package.json`.

---

## Phase 6 — After it is live (PDF export)

1. Create a `certification` branch that matches the published package source.
2. In Partner Center, submit an update and **request Power BI certification**.
3. Give Microsoft read access to the repo / `certification` branch as required.
4. When the certified badge ships, re-test **Export → PDF** — that is what removes *“Dette visualobjektet støtter ikke eksportering”*.

Details: [`SUPPORT.md`](./SUPPORT.md) FAQ + [Get your visual certified](https://learn.microsoft.com/en-us/power-bi/developer/visuals/power-bi-custom-visuals-certified).

---

## Official docs

- [Publish Power BI visuals](https://learn.microsoft.com/en-us/power-bi/developer/visuals/office-store)
- [Create offer](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/power-bi-visual-offer-setup)
- [Listing details](https://learn.microsoft.com/en-us/partner-center/marketplace-offers/power-bi-visual-offer-listing)
- [Marketplace policies §1180](https://learn.microsoft.com/en-us/legal/marketplace/certification-policies#1180-power-bi-visuals)
