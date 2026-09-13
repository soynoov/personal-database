// Free-text personal fields only: `nota` (score) and `lanzamiento_nota` are retained.
const retiredFields = new Set(['comentarios', 'comentario', 'notas']);

/**
 * Remove retired fields, including DLC notes and archived review comments.
 * Immutable and idempotent; unchanged branches retain their original identity.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function removePersonalNotes(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const items = value.map(removePersonalNotes);
    return /** @type {T} */ (items.some((item, index) => item !== value[index]) ? items : value);
  }
  let changed = false;
  const entries = [];
  for (const [key, item] of Object.entries(value)) {
    if (retiredFields.has(key)) { changed = true; continue; }
    const clean = removePersonalNotes(item);
    if (clean !== item) changed = true;
    entries.push([key, clean]);
  }
  return /** @type {T} */ (changed ? Object.fromEntries(entries) : value);
}
