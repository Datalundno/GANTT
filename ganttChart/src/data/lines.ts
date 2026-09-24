"use strict";

import { DisplayRow, TaskRow } from "./types";

export interface TimeSpan {
    start: Date;
    end: Date;
}

/** Inclusive for zero-length milestones; touching endpoints of positive spans do not overlap. */
export function intervalsOverlap(a: TimeSpan, b: TimeSpan): boolean {
    const a0 = a.start.getTime();
    const a1 = a.end.getTime();
    const b0 = b.start.getTime();
    const b1 = b.end.getTime();
    const aZero = a0 === a1;
    const bZero = b0 === b1;

    if (aZero && bZero) {
        return a0 === b0;
    }
    if (aZero) {
        return a0 >= b0 && a0 <= b1;
    }
    if (bZero) {
        return b0 >= a0 && b0 <= a1;
    }
    return a0 < b1 && b0 < a1;
}

/**
 * First-fit lanes by start time. Non-overlapping bars share lane 0.
 * Mutates `lane` on each task. Returns the number of lanes (at least 1).
 */
export function assignLanes(tasks: TaskRow[]): number {
    const order = tasks.map((task, index) => ({ task, index }));
    order.sort((a, b) => {
        const byStart = a.task.start.getTime() - b.task.start.getTime();
        if (byStart !== 0) {
            return byStart;
        }
        const byEnd = a.task.end.getTime() - b.task.end.getTime();
        if (byEnd !== 0) {
            return byEnd;
        }
        return a.index - b.index;
    });

    const lanes: TaskRow[][] = [];
    order.forEach(({ task }) => {
        let lane = -1;
        for (let i = 0; i < lanes.length; i++) {
            const blocked = lanes[i].some((other) => intervalsOverlap(other, task));
            if (!blocked) {
                lane = i;
                break;
            }
        }
        if (lane < 0) {
            lane = lanes.length;
            lanes.push([]);
        }
        lanes[lane].push(task);
        task.lane = lane;
    });

    return Math.max(1, lanes.length);
}

function lineValue(task: TaskRow): string | null {
    const value = task.line?.trim();
    return value ? value : null;
}

function slotIdsFor(rowId: string, laneCount: number): string[] {
    const count = Math.max(1, laneCount);
    if (count === 1) {
        return [rowId];
    }
    const ids: string[] = [];
    for (let lane = 0; lane < count; lane++) {
        ids.push(`${rowId}::lane::${lane}`);
    }
    return ids;
}

function singleTaskRow(task: TaskRow, groupKey: string): DisplayRow {
    task.lane = 0;
    return {
        id: task.id,
        kind: "task",
        label: task.task,
        groupKey,
        task,
        tasks: [task],
        laneCount: 1,
        slotIds: [task.id]
    };
}

/**
 * When tasks carry a Line value, phases that share it become one row labeled
 * with that value. Blank Line values stay one bar per task. Task name alone
 * never merges rows.
 */
export function collapseLineRows(tasks: TaskRow[], groupKey: string): DisplayRow[] {
    const order: Array<{ kind: "task"; task: TaskRow } | { kind: "line"; line: string }> = [];
    const byLine = new Map<string, TaskRow[]>();

    tasks.forEach((task) => {
        const line = lineValue(task);
        if (!line) {
            order.push({ kind: "task", task });
            return;
        }
        if (!byLine.has(line)) {
            byLine.set(line, []);
            order.push({ kind: "line", line });
        }
        byLine.get(line)!.push(task);
    });

    return order.map((entry) => {
        if (entry.kind === "task") {
            return singleTaskRow(entry.task, groupKey);
        }
        const members = byLine.get(entry.line) ?? [];
        const laneCount = assignLanes(members);
        const id = `line::${groupKey}::${entry.line}`;
        return {
            id,
            kind: "task",
            label: entry.line,
            groupKey,
            tasks: members,
            laneCount,
            slotIds: slotIdsFor(id, laneCount)
        };
    });
}
