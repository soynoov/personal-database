import type { LocalGame } from "./local-games";
import { hasGameTag } from "./game-tags";

export const GAME_MODES = [
  { value: "solitario", label: "Solitario" },
  { value: "transmision", label: "Transmisión" },
  { value: "cooperativo", label: "Cooperativo" },
  { value: "multijugador", label: "Multijugador" },
] as const;

export type GameMode = (typeof GAME_MODES)[number]["value"];

const MODE_ALIASES: Record<string, GameMode> = {
  solo: "solitario",
  solitario: "solitario",
  "un-jugador": "solitario",
  singleplayer: "solitario",
  "single-player": "solitario",
  transmision: "transmision",
  stream: "transmision",
  streaming: "transmision",
  cooperativo: "cooperativo",
  coop: "cooperativo",
  "co-op": "cooperativo",
  "cooperativo-con-amigos": "cooperativo",
  "cooperativo-privado": "cooperativo",
  multijugador: "multijugador",
  multiplayer: "multijugador",
};

const normalizeModeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");

export function normalizeGameMode(value: unknown): GameMode | null {
  return MODE_ALIASES[normalizeModeText(value)] ?? null;
}

export function normalizeGameModes(value: unknown): GameMode[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const normalized = new Set(
    values.map(normalizeGameMode).filter((mode): mode is GameMode => mode !== null),
  );
  return GAME_MODES.map(({ value }) => value).filter((mode) => normalized.has(mode));
}

export function getGameModeLabel(value: unknown): string {
  const normalized = normalizeGameMode(value);
  return GAME_MODES.find((mode) => mode.value === normalized)?.label ?? String(value ?? "").trim();
}

export function getGameModes(
  game: Pick<LocalGame, "modos" | "solo" | "tags" | "generos">,
): GameMode[] {
  const explicitModes = normalizeGameModes(game.modos);
  if (explicitModes.length > 0) return explicitModes;

  const inferred = new Set<GameMode>();
  const isPrivateCoop = hasGameTag(game.tags, "cooperativo-privado");
  const normalizedTags = Array.isArray(game.tags)
    ? game.tags.map(normalizeModeText)
    : [];
  const normalizedGenres = Array.isArray(game.generos)
    ? game.generos.map(normalizeModeText)
    : [];

  if (game.solo === true) inferred.add("solitario");
  if (normalizedTags.some((tag) => tag === "transmitir" || tag === "transmision")) {
    inferred.add("transmision");
  }
  if (isPrivateCoop) inferred.add("cooperativo");
  else if (game.solo === false) inferred.add("multijugador");

  if (normalizedGenres.some((genre) => genre.includes("cooperativo") || genre.includes("co-op"))) {
    inferred.add("cooperativo");
  }
  if (normalizedGenres.some((genre) => genre.includes("multijugador") || genre.includes("multiplayer"))) {
    inferred.add("multijugador");
  }

  return GAME_MODES.map(({ value }) => value).filter((mode) => inferred.has(mode));
}

export function gameHasMode(
  game: Pick<LocalGame, "modos" | "solo" | "tags" | "generos">,
  expectedMode: unknown,
) {
  const normalizedMode = normalizeGameMode(expectedMode);
  return Boolean(normalizedMode && getGameModes(game).includes(normalizedMode));
}

export function formatGameModes(modes: readonly unknown[], fallback = "Sin registrar") {
  const labels = normalizeGameModes([...modes]).map(getGameModeLabel);
  return labels.length > 0 ? labels.join(" · ") : fallback;
}

export function getLegacySoloValue(modes: readonly unknown[]): boolean | null {
  const normalized = normalizeGameModes([...modes]);
  if (normalized.length === 1 && normalized[0] === "solitario") return true;
  if (normalized.length > 0 && !normalized.includes("solitario")) return false;
  return null;
}
