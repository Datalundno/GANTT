"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import powerbi from "powerbi-visuals-api";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

const axisGranularityItems: powerbi.IEnumMember[] = [
    { value: "auto", displayName: "Auto" },
    { value: "day", displayName: "Day" },
    { value: "week", displayName: "Week" },
    { value: "month", displayName: "Month" },
    { value: "quarter", displayName: "Quarter" }
];

const axisLabelFormatItems: powerbi.IEnumMember[] = [
    { value: "date", displayName: "Date" },
    { value: "week", displayName: "Week number" },
    { value: "both", displayName: "Week + date" }
];

class BarsCardSettings extends FormattingSettingsCard {
    barHeight = new formattingSettings.NumUpDown({
        name: "barHeight",
        displayName: "Bar height",
        displayNameKey: "Prop_BarHeight",
        value: 22
    });

    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner radius",
        displayNameKey: "Prop_CornerRadius",
        value: 3
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Bar fill",
        displayNameKey: "Prop_BarFill",
        value: { value: "#0E7490" }
    });

    progressFill = new formattingSettings.ColorPicker({
        name: "progressFill",
        displayName: "Progress fill",
        displayNameKey: "Prop_ProgressFill",
        value: { value: "#22D3EE" }
    });

    name: string = "bars";
    displayName: string = "Bars";
    displayNameKey: string = "Objects_Bars";
    slices: Array<FormattingSettingsSlice> = [
        this.barHeight,
        this.cornerRadius,
        this.fill,
        this.progressFill
    ];
}

class LabelsCardSettings extends FormattingSettingsCard {
    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font size",
        displayNameKey: "Prop_FontSize",
        value: 12
    });

    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font family",
        displayNameKey: "Prop_FontFamily",
        value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });

    width = new formattingSettings.NumUpDown({
        name: "width",
        displayName: "Label pane width",
        displayNameKey: "Prop_LabelWidth",
        value: 210
    });

    name: string = "labels";
    displayName: string = "Task labels";
    displayNameKey: string = "Objects_Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.fontSize,
        this.fontFamily,
        this.width
    ];
}

class GeneralCardSettings extends FormattingSettingsCard {
    colorByResource = new formattingSettings.ToggleSwitch({
        name: "colorByResource",
        displayName: "Color by resource",
        displayNameKey: "Prop_ColorByResource",
        value: false
    });

    showTodayLine = new formattingSettings.ToggleSwitch({
        name: "showTodayLine",
        displayName: "Show today line",
        displayNameKey: "Prop_ShowTodayLine",
        value: true
    });

    todayLineColor = new formattingSettings.ColorPicker({
        name: "todayLineColor",
        displayName: "Today line color",
        displayNameKey: "Prop_TodayLineColor",
        value: { value: "#F59E0B" }
    });

    axisGranularity = new formattingSettings.ItemDropdown({
        name: "axisGranularity",
        displayName: "Axis granularity",
        displayNameKey: "Prop_AxisGranularity",
        items: axisGranularityItems,
        value: axisGranularityItems[0]
    });

    axisLabelFormat = new formattingSettings.ItemDropdown({
        name: "axisLabelFormat",
        displayName: "Axis labels",
        displayNameKey: "Prop_AxisLabels",
        items: axisLabelFormatItems,
        value: axisLabelFormatItems[2]
    });

    weekendShading = new formattingSettings.ToggleSwitch({
        name: "weekendShading",
        displayName: "Weekend shading",
        displayNameKey: "Prop_WeekendShading",
        value: true
    });

    name: string = "general";
    displayName: string = "General";
    displayNameKey: string = "Objects_General";
    slices: Array<FormattingSettingsSlice> = [
        this.colorByResource,
        this.showTodayLine,
        this.todayLineColor,
        this.axisGranularity,
        this.axisLabelFormat,
        this.weekendShading
    ];
}

class LabCardSettings extends FormattingSettingsCard {
    showToolbar = new formattingSettings.ToggleSwitch({
        name: "showToolbar",
        displayName: "Show toolbar",
        displayNameKey: "Prop_ShowToolbar",
        value: true
    });

    showCockpit = new formattingSettings.ToggleSwitch({
        name: "showCockpit",
        displayName: "Show cockpit panels",
        displayNameKey: "Prop_ShowCockpit",
        description: "Resource load and task list beside/below the Gantt (Lab).",
        value: true
    });

    showBaseline = new formattingSettings.ToggleSwitch({
        name: "showBaseline",
        displayName: "Show planned bars",
        displayNameKey: "Prop_ShowBaseline",
        value: true
    });

    showDependencies = new formattingSettings.ToggleSwitch({
        name: "showDependencies",
        displayName: "Show dependencies",
        displayNameKey: "Prop_ShowDependencies",
        value: true
    });

    colorByStatus = new formattingSettings.ToggleSwitch({
        name: "colorByStatus",
        displayName: "Color by status",
        displayNameKey: "Prop_ColorByStatus",
        value: false
    });

    showStatusLegend = new formattingSettings.ToggleSwitch({
        name: "showStatusLegend",
        displayName: "Show status legend",
        displayNameKey: "Prop_ShowStatusLegend",
        value: false
    });

    showProgress = new formattingSettings.ToggleSwitch({
        name: "showProgress",
        displayName: "Show progress",
        displayNameKey: "Prop_ShowProgress",
        value: false
    });

    enhancedGraphics = new formattingSettings.ToggleSwitch({
        name: "fancyGraphics",
        displayName: "Rounded bars",
        displayNameKey: "Prop_FancyGraphics",
        value: false
    });

    animateBars = new formattingSettings.ToggleSwitch({
        name: "animateBars",
        displayName: "Animate bars",
        displayNameKey: "Prop_AnimateBars",
        value: false
    });

    showMonthGrid = new formattingSettings.ToggleSwitch({
        name: "showMonthGrid",
        displayName: "Month grid",
        displayNameKey: "Prop_ShowMonthGrid",
        value: false
    });

    name: string = "lab";
    displayName: string = "Lab";
    displayNameKey: string = "Objects_Lab";
    slices: Array<FormattingSettingsSlice> = [
        this.showToolbar,
        this.showCockpit,
        this.showBaseline,
        this.showDependencies,
        this.colorByStatus,
        this.showStatusLegend,
        this.showProgress,
        this.enhancedGraphics,
        this.animateBars,
        this.showMonthGrid
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    barsCard = new BarsCardSettings();
    labelsCard = new LabelsCardSettings();
    generalCard = new GeneralCardSettings();
    labCard = new LabCardSettings();

    cards = [this.barsCard, this.labelsCard, this.generalCard, this.labCard];
}
