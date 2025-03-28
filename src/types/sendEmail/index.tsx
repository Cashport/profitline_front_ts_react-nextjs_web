export enum ITemplateName {
  "Estado de cuenta" = "Estado de cuenta",
  "Envio de novedades" = "Envio de novedades",
  "Envio de acuerdo de pago" = "Envio de acuerdo de pago",
  "Cobro prejuridico" = "Cobro prejuridico",
  "Cobro juridico" = "Cobro juridico"
}

export interface EmailOption {
  id: number;
  email: string;
  name: string;
  companyPosition: string;
}

export interface ISelect {
  value: string;
  label: string;
}
export interface ICompleteEmail {
  forward_to: ISelect[];
  copy_to?: ISelect[];
  subject: string;
  comment: string;
  attachments: File[];
}
export interface EmailData {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachments: File[];
}

export interface ITemplateEmailData {
  subject: string;
  body: string;
  attachments: File[];
}

