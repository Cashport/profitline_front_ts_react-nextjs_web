"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Empty, Skeleton } from "antd";
import { ChevronRight, Download, Info, Link2, Send, Store, X } from "lucide-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiTab from "@/components/ui/ui-tab";
import { useAppStore } from "@/lib/store/store";
import type { IBlockingAlertInvoice } from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import AccountStatementModal from "../../components/account-statement-modal/account-statement-modal";
import AlertsHeader from "../../components/alerts-header/alerts-header";
import DocumentList from "../../components/document-list/document-list";
import PaymentLinkModal from "../../components/payment-link-modal/payment-link-modal";
import PointsOfSaleCard from "../../components/points-of-sale-card/points-of-sale-card";
import PortfolioCard from "../../components/portfolio-card/portfolio-card";
import SendToClientModal from "../../components/send-to-client-modal/send-to-client-modal";
import {
  BLOCKING_ALERTS_PATH,
  CREDIT_NOTE_COLORS,
  HEADER_BUTTON,
  MOBILE_TABS,
  STATUS_META
} from "../../constants";
import { useBlockingAlertDetail } from "../../hooks/use-blocking-alerts";
import { fmtDay, plural, statusLabel } from "../../utils/blocking-alerts";

type DetailTab =
  | "all"
  | "past_due"
  | "credit_notes"
  | "available_payments"
  | "pending_balances"
  | "paid_invoices";

/** "Todas" y "Vencidas" comparten la selección de facturas. */
type SelectionKey = Exclude<DetailTab, "all" | "past_due"> | "invoices";

/** Barra de selección: "26 facturas seleccionadas". */
const SELECTED_NOUN: Record<SelectionKey, [string, string]> = {
  invoices: ["factura seleccionada", "facturas seleccionadas"],
  credit_notes: ["nota crédito seleccionada", "notas crédito seleccionadas"],
  available_payments: ["pago seleccionado", "pagos seleccionados"],
  pending_balances: ["saldo seleccionado", "saldos seleccionados"],
  paid_invoices: ["pagada seleccionada", "pagadas seleccionadas"]
};

/** Acciones del cliente: botones redondos, solo ícono, junto al nombre (prototipo). */
const ROUND_BUTTON = cn(HEADER_BUTTON, "h-[38px] w-[38px] rounded-full px-0");

const sum = <T extends { amount: number }>(list: T[]) => list.reduce((s, x) => s + x.amount, 0);

/** Punto de una factura por su mora (escala de docs/DESIGN.md §1). */
const invoiceDot = (days: number) =>
  days > 60 ? "rgb(var(--cp-red))" : days > 0 ? "rgb(var(--cp-orange))" : "rgb(var(--cp-lime))";

interface BlockingAlertDetailViewProps {
  clientId: string;
  /** Con ship-to es el detalle de un punto de venta del cliente. */
  shipToCode?: string;
}

/**
 * Detalle de un cliente o punto de venta: estado de bloqueo, cartera por tramos, pago vencido con
 * link de pago, sus puntos de venta y los documentos (facturas, notas crédito, pagos, saldos y
 * pagadas) con selección.
 */
