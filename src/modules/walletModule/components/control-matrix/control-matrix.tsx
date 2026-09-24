"use client";

import { useMemo, type KeyboardEvent } from "react";
import { Eye, Info, Users } from "lucide-react";

import ProfitLoader from "@/components/ui/profit-loader";
import { AGING_BUCKETS } from "@/types/portfolios/IWalletMatrix";
import { cn } from "@/utils/utils";
import { TRAMOS } from "../../constants";
import { corto, fmtM, pct } from "../../utils/format";
import { rowSegments, tramoTotal } from "../../utils/wallet-calc";
import DetailTooltip, { estadoRows, MiniTooltip } from "../shared/detail-tooltip";
import SegBar from "../shared/seg-bar";
import SortableTh from "../shared/sortable-th";
import StatusChip from "../shared/status-chip";
import StatusLegend from "../shared/status-legend";
import WalletPagination from "../shared/wallet-pagination";
import type { IWalletClientRow, IWalletDrilldown, Sev, SortState, TramoIndex } from "../../types";

interface ControlMatrixProps {
  rows: IWalletClientRow[];
  /** Orden del servidor sobre la foto completa; lo posee la vista. `col` es el `sort_by` del API. */
  sort: SortState;
  // eslint-disable-next-line no-unused-vars
  onSort: (col: string) => void;
  /** Clientes de la foto completa, no sólo los de esta página. */
  totalClients: number;
  /** Paginación del servidor: la tabla sólo tiene la página cargada. */
  page: number;
  pageSize: number;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void;
  loading?: boolean;
  /** Texto del estado vacío; depende de si hay búsqueda activa. */
  emptyMessage?: string;
  drilldown: IWalletDrilldown | null;
  // eslint-disable-next-line no-unused-vars
  onSelect: (drilldown: IWalletDrilldown) => void;
}

/** Celda seleccionada: el verde va por dentro, sin mover el layout de la tabla. */
const SELECTED_CELL = "bg-wallet-accent-soft ring-2 ring-inset ring-wallet-accent";

/** Semáforo del % vencido de un cliente. */
const sevVencido = (pctVencido: number): Sev =>
  pctVencido >= 80 ? "crit" : pctVencido >= 50 ? "warn" : "ok";

