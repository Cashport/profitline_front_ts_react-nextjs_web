import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Flex, Modal } from "antd";
import { useParams } from "next/navigation";
import { CaretLeft, Plus } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import {
  getTemplateByEvent,
  sendEmailNotification
} from "@/services/communications/communications";
import { getDigitalRecordFormInfo } from "@/services/accountingAdjustment/accountingAdjustment";
import { extractSingleParam, fetchFileFromUrl } from "@/utils/utils";

import useFileHandlers from "@/components/hooks/useFIleHandlers";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import GeneralSearchSelect from "@/components/ui/general-search-select";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";

import "./modalSendEmail.scss";

interface ISelect {
  value: string;
  label: string;
}

export interface IFormEmailNotification {
  forward_to: ISelect[];
  copy_to?: ISelect[];
  subject: string;
  body: string;
  attachments: File[];
}

type IView = "sendEmail" | "template" | "success";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event_id: string;
  onFinalOk?: () => void;
  customOnReject?: () => void;
}
export const ModalSendEmail = ({ isOpen, onClose, event_id, onFinalOk, customOnReject }: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "0";
  const { showMessage } = useMessageApi();

  const [currentView, setCurrentView] = useState<IView>("sendEmail");
  const [recipients, setRecipients] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { isValid }
  } = useForm<IFormEmailNotification>({
    defaultValues: {
      attachments: []
    }
  });

  const forwards = watch("forward_to");
  const copyTo = watch("copy_to");
  const attachments = watch("attachments");

  const { handleOnChangeDocument, handleOnDeleteDocument, handleFileChange } = useFileHandlers({
    setValue,
    trigger,
    attachments
  });

  //reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  //get select info when modal is opened
  useEffect(() => {
    const fetchFormInfo = async () => {
      try {
        const response = await getDigitalRecordFormInfo(projectId, clientId);
        setRecipients(response.usuarios);
      } catch (error) {
        console.error("Error getting digital record form info", error);
      }
    };
    fetchFormInfo();
  }, [projectId, clientId, isOpen]);

  const handleRejectSendingEmail = () => {
    if (customOnReject) return customOnReject(), onClose();
    onClose();
  };

  const handleAcceptSendingEmail = async () => {
    // send email request to verify template
    try {
      setLoading(true);
      const response = await getTemplateByEvent(projectId, clientId, event_id);

      if (response) {
        setValue(
          "forward_to",
          response.recipients.map((recipient) => ({ value: recipient, label: recipient }))
        );
        setValue("subject", response.subject);
        setValue("body", response.message);

        // Handle file attachments from URLs
        if (response.files && response.files.length > 0) {
          try {
            const fetchedFiles = await Promise.all(
              response.files.map(async (url: string) => {
                try {
                  return await fetchFileFromUrl(url);
                } catch (error) {
                  console.error(`Failed to fetch file from ${url}:`, error);
                  return null;
                }
              })
            );

            const validFiles = fetchedFiles.filter((file): file is File => file !== null); // Remove failed files

            if (validFiles.length > 0) {
              setValue("attachments", validFiles);
            } else {
              showMessage("error", "No se pudieron cargar los archivos adjuntos.");
            }
          } catch (error) {
            console.error("Error fetching attachments:", error);
            showMessage(
              "error",
              "Ocurrió un error al recuperar los archivos adjuntos de la plantilla."
            );
          }
        }
      }
    } catch (error) {
      showMessage("error", "Ocurrió un error al obtener la plantilla");
    }
    setLoading(false);
    //change view to template
    setCurrentView("template");
    // if a template its returned assign values to form with response
  };

  const onSubmit = async (data: IFormEmailNotification) => {
    setLoading(true);

    const parsedEmailBody = data.body
      .split("\n")
      .map((line) => `<p>${line}</p>`)
      .join("\n");

    const modelData = {
      ...data,
      body: parsedEmailBody
    };

    try {
      await sendEmailNotification(modelData);
      // change view to success view if email was sent
      setCurrentView("success");
    } catch (error) {
      showMessage("error", "Ocurrió un error al enviar el correo");
    }
    setLoading(false);
  };

  const handleOkSuccess = () => {
    if (onFinalOk) return onFinalOk(), onClose();
    onClose();
  };

  return (
    <Modal
      className="modalSendEmail"
      width={"686px"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      {currentView === "sendEmail" && (
        <>
          <h2 className="modalSendEmail__title">{sendEmailConstants.title}</h2>

          <p className="modalSendEmail__description">{sendEmailConstants.description}</p>
          <div className="modalSendEmail__footer">
            <SecondaryButton onClick={handleRejectSendingEmail}>
              {sendEmailConstants.cancelText}
            </SecondaryButton>

            <PrincipalButton onClick={handleAcceptSendingEmail} loading={loading}>
              {sendEmailConstants.okText}
            </PrincipalButton>
          </div>
        </>
      )}

      {currentView === "template" && (
        <>
          <button className="modalSendEmail__goBackBtn" onClick={onClose}>
            <CaretLeft size="1.25rem" />
            {templateConstants.title}
          </button>
          <Flex vertical gap="1.5rem">
            <Controller
              name="forward_to"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <GeneralSearchSelect
                  field={field}
                  title="Para"
                  placeholder=""
                  options={recipients}
                  suffixIcon={null}
                  showLabelAndValue
                />
              )}
            />

            <Controller
              name="copy_to"
              control={control}
              rules={{ required: false }}
              render={({ field }) => (
                <GeneralSearchSelect
                  field={field}
                  title="CC"
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
              placeholder=" "
            />

            <Controller
              name="body"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <div className="modalSendEmail__textArea">
                  <textarea {...field} placeholder="" />
                </div>
              )}
            />

            <div>
              <Flex className="modalSendEmail__files" vertical gap="0.7rem">
                <DocumentButton
                  key={attachments[0]?.name}
                  title={attachments[0]?.name}
                  handleOnChange={handleOnChangeDocument}
                  handleOnDelete={() => handleOnDeleteDocument(attachments[0]?.name)}
                  fileName={attachments[0]?.name}
                  fileSize={attachments[0]?.size}
                />
                {attachments.slice(1).map((file, index) => (
                  <DocumentButton
                    key={file.name}
                    className={index > 0 ? "documentButton" : ""}
                    title={file.name}
                    handleOnChange={handleOnChangeDocument}
                    handleOnDelete={() => handleOnDeleteDocument(file.name)}
                    fileName={file.name}
                    fileSize={file.size}
                  />
                ))}
                {/* {errors.attachments && (
                  <p className="error">{(errors.attachments as FieldError).message}</p>
                )} */}
              </Flex>
              {attachments.length > 0 && (
                <>
                  <Button
                    onClick={() => {
                      const fileInput = document.getElementById("fileInputSendEmailModal");
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                    className="modalSendEmail__addDocument"
                    icon={<Plus size={"1rem"} />}
                  >
                    Cargar otro documento
                  </Button>
                  <input
                    type="file"
                    id="fileInputSendEmailModal"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.doc,.docx, .xls, .xlsx, .msg,  .eml"
                  />
                </>
              )}
            </div>
          </Flex>
          <div className="modalSendEmail__footer">
            <SecondaryButton onClick={() => onClose()}>
              {templateConstants.cancelText}
            </SecondaryButton>

            <PrincipalButton
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || attachments.length === 0}
              loading={loading}
            >
              {templateConstants.okText}
            </PrincipalButton>
          </div>
        </>
      )}

      {currentView === "success" && (
        <>
          <h2 className="modalSendEmail__title">{successConstants.title}</h2>

          <div className="modalSendEmail__description" style={{ maxWidth: "90%" }}>
            <p>{successConstants.description}</p>
            <p>
              {forwards
                .concat(copyTo || []) // Concatenate forwards and copys
                .map((recipient, index, combinedArray) => {
                  if (combinedArray.length === 1) {
                    return recipient.label;
                  }
                  return index === combinedArray.length - 1
                    ? `y ${recipient.label}` // Add "y" before the last recipient
                    : `${recipient.label},`;
                })
                .join(" ")}
            </p>
          </div>

          <Flex justify="center" style={{ alignSelf: "center", height: "3rem", width: "320px" }}>
            <PrincipalButton fullWidth onClick={handleOkSuccess}>
              {successConstants.okText}
            </PrincipalButton>
          </Flex>
        </>
      )}
    </Modal>
  );
};

const sendEmailConstants = {
  title: "¿Deseas enviar un correo notificando esta acción?",
  description: "Se enviará un correo a los aprobadores notificando esta acción",
  okText: "Sí, enviar correo",
  cancelText: "No, no enviar"
};

const templateConstants = {
  title: "Enviar correo",
  okText: "Enviar correo",
  cancelText: "Cancelar"
};

const successConstants = {
  title: "Correo enviado exitosamente",
  description: "Se ha enviado el correo a:",
  okText: "Entendido"
};
