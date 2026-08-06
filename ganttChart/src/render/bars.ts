"use strict";

import * as d3 from "d3";
import { DisplayRow, TaskRow } from "../data/types";

export interface BarRenderOptions {
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleBand<string>;
    /** Color for track, milestones, and unprogressed solid bars. */
    getBarColor: (task: TaskRow) => string;
    /** Solid progress fill (left overlay). */
    getProgressColor: (task: TaskRow) => string;
    cornerRadius: number;
    flaggedStroke: string;
    trackStroke: string;
    hasSelection: boolean;
    isSelected: (task: TaskRow) => boolean;
    onClick: (event: MouseEvent, task: TaskRow) => void;
    onMouseMove: (event: MouseEvent, task: TaskRow) => void;
    onMouseOut: (event: MouseEvent, task: TaskRow) => void;
}

function diamondPoints(cx: number, cy: number, size: number): string {
    const half = size / 2;
    return `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
}

export function darkenColor(hex: string, k: number = 0.55): string {
    const c = d3.color(hex);
    if (!c) {
        return hex;
    }
    return c.darker(k).formatHex();
}

export function withAlpha(hex: string, alpha: number): string {
    const c = d3.color(hex);
    if (!c) {
        return hex;
    }
    c.opacity = alpha;
    return c.formatRgb();
}

/**
 * D3 data join for task bars, progress overlays, and milestone diamonds.
 * Track = muted full span; progress = solid fill from the left.
 */
export function renderBars(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    tasks: TaskRow[],
    options: BarRenderOptions
): d3.Selection<SVGGElement, TaskRow, SVGGElement, unknown> {
    const {
        xScale,
        yScale,
        getBarColor,
        getProgressColor,
        cornerRadius,
        flaggedStroke,
        trackStroke,
        hasSelection,
        isSelected,
        onClick,
        onMouseMove,
        onMouseOut
    } = options;
    const bandwidth = Math.max(4, yScale.bandwidth());
    const barHeight = Math.max(4, bandwidth * 0.72);
    const barY = (bandwidth - barHeight) / 2;

    const join = container
        .selectAll<SVGGElement, TaskRow>("g.task-row")
        .data(tasks, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "task-row");

    enter.append("rect").attr("class", "task-track");
    enter.append("rect").attr("class", "task-progress");
    enter.append("polygon").attr("class", "task-milestone");

    const merged = enter.merge(join);

    merged
        .attr("transform", (d) => {
            const y = yScale(d.id) ?? 0;
            return `translate(0,${y})`;
        })
        .style("cursor", "pointer")
        .style("opacity", (d) => {
            if (!hasSelection) {
                return "1";
            }
            return isSelected(d) ? "1" : "0.28";
        });

    merged.select<SVGRectElement>("rect.task-track")
        .attr("display", (d) => d.isMilestone ? "none" : null)
        .attr("x", (d) => xScale(d.start))
        .attr("y", barY)
        .attr("rx", cornerRadius)
        .attr("ry", cornerRadius)
        .attr("height", barHeight)
        .attr("width", (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
        .attr("fill", (d) => {
            // No progress field → solid scheduled bar; otherwise muted track.
            if (d.progress == null) {
                return getBarColor(d);
            }
            return withAlpha(getBarColor(d), 0.22);
        })
        .attr("stroke", (d) => {
            if (d.flaggedInvalidRange) {
                return flaggedStroke;
            }
            if (d.progress == null) {
                return "none";
            }
            return withAlpha(getBarColor(d), 0.55);
        })
        .attr("stroke-width", (d) => {
            if (d.flaggedInvalidRange) {
                return 1.5;
            }
            return d.progress == null ? 0 : 1;
        });

    merged.select<SVGRectElement>("rect.task-progress")
        .attr("display", (d) => {
            if (d.isMilestone || d.progress == null || d.progress <= 0) {
                return "none";
            }
            return null;
        })
        .attr("x", (d) => xScale(d.start))
        .attr("y", barY)
        .attr("rx", Math.max(0, cornerRadius - 1))
        .attr("ry", Math.max(0, cornerRadius - 1))
        .attr("height", barHeight)
        .attr("width", (d) => {
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            const p = Math.max(0, Math.min(1, d.progress ?? 0));
            return Math.min(barWidth, barWidth * p);
        })
        .attr("fill", (d) => getProgressColor(d))
        .attr("pointer-events", "none");

    merged.select<SVGPolygonElement>("polygon.task-milestone")
        .attr("display", (d) => d.isMilestone ? null : "none")
        .attr("points", (d) => {
            const cx = xScale(d.start);
            const cy = bandwidth / 2;
            const size = Math.max(11, bandwidth * 0.88);
            return diamondPoints(cx, cy, size);
        })
        .attr("fill", (d) => getBarColor(d))
        .attr("stroke", (d) => d.flaggedInvalidRange ? flaggedStroke : trackStroke)
        .attr("stroke-width", 1.25);

    merged
        .on("click", (event: MouseEvent, d: TaskRow) => {
            event.preventDefault();
            event.stopPropagation();
            onClick(event, d);
        })
        .on("mousemove", (event: MouseEvent, d: TaskRow) => {
            onMouseMove(event, d);
        })
        .on("mouseout", (event: MouseEvent, d: TaskRow) => {
            onMouseOut(event, d);
        });

    return merged;
}

export function renderTodayLine(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    domainStart: Date,
    domainEnd: Date,
    contentHeight: number,
    visible: boolean,
    color: string
): void {
    const today = new Date();
    const inRange = today >= domainStart && today <= domainEnd;

    const join = container
        .selectAll<SVGLineElement, Date>("line.today-line")
        .data(visible && inRange ? [today] : []);

    join.exit().remove();

    join.enter()
        .append("line")
        .attr("class", "today-line")
        .merge(join)
        .attr("x1", (d) => xScale(d))
        .attr("x2", (d) => xScale(d))
        .attr("y1", 0)
        .attr("y2", contentHeight)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,4")
        .attr("pointer-events", "none");
}

export function renderGroupBands(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    displayRows: DisplayRow[],
    yScale: d3.ScaleBand<string>,
    plotWidth: number,
    bandFill: string
): void {
    const groups = displayRows.filter((r) => r.kind === "group");
    const bandwidth = yScale.bandwidth();

    const join = container
        .selectAll<SVGRectElement, DisplayRow>("rect.group-band")
        .data(groups, (d) => d.id);

    join.exit().remove();

    join.enter()
        .append("rect")
        .attr("class", "group-band")
        .merge(join)
        .attr("x", 0)
        .attr("y", (d) => yScale(d.id) ?? 0)
        .attr("width", plotWidth)
        .attr("height", bandwidth)
        .attr("fill", bandFill)
        .attr("pointer-events", "none");
}

/**
 * Subtle zebra striping on task rows for cross-timeline tracking.
 */
export function renderRowBands(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    displayRows: DisplayRow[],
    yScale: d3.ScaleBand<string>,
    plotWidth: number,
    bandFill: string
): void {
    const bandwidth = yScale.bandwidth();
    const striped = displayRows.filter((row, index) => row.kind === "task" && index % 2 === 1);

    const join = container
        .selectAll<SVGRectElement, DisplayRow>("rect.row-band")
        .data(striped, (d) => d.id);

    join.exit().remove();

    join.enter()
        .append("rect")
        .attr("class", "row-band")
        .merge(join)
        .attr("x", 0)
        .attr("y", (d) => yScale(d.id) ?? 0)
        .attr("width", plotWidth)
        .attr("height", bandwidth)
        .attr("fill", bandFill)
        .attr("pointer-events", "none");
}

export function renderLabelRows(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    displayRows: DisplayRow[],
    yScale: d3.ScaleBand<string>,
    labelWidth: number,
    fontSize: number,
    fontFamily: string,
    textColor: string,
    zebraFill: string,
    groupBandFill: string,
    onToggleGroup: (groupKey: string) => void
): void {
    const bandwidth = yScale.bandwidth();
    const rowIndex = new Map(displayRows.map((row, index) => [row.id, index]));

    const join = container
        .selectAll<SVGGElement, DisplayRow>("g.label-row")
        .data(displayRows, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "label-row");

    enter.append("rect").attr("class", "label-bg");
    enter.append("rect").attr("class", "label-hit");
    enter.append("text").attr("class", "label-chevron");
    enter.append("text").attr("class", "label-text");

    const merged = enter.merge(join);

    merged
        .attr("transform", (d) => `translate(0,${yScale(d.id) ?? 0})`)
        .classed("is-group", (d) => d.kind === "group")
        .classed("is-task", (d) => d.kind === "task")
        .style("cursor", (d) => d.kind === "group" ? "pointer" : "default");

    merged.select<SVGRectElement>("rect.label-bg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", labelWidth)
        .attr("height", bandwidth)
        .attr("fill", (d) => {
            if (d.kind === "group") {
                return groupBandFill;
            }
            const index = rowIndex.get(d.id) ?? 0;
            return index % 2 === 1 ? zebraFill : "transparent";
        });

    merged.select<SVGRectElement>("rect.label-hit")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", labelWidth)
        .attr("height", bandwidth)
        .attr("fill", "transparent");

    merged.select<SVGTextElement>("text.label-chevron")
        .attr("display", (d) => d.kind === "group" ? null : "none")
        .attr("x", 10)
        .attr("y", bandwidth / 2)
        .attr("dy", "0.35em")
        .attr("fill", textColor)
        .style("font-size", `${Math.max(10, fontSize - 1)}px`)
        .style("font-family", fontFamily)
        .text((d) => d.collapsed ? "▸" : "▾");

    merged.select<SVGTextElement>("text.label-text")
        .attr("x", (d) => d.kind === "group" ? 24 : labelWidth - 10)
        .attr("y", bandwidth / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d) => d.kind === "group" ? "start" : "end")
        .attr("fill", textColor)
        .style("font-size", `${fontSize}px`)
        .style("font-family", fontFamily)
        .style("font-weight", (d) => d.kind === "group" ? "600" : "400")
        .text((d) => {
            if (d.kind === "group") {
                return `${d.label} (${d.taskCount ?? 0})`;
            }
            return d.label;
        });

    merged.on("click", (event: MouseEvent, d: DisplayRow) => {
        if (d.kind !== "group") {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        onToggleGroup(d.groupKey);
    });
}
