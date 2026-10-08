import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";

// Valor real que entrega el backend en GET /data/bots/status. Los 6 valores son
// estados finales propios (PENDIENTE y SIN_EJECUCIONES NO son "En revisión": cada
// uno se muestra con su propia etiqueta, ver constants.ts -> BOT_STATUS_META).
export type BotStatus = IBotStatusItem["estado"];
export type BotStatusFilter = BotStatus | "all";

// Resumen para las cards. Total = bots.length (no la suma de los 4 campos: pueden
// existir bots PENDIENTE/SIN_EJECUCIONES que cuentan en el total pero no tienen
// card propia).
export interface IBotsSummary {
  total: number;
  EXITOSO: number;
  FALLIDO: number;
  EN_EJECUCION: number;
  EN_REVISION: number;
}

