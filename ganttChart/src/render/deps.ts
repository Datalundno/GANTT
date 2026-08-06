"use strict";

import * as d3 from "d3";
import { DependencyLink, TaskRow } from "../data/types";

/**
 * Finish-to-start dependency elbows with arrowheads.
 * Routes with short stubs so vertical segments sit in open space between bars.
 */
export function renderDependencies(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    links: DependencyLink[],
    tasksById: Map<string, TaskRow>,
    xScale: d3.ScaleTime<number, number>,
    yScale: d3.ScaleBand<string>,
    color: string,
    visible: boolean
): void {
    const bandwidth = yScale.bandwidth();
    const data = visible
        ? links.filter((link) => tasksById.has(link.fromTaskId) && tasksById.has(link.toTaskId)
            && yScale(link.fromTaskId) != null && yScale(link.toTaskId) != null)
        : [];

    const markerId = ensureArrowMarker(container, color);

    const join = container
        .selectAll<SVGPathElement, DependencyLink>("path.dep-link")
        .data(data, (d) => d.id);

    join.exit().remove();

    join.enter()
        .append("path")
        .attr("class", "dep-link")
        .merge(join)
        .attr("d", (link) => {
            const from = tasksById.get(link.fromTaskId)!;
            const to = tasksById.get(link.toTaskId)!;
            const y1 = (yScale(from.id) ?? 0) + bandwidth / 2;
            const y2 = (yScale(to.id) ?? 0) + bandwidth / 2;

            // Anchor to bar edges with a small gap so arrows don't sit inside fills.
            const fromEndX = xScale(from.end);
            const toStartX = xScale(to.start);
            const x1 = from.isMilestone ? fromEndX : fromEndX + 1;
            const x2 = to.isMilestone ? toStartX : Math.max(toStartX - 2, toStartX - 6);

            const stub = 10;
            if (x2 >= x1 + stub * 2) {
                const midX = x1 + Math.max(stub, Math.min(20, (x2 - x1) * 0.35));
                return `M${x1},${y1} H${midX} V${y2} H${x2}`;
            }

            // Overlap / backward: step out to the right of both, then in.
            const lane = Math.max(x1, x2) + stub + 8;
            return `M${x1},${y1} H${lane} V${y2} H${x2}`;
        })
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.25)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("marker-end", `url(#${markerId})`)
        .attr("opacity", 0.55)
        .attr("pointer-events", "none");
}

function ensureArrowMarker(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    color: string
): string {
    const gNode = container.node();
    const svgEl = gNode?.ownerSVGElement;
    if (!svgEl) {
        return "gantt-dep-arrow";
    }
    const svg = d3.select(svgEl);
    const markerId = "gantt-dep-arrow";
    let defs = svg.select<SVGDefsElement>("defs.gantt-defs");
    if (defs.empty()) {
        defs = svg.insert("defs", ":first-child").attr("class", "gantt-defs");
    }
    let marker = defs.select<SVGMarkerElement>(`#${markerId}`);
    if (marker.empty()) {
        marker = defs.append("marker")
            .attr("id", markerId)
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 8)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto-start-reverse");
        marker.append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");
    }
    marker.select("path").attr("fill", color);
    return markerId;
}

export function renderMonthGrid(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    xScale: d3.ScaleTime<number, number>,
    domainStart: Date,
    domainEnd: Date,
    contentHeight: number,
    color: string,
    visible: boolean
): void {
    const ticks = visible
        ? d3.timeMonth.range(d3.timeMonth.floor(domainStart), d3.timeDay.offset(domainEnd, 1))
        : [];

    const join = container
        .selectAll<SVGLineElement, Date>("line.month-grid")
        .data(ticks, (d) => d.getTime().toString());

    join.exit().remove();

    join.enter()
        .append("line")
        .attr("class", "month-grid")
        .merge(join)
        .attr("x1", (d) => xScale(d))
        .attr("x2", (d) => xScale(d))
        .attr("y1", 0)
        .attr("y2", contentHeight)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.22)
        .attr("pointer-events", "none");
}
