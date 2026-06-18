import { useEffect, useState } from "react";
import { Flex, Modal, Select, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";

const { Title } = Typography;

// TODO: replace with real approval users from API
const MOCK_APPROVAL_USER_OPTIONS = [
  { value: 1, label: "Usuario aprobación 1" },
  { value: 2, label: "Usuario aprobación 2" }
];

interface ModalSendBalance2ApprovalProps {
  isOpen: boolean;
  onClose: () => void;
  record: IBalanceRow;
}

export function ModalSendBalanceToApproval({
  isOpen,
  onClose,
  record
}: ModalSendBalance2ApprovalProps) {
  const [approvalUserId, setApprovalUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) setApprovalUserId(null);
  }, [isOpen]);

  const handleOk = () => {
    // eslint-disable-next-line no-console
    console.log("Enviar a aprobación", { record, approvalUserId });
    onClose();
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={600}
      onCancel={onClose}
      title={<Title level={4}>Enviar a aprobación</Title>}
      footer={
        <FooterButtons
          titleConfirm="Enviar a aprobación"
          onClose={onClose}
          handleOk={handleOk}
          isConfirmDisabled={!approvalUserId}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="0.25rem" style={{ marginBottom: "1rem" }}>
        <h4 className="inputTitle">Usuario aprobación</h4>
        <Select
          placeholder="Selecciona el usuario de aprobación"
          style={{ width: "100%", height: 38 }}
          options={MOCK_APPROVAL_USER_OPTIONS}
          value={approvalUserId}
          onChange={(value) => setApprovalUserId(value)}
        />
      </Flex>
    </Modal>
  );
}
