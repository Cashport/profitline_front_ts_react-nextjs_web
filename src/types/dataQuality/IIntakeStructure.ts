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
