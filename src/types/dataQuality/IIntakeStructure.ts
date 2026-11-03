/**
 * Respuestas del backend cuando valida la estructura (encabezados) de un archivo
 * de ingesta en /data/create-intake y /data/create-intake-generic.
 */

export interface IStructureIssue {
  code: string;
  message: string;
  /** Referencia tipo Excel, p. ej. "E7". */
  cell?: string;
  expected?: string;
  found?: string;
  suggestion?: string;
}

export interface IStructureDetected {
  format: string | null;
  receivedExtension: string | null;
  sheet: string | null;
  sheets: string[];
  headerCell: string | null;
  headers: string[];
  delimiter: string | null;
  encoding: string | null;
  dataRowsChecked: number;
}

/** 422 FILE_STRUCTURE_INVALID: resultado completo de la validacion. */
export interface IStructureValidationResult {
  valid: boolean;
  errors: IStructureIssue[];
  warnings: IStructureIssue[];
  detected: IStructureDetected;
}

/** 409 TEMPLATE_DECISION_REQUIRED y 422 TEMPLATE_NOT_GENERATED: vista previa. */
export interface ITemplatePreview {
  can_use_as_template: boolean;
  template: { fields: { name: string }[] } | null;
  errors: IStructureIssue[];
  warnings: IStructureIssue[];
  ambiguous: boolean;
  detected: IStructureDetected;
}

// ---------------------------------------------------------------------------
// Validaciones de contenido de ETLs (asistente en /market-admin/load)
// ---------------------------------------------------------------------------

export type ValidationColumnType = "text" | "number" | "integer" | "date" | "boolean" | "any";
export type ValidationCalc = "none" | "sum" | "count" | "count_distinct" | "avg";
export type ValidationSeverity = "warning" | "block";

export interface IValidationColumnConfig {
  name: string;
  type: ValidationColumnType;
  required: boolean;
  calc: ValidationCalc;
  tolerance_pct: number;
  severity: ValidationSeverity;
}

export interface ILoaderValidationConfig {
  /** Cantidad de cargas anteriores que forman el promedio. */
  window: number;
  row_count: { tolerance_pct: number; severity: ValidationSeverity };
  columns: IValidationColumnConfig[];
}

/** Perfil de una columna del archivo (de donde salen las sugerencias). */
export interface IColumnProfile {
  name: string;
  cell: string;
  type: Exclude<ValidationColumnType, "any">;
  filled: number;
  empty: number;
  distinct: number;
}

/** 409 VALIDATIONS_REQUIRED de POST /profit-loader/etl/:id/upload. */
export interface IValidationsRequired {
  kind: "VALIDATIONS_REQUIRED";
  loader_id: number;
  loader_name: string | null;
  columns: IColumnProfile[];
  suggestion: ILoaderValidationConfig;
}

/** GET/PUT /profit-loader/etl/:id/validations. */
export interface ILoaderValidations {
  loader_id: number;
  loader_name: string;
  has_template: boolean;
  configured: boolean;
  other_rules: number;
  config: ILoaderValidationConfig | null;
  template_columns: string[];
}
