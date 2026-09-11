import { CategoryScale, Chart, Filler, LineController, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import { readChartTheme } from './chart-theme';

Chart.register(CategoryScale, Filler, LineController, LineElement, LinearScale, PointElement, Tooltip);

export function initStatisticsCharts() {
  const canvas = document.getElementById('recap-monthly-chart');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const payload: { labels: string[]; values: number[] } = JSON.parse(canvas.dataset.chart ?? '{"labels":[],"values":[]}');
  const theme = readChartTheme(canvas);
  const gradient = canvas.getContext('2d')?.createLinearGradient(0, 0, 0, 280);
  gradient?.addColorStop(0, theme.fill);
  gradient?.addColorStop(1, theme.fillEnd);
  new Chart(canvas, {
    type: 'line',
    data: { labels: payload.labels, datasets: [{
      label: 'Horas', data: payload.values, fill: true,
      backgroundColor: gradient ?? theme.fill, borderColor: theme.primary,
      borderWidth: 2, tension: 0, pointRadius: 3, pointHoverRadius: 5,
      pointBackgroundColor: theme.primary, pointBorderColor: theme.panel,
    }] },
    options: {
      animation: false, responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: theme.panel, borderColor: theme.line, borderWidth: 1, padding: 12,
        titleColor: theme.text, bodyColor: theme.text,
        titleFont: { family: theme.font }, bodyFont: { family: theme.font },
        callbacks: { label: ctx => `${Number(ctx.parsed.y).toLocaleString('es-ES', { maximumFractionDigits: 1 })} h` },
      } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: theme.muted, font: { family: theme.font, size: 11 }, maxRotation: 0 } },
        y: { beginAtZero: true, border: { display: false }, grid: { color: theme.line }, ticks: { color: theme.muted, font: { family: theme.font, size: 11 }, maxTicksLimit: 5, callback: value => `${value} h` } },
      },
    },
  });
}
