---
---

const chartjs = window.Chart.min;
let charts = [];

window.onload = function() {
    // Get current date filter
    const dateFilterString = document.getElementById('filterDropdownBtn').innerText;
    const date = dateFilterStringToDate(dateFilterString);

    generateGraphs(date);
};

function generateGraphs(dateFilter) {
    // @ts-ignore
    const data = {{ site.data.charts | jsonify }};

    // Delete existing charts
    for (const chart of charts) {
        chart.destroy();
    }

    charts = [];

    const commitsData = filterCommits(dateFilter, data['commits']);
    const commitIDs = Object.keys(commitsData);

    generateGraph('avgFPS', 'Average FPS', filterChartData(data['AverageFPS'], commitIDs), commitsData);
    generateGraph('peakRAM', 'Peak RAM Usage (MB)', filterChartData(data['PeakRAM'], commitIDs), commitsData);
    generateGraph('peakVRAM', 'Peak VRAM Usage (MB)', filterChartData(data['PeakVRAM'], commitIDs), commitsData);
    generateGraph('avgVRAM', 'Average VRAM Usage (MB)', filterChartData(data['AverageVRAM'], commitIDs), commitsData);
}

function generateGraph(htmlElementID, title, chartData, commitsData) {
    let ctx = document.getElementById(htmlElementID).getContext('2d');

    const tooltips = createTooltips(chartData['commitIDs'], commitsData);
    charts.push(new Chart(ctx, {
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
    }));
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

function onFilterClick(chosenFilter) {
    document.getElementById('filterDropdownBtn').innerText = chosenFilter;
    generateGraphs(dateFilterStringToDate(chosenFilter));
}

function dateFilterStringToDate(filterString) {
    // A filter string consists of a number and a time unit, eg: '2 WEEKS'
    const splitString = filterString.split(' ');
    const numberPart = splitString[0];
    const timeUnit = splitString[1][0]; // Only the first letter in the time unit is of value eg. 'W' for weeks

    const date = new Date();
    switch (timeUnit) {
        case 'D':
            date.setDate(date.getDate() - numberPart);
            break;
        case 'W':
            date.setDate(date.getDate() - numberPart * 7);
            break;
        case 'M':
            date.setMonth(date.getMonth() - numberPart);
            break;
        case 'Y':
            date.setYear(date.getYear() - numberPart);
            break;
    }

    return date;
}

function filterCommits(dateFilter, commitsData) {
    const filteredCommitsData = {};
    for (const [commitID, commitInfo] of Object.entries(commitsData)) {
        const commitDate = new Date(commitInfo['timestamp']);
        if (commitDate >= dateFilter) {
            filteredCommitsData[commitID] = commitInfo;
        }
    }

    return filteredCommitsData;
}

// Returns data points that correspond to the given commit IDs
function filterChartData(chartData, commitIDs) {
    const filteredChartData = {
        'rtOn': [],
        'rtOff': [],
        'commitIDs': []
    };

    const chartDataIDs = chartData['commitIDs'];
    for (let dataIdx = 0; dataIdx < chartDataIDs.length; dataIdx++) {
        if (commitIDs.includes(chartDataIDs[dataIdx])) {
            filteredChartData['rtOn'].push(chartData['rtOn'][dataIdx]);
            filteredChartData['rtOff'].push(chartData['rtOff'][dataIdx]);
            filteredChartData['commitIDs'].push(chartData['commitIDs'][dataIdx]);
        }
    }

    return filteredChartData;
}
