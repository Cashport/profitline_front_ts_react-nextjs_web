"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { toPerson } from "@/modules/walletModule/utils/api-adapter";
import { fmtD, fmtM } from "@/modules/walletModule/utils/format";
import { nextSort, ordenar } from "@/modules/walletModule/utils/wallet-calc";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { ITicket, TicketStatus } from "@/types/tickets/ITickets";
import { TICKET_STATUS_COLOR, TICKET_STATUS_LABEL, TICKET_STATUS_ORDER } from "../../constants";
import ClientTag from "../shared/client-tag";
import PriorityFlag from "../shared/priority-flag";
import { esAbierto, estadoDe, fechaLimite, sevLimite, valorDeColumna } from "../../utils/tickets-calc";

interface TicketsListProps {
  items: ITicket[];
  loading: boolean;
  onOpenDetail: (ticketId: number) => void;
}

const COLS = 7;

/** Columnas que arrancan ascendentes: las de texto y la fecha (lo más viejo primero). */
const TEXTUAL_COLS = ["ticket", "cliente", "cat", "resp", "fecha"];

interface TicketGroup {
  status: TicketStatus;
  items: ITicket[];
}

/** Vista "Lista": secciones colapsables por estado, ordenables dentro de cada
 *  una. El API no ordena, así que el orden es sobre la página actual. */
export default function TicketsList({ items, loading, onOpenDetail }: TicketsListProps) {
  const [sort, setSort] = useState<SortState>({ col: "fecha", dir: "asc" });
  const [collapsed, setCollapsed] = useState<Partial<Record<TicketStatus, boolean>>>({});

  const visibleRows = useMemo(
    () => ordenar(items, sort, (t) => valorDeColumna(t, sort.col)),
    [items, sort]
  );

  const groups: TicketGroup[] = useMemo(
    () =>
      TICKET_STATUS_ORDER.map((status) => ({
        status,
        items: visibleRows.filter((t) => t.status === status)
      })).filter((g) => g.items.length > 0),
    [visibleRows]
  );

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));
  const toggleGroup = (status: TicketStatus) =>
    setCollapsed((c) => ({ ...c, [status]: !c[status] }));

  return (
    <section className="rounded-xl bg-card shadow-sm">
      <div className={cn("overflow-x-auto", loading && "pointer-events-none opacity-60")}>
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <SortableTh col="ticket" label="Ticket" sort={sort} onSort={onSort} />
              <SortableTh col="cliente" label="Cliente" sort={sort} onSort={onSort} />
              <SortableTh col="monto" label="Monto" align="right" sort={sort} onSort={onSort} />
              <SortableTh col="cat" label="Categoría" sort={sort} onSort={onSort} />
              <SortableTh col="resp" label="Responsable" sort={sort} onSort={onSort} />
              <SortableTh col="fecha" label="Fecha de resolución" sort={sort} onSort={onSort} />
              <SortableTh col="prioridad" label="Prioridad" sort={sort} onSort={onSort} />
            </tr>
          </thead>

          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={COLS} className="p-9 text-center text-muted-foreground">
                  No hay tickets con estos filtros.
                </td>
              </tr>
            ) : (
              groups.map((g) => (
                <Fragment key={g.status}>
                  <tr className="border-b border-border bg-muted/30">
                    <td colSpan={COLS} className="px-3 py-2">
                      <button
                        type="button"
                        aria-expanded={!collapsed[g.status]}
                        onClick={() => toggleGroup(g.status)}
                        className="flex w-full items-center gap-2 text-left"
                      >
                        <span className="text-muted-foreground">
                          {collapsed[g.status] ? (
                            <ChevronRight className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <StatusChip color={TICKET_STATUS_COLOR[g.status]}>
                          {TICKET_STATUS_LABEL[g.status]}
                        </StatusChip>
                        <span className="rounded-full bg-muted px-1.5 text-[10.5px] font-bold leading-[17px] tabular-nums text-muted-foreground">
                          {g.items.length}
                        </span>
                      </button>
                    </td>
                  </tr>

                  {!collapsed[g.status] &&
                    g.items.map((t) => {
                      const e = estadoDe(t);
                      const limite = fechaLimite(t);

                      return (
                        <tr
                          key={t.id}
                          onClick={() => onOpenDetail(t.id)}
                          className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/60"
                        >
                          <td className="px-3 py-2.5">
                            <span className="font-mono font-semibold text-foreground">
                              {t.ticket_code}
                            </span>
                            <div className="text-[11.5px] text-muted-foreground">{t.title}</div>
                          </td>

                          <td className="px-3 py-2.5 text-foreground">
                            <ClientTag id={t.client_id} name={t.client_name} />
                            <div className="font-mono text-[11.5px] text-muted-foreground">
                              {t.client_id}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                            {fmtM(t.amount)}
                          </td>

                          <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">
                            {t.category_name ?? "—"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2.5">
                            <PersonBadge person={toPerson(t.assigned_to_name)} />
                          </td>

                          {/* Abierto: la fecha con semáforo, más el tiempo restante/vencido si aplica. */}
                          <td className="whitespace-nowrap px-3 py-2.5">
                            {!limite ? (
                              <span className="text-muted-foreground">Sin fecha</span>
                            ) : esAbierto(t) ? (
                              <StatusChip sev={sevLimite(t)}>{fmtD(limite)}</StatusChip>
                            ) : (
                              <span className="tabular-nums text-muted-foreground">
                                {fmtD(limite)}
                              </span>
                            )}
                            {e.tiempo && e.tsev && (
                              <div className="mt-1">
                                <StatusChip sev={e.tsev}>{e.tiempo}</StatusChip>
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-2.5">
                            <PriorityFlag priority={t.priority} />
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
