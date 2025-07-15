import React, { useEffect, useState } from "react";
import { Flex, Modal } from "antd";
import { CaretLeft } from "@phosphor-icons/react";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { IInvoice } from "@/types/invoices/IInvoices";
import { MessageInstance } from "antd/es/message/interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./radicationInvoice.scss";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { radicateInvoice } from "@/services/accountingAdjustment/accountingAdjustment";
import ModalAttachEvidence from "../ModalEvidence/ModalAttachEvidence";

interface RadicationInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  projectId?: number;
  invoiceSelected?: IInvoice[];
  messageShow: MessageInstance;
}

interface IFormRadicationInvoice {
  radication_date: Date;
}

const schema = yup.object().shape({
  radication_date: yup
    .date()
    .typeError("Debe ser una fecha válida")
    .required("La fecha de radicación es requerida")
});

const RadicationInvoice = ({
  isOpen,
  onClose,
  clientId,
  invoiceSelected,
  messageShow
}: RadicationInvoiceProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IFormRadicationInvoice>({
    resolver: yupResolver(schema),
    defaultValues: {
      radication_date: undefined
    }
  });

  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const [commentary, setCommentary] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar estados al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedEvidence([]);
      setCommentary("");
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: IFormRadicationInvoice) => {
    setIsSubmitting(true);
    try {
      const radicationData = {
        invoices_id: invoiceSelected?.map((invoice) => invoice.id) as number[],
        radication_type: "1", // O el valor que corresponda
        accept_date: data.radication_date ? data.radication_date.toISOString().split("T")[0] : "",
        comments: commentary
      };

      await radicateInvoice(radicationData, selectedEvidence, clientId);
      messageShow.success("Factura radicada con éxito");
      reset();
      setSelectedEvidence([]);
      setCommentary("");
      onClose();
    } catch (error) {
      console.error("Error al radicar la factura:", error);
      messageShow.error("Error al radicar la factura");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEvidence([]);
    setCommentary("");
    onClose();
  };

  return (
    <Modal className="contentRegisterNews" width="50%" footer={null} open={isOpen} closable={false}>
      <button className="contentRegisterNews__header" onClick={handleClose}>
        <CaretLeft size="1.25rem" />
        <h4>Radicación</h4>
      </button>
      <p className="contentRegisterNews__description">
        Adjunta la evidencia e ingresa un comentario
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="contentRegisterNews__form">
        <div className="contentRegisterNews__select">
          <Flex vertical>
            <InputForm
              disabled
              placeholder="EMAIL"
              nameInput={""}
              control={control}
              error={undefined}
              titleInput="Tipo de radicación"
            />
          </Flex>
          <InputDateForm
            titleInput="Fecha de radicación"
            nameInput="radication_date"
            control={control}
            error={errors.radication_date}
          />
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
            title: "Radicación",
            description: "Adjunta la evidencia e ingresa un comentario",
            cancelButtonText: "Cancelar",
            acceptButtonText: isSubmitting ? "Enviando..." : "Guardar"
          }}
          noTitle
          noDescription
          multipleFiles
          loading={isSubmitting}
          confirmDisabled={!selectedEvidence.length || !isValid || isSubmitting}
          isMandatory={{ evidence: true, commentary: false }}
          noModal
        />
      </form>
    </Modal>
  );
};

export default RadicationInvoice;
