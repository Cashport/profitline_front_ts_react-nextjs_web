"use client";

import Link from "next/link";
import { Store, Tag } from "lucide-react";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertRow } from "@/types/blockingAlerts/IBlockingAlerts";

import { AGING_SEGMENTS, STATUS_META } from "../../constants";
import { plural, statusLabel } from "../../utils/blocking-alerts";

interface AlertCardProps {
  row: IBlockingAlertRow;
  href: string;
  /** Punto de venta del cliente que coincide con la búsqueda. */
  matchedStore?: IBlockingAlertRow;
  /** En el listado general de puntos de venta se nombra el cliente. */
  showClient?: boolean;
}

/** Tarjeta de un cliente o punto de venta: monto, estado, puntos de venta y tramos. */
export default function AlertCard({ row, href, matchedStore, showClient }: AlertCardProps) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const meta = STATUS_META[row.status];
  const isOk = row.status === "ok";
  const pos = row.points_of_sale_count;

  return (
    <Link
      href={href}
      className="box-border flex min-w-0 flex-col gap-1 rounded-[12px] border border-cp-line bg-cp-surface px-3.5 py-3 text-cp-ink transition-colors hover:border-cp-ink-4"
    >
      <span className="flex items-start justify-between gap-2.5">
        <span className="min-w-0 truncate text-[14px] font-semibold">{row.name}</span>
        <span
          className="shrink-0 text-[14px] font-semibold tabular-nums"
          style={isOk ? undefined : { color: meta.color }}
        >
          {formatMoney(isOk ? row.portfolio : row.past_due, { hideDecimals: true })}
        </span>
      </span>
      <span className="flex items-center justify-between gap-2.5 text-[12px]">
        <span
          className="flex min-w-0 items-center gap-1 truncate font-medium text-cp-ink-3"
          style={isOk ? undefined : { color: meta.color }}
        >
          <meta.Icon className="h-3 w-3 shrink-0" strokeWidth={2.6} />
          {statusLabel(row)}
        </span>
        <span className="shrink-0 text-[11px] text-cp-ink-4">
          {isOk ? "cartera al día" : "pago vencido"}
        </span>
      </span>

      {(row.ship_to_code || matchedStore || (pos && pos.total > 1)) && (
        <span className="mt-1 flex min-w-0 items-center gap-1 truncate text-[11px] text-cp-ink-4">
          {row.ship_to_code ? (
            <>
              <Tag className="h-3 w-3 shrink-0" />
              <b className="font-semibold text-cp-ink-3">Ship-to {row.ship_to_code}</b>
              {showClient && row.client_name !== row.name && <span>· {row.client_name}</span>}
            </>
          ) : matchedStore ? (
            <>
              <Tag className="h-3 w-3 shrink-0" />
              <b className="font-semibold text-cp-ink-3">
                Coincide · Ship-to {matchedStore.ship_to_code} · {matchedStore.name}
              </b>
            </>
          ) : (
            pos && (
              <>
                <Store className="h-3 w-3 shrink-0" />
                {plural(pos.total, "punto de venta", "puntos de venta")}
                {pos.blocked > 0 && (
                  <b className="font-semibold" style={{ color: STATUS_META.blocked.color }}>
                    · {plural(pos.blocked, "bloqueado", "bloqueados")}
                  </b>
                )}
                {pos.warning > 0 && (
                  <b className="font-semibold" style={{ color: STATUS_META.warning.color }}>
                    · {pos.warning} por bloquear
                  </b>
                )}
                {!pos.blocked && !pos.warning && <span>· todos al día</span>}
              </>
            )
          )}
        </span>
      )}

      <AgingBar
        height={3}
        className="mt-2"
        segments={AGING_SEGMENTS.map((s) => ({ key: s.key, value: row[s.key], color: s.color }))}
      />
    </Link>
  );
}
