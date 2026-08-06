"use strict";

import * as d3 from "d3";
import { DisplayRow, TaskRow } from "../data/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface BarRenderOptions {
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleBand<string>;
    getBarColor: (task: TaskRow) => string;
    getProgressColor: (task: TaskRow) => string;
    cornerRadius: number;
    flaggedStroke: string;
    trackStroke: string;
    hasSelection: boolean;
    isSelected: (task: TaskRow) => boolean;
    fancy: boolean;
    animate: boolean;
    /** When false, ignore progress and draw solid schedule bars. */
    showProgress: boolean;
    /** When true and baseline dates exist, draw planned bars under actual. */
    showBaseline: boolean;
    baselineFill: string;
    onClick: (event: MouseEvent, task: TaskRow) => void;
    onContextMenu: (event: MouseEvent, task: TaskRow) => void;
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

export function lightenColor(hex: string, k: number = 0.6): string {
    const c = d3.color(hex);
    if (!c) {
        return hex;
    }
    return c.brighter(k).formatHex();
}

export function withAlpha(hex: string, alpha: number): string {
    const c = d3.color(hex);
    if (!c) {
        return hex;
    }
    c.opacity = alpha;
    return c.formatRgb();
}

function ensureFancyDefs(svg: SVGSVGElement | null): void {
    if (!svg) {
        return;
    }
    const root = d3.select(svg);
    let defs = root.select<SVGDefsElement>("defs.gantt-defs");
    if (defs.empty()) {
        defs = root.insert("defs", ":first-child").attr("class", "gantt-defs");
    }

    if (defs.select("#gantt-bar-shadow").empty()) {
        const filter = defs.append("filter")
            .attr("id", "gantt-bar-shadow")
            .attr("x", "-20%")
            .attr("y", "-40%")
            .attr("width", "140%")
            .attr("height", "200%");
        filter.append("feDropShadow")
            .attr("dx", 0)
            .attr("dy", 1.5)
            .attr("stdDeviation", 1.6)
            .attr("flood-color", "#0F172A")
            .attr("flood-opacity", 0.28);
    }

    if (defs.select("#gantt-sheen").empty()) {
        const sheen = defs.append("linearGradient")
            .attr("id", "gantt-sheen")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");
        sheen.append("stop").attr("offset", "0%").attr("stop-color", "#fff").attr("stop-opacity", 0.35);
        sheen.append("stop").attr("offset", "55%").attr("stop-color", "#fff").attr("stop-opacity", 0.05);
        sheen.append("stop").attr("offset", "100%").attr("stop-color", "#fff").attr("stop-opacity", 0);
    }

    if (defs.select("#gantt-late-hatch").empty()) {
        const pattern = defs.append("pattern")
            .attr("id", "gantt-late-hatch")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 6)
            .attr("height", 6)
            .attr("patternTransform", "rotate(35)");
        pattern.append("rect").attr("width", 6).attr("height", 6).attr("fill", "transparent");
        pattern.append("line")
            .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6)
            .attr("stroke", "#9F1239")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.45);
    }
}

function barGradientId(taskId: string, kind: "bar" | "progress"): string {
    const safe = taskId.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `gantt-grad-${kind}-${safe}`;
}

function upsertGradient(
    svg: SVGSVGElement | null,
    id: string,
    from: string,
    to: string
): string {
    if (!svg) {
        return from;
    }
    const defs = d3.select(svg).select<SVGDefsElement>("defs.gantt-defs");
    let grad = defs.select<SVGLinearGradientElement>(`#${id}`);
    if (grad.empty()) {
        grad = defs.append("linearGradient")
            .attr("id", id)
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        grad.append("stop").attr("class", "from").attr("offset", "0%");
        grad.append("stop").attr("class", "to").attr("offset", "100%");
    }
    grad.select("stop.from").attr("stop-color", from);
    grad.select("stop.to").attr("stop-color", to);
    return `url(#${id})`;
}

