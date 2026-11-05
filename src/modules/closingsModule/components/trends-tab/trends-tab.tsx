"use client";

import { useMemo, useState } from "react";
import { Tooltip as AntTooltip } from "antd";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { IClosingClientInfo, IClosingHistoryRow } from "@/types/closings/IClosings";
import { cn } from "@/utils/utils";

import { marketColor } from "../../constants";
import Sparkline from "../sparkline/sparkline";
import useIsMobile from "../../hooks/use-is-mobile";
import {
  clientSignals,
  marketHeatmap,
  periodStats,
  ROLL_STEPS,
  STREAK,
  type ClientTrend
} from "../../utils/trends";
import { formatM1, formatPct, formatPp, periodLabel, periodShort } from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";
import { axisProps, ChartTooltipBox, gridProps } from "../chart-card/chart-theme";
import { Pill } from "../closing-kpis/closing-kpis";

interface Props {
  /** Cierres en orden cronológico. */
  periods: string[];
  history: IClosingHistoryRow[];
  clientOf: (nit: string) => IClosingClientInfo;
  onOpenClient: (nit: string) => void;
}

/* ---------- Piezas ---------- */

/** Color sólido del % vencido (escala de mora de DESIGN.md, sin pasteles). */
const heatColor = (v: number) =>
  v < 0.1
    ? { bg: "#cbe71e", fg: "#141414" }
    : v < 0.2
      ? { bg: "#f5b700", fg: "#141414" }
      : v < 0.3
        ? { bg: "#ff6a13", fg: "#ffffff" }
        : v < 0.4
          ? { bg: "#e5262b", fg: "#ffffff" }
          : { bg: "#e0007a", fg: "#ffffff" };

interface TrendKpi {
  key: string;
  label: string;
  help: string;
  value: string;
  series: (number | null)[];
  /** Variación frente al cierre anterior, ya formateada, y si es buena. */
  delta: { text: string; good: boolean | null } | null;
}

function TrendKpis({ items }: { items: TrendKpi[] }) {
  return (
    <div
      className="grid gap-[var(--card-gap)] max-md:!grid-cols-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((k) => (
        <section key={k.key} className="cp-card flex min-w-0 flex-col gap-1.5 px-4 py-2.5">
          <AntTooltip title={k.help}>
            <span className="cursor-help truncate text-[13px] text-cp-ink-3">{k.label}</span>
          </AntTooltip>
          <div className="flex min-w-0 items-end justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span className="whitespace-nowrap text-[22px] font-semibold leading-none tracking-[-0.4px] text-cp-ink">
                {k.value}
              </span>
              {k.delta && (
                <span
                  className={cn(
                    "mt-1 truncate text-[13px] font-semibold",
                    k.delta.good === true && "text-cp-lime-dark",
                    k.delta.good === false && "text-[#d11a2a] dark:text-[#ff6b6b]",
                    k.delta.good === null && "text-cp-ink-3"
                  )}
                >
                  {k.delta.text}
                </span>
              )}
            </div>
            <Sparkline values={k.series} />
          </div>
        </section>
      ))}
    </div>
  );
}

const pctDelta = (curr: number | null, prev: number | null, goodWhenDown = true) => {
  if (curr === null || prev === null) return null;
  const diff = curr - prev;
  if (Math.abs(diff) < 0.0005) return { text: "= vs cierre anterior", good: null };
  return {
    text: `${diff > 0 ? "▲" : "▼"} ${formatPp(Math.abs(diff)).replace("+", "")} vs anterior`,
    good: goodWhenDown ? diff < 0 : diff > 0
  };
};

/* ---------- Pestaña ---------- */

type SignalView = "worsening" | "improving" | "chronic";

/**
 * Tendencias entre cierres: hacia dónde va la cartera, dónde se está deteriorando y qué
 * clientes merecen atención antes del próximo comité.
 */
