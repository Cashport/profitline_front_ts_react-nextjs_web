"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Col, Row } from "antd";
import { Clock, TrendUp, Package, FileText, CalendarBlank } from "phosphor-react";
import { getProfit360DevolucionKpis } from "@/services/reverseLogistics/reverseLogistics";
import { DevolucionesStatCard } from "../DevolucionesStatCard/DevolucionesStatCard";
import { IProfit360DevolucionKpiFase } from "@/types/reverseLogistics/IReverseLogistics";

// Short labels for the known fase codigos — the backend `nombre`
// ("Fase 2 – Logística") is too long for a KPI card. Unknown codigos fall back
// to the backend name so new fases still render.
const FASE_LABELS: Record<string, string> = {
  F1_EMBALAJE_TICKET: "Prom Embalaje",
  F2_LOGISTICA: "Prom Logística",
  F3_BODEGA_INVENTARIO: "Prom Bodega",
  F4_NOTA_CREDITO: "Prom NC"
};

const CARD_ICONS = [Clock, TrendUp, Package, FileText, CalendarBlank];

interface StatCard {
  label: string;
  value: string;
  // Omitted for missing measures — "N/A días" reads wrong.
  suffix?: string;
}

interface DevolucionesStatsBarProps {
  clientId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
}

// A measure the backend didn't send (null / undefined / non-numeric) renders as
// "N/A" instead of a misleading 0.00.
const toCard = (label: string, n: number | null | undefined): StatCard =>
  typeof n === "number" && Number.isFinite(n)
    ? {
        label,
        value: n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        suffix: "días"
      }
    : { label, value: "N/A" };

export function DevolucionesStatsBar({ clientId, fromDate, toDate }: DevolucionesStatsBarProps) {
  const { data, isLoading } = useSWR(
    ["reverse-logistics/profit360-kpis-devolucion", clientId, fromDate, toDate] as const,
    () => getProfit360DevolucionKpis({ clientId, fromDate, toDate })
  );

  const stats = useMemo((): StatCard[] => {
    const fases: IProfit360DevolucionKpiFase[] = Object.keys(FASE_LABELS).map((f, i) => {
      const fase = FASE_LABELS[f];
      const dataFases = [...(data?.fases ?? [])].sort((a, b) => a.orden - b.orden);
      console.log(dataFases);
      const dataFase = dataFases.find((df) => df.codigo == f);
      if (dataFase) return dataFase;
      else
        return {
          codigo: f,
          nombre: fase,
          orden: i + 1,
          pasoOrigen: null,
          pasoDestino: null,
          promedioDias: null,
          minDias: null,
          maxDias: null,
          muestras: null
        };
    });

    const cards = fases.map((fase) =>
      toCard(FASE_LABELS[fase.codigo] ?? fase.nombre, fase.promedioDias)
    );
    // The backend total is the real end-to-end average, not the sum of per-fase
    // averages — if it's missing we show N/A rather than faking it.
    return [...cards, toCard("Total Días", data?.total?.promedioDias)];
  }, [data]);

  return (
    <div className="py-3">
      <Row gutter={8}>
        {stats.map((stat, idx) => {
          const Icon = CARD_ICONS[idx] ?? Clock;
          return (
            <Col flex="1" key={stat.label}>
              <DevolucionesStatCard
                title={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                loading={isLoading}
                icon={<Icon size={14} weight="bold" />}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
