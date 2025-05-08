import React, { useState } from "react";
import { User } from "@phosphor-icons/react";
import { Flex, Modal, Typography } from "antd";
import { Envelope, Files, MagnifyingGlass, Megaphone, Trash } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import ModalSendInvitation from "../ModalSendInvitation";

import { Document } from "../../Form/types";

const { Title } = Typography;

type ModalGenerateActionProps = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal?: (modalNumber: number) => void;
  selectedClientType?: number;
  selectedDocumentRows?: Document[];
};

export const ModalGenerateAction: React.FC<ModalGenerateActionProps> = ({
  isOpen,
  onClose,
  handleOpenModal,
  selectedClientType,
  selectedDocumentRows
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showMessage } = useMessageApi();

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
            onClick={() => {
              if (handleOpenModal) handleOpenModal(3);
            }}
          />
        )}

        <ButtonGenerateAction
          icon={<MagnifyingGlass size={20} />}
          title="Auditar requerimientos"
          onClick={() => {
            if (!selectedDocumentRows || selectedDocumentRows.length === 0) {
              return showMessage("error", "No hay documentos seleccionados para auditar.");
            }

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
    </Modal>
  );
};
