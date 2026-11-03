import React, { useEffect, useState } from "react";
import { Button, Modal, Radio } from "antd";
import { CaretLeft } from "phosphor-react";
import { useTranslations } from "use-intl";

import { changeTaskStatus } from "@/services/tasks/tasks";
import { useMessageApi } from "@/context/MessageContext";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import styles from "./modalChangeTaskStatus.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  onSuccess?: () => void;
}

const TASK_STATUS_OPTIONS = [
  { id: "6d5ee261-8e77-11f0-b08c-0635ef5156a1", labelKey: "completed" },
  { id: "b2bbe2c2-d542-11f0-80fa-06e6795ff363", labelKey: "spam" },
  { id: "c3a7f8d4-8e77-11f0-b08c-0635ef5156a1", labelKey: "dispute" }
] as const;

export const ModalChangeTaskStatus: React.FC<Props> = ({ isOpen, onClose, taskId, onSuccess }) => {
  const t = useTranslations("taskManager.changeStatus");
  const { showMessage } = useMessageApi();

  const [selectedStatusId, setSelectedStatusId] = useState<string | undefined>();
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
      await changeTaskStatus(taskId, selectedStatusId);
      showMessage("success", t("success"));
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("error");
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
            {TASK_STATUS_OPTIONS.map((status) => (
              <Radio className={styles.content__status__item} value={status.id} key={status.id}>
                {t(`options.${status.labelKey}`)}
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

export default ModalChangeTaskStatus;
