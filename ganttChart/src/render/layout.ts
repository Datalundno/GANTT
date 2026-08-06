"use strict";

export interface LayoutConfig {
    width: number;
    height: number;
    labelWidth: number;
    axisHeight: number;
    topPadding: number;
    rightPadding: number;
    rowPaddingInner: number;
}

export interface ChartLayout {
    width: number;
    height: number;
    labelWidth: number;
    chartWidth: number;
    chartHeight: number;
    plotLeft: number;
    plotTop: number;
    axisY: number;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
    width: 800,
    height: 400,
    labelWidth: 160,
    axisHeight: 28,
    topPadding: 8,
    rightPadding: 12,
    rowPaddingInner: 0.25
};

export function computeLayout(
    viewportWidth: number,
    viewportHeight: number,
    labelWidth: number = DEFAULT_LAYOUT.labelWidth
): ChartLayout {
    const width = Math.max(1, viewportWidth);
    const height = Math.max(1, viewportHeight);
    const clampedLabel = Math.max(60, Math.min(labelWidth, Math.floor(width * 0.45)));
    const plotTop = DEFAULT_LAYOUT.topPadding;
    const chartHeight = Math.max(1, height - plotTop - DEFAULT_LAYOUT.axisHeight);
    const chartWidth = Math.max(1, width - clampedLabel - DEFAULT_LAYOUT.rightPadding);

    return {
        width,
        height,
        labelWidth: clampedLabel,
        chartWidth,
        chartHeight,
        plotLeft: clampedLabel,
        plotTop,
        axisY: plotTop + chartHeight
    };
}