export default function TrendsTab({ periods, history, clientOf, onOpenClient }: Props) {
  const [view, setView] = useState<SignalView>("worsening");
  const isMobile = useIsMobile();

  const stats = useMemo(() => periodStats(history, periods), [history, periods]);
  const heat = useMemo(
    () => marketHeatmap(history, periods, clientOf),
    [history, periods, clientOf]
  );
  const signals = useMemo(
    () => clientSignals(history, periods, clientOf),
    [history, periods, clientOf]
  );

  if (periods.length < 2) {
    return (
      <section className="cp-card px-[18px] py-[18px] text-[13px] text-cp-ink-3">
        Las tendencias aparecen cuando haya al menos dos cierres cargados.
      </section>
    );
  }

  const last = stats[stats.length - 1];
  const prev = stats[stats.length - 2];
  const avgOverdue = stats.reduce((acc, s) => acc + s.overduePct, 0) / stats.length;

  const kpis: TrendKpi[] = [
    {
      key: "overdue",
      label: "% vencido",
      help: `Vencido sobre la cartera de cada cierre. Promedio de los ${stats.length} cierres: ${formatPct(avgOverdue)}.`,
      value: formatPct(last.overduePct),
      series: stats.map((s) => s.overduePct),
      delta: pctDelta(last.overduePct, prev.overduePct)
    },
    {
      key: "overdue30",
      label: "% vencido > 30 días",
      help: "Lo vencido a más de 30 días sobre la cartera: la mora que ya no es de un mes.",
      value: formatPct(last.overdue30Pct),
      series: stats.map((s) => s.overdue30Pct),
      delta: pctDelta(last.overdue30Pct, prev.overdue30Pct)
    },
    {
      key: "age",
      label: "Edad promedio del vencido",
      help: "Días promedio de lo vencido, ponderado por monto (cada tramo cuenta por su punto medio; +120 cuenta como 150 días).",
      value: `${Math.round(last.avgAge)} días`,
      series: stats.map((s) => s.avgAge),
      delta: (() => {
        const diff = Math.round(last.avgAge - prev.avgAge);
        if (!diff) return { text: "= vs cierre anterior", good: null };
        return {
          text: `${diff > 0 ? "▲" : "▼"} ${Math.abs(diff)} días vs anterior`,
          good: diff < 0
        };
      })()
    },
    {
      key: "rate",
      label: "Tasa de recaudo",
      help: "Recaudo del mes sobre la cartera del cierre anterior: qué parte de lo que se debía se recogió.",
      value: last.collectionRate === null ? "—" : formatPct(last.collectionRate),
      series: stats.map((s) => s.collectionRate),
      delta: pctDelta(last.collectionRate, prev.collectionRate, false)
    },
    {
      key: "roll",
      label: "Rodamiento 1-30 → 31-60",
      help: "Del vencido 1-30 del cierre anterior, cuánto apareció en 31-60 en este cierre (aproximado con totales). Mientras más bajo, más se está recuperando antes de envejecer.",
      value:
        last.roll[ROLL_STEPS[0].label] === null
          ? "—"
          : formatPct(last.roll[ROLL_STEPS[0].label] as number),
      series: stats.map((s) => s.roll[ROLL_STEPS[0].label]),
      delta: pctDelta(last.roll[ROLL_STEPS[0].label], prev.roll[ROLL_STEPS[0].label])
    },
    {
      key: "top",
      label: "Vencido en 10 clientes",
      help: "Parte del vencido que tienen los 10 clientes con más vencido. Si sube, la mora se está concentrando.",
      value: formatPct(last.topShare),
      series: stats.map((s) => s.topShare),
      delta: pctDelta(last.topShare, prev.topShare)
    }
  ];

  const rollData = stats.slice(1).map((s) => ({
    period: s.period,
    label: periodShort(s.period),
    ...Object.fromEntries(ROLL_STEPS.map((step) => [step.label, s.roll[step.label]]))
  }));
  const ROLL_COLORS = ["#f5b700", "#ff6a13", "#e5262b", "#a3004f"];

  const signalRows =
    view === "worsening"
      ? signals.worsening
      : view === "improving"
        ? signals.improving
        : signals.chronic;

  return (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <TrendKpis items={kpis} />

      <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ChartCard
          title="% vencido por mercado"
          help="Mapa de calor del % vencido de cada mercado en cada cierre. Verde por debajo de 10 %, magenta por encima de 40 %. Los chips de mercado de arriba filtran esta vista."
          legend={[
            { label: "< 10 %", color: "#cbe71e" },
            { label: "10-20 %", color: "#f5b700" },
            { label: "20-30 %", color: "#ff6a13" },
            { label: "30-40 %", color: "#e5262b" },
            { label: "> 40 %", color: "#e0007a" }
          ]}
        >
          <div
            className="grid items-center gap-[3px] text-[13px]"
            style={{
              gridTemplateColumns: isMobile
                ? `minmax(0,72px) repeat(${periods.length}, minmax(0,1fr))`
                : `minmax(0,170px) repeat(${periods.length}, minmax(0,1fr)) 72px`
            }}
          >
            <span />
            {periods.map((p) => (
              <span key={p} className="pb-1 text-center font-semibold text-cp-ink">
                {periodShort(p)}
              </span>
            ))}
            {!isMobile && <span className="pb-1 text-right font-semibold text-cp-ink">Cambio</span>}
            {heat.map((row) => {
              const first = row.values.find((v) => v !== null) ?? null;
              const current = row.values[row.values.length - 1];
              const change = first !== null && current !== null ? current - first : null;
              return [
                <span key={`${row.name}-n`} className="flex min-w-0 items-center gap-2 pr-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ background: marketColor(row.name) }}
                  />
                  <span className="truncate text-cp-ink" title={row.name}>
                    {row.name}
                  </span>
                </span>,
                ...row.values.map((v, i) => {
                  if (v === null) {
                    return (
                      <span
                        key={`${row.name}-${i}`}
                        className="flex h-7 items-center justify-center rounded bg-cp-muted text-cp-ink-4"
                      >
                        —
                      </span>
                    );
                  }
                  const c = heatColor(v);
                  return (
                    <span
                      key={`${row.name}-${i}`}
                      title={`${row.name} · ${periodLabel(periods[i])}: ${formatPct(v)}`}
                      className="flex h-7 items-center justify-center rounded font-semibold tabular-nums"
                      style={{ background: c.bg, color: c.fg }}
                    >
                      {isMobile ? `${Math.round(v * 100)}%` : formatPct(v).replace(" %", "%")}
                    </span>
                  );
                }),
                isMobile ? null : (
                  <span
                    key={`${row.name}-c`}
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      change === null
                        ? "text-cp-ink-4"
                        : change > 0.002
                          ? "text-[#d11a2a] dark:text-[#ff6b6b]"
                          : change < -0.002
                            ? "text-cp-lime-dark"
                            : "text-cp-ink-3"
                    )}
                  >
                    {change === null ? "—" : formatPp(change)}
                  </span>
                )
              ];
            })}
          </div>
        </ChartCard>

        <ChartCard
          title="Rodamiento de la mora"
          help="Qué parte de cada tramo del cierre anterior pasó al tramo siguiente en este cierre. Es una aproximación con totales: si baja, la cartera se está recuperando antes de envejecer."
          legend={ROLL_STEPS.map((s, i) => ({
            label: s.label,
            color: ROLL_COLORS[i],
            shape: "line" as const
          }))}
        >
          <div className="h-[240px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis
                  {...axisProps}
                  width={48}
                  tickFormatter={(v) => `${Math.round(v * 100)} %`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as Record<string, number | null | string>;
                    return (
                      <ChartTooltipBox
                        title={`Cierre ${periodLabel(String(row.period)).toLowerCase()}`}
                        rows={ROLL_STEPS.map((s, i) => ({
                          label: s.label,
                          value: row[s.label] === null ? "—" : formatPct(row[s.label] as number),
                          color: ROLL_COLORS[i],
                          shape: "line" as const
                        }))}
                      />
                    );
                  }}
                />
                {ROLL_STEPS.map((s, i) => (
                  <Line
                    key={s.label}
                    dataKey={s.label}
                    stroke={ROLL_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Señales por cliente"
        help={`Empeoran: su % vencido subió en cada uno de los últimos ${STREAK} cierres. Se recuperan: bajó en cada uno. Mora crónica: tienen saldo a más de 120 días en los últimos cierres seguidos. Clic en un cliente para ver su ficha.`}
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "worsening", label: `Empeoran (${signals.worsening.length})` },
              { value: "improving", label: `Se recuperan (${signals.improving.length})` },
              { value: "chronic", label: `Mora crónica (${signals.chronic.length})` }
            ]}
          />
        }
      >
        <SignalsTable
          rows={signalRows}
          view={view}
          periods={periods}
          compact={isMobile}
          onOpenClient={onOpenClient}
        />
      </ChartCard>
    </div>
  );
}

