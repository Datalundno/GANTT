"use strict";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

import {
    ROLE_DURATION,
    ROLE_END,
    ROLE_GROUP,
    ROLE_PROGRESS,
    ROLE_RESOURCE,
    ROLE_START,
    ROLE_TASK,
    ROLE_TOOLTIPS,
    RoleColumnIndex,
    TaskRow,
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
        domainStart: null,
        domainEnd: null,
        granularity: "month",
        errorMessage
    };
}

/**
 * Map column indexes by inspecting metadata column roles — never by field-well order.
 */
export function resolveRoleIndexes(columns: DataViewMetadataColumn[] | undefined): RoleColumnIndex {
    const indexes: RoleColumnIndex = {
        task: null,
        startDate: null,
        endDate: null,
        duration: null,
        progress: null,
        group: null,
        resource: null,
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

export function convertDataView(dataView: DataView | undefined): ViewModel {
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

    const rows = dataView.table.rows ?? [];
    if (rows.length === 0) {
        return emptyViewModel("No rows to display.");
    }

    const tasks: TaskRow[] = [];
    let domainStart: Date | null = null;
    let domainEnd: Date | null = null;

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

        const task: TaskRow = {
            id: `${taskName}::${rowIndex}`,
            task: taskName,
            start,
            end,
            durationDays,
            progress,
            group: asText(cellValue(row, roles.group)),
            resource: asText(cellValue(row, roles.resource)),
            isMilestone,
            flaggedInvalidRange,
            tooltipFields: buildTooltipFields(row, columns, roles.tooltips)
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

    // Pad domain slightly so bars are not flush against edges
    const padDays = Math.max(1, Math.ceil(dayDiff(domainStart!, domainEnd!) * 0.02));
    domainStart = addDays(domainStart!, -padDays);
    domainEnd = addDays(domainEnd!, padDays);

    return {
        tasks,
        domainStart,
        domainEnd,
        granularity: chooseGranularity(domainStart, domainEnd),
        errorMessage: null
    };
}
