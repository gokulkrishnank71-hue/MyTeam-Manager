document.addEventListener('DOMContentLoaded', function () {
  if (!window.Chart) {
    return;
  }

  Chart.defaults.font.family = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
  Chart.defaults.color = '#777b85';

  const gridColor = '#eef0f4';
  const pink = '#df2f73';
  const green = '#43a84b';
  const blue = '#3e92e8';

  function createBarChart(canvasId, chartColor) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
      return;
    }

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [{
          data: [50, 44, 22, 28, 50, 60, 76],
          backgroundColor: chartColor,
          borderRadius: 5,
          borderSkipped: false,
          barThickness: 38
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              label: function (context) {
                return 'Views: ' + context.parsed.y;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: '#d8dce3' },
            ticks: { font: { size: 14 } }
          },
          y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 50, font: { size: 14 } },
            border: { display: false },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  function createLineChart(canvasId, labels, data, tooltipLabel, chartColor) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
      return;
    }

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          borderColor: chartColor,
          backgroundColor: chartColor,
          pointBackgroundColor: chartColor,
          pointBorderColor: chartColor,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          tension: 0.15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: {
              title: function (items) {
                return items[0].label;
              },
              label: function (context) {
                return tooltipLabel + ': ' + context.parsed.y;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: '#d8dce3' },
            ticks: { font: { size: 14 } }
          },
          y: {
            min: 0,
            max: 600,
            ticks: { stepSize: 200, font: { size: 14 } },
            border: { display: false },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  createBarChart('weeklyViewsChart', pink);
  createLineChart('dailySalesChart', ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], [120, 230, 130, 440, 260, 410, 270, 180, 90, 300, 310, 220], 'Sales', green);
  createLineChart('completedTasksChart', ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], [45, 38, 300, 220, 500, 260, 400, 230, 500], 'Tasks', blue);
});
