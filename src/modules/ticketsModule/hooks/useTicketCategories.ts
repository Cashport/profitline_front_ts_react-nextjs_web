import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { ITicketCategory } from "@/types/tickets/ITickets";

const EMPTY: ITicketCategory[] = [];

/** Catálogo de categorías (GET /tickets/categories): sólo las activas, en su orden. */
export const useTicketCategories = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<ITicketCategory[]>>(
    "/tickets/categories",
    fetcher,
    { revalidateOnFocus: false }
  );

  const categories = data?.data
    ? data.data.filter((c) => c.active).sort((a, b) => a.sort_order - b.sort_order)
    : EMPTY;

  return { categories, isLoading, error };
};
