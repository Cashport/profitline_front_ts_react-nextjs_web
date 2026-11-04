"use client";

import { useEffect, useMemo, useState } from "react";
import { Drawer, Input } from "antd";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { X } from "phosphor-react";

import {
  AGING_BUCKETS,
  type IClosingComment,
  type IClosingPaymentRow,
  type IClosingPortfolioRow
} from "@/types/closings/IClosings";
import { cn } from "@/utils/utils";

import { AGING_COLORS, AGING_LABELS, channelColor, HIGH_OVERDUE, SERIES } from "../../constants";
import { portfolioTotals, sumBy, type ClientRow } from "../../utils/aggregate";
import {
  formatAmount,
  formatDate,
  formatMillions,
  formatPct,
  periodLabel,
  periodShort
} from "../../utils/format";
import { axisProps, ChartTooltipBox } from "../chart-card/chart-theme";
import { Pill } from "../closing-kpis/closing-kpis";

interface Props {
  client: ClientRow | null;
  period: string;
  history: { period: string; portfolio: IClosingPortfolioRow[]; payments: IClosingPaymentRow[] }[];
  comments: IClosingComment[];
  onSaveComment: (nit: string, client: string, text: string) => void;
  onClose: () => void;
}

function Stat({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[13px] text-cp-ink-3">{label}</span>
      <span className="flex items-center gap-2 text-[20px] font-semibold leading-none text-cp-ink">
        {value}
        {extra}
      </span>
    </div>
  );
}

/**
 * Ficha del cliente en el cierre: aging, recaudo, saldos, evolución de los últimos cierres y
 * la bitácora de comentarios mes a mes (lo que se le dijo al comité y por qué).
 */
