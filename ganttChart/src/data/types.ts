"use strict";

import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

export const ROLE_TASK = "task";
export const ROLE_START = "startDate";
export const ROLE_END = "endDate";
export const ROLE_DURATION = "duration";
export const ROLE_PROGRESS = "progress";
export const ROLE_GROUP = "group";
export const ROLE_RESOURCE = "resource";
export const ROLE_PREDECESSOR = "predecessor";
export const ROLE_TOOLTIPS = "tooltipFields";

export const UNGROUPED_KEY = "__ungrouped__";

export type TaskStatus = "done" | "late" | "atrisk" | "ontrack" | "future";
export type TimeWindowMonths = 3 | 6 | 9 | 12 | null;

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
    resource: string | null;
    predecessor: string | null;
    status: TaskStatus;
    isMilestone: boolean;
    flaggedInvalidRange: boolean;
    tooltipFields: TooltipField[];
    selectionId: ISelectionId | null;
}

export interface DependencyLink {
    id: string;
    fromTaskId: string;
    toTaskId: string;
}

export type DisplayRowKind = "group" | "task";

export interface DisplayRow {
    id: string;
    kind: DisplayRowKind;
    label: string;
    groupKey: string;
    task?: TaskRow;
    collapsed?: boolean;
    taskCount?: number;
}

export type AxisGranularity = "day" | "week" | "month" | "quarter";
export type AxisGranularityOption = "auto" | AxisGranularity;
export type AxisLabelFormat = "date" | "week" | "both";

export interface ViewModel {
    tasks: TaskRow[];
    dependencies: DependencyLink[];
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
    resource: number | null;
    predecessor: number | null;
    tooltips: number[];
}

export const STATUS_COLORS: Record<TaskStatus, { bar: string; progress: string; label: string }> = {
    done: { bar: "#0F3D36", progress: "#2DD4BF", label: "Done" },
    late: { bar: "#9F1239", progress: "#FB7185", label: "Late" },
    atrisk: { bar: "#92400E", progress: "#FBBF24", label: "At risk" },
    ontrack: { bar: "#0E7490", progress: "#22D3EE", label: "On track" },
    future: { bar: "#334155", progress: "#94A3B8", label: "Future" }
};
