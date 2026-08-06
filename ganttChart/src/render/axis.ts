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
    paddingInner: number = 0.3
): d3.ScaleBand<string> {
    return d3.scaleBand<string>()
        .domain(taskIds)
        .range([rangeStart, rangeEnd])
        .paddingInner(paddingInner)
        .paddingOuter(0.15);
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

/**
 * Render a bottom axis with tick density capped by available pixel width.
 */
export function renderBottomAxis(
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    granularity: AxisGranularity,
    color: string,
    chartWidth: number
): void {
    const maxTicks = Math.max(2, Math.floor(chartWidth / 90));
    const interval = tickInterval(granularity);
    const domain = xScale.domain();
    let ticks = interval.range(domain[0], d3.timeDay.offset(domain[1], 1));

    if (ticks.length > maxTicks) {
        const step = Math.ceil(ticks.length / maxTicks);
        ticks = ticks.filter((_, i) => i % step === 0);
    }

    const axis = d3.axisBottom(xScale)
        .tickValues(ticks)
        .tickSizeOuter(0)
        .tickPadding(8)
        .tickFormat((domainValue) => tickFormat(granularity)(domainValue as Date));

    selection.call(axis);
    selection.selectAll("text")
        .attr("fill", color)
        .style("font-size", "11px");
    selection.selectAll("path, line")
        .attr("stroke", color)
        .attr("stroke-opacity", 0.55);
}

interface WeekendBand {
    start: Date;
    end: Date;
}

/**
 * Light vertical bands for Saturday and Sunday.
 */
export function renderWeekendShading(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    domainStart: Date,
    domainEnd: Date,
    height: number,
    visible: boolean,
    fill: string
): void {
    const bands: WeekendBand[] = [];

    if (visible) {
        let day = d3.timeDay.floor(domainStart);
        const end = d3.timeDay.offset(d3.timeDay.floor(domainEnd), 1);
        while (day < end) {
            const weekday = day.getDay(); // 0 = Sun, 6 = Sat
            if (weekday === 0 || weekday === 6) {
                bands.push({
                    start: day,
                    end: d3.timeDay.offset(day, 1)
                });
            }
            day = d3.timeDay.offset(day, 1);
        }
    }

    const join = container
        .selectAll<SVGRectElement, WeekendBand>("rect.weekend-band")
        .data(bands, (d) => `${d.start.getTime()}`);

    join.exit().remove();

    join.enter()
        .append("rect")
        .attr("class", "weekend-band")
        .merge(join)
        .attr("x", (d) => xScale(d.start))
        .attr("y", 0)
        .attr("width", (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
        .attr("height", height)
        .attr("fill", fill)
        .attr("pointer-events", "none");
}
