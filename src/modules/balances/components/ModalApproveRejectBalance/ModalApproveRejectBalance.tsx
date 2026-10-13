import { useEffect, useState } from "react";
import { Flex, Modal, Typography } from "antd";

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
  const { showMessage } = useMessageApi();
  const [observations, setObservations] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) setObservations("");
  }, [isOpen]);

  const title = action === "approve" ? "Aprobar" : "Rechazar";

  const handleOk = async () => {
    if (!observations) return;
    const decision: BalanceApprovalDecision = action === "approve" ? "APPROVED" : "REJECTED";
    setIsLoading(true);
    try {
      await submitBalanceApprovalDecision(record.id, decision, observations);
      showMessage(
        "success",
        action === "approve" ? "Saldo aprobado correctamente" : "Saldo rechazado correctamente"
      );
      onUploaded?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error al procesar la decisión";
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
        <h4 className="inputTitle">Observaciones</h4>
        <textarea
          className={styles.textarea}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Ingresar observaciones"
          rows={4}
        />
      </Flex>
    </Modal>
  );
}
