# Website DOMAIN.md patch — email for Partner Center

Apply in **`Datalundno/Website`** `DOMAIN.md` under the existing **E-post** section (replace the Domeneshop-only forwarding blurb with the fuller guidance, or link out).

Suggested replacement for the `### E-post — support@datalund.no` section:

```markdown
### E-post — `datalund.no`

There are currently no MX records until you enable a mail provider.

For **AppSource / Partner Center** you need a Microsoft Entra **work account**
(person mailbox such as `jonas@datalund.no`). Role-based names
(`admin@`, `support@`, `info@`) must not be the enrollment identity.

**Recommended:** Microsoft 365 Business Basic on `datalund.no`
(see GANTT repo `ganttChart/docs/EMAIL.md` for step-by-step DNS at Domeneshop).

Also keep a public **`support@datalund.no`** inbox (shared mailbox or alias)
matching https://datalund.no/support/.

If you only need temporary forwarding before Microsoft 365:

1. Domeneshop → **Mine domener → datalund.no → Epost**
2. Create **`support`** → forward to your private inbox
3. Let Domeneshop manage MX/SPF; do not point MX at GitHub

When moving to Microsoft 365, replace Domeneshop MX with the records
from the Microsoft 365 domain wizard (one mail system at a time).
```
