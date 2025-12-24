import React, { useEffect, useState } from "react";
import { Flex, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft } from "@phosphor-icons/react";

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
    watch,
    trigger,
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
      messageShow.success("Acta digital enviada correctamente");

      onClose();
    } catch (error) {
      messageShow.error("Error al enviar acta digital");
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
        Enviar acta digital
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
              title="Para"
              placeholder=""
              options={recipients}
              suffixIcon={null}
              showLabelAndValue
            />
          )}
        />

        <InputForm
          validationRules={{ required: true }}
          titleInput="Asunto"
          control={control}
          nameInput="subject"
          error={errors.subject}
          readOnly
        />
      </Flex>

      <div className="digitalRecordModal__footer">
        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>

        <PrincipalButton onClick={handleSubmit(onSubmit)} disabled={!isValid || isSubmitting}>
          {isSubmitting ? "...enviando" : "Enviar acta"}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default DigitalRecordModal;
