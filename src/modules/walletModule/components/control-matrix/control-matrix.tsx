"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

import UiSearchInput from "@/components/ui/search-input";
import { cn } from "@/utils/utils";
import { TRAMOS } from "../../constants";
import { fmtM, pct } from "../../utils/format";
import { nextSort, ordenar, rowSegments, tramoTotal } from "../../utils/wallet-calc";
import SegBar from "../shared/seg-bar";
import SortableTh from "../shared/sortable-th";
import StatusLegend from "../shared/status-legend";
import type { IWalletClientRow, IWalletDrilldown, SortState, TramoIndex } from "../../types";

interface ControlMatrixProps {
  /** Ya filtradas por la búsqueda: la vista es la dueña del texto. */
  rows: IWalletClientRow[];
  drilldown: IWalletDrilldown | null;
  onQueryChange: (value: string) => void;
  onSelect: (drilldown: IWalletDrilldown) => void;
}

const TEXTUAL_COLS = ["cliente"];

/** Celda seleccionada: naranja por dentro, sin mover el layout de la tabla. */
const SELECTED_CELL = "bg-wallet-accent-soft ring-2 ring-inset ring-wallet-accent";

/** Matriz cliente × tramo, con el desglose por estado bajo cada monto. */
export default function ControlMatrix({
  rows,
  drilldown,
  onQueryChange,
  onSelect
}: ControlMatrixProps) {
  const [sort, setSort] = useState<SortState>({ col: "total", dir: "desc" });

  const visibleRows = useMemo(
    () =>
      ordenar(rows, sort, (row) => {
        if (sort.col === "cliente") return row.nombre;
        const g = rowSegments(row);
        if (sort.col === "total") return g.total;
        if (sort.col === "venc") return pct(g.vencido, g.total);
        return row.tramos[Number(sort.col)]?.total ?? 0;
      }),
    [rows, sort]
  );

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));

  /** Las celdas son <td>, así que el teclado hay que cablearlo a mano. */
  const onCellKeyDown = (e: KeyboardEvent<HTMLTableCellElement>, drill: IWalletDrilldown) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onSelect(drill);
  };

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
            onChange={(e) => onQueryChange(e.target.value)}
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
                const delCliente = drilldown?.clienteId === row.id;

                return (
                  <tr key={row.id} className="border-b border-border last:border-b-0">
                    {/* Abre todos los grupos del cliente, sin importar el tramo. */}
                    <td
                      role="button"
                      tabIndex={0}
                      title="Ver todos los grupos del cliente"
                      onClick={() => onSelect({ clienteId: row.id, tramo: null })}
                      onKeyDown={(e) => onCellKeyDown(e, { clienteId: row.id, tramo: null })}
                      className={cn(
                        "group/name min-w-[250px] cursor-pointer px-3 py-2.5 align-middle transition-colors hover:bg-muted/60",
                        delCliente && drilldown?.tramo === null && SELECTED_CELL
                      )}
                    >
                      <span className="font-semibold text-foreground">{row.nombre}</span>
                      <span className="ml-2 whitespace-nowrap text-[10.5px] font-semibold text-wallet-accent opacity-0 transition-opacity group-hover/name:opacity-100">
                        ver grupos
                      </span>
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
                        <td
                          key={i}
                          role="button"
                          tabIndex={0}
                          title={`Ver los grupos de ${TRAMOS[i].label.toLowerCase()}`}
                          onClick={() => onSelect({ clienteId: row.id, tramo: i as TramoIndex })}
                          onKeyDown={(e) =>
                            onCellKeyDown(e, { clienteId: row.id, tramo: i as TramoIndex })
                          }
                          className={cn(
                            "cursor-pointer px-3 py-2.5 text-right align-middle tabular-nums transition-colors hover:bg-muted/60",
                            delCliente && drilldown?.tramo === i && SELECTED_CELL
                          )}
                        >
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
