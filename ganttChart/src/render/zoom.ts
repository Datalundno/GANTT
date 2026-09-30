"use strict";

import { AxisGranularity, AxisGranularityOption } from "../data/types";
import { chooseGranularity } from "../utils/dates";

export type ZoomLevel = "detail" | "year" | "threeYears" | "fit";

/** Mean year length so a 3-year frame does not depend on which leap day is in view. */
export const DAYS_PER_YEAR = 365.25;

/**
 * The chart domain is padded a few days past the tasks. Allow that pad (and a leap day)
 * so a project that is already one span does not grow a scrollbar.
 */
const SPAN_SLACK_DAYS = 8;

const GRANULARITY_RANK: Record<AxisGranularity, number> = {
    day: 0,
    week: 1,
    month: 2,
    quarter: 3
};

export function parseZoom(value: unknown): ZoomLevel {
    if (value === "detail" || value === "year" || value === "threeYears" || value === "fit") {
        return value;
    }
    return "detail";
}

/** Days the plot viewport should show, or null when the level is not a fixed span. */
export function zoomSpanDays(zoom: ZoomLevel): number | null {
    if (zoom === "year") {
        return DAYS_PER_YEAR;
    }
    if (zoom === "threeYears") {
        return DAYS_PER_YEAR * 3;
    }
    return null;
}

/**
 * Scrollable plot width for a zoom level.
 * Detail keeps at least `minPixelsPerDay`.
 * Fit, and a span whose data is shorter than that span, uses the viewport so nothing scrolls
 * and the domain is not padded out to empty years.
 * A longer range at 1 year or 3 years scrolls, with one span visible in the viewport.
 */
export function contentWidthForZoom(
    dataDays: number,
    plotViewportWidth: number,
    zoom: ZoomLevel,
    minPixelsPerDay: number,
    rightPadding: number
): number {
    const viewport = Math.max(1, plotViewportWidth);
    const days = Math.max(1, dataDays);
    if (zoom === "detail") {
        return Math.max(viewport, Math.ceil(days * minPixelsPerDay) + rightPadding);
    }
    const span = zoomSpanDays(zoom);
    if (zoom === "fit" || span == null || days <= span + SPAN_SLACK_DAYS) {
        return viewport;
    }
    const plotWidth = viewport * (days / span);
    return Math.ceil(plotWidth) + rightPadding;
}

/** Days actually visible in the plot viewport. Drives axis granularity. */
export function visibleSpanDays(
    dataDays: number,
    plotViewportWidth: number,
    zoom: ZoomLevel,
    minPixelsPerDay: number
): number {
    const viewport = Math.max(1, plotViewportWidth);
    const days = Math.max(1, dataDays);
    if (zoom === "detail") {
        return Math.min(days, viewport / Math.max(1, minPixelsPerDay));
    }
    if (zoom === "fit") {
        return days;
    }
    const span = zoomSpanDays(zoom) ?? days;
    return Math.min(days, span);
}

/**
 * Granularity for the visible scale. An explicit setting finer than that scale
 * is raised so a zoomed-out frame does not draw a tick per day.
 */
export function granularityForVisibleSpan(
    visibleDays: number,
    explicit: AxisGranularityOption | undefined
): AxisGranularity {
    const start = new Date(2020, 0, 1);
    const end = new Date(start.getTime() + Math.max(1, visibleDays) * 24 * 60 * 60 * 1000);
    const auto = chooseGranularity(start, end);
    if (!explicit || explicit === "auto") {
        return auto;
    }
    if (GRANULARITY_RANK[explicit] < GRANULARITY_RANK[auto]) {
        return auto;
    }
    return explicit;
}