/**
 * D3 data join for task bars, progress overlays, and milestone diamonds.
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
        fancy,
        animate,
        showProgress,
        showBaseline,
        baselineFill,
        onClick,
        onContextMenu,
        onMouseMove,
        onMouseOut
    } = options;

    const effectiveProgress = (d: TaskRow): number | null => (showProgress ? d.progress : null);
    const hasBaseline = (d: TaskRow): boolean =>
        showBaseline && d.baselineStart != null && d.baselineEnd != null;

    const svgNode = (container.node() as SVGGElement | null)?.ownerSVGElement ?? null;
    if (fancy) {
        ensureFancyDefs(svgNode);
    }

    const bandwidth = Math.max(4, yScale.bandwidth());
    // Keep bars visually centered on the same midline as labels/status dots.
    const barHeight = Math.max(4, Math.min(bandwidth * 0.58, bandwidth - 8));
    const midY = bandwidth / 2;
    const actualHeight = barHeight;
    const actualY = midY - actualHeight / 2;
    // Planned = thinner bar on the same centerline (drawn behind actual).
    const baselineHeight = Math.max(3, actualHeight * 0.42);
    const baselineY = midY - baselineHeight / 2;
    const milestoneSize = Math.max(10, Math.min(bandwidth * 0.62, 18));
    const baselineMilestoneSize = Math.max(8, milestoneSize - 4);

    const join = container
        .selectAll<SVGGElement, TaskRow>("g.task-row")
        .data(tasks, (d) => d.id);

    join.exit().remove();

    const enter = join.enter()
        .append("g")
        .attr("class", "task-row");

    enter.append("rect").attr("class", "task-baseline");
    enter.append("rect").attr("class", "task-track");
    enter.append("rect").attr("class", "task-progress");
    enter.append("rect").attr("class", "task-sheen");
    enter.append("rect").attr("class", "task-late");
    enter.append("polygon").attr("class", "task-milestone");
    enter.append("polygon").attr("class", "task-milestone-inner");
    enter.append("polygon").attr("class", "task-baseline-milestone");
    enter.append("text").attr("class", "task-progress-label");

    if (animate) {
        enter.style("opacity", 0)
            .transition()
            .duration(420)
            .ease(d3.easeCubicOut)
            .style("opacity", null);
    }

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
            return isSelected(d) ? "1" : "0.22";
        });

    merged.select<SVGRectElement>("rect.task-baseline")
        .attr("display", (d) => (!d.isMilestone && hasBaseline(d) ? null : "none"))
        .attr("x", (d) => xScale(d.baselineStart!))
        .attr("y", baselineY)
        .attr("rx", Math.max(1, Math.min(cornerRadius, 3)))
        .attr("ry", Math.max(1, Math.min(cornerRadius, 3)))
        .attr("height", baselineHeight)
        .attr("width", (d) => Math.max(1, xScale(d.baselineEnd!) - xScale(d.baselineStart!)))
        .attr("fill", baselineFill)
        .attr("stroke", withAlpha("#0F172A", 0.2))
        .attr("stroke-width", 1)
        .attr("pointer-events", "none");

    merged.select<SVGRectElement>("rect.task-track")
        .attr("display", (d) => d.isMilestone ? "none" : null)
        .attr("x", (d) => xScale(d.start))
        .attr("y", actualY)
        .attr("rx", Math.min(cornerRadius, 4))
        .attr("ry", Math.min(cornerRadius, 4))
        .attr("height", actualHeight)
        .attr("width", (d) => Math.max(1, xScale(d.end) - xScale(d.start)))
        .attr("fill", (d) => {
            const base = getBarColor(d);
            const progress = effectiveProgress(d);
            if (progress == null) {
                return fancy
                    ? upsertGradient(svgNode, barGradientId(d.id, "bar"), lightenColor(base, 0.2), darkenColor(base, 0.15))
                    : base;
            }
            return withAlpha(base, fancy ? 0.18 : 0.22);
        })
        .attr("stroke", (d) => {
            if (d.flaggedInvalidRange) {
                return flaggedStroke;
            }
            const progress = effectiveProgress(d);
            if (progress == null) {
                return fancy ? withAlpha(getBarColor(d), 0.25) : "none";
            }
            return withAlpha(getBarColor(d), 0.45);
        })
        .attr("stroke-width", (d) => {
            if (d.flaggedInvalidRange) {
                return 1.5;
            }
            return effectiveProgress(d) == null ? (fancy ? 0.75 : 0) : 1;
        })
        .attr("filter", null);

    merged.select<SVGRectElement>("rect.task-progress")
        .attr("display", (d) => {
            const progress = effectiveProgress(d);
            if (d.isMilestone || progress == null || progress <= 0) {
                return "none";
            }
            return null;
        })
        .attr("x", (d) => xScale(d.start))
        .attr("y", actualY)
        .attr("rx", Math.max(0, Math.min(cornerRadius, 4) - 1))
        .attr("ry", Math.max(0, Math.min(cornerRadius, 4) - 1))
        .attr("height", actualHeight)
        .attr("width", (d) => {
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            const p = Math.max(0, Math.min(1, effectiveProgress(d) ?? 0));
            return Math.min(barWidth, barWidth * p);
        })
        .attr("fill", (d) => {
            const base = getProgressColor(d);
            return fancy
                ? upsertGradient(svgNode, barGradientId(d.id, "progress"), lightenColor(base, 0.35), darkenColor(base, 0.1))
                : base;
        })
        .attr("pointer-events", "none");

    merged.select<SVGRectElement>("rect.task-sheen")
        .attr("display", (d) => {
            const progress = effectiveProgress(d);
            if (!fancy || d.isMilestone || progress == null || progress <= 0) {
                return "none";
            }
            return null;
        })
        .attr("x", (d) => xScale(d.start))
        .attr("y", actualY)
        .attr("rx", Math.max(0, Math.min(cornerRadius, 4) - 1))
        .attr("ry", Math.max(0, Math.min(cornerRadius, 4) - 1))
        .attr("height", Math.max(2, actualHeight * 0.4))
        .attr("width", (d) => {
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            const p = Math.max(0, Math.min(1, effectiveProgress(d) ?? 0));
            return Math.min(barWidth, barWidth * p);
        })
        .attr("fill", "url(#gantt-sheen)")
        .attr("pointer-events", "none");

    // Hatch remaining work when late (only when progress is shown)
    merged.select<SVGRectElement>("rect.task-late")
        .attr("display", (d) => {
            const progress = effectiveProgress(d);
            if (!fancy || d.isMilestone || d.status !== "late" || progress == null || progress >= 1) {
                return "none";
            }
            return null;
        })
        .attr("x", (d) => {
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            const p = Math.max(0, Math.min(1, effectiveProgress(d) ?? 0));
            return xScale(d.start) + barWidth * p;
        })
        .attr("y", actualY)
        .attr("rx", Math.max(0, Math.min(cornerRadius, 4) - 1))
        .attr("ry", Math.max(0, Math.min(cornerRadius, 4) - 1))
        .attr("height", actualHeight)
        .attr("width", (d) => {
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            const p = Math.max(0, Math.min(1, effectiveProgress(d) ?? 0));
            return Math.max(0, barWidth * (1 - p));
        })
        .attr("fill", "url(#gantt-late-hatch)")
        .attr("pointer-events", "none");

    // Planned milestone: outline only, same midline; hide if same day as actual.
    merged.select<SVGPolygonElement>("polygon.task-baseline-milestone")
        .attr("display", (d) => {
            if (!d.isMilestone || !hasBaseline(d)) {
                return "none";
            }
            const sameDay = Math.abs(d.baselineStart!.getTime() - d.start.getTime()) < MS_PER_DAY;
            return sameDay ? "none" : null;
        })
        .attr("points", (d) => diamondPoints(xScale(d.baselineStart!), midY, baselineMilestoneSize))
        .attr("fill", "none")
        .attr("stroke", withAlpha("#64748B", 0.95))
        .attr("stroke-width", 1.5)
        .attr("pointer-events", "none");

    merged.select<SVGPolygonElement>("polygon.task-milestone")
        .attr("display", (d) => d.isMilestone ? null : "none")
        .attr("points", (d) => diamondPoints(xScale(d.start), midY, milestoneSize))
        .attr("fill", (d) => getBarColor(d))
        .attr("stroke", (d) => d.flaggedInvalidRange ? flaggedStroke : darkenColor(getBarColor(d), 0.35))
        .attr("stroke-width", 1.25)
        .attr("filter", null);

    merged.select<SVGPolygonElement>("polygon.task-milestone-inner")
        .attr("display", (d) => fancy && d.isMilestone ? null : "none")
        .attr("points", (d) => diamondPoints(xScale(d.start), midY, Math.max(4, milestoneSize * 0.38)))
        .attr("fill", "#F8FAFC")
        .attr("opacity", 0.8)
        .attr("pointer-events", "none");

    merged.select<SVGTextElement>("text.task-progress-label")
        .attr("display", (d) => {
            const progress = effectiveProgress(d);
            if (!fancy || d.isMilestone || progress == null) {
                return "none";
            }
            const barWidth = Math.max(1, xScale(d.end) - xScale(d.start));
            return barWidth < 40 ? "none" : null;
        })
        .attr("x", (d) => xScale(d.start) + 6)
        .attr("y", midY)
        .attr("dy", "0.35em")
        .attr("fill", "#F8FAFC")
        .style("font-size", `${Math.max(9, Math.min(11, actualHeight - 6))}px`)
        .style("font-weight", "600")
        .style("pointer-events", "none")
        .text((d) => `${Math.round((effectiveProgress(d) ?? 0) * 100)}%`);

    merged
        .on("click", (event: MouseEvent, d: TaskRow) => {
            event.preventDefault();
            event.stopPropagation();
            onClick(event, d);
        })
        .on("contextmenu", (event: MouseEvent, d: TaskRow) => {
            event.preventDefault();
            event.stopPropagation();
            onContextMenu(event, d);
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
    color: string,
    fancy: boolean
): void {
    const today = new Date();
    const inRange = today >= domainStart && today <= domainEnd;
    const show = visible && inRange;

    const lineJoin = container
        .selectAll<SVGLineElement, Date>("line.today-line")
        .data(show ? [today] : []);

    lineJoin.exit().remove();

    lineJoin.enter()
        .append("line")
        .attr("class", "today-line")
        .merge(lineJoin)
        .attr("x1", (d) => xScale(d))
        .attr("x2", (d) => xScale(d))
        .attr("y1", 0)
        .attr("y2", contentHeight)
        .attr("stroke", color)
        .attr("stroke-width", fancy ? 2.25 : 2)
        .attr("stroke-dasharray", fancy ? "0" : "5,4")
        .attr("opacity", fancy ? 0.9 : 1)
        .attr("pointer-events", "none");

    const capJoin = container
        .selectAll<SVGCircleElement, Date>("circle.today-cap")
        .data(show && fancy ? [today] : []);

    capJoin.exit().remove();

    capJoin.enter()
        .append("circle")
        .attr("class", "today-cap")
        .merge(capJoin)
        .attr("cx", (d) => xScale(d))
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", color)
        .attr("stroke", "#FFF7ED")
        .attr("stroke-width", 2)
        .attr("pointer-events", "none");

    const labelJoin = container
        .selectAll<SVGTextElement, Date>("text.today-label")
        .data(show && fancy ? [today] : []);

    labelJoin.exit().remove();

    labelJoin.enter()
        .append("text")
        .attr("class", "today-label")
        .merge(labelJoin)
        .attr("x", (d) => xScale(d) + 8)
        .attr("y", 11)
        .attr("fill", color)
        .style("font-size", "10px")
        .style("font-weight", "700")
        .style("letter-spacing", "0.04em")
        .text("TODAY")
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
    onToggleGroup: (groupKey: string) => void,
    getStatusColor?: (task: TaskRow) => string
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
    enter.append("circle").attr("class", "label-status");
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

    merged.select<SVGCircleElement>("circle.label-status")
        .attr("display", (d) => d.kind === "task" && d.task ? null : "none")
        .attr("cx", 12)
        .attr("cy", bandwidth / 2)
        .attr("r", 3.5)
        .attr("fill", (d) => {
            if (d.task && getStatusColor) {
                return getStatusColor(d.task);
            }
            const status = d.task?.status;
            if (status === "done") return "#2DD4BF";
            if (status === "late") return "#FB7185";
            if (status === "atrisk") return "#FBBF24";
            if (status === "future") return "#94A3B8";
            return "#22D3EE";
        });

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
