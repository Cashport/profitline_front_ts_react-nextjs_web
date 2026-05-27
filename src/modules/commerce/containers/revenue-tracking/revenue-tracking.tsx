"use client";

import React from "react";
import useSWR from "swr";
import { DollarSign, Package, Users, Clock, TrendingUp } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { getSalesDashboard } from "@/services/commerce/commerce";

import { Card, CardContent } from "@/modules/chat/ui/card";
import SalesTable from "@/modules/commerce/components/sales-dashboard/salesTable/salesTable";
import FiltersBar from "@/modules/commerce/components/revenue-tracking/filters-bar/filters-bar";
import StatCards from "@/modules/commerce/components/revenue-tracking/stat-cards/stat-cards";
import RevenueChart from "@/modules/commerce/components/revenue-tracking/revenue-chart/revenue-chart";
import TopSales from "@/modules/commerce/components/revenue-tracking/top-sales/top-sales";
import { RevenueTrackingProvider } from "@/modules/commerce/contexts/revenue-tracking-context";

export default function RevenueTracking() {
  const isMobile = false; // Replace with actual mobile detection logic if needed
  const { data: salesData, isLoading } = useSWR("/sales/dashboard", getSalesDashboard);
  const formatMoney = useAppStore((state) => state.formatMoney);

  // Handle loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando datos...</p>
      </main>
    );
  }

  // Handle error or no data state
  if (!salesData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>No hay datos disponibles</p>
      </main>
    );
  }

  const { total: iaTotal, seller_leaders } = salesData;

  return (
    <RevenueTrackingProvider>
      <main className={`space-y-6`}>
        <FiltersBar />
        <StatCards />
        <div className="grid grid-cols-1 xl:grid-cols-5 items-stretch gap-6">
          <div className="xl:col-span-3 min-h-[560px]">
            <RevenueChart />
          </div>
          <div className="xl:col-span-2 min-h-[560px]">
            <TopSales />
          </div>
        </div>
        <SalesTable seller_leaders={seller_leaders} iaTotal={iaTotal} />
      </main>
    </RevenueTrackingProvider>
  );
}
