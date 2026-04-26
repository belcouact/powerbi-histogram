"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

class BinningSettingsCard extends FormattingSettingsCard {
    binMode = new formattingSettings.ItemDropdown({
        name: "binMode",
        displayName: "Binning Mode",
        items: [
            { displayName: "Auto", value: "auto" },
            { displayName: "Fixed Count", value: "fixedCount" },
            { displayName: "Fixed Width", value: "fixedWidth" }
        ],
        value: { displayName: "Auto", value: "auto" }
    });

    binCount = new formattingSettings.NumUpDown({
        name: "binCount",
        displayName: "Number of Bins",
        value: 10,
        options: {
            minValue: { value: 2, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 100, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    binWidth = new formattingSettings.NumUpDown({
        name: "binWidth",
        displayName: "Bin Width",
        value: 10,
        options: {
            minValue: { value: 0.01, type: powerbi.visuals.ValidatorType.Min }
        }
    });

    name: string = "binningSettings";
    displayName: string = "Binning";
    slices: Array<FormattingSettingsSlice> = [
        this.binMode,
        this.binCount,
        this.binWidth
    ];
}

class XAxisSettingsCard extends FormattingSettingsCard {
    useManualXAxis = new formattingSettings.ToggleSwitch({
        name: "useManualXAxis",
        displayName: "Manual Range",
        value: false
    });

    xAxisMin = new formattingSettings.NumUpDown({
        name: "xAxisMin",
        displayName: "Min Value",
        value: 0
    });

    xAxisMax = new formattingSettings.NumUpDown({
        name: "xAxisMax",
        displayName: "Max Value",
        value: 100
    });

    manualBinSize = new formattingSettings.NumUpDown({
        name: "manualBinSize",
        displayName: "Bin Size",
        value: 10,
        options: {
            minValue: { value: 0.01, type: powerbi.visuals.ValidatorType.Min }
        }
    });

    outlierMode = new formattingSettings.ItemDropdown({
        name: "outlierMode",
        displayName: "Outlier Handling",
        items: [
            { displayName: "Include All", value: "includeAll" },
            { displayName: "Cap to Range", value: "capToRange" },
            { displayName: "Trim Percentage", value: "trimPercentage" }
        ],
        value: { displayName: "Include All", value: "includeAll" }
    });

    trimPercent = new formattingSettings.NumUpDown({
        name: "trimPercent",
        displayName: "Trim % (each side)",
        value: 5,
        options: {
            minValue: { value: 0, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 25, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "xAxisSettings";
    displayName: string = "X-Axis Range";
    slices: Array<FormattingSettingsSlice> = [
        this.useManualXAxis,
        this.xAxisMin,
        this.xAxisMax,
        this.manualBinSize,
        this.outlierMode,
        this.trimPercent
    ];
}

class BarAppearanceSettingsCard extends FormattingSettingsCard {
    barColor = new formattingSettings.ColorPicker({
        name: "barColor",
        displayName: "Bar Color",
        value: { value: "#4292c6" }
    });

    barOpacity = new formattingSettings.NumUpDown({
        name: "barOpacity",
        displayName: "Bar Opacity",
        value: 80,
        options: {
            minValue: { value: 0, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 100, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    showBorder = new formattingSettings.ToggleSwitch({
        name: "showBorder",
        displayName: "Show Border",
        value: true
    });

    borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "Border Color",
        value: { value: "#2171b5" }
    });

    borderWidth = new formattingSettings.NumUpDown({
        name: "borderWidth",
        displayName: "Border Width",
        value: 1,
        options: {
            minValue: { value: 0, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 5, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    barGap = new formattingSettings.NumUpDown({
        name: "barGap",
        displayName: "Bar Gap (%)",
        value: 10,
        options: {
            minValue: { value: 0, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 50, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "barAppearanceSettings";
    displayName: string = "Bars";
    slices: Array<FormattingSettingsSlice> = [
        this.barColor,
        this.barOpacity,
        this.showBorder,
        this.borderColor,
        this.borderWidth,
        this.barGap
    ];
}

class DataLabelSettingsCard extends FormattingSettingsCard {
    showDataLabels = new formattingSettings.ToggleSwitch({
        name: "showDataLabels",
        displayName: "Show Data Labels",
        value: false
    });

    dataLabelType = new formattingSettings.ItemDropdown({
        name: "dataLabelType",
        displayName: "Label Type",
        items: [
            { displayName: "Frequency", value: "frequency" },
            { displayName: "Percentage", value: "percentage" },
            { displayName: "Both", value: "both" }
        ],
        value: { displayName: "Frequency", value: "frequency" }
    });

    dataLabelColor = new formattingSettings.ColorPicker({
        name: "dataLabelColor",
        displayName: "Label Color",
        value: { value: "#333333" }
    });

    dataLabelFontSize = new formattingSettings.NumUpDown({
        name: "dataLabelFontSize",
        displayName: "Font Size",
        value: 10,
        options: {
            minValue: { value: 6, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 24, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "dataLabelSettings";
    displayName: string = "Data Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.showDataLabels,
        this.dataLabelType,
        this.dataLabelColor,
        this.dataLabelFontSize
    ];
}

class ParetoSettingsCard extends FormattingSettingsCard {
    showParetoLine = new formattingSettings.ToggleSwitch({
        name: "showParetoLine",
        displayName: "Show Pareto Line",
        value: false
    });

    paretoLineColor = new formattingSettings.ColorPicker({
        name: "paretoLineColor",
        displayName: "Line Color",
        value: { value: "#e6550d" }
    });

    paretoLineWidth = new formattingSettings.NumUpDown({
        name: "paretoLineWidth",
        displayName: "Line Width",
        value: 2,
        options: {
            minValue: { value: 1, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 10, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    showParetoAxis = new formattingSettings.ToggleSwitch({
        name: "showParetoAxis",
        displayName: "Show Secondary Axis",
        value: true
    });

    paretoLineStyle = new formattingSettings.ItemDropdown({
        name: "paretoLineStyle",
        displayName: "Line Style",
        items: [
            { displayName: "Solid", value: "solid" },
            { displayName: "Dashed", value: "dashed" },
            { displayName: "Dotted", value: "dotted" }
        ],
        value: { displayName: "Solid", value: "solid" }
    });

    showParetoMarkers = new formattingSettings.ToggleSwitch({
        name: "showParetoMarkers",
        displayName: "Show Markers",
        value: true
    });

    showParetoLabels = new formattingSettings.ToggleSwitch({
        name: "showParetoLabels",
        displayName: "Show Data Labels",
        value: false
    });

    paretoLabelColor = new formattingSettings.ColorPicker({
        name: "paretoLabelColor",
        displayName: "Label Color",
        value: { value: "#e6550d" }
    });

    paretoLabelFontSize = new formattingSettings.NumUpDown({
        name: "paretoLabelFontSize",
        displayName: "Font Size",
        value: 9,
        options: {
            minValue: { value: 6, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 24, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "paretoSettings";
    displayName: string = "Pareto Line";
    slices: Array<FormattingSettingsSlice> = [
        this.showParetoLine,
        this.paretoLineColor,
        this.paretoLineWidth,
        this.showParetoAxis,
        this.paretoLineStyle,
        this.showParetoMarkers,
        this.showParetoLabels,
        this.paretoLabelColor,
        this.paretoLabelFontSize
    ];
}

class AxisSettingsCard extends FormattingSettingsCard {
    showXAxis = new formattingSettings.ToggleSwitch({
        name: "showXAxis",
        displayName: "Show X Axis",
        value: true
    });

    showYAxis = new formattingSettings.ToggleSwitch({
        name: "showYAxis",
        displayName: "Show Y Axis",
        value: true
    });

    xAxisTitle = new formattingSettings.TextInput({
        name: "xAxisTitle",
        displayName: "X Axis Title",
        value: "",
        placeholder: "Enter X axis title"
    });

    yAxisTitle = new formattingSettings.TextInput({
        name: "yAxisTitle",
        displayName: "Y Axis Title",
        value: "Frequency",
        placeholder: "Enter Y axis title"
    });

    xAxisLabelAngle = new formattingSettings.NumUpDown({
        name: "xAxisLabelAngle",
        displayName: "X Axis Label Angle",
        value: 0,
        options: {
            minValue: { value: -90, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 90, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    showGridLines = new formattingSettings.ToggleSwitch({
        name: "showGridLines",
        displayName: "Show Grid Lines",
        value: true
    });

    gridLineColor = new formattingSettings.ColorPicker({
        name: "gridLineColor",
        displayName: "Grid Line Color",
        value: { value: "#e0e0e0" }
    });

    name: string = "axisSettings";
    displayName: string = "Axis";
    slices: Array<FormattingSettingsSlice> = [
        this.showXAxis,
        this.showYAxis,
        this.xAxisTitle,
        this.yAxisTitle,
        this.xAxisLabelAngle,
        this.showGridLines,
        this.gridLineColor
    ];
}

class TooltipSettingsCard extends FormattingSettingsCard {
    showStatistics = new formattingSettings.ToggleSwitch({
        name: "showStatistics",
        displayName: "Show Statistics",
        value: true
    });

    showBinRange = new formattingSettings.ToggleSwitch({
        name: "showBinRange",
        displayName: "Show Bin Range",
        value: true
    });

    showPercentage = new formattingSettings.ToggleSwitch({
        name: "showPercentage",
        displayName: "Show Percentage",
        value: true
    });

    showCumulative = new formattingSettings.ToggleSwitch({
        name: "showCumulative",
        displayName: "Show Cumulative",
        value: true
    });

    name: string = "tooltipSettings";
    displayName: string = "Tooltip";
    slices: Array<FormattingSettingsSlice> = [
        this.showStatistics,
        this.showBinRange,
        this.showPercentage,
        this.showCumulative
    ];
}

class SelectionSettingsCard extends FormattingSettingsCard {
    enableSelection = new formattingSettings.ToggleSwitch({
        name: "enableSelection",
        displayName: "Enable Selection",
        value: true
    });

    multiSelect = new formattingSettings.ToggleSwitch({
        name: "multiSelect",
        displayName: "Multi-Select (Ctrl+Click)",
        value: true
    });

    selectionColor = new formattingSettings.ColorPicker({
        name: "selectionColor",
        displayName: "Selection Color",
        value: { value: "#2171b5" }
    });

    name: string = "selectionSettings";
    displayName: string = "Selection";
    slices: Array<FormattingSettingsSlice> = [
        this.enableSelection,
        this.multiSelect,
        this.selectionColor
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    binningSettingsCard = new BinningSettingsCard();
    xAxisSettingsCard = new XAxisSettingsCard();
    barAppearanceSettingsCard = new BarAppearanceSettingsCard();
    dataLabelSettingsCard = new DataLabelSettingsCard();
    paretoSettingsCard = new ParetoSettingsCard();
    axisSettingsCard = new AxisSettingsCard();
    tooltipSettingsCard = new TooltipSettingsCard();
    selectionSettingsCard = new SelectionSettingsCard();

    cards = [
        this.binningSettingsCard,
        this.xAxisSettingsCard,
        this.barAppearanceSettingsCard,
        this.dataLabelSettingsCard,
        this.paretoSettingsCard,
        this.axisSettingsCard,
        this.tooltipSettingsCard,
        this.selectionSettingsCard
    ];
}

export interface HistogramSettings {
    binMode: "auto" | "fixedCount" | "fixedWidth";
    binCount: number;
    binWidth: number;
    useManualXAxis: boolean;
    xAxisMin: number;
    xAxisMax: number;
    manualBinSize: number;
    outlierMode: "includeAll" | "capToRange" | "trimPercentage";
    trimPercent: number;
    barColor: string;
    barOpacity: number;
    showBorder: boolean;
    borderColor: string;
    borderWidth: number;
    barGap: number;
    showDataLabels: boolean;
    dataLabelType: "frequency" | "percentage" | "both";
    dataLabelColor: string;
    dataLabelFontSize: number;
    showParetoLine: boolean;
    paretoLineColor: string;
    paretoLineWidth: number;
    showParetoAxis: boolean;
    paretoLineStyle: "solid" | "dashed" | "dotted";
    showParetoMarkers: boolean;
    showParetoLabels: boolean;
    paretoLabelColor: string;
    paretoLabelFontSize: number;
    showXAxis: boolean;
    showYAxis: boolean;
    xAxisTitle: string;
    yAxisTitle: string;
    xAxisLabelAngle: number;
    showGridLines: boolean;
    gridLineColor: string;
    showStatistics: boolean;
    showBinRange: boolean;
    showPercentage: boolean;
    showCumulative: boolean;
    enableSelection: boolean;
    multiSelect: boolean;
    selectionColor: string;
}

export function getHistogramSettings(formattingSettings: VisualFormattingSettingsModel): HistogramSettings {
    return {
        binMode: formattingSettings.binningSettingsCard.binMode.value.value as "auto" | "fixedCount" | "fixedWidth",
        binCount: formattingSettings.binningSettingsCard.binCount.value,
        binWidth: formattingSettings.binningSettingsCard.binWidth.value,
        useManualXAxis: formattingSettings.xAxisSettingsCard.useManualXAxis.value,
        xAxisMin: formattingSettings.xAxisSettingsCard.xAxisMin.value,
        xAxisMax: formattingSettings.xAxisSettingsCard.xAxisMax.value,
        manualBinSize: formattingSettings.xAxisSettingsCard.manualBinSize.value,
        outlierMode: formattingSettings.xAxisSettingsCard.outlierMode.value.value as "includeAll" | "capToRange" | "trimPercentage",
        trimPercent: formattingSettings.xAxisSettingsCard.trimPercent.value,
        barColor: formattingSettings.barAppearanceSettingsCard.barColor.value.value,
        barOpacity: formattingSettings.barAppearanceSettingsCard.barOpacity.value / 100,
        showBorder: formattingSettings.barAppearanceSettingsCard.showBorder.value,
        borderColor: formattingSettings.barAppearanceSettingsCard.borderColor.value.value,
        borderWidth: formattingSettings.barAppearanceSettingsCard.borderWidth.value,
        barGap: formattingSettings.barAppearanceSettingsCard.barGap.value / 100,
        showDataLabels: formattingSettings.dataLabelSettingsCard.showDataLabels.value,
        dataLabelType: formattingSettings.dataLabelSettingsCard.dataLabelType.value.value as "frequency" | "percentage" | "both",
        dataLabelColor: formattingSettings.dataLabelSettingsCard.dataLabelColor.value.value,
        dataLabelFontSize: formattingSettings.dataLabelSettingsCard.dataLabelFontSize.value,
        showParetoLine: formattingSettings.paretoSettingsCard.showParetoLine.value,
        paretoLineColor: formattingSettings.paretoSettingsCard.paretoLineColor.value.value,
        paretoLineWidth: formattingSettings.paretoSettingsCard.paretoLineWidth.value,
        showParetoAxis: formattingSettings.paretoSettingsCard.showParetoAxis.value,
        paretoLineStyle: formattingSettings.paretoSettingsCard.paretoLineStyle.value.value as "solid" | "dashed" | "dotted",
        showParetoMarkers: formattingSettings.paretoSettingsCard.showParetoMarkers.value,
        showParetoLabels: formattingSettings.paretoSettingsCard.showParetoLabels.value,
        paretoLabelColor: formattingSettings.paretoSettingsCard.paretoLabelColor.value.value,
        paretoLabelFontSize: formattingSettings.paretoSettingsCard.paretoLabelFontSize.value,
        showXAxis: formattingSettings.axisSettingsCard.showXAxis.value,
        showYAxis: formattingSettings.axisSettingsCard.showYAxis.value,
        xAxisTitle: formattingSettings.axisSettingsCard.xAxisTitle.value,
        yAxisTitle: formattingSettings.axisSettingsCard.yAxisTitle.value,
        xAxisLabelAngle: formattingSettings.axisSettingsCard.xAxisLabelAngle.value,
        showGridLines: formattingSettings.axisSettingsCard.showGridLines.value,
        gridLineColor: formattingSettings.axisSettingsCard.gridLineColor.value.value,
        showStatistics: formattingSettings.tooltipSettingsCard.showStatistics.value,
        showBinRange: formattingSettings.tooltipSettingsCard.showBinRange.value,
        showPercentage: formattingSettings.tooltipSettingsCard.showPercentage.value,
        showCumulative: formattingSettings.tooltipSettingsCard.showCumulative.value,
        enableSelection: formattingSettings.selectionSettingsCard.enableSelection.value,
        multiSelect: formattingSettings.selectionSettingsCard.multiSelect.value,
        selectionColor: formattingSettings.selectionSettingsCard.selectionColor.value.value
    };
}
