"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";

import { useIsMobile } from "@/modules/chat/hooks/use-mobile";
import { ClientsTable } from "./clients-table";
import { ClientDetailTable } from "./client-detail-table";
import { RevenueInsights, Insight } from "./revenue-insights";

type TabType =
  | "order-details"
  | "client-details"
  | "revenue-insights"
  | "gross-to-net"
  | "regional-vendedor";

const tabs = [
  { id: "order-details", label: "Detalles de orden" },
  { id: "client-details", label: "Detalle por cliente" },
  { id: "revenue-insights", label: "Insights de ingresos" },
  { id: "gross-to-net", label: "Bruto a neto" },
  { id: "regional-vendedor", label: "Regional/Vendedor" }
];

export function DashboardBottomSection() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabType>("order-details");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const insights: Insight[] = [];
  const isLoadingInsights = false;
  const insightsError: string | null = null;

  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label;

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        {isMobile ? (
          <div className="relative w-full">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">{activeTabLabel}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as TabType);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-4 text-sm font-bold transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary border-l-4 border-primary"
                          : "text-muted-foreground hover:bg-secondary/50 border-l-4 border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="inline-flex p-1 bg-secondary rounded-xl border border-border shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all relative tracking-wider ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-background border border-border shadow-sm rounded-lg" />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div key={activeTab} className="animate-in fade-in duration-200">
        {activeTab === "order-details" && <ClientsTable />}
        {activeTab === "client-details" && <ClientDetailTable />}
        {activeTab === "revenue-insights" && (
          <RevenueInsights
            insights={insights}
            isLoading={isLoadingInsights}
            error={insightsError}
            onRetry={() => {}}
          />
        )}
        {activeTab === "gross-to-net" && (
          <div className="bg-card border border-border rounded-2xl p-8 min-h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-xl font-medium mb-2">Gross to Net Analysis</p>
              <p className="text-sm">
                Financial bridge from gross sales to net revenue visualization.
              </p>
            </div>
          </div>
        )}
        {activeTab === "regional-vendedor" && (
          <div className="bg-card border border-border rounded-2xl p-8 min-h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-xl font-medium mb-2">Regional / Vendedor</p>
              <p className="text-sm">
                Análisis comparativo por región y vendedor — próximamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
