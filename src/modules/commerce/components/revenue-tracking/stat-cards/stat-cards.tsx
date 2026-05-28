"use client";

import { DollarSign, Tag, Package, TrendingUp, TrendingDown } from "lucide-react";

import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import { useDashboardSalesKpis } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesKpis";
import { formatCurrencyMoney, formatNumber } from "@/utils/utils";
import type { IKpiMetric } from "@/types/dashboardSales/IDashboardSales";

const PLACEHOLDER = "—";

const metricTrend = (metric?: IKpiMetric) => {
  const pct = metric?.vs_goal_pct;
  if (pct === null || pct === undefined) return {};
  return { trend: `${Math.abs(pct)}%`, isPositive: pct >= 0 };
};

export default function StatCards() {
  const { filters } = useRevenueTracking();
  const { data } = useDashboardSalesKpis(filters);

  const stats: Array<{
    title: string;
    value: string;
    subtitle: string;
    trend?: string;
    isPositive?: boolean;
    isAlert?: boolean;
    icon?: React.ElementType;
    badge?: string;
  }> = [
    {
      title: "Total Revenue",
      value: data ? formatCurrencyMoney(data.total_revenue.value) : PLACEHOLDER,
      subtitle: "vs Goal to date",
      icon: DollarSign,
      ...metricTrend(data?.total_revenue)
    },
    {
      title: "Avg Ticket",
      value: data ? formatCurrencyMoney(data.avg_ticket.value) : PLACEHOLDER,
      subtitle: "vs Goal to date",
      icon: Tag,
      ...metricTrend(data?.avg_ticket)
    },
    {
      title: "Total Sales",
      value: data ? formatNumber(data.total_orders.value) : PLACEHOLDER,
      subtitle: "vs Goal to date",
      icon: Package,
      ...metricTrend(data?.total_orders)
    },
    {
      title: "Unique Customers",
      value: data ? formatNumber(data.unique_customers.value) : PLACEHOLDER,
      subtitle: "vs Goal to date",
      icon: Package,
      ...metricTrend(data?.unique_customers)
    },
    {
      title: "Orders in process",
      value: data ? formatCurrencyMoney(data.orders_in_process.value) : PLACEHOLDER,
      subtitle: "En proceso de fact.",
      badge: data ? `${data.orders_in_process.count} Unid` : undefined
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col hover:bg-card/90 transition-all duration-300 min-h-[160px]"
        >
          <div className="flex items-start justify-between mb-auto">
            <h3 className="text-base font-semibold text-muted-foreground pr-2 leading-snug">
              {stat.title}
            </h3>
            <div className="shrink-0">
              {stat.icon ? (
                <stat.icon className="w-7 h-7 text-[#FF6B00]" strokeWidth={1.5} />
              ) : stat.badge ? (
                <div className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 text-xs font-bold px-2 py-1 rounded-md leading-none flex items-center shadow-sm">
                  {stat.badge}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-start text-left mt-6">
            <span className="text-2xl font-bold tracking-tight text-foreground leading-none mb-3">
              {stat.value}
            </span>
            <div className="flex items-center gap-2">
              {stat.trend && (
                <div
                  className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    stat.isAlert
                      ? "bg-[#FF6B00]/20 text-[#FF6B00] dark:text-[#FF6B00]"
                      : stat.isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {stat.isAlert ? null : stat.isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  {stat.trend}
                </div>
              )}
              <span className="text-sm text-muted-foreground font-medium opacity-80 whitespace-nowrap">
                {stat.subtitle}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
