"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { Download, TrendingDown, TrendingUp } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { useDebounce } from "@/hooks/useDeabouce";
import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import { useDashboardSalesClientDetail } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesClientDetail";
import type { IDashboardSalesClientDetailItem } from "@/types/dashboardSales/IDashboardSales";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import SearchField from "@/components/ui/search-field/search-field";
import { useTranslations } from "use-intl";

const PAGE_SIZE = 25;

const PctBadge = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) {
    return <span className="text-[13px] text-muted-foreground">—</span>;
  }
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[13px] font-medium ${
        positive
          ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
          : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
      }`}
    >
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

const RoiCell = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) {
    return <span className="text-[13px] text-muted-foreground">—</span>;
  }
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        positive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
      }`}
    >
      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

// `header` es la clave del texto en commerce.dashboard.clientDetails.csv.<header>.
const CSV_COLUMNS = [
  { header: "client", getValue: (i: IDashboardSalesClientDetailItem) => i.client_name },
  { header: "monthSales", getValue: (i: IDashboardSalesClientDetailItem) => i.ventas_mes },
  { header: "target", getValue: (i: IDashboardSalesClientDetailItem) => i.meta },
  { header: "targetPct", getValue: (i: IDashboardSalesClientDetailItem) => i.meta_pct },
  { header: "monthlyAvg", getValue: (i: IDashboardSalesClientDetailItem) => i.prom_mensual },
  {
    header: "monthlyAvgPct",
    getValue: (i: IDashboardSalesClientDetailItem) => i.prom_mensual_pct
  },
  { header: "prevMonth", getValue: (i: IDashboardSalesClientDetailItem) => i.mes_anterior },
  {
    header: "prevMonthPct",
    getValue: (i: IDashboardSalesClientDetailItem) => i.mes_anterior_pct
  },
  { header: "prevYtd", getValue: (i: IDashboardSalesClientDetailItem) => i.ytd_anterior },
  { header: "currentYtd", getValue: (i: IDashboardSalesClientDetailItem) => i.ytd_actual },
  { header: "roiYtdPct", getValue: (i: IDashboardSalesClientDetailItem) => i.roi_ytd_pct }
] as const;

const exportToCsv = (
  items: IDashboardSalesClientDetailItem[],
  headerLabel: (key: (typeof CSV_COLUMNS)[number]["header"]) => string
) => {
  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const rows = [
    CSV_COLUMNS.map((c) => headerLabel(c.header)).join(","),
    ...items.map((item) => CSV_COLUMNS.map((c) => escape(c.getValue(item))).join(","))
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "detalle-cliente.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function DashboardClientsDetailsTable() {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const t = useTranslations("commerce.dashboard.clientDetails");
  const tTables = useTranslations("commerce.dashboard.tables");
  const tCommon = useTranslations("common");
  const { filters, includeIva } = useRevenueTracking();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => {
    setPage(1);
  }, [filtersKey, debouncedSearch]);

  const { data, isLoading } = useDashboardSalesClientDetail(
    filters,
    page,
    PAGE_SIZE,
    debouncedSearch,
    includeIva
  );

  const items = data?.items ?? [];

  return (
    <Card className="cp-card gap-0 rounded-[var(--card-radius)] border-0 bg-cp-surface py-0 shadow-none">
      <CardHeader className="sm:px-[18px] sm:pt-[14px] !pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <CardTitle className="text-base sm:text-lg font-semibold">{t("title")}</CardTitle>
          <div className="flex items-center gap-2 sm:ml-auto">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder={t("searchPlaceholder")}
              className="sm:w-56"
            />
            <button
              type="button"
              onClick={() => exportToCsv(items, (key) => t(`csv.${key}`))}
              disabled={items.length === 0}
              className="flex h-[var(--control-h)] items-center gap-2 px-4 text-sm font-medium bg-background border border-border rounded-lg hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {tTables("export")}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:px-[18px] sm:py-[14px]">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p>{tTables("loading")}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p>{tTables("noData")}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cp-line bg-cp-surface">
                    <th className="text-left py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {tCommon("fields.customer")}
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {t("columns.monthSales")}
                    </th>
                    <th className="hidden md:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {t("columns.target")}
                    </th>
                    <th className="hidden md:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {t("columns.monthlyAvg")}
                    </th>
                    <th className="hidden md:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {t("columns.prevMonth")}
                    </th>
                    <th className="hidden lg:table-cell text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {t("columns.prevYtd")}
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {t("columns.ytd")}
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 text-[13.5px] font-semibold text-cp-ink">
                      {t("columns.ytdPct")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.client_id}
                      className="border-b border-gray-100 dark:border-border hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm font-semibold truncate max-w-[180px]">
                        {item.client_name}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right font-semibold">
                        {formatMoney(item.ventas_mes, { hideDecimals: true })}
                      </td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span className="text-muted-foreground">
                            {formatMoney(item.meta, { hideDecimals: true })}
                          </span>
                          <PctBadge value={item.meta_pct} />
                        </div>
                      </td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span>{formatMoney(item.prom_mensual, { hideDecimals: true })}</span>
                          <PctBadge value={item.prom_mensual_pct} />
                        </div>
                      </td>
                      <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span>{formatMoney(item.mes_anterior, { hideDecimals: true })}</span>
                          <PctBadge value={item.mes_anterior_pct} />
                        </div>
                      </td>
                      <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right text-muted-foreground">
                        {formatMoney(item.ytd_anterior, { hideDecimals: true })}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right font-semibold">
                        {formatMoney(item.ytd_actual, { hideDecimals: true })}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-[13px] sm:text-sm text-right">
                        <RoiCell value={item.roi_ytd_pct} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(data?.total ?? 0) > PAGE_SIZE && (
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 px-2 sm:px-0 pt-4 pb-4 sm:pb-0">
                <p className="text-[13px] sm:text-sm text-muted-foreground">
                  {tTables("showingResults", {
                    from: (page - 1) * PAGE_SIZE + 1,
                    to: Math.min(page * PAGE_SIZE, data?.total ?? 0),
                    total: data?.total ?? 0
                  })}
                </p>
                <Pagination
                  current={page}
                  total={data?.total ?? 0}
                  pageSize={PAGE_SIZE}
                  onChange={setPage}
                  showSizeChanger={false}
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
