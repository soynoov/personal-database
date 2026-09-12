import { normalizeStatus } from './game-status';
import { getGameTagLabel, normalizeGameTag } from './game-tags';
import { LAUNCHER_ICONS } from './game-pill-icons';

const LAUNCHER_CLASS_MAP: Record<string, string> = {
  steam: 'badge-launcher-steam',
  'epic games': 'badge-launcher-epic',
  epic: 'badge-launcher-epic',
  nintendo: 'badge-launcher-nintendo',
  switch: 'badge-launcher-nintendo',
  'nintendo switch': 'badge-launcher-nintendo',
  'nintendo eshop': 'badge-launcher-eshop',
  eshop: 'badge-launcher-eshop',
  pirata: 'badge-launcher-pirata',
  gamepass: 'badge-launcher-gamepass',
  'xbox game pass': 'badge-launcher-gamepass',
  'riot games': 'badge-launcher-riot',
  hoyoverse: 'badge-launcher-hoyoplay',
  hoyoplay: 'badge-launcher-hoyoplay',
  'ea app': 'badge-launcher-ea',
  ubisoft: 'badge-launcher-ubisoft',
  'ubisoft connect': 'badge-launcher-ubisoft',
  gog: 'badge-launcher-gog',
  itch: 'badge-launcher-itch',
  'itch.io': 'badge-launcher-itch',
};

const STATUS_CLASS_MAP: Record<string, string> = {
  pendiente: 'badge-status-pending',
  jugando: 'badge-status-playing',
  terminado: 'badge-status-completed',
  completado: 'badge-status-completed',
  recurrente: 'badge-status-recurring',
  wishlist: 'badge-status-wishlist',
  pausado: 'badge-status-paused',
  abandonado: 'badge-status-abandoned',
  retirado: 'badge-status-abandoned',
};

const PLATFORM_CLASS_MAP: Record<string, string> = {
  pc: 'badge-platform-pc',
  mobile: 'badge-platform-mobile',
  móvil: 'badge-platform-mobile',
  android: 'badge-platform-mobile',
  ios: 'badge-platform-mobile',
  switch: 'badge-platform-switch',
  'nintendo switch': 'badge-platform-switch',
  nintendo: 'badge-platform-switch',
};

const PLATFORMS_WITH_ICON = new Set(['switch', 'nintendo switch', 'nintendo']);


export type GamePillKind = 'status' | 'launcher' | 'platform' | 'tag' | 'achievement' | 'neutral';
const TAG_CLASS_MAP: Record<string, string> = {
  'free-to-play': 'badge-tag-free', competitivo: 'badge-tag-competitive',
  'early-access': 'badge-tag-early', indie: 'badge-tag-indie', modpacks: 'badge-tag-modpacks',
};
const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

/** One presentation contract for server-rendered pills and client catalog updates. */
export function getGamePill(kind: GamePillKind, value: unknown, label?: string) {
  const normalized = normalizeStatus(value);
  const text = label ?? (kind === 'tag' ? getGameTagLabel(String(value ?? '')) : String(value ?? '—'));
  const className = kind === 'status' ? STATUS_CLASS_MAP[normalized] ?? 'badge-status-default'
    : kind === 'launcher' ? LAUNCHER_CLASS_MAP[normalized] ?? 'badge-launcher-default'
    : kind === 'platform' ? PLATFORM_CLASS_MAP[normalized] ?? 'badge-platform-default'
    : kind === 'tag' ? TAG_CLASS_MAP[normalizeGameTag(value)] ?? 'badge-neutral'
    : kind === 'achievement' ? 'badge-achievement-platinum' : 'badge-neutral';
  const iconKey = normalized === 'epic' ? 'epic games' : normalized === 'nintendo eshop' || normalized === 'eshop' ? 'nintendo' : normalized;
  const icon = kind === 'launcher' || (kind === 'platform' && PLATFORMS_WITH_ICON.has(normalized)) ? LAUNCHER_ICONS[iconKey] : null;
  return {
    className: `badge game-pill ${className}`,
    content: `${icon ? `<span class="launcher-inline-icon" aria-hidden="true">${icon}</span>` : ''}<span>${escapeHtml(text)}</span>`,
    label: text,
  };
}
