"use client";
import { useEffect, useState } from "react";
import { Flex, Modal, Typography, message } from "antd";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { confirmERPUpload } from "@/services/banksPayments/banksPayments";
import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-confirm-compensation.scss";

interface FormValues {
  id_erp: string;
  id_erp_compensation: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: ISingleBank | undefined;
  onSuccess?: () => void;
}

const ModalActionsConfirmCompensation = ({ isOpen, onClose, selectedRow, onSuccess }: Props) => {
  const t = useTranslations("banks.confirmCompensation");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { id_erp: "", id_erp_compensation: "" }
  });

  useEffect(() => {
    if (isOpen && selectedRow) {
      reset({
        id_erp: selectedRow.ID_ERP ?? "",
        id_erp_compensation: selectedRow.id_erp_compensation ?? ""
      });
    }
  }, [isOpen, selectedRow, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedRow) return;
    setIsSubmitting(true);
    try {
      await confirmERPUpload({
        payment_id: selectedRow.id,
        id_erp: values.id_erp,
        id_erp_compensation: values.id_erp_compensation
      });
      message.success(t("success"));
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="modalActionsConfirmCompensation"
      width={500}
      open={isOpen}
      title={null}
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <Typography.Title level={4} className="modalActionsConfirmCompensation__title">
        {t("title")}
      </Typography.Title>
      <Flex vertical gap="1rem" className="modalActionsConfirmCompensation__body">
        <InputForm titleInput={t("paymentId")} nameInput="id_erp" control={control} />
        <InputForm
          titleInput={t("compensationId")}
          nameInput="id_erp_compensation"
          control={control}
        />
      </Flex>
      <div className="modalActionsConfirmCompensation__footer">
        <SecondaryButton onClick={onClose}>{t("dontConfirm")}</SecondaryButton>
        <PrincipalButton onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
          {tCommon("actions.confirm")}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default ModalActionsConfirmCompensation;
