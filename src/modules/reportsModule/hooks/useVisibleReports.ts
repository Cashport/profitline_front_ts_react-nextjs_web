import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ordenar } from "@/modules/walletModule/utils/wallet-calc";

import { useReports } from "./useReports";
import { useReportsListStore } from "../stores/reports-list-store";
import { filterReports, reportSortValue } from "../utils/reports-calc";

/**
 * Informes tras la búsqueda, los filtros y el orden del store. Lo comparten el
 * listado y el detalle, que navega con anterior/siguiente en este mismo orden.
 */
export const useVisibleReports = () => {
  const { reports, isLoading, error } = useReports();
  const { search, filters, sort } = useReportsListStore(
    useShallow((s) => ({ search: s.search, filters: s.filters, sort: s.sort }))
  );

  const visibleReports = useMemo(
    () =>
      ordenar(filterReports(reports ?? [], search, filters), sort, (r) =>
        reportSortValue(r, sort.col)
      ),
    [reports, search, filters, sort]
  );

  return { reports, visibleReports, isLoading, error };
};
