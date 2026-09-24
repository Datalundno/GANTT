"use strict";

import { addMonths, startOfDay } from "../utils/dates";
import { TaskRow } from "./types";

export type PastEventsMode = "all" | "lastMonth" | "none";

export function parsePastEvents(value: unknown): PastEventsMode {
    if (value === "all" || value === "lastMonth" || value === "none") {
        return value;
    }
    return "all";
}

/** A bar (or zero-length milestone) is past when its end is before today's local midnight. */
export function isPastBar(end: Date, today: Date): boolean {
    return end.getTime() < startOfDay(today).getTime();
}

/**
 * Ongoing (start ≤ today ≤ end) and future bars stay in every mode.
 * "none" drops every past bar. "lastMonth" also keeps a past bar whose end
 * falls on or after the local start of the day one calendar month ago.
 */
export function keepTask(task: Pick<TaskRow, "end">, mode: PastEventsMode, today: Date): boolean {
    if (mode === "all" || !isPastBar(task.end, today)) {
        return true;
    }
    if (mode === "none") {
        return false;
    }
    const cutoff = addMonths(startOfDay(today), -1);
    return task.end.getTime() >= cutoff.getTime();
}

export function filterPastTasks(tasks: TaskRow[], mode: PastEventsMode, today: Date): TaskRow[] {
    if (mode === "all") {
        return tasks;
    }
    return tasks.filter((task) => keepTask(task, mode, today));
}
