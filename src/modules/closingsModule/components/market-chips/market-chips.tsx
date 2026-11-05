"use client";

import { marketColor } from "../../constants";

interface Props {
  markets: { name: string; total: number }[];
  selected: string[];
  onToggle: (market: string) => void;
  onClear: () => void;
}

/**
 * Mercados del cierre como en Clientes: clic en uno filtra todo el tablero, clic en varios los
 * suma. Es el mismo filtro "Mercado" del modal, así que los dos quedan sincronizados.
 */
export default function MarketChips({ markets, selected, onToggle, onClear }: Props) {
  const any = selected.length > 0;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
      {markets.map((m) => {
        const on = selected.includes(m.name);
        return (
          <button
            key={m.name}
            type="button"
            onClick={() => onToggle(m.name)}
            className="flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-[7px] text-[13px] font-medium hover:!text-cp-ink"
            style={{
              border: `1px solid ${on ? "#cbe71e" : "transparent"}`,
              background: on ? "rgb(var(--cp-bg))" : "transparent",
              color: on
                ? "rgb(var(--cp-ink))"
                : any
                  ? "rgb(var(--cp-ink-4))"
                  : "rgb(var(--cp-ink-2))"
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: marketColor(m.name), opacity: on || !any ? 1 : 0.45 }}
            />
            {m.name}
          </button>
        );
      })}
      {any && (
        <button
          type="button"
          onClick={onClear}
          className="whitespace-nowrap px-1 text-[13px] font-semibold text-cp-ink hover:underline"
        >
          Quitar filtro
        </button>
      )}
    </div>
  );
}
