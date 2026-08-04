"use client";

import { useMemo } from "react";
import { Clock, TrendingUp, Package, FileText, CalendarDays } from "lucide-react";
import { IReturn } from "@/types/reverseLogistics/IReverseLogistics";

/**
 * Maps estados to the 4 processing-stage groups. Días are mocked as average
 * business-days per group (in a real app these come from estado-transition timestamps).
 */
const STAGE_GROUPS = {
  logistica: ["Visita programada", "Visita en curso"],
  solistica: ["En aprobación", "Demora de aprobación", "Aprobado / Rechazado", "Red generada"],
  suppla: ["Recogido", "Entregado"],
  nc: ["Movimiento Odoo", "Contabilización de NC"]
} as const;

const MOCK_DAYS_PER_STATUS: Record<string, number> = {
  "Visita programada": 1.2,
  "Visita en curso": 1.1,
  "En aprobación": 3.4,
  "Demora de aprobación": 7.8,
  "Aprobado / Rechazado": 2.1,
  "Red generada": 1.5,
  Recogido: 2.0,
  Entregado: 1.8,
  "Movimiento Odoo": 3.2,
  "Contabilización de NC": 4.1
};

const CARD_ICONS = [Clock, TrendingUp, Package, FileText, CalendarDays];

interface StatCard {
  label: string;
  value: string;
}

interface DevolucionesStatsBarProps {
  returns: IReturn[];
}

export function DevolucionesStatsBar({ returns }: DevolucionesStatsBarProps) {
  const stats = useMemo((): StatCard[] => {
    const avgForGroup = (statuses: readonly string[]): number => {
      const relevant = returns.filter((d) => (statuses as string[]).includes(d.estado));
      if (relevant.length === 0) return 0;
      const total = relevant.reduce((sum, d) => sum + (MOCK_DAYS_PER_STATUS[d.estado] ?? 0), 0);
      return total / relevant.length;
    };

    const promLogistica = avgForGroup(STAGE_GROUPS.logistica);
    const promSolistica = avgForGroup(STAGE_GROUPS.solistica);
    const promSuppla = avgForGroup(STAGE_GROUPS.suppla);
    const promNC = avgForGroup(STAGE_GROUPS.nc);
    const totalDias = promLogistica + promSolistica + promSuppla + promNC;

    const fmt = (n: number) =>
      n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return [
      { label: "Prom Logística", value: fmt(promLogistica) },
      { label: "Prom Solística", value: fmt(promSolistica) },
      { label: "Prom Suppla", value: fmt(promSuppla) },
      { label: "Prom NC", value: fmt(promNC) },
      { label: "Total Días", value: fmt(totalDias) }
    ];
  }, [returns]);

  return (
    <div className="flex bg-white overflow-hidden border-b border-gray-200">
      {stats.map((stat, idx) => {
        const Icon = CARD_ICONS[idx];
        return (
          <div
            key={stat.label}
            className={`flex-1 flex flex-col gap-2 px-5 py-4 ${
              idx < stats.length - 1 ? "border-r border-gray-100" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {stat.label}
              </span>
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-cashport-green">
                <Icon className="w-3.5 h-3.5 text-gray-800" strokeWidth={2.5} />
              </span>
            </div>
            <span className="text-2xl font-bold tabular-nums text-gray-900 leading-none">
              {stat.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
