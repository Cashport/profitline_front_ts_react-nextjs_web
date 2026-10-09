/** Estado operativo del asesor (`state` de today-visits y del detalle del día). */
export type IUserState = "IN_VISIT" | "AT_POINT" | "EN_ROUTE" | "NO_VISITS";

/** Estado de cada punto del recorrido (`state` de `locations`). */
export type ITrackingLocationState = "IN_VISIT" | "IN_TRANSIT" | "ON_PAUSE";

/** Estado de una visita de la ruta (`status_code`); `status_name` trae la etiqueta. */
export type IVisitStatusCode =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NOT_COMPLETED"
  | "RESCHEDULED"
  | "CANCELLED";

export interface ITodayVisitsUserInfo {
  id: number;
  uuid: string;
  userName: string;
  email: string;
}

/** Punto del recorrido del día. */
export interface ITodayVisitsLocation {
  latitude: number;
  longitude: number;
  /** ISO8601. */
  timestamp: string;
  /** `state_name` trae la etiqueta ("En tránsito"). */
  state: ITrackingLocationState;
  state_name: string;
  /** Metros desde el punto anterior; no llega en todos los puntos. */
  distanceFromPreviousMeters?: number | null;
  /** Sólo se ha visto en null: falta confirmar el tipo con backend. */
  clientId: string | number | null;
  /** Visita en curso; sólo llega en los puntos en visita. */
  activeVisitId?: number;
}

/** Última posición reportada por el asesor. */
export interface ITodayVisitsPosition {
  latitude: number;
  longitude: number;
  /** ISO8601. */
  timestamp: string;
  projectId: number;
  /** Sólo se ha visto en null: falta confirmar el tipo con backend. */
  clientId: string | number | null;
  /** Estado al reportar la posición; a diferencia de `locations`, sin etiqueta. */
  state: ITrackingLocationState;
  /** Visita en curso, cuando está en visita. */
  activeVisitId?: number | null;
  distanceFromPreviousMeters: number | null;
  /** uid de Firebase; el mismo que `user.uuid`. */
  userId: string;
}

export interface ITodayVisitsNextVisit {
  id: number;
  client_nit: string;
  client_name: string;
  address: string;
  /** null mientras el cliente no tenga coordenadas. */
  latitude: number | null;
  longitude: number | null;
  /** ISO8601. Por ahora llegan horarios de prueba. */
  scheduled_start_at: string;
  scheduled_end_at: string;
}

/** Fila de GET /visit-admin/today-visits: avance del día de un asesor. */
export interface ITodayVisitsUser {
  user: ITodayVisitsUserInfo;
  user_id: number;
  /** completed + failed + pending. */
  total_visits: number;
  completed_visits: number;
  failed_visits: number;
  /** Por hacer, incluida la visita en curso. */
  pending_visits: number;
  /** `state_name` trae la etiqueta ("En viaje"). */
  state: IUserState;
  state_name: string;
  /** null cuando el asesor aún no reporta posición (por confirmar con backend). */
  current_position: ITodayVisitsPosition | null;
  /** Recorrido del día, en orden cronológico. */
  locations: ITodayVisitsLocation[];
  /** null cuando no le quedan visitas pendientes (por confirmar con backend). */
  next_visit: ITodayVisitsNextVisit | null;
}

export interface ITodayVisitsSummary {
  total_visits: number;
  total_users: number;
  completed_visits: number;
  failed_visits: number;
}

/** Cuerpo (`data`) de GET /visit-admin/today-visits. */
export interface ITodayVisits {
  users: ITodayVisitsUser[];
  summary: ITodayVisitsSummary;
}

/** Actividades de una hora del día. */
export interface IAdvisorVisitDetailHourCount {
  /** Hora local, 0 a 23 (11 = de 11:00 a 11:59). */
  hour: number;
  count: number;
}

/** Actividades del día frente a la meta del asesor. */
export interface IAdvisorVisitDetailActivities {
  effective: number;
  registered: number;
  goal: number;
  goal_pct: number;
  pace_per_hour: number;
  /** Proyección al cierre; null mientras no haya con qué proyectar. */
  projection: number | null;
  projection_pct: number | null;
  /** Sólo las horas con actividades. */
  by_hour: IAdvisorVisitDetailHourCount[];
  best_hour: IAdvisorVisitDetailHourCount | null;
}

/** Puesto del asesor en el ranking del día. */
export interface IAdvisorVisitDetailRanking {
  /** null mientras no tenga puesto (por confirmar con backend). */
  position: number | null;
  total: number;
  completed: number;
}

/** Visita de la ruta del día. */
export interface IAdvisorVisitDetailRouteVisit {
  visit_id: number;
  client_nit: string;
  client_name: string;
  address: string;
  status_code: IVisitStatusCode;
  status_name: string;
  /** ISO8601. */
  scheduled_start_at: string;
  scheduled_end_at: string;
  /** ISO8601; null mientras la visita no empiece o no termine. */
  started_at: string | null;
  finished_at: string | null;
  duration_minutes: number | null;
}

export interface IAdvisorVisitDetailVisits {
  /** completed + failed + pending. */
  total: number;
  completed: number;
  failed: number;
  pending: number;
  /** null mientras no haya visitas cerradas (por confirmar con backend). */
  success_rate_pct: number | null;
  effectivity_pct: number | null;
  average_duration_minutes: number | null;
  total_visit_minutes: number | null;
  /** Sólo se ha visto en null: falta confirmar el tipo con backend. */
  current_visit: unknown;
  route: IAdvisorVisitDetailRouteVisit[];
}

/** Recorrido del día. */
export interface IAdvisorVisitDetailTracking {
  /** ISO8601; null mientras no haya puntos (por confirmar con backend). */
  started_at: string | null;
  last_signal_at: string | null;
  last_signal_seconds_ago: number | null;
  distance_meters: number;
  distance_km: number;
  /** Puntos del día, en orden cronológico; el último es la última posición conocida. */
  locations: ITodayVisitsLocation[];
}

/** Actividad registrada en el día. */
export interface IAdvisorVisitDetailRegister {
  response_id: number;
  visit_id: number;
  client_nit: string;
  client_name: string;
  /** ISO8601. */
  at: string;
  effective: boolean;
}

/** Cuerpo (`data`) de GET /visit-admin/users/:user_id/day-detail: el día de un asesor. */
export interface IAdvisorVisitDetail {
  user: ITodayVisitsUserInfo;
  user_id: number;
  zones: string[];
  /** `state_name` trae la etiqueta ("En viaje"). */
  state: IUserState;
  state_name: string;
  /** ISO8601: cuándo se armó el detalle. */
  generated_at: string;
  activities: IAdvisorVisitDetailActivities;
  ranking: IAdvisorVisitDetailRanking;
  visits: IAdvisorVisitDetailVisits;
  tracking: IAdvisorVisitDetailTracking;
  register: IAdvisorVisitDetailRegister[];
}
