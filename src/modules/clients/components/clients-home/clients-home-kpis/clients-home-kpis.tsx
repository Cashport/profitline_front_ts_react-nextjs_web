"use client";

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { KpiAside, KpiCard, KpiValue } from "@/components/ui/kpi-card/kpi-card";
import AgingBar from "@/components/ui/aging-bar/aging-bar";
import ProgressVsGoal from "@/components/ui/progress-vs-goal/progress-vs-goal";
import StatusBadge from "@/components/ui/status-badge/status-badge";
import type { ClientsHomeAgingBucket, IClientsHomeTotals } from "@/types/clients/IClientsHome";
import {
  AGING_BUCKETS,
  COLLECTION_COLORS,
  GOAL_SCALE,
  pastDuePill
} from "../../../constants/clients-home";
import { useClientsHomeFilters } from "../../../stores/clients-home-filters";
import { fmt, fmtHeroShort, pct1 } from "../../../utils/clients-home-format";

interface ClientsHomeKpisProps {
  totals: IClientsHomeTotals | null;
  loading: boolean;
}

/** Las tres tarjetas del Home: cartera por edades, notas/PNA/novedades y recaudo vs meta. */
export default function ClientsHomeKpis({ totals, loading }: ClientsHomeKpisProps) {
  const isLoading = loading || !totals;
  return (
    <div className="mb-3 flex flex-wrap gap-3">
      <KpiCard loading={isLoading}>{totals && <PortfolioCard totals={totals} />}</KpiCard>
      <KpiCard loading={isLoading} className="grid grid-cols-3 items-stretch gap-0 px-1">
        {totals && <DocumentsCard totals={totals} />}
      </KpiCard>
      <KpiCard loading={isLoading}>{totals && <CollectionCard totals={totals} />}</KpiCard>
    </div>
  );
}

