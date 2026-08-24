export interface ICreateProject {
  data: WelcomeData;
  status: number;
  statusText: string;
  headers: WelcomeHeaders;
  config: Config;
  request: Request;
}

export interface Config {
  transitional: Transitional;
  adapter: string[];
  transformRequest: null[];
  transformResponse: null[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  env: Request;
  headers: ConfigHeaders;
  method: string;
  url: string;
  data: string;
}

export interface Request {}

export interface ConfigHeaders {
  Accept: string;
  "Content-Type": string;
  Authorization: string;
}

export interface Transitional {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
  clarifyTimeoutError: boolean;
}

export interface WelcomeData {
  status: number;
  message: string;
  data: DataData;
}

export interface DataData {
  project_description: string;
  rgb_config: string;
  logo: string;
  nit: string;
  email: string;
  contact: string;
  phone: string;
  address: string;
  country_id: string;
  currency: Currency[];
  user: User;
  uuid: string;
  id: number;
}

export interface Currency {
  id: string;
  currency_name: string;
}

export interface User {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: Firebase;
  uid: string;
}

export interface Firebase {
  identities: Identities;
  sign_in_provider: string;
}

export interface Identities {
  email: string[];
}

export interface WelcomeHeaders {
  "content-type": string;
}

export interface IProjectForFormData {
  project_description: string;
  rgb_config: string;
  logo: string;
  nit: string;
  email: string;
  contact: string;
  phone: string;
  address: string;
  country_id: number;
  currency: string;

  accept_date: boolean;
  dso_days?: number;
  dso_currenly_year?: boolean;
  name: string;
  position_contact: string;
  day_flag: boolean;
  day?: number;
  order?: string;
  day_of_week?: string;
  otp_required?: boolean;
  otp_revalidation_days?: number;
  password_expiration_days?: number;
}

export interface IUpdateProjectData extends IProjectForFormData {
  uuid?: string;
  id: string;
  is_active: boolean;
}
