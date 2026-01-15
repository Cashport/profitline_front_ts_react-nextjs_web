import React from "react";
import { message, Modal } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import { ITask } from "../tasksTable/TasksTable";

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
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Selecciona la acción que vas a realizar"
      footer={null}
      onCancel={onClose}
      className="modalGenerateActionTaskManager"
      centered
    >
      <div className="modal-content">
        <ButtonGenerateAction
          icon={<MailOutlined size={20} />}
          title="Enviar correo"
          onClick={() => {
            if (!selectedRows || selectedRows.length === 0) {
              message.error("Debes seleccionar al menos una tarea");
              return;
            }
          }}
        />
        <ButtonGenerateAction
          icon={<PhoneOutlined size={16} />}
          title="Llamar"
          onClick={() => {
            if (!selectedRows || selectedRows.length === 0) {
              message.error("Debes seleccionar al menos una tarea");
              return;
            }
          }}
        />
      </div>
    </Modal>
  );
};
