# Power BI Histogram Visual

An advanced custom histogram visual for Power BI with Pareto line, interactive selection, and rich tooltips.

## Features

- **Flexible Binning**: Auto (Freedman-Diaconis rule), fixed count, or fixed width binning modes
- **Pareto Line**: Optional cumulative percentage line with customizable markers and labels
- **Interactive Selection**: Click to select bars, Ctrl+Click for multi-select, with cross-filtering support
- **Rich Tooltips**: Display bin range, frequency, percentage, cumulative stats, mean, median, and standard deviation
- **Outlier Handling**: Include all, cap to range, or trim percentage of outliers
- **Customizable Appearance**: Bar colors, borders, gaps, data labels, grid lines, and axis settings
- **Manual Axis Range**: Override auto-scaling with custom min/max values and bin sizes

## Installation

### Option 1: Import the packaged visual

1. Download the `.pbiviz` file from the [dist](dist/) folder
2. In Power BI Desktop, go to **Visualizations** pane
3. Click **More visuals** (three dots) → **Import from file**
4. Select the `.pbiviz` file

### Option 2: Build from source

```bash
# Install dependencies
npm install

# Package the visual
npm run package

# The .pbiviz file will be in the dist/ folder
```

## Usage

1. Import the visual into Power BI (see Installation above)
2. Add a numeric field to the **Values** field well
3. Customize the visual using the formatting pane

## Formatting Options

### Binning
| Setting | Description |
|---------|-------------|
| Binning Mode | Auto, Fixed Count, or Fixed Width |
| Number of Bins | Manual bin count (when using Fixed Count mode) |
| Bin Width | Manual bin width (when using Fixed Width mode) |

### X-Axis Range
| Setting | Description |
|---------|-------------|
| Manual Range | Enable custom axis range |
| Min/Max Value | Custom axis boundaries |
| Bin Size | Manual bin size for custom range |
| Outlier Handling | Include All, Cap to Range, or Trim Percentage |
| Trim % | Percentage to trim from each side |

### Bars
| Setting | Description |
|---------|-------------|
| Bar Color | Fill color for histogram bars |
| Bar Opacity | Transparency level (0-1) |
| Show Border | Toggle bar borders |
| Border Color/Width | Border styling |
| Bar Gap | Gap between bars as percentage |

### Data Labels
| Setting | Description |
|---------|-------------|
| Show Data Labels | Toggle labels above bars |
| Label Type | Frequency, Percentage, or Both |
| Label Color/Size | Label styling |

### Pareto Line
| Setting | Description |
|---------|-------------|
| Show Pareto Line | Toggle cumulative percentage line |
| Line Color/Width | Line styling |
| Show Secondary Axis | Toggle right-side percentage axis |
| Line Style | Solid, Dashed, or Dotted |
| Show Markers/Labels | Toggle line markers and data labels |

### Axis
| Setting | Description |
|---------|-------------|
| Show X/Y Axis | Toggle axis visibility |
| Axis Titles | Custom axis labels |
| X Axis Label Angle | Rotate x-axis labels |
| Show Grid Lines | Toggle horizontal grid lines |

### Tooltip
| Setting | Description |
|---------|-------------|
| Show Statistics | Mean, median, standard deviation |
| Show Bin Range | Display bin boundaries |
| Show Percentage | Display percentage of total |
| Show Cumulative | Display cumulative percentage |

### Selection
| Setting | Description |
|---------|-------------|
| Enable Selection | Allow clicking bars to filter |
| Multi-Select | Enable Ctrl+Click for multiple selections |
| Selection Color | Highlight color for selected bars |

## Development

```bash
# Start dev server (for testing in Power BI Service)
npm start

# Run linting
npm run lint

# Package for distribution
npm run package
```

## Icon Generation

Icons are generated using the `generate-icon.js` script:

```bash
node generate-icon.js
```

This creates histogram icons at multiple sizes (20, 32, 40, 80, 128px) with transparent backgrounds.

## Requirements

- Power BI Desktop (October 2020 or later)
- Power BI Service (for custom visuals)

## License

MIT

## Author

Alex Luo (aluo@wlgore.com)
