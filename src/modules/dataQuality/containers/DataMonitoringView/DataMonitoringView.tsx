"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Select, Spin } from "antd";
import { BellRing } from "lucide-react";

import Header from "@/components/organisms/header";
import { useAppStore } from "@/lib/store/store";
import { getSummaryCountries } from "@/services/dataQuality/dataQuality";
import { canReadDataQuality, hasDataQualityManagementPermission } from "@/utils/utils";

import { useMonitoringSummary } from "../../hooks/useMonitoringSummary";
import {
  AlertsCard,
  AnomaliesCard,
  DetailTab,
  QualityCard,
  ReceptionCard,
  isDetailTab
} from "../../components/monitoring/MonitoringCards";
import { MonitoringClientsModal } from "../../components/monitoring/MonitoringClientsModal";
import { MonitoringSubscriptionsModal } from "../../components/monitoring/MonitoringSubscriptionsModal";
import { useMonitoringSubscriptions } from "../../hooks/useMonitoringSubscriptions";
import {
  deleteMonitoringSubscription,
  saveMonitoringSubscription,
  sendMonitoringTest
} from "../../services/monitoringNotifications";
import {
  formatMonthLabel,
  formatNumber,
  formatShortDate,
  plural,
  recentMonths
} from "../../components/monitoring/monitoringFormat";

const MONTH_OPTIONS = recentMonths(12);

export default function DataMonitoringView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedProject = useAppStore((state) => state.selectedProject);
  const projectId = selectedProject?.ID;
  const canRead = canReadDataQuality(selectedProject);
  const canManage = hasDataQualityManagementPermission(selectedProject);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const subscriptions = useMonitoringSubscriptions(canManage && notifyOpen);

  const { data: countriesData, isLoading: countriesLoading } = useSWR(
    projectId && canRead ? ["monitoring-countries", projectId] : null,
    () => getSummaryCountries(projectId),
    { revalidateOnFocus: false }
  );
  const countries = useMemo(
    () =>
      (countriesData?.countries ?? [])
        .filter((c) => c.id_country > 0)
        .map((c) => ({ value: c.id_country, label: c.country_name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countriesData]
  );

  const paramCountry = Number(searchParams.get("country")) || undefined;
  const paramMonth = searchParams.get("month") ?? undefined;
  const countryId =
    paramCountry && (!countries.length || countries.some((c) => c.value === paramCountry))
      ? paramCountry
      : countries[0]?.value;
  const month =
    paramMonth && /^\d{4}-\d{2}$/.test(paramMonth) ? paramMonth : MONTH_OPTIONS[0].value;

  const updateParams = (next: { country?: number; month?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.country) params.set("country", String(next.country));
    if (next.month) params.set("month", next.month);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!paramCountry && countryId) updateParams({ country: countryId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId, paramCountry]);

  const { data, isLoading, error } = useMonitoringSummary(countryId, month);
  const [detailTab, setDetailTab] = useState<DetailTab | null>(() => {
    const param = searchParams.get("detail");
    return isDetailTab(param) ? param : null;
  });

  const titleExtra = data ? (
    <span className="text-[14px] text-cp-ink-3">
      {formatMonthLabel(data.period.month)} · Corte {formatShortDate(data.period.cutoff)} ·{" "}
      {formatNumber(data.clients_total)} {plural(data.clients_total, "cliente", "clientes")}
    </span>
  ) : null;

  const actions = (
    <>
      <Select
        showSearch
        optionFilterProp="label"
        className="w-[220px]"
        placeholder="País"
        loading={countriesLoading}
        value={countryId}
        options={countries}
        onChange={(value: number) => updateParams({ country: value })}
      />
      <Select
        className="w-[180px]"
        value={month}
        options={MONTH_OPTIONS}
        onChange={(value: string) => updateParams({ month: value })}
      />
      {canManage && (
        <button
          type="button"
          onClick={() => setNotifyOpen(true)}
          className="cp-control-fill flex h-[var(--control-h)] items-center gap-[8px] rounded-[8px] px-[14px] text-[13px] font-medium text-cp-ink-2 hover:text-cp-ink"
        >
          <BellRing className="h-[16px] w-[16px]" strokeWidth={2} />
          Notificaciones
        </button>
      )}
    </>
  );

  if (!canRead) {
    return (
      <div className="cp-page">
        <Header title="Monitoreo de datos" />
        <div className="cp-card p-12 text-center text-[16px] text-cp-ink-3">
          No tienes acceso al monitoreo de datos.
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page cp-fill">
      <Header
        title="Monitoreo de datos"
        titleExtra={titleExtra}
        actionsExtra={actions}
        back="/data-quality"
      />

      {isLoading || countriesLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="cp-card p-12 text-center text-[16px] text-cp-ink-3">
          No pudimos cargar el monitoreo. {error.message}
        </div>
      ) : !countryId ? (
        <div className="cp-card p-12 text-center text-[16px] text-cp-ink-3">
          No tienes países asignados.
        </div>
      ) : data ? (
        <div className="min-h-0 flex-1 overflow-y-auto xl:overflow-hidden">
          <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:h-full xl:grid-cols-3 xl:grid-rows-[minmax(0,1fr)]">
            <div className="flex min-h-0 min-w-0 flex-col gap-[var(--card-gap)]">
              <ReceptionCard data={data} onOpenDetail={setDetailTab} />
              <QualityCard data={data} />
            </div>
            <AnomaliesCard data={data} />
            <AlertsCard data={data} />
          </div>
          <MonitoringSubscriptionsModal
            open={notifyOpen}
            onClose={() => setNotifyOpen(false)}
            data={subscriptions.data}
            loading={subscriptions.isLoading}
            countries={countries}
            defaultCountryId={countryId}
            onSave={async (input) => {
              await saveMonitoringSubscription(input);
              await subscriptions.mutate();
            }}
            onDelete={async (id) => {
              await deleteMonitoringSubscription(id);
              await subscriptions.mutate();
            }}
            onTest={sendMonitoringTest}
          />
          <MonitoringClientsModal
            data={data}
            tab={detailTab}
            onTabChange={setDetailTab}
            onClose={() => setDetailTab(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
