import type { APIRoute } from "astro";
import { requireEditor } from "../../../lib/edit-auth";
import {
  findGameBySlug,
  readBundledGames,
  readGames,
  slugifyGameTitle,
  writeGames,
} from "../../../lib/local-games";

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const authenticationError = requireEditor(request);
  if (authenticationError) return authenticationError;

  let body: { slug?: unknown };
  try {
    body = (await request.json()) as { slug?: unknown };
  } catch {
    return jsonResponse(400, { ok: false, error: "El cuerpo JSON no es válido." });
  }

  const slug = typeof body.slug === "string" ? slugifyGameTitle(body.slug) : "";
  if (!slug) {
    return jsonResponse(400, { ok: false, error: "Falta indicar el juego." });
  }

  const [currentGames, bundledGames] = await Promise.all([
    readGames(),
    readBundledGames(),
  ]);
  const bundledGame = findGameBySlug(bundledGames, slug);

  if (!bundledGame) {
    return jsonResponse(404, {
      ok: false,
      error: "El juego no existe en la biblioteca incluida en el despliegue.",
    });
  }

  const existingGame = findGameBySlug(currentGames, slug);
  if (existingGame) {
    return jsonResponse(200, {
      ok: true,
      created: false,
      slug,
      game: existingGame,
    });
  }

  currentGames.push(structuredClone(bundledGame));
  currentGames.sort((left, right) => left.titulo.localeCompare(right.titulo, "es"));

  try {
    await writeGames(currentGames);
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: `No se pudo guardar la biblioteca: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  return jsonResponse(201, {
    ok: true,
    created: true,
    slug,
    game: bundledGame,
  });
};
