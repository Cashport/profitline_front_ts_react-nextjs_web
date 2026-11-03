import React, { useEffect, useState } from "react";
import { Flex, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { useAppStore } from "@/lib/store/store";
import {
  getDigitalRecordFormInfo,
  sendDigitalRecord
} from "@/services/accountingAdjustment/accountingAdjustment";

import { useForm, Controller } from "react-hook-form";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import GeneralSearchSelect from "@/components/ui/general-search-select";

import { IInvoice } from "@/types/invoices/IInvoices";

import "./digitalRecordModal.scss";

interface DigitalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  clientId: string;
  invoiceSelected: IInvoice[] | undefined;
  messageShow: MessageInstance;
}

interface ISelect {
  value: string;
  label: string;
}
export interface IFormDigitalRecordModal {
  forward_to: ISelect[];
  subject: string;
}

const DigitalRecordModal = ({
  isOpen,
  onClose,
  clientId,
  messageShow
}: DigitalRecordModalProps) => {
  const t = useTranslations("modals.digitalRecord");
  const tCommon = useTranslations("common");
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [recipients, setRecipients] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset
  } = useForm<IFormDigitalRecordModal>();

  useEffect(() => {
    const fetchFormInfo = async () => {
      try {
        const response = await getDigitalRecordFormInfo(projectId, clientId);
        setRecipients(response.usuarios);
        setValue("subject", response.asunto);
      } catch (error) {
        console.error("Error getting digital record form info2", error);
      }
    };
    fetchFormInfo();
  }, [projectId, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: IFormDigitalRecordModal) => {
    setIsSubmitting(true);
    try {
      await sendDigitalRecord(clientId, data);
      messageShow.success(t("success"));

      onClose();
    } catch (error) {
      messageShow.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="digitalRecordModal"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <button className="digitalRecordModal__goBackBtn" onClick={onClose}>
        <CaretLeft size="1.25rem" />
        {t("title")}
      </button>

      <Flex vertical gap="0.5rem">
        <Controller
          name="forward_to"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <GeneralSearchSelect
              errors={errors.forward_to}
              field={field}
              title={t("to")}
              placeholder=""
              options={recipients}
              suffixIcon={null}
              showLabelAndValue
            />
          )}
        />

        <InputForm
          validationRules={{ required: true }}
          titleInput={t("subject")}
          control={control}
          nameInput="subject"
          error={errors.subject}
          readOnly
        />
      </Flex>

      <div className="digitalRecordModal__footer">
        <SecondaryButton onClick={onClose}>{tCommon("actions.cancel")}</SecondaryButton>

        <PrincipalButton onClick={handleSubmit(onSubmit)} disabled={!isValid || isSubmitting}>
          {isSubmitting ? tCommon("status.sending") : t("send")}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default DigitalRecordModal;
