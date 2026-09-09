"use client";

import { useMemo, useState } from "react";

import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { corto, fmtD, fmtM } from "@/modules/walletModule/utils/format";
import { estadoTicket, sevDias } from "@/modules/walletModule/utils/group-detail";
import { nextSort, ordenar } from "@/modules/walletModule/utils/wallet-calc";
import { valorDeColumna } from "../../utils/tickets-calc";
import type { SortState } from "@/modules/walletModule/types";
import type { ITicketRow } from "../../types";

interface TicketsListProps {
  rows: ITicketRow[];
  onOpenDetail: (clave: string) => void;
}

/** Columnas que arrancan ascendentes: las de texto y la fecha (lo más viejo primero). */
const TEXTUAL_COLS = ["ticket", "cliente", "cat", "resp", "estado", "fecha"];

/** Vista "Lista": la bandeja ordenable, una fila por ticket. */
export default function TicketsList({ rows, onOpenDetail }: TicketsListProps) {
  const [sort, setSort] = useState<SortState>({ col: "fecha", dir: "asc" });

  const visibleRows = useMemo(
    () => ordenar(rows, sort, (r) => valorDeColumna(r, sort.col)),
    [rows, sort]
  );

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));

  return (
    <section className="rounded-xl bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <SortableTh col="ticket" label="Ticket" sort={sort} onSort={onSort} />
              <SortableTh col="cliente" label="Cliente / novedad" sort={sort} onSort={onSort} />
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
              visibleRows.map((r) => {
                const t = r.ticket;
                const e = estadoTicket(t);

                return (
                  <tr
                    key={t.id}
                    onClick={() => onOpenDetail(r.clave)}
                    className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/60"
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-semibold text-foreground">{t.id}</span>
                      <div className="text-[11.5px] text-muted-foreground">{t.titulo}</div>
                    </td>

                    <td className="px-3 py-2.5 text-foreground">
                      {corto(r.cliente)}
                      <div className="font-mono text-[11.5px] text-muted-foreground">
                        {r.novedadId ?? "Grupo sin novedad"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmtM(r.monto)}
                    </td>

                    <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">
                      {t.categoria ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2.5">
                      <PersonBadge person={t.responsable} />
                    </td>

                    {/* Abierto: la fecha con semáforo. Resuelto: ya no urge nada. */}
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {t.estado === "abierto" ? (
                        <StatusChip sev={sevDias(t.deadline, 5).sev}>{fmtD(t.deadline)}</StatusChip>
                      ) : (
                        <span className="tabular-nums text-muted-foreground">
                          {fmtD(t.deadline)}
                        </span>
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
