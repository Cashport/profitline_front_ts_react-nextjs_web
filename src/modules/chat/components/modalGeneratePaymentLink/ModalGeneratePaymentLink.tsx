import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import dayjs from "dayjs";
import { Flex, message, Modal } from "antd";
import { CaretLeft, PiggyBank, X, Copy, ArrowUpRight } from "@phosphor-icons/react";

import { generatePaymentLink } from "@/services/commerce/commerce";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { formatCurrency } from "@/modules/new_dashboard/components/Formatters";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { InputTimeForm } from "@/components/atoms/inputs/InputTime/InputTimeForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";

import { IGeneratePaymentLinkResponse, IPaymentLinkData } from "@/types/commerce/ICommerce";

import "./modalGeneratePaymentLink.scss";

interface ModalGeneratePaymentLinkProps {
  isOpen: boolean;
  onClose: () => void;
  ticketInfo: { clientId: string; clientName: string; ticketId: string; email: string };
}

interface IFormGenerateLink {
  expirationDate: Date;
  expirationTime: Date;
  amount: number;
  description: string;
}

const schema = yup.object().shape({
  expirationDate: yup
    .date()
    .typeError("Debe ser una fecha válida")
    .required("La fecha de expiración es requerida"),
  expirationTime: yup
    .date()
    .typeError("Debe ser una hora válida")
    .required("La hora de expiración es requerida"),
  amount: yup
    .number()
    .typeError("Debe ser un número válido")
    .moreThan(0, "El monto debe ser mayor a 0")
    .required("El monto es requerido"),
  description: yup.string().required("La descripción es requerida")
});

const ModalGeneratePaymentLink = ({
  isOpen,
  onClose,
  ticketInfo
}: ModalGeneratePaymentLinkProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<IFormGenerateLink>({
    resolver: yupResolver(schema),
    defaultValues: {
      expirationDate: undefined,
      expirationTime: undefined,
      amount: undefined,
      description: ""
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<IGeneratePaymentLinkResponse | null>(null);
  const [formDescription, setFormDescription] = useState("Pago mensualidad enero 2026");
  const [createdAt, setCreatedAt] = useState(dayjs().format("YYYY-MM-DD HH:mm:ss"));

  // Limpiar estados al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: IFormGenerateLink) => {
    setIsSubmitting(true);
    try {
      const modelData: IPaymentLinkData = {
        fecha_vencimiento: dayjs(data.expirationDate).format("YYYY/MM/DD"),
        hora_vencimiento: dayjs(data.expirationTime).format("HH:mm"),
        amount: data.amount,
        descripcion: data.description,
        ticket_id: ticketInfo.ticketId,
        email: ticketInfo.email
      };

      const res = await generatePaymentLink(ticketInfo.clientId, modelData);
      setFormDescription(data.description);
      setCreatedAt(dayjs().format("YYYY-MM-DD HH:mm:ss"));
      setSuccessData(res);
      message.success("Link de pago generado exitosamente");
      reset();
    } catch (error) {
      message.error("Error al generar el link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
    setSuccessData(null);
    setFormDescription("");
    setCreatedAt("");
  };

  const handleCopyLink = async () => {
    if (!successData) return;
    try {
      await navigator.clipboard.writeText(successData.link);
      message.success("Link copiado al portapapeles");
    } catch {
      message.error("Error al copiar el link");
    }
  };

  return (
    <Modal
      className="modalGeneratePaymentLink"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
    >
      {!successData ? (
        <>
          <button className="modalGeneratePaymentLink__header" onClick={handleClose}>
            <CaretLeft size="1.25rem" />
            <h4>Generar link de pago</h4>
          </button>
          <p className="modalGeneratePaymentLink__description">
            Completa la información para generar el link.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="modalGeneratePaymentLink__form">
            <div className="modalGeneratePaymentLink__form--fullWidth">
              <InputForm
                disabled
                nameInput="client"
                defaultValue={ticketInfo.clientName}
                control={control}
                error={undefined}
                titleInput="Cliente"
              />
            </div>
            <InputDateForm
              titleInput="Fecha de vencimiento"
              nameInput="expirationDate"
              control={control}
              error={errors.expirationDate}
              placeholder="MM/DD/AAAA"
            />
            <InputTimeForm
              titleInput="Hora de vencimiento"
              nameInput="expirationTime"
              control={control}
              error={errors.expirationTime}
              placeholder="HH:MM"
            />
            <InputFormMoney
              titleInput="Monto a pagar"
              nameInput="amount"
              control={control}
              error={errors.amount}
              placeholder="Ingresa monto a pagar"
              typeInput="number"
            />

            <div className="modalGeneratePaymentLink__form--fullWidth">
              <InputForm
                titleInput="Descripción"
                nameInput="description"
                control={control}
                error={errors.description}
                placeholder="Ingresa una descripción"
              />
            </div>
          </form>

          <FooterButtons
            handleOk={() => handleSubmit(onSubmit)()}
            onClose={handleClose}
            titleConfirm="Generar link"
            isConfirmLoading={isSubmitting}
            isConfirmDisabled={!isValid}
          />
        </>
      ) : (
        <div className="modalGeneratePaymentLink__success">
          <div className="modalGeneratePaymentLink__success-header">
            <h2>Link Generado Exitosamente</h2>
            <button className="modalGeneratePaymentLink__success-close" onClick={handleClose}>
              <X size={24} weight="bold" />
            </button>
          </div>

          <div className="modalGeneratePaymentLink__success-amount">
            <div className="modalGeneratePaymentLink__success-amount-icon">
              <PiggyBank size={35} />
            </div>
            <div className="modalGeneratePaymentLink__success-amount-info">
              <span className="modalGeneratePaymentLink__success-amount-label">Monto</span>
              <span className="modalGeneratePaymentLink__success-amount-value">
                {formatCurrency(successData.amount)}
              </span>
            </div>
          </div>

          <div className="modalGeneratePaymentLink__success-link">
            <div className="modalGeneratePaymentLink__success-link-input">
              <span>{successData.link}</span>
              <button
                className="modalGeneratePaymentLink__success-link-copy"
                onClick={handleCopyLink}
              >
                <Copy size={20} />
              </button>
            </div>
            <button className="modalGeneratePaymentLink__success-link-send">
              Enviar plantilla
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="modalGeneratePaymentLink__success-divider" />

          <div className="modalGeneratePaymentLink__success-details">
            <h3 className="modalGeneratePaymentLink__success-details-title">
              Detalles de la transacción
            </h3>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">Status</span>
              <div className="modalGeneratePaymentLink__success-details-status">
                {successData.status}
              </div>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">Cliente</span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {successData.client}
              </span>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">
                Fecha creación
              </span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {dayjs(createdAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">
                Fecha expiración
              </span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {dayjs(successData.expiration).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">Descripción</span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {formDescription}
              </span>
            </div>
          </div>

          <PrincipalButton fullWidth onClick={handleClose}>
            Finalizar
          </PrincipalButton>
        </div>
      )}
    </Modal>
  );
};

export default ModalGeneratePaymentLink;
