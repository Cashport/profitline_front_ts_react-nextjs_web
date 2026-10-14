/**
 * Utilidades puras de la seccion de referencias dinamicas (HU-DT-REF-001).
 *
 * Sin dependencias de React ni de la app: facilitan la validacion y evitan
 * repetir logica entre componentes y pruebas. Los imports son solo de tipos.
 */

import type {
  ICreateReferenceOwnerPayload,
  IReferenceFile,
  IReferenceFilesFilters,
  IReferenceScopeLevel
} from "@/types/dataQuality/IDataQuality";

/** Extensiones Excel aceptadas por el backend para referencias. */
export const REFERENCE_ALLOWED_EXTENSIONS = [".xls", ".xlsx", ".xlsb"] as const;

/** Ambitos permitidos. NO existe "global". */
export const REFERENCE_SCOPE_OPTIONS: { value: IReferenceScopeLevel; label: string }[] = [
  { value: "client", label: "Cliente" },
  { value: "country", label: "País" },
  { value: "region", label: "Región" }
];

export const REFERENCE_SCOPE_LABELS: Record<IReferenceScopeLevel, string> = {
  client: "Cliente",
  country: "País",
  region: "Región"
};

export function scopeLabel(scope: IReferenceScopeLevel | string): string {
  return REFERENCE_SCOPE_LABELS[scope as IReferenceScopeLevel] ?? String(scope);
}

/** `true` si el nombre de archivo tiene una extension Excel permitida. */
export function isAllowedReferenceFileName(fileName: string | null | undefined): boolean {
  if (!fileName) return false;
  const lower = fileName.toLowerCase();
  return REFERENCE_ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isAllowedReferenceFile(file: File | null | undefined): boolean {
  return !!file && isAllowedReferenceFileName(file.name);
}

/**
 * Devuelve el objeto con el UNICO owner correspondiente al ambito.
 * Lanza si el ambito no es valido (incluido "global").
 */
export function buildReferenceOwnerPayload(
  scope: IReferenceScopeLevel | string,
  ownerId: number
): ICreateReferenceOwnerPayload {
  if (scope === "client") return { id_client: ownerId };
  if (scope === "country") return { id_country: ownerId };
  if (scope === "region") return { id_region: ownerId };
  throw new Error(`Ambito de referencia no soportado: ${String(scope)}`);
}

export interface BuildReferenceCreateFormDataInput {
  referenceType: string;
  scopeLevel: IReferenceScopeLevel;
  ownerId: number;
  description?: string | null;
  sheetName?: string | null;
  headerRow?: number | null;
  file: File;
}

/** Construye el multipart/form-data con los nombres de campo del backend. */
export function buildReferenceCreateFormData(input: BuildReferenceCreateFormDataInput): FormData {
  const formData = new FormData();
  formData.append("reference_type", input.referenceType);
  formData.append("scope_level", input.scopeLevel);

  const owner = buildReferenceOwnerPayload(input.scopeLevel, input.ownerId);
  (Object.keys(owner) as (keyof ICreateReferenceOwnerPayload)[]).forEach((key) => {
    formData.append(key, String(owner[key]));
  });

  if (input.description) formData.append("description", input.description);
  if (input.sheetName) formData.append("sheet_name", input.sheetName);
  if (input.headerRow !== undefined && input.headerRow !== null) {
    formData.append("header_row", String(input.headerRow));
  }

  formData.append("file", input.file);
  return formData;
}

/** Construye la ruta relativa (para SWR/fetcher) con los filtros del listado. */
export function buildReferenceFilesQuery(filters: IReferenceFilesFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.reference_type) params.append("reference_type", filters.reference_type);
  if (filters.scope_level) params.append("scope_level", filters.scope_level);
  if (filters.id_client != null) params.append("id_client", String(filters.id_client));
  if (filters.id_country != null) params.append("id_country", String(filters.id_country));
  if (filters.id_region != null) params.append("id_region", String(filters.id_region));
  if (filters.is_active != null) params.append("is_active", String(filters.is_active));
  const qs = params.toString();
  return `/data/reference-files${qs ? `?${qs}` : ""}`;
}

export interface ReferenceCatalogs {
  countries: { id: number; country_name: string }[];
  regions: { id: number; abbreviation: string }[];
  clients: { id: number; client_name: string }[];
}

/** Resuelve el nombre descriptivo del propietario (nunca muestra el ID como nombre). */
export function resolveReferenceOwnerLabel(
  reference: Pick<IReferenceFile, "scope_level" | "id_client" | "id_country" | "id_region">,
  catalogs: ReferenceCatalogs
): string {
  if (reference.scope_level === "country") {
    const country = catalogs.countries.find((c) => c.id === reference.id_country);
    return country ? country.country_name : `País #${reference.id_country}`;
  }
  if (reference.scope_level === "region") {
    const region = catalogs.regions.find((r) => r.id === reference.id_region);
    return region ? region.abbreviation : `Región #${reference.id_region}`;
  }
  if (reference.scope_level === "client") {
    const client = catalogs.clients.find((c) => c.id === reference.id_client);
    return client ? client.client_name : `Cliente #${reference.id_client}`;
  }
  return "-";
}

/** Formatea bytes a MB legibles. */
export function formatBytesToMB(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return "-";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
