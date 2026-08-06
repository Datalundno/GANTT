"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Formatting cards aligned with capabilities.json.
 */
class BarsCardSettings extends FormattingSettingsCard {
    barHeight = new formattingSettings.NumUpDown({
        name: "barHeight",
        displayName: "Bar height",
        value: 28
    });

    cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner radius",
        value: 4
    });

    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Bar fill",
        value: { value: "#118dff" }
    });

    progressFill = new formattingSettings.ColorPicker({
        name: "progressFill",
        displayName: "Progress fill",
        value: { value: "#0b5cab" }
    });

    name: string = "bars";
    displayName: string = "Bars";
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
        value: 12
    });

    fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font family",
        value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
    });

    width = new formattingSettings.NumUpDown({
        name: "width",
        displayName: "Label pane width",
        value: 200
    });

    name: string = "labels";
    displayName: string = "Task labels";
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
        value: false
    });

    showTodayLine = new formattingSettings.ToggleSwitch({
        name: "showTodayLine",
        displayName: "Show today line",
        value: true
    });

    todayLineColor = new formattingSettings.ColorPicker({
        name: "todayLineColor",
        displayName: "Today line color",
        value: { value: "#e81123" }
    });

    weekendShading = new formattingSettings.ToggleSwitch({
        name: "weekendShading",
        displayName: "Weekend shading",
        value: false
    });

    name: string = "general";
    displayName: string = "General";
    slices: Array<FormattingSettingsSlice> = [
        this.colorByResource,
        this.showTodayLine,
        this.todayLineColor,
        this.weekendShading
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    barsCard = new BarsCardSettings();
    labelsCard = new LabelsCardSettings();
    generalCard = new GeneralCardSettings();

    cards = [this.barsCard, this.labelsCard, this.generalCard];
}
