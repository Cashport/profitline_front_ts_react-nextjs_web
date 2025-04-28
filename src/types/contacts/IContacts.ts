import { ISelectType } from "../clients/IClients";

export interface IContact {
  id: number;
  client_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  name_position: string;
  contact_lastname: string;
  country_name: string;
  country_calling_code: string;
  country_calling_code_id: number;
  contact_position: string;
  contact_position_id: number;
}

export interface IGetContacts {
  status: number;
  data: IContact[];
  message: string;
}

export interface IContactForm {
  name: string;
  lastname: string;
  position: string;
  role: ISelectType;
  indicative: ISelectType;
  phone: string;
  email: string;
}

export interface IResponseContactOptions {
  status: number;
  message: string;
  data: IContactOptions | [];
}

export interface IContactOptions {
  country_calling_code: ICountryCallingCode[];
  contact_position: IContactPosition[];
}

interface ICountryCallingCode {
  id: number;
  country_name: string;
  code: string;
}

interface IContactPosition {
  id: number;
  name: string;
}

export interface ICreateEditContact {
  client_id: string;
  contact_name: string;
  contact_lastname: string;
  contact_email: string;
  contact_phone: string;
  position: number;
  name_position: string;
  country_calling_code_id: number;
}
