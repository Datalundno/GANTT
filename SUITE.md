# DataLund visuals suite

Shared contracts so Gantt and future visuals look and behave like one family on a report page.

> **Source of truth:** [Website `ECOSYSTEM.md`](https://github.com/Datalundno/Website/blob/main/ECOSYSTEM.md) (see also the local [`ECOSYSTEM.md`](./ECOSYSTEM.md) pointer). When this file and ECOSYSTEM disagree on fields, density, Color by, or starters, **ECOSYSTEM wins**.

## Density presets (ship now)

Format → **General → Density**. Same names across all suite visuals.

| Preset | Intent | barHeight | rowGap | fontSize | labelWidth | cornerRadius |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Compact** | Many visuals on one page | 16 | 8 | 10 | 140 | 2 |
| **Comfortable** | Default | 28 | 12 | 12 | 200 | 4 |
| **Large** | Sparse pages / presenting | 36 | 16 | 14 | 240 | 6 |
| **Custom** | Use each visual’s own size sliders | — | — | — | — | — |

Source of truth in code: `ganttChart/src/suite/density.ts` (move to a shared npm package when the suite grows).

**Rule:** Sub-agents must use these names and numbers. Do not invent “Small/Medium/Huge”.

## Format → Color by (timeline / bar visuals)

Property **`name`**: `colorBy` · Display name: **Color by**.

| Visual | Values |
| --- | --- |
| **Gantt** | `default` · `resource` · `group` · `task` |

Migrate legacy `colorByResource` / `colorMode` so reports do not reset. See ECOSYSTEM.md §4.

## Shared field roles

| Role | Name | Notes |
| --- | --- | --- |
| Task | `task` | Required for Gantt / lists |
| Start | `startDate` | Required |
| End | `endDate` | Prefer End Date for PM models |
| Duration | `duration` | Days; optional alternative to End |
| Progress | `progress` | 0–1 or 0–100 |
| Group | `group` | Phase / parent |
| Resource | `resource` | Person / team |
| Tooltips | `tooltipFields` | Extra detail (optional later) |
| Status / RAG | `status` | Optional; reuse when status is part of the job |

## Visual roadmap (priority)

1. **Gantt** (shipping) — timeline (*When*)
2. **Resource load** — people on tasks (*Who is busy*)
3. **Task list** — browse + select (*What’s in the portfolio*)

Lab cockpit prototypes multi-panel ideas; AppSource stays one job per visual.

## Lab vs store

| | Store / website | Lab |
| --- | --- | --- |
| Audience | Public download / AppSource | Experiments |
| Density presets | Yes | Yes (same table) |
| Cockpit panels | No | Optional |

## Sub-agent kickoff

Paste the prompt from Website ECOSYSTEM.md §8 (existing visuals) or §9 (new visuals).
