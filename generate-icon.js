const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createHistogramIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    const padding = size * 0.12;
    const chartWidth = size - padding * 2;
    const chartHeight = size - padding * 2;
    const chartLeft = padding;
    const chartBottom = size - padding;
    const chartTop = padding;
    
    const barCount = 7;
    const barWidth = chartWidth / barCount;
    const barGap = barWidth * 0.12;
    const actualBarWidth = barWidth - barGap;
    
    const barHeights = [0.35, 0.55, 0.85, 0.65, 0.45, 0.25, 0.15];
    
    const maxBarHeight = chartHeight * 0.85;
    
    const gradient = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
    gradient.addColorStop(0, '#4A90D9');
    gradient.addColorStop(1, '#2563A8');
    
    for (let i = 0; i < barCount; i++) {
        const barHeight = barHeights[i] * maxBarHeight;
        const x = chartLeft + i * barWidth + barGap / 2;
        const y = chartBottom - barHeight;
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, actualBarWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();
        
        ctx.strokeStyle = '#1E5090';
        ctx.lineWidth = Math.max(1, size * 0.008);
        ctx.beginPath();
        ctx.roundRect(x, y, actualBarWidth, barHeight, [3, 3, 0, 0]);
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = Math.max(1.5, size * 0.012);
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartTop - 2);
    ctx.lineTo(chartLeft, chartBottom);
    ctx.lineTo(chartLeft + chartWidth + 2, chartBottom);
    ctx.stroke();
    
    const tickSize = Math.max(2, size * 0.02);
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = Math.max(1, size * 0.008);
    
    for (let i = 0; i <= barCount; i++) {
        const x = chartLeft + i * barWidth;
        ctx.beginPath();
        ctx.moveTo(x, chartBottom);
        ctx.lineTo(x, chartBottom + tickSize);
        ctx.stroke();
    }
    
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
        const y = chartBottom - (i / yTicks) * maxBarHeight;
        ctx.beginPath();
        ctx.moveTo(chartLeft - tickSize, y);
        ctx.lineTo(chartLeft, y);
        ctx.stroke();
    }
    
    return canvas;
}

const sizes = [
    { size: 20, name: 'icon20.png' },
    { size: 32, name: 'icon32.png' },
    { size: 40, name: 'icon40.png' },
    { size: 80, name: 'icon80.png' },
    { size: 128, name: 'icon128.png' }
];

sizes.forEach(({ size, name }) => {
    const canvas = createHistogramIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(__dirname, 'assets', name);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Created ${name} (${size}x${size})`);
});

const mainCanvas = createHistogramIcon(128);
const mainBuffer = mainCanvas.toBuffer('image/png');
const mainOutputPath = path.join(__dirname, 'assets', 'icon.png');
fs.writeFileSync(mainOutputPath, mainBuffer);
console.log('Created icon.png (128x128)');

console.log('All histogram icons created successfully!');
