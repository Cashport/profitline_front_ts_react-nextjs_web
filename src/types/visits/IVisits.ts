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
  /** Código del estado en ese punto; `state_name` trae la etiqueta. */
  state: string;
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
  /** Código del estado al reportar la posición. */
  state: string;
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
  /**
   * Código del estado (por ahora IN_TRANSIT, ON_PAUSE, IN_VISIT; faltan por confirmar
   * los demás); `state_name` trae la etiqueta ("En visita").
   */
  state: string;
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
