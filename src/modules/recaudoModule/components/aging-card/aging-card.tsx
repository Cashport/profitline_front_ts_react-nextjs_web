"use client";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { money, pct } from "../../utils/format";
import { sumBy } from "../../utils/rows";
import { Swatch } from "../shared/legend";
import { KPI_LABEL } from "../shared/styles";
import TowerTooltip from "../shared/tower-tooltip";

/**
 * Recaudo por tramo de mora. Clic en un tramo (barra o leyenda) filtra todo el
 * tablero; los demás se atenúan pero no desaparecen.
 */
export default function AgingCard({ data }: { data: ICollectionTower }) {
  const { filters, toggleAging } = useTowerFilters();
  const buckets = data.agingBuckets;
  const total = sumBy(buckets, (b) => b.amount) || 1;

  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-card px-3.5 pb-3 pt-3.5 shadow-sm">
      <div className={KPI_LABEL}>Recaudo por tramo</div>

      <AgingBar
        className="mt-3"
        height={10}
        highlight={filters.aging}
        onSegmentClick={toggleAging}
        segments={buckets.map((b) => ({ key: b.key, value: b.amount, color: b.color }))}
        wrapSegment={(seg, node) => {
          const bucket = buckets.find((b) => b.key === seg.key);
          return (
            <TowerTooltip
              title={bucket?.label ?? seg.key}
              rows={[
                { key: "v", color: seg.color, label: "Recaudado", value: money(seg.value) },
                { key: "p", color: seg.color, label: "Participación", value: pct(seg.value / total) }
              ]}
            >
              {node}
            </TowerTooltip>
          );
        }}
      />

      <div className="mt-3 grid grid-cols-3 gap-x-3.5 gap-y-1.5">
        {buckets.map((b) => (
          <button
            key={b.key}
            type="button"
            aria-pressed={filters.aging === b.key}
            onClick={() => toggleAging(b.key)}
            className={cn(
              "flex min-w-0 cursor-pointer items-center gap-[5px] border-0 bg-transparent p-0 text-left text-[10.5px] text-muted-foreground transition-opacity",
              filters.aging !== null && filters.aging !== b.key && "opacity-40"
            )}
          >
            <Swatch color={b.color} />
            <span className="truncate">{b.label}</span>
            <b className="ml-auto font-semibold tabular-nums text-foreground/80">
              {pct(b.amount / total, 0)}
            </b>
          </button>
        ))}
      </div>
    </div>
  );
}
