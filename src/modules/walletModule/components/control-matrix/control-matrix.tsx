"use client";

import { useMemo, useState } from "react";

import UiSearchInput from "@/components/ui/search-input";
import { cn } from "@/utils/utils";
import { TRAMOS } from "../../constants";
import { fmtM, pct } from "../../utils/format";
import { nextSort, ordenar, rowSegments, tramoTotal } from "../../utils/wallet-calc";
import SegBar from "../shared/seg-bar";
import SortableTh from "../shared/sortable-th";
import StatusLegend from "../shared/status-legend";
import type { IWalletClientRow, SortState } from "../../types";

interface ControlMatrixProps {
  rows: IWalletClientRow[];
}

const TEXTUAL_COLS = ["cliente"];

/** Matriz cliente × tramo, con el desglose por estado bajo cada monto. */
export default function ControlMatrix({ rows }: ControlMatrixProps) {
  const [sort, setSort] = useState<SortState>({ col: "total", dir: "desc" });
  const [query, setQuery] = useState("");

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) => `${r.nombre} ${r.nit} ${r.ejecutivo}`.toLowerCase().includes(q))
      : rows;

    return ordenar(filtered, sort, (row) => {
      if (sort.col === "cliente") return row.nombre;
      const g = rowSegments(row);
      if (sort.col === "total") return g.total;
      if (sort.col === "venc") return pct(g.vencido, g.total);
      return row.tramos[Number(sort.col)]?.total ?? 0;
    });
  }, [rows, sort, query]);

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));

  return (
    <section className="rounded-xl bg-card shadow-sm">
      <div className="flex flex-wrap items-start gap-3 border-b border-border p-4">
        <div>
          <h3 className="text-[13.5px] font-semibold text-foreground">Matriz de control</h3>
          <div className="mt-2">
            <StatusLegend />
          </div>
        </div>

        {/* UiSearchInput es flex:1, así que el ml-auto va en el contenedor. */}
        <div className="ml-auto w-full max-w-[400px]">
          <UiSearchInput
            id="wallet-matrix-search"
            placeholder="Buscar cliente, factura o ejecutivo…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <SortableTh col="cliente" label="Cliente" sort={sort} onSort={onSort} />
              {TRAMOS.map((t) => (
                <SortableTh
                  key={t.i}
                  col={String(t.i)}
                  label={t.short}
                  align="right"
                  sort={sort}
                  onSort={onSort}
                />
              ))}
              <SortableTh col="total" label="Total" align="right" sort={sort} onSort={onSort} />
              <SortableTh col="venc" label="% vencido" align="right" sort={sort} onSort={onSort} />
            </tr>
          </thead>

          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-9 text-center text-muted-foreground">
                  Ningún cliente coincide con los filtros.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const g = rowSegments(row);
                const vencido = pct(g.vencido, g.total);

                return (
                  <tr key={row.id} className="border-b border-border last:border-b-0">
                    {/* TODO: al conectar el drilldown, este td abre los grupos del cliente. */}
                    <td className="min-w-[250px] px-3 py-2.5 align-middle">
                      <span className="font-semibold text-foreground">{row.nombre}</span>
                      <div className="text-[11.5px] text-muted-foreground">
                        <span className="font-mono">NIT {row.nit}</span> — {row.ejecutivo}
                      </div>
                    </td>

                    {row.tramos.map((cell, i) =>
                      cell.total === 0 ? (
                        <td
                          key={i}
                          className="px-3 py-2.5 text-right text-muted-foreground tabular-nums"
                        >
                          —
                        </td>
                      ) : (
                        <td key={i} className="px-3 py-2.5 text-right align-middle tabular-nums">
                          <span>{fmtM(cell.total)}</span>
                          <SegBar segments={cell} />
                        </td>
                      )
                    )}

                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                      {fmtM(g.total)}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right tabular-nums",
                        vencido > 30 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                      )}
                    >
                      {vencido.toFixed(0)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot>
            <tr className="border-t border-border">
              <th scope="row" className="px-3 py-2.5 text-left font-semibold text-foreground">
                Total
              </th>
              {TRAMOS.map((t) => (
                <th
                  key={t.i}
                  className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground"
                >
                  {fmtM(tramoTotal(visibleRows, t.i))}
                </th>
              ))}
              <th className="px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                {fmtM(visibleRows.reduce((a, r) => a + rowSegments(r).total, 0))}
              </th>
              <th />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
