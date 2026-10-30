"use client";

import { useEffect } from "react";
import { Alert, Empty, Pagination, Segmented } from "antd";
import { ArrowUpDown, Building2, Check, Store } from "lucide-react";

import GeneralDropdown from "@/components/ui/dropdown/dropdown";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import UiTab from "@/components/ui/ui-tab";
import { useDebounce } from "@/hooks/useDeabouce";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { cn } from "@/utils/utils";

import AlertCard from "../../components/alert-card/alert-card";
import AlertsHeader from "../../components/alerts-header/alerts-header";
import PortfolioCard from "../../components/portfolio-card/portfolio-card";
import {
  BLOCKING_ALERTS_PATH,
  HEADER_BUTTON,
  MOBILE_TABS,
  PAGE_SIZE,
  SORT_OPTIONS,
  STATUS_META,
  blockingRulesNote
} from "../../constants";
import { useBlockingAlertsList, useBlockingAlertsSummary } from "../../hooks/use-blocking-alerts";
import {
  useBlockingAlertsStore,
  type AlertsStatusFilter,
  type AlertsView
} from "../../stores/blocking-alerts-store";
import { fmtCutoff, plural } from "../../utils/blocking-alerts";

const STATUS_TABS: AlertsStatusFilter[] = ["all", "blocked", "to_be_blocked", "up_to_date"];

/** Toggle Clientes / Puntos de venta: en móvil, letra e íconos más pequeños para que quepa. */
const VIEW_LABEL =
  "flex items-center justify-center gap-1.5 whitespace-nowrap font-semibold max-md:gap-1 max-md:text-[11.5px]";
const VIEW_ICON = "h-3.5 w-3.5 shrink-0 max-md:h-3 max-md:w-3";

interface BlockingAlertsViewProps {
  /** UUID del cliente: lista solo sus puntos de venta ("Ver los N puntos de venta"). */
  clientId?: string;
}

/**
 * Alertas de bloqueo (/blockingAlerts): clientes o puntos de venta bloqueados, por
 * bloquear y al día. El API clasifica, busca, ordena y pagina; aquí solo se pinta.
 */
export default function BlockingAlertsView({ clientId }: BlockingAlertsViewProps) {
  const { resolvedTheme } = useWalletTheme();
  const store = useBlockingAlertsStore();
  const { setScope } = store;

  useEffect(() => setScope(clientId ?? null), [clientId, setScope]);

  const isPos = Boolean(clientId) || store.view === "points_of_sale";
  const noun: [string, string] = isPos
    ? ["punto de venta", "puntos de venta"]
    : ["cliente", "clientes"];
  const sort = SORT_OPTIONS.find((o) => o.key === store.sort) ?? SORT_OPTIONS[0];
  const search = useDebounce(store.search, 300);

  const { summary, error } = useBlockingAlertsSummary(clientId);
  const { list, error: listError } = useBlockingAlertsList(isPos ? "points-of-sale" : "clients", {
    clientUuid: clientId,
    status: store.status === "all" ? null : store.status,
    search,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
    page: store.page,
    limit: PAGE_SIZE
  });

  const counts = summary?.[isPos ? "pointsOfSale" : "clients"];
  const total = list?.pagination.total ?? 0;
  const offset = (store.page - 1) * PAGE_SIZE;
  const loadError = error ?? listError;

  const grid = (
    <div className="flex flex-col gap-3 pb-1 pt-1">
      {list?.rows.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-2">
          {list.rows.map((row) => {
            const clientHref = `${BLOCKING_ALERTS_PATH}/${row.clientUuid}`;
            const code = "code" in row ? row.code : null;
            return (
              <AlertCard
                key={`${row.clientId}/${code ?? ""}`}
                row={row}
                showClient={!clientId}
                href={code ? `${clientHref}/points-of-sale/${code}` : clientHref}
              />
            );
          })}
        </div>
      ) : (
        list && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`Sin ${noun[1]} en esta vista`}
          />
        )
      )}
      {total > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] text-cp-ink-3">
            {offset + 1}–{offset + (list?.rows.length ?? 0)} de {plural(total, ...noun)}
          </span>
          <Pagination
            current={store.page}
            pageSize={PAGE_SIZE}
            total={total}
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
          title={`Orden: ${sort.label}`}
          className={cn(HEADER_BUTTON, "w-[var(--control-h)] px-0")}
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </GeneralDropdown>
    </>
  );

  // Sin toggle en el listado acotado a un cliente (ahí solo hay puntos de venta).
  const viewToggle = !clientId && summary && (
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
              <span className="font-medium opacity-60">{summary.clients.all}</span>
            </span>
          )
        },
        {
          value: "points_of_sale",
          label: (
            <span className={VIEW_LABEL}>
              <Store className={VIEW_ICON} />
              Puntos de venta
              <span className="font-medium opacity-60">{summary.pointsOfSale.all}</span>
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
                  label: summary?.client?.name ?? "Cliente",
                  href: `${BLOCKING_ALERTS_PATH}/${clientId}`
                },
                { label: "Puntos de venta" }
              ]
            : [{ label: "Alertas de bloqueo" }]
        }
        info={
          summary && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-cp-lime-dark max-md:hidden" />
              Corte {fmtCutoff(summary.cutoffAt)}
            </span>
          )
        }
        themeToggle={!clientId}
      />

      {loadError && (
        <Alert
          type="error"
          showIcon
          message="No se pudieron cargar las alertas"
          description={loadError.message}
        />
      )}

      <PortfolioCard
        label={clientId ? "Cartera del cliente" : "Total cartera"}
        aging={summary?.portfolio}
        caption={counts && `${plural(counts.all, ...noun)} · ${counts.alerts} en alerta`}
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
                <span className="font-medium opacity-60">{counts?.[status]}</span>
              </span>
            ),
            children: status === store.status ? grid : null
          }))}
        />
      </section>

      {summary && (
        <p className="m-0 text-center text-[11.5px] leading-relaxed text-cp-ink-4">
          {blockingRulesNote(summary.rules)}
          {isPos && (
            <>
              <br />
              Cada punto de venta se identifica por su código ship-to
            </>
          )}
        </p>
      )}
    </div>
  );
}
