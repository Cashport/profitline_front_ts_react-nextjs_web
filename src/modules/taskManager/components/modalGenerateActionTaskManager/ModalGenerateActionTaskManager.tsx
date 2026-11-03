import React from "react";
import { message, Modal } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useTranslations } from "use-intl";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import { ITask } from "@/types/tasks/ITasks";

import "./modalGenerateActionTaskManager.scss";

type ModalActionPaymentProps = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal: (selected: number) => void;
  selectedRows?: ITask[];
};

export const ModalGenerateActionTaskManager: React.FC<ModalActionPaymentProps> = ({
  isOpen,
  onClose,
  selectedRows
}) => {
  const t = useTranslations("taskManager.generateAction");
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("title")}
      footer={null}
      onCancel={onClose}
      className="modalGenerateActionTaskManager"
      centered
    >
      <div className="modal-content">
        <ButtonGenerateAction
          icon={<MailOutlined size={20} />}
          title={t("sendEmail")}
          onClick={() => {
            if (!selectedRows || selectedRows.length === 0) {
              message.error(t("selectTask"));
              return;
            }
          }}
        />
        <ButtonGenerateAction
          icon={<PhoneOutlined size={16} />}
          title={t("call")}
          onClick={() => {
            if (!selectedRows || selectedRows.length === 0) {
              message.error(t("selectTask"));
              return;
            }
          }}
        />
      </div>
    </Modal>
  );
};
