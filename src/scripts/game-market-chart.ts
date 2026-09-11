import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip, type Plugin } from 'chart.js';
import { readChartTheme } from './chart-theme';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
const charts = new Map<string, Chart>();
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
type MarketPoint = { label: string; value: number };

/** Price references are categories, not a chronological price history. */
export function renderMarketComparison(canvasId: string) {
  const canvas = document.getElementById(canvasId);
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const payload = JSON.parse(canvas.dataset.chart ?? 'null');
  if (payload?.type !== 'market-comparison') return;
  const points: MarketPoint[] = (Array.isArray(payload.points) ? payload.points : [])
    .filter((point: MarketPoint) => point.label && point.value !== null && Number.isFinite(Number(point.value)))
    .map((point: MarketPoint) => ({ label: String(point.label), value: Number(point.value) }));
  if (points.length < 2) return;
  const theme = readChartTheme(canvas);
  charts.get(canvasId)?.destroy();
  const valueLabels: Plugin<'bar'> = {
    id: 'market-values',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.fillStyle = theme.text;
      ctx.font = `600 11px ${theme.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        ctx.fillText(currency.format(points[index].value), bar.x, bar.y - 7);
      });
      ctx.restore();
    },
  };
  const chart = new Chart(canvas, {
    type: 'bar', plugins: [valueLabels],
    data: { labels: points.map(point => point.label === 'Mín. histórico' ? ['Mín.', 'histórico'] : point.label), datasets: [{
      label: String(payload.seriesLabel ?? 'Precio'), data: points.map(point => point.value),
      backgroundColor: points.map(point => /Compra|Pagado/i.test(point.label) ? theme.primary : theme.secondary),
      borderWidth: 0, borderRadius: 4, maxBarThickness: 48,
    }] },
    options: {
      animation: false, responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 26, right: 6 } },
      plugins: { legend: { display: false }, tooltip: {
        displayColors: false, backgroundColor: theme.panel, borderColor: theme.line, borderWidth: 1,
        titleColor: theme.text, bodyColor: theme.text, padding: 12,
        titleFont: { family: theme.font }, bodyFont: { family: theme.font },
        callbacks: { title: items => points[items[0]?.dataIndex]?.label ?? '', label: ctx => currency.format(Number(ctx.parsed.y)) },
      } },
      scales: {
        x: { border: { display: false }, grid: { display: false }, ticks: { color: theme.muted, font: { family: theme.font, size: 11 }, maxRotation: 0 } },
        y: { beginAtZero: true, border: { display: false }, grid: { color: theme.line }, ticks: { color: theme.muted, maxTicksLimit: 5, font: { family: theme.font, size: 11 }, callback: value => `${value} €` } },
      },
    },
  });
  charts.set(canvasId, chart);
  canvas.dataset.chartReady = 'true';
}
