"use client";

import { useEffect, useMemo } from "react";
import { Alert, Empty, Pagination, Segmented } from "antd";
import { ArrowUpDown, Building2, Check, Store } from "lucide-react";

import GeneralDropdown from "@/components/ui/dropdown/dropdown";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import UiTab from "@/components/ui/ui-tab";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import type { IBlockingAlertRow } from "@/types/blockingAlerts/IBlockingAlerts";
import { cn } from "@/utils/utils";

import AlertCard from "../../components/alert-card/alert-card";
import AlertsHeader from "../../components/alerts-header/alerts-header";
import PortfolioCard from "../../components/portfolio-card/portfolio-card";
import {
  BLOCKING_ALERTS_PATH,
  BLOCKING_RULES,
  HEADER_BUTTON,
  MOBILE_TABS,
  PAGE_SIZE,
  SORT_OPTIONS,
  STATUS_META,
  type AlertsSort
} from "../../constants";
import { useBlockingAlerts } from "../../hooks/use-blocking-alerts";
import {
  useBlockingAlertsStore,
  type AlertsStatusFilter,
  type AlertsView
} from "../../stores/blocking-alerts-store";
import { byUrgency, fmtCutoff, plural } from "../../utils/blocking-alerts";

type Row = IBlockingAlertRow;

const SORTERS: Record<AlertsSort, (a: Row, b: Row) => number> = {
  urgency: byUrgency,
  past_due_desc: (a, b) => b.past_due - a.past_due,
  past_due_asc: (a, b) => a.past_due - b.past_due,
  oldest_overdue_days: (a, b) => b.oldest_overdue_days - a.oldest_overdue_days,
  name: (a, b) => a.name.localeCompare(b.name, "es")
};

const STATUS_TABS: AlertsStatusFilter[] = ["all", "blocked", "warning", "ok"];

/** Toggle Clientes / Puntos de venta: en móvil, letra e íconos más pequeños para que quepa. */
const VIEW_LABEL =
  "flex items-center justify-center gap-1.5 whitespace-nowrap font-semibold max-md:gap-1 max-md:text-[11.5px]";
const VIEW_ICON = "h-3.5 w-3.5 shrink-0 max-md:h-3 max-md:w-3";

/** Sin tildes ni mayúsculas: "exito" encuentra "Éxito". */
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

interface BlockingAlertsViewProps {
  /** Con cliente, lista solo sus puntos de venta ("Ver los N puntos de venta"). */
  clientId?: string;
}

/**
 * Alertas de bloqueo (/blockingAlerts): clientes o puntos de venta bloqueados, por
 * bloquear y al día, con la cartera total, búsqueda, orden y paginación.
 */
