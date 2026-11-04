"use client";
import { Flex, message, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";
import { DownloadSimple, Pencil, Robot, Trash } from "@phosphor-icons/react";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { IApplyTabRecord } from "@/types/applyTabClients/IApplyTabClients";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal: (modalNumber: number) => void;
  selectedRows?: IApplyTabRecord[];
  downloadLog?: () => void;
  downloadExcelLog?: () => void;
}

export const ModalGenerateActionApplyTab = ({
  isOpen,
  onClose,
  handleOpenModal,
  selectedRows,
  downloadLog,
  downloadExcelLog
}: Props) => {
  const t = useTranslations("clients.applyTab");
  return (
    <Modal
      className="modalGenerateActionApplyTab"
      open={isOpen}
      centered
      title={
        <Title className="modalGenerateActionApplyTab__title" level={4}>
          {t("generateAction")}
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <Flex vertical gap={12}>
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(6);
          }}
          icon={<Trash size={20} />}
          title={t("generateActionModal.deleteAllRows")}
        />
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(4);
          }}
          icon={<Trash size={20} />}
          title={t("generateActionModal.deleteRows")}
          disabled={!selectedRows || selectedRows.length === 0}
        />
        <ButtonGenerateAction
          onClick={downloadLog}
          icon={<DownloadSimple size={20} />}
          title={t("generateActionModal.downloadAILog")}
        />
        <ButtonGenerateAction
          onClick={downloadExcelLog}
          icon={<DownloadSimple size={20} />}
          title={t("generateActionModal.downloadExcelLog")}
        />
        <ButtonGenerateAction
          onClick={() => {
            if (!selectedRows || selectedRows.length === 0) {
              message.error(t("generateActionModal.selectDeductionToEdit"));
              return;
            }
            // comprobar que de las selecteded rows tienen un balance_id
            if (selectedRows[0]) {
              const hasBalanceId = selectedRows.some((row) => row.balance_id);
              if (!hasBalanceId) {
                message.error(t("generateActionModal.selectDeductionToEdit"));
                return;
              }
            }
            handleOpenModal(5);
          }}
          icon={<Pencil size={20} />}
          title={t("generateActionModal.editDeductions")}
        />
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(7);
          }}
          icon={<Robot size={20} />}
          title={t("generateActionModal.changeAIPrompt")}
        />
      </Flex>
    </Modal>
  );
};
