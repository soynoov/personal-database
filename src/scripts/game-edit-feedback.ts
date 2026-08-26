const STORAGE_KEY = 'personal-db:game-edit-feedback:v1';

type EditFeedback = {
  sectionId: string;
  message: string;
  path: string;
};

export function getMadridToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function finishGameEdit(sectionId: string, message = 'Cambios guardados') {
  const feedback: EditFeedback = {
    sectionId,
    message,
    path: window.location.pathname,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
  const target = new URL(window.location.href);
  target.hash = sectionId;
  window.history.replaceState(null, '', target);
  window.location.reload();
}

export function restoreGameEditFeedback() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  sessionStorage.removeItem(STORAGE_KEY);

  let feedback: EditFeedback;
  try {
    feedback = JSON.parse(raw) as EditFeedback;
  } catch {
    return;
  }
  if (feedback.path !== window.location.pathname) return;

  const target = document.getElementById(feedback.sectionId);
  window.requestAnimationFrame(() => {
    target?.scrollIntoView({ block: 'start', behavior: 'auto' });
    const toast = document.createElement('div');
    toast.className = 'game-save-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = feedback.message;
    document.body.append(toast);
    window.setTimeout(() => toast.classList.add('is-visible'), 20);
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 180);
    }, 3200);
  });
}
