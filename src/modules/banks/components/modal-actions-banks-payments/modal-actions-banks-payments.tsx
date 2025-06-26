"use client";
import { Flex, Modal } from "antd";
import {
  PencilLine,
  User,
  CheckCircle,
  CirclesFour,
  FileArrowUp,
  ArrowsClockwise,
  ArrowDownLeft
} from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./modal-actions-banks-payments.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  setSelectOpen: (args: { selected: number }) => void;
}

const ModalActionsBanksPayments = ({ isOpen, onClose, setSelectOpen }: Props) => {
  const handleOpenModal = (type: number) => {
    setSelectOpen({
      selected: type
    });
  };
  return (
    <Modal
      className="modalActionsBanksPayments"
      width={686}
      open={isOpen}
      title={null}
      footer={null}
      onCancel={onClose}
    >
      <p className="modalActionsBanksPayments__description">
        Selecciona la acción que vas a realizar
      </p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(1);
          }}
          icon={<PencilLine size={16} />}
          title="Editar cliente"
        />
        <ButtonGenerateAction
          icon={<User size={16} />}
          title="Asignar cliente"
          onClick={() => {
            handleOpenModal(2);
          }}
        />
        <ButtonGenerateAction
          icon={<CheckCircle size={16} />}
          title="Aprobar asignación"
          onClick={() => {
            handleOpenModal(3);
          }}
        />
        <ButtonGenerateAction
          icon={<CirclesFour size={16} />}
          title="Fraccionar pago"
          onClick={() => {
            handleOpenModal(4);
          }}
        />
        <ButtonGenerateAction
          icon={<FileArrowUp size={16} />}
          title="Cargar tirilla"
          onClick={() => {
            handleOpenModal(5);
          }}
        />
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={16} />}
          title="Cambiar de estado"
          onClick={() => {
            handleOpenModal(6);
          }}
        />
        <ButtonGenerateAction
          icon={<ArrowDownLeft size={20} />}
          title="Marcar como sin identificar"
          onClick={() => {
            handleOpenModal(8);
          }}
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsBanksPayments;
