import type { APIRoute } from "astro";
import {
  clearEditorSessionCookie,
  createEditorSessionCookie,
  editorConfigurationError,
  editorRequiresAuthentication,
  isEditorAuthenticated,
  verifyEditorPassword,
} from "../../../lib/edit-auth";

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  headers: HeadersInit = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export const GET: APIRoute = async ({ request }) => {
  return jsonResponse(200, {
    ok: true,
    authenticated: isEditorAuthenticated(request),
    requiresAuthentication: editorRequiresAuthentication(),
    configured: !editorConfigurationError(),
  });
};

export const POST: APIRoute = async ({ request }) => {
  const configurationError = editorConfigurationError();
  if (configurationError) {
    return jsonResponse(503, { ok: false, error: configurationError });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: "Petición no válida." });
  }

  if (!verifyEditorPassword(body.password)) {
    return jsonResponse(401, { ok: false, error: "Contraseña incorrecta." });
  }

  return jsonResponse(
    200,
    { ok: true },
    { "Set-Cookie": createEditorSessionCookie() },
  );
};

export const DELETE: APIRoute = async () => {
  return jsonResponse(
    200,
    { ok: true },
    { "Set-Cookie": clearEditorSessionCookie() },
  );
};
