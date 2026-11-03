import React, { useEffect, useState } from "react";
import { Flex, Modal } from "antd";
import { useForm, Controller } from "react-hook-form";
import { useFormatter, useTranslations } from "use-intl";
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
  onCloseAllModals?: () => void;
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
  clientUUID,
  onCloseAllModals
}: SendExternalLinkModalProps) => {
  const t = useTranslations("modals.sendExternalLink");
  const tCommon = useTranslations("common");
  const format = useFormatter();
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

  const formatRecipientsList = (recipients: ISelect[]): string =>
    format.list(
      recipients.map((r) => r.label),
      { type: "conjunction" }
    );

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
        showMessage("success", t("sent"));
        setView("success");
      } else {
        showMessage("error", t("sendError"));
      }
      setView("success");
    } catch (error) {
      console.error("Unexpected error", error);
      showMessage("error", t("unexpectedError"));
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
          </Flex>

          <div className="sendExternalLinkModal__footer">
            <SecondaryButton onClick={onClose}>{tCommon("actions.cancel")}</SecondaryButton>

            <PrincipalButton
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid}
              loading={isSubmitting}
            >
              {t("sendEmail")}
            </PrincipalButton>
          </div>
        </>
      )}

      {view === "success" && (
        <div className="sendExternalLinkModal__successView">
          <h2>{t("successTitle")}</h2>
          <span>
            <p className="sendExternalLinkModal__successMessage">{t("successMessage")}</p>
            <p className="sendExternalLinkModal__recipients">
              {formatRecipientsList(watchForwardTo)}
            </p>
          </span>
          <PrincipalButton
            customStyles={{
              width: "280px"
            }}
            onClick={onCloseAllModals}
          >
            {t("gotIt")}
          </PrincipalButton>
        </div>
      )}
    </Modal>
  );
};

export default SendExternalLinkModal;
