import { useTranslations } from "use-intl";

import {
  getPortfolioClientsStatus,
  refreshPortfolioClients
} from "@/services/portfolioClients/portfolioClients";
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
  const t = useTranslations("shared.portfolioRefresh");
  return Object.fromEntries(
    MESSAGE_KEYS.map((key) => [key, t(key)])
  ) as unknown as ISnapshotRefreshMessages;
};

/** Botón "Recargar información" de la tabla de cartera (ver `useSnapshotRefresh`). */
export const usePortfolioClientsRefresh = (enabled: boolean, onDone: () => void) =>
  useSnapshotRefresh({
    enabled,
    start: refreshPortfolioClients,
    getStatus: getPortfolioClientsStatus,
    onDone,
    messages: useRefreshMessages()
  });
