import useSWR from "swr";
import { fetcher } from "@/utils/api/api";

interface IEvent {
  approved_by: string | null;
  rejected_by: string | null;
  created_at: string;
  created_by: string;
  comments: string;
  files: any[]; // You might want to define a more specific type for files
}

export type IIncidentDocumentType = "FINANCIAL_RECORD" | "BALANCE";

export type IIncidentDocumentInactiveReason = "PAID" | "MANUALLY_REMOVED" | "CANCELLED" | "OTHER";

// Un documento (factura o saldo) asociado a la novedad. `active: false`
// significa que el documento ya salió de cartera (pagado/cerrado) pero se
// conserva en el histórico (ver "Ver cerradas").
export interface IIncidentDocument {
  incident_document_id: number | null;
  document_type: IIncidentDocumentType;
  document_id: number;
  id_erp: string | null;
  initial_amount: number;
  actual_amount: number;
  active: boolean;
  inactive_reason: IIncidentDocumentInactiveReason | null;
  date_inactivated: string | null;
  user_inactivated: number | null;
}

export interface IIncidentDetail {
  incident_id: number;
  // Legado (novedades de 1 sola factura, creadas antes del modelo
  // multi-documento): pueden venir undefined en novedades nuevas.
  invoice_id?: number;
  id_erp?: string;
  invoice_client_value?: number;
  evidence_comments: string;
  evidence_files: string[]; // You might want to define a more specific type
  date: string;
  invoice_amount_difference: number | null;
  incident_name: string;
  is_open?: boolean;
  client: string | null;
  client_id: string;
  client_uuid: string | null;
  responsible_user: string;
  invoice_cashport_value: number;
  approvers_users: string;
  events: IEvent[];
  is_rejected: number | null;
  client_amount: number;
  status: number;
  status_name: string;
  // Gestión de la novedad (bandeja de novedades): responsable asignado,
  // próximo ticket, fecha límite, estado del catálogo y última gestión.
  assigned_to: number | null;
  assigned_to_name: string | null;
  next_ticket_date: string | null;
  limit_date: string | null;
  novelty_status_id: number | null;
  novelty_status_name: string | null;
  novelty_status_color: string | null;
  last_management_at: string | null;
  // Modelo multi-documento (RN01-RN09): totales sobre TODOS los documentos
  // asociados (initial_*) y solo los activos (actual_*), más el detalle de
  // cada documento (incluye cerrados, para el toggle "Ver cerradas").
  documents: IIncidentDocument[];
  initial_amount: number;
  initial_count: number;
  actual_amount: number;
  actual_count: number;
  // RN09: derivado (actual_count llegó a 0 tras tener documentos), no es un
  // estado persistido en `status`.
  is_closed: boolean;
}

interface IIncidentDetailResponse {
  status: number;
  message: string;
  data: IIncidentDetail[];
}

interface UseIncidentDetailProps {
  /** Sin id no se pide nada (grupos de cartera que no son novedad). */
  incidentId?: number | null;
}

export const useIncidentDetail = (props: UseIncidentDetailProps) => {
  const { data, error, isLoading, mutate } = useSWR<IIncidentDetailResponse>(
    props.incidentId ? `/invoice/incident-detail/${props.incidentId}` : null,
    fetcher,
    {}
  );

  return {
    data: data?.data,
    error,
    isLoading,
    mutate
  };
};
