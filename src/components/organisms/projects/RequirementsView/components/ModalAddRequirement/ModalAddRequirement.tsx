"use client";
import { Flex, Modal, Typography } from "antd";
import { Files, ListChecks } from "@phosphor-icons/react";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { useState } from "react";
import DocumentList from "../DocumentList";
import { CreateDocument } from "../CreateDocument";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedClientType: number | null;
}
type ActionType = "document" | "form" | null;
export const ModalAddRequirement = ({ isOpen, onClose, selectedClientType }: Props) => {
  const [isModalCreateDocumentOpen, setIsModalCreateDocumentOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const router = useRouter();
  const handleActionClick = (action: ActionType) => {
    setCurrentAction(action);
  };

  const renderContent = () => {
    if (currentAction === null) {
      return (
        <Flex vertical gap="0.75rem">
          <ButtonGenerateAction
            onClick={() => handleActionClick("document")}
            icon={<Files size={16} />}
            title="Documento"
          />
          <ButtonGenerateAction
            icon={<ListChecks size={16} />}
            title="Formulario"
            onClick={() => handleActionClick("form")}
            disabled={true}
          />
        </Flex>
      );
    }

    if (currentAction === "document") {
      return (
        <DocumentList
          onClose={() => setCurrentAction(null)}
          selectedClientType={selectedClientType}
          addNewDocument={() => setIsModalCreateDocumentOpen(true)}
          listType={"documents"}
        />
      );
    }

    if (currentAction === "form") {
      return (
        <DocumentList
          onClose={() => setCurrentAction(null)}
          selectedClientType={selectedClientType}
          addNewDocument={() => router.push("/proyectos/create-form")}
          listType={"forms"}
        />
      );
    }
  };
  const getTitle = () => {
    if (currentAction === null) {
      return "Requerimiento";
    }
    if (currentAction === "document") {
      return "Documentos";
    }
    if (currentAction === "form") {
      return "Formularios";
    }
  };

  return (
    <Modal
      open={isOpen}
      centered
      title={<Title level={4}>{getTitle()}</Title>}
      footer={null}
      onCancel={onClose}
      width={currentAction === "document" || currentAction === "form" ? "43rem" : "20%"}
    >
      {renderContent()}
      <CreateDocument
        isOpen={isModalCreateDocumentOpen}
        mode="create"
        onClose={() => setIsModalCreateDocumentOpen(false)}
        onSubmit={() => {}}
      />
    </Modal>
  );
};
