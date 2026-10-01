import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import dayjs from "dayjs";
import { message, Modal, Spin } from "antd";
import { CaretLeft, PiggyBank, X, Copy, ArrowUpRight } from "@phosphor-icons/react";

import { generatePaymentLink } from "@/services/commerce/commerce";
import { sendWhatsAppTemplate } from "@/services/chat/chat";
import { getApplicationInvoices } from "@/services/applyTabClients/applyTabClients";
import { useAppStore } from "@/lib/store/store";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { formatCurrency } from "@/modules/new_dashboard/components/Formatters";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { InputTimeForm } from "@/components/atoms/inputs/InputTime/InputTimeForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";
import SelectInvoices from "./SelectInvoices/SelectInvoices";

import { IGeneratePaymentLinkResponse, IPaymentLinkData } from "@/types/commerce/ICommerce";
import { IApplicationInvoice } from "@/types/invoices/IInvoices";

import "./modalGeneratePaymentLink.scss";

interface ModalGeneratePaymentLinkProps {
  isOpen: boolean;
  onClose: () => void;
  ticketInfo: {
    clientId: string;
    clientName: string;
    ticketId: string;
    email: string;
    phone: string;
  };
}

interface IFormGenerateLink {
  expirationDate: Date;
  expirationTime: Date;
  invoices_id: number[];
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
  invoices_id: yup
    .array()
    .of(yup.number().required())
    .min(1, "Selecciona al menos una factura")
    .required("Selecciona al menos una factura"),
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
    reset,
    setValue
  } = useForm<IFormGenerateLink>({
    resolver: yupResolver(schema),
    defaultValues: {
      expirationDate: undefined,
      expirationTime: undefined,
      invoices_id: [],
      amount: undefined,
      description: ""
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<IGeneratePaymentLinkResponse | null>(null);
  const [formDescription, setFormDescription] = useState("Pago mensualidad enero 2026");
  const [createdAt, setCreatedAt] = useState(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  const [isSendingTemplate, setIsSendingTemplate] = useState(false);
  const [invoices, setInvoices] = useState<IApplicationInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  // Limpiar estados al cerrar modal / fijar vencimiento por defecto (hoy 23:59) al abrir
  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }
    setValue("expirationDate", dayjs() as unknown as Date);
    setValue("expirationTime", dayjs().hour(23).minute(59).second(0) as unknown as Date);
  }, [isOpen, reset, setValue]);

  // Cargar facturas del cliente al abrir el modal
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!isOpen || !ticketInfo.clientId || !projectId) return;
      setLoadingInvoices(true);
      try {
        const res = await getApplicationInvoices(projectId, ticketInfo.clientId);
        setInvoices(res || []);
      } catch (error) {
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchInvoices();
  }, [isOpen, ticketInfo.clientId, projectId]);

  const onSubmit = async (data: IFormGenerateLink) => {
    setIsSubmitting(true);
    try {
      const modelData: IPaymentLinkData = {
        fecha_vencimiento: dayjs(data.expirationDate).format("YYYY/MM/DD"),
        hora_vencimiento: dayjs(data.expirationTime).format("HH:mm"),
        amount: data.amount,
        descripcion: data.description,
        ticket_id: ticketInfo.ticketId,
        email: ticketInfo.email,
        invoice_ids: data.invoices_id
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

  const handleSendTemplate = async () => {
    setIsSendingTemplate(true);
    if (!successData) return;
    const payload = {
      phoneNumber: ticketInfo.phone || "",
      templateId: "link_de_pago",
      ticketId: ticketInfo.ticketId,
      senderId: "cmhv6mnla0003no0huiao1u63",
      name: ticketInfo.clientName,
      customerCashportUUID: ticketInfo.clientId || "",
      templateData: {
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: successData.client },
              { type: "text", text: `${successData.amount}` }
            ]
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [{ type: "text", text: successData.link.split("/").pop() || "" }]
          }
        ]
      }
    };
    try {
      await sendWhatsAppTemplate(payload);
    } catch (error) {
      message.error("Error al enviar la plantilla por WhatsApp");
    } finally {
      setIsSendingTemplate(false);
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
              format="HH:mm"
              minuteStep={15}
            />
            <div>
              <Controller
                name="invoices_id"
                control={control}
                render={({ field }) => (
                  <SelectInvoices
                    invoices={invoices}
                    loading={loadingInvoices}
                    value={field.value || []}
                    onChange={(ids) => {
                      field.onChange(ids);
                      const total = invoices
                        .filter((invoice) => ids.includes(invoice.id))
                        .reduce((sum, invoice) => sum + invoice.current_value, 0);
                      setValue("amount", total, { shouldValidate: true });
                    }}
                    error={!!errors.invoices_id}
                  />
                )}
              />
              {errors.invoices_id && <p className="error">{errors.invoices_id.message}</p>}
            </div>
            <InputFormMoney
              readOnly
              titleInput="Monto a pagar"
              nameInput="amount"
              control={control}
              error={errors.amount}
              placeholder="Selecciona facturas"
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
            <button
              className="modalGeneratePaymentLink__success-link-send"
              onClick={handleSendTemplate}
              disabled={isSendingTemplate}
            >
              Enviar plantilla
              {isSendingTemplate ? <Spin size="small" /> : <ArrowUpRight size={16} />}
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

          <div className="modalGeneratePaymentLink__success-footer">
            <PrincipalButton customStyles={{ gridColumn: "2 / 3" }} fullWidth onClick={handleClose}>
              Finalizar
            </PrincipalButton>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalGeneratePaymentLink;
