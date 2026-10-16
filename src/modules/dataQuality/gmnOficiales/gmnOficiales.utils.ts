/**
 * Utilidades puras de la carga de GMN oficiales (HU GMN + MATCH).
 *
 * Sin dependencias de React ni de la app: concentran la validacion de archivo y
 * el armado del multipart, evitando repetir logica entre componentes y pruebas
 * (mismo patron que `references.utils.ts`).
 */

/** Extensiones Excel aceptadas por el backend para el catalogo oficial. */
export const GMN_OFICIALES_ALLOWED_EXTENSIONS = [".xls", ".xlsx"] as const;

/** Igual al limite por defecto del backend (fileUpload.config MAX_FILE_SIZE_MB = 30). */
export const GMN_OFICIALES_MAX_FILE_SIZE_MB = 30;

/** Hoja que lee el backend (`Product_YYYYMMDD.xlsx`). */
export const GMN_OFICIALES_SHEET_NAME = "Sheet1";

/** Columnas del archivo oficial. */
export const GMN_OFICIALES_EXPECTED_COLUMNS = [
  "Country",
  "Material_Num",
  "Material_Num_Master",
  "SKU_Local",
  "Sub_Brand_Local",
  "Factor Doses",
  "Factor Cases",
  "Sub_Brand_Latam",
  "Status",
  "EAN",
  "SKU_Type"
] as const;

/** Columnas minimas obligatorias (validadas por el backend). */
export const GMN_OFICIALES_REQUIRED_COLUMNS = ["Country", "Material_Num"] as const;

/** `true` si el nombre de archivo tiene una extension Excel permitida. */
export function isAllowedGmnOficialesFileName(fileName: string | null | undefined): boolean {
  if (!fileName) return false;
  const lower = fileName.toLowerCase();
  return GMN_OFICIALES_ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isAllowedGmnOficialesFile(file: File | null | undefined): boolean {
  return !!file && isAllowedGmnOficialesFileName(file.name);
}

/**
 * Prevalidacion LOCAL (extension y tamano). Devuelve un mensaje de error, o
 * `null` si el archivo pasa los chequeos del cliente. Las columnas, paises y
 * duplicados los valida el backend con un dry-run que no escribe datos.
 */
export function validateGmnOficialesFile(file: File | null | undefined): string | null {
  if (!file) return "Selecciona un archivo Excel.";
  if (!isAllowedGmnOficialesFileName(file.name)) {
    return `Formato no permitido. Usa ${GMN_OFICIALES_ALLOWED_EXTENSIONS.join(" o ")}.`;
  }
  if (file.size <= 0) return "El archivo esta vacio.";
  if (file.size > GMN_OFICIALES_MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `El archivo supera el limite de ${GMN_OFICIALES_MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

/** Construye el multipart/form-data con el nombre de campo del backend. */
export function buildGmnOficialesFormData(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

/** Formatea bytes a MB legibles. */
export function formatBytesToMB(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "-";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
