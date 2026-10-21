"use client";

import { Pagination } from "antd";

import { useAppStore } from "@/lib/store/store";
import { cn, formatNumber } from "@/utils/utils";
import {
  ConciliationSortField,
  IConciliationQuery,
  IConciliationRow
} from "@/types/portfolioConciliation/IPortfolioConciliation";
import { CONCILIATION_PAGE_SIZE, DOCUMENT_TYPE_LABEL, STATUS_META } from "../../constants";

interface Props {
  rows: IConciliationRow[];
  sortBy: IConciliationQuery["sortBy"];
  sortDir: IConciliationQuery["sortDir"];
  onSort: (col: ConciliationSortField) => void;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Las filas son de la consulta anterior: la nueva todavía no llega. */
  isStale: boolean;
  /** Hay una consulta en curso (nueva o refresco en segundo plano). */
  isRefreshing: boolean;
}

const COLUMNS: { col: ConciliationSortField; label: string; align?: "right" }[] = [
  { col: "file_row", label: "Fila", align: "right" },
  { col: "document_id", label: "Id documento" },
  { col: "document_type", label: "Tipo" },
  { col: "client_amount", label: "Monto cliente", align: "right" },
  { col: "current_amount_cashport", label: "Valor Cashport", align: "right" },
  { col: "difference", label: "Diferencia", align: "right" },
  { col: "status_cashport", label: "Estado" }
];

/** Página de la cartera conciliada; orden y paginación los resuelve el servidor. */
const ConciliationTable = ({
  rows,
  sortBy,
  sortDir,
  onSort,
  page,
  total,
  onPageChange,
  isStale,
  isRefreshing
}: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const from = total ? (page - 1) * CONCILIATION_PAGE_SIZE + 1 : 0;
  const to = Math.min(page * CONCILIATION_PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative overflow-auto rounded-lg border border-[#ececec]"
        aria-busy={isRefreshing}
      >
        {/* Sin velo: la tabla sigue usable mientras llega la consulta; solo una barra arriba */}
        {isRefreshing && (
          <div className="absolute inset-x-0 top-0 z-[2] h-0.5 animate-pulse bg-[#7cb518]" />
        )}
        <table
          className={cn(
            "w-full border-collapse text-[12.5px] transition-opacity duration-150",
            isStale && "opacity-50"
          )}
        >
          <thead className="sticky top-0 z-[1]">
            <tr>
              {COLUMNS.map(({ col, label, align }) => {
                const active = sortBy === col;
                return (
                  <th
                    key={col}
                    scope="col"
                    onClick={() => onSort(col)}
                    className={cn(
                      "cursor-pointer select-none whitespace-nowrap border-b border-[#ececec] bg-[#fafafa] px-3 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-colors",
                      align === "right" ? "text-right" : "text-left",
                      active ? "text-foreground" : "text-[#8a8a8a] hover:text-foreground"
                    )}
                  >
                    {label}
                    <span className={cn("ml-1 text-[8px]", !active && "opacity-35")}>
                      {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = STATUS_META[row.status_cashport];
              return (
                <tr key={row.id} className="border-b border-[#f0f0f0] last:border-b-0">
                  <td className="px-3 py-2 text-right tabular-nums text-[#8a8a8a]">
                    {formatNumber(row.file_row)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{row.document_id}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {DOCUMENT_TYPE_LABEL[row.document_type]}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                    {formatMoney(row.client_amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                    {row.current_amount_cashport === null
                      ? "—"
                      : formatMoney(row.current_amount_cashport)}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-3 py-2 text-right tabular-nums",
                      row.status_cashport === "NOVEDAD" && "font-medium text-[#ad6800]"
                    )}
                  >
                    {row.difference === null ? "—" : formatMoney(row.difference)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex items-center whitespace-nowrap rounded-[10px] px-2 py-0.5 text-[11.5px] font-medium"
                      style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!rows.length && !isStale && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-10 text-center text-[#8a8a8a]">
                  No hay documentos con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-[#8a8a8a]">
          {total
            ? `Mostrando ${formatNumber(from)}–${formatNumber(to)} de ${formatNumber(total)} documentos${isStale ? " · actualizando…" : ""}`
            : ""}
        </span>
        <Pagination
          current={page}
          pageSize={CONCILIATION_PAGE_SIZE}
          total={total}
          onChange={onPageChange}
          showSizeChanger={false}
          hideOnSinglePage
        />
      </div>
    </div>
  );
};

export default ConciliationTable;
