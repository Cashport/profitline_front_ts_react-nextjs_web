// Estados de negocio autorizados para la UI (ver botStatusMap.tsx).
export type BotHealthStatus = "Operativo" | "Con fallas" | "Ejecutando" | "En revisión";

// Valores reales que envía BotStatusDTO.estado (cashport-backend, data.service.ts).
export type BotRawStatus = "SIN_EJECUCIONES" | "PENDIENTE" | "EN_EJECUCION" | "EXITOSO" | "FALLIDO";

// Espejo 1:1 de BotStatusDTO (cashport-backend/src/model/data/data.dto.ts).
export interface IBotHealth {
  schedule_id: number;
  id_client_data: number;
  cliente: string;
  bot: string;
  pais: string | null;
  tipo_archivo: string | null;
  periodicidad: string[];
  proxima_ejecucion: string | null;
  ultima_ejecucion: string | null;
  estado: BotRawStatus;
  cantidad_ejecuciones: number;
  error: string | null;
  error_legible: string | null;
  codigo_error: string | null;
  categoria_error: string | null;
  diagnostico: string | null;
  detalle_tecnico: string | null;
  paso_fallido: string | null;
  accion_requerida: string | null;
  // BACKEND PENDIENTE: confirmar nombre y disponibilidad del campo de evidencia/captura.
  evidencia_url?: string | null;
}

export interface IBotHealthSummary {
  total: number;
  operativo: number;
  con_fallas: number;
  ejecutando: number;
  en_revision: number;
}

export interface IBotHealthResponse {
  status: number;
  message: string;
  data: IBotHealth[];
}

// Espejo 1:1 de BotRunNowResultDTO (cashport-backend), respuesta de
// POST /data/bots/run-now/:scheduleId.
export interface IBotRunNowResult {
  scheduleId: number;
  accepted: boolean;
  schedulerStatus: number;
  schedulerMessage: string;
}

export type { Pagination };

