export interface IFormProject {
  general: General;
  contact: Contact;
  logo: any;
  personalization: Personalization;
}

export interface Contact {
  name: string;
  position_contact: string;
  email: string;
  phone: string;
}

export interface General {
  name: string;
  nit: string;
  currencies: ISelectType[];
  country: ISelectType;
  address: string;
  billing_period: any;
  accept_date: string;
  DSO_currenly_year: string;
  DSO_days: number | undefined;
  otp_required: string;
  otp_revalidation_days: number | undefined;
  password_expiration_days: number | undefined;
}

export interface Personalization {
  color: string | any;
  description: string;
}

interface ISelectType {
  value: number;
  label: string;
}
