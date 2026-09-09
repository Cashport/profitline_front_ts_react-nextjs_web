"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

import UiSearchInput from "@/components/ui/search-input";
import { cn } from "@/utils/utils";
import { TRAMOS } from "../../constants";
import { corto, fmtM, pct } from "../../utils/format";
import { nextSort, ordenar, rowSegments, tramoTotal } from "../../utils/wallet-calc";
import DetailTooltip, { estadoRows } from "../shared/detail-tooltip";
import SegBar from "../shared/seg-bar";
import SortableTh from "../shared/sortable-th";
import StatusLegend from "../shared/status-legend";
import type { IWalletClientRow, IWalletDrilldown, SortState, TramoIndex } from "../../types";

interface ControlMatrixProps {
  rows: IWalletClientRow[];
  /** Texto de búsqueda actual; la resuelve el servidor, no esta tabla. */
  search: string;
  // eslint-disable-next-line no-unused-vars
  onSearchChange: (value: string) => void;
  /** Clientes que coinciden con la búsqueda, no sólo los de esta página. */
  totalClients: number;
  loading?: boolean;
  /** Texto del estado vacío; depende de si hay búsqueda activa. */
  emptyMessage?: string;
  drilldown: IWalletDrilldown | null;
  // eslint-disable-next-line no-unused-vars
  onSelect: (drilldown: IWalletDrilldown) => void;
}

const TEXTUAL_COLS = ["cliente"];

/** Celda seleccionada: el verde va por dentro, sin mover el layout de la tabla. */
const SELECTED_CELL = "bg-wallet-accent-soft ring-2 ring-inset ring-wallet-accent";

/** Matriz cliente × tramo, con el desglose por estado bajo cada monto. */
export default function ControlMatrix({
  rows,
  search,
  onSearchChange,
  totalClients,
  loading,
  emptyMessage = "Ningún cliente coincide con los filtros.",
  drilldown,
  onSelect
}: ControlMatrixProps) {
  const [sort, setSort] = useState<SortState>({ col: "total", dir: "desc" });

  // La búsqueda NO se filtra aquí a propósito: la tabla sólo tiene la página
  // cargada (50 de miles de clientes), así que filtrar en el navegador daría
  // "sin resultados" para clientes que sí existen. La resuelve el servidor
  // sobre la foto completa.
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
    <section className="rounded-xl bg-card text-card-foreground shadow-sm">
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
            placeholder="Buscar cliente, NIT, factura o ejecutivo…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search.trim() && (
            <p className="mt-1.5 text-right text-[11.5px] text-muted-foreground">
              {loading
                ? "Buscando…"
                : `${totalClients} ${totalClients === 1 ? "cliente" : "clientes"} coinciden`}
            </p>
          )}
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
                  {emptyMessage}
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
                    <DetailTooltip
                      title={`${corto(row.nombre)} · toda la cartera`}
                      rows={estadoRows(g)}
                      total={{ value: fmtM(g.total) }}
                    >
                      <td
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect({ clienteId: row.id, tramo: null })}
                        onKeyDown={(e) => onCellKeyDown(e, { clienteId: row.id, tramo: null })}
                        className={cn(
                          "group/name min-w-[250px] cursor-pointer px-3 py-2.5 align-middle transition-colors hover:bg-muted/60",
                          delCliente && drilldown?.tramo === null && SELECTED_CELL
                        )}
                      >
                        <span className="font-semibold text-foreground">{row.nombre}</span>
                        {/* Neutro y no verde: el lima sobre fondo claro no se lee. */}
                        <span className="ml-2 whitespace-nowrap text-[10.5px] font-semibold text-foreground opacity-0 transition-opacity group-hover/name:opacity-100">
                          ver grupos
                        </span>
                        <div className="text-[11.5px] text-muted-foreground">
                          <span className="font-mono">NIT {row.nit}</span> — {row.ejecutivo}
                        </div>
                      </td>
                    </DetailTooltip>

                    {row.tramos.map((cell, i) =>
                      cell.total === 0 ? (
                        <td
                          key={i}
                          className="px-3 py-2.5 text-right text-muted-foreground tabular-nums"
                        >
                          —
                        </td>
                      ) : (
                        // Sin `title` nativo: el tooltip ya dice qué hay en la celda y
                        // el del navegador se pintaría encima.
                        <DetailTooltip
                          key={i}
                          title={`${row.nombre} · ${TRAMOS[i].label}`}
                          rows={estadoRows(cell)}
                          total={{ value: fmtM(cell.total) }}
                        >
                          <td
                            role="button"
                            tabIndex={0}
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
                        </DetailTooltip>
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
