/** Browser-safe formatter shared by the sheet and its charts. */
export function formatHoursDuration(value: number | null, fallback = '—') {
  if (value === null || !Number.isFinite(value)) return fallback;
  const totalMinutes = Math.max(0, Math.round(value * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  const formattedHours = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 0,
    useGrouping: 'always',
  }).format(hours);
  return minutes === 0 ? `${formattedHours} h` : `${formattedHours} h ${minutes} min`;
}
