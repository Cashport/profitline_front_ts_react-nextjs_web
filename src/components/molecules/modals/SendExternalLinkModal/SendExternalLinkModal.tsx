import React, { useEffect, useState } from "react";
import { Flex, Modal } from "antd";
import { useForm, Controller } from "react-hook-form";
import { CaretLeft } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { getContactByClientId } from "@/services/contacts/contacts";
import { generateLink } from "@/services/external link/externalLink";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import GeneralSearchSelect from "@/components/ui/general-search-select";

import "./sendExternalLinkModal.scss";

interface SendExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientUUID: string;
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
  const [view, setView] = useState("default"); // New state for modal view

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<IFormSendExternalLinkModal>();

  const watchForwardTo = watch("forward_to");

  const formatRecipientsList = (recipients: ISelect[]): string => {
    const labels = recipients.map((r) => r.label);
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;

    const allButLast = labels.slice(0, -1).join(", ");
    const last = labels[labels.length - 1];
    return `${allButLast} y ${last}`;
  };

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
      setView("default"); // Reset view to default when modal is closed
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: IFormSendExternalLinkModal) => {
    setIsSubmitting(true);
    try {
      const results = await Promise.allSettled(
        data.forward_to.map(async (recipient) => {
          return generateLink(clientUUID, recipient.value);
        })
      );

      const hasSuccess = results.some((result) => result.status === "fulfilled");

      if (hasSuccess) {
        showMessage("success", "Link enviado correctamente");
        setView("success");
      } else {
        showMessage("error", "Error al enviar Link");
      }
      setView("success");
    } catch (error) {
      console.error("Unexpected error", error);
      showMessage("error", "Error inesperado al enviar Link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="sendExternalLinkModal"
      width="660px"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      {view === "default" && (
        <>
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
        </>
      )}

      {view === "success" && (
        <div className="sendExternalLinkModal__successView">
          <h2>Link enviado exitosamente</h2>
          <span>
            <p className="sendExternalLinkModal__successMessage">
              Se ha enviado el link de ingreso a:
            </p>
            <p className="sendExternalLinkModal__recipients">
              {formatRecipientsList(watchForwardTo)}
            </p>
          </span>
          <PrincipalButton
            customStyles={{
              width: "280px"
            }}
            onClick={onClose}
          >
            Entendido
          </PrincipalButton>
        </div>
      )}
    </Modal>
  );
};

export default SendExternalLinkModal;
