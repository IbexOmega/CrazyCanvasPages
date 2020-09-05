---
---

const chartjs = window.Chart.min;

window.onload = function() {
    generateGraphs();
};

function generateGraphs() {
    // @ts-ignore
    const data = {{ site.data.charts | jsonify }};
    const commitsData = data['commits']

    let ctx = document.getElementById('avgFPSChart').getContext('2d');
    generateGraph(ctx, 'Average FPS', data['AverageFPS'], commitsData);

    ctx = document.getElementById('peakMemUsg').getContext('2d');
    generateGraph(ctx, 'Peak Memory Usage (MB)', data['PeakMemoryUsage'], commitsData);
}

function generateGraph(ctx, title, chartData, commitsData) {
    const tooltips = createTooltips(chartData['commitIDs'], commitsData);
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData['commitIDs'],
            datasets: [
                {
                    data: chartData['rtOn'],
                    label: 'Ray Tracing Enabled',
                    backgroundColor: getRtOnBackgroundColor(ctx),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    data: chartData['rtOff'],
                    label: 'Ray Tracing Disabled',
                    backgroundColor: getRtOffBackgroundColor(ctx),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: title,
                fontSize: 20,
                fontColor: '#f4f4f4'
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: true,
                        fontColor: '#9a9a9a',
                        fontSize: 13,
                        maxRotation: 77,
                        minRotation: 77
                    }
                }],
                yAxes: [{
                    ticks: {
                        fontColor: '#9a9a9a',
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                labels: {
                    fontColor: '#9a9a9a'
                }
            },
            onResize: onChartResize,
            tooltips: {
                mode: 'index',
                callbacks: {
                    afterTitle: function(tooltipItem, _) {
                        return tooltips[tooltipItem[0].index];
                    }
                }
            }
        }
    });
}

function createTooltips(commitIDs, commitData) {
    let tooltips = [];
    for (commitID of commitIDs) {
        let commit = commitData[commitID];
        let localTimestamp = new Date(commit['timestamp']).toString();

        tooltips.push(`${commit['message']}\n${localTimestamp}`)
    }

    return tooltips;
}


function getRtOnBackgroundColor(ctx) {
    const rtOnBackgroundColor = ctx.createLinearGradient(0, 0, 0, ctx.canvas.parentNode.clientHeight);
    rtOnBackgroundColor.addColorStop(0, 'rgba(255, 99, 132, 0.2)');
    rtOnBackgroundColor.addColorStop(1, 'rgba(255, 99, 132, 0.0)');

    return rtOnBackgroundColor;
}

function getRtOffBackgroundColor(ctx) {
    const rtOffBackgroundColor = ctx.createLinearGradient(0, 0, 0, ctx.canvas.parentNode.clientHeight);
    rtOffBackgroundColor.addColorStop(0, 'rgba(54, 162, 235, 0.2)');
    rtOffBackgroundColor.addColorStop(1, 'rgba(54, 162, 235, 0.0)');

    return rtOffBackgroundColor;
}

function onChartResize(chart, _) {
    for (const dataset of chart.data.datasets) {
        if (dataset.label == 'Ray Tracing Enabled') {
            dataset.backgroundColor = getRtOnBackgroundColor(chart.ctx);
        } else {
            dataset.backgroundColor = getRtOffBackgroundColor(chart.ctx);
        }
    }
}
