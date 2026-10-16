import React from "react";
import { Card, Flex, Typography } from "antd";

import { IBotHealthSummary } from "@/types/bots/IBotHealth";
import { BOT_STATUS_MAP } from "../botStatusMap";

const { Text, Title } = Typography;

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
    { label: "En revisión", value: summary?.en_revision, color: BOT_STATUS_MAP["En revisión"].color },
    { label: "Ejecutando", value: summary?.ejecutando, color: BOT_STATUS_MAP["Ejecutando"].color }
  ];

  return (
    <Flex gap="1rem" wrap="wrap">
      {items.map((item) => (
        <Card key={item.label} loading={loading} style={{ flex: 1, minWidth: 180, borderRadius: 8 }}>
          <Flex vertical gap={4}>
            <Text style={{ color: "#8c8c8c", fontSize: 14 }}>{item.label}</Text>
            <Title level={3} style={{ margin: 0, color: item.color }}>
              {item.value ?? "—"}
            </Title>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};
