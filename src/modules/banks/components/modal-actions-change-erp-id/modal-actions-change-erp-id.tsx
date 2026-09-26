"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Flex, Modal } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import { changePaymentIdERP } from "@/services/banksPayments/banksPayments";
import { ApiError } from "@/utils/api/api";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import { ISingleBank } from "@/types/banks/IBanks";

import styles from "./modal-actions-change-erp-id.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows?: ISingleBank[] | undefined;
  onSuccess?: () => void;
}

interface IChangeErpIdForm {
  erpId: string;
  comment?: string;
}

const ModalActionsChangeErpId = ({ isOpen, onClose, selectedRows, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useMessageApi();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IChangeErpIdForm>();

  useEffect(() => {
    if (isOpen) {
      reset({ erpId: selectedRows?.[0]?.ID_ERP ?? "", comment: "" });
    }
  }, [isOpen]);

  const handleConfirm = async (data: IChangeErpIdForm) => {
    const payment = selectedRows?.[0];
    if (!payment) return;

    setIsLoading(true);
    try {
      await changePaymentIdERP({
        payment_id: payment.id,
        id_erp: data.erpId.trim(),
        comment: data.comment?.trim() || undefined
      });
      showMessage("success", "Id ERP actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      showMessage(
        "error",
        error instanceof ApiError && error.message
          ? error.message
          : "Ha ocurrido un error al cambiar el id ERP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title="Cambiar id ERP"
      width={520}
      destroyOnClose
      footer={
        <FooterButtons
          titleConfirm="Cambiar id ERP"
          onClose={onClose}
          handleOk={handleSubmit(handleConfirm)}
          isConfirmLoading={isLoading}
        />
      }
    >
      <Flex vertical gap="1rem">
        <InputForm
          titleInput="Id ERP"
          nameInput="erpId"
          control={control}
          error={errors.erpId}
          // The API treats a blank/whitespace id as "delete the ERP id"
          validationRules={{ validate: (value: string) => !!value?.trim() }}
          placeholder="Ingresar id ERP"
        />
        <InputForm
          titleInput="Comentarios"
          nameInput="comment"
          control={control}
          error={errors.comment}
          isTextArea
          rows={2}
          className={styles.comment}
          validationRules={{
            required: false,
            maxLength: { value: 255, message: "Máximo 255 caracteres" }
          }}
          placeholder="Ingresar un comentario (opcional)"
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsChangeErpId;
