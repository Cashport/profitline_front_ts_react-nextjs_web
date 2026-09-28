"use client";

import { cn } from "@/utils/utils";
import { EST_META, ORDEN_EST } from "../../constants";
import { toEstadoKey } from "../../utils/api-adapter";
import { cli, doc, fac, fmtM, fmtPct } from "../../utils/format";
import SegBar from "../shared/seg-bar";
import StatusChip from "../shared/status-chip";
import type { EstadoKey, WalletSegments } from "../../types";
import { AGING_BUCKETS } from "@/types/portfolios/IWalletMatrix";
import type {
  IMatrixSummary,
  IMatrixSummaryTotal,
  IMatrixTotals
} from "@/types/portfolios/IWalletMatrix";

interface WalletStatCardsProps {
  summary: IMatrixSummary;
  totals: IMatrixTotals;
}

const Swatch = ({ className }: { className: string }) => (
  <i
    className={cn("inline-block h-2.5 w-2.5 rounded-[2px]", className)}
    style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
  />
);

/** SegBar pinta por estado de la pantalla, no por statusKey: SALDO y SALDO_FACTURA
 *  caen juntos en "saldo" y los segmentos siguen el orden de la leyenda. */
const compositionSegments = (total: IMatrixSummaryTotal) => {
  const segments = { total: total.amount } as Pick<WalletSegments, EstadoKey | "total">;
  ORDEN_EST.forEach((e) => (segments[e] = 0));
  total.composition.forEach((c) => (segments[toEstadoKey(c.statusKey)] += c.total));
  return segments;
};

/** Las seis tarjetas de resumen sobre la matriz. */
export default function WalletStatCards({ summary, totals }: WalletStatCardsProps) {
  const { total, overdue, openNovelty, unreconciled, openBalances, pendingCompensation } = summary;
  // Tramos 61–90, 91–120 y +120.
  const overdueOver60 = AGING_BUCKETS.slice(3).reduce(
    (acc, bucket) => acc + (totals.byAging?.[bucket]?.total ?? 0),
    0
  );

  const cards: {
    key: string;
    label: React.ReactNode;
    value: string;
    foot: string;
    bar?: React.ReactNode;
    badge?: string;
  }[] = [
    {
      key: "total",
      label: "Cartera total",
      value: fmtM(total.amount),
      foot: `${fac(total.invoices)} · ${cli(total.clients)}`,
      bar: <SegBar segments={compositionSegments(total)} className="mt-2.5 h-1.5" />
    },
    {
      key: "vencida",
      label: (
        <>
          <Swatch className="bg-rose-400" />
          Cartera vencida
        </>
      ),
      value: fmtM(overdue.amount),
      badge: fmtPct(overdue.percentage),
      foot: `${fac(overdue.count)} · +60 días ${fmtM(overdueOver60)}`
    },
    {
      key: "novedad",
      label: (
        <>
          <Swatch className={EST_META.novedad.bg} />
          Con novedad abierta
        </>
      ),
      value: fmtM(openNovelty.amount),
      foot: `${fmtPct(openNovelty.percentage)} del saldo · en gestión`
    },
    {
      key: "sin-conciliar",
      label: (
        <>
          <Swatch className={EST_META.sin_conciliar.bg} />
          Sin conciliar
        </>
      ),
      value: fmtM(unreconciled.amount),
      foot: `${fmtPct(unreconciled.percentage)} del saldo · nadie lo ha tocado`
    },
    {
      key: "saldos-abiertos",
      label: (
        <>
          <Swatch className={EST_META.saldo.bg} />
          Saldos abiertos
        </>
      ),
      value: fmtM(openBalances.amount),
      foot: `${fmtPct(openBalances.percentage)} · ${doc(openBalances.count)} sin aplicar`
    },
    {
      key: "pendiente-compensacion",
      label: (
        <>
          <Swatch className={EST_META.pagada.bg} />
          Pendiente compensación
        </>
      ),
      value: fmtM(pendingCompensation.amount),
      foot: `${fmtPct(pendingCompensation.percentage)} · pagos sin compensar`
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {cards.map((c) => (
        <div key={c.key} className="flex flex-col rounded-xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.03em] text-muted-foreground">
            {c.label}
            {/* El margen negativo anula el padding del chip: la fila no crece y el
                valor queda alineado con el de las demás tarjetas. */}
            {c.badge && (
              <StatusChip sev="crit" className="-my-0.5 ml-auto rounded tabular-nums">
                {c.badge}
              </StatusChip>
            )}
          </div>
          <div className="mt-1.5 text-[21px] font-medium leading-none tracking-tight tabular-nums text-foreground">
            {c.value}
          </div>
          {c.bar}
          <div className="mt-auto pt-2 text-[11.5px] text-muted-foreground">{c.foot}</div>
        </div>
      ))}
    </div>
  );
}
