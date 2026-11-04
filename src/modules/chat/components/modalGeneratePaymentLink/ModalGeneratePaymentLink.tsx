import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import dayjs from "dayjs";
import { message, Modal, Spin } from "antd";
import { useTranslations } from "use-intl";
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

type PaymentLinkT = ReturnType<typeof useTranslations<"chat.paymentLink">>;

const buildSchema = (t: PaymentLinkT) =>
  yup.object().shape({
    expirationDate: yup
      .date()
      .typeError(t("validation.invalidDate"))
      .required(t("validation.expirationDateRequired")),
    expirationTime: yup
      .date()
      .typeError(t("validation.invalidTime"))
      .required(t("validation.expirationTimeRequired")),
    invoices_id: yup
      .array()
      .of(yup.number().required())
      .min(1, t("validation.selectInvoice"))
      .required(t("validation.selectInvoice")),
    amount: yup
      .number()
      .typeError(t("validation.invalidNumber"))
      .moreThan(0, t("validation.amountPositive"))
      .required(t("validation.amountRequired")),
    description: yup.string().required(t("validation.descriptionRequired"))
  });

const ModalGeneratePaymentLink = ({
  isOpen,
  onClose,
  ticketInfo
}: ModalGeneratePaymentLinkProps) => {
  const t = useTranslations("chat.paymentLink");
  const tCommon = useTranslations("common");
  const schema = useMemo(() => buildSchema(t), [t]);
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
      message.success(t("generated"));
      reset();
    } catch (error) {
      message.error(t("generateError"));
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
      message.success(t("copied"));
    } catch {
      message.error(t("copyError"));
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
      message.error(t("templateSendError"));
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
            <h4>{t("title")}</h4>
          </button>
          <p className="modalGeneratePaymentLink__description">{t("subtitle")}</p>
          <form onSubmit={handleSubmit(onSubmit)} className="modalGeneratePaymentLink__form">
            <div className="modalGeneratePaymentLink__form--fullWidth">
              <InputForm
                disabled
                nameInput="client"
                defaultValue={ticketInfo.clientName}
                control={control}
                error={undefined}
                titleInput={tCommon("fields.customer")}
              />
            </div>
            <InputDateForm
              titleInput={tCommon("fields.dueDate")}
              nameInput="expirationDate"
              control={control}
              error={errors.expirationDate}
              placeholder={t("datePlaceholder")}
            />
            <InputTimeForm
              titleInput={t("dueTime")}
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
              titleInput={t("amountToPay")}
              nameInput="amount"
              control={control}
              error={errors.amount}
              placeholder={t("selectInvoicesPlaceholder")}
              typeInput="number"
            />

            <div className="modalGeneratePaymentLink__form--fullWidth">
              <InputForm
                titleInput={tCommon("fields.description")}
                nameInput="description"
                control={control}
                error={errors.description}
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
          </form>

          <FooterButtons
            handleOk={() => handleSubmit(onSubmit)()}
            onClose={handleClose}
            titleConfirm={t("generate")}
            isConfirmLoading={isSubmitting}
            isConfirmDisabled={!isValid}
          />
        </>
      ) : (
        <div className="modalGeneratePaymentLink__success">
          <div className="modalGeneratePaymentLink__success-header">
            <h2>{t("successTitle")}</h2>
            <button className="modalGeneratePaymentLink__success-close" onClick={handleClose}>
              <X size={24} weight="bold" />
            </button>
          </div>

          <div className="modalGeneratePaymentLink__success-amount">
            <div className="modalGeneratePaymentLink__success-amount-icon">
              <PiggyBank size={35} />
            </div>
            <div className="modalGeneratePaymentLink__success-amount-info">
              <span className="modalGeneratePaymentLink__success-amount-label">
                {tCommon("fields.amount")}
              </span>
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
              {t("sendTemplate")}
              {isSendingTemplate ? <Spin size="small" /> : <ArrowUpRight size={16} />}
            </button>
          </div>

          <div className="modalGeneratePaymentLink__success-divider" />

          <div className="modalGeneratePaymentLink__success-details">
            <h3 className="modalGeneratePaymentLink__success-details-title">{t("details")}</h3>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">
                {tCommon("fields.status")}
              </span>
              <div className="modalGeneratePaymentLink__success-details-status">
                {successData.status}
              </div>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">
                {tCommon("fields.customer")}
              </span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {successData.client}
              </span>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">
                {t("createdAt")}
              </span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {dayjs(createdAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">
                {t("expiresAt")}
              </span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {dayjs(successData.expiration).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>

            <div className="modalGeneratePaymentLink__success-details-row">
              <span className="modalGeneratePaymentLink__success-details-label">
                {tCommon("fields.description")}
              </span>
              <span className="modalGeneratePaymentLink__success-details-value">
                {formDescription}
              </span>
            </div>
          </div>

          <div className="modalGeneratePaymentLink__success-footer">
            <PrincipalButton customStyles={{ gridColumn: "2 / 3" }} fullWidth onClick={handleClose}>
              {tCommon("actions.finish")}
            </PrincipalButton>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalGeneratePaymentLink;
