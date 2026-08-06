"use strict";

import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import VisualUpdateType = powerbi.VisualUpdateType;
import ISelectionId = powerbi.visuals.ISelectionId;

import { VisualFormattingSettingsModel } from "./settings";
import { convertDataView } from "./data/converter";
import { buildDisplayRows, visibleTaskRows } from "./data/groups";
import { AxisGranularity, AxisGranularityOption, AxisLabelFormat, TaskRow, ViewModel } from "./data/types";
import { computeLayout, ChartLayout, RIGHT_PADDING } from "./render/layout";
import { createBandScale, createTimeScale, renderBottomAxis, renderWeekendShading } from "./render/axis";
import {
    renderBars,
    renderGroupBands,
    renderLabelRows,
    renderRowBands,
    renderTodayLine
} from "./render/bars";
import { getContrastColors } from "./utils/contrast";
import { buildTooltipDataItems, pointerCoordinates } from "./utils/tooltips";

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private localization: ILocalizationManager;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private root: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private message: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private landing: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private chart: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    private bodyRow: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private labelsCol: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private plotCol: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private axisRow: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private axisGutter: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private axisCol: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    private labelsSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private plotSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private axisSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    private labelLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private weekendLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private rowBandLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private bandLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private barsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private todayLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private axisLayer: d3.Selection<SVGGElement, unknown, null, undefined>;

    private viewModel: ViewModel | null = null;
    private collapsedGroups: Set<string> = new Set();
    private selectedKeys: Set<string> = new Set();
    private syncingScroll = false;
    private lastViewport: { width: number; height: number } | null = null;
    private isLandingPageOn = false;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.localization = options.host.createLocalizationManager();
        this.formattingSettingsService = new FormattingSettingsService(this.localization);

        this.selectionManager.registerOnSelectCallback((ids: ISelectionId[]) => {
            this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
            this.renderFromState();
        });

        this.root = d3.select(options.element)
            .append("div")
            .classed("gantt-root", true)
            .attr("tabindex", "0");

        this.message = this.root
            .append("div")
            .classed("gantt-message", true)
            .style("display", "none");

        this.landing = this.root
            .append("div")
            .classed("gantt-landing", true)
            .style("display", "none");

        this.buildLandingPage();

        this.chart = this.root
            .append("div")
            .classed("gantt-chart", true);

        this.bodyRow = this.chart
            .append("div")
            .classed("gantt-body-row", true);

        this.labelsCol = this.bodyRow
            .append("div")
            .classed("gantt-labels-col", true);

        this.labelsSvg = this.labelsCol
            .append("svg")
            .classed("gantt-labels-svg", true);

        this.labelLayer = this.labelsSvg.append("g").classed("labels", true);

        this.plotCol = this.bodyRow
            .append("div")
            .classed("gantt-plot-col", true);

        this.plotSvg = this.plotCol
            .append("svg")
            .classed("gantt-plot-svg", true);

        this.weekendLayer = this.plotSvg.append("g").classed("weekends", true);
        this.rowBandLayer = this.plotSvg.append("g").classed("row-bands", true);
        this.bandLayer = this.plotSvg.append("g").classed("bands", true);
        this.todayLayer = this.plotSvg.append("g").classed("today", true);
        this.barsLayer = this.plotSvg.append("g").classed("bars", true);

        this.axisRow = this.chart
            .append("div")
            .classed("gantt-axis-row", true);

        this.axisGutter = this.axisRow
            .append("div")
            .classed("gantt-axis-gutter", true);

        this.axisCol = this.axisRow
            .append("div")
            .classed("gantt-axis-col", true);

        this.axisSvg = this.axisCol
            .append("svg")
            .classed("gantt-axis-svg", true);

        this.axisLayer = this.axisSvg.append("g").classed("x-axis", true);

        const plotNode = this.plotCol.node() as HTMLDivElement;
        const labelsNode = this.labelsCol.node() as HTMLDivElement;
        const axisNode = this.axisCol.node() as HTMLDivElement;

        plotNode.addEventListener("scroll", () => {
            if (this.syncingScroll) {
                return;
            }
            this.syncingScroll = true;
            labelsNode.scrollTop = plotNode.scrollTop;
            axisNode.scrollLeft = plotNode.scrollLeft;
            this.syncingScroll = false;
        });

        labelsNode.addEventListener("scroll", () => {
            if (this.syncingScroll) {
                return;
            }
            this.syncingScroll = true;
            plotNode.scrollTop = labelsNode.scrollTop;
            this.syncingScroll = false;
        });

        // Clear selection when clicking empty plot canvas.
        this.plotSvg.on("click", () => {
            this.clearSelection();
        });

        // AppSource requires context menu on empty space and data points.
        this.root.on("contextmenu", (event: MouseEvent) => {
            this.showEmptyContextMenu(event);
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);

        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                dataView
            );

            const hasBoundFields = (dataView?.metadata?.columns?.length ?? 0) > 0;
            if (!hasBoundFields) {
                this.showLandingPage();
                this.viewModel = null;
                this.lastViewport = {
                    width: options.viewport.width,
                    height: options.viewport.height
                };
                this.events.renderingFinished(options);
                return;
            }

            this.hideLandingPage();

            const isResizeOnly =
                options.type === VisualUpdateType.Resize ||
                options.type === VisualUpdateType.ResizeEnd ||
                (options.type & VisualUpdateType.Resize) === VisualUpdateType.Resize;

            if (!isResizeOnly || !this.viewModel) {
                this.viewModel = convertDataView(dataView, this.host);
                this.pruneCollapsedGroups();
                this.syncSelectionFromManager();
            }

            this.lastViewport = {
                width: options.viewport.width,
                height: options.viewport.height
            };
            this.renderFromState();
            this.updateWarningIcon();

            this.events.renderingFinished(options);
        } catch (error) {
            const prefix = this.t("Msg_RenderError", "Unable to render Gantt chart");
            this.showMessage(`${prefix}: ${String(error)}`);
            this.events.renderingFailed(options, String(error));
        }
    }

    private t(key: string, fallback: string): string {
        try {
            const value = this.localization.getDisplayName(key);
            return value || fallback;
        } catch {
            return fallback;
        }
    }

    private buildLandingPage(): void {
        const node = this.landing.node();
        if (node) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        }

        const card = this.landing.append("div").classed("gantt-landing-card", true);

        card.append("div")
            .classed("gantt-landing-mark", true)
            .attr("aria-hidden", "true");

        card.append("h2")
            .classed("gantt-landing-title", true)
            .text(this.t("Landing_Title", "DataLund Gantt"));

        card.append("p")
            .classed("gantt-landing-subtitle", true)
            .text(this.t("Landing_Subtitle", "Visualize project schedules on a clear timeline."));

        const steps = card.append("ul").classed("gantt-landing-steps", true);
        const stepKeys: Array<[string, string]> = [
            ["Landing_Step1", "1. Drag Task into the Task field"],
            ["Landing_Step2", "2. Drag a date into Start Date"],
            ["Landing_Step3", "3. Add End Date or Duration"],
            ["Landing_Step4", "Optional: Progress, Group, Resource, Tooltips"]
        ];
        for (const [key, fallback] of stepKeys) {
            steps.append("li").text(this.t(key, fallback));
        }
    }

    private showLandingPage(): void {
        this.isLandingPageOn = true;
        this.chart.style("display", "none");
        this.message.style("display", "none").text("");
        this.landing.style("display", "flex");
    }

    private hideLandingPage(): void {
        if (!this.isLandingPageOn) {
            this.landing.style("display", "none");
            return;
        }
        this.isLandingPageOn = false;
        this.landing.style("display", "none");
    }

    private showEmptyContextMenu(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        this.selectionManager.showContextMenu({} as ISelectionId, {
            x: event.clientX,
            y: event.clientY
        });
    }

    private onBarContextMenu(event: MouseEvent, task: TaskRow): void {
        event.preventDefault();
        event.stopPropagation();
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        const selectionId = task.selectionId ?? ({} as ISelectionId);
        this.selectionManager.showContextMenu(selectionId, {
            x: event.clientX,
            y: event.clientY
        });
    }

    private updateWarningIcon(): void {
        if (!this.viewModel || !this.host.displayWarningIcon) {
            return;
        }
        const invalidCount = this.viewModel.tasks.filter((t) => t.flaggedInvalidRange).length;
        if (invalidCount > 0) {
            this.host.displayWarningIcon(
                "Invalid date ranges",
                `${invalidCount} task(s) have an end date before the start date. Those bars are outlined so you can fix the data.`
            );
        }
    }

    private syncSelectionFromManager(): void {
        const ids = this.selectionManager.getSelectionIds() as ISelectionId[];
        this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
    }

    private pruneCollapsedGroups(): void {
        if (!this.viewModel) {
            return;
        }
        const valid = new Set(
            this.viewModel.tasks
                .map((t) => t.group)
                .filter((g): g is string => g != null && g !== "")
        );
        [...this.collapsedGroups].forEach((key) => {
            if (key !== "__ungrouped__" && !valid.has(key)) {
                this.collapsedGroups.delete(key);
            }
        });
    }

    private resolveGranularity(autoGranularity: AxisGranularity): AxisGranularity {
        const raw = this.formattingSettings?.generalCard?.axisGranularity?.value?.value as AxisGranularityOption | undefined;
        if (!raw || raw === "auto") {
            return autoGranularity;
        }
        return raw;
    }

    private resolveLabelFormat(): AxisLabelFormat {
        const raw = this.formattingSettings?.generalCard?.axisLabelFormat?.value?.value as AxisLabelFormat | undefined;
        if (raw === "week" || raw === "both" || raw === "date") {
            return raw;
        }
        return "date";
    }

    private toggleGroup(groupKey: string): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (this.collapsedGroups.has(groupKey)) {
            this.collapsedGroups.delete(groupKey);
        } else {
            this.collapsedGroups.add(groupKey);
        }
        this.renderFromState();
    }

    private isTaskSelected(task: TaskRow): boolean {
        if (!task.selectionId) {
            return false;
        }
        return this.selectedKeys.has(task.selectionId.getKey());
    }

    private onBarClick(event: MouseEvent, task: TaskRow): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (!task.selectionId) {
            return;
        }
        const multi = event.ctrlKey || event.metaKey;
        this.selectionManager.select(task.selectionId, multi).then((ids: ISelectionId[]) => {
            this.selectedKeys = new Set((ids ?? []).map((id) => id.getKey()));
            this.renderFromState();
        });
    }

    private clearSelection(): void {
        if (!this.host.hostCapabilities?.allowInteractions) {
            return;
        }
        if (!this.selectionManager.hasSelection()) {
            return;
        }
        this.selectionManager.clear().then(() => {
            this.selectedKeys.clear();
            this.renderFromState();
        });
    }

    private onBarMouseMove(event: MouseEvent, task: TaskRow): void {
        if (!this.tooltipService.enabled()) {
            return;
        }
        const rootNode = this.root.node();
        if (!rootNode) {
            return;
        }
        const identities = task.selectionId ? [task.selectionId] : [];
        this.tooltipService.show({
            coordinates: pointerCoordinates(event, rootNode),
            isTouchEvent: false,
            dataItems: buildTooltipDataItems(task),
            identities
        });
    }

    private onBarMouseOut(_event: MouseEvent, _task: TaskRow): void {
        this.tooltipService.hide({
            isTouchEvent: false,
            immediately: true
        });
    }

    private renderFromState(): void {
        if (!this.lastViewport || !this.viewModel) {
            return;
        }

        const labelWidth = this.formattingSettings?.labelsCard?.width?.value ?? 200;
        const barHeight = this.formattingSettings?.barsCard?.barHeight?.value ?? 28;
        const rowHeight = barHeight + 12;
        const displayRows = buildDisplayRows(this.viewModel.tasks, this.collapsedGroups);
        const domainStart = this.viewModel.domainStart ?? new Date();
        const domainEnd = this.viewModel.domainEnd ?? new Date();

        const layout = computeLayout(
            this.lastViewport.width,
            this.lastViewport.height,
            displayRows.length,
            domainStart,
            domainEnd,
            labelWidth,
            rowHeight
        );
        this.render(layout, displayRows);
    }

    private render(
        layout: ChartLayout,
        displayRows: ReturnType<typeof buildDisplayRows>
    ): void {
        const viewModel = this.viewModel;
        if (!viewModel || viewModel.errorMessage || viewModel.tasks.length === 0) {
            this.showMessage(
                viewModel?.errorMessage
                    ?? this.t("Msg_AddFields", "Add Task and Start Date fields to render the Gantt chart.")
            );
            return;
        }

        if (!viewModel.domainStart || !viewModel.domainEnd) {
            this.showMessage(this.t("Msg_InvalidRange", "Could not determine a valid date range."));
            return;
        }

        this.hideMessage();

        const contrast = getContrastColors(this.host.colorPalette);
        const defaultBarFill = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.barsCard?.fill?.value?.value || "#0ea5e9");
        const defaultProgressFill = contrast.isHighContrast
            ? contrast.foregroundSelected
            : (this.formattingSettings?.barsCard?.progressFill?.value?.value || "#0284c7");
        const colorByResource = this.formattingSettings?.generalCard?.colorByResource?.value ?? false;
        const todayColor = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.generalCard?.todayLineColor?.value?.value || "#e81123");
        const showToday = this.formattingSettings?.generalCard?.showTodayLine?.value ?? true;
        const weekendShading = this.formattingSettings?.generalCard?.weekendShading?.value ?? false;
        const granularity = this.resolveGranularity(viewModel.granularity);
        const labelFormat = this.resolveLabelFormat();
        const textColor = contrast.foreground;
        const cornerRadius = this.formattingSettings?.barsCard?.cornerRadius?.value ?? 4;
        const fontSize = this.formattingSettings?.labelsCard?.fontSize?.value ?? 12;
        const fontFamily = this.formattingSettings?.labelsCard?.fontFamily?.value
            ?? "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";
        const bandFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(15, 23, 42, 0.06)";
        const zebraFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(15, 23, 42, 0.035)";
        const hasSelection = this.selectedKeys.size > 0;

        const getBarColor = (task: TaskRow): string => {
            if (contrast.isHighContrast) {
                return contrast.foreground;
            }
            if (colorByResource && task.resource) {
                return this.host.colorPalette.getColor(task.resource).value;
            }
            return defaultBarFill;
        };

        const getProgressColor = (task: TaskRow): string => {
            if (contrast.isHighContrast) {
                return contrast.foregroundSelected;
            }
            if (colorByResource && task.resource) {
                return this.host.colorPalette.getColor(task.resource).value;
            }
            return defaultProgressFill;
        };

        this.root.style("background", contrast.background);

        this.labelsCol
            .style("width", `${layout.labelWidth}px`)
            .style("height", `${layout.bodyViewportHeight}px`);

        this.plotCol
            .style("height", `${layout.bodyViewportHeight}px`)
            .style("overflow-x", layout.needsHorizontalScroll ? "auto" : "hidden")
            .style("overflow-y", layout.needsVerticalScroll ? "auto" : "hidden");

        this.axisGutter.style("width", `${layout.labelWidth}px`);
        this.axisRow.style("height", `${layout.axisHeight}px`);
        this.axisCol
            .style("height", `${layout.axisHeight}px`)
            .style("overflow-x", "hidden")
            .style("overflow-y", "hidden");

        const plotWidth = Math.max(1, layout.contentWidth - RIGHT_PADDING);

        this.labelsSvg
            .attr("width", layout.labelWidth)
            .attr("height", layout.contentHeight);

        this.plotSvg
            .attr("width", layout.contentWidth)
            .attr("height", layout.contentHeight);

        this.axisSvg
            .attr("width", layout.contentWidth)
            .attr("height", layout.axisHeight);

        this.labelLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.weekendLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.rowBandLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.bandLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.todayLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.barsLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.axisLayer.attr("transform", "translate(0,0)");

        const domainStart = viewModel.domainStart;
        const domainEnd = viewModel.domainEnd;
        const rowIds = displayRows.map((r) => r.id);
        const tasks = visibleTaskRows(displayRows);
        const contentRowsHeight = displayRows.length * layout.rowHeight;

        const xScale = createTimeScale(domainStart, domainEnd, 0, plotWidth);
        const yScale = createBandScale(
            rowIds,
            0,
            contentRowsHeight,
            0.28
        );

        const weekendFill = contrast.isHighContrast
            ? contrast.foreground
            : "rgba(15, 23, 42, 0.06)";

        renderLabelRows(
            this.labelLayer,
            displayRows,
            yScale,
            layout.labelWidth,
            fontSize,
            fontFamily,
            textColor,
            zebraFill,
            bandFill,
            (groupKey) => this.toggleGroup(groupKey)
        );

        renderWeekendShading(
            this.weekendLayer,
            xScale,
            domainStart,
            domainEnd,
            contentRowsHeight,
            weekendShading,
            weekendFill
        );

        renderRowBands(this.rowBandLayer, displayRows, yScale, plotWidth, zebraFill);
        renderGroupBands(this.bandLayer, displayRows, yScale, plotWidth, bandFill);

        renderTodayLine(
            this.todayLayer,
            xScale,
            domainStart,
            domainEnd,
            contentRowsHeight,
            showToday,
            todayColor
        );

        renderBars(this.barsLayer, tasks, {
            xScale,
            yScale,
            getBarColor,
            getProgressColor,
            cornerRadius,
            flaggedStroke: contrast.isHighContrast ? contrast.foreground : "#a80000",
            trackStroke: contrast.background,
            hasSelection,
            isSelected: (task) => this.isTaskSelected(task),
            onClick: (event, task) => this.onBarClick(event, task),
            onContextMenu: (event, task) => this.onBarContextMenu(event, task),
            onMouseMove: (event, task) => this.onBarMouseMove(event, task),
            onMouseOut: (event, task) => this.onBarMouseOut(event, task)
        });

        renderBottomAxis(this.axisLayer, xScale, granularity, labelFormat, textColor, plotWidth);
    }

    private showMessage(text: string): void {
        this.hideLandingPage();
        this.chart.style("display", "none");
        this.message
            .style("display", "flex")
            .text(text);
    }

    private hideMessage(): void {
        this.message.style("display", "none").text("");
        this.chart.style("display", "flex");
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public destroy(): void {
        this.root.remove();
        this.viewModel = null;
        this.collapsedGroups.clear();
        this.selectedKeys.clear();
    }
}
