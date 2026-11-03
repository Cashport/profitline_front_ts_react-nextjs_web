"use client";
import { Flex, Modal, Typography } from "antd";
import { ArrowsClockwise, Pencil, FileLock } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

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
  const t = useTranslations("modals.generateActionProjectForm");
  return (
    <Modal
      className="modalGenerateAction"
      width={"40%"}
      open={isOpen}
      centered
      title={
        <Title className="modalGenerateAction__title" level={4}>
          {t("title")}
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <p className="modalGenerateAction__description">{t("description")}</p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={16} />}
          title={t("changeStatus")}
          onClick={() => {
            handleOpenModal(2);
          }}
        />
        <ButtonGenerateAction
          onClick={handleEditProject}
          icon={<Pencil size={16} />}
          title={statusForm === "edit" ? t("cancelEdit") : t("editProject")}
        />
        <ButtonGenerateAction
          icon={<FileLock size={16} />}
          title={t("closePeriod")}
          onClick={() => {
            handleOpenModal(3);
          }}
        />
      </Flex>
    </Modal>
  );
};
