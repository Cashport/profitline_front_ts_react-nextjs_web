"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Flex, Modal } from "antd";
import { useTranslations } from "use-intl";

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
  const t = useTranslations("banks.changeErpId");
  const tCommon = useTranslations("common");
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

    const idErp = data.erpId.trim();

    setIsLoading(true);
    try {
      await changePaymentIdERP({
        payment_id: payment.id,
        id_erp: idErp,
        comment: data.comment?.trim() || undefined
      });
      showMessage("success", idErp ? t("updated") : t("deleted"));
      onSuccess?.();
      onClose();
    } catch (error) {
      showMessage("error", error instanceof ApiError && error.message ? error.message : t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={t("title")}
      width={520}
      destroyOnClose
      footer={
        <FooterButtons
          titleConfirm={t("title")}
          onClose={onClose}
          handleOk={handleSubmit(handleConfirm)}
          isConfirmLoading={isLoading}
        />
      }
    >
      <Flex vertical gap="1rem">
        <InputForm
          titleInput={t("erpId")}
          nameInput="erpId"
          control={control}
          error={errors.erpId}
          // The API treats a blank/whitespace id as "delete the ERP id"
          validationRules={{ required: false }}
          placeholder={t("erpIdPlaceholder")}
        />
        <InputForm
          titleInput={tCommon("fields.comments")}
          nameInput="comment"
          control={control}
          error={errors.comment}
          isTextArea
          rows={2}
          className={styles.comment}
          validationRules={{
            required: false,
            maxLength: { value: 255, message: t("maxLength", { max: 255 }) }
          }}
          placeholder={t("commentPlaceholder")}
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsChangeErpId;
