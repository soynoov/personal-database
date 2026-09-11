export function initAppShell(): void {
  const toggle = document.getElementById('app-menu-toggle');
  const dialog = document.getElementById('app-navigation-menu');
  const desktop = matchMedia('(min-width: 961px)');
  if (!(toggle instanceof HTMLButtonElement) || !(dialog instanceof HTMLDialogElement)) return;
  const update = () => {
    const collapsed = document.documentElement.dataset.sidebar === 'collapsed';
    toggle.setAttribute('aria-label', desktop.matches ? (collapsed ? 'Expandir navegación' : 'Contraer navegación') : 'Abrir navegación');
    toggle.setAttribute('aria-controls', desktop.matches ? 'desktop-navigation' : 'app-navigation-menu');
    toggle.setAttribute('aria-expanded', String(desktop.matches ? !collapsed : dialog.open));
  };
  toggle.addEventListener('click', () => {
    if (desktop.matches) {
      document.documentElement.dataset.sidebar = document.documentElement.dataset.sidebar === 'collapsed' ? 'expanded' : 'collapsed';
      window.dispatchEvent(new Event('resize'));
    } else dialog.showModal();
    update();
  });
  document.getElementById('app-menu-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', update);
  desktop.addEventListener('change', () => { dialog.close(); update(); });
  const search = () => {
    if (document.querySelector('dialog[open], [aria-modal="true"]')) return;
    const input = document.getElementById('search');
    if (input instanceof HTMLInputElement) { input.scrollIntoView({ block: 'center' }); input.focus({ preventScroll: true }); }
    else location.assign('/?focus=search');
  };
  document.getElementById('app-search-command')?.addEventListener('click', search);
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); search(); }
  });
  if (new URL(location.href).searchParams.get('focus') === 'search') search();
  update();
}
