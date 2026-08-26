export const PC_PURCHASE_STORES = [
  'Epic Games',
  'Steam',
  'Instant Gaming',
  'IGG',
] as const;

export const NINTENDO_PURCHASE_STORES = [
  'eShop',
  'Instant Gaming',
] as const;

const ALL_PURCHASE_STORES = [
  ...PC_PURCHASE_STORES,
  ...NINTENDO_PURCHASE_STORES,
] as const;

const normalizeKey = (value: unknown) => String(value ?? '')
  .trim()
  .toLocaleLowerCase('es-ES')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const PURCHASE_STORE_ALIASES = new Map<string, string>([
  ...ALL_PURCHASE_STORES.map((store) => [normalizeKey(store), store] as const),
  ['epic', 'Epic Games'],
  ['epic game', 'Epic Games'],
  ['instang gaming', 'Instant Gaming'],
  ['instantgaming', 'Instant Gaming'],
  ['nintendo eshop', 'eShop'],
]);

export const isNintendoPlatform = (platform: unknown) => {
  const normalized = normalizeKey(platform);
  return normalized.includes('nintendo') || normalized.includes('switch');
};

export const getPurchaseStoreOptions = (platform: unknown): readonly string[] => (
  isNintendoPlatform(platform) ? NINTENDO_PURCHASE_STORES : PC_PURCHASE_STORES
);

export const normalizePurchaseStore = (store: unknown) => {
  const value = String(store ?? '').trim();
  if (!value) return null;
  return PURCHASE_STORE_ALIASES.get(normalizeKey(value)) ?? value;
};

export const normalizePurchaseStores = (value: unknown): string[] => {
  const stores = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  return [...new Set(stores.map(normalizePurchaseStore).filter((store): store is string => Boolean(store)))];
};
