import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";

export type BotStatus = IBotStatusItem["estado"];
export type BotStatusFilter = BotStatus | "all";

/** Una corrida del bot: cuándo se ejecutó, cómo terminó y, si falló, el motivo. */
export interface IBotRun {
  date: string;
  time: string;
  status: Exclude<BotStatus, "EN_EJECUCION">;
  duration: string;
  message?: string;
}

/** Lo que consume el drawer de historial; se conecta cuando exista el endpoint de historial. */
export interface IBotHistoryDetail extends IBotStatusItem {
  /** Conteo de ejecuciones de los últimos 2 meses, para ver la estabilidad de un vistazo. */
  last60Days: { total: number; success: number; error: number };
  /** Historial de corridas, la más reciente primero. */
  history: IBotRun[];
}

export interface IBotsSummary extends Record<BotStatus, number> {
  total: number;
}
