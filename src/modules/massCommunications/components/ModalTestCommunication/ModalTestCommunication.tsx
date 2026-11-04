"use client";
import { useEffect, useState } from "react";
import { Modal, Button, Flex, Typography, Input } from "antd";
import { CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "use-intl";

const { Text } = Typography;

interface ModalTestCommunicationProps {
  isOpen: boolean;
  onClose: () => void;
  channel: "email" | "whatsapp";
}

export default function ModalTestCommunication({
  isOpen,
  onClose,
  channel
}: ModalTestCommunicationProps) {
  const t = useTranslations("massCommunications.testCommunication");
  const tCommon = useTranslations("common");
  const [testEmail, setTestEmail] = useState("");
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTestEmail("");
      setTestSent(false);
    }
  }, [isOpen]);

  const handleTestSend = () => {
    console.log(`Sending test ${channel} to:`, testEmail);
    setTestSent(true);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={t("title")}
      width={480}
      destroyOnClose
    >
      <Text type="secondary" className="block mb-4">
        {t("description")}
      </Text>

      <div className="mb-4">
        <Text strong className="block mb-2 text-[13px]">
          {t("testEmail")}
        </Text>
        <Input
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <Flex justify="end" gap={12}>
        <Button onClick={onClose}>{tCommon("actions.cancel")}</Button>
        <Button
          type="primary"
          onClick={handleTestSend}
          disabled={!testEmail.trim() || testSent}
          icon={testSent ? <CheckCircle2 size={16} /> : <Send size={16} />}
        >
          {testSent ? t("sent") : t("send")}
        </Button>
      </Flex>
    </Modal>
  );
}
