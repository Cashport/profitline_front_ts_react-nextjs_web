"use client";

import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertDetail } from "@/types/blockingAlerts/IBlockingAlerts";

import { BLOCKING_ALERTS_PATH, STATUS_META } from "../../constants";
import { byUrgency, plural, statusLabel } from "../../utils/blocking-alerts";

const TOP = 3;

/** Puntos de venta del cliente por estado, los más urgentes y el acceso a todos. */
export default function PointsOfSaleCard({ detail }: { detail: IBlockingAlertDetail }) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const pos = detail.points_of_sale_count;
  if (!pos) return null;

  const allHref = `${BLOCKING_ALERTS_PATH}/${detail.client_id}/points-of-sale`;
  const atRisk = detail.points_of_sale.filter((s) => s.status !== "up_to_date").sort(byUrgency);
  const legend = [
    { key: "blocked", n: pos.blocked, label: pos.blocked === 1 ? "Bloqueado" : "Bloqueados" },
    { key: "to_be_blocked", n: pos.to_be_blocked, label: "Por bloquear" },
    { key: "up_to_date", n: pos.total - pos.blocked - pos.to_be_blocked, label: "Al día" }
  ] as const;

  return (
    <section className="flex flex-col gap-2.5 rounded-[14px] bg-cp-surface px-[18px] py-[14px]">
      <div className="flex items-center justify-between gap-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <Store className="h-4 w-4 shrink-0 text-cp-ink-3" />
          <span className="truncate text-[15px] font-semibold text-cp-ink">
            {plural(pos.total, "punto de venta", "puntos de venta")}
          </span>
        </span>
        <Link
          href={allHref}
          className="flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-cp-blue hover:underline"
        >
          Ver todos
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <AgingBar
        segments={legend.map((l) => ({ key: l.key, value: l.n, color: STATUS_META[l.key].color }))}
      />
      <div className="grid grid-cols-3 gap-2">
        {legend.map((l) => (
          <span key={l.key} className="flex min-w-0 flex-col">
            <b className="text-[17px] font-semibold leading-tight text-cp-ink">{l.n}</b>
            <span className="flex items-center gap-1 truncate text-[11.5px] text-cp-ink-3">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
                style={{ background: STATUS_META[l.key].color }}
              />
              {l.label}
            </span>
          </span>
        ))}
      </div>

      {atRisk.length === 0 ? (
        <p className="m-0 border-t border-cp-line pt-2.5 text-[12px] text-cp-ink-3">
          Todos sus puntos de venta están al día.
        </p>
      ) : (
        <div className="flex flex-col">
          {atRisk.slice(0, TOP).map((s) => {
            const meta = STATUS_META[s.status];
            return (
              <Link
                key={s.ship_to_code}
                href={`${allHref}/${s.ship_to_code}`}
                className="flex items-center gap-2.5 border-t border-cp-line py-2 text-cp-ink hover:bg-cp-subtle"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">
                    {s.name} <span className="font-normal text-cp-ink-4">· {s.ship_to_code}</span>
                  </span>
                  <span
                    className="flex items-center gap-1 text-[11.5px] font-medium"
                    style={{ color: meta.color }}
                  >
                    <meta.Icon className="h-3 w-3 shrink-0" strokeWidth={2.6} />
                    {statusLabel(s)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className="block text-[13px] font-semibold tabular-nums"
                    style={{ color: meta.color }}
                  >
                    {formatMoney(s.pastDue, { hideDecimals: true })}
                  </span>
                  <span className="block text-[11px] text-cp-ink-4">pago vencido</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href={allHref}
        className="flex h-9 items-center justify-center rounded-[10px] border border-cp-line-2 text-[13px] font-semibold text-cp-ink hover:border-cp-ink"
      >
        Ver los {plural(pos.total, "punto de venta", "puntos de venta")}
      </Link>
    </section>
  );
}
