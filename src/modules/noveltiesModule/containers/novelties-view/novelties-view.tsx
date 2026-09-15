"use client";

import { useEffect, useState } from "react";
import { Pagination } from "antd";

import ProfitLoader from "@/components/ui/profit-loader";
import { useDebounce } from "@/hooks/useDeabouce";
import GroupDetailModal from "@/modules/walletModule/components/group-detail-modal/group-detail-modal";
import { nextSort } from "@/modules/walletModule/utils/wallet-calc";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { IncidentCard, IncidentSortBy, IncidentSortDir } from "@/types/novelties/INovelties";
import NoveltiesBoard from "../../components/novelties-board/novelties-board";
import NoveltiesHeader from "../../components/novelties-header/novelties-header";
import NoveltiesKpiCards from "../../components/novelties-kpi-cards/novelties-kpi-cards";
import NoveltiesList from "../../components/novelties-list/novelties-list";
import NoveltiesToolbar from "../../components/novelties-toolbar/novelties-toolbar";
import { EMPTY_NOVELTIES_FILTERS } from "../../constants";
import { useIncidentList } from "../../hooks/useIncidentList";
import { useIncidentListKpis } from "../../hooks/useIncidentListKpis";
import { useNoveltyStatuses } from "../../hooks/useNoveltyStatuses";
import type { INoveltiesFilters, NoveltyView } from "../../types";

const VISTAS: { key: NoveltyView; label: string }[] = [
  { key: "lista", label: "Lista" },
  { key: "tablero", label: "Tablero" }
];

const PAGE_SIZE = 20;

/** Espera tras la última tecla antes de consultar el listado. */
const SEARCH_DEBOUNCE_MS = 400;

/** Columnas de texto arrancan ascendentes; las numéricas, descendentes. */
const TEXTUAL_COLS: IncidentSortBy[] = [
  "id",
  "client_name",
  "assigned_to_name",
  "novelty_status",
  "next_ticket_date",
  "limit_date"
];

export default function NoveltiesView() {
  const [card, setCard] = useState<IncidentCard | null>("abiertas");
  const [filters, setFilters] = useState<INoveltiesFilters>(EMPTY_NOVELTIES_FILTERS);
  // Al listado sólo entra la versión con debounce; el input muestra la cruda.
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ col: "next_ticket_date", dir: "asc" });
  const [vista, setVista] = useState<NoveltyView>("lista");
  // Id del incidente abierto en el modal; el modal lo pide a /invoice/incident-detail.
  const [openNovelty, setOpenNovelty] = useState<number | null>(null);

  const { data: kpis } = useIncidentListKpis();
  // El tablero agrupa por estado, así que sigue necesitando el catálogo.
  const { statuses } = useNoveltyStatuses();
  const { items, summary, pagination, fetchedAt, isLoading, error } = useIncidentList({
    page,
    limit: PAGE_SIZE,
    sortBy: sort.col as IncidentSortBy,
    sortDir: sort.dir as IncidentSortDir,
    card,
    noveltyStatusId: filters.novelty_status_id,
    motiveId: filters.motive_id,
    coordinator: filters.coordinator,
    kam: filters.kam,
    market: filters.market,
    executiveId: filters.executive_id,
    search: debouncedSearch,
    dateFrom: filters.date_from,
    dateTo: filters.date_to
  });

  // Cualquier cambio de filtro vuelve a la primera página.
  const handleCardChange = (next: IncidentCard | null) => {
    setCard(next);
    setPage(1);
  };
  const handleFiltersChange = (next: INoveltiesFilters) => {
    setFilters(next);
    setPage(1);
  };
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);
  const handleSort = (col: string) => {
    setSort((s) => nextSort(s, col, TEXTUAL_COLS));
    setPage(1);
  };

  // Sólo la primera carga muestra el loader: después la página anterior se
  // queda en pantalla (keepPreviousData) y la vista se atenúa.
  const primeraCarga = !items && !error;

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <NoveltiesHeader
        fetchedAt={fetchedAt}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <div className="flex flex-wrap items-end gap-3.5">
        <h2 className="text-lg font-semibold text-foreground">Bandeja de novedades</h2>

        <div className="ml-auto flex overflow-hidden rounded-lg border border-border bg-card">
          {VISTAS.map((v) => (
            <button
              key={v.key}
              type="button"
              aria-pressed={vista === v.key}
              onClick={() => setVista(v.key)}
              className={cn(
                "border-r border-border px-3 py-1.5 text-xs transition-colors last:border-r-0",
                vista === v.key
                  ? "bg-secondary font-bold text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <NoveltiesToolbar totalRows={pagination.totalRows} summary={summary} />
      <NoveltiesKpiCards kpis={kpis} selected={card} onSelect={handleCardChange} />

      {primeraCarga ? (
        <ProfitLoader size="small" />
      ) : error ? (
        <p className="p-9 text-center text-sm text-destructive">
          {error.message || "No se pudieron cargar las novedades."}
        </p>
      ) : (
        <>
          {vista === "lista" ? (
            <NoveltiesList
              items={items ?? []}
              sort={sort}
              onSort={handleSort}
              loading={isLoading}
              onOpenDetail={setOpenNovelty}
            />
          ) : (
            <NoveltiesBoard
              items={items ?? []}
              statuses={statuses}
              loading={isLoading}
              onOpenDetail={setOpenNovelty}
            />
          )}

          <Pagination
            className="self-end"
            current={page}
            pageSize={PAGE_SIZE}
            total={pagination.totalRows}
            onChange={setPage}
            showSizeChanger={false}
            hideOnSinglePage
            disabled={isLoading}
          />
        </>
      )}

      <GroupDetailModal incidentId={openNovelty} onClose={() => setOpenNovelty(null)} />
    </div>
  );
}
