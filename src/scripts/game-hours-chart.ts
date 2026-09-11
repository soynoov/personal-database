import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, type Plugin } from 'chart.js';
import { getHoursComparisonPoints } from '../lib/game-hours-view';
import { formatHoursDuration } from '../lib/game-duration';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
let hoursChart: Chart<'bar'> | undefined;

export function renderHoursComparison(): void {
  const canvas = document.getElementById('hours-detail-chart');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  let payload;
  try { payload = JSON.parse(canvas.dataset.chart ?? 'null'); } catch { return; }
  if (payload?.type !== 'hours-vs-benchmarks') return;
  const points = getHoursComparisonPoints(payload);
  if (!points.length) return;
  const style = getComputedStyle(canvas);
  const token = (name: string) => style.getPropertyValue(name).trim();
  const text = token('--text');
  const muted = token('--muted');
  const personal = token('--theme-purple');
  const economic = token('--card-foil-gold');
  const colors = points.map(point => point.kind === 'personal' ? personal : point.kind === 'economic' ? economic : muted);
  const narrow = canvas.parentElement!.clientWidth < 480;
  const labelSize = narrow ? 11 : 12;
  const values: Plugin<'bar'> = {
    id: 'hours-direct-values',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.font = `600 ${labelSize}px ${style.fontFamily}`;
      ctx.fillStyle = text;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        ctx.fillText(formatHoursDuration(points[index].value), chartArea.right + (narrow ? 104 : 124), bar.y);
      });
      ctx.restore();
    },
  };
  hoursChart?.destroy();
  hoursChart = new Chart(canvas, {
    type: 'bar',
    plugins: [values],
    data: {
      labels: points.map(point => narrow && point.label.length > 12 ? point.label.split(' ') : point.label),
      datasets: [{ label: 'Horas', data: points.map(point => point.value), backgroundColor: colors, borderWidth: 0, borderRadius: 3, maxBarThickness: 10 }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: { padding: { right: narrow ? 106 : 126 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          backgroundColor: token('--bg-deep'),
          titleColor: text,
          bodyColor: muted,
          borderColor: personal,
          borderWidth: 1,
          callbacks: { label: context => formatHoursDuration(Number(context.parsed.x)) },
        },
      },
      scales: {
        x: {
          min: 0,
          suggestedMax: Math.max(1, ...points.map(point => point.value)) * 1.05,
          border: { display: false },
          grid: { color: token('--line'), drawTicks: false },
          ticks: { color: muted, maxTicksLimit: narrow ? 2 : 4, font: { family: style.fontFamily, size: 10 }, callback: value => `${Number(value).toLocaleString('es-ES')} h` },
        },
        y: {
          border: { display: false },
          grid: { display: false },
          ticks: { color: muted, autoSkip: false, font: { family: style.fontFamily, size: labelSize } },
        },
      },
    },
  });
  canvas.dataset.chartReady = 'true';
  canvas.dataset.pointCount = String(points.length);
}
