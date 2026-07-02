import {
  buildCoverFallbackSvg,
  resolveGameCover,
} from '../../lib/cover-resolver';

const IMAGE_TIMEOUT_MS = 8000;

async function fetchImageWithTimeout(input: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

  try {
    return await fetch(input, {
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        accept:
          'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET({ url }: { url: URL }) {
  const title = url.searchParams.get('title') ?? 'Unknown Game';
  const launcher = url.searchParams.get('launcher');
  const platform = url.searchParams.get('platform');
  const steamAppIdParam = url.searchParams.get('steamAppId');
  const coverUrlParam = url.searchParams.get('coverUrl');

  const steamAppId =
    steamAppIdParam && Number.isFinite(Number(steamAppIdParam))
      ? Number(steamAppIdParam)
      : null;

  const result = await resolveGameCover({
    titulo: title,
    launcher,
    plataforma: platform,
    steam_appid: steamAppId,
  });

  if (result.url) {
    try {
      const imageResponse = await fetchImageWithTimeout(result.url);

      if (imageResponse.ok && imageResponse.body) {
        return new Response(imageResponse.body, {
          status: 200,
          headers: {
            'Content-Type':
              imageResponse.headers.get('content-type') ?? 'image/jpeg',
            'Cache-Control': 'no-store',
            'X-Cover-Source': result.source,
            'X-Cover-Url': result.url,
          },
        });
      }
    } catch {
      // Si falla Steam, cae al fallback HLTB o SVG.
    }
  }

  // Fallback HLTB: si hay cover_url en el juego, intentarla antes del SVG
  if (coverUrlParam) {
    try {
      const hltbResponse = await fetchImageWithTimeout(coverUrlParam);
      if (hltbResponse.ok && hltbResponse.body) {
        return new Response(hltbResponse.body, {
          status: 200,
          headers: {
            'Content-Type':
              hltbResponse.headers.get('content-type') ?? 'image/jpeg',
            'Cache-Control': 'no-store',
            'X-Cover-Source': 'HLTB',
            'X-Cover-Url': coverUrlParam,
          },
        });
      }
    } catch {
      // Si falla HLTB, cae al SVG.
    }
  }

  return new Response(buildCoverFallbackSvg(title), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Cover-Source': result.source,
    },
  });
}
