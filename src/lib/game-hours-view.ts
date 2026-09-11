export type HoursComparisonPoint = { label: string; value: number; kind: 'personal' | 'reference' | 'economic' };

/** Same values and units as the detail sheet; null never becomes a recorded zero. */
export function getHoursComparisonPoints(payload: {
  myHours?: number | null;
  myHoursLabel?: string;
  benchmarkBars?: Array<{ label: string; value: number }>;
}): HoursComparisonPoint[] {
  const points: HoursComparisonPoint[] = [];
  if (typeof payload.myHours === 'number' && Number.isFinite(payload.myHours) && payload.myHours >= 0) {
    points.push({ label: payload.myHoursLabel || 'Mis horas', value: payload.myHours, kind: 'personal' });
  }
  for (const point of payload.benchmarkBars ?? []) {
    if (!point.label || typeof point.value !== 'number' || !Number.isFinite(point.value) || point.value < 0) continue;
    points.push({ label: point.label, value: point.value, kind: point.label === 'Amortización' ? 'economic' : 'reference' });
  }
  return points;
}
