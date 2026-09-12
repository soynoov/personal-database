import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export async function initReviewRadar() {
  const canvas = document.querySelector<HTMLCanvasElement>('#review-radar');
  if (!canvas || Chart.getChart(canvas)) return;
  await document.fonts.ready;
  const items: { label: string; value: number | null }[] = JSON.parse(canvas.dataset.reviewRadar ?? '[]');
  const style = getComputedStyle(canvas);
  const token = (name: string) => style.getPropertyValue(name).trim();
  const chart = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: items.map((item) => item.label),
      datasets: [{
        label: 'Tu valoración', data: items.map((item) => item.value),
        borderColor: token('--theme-purple'), backgroundColor: token('--chart-fill'),
        borderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
        pointBackgroundColor: token('--theme-purple'),
        fill: items.length >= 3 && items.every((item) => item.value !== null),
        spanGaps: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      scales: { r: {
        min: 0, max: 10,
        ticks: { stepSize: 2, display: false },
        grid: { color: token('--panel-line') }, angleLines: { color: token('--panel-line') },
        pointLabels: { color: token('--muted'), font: { family: token('--font-body'), size: 11 }, padding: 7 },
      } },
      plugins: { tooltip: { callbacks: { label: (context) => ` ${Number(context.raw).toLocaleString('es-ES', { maximumFractionDigits: 1 })} / 10` } } },
    },
  });
  document.addEventListener('astro:before-swap', () => chart.destroy(), { once: true });
}
