"use client";

import type { ClientAgreementStatus, IClientsHomeRow } from "@/types/clients/IClientsHome";
import { useClientAgreements } from "../../../hooks/clients-home/use-clients-home";
import { forecastStyle } from "../../../constants/clients-home";
import { fmt, fmtIsoDate, pctInt } from "../../../utils/clients-home-format";

/** Ancho y alto aproximado, para ubicarlo arriba o abajo de la celda. */
export const COLLECTION_TIP_SIZE = { width: 300, height: 360 };

const STATUS: Record<ClientAgreementStatus, { label: string; dot: string; color: string }> = {
  EXPIRED: { label: "Vencido", dot: "#e5262b", color: "#ff6b6b" },
  DUE_SOON: { label: "Próximo a vencer", dot: "#ff6a13", color: "#ff9a3c" },
  ACTIVE: { label: "Vigente", dot: "#2b4a5f", color: "#bdbdbd" },
  FULFILLED: { label: "Cumplido", dot: "#9bb514", color: "#cbe71e" },
  PARTIALLY_FULFILLED: { label: "Cumplido parcial", dot: "#f5c542", color: "#f5c542" }
};

const statusText = (status: ClientAgreementStatus, days: number | null) =>
  status === "EXPIRED" && days
    ? `Vencido · ${days} ${days === 1 ? "día" : "días"}`
    : STATUS[status].label;

/**
 * Tooltip "Recaudo del mes": recaudado, acuerdos vigentes e incumplidos y
 * forecast (de la fila), más los acuerdos de pago del cliente, que se piden
 * al abrirlo.
 */
export default function CollectionTooltip({ row }: { row: IClientsHomeRow }) {
  const c = row.collection;
  const { agreements, isLoading, error } = useClientAgreements(row.clientUuid, true);
  const ofGoal = (v: number) => (c.goal ? (v / c.goal) * 100 : null);
  const fc = forecastStyle(c.forecastPct);
  const compliance = agreements?.compliance.pct ?? c.compliancePct;
  const label = "flex min-w-0 flex-1 items-center gap-[7px] whitespace-nowrap text-[#bdbdbd]";
  const pctCls = "whitespace-nowrap text-[10.5px] tabular-nums text-[#8a8a8a]";
  const amtCls = "min-w-[78px] whitespace-nowrap text-right font-semibold tabular-nums";

  return (
    <div className="box-border flex w-[300px] cursor-default flex-col gap-3 rounded-xl bg-[#141414] p-3.5 text-xs text-white shadow-[0_12px_32px_rgba(0,0,0,.22)]">
      <div className="flex items-center justify-between gap-2">
        <span className="whitespace-nowrap text-[12.5px] font-semibold">Recaudo del mes</span>
        <span className="whitespace-nowrap text-[11px] text-[#8a8a8a]">
          Meta <b className="font-semibold text-white">{c.goal === null ? "—" : fmt(c.goal)}</b>
        </span>
      </div>

      <div className="flex flex-col gap-[7px]">
        <div className="flex items-baseline gap-2">
          <span className={label}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#cbe71e]" />
            Recaudado
          </span>
          <span className={pctCls}>{pctInt(c.collectedPct)}</span>
          <span className={`${amtCls} text-[15px]`}>{fmt(c.collected)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={label}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[#2b4a5f] shadow-[0_0_0_1px_#4a6a80]" />
            Acuerdos vigentes
          </span>
          <span className={pctCls}>+{pctInt(ofGoal(c.agreementsActive))}</span>
          <span className={`${amtCls} text-[12.5px]`}>{fmt(c.agreementsActive)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={label}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5262b]" />
            Acuerdos incumplidos
          </span>
          <span className="whitespace-nowrap text-[10.5px] font-semibold tabular-nums text-[#ff6b6b]">
            {c.agreementsBroken ? pctInt(ofGoal(c.agreementsBroken)) : "—"}
          </span>
          <span className={`${amtCls} text-[12.5px]`}>{fmt(c.agreementsBroken)}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-[7px] whitespace-nowrap text-[12.5px] font-semibold text-white">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: fc.dot }} />
            Forecast
          </span>
          <span className={pctCls}>{pctInt(c.forecastPct)}</span>
          <span className={`${amtCls} text-[13px]`}>{fmt(c.forecast)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-[#2e2e2e] pt-2.5">
        <span className="whitespace-nowrap text-[12.5px] font-semibold text-white">
          Acuerdos de pago
        </span>
        {isLoading && <span className="text-[11.5px] text-[#8a8a8a]">Cargando…</span>}
        {error && (
          <span className="text-[11.5px] text-[#8a8a8a]">No se pudieron cargar los acuerdos.</span>
        )}
        {agreements && agreements.agreements.length === 0 && (
          <span className="text-[11.5px] text-[#8a8a8a]">Sin acuerdos este mes.</span>
        )}
        {agreements?.agreements.map((a) => (
          <div key={a.id} className="flex items-center gap-2 text-[11.5px] tabular-nums">
            <span
              className="h-[5px] w-[5px] shrink-0 rounded-full"
              style={{ background: STATUS[a.status].dot }}
            />
            <span className="whitespace-nowrap text-[#d6d6d6]">{fmtIsoDate(a.paymentDate)}</span>
            <span className="flex-1 whitespace-nowrap" style={{ color: STATUS[a.status].color }}>
              {statusText(a.status, a.days)}
            </span>
            <span className="whitespace-nowrap font-semibold">{fmt(a.amount)}</span>
          </div>
        ))}
        {compliance !== null && (
          <span className="mt-0.5 text-[11px] text-[#8a8a8a]">
            Este cliente cumple el <b className="font-semibold text-white">{pctInt(compliance)}</b>{" "}
            de sus acuerdos
          </span>
        )}
      </div>
    </div>
  );
}
