import type { APIRoute } from "astro";
import { buildCoverFallbackSvg, resolveGameCover } from "../../lib/game-cover-resolver";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const title = url.searchParams.get("title") ?? "Juego";
  const launcher = url.searchParams.get("launcher");
  const platform = url.searchParams.get("platform");
  const legacyCoverUrl = url.searchParams.get("legacyCoverUrl");
  const steamAppId = Number(url.searchParams.get("steamAppId"));

  const result = await resolveGameCover({
    titulo: title,
    launcher,
    plataforma: platform,
    steam_appid: Number.isNaN(steamAppId) ? null : steamAppId,
    cover_url: legacyCoverUrl,
  });

  if (result.url) {
    const response = Response.redirect(result.url, 302);
    response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    response.headers.set("X-Cover-Source", result.source);
    return response;
  }

  return new Response(buildCoverFallbackSvg(title), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Cover-Source": "Fallback SVG",
    },
  });
};
