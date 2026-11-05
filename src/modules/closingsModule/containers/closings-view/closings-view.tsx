"use client";

import { useCallback, useMemo, useState } from "react";
import { Skeleton } from "antd";
import { UploadSimple } from "phosphor-react";

import Header from "@/components/organisms/header";
import { FilterModal } from "@/components/ui/filter-modal";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";

import AgingByMarket from "../../components/aging-by-market/aging-by-market";
import CollectionsByMarket from "../../components/collections-by-market/collections-by-market";
import BalancesTab from "../../components/balances-tab/balances-tab";
import ClientClosingDrawer from "../../components/client-closing-drawer/client-closing-drawer";
import ClientsTable from "../../components/clients-table/clients-table";
import ClosingKpis, { Delta, Pill } from "../../components/closing-kpis/closing-kpis";
import ClosingPicker from "../../components/closing-picker/closing-picker";
import AgingComparison from "../../components/aging-comparison/aging-comparison";
import OverdueByMarket from "../../components/overdue-by-market/overdue-by-market";
import CollectionsTab from "../../components/collections-tab/collections-tab";
import CommentsTab from "../../components/comments-tab/comments-tab";
import LoadClosingModal from "../../components/load-closing-modal/load-closing-modal";
import MarketChips from "../../components/market-chips/market-chips";
import TemplateTab from "../../components/template-tab/template-tab";
import TrendsTab from "../../components/trends-tab/trends-tab";
import ViewSelector from "../../components/view-selector/view-selector";
import { HIGH_OVERDUE } from "../../constants";
import { downloadPendingClients } from "../../utils/pending-clients";
import { isCompensated, useClosings } from "../../hooks/use-closings";
import { clientRows, portfolioTotals, sumBy } from "../../utils/aggregate";
import { clientForm } from "../../utils/trends";
import { formatMillions, formatPct, formatPp, periodShort } from "../../utils/format";

type TabKey =
  | "resumen"
  | "tendencias"
  | "clientes"
  | "recaudo"
  | "saldos"
  | "comentarios"
  | "plantilla";

/** Vistas del módulo: se eligen desde el título (como los tableros de la Torre de recaudo). */
const VIEWS: { key: TabKey; name: string; description: string }[] = [
  {
    key: "clientes",
    name: "Cierre por cliente",
    description: "Cartera, recaudo y racha de cada cliente"
  },
  {
    key: "resumen",
    name: "Resumen del cierre",
    description: "Indicadores, recaudo por mercado y edades"
  },
  {
    key: "tendencias",
    name: "Tendencias",
    description: "Evolución entre cierres y señales por cliente"
  },
  {
    key: "recaudo",
    name: "Recaudo del cierre",
    description: "Compensado, sin aplicar y cambios por cliente"
  },
  { key: "saldos", name: "Saldos y notas", description: "Partidas abiertas y notas por causal" },
  { key: "comentarios", name: "Comentarios", description: "Bitácora del comité por cliente y mes" },
  {
    key: "plantilla",
    name: "Plantilla y cargas",
    description: "Formato del archivo y cierres cargados"
  }
];

const direction = (diff: number, epsilon: number) =>
  diff > epsilon ? "up" : diff < -epsilon ? "down" : "flat";

/**
 * Cierres de cartera (/cierres): informes del cierre de cada mes, fijos al corte que reporta
 * la compañía desde su ERP (plantilla cargada en /portfolio-closings). No lee la cartera viva.
 */
