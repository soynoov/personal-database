import { parseLauncherHours } from '../lib/game-hours.mjs';
import { decimalHoursToMinutes, hoursMinutesToMinutes, minutesToDecimalHours, formatMinuteDuration } from '../lib/hour-input.mjs';
import { editorFetch } from './editor-auth';
import { finishGameEdit } from './game-edit-feedback';

export function initGameHoursEditor() {
  const trigger = document.getElementById('hours-edit-trigger');
  const dialog = document.getElementById('hours-edit-dialog');
  const form = document.getElementById('hours-edit-form');
  const errorBox = document.getElementById('hours-edit-error');
  const submit = document.getElementById('hours-edit-submit');
  const rows = document.getElementById('hours-launcher-rows');
  const template = document.getElementById('hours-launcher-template');
  const total = document.getElementById('hours-edit-total');
  if (!(trigger instanceof HTMLButtonElement && dialog instanceof HTMLDialogElement && form instanceof HTMLFormElement && errorBox instanceof HTMLElement && submit instanceof HTMLButtonElement && rows instanceof HTMLElement && template instanceof HTMLTemplateElement)) return;
  const originalRows = rows.innerHTML;
  const input = (row: Element, selector: string) => row.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
  const readMinutes = (row: HTMLElement) => row.dataset.inputFormat === 'decimal'
    ? decimalHoursToMinutes(input(row, '[data-hour-decimal]').value)
    : hoursMinutesToMinutes(input(row, '[data-hour-hours]').value, input(row, '[data-hour-minutes]').value);
  const entries = () => parseLauncherHours(Array.from(rows.querySelectorAll<HTMLElement>('[data-hour-row]')).map(row => ({
    launcher: input(row, '[data-hour-launcher]').value,
    etiqueta: input(row, '[data-hour-label]').value,
    minutos: readMinutes(row),
  })));
  const switchFormat = (row: HTMLElement, next: string) => {
    const select = row.querySelector('[data-hour-format]') as HTMLSelectElement;
    try {
      const minutes = readMinutes(row);
      input(row, '[data-hour-decimal]').value = minutesToDecimalHours(minutes);
      input(row, '[data-hour-hours]').value = minutes === null ? '' : String(Math.floor(minutes / 60));
      input(row, '[data-hour-minutes]').value = minutes === null ? '' : String(minutes % 60);
      row.dataset.inputFormat = next;
      select.value = next;
      (row.querySelector('.hour-decimal-field') as HTMLElement).hidden = next !== 'decimal';
      (row.querySelector('.hour-duration-fields') as HTMLElement).hidden = next === 'decimal';
      input(row, '[data-hour-decimal]').disabled = next !== 'decimal';
      input(row, '[data-hour-hours]').disabled = next === 'decimal';
      input(row, '[data-hour-minutes]').disabled = next === 'decimal';
    } catch {
      // Do not erase an invalid edit when switching formats. Correct it first.
      select.value = row.dataset.inputFormat ?? 'duration';
    }
  };
  const preview = () => {
    if (!total) return;
    let invalid = false;
    const numbers = Array.from(rows.querySelectorAll<HTMLElement>('[data-hour-row]')).map(row => {
      const conversion = row.querySelector('[data-hour-conversion]') as HTMLElement;
      try {
        const minutes = readMinutes(row);
        conversion.textContent = `${row.dataset.inputFormat === 'decimal' && minutes !== null ? 'Equivale a ' : ''}${formatMinuteDuration(minutes)}`;
        return minutes;
      } catch (error) {
        invalid = true;
        conversion.textContent = error instanceof Error ? error.message : 'Formato de horas inválido.';
        return null;
      }
    });
    const known = numbers.filter((value): value is number => value !== null && Number.isFinite(value));
    const sum = known.reduce((value, next) => value + next, 0);
    total.textContent = invalid ? 'Revisa el formato de horas' : known.length ? `${formatMinuteDuration(sum)}${known.length < numbers.length ? ' (parcial)' : ''}` : 'Sin registrar';
    rows.querySelectorAll<HTMLButtonElement>('[data-remove-hour]').forEach(button => button.disabled = numbers.length <= 1);
  };
  trigger.addEventListener('click', () => {
    rows.innerHTML = originalRows;
    form.reset();
    errorBox.hidden = true;
    preview();
    dialog.showModal();
  });
  const close = () => dialog.close();
  document.getElementById('hours-edit-close')?.addEventListener('click', close);
  document.getElementById('hours-edit-cancel')?.addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  rows.addEventListener('input', preview);
  rows.addEventListener('change', event => {
    if (!(event.target instanceof Element)) return;
    const row = event.target.closest<HTMLElement>('[data-hour-row]');
    if (!row) return;
    if (event.target.matches('[data-hour-format]')) {
      row.dataset.formatManual = 'true';
      switchFormat(row, (event.target as HTMLSelectElement).value);
    } else if (event.target.matches('[data-hour-launcher]') && row.dataset.formatManual !== 'true') {
      switchFormat(row, input(row, '[data-hour-launcher]').value.trim().toLowerCase() === 'steam' ? 'decimal' : 'duration');
    }
    preview();
  });
  rows.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-remove-hour]') && rows.childElementCount > 1) {
      event.target.closest('[data-hour-row]')?.remove();
      preview();
    }
  });
  document.getElementById('hours-launcher-add')?.addEventListener('click', () => {
    if (rows.childElementCount >= 30) return;
    rows.append(template.content.cloneNode(true));
    (rows.lastElementChild?.querySelector('[data-hour-launcher]') as HTMLSelectElement)?.focus();
    preview();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    errorBox.hidden = true;
    try {
      const counters = entries();
      const data = new FormData(form);
      submit.disabled = true;
      submit.textContent = 'Guardando…';
      const response = await editorFetch(`/api/games/${form.dataset.slug ?? ''}/edit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horas_por_launcher: counters, horas_por_launcher_base: JSON.parse(form.dataset.hoursBase ?? '[]'), horas_estimadas: data.has('horas_estimadas'), fecha_inicio: data.get('fecha_inicio'),
          ...(form.dataset.recurring === 'true' ? {} : { fecha_fin: data.get('fecha_fin') }) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || `HTTP ${response.status}`);
      finishGameEdit('hours', 'Horas por launcher y periodo actualizados');
    } catch (error) {
      errorBox.textContent = error instanceof Error ? error.message : 'No se pudo guardar.';
      errorBox.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Guardar cambios';
    }
  });
}