const PortfolioCard = ({ totals }: { totals: IClientsHomeTotals }) => {
  const [aging, setAging] = useClientsHomeFilters(
    useShallow((s) => [s.aging, s.setAging] as const)
  );
  const toggle = (key: ClientsHomeAgingBucket) => setAging(aging === key ? null : key);
  const pill = pastDuePill(totals.pastDuePct);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <KpiValue label="Total cartera" value={fmt(totals.portfolio)} unit="M" />
        <KpiAside
          label="Vencida"
          pill={
            <StatusBadge bg={pill.bg} color={pill.color} className="text-[13px]">
              {pct1(totals.pastDuePct)}
            </StatusBadge>
          }
          value={`${fmt(totals.pastDue)} M`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <AgingBar
          highlight={aging}
          onSegmentClick={(key) => toggle(key as ClientsHomeAgingBucket)}
          segments={AGING_BUCKETS.map((b) => ({
            key: b.key,
            value: totals.aging[b.key],
            color: b.color,
            tip: `${b.label}: ${fmt(totals.aging[b.key])} M`
          }))}
        />
        {/* Clic en un tramo: la tabla muestra solo la cartera de esa edad. Una sola línea:
            los tramos que no caben se resumen en "+N" (también se filtran desde la barra). */}
        <OneLineLegend
          more={(hidden) => ({
            label: `+${hidden.length}`,
            title: `Más tramos: ${hidden
              .map((b) => `${b.label} ${fmt(totals.aging[b.key])} M`)
              .join(" · ")}`
          })}
          items={AGING_BUCKETS.map((b) => {
            const active = aging === b.key;
            return {
              ...b,
              node: (
                <div
                  key={b.key}
                  onClick={() => toggle(b.key)}
                  title={`${b.label}: ${fmt(totals.aging[b.key])} M`}
                  className="-mx-1 flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-[5px] px-1 text-[13px] leading-tight text-cp-ink-3 hover:!bg-cp-muted"
                  style={{
                    opacity: aging === null || active ? 1 : 0.35,
                    background: active ? "#f7f7f7" : "transparent",
                    boxShadow: active ? `inset 0 0 0 1px ${b.color}` : "none"
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-sm"
                    style={{ background: b.color }}
                  />
                  {b.short}
                  <span className="font-semibold text-cp-ink">
                    {fmtHeroShort(totals.aging[b.key])}
                  </span>
                </div>
              )
            };
          })}
        />
      </div>
    </>
  );
};

const DocumentsCard = ({ totals }: { totals: IClientsHomeTotals }) => {
  const items = [
    { label: "Notas", ...totals.creditNotes, noun: "notas" },
    { label: "PNA", ...totals.unappliedPayments, noun: "pagos" },
    { label: "Novedades", ...totals.novelties, noun: "novedades" }
  ];
  return (
    <>
      {/* El monto baja de 20px a 18px con el ancho de su columna; si aún no cabe, elipsis. */}
      {items.map((it, i) => (
        <KpiValue
          key={it.label}
          size="md"
          label={it.label}
          value={fmt(it.amount)}
          unit="M"
          valueClassName="text-[clamp(18px,21cqi,20px)]"
          className={`justify-between gap-2 px-3.5 [container-type:inline-size] ${i > 0 ? "border-l border-cp-line" : ""}`}
          caption={
            <>
              <b className="font-semibold text-cp-ink">{it.count.toLocaleString("es-CO")}</b>{" "}
              {it.noun}
            </>
          }
        />
      ))}
    </>
  );
};

const CollectionCard = ({ totals }: { totals: IClientsHomeTotals }) => {
  const c = totals.collection;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <KpiValue label="Recaudo" value={fmt(c.collected)} unit="M" />
        <KpiAside
          label="Meta"
          pill={
            c.goal !== null && (
              <StatusBadge bg="#cbe71e" color="#141414" className="text-[13px]">
                {pct1(c.collectedPct)}
              </StatusBadge>
            )
          }
          value={c.goal === null ? "Sin meta" : `${fmt(c.goal)} M`}
        />
      </div>
      <div className="flex flex-col gap-2">
        <ProgressVsGoal
          className="my-0.5"
          goal={c.goal}
          goalScale={GOAL_SCALE}
          goalTip={c.goal === null ? undefined : `Meta: ${fmt(c.goal)} M`}
          segments={[
            {
              key: "collected",
              value: c.collected,
              color: COLLECTION_COLORS.collected,
              tip: `Recaudo: ${fmt(c.collected)} M`
            },
            {
              key: "agreementsActive",
              value: c.agreementsActive,
              color: COLLECTION_COLORS.agreementsActive,
              tip: `Acuerdos de pago vigentes: ${fmt(c.agreementsActive)} M`
            },
            {
              key: "agreementsBroken",
              value: c.agreementsBroken,
              color: COLLECTION_COLORS.agreementsBroken,
              tip: `Acuerdos incumplidos: ${fmt(c.agreementsBroken)} M`
            }
          ]}
        />
        {/* Una sola línea (DESIGN.md §5): sin espacio, cada parte se corta con "…" y el title la muestra completa. */}
        <div className="flex min-w-0 flex-nowrap items-center justify-between gap-x-2 overflow-hidden whitespace-nowrap text-[13px] leading-tight text-cp-ink-3">
          <span className="flex min-w-0 items-center gap-x-2">
            <LegendItem
              color={COLLECTION_COLORS.agreementsActive}
              label="Acuerdos"
              value={`${fmt(c.agreementsActive)} M`}
            />
            <LegendItem
              color={COLLECTION_COLORS.agreementsBroken}
              label="Incumplidos"
              value={`${fmt(c.agreementsBroken)} M`}
            />
          </span>
          <span
            className="ml-auto min-w-0 truncate"
            title={`Forecast ${fmt(c.forecast)} M${
              c.forecastPct !== null ? ` · ${pct1(c.forecastPct)}` : ""
            }`}
          >
            Forecast <b className="font-semibold text-cp-ink">{fmt(c.forecast)} M</b>
            {c.forecastPct !== null && ` · ${pct1(c.forecastPct)}`}
          </span>
        </div>
      </div>
    </>
  );
};

const LegendItem = ({ color, label, value }: { color: string; label: string; value: string }) => (
  <span className="flex min-w-0 items-center gap-[5px]" title={`${label} ${value}`}>
    <span className="h-1.5 w-1.5 shrink-0 rounded-sm" style={{ background: color }} />
    <span className="min-w-0 truncate">
      {label} <b className="font-semibold text-cp-ink">{value}</b>
    </span>
  </span>
);

interface LegendEntry {
  key: string;
  node: React.ReactNode;
}

/** Leyenda en una sola línea (DESIGN.md §5): muestra los ítems que caben y resume el resto
    en un "+N" con el detalle en el title. Mide los anchos en una copia invisible. */
function OneLineLegend<T extends LegendEntry>({
  items,
  more
}: {
  items: T[];
  more: (hidden: T[]) => { label: string; title: string };
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(items.length);

  useEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;
    const GAP = 10;
    const calc = () => {
      const widths = Array.from(measure.children).map((el) => (el as HTMLElement).offsetWidth);
      const moreWidth = widths.pop() ?? 0;
      const avail = box.clientWidth;
      const all = widths.reduce((a, w) => a + w, 0) + GAP * (widths.length - 1);
      if (all <= avail) return setFit(widths.length);
      let used = moreWidth;
      let n = 0;
      while (n < widths.length && used + widths[n] + GAP <= avail) used += widths[n++] + GAP;
      setFit(n);
    };
    const ro = new ResizeObserver(calc);
    ro.observe(box);
    ro.observe(measure);
    calc();
    return () => ro.disconnect();
  }, [items.length]);

  const hidden = items.slice(fit);
  const extra = hidden.length > 0 ? more(hidden) : null;
  const moreChip = (label: string, title?: string) => (
    <span
      title={title}
      className="shrink-0 cursor-default whitespace-nowrap text-[13px] font-semibold leading-tight text-cp-ink-3"
    >
      {label}
    </span>
  );

  return (
    <div ref={boxRef} className="relative flex min-w-0 justify-between gap-x-2.5 overflow-hidden">
      {items.slice(0, fit).map((it) => it.node)}
      {extra && moreChip(extra.label, extra.title)}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex w-max gap-x-2.5"
      >
        {items.map((it) => (
          <span key={it.key} className="flex">
            {it.node}
          </span>
        ))}
        {moreChip(`+${items.length}`)}
      </div>
    </div>
  );
}
