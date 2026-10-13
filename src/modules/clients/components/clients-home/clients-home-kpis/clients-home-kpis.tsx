"use client";

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
            <StatusBadge bg={pill.bg} color={pill.color} className="text-[11.5px]">
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
        {/* Clic en un tramo: la tabla muestra solo la cartera de esa edad. */}
        <div className="flex flex-wrap justify-between gap-x-2.5 gap-y-1 [container-type:inline-size]">
          {AGING_BUCKETS.map((b) => {
            const active = aging === b.key;
            return (
              <div
                key={b.key}
                onClick={() => toggle(b.key)}
                title={`${b.label}: ${fmt(totals.aging[b.key])} M`}
                className="-mx-1 -my-0.5 flex min-w-0 shrink cursor-pointer items-center gap-1 whitespace-nowrap rounded-[5px] px-1 py-0.5 text-[clamp(9.5px,2.9cqi,11px)] text-[#6b6b6b] hover:!bg-[#f2f2f2]"
                style={{
                  opacity: aging === null || active ? 1 : 0.35,
                  background: active ? "#f7f7f7" : "transparent",
                  boxShadow: active ? `inset 0 0 0 1px ${b.color}` : "none"
                }}
              >
                <span className="h-1.5 w-1.5 rounded-sm" style={{ background: b.color }} />
                {b.short}
                <span className="font-semibold text-[#141414]">
                  {fmtHeroShort(totals.aging[b.key])}
                </span>
              </div>
            );
          })}
        </div>
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
          className={`justify-between gap-2 px-3.5 [container-type:inline-size] ${i > 0 ? "border-l border-[#ececec]" : ""}`}
          caption={
            <>
              <b className="font-semibold text-[#141414]">{it.count.toLocaleString("es-CO")}</b>{" "}
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
              <StatusBadge bg="#f4f9d2" color="#141414" className="text-[11.5px]">
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
        <div className="min-w-0 [container-type:inline-size]">
          {/* Sin espacio, el forecast baja a su propia línea, siempre a la derecha. */}
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 whitespace-nowrap text-[clamp(9px,2.45cqi,11px)] text-[#6b6b6b]">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <LegendItem color={COLLECTION_COLORS.agreementsActive} label="Acuerdos">
                {fmt(c.agreementsActive)} M
              </LegendItem>
              <LegendItem color={COLLECTION_COLORS.agreementsBroken} label="Incumplidos">
                {fmt(c.agreementsBroken)} M
              </LegendItem>
            </span>
            <span className="ml-auto">
              Forecast <b className="font-semibold text-[#141414]">{fmt(c.forecast)} M</b>
              {c.forecastPct !== null && ` · ${pct1(c.forecastPct)}`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const LegendItem = ({
  color,
  label,
  children
}: {
  color: string;
  label: string;
  children: React.ReactNode;
}) => (
  <span className="flex items-center gap-[5px]">
    <span className="h-1.5 w-1.5 rounded-sm" style={{ background: color }} />
    {label} <b className="font-semibold text-[#141414]">{children}</b>
  </span>
);
