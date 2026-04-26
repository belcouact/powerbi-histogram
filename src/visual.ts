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

interface HistogramBin {
    x0: number;
    x1: number;
    count: number;
    cumulative: number;
    percentage: number;
    cumulativePercentage: number;
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
        const min = Math.min(...dataValues);
        const max = Math.max(...dataValues);
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

    public update(options: VisualUpdateOptions): void {
        if (!options.dataViews || options.dataViews.length === 0) {
            this.clearVisual();
            return;
        }

        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            options.dataViews[0]
        );

        const settings = getHistogramSettings(this.formattingSettings);
        const viewModel = this.transformData(options.dataViews[0], settings);

        if (!viewModel) {
            this.clearVisual();
            return;
        }

        this.viewModel = viewModel;
        this.render(viewModel, options.viewport.width, options.viewport.height);
    }

    private transformData(dataView: DataView, settings: HistogramSettings): ViewModel | null {
        let dataValues: number[] = [];
        let originalCount = 0;

        if (dataView.categorical && dataView.categorical.categories && dataView.categorical.categories.length > 0) {
            const category = dataView.categorical.categories[0];
            for (let i = 0; i < category.values.length; i++) {
                const value = category.values[i];
                if (value !== null && value !== undefined && !isNaN(Number(value))) {
                    dataValues.push(Number(value));
                }
            }
        } else if (dataView.table && dataView.table.rows && dataView.table.rows.length > 0) {
            for (let i = 0; i < dataView.table.rows.length; i++) {
                const row = dataView.table.rows[i];
                for (let j = 0; j < row.length; j++) {
                    const value = row[j];
                    if (value !== null && value !== undefined && !isNaN(Number(value))) {
                        dataValues.push(Number(value));
                    }
                }
            }
        } else {
            return null;
        }

        if (dataValues.length === 0) {
            return null;
        }

        originalCount = dataValues.length;

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
                selectionId: null as unknown as ISelectionId,
                valueSelectionIds: [],
                tooltipInfo: []
            });
        }

        const valueToSelectionIdMap: Map<number, ISelectionId> = new Map();
        for (let idx = 0; idx < processedValues.length; idx++) {
            const value = processedValues[idx];
            if (!valueToSelectionIdMap.has(value)) {
                if (dataView.categorical && dataView.categorical.categories && dataView.categorical.categories.length > 0) {
                    const category = dataView.categorical.categories[0];
                    const categoryIndex = category.values.indexOf(value);
                    if (categoryIndex >= 0) {
                        valueToSelectionIdMap.set(value, this.host.createSelectionIdBuilder()
                            .withCategory(category, categoryIndex)
                            .createSelectionId() as ISelectionId);
                    } else {
                        valueToSelectionIdMap.set(value, this.host.createSelectionIdBuilder()
                            .withMeasure(String(value))
                            .createSelectionId() as ISelectionId);
                    }
                } else {
                    valueToSelectionIdMap.set(value, this.host.createSelectionIdBuilder()
                        .withMeasure(String(value))
                        .createSelectionId() as ISelectionId);
                }
            }
        }

        let assignedCount = 0;
        for (let valIdx = 0; valIdx < processedValues.length; valIdx++) {
            const value = processedValues[valIdx];
            if (value >= dataMin && value <= dataMax) {
                let binIndex = Math.floor((value - dataMin) / binWidth);
                binIndex = Math.max(0, Math.min(binIndex, numBins - 1));
                histogramBins[binIndex].count++;
                const selId = valueToSelectionIdMap.get(value);
                if (selId && !histogramBins[binIndex].valueSelectionIds.some(existing => JSON.stringify(existing) === JSON.stringify(selId))) {
                    histogramBins[binIndex].valueSelectionIds.push(selId);
                }
                assignedCount++;
            } else if (settings.outlierMode === "includeAll") {
                if (value < dataMin) {
                    histogramBins[0].count++;
                    const selId = valueToSelectionIdMap.get(value);
                    if (selId && !histogramBins[0].valueSelectionIds.some(existing => JSON.stringify(existing) === JSON.stringify(selId))) {
                        histogramBins[0].valueSelectionIds.push(selId);
                    }
                } else {
                    histogramBins[numBins - 1].count++;
                    const selId = valueToSelectionIdMap.get(value);
                    if (selId && !histogramBins[numBins - 1].valueSelectionIds.some(existing => JSON.stringify(existing) === JSON.stringify(selId))) {
                        histogramBins[numBins - 1].valueSelectionIds.push(selId);
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

            if (dataView.categorical && dataView.categorical.categories && dataView.categorical.categories.length > 0) {
                bin.selectionId = this.host.createSelectionIdBuilder()
                    .withCategory(dataView.categorical.categories[0], i)
                    .createSelectionId() as ISelectionId;
            } else {
                bin.selectionId = this.host.createSelectionIdBuilder()
                    .withMeasure(String(i))
                    .createSelectionId() as ISelectionId;
            }

            bin.tooltipInfo = this.buildTooltipInfo(
                bin.x0,
                bin.x1,
                bin.count,
                bin.percentage,
                bin.cumulativePercentage,
                mean,
                median,
                stdDev,
                settings
            );
        }

        const maxValue = d3.max(histogramBins, d => d.count) ?? 0;

        return {
            bins: histogramBins,
            maxValue,
            totalCount,
            originalCount,
            assignedCount,
            dataValues,
            settings
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
        settings: HistogramSettings
    ): VisualTooltipDataItem[] {
        const tooltipItems: VisualTooltipDataItem[] = [];

        if (settings.showBinRange) {
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

        if (settings.showStatistics) {
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
        const { settings, bins, maxValue, totalCount, originalCount, assignedCount } = viewModel;

        this.svg
            .attr("width", width)
            .attr("height", height);

        this.mainGroup.selectAll("*").remove();

        const innerWidth = width - this.margin.left - this.margin.right;
        const innerHeight = height - this.margin.top - this.margin.bottom;

        const g = this.mainGroup
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

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

        if (settings.showXAxis) {
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
