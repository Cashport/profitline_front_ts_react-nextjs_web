"use client";
import { Flex, message, Modal, Typography } from "antd";
import { DownloadSimple, Pencil, Trash } from "@phosphor-icons/react";
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
}

export const ModalGenerateActionApplyTab = ({
  isOpen,
  onClose,
  handleOpenModal,
  selectedRows,
  downloadLog
}: Props) => {
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
          disabled={!selectedRows || selectedRows.length === 0}
        />
        <ButtonGenerateAction
          onClick={downloadLog}
          icon={<DownloadSimple size={20} />}
          title="Descargar Log"
        />
        <ButtonGenerateAction
          onClick={() => {
            if (!selectedRows || selectedRows.length === 0) {
              message.error("Debes seleccionar al menos un ajuste contable para editar");
              return;
            }
            // comprobar que de las selecteded rows tienen un financial_discount_id
            if (selectedRows[0]) {
              const hasFinancialDiscountId = selectedRows.some((row) => row.financial_discount_id);
              if (!hasFinancialDiscountId) {
                message.error("Debes seleccionar al menos un ajuste contable para editar");
                return;
              }
            }
            handleOpenModal(5);
          }}
          icon={<Pencil size={20} />}
          title="Editar ajustes"
        />
      </Flex>
    </Modal>
  );
};
