"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

export const ROLE_TASK = "task";
export const ROLE_START = "startDate";
export const ROLE_END = "endDate";
export const ROLE_DURATION = "duration";
export const ROLE_PROGRESS = "progress";
export const ROLE_GROUP = "group";
export const ROLE_LINE = "line";
export const ROLE_RESOURCE = "resource";
export const ROLE_TOOLTIPS = "tooltipFields";

export const UNGROUPED_KEY = "__ungrouped__";

export interface TooltipField {
    displayName: string;
    value: string | number | Date | null;
}

export interface TaskRow {
    id: string;
    task: string;
    start: Date;
    end: Date;
    durationDays: number;
    progress: number | null;
    group: string | null;
    /** Phases that share a Line value draw on one row. Null when the role is unbound or blank. */
    line: string | null;
    /** Sub-lane inside a line row. 0 when the bar does not share its row. */
    lane: number;
    resource: string | null;
    isMilestone: boolean;
    flaggedInvalidRange: boolean;
    tooltipFields: TooltipField[];
    selectionId: ISelectionId | null;
}

export type DisplayRowKind = "group" | "task";

export interface DisplayRow {
    id: string;
    kind: DisplayRowKind;
    label: string;
    groupKey: string;
    /** Set for a one-bar row. Line rows use `tasks` instead. */
    task?: TaskRow;
    /** Bars drawn on this row. One entry for a task row; one per phase on a line. */
    tasks?: TaskRow[];
    /** Sub-lanes used by overlapping bars. Group headers are 1. */
    laneCount: number;
    /** Band-scale slots. One per lane so a line row grows when bars stack. */
    slotIds: string[];
    collapsed?: boolean;
    taskCount?: number;
}

export type AxisGranularity = "day" | "week" | "month" | "quarter";
export type AxisGranularityOption = "auto" | AxisGranularity;
export type AxisLabelFormat = "date" | "week" | "both";

export interface ViewModel {
    tasks: TaskRow[];
    hasGroups: boolean;
    domainStart: Date | null;
    domainEnd: Date | null;
    granularity: AxisGranularity;
    errorMessage: string | null;
}

export interface RoleColumnIndex {
    task: number | null;
    startDate: number | null;
    endDate: number | null;
    duration: number | null;
    progress: number | null;
    group: number | null;
    line: number | null;
    resource: number | null;
    tooltips: number[];
}
