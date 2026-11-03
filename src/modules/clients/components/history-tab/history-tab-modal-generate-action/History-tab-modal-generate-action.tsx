"use client";
import { Flex, Modal } from "antd";
import { X } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./history-tab-modal-generate-action.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  setSelectOpen: (args: { selected: number }) => void;
}

const ModalActionsHistoryTab = ({ isOpen, onClose, setSelectOpen }: Props) => {
  const t = useTranslations("clients.history.generateAction");
  const handleOpenModal = (type: number) => {
    setSelectOpen({
      selected: type
    });
  };
  return (
    <Modal
      className="modalActionsHistoryTab"
      width={686}
      open={isOpen}
      title={null}
      footer={null}
      onCancel={onClose}
    >
      <p className="modalActionsHistoryTab__description">{t("description")}</p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(2);
          }}
          icon={<X size={16} />}
          title={t("voidPayment")}
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsHistoryTab;
