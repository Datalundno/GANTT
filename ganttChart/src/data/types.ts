"use strict";

export const ROLE_TASK = "task";
export const ROLE_START = "startDate";
export const ROLE_END = "endDate";
export const ROLE_DURATION = "duration";
export const ROLE_PROGRESS = "progress";
export const ROLE_GROUP = "group";
export const ROLE_RESOURCE = "resource";
export const ROLE_TOOLTIPS = "tooltips";

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
    isMilestone: boolean;
    flaggedInvalidRange: boolean;
    tooltipFields: TooltipField[];
}

export type AxisGranularity = "day" | "week" | "month" | "quarter";

export interface ViewModel {
    tasks: TaskRow[];
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
    tooltips: number[];
}
