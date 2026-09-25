"use client";

import { useMemo, useState } from "react";
import { Pagination } from "antd";

import BoardLanes, { type BoardLane } from "@/components/ui/board-lanes/board-lanes";
import KpiCards from "@/components/ui/kpi-cards/kpi-cards";
import ProfitLoader from "@/components/ui/profit-loader";
import { useDebounce } from "@/hooks/useDeabouce";
import { useProjectUsers } from "@/hooks/useProjectUsers";
import { fmtM } from "@/modules/walletModule/utils/format";
import { cn } from "@/utils/utils";
import type { ITicket, TicketSituation } from "@/types/tickets/ITickets";
import TicketBoardCard from "../../components/ticket-board-card/ticket-board-card";
import TicketDetailModal from "../../components/ticket-detail-modal/ticket-detail-modal";
import TicketsHeader from "../../components/tickets-header/tickets-header";
import TicketsList from "../../components/tickets-list/tickets-list";
import TicketsToolbar from "../../components/tickets-toolbar/tickets-toolbar";
import { TICKET_LANES } from "../../constants";
import { useTicketCategories } from "../../hooks/useTicketCategories";
import { useTickets } from "../../hooks/useTickets";
import { useTicketsSummary } from "../../hooks/useTicketsSummary";
import { diasAlLimite, laneDe, sumaMonto, toKpiCards } from "../../utils/tickets-calc";
import type { TicketView } from "../../types";

const VISTAS: { key: TicketView; label: string }[] = [
  { key: "lista", label: "Lista" },
  { key: "tablero", label: "Tablero" }
];

const PAGE_SIZE = 20;

export default function TicketsView() {
  // Tarjeta activa = param `situation` del listado; null = todos.
  const [situation, setSituation] = useState<TicketSituation | null>("pending");
  const [assignedToUserId, setAssignedToUserId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [vista, setVista] = useState<TicketView>("lista");
  // Id del ticket abierto en el modal; el modal lo pide a /tickets/:id.
  const [openTicketId, setOpenTicketId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const filters = { assignedToUserId, categoryId, search: debouncedSearch };

  const { users } = useProjectUsers();
  const { categories } = useTicketCategories();
  const { summary } = useTicketsSummary(filters);
  const { tickets, pagination, fetchedAt, isLoading, error } = useTickets({
    page,
    limit: PAGE_SIZE,
    situation,
    ...filters
  });

  // Cualquier cambio de filtro vuelve a la primera página.
  const handleSituationChange = (id: string) => {
    setSituation(id === situation ? null : (id as TicketSituation));
    setPage(1);
  };
  const handleAssignedToChange = (next: number | null) => {
    setAssignedToUserId(next);
    setPage(1);
  };
  const handleCategoryChange = (next: number | null) => {
    setCategoryId(next);
    setPage(1);
  };
  const handleSearchChange = (next: string) => {
    setSearch(next);
    setPage(1);
  };

  const lanes: BoardLane<ITicket>[] = useMemo(
    () =>
      TICKET_LANES.map((lane) => {
        // Lo que vence antes, arriba; sin fecha, al final.
        const items = (tickets ?? [])
          .filter((t) => laneDe(t) === lane.id)
          .sort((a, b) => diasAlLimite(a) - diasAlLimite(b));

        return { id: lane.id, title: lane.nom, items, total: fmtM(sumaMonto(items)) };
      }),
    [tickets]
  );

  // Sólo la primera carga muestra el loader: después la página anterior se
  // queda en pantalla (keepPreviousData) y la vista se atenúa.
  const primeraCarga = !tickets && !error;

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <TicketsHeader fetchedAt={fetchedAt} onSearchChange={handleSearchChange} />

      <div className="flex flex-wrap items-end gap-3.5">
        <h2 className="text-lg font-semibold text-foreground">Bandeja de tickets</h2>

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

      <TicketsToolbar
        users={users}
        categories={categories}
        assignedToUserId={assignedToUserId}
        categoryId={categoryId}
        onAssignedToChange={handleAssignedToChange}
        onCategoryChange={handleCategoryChange}
        totalRows={pagination.totalRows}
      />
      <KpiCards
        cards={toKpiCards(summary)}
        noun={["ticket", "tickets"]}
        selected={situation}
        // Volver a pulsar la activa la apaga: sin tarjeta = todos.
        onSelect={handleSituationChange}
      />

      {primeraCarga ? (
        <ProfitLoader size="small" />
      ) : error ? (
        <p className="p-9 text-center text-sm text-destructive">
          {error.message || "No se pudieron cargar los tickets."}
        </p>
      ) : (
        <>
          {vista === "lista" ? (
            <TicketsList items={tickets ?? []} loading={isLoading} onOpenDetail={setOpenTicketId} />
          ) : (
            <div className={cn(isLoading && "pointer-events-none opacity-60")}>
              <BoardLanes
                lanes={lanes}
                renderCard={(t) => (
                  <TicketBoardCard key={t.id} ticket={t} onOpenDetail={setOpenTicketId} />
                )}
              />
            </div>
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

      <TicketDetailModal ticketId={openTicketId} onClose={() => setOpenTicketId(null)} />
    </div>
  );
}
