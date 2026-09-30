"use strict";

import * as d3 from "d3";
import { AxisGranularity, AxisLabelFormat } from "../data/types";

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

function tickInterval(granularity: AxisGranularity, labelFormat: AxisLabelFormat): d3.TimeInterval {
    switch (granularity) {
        case "day":
            // Align to ISO weeks when labels are week-oriented.
            if (labelFormat === "week" || labelFormat === "both") {
                return d3.timeMonday.every(1)!;
            }
            return d3.timeDay.every(1)!;
        case "week":
            return d3.timeMonday.every(1)!;
        case "quarter":
            return d3.timeMonth.every(3)!;
        case "month":
        default:
            return d3.timeMonth.every(1)!;
    }
}

function dateTickLabel(granularity: AxisGranularity, date: Date): string {
    switch (granularity) {
        case "day":
            return d3.timeFormat("%b %d")(date);
        case "week":
            return d3.timeFormat("%b %d")(date);
        case "quarter":
            return `Q${Math.floor(date.getMonth() / 3) + 1} ${d3.timeFormat("%Y")(date)}`;
        case "month":
        default:
            return d3.timeFormat("%b %Y")(date);
    }
}

/** ISO week number (01–53) and ISO week-year. */
function isoWeekParts(date: Date): { week: string; year: string } {
    return {
        week: d3.timeFormat("%V")(date),
        year: d3.timeFormat("%G")(date)
    };
}

export function formatAxisTick(
    date: Date,
    granularity: AxisGranularity,
    labelFormat: AxisLabelFormat
): string {
    const dateLabel = dateTickLabel(granularity, date);
    const { week, year } = isoWeekParts(date);

    switch (labelFormat) {
        case "week":
            // Include year on coarser ticks / year boundaries for clarity.
            if (granularity === "month" || granularity === "quarter") {
                return `${year}-W${week}`;
            }
            return `W${week}`;
        case "both":
            return `W${week} · ${dateLabel}`;
        case "date":
        default:
            return dateLabel;
    }
}

/**
 * Render a bottom axis with tick density capped by available pixel width.
 */
