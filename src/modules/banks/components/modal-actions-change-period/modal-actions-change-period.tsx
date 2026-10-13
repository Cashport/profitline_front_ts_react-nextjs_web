"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Flex, Modal, Typography } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import { changePaymentPeriod } from "@/services/banksPayments/banksPayments";
import { ApiError } from "@/utils/api/api";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import { ISingleBank } from "@/types/banks/IBanks";

const { Text } = Typography;

const PAYMENT_PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows?: ISingleBank[] | undefined;
  onSuccess?: () => void;
}

interface IChangePeriodForm {
  paymentPeriod: string;
}

/**
 * HU payment_period: ajuste manual/masivo del periodo contable (YYYY-MM).
 * Solo se ofrece sobre pagos identificados/aplicados (el padre filtra).
 */
const ModalActionsChangePeriod = ({ isOpen, onClose, selectedRows, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage } = useMessageApi();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IChangePeriodForm>();

  useEffect(() => {
    if (isOpen) {
      reset({ paymentPeriod: selectedRows?.[0]?.payment_period ?? "" });
    }
  }, [isOpen]);

  const handleConfirm = async (data: IChangePeriodForm) => {
    const paymentIds = (selectedRows ?? []).map((row) => row.id);
    if (paymentIds.length === 0) return;

    setIsLoading(true);
    try {
      await changePaymentPeriod({
        payment_ids: paymentIds,
        payment_period: data.paymentPeriod.trim()
      });
      showMessage("success", "Periodo contable actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      showMessage(
        "error",
        error instanceof ApiError && error.message
          ? error.message
          : "Ha ocurrido un error al cambiar el periodo contable"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title="Cambiar periodo contable"
      width={520}
      destroyOnClose
      footer={
        <FooterButtons
          titleConfirm="Cambiar periodo"
          onClose={onClose}
          handleOk={handleSubmit(handleConfirm)}
          isConfirmLoading={isLoading}
        />
      }
    >
      <Flex vertical gap="0.75rem">
        <Text type="secondary">
          Se actualizará el periodo contable de {selectedRows?.length ?? 0} pago(s). No se
          modifica la fecha de ingreso ni el estado del pago.
        </Text>
        <InputForm
          titleInput="Periodo contable (YYYY-MM)"
          nameInput="paymentPeriod"
          control={control}
          error={errors.paymentPeriod}
          validationRules={{
            required: "El periodo es obligatorio",
            pattern: {
              value: PAYMENT_PERIOD_PATTERN,
              message: "Formato inválido. Use YYYY-MM (ej. 2026-08)"
            }
          }}
          placeholder="2026-08"
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsChangePeriod;
