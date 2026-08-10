"use strict";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

/**
 * Format → General → Color by (ecosystem contract property name: colorBy).
 * Suggested Gantt values: default · resource · group · task
 */
export type ColorBy = "default" | "resource" | "group" | "task";

export const COLOR_BY_VALUES: ColorBy[] = ["default", "resource", "group", "task"];

export function isColorBy(value: unknown): value is ColorBy {
    return value === "default"
        || value === "resource"
        || value === "group"
        || value === "task";
}

function readObjectValue(raw: unknown): unknown {
    if (raw == null) {
        return null;
    }
    // Formatting model / some hosts wrap enum members as { value: "…" }
    if (typeof raw === "object" && raw !== null && "value" in (raw as object)) {
        return (raw as { value: unknown }).value;
    }
    return raw;
}

/**
 * Resolve Color by from the dataView, migrating legacy `colorByResource` (bool)
 * so existing reports keep their coloring when the property was renamed to `colorBy`.
 *
 * Precedence:
 * 1. Persisted `general.colorBy` (new enum)
 * 2. Legacy `general.colorByResource === true` → `resource`
 * 3. Formatting-model dropdown value (if valid)
 * 4. `default`
 */
export function resolveColorBy(
    dataView: DataView | undefined,
    formattingValue?: unknown
): ColorBy {
    const general = dataView?.metadata?.objects?.["general"] as
        | Record<string, unknown>
        | undefined;

    if (general) {
        const persisted = readObjectValue(general["colorBy"]);
        if (isColorBy(persisted)) {
            return persisted;
        }

        const legacy = readObjectValue(general["colorByResource"]);
        if (legacy === true) {
            return "resource";
        }
    }

    const fromFormat = readObjectValue(formattingValue);
    if (isColorBy(fromFormat)) {
        return fromFormat;
    }

    return "default";
}

/** Palette key for the active Color by mode (null → use default bar fill). */
export function colorByKey(
    colorBy: ColorBy,
    task: { task: string; group: string | null; resource: string | null }
): string | null {
    switch (colorBy) {
        case "resource":
            return task.resource && task.resource !== "" ? task.resource : null;
        case "group":
            return task.group && task.group !== "" ? task.group : null;
        case "task":
            return task.task && task.task !== "" ? task.task : null;
        default:
            return null;
    }
}
