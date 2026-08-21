import { createHmac, timingSafeEqual } from "node:crypto";
import { hasProductionGameStorage } from "./local-games";

const COOKIE_NAME = "evadb_editor";
const SESSION_PAYLOAD = "evadb-editor-session-v1";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}

function getEditorPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sessionToken(password: string) {
  return createHmac("sha256", password).update(SESSION_PAYLOAD).digest("hex");
}

function readCookie(request: Request, name: string) {
  const rawCookies = request.headers.get("cookie") ?? "";
  for (const part of rawCookies.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rawValue.join("="));
  }
  return null;
}

export function editorConfigurationError() {
  if (!process.env.VERCEL) return null;
  if (!hasProductionGameStorage()) {
    return "Falta conectar un almacén privado de Vercel Blob al proyecto.";
  }
  if (!getEditorPassword()) {
    return "Falta configurar ADMIN_PASSWORD en las variables de entorno de Vercel.";
  }
  return null;
}

export function editorRequiresAuthentication() {
  return Boolean(process.env.VERCEL || getEditorPassword());
}

export function isEditorAuthenticated(request: Request) {
  if (!editorRequiresAuthentication()) return true;
  const password = getEditorPassword();
  const cookie = readCookie(request, COOKIE_NAME);
  return Boolean(password && cookie && safeEqual(cookie, sessionToken(password)));
}

export function requireEditor(request: Request) {
  const configurationError = editorConfigurationError();
  if (configurationError) {
    return jsonResponse(503, { ok: false, error: configurationError });
  }
  if (!isEditorAuthenticated(request)) {
    return jsonResponse(401, {
      ok: false,
      code: "EDITOR_AUTH_REQUIRED",
      error: "Introduce la contraseña de edición para guardar cambios.",
    });
  }
  return null;
}

export function verifyEditorPassword(candidate: unknown) {
  const password = getEditorPassword();
  return (
    typeof candidate === "string" &&
    Boolean(password) &&
    safeEqual(candidate, password)
  );
}

export function createEditorSessionCookie() {
  const password = getEditorPassword();
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(sessionToken(password))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function clearEditorSessionCookie() {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}
