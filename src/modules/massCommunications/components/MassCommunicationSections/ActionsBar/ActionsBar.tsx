"use client";
import { Button, Flex, Typography } from "antd";
import { FlaskConical, Eye } from "lucide-react";
import { useTranslations } from "use-intl";
import type { ChannelType } from "../ChannelSection/ChannelSection";

const { Text } = Typography;

interface ActionsBarProps {
  recipientCount: number;
  channel: ChannelType;
  canOpenPreview: boolean;
  onTestCommunication?: () => void;
  onPreviewAndSend: () => void;
}

export default function ActionsBar({
  recipientCount,
  channel,
  canOpenPreview,
  onTestCommunication,
  onPreviewAndSend
}: ActionsBarProps) {
  const t = useTranslations("massCommunications.actionsBar");
  return (
    <div className="sticky bottom-[-1rem] pt-2 pb-4 z-10 bg-[#F7F7F7]">
      <Flex align="center" justify="space-between" className="cp-card px-[18px] py-[14px]">
        <Text className="text-[13px]">
          {recipientCount > 0 ? (
            t.rich("recipientsVia", {
              count: recipientCount,
              channel: channel === "email" ? "Email" : "WhatsApp",
              b: (chunks) => <Text strong>{chunks}</Text>
            })
          ) : (
            <Text type="secondary">{t("selectRecipients")}</Text>
          )}
        </Text>

        <Flex gap={12}>
          {/* <Button
            onClick={onTestCommunication}
            disabled={!canOpenPreview}
            icon={<FlaskConical size={16} />}
          >
            Probar comunicacion
          </Button> */}
          <Button
            type="primary"
            onClick={onPreviewAndSend}
            disabled={!canOpenPreview}
            icon={<Eye size={16} />}
            className="!bg-[#CBE71E] !border-[#CBE71E] !text-[#141414] font-semibold hover:!bg-[#b8d119]"
          >
            {t("previewAndSend")}
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
