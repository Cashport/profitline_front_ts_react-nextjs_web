import config from "@/config";

import type {
  AdvisorProject,
  AdvisorStatus,
  IVisitsFilters,
  IVisitsLayers,
  IVisitsPalette,
  LngLat,
  OperationType,
  VisitResult
} from "./types";

/** Ventana de la jornada que pinta la línea de tiempo, en minutos desde medianoche. */
export const DAY_START_MIN = 7 * 60;
export const DAY_END_MIN = 18 * 60 + 30;
/** Hasta dónde se proyectan las actividades del día (cierre operativo, 17:30). */
export const PROJECTION_END_MIN = DAY_END_MIN - 60;
/** Ancho de cada barra de la vista general de la línea de tiempo. */
export const TIMELINE_BUCKET_MIN = 10;
/** Horas que muestran los gráficos de actividades por hora (7:00 a 17:00). */
export const ACTIVITY_HOURS = Array.from({ length: 11 }, (_, i) => 7 + i);

export const PLAYBACK_TICK_MS = 60;
export const PLAYBACK_SPEEDS = [1, 4] as const;
export const SEEK_STEP_MIN = 5;

export const STATUS_LABELS: Record<AdvisorStatus, string> = {
  visita: "En visita",
  transito: "En tránsito",
  pausa: "En pausa",
  sinsenal: "Sin señal",
  nostart: "Sin iniciar",
  fin: "Jornada cerrada"
};

/** En un día futuro nadie ha empezado: "Sin iniciar" se lee como "Programado". */
export const statusLabel = (status: AdvisorStatus, future: boolean) =>
  future && status === "nostart" ? "Programado" : STATUS_LABELS[status];

/** Orden de los chips de estado y de las opciones del filtro Estado. */
export const STATUS_ORDER: AdvisorStatus[] = [
  "visita",
  "transito",
  "pausa",
  "sinsenal",
  "nostart",
  "fin"
];

/** Estados que cuentan como activos en los KPIs y en las barras de la línea de tiempo. */
export const ACTIVE_STATUSES: AdvisorStatus[] = ["visita", "transito", "pausa"];

/** Dato que el backend aún no envía: se pinta así a propósito, para ver qué falta. */
export const MISSING = "XX";

/**
 * Código de estado del API (`state`) → estado de la pantalla. Los códigos que no estén
 * aquí se pintan como "nostart" (gris), con la etiqueta que manda el backend.
 */
export const API_STATUS: Record<string, AdvisorStatus> = {
  IN_VISIT: "visita",
  IN_TRANSIT: "transito",
  ON_PAUSE: "pausa"
};

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
      visita: "#5f9400",
      transito: "#1677ff",
      pausa: "#c98200",
      sinsenal: "#e5484d",
      nostart: "#8a8a8a",
      fin: "#141414"
    },
    result: { efectiva: "#5f9400", reprogramada: "#138a9e", sincontacto: "#c98200" },
    accent: "#cbe71e",
    bone: "#9a9a9a",
    ink: "#141414",
    ink2: "#4a4a4a",
    ink3: "#8a8a8a",
    under: "#141414"
  },
  dark: {
    status: {
      visita: "#9fcc1a",
      transito: "#4d9fff",
      pausa: "#f0b429",
      sinsenal: "#ff6b6b",
      nostart: "#8a8a8a",
      fin: "#f2f2f2"
    },
    result: { efectiva: "#9fcc1a", reprogramada: "#2bc0d6", sincontacto: "#f0b429" },
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
 * Mapas base de CARTO, uno por tema. CARTO exige la llave (`?key=`); sin ella las
 * teselas llegan con la marca "API KEY REQUIRED".
 */
const cartoKey = config.CARTO_KEY ? `?key=${config.CARTO_KEY}` : "";
const cartoTiles = (style: "light_all" | "dark_all") =>
  ["a", "b", "c", "d"].map(
    (s) => `https://${s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}.png${cartoKey}`
  );

export const BASEMAP_TILES = {
  light: cartoTiles("light_all"),
  dark: cartoTiles("dark_all")
};

export const BASEMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
