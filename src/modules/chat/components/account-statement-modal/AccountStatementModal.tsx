import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm, Resolver, FieldErrors } from "react-hook-form";
import { Flex, Modal, Typography, message } from "antd";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import GeneralSearchSelect from "@/components/ui/general-search-select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/modules/chat/ui/tabs";

import "./accountStatementModal.scss";
import { useAppStore } from "@/lib/store/store";
import {
  getDigitalRecordFormInfo,
  IUser,
  sendDigitalRecord
} from "@/services/accountingAdjustment/accountingAdjustment";
import { sendDigitalRecordWhatsapp, downloadDigitalRecordFiles } from "@/services/chat/clients";
import { IFormDigitalRecordModal } from "@/components/molecules/modals/DigitalRecordModal/DigitalRecordModal";
import { ApiError } from "@/utils/api/api";

interface ISelectOption {
  value: string;
  label: string;
}

interface IAccountStatementForm {
  method: "correo" | "whatsapp" | "descargar";
  recipients?: ISelectOption[];
  files?: ISelectOption[];
}

interface AccountStatementModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  clientId?: string | null;
}

const AccountStatementModal = ({
  showModal,
  setShowModal,
  clientId
}: AccountStatementModalProps) => {
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const [activeTab, setActiveTab] = useState<"correo" | "whatsapp" | "descargar">("correo");
  const [recipients, setRecipients] = useState<IUser[]>([]);
  const [attachments, setAttachments] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom validation that checks activeTab state
  const validateForm: Resolver<IAccountStatementForm> = async (data) => {
    const errors: FieldErrors<IAccountStatementForm> = {};

    // Validate recipients for correo and whatsapp tabs
    if (
      (activeTab === "correo" || activeTab === "whatsapp") &&
      (!data.recipients || data.recipients.length === 0)
    ) {
      errors.recipients = {
        type: "required",
        message: "Se requiere seleccionar destinatarios"
      };
    }

    return {
      values: data,
      errors: Object.keys(errors).length > 0 ? errors : {}
    };
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<IAccountStatementForm>({
    mode: "onChange",
    resolver: validateForm,
    defaultValues: {
      method: "correo",
      recipients: [],
      files: []
    }
  });

  // Fetch data from API
  useEffect(() => {
    const fetchFormInfo = async () => {
      if (!clientId || !projectId || !showModal) return;

      setIsLoading(true);
      try {
        const response = await getDigitalRecordFormInfo(projectId, clientId);
        setRecipients(response.usuarios);

        // Mapear attachments y establecerlos como seleccionados por defecto
        const mappedAttachments = response.attachments.map((att) => ({
          value: att.id.toString(),
          label: att.name
        }));
        setAttachments(mappedAttachments);
        setValue("files", mappedAttachments);
      } catch (error) {
        console.error("Error getting digital record form info:", error);
        message.error("Error al cargar la información");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormInfo();
  }, [projectId, clientId, showModal]);

  // Reset form when modal closes
  useEffect(() => {
    if (!showModal) {
      reset();
      setActiveTab("correo");
    }
  }, [showModal, reset]);

  // Update method field when tab changes
  useEffect(() => {
    setValue("method", activeTab);
    trigger(); // Force re-validation with new activeTab value
  }, [activeTab, setValue, trigger]);

  const onSubmit = async (data: IAccountStatementForm) => {
    if (!clientId) {
      message.error("No se ha seleccionado un cliente");
      return;
    }

    setIsSubmitting(true);
    try {
      switch (data.method) {
        case "correo": {
          const emailData: IFormDigitalRecordModal = {
            forward_to: data.recipients || [],
            subject: ""
          };
          await sendDigitalRecord(clientId, emailData);
          message.success("Estado de cuenta enviado por correo correctamente");
          break;
        }

        case "whatsapp": {
          const emailToPhoneMap = new Map(recipients.map((user) => [user.value, user.full_phone]));

          // For each recipient, get phone number
          const recipientPhoneNumbers =
            data.recipients
              ?.map((recipient) => {
                // If recipient exists in map (selected from dropdown), use their phone
                if (emailToPhoneMap.has(recipient.value)) {
                  return emailToPhoneMap.get(recipient.value)!;
                }
                // Otherwise, it's a typed phone number, use value directly
                return recipient.value.trim();
              })
              .map(Number) || [];

          await sendDigitalRecordWhatsapp(clientId, recipientPhoneNumbers);
          message.success("Estado de cuenta enviado por WhatsApp correctamente");
          break;
        }

        case "descargar": {
          const response = await downloadDigitalRecordFiles(clientId);
          if (response) {
            response.forEach((file) => {
              window.open(file.url, "_blank");
            });

            message.success("Archivos del estado de cuenta descargados correctamente");
          } else {
            message.warning("No se pudieron descargar los archivos");
            return; // No cerrar modal si falla
          }
          break;
        }

        default:
          message.error("Método de envío no válido");
          return;
      }

      // Cerrar modal y resetear form después de éxito
      setShowModal(false);
      reset();
    } catch (error) {
      console.error("Error processing account statement:", error);

      let errorMessage: string;

      // Check if it's an API error with a specific message
      if (error instanceof ApiError && error.message) {
        errorMessage = error.message;
      } else {
        // Fall back to generic messages
        const errorMessages = {
          correo: "Error al enviar el estado de cuenta por correo",
          whatsapp: "Error al enviar el estado de cuenta por WhatsApp",
          descargar: "Error al descargar los archivos del estado de cuenta"
        };
        errorMessage = errorMessages[data.method] || "Error al procesar el estado de cuenta";
      }

      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  // Show error if clientId is missing
  if (!clientId && showModal) {
    return (
      <Modal
        destroyOnClose
        open={showModal}
        className="AccountStatementModalContainer"
        footer={false}
        onCancel={handleClose}
      >
        <Flex vertical gap={24}>
          <div className="AccountStatementModalContainer__header">
            <h2 className="AccountStatementModalContainer__header__title">
              Envío de estado de cuenta
            </h2>
            <Typography.Text type="danger">
              No se ha seleccionado un cliente. Por favor, seleccione una conversación primero.
            </Typography.Text>
          </div>
          <div className="AccountStatementModalContainer__footer">
            <SecondaryButton onClick={handleClose}>Cerrar</SecondaryButton>
          </div>
        </Flex>
      </Modal>
    );
  }

  return (
    <Modal
      destroyOnClose
      open={showModal}
      className="AccountStatementModalContainer"
      footer={false}
      onCancel={handleClose}
    >
      <Flex vertical gap={24}>
        <div className="AccountStatementModalContainer__header">
          <h2 className="AccountStatementModalContainer__header__title">
            Envío de estado de cuenta
          </h2>
        </div>

        <div className="AccountStatementModalContainer__content">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "correo" | "whatsapp" | "descargar")}
          >
            <TabsList>
              <TabsTrigger value="correo">Correo</TabsTrigger>
              <TabsTrigger value="whatsapp">Whatsapp</TabsTrigger>
              <TabsTrigger value="descargar">Descargar</TabsTrigger>
            </TabsList>

            <TabsContent value="correo">
              <Controller
                name="recipients"
                control={control}
                render={({ field }) => (
                  <GeneralSearchSelect
                    errors={errors.recipients}
                    field={field}
                    title="Para"
                    placeholder="Seleccione o escriba destinatarios"
                    options={recipients}
                    loading={isLoading}
                    suffixIcon={null}
                    showLabelAndValue
                  />
                )}
              />
            </TabsContent>

            <TabsContent value="whatsapp">
              <Controller
                name="recipients"
                control={control}
                render={({ field }) => (
                  <GeneralSearchSelect
                    errors={errors.recipients}
                    field={field}
                    title="Para"
                    placeholder="Seleccione o escriba destinatarios"
                    options={recipients}
                    loading={isLoading}
                    suffixIcon={null}
                    showLabelAndValue
                  />
                )}
              />
            </TabsContent>

            <TabsContent value="descargar">
              <Controller
                name="files"
                control={control}
                render={({ field }) => (
                  <GeneralSearchSelect
                    errors={errors.files}
                    field={field}
                    title="Archivos"
                    placeholder="Seleccione archivos"
                    options={attachments}
                    loading={isLoading}
                    suffixIcon={null}
                    disabled={true}
                  />
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="AccountStatementModalContainer__footer">
          <SecondaryButton onClick={handleClose}>Cancelar</SecondaryButton>
          <PrincipalButton
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Enviar
          </PrincipalButton>
        </div>
      </Flex>
    </Modal>
  );
};

export default AccountStatementModal;
