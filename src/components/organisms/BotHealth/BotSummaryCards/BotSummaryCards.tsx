import React from "react";
import { KpiCard } from "@/components/ui/kpi-card/kpi-card";

import { IBotHealthSummary } from "@/types/bots/IBotHealth";
import { BOT_STATUS_MAP } from "../botStatusMap";

interface BotSummaryCardsProps {
  summary?: IBotHealthSummary;
  loading?: boolean;
}

interface SummaryItem {
  label: string;
  value: number | undefined;
  color: string;
}

// No existe en Cashport un componente de "cards de resumen por conteo" reutilizable
// (se buscó en dashboard, gestor-tareas y cashportMobile). Se usa Card + Flex de antd,
// ya presentes en el proyecto, en vez de introducir una librería o un diseño nuevo.
// El total y los conteos por estado SOLO se muestran si backend los envía en `summary`
// (IBotHealthSummary): no se derivan de los datos de la página actual porque con
// paginación server-side eso mostraría conteos parciales e incorrectos.
export const BotSummaryCards: React.FC<BotSummaryCardsProps> = ({ summary, loading }) => {
  const items: SummaryItem[] = [
    { label: "Total de bots", value: summary?.total, color: "#141414" },
    { label: "Operativo", value: summary?.operativo, color: BOT_STATUS_MAP["Operativo"].color },
    { label: "Con fallas", value: summary?.con_fallas, color: BOT_STATUS_MAP["Con fallas"].color },
    {
      label: "En revisión",
      value: summary?.en_revision,
      color: BOT_STATUS_MAP["En revisión"].color
    },
    { label: "Ejecutando", value: summary?.ejecutando, color: BOT_STATUS_MAP["Ejecutando"].color }
  ];

  return (
    <div className="cp-card-row">
      {items.map((item) => (
        <KpiCard key={item.label} loading={loading} className="flex-[1_1_180px]">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="truncate text-[13px] text-cp-ink-3">{item.label}</span>
            <span
              className="text-[26px] font-semibold leading-none tracking-[-0.6px]"
              style={{ color: item.color }}
            >
              {item.value ?? "—"}
            </span>
          </div>
        </KpiCard>
      ))}
    </div>
  );
};
