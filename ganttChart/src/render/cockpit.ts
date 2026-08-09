"use strict";

import * as d3 from "d3";
import { TaskRow } from "../data/types";

export interface ResourceLoadRow {
    resource: string;
    taskCount: number;
    milestoneCount: number;
}

export interface CockpitRenderOptions {
    tasks: TaskRow[];
    domainStart: Date;
    domainEnd: Date;
    textColor: string;
    barColor: string;
    trackColor: string;
    selectedKeys: Set<string>;
    getResourceColor: (resource: string) => string;
    onSelectTask: (task: TaskRow, multi: boolean) => void;
}

export const COCKPIT_SIDE_WIDTH = 252;
export const COCKPIT_BOTTOM_HEIGHT = 168;

/** Tasks that overlap the visible time window. */
export function tasksInWindow(tasks: TaskRow[], domainStart: Date, domainEnd: Date): TaskRow[] {
    return tasks.filter((task) => task.end >= domainStart && task.start <= domainEnd);
}

export function aggregateResourceLoad(tasks: TaskRow[]): ResourceLoadRow[] {
    const map = new Map<string, ResourceLoadRow>();
    tasks.forEach((task) => {
        const key = task.resource && task.resource.trim() !== "" ? task.resource : "Unassigned";
        const row = map.get(key) ?? { resource: key, taskCount: 0, milestoneCount: 0 };
        row.taskCount += 1;
        if (task.isMilestone) {
            row.milestoneCount += 1;
        }
        map.set(key, row);
    });
    return [...map.values()].sort((a, b) => b.taskCount - a.taskCount || a.resource.localeCompare(b.resource));
}

export function renderResourcePanel(
    host: d3.Selection<HTMLDivElement, unknown, null, undefined>,
    options: CockpitRenderOptions
): void {
    const visible = tasksInWindow(options.tasks, options.domainStart, options.domainEnd);
    const rows = aggregateResourceLoad(visible);
    const maxCount = Math.max(1, ...rows.map((r) => r.taskCount));

    host.selectAll("*").remove();

    const head = host.append("div").classed("cockpit-panel-head", true);
    head.append("h3").text("People on tasks");
    head.append("p").text(
        rows.length === 0
            ? "Map Resource to see workload in the time window."
            : `${visible.length} task${visible.length === 1 ? "" : "s"} in view`
    );

    if (rows.length === 0) {
        return;
    }

    const list = host.append("div").classed("cockpit-resource-list", true);
    const items = list.selectAll<HTMLDivElement, ResourceLoadRow>("div.cockpit-resource-row")
        .data(rows, (d) => d.resource)
        .enter()
        .append("div")
        .classed("cockpit-resource-row", true);

    items.append("div")
        .classed("cockpit-resource-label", true)
        .style("color", options.textColor)
        .text((d) => d.resource);

    const track = items.append("div").classed("cockpit-resource-track", true)
        .style("background", options.trackColor);

    track.append("div")
        .classed("cockpit-resource-fill", true)
        .style("width", (d) => `${Math.max(8, (d.taskCount / maxCount) * 100)}%`)
        .style("background", (d) => (
            d.resource === "Unassigned" ? options.barColor : options.getResourceColor(d.resource)
        ));

    items.append("div")
        .classed("cockpit-resource-count", true)
        .style("color", options.textColor)
        .text((d) => String(d.taskCount));
}

function formatShortDate(value: Date): string {
    return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function renderTaskListPanel(
    host: d3.Selection<HTMLDivElement, unknown, null, undefined>,
    options: CockpitRenderOptions
): void {
    const visible = tasksInWindow(options.tasks, options.domainStart, options.domainEnd)
        .slice()
        .sort((a, b) => a.start.getTime() - b.start.getTime() || a.task.localeCompare(b.task));

    host.selectAll("*").remove();

    const head = host.append("div").classed("cockpit-panel-head", true);
    head.append("h3").text("Tasks & milestones");
    head.append("p").text(
        visible.length === 0
            ? "No tasks in the current time window."
            : `${visible.length} in window · click to select`
    );

    if (visible.length === 0) {
        return;
    }

    const table = host.append("div").classed("cockpit-task-table", true);
    const header = table.append("div").classed("cockpit-task-row is-head", true);
    ["Task", "Who", "When", "Progress"].forEach((label) => {
        header.append("span").text(label);
    });

    const rows = table.selectAll<HTMLButtonElement, TaskRow>("button.cockpit-task-row")
        .data(visible, (d) => d.id)
        .enter()
        .append("button")
        .attr("type", "button")
        .classed("cockpit-task-row", true)
        .classed("is-selected", (d) => !!(d.selectionId && options.selectedKeys.has(d.selectionId.getKey())))
        .classed("is-milestone", (d) => d.isMilestone)
        .on("click", (event: MouseEvent, task) => {
            event.preventDefault();
            event.stopPropagation();
            options.onSelectTask(task, event.ctrlKey || event.metaKey);
        });

    rows.append("span")
        .classed("cockpit-task-name", true)
        .style("color", options.textColor)
        .text((d) => d.task);

    rows.append("span")
        .style("color", options.textColor)
        .text((d) => d.resource || "—");

    rows.append("span")
        .style("color", options.textColor)
        .text((d) => (
            d.isMilestone
                ? formatShortDate(d.start)
                : `${formatShortDate(d.start)} – ${formatShortDate(d.end)}`
        ));

    rows.append("span")
        .style("color", options.textColor)
        .text((d) => (
            d.progress == null ? "—" : `${Math.round(d.progress * 100)}%`
        ));
}

export function renderCockpitSummary(
    host: d3.Selection<HTMLDivElement, unknown, null, undefined>,
    options: CockpitRenderOptions
): void {
    const visible = tasksInWindow(options.tasks, options.domainStart, options.domainEnd);
    const people = new Set(
        visible
            .map((t) => t.resource)
            .filter((r): r is string => !!r && r.trim() !== "")
    );
    const milestones = visible.filter((t) => t.isMilestone).length;
    const withProgress = visible.filter((t) => t.progress != null);
    const avgProgress = withProgress.length === 0
        ? null
        : withProgress.reduce((sum, t) => sum + (t.progress ?? 0), 0) / withProgress.length;

    host.selectAll("*").remove();
    const chips = host.append("div").classed("cockpit-summary", true);
    const items: Array<[string, string]> = [
        ["Tasks", String(visible.length)],
        ["People", String(people.size)],
        ["Milestones", String(milestones)],
        ["Avg progress", avgProgress == null ? "—" : `${Math.round(avgProgress * 100)}%`]
    ];
    items.forEach(([label, value]) => {
        const chip = chips.append("div").classed("cockpit-summary-chip", true);
        chip.append("span").classed("cockpit-summary-value", true).style("color", options.textColor).text(value);
        chip.append("span").classed("cockpit-summary-label", true).style("color", options.textColor).text(label);
    });
}
