import React, { useEffect, useState } from "react";
import { Button, Modal, Radio } from "antd";
import { CaretLeft } from "phosphor-react";

import { changeBalancesStatus } from "@/services/balances/balances";
import { useMessageApi } from "@/context/MessageContext";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import styles from "./modalChangeBalanceStatus.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  balanceIds: number[];
  onSuccess: () => void;
}

const BALANCE_STATUS_OPTIONS = [
  { id: 5, code: "rejected", label: "Novedad" },
  { id: 2, code: "pending_nc", label: "Pendiente NC" }
];

export const ModalChangeBalanceStatus: React.FC<Props> = ({
  isOpen,
  onClose,
  balanceIds,
  onSuccess
}) => {
  const { showMessage } = useMessageApi();

  const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedStatusId(undefined);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedStatusId) return;
    setLoading(true);
    try {
      await changeBalancesStatus(balanceIds, selectedStatusId);
      showMessage("success", "El estado de los saldos se actualizó correctamente.");
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ha ocurrido un error al cambiar el estado.";
      showMessage("error", errorMessage);
    }
    setLoading(false);
  };

  return (
    <Modal className={styles.wrapper} width="50%" open={isOpen} footer={null} closable={false}>
      <Button onClick={onClose} className={styles.content__header}>
        <CaretLeft size="1.25rem" />
        <span>Cambio de estado</span>
      </Button>
      <div className={styles.content}>
        <p className={styles.content__description}>Selecciona el nuevo estado del saldo</p>

        <div className={styles.content__status}>
          <Radio.Group
            onChange={(e) => setSelectedStatusId(e.target.value)}
            value={selectedStatusId}
          >
            {BALANCE_STATUS_OPTIONS.map((status) => (
              <Radio className={styles.content__status__item} value={status.id} key={status.id}>
                {status.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <FooterButtons
          handleOk={handleConfirm}
          onClose={onClose}
          titleConfirm="Cambiar de estado"
          isConfirmDisabled={!selectedStatusId}
          isConfirmLoading={loading}
        />
      </div>
    </Modal>
  );
};

export default ModalChangeBalanceStatus;
