"use strict";

import { DisplayRow, TaskRow, UNGROUPED_KEY } from "./types";

export function hasGrouping(tasks: TaskRow[]): boolean {
    return tasks.some((t) => t.group != null && t.group !== "");
}

/**
 * Build visible rows: optional group headers with collapsible task children.
 * Group order follows first appearance in the data.
 */
export function buildDisplayRows(tasks: TaskRow[], collapsedGroups: Set<string>): DisplayRow[] {
    if (!hasGrouping(tasks)) {
        return tasks.map((task) => ({
            id: task.id,
            kind: "task" as const,
            label: task.task,
            groupKey: UNGROUPED_KEY,
            task
        }));
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
        const label = key === UNGROUPED_KEY ? "Ungrouped" : key;

        rows.push({
            id: `group::${key}`,
            kind: "group",
            label,
            groupKey: key,
            collapsed,
            taskCount: groupTasks.length
        });

        if (!collapsed) {
            groupTasks.forEach((task) => {
                rows.push({
                    id: task.id,
                    kind: "task",
                    label: task.task,
                    groupKey: key,
                    task
                });
            });
        }
    });

    return rows;
}

export function visibleTaskRows(displayRows: DisplayRow[]): TaskRow[] {
    return displayRows
        .filter((r) => r.kind === "task" && r.task)
        .map((r) => r.task!);
}
