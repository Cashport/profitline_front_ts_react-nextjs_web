/**
 * Coordenada en orden GeoJSON/MapLibre: [longitud, latitud]. El prototipo usaba
 * el [lat, lng] de Leaflet; aquí todo viaja ya en el orden del mapa.
 */
export type LngLat = [number, number];

/** Estado del asesor en un minuto dado del día. */
export type AdvisorStatus = "visita" | "transito" | "pausa" | "sinsenal" | "nostart" | "fin";

/** Resultado con el que se cierra una visita. */
export type VisitResult = "efectiva" | "reprogramada" | "sincontacto";

/** Proyecto del asesor: define qué cuenta como actividad exitosa. */
export type AdvisorProject = "ventas" | "cartera" | "encuestas";

/** Ruta de visitas o punto fijo (un solo cliente todo el día). */
export type OperationType = "ruta" | "fijo";

/** Qué día se mira respecto a hoy: cambia el reloj, las capas y las etiquetas. */
export type DayMode = "past" | "today" | "future";

export interface IVisitsZone {
  id: string;
  name: string;
  city: string;
  center: LngLat;
}

export interface IVisitsClient {
  id: number;
  code: string;
  name: string;
  zoneId: string;
  position: LngLat;
}

/** Los tiempos de la jornada van en minutos desde medianoche (pueden traer decimales). */
export interface IAdvisorVisit {
  type: "visita";
  client: IVisitsClient;
  start: number;
  end: number;
  /** Dónde marcó el check-in; difiere del cliente cuando cae fuera de la geocerca. */
  checkIn: LngLat;
  result: VisitResult;
  outsideGeofence: boolean;
  /** Distancia del check-in al cliente, en metros (0 dentro de la geocerca). */
  offsetMeters: number;
}

export interface IAdvisorPause {
  type: "pausa";
  start: number;
  end: number;
  position: LngLat;
}

export type AdvisorItem = IAdvisorVisit | IAdvisorPause;

export interface ITrackPoint {
  t: number;
  position: LngLat;
  /** Kilómetros acumulados desde el inicio de la jornada. */
  km: number;
}

/** Actividad registrada (venta, acuerdo de pago o encuesta, según el proyecto). */
export interface IAdvisorActivity {
  t: number;
  ok: boolean;
}

export interface IVisitsAdvisor {
  id: number;
  name: string;
  initials: string;
  code: string;
  zoneId: string;
  project: AdvisorProject;
  fixed: boolean;
  /** Punto donde abre la jornada. */
  base: LngLat;
  /** Minuto en que abre la jornada. */
  dayStart: number;
  /** Meta diaria de actividades exitosas. */
  goal: number;
  /** Visitas y pausas del día, en orden. */
  items: AdvisorItem[];
  track: ITrackPoint[];
  activities: IAdvisorActivity[];
  /** Tramos sin señal ya recuperados: [inicio, fin]. */
  signalGaps: [number, number][];
  /** Última señal, cuando el asesor la perdió y no ha vuelto. */
  lastPing?: number;
  battery: number;
  gpsAccuracy: number;
}

/** Lo que devuelve el día: la forma que debe traer el backend. */
export interface IVisitsDay {
  date: string;
  zones: IVisitsZone[];
  clients: IVisitsClient[];
  advisors: IVisitsAdvisor[];
}

/** Filtros confirmados de la pantalla; cada categoría es una lista (OR dentro, AND entre). */
export interface IVisitsFilters {
  project: AdvisorProject[];
  operation: OperationType[];
  zone: string[];
  city: string[];
  advisor: number[];
  client: number[];
  status: AdvisorStatus[];
  result: VisitResult[];
}

export interface IAdvisorState {
  status: AdvisorStatus;
  /** Visita o pausa en curso, o en la que estaba al perder la señal. */
  item?: AdvisorItem;
  /** Próxima visita, cuando va en tránsito. */
  next?: IAdvisorVisit;
  /** Desde cuándo no hay señal: la última señal o el inicio del tramo sin señal. */
  signalLostAt?: number;
}

export interface IVisitsLayers {
  track: boolean;
  plan: boolean;
  clients: boolean;
}

/** A dónde mover la cámara del mapa. */
export type VisitsCameraTarget =
  | { kind: "fit-all" }
  | { kind: "fit-advisor"; advisorId: number }
  | { kind: "fly-to"; center: LngLat };

/** Pedido de cámara; el id cambia en cada pedido para que se repita aunque sea igual. */
export type VisitsCameraRequest = VisitsCameraTarget & { id: number };

export interface IVisitsPalette {
  status: Record<AdvisorStatus, string>;
  result: Record<VisitResult, string>;
  /** Verde de marca: visita en curso, recorrido enfocado. */
  accent: string;
  /** Visitas pendientes. */
  bone: string;
  ink: string;
  ink2: string;
  ink3: string;
  /** Contorno bajo el recorrido del asesor enfocado. */
  under: string;
}
