"use client";

import type { Key } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import dayjs from "dayjs";
import { IDevolucionesFilter, IAprobacionesFilter } from "../types";
import { ESTADO_PENDIENTE_APROBACION_ID } from "../constants";
import { resolveDatePreset } from "../components/FilterDateTab/FilterDateTab";

interface DevolucionesTabSlice {
  filter: IDevolucionesFilter;
  searchTerm: string;
  page: number;
  selectedRowKeys: Key[];
  setFilter: (next: IDevolucionesFilter) => void;
  setSearchTerm: (next: string) => void;
  setPage: (next: number) => void;
  setSelectedRowKeys: (next: Key[]) => void;
}

interface AprobacionesTabSlice {
  filter: IAprobacionesFilter;
  searchTerm: string;
  currentPage: number;
  selectedRowKeys: Key[];
  setFilter: (next: IAprobacionesFilter) => void;
  setSearchTerm: (next: string) => void;
  setCurrentPage: (next: number) => void;
  setSelectedRowKeys: (next: Key[]) => void;
}

interface ReverseLogisticsFiltersContextValue {
  devoluciones: DevolucionesTabSlice;
  aprobaciones: AprobacionesTabSlice;
}

const ReverseLogisticsFiltersContext = createContext<ReverseLogisticsFiltersContextValue | null>(
  null
);

const buildDefaultDevolucionesFilter = (): IDevolucionesFilter => {
  const preset = resolveDatePreset("este_mes");
  return {
    clientId: null,
    estadoId: null,
    causalId: null,
    fromDate: preset.from,
    toDate: preset.to
  };
};

const buildDefaultAprobacionesFilter = (): IAprobacionesFilter => {
  const today = dayjs().format("YYYY-MM-DD");
  return {
    clientId: null,
    status: ESTADO_PENDIENTE_APROBACION_ID,
    fromDate: today,
    toDate: today,
    tipos: [],
    ciudades: []
  };
};

export function ReverseLogisticsFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<IDevolucionesFilter>(buildDefaultDevolucionesFilter);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [approvalsFilter, setApprovalsFilter] = useState<IAprobacionesFilter>(
    buildDefaultAprobacionesFilter
  );
  const [approvalsSearchTerm, setApprovalsSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [approvalsSelectedRowKeys, setApprovalsSelectedRowKeys] = useState<Key[]>([]);

  // Any filter change invalidates the current page — the backend re-paginates
  // from scratch with the new query params.
  const handleDevolucionesFilterChange = useCallback((next: IDevolucionesFilter) => {
    setFilter(next);
    setPage(1);
  }, []);

  const handleAprobacionesFilterChange = useCallback((next: IAprobacionesFilter) => {
    setApprovalsFilter(next);
    setCurrentPage(1);
  }, []);

  const devoluciones = useMemo<DevolucionesTabSlice>(
    () => ({
      filter,
      searchTerm,
      page,
      selectedRowKeys,
      setFilter: handleDevolucionesFilterChange,
      setSearchTerm,
      setPage,
      setSelectedRowKeys
    }),
    [
      filter,
      searchTerm,
      page,
      selectedRowKeys,
      handleDevolucionesFilterChange,
      setSearchTerm,
      setPage,
      setSelectedRowKeys
    ]
  );

  const aprobaciones = useMemo<AprobacionesTabSlice>(
    () => ({
      filter: approvalsFilter,
      searchTerm: approvalsSearchTerm,
      currentPage,
      selectedRowKeys: approvalsSelectedRowKeys,
      setFilter: handleAprobacionesFilterChange,
      setSearchTerm: setApprovalsSearchTerm,
      setCurrentPage,
      setSelectedRowKeys: setApprovalsSelectedRowKeys
    }),
    [
      approvalsFilter,
      approvalsSearchTerm,
      currentPage,
      approvalsSelectedRowKeys,
      handleAprobacionesFilterChange,
      setApprovalsSearchTerm,
      setCurrentPage,
      setApprovalsSelectedRowKeys
    ]
  );

  const value = useMemo<ReverseLogisticsFiltersContextValue>(
    () => ({ devoluciones, aprobaciones }),
    [devoluciones, aprobaciones]
  );

  return (
    <ReverseLogisticsFiltersContext.Provider value={value}>
      {children}
    </ReverseLogisticsFiltersContext.Provider>
  );
}

export function useDevolucionesTabState(): DevolucionesTabSlice {
  const ctx = useContext(ReverseLogisticsFiltersContext);
  if (!ctx) {
    throw new Error(
      "useDevolucionesTabState must be used inside <ReverseLogisticsFiltersProvider>"
    );
  }
  return ctx.devoluciones;
}

export function useAprobacionesTabState(): AprobacionesTabSlice {
  const ctx = useContext(ReverseLogisticsFiltersContext);
  if (!ctx) {
    throw new Error(
      "useAprobacionesTabState must be used inside <ReverseLogisticsFiltersProvider>"
    );
  }
  return ctx.aprobaciones;
}