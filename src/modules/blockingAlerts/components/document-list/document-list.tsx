"use client";

import { useAppStore } from "@/lib/store/store";
import { plural } from "../../utils/blocking-alerts";

interface DocumentListProps<T> {
  items: T[];
  getId: (item: T) => string;
  getAmount: (item: T) => number;
  /** Primera línea, segunda línea y su punto de color. */
  describe: (item: T) => { title: string; subtitle: string; dot: string };
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  /** Sustantivo de la lista ("factura", "facturas"). */
  noun: [string, string];
  empty: string;
  /** Aviso sobre la lista (p. ej. que las pagadas no suman). */
  notice?: React.ReactNode;
}

const CHECKBOX = "h-4 w-4 shrink-0 cursor-pointer accent-cp-lime";

/**
 * Documentos de una pestaña del detalle con selección: "Seleccionar todas" y una fila por
 * documento. La barra con el total de lo elegido la pinta el detalle, fija abajo.
 */
export default function DocumentList<T>({
  items,
  getId,
  getAmount,
  describe,
  selected,
  onSelectedChange,
  noun,
  empty,
  notice
}: DocumentListProps<T>) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const money = (value: number) => formatMoney(value, { hideDecimals: true });

  const chosen = new Set(selected);
  const picked = items.filter((item) => chosen.has(getId(item)));
  const allOn = items.length > 0 && picked.length === items.length;
  const total = (list: T[]) => list.reduce((s, item) => s + getAmount(item), 0);

  // "Todas" y "Vencidas" comparten selección: marcar o limpiar solo toca esta lista.
  const ids = new Set(items.map(getId));
  const others = selected.filter((id) => !ids.has(id));
  const toggle = (id: string) =>
    onSelectedChange(chosen.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-col">
      {notice}
      {items.length === 0 ? (
        <p className="m-0 py-6 text-center text-[13px] text-cp-ink-3">{empty}</p>
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-3 border-b border-cp-line py-2.5">
            <input
              type="checkbox"
              className={CHECKBOX}
              checked={allOn}
              ref={(el) => {
                if (el) el.indeterminate = picked.length > 0 && !allOn;
              }}
              onChange={() => onSelectedChange(allOn ? others : [...others, ...ids])}
            />
            <span className="flex-1 text-[13px] font-semibold text-cp-ink">Seleccionar todas</span>
            <span className="text-[13px] text-cp-ink-3">
              {plural(items.length, ...noun)} · {money(total(items))}
            </span>
          </label>
          {items.map((item) => {
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
                  checked={chosen.has(id)}
                  onChange={() => toggle(id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-cp-ink">
                    {title}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px] text-cp-ink-3">
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
          })}
        </>
      )}
    </div>
  );
}
