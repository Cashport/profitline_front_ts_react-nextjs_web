import React from "react";
import { Modal } from "antd";
import "./modalConfirmAction.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  title: string;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okLoading?: boolean;
  cancelLoading?: boolean;
}

export const ModalConfirmAction = ({
  isOpen,
  onClose,
  onOk,
  onCancel,
  title,
  content,
  okText = "Aceptar",
  cancelText = "Cancelar",
  okLoading,
  cancelLoading
}: Props) => {
  return (
    <Modal
      className="ModalConfirmAction"
      width={"50%"}
      open={isOpen}
      onCancel={onClose}
      okButtonProps={{ className: "acceptButton", loading: okLoading }}
      okText={okText}
      cancelButtonProps={{
        className: "cancelButton",
        onClick: onCancel,
        loading: cancelLoading
      }}
      cancelText={cancelText}
      title={title}
      onOk={onOk}
    >
      {content}
    </Modal>
  );
};
