"use client";
import { Flex, Modal, Typography } from "antd";
import { ArrowsClockwise, Pencil, FileLock } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./modalGenerateActionProjectForm.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal: (type: number) => void;
  handleEditProject: () => void;
  statusForm: string;
}

export const ModalGenerateActionProjectForm = ({
  isOpen,
  onClose,
  handleOpenModal,
  handleEditProject,
  statusForm
}: Props) => {
  return (
    <Modal
      className="modalGenerateAction"
      width={"40%"}
      open={isOpen}
      centered
      title={
        <Title className="modalGenerateAction__title" level={4}>
          Generar acción
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <p className="modalGenerateAction__description">Selecciona la acción que vas a realizar</p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={16} />}
          title="Cambio de estado"
          onClick={() => {
            handleOpenModal(2);
          }}
        />
        <ButtonGenerateAction
          onClick={handleEditProject}
          icon={<Pencil size={16} />}
          title={statusForm === "edit" ? "Cancelar edición" : "Editar proyecto"}
        />
        <ButtonGenerateAction
          icon={<FileLock size={16} />}
          title="Cerrar periodo contable"
          onClick={() => {
            handleOpenModal(3);
          }}
        />
      </Flex>
    </Modal>
  );
};
