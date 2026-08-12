"use client";

import { useMemo } from "react";
import { Col, Row } from "antd";
import { Clock, TrendUp, Package, FileText, CalendarBlank } from "phosphor-react";
import { ReturnRow } from "@/types/reverseLogistics/IReverseLogistics";
import { DevolucionesStatCard } from "../DevolucionesStatCard/DevolucionesStatCard";

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

const CARD_ICONS = [Clock, TrendUp, Package, FileText, CalendarBlank];

interface StatCard {
  label: string;
  value: string;
}

interface DevolucionesStatsBarProps {
  returns: ReturnRow[];
  loading?: boolean;
}

export function DevolucionesStatsBar({ returns, loading }: DevolucionesStatsBarProps) {
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
    <div className="py-3">
      <Row gutter={8}>
        {stats.map((stat, idx) => {
          const Icon = CARD_ICONS[idx];
          return (
            <Col flex="1" key={stat.label}>
              <DevolucionesStatCard
                title={stat.label}
                value={stat.value}
                suffix="días"
                loading={loading}
                icon={<Icon size={14} weight="bold" />}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
