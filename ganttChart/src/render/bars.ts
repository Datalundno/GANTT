"use strict";

import * as d3 from "d3";
import { TaskRow } from "../data/types";

export interface BarRenderOptions {
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleBand<string>;
    barFill: string;
    cornerRadius: number;
    flaggedStroke: string;
}

function diamondPoints(cx: number, cy: number, size: number): string {
    const half = size / 2;
    return `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
}

/**
 * D3 data join for task bars and milestone diamonds.
 */
export function renderBars(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    tasks: TaskRow[],
    options: BarRenderOptions
): d3.Selection<SVGGElement, TaskRow, SVGGElement, unknown> {
    const { xScale, yScale, barFill, cornerRadius, flaggedStroke } = options;
    const bandwidth = yScale.bandwidth();

    const join = container
        .selectAll<SVGGElement, TaskRow>("g.task-row")
        .data(tasks, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "task-row");

    enter.append("rect").attr("class", "task-bar");
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
        .attr("fill", barFill)
        .attr("stroke", (d) => d.flaggedInvalidRange ? flaggedStroke : "none")
        .attr("stroke-width", (d) => d.flaggedInvalidRange ? 1.5 : 0);

    merged.select<SVGPolygonElement>("polygon.task-milestone")
        .attr("display", (d) => d.isMilestone ? null : "none")
        .attr("points", (d) => {
            const cx = xScale(d.start);
            const cy = bandwidth / 2;
            const size = Math.max(8, bandwidth * 0.7);
            return diamondPoints(cx, cy, size);
        })
        .attr("fill", barFill)
        .attr("stroke", (d) => d.flaggedInvalidRange ? flaggedStroke : "none")
        .attr("stroke-width", (d) => d.flaggedInvalidRange ? 1.5 : 0);

    return merged;
}

export function renderTaskLabels(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    tasks: TaskRow[],
    yScale: d3.ScaleBand<string>,
    labelWidth: number,
    fontSize: number,
    fontFamily: string,
    color: string
): void {
    const bandwidth = yScale.bandwidth();

    const join = container
        .selectAll<SVGTextElement, TaskRow>("text.task-label")
        .data(tasks, (d) => d.id);

    join.exit().remove();

    join.enter()
        .append("text")
        .attr("class", "task-label")
        .merge(join)
        .attr("x", labelWidth - 8)
        .attr("y", (d) => (yScale(d.id) ?? 0) + bandwidth / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", color)
        .style("font-size", `${fontSize}px`)
        .style("font-family", fontFamily)
        .text((d) => d.task);
}
