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

import { IInvoice } from "@/types/invoices/IInvoices";

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

  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IFormRegisterNews>({});

  const onSubmit = async (data: IFormRegisterNews) => {
    setIsSubmitting(true);
    try {
      await reportInvoiceIncident(
        invoiceSelected?.map((invoice) => invoice.id) || [],
        commentary || "",
        motives?.find((motive) => motive.name === data.motive)?.id.toString() || "",
        selectedEvidence,
        clientId?.toString() || "",
        projectId.toString(),
        data.amount
      );
      messageShow.success("Evidencia adjuntada con éxito");
      reset();
      setSelectedEvidence([]);
      setCommentary(undefined);
      onCloseAllModals();
    } catch (error) {
      console.error("Error al registrar una novedad:", error);
      messageShow.error("Error al adjuntar la evidencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEvidence([]);
    setCommentary(undefined);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedEvidence([]);
      setCommentary(undefined);
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
            acceptButtonText: isSubmitting ? "Enviando..." : "Adjuntar evidencia"
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
    </Modal>
  );
};

export default RegisterNews;
