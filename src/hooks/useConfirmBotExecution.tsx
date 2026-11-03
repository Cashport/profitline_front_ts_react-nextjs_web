"use client";

import { useTranslations } from "use-intl";
import { useRef, useState } from "react";
import { Modal, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

export function useConfirmBotExecution<T extends { bot: string }>(
  onExecute: (bot: T) => Promise<void>
) {
  const t = useTranslations("shared.confirmBotExecution");
  const tCommon = useTranslations("common");
  const [pendingBot, setPendingBot] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const requestExecution = (bot: T) => {
    if (!submittingRef.current) setPendingBot(bot);
  };

  const closeConfirmation = () => {
    if (!submittingRef.current) setPendingBot(null);
  };

  const confirmExecution = async () => {
    if (!pendingBot || submittingRef.current) return;
    // El ref bloquea un segundo clic incluso antes del siguiente render.
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onExecute(pendingBot);
    } finally {
      setPendingBot(null);
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const confirmationModal = (
    <Modal
      open={pendingBot !== null}
      title={t("title")}
      centered
      width={480}
      onCancel={closeConfirmation}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      footer={
        <FooterButtons
          titleCancel={tCommon("actions.cancel")}
          titleConfirm={t("confirm")}
          onClose={closeConfirmation}
          handleOk={confirmExecution}
          isConfirmDisabled={isSubmitting}
          isConfirmLoading={isSubmitting}
        />
      }
    >
      <Typography.Paragraph>{t("question")}</Typography.Paragraph>
      <Typography.Paragraph style={{ overflowWrap: "anywhere" }}>
        <Typography.Text strong>{t("botLabel")} </Typography.Text>
        {pendingBot?.bot}
      </Typography.Paragraph>
    </Modal>
  );

  return { requestExecution, confirmationModal };
}
