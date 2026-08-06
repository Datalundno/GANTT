"use strict";

export interface ChartLayout {
    width: number;
    height: number;
    labelWidth: number;
    chartWidth: number;
    /** Height of the scrollable task viewport (excludes pinned axis). */
    viewportBodyHeight: number;
    /** Total SVG content height for all rows (may exceed viewport). */
    contentHeight: number;
    plotLeft: number;
    plotTop: number;
    axisHeight: number;
    rowHeight: number;
    needsScroll: boolean;
}

export const AXIS_HEIGHT = 28;
export const TOP_PADDING = 4;
export const RIGHT_PADDING = 12;
export const DEFAULT_ROW_HEIGHT = 28;
export const DEFAULT_LABEL_WIDTH = 160;

export function computeLayout(
    viewportWidth: number,
    viewportHeight: number,
    taskCount: number,
    labelWidth: number = DEFAULT_LABEL_WIDTH,
    rowHeight: number = DEFAULT_ROW_HEIGHT
): ChartLayout {
    const width = Math.max(1, viewportWidth);
    const height = Math.max(1, viewportHeight);
    const clampedLabel = Math.max(60, Math.min(labelWidth, Math.floor(width * 0.45)));
    const safeRowHeight = Math.max(14, rowHeight);
    const axisHeight = AXIS_HEIGHT;
    const plotTop = TOP_PADDING;
    const viewportBodyHeight = Math.max(1, height - axisHeight);
    const contentHeight = Math.max(viewportBodyHeight, plotTop + taskCount * safeRowHeight);
    const chartWidth = Math.max(1, width - clampedLabel - RIGHT_PADDING);

    return {
        width,
        height,
        labelWidth: clampedLabel,
        chartWidth,
        viewportBodyHeight,
        contentHeight,
        plotLeft: clampedLabel,
        plotTop,
        axisHeight,
        rowHeight: safeRowHeight,
        needsScroll: contentHeight > viewportBodyHeight + 1
    };
}