export default function BlockingAlertsView({ clientId }: BlockingAlertsViewProps) {
  const { alerts, error } = useBlockingAlerts();
  const { resolvedTheme } = useWalletTheme();
  const store = useBlockingAlertsStore();
  const { setScope } = store;

  useEffect(() => setScope(clientId ?? null), [clientId, setScope]);

  const scopeClient = clientId ? alerts?.clients.find((c) => c.client_id === clientId) : undefined;
  const isPos = Boolean(clientId) || store.view === "points_of_sale";
  const noun: [string, string] = isPos
    ? ["punto de venta", "puntos de venta"]
    : ["cliente", "clientes"];

  const base = useMemo(() => {
    if (!alerts) return [];
    if (clientId) return alerts.points_of_sale.filter((p) => p.client_id === clientId);
    return isPos ? alerts.points_of_sale : alerts.clients;
  }, [alerts, clientId, isPos]);

  // En la vista por cliente la búsqueda también mira sus puntos de venta (nombre o ship-to).
  const matches = useMemo(() => {
    const query = normalize(store.search.trim());
    const storeHit = (s: Row) =>
      normalize(s.name).includes(query) || (s.ship_to_code ?? "").includes(query);
    return base
      .flatMap((row): { row: Row; matchedStore?: Row }[] => {
        if (store.status !== "all" && row.status !== store.status) return [];
        if (!query) return [{ row }];
        if (isPos) {
          const hit = storeHit(row) || (!clientId && normalize(row.client_name).includes(query));
          return hit ? [{ row }] : [];
        }
        if (normalize(row.name).includes(query)) return [{ row }];
        const matchedStore = alerts?.points_of_sale.find(
          (s) => s.client_id === row.client_id && storeHit(s)
        );
        return matchedStore ? [{ row, matchedStore }] : [];
      })
      .sort((a, b) => SORTERS[store.sort](a.row, b.row));
  }, [alerts, base, clientId, isPos, store.search, store.sort, store.status]);

  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(store.page, pages);
  const visible = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = alerts?.totals[isPos ? "points_of_sale" : "clients"];
  const scopePos = scopeClient?.points_of_sale_count;
  const caption = clientId
    ? scopePos &&
      `${plural(scopePos.total, ...noun)} · ${scopePos.blocked + scopePos.warning} en alerta`
    : totals && `${plural(totals.count, ...noun)} · ${totals.alerts} en alerta`;

  const sortLabel = SORT_OPTIONS.find((o) => o.key === store.sort)?.label;

  const grid = (
    <div className="flex flex-col gap-3 pb-1 pt-1">
      {visible.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-2">
          {visible.map(({ row, matchedStore }) => (
            <AlertCard
              key={`${row.client_id}/${row.ship_to_code ?? ""}`}
              row={row}
              matchedStore={matchedStore}
              showClient={!clientId}
              href={
                row.ship_to_code
                  ? `${BLOCKING_ALERTS_PATH}/${row.client_id}/points-of-sale/${row.ship_to_code}`
                  : `${BLOCKING_ALERTS_PATH}/${row.client_id}`
              }
            />
          ))}
        </div>
      ) : (
        alerts && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`Sin ${noun[1]} en esta vista`}
          />
        )
      )}
      {matches.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] text-cp-ink-3">
            {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + visible.length} de{" "}
            {plural(matches.length, ...noun)}
          </span>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={matches.length}
            onChange={store.setPage}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );

  const searchControls = (
    <>
      <HeaderSearch
        value={store.search}
        onChange={store.setSearch}
        className="w-auto flex-1 bg-cp-bg"
        placeholder={
          clientId
            ? "Buscar punto de venta o ship-to"
            : isPos
              ? "Buscar punto de venta, ship-to o cliente"
              : "Buscar cliente o ship-to"
        }
      />
      <GeneralDropdown
        align="end"
        rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
        items={SORT_OPTIONS.map((o) => ({
          key: o.key,
          label: (
            <span className="flex items-center justify-between gap-6">
              {o.label}
              <Check
                className={cn("h-4 w-4 text-cp-lime-dark", o.key !== store.sort && "invisible")}
              />
            </span>
          ),
          onClick: () => store.setSort(o.key)
        }))}
      >
        <button
          type="button"
          aria-label="Ordenar"
          title={`Orden: ${sortLabel}`}
          className={cn(HEADER_BUTTON, "w-[var(--control-h)] px-0")}
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </GeneralDropdown>
    </>
  );

  // Sin toggle en el listado acotado a un cliente (ahí solo hay puntos de venta).
  const viewToggle = !clientId && alerts && (
    <Segmented<AlertsView>
      block
      className="max-md:[&_.ant-segmented-item-label]:!px-1.5"
      value={store.view}
      onChange={store.setView}
      options={[
        {
          value: "clients",
          label: (
            <span className={VIEW_LABEL}>
              <Building2 className={VIEW_ICON} />
              Clientes
              <span className="font-medium opacity-60">{alerts.clients.length}</span>
            </span>
          )
        },
        {
          value: "points_of_sale",
          label: (
            <span className={VIEW_LABEL}>
              <Store className={VIEW_ICON} />
              Puntos de venta
              <span className="font-medium opacity-60">{alerts.points_of_sale.length}</span>
            </span>
          )
        }
      ]}
    />
  );

  return (
    <div className="flex flex-col gap-3 pb-6 max-md:px-4">
      <AlertsHeader
        crumbs={
          clientId
            ? [
                { label: "Alertas de bloqueo", href: BLOCKING_ALERTS_PATH },
                {
                  label: scopeClient?.name ?? "Cliente",
                  href: `${BLOCKING_ALERTS_PATH}/${clientId}`
                },
                { label: "Puntos de venta" }
              ]
            : [{ label: "Alertas de bloqueo" }]
        }
        info={
          alerts && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-cp-lime-dark max-md:hidden" />
              Corte {fmtCutoff(alerts.cutoff_at)}
            </span>
          )
        }
        themeToggle={!clientId}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="No se pudieron cargar las alertas"
          description={error.message}
        />
      )}

      {clientId && alerts && !scopeClient ? (
        <Empty description="No encontramos este cliente" />
      ) : (
        <>
          <PortfolioCard
            label={clientId ? "Cartera del cliente" : "Total cartera"}
            aging={clientId ? scopeClient : totals}
            caption={caption || undefined}
          />

          <section className={cn("rounded-[14px] bg-cp-surface p-3 md:p-4", MOBILE_TABS)}>
            {/* Como el prototipo: vista, buscador y orden en filas sobre las pestañas de estado. */}
            <div className="mb-1 flex flex-col gap-2.5">
              {viewToggle}
              <div className="flex gap-2">{searchControls}</div>
            </div>
            <UiTab
              activeKey={store.status}
              onChangeTab={(key) => store.setStatus(key as AlertsStatusFilter)}
              tabs={STATUS_TABS.map((status) => ({
                key: status,
                label: (
                  <span className="flex items-center gap-1.5">
                    {status !== "all" && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: STATUS_META[status].color }}
                      />
                    )}
                    {status === "all" ? "Todos" : STATUS_META[status].tab}
                    <span className="font-medium opacity-60">
                      {base.filter((r) => status === "all" || r.status === status).length}
                    </span>
                  </span>
                ),
                children: status === store.status ? grid : null
              }))}
            />
          </section>

          <p className="m-0 text-center text-[11.5px] leading-relaxed text-cp-ink-4">
            {BLOCKING_RULES}
            {isPos && (
              <>
                <br />
                Cada punto de venta se identifica por su código ship-to
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
