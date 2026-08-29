const EDIT_TRIGGERS: Record<string, string> = {
  status: 'game-edit-trigger',
  technical: 'data-edit-trigger',
  hours: 'hours-edit-trigger',
  finance: 'money-edit-trigger',
  review: 'metacritic-edit-trigger',
};

export function initGameDetailEditDeeplink() {
  const url = new URL(window.location.href);
  const editTarget = url.searchParams.get('edit');
  if (!editTarget) return;

  const triggerId = EDIT_TRIGGERS[editTarget];
  if (!triggerId) return;

  url.searchParams.delete('edit');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

  requestAnimationFrame(() => {
    document.getElementById(triggerId)?.click();
  });
}
