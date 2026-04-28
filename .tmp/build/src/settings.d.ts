import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
declare class BinningSettingsCard extends FormattingSettingsCard {
    binMode: formattingSettings.ItemDropdown;
    binCount: formattingSettings.NumUpDown;
    binWidth: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class DataRangeCard extends FormattingSettingsCard {
    useManualXAxis: formattingSettings.ToggleSwitch;
    xAxisMin: formattingSettings.NumUpDown;
    xAxisMax: formattingSettings.NumUpDown;
    manualBinSize: formattingSettings.NumUpDown;
    outlierMode: formattingSettings.ItemDropdown;
    trimPercent: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class BarAppearanceSettingsCard extends FormattingSettingsCard {
    barColor: formattingSettings.ColorPicker;
    barOpacity: formattingSettings.NumUpDown;
    showBorder: formattingSettings.ToggleSwitch;
    borderColor: formattingSettings.ColorPicker;
    borderWidth: formattingSettings.NumUpDown;
    barGap: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class DataLabelSettingsCard extends FormattingSettingsCard {
    showDataLabels: formattingSettings.ToggleSwitch;
    dataLabelType: formattingSettings.ItemDropdown;
    dataLabelColor: formattingSettings.ColorPicker;
    dataLabelFontSize: formattingSettings.NumUpDown;
    showStatsSummary: formattingSettings.ToggleSwitch;
    statsSummaryColor: formattingSettings.ColorPicker;
    statsSummaryFontSize: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class ParetoSettingsCard extends FormattingSettingsCard {
    showParetoLine: formattingSettings.ToggleSwitch;
    paretoLineColor: formattingSettings.ColorPicker;
    paretoLineWidth: formattingSettings.NumUpDown;
    showParetoAxis: formattingSettings.ToggleSwitch;
    paretoLineStyle: formattingSettings.ItemDropdown;
    showParetoMarkers: formattingSettings.ToggleSwitch;
    showParetoLabels: formattingSettings.ToggleSwitch;
    paretoLabelColor: formattingSettings.ColorPicker;
    paretoLabelFontSize: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class AxisCard extends FormattingSettingsCard {
    showXAxis: formattingSettings.ToggleSwitch;
    xAxisTitle: formattingSettings.TextInput;
    xAxisLabelAngle: formattingSettings.NumUpDown;
    showYAxis: formattingSettings.ToggleSwitch;
    yAxisTitle: formattingSettings.TextInput;
    showGridLines: formattingSettings.ToggleSwitch;
    gridLineColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class TooltipSettingsCard extends FormattingSettingsCard {
    showStatistics: formattingSettings.ToggleSwitch;
    showBinRange: formattingSettings.ToggleSwitch;
    showPercentage: formattingSettings.ToggleSwitch;
    showCumulative: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class SelectionSettingsCard extends FormattingSettingsCard {
    enableSelection: formattingSettings.ToggleSwitch;
    multiSelect: formattingSettings.ToggleSwitch;
    selectionColor: formattingSettings.ColorPicker;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class SpecLimitsCard extends FormattingSettingsCard {
    showUSL: formattingSettings.ToggleSwitch;
    uslColor: formattingSettings.ColorPicker;
    uslLineStyle: formattingSettings.ItemDropdown;
    uslThickness: formattingSettings.NumUpDown;
    showLSL: formattingSettings.ToggleSwitch;
    lslColor: formattingSettings.ColorPicker;
    lslLineStyle: formattingSettings.ItemDropdown;
    lslThickness: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class DistributionCurveCard extends FormattingSettingsCard {
    showNormalCurve: formattingSettings.ToggleSwitch;
    normalCurveColor: formattingSettings.ColorPicker;
    normalCurveThickness: formattingSettings.NumUpDown;
    normalCurveLineStyle: formattingSettings.ItemDropdown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    binningSettingsCard: BinningSettingsCard;
    dataRangeCard: DataRangeCard;
    barAppearanceSettingsCard: BarAppearanceSettingsCard;
    dataLabelSettingsCard: DataLabelSettingsCard;
    axisCard: AxisCard;
    specLimitsSettingsCard: SpecLimitsCard;
    distributionCurveCard: DistributionCurveCard;
    paretoSettingsCard: ParetoSettingsCard;
    tooltipSettingsCard: TooltipSettingsCard;
    selectionSettingsCard: SelectionSettingsCard;
    cards: (BinningSettingsCard | DataRangeCard | BarAppearanceSettingsCard | DataLabelSettingsCard | AxisCard | SpecLimitsCard | DistributionCurveCard | ParetoSettingsCard | TooltipSettingsCard | SelectionSettingsCard)[];
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
export declare function getHistogramSettings(formattingSettings: VisualFormattingSettingsModel): HistogramSettings;
export {};
