"use strict";

import * as d3 from "d3";
import { AxisGranularity } from "../data/types";

export function createTimeScale(
    domainStart: Date,
    domainEnd: Date,
    rangeStart: number,
    rangeEnd: number
): d3.ScaleTime<number, number> {
    return d3.scaleTime()
        .domain([domainStart, domainEnd])
        .range([rangeStart, rangeEnd]);
}

export function createBandScale(
    taskIds: string[],
    rangeStart: number,
    rangeEnd: number,
    paddingInner: number = 0.25
): d3.ScaleBand<string> {
    return d3.scaleBand<string>()
        .domain(taskIds)
        .range([rangeStart, rangeEnd])
        .paddingInner(paddingInner)
        .paddingOuter(0.1);
}

function tickInterval(granularity: AxisGranularity): d3.TimeInterval {
    switch (granularity) {
        case "day":
            return d3.timeDay.every(1)!;
        case "week":
            return d3.timeWeek.every(1)!;
        case "quarter":
            return d3.timeMonth.every(3)!;
        case "month":
        default:
            return d3.timeMonth.every(1)!;
    }
}

function tickFormat(granularity: AxisGranularity): (date: Date) => string {
    switch (granularity) {
        case "day":
            return d3.timeFormat("%b %d");
        case "week":
            return d3.timeFormat("%b %d");
        case "quarter":
            return (d: Date) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d3.timeFormat("%Y")(d)}`;
        case "month":
        default:
            return d3.timeFormat("%b %Y");
    }
}

export function renderBottomAxis(
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    granularity: AxisGranularity,
    color: string
): void {
    const axis = d3.axisBottom(xScale)
        .ticks(tickInterval(granularity))
        .tickFormat((domainValue) => tickFormat(granularity)(domainValue as Date));

    selection.call(axis);
    selection.selectAll("text").attr("fill", color);
    selection.selectAll("path, line").attr("stroke", color);
}
