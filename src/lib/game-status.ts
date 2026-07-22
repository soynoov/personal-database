export function normalizeStatus(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

const COMPLETED_STATUS_VALUES = new Set(["terminado", "completado"]);

export function isCompletedStatus(value: unknown): boolean {
  return COMPLETED_STATUS_VALUES.has(normalizeStatus(value));
}