function SignalsTable({
  rows,
  view,
  periods,
  compact,
  onOpenClient
}: {
  rows: ClientTrend[];
  view: SignalView;
  periods: string[];
  /** Celular: solo cliente, % vencido y cambio. */
  compact: boolean;
  onOpenClient: (nit: string) => void;
}) {
  if (!rows.length) {
    return (
      <p className="py-8 text-center text-[13px] text-cp-ink-3">
        {view === "worsening"
          ? "Ningún cliente empeoró de forma sostenida. Bien."
          : view === "improving"
            ? "Ningún cliente mejoró de forma sostenida en los últimos cierres."
            : "No hay clientes con mora crónica."}
      </p>
    );
  }
  const cols = compact
    ? "minmax(0,1fr) 72px 72px"
    : "minmax(0,1.8fr) 110px minmax(90px,.7fr) minmax(100px,.8fr) minmax(90px,.7fr)";
  const color = view === "worsening" ? "#d11a2a" : view === "improving" ? "#9bb514" : "#a3004f";
  return (
    <div className="max-h-[440px] overflow-y-auto overflow-x-hidden">
      <div
        className="sticky top-0 z-[1] grid items-center gap-x-3.5 border-b border-cp-line bg-cp-surface px-3.5 py-3 text-[13.5px] font-semibold text-cp-ink"
        style={{ gridTemplateColumns: cols }}
      >
        <span>Cliente</span>
        {!compact && <span>{`% vencido · ${periods.length} cierres`}</span>}
        <span className="text-right">% vencido</span>
        {!compact && (
          <span className="text-right">{view === "chronic" ? "Saldo +120" : "Vencido"}</span>
        )}
        <span className="text-right">
          {view === "chronic"
            ? compact
              ? "Meses"
              : "Cierres seguidos"
            : compact
              ? "Cambio"
              : `Cambio ${STREAK} cierres`}
        </span>
      </div>
      {rows.map((r) => (
        <button
          key={r.nit}
          type="button"
          onClick={() => onOpenClient(r.nit)}
          className="grid w-full items-center gap-x-3.5 border-b border-cp-line px-3.5 py-2 text-left text-[13px] hover:bg-cp-bg"
          style={{ gridTemplateColumns: cols }}
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-cp-blue">{r.client}</span>
            <span className="flex min-w-0 items-center gap-1.5 text-cp-ink-4">
              <span className="truncate">{r.executive}</span>·
              <span
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ background: marketColor(r.market) }}
              />
              <span className="truncate">{r.market}</span>
            </span>
          </span>
          {!compact && <Sparkline values={r.series} color={color} width={100} />}
          <span className="flex justify-end">
            <Pill tone={r.overduePct > 0.4 ? "risk" : "neutral"}>{formatPct(r.overduePct)}</Pill>
          </span>
          {!compact && (
            <span className="text-right font-semibold tabular-nums">
              {formatM1(view === "chronic" ? r.over120 : r.overdue)} M
            </span>
          )}
          <span
            className={cn(
              "text-right font-semibold tabular-nums",
              view === "chronic"
                ? "text-cp-ink"
                : r.change > 0
                  ? "text-[#d11a2a] dark:text-[#ff6b6b]"
                  : "text-cp-lime-dark"
            )}
          >
            {view === "chronic" ? r.chronicMonths : formatPp(r.change)}
          </span>
        </button>
      ))}
      <p className="pt-2 text-right text-[13px] text-cp-ink-3">{rows.length} clientes</p>
    </div>
  );
}
