"use client";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import { KpiCard, KpiValue } from "@/components/ui/kpi-card/kpi-card";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertAging } from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import { AGING_SEGMENTS } from "../../constants";

interface PortfolioCardProps {
  label: string;
  aging?: IBlockingAlertAging;
  /** Bajo el monto ("72 clientes · 18 en alerta"). */
  caption?: string;
  /** Leyenda en filas con el monto a la derecha (columna angosta del detalle; en móvil siempre). */
  stacked?: boolean;
  /** Montos que no son tramos (saldos, notas crédito, pagos), bajo una línea. */
  extras?: { label: string; value: number }[];
  className?: string;
}

/** Cartera con su reparto al día / vencida 1–60 / +60 días. */
export default function PortfolioCard({
  label,
  aging,
  caption,
  stacked,
  extras,
  className
}: PortfolioCardProps) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const money = (value: number) => formatMoney(value, { hideDecimals: true });

  return (
    <KpiCard loading={!aging} className={cn("flex-none", className)}>
      {aging && (
        <>
          <KpiValue label={label} value={money(aging.portfolio)} caption={caption} />
          <div className="flex flex-col gap-2.5">
            <AgingBar
              segments={AGING_SEGMENTS.map((s) => ({
                key: s.key,
                value: aging[s.key],
                color: s.color,
                tip: `${s.label}: ${money(aging[s.key])}`
              }))}
            />
            <div
              className={cn(
                "flex text-[12.5px] text-cp-ink-3",
                stacked
                  ? "flex-col gap-1.5"
                  : "flex-wrap gap-x-6 gap-y-1 max-md:flex-col max-md:gap-1.5"
              )}
            >
              {AGING_SEGMENTS.map((s) => (
                <span key={s.key} className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                  <span
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ background: s.color }}
                  />
                  <span className={stacked ? "flex-1" : "max-md:flex-1"}>{s.label}</span>
                  <b className="font-semibold tabular-nums text-cp-ink">{money(aging[s.key])}</b>
                </span>
              ))}
            </div>
          </div>
          {extras && (
            <div className="flex flex-col gap-1.5 border-t border-cp-line pt-2.5 text-[12.5px] text-cp-ink-3">
              {extras.map((e) => (
                <span key={e.label} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="flex-1">{e.label}</span>
                  <b className="font-semibold tabular-nums text-cp-ink">{money(e.value)}</b>
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </KpiCard>
  );
}
