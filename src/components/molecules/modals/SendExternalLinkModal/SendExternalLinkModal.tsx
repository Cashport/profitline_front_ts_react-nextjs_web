import React, { useEffect, useState } from "react";
import { Flex, Modal } from "antd";
import { useForm, Controller } from "react-hook-form";
import { CaretLeft } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { getContactByClientId } from "@/services/contacts/contacts";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import GeneralSearchSelect from "@/components/ui/general-search-select";

import "./sendExternalLinkModal.scss";

interface SendExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientUUID?: string;
}

interface ISelect {
  value: string;
  label: string;
}
export interface IFormSendExternalLinkModal {
  forward_to: ISelect[];
}

const SendExternalLinkModal = ({
  isOpen,
  onClose,
  clientId,
  clientUUID
}: SendExternalLinkModalProps) => {
  const { showMessage } = useMessageApi();
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
    reset
  } = useForm<IFormSendExternalLinkModal>();

  useEffect(() => {
    const fetchFormInfo = async () => {
      try {
        const res = await getContactByClientId(clientId);
        setRecipients(
          res?.map((item) => ({
            value: item.contact_email,
            label: `${item.contact_name} ${item.contact_lastname}`
          })) || []
        );
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

  const onSubmit = async (data: IFormSendExternalLinkModal) => {
    setIsSubmitting(true);
    try {
      console.log("data", data);
      console.log("clientUUID", clientUUID);

      showMessage("success", "Acta digital enviada correctamente");

      // onClose();
    } catch (error) {
      showMessage("error", "Error al enviar acta digital");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="sendExternalLinkModal"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <button className="sendExternalLinkModal__goBackBtn" onClick={onClose}>
        <CaretLeft size="1.25rem" />
        Enviar link externo
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
      </Flex>

      <div className="sendExternalLinkModal__footer">
        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>

        <PrincipalButton
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid}
          loading={isSubmitting}
        >
          Enviar acta
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default SendExternalLinkModal;
