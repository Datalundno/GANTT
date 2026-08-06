"use strict";

import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import { TaskRow } from "../data/types";
import { toDisplayString } from "../utils/dates";

export function buildTooltipDataItems(
    task: TaskRow,
    options: { showProgress?: boolean } = {}
): VisualTooltipDataItem[] {
    const showProgress = options.showProgress ?? false;
    const items: VisualTooltipDataItem[] = [
        { displayName: "Task", value: task.task },
        { displayName: "Start", value: toDisplayString(task.start) },
        { displayName: "End", value: toDisplayString(task.end) },
        {
            displayName: "Duration",
            value: `${Math.round(task.durationDays * 10) / 10} days`
        }
    ];

    if (showProgress && task.progress != null) {
        items.push({
            displayName: "Progress",
            value: `${Math.round(task.progress * 100)}%`
        });
    }

    items.push({
        displayName: "Status",
        value: task.status
    });

    if (task.group) {
        items.push({ displayName: "Group", value: task.group });
    }

    if (task.resource) {
        items.push({ displayName: "Resource", value: task.resource });
    }

    if (task.predecessor) {
        items.push({ displayName: "Predecessor", value: task.predecessor });
    }

    task.tooltipFields.forEach((field) => {
        items.push({
            displayName: field.displayName,
            value: toDisplayString(field.value)
        });
    });

    return items;
}

export function pointerCoordinates(
    event: MouseEvent,
    root: HTMLElement
): number[] {
    const rect = root.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}
