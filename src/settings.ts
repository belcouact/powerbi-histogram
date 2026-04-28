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

class DataRangeCard extends FormattingSettingsCard {
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

    name: string = "xAxisRangeSettings";
    displayName: string = "Data Range";
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
        value: { value: "#118DFF" }
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

    showStatsSummary = new formattingSettings.ToggleSwitch({
        name: "showStatsSummary",
        displayName: "Show Stats Summary",
        value: true
    });

    statsSummaryColor = new formattingSettings.ColorPicker({
        name: "statsSummaryColor",
        displayName: "Stats Color",
        value: { value: "#333333" }
    });

    statsSummaryFontSize = new formattingSettings.NumUpDown({
        name: "statsSummaryFontSize",
        displayName: "Stats Font Size",
        value: 9,
        options: {
            minValue: { value: 8, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 20, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "dataLabelSettings";
    displayName: string = "Data Labels & Stats";
    slices: Array<FormattingSettingsSlice> = [
        this.showDataLabels,
        this.dataLabelType,
        this.dataLabelColor,
        this.dataLabelFontSize,
        this.showStatsSummary,
        this.statsSummaryColor,
        this.statsSummaryFontSize
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

class AxisCard extends FormattingSettingsCard {
    showXAxis = new formattingSettings.ToggleSwitch({
        name: "showXAxis",
        displayName: "Show X Axis",
        value: true
    });

    xAxisTitle = new formattingSettings.TextInput({
        name: "xAxisTitle",
        displayName: "X Axis Title",
        value: "",
        placeholder: "Enter X axis title"
    });

    xAxisLabelAngle = new formattingSettings.NumUpDown({
        name: "xAxisLabelAngle",
        displayName: "Label Angle",
        value: 0,
        options: {
            minValue: { value: -90, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 90, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    showYAxis = new formattingSettings.ToggleSwitch({
        name: "showYAxis",
        displayName: "Show Y Axis",
        value: true
    });

    yAxisTitle = new formattingSettings.TextInput({
        name: "yAxisTitle",
        displayName: "Y Axis Title",
        value: "Frequency",
        placeholder: "Enter Y axis title"
    });

    showGridLines = new formattingSettings.ToggleSwitch({
        name: "showGridLines",
        displayName: "Show Grid Lines",
        value: true
    });

    gridLineColor = new formattingSettings.ColorPicker({
        name: "gridLineColor",
        displayName: "Grid Color",
        value: { value: "#e0e0e0" }
    });

    name: string = "axisSettings";
    displayName: string = "Axis";
    slices: Array<FormattingSettingsSlice> = [
        this.showXAxis,
        this.xAxisTitle,
        this.xAxisLabelAngle,
        this.showYAxis,
        this.yAxisTitle,
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
        value: { value: "#E66C37" }
    });

    name: string = "selectionSettings";
    displayName: string = "Selection";
    slices: Array<FormattingSettingsSlice> = [
        this.enableSelection,
        this.multiSelect,
        this.selectionColor
    ];
}

class SpecLimitsCard extends FormattingSettingsCard {
    showUSL = new formattingSettings.ToggleSwitch({
        name: "showUSL",
        displayName: "Show USL Line",
        value: true
    });

    uslColor = new formattingSettings.ColorPicker({
        name: "uslColor",
        displayName: "USL Color",
        value: { value: "#e74c3c" }
    });

    uslLineStyle = new formattingSettings.ItemDropdown({
        name: "uslLineStyle",
        displayName: "USL Line Style",
        items: [
            { displayName: "Solid", value: "solid" },
            { displayName: "Dashed", value: "dashed" },
            { displayName: "Dotted", value: "dotted" }
        ],
        value: { displayName: "Solid", value: "solid" }
    });

    uslThickness = new formattingSettings.NumUpDown({
        name: "uslThickness",
        displayName: "USL Thickness",
        value: 2,
        options: {
            minValue: { value: 1, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 8, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    showLSL = new formattingSettings.ToggleSwitch({
        name: "showLSL",
        displayName: "Show LSL Line",
        value: true
    });

    lslColor = new formattingSettings.ColorPicker({
        name: "lslColor",
        displayName: "LSL Color",
        value: { value: "#27ae60" }
    });

    lslLineStyle = new formattingSettings.ItemDropdown({
        name: "lslLineStyle",
        displayName: "LSL Line Style",
        items: [
            { displayName: "Solid", value: "solid" },
            { displayName: "Dashed", value: "dashed" },
            { displayName: "Dotted", value: "dotted" }
        ],
        value: { displayName: "Solid", value: "solid" }
    });

    lslThickness = new formattingSettings.NumUpDown({
        name: "lslThickness",
        displayName: "LSL Thickness",
        value: 2,
        options: {
            minValue: { value: 1, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 8, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    name: string = "specLimitsSettings";
    displayName: string = "Spec Limits";
    slices: Array<FormattingSettingsSlice> = [
        this.showUSL,
        this.uslColor,
        this.uslLineStyle,
        this.uslThickness,
        this.showLSL,
        this.lslColor,
        this.lslLineStyle,
        this.lslThickness
    ];
}

class DistributionCurveCard extends FormattingSettingsCard {
    showNormalCurve = new formattingSettings.ToggleSwitch({
        name: "showNormalCurve",
        displayName: "Show Normal Curve",
        value: false
    });

    normalCurveColor = new formattingSettings.ColorPicker({
        name: "normalCurveColor",
        displayName: "Curve Color",
        value: { value: "#E74C3C" }
    });

    normalCurveThickness = new formattingSettings.NumUpDown({
        name: "normalCurveThickness",
        displayName: "Curve Thickness",
        value: 2,
        options: {
            minValue: { value: 1, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 8, type: powerbi.visuals.ValidatorType.Max }
        }
    });

    normalCurveLineStyle = new formattingSettings.ItemDropdown({
        name: "normalCurveLineStyle",
        displayName: "Line Style",
        items: [
            { displayName: "Solid", value: "solid" },
            { displayName: "Dashed", value: "dashed" },
            { displayName: "Dotted", value: "dotted" }
        ],
        value: { displayName: "Solid", value: "solid" }
    });

    name: string = "distributionCurveSettings";
    displayName: string = "Normal Curve";
    slices: Array<FormattingSettingsSlice> = [
        this.showNormalCurve,
        this.normalCurveColor,
        this.normalCurveThickness,
        this.normalCurveLineStyle
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    binningSettingsCard = new BinningSettingsCard();
    dataRangeCard = new DataRangeCard();
    barAppearanceSettingsCard = new BarAppearanceSettingsCard();
    dataLabelSettingsCard = new DataLabelSettingsCard();
    axisCard = new AxisCard();
    specLimitsSettingsCard = new SpecLimitsCard();
    distributionCurveCard = new DistributionCurveCard();
    paretoSettingsCard = new ParetoSettingsCard();
    tooltipSettingsCard = new TooltipSettingsCard();
    selectionSettingsCard = new SelectionSettingsCard();

    cards = [
        this.binningSettingsCard,
        this.dataRangeCard,
        this.barAppearanceSettingsCard,
        this.dataLabelSettingsCard,
        this.axisCard,
        this.specLimitsSettingsCard,
        this.distributionCurveCard,
        this.paretoSettingsCard,
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
    showUSL: boolean;
    uslColor: string;
    uslLineStyle: "solid" | "dashed" | "dotted";
    uslThickness: number;
    showLSL: boolean;
    lslColor: string;
    lslLineStyle: "solid" | "dashed" | "dotted";
    lslThickness: number;
    showStatsSummary: boolean;
    statsSummaryColor: string;
    statsSummaryFontSize: number;
    showNormalCurve: boolean;
    normalCurveColor: string;
    normalCurveThickness: number;
    normalCurveLineStyle: "solid" | "dashed" | "dotted";
}

export function getHistogramSettings(formattingSettings: VisualFormattingSettingsModel): HistogramSettings {
    return {
        binMode: formattingSettings.binningSettingsCard.binMode.value.value as "auto" | "fixedCount" | "fixedWidth",
        binCount: formattingSettings.binningSettingsCard.binCount.value,
        binWidth: formattingSettings.binningSettingsCard.binWidth.value,
        useManualXAxis: formattingSettings.dataRangeCard.useManualXAxis.value,
        xAxisMin: formattingSettings.dataRangeCard.xAxisMin.value,
        xAxisMax: formattingSettings.dataRangeCard.xAxisMax.value,
        manualBinSize: formattingSettings.dataRangeCard.manualBinSize.value,
        outlierMode: formattingSettings.dataRangeCard.outlierMode.value.value as "includeAll" | "capToRange" | "trimPercentage",
        trimPercent: formattingSettings.dataRangeCard.trimPercent.value,
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
        showXAxis: formattingSettings.axisCard.showXAxis.value,
        showYAxis: formattingSettings.axisCard.showYAxis.value,
        xAxisTitle: formattingSettings.axisCard.xAxisTitle.value,
        yAxisTitle: formattingSettings.axisCard.yAxisTitle.value,
        xAxisLabelAngle: formattingSettings.axisCard.xAxisLabelAngle.value,
        showGridLines: formattingSettings.axisCard.showGridLines.value,
        gridLineColor: formattingSettings.axisCard.gridLineColor.value.value,
        showStatistics: formattingSettings.tooltipSettingsCard.showStatistics.value,
        showBinRange: formattingSettings.tooltipSettingsCard.showBinRange.value,
        showPercentage: formattingSettings.tooltipSettingsCard.showPercentage.value,
        showCumulative: formattingSettings.tooltipSettingsCard.showCumulative.value,
        enableSelection: formattingSettings.selectionSettingsCard.enableSelection.value,
        multiSelect: formattingSettings.selectionSettingsCard.multiSelect.value,
        selectionColor: formattingSettings.selectionSettingsCard.selectionColor.value.value,
        showUSL: formattingSettings.specLimitsSettingsCard.showUSL.value,
        uslColor: formattingSettings.specLimitsSettingsCard.uslColor.value.value,
        uslLineStyle: formattingSettings.specLimitsSettingsCard.uslLineStyle.value.value as "solid" | "dashed" | "dotted",
        uslThickness: formattingSettings.specLimitsSettingsCard.uslThickness.value,
        showLSL: formattingSettings.specLimitsSettingsCard.showLSL.value,
        lslColor: formattingSettings.specLimitsSettingsCard.lslColor.value.value,
        lslLineStyle: formattingSettings.specLimitsSettingsCard.lslLineStyle.value.value as "solid" | "dashed" | "dotted",
        lslThickness: formattingSettings.specLimitsSettingsCard.lslThickness.value,
        showStatsSummary: formattingSettings.dataLabelSettingsCard.showStatsSummary.value,
        statsSummaryColor: formattingSettings.dataLabelSettingsCard.statsSummaryColor.value.value,
        statsSummaryFontSize: formattingSettings.dataLabelSettingsCard.statsSummaryFontSize.value,
        showNormalCurve: formattingSettings.distributionCurveCard.showNormalCurve.value,
        normalCurveColor: formattingSettings.distributionCurveCard.normalCurveColor.value.value,
        normalCurveThickness: formattingSettings.distributionCurveCard.normalCurveThickness.value,
        normalCurveLineStyle: formattingSettings.distributionCurveCard.normalCurveLineStyle.value.value as "solid" | "dashed" | "dotted"
    };
}
