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

/** Tipos de pregunta en el orden del menú "Agregar pregunta"; las llaves son los códigos del backend. */
export const QUESTION_TYPES: Record<
  IVisitFormQuestionType,
  { label: string; hint: string; Icon: LucideIcon }
> = {
  text: { label: "Texto corto", hint: "Respuesta en una línea", Icon: Type },
  textarea: { label: "Texto largo", hint: "Párrafo con límite", Icon: AlignLeft },
  number: { label: "Número", hint: "Valor con mínimo y máximo", Icon: Hash },
  document: { label: "Documento", hint: "Solo dígitos (cédula, código)", Icon: IdCard },
  dropdown: {
    label: "Lista desplegable",
    hint: "Una opción de una lista",
    Icon: SquareChevronDown
  },
  single_select: { label: "Opción única", hint: "Ej. Sí / No", Icon: CircleDot },
  multi_select: { label: "Selección múltiple", hint: "Puede marcar varias", Icon: ListChecks },
  date: { label: "Fecha", hint: "Día, mes y año", Icon: Calendar },
  email: { label: "Correo", hint: "Correo electrónico", Icon: Mail },
  phone: { label: "Teléfono", hint: "Número de contacto", Icon: Phone },
  location: { label: "Ubicación", hint: "GPS del punto", Icon: MapPin },
  photo: { label: "Fotografía", hint: "Cámara del dispositivo", Icon: Camera },
  file: { label: "Archivo", hint: "PDF, imágenes u otros", Icon: Paperclip }
};

export const QUESTION_TYPE_ORDER = Object.keys(QUESTION_TYPES) as IVisitFormQuestionType[];

/** Tipos cuya respuesta es una de sus `options`: las únicas que pueden condicionar otra pregunta. */
export const OPTION_TYPES: IVisitFormQuestionType[] = ["single_select", "dropdown", "multi_select"];

/** Con qué arranca una pregunta nueva de cada tipo (los valores por defecto del diseño). */
export const NEW_QUESTION_DEFAULTS: Partial<
  Record<
    IVisitFormQuestionType,
    Pick<IVisitFormQuestion, "placeholder" | "validation"> & { optionLabels?: string[] }
  >
> = {
  text: { placeholder: "Escribe tu respuesta...", validation: { max_length: 120 } },
  textarea: { placeholder: "Escribe tus observaciones...", validation: { max_length: 500 } },
  number: { placeholder: "Ingresa un valor" },
  document: { placeholder: "Ingresa el número", validation: { max_length: 15 } },
  phone: { placeholder: "Ingresa el teléfono" },
  email: { placeholder: "correo@ejemplo.com" },
  single_select: { optionLabels: ["Sí", "No"] },
  dropdown: { optionLabels: ["Opción 1", "Opción 2", "Opción 3"] },
  multi_select: { optionLabels: ["Opción 1", "Opción 2"] },
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

/** "Parcial" es una respuesta que el asesor guardó sin finalizar. */
export const RESPONSE_STATUS: Record<IVisitFormResponseStatus, { label: string; color: string }> = {
  COMPLETED: { label: "Completa", color: "#9bb514" },
  DRAFT: { label: "Parcial", color: "#ff6a13" }
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

/** Periodos de "Descargar respuestas"; el backend acepta hasta 366 días. */
export const EXPORT_PERIODS: {
  id: string;
  label: string;
  resolve: () => { from: string; to: string };
}[] = [
  { id: "hoy", label: "Hoy", resolve: () => range(today()) },
  {
    id: "semana",
    label: "Esta semana",
    resolve: () => range(today().subtract((today().day() + 6) % 7, "day"))
  },
  { id: "mes", label: "Mes actual", resolve: () => range(today().startOf("month")) },
  {
    id: "mes_anterior",
    label: "Último mes",
    resolve: () => {
      const prev = today().subtract(1, "month");
      return range(prev.startOf("month"), prev.endOf("month"));
    }
  },
  {
    id: "trimestre",
    label: "Último trimestre",
    resolve: () => range(today().subtract(3, "month"))
  },
  { id: "ytd", label: "YTD", resolve: () => range(today().startOf("year")) },
  {
    id: "doce_meses",
    label: "Últimos 12 meses",
    resolve: () => range(today().subtract(12, "month"))
  }
];
