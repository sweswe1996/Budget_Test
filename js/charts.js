/**
 * BudgetTracker Chart Manager
 * Integrates Chart.js with exact reference styling, custom legends, and donut center text.
 */

window.BudgetTrackerCharts = (() => {
  const chartInstances = {};

  // Destroy existing chart instance safely
  function destroyChart(key) {
    if (chartInstances[key]) {
      try {
        chartInstances[key].destroy();
      } catch (e) {}
      delete chartInstances[key];
    }
    if (typeof Chart !== "undefined") {
      try {
        const existing = Chart.getChart(key);
        if (existing) existing.destroy();
      } catch (e) {}
    }
  }

  // Global Chart.js Defaults
  function applyGlobalDefaults() {
    if (typeof Chart === "undefined") return;
    Chart.defaults.font.family = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.font.size = 11.5;
    Chart.defaults.color = "#64748b";
    Chart.defaults.plugins.tooltip.backgroundColor = "rgba(15, 23, 42, 0.9)";
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: "600" };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
  }

  // 1. Reusable Donut Chart (supports options object or positional args)
  function renderDonutChart(canvasId, param2, param3, param4, param5) {
    destroyChart(canvasId);
    if (typeof Chart === "undefined") return;
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl || typeof canvasEl.getContext !== "function") return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    let labels = [];
    let data = [];
    let colors = [];
    let cutout = "72%";

    if (param2 && typeof param2 === "object" && !Array.isArray(param2)) {
      labels = param2.labels || [];
      data = param2.data || [];
      colors = param2.colors || [];
      cutout = param2.cutout || cutout;
    } else {
      labels = param2 || [];
      data = param3 || [];
      colors = param4 || [];
      cutout = param5 || cutout;
    }

    chartInstances[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const val = ctx.parsed;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${ctx.label}: ¥${val.toLocaleString()} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // 2. Line Chart (supports multi-datasets, responsive scales)
  function renderMonthlyLineChart(canvasId, options = {}) {
    destroyChart(canvasId);
    if (typeof Chart === "undefined") return;
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl || typeof canvasEl.getContext !== "function") return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const labels = options.labels || ["Mar '26", "Apr '26", "May '26", "Jun '26", "Jul '26", "Aug '26"];
    const datasets = options.datasets || [];

    chartInstances[canvasId] = new Chart(ctx, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: options.showLegend !== false, position: "top", align: "start" },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label || ''}: ¥${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => {
                if (val === 0) return "¥0";
                if (val >= 1000000) return `¥${(val / 1000000).toFixed(1)}M`;
                return `¥${Math.round(val / 1000)}K`;
              }
            },
            grid: { color: "#f1f5f9" },
            border: { display: false }
          }
        }
      }
    });
  }

  // 3. Bar Chart (for category budgets and comparisons)
  function renderBarChart(canvasId, options = {}) {
    destroyChart(canvasId);
    if (typeof Chart === "undefined") return;
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl || typeof canvasEl.getContext !== "function") return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const labels = options.labels || [];
    const datasets = options.datasets || [];

    chartInstances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: options.showLegend !== false, position: "top", align: "start" },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label || ''}: ¥${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => val === 0 ? "¥0" : `¥${Math.round(val / 1000)}K`
            },
            grid: { color: "#f1f5f9" },
            border: { display: false }
          }
        }
      }
    });
  }

  // 4. Dual/Grouped Budget vs Actual Bar Chart
  function renderBudgetVsActualBar(canvasId, options = {}) {
    destroyChart(canvasId);
    if (typeof Chart === "undefined") return;
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl || typeof canvasEl.getContext !== "function") return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const categories = options.categories || options.labels || [];
    const budgetData = options.budget || [];
    const actualData = options.actual || [];

    chartInstances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: categories,
        datasets: [
          {
            label: "Budget",
            data: budgetData,
            backgroundColor: "#10b981",
            borderRadius: 4,
            barPercentage: 0.7,
            categoryPercentage: 0.7
          },
          {
            label: "Actual",
            data: actualData,
            backgroundColor: "#f95738",
            borderRadius: 4,
            barPercentage: 0.7,
            categoryPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            align: "end",
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: "circle",
              font: { size: 11, weight: "600" },
              padding: 8
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ¥${Number(ctx.parsed.y || 0).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 10.5 },
              maxRotation: 25,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => val === 0 ? "¥0" : `¥${Math.round(val / 1000)}K`,
              font: { size: 10.5 }
            },
            grid: { color: "rgba(226, 232, 240, 0.6)" },
            border: { display: false }
          }
        }
      }
    });
  }

  return {
    applyGlobalDefaults,
    renderDonutChart,
    renderMonthlyLineChart,
    renderBarChart,
    renderBudgetVsActualBar,
    destroyChart
  };
})();