export default function BlockingAlertDetailView({
  clientId,
  shipToCode
}: BlockingAlertDetailViewProps) {
  const { detail, error } = useBlockingAlertDetail(clientId, shipToCode);
  const formatMoney = useAppStore((s) => s.formatMoney);
  const money = (value: number) => formatMoney(value, { hideDecimals: true });
  const [tab, setTab] = useState<DetailTab>("past_due");
  const [picked, setPicked] = useState<Partial<Record<SelectionKey, string[]>>>({});
  const [modal, setModal] = useState<"payment" | "statement" | "send" | null>(null);

  const clientHref = `${BLOCKING_ALERTS_PATH}/${clientId}`;
  const crumbs = [
    { label: "Alertas de bloqueo", href: BLOCKING_ALERTS_PATH },
    ...(shipToCode ? [{ label: detail?.client_name ?? "Cliente", href: clientHref }] : []),
    { label: detail?.name ?? (shipToCode ? `Ship-to ${shipToCode}` : "Cliente") }
  ];

  if (!detail) {
    return (
      <div className="flex flex-col gap-3 pb-6 max-md:px-4">
        <AlertsHeader crumbs={crumbs} flush />
        {error ? (
          <Empty description={error.message} />
        ) : (
          <Skeleton active paragraph={{ rows: 8 }} className="rounded-[14px] bg-cp-surface p-4" />
        )}
      </div>
    );
  }

  const who = shipToCode ? "este punto de venta" : "este cliente";
  const overdue = detail.invoices.filter((i) => i.days_overdue > 0);
  const docs: Record<SelectionKey, { id: string; amount: number }[]> = {
    invoices: detail.invoices,
    credit_notes: detail.credit_notes,
    available_payments: detail.available_payments,
    pending_balances: detail.pending_balances,
    paid_invoices: detail.paid_invoices
  };
  // Por defecto van marcadas las vencidas y todos los demás documentos.
  const selectedIds = (key: SelectionKey) =>
    picked[key] ?? (key === "invoices" ? overdue : docs[key]).map((d) => d.id);
  const selection = (key: SelectionKey) => ({
    selected: selectedIds(key),
    onSelectedChange: (ids: string[]) => setPicked((p) => ({ ...p, [key]: ids }))
  });
  const selectedOf = (key: SelectionKey) =>
    docs[key].filter((d) => selectedIds(key).includes(d.id));

  const barKey: SelectionKey = tab === "all" || tab === "past_due" ? "invoices" : tab;
  const barItems = selectedOf(barKey);
  const selectedInvoices = selectedOf("invoices");

  const invoiceList = (items: IBlockingAlertInvoice[], empty: string) => (
    <DocumentList
      items={items}
      getId={(i) => i.id}
      getAmount={(i) => i.amount}
      describe={(i) => ({
        title: i.number,
        subtitle: [
          i.days_overdue > 0
            ? `Vencida · ${plural(i.days_overdue, "día", "días")}`
            : `Vence el ${fmtDay(i.due_date)}`,
          !shipToCode && i.ship_to_name
        ]
          .filter(Boolean)
          .join(" · "),
        dot: invoiceDot(i.days_overdue)
      })}
      {...selection("invoices")}
      noun={["factura", "facturas"]}
      empty={empty}
    />
  );

  const tabs: { key: DetailTab; label: string; count: number; content: React.ReactNode }[] = [
    {
      key: "all",
      label: "Todas",
      count: detail.invoices.length,
      content: invoiceList(detail.invoices, `No hay facturas pendientes para ${who}.`)
    },
    {
      key: "past_due",
      label: "Vencidas",
      count: overdue.length,
      content: invoiceList(overdue, "Sin facturas vencidas. Puede comprar con normalidad.")
    },
    {
      key: "credit_notes",
      label: "Notas crédito",
      count: detail.credit_notes.length,
      content: (
        <DocumentList
          items={detail.credit_notes}
          getId={(n) => n.id}
          getAmount={(n) => n.amount}
          describe={(n) => ({
            title: n.id,
            subtitle: `${n.type} · ${fmtDay(n.date)}`,
            dot: CREDIT_NOTE_COLORS[n.type] ?? "rgb(var(--cp-ink-4))"
          })}
          {...selection("credit_notes")}
          noun={["nota crédito", "notas crédito"]}
          empty={`No hay notas crédito para ${who}.`}
        />
      )
    },
    {
      key: "available_payments",
      label: "Pagos disponibles",
      count: detail.available_payments.length,
      content: (
        <DocumentList
          items={detail.available_payments}
          getId={(p) => p.id}
          getAmount={(p) => p.amount}
          describe={(p) => ({
            title: fmtDay(p.date),
            subtitle: `Pago ${p.id} · disponible`,
            dot: "rgb(var(--cp-lime))"
          })}
          {...selection("available_payments")}
          noun={["pago disponible", "pagos disponibles"]}
          empty={`No hay pagos disponibles para ${who}.`}
        />
      )
    },
    {
      key: "pending_balances",
      label: "Saldos",
      count: detail.pending_balances.length,
      content: (
        <DocumentList
          items={detail.pending_balances}
          getId={(b) => b.id}
          getAmount={(b) => b.amount}
          describe={(b) => ({
            title: `Saldo ${b.id}`,
            subtitle: `${b.status} · ${fmtDay(b.date)}`,
            dot: "rgb(var(--cp-ink-4))"
          })}
          {...selection("pending_balances")}
          noun={["saldo pendiente", "saldos pendientes"]}
          empty={`No hay saldos pendientes para ${who}.`}
        />
      )
    },
    {
      key: "paid_invoices",
      label: "Pagadas",
      count: detail.paid_invoices.length,
      content: (
        <DocumentList
          items={detail.paid_invoices}
          getId={(i) => i.id}
          getAmount={(i) => i.amount}
          describe={(i) => ({
            title: i.number,
            subtitle: `Pagada el ${fmtDay(i.paid_at)} · depuración SAP`,
            dot: "rgb(var(--cp-blue))"
          })}
          {...selection("paid_invoices")}
          noun={["factura", "facturas"]}
          empty="No hay facturas pagadas pendientes de depuración."
          notice={
            <Alert
              type="info"
              showIcon
              icon={<Info className="h-4 w-4" />}
              message="En depuración SAP · no suman a la cartera ni se cobran"
              className="my-2 text-[12px]"
            />
          }
        />
      )
    }
  ];

  const meta = STATUS_META[detail.status];
  const isOk = detail.status === "up_to_date";
  const showPay = !isOk && tab !== "paid_invoices";

  return (
    <div className="flex flex-col gap-3 pb-6 max-md:px-4">
      <AlertsHeader crumbs={crumbs} flush />

      {/* Como el prototipo: estado, nombre y acciones (solo íconos) bajo las migas. */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-11 md:w-11"
          style={{ background: meta.tint, color: meta.color }}
        >
          <meta.Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[17px] font-bold leading-tight text-cp-ink md:text-[20px]">
            {detail.name}
          </p>
          <p
            className={cn(
              "m-0 mt-0.5 truncate text-[12.5px] font-medium md:text-[13px]",
              isOk && "text-cp-ink-3"
            )}
            style={isOk ? undefined : { color: meta.color }}
          >
            {statusLabel(detail)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Estado de cuenta"
          title="Estado de cuenta"
          className={ROUND_BUTTON}
          onClick={() => setModal("statement")}
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Enviar al cliente"
          title="Enviar al cliente"
          className={ROUND_BUTTON}
          onClick={() => setModal("send")}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {shipToCode && (
        <Link
          href={clientHref}
          className="flex items-center gap-2 rounded-[12px] bg-cp-surface px-4 py-2.5 text-[13px] text-cp-ink-3 hover:text-cp-ink"
        >
          <Store className="h-4 w-4 shrink-0" />
          <span className="shrink-0 font-semibold text-cp-ink">Ship-to {detail.ship_to_code}</span>
          <span className="min-w-0 flex-1 truncate">
            de <b className="font-semibold text-cp-ink">{detail.client_name}</b>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 font-semibold text-cp-blue">
            Ver cliente
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <PortfolioCard
            label="Cartera"
            aging={detail}
            stacked
            extras={[
              { label: "Saldos pendientes", value: sum(detail.pending_balances) },
              { label: "Notas crédito", value: sum(detail.credit_notes) },
              { label: "Pagos disponibles", value: sum(detail.available_payments) }
            ]}
          />

          {showPay && (
            <section className="flex items-center justify-between gap-3 rounded-[14px] bg-cp-surface px-[18px] py-[14px]">
              <span className="min-w-0">
                <span className="block text-[12px] font-medium text-cp-ink-3">Pago vencido</span>
                <span className="block truncate text-[18px] font-semibold tabular-nums text-cp-ink md:text-[20px]">
                  {money(detail.pastDue)}
                </span>
              </span>
              <PrincipalButton
                icon={<Link2 className="h-4 w-4" />}
                onClick={() => setModal("payment")}
              >
                Link de pago
              </PrincipalButton>
            </section>
          )}

          {!shipToCode && (detail.points_of_sale_count?.total ?? 0) > 1 && (
            <PointsOfSaleCard detail={detail} />
          )}
        </div>

        <section className={cn("min-w-0 rounded-[14px] bg-cp-surface px-4 pb-2", MOBILE_TABS)}>
          <UiTab
            activeKey={tab}
            onChangeTab={(key) => setTab(key as DetailTab)}
            tabs={tabs.map((t) => ({
              key: t.key,
              label: (
                <span className="flex items-center gap-1.5">
                  {t.label}
                  <span className="font-medium opacity-60">{t.count}</span>
                </span>
              ),
              children: t.key === tab ? t.content : null
            }))}
          />
        </section>
      </div>

      {/* Fija abajo mientras haya algo elegido en la pestaña, como en el prototipo. */}
      {barItems.length > 0 && (
        <div className="sticky bottom-2 z-10 flex items-center gap-3 rounded-[14px] border border-cp-line bg-cp-surface px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-cp-ink-3">
              {plural(barItems.length, ...SELECTED_NOUN[barKey])}
            </span>
            <span className="block truncate text-[16px] font-semibold tabular-nums text-cp-ink">
              {money(sum(barItems))}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setPicked((p) => ({ ...p, [barKey]: [] }))}
            className="flex shrink-0 cursor-pointer items-center gap-1 border-0 bg-transparent text-[12px] font-medium text-cp-ink-4 hover:text-cp-ink"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        </div>
      )}

      {modal === "payment" && (
        <PaymentLinkModal
          detail={detail}
          pastDue={{ count: overdue.length, total: Math.max(0, detail.pastDue) }}
          selected={{ count: selectedInvoices.length, total: sum(selectedInvoices) }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "statement" && (
        <AccountStatementModal detail={detail} onClose={() => setModal(null)} />
      )}
      {modal === "send" && <SendToClientModal detail={detail} onClose={() => setModal(null)} />}
    </div>
  );
}
