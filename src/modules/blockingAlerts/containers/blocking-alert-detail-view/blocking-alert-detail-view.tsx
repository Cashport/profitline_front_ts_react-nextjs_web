"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Empty, Skeleton } from "antd";
import { ChevronRight, Download, Info, Link2, Send, Store, X } from "lucide-react";
import { useTranslations } from "use-intl";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiTab from "@/components/ui/ui-tab";
import { useAppStore } from "@/lib/store/store";
import type {
  BlockingAlertsDocumentTab,
  IBlockingAlertsBalance,
  IBlockingAlertsCreditNote,
  IBlockingAlertsDocument,
  IBlockingAlertsInvoice,
  IBlockingAlertsPaidInvoice,
  IBlockingAlertsPayment
} from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import AccountStatementModal from "../../components/account-statement-modal/account-statement-modal";
import AlertsHeader from "../../components/alerts-header/alerts-header";
import DocumentList, {
  ALL_SELECTED,
  selectionTotals,
  type DocumentSelection
} from "../../components/document-list/document-list";
import PaymentLinkModal from "../../components/payment-link-modal/payment-link-modal";
import PointsOfSaleCard from "../../components/points-of-sale-card/points-of-sale-card";
import PortfolioCard from "../../components/portfolio-card/portfolio-card";
import SendToClientModal from "../../components/send-to-client-modal/send-to-client-modal";
import {
  BLOCKING_ALERTS_PATH,
  CREDIT_NOTE_COLORS,
  HEADER_BUTTON,
  MOBILE_TABS,
  PAGE_SIZE,
  SEND_ACTIONS_PROJECT_ID,
  STATUS_META
} from "../../constants";
import { useBlockingAlertDetail, useBlockingAlertDocuments } from "../../hooks/use-blocking-alerts";
import { fmtDay } from "../../utils/blocking-alerts";

type DetailTab = BlockingAlertsDocumentTab;

/**
 * Pestañas en el orden del prototipo. Su nombre, sustantivo, selección y mensaje sin documentos
 * están en blockingAlerts.detail.{tabs,count,selected,empty}.<pestaña>.
 */
const TABS: DetailTab[] = [
  "all",
  "past_due",
  "credit_notes",
  "available_payments",
  "balances",
  "paid_invoices"
];

/** Acciones del cliente: botones redondos, solo ícono, junto al nombre (prototipo). */
const ROUND_BUTTON = cn(HEADER_BUTTON, "h-[38px] w-[38px] rounded-full px-0");

/** Punto de una factura por su mora (escala de docs/DESIGN.md §1). */
const invoiceDot = (days: number) =>
  days > 60 ? "rgb(var(--cp-red))" : days > 0 ? "rgb(var(--cp-orange))" : "rgb(var(--cp-lime))";

interface BlockingAlertDetailViewProps {
  /** UUID del cliente. */
  clientId: string;
  /** Con ship-to es el detalle de un punto de venta del cliente. */
  shipToCode?: string;
}

/**
 * Detalle de un cliente o punto de venta: estado de bloqueo, cartera por tramos, pago vencido con
 * link de pago, sus puntos de venta y los documentos por pestaña (paginados por el API) con
 * selección y suma.
 */
