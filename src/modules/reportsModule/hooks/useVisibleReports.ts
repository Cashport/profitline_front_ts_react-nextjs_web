import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ordenar } from "@/modules/walletModule/utils/wallet-calc";
import type { IReport } from "@/types/reports/IReports";

import { useReports } from "./useReports";
import { useReportsListStore } from "../stores/reports-list-store";

/**
 * Informes tras la búsqueda y el orden del store; tipo y fecha ya llegan
 * filtrados del backend. Lo comparten el listado y el detalle, que navega con
 * anterior/siguiente en este mismo orden.
 */
export const useVisibleReports = () => {
  const { reports, isLoading, error } = useReports();
  const { search, sort } = useReportsListStore(
    useShallow((s) => ({ search: s.search, sort: s.sort }))
  );

  const visibleReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    const found = (reports ?? []).filter(
      (r) => !q || r.name.toLowerCase().includes(q) || r.report_type_name.toLowerCase().includes(q)
    );
    // Las columnas son campos de IReport. created_at es ISO UTC de ancho fijo:
    // como texto ordena igual que como fecha.
    return ordenar(found, sort, (r) => r[sort.col as keyof IReport]);
  }, [reports, search, sort]);

  return { reports, visibleReports, isLoading, error };
};
