import type {
  AdvisorProject,
  AdvisorStatus,
  IVisitsFilters,
  IVisitsLayers,
  IVisitsPalette,
  LngLat,
  OperationType,
  SegmentKind,
  VisitResult
} from "./types";

/** Ventana de la jornada que pinta la línea de tiempo, en minutos desde medianoche. */
export const DAY_START_MIN = 7 * 60;
export const DAY_END_MIN = 18 * 60 + 30;
/** Ancho de cada barra de la vista general de la línea de tiempo. */
export const TIMELINE_BUCKET_MIN = 10;
/** Horas que muestran los gráficos de actividades por hora (7:00 a 17:00). */
export const ACTIVITY_HOURS = Array.from({ length: 11 }, (_, i) => 7 + i);

export const PLAYBACK_TICK_MS = 60;
export const PLAYBACK_SPEEDS = [1, 4] as const;
export const SEEK_STEP_MIN = 5;

/**
 * Chips, filtro y leyendas. El asesor y cada punto traen su propia etiqueta
 * (`state_name`); éstas son para cuando se habla del estado en general.
 */
export const STATUS_LABELS: Record<AdvisorStatus | SegmentKind, string> = {
  IN_VISIT: "En visita",
  AT_POINT: "En punto",
  EN_ROUTE: "En viaje",
  NO_VISITS: "Sin visitas",
  IN_TRANSIT: "En tránsito",
  ON_PAUSE: "En pausa"
};

/** Orden de los chips de estado y de las opciones del filtro Estado. */
export const STATUS_ORDER: AdvisorStatus[] = ["IN_VISIT", "AT_POINT", "EN_ROUTE", "NO_VISITS"];

/** Estados en los que el asesor cuenta como activo (KPIs y pulso del pin). */
export const ACTIVE_STATUSES: AdvisorStatus[] = ["IN_VISIT", "AT_POINT", "EN_ROUTE"];

/** Tramos del recorrido: leyenda y barras de la línea de tiempo. */
export const SEGMENT_KINDS: SegmentKind[] = ["IN_VISIT", "IN_TRANSIT", "ON_PAUSE"];

/** Dato que el backend aún no envía: se pinta así a propósito, para ver qué falta. */
export const MISSING = "XX";

export const RESULT_LABELS: Record<VisitResult, string> = {
  efectiva: "Efectiva",
  reprogramada: "Reprogramada",
  sincontacto: "Sin contacto"
};

export const RESULT_ORDER: VisitResult[] = ["efectiva", "reprogramada", "sincontacto"];

export const PROJECTS: Record<AdvisorProject, { name: string; unit: string; definition: string }> =
  {
    ventas: {
      name: "Ventas",
      unit: "ventas",
      definition: "Formulario de venta con pedido cerrado"
    },
    cartera: {
      name: "Cartera",
      unit: "acuerdos y pagos",
      definition: "Acuerdo de pago o pago registrado en cartera"
    },
    encuestas: {
      name: "Encuestas",
      unit: "encuestas",
      definition: "Encuesta completa y enviada"
    }
  };

export const PROJECT_ORDER: AdvisorProject[] = ["ventas", "cartera", "encuestas"];

export const OPERATION_LABELS: Record<OperationType, string> = {
  ruta: "Ruta de visitas",
  fijo: "Punto fijo"
};

export const OPERATION_ORDER: OperationType[] = ["ruta", "fijo"];

export const EMPTY_VISITS_FILTERS: IVisitsFilters = {
  project: [],
  operation: [],
  zone: [],
  city: [],
  advisor: [],
  client: [],
  status: [],
  result: []
};

/** Capas visibles al abrir un día: en uno futuro sólo hay plan, no recorrido. */
export const layersFor = (future: boolean): IVisitsLayers => ({
  track: !future,
  plan: future,
  clients: true
});

/**
 * Colores semánticos por tema. Los mismos valores pintan la interfaz (estilos en
 * línea) y las capas WebGL del mapa, que no leen variables CSS. Superficies,
 * textos y bordes salen de los tokens de tailwind.css.
 */
export const VISITS_PALETTE: Record<"light" | "dark", IVisitsPalette> = {
  light: {
    status: {
      IN_VISIT: "#5f9400",
      AT_POINT: "#7c5cff",
      EN_ROUTE: "#1677ff",
      NO_VISITS: "#8a8a8a",
      IN_TRANSIT: "#1677ff",
      ON_PAUSE: "#c98200"
    },
    result: { efectiva: "#5f9400", reprogramada: "#138a9e", sincontacto: "#c98200" },
    visit: {
      SCHEDULED: "#8a8a8a",
      IN_PROGRESS: "#cbe71e",
      COMPLETED: "#5f9400",
      NOT_COMPLETED: "#c98200",
      RESCHEDULED: "#138a9e",
      CANCELLED: "#8a8a8a"
    },
    accent: "#cbe71e",
    bone: "#9a9a9a",
    ink: "#141414",
    ink2: "#4a4a4a",
    ink3: "#8a8a8a",
    under: "#141414"
  },
  dark: {
    status: {
      IN_VISIT: "#9fcc1a",
      AT_POINT: "#a594ff",
      EN_ROUTE: "#4d9fff",
      NO_VISITS: "#8a8a8a",
      IN_TRANSIT: "#4d9fff",
      ON_PAUSE: "#f0b429"
    },
    result: { efectiva: "#9fcc1a", reprogramada: "#2bc0d6", sincontacto: "#f0b429" },
    visit: {
      SCHEDULED: "#8a8a8a",
      IN_PROGRESS: "#cbe71e",
      COMPLETED: "#9fcc1a",
      NOT_COMPLETED: "#f0b429",
      RESCHEDULED: "#2bc0d6",
      CANCELLED: "#8a8a8a"
    },
    accent: "#cbe71e",
    bone: "#9a9a9a",
    ink: "#f2f2f2",
    ink2: "#bdbdbd",
    ink3: "#8a8a8a",
    under: "#000000"
  }
};

/** Bogotá. */
export const MAP_CENTER: LngLat = [-74.09, 4.66];
export const MAP_ZOOM = 12;

/**
 * Mapas base de Mapbox, uno por tema (los equivalentes de Positron y Dark Matter).
 * La atribución la trae el propio estilo.
 */
export const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11"
};
