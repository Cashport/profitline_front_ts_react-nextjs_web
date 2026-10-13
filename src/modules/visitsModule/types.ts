import type {
  ITrackingLocationState,
  IUserState,
  IVisitStatusCode
} from "@/types/visits/IVisits";

/**
 * Coordenada en orden GeoJSON/Mapbox: [longitud, latitud]. El prototipo usaba
 * el [lat, lng] de Leaflet; aquí todo viaja ya en el orden del mapa.
 */
export type LngLat = [number, number];

/** Estado del asesor en la pantalla: el `state` que manda el backend, tal cual. */
export type AdvisorStatus = IUserState;

/** Estado de cada tramo del recorrido: el `state` de los puntos de `locations`. */
export type SegmentKind = ITrackingLocationState;

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

export interface ITrackPoint {
  t: number;
  position: LngLat;
  /** Kilómetros acumulados desde el inicio de la jornada. */
  km: number;
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

/** Tramo continuo en un mismo estado, armado con los puntos de `locations` del API. */
export interface ILiveRun {
  status: SegmentKind;
  /** Etiqueta del backend (`state_name`). */
  label: string;
  start: number;
  /** null mientras siga abierto: el último tramo. */
  end: number | null;
  /** Dónde empezó el tramo. */
  position: LngLat;
}

export interface ILiveNextVisit {
  clientName: string;
  /** NIT del cliente: hace las veces de su código. */
  nit: string;
  start: number;
  end: number;
  /** null mientras el cliente no tenga coordenadas. */
  position: LngLat | null;
}

/**
 * Asesor del mapa, la línea de tiempo y el ranking: de GET /visit-admin/today-visits
 * (cada `user`) o, el abierto, de su detalle del día. Los tiempos van en minutos desde
 * medianoche. Lo que el backend aún no envía queda en null y se pinta "XX" (MISSING);
 * "—" es para lo que llega, pero vacío.
 */
export interface ILiveAdvisor {
  id: number;
  name: string;
  initials: string;
  /** Estado según el backend (`state`): no cambia con el minuto que se mira. */
  status: AdvisorStatus;
  /** Etiqueta del backend (`state_name`). */
  statusLabel: string;
  /** completed + failed + pending = total; `done` = completed + failed. */
  visits: { total: number; completed: number; failed: number; pending: number; done: number };
  next: ILiveNextVisit | null;
  /** Primer punto del día: inicio de jornada. */
  dayStart: number | null;
  /** Puntos del día en orden, con los km acumulados desde el primero. */
  track: ITrackPoint[];
  /** Tramos por estado, seguidos: cada uno termina donde empieza el siguiente. */
  runs: ILiveRun[];
  /** Aún no llega del backend: siempre null por ahora. */
  project: AdvisorProject | null;
  /* null en today-visits; el asesor abierto los trae de su detalle del día. */
  /** Cliente de la visita en curso. */
  currentClient: string | null;
  zoneName: string | null;
  /** Meta diaria de actividades exitosas. */
  goal: number | null;
  activitiesOk: number | null;
}

/** Estado de un asesor (el del backend) y su tramo de puntos en un minuto dado. */
export interface ILiveState {
  status: AdvisorStatus;
  /** Etiqueta del backend (`state_name`). */
  label: string;
  /** Tramo en curso en ese minuto; null antes del primer punto. */
  run: ILiveRun | null;
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
  /** Estados del asesor y de los tramos del recorrido. */
  status: Record<AdvisorStatus | SegmentKind, string>;
  result: Record<VisitResult, string>;
  /** Estado de cada visita de la ruta (`status_code`). */
  visit: Record<IVisitStatusCode, string>;
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
