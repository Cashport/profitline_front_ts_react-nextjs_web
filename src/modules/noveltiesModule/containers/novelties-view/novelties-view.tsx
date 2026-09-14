"use client";

import { useState } from "react";
import { Pagination } from "antd";

import ProfitLoader from "@/components/ui/profit-loader";
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
import { useIncidentList } from "../../hooks/useIncidentList";
import { useIncidentListCoordinators } from "../../hooks/useIncidentListCoordinators";
import { useIncidentListKpis } from "../../hooks/useIncidentListKpis";
import { useNoveltyStatuses } from "../../hooks/useNoveltyStatuses";
import { NOVELTY_DETAIL } from "../../mocked-data";
import type { NoveltyView } from "../../types";

const VISTAS: { key: NoveltyView; label: string }[] = [
  { key: "lista", label: "Lista" },
  { key: "tablero", label: "Tablero" }
];

const PAGE_SIZE = 20;

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
  const [statusId, setStatusId] = useState<number | null>(null);
  const [coordinator, setCoordinator] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ col: "next_ticket_date", dir: "asc" });
  const [vista, setVista] = useState<NoveltyView>("lista");
  // Id de la novedad abierta. Hoy todas muestran el mismo detalle simulado.
  const [openNovelty, setOpenNovelty] = useState<number | null>(null);

  const { data: kpis } = useIncidentListKpis();
  const { statuses } = useNoveltyStatuses();
  const { coordinators } = useIncidentListCoordinators();
  const { items, summary, pagination, fetchedAt, isLoading, error } = useIncidentList({
    page,
    limit: PAGE_SIZE,
    sortBy: sort.col as IncidentSortBy,
    sortDir: sort.dir as IncidentSortDir,
    card,
    noveltyStatusId: statusId,
    coordinator
  });

  // Cualquier cambio de filtro vuelve a la primera página.
  const handleCardChange = (next: IncidentCard | null) => {
    setCard(next);
    setPage(1);
  };
  const handleStatusChange = (next: number | null) => {
    setStatusId(next);
    setPage(1);
  };
  const handleCoordinatorChange = (next: string | null) => {
    setCoordinator(next);
    setPage(1);
  };
  const handleSort = (col: string) => {
    setSort((s) => nextSort(s, col, TEXTUAL_COLS));
    setPage(1);
  };

  // Sólo la primera carga muestra el loader: después la página anterior se
  // queda en pantalla (keepPreviousData) y la vista se atenúa.
  const primeraCarga = !items && !error;

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <NoveltiesHeader fetchedAt={fetchedAt} />

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

      <NoveltiesToolbar
        statuses={statuses}
        coordinators={coordinators}
        statusId={statusId}
        coordinator={coordinator}
        onStatusChange={handleStatusChange}
        onCoordinatorChange={handleCoordinatorChange}
        totalRows={pagination.totalRows}
        summary={summary}
      />
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

      <GroupDetailModal
        detail={openNovelty ? NOVELTY_DETAIL : null}
        onClose={() => setOpenNovelty(null)}
      />
    </div>
  );
}