export default function BlockingAlertDetailView({
  clientId,
  shipToCode
}: BlockingAlertDetailViewProps) {
  const { detail, error } = useBlockingAlertDetail(clientId, shipToCode);
  const t = useTranslations("blockingAlerts.detail");
  const tRoot = useTranslations("blockingAlerts");
  const tCommon = useTranslations("common");
  const formatMoney = useAppStore((s) => s.formatMoney);
  const sendActions = useAppStore((s) => s.selectedProject?.ID === SEND_ACTIONS_PROJECT_ID);
  const money = (value: number) => formatMoney(value, { hideDecimals: true });
  const [tab, setTab] = useState<DetailTab>("past_due");
  const [pages, setPages] = useState<Partial<Record<DetailTab, number>>>({});
  // Por defecto todo va seleccionado, como en el prototipo; cada pestaña tiene su selección.
  const [picked, setPicked] = useState<Partial<Record<DetailTab, DocumentSelection>>>({});
  const [modal, setModal] = useState<"payment" | "statement" | "send" | null>(null);
  const page = pages[tab] ?? 1;
  const { documents } = useBlockingAlertDocuments(clientId, shipToCode, tab, page);

  const clientHref = `${BLOCKING_ALERTS_PATH}/${clientId}`;
  const crumbs = [
    { label: tRoot("title"), href: BLOCKING_ALERTS_PATH },
    ...(shipToCode ? [{ label: detail?.client.name ?? t("customer"), href: clientHref }] : []),
    {
      label:
        detail?.name ?? (shipToCode ? tRoot("card.shipTo", { code: shipToCode }) : t("customer"))
    }
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

  const target = shipToCode ? "pos" : "customer";
  const selectionOf = (key: DetailTab) => picked[key] ?? ALL_SELECTED;
  const totalsOf = (key: DetailTab) => selectionTotals(selectionOf(key), detail.tabs[key]);
  const bar = totalsOf(tab);
  const tabKey = TABS.find((key) => key === tab) ?? TABS[1];

  const describe = (d: IBlockingAlertsDocument) => {
    switch (tab) {
      case "credit_notes": {
        const n = d as IBlockingAlertsCreditNote;
        return {
          title: n.number ?? n.id,
          subtitle: [n.type ?? t("creditNote"), n.date && fmtDay(n.date)]
            .filter(Boolean)
            .join(" · "),
          dot: (n.type && CREDIT_NOTE_COLORS[n.type]) || "rgb(var(--cp-ink-4))"
        };
      }
      case "available_payments": {
        const p = d as IBlockingAlertsPayment;
        return {
          title: p.date ? fmtDay(p.date) : t("paymentTitle", { id: p.number ?? p.id }),
          subtitle: t("paymentSubtitle", { id: p.number ?? p.id }),
          dot: "rgb(var(--cp-lime))"
        };
      }
      case "balances": {
        const b = d as IBlockingAlertsBalance;
        return {
          title: t("balanceTitle", { id: b.number ?? b.id }),
          subtitle: [b.status ?? t("balance"), b.date && fmtDay(b.date)]
            .filter(Boolean)
            .join(" · "),
          dot: "rgb(var(--cp-ink-4))"
        };
      }
      case "paid_invoices": {
        const i = d as IBlockingAlertsPaidInvoice;
        return {
          title: i.number ?? i.id,
          subtitle: i.paidAt
            ? t("paidSubtitle", { date: fmtDay(i.paidAt) })
            : t("paidSubtitleNoDate"),
          dot: "rgb(var(--cp-blue))"
        };
      }
      default: {
        const i = d as IBlockingAlertsInvoice;
        return {
          title: i.number ?? i.id,
          subtitle: [
            i.daysOverdue > 0
              ? t("overdueBy", { days: i.daysOverdue })
              : i.dueDate
                ? t("dueOn", { date: fmtDay(i.dueDate) })
                : t("noDueDate"),
            i.pointOfSale?.name
          ]
            .filter(Boolean)
            .join(" · "),
          dot: invoiceDot(i.daysOverdue)
        };
      }
    }
  };

  const documentList = (
    <DocumentList<IBlockingAlertsDocument>
      items={documents?.tab === tab ? documents.rows : undefined}
      summary={detail.tabs[tab]}
      getId={(d) => d.id}
      getAmount={(d) => d.amount}
      describe={describe}
      selection={selectionOf(tab)}
      onSelectionChange={(selection) => setPicked((p) => ({ ...p, [tab]: selection }))}
      formatCount={(count) => t(`count.${tabKey}`, { count })}
      empty={t(`empty.${tabKey}`, { target })}
      page={page}
      pageSize={PAGE_SIZE}
      onPageChange={(next) => setPages((p) => ({ ...p, [tab]: next }))}
      notice={
        tab === "paid_invoices" && (
          <Alert
            type="info"
            showIcon
            icon={<Info className="h-4 w-4" />}
            message={t("paidNotice")}
            className="my-2 text-[12px]"
          />
        )
      }
    />
  );

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
            className={cn("m-0 mt-0.5 truncate text-[13px] font-medium", isOk && "text-cp-ink-3")}
            style={isOk ? undefined : { color: meta.color }}
          >
            {detail.statusLabel}
          </p>
        </div>
        <button
          type="button"
          aria-label={t("statement")}
          title={t("statement")}
          className={ROUND_BUTTON}
          onClick={() => setModal("statement")}
        >
          <Download className="h-4 w-4" />
        </button>
        {sendActions && (
          <button
            type="button"
            aria-label={t("sendToCustomer")}
            title={t("sendToCustomer")}
            className={ROUND_BUTTON}
            onClick={() => setModal("send")}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      {detail.pointOfSale && (
        <Link
          href={clientHref}
          className="flex items-center gap-2 rounded-[12px] bg-cp-surface px-4 py-2.5 text-[13px] text-cp-ink-3 hover:text-cp-ink"
        >
          <Store className="h-4 w-4 shrink-0" />
          <span className="shrink-0 font-semibold text-cp-ink">
            {tRoot("card.shipTo", { code: detail.pointOfSale.code ?? "" })}
          </span>
          <span className="min-w-0 flex-1 truncate">
            {t.rich("ofCustomer", {
              name: detail.client.name,
              b: (chunks) => <b className="font-semibold text-cp-ink">{chunks}</b>
            })}
          </span>
          <span className="flex shrink-0 items-center gap-0.5 font-semibold text-cp-blue">
            {t("viewCustomer")}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          <PortfolioCard
            label={t("receivables")}
            aging={detail}
            stacked
            extras={[
              { label: t("extras.pendingBalances"), value: detail.tabs.balances.total },
              { label: t("extras.creditNotes"), value: detail.tabs.credit_notes.total },
              {
                label: t("extras.availablePayments"),
                value: detail.tabs.available_payments.total
              }
            ]}
          />

          {showPay && (
            <section className="flex items-center justify-between gap-3 rounded-[14px] bg-cp-surface px-[18px] py-[14px]">
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-cp-ink-3">{t("pastDue")}</span>
                <span className="block truncate text-[18px] font-semibold tabular-nums text-cp-ink md:text-[20px]">
                  {money(detail.pastDue)}
                </span>
              </span>
              {sendActions && (
                <PrincipalButton
                  icon={<Link2 className="h-4 w-4" />}
                  onClick={() => setModal("payment")}
                >
                  {t("paymentLink")}
                </PrincipalButton>
              )}
            </section>
          )}

          {(detail.pointsOfSale?.total ?? 0) > 1 && <PointsOfSaleCard detail={detail} />}
        </div>

        <section className={cn("min-w-0 rounded-[14px] bg-cp-surface px-4 pb-2", MOBILE_TABS)}>
          <UiTab
            activeKey={tab}
            onChangeTab={(key) => setTab(key as DetailTab)}
            tabs={TABS.map((key) => ({
              key,
              label: (
                <span className="flex items-center gap-1.5">
                  {t(`tabs.${key}`)}
                  <span className="font-medium opacity-60">{detail.tabs[key].count}</span>
                </span>
              ),
              children: key === tab ? documentList : null
            }))}
          />
        </section>
      </div>

      {/* Fija abajo mientras haya algo elegido en la pestaña, como en el prototipo. */}
      {bar.count > 0 && (
        <div className="sticky bottom-2 z-10 flex items-center gap-3 rounded-[14px] border border-cp-line bg-cp-surface px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-cp-ink-3">
              {t(`selected.${tabKey}`, { count: bar.count })}
            </span>
            <span className="block truncate text-[16px] font-semibold tabular-nums text-cp-ink">
              {money(bar.total)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setPicked((p) => ({ ...p, [tab]: { all: false, items: {} } }))}
            className="flex shrink-0 cursor-pointer items-center gap-1 border-0 bg-transparent text-[12px] font-medium text-cp-ink-4 hover:text-cp-ink"
          >
            <X className="h-3 w-3" />
            {tCommon("actions.clear")}
          </button>
        </div>
      )}

      {modal === "payment" && (
        <PaymentLinkModal
          detail={detail}
          pastDue={{ count: detail.tabs.past_due.count, total: Math.max(0, detail.pastDue) }}
          selected={totalsOf("past_due")}
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
