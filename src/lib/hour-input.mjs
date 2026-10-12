/** Both editor formats resolve to the same integer-minute counter. No decimal/minute ambiguity. */
export function decimalHoursToMinutes(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (!/^\d+(?:[.,]\d+)?$/.test(text)) throw new Error('Introduce horas decimales, por ejemplo 837.3 o 837,3.');
  const hours = Number(text.replace(',', '.'));
  if (!Number.isFinite(hours) || hours > 1_000_000) throw new Error('Las horas deben estar entre 0 y 1000000.');
  return Math.round(hours * 60);
}

export function hoursMinutesToMinutes(hours, minutes) {
  const h = String(hours ?? '').trim();
  const m = String(minutes ?? '').trim();
  if (!h && !m) return null;
  if ((h && !/^\d+$/.test(h)) || (m && !/^\d+$/.test(m))) throw new Error('En horas y minutos, introduce números enteros. Para Steam usa horas decimales.');
  if (Number(h) > 1_000_000 || Number(m) > 59) throw new Error('Los minutos deben estar entre 0 y 59.');
  const total = Number(h || 0) * 60 + Number(m || 0);
  if (total > 60_000_000) throw new Error('El contador supera el máximo de horas admitido.');
  return total;
}

// Six decimal places retain every whole-minute value on a round trip.
export function minutesToDecimalHours(minutes) {
  return minutes === null ? '' : String(Number((minutes / 60).toFixed(6)));
}

export function formatMinuteDuration(minutes) {
  return minutes === null ? 'Sin registrar' : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
