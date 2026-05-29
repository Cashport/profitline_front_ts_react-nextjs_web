"use client";

import React from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

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

function RevenueTrackingInner() {
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

        <div className="w-full">
          <ProductTreemap />
        </div>

        <DashboardBottomSection />
      </main>
    </ConfigProvider>
  );
}

export default function RevenueTracking() {
  return (
    <RevenueTrackingProvider>
      <RevenueTrackingInner />
    </RevenueTrackingProvider>
  );
}
