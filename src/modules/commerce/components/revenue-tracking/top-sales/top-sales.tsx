"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import { useDashboardSalesRanking } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesRanking";
import { useAppStore } from "@/lib/store/store";
import { formatNumber } from "@/utils/utils";

type CategoryKey = "producto" | "cliente" | "ciudad" | "vendedor";

const categoryLabels: Record<CategoryKey, { name: string; unit: string }> = {
  producto: { name: "Productos", unit: "Unid." },
  cliente: { name: "Clientes", unit: "Órdenes" },
  ciudad: { name: "Ciudades", unit: "Órdenes" },
  vendedor: { name: "Vendedores", unit: "Órdenes" }
};

export default function TopSales() {
  const [category, setCategory] = useState<CategoryKey>("producto");
  const { filters } = useRevenueTracking();
  const { data, isLoading } = useDashboardSalesRanking(category, filters);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const labels = categoryLabels[category];
  const items = data?.items ?? [];

  const renderRows = () => {
    if (isLoading && !data) {
      return (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Cargando…
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Sin datos
        </div>
      );
    }

    return items.map((item) => {
      const name = item.name;
      const unitValue = category === "producto" ? item.units : item.orders;
      const percentage = item.participation_pct;

      return (
        <div
          key={item.rank}
          className="grid grid-cols-[28px_1fr_40px_80px_70px] sm:grid-cols-[32px_1fr_60px_100px_90px] gap-2 sm:gap-4 items-center group/item hover:bg-muted p-1 rounded-lg transition-colors"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded sm:rounded-lg bg-secondary border border-border text-primary font-bold text-[10px] sm:text-sm flex items-center justify-center shrink-0">
            {item.rank}
          </div>
          <div className="min-w-0 pr-1 sm:pr-2 relative group/name text-left">
            <h4 className="text-[13px] sm:text-sm font-medium text-foreground truncate cursor-default">
              {name}
            </h4>
            <div className="absolute left-0 top-full mt-1 hidden group-hover/name:block z-50 pointer-events-none">
              <div className="bg-popover text-popover-foreground text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-border whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                {name}
              </div>
            </div>
          </div>

          <div className="text-left text-[13px] sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
            {formatNumber(unitValue)}
          </div>

          <div className="text-left">
            <span className="text-[13px] sm:text-sm font-bold text-foreground tabular-nums">
              {formatMoney(item.sales, { hideDecimals: true })}
            </span>
          </div>

          <div className="flex items-center justify-start gap-1.5 sm:gap-2">
            <div className="w-3.5 sm:w-5 h-1 bg-border rounded-full overflow-hidden shrink-0 hidden sm:block">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground text-left w-8 sm:w-10 shrink-0 tabular-nums">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-5 shrink-0 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1.5">Top de ventas</h3>
          <p className="text-sm font-bold text-muted-foreground">
            {labels.name} {data?.total_entities ?? 0} -{" "}
            <span className="text-primary">Pareto {data?.pareto_count ?? 0}</span>
          </p>
        </div>

        <div className="relative shrink-0">
          <select
            className="appearance-none bg-secondary border border-border text-foreground text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-primary/50 transition-colors w-28 sm:w-32"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
          >
            <option value="producto">Producto</option>
            <option value="cliente">Cliente</option>
            <option value="ciudad">Ciudad</option>
            <option value="vendedor">Vendedor</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-[28px_1fr_40px_80px_70px] sm:grid-cols-[32px_1fr_60px_100px_90px] gap-2 sm:gap-4 items-center px-1 mb-3 text-[11px] sm:text-xs font-semibold text-muted-foreground">
          <div></div>
          <div className="text-left">{labels.name}</div>
          <div className="text-left">{labels.unit}</div>
          <div className="text-left">Ventas</div>
          <div className="text-left">%</div>
        </div>

        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 sm:pr-3 no-scrollbar sm:scrollbar-thin sm:scrollbar-thumb-white/10 sm:scrollbar-track-transparent">
          {renderRows()}
        </div>
      </div>
    </div>
  );
}
