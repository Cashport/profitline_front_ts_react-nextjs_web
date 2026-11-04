import { useEffect, useState } from "react";
import { Flex, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";
import {
  BalanceApprovalDecision,
  submitBalanceApprovalDecision
} from "@/services/balances/balances";
import { useMessageApi } from "@/context/MessageContext";

import styles from "./modalApproveRejectBalance.module.scss";

const { Title } = Typography;

export type BalanceDecisionAction = "approve" | "reject";

interface ModalApproveRejectBalanceProps {
  isOpen: boolean;
  onClose: () => void;
  record: IBalanceRow;
  action: BalanceDecisionAction;
  onUploaded?: () => void;
}

export function ModalApproveRejectBalance({
  isOpen,
  onClose,
  record,
  action,
  onUploaded
}: ModalApproveRejectBalanceProps) {
  const t = useTranslations("balances.decision");
  const { showMessage } = useMessageApi();
  const [observations, setObservations] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) setObservations("");
  }, [isOpen]);

  const title = action === "approve" ? t("approve") : t("reject");

  const handleOk = async () => {
    if (!observations) return;
    const decision: BalanceApprovalDecision = action === "approve" ? "APPROVED" : "REJECTED";
    setIsLoading(true);
    try {
      await submitBalanceApprovalDecision(record.id, decision, observations);
      showMessage("success", action === "approve" ? t("approved") : t("rejected"));
      onUploaded?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");
      showMessage("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={600}
      onCancel={onClose}
      title={<Title level={4}>{title}</Title>}
      footer={
        <FooterButtons
          titleConfirm={title}
          onClose={onClose}
          handleOk={handleOk}
          isConfirmDisabled={!observations}
          isConfirmLoading={isLoading}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="0.25rem" style={{ marginBottom: "1rem" }}>
        <h4 className="inputTitle">{t("observations")}</h4>
        <textarea
          className={styles.textarea}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder={t("observationsPlaceholder")}
          rows={4}
        />
      </Flex>
    </Modal>
  );
}
