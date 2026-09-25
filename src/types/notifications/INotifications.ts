export interface INotification {
  create_at: string;
  notification_type_name: string;
  client_name: string;
  incident_id: number | null;
  is_client_change: number;
  client_update_changes: Record<string, any>;
  days: string;
  id: number;
  is_read: number;
  id_erp: number;
  incident_motive: string;
}

/** Ítem de GET /notification/project/:project_id/client/:client_id. */
export interface INotificationByClient extends Omit<INotification, "id_erp"> {
  /** Documento asociado; llega `null` en novedades sin factura (p. ej. bloqueos de pedido). */
  id_erp: string | null;
  flow_status_id: number;
}
