import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminVendorLine } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/users/:id/product-categories — líneas con sus categorías,
// marcador de asignación (products_vendor) y productos de cada categoría.
export const useMarketAdminUserProductCategories = (userId?: string | number) => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const url = `/marketplace-admin/users/${userId}/product-categories`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminVendorLine[]>>(
    userId && ID ? [url, ID] : null,
    () => fetcher(url),
    { revalidateOnFocus: false }
  );

  return { data: data?.data ?? [], error, isLoading, mutate };
};
