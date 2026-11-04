"use client";

import { useMemo, useState } from "react";
import { UploadSimple } from "phosphor-react";

import Header from "@/components/organisms/header";
import { FilterModal } from "@/components/ui/filter-modal";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import UiTab from "@/components/ui/ui-tab";
import { cn } from "@/utils/utils";

import AgingByChannel from "../../components/aging-by-channel/aging-by-channel";
import BalancesTab from "../../components/balances-tab/balances-tab";
import ChartCard from "../../components/chart-card/chart-card";
import ClientClosingDrawer from "../../components/client-closing-drawer/client-closing-drawer";
import ClientsTable from "../../components/clients-table/clients-table";
import ClosingKpis, { Delta, Pill } from "../../components/closing-kpis/closing-kpis";
import ClosingPicker from "../../components/closing-picker/closing-picker";
import ClosingsTrend from "../../components/closings-trend/closings-trend";
import CollectionsTab from "../../components/collections-tab/collections-tab";
import CommentsTab from "../../components/comments-tab/comments-tab";
import LoadClosingModal from "../../components/load-closing-modal/load-closing-modal";
import PortfolioByDimension from "../../components/portfolio-by-dimension/portfolio-by-dimension";
import TemplateTab from "../../components/template-tab/template-tab";
import { HIGH_OVERDUE } from "../../constants";
import { useClosings } from "../../hooks/use-closings";
import { clientRows, portfolioTotals, sumBy } from "../../utils/aggregate";
import { formatMillions, formatPct, formatPp, periodLabel } from "../../utils/format";

type TabKey = "resumen" | "clientes" | "recaudo" | "saldos" | "comentarios" | "plantilla";

const direction = (diff: number, epsilon: number) =>
  diff > epsilon ? "up" : diff < -epsilon ? "down" : "flat";

/**
 * Cierres de cartera (/cierres): informes del cierre de cada mes, fijos al corte que reporta
 * la compañía desde su ERP. Maqueta con datos de prueba: no lee nada de Cashport.
 */
