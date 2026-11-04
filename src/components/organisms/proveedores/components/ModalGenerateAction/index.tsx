import React, { useState } from "react";
import { User } from "@phosphor-icons/react";
import { Flex, Modal, Typography } from "antd";
import { Envelope, Files, MagnifyingGlass, Megaphone, Trash } from "phosphor-react";
import { useTranslations } from "use-intl";

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
  const t = useTranslations("suppliers.generateAction");
  const tCommon = useTranslations("common");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showMessage } = useMessageApi();

  return (
    <Modal
      centered
      open={isOpen}
      onClose={onClose}
      title={<Title level={4}>{t("title")}</Title>}
      footer={null}
      onCancel={onClose}
    >
      <Flex vertical gap={12}>
        {selectedClientType && (
          <ButtonGenerateAction
            icon={<Files size={20} />}
            title={t("addRequirement")}
            onClick={() => {
              if (handleOpenModal) handleOpenModal(3);
            }}
          />
        )}

        <ButtonGenerateAction
          icon={<MagnifyingGlass size={20} />}
          title={t("auditRequirements")}
          onClick={() => {
            if (!selectedDocumentRows || selectedDocumentRows.length === 0) {
              return showMessage("error", t("noDocumentsToAudit"));
            }

            if (handleOpenModal) handleOpenModal(2);
          }}
        />
        <ButtonGenerateAction
          icon={<User size={20} />}
          disabled={true}
          title={t("createCustomer")}
        />
        <ButtonGenerateAction
          icon={<Trash size={20} />}
          title={tCommon("actions.delete")}
          onClick={() => {
            if (!selectedDocumentRows || selectedDocumentRows.length === 0) {
              return showMessage("error", t("noDocumentsToDelete"));
            }

            if (handleOpenModal) handleOpenModal(4);
          }}
        />
        <ButtonGenerateAction
          icon={<Megaphone size={20} />}
          title={t("sendReminder")}
          disabled={true}
        />
        <ButtonGenerateAction
          icon={<Envelope size={20} />}
          title={t("sendInvitation")}
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
