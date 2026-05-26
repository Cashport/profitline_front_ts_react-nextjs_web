"use client";
import { useState } from "react";
import { Flex, message, Modal } from "antd";
import { FileArrowDown } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import ModalActionsConfirmCompensation from "../modal-actions-confirm-compensation";
import {
  changeStatusUploadERP,
  downloadPaymentsPlane
} from "@/services/banksPayments/banksPayments";
import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-wallet-payments.scss";

const IDENTIFICADO_STATUS_ID = 1;
const CARGADO_ERP_STATUS_ID = 20;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows: ISingleBank[] | undefined;
  onSuccess?: () => void;
}

const ModalActionsWalletPayments = ({ isOpen, onClose, selectedRows, onSuccess }: Props) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompensationOpen, setIsCompensationOpen] = useState(false);

  const handleDowloadPlane = async () => {
    if (!selectedRows?.length) {
      message.warning("Selecciona al menos un pago");
      return;
    }

    const paymentIds = selectedRows.map((row) => row.id);
    const hideLoading = message.loading("Descargando plano...", 0);
    try {
      const res = await downloadPaymentsPlane(paymentIds);
      window.open(res.url, "_blank");
      message.success("Plano descargado correctamente");
      onClose();
      const allIdentificado = selectedRows.every((row) => row.id_status === IDENTIFICADO_STATUS_ID);
      if (allIdentificado) {
        setIsConfirmOpen(true);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al descargar el plano");
    } finally {
      hideLoading();
    }
  };

  const handleConfirmErpUpload = () => {
    if (!selectedRows?.length) {
      message.warning("Selecciona al menos un pago");
      return;
    }

    const allIdentificado = selectedRows.every((row) => row.id_status === IDENTIFICADO_STATUS_ID);
    if (!allIdentificado) {
      message.warning("Todos los pagos seleccionados deben estar en estado Identificado");
      return;
    }

    onClose();
    setIsConfirmOpen(true);
  };

  const handleConfirmErp = async () => {
    if (!selectedRows?.length) return;

    setIsConfirming(true);
    try {
      await changeStatusUploadERP(selectedRows.map((row) => row.id));
      message.success("Cargue ERP confirmado correctamente");
      setIsConfirmOpen(false);
      onSuccess?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al confirmar el cargue ERP");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirmCompensation = () => {
    if (selectedRows?.length !== 1) {
      message.warning("Selecciona exactamente un pago");
      return;
    }

    if (selectedRows[0].id_status !== CARGADO_ERP_STATUS_ID) {
      message.warning("El pago seleccionado debe estar en estado Cargado al ERP");
      return;
    }

    onClose();
    setIsCompensationOpen(true);
  };

  return (
    <>
      <Modal
        className="modalActionsWalletPayments"
        width={686}
        open={isOpen}
        title={null}
        footer={null}
        onCancel={onClose}
      >
        <p className="modalActionsWalletPayments__description">
          Selecciona la acción que vas a realizar
        </p>
        <Flex vertical gap="0.75rem">
          <ButtonGenerateAction
            onClick={handleDowloadPlane}
            icon={<FileArrowDown size={16} />}
            title="Descargar layout"
          />
          <ButtonGenerateAction
            onClick={handleConfirmErpUpload}
            icon={<FileArrowDown size={16} />}
            title="Confirmar cargue ERP"
          />
          <ButtonGenerateAction
            onClick={handleConfirmCompensation}
            icon={<FileArrowDown size={16} />}
            title="Confirmar compensación"
          />
        </Flex>
      </Modal>
      <ModalConfirmAction
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onOk={handleConfirmErp}
        title="¿Desea confirmar el cargue ERP?"
        okText="Confirmar"
        cancelText="No confirmar"
        okLoading={isConfirming}
      />
      <ModalActionsConfirmCompensation
        isOpen={isCompensationOpen}
        onClose={() => setIsCompensationOpen(false)}
        selectedRow={selectedRows?.[0]}
        onSuccess={onSuccess}
      />
    </>
  );
};

export default ModalActionsWalletPayments;
