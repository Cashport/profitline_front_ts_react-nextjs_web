import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Flex, Modal, Typography, message } from "antd";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import GeneralSearchSelect from "@/components/ui/general-search-select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/modules/chat/ui/tabs";

import "./accountStatementModal.scss";
import { useAppStore } from "@/lib/store/store";
import { getDigitalRecordFormInfo } from "@/services/accountingAdjustment/accountingAdjustment";

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
  const [recipients, setRecipients] = useState<{ value: string; label: string }[]>([]);
  const [attachments, setAttachments] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid }
  } = useForm<IAccountStatementForm>({
    mode: "onChange",
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
        console.log("Digital Record Form Info:", response);
        setRecipients(response.usuarios);
        setAttachments(
          response.attachments.map((att) => ({
            value: att.id.toString(),
            label: att.name
          }))
        );
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
  }, [activeTab, setValue]);

  const onSubmit = async (data: IAccountStatementForm) => {
    setIsSubmitting(true);
    try {
      console.log("Account Statement Form Data:", {
        method: data.method,
        recipients: data.recipients,
        files: data.files,
        clientId,
        projectId
      });

      message.success("Estado de cuenta procesado correctamente");
      setShowModal(false);
    } catch (error) {
      console.error("Error processing account statement:", error);
      message.error("Error al procesar el estado de cuenta");
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
                rules={{ required: true }}
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
                rules={{ required: true }}
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
                rules={{ required: true }}
                render={({ field }) => (
                  <GeneralSearchSelect
                    errors={errors.files}
                    field={field}
                    title="Archivos"
                    placeholder="Seleccione archivos"
                    options={attachments}
                    loading={isLoading}
                    suffixIcon={null}
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
