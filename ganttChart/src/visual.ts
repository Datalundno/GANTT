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
import { convertDataView, computeTaskStatus } from "./data/converter";
import { buildDisplayRows, visibleTaskRows } from "./data/groups";
import {
    AxisGranularity,
    AxisGranularityOption,
    AxisLabelFormat,
    STATUS_COLORS,
    TaskRow,
    TimeWindowMonths,
    ViewModel
} from "./data/types";
import { computeLayout, ChartLayout, RIGHT_PADDING } from "./render/layout";
import { createBandScale, createTimeScale, renderBottomAxis, renderWeekendShading } from "./render/axis";
import { renderDependencies, renderMonthGrid } from "./render/deps";
import {
    renderBars,
    renderGroupBands,
    renderLabelRows,
    renderRowBands,
    renderTodayLine
} from "./render/bars";
import { getContrastColors } from "./utils/contrast";
import { buildTooltipDataItems, pointerCoordinates } from "./utils/tooltips";
import { chooseGranularity } from "./utils/dates";

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private localization: ILocalizationManager;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private root: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private toolbar: d3.Selection<HTMLDivElement, unknown, null, undefined>;
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
    private gridLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private weekendLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private rowBandLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private bandLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private depsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private barsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private todayLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private axisLayer: d3.Selection<SVGGElement, unknown, null, undefined>;

    private viewModel: ViewModel | null = null;
    private collapsedGroups: Set<string> = new Set();
    private selectedKeys: Set<string> = new Set();
    private syncingScroll = false;
    private lastViewport: { width: number; height: number } | null = null;
    private isLandingPageOn = false;
    private timeWindowMonths: TimeWindowMonths = 6;
    private didAnimateOnce = false;

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
            .classed("gantt-root gantt-lab", true)
            .attr("tabindex", "0");

        this.toolbar = this.root
            .append("div")
            .classed("gantt-toolbar", true);

        this.buildToolbar();

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

        this.gridLayer = this.plotSvg.append("g").classed("grid", true);
        this.weekendLayer = this.plotSvg.append("g").classed("weekends", true);
        this.rowBandLayer = this.plotSvg.append("g").classed("row-bands", true);
        this.bandLayer = this.plotSvg.append("g").classed("bands", true);
        this.depsLayer = this.plotSvg.append("g").classed("deps", true);
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

        this.plotSvg.on("click", () => {
            this.clearSelection();
        });

        this.root.on("contextmenu", (event: MouseEvent) => {
            this.showEmptyContextMenu(event);
        });
    }

    private buildToolbar(): void {
        this.toolbar.append("span")
            .classed("gantt-toolbar-title", true)
            .text("Lab");

        const windows = this.toolbar.append("div").classed("gantt-toolbar-group", true);
        const windowOptions: Array<{ label: string; value: TimeWindowMonths }> = [
            { label: "3M", value: 3 },
            { label: "6M", value: 6 },
            { label: "9M", value: 9 },
            { label: "12M", value: 12 },
            { label: "All", value: null }
        ];
        windowOptions.forEach((option) => {
            windows.append("button")
                .attr("type", "button")
                .classed("gantt-tool-btn", true)
                .attr("data-window", option.value == null ? "all" : String(option.value))
                .text(option.label)
                .on("click", (event: MouseEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!this.host.hostCapabilities?.allowInteractions) {
                        return;
                    }
                    this.timeWindowMonths = option.value;
                    this.syncToolbarActive();
                    this.renderFromState();
                });
        });

        const groups = this.toolbar.append("div").classed("gantt-toolbar-group", true);
        groups.append("button")
            .attr("type", "button")
            .classed("gantt-tool-btn", true)
            .text("Expand")
            .on("click", (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.collapsedGroups.clear();
                this.renderFromState();
            });
        groups.append("button")
            .attr("type", "button")
            .classed("gantt-tool-btn", true)
            .text("Collapse")
            .on("click", (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                if (!this.viewModel) {
                    return;
                }
                this.viewModel.tasks.forEach((task) => {
                    if (task.group) {
                        this.collapsedGroups.add(task.group);
                    }
                });
                this.collapsedGroups.add("__ungrouped__");
                this.renderFromState();
            });

        const legend = this.toolbar.append("div").classed("gantt-toolbar-legend", true);
        (Object.keys(STATUS_COLORS) as Array<keyof typeof STATUS_COLORS>).forEach((key) => {
            const item = legend.append("span").classed("gantt-legend-item", true);
            item.append("i").style("background", STATUS_COLORS[key].progress);
            item.append("span").text(STATUS_COLORS[key].label);
        });

        this.syncToolbarActive();
    }

    private syncToolbarActive(): void {
        this.toolbar.selectAll<HTMLButtonElement, unknown>("button.gantt-tool-btn[data-window]")
            .classed("is-active", (_d, _i, nodes) => {
                const node = nodes[_i] as HTMLButtonElement;
                const value = node.getAttribute("data-window");
                if (this.timeWindowMonths == null) {
                    return value === "all";
                }
                return value === String(this.timeWindowMonths);
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
                this.didAnimateOnce = false;
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

        card.append("h2")
            .classed("gantt-landing-title", true)
            .text(this.t("Landing_Title", "DataLund Gantt Lab"));

        card.append("p")
            .classed("gantt-landing-subtitle", true)
            .text(this.t(
                "Landing_Subtitle",
                "Add Task, Start Date, and End Date. Optional fields unlock planned bars, groups, and dependencies."
            ));

        const steps = card.append("ul").classed("gantt-landing-steps", true);
        const stepKeys: Array<[string, string]> = [
            ["Landing_Step1", "Task + Start Date + End Date"],
            ["Landing_Step2", "Optional: Planned Start / Planned End"],
            ["Landing_Step3", "Optional: Group, Resource, Predecessor"],
            ["Landing_Step4", "Format → Lab for toolbar and extras"]
        ];
        for (const [key, fallback] of stepKeys) {
            steps.append("li").text(this.t(key, fallback));
        }
    }

    private showLandingPage(): void {
        this.isLandingPageOn = true;
        this.chart.style("display", "none");
        this.toolbar.style("display", "none");
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
        return "both";
    }

    private resolveDomain(): { start: Date; end: Date; granularity: AxisGranularity } {
        const fullStart = this.viewModel?.domainStart ?? new Date();
        const fullEnd = this.viewModel?.domainEnd ?? new Date();
        if (this.timeWindowMonths == null) {
            return {
                start: fullStart,
                end: fullEnd,
                granularity: chooseGranularity(fullStart, fullEnd)
            };
        }
        const today = new Date();
        const ms = this.timeWindowMonths * 30.4375 * 24 * 60 * 60 * 1000;
        const half = ms / 2;
        const start = new Date(today.getTime() - half);
        const end = new Date(today.getTime() + half);
        return {
            start,
            end,
            granularity: chooseGranularity(start, end)
        };
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
            dataItems: buildTooltipDataItems(task, {
                showProgress: this.formattingSettings?.labCard?.showProgress?.value ?? false,
                showBaseline: this.formattingSettings?.labCard?.showBaseline?.value ?? true
            }),
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

        const showToolbar = this.formattingSettings?.labCard?.showToolbar?.value ?? true;
        const showStatusLegend = this.formattingSettings?.labCard?.showStatusLegend?.value ?? false;
        this.toolbar.style("display", showToolbar ? "flex" : "none");
        this.toolbar.select(".gantt-toolbar-legend")
            .style("display", showStatusLegend ? "inline-flex" : "none");
        this.syncToolbarActive();

        const toolbarHeight = showToolbar ? 40 : 0;
        const labelWidth = this.formattingSettings?.labelsCard?.width?.value ?? 210;
        const barHeight = this.formattingSettings?.barsCard?.barHeight?.value ?? 22;
        const rowHeight = Math.max(28, barHeight + 12);
        const displayRows = buildDisplayRows(this.viewModel.tasks, this.collapsedGroups);
        const domain = this.resolveDomain();

        const layout = computeLayout(
            this.lastViewport.width,
            Math.max(1, this.lastViewport.height - toolbarHeight),
            displayRows.length,
            domain.start,
            domain.end,
            labelWidth,
            rowHeight
        );
        this.render(layout, displayRows, domain.start, domain.end, domain.granularity);
    }

    private render(
        layout: ChartLayout,
        displayRows: ReturnType<typeof buildDisplayRows>,
        domainStart: Date,
        domainEnd: Date,
        autoGranularity: AxisGranularity
    ): void {
        const viewModel = this.viewModel;
        if (!viewModel || viewModel.errorMessage || viewModel.tasks.length === 0) {
            this.showMessage(
                viewModel?.errorMessage
                    ?? this.t("Msg_AddFields", "Add Task and Start Date fields to render the Gantt chart.")
            );
            return;
        }

        this.hideMessage();

        const contrast = getContrastColors(this.host.colorPalette);
        const fancy = (this.formattingSettings?.labCard?.enhancedGraphics?.value ?? false) && !contrast.isHighContrast;
        const animate = (this.formattingSettings?.labCard?.animateBars?.value ?? false) && !this.didAnimateOnce;
        const colorByStatus = this.formattingSettings?.labCard?.colorByStatus?.value ?? false;
        const showProgress = this.formattingSettings?.labCard?.showProgress?.value ?? false;
        const showBaseline = this.formattingSettings?.labCard?.showBaseline?.value ?? true;
        const showDependencies = this.formattingSettings?.labCard?.showDependencies?.value ?? true;
        const showMonthGrid = this.formattingSettings?.labCard?.showMonthGrid?.value ?? false;

        const defaultBarFill = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.barsCard?.fill?.value?.value || "#0E7490");
        const defaultProgressFill = contrast.isHighContrast
            ? contrast.foregroundSelected
            : (this.formattingSettings?.barsCard?.progressFill?.value?.value || "#22D3EE");
        const colorByResource = this.formattingSettings?.generalCard?.colorByResource?.value ?? false;
        const todayColor = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.generalCard?.todayLineColor?.value?.value || "#F59E0B");
        const showToday = this.formattingSettings?.generalCard?.showTodayLine?.value ?? true;
        const weekendShading = this.formattingSettings?.generalCard?.weekendShading?.value ?? true;
        const granularity = this.resolveGranularity(autoGranularity);
        const labelFormat = this.resolveLabelFormat();
        const textColor = contrast.foreground;
        const cornerRadius = this.formattingSettings?.barsCard?.cornerRadius?.value ?? 7;
        const fontSize = this.formattingSettings?.labelsCard?.fontSize?.value ?? 12;
        const fontFamily = this.formattingSettings?.labelsCard?.fontFamily?.value
            ?? "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";
        const bandFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(15, 61, 54, 0.07)";
        const zebraFill = contrast.isHighContrast
            ? contrast.background
            : "rgba(15, 23, 42, 0.03)";
        const hasSelection = this.selectedKeys.size > 0;

        const getBarColor = (task: TaskRow): string => {
            if (contrast.isHighContrast) {
                return contrast.foreground;
            }
            if (colorByStatus) {
                const status = computeTaskStatus(task.start, task.end, task.progress, new Date(), showProgress);
                return STATUS_COLORS[status].bar;
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
            if (colorByStatus) {
                const status = computeTaskStatus(task.start, task.end, task.progress, new Date(), showProgress);
                return STATUS_COLORS[status].progress;
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
        this.gridLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.weekendLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.rowBandLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.bandLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.depsLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.todayLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.barsLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.axisLayer.attr("transform", "translate(0,0)");

        const rowIds = displayRows.map((r) => r.id);
        const tasks = visibleTaskRows(displayRows);
        const contentRowsHeight = displayRows.length * layout.rowHeight;
        const tasksById = new Map(tasks.map((task) => [task.id, task]));

        const xScale = createTimeScale(domainStart, domainEnd, 0, plotWidth);
        const yScale = createBandScale(
            rowIds,
            0,
            contentRowsHeight,
            0.18
        );

        const weekendFill = contrast.isHighContrast
            ? contrast.foreground
            : "rgba(15, 61, 54, 0.035)";

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
            (groupKey) => this.toggleGroup(groupKey),
            colorByStatus
                ? (task) => {
                    const status = computeTaskStatus(task.start, task.end, task.progress, new Date(), showProgress);
                    return STATUS_COLORS[status].progress;
                }
                : undefined
        );

        renderMonthGrid(
            this.gridLayer,
            xScale,
            domainStart,
            domainEnd,
            contentRowsHeight,
            contrast.isHighContrast ? contrast.foreground : "rgba(15, 61, 54, 0.1)",
            showMonthGrid && !contrast.isHighContrast
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

        renderDependencies(
            this.depsLayer,
            viewModel.dependencies,
            tasksById,
            xScale,
            yScale,
            contrast.isHighContrast ? contrast.foreground : "rgba(20, 92, 79, 0.65)",
            showDependencies
        );

        renderTodayLine(
            this.todayLayer,
            xScale,
            domainStart,
            domainEnd,
            contentRowsHeight,
            showToday,
            todayColor,
            fancy
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
            fancy,
            animate,
            showProgress,
            showBaseline,
            baselineFill: contrast.isHighContrast
                ? contrast.foreground
                : "rgba(148, 163, 184, 0.55)",
            onClick: (event, task) => this.onBarClick(event, task),
            onContextMenu: (event, task) => this.onBarContextMenu(event, task),
            onMouseMove: (event, task) => this.onBarMouseMove(event, task),
            onMouseOut: (event, task) => this.onBarMouseOut(event, task)
        });

        if (animate) {
            this.didAnimateOnce = true;
        }

        renderBottomAxis(this.axisLayer, xScale, granularity, labelFormat, textColor, plotWidth);
    }

    private showMessage(text: string): void {
        this.hideLandingPage();
        this.chart.style("display", "none");
        this.toolbar.style("display", "none");
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
