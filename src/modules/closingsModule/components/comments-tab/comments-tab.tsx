"use client";

import { useMemo, useState } from "react";

import type { IClosingComment } from "@/types/closings/IClosings";
import { cn } from "@/utils/utils";

import { channelColor, HIGH_OVERDUE } from "../../constants";
import type { ClientRow } from "../../utils/aggregate";
import {
  formatDate,
  formatMillions,
  formatPct,
  periodLabel,
  periodShort
} from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";
import { Pill } from "../closing-kpis/closing-kpis";

interface Props {
  period: string;
  periods: string[];
  comments: IClosingComment[];
  clients: ClientRow[];
  onOpenClient: (nit: string) => void;
}

const TOP_N = 20;

/**
 * Bitácora de comentarios por cierre: lo que se le explicó al comité de cada cliente.
 * A la derecha, los clientes con más vencido que todavía no tienen comentario en el cierre.
 */
export default function CommentsTab({ period, periods, comments, clients, onOpenClient }: Props) {
  const [scope, setScope] = useState<"period" | "all">("period");

  const byNit = useMemo(() => new Map(clients.map((c) => [c.nit, c])), [clients]);
  const feed = useMemo(
    () =>
      comments
        .filter((c) => scope === "all" || c.period === period)
        .sort(
          (a, b) =>
            b.period.localeCompare(a.period) ||
            (byNit.get(b.nit)?.overdue ?? 0) - (byNit.get(a.nit)?.overdue ?? 0)
        ),
    [comments, scope, period, byNit]
  );

  const commented = useMemo(
    () => new Set(comments.filter((c) => c.period === period).map((c) => c.nit)),
    [comments, period]
  );
  const top = useMemo(
    () => [...clients].sort((a, b) => b.overdue - a.overdue).slice(0, TOP_N),
    [clients]
  );
  const pending = top.filter((c) => !commented.has(c.nit));
  const coverage = top.length ? (top.length - pending.length) / top.length : 0;

  const groups = useMemo(() => {
    const map = new Map<string, IClosingComment[]>();
    feed.forEach((c) => map.set(c.period, [...(map.get(c.period) ?? []), c]));
    return periods.filter((p) => map.has(p)).map((p) => ({ period: p, items: map.get(p)! }));
  }, [feed, periods]);

  return (
    <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <ChartCard
        title="Comentarios del cierre"
        help="Se guardan por cliente y por cierre: así queda la trazabilidad de por qué la cartera quedó como quedó cada mes."
        actions={
          <Segmented
            value={scope}
            onChange={setScope}
            options={[
              { value: "period", label: periodLabel(period) },
              { value: "all", label: "Todos los cierres" }
            ]}
          />
        }
      >
        <div className="max-h-[640px] overflow-y-auto pr-1">
          {groups.length === 0 && (
            <p className="py-10 text-center text-[13px] text-cp-ink-3">
              No hay comentarios para los filtros elegidos.
            </p>
          )}
          {groups.map((g) => (
            <section key={g.period} className="mb-4 last:mb-0">
              {scope === "all" && (
                <p className="mb-2 text-[13px] font-semibold text-cp-ink-2">
                  Cierre {periodLabel(g.period).toLowerCase()} · {g.items.length} comentarios
                </p>
              )}
              <div className="flex flex-col gap-2">
                {g.items.map((c) => {
                  const client = byNit.get(c.nit);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onOpenClient(c.nit)}
                      className="rounded-xl bg-cp-bg px-4 py-3 text-left transition-colors hover:bg-[#efefef]"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[13.5px] font-semibold text-cp-blue">{c.client}</span>
                        {client && (
                          <>
                            <span className="flex items-center gap-1.5 text-[13px] text-cp-ink-3">
                              <span
                                className="h-2 w-2 rounded-[2px]"
                                style={{ background: channelColor(client.channel) }}
                              />
                              {client.channel}
                            </span>
                            <span className="ml-auto flex items-center gap-2 text-[13px] text-cp-ink-3">
                              Vencido {formatMillions(client.overdue)} M
                              <Pill tone={client.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
                                {formatPct(client.overduePct)}
                              </Pill>
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-[1.55] text-cp-ink">{c.text}</p>
                      <p className="mt-1.5 text-[13px] text-cp-ink-3">
                        {c.author} · {formatDate(c.createdAt)}
                        {scope === "period" ? "" : ` · ${periodShort(c.period)}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </ChartCard>

      <ChartCard
        title="Pendientes de comentario"
        help={`De los ${TOP_N} clientes con más saldo vencido en este cierre, los que todavía no tienen comentario. Lo ideal es llegar al comité con todos explicados.`}
      >
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <span className="text-[13px] text-cp-ink-3">Cobertura del top {TOP_N}</span>
            <p className="text-[26px] font-semibold leading-tight text-cp-ink">
              {Math.round(coverage * 100)} %
            </p>
          </div>
          <span className="text-[13px] text-cp-ink-3">
            {top.length - pending.length} de {top.length} comentados
          </span>
        </div>
        <div className="mb-3 h-[5px] overflow-hidden rounded-full bg-cp-muted">
          <div
            className={cn("h-full rounded-full", coverage >= 0.8 ? "bg-cp-lime" : "bg-cp-orange")}
            style={{ width: `${coverage * 100}%` }}
          />
        </div>
        <div className="flex max-h-[520px] flex-col overflow-y-auto">
          {pending.length === 0 && (
            <p className="py-6 text-[13px] text-cp-ink-3">Todo el top tiene comentario.</p>
          )}
          {pending.map((c) => (
            <div
              key={c.nit}
              className="flex items-center gap-3 border-b border-[#f2f2f2] py-2.5 text-[13px]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-cp-ink">{c.client}</span>
                <span className="block truncate text-cp-ink-3">
                  Vencido {formatMillions(c.overdue)} M · {formatPct(c.overduePct)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onOpenClient(c.nit)}
                className="cp-control-fill h-9 shrink-0 rounded-lg px-3 text-[13px] font-semibold text-cp-ink hover:bg-[#ececec]"
              >
                Comentar
              </button>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
