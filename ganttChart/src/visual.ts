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
import VisualUpdateType = powerbi.VisualUpdateType;

import { VisualFormattingSettingsModel } from "./settings";
import { convertDataView } from "./data/converter";
import { ViewModel } from "./data/types";
import { computeLayout, ChartLayout, RIGHT_PADDING } from "./render/layout";
import { createBandScale, createTimeScale, renderBottomAxis } from "./render/axis";
import { renderBars, renderTaskLabels, renderTodayLine } from "./render/bars";
import { getContrastColors } from "./utils/contrast";

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private root: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private message: d3.Selection<HTMLDivElement, unknown, null, undefined>;
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
    private barsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private todayLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private axisLayer: d3.Selection<SVGGElement, unknown, null, undefined>;

    private viewModel: ViewModel | null = null;
    private syncingScroll = false;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();

        this.root = d3.select(options.element)
            .append("div")
            .classed("gantt-root", true);

        this.message = this.root
            .append("div")
            .classed("gantt-message", true)
            .style("display", "none");

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
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);

        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                dataView
            );

            const isResizeOnly =
                options.type === VisualUpdateType.Resize ||
                options.type === VisualUpdateType.ResizeEnd ||
                (options.type & VisualUpdateType.Resize) === VisualUpdateType.Resize;

            if (!isResizeOnly || !this.viewModel) {
                this.viewModel = convertDataView(dataView);
            }

            const labelWidth = this.formattingSettings?.labelsCard?.width?.value ?? 200;
            const barHeight = this.formattingSettings?.barsCard?.barHeight?.value ?? 28;
            const rowHeight = barHeight + 12;
            const taskCount = this.viewModel?.tasks?.length ?? 0;
            const domainStart = this.viewModel?.domainStart ?? new Date();
            const domainEnd = this.viewModel?.domainEnd ?? new Date();

            const layout = computeLayout(
                options.viewport.width,
                options.viewport.height,
                taskCount,
                domainStart,
                domainEnd,
                labelWidth,
                rowHeight
            );
            this.render(layout);

            this.events.renderingFinished(options);
        } catch (error) {
            this.showMessage(`Unable to render Gantt chart: ${String(error)}`);
            this.events.renderingFailed(options, String(error));
        }
    }

    private render(layout: ChartLayout): void {
        const viewModel = this.viewModel;
        if (!viewModel || viewModel.errorMessage || viewModel.tasks.length === 0) {
            this.showMessage(viewModel?.errorMessage ?? "Add Task and Start Date fields to render the Gantt chart.");
            return;
        }

        if (!viewModel.domainStart || !viewModel.domainEnd) {
            this.showMessage("Could not determine a valid date range.");
            return;
        }

        this.hideMessage();

        const contrast = getContrastColors(this.host.colorPalette);
        const barFill = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.barsCard?.fill?.value?.value || "#118dff");
        const progressFill = contrast.isHighContrast
            ? contrast.foregroundSelected
            : (this.formattingSettings?.barsCard?.progressFill?.value?.value || "#0b5cab");
        const todayColor = contrast.isHighContrast
            ? contrast.foreground
            : (this.formattingSettings?.generalCard?.todayLineColor?.value?.value || "#e81123");
        const showToday = this.formattingSettings?.generalCard?.showTodayLine?.value ?? true;
        const textColor = contrast.foreground;
        const cornerRadius = this.formattingSettings?.barsCard?.cornerRadius?.value ?? 4;
        const fontSize = this.formattingSettings?.labelsCard?.fontSize?.value ?? 12;
        const fontFamily = this.formattingSettings?.labelsCard?.fontFamily?.value
            ?? "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";

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
        this.todayLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.barsLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.axisLayer.attr("transform", "translate(0,0)");

        const domainStart = viewModel.domainStart;
        const domainEnd = viewModel.domainEnd;
        const taskIds = viewModel.tasks.map((t) => t.id);

        const xScale = createTimeScale(domainStart, domainEnd, 0, plotWidth);
        const yScale = createBandScale(
            taskIds,
            0,
            viewModel.tasks.length * layout.rowHeight,
            0.28
        );

        renderTaskLabels(
            this.labelLayer,
            viewModel.tasks,
            yScale,
            layout.labelWidth,
            fontSize,
            fontFamily,
            textColor
        );

        // Today line only when "today" falls inside the task date range (no domain stretch).
        renderTodayLine(
            this.todayLayer,
            xScale,
            domainStart,
            domainEnd,
            viewModel.tasks.length * layout.rowHeight,
            showToday,
            todayColor
        );

        renderBars(this.barsLayer, viewModel.tasks, {
            xScale,
            yScale,
            barFill,
            progressFill,
            cornerRadius,
            flaggedStroke: contrast.isHighContrast ? contrast.foreground : "#a80000"
        });

        renderBottomAxis(this.axisLayer, xScale, viewModel.granularity, textColor, plotWidth);
    }

    private showMessage(text: string): void {
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
    }
}