/** Matriz cliente × tramo, con el desglose por estado bajo cada monto. */
export default function ControlMatrix({
  rows,
  sort,
  onSort,
  totalClients,
  page,
  pageSize,
  onPageChange,
  loading,
  emptyMessage = "Ningún cliente coincide con los filtros.",
  drilldown,
  onSelect
}: ControlMatrixProps) {
  // Ni la búsqueda ni el orden se resuelven aquí: la tabla sólo tiene la
  // página cargada, 15 de miles de clientes. Filtrar daría "sin resultados"
  // para clientes que sí existen y reordenar contradiría el orden de las
  // páginas; ambos los resuelve el servidor sobre la foto completa.
  const visibleRows = useMemo(() => {
    // Con una celda elegida la tabla se pliega a esa fila. Es sólo visual —no
    // consulta nada— y sólo aplica si el cliente sigue en la página: tras una
    // actualización la foto puede cambiar por debajo y dejarlo fuera; en ese
    // caso se muestra la página completa en vez de un "sin resultados" falso.
    const delCliente = drilldown ? rows.filter((r) => r.id === drilldown.clienteId) : [];
    return delCliente.length ? delCliente : rows;
  }, [rows, drilldown]);

  /** Las celdas son <td>, así que el teclado hay que cablearlo a mano. */
  const onCellKeyDown = (e: KeyboardEvent<HTMLTableCellElement>, drill: IWalletDrilldown) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onSelect(drill);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-md bg-[#2b4a5f] px-2.5 py-1 text-[13px] font-medium text-white">
            Cartera por cliente y tramo
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[12px] font-semibold text-muted-foreground">
            <Users className="h-3 w-3" />
            {loading
              ? "Actualizando…"
              : `${totalClients} ${totalClients === 1 ? "cliente" : "clientes"}`}
          </span>
        </div>

        <StatusLegend />
      </div>

      {/* Mientras carga, la tabla anterior sigue debajo (keepPreviousData) y el
          overlay bloquea los clics para que no se elija una celda de una foto
          que está por cambiar. */}
      <div className="relative overflow-x-auto">
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-card/70"
            role="status"
            aria-live="polite"
          >
            <ProfitLoader size="small" />
          </div>
        )}
        <div>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr>
                {/* Los `col` son los `sort_by` del API, así la vista los manda tal cual. */}
                <SortableTh
                  col="client_name"
                  label="Cliente"
                  sort={sort}
                  onSort={onSort}
                  uppercase={false}
                  className="font-bold"
                />
                {TRAMOS.map((t) => (
                  <SortableTh
                    key={t.i}
                    col={AGING_BUCKETS[t.i]}
                    label={t.short}
                    align="right"
                    sort={sort}
                    onSort={onSort}
                    uppercase={false}
                    className="font-bold"
                  />
                ))}
                <SortableTh
                  col="total"
                  label="Total"
                  align="right"
                  sort={sort}
                  onSort={onSort}
                  uppercase={false}
                  className="font-bold"
                />
                <SortableTh
                  col="overdue_percentage"
                  label="% vencido"
                  align="right"
                  sort={sort}
                  onSort={onSort}
                  uppercase={false}
                  className="font-bold"
                />
                <th scope="col" className="border-b border-border bg-muted/40" />
              </tr>
            </thead>

            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-9 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const g = rowSegments(row);
                  const vencido = pct(g.vencido, g.total);
                  const delCliente = drilldown?.clienteId === row.id;
                  const nombreActiva = delCliente && drilldown?.tramo === null;

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
                          aria-pressed={nombreActiva}
                          onClick={() => onSelect({ clienteId: row.id, tramo: null })}
                          onKeyDown={(e) => onCellKeyDown(e, { clienteId: row.id, tramo: null })}
                          className={cn(
                            "group/name min-w-[250px] cursor-pointer px-3 py-2.5 align-middle transition-colors hover:bg-muted/60",
                            nombreActiva && SELECTED_CELL
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span className="truncate text-blue-600 dark:text-blue-400">
                              {row.nombre}
                            </span>
                            <MiniTooltip
                              content={
                                <div className="whitespace-nowrap">
                                  <div>NIT {row.nit}</div>
                                  <div>{row.ejecutivo}</div>
                                </div>
                              }
                            >
                              <Info
                                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </MiniTooltip>
                          </span>
                          {/* Neutro y no verde: el lima sobre fondo claro no se lee. */}
                          <span className="ml-2 whitespace-nowrap text-[10.5px] font-semibold text-foreground opacity-0 transition-opacity group-hover/name:opacity-100">
                            {nombreActiva ? "quitar selección" : "ver grupos"}
                          </span>
                        </td>
                      </DetailTooltip>

                      {row.tramos.map((cell, i) => {
                        if (cell.total === 0) {
                          return (
                            <td
                              key={i}
                              className="px-3 py-2.5 text-right text-muted-foreground tabular-nums"
                            >
                              —
                            </td>
                          );
                        }

                        const activa = delCliente && drilldown?.tramo === i;

                        return (
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
                              aria-pressed={activa}
                              onClick={() =>
                                onSelect({ clienteId: row.id, tramo: i as TramoIndex })
                              }
                              onKeyDown={(e) =>
                                onCellKeyDown(e, { clienteId: row.id, tramo: i as TramoIndex })
                              }
                              className={cn(
                                "cursor-pointer px-3 py-2.5 text-right align-middle tabular-nums transition-colors hover:bg-muted/60",
                                activa && SELECTED_CELL
                              )}
                            >
                              <span>{fmtM(cell.total)}</span>
                              <SegBar segments={cell} />
                            </td>
                          </DetailTooltip>
                        );
                      })}

                      <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                        {fmtM(g.total)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <MiniTooltip content={`Vencido: ${fmtM(g.vencido)}`}>
                          <span className="inline-block min-w-[54px]">
                            <StatusChip sev={sevVencido(vencido)}>{vencido.toFixed(0)}%</StatusChip>
                          </span>
                        </MiniTooltip>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          aria-label="Ver detalle del cliente"
                          title="Ver detalle del cliente"
                          onClick={() => onSelect({ clienteId: row.id, tramo: null })}
                          className="inline-flex rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:border-wallet-accent hover:bg-wallet-accent hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
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
                <th />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* El orden y los totales del pie son de lo que se ve (la página, o la fila
          plegada); el paginador, de la foto completa. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3.5">
        <span className="text-[11.5px] text-muted-foreground">
          Mostrando {visibleRows.length} de {totalClients}{" "}
          {totalClients === 1 ? "cliente" : "clientes"}
        </span>
        <WalletPagination
          page={page}
          pageSize={pageSize}
          total={totalClients}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}
