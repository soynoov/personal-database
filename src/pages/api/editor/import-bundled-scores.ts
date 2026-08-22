import type { APIRoute } from "astro";
import { requireEditor } from "../../../lib/edit-auth";
import {
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

  const [currentGames, bundledGames] = await Promise.all([
    readGames(),
    readBundledGames(),
  ]);
  const bundledBySlug = new Map(
    bundledGames.map((game) => [slugifyGameTitle(game.titulo), game]),
  );

  let updatedGames = 0;
  let updatedFields = 0;

  for (const game of currentGames) {
    const bundled = bundledBySlug.get(slugifyGameTitle(game.titulo));
    if (!bundled?.critica) continue;

    const metascore = bundled.critica.metascore;
    const userscore = bundled.critica.userscore;
    if (metascore == null && userscore == null) continue;

    game.critica ??= {};
    let changed = false;

    if (metascore != null && game.critica.metascore !== metascore) {
      game.critica.metascore = metascore;
      updatedFields += 1;
      changed = true;
    }
    if (userscore != null && game.critica.userscore !== userscore) {
      game.critica.userscore = userscore;
      updatedFields += 1;
      changed = true;
    }

    if (changed) updatedGames += 1;
  }

  if (updatedGames > 0) {
    try {
      await writeGames(currentGames);
    } catch (error) {
      return jsonResponse(500, {
        ok: false,
        error: `No se pudo sincronizar la biblioteca: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return jsonResponse(200, {
    ok: true,
    updatedGames,
    updatedFields,
  });
};
