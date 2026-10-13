/** Metadatos de una versión del precálculo de la tabla de cartera. */
export interface IPortfolioClientsSnapshotRun {
  runId: string;
  status: "RUNNING" | "DONE" | "FAILED" | "PENDING";
  trigger: "CRON" | "MANUAL";
  requestedBy: string | null;
  startedAt: string;
  finishedAt: string | null;
  /** Fecha y hora en que se tomó la información. */
  generatedAt: string;
  durationMs: number | null;
  clientsCount?: number;
  error: string | null;
}

export interface IPortfolioClientsSnapshotStatus {
  current: IPortfolioClientsSnapshotRun | null;
  running: IPortfolioClientsSnapshotRun | null;
  lastFailed: IPortfolioClientsSnapshotRun | null;
  isRefreshing: boolean;
}

export interface IPortfolioClientsRefreshResponse {
  status: "PROCESSING";
  runId: string;
  startedAt: string;
}
