# DataLund visuals suite

Shared contracts so Gantt and future visuals look and behave like one family on a report page.

## Density presets (ship now)

Format → **General → Density**. Same names across all suite visuals.

| Preset | Intent | barHeight | rowGap | fontSize | labelWidth | cornerRadius |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Compact** | Many visuals on one page | 16 | 8 | 10 | 140 | 2 |
| **Comfortable** | Default | 28 | 12 | 12 | 200 | 4 |
| **Large** | Sparse pages / presenting | 36 | 16 | 14 | 240 | 6 |
| **Custom** | Use each visual’s own size sliders | — | — | — | — | — |

Source of truth in code: `ganttChart/src/suite/density.ts` (move to `shared/density.ts` when the monorepo grows).

**Rule:** Sub-agents must use these names and numbers. Do not invent “Small/Medium/Huge”.

## Future: suite design / theme packs

Later we may add a **Suite design** control (e.g. DataLund default, High contrast-friendly, Print-friendly) that sets colors/chrome together. Density stays independent of theme.

## Shared field roles

| Role | Name | Notes |
| --- | --- | --- |
| Task | `task` | Required for Gantt / lists |
| Start | `startDate` | Required |
| End | `endDate` | Or Duration |
| Duration | `duration` | Days; alternative to End |
| Progress | `progress` | 0–1 or 0–100 |
| Group | `group` | Phase / parent |
| Resource | `resource` | Person / team |
| Tooltips | `tooltipFields` | Extra detail (notes, etc.) |

## Visual roadmap (priority)

1. **Gantt** (shipping) — timeline  
2. **Resource load** — people on tasks (separate repo; brief `RESOURCE_LOAD.md`)  
3. **Task list** — browse + select → agent brief: [`TASK_LIST.md`](TASK_LIST.md) (implement in a **separate** repo)  

Lab cockpit prototypes multi-panel ideas; AppSource stays one job per visual.

## Lab vs store

| | Store / website | Lab |
| --- | --- | --- |
| Audience | Public download / AppSource | Experiments |
| Density presets | Yes | Yes (same table) |
| Cockpit panels | No | Optional |

## Sub-agent kickoff

> Follow `SUITE.md`. Use Density Compact/Comfortable/Large/Custom with the table values. Do not change suite field role names. Open a focused PR for this visual only.
