import useSWR from "swr";

import { getDiscountsByClient } from "@/services/discount/discount.service";

// GET /discount/by-client?client_id=:nit — reglas de descuento del cliente
export const useMarketAdminClientDiscounts = (clientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    clientId ? ["discounts-by-client", clientId] : null,
    () => getDiscountsByClient(clientId!)
  );

  return { data: data?.data ?? [], isLoading, error, mutate };
};
