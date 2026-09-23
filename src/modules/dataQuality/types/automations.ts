export type BotRunStatus = "success" | "error";
export type BotStatus = BotRunStatus | "running";
export type BotFileType = "stock" | "sellout";
export type BotStatusFilter = BotStatus | "all";

/** Una corrida del bot: cuándo se ejecutó, cómo terminó y, si falló, el motivo. */
export interface IBotRun {
  date: string;
  time: string;
  status: BotRunStatus;
  duration: string;
  message?: string;
}

export interface IBotHealth {
  id: string;
  name: string;
  client: string;
  country: string;
  countryId: string;
  clientId: string;
  fileType: BotFileType;
  status: BotStatus;
  lastRun: { date: string; time: string };
  nextRun: { date: string; time: string };
  frequency: string;
  errorMessage?: string;
  /** Conteo de ejecuciones de los últimos 2 meses, para ver la estabilidad de un vistazo. */
  last60Days: { total: number; success: number; error: number };
  /** Historial de corridas, la más reciente primero. */
  history: IBotRun[];
}

export interface IBotsSummary {
  total: number;
  success: number;
  error: number;
  running: number;
}
