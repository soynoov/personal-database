export type GameEntry = {
  game_id: string;
  entry_id: string;
  store_id: string;
  titulo: string;
  estado: string;
  launcher: string;
  launcher_slug: string;
  launcher_tipo: string;
  plataforma: string;
  horas: number | null;
  hltb: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  logros_actual: number | null;
  logros_total: number | null;
  nota: number | null;
  tags: string[];
  comentarios: string | null;
  source: string;
  created_at: string;
  updated_at: string;
};

export type Store = {
  id: string;
  slug: string;
  nombre: string;
  tipo: string;
};

export type GameJson = {
  id: string;
  titulo: string;
  tags: string[];
  raw: Record<string, unknown>;
  launchers: Array<{
    entry_id: string;
    store_id: string;
    launcher: string;
    launcher_slug: string;
    launcher_tipo: string;
    estado: string;
    plataforma: string;
    horas: number | null;
    hltb: number | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    logros_actual: number | null;
    logros_total: number | null;
    nota: number | null;
    comentarios: string | null;
    source: string;
    updated_at: string;
  }>;
  created_at: string;
  updated_at: string;
};

type QueryValue = string | number | boolean | null | undefined;

const supabaseUrl = import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY ?? import.meta.env.PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL/SUPABASE_KEY env vars.");
}

const restUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;

function buildQuery(params: Record<string, QueryValue>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  return query.toString();
}

async function supabaseGet<T>(path: string, params: Record<string, QueryValue> = {}) {
  const query = buildQuery(params);
  const response = await fetch(`${restUrl}/${path}${query ? `?${query}` : ""}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

export async function getGames(options: {
  search?: string;
  estado?: string;
  launcher?: string;
  plataforma?: string;
  limit?: number;
} = {}) {
  const params: Record<string, QueryValue> = {
    select: "*",
    order: "titulo.asc",
    limit: options.limit ?? 200,
  };

  if (options.search) params.titulo = `ilike.*${options.search}*`;
  if (options.estado) params.estado = `ilike.*${options.estado}*`;
  if (options.launcher) params.launcher = `ilike.*${options.launcher}*`;
  if (options.plataforma) params.plataforma = `ilike.*${options.plataforma}*`;

  return supabaseGet<GameEntry[]>("game_library_api", params);
}

export async function getStores() {
  return supabaseGet<Store[]>("stores", {
    select: "id,slug,nombre,tipo",
    order: "nombre.asc",
  });
}

export async function getGamesJson(options: {
  search?: string;
  limit?: number;
} = {}) {
  const params: Record<string, QueryValue> = {
    select: "*",
    order: "titulo.asc",
    limit: options.limit ?? 200,
  };

  if (options.search) params.titulo = `ilike.*${options.search}*`;

  return supabaseGet<GameJson[]>("games_json_api", params);
}

export function getGameStats(games: GameEntry[]) {
  const byEstado = new Map<string, number>();
  const byLauncher = new Map<string, number>();
  let horas = 0;

  for (const game of games) {
    byEstado.set(game.estado, (byEstado.get(game.estado) ?? 0) + 1);
    byLauncher.set(game.launcher, (byLauncher.get(game.launcher) ?? 0) + 1);
    horas += Number(game.horas ?? 0);
  }

  return {
    total: games.length,
    horas: Number(horas.toFixed(2)),
    estados: Object.fromEntries([...byEstado.entries()].sort()),
    launchers: Object.fromEntries([...byLauncher.entries()].sort()),
  };
}



