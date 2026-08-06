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
import { computeLayout, ChartLayout } from "./render/layout";
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
    private scrollArea: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private axisArea: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    private bodySvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private axisSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private labelLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private plotLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private barsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private todayLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private axisLayer: d3.Selection<SVGGElement, unknown, null, undefined>;

    private viewModel: ViewModel | null = null;

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

        this.scrollArea = this.chart
            .append("div")
            .classed("gantt-scroll", true);

        this.bodySvg = this.scrollArea
            .append("svg")
            .classed("gantt-body-svg", true);

        this.labelLayer = this.bodySvg.append("g").classed("labels", true);
        this.plotLayer = this.bodySvg.append("g").classed("plot", true);
        this.todayLayer = this.plotLayer.append("g").classed("today", true);
        this.barsLayer = this.plotLayer.append("g").classed("bars", true);

        this.axisArea = this.chart
            .append("div")
            .classed("gantt-axis-pin", true);

        this.axisSvg = this.axisArea
            .append("svg")
            .classed("gantt-axis-svg", true);

        this.axisLayer = this.axisSvg.append("g").classed("x-axis", true);
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

            const labelWidth = this.formattingSettings?.labelsCard?.width?.value ?? 160;
            const barHeight = this.formattingSettings?.barsCard?.barHeight?.value ?? 22;
            const rowHeight = barHeight + 8;
            const taskCount = this.viewModel?.tasks?.length ?? 0;
            const layout = computeLayout(
                options.viewport.width,
                options.viewport.height,
                taskCount,
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
        const cornerRadius = this.formattingSettings?.barsCard?.cornerRadius?.value ?? 3;
        const fontSize = this.formattingSettings?.labelsCard?.fontSize?.value ?? 11;
        const fontFamily = this.formattingSettings?.labelsCard?.fontFamily?.value
            ?? "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";

        this.root.style("background", contrast.background);

        this.scrollArea
            .style("height", `${layout.viewportBodyHeight}px`)
            .style("overflow-y", layout.needsScroll ? "auto" : "hidden");

        this.axisArea.style("height", `${layout.axisHeight}px`);

        this.bodySvg
            .attr("width", layout.width)
            .attr("height", layout.contentHeight);

        this.axisSvg
            .attr("width", layout.width)
            .attr("height", layout.axisHeight);

        this.labelLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.plotLayer.attr("transform", `translate(${layout.plotLeft},${layout.plotTop})`);
        this.axisLayer.attr("transform", `translate(${layout.plotLeft},0)`);

        const taskIds = viewModel.tasks.map((t) => t.id);

        let domainStart = viewModel.domainStart;
        let domainEnd = viewModel.domainEnd;
        // Keep today visible on the axis when the reference line is enabled.
        if (showToday) {
            const today = new Date();
            if (today < domainStart) {
                domainStart = today;
            }
            if (today > domainEnd) {
                domainEnd = today;
            }
        }

        const xScale = createTimeScale(domainStart, domainEnd, 0, layout.chartWidth);
        const yScale = createBandScale(
            taskIds,
            0,
            viewModel.tasks.length * layout.rowHeight,
            0.2
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

        renderBottomAxis(this.axisLayer, xScale, viewModel.granularity, textColor);
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
