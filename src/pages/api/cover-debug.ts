import { resolveGameCover } from '../../lib/cover-resolver';

export async function GET({ url }: { url: URL }) {
  const appId = url.searchParams.get('appId');
  const title = url.searchParams.get('title') ?? 'Test';

  if (!appId || !Number.isFinite(Number(appId))) {
    return new Response(JSON.stringify({ error: 'Falta ?appId=...' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await resolveGameCover({
    titulo: title,
    steam_appid: Number(appId),
  });

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
