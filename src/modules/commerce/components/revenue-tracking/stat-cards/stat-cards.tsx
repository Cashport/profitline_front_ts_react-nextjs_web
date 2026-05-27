"use client";

import { DollarSign, Tag, Package, TrendingUp, TrendingDown } from "lucide-react";

export default function StatCards() {
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
      value: "$15.487.287.011",
      subtitle: "vs Goal to date",
      trend: "12.5%",
      isPositive: true,
      icon: DollarSign
    },
    {
      title: "Avg Ticket",
      value: "$15.487.287.011",
      subtitle: "vs Goal to date",
      trend: "8.2%",
      isPositive: true,
      icon: Tag
    },
    {
      title: "Total Sales",
      value: "1.487",
      subtitle: "vs Goal to date",
      trend: "2.4%",
      isPositive: false,
      icon: Package
    },
    {
      title: "Unique Customers",
      value: "346",
      subtitle: "vs Goal to date",
      trend: "5.1%",
      isPositive: true,
      icon: Package
    },
    {
      title: "Orders in process",
      value: "$ 14.500.200",
      subtitle: "En proceso de fact.",
      badge: "84 Unid"
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
