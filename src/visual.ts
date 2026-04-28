"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";

import * as d3 from "d3";
import type { Selection as D3Selection } from "d3";

import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import ISelectionId = powerbi.visuals.ISelectionId;
import DataView = powerbi.DataView;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel, getHistogramSettings, HistogramSettings } from "./settings";

const MAX_SELECTION_DETAIL = 1000;

interface HistogramBin {
    x0: number;
    x1: number;
    count: number;
    cumulative: number;
    percentage: number;
    cumulativePercentage: number;
    label: string;
    selectionId: ISelectionId;
    valueSelectionIds: ISelectionId[];
    tooltipInfo: VisualTooltipDataItem[];
}

interface ViewModel {
    bins: HistogramBin[];
    maxValue: number;
    totalCount: number;
    originalCount: number;
    assignedCount: number;
    dataValues: number[];
    settings: HistogramSettings;
    isCategorical: boolean;
    hasDetailField: boolean;
    lsl: number | null;
    usl: number | null;
    stats: {
        n: number;
        min: number;
        max: number;
        mean: number;
        median: number;
        stdDev: number;
        cpk: number | null;
    };
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private svg: D3Selection<SVGSVGElement, unknown, null, undefined>;
    private mainGroup: D3Selection<SVGGElement, unknown, null, undefined>;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private selectionManager: powerbi.extensibility.ISelectionManager;
    private host: powerbi.extensibility.visual.IVisualHost;
    private viewModel: ViewModel;
    private margin = { top: 30, right: 60, bottom: 50, left: 50 };

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService);

        this.selectionManager.registerOnSelectCallback(() => {
            this.updateSelectionVisuals();
        });

        this.svg = d3.select(this.target)
            .append("svg")
            .classed("histogram-svg", true);

        this.mainGroup = this.svg.append("g")
            .classed("main-group", true);
    }

    private calculateNiceNumber(range: number, round: boolean): number {
        const exponent = Math.floor(Math.log10(range));
        const fraction = range / Math.pow(10, exponent);
        let niceFraction: number;

        if (round) {
            if (fraction < 1.5) {
                niceFraction = 1;
            } else if (fraction < 3) {
                niceFraction = 2;
            } else if (fraction < 7) {
                niceFraction = 5;
            } else {
                niceFraction = 10;
            }
        } else {
            if (fraction <= 1) {
                niceFraction = 1;
            } else if (fraction <= 2) {
                niceFraction = 2;
            } else if (fraction <= 5) {
                niceFraction = 5;
            } else {
                niceFraction = 10;
            }
        }

        return niceFraction * Math.pow(10, exponent);
    }

    private calculateAutoBins(dataValues: number[]): { binWidth: number; niceMin: number; niceMax: number; numBins: number } {
        const n = dataValues.length;

        // FIX 2: Use loop-based min/max to avoid stack overflow on large arrays
        let min = dataValues[0];
        let max = dataValues[0];
        for (let i = 1; i < n; i++) {
            if (dataValues[i] < min) min = dataValues[i];
            if (dataValues[i] > max) max = dataValues[i];
        }

        const range = max - min;

        const q1 = this.percentile(dataValues, 25);
        const q3 = this.percentile(dataValues, 75);
        const iqr = q3 - q1;

        let binWidth: number;

        if (iqr > 0) {
            binWidth = 2 * iqr / Math.pow(n, 1 / 3);
        } else {
            binWidth = range / Math.pow(n, 1 / 3);
        }

        if (binWidth === 0 || !isFinite(binWidth)) {
            binWidth = range / 10 || 1;
        }

        binWidth = Math.max(binWidth, range / 10000);

        const niceBinWidth = this.calculateNiceNumber(binWidth, true);

        const niceMin = Math.floor(min / niceBinWidth) * niceBinWidth;
        const extendedMax = Math.ceil(max / niceBinWidth) * niceBinWidth;

        const niceRange = extendedMax - niceMin;
        let numBins = Math.round(niceRange / niceBinWidth);
        numBins = Math.max(2, Math.min(numBins, 1000));

        const adjustedBinWidth = niceRange / numBins;

        return {
            binWidth: adjustedBinWidth,
            niceMin,
            niceMax: extendedMax,
            numBins
        };
    }

    private percentile(sortedArr: number[], p: number): number {
        if (sortedArr.length === 0) return 0;
        const index = (p / 100) * (sortedArr.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        if (lower === upper) return sortedArr[lower];
        return sortedArr[lower] * (upper - index) + sortedArr[upper] * (index - lower);
    }

    private extractSpecLimits(dataView: DataView): { lsl: number | null; usl: number | null } {
        let lsl: number | null = null;
        let usl: number | null = null;

        if (dataView.table && dataView.table.rows && dataView.table.rows.length > 0 && dataView.table.columns) {
            const cols = dataView.table.columns;
            for (let c = 0; c < cols.length; c++) {
                const col = cols[c];
                if (!col.roles) continue;
                if (col.roles["USL"] || col.roles["LSL"]) {
                    const row = dataView.table.rows[0];
                    if (row !== undefined && row !== null) {
                        const v = Number(row[c]);
                        if (isFinite(v)) {
                            if (col.roles["USL"]) usl = v;
                            if (col.roles["LSL"]) lsl = v;
                        }
                    }
                }
            }
        } else if (dataView.categorical && dataView.categorical.values && dataView.categorical.values.length > 0) {
            for (const valCol of dataView.categorical.values) {
                if (!valCol || !valCol.source || !valCol.source.roles) continue;
                const roles = valCol.source.roles;
                if (roles["USL"] && valCol.values && valCol.values.length > 0) {
                    const v = Number(valCol.values[0]);
                    if (isFinite(v)) usl = v;
                } else if (roles["LSL"] && valCol.values && valCol.values.length > 0) {
                    const v = Number(valCol.values[0]);
                    if (isFinite(v)) lsl = v;
                }
            }
        }

        return { lsl, usl };
    }

    private computeStats(dataValues: number[], lsl: number | null, usl: number | null) {
        const n = dataValues.length;
        const sorted = [...dataValues].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[n - 1];
        const mean = d3.mean(dataValues) ?? 0;
        const median = d3.median(dataValues) ?? 0;
        const stdDev = d3.deviation(dataValues) ?? 0;

        let effectiveLsl = lsl;
        let effectiveUsl = usl;
        if (effectiveUsl !== null && effectiveLsl !== null && effectiveUsl <= effectiveLsl) {
            effectiveUsl = null;
        }

        let cpk: number | null = null;
        if (effectiveLsl !== null && effectiveUsl !== null) {
            const cpu = stdDev > 0 ? (effectiveUsl - mean) / (3 * stdDev) : 0;
            const cpl = stdDev > 0 ? (mean - effectiveLsl) / (3 * stdDev) : 0;
            cpk = Math.min(cpu, cpl);
        } else if (effectiveLsl !== null) {
            const cpl = stdDev > 0 ? (mean - effectiveLsl) / (3 * stdDev) : 0;
            cpk = cpl;
        } else if (effectiveUsl !== null) {
            const cpu = stdDev > 0 ? (effectiveUsl - mean) / (3 * stdDev) : 0;
            cpk = cpu;
        }

        return { n, min, max, mean, median, stdDev, cpk };
    }

    // FIX 1: fetchMoreData support for segmented data loading
    public update(options: VisualUpdateOptions): void {
        if (!options.dataViews || options.dataViews.length === 0) {
            this.clearVisual();
            return;
        }

        const dataView = options.dataViews[0];

        // Fetch more data if Power BI is sending in segments
        if (dataView.metadata && dataView.metadata.segment) {
            this.host.fetchMoreData(true);
            return; // wait for next update call with more data
        }

        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            dataView
        );

        const settings = getHistogramSettings(this.formattingSettings);
        const viewModel = this.transformData(dataView, settings);

        if (!viewModel) {
            this.clearVisual();
            return;
        }

        this.viewModel = viewModel;
        this.render(viewModel, options.viewport.width, options.viewport.height);
    }

    private isNumericValue(value: any): boolean {
        if (value === null || value === undefined || value === "") return false;
        if (typeof value === "boolean") return false;
        if (typeof value === "number") return isFinite(value);
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed === "") return false;
            return isFinite(Number(trimmed));
        }
        return false;
    }

    private transformData(dataView: DataView, settings: HistogramSettings): ViewModel | null {
        // ── Step 1: Extract raw values from the dataView ──
        const rawValues: any[] = [];
        const rowIndices: number[] = [];
        let hasDetailField = false;

        if (dataView.table && dataView.table.rows && dataView.table.rows.length > 0) {
            // Detect whether the "detail" role is present and find Values column
            let valuesColIdx = -1;
            if (dataView.table.columns) {
                for (let c = 0; c < dataView.table.columns.length; c++) {
                    const col = dataView.table.columns[c];
                    if (col.roles && col.roles["detail"]) {
                        hasDetailField = true;
                    }
                    if (col.roles && col.roles["Values"]) {
                        valuesColIdx = c;
                    }
                }
            }
            // Fallback: if no Values role found, use the last column
            if (valuesColIdx < 0) {
                valuesColIdx = (dataView.table.columns?.length ?? 1) - 1;
            }

            for (let i = 0; i < dataView.table.rows.length; i++) {
                const value = dataView.table.rows[i][valuesColIdx];
                if (value !== null && value !== undefined) {
                    rawValues.push(value);
                    rowIndices.push(i);
                }
            }
        } else if (dataView.categorical && dataView.categorical.values && dataView.categorical.values.length > 0) {
            const values = dataView.categorical.values[0];
            if (values && values.values) {
                for (let i = 0; i < values.values.length; i++) {
                    const value = values.values[i];
                    if (value !== null && value !== undefined) {
                        rawValues.push(value);
                        rowIndices.push(i);
                    }
                }
            }
        } else if (dataView.categorical && dataView.categorical.categories && dataView.categorical.categories.length > 0) {
            const category = dataView.categorical.categories[0];
            for (let i = 0; i < category.values.length; i++) {
                const value = category.values[i];
                if (value !== null && value !== undefined) {
                    rawValues.push(value);
                    rowIndices.push(i);
                }
            }
        }

        if (rawValues.length === 0) {
            return null;
        }

        const originalCount = rawValues.length;

        // ── Step 2: Detect if all values are numeric ──
        const allNumeric = rawValues.every(v => this.isNumericValue(v));

        // ── Step 3: Build selection IDs (FIX 3: skip for large datasets) ──
        const trackSelectionIds = originalCount <= MAX_SELECTION_DETAIL;
        const rowSelectionIds: ISelectionId[] = [];

        if (trackSelectionIds) {
            for (let idx = 0; idx < rawValues.length; idx++) {
                const rowIdx = rowIndices[idx];
                let selId: ISelectionId;

                if (dataView.table && dataView.table.identity && dataView.table.identity[rowIdx]) {
                    selId = this.host.createSelectionIdBuilder()
                        .withTable(dataView.table, rowIdx)
                        .createSelectionId() as ISelectionId;
                } else if (dataView.table && dataView.table.columns && dataView.table.columns[0]) {
                    selId = this.host.createSelectionIdBuilder()
                        .withMeasure(dataView.table.columns[0].queryName || String(rawValues[idx]))
                        .createSelectionId() as ISelectionId;
                } else {
                    selId = this.host.createSelectionIdBuilder()
                        .withMeasure(String(rawValues[idx]))
                        .createSelectionId() as ISelectionId;
                }
                rowSelectionIds.push(selId);
            }
        }

        // ── Step 4: Branch — numeric histogram vs categorical frequency chart ──
        const { lsl, usl } = this.extractSpecLimits(dataView);
        if (allNumeric) {
            return this.buildNumericHistogram(rawValues, rowSelectionIds, originalCount, settings, dataView, hasDetailField, trackSelectionIds, lsl, usl);
        } else {
            return this.buildCategoricalChart(rawValues, rowSelectionIds, originalCount, settings, hasDetailField, trackSelectionIds, lsl, usl);
        }
    }

    private buildNumericHistogram(
        rawValues: any[],
        rowSelectionIds: ISelectionId[],
        originalCount: number,
        settings: HistogramSettings,
        dataView: DataView,
        hasDetailField: boolean,
        trackSelectionIds: boolean,
        lsl: number | null,
        usl: number | null
    ): ViewModel {
        let dataValues: number[] = rawValues.map(v => Number(v));
        let processedValues: number[];
        let dataMin: number;
        let dataMax: number;

        if (settings.useManualXAxis) {
            dataMin = settings.xAxisMin;
            dataMax = settings.xAxisMax;
        } else {
            const extent = d3.extent(dataValues);
            dataMin = extent[0] ?? 0;
            dataMax = extent[1] ?? 0;
        }

        switch (settings.outlierMode) {
            case "trimPercentage":
                const sortedValues = [...dataValues].sort((a, b) => a - b);
                const trimCount = Math.floor(sortedValues.length * (settings.trimPercent / 100));
                processedValues = sortedValues.slice(trimCount, sortedValues.length - trimCount);
                if (!settings.useManualXAxis) {
                    const extent = d3.extent(processedValues);
                    dataMin = extent[0] ?? dataMin;
                    dataMax = extent[1] ?? dataMax;
                }
                break;
            case "capToRange":
                processedValues = dataValues.map(v => Math.max(dataMin, Math.min(dataMax, v)));
                break;
            default:
                processedValues = [...dataValues];
        }

        const dataRange = dataMax - dataMin;

        let binWidth: number;
        let numBins: number;

        if (settings.useManualXAxis) {
            binWidth = Math.max(0.001, settings.manualBinSize);
            numBins = Math.max(2, Math.ceil(dataRange / binWidth));
        } else {
            switch (settings.binMode) {
                case "fixedCount":
                    numBins = Math.max(2, settings.binCount);
                    binWidth = dataRange / numBins;
                    break;
                case "fixedWidth":
                    binWidth = Math.max(0.001, settings.binWidth);
                    numBins = Math.max(2, Math.ceil(dataRange / binWidth));
                    break;
                default:
                    const sortedForAuto = [...processedValues].sort((a, b) => a - b);
                    const autoResult = this.calculateAutoBins(sortedForAuto);
                    dataMin = autoResult.niceMin;
                    dataMax = autoResult.niceMax;
                    binWidth = autoResult.binWidth;
                    numBins = autoResult.numBins;
            }
        }

        const histogramBins: HistogramBin[] = [];
        for (let i = 0; i < numBins; i++) {
            const x0 = dataMin + i * binWidth;
            const x1 = dataMin + (i + 1) * binWidth;
            histogramBins.push({
                x0,
                x1,
                count: 0,
                cumulative: 0,
                percentage: 0,
                cumulativePercentage: 0,
                label: `${x0.toFixed(2)} - ${x1.toFixed(2)}`,
                selectionId: null as unknown as ISelectionId,
                valueSelectionIds: [],
                tooltipInfo: []
            });
        }

        let assignedCount = 0;
        for (let valIdx = 0; valIdx < processedValues.length; valIdx++) {
            const value = processedValues[valIdx];
            if (value >= dataMin && value <= dataMax) {
                let binIndex = Math.floor((value - dataMin) / binWidth);
                binIndex = Math.max(0, Math.min(binIndex, numBins - 1));
                histogramBins[binIndex].count++;
                if (trackSelectionIds) {
                    const selId = rowSelectionIds[valIdx];
                    if (selId) {
                        histogramBins[binIndex].valueSelectionIds.push(selId);
                    }
                }
                assignedCount++;
            } else if (settings.outlierMode === "includeAll") {
                if (value < dataMin) {
                    histogramBins[0].count++;
                    if (trackSelectionIds) {
                        const selId = rowSelectionIds[valIdx];
                        if (selId) {
                            histogramBins[0].valueSelectionIds.push(selId);
                        }
                    }
                } else {
                    histogramBins[numBins - 1].count++;
                    if (trackSelectionIds) {
                        const selId = rowSelectionIds[valIdx];
                        if (selId) {
                            histogramBins[numBins - 1].valueSelectionIds.push(selId);
                        }
                    }
                }
                assignedCount++;
            }
        }

        const totalCount = processedValues.length;
        let cumulative = 0;

        const mean = d3.mean(processedValues);
        const median = d3.median(processedValues);
        const stdDev = d3.deviation(processedValues);

        for (let i = 0; i < histogramBins.length; i++) {
            const bin = histogramBins[i];
            cumulative += bin.count;
            bin.cumulative = cumulative;
            bin.percentage = totalCount > 0 ? (bin.count / totalCount) * 100 : 0;
            bin.cumulativePercentage = totalCount > 0 ? (cumulative / totalCount) * 100 : 0;

            bin.selectionId = this.host.createSelectionIdBuilder()
                .withMeasure(String(i))
                .createSelectionId() as ISelectionId;

            bin.tooltipInfo = this.buildTooltipInfo(
                bin.x0,
                bin.x1,
                bin.count,
                bin.percentage,
                bin.cumulativePercentage,
                mean,
                median,
                stdDev,
                settings,
                bin.label,
                false
            );
        }

        const maxValue = d3.max(histogramBins, d => d.count) ?? 0;

        const stats = this.computeStats(dataValues, lsl, usl);

        return {
            bins: histogramBins,
            maxValue,
            totalCount,
            originalCount,
            assignedCount,
            dataValues,
            settings,
            isCategorical: false,
            hasDetailField,
            lsl,
            usl,
            stats
        };
    }

    private buildCategoricalChart(
        rawValues: any[],
        rowSelectionIds: ISelectionId[],
        originalCount: number,
        settings: HistogramSettings,
        hasDetailField: boolean,
        trackSelectionIds: boolean,
        lsl: number | null,
        usl: number | null
    ): ViewModel {
        const frequencyMap = new Map<string, { count: number; selectionIds: ISelectionId[] }>();

        for (let i = 0; i < rawValues.length; i++) {
            const key = String(rawValues[i]);
            if (!frequencyMap.has(key)) {
                frequencyMap.set(key, { count: 0, selectionIds: [] });
            }
            const entry = frequencyMap.get(key)!;
            entry.count++;
            if (trackSelectionIds) {
                entry.selectionIds.push(rowSelectionIds[i]);
            }
        }

        const sortedEntries = [...frequencyMap.entries()].sort((a, b) => b[1].count - a[1].count);

        const totalCount = rawValues.length;
        let cumulative = 0;

        const histogramBins: HistogramBin[] = [];
        for (let i = 0; i < sortedEntries.length; i++) {
            const [label, entry] = sortedEntries[i];
            cumulative += entry.count;
            const percentage = totalCount > 0 ? (entry.count / totalCount) * 100 : 0;
            const cumulativePercentage = totalCount > 0 ? (cumulative / totalCount) * 100 : 0;

            const bin: HistogramBin = {
                x0: i,
                x1: i + 1,
                count: entry.count,
                cumulative,
                percentage,
                cumulativePercentage,
                label,
                selectionId: this.host.createSelectionIdBuilder()
                    .withMeasure(String(i))
                    .createSelectionId() as ISelectionId,
                valueSelectionIds: entry.selectionIds,
                tooltipInfo: []
            };

            bin.tooltipInfo = this.buildTooltipInfo(
                bin.x0,
                bin.x1,
                bin.count,
                bin.percentage,
                bin.cumulativePercentage,
                undefined,
                undefined,
                undefined,
                settings,
                label,
                true
            );

            histogramBins.push(bin);
        }

        const maxValue = d3.max(histogramBins, d => d.count) ?? 0;

        const dataValues = rawValues.map(v => Number(v)).filter(v => !isNaN(v));
        const stats = dataValues.length > 0 ? this.computeStats(dataValues, lsl, usl) : {
            n: 0, min: 0, max: 0, mean: 0, median: 0, stdDev: 0, cpk: null
        };

        return {
            bins: histogramBins,
            maxValue,
            totalCount,
            originalCount,
            assignedCount: totalCount,
            dataValues,
            settings,
            isCategorical: true,
            hasDetailField,
            lsl,
            usl,
            stats
        };
    }

    private buildTooltipInfo(
        x0: number,
        x1: number,
        count: number,
        percentage: number,
        cumulativePercentage: number,
        mean: number | undefined,
        median: number | undefined,
        stdDev: number | undefined,
        settings: HistogramSettings,
        label: string,
        isCategorical: boolean
    ): VisualTooltipDataItem[] {
        const tooltipItems: VisualTooltipDataItem[] = [];

        if (isCategorical) {
            tooltipItems.push({
                displayName: "Category",
                value: label
            });
        } else if (settings.showBinRange) {
            tooltipItems.push({
                displayName: "Bin Range",
                value: `${x0.toFixed(2)} - ${x1.toFixed(2)}`
            });
        }

        tooltipItems.push({
            displayName: "Frequency",
            value: count.toString()
        });

        if (settings.showPercentage) {
            tooltipItems.push({
                displayName: "Percentage",
                value: `${percentage.toFixed(1)}%`
            });
        }

        if (settings.showCumulative) {
            tooltipItems.push({
                displayName: "Cumulative",
                value: `${cumulativePercentage.toFixed(1)}%`
            });
        }

        if (settings.showStatistics && !isCategorical) {
            tooltipItems.push({
                displayName: "Mean",
                value: mean?.toFixed(2) ?? "N/A"
            });
            tooltipItems.push({
                displayName: "Median",
                value: median?.toFixed(2) ?? "N/A"
            });
            tooltipItems.push({
                displayName: "Std Dev",
                value: stdDev?.toFixed(2) ?? "N/A"
            });
        }

        return tooltipItems;
    }

    private render(viewModel: ViewModel, width: number, height: number): void {
        const { settings, bins, maxValue, totalCount, originalCount, assignedCount, isCategorical, hasDetailField, lsl, usl, stats } = viewModel;

        this.svg
            .attr("width", width)
            .attr("height", height);

        this.mainGroup.selectAll("*").remove();

        // ── Warning banner detection ──
        const showWarning = false;
        const warningHeight = showWarning ? 35 : 0;

        const marginTop = this.margin.top + warningHeight;
        const innerWidth = width - this.margin.left - this.margin.right;
        const innerHeight = height - marginTop - this.margin.bottom;

        const g = this.mainGroup
            .attr("transform", `translate(${this.margin.left},${marginTop})`);

        // ── Render warning banner if needed ──
        if (showWarning) {
            const warningGroup = this.mainGroup.append("g")
                .classed("warning-banner", true)
                .attr("transform", `translate(${this.margin.left},${this.margin.top - 5})`);

            warningGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", innerWidth)
                .attr("height", 28)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("fill", "#FFF3CD")
                .attr("stroke", "#FFD700")
                .attr("stroke-width", 1);

            warningGroup.append("text")
                .attr("x", 8)
                .attr("y", 19)
                .attr("font-size", "12px")
                .attr("fill", "#856404")
                .text("\u26A0");

            warningGroup.append("text")
                .attr("x", 24)
                .attr("y", 18)
                .attr("font-size", "11px")
                .attr("fill", "#856404")
                .attr("font-family", '"Segoe UI", sans-serif')
                .text("Data may be grouped. Add a unique ID (e.g., Sample Number) to the Detail field to show all data points.");
        }

        const firstBin = bins[0];
        const lastBin = bins[bins.length - 1];
        const dataMin = firstBin?.x0 ?? 0;
        const dataMax = lastBin?.x1 ?? 0;

        const xScaleBand = d3.scaleBand<number>()
            .domain(d3.range(bins.length))
            .range([0, innerWidth])
            .padding(settings.barGap);

        const xScaleLinear = d3.scaleLinear()
            .domain([dataMin, dataMax])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([innerHeight, 0]);

        g.append("text")
            .attr("x", innerWidth - 5)
            .attr("y", -10)
            .attr("text-anchor", "end")
            .attr("font-size", "11px")
            .attr("fill", "#666")
            .text(`N=${assignedCount.toLocaleString()}${assignedCount !== originalCount ? ` (of ${originalCount.toLocaleString()})` : ""}`);

        if (settings.showGridLines) {
            g.append("g")
                .classed("grid-lines", true)
                .selectAll("line")
                .data(yScale.ticks(5))
                .enter()
                .append("line")
                .attr("x1", 0)
                .attr("x2", innerWidth)
                .attr("y1", d => yScale(d))
                .attr("y2", d => yScale(d))
                .attr("stroke", settings.gridLineColor)
                .attr("stroke-opacity", 0.5)
                .attr("stroke-dasharray", "3,3");
        }

        if (!isCategorical) {
            const getDashArray = (style: string) => style === "dashed" ? "6,4" : style === "dotted" ? "2,3" : "none";

            if (usl !== null && settings.showUSL) {
                const uslX = xScaleLinear(usl);
                if (uslX >= 0 && uslX <= innerWidth) {
                    g.append("line")
                        .classed("spec-line-usl", true)
                        .attr("x1", uslX)
                        .attr("x2", uslX)
                        .attr("y1", 0)
                        .attr("y2", innerHeight)
                        .attr("stroke", settings.uslColor)
                        .attr("stroke-width", settings.uslThickness)
                        .attr("stroke-dasharray", getDashArray(settings.uslLineStyle));

                    g.append("text")
                        .classed("spec-label-usl", true)
                        .attr("x", uslX + 4)
                        .attr("y", 14)
                        .attr("fill", settings.uslColor)
                        .attr("font-size", "10px")
                        .attr("font-weight", "600")
                        .text(`USL ${usl.toFixed(2)}`);
                }
            }

            if (lsl !== null && settings.showLSL) {
                const lslX = xScaleLinear(lsl);
                if (lslX >= 0 && lslX <= innerWidth) {
                    g.append("line")
                        .classed("spec-line-lsl", true)
                        .attr("x1", lslX)
                        .attr("x2", lslX)
                        .attr("y1", 0)
                        .attr("y2", innerHeight)
                        .attr("stroke", settings.lslColor)
                        .attr("stroke-width", settings.lslThickness)
                        .attr("stroke-dasharray", getDashArray(settings.lslLineStyle));

                    g.append("text")
                        .classed("spec-label-lsl", true)
                        .attr("x", lslX + 4)
                        .attr("y", 14)
                        .attr("fill", settings.lslColor)
                        .attr("font-size", "10px")
                        .attr("font-weight", "600")
                        .text(`LSL ${lsl.toFixed(2)}`);
                }
            }
        }

        if (settings.showStatsSummary && !isCategorical) {
            const fontSize = settings.statsSummaryFontSize;
            const lineH = fontSize * 1.35;
            const padX = 6;
            const padY = 4;
            const boxW = 128;
            const boxH = stats.cpk !== null ? lineH * 7 + padY * 2 : lineH * 6 + padY * 2;

            const statsGroup = g.append("g")
                .classed("stats-summary", true)
                .attr("transform", `translate(${innerWidth - boxW - 4}, 0)`);

            statsGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", boxW)
                .attr("height", boxH)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("fill", "#ffffff")
                .attr("fill-opacity", 0.88)
                .attr("stroke", "#cccccc")
                .attr("stroke-width", 1);

            const textColor = settings.statsSummaryColor;
            const rows: string[] = [
                `n   = ${stats.n.toLocaleString()}`,
                `Min = ${stats.min.toFixed(2)}`,
                `Max = ${stats.max.toFixed(2)}`,
                `Med = ${stats.median.toFixed(2)}`,
                `SD  = ${stats.stdDev.toFixed(2)}`
            ];
            if (stats.cpk !== null) {
                rows.push(`Cpk = ${stats.cpk.toFixed(3)}`);
            }

            rows.forEach((row, i) => {
                statsGroup.append("text")
                    .attr("x", padX)
                    .attr("y", padY + fontSize + i * lineH)
                    .attr("fill", textColor)
                    .attr("font-size", fontSize)
                    .attr("font-family", '"Segoe UI", sans-serif')
                    .text(row);
            });
        }

        const barWidth = xScaleBand.bandwidth();

        const bars = g.append("g")
            .classed("bars", true)
            .selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScaleBand(i) ?? 0)
            .attr("y", d => yScale(d.count))
            .attr("width", Math.max(1, barWidth))
            .attr("height", d => innerHeight - yScale(d.count))
            .attr("fill", settings.barColor)
            .attr("fill-opacity", settings.barOpacity)
            .attr("stroke", settings.showBorder ? settings.borderColor : "none")
            .attr("stroke-width", settings.showBorder ? settings.borderWidth : 0)
            .style("cursor", settings.enableSelection ? "pointer" : "default");

        this.tooltipServiceWrapper.addTooltip(
            bars,
            (datapoint: HistogramBin) => datapoint.tooltipInfo,
            (datapoint: HistogramBin) => datapoint.selectionId
        );

        this.attachBarEvents(bars, viewModel);

        if (settings.showDataLabels) {
            const labels = g.append("g")
                .classed("data-labels", true)
                .selectAll("text")
                .data(bins)
                .enter()
                .append("text");

            labels.attr("x", (d, i) => (xScaleBand(i) ?? 0) + barWidth / 2)
                .attr("y", d => yScale(d.count) - 5)
                .attr("text-anchor", "middle")
                .attr("fill", settings.dataLabelColor)
                .attr("font-size", settings.dataLabelFontSize)
                .attr("font-weight", "500")
                .text(d => {
                    if (settings.dataLabelType === "frequency") {
                        return d.count.toString();
                    } else if (settings.dataLabelType === "percentage") {
                        return `${d.percentage.toFixed(1)}%`;
                    } else {
                        return `${d.count} (${d.percentage.toFixed(1)}%)`;
                    }
                });
        }

        // ── Normal Distribution Curve ──
        if (settings.showNormalCurve && !isCategorical && stats && stats.stdDev > 0) {
            const mean = stats.mean;
            const sd = stats.stdDev;
            const numPoints = 100;
            const normalPdf = (x: number) => (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
            const maxPdf = normalPdf(mean);
            const xMin = dataMin - (dataMax - dataMin) * 0.1;
            const xMax = dataMax + (dataMax - dataMin) * 0.1;

            const curvePoints: { x: number; y: number }[] = [];
            for (let i = 0; i <= numPoints; i++) {
                const xVal = xMin + (xMax - xMin) * (i / numPoints);
                const pdfVal = normalPdf(xVal);
                const yVal = (pdfVal / maxPdf) * maxValue * 1.1;
                curvePoints.push({ x: xVal, y: yVal });
            }

            const yScaleCurve = d3.scaleLinear().domain([0, maxValue * 1.1]).range([innerHeight, 0]);

            const lineGen = d3.line<{ x: number; y: number }>()
                .x(d => xScaleLinear(d.x))
                .y(d => yScaleCurve(d.y))
                .curve(d3.curveBasis);

            const normalDash = settings.normalCurveLineStyle === "dashed" ? "6,4" : settings.normalCurveLineStyle === "dotted" ? "2,3" : "none";

            g.append("path")
                .classed("normal-curve", true)
                .datum(curvePoints)
                .attr("fill", "none")
                .attr("stroke", settings.normalCurveColor)
                .attr("stroke-width", settings.normalCurveThickness)
                .attr("stroke-dasharray", normalDash)
                .attr("d", lineGen);
        }

        // ── X-Axis ──
        if (settings.showXAxis) {
            if (isCategorical) {
                const xScaleCat = d3.scaleBand<string>()
                    .domain(bins.map(b => b.label))
                    .range([0, innerWidth])
                    .padding(settings.barGap);

                const xAxisCat = d3.axisBottom(xScaleCat);

                g.append("g")
                    .classed("x-axis", true)
                    .attr("transform", `translate(0,${innerHeight})`)
                    .call(xAxisCat)
                    .selectAll("text")
                    .attr("transform", `rotate(${settings.xAxisLabelAngle})`)
                    .style("text-anchor", settings.xAxisLabelAngle !== 0 ? "end" : "middle");
            } else {
                const xAxis = d3.axisBottom(xScaleLinear)
                    .ticks(Math.min(bins.length, 10))
                    .tickFormat(d3.format(".2s"));

                g.append("g")
                    .classed("x-axis", true)
                    .attr("transform", `translate(0,${innerHeight})`)
                    .call(xAxis)
                    .selectAll("text")
                    .attr("transform", `rotate(${settings.xAxisLabelAngle})`)
                    .style("text-anchor", settings.xAxisLabelAngle !== 0 ? "end" : "middle");
            }

            if (settings.xAxisTitle) {
                g.append("text")
                    .classed("x-axis-title", true)
                    .attr("x", innerWidth / 2)
                    .attr("y", innerHeight + 40)
                    .attr("text-anchor", "middle")
                    .text(settings.xAxisTitle);
            }
        }

        if (settings.showYAxis) {
            const yAxis = d3.axisLeft(yScale)
                .ticks(5);

            g.append("g")
                .classed("y-axis", true)
                .call(yAxis);

            if (settings.yAxisTitle) {
                g.append("text")
                    .classed("y-axis-title", true)
                    .attr("transform", "rotate(-90)")
                    .attr("x", -innerHeight / 2)
                    .attr("y", -35)
                    .attr("text-anchor", "middle")
                    .text(settings.yAxisTitle);
            }
        }

        if (settings.showParetoLine) {
            this.renderParetoLine(g, bins, innerWidth, innerHeight, settings, xScaleBand, barWidth);
        }

        this.updateSelectionVisuals();
    }

    private renderParetoLine(
        g: D3Selection<SVGGElement, unknown, null, undefined>,
        bins: HistogramBin[],
        innerWidth: number,
        innerHeight: number,
        settings: HistogramSettings,
        xScaleBand: d3.ScaleBand<number>,
        barWidth: number
    ): void {
        const yScalePareto = d3.scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        const getBarCenter = (index: number): number => {
            return (xScaleBand(index) ?? 0) + barWidth / 2;
        };

        const line = d3.line<HistogramBin>()
            .x((d, i) => getBarCenter(i))
            .y(d => yScalePareto(d.cumulativePercentage))
            .curve(d3.curveLinear);

        const dashArray = settings.paretoLineStyle === "dashed" ? "5,5" :
            settings.paretoLineStyle === "dotted" ? "2,2" : "none";

        g.append("path")
            .datum(bins)
            .classed("pareto-line", true)
            .attr("fill", "none")
            .attr("stroke", settings.paretoLineColor)
            .attr("stroke-width", settings.paretoLineWidth)
            .attr("stroke-dasharray", dashArray)
            .attr("d", line);

        if (settings.showParetoMarkers) {
            g.append("g")
                .classed("pareto-markers", true)
                .selectAll("circle")
                .data(bins)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => getBarCenter(i))
                .attr("cy", d => yScalePareto(d.cumulativePercentage))
                .attr("r", 4)
                .attr("fill", settings.paretoLineColor)
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5);
        }

        if (settings.showParetoLabels) {
            g.append("g")
                .classed("pareto-labels", true)
                .selectAll("text")
                .data(bins)
                .enter()
                .append("text")
                .attr("x", (d, i) => getBarCenter(i))
                .attr("y", d => yScalePareto(d.cumulativePercentage) - 8)
                .attr("text-anchor", "middle")
                .attr("fill", settings.paretoLabelColor)
                .attr("font-size", settings.paretoLabelFontSize)
                .attr("font-weight", "500")
                .text(d => `${d.cumulativePercentage.toFixed(0)}%`);
        }

        if (settings.showParetoAxis) {
            const yAxisPareto = d3.axisRight(yScalePareto)
                .ticks(5)
                .tickFormat(d => `${d}%`);

            g.append("g")
                .classed("pareto-axis", true)
                .attr("transform", `translate(${innerWidth},0)`)
                .call(yAxisPareto);
        }
    }

    private attachBarEvents(
        bars: D3Selection<SVGRectElement, HistogramBin, SVGGElement, unknown>,
        viewModel: ViewModel
    ): void {
        const { settings } = viewModel;

        bars.on("mouseover", (event: MouseEvent) => {
            d3.select(event.currentTarget as Element)
                .transition()
                .duration(100)
                .attr("fill-opacity", Math.min(settings.barOpacity + 0.2, 1));
        });

        bars.on("mouseout", (event: MouseEvent) => {
            d3.select(event.currentTarget as Element)
                .transition()
                .duration(100)
                .attr("fill-opacity", settings.barOpacity);
        });

        if (settings.enableSelection) {
            bars.on("click", (event: MouseEvent, d: HistogramBin) => {
                const multiSelect = settings.multiSelect && (event.ctrlKey || event.metaKey);
                const selectedIds = this.selectionManager.getSelectionIds();
                const isCurrentlySelected = selectedIds.some(id => {
                    if (d.valueSelectionIds && d.valueSelectionIds.length > 0) {
                        return d.valueSelectionIds.some(vid => JSON.stringify(vid) === JSON.stringify(id));
                    }
                    return JSON.stringify(d.selectionId) === JSON.stringify(id);
                });

                if (isCurrentlySelected) {
                    this.selectionManager.clear().then(() => {
                        this.updateSelectionVisuals();
                    });
                } else {
                    if (d.valueSelectionIds && d.valueSelectionIds.length > 0) {
                        this.selectionManager.select(d.valueSelectionIds, multiSelect).then(() => {
                            this.updateSelectionVisuals();
                        });
                    } else {
                        this.selectionManager.select(d.selectionId, multiSelect).then(() => {
                            this.updateSelectionVisuals();
                        });
                    }
                }
            });
        }
    }

    private clearVisual(): void {
        this.mainGroup.selectAll("*").remove();
        this.mainGroup.append("text")
            .attr("x", "50%")
            .attr("y", "50%")
            .attr("dominant-baseline", "middle")
            .text("Add data to view histogram");
    }

    private updateSelectionVisuals(): void {
        if (!this.viewModel) {
            return;
        }

        const settings = this.viewModel.settings;
        const selectedIds = this.selectionManager.getSelectionIds();

        d3.selectAll(".bars rect").each(function(d: HistogramBin) {
            const isSelected = selectedIds.some(id => {
                if (d.valueSelectionIds && d.valueSelectionIds.length > 0) {
                    return d.valueSelectionIds.some(vid => JSON.stringify(vid) === JSON.stringify(id));
                }
                return JSON.stringify(d.selectionId) === JSON.stringify(id);
            });

            if (isSelected) {
                d3.select(this as Element)
                    .attr("fill", settings.selectionColor)
                    .attr("fill-opacity", settings.barOpacity);
            } else {
                d3.select(this as Element)
                    .attr("fill", settings.barColor)
                    .attr("fill-opacity", settings.barOpacity);
            }
        });
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}