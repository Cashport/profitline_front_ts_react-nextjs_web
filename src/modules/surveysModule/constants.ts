import dayjs from "dayjs";
import {
  AlignLeft,
  Calendar,
  Camera,
  CircleDot,
  Hash,
  IdCard,
  ListChecks,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  SquareChevronDown,
  Type,
  type LucideIcon
} from "lucide-react";

import type { SortState } from "@/modules/walletModule/types";
import type {
  IVisitFormQuestion,
  IVisitFormQuestionType,
  IVisitFormResponseStatus,
  IVisitFormStatus,
  IVisitFormsFilters
} from "@/types/surveys/ISurveys";

/**
 * Tipos de pregunta en el orden del menú "Agregar pregunta"; las llaves son los códigos del
 * backend. Nombre y ayuda se traducen en `surveys.questionTypes.<tipo>`.
 */
export const QUESTION_TYPES: Record<IVisitFormQuestionType, { Icon: LucideIcon }> = {
  text: { Icon: Type },
  textarea: { Icon: AlignLeft },
  number: { Icon: Hash },
  document: { Icon: IdCard },
  dropdown: { Icon: SquareChevronDown },
  single_select: { Icon: CircleDot },
  multi_select: { Icon: ListChecks },
  date: { Icon: Calendar },
  email: { Icon: Mail },
  phone: { Icon: Phone },
  location: { Icon: MapPin },
  photo: { Icon: Camera },
  file: { Icon: Paperclip }
};

export const QUESTION_TYPE_ORDER = Object.keys(QUESTION_TYPES) as IVisitFormQuestionType[];

/** Tipos cuya respuesta es una de sus `options`: las únicas que pueden condicionar otra pregunta. */
export const OPTION_TYPES: IVisitFormQuestionType[] = ["single_select", "dropdown", "multi_select"];

/** Pregunta nueva con texto de ejemplo: el texto sale de `surveys.questionDefaults.placeholders`. */
export type PlaceholderType = "text" | "textarea" | "number" | "document" | "phone" | "email";

/**
 * Con qué arranca una pregunta nueva de cada tipo (los valores por defecto del diseño).
 * `placeholder`: tiene texto de ejemplo traducido; `yesNo`: opciones Sí/No; `optionCount`:
 * cuántas "Opción N" trae.
 */
export const NEW_QUESTION_DEFAULTS: Partial<
  Record<
    IVisitFormQuestionType,
    Pick<IVisitFormQuestion, "validation"> & {
      placeholder?: PlaceholderType;
      yesNo?: boolean;
      optionCount?: number;
    }
  >
> = {
  text: { placeholder: "text", validation: { max_length: 120 } },
  textarea: { placeholder: "textarea", validation: { max_length: 500 } },
  number: { placeholder: "number" },
  document: { placeholder: "document", validation: { max_length: 15 } },
  phone: { placeholder: "phone" },
  email: { placeholder: "email" },
  single_select: { yesNo: true },
  dropdown: { optionCount: 3 },
  multi_select: { optionCount: 2 },
  photo: { validation: { max_files: 5 } },
  file: {
    validation: { max_files: 5, max_file_size_mb: 10, allowed_file_types: [".pdf", ".jpg", ".png"] }
  }
};

/** Formatos que se pueden marcar en una pregunta de archivo. */
export const FILE_TYPE_OPTIONS = [".pdf", ".jpg", ".png", ".docx", ".xlsx"];

/** Topes del backend: archivos por pregunta y decimales de un número. */
export const MAX_FILES_LIMIT = 10;
export const MAX_DECIMALS = 6;

/** Color del estado; el nombre llega de GET /visit-forms/statuses. */
export const STATUS_COLORS: Record<IVisitFormStatus, string> = {
  ACTIVE: "#9bb514",
  INACTIVE: "#8a8a8a"
};

/** "Parcial" es una respuesta que el asesor guardó sin finalizar. Nombre: `surveys.responseStatus`. */
export const RESPONSE_STATUS: Record<IVisitFormResponseStatus, { color: string }> = {
  COMPLETED: { color: "#9bb514" },
  DRAFT: { color: "#ff6a13" }
};

export const EMPTY_VISIT_FORMS_FILTERS: IVisitFormsFilters = {
  status: [],
  created_by: [],
  from: null,
  to: null
};

/** Lo actualizado más reciente primero. Las columnas son campos de IVisitFormListItem. */
export const DEFAULT_SURVEYS_SORT: SortState = { col: "updated_at", dir: "desc" };

/** Columnas que arrancan ascendentes al ordenar; números y fechas arrancan descendentes. */
export const SURVEYS_TEXTUAL_COLS = ["name", "status", "created_by_name"];

export const RESPONSES_PAGE_SIZE = 25;

const today = () => dayjs();
const fmt = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");
const range = (from: dayjs.Dayjs, to: dayjs.Dayjs = today()) => ({ from: fmt(from), to: fmt(to) });

export type ExportPeriodId =
  | "hoy"
  | "semana"
  | "mes"
  | "mes_anterior"
  | "trimestre"
  | "ytd"
  | "doce_meses";

/** Periodos de "Descargar respuestas"; el backend acepta hasta 366 días. Nombre: `surveys.exportPeriods`. */
export const EXPORT_PERIODS: {
  id: ExportPeriodId;
  resolve: () => { from: string; to: string };
}[] = [
  { id: "hoy", resolve: () => range(today()) },
  {
    id: "semana",
    resolve: () => range(today().subtract((today().day() + 6) % 7, "day"))
  },
  { id: "mes", resolve: () => range(today().startOf("month")) },
  {
    id: "mes_anterior",
    resolve: () => {
      const prev = today().subtract(1, "month");
      return range(prev.startOf("month"), prev.endOf("month"));
    }
  },
  {
    id: "trimestre",
    resolve: () => range(today().subtract(3, "month"))
  },
  { id: "ytd", resolve: () => range(today().startOf("year")) },
  {
    id: "doce_meses",
    resolve: () => range(today().subtract(12, "month"))
  }
];
