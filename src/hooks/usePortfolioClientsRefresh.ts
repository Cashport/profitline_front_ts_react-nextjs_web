import {
  getPortfolioClientsStatus,
  refreshPortfolioClients
} from "@/services/portfolioClients/portfolioClients";
import { ISnapshotRefreshMessages, useSnapshotRefresh } from "./useSnapshotRefresh";

const MESSAGES: ISnapshotRefreshMessages = {
  started: "Actualizando información de cartera…",
  alreadyRunning: "Ya hay una actualización en curso, se mostrará al terminar",
  done: "Información de cartera actualizada",
  failed: "No se pudo actualizar la información. Se mantiene la última versión disponible.",
  notCompleted:
    "La actualización en curso no se completó. Se mantiene la última versión disponible.",
  timeout:
    "La actualización está tardando más de lo esperado. Se muestra la última información disponible.",
  startFailed: "No se pudo iniciar la actualización de la información"
};

/** Botón "Recargar información" de la tabla de cartera (ver `useSnapshotRefresh`). */
export const usePortfolioClientsRefresh = (enabled: boolean, onDone: () => void) =>
  useSnapshotRefresh({
    enabled,
    start: refreshPortfolioClients,
    getStatus: getPortfolioClientsStatus,
    onDone,
    messages: MESSAGES
  });
