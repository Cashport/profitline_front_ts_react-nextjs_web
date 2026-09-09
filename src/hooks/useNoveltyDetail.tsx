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

export type IIncidentDocumentInactiveReason =
  | "PAID"
  | "MANUALLY_REMOVED"
  | "CANCELLED"
  | "OTHER";

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
  is_open: boolean;
  client: string;
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
  incidentId: number;
}

export const useIncidentDetail = (props: UseIncidentDetailProps) => {
  const { data, isLoading, mutate } = useSWR<IIncidentDetailResponse>(
    `/invoice/incident-detail/${props.incidentId}`,
    fetcher,
    {}
  );

  return {
    data: data?.data,
    isLoading,
    mutate
  };
};
