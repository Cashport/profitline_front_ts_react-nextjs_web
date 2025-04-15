import React, { useState } from "react";
import { Flex, Modal, Typography } from "antd";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { User } from "@phosphor-icons/react";
import { Envelope, Files, MagnifyingGlass, Megaphone, Trash } from "phosphor-react";
import ModalSendInvitation from "../ModalSendInvitation";
import { ModalAddRequirement } from "@/components/organisms/projects/RequirementsView/components/ModalAddRequirement/ModalAddRequirement";
const { Title } = Typography;
type ModalGenerateActionProps = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal?: (modalNumber: number) => void;
  selectedClientType?: number;
};

export const ModalGenerateAction: React.FC<ModalGenerateActionProps> = ({
  isOpen,
  onClose,
  handleOpenModal,
  selectedClientType
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAddRequirementOpen, setIsModalAddRequirementOpen] = useState(false);

  return (
    <Modal
      centered
      open={isOpen}
      onClose={onClose}
      title={<Title level={4}>Generar acción</Title>}
      footer={null}
      onCancel={onClose}
    >
      <Flex vertical gap={12}>
        {selectedClientType && (
          <ButtonGenerateAction
            icon={<Files size={20} />}
            title="Agregar requerimiento"
            onClick={() => setIsModalAddRequirementOpen(true)}
          />
        )}

        <ButtonGenerateAction
          icon={<MagnifyingGlass size={20} />}
          title="Auditar requerimientos"
          onClick={() => {
            console.log("auditar");

            if (handleOpenModal) handleOpenModal(2);
          }}
        />
        <ButtonGenerateAction icon={<User size={20} />} title="Crear cliente" onClick={() => {}} />
        <ButtonGenerateAction
          icon={<Trash size={20} />}
          title="Eliminar"
          onClick={() => {
            console.log("Aplicar pagos clicked");
          }}
        />
        <ButtonGenerateAction
          icon={<Megaphone size={20} />}
          title="Enviar recordatorio"
          onClick={() => {
            console.log("Cambiar de estado clicked");
          }}
        />
        <ButtonGenerateAction
          icon={<Envelope size={20} />}
          title="Enviar invitación"
          onClick={() => {
            setIsModalOpen(true);
          }}
        />
      </Flex>
      <ModalSendInvitation
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={() => {}}
      />
      {selectedClientType && (
        <ModalAddRequirement
          isOpen={isModalAddRequirementOpen}
          onClose={() => setIsModalAddRequirementOpen(false)}
          selectedClientType={selectedClientType}
        />
      )}
    </Modal>
  );
};
