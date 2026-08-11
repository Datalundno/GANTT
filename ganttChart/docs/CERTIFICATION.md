# Certification readiness — DataLund Gantt

Status for AppSource / Partner Center Power BI visual certification. GUID: `ganttChartF8E34E29596A403E8E39808FA17C9CE9`.

## Verified in source (Section D)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Rendering Events | **Present** | `visual.ts` `update()`: `renderingStarted` first; exactly one of `renderingFinished` / `renderingFailed` |
| Selection API | **Present** | `createSelectionIdBuilder` in converter; `ISelectionManager.select` / `clear` / `registerOnSelectCallback` / `showContextMenu` |
| Cross-filter model | **Selection / highlight** | Capabilities: `supportsHighlight`, `supportsMultiVisualSelection`; no `general.filter` / Filter API (timeline visual — intentional) |
| Tooltips | **Wired** | `ITooltipService` + `tooltipFields` role via `buildTooltipDataItems` |
| Formatting model | **Modern** | `getFormattingModel` + `FormattingSettingsService` (not `enumerateObjectInstances`) |
| High contrast | **Present** | `utils/contrast.ts` + render path uses `colorPalette.isHighContrast` / fg / bg / fgSelected |
| Localization | **Present** | `createLocalizationManager`; `en-US` + `nb-NO` resjson |
| Landing page | **Present** | `supportsLandingPage`; DOM landing when no fields bound |
| Privileges / network | **Empty / none** | `capabilities.json` `"privileges": []`; `externalJS: null` |
| DOM safety | **Pass (manual grep)** | User/task strings via d3 `.text()`; no `innerHTML` / `eval` / `fetch` / `XMLHttpRequest` / `WebSocket` in `src/` or `style/` |
| API version | **5.11.1** | `pbiviz.json` + `powerbi-visuals-api` |
| LICENSE | **MIT** | root `LICENSE` + `ganttChart/LICENSE` |
| Author contact | **Branded** | `support@datalund.no` |
| One visual / one GUID | **Branded only on cert path** | Whitelabel uses a different GUID on a separate personal branch; not packaged from `certification` |

## Partner Center / packaging checklist

See [`APPSOURCE.md`](./APPSOURCE.md). Privacy policy URL for listing: https://datalund.no/privacy/

## Branch policy

- AppSource submission source must match the lowercase **`certification`** branch.
- Do not merge white-label identity swaps, `website-sync/`, or lab experiments into `certification`.
- Keep branded and whitelabel GUIDs distinct; only the branded GUID ships from this cert path.

## Remaining polish (not hard blockers for first audit)

- Stronger keyboard reachability for individual bars (root already has `tabindex="0"`).
- Virtualization / `fetchMoreData` if datasets approach the 30k `top` cap.
- Sample `.pbix` + real 1366×768 screenshots for Partner Center (not committed as site HTML here).
