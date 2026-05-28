"use client";

import React from "react";
import useSWR from "swr";
import { ConfigProvider, theme as antdTheme } from "antd";

import { getSalesDashboard } from "@/services/commerce/commerce";
import {
  ISalesDashboardSellerLeader,
  ISalesDashboardTotal
} from "@/types/commerce/ICommerce";

import SalesTable from "@/modules/commerce/components/sales-dashboard/salesTable/salesTable";
import FiltersBar from "@/modules/commerce/components/revenue-tracking/filters-bar/filters-bar";
import StatCards from "@/modules/commerce/components/revenue-tracking/stat-cards/stat-cards";
import RevenueChart from "@/modules/commerce/components/revenue-tracking/revenue-chart/revenue-chart";
import TopSales from "@/modules/commerce/components/revenue-tracking/top-sales/top-sales";
import ProductTreemap from "@/modules/commerce/components/revenue-tracking/product-treemap/product-treemap";
import { DashboardBottomSection } from "@/modules/commerce/components/revenue-tracking/dashboard-bottom-section/dashboard-bottom-section";
import {
  RevenueTrackingProvider,
  useRevenueTracking
} from "@/modules/commerce/contexts/revenue-tracking-context";

interface RevenueTrackingInnerProps {
  seller_leaders: ISalesDashboardSellerLeader[];
  iaTotal: ISalesDashboardTotal;
}

function RevenueTrackingInner({ seller_leaders, iaTotal }: RevenueTrackingInnerProps) {
  const { resolvedTheme } = useRevenueTracking();
  const isDark = resolvedTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: "#CBE71E", fontFamily: "inherit" }
      }}
    >
      <main className={`space-y-6 ${isDark ? "dark" : ""}`}>
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

        {/* Secondary Info */}
        <div className="w-full">
          <ProductTreemap />
        </div>

        {/* Bottom Section with tabs */}
        <DashboardBottomSection />

        <SalesTable seller_leaders={seller_leaders} iaTotal={iaTotal} />
      </main>
    </ConfigProvider>
  );
}

export default function RevenueTracking() {
  const { data: salesData, isLoading } = useSWR("/sales/dashboard", getSalesDashboard);

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
      <RevenueTrackingInner seller_leaders={seller_leaders} iaTotal={iaTotal} />
    </RevenueTrackingProvider>
  );
}
