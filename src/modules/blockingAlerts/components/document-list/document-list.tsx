"use client";

import { Pagination, Skeleton } from "antd";

import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertsTabSummary } from "@/types/blockingAlerts/IBlockingAlerts";

import { plural } from "../../utils/blocking-alerts";

/**
 * Selección de una pestaña sin tener todos sus documentos: con `all` están todos menos los de
 * `items`; sin `all`, solo los de `items`. `items` guarda el valor de cada documento tocado.
 */
export interface DocumentSelection {
  all: boolean;
  items: Record<string, number>;
}

export const ALL_SELECTED: DocumentSelection = { all: true, items: {} };

/** Cuántos documentos hay elegidos y cuánto suman, con el total de la pestaña que da el API. */
export const selectionTotals = (
  selection: DocumentSelection,
  summary: IBlockingAlertsTabSummary
) => {
  const touched = Object.values(selection.items);
  const sum = touched.reduce((s, x) => s + x, 0);
  return selection.all
    ? { count: summary.count - touched.length, total: summary.total - sum }
    : { count: touched.length, total: sum };
};

interface DocumentListProps<T> {
  /** Página actual; undefined mientras carga. */
  items: T[] | undefined;
  summary: IBlockingAlertsTabSummary;
  getId: (item: T) => string;
  getAmount: (item: T) => number;
  /** Primera línea, segunda línea y su punto de color. */
  describe: (item: T) => { title: string; subtitle: string; dot: string };
  selection: DocumentSelection;
  onSelectionChange: (selection: DocumentSelection) => void;
  /** Sustantivo de la lista ("factura", "facturas"). */
  noun: [string, string];
  empty: string;
  /** Aviso sobre la lista (p. ej. que las pagadas no suman). */
  notice?: React.ReactNode;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const CHECKBOX = "h-4 w-4 shrink-0 cursor-pointer accent-cp-lime";

/**
 * Documentos de una pestaña del detalle, paginados por el API, con selección: "Seleccionar
 * todas" cubre toda la pestaña (no solo la página). La barra con el total de lo elegido la pinta
 * el detalle, fija abajo.
 */
export default function DocumentList<T>({
  items,
  summary,
  getId,
  getAmount,
  describe,
  selection,
  onSelectionChange,
  noun,
  empty,
  notice,
  page,
  pageSize,
  onPageChange
}: DocumentListProps<T>) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const money = (value: number) => formatMoney(value, { hideDecimals: true });

  const touched = Object.keys(selection.items).length;
  const allOn = selection.all && touched === 0;
  const isChecked = (id: string) => selection.all !== id in selection.items;
  const toggle = (item: T) => {
    const id = getId(item);
    const next = { ...selection.items };
    if (id in next) delete next[id];
    else next[id] = getAmount(item);
    onSelectionChange({ all: selection.all, items: next });
  };

  return (
    <div className="flex flex-col">
      {notice}
      {summary.count === 0 ? (
        <p className="m-0 py-6 text-center text-[13px] text-cp-ink-3">{empty}</p>
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-3 border-b border-cp-line py-2.5">
            <input
              type="checkbox"
              className={CHECKBOX}
              checked={allOn}
              ref={(el) => {
                if (el) el.indeterminate = !allOn && (selection.all || touched > 0);
              }}
              onChange={() => onSelectionChange(allOn ? { all: false, items: {} } : ALL_SELECTED)}
            />
            <span className="flex-1 text-[13px] font-semibold text-cp-ink">Seleccionar todas</span>
            <span className="text-[12px] text-cp-ink-3">
              {plural(summary.count, ...noun)} · {money(summary.total)}
            </span>
          </label>
          {items ? (
            items.map((item) => {
              const id = getId(item);
              const { title, subtitle, dot } = describe(item);
              return (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-3 border-b border-cp-line py-2.5 hover:bg-cp-subtle"
                >
                  <input
                    type="checkbox"
                    className={CHECKBOX}
                    checked={isChecked(id)}
                    onChange={() => toggle(item)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-cp-ink">
                      {title}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] text-cp-ink-3">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: dot }}
                      />
                      <span className="truncate">{subtitle}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-semibold tabular-nums text-cp-ink">
                    {money(getAmount(item))}
                  </span>
                </label>
              );
            })
          ) : (
            <Skeleton active paragraph={{ rows: 4 }} className="py-3" />
          )}
          {summary.count > pageSize && (
            <Pagination
              className="self-end py-3"
              current={page}
              pageSize={pageSize}
              total={summary.count}
              onChange={onPageChange}
              showSizeChanger={false}
              size="small"
            />
          )}
        </>
      )}
    </div>
  );
}
