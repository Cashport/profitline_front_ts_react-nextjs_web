import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { portfolioConciliationPath } from "@/services/portfolioConciliation/portfolioConciliation";
import { IConciliationUpload } from "@/types/portfolioConciliation/IPortfolioConciliation";
import { UPLOAD_POLL_INTERVAL_MS } from "../constants";

/**
 * Estado de una carga. Mientras está PROCESSING se vuelve a consultar cada
 * pocos segundos; al quedar DONE o FAILED deja de preguntar.
 */
export const useConciliationUpload = (clientUUID: string, uploadUUID: string | null) => {
  const key =
    clientUUID && uploadUUID
      ? `${portfolioConciliationPath(clientUUID)}/uploads/${uploadUUID}`
      : null;
  const { data, error } = useSWR<{ data: IConciliationUpload }>(key, fetcher, {
    refreshInterval: (latest) =>
      !latest || latest.data?.status === "PROCESSING" ? UPLOAD_POLL_INTERVAL_MS : 0,
    revalidateOnFocus: false
  });

  return { upload: data?.data, error: error as Error | undefined };
};
