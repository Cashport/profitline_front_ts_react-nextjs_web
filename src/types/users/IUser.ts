export interface IUserAxios {
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
}

export interface Request {}

export interface ConfigHeaders {
  Accept: string;
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
  data: IUserData;
}

// export interface IUserData {

//   BUSSINESS_RULES: IBusinessRules[];
// }

export interface IUserData {
  ACTIVE: number;
  EMAIL: string;
  ID: number;
  IS_DELETED: number;
  NOTIFICATION_CONFIG: any | null;
  PHONE: string;
  PHOTO: string;
  POSITION: string;
  PROJECT_DESCRIPTION: string;
  PROJECT_ID: number;
  ROL_ID: number;
  ROL_NAME: string;
  USER_CHANNELS: ID[];
  USER_LINES: ID[];
  USER_NAME: string;
  USER_PERMISSIONS: UserPermision[];
  USER_SUBLINES: ID[];
  USER_ZONES: UserZone[];
  UUID: string;
  is_super_admin: number;
}
export interface ID {
  ID: number;
}

export interface UserPermision {
  PERMISSIONS: Permissions;
  COMPONENT_ID: number;
}

export interface Permissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface UserZone {
  ZONE_ID: number;
  ZONE_DESCRIPTION: string;
}

export interface ISubLines {
  SUBLINE_DESCRIPTION: string;
  SUBLINE_ID: number;
}
interface ILine {
  DESCRIPTION_LINE: string;
  LINE_ID: number;
  SUBLINES: ISubLines[];
}
export interface IBusinessRules {
  CHANNEL_DESCRIPTION: string;
  CHANNEL_ID: number;
  LINES: ILine[];
}

export interface WelcomeHeaders {
  "content-type": string;
}

export interface IUserForm {
  info: IUserInfo;
}

interface IUserInfo {
  name: string;
  cargo: string;
  email: string;
  phone: string;
  rol: ISelectType | undefined;
}

interface ISelectType {
  value: number;
  label: string;
}
