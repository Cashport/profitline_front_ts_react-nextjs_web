"use client";
import { Flex, Modal, Typography } from "antd";
import { Trash } from "@phosphor-icons/react";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal: (modalNumber: number) => void;
}

export const ModalGenerateActionApplyTab = ({ isOpen, onClose, handleOpenModal }: Props) => {
  return (
    <Modal
      className="modalGenerateActionApplyTab"
      open={isOpen}
      centered
      title={
        <Title className="modalGenerateActionApplyTab__title" level={4}>
          Generar acción
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <Flex vertical gap={12}>
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(4);
          }}
          icon={<Trash size={20} />}
          title="Eliminar filas"
        />
      </Flex>
    </Modal>
  );
};
