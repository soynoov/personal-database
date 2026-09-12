import { REVIEW_CRITERIA, REVIEW_STEPS, type ReviewCriterionKey } from '../lib/review-criteria';
import { getReviewProgress } from '../lib/game-reviews';
import type { GameCritique } from '../lib/review-types';
import { editorFetch } from './editor-auth';
import { finishGameEdit } from './game-edit-feedback';

export function initReviewWizard() {
  const dialog = document.querySelector<HTMLDialogElement>('#metacritic-edit-dialog');
  const form = document.querySelector<HTMLFormElement>('#metacritic-edit-form');
  const trigger = document.querySelector<HTMLButtonElement>('#metacritic-edit-trigger');
  if (!dialog || !form || !trigger || form.dataset.ready) return;
  form.dataset.ready = 'true';
  const next = form.querySelector<HTMLButtonElement>('#review-step-next')!;
  const back = form.querySelector<HTMLButtonElement>('#review-step-back')!;
  const submit = form.querySelector<HTMLButtonElement>('#metacritic-edit-submit')!;
  const error = form.querySelector<HTMLElement>('#metacritic-edit-error')!;
  const output = form.querySelector<HTMLOutputElement>('#review-wizard-progress')!;
  const scrollArea = form.querySelector<HTMLElement>('.review-wizard-scroll')!;
  const notice = form.querySelector<HTMLElement>('#review-draft-notice')!;
  const baseRevision = form.dataset.baseRevision ?? 'null';
  const initial: GameCritique | null = JSON.parse(baseRevision);
  const community = form.dataset.community === 'true';
  const key = `noovdb:review:v2:${form.dataset.slug}`;
  let step = 0;
  let saving = false;

  function readAnswers(): GameCritique {
    const data = new FormData(form!);
    const criteria = { ...(initial?.criterios ?? {}) };
    const excluded: ReviewCriterionKey[] = [];
    for (const item of REVIEW_CRITERIA) {
      if (item.key === 'comunidad' && !community) continue;
      const raw = data.get(item.key);
      criteria[item.key] = raw === '' || raw === null || raw === 'na' ? null : Number(raw);
      if (raw === 'na') excluded.push(item.key);
    }
    return { version: 2, criterios: criteria, no_aplica: excluded, original: data.has('original') };
  }

  function sync() {
    const progress = getReviewProgress(readAnswers(), community);
    output.textContent = `${progress.answered.length}/${progress.applicable.length} áreas valoradas${progress.complete ? ' · lista para calcular' : ' · puedes guardar y continuar otro día'}`;
    // No se enseña una nota cambiante al responder: primero la experiencia, después el resultado.
    submit.textContent = saving ? 'Guardando…' : progress.complete ? 'Guardar valoración' : 'Guardar pendientes';
    form!.querySelectorAll<HTMLButtonElement>('[data-review-step-to]').forEach((button) => {
      const index = Number(button.dataset.reviewStepTo);
      if (index === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.disabled = saving;
    });
    form!.querySelectorAll<HTMLElement>('[data-review-step]').forEach((panel) => { panel.hidden = Number(panel.dataset.reviewStep) !== step; });
    back.disabled = step === 0 || saving;
    next.hidden = step === REVIEW_STEPS.length - 1;
    next.disabled = saving;
    submit.hidden = step !== REVIEW_STEPS.length - 1;
    submit.disabled = saving;
  }

  function saveDraft() {
    try { localStorage.setItem(key, JSON.stringify({ version: 2, baseRevision, step, review: readAnswers() })); }
    catch { /* El formulario sigue funcionando si el navegador impide almacenar borradores. */ }
  }
  function removeDraft() { try { localStorage.removeItem(key); } catch { /* Sin almacenamiento disponible. */ } }
  function changeStep(index: number) {
    if (saving) return;
    step = Math.max(0, Math.min(REVIEW_STEPS.length - 1, index));
    sync();
    scrollArea.scrollTop = 0;
    form!.querySelector<HTMLElement>(`[data-review-step="${step}"] h3`)?.focus({ preventScroll: true });
  }

  let draft: { version: number; baseRevision: string; step: number; review: GameCritique } | null = null;
  try {
    draft = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (draft?.version !== 2 || !draft.review?.criterios) draft = null;
  } catch { draft = null; }
  if (draft) {
    notice.hidden = false;
    if (draft.baseRevision !== baseRevision) notice.querySelector('p')!.textContent = 'Hay un borrador de una versión anterior de esta ficha. Si lo recuperas, revisa las respuestas antes de guardar.';
  }
  form.querySelector('#review-draft-restore')?.addEventListener('click', () => {
    if (!draft) return;
    form!.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
      const criterion = REVIEW_CRITERIA.find((item) => item.key === input.name);
      if (!criterion) return;
      const value = draft!.review.criterios?.[criterion.key];
      const excluded = criterion.optional && draft!.review.no_aplica?.includes(criterion.key);
      const target = excluded ? 'na' : typeof value === 'number' && value >= 0 && value <= criterion.max ? String(value) : '';
      input.checked = input.value === target;
    });
    form!.querySelector<HTMLInputElement>('#edit-originalidad')!.checked = draft.review.original === true;
    notice.hidden = true;
    changeStep(Number.isInteger(draft.step) ? draft.step : 0);
  });
  form.querySelector('#review-draft-discard')?.addEventListener('click', () => { removeDraft(); draft = null; notice.hidden = true; });

  trigger.addEventListener('click', () => { error.hidden = true; sync(); dialog.showModal(); });
  form.querySelector('#metacritic-edit-close')?.addEventListener('click', () => { if (!saving) dialog.close(); });
  dialog.addEventListener('cancel', (event) => { if (saving) event.preventDefault(); });
  dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
  next.addEventListener('click', () => changeStep(step + 1));
  back.addEventListener('click', () => changeStep(step - 1));
  form.querySelectorAll<HTMLButtonElement>('[data-review-step-to]').forEach((button) => button.addEventListener('click', () => changeStep(Number(button.dataset.reviewStepTo))));
  form.addEventListener('change', () => { sync(); saveDraft(); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (saving) return;
    if (step !== REVIEW_STEPS.length - 1) { changeStep(step + 1); return; }
    error.hidden = true;
    saveDraft();
    const review = readAnswers();
    saving = true;
    sync();
    form.querySelectorAll<HTMLFieldSetElement>('fieldset').forEach((field) => { field.disabled = true; });
    const original = form.querySelector<HTMLInputElement>('#edit-originalidad')!;
    original.disabled = true;
    try {
      const response = await editorFetch(`/api/games/${encodeURIComponent(form.dataset.slug ?? '')}/edit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ critica_personal: { ...review, base_revision: baseRevision } }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || `No se pudo guardar (HTTP ${response.status}). Tu borrador se conserva en este navegador.`);
      removeDraft();
      try { finishGameEdit('metacritica', 'Valoración guardada'); } catch { window.location.reload(); }
    } catch (reason) {
      error.textContent = reason instanceof Error ? reason.message : 'No se pudo guardar. Tus respuestas se conservan.';
      error.hidden = false;
      error.focus();
      saving = false;
      form.querySelectorAll<HTMLFieldSetElement>('fieldset').forEach((field) => { field.disabled = false; });
      original.disabled = false;
      sync();
    }
  });
  sync();
}
