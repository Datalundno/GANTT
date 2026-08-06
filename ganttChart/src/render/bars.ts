"use strict";

import * as d3 from "d3";
import { DisplayRow, TaskRow } from "../data/types";

export interface BarRenderOptions {
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleBand<string>;
    getBarFill: (task: TaskRow) => string;
    getProgressFill: (task: TaskRow) => string;
    cornerRadius: number;
    flaggedStroke: string;
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

/**
 * D3 data join for task bars, progress overlays, and milestone diamonds.
 */
export function renderBars(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    tasks: TaskRow[],
    options: BarRenderOptions
): d3.Selection<SVGGElement, TaskRow, SVGGElement, unknown> {
    const { xScale, yScale, getBarFill, getProgressFill, cornerRadius, flaggedStroke } = options;
    const bandwidth = yScale.bandwidth();

    const join = container
        .selectAll<SVGGElement, TaskRow>("g.task-row")
        .data(tasks, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "task-row");

    enter.append("rect").attr("class", "task-bar");
    enter.append("rect").attr("class", "task-progress");
    enter.append("polygon").attr("class", "task-milestone");

    const merged = enter.merge(join);

    merged.attr("transform", (d) => {
        const y = yScale(d.id) ?? 0;
        return `translate(0,${y})`;
    });

    merged.select<SVGRectElement>("rect.task-bar")
        .attr("display", (d) => d.isMilestone ? "none" : null)
        .attr("x", (d) => xScale(d.start))
        .attr("y", 0)
        .attr("rx", cornerRadius)
        .attr("ry", cornerRadius)
        .attr("height", bandwidth)
        .attr("width", (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
        .attr("fill", (d) => getBarFill(d))
        .attr("stroke", (d) => d.flaggedInvalidRange ? flaggedStroke : "none")
        .attr("stroke-width", (d) => d.flaggedInvalidRange ? 1.5 : 0);

    merged.select<SVGRectElement>("rect.task-progress")
        .attr("display", (d) => {
            if (d.isMilestone || d.progress == null || d.progress <= 0) {
                return "none";
            }
            return null;
        })
        .attr("x", (d) => xScale(d.start))
        .attr("y", 0)
        .attr("rx", Math.max(0, cornerRadius - 1))
        .attr("ry", Math.max(0, cornerRadius - 1))
        .attr("height", bandwidth)
        .attr("width", (d) => {
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            const p = Math.max(0, Math.min(1, d.progress ?? 0));
            return Math.min(barWidth, barWidth * p);
        })
        .attr("fill", (d) => getProgressFill(d))
        .attr("pointer-events", "none");

    merged.select<SVGPolygonElement>("polygon.task-milestone")
        .attr("display", (d) => d.isMilestone ? null : "none")
        .attr("points", (d) => {
            const cx = xScale(d.start);
            const cy = bandwidth / 2;
            const size = Math.max(8, bandwidth * 0.7);
            return diamondPoints(cx, cy, size);
        })
        .attr("fill", (d) => getBarFill(d))
        .attr("stroke", (d) => d.flaggedInvalidRange ? flaggedStroke : "none")
        .attr("stroke-width", (d) => d.flaggedInvalidRange ? 1.5 : 0);

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
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3")
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

export function renderLabelRows(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    displayRows: DisplayRow[],
    yScale: d3.ScaleBand<string>,
    labelWidth: number,
    fontSize: number,
    fontFamily: string,
    textColor: string,
    onToggleGroup: (groupKey: string) => void
): void {
    const bandwidth = yScale.bandwidth();

    const join = container
        .selectAll<SVGGElement, DisplayRow>("g.label-row")
        .data(displayRows, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "label-row");

    enter.append("rect").attr("class", "label-hit");
    enter.append("text").attr("class", "label-chevron");
    enter.append("text").attr("class", "label-text");

    const merged = enter.merge(join);

    merged
        .attr("transform", (d) => `translate(0,${yScale(d.id) ?? 0})`)
        .classed("is-group", (d) => d.kind === "group")
        .classed("is-task", (d) => d.kind === "task")
        .style("cursor", (d) => d.kind === "group" ? "pointer" : "default");

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
