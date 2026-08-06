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

/**
 * Formatting cards aligned with capabilities.json.
 */
class BarsCardSettings extends FormattingSettingsCard {
    barHeight = new formattingSettings.NumUpDown({
        name: "barHeight",
        displayName: "Bar height",
        displayNameKey: "Prop_BarHeight",
        value: 28
    });

    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner radius",
        displayNameKey: "Prop_CornerRadius",
        value: 4
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Bar fill",
        displayNameKey: "Prop_BarFill",
        value: { value: "#0ea5e9" }
    });

    progressFill = new formattingSettings.ColorPicker({
        name: "progressFill",
        displayName: "Progress fill",
        displayNameKey: "Prop_ProgressFill",
        value: { value: "#0284c7" }
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
        value: 200
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
        value: { value: "#e81123" }
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
        value: axisLabelFormatItems[0]
    });

    weekendShading = new formattingSettings.ToggleSwitch({
        name: "weekendShading",
        displayName: "Weekend shading",
        displayNameKey: "Prop_WeekendShading",
        value: false
    });

    showTimeWindow = new formattingSettings.ToggleSwitch({
        name: "showTimeWindow",
        displayName: "Show time window",
        displayNameKey: "Prop_ShowTimeWindow",
        description: "Toolbar buttons for 3 / 6 / 9 / 12 months and All. Off by default.",
        value: false
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
        this.weekendShading,
        this.showTimeWindow
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    barsCard = new BarsCardSettings();
    labelsCard = new LabelsCardSettings();
    generalCard = new GeneralCardSettings();

    cards = [this.barsCard, this.labelsCard, this.generalCard];
}
