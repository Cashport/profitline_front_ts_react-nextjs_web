"use client";

import Link from "next/link";
import { Store, Tag } from "lucide-react";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import { useAppStore } from "@/lib/store/store";
import type {
  IBlockingAlertsClient,
  IBlockingAlertsPointOfSale
} from "@/types/blockingAlerts/IBlockingAlerts";

import { AGING_SEGMENTS, STATUS_META } from "../../constants";
import { plural } from "../../utils/blocking-alerts";

interface AlertCardProps {
  row: IBlockingAlertsClient | IBlockingAlertsPointOfSale;
  href: string;
  /** En el listado general de puntos de venta se nombra el cliente. */
  showClient?: boolean;
}

/** Tarjeta de un cliente o punto de venta: monto, estado, puntos de venta y tramos. */
export default function AlertCard({ row, href, showClient }: AlertCardProps) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const meta = STATUS_META[row.status];
  const isOk = row.status === "up_to_date";
  const store = "code" in row ? row : null;
  const client = "code" in row ? null : row;
  const pos = client?.pointsOfSale;
  const matched = client?.matchedPointOfSale;

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
          {formatMoney(row.amount, { hideDecimals: true })}
        </span>
      </span>
      <span className="flex items-center justify-between gap-2.5 text-[12px]">
        <span
          className="flex min-w-0 items-center gap-1 truncate font-medium text-cp-ink-3"
          style={isOk ? undefined : { color: meta.color }}
        >
          <meta.Icon className="h-3 w-3 shrink-0" strokeWidth={2.6} />
          {row.statusLabel}
        </span>
        <span className="shrink-0 text-[11px] text-cp-ink-4">
          {isOk ? "cartera al día" : "pago vencido"}
        </span>
      </span>

      {(store?.code || matched || (pos && pos.total > 1)) && (
        <span className="mt-1 flex min-w-0 items-center gap-1 truncate text-[11px] text-cp-ink-4">
          {store ? (
            <>
              <Tag className="h-3 w-3 shrink-0" />
              <b className="font-semibold text-cp-ink-3">Ship-to {store.code}</b>
              {showClient && <span>· {store.clientName}</span>}
            </>
          ) : matched ? (
            <>
              <Tag className="h-3 w-3 shrink-0" />
              <b className="font-semibold text-cp-ink-3">
                Coincide · Ship-to {matched.code} · {matched.name}
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
                {pos.to_be_blocked > 0 && (
                  <b className="font-semibold" style={{ color: STATUS_META.to_be_blocked.color }}>
                    · {pos.to_be_blocked} por bloquear
                  </b>
                )}
                {!pos.blocked && !pos.to_be_blocked && <span>· todos al día</span>}
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
