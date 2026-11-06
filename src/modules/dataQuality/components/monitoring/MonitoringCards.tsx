"use client";

import { ReactNode, useMemo, useState } from "react";
import { MonitoringAlertType, IMonitoringSummary } from "../../types/monitoring";
import {
  ALERT_META,
  ALERT_ORDER,
  PERIODICITY_LABEL,
  STATE_COLORS,
  formatNumber,
  formatPct,
  formatShortDate,
  formatVariation,
  plural
} from "./monitoringFormat";

const LIST_LIMIT = 10;

export type DetailTab = "all" | "critical" | "late" | "novelty" | "received";

export const DETAIL_TABS: readonly DetailTab[] = ["all", "critical", "late", "novelty", "received"];

export const isDetailTab = (value: unknown): value is DetailTab =>
  typeof value === "string" && (DETAIL_TABS as readonly string[]).includes(value);

function Card({
  title,
  meta,
  children,
  className = ""
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`cp-card flex min-w-0 flex-col px-[24px] py-[20px] ${className}`}>
      <header className="mb-[12px] flex items-baseline justify-between gap-3">
        <h2 className="text-[18px] font-semibold text-cp-ink">{title}</h2>
        {meta && <span className="truncate text-[14px] text-cp-ink-3">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

function StackedBar({
  parts,
  height = 8
}: {
  parts: Array<{ value: number; color: string }>;
  height?: number;
}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  return (
    <div
      className="flex w-full gap-[2px] overflow-hidden rounded-full bg-cp-muted"
      style={{ height }}
    >
      {total > 0 &&
        parts
          .filter((p) => p.value > 0)
          .map((p, i) => (
            <span
              key={i}
              style={{ flexGrow: p.value, flexBasis: 0, backgroundColor: p.color, minWidth: 3 }}
            />
          ))}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-[9px] w-[9px] shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function LegendChip({
  color,
  label,
  count,
  active,
  dimmed,
  onClick
}: {
  color: string;
  label: string;
  count: number;
  active: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-[6px] rounded-[8px] border px-[8px] py-[2px] text-[15px] transition-colors ${
        active ? "border-cp-lime-dark font-semibold text-cp-ink" : "border-transparent"
      } ${!active && dimmed ? "text-cp-ink-4" : "text-cp-ink-2"} hover:text-cp-ink`}
    >
      <Dot color={color} />
      {label}
      <span className="text-cp-ink-4">{count}</span>
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-[24px] text-center text-[15px] text-cp-ink-3">{text}</p>;
}

export function ReceptionCard({
  data,
  onOpenDetail
}: {
  data: IMonitoringSummary;
  onOpenDetail: (tab: DetailTab) => void;
}) {
  const r = data.reception;
  const legend = [
    { key: "received", label: "Recibido", value: r.received_files, color: STATE_COLORS.received },
    { key: "novelty", label: "Con novedad", value: r.novelty_files, color: STATE_COLORS.novelty },
    { key: "pending", label: "Pendiente", value: r.pending_files, color: STATE_COLORS.pending }
  ];

  return (
    <Card title="Recepción de datos" meta="Archivos esperados en el periodo">
      {r.expected_files === 0 ? (
        <EmptyState text="No hay archivos esperados en este periodo." />
      ) : (
        <>
          <div className="text-[64px] font-semibold leading-none tracking-tight text-cp-ink">
            {formatPct(r.received_pct)}
          </div>
          <p className="mt-[6px] text-[15px] text-cp-ink-2">
            de tus archivos ya llegó · {formatNumber(r.received_files)} de{" "}
            {formatNumber(r.expected_files)}
            {r.missing_files > 0 && ` · faltan ${formatNumber(r.missing_files)}`}
          </p>
          <div className="mt-[16px]">
            <StackedBar parts={legend} height={10} />
          </div>
          <div className="mt-[8px] flex flex-wrap gap-x-[16px] gap-y-1 text-[15px] text-cp-ink-2">
            {legend.map((l) => (
              <span key={l.key} className="flex items-center gap-[6px]">
                <Dot color={l.color} />
                {l.label}
                <span className="text-cp-ink-4">{formatNumber(l.value)}</span>
              </span>
            ))}
          </div>

          <div className="mt-[16px] grid grid-cols-2 gap-[10px]">
            {[
              {
                tab: "critical" as DetailTab,
                label: "Retraso de más de 5 días",
                color: "#e0007a",
                value: r.late_over_5_days
              },
              {
                tab: "late" as DetailTab,
                label: "Retraso de 1 a 5 días",
                color: "#ff6a13",
                value: r.late_1_to_5_days
              }
            ].map((k) => (
              <button
                key={k.tab}
                type="button"
                onClick={() => onOpenDetail(k.tab)}
                className="min-w-0 rounded-[12px] bg-cp-bg px-[14px] py-[12px] text-left transition-colors hover:bg-cp-muted"
              >
                <span className="flex items-center gap-[6px] truncate text-[14px] text-cp-ink-2">
                  <Dot color={k.color} />
                  {k.label}
                </span>
                <span className="mt-[4px] flex items-baseline gap-[6px]">
                  <span
                    className="text-[29px] font-semibold"
                    style={{ color: k.tab === "critical" && k.value.clients ? k.color : undefined }}
                  >
                    {formatNumber(k.value.clients)}
                  </span>
                  <span className="text-[14px] text-cp-ink-3">
                    {plural(k.value.clients, "cliente", "clientes")}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {r.by_periodicity.length > 0 && (
            <div
              className="mt-[16px] grid gap-[12px]"
              style={{ gridTemplateColumns: `repeat(${r.by_periodicity.length}, minmax(0, 1fr))` }}
            >
              {r.by_periodicity.map((p) => (
                <div key={p.periodicity} className="min-w-0">
                  <div className="text-[14px] text-cp-ink-3">
                    {PERIODICITY_LABEL[p.periodicity]}
                  </div>
                  <div className="mt-[2px] flex items-baseline gap-[4px] truncate">
                    <span className="text-[20px] font-semibold text-cp-ink">
                      {formatNumber(p.received_files)}/{formatNumber(p.expected_files)}
                    </span>
                    <span className="text-[13px] text-cp-ink-3">archivos</span>
                  </div>
                  <div className="mt-[6px]">
                    <StackedBar
                      height={5}
                      parts={[
                        { value: p.received_files, color: STATE_COLORS.received },
                        { value: p.novelty_files, color: STATE_COLORS.novelty },
                        { value: p.pending_files, color: STATE_COLORS.pending }
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => onOpenDetail("all")}
            className="mt-[14px] self-start text-[14px] text-cp-blue hover:underline"
          >
            Ver detalle por cliente
          </button>
        </>
      )}
    </Card>
  );
}

export function QualityCard({ data }: { data: IMonitoringSummary }) {
  const q = data.quality;
  return (
    <Card
      title="Calidad de los datos"
      meta={
        q.unhomologated_units > 0
          ? `${formatNumber(q.unhomologated_units)} und. sin homologar`
          : undefined
      }
    >
      {q.units_total === 0 ? (
        <EmptyState text="Aún no hay unidades de sell out en este periodo." />
      ) : (
        <>
          <div className="flex items-baseline gap-[10px]">
            <span className="text-[38px] font-semibold leading-none text-cp-ink">
              {formatPct(q.homologated_pct)}
            </span>
            <span className="text-[15px] text-cp-ink-2">de las unidades homologadas</span>
          </div>
          <div className="mt-[12px]">
            <StackedBar
              height={8}
              parts={[
                { value: q.units_total - q.unhomologated_units, color: STATE_COLORS.received },
                { value: q.unhomologated_units, color: STATE_COLORS.pending }
              ]}
            />
          </div>
          {q.top_impact.length > 0 && (
            <table className="mt-[16px] w-full table-fixed text-[16px]">
              <thead>
                <tr className="border-b border-cp-line text-left text-[15px] font-semibold text-cp-ink">
                  <th className="pb-[8px] font-semibold">Mayor impacto</th>
                  <th className="w-[40%] pb-[8px] text-right font-semibold">Und. por homologar</th>
                </tr>
              </thead>
              <tbody>
                {q.top_impact.map((t) => (
                  <tr key={t.client_id} className="border-b border-cp-line">
                    <td className="truncate py-[8px] text-cp-ink">{t.client_name}</td>
                    <td className="py-[8px] text-right font-semibold text-cp-ink">
                      {formatNumber(t.unhomologated_units)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </Card>
  );
}

export function AnomaliesCard({ data }: { data: IMonitoringSummary }) {
  const a = data.anomalies;
  const [direction, setDirection] = useState<"" | "up" | "down">("");
  const [showAll, setShowAll] = useState(false);
  const filtered = a.items.filter(
    (i) => !direction || (direction === "up" ? i.variation_pct > 0 : i.variation_pct < 0)
  );
  const visible = showAll ? filtered : filtered.slice(0, LIST_LIMIT);

  return (
    <Card title="Variación anómala de unidades">
      <p className="-mt-[8px] text-[14px] text-cp-ink-3">
        ±{a.threshold_pct}% o más vs. promedio de los últimos {a.baseline_months} meses
      </p>
      <div className="mt-[10px] flex flex-wrap gap-[6px]">
        <LegendChip
          color="#1677ff"
          label="Aumento"
          count={a.increases}
          active={direction === "up"}
          dimmed={!!direction}
          onClick={() => setDirection(direction === "up" ? "" : "up")}
        />
        <LegendChip
          color="#e0007a"
          label="Disminución"
          count={a.decreases}
          active={direction === "down"}
          dimmed={!!direction}
          onClick={() => setDirection(direction === "down" ? "" : "down")}
        />
      </div>
      {visible.length === 0 ? (
        <EmptyState text="Sin variaciones anómalas en este periodo." />
      ) : (
        <div className="cp-list-scroll mt-[12px] min-h-0">
          <table className="w-full table-fixed text-[16px]">
            <thead className="sticky top-0 bg-cp-surface">
              <tr className="border-b border-cp-line text-left text-[15px] text-cp-ink">
                <th className="pb-[8px] font-semibold">Cliente</th>
                <th className="w-[19%] pb-[8px] text-right font-semibold">Actual</th>
                <th className="w-[21%] pb-[8px] text-right font-semibold">Promedio</th>
                <th className="w-[16%] pb-[8px] text-right font-semibold">Var.</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr key={i.client_id} className="h-[50px] border-b border-cp-line">
                  <td className="truncate pr-2 text-cp-ink" title={i.client_name}>
                    {i.client_name}
                  </td>
                  <td className="text-right font-semibold text-cp-ink">
                    {formatNumber(i.current_units)}
                  </td>
                  <td className="text-right text-cp-ink-2">{formatNumber(i.average_units)}</td>
                  <td
                    className="text-right font-semibold"
                    style={{ color: i.variation_pct > 0 ? "#1677ff" : "#e0007a" }}
                  >
                    {formatVariation(i.variation_pct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > LIST_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-[10px] text-[14px] text-cp-blue hover:underline"
            >
              {showAll ? "Ver menos" : `+${filtered.length - LIST_LIMIT} variaciones más`}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

export function AlertsCard({ data }: { data: IMonitoringSummary }) {
  const al = data.alerts;
  const [type, setType] = useState<MonitoringAlertType | "">("");
  const [showAll, setShowAll] = useState(false);
  const filtered = useMemo(
    () => al.items.filter((i) => !type || i.type === type),
    [al.items, type]
  );
  const visible = showAll ? filtered : filtered.slice(0, LIST_LIMIT);

  return (
    <Card title={`Alertas en tus clientes · ${formatNumber(al.total)}`}>
      <p className="-mt-[8px] text-[14px] text-cp-ink-3">
        Necesitamos tu ayuda para volver a recibir estos datos
      </p>
      <div className="mt-[10px] flex flex-wrap gap-[6px]">
        {ALERT_ORDER.filter((t) => al.by_type[t] > 0).map((t) => (
          <LegendChip
            key={t}
            color={ALERT_META[t].color}
            label={ALERT_META[t].label}
            count={al.by_type[t]}
            active={type === t}
            dimmed={!!type}
            onClick={() => setType(type === t ? "" : t)}
          />
        ))}
      </div>
      {visible.length === 0 ? (
        <EmptyState text="Todos tus clientes enviaron sus archivos." />
      ) : (
        <div className="cp-list-scroll mt-[12px] min-h-0">
          <table className="w-full table-fixed text-[16px]">
            <thead className="sticky top-0 bg-cp-surface">
              <tr className="border-b border-cp-line text-left text-[15px] text-cp-ink">
                <th className="pb-[8px] font-semibold">Cliente</th>
                <th className="w-[30%] pb-[8px] font-semibold">Alerta</th>
                <th className="w-[17%] pb-[8px] font-semibold">Desde</th>
                <th className="w-[11%] pb-[8px] text-right font-semibold">Arch.</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr
                  key={i.client_id}
                  className="h-[50px] border-b border-cp-line"
                  title={ALERT_META[i.type].hint}
                >
                  <td className="truncate pr-2 text-cp-ink" title={i.client_name}>
                    {i.client_name}
                  </td>
                  <td>
                    <span className="flex items-center gap-[6px] truncate text-[15px] text-cp-ink-2">
                      <Dot color={ALERT_META[i.type].color} />
                      {ALERT_META[i.type].label}
                    </span>
                  </td>
                  <td className="text-[15px] text-cp-ink-2">{formatShortDate(i.since)}</td>
                  <td className="text-right font-semibold text-cp-ink">
                    {formatNumber(i.pending_files)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > LIST_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-[10px] text-[14px] text-cp-blue hover:underline"
            >
              {showAll ? "Ver menos" : `+${filtered.length - LIST_LIMIT} alertas más`}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
