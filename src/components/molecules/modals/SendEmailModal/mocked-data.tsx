import { EmailOption, ITemplateEmailData, ITemplateName } from "@/types/sendEmail";
import { MenuProps } from "antd";

// Etiquetas del menú en modals.sendEmail.templates.
type TemplateLabelKey = "statement" | "disputes" | "paymentPlan" | "preLegal" | "legal";

interface ICustomButtonProps {
  handleTemplateSelect: (value: ITemplateName) => void;
  // eslint-disable-next-line no-unused-vars
  label: (key: TemplateLabelKey) => string;
}

export const selectTemplateItems = ({
  handleTemplateSelect,
  label
}: ICustomButtonProps): MenuProps["items"] => [
  {
    key: "1",
    label: label("statement"),
    onClick: () => handleTemplateSelect(ITemplateName["Estado de cuenta"])
  },
  {
    key: "2",
    label: label("disputes"),
    onClick: () => handleTemplateSelect(ITemplateName["Envio de novedades"])
  },
  {
    key: "3",
    label: label("paymentPlan"),
    onClick: () => handleTemplateSelect(ITemplateName["Envio de acuerdo de pago"])
  },
  {
    key: "4",
    label: label("preLegal"),
    onClick: () => handleTemplateSelect(ITemplateName["Cobro prejuridico"])
  },
  {
    key: "5",
    label: label("legal"),
    onClick: () => handleTemplateSelect(ITemplateName["Cobro juridico"])
  }
];

export const templates: { [key in ITemplateName]: ITemplateEmailData } = {
  "Estado de cuenta": {
    subject: "Estado de cuenta - Información actualizada",
    body: "Estimado cliente, adjunto encontrará su estado de cuenta actualizado.",
    attachments: [new File([""], "estado_de_cuenta.pdf", { type: "application/pdf" })]
  },
  "Envio de novedades": {
    subject: "Envío de novedades",
    body: "Adjuntamos las novedades correspondiente al periodo actual.",
    attachments: [new File([""], "envio_de_novedades.pdf", { type: "application/pdf" })]
  },
  "Envio de acuerdo de pago": {
    subject: "Acuerdo de pago",
    body: "Por favor, revise el acuerdo de pago adjunto.",
    attachments: [new File([""], "acuerdo_de_pago.pdf", { type: "application/pdf" })]
  },
  "Cobro prejuridico": {
    subject: "Aviso de cobro prejurídico",
    body: "Le notificamos sobre el cobro prejurídico correspondiente.",
    attachments: [new File([""], "cobro_prejuridico.pdf", { type: "application/pdf" })]
  },
  "Cobro juridico": {
    subject: "Aviso de cobro jurídico",
    body: "Se adjunta la notificación oficial de cobro jurídico.",
    attachments: [new File([""], "cobro_juridico.pdf", { type: "application/pdf" })]
  }
};

export const emailSuggestions: EmailOption[] = [
  {
    id: 1,
    email: "usuario1@example.com",
    name: "Maria Camila Osorio",
    companyPosition: "Gerente Financiera"
  },
  {
    id: 11,
    email: "vlcabrera92@gmail.com",
    name: "Victoria cabrera",
    companyPosition: "Dev"
  },
  {
    id: 2,
    email: "miguel.martinez@profitline.com.co",
    name: "Miguel Martinez",
    companyPosition: "Gerente Comercial"
  },
  {
    id: 3,
    email: "mateo.robayo@profitline.com.co",
    name: "Mateo Robayo",
    companyPosition: "Gerente Operaciones"
  }
];