export default function ClientClosingDrawer({
  client,
  period,
  history,
  comments,
  onSaveComment,
  onClose
}: Props) {
  const nit = client?.nit;
  const current = comments.find((c) => c.nit === nit && c.period === period);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDraft(current?.text ?? "");
    setEditing(!current);
  }, [nit, current]);

  const detail = useMemo(() => {
    if (!nit) return null;
    const own =
      history.find((h) => h.period === period)?.portfolio.filter((r) => r.nit === nit) ?? [];
    const byType = new Map<string, { kind: string; amount: number; documents: number }>();
    own
      .filter((r) => r.kind !== "Factura")
      .forEach((r) => {
        const key = `${r.kind}·${r.balanceType}`;
        const e = byType.get(key) ?? { kind: r.kind, amount: 0, documents: 0 };
        e.amount += r.amount;
        e.documents += r.documents;
        byType.set(key, e);
      });
    const trend = history.map((h) => {
      const t = portfolioTotals(h.portfolio.filter((r) => r.nit === nit));
      return {
        period: h.period,
        label: periodShort(h.period),
        total: t.total,
        overdue: t.overdue,
        overduePct: t.overduePct,
        collected: sumBy(
          h.payments.filter((p) => p.nit === nit),
          (p) => p.amount
        )
      };
    });
    const first = own[0];
    return {
      info: first,
      documents: sumBy(own, (r) => r.documents),
      balances: Array.from(byType.entries())
        .map(([key, v]) => ({ key, name: key.split("·")[1], ...v }))
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
      trend
    };
  }, [nit, history, period]);

  const timeline = useMemo(
    () => comments.filter((c) => c.nit === nit).sort((a, b) => b.period.localeCompare(a.period)),
    [comments, nit]
  );

  return (
    <Drawer
      open={Boolean(client)}
      onClose={onClose}
      width={560}
      closable={false}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      {client && detail && (
        <div className="flex h-full flex-col text-cp-ink">
          <div className="flex items-start gap-3 border-b border-cp-line px-6 py-5">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[18px] font-semibold">{client.client}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[13px] text-cp-ink-3">
                NIT {client.nit} ·
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: channelColor(client.channel) }}
                />
                {client.channel} · {client.salesExecutive}
              </p>
              {detail.info && (
                <p className="mt-0.5 text-[13px] text-cp-ink-3">
                  Cartera: {detail.info.collectionExecutive} · Coordinador:{" "}
                  {detail.info.coordinator} · {detail.info.city}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cp-control-fill flex h-9 w-9 items-center justify-center rounded-lg text-cp-ink"
              aria-label="Cerrar"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="mb-3 text-[13px] font-semibold text-cp-ink-2">
              Cierre de {periodLabel(period).toLowerCase()}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Cartera" value={formatMillions(client.total)} />
              <Stat
                label="Vencida"
                value={formatMillions(client.overdue)}
                extra={
                  <Pill tone={client.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
                    {formatPct(client.overduePct)}
                  </Pill>
                }
              />
              <Stat label="Recaudo del mes" value={formatMillions(client.collected)} />
            </div>
            <p className="mt-1 text-[13px] text-cp-ink-3">
              Cifras en millones · {detail.documents.toLocaleString("es-CO")} documentos
            </p>

            <div className="mt-5 flex h-[10px] gap-[2px] overflow-hidden rounded">
              {AGING_BUCKETS.map((b) =>
                client.buckets[b] > 0 ? (
                  <span
                    key={b}
                    style={{
                      flexGrow: client.buckets[b],
                      flexBasis: 0,
                      background: AGING_COLORS[b]
                    }}
                  />
                ) : null
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2">
              {AGING_BUCKETS.map((b) => (
                <div key={b} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="flex items-center gap-1.5 text-cp-ink-3">
                    <span
                      className="h-2 w-2 rounded-[2px]"
                      style={{ background: AGING_COLORS[b] }}
                    />
                    {AGING_LABELS[b]}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatMillions(client.buckets[b])}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="mb-2 mt-6 text-[15px] font-semibold">Últimos cierres</h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detail.trend} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" {...axisProps} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,.04)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as (typeof detail.trend)[number];
                      return (
                        <ChartTooltipBox
                          title={`Cierre ${periodLabel(row.period).toLowerCase()}`}
                          rows={[
                            { label: "Cartera", value: formatAmount(row.total), strong: true },
                            {
                              label: "Vencido",
                              value: formatAmount(row.overdue),
                              color: SERIES.overdue
                            },
                            { label: "% vencido", value: formatPct(row.overduePct) },
                            {
                              label: "Recaudo",
                              value: formatAmount(row.collected),
                              color: SERIES.collected
                            }
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="overdue" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {detail.trend.map((t) => (
                      <Cell
                        key={t.period}
                        fill={t.period === period ? SERIES.overdue : SERIES.previous}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[13px] text-cp-ink-3">
              {detail.trend.map((t) => (
                <span
                  key={t.period}
                  className={cn(t.period === period && "font-semibold text-cp-ink")}
                >
                  {formatPct(t.overduePct)}
                </span>
              ))}
            </div>

            {detail.balances.length > 0 && (
              <>
                <h3 className="mb-2 mt-6 text-[15px] font-semibold">Saldos y notas abiertas</h3>
                <div className="flex flex-col">
                  {detail.balances.map((b) => (
                    <div
                      key={b.key}
                      className="flex items-center justify-between gap-3 border-b border-[#f2f2f2] py-2 text-[13px]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="rounded-[5px] bg-cp-muted px-1.5 py-px font-medium text-cp-ink-2">
                          {b.kind}
                        </span>
                        <span className="truncate">{b.name}</span>
                      </span>
                      <span className="text-cp-ink-3">{b.documents} doc.</span>
                      <span
                        className={cn(
                          "w-[120px] text-right font-semibold tabular-nums",
                          b.amount < 0 && "text-cp-red"
                        )}
                      >
                        {formatAmount(b.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 className="mb-2 mt-6 text-[15px] font-semibold">Comentarios del cierre</h3>
            {editing ? (
              <div className="flex flex-col gap-2">
                <Input.TextArea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  placeholder="Ej.: quedamos así porque el pago de $120 MM se aplicó el 30 y la compañía no lo alcanzó a compensar; toca refacturar…"
                  className="!rounded-lg !text-[13px]"
                />
                <div className="flex justify-end gap-2">
                  {current && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(current.text);
                        setEditing(false);
                      }}
                      className="h-9 px-3 text-[14px] font-semibold text-cp-ink-2"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!draft.trim()}
                    onClick={() => {
                      onSaveComment(client.nit, client.client, draft.trim());
                      setEditing(false);
                    }}
                    className="h-9 rounded-lg bg-cp-lime px-4 text-[14px] font-semibold text-[#141414] hover:bg-cp-lime-dark disabled:opacity-50"
                  >
                    Guardar comentario
                  </button>
                </div>
              </div>
            ) : null}

            <ol className="mt-3 flex flex-col">
              {timeline.length === 0 && (
                <li className="text-[13px] text-cp-ink-3">
                  Sin comentarios en cierres anteriores.
                </li>
              )}
              {timeline.map((c) => (
                <li key={c.id} className="relative border-l-2 border-cp-line pb-4 pl-4 last:pb-0">
                  <span
                    className={cn(
                      "absolute -left-[6px] top-1 h-[10px] w-[10px] rounded-full border-2 border-cp-surface",
                      c.period === period ? "bg-cp-orange" : "bg-[#c4c4c4]"
                    )}
                  />
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="font-semibold">
                      Cierre {periodLabel(c.period).toLowerCase()}
                    </span>
                    <span className="text-cp-ink-3">
                      · {c.author} · {formatDate(c.createdAt)}
                    </span>
                    {c.period === period && !editing && (
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="ml-auto text-[13px] font-semibold text-cp-blue hover:underline"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-[13px] leading-[1.55] text-cp-ink-2">
                    {c.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Drawer>
  );
}
