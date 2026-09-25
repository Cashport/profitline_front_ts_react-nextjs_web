"use client";

import { useMemo, useState } from "react";

import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { toPerson } from "@/modules/walletModule/utils/api-adapter";
import { corto, fmtD, fmtM } from "@/modules/walletModule/utils/format";
import { nextSort, ordenar } from "@/modules/walletModule/utils/wallet-calc";
import type { SortState } from "@/modules/walletModule/types";
import { cn } from "@/utils/utils";
import type { ITicket } from "@/types/tickets/ITickets";
import {
  esAbierto,
  estadoDe,
  fechaLimite,
  sevLimite,
  valorDeColumna
} from "../../utils/tickets-calc";

interface TicketsListProps {
  items: ITicket[];
  loading: boolean;
  onOpenDetail: (ticketId: number) => void;
}

/** Columnas que arrancan ascendentes: las de texto y la fecha (lo más viejo primero). */
const TEXTUAL_COLS = ["ticket", "cliente", "cat", "resp", "estado", "fecha"];

/** Vista "Lista": la bandeja ordenable, una fila por ticket. El API no ordena,
 *  así que el orden es sobre la página actual. */
export default function TicketsList({ items, loading, onOpenDetail }: TicketsListProps) {
  const [sort, setSort] = useState<SortState>({ col: "fecha", dir: "asc" });

  const visibleRows = useMemo(
    () => ordenar(items, sort, (t) => valorDeColumna(t, sort.col)),
    [items, sort]
  );

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));

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
              <SortableTh col="estado" label="Estado" sort={sort} onSort={onSort} />
            </tr>
          </thead>

          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-9 text-center text-muted-foreground">
                  No hay tickets con estos filtros.
                </td>
              </tr>
            ) : (
              visibleRows.map((t) => {
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
                      {corto(t.client_name)}
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

                    {/* Abierto: la fecha con semáforo. Cerrado: ya no urge nada. */}
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {!limite ? (
                        <span className="text-muted-foreground">Sin fecha</span>
                      ) : esAbierto(t) ? (
                        <StatusChip sev={sevLimite(t)}>{fmtD(limite)}</StatusChip>
                      ) : (
                        <span className="tabular-nums text-muted-foreground">{fmtD(limite)}</span>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      {e.tiempo && e.tsev ? (
                        <StatusChip sev={e.tsev}>{e.tiempo}</StatusChip>
                      ) : (
                        <StatusChip sev={e.sev}>{e.estado}</StatusChip>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
