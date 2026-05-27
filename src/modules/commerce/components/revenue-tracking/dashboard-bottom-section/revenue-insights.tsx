"use client";

import {
  Sparkles,
  TrendingDown,
  Package,
  UserMinus,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export interface Insight {
  type: "sales_drop" | "stockout" | "low_performance" | "rebate_at_risk";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
}

const INSIGHT_ICONS = {
  sales_drop: <TrendingDown className="w-5 h-5 text-red-400" />,
  stockout: <Package className="w-5 h-5 text-amber-400" />,
  low_performance: <UserMinus className="w-5 h-5 text-purple-400" />,
  rebate_at_risk: <AlertTriangle className="w-5 h-5 text-orange-400" />
};

const INSIGHT_COLORS = {
  sales_drop: "border-red-500/20 bg-red-500/5",
  stockout: "border-amber-500/20 bg-amber-500/5",
  low_performance: "border-purple-500/20 bg-purple-500/5",
  rebate_at_risk: "border-orange-500/20 bg-orange-500/5"
};

interface RevenueInsightsProps {
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function RevenueInsights({ insights, isLoading, error, onRetry }: RevenueInsightsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4 animate-pulse min-h-[220px]"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-secondary rounded" />
              <div className="h-3 w-full bg-secondary rounded" />
            </div>
            <div className="mt-auto space-y-2 pt-4 border-t border-border">
              <div className="h-3 w-1/2 bg-secondary rounded" />
              <div className="h-10 w-full bg-secondary rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center min-h-[450px] text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mb-4" />
        <p className="text-foreground font-semibold mb-2">{error}</p>
        <button onClick={onRetry} className="text-sm text-primary hover:underline">
          Reintentar análisis
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`p-5 rounded-2xl border ${INSIGHT_COLORS[insight.type]} flex flex-col gap-4 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-500`}
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-background/50 border border-border">
              {INSIGHT_ICONS[insight.type]}
            </div>
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground bg-background/30 px-2 py-1 rounded-md border border-border">
              Análisis IA
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {insight.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
          </div>

          <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium tracking-tight">
                Impacto estimado
              </span>
              <span className="text-red-500 font-bold">{insight.impact}</span>
            </div>
            <div className="bg-background/40 p-3 rounded-xl border border-border">
              <div className="text-[10px] font-bold text-primary mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Acción Recomendada
              </div>
              <p className="text-xs text-foreground/90 leading-normal">{insight.recommendation}</p>
            </div>
          </div>

          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      ))}
    </div>
  );
}
