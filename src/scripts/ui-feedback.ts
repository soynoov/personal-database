/** Presentation-only states: no requests and no changes to editor behaviour. */
export function initUiFeedback() {
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement>('[data-edit-target]')?.dataset.editTarget;
    if (target) document.getElementById(target)?.click();
  });
  document.querySelectorAll<HTMLDialogElement>('dialog.edit-dialog, dialog.editor-auth').forEach(dialog => {
    const heading = dialog.querySelector('h2');
    if (heading && !dialog.hasAttribute('aria-labelledby')) {
      heading.id ||= `${dialog.id}-title`;
      dialog.setAttribute('aria-labelledby', heading.id);
    }
    dialog.querySelectorAll<HTMLElement>('[class$="-error"]').forEach(error => error.setAttribute('role', 'alert'));
    dialog.querySelectorAll<HTMLFormElement>('form').forEach(form => {
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (!submit) return;
      const sync = () => {
        const busy = submit.disabled;
        form.setAttribute('aria-busy', String(busy));
        submit.setAttribute('aria-busy', String(busy));
      };
      new MutationObserver(sync).observe(submit, { attributes: true, attributeFilter: ['disabled'] });
      sync();
    });
  });
}
