"use strict";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import {
    DependencyLink,
    ROLE_DURATION,
    ROLE_END,
    ROLE_GROUP,
    ROLE_PREDECESSOR,
    ROLE_PROGRESS,
    ROLE_RESOURCE,
    ROLE_START,
    ROLE_TASK,
    ROLE_TOOLTIPS,
    RoleColumnIndex,
    TaskRow,
    TaskStatus,
    TooltipField,
    ViewModel
} from "./types";
import {
    addDays,
    chooseGranularity,
    dayDiff,
    normalizeProgress,
    parseDate
} from "../utils/dates";

function emptyViewModel(errorMessage: string | null): ViewModel {
    return {
        tasks: [],
        dependencies: [],
        hasGroups: false,
        domainStart: null,
        domainEnd: null,
        granularity: "month",
        errorMessage
    };
}

export function resolveRoleIndexes(columns: DataViewMetadataColumn[] | undefined): RoleColumnIndex {
    const indexes: RoleColumnIndex = {
        task: null,
        startDate: null,
        endDate: null,
        duration: null,
        progress: null,
        group: null,
        resource: null,
        predecessor: null,
        tooltips: []
    };

    if (!columns) {
        return indexes;
    }

    columns.forEach((column, index) => {
        const roles = column.roles;
        if (!roles) {
            return;
        }
        if (roles[ROLE_TASK]) {
            indexes.task = index;
        }
        if (roles[ROLE_START]) {
            indexes.startDate = index;
        }
        if (roles[ROLE_END]) {
            indexes.endDate = index;
        }
        if (roles[ROLE_DURATION]) {
            indexes.duration = index;
        }
        if (roles[ROLE_PROGRESS]) {
            indexes.progress = index;
        }
        if (roles[ROLE_GROUP]) {
            indexes.group = index;
        }
        if (roles[ROLE_RESOURCE]) {
            indexes.resource = index;
        }
        if (roles[ROLE_PREDECESSOR]) {
            indexes.predecessor = index;
        }
        if (roles[ROLE_TOOLTIPS]) {
            indexes.tooltips.push(index);
        }
    });

    return indexes;
}

function cellValue(row: powerbi.DataViewTableRow, index: number | null): unknown {
    if (index == null || index < 0 || index >= row.length) {
        return null;
    }
    return row[index];
}

function asText(value: unknown): string | null {
    if (value == null || value === "") {
        return null;
    }
    return String(value);
}

function asNumber(value: unknown): number | null {
    if (value == null || value === "") {
        return null;
    }
    const n = typeof value === "number" ? value : Number(value);
    return isFinite(n) ? n : null;
}

function buildTooltipFields(
    row: powerbi.DataViewTableRow,
    columns: DataViewMetadataColumn[],
    tooltipIndexes: number[]
): TooltipField[] {
    return tooltipIndexes.map((index) => {
        const column = columns[index];
        const raw = row[index];
        let value: string | number | Date | null = null;
        if (raw instanceof Date) {
            value = raw;
        } else if (typeof raw === "number") {
            value = raw;
        } else if (raw != null) {
            value = String(raw);
        }
        return {
            displayName: column?.displayName ?? `Field ${index}`,
            value
        };
    });
}

export function computeTaskStatus(start: Date, end: Date, progress: number | null, today: Date = new Date()): TaskStatus {
    const p = progress == null ? 0 : Math.max(0, Math.min(1, progress));
    if (p >= 0.999) {
        return "done";
    }
    if (today < start) {
        return "future";
    }
    if (today > end) {
        return "late";
    }
    const span = Math.max(1, end.getTime() - start.getTime());
    const expected = Math.max(0, Math.min(1, (today.getTime() - start.getTime()) / span));
    if (p + 0.12 < expected) {
        return "atrisk";
    }
    return "ontrack";
}

function buildDependencies(tasks: TaskRow[]): DependencyLink[] {
    const byName = new Map<string, TaskRow>();
    tasks.forEach((task) => {
        if (!byName.has(task.task)) {
            byName.set(task.task, task);
        }
    });

    const links: DependencyLink[] = [];
    tasks.forEach((task) => {
        if (!task.predecessor) {
            return;
        }
        const pred = byName.get(task.predecessor);
        if (!pred || pred.id === task.id) {
            return;
        }
        links.push({
            id: `${pred.id}->${task.id}`,
            fromTaskId: pred.id,
            toTaskId: task.id
        });
    });
    return links;
}

export function convertDataView(
    dataView: DataView | undefined,
    host?: IVisualHost
): ViewModel {
    if (!dataView || !dataView.table || !dataView.metadata) {
        return emptyViewModel("Add Task and Start Date fields to render the Gantt chart.");
    }

    const columns = dataView.metadata.columns ?? [];
    const roles = resolveRoleIndexes(columns);

    if (roles.task == null || roles.startDate == null) {
        return emptyViewModel("Task and Start Date are required.");
    }

    if (roles.endDate == null && roles.duration == null) {
        return emptyViewModel("Provide End Date or Duration so task bars can be sized.");
    }

    const table = dataView.table;
    const rows = table.rows ?? [];
    if (rows.length === 0) {
        return emptyViewModel("No rows to display.");
    }

    const tasks: TaskRow[] = [];
    let domainStart: Date | null = null;
    let domainEnd: Date | null = null;
    const today = new Date();

    rows.forEach((row, rowIndex) => {
        const taskName = asText(cellValue(row, roles.task));
        const start = parseDate(cellValue(row, roles.startDate));

        if (!taskName || !start) {
            return;
        }

        let end = parseDate(cellValue(row, roles.endDate));
        const duration = asNumber(cellValue(row, roles.duration));

        if (!end) {
            if (duration == null) {
                return;
            }
            end = addDays(start, Math.max(0, duration));
        }

        let flaggedInvalidRange = false;
        if (end.getTime() < start.getTime()) {
            end = new Date(start.getTime());
            flaggedInvalidRange = true;
        }

        const durationDays = Math.max(0, dayDiff(start, end));
        const isMilestone = durationDays === 0;
        const progress = normalizeProgress(cellValue(row, roles.progress));

        const selectionId = host
            ? host.createSelectionIdBuilder()
                .withTable(table, rowIndex)
                .createSelectionId()
            : null;

        const task: TaskRow = {
            id: `${taskName}::${rowIndex}`,
            task: taskName,
            start,
            end,
            durationDays,
            progress,
            group: asText(cellValue(row, roles.group)),
            resource: asText(cellValue(row, roles.resource)),
            predecessor: asText(cellValue(row, roles.predecessor)),
            status: computeTaskStatus(start, end, progress, today),
            isMilestone,
            flaggedInvalidRange,
            tooltipFields: buildTooltipFields(row, columns, roles.tooltips),
            selectionId: selectionId as powerbi.visuals.ISelectionId | null
        };

        tasks.push(task);

        if (!domainStart || start < domainStart) {
            domainStart = start;
        }
        if (!domainEnd || end > domainEnd) {
            domainEnd = end;
        }
    });

    if (tasks.length === 0) {
        return emptyViewModel("No valid tasks with parseable dates were found.");
    }

    const padDays = 3;
    domainStart = addDays(domainStart!, -padDays);
    domainEnd = addDays(domainEnd!, padDays);

    return {
        tasks,
        dependencies: buildDependencies(tasks),
        hasGroups: tasks.some((t) => t.group != null && t.group !== ""),
        domainStart,
        domainEnd,
        granularity: chooseGranularity(domainStart, domainEnd),
        errorMessage: null
    };
}
