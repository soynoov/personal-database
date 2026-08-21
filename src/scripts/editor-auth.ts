let dialog: HTMLDialogElement | null = null;
let form: HTMLFormElement | null = null;
let passwordInput: HTMLInputElement | null = null;
let errorBox: HTMLElement | null = null;
let submitButton: HTMLButtonElement | null = null;
let accessPromise: Promise<boolean> | null = null;
let resolveAccess: ((authorized: boolean) => void) | null = null;

function finishAccessRequest(authorized: boolean) {
  const resolver = resolveAccess;
  resolveAccess = null;
  accessPromise = null;
  resolver?.(authorized);
}

function requestEditorAccess() {
  if (!dialog || !form || !passwordInput || !errorBox || !submitButton) {
    return Promise.resolve(false);
  }
  if (accessPromise) return accessPromise;

  form.reset();
  errorBox.hidden = true;
  errorBox.textContent = "";
  submitButton.disabled = false;
  submitButton.textContent = "Desbloquear";

  accessPromise = new Promise<boolean>((resolve) => {
    resolveAccess = resolve;
  });
  dialog.showModal();
  window.setTimeout(() => passwordInput?.focus(), 0);
  return accessPromise;
}

export function initEditorAuthDialog() {
  const nextDialog = document.getElementById("editor-auth-dialog");
  const nextForm = document.getElementById("editor-auth-form");
  const nextPassword = document.getElementById("editor-auth-password");
  const nextError = document.getElementById("editor-auth-error");
  const nextSubmit = document.getElementById("editor-auth-submit");
  const closeButton = document.getElementById("editor-auth-close");
  const cancelButton = document.getElementById("editor-auth-cancel");

  if (
    !(nextDialog instanceof HTMLDialogElement) ||
    !(nextForm instanceof HTMLFormElement) ||
    !(nextPassword instanceof HTMLInputElement) ||
    !(nextError instanceof HTMLElement) ||
    !(nextSubmit instanceof HTMLButtonElement)
  ) {
    return;
  }

  dialog = nextDialog;
  form = nextForm;
  passwordInput = nextPassword;
  errorBox = nextError;
  submitButton = nextSubmit;

  const close = () => dialog?.close();
  closeButton?.addEventListener("click", close);
  cancelButton?.addEventListener("click", close);
  dialog.addEventListener("close", () => finishAccessRequest(false));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!passwordInput || !errorBox || !submitButton) return;

    errorBox.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = "Comprobando…";

    try {
      const response = await fetch("/api/editor/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.value }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "No se pudo iniciar la sesión de edición.");
      }

      finishAccessRequest(true);
      dialog?.close();
    } catch (error) {
      errorBox.textContent =
        error instanceof Error ? error.message : "No se pudo iniciar la sesión de edición.";
      errorBox.hidden = false;
      passwordInput.select();
      submitButton.disabled = false;
      submitButton.textContent = "Desbloquear";
    }
  });
}

export async function editorFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  const authorized = await requestEditorAccess();
  if (!authorized) return response;
  return fetch(input, init);
}
