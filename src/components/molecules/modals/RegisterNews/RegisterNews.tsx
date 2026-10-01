import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { CaretLeft } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { reportInvoiceIncident } from "@/services/accountingAdjustment/accountingAdjustment";

import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";
import ModalAttachEvidence from "../ModalEvidence/ModalAttachEvidence";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IInvoice } from "@/types/invoices/IInvoices";
import { ApiError } from "@/utils/api/api";

import "./registerNews.scss";
interface RegisterNewsProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  projectId?: number;
  invoiceSelected?: IInvoice[];
  messageShow: MessageInstance;
  onCloseAllModals: () => void;
}

interface IFormRegisterNews {
  motive: string;
  commentary: string;
  evidence: File[];
  amount?: string;
}

const RegisterNews = ({
  isOpen,
  onClose,
  clientId,
  invoiceSelected,
  messageShow,
  onCloseAllModals
}: RegisterNewsProps) => {
  const { data: motives, isLoading, isError } = useInvoiceIncidentMotives();
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncidentConfirmation, setShowIncidentConfirmation] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<IFormRegisterNews | null>(null);

  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IFormRegisterNews>({});

  const handleActiveIncidentsResponse = (error: unknown) => {
    if (
      error instanceof ApiError &&
      error.status === 500 &&
      Array.isArray(error.data?.activeIncidentDocuments) &&
      error.data.activeIncidentDocuments.length > 0
    ) {
      return true;
    }
    return false;
  };

  const submitIncident = async (data: IFormRegisterNews, createNew = false) => {
    setIsSubmitting(true);
    try {
      await reportInvoiceIncident(
        invoiceSelected?.map((invoice) => invoice.id) || [],
        commentary || "",
        motives?.find((motive) => motive.name === data.motive)?.id.toString() || "",
        selectedEvidence,
        clientId?.toString() || "",
        projectId.toString(),
        data.amount,
        createNew
      );
      messageShow.success("Evidencia adjuntada con éxito");
      reset();
      setSelectedEvidence([]);
      setCommentary(undefined);
      setLastSubmittedData(null);
      setShowIncidentConfirmation(false);
      onCloseAllModals();
    } catch (error) {
      console.error("Error al registrar una novedad:", error);
      // Only show the confirmation modal on the FIRST attempt.
      // On resubmit, any error should just close the modal and show a toast.
      if (!createNew && handleActiveIncidentsResponse(error)) {
        setLastSubmittedData(data);
        setShowIncidentConfirmation(true);
      } else {
        messageShow.error("Error al adjuntar la evidencia");
        setShowIncidentConfirmation(false);
        setLastSubmittedData(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: IFormRegisterNews) => submitIncident(data);

  const handleCreateNewIncident = () => {
    if (!lastSubmittedData) return false;
    // Use the captured data and resubmit with create_new=true
    submitIncident(lastSubmittedData, true);
    // Returning false prevents Ant Design's Modal from auto-closing on OK click.
    // We control the close explicitly via the state changes above so there's
    // no race condition with the parent's onCloseAllModals side effects.
    return false;
  };

  const handleCloseIncidentConfirmation = () => {
    setShowIncidentConfirmation(false);
    setLastSubmittedData(null);
  };

  const handleClose = () => {
    reset();
    setSelectedEvidence([]);
    setCommentary(undefined);
    setLastSubmittedData(null);
    setShowIncidentConfirmation(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedEvidence([]);
      setCommentary(undefined);
      setLastSubmittedData(null);
      setShowIncidentConfirmation(false);
      reset();
    }
  }, [isOpen]);

  return (
    <Modal className="contentRegisterNews" width="50%" footer={null} open={isOpen} closable={false}>
      <button className="contentRegisterNews__header" onClick={handleClose}>
        <CaretLeft size="1.25rem" />
        <h4>Registrar novedad</h4>
      </button>
      <p className="contentRegisterNews__description">
        Adjunta la evidencia e ingresa un comentario
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="contentRegisterNews__form">
        <div className="contentRegisterNews__select">
          <InputSelect
            titleInput="Motivo"
            nameInput="motive"
            control={control}
            error={errors.motive}
            options={motives?.map((motive) => ({ value: motive?.name, label: motive?.name })) || []}
            loading={isLoading}
            isError={isError}
            placeholder="Seleccionar motivo"
            popupMatchSelectWidth={false}
          />
          <InputFormMoney
            titleInput="Monto novedad"
            nameInput="amount"
            control={control}
            error={errors.amount}
            placeholder="Ingresar monto"
            typeInput="number"
            customStyle={{ width: "100%" }}
            validationRules={{ required: false }}
          />
          <div />
        </div>
        <ModalAttachEvidence
          selectedEvidence={selectedEvidence}
          setSelectedEvidence={setSelectedEvidence}
          handleAttachEvidence={handleSubmit(onSubmit)}
          commentary={commentary}
          setCommentary={setCommentary}
          isOpen={true}
          handleCancel={handleClose}
          customTexts={{
            title: "Registrar novedad",
            description: "Adjunta la evidencia e ingresa un comentario",
            cancelButtonText: "Cancelar",
            acceptButtonText: isSubmitting ? "Enviando..." : "Guardar"
          }}
          noTitle
          noDescription
          multipleFiles
          loading={isSubmitting}
          confirmDisabled={!commentary || !isValid}
          isMandatory={{ evidence: false, commentary: true }}
          noModal
        />
      </form>
      <ModalConfirmAction
        isOpen={showIncidentConfirmation}
        onClose={handleCloseIncidentConfirmation}
        onOk={handleCreateNewIncident}
        title="La facturas ya tienen novedades abiertas ¿Qué desea hacer con las novedades?"
        okText="Crear novedad nueva"
        cancelText="No crear nueva novedad"
        okLoading={isSubmitting}
      />
    </Modal>
  );
};

export default RegisterNews;
