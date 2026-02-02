import React, { useEffect, useState } from "react";
import { Flex, message, Modal } from "antd";
import { CaretLeft } from "@phosphor-icons/react";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { InputTimeForm } from "@/components/atoms/inputs/InputTime/InputTimeForm";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import "./modalGeneratePaymentLink.scss";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { generatePaymentLink } from "@/services/commerce/commerce";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";
import { IPaymentLinkData } from "@/types/commerce/ICommerce";

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

      console.log("Generating link with data:", modelData);
      await generatePaymentLink(ticketInfo.clientId, modelData);
      reset();
      onClose();
    } catch (error) {
      message.error("Error al generar el link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      className="modalGeneratePaymentLink"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
    >
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
    </Modal>
  );
};

export default ModalGeneratePaymentLink;