export default function ClosingsView() {
  const state = useClosings();
  const {
    closings,
    readyClosings,
    period,
    setPeriod,
    prevPeriod,
    filters,
    setFilters,
    filterCategories,
    search,
    setSearch,
    clientOf,
    pendingClients,
    portfolio,
    prevPortfolio,
    payments,
    prevPayments,
    history,
    comments,
    saveComment,
    removeComment,
    refreshClosings,
    markets,
    selectedMarkets,
    toggleMarket,
    clearMarkets,
    unapplied,
    isLoading,
    error,
    projectId
  } = state;
  const periods = useMemo(() => readyClosings.map((c) => c.period), [readyClosings]);

  const [tab, setTab] = useState<TabKey>("clientes");
  const [openNit, setOpenNit] = useState<string | null>(null);
  const [loadOpen, setLoadOpen] = useState(false);

  const totals = useMemo(() => portfolioTotals(portfolio), [portfolio]);
  const prevTotals = useMemo(() => portfolioTotals(prevPortfolio), [prevPortfolio]);
  const collected = useMemo(() => sumBy(payments, (p) => p.amount), [payments]);
  const prevCollected = useMemo(() => sumBy(prevPayments, (p) => p.amount), [prevPayments]);
  const unappliedTotal = useMemo(
    () =>
      sumBy(
        payments.filter((p) => !isCompensated(p.status)),
        (p) => p.amount
      ),
    [payments]
  );
  const clients = useMemo(
    () => clientRows(portfolio, payments, prevPortfolio, prevPeriod ? prevPayments : null),
    [portfolio, payments, prevPortfolio, prevPayments, prevPeriod]
  );
  const commented = useMemo(
    () => new Set(comments.filter((c) => c.period === period).map((c) => c.nit)),
    [comments, period]
  );
  const periodComments = useMemo(() => {
    const map = new Map<string, typeof comments>();
    comments
      .filter((c) => c.period === period)
      .forEach((c) => map.set(c.nit, [...(map.get(c.nit) ?? []), c]));
    return map;
  }, [comments, period]);
  const openClient = clients.find((c) => c.nit === openNit) ?? null;

  const prevLabel = prevPeriod ? periodShort(prevPeriod).split(" ")[0].toLowerCase() : "";
  const totalDiff = prevTotals.total ? (totals.total - prevTotals.total) / prevTotals.total : 0;
  const pctDiff = totals.overduePct - prevTotals.overduePct;
  const collectedDiff = prevCollected ? (collected - prevCollected) / prevCollected : 0;

  /** Clic en una barra o un mercado: lo vuelve filtro del tablero (chip en el header). */
  const filterBy = (key: string, value: string) =>
    setFilters({ ...filters, [key]: [{ id: value, name: value }] });

  const form = useMemo(() => clientForm(history, [...periods].reverse()), [history, periods]);
  const collectedTrend = useMemo(() => {
    const window = [...periods].reverse().slice(-6);
    const map = new Map<string, number[]>();
    history.forEach((h) => {
      const i = window.indexOf(h.period);
      if (i < 0) return;
      const values = map.get(h.nit) ?? window.map(() => 0);
      values[i] += h.collected;
      map.set(h.nit, values);
    });
    return map;
  }, [history, periods]);

  const onLoaded = useCallback(
    (loaded: string) => {
      void refreshClosings();
      setPeriod(loaded);
    },
    [refreshClosings, setPeriod]
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
                vs {prevLabel}
              </>
            ) : undefined
          },
          {
            key: "overdue30",
            label: "Vencida > 30 días",
            value: formatMillions(totals.overdue30),
            unit: "M",
            bar: { value: totals.total ? totals.overdue30 / totals.total : 0, color: "#d11a2a" },
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
            value: formatMillions(unappliedTotal),
            unit: "M",
            caption: "sin compensar al corte"
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

      <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-2">
        <CollectionsByMarket
          periods={[...periods].reverse()}
          history={history}
          clientOf={clientOf}
          selected={selectedMarkets}
          allMarkets={markets.map((m) => m.name)}
          onToggleMarket={toggleMarket}
        />
        <AgingByMarket
          rows={portfolio}
          onSelect={(dim, value) => (dim === "market" ? toggleMarket(value) : filterBy(dim, value))}
        />
      </div>

      <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-2">
        <AgingComparison periods={[...periods].reverse()} history={history} />
        <OverdueByMarket periods={[...periods].reverse()} history={history} clientOf={clientOf} />
      </div>
    </div>
  );

  const hasClosing = Boolean(period);
  const showTemplate = tab === "plantilla" || (!hasClosing && !isLoading);

  return (
    <div className="cp-page">
      <Header
        title="Cierres de cartera"
        titleNode={
          <ViewSelector
            views={
              hasClosing
                ? VIEWS.map((v) =>
                    v.key === "comentarios" ? { ...v, name: `${v.name} (${commented.size})` } : v
                  )
                : VIEWS.filter((v) => v.key === "plantilla")
            }
            value={hasClosing ? tab : "plantilla"}
            onChange={setTab}
          />
        }
        titleExtra={
          period ? (
            <ClosingPicker
              closings={readyClosings}
              value={period}
              onChange={setPeriod}
              onLoadNew={() => setLoadOpen(true)}
              pendingCount={pendingClients.length}
              onDownloadPending={() => downloadPendingClients(pendingClients, period)}
            />
          ) : null
        }
        actionsExtra={
          <>
            <FilterModal
              inHeader
              categories={filterCategories}
              value={filters}
              onApply={setFilters}
              onValueChange={setFilters}
              isLoading={!hasClosing}
            />
            <HeaderSearch value={search} onChange={setSearch} placeholder="Buscar cliente, NIT…" />
          </>
        }
      />

      {error && (
        <section className="cp-card px-[18px] py-[14px] text-[13px] text-[#d11a2a] dark:text-[#ff6b6b]">
          {error.message || "No se pudieron cargar los cierres"}
        </section>
      )}

      {isLoading && (
        <section className="cp-card px-[18px] py-[14px]">
          <Skeleton active paragraph={{ rows: 6 }} />
        </section>
      )}

      {!projectId && (
        <section className="cp-card px-[18px] py-[18px] text-[13px] text-cp-ink-3">
          Elige un proyecto para ver sus cierres de cartera.
        </section>
      )}

      {projectId && !isLoading && !hasClosing && !error && (
        <section className="cp-card flex flex-col items-start gap-2 px-[18px] py-[18px]">
          <h3 className="text-[18px] font-semibold text-cp-ink">Todavía no hay cierres cargados</h3>
          <p className="max-w-[720px] text-[13px] leading-[1.55] text-cp-ink-3">
            Carga la cartera y los pagos al cierre del mes con la plantilla. Cada cierre queda como
            una foto fija del corte: así todos ven las mismas cifras que reportó la compañía.
          </p>
          <button
            type="button"
            onClick={() => setLoadOpen(true)}
            className="mt-1 flex h-[var(--control-h)] items-center gap-2 rounded-lg bg-cp-lime px-4 text-[14px] font-semibold text-[#141414] hover:bg-cp-lime-dark"
          >
            <UploadSimple size={18} weight="bold" /> Cargar el primer cierre
          </button>
        </section>
      )}

      {hasClosing && !isLoading && period && (
        <>
          {tab === "resumen" && summary}
          {tab === "tendencias" && (
            <TrendsTab
              periods={[...periods].reverse()}
              history={history}
              clientOf={clientOf}
              onOpenClient={setOpenNit}
            />
          )}
          {tab === "clientes" && (
            <section className="cp-card min-w-0 px-[18px] py-[10px]">
              <div className="pb-2 pt-1">
                <MarketChips
                  markets={markets}
                  selected={selectedMarkets}
                  onToggle={toggleMarket}
                  onClear={clearMarkets}
                />
              </div>
              <ClientsTable
                rows={clients}
                comments={periodComments}
                form={form}
                collectedTrend={collectedTrend}
                onOpen={(r) => setOpenNit(r.nit)}
              />
            </section>
          )}
          {tab === "recaudo" && (
            <CollectionsTab
              period={period}
              prevPeriod={prevPeriod}
              payments={payments}
              prevPayments={prevPayments}
              portfolio={portfolio}
              history={history}
              periods={[...periods].reverse()}
              clientOf={clientOf}
              unapplied={unapplied}
              onOpenClient={setOpenNit}
            />
          )}
          {tab === "saldos" && <BalancesTab portfolio={portfolio} onOpenClient={setOpenNit} />}
          {tab === "comentarios" && (
            <CommentsTab
              period={period}
              periods={periods}
              comments={comments}
              clients={clients}
              onOpenClient={setOpenNit}
            />
          )}
        </>
      )}
      {showTemplate && <TemplateTab closings={closings} onDeleted={refreshClosings} />}

      {period && (
        <ClientClosingDrawer
          client={openClient}
          info={openNit ? clientOf(openNit) : null}
          period={period}
          periods={periods}
          portfolio={portfolio}
          history={history}
          comments={comments}
          onSaveComment={saveComment}
          onDeleteComment={removeComment}
          onClose={() => setOpenNit(null)}
        />
      )}
      <LoadClosingModal
        open={loadOpen}
        loadedPeriods={closings.map((c) => c.period)}
        onClose={() => {
          setLoadOpen(false);
          void refreshClosings();
        }}
        onLoaded={onLoaded}
      />
    </div>
  );
}
