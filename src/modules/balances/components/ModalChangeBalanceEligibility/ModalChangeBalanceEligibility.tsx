import React, { useEffect, useState } from "react";
import { Button, Modal, Radio } from "antd";
import { CaretLeft } from "phosphor-react";

import {
  changeBalanceEligibility,
  getEligibilityStatuses,
  EligibilityStatusOption
} from "@/services/balances/balances";
import { useMessageApi } from "@/context/MessageContext";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import styles from "./modalChangeBalanceEligibility.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  balanceIds: number[];
  onSuccess: () => void;
}

export const ModalChangeBalanceEligibility: React.FC<Props> = ({
  isOpen,
  onClose,
  balanceIds,
  onSuccess
}) => {
  const { showMessage } = useMessageApi();

  const [eligibilityStatuses, setEligibilityStatuses] = useState<EligibilityStatusOption[]>([]);
  const [selectedEligibilityId, setSelectedEligibilityId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setEligibilityStatuses(await getEligibilityStatuses());
      } catch (error) {
        console.error("Error fetching eligibility statuses", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectedEligibilityId(undefined);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedEligibilityId) return;
    setLoading(true);
    try {
      await changeBalanceEligibility(balanceIds, Number(selectedEligibilityId));
      showMessage("success", "La procedencia de los saldos se actualizó correctamente.");
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ha ocurrido un error al cambiar la procedencia.";
      showMessage("error", errorMessage);
    }
    setLoading(false);
  };

  return (
    <Modal className={styles.wrapper} width="50%" open={isOpen} footer={null} closable={false}>
      <Button onClick={onClose} className={styles.content__header}>
        <CaretLeft size="1.25rem" />
        <span>Cambio de procedencia</span>
      </Button>
      <div className={styles.content}>
        <p className={styles.content__description}>Selecciona la nueva procedencia del saldo</p>

        <div className={styles.content__status}>
          <Radio.Group
            onChange={(e) => setSelectedEligibilityId(e.target.value)}
            value={selectedEligibilityId}
          >
            {eligibilityStatuses.map((status) => (
              <Radio
                className={styles.content__status__item}
                value={String(status.id)}
                key={status.id}
              >
                {status.description}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <FooterButtons
          handleOk={handleConfirm}
          onClose={onClose}
          titleConfirm="Cambiar procedencia"
          isConfirmDisabled={!selectedEligibilityId}
          isConfirmLoading={loading}
        />
      </div>
    </Modal>
  );
};

export default ModalChangeBalanceEligibility;
