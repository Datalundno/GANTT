"use strict";

import { collapseLineRows } from "./lines";
import { DisplayRow, TaskRow, UNGROUPED_KEY } from "./types";

export function hasGrouping(tasks: TaskRow[]): boolean {
    return tasks.some((t) => t.group != null && t.group !== "");
}

function groupHeader(key: string, taskCount: number, collapsed: boolean): DisplayRow {
    const id = `group::${key}`;
    return {
        id,
        kind: "group",
        label: key === UNGROUPED_KEY ? "Ungrouped" : key,
        groupKey: key,
        collapsed,
        taskCount,
        laneCount: 1,
        slotIds: [id]
    };
}

/**
 * Visible rows: optional group headers, then one row per task — or one row per
 * Line when that field is set. Group order follows first appearance.
 * A line with no remaining bars is omitted, so an empty group is omitted too.
 */
export function buildDisplayRows(tasks: TaskRow[], collapsedGroups: Set<string>): DisplayRow[] {
    if (!hasGrouping(tasks)) {
        return collapseLineRows(tasks, UNGROUPED_KEY);
    }

    const order: string[] = [];
    const byGroup = new Map<string, TaskRow[]>();

    tasks.forEach((task) => {
        const key = task.group && task.group !== "" ? task.group : UNGROUPED_KEY;
        if (!byGroup.has(key)) {
            byGroup.set(key, []);
            order.push(key);
        }
        byGroup.get(key)!.push(task);
    });

    const rows: DisplayRow[] = [];
    order.forEach((key) => {
        const groupTasks = byGroup.get(key) ?? [];
        const collapsed = collapsedGroups.has(key);
        rows.push(groupHeader(key, groupTasks.length, collapsed));
        if (!collapsed) {
            rows.push(...collapseLineRows(groupTasks, key));
        }
    });

    return rows;
}

export function visibleTaskRows(displayRows: DisplayRow[]): TaskRow[] {
    const tasks: TaskRow[] = [];
    displayRows.forEach((row) => {
        if (row.kind !== "task") {
            return;
        }
        if (row.tasks && row.tasks.length > 0) {
            tasks.push(...row.tasks);
            return;
        }
        if (row.task) {
            tasks.push(row.task);
        }
    });
    return tasks;
}

export function displaySlotIds(displayRows: DisplayRow[]): string[] {
    const ids: string[] = [];
    displayRows.forEach((row) => {
        if (row.slotIds.length > 0) {
            ids.push(...row.slotIds);
        } else {
            ids.push(row.id);
        }
    });
    return ids;
}

export function taskSlotMap(displayRows: DisplayRow[]): Map<string, string> {
    const map = new Map<string, string>();
    displayRows.forEach((row) => {
        (row.tasks ?? []).forEach((task) => {
            const slot = row.slotIds.length <= 1
                ? (row.slotIds[0] ?? row.id)
                : (row.slotIds[task.lane] ?? row.slotIds[0] ?? row.id);
            map.set(task.id, slot);
        });
    });
    return map;
}
