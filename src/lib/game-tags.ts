export const PUBLIC_GAME_TAGS = [
  { value: "free-to-play", label: "Free to Play" },
  { value: "indie", label: "Indie" },
  { value: "competitivo", label: "Competitivo" },
  { value: "early-access", label: "Early Access" },
  { value: "modpacks", label: "Modpacks" },
] as const;

export type PublicGameTag = (typeof PUBLIC_GAME_TAGS)[number]["value"];

const TAG_ALIASES: Record<string, PublicGameTag> = {
  "free-to-play": "free-to-play",
  "free-to-play-game": "free-to-play",
  indie: "indie",
  competitivo: "competitivo",
  competitive: "competitivo",
  "early-access": "early-access",
  "early-acces": "early-access",
  "acceso-anticipado": "early-access",
  modpack: "modpacks",
  modpacks: "modpacks",
};

export const normalizeGameTag = (value: unknown): string => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");

  return TAG_ALIASES[normalized] ?? normalized;
};

export const hasGameTag = (
  tags: string[] | null | undefined,
  expectedTag: unknown,
): boolean => {
  const normalizedExpectedTag = normalizeGameTag(expectedTag);
  return Boolean(
    normalizedExpectedTag &&
      Array.isArray(tags) &&
      tags.some((tag) => normalizeGameTag(tag) === normalizedExpectedTag),
  );
};

export const getGameTagLabel = (value: unknown): string => {
  const normalized = normalizeGameTag(value);
  return PUBLIC_GAME_TAGS.find((tag) => tag.value === normalized)?.label ?? String(value ?? "").trim();
};
