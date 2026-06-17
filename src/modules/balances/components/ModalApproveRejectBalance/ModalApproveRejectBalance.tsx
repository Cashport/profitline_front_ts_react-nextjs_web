import { useEffect, useState } from "react";
import { Flex, Modal, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";

import styles from "./modalApproveRejectBalance.module.scss";

const { Title } = Typography;

export type BalanceDecisionAction = "approve" | "reject";

interface ModalApproveRejectBalanceProps {
  isOpen: boolean;
  onClose: () => void;
  record: IBalanceRow;
  action: BalanceDecisionAction;
}

export function ModalApproveRejectBalance({
  isOpen,
  onClose,
  record,
  action
}: ModalApproveRejectBalanceProps) {
  const [observations, setObservations] = useState("");

  useEffect(() => {
    if (!isOpen) setObservations("");
  }, [isOpen]);

  const title = action === "approve" ? "Aprobar" : "Rechazar";

  const handleOk = () => {
    // eslint-disable-next-line no-console
    console.log(title, { record, observations, action });
    onClose();
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
