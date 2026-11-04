import React, { useEffect, useState } from "react";
import { Button, Modal, Radio } from "antd";
import { CaretLeft } from "phosphor-react";
import { useTranslations } from "use-intl";

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

/** `label` es la clave en `balances.changeStatus.options`. */
const BALANCE_STATUS_OPTIONS = [
  { id: 5, code: "rejected", label: "novelty" },
  { id: 2, code: "pending_nc", label: "pendingCreditMemo" },
  { id: 10, code: "nc_created", label: "creditMemoCreated" }
] as const;

export const ModalChangeBalanceStatus: React.FC<Props> = ({
  isOpen,
  onClose,
  balanceIds,
  onSuccess
}) => {
  const t = useTranslations("balances.changeStatus");
  const tCommon = useTranslations("common");
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
      showMessage("success", t("success"));
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : tCommon("feedback.genericError");
      showMessage("error", errorMessage);
    }
    setLoading(false);
  };

  return (
    <Modal className={styles.wrapper} width="50%" open={isOpen} footer={null} closable={false}>
      <Button onClick={onClose} className={styles.content__header}>
        <CaretLeft size="1.25rem" />
        <span>{t("title")}</span>
      </Button>
      <div className={styles.content}>
        <p className={styles.content__description}>{t("description")}</p>

        <div className={styles.content__status}>
          <Radio.Group
            onChange={(e) => setSelectedStatusId(e.target.value)}
            value={selectedStatusId}
          >
            {BALANCE_STATUS_OPTIONS.map((status) => (
              <Radio className={styles.content__status__item} value={status.id} key={status.id}>
                {t(`options.${status.label}`)}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <FooterButtons
          handleOk={handleConfirm}
          onClose={onClose}
          titleConfirm={t("confirm")}
          isConfirmDisabled={!selectedStatusId}
          isConfirmLoading={loading}
        />
      </div>
    </Modal>
  );
};

export default ModalChangeBalanceStatus;
