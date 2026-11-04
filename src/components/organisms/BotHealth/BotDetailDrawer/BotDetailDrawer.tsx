import React, { useState } from "react";
import { Drawer, Flex, Typography, Button, Image as AntImage, Empty, Divider } from "antd";
import {
  Robot,
  User,
  MapPin,
  FileText,
  Clock,
  Warning,
  ArrowsClockwise,
  Repeat
} from "phosphor-react";
import Link from "next/link";
import { useTranslations } from "use-intl";

import ColumnText from "@/components/organisms/proveedores/components/ColumnText/ColumnText";
import { useMessageApi } from "@/context/MessageContext";
import { executeBotManually } from "@/services/bots/bots";
import { IBotHealth } from "@/types/bots/IBotHealth";
import { useConfirmBotExecution } from "@/hooks/useConfirmBotExecution";
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
  const t = useTranslations("botHealth");
  const { showMessage } = useMessageApi();
  const [executing, setExecuting] = useState(false);

  const handleExecute = async (selectedBot: IBotHealth) => {
    setExecuting(true);
    const success = await executeBotManually(selectedBot.schedule_id, showMessage);
    setExecuting(false);
    if (success) onExecuted?.();
  };
  const { requestExecution, confirmationModal } = useConfirmBotExecution(handleExecute);

  if (!bot) return null;

  // id_client_data siempre viene en BotStatusDTO: lleva a la ficha del cliente en
  // el módulo de Calidad de Datos, donde se gestionan sus ingestas/archivos.
  const clientHref = `/data-quality/client/${bot.id_client_data}`;

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
          title={t("fields.customer")}
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
          title={t("fields.country")}
          icon={<MapPin size={16} color="#7B7B7B" />}
          content={bot.pais || t("notAvailable")}
        />
        <ColumnText
          title={t("fields.fileType")}
          icon={<FileText size={16} color="#7B7B7B" />}
          content={bot.tipo_archivo || t("notAvailable")}
        />
        <ColumnText
          title={t("fields.frequency")}
          icon={<Repeat size={16} color="#7B7B7B" />}
          content={bot.periodicidad.length > 0 ? bot.periodicidad.join(", ") : t("notAvailable")}
        />
        <ColumnText
          title={t("fields.lastRun")}
          icon={<Clock size={16} color="#7B7B7B" />}
          content={bot.ultima_ejecucion || t("notAvailable")}
        />
        <ColumnText
          title={t("fields.runCount")}
          icon={<ArrowsClockwise size={16} color="#7B7B7B" />}
          content={String(bot.cantidad_ejecuciones)}
        />

        {bot.error_legible && (
          <>
            <Divider style={{ margin: "4px 0" }} />
            <ColumnText
              title={t("fields.errorMessage")}
              icon={<Warning size={16} color="#e7092b" />}
              content={bot.error_legible}
              contentStyle={{ color: "#e7092b" }}
            />
            {bot.categoria_error && (
              <ColumnText
                title={t("fields.category")}
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.categoria_error}
              />
            )}
            {bot.codigo_error && (
              <ColumnText
                title={t("fields.errorCode")}
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.codigo_error}
              />
            )}
            {bot.paso_fallido && (
              <ColumnText
                title={t("fields.failedStep")}
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.paso_fallido}
              />
            )}
            {bot.accion_requerida && (
              <ColumnText
                title={t("fields.requiredAction")}
                icon={<Warning size={16} color="#7B7B7B" />}
                content={bot.accion_requerida}
              />
            )}
          </>
        )}

        <Divider style={{ margin: "4px 0" }} />
        <Flex vertical gap={8}>
          <Text style={{ fontSize: 14, fontWeight: 500 }}>{t("drawer.evidence")}</Text>
          {bot.evidencia_url ? (
            <AntImage
              src={bot.evidencia_url}
              alt={t("drawer.evidenceAlt")}
              style={{ borderRadius: 8 }}
            />
          ) : (
            <Empty description={t("drawer.noEvidence")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Flex>

        <Divider style={{ margin: "4px 0" }} />
        <Button
          type="primary"
          icon={<ArrowsClockwise size={16} />}
          loading={executing}
          onClick={() => requestExecution(bot)}
        >
          {t("drawer.runBot")}
        </Button>
        {clientHref && (
          <Link href={clientHref}>
            <Button block>{t("drawer.goToCustomerSettings")}</Button>
          </Link>
        )}
      </Flex>
      {confirmationModal}
    </Drawer>
  );
};
