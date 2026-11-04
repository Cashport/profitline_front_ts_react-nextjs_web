"use client";

import { Pagination } from "antd";
import { useTranslations } from "use-intl";

import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { useAppStore } from "@/lib/store/store";
import { cn, formatNumber } from "@/utils/utils";
import {
  ConciliationSortField,
  IConciliationQuery,
  IConciliationRow
} from "@/types/portfolioConciliation/IPortfolioConciliation";
import { CONCILIATION_PAGE_SIZE, STATUS_META } from "../../constants";

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

/** El rótulo de cada columna es `reconciliation.table.columns.<col>`. */
const COLUMNS: { col: ConciliationSortField; align?: "right" }[] = [
  { col: "file_row", align: "right" },
  { col: "document_id" },
  { col: "document_type" },
  { col: "client_amount", align: "right" },
  { col: "current_amount_cashport", align: "right" },
  { col: "difference", align: "right" },
  { col: "status_cashport" }
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
  const t = useTranslations("reconciliation");
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
            "w-full border-collapse text-[13px] transition-opacity duration-150",
            isStale && "opacity-50"
          )}
        >
          <thead className="sticky top-0 z-[1]">
            <tr>
              {COLUMNS.map(({ col, align }) => {
                const active = sortBy === col;
                return (
                  <th
                    key={col}
                    scope="col"
                    onClick={() => onSort(col)}
                    className={cn(
                      "cursor-pointer select-none whitespace-nowrap border-b border-cp-line bg-cp-surface px-3 py-3 text-[13.5px] font-semibold text-cp-ink",
                      align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        align === "right" && "flex-row-reverse"
                      )}
                    >
                      {t(`table.columns.${col}`)}
                      <SortArrows dir={active ? sortDir : null} />
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
                  <td className="px-3 py-2 font-mono text-[13px]">{row.document_id}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {t(`documentType.${row.document_type}`)}
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
                      className="inline-flex items-center whitespace-nowrap rounded-[10px] px-2 py-0.5 text-[13px] font-medium"
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
                  {t("table.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] text-[#8a8a8a]">
          {total
            ? `${t("table.showing", {
                from: formatNumber(from),
                to: formatNumber(to),
                total: formatNumber(total)
              })}${isStale ? ` · ${t("table.updating")}` : ""}`
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
