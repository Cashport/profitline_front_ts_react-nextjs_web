import React, { useState } from "react";
import { Drawer, Flex, Typography, Button, Image as AntImage, Empty, Divider } from "antd";
import { Robot, User, MapPin, FileText, Clock, Warning, ArrowsClockwise, Repeat } from "phosphor-react";
import Link from "next/link";

import ColumnText from "@/components/organisms/proveedores/components/ColumnText/ColumnText";
import { useMessageApi } from "@/context/MessageContext";
import { executeBotManually } from "@/services/bots/bots";
import { IBotHealth } from "@/types/bots/IBotHealth";
import { BotStatusBadge } from "../BotStatusBadge/BotStatusBadge";

const { Title, Text } = Typography;

interface BotDetailDrawerProps {
  bot: IBotHealth | null;
  visible: boolean;
  onClose: () => void;
  onExecuted?: () => void;
}

// Reutiliza: Drawer de antd (mismo tipo de componente que DrawerComponent de proveedores),
// ColumnText (mismo componente de pares icono/titulo/contenido de proveedores) y
// BotStatusBadge (badge de estado propio de este módulo, ver botStatusMap.tsx).
export const BotDetailDrawer: React.FC<BotDetailDrawerProps> = ({
  bot,
  visible,
  onClose,
  onExecuted
}) => {
  const { showMessage } = useMessageApi();
  const [executing, setExecuting] = useState(false);

  if (!bot) return null;

  // id_client_data siempre viene en BotStatusDTO: lleva a la ficha del cliente en
  // el módulo de Calidad de Datos, donde se gestionan sus ingestas/archivos.
  const clientHref = `/data-quality/client/${bot.id_client_data}`;

  const handleExecute = async () => {
    setExecuting(true);
    const success = await executeBotManually(bot.schedule_id, showMessage);
    setExecuting(false);
    if (success) onExecuted?.();
  };

  return (
    <Drawer
      title={
        <Flex vertical gap={8}>
          <BotStatusBadge estado={bot.estado} />
          <Flex gap={8} align="center">
            <Robot size={20} />
            <Title level={4} style={{ margin: 0 }}>
              {bot.bot}
            </Title>
          </Flex>
        </Flex>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={480}
    >
      <Flex vertical gap={16}>
        <ColumnText
          title="Cliente"
          icon={<User size={16} color="#7B7B7B" />}
          content={
            clientHref ? (
              <Link href={clientHref} style={{ color: "#0085ff" }}>
                {bot.cliente}
              </Link>
            ) : (
              bot.cliente
            )
          }
        />
        <ColumnText
          title="País"
          icon={<MapPin size={16} color="#7B7B7B" />}
          content={bot.pais || "No disponible"}
        />
        <ColumnText
          title="Tipo de archivo"
          icon={<FileText size={16} color="#7B7B7B" />}
          content={bot.tipo_archivo || "No disponible"}
        />
        <ColumnText
          title="Periodicidad"
          icon={<Repeat size={16} color="#7B7B7B" />}
          content={bot.periodicidad.length > 0 ? bot.periodicidad.join(", ") : "No disponible"}
        />
        <ColumnText
          title="Última ejecución"
          icon={<Clock size={16} color="#7B7B7B" />}
          content={bot.ultima_ejecucion || "No disponible"}
        />
        <ColumnText
          title="Cantidad de ejecuciones"
          icon={<ArrowsClockwise size={16} color="#7B7B7B" />}
          content={String(bot.cantidad_ejecuciones)}
        />

        {bot.error_legible && (
          <>
            <Divider style={{ margin: "4px 0" }} />
            <ColumnText
              title="Mensaje de error"
              icon={<Warning size={16} color="#e7092b" />}
              content={bot.error_legible}
              contentStyle={{ color: "#e7092b" }}
            />
            {bot.categoria_error && (
              <ColumnText
                title="Categoría"
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.categoria_error}
              />
            )}
            {bot.codigo_error && (
              <ColumnText
                title="Código de error"
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.codigo_error}
              />
            )}
            {bot.paso_fallido && (
              <ColumnText
                title="Paso fallido"
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.paso_fallido}
              />
            )}
            {bot.accion_requerida && (
              <ColumnText
                title="Acción requerida"
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.accion_requerida}
              />
            )}
          </>
        )}

        <Divider style={{ margin: "4px 0" }} />
        <Flex vertical gap={8}>
          <Text style={{ fontSize: 14, fontWeight: 500 }}>
            Evidencia
          </Text>
          {bot.evidencia_url ? (
            <AntImage src={bot.evidencia_url} alt="Evidencia del error" style={{ borderRadius: 8 }} />
          ) : (
            <Empty description="Sin evidencia disponible" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Flex>

        <Divider style={{ margin: "4px 0" }} />
        <Button
          type="primary"
          icon={<ArrowsClockwise size={16} />}
          loading={executing}
          onClick={handleExecute}
        >
          Ejecutar bot
        </Button>
        {clientHref && (
          <Link href={clientHref}>
            <Button block>Ir a configuración del cliente</Button>
          </Link>
        )}
      </Flex>
    </Drawer>
  );
};
