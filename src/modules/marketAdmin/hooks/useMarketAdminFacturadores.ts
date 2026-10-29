import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminFacturador } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/billers — usuarios con rol Facturador del proyecto actual.
// `enabled` permite no consultar hasta que el detalle del usuario haya cargado.
export const useMarketAdminFacturadores = (enabled = true) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminFacturador[]>>(
    enabled ? "/marketplace-admin/billers" : null,
    fetcher
  );

  return { data: data?.data ?? [], error, isLoading, mutate };
};
