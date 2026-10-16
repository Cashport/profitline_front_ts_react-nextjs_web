import {
  getCollectionTowerStatus,
  refreshCollectionTower
} from "@/services/collectionTower/collectionTower";
import { ISnapshotRefreshMessages, useSnapshotRefresh } from "./useSnapshotRefresh";

const MESSAGES: ISnapshotRefreshMessages = {
  started: "Actualizando la torre de control…",
  alreadyRunning: "Ya hay una actualización en curso, se mostrará al terminar",
  done: "Torre de control actualizada",
  failed: "No se pudo actualizar la torre. Se mantiene el último corte disponible.",
  notCompleted: "La actualización en curso no se completó. Se mantiene el último corte disponible.",
  timeout:
    "La actualización está tardando más de lo esperado. Se muestra el último corte disponible.",
  startFailed: "No se pudo iniciar la actualización de la torre"
};

/** En los proyectos grandes la foto tarda varios minutos (FEMSA ~4). */
const TOWER_REFRESH_TIMEOUT_MS = 10 * 60 * 1000;

/** Botón "Actualizar ahora" de la torre de recaudo (ver `useSnapshotRefresh`). */
export const useCollectionTowerRefresh = (
  projectId: number | undefined,
  enabled: boolean,
  onDone: () => void
) =>
  useSnapshotRefresh({
    enabled: enabled && Boolean(projectId),
    start: () => refreshCollectionTower(projectId as number),
    getStatus: () => getCollectionTowerStatus(projectId as number),
    onDone,
    messages: MESSAGES,
    timeoutMs: TOWER_REFRESH_TIMEOUT_MS
  });
