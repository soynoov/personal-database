import { parseLauncherHours } from '../lib/game-hours.mjs';
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
  const entries = () => parseLauncherHours(Array.from(rows.querySelectorAll('[data-hour-row]')).map(row => {
    const launcher = (row.querySelector('[data-hour-launcher]') as HTMLInputElement).value;
    const hours = (row.querySelector('[data-hour-hours]') as HTMLInputElement).value;
    const minutes = (row.querySelector('[data-hour-minutes]') as HTMLInputElement).value;
    return { launcher, minutos: !hours && !minutes ? null : Number(hours || 0) * 60 + Number(minutes || 0) };
  }));
  const preview = () => {
    if (!total) return;
    const numbers = Array.from(rows.querySelectorAll('[data-hour-row]')).map(row => {
      const hours = (row.querySelector('[data-hour-hours]') as HTMLInputElement).value;
      const minutes = (row.querySelector('[data-hour-minutes]') as HTMLInputElement).value;
      return !hours && !minutes ? null : Number(hours || 0) * 60 + Number(minutes || 0);
    });
    const known = numbers.filter((value): value is number => value !== null && Number.isFinite(value));
    const sum = known.reduce((value, next) => value + next, 0);
    total.textContent = known.length ? `${Math.floor(sum / 60)} h ${sum % 60} min${known.length < numbers.length ? ' (parcial)' : ''}` : 'Sin registrar';
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
    (rows.lastElementChild?.querySelector('input') as HTMLInputElement)?.focus();
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
