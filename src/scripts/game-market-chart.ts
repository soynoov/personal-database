import { CategoryScale, Chart, Filler, LinearScale, LineController, LineElement, PointElement, Tooltip, type Plugin } from 'chart.js';
import { readChartTheme, readCssColors } from './chart-theme';
import type { PriceReference } from '../lib/game-market-view';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);
const charts = new Map<string, Chart>();
const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

/** Ordered reference prices, not a fabricated history or purchase timeline. */
export function renderMarketComparison(canvasId: string) {
  const canvas = document.getElementById(canvasId);
  if (!(canvas instanceof HTMLCanvasElement) || !canvas.getBoundingClientRect().width) return;
  const payload = JSON.parse(canvas.dataset.chart ?? 'null');
  if (payload?.type !== 'price-references') return;
  const points: PriceReference[] = (Array.isArray(payload.points) ? payload.points : [])
    .filter((point: PriceReference) => point.label && typeof point.value === 'number' && Number.isFinite(point.value) && point.value >= 0);
  if (points.length < 2) return;
  const historicLow = typeof payload.historicLow === 'number' && Number.isFinite(payload.historicLow) && payload.historicLow >= 0 ? payload.historicLow : null;
  const theme = readChartTheme(canvas);
  const [gain, loss] = readCssColors(canvas, ['--success', '--danger']);
  const purchaseColor = payload.purchaseState === 'gain' ? gain : payload.purchaseState === 'loss' ? loss : theme.primary;
  charts.get(canvasId)?.destroy();
  const valueLabels: Plugin<'line'> = {
    id: 'price-reference-values',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      chart.getDatasetMeta(0).data.forEach((point, index) => {
        const purchase = points[index].kind === 'purchase';
        ctx.fillStyle = purchase ? purchaseColor : theme.text;
        ctx.font = `${purchase ? 700 : 500} ${purchase ? 13 : 11}px ${theme.font}`;
        ctx.fillText(currency.format(points[index].value), point.x, point.y - (purchase ? 16 : 12));
      });
      ctx.restore();
    },
  };
  const chart = new Chart(canvas, {
    type: 'line', plugins: [valueLabels],
    data: { labels: points.map(point => point.label), datasets: [{
      label: 'Precio por copia', data: points.map(point => point.value),
      borderColor: theme.primary, borderWidth: 2, tension: 0,
      pointRadius: points.map(point => point.kind === 'purchase' ? 8 : 4),
      pointHoverRadius: points.map(point => point.kind === 'purchase' ? 10 : 6),
      pointBorderWidth: points.map(point => point.kind === 'purchase' ? 3 : 2),
      pointBorderColor: points.map(point => point.kind === 'purchase' ? theme.text : theme.primary),
      pointBackgroundColor: points.map(point => point.kind === 'purchase' ? purchaseColor : theme.panel),
      pointHitRadius: 16, fill: true,
      backgroundColor: context => {
        const area = context.chart.chartArea;
        if (!area) return theme.fill;
        const gradient = context.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
        gradient.addColorStop(0, theme.fill); gradient.addColorStop(1, theme.fillEnd);
        return gradient;
      },
    }, ...(historicLow === null ? [] : [{
      label: 'Mínimo histórico', data: points.map(() => historicLow),
      borderColor: theme.muted, borderDash: [5, 5], borderWidth: 1, pointRadius: 0, pointHitRadius: 0, fill: false,
    }])] },
    options: {
      animation: false, responsive: true, maintainAspectRatio: false,
      layout: { padding: { top: 34, right: 14, left: 4 } },
      plugins: { legend: { display: false }, tooltip: {
        filter: item => item.datasetIndex === 0,
        displayColors: false, backgroundColor: theme.panel, borderColor: theme.line, borderWidth: 1,
        titleColor: theme.text, bodyColor: theme.text, padding: 12,
        titleFont: { family: theme.font }, bodyFont: { family: theme.font },
        callbacks: { title: items => points[items[0]?.dataIndex]?.label ?? '', label: ctx => `${currency.format(Number(ctx.parsed.y))} / copia` },
      } },
      scales: {
        x: { offset: true, border: { display: false }, grid: { display: false }, ticks: {
          color: context => points[context.index]?.kind === 'purchase' ? purchaseColor : theme.muted,
          font: context => ({ family: theme.font, size: 11, weight: points[context.index]?.kind === 'purchase' ? 700 : 400 }), maxRotation: 0,
        } },
        y: { beginAtZero: true, suggestedMax: Math.max(...points.map(point => point.value), historicLow ?? 0, 1) * 1.15, border: { display: false }, grid: { color: theme.line }, ticks: { color: theme.muted, maxTicksLimit: 5, font: { family: theme.font, size: 11 }, callback: value => `${value} €` } },
      },
    },
  });
  charts.set(canvasId, chart);
  canvas.dataset.chartReady = 'true';
}
