"use client";
import { Button, Flex, Typography } from "antd";
import { FlaskConical, Eye } from "lucide-react";
import type { ChannelType } from "../ChannelSection/ChannelSection";

const { Text } = Typography;

interface ActionsBarProps {
  recipientCount: number;
  channel: ChannelType;
  canOpenPreview: boolean;
  onTestCommunication: () => void;
  onPreviewAndSend: () => void;
}

export default function ActionsBar({
  recipientCount,
  channel,
  canOpenPreview,
  onTestCommunication,
  onPreviewAndSend
}: ActionsBarProps) {
  return (
    <div className="sticky bottom-0 pt-2 pb-4 z-10 bg-[#F7F7F7]">
      <Flex
        align="center"
        justify="space-between"
        className="bg-white border border-[#DDDDDD] rounded-lg p-4 shadow-sm"
      >
        <Text className="text-[13px]">
          {recipientCount > 0 ? (
            <>
              <Text strong>{recipientCount}</Text> destinatarios via{" "}
              <Text strong>{channel === "email" ? "Email" : "WhatsApp"}</Text>
            </>
          ) : (
            <Text type="secondary">Selecciona destinatarios para continuar</Text>
          )}
        </Text>

        <Flex gap={12}>
          <Button
            onClick={onTestCommunication}
            disabled={!canOpenPreview}
            icon={<FlaskConical size={16} />}
          >
            Probar comunicacion
          </Button>
          <Button
            type="primary"
            onClick={onPreviewAndSend}
            disabled={!canOpenPreview}
            icon={<Eye size={16} />}
            className="!bg-[#CBE71E] !border-[#CBE71E] !text-[#141414] font-semibold hover:!bg-[#b8d119]"
          >
            Vista previa y enviar
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
