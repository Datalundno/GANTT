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
import { renderBars, renderTaskLabels } from "./render/bars";
import { getContrastColors } from "./utils/contrast";

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private root: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private message: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private labelLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private plotLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private barsLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
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

        this.svg = this.root
            .append("svg")
            .classed("gantt-svg", true);

        this.labelLayer = this.svg.append("g").classed("labels", true);
        this.plotLayer = this.svg.append("g").classed("plot", true);
        this.barsLayer = this.plotLayer.append("g").classed("bars", true);
        this.axisLayer = this.svg.append("g").classed("x-axis", true);
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

            // On pure resize, reuse the last view model when available.
            if (!isResizeOnly || !this.viewModel) {
                this.viewModel = convertDataView(dataView);
            }

            const width = options.viewport.width;
            const height = options.viewport.height;
            const labelWidth = this.formattingSettings?.labelsCard?.width?.value ?? 160;
            const layout = computeLayout(width, height, labelWidth);
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
        const textColor = contrast.foreground;
        const cornerRadius = this.formattingSettings?.barsCard?.cornerRadius?.value ?? 3;
        const fontSize = this.formattingSettings?.labelsCard?.fontSize?.value ?? 11;
        const fontFamily = this.formattingSettings?.labelsCard?.fontFamily?.value
            ?? "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif";

        this.svg
            .attr("width", layout.width)
            .attr("height", layout.height)
            .style("background", contrast.background);

        this.labelLayer.attr("transform", `translate(0,${layout.plotTop})`);
        this.plotLayer.attr("transform", `translate(${layout.plotLeft},${layout.plotTop})`);
        this.axisLayer.attr("transform", `translate(${layout.plotLeft},${layout.axisY})`);

        const taskIds = viewModel.tasks.map((t) => t.id);
        const xScale = createTimeScale(viewModel.domainStart, viewModel.domainEnd, 0, layout.chartWidth);
        const yScale = createBandScale(taskIds, 0, layout.chartHeight);

        renderTaskLabels(
            this.labelLayer,
            viewModel.tasks,
            yScale,
            layout.labelWidth,
            fontSize,
            fontFamily,
            textColor
        );

        renderBars(this.barsLayer, viewModel.tasks, {
            xScale,
            yScale,
            barFill,
            cornerRadius,
            flaggedStroke: contrast.isHighContrast ? contrast.foreground : "#a80000"
        });

        renderBottomAxis(this.axisLayer, xScale, viewModel.granularity, textColor);
    }

    private showMessage(text: string): void {
        this.svg.style("display", "none");
        this.message
            .style("display", "flex")
            .text(text);
    }

    private hideMessage(): void {
        this.message.style("display", "none").text("");
        this.svg.style("display", null);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public destroy(): void {
        this.root.remove();
        this.viewModel = null;
    }
}
