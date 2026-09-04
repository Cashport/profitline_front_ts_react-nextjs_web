"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/utils/utils";
import { EST_META } from "../../constants";
import { fmtM } from "../../utils/format";
import { nextSort, ordenar } from "../../utils/wallet-calc";
import DistBar from "../shared/dist-bar";
import SortableTh from "../shared/sortable-th";
import StatusChip from "../shared/status-chip";
import type { IWalletGroupRow, SortState } from "../../types";

interface InvoiceGroupsProps {
  rows: IWalletGroupRow[];
}

const TEXTUAL_COLS = ["grupo", "cliente", "estado"];

/** Días sin gestión: verde ≤3, ámbar ≤7, rojo por encima. */
const GestionChip = ({ dias }: { dias: number | null }) => {
  if (dias === null) return <span className="text-muted-foreground">—</span>;
  return (
    <StatusChip sev={dias <= 3 ? "ok" : dias <= 7 ? "warn" : "crit"}>
      {dias === 0 ? "Hoy" : `${dias}d`}
    </StatusChip>
  );
};

/** Grupos de facturas: todo lo que se resuelve con una sola gestión. */
export default function InvoiceGroups({ rows }: InvoiceGroupsProps) {
  const [sort, setSort] = useState<SortState>({ col: "monto", dir: "desc" });

  const visibleRows = useMemo(
    () =>
      ordenar(rows, sort, (g) => {
        switch (sort.col) {
          case "grupo":
            return g.novedadId ?? EST_META[g.tipo].nom;
          case "cliente":
            return g.cliente;
          case "fact":
            return g.facturas;
          case "gestion":
            return g.diasSinGestion === null ? 99999 : g.diasSinGestion;
          case "estado":
            return g.estado.nom;
          default:
            return g.monto;
        }
      }),
    [rows, sort]
  );

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));
  const suma = visibleRows.reduce((a, g) => a + g.monto, 0);

  return (
    <section className="rounded-xl bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
        <h3 className="text-[13.5px] font-semibold text-foreground">Grupos de facturas</h3>
        <span className="ml-auto text-[11.5px] text-muted-foreground">
          {visibleRows.length} grupos · {fmtM(suma)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <SortableTh col="grupo" label="Grupo" sort={sort} onSort={onSort} />
              <SortableTh col="cliente" label="Cliente" sort={sort} onSort={onSort} />
              <SortableTh col="fact" label="Fact." align="right" sort={sort} onSort={onSort} />
              <SortableTh col="monto" label="Total" align="right" sort={sort} onSort={onSort} />
              <th
                scope="col"
                className="whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
              >
                Reparto
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
              >
                Responsable
              </th>
              <SortableTh col="gestion" label="Gest." align="right" sort={sort} onSort={onSort} />
              <th
                scope="col"
                className="whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
              >
                Ticket
              </th>
              <th
                scope="col"
                className="whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
              >
                Límite
              </th>
              <SortableTh col="estado" label="Estado" sort={sort} onSort={onSort} />
              <th className="border-b border-border bg-muted/40" />
            </tr>
          </thead>

          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-9 text-center text-muted-foreground">
                  No hay grupos con los filtros actuales.
                </td>
              </tr>
            ) : (
              visibleRows.map((g) => (
                <tr key={g.clave} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                      <i
                        className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", EST_META[g.tipo].bg)}
                        style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
                      />
                      {g.novedadId ? (
                        <span className="font-mono">{g.novedadId}</span>
                      ) : (
                        EST_META[g.tipo].nom
                      )}
                    </span>
                    <div className="text-[11.5px] text-muted-foreground">{g.detalle}</div>
                  </td>

                  <td className="px-3 py-2.5 text-foreground">{g.cliente}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                    {g.facturas}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {fmtM(g.monto)}
                  </td>
                  <td className="px-3 py-2.5">
                    <DistBar tramos={g.tramos} monto={g.monto} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {g.responsable ? (
                      <span className="text-foreground">{g.responsable}</span>
                    ) : (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Sin dueño
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <GestionChip dias={g.diasSinGestion} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                    {g.compromiso ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                    {g.limite ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusChip sev={g.estado.sev}>{g.estado.nom}</StatusChip>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {/* TODO: abre el modal de gestión del grupo. */}
                    <button
                      type="button"
                      aria-label="Abrir gestión"
                      title="Abrir gestión"
                      className="inline-flex rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-4 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        Estos son los grupos de todo lo que hay en la matriz con los filtros y la búsqueda actuales.{" "}
        <b className="font-semibold text-foreground">Total</b> es todo lo que se resuelve con una
        sola gestión.
      </div>
    </section>
  );
}
