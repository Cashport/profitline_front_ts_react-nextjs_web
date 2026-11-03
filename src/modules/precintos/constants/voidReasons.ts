// Motivos de anulación de precintos. `value` es el texto que se envía y se guarda en el
// backend (no se traduce); `key` es la clave del catálogo `seals.voidReasons` para mostrarlo.
export const VOID_REASONS = [
  { value: "Precinto roto en instalación", key: "brokenOnInstall" },
  { value: "Extraviado en ruta", key: "lostInTransit" },
  { value: "Defecto de fábrica", key: "factoryDefect" },
  { value: "Mal diligenciado", key: "filledOutIncorrectly" },
  { value: "Otro", key: "other" }
] as const;

export type VoidReasonKey = (typeof VOID_REASONS)[number]["key"];

export const VOID_REASON_OTHER = "Otro";

/** Clave de catálogo del motivo guardado, o `null` si es un texto libre que no está en la lista. */
export const voidReasonKey = (value: string | null | undefined): VoidReasonKey | null =>
  VOID_REASONS.find((reason) => reason.value === value)?.key ?? null;
