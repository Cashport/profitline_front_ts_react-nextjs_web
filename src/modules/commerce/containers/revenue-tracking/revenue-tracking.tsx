"use client";

import React from "react";

import FiltersBar from "@/modules/commerce/components/revenue-tracking/filters-bar/filters-bar";
import StatCards from "@/modules/commerce/components/revenue-tracking/stat-cards/stat-cards";
import RevenueChart from "@/modules/commerce/components/revenue-tracking/revenue-chart/revenue-chart";
import TopSales from "@/modules/commerce/components/revenue-tracking/top-sales/top-sales";
import ProductTreemap from "@/modules/commerce/components/revenue-tracking/product-treemap/product-treemap";
import { DashboardBottomSection } from "@/modules/commerce/components/revenue-tracking/dashboard-bottom-section/dashboard-bottom-section";
import { RevenueTrackingProvider } from "@/modules/commerce/contexts/revenue-tracking-context";

function RevenueTrackingInner() {
  // Theme (.dark class + AntD dark algorithm) is applied by ComercioLayout, an ancestor.
  return (
    <main className="space-y-6">
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
  );
}

export default function RevenueTracking() {
  return (
    <RevenueTrackingProvider>
      <RevenueTrackingInner />
    </RevenueTrackingProvider>
  );
}
