"use strict";

/**
 * Suite-wide bar coloring modes.
 * Keep names aligned across visuals when more ship.
 */

import { TaskRow } from "../data/types";

export type ColorByMode = "default" | "resource" | "group" | "task";

export function parseColorByMode(raw: unknown): ColorByMode {
    if (raw === "resource" || raw === "group" || raw === "task" || raw === "default") {
        return raw;
    }
    // Legacy Format toggle stored as boolean on older reports
    if (raw === true) {
        return "resource";
    }
    return "default";
}

/** Palette category key, or null to use the default bar fill. */
export function colorByCategory(mode: ColorByMode, task: TaskRow): string | null {
    switch (mode) {
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
