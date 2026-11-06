"use client";

import { cn } from "@/utils/utils";
import { TierSwatch } from "./TierBadge";
import { ITierOption, TIER_CODES, TIER_META, TierFilterCode } from "./tiers";
import { useTierFilter, useTierFilterHydration } from "./useTierFilter";

interface TierQuickFilterProps {
  /** Counts per tier from the backend; without it the three tiers show without numbers. */
  options?: ITierOption[];
  className?: string;
}

/**
 * Inline tier legend that filters on click, same pattern as the market legend of
 * "Cartera por cliente": no title bar, just swatch + name + count.
 */
export function TierQuickFilter({ options, className }: TierQuickFilterProps) {
  useTierFilterHydration();
  const selected = useTierFilter((s) => s.selected);
  const toggle = useTierFilter((s) => s.toggle);
  const clear = useTierFilter((s) => s.clear);

  const items: Array<{ code: TierFilterCode; name: string; count?: number }> = options?.length
    ? options.map((o) => ({ code: o.code, name: o.name, count: o.count }))
    : TIER_CODES.map((code) => ({ code, name: TIER_META[code].label }));

  if (selected.includes("NONE") && !items.some((i) => i.code === "NONE")) {
    items.push({ code: "NONE", name: TIER_META.NONE.label, count: 0 });
  }

  const any = selected.length > 0;

  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1", className)}
      title="Clic en una clasificación para filtrar · clic en varias para sumarlas"
    >
      {items.map((item) => {
        const on = selected.includes(item.code);
        return (
          <button
            key={item.code}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(item.code)}
            className="flex h-7 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] px-[7px] text-[13px] font-medium hover:!text-[#141414]"
            style={{
              border: `1px solid ${on ? "#cbe71e" : "transparent"}`,
              background: on ? "#ffffff" : "transparent",
              color: on ? "#141414" : any ? "#a8a8a8" : "#4a4a4a"
            }}
          >
            <span className="inline-flex" style={{ opacity: on || !any ? 1 : 0.45 }}>
              <TierSwatch code={item.code} />
            </span>
            {item.name}
            {item.count !== undefined && (
              <span className="font-normal text-[#8a8a8a]">{item.count}</span>
            )}
          </button>
        );
      })}
      {any && (
        <button
          type="button"
          onClick={clear}
          className="cursor-pointer whitespace-nowrap border-0 bg-transparent px-1 text-[13px] font-semibold text-[#141414] hover:underline"
        >
          Quitar filtro
        </button>
      )}
    </div>
  );
}
