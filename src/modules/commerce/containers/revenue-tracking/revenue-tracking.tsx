"use client";

import React from "react";

import FiltersBar from "@/modules/commerce/components/revenue-tracking/filters-bar/filters-bar";
import StatCards from "@/modules/commerce/components/revenue-tracking/stat-cards/stat-cards";
import RevenueChart from "@/modules/commerce/components/revenue-tracking/revenue-chart/revenue-chart";
import TopSales from "@/modules/commerce/components/revenue-tracking/top-sales/top-sales";
import ProductTreemap from "@/modules/commerce/components/revenue-tracking/product-treemap/product-treemap";
import { DashboardBottomSection } from "@/modules/commerce/components/revenue-tracking/dashboard-bottom-section/dashboard-bottom-section";
import DashboardNotice from "@/modules/commerce/components/revenue-tracking/dashboard-notice/dashboard-notice";
import {
  RevenueTrackingProvider,
  useRevenueTracking
} from "@/modules/commerce/contexts/revenue-tracking-context";
import { useDashboardSalesKpis } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesKpis";
import { useAppStore } from "@/lib/store/store";
import { GILEAD_PROJECT_ID } from "@/utils/constants/globalConstants";

function RevenueTrackingInner() {
  // Theme (.dark class + AntD dark algorithm) is applied by ComercioLayout, an ancestor.
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const { filters, includeIva } = useRevenueTracking();
  // Los KPIs son la llamada que siempre se hace, así que sirven de semáforo del dashboard.
  // Comparte la key de SWR con StatCards, o sea que no agrega un request.
  const { error, isLoading, mutate } = useDashboardSalesKpis(filters, includeIva);

  // El back acota el dashboard a los grupos de clientes del usuario y responde 404 con el
  // motivo cuando no tiene ninguno. Se muestra su mensaje tal cual en vez de dejar las
  // tarjetas en "—", que se lee igual que "no hubo ventas".
  if (error && !isLoading) {
    return (
      <main className="space-y-6">
        <DashboardNotice message={error.message} onRetry={() => mutate()} />
      </main>
    );
  }

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

      {projectId === GILEAD_PROJECT_ID ? null : (
        <div className="w-full">
          <DashboardBottomSection />
        </div>
      )}
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