export default function ClosingsView() {
  const state = useClosings();
  const {
    closings,
    period,
    setPeriod,
    prevPeriod,
    filters,
    setFilters,
    filterCategories,
    search,
    setSearch,
    portfolio,
    prevPortfolio,
    payments,
    prevPayments,
    history,
    comments,
    saveComment
  } = state;

  const [tab, setTab] = useState<TabKey>("resumen");
  const [openNit, setOpenNit] = useState<string | null>(null);
  const [loadOpen, setLoadOpen] = useState(false);

  const totals = useMemo(() => portfolioTotals(portfolio), [portfolio]);
  const prevTotals = useMemo(() => portfolioTotals(prevPortfolio), [prevPortfolio]);
  const collected = useMemo(() => sumBy(payments, (p) => p.amount), [payments]);
  const prevCollected = useMemo(() => sumBy(prevPayments, (p) => p.amount), [prevPayments]);
  const unapplied = useMemo(
    () =>
      sumBy(
        payments.filter((p) => p.status !== "Compensado"),
        (p) => p.amount
      ),
    [payments]
  );
  const clients = useMemo(
    () => clientRows(portfolio, payments, prevPortfolio),
    [portfolio, payments, prevPortfolio]
  );
  const commented = useMemo(
    () => new Set(comments.filter((c) => c.period === period).map((c) => c.nit)),
    [comments, period]
  );
  const openClient = clients.find((c) => c.nit === openNit) ?? null;

  const prevLabel = prevPeriod ? periodLabel(prevPeriod).split(" ")[0].toLowerCase() : "";
  const totalDiff = prevTotals.total ? (totals.total - prevTotals.total) / prevTotals.total : 0;
  const pctDiff = totals.overduePct - prevTotals.overduePct;
  const collectedDiff = prevCollected ? (collected - prevCollected) / prevCollected : 0;

  /** Clic en una barra o un canal: lo vuelve filtro del tablero (chip en el header). */
  const filterBy = (key: string, value: string) =>
    setFilters({ ...filters, [key]: [{ id: value, name: value }] });

  const topOverdue = useMemo(
    () => [...clients].sort((a, b) => b.overdue - a.overdue).slice(0, 8),
    [clients]
  );

  const summary = (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <ClosingKpis
        items={[
          {
            key: "total",
            label: "Cartera total",
            value: formatMillions(totals.total),
            unit: "M",
            caption: prevPeriod ? (
              <>
                <Delta
                  text={formatPct(Math.abs(totalDiff))}
                  direction={direction(totalDiff, 0.0005)}
                  goodWhenUp
                />{" "}
                vs {prevLabel}
              </>
            ) : (
              `${totals.clients} clientes`
            )
          },
          {
            key: "overdue",
            label: "Cartera vencida",
            value: formatMillions(totals.overdue),
            unit: "M",
            aside: {
              label: "",
              value: "",
              pill: (
                <Pill tone={totals.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
                  {formatPct(totals.overduePct)}
                </Pill>
              )
            },
            bar: { value: totals.overduePct, color: "#ff6a13" },
            caption: prevPeriod ? (
              <>
                <Delta
                  text={formatPp(Math.abs(pctDiff)).replace("+", "")}
                  direction={direction(pctDiff, 0.0005)}
                  goodWhenUp={false}
                />{" "}
                vs {prevLabel} ({formatPct(prevTotals.overduePct)})
              </>
            ) : undefined
          },
          {
            key: "overdue30",
            label: "Vencida > 30 días",
            value: formatMillions(totals.overdue30),
            unit: "M",
            bar: { value: totals.total ? totals.overdue30 / totals.total : 0, color: "#e0007a" },
            caption: `${formatPct(totals.total ? totals.overdue30 / totals.total : 0)} de la cartera`
          },
          {
            key: "collected",
            label: "Recaudo del mes",
            value: formatMillions(collected),
            unit: "M",
            caption: prevPeriod ? (
              <>
                <Delta
                  text={formatPct(Math.abs(collectedDiff))}
                  direction={direction(collectedDiff, 0.0005)}
                  goodWhenUp
                />{" "}
                vs {prevLabel}
              </>
            ) : undefined
          },
          {
            key: "unapplied",
            label: "Recaudo sin aplicar",
            value: formatMillions(unapplied),
            unit: "M",
            caption: "Pendiente de compensar al corte"
          },
          {
            key: "balances",
            label: "Saldos",
            value: "",
            split: [
              { label: "Saldos abiertos", value: formatMillions(totals.openBalances) },
              { label: "Notas en cartera", value: formatMillions(totals.notes) }
            ]
          }
        ]}
      />

      <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <PortfolioByDimension rows={portfolio} onSelect={filterBy} />
        <AgingByChannel rows={portfolio} onSelectChannel={(c) => filterBy("channel", c)} />
      </div>

      <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ClosingsTrend history={history} />
        <ChartCard
          title="Mayor saldo vencido"
          help="Los clientes con más vencido en el cierre. El punto naranja indica que ya tienen comentario para el comité."
          actions={
            <button
              type="button"
              onClick={() => setTab("clientes")}
              className="text-[13px] font-semibold text-cp-blue hover:underline"
            >
              Ver todos
            </button>
          }
        >
          <div className="flex flex-col">
            {topOverdue.map((c, i) => (
              <button
                key={c.nit}
                type="button"
                onClick={() => setOpenNit(c.nit)}
                className="grid grid-cols-[20px_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-[#f2f2f2] py-2 text-left text-[13px] last:border-b-0 hover:bg-[#fafafa]"
              >
                <span className="text-cp-ink-4">{i + 1}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-medium text-cp-blue">{c.client}</span>
                    <span
                      className={cn(
                        "h-[7px] w-[7px] shrink-0 rounded-full",
                        commented.has(c.nit) ? "bg-cp-orange" : "bg-transparent"
                      )}
                    />
                  </span>
                  <span className="block truncate text-cp-ink-3">{c.salesExecutive}</span>
                </span>
                <span className="text-right font-semibold tabular-nums">
                  {formatMillions(c.overdue)} M
                </span>
                <Pill tone={c.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
                  {formatPct(c.overduePct)}
                </Pill>
              </button>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );

  return (
    <div className="cp-page">
      <Header
        title="Cierres de cartera"
        titleExtra={<ClosingPicker closings={closings} value={period} onChange={setPeriod} />}
        actionsExtra={
          <>
            <button
              type="button"
              onClick={() => setLoadOpen(true)}
              className="flex h-[var(--control-h)] shrink-0 items-center gap-2 rounded-lg bg-cp-lime px-4 text-[14px] font-semibold text-[#141414] hover:bg-cp-lime-dark"
            >
              <UploadSimple size={18} weight="bold" /> Cargar cierre
            </button>
            <FilterModal
              inHeader
              categories={filterCategories}
              value={filters}
              onApply={setFilters}
              onValueChange={setFilters}
            />
            <HeaderSearch value={search} onChange={setSearch} placeholder="Buscar cliente, NIT…" />
          </>
        }
      />

      <section className="cp-card px-[18px] pb-[14px]">
        <UiTab
          activeKey={tab}
          onChangeTab={(key) => setTab(key as TabKey)}
          tabs={[
            { key: "resumen", label: "Resumen", children: null },
            { key: "clientes", label: "Clientes", children: null },
            { key: "recaudo", label: "Recaudo", children: null },
            { key: "saldos", label: "Saldos y notas", children: null },
            { key: "comentarios", label: `Comentarios (${commented.size})`, children: null },
            { key: "plantilla", label: "Plantilla", children: null }
          ]}
          tabBarExtraContent={
            <span className="text-[13px] text-cp-ink-3">
              Cifras del cierre en millones · {totals.clients} clientes
            </span>
          }
        />
      </section>

      {tab === "resumen" && summary}
      {tab === "clientes" && (
        <ChartCard
          title="Resultados del cierre por cliente"
          help="Cartera, recaudo y aging de cada cliente al corte. Bajo el % vencido, la variación frente al cierre anterior. Clic en un cliente para ver su ficha y comentarios."
        >
          <ClientsTable rows={clients} commented={commented} onOpen={(r) => setOpenNit(r.nit)} />
        </ChartCard>
      )}
      {tab === "recaudo" && (
        <CollectionsTab
          period={period}
          prevPeriod={prevPeriod}
          payments={payments}
          prevPayments={prevPayments}
          portfolio={portfolio}
          history={history}
          onOpenClient={setOpenNit}
        />
      )}
      {tab === "saldos" && <BalancesTab portfolio={portfolio} onOpenClient={setOpenNit} />}
      {tab === "comentarios" && (
        <CommentsTab
          period={period}
          periods={closings.map((c) => c.period)}
          comments={comments}
          clients={clients}
          onOpenClient={setOpenNit}
        />
      )}
      {tab === "plantilla" && <TemplateTab closings={closings} />}

      <ClientClosingDrawer
        client={openClient}
        period={period}
        history={history}
        comments={comments}
        onSaveComment={saveComment}
        onClose={() => setOpenNit(null)}
      />
      <LoadClosingModal
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        onSeeTemplate={() => {
          setLoadOpen(false);
          setTab("plantilla");
        }}
      />
    </div>
  );
}
