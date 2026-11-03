/** Tipo de pregunta del motor de formularios (`QUESTION_TYPE` del backend). */
export type IVisitFormQuestionType =
  | "text"
  | "textarea"
  | "number"
  | "document"
  | "single_select"
  | "dropdown"
  | "multi_select"
  | "photo"
  | "file"
  | "date"
  | "email"
  | "phone"
  | "location";

/** Estado de la encuesta: solo las ACTIVE le salen al asesor en la app. */
export type IVisitFormStatus = "ACTIVE" | "INACTIVE";

/** Estado de una respuesta: DRAFT es una encuesta que el asesor no finalizó. */
export type IVisitFormResponseStatus = "DRAFT" | "COMPLETED";

export interface IVisitFormQuestionOption {
  id: string;
  label: string;
  /** Lo que se guarda como respuesta; no cambia aunque cambie la etiqueta. */
  value: string;
}

export interface IVisitFormQuestionValidation {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  decimals?: number;
  min_selections?: number;
  max_selections?: number;
  /** Extensiones con punto: [".pdf", ".jpg"]. */
  allowed_file_types?: string[];
  max_file_size_mb?: number;
  max_files?: number;
  /** YYYY-MM-DD, inclusivos. */
  min_date?: string;
  max_date?: string;
}

/** La pregunta se muestra si la respuesta de `question_id` está en `in` (values de sus opciones). */
export interface IVisitFormQuestionCondition {
  any: { question_id: string; in: string[] }[];
}

export interface IVisitFormQuestion {
  id: string;
  type: IVisitFormQuestionType;
  label: string;
  description?: string | null;
  required: boolean;
  order: number;
  placeholder?: string | null;
  validation?: IVisitFormQuestionValidation;
  options?: IVisitFormQuestionOption[];
  visible_if?: IVisitFormQuestionCondition;
}

/** Encuesta con su versión vigente: GET /visit-forms/:form_id, y lo que responden POST y PUT. */
export interface IVisitForm {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  status: IVisitFormStatus;
  version: number;
  display_order: number;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  published_at: string;
  questions: IVisitFormQuestion[];
}

/** Fila de GET /visit-forms. */
export interface IVisitFormListItem {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  status: IVisitFormStatus;
  current_version: number | null;
  display_order: number;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  question_count: number;
  /** Respuestas finalizadas y borradores. */
  response_count: number;
  month_response_count: number;
  last_response_at: string | null;
}

/** Query de GET /visit-forms. */
export interface IVisitFormsFilters {
  status: IVisitFormStatus[];
  created_by: number[];
  /** yyyy-MM-dd, inclusivo, sobre updated_at (días de Colombia). */
  from: string | null;
  /** yyyy-MM-dd, inclusivo. */
  to: string | null;
}

/** GET /visit-forms/statuses. */
export interface IVisitFormStatusOption {
  code: IVisitFormStatus;
  name: string;
}

/** GET /visit-forms/creators: quienes crearon encuestas del proyecto. */
export interface IVisitFormCreator {
  id: number;
  name: string;
}

/** Body de POST /visit-forms (name y definition obligatorios) y de PUT (solo lo que cambia). */
export interface IUpsertVisitFormBody {
  name?: string;
  description?: string | null;
  display_order?: number;
  status?: IVisitFormStatus;
  definition?: { questions: IVisitFormQuestion[] };
}

/** Fila de GET /visit-forms/:form_id/responses. */
export interface IVisitFormResponseListItem {
  response_id: number;
  status: IVisitFormResponseStatus;
  form_version: number;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
  visit_id: number;
  client_nit: string | null;
  client_name: string | null;
  user_id: number;
  user_name: string | null;
}

/** Cuerpo (`data`) de GET /visit-forms/:form_id/responses: la página y los totales de la encuesta. */
export interface IVisitFormResponsesPage {
  data: IVisitFormResponseListItem[];
  total: number;
  month_total: number;
  user_count: number;
}

/** Query de GET /visit-forms/:form_id/responses/export. */
export interface IVisitFormResponsesExportParams {
  format: "xlsx" | "csv";
  /** yyyy-MM-dd, inclusivo; máximo 366 días entre from y to. */
  from: string;
  to: string;
  include_links: boolean;
}

export interface IVisitFormAnswerDisplayFile {
  url: string;
  name: string;
  mimeType: string;
}

/** Una pregunta visible de la respuesta; sin respuesta, `value` y `display` llegan en null. */
export interface IVisitFormAnswerDisplay {
  questionId: string;
  type: IVisitFormQuestionType;
  label: string;
  value: unknown;
  /** Texto listo para pintar: etiqueta de la opción, DD/MM/AAAA, "10 / 10"… */
  display: string | null;
  file: IVisitFormAnswerDisplayFile | null;
  files: IVisitFormAnswerDisplayFile[];
}

/** GET /visit-admin/responses/:response_id (en camelCase, como lo manda el backend). */
export interface IVisitFormResponseDisplay {
  responseId: number;
  status: IVisitFormResponseStatus;
  startedAt: string;
  completedAt: string | null;
  visitId: number;
  form: { id: number; name: string; version: number };
  client: { nit: string | null; name: string | null };
  user: { id: number; name: string | null };
  summary: string | null;
  answers: IVisitFormAnswerDisplay[];
}
