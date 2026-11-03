import { useTranslations } from "use-intl";

import {
  getCollectionTowerStatus,
  refreshCollectionTower
} from "@/services/collectionTower/collectionTower";
import { ISnapshotRefreshMessages, useSnapshotRefresh } from "./useSnapshotRefresh";

const MESSAGE_KEYS = [
  "started",
  "alreadyRunning",
  "done",
  "failed",
  "notCompleted",
  "timeout",
  "startFailed"
] as const;

const useRefreshMessages = (): ISnapshotRefreshMessages => {
  const t = useTranslations("shared.collectionTowerRefresh");
  return Object.fromEntries(
    MESSAGE_KEYS.map((key) => [key, t(key)])
  ) as unknown as ISnapshotRefreshMessages;
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
    messages: useRefreshMessages(),
    timeoutMs: TOWER_REFRESH_TIMEOUT_MS
  });