export function renderBottomAxis(
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    granularity: AxisGranularity,
    labelFormat: AxisLabelFormat,
    color: string,
    chartWidth: number
): void {
    const labelBudget = labelFormat === "both" ? 110 : 90;
    const maxTicks = Math.max(2, Math.floor(chartWidth / labelBudget));
    const interval = tickInterval(granularity, labelFormat);
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
        .tickFormat((domainValue) => formatAxisTick(domainValue as Date, granularity, labelFormat));

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

/** Taller header: year band over quarter labels. Used when the visible scale is quarters. */
export const YEAR_QUARTER_AXIS_HEIGHT = 52;

interface SpanLabel {
    key: string;
    x: number;
    text: string;
}

export interface TimeGridLine {
    key: string;
    x: number;
    strong: boolean;
}

function quarterStart(date: Date): Date {
    const month = Math.floor(date.getMonth() / 3) * 3;
    return new Date(date.getFullYear(), month, 1);
}

/**
 * Year band with quarter labels underneath. Matches a multi-year frame:
 * the year is centered over its span, and each quarter is labeled Q1–Q4.
 */
export function renderYearQuarterAxis(
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    domainStart: Date,
    domainEnd: Date,
    color: string,
    chartWidth: number
): void {
    const yearBandHeight = 24;
    const root = selection.selectAll<SVGGElement, number>("g.year-quarter").data([1]);
    const group = root.enter()
        .append("g")
        .attr("class", "year-quarter")
        .merge(root);

    const yearLabels: SpanLabel[] = [];
    let year = d3.timeYear.floor(domainStart);
    while (year < domainEnd) {
        const yearEnd = d3.timeYear.offset(year, 1);
        const left = year < domainStart ? domainStart : year;
        const right = yearEnd > domainEnd ? domainEnd : yearEnd;
        const x0 = xScale(left);
        const x1 = xScale(right);
        if (x1 - x0 >= 36) {
            yearLabels.push({
                key: `y-${year.getFullYear()}`,
                x: (x0 + x1) / 2,
                text: String(year.getFullYear())
            });
        }
        year = yearEnd;
    }

    const quarterLabels: SpanLabel[] = [];
    const headerTicks: TimeGridLine[] = [];
    let quarter = quarterStart(domainStart);
    while (quarter < domainEnd) {
        const quarterEnd = d3.timeMonth.offset(quarter, 3);
        const left = quarter < domainStart ? domainStart : quarter;
        const right = quarterEnd > domainEnd ? domainEnd : quarterEnd;
        const x0 = xScale(left);
        const x1 = xScale(right);
        const quarterNumber = Math.floor(quarter.getMonth() / 3) + 1;
        if (x1 - x0 >= 22) {
            quarterLabels.push({
                key: `q-${quarter.getFullYear()}-${quarterNumber}`,
                x: (x0 + x1) / 2,
                text: `Q${quarterNumber}`
            });
        }
        if (quarter > domainStart && quarter < domainEnd) {
            headerTicks.push({
                key: String(quarter.getTime()),
                x: xScale(quarter),
                strong: quarter.getMonth() === 0
            });
        }
        quarter = quarterEnd;
    }

    const quarterBudget = 36;
    let visibleQuarters = quarterLabels;
    if (quarterLabels.length * quarterBudget > chartWidth && quarterLabels.length > 1) {
        const step = Math.ceil((quarterLabels.length * quarterBudget) / Math.max(1, chartWidth));
        visibleQuarters = quarterLabels.filter((_, index) => index % step === 0);
    }

    group.selectAll<SVGLineElement, number>("line.year-band-rule")
        .data([1])
        .join("line")
        .attr("class", "year-band-rule")
        .attr("x1", 0)
        .attr("x2", Math.max(0, chartWidth))
        .attr("y1", yearBandHeight)
        .attr("y2", yearBandHeight)
        .attr("stroke", color)
        .attr("stroke-opacity", 0.35)
        .attr("pointer-events", "none");

    const tickJoin = group.selectAll<SVGLineElement, TimeGridLine>("line.quarter-tick")
        .data(headerTicks, (d) => d.key);
    tickJoin.exit().remove();
    tickJoin.enter()
        .append("line")
        .attr("class", "quarter-tick")
        .merge(tickJoin)
        .attr("x1", (d) => d.x)
        .attr("x2", (d) => d.x)
        .attr("y1", (d) => d.strong ? 0 : yearBandHeight)
        .attr("y2", YEAR_QUARTER_AXIS_HEIGHT)
        .attr("stroke", color)
        .attr("stroke-opacity", (d) => d.strong ? 0.45 : 0.28)
        .attr("pointer-events", "none");

    const yearJoin = group.selectAll<SVGTextElement, SpanLabel>("text.year-label")
        .data(yearLabels, (d) => d.key);
    yearJoin.exit().remove();
    yearJoin.enter()
        .append("text")
        .attr("class", "year-label")
        .merge(yearJoin)
        .attr("x", (d) => d.x)
        .attr("y", 16)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .style("font-size", "13px")
        .style("font-weight", "600")
        .text((d) => d.text);

    const quarterJoin = group.selectAll<SVGTextElement, SpanLabel>("text.quarter-label")
        .data(visibleQuarters, (d) => d.key);
    quarterJoin.exit().remove();
    quarterJoin.enter()
        .append("text")
        .attr("class", "quarter-label")
        .merge(quarterJoin)
        .attr("x", (d) => d.x)
        .attr("y", 42)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("fill-opacity", 0.82)
        .style("font-size", "11px")
        .text((d) => d.text);
}

/** Vertical lines at quarter boundaries. Year starts are slightly stronger. */
export function quarterGridLines(
    xScale: d3.ScaleTime<number, number>,
    domainStart: Date,
    domainEnd: Date
): TimeGridLine[] {
    const lines: TimeGridLine[] = [];
    let quarter = quarterStart(domainStart);
    if (quarter <= domainStart) {
        quarter = d3.timeMonth.offset(quarter, 3);
    }
    while (quarter < domainEnd) {
        lines.push({
            key: String(quarter.getTime()),
            x: xScale(quarter),
            strong: quarter.getMonth() === 0
        });
        quarter = d3.timeMonth.offset(quarter, 3);
    }
    return lines;
}

export function renderQuarterGrid(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    lines: TimeGridLine[],
    height: number,
    color: string
): void {
    const join = container
        .selectAll<SVGLineElement, TimeGridLine>("line.time-grid")
        .data(lines, (d) => d.key);

    join.exit().remove();

    join.enter()
        .append("line")
        .attr("class", "time-grid")
        .merge(join)
        .attr("x1", (d) => d.x)
        .attr("x2", (d) => d.x)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", color)
        .attr("stroke-opacity", (d) => d.strong ? 0.28 : 0.12)
        .attr("stroke-width", (d) => d.strong ? 1.25 : 1)
        .attr("pointer-events", "none");
}
